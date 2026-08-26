/* LEVEL 1 TRUE TRANSPARENT FOREGROUND + SHARED CAMERA SKY + ALLEY LIFE */
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

const randomBetween = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

const installOriginalSkyContract = () => {
  if (document.getElementById("level-one-original-sky-contract")) return;
  document.getElementById("level-one-visible-sky-override")?.remove();
  const style = document.createElement("style");
  style.id = "level-one-original-sky-contract";
  style.textContent = `
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack{position:absolute!important;inset:0!important;z-index:0!important;background:none!important;filter:none!important;overflow:hidden!important;pointer-events:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::before{content:none!important;display:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::after{content:""!important;display:block!important;position:absolute!important;inset:0!important;z-index:4!important;pointer-events:none!important;opacity:0!important;background:transparent!important;mix-blend-mode:color!important;transition:opacity 1600ms ease,background 1600ms ease!important}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sky-camera-frame{position:absolute!important;overflow:hidden!important;z-index:1!important;pointer-events:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;object-position:50% 50%!important;mix-blend-mode:normal!important;transform-origin:50% 50%!important;pointer-events:none!important;transition:filter 1600ms cubic-bezier(.22,.72,.2,1),opacity 1400ms ease!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-base{z-index:1!important;opacity:1!important;transform:none!important;filter:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky-drift{z-index:2!important;opacity:.38!important;clip-path:inset(0 0 68% 0)!important;filter:saturate(1.16) contrast(1.08) brightness(1.05)!important;animation:level-one-original-cloud-drift 7.2s ease-in-out infinite alternate!important}

  /* Use the game's existing reliable time-state classes, not HUD text parsing. */
  .game-viewport.level-one-time-1 .level-one-painted-sky-base,.game-viewport.level-one-time-2 .level-one-painted-sky-base{filter:saturate(1.12) brightness(.88) hue-rotate(10deg)!important}
  .game-viewport.level-one-time-1 .level-one-painted-sky-drift,.game-viewport.level-one-time-2 .level-one-painted-sky-drift{opacity:.42!important;filter:saturate(1.24) contrast(1.10) brightness(.94) hue-rotate(10deg)!important}
  .game-viewport.level-one-time-1 .level-one-real-sky-stack::after,.game-viewport.level-one-time-2 .level-one-real-sky-stack::after{opacity:.20!important;background:#d94b79!important}

  .game-viewport.level-one-time-3 .level-one-painted-sky-base,.game-viewport.level-one-time-4 .level-one-painted-sky-base{filter:saturate(1.10) brightness(.64) hue-rotate(30deg)!important}
  .game-viewport.level-one-time-3 .level-one-painted-sky-drift,.game-viewport.level-one-time-4 .level-one-painted-sky-drift{opacity:.36!important;filter:saturate(1.18) contrast(1.12) brightness(.72) hue-rotate(30deg)!important}
  .game-viewport.level-one-time-3 .level-one-real-sky-stack::after,.game-viewport.level-one-time-4 .level-one-real-sky-stack::after{opacity:.34!important;background:#684a9d!important}

  .game-viewport.level-one-time-5 .level-one-painted-sky-base{filter:saturate(.90) brightness(.40) hue-rotate(56deg)!important}
  .game-viewport.level-one-time-5 .level-one-painted-sky-drift{opacity:.30!important;filter:saturate(1.0) contrast(1.14) brightness(.49) hue-rotate(56deg)!important}
  .game-viewport.level-one-time-5 .level-one-real-sky-stack::after{opacity:.44!important;background:#203b79!important}

  @keyframes level-one-original-cloud-drift{0%{transform:scale(1.045) translate3d(-2.3%,-.12%,0)}45%{transform:scale(1.052) translate3d(.1%,-.45%,0)}100%{transform:scale(1.045) translate3d(2.4%,.18%,0)}}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground{position:absolute!important;z-index:2!important;display:block!important;object-fit:fill!important;object-position:50% 50%!important;transform:none!important;transform-origin:50% 50%!important;pointer-events:none!important;opacity:0}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready>.level-one-transparent-foreground{opacity:1!important}

  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-art,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-approved-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-population,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-master-vignette,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready .level-one-canonical-ambience{display:none!important;opacity:0!important;visibility:hidden!important;animation:none!important;transition:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-transparent-foreground-ready::after{content:none!important;display:none!important;opacity:0!important;animation:none!important}
  `;
  document.head.append(style);
};

