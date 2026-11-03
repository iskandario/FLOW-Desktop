import { setCrossfader, setEq, setFader, setFilter, setTrim } from '../controller'
import { useStore } from '../state/store'
import { Fader } from './Fader'
import { Knob } from './Knob'

function ChannelStrip({ deckIndex }: { deckIndex: number }) {
  const channel = useStore((s) => s.mixer[deckIndex])
  return (
    <div className="channel-strip">
      <Knob
        label="TRIM"
        size={32}
        min={0}
        max={2}
        defaultValue={1}
        value={channel.trim}
        onChange={(v) => setTrim(deckIndex, v)}
      />
      <Knob
        label="HI"
        size={32}
        min={-1}
        max={1}
        defaultValue={0}
        value={channel.eqHigh}
        onChange={(v) => setEq(deckIndex, 'high', v)}
      />
      <Knob
        label="MID"
        size={32}
        min={-1}
        max={1}
        defaultValue={0}
        value={channel.eqMid}
        onChange={(v) => setEq(deckIndex, 'mid', v)}
      />
      <Knob
        label="LOW"
        size={32}
        min={-1}
        max={1}
        defaultValue={0}
        value={channel.eqLow}
        onChange={(v) => setEq(deckIndex, 'low', v)}
      />
      <Knob
        label="FILTER"
        size={32}
        min={-1}
        max={1}
        defaultValue={0}
        value={channel.filter}
        onChange={(v) => setFilter(deckIndex, v)}
      />
      <Fader
        orientation="vertical"
        length={82}
        min={0}
        max={1}
        value={channel.fader}
        onChange={(v) => setFader(deckIndex, v)}
        onDoubleClick={() => setFader(deckIndex, 1)}
      />
    </div>
  )
}

export function Mixer() {
  const crossfader = useStore((s) => s.crossfader)
  return (
    <section className="mixer">
      <div className="channels">
        <ChannelStrip deckIndex={0} />
        <ChannelStrip deckIndex={1} />
      </div>
      <div className="crossfader-row">
        <span>A</span>
        <Fader
          orientation="horizontal"
          length={132}
          min={0}
          max={1}
          value={crossfader}
          onChange={setCrossfader}
          onDoubleClick={() => setCrossfader(0.5)}
          className="crossfader"
        />
        <span>B</span>
      </div>
    </section>
  )
}
