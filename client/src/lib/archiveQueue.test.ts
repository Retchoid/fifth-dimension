import { describe, expect, it } from "vitest";
import { archiveQueueProgressPercent, nextArchiveQueueIndex } from "./archiveQueue";

describe("5D Playa archive queue", () => {
  it("advances through the full archive and wraps after the final mix", () => {
    expect(nextArchiveQueueIndex(0, 9)).toBe(1);
    expect(nextArchiveQueueIndex(8, 9)).toBe(0);
  });

  it("does not expose invalid progress for unloaded, negative, or overshooting audio", () => {
    expect(archiveQueueProgressPercent(10, 0)).toBe(0);
    expect(archiveQueueProgressPercent(-3, 60)).toBe(0);
    expect(archiveQueueProgressPercent(90, 60)).toBe(100);
    expect(archiveQueueProgressPercent(15, 60)).toBe(25);
  });
});
