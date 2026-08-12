import React, { useEffect, useRef, useState } from "react";
import { Disc, ShieldAlert, Play, RotateCcw, Trophy, Volume2, VolumeX, Share2, Check } from "lucide-react";

const HIGH_SCORE_STORAGE_KEY = "5d-selector-showdown-high-score";
const LEADERBOARD_STORAGE_KEY = "5d-selector-showdown-leaderboard-v1";
const REQUIRED_RECORDS = 5;
const LEVEL_TWO_REQUIRED_RECORDS = 15;
const LEVEL_TWO_REAR_SPRITE = "/manus-storage/5d-jungle-dj-rear-view_895d2e0c.png";

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

interface FallingItem {
  id: number;
  x: number; // percentage 0-92
  y: number; // percentage 0-90
  type: "record" | "cop" | "bottle" | "apple";
  speed: number;
  size: number;
}

interface DjMiniGameProps {
  onUnlockDownload?: () => void;
  onAchievementFlowComplete?: () => void;
  downloadUnlocked?: boolean;
  isUnlockCelebrating?: boolean;
}

export default function DjMiniGame({ onUnlockDownload, onAchievementFlowComplete, downloadUnlocked = false, isUnlockCelebrating = false }: DjMiniGameProps) {
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
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isUnlockPaused, setIsUnlockPaused] = useState(false);
  const [levelTwoComplete, setLevelTwoComplete] = useState(false);
  const [finale, setFinale] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [musicStatus, setMusicStatus] = useState<"loading" | "ready" | "playing" | "paused" | "blocked" | "error">("loading");
  const [shared, setShared] = useState(false);
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
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
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

  const toggleSound = () => {
    if (soundEnabledRef.current && isPlayingRef.current && (musicStatus === "blocked" || musicStatus === "error")) {
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

  const startLevelTwo = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    levelRef.current = 2;
    setLevel(2);
    recordsCaughtRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 1;
    scoreRef.current = scoreRef.current;
    setRecordsCaught(0);
    setLives(3);
    setCombo(1);
    setIsPlaying(true);
    setIsUnlockPaused(false);
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
    if (!isUnlockPaused) return;
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
    livesRef.current = 3;
    setIsPlaying(true);
    setGameOver(false);
    setLevelTwoComplete(false);
    setIsUnlockPaused(false);
    setIsNewRecord(false);
    setScoreSubmitted(false);
    setSubmittedName("");
    setPlayerName("");
    setScore(0);
    setRecordsCaught(0);
    setCombo(1);
    setLives(3);
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
    if (spawnTimerRef.current >= (levelRef.current === 2 ? 0.62 : 0.72)) {
      spawnTimerRef.current = 0;
      const roll = Math.random();
      const spawnedType: FallingItem["type"] = levelRef.current === 2
        ? (roll < 0.68 ? "record" : roll < 0.84 ? "bottle" : "apple")
        : (roll < 0.3 ? "cop" : "record");
      const size = spawnedType === "record" ? 34 : spawnedType === "cop" ? 38 : 30;
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: Math.floor(Math.random() * 84) + 6,
        y: -10,
        type: spawnedType,
        speed: Math.floor(Math.random() * 13) + (levelRef.current === 2 ? 34 : 31),
        size,
      });
      structureChanged = true;
    }

    const nextItems: FallingItem[] = [];
    let pauseAfterUnlock = false;
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
        if (item.type === "record") {
          playRecordScratch();
          const nextCombo = comboRef.current + 1;
          comboRef.current = nextCombo;
          setCombo(nextCombo);
          const pointsEarned = 100 * Math.min(4, nextCombo);
          currentScore += pointsEarned;
          scoreRef.current = currentScore;
          const nextRecordsCaught = recordsCaughtRef.current + 1;
          recordsCaughtRef.current = nextRecordsCaught;
          setScore(currentScore);
          setRecordsCaught(nextRecordsCaught);
          if (levelRef.current === 1 && nextRecordsCaught >= REQUIRED_RECORDS && !downloadUnlockedRef.current && !unlockJinglePlayedRef.current) {
            unlockJinglePlayedRef.current = true;
            playUnlockJingle();
            onUnlockDownload?.();
            pauseAfterUnlock = true;
          }
          if (levelRef.current === 2 && nextRecordsCaught >= LEVEL_TWO_REQUIRED_RECORDS) {
            completeLevelTwo = true;
          }
        } else {
          playCopSiren();
          comboRef.current = 1;
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
            if (item.type === "record") {
              comboRef.current = 1;
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

      nextItems.push({ ...item, y: newY });
    }

    itemsRef.current = nextItems;
    if (structureChanged) setVisibleItems(nextItems);
    if (pauseAfterUnlock) {
      isPlayingRef.current = false;
      if (bgMusicRef.current) bgMusicRef.current.pause();
      setIsPlaying(false);
      setIsUnlockPaused(true);
      return;
    }
    if (completeLevelTwo) {
      isPlayingRef.current = false;
      if (bgMusicRef.current) bgMusicRef.current.pause();
      setIsPlaying(false);
      setLevelTwoComplete(true);
      setGameOver(true);
      setIsUnlockPaused(false);
      setIsNewRecord(currentScore > highScoreRef.current);
      setScoreSubmitted(false);
      setPlayerName("");
      setSubmittedName("");
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
        <p>Catch the heavy 5D dubplates and dodge the badge patrol. Clear Level 1 to unlock the free “Jersh in Case” download, then keep playing through the crowd level and catch 15 records. Use Left/Right arrows, A/D keys, or drag/touch to move the turntable.</p>
      </div>

      <audio
        ref={bgMusicRef}
        src="/manus-storage/5d-jungle-genesis-track_ff9d149a.mp3"
        loop
        preload="auto"
        playsInline
        aria-label="16-bit jungle background soundtrack"
      />
      <div className="arcade-cabinet-bezel">
        <div className="arcade-marquee">
          <span className="marquee-light" />
          <strong>5TH DIMENSION ARCADE</strong>
          <span className="marquee-light" />
        </div>
        <div
          ref={containerRef}
          className="game-viewport"
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
            {soundEnabled ? (musicStatus === "playing" ? "MUSIC ON" : musicStatus === "blocked" ? "TAP FOR MUSIC" : "SOUND READY") : "MUTED"}
          </button>
        </div>

        {!isPlaying && !gameOver && !isUnlockPaused && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h3>5D TURNTABLE CHALLENGE</h3>
              <p>{level === 2 ? "Level 2: command the crowd from the booth. Catch 15 records while avoiding bottles and apple cores thrown from the rave floor." : "Catch spinning vinyl records (+100pts). Collect 5 records to unlock the free “Jersh in Case” download. Avoid the cop badges—missed records and caught badges cost lives."}</p>
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

        {isUnlockPaused && !gameOver && (
          <div className="game-overlay unlock-overlay">
            {isUnlockCelebrating && (
              <div className="unlock-celebration-layer" aria-hidden="true">
                <div className="celebration-dancers">
                  {CELEBRATION_DANCERS.map((dancer) => (
                    <img key={dancer.className} className={`celebration-dancer ${dancer.className}`} src={dancer.src} alt="" />
                  ))}
                </div>
                <div className="confetti-burst-layer">
                  {Array.from({ length: 18 }, (_, index) => (
                    <i key={index} className={`confetti-particle confetti-${index % 5}`} />
                  ))}
                </div>
              </div>
            )}
            <div className="overlay-box unlock-overlay-box">
              <div className="unlock-overlay-kicker"><Disc size={16} /> DOWNLOAD UNLOCKED</div>
              <h3>LEVEL CLEARED</h3>
              <p>You caught all 5 dubplates. The free “Jersh in Case” download is live. Choose whether to reset the session or keep scratching for a higher score.</p>
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
            </div>
          </div>
        )}

        {finale && (
          <div className="game-overlay finale-overlay">
            <div className="finale-box" role="status" aria-live="polite">
              <span className="finale-kicker">5D TRANSMISSION COMPLETE</span>
              <div className="finale-copy">BIG UP BADMAN <strong>{submittedName || "SELECTOR"}</strong><br />JUNGLE IS MASSIVE.</div>
              <span className="finale-subline">LEVEL 2 / 15 DUBPLATES CLEARED</span>
              <button type="button" className="finale-restart-button" onClick={startGame}>PLAY AGAIN</button>
            </div>
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
            visibleItems.map((item) => (
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
            <div className="booth-console"><span /><span /><span /></div>
          </div>
        )}

        {/* Speaker towers and lowering DJ booth celebration elements */}
        <div className={`dj-booth-stage${downloadUnlocked ? " is-unlocked-celebrating" : ""}${isUnlockCelebrating ? " celebration-active" : ""}`} aria-hidden="true">
          <div className="speaker-tower speaker-tower-left">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
          <div className="speaker-tower speaker-tower-right">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
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
            {level === 2 ? (
              <div className="rear-dj-fallback" role="img" aria-label="Rear view of the 5D jungle DJ facing a massive crowd">
                <span className="rear-dj-headphones" />
                <span className="rear-dj-cap" />
                <span className="rear-dj-head" />
                <span className="rear-dj-jacket" />
                <span className="rear-dj-arm rear-dj-arm-left" />
                <span className="rear-dj-arm rear-dj-arm-right" />
                <span className="rear-dj-deck" />
              </div>
            ) : (
              <img
                className="dj-sprite"
                src="/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png"
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.parentElement?.classList.add("sprite-failed");
                }}
              />
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
