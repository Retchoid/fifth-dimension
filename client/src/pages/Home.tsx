/**
 * Archive-faithful 5th Dimension transmission: street-poster collage, bass-first hierarchy, and signal-colour motion.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Download,
  Facebook,
  Instagram,
  Mail,
  Menu,
  Music2,
  Pause,
  Play,
  Radio,
  Share2,
  ShieldAlert,
  Sparkles,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  BOOKING_EMAIL,
  createBookingMailto,
  EXCLUSIVE_RELEASE,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  MIXCLOUD_EMBED,
  MIXCLOUD_PROFILE,
  SOUND_CLOUD_EMBED,
  SOUND_CLOUD_PROFILE,
} from "@/lib/djLinks";
import {
  DOWNLOAD_UNLOCK_STORAGE_KEY,
  DOWNLOAD_UNLOCK_STORAGE_VALUE,
  LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS,
  isReleaseUnlockProof,
  isReleaseUnlockStored,
  type ReleaseUnlockProof,
} from "@/lib/releaseGate";
import DjMiniGame from "@/components/DjMiniGame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const SUPPORTER_CONFIRMATION_STORAGE_KEY = "5d-selector-showdown-supporter-confirmed";

const projects = [
  {
    id: "TRANSMISSION 01",
    title: "Frequency loading",
    detail: "A fresh 5th Dimension mix is taking shape between breakbeat pressure, bassline weight, and late-night jungle heat.",
    status: "In the lab",
    image: "/manus-storage/5d-frequency-loading-boombox_ce5a46d2.png",
  },
  {
    id: "LIVE SIGNAL",
    title: "Floor rewiring sessions",
    detail: "Upcoming appearances, special broadcasts, and after-hours selections will land here when the coordinates are locked.",
    status: "Signal incoming",
    image: "/manus-storage/5th-dimension-graffiti-mark_f607b9d3.png",
  },
];

const art = [
  {
    src: "/manus-storage/ragga-revival_bc56c618.png",
    alt: "Ragga Revival event poster featuring Hi Deaf",
    label: "RAGGA REVIVAL / 2012",
    className: "art-tall art-ragga",
  },
  {
    src: "/manus-storage/graffiti-collage_bac19afe.png",
    alt: "Graffiti collage with retro figures and neon green paint",
    label: "GRAFFITI CAKE / 2025",
    className: "art-square art-cake",
  },
  {
    src: "/manus-storage/cool-world-piece_b1a88e9c.png",
    alt: "Cool World-inspired painted art with a rabbit character and green graffiti",
    label: "COOL WORLD STUDY",
    className: "art-tall art-cool",
  },
  {
    src: "/manus-storage/painted-character_15d43de1.png",
    alt: "Hand-painted portrait with a wax-style graffiti cap",
    label: "WAX PORTRAIT",
    className: "art-square art-wax",
  },
  {
    src: "/manus-storage/5th-dimension-character_a901a681.jpg",
    alt: "Neon vaporwave portrait in magenta, cyan and violet",
    label: "NEON FREQUENCY PORTRAIT",
    className: "art-square art-portrait",
  },
  {
    src: "/manus-storage/5th-dimension-graffiti-mark_f607b9d3.png",
    alt: "5th Dimension graffiti logo on cyan paint texture",
    label: "DIMENSION TAG",
    className: "art-tall art-tag",
  },
];

const MIX_ARCHIVE = {
  jungle: [
    {
      id: "JUNGLE / 01",
      title: "CFMU Hostile Airwaves May 9",
      artist: "Dj Hideaf",
      description: "Hostile Airwaves archive recording. Date: May 9; year not listed.",
      file: "/manus-storage/cfmu-hostile-airwaves-may-9-dj-hideaf-final_dc5a204c.mp3",
      downloadName: "CFMU Hostile Airwaves May 9 - Dj Hideaf.mp3",
      cover: "/manus-storage/mix-cover-cfmu-hostile-airwaves_9603abc2.png",
    },
    {
      id: "DNB / 02",
      title: "Deep On Rolling",
      artist: "Bobbyjackets",
      description: "Liquid funk feature recorded for Red.fm.",
      file: "/manus-storage/deep-on-rolling-bobbyjackets-final_0c567ad7.mp3",
      downloadName: "Deep On Rolling - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-deep-on-rolling_481214e6.png",
    },
    {
      id: "DNB / 03",
      title: "Minianimilism 2",
      artist: "5th Dimension",
      description: "Drum-and-bass transmission from the 5D archive.",
      file: "/manus-storage/minianimilism-2-5th-dimension-final_567b354e.mp3",
      downloadName: "Minianimilism 2 - 5th Dimension.mp3",
      cover: "/manus-storage/png-review-minianimilism-2_f8c55f62.png",
    },
  ],
  house: [
    {
      id: "HOUSE / 01",
      title: "Live festival house mix 2022",
      artist: "Bobbyjackets",
      description: "Live festival house broadcast from 2022.",
      file: "/manus-storage/live-festival-house-mix-2022-bobbyjackets-final_228c9c66.mp3",
      downloadName: "Live festival house mix 2022 - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-live-festival-house-2022_4dd116a7.png",
    },
    {
      id: "HOUSE / 02",
      title: "Holes in Our Souls",
      artist: "Bobbyjackets",
      description: "Multi-style downtempo and deep-house session.",
      file: "/manus-storage/holes-in-our-souls-bobbyjackets-final_9ab83342.mp3",
      downloadName: "Holes in Our Souls - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-holes-in-our-souls_ec90b79e.png",
    },
    {
      id: "LIVE HOUSE / A",
      title: "Festival live mix house — Side A",
      artist: "Bobbyjackets",
      description: "Long progressive live-house set, Part A: techy electro bass house.",
      file: "/manus-storage/festival-live-mix-house-side-a-bobbyjackets-final_201d86ef.mp3",
      downloadName: "Festival live mix house - Side A - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-festival-house-side-a_b1083694.png",
    },
    {
      id: "LIVE HOUSE / B",
      title: "Festival live mix house — Side B",
      artist: "Bobbyjackets",
      description: "Long progressive live-house set, Part B: slightly harder bass.",
      file: "/manus-storage/festival-live-mix-house-side-b-bobbyjackets-final_e64122a2.mp3",
      downloadName: "Festival live mix house - Side B - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-festival-house-side-b_9e1003bf.png",
    },
    {
      id: "LIVE HOUSE / C",
      title: "Festival live mix house — Side C",
      artist: "Bobbyjackets",
      description: "Long progressive live-house set, Part C: keep it moving on the dancefloor.",
      file: "/manus-storage/festival-live-mix-house-side-c-bobbyjackets-final_44ca40df.mp3",
      downloadName: "Festival live mix house - Side C - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-festival-house-side-c_dc39199f.png",
    },
    {
      id: "LIVE HOUSE / D",
      title: "Festival live mix house — Side D",
      artist: "Bobbyjackets",
      description: "Long progressive live-house set, Part D: sun coming up, totally turnt.",
      file: "/manus-storage/festival-live-mix-house-side-d-bobbyjackets-final_66e8eaa3.mp3",
      downloadName: "Festival live mix house - Side D - Bobbyjackets.mp3",
      cover: "/manus-storage/png-review-festival-house-side-d_a5ceb8e8.png",
    },
  ],
} as const;

type ArchiveMix = (typeof MIX_ARCHIVE.jungle)[number] | (typeof MIX_ARCHIVE.house)[number];
const ARCHIVE_MIXES: ArchiveMix[] = [...MIX_ARCHIVE.jungle, ...MIX_ARCHIVE.house];
const MIX_SHARE_CALL_TO_ACTION = "check out 5th Dimension music official site for more content, games and upcoming events";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [isUnlockCelebrating, setIsUnlockCelebrating] = useState(false);
  const [bookingEventDate, setBookingEventDate] = useState("");
  const [bookingEventLocation, setBookingEventLocation] = useState("");
  const [isExclusivePlaying, setIsExclusivePlaying] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [sharedMixId, setSharedMixId] = useState<string | null>(null);
  const [mixShareStatus, setMixShareStatus] = useState<"idle" | "copied">("idle");
  const [requiresSupporterConfirmation, setRequiresSupporterConfirmation] = useState(false);
  const exclusiveAudioRef = useRef<HTMLAudioElement>(null);
  const activeArt = lightboxIndex === null ? null : art[lightboxIndex];

  useEffect(() => {
    try {
      LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
      setDownloadUnlocked(isReleaseUnlockStored(window.localStorage.getItem(DOWNLOAD_UNLOCK_STORAGE_KEY)));
      const hasConfirmedSupport = window.localStorage.getItem(SUPPORTER_CONFIRMATION_STORAGE_KEY) === "true";
      const arrivedViaSharedGameLink = new URLSearchParams(window.location.search).get("from") === "selector-share";
      setRequiresSupporterConfirmation(arrivedViaSharedGameLink && !hasConfirmedSupport);
    } catch {
      // Local storage may be unavailable in private or restricted browser contexts.
    }
  }, []);

  const unlockDownload = (proof: ReleaseUnlockProof) => {
    if (!isReleaseUnlockProof(proof)) return;
    const wasAlreadyUnlocked = downloadUnlocked;
    setDownloadUnlocked(true);
    if (!wasAlreadyUnlocked) setIsUnlockCelebrating(true);
    try {
      window.localStorage.setItem(DOWNLOAD_UNLOCK_STORAGE_KEY, DOWNLOAD_UNLOCK_STORAGE_VALUE);
    } catch {
      // Keep the unlocked state for the current session when storage is unavailable.
    }
  };

  const settleAchievementFlow = () => {
    setIsUnlockCelebrating(false);
  };

  const toggleExclusivePlayback = () => {
    const audio = exclusiveAudioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setIsExclusivePlaying(false));
    } else {
      audio.pause();
    }
  };

  const shareGameLink = async () => {
    const gameUrl = `${window.location.origin}${window.location.pathname}?from=selector-share#minigame`;
    const shareData = {
      title: "5th Dimension — Selectah Showdown",
      text: "Run the 5D Selectah Showdown and unlock the bass transmission.",
      url: gameUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(gameUrl);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2600);
    } catch {
      // Closing a system share sheet is not an error state worth surfacing.
    }
  };

  const activeShareMix = sharedMixId ? ARCHIVE_MIXES.find((mix) => mix.id === sharedMixId) ?? null : null;

  const shareArchiveMix = async (mix: ArchiveMix) => {
    const archiveUrl = `${window.location.origin}${window.location.pathname}#other-mixes`;
    const shareData = {
      title: `${mix.title} — ${mix.artist}`,
      text: `${mix.title} — ${mix.artist}. ${MIX_SHARE_CALL_TO_ACTION}`,
      url: archiveUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${shareData.text}\n${archiveUrl}`);
      setMixShareStatus("copied");
      window.setTimeout(() => setMixShareStatus("idle"), 2600);
    } catch {
      // Closing a native share sheet does not require an error message.
    }
  };

  const confirmSupporterAccess = () => {
    try {
      window.localStorage.setItem(SUPPORTER_CONFIRMATION_STORAGE_KEY, "true");
    } catch {
      // Keep the confirmation active for this visit when storage is unavailable.
    }
    setRequiresSupporterConfirmation(false);
  };

  useEffect(() => {
    return () => exclusiveAudioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (!isUnlockCelebrating) return;
    const celebrationTimer = window.setTimeout(() => setIsUnlockCelebrating(false), 5000);
    return () => window.clearTimeout(celebrationTimer);
  }, [isUnlockCelebrating]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setLightboxIndex((current) => (current === null ? 0 : (current + 1) % art.length));
      }
      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) => (current === null ? art.length - 1 : (current - 1 + art.length) % art.length));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  const openBookingEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = createBookingMailto(bookingSubject, bookingMessage, bookingEventDate, bookingEventLocation);
  };

  return (
    <div className="dj-site min-h-screen bg-[#09070f] text-white">
      <header className="dj-header">
        <a className="header-brand" href="#top" aria-label="5th Dimension home">
          <span className="brand-pulse" aria-hidden="true" />
          <img className="header-seal" src="/manus-storage/5th-dimension-graffiti-mark_f607b9d3.png" alt="" />
          <span className="header-brand-copy"><small>5D / PIRATE RADIO AUTH</small><b>BASS TRANSMISSION</b></span>
        </a>
        <nav className="dj-nav" aria-label="Main navigation">
          <a href="#listen">Listen</a>
          <a href="#bio">Bio</a>
          <a href="#projects">Projects</a>
          <a href="#visuals">Visuals</a>
          <a href="#booking">Booking</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <a className="header-ig" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Instagram size={17} />
            <span>IG / 5TH DIMENSION</span>
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={25} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[
              ["Listen", "#listen"],
              ["Bio", "#bio"],
              ["Projects", "#projects"],
              ["Visuals", "#visuals"],
              ["Booking", "#booking"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-bg hero-bg-signal" aria-hidden="true" />
          <div className="hero-overlay" />
          <div className="hero-orbit orbit-a" aria-hidden="true" />
          <div className="hero-orbit orbit-b" aria-hidden="true" />
          <div className="hero-noise" aria-hidden="true" />
          <div className="vapor-cityscape" aria-hidden="true" />
          <span className="graffiti-flare flare-left" role="img" tabIndex={0} aria-label="Dubplate sound system flare">DUBPLATE</span>
          <span className="graffiti-flare flare-right" role="img" tabIndex={0} aria-label="Bassline sound system flare">BASSLINE</span>
          <div className="hero-content">
            <p className="signal-label"><Zap size={15} fill="currentColor" /> DANCEHALL VIBES / DEEP JUNGLE BREAKS / SOUND SYSTEM WEIGHT</p>
            <h1 id="hero-title">
              <span>5TH</span>
              <em>DIMENSION</em>
            </h1>
            <p className="hero-copy">Heavy sound-system pressure, ragga-infused breakbeats, and dubplate pressure direct from the low end.</p>
            <div className="hero-links">
              <a className="neon-button magenta" href="#listen"><Volume2 size={18} /> Enter the mixes <ArrowDownRight size={18} /></a>
              <a className="neon-text-link" href="#bio">Read the signal <ArrowDownRight size={17} /></a>
            </div>
          </div>
          <div className="hero-logo-stage">
            <div className="logo-grid" aria-hidden="true" />
            <img
              src="/manus-storage/5th-dimension-graffiti-mark_f607b9d3.png"
              alt="5th Dimension graffiti logo"
              className="hero-logo"
            />
            <span className="dimension-stamp">5D<br />LIVE</span>
          </div>
          <div className="hero-footer-strip">
            <span><i /> HIGH-ENERGY FREQUENCIES DETECTED</span>
            <span>SELECTOR / BOBBY BASS</span>
            <span>EST. IN THE LOW END</span>
          </div>
        </section>

        <section id="listen" className="listen-section" aria-labelledby="listen-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><Radio size={15} /> AUDIO PORTAL / 01</p>
              <h2 id="listen-title">PLAY THE <em>TRANSMISSION.</em></h2>
            </div>
            <p>Needle down. Signal open. Let the bass speak.</p>
          </div>
          <div className="deck-grid">
            <article className="music-deck soundcloud-deck">
              <div className="deck-topline"><span>SC / PRIMARY DECK</span><span className="live-chip"><i /> LIVE PROFILE</span></div>
              <h3>SoundCloud<br /><em>5th Dimension</em></h3>
              <div className="embed-shell">
                <iframe
                  title="5th Dimension on SoundCloud"
                  width="100%"
                  height="300"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={SOUND_CLOUD_EMBED}
                />
              </div>
              <a href={SOUND_CLOUD_PROFILE} target="_blank" rel="noreferrer" className="deck-link">Open in SoundCloud <ArrowUpRight size={17} /></a>
            </article>
            <article className="music-deck mixcloud-deck">
              <div className="deck-topline"><span>MC / SECONDARY DECK</span><span className="live-chip mixcloud-live-chip">FEATURED MIX</span></div>
              <h3>Mixcloud<br /><em>Logikal Grinder</em></h3>
              <div className="embed-shell mixcloud-embed-shell">
                <iframe
                  title="Logikal Grinder by 5th Dimension on Mixcloud"
                  width="100%"
                  height="180"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={MIXCLOUD_EMBED}
                />
              </div>
              <a href={MIXCLOUD_PROFILE} target="_blank" rel="noreferrer" className="deck-link">Open in Mixcloud <ArrowUpRight size={17} /></a>
            </article>
          </div>
          <div className="bandcamp-strip">
            <Music2 size={21} />
            <div><strong>BANDCAMP PORT</strong><span>Future releases, edits, and downloadables will land here.</span></div>
            <span>LINK PENDING</span>
          </div>
        </section>

        <section id="bio" className="bio-section" aria-labelledby="bio-title">
          <div className="bio-tag"><span>THE</span><strong>5D</strong><span>FREQUENCY</span></div>
          <div className="bio-copy">
            <p className="eyebrow"><Zap size={15} fill="currentColor" /> SELECTOR PROFILE / 02</p>
            <h2 id="bio-title">BASS ISN’T A GENRE.<br /><em>IT’S A GRAVITY FIELD.</em></h2>
            <p className="bio-lead"><strong>5th Dimension is the sonic alter-ego of Bobby Bass</strong> (aka Bobby Jackets / Hi Deaf)—shaping a heavy sound-system discipline where raw dancehall attitude, ragga-steppa pressure, and intricate jungle breakbeats collide.</p>
            <p>Rooted in sound-system culture and late-night rave frequency, every transmission moves from heavyweight basslines to hypnotic ragga vocal chops and hypnotic amen pressure. Selector rules: select the heaviest plate, test the stack, and let the bass take control.</p>
            <div className="tags"><span>#DANCEHALLVIBES</span><span>#JUNGLEREVIVAL</span><span>#SOUNDSYSTEMWEIGHT</span><span>#BREAKBEATALCHEMIST</span></div>
          </div>
          <div className="bio-art-panel">
            <img src="/manus-storage/5th-dimension-character_a901a681.jpg" alt="5th Dimension street-art insignia" />
            <span>JUNGLE / GROOVE / PRESSURE</span>
          </div>
        </section>

        <section id="other-mixes" className="genre-mixes-section" aria-labelledby="genre-mixes-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><Disc3 size={15} /> MORE ROOMS / 02B</p>
              <h2 id="genre-mixes-title">MIX ARCHIVE &amp;<br /><em>OTHER FREQUENCIES.</em></h2>
            </div>
            <p>Direct archive pulls from 5D, Bobbyjackets, and DJ Hideaf. Choose a channel. Run the whole tape.</p>
          </div>
          <div className="mix-archive-groups">
            <div className="mix-archive-group jungle-archive-group">
              <div className="mix-archive-group-heading"><span>ARCHIVE CHANNEL / 5D BASS</span><h3>DnB &amp; <em>Jungle</em></h3><p>Breakbeat pressure, liquid movement, and independent radio signal.</p></div>
              <div className="mix-archive-grid">
                {MIX_ARCHIVE.jungle.map((mix) => (
                  <article className="mix-archive-card" key={mix.id}>
                    <div className="mix-archive-card-head">
                      <img className="mix-archive-cover" src={mix.cover} alt={`Cover artwork for ${mix.title}`} />
                      <div><span className="mix-archive-id">{mix.id}</span><div className="mix-archive-titleline"><Disc3 size={25} /><div><h4>{mix.title}</h4><strong>{mix.artist}</strong></div></div></div>
                    </div>
                    <span className="mix-catalog-stamp">5D ARCHIVE / DIRECT DUBPLATE / {mix.id}</span>
                    <p>{mix.description}</p>
                    <div className="mix-archive-actions"><audio controls preload="metadata" src={mix.file} aria-label={`Play ${mix.title} by ${mix.artist}`}>Your browser does not support direct audio playback.</audio><a href={mix.file} download={mix.downloadName} className="mix-download" aria-label={`Download ${mix.title} by ${mix.artist}`}><Download size={15} /><span>MP3</span></a><button type="button" className="mix-share" onClick={() => { setSharedMixId(mix.id); setMixShareStatus("idle"); }} aria-label={`Open share card for ${mix.title} by ${mix.artist}`}><Share2 size={15} /><span>SHARE</span></button></div>
                  </article>
                ))}
              </div>
            </div>
            <div className="mix-archive-group house-archive-group">
              <div className="mix-archive-group-heading"><span>ARCHIVE CHANNEL / BOBBYJACKETS</span><h3>House <em>Transmissions</em></h3><p>Festival energy, deep-house travel, and a four-part progressive live-house sequence.</p></div>
              <div className="mix-archive-grid mix-archive-grid-house">
                {MIX_ARCHIVE.house.map((mix) => (
                  <article className="mix-archive-card" key={mix.id}>
                    <div className="mix-archive-card-head">
                      <img className="mix-archive-cover" src={mix.cover} alt={`Cover artwork for ${mix.title}`} />
                      <div><span className="mix-archive-id">{mix.id}</span><div className="mix-archive-titleline"><Music2 size={24} /><div><h4>{mix.title}</h4><strong>{mix.artist}</strong></div></div></div>
                    </div>
                    <span className="mix-catalog-stamp">5D ARCHIVE / LIVE CUT / {mix.id}</span>
                    <p>{mix.description}</p>
                    <div className="mix-archive-actions"><audio controls preload="metadata" src={mix.file} aria-label={`Play ${mix.title} by ${mix.artist}`}>Your browser does not support direct audio playback.</audio><a href={mix.file} download={mix.downloadName} className="mix-download" aria-label={`Download ${mix.title} by ${mix.artist}`}><Download size={15} /><span>MP3</span></a><button type="button" className="mix-share" onClick={() => { setSharedMixId(mix.id); setMixShareStatus("idle"); }} aria-label={`Open share card for ${mix.title} by ${mix.artist}`}><Share2 size={15} /><span>SHARE</span></button></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Dialog open={Boolean(activeShareMix)} onOpenChange={(open) => { if (!open) setSharedMixId(null); }}>
          {activeShareMix && (
            <DialogContent className="mix-share-dialog" aria-describedby={undefined}>
              <DialogTitle className="sr-only">Share {activeShareMix.title}</DialogTitle>
              <article className="mix-share-card">
                <img src={activeShareMix.cover} alt={`Cover artwork for ${activeShareMix.title}`} />
                <div className="mix-share-card-copy">
                  <span>5D / SHARED TRANSMISSION</span>
                  <h3>{activeShareMix.title}</h3>
                  <strong>{activeShareMix.artist}</strong>
                  <a href="#top">{MIX_SHARE_CALL_TO_ACTION}</a>
                  <button type="button" onClick={() => void shareArchiveMix(activeShareMix)}><Share2 size={17} />{mixShareStatus === "copied" ? "LINK COPIED" : "SHARE THIS MIX"}</button>
                </div>
              </article>
            </DialogContent>
          )}
        </Dialog>

        <section id="projects" className="projects-section" aria-labelledby="projects-title">
          <div className="section-heading section-heading-dark">
            <div>
              <p className="eyebrow"><Radio size={15} /> FORTHCOMING / 03</p>
              <h2 id="projects-title">UPCOMING<br /><em>PROJECTS.</em></h2>
            </div>
            <p>Stay tuned. The next bass-heavy playground is already under construction.</p>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <img src={project.image} alt="" />
                <div className="project-shade" />
                <div className="project-content">
                  <span className="project-id">{project.id}</span>
                  <h3>{project.title}</h3>
                  <p>{project.detail}</p>
                  <span className="project-status"><i /> {project.status}</span>
                </div>
              </article>
            ))}
          </div>
          <article className="matrix-preview" aria-labelledby="matrix-title">
            <div className="matrix-art-window" aria-hidden="true">
              <img src="/manus-storage/dimension-performance-matrix_c45b9b28.png" alt="" />
            </div>
            <div className="matrix-scrim" aria-hidden="true" />
            <div className="matrix-content">
              <p className="matrix-kicker"><Zap size={14} fill="currentColor" /> PROTECTED PREVIEW / DPM</p>
              <h3 id="matrix-title">THE DIMENSION<br /><em>PERFORMANCE MATRIX.</em></h3>
              <p>A new 5D way to categorize and mix: mapping harmonic movement, energy, atmosphere, and purpose so every set can evolve toward the ultimate vibe.</p>
              <div className="matrix-lockline"><span>FULL SYSTEM ENCRYPTED</span><i /><span>PROTOTYPE IN MOTION</span></div>
            </div>
            <div className="matrix-seal" aria-hidden="true"><strong>5D</strong><span>SEALED<br />SIGNAL</span></div>
          </article>
          <article id="exclusive" className="exclusive-release" aria-labelledby="exclusive-title">
            <div className="exclusive-band">
              <p className="exclusive-meta"><Music2 size={15} /> 5D EXCLUSIVE / 001 <i /> DIRECT FILE DROP</p>
              <h3 id="exclusive-title">{EXCLUSIVE_RELEASE.title}</h3>
              <p className="exclusive-artist">
                <span>ARTIST CREDIT</span>
                <strong>5TH DIMENSION · SKAVO</strong>
                <em>FEATURING MC MESTUP</em>
              </p>
            </div>
            <div className="exclusive-track">
              {downloadUnlocked && (
                <div
                  className={`download-unlock-banner${isUnlockCelebrating ? " is-celebrating" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="unlock-sparks" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>
                  <Sparkles size={19} />
                  <div><strong>FREE DOWNLOAD UNLOCKED</strong><span>25 RECORDS CAUGHT — THE SIGNAL IS YOURS.</span></div>
                  <div className={`unlock-waveform${isUnlockCelebrating ? " is-active" : ""}`} aria-hidden="true">
                    {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
                  </div>
                </div>
              )}
              <p className="exclusive-description">One for the late set: a fresh signal delivered direct from the dimension. Collect 25 records in Selectah Showdown to unlock the free complete track download.</p>
              {downloadUnlocked ? (
                <div className="exclusive-listen-actions">
                  <audio
                    ref={exclusiveAudioRef}
                    src={EXCLUSIVE_RELEASE.url}
                    preload="metadata"
                    onPlay={() => setIsExclusivePlaying(true)}
                    onPause={() => setIsExclusivePlaying(false)}
                    onEnded={() => setIsExclusivePlaying(false)}
                  />
                  <button
                    type="button"
                    className={`exclusive-listen-button${isExclusivePlaying ? " is-playing" : ""}`}
                    onClick={toggleExclusivePlayback}
                    aria-pressed={isExclusivePlaying}
                    aria-label={isExclusivePlaying ? "Pause Jersh In Case" : "Play Jersh In Case"}
                  >
                    {isExclusivePlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    <span>{isExclusivePlaying ? "Pause track" : "Listen now"}</span>
                  </button>
                  <a className={`exclusive-download${isUnlockCelebrating ? " is-revealing" : ""}`} href={EXCLUSIVE_RELEASE.url} download="Jersh In Case — 5th Dimension, Skavo featuring MC Mestup.mp3">
                    <span>Download MP3</span><ArrowDownRight size={19} />
                  </a>
                  <button type="button" className="exclusive-share-button" onClick={shareGameLink}>
                    <Share2 size={17} />
                    <span>{shareStatus === "copied" ? "Game link copied" : "Share game"}</span>
                  </button>
                </div>
              ) : (
                <div className="exclusive-locked" role="status">
                  <ShieldAlert size={18} /> <span>Collect 25 records in Selectah Showdown to unlock the free download.</span>
                </div>
              )}
              <span className="exclusive-file-info">MP3 / {EXCLUSIVE_RELEASE.duration} / LISTEN OR DOWNLOAD</span>
            </div>
            <div className="download-box-edge-paint" aria-hidden="true">
              <svg viewBox="0 0 1000 210" preserveAspectRatio="none" focusable="false">
                <path className="release-paint-base" d="M0 0H1000V28C985 28 983 52 970 53C955 54 961 178 945 178C929 178 937 40 919 42C899 43 903 72 888 72C868 72 875 35 850 36C828 36 836 145 820 145C804 145 809 42 790 42C771 42 778 87 758 87C738 87 744 33 721 34C700 35 708 198 689 198C671 198 678 45 658 46C641 47 642 99 626 99C608 99 616 31 590 34C568 36 571 128 553 128C534 128 542 44 523 44C504 44 509 73 490 73C474 73 478 30 454 31C431 32 438 157 420 157C402 157 408 42 385 42C365 42 373 81 352 81C331 81 338 28 315 30C294 31 301 112 284 112C264 112 271 42 251 43C231 44 235 82 217 82C196 82 203 32 176 34C153 35 160 192 141 192C121 192 130 45 106 45C84 45 92 97 69 97C47 97 56 30 26 31C11 32 10 58 0 56Z" />
                <path className="release-paint-shadow" d="M132 30C143 42 148 68 148 130C148 173 145 190 141 192C121 192 130 45 106 45C117 44 126 39 132 30ZM411 30C423 45 428 70 428 115C428 144 424 155 420 157C402 157 408 42 385 42C396 41 405 36 411 30ZM680 28C696 47 699 92 699 152C698 186 694 196 689 198C671 198 678 45 658 46C668 44 675 37 680 28ZM936 30C947 43 953 71 952 128C950 164 948 175 945 178C929 178 937 40 919 42C926 40 932 36 936 30Z" />
                <path className="release-paint-highlight" d="M16 12C33 6 49 9 62 18M176 12C192 7 210 10 224 19M319 12C336 7 350 10 364 19M457 12C474 7 491 10 505 19M589 12C606 7 622 10 636 19M722 12C738 7 754 10 768 19M853 12C870 7 886 10 900 19" />
                <g className="release-paint-splatter"><circle cx="109" cy="184" r="4" /><circle cx="180" cy="151" r="3" /><circle cx="430" cy="181" r="4" /><circle cx="674" cy="176" r="3" /><circle cx="954" cy="166" r="4" /></g>
              </svg>
            </div>
          </article>
        </section>

        {/* The exclusive drop hands visitors directly into Selectah Showdown. */}
        <div className="arcade-flow-shell">
          <DjMiniGame
            downloadUnlocked={downloadUnlocked}
            onUnlockDownload={unlockDownload}
            onAchievementFlowComplete={settleAchievementFlow}
            isUnlockCelebrating={isUnlockCelebrating}
            supporterGateRequired={requiresSupporterConfirmation}
            onSupporterConfirmed={confirmSupporterAccess}
          />
        </div>

        <section id="visuals" className="visuals-section" aria-labelledby="visuals-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><Disc3 size={15} /> VISUALS ARCHIVE / 04</p>
              <h2 id="visuals-title">ART FROM THE<br /><em>OTHER SIDE.</em></h2>
            </div>
            <p>Fragments from the 5D visual universe: tags, tape, static, and midnight colour.</p>
          </div>
          <div className="art-grid">
            {art.map((item, index) => (
              <figure className={`art-card ${item.className}`} key={item.label}>
                <button
                  type="button"
                  className="art-lightbox-trigger"
                  aria-haspopup="dialog"
                  aria-label={`Open ${item.label} artwork`}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img src={item.src} alt={item.alt} />
                </button>
                <figcaption>{item.label}<ArrowUpRight size={15} /></figcaption>
              </figure>
            ))}
          </div>
          <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
            <DialogContent className="lightbox-dialog" showCloseButton>
              {activeArt && lightboxIndex !== null && (
                <>
                  <DialogTitle className="lightbox-title">{activeArt.label}</DialogTitle>
                  <DialogDescription className="lightbox-description">
                    Artwork {lightboxIndex + 1} of {art.length}. Use the browse controls or keyboard direction keys to navigate.
                  </DialogDescription>
                  <div className="lightbox-stage">
                    <img src={activeArt.src} alt={activeArt.alt} className="lightbox-image" />
                    <div className="lightbox-controls" aria-label="Artwork navigation">
                      <button
                        type="button"
                        className="lightbox-nav"
                        aria-label="Previous artwork"
                        onClick={() => setLightboxIndex((lightboxIndex - 1 + art.length) % art.length)}
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <span>{activeArt.label}</span>
                      <button
                        type="button"
                        className="lightbox-nav"
                        aria-label="Next artwork"
                        onClick={() => setLightboxIndex((lightboxIndex + 1) % art.length)}
                      >
                        <ChevronRight size={22} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </section>

        <section id="booking" className="booking-section" aria-labelledby="booking-title">
          <div className="booking-signal" aria-hidden="true"><span>GIG</span><strong>5D</strong><span>CALL</span></div>
          <div className="booking-copy">
            <p className="eyebrow"><Zap size={15} fill="currentColor" /> BOOKING INQUIRIES / LIVE CHANNEL</p>
            <h2 id="booking-title">BRING THE<br /><em>FREQUENCY.</em></h2>
            <p>Send the date, place, and room details. The outgoing subject is stamped <strong>“BOOKING!”</strong> before your signal.</p>
            <a className="booking-email" href={`mailto:${BOOKING_EMAIL}`}><Mail size={18} /> {BOOKING_EMAIL}</a>
          </div>
          <form className="booking-form" onSubmit={openBookingEmail}>
            <label htmlFor="booking-subject">Your subject <span>*</span></label>
            <input
              id="booking-subject"
              required
              value={bookingSubject}
              onChange={(event) => setBookingSubject(event.target.value)}
              placeholder="e.g. Friday night booking"
            />
            <div className="booking-optional-grid">
              <div>
                <label htmlFor="booking-event-date">Proposed event date <span>(optional)</span></label>
                <input
                  id="booking-event-date"
                  type="date"
                  value={bookingEventDate}
                  onChange={(event) => setBookingEventDate(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="booking-event-location">Event location <span>(optional)</span></label>
                <input
                  id="booking-event-location"
                  value={bookingEventLocation}
                  onChange={(event) => setBookingEventLocation(event.target.value)}
                  placeholder="City, venue, or region"
                />
              </div>
            </div>
            <label htmlFor="booking-message">Your message <span>(optional)</span></label>
            <textarea
              id="booking-message"
              rows={5}
              value={bookingMessage}
              onChange={(event) => setBookingMessage(event.target.value)}
              placeholder="Set time, crowd, budget, and any key details."
            />
            <button type="submit" className="booking-submit">Create booking email <ArrowUpRight size={18} /></button>
            <p className="booking-note">Generated subject: <b>BOOKING! — {bookingSubject || "Your subject"}</b><br />Date and location are optional and will be added to the email body.</p>
          </form>
        </section>


        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-grid-bg" aria-hidden="true" />
          <div className="contact-content">
            <p className="eyebrow"><Zap size={15} fill="currentColor" /> OPEN CHANNEL / 05</p>
            <h2 id="contact-title">LOCK INTO<br /><em>THE FREQUENCY.</em></h2>
            <p>Choose a live channel for bookings, collabs, set intel, and after-dark signals.</p>
            <div className="contact-actions">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="contact-link"><Instagram size={21} /><span>Instagram</span><ArrowUpRight size={18} /></a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="contact-link"><Facebook size={21} /><span>Facebook</span><ArrowUpRight size={18} /></a>
              <a href={SOUND_CLOUD_PROFILE} target="_blank" rel="noreferrer" className="contact-link"><Mail size={21} /><span>SoundCloud</span><ArrowUpRight size={18} /></a>
            </div>
          </div>
          <div className="contact-logo-wrap">
            <img src="/manus-storage/5th-dimension-graffiti-mark_f607b9d3.png" alt="5th Dimension graffiti mark" />
          </div>
        </section>

      </main>

      <footer className="dj-footer">
        <span><b className="footer-5d">5D</b> © 5TH DIMENSION</span>
        <span>JUNGLE BREAKS / HIP-HOP GROOVES / BASSLINE PRESSURE</span>
        <a href="#top">BACK TO THE TOP <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  );
}
