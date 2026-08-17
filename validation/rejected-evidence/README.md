# Rejected Mechanics Evidence

`verify-mobile-mechanics.internal-only.mjs.txt` is a preserved copy of the earlier mobile matrix runner. It used development query modes, dispatched events directly, and read internal verifier attributes. It is **not accepted** as proof of real input or gameplay and must not be moved back into `scripts/`.

Accepted mechanics evidence is limited to the real browser-pointer scripts in `scripts/verify-real-ui-gameplay.mjs` and `scripts/verify-real-ui-crowd-pressure.mjs`. These start the rendered public game UI and target rendered falling-object geometry without internal game APIs or state injection.
