/**
 * 5D release gate: Jersh remains locked unless the current arcade chain break
 * explicitly emits this proof. Versioned storage invalidates stale prior builds.
 */
export const DOWNLOAD_UNLOCK_STORAGE_KEY = "5d-selector-showdown-download-unlocked-v2";
export const DOWNLOAD_UNLOCK_STORAGE_VALUE = "chain-break-complete-v2";

export type ReleaseUnlockProof = "chain-break-complete";

export function isReleaseUnlockStored(value: string | null): boolean {
  return value === DOWNLOAD_UNLOCK_STORAGE_VALUE;
}

export function isReleaseUnlockProof(proof: string): proof is ReleaseUnlockProof {
  return proof === "chain-break-complete";
}
