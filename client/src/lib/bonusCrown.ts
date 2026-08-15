export function shouldAwardBonusCrown(completedLevel: "level1" | "level2", bonusClearCompleted: boolean): boolean {
  return completedLevel === "level2" && bonusClearCompleted;
}
