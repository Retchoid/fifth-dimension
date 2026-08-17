export type CrowdPressureOutcome = "block" | "equipment-hit" | null;

export type ChapterState = {
  score: number;
  lives: number;
  equipmentCondition: string;
  unlocks: readonly string[];
  records: number;
};

export type CrowdPressureState = { score: number; blocks: number; equipmentHits: number };
export type PitRunState = { score: number; combo: number; hits: number; inventory: readonly string[]; progress: number };
export type ChapterModeTransition = "LEVEL_1" | "BONUS_CROWD_PRESSURE" | "LEVEL_2" | "BONUS_LEVEL_2" | "LEVEL_3_PIT_RUN" | "AFTERPARTY";

export function canUnlockCrowdPressure(records: number, hazardsHit: number): boolean {
  return records >= 15 && hazardsHit === 0;
}

export function resolveCrowdPressureOutcome(handX: number, hazardX: number, depth: number): CrowdPressureOutcome {
  if (depth >= 72 && depth <= 95 && Math.abs(hazardX - handX) <= 10) return "block";
  if (depth >= 100) return "equipment-hit";
  return null;
}

export function pitRunProgressLimit(progress: number, hasAllRequiredGear: boolean): number {
  return Math.min(hasAllRequiredGear ? 100 : 94, progress);
}

export function pitRunCompletes(progress: number, inventory: readonly string[], requiredGear: readonly string[]): boolean {
  return progress >= 100 && requiredGear.every((gear) => inventory.includes(gear));
}

export function preserveChapterState(state: ChapterState): ChapterState {
  return { ...state, unlocks: [...state.unlocks] };
}

export function applyCrowdPressureOutcome(state: CrowdPressureState, outcome: CrowdPressureOutcome): CrowdPressureState {
  if (outcome === "block") return { ...state, score: state.score + 75, blocks: state.blocks + 1 };
  if (outcome === "equipment-hit") return { ...state, equipmentHits: state.equipmentHits + 1 };
  return state;
}

export function recoverPitGear(state: PitRunState, gear: string): PitRunState {
  if (state.inventory.includes(gear)) return state;
  return { ...state, score: state.score + 180, combo: state.combo + 1, inventory: [...state.inventory, gear] };
}

export function applyPitRunHazard(state: PitRunState): PitRunState {
  return { ...state, hits: state.hits + 1, combo: 1 };
}

export function transitionChapter(mode: ChapterModeTransition, event: "unlock-crowd" | "return-crowd" | "start-level-two-bonus" | "return-level-two" | "start-pit" | "afterparty"): ChapterModeTransition {
  const transitions: Record<ChapterModeTransition, Partial<Record<typeof event, ChapterModeTransition>>> = {
    LEVEL_1: { "unlock-crowd": "BONUS_CROWD_PRESSURE" },
    BONUS_CROWD_PRESSURE: { "return-crowd": "LEVEL_1" },
    LEVEL_2: { "start-level-two-bonus": "BONUS_LEVEL_2", "start-pit": "LEVEL_3_PIT_RUN" },
    BONUS_LEVEL_2: { "return-level-two": "LEVEL_2" },
    LEVEL_3_PIT_RUN: { afterparty: "AFTERPARTY" },
    AFTERPARTY: {},
  };
  return transitions[mode][event] ?? mode;
}
