# Selectah Showdown — Amended Gameplay Structure Mapping

## Existing systems to preserve

| Current system | Existing responsibility | Amended role |
|---|---|---|
| Shared player/object world | Pointer and keyboard movement, one coordinate system, one-time collision resolution | Remains the authoritative gameplay substrate for Level 1 and Level 2; Crowd Pressure uses a hand world-rectangle and Pit Run uses a runner rectangle under the same control contract. |
| Level 1 Dubplate Run | Exterior 25-record run with sunset-to-rave stage progression | Remains Chapter 1, with physical equipment condition and a 15-clean-dubplate Crowd Pressure entry. |
| No Request bonus | Existing Level 1 bonus route and state restoration mechanics | Becomes the implementation base for the distinct Crowd Pressure behind-the-decks mode; its unrelated obstacle list will be replaced by crowd-origin hazards. |
| Level 2 Crowd Pressure stage | Existing 50-record interior club run with 1×–25× environment response | Remains Chapter 2; the 50-item target remains canonical and its earned bonus remains an integrated hook. |
| Existing runner bonus | Pseudo-3D gear/hazard loop with left/right control, inventory, and after-party visual language | Becomes the foundation of full Level 3 Pit Run rather than an isolated bonus. |
| StageReactionController | Catch, hazard, miss, damage, combo-tier, and level-complete environment state | Extends with chapter-aware equipment, blocked-hazard, street-hazard, gear-recovered, and near-miss reactions without replacing current Level 1/2 contracts. |

## Required transition contract

The amended state path is **Level 1 → Crowd Pressure → Level 1 return → Level 2 → existing earned Level 2 bonus → Level 3 Pit Run → Afterparty**. Each handoff must retain score, lives, selector tag, unlock state, equipment condition, combo where appropriate, and acquired gear. Level 1’s original 25-dubplate completion still gates the release-chain flow; the 15-clean-dubplate bonus is additive and must not discard the run.

## Immediate implementation order

The first implementation pass will add explicit game/chapter state and physical equipment condition without changing the repaired game-world functions. The second pass will migrate the current Level 1 bonus loop into a Crowd Pressure prototype using a hand catcher, booth-impact target, crowd-origin hazards, and return-state snapshot. The existing Level 2 50-record contract is then guarded with regression tests before the runner loop is promoted into Level 3.

## Pass C live interaction evidence

The sandbox Crowd Pressure verifier rendered an active behind-the-decks scene with four incoming crowd hazards. Captured touch-type `PointerEvent` input moved the real DJ hand from `left: 12%` to `left: 88%`, confirming that the bonus uses the shared horizontal control path and moves the hand rather than the selector sprite.

## Pass E live interaction evidence

The sandbox harness promoted the game into `LVL 3` with the `LEVEL 3 · PIT RUN` HUD, pseudo-3D approach world, six-slot critical-gear inventory, lane runner, approaching entities, and `AFTERPARTY APPROACH` recovery gate. The loop reached its intended 94% cap while required gear remained missing, demonstrating the final-recovery behaviour rather than silently completing the chapter.

When all six required gear slots were recovered through the live Pit Run path, the game transitioned to the placeholder afterparty payoff with the rendered message `SOUND SYSTEM DELIVERED / ROCK THE JAM` and the recovered-kit list. This confirms that the Level 3 completion condition is inventory-gated.

## Mobile capture selection

The retained 390×844 active-scene capture shows the compressed cabinet with the inside-club Level 2 playfield, selector, HUD, speakers, booth floor, and readable game lane. The separate initial-card capture is retained only as a responsive layout check and is not used as gameplay evidence.
