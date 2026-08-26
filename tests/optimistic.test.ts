import { describe, expect, it } from "vitest";
import { PendingStore } from "../src/model/optimistic";
import type { HassEntity, HomeAssistant } from "../src/types";

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

const ID = "media_player.zone_11";

describe("PendingStore", () => {
  it("overlays expected state and attributes", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on", source: "Source 2" }, 8000, 1000);
    const shown = store.overlay(ID, entity(ID, "off", { source: "Source 1" }));
    expect(shown?.state).toBe("on");
    expect(shown?.attributes.source).toBe("Source 2");
  });

  it("confirms when the live state satisfies the expectation", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on", source: "Source 2" }, 8000, 1000);
    store.reconcile(
      hassWith(entity(ID, "on", { source: "Source 2" })),
      2000,
    );
    expect(store.has(ID)).toBe(false);
  });

  it('treats any active state as satisfying "on"', () => {
    const store = new PendingStore();
    store.set(ID, { state: "on" }, 8000, 1000);
    store.reconcile(hassWith(entity(ID, "playing")), 2000);
    expect(store.has(ID)).toBe(false);
  });

  it("keeps the expectation while unconfirmed and inside the TTL", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on", source: "Source 2" }, 8000, 1000);
    store.reconcile(hassWith(entity(ID, "off", { source: "Source 1" })), 5000);
    expect(store.has(ID)).toBe(true);
  });

  it("expires unconfirmed expectations after the TTL", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on" }, 8000, 1000);
    store.reconcile(hassWith(entity(ID, "off")), 9001 + 1000);
    expect(store.has(ID)).toBe(false);
  });

  it("tolerates volume rounding within one raw step", () => {
    const store = new PendingStore();
    store.set(ID, { volume_level: 0.5 }, 8000, 1000);
    // 19/38 rounds to 0.5 exactly; 0.526 is 20/38, still within tolerance.
    store.reconcile(hassWith(entity(ID, "on", { volume_level: 0.526 })), 2000);
    expect(store.has(ID)).toBe(false);
  });

  it("merges a new expectation over an outstanding one", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on" }, 8000, 1000);
    store.set(ID, { volume_level: 0.4 }, 8000, 2000);
    const shown = store.overlay(ID, entity(ID, "off", { volume_level: 0.9 }));
    expect(shown?.state).toBe("on");
    expect(shown?.attributes.volume_level).toBe(0.4);
  });

  it("returns undefined overlay for a missing entity", () => {
    const store = new PendingStore();
    store.set(ID, { state: "on" }, 8000, 1000);
    expect(store.overlay(ID, undefined)).toBeUndefined();
  });
});
