import React, { useEffect, useRef, useState } from "react";
import { Disc, ShieldAlert, Play, RotateCcw, Trophy, Volume2, VolumeX, Share2, Check } from "lucide-react";

const HIGH_SCORE_STORAGE_KEY = "5d-selector-showdown-high-score";
const LEADERBOARD_STORAGE_KEY = "5d-selector-showdown-leaderboard-v1";
const REQUIRED_RECORDS = 25;
const LEVEL_TWO_REQUIRED_RECORDS = 50;
type GameLevel = 1 | 2;

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

const COMBO_CALLOUTS = ["Big Up!", "Rewind Achieved", "Gun Finger Massive", "Maximum Boost", "Maximum Respect"] as const;

interface FallingItem {
  id: number;
  x: number; // percentage 0-92
  y: number; // percentage 0-90
  type: "record" | "cop" | "bottle" | "apple" | "lion" | "cdj";
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
  const [isRewindPaused, setIsRewindPaused] = useState(false);
  const [isWheelItUpPaused, setIsWheelItUpPaused] = useState(false);
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
  const highScoreRef = useRef(0);
  const livesRef = useRef(4);
  const finaleRef = useRef(false);
  const itemsRef = useRef<FallingItem[]>([]);
  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const djXRef = useRef(50);
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
    scoreRef.current = scoreRef.current;
    setRecordsCaught(0);
    setLives(4);
    setCombo(1);
    setIsPlaying(true);
    setIsUnlockPaused(false);
    setIsRewindPaused(false);
    setIsWheelItUpPaused(false);
    setGameOver(false);
    setLevelTwoComplete(false);
    setFinale(false);
    finaleRef.current = false;
    itemsRef.current = [];
    setVisibleItems([]);
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    isPlayingRef.current = true;
    primeAudio();
    playBackgroundMusic();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const keepPlayingAfterUnlock = () => {
    if (!isUnlockPaused || !chainBreakComplete) return;
    setIsUnlockPaused(false);
    setPreLevelTwoHighScore(true);
  };

  useEffect(() => {
    if (!isUnlockPaused || !unlockRevealReady) return;
    // The download reaches its resting position after five seconds, then its
    // chains break apart for a distinct two-second splash-screen phase.
    const chainImpactTimer = window.setTimeout(() => {
      if (chainBreakImpactPlayedRef.current) return;
      chainBreakImpactPlayedRef.current = true;
      setIsCabinetVibrating(true);
      playChainBreakImpact();
    }, 5000);
    const cabinetSettleTimer = window.setTimeout(() => setIsCabinetVibrating(false), 5360);
    const breakTimer = window.setTimeout(() => setChainBreakComplete(true), 7000);
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
      if (!isPlaying) return;
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
  }, [isPlaying]);

