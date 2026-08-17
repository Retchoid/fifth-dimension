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

export function clampPlayerX(value: number) {
  return Math.max(PLAYFIELD_BOUNDS.minX, Math.min(PLAYFIELD_BOUNDS.maxX, value));
}

export function clientXToWorldX(clientX: number, left: number, width: number) {
  if (!Number.isFinite(width) || width <= 0) return PLAYFIELD_BOUNDS.minX;
  return clampPlayerX(((clientX - left) / width) * 100);
}

export function playerRectFromCenterX(x: number, state: PlayerWorld["state"] = "playing"): PlayerWorld {
  return {
    x: clampPlayerX(x) - PLAYFIELD_BOUNDS.playerWidth / 2,
    y: PLAYFIELD_BOUNDS.playerY,
    width: PLAYFIELD_BOUNDS.playerWidth,
    height: PLAYFIELD_BOUNDS.playerHeight,
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
