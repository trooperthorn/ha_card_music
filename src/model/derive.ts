/**
 * Pure derivation: (hass, config, pending) to GraphModel.
 *
 * Home Assistant cannot see the optical wiring between the Chromecast and
 * the receivers, so "this zone is in the signal path" is derived, never
 * read: a zone is in the path when it is powered on AND its source matches
 * the configured Chromecast feed name for that device. A source of
 * undefined, null, or the literal "Unknown" (yamaha_ynca's unmapped value)
 * never matches.
 */

import type {
  GraphLink,
  GraphModel,
  GraphNode,
  HassEntity,
  HomeAssistant,
  MasterConfig,
  MusicFlowConfig,
  OutputRow,
  ZoneConfig,
} from "../types";
import { FEATURE_VOLUME_MUTE, FEATURE_VOLUME_SET } from "../types";
import type { PendingStore } from "./optimistic";

const INACTIVE_STATES = new Set(["off", "standby", "unavailable", "unknown"]);
const UNAVAILABLE_STATES = new Set(["unavailable", "unknown"]);

export function nodeId(kind: string, entity: string): string {
  return `${kind}:${entity}`;
}

export function outputId(entity: string): string {
  return `out:${entity}`;
}

function isPoweredOn(entity: HassEntity | undefined): boolean {
  return entity !== undefined && !INACTIVE_STATES.has(entity.state);
}

function isAvailable(entity: HassEntity | undefined): boolean {
  return entity !== undefined && !UNAVAILABLE_STATES.has(entity.state);
}

/**
 * The source name that counts as the Chromecast feed for this zone or
 * master: the explicit per-entry feed_source, else the first feed alias
 * present in the device's source_list, else the first alias (so a device
 * whose source_list is unavailable while off can still be activated).
 */
export function resolveFeedName(
  entry: ZoneConfig | MasterConfig,
  config: MusicFlowConfig,
  entity: HassEntity | undefined,
): string | undefined {
  if (entry.feed_source) {
    return entry.feed_source;
  }
  const aliases = config.feed_aliases ?? [];
  const sourceList = entity?.attributes.source_list;
  if (Array.isArray(sourceList)) {
    const match = aliases.find((a) => sourceList.includes(a));
    if (match) {
      return match;
    }
  }
  return aliases[0];
}

/** True when the entity's current source is the Chromecast feed. */
function sourceMatchesFeed(
  entry: ZoneConfig | MasterConfig,
  config: MusicFlowConfig,
  entity: HassEntity | undefined,
): boolean {
  const source = entity?.attributes.source;
  if (typeof source !== "string" || source === "" || source === "Unknown") {
    return false;
  }
  if (entry.feed_source) {
    return source === entry.feed_source;
  }
  return (config.feed_aliases ?? []).includes(source);
}

function friendlyName(
  configured: string | undefined,
  entity: HassEntity | undefined,
  fallback: string,
): string {
  return configured ?? entity?.attributes.friendly_name ?? fallback;
}

function baseNode(
  kind: GraphNode["kind"],
  entityId: string,
  entity: HassEntity | undefined,
  name: string,
  icon: string,
): GraphNode {
  return {
    id: nodeId(kind, entityId),
    kind,
    entity: entityId,
    name,
    icon,
    subtitle: "",
    found: entity !== undefined,
    available: isAvailable(entity),
    inPath: false,
    partial: false,
    offPath: false,
    pending: false,
    muted: entity?.attributes.is_volume_muted === true,
  };
}

function volumePercent(entity: HassEntity | undefined): number | undefined {
  const level = entity?.attributes.volume_level;
  return typeof level === "number" ? Math.round(level * 100) : undefined;
}

function deriveInput(
  hass: HomeAssistant,
  config: MusicFlowConfig,
): GraphNode {
  const entity = hass.states[config.input.entity];
  const node = baseNode(
    "input",
    config.input.entity,
    entity,
    friendlyName(config.input.name, entity, "Music Assistant"),
    config.input.icon ?? "mdi:music-box-multiple",
  );
  if (!node.found) {
    node.subtitle = "Entity not found";
  } else if (!node.available) {
    node.subtitle = "Unavailable";
  } else if (entity && entity.state === "playing") {
    const title = entity.attributes.media_title;
    const artist = entity.attributes.media_artist;
    node.subtitle =
      typeof title === "string"
        ? artist
          ? `${title} · ${artist}`
          : title
        : "Playing";
    node.inPath = true;
    node.artwork =
      typeof entity.attributes.entity_picture === "string"
        ? entity.attributes.entity_picture
        : undefined;
  } else if (entity && entity.state === "paused") {
    node.subtitle = "Paused";
    node.inPath = true;
  } else {
    node.subtitle = "Nothing playing · tap to browse";
  }
  return node;
}

