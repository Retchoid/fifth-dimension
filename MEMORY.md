# Memory

Selector Showdown is an embedded React feature, not a route replacement. The previous implementation felt laggy because React state was updated for catcher movement and falling-item positions on every animation frame. The rebuild keeps gameplay entities in refs, clamps frame delta, mutates DOM transforms/positions directly, and uses React only for HUD and structural changes.

The catcher now uses a generated 2-bit Sega Genesis-inspired jungle DJ sprite with pixelated rendering, backed by a CSS-rendered neon selector fallback if the sprite fails. The playfield uses a generated rave-stage background with scanlines and a grid overlay.

Keyboard, pointer, and touch input share one normalized x-position. Touch movement prevents page scrolling within the game viewport, while keyboard listeners and the animation frame are cleaned up on unmount. Score, lives, local high score, sound effects, five-record unlock, and replay behavior remain part of the feature.

The main site remains static frontend-only. No backend, database, or external API is required. Continue verifying with the WebDev preview and deliver through a saved WebDev checkpoint rather than a temporary public link.
