/* 5D design: preserve the crafted Sega-jungle cabinet while treating the bonus stage as a dawn-vaporwave pirate-radio detour, never a separate visual system. */
/* 5D arcade style: readable late-90s fighting-game silhouettes, loud reactive cut-ins, and visible-but-nonblocking Level 2 dancers inside the vaporwave jungle cabinet. */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Disc, ShieldAlert, Play, RotateCcw, Trophy, Volume2, VolumeX, Share2, Check } from "lucide-react";
import type { ReleaseUnlockProof } from "@/lib/releaseGate";
import { resolveFinaleTag, sanitizeSelectorTag } from "@/lib/selectorTag";
import { shouldAwardBonusCrown } from "@/lib/bonusCrown";
import { scheduledNamedHazardExposure } from "@/lib/hazardExposure";
import { reactionForCombo, stageReactions, StageReactionController, type StageReaction, type StageSnapshot } from "@/lib/stageReactionController";
import { clientXToWorldX, playerRectFromCenterX, resolveWorldCollision, type ObjectWorld, type PlayerWorld } from "@/lib/gameWorld";
import { equipmentIsDamaged, worsenEquipmentCondition, type EquipmentCondition } from "@/lib/equipmentCondition";
import { applyCrowdPressureOutcome, applyPitRunHazard, canUnlockCrowdPressure, pitRunCompletes, pitRunProgressLimit, recoverPitGear, resolveCrowdPressureOutcome, transitionChapter } from "@/lib/chapterProgression";
import { trpc } from "@/lib/trpc";
import "@/gameplay-clarity.css";
import "@/miami-arcade-stage.css";
import "@/reward-callout.css";
import "@/detailed-arcade-scenes.css";
import "@/hazard-master-style.css";
import "@/arcade-scoped-overhaul.css";
import "@/visual-recovery-arcade.css";
import "@/arcade-playfield-architecture.css";

const HIGH_SCORE_STORAGE_KEY = "5d-selector-showdown-high-score";
const FACEBOOK_RESPECT_STORAGE_KEY = "5d-selector-showdown-facebook-respect-v1";
const REQUIRED_RECORDS = 25;
const LEVEL_TWO_REQUIRED_RECORDS = 50;
const LEVEL_TWO_TRACK_OFFSET_SECONDS = 46;
type GameLevel = 1 | 2 | 3;
type GameMode = "LEVEL_1" | "BONUS_CROWD_PRESSURE" | "LEVEL_2" | "BONUS_LEVEL_2" | "LEVEL_3_PIT_RUN" | "AFTERPARTY" | "GAME_OVER";
type GameplayState = "PLAYING" | "BONUS" | "DAMAGED" | "RECOVERY" | "LEVEL_COMPLETE" | "GAME_OVER" | "LEVEL_TRANSITION";
type RealPointerDiagnostics = {
  phase: "idle" | "down" | "move" | "up" | "cancel";
  pointerX: number | null;
  localX: number | null;
  worldX: number | null;
  playerTargetX: number;
  playerActualX: number;
  captured: boolean;
  domTarget: string;
};
type BonusGearType = "headphones" | "turntable" | "mic" | "speaker" | "mixer" | "cdj";
type BonusHazardType = "cart" | "can" | "rock" | "rat";
type BonusRunnerType = BonusGearType | BonusHazardType;
type PitGearType = "crate" | "mic" | "mixer" | "cdj" | "turntable" | "headphones";
type PitHazardType = "bin" | "rat" | "bottle" | "cart" | "barrier" | "pothole";
type PitEntityType = PitGearType | PitHazardType;
type FallingItemType = "record" | "cop" | "bottle" | "apple" | "lion" | "cdj" | "mixer" | "turntable" | "adapter" | "pill" | "phone";

const URBAN_PROP_ASSETS: Partial<Record<FallingItemType, string>> = {
  record: "/embedded-assets/selectah-dubplate-urban_052862f6.png",
  cop: "/embedded-assets/selectah-police-siren-urban_5fb879fa.png",
  pill: "/embedded-assets/selectah-pill-urban_e2f4393e.png",
  phone: "/embedded-assets/selectah-phone-urban_0aebd4d4.png",
  cdj: "/embedded-assets/selectah-cdj-urban_79c0b46c.png",
  mixer: "/embedded-assets/selectah-mixer-urban_aa64e423.png",
  turntable: "/embedded-assets/selectah-turntable-urban_de17fd21.png",
  adapter: "/embedded-assets/selectah-adapter-urban_ab9d38ca.png",
  bottle: "/embedded-assets/selectah-bottle-urban_fc7e712f.png",
  apple: "/embedded-assets/selectah-apple-core-urban_66dacfaa.png",
  lion: "/embedded-assets/selectah-lion-urban_9431e50b.png",
};

const URBAN_RUNNER_ASSETS: Record<BonusRunnerType, string> = {
  headphones: "/embedded-assets/selectah-runner-gear-urban_47eea311.png",
  turntable: "/embedded-assets/selectah-turntable-urban_de17fd21.png",
  mic: "/embedded-assets/selectah-runner-gear-urban_47eea311.png",
  speaker: "/embedded-assets/selectah-speaker-stack-urban_9fd16c27.png",
  mixer: "/embedded-assets/selectah-mixer-urban_aa64e423.png",
  cdj: "/embedded-assets/selectah-cdj-urban_79c0b46c.png",
  cart: "/embedded-assets/selectah-runner-cart-urban_9a222f37.png",
  can: "/embedded-assets/selectah-runner-can-urban_b243de6f.png",
  rock: "/embedded-assets/selectah-runner-rock-urban_3cfc2fac.png",
  rat: "/embedded-assets/selectah-runner-rat-urban_42c505b7.png",
};

const FALLING_ITEM_RULES: Record<FallingItemType, { width: number; height: number; visualSize: number; tilt: number }> = {
  // `visualSize` is normalized against the unchanged selector art: regular
  // pickups are 15–28% player height, bonus gear 30–40%, hazards 18–32%.
  // `width` and `height` remain the sole collision values.
  record: { width: 5, height: 5, visualSize: 14, tilt: -7 },
  cop: { width: 6, height: 6, visualSize: 18, tilt: 0 },
  bottle: { width: 5, height: 5, visualSize: 15, tilt: 13 },
  apple: { width: 5, height: 5, visualSize: 15, tilt: -12 },
  lion: { width: 8, height: 8, visualSize: 22, tilt: 0 },
  cdj: { width: 7, height: 7, visualSize: 20, tilt: -5 },
  mixer: { width: 7, height: 7, visualSize: 20, tilt: 4 },
  turntable: { width: 7, height: 7, visualSize: 20, tilt: -4 },
  adapter: { width: 4, height: 4, visualSize: 12, tilt: 8 },
  pill: { width: 5, height: 5, visualSize: 14, tilt: -14 },
  phone: { width: 5, height: 6, visualSize: 16, tilt: 16 },
};

const SPAWN_WEIGHTS: Record<GameLevel, Array<readonly [FallingItemType, number]>> = {
  // Dubplates are less frequent in every level; Level 1 keeps its established no-bottle/no-core contract.
  1: [["record", 45.5], ["cop", 11.7], ["pill", 7.5], ["phone", 5.9], ["cdj", 7.2], ["mixer", 8.2], ["turntable", 8.2], ["adapter", 5.8]],
  // Crowd Pressure raises non-record pressure while preserving all Level 2-positive gear and crowd-only hazards.
  2: [["record", 37], ["bottle", 6.5], ["apple", 6.5], ["cop", 7], ["pill", 5.5], ["phone", 5], ["lion", 7], ["cdj", 6.5], ["mixer", 7], ["turntable", 7], ["adapter", 5]],
  3: [["record", 100]],
};

function pickFallingItemType(level: GameLevel, roll: number): FallingItemType {
  let checkpoint = 0;
  for (const [type, weight] of SPAWN_WEIGHTS[level]) {
    checkpoint += weight / 100;
    if (roll < checkpoint) return type;
  }
  return "record";
}

interface BonusRunnerEntity {
  id: number;
  lane: number;
  depth: number;
  speed: number;
  type: BonusRunnerType;
}

interface NoRequestBonusEntity {
  id: number;
  x: number;
  depth: number;
  speed: number;
  type: "cigarette" | "beer" | "spit" | "bottle";
}

interface PitRunEntity {
  id: number;
  lane: number;
  depth: number;
  speed: number;
  type: PitEntityType;
}

const CELEBRATION_DANCERS = [
  { className: "dancer-lime", src: "/embedded-assets/5d-jungle-dancer-lime_af13269a.png" },
  { className: "dancer-cyan", src: "/embedded-assets/5d-jungle-dancer-cyan_391dfc3c.png" },
  { className: "dancer-magenta", src: "/embedded-assets/5d-jungle-dancer-magenta_da5bea9b.png" },
] as const;

const COMBO_CALLOUTS = ["Big Up!", "Gun Finger Massive", "Maximum Boost", "Maximum Respekt"] as const;
const BONUS_START_RECORDS = 20;
const BONUS_GEAR_TYPES: BonusGearType[] = ["headphones", "turntable", "mic", "speaker", "mixer", "cdj"];
const BONUS_HAZARD_TYPES: BonusHazardType[] = ["cart", "can", "rock", "rat"];
const PIT_REQUIRED_GEAR: PitGearType[] = ["crate", "mic", "mixer", "cdj", "turntable", "headphones"];
const PIT_HAZARD_TYPES: PitHazardType[] = ["bin", "rat", "bottle", "cart", "barrier", "pothole"];
type ComboReaction = "big-up" | "subwoofer" | "gun-fingers" | "ground-decks" | null;
type ComboReactionKind = Exclude<ComboReaction, null>;
type ArcadeSequence = "rewind" | "wheel" | "police" | "crowd" | "pill" | "crate" | "headphones" | "boh" | "riddim";
type ArcadeDebugWindow = Window & { __selectahDebug?: { triggerSequence: (sequence: ArcadeSequence | "thrown") => void; showComboReaction: (kind: ComboReactionKind) => void; triggerRecordTransition: () => void; showLevelOneSpeakers: () => void; showItemPreview: (level: GameLevel) => void; exerciseWorldEvent: (kind: "catch" | "hazard" | "miss" | "level-complete") => void; showLossComedown: () => void; showGameOver: () => void; showUnlock: () => void; startLevelTwo: () => void; startFirstBonus: () => void; startCrowdPressureActive: () => void; clearFirstBonus: () => void; failFirstBonus: () => void; startAfterpartyBonus: () => void; clearAfterpartyBonus: () => void; failAfterpartyBonus: () => void; startPitRun: () => void; recoverPitGear: (gear: PitGearType) => void; hitPitHazard: () => void } };
interface PickupFlash {
  key: number;
  label: string;
}

interface InWorldReward {
  label: string;
  quip: string;
  kind?: "boh" | "big-up" | "riddim" | "gun-fingers" | "wheel" | "crate" | "headphones";
}

interface FallingItem extends ObjectWorld {
  id: number;
  type: FallingItemType;
  visualSize: number;
  tilt: number;
}

interface DjMiniGameProps {
  onUnlockDownload?: (proof: ReleaseUnlockProof) => void;
  onAchievementFlowComplete?: () => void;
  downloadUnlocked?: boolean;
  isUnlockCelebrating?: boolean;
  supporterGateRequired?: boolean;
  onSupporterConfirmed?: () => void;
}

function PickupLegend({ level }: { level: GameLevel }) {
  const isLevelTwo = level === 2;
  return (
    <aside className="pickup-legend" aria-label={`Level ${level} pickup guide`}>
      <div className="pickup-legend-row">
        <span className="pickup-legend-label">COLLECT</span>
        <span className="pickup-legend-chip positive"><i className="legend-icon record" />DUB +1</span>
        {isLevelTwo && <span className="pickup-legend-chip positive"><i className="legend-icon lion" />LION +2</span>}
        <span className="pickup-legend-chip positive"><i className="legend-icon adapter" />45 +2</span>
        <span className="pickup-legend-chip positive"><i className="legend-icon mixer" />MIXER +4</span>
        <span className="pickup-legend-chip positive"><i className="legend-icon deck" />DECK +3</span>
        <span className="pickup-legend-chip positive"><i className="legend-icon cdj" />CDJ +5</span>
      </div>
      <div className="pickup-legend-row pickup-legend-row-avoid">
        <span className="pickup-legend-label">AVOID</span>
        <span className="pickup-legend-chip negative"><i className="legend-icon cop" />SIREN</span>
        <span className="pickup-legend-chip negative"><i className="legend-icon pill" />PILL</span>
        <span className="pickup-legend-chip negative"><i className="legend-icon phone" />PHONE</span>
        {isLevelTwo && <span className="pickup-legend-chip negative"><i className="legend-icon crowd" />BOTTLES + CORES</span>}
      </div>
    </aside>
  );
}

