/**
 * Dev harness entry: defines a minimal ha-icon stand-in (Home Assistant
 * provides the real one at runtime), builds the mock hass, and mounts the
 * card with the worked-example configuration against pickable scenarios.
 */

import "../src/music-flow-card";
import { MockHass } from "./mock-hass";
import { BROWSE_TREE, scenarios, SLOW_ENTITIES } from "./scenarios";

// Minimal ha-icon substitute so tiles render in the harness. It shows a
// small glyph based on the icon name instead of the real MDI artwork.
if (!customElements.get("ha-icon")) {
  class DevHaIcon extends HTMLElement {
    set icon(value: string) {
      this.setAttribute("icon", value ?? "");
    }
    static get observedAttributes(): string[] {
      return ["icon"];
    }
    attributeChangedCallback(): void {
      this.renderGlyph();
    }
    connectedCallback(): void {
      this.style.display = "inline-flex";
      this.style.width = "20px";
      this.style.height = "20px";
      this.style.alignItems = "center";
      this.style.justifyContent = "center";
      this.renderGlyph();
    }
    private renderGlyph(): void {
      const icon = this.getAttribute("icon") ?? "";
      const glyphs: Record<string, string> = {
        "mdi:music-box-multiple": "🎵",
        "mdi:cast-audio": "📡",
        "mdi:speaker": "🔊",
        "mdi:speaker-multiple": "🔊",
        "mdi:volume-high": "🔊",
        "mdi:volume-off": "🔇",
        "mdi:close": "✕",
        "mdi:arrow-left": "←",
        "mdi:chevron-right": "›",
        "mdi:play-circle-outline": "▶",
        "mdi:folder-music": "📁",
        "mdi:music-note": "♪",
        "mdi:home-floor-1": "🏠",
      };
      this.textContent = glyphs[icon] ?? "•";
    }
  }
  customElements.define("ha-icon", DevHaIcon);
}

const CONFIG = {
  type: "custom:music-flow-card",
  title: "Whole Home Audio",
  input: { entity: "media_player.music_assistant_living" },
  channel: { entity: "media_player.chromecast_audio" },
  feed_aliases: ["AUDIO2", "Source 2"],
  zones: [
    {
      entity: "media_player.receiver_main",
      name: "Great Room",
    },
    { entity: "media_player.receiver_zone2", name: "Office" },
    { entity: "media_player.receiver_zone3", name: "Patio" },
    {
      entity: "media_player.amp_zone_11",
      name: "Kitchen",
      volume: { display: "raw", max: 38 },
    },
    {
      entity: "media_player.amp_zone_12",
      name: "Dining",
      volume: { display: "raw", max: 38 },
    },
    {
      entity: "media_player.amp_zone_13",
      name: "Garage",
      volume: { display: "raw", max: 38 },
    },
  ],
  groups: [{ entity: "media_player.downstairs", name: "Downstairs" }],
  masters: [
    {
      entity: "media_player.unit_1_master",
      name: "Amp All Zones",
      feed_source: "Source 2",
    },
  ],
};

const BAD_CONFIG = {
  type: "custom:music-flow-card",
  input: {},
  zones: [{ entity: "light.kitchen", volume: { display: "raw" } }],
  typo_key: true,
};

interface LovelaceCardElement extends HTMLElement {
  setConfig(config: unknown): void;
  hass: unknown;
}

const hass = new MockHass(SLOW_ENTITIES, BROWSE_TREE);
const stage = document.getElementById("stage")!;
const toolbar = document.getElementById("toolbar")!;

const card = document.createElement("music-flow-card") as LovelaceCardElement;
stage.appendChild(card);

hass.onChange = () => {
  // Real Home Assistant hands the card a new hass object on every update;
  // the card relies on that to detect watched-entity changes.
  card.hass = {
    states: hass.states,
    callService: hass.callService.bind(hass),
    callWS: hass.callWS.bind(hass),
  };
};

function activate(name: string): void {
  for (const btn of toolbar.querySelectorAll("button")) {
    btn.classList.toggle("active", btn.dataset.name === name);
  }
  const errorBox = document.getElementById("config-error")!;
  errorBox.textContent = "";
  errorBox.style.display = "none";
  if (name === "bad-config") {
    // Home Assistant catches the setConfig throw and renders its error
    // card; the harness mimics that by displaying the message.
    try {
      card.setConfig(BAD_CONFIG);
    } catch (err) {
      errorBox.textContent = err instanceof Error ? err.message : String(err);
      errorBox.style.display = "block";
    }
    return;
  }
  card.setConfig(CONFIG);
  hass.load(scenarios[name]!());
}

for (const name of [...Object.keys(scenarios), "bad-config"]) {
  const btn = document.createElement("button");
  btn.textContent = name;
  btn.dataset.name = name;
  btn.addEventListener("click", () => activate(name));
  toolbar.appendChild(btn);
}

activate("playing-two-zones");
