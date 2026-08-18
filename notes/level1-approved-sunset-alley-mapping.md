# Level 1 Approved Blank-Alley Mapping

## Approved runtime environment

The user corrected the source and supplied `1000001096.png` as the clean standalone Level 1 environment. It is stored unchanged in managed project storage at:

`/manus-storage/level1-approved-blank-alley_45d3af4b.png`

`1000001035.png` is retained at `/manus-storage/level1-approved-parallax-reference_c598ea82.png` as the supplied visual/layer reference board only. It is not a runtime background. The blank-alley asset is a standalone environment image, not a completed-game screenshot. The runtime retains the player, falling collectible and hazard entities, HUD, impact feedback, and input plane as separate elements above it.

## Level 1-only layer contract

| Render layer | Implementation | Ownership |
| --- | --- | --- |
| Background | Full illustrated sunset-alley asset with responsive cover crop | Visual only |
| Midground | The environment’s embedded walls, graffiti, speakers, signage, train, fire escapes, wires, doors, and practical lights | Visual only |
| Play plane | Existing Selectah catcher, falling-item wrappers, hitboxes, collision loop, and direct pointer input surface | Locked mechanics |
| Foreground | Environment’s embedded pavement, crates, bins, cans, records, cables, and reflected street texture, plus non-blocking atmospheric light/flyer layers | Visual only |
| HUD and events | Existing HUD, temporary feedback, and overlays | Locked mechanics; visual weight only may be adjusted |

## Explicit exclusions

The former CSS-built rooftops, flat building façades, simple doors, ladders, police van, floor slab, arbitrary NPC blocks, edge speaker, and decorative dancer are retired from Level 1 rendering. The one gameplay Selectah remains unchanged and is the sole Selectah in active Level 1 play.

## Safety boundary

This mapping applies only when `level === 1`. It does not alter Level 2 or Level 3 JSX, styling, state transitions, spawn timing, pointer/touch input, collision dimensions, scoring, combo values, lives, splash triggers, bonus triggers, or level progression.

## Initial live mounting check

The earlier sunset-alley image has been superseded before publication. The corrected blank-alley asset is the only approved source to mount in the Level 1 render. The old Level 1 CSS-building JSX remains removed from the render path. The first browser route capture was performed through a page-level verifier layout, so a focused playfield capture remains necessary for scale and corridor review; it is not evidence of a Level 2 or Level 3 change.

## Validation record

The focused five-width Level 1 visual matrix passed at 360×800, 375×812, 390×844, 412×915, and 430×932. It confirms the corrected background has loaded, covers the stage-background plane, keeps one gameplay Selectah, removes all retired flat Level 1 layers, and contains every enlarged visual item inside the playfield and below the HUD. The normal Level 1 readability check also passed at the same five widths.

The retained exact-collision, permanent input-surface, and Crowd Pressure regressions passed after the visual pass. TypeScript, the full 20-file / 72-test suite, and the production build passed. The build retains existing runtime asset-resolution warnings; no build error occurred.
