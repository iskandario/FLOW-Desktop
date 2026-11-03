const VK_URLS = ['https://vk.com/*', 'https://*.vk.com/*', 'https://vk.ru/*', 'https://*.vk.ru/*'];
let offscreenCreation = null;
let desktopBridgeConfigPromise = null;

async function desktopBridgeConfig() {
  if (!desktopBridgeConfigPromise) {
    desktopBridgeConfigPromise = fetch(chrome.runtime.getURL('desktop-bridge-config.json'))
      .then(response => {
        if (!response.ok) throw new Error('FLOW Desktop bridge config is missing');
        return response.json();
      });
  }
  return desktopBridgeConfigPromise;
}

async function desktopBridgeFetch(route, init = {}) {
  const config = await desktopBridgeConfig();
  const headers = new Headers(init.headers || {});
  headers.set('authorization', `Bearer ${config.token}`);
  const response = await fetch(`${config.baseUrl}${route}`, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `FLOW Desktop bridge HTTP ${response.status}`);
  return data;
}

async function executeMainWithRetry(tabId, details, timeout = 10000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeout) {
    try {
      await chrome.tabs.get(tabId);
      return await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', ...details });
    } catch (error) {
      lastError = error;
      if (!/frame|document|navigation|receiving end/i.test(error?.message || '')) throw error;
      await new Promise(resolve => setTimeout(resolve, 280));
    }
  }
  throw lastError || new Error('VK вкладка не стабилизировалась');
}

async function getDualSession() {
  const stored = await chrome.storage.session.get('flowDualSession').catch(() => ({}));
  return stored.flowDualSession || null;
}

async function waitForTab(tabId, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (tab?.status === 'complete') return tab;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  throw new Error('Фоновая вкладка VK не загрузилась');
}

async function sendTabWithRetry(tabId, message, timeout = 12000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeout) {
    try { return await chrome.tabs.sendMessage(tabId, message); }
    catch (error) { lastError = error; await new Promise(resolve => setTimeout(resolve, 180)); }
  }
  throw lastError || new Error('Deck-вкладка не отвечает');
}

async function startDualSession(controllerTabId, sourceUrl) {
  const previous = await getDualSession();
  if (previous?.shadowTabId) {
    const shadow = await chrome.tabs.get(previous.shadowTabId).catch(() => null);
    if (shadow && previous.controllerTabId === controllerTabId) {
      await sendTabWithRetry(controllerTabId, { type: 'flow:set-role', role: 'controller' }).catch(() => {});
      await sendTabWithRetry(shadow.id, { type: 'flow:set-role', role: 'shadow' }).catch(() => {});
      return { ok: true, ...previous, reused: true };
    }
    if (shadow) await chrome.tabs.remove(shadow.id).catch(() => {});
  }
  const controller = await chrome.tabs.get(controllerTabId);
  const url = sourceUrl || controller.url;
  if (!/^https:\/\/(?:[^/]+\.)?vk\.(?:com|ru)\//i.test(url || '')) throw new Error('Открой музыку VK перед запуском FLOW');
  const shadow = await chrome.tabs.create({ url, active: false, pinned: true });
  await waitForTab(shadow.id);
  const session = { controllerTabId, shadowTabId: shadow.id, createdAt: Date.now() };
  await chrome.storage.session.set({ flowDualSession: session });
  await sendTabWithRetry(controllerTabId, { type: 'flow:set-role', role: 'controller' }).catch(() => {});
  await sendTabWithRetry(shadow.id, { type: 'flow:set-role', role: 'shadow' });
  return { ok: true, ...session };
}

async function forwardShadowCommand(controllerTabId, command) {
  let session = await getDualSession();
  if (!session || session.controllerTabId !== controllerTabId) {
    const controller = await chrome.tabs.get(controllerTabId);
    session = await startDualSession(controllerTabId, controller.url);
  }
  const shadow = await chrome.tabs.get(session.shadowTabId).catch(() => null);
  if (!shadow) {
    const controller = await chrome.tabs.get(controllerTabId);
    session = await startDualSession(controllerTabId, controller.url);
  }
  return sendTabWithRetry(session.shadowTabId, { type: 'flow:deck-command', command });
}

async function ensureOffscreen() {
  if ((await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })).length) return;
  if (!offscreenCreation) {
    offscreenCreation = chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['AUDIO_PLAYBACK', 'USER_MEDIA'], justification: 'Analyze VK tab audio and keep seamless playback alive between pages' }).finally(() => { offscreenCreation = null; });
  }
  await offscreenCreation;
}

