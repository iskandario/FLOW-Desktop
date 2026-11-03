const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const extensionMode = typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
const library = new Map();
const selected = new Set();
const pendingLoads = new Map();
let analysis = {};
let route = [];
let arc = 'wave';
let query = '';
let analyzing = false;
let flowRunning = false;
let transitionPending = false;
let activeDeck = 'a';
let currentIndex = 0;
let preloadKey = '';
let latestState = null;
let libraryScanning = false;
let pageContext = {};
let analysisCurrentKey = '';
let libraryInitialized = false;
let nativeState = null;
let nativeMode = false;
let planningNext = false;
let dualDeckStates = { a: null, b: null };
let nativeTransitionUntil = 0;
let transitionRetryAt = 0;

const demoTracks = [
  ['Midnight City', 'M83', 105, .48, 'neon', '#64e7ff'],
  ['Borderline', 'Tame Impala', 117, .56, 'groove', '#6ef3da'],
  ['Glue', 'Bicep', 129, .72, 'peak', '#e8ff5b'],
  ['Innerbloom', 'RÜFÜS DU SOL', 122, .64, 'slow burn', '#ff9d72'],
  ['Nightcall', 'Kavinsky', 91, .38, 'afterglow', '#9b8cff'],
  ['Music Sounds Better With You', 'Stardust', 124, .81, 'peak', '#e8ff5b'],
  ['Tadow', 'Masego & FKJ', 122, .52, 'groove', '#6ef3da'],
  ['Genesis', 'Grimes', 166, .78, 'rush', '#ff6e9f']
].map((item, index) => ({ key: `demo:${index}`, title: item[0], artist: item[1], demo: { bpm: item[2], energy: item[3], vibeLabel: item[4], vibeColor: item[5], confidence: .42, brightness: .5, ready: true } }));

function escapeHtml(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 3200);
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
}

function postDeckControl(deck, action, currentTime) {
  window.parent.postMessage({ type: 'flow:deck-control', requestId: crypto.randomUUID(), deck, action, currentTime }, '*');
}

function renderManualDeck(deck) {
  const upper = deck.toUpperCase();
  const state = dualDeckStates[deck];
  const seek = $(`#manualSeek${upper}`);
  if (!seek) return;
  $(`#manualTitle${upper}`).textContent = state?.title || `Deck ${upper}`;
  $(`#manualArtist${upper}`).textContent = state?.artist || 'трек не загружен';
  $(`#manualTime${upper}`).textContent = `${formatTime(state?.currentTime)} / ${formatTime(state?.duration)}`;
  seek.max = Number(state?.duration || 100); seek.value = Number(state?.currentTime || 0);
  $(`#manualPlay${upper}`).textContent = state?.paused === false ? 'Ⅱ' : '▶';
  if (state?.volume != null && document.activeElement !== $(`#manualVolume${upper}`)) $(`#manualVolume${upper}`).value = state.volume;
  if (state?.rate != null && document.activeElement !== $(`#manualRate${upper}`)) {
    $(`#manualRate${upper}`).value = state.rate;
    $(`#manualRateOut${upper}`).textContent = `${((state.rate - 1) * 100).toFixed(1)}%`;
  }
}

function renderManualConsole() { renderManualDeck('a'); renderManualDeck('b'); }

async function runtime(message) {
  if (!extensionMode) return demoRuntime(message);
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    if (/context invalidated/i.test(error?.message || '')) window.parent.postMessage({ type: 'flow:context-invalidated' }, '*');
    throw error;
  }
}

async function storageGet(keys) {
  if (!extensionMode) return {};
  if (chrome.storage?.local) return chrome.storage.local.get(keys);
  const result = await runtime({ type: 'flow-storage-get', keys });
  return result?.value || {};
}

async function storageSet(value) {
  if (!extensionMode) return;
  if (chrome.storage?.local) return chrome.storage.local.set(value);
  const result = await runtime({ type: 'flow-storage-set', value });
  if (!result?.ok) throw new Error(result?.error || 'Не удалось сохранить настройки');
}

let demoState = { a: null, b: null, cross: -1, engineState: 'preview', transition: null };
async function demoRuntime(message) {
  if (message.type === 'get-mixer-state') return demoState;
  if (message.type === 'stop-all' || message.type === 'reset-decks') { demoState = { a: null, b: null, cross: -1, engineState: 'preview', transition: null }; return { ok: true }; }
  if (message.type === 'deck-transport') {
    const deck = demoState[message.deck];
    if (deck && message.action === 'toggle') deck.paused = !deck.paused;
    return { ok: true };
  }
  if (message.type === 'auto-transition') return { ok: true, mode: 'beatmatch', duration: .4, rate: 1 };
  return { ok: true };
}

async function hydrate() {
  if (!extensionMode) {
    for (const track of demoTracks) { library.set(track.key, track); analysis[track.key] = track.demo; selected.add(track.key); }
    pageContext = { title: 'Демонстрационная коллекция' };
    buildRoute(); renderAll(); return;
  }
  const stored = await storageGet(['flowAnalysis', 'flowSelected', 'flowArc']);
  analysis = stored.flowAnalysis || {};
  for (const key of stored.flowSelected || []) selected.add(key);
  if (['wave', 'rise', 'cruise'].includes(stored.flowArc)) arc = stored.flowArc;
  $$('#arcPicker button').forEach(button => button.classList.toggle('active', button.dataset.arc === arc));
}

