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
| Urban brawler visual target | Approved non-sprite replacement benchmark | `/manus-storage/selectah-urban-brawler-visual-target_a56c19c4.png` | Original hand-drawn 16-bit night alley with layered street depth, cel shading, grounded debris, restrained neon signage, and no character art. |
| Urban dubplate | Standard positive record pickup | `/manus-storage/selectah-dubplate-urban_052862f6.png` | Transparent, hard-contour vinyl with parchment label and a signal-orange 45 adapter. |
| Urban police siren | Standard police hazard | `/manus-storage/selectah-police-siren-urban_5fb879fa.png` | Transparent, cracked graphite siren with muted red/blue lenses and a compact physical silhouette. |
| Urban pill | Standard pill hazard | `/manus-storage/selectah-pill-urban_e2f4393e.png` | Transparent cracked capsule with a dirty, cel-shaded arcade-brawler material treatment. |
| Urban phone | Standard phone hazard | `/manus-storage/selectah-phone-urban_0aebd4d4.png` | Transparent scuffed 1990s mobile with a broken antenna and compact dark silhouette. |
| Urban CDJ | Standard high-value pickup | `/manus-storage/selectah-cdj-urban_79c0b46c.png` | Transparent graphite CDJ with parchment platter ring and restrained cyan/orange controls. |
| Urban mixer | Standard four-point pickup | `/manus-storage/selectah-mixer-urban_aa64e423.png` | Transparent scuffed analogue mixer with faders and signal-orange level LEDs. |
| Urban turntable | Standard three-point pickup | `/manus-storage/selectah-turntable-urban_de17fd21.png` | Transparent compact deck with parchment platter and orange cue indicator. |
| Urban 45 adapter | Standard two-point pickup | `/manus-storage/selectah-adapter-urban_ab9d38ca.png` | Transparent scratched signal-orange adapter with brass center ring. |
| Urban bottle | Level 2 crowd hazard | `/manus-storage/selectah-bottle-urban_fc7e712f.png` | Transparent white bottle with chipped neck, grounded cel shading, and hard contour. |
| Urban apple core | Level 2 crowd hazard | `/manus-storage/selectah-apple-core-urban_66dacfaa.png` | Transparent red apple core with exposed flesh, seeds, and stem. |
| Urban Lion of Judah | Level 2 high-value pickup | `/manus-storage/selectah-lion-urban_9431e50b.png` | Transparent red-and-bronze Lion of Judah medallion with crown rays. |
| Urban sound-system stack | Speaker-stage decorative hardware | `/manus-storage/selectah-speaker-stack-urban_9fd16c27.png` | Transparent street-sound-system tower designed to sit behind unchanged dancer sprites. |
| Urban After Party entrance | Runner finish architecture | `/manus-storage/selectah-afterparty-door-urban_0b6d1ed4.png` | Transparent battered venue-door cut-out for the Gear Dash finale. |
| Urban runner cart | Runner negative hazard | `/manus-storage/selectah-runner-cart-urban_9a222f37.png` | Transparent battered shopping-cart and curb-grime hazard cut-out. |
| Urban runner gear | Runner collectible motif | `/manus-storage/selectah-runner-gear-urban_47eea311.png` | Transparent headphones-and-microphone gear cut-out. |

## Fallback layer

The player wrapper includes a CSS-rendered neon selector fallback. If the generated sprite fails to load, the fallback is revealed automatically, so the gameplay character never degrades to a browser image-error placeholder.

The original supplied 5th Dimension artwork remains the primary site identity. The generated selector assets are scoped to the mini-game player and playfield only.

The current non-sprite rebuild preserves the supplied DJ and dancer sprites plus the approved stage backgrounds. Generated assets must remain transparent and never introduce white squares, generic geometric containers, copied external artwork, or changes to the game collision model.

| Splash-scene art direction reference | Current event-scene visual target | `/manus-storage/selectah-splash-art-direction_4d1c250f.png` | Late-1990s 2D fighting-game-inspired vinyl, DJ, police, halftone, and cel-shaded colour treatment; no typography or copied characters. |
| After-party runner visual target | New bonus-stage art direction | `/manus-storage/afterparty-runner-visual-target_52d5fa2b.png` | Original 16-bit rear-view city road with a distant descending party light, readable equipment/hazard lanes, and a street-level after-party door. |
| Rear-view DJ runner | Player artwork for the replacement bonus only | `/manus-storage/selector-dj-rear-runner_eefbafea.png` | Rear-view running pose derived from the existing selector character’s identity, palette, and chunky pixel-art grammar. |
| After-party runner breakbeat | Dedicated bonus-only music bed | `/manus-storage/afterparty-runner-fast-breakbeat_0d617411.mp3` | Original 172 BPM instrumental 16-bit breakbeat with dark-city mood and a loop-ready road-run pulse. |
