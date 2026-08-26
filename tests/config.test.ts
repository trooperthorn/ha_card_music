import { describe, expect, it } from "vitest";
import { parseConfig, watchedEntities } from "../src/config";

const VALID = {
  type: "custom:music-flow-card",
  input: { entity: "media_player.ma" },
  channel: { entity: "media_player.cast" },
  feed_aliases: ["AUDIO2", "Source 2"],
  zones: [
    { entity: "media_player.main" },
    {
      entity: "media_player.zone_11",
      volume: { display: "raw", max: 38 },
    },
  ],
  groups: [{ entity: "media_player.downstairs" }],
  masters: [{ entity: "media_player.unit_1_master", feed_source: "Source 2" }],
};

describe("parseConfig", () => {
  it("accepts a valid config and applies defaults", () => {
    const result = parseConfig(VALID);
    expect(result.errors).toEqual([]);
    expect(result.config?.optimistic_ttl).toBe(8000);
    expect(result.config?.zones).toHaveLength(2);
  });

  it("rejects a non-mapping", () => {
    expect(parseConfig("nope").errors).toHaveLength(1);
    expect(parseConfig(null).errors).toHaveLength(1);
  });

  it("collects multiple errors in one pass", () => {
    const result = parseConfig({
      type: "custom:music-flow-card",
      typo_key: 1,
      input: {},
      zones: [],
    });
    expect(result.config).toBeUndefined();
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
    expect(result.errors.join("\n")).toContain('unknown option "typo_key"');
  });

  it("rejects wrong entity domains", () => {
    const result = parseConfig({
      ...VALID,
      zones: [{ entity: "light.kitchen", feed_source: "X" }],
    });
    expect(result.errors.join("\n")).toContain("media_player domain");
  });

  it("requires feed_source when no feed_aliases cover a zone", () => {
    const { feed_aliases: _dropped, ...rest } = VALID;
    const result = parseConfig({
      ...rest,
      zones: [{ entity: "media_player.main" }],
      masters: undefined,
    });
    expect(result.errors.join("\n")).toContain("needs feed_source");
  });

  it("rejects raw volume display without max", () => {
    const result = parseConfig({
      ...VALID,
      zones: [
        {
          entity: "media_player.zone_11",
          volume: { display: "raw" },
        },
      ],
    });
    expect(result.errors.join("\n")).toContain("requires a positive max");
  });

  it("rejects db volume readout entity outside the number domain", () => {
    const result = parseConfig({
      ...VALID,
      zones: [
        {
          entity: "media_player.main",
          volume: { display: "db", entity: "sensor.db" },
        },
      ],
    });
    expect(result.errors.join("\n")).toContain("number domain");
  });

  it("rejects duplicate zone entities", () => {
    const result = parseConfig({
      ...VALID,
      zones: [
        { entity: "media_player.main" },
        { entity: "media_player.main" },
      ],
    });
    expect(result.errors.join("\n")).toContain("duplicate entity");
  });

  it("tolerates Lovelace layout bookkeeping keys", () => {
    const result = parseConfig({ ...VALID, grid_options: { columns: 12 } });
    expect(result.errors).toEqual([]);
  });
});

describe("watchedEntities", () => {
  it("lists every configured entity including volume readouts", () => {
    const result = parseConfig({
      ...VALID,
      zones: [
        {
          entity: "media_player.main",
          volume: { display: "db", entity: "number.main_db" },
        },
      ],
    });
    const watched = watchedEntities(result.config!);
    expect(watched).toContain("media_player.ma");
    expect(watched).toContain("media_player.cast");
    expect(watched).toContain("media_player.main");
    expect(watched).toContain("number.main_db");
    expect(watched).toContain("media_player.downstairs");
    expect(watched).toContain("media_player.unit_1_master");
  });
});
