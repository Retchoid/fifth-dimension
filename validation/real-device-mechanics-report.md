# Selectah Showdown — Corrected Real-Input Mechanics Report

## Scope and evidence standard

This report supersedes the earlier mechanics claim. The earlier matrix used internal debug methods, synthetic object setup, and direct collision triggering; it was therefore **not accepted as real gameplay proof**. The corrected checks use only the built React component, the public **Start Session** control, rendered falling-object geometry, and browser pointer movement. No `window` debug API, game-state setter, test spawn, or collision function was called by the real-input scripts.

## Root causes and repairs

| Concern | Confirmed root cause | Exact repair |
| --- | --- | --- |
| Start Session was unreliable on mobile | `pointerdown` from the child start button bubbled to the playfield. The playfield handler called `preventDefault()` and captured the pointer before the button’s click could fire. | The playfield now ignores interactive children and does not capture or cancel normal input before a session begins. Drag capture starts only on the active game surface. |
| Game playfield was covered | The Projects section was rendered at `z-index: 5`, while the enclosing arcade flow shell was overridden later to `z-index: 3`. The Project card therefore won the real hit test. | The authoritative arcade-flow rule is now `z-index: 9`, isolated, and visible. Mobile transforms and the negative cabinet margin that detached render coordinates from layout flow were removed. |
| Finger movement could be untraceable | Earlier diagnostics observed internal state rather than the DOM event path. | `?arcade-real-input-debug=true` adds an on-screen panel reporting pointer phase, capture state, actual hit-test target, raw/local/world X, player target/actual X, player hitbox, clean streak, hazard state, bonus eligibility, and bonus trigger state. |
| Crowd Pressure did not meet the clean-streak rule | Qualification used total records plus all-time hazard count, then only launched after Level 1 completion. | A dedicated clean-dubplate streak increments only from real caught records and resets on real record misses or hazards. At 15 it marks and launches Crowd Pressure once. Completing it before 25 records resumes active Level 1 rather than prematurely opening the Level 2 score handoff. |
| Post-hit recovery was not visible | The equipment condition changed, but the required recovery status was not rendered until a later visual state. | A compact `MIXER DAMAGED / RECOVER: n/3 DUBPLATES` status now appears immediately after a real hit and updates during the existing three-dubplate repair path. |

## Real rendered-input proof at 390 × 844

The normal public page verifier started the real **Start Session** control, held a browser pointer on the visible `.game-viewport`, and moved the same pointer to rendered falling objects. Its final event trace recorded the rendered stage background as the DOM target, `touch-action: none` on the playfield, and player target/actual world X agreement at `8.00 / 8.00` after the final drag. This verifies that the event was received by the real playfield and updated the actual player element rather than a separate test state.

| Scenario | Public rendered action | Observed outcome |
| --- | --- | --- |
| Start | Browser activated the public Start Session button | Start overlay dismissed and live playfield mounted. |
| Collectible | Pointer chased a rendered `falling-object record` | Collision log recorded `record → catch`; score increased by 200 and combo advanced. |
| Hazard | Pointer deliberately intersected a rendered `falling-object cop` | Collision log recorded `cop → hazard`; one heart was removed and recovery state appeared. |
| Recovery | Pointer caught three later rendered record objects | Three recovery catches were observed; public HUD retained three hearts after repair. |
| Avoidance | Pointer moved to the opposite lane as a later rendered hazard descended | The tracked hazard exited without a further hazard collision. |
| Crowd Pressure | A browser pointer controller avoided hazards and caught 15 rendered Level 1 records | Visible panel ended at `CLEAN STREAK: 15/15`, `BONUS ELIGIBLE: YES`, and `TRIGGERED: YES`. |

## Render order

The active playfield keeps the following explicit order: stage background, falling objects, player, impact feedback, constrained foreground edges, HUD, then temporary event overlays. The non-interactive background, foreground, falling-object layer, player, debug panels, and HUD all use `pointer-events: none` where appropriate so the `.game-viewport` remains the sole receiving gameplay surface. The corrected public hit test now resolves to the active game’s rendered stage subtree rather than the preceding Projects section.

## Regression gates

The repaired source passed **19 Vitest files / 63 tests**, TypeScript with no errors, and the production build. The production build reports existing managed `/embedded-assets` resolution notices; no assets or art were changed in this mechanics-only pass.

## Scope lock

No final artwork, replacement sprite, cabinet redesign, visual restyling, typography change, decorative animation, new UI concept, or game-rule expansion was created. The work is limited to real pointer routing, document stacking, mobile flow, visible mechanics diagnostics, recovery visibility, Crowd Pressure qualification, and no-injection evidence scripts.

## Final evidence amendment

The rejected runner has been moved out of `scripts/` to `validation/rejected-evidence/verify-mobile-mechanics.internal-only.mjs.txt`. It is retained only as a record of why it is invalid; it is not an executable or accepted evidence path.

The failed normal-page hit test resolved to **`article#exclusive.exclusive-release.dubplate-card-section`** from the preceding Projects section, rather than the game. Its parent Projects section was above the arcade because the later paint stylesheet set `.arcade-flow-shell` to `z-index: 3` while Projects was `z-index: 5`. This precise fault is corrected by the authoritative `z-index: 9` arcade shell rule, and the public browser hit stack now resolves to the game viewport and its active stage background.

The final **single normal public-page 390 × 844** run used `/?arcade-real-input-debug=true`, clicked the normal rendered Start Session button, and used browser pointer movement only. It reached `CLEAN STREAK: 15/15`, `BONUS ELIGIBLE: YES`, and `TRIGGERED: YES`, after routing 82 visible objects. It did not use `arcade-verifier`, `arcade-focus`, the quarantined matrix, `window.__selectahDebug`, manual state setters, object injection, or direct collision calls.
