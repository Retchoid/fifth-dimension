import { describe, expect, it } from "vitest";
import { applyCrowdPressureOutcome, applyPitRunHazard, canUnlockCrowdPressure, pitRunCompletes, pitRunProgressLimit, preserveChapterState, recoverPitGear, resolveCrowdPressureOutcome, transitionChapter } from "./chapterProgression";

describe("amended chapter progression", () => {
  it("unlocks Crowd Pressure only after 15 clean Level 1 dubplates", () => {
    expect(canUnlockCrowdPressure(14, 0)).toBe(false);
    expect(canUnlockCrowdPressure(15, 1)).toBe(false);
    expect(canUnlockCrowdPressure(15, 0)).toBe(true);
  });

  it("distinguishes a hand block from an equipment hit", () => {
    expect(resolveCrowdPressureOutcome(50, 56, 84)).toBe("block");
    expect(resolveCrowdPressureOutcome(50, 72, 84)).toBeNull();
    expect(resolveCrowdPressureOutcome(50, 72, 101)).toBe("equipment-hit");
    expect(applyCrowdPressureOutcome({ score: 100, blocks: 2, equipmentHits: 0 }, "block")).toEqual({ score: 175, blocks: 3, equipmentHits: 0 });
    expect(applyCrowdPressureOutcome({ score: 175, blocks: 3, equipmentHits: 0 }, "equipment-hit")).toEqual({ score: 175, blocks: 3, equipmentHits: 1 });
  });

  it("holds Pit Run at final recovery until required gear is complete", () => {
    const required = ["crate", "mic", "mixer"];
    expect(pitRunProgressLimit(99, false)).toBe(94);
    expect(pitRunProgressLimit(101, true)).toBe(100);
    expect(pitRunCompletes(100, ["crate", "mic"], required)).toBe(false);
    expect(pitRunCompletes(100, required, required)).toBe(true);
    expect(recoverPitGear({ score: 0, combo: 1, hits: 0, inventory: [], progress: 94 }, "mixer")).toMatchObject({ score: 180, combo: 2, inventory: ["mixer"] });
    expect(applyPitRunHazard({ score: 180, combo: 4, hits: 0, inventory: ["mixer"], progress: 94 })).toMatchObject({ score: 180, combo: 1, hits: 1 });
  });

  it("preserves cross-chapter run state without sharing mutable unlock arrays", () => {
    const original = { score: 840, lives: 3, equipmentCondition: "damaged", unlocks: ["release", "crowd-pressure"], records: 17 };
    const preserved = preserveChapterState(original);
    expect(preserved).toEqual(original);
    expect(preserved.unlocks).not.toBe(original.unlocks);
    expect(transitionChapter("LEVEL_1", "unlock-crowd")).toBe("BONUS_CROWD_PRESSURE");
    expect(transitionChapter("BONUS_CROWD_PRESSURE", "return-crowd")).toBe("LEVEL_1");
    expect(transitionChapter("LEVEL_2", "start-level-two-bonus")).toBe("BONUS_LEVEL_2");
    expect(transitionChapter("BONUS_LEVEL_2", "return-level-two")).toBe("LEVEL_2");
    expect(transitionChapter("LEVEL_2", "start-pit")).toBe("LEVEL_3_PIT_RUN");
    expect(transitionChapter("LEVEL_3_PIT_RUN", "afterparty")).toBe("AFTERPARTY");
  });
});
