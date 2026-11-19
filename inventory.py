#!/usr/bin/env python3
"""5D DPM proof of concept (stdlib core; mutagen/librosa optional).

Design rules:
  * Read-only on music and Serato files. Only writes its own SQLite DB.
  * Metadata first: stat -> duration -> eligibility. No hashing/decoding until needed.
  * Missing drives never delete records; files are only flagged missing.
  * Only dimensions that can be (proxy-)measured are scored; the rest stay NULL.
  * Scores are percentile ranks WITHIN YOUR LIBRARY, and stage output is a
    distance ranking from provisional prototypes -- not a calibrated probability.

Usage:
  python dpm_poc.py scan ~/Music /Volumes/23 [--min 90 --max 900]
  python dpm_poc.py crates            # read Serato crates (read-only)
  python dpm_poc.py analyze --limit 50   # needs: pip install librosa soundfile
  python dpm_poc.py predict
  python dpm_poc.py selftest
"""
import argparse, bisect, json, math, os, re, sqlite3, struct, sys, time
from pathlib import Path

DB_PATH = Path.home() / ".5d_dpm" / "inventory.sqlite3"
EXTS = {".mp3", ".wav", ".flac", ".aiff", ".aif", ".m4a", ".aac", ".ogg", ".opus"}
SKIP_DIRS = {"Library", "Applications", "System", "node_modules", "_Serato_", "Backups.backupdb"}
SKIP_SUFFIX = (".app", ".photoslibrary", ".logicx", ".band")

# ---------------------------------------------------------------- Camelot ----
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLAT = {"DB": "C#", "EB": "D#", "GB": "F#", "AB": "G#", "BB": "A#"}

def camelot(pitch_class: int, mode: str) -> str:
    """Derived from the circle of fifths instead of a hand-typed table.
    C major = 8B; each fifth up adds 1. Minor uses its relative major (tonic + 3)."""
    major_pc = pitch_class if mode == "major" else (pitch_class + 3) % 12
    return f"{(7 + 7 * major_pc) % 12 + 1}{'B' if mode == 'major' else 'A'}"

def normalize_key(text: str):
    """Tag text ('Am', 'F# minor', '8A', 'Db') -> Camelot code, or None."""
    t = text.strip()
    m = re.fullmatch(r"(1[0-2]|[1-9])([ABab])", t)
    if m:
        return f"{m.group(1)}{m.group(2).upper()}"
    m = re.fullmatch(r"([A-Ga-g])([#b♯♭]?)\s*(m|min|minor|maj|major)?", t)
    if not m:
        return None
    name = m.group(1).upper() + {"♯": "#", "♭": "b"}.get(m.group(2), m.group(2))
    name = FLAT.get(name.upper(), name) if name.endswith("b") else name
    if name not in NOTES:
        return None
    mode = "minor" if (m.group(3) or "").lower() in ("m", "min", "minor") else "major"
    return camelot(NOTES.index(name), mode)

# ---------------------------------------------------------------- Database ---
SCHEMA = [  # one entry per user_version; append only -> safe upgrades
    """
    CREATE TABLE tracks(
      id INTEGER PRIMARY KEY, path TEXT UNIQUE NOT NULL, size INTEGER, mtime_ns INTEGER,
      duration REAL, duration_source TEXT, status TEXT NOT NULL,
      last_seen REAL, missing INTEGER DEFAULT 0);
    CREATE TABLE tags(track_id INTEGER, field TEXT, value TEXT, source TEXT,
      PRIMARY KEY(track_id, field, source));
    CREATE TABLE features(track_id INTEGER, name TEXT, value REAL, kind TEXT,
      method TEXT, version INTEGER, PRIMARY KEY(track_id, name, version));
    CREATE TABLE labels(id INTEGER PRIMARY KEY, track_id INTEGER, stage TEXT,
      source TEXT DEFAULT 'manual', ts REAL);          -- append-only history
    CREATE TABLE crate_tracks(crate TEXT, path TEXT, source_file TEXT);
    """,
    """
    CREATE TABLE predictions(
      track_id INTEGER NOT NULL, model_version TEXT NOT NULL, reference_id TEXT NOT NULL,
      payload TEXT NOT NULL, created REAL NOT NULL,
      PRIMARY KEY(track_id,model_version,reference_id));
    """,
]

