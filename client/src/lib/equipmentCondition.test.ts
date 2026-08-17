import { describe, expect, it } from "vitest";
import { equipmentIsDamaged, worsenEquipmentCondition } from "./equipmentCondition";

describe("physical equipment condition", () => {
  it("progresses through visible damage tiers before breaking", () => {
    expect(worsenEquipmentCondition("clean")).toBe("lightDamage");
    expect(worsenEquipmentCondition("lightDamage")).toBe("damaged");
    expect(worsenEquipmentCondition("damaged")).toBe("critical");
    expect(worsenEquipmentCondition("critical")).toBe("broken");
  });

  it("treats a repaired rig as the first visible damage tier on a later hit", () => {
    expect(worsenEquipmentCondition("repaired")).toBe("lightDamage");
    expect(equipmentIsDamaged("clean")).toBe(false);
    expect(equipmentIsDamaged("repaired")).toBe(false);
    expect(equipmentIsDamaged("repairing")).toBe(true);
    expect(equipmentIsDamaged("broken")).toBe(true);
  });
});
