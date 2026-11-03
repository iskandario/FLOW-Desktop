/**
 * Bridges UI intent to the audio engine and keeps the zustand store in sync.
 * The engine owns real-time audio state; the store owns what React renders.
 */
import { engine, STEM_NAMES, type LoadedStem } from './audio/engine'
import { analyzeBpm, computeHiPeaks, computePeaks, type WaveformPeaks } from './audio/analysis'
import {
  emptyDeck,
  RECORDINGS_VIEW,
  showToast,
  updateDeck,
  updateMixer,
  updateReel,
  updateTrack,
  useStore,
  type AutotuneState,
  type DeckState,
  type Folder,
  type TrackInfo
} from './state/store'
import { ReelRecorder } from './video/reel'
import type { PersistedFolder, PersistedLibrary, PersistedTrack, StemPaths, VkTrackIdentity } from './types'

/** Waveform peak data lives outside the store (too big for React state). */
export const trackPeaks = new Map<string, WaveformPeaks>()
export const deckPeaks: (WaveformPeaks | null)[] = [null, null]
/** Zoomed peaks for the beatmatch view, computed per deck load. */
export const deckHiPeaks: (WaveformPeaks | null)[] = [null, null]

let trackCounter = 0

/** Bump when the BPM pipeline changes; older library entries re-analyze on startup. */
const ANALYSIS_VERSION = 3 // 3: whole-track beat grid (refineGrid)

export async function initApp(): Promise<void> {
  await engine.init()
  // A failure here blanks the whole app, so leave a breadcrumb in the log.
  console.info(
    `[stemdeck] audio engine ready — autotune ${engine.autotuneAvailable ? 'available' : 'UNAVAILABLE'}`
  )
  setInterval(syncTick, SYNC_TICK_MS)
  engine.decks.forEach((deck, i) => {
    deck.onEnded = () => updateDeck(i, { playing: false })
    deck.onPitch = (detected, target) => {
      deckPitch[i] = { detected, target }
    }
  })
  const [models, stemEngine] = await Promise.all([
    window.stemdeck.stemModels(),
    window.stemdeck.checkStemEngine()
  ])
  useStore.setState({
    engineReady: true,
    stemModels: models,
    stemEngine: { ...stemEngine, checked: true }
  })
  await restoreLibrary()
  void migrateStaleAnalyses()
  // Do not blindly split an entire restored library. Separation is queued for
  // newly imported tracks, or explicitly from a deck, so opening a 100+ track
  // collection never pins CPU/RAM for hours.
  window.stemdeck.onStemChunk(({ id, start, frames, data }) => {
    const deckIndex = deckStreams.findIndex((stream) => stream?.id === id)
    if (deckIndex >= 0) engine.decks[deckIndex].patchStems(start, frames, data)
  })
  window.stemdeck.onStemStreamProgress(({ id, done, total }) => {
    const stream = deckStreams.find((s) => s?.id === id)
    if (stream && total > 0) updateTrack(stream.trackId, { stemStatus: `stems ${Math.round((done / total) * 100)}%` })
  })
  window.stemdeck.onStemProgress(({ trackPath, line }) => {
    const track = useStore.getState().library.find((t) => t.path === trackPath)
    if (track) updateTrack(track.id, { stemStatus: line.slice(0, 120) })
  })
  void refreshRecordings()
  const youtube = await window.stemdeck.checkYoutube()
  useStore.setState((s) => ({ youtube: { ...s.youtube, available: youtube.ytdlp !== null } }))
  window.stemdeck.onYoutubeProgress(({ line }) => {
    useStore.setState((s) =>
      s.youtube.downloading ? { youtube: { ...s.youtube, status: line.slice(0, 120) } } : s
    )
  })
}

/** Download a YouTube track's audio with yt-dlp and drop it into the library. */
export async function addYoutubeTrack(url: string): Promise<void> {
  const { youtube } = useStore.getState()
  if (youtube.downloading) return
  if (!youtube.available) {
    showToast('yt-dlp not found — install it with: pipx install yt-dlp')
    return
  }
  useStore.setState((s) => ({
    youtube: { ...s.youtube, downloading: true, status: 'Starting download…' }
  }))
  try {
    const paths = await window.stemdeck.downloadYoutube(url)
    await addTrackPaths(paths)
    showToast(`Downloaded ${paths.length} track${paths.length > 1 ? 's' : ''} 🎶`)
  } catch (err) {
    showToast(`YouTube download failed: ${(err as Error).message}`)
  } finally {
    useStore.setState((s) => ({ youtube: { ...s.youtube, downloading: false, status: '' } }))
  }
}

// ---------- Library persistence ----------

