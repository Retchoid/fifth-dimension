import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const game = readFileSync(resolve(projectRoot, "client/src/components/DjMiniGame.tsx"), "utf8");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const releaseGate = readFileSync(resolve(projectRoot, "client/src/lib/releaseGate.ts"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const leaderboardRouter = readFileSync(resolve(projectRoot, "server/routers.ts"), "utf8");
const leaderboardDb = readFileSync(resolve(projectRoot, "server/db.ts"), "utf8");
const afterpartyStyles = readFileSync(resolve(projectRoot, "client/src/afterparty-runner.css"), "utf8");
const arcadeRepairStyles = readFileSync(resolve(projectRoot, "client/src/arcade-repair.css"), "utf8");
const postHeroStyles = readFileSync(resolve(projectRoot, "client/src/posthero-cohesion.css"), "utf8");
const gameVisualStyles = readFileSync(resolve(projectRoot, "client/src/game-visual-system.css"), "utf8");
const gameplayClarityStyles = readFileSync(resolve(projectRoot, "client/src/gameplay-clarity.css"), "utf8");
const rewardCalloutStyles = readFileSync(resolve(projectRoot, "client/src/reward-callout.css"), "utf8");
const fiveDPlayaStyles = readFileSync(resolve(projectRoot, "client/src/five-d-playa.css"), "utf8");
const responsiveRepairStyles = readFileSync(resolve(projectRoot, "client/src/responsive-visual-repair.css"), "utf8");
const miamiArcadeStyles = readFileSync(resolve(projectRoot, "client/src/miami-arcade-stage.css"), "utf8");
const djLinks = readFileSync(resolve(projectRoot, "client/src/lib/djLinks.ts"), "utf8");

const requirements: Array<[string, string, string]> = [
  ["Selectah title", game, "SELECTAH"],
  ["Level 1 target", game, "const REQUIRED_RECORDS = 25"],
  ["Level 2 target", game, "const LEVEL_TWO_REQUIRED_RECORDS = 50"],
  ["Level 1 music", game, "startLevelOneMusic();"],
  ["Level 2 music transition", game, "LEVEL_TWO_TRACK_OFFSET_SECONDS"],
  ["chain-break persistence proof", game, 'onUnlockDownload?.("chain-break-complete")'],
  ["fresh-session release unlock", home, "window.sessionStorage.getItem(DOWNLOAD_UNLOCK_STORAGE_KEY)"],
  ["current-session release proof", home, "window.sessionStorage.setItem(DOWNLOAD_UNLOCK_STORAGE_KEY, DOWNLOAD_UNLOCK_STORAGE_VALUE)"],
  ["chain-break timing", game, "setChainBreakComplete(true)"],
  ["coin pickup cue", game, "const playPickupToken = () =>"],
  ["coin cue invoked for positive pickups", game, "playPickupToken();"],
  ["coin pickup primary oscillator", game, "const coinPrimary = context.createOscillator();"],
  ["coin pickup harmonics", game, "const coinHarmonic = context.createOscillator();"],
  ["coin pickup separation after scratch", game, "const now = context.currentTime + 0.22;"],
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
  ["full-screen screen-spin dissolve field", game, "transition-spinfield"],
  ["screen-spin iris dissolve", game, "transition-iris-outer"],
  ["screen-spin dissolve caption", game, "SPIN DISSOLVE / BACK TO THE SET"],
  ["compact active-game HUD", game, "game-hud-clear"],
  ["compact active-game HUD styling", styles, ".game-hud-clear"],
  ["no blocking active-stage poster boxes", game, "rave-glowstick rave-glowstick-one"],
  ["mobile live-play verifier", game, "arcade-viewport-verify"],
  ["mobile non-held transition verifier", game, "viewportVerificationMode === \"transition\""],
  ["compact Hype meter safeguard", gameplayClarityStyles, ".level-two-hype-meter.level-two-hype-meter-in-world"],
  ["post-loss curbside scene", game, "loss-curb-overlay"],
  ["post-loss reset handoff", game, "showLossComedown();"],
  ["phone-width post-loss verifier", game, "arcade-loss-verify"],
  ["post-loss curbside styling", gameplayClarityStyles, ".loss-curb-overlay"],
  ["active police scene rendering", game, "activeArcadeSequence === \"police\""],
  ["active pill scene rendering", game, "activeArcadeSequence === \"pill\""],
  ["active rewind scene rendering", game, "activeArcadeSequence === \"rewind\""],
  ["active wheel scene rendering", game, "activeArcadeSequence === \"wheel\""],
  ["active crowd scene rendering", game, "activeArcadeSequence === \"crowd\""],
  ["active crate scene rendering", game, "activeArcadeSequence === \"crate\""],
  ["active headphones scene rendering", game, "activeArcadeSequence === \"headphones\""],
  ["active Boh scene rendering", game, "activeArcadeSequence === \"boh\""],
  ["active riddim scene rendering", game, "activeArcadeSequence === \"riddim\""],
  ["protected game-frame scheduling", game, "const queueGameFrame = () =>"],
  ["game-frame run guard", game, "const gameRunIdRef"],
  ["queued sequence continuation", game, "const resumeOrAdvanceArcadeSequence = () =>"],
  ["Level 2 transition priority", game, "if (advanceToLevelTwo) {\n      startLevelTwo();"],
  ["Level 2 Crowd Pressure arrival", game, "isLevelTwoTransitioning"],
  ["Level 2 arrival overlay", game, "level-two-arrival-overlay"],
  ["Level 2 Crowd Pressure Bonus copy", game, "CROWD PRESSURE BONUS!"],
  ["Level 2 explicit record-spin prelude", game, "setIsRecordTransitioning(true);"],
  ["Level 2 record-spin bridge duration", game, "window.setTimeout(beginLevelTwoArrival, 560)"],
  ["compact lower Crowd Pressure meter", styles, "right: 1rem; bottom: 1rem;"],
  ["Level 1 18-dub dancers", game, "level-one-streak-dancers"],
  ["Level 2 dancers", game, "level-two-dancer-backdrop"],
  ["speaker-stack dancers", game, "speaker-stack-dancers"],
  ["Level 1 speaker dancer milestone", game, "level === 1 && recordsCaught >= 20"],
  ["Level 2 speaker dancer milestone", game, "level === 2 && recordsCaught >= LEVEL_TWO_REQUIRED_RECORDS"],
  ["five-dubplate selector salute", game, "BOH!<br />BOH!<br />BIG UP"],
  ["Level 2 Run The Riddim reward", game, "RUN THE<br />RIDDIM!"],
  ["pill pitch wobble", game, "pill-pitch-wobble"],
  ["Level 2 after-party gate", game, "const BONUS_START_RECORDS = 20"],
  ["zero-hit after-party gate", game, "bonusThresholdReached && currentLives === 4"],
  ["isolated after-party runner", game, "afterparty-runner-stage"],
  ["rear-view runner sprite", game, "selector-dj-rear-runner_00e1ae94"],
  ["required after-party gear", game, "const BONUS_GEAR_TYPES"],
  ["after-party road hazards", game, "const BONUS_HAZARD_TYPES"],
  ["runner lane controls", game, "const setBonusLaneFromClientX"],
  ["runner immediate hazard end", game, "GEAR SPILLED — BONUS OVER"],
  ["fair runner progress duration", game, "2.75) * dt"],
  ["fair runner spawn cadence", game, "bonusSpawnTimerRef.current >= 1.08"],
  ["fair runner active-entity cap", game, "bonusObstaclesRef.current.length < 3"],
  ["fair runner lane spacing", game, "const openLanes = [0, 1, 2].filter"],
  ["fair runner safe-lane preference", game, "const safeLanes = openLanes.filter"],
  ["runner dedicated breakbeat", game, "afterparty-runner-fast-breakbeat"],
  ["after-party style layer", afterpartyStyles, ".afterparty-runner-stage"],
  ["descending after-party light", afterpartyStyles, ".party-floor-5 .afterparty-distant-building"],
  ["purple camo reward", afterpartyStyles, ".bonus-camo-unlocked .dj-sprite"],
  ["runner gear and hazard readability", afterpartyStyles, ".afterparty-entity b"],
  ["runner transparent generated-asset map", game, "const URBAN_RUNNER_ASSETS"],
  ["runner transparent generated-asset layer", game, "urban-runner-asset"],
  ["runner transparent generated-asset styling", afterpartyStyles, ".afterparty-entity .urban-runner-asset"],
  ["runner generated venue entrance", game, "afterparty-venue-art"],
  ["runner generated venue entrance styling", afterpartyStyles, ".afterparty-venue-art"],
  ["runner high-contrast road", arcadeRepairStyles, ".afterparty-road"],
  ["between-level Big Up below score box", game, "pre-level-two-like"],
  ["post-hero cohesion layer", postHeroStyles, "Post-hero cohesion pass"],
  ["post-hero existing palette system", postHeroStyles, "#00e7ff"],
  ["game-only visual audit layer", gameVisualStyles, "Selectah Showdown"],
  ["game shared cabinet visual grammar", gameVisualStyles, ".arcade-cabinet-bezel"],
  ["game Level 1 background visual grammar", gameVisualStyles, ".game-grid-bg:not(.level-two-grid-bg)"],
  ["clear-lane urban stage art", gameVisualStyles, "selectah-level-one-urban-stage-reference_43ddc07a.png"],
  ["game Level 2 background visual grammar", gameVisualStyles, ".level-two-booth"],
  ["matte-safe DJ sprite treatment", gameVisualStyles, "mask-image:radial-gradient"],
  ["game player and dancer visual grammar", gameVisualStyles, ".dj-catcher-art,.dj-sprite"],
  ["game prop visual grammar", gameVisualStyles, ".falling-object"],
  ["field urban-brawler asset map", game, "const URBAN_PROP_ASSETS"],
  ["field transparent generated-asset layer", game, "urban-prop-asset"],
  ["field transparent generated-asset styling", rewardCalloutStyles, ".falling-object .urban-prop-asset"],
  ["5D Playa archive branding", home, "5D PLAYA"],
  ["5D Playa archive queue", home, "five-d-playa-queue"],
  ["5D Playa automatic next-mix handoff", home, "onEnded={playNextFiveDMix}"],
  ["5D Playa detachable state", home, "fiveDPlayerDetached"],
  ["5D Playa direct archive audio remains", home, "<audio controls preload=\"metadata\" src={mix.file}"],
  ["5D Playa direct archive downloads remain", home, "className=\"mix-download\""],
  ["5D Playa direct archive shares remain", home, "className=\"mix-share\""],
  ["game cut-in visual grammar", gameVisualStyles, ".rewind-reward-overlay"],
  ["shared hard-outline splash frame", gameVisualStyles, "Every interruption receives one high-contrast"],
  ["game bonus-stage visual grammar", gameVisualStyles, ".afterparty-runner-stage"],
  ["public crown marker", game, "hasBonusCrown"],
  ["durable bonus-clear crown proof", game, "shouldAwardBonusCrown(completedLevel, bonusCompletedRef.current)"],
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
  ["smaller shared falling record", game, "record: { size: 32, hitRadius: 9"],
  ["lower all-level dubplate rate", game, "1: [[\"record\", 45.5]"],
  ["lower Crowd Pressure dubplate rate", game, "2: [[\"record\", 37]"],
  ["faster Crowd Pressure cadence", game, "levelRef.current === 2 ? 0.72 : 1.10"],
  ["faster Crowd Pressure fall speed", game, "levelRef.current === 2 ? 50 : 36"],
  ["faster Crowd Pressure music", game, "bgMusicRef.current.playbackRate = 1.09"],
  ["Level 1 music-rate reset", game, "audio.playbackRate = 1;"],
  ["shared collision radius", game, "const catcherReach = 13 + item.hitRadius"],
  ["two-consecutive-hazard threshold", game, "if (consecutiveHazardCountRef.current >= 2)"],
  ["consecutive cop counter", game, "if (item.type === \"cop\") policeBadgeHitsRef.current = consecutiveHazardCountRef.current;"],
  ["consecutive pill counter", game, "if (item.type === \"pill\") pillHitsRef.current = consecutiveHazardCountRef.current;"],
  ["consecutive phone counter", game, "if (item.type === \"phone\") phoneHitsRef.current = consecutiveHazardCountRef.current;"],
  ["phone crowd warning", game, "if (item.type === \"phone\") pauseForCrowdAnger = true;"],
  ["fair named-hazard exposure schedule", game, "scheduledNamedHazardExposure(levelRef.current, namedHazardSpawnCountRef.current)"],
  ["named-hazard exposure counter reset", game, "namedHazardSpawnCountRef.current = 0;"],
  ["BOH first award cannot be suppressed", game, "pauseForBohBonus = true;"],
  ["separate Big Up reward trigger", game, "bigUpAwardedRef.current"],
  ["BOH without Big Up combined copy", game, 'boh: { label: "BOH! BOH!"'],
  ["Big Up standalone action", game, 'setComboReaction("big-up")'],
  ["animated Big Up reward styling", rewardCalloutStyles, ".in-world-reward-big-up"],
  ["Big Up distinct speaker-stack visual", gameplayClarityStyles, ".combo-big-up"],
  ["Run the Riddim first award cannot be suppressed", game, "pauseForRiddimBonus = true;"],
  ["Gun Finger extended readability", game, "nextReaction === \"gun-fingers\" ? 1750"],
  ["Gun Finger non-blocking in-world callout", game, "announceInWorldReward(\"GUN FINGER MASSIVE\""],
  ["sprite underlay removed", gameVisualStyles, ".dj-catcher::before { background:transparent; filter:none; box-shadow:none; }"],
  ["green reward signal", gameVisualStyles, "rgba(185,255,79,.92)"],
  ["red hazard signal", gameVisualStyles, "rgba(255,55,75,.94)"],
  ["official adaptive canonical URL preserved", indexHtml, 'property="og:url" content="https://fifthdim-ahhcmq4d.manus.space/"'],
  ["official adaptive image preserved", indexHtml, 'property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663887234637/SPFreeeJWSngaXXD.png"'],
  ["large image social card preserved", indexHtml, 'name="twitter:card" content="summary_large_image"'],
  ["archive native playback preserved", home, '<audio controls preload="metadata" src={mix.file}'],
  ["archive MP3 download preserved", home, 'download={mix.downloadName} className="mix-download"'],
  ["archive share control preserved", home, 'className="mix-share" onClick={() => { setSharedMixId(mix.id);'],
  ["archive share call to action preserved", home, 'check out 5th Dimension music official site for more content, games and upcoming events'],
  ["Mixcloud compact widget disabled", djLinks, "mini=0"],
  ["SoundCloud visual overlay disabled", djLinks, "visual=false"],
  ["SoundCloud standard-player artwork field suppressed", djLinks, "show_artwork=false"],
  ["SoundCloud player uses signal cyan", djLinks, "color=%2300e7ff"],
  ["SoundCloud mobile tint correction", responsiveRepairStyles, ".soundcloud-embed-shell iframe"],
  ["all release paint artwork removed", responsiveRepairStyles, ".download-box-edge-paint"],
  ["post-hero unified graphite field", responsiveRepairStyles, ":is(.listen-section,.bio-section,.genre-mixes-section,.projects-section,.visuals-section,.booking-section,.contact-section)"],
  ["top-menu 5D Playa launcher", home, "header-playa-launch"],
  ["top-right detached 5D Playa position", home, "setFiveDPlayerDetached"],
  ["archive detach duplicate hidden", fiveDPlayaStyles, ".five-d-playa-detach { display:none!important; }"],
  ["Miami arcade stage field", miamiArcadeStyles, ".minigame-section::before"],
  ["Miami cyan and magenta cabinet shell", miamiArcadeStyles, ".arcade-cabinet-bezel"],
  ["DJ sprite backing blend cleanup", gameVisualStyles, "mix-blend-mode:screen"],
  ["dramatically larger foreground speaker stage", gameplayClarityStyles, "transform:scale(2.25)!important"],
  ["Level 2 speaker foreground position", gameplayClarityStyles, "transform:translateY(0) scale(1.42)!important"],
  ["mobile heading single column", responsiveRepairStyles, "grid-template-columns:minmax(0,1fr) !important"],
  ["mobile heading wrapping", responsiveRepairStyles, "overflow-wrap:anywhere !important"],
  ["mobile player label wrapping", responsiveRepairStyles, ".five-d-playa-now strong,.five-d-playa-label b,.five-d-playa-label em"],
  ["Bonus 2 route clears entity labels", afterpartyStyles, ".afterparty-entity b{display:none;}"],
  ["same-type bottle/core crowd threshold", game, "if (hazardHitsRef.current >= 2)"],
  ["two-pill overload warning", game, "if (item.type === \"pill\") pauseForPillOverload = true;"],
  ["three-mixer crate threshold", game, "if (mixerPickupCountRef.current >= 3)"],
  ["three-turntable headphones threshold", game, "if (turntablePickupCountRef.current >= 3)"],
  ["five-dubplate Boh threshold", game, "if (nextRecordsCaught >= 5 && !bohBonusAwardedRef.current)"],
  ["Boh reward value", game, "currentScore += 250;"],
  ["Level 2 fifteen-dubplate Riddim threshold", game, "if (levelRef.current === 2 && nextRecordsCaught >= 15 && !riddimBonusAwardedRef.current)"],
  ["Riddim reward value", game, "currentScore += 500;"],
  ["spaced in-world rewards", game, "const canShowInWorldReward = nextRecordsCaught - lastInWorldRewardRecordRef.current >= 7;"],
  ["non-blocking reward dispatcher", game, "announceInWorldReward(rewardCopy[sequence].label, rewardCopy[sequence].quip, sequence);"],
  ["in-world reward layer", game, "in-world-reward${inWorldReward.kind"],
  ["first-bonus clean-run rule", game, "const firstBonusEligible = currentLives >= 3;"],
  ["first-bonus green-camo confirmation", game, "GREEN CAMO EQUIPPED FOR LEVEL 2"],
  ["first-bonus real entry", game, "const startLevelOneNoRequestBonus = () => {"],
  ["first-bonus real Keep Playing handoff", game, "if (bonusEligibleRef.current) {\n      startLevelOneNoRequestBonus();"],
  ["first-bonus success-only green camo", game, "if (cleared) {\n      setGreenCamoUnlocked(true);"],
  ["second-bonus purple camo", game, "setBonusCamoUnlocked(true);"],
  ["eighteen-combo Rewind threshold", game, "} else if (nextCombo >= 18 && !rewindAwardedRef.current)"],
  ["thirty-combo Wheel threshold", game, "if (nextCombo >= 30 && !wheelItUpAwardedRef.current)"],
  ["Level 2 gear-dash record threshold", game, "if (levelRef.current === 2 && nextRecordsCaught >= BONUS_START_RECORDS && !bonusTriggeredRef.current)"],
  ["zero-hit gear-dash launch guard", game, "if (bonusThresholdReached && currentLives === 4 && !bonusTriggeredRef.current)"],
  ["Level 2 fifty-dubplate completion", game, "if (levelRef.current === 2 && nextRecordsCaught >= LEVEL_TWO_REQUIRED_RECORDS)"],
  ["Reference audit Rewind perspective tunnel", game, "rewind-time-tunnel"],
  ["Reference audit Rewind record focal object", game, "rewind-record-splash"],
  ["Reference audit Wheel radial special-stage treatment", game, "wheel-ray"],
  ["Reference audit Wheel turntable focal object", game, "wheel-turntable"],
  ["Reference audit Police vehicle foreground plane", game, "sega-police-car"],
  ["Reference audit Police pixel DJ reaction", game, "police-dj-reaction"],
  ["Reference audit Crowd interior depth planes", game, "empty-club-room"],
  ["Reference audit Crowd speaker silhouettes", game, "empty-club-speaker"],
  ["Reference audit Pill character portrait", game, "dopey-dj-portrait"],
  ["Reference audit Pill high-contrast wobble treatment", game, "pill-pitch-wobble"],
  ["Reference audit Crate collectible silhouettes", game, "crate-record"],
  ["Reference audit Headphones collectible silhouette", game, "rave-headphones"],
  ["Reference audit Boh vinyl focal object", game, "selector-salute-record"],
  ["Reference audit Riddim speaker focal object", game, "riddim-speaker-stack"],
  ["Reference audit pixelated stage backdrop", styles, "image-rendering: pixelated;"],
  ["Reference audit pixelated police character", styles, ".police-dj-reaction img"],
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