function savePreferences() {
  if (!extensionMode) return;
  storageSet({ flowSelected: [...selected], flowArc: arc }).catch(() => {});
}

function featureFor(track) {
  return analysis[track.key] || track.demo || null;
}

function targetEnergy(position) {
  const x = clamp(position, 0, 1);
  if (arc === 'rise') return .25 + x * .68;
  if (arc === 'cruise') return .56 + Math.sin(x * Math.PI * 4) * .06;
  return .27 + Math.sin(x * Math.PI) * .67 - Math.max(0, x - .82) * .35;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function normalizedTempo(bpm) {
  let value = Number(bpm || 0);
  while (value && value < 90) value *= 2;
  while (value > 180) value /= 2;
  return value;
}

function compatibility(left, right) {
  const a = featureFor(left);
  const b = featureFor(right);
  if (!a?.ready || !b?.ready) return { score: 0, tempo: 99, label: 'ещё не изучено' };
  const tempo = Math.abs(normalizedTempo(a.bpm) - normalizedTempo(b.bpm));
  const energy = Math.abs(Number(a.energy) - Number(b.energy));
  const brightness = Math.abs(Number(a.brightness || .5) - Number(b.brightness || .5));
  const artistPenalty = left.artist === right.artist ? .12 : 0;
  const raw = 1 - clamp(tempo / 28 * .55 + energy * .3 + brightness * .08 + artistPenalty, 0, 1);
  return { score: Math.round(raw * 100), tempo, label: raw > .8 ? 'идеальная связка' : raw > .62 ? 'мягкая связка' : raw > .43 ? 'контрастный ход' : 'безопасный переход' };
}

function chooseRoute(tracks) {
  const ready = tracks.filter(track => featureFor(track)?.ready);
  const pending = tracks.filter(track => !featureFor(track)?.ready);
  if (!ready.length) return [...tracks];
  const result = [];
  const pool = [...ready];
  let current = pool.splice(pool.reduce((best, track, index) => Math.abs(featureFor(track).energy - targetEnergy(0)) < Math.abs(featureFor(pool[best]).energy - targetEnergy(0)) ? index : best, 0), 1)[0];
  result.push(current);
  while (pool.length) {
    const position = result.length / Math.max(1, ready.length - 1);
    const target = targetEnergy(position);
    let bestIndex = 0;
    let bestCost = Infinity;
    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index];
      const link = compatibility(current, candidate);
      const features = featureFor(candidate);
      const targetCost = Math.abs(features.energy - target) * .52;
      const linkCost = (1 - link.score / 100) * .48;
      const cost = targetCost + linkCost;
      if (cost < bestCost) { bestCost = cost; bestIndex = index; }
    }
    current = pool.splice(bestIndex, 1)[0];
    result.push(current);
  }
  return [...result, ...pending];
}

function chooseFollowing(current, tracks) {
  const result = [];
  const pool = [...tracks];
  let anchor = current;
  while (pool.length) {
    const position = (currentIndex + result.length + 1) / Math.max(1, route.length - 1);
    const target = targetEnergy(position);
    let bestIndex = 0;
    let bestCost = Infinity;
    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index];
      const features = featureFor(candidate);
      const link = compatibility(anchor, candidate);
      const unknownPenalty = features?.ready ? 0 : .42;
      const cost = unknownPenalty + (features?.ready ? Math.abs(features.energy - target) * .5 : 0) + (1 - link.score / 100) * .5;
      if (cost < bestCost) { bestCost = cost; bestIndex = index; }
    }
    anchor = pool.splice(bestIndex, 1)[0];
    result.push(anchor);
  }
  return result;
}

function selectedTracks() {
  const chosen = [...selected].map(key => library.get(key)).filter(Boolean);
  return chosen.length ? chosen : [...library.values()];
}

function buildRoute() {
  const playingKey = flowRunning ? route[currentIndex]?.key : '';
  route = chooseRoute(selectedTracks());
  if (playingKey) {
    const anchoredIndex = route.findIndex(track => track.key === playingKey);
    if (anchoredIndex >= 0) currentIndex = anchoredIndex;
  }
  if (currentIndex >= route.length) currentIndex = 0;
  renderQueue(); drawEnergy(); updateTransitionPreview();
}

function ensureUpcoming() {
  if (currentIndex < route.length - 1) return true;
  const current = route[currentIndex];
  if (!current) return false;
  const candidates = selectedTracks().filter(track => track.key !== current.key);
  if (!candidates.length) return false;
  route = [current, ...chooseFollowing(current, candidates)];
  currentIndex = 0;
  renderQueue(); drawEnergy(); updateTransitionPreview();
  return route.length > 1;
}

