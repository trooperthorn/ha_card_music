import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

// Build produces a single self-contained ESM file (Lit bundled, no CDN
// imports) because Home Assistant loads the card as one /local resource.
// The dev harness passes its root on the CLI: "vite serve dev".
export default defineConfig({
  define: {
    __CARD_VERSION__: JSON.stringify(pkg.version),
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
