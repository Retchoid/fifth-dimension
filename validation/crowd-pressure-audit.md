# Crowd Pressure and Splash-Sequence Verification Log

## 2026-08-14 — Rebalance validation evidence

| Check | Result | Evidence |
|---|---|---|
| Automated tests | Passed | 17 Vitest tests across 5 files passed. |
| Release and selector audits | Passed | Release proof tests passed; selector requirements audit passed with 81 hooks and 9 archive titles. |
| Static type check and production build | Passed | `pnpm run check` and `pnpm run build` completed successfully. |
| Level 2 arrival and runtime handoff | Passed | At 2.6 seconds after the debug Level 2 start, the arrival overlay was gone, the compact hype meter was present, and the HUD showed `RECORDS: 0/50`; 0.85 seconds later one falling item was present. |
| Level 2 music speed | Passed | The active jungle audio playback rate read `1.09` after the Level 2 handoff. |
| Crown readback | Pending genuine submission | The public table contains only `BOH` and `RETCG`, both Level 1 entries with `hasBonusCrown = 0`; no named Level 2 bonus-clear submission is yet stored. |

## Remaining validation work

| Scene | Visual review | Result |
|---|---|---|
| Rewind Achieved | Held at the active arcade scale. The composition uses a centered spinning record, deep purple/blue tunnel, dancer flank, bold graffiti-style title, and high-contrast cyan/pink/yellow hierarchy with no text or sprite overlap. | Pass |
| Wheel It Up | Held view shows the centered turntable and radial beam composition with a bright outlined reward title. The neon-but-pixel-grid treatment remains consistent with the 16-bit cabinet / fighting-game direction and avoids HUD overlap. | Pass |
| Police Seizure | Full active overlay mounts with the police car, DJ reaction sprite, recovery prompt, and a strong readable hierarchy. The car and reaction occupy separate planes, maintaining cut-in clarity. | Pass |
| Crowd Exit | Full active overlay mounts with empty club, departing-crowd visual language, broken-tune copy, and clear exit accents. Its sparse club-room framing distinguishes the punishment scene without losing legibility. | Pass |
| Pill Overload | Full active overlay mounts with the dopey DJ treatment, pupils, grin, pitch-wobble words, and trippy burst/floater layer. The foreground portrait and copy remain readable in the approved palette. | Pass |
| Record Crate | Full active overlay mounts with the stacked crate and flying-record treatment, plus a large bonus copy block. The limited object count and hard silhouette preserve the intended 16-bit readability. | Pass |
| Headphones | Full active overlay mounts with the rave-headphones icon, layered reward copy, and high-contrast framing. The graphic is clear at cabinet scale. | Pass |
| BOH! BOH! BIG UP | Full active overlay mounts with selector-salute vinyl, a concise five-dubplate reward marker, and clean record-centered hierarchy. | Pass |
| RUN THE RIDDIM! | Full active overlay mounts with a speaker-stack focal object, Level 2 / 15-dubplate reward marker, and readable rave-floor finish. | Pass |

All nine scene roots mounted as visible `display: grid` overlays in the held verifier. This confirms the unified relay reaches every required scene and no scene is hidden behind the game layer.

## Supplied-reference visual grammar recovered

The first two recovered source images establish a **hard-pixel 16-bit** treatment rather than soft vaporwave illustration: stepped silhouettes, sparse but high-contrast palette ramps, dark charcoal contouring, and clear foreground-to-background planes. The city reference adds a dense near-black skyline, cyan-window accents, magenta cloud bands, and a warm orange/gold horizon. The character reference uses a compact, weighty silhouette with a restrained skin-tone ramp, deep charcoal clothing/shadow blocks, and small bright highlights.

The third reference confirms the additional Sonic-style requirements used by the bonus and reward direction: fixed palette ramps, dark contour shadows, bold cyan/magenta/orange/yellow contrast, clear collectible silhouettes, and strong perspective/plane separation rather than soft blur.

