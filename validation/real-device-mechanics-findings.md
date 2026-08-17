# Real-device mechanics investigation — working findings

The prior acceptance verifier was rejected because it called internal debug methods and injected collision conditions. It is no longer valid evidence. A replacement browser audit uses the ordinary rendered Start Session control and browser pointer gestures only.

The first real failure was confirmed at the DOM level: the public Start Session button bubbled `pointerdown` to the playfield, whose drag handler called `preventDefault()` before gameplay had begun. That suppressed the child button click. The active handler now ignores inactive sessions and interactive descendants, so the public Start Session tap can complete before pointer capture starts.

The second real failure was confirmed from `elementsFromPoint`: the Projects section had `z-index: 5` while the enclosing arcade shell was held at `z-index: 3`; the Project card and release elements painted above the arcade. The authoritative later CSS rule now sets the arcade shell to `z-index: 9` with isolation.

The current focus-mode audit confirms a genuine browser pointer drag reaches the rendered stage background, captures on the playfield, and moves the real player from world X 8 through 90. The visible panel reports DOM target, pointer coordinates, logical world X, actual player X, capture, hitbox, clean streak, and bonus state.

Normal-page hash navigation is not a valid acceptance route in the screenshot harness because it did not scroll to the arcade; subsequent proof uses the public rendered arcade control with the isolated verifier page only for viewport framing, never for internal state control.
