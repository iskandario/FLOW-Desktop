const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('manifest.json'));
const core=require('../app/engine.js');

test('v6 packages the hybrid VK bridge and autonomous app',()=>{
  assert.equal(manifest.version,'7.1.2');
  assert.ok(manifest.web_accessible_resources[0].resources.includes('app/*'));
  for(const file of ['app/index.html','app/styles.css','app/engine.js','app/app.js','page-source.js'])assert.ok(fs.existsSync(path.join(root,file)),file);
});

test('content bridge resolves authenticated VK tracks for the app',()=>{
  const content=read('content.js');
  assert.match(content,/flow:resolve-track/);
  assert.match(content,/flow-resolve-audio/);
  assert.match(content,/flow:resolved-track/);
  assert.match(content,/await resolveItem\(message\.key\)/);
});

test('app uses its own two-deck engine rather than native VK transport',()=>{
  const app=read('app/app.js'),engine=read('app/engine.js'),content=read('content.js'),popup=read('popup.js');
  assert.match(app,/flow:library/);
  assert.match(app,/resolveRemoteTrack/);
  assert.match(engine,/class FlowEngine/);
  assert.match(engine,/setValueCurveAtTime/);
  assert.doesNotMatch(app,/flow:native-control|trusted-play/);
  assert.match(content,/LEGACY_NATIVE_ENGINE = false/);
  assert.doesNotMatch(popup,/flow-start-dual-session/);
});

test('equal-power crossfade preserves total power',()=>{
  for(let index=0;index<=100;index++){const gain=core.equalPower(index/100);assert.ok(Math.abs(gain.a**2+gain.b**2-1)<1e-9)}
});

test('route planner keeps every track',()=>{
  const input=[{id:'a',bpm:100,energy:.2},{id:'b',bpm:122,energy:.6},{id:'c',bpm:128,energy:.9}];
  assert.deepEqual(new Set(core.buildRoute(input,'rise').map(track=>track.id)),new Set(['a','b','c']));
});

test('bar scheduler aligns transitions to the next musical bar',()=>{
  assert.ok(Math.abs(core.secondsToNextBar(1.1,120,0)-.9)<1e-9);
  assert.equal(core.secondsToNextBar(2,120,0),0);
});

test('streaming beat tracker learns a stable 120 BPM pulse',()=>{
  const tracker=new core.StreamingBeatTracker();
  for(let time=0;time<8;time+=.05){const phase=time%.5;tracker.push(time,phase<.06?.8:.12,.2)}
  const result=tracker.result();assert.ok(Math.abs(result.bpm-120)<=2);assert.ok(result.confidence>.3);
});

test('network tracks are streamed and never materialized as full blobs',()=>{
  const engine=read('app/engine.js'),offscreen=read('offscreen.js');
  assert.match(engine,/track\.resolveUrl/);
  assert.match(engine,/new Hls/);
  assert.doesNotMatch(engine,/response\.blob\(\)/);
  assert.doesNotMatch(offscreen,/response\.blob\(\)/);
});

test('okcdn audio is fetched with extension permission and streamed through MSE',()=>{
  const engine=read('app/engine.js');
  assert.ok(manifest.host_permissions.includes('https://*.okcdn.ru/*'));
  assert.match(engine,/class ExtensionMediaStream/);
  assert.match(engine,/response\.body\.getReader\(\)/);
  assert.match(engine,/addSourceBuffer\(mime\)/);
  assert.doesNotMatch(engine,/response\.arrayBuffer\(\)|response\.blob\(\)/);
});

test('manual DJ surface exposes sync, pitch, EQ and vocal-frequency kill',()=>{
  const html=read('app/index.html'),engine=read('app/engine.js');
  assert.match(html,/data-action="sync"/);
  assert.match(html,/id="pitchA"/);
  assert.match(html,/id="lowA"/);
  assert.match(html,/VOCAL EQ · NOT STEMS/);
  assert.match(engine,/syncDeck\(deck\)/);
  assert.match(engine,/setDeckEq\(deck,band,value\)/);
});

