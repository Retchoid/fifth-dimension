# Adaptive-card and sharing functional audit

## Official site adaptive card

The live preview resolves the official Open Graph and Twitter metadata to the production canonical URL, **5th Dimension | Jungle, Ragga & Bass** title, music-and-arcade description, 1200×630 PNG, `summary_large_image` Twitter card, and matching image alt text. This supplies the canonical card used when the official site URL is shared.

## Individual archive share cards

The CFMU Hostile Airwaves share control opened a dialog containing its stored cover URL, exact title, exact artist, required call to action, and a share control. The Deep On Rolling native-share test produced the expected structured payload:

| Field | Verified value |
|---|---|
| Title | `Deep On Rolling — Bobbyjackets` |
| Text | `Deep On Rolling — Bobbyjackets. check out 5th Dimension music official site for more content, games and upcoming events` |
| URL | Canonical page URL plus `#other-mixes` |

The copy-link fallback was independently exercised for CFMU Hostile Airwaves. It copied the exact title/artist and required call to action followed by the archive anchor, then updated the dialog action to **LINK COPIED**.

## Arcade share action

The native-share branch sent the expected `5th Dimension — Selectah Showdown` title, game invitation text, and direct arcade URL carrying `?from=selector-share#minigame`. The fallback copied that same direct-game URL and changed the visible action feedback to **Game link copied**.

No external share sheet was submitted during this audit. Both branches were exercised locally with captured payloads only.

## Complete archive-card sweep

All nine share controls opened their intended card. Each card mounted a non-empty cover URL, exact supplied title, exact artist, the required official-site call to action, and a **SHARE THIS MIX** control.

| Archive card | Artist | Result |
|---|---|---|
| CFMU Hostile Airwaves May 9 | Dj Hideaf | Card, artwork, attribution, CTA, and share control verified. |
| Deep On Rolling | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Minianimilism 2 | 5th Dimension | Card, artwork, attribution, CTA, and share control verified. |
| Live festival house mix 2022 | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Holes in Our Souls | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Festival live mix house — Side A | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Festival live mix house — Side B | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Festival live mix house — Side C | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |
| Festival live mix house — Side D | Bobbyjackets | Card, artwork, attribution, CTA, and share control verified. |

The native-share and clipboard-fallback branches were then rechecked using both a DnB entry (**Minianimilism 2**) and a house entry (**Holes in Our Souls**), alongside the arcade action. Both mix branches used their exact title/artist plus the required CTA and archive anchor. The arcade used the direct `?from=selector-share#minigame` URL. No adaptive-card or sharing regression was found.
