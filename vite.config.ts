import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

// VERSION is the single source of truth for the shipped version (CalVer
// YYYY.MM.DD.V). package.json cannot hold it because npm requires SemVer
// in its version field, so package.json stays at an inert 0.0.0.
const version = readFileSync(new URL("./VERSION", import.meta.url), "utf8").trim();

// Build produces a single self-contained ESM file (Lit bundled, no CDN
// imports) because Home Assistant loads the card as one /local resource.
// The dev harness passes its root on the CLI: "vite serve dev".
export default defineConfig({
  define: {
    __CARD_VERSION__: JSON.stringify(version),
  },
  build: {
    target: "es2021",
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: "src/music-flow-card.ts",
      formats: ["es"],
      fileName: () => "music-flow-card.js",
    },
    rolldownOptions: {
      output: {
        // One self-contained file: Home Assistant loads a single resource.
        codeSplitting: false,
      },
    },
  },
  test: {
    dir: "tests",
    environment: "node",
  },
});