function encodePeaks(peaks: WaveformPeaks): string {
  const u8 = new Uint8Array(peaks.data.buffer, peaks.data.byteOffset, peaks.data.byteLength)
  let binary = ''
  const CHUNK = 8192
  for (let i = 0; i < u8.length; i += CHUNK) {
    binary += String.fromCharCode(...u8.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

function decodePeaks(encoded: string): WaveformPeaks {
  const binary = atob(encoded)
  const u8 = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i)
  const data = new Float32Array(u8.buffer)
  return { data, buckets: data.length / 2 }
}

/** Persist the analyzed library so tracks survive app restarts. */
export async function saveLibrary(): Promise<void> {
  const { library, selectedModel, folders } = useStore.getState()
  const tracks: PersistedTrack[] = library
    .filter((t) => !t.analyzing)
    .map((t) => {
      const peaks = trackPeaks.get(t.id)
      return {
        path: t.path,
        name: t.name,
        duration: t.duration,
        bpm: t.bpm,
        firstBeat: t.firstBeat,
        bpmConfidence: t.bpmConfidence,
        musicalKey: t.musicalKey,
        musicalScale: t.musicalScale,
        keyStrength: t.keyStrength,
        v: t.analysisV,
        peaks: peaks ? encodePeaks(peaks) : null,
        stems: t.stems,
        folderId: t.folderId
      }
    })
  const persistedFolders: PersistedFolder[] = folders.map((f) => ({ id: f.id, name: f.name }))
  const data: PersistedLibrary = {
    version: 1,
    selectedModel,
    autoStems: useStore.getState().autoStems,
    tracks,
    folders: persistedFolders
  }
  await window.stemdeck.saveLibrary(data)
}

async function restoreLibrary(): Promise<void> {
  const data = (await window.stemdeck.loadLibrary()) as PersistedLibrary | null
  if (!data || data.version !== 1 || !Array.isArray(data.tracks)) return
  const folders: Folder[] = Array.isArray(data.folders)
    ? data.folders.map((f) => ({ id: f.id, name: f.name }))
    : []
  const validFolderIds = new Set(folders.map((f) => f.id))
  const tracks: TrackInfo[] = []
  // v0.1 originally defaulted to a two-stem MDX path. Its saved paths must not
  // masquerade as the new verified four-stem engine after the upgrade.
  const migrateLegacyMdx = data.selectedModel === 'UVR-MDX-NET-Inst_HQ_3.onnx'
  for (const saved of data.tracks) {
    const id = `track-${trackCounter++}`
    if (saved.peaks) {
      try {
        trackPeaks.set(id, decodePeaks(saved.peaks))
      } catch {
        // corrupt peaks — waveform will just be empty until re-added
      }
    }
    // Drop a track's crate reference if that crate no longer exists.
    const folderId = saved.folderId && validFolderIds.has(saved.folderId) ? saved.folderId : null
    const musicalKey =
      Number.isInteger(saved.musicalKey) &&
      saved.musicalKey !== null &&
      saved.musicalKey !== undefined &&
      saved.musicalKey >= 0 &&
      saved.musicalKey <= 11
        ? saved.musicalKey
        : null
    const musicalScale =
      saved.musicalScale === 'major' || saved.musicalScale === 'minor'
        ? saved.musicalScale
        : null
    tracks.push({
      id,
      path: saved.path,
      name: saved.name,
      duration: saved.duration,
      bpm: saved.bpm,
      firstBeat: saved.firstBeat,
      bpmConfidence: saved.bpmConfidence ?? 0,
      musicalKey: musicalScale === null ? null : musicalKey,
      musicalScale: musicalKey === null ? null : musicalScale,
      keyStrength:
        musicalKey !== null &&
        musicalScale !== null &&
        typeof saved.keyStrength === 'number' &&
        Number.isFinite(saved.keyStrength)
          ? Math.max(0, saved.keyStrength)
          : 0,
      analysisV: saved.v ?? 0,
      analyzing: false,
      stems: migrateLegacyMdx ? null : saved.stems,
      separating: false,
      stemStatus: '',
      folderId
    })
  }
  useStore.setState({
    library: tracks,
    folders,
    selectedModel: migrateLegacyMdx
      ? 'htdemucs.yaml'
      : data.selectedModel || useStore.getState().selectedModel,
    autoStems: data.autoStems ?? true
  })
}

/** Re-analyze tracks saved by an older BPM pipeline, one at a time. */
async function migrateStaleAnalyses(): Promise<void> {
  const stale = useStore
    .getState()
    .library.filter((t) => t.analysisV < ANALYSIS_VERSION)
    .map((t) => t.id)
  if (stale.length === 0) return
  showToast(`Upgrading BPM analysis for ${stale.length} track${stale.length > 1 ? 's' : ''}…`)
  for (const trackId of stale) {
    await reanalyzeTrack(trackId)
  }
  showToast('BPM analysis upgrade complete ✓')
}

// ---------- Library ----------

export async function addTracksFromDialog(): Promise<void> {
  const paths = await window.stemdeck.openAudioDialog()
  await addTrackPaths(paths)
}

export async function addDroppedFiles(files: FileList): Promise<void> {
  const paths: string[] = []
  for (const file of Array.from(files)) {
    if (/\.(mp3|wav|flac|m4a|aac|ogg|aiff)$/i.test(file.name)) {
      paths.push(window.stemdeck.getPathForFile(file))
    }
  }
  await addTrackPaths(paths)
}

export async function addFolderFromDialog(): Promise<void> {
  const paths = await window.stemdeck.openFolderDialog()
  if (!paths.length) {
    showToast('No audio files found in that folder')
    return
  }
  const before = useStore.getState().library.length
  // Never auto-split a whole folder: stems are queued per track on demand.
  await addTrackPaths(paths, { autoStems: false })
  const added = useStore.getState().library.length - before
  showToast(
    added
      ? `Added ${added} track${added > 1 ? 's' : ''} — analyzing BPM & key in the background`
      : 'All tracks from that folder are already in your library'
  )
}

/**
 * Put locally matched VK tracks into a "VK" crate. Tracks already filed in
 * another crate are left where they are, since a track lives in one crate.
 */
export function fileVkMatchesIntoCrate(trackIds: string[], crateName = 'VK'): void {
  const state = useStore.getState()
  let crate = state.folders.find((f) => f.name === crateName)
  if (!crate) {
    crate = { id: `folder-${Date.now()}-${folderCounter++}`, name: crateName }
    useStore.setState((s) => ({ folders: [...s.folders, crate!] }))
  }
  const crateId = crate.id
  const wanted = new Set(trackIds)
  let filed = 0
  let skipped = 0
  useStore.setState((s) => ({
    library: s.library.map((t) => {
      if (!wanted.has(t.id) || t.folderId === crateId) return t
      if (t.folderId) {
        skipped++
        return t
      }
      filed++
      return { ...t, folderId: crateId }
    }),
    activeFolderId: crateId
  }))
  showToast(
    `${filed} track${filed === 1 ? '' : 's'} filed into “${crateName}”` +
      (skipped ? ` · ${skipped} already in other crates` : '')
  )
  void saveLibrary()
}

async function addTrackPaths(paths: string[], opts: { autoStems?: boolean } = {}): Promise<void> {
  const { library, selectedModel, activeFolderId } = useStore.getState()
  // New tracks land in the crate you're currently viewing (if it's a real crate).
  const targetFolder = activeFolderId && activeFolderId !== RECORDINGS_VIEW && activeFolderId !== '__vk_music__' ? activeFolderId : null
  const known = new Set(library.map((t) => t.path))
  const added: TrackInfo[] = []
  for (const path of paths) {
    if (known.has(path)) continue
    known.add(path)
    const id = `track-${trackCounter++}`
    const name = path.split('/').pop() ?? path
    const track: TrackInfo = {
      id,
      path,
      name: name.replace(/\.[^.]+$/, ''),
      duration: 0,
      bpm: 0,
      firstBeat: 0,
      bpmConfidence: 0,
      musicalKey: null,
      musicalScale: null,
      keyStrength: 0,
      analysisV: 0,
      analyzing: true,
      stems: null,
      separating: false,
      stemStatus: '',
      folderId: targetFolder
    }
    added.push(track)
  }
  if (!added.length) return
  useStore.setState((s) => ({ library: [...s.library, ...added] }))
  const splitStems = opts.autoStems ?? useStore.getState().autoStems
  for (const track of added) analysisQueue.push(() => analyzeTrack(track, selectedModel, splitStems))
  pumpAnalysisQueue()
}

// Decoding a track holds the whole PCM in memory; analyze a couple at a time
// so importing a big folder doesn't exhaust RAM or freeze the UI.
const ANALYSIS_CONCURRENCY = 2
const analysisQueue: (() => Promise<void>)[] = []
let analysisRunning = 0

function pumpAnalysisQueue(): void {
  while (analysisRunning < ANALYSIS_CONCURRENCY && analysisQueue.length) {
    const job = analysisQueue.shift()!
    analysisRunning++
    void job().finally(() => {
      analysisRunning--
      pumpAnalysisQueue()
    })
  }
}

async function analyzeTrack(track: TrackInfo, model: string, splitStems: boolean): Promise<void> {
  try {
    const data = await window.stemdeck.readFile(track.path)
    const buffer = await engine.decode(data)
    trackPeaks.set(track.id, computePeaks(buffer))
    const cached = await window.stemdeck.getCachedStems(track.path, model)
    updateTrack(track.id, { duration: buffer.duration, stems: cached })
    if (!cached && splitStems) queueSeparation(track.id)
    const { bpm, firstBeat, confidence, key, scale, keyStrength } = await analyzeBpm(buffer)
    updateTrack(track.id, {
      bpm,
      firstBeat,
      bpmConfidence: confidence,
      musicalKey: key,
      musicalScale: scale,
      keyStrength: keyStrength ?? 0,
      analysisV: ANALYSIS_VERSION,
      analyzing: false
    })
    useStore.getState().decks.forEach((deckState, deckIndex) => {
      if (deckState.trackId === track.id) updateDeck(deckIndex, { baseBpm: bpm, firstBeat })
    })
    void saveLibrary()
  } catch (err) {
    updateTrack(track.id, { analyzing: false })
    showToast(`Failed to analyze ${track.name}: ${(err as Error).message}`)
  }
}

/**
 * Halve/double a track's BPM (octave correction when the detector picks
 * the wrong one). The beat grid stays valid: halving doubles the beat
 * length onto existing beats; doubling subdivides them.
 */
export function scaleTrackBpm(trackId: string, factor: 0.5 | 2): void {
  const track = useStore.getState().library.find((t) => t.id === trackId)
  if (!track || !track.bpm) return
  const bpm = Math.round(track.bpm * factor * 100) / 100
  if (bpm < 30 || bpm > 400) return
  updateTrack(trackId, { bpm })
  useStore.getState().decks.forEach((deck, i) => {
    if (deck.trackId === trackId) updateDeck(i, { baseBpm: bpm })
  })
  void saveLibrary()
}

/** Re-run BPM/waveform analysis (e.g. after detector improvements). */
export async function reanalyzeTrack(trackId: string): Promise<void> {
  const { library, selectedModel } = useStore.getState()
  const track = library.find((t) => t.id === trackId)
  if (!track || track.analyzing) return
  updateTrack(trackId, { analyzing: true })
  await analyzeTrack({ ...track, analyzing: true }, selectedModel, false)
}

// ---------- Crates (folders) ----------

let folderCounter = 0

export function setActiveFolder(folderId: string | null): void {
  useStore.setState({ activeFolderId: folderId })
  if (folderId === RECORDINGS_VIEW) void refreshRecordings()
}

export function createFolder(name = 'New Crate'): void {
  const id = `folder-${Date.now()}-${folderCounter++}`
  useStore.setState((s) => ({ folders: [...s.folders, { id, name }], activeFolderId: id }))
  void saveLibrary()
}

export function renameFolder(folderId: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  useStore.setState((s) => ({
    folders: s.folders.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
  }))
  void saveLibrary()
}

/** Delete a crate; its tracks stay in the library, just uncategorized. */
export function deleteFolder(folderId: string): void {
  useStore.setState((s) => ({
    folders: s.folders.filter((f) => f.id !== folderId),
    library: s.library.map((t) => (t.folderId === folderId ? { ...t, folderId: null } : t)),
    activeFolderId: s.activeFolderId === folderId ? null : s.activeFolderId
  }))
  void saveLibrary()
}

/** Assign a track to a crate (or null to move it back to All Tracks). */
export function moveTrackToFolder(trackId: string, folderId: string | null): void {
  const track = useStore.getState().library.find((t) => t.id === trackId)
  if (!track || track.folderId === folderId) return
  updateTrack(trackId, { folderId })
  const folderName = folderId
    ? useStore.getState().folders.find((f) => f.id === folderId)?.name ?? 'crate'
    : 'All Tracks'
  showToast(`Moved “${track.name}” to ${folderName}`)
  void saveLibrary()
}

// ---------- Recordings ----------

export async function refreshRecordings(): Promise<void> {
  const recordings = await window.stemdeck.listRecordings()
  useStore.setState({ recordings })
}

export async function revealRecording(filePath: string): Promise<void> {
  await window.stemdeck.revealPath(filePath)
}

export async function openRecordingsFolder(): Promise<void> {
  await window.stemdeck.openRecordingsFolder()
}

/** Import a saved recording into the library so it can be mixed like any track. */
export async function addRecordingToLibrary(filePath: string): Promise<void> {
  await addTrackPaths([filePath])
  showToast('Recording added to your library 🎶')
}

export async function loadVkTrackToDeck(
  deckIndex: number,
  track: { key: string; title: string; artist: string; identity?: VkTrackIdentity; duration?: number }
): Promise<boolean> {
  showToast(`Loading ${track.title} from VK…`)
  try {
    const filePath = await window.stemdeck.cacheVkTrack(track.key, track.title, track.artist, track.identity, track.duration)
    await addTrackPaths([filePath], { autoStems: false })
    const local = useStore.getState().library.find((item) => item.path === filePath)
    if (!local) throw new Error('Track was not added to the library')
    await loadTrackToDeck(deckIndex, local.id)
    showToast(`${track.title} loaded to deck ${deckIndex === 0 ? 'A' : 'B'} · BPM analysis started`)
    return true
  } catch (error) {
    showToast(`VK load failed: ${(error as Error).message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')}`)
    return false
  }
}

// ---------- Deck loading ----------

/**
 * A key/scale change during an asynchronous deck load wins over the detected
 * track key. The flag is controller-only because it describes user intent,
 * not persistent deck state.
 */
const autotuneKeyWasSetManually = [false, false]

/** The stem stream feeding each deck, if any (see startStemStream). */
const deckStreams: ({ id: string; trackId: string } | null)[] = [null, null]
let streamSeq = 0

function stopStemStream(deckIndex: number): void {
  const stream = deckStreams[deckIndex]
  if (!stream) return
  deckStreams[deckIndex] = null
  engine.decks[deckIndex].onJump = null
  void window.stemdeck.cancelStemStream(stream.id)
}

/**
 * Serato-style stems: the deck plays the mix right away while the worker
 * separates it chunk by chunk from the playhead, and each separated chunk is
 * swapped in as it arrives. Seeking moves the worker to the new position.
 */
function startStemStream(deckIndex: number, trackId: string, mix: AudioBuffer): void {
  const { selectedModel, stemEngine, library } = useStore.getState()
  const track = library.find((t) => t.id === trackId)
  // Only Demucs models (.yaml) stream; others go through PREPARE 4 STEMS.
  if (!track || !stemEngine.available || !selectedModel.endsWith('.yaml')) return
  const id = `deck${deckIndex}-${++streamSeq}`
  deckStreams[deckIndex] = { id, trackId }
  const deck = engine.decks[deckIndex]
  const frames = mix.length
  const pcm = new Float32Array(frames * 2)
  pcm.set(mix.getChannelData(0), 0)
  pcm.set(mix.getChannelData(mix.numberOfChannels > 1 ? 1 : 0), frames)
  deck.expandStems()
  deck.onJump = (seconds) => {
    if (deckStreams[deckIndex]?.id === id) void window.stemdeck.seekStemStream(id, Math.max(0, seconds))
  }
  updateDeck(deckIndex, {
    usingStems: true,
    stems: STEM_NAMES.map((name) => ({ name, active: true, volume: 1 }))
  })
  updateTrack(trackId, { separating: true, stemStatus: 'stems 0%' })
  window.stemdeck
    .streamStems(id, track.path, selectedModel, pcm.buffer, engine.sampleRate, deck.getPosition())
    .then((stems) => {
      updateTrack(trackId, { separating: false, stems, stemStatus: '' })
      void saveLibrary()
    })
    .catch((err: Error) => {
      updateTrack(trackId, { separating: false, stemStatus: '' })
      if (!/cancelled/.test(err.message)) showToast(`Stem streaming failed: ${err.message}`)
    })
    .finally(() => {
      if (deckStreams[deckIndex]?.id === id) {
        deckStreams[deckIndex] = null
        deck.onJump = null
      }
    })
}

/** Load a track to a deck; stems are used automatically whenever they exist. */
export async function loadTrackToDeck(deckIndex: number, trackId: string): Promise<void> {
  const track = useStore.getState().library.find((t) => t.id === trackId)
  if (!track) return
  stopStemStream(deckIndex)
  const withStems = track.stems !== null
  const deck = engine.decks[deckIndex]
  const { pitchRange, reverb } = useStore.getState().decks[deckIndex]
  autotuneKeyWasSetManually[deckIndex] = false
  const resetDeck = emptyDeck()
  deck.setAutotune(resetDeck.autotune)
  updateDeck(deckIndex, {
    ...resetDeck,
    pitchRange,
    reverb,
    loading: true,
    trackId,
    title: track.name
  })
  try {
    let stems: LoadedStem[]
    if (withStems && track.stems) {
      const entries = (['vocals', 'drums', 'bass', 'other', 'instrumental'] as const)
        .filter((k) => track.stems![k])
        .map((k) => ({ name: k, path: track.stems![k]! }))
      stems = await Promise.all(
        entries.map(async ({ name, path }) => {
          const data = await window.stemdeck.readFile(path)
          return { name: name[0].toUpperCase() + name.slice(1), buffer: await engine.decode(data) }
        })
      )
    } else {
      const data = await window.stemdeck.readFile(track.path)
      stems = [{ name: 'Mix', buffer: await engine.decode(data) }]
    }
    deckHiPeaks[deckIndex] = computeHiPeaks(stems.map((s) => s.buffer))
    deck.load(stems)
    deckPeaks[deckIndex] = trackPeaks.get(trackId) ?? null
    deck.setTempo(1)
    deck.setPitch(0)
    deck.setKeylock(false)
    updateDeck(deckIndex, {
      loading: false,
      duration: deck.duration,
      baseBpm: track.bpm,
      firstBeat: track.firstBeat,
      usingStems: withStems && stems.length > 1,
      stems: stems.map((s) => ({ name: s.name, active: true, volume: 1 }))
    })
    if (!withStems) startStemStream(deckIndex, trackId, stems[0].buffer)
    if (
      !autotuneKeyWasSetManually[deckIndex] &&
      track.musicalKey !== null &&
      track.musicalScale !== null
    ) {
      // Snap to the pentatonic form of the detected mode. Its notes are a
      // subset of the parent scale, so nothing lands out of key, but dropping
      // two notes forces the larger jumps that make the effect audible — the
      // full 7-note scale barely moves an already-tuned vocal.
      const detectedKey = {
        key: track.musicalKey,
        scale: (track.musicalScale === 'minor'
          ? 'minorPentatonic'
          : 'majorPentatonic') as AutotuneState['scale']
      }
      deck.setAutotune(detectedKey)
      const current = useStore.getState().decks[deckIndex].autotune
      updateDeck(deckIndex, { autotune: { ...current, ...detectedKey } })
    }
  } catch (err) {
    deckHiPeaks[deckIndex] = null
    deckPeaks[deckIndex] = null
    updateDeck(deckIndex, { ...emptyDeck() })
    showToast(`Failed to load track: ${(err as Error).message}`)
  }
}

/** Nudge a deck's position by real-time seconds (used by beatmatch view dragging). */
export function nudgePosition(deckIndex: number, realSeconds: number): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.trackId) return
  engine.decks[deckIndex].jumpBy(realSeconds * state.tempo)
}

