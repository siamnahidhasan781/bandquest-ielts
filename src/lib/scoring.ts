/**
 * BandQuest IELTS — Scoring utilities
 */

/** IELTS raw-to-band conversion (approximate, Academic). Clearly labelled as approximate. */
export function rawToBand(raw: number, total: number): number {
  const pct = total ? raw / total : 0;
  if (pct >= 0.95) return 9;
  if (pct >= 0.9) return 8.5;
  if (pct >= 0.82) return 8;
  if (pct >= 0.75) return 7.5;
  if (pct >= 0.67) return 7;
  if (pct >= 0.6) return 6.5;
  if (pct >= 0.52) return 6;
  if (pct >= 0.42) return 5.5;
  if (pct >= 0.32) return 5;
  if (pct >= 0.22) return 4.5;
  return 4;
}
