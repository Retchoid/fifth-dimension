import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const frames = [
  { key: "club-exit", className: "pit-run-frame-club-exit" },
  { key: "deep-pit", className: "pit-run-frame-deep-pit" },
  { key: "afterparty-arrival", className: "pit-run-frame-afterparty-arrival" },
];
const viewports = [320, 360, 375, 390, 412, 430].map((width) => ({ width, height: 844 }));
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const results = [];

for (const viewport of viewports) {
  for (const frame of frames) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(`${origin}/?arcade-mechanics-debug=true`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window).__selectahDebug), null, { timeout: 10_000 });
    await page.evaluate((frameKey) => (window).__selectahDebug.showPitRunFrame(frameKey), frame.key);
    const stage = page.locator(".pit-run-stage");
    await stage.waitFor({ state: "visible" });
    await stage.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Array.from(document.querySelectorAll(".pit-run-world-art")).every((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0), null, { timeout: 10_000 });
    if (frame.key !== "club-exit") await page.waitForTimeout(650);
    const inspection = await stage.evaluate((node, expectedFrame) => {
      const box = node.getBoundingClientRect();
      const runner = document.querySelector(".pit-run-runner, .pit-runner")?.getBoundingClientRect();
      const hud = document.querySelector(".pit-run-hud")?.getBoundingClientRect();
      const inventory = document.querySelector(".pit-run-inventory")?.getBoundingClientRect();
      const entityCount = document.querySelectorAll(".pit-run-entity").length;
      const imagesLoaded = Array.from(document.querySelectorAll(".pit-run-world-art")).every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0);
      return {
        hasExpectedFrame: node.classList.contains(expectedFrame),
        imagesLoaded,
        entityCount,
        runnerInsideStage: !!runner && runner.left >= box.left && runner.right <= box.right && runner.bottom <= box.bottom,
        hudSecondary: !!hud && hud.width < box.width * .48 && hud.top >= box.top && hud.bottom <= box.bottom,
        inventorySecondary: !!inventory && inventory.width < box.width * .6 && inventory.top >= box.top && inventory.bottom <= box.bottom,
        stageWidth: box.width,
      };
    }, frame.className);
    const accepted = inspection.hasExpectedFrame && inspection.imagesLoaded && inspection.runnerInsideStage && inspection.hudSecondary && inspection.inventorySecondary && inspection.stageWidth > 0;
    results.push({ viewport: `${viewport.width}x${viewport.height}`, frame: frame.key, inspection, accepted });
    if (process.env.PIT_RUN_SCREENSHOT_DIR && viewport.width === 390) {
      await page.screenshot({ path: `${process.env.PIT_RUN_SCREENSHOT_DIR}/pit-run-${frame.key}-390.png` });
    }
    await context.close();
  }
}

console.log(JSON.stringify({ origin, results, accepted: results.every((result) => result.accepted) }, null, 2));
if (!results.every((result) => result.accepted)) process.exitCode = 1;
await browser.close();
