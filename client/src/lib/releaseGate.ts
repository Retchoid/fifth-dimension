/**
 * 5D release gate: Jersh remains locked unless the current arcade chain break
 * explicitly emits this proof. Versioned storage invalidates every prior build’s
 * browser state after a gate regression, while retaining post-chain persistence.
 */
export const DOWNLOAD_UNLOCK_STORAGE_KEY = "5d-selector-showdown-download-unlocked-v5";
export const DOWNLOAD_UNLOCK_STORAGE_VALUE = "chain-break-complete-v5";
export const LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS = [
  "5d-selector-showdown-download-unlocked",
  "5d-selector-showdown-download-unlocked-v1",
  "5d-selector-showdown-download-unlocked-v2",
  "5d-selector-showdown-download-unlocked-v3",
  "5d-selector-showdown-download-unlocked-v4",
] as const;

export type ReleaseUnlockProof = "chain-break-complete";

export function isReleaseUnlockStored(value: string | null): boolean {
  return value === DOWNLOAD_UNLOCK_STORAGE_VALUE;
}

export function isReleaseUnlockProof(proof: string): proof is ReleaseUnlockProof {
  return proof === "chain-break-complete";
}
