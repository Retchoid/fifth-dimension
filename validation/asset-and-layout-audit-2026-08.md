# Asset and Layout Audit — Visual Recovery Pass

## Asset inventory and reference status

The retained original project asset library contains **59 entries**: **45 PNG illustrations**, **1 JPG illustration**, **12 MP3 files**, and **1 non-media placeholder file**. The active client source contains **59 direct `/embedded-assets/` references**. A filename-by-filename scan found **no missing direct reference**, **no unused retained asset**, and **no historical project asset that is absent from the retained library**. Git-history comparison also found that the historic and current direct-reference inventories are the same 59 names.

The 58 actual media entries are served from managed storage through the legacy asset compatibility route. The `placeholder` file is non-media and is not used by the site or game. The project has no remaining local large media in the deployed repository; the retained original media library is kept outside the repository as a backup.

| Category | Count | Active use |
|---|---:|---|
| Site/gallery/mix cover illustrations | 21 | Hero, visual archive, projects, mix archive |
| Selectah Showdown illustrations and sprite family | 25 | Gameplay, bonus scenes, event screens, cabinet |
| Audio files | 12 | Mix archive, Jersh release, game/bonus tracks |
| Non-media placeholder | 1 | Not referenced |

## Event-to-gameplay comparison

The strongest canonical artwork is already present and actively referenced: `selectah-splash-art-direction`, `5d-selector-level-two-detailed-stage`, `selectah-urban-brawler-visual-target`, `selectah-police-siren-urban`, `selectah-pill-urban`, the illustrated object family, and the existing selector sprite. These are the source materials for the scoped active-play continuity layer; no generated or generic substitute is needed.

## Jersh yellow-block root cause

The old `exclusive-third-strike.css` layer defines `.exclusive-release::before` as a **46%-high absolute pseudo-element** with inherited stage geometry. The later promo layer reused that same pseudo-element for a small label but did not originally reset the inherited geometry. A second yellow source is `.exclusive-track::after`, which is explicitly a `#FFE600` decorative “5D” disk. The durable repair will remove the stale large inherited geometry from the Jersh-specific release card rather than globally suppressing yellow styles.

## Homepage floating-text root cause

The mobile cascade contains a global `.dj-nav { display:flex !important; }` declaration that overrode the intended `@media (max-width:980px)` navigation collapse, plus broad global wrapping/overflow rules and decorative-layer overrides. Together they could force desktop-like header content back into the narrow flow and make text appear detached. The durable repair will remove the conflicting global rule and scope containment only to the affected header/hero elements; it will not hide page content through a universal overflow rule.

## Current screenshot baseline

At 390×844, the current home view has contained hero text, a header-integrated 5D Playa, and a collapsed navigation trigger. The current Jersh computed pseudo-elements measure as a **163×29 px cyan label** and a **36×36 px cyan 5D disk**, not a large yellow rectangle. These observations form the baseline for the ordered recovery implementation and regression evidence.
