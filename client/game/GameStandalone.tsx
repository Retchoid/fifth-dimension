import { useState } from "react";
import DjMiniGame from "@/components/DjMiniGame";
import { EXCLUSIVE_RELEASE } from "@/lib/djLinks";
import "./game.css";

export default function GameStandalone() {
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);

  return (
    <div className="game-standalone">
      <header className="game-standalone-header">
        <a className="game-standalone-brand" href="https://fifth-dimension.onrender.com/">5th Dimension / Bass Transmission</a>
        <span className="game-standalone-caption">Independent arcade transmission</span>
      </header>
      <main className="game-standalone-main">
        <h1 className="game-standalone-title">Selectah Showdown</h1>
        <p className="game-standalone-intro">
          Catch 25 heavy dubplates, command the crowd, and take the gear through the afterparty.
          Move with A/D or drag across the playfield.
        </p>
        <div id="selectah-showdown" className="arcade-flow-shell">
          <DjMiniGame
            downloadUnlocked={downloadUnlocked}
            onUnlockDownload={() => setDownloadUnlocked(true)}
          />
        </div>
        {downloadUnlocked && (
          <section className="standalone-release-unlock" aria-live="polite">
            <h2>Dubplate unlocked</h2>
            <p>{EXCLUSIVE_RELEASE.title} — {EXCLUSIVE_RELEASE.artist} · {EXCLUSIVE_RELEASE.duration}</p>
            <audio controls preload="none" src={EXCLUSIVE_RELEASE.url}>
              Your browser does not support audio playback.
            </audio>
            <div><a className="standalone-release-download" href={EXCLUSIVE_RELEASE.url} download="Jersh In Case — 5th Dimension, Skavo featuring MC Mestup.mp3">Listen or download</a></div>
          </section>
        )}
      </main>
    </div>
  );
}
