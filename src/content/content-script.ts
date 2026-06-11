/**
 * Scans all hyperlinks on the page for phishing risk.
 * Sends hostnames to the service worker and injects warning badges on flagged links.
 */
async function scanPageLinks(): Promise<void> {
  const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');

  const links = Array.from(anchors)
    .map(anchor => {
      try {
        const url = new URL(anchor.href);

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return null;
        }

        return {
          anchor,
          hostname: url.hostname,
        };
      } catch {
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
  console.log(`LinkLens: scanning ${links.length} links`);

  const scanPromises = links.map(async ({ anchor, hostname }) => {
    try {
      console.log(`LinkLens: sending SCAN_DOMAIN for ${hostname}`);

      const response = await chrome.runtime.sendMessage({
        type: 'SCAN_DOMAIN',
        domain: hostname,
      });

      console.log(
        `LinkLens: received response for ${hostname}`,
        response
      );

      return {
        anchor,
        hostname,
        result: response.result,
      };
    } catch (error) {
      console.error(
        `LinkLens: failed to scan ${hostname}`,
        error
      );
      return null;
    }
  });

  console.log('LinkLens: waiting for all responses...');

  const results = await Promise.all(scanPromises);

  console.log('LinkLens: all scans completed');

  results.forEach(item => {
    if (!item) {
      return;
    }

    const { anchor, result } = item;
    console.log(result);
    if (!result?.isFlagged) {
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
  void scanPageLinks();
}