async function getTabDecks() {
  const stored = await chrome.storage.local.get('flowTabDecks');
  const decks = stored.flowTabDecks || {};
  let changed = false;
  for (const name of ['a', 'b']) {
    if (!decks[name]) continue;
    const tabExists = await chrome.tabs.get(decks[name].tabId).catch(() => null);
    if (!tabExists) { delete decks[name]; changed = true; }
  }
  if (changed) await chrome.storage.local.set({ flowTabDecks: decks });
  return decks;
}

async function connectTabDeck(deck, tabId, title) {
  if (!['a', 'b'].includes(deck)) throw new Error('Неизвестная дека');
  const tab = await chrome.tabs.get(tabId);
  if (!/^https:\/\/(?:[^/]+\.)?vk\.(?:com|ru)\//i.test(tab.url || '')) throw new Error('Открой музыку VK в этой вкладке');
  const decks = await getTabDecks();
  const other = deck === 'a' ? 'b' : 'a';
  if (decks[other]?.tabId === tabId) throw new Error(`Эта вкладка уже подключена как deck ${other.toUpperCase()}. Для второй деки нужна другая вкладка VK.`);
  const captured = await chrome.tabCapture.getCapturedTabs();
  const active = captured.some(item => item.tabId === tabId && (item.status === 'active' || item.status === 'pending'));
  if (active && decks[deck]?.tabId === tabId) return { ok: true, already: true, decks };
  if (active) throw new Error('Эта вкладка уже захватывается. Сначала сбрось деки.');
  await ensureOffscreen();
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
  const result = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'start-capture-deck', deck, streamId, tabId, title: title || tab.title });
  if (!result?.ok) throw new Error(result?.error || 'Не удалось получить звук вкладки');
  decks[deck] = { tabId, title: title || tab.title, connectedAt: Date.now() };
  await chrome.storage.local.set({ flowTabDecks: decks });
  await sendTabWithRetry(tabId, { type: 'flow:set-captured-deck', deck }).catch(() => {});
  return { ok: true, decks };
}

async function loadTabDeck(message) {
  const decks = await getTabDecks();
  const target = decks[message.deck];
  if (!target) throw new Error(`Сначала открой вторую вкладку VK и подключи её как deck ${String(message.deck).toUpperCase()} через иконку FLOW`);
  const played = await sendTabWithRetry(target.tabId, { type: 'flow:play-captured-track', key: message.key, currentTime: Number(message.currentTime || 0), analysisMode: Boolean(message.analysisMode) }, 15000);
  if (!played?.ok) throw new Error(played?.error || `VK не запустил трек на deck ${String(message.deck).toUpperCase()}`);
  const updated = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'update-capture-deck', deck: message.deck, key: message.key, title: played.state?.title || message.title, artist: played.state?.artist || message.artist, analysisMode: Boolean(message.analysisMode), state: played.state });
  if (!updated?.ok) throw new Error(updated?.error || 'Микшер не принял состояние деки');
  return { ok: true, tabDeck: true, state: played.state };
}

async function controlTabDeck(message) {
  const decks = await getTabDecks();
  const target = decks[message.deck];
  if (!target) throw new Error(`Deck ${String(message.deck).toUpperCase()} не подключён`);
  return sendTabWithRetry(target.tabId, { type: 'flow:captured-transport', action: message.action, currentTime: message.currentTime, rate: message.rate });
}

async function startTabAnalysis(tabId) {
  await ensureOffscreen();
  const captured = await chrome.tabCapture.getCapturedTabs();
  if (captured.some(item => item.tabId === tabId && !['stopped', 'error'].includes(item.status))) {
    return { ok: true, reused: true };
  }
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
  const result = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'start-tab-analysis', streamId, tabId });
  if (!result?.ok) throw new Error(result?.error || 'Не удалось подключить анализ звука вкладки');
  return { ok: true };
}

async function loadBackgroundDeck(message) {
  if (!['a', 'b'].includes(message.deck)) throw new Error('Неверный аудиобуфер');
  if (!/^https?:/.test(message.url || '')) throw new Error('VK не отдал прямой media URL');
  await ensureOffscreen();
  const loaded = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'start-url-deck', deck: message.deck, url: message.url, currentTime: Number(message.currentTime || 0), key: message.key, title: message.title, artist: message.artist, analysisMode: Boolean(message.analysisMode), deferOutput: Boolean(message.deferOutput) });
  if (!loaded?.ok) throw new Error(loaded?.error || 'Аудиодвижок не загрузил трек');
  await chrome.storage.local.set({ [`flow_deck_${message.deck}`]: { key: message.key, title: message.title, artist: message.artist } });
  return { ok: true };
}

