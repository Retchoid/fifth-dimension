/* LEVEL 1 — SHARED SKY APERTURE + NATIVE MASTER TRANSITIONS
 * Golden / Waking / Dusk / Night masters remain the scene authority.
 * Every master receives the exact same inverse sky mask, so architecture,
 * street lighting, windows, crowd/population and native crossfades still work.
 * Behind that shared aperture: one stationary painted sky base plus two cloud
 * tracks moving continuously left -> right at different speeds. No ping-pong,
 * no mist/fog, no moving buildings.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const SKY_BASE_SRC = "/assets/level1-painted-sky-recreated.svg";
const CLOUD_SRC = "/assets/level1-painted-sky-transparent-v1.webp";
const MASTER_MASK_SRC = "/assets/level1-foreground-inverse-sky-mask-v1.svg";

const installingHosts = new WeakSet<Element>();
const resizeObservers = new WeakMap<Element, ResizeObserver>();

const waitForImage = (image: HTMLImageElement) => new Promise<boolean>((resolve) => {
  if (image.complete) return resolve(Boolean(image.naturalWidth && image.naturalHeight));
  image.addEventListener("load", () => resolve(true), { once: true });
  image.addEventListener("error", () => resolve(false), { once: true });
});

const makeImage = (className: string, src: string) => {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = "";
  image.draggable = false;
  image.setAttribute("aria-hidden", "true");
  return image;
};

const prepareMaster = (master: HTMLImageElement) => {
  /* Remove inline overrides left by the retired one-master renderer so the
     project's native Golden/Waking/Dusk/Night opacity transitions own state. */
  for (const property of ["display", "opacity", "visibility", "animation", "transition", "transform", "filter"]) {
    master.style.removeProperty(property);
  }

  master.style.setProperty("-webkit-mask-image", `url("${MASTER_MASK_SRC}")`, "important");
  master.style.setProperty("mask-image", `url("${MASTER_MASK_SRC}")`, "important");
  master.style.setProperty("-webkit-mask-size", "100% 100%", "important");
  master.style.setProperty("mask-size", "100% 100%", "important");
  master.style.setProperty("-webkit-mask-position", "50% 50%", "important");
  master.style.setProperty("mask-position", "50% 50%", "important");
  master.style.setProperty("-webkit-mask-repeat", "no-repeat", "important");
  master.style.setProperty("mask-repeat", "no-repeat", "important");
  master.style.setProperty("z-index", "20", "important");
  master.style.setProperty("pointer-events", "none", "important");
};

const installSkyContract = () => {
  document.getElementById("level-one-checkerboard-only-contract")?.remove();
  document.getElementById("level-one-original-sky-contract")?.remove();
  document.getElementById("level-one-real-painted-sky-contract")?.remove();

  const style = document.createElement("style");
  style.id = "level-one-real-painted-sky-contract";
  style.textContent = `
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley{
    isolation:isolate!important;
    overflow:hidden!important;
    background:#050508!important;
  }

  /* Kill only obsolete artificial atmosphere. Do not suppress the original
     scene masters, population, building lights, or native transition system. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="fog"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="mist"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="haze"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-sky{
    content:none!important;
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    background:none!important;
    animation:none!important;
    transition:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;
    inset:0!important;
    z-index:0!important;
    overflow:hidden!important;
    pointer-events:none!important;
    background:transparent!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;
    z-index:0!important;
    overflow:hidden!important;
    pointer-events:none!important;
    background:#f39a59!important;
  }

  /* Stationary painted base. The scene can change around it, but the sky camera
     itself never pans, zooms, oscillates, or reverses direction. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-base{
    position:absolute!important;
    z-index:0!important;
    left:-12%!important;
    top:-14%!important;
    width:124%!important;
    height:128%!important;
    object-fit:cover!important;
    object-position:38% 44%!important;
    pointer-events:none!important;
    opacity:1!important;
    mix-blend-mode:normal!important;
    transform:none!important;
    animation:none!important;
    transition:filter 2600ms cubic-bezier(.22,.72,.2,1)!important;
  }

  /* Two independent painted cloud tracks. These use the existing painted sky
     texture as a repeating cloud source and move only left -> right. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-track{
    position:absolute!important;
    z-index:1!important;
    left:-55%!important;
    width:210%!important;
    pointer-events:none!important;
    background-image:url("${CLOUD_SRC}")!important;
    background-repeat:repeat-x!important;
    background-position-y:50%!important;
    mix-blend-mode:screen!important;
    will-change:background-position,filter!important;
    transition:filter 2600ms cubic-bezier(.22,.72,.2,1),opacity 1800ms ease!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-track.cloud-a{
    top:-2%!important;
    height:42%!important;
    opacity:.56!important;
    background-size:44% 100%!important;
    animation:level-one-clouds-a 34s linear infinite!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-track.cloud-b{
    top:11%!important;
    height:34%!important;
    opacity:.34!important;
    background-size:31% 88%!important;
    animation:level-one-clouds-b 51s linear infinite!important;
  }

  @keyframes level-one-clouds-a{
    from{background-position-x:-92%}
    to{background-position-x:8%}
  }
  @keyframes level-one-clouds-b{
    from{background-position-x:-138%}
    to{background-position-x:-18%}
  }

  /* Sky time-of-day progression follows the same live record stages that drive
     the original masters. Base + cloud layers grade together, while buildings
     and street lighting transition through their own original master art. */
  .game-viewport.level-one-time-0 .level-one-sky-base{
    filter:sepia(.14) saturate(1.18) contrast(1.02) brightness(1.08) hue-rotate(-14deg)!important;
  }
  .game-viewport.level-one-time-0 .level-one-cloud-track{
    filter:sepia(.08) saturate(1.12) brightness(1.08) hue-rotate(-12deg)!important;
  }
  .game-viewport.level-one-time-1 .level-one-sky-base{
    filter:sepia(.10) saturate(1.22) contrast(1.04) brightness(1.03) hue-rotate(-5deg)!important;
  }
  .game-viewport.level-one-time-1 .level-one-cloud-track{
    filter:saturate(1.16) brightness(1.02) hue-rotate(-5deg)!important;
  }
  .game-viewport.level-one-time-2 .level-one-sky-base{
    filter:saturate(1.28) contrast(1.05) brightness(.95) hue-rotate(8deg)!important;
  }
  .game-viewport.level-one-time-2 .level-one-cloud-track{
    filter:saturate(1.22) brightness(.96) hue-rotate(8deg)!important;
  }
  .game-viewport.level-one-time-3 .level-one-sky-base{
    filter:saturate(1.26) contrast(1.08) brightness(.82) hue-rotate(24deg)!important;
  }
  .game-viewport.level-one-time-3 .level-one-cloud-track{
    filter:saturate(1.18) brightness(.84) hue-rotate(24deg)!important;
  }
  .game-viewport.level-one-time-4 .level-one-sky-base{
    filter:saturate(1.18) contrast(1.1) brightness(.67) hue-rotate(40deg)!important;
  }
  .game-viewport.level-one-time-4 .level-one-cloud-track{
    filter:saturate(1.08) brightness(.70) hue-rotate(40deg)!important;
  }
  .game-viewport.level-one-time-5 .level-one-sky-base{
    filter:saturate(.98) contrast(1.12) brightness(.49) hue-rotate(60deg)!important;
  }
  .game-viewport.level-one-time-5 .level-one-cloud-track{
    filter:saturate(.90) brightness(.54) hue-rotate(60deg)!important;
  }

  /* Original masters retain native opacity/crossfades; we only supply their
     shared sky aperture and environment stacking level. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-master-art{
    z-index:20!important;
    pointer-events:none!important;
  }

  /* Remove injected artifacts from previous sky experiments if CSS survives HMR. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-live,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-original-sky-motion,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-source,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-palette{
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    animation:none!important;
  }

  /* Gameplay and bonus surfaces remain above every environment master. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .in-world-reward{z-index:50!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.game-overlay{z-index:56!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.bonus-level-stage,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.afterparty-runner-stage,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.no-request-splash-overlay,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.no-request-bonus-stage{z-index:58!important}
  `;
  document.head.append(style);
};

