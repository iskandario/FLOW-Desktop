/**
 * The user's VK music, read through VK's own web API in the signed-in VK
 * window (see `flow-desktop-api` in the bridge extension).
 *
 * Every track comes with its owner/id/access key, so fetching its stream is
 * one `audio.getById` call — no page loads in the VK window, which is what
 * trips VK's "are you a robot" check.
 */

export interface VkTrackIdentity { id: number; ownerId: number; accessKey: string }

export interface VkMusicTrack {
  key: string
  title: string
  artist: string
  duration: number
  identity: VkTrackIdentity
  /** VK won't stream this upload here (region lock); FLOW looks for another. */
  restricted: boolean
}

export interface VkMusicPlaylist {
  id: number
  ownerId: number
  accessKey: string
  title: string
  count: number
  cover: string
}

export interface VkPage<T> { items: T[]; count: number }

export type VkListRequest =
  | { kind: 'my'; offset?: number; count?: number }
  | { kind: 'search'; query: string; offset?: number; count?: number }
  | { kind: 'playlist'; ownerId: number; id: number; accessKey?: string; offset?: number; count?: number }

export type VkApiCall = (method: string, params: Record<string, unknown>) => Promise<unknown>

interface RawAudio {
  id?: number
  owner_id?: number
  access_key?: string
  title?: string
  artist?: string
  duration?: number
  url?: string
  content_restricted?: number
}

interface RawPlaylist {
  id?: number
  owner_id?: number
  access_key?: string
  title?: string
  count?: number
  photo?: Record<string, string>
  thumbs?: Record<string, string>[]
}

function items<T>(response: unknown): { items: T[]; count: number } {
  const value = response as { items?: T[]; count?: number } | null
  const list = Array.isArray(value?.items) ? value!.items : Array.isArray(response) ? (response as T[]) : []
  return { items: list, count: Number(value?.count ?? list.length) || list.length }
}

function toTrack(raw: RawAudio): VkMusicTrack | null {
  const id = Number(raw.id)
  const ownerId = Number(raw.owner_id)
  if (!id || !ownerId || !raw.title) return null
  return {
    key: `vk:${ownerId}_${id}`,
    title: String(raw.title).trim(),
    artist: String(raw.artist || '').trim(),
    duration: Number(raw.duration) || 0,
    identity: { id, ownerId, accessKey: String(raw.access_key || '') },
    restricted: !raw.url || Number(raw.content_restricted) > 0
  }
}

function toPlaylist(raw: RawPlaylist): VkMusicPlaylist | null {
  const id = Number(raw.id)
  const ownerId = Number(raw.owner_id)
  if (!ownerId || !raw.title) return null
  const photo = raw.photo || raw.thumbs?.[0] || {}
  return {
    id,
    ownerId,
    accessKey: String(raw.access_key || ''),
    title: String(raw.title),
    count: Number(raw.count) || 0,
    cover: photo.photo_300 || photo.photo_270 || photo.photo_135 || ''
  }
}

const PAGE = 200

/** VK's own search (as on vk.com), which finds re-uploads and mashups the API search misses. */
async function catalogSearch(call: VkApiCall, query: string): Promise<RawAudio[]> {
  const found = (await call('catalog.getAudioSearch', { query })) as { catalog?: { sections?: { id?: string }[] } }
  const sectionId = found?.catalog?.sections?.[0]?.id
  if (!sectionId) return []
  const section = (await call('catalog.getSection', { section_id: sectionId })) as { audios?: RawAudio[] }
  return Array.isArray(section?.audios) ? section.audios : []
}

function dedupe(list: VkMusicTrack[]): VkMusicTrack[] {
  const seen = new Set<string>()
  return list.filter((t) => !seen.has(t.key) && seen.add(t.key))
}