async function captureVkMedia(tabId, message) {
  const target = { tabId };
  await chrome.debugger.attach(target, '1.3');
  try {
    await chrome.debugger.sendCommand(target, 'Network.enable');
    await chrome.debugger.sendCommand(target, 'Network.setCacheDisabled', { cacheDisabled: true });
    let finishMedia;
    const mediaPromise = new Promise(resolve => { finishMedia = resolve; });
    const listener = (source, method, params) => {
      if (source.tabId !== tabId || method !== 'Network.responseReceived') return;
      const url = params.response?.url || '';
      const mime = params.response?.mimeType || '';
      if (params.type === 'Media' || /^audio\//i.test(mime) || /vkuseraudio|\.mp3(?:\?|$)|\.m4a(?:\?|$)|\.aac(?:\?|$)/i.test(url)) {
        if (/\.m3u8(?:\?|$)/i.test(url)) finishMedia(url);
        else fallbackMedia = url;
      }
    };
    chrome.debugger.onEvent.addListener(listener);
    let fallbackMedia = '';
    for (const [type, extra] of [['mouseMoved', {}], ['mousePressed', { button: 'left', clickCount: 1 }], ['mouseReleased', { button: 'left', clickCount: 1 }]]) {
      await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type, x: message.x, y: message.y, ...extra });
    }
    const mediaUrl = await Promise.race([mediaPromise, new Promise(resolve => setTimeout(() => resolve(fallbackMedia), 5500))]);
    chrome.debugger.onEvent.removeListener(listener);
    if (mediaUrl) {
      // Restore VKMASH's working hand-off: stop the native player after capture.
      // Only FLOW's independent deck will remain audible.
      await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: message.x, y: message.y, button: 'left', clickCount: 1 }).catch(() => {});
      await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: message.x, y: message.y, button: 'left', clickCount: 1 }).catch(() => {});
    }
    await chrome.debugger.sendCommand(target, 'Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
    return { ok: Boolean(mediaUrl), mediaUrl, nativeOnly: false, error: mediaUrl ? '' : 'VK не отдал Media URL этого трека' };
  } finally { await chrome.debugger.detach(target).catch(() => {}); }
}

async function playVkNative(tabId, message) {
  const target = { tabId };
  await chrome.debugger.attach(target, '1.3');
  try {
    let x = Number(message.x);
    let y = Number(message.y);
    if (message.key) {
      await chrome.debugger.sendCommand(target, 'DOM.enable').catch(() => {});
      const expression = `(() => {
        const key = ${JSON.stringify(String(message.key))};
        const row = [...document.querySelectorAll('[data-flow-key]')].find(node => node.dataset.flowKey === key);
        if (!row) return null;
        const strategy = ${Math.max(0, Math.min(2, Number(message.strategy || 0)))};
        const selectors = [
          '.audio_row__play_btn,[data-testid="audio_play"],[data-testid="audio_row_play"],[data-testid*="play" i],button[aria-label*="Воспроиз" i],button[aria-label*="Play" i],[role="button"][aria-label*="Воспроиз" i],[role="button"][aria-label*="Play" i],[class*="playButton" i],[class*="play_btn" i]',
          '.audio_row__cover,.audio_row__cover_icon,[class*="cover" i],.audio_row__title_inner,.audio_row__title,[class*="TrackTitle" i]',
          '.audio_row__title_inner,.audio_row__title,[class*="TrackTitle" i]'
        ];
        const candidates = selectors[strategy] ? [...row.querySelectorAll(selectors[strategy])] : [row];
        const target = candidates.find(node => !node.closest('.flow-action,a[download],[data-download],[class*="download" i],[class*="save" i]') && !/more|menu|action|like|add|share|download|save|скач/i.test(String(node.className || '') + ' ' + String(node.getAttribute?.('aria-label') || '')) && node.getBoundingClientRect().width > 4 && node.getBoundingClientRect().height > 4) || null;
        if (!target) return null;
        target.scrollIntoView({ block: 'center', inline: 'nearest' });
        return target;
      })()`;
      const evaluated = await chrome.debugger.sendCommand(target, 'Runtime.evaluate', { expression, returnByValue: false, awaitPromise: false }).catch(() => null);
      const objectId = evaluated?.result?.objectId;
      if (objectId) {
        await chrome.debugger.sendCommand(target, 'DOM.scrollIntoViewIfNeeded', { objectId }).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 120));
        const model = await chrome.debugger.sendCommand(target, 'DOM.getBoxModel', { objectId }).catch(() => null);
        const quad = model?.model?.content || model?.model?.border;
        if (quad?.length >= 8) {
          x = (quad[0] + quad[2] + quad[4] + quad[6]) / 4;
          y = (quad[1] + quad[3] + quad[5] + quad[7]) / 4;
        }
        await chrome.debugger.sendCommand(target, 'Runtime.releaseObject', { objectId }).catch(() => {});
      }
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('VK не показал кнопку трека даже после повторного поиска');
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await new Promise(resolve => setTimeout(resolve, 90));
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, buttons: 1 });
    await new Promise(resolve => setTimeout(resolve, 24));
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1, buttons: 0 });
    return { ok: true, mediaUrl: '', nativeOnly: true };
  } finally {
    await chrome.debugger.detach(target).catch(() => {});
  }
}

