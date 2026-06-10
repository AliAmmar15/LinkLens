import type { ScanMessage, ScanResponse } from '../types/index';

/**
 * Scans all hyperlinks on the page for phishing risk.
 * Sends hostnames to the service worker and injects warning badges on flagged links.
 * Implementation across Phase 2 (P2-C7) and Phase 3 (P3-C5, P3-C6).
 */
async function scanPageLinks(): Promise<void> {

  void ({} as ScanMessage); void ({} as ScanResponse);

  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
  const links = Array.from(anchors)
    .map(anchor => {
      try {
        const url = new URL(anchor.href);

        // Only process HTTP/HTTPS links
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return null;
        }

        return {
          anchor,
          hostname: url.hostname,
        };
      } catch {
        // Ignore malformed URLs
        return null;
      }
    })
    .filter(
      (
        link
      ): link is {
        anchor: HTMLAnchorElement;
        hostname: string;
      } => link !== null
    );

  console.log(`LinkLens: found ${anchors.length} links on this page.`);
  
  const scanPromises = links.map(async ({ anchor, hostname }) => {
    try {
      const response = await chrome.runtime.sendMessage<
        ScanMessage,
        ScanResponse
      >({
        type: 'SCAN_DOMAIN',
        domain: hostname,
      });

      return {
        anchor,
        hostname,
        result: response.result,
      };
    } catch (error) {
      console.error(`LinkLens: failed to scan ${hostname}`, error);
      return null;
    }
  });

  const results = await Promise.all(scanPromises);

  results.forEach(item => {
    if (!item) {
      return;
    }

    const { anchor, result } = item;

    if (!result.isFlagged) {
      return;
    }

    console.log(
      `LinkLens: flagged ${result.domain} (${result.riskType})`
    );

    const badge = document.createElement('span');
    badge.textContent = 'WARNING';

    badge.title =
      result.riskType === 'homograph'
        ? 'Possible homograph attack'
        : `Possible typosquat of ${
            result.matchedTrustedDomain ?? 'trusted domain'
          }`;

    badge.style.marginLeft = '4px';
    badge.style.cursor = 'help';

    anchor.insertAdjacentElement('afterend', badge);
  });
}


// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void scanPageLinks();
  });
} else {
  scanPageLinks();
}
