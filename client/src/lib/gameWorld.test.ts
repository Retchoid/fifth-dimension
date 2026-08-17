import { describe, expect, it } from "vitest";
import { clientXToWorldX, overlaps, playerRectFromCenterX, PLAYFIELD_BOUNDS, resolveWorldCollision } from "./gameWorld";

describe("game-world coordinates", () => {
  it("maps a 390px playfield from left to centre to right with shared player bounds", () => {
    expect(clientXToWorldX(100, 100, 390)).toBe(PLAYFIELD_BOUNDS.minX);
    expect(clientXToWorldX(295, 100, 390)).toBe(50);
    expect(clientXToWorldX(490, 100, 390)).toBe(PLAYFIELD_BOUNDS.maxX);
  });

  it("uses one world-rectangle system for pickup and hazard collisions", () => {
    const player = playerRectFromCenterX(50);
    expect(overlaps(player, { x: 47, y: 78, width: 5, height: 6 })).toBe(true);
    expect(overlaps(player, { x: 8, y: 78, width: 5, height: 6 })).toBe(false);
  });

  it("resolves an active pickup or hazard once only", () => {
    const player = playerRectFromCenterX(50);
    const first = resolveWorldCollision(player, { x: 47, y: 78, width: 5, height: 6, velocity: 40, state: "active" });
    expect(first?.state).toBe("resolved");
    expect(resolveWorldCollision(player, first!)).toBeNull();
  });
});
