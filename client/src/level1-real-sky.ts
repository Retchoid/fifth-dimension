/* LEVEL 1 — PERSISTENT PAINTED SKY + PUNCHED FOREGROUND
 * The punched foreground is the permanent Level 1 master for every time state.
 * A recreated painted sky moves slowly behind its alpha opening.
 * React/state transitions are allowed to change classes, but may never replace,
 * fade, move, or cover the punched foreground.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const PAINTED_SKY_SRC = "/assets/level1-painted-sky-recreated.svg";

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

  /* Retire every previous atmosphere / scene-state renderer. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::after,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="fog"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="mist"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="haze"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-sky,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-population{
    content:none!important;
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    background:none!important;
    filter:none!important;
    animation:none!important;
    transition:none!important;
  }

  /* Environment plane. */
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
    clip-path:none!important;
    -webkit-clip-path:none!important;
    background:#111224!important;
  }

  /* Real painted sky only. Extra horizontal crop keeps the source-image building
     edge outside the punched aperture for the whole animation. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-live{
    position:absolute!important;
    z-index:0!important;
    pointer-events:none!important;
    width:142%!important;
    height:126%!important;
    left:-31%!important;
    top:-13%!important;
    object-fit:cover!important;
    object-position:36% 47%!important;
    opacity:1!important;
    mix-blend-mode:normal!important;
    filter:saturate(1.1) contrast(1.05) brightness(1.02)!important;
    will-change:transform,filter!important;
    animation:level-one-painted-sky-pan 18s linear infinite alternate!important;
    transition:filter 2200ms cubic-bezier(.22,.72,.2,1)!important;
  }

  .game-viewport.level-one-time-1 .level-one-painted-sky-live,
  .game-viewport.level-one-time-2 .level-one-painted-sky-live{
    filter:saturate(1.17) contrast(1.07) brightness(.94) hue-rotate(7deg)!important;
  }
  .game-viewport.level-one-time-3 .level-one-painted-sky-live,
  .game-viewport.level-one-time-4 .level-one-painted-sky-live{
    filter:saturate(1.22) contrast(1.1) brightness(.72) hue-rotate(28deg)!important;
  }
  .game-viewport.level-one-time-5 .level-one-painted-sky-live{
    filter:saturate(.96) contrast(1.12) brightness(.48) hue-rotate(54deg)!important;
  }

  @keyframes level-one-painted-sky-pan{
    from{transform:translate3d(-1.6%,0,0) scale(1.015)}
    to{transform:translate3d(1.6%,0,0) scale(1.015)}
  }

  /* Permanent punched master. This selector deliberately does NOT depend on a
     time-state class: Golden, Waking, Dusk and Night all use this exact image. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{
    position:absolute!important;
    z-index:20!important;
    display:block!important;
    visibility:visible!important;
    pointer-events:none!important;
    object-fit:fill!important;
    object-position:50% 50%!important;
    transform:none!important;
    filter:none!important;
    animation:none!important;
    transition:none!important;
    opacity:1!important;
  }

  /* Full-scene state masters are permanently retired after punch-out install. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-base,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-drift,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-original-sky-motion,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-cloud-source,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-sky-palette{
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    animation:none!important;
    transition:none!important;
    transform:none!important;
    filter:none!important;
  }

  /* Gameplay and rewards always sit above the environment/master stack. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{
    z-index:30!important;visibility:visible!important;opacity:1!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{
    z-index:31!important;visibility:visible!important;opacity:1!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .in-world-reward{z-index:50!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .no-request-splash-overlay,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .no-request-bonus-stage{z-index:55!important}

  @media(prefers-reduced-motion:reduce){
    .level-one-painted-sky-live{animation-duration:36s!important}
  }
  `;
  document.head.append(style);
};

const hardLockForeground = (foreground: HTMLImageElement) => {
  foreground.style.setProperty("z-index", "20", "important");
  foreground.style.setProperty("display", "block", "important");
  foreground.style.setProperty("visibility", "visible", "important");
  foreground.style.setProperty("opacity", "1", "important");
  foreground.style.setProperty("transform", "none", "important");
  foreground.style.setProperty("filter", "none", "important");
  foreground.style.setProperty("animation", "none", "important");
  foreground.style.setProperty("transition", "none", "important");
};

const alignSharedCamera = (host: Element, foreground: HTMLImageElement, frame: HTMLElement) => {
  const hostElement = host as HTMLElement;
  const width = hostElement.clientWidth;
  const height = hostElement.clientHeight;
  if (!width || !height || !foreground.naturalWidth || !foreground.naturalHeight) return;

  const containScale = Math.min(width / foreground.naturalWidth, height / foreground.naturalHeight);
  const renderedWidth = foreground.naturalWidth * containScale * 1.04;
  const renderedHeight = foreground.naturalHeight * containScale * 1.04;
  const left = (width - renderedWidth) / 2;
  const top = (height - renderedHeight) / 2;

  for (const element of [foreground, frame]) {
    element.style.setProperty("position", "absolute", "important");
    element.style.setProperty("left", `${left}px`, "important");
    element.style.setProperty("top", `${top}px`, "important");
    element.style.setProperty("width", `${renderedWidth}px`, "important");
    element.style.setProperty("height", `${renderedHeight}px`, "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
  }
  hardLockForeground(foreground);
};

const retireLegacyLevelOneLayers = (host: Element, masters: HTMLImageElement[]) => {
  masters.forEach((master) => {
    master.style.setProperty("display", "none", "important");
    master.style.setProperty("opacity", "0", "important");
    master.style.setProperty("visibility", "hidden", "important");
    master.style.setProperty("animation", "none", "important");
    master.style.setProperty("transition", "none", "important");
    master.style.setProperty("transform", "none", "important");
  });
};

const installOnHost = async (host: Element) => {
  if (installingHosts.has(host)) return;
  installingHosts.add(host);

  try {
    const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
    if (!masters.length) return;
    await Promise.all(masters.map(waitForImage));

    host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky,.level-one-real-sky-stack,.level-one-sky-camera-frame").forEach((node) => node.remove());

    const stack = document.createElement("span");
    stack.className = "level-one-real-sky-stack";
    stack.setAttribute("aria-hidden", "true");

    const frame = document.createElement("span");
    frame.className = "level-one-sky-camera-frame";
    const skyImage = makeImage("level-one-painted-sky-live", PAINTED_SKY_SRC);
    frame.append(skyImage);
    stack.append(frame);

    const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
    host.prepend(stack);
    host.append(foreground);

    const [fgOk, skyOk] = await Promise.all([waitForImage(foreground), waitForImage(skyImage)]);
    if (!fgOk || !skyOk || !host.isConnected) {
      foreground.remove();
      stack.remove();
      return;
    }

    host.classList.add("level-one-transparent-foreground-ready", "level-one-independent-sky-ready");
    retireLegacyLevelOneLayers(host, masters);
    alignSharedCamera(host, foreground, frame);

    resizeObservers.get(host)?.disconnect();
    const resizeObserver = new ResizeObserver(() => {
      if (!host.isConnected) return resizeObserver.disconnect();
      alignSharedCamera(host, foreground, frame);
    });
    resizeObserver.observe(host);
    resizeObservers.set(host, resizeObserver);
  } finally {
    installingHosts.delete(host);
  }
};

/* Self-healing pass. React can rebuild scene children at time/bonus transitions;
   if it removes our punched master or sky stack, restore them immediately. */
const scan = () => {
  document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => {
    const foreground = host.querySelector<HTMLImageElement>(":scope > .level-one-transparent-foreground");
    const frame = host.querySelector<HTMLElement>(".level-one-sky-camera-frame");
    const sky = host.querySelector<HTMLImageElement>(".level-one-painted-sky-live");

    if (!foreground || !frame || !sky || !foreground.isConnected || !frame.isConnected || !sky.isConnected) {
      void installOnHost(host);
      return;
    }

    host.classList.add("level-one-transparent-foreground-ready", "level-one-independent-sky-ready");
    hardLockForeground(foreground);
    retireLegacyLevelOneLayers(host, Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR)));
    alignSharedCamera(host, foreground, frame);
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