function renderLibrary() {
  const list = [...library.values()].filter(track => `${track.title} ${track.artist}`.toLowerCase().includes(query));
  $('#libraryCount').textContent = libraryScanning ? `${list.length} · сканирую` : list.length;
  $('#sourceCount').textContent = library.size;
  $('#sourceMeta').textContent = libraryScanning ? 'читаю страницу VK…' : `${library.size} треков найдено`;
  $('#sourceTitle').textContent = pageContext.title?.replace(/\s*\|\s*VK.*$/i, '') || 'Треки на этой странице';
  $('#selectedCount').textContent = selected.size;
  if (!list.length) {
    $('#trackList').innerHTML = '<div class="library-empty">Открой «Мою музыку» или плейлист VK — FLOW увидит треки на странице.</div>';
    return;
  }
  $('#trackList').innerHTML = list.map(track => {
    const features = featureFor(track);
    const energy = Math.round(Number(features?.energy || 0) * 100);
    const color = features?.vibeColor || '#555964';
    const status = track.key === analysisCurrentKey ? 'working' : features?.ready ? 'ready' : '';
    return `<div class="track-row ${selected.has(track.key) ? 'selected' : ''}" data-key="${escapeHtml(track.key)}">
      <span class="check">${selected.has(track.key) ? '✓' : ''}</span>
      <span class="track-main"><b>${escapeHtml(track.title)}</b><span>${escapeHtml(track.artist || 'Неизвестный артист')}</span></span>
      <span class="vibe-tag" style="--vibe:${color}">${features?.vibeLabel || 'не изучен'}</span>
      <span class="track-bpm">${features?.bpm ? `${Math.round(features.bpm)}` : '—'}</span>
      <span class="energy-meter" style="--vibe:${color}"><i><em style="width:${energy}%"></em></i>${features?.ready ? energy : '—'}</span>
      <span class="status-mark ${status}"></span>
    </div>`;
  }).join('');
  $$('.track-row').forEach(row => row.onclick = () => {
    selected.has(row.dataset.key) ? selected.delete(row.dataset.key) : selected.add(row.dataset.key);
    savePreferences(); buildRoute(); renderLibrary();
  });
}

function renderQueue() {
  if (!route.length) {
    $('#queueList').innerHTML = '<div class="empty-state"><i>⌁</i><b>Здесь появится история вечера</b><span>Выбери музыку и собери поток.</span></div>';
    return;
  }
  $('#queueList').innerHTML = route.map((track, index) => {
    const features = featureFor(track);
    const bridge = index ? compatibility(route[index - 1], track) : null;
    return `${index ? `<div class="queue-bridge">${bridge.score ? `${bridge.score}% · ${bridge.label}` : 'ожидает анализа'}</div>` : ''}<div class="queue-item ${flowRunning && index === currentIndex ? 'active' : ''}" data-index="${index}">
      <span class="queue-index">${flowRunning && index === currentIndex ? '▶' : String(index + 1).padStart(2, '0')}</span>
      <span class="queue-copy"><b>${escapeHtml(track.title)}</b><span>${escapeHtml(track.artist || 'Неизвестный артист')}</span></span>
      <span class="queue-data"><b>${features?.bpm ? `${Math.round(features.bpm)} BPM` : '— BPM'}</b><span>${features?.vibeLabel || 'не изучен'}</span></span>
    </div>`;
  }).join('');
}

function drawEnergy() {
  const canvas = $('#energyCanvas');
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(320, canvas.clientWidth);
  const height = Math.max(80, canvas.clientHeight);
  canvas.width = width * ratio; canvas.height = height * ratio;
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio); context.clearRect(0, 0, width, height);
  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#8d73ff'); gradient.addColorStop(.55, '#e8ff5b'); gradient.addColorStop(1, '#6ef3da');
  const points = route.length ? route.map((track, index) => ({ x: 10 + index / Math.max(1, route.length - 1) * (width - 20), y: height - 10 - Number(featureFor(track)?.energy ?? targetEnergy(index / Math.max(1, route.length - 1))) * (height - 25), ready: featureFor(track)?.ready })) : Array.from({ length: 18 }, (_, index) => ({ x: 10 + index / 17 * (width - 20), y: height - 10 - targetEnergy(index / 17) * (height - 25), ready: false }));
  context.beginPath(); context.moveTo(points[0].x, height - 8); points.forEach(point => context.lineTo(point.x, point.y)); context.lineTo(points.at(-1).x, height - 8); context.closePath();
  const fill = context.createLinearGradient(0, 0, 0, height); fill.addColorStop(0, 'rgba(232,255,91,.16)'); fill.addColorStop(1, 'rgba(141,115,255,0)'); context.fillStyle = fill; context.fill();
  context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.strokeStyle = gradient; context.lineWidth = 2; context.stroke();
  points.forEach(point => { context.beginPath(); context.arc(point.x, point.y, point.ready ? 3.2 : 2.2, 0, Math.PI * 2); context.fillStyle = point.ready ? '#e8ff5b' : '#555963'; context.fill(); });
}

function updateAnalysisProgress(done = null, total = null) {
  const all = selectedTracks();
  const ready = done ?? all.filter(track => featureFor(track)?.ready).length;
  const count = total ?? all.length;
  const percent = count ? Math.round(ready / count * 100) : 0;
  $('#analysisPercent').textContent = `${percent}%`;
  $('#analysisBar').style.width = `${percent}%`;
  $('#analysisLabel').textContent = analyzing ? `Слушаю ${ready + 1} из ${count}` : ready ? `${ready} из ${count} изучено` : 'Музыка ещё не изучена';
}

function transitionPlan(left, right) {
  if (!left || !right) return { duration: 0, mode: 'none', reason: 'Нужны как минимум два трека.' };
  const a = featureFor(left); const b = featureFor(right); const link = compatibility(left, right);
  const rate = a?.bpm && b?.bpm ? normalizedTempo(a.bpm) / normalizedTempo(b.bpm) : 1;
  const beatSafe = a?.ready && b?.ready && a.confidence >= .08 && b.confidence >= .08 && rate >= .88 && rate <= 1.12;
  if (beatSafe) {
    const seconds = clamp(Math.round(8 * 4 * 60 / normalizedTempo(a.bpm)), 11, 22);
    return { duration: seconds, mode: 'beatmatch', reason: `${link.score}% совместимость · темп и фаза сведутся по 8 тактам.` };
  }
  return { duration: link.score > 55 ? 9 : 7, mode: 'safe-blend', reason: `${link.score || '—'}% совместимость · безопасный equal-power blend без насильственного beatmatch.` };
}

