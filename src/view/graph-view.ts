/**
 * The four-column flow graph: pill headers, node tiles, output rows, and
 * the SVG link overlay. Layout is CSS grid; link anchor points are measured
 * from the rendered tiles (rAF batched, re-measured on resize and after
 * fonts load) so the beziers always meet the tile edges.
 */

import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { pillHeader, tokens } from "../styles";
import type { ColorsConfig, ColumnsConfig, GraphModel } from "../types";
import { DEFAULT_COLUMNS } from "../types";
import {
  renderLink,
  type LinkEmphasis,
  type MeasuredLink,
} from "./links-overlay";
import "./node-card";
import "./output-row";

interface Anchors {
  /** node id to [rightEdgeX, midY] and [leftEdgeX, midY] in container coordinates. */
  right: Map<string, [number, number]>;
  left: Map<string, [number, number]>;
  width: number;
  height: number;
}

export class MfcGraph extends LitElement {
  @property({ attribute: false }) model!: GraphModel;
  @property({ attribute: false }) closure: Set<string> | null = null;
  @property({ attribute: false }) colors?: ColorsConfig;
  @property({ attribute: false }) columns?: ColumnsConfig;
  @property({ attribute: false }) selection: string | null = null;

  @state() private anchors: Anchors | null = null;

  private resizeObserver?: ResizeObserver;
  private measureQueued = false;

  static override styles = [
    tokens,
    pillHeader,
    css`
      :host {
        display: block;
      }
      .wrap {
        position: relative;
      }
      .grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px 56px;
        z-index: 1;
      }
      .col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .col-header {
        display: flex;
        justify-content: center;
        margin-bottom: 2px;
      }
      .empty {
        font-size: 11.5px;
        color: var(--mfc-text-dim);
        text-align: center;
        padding: 10px 4px;
      }
      svg.links {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }
      @media (max-width: 640px) {
        .grid {
          gap: 12px 28px;
        }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.queueMeasure());
    document.fonts?.ready?.then(() => this.queueMeasure());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    const wrap = this.renderRoot.querySelector(".wrap");
    if (wrap && this.resizeObserver) {
      this.resizeObserver.observe(wrap);
    }
  }

  protected override updated(): void {
    this.queueMeasure();
  }

  private queueMeasure(): void {
    if (this.measureQueued) {
      return;
    }
    this.measureQueued = true;
    requestAnimationFrame(() => {
      this.measureQueued = false;
      this.measure();
    });
  }

  private measure(): void {
    const wrap = this.renderRoot.querySelector<HTMLElement>(".wrap");
    if (!wrap) {
      return;
    }
    const base = wrap.getBoundingClientRect();
    const right = new Map<string, [number, number]>();
    const left = new Map<string, [number, number]>();
    for (const el of this.renderRoot.querySelectorAll<HTMLElement>(
      "[data-node-id]",
    )) {
      const id = el.dataset.nodeId;
      if (!id) {
        continue;
      }
      const r = el.getBoundingClientRect();
      const midY = r.top + r.height / 2 - base.top;
      right.set(id, [r.right - base.left, midY]);
      left.set(id, [r.left - base.left, midY]);
    }
    const next: Anchors = {
      right,
      left,
      width: base.width,
      height: base.height,
    };
    // Avoid render loops: only update when something moved.
    if (!this.anchorsEqual(this.anchors, next)) {
      this.anchors = next;
    }
  }

  private anchorsEqual(a: Anchors | null, b: Anchors): boolean {
    if (!a || a.width !== b.width || a.height !== b.height) {
      return false;
    }
    if (a.right.size !== b.right.size || a.left.size !== b.left.size) {
      return false;
    }
    for (const [id, [x, y]] of b.right) {
      const prev = a.right.get(id);
      if (!prev || Math.abs(prev[0] - x) > 0.5 || Math.abs(prev[1] - y) > 0.5) {
        return false;
      }
    }
    for (const [id, [x, y]] of b.left) {
      const prev = a.left.get(id);
      if (!prev || Math.abs(prev[0] - x) > 0.5 || Math.abs(prev[1] - y) > 0.5) {
        return false;
      }
    }
    return true;
  }

  private measuredLinks(): MeasuredLink[] {
    const anchors = this.anchors;
    if (!anchors) {
      return [];
    }
    const out: MeasuredLink[] = [];
    for (const link of this.model.links) {
      const from = anchors.right.get(link.fromId);
      const to = anchors.left.get(link.toId);
      if (from && to) {
        out.push({ link, x1: from[0], y1: from[1], x2: to[0], y2: to[1] });
      }
    }
    return out;
  }

  private emphasis(m: MeasuredLink): LinkEmphasis {
    if (this.closure) {
      return this.closure.has(m.link.fromId) && this.closure.has(m.link.toId)
        ? "path"
        : "faded";
    }
    return m.link.active ? "path" : "idle";
  }

  private dimmed(id: string): boolean {
    return this.closure !== null && !this.closure.has(id);
  }

  protected override render() {
    const cols = { ...DEFAULT_COLUMNS, ...this.columns };
    const m = this.model;
    return html`
      <div class="wrap">
        <svg class="links" aria-hidden="true">
          ${this.measuredLinks().map((ml) =>
            renderLink(ml, this.emphasis(ml), this.colors),
          )}
        </svg>
        <div class="grid">
          <div class="col">
            <div class="col-header"><span class="pill">${cols.inputs}</span></div>
            <mfc-node
              data-node-id=${m.input.id}
              .node=${m.input}
              .dimmed=${this.dimmed(m.input.id)}
              .selected=${this.selection === m.input.id}
            ></mfc-node>
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${cols.channels}</span></div>
            <mfc-node
              data-node-id=${m.channel.id}
              .node=${m.channel}
              .dimmed=${this.dimmed(m.channel.id)}
              .selected=${this.selection === m.channel.id}
            ></mfc-node>
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${cols.mixes}</span></div>
            ${m.mixes.map(
              (node) => html`
                <mfc-node
                  data-node-id=${node.id}
                  .node=${node}
                  .dimmed=${this.dimmed(node.id)}
                  .selected=${this.selection === node.id}
                ></mfc-node>
              `,
            )}
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${cols.outputs}</span></div>
            ${m.outputs.length === 0
              ? html`<div class="empty">No active outputs</div>`
              : m.outputs.map(
                  (row) => html`
                    <mfc-output
                      data-node-id=${row.id}
                      .row=${row}
                      .dimmed=${this.dimmed(row.id)}
                      .selected=${this.selection === row.id}
                    ></mfc-output>
                  `,
                )}
            ${nothing}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("mfc-graph", MfcGraph);
