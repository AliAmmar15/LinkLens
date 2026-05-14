import type { WhitelistEntry } from '../types/index';
import { addToWhitelist } from '../storage/storage';

/**
 * Popup script for the LinkLens browser action.
 * Displays flagged links and lets the user whitelist domains.
 * Full implementation in Phase 4 — P4-C1, P4-C2.
 */
document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  const countEl = document.getElementById('scan-count');
  const listEl = document.getElementById('flagged-list');
  const input = document.getElementById('whitelist-input') as HTMLInputElement;
  const btn = document.getElementById('whitelist-btn') as HTMLButtonElement;

  // suppress unused until Phase 4
  void ({} as WhitelistEntry); void listEl;

  // TODO Phase 4 P4-C2: query active tab via chrome.tabs.query
  // TODO Phase 4 P4-C2: pull flagged link data from content script
  // TODO Phase 4 P4-C2: render count and flagged domains into popup

  if (countEl) countEl.textContent = 'Scan data not yet available.';

  btn.addEventListener('click', async (): Promise<void> => {
    const domain = input.value.trim();
    if (domain) {
      await addToWhitelist(domain);
      input.value = '';
      btn.textContent = 'Added!';
      setTimeout(() => {
        btn.textContent = 'Add to whitelist';
      }, 1500);
    }
  });
});
