import {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  session,
  shell,
  systemPreferences
} from 'electron'
import { promises as fs, existsSync } from 'fs'
import path from 'path'
import {
  cancelStemStream,
  findSeparatorBin,
  getCachedStems,
  seekStemStream,
  separateStems,
  STEM_MODELS,
  streamStems,
  warmStemWorker
} from './stems'
import { subprocessEnv } from './env'
import { checkYoutube, downloadYoutubeAudio, findFfmpeg } from './youtube'
import { execFile } from 'child_process'
import { createHash } from 'crypto'
import { tmpdir } from 'os'
import { saveReel } from './video'
import { VkBridge } from './vk-bridge'
import { VK_PARTITION, VkSession } from './vk-session'
import { listVkPlaylists, listVkTracks, resolveVkStream, type VkListRequest, type VkTrackIdentity } from './vk-music'

const isDev = !app.isPackaged && !!process.env.ELECTRON_RENDERER_URL
let mainWindow: BrowserWindow | null = null
let vkSession: VkSession | null = null
let vkBridge: VkBridge | null = null
let vkExtensionPath = ''
let vkStorageReader: BrowserWindow | null = null
let vkStorageTimer: NodeJS.Timeout | null = null

async function startVkStorageMirror(extensionId: string): Promise<void> {
  const reader = new BrowserWindow({
    show: false,
    webPreferences: { partition: VK_PARTITION, contextIsolation: true, sandbox: true }
  })
  vkStorageReader = reader
  await reader.loadURL(`chrome-extension://${extensionId}/bridge-reader.html`)
  let reading = false
  const sync = async (): Promise<void> => {
    if (reading || reader.isDestroyed() || !vkBridge) return
    reading = true
    try {
      const tracks = (await reader.webContents.executeJavaScript(
        `chrome.storage.local.get('flowLibraryCache').then(value => value.flowLibraryCache || [])`,
        true
      )) as unknown[]
      vkBridge.replace(Array.isArray(tracks) ? tracks : [])
    } catch (error) {
      console.warn('VK storage mirror failed:', (error as Error).message)
    } finally {
      reading = false
    }
  }
  await sync()
  vkStorageTimer = setInterval(() => void sync(), 1200)
}

// The tab-lookup error the extension returns while the VK window is still
// opening or loading; worth waiting out, unlike a real resolve failure.
const VK_TAB_MISSING = /VK CONNECT|Не найдена .*вкладка|Receiving end does not exist|Could not establish connection/i

