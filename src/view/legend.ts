/**
 * Bottom color legend, matching the Audio Flow reference: one swatch per
 * link stage plus the muted and not-in-path line styles.
 */

import { html, type TemplateResult } from "lit";
import type { ColorsConfig } from "../types";
import { DEFAULT_COLORS } from "../types";

export function renderLegend(colors: ColorsConfig | undefined): TemplateResult {
  const c = { ...DEFAULT_COLORS, ...colors };
  const item = (label: string, color: string, dashed = false) => html`
    <span class="legend-item">
      <svg width="26" height="8" aria-hidden="true">
        <line
          x1="1"
          y1="4"
          x2="25"
          y2="4"
          stroke=${color}
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray=${dashed ? "4 4" : ""}
        ></line>
      </svg>
      ${label}
    </span>
  `;
  return html`
    <div class="legend">
      ${item("Source to stream", c.input_link)}
      ${item("Stream to zone", c.channel_link)}
      ${item("Zone to output", c.output_link)}
      ${item("Muted", "var(--mfc-text-dim)", true)}
      ${item("Not in path", "var(--mfc-idle-link)")}
    </div>
  `;
}
