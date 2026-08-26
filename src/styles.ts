/**
 * Shared design tokens. The card follows the Audio Flow look: dark tiles,
 * pill column headers, thin curved links that light up in the path colors.
 * Values defer to Home Assistant theme variables where they exist so the
 * card sits naturally on themed dashboards, with dark fallbacks tuned to
 * the reference design.
 */

import { css } from "lit";

export const tokens = css`
  :host {
    --mfc-bg: var(--ha-card-background, var(--card-background-color, #1c1c1e));
    --mfc-node-bg: var(--mfc-node-background, rgba(127, 127, 127, 0.14));
    --mfc-node-bg-active: var(--mfc-node-background-active, rgba(127, 127, 127, 0.24));
    --mfc-text: var(--primary-text-color, #e7e7ea);
    --mfc-text-dim: var(--secondary-text-color, #9a9aa0);
    --mfc-radius: 12px;
    --mfc-idle-link: var(--divider-color, rgba(127, 127, 127, 0.35));
    --mfc-dim-opacity: 0.32;
    --mfc-warn: var(--warning-color, #f59e0b);
    --mfc-error: var(--error-color, #ef4444);
  }
`;

export const pillHeader = css`
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 8px;
    background: var(--mfc-node-bg);
    color: var(--mfc-text-dim);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    user-select: none;
  }
`;