test('v6 packages a local four-stem WebGPU runtime',()=>{
  const html=read('app/index.html'),app=read('app/app.js'),engine=read('app/engine.js'),stems=read('stems/flow-stems.js');
  assert.ok(fs.existsSync(path.join(root,'stems/assets/ort-wasm-simd-threaded.asyncify-AkdHdxrx.wasm')));
  assert.match(html,/STEM PADS/);
  assert.match(app,/separateDeck\(deckName(?:,desiredMode=.*)?\)/);
  assert.match(app,/import\(url\)/);
  assert.match(engine,/loadStems\(stemFiles\)/);
  assert.match(engine,/setStemGain\(name,value\)/);
  assert.match(engine,/NEURAL STEM MIX/);
  assert.match(stems,/demucs/i);
  assert.match(stems,/new URL\("assets\/ort-wasm/);
  assert.match(stems,/export\{/);
  assert.match(read('content.js'),/allow="autoplay"/);
  assert.doesNotMatch(read('content.js'),/allow="[^"]*webgpu/);
  assert.ok(manifest.host_permissions.includes('https://huggingface.co/*'));
});

test('v7 packages real BPM, native key-lock, and fast MDX stems',()=>{
  const html=read('app/index.html'),app=read('app/app.js'),engine=read('app/engine.js');
  for(const file of ['vendor/flow-audio-libs.js','vendor/soundtouch-processor.js','stems/flow-mdx-stems.js','stems/flow-mdx-worker.js'])assert.ok(fs.existsSync(path.join(root,file)),file);
  assert.match(html,/flow-audio-libs\.js/);
  assert.match(engine,/analyseTrack\(track\)/);
  assert.doesNotMatch(engine,/SoundTouchNode\.register\(this\.context/);
  assert.match(engine,/this\.audio\.preservesPitch=true/);
  assert.match(engine,/enableSoundTouch/);
  assert.match(app,/separateTwoStem/);
  assert.match(read('vendor/flow-audio-libs.js'),/analyzeBeatGrid/);
  assert.match(read('stems/flow-mdx-stems.js'),/new Worker\(/);
  assert.match(read('stems/flow-mdx-worker.js'),/web-audio-separation/);
});

test('v7 packages a CSP-safe local stem runtime and compact mashup console',()=>{
  const html=read('app/index.html'),app=read('app/app.js'),mdx=read('stems/flow-mdx-worker.js');
  assert.match(html,/pro-v7\.css/);
  assert.match(html,/id="mashup"/);
  assert.match(app,/async function makeMashup/);
  assert.match(mdx,/ort-1\.29\.0/);
  assert.match(mdx,/new URL\("\.\/assets\/ort-1\.29\.0\/", import\.meta\.url\)/);
  assert.doesNotMatch(mdx,/import\(["']https:\/\//);
  for(const file of ['stems/assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.mjs','stems/assets/ort-1.29.0/ort-wasm-simd-threaded.jsep.wasm','stems/assets/ort-1.29.0/ort-wasm-simd-threaded.mjs','stems/assets/ort-1.29.0/ort-wasm-simd-threaded.wasm'])assert.ok(fs.existsSync(path.join(root,file)),file);
});

test('v7 discovers current VK data-audio rows and starts a throttled deep scan',()=>{
  const content=read('content.js'),app=read('app/app.js');
  assert.match(content,/querySelectorAll\('\.audio_row,\[data-audio\]/);
  assert.match(content,/identity\?\.title/);
  assert.match(content,/message\.automatic/);
  assert.match(app,/flow:deep-scan',automatic:true/);
});

test('FLOW launched outside VK Music navigates there and reopens automatically',()=>{
  const content=read('content.js');
  assert.match(content,/function isVkMusicPage\(\)/);
  assert.match(content,/flowAutoOpenOnMusic/);
  assert.match(content,/location\.assign\(`\$\{location\.origin\}\/audio`\)/);
  assert.match(content,/setTimeout\(openFlow, 450\)/);
});
