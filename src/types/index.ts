// Risk types
export type RiskType = 'typosquat' | 'homograph' | 'clean';

// The result returned by the scanner for any given domain
export interface RiskResult {
  domain: string;
  isFlagged: boolean;
  riskType: RiskType;
  score: number; // Levenshtein distance or 0 for homograph
  matchedTrustedDomain: string | null; // closest trusted domain if typosquat
}

// A single entry in the user's personal whitelist
export interface WhitelistEntry {
  domain: string;
  addedAt: number; // Unix timestamp in ms
}

// Message sent from content script to service worker
export interface ScanMessage {
  type: 'SCAN_DOMAIN';
  domain: string;
}

// Response sent back from service worker to content script
export interface ScanResponse {
  result: RiskResult;
}

// Return type of isTyposquat()
export interface TyposquatResult {
  flagged: boolean;
  matchedDomain: string | null;
  score: number;
}

// Return type of detectMixedScript()
export interface MixedScriptResult {
  isMixed: boolean;
  scripts: string[];
}

// Return type of isSuspicious()
export interface HomographResult {
  flagged: boolean;
  scripts: string[];
}

// Union of all message types (extendable in future phases)
export type ExtensionMessage = ScanMessage;
