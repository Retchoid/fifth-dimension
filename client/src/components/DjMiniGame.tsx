/* 5D design: preserve the crafted Sega-jungle cabinet while treating the bonus stage as a dawn-vaporwave pirate-radio detour, never a separate visual system. */
/* 5D arcade style: readable late-90s fighting-game silhouettes, loud reactive cut-ins, and visible-but-nonblocking Level 2 dancers inside the vaporwave jungle cabinet. */
import React, { useEffect, useRef, useState } from "react";
import { Disc, ShieldAlert, Play, RotateCcw, Trophy, Volume2, VolumeX, Share2, Check } from "lucide-react";

const HIGH_SCORE_STORAGE_KEY = "5d-selector-showdown-high-score";
const LEADERBOARD_STORAGE_KEY = "5d-selector-showdown-leaderboard-v1";
const REQUIRED_RECORDS = 25;
const LEVEL_TWO_REQUIRED_RECORDS = 50;
const LEVEL_TWO_TRACK_OFFSET_SECONDS = 46;
type GameLevel = 1 | 2;
type BonusObstacleType = "pill" | "cd" | "raver" | "bracelet" | "bottle";

interface BonusObstacle {
  id: number;
  x: number;
  lane: number;
  speed: number;
  type: BonusObstacleType;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: "5D-KILLA", score: 1200 },
  { name: "DUB-SELECTOR", score: 900 },
  { name: "AMEN-IST", score: 600 },
  { name: "SOUNDBOY", score: 300 },
];

const CELEBRATION_DANCERS = [
  { className: "dancer-lime", src: "/manus-storage/5d-jungle-dancer-lime_af13269a.png" },
  { className: "dancer-cyan", src: "/manus-storage/5d-jungle-dancer-cyan_391dfc3c.png" },
  { className: "dancer-magenta", src: "/manus-storage/5d-jungle-dancer-magenta_da5bea9b.png" },
] as const;

const COMBO_CALLOUTS = ["Big Up!", "Gun Finger Massive", "Maximum Boost", "Maximum Respect"] as const;
const BONUS_OBSTACLE_TYPES: BonusObstacleType[] = ["pill", "cd", "raver", "bracelet", "bottle"];
const BONUS_REWARD = 250;
type ComboReaction = "subwoofer" | "gun-fingers" | "ground-decks" | null;
interface PickupFlash {
  key: number;
  label: string;
}

interface FallingItem {
  id: number;
  x: number; // percentage 0-92
  y: number; // percentage 0-90
  type: "record" | "cop" | "bottle" | "apple" | "lion" | "cdj" | "mixer" | "turntable" | "adapter" | "pill" | "phone";
  speed: number;
  size: number;
}

