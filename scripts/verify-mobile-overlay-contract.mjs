import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?arcade-real-input-debug=true`, { waitUntil: "domcontentloaded" });
const overlay = page.locator(".game-overlay");
const start = page.locator(".tape-play-button");
await overlay.waitFor({ state: "visible", timeout: 4000 });
await start.scrollIntoViewIfNeeded();
const startBox = await start.boundingBox();
if (!startBox) throw new Error("Start overlay button not visible");
const modalPoint = { x: startBox.x + startBox.width / 2, y: startBox.y + startBox.height / 2 };
const modalAudit = await page.evaluate(({ x, y }) => {
  const target = document.elementFromPoint(x, y);
  const playfield = document.querySelector(".game-viewport");
  return {
    target: target ? `${target.tagName.toLowerCase()}${target.className ? `.${String(target.className).trim().replace(/\s+/g, ".")}` : ""}` : "none",
    overlayPresent: Boolean(document.querySelector(".game-overlay")),
    gameState: playfield?.getAttribute("data-gameplay-state") ?? "none",
  };
}, modalPoint);

await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });
const field = page.locator(".game-viewport");
await field.scrollIntoViewIfNeeded();
const fieldBox = await field.boundingBox();
if (!fieldBox) throw new Error("Playfield missing after start overlay dismissed");
const x = fieldBox.x + fieldBox.width * .5;
const y = fieldBox.y + fieldBox.height * .74;
await page.mouse.move(x, y);
await page.mouse.down();
await page.waitForTimeout(60);
const activeAudit = await page.evaluate(() => ({
  overlayPresent: Boolean(document.querySelector(".game-overlay")),
  gameState: document.querySelector(".game-viewport")?.getAttribute("data-gameplay-state") ?? "none",
  trace: document.querySelector(".real-input-debug-panel")?.textContent?.replace(/\s+/g, " ").trim() ?? "missing",
}));
await page.mouse.up();
console.log(JSON.stringify({ viewport: "390x844", modalAudit, activeAudit }, null, 2));
if (!modalAudit.overlayPresent || modalAudit.gameState === "PLAYING" || activeAudit.overlayPresent || !activeAudit.trace.includes("TOUCH TARGET: div.game-viewport") || activeAudit.gameState !== "PLAYING") process.exitCode = 1;
await context.close();
await browser.close();
