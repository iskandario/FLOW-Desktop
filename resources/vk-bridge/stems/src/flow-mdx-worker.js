import * as ort from 'onnxruntime-web'
import { createSeparator } from 'web-audio-separation'

// web-audio-separation currently overwrites wasmPaths with a jsDelivr URL in
// loadModel(). ORT then fetches that cross-origin ESM and turns it into a
// blob: module. Chrome MV3 correctly rejects the dynamic blob import under
// extension CSP. Pin both runtime files explicitly and ignore that overwrite:
// ORT can import the extension-owned .mjs directly under script-src 'self'.
const localWasmPaths = Object.freeze({
  mjs: new URL('./assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.mjs', import.meta.url).href,
  wasm: new URL('./assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.wasm', import.meta.url).href
})
Object.defineProperty(ort.env.wasm, 'wasmPaths', {
  configurable: true,
  enumerable: true,
  get: () => localWasmPaths,
  set: () => undefined
})
// Extension pages are not crossOriginIsolated. A single ORT thread avoids a
// second worker/bootstrap path and keeps peak memory predictable.
ort.env.wasm.numThreads = 1
ort.env.wasm.proxy = false

const modelUrl = new URL('./models/UVR-MDX-NET-Inst_HQ_3.onnx', import.meta.url).href
let separator
let activeId = 0
let releaseTimer

function instance(id) {
  activeId = id
  if (!separator) {
    separator = createSeparator('UVR-MDX-NET-Inst_HQ_3', {
      common: {
        modelPath: modelUrl,
        modelUrl,
        logLevel: 'warning',
        onProgress: event => postMessage({
          type: 'progress',
          id: activeId,
          progress: {
            ...event,
            percent: Number(event?.fraction || 0) * 100,
            message: event?.stage || 'MDX Inst HQ 3 separation'
          }
        })
      },
      mdx: {
        segmentSize: 256,
        overlap: 0.1,
        batchSize: 1,
        hopLength: 1024,
        executionProviders: ['wasm']
      }
    })
  }
  clearTimeout(releaseTimer)
  return separator
}

function wav(channels, sampleRate) {
  const length = channels[0].length
  const count = channels.length
  const bytes = 44 + length * count * 2
  const buffer = new ArrayBuffer(bytes)
  const view = new DataView(buffer)
  const text = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }
  text(0, 'RIFF')
  view.setUint32(4, bytes - 8, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, count, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * count * 2, true)
  view.setUint16(32, count * 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, bytes - 44, true)
  let offset = 44
  for (let frame = 0; frame < length; frame += 1) {
    for (let channel = 0; channel < count; channel += 1) {
      const value = Math.max(-1, Math.min(1, channels[channel][frame] || 0))
      view.setInt16(offset, value < 0 ? value * 32768 : value * 32767, true)
      offset += 2
    }
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

function scheduleRelease() {
  clearTimeout(releaseTimer)
  releaseTimer = setTimeout(async () => {
    const current = separator
    separator = undefined
    try { await current?.model?.release?.() } catch {}
  }, 90_000)
}

self.onmessage = async event => {
  const { type, id, left, right, sampleRate = 44100 } = event.data || {}
  if (type !== 'separate') return
  try {
    const engine = instance(id)
    await engine.loadModel()
    const mix = await engine.normalize(
      [left, right],
      engine.normalizationThreshold,
      engine.amplificationThreshold
    )
    const instrumental = await engine.demix(mix)
    const vocal = instrumental.map((channel, channelIndex) => {
      const output = new Float32Array(channel.length)
      const source = mix[channelIndex]
      const compensate = engine.compensate || 1
      for (let index = 0; index < output.length; index += 1) {
        output[index] = source[index] - channel[index] * compensate
      }
      return output
    })
    const outputVocals = await engine.normalize(
      vocal,
      engine.normalizationThreshold,
      engine.amplificationThreshold
    )
    const outputInstrumental = await engine.normalize(
      instrumental,
      engine.normalizationThreshold,
      engine.amplificationThreshold
    )
    postMessage({
      type: 'result',
      id,
      result: {
        stems: [
          { name: 'Vocals', blob: wav(outputVocals, sampleRate) },
          { name: 'Instrumental', blob: wav(outputInstrumental, sampleRate) }
        ],
        provider: 'web-audio-separation-worker',
        providerLabel: 'MDX INST HQ 3 · LOCAL WASM'
      }
    })
  } catch (error) {
    postMessage({ type: 'error', id, error: error?.stack || error?.message || String(error) })
  } finally {
    scheduleRelease()
  }
}