export async function listVkTracks(call: VkApiCall, userId: number, request: VkListRequest): Promise<VkPage<VkMusicTrack>> {
  const offset = Math.max(0, request.offset || 0)
  const count = Math.min(PAGE, Math.max(1, request.count || PAGE))
  let response: unknown
  if (request.kind === 'my') {
    response = await call('audio.get', { ...(userId ? { owner_id: userId } : {}), offset, count })
  } else if (request.kind === 'playlist') {
    response = await call('audio.get', {
      owner_id: request.ownerId,
      album_id: request.id,
      ...(request.accessKey ? { access_key: request.accessKey } : {}),
      offset,
      count
    })
  } else {
    const q = request.query.trim()
    if (!q) return { items: [], count: 0 }
    // First page: VK's catalog search, the same results and order as vk.com.
    // Further pages: the API search, which pages by offset.
    const more = items<RawAudio>(await call('audio.search', { q, offset, count: Math.min(count, 100), auto_complete: 1 }))
    if (offset > 0) response = more
    else {
      const catalog = await catalogSearch(call, q).catch(() => [] as RawAudio[])
      response = { items: [...catalog, ...more.items], count: Math.max(more.count, catalog.length) }
    }
  }
  const page = items<RawAudio>(response)
  return { items: dedupe(page.items.map(toTrack).filter((t): t is VkMusicTrack => t !== null)), count: page.count }
}

export async function listVkPlaylists(call: VkApiCall, userId: number): Promise<VkMusicPlaylist[]> {
  const all: VkMusicPlaylist[] = []
  for (let offset = 0; offset < 1000; offset += 100) {
    const page = items<RawPlaylist>(await call('audio.getPlaylists', { ...(userId ? { owner_id: userId } : {}), offset, count: 100 }))
    all.push(...page.items.map(toPlaylist).filter((p): p is VkMusicPlaylist => p !== null))
    if (all.length >= page.count || !page.items.length) break
  }
  return all
}

function words(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[()[\]{}.,:;!?'"«»&+/\\_*–—-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function bareTitle(value: string): string {
  return words(value.replace(/\s*[([].*?[)\]]/g, ' ').replace(/\s+(feat|ft|prod)\.?\s.*$/i, '')).join(' ')
}

/** How well a search result stands in for the wanted track; 0 = not the same song. */
export function matchScore(want: { title: string; artist: string; duration?: number }, got: RawAudio): number {
  const wantTitle = words(want.title).join(' ')
  const gotTitle = words(String(got.title || '')).join(' ')
  if (!wantTitle || !gotTitle) return 0
  const title = gotTitle === wantTitle ? 3 : bareTitle(want.title) && bareTitle(want.title) === bareTitle(String(got.title || '')) ? 2 : 0
  if (!title) return 0
  const wantArtist = new Set(words(want.artist))
  const shared = words(String(got.artist || '')).filter((w) => wantArtist.has(w)).length
  if (!shared && wantArtist.size) return 0
  const close = want.duration && got.duration ? Math.abs(want.duration - Number(got.duration)) <= 3 : false
  return title + Math.min(shared, 3) + (close ? 2 : 0)
}

/**
 * A fresh stream URL for a track. VK sometimes withholds an upload in the
 * user's region; then the same song is taken from another upload found by
 * search (same title and artist, duration within a few seconds preferred).
 */
export async function resolveVkStream(
  call: VkApiCall,
  track: { title: string; artist: string; identity: VkTrackIdentity; duration?: number }
): Promise<string> {
  const { id, ownerId, accessKey } = track.identity
  const ids = [ownerId, id, accessKey].filter((v) => v !== '' && v !== undefined).join('_')
  const [own] = items<RawAudio>(await call('audio.getById', { audios: ids })).items
  if (own?.url) return own.url
  const duration = track.duration || Number(own?.duration) || 0
  const query = `${track.artist} ${track.title}`.trim()
  const found = [
    ...(await catalogSearch(call, query).catch(() => [] as RawAudio[])),
    ...items<RawAudio>(await call('audio.search', { q: query, count: 50, auto_complete: 0 })).items
  ]
  const best = found
    .filter((raw) => raw.url && !(raw.owner_id === ownerId && raw.id === id))
    .map((raw) => ({ raw, score: matchScore({ title: track.title, artist: track.artist, duration }, raw) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)[0]
  if (best?.raw.url) return best.raw.url
  throw new Error(
    own
      ? 'VK не даёт слушать этот трек в твоём регионе, и другой заливки не нашлось'
      : 'VK не нашёл этот трек — возможно, он удалён'
  )
}
