const attachLevelOneTransitionSync = () => {
  if (typeof document === "undefined") return;

  const syncViewport = () => {
    const viewport = document.querySelector<HTMLElement>(".game-viewport");
    if (!viewport) return;

    if (viewport.classList.contains("level-one-time-0")) {
      viewport.classList.remove("level-one-big-up-reached");
    }

    if (
      viewport.querySelector(".in-world-reward-big-up") ||
      viewport.querySelector(".combo-reaction-big-up")
    ) {
      viewport.classList.add("level-one-big-up-reached");
    }
  };

  const observer = new MutationObserver(syncViewport);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  syncViewport();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachLevelOneTransitionSync, { once: true });
} else {
  attachLevelOneTransitionSync();
}
