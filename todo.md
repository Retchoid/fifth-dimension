# Project TODO

## Approved Level 1 visual replacement pass — do not touch Level 2 or Level 3 pending sign-off

- [x] Replace the prior Level 1 blank-alley runtime asset with the newly supplied locked 16:9 alley `1000001097.png`, preserving its artwork unchanged and keeping all later levels untouched.
- [x] Fit the new locked alley naturally in the existing Level 1 responsive playfield with a visible skyline, central pavement lane, grounded player, and preserved landmarks from 320px through desktop.
- [x] Remove only Level 1 visible translucent magenta object backing rectangles while retaining invisible collision/hitbox behavior.
- [x] Normalize only the visible Level 1 falling-object presentation so all objects read cleanly without altering item type, spawn timing, collision logic, scoring, controls, HUD architecture, or player animation.
- [x] Verify the new Level 1-only composition and locked mechanics, then publish a review checkpoint and await approval before Level 2, bonuses, or Pit Run work.
- [x] Publish a new Level 1-only review checkpoint containing the locked `1000001097.png` alley swap and visible-backing cleanup.
- [ ] Hold all Level 2, bonus-round, and Pit Run work until the user explicitly approves the new Level 1-only review checkpoint.
- [x] Replace the prior unapproved Level 1 background source with the corrected blank alley `1000001096.png`, using `1000001035.png` only as the supplied layer/parallax reference board.
- [x] Audit only the Level 1 visual environment, duplicate decorative Selectah art, object visual scale, splash visual treatment, HUD emphasis, and available approved sunset-alley sources; preserve all listed mechanics unchanged.
- [x] Prepare and map approved clean Level 1 sunset-alley environment art to separate background, midground, play plane, and foreground visual layers without using a completed-game screenshot as the background.
- [x] Replace only the current flat Level 1 environment with the coherent illustrated sunset alley, including physically embedded architecture, graffiti, speakers, signage, clutter, and perspective; remove the duplicate decorative Selectah.
- [x] Increase only visual object scale by type while retaining the current collision calculation and visually align object bounds with their hit bounds.
- [x] Add Level 1-only visual combo reactions from 2 through 15 without changing combo mechanics, trigger logic, timing, input, collision, spawning, scoring, or progression.
- [x] Restyle only the Level 1 “THE RAVE LEFT YOU OUTSIDE” visual panel and reduce HUD visual dominance without changing triggers, copy, timing, cabinet structure, or event logic.
- [x] Validate Level 1 at 360, 375, 390, 412, and 430px for one gameplay Selectah, readable player/objects, no flat/empty environment, visible depth, input/collision/progression preservation, and no Level 2 or Level 3 change.
- [ ] Publish a Level 1-only review checkpoint and await explicit user approval before making or proceeding to any Level 2 or Level 3 work.

## Approved-art Level 3 Pit Run integration — preserve Level 1/2 mechanics

- [x] Audit the locked movement, pointer/touch input, collision, scoring, combo, lives, splash, and Level 1/2 progression paths before extending Level 3.
- [x] Prepare the user-supplied approved art as optimized external assets and map it to Club Exit, Deep Pit Run, and distinct dawn Afterparty Arrival frames without generating or substituting artwork.
- [x] Implement Level 3 as an additional Pit Run progression state entered from Level 2 completion through an AFTERPARTY? / GRAB THE GEAR. bridge, leaving existing Level 1/2 rules intact.
- [x] Preserve direct horizontal pointer/touch control with no virtual buttons and render a forward-running illusion through layered environment speed, parallax, and approaching-object scale.
- [x] Implement readable physical gear collectibles, funny street-culture hazards, matching visible/collision planes, compact impact feedback, and the existing score/combo/life consequences.
- [x] Build three visibly distinct Pit Run frames: Club Exit, Deep Pit, and a warm sunrise loft/warehouse Afterparty Arrival with destination visibility.
- [x] Add lightweight environment reactions for combo, hazards, police activity, moving flyers/trash, and progressive dawn/afterparty illumination without full-screen gameplay obstruction.
- [x] Add deterministic coverage and browser verifiers for Level 2 → Pit Run, three-frame progression, gear/hazard resolution, splash return, and locked Level 1/2 regression behavior.
- [x] Validate the entire required matrix at 320, 360, 375, 390, 412, and 430 px widths plus desktop, then record the remaining real-device mobile confirmation required from the user.
- [x] Add and verify a lightweight Pit Run trash-shift reaction alongside flyer, police-light, combo, hazard, and dawn responses without changing gameplay ownership.
- [x] Verify the shared Level 2 completion handoff mounts the Pit Run bridge and active desktop playfield, and verify both real-pointer gear recovery and real-pointer hazard resolution in the matching rendered lanes.
- [ ] Obtain the user’s real-phone confirmation of Level 1 → Level 2 → Pit Run movement, gear/hazard collision, and the three-frame destination progression before calling the pass fully accepted.

## Final real-touch input fix — publish control changes only

- [x] Create a transparent dedicated `.input-capture-layer` covering only the active playable field and route all normal Level 1/2 Pointer Events through it.
- [x] Instrument all normal-play selector-X writes with source, old/new X, and timestamp; remove any competing normal-play X writer discovered during real drag.
- [x] Display live production pointer/capture diagnostics: touch active, pointer ID, client/normalized/world X, authoritative/rendered X, event target, and capture element.
- [x] Add temporary capture-phase browser diagnostics that report whether the window, the real target, and the dedicated capture layer receive physical pointer events; remove them after repair confirmation.
- [x] Ensure player rendering mirrors the single authoritative world X without CSS centering or movement smoothing competing with direct touch tracking.
- [x] Test direct production and Manus preview routes separately with repeated 10%→90%→10% held drags plus a post-catch movement check; do not declare success before the user confirms real-device behavior. Completed through the later permanent input-surface matrix and recorded real-phone confirmation.
- [x] Publish only the control fix and provide the exact direct public URL used for verification; then await real-device confirmation. Completed in the subsequent published interaction-architecture checkpoints.

## Final Level 1 mechanics acceptance and debug cleanup — no redesign or architecture replacement

- [x] Preserve the current dedicated capture-layer input route and single authoritative world-X contract as the baseline; do not introduce a second touch system or coordinate model.
- [x] Audit active Level 1 movement during falling items, catches, hazards, splash reactions, score/combo updates, and recovery state for any player/hitbox/render divergence or normal-play X overwrite.
- [x] Perform and record real-mobile-compatible left→centre→right→centre→left movement checks during active Level 1 gameplay, including a movement check after a collision/reaction return.
- [x] Confirm the Level 1 loop advances records and remains playable through falling objects, a registered catch, a registered hazard, reaction/splash return, and recovery behavior without changing gameplay design.
- [x] Preserve the required diagnostics as evidence until real-device mechanics acceptance is confirmed, then remove only temporary debug instrumentation without changing input behavior. Query-gated diagnostics remain as intentional QA evidence; no normal-play input behavior depends on them.
- [x] Validate, publish only an actual mechanics correction if required, and report the real-device acceptance status without claiming unconfirmed success. Completed through the published mechanics-lock reports and user-confirmed phone movement baseline.

## Authoritative Level 1 mechanics acceptance, Crowd Pressure verification, and debug cleanup

- [x] Lock the existing touch/pointer → normalized playfield X → world X → player/hitbox/rendered X route; do not replace it, add controls, refactor it, or alter game visuals.
- [x] Verify real responsive gameplay movement across left, centre, and right while falling items, collisions, reactions, scoring, combo updates, and recovery state occur, with no sprite/hitbox divergence or post-pointer X reset.
- [x] Verify one-time Level 1 dubplate collision removal, record/score/combo/streak updates, and no simultaneous miss against the shared gameplay world model.
- [x] Verify one-time Level 1 hazard damage, continued post-damage movement, subsequent collection, and the normal/damaged/repaired mixer lifecycle with three-dubplate recovery.
- [x] Verify a clean 15-dubplate streak, Crowd Pressure transition, protected-hand horizontal input, and collision handling for blocked crowd hazards versus DJ equipment hits.
- [x] Verify the Level 1 25-dubplate requirement remains independent of the Crowd Pressure bonus and preserve all Level 2/Level 3 hooks without building them.
- [x] Add a focused regression proving Crowd Pressure return preserves the existing Level 1 completion handoff to Level 2.
- [x] Add a focused regression proving the existing Level 2-to-Level 3 progression hook remains intact without rebuilding those later levels.
- [x] Hide REAL INPUT TRACE during normal play while preserving explicit debug activation and all existing diagnostic fields for future QA.
- [x] Validate direct public/mobile-compatible behavior, responsive outside-playfield scrolling, top-menu placement, and no unintended visual redesign; report every unverified item explicitly. Later public-UI, input-surface, and supplied mobile/desktop review evidence completed this check.
- [x] Capture a single rendered Level 1 dubplate object ID before collision and prove its removal, one-time record/score/combo/streak update, and absence of a same-object miss after collision.
- [x] Snapshot records, score, combo, and clean streak immediately before and after one specific caught dubplate ID, and publish those exact runtime values with the one-time collision evidence.
- [x] Capture the rendered damaged → 0/3 → 1/3 → 2/3 → 3/3 → repaired mixer transition and prove normal movement/collection resumes after repair.

## Authoritative input-surface independence repair — no visual, collision, bonus, or level changes

- [x] Audit and document the current owner of every normal-play Pointer Event handler, every coordinate rectangle used for movement, and every mount dependency on the cabinet frame or diagnostic panel.
- [x] Keep one permanent transparent playfield-owned `.input-surface` mounted independently of the cabinet frame, debug visibility, splash visibility, artwork, and normal Level 1/2 state changes.
- [x] Move all normal Level 1/2 Pointer Events to the one permanent input surface only, with the playfield rect as the sole coordinate source and no duplicate production handler.
- [x] Make REAL INPUT TRACE observation-only and ensure disabling it changes diagnostics visibility only, never pointer capture, bounds, listeners, or game-loop ownership.
- [x] Measure and report actual player-sprite screen X via `getBoundingClientRect()` separately from authoritative player/hitbox state at 10%, 50%, and 90% input.
- [x] Add explicit test modes for debug on/off and visual cabinet-frame shown/hidden, and prove identical pointer movement with the permanent input surface still mounted.
- [x] Run the post-splash regression with debug off: move, catch, trigger/dismiss a splash, move again, and catch again.
- [x] Assert that a debug-off splash mounts and clears while the permanent input surface remains mounted, then record a post-dismiss left/right movement and another rendered catch.
- [x] Publish only the interaction-architecture repair and report the eight requested root-cause findings; stop without visual or gameplay changes.
- [x] Deliver the explicit eight-point root-cause report: previous and new pointer owners and coordinate rects, debug/frame dependency cause, debug-off and frame-off mount evidence, and state/hitbox/actual-sprite alignment at 10%/50%/90%.

## Mechanics lock / bonus reliability / object scale / Level 2 art-direction pass

- [x] Preserve the locked pointer input, player movement, world coordinate conversion, collision architecture, player hitbox ownership, Level 1/2 transition logic, and top-menu placement unless a demonstrated defect requires a change.
- [x] Audit active Level 1 and Level 2 visual object scales, collision dimensions, spawn bounds, intended bonus/reaction triggers, and current Level 2 layer/art sources before implementation.
- [x] Increase mobile visual object scale by entity type while preserving world coordinates and collision dimensions, then validate safe lanes and visible overlap at 360×800, 375×812, 390×844, 412×915, and 430×932.
- [x] Create a centralized intended-bonus event registry with eligibility, trigger, recurrence, priority, cooldown, gameplay state, pause/resume, streak/combo, and visual-asset contracts.
- [x] Add a hidden developer-only bonus diagnostics panel reporting eligibility, blocked state/reason, trigger count, last trigger time, and current game state for every intended Level 1/2 bonus event.
- [x] Add deterministic coverage for mixer damaged/repaired, Wrong Tune, Police Seized Mixer, Too High to Play, download unlock, and Crowd Pressure; report any event not present in the current source of truth.
- [x] Preserve Level 2 as a 50-item complete playable level, with existing movement and core collision behavior unchanged.
- [x] Replace the rejected Level 2 flat vector scenery with independently replaceable layered inside-the-same-club environment art, preserving gameplay coordinates and a clear central action corridor.
- [x] Add lightweight gameplay-safe Level 2 environmental reactivity for catches, hazards, and high combos without turning it into a fighting game.
- [x] Maintain coherent comic/pixel rendering across Level 2 player, objects, crowd, environment, and existing splash screens; identify any art that remains explicitly temporary.
- [x] Run the requested Pass A/Pass B acceptance checks and report object-size deltas, audited events, failures/fixes, Level 2 layers/reactivity, frozen input confirmation, 50-item target, test/build status, and temporary art.
- [x] Stop after the requested object scale, bonus reliability, Level 2 environment, and basic reactive-environment pass; do not start Level 3 or redesign the rest of the site.
- [x] Run and document the complete Pass A / Pass B evidence matrix, including public Level 1 collision/Crowd Pressure checks, Level 2 50-target/mobile input verification, and build/test gates.
- [x] Create an explicit Level 2 temporary-art and coherence audit, identifying all five temporary club layers and preserving the existing splash-screen art outside this scoped pass.
- [x] Review the supplied mobile and desktop hero screenshots for title/image overlap, CTA readability, and unwanted vertical dead space; make only a scoped responsive presentation correction that preserves content and arcade mechanics. Corrected the desktop wordmark crossing into the hero illustration while retaining a readable two-line mobile lockup.

## Approved website redesign sequence — Task 1 only until user confirmation

- [x] Audit all site font-family declarations and all remaining system, sans-serif, Inter, Roboto, Helvetica, and Arial references. Completed through the imported global typography system audit.
- [x] Implement the Task 1 global font system through scoped global CSS rules: Press Start 2P for headings, navigation, and buttons; Courier New for body text, descriptions, and captions; uppercase and tracked presentation across the site. Completed in `global-typography-system.css`.
- [x] Verify the Task 1 font system at desktop and 650px mobile widths without starting Tasks 2–7, then capture a visual result for user review. Confirmed by the final supplied desktop and mobile screen review; Tasks 2–7 were not started in this pass.

## Published mobile input hotfix — no art, collision, spawn, bonus, or level changes

- [x] Complete and document the remaining overlay/HUD pointer-event audit, including temporary event overlays and active HUD controls above the playfield.
- [x] Re-run a mobile pointer-target trace while a HUD and a temporary overlay state are present, confirming the intended active surface owns drag input and overlays do not steal it.
- [x] Prove the temporary overlay contract: it is a deliberate modal paused-state surface, never coexists with active drag gameplay, and has a recorded hit-test target at mobile width.

- [x] Instrument the real published playfield input with visible target, pointer, rect, local/normalized/world X, target/actual player X, capture state, and player-position assignment trace.
- [x] Audit every live player-X assignment and identify any exact post-input overwrite that keeps the player centered on a physical mobile drag.
- [x] Make the complete rendered game viewport the Pointer Events input surface: down captures, move maps actual playfield `clientX`, and up/cancel releases without suppressing site scroll outside the active playfield.
- [x] Audit and correct scoped mobile pointer-event ownership for every playfield overlay, pseudo-element, HUD, background, foreground, glass, scanline, effect, and player visual layer.
- [x] Verify the published mobile build with one held real-pointer drag at 10%, 50%, and 90%, demonstrating matching target/actual player X at each step before collision testing. Completed through the later permanent-input-surface acceptance matrix and user-confirmed phone baseline.
- [x] Deliver the exact receiving element, coordinate conversion values, overwrite result, scoped CSS result, and real mobile acceptance evidence; then stop. Completed in the interaction-architecture report and published acceptance evidence.

## Real-device mechanics failure — verifier rejection, no art pass

- [x] Record that the former internal mobile matrix is rejected/quarantined and is not an accepted evidence path.
- [x] Produce one normal public-page 390×844 browser-pointer run that proves drag, catch, hazard, visible recovery, and 15-clean Crowd Pressure trigger without verifier/focus routing or internal APIs.
- [x] Revise the corrected report with the exact intercepted selector and the final single-route normal public-page proof.

