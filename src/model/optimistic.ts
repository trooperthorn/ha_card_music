/**
 * Optimistic state layer.
 *
 * Some devices confirm slowly: Monoprice child zones reflect commands only
 * after the integration's 5 second poll. When the card dispatches a service
 * call it records what it expects the entity to look like; the graph renders
 * the expectation (with a pending indicator) until the real state confirms it
 * or the TTL expires. Expired expectations are dropped silently and the real
 * state shows again, so the card displays device truth after at most one TTL.
 */

import type { HassEntity, HomeAssistant } from "../types";

export interface Expectation {
  state?: string;
  source?: string;
  volume_level?: number;
  is_volume_muted?: boolean;
}

interface PendingEntry {
  expect: Expectation;
  setAt: number;
  ttl: number;
}

/** volume_level comparisons tolerate device-side rounding (1 step of 0-38 is ~0.026). */
const VOLUME_TOLERANCE = 0.03;

function satisfied(expect: Expectation, entity: HassEntity): boolean {
  if (expect.state !== undefined) {
    // "on" is satisfied by any active state (playing/idle/paused/on).
    if (expect.state === "on") {
      if (["off", "standby", "unavailable", "unknown"].includes(entity.state)) {
        return false;
      }
    } else if (entity.state !== expect.state) {
      return false;
    }
  }
  if (
    expect.source !== undefined &&
    entity.attributes.source !== expect.source
  ) {
    return false;
  }
  if (expect.volume_level !== undefined) {
    const actual = entity.attributes.volume_level;
    if (
      typeof actual !== "number" ||
      Math.abs(actual - expect.volume_level) > VOLUME_TOLERANCE
    ) {
      return false;
    }
  }
  if (
    expect.is_volume_muted !== undefined &&
    entity.attributes.is_volume_muted !== expect.is_volume_muted
  ) {
    return false;
  }
  return true;
}

export class PendingStore {
  private entries = new Map<string, PendingEntry>();

  /** Record an expectation, merging over any outstanding one for the entity. */
  set(entityId: string, expect: Expectation, ttl: number, now: number): void {
    const existing = this.entries.get(entityId);
    this.entries.set(entityId, {
      expect: { ...existing?.expect, ...expect },
      setAt: now,
      ttl,
    });
  }

  /** Drop expectations that the live state now satisfies or that expired. */
  reconcile(hass: HomeAssistant, now: number): void {
    for (const [entityId, entry] of this.entries) {
      const entity = hass.states[entityId];
      if (entity && satisfied(entry.expect, entity)) {
        this.entries.delete(entityId);
      } else if (now - entry.setAt > entry.ttl) {
        this.entries.delete(entityId);
      }
    }
  }

  has(entityId: string): boolean {
    return this.entries.has(entityId);
  }

  isEmpty(): boolean {
    return this.entries.size === 0;
  }

  /**
   * The entity as the card should display it: live state with any
   * outstanding expectation layered on top.
   */
  overlay(entityId: string, entity: HassEntity | undefined): HassEntity | undefined {
    const entry = this.entries.get(entityId);
    if (!entry || !entity) {
      return entity;
    }
    const e = entry.expect;
    return {
      ...entity,
      state: e.state ?? entity.state,
      attributes: {
        ...entity.attributes,
        ...(e.source !== undefined ? { source: e.source } : {}),
        ...(e.volume_level !== undefined ? { volume_level: e.volume_level } : {}),
        ...(e.is_volume_muted !== undefined
          ? { is_volume_muted: e.is_volume_muted }
          : {}),
      },
    };
  }

  clear(): void {
    this.entries.clear();
  }
}