function updateTransitionPreview() {
  const current = route[currentIndex]; const next = route[currentIndex + 1]; const plan = transitionPlan(current, next);
  $('#transitionTitle').textContent = next ? `${current.title} → ${next.title}` : route.length ? 'Финал потока' : 'Сначала соберём маршрут';
  $('#transitionReason').textContent = plan.reason;
  $('#transitionDuration').textContent = plan.duration || '—';
}

function renderNow(state) {
  const current = route[currentIndex];
  const next = route[currentIndex + 1];
  const data = state?.[activeDeck];
  if (!current || !flowRunning) return;
  const features = featureFor(current) || data || {};
  const duration = Number(data?.duration || 0); const elapsed = Number(data?.currentTime || 0);
  $('#nowTitle').textContent = current.title;
  $('#nowArtist').textContent = current.artist || 'Неизвестный артист';
  $('#nowBpm').textContent = features.bpm ? `${Math.round(features.bpm)} BPM` : 'изучаю BPM';
  $('#nowVibe').textContent = features.vibeLabel || 'изучаю характер';
  const previous = route[currentIndex - 1]; const fit = previous ? compatibility(previous, current).score : 100;
  $('#nowFit').textContent = `${fit}% совместимость`;
  $('#elapsed').textContent = formatTime(elapsed); $('#remaining').textContent = `−${formatTime(Math.max(0, duration - elapsed))}`;
  $('#timelineBar').style.width = `${duration ? clamp(elapsed / duration * 100, 0, 100) : 0}%`;
  $('#nowCard').style.setProperty('--now-color', features.vibeColor || '#8d73ff');
  $('#coverGlyph').textContent = (current.title || 'F').slice(0, 1).toUpperCase();
  $('#nowCard').classList.toggle('playing', data ? !data.paused : true);
  $('#play').textContent = data?.paused ? '▶' : 'Ⅱ';
  $('#startParty span').textContent = 'Поток запущен';
  const plan = transitionPlan(current, next);
  const transitionPercent = duration ? clamp(plan.duration / duration * 100, 5, 24) : 9;
  $('#blendCurrentTitle').textContent = current.title;
  $('#blendNextTitle').textContent = next?.title || 'финал потока';
  $('#blendStatus').textContent = next ? (nativeMode ? 'две независимые VK-деки готовы' : preloadKey === next.key ? `${plan.mode === 'beatmatch' ? 'beatmatch' : 'safe blend'} готов` : 'готовлю следующий трек') : 'последний трек';
  $('#blendCurrentProgress').style.width = `${duration ? clamp(elapsed / duration * 100, 0, 100) : 0}%`;
  $('#blendZone').style.width = `${transitionPercent}%`;
  $('#blendNextReady').style.opacity = next && (nativeMode || preloadKey === next.key) ? '1' : '.28';
  $('#seekTrack').max = duration || 100;
  $('#seekTrack').value = elapsed;
  const nextFeatures = next ? featureFor(next) : null;
  $('#blendCurrentProgress').style.background = `linear-gradient(90deg, ${features.vibeColor || '#6b4dff'}, #a348ff)`;
  $('#blendNextReady').style.background = `linear-gradient(90deg, ${nextFeatures?.vibeColor || '#00c7ff'}, #00ffd0)`;
  window.flowAura?.update({
    playing: data ? !data.paused : true,
    bpm: Number(features.bpm || data?.bpm || state?.spectrum?.detectedBpm || 112),
    energy: Number(features.energy ?? data?.energy ?? (Number(state?.spectrum?.rms || 0) * 4 || .5)),
    color: features.vibeColor || data?.vibeColor || '#7a62ff',
    waveform: state?.spectrum?.waveform || data?.waveform || [],
    spectrum: state?.spectrum?.bands || [],
    bass: Number(state?.spectrum?.bass || 0),
    lowMid: Number(state?.spectrum?.lowMid || 0),
    high: Number(state?.spectrum?.high || 0),
    rms: Number(state?.spectrum?.rms || 0),
    beatPulse: Number(state?.spectrum?.beatPulse || 0),
    beatIndex: Number(state?.spectrum?.beatIndex || 0)
  });
}

function renderAll() { renderLibrary(); renderQueue(); drawEnergy(); updateAnalysisProgress(); updateTransitionPreview(); }

