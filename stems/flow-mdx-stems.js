let worker
let jobId = 0
const pending = new Map()

function ensureWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./flow-mdx-worker.js', import.meta.url), {
    type: 'module',
    name: 'flow-mdx-inst-hq-3'
  })
  worker.onmessage = event => {
    const message = event.data || {}
    const job = pending.get(message.id)
    if (!job) return
    if (message.type === 'progress') {
      job.onProgress?.(message.progress)
      return
    }
    pending.delete(message.id)
    clearTimeout(job.timer)
    if (message.type === 'result') job.resolve(message.result)
    else job.reject(new Error(message.error || 'Stem worker failed'))
  }
  worker.onerror = event => {
    for (const job of pending.values()) {
      clearTimeout(job.timer)
      job.reject(new Error(event.message || 'Stem worker crashed'))
    }
    pending.clear()
    worker?.terminate()
    worker = undefined
  }
  return worker
}

async function decode(blob) {
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext
  const context = new AudioContextClass({ sampleRate: 44100, latencyHint: 'playback' })
  try {
    const audio = await context.decodeAudioData(await blob.arrayBuffer())
    return {
      left: audio.getChannelData(0).slice(),
      right: (audio.numberOfChannels > 1 ? audio.getChannelData(1) : audio.getChannelData(0)).slice(),
      sampleRate: audio.sampleRate
    }
  } finally {
    await context.close()
  }
}

export async function separateTwoStem(blob, onProgress) {
  onProgress?.({ percent: 1, message: 'Decoding audio' })
  const { left, right, sampleRate } = await decode(blob)
  const id = ++jobId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Neural stem worker timed out'))
    }, 15 * 60 * 1000)
    pending.set(id, { resolve, reject, onProgress, timer })
    ensureWorker().postMessage(
      { type: 'separate', id, left, right, sampleRate },
      [left.buffer, right.buffer]
    )
  })
}

export function status() {
  return {
    model: 'UVR-MDX-NET-Inst_HQ_3',
    label: 'MDX Inst HQ 3',
    local: true,
    worker: true,
    webgpu: Boolean(navigator.gpu),
    bytes: 66759214
  }
}
