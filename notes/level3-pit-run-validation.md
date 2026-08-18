# Level 3 Pit Run — Integration and Validation Record

## Scope completed

Level 3 remains an additional `LEVEL_3_PIT_RUN` state. The existing Level 2 completion handoff still calls `startPitRun()`; the added bridge shows **AFTERPARTY? / GRAB THE GEAR.** briefly while the existing Pit Run loop begins. The locked Level 1 and Level 2 input, player-world conversion, collision, scoring, lives, splash dispatch, Crowd Pressure, and 25/50 record requirements were not rewritten.

| Area | Delivered behavior |
| --- | --- |
| Approved art | The managed supplied Pit Run board is the runtime environmental art for the Club Exit, Deep Pit, and warm Afterparty Arrival crops. No new environmental artwork was generated or substituted. |
| Three-frame run | Club Exit covers 0–33%; Deep Pit covers 34–72%; Afterparty Arrival covers 73–100%, with a distinct brighter destination crop and dawn wash. |
| Direct control | The existing captured pointer route maps horizontal position to the Pit Run lane. No virtual buttons or joystick were added. |
| Objects | Existing illustrated DJ gear and street-hazard assets now render as physical visual entities in the same lane/depth plane used by the current collision loop. |
| Feedback | Gear recovery, combos, street hazards, near misses, flyer movement, police-light sweeps, impact flash, and progressive dawn lighting are CSS-only visual responses wired to the established stage-reaction events. |
| Completion | All required gear continues to gate the final approach; the completion state now presents an approved-art destination panel: **YOU MADE IT. / RUN THE AFTERS.** |

## Automated evidence

| Check | Result |
| --- | --- |
| TypeScript | Passed (`pnpm check`) |
| Unit/regression suite | Passed: 20 files, 72 tests (`pnpm test`) |
| Production build | Passed (`pnpm build`) |
| Existing Level 1/2 input and Layer 2 art checks | Passed: input-surface independence, Level 2 50 target/pointer, layered environment reactions, and five mobile object-scale checks |
| Bonus and collision regression | Passed: centralized bonus diagnostics and exact dubplate collision verifier |
| Direct chapter play | Passed: Crowd Pressure hand movement/hazards and Pit Run direct pointer lane movement/entity spawning |
| Pit Run collision | Passed: pointer movement into a rendered turntable in the matching lane changed the existing inventory from 0 to 1 |
| Pit Run hazard collision | Passed: direct pointer movement into a rendered bottle in lane 0 changed the existing Pit Run hit count from 0 to 1 |
| Actual completion handoff | Passed: the shared existing Level 2 completion cleanup entered Pit Run at desktop width and showed **AFTERPARTY? / GRAB THE GEAR.** before its intended short dismissal |
| Pit Run three-frame rendering | Passed at 320, 360, 375, 390, 412, and 430px widths: artwork loaded; player, HUD, and inventory remained inside the stage; all three frame classes rendered |
| Desktop Pit Run coverage | Passed at 1280px: the Level 2 completion handoff mounted the runner, compact HUD/inventory, bridge card, and a naturally spawned entity inside the playable stage |

## Remaining manual confirmation

The user’s requested **real-phone** playthrough remains necessary before this pass can be called fully accepted. Test the live checkpoint from Level 1 through Level 2 to Pit Run, move the runner with a finger, collect at least one gear object, take one street hazard, then confirm the Club Exit → Deep Pit → sunrise Afterparty sequence. This is not a claim that the real-device test has already been performed.
