(() => {
  const canvas = document.querySelector('#auraCanvas');
  const g = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const state = { playing: false, bpm: 112, energy: .35, color: '#7868ff', spectrum: [], bass: 0, lowMid: 0, high: 0, rms: 0, beatPulse: 0, beatIndex: 0 };
  const smooth = new Float32Array(48);
  const motes = [];
  const pulses = [];
  const palette = ['#7868ff', '#00d9ff', '#66ffd6', '#ff55cb', '#ffb078'];
  let width = 0, height = 0, ratio = 1, lastFrame = 0, visualPulse = 0, seenBeat = 0, previousPulse = 0, bassEnvelope = 0;

  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  function rgba(hex, alpha) {
    const raw = String(hex || '#7868ff').replace('#', '');
    const value = raw.length === 3 ? raw.split('').map(part => part + part).join('') : raw;
    return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${alpha})`;
  }
  function drift(time, offset, alpha, saturation = 84, lightness = 66) {
    const hue = (time * .0042 + offset) % 360;
    return `hsla(${hue},${saturation}%,${lightness}%,${alpha})`;
  }

  function resize() {
    ratio = Math.min(1.65, devicePixelRatio || 1); width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function fallbackBand(index, time) {
    if (!state.playing) return .08 + Math.sin(time * .00055 + index * .8) * .018;
    const beat = Math.pow(Math.max(0, Math.sin(time / 60000 * state.bpm * Math.PI * 2)), 5);
    return clamp(.14 + beat * .24 * (1 - index / 60) + Math.sin(time * .0011 + index * .72) * .045);
  }

  function updateSpectrum(time) {
    for (let index = 0; index < smooth.length; index += 1) {
      const target = state.spectrum.length ? Number(state.spectrum[index] || 0) : fallbackBand(index, time);
      smooth[index] += (target - smooth[index]) * (target > smooth[index] ? .38 : .1);
    }
  }

  function blobPath(cx, cy, radius, time, phase = 0, strength = 1) {
    g.beginPath();
    for (let index = 0; index <= 180; index += 1) {
      const angle = index / 180 * Math.PI * 2;
      const spectral = smooth[Math.floor(index / 180 * 47)];
      const liquid = Math.sin(angle * 3 + time * .00055 + phase) * .045 + Math.sin(angle * 5 - time * .00031 + phase * 2) * .028;
      const r = radius * (1 + liquid + spectral * .11 * strength + visualPulse * .045);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * (.91 + Math.sin(time * .00037 + phase) * .018);
      if (!index) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
  }

  function softFlow(time, cx, cy, radius) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (const side of [-1, 1]) {
      for (let lane = 0; lane < 4; lane += 1) {
        const start = cx + side * radius * .58;
        const end = side < 0 ? -width * .18 : width * 1.18;
        const points = [];
        for (let step = 0; step <= 64; step += 1) {
          const p = step / 64;
          const x = start + (end - start) * p;
          const spectral = smooth[(lane * 9 + Math.floor(p * 15)) % 48];
          const envelope = Math.pow(1 - p, .46);
          const y = cy + Math.sin(p * Math.PI * (1.6 + lane * .18) - time * (.0005 + lane * .00004) + lane * 1.2) * (18 + spectral * 42) * envelope + (lane - 1.5) * 10;
          const thickness = (22 + spectral * 36 + visualPulse * 18) * envelope;
          points.push({ x, y, thickness });
        }
        g.beginPath();
        points.forEach((point, index) => index ? g.lineTo(point.x, point.y - point.thickness) : g.moveTo(point.x, point.y - point.thickness));
        for (let index = points.length - 1; index >= 0; index -= 1) g.lineTo(points[index].x, points[index].y + points[index].thickness);
        g.closePath();
        const gradient = g.createLinearGradient(start, cy, end, cy);
        gradient.addColorStop(0, drift(time, lane * 62, .3 + state.rms * .5));
        gradient.addColorStop(.42, drift(time, 95 + lane * 48, .11));
        gradient.addColorStop(1, drift(time, 180 + lane * 35, 0));
        g.fillStyle = gradient; g.filter = `blur(${16 + lane * 5}px)`; g.fill();
      }
    }
    g.restore();
  }

  function drawBlob(time, cx, cy, radius, power) {
    g.save(); g.globalCompositeOperation = 'screen';
    const halo = g.createRadialGradient(cx, cy, radius * .12, cx, cy, radius * 2.45);
    halo.addColorStop(0, drift(time, 0, .28, 76, 78)); halo.addColorStop(.28, drift(time, 80, .18)); halo.addColorStop(.62, drift(time, 175, .06)); halo.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = halo; g.fillRect(cx - radius * 2.7, cy - radius * 2.7, radius * 5.4, radius * 5.4);

    g.globalCompositeOperation = 'source-over';
    blobPath(cx, cy, radius, time);
    const core = g.createRadialGradient(cx - radius * .22, cy - radius * .25, radius * .03, cx, cy, radius * 1.14);
    core.addColorStop(0, `rgba(244,255,255,${.9 + power * .08})`);
    core.addColorStop(.1, drift(time, 25, .9, 78, 73)); core.addColorStop(.29, drift(time, 95, .78, 74, 59)); core.addColorStop(.55, drift(time, 155, .54, 70, 34)); core.addColorStop(.8, 'rgba(42,25,72,.97)'); core.addColorStop(1, 'rgba(8,9,22,.96)');
    g.fillStyle = core; g.filter = 'blur(2px)'; g.shadowColor = '#5de8ff'; g.shadowBlur = 30 + power * 32; g.fill();

    g.globalCompositeOperation = 'screen';
    for (let layer = 0; layer < 3; layer += 1) {
      const scale = 1.01 + layer * .034;
      blobPath(cx, cy, radius * scale, time, layer * 1.17, .8);
      const gradient = g.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      const opacity = layer === 0 ? .62 : .16;
      gradient.addColorStop(0, drift(time, layer * 34, opacity)); gradient.addColorStop(.25, drift(time, 72 + layer * 31, opacity)); gradient.addColorStop(.52, drift(time, 155 + layer * 28, opacity * .82)); gradient.addColorStop(.76, drift(time, 235 + layer * 25, opacity)); gradient.addColorStop(1, drift(time, 318 + layer * 21, opacity * .72));
      g.strokeStyle = gradient; g.lineWidth = layer === 0 ? 13 : 15 - layer * 3; g.filter = `blur(${layer === 0 ? 4 : 9 + layer * 4}px)`; g.shadowColor = drift(time, 90 + layer * 80, .7); g.shadowBlur = 15; g.stroke();
    }

    g.filter = 'blur(16px)';
    const sheen = g.createRadialGradient(cx - radius * .28, cy - radius * .31, 0, cx - radius * .28, cy - radius * .31, radius * .45);
    sheen.addColorStop(0, 'rgba(255,255,255,.72)'); sheen.addColorStop(.18, 'rgba(151,255,255,.4)'); sheen.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.beginPath(); g.arc(cx - radius * .22, cy - radius * .25, radius * .6, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function emit(cx, cy, radius, time) {
    pulses.push({ born: time, strength: .6 + state.bass });
    const count = 5 + Math.round(state.high * 10);
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      motes.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius * .9, vx: Math.cos(angle) * radius * (.2 + Math.random() * .35), vy: Math.sin(angle) * radius * (.2 + Math.random() * .35), life: 1, color: palette[index % palette.length], size: 2 + Math.random() * 5 });
    }
  }

  function drawPulseMatter(time, cx, cy, radius, delta) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (let index = pulses.length - 1; index >= 0; index -= 1) {
      const pulse = pulses[index]; const age = (time - pulse.born) / 1500;
      if (age >= 1) { pulses.splice(index, 1); continue; }
      blobPath(cx, cy, radius * (1.08 + age * 2.6), time, age * 3, .25);
      g.strokeStyle = `rgba(105,221,255,${(1 - age) * .09 * pulse.strength})`; g.lineWidth = 18 * (1 - age); g.filter = `blur(${10 + age * 20}px)`; g.stroke();
    }
    for (let index = motes.length - 1; index >= 0; index -= 1) {
      const mote = motes[index]; mote.x += mote.vx * delta; mote.y += mote.vy * delta; mote.vx *= .982; mote.vy *= .982; mote.life -= delta * .62;
      if (mote.life <= 0) { motes.splice(index, 1); continue; }
      g.filter = 'blur(4px)'; g.fillStyle = rgba(mote.color, mote.life * .32); g.beginPath(); g.arc(mote.x, mote.y, mote.size * mote.life, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  function draw(time) {
    if (time - lastFrame < 24) { requestAnimationFrame(draw); return; }
    const delta = Math.min(.05, (time - lastFrame) / 1000 || .025); lastFrame = time; updateSpectrum(time);
    const compact = width < 760; const cx = width * .5; const cy = height * (compact ? .22 : .255);
    const baseRadius = compact ? Math.min(112, width * .265) : Math.min(190, width * .15, height * .235);
    const synthetic = state.playing && !state.spectrum.length ? Math.pow(Math.max(0, Math.sin(time / 60000 * state.bpm * Math.PI * 2)), 7) : 0;
    bassEnvelope += (state.bass - bassEnvelope) * (state.bass > bassEnvelope ? .22 : .035);
    const spectralKick = state.spectrum.length ? clamp((state.bass - bassEnvelope) * 7 + state.bass * .34) : 0;
    visualPulse = state.spectrum.length ? Math.max(state.beatPulse, spectralKick) : synthetic;
    const power = clamp(state.rms * 4 + state.energy * .25 + visualPulse * .22); const radius = baseRadius * (1 + power * .07);
    const background = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * .82);
    background.addColorStop(0, '#101225'); background.addColorStop(.27, '#070913'); background.addColorStop(1, '#020306');
    g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.fillStyle = background; g.fillRect(0, 0, width, height);
    const newBeat = state.beatIndex > seenBeat;
    if (newBeat || (visualPulse > .66 && previousPulse <= .66)) emit(cx, cy, radius, time);
    seenBeat = Math.max(seenBeat, state.beatIndex); previousPulse = visualPulse;
    softFlow(time, cx, cy, radius); drawPulseMatter(time, cx, cy, radius, delta); drawBlob(time, cx, cy, radius, power);
    requestAnimationFrame(draw);
  }

  window.flowAura = { update(next = {}) {
    for (const key of ['playing', 'bpm', 'energy', 'color', 'bass', 'lowMid', 'high', 'rms', 'beatPulse', 'beatIndex']) if (next[key] !== undefined) state[key] = next[key];
    if (Array.isArray(next.spectrum)) state.spectrum = next.spectrum;
  }};
  addEventListener('resize', resize); resize(); requestAnimationFrame(draw);
})();