function deriveChannel(
  hass: HomeAssistant,
  config: MusicFlowConfig,
): GraphNode {
  const entity = hass.states[config.channel.entity];
  const node = baseNode(
    "channel",
    config.channel.entity,
    entity,
    friendlyName(config.channel.name, entity, "Chromecast"),
    config.channel.icon ?? "mdi:cast-audio",
  );
  if (!node.found) {
    node.subtitle = "Entity not found";
  } else if (!node.available) {
    node.subtitle = "Unavailable";
  } else if (entity && (entity.state === "playing" || entity.state === "paused")) {
    node.inPath = true;
    const pct = volumePercent(entity);
    const app = entity.attributes.app_name;
    const parts = [];
    if (typeof app === "string" && app.length > 0) {
      parts.push(app);
    }
    if (pct !== undefined) {
      parts.push(`Vol ${pct}%`);
    }
    node.subtitle = parts.join(" · ") || "Streaming";
  } else {
    node.subtitle = "No signal";
  }
  return node;
}

function deriveZone(
  hass: HomeAssistant,
  config: MusicFlowConfig,
  pending: PendingStore,
  zone: ZoneConfig,
): GraphNode {
  const effective = pending.overlay(zone.entity, hass.states[zone.entity]);
  const node = baseNode(
    "zone",
    zone.entity,
    effective,
    friendlyName(zone.name, effective, zone.entity),
    zone.icon ?? "mdi:speaker",
  );
  node.pending = pending.has(zone.entity);
  const on = isPoweredOn(effective);
  const onFeed = sourceMatchesFeed(zone, config, effective);
  node.inPath = on && onFeed;
  node.offPath = on && !onFeed;
  if (!node.found) {
    node.subtitle = "Entity not found";
  } else if (!node.available) {
    node.subtitle = "Unavailable";
  } else if (node.inPath) {
    const pct = volumePercent(effective);
    node.subtitle = pct !== undefined ? `Vol ${pct}%` : "On";
  } else if (node.offPath) {
    const source = effective?.attributes.source;
    node.subtitle =
      typeof source === "string" && source !== ""
        ? `Source: ${source}`
        : "Source: unknown";
  } else {
    node.subtitle = "Off";
  }
  return node;
}

function deriveGroup(
  hass: HomeAssistant,
  config: MusicFlowConfig,
  pending: PendingStore,
  group: { entity: string; name?: string; icon?: string },
  zoneNodes: Map<string, GraphNode>,
): GraphNode {
  const entity = hass.states[group.entity];
  const node = baseNode(
    "group",
    group.entity,
    entity,
    friendlyName(group.name, entity, group.entity),
    group.icon ?? "mdi:speaker-multiple",
  );
  node.pending = pending.has(group.entity);
  const members = Array.isArray(entity?.attributes.entity_id)
    ? entity.attributes.entity_id
    : [];
  // Group state is judged by the members that are also configured zones,
  // because only those have a known feed source. Members outside the card's
  // zone list are ignored (and documented as such in the README).
  const memberZones = members
    .map((m) => zoneNodes.get(m))
    .filter((n): n is GraphNode => n !== undefined);
  const active = memberZones.filter((n) => n.inPath).length;
  node.memberTotal = memberZones.length;
  node.memberActive = active;
  node.members = memberZones.map((n) => n.id);
  node.inPath = memberZones.length > 0 && active === memberZones.length;
  node.partial = active > 0 && active < memberZones.length;
  if (!node.found) {
    node.subtitle = "Entity not found";
  } else if (memberZones.length === 0) {
    node.subtitle = "No configured member zones";
  } else if (node.inPath) {
    node.subtitle = `All ${memberZones.length} zones on`;
  } else if (node.partial) {
    node.subtitle = `${active} of ${memberZones.length} zones on`;
  } else {
    node.subtitle = "Off";
  }
  return node;
}

function deriveMaster(
  hass: HomeAssistant,
  config: MusicFlowConfig,
  pending: PendingStore,
  master: MasterConfig,
): GraphNode {
  const effective = pending.overlay(master.entity, hass.states[master.entity]);
  const node = baseNode(
    "master",
    master.entity,
    effective,
    friendlyName(master.name, effective, master.entity),
    master.icon ?? "mdi:speaker-multiple",
  );
  node.pending = pending.has(master.entity);
  const on = isPoweredOn(effective);
  const onFeed = sourceMatchesFeed(master, config, effective);
  node.inPath = on && onFeed;
  node.offPath = on && !onFeed;
  if (!node.found) {
    node.subtitle = "Entity not found";
  } else if (!node.available) {
    node.subtitle = "Unavailable";
  } else if (node.inPath) {
    node.subtitle = "Takeover active · all unit zones";
  } else if (node.offPath) {
    const source = effective?.attributes.source;
    node.subtitle =
      typeof source === "string" && source !== ""
        ? `Source: ${source}`
        : "Source: unknown";
  } else {
    node.subtitle = "Takeover · enables whole unit";
  }
  return node;
}