async function resolveAndPlayVkTrack(tabId, key) {
  await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', files: ['page-source.js'] });
  const pageResults = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    args: [String(key || '')],
    func: key => window.__flowVkSource.resolve(key)
  });
  const result = pageResults?.[0]?.result || { ok: false, error: 'VK не вернул данные строки' };
  return result;
}

async function resolveVkAudioIdentity(tabId, identity) {
  await executeMainWithRetry(tabId, { files: ['page-source.js'] });
  const pageResults = await executeMainWithRetry(tabId, {
    args: [identity || {}],
    func: value => window.__flowVkSource.resolveIdentity(value)
  });
  return pageResults?.[0]?.result || { ok: false, error: 'VK resolver не вернул результат' };
}

async function readVkTrackIdentity(tabId, key) {
  await executeMainWithRetry(tabId, { files: ['page-source.js'] });
  const results = await executeMainWithRetry(tabId, {
    args: [String(key || '')],
    func: targetKey => {
      const row = [...document.querySelectorAll('[data-flow-key]')].find(node => node.dataset.flowKey === targetKey);
      return row ? window.__flowVkSource.identityFromRow(row) : null;
    }
  });
  return results?.[0]?.result || null;
}

async function harvestVkIdentities(tabId) {
  await executeMainWithRetry(tabId, { files: ['page-source.js'] });
  const results = await executeMainWithRetry(tabId, {
    func: () => {
      let count = 0;
      for (const row of document.querySelectorAll('[data-flow-key]:not([data-flow-identity])')) {
        const identity = window.__flowVkSource.identityFromRow(row);
        if (!identity?.id || !identity?.ownerId) continue;
        const { id, ownerId, actionHash, urlHash, accessKey } = identity;
        row.dataset.flowIdentity = JSON.stringify({ id, ownerId, actionHash, urlHash, accessKey });
        count++;
      }
      return count;
    }
  });
  return results?.[0]?.result || 0;
}

async function vkTabForDesktop() {
  const tabs = await chrome.tabs.query({ url: VK_URLS });
  const tab = tabs.find(value => value.active) || tabs[0];
  if (!tab?.id) throw new Error('Открой VK Music через кнопку VK CONNECT');
  if (/\/challenge/.test(tab.url || '')) throw new Error('VK просит подтвердить, что ты не робот — пройди проверку в окне VK и повтори');
  return tab;
}

// VK API methods the desktop app may call through the signed-in VK tab.
// Read-only: listing, searching and fetching streams of the user's music.
const DESKTOP_API_METHODS = new Set(['audio.get', 'audio.getById', 'audio.search', 'audio.getPlaylists', 'audio.getPlaylistById', 'catalog.getAudioSearch', 'catalog.getSection']);

