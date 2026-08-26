/**
 * Configuration error rendering. All validation problems are listed
 * together so a config can be fixed in one edit instead of one error per
 * reload. A card with config errors performs no service calls.
 */

import { html, type TemplateResult } from "lit";

export function renderErrors(errors: string[]): TemplateResult {
  return html`
    <div class="config-errors">
      <div class="config-errors-title">
        music-flow-card: configuration problems
      </div>
      <ul>
        ${errors.map((e) => html`<li>${e}</li>`)}
      </ul>
    </div>
  `;
}
