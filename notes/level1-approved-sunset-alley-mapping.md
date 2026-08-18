# Level 1 Approved Blank-Alley Mapping

## Approved runtime environment

The user superseded the prior source with `1000001097.png`, a locked 16:9 clean standalone Level 1 environment. It is stored unchanged in managed project storage at:

`/manus-storage/level1-approved-locked-169-alley_8924f5b5.png`

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

The earlier sunset-alley image and the subsequent blank-alley asset have both been superseded before publication. The locked 16:9 alley is the only approved source to mount in the Level 1 render. The old Level 1 CSS-building JSX remains removed from the render path. It is rendered with `object-fit: cover` and a centered composition so the skyline and central pavement remain visible without distortion.

## Validation record

The focused Level 1 visual matrix passed at 320×800, 360×800, 375×812, 390×844, 412×915, 430×932, 768×1024, and 1280×720. It confirms that the locked 16:9 alley has loaded, covers the stage-background plane, keeps one gameplay Selectah, removes all retired flat Level 1 layers, and contains every visible item within the playfield and below the HUD. The normal Level 1 readability check also passed across the established five phone widths.

The visible translucent magenta blocks were traced to a legacy fallback selector in `arcade-scoped-overhaul.css`. Its inline-style test could not see the existing CSS custom-property asset URL, so it created a fallback pseudo-element behind normal assets. The Level 1 approved-art stylesheet now suppresses only that pseudo-element inside the Level 1 alley; the image assets, entity wrappers, hitboxes, collision system, and other levels are unchanged.

The retained exact-collision, permanent input-surface, and Crowd Pressure regressions passed after the visual pass. TypeScript, the full 20-file / 72-test suite, and the production build passed. The build retains existing runtime asset-resolution warnings; no build error occurred.