// ---------- Transport ----------

export function togglePlay(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.trackId || state.loading) return
  const deck = engine.decks[deckIndex]
  if (state.playing) {
    deck.pause()
    updateDeck(deckIndex, { playing: false })
  } else {
    deck.play()
    updateDeck(deckIndex, { playing: true })
  }
}

/** CDJ-style: playing -> jump back to cue and stop; paused -> set cue here. */
export function cuePress(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.trackId) return
  const deck = engine.decks[deckIndex]
  if (state.playing) {
    deck.pause()
    deck.seek(state.cuePoint)
    updateDeck(deckIndex, { playing: false })
  } else {
    updateDeck(deckIndex, { cuePoint: deck.getPosition() })
  }
}

export function seek(deckIndex: number, seconds: number): void {
  engine.decks[deckIndex].seek(Math.max(0, seconds))
}

export function hotCuePress(deckIndex: number, slot: number, clear: boolean): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.trackId) return
  const deck = engine.decks[deckIndex]
  const cues = [...state.hotCues]
  if (clear) {
    cues[slot] = null
    updateDeck(deckIndex, { hotCues: cues })
    return
  }
  const existing = cues[slot]
  if (existing === null) {
    cues[slot] = deck.getPosition()
    updateDeck(deckIndex, { hotCues: cues })
  } else {
    deck.seek(existing)
    if (state.playing) deck.play()
  }
}

