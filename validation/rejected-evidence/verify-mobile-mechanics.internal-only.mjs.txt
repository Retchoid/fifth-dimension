import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const viewports = [
  [320, 800],
  [360, 800],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
];

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const results = [];

for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/?arcade-mobile-matrix=true&arcade-mechanics-debug=true&arcade-focus=true`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.arcadeMobileMatrix !== undefined, null, { timeout: 7000 });
  const probe = await page.evaluate(() => ({
    matrix: document.documentElement.dataset.arcadeMobileMatrix,
    detail: document.documentElement.dataset.arcadeMobileMatrixDetail,
    movement: document.documentElement.dataset.arcadeMobileMatrixMovement,
    touchAction: getComputedStyle(document.querySelector(".game-viewport")).touchAction,
    logs: Array.from(document.querySelectorAll(".mechanics-debug-log small"), node => node.textContent),
  }));
  if (width === 390 && height === 844) {
    const evidencePlayfield = page.locator(".arcade-cabinet-bezel .game-viewport");
    probe.evidenceTarget = await evidencePlayfield.evaluate((node) => ({ className: node.className, text: node.textContent?.slice(0, 80), bounds: node.getBoundingClientRect().toJSON() }));
    await evidencePlayfield.screenshot({ path: "/home/ubuntu/webdev-static-assets/selectah-mechanics-debug-390-final.png" });
  }
  results.push({ viewport: `${width}x${height}`, ...probe });
  await context.close();
}

const keyboardContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const keyboardPage = await keyboardContext.newPage();
await keyboardPage.goto(`${origin}/?arcade-viewport-verify=live&arcade-focus=true`, { waitUntil: "domcontentloaded" });
await keyboardPage.waitForSelector(".game-viewport[data-gameplay-state='PLAYING']", { timeout: 7000 });
await keyboardPage.waitForTimeout(150);
const initialLeft = await keyboardPage.locator(".dj-catcher").evaluate((node) => node.style.left);
await keyboardPage.keyboard.down("a");
await keyboardPage.waitForTimeout(180);
await keyboardPage.keyboard.up("a");
const finalLeft = await keyboardPage.locator(".dj-catcher").evaluate((node) => node.style.left);

console.log(JSON.stringify({
  matrix: results,
  keyboardFallback: { initialLeft, finalLeft, movedLeft: Number.parseFloat(finalLeft) < Number.parseFloat(initialLeft) },
}, null, 2));

await keyboardContext.close();
await browser.close();
