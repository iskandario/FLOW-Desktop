/* FLOW v2 audio engine: real analysis, cached features and phrase-safe transitions. */
const ctx = new AudioContext({ latencyHint: 'playback' });
const analysisWorkletReady = ctx.audioWorklet.addModule('audio-analyzer-worklet.js');
const decks = { a: null, b: null };
const mixer = ctx.createGain();
const limiter = ctx.createDynamicsCompressor();
mixer.connect(limiter).connect(ctx.destination);
limiter.threshold.value = -1;
limiter.knee.value = 5;
limiter.ratio.value = 10;
limiter.attack.value = .004;
limiter.release.value = .18;

let cross = -1;
let transition = null;
let engineState = 'ready';
let tabCapture = null;
let spectrumTimer = null;
const nativeSpectrumDecks = { a: null, b: null };
const spectrumState = {
  active: false,
  bands: Array(48).fill(0),
  waveform: Array(64).fill(0),
  rms: 0,
  peak: 0,
  bass: 0,
  lowMid: 0,
  high: 0,
  beatPulse: 0,
  beatIndex: 0,
  detectedBpm: 0,
  confidence: 0,
  lastBeatAt: 0
};
const beatIntervals = [];
let bassFloor = .04;
let previousBass = 0;

function updateNativeSpectrum(message) {
  if (!['a', 'b'].includes(message.deck)) return { ok: false };
  nativeSpectrumDecks[message.deck] = { ...(message.data || {}), receivedAt: performance.now() };
  const now = performance.now();
  const sources = Object.values(nativeSpectrumDecks).filter(source => source && now - source.receivedAt < 650);
  const weighted = sources.map(source => ({
    source,
    weight: source.paused ? 0 : clamp(Number(source.volume ?? 1), 0, 1)
  }));
  const audible = weighted.filter(item => item.weight > .001);
  if (!audible.length) return { ok: true, silent: true };
  const totalWeight = audible.reduce((sum, item) => sum + item.weight, 0);
  const bandCount = Math.max(48, ...audible.map(item => item.source.bands?.length || 0));
  const waveformCount = Math.max(64, ...audible.map(item => item.source.waveform?.length || 0));
  spectrumState.bands = Array.from({ length: bandCount }, (_unused, index) => {
    const energy = audible.reduce((sum, item) => {
      const values = item.source.bands || [];
      const sourceIndex = values.length > 1 ? Math.round(index * (values.length - 1) / Math.max(1, bandCount - 1)) : 0;
      return sum + Number(values[sourceIndex] || 0) * item.weight;
    }, 0);
    return clamp(energy / Math.max(1, totalWeight * .82), 0, 1);
  });
  spectrumState.waveform = Array.from({ length: waveformCount }, (_unused, index) => {
    return clamp(audible.reduce((sum, item) => {
      const values = item.source.waveform || [];
      const sourceIndex = values.length > 1 ? Math.round(index * (values.length - 1) / Math.max(1, waveformCount - 1)) : 0;
      return sum + Number(values[sourceIndex] || 0) * item.weight;
    }, 0) / Math.max(1, totalWeight), -1, 1);
  });
  const power = field => Math.sqrt(audible.reduce((sum, item) => sum + Math.pow(Number(item.source[field] || 0) * item.weight, 2), 0));
  const average = field => audible.reduce((sum, item) => sum + Number(item.source[field] || 0) * item.weight, 0) / Math.max(.001, totalWeight);
  spectrumState.active = true;
  spectrumState.rms = power('rms');
  spectrumState.peak = clamp(spectrumState.rms * 2.4, 0, 1);
  spectrumState.bass = power('bass');
  spectrumState.lowMid = power('lowMid');
  spectrumState.high = power('high');
  spectrumState.beatPulse = Math.max(...audible.map(item => Number(item.source.beatPulse || 0) * item.weight));
  const tempoSource = [...audible].sort((left, right) => (right.weight * Number(right.source.confidence || 0)) - (left.weight * Number(left.source.confidence || 0)))[0];
  spectrumState.detectedBpm = Number(tempoSource?.source.detectedBpm || spectrumState.detectedBpm || 0);
  spectrumState.confidence = clamp(average('confidence'), 0, 1);
  if (spectrumState.beatPulse > .8) spectrumState.beatIndex += 1;
  return { ok: true, sources: audible.length };
}

function averageRange(values, sampleRate, fftSize, lowHz, highHz) {
  const from = Math.max(1, Math.floor(lowHz / (sampleRate / fftSize)));
  const to = Math.min(values.length - 1, Math.ceil(highHz / (sampleRate / fftSize)));
  let sum = 0;
  for (let index = from; index <= to; index += 1) sum += values[index];
  return sum / Math.max(1, to - from + 1);
}

function normalizedBpmFromIntervals(intervals) {
  if (intervals.length < 3) return { bpm: 0, confidence: 0 };
  const bpms = intervals.map(value => {
    let bpm = 60000 / value;
    while (bpm < 78) bpm *= 2;
    while (bpm > 176) bpm /= 2;
    return bpm;
  }).sort((a, b) => a - b);
  const median = bpms[Math.floor(bpms.length / 2)];
  const close = bpms.filter(value => Math.abs(value - median) < 7);
  return {
    bpm: Math.round((close.reduce((sum, value) => sum + value, 0) / Math.max(1, close.length)) * 10) / 10,
    confidence: clamp(close.length / Math.max(5, bpms.length), 0, 1)
  };
}

