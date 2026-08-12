# Memory

The Selector Showdown mini-game is an embedded React feature, not a route replacement. Its first implementation used a CSS-only catcher, then was corrected to use a generated selector artwork asset. The animation loop uses refs for `isPlaying`, score, lives, and falling entities so the requestAnimationFrame callback does not capture stale state. `DjMiniGame` cleans up the animation frame and keyboard listeners on unmount.

The main site remains static frontend-only. No backend, database, or external API is required. The game should continue to be verified with the WebDev preview, and the final delivery should use a saved WebDev checkpoint rather than a temporary public link.
