const { app, BrowserWindow, session } = require('electron')
const path = require('path')

const extensionPath = path.resolve(__dirname, '../resources/vk-bridge')

function timeout(ms, message) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
}

app.whenReady().then(async () => {
  const partition = `persist:flow-stem-smoke-${Date.now()}`
  const testSession = session.fromPartition(partition)
  const extension = await testSession.extensions.loadExtension(extensionPath, {
    allowFileAccess: true
  })
  const window = new BrowserWindow({
    show: false,
    webPreferences: { partition, contextIsolation: true, sandbox: true }
  })
  window.webContents.on('console-message', (_event, details) => {
    process.stderr.write(`[extension] ${details.message}\n`)
  })
  await window.loadURL(`chrome-extension://${extension.id}/app/index.html`)

  const smoke = window.webContents.executeJavaScript(`(async () => {
    function wav(seconds = 0.35, sampleRate = 44100) {
      const frames = Math.floor(seconds * sampleRate)
      const channels = 2
      const bytes = 44 + frames * channels * 2
      const buffer = new ArrayBuffer(bytes)
      const view = new DataView(buffer)
      const text = (offset, value) => {
        for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
      }
      text(0, 'RIFF'); view.setUint32(4, bytes - 8, true); text(8, 'WAVE'); text(12, 'fmt ')
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true)
      view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * 2, true)
      view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true)
      text(36, 'data'); view.setUint32(40, bytes - 44, true)
      let offset = 44
      for (let frame = 0; frame < frames; frame++) {
        const t = frame / sampleRate
        const sample = Math.sin(2 * Math.PI * 220 * t) * 0.18 + Math.sin(2 * Math.PI * 880 * t) * 0.08
        const pcm = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)))
        view.setInt16(offset, pcm, true); offset += 2
        view.setInt16(offset, pcm, true); offset += 2
      }
      return new Blob([buffer], { type: 'audio/wav' })
    }
    const module = await import(chrome.runtime.getURL('stems/flow-mdx-stems.js'))
    const progress = []
    const result = await module.separateTwoStem(wav(), event => progress.push(event.message || event.stage))
    return {
      stems: result.stems.map(stem => ({ name: stem.name, bytes: stem.blob.size })),
      provider: result.provider,
      progress
    }
  })()`)

  const started = Date.now()
  const result = await Promise.race([
    smoke,
    timeout(180_000, 'Extension stem smoke test timed out')
  ])
  process.stdout.write(`${JSON.stringify({ elapsedMs: Date.now() - started, ...result }, null, 2)}\n`)
  window.destroy()
  app.quit()
}).catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`)
  app.exit(1)
})
