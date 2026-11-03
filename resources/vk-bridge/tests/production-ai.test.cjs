const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('production build contains the verified local MDX model and runtime',()=>{
  const model=fs.readFileSync(path.join(root,'stems/models/UVR-MDX-NET-Inst_HQ_3.onnx'));
  assert.equal(model.byteLength,66759214);
  assert.equal(crypto.createHash('sha256').update(model).digest('hex'),'317554b07fe1ea5279a77f2b1520a41ea4b93432560c4ffd08792c30fddf9adc');
  const mdx=read('stems/flow-mdx-worker.js');
  assert.match(mdx,/models\/UVR-MDX-NET-Inst_HQ_3\.onnx/);
  assert.match(mdx,/executionProviders: \["wasm"\]/);
  assert.match(mdx,/createSeparator|function g\(/);
  assert.match(mdx,/Object\.defineProperty\([^,]+\.wasm,\s*["']wasmPaths["']/);
  assert.match(mdx,/ort-wasm-simd-threaded\.jsep\.mjs/);
  assert.match(mdx,/ort-wasm-simd-threaded\.jsep\.wasm/);
  assert.match(mdx,/set:\s*\(\)\s*=>\s*void 0|set:\s*\(\)\s*=>\s*undefined/);
});

test('stems are precomputed one at a time and persist across sessions',()=>{
  const app=read('app/app.js'),cache=read('app/stem-cache.js'),html=read('app/index.html');
  assert.match(app,/stemWorkerRunning/);
  assert.match(app,/entry=await scheduleStems\(track,true\)/);
  assert.doesNotMatch(app,/LIVE STEMS NOW/);
  assert.match(app,/FlowStemCache\.put\(track,result\.stems\)/);
  assert.match(cache,/indexedDB\.open/);
  assert.match(cache,/MAX_ENTRIES=6/);
  assert.match(html,/stem-cache\.js/);
});

test('neural FFT and inference run outside the audio and UI thread',()=>{
  const bridge=read('stems/flow-mdx-stems.js'),worker=read('stems/flow-mdx-worker.js');
  assert.match(bridge,/new Worker\(/);
  assert.match(bridge,/postMessage\(/);
  assert.match(worker,/web-audio-separation/);
  assert.match(worker,/MDX INST HQ 3/);
});

test('high-confidence BPM grid and compact waveform ship in the app',()=>{
  const html=read('app/index.html'),engine=read('app/engine.js'),css=read('app/pro-v7.css');
  assert.match(html,/flow-beat-grid\.js/);
  assert.match(engine,/FlowBeatGrid\?\.analyzeBuffer/);
  assert.match(read('vendor/flow-beat-grid.js'),/@audio\/beat/);
  assert.match(css,/height:132px!important;min-height:132px!important;max-height:132px!important;flex:0 0 132px!important/);
});

test('stem controls are always visible inside both deck cards',()=>{
  const html=read('app/index.html'),css=read('app/pro-v7.css');
  assert.equal((html.match(/class="deck-stems"/g)||[]).length,2);
  assert.equal((html.match(/aria-label="Deck [AB] visible stem modes"/g)||[]).length,2);
  assert.match(css,/\.deck-stems\{grid-column:1\/-1!important;display:grid!important/);
});

test('VK collection receives queued persistent BPM analysis',()=>{
  const app=read('app/app.js'),cache=read('app/stem-cache.js');
  assert.match(app,/pending\.forEach\(\(track,index\)=>setTimeout\(\(\)=>scheduleBpm/);
  assert.match(app,/engine\.analyseTrack\(track\)/);
  assert.match(cache,/getAnalysis/);
  assert.match(cache,/putAnalysis/);
  assert.match(cache,/indexedDB\.open\(DB_NAME,2\)/);
});
