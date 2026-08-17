import { describe, expect, it } from "vitest";
import { reactionForCombo, StageReactionController, stageReactions } from "./stageReactionController";

describe("StageReactionController", () => {
  it("implements the supplied reaction map and clamps stage energy", () => {
    expect(stageReactions.DUBPLATE_CATCH).toEqual(["shop-sign-flash", "speaker-kick", "npc-boh"]);
    expect(stageReactions.COMBO_25).toEqual(["stage-frenzy", "bass-flash", "confetti-flyers"]);
    expect(stageReactions.HAZARD_HIT).toEqual(["stage-glitch"]);
    expect(reactionForCombo(5)).toBe("COMBO_5");
    expect(reactionForCombo(25)).toBe("COMBO_25");
    expect(reactionForCombo(6)).toBeNull();

    const snapshots: unknown[] = [];
    const controller = new StageReactionController((snapshot) => snapshots.push(snapshot));
    controller.setLevel(2);
    controller.setEnergy(4);
    controller.trigger("DUBPLATE_CATCH");
    expect(controller.snapshot).toEqual({ level: 2, energy: 1, reaction: "DUBPLATE_CATCH" });
    controller.clearReaction();
    expect(controller.snapshot.reaction).toBeNull();
    expect(snapshots).toHaveLength(4);
  });
});
