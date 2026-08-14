import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const game = readFileSync(resolve(projectRoot, "client/src/components/DjMiniGame.tsx"), "utf8");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const releaseGate = readFileSync(resolve(projectRoot, "client/src/lib/releaseGate.ts"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

const requirements: Array<[string, string, string]> = [
  ["Selectah title", game, "SELECTAH"],
  ["Level 1 target", game, "const REQUIRED_RECORDS = 25"],
  ["Level 2 target", game, "const LEVEL_TWO_REQUIRED_RECORDS = 50"],
  ["Level 1 music", game, "startLevelOneMusic();"],
  ["Level 2 music transition", game, "LEVEL_TWO_TRACK_OFFSET_SECONDS"],
  ["chain-break persistence proof", game, 'onUnlockDownload?.("chain-break-complete")'],
  ["chain-break timing", game, "setChainBreakComplete(true)"],
  ["coin pickup cue", game, "const playPickupToken = () =>"],
  ["coin cue invoked for positive pickups", game, "playPickupToken();"],
  ["record scratch and laser", game, "const playRecordScratch = () =>"],
  ["turntable pickup cue", game, "const playTurntablePickup = () =>"],
  ["45-adapter pickup cue", game, "const playAdapterPickup = () =>"],
  ["police seizure overlay", game, "isPoliceSeizurePaused"],
  ["crowd exit overlay", game, "isCrowdAngerPaused"],
  ["pill overload overlay", game, "isPillOverloadPaused"],
  ["three-mixer reward", game, "isCrateBonusPaused"],
  ["three-turntable reward", game, "isHeadphonesBonusPaused"],
  ["Level 1 18-dub dancers", game, "level-one-streak-dancers"],
  ["Level 2 dancers", game, "level-two-dancer-backdrop"],
  ["fire-escape bonus", game, "bonus-fire-escape-facade"],
  ["rolling bonus obstacles", game, "bonusSpawnTimerRef.current >= 2.6"],
  ["bonus climb helper", game, "const climbBonusLadder = () =>"],
  ["bonus keyboard climb", game, 'e.key === "ArrowUp" || e.key === "w" || e.key === "W"'],
  ["bonus pointer capture", game, "e.currentTarget.setPointerCapture(e.pointerId);"],
  ["bonus swipe movement", game, "moveBonusSideways(Math.sign(dx) as -1 | 1);"],
  ["bonus mobile touch surface", styles, "touch-action: none;"],
  ["Facebook RESPEKT action", game, "I FOLLOWED — RESPEKT"],
  ["personalized terminal finale", game, "BIG UP BADMAN"],
  ["current versioned release key", releaseGate, "5d-selector-showdown-download-unlocked-v3"],
  ["exact release storage gate", home, "isReleaseUnlockStored"],
];

for (const [label, source, fragment] of requirements) {
  if (!source.includes(fragment)) throw new Error(`Missing requirement hook: ${label}`);
}

const mixTitles = [
  "CFMU Hostile Airwaves May 9",
  "Deep On Rolling",
  "Minianimilism 2",
  "Live festival house mix 2022",
  "Holes in Our Souls",
  "Festival live mix house — Side A",
  "Festival live mix house — Side B",
  "Festival live mix house — Side C",
  "Festival live mix house — Side D",
];

for (const title of mixTitles) {
  if (!home.includes(`title: "${title}"`)) throw new Error(`Missing archive mix: ${title}`);
}

const prohibitedDirectionGlyphs = /[←→◀▶↔]/;
if (prohibitedDirectionGlyphs.test(`${game}\n${home}`)) {
  throw new Error("Direction-symbol UI copy was reintroduced into the site or arcade source");
}

console.log(`selector requirement checks passed: ${requirements.length} game/release hooks, ${mixTitles.length} archive titles, and no prohibited direction glyphs.`);
