import type { ScanMessage, ScanResponse } from '../types/index';

/**
 * Scans all hyperlinks on the page for phishing risk.
 * Sends hostnames to the service worker and injects warning badges on flagged links.
 * Implementation across Phase 2 (P2-C7) and Phase 3 (P3-C5, P3-C6).
 */
async function scanPageLinks(): Promise<void> {
  // TODO Phase 3 P3-C5: send SCAN_DOMAIN to service worker via chrome.runtime.sendMessage
  // TODO Phase 3 P3-C6: inject warning badge on anchors where result.isFlagged is true

  // suppress unused import until Phase 3
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
  links.forEach(({ hostname }) => {
    console.log(`LinkLens: ${hostname}`);
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
