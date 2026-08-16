import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "client/src");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const homeSource = read("pages/Home.tsx");
const typography = read("global-typography-system.css");
const gameVisuals = read("game-visual-system.css");
const hazardMaster = read("hazard-master-style.css");
const journey = read("site-journey-flow.css");
const gameplayClarity = read("gameplay-clarity.css");
const fallingItemsRenderFix = read("falling-items-render-fix.css");
const mobileSiteRepair = read("mobile-site-repair.css");
const mainSource = read("main.tsx");

const publicSources = [
  read("index.css"),
  read("global-typography-system.css"),
  read("visuals-archive-collage.css"),
  read("selector-profile-zine.css"),
  read("exclusive-dubplate-promo.css"),
  read("booking-frequency-terminal.css"),
  read("site-journey-flow.css"),
].join("\n");

describe("Task 7 final consistency contract", () => {
  it("uses only the approved public font families", () => {
    expect(publicSources).toContain("Press Start 2P");
    expect(publicSources).toContain("Courier New");
    expect(publicSources).not.toMatch(/sans-serif|Arial|Helvetica|system-ui/i);
    expect(typography).toContain("--font-display: \"Press Start 2P\"");
    expect(typography).toContain("--font-body: \"Courier New\"");
  });

  it("preserves the sprite and overlay contracts", () => {
    expect(gameVisuals).toContain("mix-blend-mode:normal!important");
    expect(gameVisuals).toContain("mask-image:none!important");
    expect(gameVisuals).toContain("filter:drop-shadow(3px 4px 0 #000)!important");
    expect(hazardMaster).toContain("#FF2D95");
    expect(hazardMaster).toContain("#00D4FF");
    expect(hazardMaster).toContain("repeating-linear-gradient");
    expect(hazardMaster).toContain("Courier New");
  });

  it("keeps the journey, archive, release, booking, and arcade hooks intact", () => {
    expect(homeSource).toContain('className="hero"');
    expect(homeSource).toContain('id="visuals"');
    expect(homeSource).toContain('id="exclusive"');
    expect(homeSource).toContain('id="booking"');
    expect(homeSource).toContain('id="selectah-showdown"');
    expect(homeSource).toContain("nav-arcade-link");
    expect(homeSource).toContain('["Arcade", "#selectah-showdown"]');
    expect(homeSource).toContain("five-d-playa");
    expect(homeSource).toContain("art-lightbox-trigger");
    expect(homeSource).toContain("exclusive-listen-button");
    expect(homeSource).toContain("booking-submit");
    expect(read("components/DjMiniGame.tsx")).toContain("selector-dj-rear-runner-transparent_35d3ab26.png");
    expect(journey).toContain("ROOM 01 / TRANSMISSION BAY");
    expect(journey).toContain("ROOM 06 / OPEN CHANNEL");
  });

  it("keeps the development scene verifier matrix complete", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    for (const scene of ["level-two-arrival", "first-bonus", "afterparty-bonus", "unlock", "thrown", "loss", "game-over"]) {
      expect(gameSource).toContain(`sceneVerificationMode === "${scene}"`);
    }
    expect(gameSource).toContain('["rewind", "wheel", "police", "crowd", "pill", "crate", "headphones", "boh", "riddim"]');
    expect(gameSource).toContain("rewardDuration = holdSequenceDebugEnabled ? 25000");
    expect(gameSource).toContain("showComboReaction: (kind) =>");
  });

  it("holds only the development loss verifier at a readable frame", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain('loss-curb-overlay${heldLossPreview ? " viewport-verify-hold" : ""}');
    expect(gameplayClarity).toContain(".loss-curb-overlay.viewport-verify-hold");
    expect(gameplayClarity).toContain("animation-delay: -1.25s !important");
    expect(gameSource).toContain("if (lossVerificationHold) return");
  });

  it("protects the complete falling-item render and state contract", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(mainSource.indexOf('import "./site-journey-flow.css";')).toBeLessThan(mainSource.indexOf('import "./falling-items-render-fix.css";'));
    expect(mainSource.indexOf('import "./falling-items-render-fix.css";')).toBeLessThan(mainSource.indexOf('import "./mobile-site-repair.css";'));
    expect(mobileSiteRepair).toContain("@media (max-width: 650px)");
    expect(mobileSiteRepair).toContain(".arcade-cabinet-bezel");
    expect(mobileSiteRepair).toContain(".game-viewport");
    expect(mobileSiteRepair).toContain(".hazard-splash");
    expect(mobileSiteRepair).toContain(".loss-curb-copy");
    expect(mobileSiteRepair).toContain(".header-brand");
    expect(mobileSiteRepair).toContain("-webkit-line-clamp: 2");
    expect(mobileSiteRepair).toContain("white-space: nowrap !important");
    for (const selector of [".falling-items-layer", ".falling-object", ".game-grid-bg", ".game-hud", ".dj-catcher", ".game-overlay", ".hazard-splash", ".falling-items-layer:empty::after"]) {
      expect(fallingItemsRenderFix).toContain(selector);
    }
    expect(fallingItemsRenderFix).toContain("z-index: 15 !important");
    expect(fallingItemsRenderFix).toContain("z-index: 30 !important");
    expect(fallingItemsRenderFix).toContain("z-index: 50 !important");
    expect(fallingItemsRenderFix).toContain("z-index: 100 !important");
    expect(fallingItemsRenderFix).toContain("filter: blur(2px) !important");
    expect(fallingItemsRenderFix).toContain("mix-blend-mode: normal !important");
    expect(fallingItemsRenderFix).toContain("clip-path: none !important");
    expect(fallingItemsRenderFix).toContain("mask-image: none !important");
    expect(gameSource).toContain("visibleItems.slice(-18).map");
    expect(gameSource).toContain("if (structureChanged) setVisibleItems([...nextItems]);");
    expect(gameSource).toContain("setVisibleItems([]);\n    itemsRef.current = [];");
  });

  it("protects the mobile breakpoint used by the site and game audit", () => {
    expect(read("visuals-archive-collage.css")).toContain("@media (max-width: 650px)");
    expect(read("selector-profile-zine.css")).toContain("@media (max-width: 650px)");
    expect(read("exclusive-dubplate-promo.css")).toContain("@media (max-width: 760px)");
    expect(read("booking-frequency-terminal.css")).toContain("@media (max-width: 650px)");
    expect(journey).toContain("@media (max-width: 650px)");
  });
});
