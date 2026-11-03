# FLOW VK v7.1.2 — Instant Live + Cached AI Stems DJ

FLOW 7.1 is a local two-deck performance and Auto DJ prototype for an authenticated VK Music library.

## Audio architecture

- VK bridge resolves a temporary stream using the already authenticated page session.
- Signed MP3 is fetched with explicit extension host permission and appended incrementally through Media Source Extensions, avoiding the direct `chrome-extension://` → `okcdn.ru` media CORS failure.
- Each deck has independent transport, SoundTouchJS AudioWorklet key-lock, BPM sync, gain, three-band kill EQ, filter and equal-power crossfader routing.
- Auto DJ performs bar-aligned phrase transitions, tempo matching, equal-power gain curves and bass swaps.

## Real beat grids and sync

- `@audio/beat` performs offline BPM, onset and beat-grid analysis on decoded audio.
- BPM and first-beat offset are computed in the background for the playing and prepared tracks, then reused by SYNC and bar-aligned Auto DJ.
- Playback starts before background analysis finishes. The VK page is never auto-scrolled during normal FLOW startup.

## Real neural stems

- `HTDemucs 4-stem` separates `Vocals`, `Drums`, `Bass` and `Other`.
- `web-audio-separation` provides the production MDX vocal/instrumental path. The verified 50 MB KARA model is packaged in the extension and runs locally through WebGPU with WASM fallback.
- FLOW prepares only the tracks loaded in the current/next decks, runs one inference job at a time, and keeps up to six completed results in IndexedDB. After the first pass, `FULL`, `VOCAL`, and `INSTRUMENTAL` are instant gain-pad operations and survive a restart.
- ONNX Runtime WebGPU/WASM support files are packaged locally inside the extension. Stem separation does not attempt to import runtime scripts from a CDN, so Chrome Manifest V3 CSP does not block it.
- `MASHUP` prepares two decks sequentially to limit peak memory, uses Deck A as the instrumental and Deck B as the vocal, beat-matches them, then starts both decks at the center crossfader position.
- Inference runs locally through ONNX Runtime Web: WebGPU first, CPU/WASM fallback.
- The optional high-quality HTDemucs four-stem model is downloaded only when explicitly requested and cached in the browser's Origin Private File System.
- A separated deck switches from its original stream to four synchronized stem channels.
- Every stem has independent gain and solo control while deck transport, pitch, sync, EQ and crossfader remain active.
- Audio is not uploaded to a FLOW server.

Stem extraction intentionally downloads the selected track into memory because neural separation requires random access to the decoded waveform. Normal playback remains incremental streaming.

## Install

1. Disable older FLOW versions.
2. Open `chrome://extensions` or `arc://extensions` and enable Developer mode.
3. Load the unpacked `FLOW-VK-v7.1.2` directory.
4. Refresh VK, open a playlist and launch FLOW.
5. Load a track into either deck. FLOW prepares its two-stem cache in the background; `AI READY` means the stem pads are instant. `4-STEM HQ` remains an optional heavier mode.

Chromium with WebGPU is strongly recommended. Browser inference is not as fast as Serato's native Apple-Silicon engine on the first pass, so FLOW hides that cost behind background preparation and persistent caching instead of blocking a pad click.

## Credits

Powered by **K.G.Studio** © 2025-2026 Xiaohan Tian. Separator integration adapted under its included license.

The runtime also incorporates `demucs-web` (MIT), ONNX Runtime Web (MIT), and the HTDemucs model. See `stems/KG-STUDIO-LICENSE.txt` and `stems/THIRD_PARTY_NOTICES.md`.

## 6.3.3 quick stem controls and corrected SYNC

- Both decks have `FULL MIX`, `VOCALS`, `INSTRUMENTAL` controls next to `SEPARATE A/B`. The first isolation request starts actual HTDemucs inference; it is not an EQ emulation. Subsequent mode switches control the four separated audio streams.
- Changing the deck track while inference is in progress discards stale results instead of applying them to the new track.
- SYNC still requires actual estimated BPM on both decks. It now aligns the *normalized beat phase* in each deck's native timeline, accounting for unequal BPM and beat offsets, rather than subtracting seconds from beats of different lengths. Rate adjustment is intentionally bounded to ±12%; larger mismatches need manual correction.
- Limitations: streaming VK tracks may need enough playback time for BPM estimation; HLS cannot currently be used as input to the stem decoder. Browser WebGPU/WASM model inference is resource intensive. Verification performed with Node regression tests, not a complete live VK/Chrome audio run.
