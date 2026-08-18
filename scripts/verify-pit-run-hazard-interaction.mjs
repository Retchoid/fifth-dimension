import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
await page.goto(`${origin}/?arcade-verifier=true&arcade-scene-verify=pit-run&arcade-cabinet-focus=true`, { waitUntil: "domcontentloaded" });
const stage = page.locator(".pit-run-stage");
await stage.waitFor({ state: "visible", timeout: 7_000 });
const box = await stage.boundingBox();
if (!box) throw new Error("Pit Run stage has no bounds");
const laneX = [0.26, 0.5, 0.74];
const readHits = async () => Number(/HITS\s+(\d+)/.exec((await page.locator(".pit-run-hud").textContent()) ?? "")?.[1] ?? 0);
const hitsBefore = await readHits();
let target = null;
const deadline = Date.now() + 12_000;
await page.mouse.move(box.x + box.width * .5, box.y + box.height * .72);
await page.mouse.down();
while (Date.now() < deadline && (await readHits()) === hitsBefore) {
  const hazards = await page.locator(".pit-run-entity.is-hazard").evaluateAll((nodes) => nodes.map((node) => {
    const match = String(node.className).match(/lane-(\d)/);
    return { className: String(node.className), lane: Number(match?.[1] ?? 1), depth: Number.parseFloat((node).style.getPropertyValue("--pit-depth")) };
  }));
  target = hazards.find((hazard) => hazard.depth >= 58 && hazard.depth <= 97) ?? target;
  if (target) await page.mouse.move(box.x + box.width * laneX[target.lane], box.y + box.height * .72, { steps: 3 });
  await page.waitForTimeout(70);
}
await page.mouse.up();
const result = { target, hitsBefore, hitsAfter: await readHits(), runnerClass: await page.locator(".pit-runner").getAttribute("class") };
console.log(JSON.stringify(result, null, 2));
if (result.hitsAfter <= result.hitsBefore) process.exitCode = 1;
await context.close();
await browser.close();
