import { describe, expect, it } from "vitest";
import { cardSizeFor, getConfigForm } from "../src/editor-form";
import { linkColor } from "../src/view/links-overlay";
import { DEFAULT_COLORS, type GraphLink } from "../src/types";

const link = (kind: GraphLink["kind"]): GraphLink => ({
  fromId: "a",
  toId: "b",
  kind,
  active: true,
  muted: false,
});

describe("view helpers", () => {
  it("linkColor uses defaults and overrides", () => {
    expect(linkColor(link("input"), undefined)).toBe(DEFAULT_COLORS.input_link);
    expect(linkColor(link("output"), { output_link: "#fff" })).toBe("#fff");
  });

  it("card size grows with zones", () => {
    expect(cardSizeFor(undefined)).toBe(5);
    expect(cardSizeFor({ zones: [1, 2, 3, 4, 5, 6] })).toBeGreaterThan(cardSizeFor({ zones: [1] }));
  });

  it("config form covers top-level options, not zones", () => {
    const names = getConfigForm().schema.map((s) => s.name);
    expect(names).toEqual(
      expect.arrayContaining(["title", "input", "channel", "feed_aliases", "columns", "colors"]),
    );
    expect(names).not.toContain("zones");
    expect(getConfigForm().computeLabel({ name: "feed_aliases" })).toBe("Feed aliases");
  });
});