function stopTabAnalysis() {
  clearInterval(spectrumTimer);
  spectrumTimer = null;
  try { tabCapture?.source?.disconnect(); } catch {}
  try { tabCapture?.analyser?.disconnect(); } catch {}
  for (const track of tabCapture?.stream?.getTracks?.() || []) track.stop();
  tabCapture = null;
  spectrumState.active = false;
  spectrumState.bands.fill(0);
  spectrumState.waveform.fill(0);
  spectrumState.rms = 0;
  spectrumState.peak = 0;
  spectrumState.bass = 0;
  spectrumState.beatPulse = 0;
  beatIntervals.splice(0);
}

async function startTabAnalysis(streamId, tabId) {
  stopTabAnalysis();
  if (ctx.state === 'suspended') await ctx.resume();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
    video: false
  });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = .58;
  analyser.minDecibels = -96;
  analyser.maxDecibels = -18;
  source.connect(analyser).connect(limiter);
  tabCapture = { tabId, stream, source, analyser };
  spectrumState.active = true;
  const frequency = new Uint8Array(analyser.frequencyBinCount);
  const timeDomain = new Float32Array(analyser.fftSize);
  const sampleRate = ctx.sampleRate;
  spectrumTimer = setInterval(() => {
    if (!tabCapture || analyser !== tabCapture.analyser) return;
    analyser.getByteFrequencyData(frequency);
    analyser.getFloatTimeDomainData(timeDomain);
    const linear = new Float32Array(frequency.length);
    for (let index = 0; index < frequency.length; index += 1) linear[index] = frequency[index] / 255;
    const nyquist = sampleRate / 2;
    for (let band = 0; band < spectrumState.bands.length; band += 1) {
      const low = 24 * Math.pow(nyquist / 24, band / spectrumState.bands.length);
      const high = 24 * Math.pow(nyquist / 24, (band + 1) / spectrumState.bands.length);
      const raw = averageRange(linear, sampleRate, analyser.fftSize, low, high);
      spectrumState.bands[band] += (Math.pow(raw, 1.22) - spectrumState.bands[band]) * .44;
    }
    let square = 0;
    let peak = 0;
    const stride = Math.max(1, Math.floor(timeDomain.length / spectrumState.waveform.length));
    for (let index = 0; index < timeDomain.length; index += 1) {
      const value = timeDomain[index];
      square += value * value;
      peak = Math.max(peak, Math.abs(value));
      if (index % stride === 0) spectrumState.waveform[Math.floor(index / stride)] = value;
    }
    spectrumState.rms = Math.sqrt(square / timeDomain.length);
    spectrumState.peak = peak;
    const bass = averageRange(linear, sampleRate, analyser.fftSize, 38, 165);
    const lowMid = averageRange(linear, sampleRate, analyser.fftSize, 165, 900);
    const high = averageRange(linear, sampleRate, analyser.fftSize, 2800, 12000);
    spectrumState.bass += (bass - spectrumState.bass) * .55;
    spectrumState.lowMid += (lowMid - spectrumState.lowMid) * .38;
    spectrumState.high += (high - spectrumState.high) * .35;
    bassFloor += (bass - bassFloor) * (bass < bassFloor ? .05 : .006);
    const now = performance.now();
    const attack = bass - previousBass;
    const strongAttack = bass > Math.max(.12, bassFloor * 1.42) && attack > .018;
    if (strongAttack && now - spectrumState.lastBeatAt > 245) {
      if (spectrumState.lastBeatAt) {
        const interval = now - spectrumState.lastBeatAt;
        if (interval > 240 && interval < 1700) beatIntervals.push(interval);
        if (beatIntervals.length > 18) beatIntervals.shift();
        const tempo = normalizedBpmFromIntervals(beatIntervals);
        if (tempo.bpm) spectrumState.detectedBpm += (tempo.bpm - spectrumState.detectedBpm) * .32;
        spectrumState.confidence = tempo.confidence;
      }
      spectrumState.lastBeatAt = now;
      spectrumState.beatPulse = 1;
      spectrumState.beatIndex += 1;
    } else {
      spectrumState.beatPulse *= .8;
    }
    previousBass = bass;
  }, 32);
  return { ok: true };
}

async function storageGet(keys) {
  const result = await chrome.runtime.sendMessage({ type: 'flow-storage-get', keys });
  if (!result?.ok) throw new Error(result?.error || 'Не удалось прочитать локальный кэш');
  return result.value || {};
}

