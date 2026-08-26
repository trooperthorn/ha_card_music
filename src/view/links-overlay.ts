/**
 * SVG link rendering. Links are cubic beziers from the right edge of the
 * source tile to the left edge of the target tile, with the Audio Flow
 * endpoint dots. Coordinates come from the measure pass in graph-view.
 */

import { svg, type TemplateResult } from "lit";
import type { ColorsConfig, GraphLink } from "../types";
import { DEFAULT_COLORS } from "../types";

export interface MeasuredLink {
  link: GraphLink;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type LinkEmphasis = "path" | "idle" | "faded";

export function linkColor(
  link: GraphLink,
  colors: ColorsConfig | undefined,
): string {
  const c = { ...DEFAULT_COLORS, ...colors };
  switch (link.kind) {
    case "input":
      return c.input_link;
    case "channel":
      return c.channel_link;
    case "output":
      return c.output_link;
  }
}

export function renderLink(
  m: MeasuredLink,
  emphasis: LinkEmphasis,
  colors: ColorsConfig | undefined,
): TemplateResult {
  const { x1, y1, x2, y2 } = m;
  const dx = Math.max(24, (x2 - x1) / 2);
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  const bright = emphasis === "path";
  const stroke = bright ? linkColor(m.link, colors) : "var(--mfc-idle-link)";
  const width = bright ? 3 : 1.25;
  const opacity = emphasis === "faded" ? 0.35 : 1;
  const dash = m.link.muted && bright ? "6 6" : undefined;
  return svg`
    <g opacity=${opacity}>
      <path
        d=${d}
        fill="none"
        stroke=${stroke}
        stroke-width=${width}
        stroke-linecap="round"
        stroke-dasharray=${dash ?? ""}
      ></path>
      ${
        bright
          ? svg`
            <circle cx=${x1} cy=${y1} r="4" fill=${stroke}></circle>
            <circle cx=${x2} cy=${y2} r="4" fill=${stroke}></circle>
          `
          : ""
      }
    </g>
  `;
}
