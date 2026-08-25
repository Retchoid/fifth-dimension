/*
 * LEVEL 1 REAL SKY COMPOSITOR
 *
 * True stack:
 *   sky-only pixels -> punched foreground master -> gameplay
 *
 * Nothing is resized. The approved master dimensions, camera, crop and
 * positioning remain untouched. Old CSS/polygon/filter sky paths stay retired.
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const GOLDEN_SELECTOR = ".level-one-master-art-golden";

const processedHosts = new WeakSet<Element>();

type Pixel = { r: number; g: number; b: number };

const pixelAt = (data: Uint8ClampedArray, index: number): Pixel => {
  const offset = index * 4;
  return { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
};

const localDistance = (a: Pixel, b: Pixel) =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

const createSkyMask = (image: HTMLImageElement): Uint8Array | null => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, width, height);

  let pixels: ImageData;
  try {
    pixels = context.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  const mask = new Uint8Array(width * height);
  const queued = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  // The sky is the central opening between the two building masses. Keep the
  // search deliberately conservative so architecture can never be punched out.
  const minX = Math.floor(width * 0.29);
  const maxX = Math.ceil(width * 0.71);
  const maxY = Math.ceil(height * 0.46);

  const enqueue = (x: number, y: number) => {
    if (x < minX || x > maxX || y < 0 || y > maxY) return;
    const index = y * width + x;
    if (queued[index]) return;
    queued[index] = 1;
    queue[tail++] = index;
  };

  // Seeds stay well inside the visible sky and away from roof edges.
  const seedY = Math.max(1, Math.floor(height * 0.09));
  [0.42, 0.46, 0.5, 0.54, 0.58].forEach((ratio) => enqueue(Math.floor(width * ratio), seedY));

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    const current = pixelAt(pixels.data, index);
    mask[index] = 1;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ] as const;

    for (const [nx, ny] of neighbors) {
      if (nx < minX || nx > maxX || ny < 0 || ny > maxY) continue;
      const nextIndex = ny * width + nx;
      if (queued[nextIndex]) continue;
      const next = pixelAt(pixels.data, nextIndex);

      // Sky gradients/clouds remain locally smooth. A much lower threshold than
      // the previous pass prevents the flood-fill from crossing roof/building edges.
      const threshold = y < height * 0.28 ? 42 : 30;
      if (localDistance(current, next) <= threshold) enqueue(nx, ny);
    }
  }

  return mask;
};

const renderWithMask = (
  source: HTMLImageElement,
  mask: Uint8Array,
  mode: "foreground" | "sky",
): string | null => {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  if (!width || !height || mask.length !== width * height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(source, 0, 0, width, height);

  let pixels: ImageData;
  try {
    pixels = context.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  for (let index = 0; index < mask.length; index += 1) {
    const isSky = Boolean(mask[index]);
    const shouldClear = mode === "foreground" ? isSky : !isSky;
    if (shouldClear) pixels.data[index * 4 + 3] = 0;
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
};

const waitForImage = (image: HTMLImageElement) =>
  new Promise<void>((resolve) => {
    if (image.complete && image.naturalWidth) {
      resolve();
      return;
    }
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

  masters.forEach((master) => {
    if (!master.dataset.levelOneOriginalSrc) master.dataset.levelOneOriginalSrc = master.currentSrc || master.src;
  });

  await Promise.all(masters.map(waitForImage));
  if (!golden.naturalWidth || !golden.naturalHeight) return;

  const skyMask = createSkyMask(golden);
  if (!skyMask) return;

  const dusk = host.querySelector<HTMLImageElement>(".level-one-master-art-dusk");
  const night = host.querySelector<HTMLImageElement>(".level-one-master-art-night");

  // Build SKY-ONLY images first. Every non-sky pixel is transparent, so there
  // is no second copy of buildings, street, crowd, car, or foreground behind.
  const sky = document.createElement("div");
  sky.className = "level-one-real-sky";
  sky.setAttribute("aria-hidden", "true");

  const frameSources = [
    ["dusk", dusk],
    ["sunset", golden],
    ["night", night],
  ] as const;

  frameSources.forEach(([name, source]) => {
    if (!source) return;
    const skyOnly = renderWithMask(source, skyMask, "sky");
    if (!skyOnly) return;
    const frame = document.createElement("img");
    frame.className = `level-one-real-sky-frame level-one-real-sky-${name}`;
    frame.src = skyOnly;
    frame.alt = "";
    frame.draggable = false;
    sky.appendChild(frame);
  });

  host.insertBefore(sky, host.firstChild);

  // Each approved master becomes one foreground image with ONLY the real sky
  // pixels transparent. No size/crop/position changes are made.
  masters.forEach((master) => {
    const foreground = renderWithMask(master, skyMask, "foreground");
    if (foreground) {
      master.src = foreground;
      master.dataset.levelOneSkyPunched = "true";
    }
  });

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
