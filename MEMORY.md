# Memory

Selector Showdown is an embedded React feature, not a route replacement. The previous implementation felt laggy because React state was updated for catcher movement and falling-item positions on every animation frame. The rebuild keeps gameplay entities in refs, clamps frame delta, mutates DOM transforms/positions directly, and uses React only for HUD and structural changes.

The catcher now uses a generated 2-bit Sega Genesis-inspired jungle DJ sprite with pixelated rendering, backed by a CSS-rendered neon selector fallback if the sprite fails. The playfield uses a generated rave-stage background with scanlines and a grid overlay.

Keyboard, pointer, and touch input share one normalized x-position. Touch movement prevents page scrolling within the game viewport, while keyboard listeners and the animation frame are cleaned up on unmount. Score, lives, local high score, sound effects, five-record unlock, and replay behavior remain part of the feature.

The main site remains static frontend-only. No backend, database, or external API is required. Continue verifying with the WebDev preview and deliver through a saved WebDev checkpoint rather than a temporary public link.

The arcade now has a public score table backed by the existing project database. Do not remove the public score query or mutation while repairing visual event scenes. The player reported unreliable non-police event visibility, so the repair must test every queued scene directly instead of inferring success from source alone.

During the current repair, the development-only sequence hook was confirmed available in the browser. Sequence state updates require a rendered-frame check after invoking the hook; immediate DOM reads occur before React has committed the overlay.

Browser inspection confirmed the repaired pill scene is visibly rendered in the cabinet with the selector sprite, oversized pupils, `PITCH WOBBLE`, radial cut-in treatment, and the updated Riddim copy. The police scene has also been queued through the same deterministic hook and is awaiting its rendered-frame inspection.

The police seizure scene was then visually confirmed after its entry animation. The cruiser, `COPS SEIZED YOUR MIXER` copy, DJ reaction, and recovery-combo prompt remained visible rather than fading while the active scene timer was held.

The development-only record-transition verifier was also added and visually confirmed. It renders a cabinet-filling spinning vinyl with `SPIN BACK TO THE SET`, which is the exact handoff now used after every queued scene before play resumes or the next scene begins.

A clean development session was opened and the Level 2 start verifier accepted the transition request. The subsequent render check will validate the revised Crowd Pressure Bonus wording, compact meter, and speaker-dancer state without relying on an in-progress player run.

The Level 2 play state was visibly verified: both permanent stage-backdrop dancers and the new two-dancer speaker-stack layer render at the left and right edges, leaving the DJ and centre pickup lane clear. The Crowd Hype meter remains compact in the lower-right of the cabinet. The five-dubplate selector-salute scene has now been triggered for its own rendered-frame review.

The ordinary, non-held debug run later reached a real game-over state through random gameplay without a player tag, so it did not create public score data. A separate clean `arcade-hold` verifier session is ready for independent inspection of the two new reward scenes.

The held five-dubplate `BOH! BOH! BIG UP` cut-in was visibly confirmed. It presents the record, `5 DUBPLATES / +250` label, and reward copy at full opacity for the active scene duration.

The held `RUN THE RIDDIM!` Level 2 reward was also visibly confirmed with its three-cone speaker stack, `LEVEL 2 / 15 DUBPLATES / +500` kicker, and high-contrast cut-in copy. Level 2 dancers are verified; the final browser check is the Level 1 speaker-dancer condition at its 10-dubplate stage threshold.

The development-only Level 1 speaker-stage view was visibly verified at 15 dubplates. The lime and magenta dancer sprites sit on the two outer speaker stacks while the DJ and central pickup lane remain unblocked. Both level-specific speaker-dancer conditions are now browser-verified.

Final automated validation passed: 16 unit tests, the release-gate suite, the 61-hook selector regression audit, TypeScript, and production build. The ordinary visitor arcade page also loaded with an empty browser console after the repair.

The final deterministic active-queue mount sweep confirmed rewind, Wheel It Up, police, pill, crate, headphones, BOH, and Run The Riddim. The crowd result initially used stale `BAD SELECTION` audit text; its approved `WRONG TUNE MY SELECTAH` text was then confirmed in the DOM and by direct cabinet inspection. Every queued special-event cut-in now mounts visibly.

The old Level 1 No Request Bonus fire-escape mode is superseded only within the bonus subsystem. The confirmed replacement is a Level 2, zero-hit, 20-dubplate after-party runner with automatic forward perspective movement and only left/right player steering. It needs one headphones, turntable, microphone, speaker, mixer, and CDJ pickup; a cart, can, rock, or rat ends the bonus. The success reward is session-only bright-purple camo plus a crown persisted with the submitted public leaderboard entry.

The first development-only after-party trigger set the expected Level 2 state (20/50 with four hearts) but did not retain a visible runner surface. This is an active launch-path finding, not a release result: the bonus must remain mounted through a rendered-frame check before the replacement can be published.

After invalidating the main game run at bonus entry and giving the existing hold verifier a runner-safe mode, the active after-party scene was visibly confirmed. It shows the night city, converging road, descending building light and door, rear-view DJ, six-slot gear checklist, zero-hit instructions, and a stable `DISTANCE 5% / GEAR 0/6` HUD. The next checks are the immediate-fail branch and the clear/reward/crown branch.

The deterministic fail branch returned to the ordinary Level 2 flow as designed. The deterministic clear branch returned to Level 2 with `.bonus-camo-unlocked` present on the DJ catcher, confirming the bright-purple session reward persists. No debug operation called the public score mutation or created a synthetic leaderboard entry.

The clean, non-debug arcade session was reopened after the bonus checks. It loaded the ordinary Level 1 start screen and browser console reported no runtime output or errors.

The after-party soundtrack was hardened by priming its dedicated MP3 under the original Start Session gesture. A held runner inspection then returned `paused: false`, `readyState: 4`, and an advancing playback time. After the full clear return interval, the runner was absent, the rewind layer was absent, and the same audio element returned `paused: true`; normal Level 2 audio resumed. The historical `boolean is not defined` message was not present in the current browser console or development log grep.

After a full development-service restart, the normal arcade start screen rendered and its browser console remained empty. The deterministic runner failure check then confirmed `runner: false`, `bonusPaused: true`, and `mainPaused: false` after the fail return interval. Both the clear and failure audio exit paths are therefore verified.

The historical `boolean is not defined` diagnostic was traced to the initial leaderboard-crown schema edit. The current `drizzle/schema.ts` explicitly imports Drizzle’s MySQL `boolean` helper and the only executable uses are that schema column and Zod’s unrelated `z.boolean()` validation. A fresh restart/browser console was clean. The completed runner-exit verifier also returned `runner: false`, `bonusPaused: true`, and `mainPaused: false`, matching the failure-path result.

Crowd Pressure rebalance audit: shared item rules now use visibly smaller sizes with proportionate shared hit radii; Level 1 dubplates are 45.5% and Level 2 dubplates 37%. Level 2 cadence is 0.72 seconds, base fall speed is 50, and its main loop track is set to 1.09x only after the Level 2 handoff. The direct pill scene verifier confirmed the layered 16-bit portrait, enlarged pupils, goofy grin, neon pitch-wobble typography, and readable foreground copy. The Level 2 verifier confirmed its “CROWD PRESSURE BONUS!” arrival surface, compact meter route, Level 2 legend, and speaker-dancer stage layers. Its hold mode intentionally pauses normal falling-item spawning while the arrival card is visible.