async function storageSet(value) {
  const result = await chrome.runtime.sendMessage({ type: 'flow-storage-set', value });
  if (!result?.ok) throw new Error(result?.error || 'Не удалось сохранить локальный кэш');
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function makeGain(value = 0) {
  const node = ctx.createGain();
  node.gain.value = value;
  return node;
}

function gainsFor(value) {
  const angle = (clamp(Number(value), -1, 1) + 1) * Math.PI / 4;
  return { a: Math.cos(angle), b: Math.sin(angle) };
}

function wantedGain(name) {
  const deck = decks[name];
  if (!deck?.outputEnabled) return 0;
  return gainsFor(cross)[name];
}

function setGain(name, value, seconds = .035) {
  const deck = decks[name];
  if (!deck) return;
  deck.out.gain.cancelScheduledValues(ctx.currentTime);
  deck.out.gain.setTargetAtTime(value, ctx.currentTime, seconds);
}

function applyCross(value) {
  cross = clamp(Number(value), -1, 1);
  setGain('a', wantedGain('a'));
  setGain('b', wantedGain('b'));
}

function normalizeBpm(value) {
  let bpm = Number(value || 0);
  while (bpm && bpm < 80) bpm *= 2;
  while (bpm > 178) bpm /= 2;
  return Math.round(bpm * 10) / 10;
}

function estimateBeatGrid(values, fps, analysisRate = 1) {
  if (values.length < 360) return { bpm: 0, offset: 0, confidence: 0 };
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const onset = values.map((value, index) => Math.max(0, value - (values[index - 1] ?? value) - average * .02));
  const minRaw = 72 * analysisRate;
  const maxRaw = 182 * analysisRate;
  let best = { bpm: 0, lag: 0, score: 0 };
  let second = 0;
  for (let rawBpm = minRaw; rawBpm <= maxRaw; rawBpm += Math.max(.25, analysisRate * .2)) {
    const lag = Math.max(1, Math.round(fps * 60 / rawBpm));
    let score = 0;
    for (let index = lag; index < onset.length; index += 1) score += onset[index] * onset[index - lag];
    for (let index = lag * 2; index < onset.length; index += 1) score += onset[index] * onset[index - lag * 2] * .25;
    if (score > best.score) { second = best.score; best = { bpm: rawBpm, lag, score }; }
    else if (score > second) second = score;
  }
  if (!best.lag || !best.score) return { bpm: 0, offset: 0, confidence: 0 };
  const bins = new Float64Array(best.lag);
  for (let index = 0; index < onset.length; index += 1) bins[index % best.lag] += onset[index];
  let phase = 0;
  for (let index = 1; index < bins.length; index += 1) if (bins[index] > bins[phase]) phase = index;
  return {
    bpm: normalizeBpm(best.bpm / analysisRate),
    offset: phase / fps * analysisRate,
    confidence: clamp(1 - second / best.score, 0, 1)
  };
}

function vibeFor(features) {
  const energy = Number(features.energy || 0);
  const bpm = Number(features.bpm || 0);
  const brightness = Number(features.brightness || 0);
  if (energy < .26) return { id: 'afterglow', label: 'afterglow', color: '#9b8cff' };
  if (bpm && bpm < 100) return { id: 'slow-burn', label: 'slow burn', color: '#ff9d72' };
  if (energy > .72 && bpm > 122) return { id: 'peak', label: 'peak', color: '#e8ff5b' };
  if (bpm > 134) return { id: 'rush', label: 'rush', color: '#ff6e9f' };
  if (brightness > .58) return { id: 'neon', label: 'neon', color: '#64e7ff' };
  return { id: 'groove', label: 'groove', color: '#6ef3da' };
}

async function loadMedia(audio, url) {
  if (/\.m3u8(?:\?|$)/i.test(url)) {
    if (!globalThis.Hls?.isSupported()) throw new Error('HLS недоступен в этом браузере');
    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: false,
      maxBufferLength: 90,
      backBufferLength: 20,
      xhrSetup(xhr) { xhr.withCredentials = true; }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('VK HLS не ответил за 15 секунд')), 15000);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { clearTimeout(timer); resolve(); });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) { clearTimeout(timer); reject(new Error(data.details || 'Ошибка HLS')); }
      });
      hls.attachMedia(audio);
      hls.loadSource(url);
    });
    return hls;
  }
  // Start from the signed VK URL immediately and never materialize the entire
  // track as a Blob. If streaming is rejected, the native VK deck must take over.
  audio.crossOrigin = 'anonymous';
  audio.src = url;
  audio.load();
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('direct stream timeout')), 6500);
      const ready = () => { clearTimeout(timer); cleanup(); resolve(); };
      const failed = () => { clearTimeout(timer); cleanup(); reject(new Error('direct stream failed')); };
      const cleanup = () => {
        audio.removeEventListener('canplay', ready);
        audio.removeEventListener('loadedmetadata', ready);
        audio.removeEventListener('error', failed);
      };
      audio.addEventListener('canplay', ready, { once: true });
      audio.addEventListener('loadedmetadata', ready, { once: true });
      audio.addEventListener('error', failed, { once: true });
    });
    return null;
  } catch (error) {
    audio.removeAttribute('src');
    audio.load();
    throw new Error(`VK stream не ответил без скачивания: ${error.message}`);
  }
}

