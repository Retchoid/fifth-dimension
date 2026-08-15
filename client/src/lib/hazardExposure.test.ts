import { describe, expect, it } from "vitest";
import { scheduledNamedHazardExposure } from "./hazardExposure";

describe("named-hazard exposure schedule", () => {
  it("provides one avoidable consecutive pair for cop, pill, and phone scenes in each level", () => {
    for (const level of [1, 2] as const) {
      expect([3, 4].map((spawn) => scheduledNamedHazardExposure(level, spawn))).toEqual(["cop", "cop"]);
      expect([8, 9].map((spawn) => scheduledNamedHazardExposure(level, spawn))).toEqual(["pill", "pill"]);
      expect([14, 15].map((spawn) => scheduledNamedHazardExposure(level, spawn))).toEqual(["phone", "phone"]);
    }
  });

  it("does not turn unrelated spawns into forced named hazards", () => {
    expect(scheduledNamedHazardExposure(1, 1)).toBeNull();
    expect(scheduledNamedHazardExposure(2, 20)).toBeNull();
  });
});
