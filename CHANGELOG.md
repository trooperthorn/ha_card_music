# Changelog

## 2026.08.26.1

HACS compliance fixes. Adding the repository to HACS failed with
"Repository structure is not compliant" because the release for the tag
carried no assets (the release workflow's version check refused the
CalVer tag against a SemVer package.json) and the built file was not in
the git tree either.

- Versioning is now CalVer `vYYYY.MM.DD.V` with the root `VERSION` file
  as the single source of truth; `package.json` stays at an inert 0.0.0
  (npm requires SemVer there). `npm run release -- <version>` keeps
  VERSION, dist, the tag, and the release in lockstep.
- `dist/music-flow-card.js` is committed alongside release assets, with
  a CI job that fails when the committed file drifts from a fresh build.
- The release workflow uploads into an already existing release instead
  of failing, verifies the tag against VERSION, and has a manual
  workflow_dispatch fallback.
- `setConfig` now throws on invalid configuration per the Home Assistant
  custom card contract, listing every collected problem in the message.
- Added `getGridOptions` for sections view sizing.

## Initial implementation

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