| Reference requirement | Exact splash-screen comparison | Outcome |
|---|---|---|
| Hard-pixel silhouettes and dark edge treatment | The DJ, dancers, police reaction, vinyl, crate, headphones, speaker stack, and world sprites use `image-rendering: pixelated` where raster art is used; CSS objects retain thick charcoal edges and discrete palette blocks. | Compliant |
| High-contrast fixed palette ramps | Each scene uses controlled cyan, magenta, warm yellow/orange, white, and deep-charcoal contrast rather than low-contrast gradients; all full scene roots remained readable in the held sweep. | Compliant |
| Foreground/background depth | The city/rave stage, record tunnel, police car + DJ reaction, empty club, pill foreground portrait, and speaker stack use separated planes and retain clear copy placement. | Compliant |
| Sonic-style reward clarity | BOH, Run the Riddim, Wheel It Up, Rewind, Crate, and Headphones each use a single dominant collectible/reward object with short, legible score copy. | Compliant |
| Character readability | The DJ reaction and pill portrait retain a compact dark-contoured silhouette and readable expressive features at cabinet scale, matching the character-reference priority. | Compliant |

**Conclusion:** the current nine active splash screens comply with the recovered visual-reference grammar. No reference-driven CSS or asset amendment was required in this pass.

## Exact per-scene reference comparison

| Active scene | Recovered reference applied | Concrete comparison evidence | Result |
|---|---|---|---|
| Rewind Achieved | `1000000582.png` Sonic special-stage depth, central collectible, and hard palette ramps | The held scene mounts a `rewind-time-tunnel` behind a centered `rewind-record-splash`, with dancers held on a separate foreground plane. | Pass |
| Wheel It Up | `1000000582.png` radial lane / special-stage geometry and single focal item | The held scene mounts a `wheel-turntable` surrounded by `wheel-ray` elements; its reward copy stays centered and independently readable. | Pass |
| Police Seizure | `1000000580.png` night-city contrast and `1000000581.png` compact character silhouette | The `sega-police-car` establishes the foreground vehicle plane while `police-dj-reaction` renders the pixelated DJ response behind separate recovery copy. | Pass |
| Crowd Exit | `1000000580.png` dark structural silhouettes, cyan/magenta accents, and receding city/interior planes | The `empty-club-room` uses independently rendered `empty-club-speaker` silhouettes, DJ, doors, and exit layer rather than a flat copy-only screen. | Pass |
| Pill Overload | `1000000581.png` readable figure silhouette and controlled dark/light palette blocks | The `dopey-dj-portrait` separates the sprite, pupils, grin, and `pill-pitch-wobble` text onto distinct readable layers. | Pass |
| Record Crate | `1000000582.png` clear collectible silhouette hierarchy | The crate uses three individually rendered `crate-record` forms around a solid, dark-contoured crate focal point. | Pass |
| Headphones | `1000000582.png` singular high-contrast pickup clarity | The `rave-headphones` icon remains the only large object and holds a clear contour against the cut-in field. | Pass |
| BOH! BOH! BIG UP | `1000000582.png` central reward-object grammar | The `selector-salute-record` occupies the reward focal position, while compact +250 copy remains visually subordinate. | Pass |
| RUN THE RIDDIM! | `1000000580.png` sound-system architecture and `1000000582.png` reward clarity | The `riddim-speaker-stack` provides the stage-scale sound-system silhouette with distinct +500 Level 2 copy. | Pass |

The direct held-scene sweep confirmed all nine scene roots were visible `display: grid` overlays. The expanded selector audit was then run successfully with **111 hooks**, including the scene-specific reference contracts above. No scene diverged enough from the recovered reference grammar to require a code amendment.

The remaining work is the final mobile gameplay/audio/crown-path verification and publication.

## Positive-pickup token cue audit

Every positive pickup follows a two-part cue: its item-specific record scratch, platter, or adapter effect plays first, then `playPickupToken()` schedules a discrete square/triangle/sine coin strike after 220 milliseconds. This delay begins after the record scratch tail and keeps the coin cue audible rather than masked. The routing is shared by records, Lion of Judah heads, CDJs, mixers, turntables, and adapters; it remains guarded by the existing mute-aware audio-context helper. The selector audit now protects the token function, its invocation, two harmonic voices, and its post-scratch timing.
