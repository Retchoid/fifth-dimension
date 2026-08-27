/* LEVEL 1 — EXACT PUNCHED MASTER SKY CONTRACT
 * Uses the approved 5d_level1_no_sky.png alpha silhouette as the single source
 * of truth for the sky aperture on every Level 1 master frame.
 * No polygon mask, no mist, no full-scene movement.
 */

const HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const EXACT_PUNCH_SRC = "/5d_level1_no_sky.png";
const SKY_BASE_SRC = "/assets/level1-painted-sky-recreated.svg";
const CLOUD_SRC = "/assets/level1-painted-sky-transparent-v1.webp";

const installing = new WeakSet<Element>();
const resizers = new WeakMap<Element, ResizeObserver>();

const waitForImage = (image: HTMLImageElement) => new Promise<boolean>((resolve) => {
  if (image.complete) return resolve(Boolean(image.naturalWidth && image.naturalHeight));
  image.addEventListener("load", () => resolve(true), { once: true });
  image.addEventListener("error", () => resolve(false), { once: true });
});

const makeImg = (className: string, src: string) => {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = "";
  image.draggable = false;
  image.setAttribute("aria-hidden", "true");
  return image;
};

const applyExactPunch = (master: HTMLImageElement) => {
  /* Native master opacity/crossfade state remains untouched. Only the sky hole
     is standardized across Golden/Waking/Dusk/Night using the approved alpha. */
  master.style.setProperty("-webkit-mask-image", `url("${EXACT_PUNCH_SRC}")`, "important");
  master.style.setProperty("mask-image", `url("${EXACT_PUNCH_SRC}")`, "important");
  master.style.setProperty("-webkit-mask-size", "100% 100%", "important");
  master.style.setProperty("mask-size", "100% 100%", "important");
  master.style.setProperty("-webkit-mask-position", "50% 50%", "important");
  master.style.setProperty("mask-position", "50% 50%", "important");
  master.style.setProperty("-webkit-mask-repeat", "no-repeat", "important");
  master.style.setProperty("mask-repeat", "no-repeat", "important");
  master.style.setProperty("mask-mode", "alpha", "important");
  master.style.setProperty("z-index", "20", "important");
  master.style.setProperty("pointer-events", "none", "important");
};

