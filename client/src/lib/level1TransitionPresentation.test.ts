import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const readClientSource = (path: string) => readFileSync(resolve(projectRoot, "client/src", path), "utf8");

describe("Level 1 environment transition presentation", () => {
  it("keeps environment master selection out of the falling-item renderer", () => {
    const source = readClientSource("falling-items-render-fix.css");

    expect(source).not.toContain(".level-one-master-art");
    expect(source).not.toContain("level-one-time-3 .level-one-master-art-night");
  });

  it("uses the same crossfade contract for Golden-to-Waking, Waking-to-Dusk, and Dusk-to-Night", () => {
    const source = readClientSource("level1-final-transition-calibration.css");

    expect(source).toContain("--level-one-master-handoff-duration: 900ms");
    expect(source).toContain("--level-one-master-handoff-easing: cubic-bezier(.22, .72, .24, 1)");
    expect(source).toContain("transition: opacity var(--level-one-master-handoff-duration) var(--level-one-master-handoff-easing)");
    expect(source).toContain("transition-duration: var(--level-one-master-handoff-duration)");
    expect(source).toContain("transition-timing-function: var(--level-one-master-handoff-easing)");
    expect(source).toContain(".level-one-master-art:not(.level-one-master-art-golden)");
    expect(source).toContain("level-one-big-up-reached .level-one-master-art-golden");
    expect(source).toContain("level-one-big-up-reached .level-one-master-art-waking");
    expect(source).toContain("level-one-master-state-night .level-one-sunset-alley::after");
    expect(source).not.toContain("1520ms");
    expect(source).not.toContain("brightness(2.05)");
  });

  it("limits deterministic transition midpoint holds to the development-only verifier", () => {
    const component = readClientSource("components/DjMiniGame.tsx");
    const styles = readClientSource("level1-final-transition-calibration.css");

    expect(component).toContain("const transitionCapturePhase = (import.meta.env.DEV || sandboxArcadeVerifier)");
    expect(component).toContain("level-one-transition-capture-${transitionCapturePhase}");
    expect(styles).toContain("level-one-transition-capture-golden-waking");
    expect(styles).toContain("level-one-transition-capture-waking-dusk");
    expect(styles).toContain("level-one-transition-capture-dusk-night");
  });
});