export default function DjMiniGame({ onUnlockDownload, onAchievementFlowComplete, downloadUnlocked = false, isUnlockCelebrating = false, supporterGateRequired = false, onSupporterConfirmed }: DjMiniGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState<GameLevel>(1);
  const [gameMode, setGameMode] = useState<GameMode>("LEVEL_1");
  const [gameplayState, setGameplayState] = useState<GameplayState>("PLAYING");
  const [score, setScore] = useState(0);
  const [recordsCaught, setRecordsCaught] = useState(0);
  const [combo, setCombo] = useState(1);
  const comboRef = useRef(1);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [isLossComedownVisible, setIsLossComedownVisible] = useState(false);
  const [isUnlockPaused, setIsUnlockPaused] = useState(false);
  const [unlockRevealReady, setUnlockRevealReady] = useState(false);
  const [chainBreakComplete, setChainBreakComplete] = useState(false);
  const [isCabinetVibrating, setIsCabinetVibrating] = useState(false);
  const [preLevelTwoHighScore, setPreLevelTwoHighScore] = useState(false);
  const [levelTwoComplete, setLevelTwoComplete] = useState(false);
  const [finale, setFinale] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [sharedScoreStatus, setSharedScoreStatus] = useState<"idle" | "transmitting" | "saved" | "failed">("idle");
  const [musicStatus, setMusicStatus] = useState<"loading" | "ready" | "playing" | "paused" | "blocked" | "error">("loading");
  const [shared, setShared] = useState(false);
  const [facebookRespectConfirmed, setFacebookRespectConfirmed] = useState(false);
  const [isRespectSplashVisible, setIsRespectSplashVisible] = useState(false);
  const [isRespectShaking, setIsRespectShaking] = useState(false);
  const [damageFeedback, setDamageFeedback] = useState<{ label: string; lives: number; bonus?: boolean } | null>(null);
  const [inWorldReward, setInWorldReward] = useState<InWorldReward | null>(null);
  const [showComboBurst, setShowComboBurst] = useState(false);
  const [comboReaction, setComboReaction] = useState<ComboReaction>(null);
  const [isGunFingerShaking, setIsGunFingerShaking] = useState(false);
  const [pickupFlash, setPickupFlash] = useState<PickupFlash | null>(null);
  const [impactFx, setImpactFx] = useState<{ key: number; x: number; y: number; kind: "catch" | "hazard" } | null>(null);
  const [playerImpact, setPlayerImpact] = useState<"catch" | "hit" | null>(null);
  const [isCatchImpulsing, setIsCatchImpulsing] = useState(false);
  const [catchReactionVariant, setCatchReactionVariant] = useState(0);
  const [stageSnapshot, setStageSnapshot] = useState<StageSnapshot>({ level: 1, energy: 0, reaction: null, event: null, eventType: null });
  const [isRewindPaused, setIsRewindPaused] = useState(false);
  const [isWheelItUpPaused, setIsWheelItUpPaused] = useState(false);
  const [isPoliceSeizurePaused, setIsPoliceSeizurePaused] = useState(false);
  const [isCrowdAngerPaused, setIsCrowdAngerPaused] = useState(false);
  const [isPillOverloadPaused, setIsPillOverloadPaused] = useState(false);
  const [isCrateBonusPaused, setIsCrateBonusPaused] = useState(false);
  const [isHeadphonesBonusPaused, setIsHeadphonesBonusPaused] = useState(false);
  const [isRecordTransitioning, setIsRecordTransitioning] = useState(false);
  const [isLevelTwoMarqueeVisible, setIsLevelTwoMarqueeVisible] = useState(false);
  const [activeArcadeSequence, setActiveArcadeSequence] = useState<ArcadeSequence | null>(null);
  const [isLevelTwoTransitioning, setIsLevelTwoTransitioning] = useState(false);
  const [mixerDamaged, setMixerDamaged] = useState(false);
  const [equipmentCondition, setEquipmentCondition] = useState<EquipmentCondition>("clean");
  const [levelOneHazardsHit, setLevelOneHazardsHit] = useState(0);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [mixerRepairBurst, setMixerRepairBurst] = useState(false);
  const [isBonusEligible, setIsBonusEligible] = useState(false);
  const [isNoRequestBonusSplashVisible, setIsNoRequestBonusSplashVisible] = useState(false);
  const [isNoRequestBonusActive, setIsNoRequestBonusActive] = useState(false);
  const [noRequestBonusProgress, setNoRequestBonusProgress] = useState(0);
  const [noRequestBonusObstacles, setNoRequestBonusObstacles] = useState<NoRequestBonusEntity[]>([]);
  const [crowdHandX, setCrowdHandX] = useState(50);
  const [crowdPressureBlocks, setCrowdPressureBlocks] = useState(0);
  const [crowdReaction, setCrowdReaction] = useState<"block" | "damage" | null>(null);
  const [isBonusSplashVisible, setIsBonusSplashVisible] = useState(false);
  const [isBonusLevelActive, setIsBonusLevelActive] = useState(false);
  const [isBonusRewinding, setIsBonusRewinding] = useState(false);
  const [bonusProgress, setBonusProgress] = useState(0);
  const [bonusLane, setBonusLane] = useState(1);
  const [bonusGear, setBonusGear] = useState<BonusGearType[]>([]);
  const [bonusDoorOpen, setBonusDoorOpen] = useState(false);
  const [greenCamoUnlocked, setGreenCamoUnlocked] = useState(false);
  const [bonusCamoUnlocked, setBonusCamoUnlocked] = useState(false);
  const [bonusObstacles, setBonusObstacles] = useState<BonusRunnerEntity[]>([]);
  const [isPitRunActive, setIsPitRunActive] = useState(false);
  const [isAfterpartyUnlocked, setIsAfterpartyUnlocked] = useState(false);
  const [pitRunProgress, setPitRunProgress] = useState(0);
  const [pitRunLane, setPitRunLane] = useState(1);
  const [pitRunInventory, setPitRunInventory] = useState<PitGearType[]>([]);
  const [pitRunEntities, setPitRunEntities] = useState<PitRunEntity[]>([]);
  const [pitRunHits, setPitRunHits] = useState(0);
  const [visibleItems, setVisibleItems] = useState<FallingItem[]>([]);
  const [mechanicsDebugLog, setMechanicsDebugLog] = useState<string[]>([]);
  const [cleanDubplateStreak, setCleanDubplateStreak] = useState(0);
  const cleanDubplateStreakRef = useRef(0);
  const [hazardSinceStreakStart, setHazardSinceStreakStart] = useState(false);
  const [realPointerDiagnostics, setRealPointerDiagnostics] = useState<RealPointerDiagnostics>({ phase: "idle", pointerX: null, localX: null, worldX: null, playerTargetX: 50, playerActualX: 50, captured: false, domTarget: "not yet sampled" });
  const arcadeUtils = trpc.useUtils();
  const sharedLeaderboardQuery = trpc.arcade.leaderboard.useQuery(undefined, { staleTime: 15_000, refetchOnWindowFocus: true });
  const submitSharedScore = trpc.arcade.submitScore.useMutation({
    onSuccess: () => {
      setSharedScoreStatus("saved");
      void arcadeUtils.arcade.leaderboard.invalidate();
    },
    onError: () => setSharedScoreStatus("failed"),
  });
  const leaderboard = sharedLeaderboardQuery.data ?? [];
  const sequenceDemoEnabled = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-demo") === "sequences";
  const holdSequenceDebugEnabled = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-hold") === "true";
  const finaleVerificationMode = import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("arcade-finale-verify") : null;
  const nameJourneyVerificationMode = import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("arcade-name-journey") : null;
  const sandboxArcadeVerifier = typeof window !== "undefined" && window.location.hostname.endsWith(".manus.computer");
  const viewportVerificationMode = (import.meta.env.DEV || sandboxArcadeVerifier) && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("arcade-viewport-verify") : null;
  const arcadeFocusVerifier = (import.meta.env.DEV || sandboxArcadeVerifier) && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-focus") === "true";
  const mobileMatrixVerifier = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-mobile-matrix") === "true";
  const sceneVerificationMode = (import.meta.env.DEV || sandboxArcadeVerifier) && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("arcade-scene-verify") : null;
  const crowdPressureCaptureHold = (import.meta.env.DEV || sandboxArcadeVerifier) && sceneVerificationMode === "crowd-pressure-active";
  const stageReactionVerification = import.meta.env.DEV && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("arcade-stage-verify") as StageReaction | null : null;
  const hitboxDebugEnabled = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-hitboxes") === "true";
  const mechanicsDebugEnabled = (import.meta.env.DEV || sandboxArcadeVerifier) && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-mechanics-debug") === "true";
  const realInputDebugEnabled = (import.meta.env.DEV || sandboxArcadeVerifier) && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-real-input-debug") === "true";
  const lossVerificationHold = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arcade-loss-verify") === "hold";
  const heldRewardPreview: InWorldReward | null = import.meta.env.DEV && holdSequenceDebugEnabled ? ({
    crate: { label: "RECORD CRATE FOUND", quip: "THREE MIXERS / SELECTAH LUCK", kind: "crate" },
    headphones: { label: "HEADPHONES SECURED", quip: "THREE DECKS / READY TO SELECT", kind: "headphones" },
    boh: { label: "BOH! BOH!", quip: "FIVE DUBPLATES / +250", kind: "boh" },
    riddim: { label: "RUN THE RIDDIM!", quip: "CROWD PRESSURE / +500", kind: "riddim" },
    wheel: { label: "WHEEL IT UP", quip: "GUN FINGER MASSIVE / +10", kind: "wheel" },
  } as Record<string, InWorldReward>)[sceneVerificationMode ?? ""] ?? null : null;
  const rewardToRender = inWorldReward ?? heldRewardPreview;
  const heldLossPreview = import.meta.env.DEV && lossVerificationHold && sceneVerificationMode === "loss";
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsLayerRef = useRef<HTMLDivElement>(null);
  const djCatcherRef = useRef<HTMLDivElement>(null);
  const crowdHandRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const viewportVerificationPreparedRef = useRef(false);
  const gameRunIdRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const bonusMusicRef = useRef<HTMLAudioElement | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef<GameLevel>(1);
  const recordsCaughtRef = useRef(0);
  const downloadUnlockedRef = useRef(downloadUnlocked);
  const unlockJinglePlayedRef = useRef(false);
  const chainBreakImpactPlayedRef = useRef(false);
  const unlockRevealTimerRef = useRef<number>(0);
  const rewindAwardedRef = useRef(false);
  const rewindPauseTimerRef = useRef<number>(0);
  const wheelItUpAwardedRef = useRef(false);
  const wheelItUpPauseTimerRef = useRef<number>(0);
  const bohBonusAwardedRef = useRef(false);
  const bigUpAwardedRef = useRef(false);
  const riddimBonusAwardedRef = useRef(false);
  const policeBadgeHitsRef = useRef(0);
  const phoneHitsRef = useRef(0);
  const consecutiveHazardRef = useRef<"cop" | "pill" | "phone" | null>(null);
  const consecutiveHazardCountRef = useRef(0);
  const policeSeizurePauseTimerRef = useRef<number>(0);
  const bottleHitsRef = useRef(0);
  const appleCoreHitsRef = useRef(0);
  const crowdHazardVariantRef = useRef<"phone" | "thrown">("phone");
  const crowdAngerPauseTimerRef = useRef<number>(0);
  const pillHitsRef = useRef(0);
  const pillOverloadPauseTimerRef = useRef<number>(0);
  const crateBonusPauseTimerRef = useRef<number>(0);
  const headphonesBonusPauseTimerRef = useRef<number>(0);
  const crowdCheerPlayedRef = useRef(false);
  const levelTwoMusicTimerRef = useRef<number>(0);
  const levelTwoMarqueeTimerRef = useRef<number>(0);
  const levelTwoTransitionTimerRef = useRef<number>(0);
  const arcadeSequenceTimerRef = useRef<number>(0);
  const recordTransitionTimerRef = useRef<number>(0);
  const mixerDamagedRef = useRef(false);
  const equipmentConditionRef = useRef<EquipmentCondition>("clean");
  const levelOneHazardsHitRef = useRef(0);
  const gameModeRef = useRef<GameMode>("LEVEL_1");
  const gameplayStateRef = useRef<GameplayState>("PLAYING");
  const recoveryProgressRef = useRef(0);
  const mixerRepairTimerRef = useRef<number>(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(4);
  const finaleRef = useRef(false);
  const nameJourneyPreparedRef = useRef(false);
  const itemsRef = useRef<FallingItem[]>([]);

  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const namedHazardSpawnCountRef = useRef(0);
  const djXRef = useRef(50);
  const playerWorldRef = useRef<PlayerWorld>(playerRectFromCenterX(50, "ready"));
  const mechanicsDebugPlayerHitboxRef = useRef<HTMLDivElement | null>(null);
  const bonusRequestRef = useRef<number>(0);
  const noRequestBonusRequestRef = useRef<number>(0);
  const noRequestBonusLastTimeRef = useRef(0);
  const noRequestBonusProgressRef = useRef(0);
  const noRequestBonusSpawnTimerRef = useRef(0);
  const noRequestBonusNextIdRef = useRef(1);
  const noRequestBonusObstaclesRef = useRef<NoRequestBonusEntity[]>([]);
  const crowdHandXRef = useRef(50);
  const crowdPressureBlocksRef = useRef(0);
  const crowdReactionTimerRef = useRef<number>(0);
  const noRequestBonusTimerRef = useRef<number>(0);
  const noRequestBonusActiveRef = useRef(false);
  const bonusLastTimeRef = useRef(0);
  const bonusGameActiveRef = useRef(false);
  const bonusEligibleRef = useRef(false);
  const crowdPressureTriggeredRef = useRef(false);
  const bonusCompletedRef = useRef(false);
  const bonusTriggeredRef = useRef(false);
  const bonusProgressRef = useRef(0);
  const bonusLaneRef = useRef(1);
  const bonusGearRef = useRef<BonusGearType[]>([]);
  const bonusObstaclesRef = useRef<BonusRunnerEntity[]>([]);
  const bonusSpawnTimerRef = useRef(0);
  const bonusNextIdRef = useRef(1);
  const pitRunRequestRef = useRef<number>(0);
  const pitRunActiveRef = useRef(false);
  const pitRunLastTimeRef = useRef(0);
  const pitRunProgressRef = useRef(0);
  const pitRunLaneRef = useRef(1);
  const pitRunInventoryRef = useRef<PitGearType[]>([]);
  const pitRunEntitiesRef = useRef<PitRunEntity[]>([]);
  const pitRunSpawnTimerRef = useRef(0);
  const pitRunNextIdRef = useRef(1);
  const pitRunHitsRef = useRef(0);
  const bonusPointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const bonusGestureHandledRef = useRef(false);
  const bonusSplashTimerRef = useRef<number>(0);
  const bonusRewindTimerRef = useRef<number>(0);
  const mixerPickupCountRef = useRef(0);
  const turntablePickupCountRef = useRef(0);
  const pendingArcadeSequenceRef = useRef<ArcadeSequence[]>([]);
  const comboBurstTimerRef = useRef<number>(0);
  const gunFingerShakeTimerRef = useRef<number>(0);
  const pickupFlashTimerRef = useRef<number>(0);
  const impactFxTimerRef = useRef<number>(0);
  const playerImpactTimerRef = useRef<number>(0);
  const stageReactionTimerRef = useRef<number>(0);
  const playfieldPointerRef = useRef<number | null>(null);
  const stageControllerRef = useRef<StageReactionController | null>(null);
  const respectSplashTimerRef = useRef<number>(0);
  const respectShakeTimerRef = useRef<number>(0);
  const damageFeedbackTimerRef = useRef<number>(0);
  const inWorldRewardTimerRef = useRef<number>(0);
  const lastInWorldRewardRecordRef = useRef(-999);
  const lossComedownTimerRef = useRef<number>(0);
  downloadUnlockedRef.current = downloadUnlocked;

  if (!stageControllerRef.current) {
    stageControllerRef.current = new StageReactionController(setStageSnapshot);
  }

  const triggerStageReaction = (reaction: StageReaction) => {
    stageControllerRef.current?.trigger(reaction);
    window.clearTimeout(stageReactionTimerRef.current);
    stageReactionTimerRef.current = window.setTimeout(() => stageControllerRef.current?.clearReaction(), reaction === "COMBO_25" ? 900 : 520);
  };

  const clearStageEventAfter = (duration = 520) => {
    window.clearTimeout(stageReactionTimerRef.current);
    stageReactionTimerRef.current = window.setTimeout(() => stageControllerRef.current?.clearReaction(), duration);
  };

  const showImpactFeedback = (item: FallingItem, kind: "catch" | "hazard") => {
    window.clearTimeout(impactFxTimerRef.current);
    window.clearTimeout(playerImpactTimerRef.current);
    setImpactFx({ key: item.id, x: item.x + item.width / 2, y: item.y + item.height / 2, kind });
    if (kind === "catch") setCatchReactionVariant(Math.floor(Math.random() * 6));
    setPlayerImpact(kind === "catch" ? "catch" : "hit");
    setIsCatchImpulsing(kind === "catch");
    impactFxTimerRef.current = window.setTimeout(() => setImpactFx(null), kind === "catch" ? 130 : 220);
    playerImpactTimerRef.current = window.setTimeout(() => {
      setPlayerImpact(null);
      setIsCatchImpulsing(false);
    }, kind === "catch" ? 180 : 460);
  };

  const logMechanicsEvent = (message: string) => {
    if (!mechanicsDebugEnabled) return;
    const entry = `${performance.now().toFixed(0)}ms ${message}`;
    console.info("[selectah-mechanics]", entry);
    setMechanicsDebugLog((previous) => [entry, ...previous].slice(0, 5));
  };

  const setStageEnergy = (value: number) => stageControllerRef.current?.setEnergy(value);

  const setEquipmentState = (condition: EquipmentCondition) => {
    equipmentConditionRef.current = condition;
    setEquipmentCondition(condition);
  };

  const setChapterMode = (mode: GameMode) => {
    gameModeRef.current = mode;
    setGameMode(mode);
    const nextGameplayState: GameplayState = mode === "GAME_OVER"
      ? "GAME_OVER"
      : mode === "BONUS_CROWD_PRESSURE" || mode === "BONUS_LEVEL_2" || mode === "LEVEL_3_PIT_RUN" || mode === "AFTERPARTY"
        ? "BONUS"
        : "LEVEL_TRANSITION";
    gameplayStateRef.current = nextGameplayState;
    setGameplayState(nextGameplayState);
  };

  const setGameplayStateOwner = (nextState: GameplayState) => {
    gameplayStateRef.current = nextState;
    setGameplayState(nextState);
  };

  // Key state for smooth movement
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const setPlayerWorldX = (centerX: number, state: PlayerWorld["state"] = "playing") => {
    const nextPlayer = playerRectFromCenterX(centerX, state);
    playerWorldRef.current = nextPlayer;
    const clampedCenterX = nextPlayer.x + nextPlayer.width / 2;
    djXRef.current = clampedCenterX;
    if (djCatcherRef.current) djCatcherRef.current.style.left = `${clampedCenterX}%`;
    if (mechanicsDebugPlayerHitboxRef.current) mechanicsDebugPlayerHitboxRef.current.style.left = `${nextPlayer.x}%`;
  };

  const setCrowdHandWorldX = (centerX: number) => {
    const clampedCenterX = Math.max(6, Math.min(94, centerX));
    crowdHandXRef.current = clampedCenterX;
    setCrowdHandX(clampedCenterX);
    if (crowdHandRef.current) crowdHandRef.current.style.left = `${clampedCenterX}%`;
  };

  const reactToCrowdPressure = (reaction: "block" | "damage") => {
    window.clearTimeout(crowdReactionTimerRef.current);
    setCrowdReaction(reaction);
    crowdReactionTimerRef.current = window.setTimeout(() => setCrowdReaction(null), 360);
  };

  const getAudioContext = () => {
    if (typeof window === "undefined" || !soundEnabledRef.current) return null;
    const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextClass = window.AudioContext || browserWindow.webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  };

  const primeAudio = () => {
    getAudioContext();
  };

  const playBackgroundMusic = () => {
    const audio = bgMusicRef.current;
    if (!audio || !soundEnabledRef.current) return;
    audio.volume = 0.34;
    audio.muted = false;
    const playPromise = audio.play();
    playPromise
      .then(() => setMusicStatus("playing"))
      .catch((error: unknown) => {
        console.warn("Background jungle track could not start:", error);
        setMusicStatus("blocked");
      });
  };

  const playBonusMusic = () => {
    const audio = bonusMusicRef.current;
    if (!audio || !soundEnabledRef.current) return;
    audio.volume = 0.38;
    audio.muted = false;
    void audio.play().then(() => setMusicStatus("playing")).catch((error: unknown) => {
      console.warn("After-party runner track could not start:", error);
      setMusicStatus("blocked");
    });
  };

  const primeBonusMusicForSession = () => {
    const audio = bonusMusicRef.current;
    if (!audio || !soundEnabledRef.current) return;
    const savedVolume = audio.volume || 0.38;
    audio.volume = 0;
    void audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = savedVolume;
    }).catch(() => {
      audio.volume = savedVolume;
    });
  };

  const startLevelOneMusic = () => {
    const audio = bgMusicRef.current;
    if (!audio || !soundEnabledRef.current) return;
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = 1;
    audio.volume = 0.34;
    audio.muted = false;
    const playPromise = audio.play();
    playPromise
      .then(() => setMusicStatus("playing"))
      .catch((error: unknown) => {
        console.warn("Level 1 jungle track could not start:", error);
        setMusicStatus("blocked");
      });
  };

  const playRecordScratch = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    // 16-bit Sega Genesis dual-chip scratch chime + classic descending dancehall laser stab
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const laser = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";
    laser.type = "sawtooth";

    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.16);

    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.16);

    // Classic dancehall laser stab sweep
    laser.frequency.setValueAtTime(1450, now);
    laser.frequency.exponentialRampToValueAtTime(180, now + 0.15);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(filter);
    osc2.connect(filter);
    laser.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    osc1.start(now);
    osc2.start(now);
    laser.start(now);
    osc1.stop(now + 0.19);
    osc2.stop(now + 0.19);
    laser.stop(now + 0.19);
  };

  const playTurntablePickup = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const platter = context.createOscillator();
    const cue = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    // A short pitched platter spin and cue-lock chirp make the deck feel distinct
    // from the record catch without interrupting the jungle bed underneath.
    platter.type = "sawtooth";
    cue.type = "square";
    platter.frequency.setValueAtTime(126, now);
    platter.frequency.exponentialRampToValueAtTime(310, now + 0.11);
    platter.frequency.exponentialRampToValueAtTime(164, now + 0.29);
    cue.frequency.setValueAtTime(740, now + 0.05);
    cue.frequency.exponentialRampToValueAtTime(430, now + 0.19);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1320, now);
    filter.Q.setValueAtTime(2.8, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.19, now + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.31);
    platter.connect(filter);
    cue.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    platter.start(now);
    cue.start(now + 0.045);
    platter.stop(now + 0.32);
    cue.stop(now + 0.22);
  };

  const playAdapterPickup = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const gain = context.createGain();
    const notes = [880, 1174, 1568];

    // A bright three-note 45 adaptor arpeggio reads as a small but valuable bonus.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    gain.connect(context.destination);
    notes.forEach((frequency, index) => {
      const tone = context.createOscillator();
      const noteGain = context.createGain();
      const start = now + index * 0.072;
      tone.type = "triangle";
      tone.frequency.setValueAtTime(frequency, start);
      tone.frequency.exponentialRampToValueAtTime(frequency * 0.94, start + 0.12);
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(0.72, start + 0.008);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      tone.connect(noteGain);
      noteGain.connect(gain);
      tone.start(start);
      tone.stop(start + 0.15);
    });
  };

  const playPickupToken = () => {
    const context = getAudioContext();
    if (!context) return;
    // Land after the scratch/platter/transient so the universally applied token
    // is heard as its own classic arcade coin strike instead of being masked.
    const now = context.currentTime + 0.22;
    const coinPrimary = context.createOscillator();
    const coinHarmonic = context.createOscillator();
    const coinPing = context.createOscillator();
    const gain = context.createGain();
    coinPrimary.type = "square";
    coinHarmonic.type = "triangle";
    coinPing.type = "sine";
    coinPrimary.frequency.setValueAtTime(1568, now);
    coinPrimary.frequency.exponentialRampToValueAtTime(1976, now + 0.06);
    coinHarmonic.frequency.setValueAtTime(2349, now);
    coinHarmonic.frequency.exponentialRampToValueAtTime(1976, now + 0.095);
    coinPing.frequency.setValueAtTime(2637, now + 0.055);
    coinPing.frequency.exponentialRampToValueAtTime(2093, now + 0.2);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.42, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    coinPrimary.connect(gain);
    coinHarmonic.connect(gain);
    coinPing.connect(gain);
    gain.connect(context.destination);
    coinPrimary.start(now);
    coinHarmonic.start(now);
    coinPing.start(now + 0.055);
    coinPrimary.stop(now + 0.25);
    coinHarmonic.stop(now + 0.25);
    coinPing.stop(now + 0.25);
  };

  const playSubwooferPop = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(105, now);
    oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.32);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  };

  const playCrowdCheer = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const crowdBus = context.createGain();
    const crowdFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.72), context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    // A short wall of filtered voices and static evokes a packed 16-bit rave-floor
    // cheer without adding a large external sample to the arcade download.
    for (let index = 0; index < noiseData.length; index += 1) {
      const envelope = 1 - index / noiseData.length;
      noiseData[index] = (Math.random() * 2 - 1) * envelope * 0.65;
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    crowdFilter.type = "bandpass";
    crowdFilter.frequency.setValueAtTime(1380, now);
    crowdFilter.frequency.linearRampToValueAtTime(940, now + 0.68);
    crowdFilter.Q.setValueAtTime(0.7, now);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.025);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    noise.connect(noiseGain);
    noiseGain.connect(crowdFilter);

    [218, 264, 312, 386].forEach((frequency, index) => {
      const voice = context.createOscillator();
      const voiceGain = context.createGain();
      voice.type = index % 2 === 0 ? "sawtooth" : "triangle";
      voice.frequency.setValueAtTime(frequency, now + index * 0.02);
      voice.frequency.linearRampToValueAtTime(frequency * 1.32, now + 0.3 + index * 0.025);
      voiceGain.gain.setValueAtTime(0.0001, now + index * 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.05, now + 0.045 + index * 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52 + index * 0.04);
      voice.connect(voiceGain);
      voiceGain.connect(crowdFilter);
      voice.start(now + index * 0.02);
      voice.stop(now + 0.7);
    });

    crowdBus.gain.setValueAtTime(0.0001, now);
    crowdBus.gain.exponentialRampToValueAtTime(0.78, now + 0.03);
    crowdBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.74);
    crowdFilter.connect(crowdBus);
    crowdBus.connect(context.destination);
    noise.start(now);
    noise.stop(now + 0.74);
  };

  const playPillOverloadCue = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const lead = context.createOscillator();
    const undertow = context.createOscillator();
    const wobble = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const wobbleGain = context.createGain();

    // A bent FM-style lead and slow unstable detune create a cartoonishly woozy
    // selector moment without masking the existing jungle bed for long.
    lead.type = "square";
    undertow.type = "triangle";
    wobble.type = "sine";
    lead.frequency.setValueAtTime(522, now);
    lead.frequency.exponentialRampToValueAtTime(328, now + 0.18);
    lead.frequency.exponentialRampToValueAtTime(614, now + 0.48);
    lead.frequency.exponentialRampToValueAtTime(246, now + 0.84);
    undertow.frequency.setValueAtTime(174, now);
    undertow.frequency.exponentialRampToValueAtTime(122, now + 0.86);
    wobble.frequency.setValueAtTime(5.2, now);
    wobbleGain.gain.setValueAtTime(190, now);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1260, now);
    filter.frequency.exponentialRampToValueAtTime(690, now + 0.9);
    filter.Q.setValueAtTime(3.4, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.52);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.93);

    wobble.connect(wobbleGain);
    wobbleGain.connect(lead.detune);
    wobbleGain.connect(undertow.detune);
    lead.connect(filter);
    undertow.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    lead.start(now);
    undertow.start(now);
    wobble.start(now);
    lead.stop(now + 0.95);
    undertow.stop(now + 0.95);
    wobble.stop(now + 0.95);
  };

  const playEmptyClubCue = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const roomNoise = context.createBuffer(1, Math.floor(context.sampleRate * 1.12), context.sampleRate);
    const noiseData = roomNoise.getChannelData(0);
    const noise = context.createBufferSource();
    const roomFilter = context.createBiquadFilter();
    const roomGain = context.createGain();

    // A low, filtered room tail plus three falling “last tune” tones gives the
    // empty dancefloor a clear sonic identity, distinct from the angry crowd cue.
    for (let index = 0; index < noiseData.length; index += 1) {
      const envelope = 1 - index / noiseData.length;
      noiseData[index] = (Math.random() * 2 - 1) * envelope * 0.35;
    }
    noise.buffer = roomNoise;
    roomFilter.type = "lowpass";
    roomFilter.frequency.setValueAtTime(760, now);
    roomFilter.frequency.exponentialRampToValueAtTime(180, now + 1.05);
    roomFilter.Q.setValueAtTime(0.8, now);
    roomGain.gain.setValueAtTime(0.0001, now);
    roomGain.gain.exponentialRampToValueAtTime(0.07, now + 0.07);
    roomGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    noise.connect(roomFilter);
    roomFilter.connect(roomGain);
    roomGain.connect(context.destination);

    [392, 330, 262].forEach((frequency, index) => {
      const tone = context.createOscillator();
      const toneGain = context.createGain();
      const start = now + index * 0.23;
      tone.type = index === 1 ? "triangle" : "sine";
      tone.frequency.setValueAtTime(frequency, start);
      tone.frequency.exponentialRampToValueAtTime(frequency * 0.72, start + 0.34);
      toneGain.gain.setValueAtTime(0.0001, start);
      toneGain.gain.exponentialRampToValueAtTime(0.11, start + 0.025);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      tone.connect(toneGain);
      toneGain.connect(context.destination);
      tone.start(start);
      tone.stop(start + 0.44);
    });

    noise.start(now);
    noise.stop(now + 1.12);
  };

  const playCopSiren = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    // 16-bit FM police siren alarm sweep with dual square pulse waves
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gain = context.createGain();

    osc1.type = "square";
    osc2.type = "square";

    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.linearRampToValueAtTime(880, now + 0.18);
    osc1.frequency.linearRampToValueAtTime(520, now + 0.36);

    osc2.frequency.setValueAtTime(260, now);
    osc2.frequency.linearRampToValueAtTime(440, now + 0.18);
    osc2.frequency.linearRampToValueAtTime(260, now + 0.36);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(context.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  };

  const playPoliceRadioBurst = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const voiceBus = context.createGain();
    const radioBand = context.createBiquadFilter();
    const staticGain = context.createGain();
    const squelchFilter = context.createBiquadFilter();
    const squelchGain = context.createGain();
    const staticBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.44), context.sampleRate);
    const staticData = staticBuffer.getChannelData(0);
    const squelchBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.04), context.sampleRate);
    const squelchData = squelchBuffer.getChannelData(0);

    // Narrow-band static plus short pitched syllable pulses evokes a 16-bit
    // police-radio dispatch without using an external voice or media asset.
    for (let index = 0; index < staticData.length; index += 1) {
      const envelope = 1 - index / staticData.length;
      staticData[index] = (Math.random() * 2 - 1) * envelope;
    }
    for (let index = 0; index < squelchData.length; index += 1) {
      const envelope = 1 - index / squelchData.length;
      squelchData[index] = (Math.random() * 2 - 1) * envelope * envelope;
    }
    const radioStatic = context.createBufferSource();
    const radioSquelch = context.createBufferSource();
    radioStatic.buffer = staticBuffer;
    radioSquelch.buffer = squelchBuffer;
    // The hard, filtered click opens the radio channel a fraction before the
    // dispatch-style burst, making the seizure cue feel like a real squelch.
    squelchFilter.type = "bandpass";
    squelchFilter.frequency.setValueAtTime(2480, now);
    squelchFilter.Q.setValueAtTime(1.15, now);
    squelchGain.gain.setValueAtTime(0.13, now);
    squelchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.043);
    radioSquelch.connect(squelchFilter);
    squelchFilter.connect(squelchGain);
    squelchGain.connect(voiceBus);
    radioBand.type = "bandpass";
    radioBand.frequency.setValueAtTime(1550, now);
    radioBand.Q.setValueAtTime(1.7, now);
    staticGain.gain.setValueAtTime(0.0001, now);
    staticGain.gain.exponentialRampToValueAtTime(0.095, now + 0.048);
    staticGain.gain.setValueAtTime(0.072, now + 0.18);
    staticGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    radioStatic.connect(radioBand);
    radioBand.connect(staticGain);
    staticGain.connect(voiceBus);

    [188, 236, 204].forEach((frequency, index) => {
      const syllable = context.createOscillator();
      const syllableGain = context.createGain();
      const syllableFormant = context.createBiquadFilter();
      const start = now + 0.065 + index * 0.105;
      syllable.type = "sawtooth";
      syllable.frequency.setValueAtTime(frequency, start);
      syllable.frequency.linearRampToValueAtTime(frequency * 0.79, start + 0.07);
      syllableFormant.type = "bandpass";
      syllableFormant.frequency.setValueAtTime(760 + index * 95, start);
      syllableFormant.Q.setValueAtTime(4.6, start);
      syllableGain.gain.setValueAtTime(0.0001, start);
      syllableGain.gain.exponentialRampToValueAtTime(0.11, start + 0.008);
      syllableGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.085);
      syllable.connect(syllableFormant);
      syllableFormant.connect(syllableGain);
      syllableGain.connect(voiceBus);
      syllable.start(start);
      syllable.stop(start + 0.1);
    });

    voiceBus.gain.setValueAtTime(0.0001, now);
    voiceBus.gain.exponentialRampToValueAtTime(0.82, now + 0.012);
    voiceBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
    voiceBus.connect(context.destination);
    radioSquelch.start(now);
    radioSquelch.stop(now + 0.045);
    radioStatic.start(now + 0.035);
    radioStatic.stop(now + 0.48);
  };

  const playUnlockJingle = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    // Classic dancehall laser burst: multiple descending frequency sweeps with square/sawtooth resonance
    const laser1 = context.createOscillator();
    const laser2 = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    laser1.type = "sawtooth";
    laser2.type = "square";

    laser1.frequency.setValueAtTime(2400, now);
    laser1.frequency.exponentialRampToValueAtTime(120, now + 0.45);

    laser2.frequency.setValueAtTime(1800, now);
    laser2.frequency.exponentialRampToValueAtTime(90, now + 0.45);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.45);
    filter.Q.setValueAtTime(5.5, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    laser1.connect(filter);
    laser2.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    laser1.start(now);
    laser2.start(now);
    laser1.stop(now + 0.5);
    laser2.stop(now + 0.5);
  };

  const playChainBreakImpact = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const master = context.createGain();
    const impactFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.075), context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    // Short inharmonic FM-style cluster with a bright noise transient: a compact
    // Sega-like metal-chain snap that lands on the first flying link frame.
    [238, 487, 913, 1460].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index % 2 === 0 ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.16 : 0.095, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + index * 0.018);
      oscillator.connect(gain);
      gain.connect(impactFilter);
      oscillator.start(now);
      oscillator.stop(now + 0.27);
    });

    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.09, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    noise.connect(noiseGain);
    noiseGain.connect(impactFilter);

    impactFilter.type = "bandpass";
    impactFilter.frequency.setValueAtTime(1760, now);
    impactFilter.Q.setValueAtTime(2.8, now);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.72, now + 0.005);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    impactFilter.connect(master);
    master.connect(context.destination);
    noise.start(now);
    noise.stop(now + 0.09);
  };

  const toggleSound = () => {
    // During active play, a direct tap should always retry the real looping MP3
    // before toggling the whole sound system off. This is separate from the
    // Web Audio scratch, siren, and unlock cues.
    if (soundEnabledRef.current && (isPlayingRef.current || bonusGameActiveRef.current) && musicStatus !== "playing") {
      primeAudio();
      if (bonusGameActiveRef.current) {
        playBonusMusic();
      } else {
        playBackgroundMusic();
      }
      return;
    }
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") void ctx.resume();
      if (bonusGameActiveRef.current) {
        playBonusMusic();
      } else if (isPlayingRef.current) {
        playBackgroundMusic();
      }
    } else {
      if (bgMusicRef.current) bgMusicRef.current.pause();
      if (bonusMusicRef.current) bonusMusicRef.current.pause();
      setMusicStatus("paused");
    }
  };

  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;
    audio.volume = 0.34;
    const handleCanPlay = () => setMusicStatus("ready");
    const handlePlaying = () => setMusicStatus("playing");
    const handlePause = () => {
      if (!isPlayingRef.current) setMusicStatus("paused");
    };
    const handleError = () => {
      console.warn("The 5D jungle soundtrack failed to load.");
      setMusicStatus("error");
    };
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.load();
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    try {
      const storedScore = Number(window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY) || 0);
      const savedScore = Number.isFinite(storedScore) ? Math.max(0, Math.floor(storedScore)) : 0;
      highScoreRef.current = savedScore;
      setHighScore(savedScore);

    } catch {
      // Local storage may be unavailable in private or restricted browser contexts.
    }
  }, []);

  useEffect(() => {
    try {
      setFacebookRespectConfirmed(window.localStorage.getItem(FACEBOOK_RESPECT_STORAGE_KEY) === "true");
    } catch {
      // Keep the acknowledgement scoped to this visit if browser storage is unavailable.
    }
  }, []);

  const recordHighScore = (candidate: number, rawName: string, completedLevel: "level1" | "level2", hasBonusCrown = shouldAwardBonusCrown(completedLevel, bonusCompletedRef.current)) => {
    const previousBest = highScoreRef.current;
    const isRecord = candidate > previousBest;
    const bestScore = Math.max(previousBest, candidate);
    highScoreRef.current = bestScore;
    setIsNewRecord(isRecord);
    setHighScore(bestScore);
    try {
      window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(bestScore));
    } catch {
      // Keep in-session score.
    }

    const safeName = sanitizeSelectorTag(rawName);
    if (!safeName) {
      setSharedScoreStatus("idle");
      return;
    }
    if (nameJourneyVerificationMode) {
      // The browser journey verifier must never create fabricated public scores.
      setSharedScoreStatus("idle");
      return;
    }
    setSharedScoreStatus("transmitting");
    submitSharedScore.mutate({ playerTag: safeName, score: candidate, completedLevel, hasBonusCrown: shouldAwardBonusCrown(completedLevel, hasBonusCrown) });
  };

  const confirmFacebookRespect = () => {
    try {
      window.localStorage.setItem(FACEBOOK_RESPECT_STORAGE_KEY, "true");
    } catch {
      // Keep the acknowledgement active for this visit when storage is unavailable.
    }
    setFacebookRespectConfirmed(true);
    window.clearTimeout(respectSplashTimerRef.current);
    window.clearTimeout(respectShakeTimerRef.current);
    setIsRespectSplashVisible(true);
    setIsRespectShaking(true);
    respectShakeTimerRef.current = window.setTimeout(() => setIsRespectShaking(false), 960);
    respectSplashTimerRef.current = window.setTimeout(() => setIsRespectSplashVisible(false), 1900);
  };

  const submitScore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = sanitizeSelectorTag(playerName);
    if (safeName) recordHighScore(score, safeName, levelTwoComplete ? "level2" : "level1");
    setPlayerName(safeName);
    setSubmittedName(safeName);
    setScoreSubmitted(Boolean(safeName));
    onAchievementFlowComplete?.();
    if (levelTwoComplete) {
      finaleRef.current = true;
      setFinale(true);
    }
  };

  useEffect(() => {
    // A tag saved before Level 2 carries directly into the terminal finale.
    if (!levelTwoComplete || !scoreSubmitted || !submittedName.trim()) return;
    finaleRef.current = true;
    setFinale(true);
  }, [levelTwoComplete, scoreSubmitted, submittedName]);

  useEffect(() => {
    if (!finaleVerificationMode) return;
    const finalTag = finaleVerificationMode === "saved"
      ? resolveFinaleTag("EARLY-MASSIVE", "LATER-TAG")
      : finaleVerificationMode === "final"
        ? resolveFinaleTag("", "FINAL-MASSIVE")
        : "";
    setScore(5000);
    setLevelTwoComplete(true);
    setGameOver(false);
    setPlayerName(finalTag);
    setSubmittedName(finalTag);
    setScoreSubmitted(Boolean(finalTag));
    finaleRef.current = true;
    setFinale(true);
  }, [finaleVerificationMode]);

  useEffect(() => {
    if (!nameJourneyVerificationMode || nameJourneyPreparedRef.current) return;
    nameJourneyPreparedRef.current = true;
    setScore(5000);
    setLevel(2);
    levelRef.current = 2;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setFinale(false);
    finaleRef.current = false;
    setScoreSubmitted(false);
    setSubmittedName("");
    setPlayerName("");
    if (nameJourneyVerificationMode === "saved") {
      setLevelTwoComplete(false);
      setGameOver(false);
      setPreLevelTwoHighScore(true);
    } else {
      setLevelTwoComplete(true);
      setGameOver(true);
      setPreLevelTwoHighScore(false);
    }
  }, [nameJourneyVerificationMode]);

  useEffect(() => {
    if (nameJourneyVerificationMode !== "saved" || !submittedName) return;
    setLevelTwoComplete(true);
    setGameOver(false);
    finaleRef.current = true;
    setFinale(true);
  }, [nameJourneyVerificationMode, submittedName]);

  const startLevelTwo = () => {
    if (nameJourneyVerificationMode === "saved") {
      setPreLevelTwoHighScore(false);
      setLevelTwoComplete(true);
      setGameOver(false);
      finaleRef.current = true;
      setFinale(true);
      return;
    }
    const beginLevelTwoArrival = () => {
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    levelRef.current = 2;
    setChapterMode("LEVEL_2");
    setLevel(2);
    recordsCaughtRef.current = 0;
    livesRef.current = 4;
    comboRef.current = 1;
    rewindAwardedRef.current = false;
    wheelItUpAwardedRef.current = false;
    bohBonusAwardedRef.current = false;
    bigUpAwardedRef.current = false;
    riddimBonusAwardedRef.current = false;
    policeBadgeHitsRef.current = 0;
    bottleHitsRef.current = 0;
    appleCoreHitsRef.current = 0;
    pillHitsRef.current = 0;
    mixerPickupCountRef.current = 0;
    turntablePickupCountRef.current = 0;
    crowdCheerPlayedRef.current = false;
    bonusTriggeredRef.current = false;
    bonusCompletedRef.current = false;
    bonusGameActiveRef.current = false;
    bonusProgressRef.current = 0;
    bonusLaneRef.current = 1;
    bonusGearRef.current = [];
    bonusObstaclesRef.current = [];
    bonusSpawnTimerRef.current = 0;
    mixerDamagedRef.current = equipmentIsDamaged(equipmentConditionRef.current);
    recoveryProgressRef.current = 0;
    scoreRef.current = scoreRef.current;
    setRecordsCaught(0);
    setLives(4);
    setCombo(1);
    setIsPlaying(false);
    setIsUnlockPaused(false);
    setIsRewindPaused(false);
    setIsWheelItUpPaused(false);
    setIsPoliceSeizurePaused(false);
    setIsCrowdAngerPaused(false);
    setIsPillOverloadPaused(false);
    setIsCrateBonusPaused(false);
    setIsHeadphonesBonusPaused(false);
    setIsRecordTransitioning(false);
    setActiveArcadeSequence(null);
    setMixerDamaged(mixerDamagedRef.current);
    setRecoveryProgress(0);
    setMixerRepairBurst(false);
    setComboReaction(null);
    setIsGunFingerShaking(false);
    setIsBonusEligible(false);
    setIsBonusSplashVisible(false);
    setIsBonusLevelActive(false);
    setIsBonusRewinding(false);
    setBonusProgress(0);
    setBonusLane(1);
    setBonusGear([]);
    setBonusDoorOpen(false);
    setBonusObstacles([]);
    window.clearTimeout(comboBurstTimerRef.current);
    window.clearTimeout(gunFingerShakeTimerRef.current);
    setGameOver(false);
    setLevelTwoComplete(false);
    setFinale(false);
    finaleRef.current = false;
    itemsRef.current = [];
    setVisibleItems([]);
    spawnTimerRef.current = 0;
    namedHazardSpawnCountRef.current = 0;
    lastTimeRef.current = performance.now();
    isPlayingRef.current = false;
    window.clearTimeout(levelTwoMusicTimerRef.current);
    window.clearTimeout(levelTwoMarqueeTimerRef.current);
    window.clearTimeout(levelTwoTransitionTimerRef.current);
    window.clearTimeout(arcadeSequenceTimerRef.current);
    window.clearTimeout(recordTransitionTimerRef.current);
    setIsLevelTwoTransitioning(true);
    setIsLevelTwoMarqueeVisible(true);
    const arrivalDuration = holdSequenceDebugEnabled ? 25000 : 2350;
    levelTwoMarqueeTimerRef.current = window.setTimeout(() => setIsLevelTwoMarqueeVisible(false), arrivalDuration + 850);
    primeAudio();
    if (bgMusicRef.current) bgMusicRef.current.pause();
    levelTwoMusicTimerRef.current = window.setTimeout(() => {
      if (bgMusicRef.current) {
        const trackDuration = bgMusicRef.current.duration;
        const levelTwoOffset = Number.isFinite(trackDuration) && trackDuration > LEVEL_TWO_TRACK_OFFSET_SECONDS
          ? Math.min(LEVEL_TWO_TRACK_OFFSET_SECONDS, trackDuration * 0.65)
          : LEVEL_TWO_TRACK_OFFSET_SECONDS;
        bgMusicRef.current.currentTime = levelTwoOffset;
        bgMusicRef.current.playbackRate = 1.09;
      }
      playBackgroundMusic();
    }, Math.min(760, arrivalDuration - 250));
    levelTwoTransitionTimerRef.current = window.setTimeout(() => {
      setIsLevelTwoTransitioning(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      queueGameFrame();
    }, arrivalDuration);
    };

    window.clearTimeout(recordTransitionTimerRef.current);
    setIsLevelTwoTransitioning(false);
    setIsLevelTwoMarqueeVisible(false);
    setIsRecordTransitioning(true);
    primeAudio();
    playRecordScratch();
    recordTransitionTimerRef.current = window.setTimeout(beginLevelTwoArrival, 560);
  };

  const startLevelOneNoRequestBonus = () => {
    if (levelRef.current !== 1 || !bonusEligibleRef.current) return;
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setChapterMode("BONUS_CROWD_PRESSURE");
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsUnlockPaused(false);
    setPreLevelTwoHighScore(false);
    setIsNoRequestBonusSplashVisible(true);
    setNoRequestBonusProgress(0);
    setNoRequestBonusObstacles([]);
    noRequestBonusObstaclesRef.current = [];
    crowdHandXRef.current = 50;
    crowdPressureBlocksRef.current = 0;
    setCrowdHandX(50);
    setCrowdPressureBlocks(0);
    setCrowdReaction(null);
    noRequestBonusActiveRef.current = false;
    noRequestBonusProgressRef.current = 0;
    noRequestBonusSpawnTimerRef.current = 0;
    bonusLaneRef.current = 1;
    setBonusLane(1);
    window.clearTimeout(noRequestBonusTimerRef.current);
    noRequestBonusTimerRef.current = window.setTimeout(() => {
      setIsNoRequestBonusSplashVisible(false);
      setIsNoRequestBonusActive(true);
      noRequestBonusActiveRef.current = true;
      noRequestBonusLastTimeRef.current = performance.now();
      updateNoRequestBonusGame(noRequestBonusLastTimeRef.current);
    }, 1150);
  };

  const finishLevelOneNoRequestBonus = (cleared: boolean) => {
    if (!noRequestBonusActiveRef.current) return;
    if (noRequestBonusRequestRef.current) cancelAnimationFrame(noRequestBonusRequestRef.current);
    noRequestBonusActiveRef.current = false;
    setIsNoRequestBonusActive(false);
    setChapterMode("LEVEL_1");
    setNoRequestBonusObstacles([]);
    noRequestBonusObstaclesRef.current = [];
    bonusEligibleRef.current = false;
    setIsBonusEligible(false);
    if (cleared) {
      setGreenCamoUnlocked(true);
      setEquipmentState("repaired");
      announceInWorldReward("NO REQUEST BONUS CLEARED", "GREEN CAMO EQUIPPED FOR LEVEL 2");
    }
    if (recordsCaughtRef.current < REQUIRED_RECORDS) {
      // Crowd Pressure was earned mid-Level 1: return directly to the same
      // playable chapter rather than showing the Level 2 score handoff early.
      setPreLevelTwoHighScore(false);
      setGameplayStateOwner("PLAYING");
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      queueGameFrame();
      return;
    }
    setPreLevelTwoHighScore(true);
  };

  const startNoRequestBonus = () => {
    if (levelRef.current !== 2 || livesRef.current !== 4 || recordsCaughtRef.current < BONUS_START_RECORDS) return;
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setChapterMode("BONUS_LEVEL_2");
    isPlayingRef.current = false;
    bonusCompletedRef.current = false;
    bonusGameActiveRef.current = false;
    bonusProgressRef.current = 0;
    bonusLaneRef.current = 1;
    bonusGearRef.current = [];
    bonusObstaclesRef.current = [];
    itemsRef.current = [];
    bonusSpawnTimerRef.current = 0;
    bonusNextIdRef.current = 1;
    window.clearTimeout(bonusSplashTimerRef.current);
    window.clearTimeout(bonusRewindTimerRef.current);
    if (bgMusicRef.current) bgMusicRef.current.pause();
    if (bonusMusicRef.current) {
      bonusMusicRef.current.pause();
      bonusMusicRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsUnlockPaused(false);
    setPreLevelTwoHighScore(false);
    setIsBonusEligible(true);
    setIsBonusSplashVisible(true);
    setIsBonusLevelActive(false);
    setIsBonusRewinding(false);
    setBonusProgress(0);
    setBonusLane(1);
    setBonusGear([]);
    setBonusDoorOpen(false);
    setBonusObstacles([]);
    setVisibleItems([]);
    primeAudio();
    playRecordScratch();
  };

  const finishNoRequestBonus = (cleared: boolean) => {
    if (!bonusGameActiveRef.current) return;
    bonusGameActiveRef.current = false;
    if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    if (cleared && !bonusCompletedRef.current) {
      bonusCompletedRef.current = true;
      setBonusDoorOpen(true);
      setBonusCamoUnlocked(true);
    }
    if (bonusMusicRef.current) bonusMusicRef.current.pause();
    setIsBonusLevelActive(false);
    setIsBonusRewinding(true);
    primeAudio();
    playRecordScratch();
  };

  const startPitRun = () => {
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    levelRef.current = 3;
    setLevel(3);
    setChapterMode(transitionChapter("LEVEL_2", "start-pit"));
    stageControllerRef.current?.setLevel(3);
    stageControllerRef.current?.setEnergy(0);
    isPlayingRef.current = false;
    pitRunActiveRef.current = true;
    pitRunProgressRef.current = 0;
    pitRunLaneRef.current = 1;
    pitRunInventoryRef.current = [];
    pitRunEntitiesRef.current = [];
    pitRunSpawnTimerRef.current = 0;
    pitRunNextIdRef.current = 1;
    pitRunHitsRef.current = 0;
    setIsPlaying(false);
    setIsPitRunActive(true);
    setIsAfterpartyUnlocked(false);
    setPitRunProgress(0);
    setPitRunLane(1);
    setPitRunInventory([]);
    setPitRunEntities([]);
    setPitRunHits(0);
    setVisibleItems([]);
    itemsRef.current = [];
    if (bgMusicRef.current) bgMusicRef.current.pause();
    primeAudio();
    playRecordScratch();
    pitRunLastTimeRef.current = performance.now();
    pitRunRequestRef.current = requestAnimationFrame(updatePitRun);
  };

  const finishPitRun = (afterpartyUnlocked: boolean) => {
    if (pitRunRequestRef.current) cancelAnimationFrame(pitRunRequestRef.current);
    pitRunActiveRef.current = false;
    setIsPitRunActive(false);
    if (afterpartyUnlocked) {
      setChapterMode(transitionChapter("LEVEL_3_PIT_RUN", "afterparty"));
      setIsAfterpartyUnlocked(true);
      stageControllerRef.current?.onLevelComplete();
      announceInWorldReward("AFTERPARTY UNLOCKED", "SOUND SYSTEM DELIVERED — ROCK THE JAM", "riddim");
      return;
    }
    announceInWorldReward("FINAL RECOVERY", "CRITICAL GEAR STILL OUT THERE", "crate");
  };

  const handleBonusGesture = (start: { x: number; y: number; time: number }, endX: number, endY: number) => {
    const dx = endX - start.x;
    if (Math.abs(dx) > 14) {
      moveBonusSideways(Math.sign(dx) as -1 | 1);
    }
  };

  const moveBonusSideways = (direction: -1 | 1) => {
    if (pitRunActiveRef.current) {
      const nextPitLane = Math.max(0, Math.min(2, pitRunLaneRef.current + direction));
      pitRunLaneRef.current = nextPitLane;
      setPitRunLane(nextPitLane);
      return;
    }
    if (!bonusGameActiveRef.current && !isNoRequestBonusActive) return;
    const nextLane = Math.max(0, Math.min(2, bonusLaneRef.current + direction));
    bonusLaneRef.current = nextLane;
    setBonusLane(nextLane);
  };

  const setBonusLaneFromClientX = (clientX: number) => {
    if ((!bonusGameActiveRef.current && !isNoRequestBonusActive && !pitRunActiveRef.current) || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    if (isNoRequestBonusActive) {
      setCrowdHandWorldX(clientXToWorldX(clientX, bounds.left, bounds.width));
      return;
    }
    const normalizedX = Math.max(0, Math.min(0.999, (clientX - bounds.left) / bounds.width));
    const nextLane = Math.floor(normalizedX * 3);
    if (pitRunActiveRef.current) {
      pitRunLaneRef.current = nextLane;
      setPitRunLane(nextLane);
      return;
    }
    if (nextLane !== bonusLaneRef.current) {
      bonusLaneRef.current = nextLane;
      setBonusLane(nextLane);
    }
  };

  const announceDamage = (label: string, remainingLives: number, bonus = false) => {
    window.clearTimeout(damageFeedbackTimerRef.current);
    setDamageFeedback({ label, lives: remainingLives, bonus });
    damageFeedbackTimerRef.current = window.setTimeout(() => setDamageFeedback(null), 980);
  };

  const announceInWorldReward = (label: string, quip: string, kind?: InWorldReward["kind"]) => {
    window.clearTimeout(inWorldRewardTimerRef.current);
    setInWorldReward({ label, quip, kind });
    const rewardDuration = holdSequenceDebugEnabled ? 25000 : kind === "boh" || kind === "big-up" || kind === "riddim" ? 1650 : 1250;
    inWorldRewardTimerRef.current = window.setTimeout(() => setInWorldReward(null), rewardDuration);
  };

  const queueGameFrame = () => {
    const runId = gameRunIdRef.current;
    requestRef.current = requestAnimationFrame((time) => {
      if (!isPlayingRef.current || runId !== gameRunIdRef.current) return;
      updateGame(time);
    });
  };

  const resumeMainGame = () => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    lastTimeRef.current = performance.now();
    queueGameFrame();
  };

  const startArcadeSequence = (sequence: ArcadeSequence) => {
    if (sequence === "boh" || sequence === "riddim" || sequence === "wheel" || sequence === "crate" || sequence === "headphones") {
      const rewardCopy: Record<"boh" | "riddim" | "wheel" | "crate" | "headphones", InWorldReward> = {
        boh: { label: "BOH! BOH!", quip: "FIVE DUBPLATES / +250" },
        riddim: { label: "RUN THE RIDDIM!", quip: "CROWD PRESSURE / +500" },
        wheel: { label: "WHEEL IT UP", quip: "GUN FINGER MASSIVE / +10" },
        crate: { label: "RECORD CRATE FOUND", quip: "THREE MIXERS / SELECTAH LUCK" },
        headphones: { label: "HEADPHONES SECURED", quip: "THREE DECKS / READY TO SELECT" },
      };
      announceInWorldReward(rewardCopy[sequence].label, rewardCopy[sequence].quip, sequence);
      if (sequence === "boh") playSubwooferPop(); else playRecordScratch();
      resumeOrAdvanceArcadeSequence();
      return;
    }
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    window.clearTimeout(recordTransitionTimerRef.current);
    setIsRecordTransitioning(false);
    isPlayingRef.current = false;
    setIsPlaying(false);
    setActiveArcadeSequence(sequence);
    if (sequence === "rewind") {
      setIsRewindPaused(true);
      return;
    }
    if (sequence === "police") {
      mixerDamagedRef.current = true;
      recoveryProgressRef.current = 0;
      setMixerDamaged(true);
      setRecoveryProgress(0);
      playPoliceRadioBurst();
      setIsPoliceSeizurePaused(true);
      return;
    }
    if (sequence === "crowd") {
      playEmptyClubCue();
      setIsCrowdAngerPaused(true);
      return;
    }
    if (sequence === "pill") {
      playPillOverloadCue();
      setIsPillOverloadPaused(true);
      return;
    }
    playRecordScratch();
  };

  const resumeOrAdvanceArcadeSequence = () => {
    const nextSequence = pendingArcadeSequenceRef.current.shift();
    if (nextSequence) {
      window.setTimeout(() => startArcadeSequence(nextSequence), 90);
      return;
    }
    resumeMainGame();
  };

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") return;
    const debugWindow = window as ArcadeDebugWindow;
    debugWindow.__selectahDebug = {
      triggerSequence: (sequence) => {
        pendingArcadeSequenceRef.current = [];
        if (sequence !== "thrown" && ["boh", "riddim", "wheel", "crate", "headphones"].includes(sequence)) {
          isPlayingRef.current = true;
          setIsPlaying(true);
        }
        if (sequence === "thrown") {
          crowdHazardVariantRef.current = "thrown";
          startArcadeSequence("crowd");
          return;
        }
        startArcadeSequence(sequence);
      },
      showComboReaction: (kind) => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        setGameOver(false);
        setComboReaction(kind);
        setShowComboBurst(true);
        if (kind === "big-up") announceInWorldReward("BIG UP!", "BIG UP!", "big-up");
        if (kind === "gun-fingers") {
          announceInWorldReward("GUN FINGER MASSIVE", "SELECTOR SALUTE / CABINET UNDER PRESSURE", "gun-fingers");
          setIsGunFingerShaking(true);
          window.clearTimeout(gunFingerShakeTimerRef.current);
          gunFingerShakeTimerRef.current = window.setTimeout(() => setIsGunFingerShaking(false), 1500);
        }
        window.clearTimeout(comboBurstTimerRef.current);
        comboBurstTimerRef.current = window.setTimeout(() => {
          setShowComboBurst(false);
          setComboReaction(null);
        }, kind === "gun-fingers" ? 1750 : 1100);
      },
      triggerRecordTransition: () => {
        window.clearTimeout(recordTransitionTimerRef.current);
        setIsRecordTransitioning(true);
        recordTransitionTimerRef.current = window.setTimeout(() => setIsRecordTransitioning(false), holdSequenceDebugEnabled ? 25000 : 520);
      },
      showLevelOneSpeakers: () => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        levelRef.current = 1;
        recordsCaughtRef.current = 15;
        isPlayingRef.current = false;
        setLevel(1);
        setRecordsCaught(15);
        setIsPlaying(false);
        setGameOver(false);
        setActiveArcadeSequence(null);
        setIsRecordTransitioning(false);
      },
      showItemPreview: (previewLevel) => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        const types = previewLevel === 1
          ? (["record", "cop", "pill", "phone", "cdj", "mixer", "turntable", "adapter"] as FallingItemType[])
          : (["record", "bottle", "apple", "cop", "pill", "phone", "lion", "cdj", "mixer", "turntable", "adapter"] as FallingItemType[]);
        const previewItems = types.map((type, index) => {
          const rule = FALLING_ITEM_RULES[type];
          return { id: -900 - index, x: 6 + (index % 4) * 23, y: 12 + Math.floor(index / 4) * 30, type, velocity: 0, state: "active" as const, ...rule, tilt: rule.tilt };
        });
        levelRef.current = previewLevel;
        itemsRef.current = previewItems;
        // Rendering uses the active-play flag; the frame loop remains cancelled above, so this is preview-only.
        isPlayingRef.current = true;
        setLevel(previewLevel);
        setVisibleItems(previewItems);
        setIsPlaying(true);
        setGameOver(false);
        setActiveArcadeSequence(null);
        setIsRecordTransitioning(false);
        setIsLevelTwoTransitioning(false);
      },
      exerciseWorldEvent: (kind) => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        const type: FallingItemType = kind === "hazard" ? "pill" : "record";
        const rule = FALLING_ITEM_RULES[type];
        const worldItem: FallingItem = {
          id: -1200 - Math.floor(Math.random() * 100),
          x: djXRef.current,
          y: kind === "miss" ? 106 : 74,
          type,
          velocity: 0,
          state: "active",
          ...rule,
          tilt: rule.tilt,
        };
        levelRef.current = 1;
        livesRef.current = 4;
        comboRef.current = 1;
        recordsCaughtRef.current = kind === "level-complete" ? REQUIRED_RECORDS - 1 : 0;
        itemsRef.current = [worldItem];
        setLevel(1);
        setLives(4);
        setCombo(1);
        setRecordsCaught(kind === "level-complete" ? REQUIRED_RECORDS - 1 : 0);
        setGameOver(false);
        setActiveArcadeSequence(null);
        setVisibleItems([worldItem]);
        isPlayingRef.current = true;
        setIsPlaying(true);
        lastTimeRef.current = performance.now() - 32;
        // Development verification only: run the same authoritative frame function
        // on the next task, rather than relying on an external animation-frame tick.
        window.setTimeout(() => updateGame(performance.now()), 0);
      },
      showUnlock: () => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setLevel(1);
        setRecordsCaught(REQUIRED_RECORDS);
        setIsUnlockPaused(true);
        setUnlockRevealReady(false);
        setChainBreakComplete(false);
        window.clearTimeout(unlockRevealTimerRef.current);
        unlockRevealTimerRef.current = window.setTimeout(() => setUnlockRevealReady(true), 3000);
      },
      showLossComedown: () => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        levelRef.current = 1;
        livesRef.current = 0;
        isPlayingRef.current = false;
        setLevel(1);
        setLives(0);
        setScore(800);
        setIsPlaying(false);
        setLevelTwoComplete(false);
        setGameOver(true);
        showLossComedown();
      },
      showGameOver: () => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        levelRef.current = 1;
        livesRef.current = 0;
        isPlayingRef.current = false;
        setLevel(1);
        setLives(0);
        setScore(800);
        setIsPlaying(false);
        setLevelTwoComplete(false);
        setIsLossComedownVisible(false);
        setGameOver(true);
      },
      startLevelTwo,
      startFirstBonus: () => {
        levelRef.current = 1;
        recordsCaughtRef.current = REQUIRED_RECORDS;
        livesRef.current = 3;
        bonusEligibleRef.current = true;
        setLevel(1);
        setRecordsCaught(REQUIRED_RECORDS);
        setLives(3);
        setIsBonusEligible(true);
        startLevelOneNoRequestBonus();
      },
      startCrowdPressureActive: () => {
        gameRunIdRef.current += 1;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        window.clearTimeout(noRequestBonusTimerRef.current);
        levelRef.current = 1;
        setLevel(1);
        setChapterMode("BONUS_CROWD_PRESSURE");
        setIsNoRequestBonusSplashVisible(false);
        noRequestBonusActiveRef.current = true;
        noRequestBonusProgressRef.current = 0;
        noRequestBonusSpawnTimerRef.current = .72;
        noRequestBonusObstaclesRef.current = [{ id: -1301, x: 50, depth: 63, speed: 0, type: "bottle" }];
        crowdHandXRef.current = 50;
        crowdPressureBlocksRef.current = 0;
        setCrowdHandX(50);
        setCrowdPressureBlocks(0);
        setNoRequestBonusProgress(0);
        setNoRequestBonusObstacles([...noRequestBonusObstaclesRef.current]);
        setIsNoRequestBonusActive(true);
        noRequestBonusLastTimeRef.current = performance.now();
        updateNoRequestBonusGame(noRequestBonusLastTimeRef.current);
      },
      clearFirstBonus: () => finishLevelOneNoRequestBonus(true),
      failFirstBonus: () => finishLevelOneNoRequestBonus(false),
      startAfterpartyBonus: () => {
        levelRef.current = 2;
        recordsCaughtRef.current = BONUS_START_RECORDS;
        livesRef.current = 4;
        setLevel(2);
        setRecordsCaught(BONUS_START_RECORDS);
        setLives(4);
        startNoRequestBonus();
      },
      clearAfterpartyBonus: () => {
        if (!bonusGameActiveRef.current) return;
        bonusGearRef.current = [...BONUS_GEAR_TYPES];
        setBonusGear([...BONUS_GEAR_TYPES]);
        setBonusDoorOpen(true);
        finishNoRequestBonus(true);
      },
      failAfterpartyBonus: () => {
        if (!bonusGameActiveRef.current) return;
        finishNoRequestBonus(false);
      },
      startPitRun,
      recoverPitGear: (gear) => {
        if (!pitRunActiveRef.current || pitRunInventoryRef.current.includes(gear)) return;
        const nextInventory = [...pitRunInventoryRef.current, gear];
        pitRunInventoryRef.current = nextInventory;
        setPitRunInventory(nextInventory);
        stageControllerRef.current?.onGearRecovered(gear);
        clearStageEventAfter(260);
      },
      hitPitHazard: () => {
        if (!pitRunActiveRef.current) return;
        pitRunHitsRef.current += 1;
        setPitRunHits(pitRunHitsRef.current);
        stageControllerRef.current?.onStreetHazard("barrier");
        clearStageEventAfter(260);
      },
    };
    return () => {
      delete debugWindow.__selectahDebug;
    };
  }, []);

  useEffect(() => {
    if (!sceneVerificationMode || (!import.meta.env.DEV && !sandboxArcadeVerifier) || typeof window === "undefined") return;
    let attempts = 0;
    const launchVerifier = () => {
      const debug = (window as ArcadeDebugWindow).__selectahDebug;
      if (!debug && attempts < 4) {
        attempts += 1;
        window.setTimeout(launchVerifier, 60);
        return;
      }
      if (!debug) return;
      if (sceneVerificationMode === "level-two-arrival") {
        debug.startLevelTwo();
        return;
      }
      if (sceneVerificationMode === "first-bonus") {
        debug.startFirstBonus();
        return;
      }
      if (sceneVerificationMode === "crowd-pressure") {
        debug.startFirstBonus();
        return;
      }
      if (sceneVerificationMode === "crowd-pressure-active") {
        debug.startCrowdPressureActive();
        return;
      }
      if (sceneVerificationMode === "pit-run") {
        debug.startPitRun();
        return;
      }
      if (sceneVerificationMode === "afterparty-bonus") {
        debug.startAfterpartyBonus();
        return;
      }
      if (sceneVerificationMode === "unlock") {
        debug.showUnlock();
        return;
      }
      if (sceneVerificationMode === "loss") {
        debug.showLossComedown();
        return;
      }
      if (sceneVerificationMode === "game-over") {
        debug.showGameOver();
        return;
      }
      if (sceneVerificationMode === "speakers") {
        debug.showLevelOneSpeakers();
        return;
      }
      if (sceneVerificationMode === "items-level-one") {
        debug.showItemPreview(1);
        return;
      }
      if (sceneVerificationMode === "items-level-two") {
        debug.showItemPreview(2);
        return;
      }
      if (sceneVerificationMode === "thrown") {
        crowdHazardVariantRef.current = "thrown";
        debug.triggerSequence("crowd");
        return;
      }
      const sequence = (["rewind", "wheel", "police", "crowd", "pill", "crate", "headphones", "boh", "riddim"] as ArcadeSequence[]).find(
        candidate => candidate === sceneVerificationMode,
      );
      if (sequence) {
        debug.triggerSequence(sequence);
        const heldRewardCopy: Record<string, InWorldReward> = {
          crate: { label: "RECORD CRATE FOUND", quip: "THREE MIXERS / SELECTAH LUCK", kind: "crate" },
          headphones: { label: "HEADPHONES SECURED", quip: "THREE DECKS / READY TO SELECT", kind: "headphones" },
          boh: { label: "BOH! BOH!", quip: "FIVE DUBPLATES / +250", kind: "boh" },
          riddim: { label: "RUN THE RIDDIM!", quip: "CROWD PRESSURE / +500", kind: "riddim" },
          wheel: { label: "WHEEL IT UP", quip: "GUN FINGER MASSIVE / +10", kind: "wheel" },
        };
        const heldReward = heldRewardCopy[sceneVerificationMode];
        if (heldReward) {
          isPlayingRef.current = true;
          setIsPlaying(true);
          setInWorldReward(heldReward);
        }
      }
    };
    const verifierTimer = window.setTimeout(launchVerifier, 0);
    return () => window.clearTimeout(verifierTimer);
  }, [sceneVerificationMode]);

  useLayoutEffect(() => {
    if ((!sceneVerificationMode && !viewportVerificationMode) || !import.meta.env.DEV || typeof window === "undefined") return;
    document.getElementById("selectah-showdown")?.scrollIntoView({ block: "start" });
  }, [sceneVerificationMode, viewportVerificationMode]);

  useEffect(() => {
    if (!arcadeFocusVerifier || typeof document === "undefined") return;
    document.documentElement.dataset.arcadeFocusVerifier = "true";
    return () => { delete document.documentElement.dataset.arcadeFocusVerifier; };
  }, [arcadeFocusVerifier]);

  useEffect(() => {
    if (!mobileMatrixVerifier || typeof window === "undefined") return;
    let cancelled = false;
    const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
    const timer = window.setTimeout(async () => {
      const debug = (window as ArcadeDebugWindow).__selectahDebug;
      const playfield = document.querySelector<HTMLElement>(".game-viewport");
      const player = document.querySelector<HTMLElement>(".dj-catcher");
      if (cancelled || !debug || !playfield || !player) return;
      debug.showItemPreview(1);
      await wait(60);
      const bounds = playfield.getBoundingClientRect();
      const pointer = (type: string, ratio: number) => playfield.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 844, pointerType: "touch", clientX: bounds.left + bounds.width * ratio, clientY: bounds.top + bounds.height * .72 }));
      pointer("pointerdown", .5);
      pointer("pointermove", .08);
      const left = player.style.left;
      pointer("pointermove", .5);
      const centre = player.style.left;
      pointer("pointermove", .92);
      const right = player.style.left;
      pointer("pointerup", .92);
      debug.exerciseWorldEvent("catch");
      await wait(260);
      const catchState = { items: document.querySelectorAll(".falling-object").length, combo: document.querySelector(".combo-badge")?.textContent ?? "", records: document.querySelector(".records-hud")?.textContent ?? "" };
      debug.exerciseWorldEvent("hazard");
      await wait(260);
      const hazardState = { items: document.querySelectorAll(".falling-object").length, lives: document.querySelector(".lives-badge")?.textContent ?? "", stage: playfield.className };
      debug.exerciseWorldEvent("miss");
      await wait(260);
      const missState = { items: document.querySelectorAll(".falling-object").length, combo: document.querySelector(".combo-badge")?.textContent ?? "", stage: playfield.className };
      debug.exerciseWorldEvent("level-complete");
      await wait(260);
      const completionState = { items: document.querySelectorAll(".falling-object").length, records: document.querySelector(".records-hud")?.textContent ?? "", unlock: Boolean(document.querySelector(".unlock-overlay-box")), stage: playfield.className };
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const requiredMobileViewports = [[320, 800], [360, 800], [375, 812], [390, 844], [412, 915], [430, 932]] as const;
      const isRequiredViewport = requiredMobileViewports.some(([width, height]) => viewport.width === width && viewport.height === height);
      // Completion is proven by the completed Level 1 counter and cleared item.
      // The delayed unlock art is intentionally outside this mechanics-only verifier.
      const pass = isRequiredViewport && left === "8%" && centre === "50%" && right === "90%" && catchState.combo.includes("2") && hazardState.lives.includes("❤️❤️❤️") && missState.combo.includes("1") && completionState.records.includes("25");
      document.documentElement.dataset.arcadeMobileMatrix = pass ? "passed" : "failed";
      document.documentElement.dataset.arcadeMobileMatrixDetail = `${viewport.width}x${viewport.height}:${pass ? "passed" : "failed"}`;
      document.documentElement.dataset.arcadeMobileMatrixMovement = `${left}|${centre}|${right}`;
      console.info("[arcade-mobile-matrix]", { viewport, requiredMobileViewports, touchDrag: { left, centre, right }, catchState, hazardState, missState, completionState, pass });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [mobileMatrixVerifier]);

  useEffect(() => {
    if (viewportVerificationPreparedRef.current || !["active", "dissolve", "live", "transition", "level-one", "level-one-rave", "level-two-50"].includes(viewportVerificationMode ?? "")) return;
    viewportVerificationPreparedRef.current = true;
    let transitionReleaseTimer = 0;
    const verifierTimer = window.setTimeout(() => {
      gameRunIdRef.current += 1;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const isLevelOneVerifier = viewportVerificationMode === "level-one" || viewportVerificationMode === "level-one-rave";
      const levelOneRave = viewportVerificationMode === "level-one-rave";
      const levelTwoFifty = viewportVerificationMode === "level-two-50";
      levelRef.current = isLevelOneVerifier ? 1 : 2;
      recordsCaughtRef.current = isLevelOneVerifier ? (levelOneRave ? 25 : 0) : levelTwoFifty ? LEVEL_TWO_REQUIRED_RECORDS : 6;
      livesRef.current = 4;
      comboRef.current = isLevelOneVerifier ? (levelOneRave ? 25 : 1) : 3;
      bohBonusAwardedRef.current = true;
      riddimBonusAwardedRef.current = true;
      policeBadgeHitsRef.current = 0;
      bottleHitsRef.current = 0;
      appleCoreHitsRef.current = 0;
      pillHitsRef.current = 0;
      const verificationItems: FallingItem[] = [
        { id: -701, x: 10, y: 3, type: "record", velocity: 9, state: "active", ...FALLING_ITEM_RULES.record },
        { id: -702, x: 82, y: 11, type: "cop", velocity: 9, state: "active", ...FALLING_ITEM_RULES.cop },
        { id: -703, x: 18, y: 19, type: "bottle", velocity: 9, state: "active", ...FALLING_ITEM_RULES.bottle },
        { id: -704, x: 76, y: 28, type: "apple", velocity: 9, state: "active", ...FALLING_ITEM_RULES.apple },
        { id: -705, x: 12, y: 37, type: "lion", velocity: 9, state: "active", ...FALLING_ITEM_RULES.lion },
        { id: -706, x: 84, y: 46, type: "cdj", velocity: 9, state: "active", ...FALLING_ITEM_RULES.cdj },
      ];
      const levelOneItems = verificationItems.filter((item) => !["bottle", "apple", "lion"].includes(item.type));
      const showVerifierItems = ["active", "live", "level-one", "level-one-rave"].includes(viewportVerificationMode ?? "");
      const activeVerifierItems = isLevelOneVerifier ? levelOneItems : verificationItems;
      itemsRef.current = showVerifierItems ? activeVerifierItems : [];
      spawnTimerRef.current = viewportVerificationMode === "live" ? -1000 : 0;
      setLevel(isLevelOneVerifier ? 1 : 2);
      setRecordsCaught(isLevelOneVerifier ? (levelOneRave ? 25 : 0) : levelTwoFifty ? LEVEL_TWO_REQUIRED_RECORDS : 6);
      setLives(4);
      setCombo(isLevelOneVerifier ? (levelOneRave ? 25 : 1) : 3);
      setGameOver(false);
      setIsLevelTwoTransitioning(false);
      setIsLevelTwoMarqueeVisible(false);
      setActiveArcadeSequence(null);
      setVisibleItems(showVerifierItems ? activeVerifierItems : []);
      stageControllerRef.current?.setLevel(isLevelOneVerifier ? 1 : 2);
      stageControllerRef.current?.setEnergy(isLevelOneVerifier && levelOneRave ? 1 : 0);
      setPlayerWorldX(50, "playing");
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      if (viewportVerificationMode === "dissolve") {
        setIsRecordTransitioning(true);
      } else if (viewportVerificationMode === "transition") {
        setIsRecordTransitioning(true);
        transitionReleaseTimer = window.setTimeout(() => {
          setIsRecordTransitioning(false);
          lastTimeRef.current = performance.now();
          queueGameFrame();
        }, 520);
      } else {
        setIsRecordTransitioning(false);
        if (viewportVerificationMode === "live") queueGameFrame();
      }
    }, 0);
    return () => {
      window.clearTimeout(verifierTimer);
      window.clearTimeout(transitionReleaseTimer);
    };
  }, [viewportVerificationMode]);

  const updatePitRun = (time: number) => {
    if (!pitRunActiveRef.current) return;
    const elapsed = Math.max(0, time - pitRunLastTimeRef.current);
    const dt = Math.min(.032, elapsed / 1000);
    pitRunLastTimeRef.current = time;
    if (keysRef.current["left"]) moveBonusSideways(-1);
    if (keysRef.current["right"]) moveBonusSideways(1);

    const missingGear = PIT_REQUIRED_GEAR.filter((gear) => !pitRunInventoryRef.current.includes(gear));
    const progressRate = 8 + Math.min(9, pitRunProgressRef.current / 13);
    const canApproachAfterparty = missingGear.length === 0;
    const nextProgress = pitRunProgressLimit(pitRunProgressRef.current + progressRate * dt, canApproachAfterparty);
    pitRunProgressRef.current = nextProgress;
    setPitRunProgress(nextProgress);

    pitRunSpawnTimerRef.current += dt;
    const nextEntities = pitRunEntitiesRef.current
      .map((entity) => ({ ...entity, depth: entity.depth + entity.speed * dt }))
      .filter((entity) => entity.depth < 112);
    if (pitRunSpawnTimerRef.current >= Math.max(.42, .86 - pitRunProgressRef.current / 180) && nextEntities.length < 4) {
      pitRunSpawnTimerRef.current = 0;
      const shouldForceGear = missingGear.length > 0 && (pitRunProgressRef.current > 48 || Math.random() < .68);
      const type: PitEntityType = shouldForceGear
        ? missingGear[Math.floor(Math.random() * missingGear.length)]
        : PIT_HAZARD_TYPES[Math.floor(Math.random() * PIT_HAZARD_TYPES.length)];
      const openLanes = [0, 1, 2].filter((lane) => !nextEntities.some((entity) => entity.lane === lane && entity.depth < 58));
      const lanePool = openLanes.length ? openLanes : [0, 1, 2];
      nextEntities.push({
        id: pitRunNextIdRef.current++,
        lane: lanePool[Math.floor(Math.random() * lanePool.length)],
        depth: 1,
        speed: 22 + Math.min(17, pitRunProgressRef.current / 5) + Math.random() * 5,
        type,
      });
    }

    const surviving: PitRunEntity[] = [];
    for (const entity of nextEntities) {
      const intersectsRunner = entity.lane === pitRunLaneRef.current && entity.depth >= 82 && entity.depth <= 98;
      if (intersectsRunner) {
        if ((PIT_REQUIRED_GEAR as readonly string[]).includes(entity.type)) {
          const gear = entity.type as PitGearType;
          if (!pitRunInventoryRef.current.includes(gear)) {
            const nextPitState = recoverPitGear({ score: scoreRef.current, combo: comboRef.current, hits: pitRunHitsRef.current, inventory: pitRunInventoryRef.current, progress: pitRunProgressRef.current }, gear);
            const nextInventory = [...nextPitState.inventory] as PitGearType[];
            pitRunInventoryRef.current = nextInventory;
            setPitRunInventory(nextInventory);
            scoreRef.current = nextPitState.score;
            setScore(nextPitState.score);
            comboRef.current = nextPitState.combo;
            setCombo(nextPitState.combo);
            stageControllerRef.current?.onGearRecovered(gear);
            clearStageEventAfter(380);
            announceInWorldReward(`${gear.toUpperCase()} SECURED`, "PIT RUN RECOVERY", "crate");
          }
          continue;
        }
        const nextPitState = applyPitRunHazard({ score: scoreRef.current, combo: comboRef.current, hits: pitRunHitsRef.current, inventory: pitRunInventoryRef.current, progress: pitRunProgressRef.current });
        pitRunHitsRef.current = nextPitState.hits;
        setPitRunHits(nextPitState.hits);
        comboRef.current = nextPitState.combo;
        setCombo(nextPitState.combo);
        const nextCondition = worsenEquipmentCondition(equipmentConditionRef.current);
        setEquipmentState(nextCondition);
        mixerDamagedRef.current = equipmentIsDamaged(nextCondition);
        setMixerDamaged(mixerDamagedRef.current);
        stageControllerRef.current?.onStreetHazard(entity.type);
        stageControllerRef.current?.onDamage();
        clearStageEventAfter(420);
        announceDamage(`${entity.type.toUpperCase()} IN THE PIT`, Math.max(0, 3 - pitRunHitsRef.current), true);
        continue;
      }
      if (entity.lane !== pitRunLaneRef.current && entity.depth >= 86 && entity.depth <= 92) {
        stageControllerRef.current?.onNearMiss(entity.type);
        clearStageEventAfter(180);
      }
      surviving.push(entity);
    }
    pitRunEntitiesRef.current = surviving;
    setPitRunEntities(surviving);
    if (pitRunCompletes(pitRunProgressRef.current, pitRunInventoryRef.current, PIT_REQUIRED_GEAR)) {
      finishPitRun(true);
      return;
    }
    pitRunRequestRef.current = requestAnimationFrame(updatePitRun);
  };

  const updateNoRequestBonusGame = (time: number) => {
    if (!noRequestBonusActiveRef.current) return;
    const elapsed = Math.max(0, time - noRequestBonusLastTimeRef.current);
    const dt = Math.min(0.032, elapsed / 1000);
    noRequestBonusLastTimeRef.current = time;
    if (keysRef.current["left"]) setCrowdHandWorldX(crowdHandXRef.current - 78 * dt);
    if (keysRef.current["right"]) setCrowdHandWorldX(crowdHandXRef.current + 78 * dt);
    const nextProgress = crowdPressureCaptureHold
      ? Math.max(38, noRequestBonusProgressRef.current)
      : Math.min(100, noRequestBonusProgressRef.current + dt * 20);
    noRequestBonusProgressRef.current = nextProgress;
    setNoRequestBonusProgress(nextProgress);

    noRequestBonusSpawnTimerRef.current += dt;
    const nextEntities = noRequestBonusObstaclesRef.current
      .map((entity) => ({ ...entity, depth: entity.depth + entity.speed * dt }))
      .filter((entity) => entity.depth < 112);

    if (noRequestBonusSpawnTimerRef.current >= .68 && nextEntities.length < 4) {
      noRequestBonusSpawnTimerRef.current = 0;
      const types: NoRequestBonusEntity["type"][] = ["cigarette", "beer", "spit", "bottle"];
      nextEntities.push({
        id: noRequestBonusNextIdRef.current++,
        x: 9 + Math.random() * 82,
        depth: 0,
        speed: 46 + Math.random() * 13,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    const survivingEntities: NoRequestBonusEntity[] = [];
    for (const entity of nextEntities) {
      const crowdOutcome = resolveCrowdPressureOutcome(crowdHandXRef.current, entity.x, entity.depth);
      if (crowdOutcome === "block") {
        const nextCrowdState = applyCrowdPressureOutcome({ score: scoreRef.current, blocks: crowdPressureBlocksRef.current, equipmentHits: 0 }, crowdOutcome);
        crowdPressureBlocksRef.current = nextCrowdState.blocks;
        setCrowdPressureBlocks(nextCrowdState.blocks);
        scoreRef.current = nextCrowdState.score;
        setScore(nextCrowdState.score);
        stageControllerRef.current?.onCatch(entity.type);
        clearStageEventAfter(360);
        reactToCrowdPressure("block");
        continue;
      }
      if (crowdOutcome === "equipment-hit") {
        const nextCondition = worsenEquipmentCondition(equipmentConditionRef.current);
        setEquipmentState(nextCondition);
        mixerDamagedRef.current = equipmentIsDamaged(nextCondition);
        setMixerDamaged(mixerDamagedRef.current);
        stageControllerRef.current?.onHazard(entity.type);
        stageControllerRef.current?.onDamage();
        clearStageEventAfter(460);
        reactToCrowdPressure("damage");
        continue;
      }
      survivingEntities.push(entity);
    }
    noRequestBonusObstaclesRef.current = survivingEntities;
    setNoRequestBonusObstacles(survivingEntities);
    if (nextProgress >= 100) {
      finishLevelOneNoRequestBonus(true);
      return;
    }
    noRequestBonusRequestRef.current = requestAnimationFrame(updateNoRequestBonusGame);
  };

  const updateBonusGame = (time: number) => {
    if (!bonusGameActiveRef.current) return;
    const elapsed = Math.max(0, time - bonusLastTimeRef.current);
    const dt = Math.min(0.032, elapsed / 1000);
    bonusLastTimeRef.current = time;

    if (keysRef.current["left"]) moveBonusSideways(-1);
    if (keysRef.current["right"]) moveBonusSideways(1);
    const nextProgress = Math.min(100, bonusProgressRef.current + (holdSequenceDebugEnabled ? 1 : 2.75) * dt);
    bonusProgressRef.current = nextProgress;
    setBonusProgress(nextProgress);

    bonusSpawnTimerRef.current += dt;
    if (!holdSequenceDebugEnabled && bonusSpawnTimerRef.current >= 1.08 && bonusObstaclesRef.current.length < 3) {
      bonusSpawnTimerRef.current = 0;
      const missingGear = BONUS_GEAR_TYPES.filter((gear) => !bonusGearRef.current.includes(gear));
      const isGear = missingGear.length > 0 && Math.random() < 0.88;
      const type = isGear
        ? missingGear[Math.floor(Math.random() * missingGear.length)]
        : BONUS_HAZARD_TYPES[Math.floor(Math.random() * BONUS_HAZARD_TYPES.length)];
      const openLanes = [0, 1, 2].filter((lane) => !bonusObstaclesRef.current.some((entity) => entity.lane === lane && entity.depth < 62));
      const safeLanes = openLanes.filter((lane) => !bonusObstaclesRef.current.some((entity) => entity.lane === lane && entity.depth > 54 && entity.depth < 102));
      const lanePool = safeLanes.length ? safeLanes : openLanes;
      if (lanePool.length) {
        const lane = lanePool[Math.floor(Math.random() * lanePool.length)];
        bonusObstaclesRef.current.push({ id: bonusNextIdRef.current++, depth: 1, lane, type, speed: 18 + Math.floor(Math.random() * 5) });
      }
    }

    const nextObstacles: BonusRunnerEntity[] = [];
    for (const obstacle of bonusObstaclesRef.current) {
      const moved = { ...obstacle, depth: obstacle.depth + obstacle.speed * dt };
      const isAtRunner = moved.lane === bonusLaneRef.current && moved.depth >= 83 && moved.depth <= 98;
      if (isAtRunner) {
        if (BONUS_GEAR_TYPES.includes(moved.type as BonusGearType)) {
          const gear = moved.type as BonusGearType;
          if (!bonusGearRef.current.includes(gear)) {
            const nextGear = [...bonusGearRef.current, gear];
            bonusGearRef.current = nextGear;
            setBonusGear(bonusGearRef.current);
            if (nextGear.length === BONUS_GEAR_TYPES.length) setBonusDoorOpen(true);
            playTurntablePickup();
          }
          continue;
        }
        announceDamage("GEAR SPILLED — BONUS OVER", 0, true);
        finishNoRequestBonus(false);
        return;
      }
      if (moved.depth < 112) nextObstacles.push(moved);
    }
    bonusObstaclesRef.current = nextObstacles;
    setBonusObstacles(nextObstacles);

    if (nextProgress >= 100 && bonusGearRef.current.length === BONUS_GEAR_TYPES.length) {
      finishNoRequestBonus(true);
      return;
    }
    bonusRequestRef.current = requestAnimationFrame(updateBonusGame);
  };

  useEffect(() => {
    if (!isBonusSplashVisible) return;
    bonusSplashTimerRef.current = window.setTimeout(() => {
      setIsBonusSplashVisible(false);
      setIsBonusLevelActive(true);
      bonusGameActiveRef.current = true;
      bonusLastTimeRef.current = performance.now();
      playBonusMusic();
      bonusRequestRef.current = requestAnimationFrame(updateBonusGame);
    }, 1950);
    return () => window.clearTimeout(bonusSplashTimerRef.current);
  }, [isBonusSplashVisible]);

  useEffect(() => {
    if (!isBonusRewinding) return;
    bonusRewindTimerRef.current = window.setTimeout(() => {
      setIsBonusRewinding(false);
      if (bgMusicRef.current && soundEnabledRef.current) void bgMusicRef.current.play().catch(() => setMusicStatus("blocked"));
      resumeMainGame();
    }, 1450);
    return () => window.clearTimeout(bonusRewindTimerRef.current);
  }, [isBonusRewinding]);

  const keepPlayingAfterUnlock = () => {
    if (!isUnlockPaused || !chainBreakComplete) return;
    if (bonusEligibleRef.current) {
      startLevelOneNoRequestBonus();
      return;
    }
    setIsUnlockPaused(false);
    setPreLevelTwoHighScore(true);
  };

  useEffect(() => {
    if (!isUnlockPaused || !unlockRevealReady) return;
    // The download reaches its resting position after five seconds, then its
    // silver chain gives a tight, realistic one-second break before handoff.
    const chainImpactTimer = window.setTimeout(() => {
      if (chainBreakImpactPlayedRef.current) return;
      chainBreakImpactPlayedRef.current = true;
      setIsCabinetVibrating(true);
      playChainBreakImpact();
    }, 5000);
    const cabinetSettleTimer = window.setTimeout(() => setIsCabinetVibrating(false), 5360);
    const breakTimer = window.setTimeout(() => setChainBreakComplete(true), 6000);
    return () => {
      window.clearTimeout(chainImpactTimer);
      window.clearTimeout(cabinetSettleTimer);
      window.clearTimeout(breakTimer);
    };
  }, [isUnlockPaused, unlockRevealReady]);

  useEffect(() => {
    if (!chainBreakComplete || downloadUnlockedRef.current) return;
    // The parent only accepts this proof after this exact one-second chain break.
    // This prevents achievement, timer, or stale storage paths from exposing Jersh early.
    onUnlockDownload?.("chain-break-complete");
  }, [chainBreakComplete, onUnlockDownload]);

  useEffect(() => {
    if (!activeArcadeSequence) return;
    const sequenceDurations: Record<ArcadeSequence, number> = {
      rewind: 2300,
      wheel: 2450,
      police: 2500,
      crowd: 2450,
      pill: 2600,
      crate: 2350,
      headphones: 2350,
      boh: 1750,
      riddim: 2100,
    };
    const activeDuration = holdSequenceDebugEnabled ? 25000 : sequenceDurations[activeArcadeSequence];
    arcadeSequenceTimerRef.current = window.setTimeout(() => {
      if (activeArcadeSequence === "rewind") setIsRewindPaused(false);
      if (activeArcadeSequence === "wheel") setIsWheelItUpPaused(false);
      if (activeArcadeSequence === "police") setIsPoliceSeizurePaused(false);
      if (activeArcadeSequence === "crowd") setIsCrowdAngerPaused(false);
      if (activeArcadeSequence === "pill") setIsPillOverloadPaused(false);
      if (activeArcadeSequence === "crate") setIsCrateBonusPaused(false);
      if (activeArcadeSequence === "headphones") setIsHeadphonesBonusPaused(false);
      setActiveArcadeSequence(null);
      setIsRecordTransitioning(true);
      playRecordScratch();
      recordTransitionTimerRef.current = window.setTimeout(() => {
        setIsRecordTransitioning(false);
        resumeOrAdvanceArcadeSequence();
      }, 520);
    }, activeDuration);
    return () => {
      window.clearTimeout(arcadeSequenceTimerRef.current);
    };
  }, [activeArcadeSequence]);

  const submitPreLevelTwoScore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = sanitizeSelectorTag(playerName);
    if (safeName) recordHighScore(score, safeName, "level1");
    setPlayerName(safeName);
    setSubmittedName(safeName);
    setScoreSubmitted(Boolean(safeName));
    setPreLevelTwoHighScore(false);
    onAchievementFlowComplete?.();
    startLevelTwo();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && !isBonusLevelActive && !isNoRequestBonusActive) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current["left"] = true;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current["right"] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current["left"] = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current["right"] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isBonusLevelActive, isNoRequestBonusActive]);

  const showLossComedown = () => {
    window.clearTimeout(lossComedownTimerRef.current);
    setIsLossComedownVisible(true);
    if (lossVerificationHold) return;
    lossComedownTimerRef.current = window.setTimeout(() => setIsLossComedownVisible(false), 2300);
  };

  useEffect(() => {
    if (!lossVerificationHold) return;
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    levelRef.current = 1;
    livesRef.current = 0;
    isPlayingRef.current = false;
    setLevel(1);
    setLives(0);
    setScore(800);
    setIsPlaying(false);
    setLevelTwoComplete(false);
    setGameOver(true);
    showLossComedown();
    return () => window.clearTimeout(lossComedownTimerRef.current);
  }, [lossVerificationHold]);

  const startGame = () => {
    gameRunIdRef.current += 1;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") void ctx.resume();
    unlockJinglePlayedRef.current = false;
    chainBreakImpactPlayedRef.current = false;
    rewindAwardedRef.current = false;
    wheelItUpAwardedRef.current = false;
    bohBonusAwardedRef.current = false;
    bigUpAwardedRef.current = false;
    riddimBonusAwardedRef.current = false;
    policeBadgeHitsRef.current = 0;
    bottleHitsRef.current = 0;
    appleCoreHitsRef.current = 0;
    pillHitsRef.current = 0;
    crowdCheerPlayedRef.current = false;
    mixerDamagedRef.current = false;
    recoveryProgressRef.current = 0;
    window.clearTimeout(rewindPauseTimerRef.current);
    window.clearTimeout(wheelItUpPauseTimerRef.current);
    window.clearTimeout(policeSeizurePauseTimerRef.current);
    window.clearTimeout(crowdAngerPauseTimerRef.current);
    window.clearTimeout(pillOverloadPauseTimerRef.current);
    window.clearTimeout(crateBonusPauseTimerRef.current);
    window.clearTimeout(headphonesBonusPauseTimerRef.current);
    window.clearTimeout(levelTwoMusicTimerRef.current);
    window.clearTimeout(levelTwoMarqueeTimerRef.current);
    window.clearTimeout(levelTwoTransitionTimerRef.current);
    window.clearTimeout(arcadeSequenceTimerRef.current);
    window.clearTimeout(recordTransitionTimerRef.current);
    window.clearTimeout(mixerRepairTimerRef.current);
    window.clearTimeout(bonusSplashTimerRef.current);
    window.clearTimeout(bonusRewindTimerRef.current);
    window.clearTimeout(damageFeedbackTimerRef.current);
    window.clearTimeout(lossComedownTimerRef.current);
    window.clearTimeout(unlockRevealTimerRef.current);
    window.clearTimeout(inWorldRewardTimerRef.current);
    setDamageFeedback(null);
    setInWorldReward(null);
    levelRef.current = 1;
    setChapterMode("LEVEL_1");
    levelOneHazardsHitRef.current = 0;
    setLevelOneHazardsHit(0);
    setEquipmentState("clean");
    setLevel(1);
    setLevelTwoComplete(false);
    setFinale(false);
    setSharedScoreStatus("idle");
    finaleRef.current = false;
    isPlayingRef.current = true;
    startLevelOneMusic();
    primeBonusMusicForSession();
    scoreRef.current = 0;
    recordsCaughtRef.current = 0;
    comboRef.current = 1;
    livesRef.current = 4;
    setIsPlaying(true);
    setGameOver(false);
    setIsLossComedownVisible(false);
    setLevelTwoComplete(false);
    setIsUnlockPaused(false);
    setIsRewindPaused(false);
    setIsWheelItUpPaused(false);
    setIsPoliceSeizurePaused(false);
    setIsCrowdAngerPaused(false);
    setIsPillOverloadPaused(false);
    setIsCrateBonusPaused(false);
    setIsHeadphonesBonusPaused(false);
    setIsRecordTransitioning(false);
    setIsLevelTwoMarqueeVisible(false);
    setActiveArcadeSequence(null);
    setIsLevelTwoTransitioning(false);
    setMixerDamaged(false);
    setRecoveryProgress(0);
    setMixerRepairBurst(false);
    setComboReaction(null);
    setIsGunFingerShaking(false);
    setGreenCamoUnlocked(false);
    window.clearTimeout(comboBurstTimerRef.current);
    window.clearTimeout(gunFingerShakeTimerRef.current);
    bonusEligibleRef.current = false;
    crowdPressureTriggeredRef.current = false;
    bonusCompletedRef.current = false;
    bonusTriggeredRef.current = false;
    bonusGameActiveRef.current = false;
    bonusProgressRef.current = 0;
    bonusLaneRef.current = 1;
    bonusGearRef.current = [];
    bonusObstaclesRef.current = [];
    mixerPickupCountRef.current = 0;
    turntablePickupCountRef.current = 0;
    pendingArcadeSequenceRef.current = [];
    setIsBonusEligible(false);
    cleanDubplateStreakRef.current = 0;
    setCleanDubplateStreak(0);
    setHazardSinceStreakStart(false);
    setIsBonusSplashVisible(false);
    setIsBonusLevelActive(false);
    setIsBonusRewinding(false);
    setBonusProgress(0);
    setBonusLane(1);
    setBonusGear([]);
    setBonusDoorOpen(false);
    setBonusCamoUnlocked(false);
    setBonusObstacles([]);
    setUnlockRevealReady(false);
    setChainBreakComplete(false);
    setIsCabinetVibrating(false);
    setPreLevelTwoHighScore(false);
    setIsNewRecord(false);
    setScoreSubmitted(false);
    setSubmittedName("");
    setPlayerName("");
    setScore(0);
    setRecordsCaught(0);
    setCombo(1);
    setLives(4);
    setPlayerWorldX(50, "ready");
    setVisibleItems([]);
    itemsRef.current = [];
    nextIdRef.current = 1;
    spawnTimerRef.current = 0;
    namedHazardSpawnCountRef.current = 0;
    lastTimeRef.current = performance.now();
    queueGameFrame();
  };

  const updateGame = (time: number) => {
    const elapsed = Math.max(0, time - lastTimeRef.current);
    const dt = Math.min(0.032, elapsed / 1000);
    lastTimeRef.current = time;

    let currentX = djXRef.current;
    const moveSpeed = 78;
    if (keysRef.current["left"]) currentX = Math.max(4, currentX - moveSpeed * dt);
    if (keysRef.current["right"]) currentX = Math.min(90, currentX + moveSpeed * dt);
    if (currentX !== djXRef.current) {
      setPlayerWorldX(currentX);
    }

    let structureChanged = false;
    spawnTimerRef.current += dt;
    // Fewer dubplates, more hazards: a steady scheduler keeps the flow populated
    // until the player clears a level or loses their final life.
    const spawnInterval = levelRef.current === 2 ? 0.72 : 1.10;
    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current -= spawnInterval;
      namedHazardSpawnCountRef.current += 1;
      const activeFallingLevel: 1 | 2 = levelRef.current === 3 ? 2 : levelRef.current;
      const scheduledNamedHazard = scheduledNamedHazardExposure(activeFallingLevel, namedHazardSpawnCountRef.current);
      const roll = Math.random();
      // Each scheduled pair is an avoidable chance to deliberately trigger a named scene.
      // Level 1 remains free of bottles and apple cores; only Level 2 crowd throws them.
      const spawnedType = scheduledNamedHazard ?? pickFallingItemType(activeFallingLevel, roll);
      const itemRule = FALLING_ITEM_RULES[spawnedType];
      // Increase speed moderately with progression / score
      const baseSpeed = levelRef.current === 2 ? 50 : 36;
      const speedRamp = Math.min(18, Math.floor(scoreRef.current / 400) * 2);
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: Math.floor(Math.random() * (88 - itemRule.width)) + 4,
        y: -itemRule.height,
        type: spawnedType,
        velocity: Math.floor(Math.random() * (levelRef.current === 2 ? 12 : 10)) + baseSpeed + speedRamp,
        state: "active",
        width: itemRule.width,
        height: itemRule.height,
        visualSize: itemRule.visualSize,
        tilt: itemRule.tilt * (Math.random() > 0.5 ? 1 : -1),
      });
      structureChanged = true;
    }

    const nextItems: FallingItem[] = [];
    let pauseAfterUnlock = false;
    let pauseForRewind = false;
    let pauseForWheelItUp = false;
    let pauseForPoliceSeizure = false;
    let pauseForCrowdAnger = false;
    let pauseForPillOverload = false;
    let pauseForCrateBonus = false;
    let pauseForHeadphonesBonus = false;
    let pauseForBohBonus = false;
    let pauseForRiddimBonus = false;
    let launchBonus = false;
    let bonusThresholdReached = false;
    let advanceToLevelTwo = false;
    let completeLevelTwo = false;
    let launchCrowdPressure = false;
    let currentLives = livesRef.current;
    let currentScore = scoreRef.current;
    for (let index = 0; index < itemsRef.current.length; index += 1) {
      const item = itemsRef.current[index];
      const newY = item.y + item.velocity * dt;
      const movedItem = { ...item, y: newY };
      const itemNode = itemsLayerRef.current?.querySelector<HTMLElement>(`[data-game-object-id="${item.id}"]`);
      if (itemNode) itemNode.style.top = `${newY}%`;

      const resolvedItem = resolveWorldCollision(playerWorldRef.current, movedItem);
      if (resolvedItem) {
        structureChanged = true;
        if (item.type === "record" || item.type === "lion" || item.type === "cdj" || item.type === "mixer" || item.type === "turntable" || item.type === "adapter") {
          if (item.type === "turntable") {
            playTurntablePickup();
          } else if (item.type === "adapter") {
            playAdapterPickup();
          } else {
            playRecordScratch();
          }
          playPickupToken();
          const nextCombo = comboRef.current + 1;
          comboRef.current = nextCombo;
          setCombo(nextCombo);
          stageControllerRef.current?.onCatch(item.type);
          clearStageEventAfter(520);
          showImpactFeedback(movedItem, "catch");
          const milestoneReaction = reactionForCombo(nextCombo);
          if (milestoneReaction) {
            window.setTimeout(() => {
              stageControllerRef.current?.onCombo(nextCombo);
              clearStageEventAfter(milestoneReaction === "COMBO_25" ? 900 : 520);
            }, 130);
          }
          setStageEnergy(nextCombo / 25);
          const pickupValue = item.type === "lion" ? 2 : item.type === "cdj" ? 5 : item.type === "mixer" ? 4 : item.type === "turntable" ? 3 : item.type === "adapter" ? 2 : 1;
          const pickupLabel = item.type === "lion" ? "LION +2" : item.type === "cdj" ? "CDJ +5" : item.type === "mixer" ? "MIX +4" : item.type === "turntable" ? "DECK +3" : item.type === "adapter" ? "45 +2" : "DUB +1";
          const pointsEarned = 100 * pickupValue * Math.min(4, nextCombo);
          logMechanicsEvent(`entity=${item.type} collision=catch reaction=collect score=+${pointsEarned} damage=0 lives=${currentLives} combo=${nextCombo}`);
          currentScore += pointsEarned;
          // Level 1 is specifically a 25-dubplate chapter. Supporting gear can
          // award score and combo value, but cannot silently advance its record
          // target or skip the 15-clean-dubplate Crowd Pressure qualification.
          // Level 2 retains its established 50-item counter.
          const objectiveIncrement = levelRef.current === 1 ? (item.type === "record" ? 1 : 0) : pickupValue;
          const nextRecordsCaught = recordsCaughtRef.current + objectiveIncrement;
          const canShowInWorldReward = nextRecordsCaught - lastInWorldRewardRecordRef.current >= 7;
          window.clearTimeout(pickupFlashTimerRef.current);
          setPickupFlash({ key: item.id, label: pickupLabel });
          pickupFlashTimerRef.current = window.setTimeout(() => setPickupFlash(null), 820);
          if (nextCombo >= 30 && !wheelItUpAwardedRef.current) {
            // The rarest selector salute is deliberately deep in the streak so it
            // remains special through both 25- and 50-record level targets.
            wheelItUpAwardedRef.current = true;
            currentScore += 10;
            if (canShowInWorldReward) {
              lastInWorldRewardRecordRef.current = nextRecordsCaught;
              pauseForWheelItUp = true;
            }
          } else if (nextCombo >= 18 && !rewindAwardedRef.current) {
            // Rewind now arrives later in a run, so its full-screen interruption
            // feels earned rather than routine.
            rewindAwardedRef.current = true;
            currentScore += 5;
            pauseForRewind = true;
          }
          if (nextRecordsCaught >= 5 && !bohBonusAwardedRef.current) {
            bohBonusAwardedRef.current = true;
            currentScore += 250;
            lastInWorldRewardRecordRef.current = nextRecordsCaught;
            pauseForBohBonus = true;
          }
          if (nextRecordsCaught >= 6 && !bigUpAwardedRef.current) {
            bigUpAwardedRef.current = true;
            setComboReaction("big-up");
            setShowComboBurst(true);
            announceInWorldReward("BIG UP!", "big-up", "big-up");
            window.clearTimeout(comboBurstTimerRef.current);
            comboBurstTimerRef.current = window.setTimeout(() => {
              setShowComboBurst(false);
              setComboReaction(null);
            }, 1100);
            playSubwooferPop();
          }
          if (levelRef.current === 2 && nextRecordsCaught >= 15 && !riddimBonusAwardedRef.current) {
            riddimBonusAwardedRef.current = true;
            currentScore += 500;
            lastInWorldRewardRecordRef.current = nextRecordsCaught;
            pauseForRiddimBonus = true;
          }
          if (item.type === "mixer") {
            mixerPickupCountRef.current += 1;
            if (mixerPickupCountRef.current >= 3) {
              mixerPickupCountRef.current = 0;
              if (canShowInWorldReward) {
                lastInWorldRewardRecordRef.current = nextRecordsCaught;
                pauseForCrateBonus = true;
              }
            }
          }
          if (item.type === "turntable") {
            turntablePickupCountRef.current += 1;
            if (turntablePickupCountRef.current >= 3) {
              turntablePickupCountRef.current = 0;
              if (canShowInWorldReward) {
                lastInWorldRewardRecordRef.current = nextRecordsCaught;
                pauseForHeadphonesBonus = true;
              }
            }
          }
          if (mixerDamagedRef.current && item.type === "record") {
            setEquipmentState("repairing");
            const nextRecoveryProgress = Math.min(3, recoveryProgressRef.current + 1);
            recoveryProgressRef.current = nextRecoveryProgress;
            setRecoveryProgress(nextRecoveryProgress);
            if (nextRecoveryProgress >= 3) {
              // 5D design: three recovered dubplates repair the seized mixer,
              // paying out a clear arcade bonus and one short repair flourish.
              mixerDamagedRef.current = false;
              recoveryProgressRef.current = 0;
              currentScore += 500;
              setMixerDamaged(false);
              setEquipmentState("repaired");
              setRecoveryProgress(0);
              setMixerRepairBurst(true);
              window.clearTimeout(mixerRepairTimerRef.current);
              mixerRepairTimerRef.current = window.setTimeout(() => setMixerRepairBurst(false), 1050);
            }
          }
          scoreRef.current = currentScore;
          recordsCaughtRef.current = nextRecordsCaught;
          setScore(currentScore);
          setRecordsCaught(nextRecordsCaught);
          if (levelRef.current === 1 && item.type === "record") {
            const nextCleanStreak = cleanDubplateStreakRef.current + 1;
            cleanDubplateStreakRef.current = nextCleanStreak;
            setCleanDubplateStreak(nextCleanStreak);
            setHazardSinceStreakStart(false);
            if (canUnlockCrowdPressure(nextCleanStreak, 0) && !bonusEligibleRef.current) {
              bonusEligibleRef.current = true;
              setIsBonusEligible(true);
              announceInWorldReward("CROWD PRESSURE READY", "15 CLEAN DUBPLATES / HOLD THE BOOTH", "riddim");
              if (!crowdPressureTriggeredRef.current) {
                crowdPressureTriggeredRef.current = true;
                launchCrowdPressure = true;
              }
            }
          }
          consecutiveHazardRef.current = null;
          consecutiveHazardCountRef.current = 0;
          if (levelRef.current === 2 && nextRecordsCaught >= 25 && !crowdCheerPlayedRef.current) {
            crowdCheerPlayedRef.current = true;
            playCrowdCheer();
          }
          const nextReaction: ComboReaction = nextCombo === 12 ? "gun-fingers" : nextCombo === 24 ? "ground-decks" : null;
          if (nextReaction) {
            setComboReaction(nextReaction);
            setShowComboBurst(true);
            if (nextReaction === "gun-fingers") {
              announceInWorldReward("GUN FINGER MASSIVE", "SELECTOR SALUTE / CABINET UNDER PRESSURE", "gun-fingers");
            }
            window.clearTimeout(comboBurstTimerRef.current);
            comboBurstTimerRef.current = window.setTimeout(() => {
              setShowComboBurst(false);
              setComboReaction(null);
            }, nextReaction === "ground-decks" ? 1350 : nextReaction === "gun-fingers" ? 1750 : 1100);
            if (nextReaction === "gun-fingers") playSubwooferPop();
            if (nextReaction === "gun-fingers") {
              setIsGunFingerShaking(true);
              window.clearTimeout(gunFingerShakeTimerRef.current);
              gunFingerShakeTimerRef.current = window.setTimeout(() => setIsGunFingerShaking(false), 1500);
            }
          }
          if (levelRef.current === 1 && nextRecordsCaught >= REQUIRED_RECORDS) {
            setGameplayStateOwner("LEVEL_COMPLETE");
            stageControllerRef.current?.onLevelComplete();
            clearStageEventAfter(900);
            const firstBonusEligible = bonusEligibleRef.current;
            bonusEligibleRef.current = firstBonusEligible;
            setIsBonusEligible(firstBonusEligible);
            if (!downloadUnlockedRef.current && !unlockJinglePlayedRef.current) {
              unlockJinglePlayedRef.current = true;
              playUnlockJingle();
              pauseAfterUnlock = true;
            } else {
              advanceToLevelTwo = true;
            }
          }
          if (levelRef.current === 2 && nextRecordsCaught >= BONUS_START_RECORDS && !bonusTriggeredRef.current) {
            bonusThresholdReached = true;
          }
          if (levelRef.current === 2 && nextRecordsCaught >= LEVEL_TWO_REQUIRED_RECORDS) {
            completeLevelTwo = true;
          }
        } else {
          setGameplayStateOwner("DAMAGED");
          playCopSiren();
          stageControllerRef.current?.onHazard(item.type);
          stageControllerRef.current?.onDamage();
          clearStageEventAfter(620);
          showImpactFeedback(movedItem, "hazard");
          setStageEnergy(0);
          const nextEquipmentCondition = worsenEquipmentCondition(equipmentConditionRef.current);
          setEquipmentState(nextEquipmentCondition);
          mixerDamagedRef.current = equipmentIsDamaged(nextEquipmentCondition);
          setMixerDamaged(mixerDamagedRef.current);
          if (levelRef.current === 1) {
            levelOneHazardsHitRef.current += 1;
            setLevelOneHazardsHit(levelOneHazardsHitRef.current);
            cleanDubplateStreakRef.current = 0;
            setCleanDubplateStreak(0);
            setHazardSinceStreakStart(true);
          }
          comboRef.current = 1;
          rewindAwardedRef.current = false;
          wheelItUpAwardedRef.current = false;
          setCombo(1);
          if (mixerDamagedRef.current) {
            recoveryProgressRef.current = 0;
            setRecoveryProgress(0);
            window.setTimeout(() => setGameplayStateOwner("RECOVERY"), 460);
          } else {
            window.setTimeout(() => setGameplayStateOwner("PLAYING"), 460);
          }
          currentLives = Math.max(0, currentLives - 1);
          livesRef.current = currentLives;
          setLives(currentLives);
          logMechanicsEvent(`entity=${item.type} collision=hazard reaction=damage score=0 damage=1 lives=${currentLives} combo=1`);
          announceDamage(item.type === "cop" ? "BADGE HIT" : item.type === "pill" ? "PILL HIT" : item.type === "phone" ? "PHONE HIT" : item.type === "bottle" ? "BOTTLE HIT" : "APPLE CORE HIT", currentLives);
          if (currentLives === 0) {
            setGameplayStateOwner("GAME_OVER");
            isPlayingRef.current = false;
            if (bgMusicRef.current) bgMusicRef.current.pause();
            itemsRef.current = [];
            setVisibleItems([]);
            setGameOver(true);
            showLossComedown();
            setLevelTwoComplete(false);
            setIsUnlockPaused(false);
            setIsPlaying(false);
            setIsNewRecord(currentScore > highScoreRef.current);
            setScoreSubmitted(false);
            setPlayerName("");
            setSubmittedName("");
            return;
          }
          if (item.type === "cop" || item.type === "pill" || item.type === "phone") {
            const matchedHazard = consecutiveHazardRef.current === item.type;
            consecutiveHazardRef.current = item.type;
            consecutiveHazardCountRef.current = matchedHazard ? consecutiveHazardCountRef.current + 1 : 1;
            if (item.type === "cop") policeBadgeHitsRef.current = consecutiveHazardCountRef.current;
            if (item.type === "pill") pillHitsRef.current = consecutiveHazardCountRef.current;
            if (item.type === "phone") phoneHitsRef.current = consecutiveHazardCountRef.current;
            if (consecutiveHazardCountRef.current >= 2) {
              consecutiveHazardRef.current = null;
              consecutiveHazardCountRef.current = 0;
              policeBadgeHitsRef.current = 0;
              pillHitsRef.current = 0;
              phoneHitsRef.current = 0;
              if (item.type === "cop") pauseForPoliceSeizure = true;
              if (item.type === "pill") pauseForPillOverload = true;
              if (item.type === "phone") {
                crowdHazardVariantRef.current = "phone";
                pauseForCrowdAnger = true;
              }
            }
          } else {
            consecutiveHazardRef.current = null;
            consecutiveHazardCountRef.current = 0;
          }
          if (item.type === "bottle" || item.type === "apple") {
            const hazardHitsRef = item.type === "bottle" ? bottleHitsRef : appleCoreHitsRef;
            hazardHitsRef.current += 1;
            if (hazardHitsRef.current >= 2) {
              // Two hits of the same thrown crowd hazard trigger the selector
              // warning; mixed bottles and cores do not prematurely fire it.
              bottleHitsRef.current = 0;
              appleCoreHitsRef.current = 0;
              crowdHazardVariantRef.current = "thrown";
              pauseForCrowdAnger = true;
            }
          }
        }
        continue;
      }

      if (newY > 105) {
        structureChanged = true;
        // Extended 25/50-record sessions remain fair: a missed record breaks
        // the combo, while only a caught hazard removes a life.
          if (item.type === "record" || item.type === "lion" || item.type === "cdj" || item.type === "mixer" || item.type === "turntable" || item.type === "adapter") {
          logMechanicsEvent(`entity=${item.type} collision=miss reaction=reset score=0 damage=0 lives=${currentLives} combo=1`);
          stageControllerRef.current?.onMiss();
          clearStageEventAfter(520);
          setStageEnergy(0);
          comboRef.current = 1;
          rewindAwardedRef.current = false;
          wheelItUpAwardedRef.current = false;
          if (mixerDamagedRef.current) {
            recoveryProgressRef.current = 0;
            setRecoveryProgress(0);
            }
            setCombo(1);
            if (levelRef.current === 1 && item.type === "record") {
              cleanDubplateStreakRef.current = 0;
              setCleanDubplateStreak(0);
              setHazardSinceStreakStart(false);
            }
          }
        consecutiveHazardRef.current = null;
        consecutiveHazardCountRef.current = 0;
        continue;
      }

      nextItems.push(movedItem);
    }

    if (bonusThresholdReached && currentLives === 4 && !bonusTriggeredRef.current) {
      bonusTriggeredRef.current = true;
      bonusEligibleRef.current = true;
      setIsBonusEligible(true);
      launchBonus = true;
    }
    itemsRef.current = nextItems;
    if (structureChanged) setVisibleItems([...nextItems]);
    if (launchCrowdPressure) {
      startLevelOneNoRequestBonus();
      return;
    }
    if (pauseAfterUnlock) {
      isPlayingRef.current = false;
      if (bgMusicRef.current) bgMusicRef.current.pause();
      setIsPlaying(false);
      setIsUnlockPaused(true);
      setUnlockRevealReady(false);
      setChainBreakComplete(false);
      window.clearTimeout(unlockRevealTimerRef.current);
      unlockRevealTimerRef.current = window.setTimeout(() => {
        setUnlockRevealReady(true);
      }, 3000);
      return;
    }
    if (completeLevelTwo) {
      isPlayingRef.current = false;
      stageControllerRef.current?.onLevelComplete();
      clearStageEventAfter(900);
      if (bgMusicRef.current) bgMusicRef.current.pause();
      setIsPlaying(false);
      setLevelTwoComplete(true);
      setGameOver(false);
      setIsUnlockPaused(false);
      setIsNewRecord(currentScore > highScoreRef.current);
      finaleRef.current = false;
      setFinale(false);
      startPitRun();
      return;
    }
    if (advanceToLevelTwo) {
      startLevelTwo();
      return;
    }
    if (launchBonus) {
      startNoRequestBonus();
      return;
    }
    const queuedSequences: ArcadeSequence[] = [
      ...(pauseForPoliceSeizure ? ["police" as const] : []),
      ...(pauseForCrowdAnger ? ["crowd" as const] : []),
      ...(pauseForPillOverload ? ["pill" as const] : []),
      ...(pauseForBohBonus ? ["boh" as const] : []),
      ...(pauseForRiddimBonus ? ["riddim" as const] : []),
      ...(pauseForWheelItUp ? ["wheel" as const] : []),
      ...(pauseForRewind ? ["rewind" as const] : []),
      ...(pauseForCrateBonus ? ["crate" as const] : []),
      ...(pauseForHeadphonesBonus ? ["headphones" as const] : []),
    ];
    const nextSequence = queuedSequences.shift();
    if (nextSequence) {
      pendingArcadeSequenceRef.current.push(...queuedSequences);
      startArcadeSequence(nextSequence);
      return;
    }
    if (isPlayingRef.current) queueGameFrame();
  };

  useEffect(() => {
    if (!sequenceDemoEnabled) return;
    pendingArcadeSequenceRef.current = ["wheel", "crate", "headphones", "pill", "crowd", "police", "boh", "riddim"];
    startArcadeSequence("rewind");
    return () => {
      pendingArcadeSequenceRef.current = [];
    };
  }, [sequenceDemoEnabled]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (bonusMusicRef.current) {
        bonusMusicRef.current.pause();
        bonusMusicRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
      window.clearTimeout(rewindPauseTimerRef.current);
      window.clearTimeout(wheelItUpPauseTimerRef.current);
      window.clearTimeout(policeSeizurePauseTimerRef.current);
      window.clearTimeout(crowdAngerPauseTimerRef.current);
      window.clearTimeout(crateBonusPauseTimerRef.current);
      window.clearTimeout(headphonesBonusPauseTimerRef.current);
      window.clearTimeout(levelTwoMusicTimerRef.current);
      window.clearTimeout(levelTwoMarqueeTimerRef.current);
      window.clearTimeout(mixerRepairTimerRef.current);
      window.clearTimeout(bonusSplashTimerRef.current);
      window.clearTimeout(bonusRewindTimerRef.current);
      window.clearTimeout(comboBurstTimerRef.current);
      window.clearTimeout(gunFingerShakeTimerRef.current);
      window.clearTimeout(pickupFlashTimerRef.current);
      window.clearTimeout(stageReactionTimerRef.current);
      window.clearTimeout(respectSplashTimerRef.current);
      window.clearTimeout(respectShakeTimerRef.current);
      window.clearTimeout(damageFeedbackTimerRef.current);
      window.clearTimeout(unlockRevealTimerRef.current);
      window.clearTimeout(recordTransitionTimerRef.current);
      pendingArcadeSequenceRef.current = [];
      if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    };
  }, []);

  const updateDjPositionFromClientX = (clientX: number) => {
    if (gameModeRef.current === "BONUS_CROWD_PRESSURE" || gameModeRef.current === "BONUS_LEVEL_2" || gameModeRef.current === "LEVEL_3_PIT_RUN") return;
    if (!isPlayingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPlayerWorldX(clientXToWorldX(clientX, rect.left, rect.width));
  };

  const inspectRealPointerEvent = (phase: RealPointerDiagnostics["phase"], e: React.PointerEvent<HTMLDivElement>) => {
    if (!realInputDebugEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const worldX = clientXToWorldX(e.clientX, rect.left, rect.width);
    const elementAtPointer = document.elementFromPoint(e.clientX, e.clientY);
    const domTarget = elementAtPointer
      ? `${elementAtPointer.tagName.toLowerCase()}${elementAtPointer.id ? `#${elementAtPointer.id}` : ""}${elementAtPointer.className ? `.${String(elementAtPointer.className).trim().replace(/\s+/g, ".")}` : ""}`
      : "none";
    const actualLeft = Number.parseFloat(djCatcherRef.current?.style.left ?? `${djXRef.current}`);
    setRealPointerDiagnostics({
      phase,
      pointerX: Number(e.clientX.toFixed(1)),
      localX: Number((e.clientX - rect.left).toFixed(1)),
      worldX: Number(worldX.toFixed(2)),
      playerTargetX: Number(djXRef.current.toFixed(2)),
      playerActualX: Number(actualLeft.toFixed(2)),
      captured: e.currentTarget.hasPointerCapture(e.pointerId),
      domTarget,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameModeRef.current === "BONUS_CROWD_PRESSURE" || gameModeRef.current === "BONUS_LEVEL_2" || gameModeRef.current === "LEVEL_3_PIT_RUN") return;
    if (e.pointerType === "touch") e.preventDefault();
    updateDjPositionFromClientX(e.clientX);
  };

  useEffect(() => {
    stageControllerRef.current?.setLevel(level);
  }, [level]);

  const raveBanter = level === 2
    ? recordsCaught >= 25
      ? "CROWD: ONE MORE? SCHEDULED FOR 1999."
      : combo >= 5
        ? "MC SAYS PULL IT UP. DJ SAYS: NOT YET."
        : "RAVE ETIQUETTE: MIND THE CABLES."
    : recordsCaught >= 20
      ? "DECKS IN. NEIGHBOURS OUT."
      : combo >= 5
        ? "CLEAN BLEND. NO REQUESTS TAKEN."
        : "BASS TOO LOUD? STAND CLOSER.";

  const bonusGearReady = bonusGear.length === BONUS_GEAR_TYPES.length;
  const afterPartyFloor = Math.max(0, Math.min(5, Math.floor(bonusProgress / 17)));
  const renderedStageSnapshot = stageReactionVerification && stageReactionVerification in stageReactions
    ? { ...stageSnapshot, energy: 1, reaction: stageReactionVerification }
    : stageSnapshot;

  return (
    <section id="minigame" className="minigame-section" aria-labelledby="minigame-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><Disc size={15} /> DUBPLATE AUTHENTICATION / 06</p>
          <h2 id="minigame-title">SELECTAH<br /><em>SHOWDOWN.</em></h2>
        </div>
          <p>Catch 25 heavy 5D dubplates to trigger the chained “Jersh In Case” release, then command a 50-record Level 2 crowd run and take the gear through Level 3 Pit Run. Missed records reset a streak and hazards remove hearts. Use A/D keys or pointer movement throughout; 15 clean Level 1 dubplates unlock Crowd Pressure behind the decks.</p>
      </div>

      <audio
        ref={bgMusicRef}
        src="/embedded-assets/5d-jungle-genesis-track_ff9d149a.mp3"
        loop
        preload="auto"
        playsInline
        aria-label="16-bit jungle background soundtrack"
      />
      <audio
        ref={bonusMusicRef}
        src="/embedded-assets/afterparty-runner-fast-breakbeat_0d617411.mp3"
        loop
        preload="auto"
        playsInline
        aria-label="Fast 16-bit after-party runner soundtrack"
      />
      <div className={`arcade-cabinet-bezel${isCabinetVibrating ? " is-impact-vibrating" : ""}${isGunFingerShaking ? " is-gun-finger-shaking" : ""}${isRespectShaking ? " is-respect-shaking" : ""}${damageFeedback ? " is-damage-shaking" : ""}${isCatchImpulsing ? " is-catch-impulsing" : ""}`}>
        <div className="cabinet-corner-bolts" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="arcade-marquee">
          <span className="marquee-light" />
          <span className="marquee-seal" aria-hidden="true">5D</span>
          <strong>5TH DIMENSION ARCADE</strong>
          <span className="marquee-transmission-meta">PIRATE SIGNAL / DUBPLATE TEST</span>
          <div className={`marquee-visualizer${musicStatus === "playing" ? " active" : ""}`} aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
          <span className="marquee-light" />
        </div>
        <div className="cabinet-service-plate" aria-hidden="true"><span>5D MODEL 95</span><b>INSERT 25¢</b></div>
        <div
          ref={containerRef}
          data-gameplay-state={gameplayState}
          className={`game-viewport${level === 2 ? " is-level-two" : ""}${isBonusSplashVisible || isBonusLevelActive || isBonusRewinding || isNoRequestBonusSplashVisible || isNoRequestBonusActive ? " is-bonus-scene" : ""}${hitboxDebugEnabled || mechanicsDebugEnabled ? " show-world-hitboxes" : ""}${mechanicsDebugEnabled ? " mechanics-debug-mode" : ""} stage-catch-variant-${catchReactionVariant}${renderedStageSnapshot.eventType ? ` stage-event-type-${renderedStageSnapshot.eventType}` : ""} stage-energy-${Math.max(0, Math.min(5, Math.ceil(renderedStageSnapshot.energy * 5)))}${renderedStageSnapshot.reaction ? ` stage-reaction-${renderedStageSnapshot.reaction.toLowerCase()}` : ""}${renderedStageSnapshot.event ? ` stage-event-${renderedStageSnapshot.event}` : ""}`}
          onPointerMove={(e) => {
            const usesAlternatePointerRoute = gameModeRef.current === "BONUS_CROWD_PRESSURE" || gameModeRef.current === "BONUS_LEVEL_2" || gameModeRef.current === "LEVEL_3_PIT_RUN";
            if (!usesAlternatePointerRoute) {
              if (playfieldPointerRef.current === e.pointerId) handlePointerMove(e);
              inspectRealPointerEvent("move", e);
              return;
            }
            if (e.pointerType === "touch") e.preventDefault();
            setBonusLaneFromClientX(e.clientX);
            inspectRealPointerEvent("move", e);
          }}
          onPointerDown={(e) => {
            const usesAlternatePointerRoute = gameModeRef.current === "BONUS_CROWD_PRESSURE" || gameModeRef.current === "BONUS_LEVEL_2" || gameModeRef.current === "LEVEL_3_PIT_RUN";
            const interactiveChild = e.target instanceof Element && Boolean(e.target.closest("button, a, input, textarea, select"));
            if (interactiveChild || (!usesAlternatePointerRoute && !isPlayingRef.current)) {
              inspectRealPointerEvent("down", e);
              return;
            }
            if (usesAlternatePointerRoute) {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setBonusLaneFromClientX(e.clientX);
              inspectRealPointerEvent("down", e);
              return;
            }
            e.preventDefault();
            playfieldPointerRef.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateDjPositionFromClientX(e.clientX);
            inspectRealPointerEvent("down", e);
          }}
          onPointerUp={(e) => {
            const usesAlternatePointerRoute = gameModeRef.current === "BONUS_CROWD_PRESSURE" || gameModeRef.current === "BONUS_LEVEL_2" || gameModeRef.current === "LEVEL_3_PIT_RUN";
            if (usesAlternatePointerRoute) {
              e.preventDefault();
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
              inspectRealPointerEvent("up", e);
              return;
            }
            if (playfieldPointerRef.current === e.pointerId) {
              updateDjPositionFromClientX(e.clientX);
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
              playfieldPointerRef.current = null;
            }
            inspectRealPointerEvent("up", e);
          }}
          onPointerCancel={(e) => {
            if (playfieldPointerRef.current === e.pointerId) {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
              playfieldPointerRef.current = null;
            }
            bonusPointerStartRef.current = null;
            bonusGestureHandledRef.current = false;
            inspectRealPointerEvent("cancel", e);
          }}
          onLostPointerCapture={(e) => {
            if (playfieldPointerRef.current === e.pointerId) playfieldPointerRef.current = null;
          }}
        >
        {damageFeedback && !gameOver && (
          <div className="damage-feedback" role="status" aria-live="assertive">
            <span>{damageFeedback.bonus ? "BONUS DAMAGE" : "HEART LOST"}</span>
            <strong>{damageFeedback.label}</strong>
            <em>{"♥".repeat(damageFeedback.lives)}{"♡".repeat(Math.max(0, damageFeedback.bonus ? 3 - damageFeedback.lives : 4 - damageFeedback.lives))}</em>
          </div>
        )}
        {rewardToRender && !gameOver && (
          <div className={`in-world-reward${rewardToRender.kind ? ` in-world-reward-${rewardToRender.kind}` : ""}`} role="status" aria-live="polite">
            <strong>{rewardToRender.label}</strong>
          </div>
        )}
        <div className={`game-grid-bg stage-background${level === 2 ? " level-two-grid-bg" : ""}`} aria-hidden="true">
          {level === 1 && (
            <div className="neon-backstreet-background">
              <i className="backstreet-rooftop rooftop-left" /><i className="backstreet-rooftop rooftop-centre" /><i className="backstreet-rooftop rooftop-right" />
              <i className="backstreet-distant-building distant-one" /><i className="backstreet-distant-building distant-two" /><i className="backstreet-distant-building distant-three" />
              <i className="backstreet-antenna antenna-one" /><i className="backstreet-antenna antenna-two" />
              <span className="backstreet-moon" />
            </div>
          )}
          {level === 2 && (
            <div className="crowd-pressure-background">
              <span className="club-ceiling-beam beam-one" /><span className="club-ceiling-beam beam-two" /><span className="club-ceiling-beam beam-three" />
              <span className="club-rear-wall" /><span className="club-distant-bar"><i /><i /><i /></span>
              <span className="club-reverse-entrance"><i /><b>5D</b><em>ALLEY</em></span>
            </div>
          )}
        </div>
        <div className="stage-midground" aria-hidden="true">
          {level === 1 && (
            <>
              <div className="backstreet-brick-facade facade-left"><i className="backstreet-window window-a" /><i className="backstreet-window window-b" /><span className="backstreet-graffiti">5D</span></div>
              <div className="backstreet-rear-archway"><i /><span>ALLEY</span><b /></div>
              <div className="backstreet-club-front"><span className="club-neon-sign">CLUB<br />5D</span><i className="club-door club-door-left" /><i className="club-door club-door-right" /><b className="club-awning" /></div>
              <div className="backstreet-record-shop"><span>RECORDS</span><i /><i /></div>
              <div className="backstreet-fire-escape"><i /><i /><i /><b /><b /></div>
              <div className="backstreet-pipe pipe-left" /><div className="backstreet-pipe pipe-right" />
              <div className="backstreet-dumpster dumpster-left"><i /></div><div className="backstreet-dumpster dumpster-right"><i /></div>
              <div className="backstreet-police-van"><b>POLICE</b><i /><i /></div>
              <div className="backstreet-security"><i /><b /></div><div className="backstreet-smoker"><i /><b /></div><div className="backstreet-shop-worker"><i /><b /></div><div className="backstreet-raver"><i /><b /></div>
              <span className="backstreet-poster poster-transmission">BASS<br />TRANS</span><span className="backstreet-poster poster-showdown">SHOW<br />DOWN</span><span className="backstreet-sticker sticker-five">5</span><span className="backstreet-sticker sticker-tape">TAPE</span>
            </>
          )}
          {level === 2 && (
            <>
              <div className="club-pillar club-pillar-left"><i /><b /></div><div className="club-pillar club-pillar-right"><i /><b /></div>
              <div className="club-speaker-wall"><i /><i /><i /><i /></div>
              <div className="club-poster-wall"><span>BASS<br />IN THE<br />CHEST</span><span>5D<br />DUBS</span><span>RAVE<br />LIFE</span></div>
              <div className="club-crowd-mid crowd-left"><i /><i /><i /><i /></div><div className="club-crowd-mid crowd-right"><i /><i /><i /><i /></div>
              <div className="club-mc"><i /><b /></div><div className="club-security-inside"><i /><b /></div>
            </>
          )}
        </div>
        <div className="stage-game-plane" aria-hidden="true">
          {level === 1 && <><i className="alley-puddle puddle-left" /><i className="alley-puddle puddle-right" /><b className="alley-drain" /><span className="alley-flyer flyer-a">DUB</span><span className="alley-flyer flyer-b">5D</span><span className="alley-debris debris-a" /><span className="alley-debris debris-b" /></>}
          {level === 2 && <><i className="club-booth-floor" /><i className="club-booth-cable cable-left" /><i className="club-booth-cable cable-right" /><span className="club-record-crate">5D<br />DUBS</span><span className="club-monitor monitor-left" /><span className="club-monitor monitor-right" /><span className="club-cup cup-left" /><span className="club-cup cup-right" /></>}
        </div>
        <div className="stage-reactive" aria-hidden="true">
          <span className="stage-sign stage-sign-left" /><span className="stage-sign stage-sign-right" />
          {level === 1 && <><span className="backstreet-hanging-sign">NO<br />REQUESTS</span><span className="backstreet-steam steam-left" /><span className="backstreet-steam steam-right" /><span className="backstreet-searchlight" /><span className="backstreet-npc npc-left" /><span className="backstreet-npc npc-right" /></>}
          {level === 2 && <><span className="club-light-rig"><i /><i /><i /></span><span className="club-laser laser-left" /><span className="club-laser laser-right" /><span className="club-smoke smoke-left" /><span className="club-smoke smoke-right" /><span className="club-banner">5D<br />CLUB</span><span className="club-equipment-leds"><i /><i /><i /><i /></span></>}
          <img className="stage-edge-speaker" src="/embedded-assets/selectah-speaker-stack-urban_9fd16c27.png" alt="" />
          <img className="stage-npc-reaction" src={CELEBRATION_DANCERS[1].src} alt="" />
          <i className="stage-flyer stage-flyer-one" /><i className="stage-flyer stage-flyer-two" /><i className="stage-flyer stage-flyer-three" />
        </div>
        <div className="stage-foreground" aria-hidden="true">
          {level === 1 && <><i className="foreground-railing" /><i className="foreground-cable cable-a" /><i className="foreground-cable cable-b" /><span className="foreground-speaker-edge" /><span className="foreground-bin" /><span className="foreground-tag">5D</span></>}
          {level === 2 && <><i className="club-booth-edge" /><i className="club-foreground-deck deck-left" /><i className="club-foreground-deck deck-right" /><span className="club-foreground-mixer"><i /><i /><i /></span><span className="club-foreground-fader" /><span className="club-crowd-hands hands-left" /><span className="club-crowd-hands hands-right" /></>}
        </div>
        {impactFx && (
          <div
            key={impactFx.key}
            className={`game-impact-fx game-impact-${impactFx.kind}${mechanicsDebugEnabled ? " mechanics-debug-collision-flash" : ""}`}
            style={{ left: `${impactFx.x}%`, top: `${impactFx.y}%` }}
            aria-hidden="true"
          />
        )}
        <div className={`rave-world-dressing${level === 2 ? " level-two-rave-world" : ""}`} aria-hidden="true">
          <span className="rave-glowstick rave-glowstick-one" /><span className="rave-glowstick rave-glowstick-two" /><span className="rave-glowstick rave-glowstick-three" />
        </div>
        <div className="game-hud game-hud-clear">
          <div className="hud-badge"><Disc size={15} /> SCORE: <strong>{score}</strong></div>
          <div className="hud-badge level-hud"><span aria-hidden="true">LVL</span> <strong>{level}</strong></div>
          <div className="hud-badge records-hud"><Disc size={15} /> RECORDS: <strong>{recordsCaught}/{level === 2 ? LEVEL_TWO_REQUIRED_RECORDS : REQUIRED_RECORDS}</strong></div>
          <div className="hud-badge combo-badge" aria-label={`Combo multiplier: ${combo}x`}>COMBO: <strong>{combo}x</strong></div>
          <div className="hud-badge high-score-badge"><Trophy size={15} /> HIGH: <strong>{highScore}</strong></div>
          <div className="pickup-flash-slot" aria-live="polite" aria-atomic="true">
            {pickupFlash && <span key={pickupFlash.key}>{pickupFlash.label}</span>}
          </div>
          <div className="hud-badge lives-badge">LIVES: <strong>{"❤️".repeat(lives)}</strong></div>
          <button
            type="button"
            className="hud-badge audio-toggle"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute game sounds" : "Enable game sounds"}
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {soundEnabled ? (musicStatus === "playing" ? "MUSIC ON" : "PLAY MUSIC") : "MUTED"}
          </button>
        </div>

        {isLevelTwoTransitioning && level === 2 && !gameOver && (
          <div className="game-overlay level-two-arrival-overlay" role="status" aria-live="assertive">
            <div className="level-two-arrival-grid" aria-hidden="true" />
            <div className="level-two-arrival-copy">
              <span>LEVEL 2 / LIVE RAVE TRANSMISSION</span>
              <strong>CROWD PRESSURE<br />BONUS!</strong>
              <em>50 DUBPLATES TO HOLD THE DANCE</em>
              <i>THE CROWD IS READY. RUN THE NEXT PLATE.</i>
            </div>
          </div>
        )}

        {level === 2 && !gameOver && !isLevelTwoTransitioning && (
          <div className="level-two-hype-meter level-two-hype-meter-in-world" aria-label={`Crowd hype: ${recordsCaught} of ${LEVEL_TWO_REQUIRED_RECORDS}`}>
            <div className="hype-meter-label"><span>CROWD HYPE</span><strong>{recordsCaught}/{LEVEL_TWO_REQUIRED_RECORDS}</strong></div>
            <div className="hype-meter-track" aria-hidden="true"><i style={{ width: `${Math.min(100, (recordsCaught / LEVEL_TWO_REQUIRED_RECORDS) * 100)}%` }} /></div>
            <small>BUILD THE RAVE FLOOR</small>
          </div>
        )}

        {isLevelTwoMarqueeVisible && level === 2 && !gameOver && (
          <div className="level-two-transition-marquee" role="status" aria-live="polite">
            <span>LEVEL 2</span>
            <strong>CROWD PRESSURE BONUS!</strong>
            <i aria-hidden="true">◆ SOUND SYSTEM ◆</i>
          </div>
        )}

        {isRespectSplashVisible && (
          <div className="game-overlay respect-splash-overlay" role="status" aria-live="assertive">
            <div className="respect-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} className={`respect-ray respect-ray-${index % 5}`} />)}</div>
            <div className="respect-fist-bump" aria-hidden="true"><span className="respect-fist respect-fist-left"><i /></span><b className="respect-impact">!</b><span className="respect-fist respect-fist-right"><i /></span></div>
            <div className="respect-selector-tag"><span>BIG UP</span><strong>{submittedName || playerName || "NEW SELECTOR"}</strong></div>
            <div className="respect-splash-copy"><span>5D FAMILY CHECK-IN</span><strong>RESPEKT!</strong><em>BIG UP FOR FOLLOWING THE SIGNAL</em></div>
          </div>
        )}

        {supporterGateRequired && (
          <div className="game-overlay supporter-gate-overlay">
            <div className="overlay-box supporter-gate-box">
              <div className="unlock-overlay-kicker"><Disc size={16} /> SHARED SIGNAL DETECTED</div>
              <h3>SUPPORT 5D</h3>
              <p>Visit the 5th Dimension Music Facebook page, tap Like in Facebook, then return here. This browser will remember your confirmation for future sessions.</p>
              <a className="supporter-facebook-link" href="https://www.facebook.com/share/19GAjvp42m/" target="_blank" rel="noreferrer">OPEN FACEBOOK PAGE</a>
              <button type="button" className="tape-play-button supporter-confirm-button" onClick={onSupporterConfirmed}>
                <span className="tape-play-face" aria-hidden="true"><i className="tape-reel tape-reel-left" /><span className="tape-window"><Check size={15} /></span><i className="tape-reel tape-reel-right" /></span>
                <span className="tape-play-copy">I’VE SUPPORTED 5D — UNLOCK GAME</span>
              </button>
              <small>Facebook does not provide this site with visitor-level Like verification; this is an honor-based supporter confirmation.</small>
            </div>
          </div>
        )}

        {!supporterGateRequired && !isPlaying && !gameOver && !activeArcadeSequence && !isRecordTransitioning && !isUnlockPaused && !isRewindPaused && !isWheelItUpPaused && !isPoliceSeizurePaused && !isCrowdAngerPaused && !isPillOverloadPaused && !isCrateBonusPaused && !isHeadphonesBonusPaused && !isBonusSplashVisible && !isBonusLevelActive && !isBonusRewinding && !preLevelTwoHighScore && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h3>5D TURNTABLE CHALLENGE</h3>
              <div className="arcade-instruction-brief">
                {level === 2 ? <><span>LEVEL 2 / INSIDE 5D CLUB</span><p>Collect 50 dubplates to complete the club chapter. Bottles and apple cores join the sirens, pills, and phones as hazards. Keep the booth alive to earn its skilled-play bonus, then take the recovered kit into Pit Run.</p><small>Mixers, turntables, adapters, CDJs, and the Lion of Judah add value. Three mixers or three decks trigger bonus scenes.</small></> : level === 3 ? <><span>LEVEL 3 / PIT RUN</span><p>Move left or right through the approaching city, recover every critical sound-system item, and avoid street chaos.</p><small>The afterparty only opens when the full kit is secured.</small></> : <><span>LEVEL 1 / DUBPLATE TEST</span><p>Collect 25 dubplates. The release stays locked until the chain lands and breaks. Missed dubplates reset a streak; sirens, pills, and phones remove hearts.</p><small>Six clean catches deploy the sub, 12 shakes the set, 18 rewinds with dancers, and 15 clean dubplates unlock Crowd Pressure behind the decks.</small></>}
              </div>
              <button type="button" className="tape-play-button" onClick={startGame}>
                <span className="tape-play-face" aria-hidden="true">
                  <i className="tape-reel tape-reel-left" />
                  <span className="tape-window"><Play size={16} fill="currentColor" /></span>
                  <i className="tape-reel tape-reel-right" />
                </span>
                <span className="tape-play-copy">Start Session</span>
              </button>
              <div className="arcade-start-leaderboard" aria-label="Public arcade high scores">
                <span>LIVE PUBLIC BOARD</span>
                {sharedLeaderboardQuery.isLoading ? (
                  <p>LOADING SCORES…</p>
                ) : leaderboard.length ? (
                  <ol>
                    {leaderboard.slice(0, 3).map((entry, index) => <li key={entry.id}><b>#{index + 1}</b><strong>{entry.hasBonusCrown && <span className="bonus-crown" aria-label="After-party crown earned">♛</span>}{entry.playerTag}</strong><em>{entry.score}</em></li>)}
                  </ol>
                ) : (
                  <p>NO SCORES TRANSMITTED YET</p>
                )}
              </div>
              <PickupLegend level={level} />
            </div>
          </div>
        )}

        {isNoRequestBonusSplashVisible && (
          <div className="game-overlay crowd-pressure-splash-overlay" role="status" aria-live="assertive">
            <div className="crowd-pressure-splash-crowd" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="crowd-pressure-splash-copy"><span>15 CLEAN DUBPLATES / BEHIND THE DECKS</span><strong>CROWD<br />PRESSURE!</strong><em>BLOCK THE MESS BEFORE IT HITS YOUR MIXER.</em></div>
          </div>
        )}

        {isNoRequestBonusActive && (
          <div className={`crowd-pressure-bonus-stage crowd-reaction-${crowdReaction ?? "idle"}`} role="application" aria-label="Crowd Pressure. Move the DJ hand left and right across the decks to block cigarettes, beer, spit, and bottles before they hit the equipment.">
            <div className="crowd-pressure-club-depth" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="crowd-pressure-archetypes" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="crowd-pressure-light-rig" aria-hidden="true"><i /><i /><i /></div>
            <div className="crowd-pressure-booth" aria-hidden="true"><i className="booth-cdj booth-cdj-left" /><i className="booth-cdj booth-cdj-right" /><i className="booth-turntable" /><i className="booth-mixer" /><i className="booth-headphones" /><i className="booth-mic" /><i className="booth-cable" /><i className="booth-drink" /><i className="booth-sleeve" /></div>
            <div className="crowd-pressure-hud"><strong>CROWD PRESSURE</strong><span>HOLD THE BOOTH {Math.round(noRequestBonusProgress)}%</span><em>BLOCKS {crowdPressureBlocks} · A / D OR DRAG</em></div>
            <div ref={crowdHandRef} className="crowd-pressure-hand" style={{ left: `${crowdHandX}%` }} aria-label="DJ hand controlled across the decks"><i /><b /></div>
            <div className="crowd-pressure-hazard-layer" aria-hidden="true">
              {noRequestBonusObstacles.map((entity) => <span key={entity.id} className={`no-request-entity ${entity.type}`} style={{ "--no-request-depth": `${entity.depth}%`, "--crowd-hazard-x": `${entity.x}%` } as React.CSSProperties}><i /></span>)}
            </div>
          </div>
        )}

        {isBonusSplashVisible && (
          <div className="game-overlay afterparty-splash-overlay" role="status" aria-live="assertive">
            <div className="afterparty-splash-city" aria-hidden="true" />
            <div className="afterparty-splash-copy">
              <span>LEVEL 2 / 20 DUBPLATES / ZERO HITS</span>
              <strong>AFTER PARTY<br />GEAR DASH!</strong>
              <em>GET EVERY PIECE OF GEAR TO THE GLOWING DOOR.</em>
            </div>
            <div className="runner-control-visual" aria-label="Bonus controls: use the same left and right movement controls as Selectah Showdown">
              <span>A / D OR ARROWS</span><b>MOVE LANES</b><span>DRAG OR TAP A LANE</span>
            </div>
          </div>
        )}

        {isBonusLevelActive && (
          <div className={`bonus-level-stage afterparty-runner-stage party-floor-${afterPartyFloor}${bonusDoorOpen ? " gear-complete" : ""}`} role="application" aria-label="After Party Gear Dash. Auto-run down the city road, steer left or right, collect all six DJ gear pieces, and avoid carts, cans, rocks, and rats.">
            <div className="afterparty-night-sky" aria-hidden="true" />
            <div className="afterparty-cityline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="afterparty-road" aria-hidden="true"><span /><span /><span /><b /><b /></div>
            <div className="afterparty-distant-building" aria-hidden="true"><i className="afterparty-venue-art" /><b className="afterparty-door"><em>AFTER</em><span>PARTY</span><small>♫</small></b></div>
            <div className="bonus-hud afterparty-hud"><span>AFTER PARTY GEAR DASH</span><strong>DISTANCE {Math.round(bonusProgress)}%</strong><b>GEAR {bonusGear.length}/6</b></div>
            <div className="afterparty-gear-list" aria-label="Required DJ gear">
              {BONUS_GEAR_TYPES.map((gear) => <span key={gear} className={bonusGear.includes(gear) ? "collected" : ""}>{gear === "headphones" ? "HP" : gear === "turntable" ? "TT" : gear === "mic" ? "MIC" : gear === "speaker" ? "SPK" : gear === "mixer" ? "MIX" : "CDJ"}</span>)}
            </div>
            <div className="bonus-tip">AUTO RUN · A / D OR ARROWS STEER · DRAG OR TAP A ROAD LANE · ONE HIT ENDS THE DASH</div>
            <div className={`bonus-dj-runner afterparty-dj-runner lane-${bonusLane}${bonusDoorOpen ? " is-exit-lit" : ""}`}>
              <img src="/embedded-assets/selector-dj-rear-runner-transparent_35d3ab26.png" alt="Rear-view jungle DJ running toward the after party" />
            </div>
            <div className="bonus-obstacle-layer afterparty-entity-layer" aria-hidden="true">
              {bonusObstacles.map((entity) => <span key={entity.id} className={`bonus-obstacle afterparty-entity ${entity.type} lane-${entity.lane}`} data-entity={entity.type} style={{ "--runner-depth": `${entity.depth}%` } as React.CSSProperties}><i className="urban-runner-asset" style={{ "--urban-runner-url": `url(${URBAN_RUNNER_ASSETS[entity.type]})` } as React.CSSProperties} /><b>{entity.type === "headphones" ? "HP" : entity.type === "turntable" ? "TT" : entity.type === "speaker" ? "SPK" : entity.type === "mixer" ? "MIX" : entity.type === "cart" ? "CART" : entity.type.toUpperCase()}</b></span>)}
            </div>
            {bonusGearReady && <div className="afterparty-door-ready" role="status">ALL GEAR SECURED — RUN FOR THE DOOR</div>}
          </div>
        )}

        {isPitRunActive && (
          <div className="pit-run-stage" role="application" aria-label="Level 3 Pit Run. Move left or right, recover all six critical sound-system items, and avoid the approaching street hazards.">
            <div className="pit-run-skyline" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="pit-run-zone-sign" aria-hidden="true"><span>{pitRunProgress < 22 ? "SERVICE ALLEY" : pitRunProgress < 44 ? "GRIMY STREET" : pitRunProgress < 66 ? "UNDERPASS" : pitRunProgress < 83 ? "WAREHOUSE DISTRICT" : "AFTERPARTY APPROACH"}</span></div>
            <div className="pit-run-road" aria-hidden="true"><i /><i /><i /><b /><b /></div>
            <div className="pit-run-foreground" aria-hidden="true"><i /><i /><i /></div>
            <div className="pit-run-hud"><strong>LEVEL 3 · PIT RUN</strong><span>DISTANCE {Math.round(pitRunProgress)}%</span><em>HITS {pitRunHits} · A / D OR DRAG</em></div>
            <div className="pit-run-inventory" aria-label="Critical gear recovery inventory">
              {PIT_REQUIRED_GEAR.map((gear) => <span key={gear} className={pitRunInventory.includes(gear) ? "secured" : "missing"}>{gear === "turntable" ? "TT" : gear === "headphones" ? "HP" : gear === "crate" ? "CRT" : gear.toUpperCase()}</span>)}
            </div>
            <div className={`pit-runner lane-${pitRunLane}`}><img src="/embedded-assets/selector-dj-rear-runner-transparent_35d3ab26.png" alt="Rear-view jungle DJ moving through the pit run" /></div>
            <div className="pit-run-entity-layer" aria-hidden="true">
              {pitRunEntities.map((entity) => <span key={entity.id} className={`pit-run-entity ${entity.type} lane-${entity.lane}`} style={{ "--pit-depth": `${entity.depth}%` } as React.CSSProperties}><i /><b>{(PIT_REQUIRED_GEAR as readonly string[]).includes(entity.type) ? entity.type === "crate" ? "CRT" : entity.type === "turntable" ? "TT" : entity.type === "headphones" ? "HP" : entity.type.toUpperCase() : "!"}</b></span>)}
            </div>
          </div>
        )}

        {isAfterpartyUnlocked && !isPitRunActive && (
          <div className="afterparty-placeholder-stage" role="status" aria-live="polite">
            <div className="afterparty-placeholder-door" aria-hidden="true"><i /><b>AFTER<br />PARTY</b></div>
            <div className="afterparty-placeholder-copy"><span>SOUND SYSTEM DELIVERED</span><strong>ROCK THE JAM</strong><em>{pitRunInventory.map((gear) => gear === "turntable" ? "TT" : gear === "headphones" ? "HP" : gear === "crate" ? "CRT" : gear.toUpperCase()).join(" · ")}</em></div>
          </div>
        )}

        {isBonusRewinding && (
          <div className="game-overlay bonus-rewind-overlay" role="status" aria-live="assertive">
            <div className="bonus-rewind-disc" aria-hidden="true"><i /></div>
            <div><span>{bonusCompletedRef.current ? "AFTER PARTY REACHED / PURPLE CAMO + CROWN EARNED" : "GEAR DASH ENDED"}</span><strong>{bonusCompletedRef.current ? "PARTY INSIDE" : "BACK TO THE RAVE"}</strong><em>LEVEL 2 CROWD PRESSURE RESUMING</em></div>
          </div>
        )}

        {activeArcadeSequence === "rewind" && !gameOver && (
          <div className="game-overlay rewind-reward-overlay" role="status" aria-live="assertive">
            <div className="rewind-time-tunnel" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
            <div className="rewind-record-splash" aria-hidden="true">
              <span className="rewind-record-ring" />
              <span className="rewind-record-label">5D</span>
            </div>
            <div className="rewind-dancer-flank" aria-hidden="true">
              {CELEBRATION_DANCERS.map((dancer) => <img key={`rewind-${dancer.className}`} className={`rewind-dancer ${dancer.className}`} src={dancer.src} alt="" />)}
            </div>
            <div className="rewind-graffiti-copy">
              <span className="rewind-kicker">18× COMBO / +5 PTS</span>
              <strong>REWIND ACHIEVED</strong>
              <em>BOH MY SELECTAH!</em>
            </div>
            {Array.from({ length: 10 }, (_, index) => <i key={index} className={`rewind-splash-drip rewind-drip-${index % 5}`} aria-hidden="true" />)}
          </div>
        )}

        {activeArcadeSequence === "crate" && !gameOver && (
          <div className="game-overlay crate-bonus-overlay" role="status" aria-live="assertive">
            <div className="crate-stack" aria-hidden="true"><span className="crate-record crate-record-one" /><span className="crate-record crate-record-two" /><span className="crate-record crate-record-three" /><i>5D<br />DUBS</i></div>
            <div className="pickup-bonus-copy"><span>3 MIXERS COLLECTED</span><strong>RECORD CRATE<br />BONUS!</strong><em>A DJ ACCIDENTALLY PUT HIS RECORDS<br />IN YOUR CRATE!</em></div>
          </div>
        )}

        {activeArcadeSequence === "headphones" && !gameOver && (
          <div className="game-overlay headphones-bonus-overlay" role="status" aria-live="assertive">
            <div className="rave-headphones" aria-hidden="true"><i /><b /><em /></div>
            <div className="pickup-bonus-copy"><span>3 TURNTABLES COLLECTED</span><strong>HEADPHONES<br />READY!</strong><em>YOU REMEMBERED TO BRING YOUR<br />HEADPHONES TO THE RAVE!</em></div>
          </div>
        )}

        {activeArcadeSequence === "wheel" && !gameOver && (
          <div className="game-overlay wheel-it-up-overlay" role="status" aria-live="assertive">
            <div className="wheel-turntable" aria-hidden="true">
              <span className="wheel-vinyl" />
              <span className="wheel-center-label">5D</span>
              <i className="wheel-tonearm" />
            </div>
            <div className="wheel-copy">
              <span>20× COMBO / +10 PTS</span>
              <strong>WHEEL IT UP!</strong>
              <b>REWIND ACHIEVED</b>
              <em>SELECTOR RUN THE TRACK BACK</em>
            </div>
            {Array.from({ length: 14 }, (_, index) => <i key={index} className={`wheel-ray wheel-ray-${index % 7}`} aria-hidden="true" />)}
          </div>
        )}

        {activeArcadeSequence === "police" && !gameOver && (
          <div className="game-overlay hazard-splash police-seizure-overlay" role="status" aria-live="assertive">
            <div className="police-seizure-grid" aria-hidden="true" />
            <div className="sega-police-car" aria-hidden="true">
              <span className="cop-car-lightbar"><i /><i /></span>
              <span className="cop-car-roof" />
              <span className="cop-car-body"><b>POLICE</b></span>
              <span className="cop-car-wheel cop-car-wheel-left" />
              <span className="cop-car-wheel cop-car-wheel-right" />
            </div>
            <div className="police-dj-reaction" aria-hidden="true">
              <img src="/embedded-assets/5d-selector-jungle-dj-sprite_502781f7.png" alt="" />
            </div>
            <div className="police-recovery-prompt" aria-hidden="true">
              <strong>RECOVERY COMBO</strong>
              <span>CATCH 3 DUBPLATES — TAKE BACK THE SET</span>
            </div>
            <div className="police-seizure-copy">
              <span>BADGE PATROL / 2 HITS</span>
              <strong>COPS SEIZED<br />YOUR MIXER.</strong>
              <em>5-0 IN THE BUILDING. THEY TOOK YOUR DECKS. YOU'RE NOW A HUMAN SPOTIFY PLAYLIST.</em>
            </div>
            {Array.from({ length: 8 }, (_, index) => <i key={index} className={`police-seizure-flash flash-${index % 4}`} aria-hidden="true" />)}
          </div>
        )}

        {activeArcadeSequence === "crowd" && !gameOver && (
          <div className="game-overlay hazard-splash crowd-anger-overlay" role="status" aria-live="assertive">
            <div className="empty-club-room" aria-hidden="true">
              <span className="empty-club-light empty-club-light-left" /><span className="empty-club-light empty-club-light-right" />
              <span className="empty-club-speaker empty-club-speaker-left" /><span className="empty-club-speaker empty-club-speaker-right" />
              <span className="empty-club-dj"><img src="/embedded-assets/5d-selector-jungle-dj-sprite_502781f7.png" alt="" /></span>
              <span className="empty-club-door door-one" /><span className="empty-club-door door-two" /><span className="empty-club-tumbleweed" />
            </div>
            <div className={`crowd-anger-copy${crowdHazardVariantRef.current === "thrown" ? " is-thrown-tune" : " is-wrong-tune"}`}>
              {crowdHazardVariantRef.current === "thrown" ? <><span>THROWN TUNE / 2 HITS</span><strong>THROWN<br />TUNE</strong><em>BOTTLE TO THE FACE. SELECTOR DOWN! 🍾</em></> : <><span>WRONG TUNE / 2 HITS</span><strong>WRONG TUNE<br />MY SELECTAH</strong><em>BOOOO. YOU PLAYED 'WONDERWALL' AT A JUNGLE RAVE. CROWD HAS LEFT THE CHAT.</em></>}
            </div>
            {Array.from({ length: 7 }, (_, index) => <i key={index} className={`crowd-exit-arrow exit-arrow-${index % 4}`} aria-hidden="true">EXIT</i>)}
          </div>
        )}

        {activeArcadeSequence === "pill" && !gameOver && (
          <div className="game-overlay hazard-splash pill-overload-overlay" role="status" aria-live="assertive">
            <div className="pill-trip-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} className={`pill-trip-ray pill-trip-ray-${index % 6}`} />)}</div>
            <div className="dopey-dj-portrait" aria-hidden="true"><img src="/embedded-assets/5d-selector-jungle-dj-sprite_502781f7.png" alt="" /><span className="dopey-pupil pupil-left" /><span className="dopey-pupil pupil-right" /><span className="dopey-smile"><i /><i /><i /></span></div>
            <div className="pill-pitch-wobble" aria-hidden="true"><i>PITCH</i><b>WOBBLE</b><i>PITCH</i></div>
            <div className="pill-overload-copy"><span>PILL PRESSURE / 2 CONSECUTIVE HITS / PITCH WOBBLE</span><strong>TOO HIGH<br />TO PLAY!</strong><em>BRUV. YOU ATE THE PILL. THE RIDDIM IS LITERALLY MELTING. 🫠</em></div>
            <div className="pill-floaters" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} className={`pill-floater pill-floater-${index % 4}`} />)}</div>
          </div>
        )}

        {activeArcadeSequence === "boh" && !gameOver && (
          <div className="game-overlay selector-salute-overlay" role="status" aria-live="assertive">
            <div className="selector-salute-record" aria-hidden="true"><i /><b>5D</b></div>
            <div className="selector-salute-copy"><span>5 DUBPLATES / +250</span><strong>BOH!<br />BOH!<br />BIG UP</strong><em>THE SPEAKERS HEARD THAT ONE.</em></div>
          </div>
        )}

        {activeArcadeSequence === "riddim" && !gameOver && (
          <div className="game-overlay run-riddim-overlay" role="status" aria-live="assertive">
            <div className="riddim-speaker-stack" aria-hidden="true"><i /><i /><i /><b /></div>
            <div className="run-riddim-copy"><span>LEVEL 2 / 15 DUBPLATES / +500</span><strong>RUN THE<br />RIDDIM!</strong><em>THE DANCEFLOOR IS LOCKED IN.</em></div>
          </div>
        )}

        {isRecordTransitioning && !gameOver && (
          <div className={`game-overlay record-spin-transition${viewportVerificationMode === "dissolve" ? " viewport-verify-hold" : ""}`} role="status" aria-live="polite">
            <div className="transition-spinfield" aria-hidden="true" />
            <div className="transition-iris transition-iris-outer" aria-hidden="true" />
            <div className="transition-iris transition-iris-inner" aria-hidden="true" />
            <div className="transition-vinyl" aria-hidden="true"><i /><b>5D</b></div>
            <span className="transition-caption">SPIN DISSOLVE / BACK TO THE SET</span>
          </div>
        )}

        {isUnlockPaused && !gameOver && (
          <div className="game-overlay unlock-overlay is-celebrating">
            <div className="unlock-celebration-layer" aria-hidden="true">
              <div className="celebration-dancers front-layer-dancers">
                <img className="celebration-dancer dancer-lime" src={CELEBRATION_DANCERS[0].src} alt="" />
                <img className="celebration-dancer dancer-cyan" src={CELEBRATION_DANCERS[1].src} alt="" />
                <img className="celebration-dancer dancer-magenta" src={CELEBRATION_DANCERS[2].src} alt="" />
              </div>
              <div className="confetti-burst-layer">
                {Array.from({ length: 18 }, (_, index) => (
                  <i key={index} className={`confetti-particle confetti-${index % 5}`} />
                ))}
              </div>
              {unlockRevealReady && !chainBreakComplete && (
                <>
                  <div className="unlock-destination-flash" aria-hidden="true"><i /><b /></div>
                  <div className="chain-link-debris" aria-hidden="true">
                    {Array.from({ length: 10 }, (_, index) => <i key={index} className={`chain-link-fragment chain-fragment-${index}`} />)}
                  </div>
                </>
              )}
            </div>
            <div className="overlay-box unlock-overlay-box">
              <div className="unlock-overlay-kicker"><Disc size={16} /> DOWNLOAD UNLOCKED</div>
              <h3>LEVEL CLEARED</h3>
              {!unlockRevealReady ? (
                <div className="unlock-waiting-message" role="status" aria-live="polite">
                  <div className="unlock-waiting-spinner" />
                  <span>TRANSMITTING DUBPLATE VIBES...</span>
                </div>
              ) : (
                <>
                  <div className="unlock-download-drop" role="status" aria-live="polite">
                    <div className="achievement-chain-wrap" aria-hidden="true">
                      {/* 5D style: an oversized silver arcade chain bars the full release title until the unlock Press Start 2P. */}
                      <span className="chain-run chain-run-text">
                        {Array.from({ length: 12 }, (_, index) => <i key={index} className="chain-link" />)}
                      </span>
                      <span className="chain-padlock" />
                    </div>
                    <span className="unlock-download-drop-label">FREE DOWNLOAD UNLOCKED</span>
                    <strong>JERSH IN CASE</strong>
                    <span>THE SIGNAL IS YOURS — 25 DUBPLATES CAUGHT.</span>
                  </div>
                  {isBonusEligible && <div className="green-camo-award" role="status"><strong>NO REQUEST BONUS</strong><span>GREEN CAMO EQUIPPED FOR LEVEL 2</span></div>}
                  {chainBreakComplete ? (
                    <>
                      <div className="unlock-decision-actions">
                        <button type="button" className="tape-play-button" onClick={startGame}>
                          <span className="tape-play-face" aria-hidden="true">
                            <i className="tape-reel tape-reel-left" />
                            <span className="tape-window"><RotateCcw size={15} /></span>
                            <i className="tape-reel tape-reel-right" />
                          </span>
                          <span className="tape-play-copy">Reset Game</span>
                        </button>
                        <button type="button" className="tape-play-button keep-playing-button" onClick={keepPlayingAfterUnlock}>
                          <span className="tape-play-face" aria-hidden="true">
                            <i className="tape-reel tape-reel-left" />
                            <span className="tape-window"><Play size={15} fill="currentColor" /></span>
                            <i className="tape-reel tape-reel-right" />
                          </span>
                          <span className="tape-play-copy">Keep Playing</span>
                        </button>
                      </div>
                      <p>{isBonusEligible ? "Clean run detected: Keep Playing launches the No Request Bonus dawn-door rush before Level 2." : "You caught all 25 dubplates. The free “Jersh In Case” download is live. Choose whether to reset the session or keep scratching for a higher score."}</p>
                    </>
                  ) : <span className="chain-break-visual-only" aria-label="Achievement chain is breaking" />}
                </>
              )}
            </div>
          </div>
        )}

        {preLevelTwoHighScore && !gameOver && (
          <div className="game-overlay pre-level-two-overlay">
            <div className="overlay-box game-over-box-wide pre-level-two-score-box">
              <h3>LEVEL 1 HIGH SCORE</h3>
              <button type="button" className="tape-play-button reset-first-action" onClick={startGame}>
                <span className="tape-play-face" aria-hidden="true"><i className="tape-reel tape-reel-left" /><span className="tape-window"><RotateCcw size={15} /></span><i className="tape-reel tape-reel-right" /></span>
                <span className="tape-play-copy">PLAY AGAIN / RESET</span>
              </button>
              <div className="arcade-quick-controls" aria-label="Arcade controls"><span>A / D</span> MOVE <i>•</i> <span>SPACE</span> JUMP</div>
              <p>Enter a selector tag now to carry it straight into the Level 2 terminal. Leave it blank to choose a tag after Level 2 instead.</p>
              {!scoreSubmitted ? (
                <form className="score-entry-form" onSubmit={submitPreLevelTwoScore}>
                  <label htmlFor="pre-level-selector-name">SELECTOR TAG (OPTIONAL)</label>
                  <div className="score-entry-row">
                    <input
                      id="pre-level-selector-name"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value.toUpperCase().slice(0, 12))}
                      maxLength={12}
                      autoComplete="nickname"
                      placeholder="YOUR NAME"
                    />
                    <button type="submit" className="score-submit-button">LAUNCH LVL 2</button>
                  </div>
                </form>
              ) : (
                <div className="score-saved-badge" role="status" aria-live="polite">
                  <Trophy size={15} /> {sharedScoreStatus === "transmitting" ? "TRANSMITTING" : sharedScoreStatus === "failed" ? "TRANSMISSION FAILED — REPLAY TO RETRY" : "TAG SAVED TO THE PUBLIC BOARD AS"} <strong>{submittedName}</strong>
                </div>
              )}
              <div className="arcade-leaderboard-container">
                <h4>TOP ARCADE SELECTORS</h4>
                <div className="arcade-table-wrap">
                  <table className="arcade-score-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>SELECTOR</th>
                        <th>SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sharedLeaderboardQuery.isLoading ? (
                        <tr><td colSpan={3}>LOADING PUBLIC SCOREBOARD…</td></tr>
                      ) : leaderboard.length === 0 ? (
                        <tr><td colSpan={3}>NO TRANSMISSIONS YET — SET THE FIRST SCORE.</td></tr>
                      ) : leaderboard.map((entry, idx) => (
                        <tr key={entry.id} className={scoreSubmitted && entry.score === score && entry.playerTag === submittedName ? "is-current-score" : ""}>
                          <td>#{idx + 1}</td>
                          <td>{entry.hasBonusCrown && <span className="bonus-crown" aria-label="After-party crown earned">♛</span>}{entry.playerTag}</td>
                          <td>{entry.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <a className="facebook-like-button between-level-like pre-level-two-like" href="https://www.facebook.com/share/19GAjvp42m/" target="_blank" rel="noreferrer" aria-label="Visit and like the 5th Dimension artist page on Facebook">BIG UP! (LIKE)</a>
          </div>
        )}

        {finale && (
          <div className="game-overlay finale-overlay">
            <div className="finale-box" role="status" aria-live="polite">
              <span className="finale-kicker">5D TRANSMISSION COMPLETE</span>
              <div className="finale-copy">{submittedName ? <>BIG UP BADMAN <strong>{submittedName}</strong><br /></> : null}JUNGLE IS MASSIVE.</div>
              <span className="finale-subline">LEVEL 2 / 50 DUBPLATES CLEARED</span>
              <div className="finale-high-scores" aria-label="Public arcade high scores">
                <span>PUBLIC HIGH SCORES</span>
                {leaderboard.length ? leaderboard.slice(0, 5).map((entry, index) => <b key={entry.id}>#{index + 1} {entry.hasBonusCrown && <span className="bonus-crown" aria-label="After-party crown earned">♛</span>}{entry.playerTag} · {entry.score}</b>) : <b>NO SCORES TRANSMITTED YET</b>}
              </div>
              <div className="finale-actions">
                <button type="button" className="finale-restart-button" onClick={startGame}>PLAY AGAIN</button>
                <a className="facebook-like-button finale-like" href="https://www.facebook.com/share/19GAjvp42m/" target="_blank" rel="noreferrer" aria-label="Visit and like the 5th Dimension artist page on Facebook">BIG UP! (LIKE)</a>
              </div>
            </div>
            <div className="finale-respekt-ticker" aria-label="Maximum respekt boh boh">
              <span>MAXIMUM RESPEKT BOH! BOH!</span>
            </div>
          </div>
        )}

        {showComboBurst && (
          <div className={`combo-burst-overlay${comboReaction ? ` combo-reaction-${comboReaction}` : ""}`} aria-hidden="true">
            {comboReaction === "big-up" && <div className="combo-big-up"><i /><i /><i /><b /></div>}
            {comboReaction === "subwoofer" && <div className="combo-subwoofer"><i /><b /><span>5D BASS</span></div>}
            {comboReaction === "gun-fingers" && <div className="combo-gun-fingers"><i>☝</i><i>☝</i><i>☝</i></div>}
            {comboReaction === "ground-decks" && <div className="combo-ground-decks"><span className="combo-ground-crack" /><div className="combo-emerging-mixer"><i /><b /><em /></div><div className="combo-emerging-deck combo-deck-left"><i /></div><div className="combo-emerging-deck combo-deck-right"><i /></div></div>}
            {comboReaction === "ground-decks" && <div className="combo-dancer-pop">{CELEBRATION_DANCERS.map((dancer) => <img key={`ground-${dancer.className}`} className={`combo-dancer ${dancer.className}`} src={dancer.src} alt="" />)}</div>}
            <span className="combo-burst-text">{comboReaction === "big-up" || comboReaction === "subwoofer" ? "BIG UP!" : comboReaction === "gun-fingers" ? "GUN FINGER MASSIVE" : comboReaction === "ground-decks" ? "MAXIMUM RESPEKT" : COMBO_CALLOUTS[Math.min(COMBO_CALLOUTS.length - 1, Math.max(0, combo - 5))]}</span>
            <span className="combo-burst-count">{combo}x DUBPLATE COMBO</span>
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} className={`burst-particle particle-${i % 4}`} />
            ))}
          </div>
        )}
        {(heldLossPreview || (isLossComedownVisible && gameOver)) && !levelTwoComplete && (
          <div className={`game-overlay loss-curb-overlay${heldLossPreview ? " viewport-verify-hold" : ""}`} role="status" aria-live="assertive">
            <div className="loss-curb-night" aria-hidden="true"><span className="loss-moon" /><span className="loss-venue-sign">RAVE</span><span className="loss-venue-door" /><span className="loss-neon-spill" /></div>
            <div className="loss-curb-ground" aria-hidden="true"><i /><i /><i /></div>
            <div className="loss-curb-dj" aria-hidden="true"><img src="/embedded-assets/5d-selector-jungle-dj-sprite_502781f7.png" alt="" /><span className="loss-dj-leg loss-dj-leg-left" /><span className="loss-dj-leg loss-dj-leg-right" /><span className="loss-dj-crate" /></div>
            <div className="loss-curb-copy"><span>LAST TUNE / CURB-SIDE COMEDOWN</span><strong>THE RAVE<br />LEFT YOU OUTSIDE.</strong><em>TAKE A BREATH. THE NEXT SESSION IS WAITING.</em></div>
          </div>
        )}

        {gameOver && !finale && !isLossComedownVisible && (
          <div className="game-overlay game-over-overlay">
            <div className="overlay-box game-over-box-wide">
              {isNewRecord && (
                <div className="new-record-badge" role="status" aria-live="polite">
                  <Trophy size={17} /> NEW RECORD!
                </div>
              )}
              <h3>{levelTwoComplete ? "LEVEL 2 CLEARED" : "SESSION TERMINATED"}</h3>
              <p>{levelTwoComplete ? `Final Score: ${score} — Enter a tag for the terminal, or leave it blank to run the green sequence without a username.` : <>Final Score: <strong>{score}</strong> {score >= 500 ? "— Heavy selector energy!" : "— Keep stacking the rhythm!"}</>}</p>
              <button type="button" className="tape-play-button reset-first-action" onClick={startGame}>
                <span className="tape-play-face" aria-hidden="true"><i className="tape-reel tape-reel-left" /><span className="tape-window"><RotateCcw size={15} /></span><i className="tape-reel tape-reel-right" /></span>
                <span className="tape-play-copy">PLAY AGAIN / RESET</span>
              </button>

              {!scoreSubmitted ? (
                <form className="score-entry-form" onSubmit={submitScore}>
                  <label htmlFor="selector-name">SELECTOR TAG (OPTIONAL)</label>
                  <div className="score-entry-row">
                    <input
                      id="selector-name"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value.toUpperCase().slice(0, 12))}
                      maxLength={12}
                      autoComplete="nickname"
                      placeholder="YOUR NAME"
                      aria-describedby="selector-name-hint"
                    />
                    <button type="submit" className="score-submit-button">CONTINUE</button>
                  </div>
                  <span id="selector-name-hint">Up to 12 characters. A tag joins the public board; a blank entry runs the terminal without a username.</span>
                </form>
              ) : (
                <div className="score-saved-badge" role="status" aria-live="polite">
                  <Trophy size={15} /> {sharedScoreStatus === "transmitting" ? "TRANSMITTING" : sharedScoreStatus === "failed" ? "TRANSMISSION FAILED — REPLAY TO RETRY" : "SCORE SAVED TO THE PUBLIC BOARD AS"} <strong>{submittedName}</strong>
                </div>
              )}

              <div className="arcade-leaderboard-container">
                <h4>TOP ARCADE SELECTORS</h4>
                <div className="arcade-table-wrap">
                  <table className="arcade-score-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>SELECTOR</th>
                        <th>SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sharedLeaderboardQuery.isLoading ? (
                        <tr><td colSpan={3}>LOADING PUBLIC SCOREBOARD…</td></tr>
                      ) : leaderboard.length === 0 ? (
                        <tr><td colSpan={3}>NO TRANSMISSIONS YET — SET THE FIRST SCORE.</td></tr>
                      ) : leaderboard.map((entry, idx) => (
                        <tr key={entry.id} className={scoreSubmitted && entry.score === score && entry.playerTag === submittedName ? "is-current-score" : ""}>
                          <td>#{idx + 1}</td>
                          <td>{entry.hasBonusCrown && <span className="bonus-crown" aria-label="After-party crown earned">♛</span>}{entry.playerTag}</td>
                          <td>{entry.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

                {/* Falling items */}
        <div ref={itemsLayerRef} className="falling-items-layer" aria-hidden="true">
          {isPlaying &&
            visibleItems.slice(-18).map((item) => (
              <div
                key={item.id}
                className={`falling-object ${item.type}`}
                data-game-object-id={item.id}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.width}%`,
                  height: `${item.height}%`,
                  "--item-visual-size": `${item.visualSize}px`,
                  "--fall-tilt": `${item.tilt}deg`,
                } as React.CSSProperties}
              >
                {mechanicsDebugEnabled ? <div className={`mechanics-debug-object ${item.type === "record" ? "collectible" : item.type === "cop" || item.type === "pill" || item.type === "phone" || item.type === "bottle" || item.type === "apple" ? "hazard" : "bonus"}`} /> : URBAN_PROP_ASSETS[item.type] ? (
                  <div
                    className={`urban-prop-asset ${item.type}`}
                    style={{ "--urban-prop-url": `url(${URBAN_PROP_ASSETS[item.type]})` } as React.CSSProperties}
                    aria-label={item.type === "record" ? "Dubplate pickup" : item.type === "cop" ? "Police siren hazard" : item.type === "pill" ? "Falling pill hazard" : item.type === "phone" ? "Falling mobile phone hazard" : "CDJ pickup worth 5 records"}
                  />
                ) : item.type === "lion" ? (
                  <div className="lion-head-pickup" aria-label="Lion of Judah pickup worth 2 records"><span className="lion-crown-rays" /><span className="lion-mane" /><span className="lion-face"><i /><i /><b /><em /></span><span className="lion-jah-crown"><i /><i /><i /></span><strong>+2</strong></div>
                ) : item.type === "mixer" ? (
                  <div className="mixer-pickup" aria-label="Mixer pickup worth 4 records"><span /><i /><b>+4</b></div>
                ) : item.type === "turntable" ? (
                  <div className="turntable-pickup" aria-label="Turntable pickup worth 3 records"><span className="turntable-pickup-platter" /><i className="turntable-pickup-arm" /><b>+3</b></div>
                ) : item.type === "adapter" ? (
                  <div className="adapter-pickup" aria-label="45 adapter pickup worth 2 records"><span /><b>+2</b></div>
                ) : item.type === "record" ? (
                  <div className="vinyl-record-sprite" aria-hidden="true">
                    <span className="vinyl-grooves" />
                    <span className="vinyl-label" />
                    <span className="vinyl-spindle" />
                  </div>
                ) : item.type === "cop" ? (
                  <div className="police-badge-sprite" aria-hidden="true">
                    <span className="badge-shield">
                      <span className="badge-star">★</span>
                      <span className="badge-text">POLICE</span>
                    </span>
                    <span className="badge-siren-top">
                      <span className="siren-beacon siren-beacon-left" />
                      <span className="siren-beacon siren-beacon-right" />
                    </span>
                  </div>
                ) : (
                  <div className={`crowd-throw-sprite ${item.type}`} aria-label={item.type === "bottle" ? "Thrown bottle" : item.type === "apple" ? "Thrown apple core" : item.type === "pill" ? "Falling pill" : "Falling mobile phone"}>
                    {item.type === "bottle" ? <span className="bottle-neck" /> : item.type === "apple" ? <><span className="apple-core-stem" /><span className="apple-core-seed seed-one" /><span className="apple-core-seed seed-two" /><span className="apple-core-seed seed-three" /></> : item.type === "pill" ? <span className="pill-cap" /> : <><span className="phone-screen" /><span className="phone-antenna" /></>}
                  </div>
                )}
              </div>
            ))}
        </div>
        {mechanicsDebugEnabled && <aside className="mechanics-debug-log" aria-live="polite"><strong>WORLD DEBUG</strong><span>PLAYER {playerWorldRef.current.x.toFixed(1)},{playerWorldRef.current.y} {playerWorldRef.current.width}×{playerWorldRef.current.height}</span>{mechanicsDebugLog.map((entry) => <small key={entry}>{entry}</small>)}</aside>}
        {realInputDebugEnabled && (
          <aside className="real-input-debug-panel" aria-live="polite">
            <strong>REAL INPUT TRACE</strong>
            <span>PHASE: {realPointerDiagnostics.phase.toUpperCase()} / CAPTURED: {realPointerDiagnostics.captured ? "YES" : "NO"}</span>
            <span>POINTER X: {realPointerDiagnostics.pointerX ?? "—"} / LOCAL X: {realPointerDiagnostics.localX ?? "—"}</span>
            <span>WORLD X: {realPointerDiagnostics.worldX ?? "—"} / TARGET X: {realPointerDiagnostics.playerTargetX.toFixed(2)}</span>
            <span>PLAYER ACTUAL X: {realPointerDiagnostics.playerActualX.toFixed(2)}</span>
            <span>DOM TARGET: {realPointerDiagnostics.domTarget}</span>
            <span>PLAYER HITBOX: {playerWorldRef.current.x.toFixed(2)},{playerWorldRef.current.y} {playerWorldRef.current.width}×{playerWorldRef.current.height}</span>
            <span>CLEAN STREAK: {cleanDubplateStreak}/15 / HAZARD SINCE START: {hazardSinceStreakStart ? "YES" : "NO"}</span>
            <span>BONUS ELIGIBLE: {isBonusEligible ? "YES" : "NO"} / TRIGGERED: {gameMode === "BONUS_CROWD_PRESSURE" ? "YES" : "NO"}</span>
          </aside>
        )}
        {level === 2 && (
          <div className="level-two-booth" aria-hidden="true">
            <div className="crowd-line crowd-line-back">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
            <div className="crowd-line crowd-line-front">{Array.from({ length: 13 }, (_, index) => <i key={index} />)}</div>
            <div className="stage-light-beam beam-left" />
            <div className="stage-light-beam beam-right" />
            {recordsCaught >= LEVEL_TWO_REQUIRED_RECORDS && (
              <div className="level-two-dancer-backdrop" aria-hidden="true">
                {CELEBRATION_DANCERS.map((dancer) => (
                  <img key={`level-two-${dancer.className}`} className={`level-two-dancer ${dancer.className}`} src={dancer.src} alt="" />
                ))}
              </div>
            )}
            <div className="booth-console"><span /><span /><span /></div>
          </div>
        )}

        {/* Level 1 sound-system assembly: half stack at 10, full stack at 15, and a dancer payoff at the 18-dub streak. */}
        <div className={`dj-booth-stage${level === 1 && recordsCaught >= 10 ? " speakers-half-raised" : ""}${level === 1 && recordsCaught >= 15 ? " speakers-full-raised" : ""}${level === 2 ? " level-two-speaker-stage" : ""}${isUnlockCelebrating ? " celebration-active" : ""}`} aria-hidden="true">
          <div className="speaker-tower urban-speaker-tower speaker-tower-left"><img src="/embedded-assets/selectah-speaker-stack-urban_9fd16c27.png" alt="" /></div>
          <div className="speaker-tower urban-speaker-tower speaker-tower-right"><img src="/embedded-assets/selectah-speaker-stack-urban_9fd16c27.png" alt="" /></div>
          {((level === 1 && recordsCaught >= 20) || (level === 2 && recordsCaught >= LEVEL_TWO_REQUIRED_RECORDS)) && (
            <div className="speaker-stack-dancers">
              <img className="speaker-stack-dancer dancer-lime" src={CELEBRATION_DANCERS[0].src} alt="" />
              <img className="speaker-stack-dancer dancer-magenta" src={CELEBRATION_DANCERS[2].src} alt="" />
            </div>
          )}
          {level === 1 && recordsCaught >= 10 && recordsCaught < 15 && (
            <div className="speaker-growth-debris half-stack-debris">
              {Array.from({ length: 14 }, (_, index) => <i key={`half-debris-${index}`} className={`debris-chip chip-${index % 5}`} />)}
            </div>
          )}
          {level === 1 && recordsCaught >= 15 && recordsCaught < 20 && (
            <div className="speaker-growth-debris full-stack-debris">
              {Array.from({ length: 20 }, (_, index) => <i key={`full-debris-${index}`} className={`debris-chip chip-${index % 5}`} />)}
            </div>
          )}
          {level === 1 && recordsCaught >= 20 && combo >= 18 && (
            <div className="level-one-streak-dancers" aria-hidden="true">
              {CELEBRATION_DANCERS.map((dancer) => <img key={`streak-${dancer.className}`} className={`level-one-streak-dancer ${dancer.className}`} src={dancer.src} alt="" />)}
            </div>
          )}
          {isUnlockCelebrating && (
            <>
              <div className="celebration-dancers" aria-hidden="true">
                {CELEBRATION_DANCERS.map((dancer) => (
                  <img key={dancer.className} className={`celebration-dancer ${dancer.className}`} src={dancer.src} alt="" />
                ))}
              </div>
              <div className="confetti-burst-layer" aria-hidden="true">
                {Array.from({ length: 18 }, (_, index) => (
                  <i key={index} className={`confetti-particle confetti-${index % 5}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* DJ selector with turntable at bottom */}
        {mechanicsDebugEnabled && <div ref={mechanicsDebugPlayerHitboxRef} className="mechanics-debug-player-hitbox" style={{ left: `${playerWorldRef.current.x}%` }} aria-hidden="true" />}
        {mixerDamaged && (
          <div className="mixer-recovery-status" role="status" aria-live="polite">
            <strong>MIXER DAMAGED</strong>
            <span>RECOVER: {recoveryProgress}/3 DUBPLATES</span>
          </div>
        )}
        <div ref={djCatcherRef} className={`dj-catcher equipment-${equipmentCondition}${downloadUnlocked ? " booth-lowered" : ""}${level === 2 ? " level-two-catcher" : ""}${mixerDamaged ? " mixer-damaged" : ""}${mixerRepairBurst ? " mixer-repaired" : ""}${greenCamoUnlocked && !bonusCamoUnlocked ? " green-camo-unlocked" : ""}${bonusCamoUnlocked ? " bonus-camo-unlocked" : ""}${playerImpact ? ` player-impact-${playerImpact}` : ""}`} style={{ left: `${djXRef.current}%` }}>
          <div className="dj-catcher-art" role="img" aria-label="2-bit jungle DJ selector holding a turntable">
            <img
              className="dj-sprite"
              src="/embedded-assets/5d-selector-jungle-dj-sprite_502781f7.png"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.parentElement?.classList.add("sprite-failed");
              }}
            />
            {(greenCamoUnlocked || bonusCamoUnlocked) && <span className={`bonus-camo-outfit${greenCamoUnlocked && !bonusCamoUnlocked ? " green" : " purple"}`} aria-label={bonusCamoUnlocked ? "Purple After Party camo outfit unlocked" : "Green No Request camo outfit unlocked"}><i /><b /><em /></span>}
            <div className="equipment-condition-rig" aria-label={`Mixer condition: ${equipmentCondition}`}>
              <i className="equipment-deck-screen" /><i className="equipment-fader" /><i className="equipment-knob equipment-knob-one" /><i className="equipment-knob equipment-knob-two" /><i className="equipment-warning-led" /><i className="equipment-cable" /><i className="equipment-spill" /><i className="equipment-spark" /><i className="equipment-smoke" />
            </div>
            {(mixerDamaged || mixerRepairBurst) && <span className="equipment-condition-callout" aria-live="polite">{mixerRepairBurst ? "REPAIRED!" : `RECOVERY ${recoveryProgress}/3`}</span>}
            <div className="dj-sprite-fallback" aria-hidden="true">
              <span className="dj-selector-head">5D</span>
              <span className="dj-selector-body" />
              <span className="dj-selector-arm dj-selector-arm-left" />
              <span className="dj-selector-arm dj-selector-arm-right" />
              <span className="dj-selector-deck">
                <span className="dj-selector-reel" />
                <span className="dj-selector-label">PLAY</span>
              </span>
            </div>
          </div>
        </div>
      </div>
        <div className="arcade-control-panel">
          <div className="arcade-coin-slot"><span className="coin-slot-slit" /><strong>25¢</strong></div>
          <div className="cabinet-physical-controls" aria-hidden="true"><span className="arcade-joystick"><i /></span><span className="arcade-action-button action-pink" /><span className="arcade-action-button action-cyan" /></div>
          <div className="arcade-joystick-hint"><span>SCRATCH PAD / TOUCH + POINTER</span></div>
          <div className="arcade-coin-slot"><span className="coin-slot-slit" /><strong>PLAYER 1</strong></div>
        </div>
      </div>
      <div className="arcade-cabinet-share-bar">
        <button
          type="button"
          className="arcade-share-btn"
          onClick={async () => {
            const shareUrl = `${window.location.origin}#minigame`;
            if (navigator.share) {
              try {
                await navigator.share({
                  title: "5th Dimension — Selectah Showdown",
                  text: "Play Selectah Showdown and unlock the exclusive free 5D jungle download!",
                  url: shareUrl,
                });
                return;
              } catch {}
            }
            try {
              await navigator.clipboard.writeText(shareUrl);
              setShared(true);
              setTimeout(() => setShared(false), 2200);
            } catch {}
          }}
        >
          {shared ? <Check size={16} /> : <Share2 size={16} />}
          <span>{shared ? "GAME LINK COPIED!" : "SHARE 5D ARCADE GAME"}</span>
        </button>
      </div>
      <div className="arcade-follow-reminder">
        <div>
          <span>FOLLOW THE 5D ARTIST PAGE</span>
          <small>Like or follow in Facebook, then confirm here for a proper big up.</small>
        </div>
        <div className="arcade-follow-actions">
          <a className="arcade-follow-link" href="https://www.facebook.com/share/19GAjvp42m/" target="_blank" rel="noreferrer">OPEN FACEBOOK</a>
          <button type="button" className="arcade-respect-button" onClick={confirmFacebookRespect}>{facebookRespectConfirmed ? "SHOW RESPEKT AGAIN" : "I FOLLOWED — RESPEKT"}</button>
        </div>
      </div>
    </section>
  );
}