const installContract = () => {
  document.getElementById("level-one-real-painted-sky-contract")?.remove();
  document.getElementById("level-one-exact-punch-contract")?.remove();

  const style = document.createElement("style");
  style.id = "level-one-exact-punch-contract";
  style.textContent = `
  ${HOST_SELECTOR}{
    isolation:isolate!important;
    overflow:hidden!important;
    background:#050508!important;
  }

  ${HOST_SELECTOR} [class*="fog"],
  ${HOST_SELECTOR} [class*="mist"],
  ${HOST_SELECTOR} [class*="haze"],
  ${HOST_SELECTOR} .level-one-time-sky,
  ${HOST_SELECTOR} .level-one-checkerboard-sky,
  ${HOST_SELECTOR} .level-one-animated-sky,
  ${HOST_SELECTOR} .level-one-original-sky-motion,
  ${HOST_SELECTOR} .level-one-painted-sky-live,
  ${HOST_SELECTOR} .level-one-painted-sky-drift,
  ${HOST_SELECTOR} .level-one-transparent-foreground{
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    animation:none!important;
  }

  ${HOST_SELECTOR} > .level-one-real-sky-stack-v2{
    position:absolute!important;
    inset:0!important;
    z-index:0!important;
    overflow:hidden!important;
    pointer-events:none!important;
    background:#050508!important;
  }

  ${HOST_SELECTOR} .level-one-sky-camera-frame-v2{
    position:absolute!important;
    overflow:hidden!important;
    pointer-events:none!important;
    background:#050508!important;
  }

  ${HOST_SELECTOR} .level-one-sky-base-v2{
    position:absolute!important;
    z-index:0!important;
    left:-12%!important;
    top:-14%!important;
    width:124%!important;
    height:128%!important;
    object-fit:cover!important;
    object-position:38% 44%!important;
    opacity:1!important;
    transform:none!important;
    animation:none!important;
    transition:filter 2600ms cubic-bezier(.22,.72,.2,1)!important;
  }

  ${HOST_SELECTOR} .level-one-cloud-track-v2{
    position:absolute!important;
    z-index:1!important;
    left:-60%!important;
    width:220%!important;
    pointer-events:none!important;
    background-image:url("${CLOUD_SRC}")!important;
    background-repeat:repeat-x!important;
    background-position-y:50%!important;
    mix-blend-mode:screen!important;
    will-change:background-position,filter!important;
    transition:filter 2600ms cubic-bezier(.22,.72,.2,1),opacity 1800ms ease!important;
  }
  ${HOST_SELECTOR} .level-one-cloud-track-v2.cloud-a{
    top:-1%!important;
    height:42%!important;
    opacity:.52!important;
    background-size:44% 100%!important;
    animation:level-one-clouds-v2-a 34s linear infinite!important;
  }
  ${HOST_SELECTOR} .level-one-cloud-track-v2.cloud-b{
    top:12%!important;
    height:32%!important;
    opacity:.30!important;
    background-size:31% 88%!important;
    animation:level-one-clouds-v2-b 51s linear infinite!important;
  }

  @keyframes level-one-clouds-v2-a{from{background-position-x:-100%}to{background-position-x:0%}}
  @keyframes level-one-clouds-v2-b{from{background-position-x:-145%}to{background-position-x:-25%}}

  .game-viewport.level-one-time-0 .level-one-sky-base-v2{filter:sepia(.16) saturate(1.15) brightness(1.08) hue-rotate(-15deg)!important}
  .game-viewport.level-one-time-0 .level-one-cloud-track-v2{filter:sepia(.10) saturate(1.10) brightness(1.08) hue-rotate(-13deg)!important}
  .game-viewport.level-one-time-1 .level-one-sky-base-v2{filter:sepia(.10) saturate(1.20) brightness(1.03) hue-rotate(-5deg)!important}
  .game-viewport.level-one-time-1 .level-one-cloud-track-v2{filter:saturate(1.15) brightness(1.02) hue-rotate(-5deg)!important}
  .game-viewport.level-one-time-2 .level-one-sky-base-v2{filter:saturate(1.26) brightness(.95) hue-rotate(8deg)!important}
  .game-viewport.level-one-time-2 .level-one-cloud-track-v2{filter:saturate(1.20) brightness(.96) hue-rotate(8deg)!important}
  .game-viewport.level-one-time-3 .level-one-sky-base-v2{filter:saturate(1.24) brightness(.82) hue-rotate(24deg)!important}
  .game-viewport.level-one-time-3 .level-one-cloud-track-v2{filter:saturate(1.16) brightness(.84) hue-rotate(24deg)!important}
  .game-viewport.level-one-time-4 .level-one-sky-base-v2{filter:saturate(1.16) brightness(.67) hue-rotate(40deg)!important}
  .game-viewport.level-one-time-4 .level-one-cloud-track-v2{filter:saturate(1.06) brightness(.70) hue-rotate(40deg)!important}
  .game-viewport.level-one-time-5 .level-one-sky-base-v2{filter:saturate(.98) brightness(.49) hue-rotate(60deg)!important}
  .game-viewport.level-one-time-5 .level-one-cloud-track-v2{filter:saturate(.90) brightness(.54) hue-rotate(60deg)!important}

  ${HOST_SELECTOR} ${MASTER_SELECTOR}{z-index:20!important;pointer-events:none!important}

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

const alignFrame = (host: Element, frame: HTMLElement, masters: HTMLImageElement[]) => {
  const hostRect = (host as HTMLElement).getBoundingClientRect();
  const master = masters.find((candidate) => {
    const rect = candidate.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  });
  if (!master || !hostRect.width || !hostRect.height) return;
  const rect = master.getBoundingClientRect();
  frame.style.setProperty("left", `${rect.left - hostRect.left}px`, "important");
  frame.style.setProperty("top", `${rect.top - hostRect.top}px`, "important");
  frame.style.setProperty("width", `${rect.width}px`, "important");
  frame.style.setProperty("height", `${rect.height}px`, "important");
};

const installHost = async (host: Element) => {
  if (installing.has(host)) return;
  installing.add(host);
  try {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (!masters.length) return;
    await Promise.all(masters.map(waitForImage));
    if (!host.isConnected) return;
    masters.forEach(applyExactPunch);

    host.querySelectorAll(":scope > .level-one-real-sky-stack,:scope > .level-one-real-sky-stack-v2").forEach((n) => n.remove());

    const stack = document.createElement("span");
    stack.className = "level-one-real-sky-stack-v2";
    stack.setAttribute("aria-hidden", "true");
    const frame = document.createElement("span");
    frame.className = "level-one-sky-camera-frame-v2";
    const base = makeImg("level-one-sky-base-v2", SKY_BASE_SRC);
    const cloudA = document.createElement("span");
    cloudA.className = "level-one-cloud-track-v2 cloud-a";
    const cloudB = document.createElement("span");
    cloudB.className = "level-one-cloud-track-v2 cloud-b";
    frame.append(base, cloudA, cloudB);
    stack.append(frame);
    host.prepend(stack);

    if (!(await waitForImage(base)) || !host.isConnected) {
      stack.remove();
      return;
    }

    alignFrame(host, frame, masters);
    resizers.get(host)?.disconnect();
    const ro = new ResizeObserver(() => {
      if (!host.isConnected) return ro.disconnect();
      masters.forEach(applyExactPunch);
      alignFrame(host, frame, masters);
    });
    ro.observe(host);
    resizers.set(host, ro);
  } finally {
    installing.delete(host);
  }
};

const scan = () => {
  document.querySelectorAll(HOST_SELECTOR).forEach((host) => {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (!masters.length) return;
    masters.forEach(applyExactPunch);
    const frame = host.querySelector<HTMLElement>(":scope > .level-one-real-sky-stack-v2 .level-one-sky-camera-frame-v2");
    if (!frame) {
      void installHost(host);
      return;
    }
    alignFrame(host, frame, masters);
  });
};

let queued = false;
const queueScan = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    scan();
  });
};

const observer = new MutationObserver(queueScan);
const start = () => {
  installContract();
  scan();
  if (document.body) observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style"] });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
else start();
