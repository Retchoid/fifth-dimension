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
const scopedArcadeOverhaul = read("arcade-scoped-overhaul.css");
const arcadePlayfieldArchitecture = read("arcade-playfield-architecture.css");
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

  it("keeps active gameplay on one explicit decomposed playfield architecture", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain('import "@/arcade-playfield-architecture.css";');
    expect(gameSource).toContain("handlePointerMove");
    expect(gameSource).toContain("onPointerMove");
    expect(gameSource).toContain("updateDjPositionFromClientX");
    expect(gameSource).toContain("setPointerCapture");
    expect(gameSource).toContain("playfieldPointerRef");
    expect(gameSource).not.toContain("mobile-playfield-control-hint");
    expect(gameSource).not.toContain("nudgeMobileDj");
    expect(gameSource).toContain("neon-backstreet-background");
    expect(gameSource).toContain("stage-game-plane");
    expect(gameSource).toContain("stage-foreground");
    expect(arcadePlayfieldArchitecture).toContain("LEVEL 1 — NEON BACKSTREET / AUTHORED PLAYFIELD");
    expect(arcadePlayfieldArchitecture).not.toContain("selectah-level-one-urban-stage-reference_43ddc07a.png");
    expect(arcadePlayfieldArchitecture).not.toContain("5d-selector-level-two-detailed-stage_89e2157b.png");
    expect(arcadePlayfieldArchitecture).not.toContain("selectah-splash-art-direction_4d1c250f.png");
    expect(arcadePlayfieldArchitecture).not.toContain("5d-selector-rave-stage_e4fdff4b.png");
    expect(gameSource).toContain("crowd-pressure-background");
    expect(gameSource).toContain("club-reverse-entrance");
    expect(arcadePlayfieldArchitecture).toContain("LEVEL 2 — CROWD PRESSURE / INSIDE THE SAME 5D CLUB");
    expect(arcadePlayfieldArchitecture).toContain("stage-reaction-combo_25");
    expect(arcadePlayfieldArchitecture).toContain("transform: scale(.96) !important");
    expect(arcadePlayfieldArchitecture).toContain(".game-grid-bg::before");
    expect(arcadePlayfieldArchitecture).toContain("content: none !important");
    expect(arcadePlayfieldArchitecture).toContain("grid-template-areas");
    expect(arcadePlayfieldArchitecture).toContain("transform: scale(.86) !important");
    expect(arcadePlayfieldArchitecture).toContain(".dj-catcher.level-two-catcher .dj-catcher-art");
    expect(gameSource).toContain("StageReactionController");
    expect(gameSource).toContain("onCatch(item.type)");
    expect(gameSource).toContain("onMiss()");
    expect(gameSource).toContain("onHazard(item.type)");
    expect(gameSource).toContain("resolveWorldCollision");
    expect(gameSource).toContain("Math.floor(Math.random() * 6)");
    expect(gameSource).toContain("arcade-stage-verify");
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
    expect(mobileSiteRepair).toContain("repeating-linear-gradient");
    expect(mobileSiteRepair).toContain("box-shadow: 4px 4px 0 #0A0A12 !important");
    expect(mobileSiteRepair).toContain("max-width: 100% !important");
    expect(mobileSiteRepair).toContain(".unlock-download-drop");
    expect(mobileSiteRepair).toContain(".green-camo-award");
    expect(mobileSiteRepair).toContain(".afterparty-door-ready");
    expect(mobileSiteRepair).toContain(".achievement-chain-wrap");
    expect(mobileSiteRepair).toContain("/* === ISSUE 1: YELLOW BLOCK OVER JERSH IN CASE DOWNLOAD (SCOPED) === */");
    expect(mobileSiteRepair).toContain("/* === ISSUE 2: FLOATING TEXT CONTAINMENT (SCOPED) === */");
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

  it("keeps Selectah Showdown copy and compact HUD contracts readable", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).not.toMatch(/TIGGER|50-RELOAD|DUMPLATES|(?:^|[^B])ADGE HIT/);
    expect(gameSource).toContain("BADGE HIT");
    expect(gameSource).toContain("COPS SEIZED<br />YOUR MIXER.");
    expect(gameSource).toContain("BADGE PATROL / 2 HITS");
    expect(gameSource).toContain("Collect 25 dubplates.");
    expect(gameSource).toContain('"❤️".repeat(lives)');
    expect(scopedArcadeOverhaul).toContain("flex-wrap: nowrap !important");
    expect(scopedArcadeOverhaul).toContain("bottom: 8% !important");
    expect(scopedArcadeOverhaul).toContain(".police-seizure-overlay > h3");
  });

  it("keeps Pass D Level 2 as a 50-item chapter with its earned bonus hook", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("const LEVEL_TWO_REQUIRED_RECORDS = 50;");
    expect(gameSource).toContain("nextRecordsCaught >= LEVEL_TWO_REQUIRED_RECORDS");
    expect(gameSource).toContain("recordsCaught}/{level === 2 ? LEVEL_TWO_REQUIRED_RECORDS : REQUIRED_RECORDS}");
    expect(gameSource).toContain("BONUS_START_RECORDS");
    expect(gameSource).toContain('setChapterMode("BONUS_LEVEL_2")');
  });

  it("keeps the emergency Level 1 mechanics matrix and query-gated collision diagnostics", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    for (const viewport of ["[320, 800]", "[360, 800]", "[375, 812]", "[390, 844]", "[412, 915]", "[430, 932]"]) {
      expect(gameSource).toContain(viewport);
    }
    expect(gameSource).toContain("arcade-mechanics-debug");
    expect(gameSource).toContain("logMechanicsEvent");
    expect(gameSource).toContain("collision=catch");
    expect(gameSource).toContain("collision=hazard");
    expect(gameSource).toContain("collision=miss");
    expect(gameSource).toContain("setPointerCapture");
    expect(gameSource).toContain("releasePointerCapture");
    expect(arcadePlayfieldArchitecture).toContain(".mechanics-debug-object.collectible");
    expect(arcadePlayfieldArchitecture).toContain(".mechanics-debug-object.hazard");
    expect(arcadePlayfieldArchitecture).toContain(".mechanics-debug-object.bonus");
  });

  it("isolates the real public pointer path on one capture plane and exposes its visible trace", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("const handleInputCapturePointerDown");
    expect(gameSource).toContain("const handleInputCapturePointerMove");
    expect(gameSource).toContain("const releaseInputCapturePointer");
    expect(gameSource).toContain("const normalPlayfieldPointerEnabled");
    expect(gameSource).toContain('params.get("debugInput") === "1"');
    expect(gameSource).toContain('params.get("arcade-real-input-debug") === "true"');
    expect(gameSource).toContain("if (!realInputDebugEnabled) return;");
    expect(gameSource).toContain('window.addEventListener("pointerdown", handler, true)');
    expect(gameSource).toContain("REAL INPUT TRACE");
    expect(gameSource).toContain("TOUCH TARGET:");
    expect(gameSource).toContain("RENDERED X:");
    expect(gameSource).toContain("CAPTURE ELEMENT:");
    expect(gameSource).toContain("mixer-recovery-status");
    expect(arcadePlayfieldArchitecture).toContain(".real-input-debug-panel");
    expect(arcadePlayfieldArchitecture).toContain(".input-capture-layer.is-active");
  });

  it("keeps mobile arcade input in document flow above the preceding Projects card", () => {
    const cyanPaintSystem = read("cyan-paint-system.css");
    const baseStyles = read("index.css");
    expect(cyanPaintSystem).toContain(".arcade-flow-shell { position: relative; z-index: 9; isolation: isolate; overflow: visible; }");
    expect(baseStyles).toContain(".arcade-flow-shell { position: relative; z-index: 6; isolation: isolate; overflow: visible;");
    expect(mobileSiteRepair).toContain("transform: none !important;");
    expect(mobileSiteRepair).not.toContain("transform: scale(0.85) !important;");
    expect(mobileSiteRepair).not.toContain("transform: scale(0.92) !important;");
  });

  it("triggers Crowd Pressure once from 15 clean real Level 1 dubplates and returns to Level 1", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("cleanDubplateStreakRef.current + 1");
    expect(gameSource).toContain("canUnlockCrowdPressure(nextCleanStreak, 0)");
    expect(gameSource).toContain("crowdPressureTriggeredRef.current");
    expect(gameSource).toContain("if (launchCrowdPressure)");
    expect(gameSource).toContain("startLevelOneNoRequestBonus();");
    expect(gameSource).toContain("if (recordsCaughtRef.current < REQUIRED_RECORDS)");
    expect(gameSource).toContain("RECOVER: {recoveryProgress}/3 DUBPLATES");
    expect(gameSource).toContain('const objectiveIncrement = levelRef.current === 1 ? (item.type === "record" ? 1 : 0) : pickupValue;');
    expect(gameSource).toContain('if (mixerDamagedRef.current && item.type === "record")');
  });

  it("preserves the post-Crowd-Pressure Level 1 completion handoff to Level 2", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("if (recordsCaughtRef.current < REQUIRED_RECORDS)");
    expect(gameSource).toContain("setGameplayStateOwner(\"PLAYING\")");
    expect(gameSource).toContain("if (advanceToLevelTwo) {");
    expect(gameSource).toContain("startLevelTwo();");
  });

  it("preserves the existing Level 2 completion handoff to Level 3 Pit Run", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("if (completeLevelTwo) {");
    expect(gameSource).toContain("startPitRun();");
    expect(gameSource).toContain('transitionChapter("LEVEL_2", "start-pit")');
  });

  it("keeps published mobile pointer input bound to one dedicated capture surface", () => {
    const gameSource = read("components/DjMiniGame.tsx");
    expect(gameSource).toContain("const inputCaptureRef = useRef<HTMLDivElement>(null);");
    expect(gameSource).toContain('className={`input-capture-layer${normalPlayfieldPointerEnabled ? " is-active" : ""}`}');
    expect(gameSource).toContain("onPointerDown={handleInputCapturePointerDown}");
    expect(gameSource).toContain("e.currentTarget.setPointerCapture(e.pointerId)");
    expect(gameSource).toContain("updateDjPositionFromClientX(e.clientX, e.currentTarget)");
    expect(gameSource).toContain("e.currentTarget.hasPointerCapture(e.pointerId)");
    expect(gameSource).toContain("TOUCH ACTIVE:");
    expect(gameSource).toContain("CAPTURE ELEMENT:");
    expect(gameSource).toContain("lastWritePreviousX");
    expect(gameSource).toContain("lastWriteNextX");
    expect(gameSource).toContain("lastWriteTimestamp");
    expect(gameSource).toContain("WRITE SOURCE:");
    expect(gameSource).toContain("TOUCH TARGET:");
    expect(gameSource).toContain("RECT LEFT:");
    expect(gameSource).toContain("NORMALIZED X:");
    expect(gameSource).toContain("LAST PLAYER WRITE:");
    expect(arcadePlayfieldArchitecture).toContain("touch-action: none !important");
    expect(arcadePlayfieldArchitecture).toContain("pointer-events: auto !important");
    expect(arcadePlayfieldArchitecture).toContain(".input-capture-layer");
    expect(arcadePlayfieldArchitecture).toContain(".game-grid-bg,");
    expect(arcadePlayfieldArchitecture).toContain(".falling-items-layer *,");
    expect(arcadePlayfieldArchitecture).toContain(".dj-catcher *,");
  });
});
