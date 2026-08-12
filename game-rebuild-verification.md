# Selector Showdown rebuild verification

The live runtime check successfully started Selector Showdown, produced a falling object, and loaded the generated DJ sprite at `1024 x 1024`. The generated rave-stage background URL was present in computed styles.

A replay-plus-pointer probe moved the catcher immediately from `50%` to `80%`, confirming the pointer movement path works while the session is active. A controlled active-state visual pass confirmed the generated sprite URL and rave-stage layer are active in the game DOM. The browser capture reached game over quickly during the capture window, but the loop, collisions, score/records updates, high-score persistence, and replay control were all observed in runtime checks.
