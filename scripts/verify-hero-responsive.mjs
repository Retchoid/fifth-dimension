import { chromium } from "playwright";

const origin = process.env.MECHANICS_ORIGIN ?? "http://127.0.0.1:3000";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet-650", width: 650, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.width <= 650, hasTouch: viewport.width <= 650 });
  const page = await context.newPage();
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const inspection = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const hero = rect(".hero");
    const content = rect(".hero-content");
    const heading = rect(".hero h1");
    const logo = rect(".hero-logo-stage");
    const cta = rect(".hero .neon-button.magenta");
    const pageWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (!hero || !content || !heading || !logo || !cta) return null;
    const desktopComposition = window.innerWidth > 980;
    return {
      viewport: window.innerWidth,
      documentWidth: pageWidth,
      headingInsideContent: heading.left >= content.left - 1 && heading.right <= content.right + 1,
      ctaInsideHero: cta.left >= hero.left && cta.right <= hero.right && cta.top >= hero.top && cta.bottom <= hero.bottom,
      titleClearsArt: !desktopComposition || heading.right <= logo.left + 8,
      titleRows: Math.round(heading.height / parseFloat(getComputedStyle(document.querySelector(".hero h1")).lineHeight || "1")),
      heading,
      logo,
    };
  });
  if (!inspection) throw new Error(`${viewport.name}: missing hero elements`);
  const accepted = inspection.documentWidth <= viewport.width + 1 && inspection.headingInsideContent && inspection.ctaInsideHero && inspection.titleClearsArt;
  results.push({ ...viewport, inspection, accepted });
  await context.close();
}

console.log(JSON.stringify({ origin, results, accepted: results.every((result) => result.accepted) }, null, 2));
if (!results.every((result) => result.accepted)) process.exitCode = 1;
await browser.close();
