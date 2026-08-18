# Approved Art Mapping — Level 3 Pit Run

## Locked implementation boundary

The existing `LEVEL_3_PIT_RUN` state already has a separate update loop, lane ownership, gear inventory, hazard resolution, score/combo hooks, equipment damage hook, and afterparty completion state. The Level 2 handoff is `startPitRun()` and the reward completion path is `finishPitRun(true)`. The existing direct captured-pointer route reaches `setBonusLaneFromClientX()` for the Pit Run, and the runner loop retains keyboard fallback through `moveBonusSideways()`.

The integration therefore changes **art/configuration/rendering only**. It does not replace the input-capture surface, normal Level 1/2 player-world mapping, collision code, scoring rules, splash dispatcher, or Level 1/2 progression requirements.

## Approved runtime art sources

| Runtime role | Approved source file | Managed runtime path | Use in Level 3 |
| --- | --- | --- | --- |
| Deep Pit Run world | `1000001082.png` | `/manus-storage/approved-pit-run-afterparty-board_b135c77c.png` | Dense illustrated street/afterparty destination world, cropped responsively as a game-world layer rather than recreated in CSS |
| Afterparty Arrival | `1000001082.png` | `/manus-storage/approved-pit-run-afterparty-board_b135c77c.png` | Warm afterparty-destination section of the approved board, responsively cropped so the sunrise, city, and party-signage direction is visible |
| Level 2 club source | `1000001079.png` | `/manus-storage/approved-level2-club-main_ab9e9eb3.png` | Approved club/crowd visual direction reference and optional stage backwall source |
| Crowd Pressure source | `1000001080.png` | `/manus-storage/approved-level2-crowd-pressure_62c471b0.png` | Approved behind-the-decks crowd pressure direction reference |

`1000001017.jpg` remains retained in managed static storage as a supplied secondary loft/alley reference. The remaining supplied boards remain source references for palette, character proportions, readable objects, humor, grime, signage, and HUD hierarchy. No new artwork is generated or substituted in this pass.

## Three-frame journey

| Pit Run range | Frame | Art treatment | Destination story |
| --- | --- | --- | --- |
| 0–33% | Club Exit | Darker crop of the approved Pit Run world with club-side glow, fire-exit wash, and near architectural clutter | Selectah has just left the club with the afterparty ahead |
| 34–72% | Deep Pit Run | Full dense approved Pit Run world with fast foreground hazard/gear plane and street chaos | The alley becomes more dangerous as gear is recovered |
| 73–100% | Afterparty Arrival | Warm sunrise-loft approved art with stronger window/sun illumination and destination sign | The loft/warehouse afterparty becomes visibly reachable |

## Rendering and collision contract

The artwork is a visual world behind the existing entity plane. Gear and hazards remain DOM entities in the same rendered lane that the current collision loop evaluates; entity scale is derived from `depth`, so their visible approach continues to agree with collision timing. CSS is limited to responsive crop placement, parallax translation, lighting, and compact feedback layers.

## Focused mobile proof review

The 390px Club Exit and Deep Pit proof captures confirm that the approved illustrated world is the visible environmental layer, the rear-view Selectah remains centered in an unobstructed runner corridor, and the Level 3 HUD/inventory remain compact rather than covering the active playfield. The Deep Pit frame retains dense street-character detail while preserving the bottom action lane. The separate arrival frame is reviewed as part of the final three-frame acceptance matrix.
