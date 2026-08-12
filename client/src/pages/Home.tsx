/**
 * Archive-faithful 5th Dimension transmission: street-poster collage, bass-first hierarchy, and signal-colour motion.
 */
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Facebook,
  Instagram,
  Mail,
  Menu,
  Music2,
  Radio,
  ShieldAlert,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  BOOKING_EMAIL,
  createBookingMailto,
  EXCLUSIVE_RELEASE,
  FACEBOOK_URL,
  FUTURE_MIX_CHANNELS,
  INSTAGRAM_URL,
  MIXCLOUD_EMBED,
  MIXCLOUD_PROFILE,
  SOUND_CLOUD_EMBED,
  SOUND_CLOUD_PROFILE,
} from "@/lib/djLinks";
import DjMiniGame from "@/components/DjMiniGame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const DOWNLOAD_UNLOCK_STORAGE_KEY = "5d-selector-showdown-download-unlocked";

const projects = [
  {
    id: "TRANSMISSION 01",
    title: "New frequency loading",
    detail: "A fresh 5th Dimension mix is taking shape between breakbeat pressure, bassline weight, and late-night jungle heat.",
    status: "In the lab",
    image: "/manus-storage/graffiti-collage_bac19afe.png",
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [bookingEventDate, setBookingEventDate] = useState("");
  const [bookingEventLocation, setBookingEventLocation] = useState("");
  const activeArt = lightboxIndex === null ? null : art[lightboxIndex];

  useEffect(() => {
    try {
      setDownloadUnlocked(window.localStorage.getItem(DOWNLOAD_UNLOCK_STORAGE_KEY) === "true");
    } catch {
      // Local storage may be unavailable in private or restricted browser contexts.
    }
  }, []);

  const unlockDownload = () => {
    setDownloadUnlocked(true);
    try {
      window.localStorage.setItem(DOWNLOAD_UNLOCK_STORAGE_KEY, "true");
    } catch {
      // Keep the unlocked state for the current session when storage is unavailable.
    }
  };

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
          <b className="mini-5d">5D</b>
          <span>5D / BASS TRANSMISSION</span>
        </a>
        <nav className="dj-nav" aria-label="Main navigation">
          <a href="#listen">Listen</a>
          <a href="#bio">Bio</a>
          <a href="#projects">Projects</a>
          <a href="#visuals">Visuals</a>
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
          <span className="graffiti-flare flare-right" role="img" tabIndex={0} aria-label="Ragga, amen and bass flare">RAGGA / AMEN / BASS</span>
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
            <p>Drop the needle, hit play, and let the subwoofers tell the story.</p>
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
              <div className="deck-topline"><span>MC / SECONDARY DECK</span><span className="live-chip"><i /> FEATURED MIX</span></div>
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

        <section id="other-mixes" className="genre-mixes-section" aria-labelledby="genre-mixes-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><Disc3 size={15} /> MORE ROOMS / 01B</p>
              <h2 id="genre-mixes-title">HOUSE MIXES &amp;<br /><em>OTHER FREQUENCIES.</em></h2>
            </div>
            <p>Future channels are standing by. New house sets, genre detours, and special sessions will appear here when the links land.</p>
          </div>
          <div className="genre-mix-grid">
            {FUTURE_MIX_CHANNELS.map((channel) => (
              <article className="genre-mix-card" key={channel.id}>
                <span className="genre-mix-id">{channel.id}</span>
                <div className="genre-mix-static" aria-hidden="true"><Disc3 size={34} /><span>LINK<br />PENDING</span></div>
                <h3>{channel.title}</h3>
                <p>{channel.description}</p>
                <span className="genre-mix-status"><i /> Awaiting the next drop</span>
              </article>
            ))}
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
          <article className="exclusive-release" aria-labelledby="exclusive-title">
            <div className="exclusive-band">
              <p className="exclusive-meta"><Music2 size={15} /> 5D EXCLUSIVE / 001 <i /> DIRECT FILE DROP</p>
              <h3 id="exclusive-title">{EXCLUSIVE_RELEASE.title}</h3>
              <p className="exclusive-artist">{EXCLUSIVE_RELEASE.artist}</p>
            </div>
            <div className="exclusive-track">
              <p className="exclusive-description">One for the late set: a fresh signal delivered direct from the dimension. Collect 5 records in Selector Showdown to unlock the free complete track download.</p>
              {downloadUnlocked ? (
                <a className="exclusive-download" href={EXCLUSIVE_RELEASE.url} download="Jersh in Case — 5th Dimension, Skavo featuring MestUp.mp3">
                  <span>Download Jersh in Case</span><ArrowDownRight size={19} />
                </a>
              ) : (
                <div className="exclusive-locked" role="status">
                  <ShieldAlert size={18} /> <span>Collect 5 records in Selector Showdown to unlock the free download.</span>
                </div>
              )}
              <span className="exclusive-file-info">MP3 / {EXCLUSIVE_RELEASE.duration} / DIRECT DOWNLOAD</span>
            </div>
          </article>
        </section>

        <DjMiniGame onUnlockDownload={unlockDownload} />

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
                    Artwork {lightboxIndex + 1} of {art.length}. Use the arrow buttons or keyboard arrows to browse.
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
            <p>For bookings, event enquiries, guest spots, and collaborative transmissions, send a quick signal. Your email client will open with the subject automatically marked <strong>“BOOKING!”</strong> before your subject.</p>
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
            <p>For bookings, collabs, set information, and everything that belongs after dark, hit one of the live channels below.</p>
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
