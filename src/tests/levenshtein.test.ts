import { describe, it, expect } from 'vitest';
import { normalizeInput, computeDistance, isTyposquat } from '../algorithms/levenshtein.js';

// ─── P4-3: normalizeInput() ───────────────────────────────────────────────────
// Independent paths:
//   Path 1 — www prefix present → strip it
//   Path 2 — uppercase letters → lowercase
//   Path 3 — TLD present → strip from last dot
//   Path 4 — no TLD, no www → return as-is (lowercased)
//   Path 5 — subdomain + multi-part TLD → strips only from last dot

describe('normalizeInput', () => {
  it('Path 1 — strips www. prefix', () => {
    // Input: 'www.google.com' | Expected: 'google'
    const actual = normalizeInput('www.google.com');
    expect(actual).toBe('google');
  });

  it('Path 2 — lowercases uppercase input', () => {
    // Input: 'PayPal.com' | Expected: 'paypal'
    const actual = normalizeInput('PayPal.com');
    expect(actual).toBe('paypal');
  });

  it('Path 3 — strips TLD from plain domain', () => {
    // Input: 'github.io' | Expected: 'github'
    const actual = normalizeInput('github.io');
    expect(actual).toBe('github');
  });

  it('Path 4 — no dot, no www → returns lowercased string unchanged', () => {
    // Input: 'localhost' | Expected: 'localhost'
    const actual = normalizeInput('localhost');
    expect(actual).toBe('localhost');
  });

  it('Path 5 — strips only from last dot (multi-part TLD)', () => {
    // Input: 'sub.domain.co.uk' | Expected: 'domain' (last dot strips .uk, then last dot strips .co)
    // Actually normalizeInput strips from the last dot only once:
    // 'sub.domain.co.uk' → lastDot at index of '.uk' → 'sub.domain.co'
    // The spec says strip from last dot onward → 'sub.domain.co'
    // But based on implementation: lastIndexOf('.') → strips '.uk' → 'sub.domain.co'
    const actual = normalizeInput('sub.domain.co.uk');
    expect(actual).toBe('sub.domain.co');
  });

  it('Path 5b — www + TLD both stripped, case-folded', () => {
    // Input: 'www.Google.com' | Expected: 'google'
    const actual = normalizeInput('www.Google.com');
    expect(actual).toBe('google');
  });
});

// ─── P4-1: computeDistance() ─────────────────────────────────────────────────
// Independent paths:
//   Path 1 — a is empty → return b.length
//   Path 2 — b is empty → return a.length
//   Path 3 — identical strings → 0
//   Path 4 — one substitution
//   Path 5 — one transposition (adjacent swap)
//   Path 6 — one deletion
//   Path 7 — one insertion
//   Path 8 — multiple edits (longer distance)

describe('computeDistance', () => {
  it('Path 1 — empty a returns length of b', () => {
    // Input: ('', 'abc') | Expected: 3
    expect(computeDistance('', 'abc')).toBe(3);
  });

  it('Path 2 — empty b returns length of a', () => {
    // Input: ('abc', '') | Expected: 3
    expect(computeDistance('abc', '')).toBe(3);
  });

  it('Path 3 — identical strings return 0', () => {
    // Input: ('same', 'same') | Expected: 0
    expect(computeDistance('same', 'same')).toBe(0);
  });

  it('Path 4 — one substitution', () => {
    // Input: ('paypal', 'paypol') | Expected: 1
    // 'a' → 'o' at position 5
    expect(computeDistance('paypal', 'paypol')).toBe(1);
  });

  it('Path 5 — one transposition (adjacent swap)', () => {
    // Input: ('google', 'goggle') | Expected: 1
    // 'oo' swapped to 'og' (two chars transposed)
    expect(computeDistance('google', 'goggle')).toBe(1);
  });

  it('Path 6 — one deletion', () => {
    // Input: ('amazon', 'amazn') | Expected: 1
    // 'o' deleted
    expect(computeDistance('amazon', 'amazn')).toBe(1);
  });

  it('Path 7 — one insertion', () => {
    // Input: ('github', 'githubb') | Expected: 1
    // extra 'b' inserted
    expect(computeDistance('github', 'githubb')).toBe(1);
  });

  it('Path 8 — multiple edits, larger distance', () => {
    // Input: ('abc', 'xyz') | Expected: 3 (all three chars substituted)
    expect(computeDistance('abc', 'xyz')).toBe(3);
  });
});

// ─── P4-2: isTyposquat() ─────────────────────────────────────────────────────
// Independent paths:
//   Path 1 — empty trustedDomains array → always clean
//   Path 2 — distance 0 (exact match after normalize) → flagged: false
//   Path 3 — distance 1 → flagged: true
//   Path 4 — distance 2 → flagged: true
//   Path 5 — distance ≥ 3 → flagged: false
//   Path 6 — domain with www + TLD normalized before comparison
//   Path 7 — matchedDomain returned correctly on typosquat

describe('isTyposquat', () => {
  it('Path 1 — empty trusted list returns clean result', () => {
    // Input: ('anything.com', []) | Expected: { flagged: false, matchedDomain: null, score: 0 }
    const result = isTyposquat('anything.com', []);
    expect(result.flagged).toBe(false);
    expect(result.matchedDomain).toBeNull();
    expect(result.score).toBe(0);
  });

  it('Path 2 — exact match (distance 0) returns flagged: false', () => {
    // Input: ('google.com', ['google']) | Expected: flagged: false, score: 0
    const result = isTyposquat('google.com', ['google']);
    expect(result.flagged).toBe(false);
    expect(result.score).toBe(0);
  });

  it('Path 3 — distance 1 returns flagged: true', () => {
    // Input: ('paypol.com', ['paypal']) | Expected: flagged: true, score: 1
    const result = isTyposquat('paypol.com', ['paypal']);
    expect(result.flagged).toBe(true);
    expect(result.score).toBe(1);
  });

  it('Path 4 — distance 2 returns flagged: true', () => {
    // Input: ('g00gle.com', ['google']) | Expected: flagged: true, score: 2
    const result = isTyposquat('g00gle.com', ['google']);
    expect(result.flagged).toBe(true);
    expect(result.score).toBe(2);
  });

  it('Path 5 — distance ≥ 3 returns flagged: false', () => {
    // Input: ('xkcd.com', ['google']) | Expected: flagged: false, matchedDomain: null
    const result = isTyposquat('xkcd.com', ['google']);
    expect(result.flagged).toBe(false);
    expect(result.matchedDomain).toBeNull();
  });

  it('Path 6 — www prefix and TLD are stripped before comparison', () => {
    // Input: ('www.amazom.com', ['amazon']) | Expected: flagged: true (distance 1)
    const result = isTyposquat('www.amazom.com', ['amazon']);
    expect(result.flagged).toBe(true);
    expect(result.score).toBe(1);
  });

  it('Path 7 — matchedDomain is the closest trusted domain', () => {
    // Input: ('githubb.com', ['paypal', 'github', 'google'])
    // Expected: matchedDomain: 'github' (distance 1, closest)
    const result = isTyposquat('githubb.com', ['paypal', 'github', 'google']);
    expect(result.flagged).toBe(true);
    expect(result.matchedDomain).toBe('github');
  });
});
