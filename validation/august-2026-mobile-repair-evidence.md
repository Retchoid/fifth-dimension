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

After the remaining artwork field was suppressed, a second focused browser check confirmed that the embedded SoundCloud player still exposes its account, track title, play action, share action, playlist items, and external SoundCloud action. The player therefore remains functional without the yellow artwork treatment.

## Miami cabinet stage verification

The development-only held arcade view was focused directly on the Selectah Showdown cabinet after the cabinet-stage styling pass. The cabinet remains mounted with the existing marquee, viewport, service plate, physical controls, share controls, release copy, and public board. The presentation layer adds only the Miami vaporwave stage field, cyan/magenta neon bezel treatment, and gritty cabinet materials; no game control, player sprite, score, release-gate, or item-render markup was changed.

The targeted arcade pass preserves the existing speaker and player markup. The only active style changes are an enlarged transparent speaker-art transform, transparent player-wrapper rules, and a screen blend on the existing DJ art to dissolve its opaque black backing into the dark stage. The automated selector audit locks those presentation-only contracts.

## Fresh-session release-gate verification

In the local browser preview, the former durable v5 value and the current-session proof were explicitly cleared before a full reload. The resulting release card displayed the locked instruction, **“Collect 25 records in Selectah Showdown to unlock the free download,”** and exposed no listen or download action. This confirms that a fresh session starts locked; only the verified in-session Level 1 chain-break proof can open the release.

## Published disputed-requirements finding

The published release was found in its locked state before gameplay, but its cyan lower-edge paint artwork remains visible. The global paint-removal selector did not target the `download-box-edge-paint` wrapper that mounts the artwork, so the paint-removal request remains incomplete and requires a source correction before it can be considered done.

The corrected development build now targets the previously missed wrapper directly. The release retains its locked message before game completion; the correction removes only the ornamental paint layer and does not alter the card's content, release-gate state, listen/download controls, or arcade handoff.

The focused post-fix development capture shows the exclusive card with its lower edge clear of the previous cyan paint silhouette while the locked notice remains present. The same review confirms the arcade mount, cabinet bezel, and stage shell are still present below the release card.

## Reported visual-omission correction pass

The revised development header now exposes a dedicated **5D Playa** control in the top-right action cluster. The control opens the existing archive queue and toggles its detached radio-console state without removing the archive-local player, native audio controls, downloads, or share cards. The player’s detached panel is now positioned beneath the site header rather than at the lower-right of the viewport.

The development interaction check found the new header control in the persistent navigation action cluster and activated it successfully. The archive queue, its play control, detachment control, all nine download controls, and all nine share controls remained available in the DOM after the action.

The focused release-card inspection found the card mounted without the previously visible lower-edge paint artwork; its locked release copy remained present. The arcade stage was then focused for the final foreground speaker and active-play-area inspection.

The development-only speaker milestone hook was invoked solely to make the staged speaker state available for visual regression review; it does not exist in the production bundle's user flow.

The staged speaker review was followed by a computed-style capture of both speaker tower elements to confirm the foreground size and placement rules are applied in the live development DOM.

That computed-style capture exposed an inherited speaker-deployment animation returning the rendered transform to unit scale despite the requested size rule. The animation contract was then explicitly corrected so the intended large-scale transform can be asserted rather than merely declared in CSS.

The browser confirmed that the corrected deployment keyframes were active and completed. Because the parent transform was still reported at unit scale after completion, the transparent speaker art itself now carries the foreground scale; this makes the visible speaker size independent of the parent animation's computed-transform reporting.

The final development DOM check confirms the top-right launcher exists, the duplicate archive-local detach control is hidden, the standalone Big Up visual class is present in the loaded stylesheet, and both staged speaker images resolve to a `matrix(2.25, 0, 0, 2.25, 0, 0)` transform. The phone-width header capture retains the protected first-page identity and exposes the 5D Playa control as the cyan radio button in the right action cluster.

The next focused visual pass targets the reported residual DJ sprite backing square, the stage backgrounds, and every standard arcade splash layer; this pass is scoped as presentation-only so collision, controls, progression, score, audio, and release contracts remain untouched.

The focused DJ inspection confirmed that the catcher, art wrapper, and sprite all compute to transparent backgrounds with no box shadow; the remaining rectangular appearance is therefore treated as an embedded asset/matting problem rather than a container-panel rule. A direct image-edit attempt was unavailable because the daily visual-generation quota had already been reached, so the correction will preserve the supplied sprite and use an asset-safe render treatment instead.

The active arcade stage has been focused in the development browser for visual confirmation of the existing DJ compositing and the lane boundaries before the stage and splash visual treatment is replaced.

The redesigned development stage was then opened with the deterministic sequence verifier. The automated checks passed, and the next browser step explicitly triggers a standard splash so the new frame can be visually reviewed rather than inferred from source alone.

The deterministic inspection triggered a standard negative-event sequence and retained the expected active-stage mount, established event copy, return path, and record-spin relay infrastructure while presenting the redesigned cyan/magenta/graphite hard-outline frame. The review remains visual-only: no progression, collision, input, timing, or audio behavior was altered.

The published domain loaded the checkpointed build successfully with the arcade controls present. A focused production-stage selector read is being completed separately to confirm that the new stage and sprite compositing rules reached the public deployment.

The first public computed-style inspection still reflected the previous cached arcade stylesheet. A cache-busting production reload was therefore opened before completing the final selector confirmation; no conclusion is drawn from the pre-refresh style read.

The cache-busted production page then loaded the published Selectah Showdown cabinet with its controls, locked release gate, and the intended dark center-stage composition intact. The public visual review confirmed the cabinet remains usable and the revised stage treatment does not introduce a gameplay-surface obstruction. The browser’s standard `maskImage` field reports `none`; the source includes the corresponding WebKit-safe mask declaration and screen compositing fallback for the supplied sprite asset.
