import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const readClientSource = (path: string) => readFileSync(resolve(projectRoot, "client/src", path), "utf8");

describe("Level 1 gameplay composition presentation", () => {
  it("enlarges only the desktop Level 1 selector art while leaving collision ownership on its wrapper", () => {
    const styles = readClientSource("arcade-playfield-architecture.css");

    expect(styles).toContain("@media (min-width: 651px)");
    expect(styles).toContain(".game-viewport:not(.is-level-two) .dj-catcher-art");
    expect(styles).toContain("transform: scale(.96) !important");
    expect(styles).toContain("left: var(--player-world-x, 50%) !important");
    expect(styles).toContain("transform: translateX(-50%) !important");
  });

  it("uses sprite-only semantic filters for Level 1 hazards and rewards without restoring UI boxes", () => {
    const styles = readClientSource("falling-item-effects.css");

    expect(styles).toContain(".falling-object:is(.cop, .pill, .phone, .bottle, .apple) > .urban-prop-asset");
    expect(styles).toContain("rgba(255, 42, 42, .82)");
    expect(styles).toContain(".falling-object:is(.cdj, .mixer, .turntable, .adapter, .lion) > .urban-prop-asset");
    expect(styles).toContain("rgba(93, 255, 113, .82)");
    expect(styles).not.toContain("background: rgba(255, 42, 42");
    expect(styles).not.toContain("border: 2px solid rgba(255, 42, 42");
  });
});
