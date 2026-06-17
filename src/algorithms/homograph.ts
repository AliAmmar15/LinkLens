import { MixedScriptResult, HomographResult } from '../types/index.js';
//Digits often used in Homograph attacks
const LOOKALIKE_DIGITS = new Set([
  '0',
  '1',
  '3',
  '4',
  '5',
  '7',
  '8'
]);
/**
 * Classifies a single character into its Unicode script block.
 * Uses code point ranges — no external libraries.
 * Returns: Latin, Cyrillic, Greek, Armenian, Hebrew, Arabic, CJK, or Other.
 * Implemented in Phase 2 — P2-C3.
 */
export function classifyUnicodeBlock(char: string): string {
  if (char === '.' || char === '-' || char === '_') return 'Skip';
  if (char >= '0' && char <= '9') return 'Digit';  const cp = char.codePointAt(0);
  if (cp === undefined) return 'Other';
  if ((cp >= 0x0041 && cp <= 0x007A) || (cp >= 0x00C0 && cp <= 0x024F)) return 'Latin';
  if (cp >= 0x0400 && cp <= 0x04FF) return 'Cyrillic';
  if (cp >= 0x0370 && cp <= 0x03FF) return 'Greek';
  if (cp >= 0x0530 && cp <= 0x058F) return 'Armenian';
  if (cp >= 0x0590 && cp <= 0x05FF) return 'Hebrew';
  if (cp >= 0x0600 && cp <= 0x06FF) return 'Arabic';
  if (cp >= 0x4E00 && cp <= 0x9FFF) return 'CJK';
  return 'Other';
}

/**
 * Detects whether a domain mixes multiple Unicode scripts.
 * Skips dots and hyphens, classifies each character, returns isMixed
 * if more than one distinct script is found.
 * Implemented in Phase 2 — P2-C4.
 */
export function detectMixedScript(domain: string): MixedScriptResult {
  const scripts = new Set<string>();
  for (const char of domain) {
    const block = classifyUnicodeBlock(char);
    if (
      block !== 'Skip' &&
      block !== 'Other' &&
      block !== 'Digit'
) {
      scripts.add(block);
}
  }
  const scriptList = Array.from(scripts);
  return { isMixed: scriptList.length > 1, scripts: scriptList };
}
/**
 * Detects numeric homograph substitutions commonly used in phishing.
 * Properly marks them as potential attacks.
 */
export function containsNumericHomograph(domain: string): boolean {
  for (const char of domain) {
    if (LOOKALIKE_DIGITS.has(char)) {
      return true;
    }
  }

  return false;
}
/**
 * Returns whether a domain is suspicious due to homograph patterns.
 * Delegates to detectMixedScript.
 * Implemented in Phase 3 — P3-C2.
 */
export function isSuspicious(domain: string): HomographResult {
  const result = detectMixedScript(domain);

  const numericHomograph =
    containsNumericHomograph(domain);

  return {flagged: result.isMixed ||numericHomograph, scripts: result.scripts};
}
