(() => {
  if (window.__flowVkV2) return;
  window.__flowVkV2 = true;
  const APP_URL = chrome.runtime.getURL('app/index.html');
  const rowMap = new Map();
  let shell = null;
  let deepScanPromise = null;
  let scanRunning = false;
  let cacheTimer = null;
  let libraryRevision = 0;
  let persistedRevision = -1;
  let lastPublishedRevision = -1;
  let lastDesktopPublishedRevision = -1;
  let lastDeepScanAt = 0;
  let audioCache = [];
  let audioCacheAt = 0;
  let nativeFallback = null;
  let flowRole = 'controller';
  let shadowDeck = null;
  let capturedDeckName = '';
  let capturedDeck = null;
  let dualShadowReady = false;
  let lastDualSyncAt = 0;
  const LEGACY_NATIVE_ENGINE = false;
  const PAGE_DECK_MIXING = false;
  const pageDecks = { a: null, b: null };
  let pageTransition = null;
  let loadQueue = Promise.resolve();
  const nativeAnalyzers = new WeakMap();
  const volumeAutomation = new WeakMap();

  async function runtime(message) {
    try {
      if (!chrome?.runtime?.id) throw new Error('Extension context invalidated');
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      if (/context invalidated/i.test(error?.message || '')) location.reload();
      throw error;
    }
  }

  function appWindow() { return shell?.querySelector('iframe')?.contentWindow || null; }

  function isVkMusicPage() {
    return /^\/(?:audio(?:s\d+)?|music)(?:\/|$)/i.test(location.pathname);
  }

  function openFlow() {
    if (flowRole === 'controller' && !isVkMusicPage()) {
      // VK does not render the user's collection on /feed. Remember the launch
      // intent across the same-origin navigation and reopen FLOW on VK Music.
      sessionStorage.setItem('flowAutoOpenOnMusic', '1');
      location.assign(`${location.origin}/audio`);
      return;
    }
    if (!shell) {
      shell = document.createElement('aside');
      shell.id = 'flow-frame-wrap';
      shell.innerHTML = `<div id="flow-shell"><button id="flow-min" aria-label="Свернуть">—</button><button id="flow-close" aria-label="Закрыть">×</button><iframe id="flow-frame" title="FLOW" src="${APP_URL}" allow="autoplay"></iframe></div>`;
      document.body.appendChild(shell);
      shell.querySelector('iframe')?.addEventListener('load', () => { scan(); sendLibrary(true); });
      shell.querySelector('#flow-close').onclick = () => shell.classList.remove('open');
      shell.querySelector('#flow-min').onclick = () => shell.classList.toggle('minimized');
      shell.querySelector('#flow-frame').addEventListener('load', () => { scan(); sendLibrary(); });
      requestAnimationFrame(() => shell.classList.add('open'));
    } else {
      shell.classList.remove('minimized');
      shell.classList.add('open');
    }
    // Publish visible rows immediately. The embedded app requests a throttled
    // background deep scan once it is ready, so virtualized VK playlists are
    // populated without requiring the user to press Refresh.
    setTimeout(scan, 0);
  }

  function textParts(row) {
    const values = [];
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('.flow-action')) continue;
      const value = node.data.replace(/\s+/g, ' ').trim();
      if (!value || /^\d{1,3}(:\d{2})?$/.test(value) || /^(FLOW|ещё|more)$/i.test(value) || value === '320' || value.length > 180) continue;
      if (!values.includes(value)) values.push(value);
    }
    return values;
  }

  function extractTrack(row) {
    const text = textParts(row);
    const identity = playbackIdentity(row);
    const playLabel = row.querySelector('button[aria-label*="Воспроиз"],button[aria-label*="Play"]')?.getAttribute('aria-label') || '';
    const title = row.querySelector('.audio_row__title_inner,.audio_row__title,[data-testid="audio_name"],[class*="AudioRowTitle"],[class*="TrackTitle"]')?.textContent?.trim() || identity?.title || text[0] || playLabel.replace(/^(Воспроизвести|Play)\s*/i, '') || 'Без названия';
    const artist = row.querySelector('.audio_row__performer,.audio_row__performers,[data-testid="audio_artist"],[class*="AudioRowArtist"],[class*="TrackArtist"],[class*="performer" i]')?.textContent?.trim() || identity?.artist || text.find(value => value !== title) || '';
    const rawId = identity?.id && identity?.ownerId ? `${identity.ownerId}_${identity.id}` : row.dataset.fullId || row.dataset.audio || row.getAttribute('data-id') || row.id || '';
    const track = { key: rawId ? `vk:${rawId}` : `row:${title}:${artist}`, title, artist, rawId };
    if (identity) track.identity = storedIdentity(identity);
    return track;
  }

  // The parts of a VK identity that stay valid: enough for one reload_audio
  // call later, without the page having to show this row again.
  function storedIdentity(value) {
    const { id, ownerId, actionHash = '', urlHash = '', accessKey = '' } = value || {};
    return Number(id) && Number(ownerId) ? { id: Number(id), ownerId: Number(ownerId), actionHash, urlHash, accessKey } : null;
  }

  // New-UI rows carry their ID only in React state, which the page world reads
  // (background tags each row with data-flow-identity). Copy it onto the track.
  let harvestTimer = 0;
  function scheduleHarvest() {
    clearTimeout(harvestTimer);
    harvestTimer = setTimeout(async () => {
      const result = await runtime({ type: 'flow-harvest-identities' }).catch(() => null);
      if (!result?.ok) return;
      let changed = false;
      for (const row of document.querySelectorAll('[data-flow-key][data-flow-identity]')) {
        const item = rowMap.get(row.dataset.flowKey);
        if (!item || item.track.identity) continue;
        try { item.track.identity = storedIdentity(JSON.parse(row.dataset.flowIdentity)); } catch {}
        if (item.track.identity) changed = true;
      }
      if (changed) { libraryRevision++; persistLibrary(); sendLibrary(); }
    }, 400);
  }

  function playbackIdentity(row) {
    let carrier = row;
    for (let depth = 0; carrier && depth < 9 && !carrier.dataset?.audio; depth += 1) carrier = carrier.parentElement;
    const encoded = carrier?.dataset?.audio || row?.querySelector?.('[data-audio]')?.dataset?.audio || '';
    if (!encoded) return null;
    try {
      const tuple = JSON.parse(encoded);
      if (!Array.isArray(tuple) || !Number.isFinite(Number(tuple[0])) || !Number.isFinite(Number(tuple[1]))) return null;
      const hashes = String(tuple[13] || '').split('/');
      return {
        id: Number(tuple[0]),
        ownerId: Number(tuple[1]),
        directUrl: String(tuple[2] || ''),
        title: String(tuple[3] || ''),
        artist: String(tuple[4] || ''),
        actionHash: hashes[2] || '',
        urlHash: hashes[5] || '',
        accessKey: String(tuple[24] || '')
      };
    } catch { return null; }
  }

  async function identityForKey(key) {
    const item = rowMap.get(key);
    const local = item?.row?.isConnected ? playbackIdentity(item.row) : null;
    if (local) return local;
    const result = await runtime({ type: 'flow-read-track-identity', key }).catch(() => null);
    return result?.ok ? result.identity : null;
  }

  function candidateRows() {
    const rows = new Set();
    const seeds = [...document.querySelectorAll('.audio_row,[data-audio],[data-testid="audio_row"],[data-testid*="audio_row"],[data-testentitytag="audio"],.AudioPlaylistSnippet__item,[class*="AudioRow__root"],[class*="AudioRow"],[class*="audioRow"],[class*="AudioTrack"],[class*="TrackRow"],[class*="trackRow"]')];
    if (!seeds.length) document.querySelectorAll('time').forEach(node => { if (/^\d{1,2}:\d{2}$/.test(node.textContent.trim())) seeds.push(node); });
    for (const seed of seeds) {
      let current = seed;
      let best = null;
      for (let depth = 0; current && depth < 10; depth += 1, current = current.parentElement) {
        const box = current.getBoundingClientRect();
        if (box.width < 260 || box.height < 36 || box.height > 120) continue;
        const parts = textParts(current);
        const identity = playbackIdentity(current);
        if ((!identity?.title && parts.length < 2) || parts.length > 10) continue;
        if (!best || box.height < best.getBoundingClientRect().height) best = current;
      }
      if (best) rows.add(best);
    }
    return [...rows].filter(row => row.isConnected && (textParts(row).length >= 2 || Boolean(playbackIdentity(row)?.title)));
  }

  function sendLibrary(force = false) {
    const tracks = [...rowMap.values()].map(item => item.track).slice(0, 10000);
    const context = { title: document.title, url: location.href };
    if (force || lastDesktopPublishedRevision !== libraryRevision) {
      lastDesktopPublishedRevision = libraryRevision;
      runtime({ type: 'flow-desktop-publish-library', tracks, context }).catch(() => {});
    }
    const receiver = appWindow();
    if (!receiver) return;
    if (!force && lastPublishedRevision === libraryRevision && !scanRunning) return;
    lastPublishedRevision = libraryRevision;
    receiver.postMessage({
      type: 'flow:library',
      tracks,
      scanning: scanRunning,
      context
    }, '*');
  }

  function persistLibrary() {
    if (persistedRevision === libraryRevision) return;
    clearTimeout(cacheTimer);
    cacheTimer = setTimeout(() => {
      persistedRevision = libraryRevision;
      chrome.storage.local.set({ flowLibraryCache: [...rowMap.values()].map(item => item.track).slice(0, 2500) }).catch(() => {});
    }, 500);
  }

  async function hydrateLibrary() {
    try {
      const { flowLibraryCache = [] } = await chrome.storage.local.get('flowLibraryCache');
      for (const track of flowLibraryCache) if (track?.key && track?.title) rowMap.set(track.key, { row: null, track });
      libraryRevision++;
      sendLibrary();
    } catch {}
  }

  function installAction(row, track) {
    if (row.querySelector('.flow-action')) return;
    if (getComputedStyle(row).position === 'static') row.style.position = 'relative';
    const button = document.createElement('button');
    button.className = 'flow-action';
    button.textContent = '+ FLOW';
    button.title = 'Добавить трек в поток';
    button.onclick = event => {
      event.preventDefault(); event.stopPropagation(); openFlow();
      appWindow()?.postMessage({ type: 'flow:add-track', track }, '*');
    };
    row.classList.add('flow-track-row');
    row.appendChild(button);
  }

  function scan() {
    let changed = false;
    for (const row of candidateRows()) {
      if (row.dataset.flowKey && row.isConnected && row.querySelector('.flow-action')) continue;
      const track = extractTrack(row);
      if (!track.title || track.title === 'Без названия') continue;
      row.dataset.flowKey = track.key;
      // Keep an identity learned earlier for this key (rows re-render without it).
      const known = rowMap.get(track.key)?.track?.identity;
      if (!track.identity && known) track.identity = known;
      rowMap.set(track.key, { row, track });
      changed = true;
      installAction(row, track);
    }
    if (changed) { libraryRevision++; scheduleHarvest(); }
    persistLibrary(); sendLibrary();
  }

  function scrollHosts() {
    const hosts = new Set([document.scrollingElement]);
    for (const row of candidateRows()) {
      for (let element = row.parentElement; element && element !== document.body; element = element.parentElement) {
        const style = getComputedStyle(element);
        if (element.scrollHeight - element.clientHeight > 120 && /(auto|scroll)/.test(style.overflowY)) hosts.add(element);
      }
    }
    return [...hosts].filter(Boolean).sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight)).slice(0, 6);
  }

  function settle() { return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 120)))); }

  // VK renders track rows well after the page's load event, and slower still
  // on a slow connection: poll until `found()` holds instead of looking once.
  async function waitFor(found, timeout = 12000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      scan();
      const value = found();
      if (value) return value;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return null;
  }

  async function deepScan() {
    if (deepScanPromise) return deepScanPromise;
    deepScanPromise = (async () => {
      scanRunning = true; sendLibrary();
      const showAll = [...document.querySelectorAll('a,button,[role="button"]')].find(node => /^(показать все|show all|все треки|all tracks)$/i.test(node.textContent.replace(/\s+/g, ' ').trim()));
      if (showAll?.getBoundingClientRect().width > 0) showAll.click();
      await settle(); scan();
      for (const host of scrollHosts()) {
        const original = host.scrollTop;
        let stableBottom = 0;
        let previousRange = -1;
        host.scrollTop = 0;
        for (let pass = 0; pass < 72; pass += 1) {
          const range = Math.max(0, host.scrollHeight - host.clientHeight);
          host.scrollTop = Math.min(range, host.scrollTop + Math.max(240, Math.floor(host.clientHeight * .78)));
          await settle(); scan();
          const nextRange = Math.max(0, host.scrollHeight - host.clientHeight);
          stableBottom = host.scrollTop >= nextRange - 3 && nextRange === previousRange ? stableBottom + 1 : 0;
          previousRange = nextRange;
          if (stableBottom >= 6) break;
        }
        host.scrollTop = original; await settle();
      }
      scan();
    })().finally(() => { scanRunning = false; sendLibrary(); deepScanPromise = null; });
    return deepScanPromise;
  }

  async function resolveItem(key) {
    await waitFor(() => rowMap.get(key)?.row?.isConnected || candidateRows().length > 0);
    let item = rowMap.get(key);
    if (item?.row?.isConnected && item.row.dataset.flowKey === key) {
      item.row.scrollIntoView({ block: 'center', inline: 'nearest' });
      await settle(); scan();
      const refreshed = rowMap.get(key);
      if (refreshed?.row?.isConnected) return refreshed;
    }
    for (const host of scrollHosts()) {
      const step = Math.max(220, Math.floor(host.clientHeight * .72));
      for (let y = 0, pass = 0; pass < 72; pass += 1, y += step) {
        const range = Math.max(0, host.scrollHeight - host.clientHeight);
        host.scrollTop = Math.min(range, y); await settle(); scan();
        item = rowMap.get(key);
        if (item?.row?.isConnected && item.row.dataset.flowKey === key) {
          item.row.scrollIntoView({ block: 'center', inline: 'nearest' });
          await settle(); scan();
          return rowMap.get(key) || item;
        }
        if (host.scrollTop >= range - 2) break;
      }
    }
    return null;
  }

  function matchWords(value) {
    return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[()[\]{}.,:;!?'"«»&+\/\\_*–—-]+/g, ' ').split(/\s+/).filter(Boolean);
  }

  // Title without featured artists or bracketed tags: "Song (feat. X) [Remix]" -> "song".
  function bareTitle(value) {
    return matchWords(String(value || '').replace(/\s*[([].*?[)\]]/g, ' ').replace(/\s+(feat|ft|prod)\.?\s.*$/i, ''));
  }

  function matchScore(track, title, artist) {
    const want = matchWords(title).join(' ');
    const got = matchWords(track.title).join(' ');
    if (!want || !got) return 0;
    const bareWant = bareTitle(title).join(' '), bareGot = bareTitle(track.title).join(' ');
    const titleScore = got === want ? 3
      : bareWant && bareWant === bareGot ? 2
      : (got.startsWith(want) || want.startsWith(got) || (bareWant && (got.includes(bareWant) || want.includes(bareGot)))) ? 1 : 0;
    if (!titleScore) return 0;
    const wantArtist = new Set(matchWords(artist));
    const shared = matchWords(track.artist).filter(word => wantArtist.has(word)).length;
    return shared ? titleScore + shared : 0;
  }

  async function findMatchingKey(title, artist) {
    let best = null;
    const consider = () => {
      scan();
      for (const item of rowMap.values()) {
        if (!item.row?.isConnected) continue;
        const score = matchScore(item.track, title, artist);
        if (score && (!best || score > best.score)) best = { key: item.track.key, score };
      }
    };
    // Search results arrive late: wait for a match before scrolling for more.
    await waitFor(() => { consider(); return best?.score >= 4 ? best : null; });
    for (const host of scrollHosts()) {
      for (let pass = 0; pass < 12 && !(best?.score >= 4); pass += 1) {
        host.scrollTop += Math.max(220, Math.floor(host.clientHeight * .72));
        await settle(); consider();
      }
    }
    return best?.key || null;
  }

  function rowIsPlaying(row) {
    return Boolean(row?.isConnected) && (
      row.matches('.audio_row__current,.audio_row__playing,.audio_row__active,[data-state="playing"],[data-playing="true"],[aria-current="true"]') ||
      Boolean(row.querySelector('button[aria-label*="Пауза" i],button[aria-label*="Pause" i],[data-testid="audio_pause"],[data-testid*="pause" i],[class*="pause" i]'))
    );
  }

  function playbackConfirmed(row) {
    if (rowIsPlaying(row)) return true;
    const activeItem = [...rowMap.values()].find(item => rowIsPlaying(item.row));
    if (activeItem?.row && activeItem.row !== row) return false;
    if (nativeAudios().some(audio => !audio.paused && (audio.currentSrc || audio.src))) return true;
    return navigator.mediaSession?.playbackState === 'playing' && !activeItem;
  }

  async function waitForPlayback(row, timeout = 950) {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      if (playbackConfirmed(row)) return true;
      await new Promise(resolve => setTimeout(resolve, 70));
    }
    return false;
  }

  function visibleClickTargets(row) {
    const selectors = [
      '.audio_row__play_btn',
      '.audio_row__cover',
      '.audio_row__cover_icon',
      '[data-testid="audio_play"]',
      '[data-testid="audio_row_play"]',
      '[data-testid*="play" i]',
      'button[aria-label*="Воспроиз" i]',
      'button[aria-label*="Включ" i]',
      'button[aria-label*="Play" i]',
      '[role="button"][aria-label*="Воспроиз" i]',
      '[role="button"][aria-label*="Включ" i]',
      '[role="button"][aria-label*="Play" i]',
      '[class*="playButton" i]',
      '[class*="play_btn" i]',
      '[class*="PlayButton" i]',
      '[class*="cover" i]',
      '.audio_row__title_inner',
      '.audio_row__title'
    ];
    const nodes = [];
    for (const selector of selectors) {
      for (const node of row.querySelectorAll(selector)) {
        if (node.closest('.flow-action') || nodes.includes(node)) continue;
        if (/more|menu|action|like|add|share|download|save|скач/i.test(`${node.className || ''} ${node.getAttribute('aria-label') || ''} ${node.dataset.testid || ''}`)) continue;
        if (node.closest('a[download],[data-download],[class*="download" i],[class*="save" i]')) continue;
        const box = node.getBoundingClientRect();
        if (box.width > 4 && box.height > 4) nodes.push(node);
      }
    }
    return nodes;
  }

  async function captureMedia(row, key = '') {
    const pointerEvents = shell?.style.pointerEvents;
    const visibility = shell?.style.visibility;
    if (shell) shell.style.pointerEvents = 'none';
    if (shell) shell.style.visibility = 'hidden';
    try {
      const beforeAudio = nativeAudios().find(audio => !audio.paused && (audio.currentSrc || audio.src)) || null;
      const beforeSource = beforeAudio?.currentSrc || beforeAudio?.src || '';
      const beforeTime = Number(beforeAudio?.currentTime || 0);
      let currentRow = row;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        currentRow?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
        await settle(); scan();
        const refreshed = key ? rowMap.get(key)?.row : null;
        if (refreshed?.isConnected) currentRow = refreshed;
        const box = currentRow?.getBoundingClientRect?.();
        if (box && box.width > 8 && box.height > 8 && box.bottom > 4 && box.top < innerHeight - 4 && box.right > 4 && box.left < innerWidth - 4) break;
        for (let parent = currentRow?.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          if (!/(auto|scroll)/.test(style.overflowY) || parent.scrollHeight <= parent.clientHeight) continue;
          const parentBox = parent.getBoundingClientRect();
          const rowBox = currentRow.getBoundingClientRect();
          parent.scrollTop += rowBox.top - parentBox.top - parent.clientHeight / 2 + rowBox.height / 2;
        }
      }
      row = currentRow || row;
      const preferred = visibleClickTargets(row)[0] || row.querySelector('.audio_row__title_inner,.audio_row__title') || row.querySelector('img')?.parentElement;
      const currentBox = row.getBoundingClientRect();
      const targetBox = preferred?.getBoundingClientRect();
      const usable = targetBox && targetBox.width > 4 && targetBox.height > 4 && targetBox.left >= currentBox.left - 2 && targetBox.right <= currentBox.right + 2;
      const x = Math.round(usable ? targetBox.left + targetBox.width / 2 : currentBox.left + Math.min(28, currentBox.width * .06));
      const y = Math.round(usable ? targetBox.top + targetBox.height / 2 : currentBox.top + currentBox.height / 2);
      let lastError = '';
      for (let strategy = 0; strategy < 3; strategy += 1) {
        const played = await runtime({ type: 'trusted-play', key, x, y, strategy }).catch(error => ({ ok: false, error: error.message }));
        if (!played?.ok) { lastError = played?.error || 'VK не принял настоящий клик по треку'; continue; }
        const audio = await waitForNativeAudio({ allowPaused: false, timeout: strategy ? 1800 : 3200 });
        await settle(); scan();
        const refreshedRow = key ? rowMap.get(key)?.row : null;
        if (refreshedRow?.isConnected) row = refreshedRow;
        const activeItem = [...rowMap.values()].find(item => rowIsPlaying(item.row));
        const audioChanged = Boolean(audio) && (
          audio !== beforeAudio ||
          (audio.currentSrc || audio.src || '') !== beforeSource ||
          Number(audio.currentTime || 0) + .35 < beforeTime
        );
        const confirmed = rowIsPlaying(row) || (!activeItem && audioChanged);
        if (confirmed) {
          if (audio) startNativeSpectrum(audio);
          return { ok: true, mediaUrl: '', nativeOnly: true, rowActive: rowIsPlaying(row), playerHidden: !audio, strategy };
        }
        lastError = 'VK получил клик, но не изменил состояние плеера';
      }
      throw new Error(lastError || 'VK не запустил выбранный трек');
    } finally {
      if (shell) shell.style.pointerEvents = pointerEvents || '';
      if (shell) shell.style.visibility = visibility || '';
    }
  }

  async function fadeAudio(audio, target, duration = 420) {
    if (!audio) return;
    const from = Number(audio.volume);
    const steps = Math.max(4, Math.round(duration / 28));
    for (let index = 1; index <= steps; index += 1) {
      audio.volume = from + (target - from) * index / steps;
      await new Promise(resolve => setTimeout(resolve, duration / steps));
    }
  }

  function destroyPageDeck(name) {
    const deck = pageDecks[name];
    if (!deck) return;
    deck.audio.pause();
    deck.audio.removeAttribute('src');
    pageDecks[name] = null;
  }

  async function cloneNativeDeck(name, nativeAudio, item, startVolume = 1) {
    const sourceUrl = nativeAudio?.currentSrc || nativeAudio?.src || '';
    if (!sourceUrl) throw new Error('VK не открыл поток для второго аудиобуфера');
    destroyPageDeck(name);
    const audio = new Audio();
    audio.className = 'flow-native';
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.src = sourceUrl;
    audio.volume = Math.max(0, Math.min(1, startVolume));
    audio.preservesPitch = true;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('VK не разрешил дублировать поток')), 5500);
      const ready = () => { clearTimeout(timer); resolve(); };
      audio.addEventListener('canplay', ready, { once: true });
      audio.addEventListener('loadedmetadata', ready, { once: true });
      audio.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Второй аудиобуфер VK недоступен')); }, { once: true });
    });
    audio.currentTime = Math.max(0, Number(nativeAudio.currentTime || 0));
    await audio.play();
    const deck = { name, audio, key: item.track.key, track: item.track };
    pageDecks[name] = deck;
    return deck;
  }

  function prepareShadowDeck(entry, name) {
    if (!PAGE_DECK_MIXING || !entry?.audio || entry.shadowStatus === 'loading' || entry.shadow) return;
    entry.shadowStatus = 'loading';
    entry.shadowPromise = cloneNativeDeck(name, entry.audio, { track: entry.track }, 0).then(shadow => {
      if (nativeFallback !== entry) {
        if (pageDecks[name] === shadow) destroyPageDeck(name);
        return null;
      }
      shadow.audio.currentTime = Number(entry.audio.currentTime || shadow.audio.currentTime || 0);
      shadow.audio.playbackRate = Number(entry.audio.playbackRate || 1);
      entry.shadow = shadow;
      entry.shadowStatus = 'ready';
      return shadow;
    }).catch(() => {
      if (nativeFallback === entry) entry.shadowStatus = 'blocked';
      return null;
    });
  }

  function crossfadePageDecks(fromDeck, toDeck, duration = 9) {
    if (!fromDeck?.audio || !toDeck?.audio) return;
    const token = {};
    pageTransition = token;
    const started = performance.now();
    const fromLevel = Math.max(0, Math.min(1, Number.isFinite(Number(fromDeck.audio.volume)) ? Number(fromDeck.audio.volume) : 1));
    const toLevel = Math.max(0, Math.min(1, Number(toDeck.targetVolume ?? fromLevel)));
    const tick = now => {
      if (pageTransition !== token) return;
      const progress = Math.max(0, Math.min(1, (now - started) / (duration * 1000)));
      fromDeck.audio.volume = fromLevel * Math.cos(progress * Math.PI / 2);
      toDeck.audio.volume = toLevel * Math.sin(progress * Math.PI / 2);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        fromDeck.audio.pause();
        if (pageDecks[fromDeck.name] === fromDeck) destroyPageDeck(fromDeck.name);
        const rate = Number(toDeck.audio.playbackRate || 1);
        if (Math.abs(rate - 1) > .002) {
          const startedRateAt = performance.now();
          const settleRate = now => {
            const amount = Math.max(0, Math.min(1, (now - startedRateAt) / 2200));
            toDeck.audio.playbackRate = rate + (1 - rate) * amount;
            if (amount < 1) requestAnimationFrame(settleRate);
          };
          requestAnimationFrame(settleRate);
        }
        pageTransition = null;
      }
    };
    requestAnimationFrame(tick);
  }

  function nativeAudios() {
    const now = performance.now();
    if (now - audioCacheAt < 350 && audioCache.every(audio => audio.isConnected)) return audioCache;
    const found = new Set();
    const visit = root => {
      try {
        root.querySelectorAll?.('audio:not(.flow-native)').forEach(audio => found.add(audio));
        root.querySelectorAll?.('*').forEach(node => { if (node.shadowRoot) visit(node.shadowRoot); });
        root.querySelectorAll?.('iframe').forEach(frame => { try { if (frame.contentDocument) visit(frame.contentDocument); } catch {} });
      } catch {}
    };
    visit(document);
    audioCache = [...found];
    audioCacheAt = now;
    return audioCache;
  }

  async function waitForNativeAudio({ allowPaused = false, timeout = 4800 } = {}) {
    for (let attempt = 0; attempt < Math.max(1, Math.ceil(timeout / 80)); attempt += 1) {
      const audios = nativeAudios();
      const playing = audios.find(audio => !audio.paused && (audio.currentSrc || audio.src));
      if (playing) return playing;
      const ready = audios.find(audio => audio.currentSrc || audio.src);
      if (allowPaused && ready && attempt > 8) return ready;
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    return null;
  }

  function startNativeSpectrum(audio) {
    if (!audio || nativeAnalyzers.has(audio)) return;
    try {
      const context = new AudioContext({ latencyHint: 'interactive' });
      const analyser = context.createAnalyser();
      const silent = context.createGain();
      analyser.fftSize = 2048; analyser.smoothingTimeConstant = .62; silent.gain.value = 0;
      let stream = null;
      let source = null;
      let directSource = false;
      try {
        stream = typeof audio.captureStream === 'function' ? audio.captureStream() : typeof audio.mozCaptureStream === 'function' ? audio.mozCaptureStream() : null;
        if (!stream?.getAudioTracks?.().length) throw new Error('Media capture has no audio track');
        source = context.createMediaStreamSource(stream);
      } catch {
        stream = null;
        source = context.createMediaElementSource(audio);
        directSource = true;
      }
      if (directSource) source.connect(analyser).connect(context.destination);
      else source.connect(analyser).connect(silent).connect(context.destination);
      context.resume().catch(() => {});
      const frequency = new Uint8Array(analyser.frequencyBinCount);
      const waveform = new Float32Array(analyser.fftSize);
      const bands = Array(32).fill(0);
      const intervals = [];
      let previousBass = 0; let bassFloor = .04; let lastBeatAt = 0; let beatPulse = 0;
      const timer = setInterval(() => {
        if (!audio.isConnected) { clearInterval(timer); context.close().catch(() => {}); nativeAnalyzers.delete(audio); return; }
        analyser.getByteFrequencyData(frequency); analyser.getFloatTimeDomainData(waveform);
        const binHz = context.sampleRate / analyser.fftSize;
        const average = (low, high) => {
          const from = Math.max(1, Math.floor(low / binHz)); const to = Math.min(frequency.length - 1, Math.ceil(high / binHz));
          let sum = 0; for (let index = from; index <= to; index += 1) sum += frequency[index] / 255;
          return sum / Math.max(1, to - from + 1);
        };
        const nyquist = context.sampleRate / 2;
        for (let index = 0; index < bands.length; index += 1) {
          const low = 28 * Math.pow(nyquist / 28, index / bands.length);
          const high = 28 * Math.pow(nyquist / 28, (index + 1) / bands.length);
          const next = average(low, high); bands[index] += (next - bands[index]) * .42;
        }
        let square = 0; for (const value of waveform) square += value * value;
        const rms = Math.sqrt(square / waveform.length);
        const bass = average(38, 165); const lowMid = average(165, 900); const high = average(2800, 12000);
        bassFloor += (bass - bassFloor) * (bass < bassFloor ? .05 : .008);
        const now = performance.now();
        if (bass > Math.max(.11, bassFloor * 1.38) && bass - previousBass > .015 && now - lastBeatAt > 245) {
          if (lastBeatAt) { const interval = now - lastBeatAt; if (interval > 240 && interval < 1700) intervals.push(interval); if (intervals.length > 18) intervals.shift(); }
          lastBeatAt = now; beatPulse = 1;
        } else beatPulse *= .72;
        previousBass = bass;
        const bpms = intervals.map(value => { let bpm = 60000 / value; while (bpm < 78) bpm *= 2; while (bpm > 176) bpm /= 2; return bpm; }).sort((a, b) => a - b);
        const bpm = bpms.length >= 3 ? bpms[Math.floor(bpms.length / 2)] : 0;
        runtime({ type: 'flow-native-spectrum', data: { bands, waveform: Array.from(waveform.filter((_value, index) => index % 32 === 0).slice(0, 64)), rms, bass, lowMid, high, beatPulse, detectedBpm: bpm, confidence: Math.min(1, bpms.length / 10), volume: audio.muted ? 0 : Number(audio.volume || 0), paused: audio.paused } }).catch(() => {});
      }, 90);
      nativeAnalyzers.set(audio, { context, stream, timer });
    } catch {}
  }

  function scheduleVolumeCurve(audio, direction, duration, startAt, targetVolume = 1) {
    if (!audio) return Promise.reject(new Error('Аудио deck не найден'));
    return new Promise(resolve => {
      const token = {};
      volumeAutomation.set(audio, token);
      const begin = () => {
        const started = performance.now();
        const tick = () => {
          if (volumeAutomation.get(audio) !== token) { clearInterval(timer); resolve(); return; }
          const now = performance.now();
          const progress = Math.max(0, Math.min(1, (now - started) / Math.max(1, duration)));
          const curve = FlowMixMath.equalPower(progress);
          const gain = direction === 'out' ? curve.outgoing : curve.incoming;
          audio.volume = Math.max(0, Math.min(1, targetVolume * gain));
          if (progress >= 1) {
            clearInterval(timer);
            if (direction === 'out') audio.pause();
            resolve();
          }
        };
        const timer = setInterval(tick, 25);
        tick();
      };
      const wait = Math.max(0, Number(startAt || Date.now()) - Date.now());
      setTimeout(begin, wait);
    });
  }

  function destroyShadowDeck() {
    if (!shadowDeck) return;
    shadowDeck.audio?.pause();
    shadowDeck.hls?.destroy?.();
    shadowDeck.audio?.removeAttribute?.('src');
    shadowDeck.audio?.remove?.();
    shadowDeck = null;
  }

  async function loadShadowTrack(key, currentTime = 0, _identity = null, playing = true) {
    const item = await resolveItem(key);
    if (!item?.row) throw new Error('Трек не найден в технической VK-вкладке. Открой плейлист заново и обнови FLOW.');
    nativeAudios().forEach(audio => { audio.volume = 0; });
    await captureMedia(item.row, key);
    const audio = await waitForNativeAudio();
    if (!audio) throw new Error('VK не открыл аудиодвижок shadow deck');
    startNativeSpectrum(audio);
    audio.volume = 0;
    if (Number.isFinite(audio.duration) && Number(currentTime) >= 0) audio.currentTime = Math.min(Number(currentTime), Math.max(0, audio.duration - .25));
    if (playing === false) {
      audio.pause();
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(Number(currentTime || 0), Math.max(0, audio.duration - .25));
    } else {
      await audio.play();
    }
    shadowDeck = { key, track: item.track, audio };
    return shadowDeck;
  }

  async function handleDeckCommand(command = {}) {
    if (!FlowMixMath.validDeckCommand(command)) throw new Error('Некорректная команда deck');
    const action = command.action;
    if (action === 'load' || action === 'sync') {
      if (!shadowDeck || shadowDeck.key !== command.key) await loadShadowTrack(command.key, command.currentTime, command.identity, command.playing !== false);
      const audio = shadowDeck.audio;
      audio.volume = 0;
      if (Number.isFinite(audio.duration) && Number.isFinite(Number(command.currentTime))) audio.currentTime = Math.min(Number(command.currentTime), Math.max(0, audio.duration - .25));
      if (command.playing === false) audio.pause(); else await audio.play().catch(() => {});
      return { ok: true, key: shadowDeck.key, currentTime: Number(audio.currentTime || 0), duration: Number(audio.duration || 0) };
    }
    if (action === 'takeover') {
      if (!shadowDeck || shadowDeck.key !== command.key) await loadShadowTrack(command.key, command.currentTime, command.identity);
      const audio = shadowDeck.audio;
      if (Math.abs(Number(audio.currentTime || 0) - Number(command.currentTime || 0)) > .12) audio.currentTime = Number(command.currentTime || 0);
      audio.volume = 0;
      await audio.play();
      return { ok: true, key: shadowDeck.key, currentTime: Number(audio.currentTime || 0), ready: audio.readyState >= 2 };
    }
    if (action === 'set-volume') {
      if (!shadowDeck?.audio) throw new Error('Shadow deck ещё не загружен');
      volumeAutomation.delete(shadowDeck.audio);
      shadowDeck.audio.volume = Math.max(0, Math.min(1, Number(command.value || 0)));
      if (command.play !== false && shadowDeck.audio.paused) await shadowDeck.audio.play();
      return { ok: true };
    }
    if (action === 'set-rate') {
      if (!shadowDeck?.audio) throw new Error('Deck ещё не загружен');
      shadowDeck.audio.playbackRate = Math.max(.88, Math.min(1.12, Number(command.value || 1)));
      return { ok: true, rate: shadowDeck.audio.playbackRate };
    }
    if (action === 'transport') {
      if (!shadowDeck?.audio) throw new Error('Deck ещё не загружен');
      const audio = shadowDeck.audio;
      if (command.transport === 'toggle') audio.paused ? await audio.play() : audio.pause();
      if (command.transport === 'play') await audio.play();
      if (command.transport === 'pause') audio.pause();
      if (command.transport === 'restart') { audio.currentTime = 0; await audio.play(); }
      if (command.transport === 'seek') audio.currentTime = Math.max(0, Math.min(Number(command.currentTime || 0), Number.isFinite(audio.duration) ? Math.max(0, audio.duration - .05) : Infinity));
      return { ok: true, currentTime: Number(audio.currentTime || 0), paused: audio.paused };
    }
    if (action === 'fade') {
      if (!shadowDeck?.audio) throw new Error('Shadow deck ещё не загружен');
      scheduleVolumeCurve(shadowDeck.audio, command.direction, Number(command.duration || 8000), Number(command.startAt || Date.now()), Number(command.targetVolume ?? 1)).catch(() => {});
      return { ok: true };
    }
    if (action === 'stop') {
      if (shadowDeck?.audio) volumeAutomation.delete(shadowDeck.audio);
      destroyShadowDeck(); return { ok: true };
    }
    if (action === 'state') {
      const audio = shadowDeck?.audio;
      const duration = Number.isFinite(audio?.duration) ? Number(audio.duration) : 0;
      const currentTime = Number(audio?.currentTime || 0);
      return { ok: true, key: shadowDeck?.key || '', title: shadowDeck?.track?.title || '', artist: shadowDeck?.track?.artist || '', currentTime, duration, paused: audio ? audio.paused : true, ended: Boolean(audio?.ended || (duration > 0 && currentTime >= duration - .18)), ready: Boolean(audio && audio.readyState >= 2), readyState: Number(audio?.readyState || 0), networkState: Number(audio?.networkState || 0), volume: Number(audio?.volume || 0), rate: Number(audio?.playbackRate || 1) };
    }
    throw new Error('Неизвестная команда deck');
  }

  async function commandExplicitDeck(deck, command) {
    if (!['a', 'b'].includes(deck)) throw new Error('Неизвестная дека');
    if (deck === 'a') return handleDeckCommand(command);
    const result = await runtime({ type: 'flow-shadow-command', command });
    if (!result?.ok) throw new Error(result?.error || 'Техническая дека VK не ответила');
    return result;
  }

  async function loadExplicitDeck(message) {
    const reply = payload => appWindow()?.postMessage({ type: 'flow:load-result', deck: message.deck, key: message.key, requestId: message.requestId, ...payload }, '*');
    try {
      const prepareOnly = Boolean(message.prepareOnly);
      const identity = await identityForKey(message.key);
      const incoming = await commandExplicitDeck(message.deck, { action: 'load', key: message.key, identity, currentTime: 0, playing: !prepareOnly });
      const fromDeck = message.deck === 'a' ? 'b' : 'a';
      const initialVolume = message.analysisMode || message.nativeTransition || prepareOnly ? 0 : 1;
      await commandExplicitDeck(message.deck, { action: 'set-volume', value: initialVolume, play: !message.analysisMode && !prepareOnly });
      if (prepareOnly) {
        reply({ ok: true, native: true, prepared: true, overlap: false, mixMode: 'independent-native-preload', track: { key: incoming.key, title: incoming.title, artist: incoming.artist }, state: incoming });
        return;
      }
      if (message.nativeTransition) {
        const outgoing = await commandExplicitDeck(fromDeck, { action: 'state' }).catch(() => null);
        const rate = FlowMixMath.safePlaybackRate(message.masterBpm, message.incomingBpm, .06);
        await commandExplicitDeck(message.deck, { action: 'set-rate', value: rate });
        const beatDelay = FlowMixMath.gridDelaySeconds(Number(outgoing?.currentTime || 0), Number(message.masterBpm || 0), Number(message.beatOffset || 0), 4, 2.8);
        const startAt = Date.now() + Math.max(90, Math.round(beatDelay * 1000));
        const duration = Math.max(4000, Math.min(22000, Number(message.transitionDuration || 9) * 1000));
        await Promise.all([
          commandExplicitDeck(fromDeck, { action: 'fade', direction: 'out', duration, startAt, targetVolume: Math.max(.01, Number(outgoing?.volume ?? 1)) }),
          commandExplicitDeck(message.deck, { action: 'fade', direction: 'in', duration, startAt, targetVolume: 1 })
        ]);
        reply({ ok: true, native: true, overlap: true, mixMode: 'independent-native-decks', track: { key: incoming.key, title: incoming.title, artist: incoming.artist }, state: incoming, transition: { from: fromDeck, to: message.deck, startAt, duration, rate } });
        return;
      }
      reply({ ok: true, native: true, overlap: false, mixMode: 'independent-native-deck', track: { key: incoming.key, title: incoming.title, artist: incoming.artist }, state: incoming });
    } catch (error) {
      reply({ ok: false, error: error.message || 'VK не запустил деку' });
    }
  }

  async function applyManualCrossfader(value) {
    const progress = Math.max(0, Math.min(1, Number(value || 0)));
    const curve = FlowMixMath.equalPower(progress);
    await Promise.all([
      commandExplicitDeck('a', { action: 'set-volume', value: curve.outgoing, play: false }).catch(() => null),
      commandExplicitDeck('b', { action: 'set-volume', value: curve.incoming, play: false }).catch(() => null)
    ]);
    return { ok: true, value: progress, a: curve.outgoing, b: curve.incoming };
  }

  async function syncExplicitDecks(message) {
    const masterDeck = message.masterDeck === 'b' ? 'b' : 'a';
    const targetDeck = masterDeck === 'a' ? 'b' : 'a';
    const [master, target] = await Promise.all([
      commandExplicitDeck(masterDeck, { action: 'state' }),
      commandExplicitDeck(targetDeck, { action: 'state' })
    ]);
    if (!master?.key || !target?.key) throw new Error('Для SYNC нужны два загруженных трека');
    const rate = FlowMixMath.safePlaybackRate(message.masterBpm, message.targetBpm, .12);
    const aligned = FlowMixMath.phaseAlignedTime(target.currentTime, master.currentTime, message.masterBpm, message.targetBpm);
    await commandExplicitDeck(targetDeck, { action: 'set-rate', value: rate });
    await commandExplicitDeck(targetDeck, { action: 'transport', transport: 'seek', currentTime: aligned });
    return { ok: true, masterDeck, targetDeck, rate, currentTime: aligned };
  }

  async function loadTrack(message) {
    const reply = payload => appWindow()?.postMessage({ type: 'flow:load-result', deck: message.deck, key: message.key, requestId: message.requestId, ...payload }, '*');
    let item = await resolveItem(message.key);
    if (!item?.row) return reply({ ok: false, error: 'Трек не найден на странице. Открой плейлист и обнови коллекцию.' });
    item.row.scrollIntoView({ block: 'center', inline: 'nearest' });
    await settle(); scan();
    item = rowMap.get(message.key) || item;
    let previousMuted = false;
    const outgoingEntry = message.nativeTransition ? nativeFallback : null;
    const outgoingNative = outgoingEntry?.audio || null;
    const outgoingVolume = Number(outgoingNative?.volume ?? 1);
    let overlapOutgoing = null;
    let dualOutgoing = false;
    try {
      if (message.nativeTransition && outgoingNative) {
        try {
          const takeover = await runtime({ type: 'flow-shadow-command', command: { action: 'takeover', key: outgoingEntry.key, currentTime: Number(outgoingNative.currentTime || 0), playing: true } });
          if (!takeover?.ok || !takeover.ready) throw new Error(takeover?.error || 'Shadow deck не готов');
          const handoffAt = Date.now() + 90;
          await Promise.all([
            scheduleVolumeCurve(outgoingNative, 'out', 140, handoffAt, outgoingVolume),
            runtime({ type: 'flow-shadow-command', command: { action: 'fade', direction: 'in', duration: 140, startAt: handoffAt, targetVolume: outgoingVolume } })
          ]);
          dualOutgoing = true;
          dualShadowReady = false;
        } catch {
          dualOutgoing = false;
          dualShadowReady = false;
        }
      }
      if (message.nativeTransition && outgoingNative && !dualOutgoing && !outgoingEntry?.pageEngine && PAGE_DECK_MIXING) {
        try {
          const outgoingDeckName = message.deck === 'a' ? 'b' : 'a';
          overlapOutgoing = outgoingEntry.shadow || await Promise.race([
            outgoingEntry.shadowPromise || Promise.resolve(null),
            new Promise(resolve => setTimeout(() => resolve(null), 1100))
          ]);
          if (!overlapOutgoing) throw new Error('shadow deck unavailable');
          outgoingEntry.shadow = null;
          overlapOutgoing.audio.currentTime = Number(outgoingNative.currentTime || overlapOutgoing.audio.currentTime || 0);
          outgoingNative.pause();
          overlapOutgoing.audio.volume = outgoingVolume;
        } catch {
          overlapOutgoing = null;
        }
      }
      if (message.nativeTransition && outgoingNative && !dualOutgoing && !overlapOutgoing) {
        await fadeAudio(outgoingNative, Math.min(.08, outgoingVolume), 180);
      }
      if (message.analysisMode) {
        const muted = await runtime({ type: 'flow-tab-mute', muted: true }).catch(() => null);
        previousMuted = Boolean(muted?.previousMuted);
      }
      const capture = await captureMedia(item.row, message.key);
      const nativeAudio = await waitForNativeAudio();
      const currentTime = Number(nativeAudio?.currentTime || 0);
      if (nativeAudio && !message.analysisMode) nativeFallback = { audio: nativeAudio, key: message.key, track: item.track, transferring: true };
      if (!capture.mediaUrl) {
        if (!nativeAudio) {
          if (!capture.rowActive && !capture.playerHidden) throw new Error('VK получил клик, но не подтвердил запуск трека');
          if (overlapOutgoing) destroyPageDeck(overlapOutgoing.name);
          if (dualOutgoing) runtime({ type: 'flow-shadow-command', command: { action: 'fade', direction: 'out', duration: 500, startAt: Date.now(), targetVolume: outgoingVolume } }).catch(() => {});
          nativeFallback = { audio: null, key: message.key, track: item.track, pageEngine: false, playerHidden: true, shadowStatus: 'blocked' };
          runtime({ type: 'flow-start-tab-analysis' }).catch(() => {});
          reply({ ok: true, track: item.track, native: true, nativeOnly: true, overlap: false, mixMode: 'vk-hidden-player', warning: 'VK скрывает аудиодвижок страницы' });
          return;
        }
        nativeAudio.volume = outgoingEntry ? 0 : outgoingVolume;
        const incomingDeck = { name: message.deck, audio: nativeAudio, key: message.key, track: item.track, targetVolume: outgoingVolume };
        nativeFallback = { ...incomingDeck, pageEngine: false, overlap: Boolean(overlapOutgoing) };
        const rawRate = FlowMixMath.safePlaybackRate(message.masterBpm, message.incomingBpm, .06);
        if (dualOutgoing || overlapOutgoing) nativeAudio.playbackRate = rawRate;
        if (dualOutgoing) {
          const mixDuration = Math.max(4000, Math.min(14000, Number(message.transitionDuration || 8) * 1000));
          const mixAt = Date.now() + 80;
          runtime({ type: 'flow-shadow-command', command: { action: 'fade', direction: 'out', duration: mixDuration, startAt: mixAt, targetVolume: outgoingVolume } }).catch(() => {});
          scheduleVolumeCurve(nativeAudio, 'in', mixDuration, mixAt, outgoingVolume).catch(() => {});
          setTimeout(() => {
            if (nativeFallback?.key !== message.key) return;
            runtime({ type: 'flow-shadow-command', command: { action: 'sync', key: message.key, currentTime: Number(nativeAudio.currentTime || 0), playing: !nativeAudio.paused } }).then(result => { dualShadowReady = Boolean(result?.ok); }).catch(() => { dualShadowReady = false; });
          }, mixDuration + 260);
        } else if (overlapOutgoing) {
          crossfadePageDecks(overlapOutgoing, incomingDeck, Math.max(4, Math.min(14, Number(message.transitionDuration || 8))));
        } else if (outgoingEntry) {
          if (outgoingNative && outgoingNative !== nativeAudio) fadeAudio(outgoingNative, 0, 220).then(() => outgoingNative.pause()).catch(() => {});
          fadeAudio(nativeAudio, outgoingVolume, 620).catch(() => {});
        }
        if (!dualOutgoing) prepareShadowDeck(nativeFallback, message.deck);
        if (!outgoingEntry) runtime({ type: 'flow-shadow-command', command: { action: 'sync', key: message.key, currentTime: Number(nativeAudio.currentTime || 0), playing: !nativeAudio.paused } }).then(result => { dualShadowReady = Boolean(result?.ok); }).catch(() => { dualShadowReady = false; });
        runtime({ type: 'flow-start-tab-analysis' }).then(result => {
          appWindow()?.postMessage({ type: 'flow:capture-state', ok: Boolean(result?.ok), error: result?.error || '' }, '*');
        }).catch(error => appWindow()?.postMessage({ type: 'flow:capture-state', ok: false, error: error.message }, '*'));
        reply({ ok: true, track: item.track, native: true, nativeOnly: !(dualOutgoing || overlapOutgoing), overlap: Boolean(dualOutgoing || overlapOutgoing), mixMode: dualOutgoing ? 'dual-tab' : overlapOutgoing ? 'same-tab-shadow' : 'fade-switch' });
        return;
      }
      const result = await runtime({ type: 'load-background-deck', deck: message.deck, url: capture.mediaUrl, currentTime, key: message.key, title: item.track.title, artist: item.track.artist, analysisMode: Boolean(message.analysisMode), deferOutput: Boolean(nativeAudio && !message.analysisMode) });
      if (result?.ok) {
        if (nativeAudio && !message.analysisMode) {
          await runtime({ type: 'deck-transport', deck: message.deck, action: 'seek', currentTime: Number(nativeAudio.currentTime || currentTime) }).catch(() => {});
          await runtime({ type: 'deck-transport', deck: message.deck, action: 'activate' }).catch(() => {});
          const initialVolume = nativeAudio.volume;
          for (let step = 5; step >= 0; step -= 1) {
            nativeAudio.volume = initialVolume * step / 5;
            await new Promise(resolve => setTimeout(resolve, 24));
          }
          nativeAudio.pause();
          nativeAudio.volume = initialVolume;
        }
        nativeAudio?.pause();
        nativeFallback = null;
        reply({ ok: true, track: item.track, native: false });
      } else if (!message.analysisMode) {
        // Music is already playing in VK. Do not turn a private-stream failure
        // into a dead launch; expose the native state and keep the flow alive.
        if (nativeAudio) {
          if (message.nativeTransition) {
            nativeAudio.volume = 0;
            fadeAudio(nativeAudio, outgoingVolume, 520).catch(() => {});
          }
          nativeFallback = { audio: nativeAudio, key: message.key, track: item.track };
          reply({ ok: true, track: item.track, native: true, warning: result?.error || 'Используется плеер VK' });
        } else {
          throw new Error(result?.error || 'Аудиодвижок не загрузил трек');
        }
      } else {
        nativeAudio?.pause();
        throw new Error(result?.error || 'Фоновый анализ недоступен для этого трека');
      }
    } catch (error) {
      if (outgoingNative) {
        outgoingNative.volume = outgoingVolume;
        if (outgoingNative.paused) outgoingNative.play().catch(() => {});
      }
      if (overlapOutgoing) destroyPageDeck(overlapOutgoing.name);
      reply({ ok: false, error: error.message });
    }
    finally {
      if (message.analysisMode) {
        document.querySelectorAll('audio:not(.flow-native)').forEach(audio => audio.pause());
        await runtime({ type: 'flow-tab-mute', muted: previousMuted }).catch(() => {});
      }
    }
  }

  window.addEventListener('message', event => {
    if (event.source !== appWindow()) return;
    const message = event.data;
    if (message?.type === 'flow:context-invalidated') return location.reload();
    if (message?.type === 'flow:scan-library') {
      scan();
      sendLibrary(true); // The iframe may have loaded after the previous publication.
      return;
    }
    if (message?.type === 'flow:deep-scan') {
      if (flowRole !== 'controller') return;
      if (message.automatic && (deepScanPromise || Date.now() - lastDeepScanAt < 30000)) {
        scan();
        sendLibrary(true);
        return;
      }
      lastDeepScanAt = Date.now();
      void deepScan().catch(error => console.warn('[FLOW] Deep scan failed:', error));
      return;
    }
    if (message?.type === 'flow:resolve-track') {
      (async () => {
        await resolveItem(message.key);
        const identity = await identityForKey(message.key);
        if (!identity) throw new Error('VK не отдал ID трека. Прокрути плейлист и повтори.');
        const resolved = await runtime({ type: 'flow-resolve-audio', identity });
        if (!resolved?.ok || !resolved.mediaUrl) throw new Error(resolved?.error || 'VK не вернул аудиопоток');
        return resolved;
      })().then(result => appWindow()?.postMessage({ type: 'flow:resolved-track', requestId: message.requestId, ok: true, key: message.key, mediaUrl: result.mediaUrl, title: result.title, artist: result.artist }, '*'))
        .catch(error => appWindow()?.postMessage({ type: 'flow:resolved-track', requestId: message.requestId, ok: false, key: message.key, error: error.message }, '*'));
      return;
    }
    if (message?.type === 'flow:load-track') {
      loadQueue = loadQueue.then(() => loadExplicitDeck(message)).catch(error => {
        appWindow()?.postMessage({ type: 'flow:load-result', deck: message.deck, key: message.key, requestId: message.requestId, ok: false, error: error.message }, '*');
      });
      return;
    }
    if (message?.type === 'flow:deck-control') {
      commandExplicitDeck(message.deck, { action: 'transport', transport: message.action, currentTime: message.currentTime }).then(result => appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: true, result }, '*')).catch(error => appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: false, error: error.message }, '*'));
      return;
    }
    if (message?.type === 'flow:manual-load') {
      loadQueue = loadQueue.then(async () => commandExplicitDeck(message.deck, { action: 'load', key: message.key, identity: await identityForKey(message.key), currentTime: Number(message.currentTime || 0), playing: true })).then(async result => {
        await commandExplicitDeck(message.deck, { action: 'set-volume', value: Math.max(0, Math.min(1, Number(message.volume ?? 1))), play: true });
        appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: true, result }, '*');
      }).catch(error => appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: false, error: error.message }, '*'));
      return;
    }
    if (message?.type === 'flow:deck-sync') {
      syncExplicitDecks(message).then(result => appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: true, result }, '*')).catch(error => appWindow()?.postMessage({ type: 'flow:manual-result', requestId: message.requestId, ok: false, error: error.message }, '*'));
      return;
    }
    if (message?.type === 'flow:deck-rate') {
      commandExplicitDeck(message.deck, { action: 'set-rate', value: message.value }).catch(() => {});
      return;
    }
    if (message?.type === 'flow:deck-volume') {
      commandExplicitDeck(message.deck, { action: 'set-volume', value: message.value, play: false }).catch(() => {});
      return;
    }
    if (message?.type === 'flow:manual-crossfader') {
      applyManualCrossfader(message.value).catch(() => {});
      return;
    }
    if (message?.type === 'flow:native-control' && nativeFallback?.audio) {
      const audio = nativeFallback.audio;
      if (message.action === 'toggle') audio.paused ? audio.play().catch(() => {}) : audio.pause();
      if (message.action === 'play') audio.play().catch(() => {});
      if (message.action === 'pause') audio.pause();
      if (message.action === 'seek') {
        audio.currentTime = Math.max(0, Math.min(Number(message.currentTime || 0), audio.duration || Infinity));
        if (nativeFallback.shadow?.audio) nativeFallback.shadow.audio.currentTime = audio.currentTime;
      }
      if (dualShadowReady) runtime({ type: 'flow-shadow-command', command: { action: 'sync', key: nativeFallback.key, currentTime: Number(audio.currentTime || 0), playing: !audio.paused } }).catch(() => {});
    }
    if (message?.type === 'flow:stop-page-engine') {
      pageTransition = null;
      nativeFallback?.audio?.pause();
      destroyPageDeck('a'); destroyPageDeck('b');
      nativeFallback = null;
      dualShadowReady = false;
      loadQueue = loadQueue.then(() => Promise.all([
        commandExplicitDeck('a', { action: 'stop' }).catch(() => null),
        commandExplicitDeck('b', { action: 'stop' }).catch(() => null)
      ]));
    }
  });

  const launcher = document.createElement('button');
  launcher.id = 'flow-launcher';
  launcher.innerHTML = '<i></i><span>FLOW</span>';
  launcher.title = 'Включить FLOW';
  launcher.onclick = openFlow;
  document.body.appendChild(launcher);
  if (sessionStorage.getItem('flowAutoOpenOnMusic') === '1' && isVkMusicPage()) {
    sessionStorage.removeItem('flowAutoOpenOnMusic');
    setTimeout(openFlow, 450);
  }
  let scanTimer;
  new MutationObserver(records => {
    if (scanRunning) return;
    // Ignore DOM mutations made by FLOW itself and changes unrelated to track rows.
    const relevant = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      if (node.id === 'flow-frame-wrap' || node.id === 'flow-launcher' || node.classList?.contains('flow-action')) return false;
      return node.matches?.('.audio_row,[data-testid*=audio_row],[data-audio],[class*=AudioRow],[class*=TrackRow]') ||
        node.querySelector?.('.audio_row,[data-testid*=audio_row],[data-audio],[class*=AudioRow],[class*=TrackRow]');
    }));
    if (!relevant) return;
    clearTimeout(scanTimer); scanTimer = setTimeout(scan, 650);
  }).observe(document.documentElement, { childList: true, subtree: true });
  hydrateLibrary().finally(scan);
  function applyRole(role) {
    flowRole = role === 'shadow' ? 'shadow' : 'controller';
    launcher.style.display = flowRole === 'shadow' ? 'none' : '';
    if (flowRole === 'shadow') {
      shell?.classList.remove('open');
      nativeAudios().forEach(audio => { audio.volume = 0; });
    }
    return flowRole;
  }

  chrome.runtime.onMessage.addListener((message, _sender, reply) => {
    if (message?.type === 'flow:desktop-resolve-match') {
      // Search-results fallback: the exact row may not exist here, or VK may
      // block that upload in this region. Try the matching rows best first —
      // VK usually has several uploads of a song — and take the first that plays.
      (async () => {
        const key = await findMatchingKey(message.title, message.artist);
        if (!key) throw new Error('VK не нашёл этот трек в поиске');
        const candidates = [...document.querySelectorAll('[data-flow-key]')]
          .map(row => ({ row, track: rowMap.get(row.dataset.flowKey)?.track }))
          .filter(item => item.row.isConnected && item.track)
          .map(item => ({ ...item, score: matchScore(item.track, message.title, message.artist) }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
        let lastError = 'VK не отдал ID трека из поиска';
        for (const [index, { row }] of candidates.entries()) {
          const rowKey = row.dataset.flowKey;
          let identity = playbackIdentity(row);
          if (!identity) {
            // Identical uploads share a key; tag this row alone so the page reads its ID.
            row.dataset.flowKey = `flow-alt:${index}`;
            const result = await runtime({ type: 'flow-read-track-identity', key: row.dataset.flowKey }).catch(() => null);
            row.dataset.flowKey = rowKey;
            identity = result?.ok ? result.identity : null;
          }
          if (!identity) continue;
          const resolved = await runtime({ type: 'flow-resolve-audio', identity }).catch(error => ({ ok: false, error: error.message }));
          if (resolved?.ok && resolved.mediaUrl) return { ...resolved, matchedKey: rowKey };
          lastError = resolved?.error || 'VK не вернул аудиопоток';
        }
        throw new Error(lastError);
      })().then(reply).catch(error => reply({ ok: false, error: error.message }));
      return true;
    }
    if (message?.type === 'flow:desktop-resolve-track') {
      (async () => {
        await resolveItem(message.key);
        const identity = await identityForKey(message.key);
        if (!identity) throw new Error('VK не отдал ID трека. Открой музыку и повтори.');
        const resolved = await runtime({ type: 'flow-resolve-audio', identity });
        if (!resolved?.ok || !resolved.mediaUrl) throw new Error(resolved?.error || 'VK не вернул аудиопоток');
        return resolved;
      })().then(reply).catch(error => reply({ ok: false, error: error.message }));
      return true;
    }
    if (message?.type === 'flow:open') { openFlow(); reply?.({ ok: true }); return; }
    if (message?.type === 'flow:app-stop') { appWindow()?.postMessage({ type: 'flow:stop' }, '*'); reply?.({ ok: true }); return; }
    if (message?.type === 'flow:set-role') {
      reply({ ok: true, role: applyRole(message.role) }); return;
    }
    if (message?.type === 'flow:deck-command') {
      if (flowRole !== 'shadow') { reply({ ok: false, error: 'Команда deck пришла в основную вкладку' }); return; }
      handleDeckCommand(message.command).then(reply).catch(error => reply({ ok: false, error: error.message }));
      return true;
    }
    if (message?.type === 'flow:set-captured-deck') {
      capturedDeckName = ['a', 'b'].includes(message.deck) ? message.deck : '';
      reply({ ok: Boolean(capturedDeckName), deck: capturedDeckName }); return;
    }
    if (message?.type === 'flow:play-captured-track') {
      (async () => {
        let item = await resolveItem(message.key);
        if (!item?.row) throw new Error('Трек не найден в этой вкладке. Открой здесь тот же плейлист, что и в FLOW.');
        item.row.scrollIntoView({ block: 'center', inline: 'nearest' });
        await settle(); scan(); item = rowMap.get(message.key) || item;
        if (capturedDeck?.key !== message.key || capturedDeck.audio?.paused) {
          const rowBox = item.row.getBoundingClientRect();
          const preferred = item.row.querySelector('.audio_row__play_btn,[data-testid="audio_play"],button,[role="button"],[class*="play" i]') || item.row.querySelector('img')?.parentElement;
          const box = preferred?.getBoundingClientRect();
          const usable = box && box.width > 4 && box.height > 4 && box.left >= rowBox.left - 2 && box.right <= rowBox.right + 2;
          const x = Math.round(usable ? box.left + box.width / 2 : rowBox.left + Math.min(28, rowBox.width * .06));
          const y = Math.round(usable ? box.top + box.height / 2 : rowBox.top + rowBox.height / 2);
          const clicked = await runtime({ type: 'trusted-play', x, y });
          if (!clicked?.ok) throw new Error(clicked?.error || 'VK не принял клик по треку');
        }
        const audio = await waitForNativeAudio({ allowPaused: true });
        if (!audio) throw new Error('VK не создал аудиоплеер в этой вкладке');
        audio.volume = 1;
        if (Number(message.currentTime) > 0 && Number.isFinite(audio.duration)) audio.currentTime = Math.min(Number(message.currentTime), Math.max(0, audio.duration - .25));
        await audio.play();
        capturedDeck = { key: message.key, track: item.track, audio };
        return { ok: true, state: { key: message.key, title: item.track.title, artist: item.track.artist, currentTime: Number(audio.currentTime || 0), duration: Number.isFinite(audio.duration) ? audio.duration : 0, paused: audio.paused, rate: Number(audio.playbackRate || 1) } };
      })().then(reply).catch(error => reply({ ok: false, error: error.message }));
      return true;
    }
    if (message?.type === 'flow:captured-transport') {
      (async () => {
        const audio = capturedDeck?.audio;
        if (!audio) throw new Error('В этой деке ещё нет трека');
        if (message.action === 'toggle') audio.paused ? await audio.play() : audio.pause();
        if (message.action === 'play') await audio.play();
        if (message.action === 'pause' || message.action === 'stop') audio.pause();
        if (message.action === 'restart') { audio.currentTime = 0; await audio.play(); }
        if (message.action === 'seek') audio.currentTime = Math.max(0, Math.min(Number(message.currentTime || 0), audio.duration || Infinity));
        if (message.action === 'rate') audio.playbackRate = Math.max(.88, Math.min(1.12, Number(message.rate || 1)));
        return { ok: true, state: { key: capturedDeck.key, title: capturedDeck.track.title, artist: capturedDeck.track.artist, currentTime: Number(audio.currentTime || 0), duration: Number.isFinite(audio.duration) ? audio.duration : 0, paused: audio.paused, rate: Number(audio.playbackRate || 1) } };
      })().then(reply).catch(error => reply({ ok: false, error: error.message }));
      return true;
    }
  });
  runtime({ type: 'flow-get-role' }).then(result => {
    if (result?.ok) applyRole(result.role);
  }).catch(() => {});
  setInterval(() => {
    if (!capturedDeckName || !capturedDeck?.audio) return;
    const { audio, key, track } = capturedDeck;
    runtime({ type: 'flow-update-captured-state', state: { key, title: track.title, artist: track.artist, currentTime: Number(audio.currentTime || 0), duration: Number.isFinite(audio.duration) ? audio.duration : 0, paused: audio.paused, rate: Number(audio.playbackRate || 1) } }).catch(() => {});
  }, 120);
  setInterval(() => {
    if (!nativeFallback || !appWindow()) return;
    const audio = nativeFallback.audio;
    if (!audio) {
      appWindow().postMessage({ type: 'flow:native-state', state: { key: nativeFallback.key, title: nativeFallback.track.title, artist: nativeFallback.track.artist, currentTime: 0, duration: 0, paused: false, native: true, playerHidden: true, overlapBlocked: true } }, '*');
      return;
    }
    if (dualShadowReady && Date.now() - lastDualSyncAt > 2400) {
      lastDualSyncAt = Date.now();
      runtime({ type: 'flow-shadow-command', command: { action: 'sync', key: nativeFallback.key, currentTime: Number(audio.currentTime || 0), playing: !audio.paused } }).then(result => { dualShadowReady = Boolean(result?.ok); }).catch(() => { dualShadowReady = false; });
    }
    const shadowAudio = nativeFallback.shadow?.audio;
    if (shadowAudio) {
      if (audio.paused && !shadowAudio.paused) shadowAudio.pause();
      if (!audio.paused && shadowAudio.paused) shadowAudio.play().catch(() => {});
      shadowAudio.playbackRate = Number(audio.playbackRate || 1);
      if (!audio.paused && Math.abs(Number(shadowAudio.currentTime || 0) - Number(audio.currentTime || 0)) > .38) shadowAudio.currentTime = Number(audio.currentTime || 0);
    }
    if (!audio.paused) {
      const activeItem = [...rowMap.values()].find(item => {
        const row = item.row;
        if (!row?.isConnected) return false;
        return row.matches('.audio_row__current,.audio_row__playing,[data-state="playing"],[aria-current="true"]') || Boolean(row.querySelector('button[aria-label*="Пауза" i],[data-testid="audio_pause"],[class*="pause" i]'));
      });
      if (activeItem?.track?.key && activeItem.track.key !== nativeFallback.key) {
        nativeFallback.key = activeItem.track.key;
        nativeFallback.track = activeItem.track;
      }
    }
    appWindow().postMessage({
      type: 'flow:native-state',
      state: {
        key: nativeFallback.key,
        title: nativeFallback.track.title,
        artist: nativeFallback.track.artist,
        currentTime: Number(audio.currentTime || 0),
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        paused: audio.paused,
        native: true,
        pageEngine: Boolean(nativeFallback.pageEngine),
        overlapReady: Boolean(dualShadowReady || nativeFallback.shadow),
        overlapBlocked: nativeFallback.shadowStatus === 'blocked',
        transferring: Boolean(nativeFallback.transferring)
      }
    }, '*');
  }, 100);
  let explicitStatePending = false;
  setInterval(() => {
    if (!LEGACY_NATIVE_ENGINE || flowRole !== 'controller' || !appWindow() || explicitStatePending) return;
    explicitStatePending = true;
    Promise.all([
      commandExplicitDeck('a', { action: 'state' }).catch(() => ({ ok: false })),
      commandExplicitDeck('b', { action: 'state' }).catch(() => ({ ok: false }))
    ]).then(([a, b]) => appWindow()?.postMessage({ type: 'flow:dual-state', decks: { a: a?.ok ? a : null, b: b?.ok ? b : null } }, '*')).finally(() => { explicitStatePending = false; });
  }, 180);
  let desktopCommandBusy = false;
  setInterval(() => {
    if (flowRole !== 'controller' || desktopCommandBusy) return;
    desktopCommandBusy = true;
    runtime({ type: 'flow-desktop-poll' }).then(async result => {
      for (const command of result?.commands || []) {
        if (command.type !== 'resolve') continue;
        try {
          await resolveItem(command.key);
          const identity = await identityForKey(command.key);
          if (!identity) throw new Error('VK did not expose this track identity. Open it in the visible library and retry.');
          const resolved = await runtime({ type: 'flow-resolve-audio', identity });
          if (!resolved?.ok || !resolved.mediaUrl) throw new Error(resolved?.error || 'VK did not return an audio stream');
          const uploaded = await runtime({
            type: 'flow-desktop-upload',
            jobId: command.id,
            mediaUrl: resolved.mediaUrl,
            title: resolved.title || command.title,
            artist: resolved.artist || command.artist
          });
          if (!uploaded?.ok) throw new Error(uploaded?.error || 'FLOW Desktop could not cache this track');
        } catch (error) {
          await runtime({ type: 'flow-desktop-error', jobId: command.id, error: error.message }).catch(() => {});
        }
      }
    }).catch(() => {}).finally(() => { desktopCommandBusy = false; });
  }, 1200);
})();
