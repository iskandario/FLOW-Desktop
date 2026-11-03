import { useEffect, useState } from 'react'
import { initApp, setMasterGain, toggleRecording } from './controller'
import { useStore } from './state/store'
import { BeatMatchView } from './components/BeatMatchView'
import { DeckView } from './components/DeckView'
import { Library } from './components/Library'
import { MasterMeter } from './components/MasterMeter'
import { Mixer } from './components/Mixer'
import { Knob } from './components/Knob'
import { ReelControls } from './components/ReelControls'

export default function App() {
  const engineReady = useStore((s) => s.engineReady)
  const recording = useStore((s) => s.recording)
  const masterGain = useStore((s) => s.masterGain)
  const toast = useStore((s) => s.toast)
  const [initError, setInitError] = useState<string | null>(null)
  const [vkTracks, setVkTracks] = useState(0)

  useEffect(() => {
    initApp().catch((err) => setInitError((err as Error).message))
    void window.stemdeck.listVkTracks().then((snapshot) => setVkTracks(snapshot.tracks.length))
    return window.stemdeck.onVkUpdated((count) => setVkTracks(count))
  }, [])

  if (initError) {
    return <div className="init-error">Audio engine failed to start: {initError}</div>
  }
  if (!engineReady) {
    return <div className="init-splash">FLOW</div>
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">
          FLOW<span>DJ</span>
        </h1>
        <button
          className={`vk-connect ${vkTracks ? 'connected' : ''}`}
          onClick={() => void window.stemdeck.openVk()}
          title="Open the persistent VK login and music bridge"
        >
          <span className="vk-dot" />
          {vkTracks ? `VK · ${vkTracks} TRACKS` : 'VK CONNECT'}
        </button>
        <button
          className={`toggle record ${recording ? 'active' : ''}`}
          onClick={() => void toggleRecording()}
          title="Record the audio mix only"
        >
          {recording ? '■ STOP REC' : '● REC MIX'}
        </button>
        <ReelControls />
        <span className="spacer" />
        <MasterMeter />
        <Knob
          label="MASTER"
          min={0}
          max={1.5}
          defaultValue={1}
          value={masterGain}
          onChange={setMasterGain}
          size={36}
        />
      </header>

      <main className="decks-row">
        <DeckView deckIndex={0} />
        <Mixer />
        <DeckView deckIndex={1} />
      </main>

      <BeatMatchView />

      <Library />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
