/**
 * In-card media browser for the Music Assistant player. Uses the
 * documented media_player/browse_media WebSocket command rather than Home
 * Assistant's internal browse dialog, which is not stable public API for
 * custom cards. Content is whatever the user configured inside Music
 * Assistant (Spotify, local media, radio).
 */

import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { browseMedia } from "../ha-helpers";
import { tokens } from "../styles";
import type { BrowseMediaItem, HomeAssistant } from "../types";

interface Level {
  title: string;
  item?: BrowseMediaItem;
  children: BrowseMediaItem[];
}

export class MfcBrowse extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() entity = "";

  @state() private stack: Level[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;

  static override styles = [
    tokens,
    css`
      :host {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        border-radius: var(--ha-card-border-radius, 12px);
        z-index: 5;
      }
      .panel {
        display: flex;
        flex-direction: column;
        width: min(440px, 92%);
        max-height: 88%;
        border-radius: var(--mfc-radius);
        background: var(--mfc-bg);
        color: var(--mfc-text);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--mfc-idle-link);
      }
      .head button {
        border: none;
        background: none;
        color: var(--mfc-text);
        cursor: pointer;
        display: flex;
        padding: 4px;
      }
      .head .title {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .list {
        overflow-y: auto;
        padding: 6px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: none;
        background: none;
        color: var(--mfc-text);
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        font: inherit;
      }
      .item:hover {
        background: var(--mfc-node-bg);
      }
      .thumb {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 6px;
        background: var(--mfc-node-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .item .label {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
      }
      .item ha-icon {
        color: var(--mfc-text-dim);
      }
      .status {
        padding: 20px;
        text-align: center;
        color: var(--mfc-text-dim);
        font-size: 13px;
      }
      .status.error {
        color: var(--mfc-error);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    void this.open();
  }

  private async open(): Promise<void> {
    this.stack = [];
    await this.load(undefined);
  }

  private async load(item: BrowseMediaItem | undefined): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const result = await browseMedia(
        this.hass,
        this.entity,
        item?.media_content_id,
        item?.media_content_type,
      );
      this.stack = [
        ...this.stack,
        {
          title: result.title || item?.title || "Media",
          item: result,
          children: result.children ?? [],
        },
      ];
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.loading = false;
    }
  }

  private back(): void {
    if (this.stack.length > 1) {
      this.stack = this.stack.slice(0, -1);
    } else {
      this.close();
    }
  }

  private close(): void {
    this.dispatchEvent(
      new CustomEvent("browse-close", { bubbles: true, composed: true }),
    );
  }

  private pick(item: BrowseMediaItem): void {
    if (item.can_expand) {
      void this.load(item);
      return;
    }
    if (item.can_play) {
      this.dispatchEvent(
        new CustomEvent("browse-play", {
          detail: {
            contentId: item.media_content_id,
            contentType: item.media_content_type,
          },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override render() {
    const level = this.stack[this.stack.length - 1];
    return html`
      <div class="panel" @click=${(ev: Event) => ev.stopPropagation()}>
        <div class="head">
          <button title="Back" @click=${() => this.back()}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span class="title">${level?.title ?? "Browse media"}</span>
          <button title="Close" @click=${() => this.close()}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="list">
          ${this.error
            ? html`<div class="status error">Browse failed: ${this.error}</div>`
            : nothing}
          ${this.loading
            ? html`<div class="status">Loading…</div>`
            : nothing}
          ${!this.loading && !this.error && level
            ? level.children.length === 0
              ? html`<div class="status">Nothing here</div>`
              : level.children.map(
                  (item) => html`
                    <button class="item" @click=${() => this.pick(item)}>
                      <span class="thumb">
                        ${item.thumbnail
                          ? html`<img src=${item.thumbnail} alt="" />`
                          : html`<ha-icon
                              icon=${item.can_expand
                                ? "mdi:folder-music"
                                : "mdi:music-note"}
                            ></ha-icon>`}
                      </span>
                      <span class="label">${item.title}</span>
                      <ha-icon
                        icon=${item.can_expand
                          ? "mdi:chevron-right"
                          : "mdi:play-circle-outline"}
                      ></ha-icon>
                    </button>
                  `,
                )
            : nothing}
        </div>
      </div>
    `;
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    this.addEventListener("click", () => this.close());
    return root;
  }
}

customElements.define("mfc-browse", MfcBrowse);