def connect(path=DB_PATH):
    if str(path) != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    v = conn.execute("PRAGMA user_version").fetchone()[0]
    if v > len(SCHEMA):
        conn.close()
        raise ValueError('Inventory database is newer than this app')
    for i in range(v, len(SCHEMA)):
        conn.executescript("BEGIN IMMEDIATE;\n" + SCHEMA[i] + f"\nPRAGMA user_version={i + 1};\nCOMMIT;")
    conn.commit()
    return conn

# ---------------------------------------------------------------- Scanning ---
def duration_of(p: Path):
    """Header-only duration. Returns (seconds|None, source|None)."""
    try:
        import mutagen
        f = mutagen.File(str(p))
        d = getattr(getattr(f, "info", None), "length", None)
        if d and math.isfinite(d) and d > 0:
            return float(d), "mutagen"
    except Exception:
        pass
    if p.suffix.lower() == ".wav":
        try:
            import wave
            with wave.open(str(p)) as w:
                return w.getnframes() / w.getframerate(), "wave"
        except Exception:
            pass
    return None, None

def read_key_bpm_tags(p: Path):
    out = {}
    try:
        import mutagen
        f = mutagen.File(str(p))
        for k, v in (getattr(f, "tags", None) or {}).items():
            kl = str(k).lower()
            from tempo import scalar_tag
            val = scalar_tag(v)
            if val is None: continue
            if kl in ("tbpm", "bpm", "tmpo", "tempo", "----:com.apple.itunes:bpm"):
                out["bpm"] = val
            elif kl in ("tkey", "initialkey", "key", "----:com.apple.itunes:initialkey", "----:com.apple.itunes:key"):
                out["key"] = val
    except Exception:
        pass
    return out

def status_for(d, lo, hi):
    if d is None:
        return "unknown_duration"          # explicit, never silently dropped
    return "too_short" if d < lo else "too_long" if d > hi else "eligible"

def scan(conn, roots, lo=90, hi=900, log=print, duration_reader=None):
    if not (math.isfinite(lo) and math.isfinite(hi) and 0 <= lo <= hi):
        raise ValueError('Invalid duration range')
    ts = time.time()
    for root in map(lambda r: Path(r).expanduser().resolve(), roots):
        if not root.is_dir():
            log(f"[skip] root unavailable, existing records kept: {root}")
            continue
        n = 0
        failures = []
        for base, dirs, files in os.walk(root, followlinks=False, onerror=failures.append):
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in SKIP_DIRS
                       and not d.endswith(SKIP_SUFFIX)]
            for name in files:
                if name.startswith(".") or Path(name).suffix.lower() not in EXTS:
                    continue
                p = Path(base) / name
                try:
                    if p.is_symlink():
                        continue
                    st = p.stat()
                except OSError as exc:
                    failures.append(exc)
                    continue
                row = conn.execute("SELECT id,size,mtime_ns,duration FROM tracks WHERE path=?",
                                   (str(p),)).fetchone()
                if row and row[1] == st.st_size and row[2] == st.st_mtime_ns:
                    conn.execute("UPDATE tracks SET last_seen=?,missing=0,status=? WHERE id=?",
                                 (ts, status_for(row[3], lo, hi), row[0]))   # cache hit
                else:
                    d, src = (duration_reader or duration_of)(p)
                    conn.execute(
                        "INSERT INTO tracks(path,size,mtime_ns,duration,duration_source,status,last_seen)"
                        " VALUES(?,?,?,?,?,?,?) ON CONFLICT(path) DO UPDATE SET size=excluded.size,"
                        "mtime_ns=excluded.mtime_ns,duration=excluded.duration,"
                        "duration_source=excluded.duration_source,status=excluded.status,"
                        "last_seen=excluded.last_seen,missing=0",
                        (str(p), st.st_size, st.st_mtime_ns, d, src, status_for(d, lo, hi), ts))
                    tid = conn.execute("SELECT id FROM tracks WHERE path=?", (str(p),)).fetchone()[0]
                    # Never reuse features or old metadata for changed bytes.
                    conn.execute("DELETE FROM features WHERE track_id=?", (tid,))
                    conn.execute("DELETE FROM tags WHERE track_id=? AND source='file_tag'", (tid,))
                    for field, val in read_key_bpm_tags(p).items():
                        shown = normalize_key(val) if field == "key" else val
                        conn.execute("INSERT OR REPLACE INTO tags VALUES(?,?,?,?)",
                                     (tid, field, shown or val, "file_tag"))
                n += 1
                if n % 200 == 0:
                    conn.commit()
                    log(f"  {n} files seen under {root}")
        # flag (never delete) files under an AVAILABLE root that were not seen this pass
        prefix = str(root) + "/"
        if not failures and root.is_dir():
            conn.execute("UPDATE tracks SET missing=1 WHERE substr(path,1,?)=? AND last_seen<?",
                         (len(prefix), prefix, ts))
        else:
            log(f"[warn] incomplete scan of {root}; missing flags unchanged")
        conn.commit()
        log(f"[done] {root}: {n} audio files")

