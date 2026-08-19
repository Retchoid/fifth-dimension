import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "client/src");
const game = readFileSync(resolve(root, "components/DjMiniGame.tsx"), "utf8");
const levelOneCss = readFileSync(resolve(root, "level1-approved-sunset-art.css"), "utf8");
const levelOneAcceptanceCss = readFileSync(resolve(root, "level1-visual-acceptance.css"), "utf8");
const world = readFileSync(resolve(root, "lib/gameWorld.ts"), "utf8");

describe("Level 1 independent world progression contracts", () => {
  it("drives time and population from records while combo remains a separate render signal", () => {
    expect(game).toContain("const renderedRecordsCaught = forcedWorldRecords ?? recordsCaught;");
    expect(game).toContain("const renderedCombo = forcedWorldCombo ?? combo;");
    expect(game).toContain("const levelOneTimeStage = level === 1 ? Math.min(5, Math.floor(renderedRecordsCaught / 5)) : 0;");
    expect(game).toContain("level-one-time-${levelOneTimeStage}");
    expect(game).toContain("level-one-master-state-${levelOneMasterState}");
    expect(game).toContain("level-one-combo-${Math.min(15, renderedCombo)}");
    expect(levelOneCss).toContain("Record progress is the persistent time-of-night signal");
    expect(levelOneCss).toContain("must not erase the persistent");
  });

  it("uses the four supplied canonical masters as the sole Level 1 environment source", () => {
    for (const asset of [
      "1000001169_3204905a.png",
      "1000001162_aa49120d.png",
      "1000001166_e9b75dd0.png",
      "1000001168_c5184bab.png",
    ]) {
      expect(game).toContain(`/manus-storage/${asset}`);
    }
    expect(game).toContain("LEVEL_ONE_MASTER_ASSETS");
    expect(game).toContain("levelOneMasterStateForTimeStage");
    expect(game).not.toContain("level1-approved-locked-169-alley_8924f5b5.png");
    expect(game).not.toContain("1000001036.png");
    expect(game).not.toContain("1000001095.png");
    expect(game).not.toContain('className="level-one-population" aria-hidden="true"');
  });

  it("uses a compact Level 1 catch zone and preserves the default shared profile", () => {
    expect(world).toContain('export type PlayerHitboxProfile = "default" | "level-one";');
    expect(world).toContain("playerWidth: 11");
    expect(world).toContain("playerHeight: 14");
    expect(game).toContain('levelRef.current === 1 ? "level-one" : "default"');
  });

  it("does not ship the former Level 1 fallback rectangles or square impact marker", () => {
    expect(levelOneCss).toContain(".urban-prop-asset::after");
    expect(levelOneCss).toContain("content: none !important");
    expect(levelOneCss).toContain("clip-path: polygon(50% 0, 63% 35%, 100% 50%");
    expect(levelOneCss).toContain("No fallback art is permitted in production");
  });

  it("keeps independent development probes unavailable to normal production renders", () => {
    expect(game).toContain("const worldProbeEnabled = (import.meta.env.DEV || sandboxArcadeVerifier)");
    expect(game).toContain("worldRecordsParam");
    expect(game).toContain("worldComboParam");
    expect(game).toContain("WORLD PROBE · {forcedWorldRecords} RECORDS · 1X COMBO");
  });

  it("proves all six chronological record states without coupling to combo energy", () => {
    for (const records of [0, 5, 10, 15, 20, 25]) {
      expect(levelOneCss).toContain(`.game-viewport.level-one-time-${records === 0 ? 0 : Math.min(5, Math.floor(records / 5))}`);
    }
    expect(levelOneCss).toContain("level-one-time-sky");
    expect(levelOneCss).toContain("level-one-time-building-wash");
    expect(levelOneCss).toContain("level-one-time-window-grid");
    expect(levelOneCss).toContain("level-one-time-pavement-reflection");
    expect(levelOneCss).toContain("level-one-time-police-reflection");
    expect(levelOneCss).toContain("Forward-only record progression");
  });

  it("keeps event reactions localized and passive", () => {
    expect(game).toContain('className="level-one-catch-burst"');
    expect(game).toContain('className="level-one-hazard-pulse"');
    expect(game).toContain('className="level-one-repair-spark"');
    expect(game).toContain('mixerRepairBurst ? " mixer-repair-event"');
    expect(levelOneCss).toContain("stage-event-catch .level-one-catch-burst");
    expect(levelOneCss).toContain("stage-event-hazard .level-one-hazard-pulse");
    expect(levelOneCss).toContain("mixer-repair-event .level-one-repair-spark");
    expect(levelOneCss).toContain("pointer-events: none");
  });

  it("audits every configured Level 1 physical object against an approved asset", () => {
    for (const type of ["record", "cop", "pill", "phone", "cdj", "mixer", "turntable", "adapter", "bottle", "apple", "lion"]) {
      expect(game).toContain(`${type}: "/manus-storage/`);
    }
    expect(game).toContain("selectah-mixer-urban");
    expect(game).toContain("selectah-lion-urban");
    expect(game).toContain("selectah-turntable-urban");
  });

  it("requires the authoritative terminal state before showing the loss or game-over overlay", () => {
    expect(game).toContain('const terminalGameStateReached = gameplayState === "GAME_OVER" && !isPlaying && gameOver && !levelTwoComplete;');
    expect(game).toContain("{terminalGameStateReached && (heldLossPreview || isLossComedownVisible) && (");
    expect(game).toContain("{terminalGameStateReached && !finale && !isLossComedownVisible && (");
    expect(game).toContain('setGameplayStateOwner("GAME_OVER");');
  });

  it("keeps the corrected Level 1 base free from the old global visual masks and record halo", () => {
    expect(levelOneCss).toContain(".game-grid-bg.stage-background::before");
    expect(levelOneCss).toContain("content: none !important");
    expect(levelOneCss).toContain(".stage-game-plane");
    expect(levelOneCss).toContain("filter: none !important");
    expect(levelOneCss).toContain(".falling-object.record .urban-prop-asset");
    expect(levelOneCss).toContain("box-shadow: none !important");
    expect(levelOneCss).toContain("No approved Level 1 crowd-character art was supplied");
    expect(levelOneCss).toContain("level-one-catch-burst");
  });

  it("does not procedurally duplicate people already painted into the canonical masters", () => {
    expect(game).not.toContain("levelOneBackgroundPopulationCount");
    expect(game).not.toContain("level-one-approved-population");
    expect(game).toContain("level-one-canonical-ambience");
    expect(readFileSync(resolve(root, "level1-canonical-environment.css"), "utf8")).toContain("Do not duplicate them");
  });

  it("maps the six record probes onto four stable canonical environment milestones", () => {
    expect(game).toContain('if (stage <= 1) return "golden";');
    expect(game).toContain('if (stage <= 2) return "waking";');
    expect(game).toContain('if (stage === 3) return "dusk";');
    expect(game).toContain('return "night";');
    const canonicalCss = readFileSync(resolve(root, "level1-canonical-environment.css"), "utf8");
    expect(canonicalCss).toContain("level-one-master-art-golden");
    expect(canonicalCss).toContain("level-one-master-art-waking");
    expect(canonicalCss).toContain("level-one-master-art-dusk");
    expect(canonicalCss).toContain("level-one-master-art-night");
    expect(canonicalCss).toContain("object-fit: cover !important");
    expect(canonicalCss).toContain("object-position: 50% 50% !important");
  });

  it("keeps HUD-hidden comparison mode development-only and preserves normal HUD markup", () => {
    expect(game).toContain('const visualHudHidden = worldProbeEnabled && new URLSearchParams(window.location.search).get("hideHud") === "1";');
    expect(game).toContain('const visualFreezeProbe = worldProbeEnabled && new URLSearchParams(window.location.search).get("visualFreeze") === "1";');
    expect(game).toContain("if (visualFreezeProbe && worldRecordsParam !== null) return;");
    expect(game).toContain("{!visualHudHidden && (");
    expect(game).toContain('className="game-hud game-hud-clear"');
    expect(game).toContain("recordsCaught}/{level === 2 ? LEVEL_TWO_REQUIRED_RECORDS : REQUIRED_RECORDS");
  });

  it("does not ship an empty-layer NO ITEMS marker in normal play", () => {
    const renderFix = readFileSync(resolve(root, "falling-items-render-fix.css"), "utf8");
    expect(renderFix).toContain("content: none !important");
    expect(renderFix).not.toContain("⚠️ NO ITEMS");
  });

  it("enforces the Level 1 visual acceptance corrections in a final scoped layer", () => {
    expect(game).toContain('import "@/level1-visual-acceptance.css";');
    expect(game).toContain("const blockingOverlayActive = Boolean(");
    expect(game).toContain("damageFeedback && !blockingOverlayActive");
    expect(game).toContain("rewardToRender && !blockingOverlayActive");
    expect(game).not.toContain('className="equipment-condition-callout"');
    expect(levelOneAcceptanceCss).toContain("background-image: none !important");
    expect(levelOneAcceptanceCss).toContain("level-one-sunset-vignette::before");
    expect(levelOneAcceptanceCss).toContain("level-one-time-3 .level-one-sunset-alley-art");
    expect(levelOneAcceptanceCss).toContain("level-one-time-5 .level-one-sunset-alley-art");
    expect(levelOneAcceptanceCss).toContain(".level-one-population { display: none !important; }");
    expect(levelOneAcceptanceCss).toContain("equipment-condition-callout, .mixer-recovery-status");
    expect(levelOneAcceptanceCss).toContain("crowd-anger-copy > :is(span, strong, em)");
    expect(levelOneAcceptanceCss).toContain("white-space: normal !important");
    expect(levelOneAcceptanceCss).toContain("level-one-heart-loss");
  });
});