function installWaveMeter(source, deck) {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = .42;
  const silent = makeGain(0);
  source.connect(analyser).connect(silent).connect(mixer);
  const samples = new Float32Array(analyser.fftSize);
  const frequency = new Uint8Array(analyser.frequencyBinCount);
  deck.waveAnalyser = analyser;
  deck.waveTimer = setInterval(() => {
    if ((deck.audio ? deck.audio.paused : deck.state?.paused) || decks[deck.name] !== deck) return;
    analyser.getFloatTimeDomainData(samples);
    let peak = 0;
    for (let index = 0; index < samples.length; index += 8) peak = Math.max(peak, Math.abs(samples[index]));
    deck.waveform.push(peak);
    if (deck.waveform.length > 420) deck.waveform.splice(0, deck.waveform.length - 420);
    const beat = estimateBeatGrid(deck.waveform, 1000 / 32, 1);
    if (beat.bpm) {
      const energy = clamp(deck.waveform.reduce((sum, value) => sum + value, 0) / Math.max(1, deck.waveform.length) * 3.8, 0, 1);
      const vibe = vibeFor({ bpm: beat.bpm, energy, brightness: deck.analysis.brightness || 0 });
      deck.analysis = { ...deck.analysis, bpm: beat.bpm, beatOffset: beat.offset, confidence: beat.confidence, energy, vibe: vibe.id, vibeLabel: vibe.label, vibeColor: vibe.color, ready: deck.waveform.length >= 360 };
    }
    const other = decks[deck.name === 'a' ? 'b' : 'a'];
    if (!deck.outputEnabled || Number(deck.out.gain.value || 0) + .01 < Number(other?.out?.gain?.value || 0)) return;
    analyser.getByteFrequencyData(frequency);
    const linear = new Float32Array(frequency.length);
    for (let index = 0; index < frequency.length; index += 1) linear[index] = frequency[index] / 255;
    const nyquist = ctx.sampleRate / 2;
    for (let band = 0; band < spectrumState.bands.length; band += 1) {
      const lowHz = 24 * Math.pow(nyquist / 24, band / spectrumState.bands.length);
      const highHz = 24 * Math.pow(nyquist / 24, (band + 1) / spectrumState.bands.length);
      const raw = averageRange(linear, ctx.sampleRate, analyser.fftSize, lowHz, highHz);
      spectrumState.bands[band] += (Math.pow(raw, 1.22) - spectrumState.bands[band]) * .44;
    }
    let square = 0;
    const stride = Math.max(1, Math.floor(samples.length / spectrumState.waveform.length));
    for (let index = 0; index < samples.length; index += 1) {
      square += samples[index] * samples[index];
      if (index % stride === 0) spectrumState.waveform[Math.floor(index / stride)] = samples[index];
    }
    spectrumState.active = true;
    spectrumState.rms = Math.sqrt(square / samples.length);
    spectrumState.peak = peak;
    const bass = averageRange(linear, ctx.sampleRate, analyser.fftSize, 38, 165);
    const lowMid = averageRange(linear, ctx.sampleRate, analyser.fftSize, 165, 900);
    const high = averageRange(linear, ctx.sampleRate, analyser.fftSize, 2800, 12000);
    spectrumState.bass += (bass - spectrumState.bass) * .55;
    spectrumState.lowMid += (lowMid - spectrumState.lowMid) * .38;
    spectrumState.high += (high - spectrumState.high) * .35;
    bassFloor += (bass - bassFloor) * (bass < bassFloor ? .05 : .006);
    const now = performance.now();
    const attack = bass - previousBass;
    if (bass > Math.max(.12, bassFloor * 1.42) && attack > .018 && now - spectrumState.lastBeatAt > 245) {
      if (spectrumState.lastBeatAt) {
        const interval = now - spectrumState.lastBeatAt;
        if (interval > 240 && interval < 1700) beatIntervals.push(interval);
        if (beatIntervals.length > 18) beatIntervals.shift();
        const tempo = normalizedBpmFromIntervals(beatIntervals);
        if (tempo.bpm) spectrumState.detectedBpm += (tempo.bpm - spectrumState.detectedBpm) * .32;
        spectrumState.confidence = tempo.confidence;
      }
      spectrumState.lastBeatAt = now;
      spectrumState.beatPulse = 1;
      spectrumState.beatIndex += 1;
    } else spectrumState.beatPulse *= .8;
    previousBass = bass;
  }, 32);
}

async function persistAnalysis(deck) {
  if (!deck.key || !deck.analysis.ready) return;
  const { flowAnalysis = {} } = await storageGet('flowAnalysis');
  flowAnalysis[deck.key] = { ...deck.analysis, updatedAt: Date.now() };
  const entries = Object.entries(flowAnalysis).sort((a, b) => Number(b[1]?.updatedAt || 0) - Number(a[1]?.updatedAt || 0)).slice(0, 2500);
  await storageSet({ flowAnalysis: Object.fromEntries(entries) });
}

