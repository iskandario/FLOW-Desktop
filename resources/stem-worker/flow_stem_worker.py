"""Resident stem-separation worker for FLOW Desktop.

Started once by the Electron main process with the audio-separator venv's
Python; keeps torch and the model loaded between tracks (PyTorch on MPS on
Apple Silicon).

Demucs models run in chunks so the deck gets stems the way Serato does: the
chunk under the playhead first, then onwards, each chunk sent to the app as
soon as it is separated. A deck's stream job pre-empts library preparation
between chunks. Other models (MDX, Roformer) run whole-file through
audio-separator.

Protocol, one JSON object per line:
  stdin   {"id", "kind": "stream", "pcm": path, "frames": n, "rate": hz,
           "model", "output_dir", "name", "start_sec"}
          {"id", "kind": "batch", "input": audio path, "model", "output_dir"}
          {"id", "kind": "warm", "model"}
          {"control": "seek", "id", "sec"}   reprioritize a stream job
          {"control": "cancel", "id"}
  stdout  {"id": null, "type": "ready"}
          {"id", "type": "chunk", "path", "start", "frames"}   stream jobs
          {"id", "type": "progress", "done", "total"}
          {"id", "type": "done", "files": [paths]}
          {"id", "type": "error", "error": str}
A chunk file holds planar float32 at the stream's rate, in the order
vocals L, vocals R, drums L, drums R, bass L, bass R, other L, other R.
Logs go to stderr.
"""
import json
import logging
import os
import sys
import threading
import time
import traceback
from pathlib import Path

import numpy as np

# Same tuning as the CLI path in src/main/stems.ts for non-Demucs models.
MDX_PARAMS = {"hop_length": 1024, "segment_size": 256, "overlap": 0.1, "batch_size": 4, "enable_denoise": False}

UNIT_SEC = 6.0          # chunk grid; the first chunk is one unit for fast first audio
MAX_UNITS = 5           # later chunks merge up to this many contiguous units
CONTEXT_SEC = 1.5       # audio either side a chunk is separated with, then cropped
OVERLAP = 0.25          # Demucs' own window overlap inside a chunk
FADE = 1024             # frames crossfaded into an already separated neighbour
FLOW_ORDER = ["vocals", "drums", "bass", "other"]

lock = threading.Lock()
wake = threading.Event()
pending = []            # job dicts not yet started, in arrival order
controls = {}           # job id -> {"seek": sec} | {"cancel": True}
out_lock = threading.Lock()


def emit(message):
    with out_lock:
        sys.stdout.write(json.dumps(message) + "\n")
        sys.stdout.flush()


def log(*parts):
    print("[flow-stem-worker]", *parts, file=sys.stderr, flush=True)


def read_stdin():
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            message = json.loads(raw)
        except ValueError:
            continue
        with lock:
            if message.get("control"):
                controls.setdefault(message.get("id"), {}).update(
                    {"cancel": True} if message["control"] == "cancel" else {"seek": float(message.get("sec", 0))}
                )
            else:
                pending.append(message)
        wake.set()
    with lock:
        pending.append({"kind": "exit"})
    wake.set()


class Engine:
    def __init__(self, model_dir):
        import torch

        self.torch = torch
        self.model_dir = model_dir
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.models = {}
        self.separator = None

    def demucs(self, model_file):
        name = os.path.splitext(os.path.basename(model_file))[0]
        if name not in self.models:
            from demucs.pretrained import get_model

            started = time.time()
            # Keep one resident model: a second Demucs bag would double memory.
            self.models.clear()
            model = get_model(name, repo=Path(self.model_dir))
            model.to(self.device).eval()
            self.models[name] = model
            log(f"loaded {name} on {self.device} in {time.time() - started:.1f}s")
        return self.models[name]

    def audio_separator(self):
        if self.separator is None:
            from audio_separator.separator import Separator

            self.separator = Separator(
                log_level=logging.INFO,
                model_file_dir=self.model_dir,
                output_dir=self.model_dir,
                output_format="WAV",
                mdx_params=MDX_PARAMS,
            )
        return self.separator


