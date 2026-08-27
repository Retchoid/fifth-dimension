/* LEVEL 1 — THREE-LAYER CHECKERBOARD-ONLY SKY
 * Layer 1: palette field (solid colour progression)
 * Layer 2: cloud texture sampled from the approved Golden master, drifting L -> R
 * Layer 3: user's foreground master, fixed above both
 *
 * The sky stack is clipped to the traced checkerboard aperture. Nothing from the
 * sky system may render outside that opening. No second full-scene master, fog,
 * haze, steam, dog, or scene crossfade is allowed here.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const ORIGINAL_GOLDEN_SRC = "/assets/1000001169_3204905a.png";
const processedHosts = new WeakSet<Element>();

/* Traced from the approved checkerboard opening. This polygon is applied to the
   ENTIRE sky stack, not the foreground. Even if a cloud image drifts, it cannot
   escape this aperture or reveal duplicate buildings. */
const SKY_APERTURE = [
  [36.54,.69],[35.93,3.22],[36.85,3.68],[36.85,5.75],[36.09,5.06],
  [36.85,7.36],[36.85,16.78],[38.84,16.55],[38.84,14.48],[40.21,14.25],
  [40.06,16.09],[42.20,17.24],[44.19,21.38],[44.19,27.82],[43.43,27.36],
  [42.97,29.89],[44.19,33.33],[43.27,33.56],[42.05,43.68],[43.43,45.06],
  [45.87,44.83],[47.86,49.43],[48.01,45.06],[48.47,45.98],[49.24,44.14],
  [50.76,44.14],[51.83,48.28],[53.52,49.89],[53.82,48.05],[53.98,49.20],
  [55.05,48.05],[55.50,44.83],[57.19,45.06],[57.03,42.30],[60.24,33.79],
  [61.16,41.84],[62.54,42.30],[62.54,44.37],[61.31,44.14],[63.00,48.05],
  [62.69,45.06],[63.76,44.83],[63.61,39.54],[64.22,40.69],[64.98,40.00],
  [64.98,.92],[64.07,3.22],[62.69,2.99],[62.54,.69],[59.48,1.61],
  [60.09,2.76],[59.17,3.22],[58.87,.69],[57.03,.69],[55.50,3.22],
  [55.20,.69],[53.36,.69],[52.91,3.22],[51.68,.69],[49.69,.69],
  [48.17,3.22],[47.86,.69],[42.35,.69],[41.13,2.76],[40.67,.69]
] as const;
const SKY_CLIP = `polygon(${SKY_APERTURE.map(([x,y]) => `${x}% ${y}%`).join(",")})`;

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
  const style = document.createElement("style");
  style.id = "level-one-checkerboard-only-contract";
  style.textContent = `
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley{
    isolation:isolate!important;overflow:hidden!important;background:#050508!important;
  }

  /* Disable all previous synthetic atmosphere and scene copies. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::after,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="fog"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="mist"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="haze"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="steam"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) [class*="dog"],
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-population{
    content:none!important;display:none!important;visibility:hidden!important;opacity:0!important;
    background:none!important;filter:none!important;animation:none!important;transition:none!important;
  }

  /* Sky exists only on the same image plane as the foreground and is clipped to
     the checkerboard opening before any child is painted. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;
    pointer-events:none!important;background:transparent!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;
    clip-path:${SKY_CLIP}!important;-webkit-clip-path:${SKY_CLIP}!important;
    background:#050508!important;
  }

  /* LAYER 1 — solid palette field. Continuous transitions, no image swap. */
  .level-one-sky-palette{
    position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none!important;
    background:#d78373!important;transition:background-color 2200ms linear!important;
  }
  .game-viewport.level-one-time-0 .level-one-sky-palette{background-color:#d78373!important}
  .game-viewport.level-one-time-1 .level-one-sky-palette{background-color:#c96f78!important}
  .game-viewport.level-one-time-2 .level-one-sky-palette{background-color:#a95d86!important}
  .game-viewport.level-one-time-3 .level-one-sky-palette{background-color:#744f85!important}
  .game-viewport.level-one-time-4 .level-one-sky-palette{background-color:#423f72!important}
  .game-viewport.level-one-time-5 .level-one-sky-palette{background-color:#111a39!important}

  /* LAYER 2 — cloud texture from the approved Golden master. The image is enlarged
     and offset so the source crop contains only the original central sky/clouds.
     The parent aperture clip guarantees it can never occupy space outside the
     checkerboard framing. Movement is strictly left -> right. */
  .level-one-cloud-source{
    position:absolute!important;z-index:1!important;pointer-events:none!important;
    width:155%!important;height:155%!important;left:-31%!important;top:-19%!important;
    object-fit:fill!important;object-position:50% 0!important;
    opacity:.68!important;mix-blend-mode:screen!important;
    filter:saturate(.9) contrast(.92)!important;
    will-change:transform!important;
    animation:level-one-cloud-left-right 28s linear infinite!important;
    transition:opacity 2200ms linear,filter 2200ms linear!important;
  }
  .game-viewport.level-one-time-3 .level-one-cloud-source{opacity:.52!important;filter:saturate(.8) brightness(.76)!important}
  .game-viewport.level-one-time-4 .level-one-cloud-source{opacity:.42!important;filter:saturate(.7) brightness(.58)!important}
  .game-viewport.level-one-time-5 .level-one-cloud-source{opacity:.28!important;filter:saturate(.55) brightness(.42)!important}

  @keyframes level-one-cloud-left-right{
    from{transform:translate3d(-3.5%,0,0)!important}
    to{transform:translate3d(3.5%,0,0)!important}
  }

  /* LAYER 3 — fixed foreground. No tint, no fade, no movement. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{
    position:absolute!important;z-index:3!important;display:block!important;pointer-events:none!important;
    object-fit:fill!important;object-position:50% 50%!important;transform:none!important;
    filter:none!important;animation:none!important;transition:none!important;opacity:0!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{opacity:1!important}

  /* Absolutely retire every original full-scene state image once the three-layer
     system mounts; this is the double-building fix. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-base,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-painted-sky-drift,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-original-sky-motion,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-time-sky{
    display:none!important;visibility:hidden!important;opacity:0!important;animation:none!important;
    transition:none!important;transform:none!important;filter:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer{z-index:30!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.falling-items-layer>.falling-object{z-index:31!important;visibility:visible!important;opacity:1!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two)>.dj-catcher{z-index:32!important}

  @media(prefers-reduced-motion:reduce){.level-one-cloud-source{animation:none!important}}
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
  host.querySelectorAll<HTMLElement>(".level-one-approved-population,.level-one-population,.level-one-master-vignette,.level-one-canonical-ambience,[class*='fog'],[class*='mist'],[class*='haze'],[class*='steam'],[class*='dog']").forEach((node) => {
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

  const stack = document.createElement("span");
  stack.className = "level-one-real-sky-stack";
  stack.setAttribute("aria-hidden", "true");

  const frame = document.createElement("span");
  frame.className = "level-one-sky-camera-frame";

  const palette = document.createElement("span");
  palette.className = "level-one-sky-palette";

  const clouds = makeImage("level-one-cloud-source", ORIGINAL_GOLDEN_SRC);
  frame.append(palette, clouds);
  stack.append(frame);

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(stack);
  host.append(foreground);

  const [fgOk, cloudOk] = await Promise.all([waitForImage(foreground), waitForImage(clouds)]);
  if (!fgOk || !cloudOk) {
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
