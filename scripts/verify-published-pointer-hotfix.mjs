import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?arcade-real-input-debug=true`, { waitUntil: "domcontentloaded" });
const start = page.locator(".tape-play-button");
await start.scrollIntoViewIfNeeded();
await start.click();
await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 4000 });

const playfield = page.locator(".game-viewport");
await playfield.scrollIntoViewIfNeeded();
const bounds = await playfield.boundingBox();
if (!bounds) throw new Error("Rendered playfield was not available");
const y = bounds.y + bounds.height * .74;
const pointerAt = (ratio) => bounds.x + bounds.width * ratio;
const trace = () => page.locator(".real-input-debug-panel").textContent().then((text) => text ?? "");
const playerLeft = () => page.locator(".dj-catcher").evaluate((player) => player.style.left);
const hitTarget = (x) => page.evaluate(({ clientX, clientY }) => {
  const target = document.elementFromPoint(clientX, clientY);
  return target ? `${target.tagName.toLowerCase()}${target.className ? `.${String(target.className).trim().replace(/\s+/g, ".")}` : ""}` : "none";
}, { clientX: x, clientY: y });
const hudBandTarget = await page.evaluate(({ clientX, clientY }) => {
  const target = document.elementFromPoint(clientX, clientY);
  return target ? `${target.tagName.toLowerCase()}${target.className ? `.${String(target.className).trim().replace(/\s+/g, ".")}` : ""}` : "none";
}, { clientX: bounds.x + bounds.width * .5, clientY: bounds.y + Math.min(8, bounds.height * .03) });

await page.mouse.move(pointerAt(.10), y);
await page.mouse.down();
await page.waitForTimeout(80);
const atTen = { pointerRatio: .10, target: await hitTarget(pointerAt(.10)), trace: (await trace()).replace(/\s+/g, " ").trim(), playerLeft: await playerLeft() };

await page.mouse.move(pointerAt(.50), y, { steps: 8 });
await page.waitForTimeout(80);
const atFifty = { pointerRatio: .50, target: await hitTarget(pointerAt(.50)), trace: (await trace()).replace(/\s+/g, " ").trim(), playerLeft: await playerLeft() };

await page.mouse.move(pointerAt(.90), y, { steps: 8 });
await page.waitForTimeout(80);
const atNinety = { pointerRatio: .90, target: await hitTarget(pointerAt(.90)), trace: (await trace()).replace(/\s+/g, " ").trim(), playerLeft: await playerLeft() };
await page.mouse.up();

const playerPositions = [atTen, atFifty, atNinety].map((sample) => Number.parseFloat(sample.playerLeft));
const accepted = playerPositions[0] <= 12 && playerPositions[1] >= 45 && playerPositions[1] <= 55 && playerPositions[2] >= 85 && atTen.target.includes("game-viewport") && atFifty.target.includes("game-viewport") && atNinety.target.includes("game-viewport") && hudBandTarget.includes("game-viewport");
await playfield.screenshot({ path: "/home/ubuntu/webdev-static-assets/selectah-published-pointer-hotfix-390.png" });

console.log(JSON.stringify({ origin, viewport: "390x844", hudBandTarget, atTen, atFifty, atNinety, accepted }, null, 2));
if (!accepted) process.exitCode = 1;
await context.close();
await browser.close();