// ---------- Tempo / pitch / sync ----------

/** Manual tempo change (pitch fader); it releases a latched SYNC on this deck. */
export function setTempo(deckIndex: number, rate: number): void {
  engine.decks[deckIndex].setTempo(rate)
  updateDeck(deckIndex, { tempo: rate, synced: false })
}

export function setPitch(deckIndex: number, semitones: number): void {
  engine.decks[deckIndex].setPitch(semitones)
  updateDeck(deckIndex, { pitch: semitones })
}

export function toggleKeylock(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  const next = !state.keylock
  engine.decks[deckIndex].setKeylock(next)
  if (!next) {
    engine.decks[deckIndex].setPitch(0)
    updateDeck(deckIndex, { keylock: next, pitch: 0 })
  } else {
    updateDeck(deckIndex, { keylock: next })
  }
}

const PITCH_RANGES = [0.08, 0.16, 0.5]

/** Cycle the pitch fader range ±8% → ±16% → ±50%, clamping the current tempo into it. */
export function cyclePitchRange(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  const idx = PITCH_RANGES.indexOf(state.pitchRange)
  const next = PITCH_RANGES[(idx + 1) % PITCH_RANGES.length]
  const clamped = Math.min(1 + next, Math.max(1 - next, state.tempo))
  if (clamped !== state.tempo) engine.decks[deckIndex].setTempo(clamped)
  updateDeck(deckIndex, { pitchRange: next, tempo: clamped })
}

