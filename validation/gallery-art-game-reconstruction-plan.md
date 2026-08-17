# Gallery-Art-Driven Selectah Showdown Reconstruction

The supplied **Selectah Showdown / Splash Frame** and **Crowd Pressure / Stage Frame** are treated as canonical production art, not as decorative gallery-only images. The active game uses them as the same visual world while retaining its existing collision, spawn, HUD, and performance architecture.

| Gameplay layer | Level 1 mapping | Level 2 mapping | Purpose |
|---|---|---|---|
| Background | `selectah-splash-art-direction` | `5d-selector-level-two-detailed-stage` | Establish the primary illustrated world and colour language. |
| Foreground | Urban stage crop plus isolated police-siren illustration | Speaker stack plus dubplate illustration | Preserve depth and comic framing without duplicating the primary artwork. |
| Gameplay plane | Existing illustrated dubplate, mixer, turntable, CDJ, police, pill, phone, bottle, and apple assets | The same readable illustrated pickup and hazard family | Keep collisions unchanged while increasing visual-only silhouettes and glows. |
| Player | Existing 5D selector DJ sprite with a visual-only mobile scale increase | Existing 5D selector DJ sprite with a visual-only mobile scale increase | Make the selector legible at phone size without expanding the hitbox. |
| Event scenes | Existing police, pill, crowd, crate, headphones, rewind, and record art | Existing stage, speaker, after-party, and failure art | Keep the existing specific illustration while applying one hard flyer frame and print-texture system. |

The new `gallery-art-active-play.css` is imported last by `DjMiniGame.tsx`. It is fully scoped to `.arcade-cabinet-bezel`, changes no game state or collision geometry, avoids generated or generic art, and limits the active collision plane to a protected darkened lane over the richer illustration layers.
