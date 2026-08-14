import { describe, expect, it } from "vitest";
import { arcadeScoreInput } from "./arcadeLeaderboard";

describe("arcade public score input", () => {
  it("normalizes a valid selector tag while preserving a completed score", () => {
    expect(arcadeScoreInput.parse({ playerTag: "  ragga-5  ", score: 1250, completedLevel: "level2" })).toEqual({
      playerTag: "RAGGA-5",
      score: 1250,
      completedLevel: "level2",
    });
  });

  it("rejects tags or scores outside the public leaderboard contract", () => {
    expect(() => arcadeScoreInput.parse({ playerTag: "name with more than twelve chars", score: 100, completedLevel: "level1" })).toThrow();
    expect(() => arcadeScoreInput.parse({ playerTag: "BAD!", score: -1, completedLevel: "level1" })).toThrow();
  });
});