export function setReverb(deckIndex: number, amount: number): void {
  engine.decks[deckIndex].setReverb(amount)
  updateDeck(deckIndex, { reverb: amount })
}

/** Momentary pitch bend for beat alignment; call with 0 to release. */
export function pitchBend(deckIndex: number, amount: number): void {
  const state = useStore.getState().decks[deckIndex]
  engine.decks[deckIndex].setTempo(state.tempo * (1 + amount))
}

// ---------- Sync ----------

/**
 * The rate that puts this deck on the other deck's tempo, folded by octaves
 * so a 76 BPM track syncs to 153 rather than being dragged to 1.7x. `ratio`
 * is this deck's effective BPM over the other's: ½, 1 or 2.
 */
function syncTarget(me: DeckState, other: DeckState): { rate: number; ratio: number } | null {
  if (!me.baseBpm || !other.baseBpm) return null
  const masterBpm = other.baseBpm * other.tempo
  let rate = masterBpm / me.baseBpm
  let ratio = 1
  while (rate > 1.4) { rate /= 2; ratio /= 2 }
  while (rate < 0.7) { rate *= 2; ratio *= 2 }
  return { rate, ratio }
}

/**
 * Beat-phase error of the synced deck against the other, in real seconds;
 * positive means this deck is behind. With an octave fold the comparison is
 * on the slower of the two beats so every other beat lines up too.
 */
