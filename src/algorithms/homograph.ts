import { MixedScriptResult, HomographResult } from '../types/index';

/**
 * Classifies a single character into its Unicode script block.
 * Uses code point ranges — no external libraries.
 * Returns: Latin, Cyrillic, Greek, Armenian, Hebrew, Arabic, CJK, or Other.
 * Implemented in Phase 2 — P2-C3.
 */
export function classifyUnicodeBlock(char: string): string {
  // TODO Phase 2 P2-C3: char.codePointAt(0) compared against Unicode ranges
  void char;
  return 'Unknown';
}

/**
 * Detects whether a domain mixes multiple Unicode scripts.
 * Skips dots and hyphens, classifies each character, returns isMixed
 * if more than one distinct script is found.
 * Implemented in Phase 2 — P2-C4.
 */
export function detectMixedScript(domain: string): MixedScriptResult {
  // TODO Phase 2 P2-C4: iterate chars, classify, collect unique scripts
  void domain;
  return { isMixed: false, scripts: [] };
}

/**
 * Returns whether a domain is suspicious due to homograph patterns.
 * Delegates to detectMixedScript.
 * Implemented in Phase 3 — P3-C2.
 */
export function isSuspicious(domain: string): HomographResult {
  // TODO Phase 3 P3-C2: call detectMixedScript, flag if isMixed is true
  void domain;
  return { flagged: false, scripts: [] };
}
