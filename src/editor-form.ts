/**
 * Visual editor schema for the documented static getConfigForm() contract
 * (Home Assistant renders it with ha-form; the card ships no editor element).
 *
 * The form covers the top-level options. Zones, groups, and masters carry
 * per-entry volume and feed settings that do not fit a flat form, so they
 * stay in YAML; the form editor preserves them untouched.
 */

type Schema = Record<string, unknown>;

const appearance = (name: string, title: string): Schema => ({
  name,
  type: "expandable",
  title,
  schema: [
    { name: "entity", required: true, selector: { entity: { domain: "media_player" } } },
    {
      name: "",
      type: "grid",
      flatten: true,
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ],
    },
  ],
});

export const CONFIG_FORM_SCHEMA: Schema[] = [
  { name: "title", selector: { text: {} } },
  appearance("input", "Input (Music Assistant player)"),
  appearance("channel", "Channel (Chromecast player)"),
  { name: "feed_aliases", selector: { text: { multiple: true } } },
  {
    name: "optimistic_ttl",
    selector: { number: { min: 0, step: 500, mode: "box", unit_of_measurement: "ms" } },
  },
  {
    name: "columns",
    type: "expandable",
    title: "Column labels",
    schema: ["inputs", "channels", "mixes", "outputs"].map((name) => ({
      name,
      selector: { text: {} },
    })),
  },
  {
    name: "colors",
    type: "expandable",
    title: "Link colors",
    schema: ["input_link", "channel_link", "output_link"].map((name) => ({
      name,
      selector: { text: {} },
    })),
  },
];

const LABELS: Record<string, string> = {
  title: "Title",
  entity: "Entity",
  name: "Name",
  icon: "Icon",
  feed_aliases: "Feed aliases",
  optimistic_ttl: "Optimistic timeout",
  inputs: "Inputs",
  channels: "Channels",
  mixes: "Mixes",
  outputs: "Outputs",
  input_link: "Source to stream",
  channel_link: "Stream to zone",
  output_link: "Zone to output",
};

const HELPERS: Record<string, string> = {
  feed_aliases:
    "Source names that count as the Chromecast feed on any device. Zones, groups, and masters are configured in YAML.",
  optimistic_ttl: "Milliseconds before an unconfirmed optimistic value is discarded (default 8000).",
};

export function getConfigForm(): {
  schema: Schema[];
  computeLabel: (s: { name: string }) => string | undefined;
  computeHelper: (s: { name: string }) => string | undefined;
} {
  return {
    schema: CONFIG_FORM_SCHEMA,
    computeLabel: (s) => LABELS[s.name],
    computeHelper: (s) => HELPERS[s.name],
  };
}

/** Masonry size (1 unit = 50 px): header, legend, plus one row per mix node. */
export function cardSizeFor(config: {
  zones?: unknown[];
  groups?: unknown[];
  masters?: unknown[];
} | undefined): number {
  const rows =
    (config?.zones?.length ?? 1) +
    (config?.groups?.length ?? 0) +
    (config?.masters?.length ?? 0);
  return Math.max(4, 3 + Math.ceil(rows * 1.5));
}
