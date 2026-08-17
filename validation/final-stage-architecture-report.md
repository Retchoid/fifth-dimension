# Selectah Showdown — Final Stage Architecture Report

## Scope preserved

This pass changes only active Selectah Showdown presentation and touch/pointer input. It does not alter scoring, collision dimensions, item spawn logic, game state flow, audio behavior, release-gate behavior, or unrelated site sections.

## Changed files

| File | Change |
|---|---|
| `client/src/lib/stageReactionController.ts` | Adds the typed `StageReaction`, `StageController`, energy clamp, exact reaction map, and combo-milestone resolver. |
| `client/src/lib/stageReactionController.test.ts` | Covers the exact supplied map, milestone resolution, state updates, and energy clamping. |
| `client/src/components/DjMiniGame.tsx` | Wires direct captured pointer drag, stage level/energy/reaction state, positive/miss/hazard triggers, clean reactive stage markup, and development-only stage verification. |
| `client/src/arcade-playfield-architecture.css` | Adds explicit stage stacking, clean Level 2 rave-stage source, 40–55% player visual scaling, and transform/opacity-only stage responses. |
| `client/src/lib/finalConsistency.test.ts` | Locks the clean stage asset, direct-drag capture, player scale, and stage reaction contract. |

## Stage architecture

| Layer | Implementation | Interaction rule |
|---|---|---|
| Background | Level 1 `selectah-level-one-urban-stage-reference`; Level 2 `5d-selector-rave-stage` | Static clean environment plate; no gallery UI or player baked into it. |
| Midground | Reserved `stage-midground` plane | Empty pending separable production environment assets. |
| Reactive | Sign accents, one restrained edge speaker, one edge NPC, and flyer particles | CSS transform/opacity only; no collision or layout effect. |
| Objects | Existing falling entities | Remain above scenery and retain existing collision geometry. |
| Player | Existing catcher wrapper plus smaller visual art transform | Visual-only scale, independent of hitbox. |
| FX / HUD / cabinet / events | Existing feedback, HUD, cabinet, and temporary overlays | Retain higher stacking and cannot become scenery. |

## Direct drag control

On pointer down, the game viewport captures the active pointer and maps the finger or mouse X coordinate directly into the existing player-position function. Pointer move updates only while that captured pointer is active; pointer up/cancel releases capture. A/D and arrow keyboard movement remain unchanged. No directional buttons or drag overlays are rendered.

## Player visual scale

| Context | Before | Final visual transform | Intent |
|---|---:|---:|---|
| Level 1 desktop | 1.72 | 0.86 | 50% of prior visual scale. |
| Level 1 mobile | 1.92 | 0.96 | 50% of prior visual scale. |
| Level 2 desktop | 1.16 | 0.62 | ~53% of prior visual scale. |
| Level 2 mobile | 1.28 | 0.70 | ~55% of prior visual scale. |

## Exact stage reaction map

| Reaction | Applied stage responses |
|---|---|
| `DUBPLATE_CATCH` | Shop-sign flash, speaker kick, NPC “boh”. |
| `COMBO_5` | Neon boost. |
| `COMBO_10` | Speaker pulse, NPC hands-up motion. |
| `COMBO_15` | Window/sign bass pulse treatment. |
| `COMBO_20` | High crowd energy and rave-signage state. |
| `COMBO_25` | Stage frenzy, bass flash, restrained flyer particles. |
| `MISS` | Light flicker and disappointed NPC posture. |
| `HAZARD_HIT` | Short stage glitch only. |

Every reaction clears automatically after 520ms, except the Combo 25 confirmation state, which clears after 900ms. Reactions are visual-only and use CSS transforms and opacity; no continuous filter or main-loop work was added.

## Required production assets

See `final-stage-architecture-audit.md` for the required clean multi-plane environment, transparent selector, object-family, reactive-element, and event-splash asset list. No substitute art was invented.

## Verification

The final 390×844 captures cover Level 1 active play, Level 2 active play, Combo 25 stage response, and hazard response. The regression suite passed 16 test files / 46 tests, followed by TypeScript compilation and a production build. The build retains runtime managed-storage asset references, as designed.