function requestLoad(track, deck, analysisMode = false, nativeTransition = false, prepareOnly = false) {
  if (!extensionMode) {
    const features = featureFor(track);
    demoState[deck] = { key: track.key, title: track.title, artist: track.artist, currentTime: 0, duration: 220, paused: false, outputEnabled: !analysisMode, analysisMode, ...features };
    return Promise.resolve({ ok: true, track });
  }
  const requestId = crypto.randomUUID();
  const incomingFeatures = featureFor(track) || {};
  const masterFeatures = featureFor(route[currentIndex]) || {};
  const plan = nativeTransition ? transitionPlan(route[currentIndex], track) : { duration: 9 };
  return new Promise((resolve, reject) => {
    pendingLoads.set(requestId, { resolve, reject, timer: setTimeout(() => { pendingLoads.delete(requestId); reject(new Error('VK не ответил за 25 секунд')); }, 25000) });
    window.parent.postMessage({ type: 'flow:load-track', requestId, key: track.key, deck, analysisMode, nativeTransition, prepareOnly, incomingBpm: Number(incomingFeatures.bpm || 0), masterBpm: Number(masterFeatures.bpm || 0), beatOffset: Number(incomingFeatures.beatOffset || 0), transitionDuration: Number(plan.duration || 9) }, '*');
  });
}

async function preloadNativeNext(delay = 0) {
  ensureUpcoming();
  const next = route[currentIndex + 1];
  if (!flowRunning || !nativeMode || !next) { preloadKey = ''; updateTransitionPreview(); return; }
  if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
  if (!flowRunning || !nativeMode || route[currentIndex + 1]?.key !== next.key) return;
  const deck = activeDeck === 'a' ? 'b' : 'a';
  $('#engineText').textContent = `буферизую · ${next.title}`;
  try {
    const loaded = await requestLoad(next, deck, false, false, true);
    if (!loaded.prepared) throw new Error('Дека не подтвердила предзагрузку');
    preloadKey = next.key;
    $('#engineText').textContent = 'две деки готовы · переход мгновенный';
  } catch (error) {
    preloadKey = '';
    $('#engineText').textContent = 'следующий трек загрузится при переходе';
  }
  updateTransitionPreview();
}

async function waitForAnalysis(track, deck, timeout = 16000) {
  if (!extensionMode) return featureFor(track);
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const state = await runtime({ type: 'get-mixer-state' });
    const data = state?.[deck];
    if (data?.key === track.key && data.ready) return data;
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  throw new Error('Не удалось уверенно определить BPM за отведённое время');
}

async function analyzeCollection() {
  if (analyzing) return;
  let tracks = selectedTracks();
  const scope = $('#scope').value;
  if (scope !== 'all') tracks = tracks.slice(0, Number(scope));
  if (!tracks.length) return toast('Сначала открой музыку или плейлист VK');
  analyzing = true; flowRunning = false; $('#build').disabled = true; $('.engine-state').classList.add('working');
  try {
    await runtime({ type: 'reset-decks' });
    let done = tracks.filter(track => featureFor(track)?.ready).length;
    updateAnalysisProgress(done, tracks.length);
    for (const track of tracks) {
      if (featureFor(track)?.ready) continue;
      analysisCurrentKey = track.key; renderLibrary();
      $('#engineText').textContent = `слушаю · ${track.title}`;
      await requestLoad(track, 'a', true);
      try {
        const data = await waitForAnalysis(track, 'a');
        analysis[track.key] = { bpm: data.bpm, beatOffset: data.beatOffset, confidence: data.confidence, energy: data.energy, brightness: data.brightness, vibe: data.vibe, vibeLabel: data.vibeLabel, vibeColor: data.vibeColor, ready: true, updatedAt: Date.now() };
        if (extensionMode) await storageSet({ flowAnalysis: analysis });
      } catch (error) {
        analysis[track.key] = { ready: false, error: error.message, updatedAt: Date.now() };
      }
      done += 1; updateAnalysisProgress(done, tracks.length); buildRoute(); renderLibrary();
    }
    buildRoute(); toast('Маршрут готов. Можно запускать поток.');
  } catch (error) { toast(error.message || 'Анализ остановлен'); }
  finally {
    analyzing = false; analysisCurrentKey = ''; $('#build').disabled = false; $('.engine-state').classList.remove('working'); $('#engineText').textContent = 'маршрут готов'; renderAll();
  }
}

async function preloadNext() {
  ensureUpcoming();
  const next = route[currentIndex + 1];
  if (!flowRunning || !next) { preloadKey = ''; updateTransitionPreview(); return; }
  const deck = activeDeck === 'a' ? 'b' : 'a';
  preloadKey = next.key;
  $('#engineText').textContent = `готовлю переход · ${next.title}`;
  try { await requestLoad(next, deck, false); $('#engineText').textContent = 'следующий трек готов'; }
  catch (error) { preloadKey = ''; toast(`Не удалось подготовить «${next.title}»: ${error.message}`); }
  updateTransitionPreview();
}

async function rememberAnalysis(track, data) {
  analysis[track.key] = {
    bpm: data.bpm,
    beatOffset: data.beatOffset,
    confidence: data.confidence,
    energy: data.energy,
    brightness: data.brightness,
    vibe: data.vibe,
    vibeLabel: data.vibeLabel,
    vibeColor: data.vibeColor,
    ready: true,
    updatedAt: Date.now()
  };
  if (extensionMode) await storageSet({ flowAnalysis: analysis });
}

