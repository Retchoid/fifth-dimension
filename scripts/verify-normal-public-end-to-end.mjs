import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

// This is intentionally the ordinary public page. The one diagnostic query
// renders visible values only; it does not expose or call game internals.
await page.goto(`${origin}/?arcade-real-input-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });

const field = page.locator(".game-viewport");
await field.scrollIntoViewIfNeeded();
const bounds = await field.boundingBox();
if (!bounds) throw new Error("Normal public playfield is not visible");
const gestureY = bounds.y + bounds.height * .74;
const xAt = (ratio) => bounds.x + bounds.width * Math.max(.08, Math.min(.92, ratio));
await page.mouse.move(xAt(.08), gestureY);
await page.mouse.down();

const isRecord = (className) => /\brecord\b/.test(className);
const isHazard = (className) => /\b(cop|pill|phone|bottle|apple)\b/.test(className);
const objects = () => page.locator(".falling-object").evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return { id: node.getAttribute("data-game-object-id"), className: String(node.className), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}));
const hud = async () => page.evaluate(() => {
  const recordsText = document.querySelector(".records-hud")?.textContent ?? "";
  const livesText = document.querySelector(".lives-badge")?.textContent ?? "";
  return {
    records: Number(/(\d+)\s*\//.exec(recordsText)?.[1] ?? 0),
    lives: (livesText.match(/❤️/g) ?? []).length,
    recordsText,
    livesText,
  };
});
const trace = () => page.locator(".real-input-debug-panel").textContent().then((text) => text ?? "");
const streak = (text) => Number(/CLEAN STREAK:\s*(\d+)\/15/.exec(text)?.[1] ?? 0);
const bonusTriggered = (text) => /TRIGGERED:\s*YES/.test(text) || page.locator(".crowd-pressure-splash-overlay").count().then(Boolean);
const inBand = (item) => {
  const centreY = item.y + item.height / 2;
  return centreY >= bounds.y + bounds.height * .45 && centreY <= bounds.y + bounds.height * .90;
};

async function catchRecord({ avoidHazards }) {
  const baseline = await hud();
  const deadline = Date.now() + 42_000;
  while (Date.now() < deadline) {
    const current = await objects();
    const danger = current.find((item) => isHazard(item.className) && inBand(item));
    if (avoidHazards && danger) {
      const hazardRatio = (danger.x + danger.width / 2 - bounds.x) / bounds.width;
      await page.mouse.move(xAt(hazardRatio < .5 ? .92 : .08), gestureY, { steps: 4 });
      await page.waitForTimeout(80);
      continue;
    }
    const record = current.find((item) => isRecord(item.className) && inBand(item));
    if (record) {
      const recordRatio = (record.x + record.width / 2 - bounds.x) / bounds.width;
      await page.mouse.move(xAt(recordRatio), gestureY, { steps: 4 });
      await page.waitForTimeout(160);
      const now = await hud();
      if (now.records > baseline.records) return { record, before: baseline, after: now };
    }
    await page.waitForTimeout(60);
  }
  throw new Error("Timed out waiting for a real rendered dubplate catch");
}

async function takeOneHazard() {
  const baseline = await hud();
  const deadline = Date.now() + 42_000;
  while (Date.now() < deadline) {
    const hazard = (await objects()).find((item) => isHazard(item.className) && inBand(item));
    if (hazard) {
      const ratio = (hazard.x + hazard.width / 2 - bounds.x) / bounds.width;
      await page.mouse.move(xAt(ratio), gestureY, { steps: 5 });
      await page.waitForTimeout(210);
      const now = await hud();
      if (now.lives < baseline.lives) return { hazard, before: baseline, after: now };
    }
    await page.waitForTimeout(60);
  }
  throw new Error("Timed out waiting for one real rendered hazard collision");
}

const initialCatch = await catchRecord({ avoidHazards: true });
const hazard = await takeOneHazard();
await page.waitForTimeout(620);
const visibleRecovery = await page.locator(".mixer-recovery-status").textContent();
const recoveryCatches = [];
for (let index = 0; index < 3; index += 1) recoveryCatches.push(await catchRecord({ avoidHazards: true }));

const cleanDeadline = Date.now() + 170_000;
let highestCleanStreak = streak(await trace());
while (Date.now() < cleanDeadline) {
  const currentTrace = await trace();
  highestCleanStreak = Math.max(highestCleanStreak, streak(currentTrace));
  if (await bonusTriggered(currentTrace)) break;
  const current = await objects();
  const hazardInBand = current.find((item) => isHazard(item.className) && inBand(item));
  if (hazardInBand) {
    const hazardRatio = (hazardInBand.x + hazardInBand.width / 2 - bounds.x) / bounds.width;
    await page.mouse.move(xAt(hazardRatio < .5 ? .92 : .08), gestureY, { steps: 4 });
  } else {
    const record = current.find((item) => isRecord(item.className) && inBand(item));
    if (record) {
      const recordRatio = (record.x + record.width / 2 - bounds.x) / bounds.width;
      await page.mouse.move(xAt(recordRatio), gestureY, { steps: 4 });
    }
  }
  await page.waitForTimeout(55);
}

await page.mouse.up();
const finalTrace = await trace();
const completed = await bonusTriggered(finalTrace);
await field.screenshot({ path: "/home/ubuntu/webdev-static-assets/selectah-normal-public-e2e-390.png" });
console.log(JSON.stringify({
  route: "/?arcade-real-input-debug=true",
  viewport: "390x844",
  start: "normal public Start Session button",
  initialCatch,
  hazard,
  visibleRecovery,
  recoveryCatches,
  highestCleanStreak,
  finalTrace: finalTrace.replace(/\s+/g, " ").trim(),
  crowdPressureTriggered: completed,
}, null, 2));

if (!completed || highestCleanStreak < 15 || !visibleRecovery?.includes("MIXER DAMAGED")) process.exitCode = 1;
await context.close();
await browser.close();
