/**
 * 5D release gate: Jersh remains locked unless the current arcade chain break
 * explicitly emits this proof. The proof is retained only for the active browser
 * session, so a new session always returns the release to its locked state.
 */
export const DOWNLOAD_UNLOCK_STORAGE_KEY = "5d-selector-showdown-download-unlocked-session-v1";
export const DOWNLOAD_UNLOCK_STORAGE_VALUE = "chain-break-complete-session-v1";
export const LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS = [
  "5d-selector-showdown-download-unlocked",
  "5d-selector-showdown-download-unlocked-v1",
  "5d-selector-showdown-download-unlocked-v2",
  "5d-selector-showdown-download-unlocked-v3",
  "5d-selector-showdown-download-unlocked-v4",
  "5d-selector-showdown-download-unlocked-v5",
] as const;

export type ReleaseUnlockProof = "chain-break-complete";

export function isReleaseUnlockStored(value: string | null): boolean {
  return value === DOWNLOAD_UNLOCK_STORAGE_VALUE;
}

export function isReleaseUnlockProof(proof: string): proof is ReleaseUnlockProof {
  return proof === "chain-break-complete";
}
