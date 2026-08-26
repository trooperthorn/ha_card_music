import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config";
import {
  deriveModel,
  nodeId,
  outputId,
  resolveFeedName,
  selectionClosure,
} from "../src/model/derive";
import { PendingStore } from "../src/model/optimistic";
import type {
  HassEntity,
  HomeAssistant,
  MusicFlowConfig,
} from "../src/types";

const VOLUME_FEATURES = 4 | 8;

function entity(
  entityId: string,
  state: string,
  attributes: HassEntity["attributes"] = {},
): HassEntity {
  return { entity_id: entityId, state, attributes };
}

function hassWith(...entities: HassEntity[]): HomeAssistant {
  const states: Record<string, HassEntity> = {};
  for (const e of entities) {
    states[e.entity_id] = e;
  }
  return {
    states,
    callService: () => Promise.resolve(),
    callWS: () => Promise.reject(new Error("not used")),
  };
}

function config(overrides: Record<string, unknown> = {}): MusicFlowConfig {
  const result = parseConfig({
    type: "custom:music-flow-card",
    input: { entity: "media_player.ma" },
    channel: { entity: "media_player.cast" },
    feed_aliases: ["AUDIO2", "Source 2"],
    zones: [
      { entity: "media_player.main", name: "Great Room" },
      {
        entity: "media_player.zone_11",
        name: "Kitchen",
        volume: { display: "raw", max: 38 },
      },
    ],
    groups: [{ entity: "media_player.downstairs" }],
    ...overrides,
  });
  expect(result.errors).toEqual([]);
  return result.config!;
}

function playingHass(): HomeAssistant {
  return hassWith(
    entity("media_player.ma", "playing", {
      media_title: "So What",
      media_artist: "Miles Davis",
    }),
    entity("media_player.cast", "playing", { app_name: "Music Assistant" }),
    entity("media_player.main", "on", {
      source: "AUDIO2",
      source_list: ["AUDIO2", "AV1"],
      volume_level: 0.4,
      supported_features: VOLUME_FEATURES,
    }),
    entity("media_player.zone_11", "on", {
      source: "Source 2",
      source_list: ["Source 1", "Source 2"],
      volume_level: 0.5,
      supported_features: VOLUME_FEATURES,
    }),
    entity("media_player.downstairs", "on", {
      entity_id: ["media_player.main", "media_player.zone_11"],
    }),
  );
}

describe("resolveFeedName", () => {
  it("prefers the per-zone override", () => {
    const c = config();
    const zone = { entity: "media_player.x", feed_source: "OPTICAL1" };
    expect(resolveFeedName(zone, c, undefined)).toBe("OPTICAL1");
  });

  it("picks the alias present in the device source_list", () => {
    const c = config();
    const e = entity("media_player.zone_11", "on", {
      source_list: ["Source 1", "Source 2"],
    });
    expect(resolveFeedName({ entity: e.entity_id }, c, e)).toBe("Source 2");
  });

  it("falls back to the first alias when the source_list is unknown", () => {
    const c = config();
    expect(resolveFeedName({ entity: "media_player.x" }, c, undefined)).toBe(
      "AUDIO2",
    );
  });
});

