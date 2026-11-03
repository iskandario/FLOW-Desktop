import { spawn, execFile } from 'child_process'
import { app } from 'electron'
import { subprocessEnv } from './env'
import { createHash } from 'crypto'
import { promises as fs, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'

export interface StemResult {
  vocals?: string
  drums?: string
  bass?: string
  other?: string
  instrumental?: string
}

export interface SeparationOptions {
  model: string
  onProgress: (line: string) => void
}

/** Models exposed in the UI. Standard HTDemucs is the verified interactive
 *  4-stem path; slower/high-quality alternatives remain available. */
export const STEM_MODELS = {
  'htdemucs.yaml': { label: 'FLOW LIVE · HTDemucs 4-stem (fast)', stems: 4 },
  'UVR-MDX-NET-Inst_HQ_3.onnx': { label: 'FLOW Fast · MDX/CoreML (vocals + instrumental)', stems: 2 },
  'htdemucs_ft.yaml': { label: 'Demucs v4 FT · higher quality / slower (4 stems)', stems: 4 },
  'model_bs_roformer_ep_317_sdr_12.9755.ckpt': { label: 'BS-Roformer SOTA (vocals + instrumental)', stems: 2 }
} as const

const BIN_CANDIDATES = [
  path.join(process.cwd(), '.venv', 'bin', 'audio-separator'),
  path.join(app.getAppPath(), '.venv', 'bin', 'audio-separator'),
  // In the local production build Resources lives five levels below the
  // project root. Keep the native engine discoverable when the .app is
  // launched from Finder instead of from the project directory.
  path.resolve(process.resourcesPath, '../../../../..', '.venv', 'bin', 'audio-separator'),
  'audio-separator',
  path.join(homedir(), '.local/bin/audio-separator'),
  '/opt/homebrew/bin/audio-separator',
  '/usr/local/bin/audio-separator'
]

let resolvedBin: string | null = null

/** Spawned separators, killed on app quit so they don't run orphaned. */
const liveProcesses = new Set<import('child_process').ChildProcess>()

app.on('will-quit', () => {
  for (const proc of liveProcesses) proc.kill()
})

export async function findSeparatorBin(): Promise<string | null> {
  if (resolvedBin) return resolvedBin
  const override = process.env.STEMDECK_AUDIO_SEPARATOR
  const candidates = override ? [override, ...BIN_CANDIDATES] : BIN_CANDIDATES
  for (const bin of candidates) {
    const ok = await new Promise<boolean>((resolve) => {
      execFile(bin, ['--version'], { timeout: 15000, env: subprocessEnv() }, (err) =>
        resolve(!err)
      )
    })
    if (ok) {
      resolvedBin = bin
      return bin
    }
  }
  return null
}

function cacheDirFor(trackPath: string, model: string): string {
  const hash = createHash('sha1').update(`${trackPath}::${model}`).digest('hex').slice(0, 16)
  return path.join(app.getPath('userData'), 'stems', hash)
}

/** Map output files to stem names based on audio-separator's "(Stem)" naming convention. */
async function collectStems(dir: string): Promise<StemResult> {
  const result: StemResult = {}
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (!/\.(wav|flac|mp3)$/i.test(file)) continue
    const lower = file.toLowerCase()
    const full = path.join(dir, file)
    if (lower.includes('(vocals)')) result.vocals = full
    else if (lower.includes('(drums)')) result.drums = full
    else if (lower.includes('(bass)')) result.bass = full
    else if (lower.includes('(other)')) result.other = full
    else if (lower.includes('(instrumental)')) result.instrumental = full
  }
  return result
}

function hasAnyStem(r: StemResult): boolean {
  return Boolean(r.vocals || r.drums || r.bass || r.other || r.instrumental)
}

export async function getCachedStems(trackPath: string, model: string): Promise<StemResult | null> {
  const dir = cacheDirFor(trackPath, model)
  if (!existsSync(dir)) return null
  const stems = await collectStems(dir)
  return hasAnyStem(stems) ? stems : null
}

function modelDir(): string {
  return path.join(app.getPath('userData'), 'stem-models')
}

function workerScript(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'stem-worker', 'flow_stem_worker.py')
    : path.join(app.getAppPath(), 'resources', 'stem-worker', 'flow_stem_worker.py')
}

/** The Python that runs audio-separator: the bin's sibling in a venv, else its shebang. */
async function pythonFor(bin: string): Promise<string | null> {
  const sibling = path.join(path.dirname(bin), 'python')
  if (path.isAbsolute(bin) && existsSync(sibling)) return sibling
  try {
    const head = (await fs.readFile(bin, 'utf8')).slice(0, 512).split('\n')[0]
    const interpreter = head.startsWith('#!') ? head.slice(2).trim().split(/\s+/)[0] : ''
    return interpreter && existsSync(interpreter) ? interpreter : null
  } catch {
    return null
  }
}

interface WorkerMessage {
  id: string | null
  type: string
  files?: string[]
  error?: string
  path?: string
  start?: number
  frames?: number
  done?: number
  total?: number
}

