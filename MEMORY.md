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
