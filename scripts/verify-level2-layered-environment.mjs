import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
await page.goto(`${origin}/?arcade-scene-verify=items-level-two`, { waitUntil: "domcontentloaded" });
const layers = page.locator(".level-two-club-layers");
await layers.waitFor({ state: "visible" });
await layers.scrollIntoViewIfNeeded();
await page.waitForFunction(() => Array.from(document.querySelectorAll(".level-two-club-layers img")).every((node) => node.complete && node.naturalWidth > 0), null, { timeout: 10_000 });
const inspection = await page.evaluate(() => {
  const environment = document.querySelector(".level-two-club-layers");
  const corridor = document.querySelector(".level-two-action-corridor");
  const field = document.querySelector(".game-viewport");
  if (!environment || !corridor || !field) return null;
  const layerNodes = Array.from(environment.querySelectorAll("img"));
  const legacySelectors = [".club-pillar", ".club-speaker-wall", ".club-poster-wall", ".club-crowd-mid", ".club-mc", ".club-security-inside", ".club-booth-floor", ".club-booth-cable", ".club-record-crate", ".club-monitor", ".club-cup", ".club-light-rig", ".club-laser", ".club-smoke", ".club-banner", ".club-equipment-leds", ".club-booth-edge", ".club-foreground-deck", ".club-foreground-mixer", ".club-foreground-fader", ".club-crowd-hands"];
  const legacyHidden = legacySelectors.every((selector) => Array.from(document.querySelectorAll(selector)).every((node) => getComputedStyle(node).display === "none"));
  const fieldBox = field.getBoundingClientRect();
  const corridorBox = corridor.getBoundingClientRect();
  const items = Array.from(document.querySelectorAll(".falling-object")).map((node) => node.getBoundingClientRect());
  return {
    mountedLayerCount: layerNodes.length,
    allLayersLoaded: layerNodes.every((node) => node.complete && node.naturalWidth > 0),
    layerSources: layerNodes.map((node) => node.getAttribute("src")),
    legacyHidden,
    corridor: { left: corridorBox.left - fieldBox.left, right: fieldBox.right - corridorBox.right, width: corridorBox.width },
    fieldWidth: fieldBox.width,
    fallingItemsInGamePlane: items.every((box) => box.left >= fieldBox.left - 48 && box.right <= fieldBox.right + 48),
  };
});
if (!inspection) throw new Error("Level 2 environment did not mount");
if (inspection.mountedLayerCount !== 5 || !inspection.allLayersLoaded || !inspection.legacyHidden || inspection.corridor.width < inspection.fieldWidth * 0.5 || !inspection.fallingItemsInGamePlane) {
  throw new Error(`Level 2 layered environment contract failed: ${JSON.stringify(inspection)}`);
}
await page.goto(`${origin}/?arcade-scene-verify=items-level-two&arcade-stage-verify=COMBO_25`, { waitUntil: "domcontentloaded" });
await page.locator(".level-two-club-layers").waitFor({ state: "visible" });
await page.waitForFunction(() => Array.from(document.querySelectorAll(".level-two-club-layers img")).every((node) => node.complete && node.naturalWidth > 0), null, { timeout: 10_000 });
const reactive = await page.evaluate(() => {
  const field = document.querySelector(".game-viewport");
  const speakers = document.querySelector(".level-two-club-layer.layer-speakers");
  const fx = document.querySelector(".level-two-club-layer.layer-fx");
  return {
    hasHighComboEnergyClass: field?.classList.contains("stage-energy-5") ?? false,
    speakerAnimation: speakers ? getComputedStyle(speakers).animationName : "",
    fxAnimation: fx ? getComputedStyle(fx).animationName : "",
  };
});
if (!reactive.hasHighComboEnergyClass || reactive.speakerAnimation !== "level-two-club-speaker-drive" || reactive.fxAnimation !== "level-two-club-light-kick") {
  throw new Error(`Level 2 high-combo reaction contract failed: ${JSON.stringify(reactive)}`);
}
const eventReactions = await page.evaluate(() => {
  const field = document.querySelector(".game-viewport");
  const speakers = document.querySelector(".level-two-club-layer.layer-speakers");
  const crowd = document.querySelector(".level-two-club-layer.layer-crowd");
  const fx = document.querySelector(".level-two-club-layer.layer-fx");
  if (!field || !speakers || !crowd || !fx) return null;
  field.classList.add("stage-event-catch");
  const catchSpeakerAnimation = getComputedStyle(speakers).animationName;
  field.classList.remove("stage-event-catch");
  field.classList.add("stage-event-hazard");
  const hazardCrowdAnimation = getComputedStyle(crowd).animationName;
  const hazardFxAnimation = getComputedStyle(fx).animationName;
  field.classList.remove("stage-event-hazard");
  return { catchSpeakerAnimation, hazardCrowdAnimation, hazardFxAnimation };
});
if (!eventReactions || eventReactions.catchSpeakerAnimation !== "level-two-club-speaker-drive" || eventReactions.hazardCrowdAnimation !== "level-two-club-crowd-recoil" || eventReactions.hazardFxAnimation !== "level-two-club-hazard-flicker") {
  throw new Error(`Level 2 catch/hazard reaction contract failed: ${JSON.stringify(eventReactions)}`);
}
if (process.env.LEVEL2_SCREENSHOT) {
  await page.locator(".game-viewport").screenshot({ path: process.env.LEVEL2_SCREENSHOT });
}
console.log(JSON.stringify({ origin, inspection, reactive, eventReactions, accepted: true }, null, 2));
await context.close();
await browser.close();