interface WorkerJob {
  onMessage: (message: WorkerMessage) => void
  onLog: (line: string) => void
  resolve: (files: string[]) => void
  reject: (error: Error) => void
}

/**
 * Resident separation process (resources/stem-worker/flow_stem_worker.py).
 * It keeps torch and the model loaded between tracks and schedules the jobs
 * itself: a deck's stream job runs chunk by chunk ahead of library batches.
 */
class StemWorker {
  private proc: import('child_process').ChildProcess | null = null
  private ready: Promise<void> | null = null
  private jobs = new Map<string, WorkerJob>()
  private nextId = 0

  async run(
    payload: Record<string, unknown>,
    handlers: Partial<Pick<WorkerJob, 'onMessage' | 'onLog'>> = {},
    id = `job-${++this.nextId}`
  ): Promise<string[]> {
    await this.start()
    return new Promise<string[]>((resolve, reject) => {
      this.jobs.set(id, {
        onMessage: handlers.onMessage ?? (() => {}),
        onLog: handlers.onLog ?? (() => {}),
        resolve,
        reject
      })
      this.proc!.stdin!.write(JSON.stringify({ id, ...payload }) + '\n')
    })
  }

  control(id: string, payload: Record<string, unknown>): void {
    if (this.proc && this.jobs.has(id)) this.proc.stdin!.write(JSON.stringify({ id, ...payload }) + '\n')
  }

  stop(): void {
    this.proc?.kill()
  }

  private start(): Promise<void> {
    if (this.ready) return this.ready
    this.ready = (async () => {
      const bin = await findSeparatorBin()
      const python = bin && (await pythonFor(bin))
      if (!python || !existsSync(workerScript())) throw new Error('Stem worker is not available')
      await fs.mkdir(modelDir(), { recursive: true })
      const proc = spawn(python, ['-u', workerScript(), modelDir()], { env: subprocessEnv() })
      this.proc = proc
      await new Promise<void>((resolve, reject) => {
        let buffer = ''
        proc.stdout!.on('data', (data: Buffer) => {
          buffer += data.toString()
          let newline: number
          while ((newline = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newline).trim()
            buffer = buffer.slice(newline + 1)
            if (!line) continue
            let message: WorkerMessage
            try {
              message = JSON.parse(line)
            } catch {
              continue
            }
            if (message.type === 'ready') resolve()
            else this.dispatch(message)
          }
        })
        proc.stderr!.on('data', (data: Buffer) => {
          // tqdm progress bars update via \r without newlines; the worker runs
          // one job at a time, so logs belong to whichever jobs are open.
          for (const raw of data.toString().split(/[\r\n]+/)) {
            const line = raw.trim()
            if (line) for (const job of this.jobs.values()) job.onLog(line)
          }
        })
        proc.on('error', reject)
        proc.on('close', (code) => {
          reject(new Error(`Stem worker exited with code ${code} before it was ready`))
          this.proc = null
          this.ready = null
          const failed = [...this.jobs.values()]
          this.jobs.clear()
          for (const job of failed) job.reject(new Error(`Stem worker exited with code ${code}`))
        })
      })
    })()
    this.ready.catch(() => { this.ready = null })
    return this.ready
  }

  private dispatch(message: WorkerMessage): void {
    const job = message.id ? this.jobs.get(message.id) : undefined
    if (!job) return
    if (message.type === 'done' || message.type === 'error') {
      this.jobs.delete(message.id!)
      if (message.type === 'done') job.resolve(message.files ?? [])
      else job.reject(new Error(message.error || 'Stem separation failed'))
    } else {
      job.onMessage(message)
    }
  }
}

const worker = new StemWorker()
app.on('will-quit', () => worker.stop())

/** Start the resident worker and load a model ahead of the first track. */
export async function warmStemWorker(model: string): Promise<void> {
  await worker.run({ kind: 'warm', model })
}

export interface StemChunk {
  /** First frame of the chunk, at the stream's rate */
  start: number
  frames: number
  /** Planar float32: vocals L, vocals R, drums L/R, bass L/R, other L/R */
  data: ArrayBuffer
}

export interface StreamOptions {
  id: string
  trackPath: string
  model: string
  /** Planar float32 stereo (L then R) of the decoded track, at `rate` */
  pcm: ArrayBuffer
  rate: number
  startSec: number
  onChunk: (chunk: StemChunk) => void
  onProgress: (done: number, total: number) => void
}

/**
 * Serato-style separation for a loaded deck: stems arrive chunk by chunk,
 * starting under the playhead. Resolves with the cached stem files once the
 * whole track is done, so the next load is instant.
 */
