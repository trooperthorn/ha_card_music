/**
 * Configuration normalization and validation.
 *
 * The card never guesses entities. Every problem found here is collected and
 * rendered together by the error view; a card with config errors performs no
 * service calls. Runtime "entity not in hass.states" is handled separately as
 * a per-node badge so a temporarily unloaded integration does not blank the
 * whole card.
 */

import type {
  GroupConfig,
  MasterConfig,
  MusicFlowConfig,
  VolumeConfig,
  ZoneConfig,
} from "./types";
import { DEFAULT_OPTIMISTIC_TTL } from "./types";

export interface ParseResult {
  config?: MusicFlowConfig;
  errors: string[];
}

const KNOWN_TOP_LEVEL_KEYS = new Set([
  "type",
  "title",
  "input",
  "channel",
  "feed_aliases",
  "zones",
  "groups",
  "masters",
  "columns",
  "colors",
  "optimistic_ttl",
  // Lovelace bookkeeping keys that may be present on any card config.
  "view_layout",
  "layout_options",
  "grid_options",
  "visibility",
]);

const VOLUME_DISPLAYS = new Set(["percent", "db", "raw"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function checkEntity(
  value: unknown,
  domain: string,
  path: string,
  errors: string[],
): void {
  if (!isNonEmptyString(value)) {
    errors.push(`${path}: required and must be a ${domain} entity id`);
    return;
  }
  if (!value.startsWith(`${domain}.`)) {
    errors.push(`${path}: "${value}" must be in the ${domain} domain`);
  }
}

function checkAppearance(
  obj: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  if (obj.name !== undefined && !isNonEmptyString(obj.name)) {
    errors.push(`${path}.name: must be a non-empty string`);
  }
  if (obj.icon !== undefined && !isNonEmptyString(obj.icon)) {
    errors.push(`${path}.icon: must be a non-empty string`);
  }
}

function checkVolume(
  value: unknown,
  path: string,
  errors: string[],
): VolumeConfig | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isRecord(value)) {
    errors.push(`${path}: must be a mapping with display/entity/max`);
    return undefined;
  }
  const display = value.display ?? "percent";
  if (typeof display !== "string" || !VOLUME_DISPLAYS.has(display)) {
    errors.push(`${path}.display: must be one of percent, db, raw`);
  }
  if (display === "db") {
    if (value.entity !== undefined) {
      checkEntity(value.entity, "number", `${path}.entity`, errors);
    }
  }
  if (display === "raw") {
    if (typeof value.max !== "number" || value.max <= 0) {
      errors.push(`${path}.max: display "raw" requires a positive max (38 for Monoprice)`);
    }
  }
  return value as VolumeConfig;
}

