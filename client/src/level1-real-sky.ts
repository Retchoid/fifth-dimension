/* LEVEL 1 — REAL PAINTED SKY BEHIND PUNCHED FOREGROUND
 * One recreated painted sky image moves slowly behind the exact punched PNG.
 * No palette field, no artificial clouds, no fog/mist/haze, no moving buildings.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const PAINTED_SKY_SRC = "/assets/level1-painted-sky-recreated.svg";
const processedHosts = new WeakSet<Element>();

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
    isolation:isolate!important;overflow:hidden!important;background:#050508!important;
  }

  /* Remove all previous atmosphere systems and legacy scene-state artwork. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::after,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="fog"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="mist"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="haze"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-sky,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-population{
    content:none!important;display:none!important;visibility:hidden!important;opacity:0!important;
    background:none!important;filter:none!important;animation:none!important;transition:none!important;
  }

  /* Sky and foreground use one identical measured camera box. The foreground PNG
     itself is the exact alpha mask, eliminating traced border/halo errors. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;
    pointer-events:none!important;background:transparent!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;
    clip-path:none!important;-webkit-clip-path:none!important;background:#111224!important;
  }

  /* Actual recreated painted sky. Overscan guarantees that its slow drift can
     never reveal an edge. Only this image moves; it contains no buildings. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-live{
    position:absolute!important;z-index:0!important;pointer-events:none!important;
    width:116%!important;height:116%!important;left:-8%!important;top:-8%!important;
    object-fit:cover!important;object-position:50% 50%!important;
    opacity:1!important;mix-blend-mode:normal!important;
    filter:saturate(1.10) contrast(1.05) brightness(1.02)!important;
    transform:translate3d(-1.8%,0,0) scale(1.02)!important;
    will-change:transform,filter!important;
    animation:level-one-painted-sky-pan 24s ease-in-out infinite alternate!important;
    transition:filter 2200ms cubic-bezier(.22,.72,.2,1)!important;
  }

  /* Same painted artwork moves through the progression. No scene swaps. */
  .game-viewport.level-one-time-1 .level-one-painted-sky-live,
  .game-viewport.level-one-time-2 .level-one-painted-sky-live{
    filter:saturate(1.16) contrast(1.07) brightness(.94) hue-rotate(7deg)!important;
  }
  .game-viewport.level-one-time-3 .level-one-painted-sky-live,
  .game-viewport.level-one-time-4 .level-one-painted-sky-live{
    filter:saturate(1.20) contrast(1.10) brightness(.72) hue-rotate(28deg)!important;
  }
  .game-viewport.level-one-time-5 .level-one-painted-sky-live{
    filter:saturate(.94) contrast(1.12) brightness(.48) hue-rotate(54deg)!important;
  }

  @keyframes level-one-painted-sky-pan{
    0%{transform:translate3d(-2.4%,0,0) scale(1.02)}
    45%{transform:translate3d(.1%,-.25%,0) scale(1.025)}
    100%{transform:translate3d(2.4%,0,0) scale(1.02)}
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{
    position:absolute!important;z-index:3!important;display:block!important;pointer-events:none!important;
    object-fit:fill!important;object-position:50% 50%!important;transform:none!important;
    filter:none!important;animation:none!important;transition:none!important;opacity:0!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{
    opacity:1!important;
  }

  /* Legacy full-scene masters can never reappear during time transitions. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-base,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-drift,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-original-sky-motion,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-cloud-source,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-sky-palette{
    display:none!important;visibility:hidden!important;opacity:0!important;animation:none!important;
    transition:none!important;transform:none!important;filter:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}

  @media(prefers-reduced-motion:reduce){.level-one-painted-sky-live{animation:none!important}}
  `;
  document.head.append(style);
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
    element.style.setProperty("left", `${left}px`, "important");
    element.style.setProperty("top", `${top}px`, "important");
    element.style.setProperty("width", `${renderedWidth}px`, "important");
    element.style.setProperty("height", `${renderedHeight}px`, "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
  }
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
  host.querySelectorAll<HTMLElement>(".level-one-approved-population,.level-one-population,.level-one-master-vignette,.level-one-canonical-ambience,[class*='fog'],[class*='mist'],[class*='haze']").forEach((node) => {
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("opacity", "0", "important");
    node.style.setProperty("visibility", "hidden", "important");
  });
};

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

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
  if (!fgOk || !skyOk) {
    foreground.remove();
    stack.remove();
    return;
  }

  alignSharedCamera(host, foreground, frame);
  const resizeObserver = new ResizeObserver(() => alignSharedCamera(host, foreground, frame));
  resizeObserver.observe(host as Element);

  host.classList.add("level-one-transparent-foreground-ready");
  retireLegacyLevelOneLayers(host, masters);
  host.classList.add("level-one-independent-sky-ready");
};

const scan = () => document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => void installOnHost(host));
const observer = new MutationObserver(scan);
const start = () => {
  installSkyContract();
  scan();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