async function installFastAnalysis(deck) {
  await analysisWorkletReady;
  const analysisAudio = new Audio();
  analysisAudio.preload = 'auto';
  analysisAudio.playsInline = true;
  analysisAudio.preservesPitch = false;
  const hls = await loadMedia(analysisAudio, deck.url);
  if (decks[deck.name] !== deck) { hls?.destroy(); return; }
  const source = ctx.createMediaElementSource(analysisAudio);
  const processor = new AudioWorkletNode(ctx, 'flow-analyzer', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 2, channelCountMode: 'explicit' });
  const silent = makeGain(0);
  source.connect(processor).connect(silent).connect(mixer);
  const rate = 3;
  analysisAudio.playbackRate = rate;
  const energySeries = [];
  let rmsTotal = 0;
  let zcrTotal = 0;
  let blocks = 0;
  let previous = 0;
  let lastPersistedBpm = 0;
  processor.port.onmessage = event => {
    if (event.data?.type !== 'audio' || decks[deck.name] !== deck) return;
    const left = event.data.left;
    const right = event.data.right;
    const hop = 512;
    for (let base = 0; base < left.length; base += hop) {
      const end = Math.min(left.length, base + hop);
      let onsetPower = 0;
      let square = 0;
      let crossings = 0;
      let localPrevious = previous;
      for (let index = base; index < end; index += 1) {
        const mono = (left[index] + right[index]) * .5;
        onsetPower += Math.abs(mono - localPrevious) * .78 + Math.abs(mono) * .22;
        square += mono * mono;
        if ((mono >= 0) !== (localPrevious >= 0)) crossings += 1;
        localPrevious = mono;
      }
      previous = localPrevious;
      const count = Math.max(1, end - base);
      energySeries.push(onsetPower / count);
      rmsTotal += Math.sqrt(square / count);
      zcrTotal += crossings / count;
      blocks += 1;
    }
    if (energySeries.length > 1800) energySeries.splice(0, energySeries.length - 1800);
    const beat = estimateBeatGrid(energySeries, ctx.sampleRate / 512, rate);
    const averageRms = rmsTotal / Math.max(1, blocks);
    const energy = clamp((averageRms - .025) / .19, 0, 1);
    const brightness = clamp((zcrTotal / Math.max(1, blocks)) * 9, 0, 1);
    if (beat.bpm) {
      const vibe = vibeFor({ bpm: beat.bpm, energy, brightness });
      deck.analysis = {
        bpm: beat.bpm,
        beatOffset: beat.offset,
        confidence: beat.confidence,
        energy: Math.round(energy * 1000) / 1000,
        brightness: Math.round(brightness * 1000) / 1000,
        vibe: vibe.id,
        vibeLabel: vibe.label,
        vibeColor: vibe.color,
        ready: energySeries.length >= 520
      };
      if (deck.analysis.ready && lastPersistedBpm !== deck.analysis.bpm) {
        lastPersistedBpm = deck.analysis.bpm;
        persistAnalysis(deck).catch(() => {});
      }
    }
  };
  deck.analysisAudio = analysisAudio;
  deck.analysisHls = hls;
  deck.analysisSource = source;
  deck.analysisProcessor = processor;
  try {
    analysisAudio.currentTime = Math.min(30, Math.max(0, (analysisAudio.duration || 60) * .16));
    await analysisAudio.play();
  } catch {
    analysisAudio.currentTime = 0;
    await analysisAudio.play();
  }
}

function destroyDeck(name) {
  const deck = decks[name];
  if (!deck) return;
  deck.audio?.pause();
  deck.analysisAudio?.pause();
  for (const track of deck.stream?.getTracks?.() || []) track.stop();
  deck.hls?.destroy();
  deck.analysisHls?.destroy();
  clearInterval(deck.waveTimer);
  try { deck.analysisProcessor?.port.postMessage({ type: 'stop' }); } catch {}
  for (const node of [deck.source, deck.analysisSource, deck.analysisProcessor, deck.waveAnalyser, deck.out]) {
    try { node?.disconnect(); } catch {}
  }
  deck.audio?.removeAttribute('src');
  deck.analysisAudio?.removeAttribute('src');
  if (deck.audio?.__flowObjectUrl) URL.revokeObjectURL(deck.audio.__flowObjectUrl);
  if (deck.analysisAudio?.__flowObjectUrl) URL.revokeObjectURL(deck.analysisAudio.__flowObjectUrl);
  decks[name] = null;
}

async function startDeck(message) {
  if (ctx.state === 'suspended') await ctx.resume();
  if (!message.analysisMode && tabCapture) stopTabAnalysis();
  destroyDeck(message.deck);
  engineState = 'loading';
  const audio = new Audio();
  audio.preload = 'auto';
  audio.playsInline = true;
  const hls = await loadMedia(audio, message.url);
  const out = makeGain(0);
  const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 220;
  const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1300; mid.Q.value = .75;
  const high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 6500;
  out.connect(low).connect(mid).connect(high).connect(mixer);
  const deck = {
    name: message.deck,
    key: message.key || '',
    title: message.title || '',
    artist: message.artist || '',
    url: message.url,
    audio,
    hls,
    out,
    eq: { low, mid, high },
    outputEnabled: !message.analysisMode && !message.deferOutput,
    analysisMode: Boolean(message.analysisMode),
    waveform: [],
    analysis: { bpm: 0, confidence: 0, energy: 0, brightness: 0, vibe: 'discovering', vibeLabel: 'слушаю', vibeColor: '#8d73ff', ready: false }
  };
  const { flowAnalysis = {} } = await storageGet('flowAnalysis');
  if (flowAnalysis[deck.key]?.ready) deck.analysis = { ...flowAnalysis[deck.key] };
  const source = ctx.createMediaElementSource(audio);
  deck.source = source;
  source.connect(out);
  installWaveMeter(source, deck);
  decks[message.deck] = deck;
  audio.currentTime = Number(message.currentTime || 0);
  setGain(message.deck, wantedGain(message.deck), .01);
  await audio.play();
  installFastAnalysis(deck).catch(error => { if (decks[deck.name] === deck) engineState = `analysis warning: ${error.message}`; });
  engineState = 'ready';
  return { ok: true };
}

