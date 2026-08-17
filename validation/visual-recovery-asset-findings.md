# Visual Recovery Asset Findings

## Canonical Level 1 reference

`selectah-splash-art-direction_4d1c250f.png` is a 1920×1080 illustrated Selectah Showdown composition. It contains a large expressive DJ at the left, an oversized vinyl foreground, a white comic-book burst through the center, an illustrated police vehicle at the right, halftone texture, black brush strokes, and magenta, cyan, lime, purple, and orange accents. The empty central burst is an appropriate low-detail lane for interactive objects, provided the surrounding illustrated world remains visible.

## Canonical Level 2 reference

`5d-selector-level-two-detailed-stage_89e2157b.png` is a 1920×1080 Crowd Pressure club scene. It includes a DJ/decks foreground, dense crowd midground, speaker stacks, lighting truss, lasers, banners, neon stage architecture, and a dark but richly layered environment. It can support a readable collision plane by darkening the center lane rather than replacing the scene with a sparse field.

## Recovery direction

The active levels should reuse these exact existing reference assets as static composited environment layers, with the current player, falling items, HUD, and event overlays mounted above. No generative replacement art is needed for this direction.

## 390×844 baseline findings

The current top-of-page render confirms a real mobile regression before recovery work: desktop navigation links remain visible in the header and collapse into narrow vertical text columns, while the 5D Playa summary content is also constrained to implausibly narrow columns. The likely root cause is the late `mobile-site-repair.css` rule that forces `.dj-nav` to `display:flex !important`, overriding the intended `@media (max-width:980px)` collapsed navigation state in `index.css`. This must be corrected with a targeted responsive override rather than by hiding general overflow.

The top-of-page baseline also confirms that the requested game verifier hash does not automatically scroll the screenshot runner to the arcade. Full-page/targeted runtime capture will be used after the visual recovery implementation.

## Asset and path audit

The repository contains 59 referenced embedded assets. A path comparison found **no broken embedded-asset references** and **no unreferenced files** in `client/public/embedded-assets/`. The apparent `/embedded-assets/placeholder` match is test-only text in `visualArchive.test.ts`, not a live file reference.

Live gameplay already maps illustrated project assets for the dubplate, police siren, pill, phone, CDJ, mixer, turntable, adapter, bottle, apple core, lion, speaker stack, and bonus-runner pieces through `URBAN_PROP_ASSETS` and `URBAN_RUNNER_ASSETS`. The recovery should therefore change composition and visual scale rather than replace the object art.

The working root cause of the homepage floating-text regression has been identified: `mobile-site-repair.css` forces `.dj-nav` to `display:flex !important`, overriding the intended compact-navigation breakpoint. The Jersh root-cause audit remains active; current likely conflict candidates are the historical full-height `exclusive-release::before` pseudo-element and the large `exclusive-track::after` decorative yellow label introduced across overlapping release-card stylesheets.

## Playable asset observations

`5d-selector-jungle-dj-sprite_502781f7.png` is a full-body 1920×1920 illustrated/pixel DJ carrying the decks. It has enough native detail to become a clearly legible mobile protagonist through an image-only visual-scale treatment; the collision container need not be resized.

`selectah-level-one-urban-stage-reference_43ddc07a.png` is a 1920×1080 night-street sound-system stage with speaker walls, graffiti, neon city architecture, and a naturally clear central ground plane. It can provide the Level 1 structural environment, while the stronger comic language of `selectah-splash-art-direction_4d1c250f.png` should be limited to side and upper illustrated framing rather than repeated across the collision plane.

## Runtime review support

Browser review confirmed that the recovered Level 1 environment mounts inside the cabinet while the Jersh card remains present above it. A development-only `arcade-scene-verify` scroll helper now targets `#selectah-showdown` after the existing verifier starts, allowing mobile screenshots to capture the requested active scenes without changing production gameplay or navigation.

The desktop-only `arcade-cabinet-focus` verifier isolates the cabinet in a full-window diagnostic canvas. It is not representative of normal site placement or the mobile layout, and must be assessed separately from standard page captures.

Normal navigation to `#selectah-showdown` places the complete Selectah Showdown cabinet between the Jersh release card and the Visuals Archive, confirming that the required page order remains intact. The cabinet-focus diagnostic thumbnail should therefore not be used to assess normal page scale, cabinet placement, or section flow.

## Mobile viewport validation

The homepage was captured at **320×800, 360×800, 375×812, 390×844, 412×915, and 430×932**. In every capture, the main navigation collapses to the hamburger control, header actions remain contained, the 5D Playa card stays within the viewport, the “5TH DIMENSION” mark remains readable rather than wrapping letter-by-letter, and the hero copy, CTA, and decorative artwork stay within the mobile column.

The normal cabinet was also measured from the rendered page: it is 1260 CSS pixels wide with a 1216-pixel active viewport in the browser’s high-density diagnostic context. The visually smaller browser thumbnail reflects that context’s `devicePixelRatio: 0.25`, not a live desktop scale regression.

## Release-card check

The Jersh In Case release card was reviewed in its normal page position. The unwanted full yellow overlay is absent, the release content is visible, and the locked-state message remains in place ahead of Level 1 completion. The remaining neon pink/cyan card treatment is intentional release-card styling rather than the prior blocking yellow rectangle.

## Event-overlay check

The police verifier loads the police-seizure scene inside the normal embedded cabinet, including its graphic panel, the `MIXER DAMAGED / RECOVERY 0/3` status, and the record-spin transition back to the set. The browser diagnostic applies an unusually high CSS viewport with a low device-pixel ratio, so scene text was confirmed from the rendered scene state and existing overlay contract rather than from the reduced diagnostic thumbnail. The temporary review zoom was reset before ending the check.

## Published media-route audit

After the managed-media migration, all **58 actual image and audio assets** in the recovered inventory were requested through their former `/embedded-assets/<filename>` public paths. Each request resolved successfully to managed storage with a media content type; no mix-cover or arcade-asset route failed. The remaining inventory entry is the non-media `placeholder` file and is not used by the site or game.

## Gallery-art active-play reconstruction

The final scoped `gallery-art-active-play.css` layer now uses the Selectah Showdown splash frame as the Level 1 illustrated environment, with separate existing urban-stage and police-siren artwork reserved for its foreground depth layers. Level 2 retains the full Crowd Pressure stage illustration, with a protected darkened center lane, an existing speaker-stack foreground, and an existing dubplate foreground. This avoids repeating the same full-frame art while keeping the collision plane legible.

The selector sprite was enlarged visually from its existing collision wrapper only; collision geometry and item-spawn code were not changed. Existing illustrated pickups and hazards keep their asset mappings and gain visual-only silhouette scaling and distinct reward/hazard glow. The existing specific police, pill, crowd, transition, bonus, win, and fail scenes retain their supplied artwork under one scoped cyan/magenta hard-flyer frame system.

At **390×844**, mobile captures were produced for Level 1 active play, Level 2 active play, Level 2 arrival, record dissolve, police seizure, pill overload, crowd anger, and game over. The gallery reference endpoints were supplied by the user as the Selectah Showdown and Crowd Pressure artwork lightbox captures. Automated validation passed after the reconstruction: **15 test files / 45 tests**, TypeScript, and production build. The build retains runtime managed-storage asset resolution and has no new gameplay-loop, collision, or audio changes.
