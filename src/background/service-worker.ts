import type { ScanMessage, RiskResult } from '../types/index.js';
import { isTyposquat } from '../algorithms/levenshtein.js';
import { isSuspicious } from '../algorithms/homograph.js';
import { getTrustedDomains, isWhitelisted } from '../storage/storage.js';

/**
 * Main message listener for the LinkLens service worker.
 * Handles SCAN_DOMAIN messages and responds with a RiskResult.
 * Full implementation in Phase 3 — P3-C3.
 */
chrome.runtime.onMessage.addListener(
  (message: ScanMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void): boolean => {
    if (message.type === 'SCAN_DOMAIN') {
      (async () => {
        const whitelisted = await isWhitelisted(message.domain);
        if (whitelisted) {
          const clean: RiskResult = { domain: message.domain, isFlagged: false, riskType: 'clean', score: 0, matchedTrustedDomain: null };
          sendResponse({ result: clean });
          return;
        }

        const trustedDomains = await getTrustedDomains();
        const typosquatResult = isTyposquat(message.domain, trustedDomains);
        const homographResult = isSuspicious(message.domain);

        let riskResult: RiskResult;
        if (homographResult.flagged) {
          riskResult = { domain: message.domain, isFlagged: true, riskType: 'homograph', score: 0, matchedTrustedDomain: null };
        } else if (typosquatResult.flagged) {
          riskResult = { domain: message.domain, isFlagged: true, riskType: 'typosquat', score: typosquatResult.score, matchedTrustedDomain: typosquatResult.matchedDomain };
        } else {
          riskResult = { domain: message.domain, isFlagged: false, riskType: 'clean', score: 0, matchedTrustedDomain: null };
        }

        sendResponse({ result: riskResult });
      })();
    }
    return true; // keep channel open for async response
  }
);

console.log('LinkLens service worker started.');
