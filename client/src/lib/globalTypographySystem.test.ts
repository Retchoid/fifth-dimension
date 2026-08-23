import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const clientRoot = resolve(process.cwd(), "client/src");
const readClientSource = (path: string) => readFileSync(resolve(clientRoot, path), "utf8");

function readCssTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return [readCssTree(path)];
    return entry.name.endsWith(".css") ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

describe("global typography system", () => {
  it("keeps the public site on the two approved font families", () => {
    const typography = readClientSource("global-typography-system.css");
    const base = readClientSource("index.css");
    const allCss = readCssTree(clientRoot);

    expect(typography).toContain('--font-headline: "Press Start 2P", monospace');
    expect(typography).toContain('--font-body: "Courier New", monospace');
    expect(typography).toContain("body *");
    expect(typography).toContain("text-transform: uppercase !important");
    expect(typography).toContain("letter-spacing: var(--type-track) !important");
    expect(base).not.toContain("Space Grotesk");
    expect(base).not.toContain("Bebas Neue");
    expect(allCss).not.toMatch(/\b(system-ui|-apple-system|sans-serif|inter|roboto|helvetica|arial)\b/i);
  });
});