function syncPhaseError(deckIndex: number, me: DeckState, other: DeckState, ratio: number, rate: number): number {
  const myBeats = (engine.decks[deckIndex].getPosition() - me.firstBeat) / (60 / me.baseBpm)
  const otherBeats = (engine.decks[1 - deckIndex].getPosition() - other.firstBeat) / (60 / other.baseBpm)
  const myCycle = ratio > 1 ? ratio : 1
  const otherCycle = ratio < 1 ? 1 / ratio : 1
  const frac = (x: number): number => ((x % 1) + 1) % 1
  let cycles = frac(otherBeats / otherCycle) - frac(myBeats / myCycle)
  if (cycles >= 0.5) cycles -= 1
  if (cycles < -0.5) cycles += 1
  return cycles * myCycle * (60 / (me.baseBpm * rate))
}

const SYNC_TICK_MS = 40
const SYNC_SNAP_SECONDS = 0.06 // further off than this: jump into phase
const SYNC_DEADBAND_SECONDS = 0.003 // closer than this: leave the tempo exact
const SYNC_GAIN = 0.3 // tempo correction per second of phase error
const SYNC_MAX_BEND = 0.004 // at most ±0.4% — inaudible as pitch wobble
let syncCooldownUntil = 0

/**
 * Latched SYNC, like Serato's: the synced deck keeps the other deck's tempo
 * as it changes, and holds the beat phase with tiny tempo bends, so small
 * BPM-estimate or time-stretch errors can't make the two decks drift apart.
 */
function syncTick(): void {
  const { decks } = useStore.getState()
  decks.forEach((me, deckIndex) => {
    if (!me.synced) return
    const other = decks[1 - deckIndex]
    const target = syncTarget(me, other)
    if (!target || !other.trackId) return
    if (Math.abs(me.tempo - target.rate) > 1e-6) updateDeck(deckIndex, { tempo: target.rate })
    const deck = engine.decks[deckIndex]
    if (!me.playing || !other.playing || performance.now() < syncCooldownUntil) {
      deck.setTempo(target.rate)
      return
    }
    const error = syncPhaseError(deckIndex, me, other, target.ratio, target.rate)
    if (Math.abs(error) > SYNC_SNAP_SECONDS) {
      deck.setTempo(target.rate)
      deck.seek(Math.max(0, deck.getPosition() + error * target.rate))
      syncCooldownUntil = performance.now() + 300
      return
    }
    const bend = Math.abs(error) < SYNC_DEADBAND_SECONDS
      ? 0
      : Math.max(-SYNC_MAX_BEND, Math.min(SYNC_MAX_BEND, error * SYNC_GAIN))
    deck.setTempo(target.rate * (1 + bend))
  })
}

/** Toggle latched SYNC on this deck; the other deck becomes the tempo master. */
export function sync(deckIndex: number): void {
  const { decks } = useStore.getState()
  const me = decks[deckIndex]
  const other = decks[1 - deckIndex]
  if (me.synced) {
    updateDeck(deckIndex, { synced: false })
    engine.decks[deckIndex].setTempo(me.tempo)
    return
  }
  const target = syncTarget(me, other)
  if (!target || !other.trackId) {
    showToast('Sync needs a track with detected BPM on both decks')
    return
  }
  if (other.synced) updateDeck(1 - deckIndex, { synced: false })
  syncCooldownUntil = 0
  updateDeck(deckIndex, { synced: true, tempo: target.rate })
  engine.decks[deckIndex].setTempo(target.rate)
  syncTick()
}

// ---------- Loops ----------

function applyLoop(deckIndex: number, active: boolean, start: number, end: number): void {
  engine.decks[deckIndex].setLoop(active, start, end)
  updateDeck(deckIndex, { loop: { active, start, end } })
}

const BEATS_PER_BAR = 4

/**
 * Grid spacing used when snapping a loop: bars once the loop is a whole number
 * of bars long, beats otherwise — so a 4-bar loop always lands on a downbeat
 * while a 1- or 2-beat loop can still sit anywhere musical.
 */
function loopSnapUnit(state: DeckState, lengthSeconds: number): number | null {
  if (!state.baseBpm) return null
  const beatLen = 60 / state.baseBpm
  const barLen = beatLen * BEATS_PER_BAR
  const bars = lengthSeconds / barLen
  return bars >= 1 && Math.abs(bars - Math.round(bars)) < 0.02 ? barLen : beatLen
}

/** Quantize a source time onto the deck's beat grid. */
function snapToGrid(state: DeckState, seconds: number, unit: number): number {
  return state.firstBeat + Math.round((seconds - state.firstBeat) / unit) * unit
}

export function loopIn(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  const pos = engine.decks[deckIndex].getPosition()
  const beatLen = state.baseBpm ? 60 / state.baseBpm : null
  const start = beatLen ? Math.max(0, snapToGrid(state, pos, beatLen)) : pos
  applyLoop(deckIndex, false, start, state.loop.end)
}

export function loopOut(deckIndex: number): void {
  const state = useStore.getState().decks[deckIndex]
  const pos = engine.decks[deckIndex].getPosition()
  const beatLen = state.baseBpm ? 60 / state.baseBpm : null
  // Snap the tail to the grid, but never collapse the loop: a late snap that
  // lands on or behind the in-point rounds up to the next beat instead.
  let end = beatLen ? snapToGrid(state, pos, beatLen) : pos
  if (beatLen && end <= state.loop.start) end += beatLen
  if (end > state.loop.start) applyLoop(deckIndex, true, state.loop.start, end)
}

