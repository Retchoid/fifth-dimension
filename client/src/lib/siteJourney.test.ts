import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const journeyStyles = readFileSync(resolve(process.cwd(), "client/src/site-journey-flow.css"), "utf8");

describe("5D site journey flow", () => {
  it("keeps the physical-space section order and protected hero", () => {
    expect(homeSource).toContain('className="hero"');
    expect(homeSource.indexOf('id="listen"')).toBeGreaterThan(homeSource.indexOf('className="hero"'));
    expect(homeSource.indexOf('id="bio"')).toBeGreaterThan(homeSource.indexOf('id="listen"'));
    expect(homeSource.indexOf('id="other-mixes"')).toBeGreaterThan(homeSource.indexOf('id="bio"'));
    expect(homeSource.indexOf('id="projects"')).toBeGreaterThan(homeSource.indexOf('id="other-mixes"'));
    expect(homeSource.indexOf('id="visuals"')).toBeGreaterThan(homeSource.indexOf('id="projects"'));
    expect(homeSource.indexOf('id="booking"')).toBeGreaterThan(homeSource.indexOf('id="visuals"'));
    expect(homeSource.indexOf('id="contact"')).toBeGreaterThan(homeSource.indexOf('id="booking"'));
  });

  it("protects the signal rail and compact room-stamp geometry", () => {
    expect(journeyStyles).toContain("repeating-linear-gradient(180deg, #00D4FF");
    expect(journeyStyles).toContain("ROOM 01 / TRANSMISSION BAY");
    expect(journeyStyles).toContain("ROOM 06 / OPEN CHANNEL");
    expect(journeyStyles).toContain("inset: auto;");
    expect(journeyStyles).toContain("width: max-content;");
    expect(journeyStyles).toContain("@media (max-width: 650px)");
  });
});
