import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });

async function startAndCheck(pathname) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/${pathname}`, { waitUntil: "domcontentloaded" });
  const start = page.locator(".tape-play-button");
  await start.scrollIntoViewIfNeeded();
  await start.click();
  await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });
  const panel = page.locator(".real-input-debug-panel");
  const result = { count: await panel.count(), text: (await panel.count()) > 0 ? (await panel.textContent()) ?? "" : "" };
  await context.close();
  return result;
}

const normal = await startAndCheck("");
const debug = await startAndCheck("?debugInput=1");
const debugRetainsFields = ["TOUCH ACTIVE:", "CAPTURE ELEMENT:", "WORLD X:", "RENDERED X:", "LAST PLAYER WRITE:", "CLEAN STREAK:", "BONUS ELIGIBLE:"].every((field) => debug.text.includes(field));

console.log(JSON.stringify({ origin, normalPanelHidden: normal.count === 0, debugPanelVisible: debug.count === 1, debugRetainsFields }, null, 2));
if (normal.count !== 0 || debug.count !== 1 || !debugRetainsFields) process.exitCode = 1;
await browser.close();
