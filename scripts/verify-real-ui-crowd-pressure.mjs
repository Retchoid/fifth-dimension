import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?arcade-real-input-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
const startBox = await start.boundingBox();
if (!startBox) throw new Error("Public Start Session control was not found");
const startPoint = { x: startBox.x + startBox.width / 2, y: startBox.y + startBox.height / 2 };
await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });

const field = page.locator(".game-viewport");
await field.scrollIntoViewIfNeeded();
const captureSurface = page.locator(".input-capture-layer.is-active");
const fieldBox = await captureSurface.boundingBox();
if (!fieldBox) throw new Error("Public playfield was not found");
const gestureY = fieldBox.y + fieldBox.height * .74;
const toX = (ratio) => fieldBox.x + fieldBox.width * ratio;
await page.mouse.move(toX(.08), gestureY);
await page.mouse.down();

const isHazard = (className) => /\b(cop|pill|phone|bottle|apple)\b/.test(className);
const isRecord = (className) => /\brecord\b/.test(className);
const allObjects = () => page.locator(".falling-object").evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return { className: String(node.className), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}));
const traceText = async () => {
  const panel = page.locator(".real-input-debug-panel");
  return (await panel.count()) > 0 ? (await panel.textContent()) ?? "" : "";
};
const cleanStreak = (text) => Number(/CLEAN STREAK:\s*(\d+)\/15/.exec(text)?.[1] ?? 0);

const deadline = Date.now() + 125_000;
let highestStreak = 0;
let routedObjects = 0;
while (Date.now() < deadline) {
  const trace = await traceText();
  highestStreak = Math.max(highestStreak, cleanStreak(trace));
  const bonusTriggered = /TRIGGERED:\s*YES/.test(trace) || (await page.locator(".crowd-pressure-splash-overlay").count()) > 0;
  if (bonusTriggered) break;

  const objects = await allObjects();
  const dangerBand = (item) => {
    const centreY = item.y + item.height / 2;
    return centreY >= fieldBox.y + fieldBox.height * .47 && centreY <= fieldBox.y + fieldBox.height * .90;
  };
  const hazard = objects.find((item) => isHazard(item.className) && dangerBand(item));
  const record = objects.find((item) => isRecord(item.className) && dangerBand(item));
  if (hazard) {
    const hazardRatio = (hazard.x + hazard.width / 2 - fieldBox.x) / fieldBox.width;
    await page.mouse.move(toX(hazardRatio < .5 ? .92 : .08), gestureY, { steps: 3 });
    routedObjects += 1;
  } else if (record) {
    const recordRatio = (record.x + record.width / 2 - fieldBox.x) / fieldBox.width;
    await page.mouse.move(toX(Math.max(.08, Math.min(.92, recordRatio))), gestureY, { steps: 4 });
    routedObjects += 1;
  }
  await page.waitForTimeout(55);
}

await page.mouse.up();
const finalTrace = await traceText();
const bonusVisible = /TRIGGERED:\s*YES/.test(finalTrace) || (await page.locator(".crowd-pressure-splash-overlay").count()) > 0;
await field.screenshot({ path: "/home/ubuntu/webdev-static-assets/selectah-real-ui-crowd-pressure-390.png" });
console.log(JSON.stringify({
  viewport: "390x844",
  publicStart: "browser pointer click",
  routedRenderedObjects: routedObjects,
  highestCleanStreak: highestStreak,
  finalTrace: finalTrace.replace(/\s+/g, " ").trim(),
  crowdPressureTriggered: bonusVisible,
}, null, 2));

if (!bonusVisible) process.exitCode = 1;
await context.close();
await browser.close();
