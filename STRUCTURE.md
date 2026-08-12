# Structure: 5D Selector Showdown

The mini-game is embedded as a React section immediately before the site footer. `client/src/components/DjMiniGame.tsx` owns the presentation layer, control listeners, requestAnimationFrame lifecycle, game state, collision checks, HUD, start overlay, and game-over overlay. Gameplay entities are stored in refs so falling-item updates do not require a separate game engine or backend.

The surrounding site remains unchanged: `Home.tsx` imports and renders `<DjMiniGame />`, while `index.css` contains the game arena, HUD, selector artwork, falling-object, and responsive styles. The player artwork is lifecycle-backed media from `ASSETS.md`; records and cop badges use Lucide vector icons; the vaporwave arena is CSS-generated.

The game supports ArrowLeft/ArrowRight and A/D keyboard input plus pointer/touch movement on the game viewport. It is intentionally compact and deterministic enough to run as a self-contained page section without adding a backend or external game service.