async function planUpcoming() {
  if (!flowRunning || nativeMode || planningNext || currentIndex >= route.length - 1) return;
  planningNext = true;
  const hiddenDeck = activeDeck === 'a' ? 'b' : 'a';
  try {
    const remaining = route.slice(currentIndex + 1);
    const unknown = remaining.filter(track => !featureFor(track)?.ready).slice(0, 4);
    let prepared = remaining.length - unknown.length;
    for (const track of unknown) {
      if (!flowRunning || nativeMode) return;
      analysisCurrentKey = track.key;
      $('#engineText').textContent = `слушаю следующий вариант · ${track.title}`;
      try {
        await requestLoad(track, hiddenDeck, true);
        const data = await waitForAnalysis(track, hiddenDeck, 13000);
        await rememberAnalysis(track, data);
      } catch {}
      prepared += 1;
      updateAnalysisProgress(Math.min(prepared, remaining.length), remaining.length);
      renderLibrary();
    }
    const prefix = route.slice(0, currentIndex + 1);
    const reordered = chooseFollowing(route[currentIndex], route.slice(currentIndex + 1));
    route = [...prefix, ...reordered];
    renderQueue(); drawEnergy(); updateTransitionPreview();
    await preloadNext();
  } finally {
    analysisCurrentKey = '';
    planningNext = false;
    renderLibrary();
  }
}

async function startFlow() {
  buildRoute();
  if (!route.length) return toast('Открой «Мою музыку» или плейлист VK');
  currentIndex = 0; activeDeck = 'a'; transitionPending = false; preloadKey = ''; flowRunning = true;
  nativeMode = false; nativeState = null; nativeTransitionUntil = 0; transitionRetryAt = 0;
  renderQueue(); updateTransitionPreview();
  $('#startParty span').textContent = 'FLOW запускается';
  $('#engineText').textContent = 'включаю первый трек';
  try {
    window.parent.postMessage({ type: 'flow:stop-page-engine' }, '*');
    await runtime({ type: 'reset-decks' });
    await runtime({ type: 'mixer-control', control: 'cross', value: -1 });
    const loaded = await requestLoad(route[0], 'a', false);
    nativeMode = Boolean(loaded.native);
    renderQueue(); updateTransitionPreview();
    toast(nativeMode ? 'Музыка играет через VK. FLOW продолжит готовить маршрут.' : 'Музыка уже играет. FLOW готовит продолжение.');
    if (nativeMode) { $('#engineText').textContent = 'играет через VK · готовлю продолжение'; preloadNativeNext(); }
    else planUpcoming();
  } catch (error) {
    flowRunning = false; nativeMode = false; nativeState = null;
    $('#startParty span').textContent = 'Включить FLOW';
    $('#play').textContent = '▶';
    $('#engineText').textContent = error.message || 'VK не подтвердил запуск';
    $('#nowCard').classList.remove('playing');
    window.flowAura?.update({ playing: false, spectrum: [] });
    toast(error.message || 'Не удалось запустить поток');
  }
}

async function advanceNative() {
  if (!flowRunning || transitionPending || Date.now() < nativeTransitionUntil || Date.now() < transitionRetryAt) return;
  if (!ensureUpcoming()) {
    postDeckControl(activeDeck, 'restart');
    return;
  }
  transitionPending = true;
  const nextIndex = currentIndex + 1;
  const nextDeck = activeDeck === 'a' ? 'b' : 'a';
  try {
    const loaded = await requestLoad(route[nextIndex], nextDeck, false, true);
    currentIndex = nextIndex;
    activeDeck = nextDeck;
    nativeMode = Boolean(loaded.native);
    transitionRetryAt = 0;
    nativeTransitionUntil = loaded.transition ? Number(loaded.transition.startAt || Date.now()) + Number(loaded.transition.duration || 0) : 0;
    nativeState = null;
    renderQueue(); updateTransitionPreview();
    toast(loaded.overlap ? 'Два трека звучат одновременно · выполняю сведение' : 'Этот поток VK не дал клонировать себя · выполнено обычное переключение');
    if (!nativeMode) planUpcoming();
    else preloadNativeNext(Math.max(0, nativeTransitionUntil - Date.now() + 180));
  } catch (error) {
    transitionRetryAt = Date.now() + 900;
    if (route.length - currentIndex > 2) {
      const [failed] = route.splice(nextIndex, 1);
      route.push(failed);
      renderQueue(); updateTransitionPreview();
    }
    toast(`${error.message || 'Не удалось включить трек'} · пробую следующий`);
  }
  finally { transitionPending = false; }
}

async function performTransition(forced = false) {
  if (nativeMode) return advanceNative();
  if (!flowRunning || transitionPending) return;
  if (!ensureUpcoming()) {
    await runtime({ type: 'deck-transport', deck: activeDeck, action: 'restart' }).catch(() => {});
    return;
  }
  const next = route[currentIndex + 1];
  if (preloadKey !== next.key) return forced ? toast('Следующий трек ещё готовится') : undefined;
  const from = activeDeck; const to = activeDeck === 'a' ? 'b' : 'a'; const plan = transitionPlan(route[currentIndex], next);
  transitionPending = true; $('#engineText').textContent = plan.mode === 'beatmatch' ? 'свожу по фразе и темпу' : 'делаю безопасный переход';
  try {
    const result = await runtime({ type: 'auto-transition', from, to, duration: forced ? Math.min(6, plan.duration) : plan.duration });
    if (!result?.ok) throw new Error(result?.error || 'Переход не выполнен');
    activeDeck = to; currentIndex += 1; preloadKey = ''; renderQueue(); updateTransitionPreview();
    await preloadNext();
  } catch (error) { toast(error.message || 'Переход не выполнен'); }
  finally { transitionPending = false; }
}