# ------------------------------------------------- Serato (read-only) --------
def _chunks(buf):
    i = 0
    while i + 8 <= len(buf):
        tag = buf[i:i + 4].decode("ascii", "replace")
        (n,) = struct.unpack(">I", buf[i + 4:i + 8])
        if i + 8 + n > len(buf):
            raise ValueError('Truncated crate chunk')
        yield tag, buf[i + 8:i + 8 + n]
        i += 8 + n
    if i != len(buf):
        raise ValueError('Trailing incomplete crate header')

def read_crate(path: Path):
    """Parse a Serato .crate: 4-byte tag + 4-byte big-endian length; 'otrk' wraps 'ptrk'
    holding a UTF-16BE path (relative to the volume root). Format knowledge is from
    community reverse engineering -- verify against your Serato version before relying on it."""
    tracks = []
    for tag, body in _chunks(Path(path).read_bytes()):   # opened read-only
        if tag == "otrk":
            for t2, b2 in _chunks(body):
                if t2 == "ptrk":
                    tracks.append(b2.decode("utf-16-be"))
    return tracks

def crate_track_path(volume, text):
    if not text or '\x00' in text:
        raise ValueError('Invalid crate path')
    # Resolve volume-relative paths without allowing absolute paths to discard
    # the external drive prefix or parent components to escape it.
    relative = Path(text.lstrip('/'))
    if '..' in relative.parts:
        raise ValueError('Parent traversal in crate path')
    return Path(volume) / relative

def serato_roots():
    roots = [(Path.home() / "Music" / "_Serato_", Path("/"))]
    vols = Path("/Volumes")
    if vols.is_dir():
        roots += [(v / "_Serato_", v) for v in vols.iterdir() if (v / "_Serato_").is_dir()]
    return roots

def import_crates(conn, log=print):
    for sdir, volume in serato_roots():
        for f in sorted((sdir / "Subcrates").glob("*.crate")):
            try:
                paths = [str(crate_track_path(volume,p)) for p in read_crate(f)]
            except Exception as e:
                log(f"[warn] {f.name}: {e}")
                continue
            conn.execute("DELETE FROM crate_tracks WHERE source_file=?", (str(f),))
            conn.executemany("INSERT INTO crate_tracks VALUES(?,?,?)",
                             [(f.stem, p, str(f)) for p in paths])
            log(f"{f.stem}: {len(paths)} tracks")
    conn.commit()

# ------------------------------------------------- Audio features (optional) -
def analyze_audio(path, duration, window=90):
    """Measured features from a centered window (not the full file)."""
    import numpy as np, librosa
    sr = 22050
    y, _ = librosa.load(path, sr=sr, mono=True, offset=max(0, duration / 2 - window / 2), duration=window)
    if len(y) < sr * 10 or np.max(np.abs(y)) < 1e-5:
        raise ValueError("too short or silent")
    S = np.abs(librosa.stft(y)) ** 2
    f = librosa.fft_frequencies(sr=sr)
    tot = S.sum() + 1e-12
    band = lambda a, b: float(S[(f >= a) & (f < b)].sum() / tot)
    rms = librosa.feature.rms(y=y)[0]
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr)
    iv = np.diff(beats)
    reg = float(np.exp(-4 * np.std(iv) / (np.mean(iv) + 1e-9))) if len(iv) > 3 else 0.0
    return {
        "centroid_hz": float(librosa.feature.spectral_centroid(y=y, sr=sr).mean()),
        "rms_db": float(20 * np.log10(np.mean(rms) + 1e-9)),
        "band_sub": band(20, 120), "band_lowmid": band(120, 500),
        "onset_rate": float(len(librosa.onset.onset_detect(onset_envelope=onset, sr=sr)) / (len(y) / sr)),
        "beat_regularity": reg, "tempo_bpm": float(np.atleast_1d(tempo)[0]),
    }

