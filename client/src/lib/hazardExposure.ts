export type NamedHazardExposure = "cop" | "pill" | "phone";

/**
 * Each scheduled pair gives a player a clear, avoidable chance to intentionally
 * trigger one named scene. It never changes lives or forces a collision.
 */
const NAMED_HAZARD_EXPOSURE_SLOTS: Record<1 | 2, ReadonlyMap<number, NamedHazardExposure>> = {
  1: new Map([[3, "cop"], [4, "cop"], [8, "pill"], [9, "pill"], [14, "phone"], [15, "phone"]]),
  2: new Map([[3, "cop"], [4, "cop"], [8, "pill"], [9, "pill"], [14, "phone"], [15, "phone"]]),
};

export function scheduledNamedHazardExposure(level: 1 | 2, spawnNumber: number): NamedHazardExposure | null {
  return NAMED_HAZARD_EXPOSURE_SLOTS[level].get(spawnNumber) ?? null;
}