async function refresh() {
  try {
    const state = await runtime({ type: 'get-mixer-state' });
    if (nativeMode) {
      if (dualDeckStates.a) state.a = { ...(state.a || {}), ...dualDeckStates.a };
      if (dualDeckStates.b) state.b = { ...(state.b || {}), ...dualDeckStates.b };
      if (!dualDeckStates[activeDeck] && nativeState) state[activeDeck] = { ...(state[activeDeck] || {}), ...nativeState };
    }
    latestState = state;
    if (!state) return;
    if (flowRunning) {
      const current = state[activeDeck];
      if (nativeMode && state.spectrum?.active && route[currentIndex]) {
        const live = state.spectrum;
        const previous = analysis[route[currentIndex].key] || {};
        const features = {
          ...previous,
          bpm: Number(live.detectedBpm || previous.bpm || 0),
          confidence: Number(live.confidence || previous.confidence || 0),
          energy: clamp(Number(live.rms || 0) * 4, 0, 1),
          brightness: clamp(Number(live.high || 0), 0, 1)
        };
        const vibe = vibeFor(features);
        analysis[route[currentIndex].key] = { ...features, vibe: vibe.id, vibeLabel: vibe.label, vibeColor: vibe.color, ready: features.confidence > .2, updatedAt: Date.now() };
      }
      renderNow(state);
      if (current?.ready && current.key) {
        analysis[current.key] = { bpm: current.bpm, beatOffset: current.beatOffset, confidence: current.confidence, energy: current.energy, brightness: current.brightness, vibe: current.vibe, vibeLabel: current.vibeLabel, vibeColor: current.vibeColor, ready: true, updatedAt: Date.now() };
      }
      ensureUpcoming();
      const next = route[currentIndex + 1];
      if (current && next) {
        const plan = transitionPlan(route[currentIndex], next);
        const duration = Number(current.duration || 0);
        const elapsed = Number(current.currentTime || 0);
        const remaining = duration > 0 ? duration - elapsed : Infinity;
        const ended = Boolean(current.ended || (current.paused && duration > 0 && elapsed >= duration - .75));
        const transitionDue = duration > 0 && remaining <= plan.duration + 3.4;
        if (nativeMode && (ended || transitionDue)) advanceNative();
        else if (!nativeMode && (ended || transitionDue)) performTransition(ended);
      }
      if (!current?.paused) demoTick(current);
    }
    const engine = $('.engine-state');
    engine.classList.toggle('error', String(state.engineState || '').includes('warning'));
  } catch {}
}

function demoTick(current) {
  if (extensionMode || !current) return;
  current.currentTime = Math.min(current.duration, current.currentTime + .35);
}

window.addEventListener('message', event => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (message?.type === 'flow:library') {
    libraryScanning = Boolean(message.scanning); pageContext = message.context || pageContext;
    for (const track of message.tracks || []) library.set(track.key, track);
    if (!libraryInitialized && library.size) {
      libraryInitialized = true;
      if (!selected.size) for (const key of library.keys()) selected.add(key);
    }
    renderAll();
  }
  if (message?.type === 'flow:add-track' && message.track?.key) {
    library.set(message.track.key, message.track); selected.add(message.track.key); savePreferences(); buildRoute(); renderAll(); toast(`Добавлено: ${message.track.title}`);
  }
  if (message?.type === 'flow:load-result') {
    const pending = pendingLoads.get(message.requestId);
    if (!pending) return;
    clearTimeout(pending.timer); pendingLoads.delete(message.requestId);
    message.ok ? pending.resolve(message) : pending.reject(new Error(message.error || 'Не удалось загрузить трек'));
  }
  if (message?.type === 'flow:dual-state') {
    dualDeckStates = { a: message.decks?.a || null, b: message.decks?.b || null };
    renderManualConsole();
  }
  if (message?.type === 'flow:manual-result' && !message.ok) toast(message.error || 'Команда деки не выполнена');
  if (message?.type === 'flow:native-state') {
    nativeState = message.state;
    const synchronizedIndex = route.findIndex(track => track.key === message.state?.key);
    if (flowRunning && synchronizedIndex >= 0 && synchronizedIndex !== currentIndex) {
      currentIndex = synchronizedIndex;
      activeDeck = synchronizedIndex % 2 ? 'b' : 'a';
      transitionPending = false;
      renderQueue(); updateTransitionPreview();
    }
    if (flowRunning && message.state?.key === route[currentIndex]?.key) {
      nativeMode = true;
      renderNow({ [activeDeck]: message.state, spectrum: latestState?.spectrum });
      $('#engineText').textContent = message.state.paused ? 'пауза' : message.state.pageEngine ? 'два аудиобуфера · live spectrum' : message.state.transferring ? 'переношу поток' : 'играет через VK';
    }
  }
  if (message?.type === 'flow:capture-state') {
    $('#engineText').textContent = message.ok ? 'live spectrum подключён' : 'звук играет · для спектра открой FLOW из панели Chrome';
  }
});

