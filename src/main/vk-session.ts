import { app, BrowserWindow, session, type Cookie, type Session } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Tracks whether the user is signed in to VK inside FLOW's VK window.
 *
 * Sign-in itself happens on VK's own pages in a persistent partition, so FLOW
 * never sees a password. FLOW only watches VK's session cookie to know the
 * state, remembers who is signed in, and can sign out by wiping the partition's
 * VK cookies and site storage.
 */
export const VK_PARTITION = 'persist:flow-vk'

export interface VkProfile { id: number; name: string }
export interface VkSessionStatus { signedIn: boolean; profile: VkProfile | null; checkedAt: number }

const AUTH_COOKIES = new Set(['remixsid', 'remixnsid'])
const VK_DOMAIN = /(^|\.)vk\.(com|ru)$/i
const VK_ORIGINS = ['https://vk.com', 'https://m.vk.com', 'https://id.vk.com', 'https://vk.ru', 'https://id.vk.ru']
const AUDIO_URL = 'https://vk.com/audio'
const NAVIGATE_GAP_MS = 4000

function isAuthCookie(cookie: Cookie): boolean {
  const domain = (cookie.domain || '').replace(/^\./, '')
  return VK_DOMAIN.test(domain) && AUTH_COOKIES.has(cookie.name) && !!cookie.value && cookie.value !== 'DELETED'
}

function isVkCookie(cookie: Cookie): boolean {
  return VK_DOMAIN.test((cookie.domain || '').replace(/^\./, ''))
}

function isLoginPage(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    return /^id\.vk\.(com|ru)$/i.test(hostname) || /^\/(login|join)?$/.test(pathname)
  } catch {
    return false
  }
}

// Runs in the VK page's main world; VK exposes the signed-in user on `window.vk`.
const READ_PROFILE = `(() => {
  const id = Number(window.vk && window.vk.id) || 0
  const node = document.querySelector('.top_profile_name, [class*="TopNavBtn__profileName"], [data-testid="topnav-profile-name"]')
  return { id, name: node ? node.textContent.trim() : '' }
})()`

export class VkSession {
  private ses: Session = session.fromPartition(VK_PARTITION)
  private window: BrowserWindow | null = null
  private state: VkSessionStatus = { signedIn: false, profile: null, checkedAt: 0 }
  private listeners = new Set<(status: VkSessionStatus) => void>()
  private refreshTimer: NodeJS.Timeout | null = null
  private lastNavigateAt = 0

  private get profileFile(): string {
    return path.join(app.getPath('userData'), 'vk-session.json')
  }

  async start(): Promise<void> {
    try {
      const saved = JSON.parse(await fs.readFile(this.profileFile, 'utf8'))
      if (Number(saved?.id) > 0) this.state.profile = { id: Number(saved.id), name: String(saved.name || '') }
    } catch {
      // No remembered profile yet.
    }
    this.ses.cookies.on('changed', (_event, cookie) => {
      if (AUTH_COOKIES.has(cookie.name) && isVkCookie(cookie)) this.scheduleRefresh()
    })
    await this.refresh()
  }

  status(): VkSessionStatus {
    return { ...this.state, profile: this.state.profile && { ...this.state.profile } }
  }

