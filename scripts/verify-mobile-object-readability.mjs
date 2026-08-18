import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const viewports = [[360, 800], [375, 812], [390, 844], [412, 915], [430, 932]];
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const results = [];

for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
  const start = page.locator(".tape-play-button");
  await start.scrollIntoViewIfNeeded();
  await start.click();
  await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 5_000 });
  const field = page.locator(".game-viewport");
  await field.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2_700);
  const inspection = await page.evaluate(() => {
    const field = document.querySelector(".game-viewport")?.getBoundingClientRect();
    if (!field) return null;
    return Array.from(document.querySelectorAll(".falling-object")).map((wrapper) => {
      const art = wrapper.querySelector(".urban-prop-asset, .lion-head-pickup");
      const wrapperBox = wrapper.getBoundingClientRect();
      const artBox = art?.getBoundingClientRect() ?? wrapperBox;
      const scale = Number.parseFloat(wrapper.getAttribute("style")?.match(/--item-visual-scale:\s*([\d.]+)/)?.[1] ?? "1");
      return {
        type: [...wrapper.classList].find((value) => value !== "falling-object") ?? "unknown",
        scale,
        collision: { width: wrapperBox.width, height: wrapperBox.height },
        visual: { width: artBox.width, height: artBox.height },
        visualInsidePlayfield: artBox.left >= field.left - 1 && artBox.right <= field.right + 1,
        belowHud: artBox.top >= field.top + 18,
      };
    });
  });
  if (!inspection || inspection.length === 0) throw new Error(`${width}x${height}: no active falling objects rendered`);
  const readable = inspection.every((item) => item.scale >= 1.62 && item.visual.width >= item.collision.width * 1.55 && item.visualInsidePlayfield && item.belowHud);
  results.push({ viewport: `${width}x${height}`, objects: inspection, accepted: readable });
  await context.close();
}

console.log(JSON.stringify({ origin, results, accepted: results.every((result) => result.accepted) }, null, 2));
if (!results.every((result) => result.accepted)) process.exitCode = 1;
await browser.close();
