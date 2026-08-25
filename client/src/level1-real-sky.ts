/*
 * LEVEL 1 CHECKERBOARD-SCOPED SKY
 *
 * Contract: animated sky -> matching checkerboard PNG foreground -> gameplay.
 *
 * The uploaded 5d_level1_no_sky.png is the only foreground authorized for the
 * SVG cutout. rEU3ZkO01.svg is never applied to the four canonical Level 1
 * masters. Those images stay in the DOM untouched as fallback/state references.
 *
 * Only the checkerboard/transparent opening in the matching 810x1800 PNG may
 * reveal the animated sky. Camera contract stays object-fit:contain, centered,
 * scale(1.04).
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const CAMERA_SCALE = 1.04;
const MATCHING_CHECKERBOARD_PNG = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const MATCHING_WIDTH = 810;
const MATCHING_HEIGHT = 1800;
const processedHosts = new WeakSet<Element>();
const resizeObservers = new WeakMap<Element, ResizeObserver>();

const waitForImage = (image: HTMLImageElement) => new Promise<void>((resolve) => {
  if (image.complete && image.naturalWidth && image.naturalHeight) return resolve();
  const finish = () => resolve();
  image.addEventListener("load", finish, { once: true });
  image.addEventListener("error", finish, { once: true });
});

const syncLayerToImageRect = (
  host: Element,
  geometryImage: HTMLImageElement,
  layer: HTMLElement,
) => {
  const hostRect = host.getBoundingClientRect();
  const naturalWidth = geometryImage.naturalWidth;
  const naturalHeight = geometryImage.naturalHeight;
  if (!hostRect.width || !hostRect.height || !naturalWidth || !naturalHeight) return;

  const fit = Math.min(hostRect.width / naturalWidth, hostRect.height / naturalHeight);
  const renderedWidth = naturalWidth * fit;
  const renderedHeight = naturalHeight * fit;
  const left = (hostRect.width - renderedWidth) / 2;
  const top = (hostRect.height - renderedHeight) / 2;

  layer.style.left = `${left}px`;
  layer.style.top = `${top}px`;
  layer.style.width = `${renderedWidth}px`;
  layer.style.height = `${renderedHeight}px`;
  layer.style.transform = `scale(${CAMERA_SCALE})`;
  layer.style.transformOrigin = "50% 50%";
};

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  if (!masters.length) return;
  await Promise.all(masters.map(waitForImage));

  /* Dedicated uploaded foreground. We validate its exact natural dimensions
     before exposing any sky. If the asset does not match, abort safely and leave
     the canonical masters completely unchanged. */
  const foreground = document.createElement("img");
  foreground.className = "level-one-checkerboard-foreground";
  foreground.src = MATCHING_CHECKERBOARD_PNG;
  foreground.alt = "";
  foreground.setAttribute("aria-hidden", "true");
  await waitForImage(foreground);

  if (foreground.naturalWidth !== MATCHING_WIDTH || foreground.naturalHeight !== MATCHING_HEIGHT) {
    return;
  }

  const sky = document.createElement("span");
  sky.className = "level-one-animated-sky";
  sky.setAttribute("aria-hidden", "true");

  host.insertBefore(sky, host.firstChild);
  host.appendChild(foreground);

  syncLayerToImageRect(host, foreground, sky);
  syncLayerToImageRect(host, foreground, foreground);

  const ro = new ResizeObserver(() => {
    syncLayerToImageRect(host, foreground, sky);
    syncLayerToImageRect(host, foreground, foreground);
  });
  ro.observe(host);
  resizeObservers.set(host, ro);

  host.classList.add("level-one-checkerboard-foreground-ready");
  host.classList.add("level-one-real-sky-ready");
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
