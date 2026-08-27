/* LEVEL 1 — ORIGINAL PAINTED SKY COMPOSITOR
 * The transparent foreground PNG is the only mask.
 * One static aligned Golden master supplies the exact original sky.
 * Only a tightly clipped upper-sky copy moves; no synthetic mist/cloud shapes.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const ORIGINAL_GOLDEN_SRC = "/assets/1000001169_3204905a.png";
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
  document.getElementById("level-one-original-sky-contract")?.remove();
  const style = document.createElement("style");
  style.id = "level-one-original-sky-contract";
  style.textContent = `
  /* No host haze, feathered skyline mask, scene crossfade, or synthetic cloud shapes. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::after{
    content:none!important;display:none!important;opacity:0!important;background:none!important;animation:none!important;transition:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:none!important;filter:none!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;
    -webkit-mask-image:none!important;mask-image:none!important;
  }

  /* Exact original Golden artwork. STATIC. The punched foreground hides every non-sky pixel above it. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base{
    position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
    object-fit:fill!important;object-position:50% 50%!important;z-index:0!important;opacity:1!important;
    transform:none!important;animation:none!important;transition:filter 1800ms ease!important;pointer-events:none!important;
  }

  /* Real painted cloud texture: another copy of the original artwork, but clipped to the upper 22%.
     No building pixels can enter this moving region. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-original-sky-motion{
    position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
    object-fit:fill!important;object-position:50% 50%!important;z-index:1!important;pointer-events:none!important;
    clip-path:inset(0 0 78% 0)!important;opacity:.56!important;mix-blend-mode:normal!important;
    transform-origin:50% 11%!important;will-change:transform!important;
    animation:level-one-original-sky-drift 22s ease-in-out infinite alternate!important;
    transition:filter 1800ms ease,opacity 1800ms ease!important;
  }

  /* Sky-only color grade. It is behind the punched foreground, so architecture is untouched. */
  .level-one-sky-grade{position:absolute!important;inset:0!important;z-index:2!important;pointer-events:none!important;opacity:0!important;mix-blend-mode:color!important;transition:background 1800ms ease,opacity 1800ms ease!important}

  /* Progression changes only the sky stack. */
  .game-viewport.level-one-time-1 .level-one-painted-sky-base,
  .game-viewport.level-one-time-2 .level-one-painted-sky-base{filter:saturate(1.12) brightness(.93) hue-rotate(7deg)!important}
  .game-viewport.level-one-time-1 .level-one-original-sky-motion,
  .game-viewport.level-one-time-2 .level-one-original-sky-motion{filter:saturate(1.14) brightness(.96) hue-rotate(7deg)!important;opacity:.58!important}
  .game-viewport.level-one-time-1 .level-one-sky-grade,
  .game-viewport.level-one-time-2 .level-one-sky-grade{opacity:.15!important;background:#d84e79!important}

  .game-viewport.level-one-time-3 .level-one-painted-sky-base,
  .game-viewport.level-one-time-4 .level-one-painted-sky-base{filter:saturate(1.08) brightness(.72) hue-rotate(27deg)!important}
  .game-viewport.level-one-time-3 .level-one-original-sky-motion,
  .game-viewport.level-one-time-4 .level-one-original-sky-motion{filter:saturate(1.06) brightness(.78) hue-rotate(27deg)!important;opacity:.50!important}
  .game-viewport.level-one-time-3 .level-one-sky-grade,
  .game-viewport.level-one-time-4 .level-one-sky-grade{opacity:.29!important;background:#674a9d!important}

  .game-viewport.level-one-time-5 .level-one-painted-sky-base{filter:saturate(.92) brightness(.50) hue-rotate(51deg)!important}
  .game-viewport.level-one-time-5 .level-one-original-sky-motion{filter:saturate(.88) brightness(.57) hue-rotate(51deg)!important;opacity:.42!important}
  .game-viewport.level-one-time-5 .level-one-sky-grade{opacity:.40!important;background:#243d7b!important}

  /* Slow movement of ORIGINAL cloud pixels only. No zoom pulse and no vertical camera wobble. */
  @keyframes level-one-original-sky-drift{
    0%{transform:translate3d(-1.7%,0,0)}
    50%{transform:translate3d(.1%,0,0)}
    100%{transform:translate3d(1.7%,0,0)}
  }

  /* Punched foreground is the actual mask and never moves. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{
    position:absolute!important;z-index:3!important;display:block!important;object-fit:fill!important;object-position:50% 50%!important;
    transform:none!important;animation:none!important;transition:none!important;pointer-events:none!important;opacity:0!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{opacity:1!important}

  /* Retire every legacy Level 1 scene/haze layer after punch-out mount. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-vignette,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-field,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-cloud-band{
    display:none!important;opacity:0!important;visibility:hidden!important;animation:none!important;transition:none!important;transform:none!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-sky,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-haze{display:none!important;opacity:0!important}

  /* Gameplay remains above scenery. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}

  @media(prefers-reduced-motion:reduce){.level-one-original-sky-motion{animation:none!important}}
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
  host.querySelectorAll<HTMLElement>(".level-one-approved-population,.level-one-population,.level-one-master-vignette,.level-one-canonical-ambience").forEach((node) => {
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

  host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky,.level-one-real-sky-stack,.level-one-alley-life,.level-one-sky-camera-frame").forEach((node) => node.remove());

  const sky = document.createElement("span");
  sky.className = "level-one-real-sky-stack";
  sky.setAttribute("aria-hidden", "true");

  const frame = document.createElement("span");
  frame.className = "level-one-sky-camera-frame";
  const baseSky = makeImage("level-one-real-sky-image level-one-painted-sky-base", ORIGINAL_GOLDEN_SRC);
  const movingSky = makeImage("level-one-real-sky-image level-one-original-sky-motion", ORIGINAL_GOLDEN_SRC);
  const grade = document.createElement("span");
  grade.className = "level-one-sky-grade";
  frame.append(baseSky, movingSky, grade);
  sky.append(frame);

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(sky);
  host.append(foreground);

  const [fgOk, baseOk, movingOk] = await Promise.all([waitForImage(foreground), waitForImage(baseSky), waitForImage(movingSky)]);
  if (!fgOk || !baseOk || !movingOk) {
    foreground.remove();
    sky.remove();
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
