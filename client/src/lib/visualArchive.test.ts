import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const collageStyles = readFileSync(resolve(process.cwd(), "client/src/visuals-archive-collage.css"), "utf8");

describe("Visuals Archive collage", () => {
  it("keeps the real archive section and lightbox contract", () => {
    expect(homeSource).toContain('id="visuals"');
    expect(homeSource).toContain("className=\"art-lightbox-trigger\"");
    expect(homeSource).toContain("ragga-revival_bc56c618.png");
    expect(homeSource).toContain("mix-cover-cfmu-hostile-airwaves_9603abc2.webp");
    expect(homeSource).toContain("png-review-deep-on-rolling_481214e6.webp");
    expect(homeSource).toContain("selectah-splash-art-direction_4d1c250f.webp");
    expect(homeSource).toContain("5d-selector-level-two-detailed-stage_89e2157b.webp");
    expect(homeSource).not.toContain('src: "/assets/placeholder');
  });

  it("protects the hard-framed, asymmetric, mobile-safe archive composition", () => {
    expect(collageStyles).toContain("grid-template-columns: repeat(12, minmax(0, 1fr))");
    expect(collageStyles).toContain("repeating-linear-gradient(0deg, rgba(0,0,0,.15)");
    expect(collageStyles).toContain("background: #0A0A12");
    expect(collageStyles).toContain("box-shadow: 6px 6px 0 #FF2D95");
    expect(collageStyles).toContain("@media (max-width: 650px)");
    expect(collageStyles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(collageStyles).toContain('font: 900 .55rem/1.15 "Press Start 2P"');
  });
});
