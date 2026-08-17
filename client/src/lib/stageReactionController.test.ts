import { describe, expect, it } from "vitest";
import { reactionForCombo, StageReactionController, stageReactions } from "./stageReactionController";

describe("StageReactionController", () => {
  it("implements the supplied reaction map and clamps stage energy", () => {
    expect(stageReactions.DUBPLATE_CATCH).toEqual(["shop-sign-flash", "speaker-kick", "npc-boh"]);
    expect(stageReactions.COMBO_25).toEqual(["stage-frenzy", "bass-flash", "confetti-flyers"]);
    expect(stageReactions.HAZARD_HIT).toEqual(["stage-glitch"]);
    expect(reactionForCombo(5)).toBe("COMBO_5");
    expect(reactionForCombo(10)).toBe("COMBO_10");
    expect(reactionForCombo(15)).toBe("COMBO_15");
    expect(reactionForCombo(20)).toBe("COMBO_20");
    expect(reactionForCombo(25)).toBe("COMBO_25");
    expect(reactionForCombo(6)).toBeNull();

    const snapshots: unknown[] = [];
    const controller = new StageReactionController((snapshot) => snapshots.push(snapshot));
    controller.setLevel(2);
    controller.setEnergy(4);
    controller.trigger("DUBPLATE_CATCH");
    expect(controller.snapshot).toEqual({ level: 2, energy: 1, reaction: "DUBPLATE_CATCH", event: null, eventType: null });
    controller.clearReaction();
    expect(controller.snapshot.reaction).toBeNull();
    expect(snapshots).toHaveLength(4);
  });

  it("provides explicit game-event callbacks for the stage", () => {
    const controller = new StageReactionController(() => undefined);
    controller.onCatch("record");
    expect(controller.snapshot).toMatchObject({ reaction: "DUBPLATE_CATCH", event: "catch", eventType: "record" });
    controller.onCombo(10);
    expect(controller.snapshot).toMatchObject({ reaction: "COMBO_10", event: "combo", eventType: "10" });
    controller.onHazard("pill");
    expect(controller.snapshot).toMatchObject({ reaction: "HAZARD_HIT", event: "hazard", eventType: "pill" });
    controller.onDamage();
    expect(controller.snapshot).toMatchObject({ reaction: "HAZARD_HIT", event: "damage", eventType: "pill" });
    controller.onMiss();
    expect(controller.snapshot).toMatchObject({ reaction: "MISS", event: "miss" });
    controller.onLevelComplete();
    expect(controller.snapshot.event).toBe("level-complete");
  });

  it("publishes every authored combo milestone as an environmental event", () => {
    const controller = new StageReactionController(() => undefined);
    for (const [combo, reaction] of [[5, "COMBO_5"], [10, "COMBO_10"], [15, "COMBO_15"], [20, "COMBO_20"], [25, "COMBO_25"]] as const) {
      controller.onCombo(combo);
      expect(controller.snapshot).toMatchObject({ reaction, event: "combo", eventType: String(combo) });
    }
  });
});
