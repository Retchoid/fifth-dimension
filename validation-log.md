# Release-Lock Regression Validation Log

## 2026-08-13 — Fresh-session gate

- The prior release card was unlocked because the page accepted the legacy browser key `5d-selector-showdown-download-unlocked` with the plain value `true`.
- The release gate now uses `5d-selector-showdown-download-unlocked-v2` and restores only the exact value `chain-break-complete-v2`.
- Browser validation on the restored preview confirmed that the legacy/stale `true` value does **not** expose the Jersh listening or download controls; the locked card shows only the 25-record requirement.
- Browser validation also confirmed that the exact current proof value restores the post-unlock listening, download, and share controls after refresh.
- The preview was returned to the locked state before attempting the real Level 1 progression path.

## 2026-08-13 — Follow-up regression checks

The browser test wrote an invalid `true` value under the new key and refreshed. The release remained locked. It then wrote the exact current proof value and refreshed; the page restored the listening, download, and sharing controls. The key was subsequently removed so final visual checks start from the locked state.

The cross-reference also found missed direction-symbol copy in the Level 2 marquee, Level 1 handoff controls, release-to-arcade label, and lightbox description. Those visible strings have been replaced with plain control and signal language. A scan of the active site and arcade JSX now returns no direction-symbol UI copy.

## 2026-08-13 — Deterministic regression guard

The release-gate contract now lives in `client/src/lib/releaseGate.ts`, with a direct `scripts/release-gate-check.ts` regression check. The check passes four storage cases: no value, legacy `true`, and an unverified current value all remain locked; only the exact current chain-break value restores access. It also rejects any proof other than `chain-break-complete`.

After the gate extraction and the final coin-cue adjustment, TypeScript and the production build both passed. The build continues to report only its pre-existing runtime-resolved `/manus-storage/` asset notices and bundle-size advisory; it reports no compile or type errors.

## 2026-08-13 — Fresh visual state

The exclusive card now has a direct `#exclusive` anchor. A fresh desktop browser check at that anchor showed the locked card with only the 25-record requirement; it did not show the Jersh listen, download, or share controls. The responsive mobile preview retained the intended site layout, and the same release state is driven by the shared parent state rather than a viewport-specific branch. The latest browser-console check found no warnings or errors.
