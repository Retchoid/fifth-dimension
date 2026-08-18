import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });

async function runMode(name, query) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${origin}/?${query}`, { waitUntil: "domcontentloaded" });
  const start = page.locator(".tape-play-button");
  await start.scrollIntoViewIfNeeded();
  await start.click();
  await page.waitForFunction(() => !document.querySelector(".game-overlay"), null, { timeout: 5_000 });

  const playfield = page.locator(".game-viewport");
  const surface = page.locator(".input-surface.input-capture-layer.is-active");
  await playfield.scrollIntoViewIfNeeded();
  const playfieldBox = await playfield.boundingBox();
  const surfaceBox = await surface.boundingBox();
  if (!playfieldBox || !surfaceBox) throw new Error(`${name}: permanent input surface was not rendered`);
  const y = playfieldBox.y + playfieldBox.height * .74;
  const at = (ratio) => playfieldBox.x + playfieldBox.width * ratio;
  const playerX = () => page.locator(".dj-catcher").evaluate((element) => {
    const player = element.getBoundingClientRect();
    const field = element.closest(".game-viewport")?.getBoundingClientRect();
    if (!field || field.width <= 0) return null;
    return ((player.left + player.width / 2 - field.left) / field.width) * 100;
  });
  const playerGeometry = () => page.locator(".dj-catcher").evaluate((element) => {
    const player = element.getBoundingClientRect();
    const field = element.closest(".game-viewport")?.getBoundingClientRect();
    const offsetParent = element.offsetParent?.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      inlineWorldX: element.style.getPropertyValue("--player-world-x"),
      computedLeft: style.left,
      computedPosition: style.position,
      computedTransform: style.transform,
      player: { left: player.left, width: player.width },
      field: field ? { left: field.left, width: field.width } : null,
      offsetParent: offsetParent ? { left: offsetParent.left, width: offsetParent.width } : null,
    };
  });
  const domState = () => page.evaluate(() => ({
    surfaceCount: document.querySelectorAll(".input-surface.input-capture-layer").length,
    traceVisible: Boolean(document.querySelector(".real-input-debug-panel")),
    frameHidden: Boolean(document.querySelector(".game-shell.cabinet-frame-hidden")),
  }));

  await page.mouse.move(at(.10), y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  const ten = await playerX();
  await page.mouse.move(at(.50), y, { steps: 8 });
  await page.waitForTimeout(60);
  const fifty = await playerX();
  await page.mouse.move(at(.90), y, { steps: 8 });
  await page.waitForTimeout(60);
  const ninety = await playerX();
  await page.mouse.up();

  const tracePanel = page.locator(".real-input-debug-panel");
  const trace = await tracePanel.count() ? (await tracePanel.textContent() ?? "") : "";
  const state = await domState();
  const surfaceCoversPlayableInterior = Math.abs(playfieldBox.x - surfaceBox.x) <= 4 && Math.abs(playfieldBox.y - surfaceBox.y) <= 4 && Math.abs(playfieldBox.width - surfaceBox.width) <= 8 && Math.abs(playfieldBox.height - surfaceBox.height) <= 8;
  const moves = [ten, fifty, ninety].every((value) => typeof value === "number") && ten <= 14 && fifty >= 45 && fifty <= 55 && ninety >= 86;
  const debugContract = name === "debug-on"
    ? state.traceVisible && trace.includes("PLAYER STATE X:") && trace.includes("PLAYER HITBOX X:") && trace.includes("ACTUAL SPRITE X:")
    : !state.traceVisible;
  const accepted = state.surfaceCount === 1 && surfaceCoversPlayableInterior && moves && debugContract && (name !== "frame-off" || state.frameHidden);
  const result = { name, state, playfieldBox, surfaceBox, surfaceCoversPlayableInterior, ten, fifty, ninety, playerGeometry: await playerGeometry(), trace: trace.replace(/\s+/g, " ").trim(), accepted };
  await context.close();
  return result;
}

const results = [
  await runMode("debug-on", "debugInput=1"),
  await runMode("debug-off", ""),
  await runMode("frame-off", "frameOff=1"),
];

console.log(JSON.stringify({ origin, viewport: "390x844", results, accepted: results.every((result) => result.accepted) }, null, 2));
if (!results.every((result) => result.accepted)) process.exitCode = 1;
await browser.close();
