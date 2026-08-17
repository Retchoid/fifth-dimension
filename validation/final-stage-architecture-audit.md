# Selectah Showdown — Final Stage Architecture Audit

## Clean source assets that can be used now

| Role | Existing asset | Decision |
|---|---|---|
| Level 1 background environment | `selectah-level-one-urban-stage-reference_43ddc07a.png` | Suitable. It is a clean urban/backstreet environment without gallery UI, baked-in characters, or game objects. |
| Level 2 background environment | `5d-selector-rave-stage_e4fdff4b.png` | Suitable. It contains a crowd, speaker stacks, lighting, lasers, booth, and club architecture without a baked-in player or gameplay UI. |
| Edge-only reactive prop | `selectah-speaker-stack-urban_9fd16c27.png` | Suitable only as a restrained edge prop, with CSS positioning and no effect on the central gameplay lane. |
| Gameplay object families | `selectah-*-urban` assets | Suitable for current records, gear, hazards, and bonus props; no new object illustrations are invented in this pass. |
| Stage performers | `5d-jungle-dancer-*` assets | Suitable for small, edge-only crowd/NPC reactions where already represented in game art. |

## Assets not suitable as live stage backgrounds

The gallery/reference frames and `selectah-splash-art-direction_4d1c250f.png` are art-direction material, not live background layers. `5d-selector-level-two-detailed-stage_89e2157b.png` also remains excluded because it contains a baked-in foreground DJ and decks.

## Required production assets

The following clean production assets are still needed for a fully detailed multi-plane stage system. The current pass will not fabricate replacements:

- `level1-backstreet-midground.webp` — buildings, shutters, fire escapes, bins, and signage without character/UI composition.
- `level1-reactive-elements.webp` — shop signs, light windows, police-light distance, graffiti glow, and small NPC silhouettes in separable layers.
- `level2-crowd-pressure-midground.webp` — additional reactive crowd, truss, laser, and banner layers separate from the background plate.
- `selector-sprite-transparent.png` — transparent replacement selector character.
- `dubplate-object-sprites.png` — consistent production object family.
- `environment-reactive-elements.png` — sparks, speaker pulse, signage, light flicker, flyer/confetti particles.
- `splash-too-high.webp`, `splash-wrong-tune.webp`, `splash-police-seized.webp`, and `splash-rave-left-outside.webp` — the next coherent comic-page event art set.