export function parseConfig(raw: unknown): ParseResult {
  const errors: string[] = [];

  if (!isRecord(raw)) {
    return { errors: ["configuration must be a YAML mapping"] };
  }

  for (const key of Object.keys(raw)) {
    if (!KNOWN_TOP_LEVEL_KEYS.has(key)) {
      errors.push(`unknown option "${key}" (typo?)`);
    }
  }

  if (raw.title !== undefined && !isNonEmptyString(raw.title)) {
    errors.push("title: must be a non-empty string");
  }

  // input / channel
  if (!isRecord(raw.input)) {
    errors.push("input: required, with input.entity set to the Music Assistant player");
  } else {
    checkEntity(raw.input.entity, "media_player", "input.entity", errors);
    checkAppearance(raw.input, "input", errors);
  }
  if (!isRecord(raw.channel)) {
    errors.push("channel: required, with channel.entity set to the Chromecast player");
  } else {
    checkEntity(raw.channel.entity, "media_player", "channel.entity", errors);
    checkAppearance(raw.channel, "channel", errors);
  }

  let feedAliases: string[] | undefined;
  if (raw.feed_aliases !== undefined) {
    if (
      !Array.isArray(raw.feed_aliases) ||
      raw.feed_aliases.length === 0 ||
      !raw.feed_aliases.every(isNonEmptyString)
    ) {
      errors.push("feed_aliases: must be a non-empty list of source names");
    } else {
      feedAliases = raw.feed_aliases.map((s) => s.trim());
    }
  }

  const zones: ZoneConfig[] = [];
  if (!Array.isArray(raw.zones) || raw.zones.length === 0) {
    errors.push("zones: required, at least one zone");
  } else {
    raw.zones.forEach((z, i) => {
      const path = `zones[${i}]`;
      if (!isRecord(z)) {
        errors.push(`${path}: must be a mapping`);
        return;
      }
      checkEntity(z.entity, "media_player", `${path}.entity`, errors);
      checkAppearance(z, path, errors);
      if (z.feed_source !== undefined && !isNonEmptyString(z.feed_source)) {
        errors.push(`${path}.feed_source: must be a non-empty source name`);
      }
      if (z.feed_source === undefined && feedAliases === undefined) {
        errors.push(
          `${path}: needs feed_source, or set top-level feed_aliases covering this device`,
        );
      }
      checkVolume(z.volume, `${path}.volume`, errors);
      zones.push(z as unknown as ZoneConfig);
    });
    const seen = new Set<string>();
    for (const z of zones) {
      if (typeof z.entity === "string") {
        if (seen.has(z.entity)) {
          errors.push(`zones: duplicate entity "${z.entity}"`);
        }
        seen.add(z.entity);
      }
    }
  }

  const groups: GroupConfig[] = [];
  if (raw.groups !== undefined) {
    if (!Array.isArray(raw.groups)) {
      errors.push("groups: must be a list");
    } else {
      raw.groups.forEach((g, i) => {
        const path = `groups[${i}]`;
        if (!isRecord(g)) {
          errors.push(`${path}: must be a mapping`);
          return;
        }
        checkEntity(g.entity, "media_player", `${path}.entity`, errors);
        checkAppearance(g, path, errors);
        groups.push(g as unknown as GroupConfig);
      });
    }
  }

  const masters: MasterConfig[] = [];
  if (raw.masters !== undefined) {
    if (!Array.isArray(raw.masters)) {
      errors.push("masters: must be a list");
    } else {
      raw.masters.forEach((m, i) => {
        const path = `masters[${i}]`;
        if (!isRecord(m)) {
          errors.push(`${path}: must be a mapping`);
          return;
        }
        checkEntity(m.entity, "media_player", `${path}.entity`, errors);
        checkAppearance(m, path, errors);
        if (m.feed_source !== undefined && !isNonEmptyString(m.feed_source)) {
          errors.push(`${path}.feed_source: must be a non-empty source name`);
        }
        if (m.feed_source === undefined && feedAliases === undefined) {
          errors.push(
            `${path}: needs feed_source, or set top-level feed_aliases covering this device`,
          );
        }
        masters.push(m as unknown as MasterConfig);
      });
    }
  }

  // columns / colors
  if (raw.columns !== undefined && !isRecord(raw.columns)) {
    errors.push("columns: must be a mapping of inputs/channels/mixes/outputs labels");
  }
  if (raw.colors !== undefined && !isRecord(raw.colors)) {
    errors.push("colors: must be a mapping of input_link/channel_link/output_link");
  }

  if (
    raw.optimistic_ttl !== undefined &&
    (typeof raw.optimistic_ttl !== "number" || raw.optimistic_ttl < 0)
  ) {
    errors.push("optimistic_ttl: must be a non-negative number of milliseconds");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const config: MusicFlowConfig = {
    ...(raw as unknown as MusicFlowConfig),
    feed_aliases: feedAliases,
    zones,
    groups: groups.length > 0 ? groups : undefined,
    masters: masters.length > 0 ? masters : undefined,
    optimistic_ttl:
      (raw.optimistic_ttl as number | undefined) ?? DEFAULT_OPTIMISTIC_TTL,
  };
  return { config, errors: [] };
}

/**
 * Every entity id the card watches. hass updates that change none of these
 * do not trigger a re-render.
 */
export function watchedEntities(config: MusicFlowConfig): string[] {
  const ids = [config.input.entity, config.channel.entity];
  for (const z of config.zones) {
    ids.push(z.entity);
    if (z.volume?.entity) {
      ids.push(z.volume.entity);
    }
  }
  for (const g of config.groups ?? []) {
    ids.push(g.entity);
  }
  for (const m of config.masters ?? []) {
    ids.push(m.entity);
  }
  return ids;
}
