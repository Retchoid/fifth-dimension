# Structure: 5D Selector Showdown

The mini-game is embedded as a React section immediately before the visuals and booking flow. `client/src/components/DjMiniGame.tsx` owns presentation, control listeners, requestAnimationFrame lifecycle, game state, collision checks, HUD, start overlay, and game-over overlay.

Gameplay entities live in refs. The animation loop mutates falling-object `top` styles and the catcher `left` style directly, while React re-renders only HUD values and structural item changes. This keeps keyboard, pointer, and touch movement responsive without repainting the full arena on every frame.

The surrounding site remains unchanged: `Home.tsx` imports and renders `<DjMiniGame />`, while `index.css` contains the rave-stage background, HUD, pixel-art sprite, CSS fallback catcher, falling objects, and responsive styles. The generated sprite and background are lifecycle-backed media listed in `ASSETS.md`; records and cop badges use Lucide vector icons.

The game supports ArrowLeft/ArrowRight and A/D keyboard input plus pointer/touch movement on the game viewport. It remains a self-contained static frontend feature with no backend or external game service.

The current event repair keeps the queue and game-loop work in `DjMiniGame.tsx`, but the scene surface is derived from the active sequence rather than relying solely on a collection of independently mounted paused-state booleans. The shared record-spin handoff and all scene-specific CSS remain in `index.css`.

The after-party runner is an isolated bonus sub-loop in `DjMiniGame.tsx`, with independent runner entities, a dedicated HTML audio element, three-lane steering, collision checks, gear collection state, and a controlled handoff back to Level 2. Its styling is contained in a replacement bonus-only block in `index.css`. The shared leaderboard gains only a boolean crown field so the earned bonus clear can be displayed beside the public player tag; no account or personal information is added.
