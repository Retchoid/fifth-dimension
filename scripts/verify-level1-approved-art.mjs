import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const gameSource = readFileSync(resolve(root, "client/src/components/DjMiniGame.tsx"), "utf8");
const canonicalCss = readFileSync(resolve(root, "client/src/level1-canonical-environment.css"), "utf8");
const canonicalAssets = [
  { state: "golden", records: 0, asset: "/manus-storage/1000001169_3204905a.png" },
  { state: "waking", records: 10, asset: "/manus-storage/1000001162_aa49120d.png" },
  { state: "dusk", records: 15, asset: "/manus-storage/1000001166_e9b75dd0.png" },
  { state: "night", records: 25, asset: "/manus-storage/1000001168_c5184bab.png" },
];
const retiredAssets = [
  "level1-approved-locked-169-alley_8924f5b5.png",
  "level1-approved-sunset-alley_4371e45d.png",
  "1000001036.png",
  "1000001095.png",
];
const checks = [
  ...canonicalAssets.map(({ asset }) => ({ name: `canonical asset ${asset}`, pass: gameSource.includes(asset) })),
  { name: "canonical master registry", pass: gameSource.includes("LEVEL_ONE_MASTER_ASSETS") },
  { name: "forward-only master mapping", pass: gameSource.includes('if (stage <= 1) return "golden";') && gameSource.includes('if (stage <= 2) return "waking";') && gameSource.includes('if (stage === 3) return "dusk";') && gameSource.includes('return "night";') },
  { name: "four image elements", pass: canonicalAssets.every(({ state }) => gameSource.includes(`level-one-master-art-${state}`)) },
  { name: "fixed image frame", pass: canonicalCss.includes("inset: 0 !important") && canonicalCss.includes("object-fit: cover !important") && canonicalCss.includes("object-position: 50% 50% !important") },
  { name: "no procedural Level 1 population render", pass: !gameSource.includes("level-one-approved-population") && !gameSource.includes("levelOneBackgroundPopulationCount") },
  ...retiredAssets.map((asset) => ({ name: `retired asset absent: ${asset}`, pass: !gameSource.includes(asset) && !canonicalCss.includes(asset) })),
];
const accepted = checks.every(({ pass }) => pass);
console.log(JSON.stringify({ canonicalAssets, accepted, checks }, null, 2));
if (!accepted) process.exitCode = 1;
