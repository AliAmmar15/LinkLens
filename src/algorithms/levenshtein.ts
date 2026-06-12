import { TyposquatResult } from '../types/index.js';

/**
 * Normalizes a domain for comparison.
 * Strips TLD, removes www prefix, lowercases.
 * Implemented in Phase 2 — P2-C1.
 */
export function normalizeInput(domain: string): string {
  let d = domain.toLowerCase();
  if (d.startsWith('www.')) d = d.slice(4);
  const lastDot = d.lastIndexOf('.');
  if (lastDot !== -1) d = d.slice(0, lastDot);
  return d;
}

/**
 * Computes the Damerau-Levenshtein distance between two strings.
 * Handles insertions, deletions, substitutions, and transpositions.
 * Implemented in Phase 2 — P2-C2.
 */
export function computeDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[rows - 1][cols - 1];
}

/**
 * Checks whether a domain is a typosquat of any trusted domain.
 * Flags if min Damerau-Levenshtein distance is between 1 and 2 inclusive.
 * Implemented in Phase 3 — P3-C1.
 */
export function isTyposquat(domain: string, trustedDomains: string[]): TyposquatResult {
  if (trustedDomains.length === 0) return { flagged: false, matchedDomain: null, score: 0 };

  const normalized = normalizeInput(domain);
  let minDistance = Infinity;
  let closestDomain = '';

  for (const trusted of trustedDomains) {
    const dist = computeDistance(normalized, normalizeInput(trusted));
    if (dist < minDistance) {
      minDistance = dist;
      closestDomain = trusted;
    }
  }

  if (minDistance === 0) return { flagged: false, matchedDomain: closestDomain, score: 0 };
  if (minDistance <= 2) return { flagged: true, matchedDomain: closestDomain, score: minDistance };
  return { flagged: false, matchedDomain: null, score: minDistance };
}
