import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const correctedAsset = "/manus-storage/level1-approved-locked-169-alley_8924f5b5.png";
const viewports = [
  { width: 320, height: 800, isMobile: true, hasTouch: true },
  { width: 360, height: 800, isMobile: true, hasTouch: true },
  { width: 375, height: 812, isMobile: true, hasTouch: true },
  { width: 390, height: 844, isMobile: true, hasTouch: true },
  { width: 412, height: 915, isMobile: true, hasTouch: true },
  { width: 430, height: 932, isMobile: true, hasTouch: true },
  { width: 768, height: 1024, isMobile: false, hasTouch: false },
  { width: 1280, height: 720, isMobile: false, hasTouch: false },
];
const retiredFlatSelectors = [
  ".neon-backstreet-background",
  ".backstreet-brick-facade",
  ".backstreet-police-van",
  ".backstreet-npc",
  ".stage-edge-speaker",
  ".stage-npc-reaction",
];

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const results = [];

for (const { width, height, isMobile, hasTouch } of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile, hasTouch });
  const page = await context.newPage();
  const focusedSceneUrl = `${origin}/?arcade-scene-verify=items-level-one&arcade-focus=true`;
  let artworkLoaded = false;
  for (let attempt = 0; attempt < 2 && !artworkLoaded; attempt += 1) {
    if (attempt === 0) {
      await page.goto(focusedSceneUrl, { waitUntil: "domcontentloaded" });
    } else {
      await page.reload({ waitUntil: "domcontentloaded" });
    }
    await page.waitForSelector(".game-viewport .level-one-sunset-alley-art", { timeout: 8_000 });
    artworkLoaded = await page.waitForFunction((asset) => {
      const image = document.querySelector(".level-one-sunset-alley-art");
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0 && image.getAttribute("src") === asset;
    }, correctedAsset, { timeout: 12_000 }).then(() => true).catch(() => false);
  }
  await page.waitForSelector(".falling-object", { timeout: 8_000 });

  const inspection = await page.evaluate((selectors) => {
    const field = document.querySelector(".game-viewport")?.getBoundingClientRect();
    const backgroundPlane = document.querySelector(".game-grid-bg")?.getBoundingClientRect();
    const imageElement = document.querySelector(".level-one-sunset-alley-art");
    const image = imageElement?.getBoundingClientRect();
    const catcherCount = document.querySelectorAll(".dj-catcher").length;
    const retiredLayerCount = selectors.reduce((count, selector) => count + document.querySelectorAll(selector).length, 0);
    const items = Array.from(document.querySelectorAll(".falling-object")).map((wrapper) => {
      const art = wrapper.querySelector(".urban-prop-asset, .lion-head-pickup");
      const collision = wrapper.getBoundingClientRect();
      const visual = art?.getBoundingClientRect() ?? collision;
      return {
        type: [...wrapper.classList].find((className) => className !== "falling-object") ?? "unknown",
        visualLargerThanCollision: visual.width >= collision.width * 1.55,
        visualInsideField: Boolean(field) && visual.left >= field.left - 1 && visual.right <= field.right + 1 && visual.top >= field.top + 18 && visual.bottom <= field.bottom + 1,
      };
    });
    return {
      field: field ? { width: field.width, height: field.height } : null,
      backgroundPlane: backgroundPlane ? { width: backgroundPlane.width, height: backgroundPlane.height } : null,
      artworkSource: imageElement?.getAttribute("src") ?? null,
      artworkReady: imageElement instanceof HTMLImageElement && imageElement.complete && imageElement.naturalWidth > 0,
      artworkCoversBackgroundPlane: Boolean(backgroundPlane && image) && image.width >= backgroundPlane.width - 1 && image.height >= backgroundPlane.height - 1,
      catcherCount,
      retiredLayerCount,
      itemCount: items.length,
      items,
    };
  }, retiredFlatSelectors);

  inspection.artworkReady = artworkLoaded && inspection.artworkReady;

  const accepted = Boolean(
    inspection.field &&
    inspection.artworkSource === correctedAsset &&
    inspection.artworkReady &&
    inspection.artworkCoversBackgroundPlane &&
    inspection.catcherCount === 1 &&
    inspection.retiredLayerCount === 0 &&
    inspection.itemCount > 0 &&
    inspection.items.every((item) => item.visualLargerThanCollision && item.visualInsideField),
  );
  results.push({ viewport: `${width}x${height}`, ...inspection, accepted });
  await context.close();
}

console.log(JSON.stringify({ origin, correctedAsset, results, accepted: results.every((result) => result.accepted) }, null, 2));
if (!results.every((result) => result.accepted)) process.exitCode = 1;
await browser.close();