interface DjMiniGameProps {
  onUnlockDownload?: () => void;
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
  const [score, setScore] = useState(0);
  const [recordsCaught, setRecordsCaught] = useState(0);
  const [combo, setCombo] = useState(1);
  const comboRef = useRef(1);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(4);
  const [gameOver, setGameOver] = useState(false);
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
  const [musicStatus, setMusicStatus] = useState<"loading" | "ready" | "playing" | "paused" | "blocked" | "error">("loading");
  const [shared, setShared] = useState(false);
  const [showComboBurst, setShowComboBurst] = useState(false);
  const [comboReaction, setComboReaction] = useState<ComboReaction>(null);
  const [isGunFingerShaking, setIsGunFingerShaking] = useState(false);
  const [pickupFlash, setPickupFlash] = useState<PickupFlash | null>(null);
  const [isRewindPaused, setIsRewindPaused] = useState(false);
  const [isWheelItUpPaused, setIsWheelItUpPaused] = useState(false);
  const [isPoliceSeizurePaused, setIsPoliceSeizurePaused] = useState(false);
  const [isCrowdAngerPaused, setIsCrowdAngerPaused] = useState(false);
  const [isPillOverloadPaused, setIsPillOverloadPaused] = useState(false);
  const [isCrateBonusPaused, setIsCrateBonusPaused] = useState(false);
  const [isHeadphonesBonusPaused, setIsHeadphonesBonusPaused] = useState(false);
  const [isLevelTwoMarqueeVisible, setIsLevelTwoMarqueeVisible] = useState(false);
  const [mixerDamaged, setMixerDamaged] = useState(false);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [mixerRepairBurst, setMixerRepairBurst] = useState(false);
  const [isBonusEligible, setIsBonusEligible] = useState(false);
  const [isBonusSplashVisible, setIsBonusSplashVisible] = useState(false);
  const [isBonusLevelActive, setIsBonusLevelActive] = useState(false);
  const [isBonusRewinding, setIsBonusRewinding] = useState(false);
  const [bonusProgress, setBonusProgress] = useState(0);
  const [bonusLives, setBonusLives] = useState(3);
  const [bonusIsJumping, setBonusIsJumping] = useState(false);
  const [bonusDoorOpen, setBonusDoorOpen] = useState(false);
  const [bonusCamoUnlocked, setBonusCamoUnlocked] = useState(false);
  const [bonusObstacles, setBonusObstacles] = useState<BonusObstacle[]>([]);
  const [visibleItems, setVisibleItems] = useState<FallingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsLayerRef = useRef<HTMLDivElement>(null);
  const djCatcherRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef<GameLevel>(1);
  const recordsCaughtRef = useRef(0);
  const downloadUnlockedRef = useRef(downloadUnlocked);
  const unlockJinglePlayedRef = useRef(false);
  const chainBreakImpactPlayedRef = useRef(false);
  const rewindAwardedRef = useRef(false);
  const rewindPauseTimerRef = useRef<number>(0);
  const wheelItUpAwardedRef = useRef(false);
  const wheelItUpPauseTimerRef = useRef<number>(0);
  const policeBadgeHitsRef = useRef(0);
  const policeSeizurePauseTimerRef = useRef<number>(0);
  const bottleHitsRef = useRef(0);
  const appleCoreHitsRef = useRef(0);
  const crowdAngerPauseTimerRef = useRef<number>(0);
  const pillHitsRef = useRef(0);
  const pillOverloadPauseTimerRef = useRef<number>(0);
  const crateBonusPauseTimerRef = useRef<number>(0);
  const headphonesBonusPauseTimerRef = useRef<number>(0);
  const crowdCheerPlayedRef = useRef(false);
  const levelTwoMusicTimerRef = useRef<number>(0);
  const levelTwoMarqueeTimerRef = useRef<number>(0);
  const mixerDamagedRef = useRef(false);
  const recoveryProgressRef = useRef(0);
  const mixerRepairTimerRef = useRef<number>(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(4);
  const finaleRef = useRef(false);
  const itemsRef = useRef<FallingItem[]>([]);
  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const djXRef = useRef(50);
  const bonusRequestRef = useRef<number>(0);
  const bonusLastTimeRef = useRef(0);
  const bonusGameActiveRef = useRef(false);
  const bonusEligibleRef = useRef(false);
  const bonusCompletedRef = useRef(false);
  const bonusProgressRef = useRef(0);
  const bonusLivesRef = useRef(3);
  const bonusObstaclesRef = useRef<BonusObstacle[]>([]);
  const bonusSpawnTimerRef = useRef(0);
  const bonusNextIdRef = useRef(1);
  const bonusIsJumpingRef = useRef(false);
  const bonusJumpTimerRef = useRef<number>(0);
  const bonusInvulnerableUntilRef = useRef(0);
  const bonusSplashTimerRef = useRef<number>(0);
  const bonusRewindTimerRef = useRef<number>(0);
  const mixerPickupCountRef = useRef(0);
  const turntablePickupCountRef = useRef(0);
  const comboBurstTimerRef = useRef<number>(0);
  const gunFingerShakeTimerRef = useRef<number>(0);
  const pickupFlashTimerRef = useRef<number>(0);
  downloadUnlockedRef.current = downloadUnlocked;

  // Key state for smooth movement
  const keysRef = useRef<{ [key: string]: boolean }>({});

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

  const startLevelOneMusic = () => {
    const audio = bgMusicRef.current;
    if (!audio || !soundEnabledRef.current) return;
    audio.pause();
    audio.currentTime = 0;
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
    if (soundEnabledRef.current && isPlayingRef.current && musicStatus !== "playing") {
      primeAudio();
      playBackgroundMusic();
      return;
    }
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") void ctx.resume();
      if (isPlayingRef.current) playBackgroundMusic();
    } else if (bgMusicRef.current) {
      bgMusicRef.current.pause();
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

      const rawBoard = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (rawBoard) {
        const parsed = JSON.parse(rawBoard);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeaderboard(parsed);
        }
      }
    } catch {
      // Local storage may be unavailable in private or restricted browser contexts.
    }
  }, []);

  const recordHighScore = (candidate: number, rawName: string) => {
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

    // Update leaderboard table
    setLeaderboard((prev) => {
      const safeName = rawName.trim().replace(/[^a-z0-9 _-]/gi, "").slice(0, 12).toUpperCase() || "SELECTOR";
      const updated = [...prev, { name: safeName, score: candidate }];
      updated.sort((a, b) => b.score - a.score);
      const sliced = updated.slice(0, 5);
      try {
        window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(sliced));
      } catch {}
      return sliced;
    });
  };

  const submitScore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = playerName.trim().replace(/[^a-z0-9 _-]/gi, "").slice(0, 12).toUpperCase() || "SELECTOR";
    recordHighScore(score, safeName);
    setPlayerName(safeName);
    setSubmittedName(safeName);
    setScoreSubmitted(true);
    onAchievementFlowComplete?.();
    if (levelTwoComplete) {
      finaleRef.current = true;
      setFinale(true);
    }
  };

  useEffect(() => {
    // Keep the terminal finale tied to the completed Level 2 + saved-name state,
    // even if the parent settles the download celebration in the same render.
    if (!levelTwoComplete || !scoreSubmitted || !submittedName.trim()) return;
    finaleRef.current = true;
    setFinale(true);
  }, [levelTwoComplete, scoreSubmitted, submittedName]);

  const startLevelTwo = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    levelRef.current = 2;
    setLevel(2);
    recordsCaughtRef.current = 0;
    livesRef.current = 4;
    comboRef.current = 1;
    rewindAwardedRef.current = false;
    wheelItUpAwardedRef.current = false;
    policeBadgeHitsRef.current = 0;
    bottleHitsRef.current = 0;
    appleCoreHitsRef.current = 0;
    pillHitsRef.current = 0;
    mixerPickupCountRef.current = 0;
    turntablePickupCountRef.current = 0;
    crowdCheerPlayedRef.current = false;
    mixerDamagedRef.current = false;
    recoveryProgressRef.current = 0;
    scoreRef.current = scoreRef.current;
    setRecordsCaught(0);
    setLives(4);
    setCombo(1);
    setIsPlaying(true);
    setIsUnlockPaused(false);
    setIsRewindPaused(false);
    setIsWheelItUpPaused(false);
    setIsPoliceSeizurePaused(false);
    setIsCrowdAngerPaused(false);
    setIsPillOverloadPaused(false);
    setIsCrateBonusPaused(false);
    setIsHeadphonesBonusPaused(false);
    setMixerDamaged(false);
    setRecoveryProgress(0);
    setMixerRepairBurst(false);
    setComboReaction(null);
    setIsGunFingerShaking(false);
    window.clearTimeout(comboBurstTimerRef.current);
    window.clearTimeout(gunFingerShakeTimerRef.current);
    setGameOver(false);
    setLevelTwoComplete(false);
    setFinale(false);
    finaleRef.current = false;
    itemsRef.current = [];
    setVisibleItems([]);
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    isPlayingRef.current = true;
    window.clearTimeout(levelTwoMusicTimerRef.current);
    window.clearTimeout(levelTwoMarqueeTimerRef.current);
    setIsLevelTwoMarqueeVisible(true);
    levelTwoMarqueeTimerRef.current = window.setTimeout(() => setIsLevelTwoMarqueeVisible(false), 1850);
    primeAudio();
    playRecordScratch();
    if (bgMusicRef.current) bgMusicRef.current.pause();
    levelTwoMusicTimerRef.current = window.setTimeout(() => {
      if (bgMusicRef.current) {
        const trackDuration = bgMusicRef.current.duration;
        const levelTwoOffset = Number.isFinite(trackDuration) && trackDuration > LEVEL_TWO_TRACK_OFFSET_SECONDS
          ? Math.min(LEVEL_TWO_TRACK_OFFSET_SECONDS, trackDuration * 0.65)
          : LEVEL_TWO_TRACK_OFFSET_SECONDS;
        bgMusicRef.current.currentTime = levelTwoOffset;
      }
      playBackgroundMusic();
    }, 165);
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const startNoRequestBonus = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    isPlayingRef.current = false;
    bonusCompletedRef.current = false;
    bonusGameActiveRef.current = false;
    bonusProgressRef.current = 0;
    bonusLivesRef.current = 3;
    bonusObstaclesRef.current = [];
    bonusSpawnTimerRef.current = 0;
    bonusNextIdRef.current = 1;
    bonusInvulnerableUntilRef.current = 0;
    window.clearTimeout(bonusJumpTimerRef.current);
    window.clearTimeout(bonusSplashTimerRef.current);
    window.clearTimeout(bonusRewindTimerRef.current);
    setIsPlaying(false);
    setIsUnlockPaused(false);
    setPreLevelTwoHighScore(false);
    setIsBonusEligible(true);
    setIsBonusSplashVisible(true);
    setIsBonusLevelActive(false);
    setIsBonusRewinding(false);
    setBonusProgress(0);
    setBonusLives(3);
    setBonusIsJumping(false);
    setBonusDoorOpen(false);
    setBonusObstacles([]);
    primeAudio();
    playRecordScratch();
  };

  const finishNoRequestBonus = (cleared: boolean) => {
    if (!bonusGameActiveRef.current) return;
    bonusGameActiveRef.current = false;
    if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    if (cleared && !bonusCompletedRef.current) {
      bonusCompletedRef.current = true;
      const rewardScore = scoreRef.current + BONUS_REWARD;
      scoreRef.current = rewardScore;
      setScore(rewardScore);
      setBonusDoorOpen(true);
      setBonusCamoUnlocked(true);
    }
    setIsBonusLevelActive(false);
    setIsBonusRewinding(true);
    primeAudio();
    playRecordScratch();
  };

  const triggerBonusJump = () => {
    if (!bonusGameActiveRef.current || bonusIsJumpingRef.current) return;
    bonusIsJumpingRef.current = true;
    setBonusIsJumping(true);
    window.clearTimeout(bonusJumpTimerRef.current);
    bonusJumpTimerRef.current = window.setTimeout(() => {
      bonusIsJumpingRef.current = false;
      setBonusIsJumping(false);
    }, 540);
  };

  const updateBonusGame = (time: number) => {
    if (!bonusGameActiveRef.current) return;
    const elapsed = Math.max(0, time - bonusLastTimeRef.current);
    const dt = Math.min(0.032, elapsed / 1000);
    bonusLastTimeRef.current = time;

    let nextProgress = bonusProgressRef.current;
    const touchAutoAdvance = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (touchAutoAdvance) nextProgress = Math.min(100, nextProgress + 10 * dt);
    if (keysRef.current["left"]) nextProgress = Math.max(0, nextProgress - 20 * dt);
    if (keysRef.current["right"]) nextProgress = Math.min(100, nextProgress + 23 * dt);
    if (nextProgress !== bonusProgressRef.current) {
      bonusProgressRef.current = nextProgress;
      setBonusProgress(nextProgress);
    }

    bonusSpawnTimerRef.current += dt;
    if (bonusSpawnTimerRef.current >= 1.45) {
      bonusSpawnTimerRef.current = 0;
      const lane = Math.min(3, Math.floor(Math.random() * 4));
      const type = lane === 3 && Math.random() < 0.42
        ? "bottle"
        : BONUS_OBSTACLE_TYPES[Math.floor(Math.random() * BONUS_OBSTACLE_TYPES.length)];
      bonusObstaclesRef.current.push({ id: bonusNextIdRef.current++, x: 104, lane, type, speed: 12 + Math.floor(Math.random() * 5) });
    }

    const currentLane = Math.min(3, Math.floor(nextProgress / 25));
    const laneProgress = nextProgress - currentLane * 25;
    const playerX = currentLane % 2 === 0 ? 12 + laneProgress * 2.35 : 70 - laneProgress * 2.05;
    const now = performance.now();
    let wasHit = false;
    const nextObstacles: BonusObstacle[] = [];
    for (const obstacle of bonusObstaclesRef.current) {
      const moved = { ...obstacle, x: obstacle.x - obstacle.speed * dt };
      const collides = moved.lane === currentLane && Math.abs(moved.x - playerX) < 6.5;
      if (collides && !bonusIsJumpingRef.current && now > bonusInvulnerableUntilRef.current) {
        wasHit = true;
        bonusInvulnerableUntilRef.current = now + 1100;
        continue;
      }
      if (moved.x > -14) nextObstacles.push(moved);
    }
    bonusObstaclesRef.current = nextObstacles;
    setBonusObstacles(nextObstacles);

    if (wasHit) {
      const nextLives = Math.max(0, bonusLivesRef.current - 1);
      bonusLivesRef.current = nextLives;
      setBonusLives(nextLives);
      // Generous per-platform checkpoints mean a surprise obstacle does not erase a full run.
      const checkpoint = Math.max(0, Math.floor(nextProgress / 25) * 25);
      bonusProgressRef.current = checkpoint;
      setBonusProgress(checkpoint);
      playCopSiren();
      if (nextLives === 0) {
        finishNoRequestBonus(false);
        return;
      }
    }

    if (nextProgress >= 100) {
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
      bonusRequestRef.current = requestAnimationFrame(updateBonusGame);
    }, 1950);
    return () => window.clearTimeout(bonusSplashTimerRef.current);
  }, [isBonusSplashVisible]);

  useEffect(() => {
    if (!isBonusRewinding) return;
    bonusRewindTimerRef.current = window.setTimeout(() => {
      setIsBonusRewinding(false);
      setPreLevelTwoHighScore(true);
    }, 1450);
    return () => window.clearTimeout(bonusRewindTimerRef.current);
  }, [isBonusRewinding]);

  const keepPlayingAfterUnlock = () => {
    if (!isUnlockPaused || !chainBreakComplete) return;
    setIsUnlockPaused(false);
    if (bonusEligibleRef.current) {
      startNoRequestBonus();
    } else {
      setPreLevelTwoHighScore(true);
    }
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
    if (!isRewindPaused) return;
    rewindPauseTimerRef.current = window.setTimeout(() => {
      setIsRewindPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 1900);
    return () => window.clearTimeout(rewindPauseTimerRef.current);
  }, [isRewindPaused]);

  useEffect(() => {
    if (!isWheelItUpPaused) return;
    wheelItUpPauseTimerRef.current = window.setTimeout(() => {
      setIsWheelItUpPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2050);
    return () => window.clearTimeout(wheelItUpPauseTimerRef.current);
  }, [isWheelItUpPaused]);

  useEffect(() => {
    if (!isPoliceSeizurePaused) return;
    policeSeizurePauseTimerRef.current = window.setTimeout(() => {
      setIsPoliceSeizurePaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2150);
    return () => window.clearTimeout(policeSeizurePauseTimerRef.current);
  }, [isPoliceSeizurePaused]);

  useEffect(() => {
    if (!isCrowdAngerPaused) return;
    crowdAngerPauseTimerRef.current = window.setTimeout(() => {
      setIsCrowdAngerPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2100);
    return () => window.clearTimeout(crowdAngerPauseTimerRef.current);
  }, [isCrowdAngerPaused]);

  useEffect(() => {
    if (!isPillOverloadPaused) return;
    pillOverloadPauseTimerRef.current = window.setTimeout(() => {
      setIsPillOverloadPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2250);
    return () => window.clearTimeout(pillOverloadPauseTimerRef.current);
  }, [isPillOverloadPaused]);

  useEffect(() => {
    if (!isCrateBonusPaused) return;
    crateBonusPauseTimerRef.current = window.setTimeout(() => {
      setIsCrateBonusPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2050);
    return () => window.clearTimeout(crateBonusPauseTimerRef.current);
  }, [isCrateBonusPaused]);

  useEffect(() => {
    if (!isHeadphonesBonusPaused) return;
    headphonesBonusPauseTimerRef.current = window.setTimeout(() => {
      setIsHeadphonesBonusPaused(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }, 2050);
    return () => window.clearTimeout(headphonesBonusPauseTimerRef.current);
  }, [isHeadphonesBonusPaused]);

  const submitPreLevelTwoScore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeName = playerName.trim().replace(/[^a-z0-9 _-]/gi, "").slice(0, 12).toUpperCase() || "SELECTOR";
    recordHighScore(score, safeName);
    setPlayerName(safeName);
    setSubmittedName(safeName);
    setScoreSubmitted(true);
    setPreLevelTwoHighScore(false);
    onAchievementFlowComplete?.();
    startLevelTwo();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBonusLevelActive && e.key === " ") {
        e.preventDefault();
        triggerBonusJump();
        return;
      }
      if (!isPlaying && !isBonusLevelActive) return;
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
  }, [isPlaying, isBonusLevelActive, bonusIsJumping]);

  const startGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") void ctx.resume();
    unlockJinglePlayedRef.current = false;
    chainBreakImpactPlayedRef.current = false;
    rewindAwardedRef.current = false;
    wheelItUpAwardedRef.current = false;
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
    window.clearTimeout(mixerRepairTimerRef.current);
    window.clearTimeout(bonusJumpTimerRef.current);
    window.clearTimeout(bonusSplashTimerRef.current);
    window.clearTimeout(bonusRewindTimerRef.current);
    levelRef.current = 1;
    setLevel(1);
    setLevelTwoComplete(false);
    setFinale(false);
    finaleRef.current = false;
    isPlayingRef.current = true;
    startLevelOneMusic();
    scoreRef.current = 0;
    recordsCaughtRef.current = 0;
    comboRef.current = 1;
    livesRef.current = 4;
    setIsPlaying(true);
    setGameOver(false);
    setLevelTwoComplete(false);
    setIsUnlockPaused(false);
    setIsRewindPaused(false);
    setIsWheelItUpPaused(false);
    setIsPoliceSeizurePaused(false);
    setIsCrowdAngerPaused(false);
    setIsPillOverloadPaused(false);
    setIsCrateBonusPaused(false);
    setIsHeadphonesBonusPaused(false);
    setIsLevelTwoMarqueeVisible(false);
    setMixerDamaged(false);
    setRecoveryProgress(0);
    setMixerRepairBurst(false);
    setComboReaction(null);
    setIsGunFingerShaking(false);
    window.clearTimeout(comboBurstTimerRef.current);
    window.clearTimeout(gunFingerShakeTimerRef.current);
    bonusEligibleRef.current = false;
    bonusCompletedRef.current = false;
    bonusGameActiveRef.current = false;
    bonusProgressRef.current = 0;
    bonusLivesRef.current = 3;
    bonusObstaclesRef.current = [];
    mixerPickupCountRef.current = 0;
    turntablePickupCountRef.current = 0;
    setIsBonusEligible(false);
    setIsBonusSplashVisible(false);
    setIsBonusLevelActive(false);
    setIsBonusRewinding(false);
    setBonusProgress(0);
    setBonusLives(3);
    bonusIsJumpingRef.current = false;
    setBonusIsJumping(false);
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
    djXRef.current = 50;
    setVisibleItems([]);
    itemsRef.current = [];
    nextIdRef.current = 1;
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);
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
      djXRef.current = currentX;
      if (djCatcherRef.current) djCatcherRef.current.style.left = `${currentX}%`;
    }

    let structureChanged = false;
    spawnTimerRef.current += dt;
    // Reduce spawn frequency slightly (e.g. interval 1.1s for L1, 0.9s for L2)
    const spawnInterval = levelRef.current === 2 ? 0.90 : 1.10;
    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;
      const roll = Math.random();
      // Level 1 stays free of bottles and apple cores; only the Level 2 crowd throws them.
      const spawnedType: FallingItem["type"] = levelRef.current === 2
        ? (roll < 0.55 ? "record" : roll < 0.64 ? "bottle" : roll < 0.72 ? "apple" : roll < 0.79 ? "cop" : roll < 0.84 ? "pill" : roll < 0.89 ? "phone" : roll < 0.925 ? "lion" : roll < 0.95 ? "cdj" : roll < 0.965 ? "mixer" : roll < 0.985 ? "turntable" : "adapter")
        : (roll < 0.66 ? "record" : roll < 0.78 ? "cop" : roll < 0.84 ? "pill" : roll < 0.89 ? "phone" : roll < 0.94 ? "cdj" : roll < 0.955 ? "mixer" : roll < 0.98 ? "turntable" : "adapter");
      const size = spawnedType === "record" ? 34 : spawnedType === "cop" ? 38 : spawnedType === "lion" ? 46 : spawnedType === "cdj" || spawnedType === "mixer" || spawnedType === "turntable" ? 48 : spawnedType === "adapter" ? 30 : spawnedType === "phone" ? 28 : 30;
      // Increase speed moderately with progression / score
      const baseSpeed = levelRef.current === 2 ? 42 : 36;
      const speedRamp = Math.min(18, Math.floor(scoreRef.current / 400) * 2);
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: Math.floor(Math.random() * 84) + 6,
        y: -10,
        type: spawnedType,
        speed: Math.floor(Math.random() * 10) + baseSpeed + speedRamp,
        size,
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
    let launchBonus = false;
    let advanceToLevelTwo = false;
    let completeLevelTwo = false;
    let currentLives = livesRef.current;
    let currentScore = scoreRef.current;
    const itemNodes = itemsLayerRef.current?.children;

    for (let index = 0; index < itemsRef.current.length; index += 1) {
      const item = itemsRef.current[index];
      const newY = item.y + item.speed * dt;
      const itemNode = itemNodes?.[index] as HTMLElement | undefined;
      if (itemNode) itemNode.style.top = `${newY}%`;

      if (newY >= 70 && newY <= 90 && item.x >= currentX - 8 && item.x <= currentX + 22) {
        structureChanged = true;
        if (item.type === "record" || item.type === "lion" || item.type === "cdj" || item.type === "mixer" || item.type === "turntable" || item.type === "adapter") {
          if (item.type === "turntable") {
            playTurntablePickup();
          } else if (item.type === "adapter") {
            playAdapterPickup();
          } else {
            playRecordScratch();
          }
          const nextCombo = comboRef.current + 1;
          comboRef.current = nextCombo;
          setCombo(nextCombo);
          const pickupValue = item.type === "lion" ? 2 : item.type === "cdj" ? 5 : item.type === "mixer" ? 4 : item.type === "turntable" ? 3 : item.type === "adapter" ? 2 : 1;
          const pickupLabel = item.type === "lion" ? "LION +2" : item.type === "cdj" ? "CDJ +5" : item.type === "mixer" ? "MIX +4" : item.type === "turntable" ? "DECK +3" : item.type === "adapter" ? "45 +2" : "DUB +1";
          const pointsEarned = 100 * pickupValue * Math.min(4, nextCombo);
          currentScore += pointsEarned;
          window.clearTimeout(pickupFlashTimerRef.current);
          setPickupFlash({ key: item.id, label: pickupLabel });
          pickupFlashTimerRef.current = window.setTimeout(() => setPickupFlash(null), 820);
          if (nextCombo >= 30 && !wheelItUpAwardedRef.current) {
            // The rarest selector salute is deliberately deep in the streak so it
            // remains special through both 25- and 50-record level targets.
            wheelItUpAwardedRef.current = true;
            currentScore += 10;
            pauseForWheelItUp = true;
          } else if (nextCombo >= 18 && !rewindAwardedRef.current) {
            // Rewind now arrives later in a run, so its full-screen interruption
            // feels earned rather than routine.
            rewindAwardedRef.current = true;
            currentScore += 5;
            pauseForRewind = true;
          }
          if (item.type === "mixer") {
            mixerPickupCountRef.current += 1;
            if (mixerPickupCountRef.current >= 3) {
              mixerPickupCountRef.current = 0;
              pauseForCrateBonus = true;
            }
          }
          if (item.type === "turntable") {
            turntablePickupCountRef.current += 1;
            if (turntablePickupCountRef.current >= 3) {
              turntablePickupCountRef.current = 0;
              pauseForHeadphonesBonus = true;
            }
          }
          if (mixerDamagedRef.current) {
            const nextRecoveryProgress = Math.min(3, recoveryProgressRef.current + pickupValue);
            recoveryProgressRef.current = nextRecoveryProgress;
            setRecoveryProgress(nextRecoveryProgress);
            if (nextRecoveryProgress >= 3) {
              // 5D design: three recovered dubplates repair the seized mixer,
              // paying out a clear arcade bonus and one short repair flourish.
              mixerDamagedRef.current = false;
              recoveryProgressRef.current = 0;
              currentScore += 500;
              setMixerDamaged(false);
              setRecoveryProgress(0);
              setMixerRepairBurst(true);
              window.clearTimeout(mixerRepairTimerRef.current);
              mixerRepairTimerRef.current = window.setTimeout(() => setMixerRepairBurst(false), 1050);
            }
          }
          scoreRef.current = currentScore;
          const nextRecordsCaught = recordsCaughtRef.current + pickupValue;
          recordsCaughtRef.current = nextRecordsCaught;
          setScore(currentScore);
          setRecordsCaught(nextRecordsCaught);
          if (levelRef.current === 2 && nextRecordsCaught >= 25 && !crowdCheerPlayedRef.current) {
            crowdCheerPlayedRef.current = true;
            playCrowdCheer();
          }
          const nextReaction: ComboReaction = nextCombo === 6 ? "subwoofer" : nextCombo === 12 ? "gun-fingers" : nextCombo === 24 ? "ground-decks" : null;
          if (nextReaction) {
            setComboReaction(nextReaction);
            setShowComboBurst(true);
            window.clearTimeout(comboBurstTimerRef.current);
            comboBurstTimerRef.current = window.setTimeout(() => {
              setShowComboBurst(false);
              setComboReaction(null);
            }, nextReaction === "ground-decks" ? 1350 : 1100);
            if (nextReaction === "subwoofer" || nextReaction === "gun-fingers") playSubwooferPop();
            if (nextReaction === "gun-fingers") {
              setIsGunFingerShaking(true);
              window.clearTimeout(gunFingerShakeTimerRef.current);
              gunFingerShakeTimerRef.current = window.setTimeout(() => setIsGunFingerShaking(false), 980);
            }
          }
          if (levelRef.current === 1 && nextRecordsCaught >= REQUIRED_RECORDS) {
            const cleanLevelOne = livesRef.current >= 3;
            bonusEligibleRef.current = cleanLevelOne;
            setIsBonusEligible(cleanLevelOne);
            if (!downloadUnlockedRef.current && !unlockJinglePlayedRef.current) {
              unlockJinglePlayedRef.current = true;
              playUnlockJingle();
              onUnlockDownload?.();
              pauseAfterUnlock = true;
            } else {
              launchBonus = cleanLevelOne;
              advanceToLevelTwo = !cleanLevelOne;
            }
          }
          if (levelRef.current === 2 && nextRecordsCaught >= LEVEL_TWO_REQUIRED_RECORDS) {
            completeLevelTwo = true;
          }
        } else {
          playCopSiren();
          comboRef.current = 1;
          rewindAwardedRef.current = false;
          wheelItUpAwardedRef.current = false;
          setCombo(1);
          if (mixerDamagedRef.current) {
            recoveryProgressRef.current = 0;
            setRecoveryProgress(0);
          }
          currentLives = Math.max(0, currentLives - 1);
          livesRef.current = currentLives;
          setLives(currentLives);
          if (currentLives === 0) {
            isPlayingRef.current = false;
            if (bgMusicRef.current) bgMusicRef.current.pause();
            itemsRef.current = [];
            setVisibleItems([]);
            setGameOver(true);
            setLevelTwoComplete(false);
            setIsUnlockPaused(false);
            setIsPlaying(false);
            setIsNewRecord(currentScore > highScoreRef.current);
            setScoreSubmitted(false);
            setPlayerName("");
            setSubmittedName("");
            return;
          }
          if (item.type === "cop") {
            policeBadgeHitsRef.current += 1;
            if (policeBadgeHitsRef.current >= 2) {
              // 5D design: the second badge hit briefly interrupts play with a
              // readable Sega police seizure warning; the lost life still counts.
              policeBadgeHitsRef.current = 0;
              pauseForPoliceSeizure = true;
            }
          }
          if (item.type === "bottle" || item.type === "apple") {
            const hazardHitsRef = item.type === "bottle" ? bottleHitsRef : appleCoreHitsRef;
            hazardHitsRef.current += 1;
            if (hazardHitsRef.current >= 2) {
              // Two hits of the same thrown crowd hazard trigger the selector
              // warning; mixed bottles and cores do not prematurely fire it.
              bottleHitsRef.current = 0;
              appleCoreHitsRef.current = 0;
              pauseForCrowdAnger = true;
            }
          }
          if (item.type === "pill") {
            pillHitsRef.current += 1;
            if (pillHitsRef.current >= 3) {
              pillHitsRef.current = 0;
              pauseForPillOverload = true;
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
          comboRef.current = 1;
          rewindAwardedRef.current = false;
          wheelItUpAwardedRef.current = false;
          if (mixerDamagedRef.current) {
            recoveryProgressRef.current = 0;
            setRecoveryProgress(0);
          }
          setCombo(1);
        }
        continue;
      }

      nextItems.push({ ...item, y: newY });
    }

    itemsRef.current = nextItems;
    if (structureChanged) setVisibleItems(nextItems);
    if (pauseAfterUnlock) {
      isPlayingRef.current = false;
      if (bgMusicRef.current) bgMusicRef.current.pause();
      setIsPlaying(false);
      setIsUnlockPaused(true);
      setUnlockRevealReady(false);
      setChainBreakComplete(false);
      const revealTimer = window.setTimeout(() => {
        setUnlockRevealReady(true);
      }, 3000);
      return () => clearTimeout(revealTimer);
    }
    if (pauseForRewind) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsRewindPaused(true);
      return;
    }
    if (pauseForWheelItUp) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsWheelItUpPaused(true);
      return;
    }
    if (pauseForPoliceSeizure) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      mixerDamagedRef.current = true;
      recoveryProgressRef.current = 0;
      setMixerDamaged(true);
      setRecoveryProgress(0);
      playPoliceRadioBurst();
      setIsPoliceSeizurePaused(true);
      return;
    }
    if (pauseForCrowdAnger) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsCrowdAngerPaused(true);
      return;
    }
    if (pauseForPillOverload) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPillOverloadPaused(true);
      return;
    }
    if (pauseForCrateBonus && !pauseForWheelItUp && !pauseForRewind) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsCrateBonusPaused(true);
      return;
    }
    if (pauseForHeadphonesBonus && !pauseForWheelItUp && !pauseForRewind) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsHeadphonesBonusPaused(true);
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
    if (completeLevelTwo) {
      isPlayingRef.current = false;
      if (bgMusicRef.current) bgMusicRef.current.pause();
      const finaleName = submittedName.trim() || playerName.trim() || "SELECTOR";
      recordHighScore(currentScore, finaleName);
      setSubmittedName(finaleName);
      setScoreSubmitted(true);
      setIsPlaying(false);
      setLevelTwoComplete(true);
      setGameOver(false);
      setIsUnlockPaused(false);
      setIsNewRecord(currentScore > highScoreRef.current);
      finaleRef.current = true;
      setFinale(true);
      return;
    }
    if (isPlayingRef.current) requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
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
      window.clearTimeout(bonusJumpTimerRef.current);
      window.clearTimeout(bonusSplashTimerRef.current);
      window.clearTimeout(bonusRewindTimerRef.current);
      window.clearTimeout(comboBurstTimerRef.current);
      window.clearTimeout(gunFingerShakeTimerRef.current);
      window.clearTimeout(pickupFlashTimerRef.current);
      if (bonusRequestRef.current) cancelAnimationFrame(bonusRequestRef.current);
    };
  }, []);

  const updateDjPositionFromClientX = (clientX: number) => {
    if (isBonusLevelActive) return;
    if (!isPlayingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(4, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
    djXRef.current = percentage;
    if (djCatcherRef.current) djCatcherRef.current.style.left = `${percentage}%`;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBonusLevelActive) return;
    if (e.pointerType === "touch") e.preventDefault();
    updateDjPositionFromClientX(e.clientX);
  };

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

  const bonusLane = Math.min(3, Math.floor(bonusProgress / 25));
  const bonusLaneProgress = bonusProgress - bonusLane * 25;
  const bonusRunnerLeft = bonusLane % 2 === 0 ? 12 + bonusLaneProgress * 2.35 : 70 - bonusLaneProgress * 2.05;
  const bonusRunnerBottom = 9 + bonusLane * 20.5;

  return (
    <section id="minigame" className="minigame-section" aria-labelledby="minigame-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><Disc size={15} /> DUBPLATE AUTHENTICATION / 06</p>
          <h2 id="minigame-title">SELECTOR<br /><em>SHOWDOWN.</em></h2>
        </div>
          <p>Catch 25 heavy 5D dubplates and dodge the badge patrol to unlock “Jersh In Case.” Then command the crowd through a 50-record Level 2 run. Missed records reset your combo; hazards cost lives. Use Left/Right arrows, A/D keys, or drag/touch to move the turntable.</p>
      </div>

      <audio
        ref={bgMusicRef}
        src="/manus-storage/5d-jungle-genesis-track_ff9d149a.mp3"
        loop
        preload="auto"
        playsInline
        aria-label="16-bit jungle background soundtrack"
      />
      <div className={`arcade-cabinet-bezel${isCabinetVibrating ? " is-impact-vibrating" : ""}${isGunFingerShaking ? " is-gun-finger-shaking" : ""}`}>
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
        <div
          ref={containerRef}
          className={`game-viewport${level === 2 ? " is-level-two" : ""}${isBonusSplashVisible || isBonusLevelActive || isBonusRewinding ? " is-bonus-scene" : ""}`}
          onPointerMove={handlePointerMove}
          onPointerDown={(e) => {
            if (isBonusLevelActive) {
              if (e.pointerType === "touch" || e.pointerType === "pen") {
                e.preventDefault();
                triggerBonusJump();
              }
              return;
            }
            if (e.pointerType === "touch") {
              e.currentTarget.setPointerCapture(e.pointerId);
              updateDjPositionFromClientX(e.clientX);
            }
          }}
          onPointerUp={(e) => {
            if (e.pointerType === "touch" && e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
        <div className={`game-grid-bg${level === 2 ? " level-two-grid-bg" : ""}`} aria-hidden="true" />
        <div className={`rave-world-dressing${level === 2 ? " level-two-rave-world" : ""}`} aria-hidden="true">
          <span className="rave-poster rave-poster-left">NO REQUESTS<br />AFTER 4AM</span>
          <span className="rave-poster rave-poster-right">BASS =<br />FREE THERAPY</span>
          <span className="rave-flyer-stack"><i>1997</i><b>ONE MORE TUNE?</b><em>ABSOLUTELY NOT.</em></span>
          <span className="rave-glowstick rave-glowstick-one" /><span className="rave-glowstick rave-glowstick-two" /><span className="rave-glowstick rave-glowstick-three" />
        </div>
        {level !== 2 && <div className={`rave-banter-board${isPlaying ? " is-playing" : ""}`} role="status" aria-live="polite"><span>RAVE FAX</span><strong>{raveBanter}</strong></div>}
        <div className="game-hud">
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

        {level === 2 && !gameOver && (
          <div className="level-two-hype-meter level-two-hype-meter-in-world" aria-label={`Crowd hype: ${recordsCaught} of ${LEVEL_TWO_REQUIRED_RECORDS}`}>
            <div className="hype-meter-label"><span>CROWD HYPE</span><strong>{recordsCaught}/{LEVEL_TWO_REQUIRED_RECORDS}</strong></div>
            <div className="hype-meter-track" aria-hidden="true"><i style={{ width: `${Math.min(100, (recordsCaught / LEVEL_TWO_REQUIRED_RECORDS) * 100)}%` }} /></div>
            <small>BUILD THE RAVE FLOOR</small>
          </div>
        )}

        {isLevelTwoMarqueeVisible && level === 2 && !gameOver && (
          <div className="level-two-transition-marquee" role="status" aria-live="polite">
            <span>LEVEL 2</span>
            <strong>CROWD PRESSURE</strong>
            <i aria-hidden="true">◀ ◆ ▶</i>
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

        {!supporterGateRequired && !isPlaying && !gameOver && !isUnlockPaused && !isRewindPaused && !isWheelItUpPaused && !isPoliceSeizurePaused && !isCrowdAngerPaused && !isPillOverloadPaused && !isCrateBonusPaused && !isHeadphonesBonusPaused && !isBonusSplashVisible && !isBonusLevelActive && !isBonusRewinding && !preLevelTwoHighScore && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h3>5D TURNTABLE CHALLENGE</h3>
              <p>{level === 2 ? "Level 2: command the crowd from the booth. Catch 50 records while avoiding bottles, apple cores, and police sirens thrown from the rave floor." : "Catch spinning vinyl records (+100pts). Collect 25 records to unlock the free “Jersh In Case” download. Avoid the cop sirens and badge patrol—missed records reset your combo, while hazards cost lives."}</p>
              <PickupLegend level={level} />
              <button type="button" className="tape-play-button" onClick={startGame}>
                <span className="tape-play-face" aria-hidden="true">
                  <i className="tape-reel tape-reel-left" />
                  <span className="tape-window"><Play size={16} fill="currentColor" /></span>
                  <i className="tape-reel tape-reel-right" />
                </span>
                <span className="tape-play-copy">Start Session</span>
              </button>
            </div>
          </div>
        )}

        {isBonusSplashVisible && (
          <div className="game-overlay no-request-splash-overlay" role="status" aria-live="assertive">
            <div className="no-request-splash-sun" aria-hidden="true" />
            <div className="no-request-splash-copy">
              <span>LEVEL 1 CLEAN RUN / {lives} LIVES LEFT</span>
              <strong>NO REQUEST<br />BONUS!</strong>
              <em>DAWN DOOR RUSH — GET PAST THE CLUB OWNER</em>
            </div>
            <div className="no-request-rewind-cue" aria-hidden="true"><i /><i /><i /></div>
          </div>
        )}

        {isBonusLevelActive && (
          <div className="bonus-level-stage" role="application" aria-label="No Request Bonus. Climb to the club door and jump rolling obstacles.">
            <div className="bonus-dawn-backdrop" aria-hidden="true" />
            <div className="bonus-grid-horizon" aria-hidden="true" />
            <div className="bonus-platform bonus-platform-one" aria-hidden="true" />
            <div className="bonus-platform bonus-platform-two" aria-hidden="true" />
            <div className="bonus-platform bonus-platform-three" aria-hidden="true" />
            <div className="bonus-platform bonus-platform-four" aria-hidden="true" />
            <div className="bonus-ladder ladder-one" aria-hidden="true" />
            <div className="bonus-ladder ladder-two" aria-hidden="true" />
            <div className="bonus-ladder ladder-three" aria-hidden="true" />
            <div className={`bonus-club-door${bonusDoorOpen ? " is-open" : ""}`} aria-label="Angry club owner throwing bottles beside the open dawn door">
              <span className="club-owner-sprite" aria-hidden="true"><i /><b /><em /><strong /></span>
              <span className="club-owner-label">OWNER</span>
              <span className="club-owner-bottle bottle-one" aria-hidden="true" /><span className="club-owner-bottle bottle-two" aria-hidden="true" />
              <i>NO GUESTLIST?</i>
            </div>
            <div className="bonus-hud"><span>NO REQUEST BONUS</span><strong>DOOR {Math.round(bonusProgress)}%</strong><b>♥ {bonusLives}</b></div>
            <div className="bonus-tip">DESKTOP: ◀ ▶ MOVE / SPACE JUMPS · MOBILE: TAP TO JUMP</div>
            <div className={`bonus-dj-runner lane-${bonusLane}${bonusIsJumping ? " is-jumping" : ""}`} style={{ "--runner-left": `${bonusRunnerLeft}%`, "--runner-bottom": `${bonusRunnerBottom}%` } as React.CSSProperties}>
              <img src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png" alt="Jungle DJ climbing toward the club door" />
            </div>
            <div className="bonus-obstacle-layer" aria-hidden="true">
              {bonusObstacles.map((obstacle) => <span key={obstacle.id} className={`bonus-obstacle ${obstacle.type} lane-${obstacle.lane}`} style={{ left: `${obstacle.x}%` }}><i /></span>)}
            </div>
            <div className="bonus-touch-controls" aria-label="No Request Bonus mobile controls">
              <button type="button" className="bonus-jump-button" onClick={triggerBonusJump}>TAP TO JUMP</button>
            </div>
          </div>
        )}

        {isBonusRewinding && (
          <div className="game-overlay bonus-rewind-overlay" role="status" aria-live="assertive">
            <div className="bonus-rewind-disc" aria-hidden="true"><i /></div>
            <div><span>{bonusCompletedRef.current ? `DOOR CLEARED / +${BONUS_REWARD} PTS` : "LAST ENTRY CALLED"}</span><strong>REWIND TO THE RAVE</strong><em>LEVEL 2 CROWD PRESSURE LOADING</em></div>
          </div>
        )}

        {isRewindPaused && !gameOver && (
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

        {isCrateBonusPaused && !gameOver && (
          <div className="game-overlay crate-bonus-overlay" role="status" aria-live="assertive">
            <div className="crate-stack" aria-hidden="true"><span className="crate-record crate-record-one" /><span className="crate-record crate-record-two" /><span className="crate-record crate-record-three" /><i>5D<br />DUBS</i></div>
            <div className="pickup-bonus-copy"><span>3 MIXERS COLLECTED</span><strong>RECORD CRATE<br />BONUS!</strong><em>A DJ ACCIDENTALLY PUT HIS RECORDS<br />IN YOUR CRATE!</em></div>
          </div>
        )}

        {isHeadphonesBonusPaused && !gameOver && (
          <div className="game-overlay headphones-bonus-overlay" role="status" aria-live="assertive">
            <div className="rave-headphones" aria-hidden="true"><i /><b /><em /></div>
            <div className="pickup-bonus-copy"><span>3 TURNTABLES COLLECTED</span><strong>HEADPHONES<br />READY!</strong><em>YOU REMEMBERED TO BRING YOUR<br />HEADPHONES TO THE RAVE!</em></div>
          </div>
        )}

        {isWheelItUpPaused && !gameOver && (
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

        {isPoliceSeizurePaused && !gameOver && (
          <div className="game-overlay police-seizure-overlay" role="status" aria-live="assertive">
            <div className="police-seizure-grid" aria-hidden="true" />
            <div className="sega-police-car" aria-hidden="true">
              <span className="cop-car-lightbar"><i /><i /></span>
              <span className="cop-car-roof" />
              <span className="cop-car-body"><b>POLICE</b></span>
              <span className="cop-car-wheel cop-car-wheel-left" />
              <span className="cop-car-wheel cop-car-wheel-right" />
            </div>
            <div className="police-dj-reaction" aria-hidden="true">
              <img src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png" alt="" />
            </div>
            <div className="police-recovery-prompt" aria-hidden="true">
              <strong>RECOVERY COMBO</strong>
              <span>CATCH 3 DUBPLATES — TAKE BACK THE SET</span>
            </div>
            <div className="police-seizure-copy">
              <span>BADGE PATROL / 2 HITS</span>
              <strong>COPS SEIZED<br />YOUR MIXER.</strong>
              <em>WATCH OUT!</em>
            </div>
            {Array.from({ length: 8 }, (_, index) => <i key={index} className={`police-seizure-flash flash-${index % 4}`} aria-hidden="true" />)}
          </div>
        )}

        {isCrowdAngerPaused && !gameOver && (
          <div className="game-overlay crowd-anger-overlay" role="status" aria-live="assertive">
            <div className="empty-club-room" aria-hidden="true">
              <span className="empty-club-light empty-club-light-left" /><span className="empty-club-light empty-club-light-right" />
              <span className="empty-club-speaker empty-club-speaker-left" /><span className="empty-club-speaker empty-club-speaker-right" />
              <span className="empty-club-dj"><img src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png" alt="" /></span>
              <span className="empty-club-door door-one" /><span className="empty-club-door door-two" /><span className="empty-club-tumbleweed" />
            </div>
            <div className="crowd-anger-copy">
              <span>THROWN TUNE / 2 HITS</span>
              <strong>WRONG TUNE<br />MY SELECTAH</strong>
              <em>PEOPLE ARE LEAVING THE DANCEFLOOR</em>
            </div>
            {Array.from({ length: 7 }, (_, index) => <i key={index} className={`crowd-exit-arrow exit-arrow-${index % 4}`} aria-hidden="true">EXIT</i>)}
          </div>
        )}

        {isPillOverloadPaused && !gameOver && (
          <div className="game-overlay pill-overload-overlay" role="status" aria-live="assertive">
            <div className="pill-trip-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} className={`pill-trip-ray pill-trip-ray-${index % 6}`} />)}</div>
            <div className="dopey-dj-portrait" aria-hidden="true"><img src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png" alt="" /><span className="dopey-pupil pupil-left" /><span className="dopey-pupil pupil-right" /><span className="dopey-smile" /></div>
            <div className="pill-overload-copy"><span>PILL PRESSURE / 3 HITS</span><strong>TOO HIGH<br />TO PLAY!</strong><em>YOU ATE A PILL AND ARE TOO HIGH TO PLAY.</em></div>
            <div className="pill-floaters" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} className={`pill-floater pill-floater-${index % 4}`} />)}</div>
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
                <div className="chain-link-debris" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => <i key={index} className={`chain-link-fragment chain-fragment-${index}`} />)}
                </div>
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
                      {/* 5D style: an oversized silver arcade chain bars the full release title until the unlock impact. */}
                      <span className="chain-run chain-run-text">
                        {Array.from({ length: 12 }, (_, index) => <i key={index} className="chain-link" />)}
                      </span>
                      <span className="chain-padlock" />
                    </div>
                    <span className="unlock-download-drop-label">FREE DOWNLOAD UNLOCKED</span>
                    <strong>JERSH IN CASE</strong>
                    <span>THE SIGNAL IS YOURS — 25 DUBPLATES CAUGHT.</span>
                  </div>
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
            <div className="overlay-box game-over-box-wide">
              <h3>LEVEL 1 HIGH SCORE</h3>
              <p>Enter your selector tag before launching Level 2 crowd transmission.</p>
              <PickupLegend level={2} />
              {!scoreSubmitted ? (
                <form className="score-entry-form" onSubmit={submitPreLevelTwoScore}>
                  <label htmlFor="pre-level-selector-name">ENTER YOUR SELECTOR TAG</label>
                  <div className="score-entry-row">
                    <input
                      id="pre-level-selector-name"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value.toUpperCase().slice(0, 12))}
                      maxLength={12}
                      autoComplete="nickname"
                      placeholder="YOUR NAME"
                    />
                    <button type="submit" className="score-submit-button">SAVE & LAUNCH LVL 2</button>
                  </div>
                </form>
              ) : (
                <div className="score-saved-badge" role="status" aria-live="polite">
                  <Trophy size={15} /> TAG RECORDED AS <strong>{submittedName}</strong>
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
                      {leaderboard.map((entry, idx) => (
                        <tr key={`${entry.name}-${entry.score}-${idx}`}>
                          <td>#{idx + 1}</td>
                          <td>{entry.name}</td>
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

        {finale && (
          <div className="game-overlay finale-overlay">
            <div className="finale-box" role="status" aria-live="polite">
              <span className="finale-kicker">5D TRANSMISSION COMPLETE</span>
              <div className="finale-copy">BIG UP BADMAN <strong>{submittedName || "SELECTOR"}</strong><br />JUNGLE IS MASSIVE.</div>
              <span className="finale-subline">LEVEL 2 / 50 DUBPLATES CLEARED</span>
              <button type="button" className="finale-restart-button" onClick={startGame}>PLAY AGAIN</button>
            </div>
            <div className="finale-respekt-ticker" aria-label="Maximum respekt boh boh">
              <span>MAXIMUM RESPEKT BOH! BOH!</span>
            </div>
          </div>
        )}

        {showComboBurst && (
          <div className={`combo-burst-overlay${comboReaction ? ` combo-reaction-${comboReaction}` : ""}`} aria-hidden="true">
            {comboReaction === "subwoofer" && <div className="combo-subwoofer"><i /><b /><span>5D BASS</span></div>}
            {comboReaction === "gun-fingers" && <div className="combo-gun-fingers"><i>☝</i><i>☝</i><i>☝</i></div>}
            {comboReaction === "ground-decks" && <div className="combo-ground-decks"><span className="combo-ground-crack" /><div className="combo-emerging-mixer"><i /><b /><em /></div><div className="combo-emerging-deck combo-deck-left"><i /></div><div className="combo-emerging-deck combo-deck-right"><i /></div></div>}
            {comboReaction === "ground-decks" && <div className="combo-dancer-pop">{CELEBRATION_DANCERS.map((dancer) => <img key={`ground-${dancer.className}`} className={`combo-dancer ${dancer.className}`} src={dancer.src} alt="" />)}</div>}
            <span className="combo-burst-text">{comboReaction === "subwoofer" ? "BIG UP!" : comboReaction === "gun-fingers" ? "GUN FINGER MASSIVE" : comboReaction === "ground-decks" ? "MAXIMUM RESPECT" : COMBO_CALLOUTS[Math.min(COMBO_CALLOUTS.length - 1, Math.max(0, combo - 5))]}</span>
            <span className="combo-burst-count">{combo}x DUBPLATE COMBO</span>
            <span className="combo-burst-quip">{comboReaction === "subwoofer" ? "SUBWOOFER DEPLOYED — LOW END CHECK" : comboReaction === "gun-fingers" ? "SELECTOR SALUTE — CABINET UNDER PRESSURE" : comboReaction === "ground-decks" ? "DECKS + MIXER: RISEN FROM THE RAVE FLOOR" : level === 2 ? "CROWD RESPONSE: STINK FACE APPROVED" : "NO REQUESTS. JUST REWIND."}</span>
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} className={`burst-particle particle-${i % 4}`} />
            ))}
          </div>
        )}
        {gameOver && !finale && (
          <div className="game-overlay game-over-overlay">
            <div className="overlay-box game-over-box-wide">
              {isNewRecord && (
                <div className="new-record-badge" role="status" aria-live="polite">
                  <Trophy size={17} /> NEW RECORD!
                </div>
              )}
              <h3>{levelTwoComplete ? "LEVEL 2 CLEARED" : "SESSION TERMINATED"}</h3>
              <p>{levelTwoComplete ? `Final Score: ${score} — Save your selector tag to send the transmission.` : <>Final Score: <strong>{score}</strong> {score >= 500 ? "— Heavy selector energy!" : "— Keep stacking the rhythm!"}</>}</p>

              {!scoreSubmitted ? (
                <form className="score-entry-form" onSubmit={submitScore}>
                  <label htmlFor="selector-name">ENTER YOUR SELECTOR TAG</label>
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
                    <button type="submit" className="score-submit-button">SAVE SCORE</button>
                  </div>
                  <span id="selector-name-hint">Up to 12 characters. Your tag is saved on this device.</span>
                </form>
              ) : (
                <div className="score-saved-badge" role="status" aria-live="polite">
                  <Trophy size={15} /> SCORE SAVED AS <strong>{submittedName}</strong>
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
                      {leaderboard.map((entry, idx) => (
                        <tr key={`${entry.name}-${entry.score}-${idx}`} className={scoreSubmitted && entry.score === score && entry.name === submittedName ? "is-current-score" : ""}>
                          <td>#{idx + 1}</td>
                          <td>{entry.name}</td>
                          <td>{entry.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button type="button" className="tape-play-button" onClick={startGame}>
                <span className="tape-play-face" aria-hidden="true">
                  <i className="tape-reel tape-reel-left" />
                  <span className="tape-window"><RotateCcw size={15} /></span>
                  <i className="tape-reel tape-reel-right" />
                </span>
                <span className="tape-play-copy">Play Again</span>
              </button>
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
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                }}
              >
                {item.type === "record" ? (
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
                ) : item.type === "lion" ? (
                  <div className="lion-head-pickup" aria-label="Lion of Judah pickup worth 2 records"><span className="lion-crown-rays" /><span className="lion-mane" /><span className="lion-face"><i /><i /><b /><em /></span><span className="lion-jah-crown"><i /><i /><i /></span><strong>+2</strong></div>
                ) : item.type === "cdj" ? (
                  <div className="cdj-pickup" aria-label="CDJ pickup worth 5 records"><span className="cdj-platter" /><i className="cdj-display">5</i><b>+5</b></div>
                ) : item.type === "mixer" ? (
                  <div className="mixer-pickup" aria-label="Mixer pickup worth 4 records"><span /><i /><b>+4</b></div>
                ) : item.type === "turntable" ? (
                  <div className="turntable-pickup" aria-label="Turntable pickup worth 3 records"><span className="turntable-pickup-platter" /><i className="turntable-pickup-arm" /><b>+3</b></div>
                ) : item.type === "adapter" ? (
                  <div className="adapter-pickup" aria-label="45 adapter pickup worth 2 records"><span /><b>+2</b></div>
                ) : (
                  <div className={`crowd-throw-sprite ${item.type}`} aria-label={item.type === "bottle" ? "Thrown bottle" : item.type === "apple" ? "Thrown apple core" : item.type === "pill" ? "Falling pill" : "Falling mobile phone"}>
                    {item.type === "bottle" ? <span className="bottle-neck" /> : item.type === "apple" ? <><span className="apple-core-stem" /><span className="apple-core-seed seed-one" /><span className="apple-core-seed seed-two" /><span className="apple-core-seed seed-three" /></> : item.type === "pill" ? <span className="pill-cap" /> : <><span className="phone-screen" /><span className="phone-antenna" /></>}
                  </div>
                )}
              </div>
            ))}
        </div>
        {level === 2 && (
          <div className="level-two-booth" aria-hidden="true">
            <div className="crowd-line crowd-line-back">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
            <div className="crowd-line crowd-line-front">{Array.from({ length: 13 }, (_, index) => <i key={index} />)}</div>
            <div className="stage-light-beam beam-left" />
            <div className="stage-light-beam beam-right" />
            <div className="level-two-dancer-backdrop" aria-hidden="true">
              {CELEBRATION_DANCERS.map((dancer) => (
                <img key={`level-two-${dancer.className}`} className={`level-two-dancer ${dancer.className}`} src={dancer.src} alt="" />
              ))}
            </div>
            <div className="booth-console"><span /><span /><span /></div>
          </div>
        )}

        {/* Level 1 sound-system assembly: half stack at 10, full stack at 15, side decks at 20. */}
        <div className={`dj-booth-stage${level === 1 && recordsCaught >= 10 ? " speakers-half-raised" : ""}${level === 1 && recordsCaught >= 15 ? " speakers-full-raised" : ""}${level === 1 && recordsCaught >= 20 ? " side-decks-dropped" : ""}${level === 2 ? " level-two-decks-ready" : ""}${isUnlockCelebrating ? " celebration-active" : ""}`} aria-hidden="true">
          <div className="speaker-tower speaker-tower-left">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
          <div className="speaker-tower speaker-tower-right">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
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
          {(level === 1 && recordsCaught >= 20 || level === 2) && (
            <div className="side-deck-drop">
              <div className="side-deck side-deck-left"><i className="deck-platter" /><b /></div>
              <div className="side-deck side-deck-right"><i className="deck-platter" /><b /></div>
              <span className="side-deck-cable cable-left" /><span className="side-deck-cable cable-right" />
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
        <div ref={djCatcherRef} className={`dj-catcher${downloadUnlocked ? " booth-lowered" : ""}${level === 2 ? " level-two-catcher" : ""}${mixerDamaged ? " mixer-damaged" : ""}${mixerRepairBurst ? " mixer-repaired" : ""}${bonusCamoUnlocked ? " bonus-camo-unlocked" : ""}`} style={{ left: `${djXRef.current}%` }}>
          <div className="dj-catcher-art" role="img" aria-label="2-bit jungle DJ selector holding a turntable">
            <img
              className="dj-sprite"
              src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.parentElement?.classList.add("sprite-failed");
              }}
            />
            {bonusCamoUnlocked && <span className="bonus-camo-outfit" aria-label="Bonus camo outfit unlocked"><i /><b /><em /></span>}
            {(mixerDamaged || mixerRepairBurst) && (
              <div className="mixer-recovery-status" aria-live="polite">
                <strong>{mixerRepairBurst ? "MIXER REPAIRED +500" : "MIXER DAMAGED"}</strong>
                {!mixerRepairBurst && <span>RECOVERY {recoveryProgress}/3</span>}
              </div>
            )}
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
          <div className="arcade-joystick-hint"><span>◄ ► ARROWS / A-D TO SCRATCH</span></div>
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
                  title: "5th Dimension — Selector Showdown",
                  text: "Play Selector Showdown and unlock the exclusive free 5D jungle download!",
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
    </section>
  );
}
