/**
 * One node tile in the flow graph: icon, title, subtitle, state styling.
 * Fires "node-tap" on tap and "node-more-info" on long press; the card
 * decides what those mean per node kind.
 */

import { css, html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { attachPress } from "../ha-helpers";
import { tokens } from "../styles";
import type { GraphNode } from "../types";

export class MfcNode extends LitElement {
  @property({ attribute: false }) node!: GraphNode;
  @property({ type: Boolean }) dimmed = false;
  @property({ type: Boolean }) selected = false;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .tile {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: var(--mfc-radius);
        background: var(--mfc-node-bg);
        color: var(--mfc-text);
        cursor: pointer;
        transition:
          opacity 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        border: 1px solid transparent;
      }
      .tile:hover {
        background: var(--mfc-node-bg-active);
      }
      :host([data-dimmed]) .tile {
        opacity: var(--mfc-dim-opacity);
      }
      :host([data-selected]) .tile {
        border-color: var(--mfc-text-dim);
      }
      .tile.in-path {
        background: var(--mfc-node-bg-active);
      }
      .tile.off-path {
        opacity: 0.65;
      }
      .tile.unavailable {
        cursor: default;
        opacity: 0.45;
      }
      .tile.takeover {
        border-style: dashed;
        border-color: var(--mfc-text-dim);
      }
      .iconbox {
        position: relative;
        flex: none;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        background: rgba(127, 127, 127, 0.16);
        overflow: hidden;
      }
      .iconbox img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .iconbox ha-icon {
        color: var(--mfc-text-dim);
      }
      .tile.in-path .iconbox ha-icon {
        color: var(--mfc-text);
      }
      .text {
        min-width: 0;
        flex: 1;
      }
      .title {
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .subtitle {
        font-size: 11.5px;
        color: var(--mfc-text-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .badge {
        flex: none;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(127, 127, 127, 0.2);
        color: var(--mfc-text-dim);
      }
      .badge.warn {
        color: var(--mfc-warn);
      }
      .pending {
        flex: none;
        width: 12px;
        height: 12px;
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
    `,
  ];

  protected override firstUpdated(): void {
    attachPress(
      this,
      () => {
        if (!this.node.found || !this.node.available) {
          if (this.node.found) {
            this.emit("node-more-info");
          }
          return;
        }
        this.emit("node-tap");
      },
      () => this.emit("node-more-info"),
    );
  }

  protected override updated(): void {
    this.toggleAttribute("data-dimmed", this.dimmed);
    this.toggleAttribute("data-selected", this.selected);
  }

  private emit(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: { id: this.node.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const n = this.node;
    const classes = [
      "tile",
      n.inPath ? "in-path" : "",
      n.offPath ? "off-path" : "",
      !n.available ? "unavailable" : "",
      n.kind === "master" ? "takeover" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return html`
      <div class=${classes}>
        <div class="iconbox">
          ${n.artwork
            ? html`<img src=${n.artwork} alt="" />`
            : html`<ha-icon .icon=${n.icon}></ha-icon>`}
        </div>
        <div class="text">
          <div class="title">${n.name}</div>
          <div class="subtitle">${n.subtitle}</div>
        </div>
        ${!n.found
          ? html`<span class="badge warn" title="Entity not found">!</span>`
          : nothing}
        ${n.kind === "group" && n.memberTotal
          ? html`<span class="badge">${n.memberActive}/${n.memberTotal}</span>`
          : nothing}
        ${n.pending ? html`<span class="pending" title="Waiting for the device to confirm"></span>` : nothing}
      </div>
    `;
  }
}

customElements.define("mfc-node", MfcNode);