async function askVkBridge(message: Record<string, unknown>): Promise<string> {
  const reader = vkStorageReader
  if (!reader || reader.isDestroyed()) throw new Error('VK bridge is not ready')
  vkSession?.ensureBridge()
  const payload = JSON.stringify(message)
  const deadline = Date.now() + 30000
  let failures = 0
  let error = 'VK audio stream is unavailable'
  while (Date.now() < deadline) {
    const result = (await reader.webContents
      .executeJavaScript(`chrome.runtime.sendMessage(${payload})`, true)
      .catch((e: Error) => ({ ok: false, error: e.message }))) as { ok?: boolean; mediaUrl?: string; error?: string }
    if (result?.ok && result.mediaUrl) return result.mediaUrl
    error = result?.error || error
    // A missing tab just means the VK window is still loading; anything else
    // gets a couple of retries for VK's own flakiness, then is reported.
    if (!VK_TAB_MISSING.test(error) && ++failures >= 2) break
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(error)
}

// The row for this key isn't on the page the bridge window shows, or VK
// blocks this upload in the user's region: either way, look for another
// upload of the same song in VK search.
const VK_ROW_MISSING = /не отдал ID|Строка трека исчезла|не найден|в твоём регионе/i

/**
 * Library keys come from whatever VK page the user scrolled (their tracks,
 * playlists, catalog), and VK only exposes a track through its row. Try the
 * user's full track list first, then VK search by artist and title.
 */
let vkResolveChain: Promise<unknown> = Promise.resolve()

/** One resolve at a time: each may navigate the single bridge window. */
function resolveVkMedia(key: string, title: string, artist: string): Promise<string> {
  const next = vkResolveChain.then(() => resolveVkMediaNow(key, title, artist))
  vkResolveChain = next.catch(() => {})
  return next
}

async function resolveVkMediaNow(key: string, title: string, artist: string): Promise<string> {
  const session = vkSession
  if (!session) throw new Error('VK bridge is not ready')
  session.ensureBridge()
  session.assertNoChallenge()
  // Fast path: FLOW learned this track's ID when its row was on screen, so a
  // single reload_audio call in the open VK tab is enough — no page loads,
  // which is what makes VK rate-limit us with its "are you a robot" check.
  const identity = vkBridge?.identity(key)
  if (identity) {
    try {
      return await askVkBridge({ type: 'flow-desktop-resolve-identity', identity })
    } catch (error) {
      if (!VK_ROW_MISSING.test((error as Error).message) && !/bad_hash|reload_audio|VK ответил/i.test((error as Error).message)) throw error
    }
  }
  const library = session.libraryUrl()
  if (session.currentUrl() && !session.currentUrl().includes(library.replace(/^https:\/\/vk\.com/, ''))) {
    await session.navigate(library)
  }
  try {
    return await askVkBridge({ type: 'flow-desktop-resolve-direct', key })
  } catch (error) {
    if (!VK_ROW_MISSING.test((error as Error).message)) throw error
  }
  const search = session.searchUrl(`${artist} ${title}`.trim())
  await session.navigate(search)
  try {
    try {
      return await askVkBridge({ type: 'flow-desktop-resolve-match', title, artist })
    } catch (error) {
      // A slow VK sometimes hasn't rendered results yet: reload once and look again.
      if (!/не нашёл/i.test((error as Error).message)) throw error
      await session.navigate(search, 4000)
      return await askVkBridge({ type: 'flow-desktop-resolve-match', title, artist })
    }
  } finally {
    void session.navigate(library, 0)
  }
}

/** HLS streams (VK's usual format) go through ffmpeg; plain files are fetched directly. */
async function downloadVkAudio(mediaUrl: string, file: string): Promise<void> {
  const partial = `${file}.part`
  try {
    if (/\.m3u8(?:[?#]|$)/i.test(mediaUrl)) {
      const ffmpeg = await findFfmpeg()
      if (!ffmpeg) throw new Error('VK streams this track as HLS; install ffmpeg (brew install ffmpeg) to load it')
      const run = (codec: string[]): Promise<void> =>
        new Promise((resolve, reject) => {
          execFile(
            ffmpeg,
            ['-y', '-v', 'error', '-i', mediaUrl, '-vn', ...codec, '-f', 'mp3', partial],
            { timeout: 5 * 60 * 1000, env: subprocessEnv() },
            (err, _stdout, stderr) => (err ? reject(new Error(stderr.trim().split('\n').pop() || err.message)) : resolve())
          )
        })
      // VK's HLS segments carry MP3: copy them losslessly, re-encode only if that fails.
      await run(['-c:a', 'copy']).catch(() => run(['-c:a', 'libmp3lame', '-b:a', '320k']))
    } else {
      const response = await session.fromPartition(VK_PARTITION).fetch(mediaUrl, { redirect: 'follow', cache: 'no-store' })
      if (!response.ok) throw new Error(`VK audio request failed: HTTP ${response.status}`)
      await fs.writeFile(partial, Buffer.from(await response.arrayBuffer()))
    }
    const { size } = await fs.stat(partial)
    if (size < 4096) throw new Error('VK returned an empty audio file')
    await fs.rename(partial, file)
  } finally {
    await fs.rm(partial, { force: true })
  }
}

function vkUserId(): number {
  return vkSession?.status().profile?.id ?? 0
}

function cleanIdentity(value: unknown): VkTrackIdentity | null {
  const raw = value as Partial<VkTrackIdentity> | null | undefined
  const id = Number(raw?.id)
  const ownerId = Number(raw?.ownerId)
  return id && ownerId ? { id, ownerId, accessKey: typeof raw?.accessKey === 'string' ? raw.accessKey : '' } : null
}

// VK API errors worth waiting out: the VK window is still opening or its
// scripts haven't loaded yet.
const VK_API_NOT_READY = /VK CONNECT|Не найдена .*вкладка|Receiving end does not exist|Could not establish connection|ещё не загрузился|bridge is not ready/i

/** One VK web-API call, made by the signed-in VK window (see the bridge's flow-desktop-api). */
async function callVkApi(method: string, params: Record<string, unknown>): Promise<unknown> {
  const session = vkSession
  if (!session) throw new Error('VK bridge is not ready')
  if (!session.status().signedIn) throw new Error('Войди в VK: кнопка ВОЙТИ в панели VK')
  session.ensureBridge()
  const payload = JSON.stringify({ type: 'flow-desktop-api', method, params })
  const deadline = Date.now() + 30000
  let error = `VK API ${method} не ответил`
  while (Date.now() < deadline) {
    session.assertNoChallenge()
    const reader = vkStorageReader
    if (reader && !reader.isDestroyed()) {
      const result = (await reader.webContents
        .executeJavaScript(`chrome.runtime.sendMessage(${payload})`, true)
        .catch((e: Error) => ({ ok: false, error: e.message }))) as { ok?: boolean; response?: unknown; error?: string }
      if (result?.ok) return result.response
      error = result?.error || error
      if (!VK_API_NOT_READY.test(error)) break
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(error)
}

async function cacheVkTrack(
  key: string,
  title: string,
  artist: string,
  identity: VkTrackIdentity | null = null,
  duration = 0
): Promise<string> {
  const safe = `${artist} - ${title}`.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 120) || 'VK track'
  // One folder per VK key keeps the file name clean (it becomes the deck title).
  const dir = path.join(app.getPath('userData'), 'VK Audio Cache', createHash('sha1').update(key).digest('hex').slice(0, 12))
  const file = path.join(dir, `${safe}.mp3`)
  if (existsSync(file)) return file
  await fs.mkdir(dir, { recursive: true })
  // Tracks listed through the VK API carry their ID: one getById call.
  // Older keys scraped from VK's pages still go through the page bridge.
  const mediaUrl = identity
    ? await resolveVkStream(callVkApi, { title, artist, identity, duration })
    : await resolveVkMedia(key, title, artist)
  await downloadVkAudio(mediaUrl, file)
  return file
}

async function prepareVkExtension(): Promise<string> {
  const source = app.isPackaged
    ? path.join(process.resourcesPath, 'vk-bridge')
    : path.join(app.getAppPath(), 'resources', 'vk-bridge')
  const target = path.join(app.getPath('userData'), 'vk-bridge-extension')
  await fs.rm(target, { recursive: true, force: true })
  await fs.cp(source, target, { recursive: true })
  await fs.writeFile(
    path.join(target, 'desktop-bridge-config.json'),
    JSON.stringify({ baseUrl: `http://127.0.0.1:${vkBridge?.port ?? 17835}`, token: vkBridge?.token ?? '' }),
    'utf8'
  )
  return target
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    title: 'FLOW Desktop',
    backgroundColor: '#0b0d12',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      // Reel capture composites on a rAF loop; throttling it when the window
      // is occluded would drop frames out of the recording.
      backgroundThrottling: false
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('console-message', (_event, _level, message) => {
    console.log(`[FLOW renderer] ${message}`)
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL as string)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  return win
}

const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'aiff']
const AUDIO_RE = new RegExp(`\\.(${AUDIO_EXTENSIONS.join('|')})$`, 'i')
const MAX_FOLDER_TRACKS = 20000

/** Recursively gather audio files, skipping hidden folders and app bundles. */
async function collectAudio(dir: string, out: string[], depth: number): Promise<void> {
  if (depth > 12 || out.length >= MAX_FOLDER_TRACKS) return
  let entries: import('fs').Dirent[]
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!/\.(app|bundle|photoslibrary)$/i.test(entry.name)) await collectAudio(full, out, depth + 1)
    } else if (entry.isFile() && AUDIO_RE.test(entry.name)) {
      out.push(full)
      if (out.length >= MAX_FOLDER_TRACKS) return
    }
  }
}

function registerIpc(): void {
  ipcMain.handle('vk:list', () => vkBridge?.list() ?? { tracks: [], updatedAt: 0 })
  ipcMain.handle('vk:open', () => vkSession?.open())
  ipcMain.handle('vk:session', () => vkSession?.status() ?? { signedIn: false, profile: null, checkedAt: 0 })
  ipcMain.handle('vk:logout', async () => {
    await vkSession?.logout()
    vkBridge?.clear()
  })
  ipcMain.handle('vk:status', () => ({ running: vkBridge !== null }))
  ipcMain.handle(
    'vk:cache-track',
    (_event, key: string, title: string, artist: string, identity?: VkTrackIdentity, duration?: number) =>
      cacheVkTrack(String(key || ''), String(title || ''), String(artist || ''), cleanIdentity(identity), Number(duration) || 0)
  )
  ipcMain.handle('vk:music-list', (_event, request: VkListRequest) => listVkTracks(callVkApi, vkUserId(), request))
  ipcMain.handle('vk:music-playlists', () => listVkPlaylists(callVkApi, vkUserId()))
  ipcMain.handle('dialog:open-folder', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Add a music folder',
      properties: ['openDirectory', 'multiSelections']
    })
    if (result.canceled) return []
    const found: string[] = []
    for (const dir of result.filePaths) await collectAudio(dir, found, 0)
    return found
  })
  ipcMain.handle('dialog:open-audio', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Add tracks',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio', extensions: AUDIO_EXTENSIONS }]
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    const buf = await fs.readFile(filePath)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  })

  ipcMain.handle('stems:models', () => STEM_MODELS)

  ipcMain.handle('stems:check', async () => {
    const bin = await findSeparatorBin()
    return { available: bin !== null, bin }
  })

  ipcMain.handle('stems:cached', (_event, trackPath: string, model: string) =>
    getCachedStems(trackPath, model)
  )

  ipcMain.handle('stems:separate', (event, trackPath: string, model: string) =>
    separateStems(trackPath, {
      model,
      onProgress: (line) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('stems:progress', { trackPath, line })
        }
      }
    })
  )

  ipcMain.handle(
    'stems:stream',
    (event, id: string, trackPath: string, model: string, pcm: ArrayBuffer, rate: number, startSec: number) =>
      streamStems({
        id,
        trackPath,
        model,
        pcm,
        rate,
        startSec,
        onChunk: (chunk) => {
          if (!event.sender.isDestroyed()) event.sender.send('stems:chunk', { id, ...chunk })
        },
        onProgress: (done, total) => {
          if (!event.sender.isDestroyed()) event.sender.send('stems:stream-progress', { id, done, total })
        }
      })
  )
  ipcMain.handle('stems:stream-seek', (_event, id: string, seconds: number) => seekStemStream(id, seconds))
  ipcMain.handle('stems:stream-cancel', (_event, id: string) => cancelStemStream(id))

  ipcMain.handle('youtube:check', () => checkYoutube())

  ipcMain.handle('youtube:download', (event, url: string) =>
    downloadYoutubeAudio(url, (line) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('youtube:progress', { url, line })
      }
    })
  )

  const libraryFile = (): string => path.join(app.getPath('userData'), 'library.json')

  ipcMain.handle('library:load', async () => {
    try {
      const raw = await fs.readFile(libraryFile(), 'utf8')
      const data = JSON.parse(raw)
      if (Array.isArray(data.tracks)) {
        data.tracks = data.tracks.filter(
          (t: { path?: string }) => typeof t.path === 'string' && existsSync(t.path)
        )
      }
      return data
    } catch {
      return null
    }
  })

  ipcMain.handle('library:save', async (_event, data: unknown) => {
    await fs.writeFile(libraryFile(), JSON.stringify(data), 'utf8')
  })

  // Recordings live in one predictable place so the app can list them.
  const recordingsDir = (): string => path.join(app.getPath('music'), 'StemDeck Recordings')

  ipcMain.handle('recording:save', async (_event, data: ArrayBuffer) => {
    const dir = recordingsDir()
    await fs.mkdir(dir, { recursive: true })
    // The recorder produces webm/opus; transcode to mp3 when ffmpeg exists
    const ffmpeg = await findFfmpeg()
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

    if (ffmpeg) {
      const outFile = path.join(dir, `stemdeck-mix-${stamp}.mp3`)
      const tmpFile = path.join(tmpdir(), `stemdeck-rec-${Date.now()}.webm`)
      await fs.writeFile(tmpFile, Buffer.from(data))
      try {
        await new Promise<void>((resolve, reject) => {
          execFile(
            ffmpeg,
            ['-y', '-i', tmpFile, '-codec:a', 'libmp3lame', '-b:a', '320k', outFile],
            { timeout: 10 * 60 * 1000, env: subprocessEnv() },
            (err) => (err ? reject(err) : resolve())
          )
        })
      } finally {
        await fs.rm(tmpFile, { force: true })
      }
      return outFile
    }

    const outFile = path.join(dir, `stemdeck-mix-${stamp}.webm`)
    await fs.writeFile(outFile, Buffer.from(data))
    return outFile
  })

  ipcMain.handle('reel:save', (_event, data: ArrayBuffer) => saveReel(data))

  ipcMain.handle('media:access', () => {
    if (process.platform !== 'darwin') {
      return { camera: 'granted', microphone: 'granted', screen: 'granted' }
    }
    return {
      camera: systemPreferences.getMediaAccessStatus('camera'),
      microphone: systemPreferences.getMediaAccessStatus('microphone'),
      screen: systemPreferences.getMediaAccessStatus('screen')
    }
  })

  ipcMain.handle('media:request', async (_event, kind: 'camera' | 'microphone') => {
    if (process.platform !== 'darwin') return true
    return systemPreferences.askForMediaAccess(kind)
  })

  // macOS only ever raises each privacy prompt once, so a dismissed prompt can
  // only be undone in System Settings — take the user straight there.
  ipcMain.handle('media:settings', async (_event, kind: 'camera' | 'microphone' | 'screen') => {
    if (process.platform !== 'darwin') return
    const pane =
      kind === 'screen'
        ? 'Privacy_ScreenCapture'
        : kind === 'camera'
          ? 'Privacy_Camera'
          : 'Privacy_Microphone'
    await shell.openExternal(`x-apple.systempreferences:com.apple.preference.security?${pane}`)
  })

  ipcMain.handle('recordings:list', async () => {
    const dir = recordingsDir()
    try {
      const names = await fs.readdir(dir)
      const items = await Promise.all(
        names
          // Reels are video and live in the same folder — keep them out of the
          // audio crate, where they would be offered as loadable tracks.
          .filter((n) => /\.(mp3|webm|wav)$/i.test(n) && !n.startsWith('stemdeck-reel-'))
          .map(async (name) => {
            const full = path.join(dir, name)
            const stat = await fs.stat(full)
            return { path: full, name, size: stat.size, mtime: stat.mtimeMs }
          })
      )
      return items.sort((a, b) => b.mtime - a.mtime)
    } catch {
      return []
    }
  })

  ipcMain.handle('recordings:open-folder', async () => {
    const dir = recordingsDir()
    await fs.mkdir(dir, { recursive: true })
    await shell.openPath(dir)
  })

  ipcMain.handle('path:reveal', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })
}