def analyze(conn, limit=50, log=print):
    rows = conn.execute(
        "SELECT id,path,duration FROM tracks WHERE status='eligible' AND missing=0 AND id NOT IN "
        "(SELECT track_id FROM features WHERE version=1) LIMIT ?", (limit,)).fetchall()
    for tid, path, dur in rows:
        try:
            feats = analyze_audio(path, dur)
        except Exception as e:
            log(f"[err] {path}: {e}")
            continue
        conn.executemany("INSERT OR REPLACE INTO features VALUES(?,?,?,?,?,?)",
                         [(tid, k, v, "measured", "librosa-centered-90s", 1) for k, v in feats.items()])
        conn.commit()
        log(f"analyzed {Path(path).name}")

# ------------------------------------------------- DPM proxy scores -----------
# name -> (feature, invert).  PROXIES, not validated measurements of the concept.
PROXY = {"Darkness": ("centroid_hz", True), "Warmth": ("band_lowmid", False),
         "Groove": ("beat_regularity", False), "Energy": ("rms_db", False),
         "Aggression": ("onset_rate", False)}
NAMES = ["Darkness", "Warmth", "Groove", "Aggression", "Emotion", "Vocal Presence", "Energy",
         "Tension", "Release", "Roller Index", "Recovery Potential", "Transition Compatibility"]
# Provisional prototypes copied from v0.3 (guesses, unvalidated). Only PROXY dims are compared.
PROTOTYPES = {
    "Gathering": [5, 7, 5, 2, 6, 4, 3, 3, 4, 4, 8, 6], "Confidence": [4, 7, 8, 4, 5, 5, 6, 5, 5, 7, 6, 8],
    "Peak Hype": [5, 4, 8, 8, 7, 6, 10, 8, 9, 6, 2, 6], "Chaos": [8, 3, 6, 10, 4, 3, 9, 10, 7, 5, 2, 4],
    "Locked In": [6, 5, 10, 5, 4, 2, 7, 5, 4, 10, 5, 9], "Sketch Hours": [10, 3, 8, 5, 3, 1, 5, 6, 3, 9, 5, 7],
    "Rebirth": [3, 9, 6, 3, 10, 6, 6, 5, 9, 4, 8, 6], "Sunrise": [2, 8, 4, 1, 9, 5, 2, 2, 8, 3, 10, 5]}

def library_scores(conn, min_tracks=20):
    cols = {}
    for tid, name, val in conn.execute("SELECT f.track_id,f.name,f.value FROM features f JOIN tracks t ON t.id=f.track_id WHERE f.version=1 AND t.status='eligible' AND t.missing=0"):
        cols.setdefault(name, {})[tid] = val
    required={feature for feature,_ in PROXY.values()}
    ids = set.intersection(*[set(cols.get(name,{})) for name in required])
    ids={tid for tid in ids if all(cols[name][tid] is not None and math.isfinite(cols[name][tid]) for name in required)}
    if len(ids) < min_tracks:
        raise SystemExit(f"Only {len(ids)} analyzed tracks; percentile scores need >= {min_tracks}.")
    out = {tid: {} for tid in ids}
    for dim, (feat, invert) in PROXY.items():
        ranked = sorted(cols[feat][t] for t in ids)
        for t in ids:
            value = cols[feat][t]
            pct = (bisect.bisect_left(ranked,value) + bisect.bisect_right(ranked,value) - 1) / (2 * max(1,len(ranked)-1))
            out[t][dim] = round(10 * ((1 - pct) if invert else pct), 2)
    return out

def rank_stages(scores):
    idx = {n: i for i, n in enumerate(NAMES)}
    d = {s: sum((scores[k] - v[idx[k]]) ** 2 for k in scores) / len(scores) for s, v in PROTOTYPES.items()}
    return sorted(d.items(), key=lambda kv: kv[1])    # smaller distance = closer; NOT a probability

def predict(conn):
    for tid, sc in library_scores(conn).items():
        path = conn.execute("SELECT path FROM tracks WHERE id=?", (tid,)).fetchone()[0]
        (a, da), (b, db) = rank_stages(sc)[:2]
        print(f"{Path(path).name[:48]:48} top1={a} ({da:.1f}) top2={b} ({db:.1f})  {json.dumps(sc)}")

