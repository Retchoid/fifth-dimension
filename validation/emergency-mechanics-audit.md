# Emergency Mechanics Lock — Level 1 Report

## 1. Root Cause of the Mobile-Control Regression

The selector moved through a correct pointer-to-world conversion, but **routing was selected by temporary bonus presentation flags**. A stale `isBonusLevelActive`, `isNoRequestBonusActive`, or `isPitRunActive` flag could route a normal Level 1 pointer move into bonus-lane input. The normal route also correctly required the captured `playfieldPointerRef`, but this made the misroute look like a dead zone rather than a visible error.

The repair selects the control route from authoritative `gameModeRef` chapter ownership. `LEVEL_1` and `LEVEL_2` use the selector path; `BONUS_CROWD_PRESSURE`, `BONUS_LEVEL_2`, and `LEVEL_3_PIT_RUN` use the alternate lane route. The playfield retains one Pointer Events lifecycle: **down records and captures, move updates, and up/cancel releases**.

## 2. Files and Functions Responsible

| File | Functions / contracts | Completed change |
| --- | --- | --- |
| `client/src/components/DjMiniGame.tsx` | `updateDjPositionFromClientX`, `handlePointerMove`, `setPlayerWorldX`, playfield Pointer Events, game loop | Repaired input routing, captured-pointer lifecycle, explicit gameplay state, debug diagnostics, and browser-verifier hooks. |
| `client/src/lib/gameWorld.ts` | `clientXToWorldX`, `playerRectFromCenterX`, `resolveWorldCollision` | Retained as the single coordinate and collision authority. |
| `client/src/arcade-playfield-architecture.css` | scoped playfield styles | Preserved scoped gesture containment and added query-gated debug rectangles, impact flash, and log panel. |
| `client/src/lib/finalConsistency.test.ts` | regression assertions | Locked six target viewports, debug mode, capture/release, and color-debug contracts. |
| `scripts/verify-mobile-mechanics.mjs` | browser acceptance runner | Added repeatable six-viewport touch/collision and keyboard fallback evidence. |

## 3. Changes Made

The normal selector and bonus controls now route from chapter state rather than animation/presentation flags. `touch-action: none` is scoped to the active playfield alone. The debug surface is query-gated with `?arcade-mechanics-debug=true`; it is not active in ordinary sessions.

An explicit gameplay ownership signal now distinguishes `PLAYING`, `BONUS`, `DAMAGED`, `RECOVERY`, `LEVEL_COMPLETE`, `GAME_OVER`, and `LEVEL_TRANSITION`. The collision branch owns damage, recovery, completion, and game-over transitions; resumed normal play explicitly returns to `PLAYING`.

## 4. World-to-Screen Coordinate Contract

The rendered playfield bounds are measured at interaction time. `clientXToWorldX(clientX, rect.left, rect.width)` converts screen X into the shared 0–100 world. `playerRectFromCenterX` produces the authoritative player rectangle (`15 × 20` at world Y `70`) and clamps it to the allowed range. CSS scales the DJ art independently; it does **not** modify item positions or collision geometry.

## 5. Collision System

Every active item is moved in the authoritative frame loop and checked once with `resolveWorldCollision(playerWorldRef.current, movedItem)`. A catch changes score and combo; a hazard removes exactly one life and resets combo; a miss resets combo with no life damage. The development log records entity, collision, reaction, score effect, damage, remaining lives, and combo.

## 6. Mobile Viewport Acceptance Results

The browser runner used a touch-enabled mobile context for all required dimensions. At each viewport it asserted captured touch drag mappings of **8% → 50% → 90%**, `touch-action: none`, one-time catch/hazard/miss handling, and a completed Level 1 counter. Keyboard fallback was checked in a live 390 × 844 session: the selector moved from `50%` to `35.7026%` while `A` was held.

| Viewport | Touch drag | Collision probe | Scoped gesture containment | Result |
| --- | --- | --- | --- | --- |
| 320 × 800 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |
| 360 × 800 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |
| 375 × 812 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |
| 390 × 844 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |
| 412 × 915 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |
| 430 × 932 | `8% | 50% | 90%` | Catch, hazard, miss, completion | `touch-action: none` | Pass |

## 7. Level 1 Collectible, Hazard, and Miss Proof

Each target viewport recorded the same one-time event sequence. A dubplate catch produced `score=+200`, `lives=4`, and `combo=2`; a pill hazard produced `damage=1`, `lives=3`, and `combo=1`; a miss produced `damage=0`, `lives=4`, and `combo=1`. The completion probe cleared its item and reached the Level 1 target of `25` records.

## 8. Level 2 Target Confirmation

**Level 2 remains 50 items.** The source retains `const LEVEL_TWO_REQUIRED_RECORDS = 50`, completion compares against that constant, and the HUD uses the same target. No progression target or gameplay rule was changed in this repair.

## 9. Collision-Debug Mode and Screenshot

Debug mode uses **green** collectible rectangles, **red** hazard rectangles, and **yellow** bonus rectangles. It additionally displays exact item bounds, a cyan authoritative player hitbox, a collision-region flash, and the five latest structured event records. Use this development route:

```text
?arcade-mobile-matrix=true&arcade-mechanics-debug=true&arcade-focus=true
```

The companion collision-debug screenshot is saved outside the deployed project asset tree at `/home/ubuntu/webdev-static-assets/selectah-mechanics-debug-390-final.png`.

## 10. No-Art Confirmation and Stop Condition

No final artwork, background generation, cabinet redesign, new UI, splash redesign, decorative animation, typography change, character replacement, or game-rule change was performed. This pass is limited to game-engine input repair, explicit state ownership, collision diagnostics, automated acceptance evidence, and documentation. **The mechanics lock stops here.**

## Validation

The final automated suite passed with **19 test files and 60 tests**. `pnpm check` completed with no TypeScript errors. A production build completed successfully before the final verifier-only timing refinement; the final source and verifier changes are additionally covered by the complete test suite and compiler pass.
