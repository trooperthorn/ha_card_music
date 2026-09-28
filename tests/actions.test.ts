import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  playMedia,
  setVolume,
  toggleGroup,
  toggleMute,
  toggleZone,
} from "../src/actions";
import { parseConfig } from "../src/config";
import { PendingStore } from "../src/model/optimistic";
import type { GraphNode, HassEntity, HomeAssistant, MusicFlowConfig } from "../src/types";

type Call = [string, string, Record<string, unknown> | undefined];

function hass(states: HassEntity[]): HomeAssistant & { calls: Call[] } {
  const calls: Call[] = [];
  return {
    calls,
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    callService: (d, s, data) => {
      calls.push([d, s, data]);
      return Promise.resolve();
    },
    callWS: () => Promise.reject(new Error("unused")),
  };
}

function config(): MusicFlowConfig {
  const r = parseConfig({
    type: "custom:music-flow-card",
    input: { entity: "media_player.ma" },
    channel: { entity: "media_player.cast" },
    feed_aliases: ["AUDIO2"],
    zones: [{ entity: "media_player.a" }, { entity: "media_player.b" }],
  });
  return r.config!;
}

const node = (inPath: boolean): GraphNode => ({ inPath }) as GraphNode;
const zone = (id: string, state = "off"): HassEntity => ({
  entity_id: id,
  state,
  attributes: { source_list: ["AUDIO2", "AV1"] },
});

describe("actions", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("activates a zone with turn_on then select_source", async () => {
    const h = hass([zone("media_player.a")]);
    const cfg = config();
    const p = toggleZone(h, new PendingStore(), cfg, cfg.zones[0]!, node(false), 1000);
    await vi.runAllTimersAsync();
    await p;
    expect(h.calls.map((c) => c[1])).toEqual(["turn_on", "select_source"]);
    expect(h.calls[1]![2]).toEqual({ entity_id: "media_player.a", source: "AUDIO2" });
  });

  it("deactivates an in-path zone", async () => {
    const h = hass([zone("media_player.a", "on")]);
    const cfg = config();
    await toggleZone(h, new PendingStore(), cfg, cfg.zones[0]!, node(true), 1000);
    expect(h.calls).toEqual([["media_player", "turn_off", { entity_id: "media_player.a" }]]);
  });

  it("group activation only touches configured members not yet in path", async () => {
    const helper: HassEntity = {
      entity_id: "media_player.grp",
      state: "off",
      attributes: { entity_id: ["media_player.a", "media_player.b", "media_player.x"] },
    };
    const h = hass([helper, zone("media_player.a"), zone("media_player.b", "on")]);
    const members = new Map([
      ["media_player.a", node(false)],
      ["media_player.b", node(true)],
    ]);
    const p = toggleGroup(h, new PendingStore(), config(), "media_player.grp", node(false), members, 1000);
    await vi.runAllTimersAsync();
    await p;
    const touched = h.calls.map((c) => c[2]?.entity_id);
    expect(touched).toEqual(["media_player.a", "media_player.a"]);
  });

  it("clamps volume and toggles mute", async () => {
    const h = hass([]);
    await setVolume(h, new PendingStore(), "media_player.a", 1.7, 1000);
    await toggleMute(h, new PendingStore(), "media_player.a", false, 1000);
    await playMedia(h, "media_player.ma", "id", "music");
    expect(h.calls[0]![2]).toEqual({ entity_id: "media_player.a", volume_level: 1 });
    expect(h.calls[1]![2]).toEqual({ entity_id: "media_player.a", is_volume_muted: true });
    expect(h.calls[2]![1]).toBe("play_media");
  });
});
