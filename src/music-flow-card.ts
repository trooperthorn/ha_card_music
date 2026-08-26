/**
 * music-flow-card: an Audio Flow style routing card for Home Assistant.
 *
 * Columns: Inputs (Music Assistant source), Channels (the Chromecast the
 * music streams to), Mixes (receiver and amplifier zones, group helpers,
 * takeover masters), Outputs (the zones currently playing, with volume).
 * Clicking any node traces its signal path; clicking zones routes audio by
 * powering them on and selecting the configured Chromecast feed input.
 */

import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import {
  playMedia,
  setVolume,
  toggleGroup,
  toggleMaster,
  toggleMute,
  toggleZone,
} from "./actions";
import { parseConfig, watchedEntities } from "./config";
import { deriveModel, nodeId, selectionClosure } from "./model/derive";
import { PendingStore } from "./model/optimistic";
import { debounce, fireMoreInfo } from "./ha-helpers";
import { pillHeader, tokens } from "./styles";
import type {
  GraphModel,
  GraphNode,
  HomeAssistant,
  MusicFlowConfig,
} from "./types";
import { DEFAULT_OPTIMISTIC_TTL } from "./types";
import { renderErrors } from "./view/error-card";
import { renderLegend } from "./view/legend";
import "./view/browse-panel";
import "./view/graph-view";

class MusicFlowCard extends LitElement {
  @property({ attribute: false }) config?: MusicFlowConfig;

  @state() private errors: string[] = [];
  @state() private selection: string | null = null;
  @state() private browsing = false;
  @state() private model?: GraphModel;

  private _hass?: HomeAssistant;
  private pending = new PendingStore();
  private watched: string[] = [];

  private debouncedVolume = debounce(
    (entity: string, level: number) => {
      if (this._hass && this.config) {
        void setVolume(this._hass, this.pending, entity, level, this.ttl());
      }
    },
    250,
  );

  static override styles = [
    tokens,
    pillHeader,
    css`
      :host {
        display: block;
      }
      ha-card,
      .card {
        position: relative;
        display: block;
        background: var(--mfc-bg);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        color: var(--mfc-text);
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }
      .header .title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }
      button.clear {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--mfc-idle-link);
        border-radius: 8px;
        background: var(--mfc-node-bg);
        color: var(--mfc-text);
        font-size: 12px;
        padding: 4px 10px;
        cursor: pointer;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 16px;
        font-size: 11px;
        color: var(--mfc-text-dim);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .config-errors {
        border: 1px solid var(--mfc-error);
        border-radius: var(--mfc-radius);
        padding: 12px;
      }
      .config-errors-title {
        font-weight: 600;
        color: var(--mfc-error);
        margin-bottom: 6px;
      }
      .config-errors ul {
        margin: 0;
        padding-left: 18px;
        font-size: 13px;
      }
    `,
  ];

  /* ---------------- Lovelace card contract ---------------- */

  setConfig(raw: unknown): void {
    const result = parseConfig(raw);
    this.errors = result.errors;
    this.config = result.config;
    this.watched = result.config ? watchedEntities(result.config) : [];
    this.pending.clear();
    this.selection = null;
    this.refresh();
  }

  set hass(hass: HomeAssistant) {
    const previous = this._hass;
    this._hass = hass;
    if (!this.config) {
      return;
    }
    this.pending.reconcile(hass, Date.now());
    // Re-derive only when a watched entity actually changed; whole-home
    // state churn otherwise re-renders the graph continuously.
    if (
      previous === undefined ||
      this.watched.some((id) => previous.states[id] !== hass.states[id])
    ) {
      this.refresh();
    }
  }

  getCardSize(): number {
    return 6;
  }

  static getStubConfig(): Record<string, unknown> {
    return {
      input: { entity: "media_player.music_assistant_player" },
      channel: { entity: "media_player.chromecast_audio" },
      feed_aliases: ["Chromecast"],
      zones: [{ entity: "media_player.living_room" }],
    };
  }

  /* ---------------- Derivation ---------------- */

  private ttl(): number {
    return this.config?.optimistic_ttl ?? DEFAULT_OPTIMISTIC_TTL;
  }

  private pendingSweep?: ReturnType<typeof setTimeout>;

  private refresh(): void {
    if (this._hass && this.config) {
      this.model = deriveModel(this._hass, this.config, this.pending);
    }
    this.schedulePendingSweep();
  }

  /**
   * A device that never confirms would otherwise leave its optimistic
   * expectation rendered forever when no other state update arrives: TTL
   * expiry is only evaluated when something re-derives the model. Sweep
   * once shortly after the TTL so expired expectations always clear.
   */
  private schedulePendingSweep(): void {
    if (this.pendingSweep !== undefined) {
      clearTimeout(this.pendingSweep);
      this.pendingSweep = undefined;
    }
    if (this.pending.isEmpty()) {
      return;
    }
    this.pendingSweep = setTimeout(() => {
      this.pendingSweep = undefined;
      if (this._hass) {
        this.pending.reconcile(this._hass, Date.now());
        this.refresh();
      }
    }, this.ttl() + 250);
  }