async function startCaptureDeck(message) {
  if (ctx.state === 'suspended') await ctx.resume();
  destroyDeck(message.deck);
  engineState = 'capturing VK tab';
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: message.streamId } },
    video: false
  });
  const out = makeGain(0);
  const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 220;
  const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1300; mid.Q.value = .75;
  const high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 6500;
  out.connect(low).connect(mid).connect(high).connect(mixer);
  const deck = {
    kind: 'capture', name: message.deck, tabId: message.tabId, stream, out, eq: { low, mid, high },
    key: '', title: message.title || '', artist: '', outputEnabled: true, analysisMode: false,
    state: { currentTime: 0, duration: 0, paused: true, rate: 1 }, waveform: [],
    analysis: { bpm: 0, confidence: 0, energy: 0, brightness: 0, vibe: 'discovering', vibeLabel: 'слушаю', vibeColor: '#8d73ff', ready: false }
  };
  const source = ctx.createMediaStreamSource(stream);
  deck.source = source;
  source.connect(out);
  decks[message.deck] = deck;
  installWaveMeter(source, deck);
  setGain(message.deck, wantedGain(message.deck), .01);
  engineState = 'ready · two captured VK tabs';
  return { ok: true };
}

async function updateCaptureDeck(message) {
  const deck = decks[message.deck];
  if (!deck || deck.kind !== 'capture') throw new Error(`Deck ${String(message.deck).toUpperCase()} не захвачен`);
  deck.key = message.key || deck.key;
  deck.title = message.title || message.state?.title || deck.title;
  deck.artist = message.artist || message.state?.artist || deck.artist;
  deck.analysisMode = Boolean(message.analysisMode);
  deck.outputEnabled = !deck.analysisMode;
  deck.state = { ...deck.state, ...(message.state || {}) };
  const { flowAnalysis = {} } = await storageGet('flowAnalysis');
  if (flowAnalysis[deck.key]?.ready) deck.analysis = { ...flowAnalysis[deck.key] };
  setGain(message.deck, wantedGain(message.deck), .01);
  return { ok: true };
}

function updateCaptureState(message) {
  const deck = decks[message.deck];
  if (!deck || deck.kind !== 'capture') return { ok: false };
  deck.state = { ...deck.state, ...(message.state || {}) };
  if (deck.outputEnabled && spectrumState.detectedBpm) {
    const vibe = vibeFor({ bpm: spectrumState.detectedBpm, energy: clamp(spectrumState.rms * 4, 0, 1), brightness: spectrumState.high });
    deck.analysis = { ...deck.analysis, bpm: spectrumState.detectedBpm, confidence: spectrumState.confidence, energy: clamp(spectrumState.rms * 4, 0, 1), brightness: spectrumState.high, vibe: vibe.id, vibeLabel: vibe.label, vibeColor: vibe.color, ready: spectrumState.confidence > .25 };
  }
  return { ok: true };
}

async function transport(name, action, value) {
  const deck = decks[name];
  if (!deck) throw new Error('Трек ещё не загружен');
  if (ctx.state === 'suspended') await ctx.resume();
  if (deck.kind === 'capture') {
    if (action === 'activate') {
      deck.outputEnabled = true; deck.analysisMode = false; setGain(name, wantedGain(name)); return;
    }
    const result = await chrome.runtime.sendMessage({ target: 'background', type: 'flow-control-captured-deck', deck: name, action, currentTime: value });
    if (!result?.ok) throw new Error(result?.error || 'Вкладка VK не выполнила команду');
    if (result.state) deck.state = { ...deck.state, ...result.state };
    return;
  }
  if (action === 'toggle') deck.audio.paused ? await deck.audio.play() : deck.audio.pause();
  if (action === 'pause') deck.audio.pause();
  if (action === 'play') await deck.audio.play();
  if (action === 'restart') { deck.audio.currentTime = 0; await deck.audio.play(); }
  if (action === 'seek') deck.audio.currentTime = clamp(Number(value || 0), 0, deck.audio.duration || Infinity);
  if (action === 'stop') { deck.audio.pause(); deck.audio.currentTime = 0; }
  if (action === 'activate') {
    deck.outputEnabled = true;
    deck.analysisMode = false;
    setGain(name, wantedGain(name));
  }
}

