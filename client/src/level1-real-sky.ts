/*
 * LEVEL 1 REAL SKY COMPOSITOR
 *
 * True stack:
 *   sky-only pixels -> transparent foreground master -> gameplay
 *
 * No resizing. The approved master dimensions, object-fit, scale, crop and
 * position remain unchanged. Only pixels confidently identified as the real
 * central sky are made transparent.
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const GOLDEN_SELECTOR = ".level-one-master-art-golden";
const processedHosts = new WeakSet<Element>();

type Pixel = { r: number; g: number; b: number };

const pixelAt = (data: Uint8ClampedArray, index: number): Pixel => {
  const o = index * 4;
  return { r: data[o], g: data[o + 1], b: data[o + 2] };
};

const distanceSq = (a: Pixel, b: Pixel) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
};

const brightness = (p: Pixel) => (p.r + p.g + p.b) / 3;

const createSkyMask = (image: HTMLImageElement): Uint8Array | null => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, width, height);

  let pixels: ImageData;
  try {
    pixels = ctx.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  /* Sample only from positions unquestionably inside the approved centre sky.
     This palette prevents the fill from walking through similarly coloured brick. */
  const palette: Pixel[] = [];
  const sampleXs = [0.42, 0.47, 0.5, 0.53, 0.58];
  const sampleYs = [0.06, 0.11, 0.16, 0.21, 0.26, 0.31];
  for (const xr of sampleXs) {
    for (const yr of sampleYs) {
      const x = Math.min(width - 1, Math.max(0, Math.round(width * xr)));
      const y = Math.min(height - 1, Math.max(0, Math.round(height * yr)));
      palette.push(pixelAt(pixels.data, y * width + x));
    }
  }

  const mask = new Uint8Array(width * height);
  const queued = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const minX = Math.floor(width * 0.31);
  const maxX = Math.ceil(width * 0.69);
  const maxY = Math.ceil(height * 0.43);

  const isSkyCandidate = (index: number, y: number) => {
    const p = pixelAt(pixels.data, index);
    /* Buildings/fire escapes are substantially darker than the Golden sky.
       Keep the threshold conservative; leaving a few baked-sky edge pixels is
       preferable to removing one architecture pixel. */
    if (brightness(p) < (y < height * 0.30 ? 104 : 116)) return false;
    let best = Number.POSITIVE_INFINITY;
    for (const sample of palette) best = Math.min(best, distanceSq(p, sample));
    return best <= 6400; // ~80 RGB units, against the actual sampled sky palette.
  };

  const enqueue = (x: number, y: number) => {
    if (x < minX || x > maxX || y < 0 || y > maxY) return;
    const index = y * width + x;
    if (queued[index] || !isSkyCandidate(index, y)) return;
    queued[index] = 1;
    queue[tail++] = index;
  };

  /* Several seeds inside the real open sky. */
  for (const xr of [0.43, 0.47, 0.5, 0.53, 0.57]) {
    for (const yr of [0.08, 0.14, 0.20]) enqueue(Math.round(width * xr), Math.round(height * yr));
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    mask[index] = 1;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  return mask;
};

const renderWithMask = (source: HTMLImageElement, mask: Uint8Array, mode: "foreground" | "sky") => {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  if (!width || !height || mask.length !== width * height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);

  let pixels: ImageData;
  try {
    pixels = ctx.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  for (let i = 0; i < mask.length; i += 1) {
    const clear = mode === "foreground" ? Boolean(mask[i]) : !mask[i];
    if (clear) pixels.data[i * 4 + 3] = 0;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
};

const waitForImage = (image: HTMLImageElement) => new Promise<void>((resolve) => {
  if (image.complete && image.naturalWidth) return resolve();
  const finish = () => resolve();
  image.addEventListener("load", finish, { once: true });
  image.addEventListener("error", finish, { once: true });
});

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  const golden = host.querySelector<HTMLImageElement>(GOLDEN_SELECTOR);
  if (!golden || masters.length < 4) return;

  await Promise.all(masters.map(waitForImage));
  if (!golden.naturalWidth || !golden.naturalHeight) return;

  const mask = createSkyMask(golden);
  if (!mask) return;

  const dusk = host.querySelector<HTMLImageElement>(".level-one-master-art-dusk");
  const night = host.querySelector<HTMLImageElement>(".level-one-master-art-night");

  const sky = document.createElement("div");
  sky.className = "level-one-real-sky";
  sky.setAttribute("aria-hidden", "true");

  for (const [name, source] of [["dusk", dusk], ["sunset", golden], ["night", night]] as const) {
    if (!source) continue;
    const skyOnly = renderWithMask(source, mask, "sky");
    if (!skyOnly) continue;
    const frame = document.createElement("img");
    frame.className = `level-one-real-sky-frame level-one-real-sky-${name}`;
    frame.src = skyOnly;
    frame.alt = "";
    frame.draggable = false;
    sky.appendChild(frame);
  }
  host.insertBefore(sky, host.firstChild);

  /* Replace each current master in-place with the same-size transparent
     foreground. No CSS sizing/positioning values are changed here. */
  for (const master of masters) {
    const foreground = renderWithMask(master, mask, "foreground");
    if (!foreground) continue;
    master.src = foreground;
    master.dataset.levelOneSkyPunched = "true";
  }

  host.classList.add("level-one-real-sky-ready");
};

const scan = () => document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => void installOnHost(host));
const observer = new MutationObserver(scan);
const start = () => {
  scan();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