  /* ---------------- Event handling ---------------- */

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this.onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key === "Escape") {
      this.selection = null;
      this.browsing = false;
    }
  };

  protected override firstUpdated(_changed: PropertyValues): void {
    this.setAttribute("tabindex", "-1");
  }

  private zoneNodesByEntity(): Map<string, GraphNode> {
    const map = new Map<string, GraphNode>();
    for (const mix of this.model?.mixes ?? []) {
      if (mix.kind === "zone") {
        map.set(mix.entity, mix);
      }
    }
    return map;
  }

  private onNodeTap(id: string): void {
    const hass = this._hass;
    const config = this.config;
    const model = this.model;
    if (!hass || !config || !model) {
      return;
    }

    if (id === model.input.id) {
      this.selection = id;
      this.browsing = true;
      return;
    }
    if (id === model.channel.id) {
      this.selection = this.selection === id ? null : id;
      return;
    }

    const node = model.mixes.find((n) => n.id === id);
    if (!node) {
      return;
    }
    this.selection = id;
    const ttl = this.ttl();
    if (node.kind === "zone") {
      const zone = config.zones.find((z) => z.entity === node.entity);
      if (zone) {
        void toggleZone(hass, this.pending, config, zone, node, ttl).then(() =>
          this.refresh(),
        );
      }
    } else if (node.kind === "group") {
      void toggleGroup(
        hass,
        this.pending,
        config,
        node.entity,
        node,
        this.zoneNodesByEntity(),
        ttl,
      ).then(() => this.refresh());
    } else if (node.kind === "master") {
      const master = (config.masters ?? []).find(
        (m) => m.entity === node.entity,
      );
      if (master) {
        void toggleMaster(hass, this.pending, config, master, node, ttl).then(
          () => this.refresh(),
        );
      }
    }
    this.refresh();
  }

  private onOutputSelect(id: string): void {
    this.selection = this.selection === id ? null : id;
  }

  protected override render() {
    if (this.errors.length > 0) {
      return html`<div class="card">${renderErrors(this.errors)}</div>`;
    }
    const model = this.model;
    const config = this.config;
    if (!model || !config || !this._hass) {
      return html`<div class="card">Waiting for Home Assistant state…</div>`;
    }
    const closure = selectionClosure(model, this.selection);
    return html`
      <div
        class="card"
        @node-tap=${(ev: CustomEvent<{ id: string }>) =>
          this.onNodeTap(ev.detail.id)}
        @node-more-info=${(ev: CustomEvent<{ id: string }>) => {
          const entity = ev.detail.id.split(":").slice(1).join(":");
          fireMoreInfo(this, entity);
        }}
        @output-select=${(ev: CustomEvent<{ id: string }>) =>
          this.onOutputSelect(ev.detail.id)}
        @output-more-info=${(ev: CustomEvent<{ entity: string }>) =>
          fireMoreInfo(this, ev.detail.entity)}
        @output-volume=${(ev: CustomEvent<{ entity: string; level: number }>) => {
          this.debouncedVolume(ev.detail.entity, ev.detail.level);
        }}
        @output-mute=${(ev: CustomEvent<{ entity: string; muted: boolean }>) => {
          if (this._hass) {
            void toggleMute(
              this._hass,
              this.pending,
              ev.detail.entity,
              ev.detail.muted,
              this.ttl(),
            ).then(() => this.refresh());
            this.refresh();
          }
        }}
        @browse-close=${() => {
          this.browsing = false;
        }}
        @browse-play=${(
          ev: CustomEvent<{ contentId: string; contentType: string }>,
        ) => {
          this.browsing = false;
          if (this._hass && this.config) {
            void playMedia(
              this._hass,
              this.config.input.entity,
              ev.detail.contentId,
              ev.detail.contentType,
            );
          }
        }}
      >
        <div class="header">
          <span class="title">${config.title ?? ""}</span>
          ${this.selection !== null
            ? html`
                <button
                  class="clear"
                  @click=${() => {
                    this.selection = null;
                  }}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                  Clear selection
                </button>
              `
            : nothing}
        </div>
        <mfc-graph
          .model=${model}
          .closure=${closure}
          .colors=${config.colors}
          .columns=${config.columns}
          .selection=${this.selection}
        ></mfc-graph>
        ${renderLegend(config.colors)}
        ${this.browsing
          ? html`
              <mfc-browse
                .hass=${this._hass}
                .entity=${config.input.entity}
              ></mfc-browse>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define("music-flow-card", MusicFlowCard);

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "music-flow-card",
  name: "Music Flow Card",
  description:
    "Audio Flow style routing: Music Assistant source, Chromecast stream, Yamaha and Monoprice zones, active outputs with volume.",
  documentationURL: "https://github.com/trooperthorn/ha_card_music",
});

const cardVersion =
  typeof __CARD_VERSION__ !== "undefined" ? __CARD_VERSION__ : "dev";

console.info(
  `%c MUSIC-FLOW-CARD %c v${cardVersion} `,
  "background: #444; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 0;",
  "background: #10b981; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 0;",
);

// Referenced so the module keeps the export shape bundlers expect.
export { MusicFlowCard, nodeId };
