import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BONUS_EVENTS, createBonusEventDiagnostics } from "./bonusEvents";

const gameSource = readFileSync(resolve(process.cwd(), "client/src/components/DjMiniGame.tsx"), "utf8");

describe("Selectah Showdown bonus registry", () => {
  it("defines the established Level 1 reliability events without inventing new types", () => {
    expect(Object.keys(BONUS_EVENTS)).toEqual(expect.arrayContaining([
      "mixerDamage",
      "mixerRepair",
      "wrongTune",
      "policeSeizure",
      "tooHighToPlay",
      "downloadUnlock",
      "crowdPressure",
    ]));
  });

  it("gives every intended event an explicit eligibility, trigger, recurrence, priority, state, resume, and asset contract", () => {
    for (const event of Object.values(BONUS_EVENTS)) {
      expect(event.eligibility.length).toBeGreaterThan(0);
      expect(event.trigger.length).toBeGreaterThan(0);
      expect(event.recurrence.length).toBeGreaterThan(0);
      expect(event.priority).toBeGreaterThan(0);
      expect(event.gameplayState.length).toBeGreaterThan(0);
      expect(event.resume.length).toBeGreaterThan(0);
      expect(event.visualAsset.length).toBeGreaterThan(0);
    }
  });

  it("creates hidden-debug status for every event with eligibility, block reason, trigger count, timestamp, and game state", () => {
    const diagnostics = createBonusEventDiagnostics("PLAYING");
    for (const event of Object.keys(BONUS_EVENTS)) {
      const status = diagnostics[event as keyof typeof diagnostics];
      expect(status).toMatchObject({ eligible: false, blocked: true, triggerCount: 0, lastTriggerTime: null, currentGameState: "PLAYING" });
      expect(status.blockReason.length).toBeGreaterThan(0);
    }
  });

  it("wires the required event milestones through the centralized dispatcher while retaining the locked 25/50 objectives", () => {
    ["mixerDamage", "mixerRepair", "crowdPressure", "downloadUnlock"].forEach((event) => {
      expect(gameSource).toContain(`dispatchBonusEvent("${event}"`);
    });
    ["wrongTune", "policeSeizure", "tooHighToPlay", "recordCrate", "headphonesReady", "boh", "wheelItUp", "rewind", "runRiddim"].forEach((event) => {
      expect(gameSource).toContain(`"${event}"`);
    });
    expect(gameSource).toContain("const REQUIRED_RECORDS = 25;");
    expect(gameSource).toContain("const LEVEL_TWO_REQUIRED_RECORDS = 50;");
  });
});
