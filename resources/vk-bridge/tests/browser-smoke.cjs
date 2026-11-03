const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright-core');

const extensionPath = path.resolve(__dirname, '..');
const executablePath = process.env.FLOW_BROWSER || '/Applications/Arc.app/Contents/MacOS/Arc';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-browser-'));

function wavTone(hertz, bpm = 120, seconds = 24) {
  const rate = 22050;
  const samples = rate * seconds;
  const body = Buffer.alloc(samples * 2);
  const beat = rate * 60 / bpm;
  for (let index = 0; index < samples; index += 1) {
    const phase = index % beat;
    const kick = phase < rate * .09 ? Math.sin(index * 2 * Math.PI * 58 / rate) * Math.exp(-phase / (rate * .025)) : 0;
    const tone = Math.sin(index * 2 * Math.PI * hertz / rate) * .13;
    body.writeInt16LE(Math.round(Math.max(-1, Math.min(1, tone + kick * .72)) * 32767), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + body.length, 4); header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(body.length, 40);
  return Buffer.concat([header, body]);
}

const testAudio = { '/flow-test-1.wav': wavTone(196, 120), '/flow-test-2.wav': wavTone(247, 126) };

const tupleOne = JSON.stringify([101, 1, 'https://vk.com/flow-test-1.wav', 'Neon Test One', 'FLOW Lab']);
const tupleTwo = JSON.stringify([102, 1, 'https://vk.com/flow-test-2.wav', 'Neon Test Two', 'FLOW Lab']);
const mockVk = `<!doctype html><html><head><meta charset="utf-8"><title>FLOW browser test</title>
<style>body{font:16px system-ui;background:#111;color:white;margin:0;padding:40px}.audio_row{width:720px;height:64px;margin:12px;padding:10px;background:#222}.audio_row__play_btn{width:44px;height:44px}.audio_row__title_inner,.audio_row__performer{display:inline-block;margin:12px}</style></head>
<body><h1>Моя музыка</h1><audio preload="auto"></audio>
<div class="audio_row" data-track-id="1_101" data-audio='${tupleOne}'><button class="audio_row__play_btn" data-src="https://vk.com/flow-test-1.wav" aria-label="Воспроизвести"></button><span class="audio_row__title_inner">Neon Test One</span><span class="audio_row__performer">FLOW Lab</span></div>
<div class="audio_row" data-track-id="1_102" data-audio='${tupleTwo}'><button class="audio_row__play_btn" data-src="https://vk.com/flow-test-2.wav" aria-label="Воспроизвести"></button><span class="audio_row__title_inner">Neon Test Two</span><span class="audio_row__performer">FLOW Lab</span></div>
<script>const player=document.querySelector('audio');document.querySelectorAll('.audio_row__play_btn').forEach(button=>button.addEventListener('click',async()=>{document.querySelectorAll('.audio_row').forEach(row=>{row.dataset.playing='false';row.querySelector('button').setAttribute('aria-label','Воспроизвести')});const row=button.closest('.audio_row');row.dataset.playing='true';button.setAttribute('aria-label','Пауза');player.src=button.dataset.src;player.loop=true;await player.play()}));</script>
</body></html>`;
(async () => {
  const context = await chromium.launchPersistentContext(profile, {
    executablePath,
    headless: false,
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
    console.log('browser: launched');
    const routeVk = route => {
      const requestUrl = new URL(route.request().url());
      const pathname = requestUrl.pathname;
      if (testAudio[pathname]) return route.fulfill({ status: 200, contentType: 'audio/wav', body: testAudio[pathname] });
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: mockVk });
    };
    await context.route('https://vk.com/**', routeVk);
    await context.route('https://vk.ru/**', routeVk);
    let workers = context.serviceWorkers();
    if (!workers.length) workers = [await context.waitForEvent('serviceworker', { timeout: 15000 })];
    const worker = workers[0];
    console.log('browser: service worker ready');
    const extensionId = new URL(worker.url()).host;
    const manifest = await worker.evaluate(() => chrome.runtime.getManifest());
    assert.equal(manifest.version, '4.3.0');

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#open');
    assert.equal(await popup.locator('#open').textContent(), 'Включить FLOW');
    assert.match(await popup.locator('#status').textContent(), /автоматически/);
    console.log('browser: popup ready');

    const controller = await context.newPage();
    await controller.goto('https://vk.com/audio');
    await controller.waitForSelector('.flow-action', { timeout: 15000 });
    const controllerTabId = await worker.evaluate(async url => (await chrome.tabs.query({ url }))[0].id, controller.url());
    const shadowCreated = context.waitForEvent('page', { timeout: 15000 });
    const [session, shadowPage] = await Promise.all([
      worker.evaluate(tabId => startDualSession(tabId, 'https://vk.com/audio'), controllerTabId),
      shadowCreated
    ]);
    assert.equal(session.ok, true, session.error);
    await shadowPage.goto('https://vk.com/audio?flow-shadow-test=1');
    await shadowPage.waitForSelector('#flow-launcher', { state: 'attached', timeout: 15000 });
    await shadowPage.reload();
    await shadowPage.waitForSelector('#flow-launcher', { state: 'attached', timeout: 15000 });
    await shadowPage.waitForFunction(() => getComputedStyle(document.querySelector('#flow-launcher')).display === 'none', null, { timeout: 10000 });
    console.log('browser: independent shadow tab ready');

    await worker.evaluate(tabId => chrome.tabs.sendMessage(tabId, { type: 'flow:open' }), controllerTabId);
    const frame = controller.frameLocator('#flow-frame');
    await frame.locator('#startParty').waitFor({ state: 'visible', timeout: 15000 });
    const liveFrame = controller.frames().find(item => item.url().includes('/live/index.html'));
    assert.ok(liveFrame, 'FLOW iframe did not load');
    await liveFrame.waitForFunction(() => Number.parseInt(document.querySelector('#libraryCount')?.textContent || '0', 10) >= 2, null, { timeout: 15000 });
    const count = Number.parseInt(await frame.locator('#libraryCount').textContent(), 10);
    assert.ok(count >= 2, `expected at least two tracks, got ${count}`);
    assert.equal(await controller.locator('.flow-action').count(), 2);
    console.log('browser: FLOW frame scanned the collection');

    await frame.locator('#startParty').click();
    await liveFrame.waitForFunction(() => document.querySelector('#startParty span')?.textContent === 'Поток запущен', null, { timeout: 15000 });
    await controller.waitForFunction(() => { const audio = document.querySelector('audio'); return audio && !audio.paused && audio.currentTime > .05; }, null, { timeout: 15000 });
    await shadowPage.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio?.paused && audio.currentTime < .4 && /flow-test-2\.wav/.test(audio.currentSrc || audio.src);
    }, null, { timeout: 15000 });
    console.log('browser: first track plays on Deck A and Deck B is preloaded');

    await frame.locator('#jumpTransition').evaluate(button => button.click());
    await shadowPage.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused && /flow-test-2\.wav/.test(audio.currentSrc || audio.src);
    }, null, { timeout: 15000 });
    await frame.locator('.manual-drawer').evaluate(drawer => { drawer.open = true; });
    await controller.waitForTimeout(320);
    const outgoing = await controller.locator('audio').evaluate(audio => ({ paused: audio.paused, volume: audio.volume, time: audio.currentTime }));
    const incoming = await shadowPage.locator('audio').evaluate(audio => ({ paused: audio.paused, volume: audio.volume, time: audio.currentTime }));
    assert.equal(outgoing.paused, false);
    assert.equal(incoming.paused, false);
    assert.ok(outgoing.volume > 0 && outgoing.volume < 1, `outgoing volume ${outgoing.volume}`);
    assert.ok(incoming.volume > 0 && incoming.volume < 1, `incoming volume ${incoming.volume}`);
    await frame.locator('#manualSeekB').evaluate(input => { input.value = '5'; input.dispatchEvent(new Event('change', { bubbles: true })); });
    await shadowPage.waitForFunction(() => document.querySelector('audio')?.currentTime >= 4.8, null, { timeout: 5000 });
    await frame.locator('#manualCrossfader').evaluate(input => { input.value = '.5'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await controller.waitForTimeout(180);
    const manualA = await controller.locator('audio').evaluate(audio => ({ volume: audio.volume, time: audio.currentTime }));
    const manualB = await shadowPage.locator('audio').evaluate(audio => ({ volume: audio.volume, time: audio.currentTime }));
    assert.ok(Math.abs(manualA.volume - Math.SQRT1_2) < .04, `manual A volume ${manualA.volume}`);
    assert.ok(Math.abs(manualB.volume - Math.SQRT1_2) < .04, `manual B volume ${manualB.volume}`);
    assert.ok(manualB.time >= 4.8, `manual B seek ${manualB.time}`);
    console.log('browser: manual seek and equal-power crossfader confirmed');
    const mixer = await popup.evaluate(async () => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const state = await chrome.runtime.sendMessage({ type: 'get-mixer-state' });
        if (state?.spectrum?.active && state.spectrum.bands?.some(value => value > .001)) return state;
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      return chrome.runtime.sendMessage({ type: 'get-mixer-state' });
    });
    assert.equal(mixer.spectrum.active, true);
    assert.ok(mixer.spectrum.bands.some(value => value > .001), 'merged spectrum is silent');
    console.log('browser: real overlap and merged spectrum confirmed');

    const allTabs = await worker.evaluate(() => chrome.tabs.query({}));
    console.log('browser: tabs', JSON.stringify(allTabs.map(tab => ({ id: tab.id, url: tab.url, pinned: tab.pinned }))));
    const vkTabs = allTabs.filter(tab => /^https:\/\/vk\.(?:com|ru)\//.test(tab.url || ''));
    assert.ok(vkTabs.length >= 2, `expected two VK tabs, got ${vkTabs.length}`);
    assert.ok(vkTabs.some(tab => tab.id === session.shadowTabId && tab.pinned), 'shadow VK tab is not pinned');
    await controller.screenshot({ path: path.join(extensionPath, 'FLOW-v4-browser.png'), fullPage: false });
    console.log(JSON.stringify({ ok: true, version: manifest.version, extensionId, tracks: count, vkTabs: vkTabs.length, overlap: { outgoing, incoming }, manual: { a: manualA, b: manualB }, spectrum: { rms: mixer.spectrum.rms, bpm: mixer.spectrum.detectedBpm } }));
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
