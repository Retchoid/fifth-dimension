import { describe, expect, it } from "vitest";
import { arcadeScoreInput } from "./arcadeLeaderboard";

describe("arcade public score input", () => {
  it("normalizes a valid selector tag while preserving a completed score", () => {
    expect(arcadeScoreInput.parse({ playerTag: "  ragga-5  ", score: 1250, completedLevel: "level2" })).toEqual({
      playerTag: "RAGGA-5",
      score: 1250,
      completedLevel: "level2",
      hasBonusCrown: false,
    });
  });

  it("accepts the earned after-party crown flag only when supplied by the completed bonus flow", () => {
    expect(arcadeScoreInput.parse({ playerTag: "5d", score: 5000, completedLevel: "level2", hasBonusCrown: true })).toMatchObject({
      playerTag: "5D",
      score: 5000,
      completedLevel: "level2",
      hasBonusCrown: true,
    });
  });

  it("rejects tags or scores outside the public leaderboard contract", () => {
    expect(() => arcadeScoreInput.parse({ playerTag: "name with more than twelve chars", score: 100, completedLevel: "level1" })).toThrow();
    expect(() => arcadeScoreInput.parse({ playerTag: "BAD!", score: -1, completedLevel: "level1" })).toThrow();
  });
});