async function callVkApi(method, params) {
  if (!DESKTOP_API_METHODS.has(method)) throw new Error(`VK API ${method} недоступен FLOW`);
  const tab = await vkTabForDesktop();
  const results = await executeMainWithRetry(tab.id, {
    args: [method, params || {}],
    func: async (name, values) => {
      if (!window.vkApi?.api) return { ok: false, error: 'VK API ещё не загрузился в окне VK' };
      try {
        return { ok: true, response: await window.vkApi.api(name, { ...values, v: '5.204' }) };
      } catch (error) {
        const text = error?.message || error?.error_msg || error?.error?.error_msg || (typeof error === 'string' ? error : JSON.stringify(error));
        return { ok: false, error: `VK API ${name}: ${String(text).slice(0, 200)}` };
      }
    }
  });
  const result = results?.[0]?.result;
  if (!result?.ok) throw new Error(result?.error || `VK API ${method} не ответил`);
  return result.response;
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message?.type === 'flow-desktop-api') {
    callVkApi(String(message.method || ''), message.params).then(response => reply({ ok: true, response })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-harvest-identities') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false }); return; }
    harvestVkIdentities(tabId).then(count => reply({ ok: true, count })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-resolve-identity') {
    // One reload_audio call in the open VK tab: no page loads for a track
    // whose ID FLOW already learned.
    (async () => {
      const tab = await vkTabForDesktop();
      const result = await resolveVkAudioIdentity(tab.id, message.identity);
      if (!result?.ok || !result.mediaUrl) throw new Error(result?.error || 'VK не вернул аудиопоток');
      return result;
    })().then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-resolve-match') {
    (async () => {
      const tab = await vkTabForDesktop();
      return sendTabWithRetry(tab.id, { type: 'flow:desktop-resolve-match', title: message.title, artist: message.artist }, 40000);
    })().then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-resolve-direct') {
    (async () => {
      const tab = await vkTabForDesktop();
      const result = await sendTabWithRetry(tab.id, { type: 'flow:desktop-resolve-track', key: message.key }, 35000);
      if (!result?.ok || !result.mediaUrl) throw new Error(result?.error || 'VK не вернул аудиопоток');
      return result;
    })().then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-publish-library') {
    desktopBridgeFetch('/v1/library', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tracks: message.tracks || [], context: message.context || {} })
    }).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-poll') {
    desktopBridgeFetch('/v1/commands').then(reply).catch(error => reply({ ok: false, commands: [], error: error.message }));
    return true;
  }
  if (message?.type === 'flow-desktop-upload') {
    (async () => {
      const response = await fetch(message.mediaUrl, { redirect: 'follow', cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error(`VK audio export failed: HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      return desktopBridgeFetch(`/v1/jobs/${encodeURIComponent(message.jobId)}/audio`, {
        method: 'POST',
        headers: {
          'content-type': response.headers.get('content-type') || 'audio/mpeg',
          'x-flow-title': message.title || '',
          'x-flow-artist': message.artist || ''
        },
        body: bytes
      });
    })().then(reply).catch(async error => {
      await desktopBridgeFetch(`/v1/jobs/${encodeURIComponent(message.jobId)}/error`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      }).catch(() => {});
      reply({ ok: false, error: error.message });
    });
    return true;
  }
  if (message?.type === 'flow-desktop-error') {
    desktopBridgeFetch(`/v1/jobs/${encodeURIComponent(message.jobId)}/error`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: message.error || 'VK bridge failed' })
    }).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-get-role') {
    const tabId = sender.tab?.id;
    getDualSession().then(session => reply({ ok: true, role: session?.shadowTabId === tabId ? 'shadow' : 'controller', session: Boolean(session) })).catch(error => reply({ ok: false, role: 'controller', error: error.message }));
    return true;
  }
  if (message?.type === 'flow-resolve-audio') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена shadow-вкладка VK' }); return; }
    resolveVkAudioIdentity(tabId, message.identity).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-read-track-identity') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена основная вкладка VK' }); return; }
    readVkTrackIdentity(tabId, message.key).then(identity => reply({ ok: Boolean(identity), identity, error: identity ? '' : 'VK не отдал identity трека из React' })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-get-tab-decks') {
    getTabDecks().then(decks => reply({ ok: true, decks })).catch(error => reply({ ok: false, decks: {}, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-connect-tab-deck') {
    connectTabDeck(message.deck, Number(message.tabId), message.title).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-load-tab-deck') {
    loadTabDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-control-captured-deck') {
    controlTabDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-update-captured-state') {
    chrome.storage.local.get('flowTabDecks').then(stored => {
      const decks = stored.flowTabDecks || {};
      const deck = ['a', 'b'].find(name => decks[name]?.tabId === sender.tab?.id);
      if (!deck) return { ok: false };
      return chrome.runtime.sendMessage({ target: 'offscreen', type: 'capture-deck-state', deck, state: message.state }).then(() => ({ ok: true }));
    }).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-prime-audio') {
    ensureOffscreen()
      .then(() => chrome.runtime.sendMessage({ target: 'offscreen', type: 'prime-audio' }))
      .then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-start-dual-session') {
    const tabId = Number(message.tabId || sender.tab?.id);
    if (!tabId) { reply({ ok: false, error: 'Не найдена основная вкладка VK' }); return; }
    startDualSession(tabId, message.url).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-shadow-command') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Команда пришла не из вкладки VK' }); return; }
    forwardShadowCommand(tabId, message.command).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-native-spectrum') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Спектр пришёл не из вкладки VK' }); return; }
    getDualSession().then(async session => {
      const deck = session?.controllerTabId === tabId ? 'a' : session?.shadowTabId === tabId ? 'b' : null;
      if (!deck) return { ok: false, error: 'Вкладка не входит в текущую FLOW-сессию' };
      await ensureOffscreen();
      return chrome.runtime.sendMessage({ target: 'offscreen', type: 'native-spectrum', deck, data: message.data || {} });
    }).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-start-tab-analysis') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    startTabAnalysis(tabId).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-start-tab-analysis-for-tab') {
    const tabId = Number(message.tabId);
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    startTabAnalysis(tabId).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-tab-mute') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    chrome.tabs.get(tabId)
      .then(tab => chrome.tabs.update(tabId, { muted: Boolean(message.muted) }).then(() => reply({ ok: true, previousMuted: Boolean(tab.mutedInfo?.muted) })))
      .catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-storage-get') {
    chrome.storage.local.get(message.keys).then(value => reply({ ok: true, value })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'flow-storage-set') {
    chrome.storage.local.set(message.value || {}).then(() => reply({ ok: true })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'trusted-click') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    captureVkMedia(tabId, message).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'trusted-play') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    playVkNative(tabId, message).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'vk-resolve-and-play') {
    const tabId = sender.tab?.id;
    if (!tabId) { reply({ ok: false, error: 'Не найдена вкладка VK' }); return; }
    resolveAndPlayVkTrack(tabId, message.key).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'load-background-deck') {
    loadBackgroundDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'stop-all') {
    (async () => {
      const decks = await getTabDecks();
      await Promise.all(['a', 'b'].map(name => decks[name] ? sendTabWithRetry(decks[name].tabId, { type: 'flow:captured-transport', action: 'pause' }, 2500).catch(() => {}) : null));
      await ensureOffscreen();
      await chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop-all' });
      await chrome.storage.local.remove(['flow_deck_a', 'flow_deck_b', 'flowTabDecks']);
      const stored = await chrome.storage.local.get('flowMutedTab');
      if (stored.flowMutedTab) await chrome.tabs.update(stored.flowMutedTab, { muted: false }).catch(() => {});
      await chrome.storage.local.remove('flowMutedTab');
      return { ok: true };
    })().then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === 'reset-decks') {
    (async () => {
      const decks = await getTabDecks();
      await Promise.all(['a', 'b'].map(name => decks[name] ? sendTabWithRetry(decks[name].tabId, { type: 'flow:captured-transport', action: 'pause' }, 2500).catch(() => {}) : null));
      await ensureOffscreen();
      await chrome.runtime.sendMessage({ target: 'offscreen', type: 'reset-decks' });
      return { ok: true };
    })().then(reply).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
});

async function inject() {
  for (const tab of await chrome.tabs.query({ url: VK_URLS })) {
    try {
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['shared/mix-math.js', 'content.js'] });
    } catch {}
  }
}
chrome.runtime.onInstalled.addListener(inject);
chrome.runtime.onStartup.addListener(inject);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;
  getDualSession().then(session => {
    if (session?.shadowTabId === tabId) sendTabWithRetry(tabId, { type: 'flow:set-role', role: 'shadow' }).catch(() => {});
    if (session?.controllerTabId === tabId) sendTabWithRetry(tabId, { type: 'flow:set-role', role: 'controller' }).catch(() => {});
  }).catch(() => {});
});
chrome.tabs.onRemoved.addListener(tabId => {
  getDualSession().then(session => {
    if (!session || (session.shadowTabId !== tabId && session.controllerTabId !== tabId)) return;
    if (session.controllerTabId === tabId && session.shadowTabId) chrome.tabs.remove(session.shadowTabId).catch(() => {});
    chrome.storage.session.remove('flowDualSession').catch(() => {});
  }).catch(() => {});
});
