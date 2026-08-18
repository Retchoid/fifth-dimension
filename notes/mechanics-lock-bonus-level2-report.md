# 5th Dimension — Mechanics Lock, Bonus Reliability, Object Scale, and Level 2 Pass

**Status:** Completed scoped pass. The approved mobile pointer/input surface, world-X authority, hitbox ownership, collision pipeline, Level 1/2 transition logic, top-menu placement, `REQUIRED_RECORDS = 25`, and `LEVEL_TWO_REQUIRED_RECORDS = 50` were not redesigned or replaced.

## Scope outcome

This pass separated **visible art scale** from existing entity dimensions, established one diagnostic source of truth for intended bonus events, and replaced Level 2’s retired flat-vector club assembly with a five-layer club interior. The Level 2 reactive work is intentionally CSS-only: it consumes the pre-existing stage event and energy classes rather than adding a game-loop branch, combat system, or new input path.

| Area | Delivered result | Locked behavior preserved |
| --- | --- | --- |
| Object readability | Per-entity visual multipliers with an 8% horizontal safe inset and 10% HUD-safe entry band | Collision width/height, movement, one-time resolution |
| Bonus reliability | One registry for 13 intended events plus query-gated developer diagnostics | Existing game rules and event visuals |
| Level 2 | Five independently replaceable club image layers; rejected vector JSX removed | Level 2 start, direct pointer input, object lane, 50-item objective |
| Environment response | Catch speaker/light kick; hazard flicker/recoil; high-combo speaker drive and brighter FX | StageReaction controller and gameplay timing |

## Object-scale changes

Each falling object retains its original collision wrapper and instead passes its visual multiplier through `--item-visual-scale`. The post-scale spawn lane begins below the HUD (`y = 10`) and within an 8% left/right visual inset. The safety adjustment only determines initial entry placement; it does not alter entity dimensions or collision math.

| Entity | Prior visible multiplier | Current visible multiplier | Collision dimensions changed? |
| --- | ---: | ---: | --- |
| Dubplate / record | 1.00× | 1.90× | No |
| Cop badge | 1.00× | 1.90× | No |
| Pill | 1.00× | 1.96× | No |
| Phone | 1.00× | 1.90× | No |
| CDJ | 1.00× | 1.86× | No |
| Mixer | 1.00× | 1.90× | No |
| Turntable | 1.00× | 1.86× | No |
| Adapter | 1.00× | 2.12× | No |
| Lion pickup | 1.00× | 1.62× | No |
| Bottle / apple | 1.00× | 1.76× | No |

The final five-viewport mobile run passed at **360×800, 375×812, 390×844, 412×915, and 430×932**. Every sampled object had a visual width at least 1.55× its collision wrapper, rendered within the playfield, and began below the HUD.

## Bonus-event audit and reliability fix

The reliability issue was architectural: intended events were implemented across separate source branches, so normal play lacked one place to answer whether an event was eligible, blocked, triggered, or waiting on a sequence condition. That made non-appearance difficult to distinguish from a valid eligibility failure. The fix is `client/src/lib/bonusEvents.ts`, a centralized registry with eligibility, trigger, recurrence, priority, cooldown/guard, gameplay state, pause/resume behavior, combo effect, and assigned visual asset for every intended event.

| Event | Trigger contract | State / resume behavior |
| --- | --- | --- |
| Crowd Pressure | 15 clean Level 1 dubplates | Pauses; resumes the same Level 1 run |
| Wrong Tune | Second consecutive phone hazard | Record-spin return to active level |
| Police Seized Mixer | Second consecutive cop hazard | Record-spin return with recovery active |
| Too High to Play | Second consecutive pill hazard | Record-spin return to active level |
| Mixer Damaged | Active hazard worsens equipment condition | Non-blocking feedback, then recovery |
| Mixer Repaired | Third recovery dubplate | Normal game-loop return to play |
| Record Crate | Third mixer pickup with reward spacing clear | Immediate non-blocking reward |
| Headphones Ready | Third turntable pickup with reward spacing clear | Immediate non-blocking reward |
| BOH! BOH! Big Up | Fifth Level 1 dubplate | Immediate, once per run |
| Wheel It Up | 30-hit combo | Immediate, once per run |
| Rewind | 18-hit combo | Pauses; record-spin return |
| Run the Riddim | Fifteenth Level 2 item | Immediate, once per Level 2 run |
| Download Unlock | Twenty-fifth Level 1 dubplate while locked | Unlock reveal, then Level 2 transition |

