# Game Plan: 5D Selector Showdown

## Risk Tasks

### 1. Continuous falling-item loop
- **Why isolated:** The game must update falling records and cop badges continuously while React remains responsive.
- **Approach:** Keep mutable gameplay entities in refs, use one requestAnimationFrame loop, and mirror only score, lives, position, and state into React for rendering.
- **Verify:** Starting a session continues spawning and moving objects beyond the first frame; score and lives persist across multiple catches, misses, and hazards; the loop stops on game over and unmount.

### 2. Input handoff across keyboard and touch
- **Why isolated:** Keyboard listeners and pointer/touch movement can fight each other or remain attached after the game is left.
- **Approach:** Use a single normalized DJ x-position, map arrow/A-D keys and pointer/touch coordinates into that position, prevent page scrolling during active touch control, and remove listeners during cleanup.
- **Verify:** Left/Right and A/D move the catcher; touch/drag moves it on mobile; no stale listeners remain after unmount.

## Main Build

Build an embedded game section immediately before the site footer. The player is a compact neon DJ with a turntable at the bottom of a vaporwave sound-system arena. Spinning vinyl records fall from above and award points when caught. Pink cop-badge hazards reduce lives when caught, while missed records also cost a life. The game includes a start overlay, score, high score, three-life HUD, game-over state, restart action, and keyboard/touch instructions.

- **Assets needed:** Existing 5th Dimension character portrait for the small DJ avatar; Lucide vector icons for records and cop badges; CSS-generated vaporwave grid, neon UI, turntable, and skyline treatment.
- **Verify:**
  - Records and hazards visibly fall and the catcher responds to input.
  - Catching records increments score; hazards and missed records reduce lives.
  - Game over stops the loop and offers restart.
  - HUD, controls, and game canvas remain readable on desktop and mobile.
  - No missing assets, clipping, or browser console errors.
  - The mini-game appears at the bottom of the existing page without changing the booking, lightbox, audio, or contact flows.
  - The game’s neon palette matches the vaporwave/dancehall/junglist visual system.
  - `pnpm run check`, production build, unit tests, and responsive screenshots pass.
