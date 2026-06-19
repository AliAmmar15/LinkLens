import { addToWhitelist } from '../storage/storage.js';

interface FlaggedEntry { hostname: string; riskType: string; matchedDomain: string | null; }
interface GetResultsResponse { results: FlaggedEntry[]; }
interface WarningDismissedMessage { type: 'WARNING_DISMISSED'; hostname: string; }

/**
 * Updates the popup count using the number of currently displayed warnings.
 */
function updateFlaggedCount(countEl: HTMLElement, listEl: HTMLElement): void {
  const count = listEl.querySelectorAll('li').length;

  if (count === 0) {
    countEl.textContent = 'No suspicious links detected.';
    countEl.style.color = '#27ae60';
  } else {
    countEl.textContent = `${count} suspicious link${count === 1 ? '' : 's'} detected`;
    countEl.style.color = '#c0392b';
  }
}

/**
 * Removes the dismissed hostname from the popup warning list.
 */
function removeListEntry(hostname: string, countEl: HTMLElement, listEl: HTMLElement): void {
  const entries = Array.from(listEl.querySelectorAll<HTMLLIElement>('li[data-hostname]'));
  const entry = entries.find(item => item.dataset['hostname'] === hostname);

  entry?.remove();
  updateFlaggedCount(countEl, listEl);
}

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  const countEl = document.getElementById('scan-count')!;
  const listEl = document.getElementById('flagged-list')!;
  const input = document.getElementById('whitelist-input') as HTMLInputElement;
  const btn = document.getElementById('whitelist-btn') as HTMLButtonElement;

  // Receive warning-dismissal updates from the active page's content script.
  chrome.runtime.onMessage.addListener((message: WarningDismissedMessage) => {
    if (message.type === 'WARNING_DISMISSED') {
      removeListEntry(message.hostname, countEl, listEl);
    }
  });

  // Query the active tab and ask its content script for scan results
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    countEl.textContent = 'No active tab found.';
    return;
  }

  let results: FlaggedEntry[] = [];
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_RESULTS' }) as GetResultsResponse;
    results = response?.results ?? [];
  } catch {
    countEl.textContent = 'Page not yet scanned — try reloading.';
    return;
  }

  if (results.length === 0) {
    updateFlaggedCount(countEl, listEl);
  } else {
    for (const entry of results) {
      const li = document.createElement('li');
      li.dataset['hostname'] = entry.hostname;
      li.style.cssText = 'padding:4px 0;border-bottom:1px solid #eee;font-size:13px;';

      const badge = document.createElement('span');
      badge.style.cssText = [
        'display:inline-block', 'margin-right:6px', 'padding:1px 5px',
        'font-size:11px', 'font-weight:bold', 'color:#fff',
        'background-color:#c0392b', 'border-radius:3px',
      ].join(';');
      badge.textContent = entry.riskType === 'typosquat' ? 'TYPOSQUAT' : 'HOMOGRAPH';

      const host = document.createElement('span');
      host.textContent = entry.hostname;

      li.appendChild(badge);
      li.appendChild(host);

      if (entry.riskType === 'typosquat' && entry.matchedDomain) {
        const hint = document.createElement('span');
        hint.style.cssText = 'color:#888;font-size:11px;margin-left:6px;';
        hint.textContent = `(looks like ${entry.matchedDomain})`;
        li.appendChild(hint);
      }

      listEl.appendChild(li);
    }

    updateFlaggedCount(countEl, listEl);
  }

  btn.addEventListener('click', async (): Promise<void> => {
    const domain = input.value.trim();
    if (domain) {
      await addToWhitelist(domain);
      input.value = '';
      btn.textContent = 'Added!';
      setTimeout(() => { btn.textContent = 'Add to whitelist'; }, 1500);
    }
  });
});
