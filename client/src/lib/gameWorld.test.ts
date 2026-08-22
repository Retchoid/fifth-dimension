import { describe, expect, it } from "vitest";
import { clientXToWorldX, LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS, overlaps, playerRectFromCenterX, PLAYFIELD_BOUNDS, resolveWorldCollision } from "./gameWorld";

describe("game-world coordinates", () => {
  it("maps a 390px playfield from left to centre to right with shared player bounds", () => {
    expect(clientXToWorldX(100, 100, 390)).toBe(PLAYFIELD_BOUNDS.minX);
    expect(clientXToWorldX(295, 100, 390)).toBe(50);
    expect(clientXToWorldX(490, 100, 390)).toBe(PLAYFIELD_BOUNDS.maxX);
  });

  it("uses wider desktop-only level-one centre limits without changing the level-one collision rectangle", () => {
    const left = playerRectFromCenterX(0, "playing", "level-one", LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS);
    const right = playerRectFromCenterX(100, "playing", "level-one", LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS);

    expect(clientXToWorldX(0, 0, 624, LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS)).toBe(6);
    expect(clientXToWorldX(624, 0, 624, LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS)).toBe(94);
    expect(left).toMatchObject({ x: 0.5, width: 11, height: 14 });
    expect(right).toMatchObject({ x: 88.5, width: 11, height: 14 });
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
