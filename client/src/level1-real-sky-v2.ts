/* LEVEL 1 — EXACT PUNCHED CLONES + EXACT SKY APERTURE
 * Native Golden/Waking/Dusk/Night masters remain untouched as React/state authority.
 * Punched clones are generated from those masters using the approved
 * 5d_level1_no_sky.png alpha. The animated sky is clipped by the exact inverse
 * alpha generated from that same PNG. No polygon approximation, no moving buildings.
 */

const HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const PUNCH_SRC = "/5d_level1_no_sky.png";
const SKY_BASE_SRC = "/assets/level1-painted-sky-recreated.svg";
const CLOUD_SRC = "/assets/level1-painted-sky-transparent-v1.webp";

const installing = new WeakSet<Element>();
const resizers = new WeakMap<Element, ResizeObserver>();
const punchedCache = new Map<string, Promise<string>>();
let punchPromise: Promise<HTMLImageElement> | null = null;
let aperturePromise: Promise<string> | null = null;

const waitForImage = (image: HTMLImageElement) => new Promise<boolean>((resolve) => {
  if (image.complete) return resolve(Boolean(image.naturalWidth && image.naturalHeight));
  image.addEventListener("load", () => resolve(true), { once:true });
  image.addEventListener("error", () => resolve(false), { once:true });
});

const loadImage = async (src: string) => {
  const image = new Image();
  image.src = src;
  if (!(await waitForImage(image))) throw new Error(`Unable to load image: ${src}`);
  return image;
};

const getPunch = () => {
  if (!punchPromise) punchPromise = loadImage(PUNCH_SRC);
  return punchPromise;
};

const objectUrlFromCanvas = (canvas: HTMLCanvasElement) => new Promise<string>((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("Canvas encode failed")), "image/png");
});