# ------------------------------------------------- Self-test ------------------
def selftest():
    import tempfile, wave
    # Camelot: spot-check known pairs
    for pc, mode, want in [(0, "major", "8B"), (9, "minor", "8A"), (7, "major", "9B"), (11, "major", "1B"),
                           (8, "minor", "1A"), (3, "major", "5B"), (10, "major", "6B"), (2, "minor", "7A")]:
        assert camelot(pc, mode) == want, (pc, mode, camelot(pc, mode), want)
    assert normalize_key("Am") == "8A" and normalize_key("Db") == "3B" and normalize_key("8a") == "8A"
    assert normalize_key("F# minor") == "11A" and normalize_key("nonsense") is None
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        def wav(name, secs):
            with wave.open(str(td / name), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000)
                w.writeframes(b"\x00\x00" * int(8000 * secs))
        wav("short.wav", 30); wav("ok.wav", 120); wav("long.wav", 901); wav("edge90.wav", 90)
        (td / ".hidden").mkdir(); (td / ".hidden" / "x.wav").write_bytes(b"")
        conn = connect(":memory:")
        scan(conn, [td, "/Volumes/__missing_drive__"], log=lambda *_: None)
        st = dict(conn.execute("SELECT substr(path,-9),status FROM tracks").fetchall())
        got = {Path(p).name: s for p, s in conn.execute("SELECT path,status FROM tracks")}
        assert got == {"short.wav": "too_short", "ok.wav": "eligible", "long.wav": "too_long",
                       "edge90.wav": "eligible"}, got
        n = conn.execute("SELECT COUNT(*) FROM tracks").fetchone()[0]
        scan(conn, [td], log=lambda *_: None)                 # rescan: cached, nothing duplicated
        assert conn.execute("SELECT COUNT(*) FROM tracks").fetchone()[0] == n
        (td / "ok.wav").unlink()
        scan(conn, [td], log=lambda *_: None)                 # deleted file: flagged, not removed
        assert conn.execute("SELECT missing FROM tracks WHERE path LIKE '%ok.wav'").fetchone()[0] == 1
        # crate round trip
        def chunk(tag, body): return tag.encode() + struct.pack(">I", len(body)) + body
        crate = chunk("vrsn", "1.0/Serato ScratchLive Crate".encode("utf-16-be")) + b"".join(
            chunk("otrk", chunk("ptrk", p.encode("utf-16-be"))) for p in ["Music/a.mp3", "Music/b.flac"])
        (td / "Test.crate").write_bytes(crate)
        assert read_crate(td / "Test.crate") == ["Music/a.mp3", "Music/b.flac"]
        # scoring math on synthetic features
        conn.execute("DELETE FROM features")
        conn.execute("DELETE FROM tracks")
        for t in range(1, 31):
            conn.execute("INSERT INTO tracks(id,path,status) VALUES(?,?,?)",(t,f"synthetic-{t}","eligible"))
            conn.executemany("INSERT INTO features VALUES(?,?,?,?,?,?)", [
                (t, "centroid_hz", 1000 + 100 * t, "measured", "t", 1), (t, "band_lowmid", t / 30, "measured", "t", 1),
                (t, "beat_regularity", t / 30, "measured", "t", 1), (t, "rms_db", -30 + t, "measured", "t", 1),
                (t, "onset_rate", t / 5, "measured", "t", 1)])
        sc = library_scores(conn)
        assert sc[1]["Darkness"] == 10 and sc[30]["Darkness"] == 0 and sc[30]["Energy"] == 10
        assert rank_stages(sc[30])[0][0] in PROTOTYPES
    print("selftest OK")

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("scan"); s.add_argument("roots", nargs="*", default=[str(Path.home() / "Music")])
    s.add_argument("--min", type=float, default=90); s.add_argument("--max", type=float, default=900)
    a = sub.add_parser("analyze"); a.add_argument("--limit", type=int, default=50)
    sub.add_parser("crates"); sub.add_parser("predict"); sub.add_parser("selftest")
    args = ap.parse_args()
    if args.cmd == "selftest":
        return selftest()
    conn = connect()
    {"scan": lambda: scan(conn, args.roots, args.min, args.max) if args.cmd == "scan" else None,
     "analyze": lambda: analyze(conn, getattr(args, "limit", 50)),
     "crates": lambda: import_crates(conn), "predict": lambda: predict(conn)}[args.cmd]()

if __name__ == "__main__":
    main()
