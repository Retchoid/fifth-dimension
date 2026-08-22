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

// Desktop Level 1 uses the wider visible cabinet presentation. These values
// expand only the permitted horizontal centre range; player/object rectangle
// dimensions and all collision mathematics stay unchanged.
export const LEVEL_ONE_DESKTOP_PLAYFIELD_BOUNDS = {
  minX: 6,
  maxX: 94,
} as const;

export type HorizontalWorldBounds = {
  minX: number;
  maxX: number;
};

export const LEVEL_ONE_CATCH_BOUNDS = {
  playerY: 72,
  playerWidth: 11,
  playerHeight: 14,
} as const;

export type PlayerHitboxProfile = "default" | "level-one";

export function clampPlayerX(value: number, bounds: HorizontalWorldBounds = PLAYFIELD_BOUNDS) {
  return Math.max(bounds.minX, Math.min(bounds.maxX, value));
}

export function clientXToWorldX(clientX: number, left: number, width: number, bounds: HorizontalWorldBounds = PLAYFIELD_BOUNDS) {
  if (!Number.isFinite(width) || width <= 0) return bounds.minX;
  return clampPlayerX(((clientX - left) / width) * 100, bounds);
}

export function playerRectFromCenterX(
  x: number,
  state: PlayerWorld["state"] = "playing",
  profile: PlayerHitboxProfile = "default",
  horizontalBounds: HorizontalWorldBounds = PLAYFIELD_BOUNDS,
): PlayerWorld {
  const bounds = profile === "level-one" ? LEVEL_ONE_CATCH_BOUNDS : PLAYFIELD_BOUNDS;
  return {
    x: clampPlayerX(x, horizontalBounds) - bounds.playerWidth / 2,
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
