/*
 * LEVEL 1 TRUE TRANSPARENT FOREGROUND COMPOSITOR
 *
 * The user-supplied 5d_level1_no_sky.png is the single foreground scene.
 * Its alpha opening is the only place the independent sky can show.
 * No full Golden/Waking/Dusk/Night scene master is ever used as a sky source.
 * The canonical masters remain only as a load fallback until the transparent
 * foreground succeeds, then CSS removes them from composition completely.
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const PAINTED_SKY_SRC = "/assets/level1-painted-sky-transparent-v1.webp";

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

  host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky,.level-one-real-sky-stack").forEach((node) => node.remove());

  const sky = document.createElement("span");
  sky.className = "level-one-real-sky-stack";
  sky.setAttribute("aria-hidden", "true");
  sky.append(makeImage("level-one-real-sky-image level-one-painted-sky", PAINTED_SKY_SRC));

  const foreground = makeImage("level-one-transparent-foreground", FOREGROUND_SRC);
  host.prepend(sky);
  host.append(foreground);

  const [foregroundLoaded, skyLoaded] = await Promise.all([
    waitForImage(foreground),
    waitForImage(sky.querySelector<HTMLImageElement>(".level-one-painted-sky")!),
  ]);

  if (!foregroundLoaded) {
    foreground.remove();
    sky.remove();
    return;
  }

  host.classList.add("level-one-transparent-foreground-ready");
  if (skyLoaded) host.classList.add("level-one-independent-sky-ready");
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
