const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

const extensionPath = path.resolve(__dirname, '..');
const browserPath = process.env.FLOW_BROWSER || '/Applications/Arc.app/Contents/MacOS/Arc';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-library-'));
const tuples = [
  JSON.stringify([101, 1, '', 'Metadata Track One', 'FLOW Test']),
  JSON.stringify([102, 1, '', 'Metadata Track Two', 'FLOW Test'])
];
const pageHtml = `<!doctype html><style>body{margin:0}.vk-row{width:700px;height:60px;margin:8px}</style>
  <div class="vk-row" data-audio='${tuples[0]}'></div>
  <div class="vk-row" data-audio='${tuples[1]}'></div>`;

(async () => {
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: browserPath,
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, '--no-first-run']
  });
  try {
    await context.route('https://vk.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: pageHtml }));
    let workers = context.serviceWorkers();
    if (!workers.length) workers = [await context.waitForEvent('serviceworker', { timeout: 15000 })];
    const worker = workers.find(item => item.url().startsWith('chrome-extension://'));
    assert.ok(worker, 'FLOW service worker did not start');
    const page = await context.newPage();
    await page.goto('https://vk.com/audio');
    await page.waitForSelector('#flow-launcher', { timeout: 15000 });
    const tabId = await worker.evaluate(async url => (await chrome.tabs.query({ url }))[0]?.id, page.url());
    await worker.evaluate(id => chrome.tabs.sendMessage(id, { type: 'flow:open' }), tabId);
    const frame = page.frameLocator('#flow-frame');
    await frame.locator('#libraryCount').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const frame = document.querySelector('#flow-frame');
      return Number.parseInt(frame?.contentDocument?.querySelector('#libraryCount')?.textContent || '0', 10) >= 2;
    }, null, { timeout: 15000 });
    assert.equal(await page.locator('.flow-action').count(), 2);
    console.log(JSON.stringify({ ok: true, tracks: await frame.locator('.track-row').count() }));
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
