# Level 1 Corrective Visual QA

Date: 2026-08-18

The development preview was opened with `arcade-scene-verify=items-level-one`, `frameOff=1`, `worldRecords=25`, and `worldCombo=1`. The extracted game DOM confirmed that the forced visual state is active while the gameplay HUD remains authoritative: the HUD still reports actual `RECORDS: 0/25`, while the development-only label reports `WORLD PROBE · 25 RECORDS · 1X COMBO`. This is intentional and preserves the mechanics lock.

The page rendered the compact game HUD and the new forced-state label. The browser viewport remains at the anchored page position that exposes the cabinet region, while the general screenshot helper tends to capture the page top unless the supported scene-verification route is used. The normal page contains no `NO ITEMS` text after the empty-layer marker was removed. The next validation step is to inspect the six forced states through DOM/style probes and run the full build plus targeted regression contracts; later-level and site boundaries remain unchanged.

## DOM/style proof

At `worldRecords=25&worldCombo=1`, the viewport classes were `level-one-combo-1 level-one-time-5 level-one-population-5 stage-energy-0`. The probe label read `WORLD PROBE · 25 RECORDS · 1X COMBO`, eight falling objects were present, `NO ITEMS` was absent, and every corrective layer reported `pointer-events: none`. The visible forced layers had computed opacity values ranging from 0.62 to 0.78, including sky, building wash, doorway lights, neon passes, pavement reflection, police reflection, and haze. The HUD remained authoritative at `RECORDS: 0/25` and `COMBO: 1x`, confirming the probe does not mutate gameplay.

At `worldRecords=0&worldCombo=1`, the rendered HUD remained `LVL 1`, `RECORDS: 0/25`, `COMBO: 1x`, `HIGH: 5000`, `LIVES: ❤️❤️❤️❤️`, `PLAY MUSIC`, with no recovery label and no normal-play NO ITEMS marker. Browser capture continues to show the cabinet embedded within the long public page; the DOM and style probes are the reliable state evidence for the anchored playfield.
