const assert = require('node:assert/strict');
const test = require('node:test');
const { decodeUrl, infoFromRow, findAudioTuple, resolveIdentity, resolve } = require('../page-source.js');

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=';
function encode64(value) {
  const bytes = Buffer.from(value, 'binary');
  let output = '';
  for (let offset = 0; offset < bytes.length; offset += 3) {
    const a = bytes[offset];
    const b = bytes[offset + 1];
    const c = bytes[offset + 2];
    output += alphabet[a >> 2];
    output += alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)];
    output += b === undefined ? '=' : alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)];
    output += c === undefined ? '=' : alphabet[c & 63];
  }
  return output;
}

function protectedUrl(data, operations) {
  return `https://vk.com/audio_api_unavailable?extra=${encode64(data)}#${encode64(operations)}`;
}

function permutation(length, seed) {
  const result = [];
  let state = Math.abs(Number(seed));
  for (let cursor = length - 1; cursor >= 0; cursor -= 1) {
    state = (length * (cursor + 1) ^ state + cursor) % length;
    result[cursor] = state;
  }
  return result;
}

function inverseShuffle(value, seed) {
  const chars = value.split('');
  const order = permutation(chars.length, seed);
  for (let index = chars.length - 1; index >= 1; index -= 1) {
    const other = order[chars.length - 1 - index];
    [chars[index], chars[other]] = [chars[other], chars[index]];
  }
  return chars.join('');
}

test('ordinary signed media URLs are preserved', () => {
  const url = 'https://psv4.userapi.com/audio/example/index.m3u8?extra=1';
  assert.equal(decodeUrl(url, 42), url);
});

test('malformed protected URLs fail closed', () => {
  assert.equal(decodeUrl('https://vk.com/audio_api_unavailable', 42), '');
});

test('protected URL reverse operation decodes to a playable URL', () => {
  const expected = 'https://psv.example/audio.m3u8?token=abc';
  assert.equal(decodeUrl(protectedUrl([...expected].reverse().join(''), 'v'), 42), expected);
});

test('protected URL xor operation decodes to a playable URL', () => {
  const expected = 'https://psv.example/audio.mp3?token=abc';
  const mask = 'K'.charCodeAt(0);
  const encoded = [...expected].map(char => String.fromCharCode(char.charCodeAt(0) ^ mask)).join('');
  assert.equal(decodeUrl(protectedUrl(encoded, `x\vK`), 42), expected);
});

test('protected URL rotation operation decodes to a playable URL', () => {
  const expected = 'https://psv.example/audio.mp3?token=rotation';
  const shift = 11;
  const encoded = [...expected].map(char => {
    const index = alphabet.indexOf(char);
    return index < 0 ? char : alphabet[(index + shift) % alphabet.length];
  }).join('');
  assert.equal(decodeUrl(protectedUrl(encoded, `r\v${shift}`), 42), expected);
});

test('protected URL shuffle and user-bound shuffle decode correctly', () => {
  const expected = 'https://psv.example/audio/index.m3u8?token=shuffle';
  const seed = 7123;
  assert.equal(decodeUrl(protectedUrl(inverseShuffle(expected, seed), `s\v${seed}`), 42), expected);
  assert.equal(decodeUrl(protectedUrl(inverseShuffle(expected, seed ^ 42), `i\v${seed}`), 42), expected);
});

test('classic VK data-audio metadata yields reload_audio ids', () => {
  const audio = [];
  audio[0] = 456;
  audio[1] = 123;
  audio[2] = '';
  audio[3] = 'Track';
  audio[4] = 'Artist';
  audio[13] = '//actionHash/unused/unused/urlHash';
  const row = { dataset: { audio: JSON.stringify(audio) }, parentElement: null, querySelector: () => null };
  const info = infoFromRow(row);
  assert.equal(info.ids, '123_456_actionHash_urlHash');
  assert.equal(info.title, 'Track');
});

test('metadata lookup walks from an inner row to the data-audio carrier', () => {
  const audio = [];
  audio[0] = 9;
  audio[1] = 7;
  audio[24] = 'access';
  const carrier = { dataset: { audio: JSON.stringify(audio) }, parentElement: null };
  const inner = { dataset: {}, parentElement: carrier, querySelector: () => null };
  assert.equal(infoFromRow(inner).ids, '7_9_access');
});

test('VK ajax reload response is searched by owner and audio id', () => {
  const expected = [456, 123, 'https://psv.example/audio.m3u8'];
  assert.equal(findAudioTuple([0, [[999, 1, 'https://wrong'], expected]], 123, 456), expected);
});

test('identity resolver uses the same al_audio ajax route as VK Music Saver', async () => {
  const previousWindow = global.window;
  const previousDocument = global.document;
  global.document = { head: { textContent: '' }, body: { dataset: {} }, cookie: '' };
  global.window = global;
  global.ajax = {
    promisifiedPost: async (endpoint, body) => {
      assert.equal(endpoint, 'al_audio.php');
      assert.equal(body.act, 'reload_audio');
      assert.equal(body.ids, '123_456_action_url');
      return [[456, 123, 'https://psv.example/audio/index.m3u8?token=real', 'Track', 'Artist']];
    }
  };
  try {
    const result = await resolveIdentity({ ownerId: 123, id: 456, actionHash: 'action', urlHash: 'url' });
    assert.equal(result.ok, true);
    assert.equal(result.format, 'hls');
  } finally {
    delete global.ajax;
    global.window = previousWindow;
    global.document = previousDocument;
  }
});

test('full VK resolver path posts ids and returns a decoded deck URL', async () => {
  const expected = 'https://psv.example/audio/index.m3u8?token=integrated';
  const encodedUrl = protectedUrl([...expected].reverse().join(''), 'v');
  const audio = [];
  audio[0] = 456;
  audio[1] = 123;
  audio[3] = 'Track';
  audio[4] = 'Artist';
  audio[13] = '//actionHash/unused/unused/urlHash';
  const row = {
    dataset: { flowKey: 'vk:123_456', audio: JSON.stringify(audio) },
    parentElement: null,
    querySelector: () => null,
    scrollIntoView: () => {}
  };
  const previousDocument = global.document;
  const previousFetch = global.fetch;
  let postedBody = '';
  global.document = {
    querySelectorAll: selector => selector === '[data-flow-key]' ? [row] : [],
    head: { textContent: 'window.vk = { id: 42 }' },
    body: { dataset: {} },
    cookie: ''
  };
  global.fetch = async (url, options) => {
    assert.equal(url, '/music');
    postedBody = options.body;
    return {
      ok: true,
      text: async () => JSON.stringify({ payload: [0, [[[456, 123, encodedUrl, 'Track', 'Artist']]]] })
    };
  };
  try {
    const result = await resolve('vk:123_456');
    assert.equal(result.ok, true);
    assert.equal(result.mediaUrl, expected);
    assert.equal(result.stage, 'ready');
    assert.match(postedBody, /act=reload_audio/);
    assert.match(postedBody, /ids=123_456_actionHash_urlHash/);
  } finally {
    global.document = previousDocument;
    global.fetch = previousFetch;
  }
});
