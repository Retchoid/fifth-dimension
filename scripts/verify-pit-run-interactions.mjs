import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?arcade-mechanics-debug=true&arcade-cabinet-focus=true`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => Boolean(window.__selectahDebug), null, { timeout: 10_000 });
await page.evaluate(() => window.__selectahDebug.startPitRun());
const stage = page.locator(".pit-run-stage");
await stage.waitFor({ state: "visible", timeout: 7_000 });
const box = await stage.boundingBox();
if (!box) throw new Error("Pit Run stage has no bounds");

const entity = page.locator(".pit-run-entity").first();
await entity.waitFor({ state: "visible", timeout: 7_000 });
const entityClass = await entity.getAttribute("class");
const laneMatch = entityClass?.match(/lane-(\d)/);
if (!laneMatch) throw new Error(`Pit Run entity is missing a lane: ${entityClass}`);
const lane = Number(laneMatch[1]);
const isGear = entityClass.includes("is-gear");
const inventoryBefore = await page.locator(".pit-run-inventory .secured").count();
const hitsBefore = await page.locator(".pit-run-hud").textContent();
const laneX = [0.26, 0.5, 0.74][lane];
await page.mouse.move(box.x + box.width * .5, box.y + box.height * .72);
await page.mouse.down();
await page.mouse.move(box.x + box.width * laneX, box.y + box.height * .72, { steps: 7 });
await page.mouse.up();

if (isGear) {
  await page.waitForFunction((before) => document.querySelectorAll(".pit-run-inventory .secured").length > before, inventoryBefore, { timeout: 8_000 });
} else {
  await page.waitForFunction((before) => (document.querySelector(".pit-run-hud")?.textContent ?? "") !== before, hitsBefore, { timeout: 8_000 });
}

const result = {
  entityClass,
  lane,
  runnerClass: await page.locator(".pit-runner").getAttribute("class"),
  inventoryBefore,
  inventoryAfter: await page.locator(".pit-run-inventory .secured").count(),
  hitsBefore,
  hitsAfter: await page.locator(".pit-run-hud").textContent(),
  resolution: isGear ? "gear-recovered" : "hazard-hit",
};
console.log(JSON.stringify(result, null, 2));
await context.close();
await browser.close();
