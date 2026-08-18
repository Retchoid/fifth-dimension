import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });

async function runCrowdPressure() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/?arcade-verifier=true&arcade-scene-verify=crowd-pressure-active&arcade-cabinet-focus=true`, { waitUntil: "domcontentloaded" });
  const stage = page.locator(".crowd-pressure-bonus-stage");
  await stage.waitFor({ state: "visible", timeout: 7000 });
  const hand = page.locator(".crowd-pressure-hand");
  const before = await hand.getAttribute("style");
  const box = await stage.boundingBox();
  if (!box) throw new Error("Crowd Pressure stage missing bounds");
  await page.mouse.move(box.x + box.width * .18, box.y + box.height * .74);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .82, box.y + box.height * .74, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1100);
  const after = await hand.getAttribute("style");
  const hazards = await page.locator(".crowd-pressure-hazard-layer > *").count();
  const progress = await page.locator(".crowd-pressure-hud").textContent();
  await context.close();
  return { handBefore: before, handAfter: after, hazards, progress: progress?.replace(/\s+/g, " ").trim() };
}

async function runPitRun() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/?arcade-verifier=true&arcade-scene-verify=pit-run&arcade-cabinet-focus=true`, { waitUntil: "domcontentloaded" });
  const stage = page.locator(".pit-run-stage");
  await stage.waitFor({ state: "visible", timeout: 7000 });
  const runner = page.locator(".pit-runner");
  const before = await runner.getAttribute("class");
  const box = await stage.boundingBox();
  if (!box) throw new Error("Pit Run stage missing bounds");
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .72);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .84, box.y + box.height * .72, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  const after = await runner.getAttribute("class");
  const entities = await page.locator(".pit-run-entity-layer > *").count();
  const progress = await page.locator(".pit-run-hud").textContent();
  await context.close();
  return { runnerBefore: before, runnerAfter: after, entities, progress: progress?.replace(/\s+/g, " ").trim() };
}

const result = { crowdPressure: await runCrowdPressure(), pitRun: await runPitRun() };
console.log(JSON.stringify(result, null, 2));
if (result.crowdPressure.handBefore === result.crowdPressure.handAfter || result.crowdPressure.hazards < 1 || result.pitRun.runnerBefore === result.pitRun.runnerAfter || result.pitRun.entities < 1) process.exitCode = 1;
await browser.close();
