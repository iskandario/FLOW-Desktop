const assert = require('node:assert/strict');
const test = require('node:test');
const { equalPower, safePlaybackRate, gridDelaySeconds, phaseAlignedTime, validDeckCommand } = require('../shared/mix-math.js');

test('equal-power curve starts and ends on the correct deck', () => {
  assert.deepEqual(equalPower(0), { outgoing: 1, incoming: 0 });
  const end = equalPower(1);
  assert.ok(end.outgoing < 1e-12);
  assert.equal(end.incoming, 1);
});

test('equal-power midpoint preserves total power', () => {
  const middle = equalPower(.5);
  assert.ok(Math.abs(middle.outgoing ** 2 + middle.incoming ** 2 - 1) < 1e-12);
});

test('playback rate is only changed inside the safe range', () => {
  assert.ok(Math.abs(safePlaybackRate(120, 124) - 120 / 124) < 1e-12);
  assert.equal(safePlaybackRate(90, 140), 1);
  assert.equal(safePlaybackRate(0, 120), 1);
});

test('transition waits for the next four-beat boundary', () => {
  assert.ok(Math.abs(gridDelaySeconds(11.25, 120, 0, 4) - .75) < 1e-9);
  assert.ok(gridDelaySeconds(12, 120, 0, 4) > 1.9);
});

test('slow grids fall back to the next beat when a bar is too far away', () => {
  const delay = gridDelaySeconds(1.01, 60, 0, 4, 2);
  assert.ok(delay > .9 && delay < 1.1);
});

test('phase alignment keeps the target close while matching beat phase', () => {
  const aligned = phaseAlignedTime(10.1, 9.25, 120, 125);
  assert.ok(Math.abs(aligned - 10.32) < .001);
  assert.equal(phaseAlignedTime(4, 5, 0, 120), 4);
});

test('deck commands reject malformed input', () => {
  assert.equal(validDeckCommand({ action: 'sync', key: 'vk:1_2' }), true);
  assert.equal(validDeckCommand({ action: 'fade', direction: 'in' }), true);
  assert.equal(validDeckCommand({ action: 'fade', direction: 'sideways' }), false);
  assert.equal(validDeckCommand({ action: 'takeover' }), false);
});
