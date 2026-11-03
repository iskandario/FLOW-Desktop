import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDroppedFiles,
  addFolderFromDialog,
  addRecordingToLibrary,
  addTracksFromDialog,
  fileVkMatchesIntoCrate,
  addYoutubeTrack,
  createFolder,
  deleteFolder,
  loadTrackToDeck,
  loadVkTrackToDeck,
  moveTrackToFolder,
  openRecordingsFolder,
  queueSeparation,
  reanalyzeTrack,
  renameFolder,
  revealRecording,
  saveLibrary,
  scaleTrackBpm,
  setActiveFolder
} from '../controller'
import { RECORDINGS_VIEW, useStore, type TrackInfo } from '../state/store'
import type { VkListRequest, VkMusicPlaylist, VkMusicTrack, VkSessionStatus, VkTrack } from '../types'
import {
  bpmCompatible,
  camelotLabel,
  harmonicMatch,
  keyName,
  matchCollection,
  normalize,
  storeLinks,
  toCamelot
} from '../library/match'

const TRACK_DND = 'text/stemdeck-track'
const VK_VIEW = '__vk_music__'

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type VkFilter = 'all' | 'missing' | 'matched'

/**
 * Mirrors the user's VK collection (titles/artists published by the FLOW
 * extension in the VK window) and lines it up with audio files they own.
 * Missing tracks get store search links; matched ones can be filed as a crate.
 */
