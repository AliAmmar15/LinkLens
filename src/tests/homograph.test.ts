import { describe, it, expect } from 'vitest';
import { classifyUnicodeBlock, detectMixedScript, isSuspicious } from '../algorithms/homograph.js';

describe('classifyUnicodeBlock', () => {
  it('classifies lowercase Latin letter', () => {
    expect(classifyUnicodeBlock('a')).toBe('Latin');
  });

  it('classifies uppercase Latin letter', () => {
    expect(classifyUnicodeBlock('Z')).toBe('Latin');
  });

  it('classifies Cyrillic small a (\\u0430)', () => {
    expect(classifyUnicodeBlock('а')).toBe('Cyrillic');
  });

  it('classifies Greek small alpha (\\u03B1)', () => {
    expect(classifyUnicodeBlock('α')).toBe('Greek');
  });

  it('classifies Latin A (\\u0041)', () => {
    expect(classifyUnicodeBlock('A')).toBe('Latin');
  });

  it('returns Skip for dot', () => {
    expect(classifyUnicodeBlock('.')).toBe('Skip');
  });

  it('returns Skip for hyphen', () => {
    expect(classifyUnicodeBlock('-')).toBe('Skip');
  });

  it('returns Skip for digit', () => {
    expect(classifyUnicodeBlock('4')).toBe('Skip');
  });
});

describe('detectMixedScript', () => {
  it('returns isMixed false for all-Latin domain', () => {
    const result = detectMixedScript('google');
    expect(result.isMixed).toBe(false);
    expect(result.scripts).toEqual(['Latin']);
  });

  it('returns isMixed true for Latin + Cyrillic domain', () => {
    // 'g' + Cyrillic о + 'g' + Cyrillic о + 'le'
    const result = detectMixedScript('gоgоle');
    expect(result.isMixed).toBe(true);
    expect(result.scripts).toContain('Latin');
    expect(result.scripts).toContain('Cyrillic');
  });

  it('returns isMixed false for hyphenated all-Latin domain', () => {
    const result = detectMixedScript('pay-pal');
    expect(result.isMixed).toBe(false);
    expect(result.scripts).toEqual(['Latin']);
  });

  it('returns isMixed false for all-Cyrillic domain', () => {
    const result = detectMixedScript('абв');
    expect(result.isMixed).toBe(false);
    expect(result.scripts).toEqual(['Cyrillic']);
  });

  it('returns isMixed true for Latin + Greek domain', () => {
    const result = detectMixedScript('aα');
    expect(result.isMixed).toBe(true);
    expect(result.scripts).toContain('Latin');
    expect(result.scripts).toContain('Greek');
  });
});

describe('isSuspicious', () => {
  it('returns flagged false for clean Latin domain', () => {
    expect(isSuspicious('google').flagged).toBe(false);
  });

  it('returns flagged true for Latin + Cyrillic domain', () => {
    expect(isSuspicious('gоgоle').flagged).toBe(true);
  });

  it('returns flagged false for all-Latin domain', () => {
    expect(isSuspicious('paypal').flagged).toBe(false);
  });

  it('returns flagged true for Latin + Greek domain', () => {
    expect(isSuspicious('aαb').flagged).toBe(true);
  });
});
