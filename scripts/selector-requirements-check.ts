import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const game = readFileSync(resolve(projectRoot, "client/src/components/DjMiniGame.tsx"), "utf8");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const releaseGate = readFileSync(resolve(projectRoot, "client/src/lib/releaseGate.ts"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");
const leaderboardRouter = readFileSync(resolve(projectRoot, "server/routers.ts"), "utf8");
const leaderboardDb = readFileSync(resolve(projectRoot, "server/db.ts"), "utf8");

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
  ["ordered arcade sequence queue", game, "const pendingArcadeSequenceRef = useRef<ArcadeSequence[]>([])"],
  ["shared arcade sequence launcher", game, "const startArcadeSequence = (sequence: ArcadeSequence) =>"],
  ["active splash relay", game, "const [activeArcadeSequence, setActiveArcadeSequence]"],
  ["splash relay timer", game, "const arcadeSequenceTimerRef"],
  ["record-spin scene handoff", game, "isRecordTransitioning"],
  ["record-spin transition layer", game, "record-spin-transition"],
  ["active police scene rendering", game, "activeArcadeSequence === \"police\""],
  ["active pill scene rendering", game, "activeArcadeSequence === \"pill\""],
  ["protected game-frame scheduling", game, "const queueGameFrame = () =>"],
  ["game-frame run guard", game, "const gameRunIdRef"],
  ["queued sequence continuation", game, "const resumeOrAdvanceArcadeSequence = () =>"],
  ["Level 2 transition priority", game, "if (advanceToLevelTwo) {\n      startLevelTwo();"],
  ["Level 2 Crowd Pressure arrival", game, "isLevelTwoTransitioning"],
  ["Level 2 arrival overlay", game, "level-two-arrival-overlay"],
  ["Level 2 Crowd Pressure Bonus copy", game, "CROWD PRESSURE BONUS!"],
  ["compact lower Crowd Pressure meter", styles, "right: 1rem; bottom: 1rem;"],
  ["Level 1 18-dub dancers", game, "level-one-streak-dancers"],
  ["Level 2 dancers", game, "level-two-dancer-backdrop"],
  ["speaker-stack dancers", game, "speaker-stack-dancers"],
  ["five-dubplate selector salute", game, "BOH!<br />BOH!<br />BIG UP"],
  ["Level 2 Run The Riddim reward", game, "RUN THE<br />RIDDIM!"],
  ["pill pitch wobble", game, "pill-pitch-wobble"],
  ["fire-escape bonus", game, "bonus-fire-escape-facade"],
  ["rolling bonus obstacles", game, "bonusSpawnTimerRef.current >= 2.6"],
  ["bonus climb helper", game, "const climbBonusLadder = () =>"],
  ["bonus keyboard climb", game, 'e.key === "ArrowUp" || e.key === "w" || e.key === "W"'],
  ["bonus pointer capture", game, "e.currentTarget.setPointerCapture(e.pointerId);"],
  ["bonus swipe movement", game, "moveBonusSideways(Math.sign(dx) as -1 | 1);"],
  ["bonus mobile touch surface", styles, "touch-action: none;"],
  ["Facebook RESPEKT action", game, "I FOLLOWED — RESPEKT"],
  ["personalized terminal finale", game, "BIG UP BADMAN"],
  ["shared leaderboard query", leaderboardRouter, "leaderboard: publicProcedure.query"],
  ["shared leaderboard score mutation", leaderboardRouter, "submitScore: publicProcedure"],
  ["shared leaderboard database write", leaderboardDb, "saveArcadeLeaderboardEntry"],
  ["shared leaderboard client query", game, "trpc.arcade.leaderboard.useQuery"],
  ["shared leaderboard client write", game, "submitSharedScore.mutate"],
  ["public tag confirmation", game, "PUBLIC BOARD"],
  ["start-screen public leaderboard", game, "arcade-start-leaderboard"],
  ["start-screen public leaderboard styling", styles, ".arcade-start-leaderboard"],
  ["canonical falling-item rules", game, "const FALLING_ITEM_RULES"],
  ["balanced falling-item weights", game, "const SPAWN_WEIGHTS"],
  ["shared collision radius", game, "const catcherReach = 13 + item.hitRadius"],
  ["current versioned release key", releaseGate, "5d-selector-showdown-download-unlocked-v5"],
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

if (home.includes("RAGGA / AMEN / BASS")) {
  throw new Error("The removed hero RAGGA / AMEN / BASS label was reintroduced");
}

if (home.includes("arcade-graffiti-flow")) {
  throw new Error("The removed release-to-arcade decorative line layer was reintroduced");
}

const levelTwoCompletionIndex = game.indexOf("if (completeLevelTwo) {");
const levelTwoTransitionIndex = game.indexOf("if (advanceToLevelTwo) {");
const queuedSequenceIndex = game.indexOf("const queuedSequences: ArcadeSequence[] = [");
if (levelTwoCompletionIndex < 0 || levelTwoTransitionIndex < 0 || queuedSequenceIndex < 0 || levelTwoCompletionIndex > queuedSequenceIndex || levelTwoTransitionIndex > queuedSequenceIndex) {
  throw new Error("Level completion or Level 2 handoff no longer takes priority over queued pickup splashes");
}

const prohibitedDirectionGlyphs = /[←→◀▶↔]/;
if (prohibitedDirectionGlyphs.test(`${game}\n${home}`)) {
  throw new Error("Direction-symbol UI copy was reintroduced into the site or arcade source");
}

console.log(`selector requirement checks passed: ${requirements.length} game/release hooks, ${mixTitles.length} archive titles, and no prohibited direction glyphs.`);
