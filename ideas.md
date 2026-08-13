# 5th Dimension — Import Direction

## Ground-truth specification

This project is an archive import rather than a redesign. The supplied clean export is the visual and content source of truth: preserve its 5th Dimension bass-transmission identity, artwork references, audio links, layout language, interaction behavior, and existing validation intent. Replace only deployment/project identifiers that still expose the former workspace name. Do not introduce any former workspace identifiers into the new project.

## Chosen approach: Archive-faithful signal collage

### Design Movement

Archive-faithful underground bass culture: street-poster collage, rave flyer typography, graffiti mark-making, and analog broadcast ephemera translated into a responsive editorial landing page.

### Core Principles

1. Preserve the imported composition and copy hierarchy before adding new decoration.
2. Keep the visual language tactile and high-contrast: layered artwork, hard-edged panels, warm signal colors, and dark broadcast fields.
3. Treat audio, links, and calls to action as primary content, not ornamental controls.
4. Remove legacy deployment identity without muting the distinctive 5th Dimension brand.

### Color Philosophy

The palette should feel like a late-night transmission booth: near-black graphite for depth, parchment/cream for readable paper, signal orange for actionable energy, and electric acid green only as a controlled live-status accent. Color contrast should support scanning and rhythm rather than imitate generic neon UI.

### Layout Paradigm

Use the archive's editorial sequence as the structure: a dramatic hero, a compact release signal, staggered artwork/card clusters, and an asymmetric footer/social field. Keep wide horizontal bands and offset columns instead of centering every section into one uniform container.

### Signature Elements

- A visible 5th Dimension insignia that reads as a street-art seal rather than a default wordmark.
- Thin broadcast rules, waveform/technical marks, and small uppercase metadata labels.
- Layered artwork cards with tactile borders and occasional offset shadows that suggest pasted-up flyers.

### Interaction Philosophy

Interactions should feel like tuning into a live signal: direct, immediate, and legible. Buttons and links should announce their destination, give a tactile press response, and preserve the archive's music-first intent. External links should remain accessible and open safely; unfinished structural controls should not pretend to be live features.

### Animation

Use restrained entrance fades and short upward translations for grouped content, never more than a few hundred milliseconds. Favor transform and opacity transitions, staggered by small intervals. Hover states can shift a card by a few pixels or sharpen its border. Respect prefers-reduced-motion and keep audio/link interactions instant.

### Typography System

Preserve the archive's supplied font choices and hierarchy wherever possible. If the clean scaffold needs a fallback, use a condensed display face for mastheads and section labels paired with a neutral grotesk for body copy. Uppercase metadata should be tracked and small; hero headlines should be compact, forceful, and allowed to break asymmetrically.

### Brand Essence

5th Dimension is an underground bass-transmission platform for listeners, selectors, and collaborators who want sound, artwork, and signal in one place — different because it behaves like a live cultural broadcast rather than a generic artist landing page.

Personality: **charged, tactile, independent**.

### Brand Voice

Headlines and CTAs should be terse, confident, and rooted in broadcast language. Avoid generic filler and product-marketing claims.

Example lines:

- “Tune in to the exclusive signal.”
- “Move through the archive. Stay for the bass.”

### Wordmark & Logo

Use the archive's graffiti/round insignia as the primary mark. The new project identity should be carried by the mark and the explicit “5th Dimension” label, not by a default typed logo. Generated visual assets may support missing or newly needed brand surfaces, but imported artwork remains authoritative where present.

### Signature Brand Color

Signal Orange — `#ff5a1f`, used sparingly for active links, release highlights, and transmission cues.

## Import notes

The archive currently has a legacy top-level folder and project metadata from an earlier workspace. Merge application source into `/home/ubuntu/fifth-dimension`, retain only the fresh project's deployment metadata, and verify that visible copy, HTML metadata, package identity, tests, and configuration contain no former workspace identifiers. Media paths already point to lifecycle-backed Manus storage URLs; preserve those paths unless validation shows they are broken.

Generated fallback assets prepared for this project live outside the project directory and are intended only for prominent surfaces that are missing or need a neutral replacement: `/manus-storage/fifth-dimension-mark_cb4f8370.png`, `/manus-storage/fifth-dimension-hero_85ca57e5.jpg`, `/manus-storage/fifth-dimension-grid_d7b944d5.jpg`, and `/manus-storage/fifth-dimension-signal_c9f26047.jpg`.

## Style Decisions

- Signal Orange `#ff5a1f` is now the primary functional cue for action buttons, release highlights, and transmission moments; magenta and cyan remain as artwork/glitch energy, while acid green stays reserved for live-status and alert details.
- New surfaces should read as archive broadcast matter through subtle grain, offset rules, technical metadata, and hard-edged poster layering rather than clean synthetic neon panels alone.
- The page rhythm should continue alternating between flyer, broadcast log, release label, and artwork-wall compositions; the Selector Showdown overlay now follows the release-label language with direct, legible decision controls.
- Large background fields should default to graphite, parchment/cream, and Signal Orange; magenta and cyan may dominate imported artwork or one deliberate flyer band, but should not become the default site-wide atmosphere.
- Selector Showdown uses Signal Orange for functional transmission moments and repeats a compact 5D authentication label across its marquee and controls, keeping pirate-radio/release-label character ahead of cabinet novelty.
- The No Request Bonus may use sunrise pinks and cyan horizon light as a contained dawn-world exception, while tactile rails, signs, and metadata keep it part of the archive-broadcast system.
- Selector Showdown’s active playfield is framed as a 5D dubplate-authentication ritual through parchment broadcast labels, Signal Orange functional edges, and release-log metadata; reactive effects remain expressive but are nested inside this printed-transmission frame.
- Selector Showdown should read as a pirate-radio/release-label challenge first and an arcade second, using broadcast metadata, stamped labels, tactile controls, and a recurring 5D seal.
- The graffiti/round 5D seal should recur across major page zones as the primary brand mark, with typed “5th Dimension” labels as secondary identifiers.
