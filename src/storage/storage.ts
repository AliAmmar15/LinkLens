import { WhitelistEntry } from '../types/index.js';

/**
 * Loads trusted domains from chrome.storage.local.
 * Seeds from a hardcoded list on first run.
 */
export async function getTrustedDomains(): Promise<string[]> {
  const result = await chrome.storage.local.get('trustedDomains');
  const stored = result['trustedDomains'] as string[] | undefined;
  if (stored && stored.length > 0) return stored;

  const seeded = [
    'google', 'facebook', 'amazon', 'apple', 'microsoft',
    'paypal', 'netflix', 'instagram', 'twitter', 'github',
    'linkedin', 'youtube', 'reddit', 'wikipedia', 'dropbox',
    'gmail', 'yahoo', 'outlook', 'chase', 'bankofamerica',
    'wellsfargo', 'coinbase', 'binance', 'steam', 'roblox',
    'adobe', 'spotify', 'zoom', 'slack', 'discord',
    'ebay', 'walmart', 'target', 'citibank', 'usbank',
  ];
  await chrome.storage.local.set({ trustedDomains: seeded });
  return seeded;
}

/**
 * Returns the user's whitelist from chrome.storage.local.
 * Returns an empty array if no whitelist has been saved yet.
 */
export async function getWhitelist(): Promise<WhitelistEntry[]> {
  const result = await chrome.storage.local.get('whitelist');
  const stored = result['whitelist'] as WhitelistEntry[] | undefined;
  if (stored && stored.length > 0) return stored;
  return [];
}

/**
 * Adds a domain to the whitelist with the current timestamp.
 * Does nothing if the domain is already whitelisted.
 */
export async function addToWhitelist(domain: string): Promise<void> {
  const normalized = domain.toLowerCase().trim();
  const whitelist = await getWhitelist();
  if (whitelist.some(entry => entry.domain === normalized)) return;
  whitelist.push({ domain: normalized, addedAt: Date.now() });
  await chrome.storage.local.set({ whitelist });
}

/**
 * Removes a domain from the whitelist.
 * Does nothing if the domain is not in the whitelist.
 */
export async function removeFromWhitelist(domain: string): Promise<void> {
  const normalized = domain.toLowerCase().trim();
  const whitelist = await getWhitelist();
  const filtered = whitelist.filter(entry => entry.domain !== normalized);
  await chrome.storage.local.set({ whitelist: filtered });
}

/**
 * Returns true if the domain is in the user's whitelist.
 * Never throws — always returns a boolean.
 */
export async function isWhitelisted(domain: string): Promise<boolean> {
  try {
    const normalized = domain.toLowerCase().trim();
    const whitelist = await getWhitelist();
    return whitelist.some(entry => entry.domain === normalized);
  } catch {
    return false;
  }
}
