# Mobile arcade clarity notes

Source image: `/home/ubuntu/screenshots/webdev-preview-root-1786683887917610094-6919.png`

| Ordered tile | Source path | Verified finding |
|---|---|---|
| 001 | `/home/ubuntu/mobile-game-tiles/tile_001_x000000_y000000.png` | Hero section reads cleanly at phone width; no arcade findings yet. |
| 002 | `/home/ubuntu/mobile-game-tiles/tile_002_x000000_y000531.png` | Audio portal section only; no arcade findings yet. |
| 003 | `/home/ubuntu/mobile-game-tiles/tile_003_x000000_y001062.png` | Transition from Mixcloud into selector profile; no arcade findings yet. |
| 004 | `/home/ubuntu/mobile-game-tiles/tile_004_x000000_y001592.png` | Selector profile artwork and start of mix archive; no arcade findings yet. |
| 005 | `/home/ubuntu/mobile-game-tiles/tile_005_x000000_y002123.png` | Archive cards only; no arcade findings yet. |
| 006 | `/home/ubuntu/mobile-game-tiles/tile_006_x000000_y002654.png` | House archive cards continue; no arcade findings yet. |
| 007 | `/home/ubuntu/mobile-game-tiles/tile_007_x000000_y003185.png` | End of house archive and label ribbons; no arcade findings yet. |
| 008 | `/home/ubuntu/mobile-game-tiles/tile_008_x000000_y003715.png` | Upcoming projects cards only; no arcade findings yet. |
| 009 | `/home/ubuntu/mobile-game-tiles/tile_009_x000000_y004246.png` | Performance Matrix section and top of the Jersh release card; no arcade findings yet. |
| 010 | `/home/ubuntu/mobile-game-tiles/tile_010_x000000_y004777.png` | The release card handoff into Selectah Showdown is readable on mobile, and the cabinet begins below the section heading without overlapping the release copy. |
| 011 | `/home/ubuntu/mobile-game-tiles/tile_011_x000000_y005308.png` | The phone-width cabinet is visible without horizontal clipping. The deterministic capture happened to show a full-screen Wrong Tune scene, whose copy and art remain inside the cabinet, but this tile does not prove active falling-object visibility. |
| 012 | `/home/ubuntu/mobile-game-tiles/tile_012_x000000_y005838.png` | Visual archive cards are contained and readable at phone width. |
| 013 | `/home/ubuntu/mobile-game-tiles/tile_013_x000000_y006369.png` | Booking form fields remain aligned and legible at phone width. |
| 014 | `/home/ubuntu/mobile-game-tiles/tile_014_x000000_y006900.png` | Footer and final navigation surface are contained without clipping. |

The complete ordered capture confirms that the mobile document flow is intact, but its deterministic moment shows a full-screen interruption rather than active falling-object play. A dedicated development-only active-Level-2 viewport proof remains required before this mobile gameplay verification can be closed.

## Dedicated active-Level-2 verifier capture

Source image: `/home/ubuntu/screenshots/webdev-preview-root-1786684146691656191-8183.png`. Tiles 001 through 004, in reading order, show the hero, audio portal, and selector-profile regions unchanged at phone width. Tiles 005 through 007 show the DnB and house archive cards with their audio and share controls contained. Tile 008 shows the upcoming-project cards contained at the same viewport. No arcade surface has appeared yet; the remaining ordered tiles will be reviewed for the active cabinet proof.

The original active capture advanced into a Run the Riddim cut-in before its full-page screenshot was taken, so it was unsuitable for proving exposed pickup lanes. The verifier was adjusted to render the real Level 2 cabinet with a fixed representative field of records, cop sirens, bottles, apple cores, Lion of Judah, and CDJ pickups/hazards while keeping normal production play unchanged. The resulting phone-width capture, `/home/ubuntu/screenshots/webdev-preview-root-1786684288446786620-8844.png`, is a static layout proof that the compact top HUD and edge Hype meter leave the centre and lower field open; a real-loop phone-width run remains pending.

The held mobile dissolve capture uses the same transition markup and styling as production while freezing it only for inspection: `/?arcade-viewport-verify=dissolve#minigame`. Its full-page capture displays the cyan, orange, and magenta radial screen-spin field, expanding iris rings, central vinyl, and caption as a complete screen transition rather than an isolated record. The normal handoff timer remains unchanged and had already been verified to clear and return to active play; the phone-specific rules alter only compact layout sizing, not relay timing or state release.

The final phone-width checks use two additional development-only routes. `/?arcade-viewport-verify=live#minigame` runs the normal Level 2 frame loop beneath the compact HUD and reduced Crowd Hype meter; the capture retained visible falling-object lanes with no blocking flyer or poster boxes. `/?arcade-viewport-verify=transition#minigame` mounts the unheld screen-spin transition, releases it through the standard 520-millisecond timer, then starts the Level 2 frame loop. Combined with the held visual capture, this verifies mobile mount, visual treatment, timer-based clear, and return to an active field. These routes are development-only and do not change production game flow.

Direct crop review confirmed the claims above. The refreshed live crop at `/home/ubuntu/phone-arcade-crops/live-arcade.png` shows the compact HUD compressed to the cabinet’s upper edge, the small Hype meter outside the falling-object lanes, and visible moving representative objects in the central field. The non-held transition crop at `/home/ubuntu/phone-arcade-crops/transition-arcade.png` shows that the overlay had cleared and the active Level 2 field had resumed; the central pickup flash remains, while no transition layer blocks play. The corresponding held capture remains the visual evidence for the full-screen screen-spin phase itself.
