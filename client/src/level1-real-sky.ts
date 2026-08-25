/*
 * LEVEL 1 FIXED SKY CUTOUT
 *
 * Stack: animated sky -> transparent approved master -> gameplay.
 * The cutout is fixed from the user's checkerboard reference. There is no
 * runtime colour detection, flood-fill, second master, filter, crop or resize.
 *
 * IMPORTANT: the sky is NOT a viewport-sized layer. Its box is calculated from
 * the master's actual rendered object-fit:contain image rect, then given the
 * exact same camera scale. This prevents sky from appearing in contain bars or
 * anywhere outside the checkerboard cutout.
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const CAMERA_SCALE = 1.04;
const processedHosts = new WeakSet<Element>();
const resizeObservers = new WeakMap<Element, ResizeObserver>();

/* Normalized contour traced from the supplied checkerboard sky-removal reference.
   Coordinates are multiplied by each master's natural width/height. */
const SKY_CUTOUT: ReadonlyArray<readonly [number, number]> = [
  [0.3654,0.0069],[0.3593,0.0322],[0.3685,0.0368],[0.3685,0.0575],[0.3609,0.0506],
  [0.3685,0.0736],[0.3685,0.1678],[0.3884,0.1655],[0.3884,0.1448],[0.4021,0.1425],
  [0.4006,0.1609],[0.4220,0.1724],[0.4419,0.2138],[0.4419,0.2782],[0.4343,0.2736],
  [0.4297,0.2989],[0.4419,0.3333],[0.4327,0.3356],[0.4205,0.4368],[0.4343,0.4506],
  [0.4587,0.4483],[0.4786,0.4943],[0.4801,0.4506],[0.4847,0.4598],[0.4924,0.4414],
  [0.5076,0.4414],[0.5183,0.4828],[0.5352,0.4989],[0.5382,0.4805],[0.5398,0.4920],
  [0.5505,0.4805],[0.5550,0.4483],[0.5719,0.4506],[0.5703,0.4230],[0.6024,0.3379],
  [0.6116,0.4184],[0.6254,0.4230],[0.6254,0.4437],[0.6131,0.4414],[0.6300,0.4805],
  [0.6269,0.4506],[0.6376,0.4483],[0.6361,0.3954],[0.6422,0.4069],[0.6498,0.4000],
  [0.6498,0.0092],[0.6407,0.0322],[0.6269,0.0299],[0.6254,0.0069],[0.5948,0.0161],
  [0.6009,0.0276],[0.5917,0.0322],[0.5887,0.0069],[0.5703,0.0069],[0.5550,0.0322],
  [0.5520,0.0069],[0.5336,0.0069],[0.5291,0.0322],[0.5168,0.0069],[0.4969,0.0069],
  [0.4817,0.0322],[0.4786,0.0069],[0.4235,0.0069],[0.4113,0.0276],[0.4067,0.0069],
];

const SKY_CLIP = `polygon(${SKY_CUTOUT.map(([x, y]) => `${(x * 100).toFixed(4)}% ${(y * 100).toFixed(4)}%`).join(",")})`;

const waitForImage = (image: HTMLImageElement) => new Promise<void>((resolve) => {
  if (image.complete && image.naturalWidth && image.naturalHeight) return resolve();
  const finish = () => resolve();
  image.addEventListener("load", finish, { once: true });
  image.addEventListener("error", finish, { once: true });
});

const punchFixedSky = (source: HTMLImageElement): string | null => {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  /* Exact natural dimensions: this changes alpha only, never geometry. */
  ctx.drawImage(source, 0, 0, width, height);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  SKY_CUTOUT.forEach(([nx, ny], index) => {
    const x = nx * width;
    const y = ny * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL("image/png");
};

const syncSkyToMasterImageRect = (host: Element, master: HTMLImageElement, sky: HTMLElement) => {
  const hostRect = host.getBoundingClientRect();
  const naturalWidth = master.naturalWidth;
  const naturalHeight = master.naturalHeight;
  if (!hostRect.width || !hostRect.height || !naturalWidth || !naturalHeight) return;

  /* Match object-fit: contain exactly. The master element fills the host, but the
     actual bitmap may be letterboxed inside it. Sky must live only under that
     bitmap, never under the letterbox. */
  const fit = Math.min(hostRect.width / naturalWidth, hostRect.height / naturalHeight);
  const renderedWidth = naturalWidth * fit;
  const renderedHeight = naturalHeight * fit;
  const left = (hostRect.width - renderedWidth) / 2;
  const top = (hostRect.height - renderedHeight) / 2;

  sky.style.left = `${left}px`;
  sky.style.top = `${top}px`;
  sky.style.width = `${renderedWidth}px`;
  sky.style.height = `${renderedHeight}px`;
  sky.style.transform = `scale(${CAMERA_SCALE})`;
  sky.style.transformOrigin = "50% 50%";
  sky.style.clipPath = SKY_CLIP;
  sky.style.setProperty("-webkit-clip-path", SKY_CLIP);
};

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  if (!masters.length) return;

  await Promise.all(masters.map(waitForImage));
  if (masters.some((master) => !master.naturalWidth || !master.naturalHeight)) return;

  /* One lightweight sky surface only. It contains no copy of the scene and is
     clipped to exactly the same hole cut from the approved master. */
  const sky = document.createElement("span");
  sky.className = "level-one-animated-sky";
  sky.setAttribute("aria-hidden", "true");
  host.insertBefore(sky, host.firstChild);

  const geometryMaster = masters[0];
  syncSkyToMasterImageRect(host, geometryMaster, sky);

  const ro = new ResizeObserver(() => syncSkyToMasterImageRect(host, geometryMaster, sky));
  ro.observe(host);
  resizeObservers.set(host, ro);

  for (const master of masters) {
    const foreground = punchFixedSky(master);
    if (!foreground) continue;
    master.src = foreground;
    master.dataset.levelOneSkyPunched = "fixed-reference";
  }

  host.classList.add("level-one-real-sky-ready");
};

const scan = () => {
  document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => void installOnHost(host));
};

const observer = new MutationObserver(scan);
const start = () => {
  scan();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
