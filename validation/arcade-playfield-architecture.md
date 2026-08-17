# Selectah Showdown Playfield Architecture

## Current diagnosis

The game viewport currently renders `game-grid-bg`, `rave-world-dressing`, the HUD, temporary event states, falling items, and the selector within one container. Several older CSS layers independently style the grid background and its pseudo-elements, which creates the reported stacked-background/translucent-panel appearance. The pointer implementation already supports touch drag: `onPointerDown` captures touch and `onPointerMove` sends the horizontal coordinate to `updateDjPositionFromClientX`. The missing mobile-control requirement is therefore a clear, visible affordance—not a replacement movement mechanic.

## Replacement layer model

| Layer | DOM hook | Intended content | Rules |
|---|---|---|---|
| 0 — Cabinet | `.arcade-cabinet-bezel` | Existing cyan/magenta/orange cabinet, marquee, and footer | Preserved; no redesign. |
| 1 — Environment | `.game-grid-bg` | One original Level 1 urban stage or Level 2 Crowd Pressure stage image | Exactly one primary environment per level; no legacy panel/pseudo background. |
| 2 — Midground | `.rave-world-dressing` | Limited existing speaker, police, vinyl, and graffiti edge fragments | Confined to periphery; does not cross the central interaction corridor. |
| 3 — Foreground | Pseudo-elements on world dressing | Small edge-only illustrated elements | Does not overlap the player, items, HUD, or touch area. |
| 4 — Entities | `.falling-items-layer`, `.dj-catcher` | Existing sprite, dubplate, reward, and hazard assets | Above all environment art; collision geometry unchanged. |
| 5 — FX | `.damage-feedback`, `.in-world-reward`, pickup flash | Existing HUD/status effects | Short-lived, transform/opacity-only effects. |
| 6 — HUD | `.game-hud`, level-two meter | Required game state | Responsive two-row mobile grid; contained within viewport. |
| 7 — Temporary event state | `.game-overlay`, `.hazard-splash` | Existing event/splash artwork | Above intact gameplay; removal restores the same level environment. |

## Level compositions

**Level 1** uses `selectah-level-one-urban-stage-reference` as one coherent city-and-speaker environment. The central street remains the natural corridor. The existing `selectah-splash-art-direction` and `selectah-police-siren-urban` art may appear only as clipped peripheral fragments to carry the brush-stroke/police energy without creating a second full background.

**Level 2** uses `5d-selector-level-two-detailed-stage` as one coherent crowd/stage environment. Existing speaker-stack and dubplate art is confined to the edges, leaving the DJ/crowd perspective and the central object path readable. It does not tint or reuse the Level 1 skyline.

## Clean-environment source review — correction pass

The Level 1 asset `selectah-level-one-urban-stage-reference` is a clean 1920×1080 city/alley environment: it has no gallery UI, text, character, or embedded gameplay objects. It is suitable as the Level 1 environment source.

The Level 2 asset `5d-selector-level-two-detailed-stage` is a 1920×1080 crowd/stage scene **with a baked-in back-facing DJ, decks, speakers, and foreground hardware**. It is a valid art-direction reference but not a clean active-game background under the current correction brief. The active playfield must stop using it as a full background until a clean Level 2 crowd/stage environment source is supplied. No alternative clean Level 2 environment source was found in the retained 59-asset inventory.

## Temporary selector-sprite constraint

The existing `5d-selector-jungle-dj-sprite` is a square **1920×1920 source image with a baked-in dark backdrop**, not an alpha-transparent sprite. The current pass retains it unchanged as directed. The new playfield places it against dark, compositionally compatible areas and does not add a secondary translucent backing card. A genuinely transparent replacement requires the dedicated production sprite the user noted is being prepared; it is not simulated with a generated substitute in this pass.

## Explicit removals

The final layer will neutralize legacy `.game-grid-bg::before` and `.game-grid-bg::after` panel/background treatments and old full-viewport world-dressing overlays. It will not add a translucent rectangle, glass panel, blur field, or opaque central box.

## Verification record

The final verifier matrix was captured at **320×800**, **360×800**, **375×812**, **390×844**, **412×915**, **430×932**, **768×1024**, and **1280×800**. The 390px matrix included active Level 1, active Level 2, Cops, Too High, arrival/transition, crowd, record-dissolve, and game-over states. The 390px active scene also confirms visible **LEFT**, **DRAG PLAYFIELD**, and **RIGHT** affordances; the buttons use the existing horizontal-position update path while existing pointer drag and desktop keyboard control remain intact.

The final Level 2 desktop check initially exposed an over-scaled selector entering the HUD. The correction now keeps the larger Level 2 wrapper grounded with its own visual scale while preserving the stronger Level 1 mobile scale. Police and Too High captures confirm existing event screens remain temporary overlay states above the intact cabinet/playfield architecture.

Validation succeeded after the final correction: **15 test files / 45 tests**, TypeScript compilation, and production build. The build preserves runtime `/embedded-assets/` URLs by design through the managed legacy asset route; its Vite URL notices are runtime-resolution notices rather than broken path failures. The visual layer uses static image layers and transform/opacity-oriented entity/FX treatments, with no added canvas, generated asset, continuous blur, or duplicate full-resolution background rendering.
