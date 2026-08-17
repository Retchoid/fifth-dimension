import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(`${origin}/?arcade-focus=true&arcade-real-input-debug=true`, { waitUntil: "domcontentloaded" });
const startControl = page.getByRole("button", { name: "Start Session" });
await startControl.scrollIntoViewIfNeeded();
const startBounds = await startControl.boundingBox();
if (!startBounds) throw new Error("Public Start Session control was not found");
const startCenter = { clientX: startBounds.x + startBounds.width / 2, clientY: startBounds.y + startBounds.height / 2 };
const startTarget = await page.evaluate(({ clientX, clientY }) => {
  const element = document.elementFromPoint(clientX, clientY);
  return element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}` : null;
}, startCenter);
const startReceivesPointer = await startControl.evaluate((node, point) => node.contains(document.elementFromPoint(point.clientX, point.clientY)), startCenter);
if (startReceivesPointer) {
  await page.mouse.move(startCenter.clientX, startCenter.clientY);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 3000 });
  await page.waitForTimeout(100);
}

const playfield = page.locator(".arcade-cabinet-bezel .game-viewport");
await playfield.scrollIntoViewIfNeeded();
const bounds = await playfield.boundingBox();
if (!bounds) throw new Error("Rendered game playfield was not found");

const x = bounds.x + bounds.width * 0.5;
const y = bounds.y + bounds.height * 0.72;
await page.mouse.move(x, y);
await page.mouse.down();
await page.mouse.move(bounds.x + bounds.width * 0.08, y, { steps: 8 });
await page.mouse.move(bounds.x + bounds.width * 0.92, y, { steps: 8 });
await page.mouse.up();

const report = await page.evaluate(({ clientX, clientY }) => {
  const describe = (element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}`;
  const target = document.elementFromPoint(clientX, clientY);
  const targetPath = [];
  let current = target;
  while (current && targetPath.length < 8) {
    targetPath.push(`${current.tagName.toLowerCase()}${current.id ? `#${current.id}` : ""}${current.className ? `.${String(current.className).trim().replace(/\s+/g, ".")}` : ""}`);
    current = current.parentElement;
  }
  const playfield = document.querySelector(".arcade-cabinet-bezel .game-viewport");
  const layers = [".stage-background", ".stage-midground", ".stage-game-plane", ".stage-reactive", ".stage-foreground", ".falling-items-layer", ".dj-catcher", ".game-hud", ".game-overlay", ".mechanics-debug-log"]
    .map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, present: false };
      const style = getComputedStyle(element);
      return { selector, present: true, pointerEvents: style.pointerEvents, zIndex: style.zIndex, position: style.position };
    });
  return {
    rootFocusFlag: document.documentElement.dataset.arcadeFocusVerifier ?? null,
    target: target ? `${target.tagName.toLowerCase()}.${String(target.className).trim().replace(/\s+/g, ".")}` : null,
    elementStackAtPlayfield: document.elementsFromPoint(clientX, clientY).slice(0, 10).map(describe),
    point: { clientX, clientY },
    targetBounds: target ? target.getBoundingClientRect().toJSON() : null,
    targetPath,
    playfield: playfield ? { className: playfield.className, touchAction: getComputedStyle(playfield).touchAction } : null,
    minigame: (() => {
      const element = document.querySelector(".minigame-section");
      if (!element) return null;
      const style = getComputedStyle(element);
      return { position: style.position, zIndex: style.zIndex, pointerEvents: style.pointerEvents, opacity: style.opacity, visibility: style.visibility, bounds: element.getBoundingClientRect().toJSON() };
    })(),
    flowShell: (() => {
      const element = document.querySelector(".arcade-flow-shell");
      if (!element) return null;
      const style = getComputedStyle(element);
      return { position: style.position, zIndex: style.zIndex, overflow: style.overflow, isolation: style.isolation, transform: style.transform, bounds: element.getBoundingClientRect().toJSON() };
    })(),
    bezel: (() => {
      const element = document.querySelector(".arcade-cabinet-bezel");
      if (!element) return null;
      const style = getComputedStyle(element);
      return { position: style.position, zIndex: style.zIndex, pointerEvents: style.pointerEvents, opacity: style.opacity, visibility: style.visibility, display: style.display, bounds: element.getBoundingClientRect().toJSON() };
    })(),
    projectsStack: (() => {
      const nodes = [document.querySelector("#projects"), document.querySelector("main"), document.querySelector(".dj-site")].filter(Boolean);
      return nodes.map((element) => {
        const style = getComputedStyle(element);
        return { node: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}`, position: style.position, zIndex: style.zIndex, transform: style.transform, isolation: style.isolation, opacity: style.opacity };
      });
    })(),
    layers,
    playerLeft: document.querySelector(".dj-catcher")?.getAttribute("style") ?? null,
    realInputTrace: document.querySelector(".real-input-debug-panel")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
  };
}, { clientX: x, clientY: y });

report.playfieldBounds = bounds;
report.startControl = { bounds: startBounds, elementAtCenter: startTarget, receivesPointer: startReceivesPointer };
report.elementStackAtStart = await page.evaluate(({ clientX, clientY }) => {
  const describe = (element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}`;
  return document.elementsFromPoint(clientX, clientY).slice(0, 10).map(describe);
}, startCenter);

console.log(JSON.stringify(report, null, 2));
await context.close();
await browser.close();
