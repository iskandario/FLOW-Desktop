(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const engine = new FlowCore.FlowEngine();
  const tracks = [];
  let lastState = null;
  let toastTimer = null;
  const colors = ['#7c5cff','#43cfff','#59f0c5','#e7ff58','#ff758e','#ffad66'];
  const pendingResolutions = new Map();
  let stemsModulePromise=null,mdxModulePromise=null,stemsBusy=false,stemWorkerRunning=false,bpmWorkerRunning=false;
  const stemJobs=new Map(),stemQueue=[];
  const bpmQueued=new Set(),bpmQueue=[];
  const stemNames=['vocal','other'];
  const quickStemMode={a:'all',b:'all'};
  function showQuickStemMode(deck,mode){quickStemMode[deck]=mode;document.querySelectorAll(`[data-quick-deck="${deck}"] [data-quick-mode]`).forEach(button=>{const active=button.dataset.quickMode===mode;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active))})}
  function applyQuickStemMode(deck,mode){const channel=engine.decks[deck];if(!channel?.stemMode)throw new Error('Activate live or AI stems first');if(channel.stemMode==='live'){channel.setLiveStemMode(mode);showQuickStemMode(deck,mode);return}const useOriginal=mode==='all';channel.originalGain.gain.setTargetAtTime(useOriginal?1:0,engine.context.currentTime,.012);for(const stem of stemNames){const enabled=!useOriginal&&(mode==='vocal'?stem==='vocal':stem!=='vocal');engine.setStemGain(deck,stem,enabled?1:0)}document.querySelectorAll(`[data-stem-deck="${deck}"] [data-stem-gain]`).forEach(input=>{const enabled=!useOriginal&&(mode==='vocal'?input.dataset.stemGain==='vocal':input.dataset.stemGain!=='vocal');input.value=enabled?'1':'0'});document.querySelectorAll(`[data-stem-deck="${deck}"] [data-stem-solo]`).forEach(button=>button.classList.remove('solo'));showQuickStemMode(deck,mode)}

  function stemsModule(){if(!stemsModulePromise){const url=new URL('../stems/flow-stems.js',location.href).href;stemsModulePromise=import(url)}return stemsModulePromise}
  function mdxModule(){if(!mdxModulePromise){const url=new URL('../stems/flow-mdx-stems.js',location.href).href;mdxModulePromise=import(url)}return mdxModulePromise}
  function setStemProgress(percent,label){$('#stemProgressBar').style.width=`${FlowCore.clamp(Number(percent||0),0,100)}%`;if(label)$('#stemProgress').textContent=label}
  function stemKey(track){return globalThis.FlowStemCache?.keyFor(track)||track?.id||''}
  function setDeckStemState(deck,state,label){const root=document.querySelector(`[data-stem-deck="${deck}"]`),button=root?.querySelector('.separate-stems');if(root)root.dataset.aiState=state;if(button&&label)button.textContent=label;root?.classList.toggle('ready',state==='ready')}
  async function cachedStems(track){try{return await globalThis.FlowStemCache?.get(track)||null}catch(error){console.warn('Stem cache read failed',error);return null}}
  async function runStemWorker(){
    if(stemWorkerRunning)return;stemWorkerRunning=true;
    try{while(stemQueue.length){
      const job=stemQueue.shift(),{track,key}=job;
      try{
        let entry=await cachedStems(track);
        if(!entry){
          $('#stemStatus').textContent='AI PREPARING IN BACKGROUND';setStemProgress(2,`READING ${track.title}`);
          const bytes=await trackBytes(track),module=await mdxModule();
          const result=await module.separateTwoStem(new Blob([bytes],{type:track.file?.type||'audio/mpeg'}),progress=>{const percent=Number(progress?.percent??(progress?.fraction!=null?progress.fraction*100:8));setStemProgress(percent,`${track.title} · ${progress?.message||progress?.stage||'MDX'}`);for(const deck of ['a','b'])if(engine.decks[deck]?.track===track)setDeckStemState(deck,'processing',`${Math.max(1,Math.round(percent))}%`) });
          entry=await globalThis.FlowStemCache.put(track,result.stems);
        }
        setStemProgress(100,`${track.title} · AI STEMS CACHED`);$('#stemStatus').textContent='INSTANT STEM PADS READY';
        for(const deck of ['a','b'])if(engine.decks[deck]?.track===track)setDeckStemState(deck,'ready','AI READY');
        job.resolve(entry);
      }catch(error){console.error('Background stems failed',error);for(const deck of ['a','b'])if(engine.decks[deck]?.track===track)setDeckStemState(deck,'error','RETRY AI');job.reject(error)}finally{stemJobs.delete(key)}
    }}finally{stemWorkerRunning=false}
  }
  function scheduleStems(track,priority=false){
    if(!track)return Promise.reject(new Error('No track to analyze'));
    const key=stemKey(track),existing=stemJobs.get(key);if(existing)return existing.promise;
    let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no}),job={key,track,resolve,reject,promise};stemJobs.set(key,job);priority?stemQueue.unshift(job):stemQueue.push(job);queueMicrotask(runStemWorker);return promise;
  }
  async function primeDeckStems(deck,track){
    if(!track)return;const hit=await cachedStems(track);if(engine.decks[deck]?.track!==track)return;
    if(hit){setDeckStemState(deck,'ready','AI READY');return}
    setDeckStemState(deck,'queued','AI QUEUED');scheduleStems(track).then(()=>{if(engine.decks[deck]?.track===track)setDeckStemState(deck,'ready','AI READY')}).catch(error=>{if(engine.decks[deck]?.track===track)setDeckStemState(deck,'error','RETRY AI');console.warn(error)})
  }
  async function activateQuickStems(deckName,desiredMode){
    const deck=engine.decks[deckName],track=deck?.track,sourceGeneration=deck?.generation;if(!track)return toast(`Deck ${deckName.toUpperCase()} is empty`);
    if(deck.stemMode==='ai'){applyQuickStemMode(deckName,desiredMode);return true}
    setDeckStemState(deckName,'loading','AI LOAD');let entry=await cachedStems(track);
    if(!entry){setDeckStemState(deckName,'processing','SEPARATING');toast('REAL AI STEMS · preparing vocals + instrumental');entry=await scheduleStems(track,true)}
    if(deck.track!==track||deck.generation!==sourceGeneration)throw new Error('Deck changed during stem preparation');
    await engine.installStems(deckName,entry.stems);applyQuickStemMode(deckName,desiredMode);setDeckStemState(deckName,'ready','AI READY');toast(`Deck ${deckName.toUpperCase()} · ${desiredMode.toUpperCase()} live`);return true
  }
  async function runBpmWorker(){
    if(bpmWorkerRunning)return;bpmWorkerRunning=true;
    try{while(bpmQueue.length){
      const track=bpmQueue.shift(),key=stemKey(track);bpmQueued.delete(key);
      if(!track||track.failed||Number(track.confidence||0)>=.5)continue;
      try{
        const cached=await globalThis.FlowStemCache?.getAnalysis(track);
        if(cached){const{key:_cacheKey,updatedAt:_cachedAt,...grid}=cached;Object.assign(track,grid,{status:'BPM CACHED'});renderLibrary();continue}
        track.status='ANALYZING';renderLibrary();
        const result=await engine.analyseTrack(track);
        if(result){await globalThis.FlowStemCache?.putAnalysis(track,result);track.status='BPM READY';renderLibrary()}
      }catch(error){console.warn(`VK BPM analysis failed for ${track.title}`,error);track.status='BPM RETRY';track.analysisError=error.message;renderLibrary()}
      finally{if(track.remote&&!stemJobs.has(key)){clearTimeout(track.bytesReleaseTimer);track.bytesReleaseTimer=setTimeout(()=>{track.bytesPromise=null},2500)}}
      await new Promise(resolve=>setTimeout(resolve,120));
    }}finally{bpmWorkerRunning=false}
  }
  function scheduleBpm(track,priority=false){
    if(!track||track.failed||Number(track.confidence||0)>=.5)return;const key=stemKey(track);if(bpmQueued.has(key))return;bpmQueued.add(key);track.status='BPM QUEUED';priority?bpmQueue.unshift(track):bpmQueue.push(track);queueMicrotask(runBpmWorker)
  }
  async function refreshStemStatus(){try{const status=(await mdxModule()).status();$('#stemStatus').textContent='MDX INST HQ 3 · REAL 2-STEM ENGINE';$('#stemModel').textContent='MODEL BUNDLED';$('#stemModel').disabled=true;return status}catch(error){$('#stemStatus').textContent='STEMS RUNTIME ERROR';$('#stemProgress').textContent=error.message;return{local:false}}}
  async function ensureStemModel(){return refreshStemStatus()}
  async function trackBytes(track){if(!track.bytesPromise)track.bytesPromise=(async()=>{if(track.file)return track.file.arrayBuffer();const mediaUrl=typeof track.resolveUrl==='function'?await track.resolveUrl():track.url;if(!mediaUrl)throw new Error('No stream available for audio analysis');if(/\.m3u8(?:[?#]|$)/i.test(mediaUrl))throw new Error('This VK source is HLS; direct analysis is not available yet');const response=await fetch(mediaUrl,{cache:'no-store',redirect:'follow',credentials:'omit'});if(!response.ok)throw new Error(`Audio source HTTP ${response.status}`);return response.arrayBuffer()})().then(bytes=>{clearTimeout(track.bytesReleaseTimer);track.bytesReleaseTimer=setTimeout(()=>{track.bytesPromise=null},90000);return bytes}).catch(error=>{track.bytesPromise=null;throw error});return track.bytesPromise}
  async function separateDeck(deckName,desiredMode='all',fast=desiredMode!=='all'){
    if(stemsBusy)return toast('Another deck is already separating');stemsBusy=true;document.querySelectorAll('.separate-stems').forEach(button=>button.disabled=true);engine.setAuto(false);renderMode();
    try{return await activateQuickStems(deckName,desiredMode)}
    catch(error){console.error(error);$('#stemStatus').textContent='STEM SEPARATION FAILED';setStemProgress(0,error.message);toast(error.message);return false}finally{stemsBusy=false;document.querySelectorAll('.separate-stems').forEach(button=>button.disabled=false)}
  }

  async function makeMashup(){
    const button=$('#mashup'),a=engine.decks.a,b=engine.decks.b;if(!a.track||!b.track)return toast('Load one track into each deck first');button.disabled=true;button.textContent='BUILDING…';engine.setAuto(false);renderMode();
    try{if(!a.stemMode&&!(await separateDeck('a','instrumental',true)))return;if(!b.stemMode&&!(await separateDeck('b','vocal',true)))return;await Promise.all([engine.analyseTrack(a.track).catch(()=>null),engine.analyseTrack(b.track).catch(()=>null)]);applyQuickStemMode('a','instrumental');applyQuickStemMode('b','vocal');let rate=1;try{rate=engine.syncDeck('b')}catch{}engine.setCross(.5);$('#crossfader').value=.5;if(a.audio.paused)await engine.toggleDeck('a');if(b.audio.paused)await engine.toggleDeck('b');toast(`MASHUP LIVE · A instrumental + B vocal · ${rate.toFixed(3)}×`)}finally{button.disabled=false;button.textContent='MASHUP'}
  }

  function resolveRemoteTrack(track) {
    const requestId=crypto.randomUUID();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{pendingResolutions.delete(requestId);reject(new Error(`VK stream timeout: ${track.title}`))},18000);
      pendingResolutions.set(requestId,{resolve,reject,timer});
      window.parent.postMessage({type:'flow:resolve-track',requestId,key:track.key},'*');
    });
  }

  function syncVkLibrary(items=[]) {
    let added=0;
    for(const item of items.slice(0,300)) {
      if(!item?.key||tracks.some(track=>track.key===item.key)) continue;
      const track={id:item.key,key:item.key,title:item.title||'Untitled',artist:item.artist||'VK Music',status:'VK READY',energy:.5,bpm:0,wave:Array.from({length:96},(_,i)=>.14+Math.sin(i*.73)**2*.34),color:colors[tracks.length%colors.length],remote:true};
      track.resolveUrl=()=>resolveRemoteTrack(track);
      track.getBytes=()=>trackBytes(track);
      tracks.push(track);added+=1;
    }
    if(added){engine.setTracks(tracks.filter(track=>!track.failed),engine.running);renderAll();const pending=tracks.filter(track=>track.remote&&!track.bpm).slice(0,60);pending.forEach((track,index)=>setTimeout(()=>scheduleBpm(track,index<4),80+index*12));toast(`${tracks.filter(track=>track.remote).length} VK tracks connected · BPM scan started`)}
  }

  window.addEventListener('message',event=>{
    if(event.source!==window.parent)return;
    const message=event.data;
    if(message?.type==='flow:library')syncVkLibrary(message.tracks||[]);
    if(message?.type==='flow:resolved-track'){
      const pending=pendingResolutions.get(message.requestId);if(!pending)return;clearTimeout(pending.timer);pendingResolutions.delete(message.requestId);message.ok?pending.resolve(message.mediaUrl):pending.reject(new Error(message.error||'VK stream unavailable'));
    }
    if(message?.type==='flow:stop')engine.stop();
  });

  function toast(text) { const node=$('#toast'); node.textContent=text; node.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),3100); }
  function formatTime(value) { const seconds=Math.max(0,Number(value||0)); return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`; }
  function splitName(name) { const clean=name.replace(/\.[^.]+$/,'').replace(/_/g,' ').trim(); const parts=clean.split(/\s+[—–-]\s+/); return parts.length>1?{artist:parts.shift(),title:parts.join(' — ')}:{artist:'Local file',title:clean}; }
  function escapeHtml(text=''){const div=document.createElement('div');div.textContent=text;return div.innerHTML}

  async function addFiles(fileList, autoStart=false) {
    const files=[...fileList].filter(file=>file.type.startsWith('audio/')||/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name));
    if(!files.length) return toast('No supported audio files found');
    for(const file of files){
      const copy=splitName(file.name),demo=/FLOW DEMO (\d)/.exec(file.name),track={id:`${file.name}:${file.size}:${crypto.randomUUID()}`,file,url:URL.createObjectURL(file),title:copy.title,artist:copy.artist,status:'ANALYZING',energy:.5,color:colors[tracks.length%colors.length]};track.getBytes=()=>trackBytes(track);
      if(demo){const index=Number(demo[1])-1,meta=[[112,.32,'Afterimage'],[122,.6,'Soft Collision'],[126,.84,'Neon Return']][index];Object.assign(track,{bpm:meta[0],energy:meta[1],artist:'FLOW LAB',title:meta[2]})}
      tracks.push(track); renderAll();
      try { const bytes=await trackBytes(track),buffer=await engine.context.decodeAudioData(bytes.slice(0)),grid=globalThis.FlowBeatGrid?.analyzeBuffer?await globalThis.FlowBeatGrid.analyzeBuffer(buffer,{duration:Math.min(150,buffer.duration)}):globalThis.FlowAudioLibs?.analyzeBeatGrid?await globalThis.FlowAudioLibs.analyzeBeatGrid(buffer,{duration:Math.min(110,buffer.duration)}):await FlowCore.analyzeFile(engine.context,file); Object.assign(track,grid,{bpm:track.bpm||grid.bpm,duration:buffer.duration,status:'READY'}); }
      catch(error) { track.failed=true; track.status='ERROR'; track.error=error.message; toast(`Skipped ${track.title}: unsupported audio`); }
      engine.setTracks(tracks.filter(item=>!item.failed),engine.running); renderAll();
    }
    if(autoStart&&tracks.some(t=>!t.failed)) await startFlow();
  }

  function makeToneFile(index,bpm,frequency,seconds=22) {
    const sampleRate=22050,samples=sampleRate*seconds,body=new ArrayBuffer(44+samples*2),view=new DataView(body); const write=(offset,text)=>[...text].forEach((char,i)=>view.setUint8(offset+i,char.charCodeAt(0)));
    write(0,'RIFF');view.setUint32(4,36+samples*2,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples*2,true);
    const beat=sampleRate*60/bpm; for(let i=0;i<samples;i++){const phase=i%beat,kick=phase<sampleRate*.1?Math.sin(i*Math.PI*2*55/sampleRate)*Math.exp(-phase/(sampleRate*.025)):0,pad=Math.sin(i*Math.PI*2*frequency/sampleRate)*.13+Math.sin(i*Math.PI*2*(frequency*1.5)/sampleRate)*.05,hats=phase>beat*.48&&phase<beat*.55?((i*16807)%97/97-.5)*.16:0;view.setInt16(44+i*2,Math.round(FlowCore.clamp(pad+kick*.68+hats,-1,1)*32767),true)}
    return new File([body],`FLOW DEMO ${index}.wav`,{type:'audio/wav',lastModified:1});
  }
  async function loadDemo(autoStart=true) { if(tracks.some(t=>/FLOW DEMO/.test(t.file?.name))) { if(autoStart&&!engine.running) await startFlow(); return; } toast('Generating a local three-track demo set…'); await addFiles([makeToneFile(1,112,174),makeToneFile(2,122,220),makeToneFile(3,126,261)],autoStart); }
  async function startFlow() { const ready=tracks.filter(t=>!t.failed); if(!ready.length) return loadDemo(true); try { await engine.resume(); engine.setTracks(ready,false); await engine.start(); } catch(error){toast(error.message)} }

  function renderLibrary() {
    const query=$('#search').value.trim().toLowerCase(),list=tracks.filter(t=>`${t.title} ${t.artist}`.toLowerCase().includes(query)); $('#libraryCount').textContent=`${tracks.filter(t=>!t.failed).length} TRACKS`;
    $('#libraryList').innerHTML=list.length?list.map(track=>`<div class="track-row ${lastState?.[lastState.active]?.track?.id===track.id?'playing':''} ${track.failed?'failed':''}" data-id="${escapeHtml(track.id)}"><span class="track-index">${track.status==='ANALYZING'?'··':track.failed?'!':String(tracks.indexOf(track)+1).padStart(2,'0')}</span><span><b>${escapeHtml(track.title)}</b><small>${escapeHtml(track.artist)}</small></span><span title="${escapeHtml(track.analysisError||track.status||'')}"><b>${track.bpm||'—'}</b><small>${track.bpm?'BPM':escapeHtml(String(track.status||'BPM').replace('BPM ','').slice(0,8))}</small></span><span class="track-load-actions"><button type="button" data-load="a" aria-label="Load ${escapeHtml(track.title)} to deck A" ${track.failed?'disabled':''}>A</button><button type="button" data-load="b" aria-label="Load ${escapeHtml(track.title)} to deck B" ${track.failed?'disabled':''}>B</button></span></div>`).join(''):'<div class="empty-copy"><b>Your music stays here.</b><span>Audio is decoded locally in this tab. Nothing is uploaded.</span></div>';
  }
  let loadingDeck = {a:false,b:false};
  $('#libraryList').addEventListener('click', async event => {
    const button = event.target.closest('button[data-load]');
    if (!button) return;
    const deck = button.dataset.load;
    const row = button.closest('.track-row');
    const track = tracks.find(item => item.id === row?.dataset.id);
    if (!track || loadingDeck[deck]) return;
    loadingDeck[deck] = true;
    button.disabled = true;
    button.textContent = '…';
    try {
      engine.setAuto(false);
      renderMode();
      toast(`Loading ${track.title} into Deck ${deck.toUpperCase()}…`);
      const loaded = await engine.loadToDeck(deck, track);
      if (loaded) { $('#crossfader').value = engine.cross; renderAll(); toast(`${track.title} → Deck ${deck.toUpperCase()} · press PLAY`); }
    } catch(error) { toast(`Deck ${deck.toUpperCase()}: ${error.message}`); }
    finally { loadingDeck[deck] = false; renderLibrary(); }
  });
  function renderRoute() {
    const route=engine.route; $('#routeList').innerHTML=route.length?route.map((track,index)=>`<div class="route-row ${index===engine.index&&engine.running?'now':''}"><span>${index===engine.index&&engine.running?'NOW':String(index+1).padStart(2,'0')}</span><div><b>${escapeHtml(track.title)}</b><small>${escapeHtml(track.artist)}</small></div><em>${track.bpm||'—'} BPM</em></div>`).join(''):'<div class="empty-copy"><b>No route yet.</b><span>Add two or more tracks and FLOW will arrange the set.</span></div>';
    const current=route[engine.index],next=route.length>1?route[(engine.index+1)%route.length]:null,plan=FlowCore.transitionPlan(current,next); $('.transition-card h3').textContent=current&&next?`${current.title} → ${next.title}`:'Waiting for music'; $('.transition-card p').textContent=current&&next?`${plan.score}% compatible · ${plan.reason}`:'FLOW will calculate the next blend.'; $('.transition-card>div:first-child b').textContent=current&&next?plan.mode:'STANDBY'; $('#routeMode').textContent=route.length>1?'ENDLESS':'READY';
  }
  function renderAll(){renderLibrary();renderRoute()}

  let renderedActiveTrack = null;
  function renderState(state) {
    lastState=state; const active=state[state.active],track=active.track;
    if(track){$('#nowTitle').textContent=track.title;$('#nowArtist').textContent=track.artist;$('#nowBpm').textContent=track.bpm||'—';$('#nowEnergy').textContent=`${Math.round((track.energy||.5)*100)}%`;$('#nowTime').textContent=formatTime(active.currentTime);$('#nowDuration').textContent=`/ ${formatTime(active.duration)}`;$('#deckBadge').textContent=`DECK ${state.active.toUpperCase()}`;$('#liveBadge').textContent=state.transition?'MIXING':active.paused?'PAUSED':'LIVE';$('#seek').max=active.duration||100;$('#seek').value=active.currentTime;$('#waveProgress').style.width=`${active.duration?active.currentTime/active.duration*100:0}%`;drawWave(track,active)}
    for(const name of ['a','b']){const upper=name.toUpperCase(),deck=state[name],card=$(`#deck${upper}`);card.classList.toggle('active',name===state.active);$(`#deck${upper}Title`).textContent=deck.track?.title||'EMPTY';$(`#deck${upper}State`).textContent=deck.track?(deck.paused?(name===state.active?'PAUSED':'READY'):'PLAYING'):'STANDBY';$(`#deck${upper}Progress`).style.width=`${deck.duration?deck.currentTime/deck.duration*100:0}%`;const seek=$(`#deck${upper}Seek`);if(seek && document.activeElement!==seek){seek.max=deck.duration||100;seek.value=deck.currentTime||0}const time=$(`#deck${upper}Time`);if(time)time.textContent=`${formatTime(deck.currentTime)} / ${formatTime(deck.duration)}`;const playButton=card.querySelector('.deck-play-button');if(playButton){playButton.textContent=deck.paused?`▶ PLAY ${upper}`:`Ⅱ PAUSE ${upper}`;playButton.setAttribute('aria-pressed',String(!deck.paused))}}
    const mix=state.transition?.progress??(state.auto?(state.active==='a'?0:1):state.mix);$('#mixNeedle').style.left=`${mix*100}%`;$('#crossfader').value=mix;$('#play').textContent=active.paused?'▶':'Ⅱ';$('#engineState').textContent=state.transition?'AUTOMIX IN PROGRESS':state.auto?(active.paused?'ENGINE PAUSED':'AUTO DJ RUNNING'):'MANUAL PERFORMANCE';$('.engine-pill').classList.toggle('live',!active.paused);$('.transition-meter i').style.width=`${state.transition?state.transition.progress*100:engine.nextPrepared?100:25}%`;if(renderedActiveTrack!==track?.id){renderedActiveTrack=track?.id;renderLibrary();renderRoute();}
  }
  function drawWave(track,active){const canvas=$('#waveform'),ratio=devicePixelRatio||1,width=canvas.clientWidth,height=canvas.clientHeight;if(canvas.width!==width*ratio||canvas.height!==height*ratio){canvas.width=width*ratio;canvas.height=height*ratio}const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);const wave=track.wave||Array(96).fill(.22),bar=width/wave.length,progress=active.duration?active.currentTime/active.duration:0;wave.forEach((value,i)=>{const h=Math.max(3,value*height*.85);ctx.fillStyle=i/wave.length<=progress?track.color:'#353b47';ctx.fillRect(i*bar,(height-h)/2,Math.max(1,bar-1),h)})}

  const aura=$('#aura'),auraCtx=aura.getContext('2d'); let phase=0;
  function animate(){const ratio=devicePixelRatio||1,w=aura.clientWidth,h=aura.clientHeight;if(aura.width!==w*ratio||aura.height!==h*ratio){aura.width=w*ratio;aura.height=h*ratio}auraCtx.setTransform(ratio,0,0,ratio,0,0);auraCtx.clearRect(0,0,w,h);const spectrum=engine.spectrum(),bass=spectrum.slice(1,10).reduce((a,b)=>a+b,0)/(9*255)||0;phase+=.008+bass*.025;const cx=w/2,cy=h*.35,r=Math.min(w,h)*(.15+bass*.045),active=lastState?.[lastState.active]?.track,color=active?.color||'#795cff',glow=auraCtx.createRadialGradient(cx-r*.25,cy-r*.3,r*.03,cx,cy,r*2.8);glow.addColorStop(0,'#fff');glow.addColorStop(.04,'#81edff');glow.addColorStop(.2,color);glow.addColorStop(.5,'#25265b88');glow.addColorStop(1,'transparent');auraCtx.fillStyle=glow;auraCtx.beginPath();for(let i=0;i<=80;i++){const angle=i/80*Math.PI*2,bin=spectrum[Math.floor(i/80*Math.min(60,spectrum.length-1))]/255||0,rr=r*(1+Math.sin(angle*3+phase)*.06+Math.sin(angle*7-phase*1.7)*.025+bin*.09),x=cx+Math.cos(angle)*rr,y=cy+Math.sin(angle)*rr;i?auraCtx.lineTo(x,y):auraCtx.moveTo(x,y)}auraCtx.closePath();auraCtx.fill();const level=spectrum.reduce((a,b)=>a+b,0)/(spectrum.length*255)||0;[...$('#vu').children].forEach((bar,i)=>bar.style.background=i/8<level*2.4?(i>6?'#ff6d78':'#d8ff52'):'#252a32');requestAnimationFrame(animate)}

  function drawWaveV2(track,active,state){
    const canvas=$('#waveform'),ratio=devicePixelRatio||1,width=canvas.clientWidth,height=canvas.clientHeight;if(canvas.width!==width*ratio||canvas.height!==height*ratio){canvas.width=width*ratio;canvas.height=height*ratio}const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const next=engine.nextTrack(),wave=track?.wave?.length?track.wave:Array.from({length:160},(_,index)=>.13+Math.sin(index*.61)**2*.26),nextWave=next?.wave?.length?next.wave:Array.from({length:160},(_,index)=>.08+Math.sin(index*.43)**2*.18),bar=width/wave.length,progress=active.duration?active.currentTime/active.duration:0,plan=FlowCore.transitionPlan(track,next),zone=active.duration?Math.max(0,1-plan.duration/active.duration):.82;
    const gradient=ctx.createLinearGradient(width*zone,0,width,0);gradient.addColorStop(0,'rgba(118,88,255,0)');gradient.addColorStop(1,'rgba(52,207,255,.15)');ctx.fillStyle=gradient;ctx.fillRect(width*zone,0,width*(1-zone),height);
    if(track?.bpm&&active.duration){const beat=60/FlowCore.normalizeBpm(track.bpm),offset=track.beatOffset||0;ctx.strokeStyle='rgba(126,154,216,.12)';ctx.lineWidth=1;for(let time=offset;time<active.duration;time+=beat*4){const x=time/active.duration*width;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke()}}
    wave.forEach((value,index)=>{const h=Math.max(2,value*height*.48),x=index*bar;ctx.fillStyle=index/wave.length<=progress?(track?.color||'#7658ff'):'rgba(92,107,132,.42)';ctx.fillRect(x,height*.09+(height*.43-h)/2,Math.max(1,bar-1),h)});
    nextWave.forEach((value,index)=>{const h=Math.max(1,value*height*.25),x=index*bar;ctx.fillStyle=next?.color||'rgba(52,207,255,.55)';ctx.globalAlpha=.52;ctx.fillRect(x,height*.67+(height*.22-h)/2,Math.max(1,bar-1),h)});ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,.95)';ctx.fillRect(progress*width,0,1,height);ctx.fillStyle='rgba(207,255,77,.8)';ctx.fillRect(width*zone,0,1,height);
  }

  function renderTelemetry(state){
    const active=state[state.active],current=active.track,next=engine.nextTrack(),plan=FlowCore.transitionPlan(current,next),queued=state.transition&&state.transition.progress===0;
    $('#telemetryNow').textContent=current?.title||'WAITING FOR MUSIC';$('#telemetryNowMeta').textContent=`DECK ${state.active.toUpperCase()} · ${current?.bpm||'—'} BPM`;
    $('#telemetryNext').textContent=next?.title||'NOT PREPARED';$('#telemetryNextMeta').textContent=`DECK ${state.active==='a'?'B':'A'} · ${next?.bpm||'—'} BPM`;
    $('#mixMode').textContent=state.transition?state.transition.plan.mode:plan.mode;$('#phaseStatus').textContent=state.transition?(queued?`WAITING ${state.transition.delay.toFixed(2)}s FOR BAR`:`MIX ${Math.round(state.transition.progress*100)}%`):next?.confidence>=.24?'BEAT GRID LOCKED':'ANALYZING NEXT DECK';
    if(current)drawWaveV2(current,active,state);
  }

  function animateV2(){
    const ratio=devicePixelRatio||1,width=aura.clientWidth,height=aura.clientHeight;if(aura.width!==width*ratio||aura.height!==height*ratio){aura.width=width*ratio;aura.height=height*ratio}auraCtx.setTransform(ratio,0,0,ratio,0,0);auraCtx.clearRect(0,0,width,height);const meter=engine.meter(),frequency=meter.frequency,waveform=meter.waveform,mix=lastState?.transition?.progress??(lastState?.active==='b'?1:0),bass=Math.max(meter.a.bass,meter.b.bass),pulse=1+bass*.16;phase+=.006+bass*.02;
    const drawDeck=(x,y,radius,color,level,frequencyData,rotation)=>{auraCtx.save();auraCtx.translate(x,y);auraCtx.rotate(rotation);const glow=auraCtx.createRadialGradient(-radius*.2,-radius*.28,2,0,0,radius*1.75);glow.addColorStop(0,'rgba(255,255,255,.94)');glow.addColorStop(.06,color);glow.addColorStop(.42,color+'55');glow.addColorStop(1,'transparent');auraCtx.fillStyle=glow;auraCtx.beginPath();auraCtx.arc(0,0,radius*pulse,0,Math.PI*2);auraCtx.fill();for(let index=0;index<64;index++){const angle=index/64*Math.PI*2,value=(frequencyData[index*3]||0)/255,length=radius*(.09+value*.3)*Math.max(.15,level);auraCtx.strokeStyle=color;auraCtx.globalAlpha=.12+value*.55;auraCtx.lineWidth=1.2;auraCtx.beginPath();auraCtx.moveTo(Math.cos(angle)*radius*.82,Math.sin(angle)*radius*.82);auraCtx.lineTo(Math.cos(angle)*(radius*.82+length),Math.sin(angle)*(radius*.82+length));auraCtx.stroke()}auraCtx.restore();auraCtx.globalAlpha=1};
    const radius=Math.min(width,height)*.105,centerY=height*.34;drawDeck(width*.43,centerY,radius,'#7658ff',1-mix,engine.decks.a.frequency,phase);drawDeck(width*.57,centerY,radius,'#34cfff',mix,engine.decks.b.frequency,-phase*.82);
    auraCtx.strokeStyle='rgba(194,226,255,.22)';auraCtx.lineWidth=1;auraCtx.beginPath();for(let index=0;index<waveform.length;index+=4){const x=index/(waveform.length-1)*width,y=centerY+radius*1.62+waveform[index]*48*(.4+bass);index?auraCtx.lineTo(x,y):auraCtx.moveTo(x,y)}auraCtx.stroke();
    const masterX=width/2,masterY=centerY,masterRadius=radius*1.72;auraCtx.strokeStyle='rgba(191,226,255,.08)';for(let ring=1;ring<=3;ring++){auraCtx.beginPath();auraCtx.arc(masterX,masterY,masterRadius*ring/3,0,Math.PI*2);auraCtx.stroke()}for(let index=0;index<96;index++){const angle=index/96*Math.PI*2-Math.PI/2,value=(frequency[index*4]||0)/255,start=masterRadius*.78,end=start+value*radius*.34;auraCtx.strokeStyle=index<28?'rgba(207,255,77,.42)':'rgba(94,205,255,.28)';auraCtx.beginPath();auraCtx.moveTo(masterX+Math.cos(angle)*start,masterY+Math.sin(angle)*start);auraCtx.lineTo(masterX+Math.cos(angle)*end,masterY+Math.sin(angle)*end);auraCtx.stroke()}
    const level=frequency.reduce((sum,value)=>sum+value,0)/(frequency.length*255)||0;[...$('#vu').children].forEach((bar,index)=>bar.style.background=index/8<level*2.8?(index>6?'#ff6d78':'#cfff4d'):'#252a32');requestAnimationFrame(animateV2);
  }

  engine.addEventListener('tick',event=>{renderState(event.detail);renderTelemetry(event.detail)}); engine.addEventListener('route',renderAll); engine.addEventListener('analysis',event=>{renderAll();if(event.detail.result?.confidence>.35)toast(`${event.detail.track.bpm} BPM · beat grid locked · ${event.detail.track.title}`)}); engine.addEventListener('analysiserror',event=>{event.detail.track.status='BPM RETRY';event.detail.track.analysisError=event.detail.error?.message;renderLibrary()}); engine.addEventListener('play',()=>{toast('FLOW is live · next deck is preparing');const deck=engine.active,track=engine.decks[deck]?.track;scheduleBpm(track,true);primeDeckStems(deck,track)}); engine.addEventListener('prepared',event=>{toast(`Deck ${event.detail.deck.toUpperCase()} ready · ${event.detail.track.title}`);scheduleBpm(event.detail.track,true);primeDeckStems(event.detail.deck,event.detail.track)}); engine.addEventListener('transitionqueued',event=>toast(`Next bar in ${event.detail.delay.toFixed(2)}s · ${event.detail.plan.mode}`)); engine.addEventListener('transitionstart',event=>toast(`${event.detail.plan.mode} · bass swap · ${event.detail.duration.toFixed(1)}s`)); engine.addEventListener('error',event=>toast(event.detail.error?.message||'Track skipped'));
  for(const input of ['#fileInput','#fileInputTop','#welcomeFiles']) $(input).addEventListener('change',event=>addFiles(event.target.files,false)); $('#demoTop').onclick=()=>{window.parent.postMessage({type:'flow:deep-scan'},'*');toast('Scanning VK library…')}; $('#welcomeDemo').onclick=()=>window.parent.postMessage({type:'flow:scan-library'},'*'); $('#play').onclick=()=>engine.toggle().catch(error=>toast(error.message)); $('#mashup').onclick=()=>makeMashup().catch(error=>toast(error.message)); $('#skip').onclick=()=>engine.skip(); $('#back15').onclick=()=>engine.seek((engine.decks[engine.active].audio.currentTime||0)-15); $('#seek').onchange=event=>engine.seek(Number(event.target.value)); $('#search').oninput=renderLibrary;
  function renderMode(){const manual=!engine.auto;$('#autoToggle').classList.toggle('on',engine.auto);$('.auto-control').classList.toggle('manual',manual);$('#modeLabel').textContent=engine.auto?'AUTO DJ':'MANUAL';$('#autoText').textContent=engine.auto?'FLOW CONTROLS THE MIX':'DECKS ARE YOURS'}
  $('#clearLibrary').onclick=()=>{engine.stop();tracks.forEach(track=>{if(!track.remote&&track.url)URL.revokeObjectURL(track.url)});tracks.splice(0);engine.setTracks([]);lastState=null;renderAll();window.parent.postMessage({type:'flow:scan-library'},'*');toast('Library refreshed from VK')}; $('#autoToggle').onclick=()=>{engine.setAuto(!engine.auto);renderMode()}; $('#crossfader').oninput=event=>{engine.setCross(Number(event.target.value));renderMode()};
  for(const name of ['A','B']) $(`#gain${name}`).oninput=event=>{const value=Number(event.target.value);engine.setUserGain(name.toLowerCase(),value);$(`#gain${name}Out`).textContent=`${Math.round(value*100)}%`}; $('#arcPicker').onclick=event=>{const button=event.target.closest('[data-arc]');if(!button)return;$('#arcPicker').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));engine.rebuild(button.dataset.arc);renderAll()}; $('#rebuild').onclick=()=>{engine.rebuild();renderAll();toast('Route rebuilt around the current track')};
  for(const deck of ['a','b']){
    const upper=deck.toUpperCase();for(const band of ['low','mid','high'])$(`#${band}${upper}`).oninput=event=>engine.setDeckEq(deck,band,Number(event.target.value));$(`#filter${upper}`).oninput=event=>engine.setDeckFilter(deck,Number(event.target.value));$(`#pitch${upper}`).oninput=event=>{const percent=Number(event.target.value);engine.setTempo(deck,percent);$(`#pitch${upper}Out`).textContent=`${percent>0?'+':''}${percent.toFixed(1)}%`;engine.setAuto(false);renderMode()}
  }
  document.querySelectorAll('.deck-seek').forEach(input=>input.addEventListener('change',()=>{const name=input.id==='deckASeek'?'a':'b';const deck=engine.decks[name];if(!deck?.track)return;engine.setAuto(false);renderMode();deck.seek(Number(input.value));engine.tick()}));
  document.querySelectorAll('.deck-transport button').forEach(button=>button.onclick=async()=>{const{deck,action}=button.dataset;try{engine.setAuto(false);renderMode();if(action==='toggle')await engine.toggleDeck(deck);if(action==='cue')engine.cueDeck(deck);if(action==='sync'){const rate=engine.syncDeck(deck);const percent=(rate-1)*100;$(`#pitch${deck.toUpperCase()}`).value=percent;$(`#pitch${deck.toUpperCase()}Out`).textContent=`${percent>0?'+':''}${percent.toFixed(1)}%`;toast(`Deck ${deck.toUpperCase()} synced · ${rate.toFixed(3)}×`)}}catch(error){toast(error.message)}});
  async function refreshAudioOutputs(){
    const selector=$('#cueOutput');if(!navigator.mediaDevices?.enumerateDevices){selector.disabled=true;return}
    try{
      const devices=(await navigator.mediaDevices.enumerateDevices()).filter(device=>device.kind==='audiooutput');
      selector.replaceChildren(new Option('SELECT HEADPHONES',''));
      devices.forEach((device,index)=>selector.add(new Option(device.label||`Audio output ${index+1}`,device.deviceId)));
    }catch(error){toast(`Audio device discovery: ${error.message}`)}
  }
  $('#cueOutput').onchange=async event=>{
    try{await engine.setCueOutput(event.target.value);toast('Headphone CUE output connected')}
    catch(error){event.target.value='';toast(`CUE: ${error.message}`)}
  };
  document.querySelectorAll('[data-cue]').forEach(button=>button.onclick=()=>{
    try{const enabled=engine.toggleCue(button.dataset.cue);button.classList.toggle('active',enabled);button.setAttribute('aria-pressed',String(enabled))}
    catch(error){toast(error.message)}
  });
  refreshAudioOutputs();navigator.mediaDevices?.addEventListener?.('devicechange',refreshAudioOutputs);
  document.querySelectorAll('.vocal-kill').forEach(button=>button.onclick=()=>{button.classList.toggle('active');engine.setVocalKill(button.dataset.deck,button.classList.contains('active'));engine.setAuto(false);renderMode();toast(button.classList.contains('active')?'Center vocal range cut with EQ · not AI stems':'Vocal EQ cut released')});
  document.querySelectorAll('.stem-controls').forEach(container=>{const deck=container.closest('[data-stem-deck]').dataset.stemDeck;container.innerHTML=stemNames.map(name=>`<label class="stem-strip"><b>${name==='other'?'INSTRUMENTAL':'VOCAL'}</b><button data-stem-solo="${name}" data-deck="${deck}">S</button><input data-stem-gain="${name}" data-deck="${deck}" type="range" min="0" max="1.25" value="1" step="0.01"></label>`).join('')});
  document.querySelectorAll('[data-stem-gain]').forEach(input=>input.oninput=()=>{engine.setStemGain(input.dataset.deck,input.dataset.stemGain,Number(input.value));showQuickStemMode(input.dataset.deck,'custom')});
  document.querySelectorAll('[data-stem-solo]').forEach(button=>button.onclick=()=>{const active=!button.classList.contains('solo');document.querySelectorAll(`[data-stem-deck="${button.dataset.deck}"] [data-stem-solo]`).forEach(other=>other.classList.toggle('solo',active&&other===button));engine.soloStem(button.dataset.deck,button.dataset.stemSolo,active);showQuickStemMode(button.dataset.deck,'custom')});
  document.querySelectorAll('.separate-stems').forEach(button=>button.onclick=()=>separateDeck(button.dataset.deck));
  document.querySelectorAll('[data-quick-mode]').forEach(button=>button.onclick=async()=>{const deck=button.dataset.deck,mode=button.dataset.quickMode;try{engine.setAuto(false);renderMode();const channel=engine.decks[deck];if(!channel?.stemMode){if(mode==='all')return toast('Full mix already playing');return await separateDeck(deck,mode,true)}if(channel.stemMode==='live'&&mode!=='all')return await separateDeck(deck,mode,true);applyQuickStemMode(deck,mode)}catch(error){toast(error.message)}});
  engine.addEventListener('stems',event=>{if(!engine.decks[event.detail.deck]?.stemMode)showQuickStemMode(event.detail.deck,'all')});$('#stemModel').onclick=()=>ensureStemModel().catch(error=>{setStemProgress(0,error.message);toast(error.message)});
  const drop=$('.drop-zone');for(const type of ['dragenter','dragover'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add('drag')});for(const type of ['dragleave','drop'])drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('drag')});drop.addEventListener('drop',event=>addFiles(event.dataTransfer.files,false)); window.addEventListener('keydown',event=>{if(event.target.matches('input'))return;if(event.code==='Space'){event.preventDefault();$('#play').click()}if(event.key.toLowerCase()==='n')$('#skip').click();if(event.key.toLowerCase()==='a')$('#autoToggle').click()}); document.addEventListener('visibilitychange',()=>{if(!document.hidden&&engine.running)engine.resume().catch(()=>{})});
  renderAll(); animateV2();
  // First paint gets the visible VK rows instantly; the deferred deep scan then
  // walks VK's virtualized playlist and streams additional tracks into FLOW.
  window.parent.postMessage({type:'flow:scan-library'},'*');
  setTimeout(()=>window.parent.postMessage({type:'flow:deep-scan',automatic:true},'*'),350);
})();
