export type EquipmentCondition = "clean" | "lightDamage" | "damaged" | "critical" | "broken" | "repairing" | "repaired";

export function worsenEquipmentCondition(condition: EquipmentCondition): EquipmentCondition {
  if (condition === "clean" || condition === "repaired") return "lightDamage";
  if (condition === "lightDamage") return "damaged";
  if (condition === "damaged" || condition === "repairing") return "critical";
  return "broken";
}

export function equipmentIsDamaged(condition: EquipmentCondition): boolean {
  return condition !== "clean" && condition !== "repaired";
}
