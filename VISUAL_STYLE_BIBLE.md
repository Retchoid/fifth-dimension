# 5th Dimension Arcade — Visual Style Bible

> **Status:** User-supplied governing reference for future Selectah Showdown visual work. Preserve gameplay behavior unless a request explicitly changes it.

## Direction

The arcade should read as a gritty **16-bit urban beat-'em-up** filtered through **UK jungle-rave flyer**, **pirate-radio**, and **DIY photocopied culture**. The visual references are *Streets of Rage* on Sega Genesis, *Double Dragon*, and *Midnight Resistance*: dense, hard-edged, raw, humorous, and kinetic rather than clean, minimal, or glossy.

## Exact Palette

| Role | Value | Usage |
|---|---:|---|
| Neon Pink | `#FF2D95` | Primary accent, hazard frames, title emphasis |
| Arcade Blue | `#00D4FF` | Secondary bezel and signal accent |
| Graffiti Yellow | `#FFE600` | Highlights, tags, select pixel detail |
| Deep Dark | `#0A0A12` | Ground, negative space, cabinet depth |
| Scanline | `rgba(0,0,0,0.15)` | CRT line treatment only |
| Cream Text | `#F0EAD6` | Main readable text |

## Type and Pixel Treatment

Headlines use **Press Start 2P** with a monospace fallback. Body and quip copy use **Courier New** with a monospace fallback. Avoid Arial, Helvetica, generic sans-serif treatment, smooth UI components, glassmorphism, and soft blurred surfaces.

Sprites use `image-rendering: pixelated` and `crisp-edges`. Game borders are chunky 3–6 px arcade-bezel rules. Text is uppercase with `0.05em–0.15em` tracking. Shadows are hard and offset, for example `4px 4px 0 #000`, never soft.

## Overlay and Splash Contract

Every hazard splash follows one hierarchy:

1. **Tag** — small and colored.
2. **Title** — large, shadowed, and immediately readable.
3. **Quip** — medium-sized British-rave slang or self-deprecating joke.
4. **Visual** — pixel-art hazard or scene focal point behind, beside, or asymmetrically offset from the copy.

All hazard overlays receive scanlines and a dark-edge vignette. They should use off-kilter, cinematic composition rather than centered minimal-card layouts. The focal art must not overlap the title or quip at desktop or phone width.

## Tone

Copy has raw, playful jungle-selector energy: **bruv**, **selector down**, **human Spotify playlist**, and similar self-deprecating rave humour. Emoji are allowed only as punctuation, never as the primary graphic treatment.

Approved examples include:

> “Bruv, you ate the pill. The riddim is literally melting. 🫠”

> “5-0 in the building. They took your decks. You're now a human Spotify playlist.”

> “Bottle to the face. Selector down! 🍾”

> “Boooo. You played ‘Wonderwall’ at a jungle rave. Crowd has left the chat.”

## Exclusions

Do not introduce smooth Material or shadcn-style game UI, rounded game elements other than the cabinet itself, smooth gradients, blur, glassmorphism, primary emoji graphics, clean/minimal composition, or generic error-modal styling.

Use solid fields, dithered textures, scanlines, gritty print noise, chunky outlines, hard offsets, and asymmetrical flyer composition instead.
