const statusEl = document.querySelector('#status');
async function activeVkTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try { if (/(^|\.)vk\.(com|ru)$/.test(new URL(tab.url).hostname)) return tab; } catch {}
  return null;
}
async function inject(tab) {
  try { await chrome.tabs.sendMessage(tab.id, { type: 'flow:open' }); }
  catch {
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['shared/mix-math.js', 'content.js'] });
  }
}
document.querySelector('#open').onclick = async () => {
  const tab = await activeVkTab();
  if (!tab) { await chrome.tabs.create({ url: 'https://vk.com/audio' }); return; }
  await inject(tab);
  statusEl.textContent = 'Подключаю библиотеку VK к FLOW…';
  await chrome.tabs.sendMessage(tab.id, { type: 'flow:open' });
  window.close();
};
document.querySelector('#reset').onclick = async () => { const tab = await activeVkTab(); if (tab) await chrome.tabs.sendMessage(tab.id, { type: 'flow:app-stop' }).catch(() => {}); statusEl.textContent = 'Поток остановлен'; };