def is_demucs(model_file):
    return model_file.endswith(".yaml")


class ChunkedJob:
    """One track separated chunk by chunk with a Demucs model."""

    def __init__(self, engine, job):
        import julius

        torch = engine.torch
        self.engine = engine
        self.id = job["id"]
        self.kind = job["kind"]
        self.model_file = job["model"]
        self.output_dir = job["output_dir"]
        self.model = engine.demucs(self.model_file)
        sr = self.model.samplerate

        if self.kind == "stream":
            frames, rate = int(job["frames"]), int(job["rate"])
            planar = np.fromfile(job["pcm"], dtype=np.float32, count=frames * 2).reshape(2, frames)
            os.remove(job["pcm"])
            self.name = job.get("name") or "track"
            wav = torch.from_numpy(planar.copy())
        else:
            from demucs.audio import AudioFile

            rate = sr
            wav = AudioFile(job["input"]).read(streams=0, samplerate=sr, channels=self.model.audio_channels)
            self.name = os.path.splitext(os.path.basename(job["input"]))[0]
            frames = wav.shape[-1]

        self.rate = rate
        self.frames = frames
        # Track audio stays at the deck's rate; each chunk is resampled to the
        # model's rate on its own, so the first chunk doesn't wait on the track.
        self.wav = wav
        ref = wav.mean(0)
        self.mean, self.std = float(ref.mean()), float(ref.std()) or 1.0
        self.units = max(1, int(np.ceil(frames / rate / UNIT_SEC)))
        self.done = [False] * self.units
        self.result = np.zeros((len(FLOW_ORDER), 2, frames), dtype=np.float32)
        self.cursor = int(float(job.get("start_sec", 0)) / UNIT_SEC) % self.units
        self.first = True
        if self.kind == "stream":
            self.chunk_dir = os.path.join(self.output_dir, ".chunks")
            os.makedirs(self.chunk_dir, exist_ok=True)

    def seek(self, sec):
        self.cursor = min(self.units - 1, max(0, int(sec / UNIT_SEC)))
        self.first = True

    @property
    def finished(self):
        return all(self.done)

    def next_run(self):
        """Contiguous undone units starting at the cursor, wrapping to the start."""
        for offset in range(self.units):
            start = (self.cursor + offset) % self.units
            if not self.done[start]:
                end = start + 1
                limit = 1 if self.first else MAX_UNITS
                while end < self.units and end - start < limit and not self.done[end]:
                    end += 1
                return start, end
        return None

    def step(self):
        import julius
        from demucs.apply import apply_model

        torch = self.engine.torch
        run = self.next_run()
        if run is None:
            return
        u0, u1 = run
        sr = self.model.samplerate
        t0 = int(round(u0 * UNIT_SEC * self.rate))
        t1 = min(self.frames, int(round(u1 * UNIT_SEC * self.rate)))
        ctx = int(CONTEXT_SEC * self.rate)
        a0, b0 = max(0, t0 - ctx), min(self.frames, t1 + ctx)

        # Resample with the context attached so the resampler's edges fall
        # outside the frames we keep, on the way in and on the way out.
        x = (self.wav[:, a0:b0] - self.mean) / self.std
        if self.rate != sr:
            x = julius.resample_frac(x, self.rate, sr)
        with torch.no_grad():
            out = apply_model(self.model, x[None], device=self.engine.device, shifts=0, split=True, overlap=OVERLAP, progress=False)[0]
        out = (out * self.std + self.mean).cpu()
        out = out[[self.model.sources.index(s) for s in FLOW_ORDER]]
        if self.rate != sr:
            out = julius.resample_frac(out, sr, self.rate, output_length=b0 - a0)
        # Chunks are separated independently, so their edges differ slightly.
        # Where a neighbour is already done, crossfade into it instead of
        # butting up against it, and resend the blended frames with the chunk.
        left = min(FADE, t0 - a0) if u0 > 0 and self.done[u0 - 1] else 0
        right = min(FADE, b0 - t1) if u1 < self.units and self.done[u1] else 0
        s0, s1 = t0 - left, t1 + right
        piece = out[..., s0 - a0:s1 - a0].numpy().astype(np.float32)
        if left:
            w = np.linspace(0, 1, left, endpoint=False, dtype=np.float32)
            piece[..., :left] = self.result[..., s0:t0] * (1 - w) + piece[..., :left] * w
        if right:
            w = np.linspace(1, 0, right, endpoint=False, dtype=np.float32)
            piece[..., -right:] = piece[..., -right:] * w + self.result[..., t1:s1] * (1 - w)
        n = piece.shape[-1]
        self.result[..., s0:s0 + n] = piece

        for u in range(u0, u1):
            self.done[u] = True
        self.cursor = u1 % self.units
        self.first = False

        if self.kind == "stream":
            path = os.path.join(self.chunk_dir, f"{self.id}-{s0}.f32")
            np.ascontiguousarray(piece.reshape(-1)).tofile(path)
            emit({"id": self.id, "type": "chunk", "path": path, "start": s0, "frames": n})
        emit({"id": self.id, "type": "progress", "done": sum(self.done), "total": self.units})

    def finish(self):
        import soundfile as sf

        os.makedirs(self.output_dir, exist_ok=True)
        model_name = os.path.splitext(os.path.basename(self.model_file))[0]
        files = []
        for index, stem in enumerate(FLOW_ORDER):
            path = os.path.join(self.output_dir, f"{self.name}_({stem.capitalize()})_{model_name}.wav")
            sf.write(path, self.result[index].T, self.rate, subtype="FLOAT")
            files.append(path)
        emit({"id": self.id, "type": "done", "files": files})


