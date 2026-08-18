import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
await page.goto(`${origin}/?arcade-mechanics-debug=true&arcade-cabinet-focus=true`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => Boolean(window.__selectahDebug), null, { timeout: 10_000 });
await page.evaluate(() => window.__selectahDebug.completeLevelTwoPitRunHandoff());
const stage = page.locator(".pit-run-stage");
await stage.waitFor({ state: "visible", timeout: 7_000 });
const bridge = page.locator(".pit-run-bridge-card");
await bridge.waitFor({ state: "visible", timeout: 3_000 });
const bridgeText = (await bridge.textContent())?.replace(/\s+/g, " ").trim();
await page.locator(".pit-run-entity").first().waitFor({ state: "visible", timeout: 5_000 });
const geometry = await stage.evaluate((node) => {
  const stageBox = node.getBoundingClientRect();
  const runner = document.querySelector(".pit-runner")?.getBoundingClientRect();
  const hud = document.querySelector(".pit-run-hud")?.getBoundingClientRect();
  const inventory = document.querySelector(".pit-run-inventory")?.getBoundingClientRect();
  return {
    stageWidth: stageBox.width,
    runnerInside: !!runner && runner.left >= stageBox.left && runner.right <= stageBox.right && runner.bottom <= stageBox.bottom,
    hudSecondary: !!hud && hud.width < stageBox.width * .48 && hud.top >= stageBox.top && hud.bottom <= stageBox.bottom,
    inventorySecondary: !!inventory && inventory.width < stageBox.width * .6 && inventory.top >= stageBox.top && inventory.bottom <= stageBox.bottom,
    entities: document.querySelectorAll(".pit-run-entity").length,
  };
});
const result = {
  stageVisible: await stage.count() === 1,
  levelThreeHud: (await page.locator(".pit-run-hud").textContent())?.replace(/\s+/g, " ").trim(),
  bridge: bridgeText,
  frameClass: await stage.getAttribute("class"),
  geometry,
};
console.log(JSON.stringify(result, null, 2));
if (!result.stageVisible || !result.levelThreeHud?.includes("LEVEL 3") || !result.bridge?.includes("AFTERPARTY?") || !result.bridge.includes("GRAB THE GEAR.") || !geometry.runnerInside || !geometry.hudSecondary || !geometry.inventorySecondary || geometry.entities < 1) process.exitCode = 1;
await context.close();
await browser.close();
