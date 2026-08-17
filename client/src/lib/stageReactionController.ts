export type StageReaction =
  | "DUBPLATE_CATCH"
  | "MISS"
  | "HAZARD_HIT"
  | "COMBO_5"
  | "COMBO_10"
  | "COMBO_15"
  | "COMBO_20"
  | "COMBO_25";

export interface StageController {
  setLevel(level: 1 | 2): void;
  trigger(reaction: StageReaction): void;
  setEnergy(value: number): void;
  onCatch(type: string): void;
  onHazard(type: string): void;
  onCombo(level: number): void;
  onMiss(): void;
  onDamage(): void;
  onLevelComplete(): void;
}

export const stageReactions: Record<StageReaction, readonly string[]> = {
  DUBPLATE_CATCH: ["shop-sign-flash", "speaker-kick", "npc-boh"],
  COMBO_5: ["neon-boost-1"],
  COMBO_10: ["speaker-pulse", "npc-hands-up"],
  COMBO_15: ["window-bass-pulse", "laser-enable"],
  COMBO_20: ["crowd-energy-high", "signage-rave-mode"],
  COMBO_25: ["stage-frenzy", "bass-flash", "confetti-flyers"],
  MISS: ["light-flicker", "npc-disappointed"],
  HAZARD_HIT: ["stage-glitch"],
};

export type StageSnapshot = {
  level: 1 | 2;
  energy: number;
  reaction: StageReaction | null;
  event: "catch" | "hazard" | "combo" | "miss" | "damage" | "level-complete" | null;
  eventType: string | null;
};

export class StageReactionController implements StageController {
  private state: StageSnapshot = { level: 1, energy: 0, reaction: null, event: null, eventType: null };

  constructor(private readonly onChange: (snapshot: StageSnapshot) => void) {}

  get snapshot(): StageSnapshot {
    return this.state;
  }

  setLevel(level: 1 | 2) {
    this.publish({ ...this.state, level, reaction: null, event: null, eventType: null });
  }

  trigger(reaction: StageReaction) {
    this.publish({ ...this.state, reaction });
  }

  setEnergy(value: number) {
    this.publish({ ...this.state, energy: Math.max(0, Math.min(1, value)) });
  }

  onCatch(type: string) {
    this.publish({ ...this.state, reaction: "DUBPLATE_CATCH", event: "catch", eventType: type });
  }

  onHazard(type: string) {
    this.publish({ ...this.state, reaction: "HAZARD_HIT", event: "hazard", eventType: type });
  }

  onCombo(level: number) {
    const reaction = reactionForCombo(level);
    this.publish({ ...this.state, reaction, event: "combo", eventType: String(level) });
  }

  onMiss() {
    this.publish({ ...this.state, reaction: "MISS", event: "miss", eventType: null });
  }

  onDamage() {
    this.publish({ ...this.state, event: "damage", eventType: this.state.eventType });
  }

  onLevelComplete() {
    this.publish({ ...this.state, event: "level-complete", eventType: null });
  }

  clearReaction() {
    this.publish({ ...this.state, reaction: null, event: null, eventType: null });
  }

  private publish(next: StageSnapshot) {
    this.state = next;
    this.onChange(next);
  }
}

export function reactionForCombo(combo: number): StageReaction | null {
  if (combo === 25) return "COMBO_25";
  if (combo === 20) return "COMBO_20";
  if (combo === 15) return "COMBO_15";
  if (combo === 10) return "COMBO_10";
  if (combo === 5) return "COMBO_5";
  return null;
}
