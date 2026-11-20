# 5D DPM v0.15 — interface and workflow audit

## Outcome

The energy plot is permanently visible in the set overview. The set page now follows a DJ’s working sequence: define the criteria, read the energy shape, audition section matches, arrange the running order, export, then optionally review handoffs and teach the app. Existing features remain available.

| Area | Finding | Improvement |
| --- | --- | --- |
| Energy plot | Hidden in a closed analysis accordion; actual energy shown as isolated dots; small axes | Persistent overview with dashed planned arc, connected actual-energy line, labeled 0–10 axis, track positions, average energy and total duration. Click or keyboard-select dots for details. Missing values leave gaps; zero remains valid. |
| Live planning | Energy edits were difficult to assess against the current order | Draft criteria update the target plot and suggestions without replacing tracks; the plot clearly labels unsaved previews. Range mode shades the allowed energy range. |
| Set setup | Source folders and advanced controls competed with everyday decisions | Setup and energy overview sit beside each other on wide screens and reflow vertically on smaller screens. Source folders and advanced arc controls are named expandable groups. |
| Navigation | Long page with competing tools | Define / Energy / Audition / Arrange / Export jump controls. No new workflow tabs. |
| Suggestions | Dense, small card content | Larger labels, ratings and controls, more spacing, visible unused-match counts, separate Preview and Add to set. More suggestions and manual card criteria remain. |
| Details and order | Repeated dense blocks and mixed actions | Selected details remain below the planning cards. Order rows keep BPM, key, energy, designation, personal Banger indication, drag grips, arrow movement, swaps and removal. |
| Export and learning | Export controls crowded the order heading | Export has its own clearly labeled panel after the running order. Transition review remains a separate expandable section with explicit learning controls. Export format and expanded sections survive ordinary edits. |
| Camelot | Small type, dense reference, little explanation | Larger 24-key interactive wheel, source selector, four quick-move groups, detailed explanations for every destination, highlighted relationship and full 576-combination matrix with larger cells and sticky row/column labels. Source selection and Close remain reachable while scrolling. |
| Library designation | Single-track edits required opening details | Direct eight-stage dropdown on every row. Use learned placement clears the manual override; Undo restores it. Batch designation and detailed editing remain. |
| Bangers | No independent personal subcategory | User-only star tag, individual or selected-batch tagging/removal, All / Bangers / Not tagged filters and count. Tags are independent of designation, scoring and learning, persist across restart, and remain isolated by DJ profile. Filtered tracks can be added to a set together. |
| Settings | Cramped profile labels and truncated controls | Larger, aligned profile fields and responsive settings layout. Fresh and reused-analysis profiles, scanning and tempo/duration preferences remain. |
| Accessibility | Small text and crowded targets | Larger functional text, focus indicators, labeled controls, keyboard-operable wheel and plot, logical groups and responsive overflow containment. |

## Feature preservation

The audit compared control identifiers against v0.14: no existing static or dynamically generated control identifiers were removed. Behavioral regression checks cover individual and batch library additions, automatic set generation, edited-card additions, refreshed suggestions, swaps, drag ordering, Undo, exact-order TXT export, source folders and profile creation/switching. Playback controls, seeking, BPM recheck/correction, training, field manual, Camelot reference, advanced arcs/weights, Serato-related exports and reviewed set learning remain available.

Bangers are never inferred by the model. They are stored separately in the active DJ profile and included in text/ratings CSV set exports. Reusing analyzed music in a new profile does not copy these personal tags. Music files and their embedded tags are unchanged.

## Verification

- 90 Python regression tests passed in the Mac source package, including five new persistence, isolation, atomic-write, designation Undo and export tests.
- Live local-API DOM regression exercised the expanded library, set, Camelot and profile workflows.
- Live Chromium interaction and screenshot review covered library, sets, track details, training, settings, field manual and Camelot.
- Viewports: 1440, 1320, 1024, 768 and 390 px. No document-level horizontal overflow was found. Wide library tables, the key matrix and phase strips retain their own horizontal scrolling.
- The Windows build runs its portable regression suite plus frozen dependency/resource and synthetic audio-analysis checks before packaging.

## Practical limits

Browser checks ran on Linux with synthetic library fixtures. Native macOS/Windows window chrome, actual output devices and real-library performance still require device testing. Energy and transition ratings remain provisional musical proxies; this UI update does not claim to recalibrate them or guarantee harmonic compatibility. Windows remains an unsigned beta, and native Serato crate exports remain experimental on Mac.