const alignFrameToMaster = (host: Element, frame: HTMLElement, masters: HTMLImageElement[]) => {
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
  frame.style.setProperty("right", "auto", "important");
  frame.style.setProperty("bottom", "auto", "important");
};

const installOnHost = async (host: Element) => {
  if (installingHosts.has(host)) return;
  installingHosts.add(host);

  try {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (!masters.length) return;
    await Promise.all(masters.map(waitForImage));
    if (!host.isConnected) return;

    masters.forEach(prepareMaster);

    host.querySelectorAll(
      ".level-one-real-sky-stack,.level-one-sky-camera-frame,.level-one-transparent-foreground,.level-one-painted-sky-live,.level-one-checkerboard-sky,.level-one-animated-sky,.level-one-real-sky"
    ).forEach((node) => node.remove());

    const stack = document.createElement("span");
    stack.className = "level-one-real-sky-stack";
    stack.setAttribute("aria-hidden", "true");

    const frame = document.createElement("span");
    frame.className = "level-one-sky-camera-frame";

    const base = makeImage("level-one-sky-base", SKY_BASE_SRC);
    const cloudA = document.createElement("span");
    cloudA.className = "level-one-cloud-track cloud-a";
    const cloudB = document.createElement("span");
    cloudB.className = "level-one-cloud-track cloud-b";

    frame.append(base, cloudA, cloudB);
    stack.append(frame);
    host.prepend(stack);

    const baseOk = await waitForImage(base);
    if (!baseOk || !host.isConnected) {
      stack.remove();
      return;
    }

    alignFrameToMaster(host, frame, masters);

    resizeObservers.get(host)?.disconnect();
    const resizeObserver = new ResizeObserver(() => {
      if (!host.isConnected) {
        resizeObserver.disconnect();
        return;
      }
      masters.forEach(prepareMaster);
      alignFrameToMaster(host, frame, masters);
    });
    resizeObserver.observe(host);
    resizeObservers.set(host, resizeObserver);
  } finally {
    installingHosts.delete(host);
  }
};

/* Self-healing pass: React may remount scene masters during transition/bonus
   states. Reapply the shared mask and restore the sky stack without interfering
   with the masters' native opacity/state classes. */
const scan = () => {
  document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (!masters.length) return;
    masters.forEach(prepareMaster);

    const frame = host.querySelector<HTMLElement>(":scope > .level-one-real-sky-stack .level-one-sky-camera-frame");
    const base = host.querySelector<HTMLImageElement>(":scope > .level-one-real-sky-stack .level-one-sky-base");
    const cloudA = host.querySelector<HTMLElement>(":scope > .level-one-real-sky-stack .cloud-a");
    const cloudB = host.querySelector<HTMLElement>(":scope > .level-one-real-sky-stack .cloud-b");

    if (!frame || !base || !cloudA || !cloudB) {
      void installOnHost(host);
      return;
    }

    alignFrameToMaster(host, frame, masters);
  });
};

let scanQueued = false;
const queueScan = () => {
  if (scanQueued) return;
  scanQueued = true;
  requestAnimationFrame(() => {
    scanQueued = false;
    scan();
  });
};

const observer = new MutationObserver(queueScan);
const start = () => {
  installSkyContract();
  scan();
  if (document.body) {
    observer.observe(document.body, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class","style"]
    });
  }
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
else start();
