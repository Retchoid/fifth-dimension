// SELECTAH SHOWDOWN — direct record renderer v4.
// This file intentionally exists as a real tracked module so production builds cannot
// fall back to the old CSS/background/pseudo-element record paths.
const RECORD_SELECTOR = ".falling-object.record";
const RECORD_ASSET = "/embedded-assets/selectah-dubplate-5d-production-v2.png";

const styleImportant = (element: HTMLElement, property: string, value: string) => {
  element.style.setProperty(property, value, "important");
};

const renderRecord = (wrapper: Element) => {
  if (!(wrapper instanceof HTMLElement)) return;
  if (wrapper.querySelector(".mechanics-debug-object")) return;

  const existing = wrapper.querySelector(":scope > img.record-direct-sprite-v3");
  if (existing instanceof HTMLImageElement) return;

  const image = document.createElement("img");
  image.className = "record-direct-sprite-v3";
  image.src = RECORD_ASSET;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.draggable = false;

  styleImportant(wrapper, "overflow", "visible");
  styleImportant(wrapper, "background", "none");

  styleImportant(image, "display", "block");
  styleImportant(image, "visibility", "visible");
  styleImportant(image, "opacity", "1");
  styleImportant(image, "position", "absolute");
  styleImportant(image, "left", "50%");
  styleImportant(image, "top", "50%");
  styleImportant(image, "width", "30px");
  styleImportant(image, "height", "30px");
  styleImportant(image, "min-width", "30px");
  styleImportant(image, "min-height", "30px");
  styleImportant(image, "max-width", "30px");
  styleImportant(image, "max-height", "30px");
  styleImportant(image, "transform", "translate(-50%, -50%)");
  styleImportant(image, "transform-origin", "50% 50%");
  styleImportant(image, "object-fit", "contain");
  styleImportant(image, "z-index", "80");
  styleImportant(image, "pointer-events", "none");
  styleImportant(image, "clip", "auto");
  styleImportant(image, "clip-path", "none");
  styleImportant(image, "filter", "drop-shadow(0 0 1px #00e7ff) drop-shadow(0 0 2px #ff007a)");
  styleImportant(image, "image-rendering", "pixelated");

  wrapper.replaceChildren(image);
};

const scanForRecords = (root: ParentNode = document) => {
  root.querySelectorAll?.(RECORD_SELECTOR).forEach(renderRecord);
};

export const installDirectRecordRenderer = () => {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;

  scanForRecords();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      Array.from(mutation.addedNodes).forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(RECORD_SELECTOR)) renderRecord(node);
        scanForRecords(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
};
