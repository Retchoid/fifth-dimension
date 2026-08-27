/* LEVEL 1 — TRUE PUNCHED-SKY COMPOSITOR
 * One static approved sky/base, one static transparent foreground, cloud-only motion.
 * No full-scene image is ever animated or swapped after mount.
 */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const ORIGINAL_SKY_SRC = "/assets/1000001169_3204905a.png";
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
  /* Scene host is inert: no legacy haze, master crossfade, or pseudo overlay. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::after{
    content:none!important;display:none!important;opacity:0!important;background:none!important;animation:none!important;transition:none!important;
  }

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{
    position:absolute!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:none!important;filter:none!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{
    position:absolute!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;
  }

  /* The approved Golden master is STATIC. It exists only to provide the exact original sky pixels behind the punch-out. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base{
    position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;object-position:50% 50%!important;
    z-index:0!important;opacity:1!important;transform:none!important;animation:none!important;transition:filter 1800ms ease!important;pointer-events:none!important;
  }

  /* Cloud-only layers. They are below the punched foreground, so they can only be seen through transparent sky pixels. */
  .level-one-cloud-field{position:absolute!important;inset:0!important;z-index:1!important;overflow:hidden!important;pointer-events:none!important;opacity:1!important;transition:filter 1800ms ease,opacity 1800ms ease!important}
  .level-one-cloud-band{position:absolute!important;left:-24%!important;width:148%!important;pointer-events:none!important;will-change:transform!important;mix-blend-mode:screen!important}
  .level-one-cloud-band-a{top:5%!important;height:23%!important;opacity:.38!important;background:
    radial-gradient(ellipse at 8% 56%,rgba(255,226,191,.72) 0 7%,rgba(239,161,148,.32) 13%,transparent 26%),
    radial-gradient(ellipse at 25% 43%,rgba(255,220,188,.66) 0 10%,rgba(231,150,153,.28) 16%,transparent 31%),
    radial-gradient(ellipse at 47% 58%,rgba(255,230,207,.62) 0 10%,rgba(220,139,160,.26) 17%,transparent 31%),
    radial-gradient(ellipse at 70% 45%,rgba(251,214,198,.58) 0 9%,rgba(208,130,166,.24) 16%,transparent 30%),
    radial-gradient(ellipse at 91% 57%,rgba(247,208,202,.52) 0 8%,rgba(198,123,173,.20) 15%,transparent 28%)!important;
    filter:blur(1px)!important;animation:level-one-cloud-only-a 38s linear infinite!important}
  .level-one-cloud-band-b{top:17%!important;height:19%!important;opacity:.25!important;background:
    radial-gradient(ellipse at 12% 50%,rgba(143,92,151,.42) 0 8%,transparent 25%),
    radial-gradient(ellipse at 36% 60%,rgba(163,96,152,.38) 0 11%,transparent 29%),
    radial-gradient(ellipse at 61% 49%,rgba(128,89,154,.34) 0 9%,transparent 27%),
    radial-gradient(ellipse at 85% 58%,rgba(109,82,150,.30) 0 9%,transparent 25%)!important;
    filter:blur(2px)!important;animation:level-one-cloud-only-b 57s linear infinite!important}

  /* Color wash also lives BELOW the foreground, therefore sky aperture only. */
  .level-one-sky-grade{position:absolute!important;inset:0!important;z-index:2!important;pointer-events:none!important;opacity:0!important;mix-blend-mode:color!important;transition:background 1800ms ease,opacity 1800ms ease!important}

  /* Existing game time states drive only sky color/light. Buildings never move or swap. */
  .game-viewport.level-one-time-1 .level-one-painted-sky-base,.game-viewport.level-one-time-2 .level-one-painted-sky-base{filter:saturate(1.08) brightness(.92) hue-rotate(7deg)!important}
  .game-viewport.level-one-time-1 .level-one-sky-grade,.game-viewport.level-one-time-2 .level-one-sky-grade{opacity:.16!important;background:#d95279!important}
  .game-viewport.level-one-time-1 .level-one-cloud-field,.game-viewport.level-one-time-2 .level-one-cloud-field{filter:saturate(1.05) brightness(.96)!important}

  .game-viewport.level-one-time-3 .level-one-painted-sky-base,.game-viewport.level-one-time-4 .level-one-painted-sky-base{filter:saturate(1.05) brightness(.70) hue-rotate(27deg)!important}
  .game-viewport.level-one-time-3 .level-one-sky-grade,.game-viewport.level-one-time-4 .level-one-sky-grade{opacity:.30!important;background:#674b9b!important}
  .game-viewport.level-one-time-3 .level-one-cloud-field,.game-viewport.level-one-time-4 .level-one-cloud-field{filter:saturate(.92) brightness(.78) hue-rotate(12deg)!important}

  .game-viewport.level-one-time-5 .level-one-painted-sky-base{filter:saturate(.88) brightness(.45) hue-rotate(51deg)!important}
  .game-viewport.level-one-time-5 .level-one-sky-grade{opacity:.40!important;background:#253d79!important}
  .game-viewport.level-one-time-5 .level-one-cloud-field{filter:saturate(.78) brightness(.58) hue-rotate(22deg)!important;opacity:.72!important}

  @keyframes level-one-cloud-only-a{0%{transform:translate3d(-3%,0,0)}100%{transform:translate3d(16%,.8%,0)}}
  @keyframes level-one-cloud-only-b{0%{transform:translate3d(7%,0,0)}100%{transform:translate3d(-15%,-.5%,0)}}

  /* Punched foreground is STATIC and shares the exact measured camera rectangle with the base sky. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{
    position:absolute!important;z-index:2!important;display:block!important;object-fit:fill!important;object-position:50% 50%!important;transform:none!important;animation:none!important;transition:none!important;pointer-events:none!important;opacity:0!important;
  }
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{opacity:1!important}

  /* Legacy four-master/environment systems are retired once the punch-out is live. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-vignette,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-canonical-ambience,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift{
    display:none!important;opacity:0!important;visibility:hidden!important;animation:none!important;transition:none!important;transform:none!important;
  }

  /* Remove old broad atmospheric primitives that caused the white wash. */
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) :is(.level-one-time-sky,.level-one-time-haze,.level-one-sunset-vignette::before){display:none!important;opacity:0!important}

  /* Gameplay is always above environment. */
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
  const baseSky = makeImage("level-one-real-sky-image level-one-painted-sky-base", ORIGINAL_SKY_SRC);
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