function nearestRate(master, incoming) {
  const raw = master.analysis.bpm / incoming.analysis.bpm;
  return [raw / 2, raw, raw * 2].reduce((best, candidate) => Math.abs(candidate - 1) < Math.abs(best - 1) ? candidate : best, raw);
}

async function autoTransition(message) {
  const from = decks[message.from];
  const to = decks[message.to];
  if (!from || !to) throw new Error('Следующий трек ещё не готов');
  if (transition) throw new Error('Переход уже выполняется');
  if (ctx.state === 'suspended') await ctx.resume();

  if (from.kind === 'capture' || to.kind === 'capture') {
    if (from.kind !== 'capture' || to.kind !== 'capture') throw new Error('Обе деки должны быть подключены как вкладки VK');
    const duration = clamp(Number(message.duration || 10), 5, 24);
    const canBeatmatch = from.analysis.ready && to.analysis.ready && from.analysis.confidence >= .08 && to.analysis.confidence >= .08;
    const gridDelay = canBeatmatch ? FlowMixMath.gridDelaySeconds(Number(from.state?.currentTime || 0), from.analysis.bpm, from.analysis.beatOffset || 0, 4, 3.2) : 0;
    const now = ctx.currentTime + Math.max(.06, gridDelay);
    const steps = 96;
    const fadeOut = new Float32Array(steps);
    const fadeIn = new Float32Array(steps);
    for (let index = 0; index < steps; index += 1) {
      const progress = index / (steps - 1);
      fadeOut[index] = Math.cos(progress * Math.PI / 2);
      fadeIn[index] = Math.sin(progress * Math.PI / 2);
    }
    to.outputEnabled = true; to.analysisMode = false;
    from.out.gain.cancelScheduledValues(now); to.out.gain.cancelScheduledValues(now);
    from.out.gain.setValueAtTime(Math.max(.0001, from.out.gain.value), now);
    to.out.gain.setValueAtTime(0, now);
    from.out.gain.setValueCurveAtTime(fadeOut, now, duration);
    to.out.gain.setValueCurveAtTime(fadeIn, now, duration);
    from.eq.low.gain.setValueAtTime(0, now); from.eq.low.gain.linearRampToValueAtTime(-7, now + duration * .62);
    to.eq.low.gain.setValueAtTime(-8, now); to.eq.low.gain.linearRampToValueAtTime(0, now + duration * .68);
    transition = { from: message.from, to: message.to, startedAt: performance.now() + gridDelay * 1000, duration, delay: gridDelay, mode: canBeatmatch ? 'captured-grid-blend' : 'captured-safe-blend', rate: 1 };
    if (gridDelay) await sleep(gridDelay * 1000);
    await chrome.runtime.sendMessage({ target: 'background', type: 'flow-control-captured-deck', deck: message.to, action: 'play' });
    await sleep(duration * 1000 + 120);
    await chrome.runtime.sendMessage({ target: 'background', type: 'flow-control-captured-deck', deck: message.from, action: 'pause' }).catch(() => {});
    from.outputEnabled = false; cross = message.to === 'a' ? -1 : 1;
    setGain(message.from, 0, .01); setGain(message.to, 1, .01);
    from.eq.low.gain.value = 0; to.eq.low.gain.value = 0;
    const result = { ok: true, mode: transition.mode, duration, delay: gridDelay, rate: 1 };
    transition = null;
    return result;
  }

  const requested = clamp(Number(message.duration || 12), 5, 28);
  const canBeatmatch = from.analysis.ready && to.analysis.ready && from.analysis.confidence >= .08 && to.analysis.confidence >= .08;
  const rate = canBeatmatch ? nearestRate(from, to) : 1;
  const safeRate = rate >= .88 && rate <= 1.12 ? rate : 1;
  const duration = safeRate === 1 && Math.abs((from.analysis.bpm || 0) - (to.analysis.bpm || 0)) > 18 ? Math.min(9, requested) : requested;
  const gridDelay = canBeatmatch ? FlowMixMath.gridDelaySeconds(from.audio.currentTime, from.analysis.bpm, from.analysis.beatOffset, 4, 3.2) : 0;
  const preroll = canBeatmatch ? .18 : 0;
  const incomingBeatSeconds = canBeatmatch ? 60 / to.analysis.bpm : 0;
  const incomingCue = canBeatmatch ? Number(to.analysis.beatOffset || 0) + incomingBeatSeconds * 4 : 0;
  to.outputEnabled = true;
  to.analysisMode = false;
  to.audio.pause();
  to.audio.playbackRate = safeRate;
  to.audio.currentTime = canBeatmatch ? clamp(incomingCue - preroll * safeRate, 0, Math.max(0, (to.audio.duration || 1) - 1)) : 0;

  const now = ctx.currentTime + Math.max(.06, gridDelay);
  const steps = 96;
  const fadeOut = new Float32Array(steps);
  const fadeIn = new Float32Array(steps);
  for (let index = 0; index < steps; index += 1) {
    const progress = index / (steps - 1);
    fadeOut[index] = Math.cos(progress * Math.PI / 2);
    fadeIn[index] = Math.sin(progress * Math.PI / 2);
  }
  from.out.gain.cancelScheduledValues(now);
  to.out.gain.cancelScheduledValues(now);
  from.out.gain.setValueAtTime(Math.max(.0001, from.out.gain.value), now);
  to.out.gain.setValueAtTime(0, now);
  from.out.gain.setValueCurveAtTime(fadeOut, now, duration);
  to.out.gain.setValueCurveAtTime(fadeIn, now, duration);
  from.eq.low.gain.cancelScheduledValues(now);
  to.eq.low.gain.cancelScheduledValues(now);
  from.eq.low.gain.setValueAtTime(0, now);
  from.eq.low.gain.linearRampToValueAtTime(-7, now + duration * .62);
  to.eq.low.gain.setValueAtTime(-8, now);
  to.eq.low.gain.linearRampToValueAtTime(0, now + duration * .68);

  transition = { from: message.from, to: message.to, startedAt: performance.now() + gridDelay * 1000, duration, delay: gridDelay, mode: safeRate !== 1 ? 'beatmatch' : canBeatmatch ? 'grid-blend' : 'safe-blend', rate: safeRate };
  if (gridDelay > preroll) await sleep((gridDelay - preroll) * 1000);
  await to.audio.play();
  await sleep((duration + preroll + .12) * 1000);
  if (!transition || transition.to !== message.to) return { ok: true, interrupted: true };
  from.audio.pause();
  from.audio.playbackRate = 1;
  from.outputEnabled = false;
  from.eq.low.gain.value = 0;
  to.eq.low.gain.value = 0;
  cross = message.to === 'a' ? -1 : 1;
  setGain(message.from, 0, .01);
  setGain(message.to, 1, .01);
  const result = { ok: true, mode: transition.mode, duration, delay: gridDelay, rate: safeRate };
  transition = null;
  return result;
}

