(function exposeMixMath(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FlowMixMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const clamp = (value, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, Number(value)));

  function equalPower(progress) {
    const normalized = clamp(progress);
    return { outgoing: Math.cos(normalized * Math.PI / 2), incoming: Math.sin(normalized * Math.PI / 2) };
  }

  function safePlaybackRate(masterBpm, incomingBpm, limit = .06) {
    const master = Number(masterBpm);
    const incoming = Number(incomingBpm);
    if (!(master > 0) || !(incoming > 0)) return 1;
    const candidates = [master / incoming, master / (incoming * 2), master / (incoming / 2)];
    const nearest = candidates.reduce((best, value) => Math.abs(value - 1) < Math.abs(best - 1) ? value : best, candidates[0]);
    return Math.abs(nearest - 1) <= Math.abs(Number(limit)) ? nearest : 1;
  }

  function gridDelaySeconds(currentTime, bpm, beatOffset = 0, beatsPerBar = 4, maxDelay = 3.2) {
    const tempo = Number(bpm);
    const now = Number(currentTime);
    if (!(tempo > 0) || !(now >= 0)) return 0;
    const beatSeconds = 60 / tempo;
    const grid = Math.max(1, Math.round(Number(beatsPerBar) || 4));
    const elapsedBeats = Math.max(0, (now - Number(beatOffset || 0)) / beatSeconds);
    let nextBeat = Math.ceil((elapsedBeats + .02) / grid) * grid;
    let delay = Number(beatOffset || 0) + nextBeat * beatSeconds - now;
    if (delay < .035) delay += grid * beatSeconds;
    if (delay > Number(maxDelay || 3.2)) {
      nextBeat = Math.ceil(elapsedBeats + .02);
      delay = Number(beatOffset || 0) + nextBeat * beatSeconds - now;
    }
    return Math.max(0, delay);
  }

  function phaseAlignedTime(targetTime, masterTime, masterBpm, targetBpm) {
    const target = Math.max(0, Number(targetTime) || 0);
    const master = Math.max(0, Number(masterTime) || 0);
    const masterBeat = 60 / Number(masterBpm);
    const targetBeat = 60 / Number(targetBpm);
    if (!Number.isFinite(masterBeat) || !Number.isFinite(targetBeat) || masterBeat <= 0 || targetBeat <= 0) return target;
    const phase = ((master % masterBeat) + masterBeat) % masterBeat / masterBeat;
    const desiredRemainder = phase * targetBeat;
    const beatIndex = Math.round((target - desiredRemainder) / targetBeat);
    return Math.max(0, beatIndex * targetBeat + desiredRemainder);
  }

  function validDeckCommand(command) {
    if (!command || typeof command !== 'object') return false;
    if (!['load', 'sync', 'takeover', 'set-volume', 'set-rate', 'transport', 'fade', 'stop', 'state'].includes(command.action)) return false;
    if (['load', 'sync', 'takeover'].includes(command.action) && typeof command.key !== 'string') return false;
    if (command.action === 'fade' && !['in', 'out'].includes(command.direction)) return false;
    if (command.action === 'transport' && !['play', 'pause', 'toggle', 'seek', 'restart'].includes(command.transport)) return false;
    return true;
  }

  return { clamp, equalPower, safePlaybackRate, gridDelaySeconds, phaseAlignedTime, validDeckCommand };
});