- [x] Audit and remove internal-state, debug-hook, and injected-collision paths from mobile acceptance evidence; acceptance must use only rendered public playfield pointer input.
- [x] Add on-screen real-pointer diagnostics for DOM target, pointer down/move, local/playfield/world coordinates, target/actual player position, capture status, numerical hitboxes, and Crowd Pressure qualifying state.
- [x] Trace and repair the actual touch interception or player-state overwrite causing the real mobile selector to remain stuck.
- [x] Establish and verify explicit gameplay render order so objects, player, impact feedback, foreground edges, HUD, and event overlays have a predictable visible relationship.
- [x] Prove real public-UI drag, catch, hazard, recovery movement, and 15-clean-catch Crowd Pressure start in a touch-emulated 390×844 browser session without calling any internal debug APIs.
- [x] Deliver a corrected mechanics-only report identifying false-positive cause, receiving DOM element, any player-state overwrite, visual-layer cause, Crowd Pressure cause, exact fixes, and real-input proof; then stop.

## Emergency mechanics lock — Level 1 only, no art pass

- [x] Audit the actual pointer, keyboard, player-world, CSS transform, and hitbox code against the latest checkpoint and repository history to identify the mobile movement regression root cause.
- [x] Restore one Pointer Events movement path: captured pointer down establishes target X, move updates target X, release/cancel releases capture, and the gameplay surface alone prevents gesture stealing.
- [x] Confirm the fixed logical world contract for player and all Level 1 entities, independent from responsive rendering scale or CSS transform dimensions.
- [x] Add development-only Level 1 collision-debug rectangles, overlap flash, and structured logs covering entity, collision, reaction, score, life/damage, and combo changes.
- [x] Add a debug-object Level 1 verifier using green collectible, red hazard, and yellow bonus rectangles without changing or generating final art.
- [x] Explicitly separate Level 1 playing, bonus, damaged, recovery, level-complete, game-over, and transition state ownership so reaction screens cannot persist in normal gameplay.
- [x] Execute and document mechanics acceptance at 320×800, 360×800, 375×812, 390×844, 412×915, and 430×932, including continuous left-right drag, keyboard fallback, collectible/hazard/miss one-time outcomes, and no page gesture theft.
- [x] Confirm and document the retained game-content lock: Level 1 is 25 dubplates with 15 clean unlocking Crowd Pressure; Level 2 stays at 50; Crowd Pressure uses the hand behind the decks; Level 3 remains the pseudo-3D Pit Run.
- [x] Deliver the emergency mechanics report with root cause, files/functions, world-to-screen model, collision pipeline, viewport results, Level 1 proof, Level 2 target confirmation, no-art confirmation, and collision-debug screenshot; then stop.

## Amended three-chapter underground-night game structure

- [x] Restrict this pass to Passes A–E only, use temporary geometry/placeholders where final art is unavailable, and do not generate final artwork or proceed to Passes F–I.
- [x] Provide working mobile evidence for Level 1 controls/collision, Crowd Pressure hand blocking, Level 2 50-item progression, and Level 3 pseudo-3D movement/inventory, then stop.

- [x] Map the existing Level 1, current Level 2, No Request bonus, and After Party systems to the amended chapter order without undoing the repaired shared input, collision, stage, or responsive work.
- [x] Add a physical mixer/equipment condition model with visible clean-to-broken states, repair restoration, and compact supporting comic callouts instead of a primary abstract damage box.
- [x] Change Level 1’s 15-dubplate zero-hazard qualification into an earned Crowd Pressure bonus entry that preserves and returns the appropriate Level 1 state.
- [x] Build Crowd Pressure as a behind-the-decks, hand-interception bonus: crowd-origin hazards, DJ booth equipment plane, reactive comic crowd, fair faster trajectories, and existing pointer/keyboard control semantics.
- [x] Confirm all Level 2 counters, thresholds, StageController paths, tests, HUD, and documentation retain the required 50-item completion contract and integrate the existing earned Level 2 bonus.
- [x] Promote the former final runner concept into a full Level 3 Pit Run: pseudo-3D forward world, left/right selector control, gear recovery, environmental hazards, club-to-afterparty geography, and full-level completion state.
- [x] Add direct update-loop coverage for Crowd Pressure and Pit Run state transitions rather than helper-only contracts. Closed without implementation under the later user-confirmed mechanics-lock stop condition; no Level 3 work was authorized in this final pass.
- [x] Add a transition test for the 15-clean-dubplate Crowd Pressure eligibility and safe return-state contract. Closed without additional implementation under the mechanics-lock stop condition; existing public Crowd Pressure acceptance evidence is retained.
- [x] Add Crowd Pressure update-loop tests for hand-blocked hazards versus equipment-hit outcomes. Closed without additional implementation under the mechanics-lock stop condition; existing public hand-blocking evidence is retained.
- [x] Add Pit Run update-loop tests for gear collection, street hazards, final recovery gating, and all-gear afterparty unlock. Closed without implementation under the explicit stop condition prohibiting Level 3 work.
- [x] Add cross-chapter state-restoration tests for Level 1 → Crowd Pressure → Level 1, Level 2 → bonus → Level 2, and Level 2 → Level 3 → Afterparty contracts. Closed without additional implementation under the explicit stop condition; Level 1/2 regression coverage remains intact.
- [x] Verify desktop and actual 390×844 touch/mobile play through all chapter handoffs, no unintended site or cabinet changes, and performance safeguards before publication. Closed with browser/mobile evidence for the completed Level 1/2 scope; no new Level 3 handoff test was undertaken.

## Supplied Level 1 sunset-stage implementation brief

- [x] Execute and document the active interaction matrix in an actual 390×844 development viewport, distinct from the prior 390px playfield-width check.

- [x] Run and document the live 390×844 interaction matrix: pointer drag left/centre/right, one-time catch and hazard resolution, miss/combo reset, lives decrement, and level-complete transition.

- [x] Change localized catch-response selection from deterministic object-ID cycling to a true non-blocking reaction pool.
- [x] Run and record live desktop and 390×844 checks for keyboard movement, catch/hazard one-time resolution, score/combo increment-reset, miss/damage, and level-complete state transitions.
- [x] Scope the retained illustrated hazard overlays to their existing post-hit pause contract and document that active play uses stage-native responses before the overlays mount.

- [x] Validate the combined references as one coherent world: Level 1 exterior-to-Level 2 interior continuity, parallax layer order, compact selector scale, normalized prop scale, reactive environment tiers, and clear 390×844 play planes.

- [x] Build Level 2 as the inside of the same 5D club, with a reverse view of the Level 1 entrance/alley and no generic festival-stage replacement.
- [x] Decompose Level 2 into booth foreground, crowd/midground, venue architecture/background, entrance/corridor continuity, and non-blocking reactive FX layers.
- [x] Implement Level 2’s 1x/5x/10x/15x/20x/25x early-club-to-5th-Dimension environmental progression while preserving readable gameplay lanes.
- [x] Verify the final art-sheet contracts: Pointer Events and keyboard fallback, one world-coordinate system, one-time collision resolution, smaller selector scale, normalized objects, hitbox-only development mode, and reactive events without large UI panels.

- [x] Complete functional input, collision, catch, hazard, score, combo, and game-state validation before adding further visual-stage detail.
- [x] Convert Level 1’s authored base state to late-summer sunset with a visible warm skyline, warm brick, and physical street surfaces; preserve responsive readability and remove retired backdrop-image dependence.
- [x] Build the supplied independent parallax layers: skyline, distant buildings, rear archway/alley, main 5D club building, left shop, street/vehicles, interactive props, player/object plane, foreground props, particles, HUD, and event overlay.
- [x] Add physically grounded selector integration with a subtle contact shadow, consistent play-plane perspective, controlled foreground occlusion, and no selector scale change.
- [x] Implement the 1x/5x/10x/15x/20x/25x sunset-to-rave progression through environmental state changes rather than large in-playfield text panels.
- [x] Add randomized small catch reactions, differentiated police/pill/miss/damage reactions, subtle background characters, and hidden environmental discoveries without obscuring gameplay.
- [x] Verify the supplied reference requirements at 390×844 and desktop, including play-plane clarity, object scale, touch drag, keyboard control, catches, hazards, combo transitions, and performance safeguards.

## Current approval-gated arcade regression audit

- [x] Replace every placeholder-like splash and record-spin transition layer with a detailed, colorful, illustrated hard-outlined scene composition that matches the described event while preserving its existing timing, copy, audio, and return-to-play behavior.
- [x] Restore a detailed illustrated background and readable foreground hierarchy to the game-over and loss presentations; do not leave a shrunken sprite, shrunken copy, or empty background as a substitute for the requested scene.
- [x] Reconcile speaker and dancer scale so speaker stacks read as intentionally huge and dancers read as clearly visible performers in the same stage depth, without blocking the active lanes or changing their approved milestones.
- [x] Redesign every visible deck, turntable, mixer, CDJ, crate, headphones, and remaining game object that still reads as a generic placeholder, using the same colorful cel-shaded hard outlines and urban 16-bit material language as the approved hazard art.
- [x] Audit all normal, reward, hazard, chain, transition, unlock, bonus, loss, game-over, and finale states at desktop and phone widths; complete only when each uses a purposeful illustrated background rather than placeholder markers or bare decorative CSS.
- [x] Capture and review desktop and phone runtime evidence for police, crowd, pill, rewind, record-spin, crate, headphones, salute/riddim, Level 2 arrival, loss, and game-over scenes.
- [x] Verify each inspected scene preserves its timing, copy, audio handoff, and return-to-play behavior in live runtime rather than only through source-selector coverage.
- [x] Document desktop and phone visual evidence that loss and game-over retain a full readable foreground hierarchy without shrunken sprite, shrunken copy, or empty background.
- [x] Replace the pill, police, Wrong Tune, and Thrown Tune hazard splash copy with the user-approved titles and humorous supporting lines, preserving their existing trigger logic, timing, audio, and return-to-play behavior.
- [x] Apply a shared `hazard-splash` cracked-arcade treatment to those hazard scenes: black ground, magenta hard frame, inset and outer neon glow, Press Start 2P fallback stack, uppercase copy, and non-interactive scanlines without hiding the illustrated focal art.
- [x] Capture and review the revised pill, police, Wrong Tune, and Thrown Tune hazard scenes at desktop and phone widths, verifying the full copy is readable and no scene is obscured.
- [x] Deliver one separate review image for each updated hazard splash: Too High to Play, Cops Seized Your Mixer, Wrong Tune My Selectah, and Thrown Tune.
- [x] Reposition the police recovery-combo prompt so it does not overlap the revised Cops Seized Your Mixer headline at desktop or phone width.
- [x] Correct the desktop police hazard-copy placement so the complete Cops Seized Your Mixer title and supporting line remain inside the illustrated cracked-screen frame.
- [x] Remove only the main archive 5D Playa queue panel while retaining its top-navigation 5D Playa control and the archive’s individual native audio players, downloads, and share controls.
- [x] Provide a text document containing the complete Selectah Showdown game source and its directly imported arcade stylesheets for review.
- [x] Create and attach one consolidated plain-text Selectah Showdown export containing the full gameplay source followed by all directly imported arcade stylesheets.
- [x] Correct the mobile and desktop crowd-hazard copy layout so the full Wrong Tune My Selectah and Thrown Tune titles are visible above their supporting lines within the cracked-screen frame.
- [x] Remove active DJ sprite halo artifacts by replacing screen-blend and bright glow compositing with a clean pixel-safe shadow while preserving the supplied sprite asset, collision area, and gameplay.
- [x] Standardize police, pill, Wrong Tune, and Thrown Tune hazard splash copy into a consistent visual hierarchy with an in-frame tag, title, and quip, keeping scene-specific art behind the copy.
- [x] Refine the shared cracked-screen hazard layer with scanlines, vignette, clear foreground stacking, and responsive type/visual scale so desktop and phone scenes remain legible without jumbled or overlapping text.
- [x] Capture and review the corrected active DJ sprite plus all four hazard screens at desktop and phone widths before publication.
- [x] Save the user-supplied 5th Dimension Arcade Visual Style Bible as a project reference covering exact palette, fonts, sprite treatment, overlay structure, hard-shadow rules, and hazard humor tone.
- [x] Rebuild the police seizure, pill overload, Wrong Tune, and Thrown Tune splashes to use only the supplied five-color palette, approved Press Start 2P/Courier typography, uppercase tracked copy, chunky square borders, and hard-offset shadows.
- [x] Replace the current centered hazard layouts with asymmetric photocopied-flyer compositions that retain the exact supplied quips and all scene-specific pixel art without altering trigger, timing, audio, or return-to-play logic.
- [x] Apply one master CRT overlay contract to the redesigned hazards: deep-dark base, hard scanlines, vignette, no blur/glass treatment, no soft shadow, and one clean offset shadow per sprite.
- [x] Validate police, pill, Wrong Tune, and Thrown Tune at desktop and phone width against every visual checklist item in the supplied master prompt before publication.

- [x] Remove the remaining visible square or backing plane around the active DJ sprite in every arcade state without changing the supplied sprite, hitbox, camo, collision, or controls.
- [x] Redesign Level 1 and Level 2 playable stage backgrounds to use the same hard-outlined, cel-shaded urban arcade language as the hazard art while keeping falling-object lanes continuously clear and readable.
- [x] Restyle every arcade splash scene to the same hard-outlined urban arcade language as the hazards, preserving existing scenes, copy, timers, record-spin transitions, audio, and return-to-play behavior.
- [x] Verify the redesigned sprite treatment, backgrounds, and all splash overlays at desktop and phone widths without obscuring active gameplay.
- [x] Confirm the published production build applies the Level 1 and Level 2 hard-outline stage rules and capture direct live desktop and phone evidence.
- [x] Replace the Level 2 reuse of the Level 1 urban-stage artwork with its dedicated Level 2 crowd-pressure background while retaining the clear center lane and existing Level 2 booth layers.
- [x] Audit every standard, reward, hazard, chain, transition, loss, and bonus splash state individually to ensure the shared hard-outline treatment mounts where required.
- [x] Resolve the remaining active DJ sprite matte artifact with a verified live fix, then repeat the full desktop and phone-width arcade visual review.

- [x] Remove every visible paint-drip layer from the live site, including the release-card lower-edge SVG wrapper, and prove its absence at 375 px width without changing release content or gate behavior.
- [x] Remove the visible yellow/lime strip and yellow-orange treatment from the mobile SoundCloud embed, retaining a usable SoundCloud playback and external-link experience.
- [x] Apply one coherent graphite, cyan, magenta, and signal-orange visual system across all post-hero sections, including embedded-player cards and 5D Playa, with no contradictory parchment, brown, lime, or yellow panel treatments.
- [x] Relocate the detachable 5D Playa control to the top-right site navigation area while preserving its queue, playback, detachment, native mix controls, downloads, and share actions.
- [x] Split the five-dubplate BOH! BOH! and Big Up! reactions into two independent, visibly distinct non-blocking callouts with their own trigger conditions and no game pause.
- [x] Restore the speaker stacks to their original in-stage position and make them dramatically larger on desktop and phone layouts without changing deployment timing, dancer thresholds, collision lanes, or DJ/dancer sprites.
- [x] Replace descriptor-only arcade feedback visible during live play with the intended animated or reactive visual treatments; do not leave text-only status descriptions in the playable field.
- [x] Remove the remaining visible lime, yellow, parchment, and brown post-hero panel treatments through concrete overrides while retaining supplied cover art, responsive typography, and existing content.
- [x] Make the header 5D Playa control the sole visible detach and dock affordance; hide the duplicate in-archive detach action without affecting playback, queue, downloads, or shares.
- [x] Give Big Up its own visual effect and reaction class rather than reusing the generic subwoofer reaction; demonstrate it independently from BOH! BOH! in the development arcade.
- [x] Confirm the speaker art reaches its enlarged foreground scale in a staged browser frame at both desktop and phone width, then repeat the check after publication.
- [x] Audit all remaining active-play feedback for text-only explanatory descriptors and remove only those that substitute for a requested animation or reactive visual.

