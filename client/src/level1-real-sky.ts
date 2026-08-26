/*
 * LEVEL 1 TRUE TRANSPARENT FOREGROUND COMPOSITOR
 *
 * Use the user-supplied 5d_level1_no_sky.png directly as the foreground.
 * Its own alpha/checkerboard opening is the only place the sky can show.
 * No SVG masking, no canvas punching, no inferred 810x1800 geometry.
 * The canonical masters remain in the DOM only as a load/fallback safety net
 * and are hidden only after the transparent foreground successfully loads.
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const SKY_SOURCES = {
  golden: "/assets/1000001169_3204905a.png",
  dusk: "/assets/1000001166_e9b75dd0.png",
  night: "/assets/1000001168_c5184bab.png",
} as const;

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

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  if (!masters.length) return;
  await Promise.all(masters.map(waitForImage));

  host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky").forEach((node) => node.remove());

  const sky = document.createElement("span");
  sky.className = "level-one-real-sky-stack";
  sky.setAttribute("aria-hidden", "true");
  sky.append(
    makeImage("level-one-real-sky-image level-one-real-sky-golden", SKY_SOURCES.golden),
    makeImage("level-one-real-sky-image level-one-real-sky-dusk", SKY_SOURCES.dusk),
    makeImage("level-one-real-sky-image level-one-real-sky-night", SKY_SOURCES.night),
  );

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(sky);
  host.append(foreground);

  const loaded = await waitForImage(foreground);
  if (!loaded) {
    foreground.remove();
    sky.remove();
    return;
  }

  host.classList.add("level-one-transparent-foreground-ready");
};

const scan = () => {
  document.querySelectorAll(SKY_HOST_SELECTOR).forEach((host) => void installOnHost(host));
};

const observer = new MutationObserver(scan);
const start = () => {
  scan();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
