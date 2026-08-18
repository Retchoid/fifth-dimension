import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

// This route uses the normal public page and public Start Session button. The
// two query flags only render diagnostic text and object hitboxes; no window
// debug object, state setter, test spawn, or collision injection is called.
await page.goto(`${origin}/?arcade-real-input-debug=true&arcade-mechanics-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
const startBox = await start.boundingBox();
if (!startBox) throw new Error("Public Start Session control is not visible");

const startPoint = { x: startBox.x + startBox.width / 2, y: startBox.y + startBox.height / 2 };
await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });

const playfield = page.locator(".game-viewport");
await playfield.scrollIntoViewIfNeeded();
const field = await playfield.boundingBox();
if (!field) throw new Error("Public game playfield is not visible");

const gestureY = field.y + field.height * 0.74;
await page.mouse.move(field.x + field.width * 0.08, gestureY);
await page.mouse.down();

const logText = async () => page.locator(".mechanics-debug-log").textContent().then((value) => value ?? "");
const countEvent = (text, event) => (text.match(new RegExp(event, "g")) ?? []).length;
const visibleRecords = async () => page.locator(".records-hud").textContent().then((text) => Number(/(\d+)\s*\//.exec(text ?? "")?.[1] ?? 0));
const gameplaySnapshot = () => page.evaluate(() => {
  const numberAfter = (source, pattern) => Number(pattern.exec(source)?.[1] ?? 0);
  const hudBadges = [...document.querySelectorAll(".game-hud .hud-badge")].map((node) => node.textContent ?? "");
  const recordsText = document.querySelector(".records-hud")?.textContent ?? "";
  const comboText = document.querySelector(".combo-badge")?.textContent ?? "";
  const scoreText = hudBadges.find((text) => text.includes("SCORE:")) ?? "";
  const traceText = document.querySelector(".real-input-debug-panel")?.textContent ?? "";
  return {
    records: numberAfter(recordsText, /(\d+)\s*\//),
    score: numberAfter(scoreText, /SCORE:\s*(\d+)/),
    combo: numberAfter(comboText, /COMBO:\s*(\d+)x/),
    cleanStreak: numberAfter(traceText, /CLEAN STREAK:\s*(\d+)\/15/),
  };
});
const visibleObjects = async () => page.locator(".falling-object").evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return { id: node.getAttribute("data-game-object-id"), className: node.className, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}));

async function chaseRenderedObject(label, matchingClasses, expectedLog, baselineCount = 0, baselineRecords = null, avoidHazards = true) {
  const deadline = Date.now() + 35_000;
  while (Date.now() < deadline) {
    const objects = await visibleObjects();
    const imminentHazard = objects.find((item) => {
      const centreY = item.y + item.height / 2;
      return /\b(cop|pill|phone|bottle|apple)\b/.test(String(item.className)) && centreY >= field.y + field.height * 0.42 && centreY <= field.y + field.height * 0.88;
    });
    if (avoidHazards && imminentHazard) {
      const hazardRatio = (imminentHazard.x + imminentHazard.width / 2 - field.x) / field.width;
      await page.mouse.move(field.x + field.width * (hazardRatio < .5 ? .92 : .08), gestureY, { steps: 4 });
      await page.waitForTimeout(90);
      continue;
    }
    const candidate = objects.find((item) => {
      const classNames = String(item.className).split(/\s+/);
      const isRequested = matchingClasses.some((type) => classNames.includes(type));
      const centreY = item.y + item.height / 2;
      return isRequested && centreY >= field.y + field.height * 0.55 && centreY <= field.y + field.height * 0.86;
    });
    if (candidate) {
      const candidateStateBefore = await gameplaySnapshot();
      await page.mouse.move(candidate.x + candidate.width / 2, gestureY, { steps: 5 });
      await page.waitForTimeout(220);
      const eventAdvanced = countEvent(await logText(), expectedLog) > baselineCount;
      const recordAdvanced = baselineRecords === null || (await visibleRecords()) > baselineRecords;
      if (eventAdvanced && recordAdvanced) return { label, candidate, stateBefore: candidateStateBefore, stateAfter: await gameplaySnapshot() };
    }
    await page.waitForTimeout(70);
  }
  throw new Error(`Timed out waiting for a real rendered ${label} collision`);
}

const catchResult = await chaseRenderedObject("dubplate", ["record"], "collision=catch");
const caughtObjectId = catchResult.candidate.id;
await page.waitForFunction((id) => !document.querySelector(`[data-game-object-id="${id}"]`), caughtObjectId, { timeout: 2000 }).catch(() => undefined);
const caughtObjectRemoved = await page.locator(`[data-game-object-id="${caughtObjectId}"]`).count() === 0;
const catchLogAfterResolution = await logText();
const caughtObjectCatchCount = (catchLogAfterResolution.match(new RegExp(`id=${caughtObjectId}\\s.*collision=catch`, "g")) ?? []).length;
const caughtObjectMissCount = (catchLogAfterResolution.match(new RegExp(`id=${caughtObjectId}\\s.*collision=miss`, "g")) ?? []).length;
const caughtObjectStateDelta = {
  records: catchResult.stateAfter.records - catchResult.stateBefore.records,
  score: catchResult.stateAfter.score - catchResult.stateBefore.score,
  combo: catchResult.stateAfter.combo - catchResult.stateBefore.combo,
  cleanStreak: catchResult.stateAfter.cleanStreak - catchResult.stateBefore.cleanStreak,
};
const caughtObjectStateAdvancedOnce = caughtObjectStateDelta.records === 1 && caughtObjectStateDelta.combo === 1 && caughtObjectStateDelta.cleanStreak === 1 && caughtObjectStateDelta.score > 0;
// Hold at the edge between outcomes while the same public game loop schedules
// the next obstacle; no object or collision is manufactured by the test.
await page.mouse.move(field.x + field.width * 0.08, gestureY, { steps: 3 });
const hazardResult = await chaseRenderedObject("hazard", ["cop", "pill", "phone"], "collision=hazard", 0, null, false);
await page.waitForTimeout(620);
const recoveryStatusSeen = await page.locator(".mixer-recovery-status").count() > 0;
const recoveryCatchResults = [];
const recoveryStages = [await page.locator(".mixer-recovery-status").textContent().then((value) => value ?? "")];
const recoveryLogSnapshots = [];
for (let index = 0; index < 3; index += 1) {
  await page.waitForTimeout(560);
  const priorCatches = countEvent(await logText(), "collision=catch");
  const priorRecords = await visibleRecords();
  recoveryCatchResults.push(await chaseRenderedObject(`recovery dubplate ${index + 1}`, ["record"], "collision=catch", priorCatches, priorRecords));
  recoveryLogSnapshots.push(await logText());
  recoveryStages.push(await page.locator(".mixer-recovery-status").textContent({ timeout: 800 }).catch(() => "REPAIRED"));
}
const livesAfterRecovery = await page.locator(".lives-badge").textContent().then((value) => value ?? "");
const selectorClassesAfterRepair = await page.locator(".dj-catcher").getAttribute("class");
const repairBurstVisible = /mixer-repaired/.test(selectorClassesAfterRepair ?? "");
const mixerDamageCleared = await page.locator(".mixer-recovery-status").count() === 0;
const recoveryLogMilestones = recoveryLogSnapshots.join(" ");
const recoveryMilestonesObserved = ["mixer-recovery=1/3", "mixer-recovery=2/3", "mixer-recovery=3/3", "mixer-recovery=repaired"].every((milestone) => recoveryLogMilestones.includes(milestone));
await page.mouse.move(field.x + field.width * .9, gestureY, { steps: 4 });
await page.waitForTimeout(80);
const playerLeftAfterRecovery = await page.locator(".dj-catcher").evaluate((node) => node.style.left);
// Move to the far edge opposite the next approaching rendered hazard. Its
// disappearance without another hazard log demonstrates avoidance after recovery.
let avoidedHazard = false;
const avoidDeadline = Date.now() + 30_000;
const hazardEventsBeforeAvoid = countEvent(await logText(), "collision=hazard");
while (Date.now() < avoidDeadline && !avoidedHazard) {
  const objects = await visibleObjects();
  const hazard = objects.find((item) => /\b(cop|pill|phone)\b/.test(String(item.className)) && item.y + item.height / 2 >= field.y + field.height * 0.48);
  if (hazard) {
    const ratio = (hazard.x + hazard.width / 2 - field.x) / field.width;
    await page.mouse.move(field.x + field.width * (ratio < .5 ? .92 : .08), gestureY, { steps: 4 });
    const hazardId = hazard.id;
    await page.waitForFunction((id) => !document.querySelector(`[data-game-object-id="${id}"]`), hazardId, { timeout: 5000 }).catch(() => undefined);
    avoidedHazard = countEvent(await logText(), "collision=hazard") === hazardEventsBeforeAvoid;
  } else {
    await page.waitForTimeout(80);
  }
}
await page.mouse.up();

const trace = await page.locator(".real-input-debug-panel").textContent();
const log = await logText();
await playfield.screenshot({ path: "/home/ubuntu/webdev-static-assets/selectah-real-ui-gameplay-390.png" });

console.log(JSON.stringify({
  viewport: "390x844",
  publicStartButton: "clicked through rendered browser pointer sequence",
  realPointerSurface: await playfield.evaluate((node) => ({ className: node.className, touchAction: getComputedStyle(node).touchAction })),
  catchResult,
  caughtObjectId,
  caughtObjectRemoved,
  caughtObjectCatchCount,
  caughtObjectMissCount,
  caughtObjectStateDelta,
  caughtObjectStateAdvancedOnce,
  hazardResult,
  recoveryStatusSeen,
  recoveryCatchResults,
  recoveryStages,
  recoveryLogMilestones,
  recoveryMilestonesObserved,
  livesAfterRecovery,
  repairBurstVisible,
  mixerDamageCleared,
  playerLeftAfterRecovery,
  avoidedHazard,
  visibleTrace: trace?.replace(/\s+/g, " ").trim(),
  collisionLog: log.replace(/\s+/g, " ").trim(),
}, null, 2));

await context.close();
await browser.close();