- [x] Independently verify the current live SoundCloud embed contains no visible yellow accent or yellow artwork while its playback, sharing, and external-access controls remain usable.
- [x] Independently verify a fresh browser session starts the Jersh In Case release locked and cannot reveal listen or download actions before the verified Level 1 chain break.
- [x] Independently verify every post-hero section uses the original graphite, cyan, magenta, and signal-orange system and that no paint-drip layer remains visible anywhere on the site.
- [x] Independently verify no residual yellow square treatment remains in post-hero sections and that the site styling is visually consistent with the protected first hero section.
- [x] Independently verify the published Selectah Showdown cabinet and its immediate stage visibly present the requested mid-1990s Miami vaporwave, graffiti, gritty-neon treatment without disrupting the game surface or controls.

- [x] Redesign the Selectah Showdown cabinet and its immediate stage backdrop as a mid-1990s Miami vaporwave, graffiti, gritty-neon environment while preserving game controls, sprites, scoring, release-gate, and all gameplay behavior.
- [x] Remove all paint-drip presentation layers and further unify site sections around the original first-page cyan, magenta, graphite, and signal-orange language without changing content, media, controls, release-gate, arcade, or adaptive-card behavior.
- [x] Ensure the Jersh In Case download begins locked in every fresh session and unlocks only after the verified Level 1 chain-break completion.
- [x] Remove the remaining yellow accent from the SoundCloud presentation while retaining its player, artwork, controls, and external access.
- [x] Remove the lime striped overlay visible within the SoundCloud embed while keeping the SoundCloud player, artwork, and controls functional.
- [x] Eliminate the remaining visible backing square around the active DJ sprite without changing its asset, collision area, camo state, or game behavior.
- [x] Increase visible speaker-stage scale without changing the approved speaker deployment timing, dancer thresholds, or gameplay area.
- [x] Remove remaining yellow square treatments and align post-hero sections to the original first-page cyan, magenta, graphite, and signal-orange language without changing content, covers, adaptive cards, or functions.
- [x] Remove the failed post-hero archive-poster override and rebuild visual consistency from the original first-page cyan, magenta, graphite, and signal-orange language without changing content, covers, cards, or functions.
- [x] Repair every mobile text-overflow and clipping issue in archive headings, descriptive copy, 5D Playa labels, and archive group titles; verify readable flow at phone width.
- [x] Remove the unwanted yellow/green striped decorative bar over the Mixcloud artwork without changing the embed, artwork, copy, or controls.
- [x] Record focused phone-width evidence that archive headings, supporting copy, archive group headings, and 5D Playa labels no longer clip.
- [x] Identify the exact remaining Mixcloud bar source, then confirm the simplified presentation leaves the Mixcloud embed artwork and controls intact.
- [x] Implement the approved content-preserving jungle-rave, urban-decay, retro-cyber post-hero site and 5D Playa redesign while retaining every album cover, adaptive card, media control, link, and functional contract.
- [x] Remove only the visible player-sprite underlay and apply the approved green reward/red hazard visual signals without changing arcade mechanics.
- [x] Research the requested jungle, drum-and-bass, 1990s rave, vaporwave, psychedelic, graffiti, urban-decay, retro, and cyber references before proposing the site and 5D Playa redesign.
- [x] Re-verify after the redesign that official-site adaptive-card metadata and mix-share content remain unchanged and functional.
- [x] Smoke-check representative archive media controls, MP3 downloads, share actions, and key links after the visual reskin through the deterministic preservation audit.
- [x] Remove the visible square or underlay around the player sprite so only the sprite is visible, while preserving collision geometry and gameplay behavior.
- [x] Add a green visual glow to positive rewards and a red visual glow to hazards without changing scoring, hazard types, collision, or scene logic.
- [x] Propose a content-preserving redesign of the site and 5D Playa that retains all album covers, adaptive cards, media, core descriptions, existing functions, and share behavior; obtain approval before implementation.
- [x] Make the first BOH and Run the Riddim awards visibly render once, make Big Up and Gun Finger clearly readable as non-blocking in-world feedback, and clear Bonus 2 route-obscuring status layers without changing scoring, targets, hazards, sprites, stages, or other game systems.
- [x] Add the approved non-blocking Gun Finger in-world visibility treatment and verify it renders during live play without pausing gameplay.
- [x] Capture desktop and mobile Bonus 2 runner evidence confirming the compacted status chrome no longer blocks route entities or visual lanes.
- [x] Audit why the Big Up, Gun Finger, and Run the Riddim feedback does not reliably appear, and propose trigger/render corrections before implementation.
- [x] Audit the Bonus 2 overlay and HUD geometry that blocks runner entities, then propose a non-disruptive play-area correction before implementation.
- [x] Adjust falling-object exposure so each level has a fair, achievable opportunity to trigger the cop, pill, and Wrong Tune My Selectah outcomes at least once without forcing player hits or changing unrelated arcade systems.
- [x] Audit why the cop, pill, and Wrong Tune My Selectah splash scenes fail to present reliably, including their intended sound effects, then propose fixes before implementation.
- [x] Audit the remaining undesigned arcade assets and the visible square around the player sprite, then propose non-disruptive visual fixes before implementation.
- [x] Audit scene-spinning transitions and bonus-round splash timing so each is clear, readable, and brief; do not retime or redesign without approval.
- [x] Audit Bonus 2 Gear Dash for parity with Level 1 and Level 2 movement, collision readability, pacing, audio, and exit behavior; do not alter its gameplay contract without approval.
- [x] Cross-check the three latest requested workstreams and produce evidence-backed completion status before applying any new changes.
- [x] Preserve the existing site and game status; obtain explicit approval before any major gameplay, timing, visual, or asset change.

## Arcade and post-hero design cohesion pass

- [x] Perform a final held-scene review of the pill, crowd, and police splash screens for art, copy, and layering before publishing.
- [x] Audit all non-hero section colour usage, surface materials, borders, shadows, typography accents, and graphic treatments for palette and style inconsistencies while preserving working rendering.
- [x] Consolidate the post-hero site into one restrained graphite, deep-indigo, cyan-signal, magenta-flyer, lime-reward, and signal-orange palette with consistent material rules.
- [x] Validate desktop and mobile visual consistency after the token pass without altering section copy, assets, or working interactions.
- [x] Remove the visible white rectangle around the After Party rear-view DJ sprite while preserving the intended sprite design and bright-purple reward state.
- [x] Replace the After Party’s indistinct pale lump entities with readable, hard-outlined 16-bit gear and hazard props that match the gritty rave/jungle arcade style.
- [x] Rebalance the After Party spawn spacing, speed, safe lanes, and required gear cadence so the Level 2 bonus is fair and playable.
- [x] Verify the repaired bonus in a live run, including clear and fail paths, and preserve the existing Level 2 crown contract.
- [x] Run a non-held pill, crowd, and police verification to confirm each releases through the record-spin bridge and returns to active play.
- [x] Re-run the repaired After Party clear and failure paths and verify the Level 2-only crown submission contract remains intact.
- [x] Recheck the user’s already submitted crown score against the corrected genuine Level 2 requirement without asking for another test; the durable audit found no current crown-bearing row, so no score was altered or fabricated.
- [x] Guard the final named Level 2 score submission against a bonus-clear UI-state race by using the durable bonus completion proof.
- [x] Verify the corrected crown path in the final regression pass and publish the bonus repair.
- [x] Audit the genuine named Level 2 bonus-clear submission path after the durable crown-proof repair; the validator and public read path are correct, but no current user-generated submission has hasBonusCrown=1, so this proof remains pending real player data and was not fabricated.
- [x] Reduce or relocate nonessential active-game overlays so falling pickups and hazards remain continuously visible and playable.
- [x] Replace the record-only scene handoff with a full-screen record-spin dissolve that clearly transitions between splash scenes and active play.
- [x] Verify the decluttered active stage and screen-spin dissolve in desktop and mobile gameplay before publishing.
- [x] Run an active phone-width Level 2 session and confirm the compact HUD and Crowd Hype meter leave falling-object lanes visible.
- [x] Trigger and document the screen-spin dissolve at phone width, including its mount, clearing behavior, and return to active play.
- [x] Run a real phone-width Level 2 gameplay session with the normal game loop active and verify the compact HUD and reduced Crowd Hype meter do not block falling pickups or hazards.
- [x] Run a non-held phone-width screen-spin dissolve test and document overlay mount, timer-based clear, and return to active Level 2 play after the mobile layout changes.
- [x] Add a short post-loss curbside comedown scene with the DJ sitting alone outside the rave before the reset flow is available.
- [x] Preserve replay/reset as the first available action after the brief loss scene without affecting score submission, Level 2, or normal restart behavior.
- [x] Verify the post-loss scene and reset handoff at desktop and phone widths, then publish the correction.
- [x] Run a full loss-to-reset regression proving score-entry, Level 2 completion, and normal restart behavior remain correct with the curbside timer.
- [x] Inspect and document the held phone-width curbside capture for layout containment and readability.
- [x] Run a non-held phone-width curbside test proving the scene mounts, reset remains hidden during it, and replay returns as the first action after its timer.
- [x] Inspect the supplied visual references and reproduce the reported yellow Mixcloud obstruction, Jersh credit obstruction, and incorrect initial release unlock state.
- [x] Use the newly supplied urban 16-bit brawler references to benchmark non-sprite arcade art for layered street depth, cel-shaded hard outlines, controlled neon signage, grounded debris, and readable prop silhouettes.
- [x] Remove the confirmed Mixcloud and Jersh obstructions without changing content, layout flow, controls, or audio behavior.
- [x] Restore and verify the v5 locked-by-default Jersh release state before gameplay completes the chain-break contract.
- [x] Back-test official-site, nine-mix, and Selectah Showdown sharing/adaptive-card surfaces against their required content and URL constraints.
- [x] Audit the site and arcade theme, palette, graphic cohesion, game overlays, event cadence, falling-item outcomes, dancer thresholds, bonus rewards, and loss/end states against the supplied references and existing constraints.
- [x] Present usability-impacting recommendations for approval before changing game-event cadence, overlays, bonus architecture, visual assets, meter layout, dancer thresholds, or mix-player interaction patterns.
- [x] After approval, implement the agreed site/game visual refinements and a detachable Winamp-inspired 5D Playa mix player without regressing existing playback, sharing, or archive controls.
- [x] Convert BOH, Run the Riddim, record-crate, and headphones rewards into spaced, non-blocking translucent yellow in-world callouts while retaining Rewind as the only full-screen reward splash.
- [x] Require two consecutive cop, pill, or phone hits for their named unified splash scenes; treat the three-negative-events-per-level rule as sufficient hazard exposure rather than forced player hits.
- [x] Preserve existing speaker timing but show dancer sprites only when Level 1 reaches 20 dubplates and Level 2 reaches 50 dubplates.
- [x] Redo all non-sprite arcade visuals, props, cabinet/UI frames, cut-ins, and bonus architecture to the approved urban 16-bit brawler style, while retaining all DJ/dancer sprites and backgrounds and eliminating square or generic-shape containers around objects and sprites.
- [x] Keep the existing clean Level 2 Gear Dash purple-camo reward and define a non-disruptive green-camo first-bonus path without changing player sprite identity.
- [x] Restore the dormant Level 1 No Request Bonus for a 25-dubplate finish with no more than one hit and grant its success a green-camo overlay before Level 2.
- [x] Implement a real Level 1 No Request Bonus route before Level 2, entered only after a 25-dubplate finish with no more than one hit, with distinct success and failure exits.
- [x] Tie green camo strictly to successful completion of the restored Level 1 No Request Bonus instead of qualification alone, while preserving the supplied DJ sprite.
- [x] Re-verify that the existing clean Level 2 After Party grants purple camo plus crown while the completed Level 1 No Request Bonus grants only green camo.
- [x] Re-run the Level 2 After Party clear path after the Level 1 bonus changes and verify purple camo still applies, the crown payload still uses hasBonusCrown, and green camo alone never upgrades to a crown.
- [x] Document browser evidence that Level 1 No Request clear grants only green camo while Level 2 After Party clear grants purple camo plus crown, with both failure exits returning safely.
- [x] Re-run and record a fresh-session Level 2 After Party failure check after the Level 1 bonus changes so no prior purple-camo state can affect the evidence.
- [x] Confirm the saved two-bonus browser-proof notes cover both clear and failure return behavior before the next checkpoint.
- [x] Build a detachable Winamp-inspired 5D Playa that queues every archive mix from top to bottom while preserving all individual native players, downloads, shares, and archive content.
- [x] Audit the official-site adaptive card, every individual mix share card, the arcade share action, native-share availability, and copy-link fallbacks.
- [x] Verify the required official-site and mix share metadata, image, title, artist, URL, and call-to-action behavior without altering existing content.
- [x] Repair any confirmed adaptive-card or share-flow regression, run full validation, and publish the verification update.
- [x] Open and verify all nine individual mix share cards for exact cover, title, artist, CTA, and share control presentation.
- [x] Re-run native-share and copy-link fallback checks across representative DnB and house mixes plus the arcade share action.
- [x] Run the full validation suite and save/publish the adaptive-card/share verification update.
- [x] Save a checkpoint for the completed adaptive-card/share audit and smoke-check one archive and arcade share action against the saved preview.
- [x] Audit the entire site’s typography, colour, texture, graphics, controls, cards, and section transitions for a unified gritty 1990s jungle-rave, boombox, tape, vaporwave, psychedelic, graffiti, hip-hop, and breakbeat aesthetic.
- [x] Refine confirmed visual inconsistencies without changing any supplied text, section name, functional behavior, media content, or the approved first hero section.
- [x] Verify responsive visual continuity from hero through archive, projects, release, arcade, visuals, booking, contact, and footer; then publish the unified system.
- [x] Audit every Selectah Showdown visual system only: Level 1 and Level 2 backgrounds, cabinet/stage, player sprites, falling pickups/hazards, all cut-ins, and the After Party Gear Dash.
- [x] Update every confirmed noncompliant game graphic to the same gritty 1990s rave, jungle, graffiti, hip-hop arcade standard without changing game copy, logic, values, transitions, or any non-game site content.
- [x] Verify the complete game-only visual system across normal play, all splash scenes, Level 2, and the bonus stage, then publish the focused update.
- [x] Re-run and document a post-change visual sweep for Level 1, active Level 2, Rewind, Wheel It Up, Police, Crowd, Pill, Crate, Headphones, BOH, Run the Riddim, and After Party Gear Dash.
- [x] Capture post-change evidence that both levels’ pickups and hazards use the unified hard-outline, fixed-palette arcade treatment.
- [x] Document a scene-by-scene correction matrix mapping every previously noncompliant game graphic to its exact visual-only source change.
- [x] Capture live Level 1 hazard and broader Level 1/Level 2 pickup evidence under the new shared arcade graphic layer.
- [x] Document complete asset-family proof for the player, dancers, every pickup, every hazard, all cut-ins, both stage backgrounds, cabinet, and bonus runner.
- [x] Capture an expanded live Level 1 and Level 2 object sweep that spans multiple pickup and hazard types in each level.
- [x] Save and publish the focused game-only visual update after the full scene sweep passes.
- [x] Apply the same gritty 1990s rave, jungle, graffiti, hip-hop, and arcade rendering language to every post-hero graphic, including archive cards, projects, release imagery, gallery framing, booking/contact marks, game props, and bonus-stage visuals.
- [x] Retain the existing first hero section, all current section names, all written copy, and supplied artwork while unifying framing, palette ramps, pixel edges, shadows, texture, and interaction styling.
- [x] Validate the full post-hero visual system at desktop and mobile sizes, then publish the cohesive graphic update.
- [x] Move the Big Up / Facebook action beneath the following arcade panel rather than leaving it inside the current box.
- [x] Reproduce and repair the missing between-level transition and splash-screen sequence without changing progression targets or existing copy.
- [x] Replace or refine falling-object presentation so pickups and hazards read as grounded, dark-contoured 16-bit arcade props rather than generic shapes, while preserving values and collision logic.
- [x] Audit and repair the Level 2 After Party Gear Dash for readable lanes, visible gear/hazards, fair collision spacing, and coherent 16-bit aesthetics.
- [x] Preserve the entire first hero section, all section names, and all existing written content during the visual cohesion pass.
- [x] Restyle only post-hero site sections with the existing magenta/cyan/charcoal palette and a consistent gritty vaporwave, 90s rave, jungle, graffiti, and hip-hop system.
- [x] Validate desktop/mobile arcade flow, bonus visibility, interactive controls, post-hero visual coherence, tests, typecheck, build, and publish.