const getApertureUrl = () => {
  if (aperturePromise) return aperturePromise;
  aperturePromise = (async () => {
    const punch = await getPunch();
    const canvas = document.createElement("canvas");
    canvas.width = punch.naturalWidth;
    canvas.height = punch.naturalHeight;
    const ctx = canvas.getContext("2d", { alpha:true, willReadFrequently:true });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(punch, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    /* Exact inverse alpha: opaque only where the approved punch is transparent. */
    for (let i = 0; i < data.length; i += 4) {
      const apertureAlpha = 255 - data[i + 3];
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = apertureAlpha;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0);
    return objectUrlFromCanvas(canvas);
  })();
  return aperturePromise;
};

const punchedUrlFor = (src: string) => {
  const cached = punchedCache.get(src);
  if (cached) return cached;
  const promise = (async () => {
    const [master, punch] = await Promise.all([loadImage(src), getPunch()]);
    const canvas = document.createElement("canvas");
    canvas.width = master.naturalWidth;
    canvas.height = master.naturalHeight;
    const ctx = canvas.getContext("2d", { alpha:true });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(master, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(punch, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    return objectUrlFromCanvas(canvas);
  })();
  punchedCache.set(src, promise);
  return promise;
};

const installStyles = () => {
  document.getElementById("level-one-exact-punch-contract")?.remove();
  document.getElementById("level-one-punched-clone-contract")?.remove();
  const style = document.createElement("style");
  style.id = "level-one-punched-clone-contract";
  style.textContent = `
  ${HOST_SELECTOR}{
    isolation:isolate!important;
    overflow:hidden!important;
    background:#050508!important;
  }

  /* Native masters stay in the DOM as state authority but are never painted. */
  ${HOST_SELECTOR} ${MASTER_SELECTOR}{
    visibility:hidden!important;
    pointer-events:none!important;
  }

  ${HOST_SELECTOR} > .level-one-sky-stack-v3,
  ${HOST_SELECTOR} > .level-one-punched-master-stack-v3{
    position:absolute!important;
    inset:0!important;
    pointer-events:none!important;
  }
  ${HOST_SELECTOR} > .level-one-sky-stack-v3{z-index:5!important;overflow:hidden!important}
  ${HOST_SELECTOR} > .level-one-punched-master-stack-v3{z-index:20!important;overflow:visible!important}

  ${HOST_SELECTOR} .level-one-sky-frame-v3,
  ${HOST_SELECTOR} .level-one-punched-master-v3{
    position:absolute!important;
    left:50%!important;
    top:50%!important;
    width:100%!important;
    height:100%!important;
    transform:translate(-50%,-50%) scale(1.04)!important;
    transform-origin:50% 50%!important;
  }

  ${HOST_SELECTOR} .level-one-sky-frame-v3{
    z-index:0!important;
    overflow:hidden!important;
    background:#050508!important;
  }

  ${HOST_SELECTOR} .level-one-sky-base-v3{
    position:absolute!important;
    inset:-8%!important;
    width:116%!important;
    height:116%!important;
    object-fit:cover!important;
    object-position:50% 50%!important;
    animation:none!important;
    transform:none!important;
    transition:filter 2200ms cubic-bezier(.22,.72,.2,1)!important;
  }

  ${HOST_SELECTOR} .level-one-cloud-track-v3{
    position:absolute!important;
    left:-65%!important;
    width:230%!important;
    pointer-events:none!important;
    background-image:url("${CLOUD_SRC}")!important;
    background-repeat:repeat-x!important;
    background-position-y:center!important;
    will-change:background-position!important;
    mix-blend-mode:normal!important;
    transition:filter 2200ms cubic-bezier(.22,.72,.2,1),opacity 1600ms ease!important;
  }
  ${HOST_SELECTOR} .level-one-cloud-track-v3.cloud-near{
    top:2%!important;
    height:37%!important;
    opacity:.34!important;
    background-size:42% 100%!important;
    animation:level-one-cloud-near-v3 28s linear infinite!important;
  }
  ${HOST_SELECTOR} .level-one-cloud-track-v3.cloud-far{
    top:13%!important;
    height:28%!important;
    opacity:.19!important;
    background-size:30% 86%!important;
    animation:level-one-cloud-far-v3 44s linear infinite!important;
  }
  @keyframes level-one-cloud-near-v3{from{background-position-x:-100%}to{background-position-x:0%}}
  @keyframes level-one-cloud-far-v3{from{background-position-x:-132%}to{background-position-x:-12%}}

  ${HOST_SELECTOR} .level-one-punched-master-v3{
    object-fit:contain!important;
    object-position:50% 50%!important;
    opacity:0!important;
    transition:opacity 900ms cubic-bezier(.22,.72,.24,1)!important;
    image-rendering:auto!important;
  }
  ${HOST_SELECTOR}[data-level-one-master-state="golden"] .punched-golden,
  ${HOST_SELECTOR}[data-level-one-master-state="waking"] .punched-waking,
  ${HOST_SELECTOR}[data-level-one-master-state="dusk"] .punched-dusk,
  ${HOST_SELECTOR}[data-level-one-master-state="night"] .punched-night{opacity:1!important}

  /* BIG UP can advance Golden -> Waking before the data-state handoff. */
  .game-viewport.level-one-big-up-reached ${HOST_SELECTOR}[data-level-one-master-state="golden"] .punched-golden{opacity:0!important}
  .game-viewport.level-one-big-up-reached ${HOST_SELECTOR}[data-level-one-master-state="golden"] .punched-waking{opacity:1!important}

  .game-viewport.level-one-time-0 .level-one-sky-base-v3{filter:sepia(.12) saturate(1.10) brightness(1.05) hue-rotate(-10deg)!important}
  .game-viewport.level-one-time-1 .level-one-sky-base-v3{filter:saturate(1.14) brightness(1.01) hue-rotate(-3deg)!important}
  .game-viewport.level-one-time-2 .level-one-sky-base-v3{filter:saturate(1.20) brightness(.94) hue-rotate(7deg)!important}
  .game-viewport.level-one-time-3 .level-one-sky-base-v3{filter:saturate(1.18) brightness(.82) hue-rotate(22deg)!important}
  .game-viewport.level-one-time-4 .level-one-sky-base-v3{filter:saturate(1.10) brightness(.68) hue-rotate(38deg)!important}
  .game-viewport.level-one-time-5 .level-one-sky-base-v3{filter:saturate(.92) brightness(.50) hue-rotate(58deg)!important}

  /* Restore the black cabinet/playfield matte outside the exact sky aperture. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two),
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .game-grid-bg.stage-background,
  ${HOST_SELECTOR}{background-color:#050508!important}

  /* Retire every older sky experiment. */
  ${HOST_SELECTOR} > .level-one-real-sky-stack,
  ${HOST_SELECTOR} > .level-one-real-sky-stack-v2,
  ${HOST_SELECTOR} .level-one-time-sky,
  ${HOST_SELECTOR} .level-one-checkerboard-sky,
  ${HOST_SELECTOR} .level-one-animated-sky,
  ${HOST_SELECTOR} .level-one-original-sky-motion,
  ${HOST_SELECTOR} .level-one-painted-sky-live,
  ${HOST_SELECTOR} .level-one-painted-sky-drift,
  ${HOST_SELECTOR} .level-one-transparent-foreground,
  ${HOST_SELECTOR} [class*="fog"],
  ${HOST_SELECTOR} [class*="mist"]{display:none!important;visibility:hidden!important;opacity:0!important}

  ${HOST_SELECTOR} > .falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  ${HOST_SELECTOR} > .falling-items-layer > .falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  ${HOST_SELECTOR} > .dj-catcher{z-index:32!important}
  ${HOST_SELECTOR} .in-world-reward{z-index:50!important}
  ${HOST_SELECTOR} > .game-overlay{z-index:56!important}
  ${HOST_SELECTOR} > .bonus-level-stage,
  ${HOST_SELECTOR} > .afterparty-runner-stage,
  ${HOST_SELECTOR} > .no-request-splash-overlay,
  ${HOST_SELECTOR} > .no-request-bonus-stage{z-index:58!important}
  `;
  document.head.append(style);
};

const masterKind = (master: HTMLImageElement) => {
  if (master.classList.contains("level-one-master-art-waking")) return "waking";
  if (master.classList.contains("level-one-master-art-dusk")) return "dusk";
  if (master.classList.contains("level-one-master-art-night")) return "night";
  return "golden";
};

const installHost = async (host: Element) => {
  if (installing.has(host)) return;
  installing.add(host);
  try {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (masters.length !== 4) return;
    await Promise.all(masters.map(waitForImage));
    if (!host.isConnected) return;

    host.querySelectorAll(":scope > .level-one-sky-stack-v3,:scope > .level-one-punched-master-stack-v3,:scope > .level-one-real-sky-stack,:scope > .level-one-real-sky-stack-v2").forEach((node) => node.remove());

    const [apertureUrl, punched] = await Promise.all([
      getApertureUrl(),
      Promise.all(masters.map(async (master) => ({ kind:masterKind(master), src:await punchedUrlFor(master.currentSrc || master.src) })))
    ]);
    if (!host.isConnected) return;

    const skyStack = document.createElement("span");
    skyStack.className = "level-one-sky-stack-v3";
    skyStack.setAttribute("aria-hidden", "true");
    const skyFrame = document.createElement("span");
    skyFrame.className = "level-one-sky-frame-v3";
    skyFrame.style.setProperty("-webkit-mask-image", `url("${apertureUrl}")`, "important");
    skyFrame.style.setProperty("mask-image", `url("${apertureUrl}")`, "important");
    skyFrame.style.setProperty("-webkit-mask-size", "100% 100%", "important");
    skyFrame.style.setProperty("mask-size", "100% 100%", "important");
    skyFrame.style.setProperty("-webkit-mask-repeat", "no-repeat", "important");
    skyFrame.style.setProperty("mask-repeat", "no-repeat", "important");
    const skyBase = document.createElement("img");
    skyBase.className = "level-one-sky-base-v3";
    skyBase.src = SKY_BASE_SRC;
    skyBase.alt = "";
    const cloudNear = document.createElement("span");
    cloudNear.className = "level-one-cloud-track-v3 cloud-near";
    const cloudFar = document.createElement("span");
    cloudFar.className = "level-one-cloud-track-v3 cloud-far";
    skyFrame.append(skyBase, cloudFar, cloudNear);
    skyStack.append(skyFrame);

    const masterStack = document.createElement("span");
    masterStack.className = "level-one-punched-master-stack-v3";
    masterStack.setAttribute("aria-hidden", "true");
    punched.forEach(({kind, src}) => {
      const image = document.createElement("img");
      image.className = `level-one-punched-master-v3 punched-${kind}`;
      image.src = src;
      image.alt = "";
      image.draggable = false;
      masterStack.append(image);
    });

    host.prepend(skyStack);
    host.append(masterStack);
  } catch (error) {
    console.error("[Level1 sky v3] install failed", error);
  } finally {
    installing.delete(host);
  }
};

const scan = () => {
  document.querySelectorAll(HOST_SELECTOR).forEach((host) => {
    const sky = host.querySelector(":scope > .level-one-sky-stack-v3");
    const masters = host.querySelector(":scope > .level-one-punched-master-stack-v3");
    if (!sky || !masters) void installHost(host);
  });
};

let queued = false;
const queueScan = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; scan(); });
};

const observer = new MutationObserver(queueScan);
const start = () => {
  installStyles();
  scan();
  if (document.body) observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","data-level-one-master-state"] });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
else start();