function VkPanel() {
  const library = useStore((s) => s.library)
  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState<VkTrack[]>([])
  const [updatedAt, setUpdatedAt] = useState(0)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<VkFilter>('all')
  const [auth, setAuth] = useState<VkSessionStatus | null>(null)

  const refresh = async (): Promise<void> => {
    const next = await window.stemdeck.listVkTracks()
    setRemote(next.tracks)
    setUpdatedAt(next.updatedAt)
  }

  useEffect(() => {
    void refresh()
    return window.stemdeck.onVkUpdated(() => void refresh())
  }, [])

  useEffect(() => {
    void window.stemdeck.vkSession().then(setAuth)
    return window.stemdeck.onVkSessionChanged(setAuth)
  }, [])

  const logout = async (): Promise<void> => {
    if (!window.confirm('Выйти из VK в FLOW? Сессия и синхронизированный список треков будут удалены.')) return
    await window.stemdeck.vkLogout()
    await refresh()
  }

  const matches = useMemo(() => matchCollection(remote, library), [remote, library])
  const matchedIds = useMemo(
    () => [...new Set([...matches.values()].filter((t): t is TrackInfo => t !== null).map((t) => t.id))],
    [matches]
  )
  const q = normalize(query)
  const visible = remote
    .filter((t) => {
      const local = matches.get(t.key)
      if (filter === 'missing' && local) return false
      if (filter === 'matched' && !local) return false
      return !q || normalize(`${t.artist} ${t.title}`).includes(q)
    })
    .slice(0, 300)

  return (
    <div className="vk-add">
      <button className="toggle" onClick={() => { setOpen(!open); if (!open) void refresh() }}>
        <span className={`vk-dot ${auth?.signedIn ? 'on' : ''}`} />
        VK {remote.length ? `${matchedIds.length}/${remote.length}` : ''}
      </button>
      {open && (
        <div className="vk-popover">
          <div className="vk-auth">
            {auth?.signedIn ? (
              <>
                <span className="vk-dot on" />
                <span className="vk-user">
                  {auth.profile?.name || 'Вход выполнен'}
                  {auth.profile && <span className="dim"> · id{auth.profile.id}</span>}
                </span>
                <button className="toggle" onClick={() => void logout()}>ВЫЙТИ</button>
              </>
            ) : (
              <>
                <span className="vk-dot" />
                <span className="vk-user dim">Не авторизован в VK</span>
                <button className="toggle on" onClick={() => void window.stemdeck.openVk()}>ВОЙТИ</button>
              </>
            )}
          </div>
          <div className="vk-toolbar">
            <button className="toggle" disabled={!auth?.signedIn} onClick={() => void window.stemdeck.openVk()}>OPEN VK</button>
            <button className="toggle" onClick={() => void refresh()}>REFRESH</button>
            <button
              className="toggle"
              disabled={!matchedIds.length}
              title="Put the VK tracks you already own into a “VK” crate"
              onClick={() => fileVkMatchesIntoCrate(matchedIds)}
            >
              → CRATE ({matchedIds.length})
            </button>
          </div>
          {!remote.length ? (
            <p className="dim vk-help">
              {auth?.signedIn ? <>Нажми <b>OPEN VK</b> и пролистай «Музыку»</> : <>Нажми <b>ВОЙТИ</b> и войди в аккаунт на странице VK — пароль вводится только на сайте VK, FLOW его не видит. После входа откроется «Музыка»</>} — расширение FLOW передаст сюда
              список твоих треков. FLOW найдёт их среди твоих файлов (добавь папку с музыкой через
              <b> + ADD FOLDER</b>), а для недостающих даст ссылки на магазины.
            </p>
          ) : (
            <>
              <div className="vk-filters">
                {(['all', 'missing', 'matched'] as VkFilter[]).map((f) => (
                  <button key={f} className={`seg ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? `Все ${remote.length}` : f === 'missing'
                      ? `Нет файла ${remote.length - [...matches.values()].filter(Boolean).length}`
                      : `Есть ${[...matches.values()].filter(Boolean).length}`}
                  </button>
                ))}
                {updatedAt > 0 && <span className="dim">sync {formatDate(updatedAt)}</span>}
              </div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по VK…" autoFocus />
              <div className="vk-results">
                {visible.map((track) => {
                  const local = matches.get(track.key) ?? null
                  return (
                    <div key={track.key} className={`vk-row ${local ? 'matched' : ''}`}>
                      <div className="vk-meta">
                        <strong>{track.title}</strong>
                        <span>{track.artist || 'Unknown artist'}</span>
                      </div>
                      {local ? (
                        <div className="vk-actions">
                          <span className="vk-owned" title={local.path}>✓ {local.bpm ? `${local.bpm.toFixed(0)} BPM` : 'в библиотеке'}</span>
                          <button className="mini-btn load-a" disabled={local.analyzing} onClick={() => void loadTrackToDeck(0, local.id)}>A</button>
                          <button className="mini-btn load-b" disabled={local.analyzing} onClick={() => void loadTrackToDeck(1, local.id)}>B</button>
                        </div>
                      ) : (
                        <div className="vk-actions">
                          {storeLinks(track.artist, track.title).map((link) => (
                            <a key={link.label} className="mini-btn" href={link.url} target="_blank" rel="noreferrer">
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(ms: number): string {
  const d = new Date(ms)
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(
    undefined,
    { hour: 'numeric', minute: '2-digit' }
  )}`
}

function YoutubeAdd() {
  const youtube = useStore((s) => s.youtube)
  const [url, setUrl] = useState('')

  const submit = (): void => {
    if (!url.trim() || youtube.downloading) return
    void addYoutubeTrack(url)
    setUrl('')
  }

  return (
    <div className="youtube-add" title={youtube.available ? 'Download audio from one of your YouTube uploads' : 'Install yt-dlp to enable (pipx install yt-dlp)'}>
      <input
        type="text"
        placeholder="Paste a YouTube link to one of your songs…"
        value={url}
        disabled={!youtube.available || youtube.downloading}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button
        className="toggle"
        disabled={!youtube.available || youtube.downloading || !url.trim()}
        onClick={submit}
      >
        {youtube.downloading ? '⬇ DOWNLOADING…' : '⬇ ADD FROM YOUTUBE'}
      </button>
      {youtube.downloading && <span className="yt-status">{youtube.status}</span>}
    </div>
  )
}

/** A single crate row that can be selected, renamed, deleted, and dropped onto. */
function CrateRow({
  id,
  name,
  count,
  active,
  onSelect
}: {
  id: string | null
  name: string
  count: number
  active: boolean
  onSelect: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [dragOver, setDragOver] = useState(false)
  const isRealCrate = id !== null && id !== RECORDINGS_VIEW && id !== VK_VIEW
  const acceptsDrop = id !== RECORDINGS_VIEW && id !== VK_VIEW

  const commit = (): void => {
    setEditing(false)
    if (id !== null) renameFolder(id, draft)
  }

  return (
    <div
      className={`crate-row ${active ? 'active' : ''} ${dragOver ? 'drag-over' : ''}`}
      onClick={onSelect}
      onDragOver={(e) => {
        if (acceptsDrop && e.dataTransfer.types.includes(TRACK_DND)) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          setDragOver(true)
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false)
        if (!acceptsDrop) return
        const trackId = e.dataTransfer.getData(TRACK_DND)
        if (trackId) {
          e.preventDefault()
          moveTrackToFolder(trackId, id)
        }
      }}
    >
      {editing ? (
        <input
          className="crate-rename"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(name)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="crate-name"
          onDoubleClick={() => {
            if (isRealCrate) {
              setDraft(name)
              setEditing(true)
            }
          }}
          title={isRealCrate ? 'Double-click to rename' : undefined}
        >
          {name}
        </span>
      )}
      <span className="crate-count">{count}</span>
      {isRealCrate && !editing && (
        <button
          className="crate-delete"
          title="Delete crate (tracks stay in your library)"
          onClick={(e) => {
            e.stopPropagation()
            deleteFolder(id)
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function CrateSidebar({ vkCount }: { vkCount: number }) {
  const library = useStore((s) => s.library)
  const folders = useStore((s) => s.folders)
  const activeFolderId = useStore((s) => s.activeFolderId)
  const recordings = useStore((s) => s.recordings)

  return (
    <aside className="crate-sidebar">
      <div className="crate-list">
        <CrateRow
          id={null}
          name="Cached / Local"
          count={library.length}
          active={activeFolderId === null}
          onSelect={() => setActiveFolder(null)}
        />
        <CrateRow
          id={VK_VIEW}
          name="VK Music"
          count={vkCount}
          active={activeFolderId === VK_VIEW}
          onSelect={() => setActiveFolder(VK_VIEW)}
        />
        {folders.map((f) => (
          <CrateRow
            key={f.id}
            id={f.id}
            name={f.name}
            count={library.filter((t) => t.folderId === f.id).length}
            active={activeFolderId === f.id}
            onSelect={() => setActiveFolder(f.id)}
          />
        ))}
        <CrateRow
          id={RECORDINGS_VIEW}
          name="🎙 Recordings"
          count={recordings.length}
          active={activeFolderId === RECORDINGS_VIEW}
          onSelect={() => setActiveFolder(RECORDINGS_VIEW)}
        />
      </div>
      <button className="crate-new" onClick={() => createFolder()}>
        + NEW CRATE
      </button>
    </aside>
  )
}

type VkMode = 'my' | 'playlists' | 'playlist' | 'search'
type VkLoadState = 'loading' | 'done' | 'error'

function vkErrorText(error: unknown): string {
  return String((error as Error)?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
}

/**
 * The user's VK music inside FLOW, read through VK's API in the signed-in VK
 * window: their tracks, their playlists and VK-wide search. Each track
 * carries its VK ID, so LOAD fetches it with a single request.
 */
function VkCollectionPane({ onTotal }: { onTotal: (count: number) => void }) {
  const library = useStore((s) => s.library)
  const [auth, setAuth] = useState<VkSessionStatus | null>(null)
  const [mode, setMode] = useState<VkMode>('my')
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<VkMusicTrack[]>([])
  const [total, setTotal] = useState(0)
  const [playlists, setPlaylists] = useState<VkMusicPlaylist[]>([])
  const [playlist, setPlaylist] = useState<VkMusicPlaylist | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loads, setLoads] = useState<Record<string, { state: VkLoadState; error?: string }>>({})
  const request = useRef(0)

  useEffect(() => {
    void window.stemdeck.vkSession().then(setAuth)
    return window.stemdeck.onVkSessionChanged(setAuth)
  }, [])

  const searching = query.trim().length >= 2
  const listRequest = (offset: number): VkListRequest | null =>
    searching
      ? { kind: 'search', query: query.trim(), offset, count: 100 }
      : mode === 'my'
        ? { kind: 'my', offset, count: 200 }
        : mode === 'playlist' && playlist
          ? { kind: 'playlist', ownerId: playlist.ownerId, id: playlist.id, accessKey: playlist.accessKey, offset, count: 200 }
          : null

  const fetchPage = async (offset: number): Promise<void> => {
    const next = listRequest(offset)
    if (!next || !auth?.signedIn) return
    const ticket = ++request.current
    setBusy(true)
    setError('')
    try {
      const page = await window.stemdeck.vkMusicList(next)
      if (ticket !== request.current) return
      setTracks((prev) => {
        if (offset === 0) return page.items
        const seen = new Set(prev.map((t) => t.key))
        return [...prev, ...page.items.filter((t) => !seen.has(t.key))]
      })
      setTotal(page.count)
      if (next.kind === 'my') onTotal(page.count)
    } catch (e) {
      if (ticket === request.current) setError(vkErrorText(e))
    } finally {
      if (ticket === request.current) setBusy(false)
    }
  }

  // Reload the list whenever what it shows changes; searches wait for a typing pause.
  useEffect(() => {
    if (!auth?.signedIn) return
    if (!searching && mode === 'playlists') {
      const ticket = ++request.current
      setBusy(true)
      setError('')
      window.stemdeck
        .vkMusicPlaylists()
        .then((list) => ticket === request.current && setPlaylists(list))
        .catch((e) => ticket === request.current && setError(vkErrorText(e)))
        .finally(() => ticket === request.current && setBusy(false))
      return
    }
    setTracks([])
    setTotal(0)
    const timer = setTimeout(() => void fetchPage(0), searching ? 450 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.signedIn, mode, playlist?.id, playlist?.ownerId, searching ? query.trim() : ''])

  const loadToDeck = async (deckIndex: number, track: VkMusicTrack): Promise<void> => {
    setLoads((prev) => ({ ...prev, [track.key]: { state: 'loading' } }))
    const ok = await loadVkTrackToDeck(deckIndex, track)
    setLoads((prev) => ({ ...prev, [track.key]: ok ? { state: 'done' } : { state: 'error', error: useStore.getState().toast || 'VK load failed' } }))
  }

  const matches = useMemo(() => matchCollection(tracks, library), [tracks, library])
  const showingPlaylists = !searching && mode === 'playlists'
  const more = !showingPlaylists && tracks.length < total

  const onScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const el = e.currentTarget
    if (more && !busy && el.scrollTop + el.clientHeight > el.scrollHeight - 600) void fetchPage(tracks.length)
  }

  const title = searching
    ? `Поиск «${query.trim()}» · ${total}`
    : mode === 'my'
      ? `Мои треки · ${total || '…'}`
      : mode === 'playlist' && playlist
        ? `${playlist.title} · ${playlist.count}`
        : `Плейлисты · ${playlists.length}`

  return (
    <>
      <header className="library-header vk-library-header">
        <div className="vk-tabs">
          <button className={`seg ${mode === 'my' && !searching ? 'on' : ''}`} onClick={() => { setQuery(''); setMode('my') }}>Мои треки</button>
          <button className={`seg ${(mode === 'playlists' || mode === 'playlist') && !searching ? 'on' : ''}`} onClick={() => { setQuery(''); setPlaylist(null); setMode('playlists') }}>Плейлисты</button>
        </div>
        <input
          className="library-search vk-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
          placeholder="Поиск по всему VK…"
        />
        <strong className="track-pane-title">{title}</strong>
        {busy && <span className="dim">загрузка…</span>}
        <span className="spacer" />
        <button className="toggle" onClick={() => void window.stemdeck.openVk()}>OPEN VK</button>
      </header>
      {!auth ? null : !auth.signedIn ? (
        <div className="library-empty">
          Войди в VK — пароль вводится только на странице VK, FLOW его не видит.{' '}
          <button className="toggle on" onClick={() => void window.stemdeck.openVk()}>ВОЙТИ</button>
        </div>
      ) : error ? (
        <div className="library-empty vk-error">
          {error}{' '}
          <button className="toggle" onClick={() => (showingPlaylists ? setMode('playlists') : void fetchPage(0))}>ПОВТОРИТЬ</button>
        </div>
      ) : showingPlaylists ? (
        <div className="vk-playlists">
          {playlists.map((p) => (
            <button key={`${p.ownerId}_${p.id}`} className="vk-playlist" onClick={() => { setPlaylist(p); setMode('playlist') }}>
              {p.cover ? <img src={p.cover} alt="" /> : <span className="vk-playlist-blank">♫</span>}
              <strong>{p.title}</strong>
              <span className="dim">{p.count} треков</span>
            </button>
          ))}
          {!busy && !playlists.length && <div className="library-empty">Плейлистов нет</div>}
        </div>
      ) : (
        <div className="vk-table-wrap" onScroll={onScroll}>
          {mode === 'playlist' && !searching && (
            <button className="toggle vk-back" onClick={() => { setPlaylist(null); setMode('playlists') }}>← ПЛЕЙЛИСТЫ</button>
          )}
          <table className="library-table vk-library-table">
            <thead>
              <tr><th>Track</th><th>Artist</th><th>Time</th><th>Source</th><th></th></tr>
            </thead>
            <tbody>
              {tracks.map((track) => {
                const local = matches.get(track.key) ?? null
                const load = loads[track.key]
                return (
                  <tr
                    key={track.key}
                    className={`${local ? 'vk-local-match' : ''} ${load?.state === 'error' ? 'vk-load-error' : ''}`}
                    title={load?.error}
                    onDoubleClick={() => void (local ? loadTrackToDeck(0, local.id) : loadToDeck(0, track))}
                  >
                    <td className="track-name">{track.title}</td>
                    <td>{track.artist || 'Unknown artist'}</td>
                    <td className="dim">{formatDuration(track.duration)}</td>
                    <td>
                      {local ? (
                        <span className="stems-badge">✓ local</span>
                      ) : load?.state === 'loading' ? (
                        <span className="vk-source-badge loading">⏳ VK</span>
                      ) : load?.state === 'error' ? (
                        <span className="vk-source-badge failed">✕ ошибка</span>
                      ) : track.restricted ? (
                        <span className="vk-source-badge restricted" title="VK не даёт эту заливку в твоём регионе — FLOW поищет другую такую же">VK ⚠</span>
                      ) : (
                        <span className="vk-source-badge">VK</span>
                      )}
                    </td>
                    <td className="load-buttons">
                      {local ? (
                        <>
                          <button className="mini-btn load-a" disabled={local.analyzing} onClick={() => void loadTrackToDeck(0, local.id)}>A</button>
                          <button className="mini-btn load-b" disabled={local.analyzing} onClick={() => void loadTrackToDeck(1, local.id)}>B</button>
                        </>
                      ) : (
                        <>
                          <button className="mini-btn load-a" disabled={load?.state === 'loading'} onClick={() => void loadToDeck(0, track)}>LOAD A</button>
                          <button className="mini-btn load-b" disabled={load?.state === 'loading'} onClick={() => void loadToDeck(1, track)}>LOAD B</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!busy && !tracks.length && <div className="library-empty">{searching ? 'Ничего не нашлось' : 'Пусто'}</div>}
          {more && (
            <button className="toggle vk-more" disabled={busy} onClick={() => void fetchPage(tracks.length)}>
              {busy ? 'загрузка…' : `ЕЩЁ (${tracks.length} из ${total})`}
            </button>
          )}
        </div>
      )}
    </>
  )
}

function RecordingsPane() {
  const recordings = useStore((s) => s.recordings)

  return (
    <>
      <header className="library-header">
        <span className="track-pane-title">Your recorded mixes</span>
        <button className="toggle" onClick={() => void openRecordingsFolder()}>
          📂 OPEN FOLDER
        </button>
        <span className="dim">Saved to ~/Music/StemDeck Recordings</span>
      </header>
      {recordings.length === 0 ? (
        <div className="library-empty">
          No recordings yet — hit <b>● REC MIX</b> up top to capture a set.
        </div>
      ) : (
        <table className="library-table">
          <thead>
            <tr>
              <th>Recording</th>
              <th>Size</th>
              <th>Recorded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recordings.map((rec) => (
              <tr key={rec.path}>
                <td className="track-name">{rec.name}</td>
                <td>{formatSize(rec.size)}</td>
                <td>{formatDate(rec.mtime)}</td>
                <td className="load-buttons">
                  <button
                    className="mini-btn"
                    title="Show this file in Finder"
                    onClick={() => void revealRecording(rec.path)}
                  >
                    Reveal
                  </button>
                  <button
                    className="mini-btn"
                    title="Add this recording to your library so you can mix it"
                    onClick={() => void addRecordingToLibrary(rec.path)}
                  >
                    + Library
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

type SortKey = 'added' | 'name' | 'bpm' | 'key' | 'length'

function TrackTable() {
  const library = useStore((s) => s.library)
  const activeFolderId = useStore((s) => s.activeFolderId)
  const folders = useStore((s) => s.folders)
  const stemEngine = useStore((s) => s.stemEngine)
  const decks = useStore((s) => s.decks)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'added', dir: 1 })
  const [onlyCompatible, setOnlyCompatible] = useState(false)

  // Harmonic hints are relative to the playing deck (or the one loaded last).
  const refDeck = decks.find((d) => d.playing && d.trackId) ?? decks.find((d) => d.trackId) ?? null
  const refTrack = refDeck ? library.find((t) => t.id === refDeck.trackId) ?? null : null
  const refCamelot = refTrack ? toCamelot(refTrack.musicalKey, refTrack.musicalScale) : null
  const refBpm = refDeck && refDeck.baseBpm ? refDeck.baseBpm * refDeck.tempo : 0

  const q = normalize(query)
  const inCrate = library.filter((t) => activeFolderId === null || t.folderId === activeFolderId)
  const order = new Map(library.map((t, i) => [t.id, i]))
  const tracks = inCrate
    .filter((t) => !q || normalize(t.name).includes(q))
    .filter((t) => {
      if (!onlyCompatible || !refTrack) return true
      if (t.id === refTrack.id) return false
      const harmonic = harmonicMatch(refCamelot, toCamelot(t.musicalKey, t.musicalScale))
      return harmonic !== null && bpmCompatible(t.bpm, refBpm)
    })
    .sort((a, b) => {
      const camA = toCamelot(a.musicalKey, a.musicalScale)
      const camB = toCamelot(b.musicalKey, b.musicalScale)
      let d = 0
      switch (sort.key) {
        case 'name': d = a.name.localeCompare(b.name); break
        case 'bpm': d = (a.bpm || 9999) - (b.bpm || 9999); break
        case 'length': d = a.duration - b.duration; break
        case 'key':
          d = (camA ? camA.number * 2 + (camA.letter === 'B' ? 1 : 0) : 99) -
              (camB ? camB.number * 2 + (camB.letter === 'B' ? 1 : 0) : 99)
          break
        default: d = (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      }
      return d * sort.dir
    })
  const activeCrate = folders.find((f) => f.id === activeFolderId)
  const header = (key: SortKey, label: string) => (
    <th
      className={`sortable ${sort.key === key ? 'sorted' : ''}`}
      onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}
    >
      {label}{sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  )

  if (library.length === 0) {
    return <div className="library-empty">Your crate is empty — add some MP3s to get mixing 🎶</div>
  }
  if (inCrate.length === 0) {
    return (
      <div className="library-empty">
        “{activeCrate?.name}” is empty — drag tracks from All Tracks onto it in the sidebar.
      </div>
    )
  }

  return (
    <>
    <div className="library-tools">
      <input
        className="library-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${inCrate.length} tracks…`}
      />
      <label className="compat-toggle" title={refTrack ? `Keys next to ${camelotLabel(refCamelot)} on the Camelot wheel, BPM within ±6%` : 'Load a track on a deck first'}>
        <input
          type="checkbox"
          checked={onlyCompatible}
          disabled={!refTrack}
          onChange={(e) => setOnlyCompatible(e.target.checked)}
        />{' '}
        only mixable with {refTrack ? `${camelotLabel(refCamelot)} · ${refBpm ? refBpm.toFixed(1) : '—'} BPM` : 'deck'}
      </label>
      <span className="dim">{tracks.length} shown</span>
    </div>
    <table className="library-table">
      <thead>
        <tr>
          {header('name', 'Track')}
          {header('bpm', 'BPM')}
          {header('key', 'Key')}
          {header('length', 'Length')}
          <th>Stems</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track) => {
          const cam = toCamelot(track.musicalKey, track.musicalScale)
          const harmonic = refTrack && refTrack.id !== track.id ? harmonicMatch(refCamelot, cam) : null
          const tempoOk = refTrack && refTrack.id !== track.id ? bpmCompatible(track.bpm, refBpm) : false
          const hint = harmonic && tempoOk ? 'mix-perfect' : harmonic ? 'mix-key' : ''
          return (
          <tr
            key={track.id}
            className={hint}
            draggable={!track.analyzing}
            onDragStart={(e) => {
              e.dataTransfer.setData(TRACK_DND, track.id)
              e.dataTransfer.effectAllowed = 'copyMove'
            }}
            title="Drag onto a deck to load, or onto a crate to file it"
          >
            <td className="track-name">{track.name}</td>
            <td
              title={
                track.bpmConfidence > 0
                  ? `Beat tracker confidence ${track.bpmConfidence.toFixed(2)} / 5.32`
                  : 'Detected with fallback estimator'
              }
            >
              {track.analyzing ? '…' : track.bpm ? track.bpm.toFixed(1) : '—'}{' '}
              {!track.analyzing && (
                <>
                  <button
                    className="mini-btn"
                    title="Halve BPM"
                    disabled={!track.bpm}
                    onClick={() => scaleTrackBpm(track.id, 0.5)}
                  >
                    ×½
                  </button>
                  <button
                    className="mini-btn"
                    title="Double BPM"
                    disabled={!track.bpm}
                    onClick={() => scaleTrackBpm(track.id, 2)}
                  >
                    ×2
                  </button>
                  <button
                    className="mini-btn"
                    title="Re-detect BPM"
                    onClick={() => void reanalyzeTrack(track.id)}
                  >
                    ↻
                  </button>
                </>
              )}
            </td>
            <td
              className={`key-cell ${harmonic ? `key-${harmonic}` : ''}`}
              title={cam ? `${keyName(track.musicalKey, track.musicalScale)}${track.keyStrength ? ` · strength ${track.keyStrength.toFixed(2)}` : ''}` : 'Key not detected'}
            >
              {track.analyzing ? '…' : camelotLabel(cam)}
            </td>
            <td>{formatDuration(track.duration)}</td>
            <td>
              {track.stems ? (
                <span className="stems-badge">✓ ready</span>
              ) : track.separating ? (
                <span className="stems-badge working" title={track.stemStatus}>
                  splitting {track.stemStatus.match(/(\d{1,3})(?:\.\d+)?%/)?.[1] ?? '…'}
                  {track.stemStatus.match(/(\d{1,3})(?:\.\d+)?%/) ? '%' : ''}
                </span>
              ) : (
                <button
                  className="mini-btn"
                  disabled={!stemEngine.available || track.analyzing}
                  onClick={() => queueSeparation(track.id)}
                >
                  split
                </button>
              )}
            </td>
            <td className="load-buttons">
              <button
                className="mini-btn load-a"
                disabled={track.analyzing}
                title="Load to deck A (with stems when available)"
                onClick={() => void loadTrackToDeck(0, track.id)}
              >
                A
              </button>
              <button
                className="mini-btn load-b"
                disabled={track.analyzing}
                title="Load to deck B (with stems when available)"
                onClick={() => void loadTrackToDeck(1, track.id)}
              >
                B
              </button>
            </td>
          </tr>
          )
        })}
      </tbody>
    </table>
    </>
  )
}

export function Library() {
  const stemEngine = useStore((s) => s.stemEngine)
  const stemModels = useStore((s) => s.stemModels)
  const selectedModel = useStore((s) => s.selectedModel)
  const autoStems = useStore((s) => s.autoStems)
  const activeFolderId = useStore((s) => s.activeFolderId)
  const viewingRecordings = activeFolderId === RECORDINGS_VIEW
  const viewingVk = activeFolderId === VK_VIEW
  const [vkTotal, setVkTotal] = useState(0)
  const choseInitialView = useRef(false)

  // Open on VK Music when signed in to VK.
  useEffect(() => {
    void window.stemdeck.vkSession().then((status) => {
      if (!choseInitialView.current && status.signedIn && useStore.getState().activeFolderId === null) {
        choseInitialView.current = true
        setActiveFolder(VK_VIEW)
      }
    })
  }, [])

  return (
    <section className="library">
      <CrateSidebar vkCount={vkTotal} />
      <div
        className="track-pane"
        onDragOver={(e) => {
          if (!viewingRecordings && !viewingVk && e.dataTransfer.types.includes('Files')) e.preventDefault()
        }}
        onDrop={(e) => {
          if (viewingRecordings || viewingVk) return
          e.preventDefault()
          void addDroppedFiles(e.dataTransfer.files)
        }}
      >
        {viewingRecordings ? (
          <RecordingsPane />
        ) : viewingVk ? (
          <VkCollectionPane onTotal={setVkTotal} />
        ) : (
          <>
            <header className="library-header">
              <button className="toggle" onClick={() => void addTracksFromDialog()}>
                + ADD TRACKS
              </button>
              <button className="toggle" onClick={() => void addFolderFromDialog()} title="Import every audio file in a folder (recursively)">
                + ADD FOLDER
              </button>
              <VkPanel />
              <span className="dim">or drag &amp; drop audio files here</span>
              <YoutubeAdd />
              <span className="spacer" />
              <label className="model-select">
                Stem model{' '}
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    useStore.setState({ selectedModel: e.target.value })
                    void saveLibrary()
                  }}
                >
                  {Object.entries(stemModels).map(([file, info]) => (
                    <option key={file} value={file}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="auto-stems"
                title="Automatically split stems for every newly added track (queued one at a time)"
              >
                <input
                  type="checkbox"
                  checked={autoStems}
                  disabled={!stemEngine.available}
                  onChange={(e) => {
                    useStore.setState({ autoStems: e.target.checked })
                    void saveLibrary()
                  }}
                />{' '}
                auto-stems
              </label>
              <span
                className={`engine-status ${stemEngine.available ? 'ok' : 'missing'}`}
                title={stemEngine.available ? `Using ${stemEngine.bin}` : 'pipx install "audio-separator[cpu]"'}
              >
                {!stemEngine.checked ? '…' : stemEngine.available ? '● stem engine ready' : '○ stem engine not installed'}
              </span>
            </header>
            <TrackTable />
          </>
        )}
      </div>
    </section>
  )
}