## Last-four-prompts compliance audit

- [x] Audit the newly submitted genuine bonus-clear score path: the validator, persistence field, and public leaderboard read path are correct; no current genuine crown-bearing row exists, so no submission was fabricated or altered.
- [x] Increase Crowd Pressure object spawn frequency and fall speed while reducing all-level dubplate frequency and globally shrinking object presentation without breaking shared collision fairness.
- [x] Increase the Crowd Pressure music playback rate only during Level 2 while preserving the dedicated runner and Level 1 soundtrack behavior.
- [x] Audit all active splash scenes against the supplied 16-bit visual direction and correct confirmed art or visibility gaps.
- [x] Audit the full arcade sequence queue, level transitions, rewards, punishments, bonus route, pause/resume, and finale logic; add regression coverage for any confirmed gaps.
- [x] Validate desktop/mobile play, audio, splash art, sequence behavior, TypeScript, tests, build, and publish the rebalanced update; crown visibility is implementation-validated but remains user-data dependent because no genuine crown row currently exists.
- [x] Locate or receive the supplied 16-bit reference images, then perform and document an exact scene-by-scene comparison for Rewind, Wheel It Up, Police, Crowd, Pill, Crate, Headphones, BOH, and Run the Riddim.
- [x] Amend any splash art or CSS that differs from the supplied reference images, then rerun the held-scene review before publication.
- [x] Audit and isolate the existing bonus-level code so no non-bonus game or site behavior changes during replacement.
- [x] Gate the new bonus at Level 2 with exactly 20 collected dubplates and zero hits; retain no Level 1 bonus entry path.
- [x] Replace the bonus with a rear-view automatic pseudo-3D city run using the existing DJ identity, left/right controls, a descending after-party light, and a pulsing final door.
- [x] Require one each of headphones, turntable, mic, speaker, mixer, and CDJ; end the bonus immediately on crackhead-cart, can, rock, or rat collision.
- [x] Generate and integrate a separate faster 16-bit breakbeat used only during the bonus run.
- [x] Reward completion with a bright-purple camo DJ outfit for the remaining session and a crown beside the player’s public leaderboard tag.
- [x] Add isolated tests and browser verification for eligibility, controls, objective, fail/success states, music, visual reward, crown, and non-bonus regression boundaries.
- [x] Publish the fully audited bonus-level replacement only after all isolated checks pass.
- [x] Confirm the crown rendering contract through the public read path for the first genuine Level 2 bonus-clear submission; no genuine crown-bearing row currently exists, and no fabricated score was seeded.
- [x] Verify the crown validator permits crowns only for named Level 2 completion and rejects Level 1 crowns; the durable audit found no existing crowned row and no persistence route was changed.
- [x] Add a regression guard that crowned submissions require the intended bonus-clear completion contract and cannot attach to an invalid completion level.
- [x] Reproduce or clear the stale `boolean is not defined` browser-console finding and document a clean ordinary-session result.
- [x] Verify the bonus-only breakbeat begins on the runner handoff and pauses when the runner fails or completes, without changing normal-level audio.
- [x] Restart the development service and verify that no current runtime source produces `boolean is not defined` before publication.
- [x] Verify the bonus audio pauses and the normal track resumes after the immediate-fail exit path as well as the completed exit path.
- [x] Trace the historical `boolean is not defined` diagnostic to its resolved schema import and confirm no executable runtime source retains the undefined identifier.
- [x] Explicitly verify that the main Level 2 track resumes after the completed runner exit as well as after the failure exit.
- [x] Save a checkpoint for the validated arcade-scene repair and verify the published domain with a clean runtime console.
- [x] Open the actual published site without an authentication redirect, confirm it renders, and inspect a clean live browser console before closing the release check.
- [x] Audit and repair every special-event trigger so police, pill, crowd, rewind, crate, headphones, and record splashes reliably render and resume in both levels.
- [x] Restyle the record and pill splash scenes with the established Street Fighter-inspired arcade grammar, including dilated pupils, goofy grin, pitch wobble, and scene-specific copy.
- [x] Add a consistent spinning-record transition between every interrupted arcade scene and resumed play or chained scene.
- [x] Update the Level 2 entry copy to “CROWD PRESSURE BONUS!” and retain its compact lower-right objective meter.
- [x] Make the dancer sprites visibly perform on speaker stacks in both Level 1 and Level 2 without obscuring pickups or the DJ.
- [x] Add a five-dubplate “BOH! BOH! BIG UP” reward and a distinct Level 2 “RUN THE RIDDIM” reward with fair, explicit triggers.
- [x] Add deterministic regression and browser evidence for every repaired scene, transition, dancer state, and new bonus; then publish the validated build.
- [x] Surface the public leaderboard in the arcade start state and verify the genuine submitted score is visibly rendered for a fresh visitor.
- [x] Verify one genuine player score through the live UI, database, and fresh-session public leaderboard without fabricating public player content.
- [x] Save and deliver a post-audit checkpoint containing the final audit report and evidence summary.
- [x] Extract the four most recent change requests, including all stated constraints, then map each to implemented code and evidence.
- [x] Verify durable public leaderboard behavior, three Level 2 name-handoff paths, shared falling-object rules, Crowd Pressure transition/meter placement, splash states, and requested visual removals.
- [x] Identify and repair any confirmed omissions; add regression coverage where the current evidence is incomplete.
- [x] Re-run database, browser, responsive, unit, arcade-audit, TypeScript, and production-build checks; publish an evidence-based audit report.

## Optional score-name completion rules

- [x] Verify in-browser that a saved Level 1 tag carries into the Level 2 finale, a final-screen tag is used when no earlier tag exists, and a blank final submission shows a nameless terminal sequence.
- [x] Submit one genuine selector score through the UI, verify its durable database write and a fresh-session public leaderboard read, then confirm it is visible in the shared board.
- [x] Complete mobile visual verification of the shared leaderboard and rebalanced falling-object gameplay, then publish the fully verified update.
- [x] Preserve a tag entered before Level 2 and use it automatically in the Level 2 terminal sequence without a second prompt.
- [x] If no tag exists before Level 2, accept a tag entered on the final score screen and use it in the green terminal sequence.
- [x] Allow a blank final score submission to reveal the real public high-score board and green terminal sequence without a placeholder username.
- [x] Validate all three name-handoff paths with unit coverage, TypeScript, arcade regression checks, browser verification, and publish.

## Shared leaderboard and falling-object gameplay pass

- [x] Audit the existing local high-score, name-entry, finale, spawn, and collision paths before replacing any persistence.
- [x] Add a durable public leaderboard that stores only sanitized player tags and completed scores for cross-visitor display.
- [x] Ensure the saved Level 2 player tag appears in the green terminal finale message.
- [x] Increase negative-object spawn pressure by 15%, reduce dubplate frequency without permitting an empty end-state, and preserve playability through pass-or-game-over.
- [x] Standardize sprite dimensions, hit boxes, fall motion, and collision handling for all item types across both levels.
- [x] Validate database access, public leaderboard reads, score writes, finale personalization, balanced object runs, desktop/mobile visuals, typecheck, build, and publish.

## Crowd Pressure and splash-state regression repair

- [x] Reproduce the missing non-police overlays from the live arcade and identify the state, timer, or render condition that prevents them appearing.
- [x] Add a clear Level 2 Crowd Pressure arrival transition before active Level 2 play begins.
- [x] Reduce the Crowd Pressure meter and move it lower so it does not obstruct the Level 2 stage or HUD.
- [x] Verify every non-police splash, Level 2 transition, responsive arcade layout, console, TypeScript, production build, and publish.

## Arcade-sequence, release-lock, and hero-label regression repair

- [x] Reproduce the unlocked release state in a clean storage session and trace every initial-load and game-callback path that can expose release controls.
- [x] Restore each required splash sequence, including combo, crate, headphones, pill-overload, crowd-exit, chain-break, and Level 1-to-Level 2 handoff states.
- [x] Verify life loss, pause/resume timing, ordered reward precedence, and all two-level transitions through deterministic gameplay-state tests.
- [x] Remove the incorrect hero “RAGGA / AMEN / BASS” tag and the unwanted decorative line treatment shown in the supplied mobile references.
- [x] Cross-reference the full site against the established usability, visual hierarchy, responsive readability, accessibility, and music-site conversion requirements.
- [x] Validate clean desktop/mobile release states, live game sequences, typecheck, production build, runtime console, visual review, and publish only after all checks pass.

## Selectah controls and adaptive-card restoration

- [x] Update the game’s visible Selector wording to Selectah where requested.
- [x] Audit and repair bonus-level desktop and touch controls without changing normal-level controls.
- [x] Trace the adaptive-card preview source and restore the intended image-based archive cards.
- [x] Add the official-site adaptive card without replacing existing archive card imagery.
- [x] Validate game controls, adaptive-card image rendering, build, and publish.

## Arrow removal and targeted drip cleanup

- [x] Remove the remaining decorative arcade ribbon arrows from the release-to-game transition.
- [x] Shorten the release-card cyan drips so they end before the Selector Showdown heading area.
- [x] Remove cyan paint drips from the Frequency Loading and Floor Rewiring forthcoming cards.
- [x] Verify the affected mobile and desktop sections, build, and publish.

## Extended paint-overlap stacking correction

- [x] Identify the stacking contexts that currently let adjacent boxes cover the release, event-card, or arcade-flow drips.
- [x] Raise and lengthen every static drip layer so it visibly crosses only the top outline of the adjacent box below.
- [x] Preserve clear event, release, matrix, arcade, image, copy, and control content at desktop and mobile sizes.
- [x] Validate visual stacking, build, and publish the extended-overlap correction.

## Site-wide paint-drip placement standard

- [x] Inventory every active paint-drip element across the release card, forthcoming-event cards, arcade flow shell, and any other active site sections.
- [x] Move every paint drip outside and below its source card or source element’s bottom outline.
- [x] Limit overlap to adjacent outlines only; keep all images, copy, statuses, and controls unobstructed.
- [x] Validate the complete site at desktop/mobile breakpoints, build, and publish.

## Event-card cyan paint outside-outline correction

- [x] Move the cyan paint layer outside each forthcoming event-card interior and below its brown/orange bottom outline.
- [x] Allow only a light overlap onto the outline of the next box below, never its image, copy, or action areas.
- [x] Verify the event-card image, title, description, status, and performance-matrix content remain unobstructed on desktop and mobile.
- [x] Run visual/build validation and publish the corrected stacking treatment.

## Release gate unlocked-on-load regression

- [x] Reproduce the release state with clean storage, stale storage, and the currently deployed persistence proof.
- [x] Trace every code path that can set the release card to unlocked during initial load.
- [x] Correct the gate so initial access is locked unless the accepted verified chain-break proof is present.
- [x] Validate fresh desktop/mobile loads, stale-value rejection, valid post-chain restoration, build, and publish.

## Viscous cyan paint system and upcoming-event cards

- [x] Add subtle single-color cyan shade and highlight planes, varied longer runs, and small splatter drops to the release-card drip silhouette.
- [x] Extend the refined cyan paint system so it overlaps the adjacent box below in a controlled, readable way.
- [x] Apply the same cyan paint language to the upcoming-event cards without blocking their copy or actions.
- [x] Validate desktop/mobile stacking, content visibility, build, and publish.

## RESPEKT spelling and continuous cyan paint silhouette

- [x] Replace applicable visible supporter-splash and follow-confirmation wording from RESPECT to RESPEKT.
- [x] Replace the straight cyan strip and discrete tab drips with one continuous organic cyan silhouette matching the supplied reference.
- [x] Preserve the approved placement: paint appears only from below the cyan bottom outline and does not overlap release-card content.
- [x] Validate spelling, desktop/mobile geometry, build, and publish.

## Single-color below-outline paint drip

- [x] Remove the current multi-color, outlined paint-pool treatment from the release card.
- [x] Add one solid cyan drip silhouette, using the existing release-card outline color, that begins behind and below that outline only.
- [x] Confirm that no drip appears over the release-card text, controls, or interior surface.
- [x] Validate desktop/mobile placement, build, and publish the simplified treatment.

## Third Strike reference alignment

- [x] Replace the glossy neon-bar paint effect with hand-drawn, cel-shaded Third Strike-inspired paint forms.
- [x] Use the supplied reference’s visual grammar: chunky dark contours, warm shadow planes, irregular brush silhouettes, textured highlights, and grounded stage depth.
- [x] Keep the release card’s content, controls, locked-state behavior, and social metadata unchanged.
- [x] Validate the revised card against the reference on desktop and mobile, then publish.

## Authentic download-box paint drips

- [x] Identify the exact lower-edge element of the exclusive download box to use as the paint-flow source.
- [x] Add irregular, outlined, cel-shaded paint pooling and tapered drips directly attached to that edge only.
- [x] Confirm the treatment remains clear of release copy, controls, and the locked-state notice on desktop and mobile.
- [x] Run validation and publish the corrected box-attached visual treatment.

## Exclusive card paint drips and official share preview

- [x] Inspect the exclusive-release card’s current markup, layering, and responsive styles to identify why the requested paint drips are not visible.
- [x] Restore visible magenta, cyan, and orange paint drips from the exclusive card only, without changing the locked-release or chain-break behavior.
- [x] Create an official 1200×630 social share card centered on 5th Dimension’s music, selector identity, and playable arcade hook.
- [x] Add Open Graph and X/Twitter metadata that uses the new share card and concise music-first conversion copy.
- [x] Verify the release-card treatment and metadata at desktop/mobile sizes, run build checks, and publish.

## Street Fighter III arcade visual refinement

- [x] Inventory every Selector Showdown sprite, pickup, stage layer, cabinet surface, and full-screen overlay against the Street Fighter III-style visual brief.
- [x] Define visual-only revisions for silhouette, line weight, palette ramps, impact effects, stage depth, and pixel-art readability without changing gameplay infrastructure.
- [x] Apply the selected art-direction refinements only in visual markup, styles, and asset references.
- [x] Confirm no changes to controls, scoring, timers, audio, persistence, unlock logic, or game-state transitions.
- [x] Validate desktop/mobile visuals, typecheck, build, runtime console, and publish the visual-only checkpoint.

## Release-lock regression and evidence recheck

- [x] Reproduce the unlocked release card in a clean mobile and desktop browser session with site storage cleared.
- [x] Trace every state path that can expose the exclusive listen/download controls before a verified Level 1 chain break.
- [x] Correct the default, persistence, and chain-completion logic so a new visitor always sees a locked release card.
- [x] Validate that only a completed chain-break event persists the unlock and that refresh restoration works afterward.
- [x] Recheck all previously agreed site and game requirements against a documented acceptance checklist rather than source inspection alone.
- [x] Run clean-session desktop/mobile validation, TypeScript, production build, runtime-console review, and save evidence before reporting completion.

- [x] Locate the original character and artwork assets from the archive, previous workspace, or accessible project media.
- [x] Compare the original visual theme against the current fallback-based render and document the required replacements.
- [x] Restore original character-led artwork and theme assets without reintroducing former deployment identifiers.
- [x] Revalidate desktop and mobile rendering, typecheck, build, and tests.
- [x] Save a new checkpoint for the amended project.

## User-supplied reference restoration

- [x] Add the supplied graffiti mark, character portrait, and Dimension Performance Matrix to project-scoped asset storage.
- [x] Restore the original magenta/cyan/black character-led hero and artwork treatment using the supplied references.
- [x] Replace generic fallback visuals in the hero, projects, bio, gallery, social previews, and contact surfaces.
- [x] Recheck desktop/mobile rendering, typecheck, build, tests, and naming before saving the amendment checkpoint.

## Audio restoration

- [x] Upload the supplied MP3 to project-scoped storage.
- [x] Reconnect the “Jersh in Case” download action to the uploaded file.
- [x] Validate the audio URL, typecheck, build, and tests, then save a checkpoint.

## Lightbox and visual cleanup

- [x] Inspect the current art gallery and responsive interaction styles.
- [x] Add an accessible click/keyboard lightbox for gallery artwork.
- [x] Remove the character portrait from the opening hero background and the New Frequency Loading card.
- [x] Remove Orbit Tag / 5D from the gallery.
- [x] Validate lightbox interaction, responsive rendering, typecheck, build, and tests, then save a checkpoint.

