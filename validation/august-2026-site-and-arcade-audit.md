# 5th Dimension Site and Selectah Showdown Audit

## Scope and verification boundary

This audit reviews the current site and game against the supplied 16-bit urban-brawler reference set, the established 5th Dimension visual system, and the latest functional requests. It separates **completed zero-impact repairs** from **changes that alter game cadence, interaction, or information hierarchy**. No gameplay or interaction redesign in the approval section has been implemented.

## Completed zero-impact repairs

| Issue | Finding | Completed correction | Verification |
| --- | --- | --- | --- |
| Mixcloud yellow obstruction | The only lime block in the Mixcloud card was a status-square decoration inside `FEATURED MIX`. | Removed the nonessential square while retaining the label, embedded Mixcloud player, and profile link. | DOM check confirms no remaining Mixcloud status-square element. |
| Jersh artist-credit obstruction | A release-band decorative element could share the same stacking plane as the artist credit. | Placed the decoration behind content and promoted the metadata, title, and artist-credit layers. | Computed stacking order: band decoration `0`, artist credit `1`. |
| Download visible before first play | The development browser contained the valid v5 chain-break proof from a prior completed session. | No logic change was needed: only that verified proof may restore access. | Removing the proof produced the locked card with no listen/download controls. 20 unit tests and the release-gate audit passed. |

## Site visual-system findings

The hero remains the strongest, most distinct expression of the intended brand. The archive has strong content density, gritty type, poster framing, and a credible pirate-radio tone. The supplied references indicate that later sections should move further toward **hand-drawn urban arcade material**: layered street planes, dark cel-shaded contours, grounded sign/fence/brick/debris silhouettes, controlled neon accents, and clearer differentiation between functional UI and imported artwork.

The current post-hero interface is usable on desktop and phone widths, but cyan and magenta remain dominant on routine card borders and controls. A more disciplined material hierarchy would make the visual system more cohesive: graphite and dark parchment for everyday UI surfaces; signal orange for actions, release tags, and checkpoints; cyan and magenta confined to imported artwork, glitch moments, selected arcade effects, and the hero. The 5D seal should recur as a compact authentication stamp in each major region instead of more repeated neon frame treatments.

## Social, adaptive-card, and sharing verification

| Surface | Evidence | Result |
| --- | --- | --- |
| Official site card | Canonical production URL, 1200×630 Open Graph image, title, description, `website` type, and `summary_large_image` Twitter card are present. | Pass. |
| Nine archive cards | Each share button opened its corresponding dialog; visible titles, artists, supplied artwork, and the required official-site call to action were present. | Pass. |
| Archive native-share payloads | All nine local payloads included the exact mix title, artist, required CTA, and `#other-mixes` archive URL. No external share was sent. | Pass. |
| Arcade share | The `SHARE 5D ARCADE GAME` control produced “5th Dimension — Selectah Showdown,” arcade copy, and the `#minigame` URL. No external share was sent. | Pass. |
| Copy-link fallbacks | The implementation retains clipboard fallback paths when native sharing is unavailable. | Pass by source and representative browser exercise. |

## Arcade visual and gameplay findings

The existing DJ and dancer sprites should be retained. The non-sprite asset system needs a more focused, reference-driven pass: hard black ink contours, cel-shaded warm/cool planes, layered stage depth, and grounded object silhouettes should replace remaining flat neon-panel or generic-shaped treatments. The target is **urban 16-bit brawler depth**, not a generic neon game UI.

| Area | Current behavior | Requested direction | Approval needed because |
| --- | --- | --- | --- |
| Reward interruptions | BOH, Run the Riddim, three mixers, and three turntables can interrupt active play. Rewind and Wheel It Up also use interruption logic. | Keep Rewind as the single full-screen reward; render the others as short translucent/yellow in-world callouts similar to gun fingers and space triggers farther apart. | It changes pause cadence, feedback hierarchy, and player concentration. |
| Two-hit punishments | Police triggers after two hits, but the counter does not require consecutive hits. Pills trigger after three hits. Phones do not have the requested two-hit crowd trigger. | Require two **consecutive** cops, pills, or phones to trigger Cops Seized Your Mixer, Too High to Play, or Wrong Tune My Selectah. | It changes difficulty and punishment frequency. |
| Dancer thresholds | Speaker-stack dancers show from Level 1 record 10 and at the start of Level 2. | Show speaker dancers only at Level 1 record 20 and Level 2 record 50. | It changes visible reward timing. |
| Falling-object pacing | Level 1 spawns each 1.10 seconds; Level 2 spawns each 0.72 seconds; speed ramps with score. Random selection cannot guarantee three negative *hit outcomes* in a player run. | Start slower, increase speed, and ensure sufficient negative-event exposure. | A guarantee must be defined as three hazard appearances or three player-hit scenes; the latter would be unfair because it forces player failure. |
| Bonus rewards | The current clean Level 2 Gear Dash grants purple camo. | First bonus green camo; second bonus purple camo. | The first-bonus route must be defined because the current shipped code has only the clean Level 2 Gear Dash reward. |
| Second bonus art | The current After Party runner is a pseudo-3D road. | Rework non-sprite UI/prop/architecture toward a Sonic 2 special-stage plus urban-brawler material treatment, retaining the existing DJ sprite and current background boundary. | It is a substantial visual and event-frame redesign. |
| 5D Playa | Archive cards retain individual native audio controls and download/share actions. | Add a detachable Winamp-inspired “5D Playa” that opens from a top bar and advances through the mix archive. | It adds a second playback surface, queue behavior, and mobile interaction model that must not compete with individual controls. |

## Recommendation

Implement the completed content-safe repairs immediately. For the game and 5D Playa, proceed only after confirming a concise interaction contract: convert all non-Rewind rewards to non-blocking in-world callouts; use exact consecutive-hazard logic; move dancers to the requested record milestones; treat “three negative outcomes” as guaranteed **hazard exposures** rather than forced hits; define the first green-camo bonus; and adopt a compact docked 5D Playa that preserves every existing individual player, download, and share control.
