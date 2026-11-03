/**
 * Pure helpers for the library: fuzzy matching between VK collection metadata
 * and local audio files, Camelot key notation, and harmonic/BPM compatibility.
 * No DOM, no store — safe to unit-test with plain Node.
 */

export interface MatchableLocal {
  id: string
  name: string
  path: string
}

export interface MatchableRemote {
  key: string
  title: string
  artist: string
}

const NOISE = [
  'official video', 'official audio', 'official music video', 'lyric video', 'lyrics',
  'audio', 'video', 'hd', 'hq', '320 kbps', '320kbps', 'free download', 'премьера', 'клип'
]

/** Lower-case, strip accents/punctuation/brackets/noise so names compare loosely. */
export function normalize(text: string): string {
  let s = (text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  s = s.replace(/ё/g, 'е')
  // Drop bracketed noise like "(Official Video)" but keep remix/edit info.
  s = s.replace(/[([{]([^)\]}]*)[)\]}]/g, (_m, inner: string) =>
    /(remix|mix|edit|version|bootleg|vip|rework|dub|extended|radio|club|acoustic|live|ремикс)/.test(inner)
      ? ` ${inner} `
      : ' '
  )
  for (const n of NOISE) s = s.split(n).join(' ')
  s = s.replace(/\b(feat|ft|featuring)\.?\b/g, ' ')
  s = s.replace(/[^\p{L}\p{N}]+/gu, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

function tokens(text: string): string[] {
  return normalize(text).split(' ').filter((t) => t.length > 1 || /\d/.test(t))
}

/** Dice coefficient over token sets: 1 = same words, 0 = nothing shared. */
export function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(tokens(a))
  const tb = new Set(tokens(b))
  if (!ta.size || !tb.size) return 0
  let shared = 0
  for (const t of ta) if (tb.has(t)) shared++
  return (2 * shared) / (ta.size + tb.size)
}

const labelCache = new Map<string, string>()

/** Track name + file name + parent folder (often "Artist" or "Artist - Album"). */
function fileLabel(local: MatchableLocal): string {
  const cacheKey = `${local.path}\u0000${local.name}`
  const cached = labelCache.get(cacheKey)
  if (cached !== undefined) return cached
  const parts = local.path.split(/[\\/]/)
  const file = (parts.pop() ?? '').replace(/\.[^.]+$/, '')
  const parent = parts.pop() ?? ''
  const label = `${local.name} ${file === local.name ? '' : file} ${parent}`
  if (labelCache.size > 50000) labelCache.clear()
  labelCache.set(cacheKey, label)
  return label
}

/**
 * Score how likely a local file is the VK track. The title must be present;
 * the artist adds confidence. Returns [0, 1].
 */
export function matchScore(remote: MatchableRemote, local: MatchableLocal): number {
  const label = fileLabel(local)
  const labelTokens = new Set(tokens(label))
  const titleTokens = tokens(remote.title)
  if (!titleTokens.length) return 0
  const titleHits = titleTokens.filter((t) => labelTokens.has(t)).length / titleTokens.length
  if (titleHits < 0.6) return 0
  const artistTokens = tokens(remote.artist)
  const artistHits = artistTokens.length
    ? artistTokens.filter((t) => labelTokens.has(t)).length / artistTokens.length
    : 0.5
  const overall = tokenSimilarity(`${remote.artist} ${remote.title}`, label)
  return Math.min(1, titleHits * 0.5 + artistHits * 0.3 + overall * 0.2)
}

export const MATCH_THRESHOLD = 0.72

/** Best local file for each VK track (or null). Linear in |remote| × |local|. */
export function matchCollection<L extends MatchableLocal>(
  remote: MatchableRemote[],
  locals: L[]
): Map<string, L | null> {
  const result = new Map<string, L | null>()
  // Index local files by token so each VK track only scores plausible candidates.
  const index = new Map<string, L[]>()
  for (const local of locals) {
    for (const t of new Set(tokens(fileLabel(local)))) {
      const bucket = index.get(t)
      if (bucket) bucket.push(local)
      else index.set(t, [local])
    }
  }
  for (const track of remote) {
    const candidates = new Set<L>()
    for (const t of tokens(track.title)) for (const l of index.get(t) ?? []) candidates.add(l)
    let best: L | null = null
    let bestScore = MATCH_THRESHOLD
    for (const local of candidates) {
      const score = matchScore(track, local)
      if (score >= bestScore) {
        best = local
        bestScore = score
      }
    }
    result.set(track.key, best)
  }
  return result
}

// ---------- Keys ----------

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
// Camelot number for each root, major (B) and minor (A).
const CAMELOT_MAJOR = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1]
const CAMELOT_MINOR = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10]

export interface Camelot {
  number: number
  letter: 'A' | 'B'
}

export function toCamelot(key: number | null, scale: 'major' | 'minor' | null): Camelot | null {
  if (key === null || scale === null || key < 0 || key > 11) return null
  return scale === 'major'
    ? { number: CAMELOT_MAJOR[key], letter: 'B' }
    : { number: CAMELOT_MINOR[key], letter: 'A' }
}

export function camelotLabel(c: Camelot | null): string {
  return c ? `${c.number}${c.letter}` : '—'
}

export function keyName(key: number | null, scale: 'major' | 'minor' | null): string {
  if (key === null || scale === null) return ''
  return `${NOTE_NAMES[key]} ${scale === 'major' ? 'maj' : 'min'}`
}

/**
 * Harmonic relation on the Camelot wheel: same key, ±1 step on the same
 * ring, or the relative major/minor. These mix without key clashes.
 */
export function harmonicMatch(a: Camelot | null, b: Camelot | null): 'same' | 'compatible' | null {
  if (!a || !b) return null
  if (a.number === b.number && a.letter === b.letter) return 'same'
  if (a.number === b.number) return 'compatible'
  if (a.letter === b.letter) {
    const diff = (a.number - b.number + 12) % 12
    if (diff === 1 || diff === 11) return 'compatible'
  }
  return null
}

/** True when tempos are within `tolerance`, allowing half/double time. */
export function bpmCompatible(a: number, b: number, tolerance = 0.06): boolean {
  if (!a || !b) return false
  return [1, 2, 0.5].some((f) => Math.abs(a * f - b) / b <= tolerance)
}

// ---------- Store links ----------

export interface StoreLink {
  label: string
  url: string
}

export function storeLinks(artist: string, title: string): StoreLink[] {
  const q = encodeURIComponent(`${artist} ${title}`.trim())
  return [
    { label: 'Bandcamp', url: `https://bandcamp.com/search?q=${q}&item_type=t` },
    { label: 'Beatport', url: `https://www.beatport.com/search?q=${q}` },
    { label: 'Яндекс Музыка', url: `https://music.yandex.ru/search?text=${q}` }
  ]
}
