/**
 * Shared types: the subset of Home Assistant frontend objects the card
 * touches, the card configuration schema, and the derived graph model.
 *
 * The HomeAssistant/HassEntity shapes are intentionally a subset. The card
 * must not depend on frontend internals beyond the documented hass object
 * (states, callService, callWS) and the documented WebSocket commands.
 */

declare global {
  // Injected by Vite at build time from package.json so the shipped file,
  // the git tag, and package.json stay in lockstep.
  const __CARD_VERSION__: string;

  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

/* ------------------------------------------------------------------ */
/* Home Assistant subset                                              */
/* ------------------------------------------------------------------ */

export interface HassEntityAttributes {
  friendly_name?: string;
  icon?: string;
  source?: string;
  source_list?: string[];
  volume_level?: number;
  is_volume_muted?: boolean;
  supported_features?: number;
  media_title?: string;
  media_artist?: string;
  entity_picture?: string;
  app_name?: string;
  /** media_player group helpers expose their members here. */
  entity_id?: string[];
  unit_of_measurement?: string;
  [key: string]: unknown;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributes;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
  ): Promise<unknown>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
}

/** Result shape of the media_player/browse_media WebSocket command. */
export interface BrowseMediaItem {
  title: string;
  media_class: string;
  media_content_type: string;
  media_content_id: string;
  can_play: boolean;
  can_expand: boolean;
  thumbnail?: string | null;
  children?: BrowseMediaItem[];
  children_media_class?: string | null;
}

/** MediaPlayerEntityFeature bits the card checks before rendering controls. */
export const FEATURE_VOLUME_SET = 4;
export const FEATURE_VOLUME_MUTE = 8;

/* ------------------------------------------------------------------ */
/* Card configuration                                                 */
/* ------------------------------------------------------------------ */

export type VolumeDisplay = "percent" | "db" | "raw";

export interface VolumeConfig {
  /** How the readout is rendered. Defaults to percent. */
  display?: VolumeDisplay;
  /** For display: db, a number entity holding the exact dB value. */
  entity?: string;
  /** For display: raw, the device's native full-scale value (38 for Monoprice). */
  max?: number;
}

export interface NodeAppearance {
  name?: string;
  icon?: string;
}

export interface InputConfig extends NodeAppearance {
  entity: string;
}

export interface ChannelConfig extends NodeAppearance {
  entity: string;
}

export interface ZoneConfig extends NodeAppearance {
  entity: string;
  /**
   * Exact source name on this device that carries the Chromecast feed.
   * Optional when feed_aliases covers the device's naming.
   */
  feed_source?: string;
  volume?: VolumeConfig;
}

export interface GroupConfig extends NodeAppearance {
  /** A Home Assistant media_player group helper entity. */
  entity: string;
}

export interface MasterConfig extends NodeAppearance {
  /**
   * A device master entity whose commands fan out to a whole unit in
   * firmware (Monoprice master zones 10/20/30). Rendered as a takeover node.
   */
  entity: string;
  feed_source?: string;
}

export interface ColumnsConfig {
  inputs?: string;
  channels?: string;
  mixes?: string;
  outputs?: string;
}

export interface ColorsConfig {
  input_link?: string;
  channel_link?: string;
  output_link?: string;
}

export interface MusicFlowConfig {
  type: string;
  title?: string;
  input: InputConfig;
  channel: ChannelConfig;
  /** Source names that count as the Chromecast feed on any device. */
  feed_aliases?: string[];
  zones: ZoneConfig[];
  groups?: GroupConfig[];
  masters?: MasterConfig[];
  columns?: ColumnsConfig;
  colors?: ColorsConfig;
  /** Milliseconds before an unconfirmed optimistic value is discarded. */
  optimistic_ttl?: number;
}

export const DEFAULT_OPTIMISTIC_TTL = 8000;

export const DEFAULT_COLORS: Required<ColorsConfig> = {
  input_link: "#2dd4cf",
  channel_link: "#d946ef",
  output_link: "#10b981",
};

export const DEFAULT_COLUMNS: Required<ColumnsConfig> = {
  inputs: "Inputs",
  channels: "Channels",
  mixes: "Mixes",
  outputs: "Outputs",
};

/* ------------------------------------------------------------------ */
/* Derived graph model                                                */
/* ------------------------------------------------------------------ */

export type NodeKind = "input" | "channel" | "zone" | "group" | "master";

export interface GraphNode {
  /** Stable id used for selection and link anchoring, e.g. "zone:media_player.zone_11". */
  id: string;
  kind: NodeKind;
  entity: string;
  name: string;
  icon: string;
  subtitle: string;
  /** Entity exists in hass.states. */
  found: boolean;
  /** Entity state is not unavailable/unknown. */
  available: boolean;
  /** Node is fully in the signal path. */
  inPath: boolean;
  /** Group/master with some but not all members in the path. */
  partial: boolean;
  /** Powered on but listening to a different source. */
  offPath: boolean;
  /** An optimistic expectation is outstanding for this entity. */
  pending: boolean;
  muted: boolean;
  artwork?: string;
  /** For groups: "n of m" member state. */
  memberTotal?: number;
  memberActive?: number;
  /** For groups: node ids of member zones that are configured on the card. */
  members?: string[];
}

export interface OutputRow {
  /** Link anchor id, e.g. "out:media_player.zone_11". */
  id: string;
  zoneId: string;
  entity: string;
  name: string;
  icon: string;
  volumeLevel: number;
  /** Secondary readout, e.g. "22/38" or "-32.0 dB". Empty when percent only. */
  readout: string;
  muted: boolean;
  pending: boolean;
  hasVolume: boolean;
  hasMute: boolean;
}

export type LinkKind = "input" | "channel" | "output";

export interface GraphLink {
  fromId: string;
  toId: string;
  kind: LinkKind;
  /** Audio is flowing over this link right now. */
  active: boolean;
  /** Downstream endpoint is muted: rendered dashed. */
  muted: boolean;
}

export interface GraphModel {
  input: GraphNode;
  channel: GraphNode;
  mixes: GraphNode[];
  outputs: OutputRow[];
  links: GraphLink[];
}