// Two FLOW processes would fight over the VK bridge port and the extension
// folder, breaking VK sync in both. Focus the running one instead.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.whenReady().then(async () => {
  vkBridge = new VkBridge()
  try {
    await vkBridge.start()
  } catch (error) {
    // Another FLOW instance (or a stale process) owns the port: run without VK sync.
    console.error('VK bridge could not start:', error)
    vkBridge = null
  }
  vkBridge?.onUpdate((tracks) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('vk:updated', tracks.length)
  })
  vkExtensionPath = await prepareVkExtension()
  const vkPartition = session.fromPartition(VK_PARTITION)
  // Persistent partitions auto-restore unpacked extensions before app startup.
  // Always unload that cached build so manifest/CSP/model updates take effect.
  for (const extension of vkPartition.extensions.getAllExtensions()) {
    if (extension.name.startsWith('FLOW')) vkPartition.extensions.removeExtension(extension.id)
  }
  const vkExtension = await vkPartition.extensions.loadExtension(vkExtensionPath, { allowFileAccess: true })
  await startVkStorageMirror(vkExtension.id)
  vkSession = new VkSession()
  await vkSession.start()
  vkSession.onChange((status) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('vk:session-changed', status)
  })
  registerIpc()
  // Load torch and the default 4-stem model while the UI starts, so the first
  // split doesn't pay for it. Failure is fine: separation falls back to the CLI.
  void warmStemWorker('htdemucs.yaml').catch((error) => console.warn('Stem worker warm-up failed:', error.message))
  mainWindow = createWindow()
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] })
      const mediaSourceId =
        mainWindow && !mainWindow.isDestroyed() ? mainWindow.getMediaSourceId() : null
      const source = sources.find(({ id }) => id === mediaSourceId)
      if (source) {
        callback({ video: source })
        return
      }

      const screen = sources.find(({ id }) => id.startsWith('screen:'))
      callback(screen ? { video: screen } : {})
    } catch (error) {
      console.error('Failed to select a display media source:', error)
      callback({})
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
      mainWindow.on('closed', () => {
        mainWindow = null
      })
    }
  })
})

app.on('before-quit', () => {
  if (vkStorageTimer) clearInterval(vkStorageTimer)
  vkStorageTimer = null
  if (vkStorageReader && !vkStorageReader.isDestroyed()) vkStorageReader.destroy()
  vkStorageReader = null
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  void vkBridge?.stop()
})
