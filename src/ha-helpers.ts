/**
 * Small Home Assistant frontend helpers: browse_media over WebSocket, the
 * more-info dialog event, and a debounce used by the volume sliders.
 */

import type { BrowseMediaItem, HomeAssistant } from "./types";

/**
 * Browse a media_player's media tree. Called without content id/type it
 * returns the root; children carry the ids to drill down with.
 */
export function browseMedia(
  hass: HomeAssistant,
  entityId: string,
  contentId?: string,
  contentType?: string,
): Promise<BrowseMediaItem> {
  const msg: Record<string, unknown> = {
    type: "media_player/browse_media",
    entity_id: entityId,
  };
  if (contentId !== undefined) {
    msg.media_content_id = contentId;
  }
  if (contentType !== undefined) {
    msg.media_content_type = contentType;
  }
  return hass.callWS<BrowseMediaItem>(msg);
}

/** Open Home Assistant's standard more-info dialog for an entity. */
export function fireMoreInfo(element: HTMLElement, entityId: string): void {
  element.dispatchEvent(
    new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }),
  );
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };
}

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

/**
 * Attach tap and long-press handling to an element. A press held for
 * LONG_PRESS_MS fires onLongPress and suppresses the tap; pointer movement
 * beyond a small threshold cancels both (it is a scroll, not a press).
 */
export function attachPress(
  el: HTMLElement,
  onTap: () => void,
  onLongPress?: () => void,
): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let longFired = false;
  let startX = 0;
  let startY = 0;

  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  el.addEventListener("pointerdown", (ev) => {
    longFired = false;
    startX = ev.clientX;
    startY = ev.clientY;
    if (onLongPress) {
      clear();
      timer = setTimeout(() => {
        longFired = true;
        onLongPress();
      }, LONG_PRESS_MS);
    }
  });
  el.addEventListener("pointermove", (ev) => {
    if (
      Math.abs(ev.clientX - startX) > MOVE_CANCEL_PX ||
      Math.abs(ev.clientY - startY) > MOVE_CANCEL_PX
    ) {
      clear();
    }
  });
  el.addEventListener("pointerup", clear);
  el.addEventListener("pointerleave", clear);
  el.addEventListener("pointercancel", clear);
  el.addEventListener("click", (ev) => {
    if (longFired) {
      ev.stopPropagation();
      ev.preventDefault();
      longFired = false;
      return;
    }
    onTap();
  });
}