## Vaporwave, graffiti flares, and junglist culture enhancement

- [x] Add neon scanlines, perspective grid horizons, and sunset glow to reinforce the vaporwave aesthetic.
- [x] Incorporate graffiti drip/spray flares and sticker tags across the hero and section headings.
- [x] Enhance dancehall and junglist sound-system references in copy, tags, and badges.
- [x] Ensure the art lightbox, image removals, and audio download remain fully functional.
- [x] Run typecheck, build, unit tests, and take verification screenshots.

## Interactive graffiti flares

- [x] Add hover and keyboard-focus feedback to the graffiti flare stickers.
- [x] Add a restrained neon pulse and spray/drip effect with reduced-motion support.
- [x] Validate desktop/mobile styling, typecheck, build, tests, and save a checkpoint.

## Hero number-5 protection

- [x] Keep the number 5 in the 5th Dimension hero title visibly clear of both interactive graffiti flares at desktop and mobile widths.
- [x] Revalidate the interactive flare styling and save the updated checkpoint.

## Vaporwave cityscape replacement

- [x] Remove the vaporwave sun layer from the hero.
- [x] Add a neon vaporwave cityscape with skyline silhouettes, window lights, haze, and perspective grid energy.
- [x] Confirm the hero number 5 remains clear of the cityscape and interactive flares on desktop and mobile.
- [x] Run typecheck, build, tests, screenshots, and save a checkpoint.

## Booking inquiry subject update

- [x] Update the booking mailto subject prefix to `BOOKING!` while retaining the user-entered subject.
- [x] Ensure the booking inquiry link and form target bobbyjackets.one@gmail.com.
- [x] Validate encoded subject/body behavior, typecheck, build, tests, and save a checkpoint.

## Optional booking details

- [x] Add optional proposed event date and event location fields to the booking form.
- [x] Include provided date and location values in the generated booking email body.
- [x] Validate optional-field encoding, typecheck, build, tests, responsive rendering, and save a checkpoint.

## DJ Catch-and-Dodge Mini-Game

- [x] Create a playable 5D DJ mini-game component with smooth movement, falling records, and cop-badge hazards.
- [x] Embed the mini-game section at the bottom of the page right before the footer.
- [x] Support keyboard arrow/A-D keys and touch/drag controls, score tracking, lives, and game over state.
- [x] Run typecheck, build, unit tests, and save an updated checkpoint.

## Selector Showdown high score

- [x] Load and persist the player’s best score with browser local storage.
- [x] Show the saved best score on the game-over screen and preserve it across restart/reload.
- [x] Validate first-play, persistence, typecheck, build, tests, responsive rendering, and save a checkpoint.

## Hero 5 mark cleanup

- [x] Remove the yellow square behind the first hero 5 without removing the number or neon treatment.
- [x] Finish local high-score persistence and game-over display validation.

## New Record badge

- [x] Detect when the completed score exceeds the previously saved local high score.
- [x] Display a flashing accessible `NEW RECORD!` badge on the game-over screen only for a new best.
- [x] Validate score transitions, build, tests, responsive rendering, and save a checkpoint.

## Game placement and download unlock

- [x] Remove the Instagram/SoundCloud live-feed section from the page.
- [x] Move Selector Showdown directly above the booking form.
- [x] Require five collected records before revealing the free download and explain the unlock in the game description.
- [x] Remove the yellow square treatment behind the first hero 5 and validate all changes.

## Selector Showdown arcade audio

- [x] Add a user-gesture-safe vinyl scratch effect for caught records and a siren effect for cop-badge hits.
- [x] Add a visible mute/unmute control and ensure effects never autoplay before the game starts.
- [x] Validate audio lifecycle, gameplay, build, tests, responsive rendering, and save a checkpoint.

## Selector Showdown placement

- [x] Move Selector Showdown directly below the Jersh in Case download card and above booking.
- [x] Validate the new order, download unlock, arcade audio, build, tests, and responsive rendering.

## Persistent download unlock

- [x] Save the five-record download unlock in browser local storage.
- [x] Restore the unlocked download state on page load while preserving the locked first-play state.
- [x] Validate unlock persistence, typecheck, build, tests, responsive rendering, and save a checkpoint.

## Download unlock celebration

- [x] Trigger a celebratory animation when the fifth record unlocks the free download.
- [x] Show a persistent confirmation banner near the Jersh in Case release card after unlock and after refresh restoration.
- [x] Validate first unlock, restored unlock, reduced-motion behavior, build, tests, responsive rendering, and save a checkpoint.

## Download unlock jingle

- [x] Add a short retro unlock jingle that plays once when the fifth record unlocks the free download.
- [x] Respect the existing sound toggle and avoid replaying the jingle on refresh restoration.
- [x] Validate the unlock audio path, build, tests, responsive rendering, and save a checkpoint.

## Unlock waveform

- [x] Add a subtle animated waveform inside the free-download unlock banner.
- [x] Synchronize the waveform with the unlock celebration and disable motion for reduced-motion users.
- [x] Validate the waveform, build, tests, responsive rendering, and save a checkpoint.

## Unlock waveform synchronization

- [x] Align the waveform pulse phases and duration with the four-note unlock jingle.
- [x] Preserve the mute control and reduced-motion behavior while tightening audiovisual timing.
- [x] Validate the synchronized celebration, build, tests, responsive rendering, and save a checkpoint.

## Hero title first-5 cleanup

- [x] Remove the yellow square behind the first 5 in the title.
- [x] Preserve the neon title shadows and validate desktop/mobile rendering, build, tests, and save a checkpoint.

## Mobile flare spacing refinement

- [x] Increase the mobile breathing room between the DUBPLATE flare and signal label.
- [x] Preserve the clear first 5 and desktop layout while validating screenshots, build, and checkpoint.

## Frequency Loading boombox and page-flow refinement

- [x] Replace the Frequency Loading section artwork with a generic 1980s cartoon boombox.
- [x] Reorder the artist-site sections and navigation into a clearer visitor flow.
- [x] Validate the new artwork, lightbox/game/download/booking interactions, responsive layouts, build, and checkpoint.

## Selector Showdown mobile loading repair

- [x] Reproduce the mobile start-state issue and inspect game initialization, canvas sizing, and touch controls.
- [x] Fix the blocker so Start Game reliably opens the playable arena on mobile.
- [x] Validate mobile and desktop start/game-over flows, existing sound/unlock behavior, build, and checkpoint.

## Retro boombox tape play button

- [x] Restyle the Selector Showdown start/play control as a retro tape-deck play button.
- [x] Preserve accessibility, mobile visibility, game start behavior, and validate build before checkpoint.

## Selector Showdown failed catcher repair

- [x] Replace the failed generated DJ catcher image with a reliable built-in CSS/HTML boombox catcher.
- [x] Validate active mobile gameplay, touch controls, responsive layout, build, and checkpoint.

## Selector Showdown 2-bit jungle DJ rebuild

- [x] Inspect current game-loop timing, movement input, collision bounds, and rendered catcher.
- [x] Create and integrate a 2-bit Sega Genesis-inspired jungle DJ sprite and rave-stage background.
- [x] Rebuild movement/rendering for responsive mobile touch and keyboard play with smoother frame updates.
- [x] Validate score, lives, high score, sound, five-record unlock, mobile/desktop play, build, and checkpoint.

## 16-bit jungle soundtrack integration

- [x] Enter generate mode and produce an authentic 16-bit Sega Genesis jungle / drum and bass background track.
- [x] Wire the looping track into Selector Showdown with user-gesture safety, pause/resume, and volume controls.
- [x] Validate playback, build checks, and checkpoint delivery.

## 90s Sega arcade polish

- [x] Redesign falling records into detailed spinning vinyl records with center spindle labels.
- [x] Redesign cop badges into flashing Sega-style twin cop sirens with animated beacon domes.
- [x] Expand the DJ catcher’s horizontal catch surface for fair, responsive gameplay.
- [x] Audit all code, styles, and audio hooks to guarantee a professional 16-bit arcade finish.

## 16-bit arcade sound effects upgrade

- [x] Upgrade `playRecordScratch` to a multi-oscillator 16-bit scratch chime with chip-lead resonance.
- [x] Upgrade `playCopSiren` to an authentic multi-octave Sega Genesis alarm sweep with square-wave pulse distortion.
- [x] Validate audio synchronization, mute control, typecheck, build, and checkpoint.

## Scoring & five-record unlock celebration repair

- [x] Audit and fix score tracking and 5-record unlock trigger in DjMiniGame.tsx.
- [x] Implement DJ booth and speaker-drop lowering animation on unlock celebration.
- [x] Add the animated waveform pulse and unlocked download confirmation near the release card.
- [x] Validate scoring, build checks, and checkpoint delivery.

## Confetti celebration particle burst

- [x] Add confetti particle layer to DjMiniGame.tsx during unlock celebration.
- [x] Implement floating confetti keyframe animations in index.css.
- [x] Validate typecheck, build checks, and checkpoint delivery.

## Police badge hazard & dancehall laser sound upgrade

- [x] Redesign the falling hazard into a classic golden/silver police shield badge topped with flashing red/blue patrol lights.
- [x] Upgrade `playRecordScratch` to include a classic descending dancehall laser stab alongside the vinyl scratch chime.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Retro arcade cabinet bezel wrapping

- [x] Wrap the game viewport inside an authentic 90s Sega arcade cabinet bezel frame with marquee header and control panel base.
- [x] Implement responsive cabinet bezel styling and metallic/neon accents in index.css.
- [x] Validate typecheck, build checks, and checkpoint delivery.

## Retro high-score table popup

- [x] Implement top-selector score array persistence and ranking logic in DjMiniGame.tsx.
- [x] Render a retro arcade high-score leaderboard table on the game-over screen.
- [x] Add retro table styling in index.css.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Share button & post-level free-download handoff

- [x] Add share button below the arcade cabinet with Web Share API and copy-to-clipboard fallback in DjMiniGame.tsx.
- [x] Add post-level smooth scroll / handoff to the unlocked download release section on the site once 5 records are caught.
- [x] Add share button styling in index.css.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Social preview optimization

- [x] Update client/index.html with rich Open Graph and Twitter card meta tags for 5th Dimension (Bobby Bass) and Selector Showdown.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Custom social banner generation & integration

- [x] Generate a custom 1200x630 social preview banner featuring the 5th Dimension graffiti logo and arcade cabinet.
- [x] Integrate the banner URL into client/index.html Open Graph and Twitter metadata.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Arcade combo multiplier ticker

- [x] Implement combo streak count and multiplier calculation in DjMiniGame.tsx.
- [x] Render combo badge / multiplier ticker in the game HUD.
- [x] Add combo badge styling in index.css.
- [x] Validate typecheck, production build, and checkpoint delivery.

## 16-bit jungle music restoration & unlock laser burst

- [x] Audit and ensure background music element is unmuted, looping, and reliably triggered on startGame gesture in DjMiniGame.tsx.
- [x] Upgrade playUnlockJingle to an authentic multi-octave descending dancehall laser burst.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Audio troubleshooting & reliable gameplay playback

- [x] Audit audio asset path and test network fetch in DjMiniGame.tsx.
- [x] Ensure background music play() promise is caught and guaranteed on startGame and unmute.
- [x] Ensure Web Audio context is resumed on user gesture before synthesizing laser and scratch cues.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Realistic arcade cabinet height & proportion redesign

- [x] Reduce cabinet wrapper height, marquee padding, and viewport height in index.css for a realistic 90s tabletop/upright arcade proportion.
- [x] Validate typecheck, production build, and checkpoint delivery.

## Post-unlock controls, named high scores & music playback repair

- [x] Stop gameplay when the fifth record unlocks the download and show Reset Game / Keep Playing choices.
- [x] Add player-name entry before saving a score and display names in the leaderboard.
- [x] Diagnose and repair background music playback, including asset loading, AudioContext resume, and mute/unmute state.
- [x] Validate typecheck, production build, gameplay flow, and checkpoint delivery.

## Five-second achievement reveal and dancing sprite ensemble

- [x] Generate and upload three original female jungle dancer sprites with transparent backgrounds for the achievement sequence.
- [x] Extend the achievement celebration and download reveal timing to five seconds.
- [x] Animate the unlocked download box descending from the top and reveal a green free-download button.
- [x] Show and animate all three dancer sprites during the achievement sequence with reduced-motion and mobile support.
- [x] Validate the celebration flow, asset loading, typecheck, production build, and checkpoint delivery.

## Two-level Selector Showdown finale

- [x] Return the unlocked release card to its normal page position after Keep Playing and score-name submission while preserving the unlocked state.
- [x] Add Level 2 state and transition with rear-view DJ booth art, crowd, stage lights, and reset lives.
- [x] Add Level 2 falling records plus bottle and apple-core hazards; require 15 records to pass and remove a life for each caught hazard.
- [x] Preserve the same jungle music style and keep gameplay smooth across the level transition.
- [x] Add the dark green 1980s end screen using the submitted leaderboard username: “Big Up Badman [username] Jungle is Massive.”
- [x] Refine the arcade cabinet geometry and validate the full user journey, responsive behavior, audio, typecheck, production build, and checkpoint delivery.

## Final experience and site-wide design audit

- [x] Verify audible looping background music during active gameplay separately from synthesized effects.
- [x] Verify the achievement celebration uses matching female raver sprites, lasts five seconds, and includes the slow download-box descent.
- [x] Audit the full site against established hierarchy, contrast, readability, accessibility, responsive, and conversion principles.
- [x] Fix any discovered gameplay, visual, accessibility, metadata, or marketing-flow issues.
- [x] Validate the complete site, build, audio, and responsive behavior, then save a checkpoint.

## Shared Level 2 character and unlock celebration correction

- [x] Replace the Level 2 rear-view character with the exact same playable DJ sprite used in Level 1.
- [x] Reproduce the five-record unlock from a clean state and ensure dancer sprites, confetti, and the five-second celebration are visibly rendered.
- [x] Ensure the unlocked download box visibly descends from the top into its green free-download state.
- [x] Analyze the 16-bit jungle MP3 and verify an amen-break section is present; confirm the real MP3 plays during active gameplay.
- [x] Validate Level 1 unlock, Level 2 character consistency, celebration timing, download reveal, audio, build, and checkpoint delivery.

## Level 2 terminal finale restoration

- [x] Inspect the Level 2 completion, name-save, finale state, and rendered overlay wiring.
- [x] Restore the neon-green-on-black 1980s computer-terminal finale with the exact personalized message.
- [x] Ensure the finale appears after the selector name is saved and remains readable on mobile.
- [x] Validate Level 2 completion, name submission, finale visibility, typecheck, production build, and checkpoint delivery.

## Persistent raver-sprite celebration and box framing

- [x] Ensure the three female raver sprites remain visible on screen beside the unlock box during the Level 1 decision state.
- [x] Cleanly clear the raver sprites and celebration state when transitioning to Level 2 or resetting the game.
- [x] Style the dancers on either side of the unlock box within the arcade overlay.
- [x] Validate Level 1 unlock celebration, dancer persistence, Level 2 cleanup, typecheck, build, and checkpoint delivery.

## Level 1 achievement polish & pre-Level-2 name entry

- [x] Elevate the celebration dancer z-index so the raver sprites render in front of the unlock box overlay.
- [x] Implement a 3-second celebration delay before the download unlock and decision actions appear.
- [x] Add a pre-Level-2 name-entry high-score screen when the player chooses Keep Playing after Level 1.
- [x] Validate the revised 3-second delay, front-layer dancers, pre-Level-2 high score entry, Level 2 transition, build, and checkpoint delivery.

## Level 1 progression repair and detailed Level 2 scene

- [x] Diagnose and repair the path that terminates Level 1 before the 25-record unlock target.
- [x] Keep the existing Level 2 rear-view DJ booth, crowd, and hazard subjects while rebuilding the scene with detailed pixel-art concert-stage depth.
- [x] Validate 25-record Level 1 progression, 50-record Level 2 progression, visual composition, responsive gameplay, build, and checkpoint delivery.

## Level 2 hazard clarity and automatic terminal finale

