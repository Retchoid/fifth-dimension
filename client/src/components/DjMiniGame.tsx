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
}

export default function DjMiniGame({ onUnlockDownload }: DjMiniGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [recordsCaught, setRecordsCaught] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [djX, setDjX] = useState(50); // percentage 0-90
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);
  const scoreRef = useRef(0);
  const recordsCaughtRef = useRef(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
  const itemsRef = useRef<FallingItem[]>([]);
  const nextIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const djXRef = useRef(50);
  djXRef.current = djX;

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
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(380, now);
    oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.13);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1700, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.13);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(filter).connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  };

  const playCopSiren = () => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(460, now);
    oscillator.frequency.linearRampToValueAtTime(760, now + 0.16);
    oscillator.frequency.linearRampToValueAtTime(460, now + 0.32);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  };

  const toggleSound = () => {
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) primeAudio();
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
    primeAudio();
    isPlayingRef.current = true;
    scoreRef.current = 0;
    recordsCaughtRef.current = 0;
    livesRef.current = 3;
    setIsPlaying(true);
    setGameOver(false);
    setIsNewRecord(false);
    setScore(0);
    setRecordsCaught(0);
    setLives(3);
    setDjX(50);
    itemsRef.current = [];
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const updateGame = (time: number) => {
    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Move DJ based on keys
    let currentX = djXRef.current;
    const moveSpeed = 65; // percent per second
    if (keysRef.current["left"]) {
      currentX = Math.max(4, currentX - moveSpeed * dt);
    }
    if (keysRef.current["right"]) {
      currentX = Math.min(90, currentX + moveSpeed * dt);
    }
    setDjX(currentX);

    // Spawn items
    spawnTimerRef.current += dt;
    if (spawnTimerRef.current > 0.85) {
      spawnTimerRef.current = 0;
      const isCop = Math.random() < 0.32;
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: Math.floor(Math.random() * 85) + 5,
        y: -10,
        type: isCop ? "cop" : "record",
        speed: Math.floor(Math.random() * 18) + 28, // speed % per second
        size: isCop ? 38 : 34,
      });
    }

    // Update item positions and check collisions
    const nextItems: FallingItem[] = [];
    let currentLives = livesRef.current;
    let currentScore = scoreRef.current;

    for (const item of itemsRef.current) {
      const newY = item.y + item.speed * dt;

      // Check collision with DJ catcher (at y between 72 and 88)
      if (newY >= 72 && newY <= 88) {
        // DJ catch zone roughly x between djX and djX + 16
        if (item.x >= currentX - 4 && item.x <= currentX + 18) {
          if (item.type === "record") {
            playRecordScratch();
            currentScore += 100;
            scoreRef.current = currentScore;
            const nextRecordsCaught = recordsCaughtRef.current + 1;
            recordsCaughtRef.current = nextRecordsCaught;
            setRecordsCaught(nextRecordsCaught);
            if (nextRecordsCaught === REQUIRED_RECORDS) {
              onUnlockDownload?.();
            }
            setScore(currentScore);
            // play catch chime if possible
          } else {
            playCopSiren();
            currentLives = Math.max(0, currentLives - 1);
            livesRef.current = currentLives;
            setLives(currentLives);
            if (currentLives === 0) {
              isPlayingRef.current = false;
              setGameOver(true);
              setIsPlaying(false);
              recordHighScore(currentScore);
              return;
            }
          }
          continue; // item caught/hit, remove
        }
      }

      if (newY > 105) {
        // missed record -> lose life or just pass? Let's penalize missed records if life > 0
        if (item.type === "record") {
          currentLives = Math.max(0, currentLives - 1);
          setLives(currentLives);
          if (currentLives === 0) {
            setGameOver(true);
            setIsPlaying(false);
            setHighScore((prev) => Math.max(prev, currentScore));
            return;
          }
        }
        continue; // fallen off screen
      }

      nextItems.push({ ...item, y: newY });
    }

    itemsRef.current = nextItems;

    if (isPlayingRef.current) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const percentage = Math.max(4, Math.min(90, (clientX / rect.width) * 100));
    setDjX(percentage);
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

      <div
        ref={containerRef}
        className="game-viewport"
        onPointerMove={handlePointerMove}
        onTouchMove={(e) => {
          if (!isPlaying || !containerRef.current || !e.touches[0]) return;
          const rect = containerRef.current.getBoundingClientRect();
          const clientX = e.touches[0].clientX - rect.left;
          const percentage = Math.max(4, Math.min(90, (clientX / rect.width) * 100));
          setDjX(percentage);
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
              <button type="button" className="neon-button magenta" onClick={startGame}>
                <Play size={18} /> Start Session
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
              <button type="button" className="neon-button magenta" onClick={startGame}>
                <RotateCcw size={18} /> Play Again
              </button>
            </div>
          </div>
        )}

        {/* Falling items */}
        {isPlaying &&
          itemsRef.current.map((item) => (
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
              {item.type === "record" ? <Disc size={item.size} /> : <ShieldAlert size={item.size} />}
            </div>
          ))}

        {/* DJ selector with turntable at bottom */}
        <div className="dj-catcher" style={{ left: `${djX}%` }}>
          <img
            className="dj-catcher-art"
            src="/manus-storage/selector-dj-catcher_51ee93c3.png"
            alt="Neon 5D DJ selector holding a turntable"
          />
        </div>
      </div>
    </section>
  );
}
