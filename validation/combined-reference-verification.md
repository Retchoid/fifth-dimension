# Selectah Showdown — Combined Reference Verification

## Implemented architecture

The active game now uses an **authoritative shared world model** for player and falling-object rectangles. Pointer movement maps `clientX` into the playable world and writes the player’s real game-world X position; the same state drives render and collision. One-time collision resolution prevents an object from awarding or damaging twice. The development-only `arcade-hitboxes=true` query exposes player and object hitboxes without affecting a production build.

Level 1 is a decomposed **Neon Backstreet** exterior: sunset skyline, distant buildings, rear alley archway, club front, record shop, fire escape, pipes, vehicles, props, street plane, reactive FX, foreground depth, and HUD/event layers. Its 1× through 25× environment progression shifts from warm sunset to controlled 5D rave activation without a full-screen filter.

Level 2 is a decomposed **Crowd Pressure** interior of the same club, not a separate venue. It contains a reverse entrance/alley view, rear wall, distant bar, pillars, speaker wall, crowd, MC/security, booth floor, foreground decks/mixer, lighting rig, smoke, banners, equipment LEDs, and combo-driven inside-club responses.

## Verified behavior

| Area | Evidence | Result |
|---|---|---|
| Pointer control | Live component pointer sequence updated selector X from 8% to 50% to 90%; component retains direct Pointer Events, capture, release, and keyboard fallback paths. | Passed |
| World-coordinate collision | Automated world-model tests cover client-X conversion, overlapping rectangles, and one-time object resolution. | Passed |
| Stage controller | Automated tests cover catch, hazard, damage, miss, level-complete, and all 5×/10×/15×/20×/25× combo reactions. | Passed |
| Level 1 mobile | 390×844 focused base and 25× captures show the smaller selector, usable lane, authoring layers, and environmental takeover. | Passed |
| Level 2 desktop/mobile | Focused desktop and 390×844 captures show the inside-club booth, crowd, entrance continuity, and readable lane. | Passed |
| Release gates | Full test suite, TypeScript validation, and production build completed successfully. | Passed |

## Live update-loop evidence

The development-only world-event exerciser feeds a real active item into the same request-animation-frame loop used during play; it does not replace collision or score logic. A live record catch removed the item, changed the HUD from **0 score / 0 records / 1×** to **200 score / 1 record / 2×**, and applied the `stage-event-catch` class. A live pill hit removed the item, reduced lives to three, reset the combo to 1×, and applied the pill damage stage event. A live missed record passed the `newY > 105` branch, removed the item, reset combo/energy, and applied `stage-event-miss`.

The keyboard fallback was also exercised through the live loop: a `KeyD` press changed the selector’s rendered world X from **50%** to **59.984%**. Finally, the 25th-record exerciser entered the actual unlock flow: its HUD reached **25/25**, the object was removed, the stage published `stage-event-level-complete`, and the existing unlock overlay appeared.

## Live 390px interaction matrix

With the active playfield constrained to **390 CSS pixels**, a touch-type Pointer Events sequence moved the live selector from **8%** to **50%** to **90%** for left, centre, and right positions. The same 390px run then exercised the real frame loop: the catch removed its item and reached **1/25** at **2×**; the pill hazard removed its item, reset combo to **1×**, and decremented lives to three; the missed record removed at the true miss threshold and published `stage-event-miss`; and the 25th-record case reached **25/25** with `stage-event-level-complete` and the unlock state visible.

## Actual 390×844 viewport matrix

The same complete matrix then ran in an **actual 390×844 development viewport**, as confirmed by the structured browser-console record. It passed with touch drag values of **8% / 50% / 90%**; zero remaining objects after catch, hazard, miss, and completion; **2×** after the catch; three hearts after the hazard; **1×** and `stage-event-miss` after the miss; and **25/25**, `stage-event-level-complete`, and the unlock overlay after level completion. The final 390×844 screenshot captured the resulting Level Cleared state.

## Deliberate production safeguards

The special stage, hitbox, and event-exerciser query modes run only in development. The normal website flow, cabinet shell, selector sprite, scoring, progression, release gate, and public leaderboard behavior were not redesigned by this pass. The existing illustrated hazard overlays remain intentional **post-hit pause scenes**: active play first resolves a localized player/impact/stage event; a large overlay is mounted only when the pre-existing repeated-hazard sequence pauses play.
