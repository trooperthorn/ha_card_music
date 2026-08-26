/**
 * One active output: zone name, volume slider, mute, readout. Controls are
 * hidden (not disabled) when the entity's current supported_features lack
 * them, because yamaha_ynca recomputes features when inputs change.
 */

import { css, html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { tokens } from "../styles";
import type { OutputRow } from "../types";

export class MfcOutput extends LitElement {
  @property({ attribute: false }) row!: OutputRow;
  @property({ type: Boolean }) dimmed = false;
  @property({ type: Boolean }) selected = false;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        border-radius: var(--mfc-radius);
        background: var(--mfc-node-bg-active);
        color: var(--mfc-text);
        transition: opacity 0.2s ease;
        border: 1px solid transparent;
      }
      :host([data-dimmed]) .row {
        opacity: var(--mfc-dim-opacity);
      }
      :host([data-selected]) .row {
        border-color: var(--mfc-text-dim);
      }
      .top {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
      .top ha-icon {
        color: var(--mfc-text-dim);
        --mdc-icon-size: 18px;
      }
      .name {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .readout {
        font-size: 11px;
        color: var(--mfc-text-dim);
        white-space: nowrap;
      }
      .pending {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--mfc-text-dim);
        border-top-color: transparent;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      input[type="range"] {
        flex: 1;
        min-width: 0;
        accent-color: var(--mfc-output-accent, #10b981);
        cursor: pointer;
      }
      button.mute {
        flex: none;
        border: none;
        background: none;
        color: var(--mfc-text-dim);
        cursor: pointer;
        padding: 2px;
        display: flex;
      }
      button.mute.muted {
        color: var(--mfc-warn);
      }
    `,
  ];

  protected override updated(): void {
    this.toggleAttribute("data-dimmed", this.dimmed);
    this.toggleAttribute("data-selected", this.selected);
  }

  private emit(name: string, detail: Record<string, unknown>): void {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }

  private onSlider(ev: Event): void {
    const value = Number((ev.target as HTMLInputElement).value);
    this.emit("output-volume", { entity: this.row.entity, level: value / 100 });
  }

  protected override render() {
    const r = this.row;
    const percent = Math.round(r.volumeLevel * 100);
    return html`
      <div class="row">
        <div
          class="top"
          @click=${() => this.emit("output-select", { id: r.id })}
          @contextmenu=${(ev: Event) => {
            ev.preventDefault();
            this.emit("output-more-info", { entity: r.entity });
          }}
        >
          <ha-icon .icon=${r.icon}></ha-icon>
          <span class="name">${r.name}</span>
          ${r.pending ? html`<span class="pending"></span>` : nothing}
          <span class="readout">
            ${r.muted ? "Muted" : `Vol ${percent}%`}${r.readout && !r.muted
              ? ` · ${r.readout}`
              : ""}
          </span>
        </div>
        <div class="controls">
          ${r.hasVolume
            ? html`<input
                type="range"
                min="0"
                max="100"
                step="1"
                .value=${String(percent)}
                @input=${this.onSlider}
                aria-label="Volume for ${r.name}"
              />`
            : html`<span class="readout">Volume not controllable right now</span>`}
          ${r.hasMute
            ? html`<button
                class="mute ${r.muted ? "muted" : ""}"
                title=${r.muted ? "Unmute" : "Mute"}
                @click=${() =>
                  this.emit("output-mute", {
                    entity: r.entity,
                    muted: r.muted,
                  })}
              >
                <ha-icon
                  .icon=${r.muted ? "mdi:volume-off" : "mdi:volume-high"}
                ></ha-icon>
              </button>`
            : nothing}
        </div>
      </div>
    `;
  }
}

customElements.define("mfc-output", MfcOutput);
