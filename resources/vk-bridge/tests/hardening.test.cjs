const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const engine = fs.readFileSync(require.resolve('../app/engine.js'), 'utf8');
test('failed stem loading releases all created sources', () => {
  assert.match(engine, /catch\(error\)\{this\.destroyStems\(\);throw error\}/);
});
test('original audio remains live until every playing stem has started', () => {
  const start = engine.indexOf("if(wasPlaying)await Promise.all");
  const mute = engine.indexOf("this.originalGain.gain.setTargetAtTime(0", start);
  assert.ok(start >= 0 && mute > start);
  assert.match(engine, /Browser blocked stem playback; press the stem pad again/);
});
test('production resume does not install the distortion-prone SoundTouch worklet', () => {
  assert.match(engine, /this\.audioRuntimePromise\|\|=Promise\.resolve\(false\)/);
  assert.doesNotMatch(engine, /SoundTouchNode\.register\(this\.context/);
});
test('parallel preloads share an in-flight promise', () => {
  assert.match(engine, /if\(this\.preparePromise\)return this\.preparePromise/);
});
test('recovery stops after repeated failures', () => {
  assert.match(engine, /this\.recoveryAttempts>=3/);
  assert.match(engine, /250\*2\*\*\(this\.recoveryAttempts-1\)/);
});
test('stop cancels pending recovery', () => {
  assert.match(engine, /stop\(\)\{this\.running=false;this\.prepareGeneration\+=1;if\(this\.recoveryTimer\)clearTimeout\(this\.recoveryTimer\)/);
});