function stateFor(name) {
  const deck = decks[name];
  if (!deck) return null;
  return {
    key: deck.key,
    title: deck.title,
    artist: deck.artist,
    currentTime: deck.kind === 'capture' ? Number(deck.state?.currentTime || 0) : deck.audio.currentTime || 0,
    duration: deck.kind === 'capture' ? Number(deck.state?.duration || 0) : Number.isFinite(deck.audio.duration) ? deck.audio.duration : 0,
    paused: deck.kind === 'capture' ? Boolean(deck.state?.paused) : deck.audio.paused,
    rate: deck.kind === 'capture' ? Number(deck.state?.rate || 1) : deck.audio.playbackRate || 1,
    outputEnabled: deck.outputEnabled,
    analysisMode: deck.analysisMode,
    ...deck.analysis,
    waveform: deck.waveform.slice(-260)
  };
}

function stopAll() {
  transition = null;
  destroyDeck('a'); destroyDeck('b');
  stopTabAnalysis();
  cross = -1;
}

function resetDecks() {
  transition = null;
  for (const name of ['a', 'b']) {
    const deck = decks[name];
    if (!deck || deck.kind !== 'capture') { destroyDeck(name); continue; }
    deck.key = ''; deck.title = ''; deck.artist = ''; deck.state = { currentTime: 0, duration: 0, paused: true, rate: 1 };
    deck.analysisMode = false; deck.outputEnabled = true;
  }
  cross = -1;
  applyCross(-1);
}

chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message.target === 'offscreen' && message.type === 'prime-audio') {
    ctx.resume().then(() => reply({ ok: true, state: ctx.state })).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.target === 'offscreen' && message.type === 'start-tab-analysis') {
    startTabAnalysis(message.streamId, message.tabId).then(reply).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.target === 'offscreen' && message.type === 'start-capture-deck') {
    startCaptureDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.target === 'offscreen' && message.type === 'update-capture-deck') {
    updateCaptureDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.target === 'offscreen' && message.type === 'capture-deck-state') {
    reply(updateCaptureState(message)); return;
  }
  if (message.target === 'offscreen' && message.type === 'native-spectrum') {
    reply(updateNativeSpectrum(message)); return;
  }
  if (message.target === 'offscreen' && message.type === 'start-url-deck') {
    startDeck(message).then(reply).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.target === 'offscreen' && message.type === 'stop-all') { stopAll(); reply({ ok: true }); return; }
  if (message.target === 'offscreen' && message.type === 'reset-decks') { resetDecks(); reply({ ok: true }); return; }
  if (message.type === 'deck-transport') {
    transport(message.deck, message.action, message.currentTime).then(() => reply({ ok: true })).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.type === 'mixer-control') {
    if (message.control === 'cross') applyCross(message.value);
    reply({ ok: true }); return;
  }
  if (message.type === 'auto-transition') {
    autoTransition(message).then(reply).catch(error => reply({ ok: false, error: error.message })); return true;
  }
  if (message.type === 'get-mixer-state') {
    const progress = transition ? clamp((performance.now() - transition.startedAt) / (transition.duration * 1000), 0, 1) : 0;
    reply({ a: stateFor('a'), b: stateFor('b'), cross, engineState, transition: transition ? { ...transition, progress } : null, spectrum: { ...spectrumState, bands: [...spectrumState.bands], waveform: [...spectrumState.waveform] } });
  }
});