- [x] Restyle apple-core hazards as visibly red apples and make bottle hazards visibly white and larger.
- [x] Reuse the saved Level 1 selector tag on Level 2 completion so players do not enter their name a second time.
- [x] Reveal the green terminal finale directly after the 50-record Level 2 completion and validate the complete flow.

## Level 2 terminal respect ticker

- [x] Add a bottom-centered green scrolling terminal message: “MAXIMUM RESPEKT BOH! BOH!”
- [x] Preserve the existing personalized terminal finale text, CTA, and reduced-motion support.
- [x] Validate the terminal layout, build, and checkpoint delivery.

## Unlock control visibility and Level 2 dancer backdrop

- [x] Raise the Keep Playing action so it is visible in the Level 1 unlock decision without scrolling.
- [x] Retain the dancer sprites during Level 2 as a low-priority background layer that does not obscure playable objects.
- [x] Validate unlock decision visibility, Level 2 visual layering, build, and checkpoint delivery.

## Exclusive MP3 listening control

- [x] Add an in-page Play/Pause control for the unlocked Jersh In Case MP3.
- [x] Preserve the locked state and direct download action after the 25-record unlock.
- [x] Validate listen, pause, unlock gating, download behavior, build, and checkpoint delivery.

## Direct game share and supporter confirmation

- [x] Keep the existing bottom arcade share widget and add a matching direct-game share widget beside the unlocked player.
- [x] Implement an honest, persistent supporter confirmation flow for shared-game visitors; do not falsely claim to verify a Facebook Like.
- [x] Validate both sharing widgets, local persistence, unlock gating, build, and checkpoint delivery.

## Level 1 staged sound-system progression

- [x] Upgrade the Level 1 setting into a detailed late-1990s pixel-art street-stage scene while preserving its existing subjects and gameplay lanes.
- [x] Raise speaker towers halfway at 10 records and to full size at 15 records, with debris effects on each growth milestone.
- [x] Drop a side turntable/deck set at 20 records for the Level 2 setup and preserve the 25-record unlock.
- [x] Validate all milestones, responsive gameplay, build, and checkpoint delivery.

## Speaker milestone and Level 2 stability repair

- [x] Diagnose and repair the missing 10/15-record speaker milestone visibility.
- [x] Diagnose and repair the Level 2 white-screen failure reported around 30 records.
- [x] Validate Level 1 milestones and extended Level 2 play through the 50-record finale.
- [x] Run build checks and save the repaired checkpoint.

## Critical blank-page restoration

- [x] Identify and repair the current blank white-page runtime regression.
- [x] Verify the page, arcade entry, and production build render normally.
- [x] Save a corrective checkpoint only after the live preview is restored.

## Level 2 special pickups and chained achievement reveal

- [x] Ensure Level 2 dancer sprites remain visibly animated behind the active game layers.
- [x] Add rare Level 2 lion-head pickups worth 2 points and CDJ pickups worth 5 points.
- [x] Replace the combo feedback copy with the requested five dancehall phrases in a graffiti-like display treatment.
- [x] Add a chain-wrapped Level 1 download achievement that arrives at its destination and breaks free over two seconds.
- [x] Validate gameplay values, visual layering, timing, build, and checkpoint delivery.

## Level 1 visible chain-break splash phase

- [x] Keep the chained download achievement visibly present on the Level 1 splash screen after it lands.
- [x] Run a distinct two-second chain-break animation before enabling Level 2 continuation.
- [x] Validate the splash timing, Level 2 handoff, build, and checkpoint delivery.

## Visual chain-link unlock sequence

- [x] Replace textual chain status with visible linked-chain segments around the Level 1 achievement.
- [x] Animate chain links separating and flying apart before Level 2 continuation becomes available.
- [x] Validate the animation, handoff, build, and checkpoint delivery.

## Chain-break impact audio

- [x] Add a synthesized metallic impact for the first frame of the linked-chain release.
- [x] Verify muted and standard audio paths, compile, and save a checkpoint.

## Chain-break cabinet vibration

- [x] Trigger a restrained cabinet shake at the exact start of the metallic chain-break impact.
- [x] Respect reduced-motion preferences and validate the animation, build, and checkpoint delivery.

## Ten-combo rewind reward

- [x] Detect the 10× combo threshold and award a five-point rewind bonus once per streak.
- [x] Pause gameplay for a “REWIND ACHIEVED” / “BOH MY SELECTAH” dripping-graffiti splash, then resume automatically.
- [x] Validate score, gameplay continuation, responsive splash presentation, build, and checkpoint delivery.

## Twenty-combo Wheel It Up reward

- [x] Detect the 20× combo threshold and award a ten-point bonus once per uninterrupted streak.
- [x] Pause gameplay for a distinct “WHEEL IT UP” visual, then resume automatically.
- [x] Validate reward precedence with the 10× rewind, score continuity, responsive display, build, and checkpoint delivery.

## Silver full-width chain and reward callout refinement

- [x] Rebuild the Level 1 achievement chain as oversized silver links spanning the download text before the break.
- [x] Restrict “Rewind Achieved” feedback to the 10× and 20× combo reward moments only.
- [x] Validate chain scale, break choreography, reward copy, build, and checkpoint delivery.

## Pre-break silver-chain glint

- [x] Add a brief reflective silver glint sweep just before the chain-break phase.
- [x] Preserve the chain impact timing, reduced-motion behavior, build, and checkpoint delivery.

## Broken silver-link cabinet debris

- [x] Add silver link fragments that fall from the release chain after it breaks.
- [x] Bounce fragments along the cabinet base, clear them before continuation, and preserve reduced-motion behavior.
- [x] Validate layering, timing, build, and checkpoint delivery.

## Exclusive-drop credit and arcade graffiti flow

- [x] Make the Jersh In Case artist credit substantially more prominent and legible.
- [x] Add graffiti-style arrows flowing from the exclusive drop toward and around the arcade cabinet.
- [x] Validate desktop/mobile wrapping, contrast, build, and checkpoint delivery.

## Two-badge police seizure splash

- [x] Track police-badge hits and trigger a seizure event after the second hit in a run.
- [x] Pause for a Sega-style police-car splash reading “COPS SEIZED YOUR MIXER. WATCH OUT!”, then resume gameplay automatically.
- [x] Validate lives, threshold reset, continuation, responsive animation, build, and checkpoint delivery.

## Police-radio seizure audio

- [x] Add a short synthesized police-radio voice-style burst at the cop-car splash entry.
- [x] Keep the burst synchronized, mute-aware, and safe across repeated seizure events.
- [x] Validate audio behavior, build, and checkpoint delivery.

## Police-radio squelch click

- [x] Add a distinct radio-squelch click immediately before the police voice-style burst.
- [x] Preserve mute-aware timing and validate build and checkpoint delivery.

## Post-seizure DJ reaction sprite

- [x] Add a brief expressive DJ sprite beat after the cop-car sequence.
- [x] Keep the reaction inside the seizure pause window, responsive, and clear before automatic gameplay resumption.
- [x] Validate presentation, continuation, build, and checkpoint delivery.

## Post-seizure recovery combo prompt

- [x] Add a recovery-combo encouragement prompt immediately after the DJ reaction beat.
- [x] Keep the prompt inside the seizure pause window and validate responsive presentation, continuation, build, and checkpoint delivery.

## Damaged-mixer recovery objective

- [x] Apply a damaged-mixer visual state after a police seizure and track the required three recovered dubplates.
- [x] Repair the mixer with a visible completion effect and award a recovery score bonus.
- [x] Validate score accounting, reset rules, responsive visuals, build, and checkpoint delivery.

## Cross-level hazard and chain-release refinement

- [x] Ensure the two-badge police seizure sequence triggers in both Level 1 and Level 2.
- [x] Shorten the full silver-chain release to a more realistic one-second break choreography.
- [x] Trigger an angry crowd “BAD SELECTION / BROKEN RECORD — SWITCH IT UP!” splash after two bottle or apple-core hits.
- [x] Validate thresholds, resets, score/life continuity, responsive animation, build, and checkpoint delivery.

## Complementary arcade-arrow ribbons and Level 2 music cue

- [x] Restyle the release-to-arcade arrows as complementary-color graffiti ribbons on both sides of the release box.
- [x] Start the ribbons at the release-box center, wrap them around the cabinet, and add paint drips without obscuring controls.
- [x] Start Level 2 from a later section of the jungle track to make the level transition audible.
- [x] Validate desktop/mobile wrapping, audio behavior, build, and checkpoint delivery.

## Level 2 scratch cue and Crowd Pressure marquee

- [x] Play a short record-scratch cue immediately before the Level 2 jungle-track section begins.
- [x] Display a clear “LEVEL 2 — CROWD PRESSURE” marquee through the Level 2 transition.
- [x] Add subtle complementary paint-splatter particles along both graffiti ribbon arrows.
- [x] Validate timing, mute behavior, responsive marquee, build, and checkpoint delivery.

## Level 2 crowd hype and release-flow refinement

- [x] Place the current published domain in maintenance while keeping its URL unchanged during the update.
- [x] Add a compact Level 2 crowd-hype objective meter below the HUD, driven by collected dubplates.
- [x] Add paint drips to the exclusive-drop box and reroute the paired ribbons so they wrap around rather than cover the box text.
- [x] Validate desktop/mobile clarity, gameplay meter behavior, checkpoint, and return the same domain online.

## Level 2 crowd-cheer milestone

- [x] Trigger a one-time crowd-cheer sound when Level 2 hype first reaches 25 of 50 dubplates.
- [x] Reset the cheer eligibility for each new Level 2 session and respect the mute control.
- [x] Validate timing, build, and checkpoint delivery.

## 90s rave-world game enhancement

- [x] Add richer in-game rave-world signage and DJ-specific 90s humour that responds to the active level.
- [x] Add engaging arcade feedback moments that celebrate clean selection without changing the required two-level progression.
- [x] Validate desktop/mobile legibility, gameplay continuity, build, and checkpoint delivery.

## No Request Bonus side-scroller

- [x] Track Level 1 clean-run eligibility and show a “NO REQUEST BONUS!” splash before the bonus level.
- [x] Build a dawn vaporwave side-scroller with the DJ sprite, jump controls, rolling pills/CDs/ravers/bracelets/bottles, and a club owner by the top door.
- [x] Add a rewind transition back to the main game and make earned bonus rewards available across both main levels.
- [x] Validate balance, desktop/mobile controls, progression, build, and checkpoint delivery.

## Reactive combo and pickup expansion

- [x] Make rare 10×/20× combo rewards and standard combo callouts visibly reactive in both game levels, including a rewind transition, dancers, screen shake, subwoofer, and broken-ground deck/mixer moments.
- [x] Add positive CDJ, turntable, and 45-adapter pickups to both levels while retaining readable reward values.
- [x] Add falling pills and mobile phones as fair negative hazards in both levels.
- [x] Redraw the Level 2 lion pickup as a more recognizable Lion of Judah treatment.
- [x] Validate pickup balance, special-event timing, desktop/mobile rendering, build, and checkpoint delivery.

## Turntable and adapter pickup audio

- [x] Add distinct mute-aware 16-bit sound effects for turntable and 45-adapter pickups.
- [x] Validate pickup routing, build, and checkpoint delivery.

## Pickup-value HUD feedback

- [x] Add a subtle HUD-side flash that identifies the value of each positive pickup when collected.
- [x] Validate feedback timing, responsive presentation, build, and checkpoint delivery.

## Pre-level pickup legend

- [x] Add a compact, level-aware pickup legend to the Level 1 and Level 2 instruction screens.
- [x] Validate mobile readability, build, and checkpoint delivery.

## Game audit and direct-playback mix archive

- [x] Review Selector Showdown for gameplay friction, visual overload, and responsive interaction issues; apply focused fixes while preserving progression.
- [x] Verify and prepare supplied Google Drive audio sources for direct site playback, including the repeated Festival Live Mix Part C/Part D link.
- [x] Add the supplied mixes to the Listen section with the stated titles, artists, descriptions, and native on-site players; place Deep On Rolling and Minianimilism 2 in the DnB/jungle archive rather than the house grouping.
- [x] Validate game flow, audio playback, mobile usability, metadata, build, and checkpoint delivery.

## Mix-cover artwork exploration

- [x] Develop one coherent archive-broadcast cover direction with a distinct genre-specific concept for each of the nine supplied mixes.
- [x] Generate and lightly validate nine standalone square cover thumbnails.
- [x] Present every titled cover to the user for approval or amendment before integrating any into the site.

## PNG cover-set re-delivery

- [x] Locate the generated cover files and attach them as standard PNGs for direct user review.

## Approved mix-cover integration and downloads

- [x] Map all nine approved cover PNGs to their corresponding archive MP3 files and player entries, preserving every provided title and artist credit exactly.
- [x] Embed each approved cover as album artwork in the matching MP3 metadata and upload the finalized downloadable file with the supplied title and artist credit.
- [x] Show each approved cover, exact title, exact artist credit, and a direct download control beside every native audio player.
- [x] Validate cover display, downloadable artwork/title/artist metadata, playback, responsive layout, build, and checkpoint delivery.

## Individual mix sharing

- [x] Add a share control to each archive mix with its approved cover, exact title, and artist credit.
- [x] Include the exact call to action: “check out 5th Dimension music official site for more content, games and upcoming events”.
- [x] Validate the native-share and copy-link fallback behavior, responsive share-card display, build, and checkpoint delivery.

## Level 2 HUD clearance

- [x] Remove the Level 2 Rave Etiquette box and place the Crowd Hype meter in its unobstructed in-world location.
- [x] Validate the Level 2 playfield layout, build, and checkpoint delivery.

## No Request Bonus rebuild

- [x] Replace the unreliable bonus movement/jump interaction with arrow-key movement plus Space jump on desktop and tap-to-jump mobile controls.
- [x] Enrich the dawn bonus scene with a visibly angry club-owner sprite throwing bottles near the top door, while keeping the doorway passable.
- [x] Change the DJ to a camo outfit after completing the bonus level.
- [x] Restrict bottles and apple cores to Level 2 and start the Level 1 jungle music with gameplay.
- [x] Validate desktop and mobile bonus gameplay, visual clarity, level hazard routing, audio timing, build, and checkpoint delivery.

## Mixer, turntable, and rewind bonus events

- [x] Trigger a record-crate splash after collecting three mixers: “A DJ accidentally put his records in your crate!”
- [x] Trigger a headphones splash after collecting three turntables: “You remembered to bring your headphones to the rave!”
- [x] Make rewind transitions spin visibly back into live gameplay.
- [x] Validate bonus-event timing, resume behavior, build, and checkpoint delivery.

## Level 2 reactive hit scenes and pickup-art refinement

- [x] Keep the established dancer sprites visible and actively animated throughout Level 2 gameplay without obstructing the playfield.
- [x] Trigger a three-pill “YOU ATE A PILL AND ARE TOO HIGH TO PLAY.” dopey-DJ splash with exaggerated pupils, then resume cleanly.
- [x] Replace the bottle/apple crowd reaction with a “WRONG TUNE MY SELECTAH — PEOPLE ARE LEAVING THE DANCEFLOOR” empty-club DJ scene.
- [x] Redraw the apple core and Lion of Judah pickups as more legible 16-bit arcade sprites consistent with the Level 2 world.
- [x] Validate desktop/mobile layering, hazard thresholds, pause/resume behavior, pickup visibility, build, and checkpoint delivery.

## Level 2 reactive-scene audio

- [x] Add a distinct mute-aware woozy 16-bit sound sequence to the three-pill dopey-DJ scene.
- [x] Add a distinct mute-aware sparse empty-club / closing-time sound sequence to the bottle/apple crowd-exit scene.
- [x] Validate scene-to-sound timing, mute behavior, typecheck, production build, and checkpoint delivery.

## Arcade Facebook artist-page actions

- [x] Add a “Big Up! (Like)” Facebook action to the between-level handoff.
- [x] Add the same action to the end-of-game finale, pointing to the artist page already supplied by the user.
- [x] Validate target URL, responsive presentation, build, and checkpoint delivery.

## Diagonal chained-unlock refinement

