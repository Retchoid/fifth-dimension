# Initial Regression and Reference Audit

## Confirmed zero-impact site findings

The Mixcloud card contained a small lime status-square element inside the `FEATURED MIX` chip. It was the only lime block in the card’s layered DOM and has been removed without altering the embedded player, profile link, audio archive, or card flow. The Jersh release-band decoration was capable of sharing the artist-credit plane; it is now a non-interactive background layer, while the metadata, title, and artist credit sit explicitly above it. This preserves the existing credit copy, including **FEATURING MC MESTUP**.

The release card appeared unlocked in the development browser because the browser held the valid v5 proof `5d-selector-showdown-download-unlocked-v5=chain-break-complete-v5`. After removing only that proof and reloading, the release was locked and neither listen nor download control rendered. The release-gate unit check also passed, confirming that stale values remain locked and only the verified chain-break proof restores access.

## Supplied visual benchmark

The new supplied reference set establishes an urban 16-bit brawler baseline for non-sprite arcade art: deep multi-plane city streets; hand-drawn, dark-contoured cel shading; concrete, shutters, brick, fences, wires, debris, vehicle and sign silhouettes; warm street-light versus controlled neon contrast; and props that remain legible at play speed. The existing DJ and dancer sprites are excluded from visual replacement.

## Arcade behavior audit findings requiring approval

| Area | Current implementation | Requested direction | Usability impact |
| --- | --- | --- | --- |
| Full-screen reward scenes | BOH at 5 records, Run the Riddim at 15 Level 2 records, three mixers, and three turntables currently interrupt active play. | Keep Rewind as a splash; render the other rewards as short transparent/yellow in-world callouts. | Changes pause cadence and player concentration. |
| Consecutive hazards | Police triggers after two badge hits but does not reset on another hazard; pills trigger after three hits; phones have no two-hit crowd trigger. | Two consecutive police, pill, and phone hits should trigger their assigned scenes. | Changes punishment frequency and recovery rhythm. |
| Dancers | Speaker dancers appear from Level 1 record 10 and immediately in Level 2; separate streak dancers appear at a Level 1 18-combo. | Speaker dancers only at Level 1 record 20 and Level 2 record 50. | Removes earlier stage decoration and changes reward signaling. |
| Item progression | The scheduler uses 1.10 seconds in Level 1 and 0.72 seconds in Level 2, with a score-based speed ramp. Random selection does not guarantee three negative-outcome pairs per level. | Slow start, increasing fall speed, and enough negative pressure to produce at least three negative outcomes per level. | Requires deterministic pacing or event-budget logic and affects difficulty. |
| Bonus rewards | The current bonus reward is bright-purple camo after a clean 20-record Level 2 Gear Dash. | First bonus green camo and second bonus purple camo. | Requires defining which existing reward becomes the first bonus and adjusting session reward state. |
| Bonus 2 art | The After Party Gear Dash is pseudo-3D runner code. | Rework the non-sprite environment and architecture toward the supplied Sonic 2 / 16-bit brawler reference direction. | Requires visual system and event-frame changes. |

## Sharing surfaces pending full retest

The official document includes a canonical production URL, 1200×630 image, title, description, and large-image social-card metadata. The archive uses a shared required call-to-action, and each of the nine mix entries exposes an audio player, direct download, and share-card control. The arcade share payload points to the Selectah anchor. These surfaces require a fresh end-to-end card and fallback audit before the next publication.
