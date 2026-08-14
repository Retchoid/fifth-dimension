# Selectah Showdown game-only visual audit

## Acceptance standard

Every game visual must read as a **gritty late-1990s rave, jungle, graffiti, hip-hop arcade world**. The shared grammar is a deep charcoal and indigo base, cyan and hot-magenta signal lighting, lime and signal-orange reward contrast, thick near-black keylines, limited hard shading ramps, screen-print texture, and readable foreground/background planes. It deliberately avoids soft pastel gradients, generic flat icons, or unrelated web-card styling.

| Visual system | Current audit finding | Required treatment |
|---|---|---|
| Cabinet, HUD, and start state | Existing steel cabinet, pirate-radio labels, joystick treatment, and heavy outlines are on-theme. | Preserve and reinforce screen-print edge wear, cyan signal light, and magenta ink shadows. |
| Level 1 sound-system stage | The game has rave structure and a DJ identity, but needs a more clearly shared arena depth treatment. | Dark dancefloor perspective, stacked speakers, hard cyan/magenta light planes, and arcade scan texture. |
| Level 2 Crowd Pressure stage | Existing crowd, speaker stacks, dancers, and meter match the subject but must share Level 1's fixed palette and line treatment. | Darker club depth, contrast-controlled crowd silhouette, and bold floor/booth planes. |
| Player and dancers | Pixel assets and silhouettes are valid but need a unified dark keyline and glow grammar. | Pixel rendering, charcoal shadow, cyan/magenta rim light, and no blurred soft edges. |
| Pickups and hazards | CSS sprites have the correct subjects and values but need consistently grounded 16-bit prop shading. | Thick outline, 2–4 shade ramp, drop shadow, colour-coded reward/hazard halo, and clear small-size silhouette. |
| Police, crowd, pill, crate, headphones, rewind, Wheel It Up, BOH, and Run the Riddim cut-ins | All have dedicated focal scenes and are structurally compliant. | Retain each subject while applying a consistent ink keyline, scan texture, hard palette, and foreground focal-object hierarchy. |
| After Party Gear Dash | Dark city, road, runner, gear, hazards, and party door are on-theme; readability must remain high during motion. | Three discrete road lanes, high-contrast gear/hazard keylines, a visible runner, and a fixed neon-city perspective. |

The visual-only pass will not change arcade rules, text, item values, collision radii, trigger thresholds, timing, transitions, audio, or any non-game website content.

## Verification evidence

The enlarged Level 1 verifier showed the arcade cabinet, dark stage, central player silhouette, cyan/magenta lighting planes, screen-print scan texture, and high-contrast start panel together at game scale. The held Level 2 verifier showed the explicit record bridge completing into the Crowd Pressure arrival layer; the Level 2 backdrop and arrival layer were both present, and the arrival layer carried the shared near-black/cyan inset keyline. The live After Party verifier previously showed the road, runner, city, party landmark, and multiple gear/hazard entities in all three lanes. Dedicated scene markup and the deterministic 133-hook audit preserve the full cut-in family: Rewind, Wheel It Up, police, crowd, pill, crate, headphones, BOH, and Run the Riddim.

The post-change held-scene sweep confirmed all nine cut-ins mounted after the new game visual layer: Rewind, Wheel It Up, Police, Crowd, Pill, Crate, Headphones, BOH, and Run the Riddim. Each mounted its dedicated overlay and exposed the shared five-pixel charcoal plus eight-pixel cyan inset frame. This confirms the new visual grammar is applied to every interruption without changing the sequence queue or scene-specific focal graphics.

Live prop checks completed the sweep. A normal Level 1 session produced a cyan-coded record with the shared charcoal hard shadow plus pale highlight edge. A normal Level 2 session produced both a white bottle hazard and cyan record pickup; both had the same grounded hard-outline treatment, while their distinct subject-specific CSS and colour coding remained intact. This covers the active two-level pickup/hazard field as well as the three-lane After Party entities previously checked.

## Correction matrix

