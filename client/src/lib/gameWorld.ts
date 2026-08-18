export type WorldState = "active" | "collected" | "resolved";

export type WorldRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlayerWorld = WorldRect & {
  state: "ready" | "playing" | "hit";
};

export type ObjectWorld = WorldRect & {
  state: WorldState;
  velocity: number;
};

export const PLAYFIELD_BOUNDS = {
  minX: 4,
  maxX: 90,
  playerY: 70,
  playerWidth: 15,
  playerHeight: 20,
} as const;

export const LEVEL_ONE_CATCH_BOUNDS = {
  playerY: 72,
  playerWidth: 11,
  playerHeight: 14,
} as const;

export type PlayerHitboxProfile = "default" | "level-one";

export function clampPlayerX(value: number) {
  return Math.max(PLAYFIELD_BOUNDS.minX, Math.min(PLAYFIELD_BOUNDS.maxX, value));
}

export function clientXToWorldX(clientX: number, left: number, width: number) {
  if (!Number.isFinite(width) || width <= 0) return PLAYFIELD_BOUNDS.minX;
  return clampPlayerX(((clientX - left) / width) * 100);
}

export function playerRectFromCenterX(
  x: number,
  state: PlayerWorld["state"] = "playing",
  profile: PlayerHitboxProfile = "default",
): PlayerWorld {
  const bounds = profile === "level-one" ? LEVEL_ONE_CATCH_BOUNDS : PLAYFIELD_BOUNDS;
  return {
    x: clampPlayerX(x) - bounds.playerWidth / 2,
    y: bounds.playerY,
    width: bounds.playerWidth,
    height: bounds.playerHeight,
    state,
  };
}

export function overlaps(a: WorldRect, b: WorldRect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function resolveWorldCollision(player: PlayerWorld, object: ObjectWorld) {
  if (object.state !== "active" || !overlaps(player, object)) return null;
  return { ...object, state: "resolved" as const };
}
