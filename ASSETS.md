# Assets

## Art direction

Selector Showdown follows the 5th Dimension visual system through a dark plum rave-stage arena, cyan and hot-pink sound-system energy, lime-green records, magenta hazards, scanlines, chunky pixel silhouettes, and dancehall/junglist sticker language. The new character direction is deliberately 2-bit Sega Genesis-inspired: readable pixel clusters, limited palette, hard silhouettes, and authentic jungle-DJ posture.

## Generated assets

| Asset | Role | Lifecycle URL | Prompt summary |
|---|---|---|---|
| Selector Showdown reference | Earlier visual target for the embedded game | `/manus-storage/selector-showdown-reference_e332e8a4.png` | 16:9 game screenshot with a neon DJ selector at the bottom, falling records, cop badges, vaporwave city, grid, HUD, and start overlay. |
| 2-bit jungle DJ sprite | Player artwork | `/manus-storage/5d-selector-jungle-dj-sprite_502781f7.png` | Transparent full-body 16-bit/2-bit Sega Genesis-inspired jungle DJ in a bomber jacket, headphones, cap, sneakers, and compact turntable, using plum, magenta, cyan, lime, and white. |
| Selector rave stage | Playfield background | `/manus-storage/5d-selector-rave-stage_e4fdff4b.png` | Wide pixel-art underground jungle rave with speaker stacks, DJ booth, lasers, fog, dancer silhouettes, and a dark center/lower safe area for gameplay. |
| Lion of Judah pickup | Level 2 positive special pickup | `/manus-storage/selector-showdown-lion-of-judah-pickup_36a45652.png` | Transparent 16-bit regal golden lion head with a crimson mane and green-yellow-red crown rays, composed for a readable positive pickup silhouette. |

## Fallback layer

The player wrapper includes a CSS-rendered neon selector fallback. If the generated sprite fails to load, the fallback is revealed automatically, so the gameplay character never degrades to a browser image-error placeholder.

The original supplied 5th Dimension artwork remains the primary site identity. The generated selector assets are scoped to the mini-game player and playfield only.
