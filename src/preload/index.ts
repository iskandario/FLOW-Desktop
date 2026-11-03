import { contextBridge, ipcRenderer, webUtils } from 'electron'

export interface StemPaths {
  vocals?: string
  drums?: string
  bass?: string
  other?: string
  instrumental?: string
}

export interface StemProgressEvent {
  trackPath: string
  line: string
}

export interface StemChunkEvent {
  id: string
  start: number
  frames: number
  data: ArrayBuffer
}

export interface VkTrack { key: string; title: string; artist: string }
export interface VkTrackIdentity { id: number; ownerId: number; accessKey: string }
export interface VkMusicTrack { key: string; title: string; artist: string; duration: number; identity: VkTrackIdentity; restricted: boolean }
export interface VkMusicPlaylist { id: number; ownerId: number; accessKey: string; title: string; count: number; cover: string }
export type VkListRequest =
  | { kind: 'my'; offset?: number; count?: number }
  | { kind: 'search'; query: string; offset?: number; count?: number }
  | { kind: 'playlist'; ownerId: number; id: number; accessKey?: string; offset?: number; count?: number }
export interface VkSessionStatus { signedIn: boolean; profile: { id: number; name: string } | null; checkedAt: number }

const api = {
  listVkTracks: (): Promise<{ tracks: VkTrack[]; updatedAt: number }> => ipcRenderer.invoke('vk:list'),
  openVk: (): Promise<void> => ipcRenderer.invoke('vk:open'),
  vkStatus: (): Promise<{ running: boolean }> => ipcRenderer.invoke('vk:status'),
  vkSession: (): Promise<VkSessionStatus> => ipcRenderer.invoke('vk:session'),
  vkLogout: (): Promise<void> => ipcRenderer.invoke('vk:logout'),
  cacheVkTrack: (key: string, title: string, artist: string, identity?: VkTrackIdentity, duration?: number): Promise<string> =>
    ipcRenderer.invoke('vk:cache-track', key, title, artist, identity, duration),
  vkMusicList: (request: VkListRequest): Promise<{ items: VkMusicTrack[]; count: number }> =>
    ipcRenderer.invoke('vk:music-list', request),
  vkMusicPlaylists: (): Promise<VkMusicPlaylist[]> => ipcRenderer.invoke('vk:music-playlists'),
  onVkSessionChanged: (callback: (status: VkSessionStatus) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, status: VkSessionStatus): void => callback(status)
    ipcRenderer.on('vk:session-changed', listener)
    return () => ipcRenderer.removeListener('vk:session-changed', listener)
  },
  onVkUpdated: (callback: (count: number) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, count: number): void => callback(count)
    ipcRenderer.on('vk:updated', listener)
    return () => ipcRenderer.removeListener('vk:updated', listener)
  },
  openAudioDialog: (): Promise<string[]> => ipcRenderer.invoke('dialog:open-audio'),
  openFolderDialog: (): Promise<string[]> => ipcRenderer.invoke('dialog:open-folder'),
  readFile: (filePath: string): Promise<ArrayBuffer> => ipcRenderer.invoke('file:read', filePath),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  stemModels: (): Promise<Record<string, { label: string; stems: number }>> =>
    ipcRenderer.invoke('stems:models'),
  checkStemEngine: (): Promise<{ available: boolean; bin: string | null }> =>
    ipcRenderer.invoke('stems:check'),
  getCachedStems: (trackPath: string, model: string): Promise<StemPaths | null> =>
    ipcRenderer.invoke('stems:cached', trackPath, model),
  separateStems: (trackPath: string, model: string): Promise<StemPaths> =>
    ipcRenderer.invoke('stems:separate', trackPath, model),
  streamStems: (
    id: string,
    trackPath: string,
    model: string,
    pcm: ArrayBuffer,
    rate: number,
    startSec: number
  ): Promise<StemPaths> => ipcRenderer.invoke('stems:stream', id, trackPath, model, pcm, rate, startSec),
  seekStemStream: (id: string, seconds: number): Promise<void> => ipcRenderer.invoke('stems:stream-seek', id, seconds),
  cancelStemStream: (id: string): Promise<void> => ipcRenderer.invoke('stems:stream-cancel', id),
  onStemChunk: (callback: (event: StemChunkEvent) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: StemChunkEvent): void => callback(payload)
    ipcRenderer.on('stems:chunk', listener)
    return () => ipcRenderer.removeListener('stems:chunk', listener)
  },
  onStemStreamProgress: (callback: (event: { id: string; done: number; total: number }) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: { id: string; done: number; total: number }): void =>
      callback(payload)
    ipcRenderer.on('stems:stream-progress', listener)
    return () => ipcRenderer.removeListener('stems:stream-progress', listener)
  },
  onStemProgress: (callback: (event: StemProgressEvent) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: StemProgressEvent): void =>
      callback(payload)
    ipcRenderer.on('stems:progress', listener)
    return () => ipcRenderer.removeListener('stems:progress', listener)
  },
  saveRecording: (data: ArrayBuffer): Promise<string | null> =>
    ipcRenderer.invoke('recording:save', data),
  saveReel: (data: ArrayBuffer): Promise<string | null> => ipcRenderer.invoke('reel:save', data),
  mediaAccess: (): Promise<{ camera: string; microphone: string; screen: string }> =>
    ipcRenderer.invoke('media:access'),
  requestMediaAccess: (kind: 'camera' | 'microphone'): Promise<boolean> =>
    ipcRenderer.invoke('media:request', kind),
  openPrivacySettings: (kind: 'camera' | 'microphone' | 'screen'): Promise<void> =>
    ipcRenderer.invoke('media:settings', kind),
  listRecordings: (): Promise<{ path: string; name: string; size: number; mtime: number }[]> =>
    ipcRenderer.invoke('recordings:list'),
  openRecordingsFolder: (): Promise<void> => ipcRenderer.invoke('recordings:open-folder'),
  revealPath: (filePath: string): Promise<void> => ipcRenderer.invoke('path:reveal', filePath),
  loadLibrary: (): Promise<unknown> => ipcRenderer.invoke('library:load'),
  saveLibrary: (data: unknown): Promise<void> => ipcRenderer.invoke('library:save', data),
  checkYoutube: (): Promise<{ ytdlp: string | null; ffmpeg: string | null }> =>
    ipcRenderer.invoke('youtube:check'),
  downloadYoutube: (url: string): Promise<string[]> => ipcRenderer.invoke('youtube:download', url),
  onYoutubeProgress: (callback: (event: { url: string; line: string }) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: { url: string; line: string }): void =>
      callback(payload)
    ipcRenderer.on('youtube:progress', listener)
    return () => ipcRenderer.removeListener('youtube:progress', listener)
  }
}

export type StemDeckApi = typeof api

contextBridge.exposeInMainWorld('stemdeck', api)