The developer-only panel is available with `?arcade-bonus-debug=true`. It is absent in normal play and reports **eligible/blocked state, reason, trigger count, last trigger time, and current game state** for all 13 entries. The final diagnostics verifier confirmed normal invisibility, developer visibility, required event labels, and a centrally recorded police-sequence trigger.

> The audit does **not** claim that every individual event was previously impossible to trigger. The confirmed failure was missing centralized observability and repeatable eligibility evidence. The registry and panel now expose the specific reason whenever a configured event does not begin.

## Level 2 environment and reactivity

The rejected Level 2 flat-vector JSX branches were removed. The active scene uses five independently replaceable raster layers, ordered behind the player and falling-object plane. The central action corridor is a separate layer and measured **225.6 px wide inside a 358.4 px playfield** at 390×844 (about 63% of playable width).

| Z-order / layer | Temporary source | Role |
| --- | --- | --- |
| Back wall | `/manus-storage/level2-club-backwall_0fefe2b1.png` | Same-club rear interior and color ground |
| Architecture | `/manus-storage/level2-club-architecture_b59eb6c5.png` | Structural venue depth |
| Crowd bands | `/manus-storage/level2-club-crowd-bands_f8a90d30.png` | Midground bodies and room energy |
| Speaker edges | `/manus-storage/level2-club-speaker-edges_2cd0f111.png` | Side-weighted sound-system framing |
| Reactive FX | `/manus-storage/level2-club-reactive-fx_59e2c1c8.png` | Lighting, flyers, and event response |

The environment is deliberately edge-weighted so the selector, scaled objects, and player hitbox remain readable in the centre. The player and objects keep their existing pixel/cel-shaded treatment, while the new crowd/architecture imagery uses the same dark, hard-edged club world. Existing splash screens were preserved rather than redesigned in this pass.

| Existing stage signal | Visual-only Level 2 response |
| --- | --- |
| Catch | Speaker kick plus light flash |
| Hazard | Back-wall dip, crowd recoil, and short light flicker |
| Combo / Level complete | Crowd pulse |
| High combo energy (tiers 4–5) | Faster speaker drive and brighter reactive FX |

The Level 2 layer verifier confirmed five loaded layers, no active flat-vector Level 2 elements, a clear corridor, falling items retained in the gameplay plane, and the high-combo, catch, and hazard animation contracts. A separate Level 2 mobile check confirmed the displayed objective remains **`RECORDS: 0/50`** and captured-pointer movement travelled 277.2 px across a 352.4 px active input surface.

## Acceptance evidence

| Acceptance area | Result |
| --- | --- |
| Permanent active input surface, debug on/off, cabinet frame hidden | Passed at 390×844; one mounted surface and correct 10% / 50% / 90% world-X response |
| Exact Level 1 rendered dubplate collision | Passed: records `0→1`, score `0→200`, combo `1→2`, clean streak `0→1`, item removed, one catch, no same-object miss |
| Crowd Pressure | Passed public-play verifier: 15-clean streak, transition started, hand blocking observed |
| Object-scale safe lane | Passed at all five requested mobile viewports |
| Bonus diagnostics | Passed: normal hidden, developer panel visible, police trigger recorded |
| Level 2 target and movement | Passed at 390×844: `0/50`, dedicated captured input owner, 277.2 px horizontal travel |
| Layering and reactivity | Passed: five layers loaded; corridor, catch, hazard, and high-combo contracts all accepted |
| Static verification | `pnpm check` passed; **20 Vitest files / 70 tests passed**; `pnpm build` passed |

## Temporary-art inventory and known boundary

All five `/manus-storage/level2-club-*` images listed above are **TEMPORARY** placeholders for the later final visual-production pass. They are structurally separated precisely so any one of them can be replaced without touching game rules, the playfield, or the input/collision systems.

The final build continues to emit pre-existing unresolved `/embedded-assets/...` runtime-reference warnings and a JavaScript chunk-size advisory. Neither blocked the production build, and neither was introduced by this scoped pass.

One exploratory existing chapter-loop script also reported that the out-of-scope Level 3 runner did not change lanes in its own check. **No Level 3 code was changed, repaired, or redesigned** because the stop condition prohibited that work. This does not affect the completed Level 1/2 mechanics-lock scope, but it is recorded for transparency.

## Scope stop

The requested pass stops here. No Level 3 feature work, site-wide redesign, movement rewrite, collision rewrite, or Level 2 target change was started.
