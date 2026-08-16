import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const promoStyles = readFileSync(resolve(process.cwd(), "client/src/exclusive-dubplate-promo.css"), "utf8");

describe("Jersh In Case dubplate card", () => {
  it("preserves the release identity and session-gated controls", () => {
    expect(homeSource).toContain('id="exclusive"');
    expect(homeSource).toContain('id="exclusive-title"');
    expect(homeSource).toContain("EXCLUSIVE_RELEASE.title");
    expect(homeSource).toContain("5TH DIMENSION · SKAVO");
    expect(homeSource).toContain("FEATURING MC MESTUP");
    expect(homeSource).toContain("downloadUnlocked");
    expect(homeSource).toContain("exclusive-listen-button");
    expect(homeSource).toContain("exclusive-download");
    expect(homeSource).toContain("download=\"Jersh In Case — 5th Dimension, Skavo featuring MC Mestup.mp3\"");
    expect(homeSource).toContain("exclusive-share-button");
  });

  it("protects the prominent hard-edged dubplate treatment and mobile stack", () => {
    expect(promoStyles).toContain("5D DUBPLATE / PLAY SIDE A");
    expect(promoStyles).toContain("box-shadow: 10px 10px 0 #00D4FF, 16px 16px 0 #FF2D95");
    expect(promoStyles).toContain("background: #FF2D95 !important");
    expect(promoStyles).toContain("45 RPM / DIRECT FROM THE LOW END");
    expect(promoStyles).toContain("@media (max-width: 760px)");
    expect(promoStyles).toContain("grid-template-columns: 1fr");
  });
});