  const startGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") void ctx.resume();
    unlockJinglePlayedRef.current = false;
    chainBreakImpactPlayedRef.current = false;
    rewindAwardedRef.current = false;
    wheelItUpAwardedRef.current = false;
    window.clearTimeout(rewindPauseTimerRef.current);
    window.clearTimeout(wheelItUpPauseTimerRef.current);
    levelRef.current = 1;
    setLevel(1);
    setLevelTwoComplete(false);
    setFinale(false);
    finaleRef.current = false;
    isPlayingRef.current = true;
    if (soundEnabledRef.current && bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      playBackgroundMusic();
    }
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
      // Level 1: records, cop sirens, and cop badges
      // Level 2: records, apple cores, bottles, and cop sirens
      const spawnedType: FallingItem["type"] = levelRef.current === 2
        ? (roll < 0.64 ? "record" : roll < 0.75 ? "bottle" : roll < 0.85 ? "apple" : roll < 0.93 ? "cop" : roll < 0.98 ? "lion" : "cdj")
        : (roll < 0.75 ? "record" : "cop");
      const size = spawnedType === "record" ? 34 : spawnedType === "cop" ? 38 : spawnedType === "lion" ? 40 : spawnedType === "cdj" ? 48 : 30;
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
        if (item.type === "record" || item.type === "lion" || item.type === "cdj") {
          playRecordScratch();
          const nextCombo = comboRef.current + 1;
          comboRef.current = nextCombo;
          setCombo(nextCombo);
          const pickupValue = item.type === "lion" ? 2 : item.type === "cdj" ? 5 : 1;
          const pointsEarned = 100 * pickupValue * Math.min(4, nextCombo);
          currentScore += pointsEarned;
          if (nextCombo >= 20 && !wheelItUpAwardedRef.current) {
            // 5D design: Wheel It Up is the higher-streak selector salute—larger
            // reward, unique turntable visual, then a fast return to the chase.
            wheelItUpAwardedRef.current = true;
            currentScore += 10;
            pauseForWheelItUp = true;
          } else if (nextCombo >= 10 && !rewindAwardedRef.current) {
            // 5D design: a rare arcade interruption—one tiny reward, one graffiti hit,
            // then a rapid return to the running session.
            rewindAwardedRef.current = true;
            currentScore += 5;
            pauseForRewind = true;
          }
          scoreRef.current = currentScore;
          const nextRecordsCaught = recordsCaughtRef.current + pickupValue;
          recordsCaughtRef.current = nextRecordsCaught;
          setScore(currentScore);
          setRecordsCaught(nextRecordsCaught);
          if (nextCombo >= 5) {
            setShowComboBurst(true);
            setTimeout(() => setShowComboBurst(false), 800);
          }
          if (levelRef.current === 1 && nextRecordsCaught >= REQUIRED_RECORDS) {
            if (!downloadUnlockedRef.current && !unlockJinglePlayedRef.current) {
              unlockJinglePlayedRef.current = true;
              playUnlockJingle();
              onUnlockDownload?.();
              pauseAfterUnlock = true;
            } else {
              advanceToLevelTwo = true;
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
        }
        continue;
      }

      if (newY > 105) {
        structureChanged = true;
        // Extended 25/50-record sessions remain fair: a missed record breaks
        // the combo, while only a caught hazard removes a life.
        if (item.type === "record" || item.type === "lion" || item.type === "cdj") {
          comboRef.current = 1;
          rewindAwardedRef.current = false;
          wheelItUpAwardedRef.current = false;
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
    if (advanceToLevelTwo) {
      startLevelTwo();
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
    };
  }, []);

  const updateDjPositionFromClientX = (clientX: number) => {
    if (!isPlayingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(4, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
    djXRef.current = percentage;
    if (djCatcherRef.current) djCatcherRef.current.style.left = `${percentage}%`;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    updateDjPositionFromClientX(e.clientX);
  };

  return (
    <section id="minigame" className="minigame-section" aria-labelledby="minigame-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><Disc size={15} /> ARCADE PORTAL / 06</p>
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
      <div className={`arcade-cabinet-bezel${isCabinetVibrating ? " is-impact-vibrating" : ""}`}>
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
          className={`game-viewport${level === 2 ? " is-level-two" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") updateDjPositionFromClientX(e.clientX);
        }}
        onTouchMove={(e) => {
          if (!e.touches[0]) return;
          e.preventDefault();
          updateDjPositionFromClientX(e.touches[0].clientX);
        }}
      >
        <div className={`game-grid-bg${level === 2 ? " level-two-grid-bg" : ""}`} aria-hidden="true" />
        <div className="game-hud">
          <div className="hud-badge"><Disc size={15} /> SCORE: <strong>{score}</strong></div>
          <div className="hud-badge level-hud"><span aria-hidden="true">LVL</span> <strong>{level}</strong></div>
          <div className="hud-badge records-hud"><Disc size={15} /> RECORDS: <strong>{recordsCaught}/{level === 2 ? LEVEL_TWO_REQUIRED_RECORDS : REQUIRED_RECORDS}</strong></div>
          <div className="hud-badge combo-badge" aria-label={`Combo multiplier: ${combo}x`}>COMBO: <strong>{combo}x</strong></div>
          <div className="hud-badge"><Trophy size={15} /> HIGH: <strong>{highScore}</strong></div>
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

        {!supporterGateRequired && !isPlaying && !gameOver && !isUnlockPaused && !isRewindPaused && !isWheelItUpPaused && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h3>5D TURNTABLE CHALLENGE</h3>
              <p>{level === 2 ? "Level 2: command the crowd from the booth. Catch 50 records while avoiding bottles, apple cores, and police sirens thrown from the rave floor." : "Catch spinning vinyl records (+100pts). Collect 25 records to unlock the free “Jersh In Case” download. Avoid the cop sirens and badge patrol—missed records reset your combo, while hazards cost lives."}</p>
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

        {isRewindPaused && !gameOver && (
          <div className="game-overlay rewind-reward-overlay" role="status" aria-live="assertive">
            <div className="rewind-record-splash" aria-hidden="true">
              <span className="rewind-record-ring" />
              <span className="rewind-record-label">5D</span>
            </div>
            <div className="rewind-graffiti-copy">
              <span className="rewind-kicker">10× COMBO / +5 PTS</span>
              <strong>REWIND ACHIEVED</strong>
              <em>BOH MY SELECTAH!</em>
            </div>
            {Array.from({ length: 10 }, (_, index) => <i key={index} className={`rewind-splash-drip rewind-drip-${index % 5}`} aria-hidden="true" />)}
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
              <em>SELECTOR RUN THE TRACK BACK</em>
            </div>
            {Array.from({ length: 14 }, (_, index) => <i key={index} className={`wheel-ray wheel-ray-${index % 7}`} aria-hidden="true" />)}
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
                      {(["top", "bottom", "left", "right"] as const).map((edge) => (
                        <span key={edge} className={`chain-run chain-run-${edge}`}>
                          {Array.from({ length: edge === "top" || edge === "bottom" ? 12 : 7 }, (_, index) => (
                            <i key={index} className="chain-link" />
                          ))}
                        </span>
                      ))}
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
                      <p>You caught all 25 dubplates. The free “Jersh In Case” download is live. Choose whether to reset the session or keep scratching for a higher score.</p>
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
          <div className="combo-burst-overlay" aria-hidden="true">
            <span className="combo-burst-text">{COMBO_CALLOUTS[Math.min(COMBO_CALLOUTS.length - 1, Math.max(0, combo - 5))]}</span>
            <span className="combo-burst-count">{combo}x DUBPLATE COMBO</span>
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
                  <div className="lion-head-pickup" aria-label="Lion head pickup worth 2 records"><span className="lion-mane" /><span className="lion-face"><i /><i /><b /></span><strong>+2</strong></div>
                ) : item.type === "cdj" ? (
                  <div className="cdj-pickup" aria-label="CDJ pickup worth 5 records"><span className="cdj-platter" /><i className="cdj-display">5</i><b>+5</b></div>
                ) : (
                  <div className={`crowd-throw-sprite ${item.type}`} aria-label={item.type === "bottle" ? "Thrown bottle" : "Thrown apple core"}>
                    {item.type === "bottle" ? <span className="bottle-neck" /> : <><span className="apple-core-seed" /><span className="apple-core-leaf" /></>}
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
        <div ref={djCatcherRef} className={`dj-catcher${downloadUnlocked ? " booth-lowered" : ""}${level === 2 ? " level-two-catcher" : ""}`} style={{ left: `${djXRef.current}%` }}>
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
