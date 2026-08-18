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
  });
});
