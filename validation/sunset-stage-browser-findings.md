# Sunset Stage Browser Findings

The existing `arcade-viewport-verify=active` verifier initializes **Level 2** (six of fifty records), so it is not suitable for visual sign-off of the new Level 1 sunset stage. The surrounding site and arcade cabinet remained in normal document flow during the browser inspection.

The next validation step is to add a development-only Level 1 active-state verifier, then capture the Level 1 sunset base state, a high-combo reactive state, and the matching 390 × 844 mobile frame.

## Level 1 verifier update

The development route `?arcade-viewport-verify=level-one` now renders the intended Level 1 state: level 1, 0 of 25 records, 1× combo, four lives, and the authored street-layer text/details in the arcade DOM. The route remains development-only; the normal game flow is unchanged.

## Desktop interaction and visual check

The focused desktop browser capture showed the Level 1 cabinet with the new warm street scene inside the established arcade frame. The shared Pointer Events path was exercised against the live component with explicit left, centre, and right pointer moves. The selector’s rendered gameplay position changed to `8%`, `50%`, and `90%` respectively. The synthetic browser event reports no retained pointer capture after dispatch, which is expected after the matching release event; browser-event dispatch cannot by itself establish a user-device capture guarantee. The application’s direct `setPointerCapture` / release code path and automated coordinate tests remain the source-level verification for that lifecycle.