/** Slide the whole loop, keeping its length. Hold Shift (free) to bypass snapping. */
export function moveLoop(deckIndex: number, startSeconds: number, free = false): void {
  const state = useStore.getState().decks[deckIndex]
  const { loop, duration } = state
  const length = loop.end - loop.start
  if (length <= 0) return
  const unit = free ? null : loopSnapUnit(state, length)
  let start = unit ? snapToGrid(state, startSeconds, unit) : startSeconds
  start = Math.max(0, Math.min(start, Math.max(0, duration - length)))
  applyLoop(deckIndex, loop.active, start, start + length)
}

/** Drag one loop edge. Snapped to the grid and never shorter than one beat. */
export function resizeLoop(
  deckIndex: number,
  edge: 'start' | 'end',
  seconds: number,
  free = false
): void {
  const state = useStore.getState().decks[deckIndex]
  const { loop, duration, baseBpm } = state
  const beatLen = baseBpm ? 60 / baseBpm : null
  const minLength = beatLen ?? 0.05
  const t = !free && beatLen ? snapToGrid(state, seconds, beatLen) : seconds
  if (edge === 'start') {
    const start = Math.max(0, Math.min(t, loop.end - minLength))
    applyLoop(deckIndex, loop.active, start, loop.end)
  } else {
    const end = Math.min(duration || t, Math.max(t, loop.start + minLength))
    applyLoop(deckIndex, loop.active, loop.start, end)
  }
}

export function loopExit(deckIndex: number): void {
  const { loop } = useStore.getState().decks[deckIndex]
  applyLoop(deckIndex, false, loop.start, loop.end)
}

/** Beat-snapped loop of `beats` starting at the nearest beat before the playhead. */
export function beatLoop(deckIndex: number, beats: number): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.baseBpm) {
    showToast('Beat loops need a detected BPM')
    return
  }
  const beatLen = 60 / state.baseBpm
  const pos = engine.decks[deckIndex].getPosition()
  const beatsFromFirst = Math.max(0, Math.floor((pos - state.firstBeat) / beatLen))
  const start = state.firstBeat + beatsFromFirst * beatLen
  applyLoop(deckIndex, true, start, start + beats * beatLen)
}

/** Jump backward/forward by musical bars (4 beats each) at the track's own timeline. */
export function jumpBars(deckIndex: number, bars: number): void {
  const state = useStore.getState().decks[deckIndex]
  if (!state.trackId) return
  if (!state.baseBpm) {
    showToast('Bar jumps need a detected BPM')
    return
  }
  const seconds = bars * 4 * (60 / state.baseBpm)
  engine.decks[deckIndex].jumpBy(seconds)
}

// ---------- Autotune ----------

/**
 * Live pitch readout per deck. Kept out of the store: it updates far faster
 * than React should re-render, so the meter polls it instead.
 */
export const deckPitch: { detected: number; target: number }[] = [
  { detected: 0, target: 0 },
  { detected: 0, target: 0 }
]

export function setAutotune(deckIndex: number, patch: Partial<AutotuneState>): void {
  const current = useStore.getState().decks[deckIndex].autotune
  if (patch.enabled && !engine.autotuneAvailable) {
    showToast('Autotune unavailable — the pitch engine failed to load')
    return
  }
  if (patch.key !== undefined || patch.scale !== undefined) {
    autotuneKeyWasSetManually[deckIndex] = true
  }
  engine.decks[deckIndex].setAutotune(patch)
  updateDeck(deckIndex, { autotune: { ...current, ...patch } })
}

// ---------- Stems ----------

export function setStemActive(deckIndex: number, stemIndex: number, active: boolean): void {
  const state = useStore.getState().decks[deckIndex]
  const stems = state.stems.map((s, i) => (i === stemIndex ? { ...s, active } : s))
  engine.decks[deckIndex].setStemGain(stemIndex, active ? stems[stemIndex].volume : 0)
  updateDeck(deckIndex, { stems })
}

export function setStemVolume(deckIndex: number, stemIndex: number, volume: number): void {
  const state = useStore.getState().decks[deckIndex]
  const stems = state.stems.map((s, i) => (i === stemIndex ? { ...s, volume } : s))
  if (stems[stemIndex].active) engine.decks[deckIndex].setStemGain(stemIndex, volume)
  updateDeck(deckIndex, { stems })
}

/**
 * Sequential separation queue: stem splitting saturates the CPU, so newly
 * added tracks are processed one at a time in the background.
 */
const stemQueue: string[] = []
let queueRunning = false

export function queueSeparation(trackId: string): void {
  if (!useStore.getState().stemEngine.available) {
    showToast('Stem engine not found — install audio-separator (see README)')
    return
  }
  if (stemQueue.includes(trackId)) return
  stemQueue.push(trackId)
  if (queueRunning && stemQueue.length > 0) {
    showToast(`Queued for stem splitting (${stemQueue.length} waiting — one runs at a time)`)
  }
  void processStemQueue()
}

async function processStemQueue(): Promise<void> {
  if (queueRunning) return
  queueRunning = true
  try {
    while (stemQueue.length > 0) {
      const trackId = stemQueue.shift()!
      const track = useStore.getState().library.find((t) => t.id === trackId)
      if (!track || track.stems || track.separating) continue
      await separateTrack(trackId)
    }
  } finally {
    queueRunning = false
  }
}

export async function separateTrack(trackId: string): Promise<void> {
  const { library, selectedModel, stemEngine } = useStore.getState()
  const track = library.find((t) => t.id === trackId)
  if (!track || track.separating) return
  if (!stemEngine.available) {
    showToast('Stem engine not found — install audio-separator (see README)')
    return
  }
  updateTrack(trackId, { separating: true, stemStatus: 'Starting separation…' })
  try {
    const stems: StemPaths = await window.stemdeck.separateStems(track.path, selectedModel)
    updateTrack(trackId, { separating: false, stems, stemStatus: '' })
    void saveLibrary()
    showToast(`Stems ready for ${track.name}`)
  } catch (err) {
    updateTrack(trackId, { separating: false, stemStatus: '' })
    showToast(`Separation failed: ${(err as Error).message}`)
  }
}

