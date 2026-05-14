import { TyposquatResult } from '../types/index';

/**
 * Normalizes a domain for comparison.
 * Strips TLD, removes www prefix, lowercases.
 * Implemented in Phase 2 — P2-C1.
 */
export function normalizeInput(domain: string): string {
  // TODO Phase 2 P2-C1: lowercase, remove www., strip TLD after last dot
  return domain;
}

/**
 * Computes the Damerau-Levenshtein distance between two strings.
 * Handles insertions, deletions, substitutions, and transpositions.
 * Implemented in Phase 2 — P2-C2.
 */
export function computeDistance(a: string, b: string): number {
  // TODO Phase 2 P2-C2: full DP matrix with transpositions
  void a; void b;
  return 0;
}

/**
 * Checks whether a domain is a typosquat of any trusted domain.
 * Flags if min Damerau-Levenshtein distance is between 1 and 2 inclusive.
 * Implemented in Phase 3 — P3-C1.
 */
export function isTyposquat(domain: string, trustedDomains: string[]): TyposquatResult {
  // TODO Phase 3 P3-C1: normalize, compute distances, flag if min distance 1-2
  void domain; void trustedDomains;
  return { flagged: false, matchedDomain: null, score: 0 };
}
