/**
 * Development-only fake hass object. Service calls are logged to the
 * console and applied to the fake state after a per-entity delay: entities
 * flagged as slow (the Monoprice simulation) confirm after 5 seconds, the
 * rest after 300 ms. This exercises the card's optimistic layer the same
 * way the real integrations do.
 */

import type {
  BrowseMediaItem,
  HassEntity,
  HomeAssistant,
} from "../src/types";

const SLOW_CONFIRM_MS = 5000;
const FAST_CONFIRM_MS = 300;

export class MockHass implements HomeAssistant {
  states: Record<string, HassEntity> = {};
  onChange: (() => void) | null = null;

  private slowEntities: Set<string>;
  private browseRoot: BrowseMediaItem;

  constructor(slowEntities: string[], browseRoot: BrowseMediaItem) {
    this.slowEntities = new Set(slowEntities);
    this.browseRoot = browseRoot;
  }

  load(states: Record<string, HassEntity>): void {
    this.states = structuredClone(states);
    this.notify();
  }

  private notify(): void {
    this.onChange?.();
  }

  private later(entityId: string, apply: () => void): void {
    const ms = this.slowEntities.has(entityId)
      ? SLOW_CONFIRM_MS
      : FAST_CONFIRM_MS;
    setTimeout(() => {
      apply();
      this.notify();
    }, ms);
  }

  private patch(entityId: string, patch: Partial<HassEntity>): void {
    const entity = this.states[entityId];
    if (!entity) {
      return;
    }
    // Immutable update, exactly like real hass updates: a new states map
    // and a new entity object, so identity comparison detects the change.
    this.states = {
      ...this.states,
      [entityId]: {
        ...entity,
        ...patch,
        attributes: { ...entity.attributes, ...patch.attributes },
      },
    };
  }

  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown> {
    console.info("callService", domain, service, data);
    const entityId = data?.entity_id as string | undefined;
    if (domain === "media_player" && entityId) {
      const members = this.groupMembers(entityId);
      const targets = members.length > 0 ? members : [entityId];
      switch (service) {
        case "turn_on":
          for (const t of targets) {
            this.later(t, () => this.patch(t, { state: "on" }));
          }
          if (members.length > 0) {
            this.later(entityId, () => this.patch(entityId, { state: "on" }));
          }
          break;
        case "turn_off":
          for (const t of targets) {
            this.later(t, () => this.patch(t, { state: "off" }));
          }
          if (members.length > 0) {
            this.later(entityId, () => this.patch(entityId, { state: "off" }));
          }
          break;
        case "select_source":
          for (const t of targets) {
            this.later(t, () =>
              this.patch(t, {
                attributes: { source: data?.source as string },
              }),
            );
          }
          break;
        case "volume_set":
          this.later(entityId, () =>
            this.patch(entityId, {
              attributes: { volume_level: data?.volume_level as number },
            }),
          );
          break;
        case "volume_mute":
          this.later(entityId, () =>
            this.patch(entityId, {
              attributes: {
                is_volume_muted: data?.is_volume_muted as boolean,
              },
            }),
          );
          break;
        case "play_media":
          this.later(entityId, () =>
            this.patch(entityId, {
              state: "playing",
              attributes: {
                media_title: String(data?.media_content_id ?? "Media"),
              },
            }),
          );
          break;
      }
    }
    return Promise.resolve();
  }

  private groupMembers(entityId: string): string[] {
    const members = this.states[entityId]?.attributes.entity_id;
    return Array.isArray(members) ? members : [];
  }

  callWS<T>(msg: Record<string, unknown>): Promise<T> {
    console.info("callWS", msg);
    if (msg.type === "media_player/browse_media") {
      const contentId = msg.media_content_id as string | undefined;
      const found = contentId
        ? this.findBrowse(this.browseRoot, contentId)
        : this.browseRoot;
      if (!found) {
        return Promise.reject(new Error(`No browse node ${contentId}`));
      }
      return Promise.resolve(found as unknown as T);
    }
    return Promise.reject(new Error(`Unhandled WS command ${String(msg.type)}`));
  }

  private findBrowse(
    node: BrowseMediaItem,
    contentId: string,
  ): BrowseMediaItem | undefined {
    if (node.media_content_id === contentId) {
      return node;
    }
    for (const child of node.children ?? []) {
      const found = this.findBrowse(child, contentId);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
}