$('#arcPicker').onclick = event => {
  const button = event.target.closest('[data-arc]'); if (!button) return;
  arc = button.dataset.arc; $$('#arcPicker button').forEach(item => item.classList.toggle('active', item === button)); savePreferences(); buildRoute();
};
$('#search').oninput = event => { query = event.target.value.trim().toLowerCase(); renderLibrary(); };
$('#selectAll').onclick = () => {
  if (selected.size === library.size) selected.clear(); else for (const key of library.keys()) selected.add(key);
  savePreferences(); buildRoute(); renderLibrary();
};
$('#clearSelection').onclick = () => { selected.clear(); route = []; savePreferences(); renderAll(); };
$('#refresh').onclick = () => window.parent.postMessage({ type: 'flow:scan-library' }, '*');
$('#build').onclick = analyzeCollection;
$('#startParty').onclick = () => {
  if (!flowRunning) return startFlow();
  if (nativeMode) postDeckControl(activeDeck, 'toggle');
  else runtime({ type: 'deck-transport', deck: activeDeck, action: 'toggle' });
};
$('#skip').onclick = () => performTransition(true);
async function seekCurrent(value) {
  if (!flowRunning) return;
  if (nativeMode) postDeckControl(activeDeck, 'seek', Number(value));
  else await runtime({ type: 'deck-transport', deck: activeDeck, action: 'seek', currentTime: Number(value) });
}
$('#seekTrack').oninput = event => {
  const value = Number(event.target.value);
  const maximum = Number(event.target.max || 0);
  $('#blendCurrentProgress').style.width = `${maximum ? value / maximum * 100 : 0}%`;
};
$('#seekTrack').onchange = event => seekCurrent(event.target.value);
$('#jumpTransition').onclick = () => {
  if (!flowRunning) return startFlow();
  ensureUpcoming();
  performTransition(true);
};
$$('[data-manual-action]').forEach(button => button.onclick = () => postDeckControl(button.dataset.deck, button.dataset.manualAction));
for (const deck of ['a', 'b']) {
  const upper = deck.toUpperCase();
  $(`#manualSeek${upper}`).onchange = event => postDeckControl(deck, 'seek', Number(event.target.value));
  $(`#manualVolume${upper}`).oninput = event => window.parent.postMessage({ type: 'flow:deck-volume', deck, value: Number(event.target.value) }, '*');
  $(`#manualRate${upper}`).oninput = event => {
    const value = Number(event.target.value);
    $(`#manualRateOut${upper}`).textContent = `${((value - 1) * 100).toFixed(1)}%`;
    window.parent.postMessage({ type: 'flow:deck-rate', deck, value }, '*');
  };
}
$('#manualCrossfader').oninput = event => window.parent.postMessage({ type: 'flow:manual-crossfader', value: Number(event.target.value) }, '*');
$('#manualLoadA').onclick = () => {
  const track = route[currentIndex] || [...library.values()][0];
  if (!track) return toast('Сначала открой плейлист VK');
  window.parent.postMessage({ type: 'flow:manual-load', requestId: crypto.randomUUID(), deck: 'a', key: track.key, volume: Number($('#manualVolumeA').value) }, '*');
};
$('#manualLoadB').onclick = () => {
  const track = route[currentIndex + 1] || [...library.values()][1];
  if (!track) return toast('Для Deck B нужен второй трек');
  window.parent.postMessage({ type: 'flow:manual-load', requestId: crypto.randomUUID(), deck: 'b', key: track.key, volume: Number($('#manualVolumeB').value) }, '*');
};
$('#manualMixNow').onclick = () => $('#jumpTransition').click();
$('#manualSync').onclick = () => {
  const master = featureFor(route[currentIndex])?.bpm || latestState?.spectrum?.detectedBpm;
  const targetDeck = activeDeck === 'a' ? 'b' : 'a';
  const targetKey = dualDeckStates[targetDeck]?.key;
  const targetTrack = route.find(track => track.key === targetKey);
  const target = featureFor(targetTrack || {})?.bpm;
  if (!master || !target) return toast('BPM ещё не определён');
  const rate = clamp(normalizedTempo(master) / normalizedTempo(target), .88, 1.12);
  window.parent.postMessage({ type: 'flow:deck-sync', requestId: crypto.randomUUID(), masterDeck: activeDeck, masterBpm: normalizedTempo(master), targetBpm: normalizedTempo(target) }, '*');
  toast(`SYNC ${targetDeck.toUpperCase()} · темп и фаза · ${((rate - 1) * 100).toFixed(1)}%`);
};
$('#play').onclick = async () => {
  if (!flowRunning) return startFlow();
  if (nativeMode) postDeckControl(activeDeck, 'toggle');
  else await runtime({ type: 'deck-transport', deck: activeDeck, action: 'toggle' });
};
$('#previous').onclick = () => toast('FLOW не прыгает назад во время сведения — останови поток и выбери новый старт.');
$('#stop').onclick = async () => { window.parent.postMessage({ type: 'flow:stop-page-engine' }, '*'); await runtime({ type: 'reset-decks' }); flowRunning = false; nativeMode = false; nativeState = null; transitionPending = false; preloadKey = ''; $('#startParty span').textContent = 'Включить FLOW'; $('#play').textContent = '▶'; $('#engineText').textContent = 'поток остановлен'; $('#nowCard').classList.remove('playing'); window.flowAura?.update({ playing: false, spectrum: [], waveform: [] }); renderQueue(); };
$$('.glass-drawer').forEach(drawer => drawer.addEventListener('toggle', () => {
  if (!drawer.open) return;
  $$('.glass-drawer').forEach(other => { if (other !== drawer) other.open = false; });
}));
window.addEventListener('resize', drawEnergy);

hydrate().then(() => {
  if (extensionMode) window.parent.postMessage({ type: 'flow:scan-library' }, '*');
  renderAll(); setInterval(refresh, 50); refresh();
  if (!extensionMode && new URLSearchParams(location.search).has('playing')) setTimeout(startFlow, 80);
});