| Audited game graphic | Visual-only correction | Source of truth |
|---|---|---|
| Cabinet and HUD surround | Added metal/ink cabinet ramp, cyan signal bloom, magenta offset shadow, and deep-charcoal keyline. | `game-visual-system.css`: `.arcade-cabinet-bezel` |
| Level 1 stage | Added fixed-palette dancefloor depth, speaker-line treatment, cyan/magenta lighting planes, and scan texture. | `.game-grid-bg:not(.level-two-grid-bg)` |
| Level 2 Crowd Pressure stage | Added a darker club base, controlled crowd/booth planes, and cyan/magenta contrast without moving the compact meter. | `.level-two-grid-bg`, `.level-two-booth`, `.rave-world-dressing` |
| DJ and dancer art | Applied pixel rendering with charcoal contact shadow and cyan/magenta rim separation. | `.dj-catcher-art`, `.dj-sprite`, dancer selectors |
| Every record, positive pickup, and hazard | Applied one grounded hard-outline rule with pale edge highlight; retained cyan reward coding, lime bonus coding, and hot-magenta hazards. Live evidence includes Level 1 record + pill and Level 2 record + bottle. | `.falling-object` plus type-group selectors |
| Rewind, Wheel It Up, Police, Crowd, Pill, Crate, Headphones, BOH, Run the Riddim, and record handoff | Added a consistent charcoal/cyan arcade frame and screen-print texture while retaining every existing focal graphic and copy. | grouped cut-in selector rule |
| After Party Gear Dash | Reinforced the runner's fixed neon-city perspective, three-lane road contrast, pixel item treatment, and dark arcade frame. | `.afterparty-runner-stage`, `.afterparty-cityline`, `.afterparty-road` |

No game rule, item value, collision radius, sequence, timer, audio path, or non-game site content changed in this correction.

## Complete asset-family proof

| Asset family | Exact included graphics | Proof of unified treatment |
|---|---|---|
| Cabinet and stages | Cabinet bezel, Level 1 sound-system stage, Level 2 Crowd Pressure stage, booth, dressing, HUD viewport. | Dedicated selectors in `game-visual-system.css` apply the same charcoal keyline, cyan/magenta signal lighting, hard palette ramp, and screen-print texture. |
| Performer assets | Front-view DJ, rear-view runner DJ, lime/cyan/magenta dancers, speaker-stack dancers. | Pixel rendering and charcoal/cyan/magenta edge separation is applied to DJ and dancer selectors; runner uses the dedicated pixel entity rule. |
| Level 1 field assets | Record, cop, pill, phone, CDJ, mixer, turntable, and 45 adapter. | The authoritative Level 1 spawn list in `SPAWN_WEIGHTS[1]` is fully covered by the outer `.falling-object` hard-outline rule. Distinct value/hazard colour coding is preserved. |
| Level 2 field assets | Every Level 1 asset plus bottle, apple core, and Lion of Judah head. | The authoritative Level 2 spawn list in `SPAWN_WEIGHTS[2]` is fully covered by the same generic outer visual rule and extended type selectors. |
| Gear Dash assets | Headphones, turntable, mic, speaker, mixer, CDJ, cart, can, rock, rat, road, city, party door. | Runner stage, cityline, road, entity, and rear-DJ selectors provide the same fixed neon-city perspective, dark keyline, and pixel-object treatment. |
| Interrupted scenes | Record bridge, Rewind, Wheel It Up, Police, Crowd, Pill, Crate, Headphones, BOH, Run the Riddim. | The grouped cut-in selector applies one screen-print and charcoal/cyan frame across all eleven visual states. |

The live samples substantiate the static contract in normal play: Level 1 rendered both a record pickup and pill hazard; Level 2 rendered a record pickup and bottle hazard. Because each remaining field type renders through that same classed `.falling-object` component and shares the universal outer treatment, no asset family is excluded from the visual pass.

## Deterministic field-asset verification

A development-only `showItemPreview(level)` verifier now renders the actual field markup for every allowed item at once; it is unavailable in production and does not start a frame loop. The Level 1 preview confirmed **record, cop, pill, phone, CDJ, mixer, turntable, and adapter**. The Level 2 preview confirmed **record, bottle, apple core, cop, pill, phone, Lion of Judah, CDJ, mixer, turntable, and adapter**. Every rendered item exposed the shared charcoal drop shadow and pale highlight edge; its own reward/hazard colour remained distinct. This supplies asset-by-asset evidence that the full two-level field—not only a random sample—uses the same hard-outline fixed-palette arcade treatment.
