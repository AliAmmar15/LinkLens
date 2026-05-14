import type { ScanMessage, RiskResult } from '../types/index';
// Phase 3 imports: isTyposquat (levenshtein), isSuspicious (homograph), getTrustedDomains, isWhitelisted (storage)

/**
 * Main message listener for the LinkLens service worker.
 * Handles SCAN_DOMAIN messages and responds with a RiskResult.
 * Full implementation in Phase 3 — P3-C3.
 */
chrome.runtime.onMessage.addListener(
  (message: ScanMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void): boolean => {
    if (message.type === 'SCAN_DOMAIN') {
      // TODO Phase 3 P3-C3:
      // 1. isWhitelisted(message.domain) — return clean immediately if true
      // 2. getTrustedDomains()
      // 3. isTyposquat(message.domain, trustedDomains)
      // 4. isSuspicious(message.domain)
      // 5. combine results — prefer homograph if both fire
      // 6. sendResponse({ result })

      const placeholder: RiskResult = {
        domain: message.domain,
        isFlagged: false,
        riskType: 'clean',
        score: 0,
        matchedTrustedDomain: null,
      };
      sendResponse({ result: placeholder });
    }
    return true; // keep channel open for async response
  }
);

console.log('LinkLens service worker started.');
