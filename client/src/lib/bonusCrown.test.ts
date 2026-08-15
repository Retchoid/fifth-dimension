import { describe, expect, it } from "vitest";
import { shouldAwardBonusCrown } from "./bonusCrown";

describe("bonus crown payload", () => {
  it("sends a crown only for a Level 2 score after the durable bonus-clear proof is true", () => {
    expect(shouldAwardBonusCrown("level2", true)).toBe(true);
  });

  it("does not crown an ordinary Level 2 score or any Level 1 score", () => {
    expect(shouldAwardBonusCrown("level2", false)).toBe(false);
    expect(shouldAwardBonusCrown("level1", true)).toBe(false);
  });
});