def run_whole_file(engine, job):
    separator = engine.audio_separator()
    separator.load_model(job["model"])
    os.makedirs(job["output_dir"], exist_ok=True)
    separator.output_dir = job["output_dir"]
    separator.model_instance.output_dir = job["output_dir"]
    files = separator.separate(job["input"])
    emit({"id": job["id"], "type": "done", "files": [os.path.join(job["output_dir"], f) for f in files]})


def main():
    model_dir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/audio-separator-models/"
    engine = Engine(model_dir)
    threading.Thread(target=read_stdin, daemon=True).start()
    emit({"id": None, "type": "ready"})

    active = []   # started ChunkedJobs; streams are served before batches
    while True:
        with lock:
            incoming, pending[:] = pending[:], []
            pending_controls = dict(controls)
            controls.clear()
        if any(job.get("kind") == "exit" for job in incoming):
            return

        for job_id, control in pending_controls.items():
            for job in list(active):
                if job.id != job_id:
                    continue
                if control.get("cancel"):
                    active.remove(job)
                    emit({"id": job_id, "type": "error", "error": "cancelled"})
                elif "seek" in control:
                    job.seek(control["seek"])

        for job in incoming:
            job_id = job.get("id")
            if pending_controls.get(job_id, {}).get("cancel"):
                emit({"id": job_id, "type": "error", "error": "cancelled"})
                continue
            try:
                if job["kind"] == "warm":
                    if is_demucs(job["model"]):
                        engine.demucs(job["model"])
                    else:
                        engine.audio_separator().load_model(job["model"])
                    emit({"id": job_id, "type": "done", "files": []})
                elif is_demucs(job["model"]):
                    # Newest stream first: it is the track that was just loaded.
                    created = ChunkedJob(engine, job)
                    active.insert(0, created) if created.kind == "stream" else active.append(created)
                else:
                    run_whole_file(engine, job)
            except Exception as error:
                traceback.print_exc(file=sys.stderr)
                emit({"id": job_id, "type": "error", "error": f"{type(error).__name__}: {error}"})

        if not active:
            wake.wait()
            wake.clear()
            continue

        streams = [job for job in active if job.kind == "stream"]
        job = streams[0] if streams else active[0]
        try:
            job.step()
            if job.finished:
                active.remove(job)
                job.finish()
        except Exception as error:
            traceback.print_exc(file=sys.stderr)
            if job in active:
                active.remove(job)
            emit({"id": job.id, "type": "error", "error": f"{type(error).__name__}: {error}"})


if __name__ == "__main__":
    main()
