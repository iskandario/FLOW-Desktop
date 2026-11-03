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

export interface VkTrack { key: string; title: string; artist: string }
export interface VkTrackIdentity { id: number; ownerId: number; accessKey: string }
export interface VkMusicTrack { key: string; title: string; artist: string; duration: number; identity: VkTrackIdentity; restricted: boolean }
export interface VkMusicPlaylist { id: number; ownerId: number; accessKey: string; title: string; count: number; cover: string }
export type VkListRequest =
  | { kind: 'my'; offset?: number; count?: number }
  | { kind: 'search'; query: string; offset?: number; count?: number }
  | { kind: 'playlist'; ownerId: number; id: number; accessKey?: string; offset?: number; count?: number }
export interface VkSessionStatus { signedIn: boolean; profile: { id: number; name: string } | null; checkedAt: number }

export interface StemDeckApi {
  listVkTracks(): Promise<{ tracks: VkTrack[]; updatedAt: number }>
  openVk(): Promise<void>
  vkStatus(): Promise<{ running: boolean }>
  vkSession(): Promise<VkSessionStatus>
  vkLogout(): Promise<void>
  cacheVkTrack(key: string, title: string, artist: string, identity?: VkTrackIdentity, duration?: number): Promise<string>
  vkMusicList(request: VkListRequest): Promise<{ items: VkMusicTrack[]; count: number }>
  vkMusicPlaylists(): Promise<VkMusicPlaylist[]>
  onVkSessionChanged(callback: (status: VkSessionStatus) => void): () => void
  onVkUpdated(callback: (count: number) => void): () => void
  openAudioDialog(): Promise<string[]>
  openFolderDialog(): Promise<string[]>
  readFile(filePath: string): Promise<ArrayBuffer>
  getPathForFile(file: File): string
  stemModels(): Promise<Record<string, { label: string; stems: number }>>
  checkStemEngine(): Promise<{ available: boolean; bin: string | null }>
  getCachedStems(trackPath: string, model: string): Promise<StemPaths | null>
  separateStems(trackPath: string, model: string): Promise<StemPaths>
  streamStems(id: string, trackPath: string, model: string, pcm: ArrayBuffer, rate: number, startSec: number): Promise<StemPaths>
  seekStemStream(id: string, seconds: number): Promise<void>
  cancelStemStream(id: string): Promise<void>
  onStemChunk(callback: (event: { id: string; start: number; frames: number; data: ArrayBuffer }) => void): () => void
  onStemStreamProgress(callback: (event: { id: string; done: number; total: number }) => void): () => void
  onStemProgress(callback: (event: StemProgressEvent) => void): () => void
  saveRecording(data: ArrayBuffer): Promise<string | null>
  saveReel(data: ArrayBuffer): Promise<string | null>
  mediaAccess(): Promise<{ camera: string; microphone: string; screen: string }>
  requestMediaAccess(kind: 'camera' | 'microphone'): Promise<boolean>
  openPrivacySettings(kind: 'camera' | 'microphone' | 'screen'): Promise<void>
  listRecordings(): Promise<RecordingInfo[]>
  openRecordingsFolder(): Promise<void>
  revealPath(filePath: string): Promise<void>
  loadLibrary(): Promise<unknown>
  saveLibrary(data: unknown): Promise<void>
  checkYoutube(): Promise<{ ytdlp: string | null; ffmpeg: string | null }>
  downloadYoutube(url: string): Promise<string[]>
  onYoutubeProgress(callback: (event: { url: string; line: string }) => void): () => void
}

export interface RecordingInfo {
  path: string
  name: string
  size: number
  mtime: number
}

export interface PersistedTrack {
  path: string
  name: string
  duration: number
  bpm: number
  firstBeat: number
  bpmConfidence?: number
  musicalKey?: number | null
  musicalScale?: 'major' | 'minor' | null
  keyStrength?: number
  /** Analysis pipeline version; older tracks are re-analyzed on startup. */
  v?: number
  /** Base64-encoded Float32Array of waveform min/max pairs. */
  peaks: string | null
  stems: StemPaths | null
  /** Crate this track belongs to, or null/undefined for uncategorized. */
  folderId?: string | null
}

export interface PersistedFolder {
  id: string
  name: string
}

export interface PersistedLibrary {
  version: 1
  selectedModel: string
  autoStems?: boolean
  tracks: PersistedTrack[]
  folders?: PersistedFolder[]
}

declare global {
  interface Window {
    stemdeck: StemDeckApi
  }
}
