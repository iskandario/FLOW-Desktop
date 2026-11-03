(function installFlowVkSource(root) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=';

  function base64Decode(value) {
    if (!value || value.length % 4 === 1) return '';
    let output = '';
    let accumulator = 0;
    let groupIndex = 0;
    for (let cursor = 0; cursor < value.length; cursor += 1) {
      const symbol = value.charAt(cursor);
      const index = alphabet.indexOf(symbol);
      if (index < 0 || index === 64) continue;
      accumulator = groupIndex % 4 ? 64 * accumulator + index : index;
      const shouldEmit = groupIndex % 4;
      groupIndex += 1;
      if (shouldEmit) output += String.fromCharCode(255 & accumulator >> (-2 * groupIndex & 6));
    }
    return output;
  }

  function permutation(length, seed) {
    const result = [];
    let remaining = length;
    let state = Math.abs(Number(seed) || 0);
    while (remaining--) {
      state = (length * (remaining + 1) ^ state + remaining) % length;
      result[remaining] = state;
    }
    return result;
  }

  function shuffle(value, seed) {
    if (!value.length) return value;
    const order = permutation(value.length, seed);
    const chars = value.split('');
    for (let index = 0; ++index < value.length;) {
      chars[index] = chars.splice(order[value.length - 1 - index], 1, chars[index])[0];
    }
    return chars.join('');
  }

  function decodeUrl(value, userId = 0) {
    if (typeof value !== 'string' || !value.includes('audio_api_unavailable')) return value || '';
    const extra = value.split('?extra=')[1];
    if (!extra) return '';
    const [encodedUrl, encodedOps] = extra.split('#');
    let decoded = base64Decode(encodedUrl);
    const operations = base64Decode(encodedOps).split('\t').filter(Boolean);
    const rotate = (input, shift) => input.split('').map(char => {
      const index = alphabet.indexOf(char);
      return index < 0 ? char : alphabet.substr(index - Number(shift), 1);
    }).join('');
    for (let index = operations.length - 1; index >= 0; index -= 1) {
      const parts = operations[index].split('\v');
      const operation = parts.shift();
      if (operation === 'v') decoded = decoded.split('').reverse().join('');
      else if (operation === 'r') decoded = rotate(decoded, parts[0]);
      else if (operation === 's') decoded = shuffle(decoded, parts[0]);
      else if (operation === 'i') decoded = shuffle(decoded, Number(parts[0]) ^ Number(userId || 0));
      else if (operation === 'x') {
        const mask = String(parts[0] || '\0').charCodeAt(0);
        decoded = decoded.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ mask)).join('');
      } else return '';
    }
    return /^https?:\/\//i.test(decoded) ? decoded : '';
  }

  function audioFromFiber(element) {
    const searchProps = source => {
      if (!source || typeof source !== 'object') return null;
      const queue = [{ value: source, depth: 0 }];
      const visited = new WeakSet();
      let inspected = 0;
      while (queue.length && inspected++ < 500) {
        const { value, depth } = queue.shift();
        if (!value || typeof value !== 'object' || visited.has(value)) continue;
        visited.add(value);
        const ownerId = value.owner_id ?? value.ownerId;
        if (value.id != null && ownerId != null && (value.url != null || value.hashes != null || value.actionHash != null || value.access_key != null || value.accessKey != null || value.title != null)) return value;
        if (depth >= 5) continue;
        for (const key of Object.keys(value).slice(0, 80)) {
          if (/^(children|parent|return|child|sibling|stateNode|_owner)$/i.test(key)) continue;
          const child = value[key];
          if (child && typeof child === 'object') queue.push({ value: child, depth: depth + 1 });
        }
      }
      return null;
    };
    for (let node = element; node; node = node.parentElement) {
      const fiberKey = Object.keys(node).find(name => name.startsWith('__reactFiber') || name.startsWith('__reactInternalInstance'));
      let fiber = fiberKey ? node[fiberKey] : null;
      for (let depth = 0; fiber && depth < 18; depth += 1, fiber = fiber.return) {
        const props = fiber.memoizedProps || fiber.pendingProps;
        const audio = props?.track?.entity?.apiAudio
          || props?.episode?.entity?.apiAudio
          || props?.audio?.entity?.apiAudio
          || props?.track?.data?.apiAudio
          || props?.episode?.data?.apiAudio
          || (props?.audio?.id ? props.audio : null)
          || props?.originalAttachment;
        if (audio?.id && (audio.owner_id || audio.ownerId)) return audio;
        const discovered = searchProps(props);
        if (discovered) return discovered;
      }
    }
    return null;
  }

  function infoFromRow(row) {
    let carrier = row;
    for (let depth = 0; carrier && depth < 8 && !carrier.dataset?.audio; depth += 1) carrier = carrier.parentElement;
    const encoded = carrier?.dataset?.audio || row.querySelector?.('[data-audio]')?.dataset.audio;
    if (encoded) {
      try {
        const audio = JSON.parse(encoded);
        if (Array.isArray(audio)) {
          let ids = `${audio[1]}_${audio[0]}`;
          if (audio[13]) {
            const hashes = String(audio[13]).split('/');
            ids += `_${hashes[hashes[1]?.length === 0 ? 2 : 3] || ''}_${hashes[5] || ''}`;
          } else if (audio[24]) ids += `_${audio[24]}`;
          return { ids, url: audio[2] || '', title: audio[3] || '', artist: audio[4] || '' };
        }
      } catch {}
    }
    const reactRow = row.matches?.('[class*="AudioRow__root"],[data-testentitytag="audio"]') ? row : row.querySelector?.('[class*="AudioRow__root"],[data-testentitytag="audio"]') || row;
    const audio = audioFromFiber(reactRow);
    if (!audio) return null;
    const ownerId = audio.owner_id ?? audio.ownerId;
    const accessKey = audio.access_key ?? audio.accessKey ?? '';
    return {
      ids: [ownerId, audio.id, accessKey].filter(value => value !== '').join('_'),
      url: audio.url || '',
      title: audio.title || '',
      artist: audio.artist || ''
    };
  }

  function identityFromRow(row) {
    let carrier = row;
    for (let depth = 0; carrier && depth < 9 && !carrier.dataset?.audio; depth += 1) carrier = carrier.parentElement;
    const encoded = carrier?.dataset?.audio || row?.querySelector?.('[data-audio]')?.dataset?.audio || '';
    if (encoded) {
      try {
        const tuple = JSON.parse(encoded);
        if (Array.isArray(tuple) && Number.isFinite(Number(tuple[0])) && Number.isFinite(Number(tuple[1]))) {
          const hashes = String(tuple[13] || '').split('/');
          return { id: Number(tuple[0]), ownerId: Number(tuple[1]), directUrl: String(tuple[2] || ''), title: String(tuple[3] || ''), artist: String(tuple[4] || ''), actionHash: hashes[2] || '', urlHash: hashes[5] || '', accessKey: String(tuple[24] || '') };
        }
      } catch {}
    }
    const reactRow = row.matches?.('[class*="AudioRow__root"],[data-testentitytag="audio"]') ? row : row.querySelector?.('[class*="AudioRow__root"],[data-testentitytag="audio"]') || row;
    const audio = audioFromFiber(reactRow);
    if (!audio?.id || !(audio.owner_id ?? audio.ownerId)) return null;
    const hashes = String(audio.hashes || '').split('/');
    return { id: Number(audio.id), ownerId: Number(audio.owner_id ?? audio.ownerId), directUrl: String(audio.url || ''), title: String(audio.title || ''), artist: String(audio.artist || ''), actionHash: audio.actionHash || hashes[2] || '', urlHash: audio.urlHash || hashes[5] || '', accessKey: String(audio.access_key ?? audio.accessKey ?? '') };
  }

  function currentUserId() {
    const headMatch = document.head?.textContent?.match(/\bid:\s?(\d+)/);
    const cookieMatch = document.cookie.match(/(?:^|;\s*)remixmid=(\d+)/);
    return Number(root.vk?.id || root.cur?.oid || root.cur?.user_id || headMatch?.[1] || cookieMatch?.[1] || document.body?.dataset?.userId || 0);
  }

  function findAudioTuple(payload, ownerId, audioId) {
    const stack = [payload];
    let fallback = null;
    let visited = 0;
    while (stack.length && visited++ < 8000) {
      const value = stack.pop();
      if (!value || typeof value !== 'object') continue;
      if (Array.isArray(value) && typeof value[2] === 'string' && (/^https?:/i.test(value[2]) || value[2].includes('audio_api_unavailable'))) {
        if (String(value[1]) === String(ownerId) && String(value[0]) === String(audioId)) return value;
        fallback ||= value;
      }
      for (const child of Array.isArray(value) ? value : Object.values(value)) {
        if (child && typeof child === 'object') stack.push(child);
      }
    }
    return fallback;
  }

  function withTimeout(promise, milliseconds, message) {
    let timer;
    return Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), milliseconds); })
    ]).finally(() => clearTimeout(timer));
  }

  async function reloadIdentity(identity) {
    const ownerId = Number(identity?.ownerId ?? identity?.owner_id);
    const audioId = Number(identity?.id);
    if (!Number.isFinite(ownerId) || !Number.isFinite(audioId)) throw new Error('Некорректный VK ID трека');
    const accessKey = identity?.accessKey || identity?.access_key || '';
    // VK marks tracks it won't stream to this listener (region locks, often
    // tripped by a VPN) with content_restricted and an empty url.
    let restricted = 0;
    if (root.vkApi?.api) {
      try {
        const response = await root.vkApi.api('audio.getById', { audios: [ownerId, audioId, accessKey].filter(value => value !== '').join('_'), v: '5.204' });
        const audio = Array.isArray(response) ? response.find(item => item?.url) : null;
        if (audio?.url) return [audioId, ownerId, audio.url, audio.title || identity.title || '', audio.artist || identity.artist || ''];
        restricted = Number((Array.isArray(response) ? response[0] : null)?.content_restricted || 0);
      } catch {}
    }
    const unavailable = () => new Error('VK не даёт слушать этот трек в твоём регионе — возможно, мешает включённый VPN');
    const ids = [ownerId, audioId, identity?.actionHash || '', identity?.urlHash || ''].join('_');
    if (root.ajax?.promisifiedPost) {
      // VK's ajax rejects with a bare string such as "bad_hash", not an Error.
      const response = await withTimeout(root.ajax.promisifiedPost('al_audio.php', { act: 'reload_audio', ids, al: 1 }), 15000, 'VK ajax reload_audio timeout')
        .catch(error => { throw restricted ? unavailable() : (error instanceof Error ? error : new Error(`VK ответил: ${String(error)}`)); });
      const tuple = findAudioTuple(response, ownerId, audioId);
      if (tuple) return tuple;
    }
    if (restricted) throw unavailable();
    const body = new URLSearchParams({ al: '1', act: 'reload_audio', ids });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch('/al_audio.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: body.toString(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`VK al_audio.php ответил HTTP ${response.status}`);
    const text = (await response.text()).replace(/^\s*<!--\s*/, '');
    const tuple = findAudioTuple(JSON.parse(text), ownerId, audioId);
    if (!tuple) throw new Error('VK al_audio.php не вернул трек');
    return tuple;
  }

  async function resolveIdentity(identity) {
    const ownerId = Number(identity?.ownerId ?? identity?.owner_id);
    const audioId = Number(identity?.id);
    const userId = currentUserId();
    let url = decodeUrl(identity?.directUrl || identity?.url || '', userId);
    let tuple = null;
    if (!url) {
      try { tuple = await reloadIdentity(identity); }
      catch (error) { return { ok: false, stage: 'reload_audio', error: error?.message || `[reload_audio] ${String(error)}` }; }
      url = decodeUrl(tuple?.[2] || tuple?.url || '', userId);
    }
    if (!url) return { ok: false, stage: 'decode', error: '[decode] VK вернул защищённый поток, который не удалось декодировать' };
    return {
      ok: true,
      stage: 'ready',
      mediaUrl: url,
      format: /\.m3u8(?:[?#]|$)/i.test(url) ? 'hls' : 'file',
      title: tuple?.[3] || tuple?.title || identity?.title || '',
      artist: tuple?.[4] || tuple?.artist || identity?.artist || '',
      ownerId,
      id: audioId
    };
  }

  async function reloadAudio(ids) {
    if (!ids || ids.startsWith('undefined_')) return null;
    const shortId = ids.split('_').length < 4;
    const body = new URLSearchParams({ al: '1', act: shortId ? 'reload_audios' : 'reload_audio' });
    body.set(shortId ? 'audio_ids' : 'ids', ids);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch('/music', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body: body.toString(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`VK /music ответил HTTP ${response.status}`);
    const text = (await response.text()).replace(/^\s*<!--\s*/, '');
    const json = JSON.parse(text);
    const [expectedOwner, expectedId] = ids.split('_');
    const stack = [json?.payload ?? json];
    let fallback = null;
    let visited = 0;
    while (stack.length && visited++ < 6000) {
      const value = stack.pop();
      if (!value || typeof value !== 'object') continue;
      if (Array.isArray(value) && typeof value[2] === 'string' && (/^https?:/i.test(value[2]) || value[2].includes('audio_api_unavailable'))) {
        if (String(value[1]) === expectedOwner && String(value[0]) === expectedId) return value;
        fallback ||= value;
      }
      for (const child of Array.isArray(value) ? value : Object.values(value)) {
        if (child && typeof child === 'object') stack.push(child);
      }
    }
    return fallback;
  }

  async function resolve(key) {
    const row = [...document.querySelectorAll('[data-flow-key]')].find(node => node.dataset.flowKey === key);
    if (!row) return { ok: false, stage: 'row', error: '[row] Строка трека исчезла из VK' };
    row.scrollIntoView({ block: 'center', inline: 'nearest' });
    const info = infoFromRow(row);
    if (!info?.ids) return { ok: false, stage: 'metadata', error: '[metadata] В строке нет data-audio и подходящего React apiAudio' };
    const userId = currentUserId();
    let url = decodeUrl(info.url, userId);
    let track = null;
    if (!url) {
      try {
        track = await reloadAudio(info.ids);
      } catch (error) {
        return { ok: false, stage: 'request', ids: info.ids, userId, error: `[request] ${error.message}` };
      }
      if (!track) return { ok: false, stage: 'payload', ids: info.ids, userId, error: '[payload] VK /music вернул ответ без массива трека' };
      url = decodeUrl(track[2], userId);
    }
    if (!url) return { ok: false, stage: 'decode', ids: info.ids, userId, protectedUrl: String(track?.[2] || info.url || '').includes('audio_api_unavailable'), error: '[decode] Получен защищённый URL, но операции VK не декодировались' };
    return {
      ok: true,
      stage: 'ready',
      mediaUrl: url,
      ids: info.ids,
      userId,
      source: info.url ? 'fiber-or-row' : 'reload-audio',
      format: /\.m3u8(?:[?#]|$)/i.test(url) ? 'hls' : 'file',
      title: track?.[3] || info.title,
      artist: track?.[4] || info.artist
    };
  }

  const api = { base64Decode, decodeUrl, infoFromRow, identityFromRow, findAudioTuple, resolveIdentity, resolve };
  root.__flowVkSource = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
