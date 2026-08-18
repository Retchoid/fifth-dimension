import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const requiredLabels = ["CROWD PRESSURE", "WRONG TUNE", "POLICE SEIZED MIXER", "TOO HIGH TO PLAY", "MIXER DAMAGED", "MIXER REPAIRED", "DOWNLOAD UNLOCK"];
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
if (await page.locator(".bonus-debug-panel").count()) throw new Error("bonus diagnostics visible without explicit developer query");

await page.goto(`${origin}/?arcade-bonus-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
await start.click();
await page.locator(".bonus-debug-panel").waitFor({ state: "visible" });
const panelText = await page.locator(".bonus-debug-panel").innerText();
for (const label of requiredLabels) {
  if (!panelText.includes(label)) throw new Error(`bonus debug panel missing ${label}`);
}
for (const field of ["ELIGIBLE:", "BLOCKED:", "REASON:", "TRIGGERS:", "LAST:", "STATE:"]) {
  if (!panelText.includes(field)) throw new Error(`bonus debug panel missing field ${field}`);
}
await page.evaluate(() => window.__selectahDebug?.triggerSequence("police"));
await page.waitForFunction(() => document.querySelector(".bonus-debug-panel")?.textContent?.includes("POLICE SEIZED MIXER") && document.querySelector(".bonus-debug-panel")?.textContent?.includes("TRIGGERS: 1"));

console.log(JSON.stringify({ origin, normalPanelHidden: true, requiredLabels, policeTriggerRecorded: true }, null, 2));
await context.close();
await browser.close();