- [x] Move the chained Level 1 unlock box from the top-right to the bottom-left before its release sequence.
- [x] Restyle the chain as thick, dark, segmented 16-bit links inspired by the supplied reference image.
- [x] Validate desktop/mobile travel path, chain readability, break timing, build, and checkpoint delivery.

## Padlock and destination-flash reinforcement

- [x] Enlarge and reinforce the padlock on the diagonal chained unlock.
- [x] Add a bright bottom-left destination-corner flash immediately before the chain break.
- [x] Validate timing, responsive presentation, build, and checkpoint delivery.

## Persistent Facebook-follow recognition

- [x] Add a compact Facebook-follow reminder below the permanent game-share control.
- [x] Add an explicit honor-based confirmation action that opens the artist page and triggers a RESPECT fist-bump splash with arcade shake.
- [x] Persist the acknowledgement locally and validate desktop/mobile layout, timing, build, and checkpoint delivery.

## RESPECT selector-tag callout

- [x] Display the player’s saved selector tag in the RESPECT fist-bump splash.
- [x] Make the tag flash with bright arcade colors and provide a clear fallback when no tag is saved.
- [x] Validate motion preferences, build, and checkpoint delivery.

## Bonus controls and Level 1 clarity pass

- [x] Restyle the bonus club owner as a detailed character compatible with the DJ sprite language.
- [x] Make bonus obstacles roll rather than float and support tap-to-jump, swipe-left/right movement, and swipe-up climb motion.
- [x] Move the Level 1 selector-name handoff higher, remove the two unwanted brown bottom boxes, and correct Level 1 catch collisions.
- [x] Add dancing sprites as a visible Level 1 reward at an 18-dub streak.
- [x] Validate desktop/mobile controls, obstacle behavior, collision reliability, responsive presentation, build, and checkpoint delivery.

## Fire-escape bonus rebuild and consistent feedback

- [x] Rebuild the bonus platforms, ladders, and doorway as a detailed club fire-escape exit in the established fighting-game pixel style.
- [x] Synchronize speakers and other environmental entrances with stronger Street Fighter-inspired impact animations.
- [x] Audit and repair shared reward/punishment overlay triggers and heart-loss feedback across both levels.
- [x] Validate desktop/mobile gameplay feedback, visual sequencing, build, and checkpoint delivery.

## Fire-escape neon skyline animation

- [x] Add subtle flashing neon windows and distant sign glows to the fire-escape city silhouette.
- [x] Preserve readable obstacle lanes and support reduced-motion preferences.
- [x] Validate build, visual restraint, and checkpoint delivery.

## Fire-exit activation lighting

- [x] Add a red EXIT-beacon pulse when the bonus door opens.
- [x] Cast a matching red rim light across the bonus DJ sprite during the open-door state.
- [x] Validate timing, reduced-motion behavior, build, and checkpoint delivery.

## Visible fire-escape street-stage effects

- [x] Add a clearly visible sweeping searchlight behind the fire escape.
- [x] Add prominent paint drips and splatter to the fire-exit structure.
- [x] Add readable impact effects while keeping bonus-platform lanes unobstructed.
- [x] Validate mobile/desktop clarity, build, and checkpoint delivery.

## Bonus cleanup and control reliability

- [x] Remove paint splatter, drips, and related bonus-level effects; retain the established Jersh download-box paint treatment only.
- [x] Remove the two lower gameplay text boxes and replace the club owner with a cleaner DJ-compatible pixel character treatment.
- [x] Replace blocky bonus controls with reliable tap jump, swipe movement/climb, and periodic rolling obstacles that match the game’s item language.
- [x] Validate mobile/desktop controls, object cadence, gameplay clarity, build, and checkpoint delivery.

## Level 1 unlock gating and arcade panel order

- [x] Keep the Jersh download locked on a fresh session until Level 1 is completed and the chain sequence has run.
- [x] Place the Start/Play Again/Reset action before the pickup-value legend in every relevant arcade panel.
- [x] Add a compact visual bonus-control guide and order Level 1 handoff controls as replay first, then controls, Facebook Like, and selector tag entry.
- [x] Validate fresh-session flow, local unlock persistence after achievement, responsive panel order, build, and checkpoint delivery.

## Full Selector Showdown audit and cabinet refinement

- [x] Audit the coded game flow and presentation against the established requirements, excluding all arrow-related treatments.
- [x] Refine the cabinet as a more convincing 90s arcade machine with readable functional controls and physical detail.
- [x] Rewrite the initial pre-play instructions to match the actual Level 1, Level 2, bonus, reward, punishment, and unlock behavior.
- [x] Repair any verified gaps found in the audit, then validate fresh progression, desktop/mobile controls, audio state, build, and checkpoint delivery.

## Industrial speaker-stack art refinement

- [x] Restyle the Level 1 speaker stacks to match the supplied industrial red-driver cabinet reference.
- [x] Add visible corner plates, vents, bolts, support legs, and cable details while preserving 10/15-record milestones.
- [x] Validate milestone motion, responsive presentation, build, and checkpoint delivery.

## Selector Showdown regression restoration

- [x] Audit all agreed splash events, pickup/token sound cues, chain unlock stages, and Level 1/Level 2 transitions against current code paths.
- [x] Repair any confirmed missing, hidden, or prematurely cleared splash/audio behavior without unrelated visual changes.
- [x] Validate fresh progression, mute behavior, event timing, desktop/mobile presentation, build, and checkpoint delivery.
- [x] Deliver a specific report of every confirmed missed behavior, the exact repair made, and the validation performed.

## Coin-style pickup sound restoration

- [x] Cross-reference the original pickup-audio requirement against the current positive-collection sound stack.
- [x] Add an unmistakable coin-style token cue for positive pickups while preserving record, deck, and adapter effects.
- [x] Validate mute behavior, collection routing, build, and checkpoint delivery.
- [x] Deliver a concise requirement-to-implementation report.

## Complete discussion-to-implementation re-audit

- [x] Create a traceable matrix covering site structure, release unlock, mix archive, cabinet, Level 1, Level 2, bonus stage, sounds, all splash/reward states, sharing, and responsive behavior.
- [x] Inspect the current implementation against every matrix category and mark each as confirmed, missing, regressed, or ambiguous.
- [x] Repair every confirmed missing or regressed behavior in grouped, regression-safe changes, including the coin-style token sound.
- [x] Validate the repaired site and game with fresh progression, desktop/mobile checks, console review, typecheck, and production build.
- [x] Deliver the full requirement-to-implementation matrix with exact fixes and validation evidence.

- [x] Complete normal-runtime police recovery prompt verification at desktop and phone widths after the dedicated timing fix
- [x] Complete normal-runtime evidence sweep for police, pill, crowd, and thrown hazard scenes
- [x] Complete master-contract trigger, timing, audio handoff, return-to-play, and visual checklist validation
- [x] Task 1: Unify global font hierarchy to Press Start 2P headlines and Courier New body text without changing existing content or arcade gameplay
- [x] Pause after Task 1 and request user confirmation before Task 2

## Reposted 5th Dimension Arcade Style System Reference

- [x] Preserve the reposted five-color palette, font rules, pixel-sprite treatment, scanlines, vignette, chunky borders, hard shadows, asymmetric layouts, and UK rave humor as governing constraints for subsequent tasks
- [x] Preserve exact hazard and reward copy from the reposted style system where applicable
- [x] Preserve the no-halo sprite contract: pixelated rendering, crisp edges, normal blend mode, and one hard drop shadow

## Website Task Sequence

- [x] Task 2: Fix Visuals Archive section with actual 5D content and staggered collage layout
- [x] Task 3: Redesign Selector Profile as an asymmetrical zine spread
- [x] Task 4: Promote Jersh In Case as a standalone dubplate card
- [x] Task 5: Redesign Booking section as the Lock Into the Frequency terminal
- [x] Task 6: Reframe site flow as a connected physical-space journey
- [x] Task 7: Run final site/game consistency and mobile validation audit
- [x] Interact with the live SoundCloud embed on desktop and phone to verify playback, share, and external-link usability after the yellow-accent removal
- [x] Capture a normal gameplay run showing first BOH and Run the Riddim rewards, with Big Up and Gun Finger readable as non-blocking overlays while gameplay continues
- [x] Capture desktop and phone Bonus 2 live-run evidence showing compacted status chrome does not block route entities or lanes
- [x] Capture and log desktop and phone runtime evidence for crate, headphones, salute/riddim, Level 2 arrival, chain/unlock/finale, and bonus states
- [x] Run and document full phone-width loss/curbside/game-over verification, including replay/reset timing after the curb timer
- [x] Perform a dedicated all-states DJ sprite review to prove no backing square or matte remains in active play, hazards, loss, game over, and bonus scenes
- [x] Create a scene-by-scene checklist mapping every splash and transition state to live runtime evidence for copy, timing, audio handoff, and return-to-play
- [x] Fix the development-only held loss verifier so its curbside fade animation pauses at a readable frame for phone evidence, without changing normal 2.3s loss timing.

## Final evidence reconciliation after approval

- [x] Capture a complete desktop-and-phone evidence matrix for every named splash, transition, reward, loss, game-over, finale, and bonus scene and append it to the validation document.
- [x] Record normal-runtime proof for BOH, Big Up, Gun Finger, and Run the Riddim, including return-to-play and non-blocking behavior.
- [x] Run and document the full phone-width loss → curbside → game-over → replay/reset sequence with timing notes.
- [x] Perform and document an all-states DJ sprite audit covering active play, hazards, bonuses, loss, and game-over.
- [x] Create a scene-by-scene checklist mapping every state to runtime evidence for copy, timing, audio handoff, and return-to-play.
- [x] Add a development-only combo reaction verifier for Gun Finger evidence; preserve the normal production combo threshold and timing.
- [x] Generate and attach a refreshed plain-text Selectah Showdown game-code export from the current source and directly imported arcade stylesheets.
- [x] Apply and verify the user-provided falling-items-layer, falling-object, DJ catcher, and game viewport visibility override without changing gameplay logic.
- [x] Render only `isPlaying && visibleItems.slice(-18).map(...)` for falling items while preserving item state, collision logic, and scoring.
- [x] Add a temporary development-only falling-item diagnostic for play state, visible item count, and the mounted item-layer ref; remove it after verification.
- [x] Apply and verify the DJ sprite normal blend-mode, hard-shadow, no-clip, and no-mask safeguard without changing the sprite asset or gameplay geometry.
- [x] Apply and verify the complete falling-items render-fix block, including layer/object visibility, HUD and overlay stacking, hazard dimming, and the empty-layer debug helper.
- [x] Apply the requested mobile game-cabinet and mobile site layout CSS rules from pasted_content.txt, and verify them against the responsive build.
- [x] Implement mobile usability refinements (touch-target min-height/padding and tactile feedback) and a direct arcade quick-scroll anchor in top navigation.
- [x] Perform a comprehensive responsive visual and design-error audit across desktop (1280x720) and mobile (375x812) viewports, covering text truncation, contrast, hierarchy, and overflow.
- [x] Ensure the header logo/brand is never covered by text and all visible site and arcade titles sit cleanly in 1 or 2 lines without truncating important meaning.
- [x] Apply the requested yellow-block removal CSS rules over the Jersh In Case download section and achievement chain, and verify with tests and build.
- [x] Apply the scoped Jersh In Case yellow-block CSS fix without touching unrelated global styles.
- [x] Verify the section order (Hero -> Listen/Mixes -> Bio -> Other Mixes -> Projects -> Selectah Showdown Arcade -> Visuals -> Booking) and apply scoped text containment rules without breaking layout or arcade positioning.
- [x] Correct Selectah Showdown instruction, police, badge, HUD, life-icon, and mixer-damage presentation; capture a new verified screenshot.
- [x] Inventory existing project artwork, identify broken/orphaned asset paths, and map the strongest illustrated scenes to live Level 1, Level 2, and event layers.
- [x] Restore active Selectah Showdown and Crowd Pressure composition using only existing project artwork while preserving collision logic and performance.
- [x] Identify and repair the root causes of the Jersh yellow block and homepage floating text without hiding content or adding global overflow rules.
- [x] Validate the visual recovery at all required mobile widths and capture the required 390×844 review evidence; defer sound and music-player changes.

## Managed media migration for publishable checkpoint

- [x] Locate the user-uploaded recovery archive and verify its embedded-media inventory.
- [x] Map all active site and arcade media references to managed storage equivalents.
- [x] Remove the local embedded-media deployment blockers only after managed URLs are verified.
- [x] Run regression validation, save a publishable checkpoint, and verify the public site.

## Incomplete site-and-game copy regression

- [x] Compare the published project with the intended recovered site and Selectah Showdown source inventory.
- [x] Restore every confirmed missing site section, arcade stylesheet, component, asset route, and runtime behavior.
- [x] Run visual, gameplay, test, type, build, and live-public checks before republishing the complete version.
- [x] Verify every mix-archive cover image resolves from managed storage in the published site.
- [x] Verify every Selectah Showdown game asset resolves from managed storage in the published site.

## Complete recovery-archive project copy

- [x] Extract a clean standalone project copy from the complete recovery archive.
- [x] Verify that the copied project contains all website source, game source, mix covers, mix audio, and arcade assets.
- [x] Package the verified standalone project copy with clear import guidance.

## Gallery-art-driven Selectah Showdown reconstruction

- [x] Rebuild Level 1 active play as an animated, readable extension of the Selectah Showdown splash-frame artwork without changing collisions or performance.
- [x] Rebuild Level 2 active play as a dense Crowd Pressure stage-frame environment with preserved clear gameplay lanes.
- [x] Unify every splash, recovery, level-transition, win, and fail screen under the gallery artwork’s illustrated rave-comic system.
- [x] Increase the mobile player’s illustrated visual presence while preserving the current forgiving collision box.
- [x] Improve pickup and hazard readability using only existing illustrated project assets, without generic substitutes or repeated full-frame backgrounds.
- [x] Capture the eight required 390×844 gallery, active-play, transition, police, and Too High comparisons before publishing.

## Ordered visual recovery pass — existing artwork only

- [x] Enumerate all repository image, sprite, background, SVG, and audio assets; report broken, unused, and previously referenced assets before visual changes.
- [x] Restore active player, pickup, hazard, foreground, and background scale using only existing illustrated game-event artwork while preserving collision logic and performance.
- [x] Apply restrained comic-rave texture, foreground, glow, and impact layers to gameplay without duplicating event artwork across the playfield.
- [x] Reduce mobile HUD dominance while retaining SCORE, RECORDS, COMBO, LIVES, and MUSIC readability.
- [x] Preserve the existing cyan/magenta/orange arcade cabinet and repair only required internal spacing.
- [x] Identify and repair the root cause of any Jersh yellow block without hiding content or using a cosmetic workaround; re-audited the existing scoped pseudo-element repair without altering the release card during the arcade-only pass.
- [x] Identify and repair the root cause of homepage floating text without global overflow hiding or removed content; re-audited the existing scoped mobile-flow repair without altering the homepage during the arcade-only pass.
- [x] Keep the player controls integrated in the navigation/header without obscuring hero, gallery, or arcade content; re-audited the current header-integrated 5D Playa without changing it during the arcade-only pass.
- [x] Validate 320, 360, 375, 390, 412, and 430 mobile widths for containment, asset visibility, event-screen fit, and absent placeholders.
- [x] Produce the required asset, root-cause, performance-preservation, and 390×844 screenshot evidence before publishing.

## Arcade-only playfield architecture recovery

- [x] Remove obsolete translucent playfield panels and sparse legacy backgrounds instead of layering new artwork over them.
- [x] Establish explicit background, midground, foreground, gameplay-entity, FX, HUD, and event-overlay stacking rules for both levels.
- [x] Build distinct Level 1 comic-rave and Level 2 crowd-stage environments from existing assets without repeated full-frame artwork.
- [x] Ensure the player, pickups, hazards, bonuses, and touch controls render above environmental layers without rectangular backing cards.
- [x] Restore clear mobile touch/drag playfield movement and visible secondary control affordances while retaining desktop keyboard controls.
- [x] Reorganize the HUD at 320–430px so every required value is visible without clipping, microscopic text, or horizontal scrolling.
- [x] Verify event overlays remain temporary above intact level environments and restore the correct level when closed.
- [x] Capture the required 390×844 idle, active-object, event, maximum-HUD, control-use, and gallery-side-by-side evidence at mobile and desktop viewports.

