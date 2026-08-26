/**
 * Service dispatch for every clickable node. Every write records an
 * optimistic expectation first (see model/optimistic.ts) so the UI
 * acknowledges the tap immediately even on slow-confirming devices.
 *
 * Activation is sequenced turn_on then select_source with a short delay:
 * yamaha_ynca zones coming out of standby may ignore an input change sent
 * in the same instant as the wake command.
 */

import type { PendingStore } from "./model/optimistic";
import { resolveFeedName } from "./model/derive";
import type {
  GraphNode,
  HomeAssistant,
  MasterConfig,
  MusicFlowConfig,
  ZoneConfig,
} from "./types";

const TURN_ON_SETTLE_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function activateEntity(
  hass: HomeAssistant,
  pending: PendingStore,
  entry: ZoneConfig | MasterConfig,
  config: MusicFlowConfig,
  ttl: number,
): Promise<void> {
  const feed = resolveFeedName(entry, config, hass.states[entry.entity]);
  pending.set(
    entry.entity,
    feed ? { state: "on", source: feed } : { state: "on" },
    ttl,
    Date.now(),
  );
  await hass.callService("media_player", "turn_on", {
    entity_id: entry.entity,
  });
  if (feed) {
    await delay(TURN_ON_SETTLE_MS);
    await hass.callService("media_player", "select_source", {
      entity_id: entry.entity,
      source: feed,
    });
  }
}

async function deactivateEntity(
  hass: HomeAssistant,
  pending: PendingStore,
  entityId: string,
  ttl: number,
): Promise<void> {
  pending.set(entityId, { state: "off" }, ttl, Date.now());
  await hass.callService("media_player", "turn_off", { entity_id: entityId });
}

export async function toggleZone(
  hass: HomeAssistant,
  pending: PendingStore,
  config: MusicFlowConfig,
  zone: ZoneConfig,
  node: GraphNode,
  ttl: number,
): Promise<void> {
  if (node.inPath) {
    await deactivateEntity(hass, pending, zone.entity, ttl);
  } else {
    await activateEntity(hass, pending, zone, config, ttl);
  }
}

/**
 * Group helper node. Activation turns the helper on (the helper fans
 * turn_on out to its members) and then sets each configured member zone to
 * its feed source. Partial groups are completed rather than restarted:
 * only the members that are not yet in the path are touched.
 */
export async function toggleGroup(
  hass: HomeAssistant,
  pending: PendingStore,
  config: MusicFlowConfig,
  groupEntity: string,
  node: GraphNode,
  memberNodes: Map<string, GraphNode>,
  ttl: number,
): Promise<void> {
  const helper = hass.states[groupEntity];
  const members = Array.isArray(helper?.attributes.entity_id)
    ? helper.attributes.entity_id
    : [];
  if (node.inPath) {
    pending.set(groupEntity, { state: "off" }, ttl, Date.now());
    for (const member of members) {
      if (memberNodes.has(member)) {
        pending.set(member, { state: "off" }, ttl, Date.now());
      }
    }
    await hass.callService("media_player", "turn_off", {
      entity_id: groupEntity,
    });
    return;
  }
  const toActivate = config.zones.filter((zone) => {
    if (!members.includes(zone.entity)) {
      return false;
    }
    const memberNode = memberNodes.get(zone.entity);
    return memberNode === undefined || !memberNode.inPath;
  });
  pending.set(groupEntity, { state: "on" }, ttl, Date.now());
  for (const zone of toActivate) {
    await activateEntity(hass, pending, zone, config, ttl);
  }
}

/**
 * Master takeover node (Monoprice master zones 10/20/30). One command pair
 * on the master entity; the amplifier firmware enables all six child zones
 * and sets their source. Child entities confirm on the next poll, so their
 * expectations use the card's TTL to bridge the gap.
 */
export async function toggleMaster(
  hass: HomeAssistant,
  pending: PendingStore,
  config: MusicFlowConfig,
  master: MasterConfig,
  node: GraphNode,
  ttl: number,
): Promise<void> {
  if (node.inPath) {
    await deactivateEntity(hass, pending, master.entity, ttl);
  } else {
    await activateEntity(hass, pending, master, config, ttl);
  }
}

export async function setVolume(
  hass: HomeAssistant,
  pending: PendingStore,
  entityId: string,
  level: number,
  ttl: number,
): Promise<void> {
  const clamped = Math.min(1, Math.max(0, level));
  pending.set(entityId, { volume_level: clamped }, ttl, Date.now());
  await hass.callService("media_player", "volume_set", {
    entity_id: entityId,
    volume_level: clamped,
  });
}

export async function toggleMute(
  hass: HomeAssistant,
  pending: PendingStore,
  entityId: string,
  currentlyMuted: boolean,
  ttl: number,
): Promise<void> {
  pending.set(entityId, { is_volume_muted: !currentlyMuted }, ttl, Date.now());
  await hass.callService("media_player", "volume_mute", {
    entity_id: entityId,
    is_volume_muted: !currentlyMuted,
  });
}

export async function playMedia(
  hass: HomeAssistant,
  inputEntity: string,
  contentId: string,
  contentType: string,
): Promise<void> {
  await hass.callService("media_player", "play_media", {
    entity_id: inputEntity,
    media_content_id: contentId,
    media_content_type: contentType,
  });
}
