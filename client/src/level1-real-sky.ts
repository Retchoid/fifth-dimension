/*
 * LEVEL 1 CHECKERBOARD-ONLY REAL SKY
 *
 * Safety contract:
 * - canonical Level 1 masters remain mounted, visible, unmasked and untouched
 * - no replacement foreground PNG and no canvas/runtime pixel punching
 * - the sky overlay is aligned to the master's real object-fit:contain bitmap
 * - CSS inverts the supplied SVG on the SKY OVERLAY only, so the overlay can
 *   exist only in the checkerboard/window region
 * - camera remains centered with scale(1.04)
 */

import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const CAMERA_SCALE = 1.04;
const processedHosts = new WeakSet<Element>();
const resizeObservers = new WeakMap<Element, ResizeObserver>();

const waitForImage = (image: HTMLImageElement) => new Promise<void>((resolve) => {
  if (image.complete && image.naturalWidth && image.naturalHeight) return resolve();
  const finish = () => resolve();
  image.addEventListener("load", finish, { once: true });
  image.addEventListener("error", finish, { once: true });
});

const syncOverlayToMasterImageRect = (host: Element, master: HTMLImageElement, overlay: HTMLElement) => {
  const hostRect = host.getBoundingClientRect();
  const naturalWidth = master.naturalWidth;
  const naturalHeight = master.naturalHeight;
  if (!hostRect.width || !hostRect.height || !naturalWidth || !naturalHeight) return;

  const fit = Math.min(hostRect.width / naturalWidth, hostRect.height / naturalHeight);
  const renderedWidth = naturalWidth * fit;
  const renderedHeight = naturalHeight * fit;
  const left = (hostRect.width - renderedWidth) / 2;
  const top = (hostRect.height - renderedHeight) / 2;

  overlay.style.left = `${left}px`;
  overlay.style.top = `${top}px`;
  overlay.style.width = `${renderedWidth}px`;
  overlay.style.height = `${renderedHeight}px`;
  overlay.style.transform = `scale(${CAMERA_SCALE})`;
  overlay.style.transformOrigin = "50% 50%";
};

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  if (!masters.length) return;
  await Promise.all(masters.map(waitForImage));

  const geometryMaster = masters.find((master) => master.naturalWidth && master.naturalHeight);
  if (!geometryMaster) return;

  const staleSky = host.querySelector(".level-one-animated-sky");
  staleSky?.remove();

  const sky = document.createElement("span");
  sky.className = "level-one-checkerboard-sky";
  sky.setAttribute("aria-hidden", "true");
  host.appendChild(sky);

  const sync = () => syncOverlayToMasterImageRect(host, geometryMaster, sky);
  sync();

  const ro = new ResizeObserver(sync);
  ro.observe(host);
  resizeObservers.set(host, ro);

  host.classList.add("level-one-checkerboard-sky-ready");
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
