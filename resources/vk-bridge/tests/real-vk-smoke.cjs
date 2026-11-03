const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const extensionPath = require('node:path').resolve(__dirname, '..');
const profile = process.env.FLOW_REAL_PROFILE;
const executablePath = process.env.FLOW_ARC_BROWSER || '/Applications/Arc.app/Contents/MacOS/Arc';
const realVkUrl = process.env.FLOW_REAL_URL || 'https://vk.ru/audios90101628';
if (!profile) throw new Error('FLOW_REAL_PROFILE is required');

(async () => {
  const context = await chromium.launchPersistentContext(profile, {
    executablePath,
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });
  try {
    let workers = context.serviceWorkers();
    if (!workers.length) workers = [await context.waitForEvent('serviceworker', { timeout: 20000 })];
    const worker = workers.find(item => item.url().startsWith('chrome-extension://'));
    assert.ok(worker, 'FLOW service worker did not start');
    const page = context.pages()[0] || await context.newPage();
    await page.goto(realVkUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(9000);
    assert.doesNotMatch(page.url(), /login\.php|challenge\.html/, 'isolated Arc profile is not authenticated in VK');
    assert.equal(await page.locator('text=Вход ВКонтакте').count(), 0, 'isolated Arc profile is not authenticated in VK');
    const tab = await worker.evaluate(async url => (await chrome.tabs.query({ url: `${new URL(url).origin}/*` })).find(item => item.url === url) || (await chrome.tabs.query({ active: true }))[0], page.url());
    assert.ok(tab?.id, 'real VK tab was not found');
    const identity = await worker.evaluate(async tabId => {
      await executeMainWithRetry(tabId, { files: ['page-source.js'] });
      const result = await executeMainWithRetry(tabId, { func: () => {
        const rows = [...new Set([...document.querySelectorAll('.audio_row,[data-testid="audio_row"],[data-audio],[data-testentitytag="audio"],[class*="AudioRow__root"],[class*="AudioRow"],time,button,[role="button"]')].flatMap(node => {
          const parents = []; for (let current = node, depth = 0; current && depth < 8; current = current.parentElement, depth += 1) parents.push(current); return parents;
        }))];
        for (const row of rows) {
          const value = window.__flowVkSource.identityFromRow(row);
          if (value?.id && value?.ownerId) return { identity: value, rows: rows.length };
        }
        return { identity: null, rows: rows.length };
      }});
      return result?.[0]?.result;
    }, tab.id);
    assert.ok(identity?.identity, `real VK rendered ${identity?.rows || 0} rows but no playable identity`);
    const resolved = await worker.evaluate(({ tabId, value }) => resolveVkAudioIdentity(tabId, value), { tabId: tab.id, value: identity.identity });
    assert.equal(resolved?.ok, true, resolved?.error || 'real VK resolver failed');
    assert.match(resolved.mediaUrl, /^https?:\/\//);
    const session = await worker.evaluate(({ tabId, url }) => startDualSession(tabId, url), { tabId: tab.id, url: page.url() });
    assert.equal(session?.ok, true, session?.error || 'dual session failed');
    const key = `real:${identity.identity.ownerId}_${identity.identity.id}`;
    const prepared = await worker.evaluate(({ shadowTabId, command }) => sendTabWithRetry(shadowTabId, { type: 'flow:deck-command', command }, 25000), { shadowTabId: session.shadowTabId, command: { action: 'load', key, identity: identity.identity, currentTime: 0, playing: false } });
    assert.equal(prepared?.ok, true, prepared?.error || 'real shadow deck preload failed');
    await worker.evaluate(({ shadowTabId }) => sendTabWithRetry(shadowTabId, { type: 'flow:deck-command', command: { action: 'set-volume', value: 0, play: true } }, 10000), { shadowTabId: session.shadowTabId });
    await page.waitForTimeout(1200);
    const state = await worker.evaluate(({ shadowTabId }) => sendTabWithRetry(shadowTabId, { type: 'flow:deck-command', command: { action: 'state' } }, 10000), { shadowTabId: session.shadowTabId });
    assert.equal(state?.ready, true, 'real shadow deck is not ready');
    assert.equal(state?.paused, false, 'real shadow deck did not start');
    assert.ok(Number(state.currentTime) > .05, 'real shadow deck time did not progress');
    await worker.evaluate(({ shadowTabId }) => sendTabWithRetry(shadowTabId, { type: 'flow:deck-command', command: { action: 'stop' } }, 5000), { shadowTabId: session.shadowTabId }).catch(() => {});
    console.log(JSON.stringify({ ok: true, version: await worker.evaluate(() => chrome.runtime.getManifest().version), authenticated: true, rows: identity.rows, resolver: { stage: resolved.stage, format: resolved.format, host: new URL(resolved.mediaUrl).hostname }, shadow: { ready: state.ready, progressed: Number(state.currentTime) > .05 } }));
  } finally {
    await context.close();
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