  onChange(listener: (status: VkSessionStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Shows the VK window: VK's own sign-in when signed out, the music page otherwise. */
  open(): void {
    if (this.window && !this.window.isDestroyed()) {
      if (!this.state.signedIn && !isLoginPage(this.window.webContents.getURL())) void this.window.loadURL(AUDIO_URL)
      this.window.show()
      this.window.focus()
      return
    }
    this.createWindow(true)
  }

  /** Keep a signed-in VK music document alive for the audio bridge without
   * forcing the user to work in VK's own player window. */
  ensureBridge(): void {
    if (this.window && !this.window.isDestroyed()) return
    this.createWindow(false)
  }

  /** The user's full track list; VK's /audio home only previews a few rows. */
  libraryUrl(): string {
    const id = this.state.profile?.id
    return id ? `https://vk.com/audios${id}?section=all` : AUDIO_URL
  }

  /** VK music search for a query, in the bridge window. */
  searchUrl(query: string): string {
    return `https://vk.com/audio?q=${encodeURIComponent(query)}`
  }

  currentUrl(): string {
    return this.window && !this.window.isDestroyed() ? this.window.webContents.getURL() : ''
  }

  /**
   * VK answers too many page loads with an anti-bot check (challenge.html,
   * HTTP 429). FLOW can't and mustn't pass it: show the window so the user
   * can, and fail fast instead of queueing loads behind it.
   */
  assertNoChallenge(): void {
    if (!/\/challenge/.test(this.currentUrl())) return
    this.window?.show()
    this.window?.focus()
    throw new Error('VK просит подтвердить, что ты не робот — пройди проверку в окне VK и повтори')
  }

  /** Load a page in the bridge window and wait until it (and VK's own rendering) has settled. */
  async navigate(url: string, settleMs = 1500): Promise<void> {
    this.ensureBridge()
    this.assertNoChallenge()
    // Space page loads out so a run of track loads doesn't look like a bot.
    const wait = this.lastNavigateAt + NAVIGATE_GAP_MS - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    this.lastNavigateAt = Date.now()
    const win = this.window!
    await new Promise<void>((resolve) => {
      const done = (): void => {
        clearTimeout(timer)
        win.webContents.off('did-finish-load', done)
        win.webContents.off('did-fail-load', done)
        resolve()
      }
      const timer = setTimeout(done, 15000)
      win.webContents.once('did-finish-load', done)
      win.webContents.once('did-fail-load', done)
      void win.loadURL(url).catch(() => done())
    })
    await new Promise((resolve) => setTimeout(resolve, settleMs))
    this.assertNoChallenge()
  }

  private createWindow(show: boolean): void {
    const win = new BrowserWindow({
      show,
      width: 1280,
      height: 900,
      title: 'FLOW · VK Music Bridge',
      webPreferences: { partition: VK_PARTITION, contextIsolation: true, sandbox: true }
    })
    this.window = win
    win.on('closed', () => { if (this.window === win) this.window = null })
    const readProfile = (): void => void this.readProfile()
    win.webContents.on('did-finish-load', readProfile)
    win.webContents.on('did-navigate-in-page', readProfile)
    // VK redirects to its sign-in when there is no session.
    void win.loadURL(this.libraryUrl())
  }

  async logout(): Promise<void> {
    const cookies = await this.ses.cookies.get({})
    await Promise.all(
      cookies.filter(isVkCookie).map((cookie) => {
        const host = (cookie.domain || '').replace(/^\./, '')
        return this.ses.cookies.remove(`https://${host}${cookie.path || '/'}`, cookie.name).catch(() => {})
      })
    )
    await Promise.all(
      VK_ORIGINS.map((origin) =>
        this.ses
          .clearStorageData({ origin, storages: ['localstorage', 'indexdb', 'cachestorage', 'serviceworkers', 'websql'] })
          .catch(() => {})
      )
    )
    await this.ses.cookies.flushStore().catch(() => {})
    await fs.rm(this.profileFile, { force: true })
    this.state.profile = null
    if (this.window && !this.window.isDestroyed()) this.window.close()
    await this.refresh()
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer)
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null
      void this.refresh()
    }, 300)
  }

  private async refresh(): Promise<void> {
    const cookies = await this.ses.cookies.get({}).catch(() => [] as Cookie[])
    const signedIn = cookies.some(isAuthCookie)
    const wasSignedIn = this.state.signedIn
    this.state.signedIn = signedIn
    this.state.checkedAt = Date.now()
    if (!signedIn) this.state.profile = null
    if (signedIn !== wasSignedIn) {
      // Just signed in from VK's login page: take the user straight to their music.
      if (signedIn && this.window && !this.window.isDestroyed() && isLoginPage(this.window.webContents.getURL())) {
        void this.window.loadURL(this.libraryUrl())
      }
      this.emit()
    }
  }

  private async readProfile(): Promise<void> {
    const win = this.window
    if (!this.state.signedIn || !win || win.isDestroyed()) return
    try {
      const read = (await win.webContents.executeJavaScript(READ_PROFILE, true)) as { id: number; name: string }
      if (!(read?.id > 0)) return
      const name = read.name || (this.state.profile?.id === read.id ? this.state.profile.name : '')
      if (this.state.profile?.id === read.id && this.state.profile.name === name) return
      this.state.profile = { id: read.id, name }
      await fs.writeFile(this.profileFile, JSON.stringify(this.state.profile), 'utf8')
      this.emit()
    } catch {
      // The page navigated away mid-read; the next load retries.
    }
  }

  private emit(): void {
    const snapshot = this.status()
    for (const listener of this.listeners) listener(snapshot)
  }
}