export async function streamStems(opts: StreamOptions): Promise<StemResult> {
  const cached = await getCachedStems(opts.trackPath, opts.model)
  if (cached) return cached
  const outDir = cacheDirFor(opts.trackPath, opts.model)
  await fs.mkdir(outDir, { recursive: true })
  const pcmPath = path.join(outDir, `.input-${opts.id}.f32`)
  await fs.writeFile(pcmPath, Buffer.from(opts.pcm))
  const frames = opts.pcm.byteLength / 8
  const pendingReads: Promise<void>[] = []
  try {
    await worker.run(
      {
        kind: 'stream',
        pcm: pcmPath,
        frames,
        rate: opts.rate,
        model: opts.model,
        output_dir: outDir,
        name: path.basename(opts.trackPath, path.extname(opts.trackPath)),
        start_sec: opts.startSec
      },
      {
        onMessage: (message) => {
          if (message.type === 'progress') opts.onProgress(message.done ?? 0, message.total ?? 0)
          if (message.type === 'chunk' && message.path) {
            const chunkPath = message.path
            pendingReads.push(
              fs.readFile(chunkPath).then(async (buf) => {
                await fs.rm(chunkPath, { force: true })
                const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
                opts.onChunk({ start: message.start ?? 0, frames: message.frames ?? 0, data })
              })
            )
          }
        }
      },
      opts.id
    )
  } finally {
    await Promise.allSettled(pendingReads)
    await fs.rm(pcmPath, { force: true })
  }
  const stems = await collectStems(outDir)
  if (!hasAnyStem(stems)) throw new Error(`Separation finished but no stem files were found in ${outDir}`)
  return stems
}

export function seekStemStream(id: string, seconds: number): void {
  worker.control(id, { control: 'seek', sec: seconds })
}

export function cancelStemStream(id: string): void {
  worker.control(id, { control: 'cancel' })
}

/** Only Demucs models (.yaml bags) can be streamed chunk by chunk. */
export function canStream(model: string): boolean {
  return model.endsWith('.yaml')
}

/** Errors from the worker process itself (not from a job) fall back to the CLI. */
class WorkerUnavailable extends Error {}

async function separateWithWorker(trackPath: string, outDir: string, opts: SeparationOptions): Promise<void> {
  let started = false
  try {
    await worker.run(
      { kind: 'batch', input: trackPath, model: opts.model, output_dir: outDir },
      {
        onLog: (line) => {
          started = true
          opts.onProgress(line)
        },
        onMessage: (message) => {
          started = true
          if (message.type === 'progress') opts.onProgress(`Separating ${message.done}/${message.total}`)
        }
      }
    )
  } catch (error) {
    const message = (error as Error).message
    if (!started && /not available|exited with code|before it was ready|ENOENT/.test(message)) {
      throw new WorkerUnavailable(message)
    }
    throw error
  }
}

export async function separateStems(trackPath: string, opts: SeparationOptions): Promise<StemResult> {
  const bin = await findSeparatorBin()
  if (!bin) {
    throw new Error(
      'audio-separator not found. Install it with: pipx install "audio-separator[cpu]" (see README)'
    )
  }
  const cached = await getCachedStems(trackPath, opts.model)
  if (cached) return cached

  const outDir = cacheDirFor(trackPath, opts.model)
  await fs.mkdir(outDir, { recursive: true })

  try {
    await separateWithWorker(trackPath, outDir, opts)
  } catch (error) {
    if (!(error instanceof WorkerUnavailable)) throw error
    opts.onProgress(`Resident stem worker unavailable (${error.message}); using audio-separator CLI`)
    await separateWithCli(bin, trackPath, outDir, opts)
  }

  const stems = await collectStems(outDir)
  if (!hasAnyStem(stems)) {
    throw new Error(`Separation finished but no stem files were found in ${outDir}`)
  }
  return stems
}

async function separateWithCli(bin: string, trackPath: string, outDir: string, opts: SeparationOptions): Promise<void> {
  await fs.mkdir(modelDir(), { recursive: true })

  const args = [
    trackPath,
    '--model_filename',
    opts.model,
    '--model_file_dir',
    modelDir(),
    '--output_dir',
    outDir,
    '--output_format',
    'wav',
    '--log_level',
    'info'
  ]

  // The fast two-stem model is the interactive DJ default. A batch of four
  // was 3.1x faster than audio-separator defaults on the target Apple Silicon
  // Mac while keeping memory bounded; lower overlap is appropriate for live
  // preparation and still produces genuine neural stems.
  if (opts.model === 'UVR-MDX-NET-Inst_HQ_3.onnx') {
    args.push('--mdx_batch_size', '4', '--mdx_overlap', '0.1')
  }

  // Verified on the target M1 Mac: 16 seconds of audio -> four genuine stems
  // in ~6 seconds of model time. Zero shifts avoids repeated inference and a
  // small overlap keeps chunk seams controlled for interactive DJ prep.
  if (opts.model === 'htdemucs.yaml') {
    args.push('--demucs_shifts', '0', '--demucs_overlap', '0.1')
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(bin, args, { env: subprocessEnv() })
    liveProcesses.add(proc)
    proc.on('close', () => liveProcesses.delete(proc))
    let lastLines: string[] = []
    const onData = (data: Buffer) => {
      // tqdm progress bars update via \r without newlines
      for (const raw of data.toString().split(/[\r\n]+/)) {
        const line = raw.trim()
        if (!line) continue
        lastLines.push(line)
        if (lastLines.length > 20) lastLines = lastLines.slice(-20)
        opts.onProgress(line)
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`audio-separator exited with code ${code}:\n${lastLines.join('\n')}`))
    })
  })
}
