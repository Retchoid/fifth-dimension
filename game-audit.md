# Selector Showdown Playability Audit

## Review date

2026-08-13

## Findings and amendments

The arcade entry and live Level 1 run were checked in the development preview. The session launched successfully, background music activated from the same click, falling objects continued to update, and the HUD displayed live score, record, combo, high-score, lives, and mute state.

The review identified two presentation and interaction risks: large release-to-arcade graffiti ribbons could visually cover the game surface, and the mobile touch path could compete with scrolling or lose a drag outside the initial press target. The ribbon route now sits behind the cabinet, with reduced opacity, so it frames the cabinet without obscuring the player, HUD, or falling-object lanes. Touch movement now uses pointer capture and viewport-level overscroll containment; handset HUD presentation removes nonessential high-score and level badges while reducing decorative rave dressing during play. Reduced-motion visitors no longer receive the pulsing combo animation.
