import React, { useEffect, useRef, useState } from "react";
import { Disc, ShieldAlert, Play, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";

const HIGH_SCORE_STORAGE_KEY = "5d-selector-showdown-high-score";
const REQUIRED_RECORDS = 5;

interface FallingItem {
  id: number;
  x: number; // percentage 0-92
  y: number; // percentage 0-90
  type: "record" | "cop";
  speed: number;
  size: number;
}

interface DjMiniGameProps {
  onUnlockDownload?: () => void;
  downloadUnlocked?: boolean;
  isUnlockCelebrating?: boolean;
}

export default function DjMiniGame({ onUnlockDownload, downloadUnlocked = false, isUnlockCelebrating = false }: DjMiniGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [recordsCaught, setRecordsCaught] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
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
  const recordsCaughtRef = useRef(0);
  const downloadUnlockedRef = useRef(downloadUnlocked);
  const unlockJinglePlayedRef = useRef(false);
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
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

  const playRecordScratch = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    // 16-bit Sega Genesis dual-chip scratch chime + punchy square lead
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.16);

    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.16);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.19);
    osc2.stop(now + 0.19);
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
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.09;
      oscillator.type = index === notes.length - 1 ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(index === notes.length - 1 ? 0.14 : 0.09, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  };

  const toggleSound = () => {
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) {
      primeAudio();
      if (isPlayingRef.current && bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {});
      }
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    }
  };

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

  const recordHighScore = (candidate: number) => {
    const previousBest = highScoreRef.current;
    const isRecord = candidate > previousBest;
    const bestScore = Math.max(previousBest, candidate);
    highScoreRef.current = bestScore;
    setIsNewRecord(isRecord);
    setHighScore(bestScore);
    if (bestScore > candidate || bestScore === 0) return;
    try {
      window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(bestScore));
    } catch {
      // Keep the in-session score when local storage is unavailable.
    }
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
    primeAudio();
    unlockJinglePlayedRef.current = false;
    isPlayingRef.current = true;
    if (soundEnabledRef.current && bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
    }
    scoreRef.current = 0;
    recordsCaughtRef.current = 0;
    livesRef.current = 3;
    setIsPlaying(true);
    setGameOver(false);
    setIsNewRecord(false);
    setScore(0);
    setRecordsCaught(0);
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
    if (spawnTimerRef.current >= 0.72) {
      spawnTimerRef.current = 0;
      const isCop = Math.random() < 0.3;
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: Math.floor(Math.random() * 84) + 6,
        y: -10,
        type: isCop ? "cop" : "record",
        speed: Math.floor(Math.random() * 13) + 31,
        size: isCop ? 38 : 34,
      });
      structureChanged = true;
    }

    const nextItems: FallingItem[] = [];
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
          currentScore += 100;
          scoreRef.current = currentScore;
          const nextRecordsCaught = recordsCaughtRef.current + 1;
          recordsCaughtRef.current = nextRecordsCaught;
          setScore(currentScore);
          setRecordsCaught(nextRecordsCaught);
          if (nextRecordsCaught >= REQUIRED_RECORDS && !downloadUnlockedRef.current && !unlockJinglePlayedRef.current) {
            unlockJinglePlayedRef.current = true;
            playUnlockJingle();
            onUnlockDownload?.();
          }
        } else {
          playCopSiren();
          currentLives = Math.max(0, currentLives - 1);
          livesRef.current = currentLives;
          setLives(currentLives);
          if (currentLives === 0) {
            isPlayingRef.current = false;
            if (bgMusicRef.current) bgMusicRef.current.pause();
            itemsRef.current = [];
            setVisibleItems([]);
            setGameOver(true);
            setIsPlaying(false);
            recordHighScore(currentScore);
            return;
          }
        }
        continue;
      }

      if (newY > 105) {
        structureChanged = true;
        if (item.type === "record") {
          currentLives = Math.max(0, currentLives - 1);
          livesRef.current = currentLives;
          setLives(currentLives);
          if (currentLives === 0) {
            isPlayingRef.current = false;
            if (bgMusicRef.current) bgMusicRef.current.pause();
            itemsRef.current = [];
            setVisibleItems([]);
            setGameOver(true);
            setIsPlaying(false);
            recordHighScore(currentScore);
            return;
          }
        }
        continue;
      }

      nextItems.push({ ...item, y: newY });
    }

    itemsRef.current = nextItems;
    if (structureChanged) setVisibleItems(nextItems);
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
        <p>Catch the heavy 5D dubplates and dodge the badge patrol. Collect 5 records to unlock the free “Jersh in Case” download. Use Left/Right arrows, A/D keys, or drag/touch to move the turntable.</p>
      </div>

      <audio
        ref={bgMusicRef}
        src="/manus-storage/5d-jungle-genesis-track_5b23d949.mp3"
        loop
        preload="auto"
      />
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
        <div className="game-grid-bg" aria-hidden="true" />
        <div className="game-hud">
          <div className="hud-badge"><Disc size={15} /> SCORE: <strong>{score}</strong></div>
          <div className="hud-badge records-hud"><Disc size={15} /> RECORDS: <strong>{recordsCaught}/{REQUIRED_RECORDS}</strong></div>
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
            {soundEnabled ? "SOUND ON" : "MUTED"}
          </button>
        </div>

        {!isPlaying && !gameOver && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h3>5D TURNTABLE CHALLENGE</h3>
              <p>Catch spinning vinyl records (+100pts). Collect 5 records to unlock the free “Jersh in Case” download. Avoid the cop badges—missed records and caught badges cost lives.</p>
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

        {gameOver && (
          <div className="game-overlay game-over-overlay">
            <div className="overlay-box">
              {isNewRecord && (
                <div className="new-record-badge" role="status" aria-live="polite">
                  <Trophy size={17} /> NEW RECORD!
                </div>
              )}
              <h3>SESSION TERMINATED</h3>
              <p>Final Score: <strong>{score}</strong> {score >= 500 ? "— Heavy selector energy!" : "— Keep stacking the rhythm!"}</p>
              <p className="game-over-best"><Trophy size={15} /> Best score saved locally: <strong>{highScore}</strong></p>
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
                ) : (
                  <div className="cop-siren-sprite" aria-hidden="true">
                    <span className="siren-housing" />
                    <span className="siren-beacon siren-beacon-left" />
                    <span className="siren-beacon siren-beacon-right" />
                  </div>
                )}
              </div>
            ))}
        </div>
        {/* Speaker towers and lowering DJ booth celebration elements */}
        <div className={`dj-booth-stage${downloadUnlocked ? " is-unlocked-celebrating" : ""}`} aria-hidden="true">
          <div className="speaker-tower speaker-tower-left">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
          <div className="speaker-tower speaker-tower-right">
            <span className="speaker-grille" /><span className="speaker-cone" /><span className="speaker-cone" />
          </div>
          {isUnlockCelebrating && (
            <div className="confetti-burst-layer" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <i key={index} className={`confetti-particle confetti-${index % 5}`} />
              ))}
            </div>
          )}
        </div>

        {/* DJ selector with turntable at bottom */}
        <div ref={djCatcherRef} className={`dj-catcher${downloadUnlocked ? " booth-lowered" : ""}`} style={{ left: `${djXRef.current}%` }}>
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
    </section>
  );
}
