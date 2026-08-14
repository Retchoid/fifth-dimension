# After Party Gear Dash repair audit

## Reported defects

The live report identified three blocking defects: an opaque white rectangle around the rear-view DJ, indistinct pale entities that did not read as gear or hazards, and dense entity timing that made the dash unfair.

## Targeted repair

The runner now references a separately uploaded alpha-backed DJ asset and applies a transparent image surface with a dark-ink multiply blend, removing the white-square treatment without changing the DJ or purple-camo reward design. Gear and hazards now carry high-contrast fixed-palette shapes, dark contours, material highlights, and tiny proximity labels. The run progresses at 2.75% per second rather than 4.2%; spawn interval is 1.08 seconds rather than 0.72; active entities cap at three; same-lane entities need 62 depth units of separation; and a safe lane is preferred whenever an entity is approaching the runner.

The held verifier confirms the bonus uses `/manus-storage/selector-dj-rear-runner_00e1ae94.png`, a transparent image surface, and multiply blending. The next check is a normal, non-held run for active entity cadence and collision spacing.

## Final splash review

The held verifier mounted the three requested scenes with their expected shared hard-pixel frame and copy. **Pill** exposes `PILL PRESSURE / 3 HITS / PITCH WOBBLE`, `TOO HIGH TO PLAY!`, the melting-riddim line, and the dedicated pitch-wobble treatment. **Crowd** exposes `THROWN TUNE / 2 HITS`, `WRONG TUNE MY SELECTAH`, the empty-dancefloor line, and repeated EXIT dressing. **Police** exposes `BADGE PATROL / 2 HITS`, `COPS SEIZED YOUR MIXER`, the DJ reaction, and the recovery-combo prompt. The cabinet-scale police review confirmed the cruiser/DJ/copy hierarchy remains legible. All three use the existing queued record-spin handoff on release; hold mode intentionally freezes the active scene before that handoff.

## Final verification

A normal active bonus run showed three concurrent, visibly labelled gear entities in separate lanes at distinct depths: CDJ at 29%, headphones at 52%, and mic at 64%. This confirms the three-entity cap, same-lane spacing, safe-lane preference, reduced speed, and readable prop label treatment are live. The runner used the new uploaded asset with `mix-blend-mode: multiply`, removing the reported white square. Desktop and mobile full-page checks confirmed the final palette discipline is applied consistently across post-hero sections while leaving the hero, content, media, and working interactions intact. The final validation suite passed: 18 tests, release-gate checks, 134 selector hooks, TypeScript, and production build.

## Non-held final flow check

Pill, crowd, and police were each started from a fresh active Level 2 verifier. Each mounted, entered its record-spin bridge at its documented release time, cleared all scene/bridge layers, and returned to a live game stage without a terminal-state overlay. The repaired After Party failure path displayed the rewind layer then returned to Level 2 with no reward. Its clear path displayed the crown state, applied purple camo, removed the runner, and returned to Level 2. The final score path now derives its crown payload from `bonusCompletedRef.current`, the durable bonus-clear proof, rather than a potentially stale UI state.
