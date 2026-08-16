import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const profileStyles = readFileSync(resolve(process.cwd(), "client/src/selector-profile-zine.css"), "utf8");

describe("Selector Profile zine spread", () => {
  it("preserves the profile content and identity artwork", () => {
    expect(homeSource).toContain('id="bio"');
    expect(homeSource).toContain("SELECTOR PROFILE / 02");
    expect(homeSource).toContain("BASS ISN’T A GENRE.");
    expect(homeSource).toContain("5th Dimension is the sonic alter-ego of Bobby Bass");
    expect(homeSource).toContain("5th-dimension-character_a901a681.jpg");
    expect(homeSource).toContain("#DANCEHALLVIBES");
  });

  it("protects the asymmetrical zine and mobile stack", () => {
    expect(profileStyles).toContain("grid-template-columns: minmax(90px, .42fr)");
    expect(profileStyles).toContain("box-shadow: 9px 9px 0 #FF2D95");
    expect(profileStyles).toContain("background: #00D4FF");
    expect(profileStyles).toContain("repeating-linear-gradient(0deg, rgba(0,0,0,.15)");
    expect(profileStyles).toContain("@media (max-width: 650px)");
    expect(profileStyles).toContain("grid-template-columns: 1fr");
    expect(profileStyles).toContain('font: 900 clamp(5.8rem, 12vw, 13rem)/.68 "Press Start 2P"');
  });
});
