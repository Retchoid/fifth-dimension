# Mobile Repair Evidence — August 2026

## Scope

This validation record covers the corrective removal of the failed post-hero override, restoration of the original cyan/magenta/graphite visual language, and the responsive text-flow safeguards added after the supplied phone screenshots showed clipped archive text.

## Implemented safeguards

| Area | Corrective rule | Intended protection |
| --- | --- | --- |
| Section headings | Single-column mobile heading grid, fluid `clamp()` type scale, `white-space: normal`, and `overflow-wrap: anywhere`. | Long archive headings break cleanly rather than run beyond the viewport. |
| Supporting copy | Maximum width, visible overflow, and natural wrapping on phone layouts. | Descriptions remain readable without horizontal clipping. |
| Archive and 5D Playa labels | `min-width: 0`, visible overflow, normal white space, and clipped-text ellipsis disabled for mobile labels. | Titles and queue labels can wrap inside their cards. |
| Post-hero colour system | Failed archive-poster override removed; focused corrective layer restores graphite, cyan, magenta, lime, and signal-orange accents already used in the hero. | The first-page identity remains the visual reference for every later zone. |

## Outstanding focused check

The supplied Mixcloud screenshot showed a lime striped bar within the embedded player’s visible area. Focused browser inspection established that the project-owned Mixcloud status marker has no icon, the embed shell has no active pseudo layers, and the widget is cross-origin. The bar therefore belongs to the external widget’s compact (`mini=1`) rendering rather than the site. The embed retains its feed, dark theme, and hidden-cover setting while switching to standard (`mini=0`) player rendering to remove the compact-mode artwork element.

The focused browser recheck confirmed the Mixcloud widget still exposes the expected **Logikal Grinder** content and follow control after the mode change. The project-owned header, shell, and open-Mixcloud link remained present. A 375 px full-page mobile capture was reviewed after the responsive layer was applied: the archive heading, supporting copy, group headings, and 5D Playa label all wrap inside their containers instead of cutting at the right edge.

## Arcade visual verifier

The development-only `window.__selectahDebug.showLevelOneSpeakers` verifier remains available after the corrective presentation work. It was invoked for a focused speaker-scale and player-silhouette inspection; it does not alter production gameplay behavior.

The verifier held the active Level 1 scene at **15/25** records with the game’s normal HUD, stage, release gate, and public-board content still present. The correction is presentation-only: speaker deployment thresholds, dancer milestones, scoring, and collision contracts were not altered.

## Embedded-player verification

Focused browser inspection after the SoundCloud change confirmed that the standard player continues to expose its account, track title, play control, share control, follow control, playlist items, and privacy link. The previous large visual-mode artwork field—the location of the reported lime striped overlay—no longer renders because the player now uses SoundCloud's standard `visual=false` mode with the player artwork setting retained.

The targeted arcade pass preserves the existing speaker and player markup. The only active style changes are an enlarged transparent speaker-art transform, transparent player-wrapper rules, and a screen blend on the existing DJ art to dissolve its opaque black backing into the dark stage. The automated selector audit locks those presentation-only contracts.
