import { addToWhitelist } from '../storage/storage.js';

interface FlaggedEntry { hostname: string; riskType: string; matchedDomain: string | null; }
interface GetResultsResponse { results: FlaggedEntry[]; }

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  const countEl = document.getElementById('scan-count')!;
  const listEl = document.getElementById('flagged-list')!;
  const input = document.getElementById('whitelist-input') as HTMLInputElement;
  const btn = document.getElementById('whitelist-btn') as HTMLButtonElement;

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
    countEl.textContent = 'No suspicious links detected.';
    countEl.style.color = '#27ae60';
  } else {
    countEl.textContent = `${results.length} suspicious link${results.length === 1 ? '' : 's'} detected`;
    countEl.style.color = '#c0392b';

    for (const entry of results) {
      const li = document.createElement('li');
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
