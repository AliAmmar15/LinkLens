import { WhitelistEntry } from '../types/index';

/**
 * Loads trusted domains from chrome.storage.local.
 * Seeds from trusted-domains.json on first run.
 * Implemented in Phase 2 — P2-C5.
 */
export async function getTrustedDomains(): Promise<string[]> {
  // TODO Phase 2 P2-C5: read 'trustedDomains' key, seed from JSON if missing
  return [];
}

/**
 * Returns the user's whitelist from chrome.storage.local.
 * Implemented in Phase 2 — P2-C6.
 */
export async function getWhitelist(): Promise<WhitelistEntry[]> {
  // TODO Phase 2 P2-C6: read 'whitelist' key, default to []
  return [];
}

/**
 * Adds a domain to the whitelist with current timestamp.
 * Implemented in Phase 3 — P3-C4.
 */
export async function addToWhitelist(domain: string): Promise<void> {
  // TODO Phase 3 P3-C4: load whitelist, push { domain, addedAt: Date.now() }, save
  void domain;
}

/**
 * Removes a domain from the whitelist.
 * Implemented in Phase 3 — P3-C4.
 */
export async function removeFromWhitelist(domain: string): Promise<void> {
  // TODO Phase 3 P3-C4: load whitelist, filter out domain, save
  void domain;
}

/**
 * Returns true if the domain is in the whitelist.
 * Implemented in Phase 3 — P3-C4.
 */
export async function isWhitelisted(domain: string): Promise<boolean> {
  // TODO Phase 3 P3-C4: load whitelist, return true if domain found
  void domain;
  return false;
}
