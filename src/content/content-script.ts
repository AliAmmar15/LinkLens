// Inlined types — no import/export allowed in content scripts (injected as classic scripts)
interface RiskResult { domain: string; isFlagged: boolean; riskType: string; score: number; matchedTrustedDomain: string | null; }
interface ScanMessage { type: 'SCAN_DOMAIN'; domain: string; }
interface ScanResponse { result: RiskResult; }
interface FlaggedEntry { hostname: string; riskType: string; matchedDomain: string | null; }

// Stores results so the popup can request them via message
let linkLensResults: FlaggedEntry[] = [];

/**
 * Scans all hyperlinks on the page for phishing risk.
 * Deduplicates hostnames, sends one message per unique hostname,
 * then injects warning badges on flagged anchors.
 */
async function scanPageLinks(): Promise<void> {
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));

  const hostnameMap = new Map<string, HTMLAnchorElement[]>();
  for (const anchor of anchors) {
    try {
      const url = new URL(anchor.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
      const list = hostnameMap.get(url.hostname) ?? [];
      list.push(anchor);
      hostnameMap.set(url.hostname, list);
    } catch {
      // malformed URL — skip
    }
  }

  const hostnames = Array.from(hostnameMap.keys());
  console.log(`LinkLens: found ${anchors.length} links, ${hostnames.length} unique hostnames to scan`);

  const results = await Promise.all(
    hostnames.map(hostname =>
      new Promise<{ hostname: string; result: RiskResult }>(resolve => {
        const message: ScanMessage = { type: 'SCAN_DOMAIN', domain: hostname };
        chrome.runtime.sendMessage(message, (response: ScanResponse) => {
          resolve({ hostname, result: response.result });
        });
      })
    )
  );

  const flagged = results.filter(r => r.result.isFlagged);
  console.log(`LinkLens: scan complete — ${flagged.length} flagged hostname(s) found`);

  // Store results for the popup
  linkLensResults = flagged.map(f => ({
    hostname: f.hostname,
    riskType: f.result.riskType,
    matchedDomain: f.result.matchedTrustedDomain,
  }));

  // Inject badges on all anchors matching a flagged hostname
  for (const { hostname, result } of flagged) {
    const matchingAnchors = hostnameMap.get(hostname) ?? [];
    for (const anchor of matchingAnchors) {
      if (anchor.dataset['linklens']) continue;
      anchor.dataset['linklens'] = 'flagged';

      const badge = document.createElement('span');
      badge.style.cssText = [
        'display:inline-block', 'margin-left:4px', 'padding:1px 5px',
        'font-size:11px', 'font-weight:bold', 'color:#ffffff',
        'background-color:#c0392b', 'border-radius:3px',
        'vertical-align:middle', 'cursor:default', 'font-family:system-ui,sans-serif',
      ].join(';');

      badge.textContent =
        result.riskType === 'typosquat' ? '⚠ TYPOSQUAT' :
        result.riskType === 'homograph' ? '⚠ HOMOGRAPH' : '⚠ SUSPICIOUS';

      badge.title =
        result.riskType === 'typosquat'
          ? `Possible typosquat of ${result.matchedTrustedDomain}`
          : `Mixed Unicode scripts detected`;

      anchor.insertAdjacentElement('afterend', badge);
    }
  }
}

// Reply to popup requests for scan results
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_RESULTS') {
    sendResponse({ results: linkLensResults });
  }
  return true;
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { void scanPageLinks(); });
} else {
  void scanPageLinks();
}