const alignSharedCamera = (host: Element, foreground: HTMLImageElement, frame: HTMLElement) => {
  const hostElement = host as HTMLElement;
  const width = hostElement.clientWidth;
  const height = hostElement.clientHeight;
  if (!width || !height || !foreground.naturalWidth || !foreground.naturalHeight) return;

  /* Reproduce the approved contain + 1.04 camera ONCE, then give the exact same
     measured rectangle to both the foreground and every sky source. */
  const containScale = Math.min(width / foreground.naturalWidth, height / foreground.naturalHeight);
  const renderedWidth = foreground.naturalWidth * containScale * 1.04;
  const renderedHeight = foreground.naturalHeight * containScale * 1.04;
  const left = (width - renderedWidth) / 2;
  const top = (height - renderedHeight) / 2;

  const applyBox = (element: HTMLElement) => {
    element.style.setProperty("left", `${left}px`, "important");
    element.style.setProperty("top", `${top}px`, "important");
    element.style.setProperty("width", `${renderedWidth}px`, "important");
    element.style.setProperty("height", `${renderedHeight}px`, "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
  };
  applyBox(foreground);
  applyBox(frame);
};

const installAlleyLife = (host: Element) => {
  const viewport = host.closest<HTMLElement>(".game-viewport");
  if (!viewport) return;
  const life = document.createElement("div");
  life.className = "level-one-alley-life";
  life.setAttribute("aria-hidden", "true");
  life.innerHTML = `<span class="alley-rat"><i></i></span><span class="alley-pipe-steam alley-pipe-steam-a"></span><span class="alley-pipe-steam alley-pipe-steam-b"></span><span class="alley-bouncer-life alley-bouncer-left"></span><span class="alley-bouncer-life alley-bouncer-right"></span><span class="alley-crowd-life alley-crowd-a"></span><span class="alley-crowd-life alley-crowd-b"></span><span class="alley-crowd-life alley-crowd-c"></span><span class="alley-window-light alley-window-a"></span><span class="alley-window-light alley-window-b"></span><span class="alley-window-light alley-window-c"></span><span class="alley-neon-life"></span><span class="alley-flyer-life"></span><div class="alley-earned-gear"><span class="earned-gear earned-crate"><i></i><i></i><i></i></span><span class="earned-gear earned-headphones"><i></i><b></b></span><span class="earned-gear earned-flightcase"></span><span class="earned-gear earned-cable"></span></div>`;
  host.append(life);

  const timers = new Set<number>();
  const schedule = (selector: string, className: string, minDelay: number, maxDelay: number, activeMs: number, probability = 1) => {
    const el = life.querySelector<HTMLElement>(selector);
    if (!el) return;
    const run = () => {
      if (!document.body.contains(host)) return;
      if (Math.random() <= probability) {
        el.classList.remove(className);
        void el.offsetWidth;
        el.classList.add(className);
        timers.add(window.setTimeout(() => el.classList.remove(className), activeMs));
      }
      timers.add(window.setTimeout(run, randomBetween(minDelay, maxDelay)));
    };
    timers.add(window.setTimeout(run, randomBetween(minDelay, maxDelay)));
  };
  schedule(".alley-rat", "is-scuttling", 18000, 42000, 2200, .72);
  schedule(".alley-pipe-steam-a", "is-bursting", 6500, 14500, 3300, .88);
  schedule(".alley-pipe-steam-b", "is-bursting", 23000, 48000, 4700, .68);
  schedule(".alley-bouncer-left", "is-moving", 12000, 29000, 1600, .72);
  schedule(".alley-bouncer-right", "is-moving", 17000, 35000, 1900, .66);
  schedule(".alley-crowd-a", "is-moving", 9000, 24000, 1400, .72);
  schedule(".alley-crowd-b", "is-moving", 13000, 31000, 1800, .66);
  schedule(".alley-crowd-c", "is-moving", 16000, 36000, 1300, .60);
  schedule(".alley-neon-life", "is-flickering", 11000, 27000, 1200, .72);
  schedule(".alley-flyer-life", "is-skittering", 26000, 56000, 3900, .55);
};

const retireLegacyLevelOneLayers = (host: Element, masters: HTMLImageElement[]) => {
  masters.forEach((master) => {
    master.style.setProperty("display", "none", "important");
    master.style.setProperty("opacity", "0", "important");
    master.style.setProperty("visibility", "hidden", "important");
    master.style.setProperty("animation", "none", "important");
    master.style.setProperty("transition", "none", "important");
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

  host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky,.level-one-real-sky-stack,.level-one-alley-life").forEach((node) => node.remove());

  const sky = document.createElement("span");
  sky.className = "level-one-real-sky-stack";
  sky.setAttribute("aria-hidden", "true");
  const frame = document.createElement("span");
  frame.className = "level-one-sky-camera-frame";
  frame.append(makeImage("level-one-real-sky-image level-one-painted-sky-base", ORIGINAL_SKY_SRC));
  frame.append(makeImage("level-one-real-sky-image level-one-painted-sky-drift", ORIGINAL_SKY_SRC));
  sky.append(frame);

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(sky);
  host.append(foreground);

  const images = Array.from(frame.querySelectorAll<HTMLImageElement>("img"));
  const [fgOk, ...skyResults] = await Promise.all([waitForImage(foreground), ...images.map(waitForImage)]);
  if (!fgOk) {
    foreground.remove();
    sky.remove();
    return;
  }

  alignSharedCamera(host, foreground, frame);
  const resizeObserver = new ResizeObserver(() => alignSharedCamera(host, foreground, frame));
  resizeObserver.observe(host as Element);

  host.classList.add("level-one-transparent-foreground-ready");
  retireLegacyLevelOneLayers(host, masters);
  if (skyResults.every(Boolean)) host.classList.add("level-one-independent-sky-ready");
  installAlleyLife(host);
};

const scan = () => document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => void installOnHost(host));
const observer = new MutationObserver(scan);
const start = () => {
  installOriginalSkyContract();
  scan();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