function deriveOutput(
  hass: HomeAssistant,
  pending: PendingStore,
  zone: ZoneConfig,
  zoneNode: GraphNode,
): OutputRow {
  const effective = pending.overlay(zone.entity, hass.states[zone.entity]);
  const level =
    typeof effective?.attributes.volume_level === "number"
      ? effective.attributes.volume_level
      : 0;
  const features =
    typeof effective?.attributes.supported_features === "number"
      ? effective.attributes.supported_features
      : 0;
  const display = zone.volume?.display ?? "percent";
  let readout = "";
  if (display === "raw" && zone.volume?.max) {
    readout = `${Math.round(level * zone.volume.max)}/${zone.volume.max}`;
  } else if (display === "db") {
    const dbEntity = zone.volume?.entity
      ? hass.states[zone.volume.entity]
      : undefined;
    if (dbEntity && !UNAVAILABLE_STATES.has(dbEntity.state)) {
      const unit = dbEntity.attributes.unit_of_measurement ?? "dB";
      readout = `${dbEntity.state} ${unit}`;
    }
  }
  return {
    id: outputId(zone.entity),
    zoneId: zoneNode.id,
    entity: zone.entity,
    name: zoneNode.name,
    icon: zoneNode.icon,
    volumeLevel: level,
    readout,
    muted: effective?.attributes.is_volume_muted === true,
    pending: pending.has(zone.entity),
    hasVolume: (features & FEATURE_VOLUME_SET) !== 0,
    hasMute: (features & FEATURE_VOLUME_MUTE) !== 0,
  };
}

export function deriveModel(
  hass: HomeAssistant,
  config: MusicFlowConfig,
  pending: PendingStore,
): GraphModel {
  const input = deriveInput(hass, config);
  const channel = deriveChannel(hass, config);

  const zoneNodes = new Map<string, GraphNode>();
  const zoneConfigs = new Map<string, ZoneConfig>();
  for (const zone of config.zones) {
    zoneNodes.set(zone.entity, deriveZone(hass, config, pending, zone));
    zoneConfigs.set(zone.entity, zone);
  }

  const mixes: GraphNode[] = [...zoneNodes.values()];
  for (const group of config.groups ?? []) {
    mixes.push(deriveGroup(hass, config, pending, group, zoneNodes));
  }
  for (const master of config.masters ?? []) {
    mixes.push(deriveMaster(hass, config, pending, master));
  }

  const outputs: OutputRow[] = [];
  for (const [entity, node] of zoneNodes) {
    if (node.inPath) {
      const zc = zoneConfigs.get(entity);
      if (zc) {
        outputs.push(deriveOutput(hass, pending, zc, node));
      }
    }
  }

  const links: GraphLink[] = [];
  const streaming = input.inPath && channel.inPath;
  links.push({
    fromId: input.id,
    toId: channel.id,
    kind: "input",
    active: streaming,
    muted: false,
  });
  for (const mix of mixes) {
    links.push({
      fromId: channel.id,
      toId: mix.id,
      kind: "channel",
      active: (mix.inPath || mix.partial) && channel.inPath,
      muted: mix.kind === "zone" && mix.inPath && mix.muted,
    });
  }
  for (const out of outputs) {
    links.push({
      fromId: out.zoneId,
      toId: out.id,
      kind: "output",
      active: true,
      muted: out.muted,
    });
  }

  return { input, channel, mixes, outputs, links };
}

/**
 * Click-to-trace closure: the set of node/output/link-endpoint ids that stay
 * bright when `selectedId` is selected. Links stay bright when both of their
 * endpoints are in the set.
 */
export function selectionClosure(
  model: GraphModel,
  selectedId: string | null,
): Set<string> | null {
  if (selectedId === null) {
    return null;
  }
  const keep = new Set<string>();
  const upstream = [model.input.id, model.channel.id];

  const zoneWithOutput = (zoneNodeId: string): void => {
    keep.add(zoneNodeId);
    for (const out of model.outputs) {
      if (out.zoneId === zoneNodeId) {
        keep.add(out.id);
      }
    }
  };

  if (selectedId === model.input.id || selectedId === model.channel.id) {
    // Everything currently carrying audio downstream.
    upstream.forEach((id) => keep.add(id));
    for (const mix of model.mixes) {
      if (mix.inPath || mix.partial) {
        zoneWithOutput(mix.id);
      }
    }
    return keep;
  }

  const output = model.outputs.find((o) => o.id === selectedId);
  if (output) {
    upstream.forEach((id) => keep.add(id));
    keep.add(output.zoneId);
    keep.add(output.id);
    return keep;
  }

  const mix = model.mixes.find((m) => m.id === selectedId);
  if (mix) {
    upstream.forEach((id) => keep.add(id));
    if (mix.kind === "group") {
      // A group traces itself plus its member zones' paths.
      keep.add(mix.id);
      for (const memberId of mix.members ?? []) {
        zoneWithOutput(memberId);
      }
    } else {
      zoneWithOutput(mix.id);
    }
    return keep;
  }

  return null;
}
