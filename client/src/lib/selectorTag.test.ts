import { describe, expect, it } from "vitest";
import { resolveFinaleTag, sanitizeSelectorTag } from "./selectorTag";

describe("selector tag handoff", () => {
  it("preserves a normalized tag for the Level 2 terminal sequence", () => {
    expect(sanitizeSelectorTag("  junglist-5  ")).toBe("JUNGLIST-5");
  });

  it("keeps an intentionally blank tag blank so the terminal can run nameless", () => {
    expect(sanitizeSelectorTag("  !!!  ")).toBe("");
  });

  it("uses the Level 1 saved tag before any final-screen input", () => {
    expect(resolveFinaleTag("early-massive", "later-tag")).toBe("EARLY-MASSIV");
  });

  it("uses the final-screen tag only when no prior tag exists, or stays nameless when both are blank", () => {
    expect(resolveFinaleTag("", "final-massive")).toBe("FINAL-MASSIV");
    expect(resolveFinaleTag("", "   ")).toBe("");
  });
});
