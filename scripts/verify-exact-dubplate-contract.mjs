import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?debugInput=1&arcade-mechanics-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });

const capture = page.locator(".input-capture-layer.is-active");
await capture.scrollIntoViewIfNeeded();
const bounds = await capture.boundingBox();
if (!bounds) throw new Error("Dedicated capture surface is not visible");
const gestureY = bounds.y + bounds.height * .74;
await page.mouse.move(bounds.x + bounds.width * .08, gestureY);
await page.mouse.down();

const snapshot = () => page.evaluate(() => {
  const recordsText = document.querySelector(".records-hud")?.textContent ?? "";
  const comboText = document.querySelector(".combo-badge")?.textContent ?? "";
  const scoreText = [...document.querySelectorAll(".game-hud .hud-badge")].map((node) => node.textContent ?? "").find((text) => text.includes("SCORE:")) ?? "";
  const trace = document.querySelector(".real-input-debug-panel")?.textContent ?? "";
  const number = (text, pattern) => Number(pattern.exec(text)?.[1] ?? 0);
  return {
    records: number(recordsText, /(\d+)\s*\//),
    score: number(scoreText, /SCORE:\s*(\d+)/),
    combo: number(comboText, /COMBO:\s*(\d+)x/),
    cleanStreak: number(trace, /CLEAN STREAK:\s*(\d+)\/15/),
  };
});

let proof = null;
const deadline = Date.now() + 35_000;
while (Date.now() < deadline && !proof) {
  const objects = await page.locator(".falling-object").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { id: node.getAttribute("data-game-object-id"), classes: String(node.className), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }));
  const record = objects.find((item) => /\brecord\b/.test(item.classes) && item.y + item.height / 2 >= bounds.y + bounds.height * .55 && item.y + item.height / 2 <= bounds.y + bounds.height * .86);
  if (!record?.id) {
    await page.waitForTimeout(50);
    continue;
  }
  const before = await snapshot();
  await page.mouse.move(record.x + record.width / 2, gestureY, { steps: 5 });
  await page.waitForTimeout(240);
  const after = await snapshot();
  const stillPresent = await page.locator(`[data-game-object-id="${record.id}"]`).count() > 0;
  const logEntries = await page.locator(".mechanics-debug-log small").allTextContents();
  const sameObjectEntries = logEntries.filter((entry) => entry.includes(`id=${record.id} `));
  const catchCount = sameObjectEntries.filter((entry) => entry.includes("collision=catch")).length;
  const missCount = sameObjectEntries.filter((entry) => entry.includes("collision=miss")).length;
  if (!stillPresent && catchCount === 1) proof = { id: record.id, before, after, removed: !stillPresent, catchCount, missCount };
}

await page.mouse.up();
if (!proof) throw new Error("Timed out waiting for a one-time real rendered dubplate collision");
const deltas = {
  records: proof.after.records - proof.before.records,
  score: proof.after.score - proof.before.score,
  combo: proof.after.combo - proof.before.combo,
  cleanStreak: proof.after.cleanStreak - proof.before.cleanStreak,
};
const accepted = proof.removed && proof.catchCount === 1 && proof.missCount === 0 && deltas.records === 1 && deltas.score > 0 && deltas.combo === 1 && deltas.cleanStreak === 1;
console.log(JSON.stringify({ viewport: "390x844", objectId: proof.id, before: proof.before, after: proof.after, deltas, removed: proof.removed, catchCount: proof.catchCount, missCount: proof.missCount, accepted }, null, 2));
if (!accepted) process.exitCode = 1;
await context.close();
await browser.close();
