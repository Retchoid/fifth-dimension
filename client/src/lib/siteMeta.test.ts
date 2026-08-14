import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("5th Dimension website metadata", () => {
  it("uses the 5th Dimension title in the active HTML shell", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../../index.html"), "utf8");
    expect(html).toContain("<title>5th Dimension (Bobby Bass) | Bass Transmission & Selectah Showdown</title>");
    expect(html).not.toMatch(/former workspace|legacy workspace/i);
  });
});