describe("deriveModel", () => {
  it("marks zones on the feed as in path and creates outputs", () => {
    const model = deriveModel(playingHass(), config(), new PendingStore());
    const main = model.mixes.find((m) => m.entity === "media_player.main")!;
    expect(main.inPath).toBe(true);
    expect(model.outputs.map((o) => o.entity)).toEqual([
      "media_player.main",
      "media_player.zone_11",
    ]);
  });

  it("shows raw volume readout for raw display zones", () => {
    const model = deriveModel(playingHass(), config(), new PendingStore());
    const kitchen = model.outputs.find(
      (o) => o.entity === "media_player.zone_11",
    )!;
    expect(kitchen.readout).toBe("19/38");
  });

  it("treats on-but-wrong-source as off path", () => {
    const hass = playingHass();
    hass.states["media_player.main"] = entity("media_player.main", "on", {
      source: "AV1",
      source_list: ["AUDIO2", "AV1"],
    });
    const model = deriveModel(hass, config(), new PendingStore());
    const main = model.mixes.find((m) => m.entity === "media_player.main")!;
    expect(main.inPath).toBe(false);
    expect(main.offPath).toBe(true);
    expect(main.subtitle).toBe("Source: AV1");
    expect(model.outputs.map((o) => o.entity)).toEqual([
      "media_player.zone_11",
    ]);
  });

  it('never matches an undefined or "Unknown" source', () => {
    const hass = playingHass();
    hass.states["media_player.main"] = entity("media_player.main", "on", {
      source: "Unknown",
    });
    const model = deriveModel(hass, config(), new PendingStore());
    const main = model.mixes.find((m) => m.entity === "media_player.main")!;
    expect(main.inPath).toBe(false);
    expect(main.subtitle).toBe("Source: Unknown");
  });

  it("flags missing entities without failing the card", () => {
    const hass = playingHass();
    delete hass.states["media_player.zone_11"];
    const model = deriveModel(hass, config(), new PendingStore());
    const kitchen = model.mixes.find(
      (m) => m.entity === "media_player.zone_11",
    )!;
    expect(kitchen.found).toBe(false);
    expect(kitchen.subtitle).toBe("Entity not found");
  });

  it("derives group full and partial state from configured members", () => {
    const full = deriveModel(playingHass(), config(), new PendingStore());
    const group = full.mixes.find((m) => m.kind === "group")!;
    expect(group.inPath).toBe(true);
    expect(group.memberActive).toBe(2);

    const hass = playingHass();
    hass.states["media_player.main"] = entity("media_player.main", "off", {});
    const partialModel = deriveModel(hass, config(), new PendingStore());
    const partial = partialModel.mixes.find((m) => m.kind === "group")!;
    expect(partial.inPath).toBe(false);
    expect(partial.partial).toBe(true);
    expect(partial.subtitle).toBe("1 of 2 zones on");
  });

  it("marks the input to channel link active only when both stream", () => {
    const idle = playingHass();
    idle.states["media_player.cast"] = entity("media_player.cast", "off", {});
    const model = deriveModel(idle, config(), new PendingStore());
    const link = model.links.find(
      (l) => l.fromId === nodeId("input", "media_player.ma"),
    )!;
    expect(link.active).toBe(false);
  });

  it("renders masters as takeover nodes with feed matching", () => {
    const hass = playingHass();
    hass.states["media_player.unit_1_master"] = entity(
      "media_player.unit_1_master",
      "on",
      { source: "Source 2" },
    );
    const c = config({
      masters: [
        { entity: "media_player.unit_1_master", feed_source: "Source 2" },
      ],
    });
    const model = deriveModel(hass, c, new PendingStore());
    const master = model.mixes.find((m) => m.kind === "master")!;
    expect(master.inPath).toBe(true);
    expect(master.subtitle).toContain("Takeover active");
  });

  it("overlays pending expectations onto zone state", () => {
    const hass = playingHass();
    hass.states["media_player.main"] = entity("media_player.main", "off", {});
    const pending = new PendingStore();
    pending.set(
      "media_player.main",
      { state: "on", source: "AUDIO2" },
      8000,
      Date.now(),
    );
    const model = deriveModel(hass, config(), pending);
    const main = model.mixes.find((m) => m.entity === "media_player.main")!;
    expect(main.inPath).toBe(true);
    expect(main.pending).toBe(true);
  });
});

describe("selectionClosure", () => {
  it("returns null with no selection", () => {
    const model = deriveModel(playingHass(), config(), new PendingStore());
    expect(selectionClosure(model, null)).toBeNull();
  });

  it("traces a zone to its upstream and output", () => {
    const model = deriveModel(playingHass(), config(), new PendingStore());
    const keep = selectionClosure(model, nodeId("zone", "media_player.main"))!;
    expect(keep.has(nodeId("input", "media_player.ma"))).toBe(true);
    expect(keep.has(nodeId("channel", "media_player.cast"))).toBe(true);
    expect(keep.has(nodeId("zone", "media_player.main"))).toBe(true);
    expect(keep.has(outputId("media_player.main"))).toBe(true);
    expect(keep.has(nodeId("zone", "media_player.zone_11"))).toBe(false);
  });

  it("traces a group to its members", () => {
    const model = deriveModel(playingHass(), config(), new PendingStore());
    const group = model.mixes.find((m) => m.kind === "group")!;
    const keep = selectionClosure(model, group.id)!;
    expect(keep.has(nodeId("zone", "media_player.main"))).toBe(true);
    expect(keep.has(nodeId("zone", "media_player.zone_11"))).toBe(true);
  });

  it("traces the channel to everything currently carrying audio", () => {
    const hass = playingHass();
    hass.states["media_player.zone_11"] = entity(
      "media_player.zone_11",
      "off",
      {},
    );
    const model = deriveModel(hass, config(), new PendingStore());
    const keep = selectionClosure(
      model,
      nodeId("channel", "media_player.cast"),
    )!;
    expect(keep.has(nodeId("zone", "media_player.main"))).toBe(true);
    expect(keep.has(nodeId("zone", "media_player.zone_11"))).toBe(false);
  });
});