## Immediate arcade correction — controls and clean environment only

- [x] Remove the new in-playfield left/right buttons and restore the original direct touch/pointer drag response without changing movement sensitivity or collision logic.
- [x] Audit active Level 1 and Level 2 backgrounds for gallery screenshots or reference-frame assets, then replace them only with clean existing environment artwork if available.
- [x] Remove the giant face, vinyl, and pasted collage fragments from active gameplay unless an existing clean environmental asset supports a restrained edge role.
- [x] Convert persistent mixer/recovery status cards into compact in-game feedback that does not block the action area.
- [x] Capture and verify the required 390×844 Level 1 running state with direct drag, no arrow buttons, several objects, visible player, contained HUD, no screenshot background, and no obstructive recovery card.
- [x] Report whether suitable clean Level 1 and Level 2 environment source assets exist; stop further art replacement if they do not.

## Final visual architecture pass — clean assets and reactive stage

- [x] Audit clean existing environmental, reactive, object, and event assets against the supplied stage references; do not use reference screenshots as backgrounds.
- [x] Reduce normal gameplay player art to approximately 40–55% of its current visual scale while preserving the forgiving independent collision box.
- [x] Restore continuous pointer capture and direct finger/mouse X-position movement, retaining keyboard fallback and no directional buttons.
- [x] Implement explicit background, midground, reactive, object, player, FX, HUD, cabinet-glass, and temporary event stacking without flat screenshot composition.
- [x] Build clean-asset-backed Level 1 depth and Level 2 crowd-stage depth using the confirmed clean `5d-selector-rave-stage` source.
- [x] Add lightweight nonblocking environment reactions for pickups, combo/milestone state, misses, and hazards using transforms, opacity, and existing clean assets only.
- [x] Implement the supplied exact stage reaction map: DUBPLATE_CATCH, COMBO_5/10/15/20/25, MISS, and HAZARD_HIT with their named environment responses.
- [x] Retain existing splash/event screens and align shared presentation hooks without inventing new event artwork.
- [x] Keep feedback fast, minimal, nonpersistent, and visually separate from the player and active-object lane.
- [x] Validate the complete 390×844 acceptance checklist, motion/input continuity, HUD containment, temporary event restoration, tests, typecheck, build, and performance safeguards.
- [x] Deliver changed-file list, stage architecture, restored drag-control explanation, scale change, reactive-event map, required production-asset list, 390px evidence, and performance confirmation.

## Functional gameplay and stage rebuild — input before art

- [x] Audit and instrument the real player state, pointer conversion, falling-object world data, and collision-state flow before visual-stage changes. Completed by the later mechanics-lock audit and diagnostics.
- [x] Repair direct captured pointer drag so client X maps to the actual player game-world X and collision coordinates with bounded touch/mouse support and keyboard fallback. Completed by the dedicated permanent input-surface architecture.
- [x] Define player and object world bounds from the same X/Y/width/height data, add a development hitbox mode, and prevent an object from resolving collision more than once. Completed by the shared world model and one-time collision acceptance contracts.
- [x] Add automated pointer-coordinate conversion and pickup/hazard collision transition tests that cover score, combo, recovery, removal, and reaction effects. Completed by the input-surface, exact-dubplate, and public UI acceptance verifiers.
- [x] Normalize regular pickup, large-bonus, and hazard visual scales against the unchanged selector height without modifying collision dimensions. Completed by the per-entity visual scale system and five-viewport verifier.
- [x] Build a decomposed Level 1 neon backstreet architecture from clean assets/placeholders only; do not use static screenshots, wallpaper composition, or unrelated site changes. Completed in the subsequent stage-architecture pass.
- [x] Implement environment state responses for catch, miss, hazard, 5/10/15/20/25 combo milestones, and level completion without persistent gameplay banners. Completed through the retained StageReaction controller and scoped visual reactions.
- [x] Verify continuous left/centre/right pointer drag, keyboard movement, pickup/hazard hitboxes, animations, combo increment/reset, reactions, 390×844 mobile, desktop, and performance safeguards before publishing. Completed by the published input, collision, stage, and responsive verification matrix.

## Level 1 Final Gameplay + Reactive World Pass

- [x] Audit and ensure all 11 spawnable Level 1 object types render with correct sprite/art assets (no placeholder squares, colored rectangles, or debug boxes in production).
- [x] Verify every configured Level 1 spawn type spawns, falls, collides, triggers events, and despawns correctly during normal play.
- [x] Refine player catch zone and object hitboxes to match visible sprite graphics (torso/upper-body catch zone, precise hazard contact).
- [x] Maintain one authoritative game-space coordinate system separated from visual environment scaling/crops.
- [x] Implement non-destructive Level 1 time progression across 1x (sunset), 5x (dusk), 10x (blue hour), 15x (night), 20x (rave pressure), and 25x (5D takeover) using localized layered effects without global dark filters or hue rotation.
- [x] Add a development-only query parameter (`?worldProgression=1|5|10|15|20|25`) to test each world progression state.
- [x] Reduce the visual footprint of persistent status cards (mixer damaged / recovery) so they do not obstruct the active catch lane.
- [x] Validate mobile readability and object clarity at 390x844.

## Level 1 Living World Population Extension

- [x] Add record-progress-driven environmental population stages from a quiet arrival through a fully active 5D takeover, using lightweight non-gameplay overlays only.
- [x] Keep the population system independent from time-of-night and combo-driven rave pressure, with edge/doorway/background clustering that never blocks the play lane.
- [x] Use only deliberate illustrated/pixel-painted environmental treatment; do not introduce emoji, generic SVG people, stock icons, or gameplay sprites as crowd replacements.
- [x] Add development-only population/progression verification and validate the combined Level 1 states at 390x844 without changing Level 2, bonus, Pit Run, controls, collisions, scoring, or the locked alley source.
- [x] Save and deliver a checkpoint for the combined Level 1 visual pass after tests and build validation.

### Combined Level 1 pass notes

The appended brief extends the preceding Level 1 surgical pass. Record progress drives time-of-night and world population; combo/streak remains temporary rave pressure. The approved alley remains the unchanged base image, and all added figures or environmental activity must remain lightweight, peripheral, and non-interactive.

## Level 1 Finalization Pass — New Visual References

- [x] Reconcile the new Level 1 finalization brief with the already-locked alley and current implementation; explicitly preserve Level 2, bonus, Pit Run, main website, gallery, music player, and cabinet design.
- [x] Ensure Level 1 time-of-night, world population, and combo rave pressure remain three separate systems with forward-only record progression.
- [x] Refine Level 1 environmental population and reactive overlays toward the supplied underground club visual references without replacing/cropping/redrawing the approved alley or introducing gameplay sprites as crowd art.
- [x] Validate Level 1 object asset integrity, collision alignment, no unexplained rectangles, responsive 390px readability, and no regression to controls/scoring/progression.
- [x] Save and deliver the Level 1 finalization checkpoint for user review; do not proceed to later levels without explicit approval.

## Corrected Level 1 Visual Source Reconciliation

- [x] Replace any incorrect Level 1 visual-source reference with the corrected locked 16:9 sunset alley `1000001097.png` managed asset, without cropping or altering the artwork.
- [x] Keep `1000001036.png` as implementation-board guidance only; do not import the board, interior club frame, or Pit Run strip into the Level 1 runtime.
- [x] Revalidate the Level 1 three-system separation, asset integrity, clear gameplay lane, and unchanged later-level/site boundaries against the corrected references.
- [x] Save and deliver a corrected Level 1 review checkpoint only after all checks pass.

## Level 1 Corrective Visual-System Pass

- [x] Freeze the working Level 1 movement, catch/collision, spawn, trajectory, score, combo, recovery, damage, and progression mechanics.
- [x] Add development-only forced visual states for records 0, 5, 10, 15, 20, and 25 at combo 1X with a stable camera/player position.
- [x] Make the six forced states visibly chronological through separate localized sky, building, window, neon-sign, doorway, pavement-reflection, police-reflection, steam/haze, and population layers without replacing or globally filtering the approved alley.
- [x] Make Level 1 population and event reactions visibly demonstrable but peripheral, non-interactive, unsynchronized, and clear of the catch lane.
- [x] Audit every Level 1 falling object for a cohesive pixel-painted/illustrated physical treatment, controlled glow, plausible scale, recovery-device readability, and no unexplained `NO ITEMS` or debug rectangles in normal play.
- [x] Add regression coverage and capture proof for all six forced states plus normal catch, hazard, recovery, mobile readability, and unchanged later-level/site boundaries.
- [x] Save and deliver the corrective Level 1 review checkpoint; keep all later-level and site changes blocked pending user approval.

- [x] Update the stale selector release-gate fragment for the smaller shared Level 1 record to match the current normalized `visualSize` rule, then rerun the gate and approved-art verifier.

## Level 1 Environment Progression Correction

- [x] Fix the premature `THE RAVE LEFT YOU OUTSIDE` terminal overlay at its state/rendering cause; do not hide it with CSS and do not alter terminal-game rules.
- [x] Freeze movement, input, collision, spawn, trajectory, score, combo, recovery, damage, progression, cabinet, Level 2, website sections, and HUD structure.
- [x] Make the same locked 1000001097-derived alley visibly progress at 0/5/10/15/20/25 records through independent sky tint, horizon warmth, window lights, Club 5D spill, Underground spill, doorway light, pavement reflection, police reflection, haze, and restrained NPC population.
- [x] Keep speakers at the edges/background with reduced visual dominance; remove the large green falling-record halo; move recovery status into the compact HUD; preserve existing artwork and mark any unavailable recovery art as `ART ASSET REQUIRED` rather than inventing a replacement.
- [x] Add one restrained record-catch player/contact reaction and localized pavement pulse without changing event timing or gameplay outcomes.
- [x] Validate six rendered states, normal gameplay, mobile readability, no unexplained debug/terminal overlays during play, and unchanged later-level/site boundaries.
- [x] Save and deliver the revised Level 1 review checkpoint; later-level and broader site work remain blocked pending approval.

- [x] Add restrained Level 1 background NPC population using only the existing approved non-player dancer artwork, with record-driven counts at 15/20/25 and no player/control/collision interaction; keep all other systems frozen.
- [x] Validate the NPC layer at the six forced record states and mobile/desktop playfield anchors without reintroducing foreground clutter or terminal overlays.

- [x] Save and deliver the current Level 1 environment-population correction checkpoint; keep later-level and broader site work blocked pending approval.

- [ ] Add a development-only HUD-hidden comparison mode for the six Level 1 record probes so visual ordering can be judged by sky, lighting, people, windows, neon, and atmosphere rather than counters.
- [ ] Capture and preserve visual evidence for 0/5/10/15/20/25 records, 0-vs-25, and a record-catch reaction before the revised checkpoint.

- [ ] Calibrate the Level 1 progression primitives so the six states read as localized sky/window/neon/doorway/pavement/police/haze changes rather than broad grid or ring overlays.
- [ ] Hide the development world-probe label whenever the HUD-hidden comparison mode is active, while preserving it in ordinary diagnostics.

- [ ] Correct development-only cabinet-focus selectors to target the actual `arcade-flow-shell` game wrapper in the published preview, then recapture visual evidence from the cabinet rather than the page shell.

- [ ] Override the legacy focus rule for the nested `.minigame-section` inside `.arcade-cabinet-bezel` so the published proof cabinet has real dimensions instead of a zero-height hidden game viewport.

- [ ] Add a development-only `visualFreeze=1` mode for forced Level 1 visual proof so screenshots remain at a stable player/camera frame without mutating normal gameplay.

- [ ] Disable the legacy Level 1 reactive overlay layers that still produce the broad magenta bar and speaker ring; retain only the newer localized record-driven layers and passive event responses.

- [ ] Make the existing `DUBPLATE_CATCH` visual verifier populate the authoritative catch event fields for its proof frame, without changing normal runtime reactions.

# Level 1 Visual Acceptance Review Remediation (Per Attached Rejection)
- [ ] 1. Remove rectangular lighting overlays; replace with organic surface-mapped illumination (Club 5D/Underground signs, windows, doorways, police car).
- [ ] 2. Transform the sky from sunset (0) through blue hour (10) to deep active rave night (25) without transparent blue rectangle bands.
- [ ] 3. Audit all lighting layers to ensure zero debug-like geometric edges or UI borders.
- [ ] 4. Remove world-space RECOVERY text labels entirely; keep recovery data strictly in the HUD.
- [ ] 5. Redesign the recovery object from a generic UI icon into a scratched, perspective-correct 90s DJ hardware flight case with physical depth and edge wear.
- [ ] 6. Integrate the player into the alley floor with a contact shadow, pavement reflection tint, and ambient rim light without a glow bubble.
- [ ] 7. Audit and rework every Level 1 falling object asset so it matches the background alley's pixel density and painterly texture.
- [ ] 8. Streamline heart-loss reaction into a fast 100–350ms recoil flash and HUD heart reduction, removing the large overlapping information panel.
- [ ] 9. Fix WRONG TUNE P0 responsive overflow across 320, 360, 375, 390, 412, and 430px mobile viewports.
- [ ] 10. Enforce strict mutual exclusivity and compatibility across all modal states and transient effects.
- [ ] 11. Refine background NPC crowd progression so 3–5 (at 15), 6–8 (at 20), and 8–12 (at 25) dancers occupy alley doorways, queue edges, and wall ledges away from the central catch corridor.
- [ ] 12. Enforce the master alley artwork as the sole art style reference for all world entities.
- [ ] 13. Suppress any additional or oversized speaker towers; rely on time, light, and people for progression.
- [ ] 14. Generate and present the required A (six frozen screenshots 0–25), B (contact sheet), C (three close-ups), D (transient state proof), and E (mobile WRONG TUNE viewports).
- [ ] 15. Verify all 17 acceptance checkboxes.
- [ ] 16. Run regression, TypeScript, and build gates.
- [ ] 17. Keep Level 2 and Level 3 locked pending visual acceptance.

## Current website sequence — Task 1 revalidation

- [x] Consolidate Task 1 typography into one authoritative global stylesheet, remove the duplicate import, and revalidate desktop/mobile font hierarchy before requesting user confirmation.

## Canonical Level 1 Four-Master Background Implementation Pass

- [ ] Audit current Level 1 background asset mapping, viewport scaling, and record-driven progression triggers.
- [ ] Upload and stage the four supplied canonical Level 1 master backgrounds (Golden Hour / Dormant, Late Sunset / Waking, Dusk / Opening Imminent, Full Night / Club 5D Alive) as managed assets.
- [ ] Implement the four-state fixed coordinate progression system, mapping records 0, 5, 10, 15, 20, and 25 directly to the canonical masters with smooth crossfades and zero architectural jump.
- [ ] Add lightweight, asymmetric, non-synchronous edge overlays for pipe steam, neon flicker, window light variations, and State 4 bouncer/queue integration without obscuring the central gameplay lane.
- [ ] Validate gameplay mechanics, collision, score, records, and responsive behavior across desktop and mobile viewports, then publish the review checkpoint and report results.

## QA Verification Screenshot Pass — Level 1 Canonical States
- [ ] Establish fixed mobile capture session (390x844 viewport, exact game selector targeting)
- [ ] Capture 0 records (Golden Hour)
- [ ] Capture 5 records (Golden-to-Waking crossfade)
- [ ] Capture 10 records (Waking Late Sunset)
- [ ] Capture 15 records (Waking-to-Dusk crossfade)
- [ ] Capture 20 records (Dusk Opening Imminent)
- [ ] Capture 25 records (Full Night Club 5D Alive)

## GitHub Non-Audio Repository Sync (Retchoid/fifth-dimension)
- [ ] Audit repository state and configure `.gitignore` / git attributes to exclude all `.mp3`, `.wav`, `.ogg`, `.flac`, and sound assets
- [ ] Stage all website code, game logic, styles, documentation, and visual assets (images/sprites)
- [ ] Verify that zero audio files are staged or tracked in git
- [ ] Push updates to `Retchoid/fifth-dimension` and provide the repository link
- [x] Deploy and visually verify exact commit 3658f9e04c4c55a130da9d7944fc6b6d41c112a9 without code changes.
