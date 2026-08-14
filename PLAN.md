# Game Plan: 5D Selector Showdown rebuild

## Goal

Rebuild Selector Showdown as a responsive, low-latency arcade game with a readable 2-bit jungle DJ sprite, a rave-stage background, and reliable keyboard, pointer, and touch movement.

## Risk slices

### 1. Low-latency animation loop

Keep mutable gameplay entities in refs, clamp frame delta, mutate catcher and falling-object transforms directly, and avoid React state updates for every animation frame. React should update only HUD values and structural item changes.

### 2. Input handoff across keyboard and touch

Use one normalized DJ x-position, map arrow/A-D keys and pointer/touch coordinates into that position, prevent page scrolling during active touch control, and clamp the catcher to visible bounds. Remove listeners during cleanup.

### 3. Sprite and background reliability

Use the generated pixel-art jungle DJ sprite with pixelated rendering, a generated rave-stage texture behind the playfield, and a CSS catcher fallback if the sprite URL cannot load.

### 4. Game continuity

Preserve score, lives, local high score, sound effects, five-record download unlock, replay, and the existing reduced-motion styling.

## Main build

The embedded game remains immediately before the visuals and booking content. A 2-bit jungle DJ holds a turntable at the bottom of a rave-stage playfield. Spinning vinyl records fall from above and award points when caught. Pink cop-badge hazards reduce lives when caught, while missed records also cost a life. The game includes a start overlay, score, high score, three-life HUD, sound toggle, game-over state, restart action, and keyboard/touch instructions.

## Verification criteria

The active game must show a readable 2-bit jungle DJ rather than an image-error placeholder. The DJ must respond immediately to Left/Right and A/D input, pointer movement, and touch dragging. Falling records and cop badges must remain visible, collisions must update score/lives, and the five-record unlock callback must remain connected. The rave background must be visible but keep gameplay readable. The page must pass `pnpm run check`, production build, responsive screenshots, and source/runtime audits without changing the booking, lightbox, audio, or contact flows.

## Current event-scene repair

The current repair consolidates visible splash rendering around the active queued sequence, adds a spinning-vinyl handoff before resumed or chained play, and retains the existing guarded game-loop pause/resume contract. It adds a five-dubplate `BOH! BOH! BIG UP` reward, a Level 2 fifteen-dubplate `RUN THE RIDDIM` reward, clearly visible speaker dancers in both levels, and revised Crowd Pressure Bonus entry copy.

## Isolated Level 2 after-party runner replacement

Only the old fire-escape bonus is being replaced. The new bonus opens during Level 2 immediately after 20 dubplates are collected with zero hits. It is an automatic forward, three-lane rear-view road run: A/D, arrows, touch drag, and existing pointer steering move the DJ left and right while the road, city, equipment, and hazards race toward the player. One each of headphones, turntable, microphone, speaker, mixer, and CDJ must be secured before the glowing after-party door opens. Any crackhead-cart, can, rock, or rat collision ends the bonus and returns to Level 2 without the reward. A clear awards session-only bright-purple camo to the DJ and a durable crown on the player’s shared leaderboard entry. Normal falling-object play, levels, event queue, release gate, score flow, and site remain outside the replacement boundary.
