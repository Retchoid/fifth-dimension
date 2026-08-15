import {
  DOWNLOAD_UNLOCK_STORAGE_VALUE,
  LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS,
  isReleaseUnlockProof,
  isReleaseUnlockStored,
} from "../client/src/lib/releaseGate";

const storageCases: Array<[string, string | null, boolean]> = [
  ["missing value", null, false],
  ["legacy boolean", "true", false],
  ["wrong current value", "chain-break-complete", false],
  ["previous v2 chain proof", "chain-break-complete-v2", false],
  ["previous v3 chain proof", "chain-break-complete-v3", false],
  ["previous v4 chain proof", "chain-break-complete-v4", false],
  ["durable v5 chain proof", "chain-break-complete-v5", false],
  ["verified chain-break value", DOWNLOAD_UNLOCK_STORAGE_VALUE, true],
];

for (const [label, value, expected] of storageCases) {
  const actual = isReleaseUnlockStored(value);
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

if (!isReleaseUnlockProof("chain-break-complete")) throw new Error("verified proof was rejected");
if (isReleaseUnlockProof("achievement-complete")) throw new Error("unverified proof was accepted");
if (!LEGACY_DOWNLOAD_UNLOCK_STORAGE_KEYS.includes("5d-selector-showdown-download-unlocked-v5")) {
  throw new Error("the prior durable v5 unlock key is not included in the stale-data purge list");
}

console.log("release gate checks passed: stale durable values lock; only a verified current-session chain-break proof restores access.");
