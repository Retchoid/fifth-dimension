/** Sanitizes the only user-facing value retained on the public arcade board. */
export function sanitizeSelectorTag(rawName: string) {
  return rawName.trim().replace(/[^a-z0-9 _-]/gi, "").slice(0, 12).toUpperCase();
}

/** A saved Level 1 tag has priority; otherwise use an optional final-screen tag. */
export function resolveFinaleTag(savedTag: string, finalScreenTag: string) {
  return sanitizeSelectorTag(savedTag) || sanitizeSelectorTag(finalScreenTag);
}
