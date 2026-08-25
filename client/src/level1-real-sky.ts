/*
 * LEVEL 1 SKY — CANONICAL MASTER SAFE
 *
 * The canonical Level 1 master images remain the visible environment.
 * Never substitute 5d_level1_no_sky.png for them and never hide them.
 * The animated sky is only an underlay; transparency already present in the
 * rendered master is the only place where it can be seen.
 *
 * Camera contract stays object-fit:contain, centered, scale(1.04).
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

const syncSkyToMasterImageRect = (host: Element, master: HTMLImageElement, sky: HTMLElement) => {
  const hostRect = host.getBoundingClientRect();
  const naturalWidth = master.naturalWidth;
  const naturalHeight = master.naturalHeight;
  if (!hostRect.width || !hostRect.height || !naturalWidth || !naturalHeight) return;

  const fit = Math.min(hostRect.width / naturalWidth, hostRect.height / naturalHeight);
  const renderedWidth = naturalWidth * fit;
  const renderedHeight = naturalHeight * fit;
  const left = (hostRect.width - renderedWidth) / 2;
  const top = (hostRect.height - renderedHeight) / 2;

  sky.style.left = `${left}px`;
  sky.style.top = `${top}px`;
  sky.style.width = `${renderedWidth}px`;
  sky.style.height = `${renderedHeight}px`;
  sky.style.transform = `scale(${CAMERA_SCALE})`;
  sky.style.transformOrigin = "50% 50%";
};

const installOnHost = async (host: Element) => {
  if (processedHosts.has(host)) return;
  processedHosts.add(host);

  const masters = Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));
  if (!masters.length) return;
  await Promise.all(masters.map(waitForImage));

  const geometryMaster = masters.find((master) => master.naturalWidth && master.naturalHeight);
  if (!geometryMaster) return;

  const sky = document.createElement("span");
  sky.className = "level-one-animated-sky";
  sky.setAttribute("aria-hidden", "true");
  host.insertBefore(sky, host.firstChild);

  syncSkyToMasterImageRect(host, geometryMaster, sky);
  const ro = new ResizeObserver(() => syncSkyToMasterImageRect(host, geometryMaster, sky));
  ro.observe(host);
  resizeObservers.set(host, ro);

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
