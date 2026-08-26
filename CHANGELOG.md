# Changelog

## Unreleased

Initial implementation.

- Four-column signal-path graph (Inputs, Channels, Mixes, Outputs) with
  curved SVG links, click-to-trace selection, dimming, and a color legend.
- In-card Music Assistant media browser over the documented
  `media_player/browse_media` WebSocket command.
- Zone routing: turn_on then select_source with the configured feed name;
  `feed_aliases` maps dissimilar source naming across devices.
- Group nodes bound to media_player group helpers with partial-state
  completion; master takeover nodes for amplifier-firmware fan-out.
- Volume rows for active zones with percent, raw steps, or dB readouts.
- Optimistic display with TTL reconciliation sized for the Monoprice
  5 second poll.
- Config validation that collects every error and renders them together.
- Dev harness with mock hass, slow-confirm simulation, and scenarios;
  vitest coverage of the pure modules; build, lint, HACS, and release
  workflows.
