import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http'
import { randomBytes } from 'crypto'

/**
 * Metadata-only bridge between the FLOW browser extension (running in the
 * signed-in VK window) and the desktop app.
 *
 * The extension publishes the titles/artists of the user's VK collection so
 * FLOW can mirror it as a crate and match it against audio files the user
 * already owns. Audio itself never travels over this bridge: FLOW does not
 * extract or download streams from VK.
 */
/** What VK needs to hand out one track's stream again (no URLs: those expire). */
export interface VkIdentity { id: number; ownerId: number; actionHash: string; urlHash: string; accessKey: string }
export interface VkTrack { key: string; title: string; artist: string; identity?: VkIdentity }

const PORT = 17835
const MAX_TRACKS = 10000

function json(res: ServerResponse, status: number, value: unknown): void {
  const body = Buffer.from(JSON.stringify(value))
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': body.length,
    'access-control-allow-origin': '*',
    // Chromium treats an extension -> loopback request as Private Network
    // Access. Without this header its preflight succeeds at TCP level but the
    // service worker only sees `TypeError: Failed to fetch`.
    'access-control-allow-private-network': 'true'
  })
  res.end(body)
}

async function readBody(req: IncomingMessage, limit = 4 * 1024 * 1024): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const value = Buffer.from(chunk)
    size += value.length
    if (size > limit) throw new Error('Request body is too large')
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

function cleanTrack(raw: unknown): VkTrack | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Record<string, unknown>
  const key = typeof t.key === 'string' ? t.key.slice(0, 200) : ''
  const title = typeof t.title === 'string' ? t.title.trim().slice(0, 300) : ''
  const artist = typeof t.artist === 'string' ? t.artist.trim().slice(0, 300) : ''
  if (!key || !title) return null
  const track: VkTrack = { key, title, artist }
  const id = t.identity as Record<string, unknown> | undefined
  if (id && Number(id.id) && Number(id.ownerId)) {
    const text = (value: unknown): string => (typeof value === 'string' ? value.slice(0, 100) : '')
    track.identity = { id: Number(id.id), ownerId: Number(id.ownerId), actionHash: text(id.actionHash), urlHash: text(id.urlHash), accessKey: text(id.accessKey) }
  }
  return track
}

export class VkBridge {
  readonly port = PORT
  readonly token = randomBytes(32).toString('hex')
  private library: VkTrack[] = []
  private updatedAt = 0
  private server: Server | null = null
  private listeners = new Set<(tracks: VkTrack[]) => void>()

  async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.server = createServer((req, res) => void this.route(req, res))
      this.server.once('error', reject)
      this.server.listen(PORT, '127.0.0.1', () => resolve())
    })
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => (this.server ? this.server.close(() => resolve()) : resolve()))
    this.server = null
  }

  list(): { tracks: VkTrack[]; updatedAt: number } {
    return { tracks: this.library.slice(), updatedAt: this.updatedAt }
  }

  /** The VK identity learned for a track, if its row has been on screen. */
  identity(key: string): VkIdentity | null {
    return this.library.find((track) => track.key === key)?.identity ?? null
  }

  /** Forget the mirrored collection, e.g. after the user signs out of VK. */
  clear(): void {
    this.library = []
    this.updatedAt = 0
    for (const listener of this.listeners) listener([])
  }

  onUpdate(listener: (tracks: VkTrack[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Replace the mirrored collection from a trusted in-process source.
   * Electron uses this for the extension's chrome.storage mirror because
   * Chromium blocks extension service-worker fetches to loopback on some
   * builds even when host permissions and PNA headers are present. */
  replace(rawTracks: unknown[]): number {
    const seen = new Set<string>()
    const tracks: VkTrack[] = []
    for (const raw of rawTracks) {
      const track = cleanTrack(raw)
      if (!track || seen.has(track.key)) continue
      seen.add(track.key)
      tracks.push(track)
      if (tracks.length >= MAX_TRACKS) break
    }
    const unchanged =
      tracks.length === this.library.length &&
      tracks.every((track, index) => track.key === this.library[index]?.key && !!track.identity === !!this.library[index]?.identity)
    if (unchanged) return tracks.length
    this.library = tracks
    this.updatedAt = Date.now()
    for (const listener of this.listeners) listener(tracks)
    return tracks.length
  }

  private authorized(req: IncomingMessage): boolean {
    return req.headers.authorization === `Bearer ${this.token}`
  }

  private async route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization,content-type',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
          'access-control-allow-private-network': 'true'
        })
        res.end()
        return
      }
      if (url.pathname === '/health') return json(res, 200, { ok: true, product: 'FLOW Desktop Bridge' })
      if (!this.authorized(req)) return json(res, 401, { ok: false, error: 'Unauthorized bridge client' })

      if (req.method === 'POST' && url.pathname === '/v1/library') {
        const data = JSON.parse((await readBody(req)).toString('utf8'))
        const incoming = Array.isArray(data?.tracks) ? data.tracks : []
        return json(res, 200, { ok: true, count: this.replace(incoming) })
      }

      // Older extension builds poll for work; the desktop never queues any.
      if (req.method === 'GET' && url.pathname === '/v1/commands') {
        return json(res, 200, { ok: true, commands: [] })
      }

      json(res, 404, { ok: false, error: 'Not found' })
    } catch (error) {
      json(res, 500, { ok: false, error: (error as Error).message })
    }
  }
}
