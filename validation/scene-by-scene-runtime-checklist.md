# Selectah Showdown Scene-by-Scene Runtime Checklist

**Review date:** 2026-08-16  
**Project:** 5th Dimension / Selectah Showdown  
**Preview:** `https://fifthdim-ahhcmq4d.manus.space`  
**Evidence companion:** `august-2026-master-contract-runtime-evidence.md`

This checklist records the final visual and runtime reconciliation. Desktop captures use a 1280x720 viewport. Phone captures use a 375x812 viewport. Development-only verifier routes are used for deterministic visual inspection; normal-runtime rows are explicitly labeled where they were proven through a real Start Session interaction or pointer-driven play.

| State | Live route / evidence | Desktop | Phone | Copy / art review | Runtime behavior review |
|---|---|---:|---:|---|---|
| Police seizure | `arcade-scene-verify=police` plus prior normal police recovery run | PASS | PASS | Illustrated police car, cracked magenta frame, scanlines, approved title and quip | Normal police recovery placement was measured; return-to-play path remains source- and runtime-guarded |
| Crowd anger / Wrong Tune | `arcade-scene-verify=crowd` | PASS | PASS | Illustrated angry crowd, hard outline, readable title/quip | Crowd sequence mounts through the shared hazard path; crowd variant remains distinct from thrown tune |
| Pill overload | `arcade-scene-verify=pill` | PASS | PASS | Illustrated pill/DJ art, approved title and humorous quip, scanlines | Shared hazard pause and resume path remains intact |
| Thrown Tune | `arcade-scene-verify=thrown` | PASS | PASS | Illustrated thrown-object scene and separate title treatment | Uses crowd hazard machinery with the thrown variant and returns through the common resume path |
| Rewind | `arcade-scene-verify=rewind` | PASS | PASS | Record-spin / rewind composition and tracked arcade copy | Reward pause/resume path remains distinct from the non-blocking in-world rewards |
| Record-spin dissolve | `arcade-viewport-verify=dissolve` | PASS | PASS | Illustrated dissolve field, scanlines, hard frame, readable `SPIN DISSOLVE` label | Transition is held only by the verifier; production transition timing remains unchanged |
| Crate bonus | `arcade-scene-verify=crate` | PASS | PASS | Record-crate reward art and compact reward treatment | In-world reward path preserves the active game surface |
| Headphones bonus | `arcade-scene-verify=headphones` | PASS | PASS | Headphones reward art and compact label | In-world reward path preserves the active game surface |
| BOH! BOH! | Fresh Start Session + `triggerSequence('boh')` | PASS | PASS | Visible reward label uses the distinct BOH callout | Fresh live state showed `.in-world-reward`, viewport present, and zero full-screen overlays |
| Big Up! | Pointer-driven real play to 6/25 records | PASS | PASS | Animated big-up speaker/reward treatment and readable callout | Genuine pointer-driven run mounted `BIG UP!` with zero full-screen overlays at 6/25 |
| Gun Finger Massive | Active-state development-only combo reaction verifier | PASS | PASS | Existing Gun Finger animation and salute treatment | Verifier forces active state only for inspection; live check showed reward, combo class, cabinet shake, viewport, and zero full-screen overlays |
| Run the Riddim | Level 2 arrival cleared, then `triggerSequence('riddim')` | PASS | PASS | Reward label remains separate from the Level 2 crowd-pressure marquee | Level 2 HUD remained present and zero full-screen overlays were mounted after arrival cleared |
| Level 2 arrival | `arcade-scene-verify=level-two-arrival` | PASS | PASS | Dedicated crowd-pressure stage, arrival marquee, clear lanes | Arrival overlay remains a timed transition before Level 2 play |
| First bonus / No Request | `arcade-scene-verify=first-bonus` | PASS | PASS | Dawn/vaporwave fire-escape bonus art, compact route UI | Mobile capture retains clear play area and movement contract |
| After Party Gear Dash | `arcade-scene-verify=afterparty-bonus` | PASS | PASS | Dark 3D road, rear-view runner, gear HUD, pulsing door | Correct transparent rear-view runner; route entities and destination remain visible |
| Unlock / chain break | `arcade-scene-verify=unlock` | PASS | PASS | Large chain-wrapped download card, lock state, neon green release treatment | Fresh sessions remain locked; release gate is protected by the verified current-session chain-break proof |
| Loss / curbside comedown | `arcade-scene-verify=loss&arcade-loss-verify=hold` | PASS | PASS | Detailed night curbside scene, seated DJ, rave door, readable copy; held verifier now pauses mid-animation | Normal production fade remains 2.3s; held verifier is development-only and evidence-only |
| Game over | `arcade-scene-verify=game-over` | PASS | PASS | Readable end-state hierarchy with no shrunken sprite/copy; PLAY AGAIN / RESET first | Replay/reset remains first action; score entry and leaderboard panel remain in the existing end-state path |
| Finale | Level 2 completion source/runtime contract plus final matrix review | PASS | PASS | Green terminal finale and named selector text remain protected by the source and visual contracts | Durable username and crown behavior remain user-data dependent; no fabricated proof is used |
| Item field / Level 1 | `arcade-scene-verify=items-level-one` | PASS | PASS | Records, cop badges, pills, phones, CDJs, mixers, turntables, adapters use approved art | Clear lane and consistent hit classification are preserved |
| Item field / Level 2 | `arcade-scene-verify=items-level-two` | PASS | PASS | Records, bottles, apple cores, cop badges, pills, phones, lion heads, CDJs, mixers, turntables, adapters use approved art | Clear lane and consistent positive/negative hit classification are preserved |
| Speaker stage | `arcade-scene-verify=speakers` | PASS | PASS | Enlarged speaker stacks and dancer-stage treatment use the approved transparent art | Speaker scale is visual-only; deployment timing and dancer milestones remain unchanged |

## Final safeguards

The global typography contract remains Press Start 2P for display/UI and Courier New for body/terminal text. The arcade palette, hard borders, hard offset shadows, scanlines, and pixel-safe sprite treatment remain protected by the automated selector and Vitest contracts. The latest validation run passed **40 Vitest tests**, TypeScript, the release-gate audit, the **241-hook selector audit**, and the production build.

The durable leaderboard read path was checked without modification. Existing Level 2 rows are named and persistent, but no genuine named After Party bonus-clear row currently carries `hasBonusCrown = 1`; this proof remains intentionally user-data dependent and was not fabricated. The existing leaderboard and crown implementation remains protected by the server schema and tests.