// ---------- Mixer ----------

export function setEq(deckIndex: number, band: 'low' | 'mid' | 'high', value: number): void {
  engine.decks[deckIndex].setEq(band, value)
  updateMixer(deckIndex, band === 'low' ? { eqLow: value } : band === 'mid' ? { eqMid: value } : { eqHigh: value })
}

export function setFilter(deckIndex: number, value: number): void {
  engine.decks[deckIndex].setFilter(value)
  updateMixer(deckIndex, { filter: value })
}

export function setTrim(deckIndex: number, value: number): void {
  engine.decks[deckIndex].setTrim(value)
  updateMixer(deckIndex, { trim: value })
}

export function setFader(deckIndex: number, value: number): void {
  engine.decks[deckIndex].setFader(value)
  updateMixer(deckIndex, { fader: value })
}

export function setCrossfader(value: number): void {
  engine.setCrossfader(value)
  useStore.setState({ crossfader: value })
}

export function setMasterGain(value: number): void {
  engine.setMasterGain(value)
  useStore.setState({ masterGain: value })
}

// ---------- Recording ----------

export async function toggleRecording(): Promise<void> {
  if (engine.isRecording) {
    const blob = await engine.stopRecording()
    useStore.setState({ recording: false })
    const data = await blob.arrayBuffer()
    const saved = await window.stemdeck.saveRecording(data)
    if (saved) {
      const name = saved.split('/').pop() ?? saved
      showToast(`Mix saved as ${name} — find it in the Recordings crate`)
      void refreshRecordings()
    }
  } else {
    engine.startRecording()
    useStore.setState({ recording: true })
  }
}

// ---------- Video reels ----------

let reel: ReelRecorder | null = null

/** Live camera feed for the framing preview, or null when nothing is running. */
export function reelCamera(): MediaStream | null {
  return reel?.camera ?? null
}

export function reelElapsedSeconds(): number {
  return reel ? (performance.now() - reel.startedAt) / 1000 : 0
}

function mediaAccessHint(kind: 'camera' | 'microphone' | 'screen'): string {
  const pane =
    kind === 'screen' ? 'Screen & System Recording' : kind === 'camera' ? 'Camera' : 'Microphone'
  return `StemDeck needs ${kind} access — enable it in System Settings ▸ Privacy & Security ▸ ${pane}, then restart the app`
}

export async function toggleReelRecording(): Promise<void> {
  if (reel) {
    const recorder = reel
    reel = null
    updateReel({ recording: false, mic: false, saving: true })
    try {
      const blob = await recorder.stop()
      const saved = await window.stemdeck.saveReel(await blob.arrayBuffer())
      if (saved) {
        const name = saved.split('/').pop() ?? saved
        showToast(`Reel saved as ${name}`)
        // Reels are made to be posted, so put the file in front of you.
        void window.stemdeck.revealPath(saved)
      } else {
        showToast('Reel could not be saved')
      }
    } finally {
      updateReel({ saving: false })
    }
    return
  }

  // Prompt up front so a denied permission surfaces as advice, not a black frame.
  const access = await window.stemdeck.mediaAccess()
  if (access.camera !== 'granted' && !(await window.stemdeck.requestMediaAccess('camera'))) {
    showToast(mediaAccessHint('camera'))
    return
  }
  // Screen access is deliberately NOT pre-checked: macOS reports it as denied
  // until the first grant, and only raises its prompt when a capture is really
  // attempted. Bailing here would suppress the very prompt we need.
  const recorder = new ReelRecorder()
  recorder.onScreenEnded = () => {
    if (reel === recorder) void toggleReelRecording()
  }
  try {
    await recorder.start()
  } catch (err) {
    const denied = (err as Error).name === 'NotAllowedError'
    if (denied && access.screen !== 'granted') {
      showToast(mediaAccessHint('screen'))
      void window.stemdeck.openPrivacySettings('screen')
    } else {
      showToast(`Could not start the reel: ${(err as Error).message}`)
    }
    return
  }
  reel = recorder
  updateReel({ recording: true, mic: false, preview: false })
}

/** Mic can be flipped mid-take; the stream opens on first use. */
export async function toggleReelMic(): Promise<void> {
  const { mic } = useStore.getState().reel
  if (!reel) {
    updateReel({ mic: !mic })
    return
  }
  if (mic) {
    reel.muteMic()
    updateReel({ mic: false })
    return
  }
  const access = await window.stemdeck.mediaAccess()
  if (
    access.microphone !== 'granted' &&
    !(await window.stemdeck.requestMediaAccess('microphone'))
  ) {
    showToast(mediaAccessHint('microphone'))
    return
  }
  try {
    await reel.enableMic()
    updateReel({ mic: true })
  } catch (err) {
    showToast(`Could not open the mic: ${(err as Error).message}`)
  }
}

/**
 * Self-view for framing. It runs its own short-lived camera stream and is only
 * available while stopped — during a take it would be captured back into the
 * bottom half of the reel.
 */
let previewStream: MediaStream | null = null

export async function toggleCameraPreview(): Promise<void> {
  const { preview } = useStore.getState().reel
  if (preview) {
    previewStream?.getTracks().forEach((t) => t.stop())
    previewStream = null
    updateReel({ preview: false })
    return
  }
  try {
    previewStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false
    })
    updateReel({ preview: true })
  } catch {
    showToast(mediaAccessHint('camera'))
  }
}

export function cameraPreviewStream(): MediaStream | null {
  return previewStream
}
