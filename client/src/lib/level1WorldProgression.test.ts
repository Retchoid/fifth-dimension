import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "client/src");
const game = readFileSync(resolve(root, "components/DjMiniGame.tsx"), "utf8");
const levelOneCss = readFileSync(resolve(root, "level1-approved-sunset-art.css"), "utf8");
const world = readFileSync(resolve(root, "lib/gameWorld.ts"), "utf8");

describe("Level 1 independent world progression contracts", () => {
  it("drives time and population from records while combo remains a separate render signal", () => {
    expect(game).toContain("const renderedRecordsCaught = forcedWorldRecords ?? recordsCaught;");
    expect(game).toContain("const renderedCombo = forcedWorldCombo ?? combo;");
    expect(game).toContain("const levelOneTimeStage = level === 1 ? Math.min(5, Math.floor(renderedRecordsCaught / 5)) : 0;");
    expect(game).toContain("level-one-time-${levelOneTimeStage}");
    expect(game).toContain("level-one-population-${levelOnePopulationStage}");
    expect(game).toContain("level-one-combo-${Math.min(15, renderedCombo)}");
    expect(levelOneCss).toContain("Record progress is the persistent time-of-night signal");
    expect(levelOneCss).toContain("must not erase the persistent");
  });

  it("keeps the corrected 1000001097-derived alley as the sole Level 1 base", () => {
    expect(game).toContain('src="/manus-storage/level1-approved-locked-169-alley_8924f5b5.png"');
    expect(game).not.toContain("1000001036.png");
    expect(game).not.toContain("1000001095.png");
    expect(game).not.toContain("level-two-club-backwall");
    expect(game).toContain('className="level-one-population" aria-hidden="true"');
    expect(levelOneCss).toContain(".level-one-population");
    expect(levelOneCss).toContain("pointer-events: none");
    expect(levelOneCss).toContain("population-queue-left");
    expect(levelOneCss).toContain("population-door-right");
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
      expect(game).toContain(`${type}: "/embedded-assets/`);
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
    expect(levelOneCss).toContain(".falling-object.record .urban-prop-asset");
    expect(levelOneCss).toContain("drop-shadow(0 0 2px rgba(255, 230, 0, .24))");
    expect(levelOneCss).toContain("No approved Level 1 crowd-character art was supplied");
    expect(levelOneCss).toContain("level-one-catch-burst");
  });

  it("uses only approved non-player dancers for restrained Level 1 background population", () => {
    expect(game).toContain("const levelOneBackgroundPopulationCount = level === 1");
    expect(game).toContain("renderedRecordsCaught >= 25");
    expect(game).toContain("renderedRecordsCaught >= 20");
    expect(game).toContain("renderedRecordsCaught >= 15");
    expect(game).toContain("level-one-approved-population");
    expect(game).toContain("CELEBRATION_DANCERS[index % CELEBRATION_DANCERS.length]");
    expect(levelOneCss).toContain(".level-one-background-npc");
    expect(levelOneCss).toContain("pointer-events: none !important");
    expect(levelOneCss).toContain("level-one-npc-breathe");
    expect(levelOneCss).toContain("max-height: 31% !important");
  });

  it("does not ship an empty-layer NO ITEMS marker in normal play", () => {
    const renderFix = readFileSync(resolve(root, "falling-items-render-fix.css"), "utf8");
    expect(renderFix).toContain("content: none !important");
    expect(renderFix).not.toContain("⚠️ NO ITEMS");
  });
});
