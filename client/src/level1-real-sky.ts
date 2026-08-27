/* LEVEL 1 — TRUE PUNCHED-SKY COMPOSITOR
 * Static transparent foreground + dedicated painted sky + masked cloud-only motion.
 * No full-scene image is animated or used as a sky source.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const PAINTED_SKY_SRC = "/assets/level1-painted-sky-transparent-v1.webp";
const SKY_MASK_SRC = "/assets/level1-skyline-mask-v1.svg";
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
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::after{
    content:none!important;display:none!important;opacity:0!important;background:none!important;animation:none!important;transition:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:none!important;filter:none!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;
    -webkit-mask-image:url("${SKY_MASK_SRC}")!important;
    mask-image:url("${SKY_MASK_SRC}")!important;
    -webkit-mask-size:100% 100%!important;mask-size:100% 100%!important;
    -webkit-mask-position:center!important;mask-position:center!important;
    -webkit-mask-repeat:no-repeat!important;mask-repeat:no-repeat!important;
  }

  /* Dedicated sky plate only. No buildings, pavement, car, signs or foreground architecture. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base{
    position:absolute!important;inset:-3%!important;width:106%!important;height:106%!important;
    object-fit:cover!important;object-position:50% 34%!important;z-index:0!important;opacity:1!important;
    transform:none!important;animation:none!important;transition:filter 1800ms ease!important;pointer-events:none!important;
    filter:saturate(1.12) contrast(1.06) brightness(1.03)!important;
  }

  /* Cloud-only animation. These shapes are clipped by the calibrated skyline mask. */
  .level-one-cloud-field{position:absolute!important;inset:0!important;z-index:1!important;overflow:hidden!important;pointer-events:none!important;transition:filter 1800ms ease,opacity 1800ms ease!important}
  .level-one-cloud-band{position:absolute!important;left:-30%!important;width:160%!important;pointer-events:none!important;will-change:transform!important}
  .level-one-cloud-band-a{top:5%!important;height:20%!important;opacity:.48!important;background:
    radial-gradient(ellipse at 8% 54%,rgba(255,225,184,.78) 0 7%,rgba(245,164,142,.46) 12%,transparent 27%),
    radial-gradient(ellipse at 27% 43%,rgba(255,219,177,.72) 0 10%,rgba(235,146,147,.40) 16%,transparent 31%),
    radial-gradient(ellipse at 49% 58%,rgba(255,229,199,.68) 0 10%,rgba(220,132,158,.36) 17%,transparent 31%),
    radial-gradient(ellipse at 72% 45%,rgba(251,211,188,.62) 0 9%,rgba(205,122,164,.32) 16%,transparent 30%),
    radial-gradient(ellipse at 92% 57%,rgba(247,205,192,.56) 0 8%,rgba(195,116,171,.28) 15%,transparent 28%)!important;
    filter:blur(.7px)!important;animation:level-one-cloud-only-a 30s linear infinite!important}
  .level-one-cloud-band-b{top:18%!important;height:17%!important;opacity:.34!important;background:
    radial-gradient(ellipse at 12% 50%,rgba(139,85,149,.50) 0 8%,transparent 25%),
    radial-gradient(ellipse at 36% 60%,rgba(159,91,150,.46) 0 11%,transparent 29%),
    radial-gradient(ellipse at 61% 49%,rgba(124,83,152,.42) 0 9%,transparent 27%),
    radial-gradient(ellipse at 85% 58%,rgba(104,77,148,.38) 0 9%,transparent 25%)!important;
    filter:blur(1.6px)!important;animation:level-one-cloud-only-b 44s linear infinite!important}

  .level-one-sky-grade{position:absolute!important;inset:0!important;z-index:2!important;pointer-events:none!important;opacity:0!important;mix-blend-mode:color!important;transition:background 1800ms ease,opacity 1800ms ease!important}

  /* Progression changes sky only. */
  .game-viewport.level-one-time-1 .level-one-painted-sky-base,
  .game-viewport.level-one-time-2 .level-one-painted-sky-base{filter:saturate(1.14) contrast(1.07) brightness(.93) hue-rotate(8deg)!important}
  .game-viewport.level-one-time-1 .level-one-sky-grade,
  .game-viewport.level-one-time-2 .level-one-sky-grade{opacity:.18!important;background:#d84e79!important}

  .game-viewport.level-one-time-3 .level-one-painted-sky-base,
  .game-viewport.level-one-time-4 .level-one-painted-sky-base{filter:saturate(1.08) contrast(1.09) brightness(.72) hue-rotate(27deg)!important}
  .game-viewport.level-one-time-3 .level-one-sky-grade,
  .game-viewport.level-one-time-4 .level-one-sky-grade{opacity:.32!important;background:#674a9d!important}
  .game-viewport.level-one-time-3 .level-one-cloud-field,
  .game-viewport.level-one-time-4 .level-one-cloud-field{filter:brightness(.82) hue-rotate(9deg)!important}

  .game-viewport.level-one-time-5 .level-one-painted-sky-base{filter:saturate(.92) contrast(1.12) brightness(.48) hue-rotate(51deg)!important}
  .game-viewport.level-one-time-5 .level-one-sky-grade{opacity:.44!important;background:#243d7b!important}
  .game-viewport.level-one-time-5 .level-one-cloud-field{filter:brightness(.62) saturate(.80) hue-rotate(18deg)!important;opacity:.76!important}

  @keyframes level-one-cloud-only-a{0%{transform:translate3d(-4%,0,0)}100%{transform:translate3d(17%,.6%,0)}}
  @keyframes level-one-cloud-only-b{0%{transform:translate3d(8%,0,0)}100%{transform:translate3d(-16%,-.4%,0)}}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{
    position:absolute!important;z-index:2!important;display:block!important;object-fit:fill!important;object-position:50% 50%!important;
    transform:none!important;animation:none!important;transition:none!important;pointer-events:none!important;opacity:0!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{opacity:1!important}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-vignette,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift{
    display:none!important;opacity:0!important;visibility:hidden!important;animation:none!important;transition:none!important;transform:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-sky,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-time-haze{display:none!important;opacity:0!important}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}
  @media(prefers-reduced-motion:reduce){.level-one-cloud-band{animation:none!important}}
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
  const baseSky = makeImage("level-one-real-sky-image level-one-painted-sky-base", PAINTED_SKY_SRC);
  const cloudField = document.createElement("span");
  cloudField.className = "level-one-cloud-field";
  cloudField.innerHTML = `<i class="level-one-cloud-band level-one-cloud-band-a"></i><i class="level-one-cloud-band level-one-cloud-band-b"></i>`;
  const grade = document.createElement("span");
  grade.className = "level-one-sky-grade";
  frame.append(baseSky, cloudField, grade);
  sky.append(frame);

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(sky);
  host.append(foreground);

  const [fgOk, skyOk] = await Promise.all([waitForImage(foreground), waitForImage(baseSky)]);
  if (!fgOk || !skyOk) {
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
