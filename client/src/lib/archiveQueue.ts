export function nextArchiveQueueIndex(currentIndex: number, queueLength: number): number {
  if (!Number.isInteger(queueLength) || queueLength <= 0) return 0;
  const normalizedIndex = Number.isInteger(currentIndex) ? currentIndex : 0;
  return (normalizedIndex + 1 + queueLength) % queueLength;
}

export function archiveQueueProgressPercent(currentTime: number, duration: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}
