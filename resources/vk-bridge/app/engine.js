(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FlowCore=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const sleep=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
  const normalizeBpm=value=>{let bpm=Number(value||0);while(bpm&&bpm<78)bpm*=2;while(bpm>176)bpm/=2;return bpm};
  const equalPower=value=>{const progress=clamp(Number(value||0),0,1);return{a:Math.cos(progress*Math.PI/2),b:Math.sin(progress*Math.PI/2)}};
  const safePlaybackRate=(master,incoming,limit=.055)=>{const left=normalizeBpm(master),right=normalizeBpm(incoming);if(!left||!right)return 1;return clamp(left/right,1-limit,1+limit)};
  const secondsToNextBar=(position,bpm,offset=0,beatsPerBar=4)=>{const tempo=normalizeBpm(bpm);if(!tempo)return 0;const bar=60/tempo*beatsPerBar;const phase=((Number(position||0)-Number(offset||0))%bar+bar)%bar;return phase<.045?0:bar-phase};

  // A transition is musical only when both beat grids are trustworthy.
  // Otherwise use a short, tempo-neutral emergency blend rather than a fake beatmatch.
  function transitionPlan(current,next){
    const left=normalizeBpm(current?.bpm),right=normalizeBpm(next?.bpm);
    const tempoDelta=left&&right?Math.abs(left-right):99;
    const energyDelta=Math.abs(Number(current?.energy??.5)-Number(next?.energy??.5));
    const confident=Number(current?.confidence||0)>=.45&&Number(next?.confidence||0)>=.45;
    const rate=safePlaybackRate(left,right,.055);
    const compatible=Boolean(left&&right&&confident&&Math.abs(rate-left/right)<.0001);
    const beats=compatible?(energyDelta>.32?16:32):0;
    const duration=compatible?beats*60/left:clamp(6.4-energyDelta*1.8,4.2,7.2);
    const score=Math.round(clamp(100-tempoDelta*3.8-energyDelta*24-(confident?0:20),18,99));
    return{mode:compatible?'BEATGRID PHRASE MIX':'SAFE BLEND',duration,beats,score,rate:compatible?rate:1,
      barSeconds:left?60/left*4:0,phraseSeconds:compatible?duration:0,
      reason:compatible?`${beats} beats · phrase boundary · bass exchange`:'beatgrid uncertain · safe blend'};
  }

  function phraseTransitionDelay(position,duration,bpm,offset=0,beats=16){
    const tempo=normalizeBpm(bpm);
    if(!tempo||!beats)return 0;
    const phrase=beats*60/tempo;
    const phase=((Number(position||0)-Number(offset||0))%phrase+phrase)%phrase;
    const delay=phrase-phase;
    // A phrase already at the boundary must not wait for a complete extra phrase.
    return phase<.05||delay<.05?0:delay;
  }

  function buildRoute(tracks,arc='wave'){
    if(tracks.length<2)return tracks.slice();
    const pool=tracks.slice(),target=progress=>arc==='rise'?.18+progress*.76:arc==='cruise'?.58+Math.sin(progress*Math.PI*4)*.07:.24+Math.sin(progress*Math.PI)*.7;
    const result=[pool.splice(pool.reduce((best,track,index)=>Math.abs((track.energy??.5)-target(0))<Math.abs((pool[best].energy??.5)-target(0))?index:best,0),1)[0]];
    while(pool.length){const previous=result.at(-1),position=result.length/Math.max(1,tracks.length-1);let best=0,cost=Infinity;pool.forEach((track,index)=>{const plan=transitionPlan(previous,track);const candidate=Math.abs((track.energy??.5)-target(position))*.48+(1-plan.score/100)*.52;if(candidate<cost){cost=candidate;best=index}});result.push(pool.splice(best,1)[0])}
    return result;
  }

  function analyzeChannel(samples,sampleRate){
    const limit=Math.min(samples.length,sampleRate*90),hop=1024,envelope=[];let sum=0,peak=0;
    for(let start=0;start<limit;start+=hop){let energy=0;const end=Math.min(limit,start+hop);for(let index=start;index<end;index++){const value=samples[index];energy+=value*value}const rms=Math.sqrt(energy/Math.max(1,end-start));envelope.push(rms);sum+=rms;peak=Math.max(peak,rms)}
    const mean=sum/Math.max(1,envelope.length),threshold=mean*1.5,onsets=[];
    for(let index=2;index<envelope.length-2;index++){if(envelope[index]>threshold&&envelope[index]>=envelope[index-1]&&envelope[index]>envelope[index+1]){const time=index*hop/sampleRate;if(!onsets.length||time-onsets.at(-1)>.22)onsets.push(time)}}
    const intervals=[];for(let index=1;index<onsets.length;index++){const interval=onsets[index]-onsets[index-1];if(interval>.24&&interval<1.55)intervals.push(interval)}
    const bpms=intervals.map(interval=>normalizeBpm(60/interval)).filter(value=>value>=78&&value<=176).sort((a,b)=>a-b),bpm=bpms.length?bpms[Math.floor(bpms.length/2)]:0;
    const columns=160,step=Math.max(1,Math.floor(limit/columns)),wave=[];for(let column=0;column<columns;column++){let value=0;for(let index=column*step;index<Math.min(limit,(column+1)*step);index+=8)value=Math.max(value,Math.abs(samples[index]||0));wave.push(value)}
    return{bpm:bpm?Math.round(bpm):0,beatOffset:onsets[0]||0,energy:clamp(mean*6,0,1),wave,confidence:clamp(bpms.length/20,0,1),peak};
  }

  async function analyzeFile(context,file){const bytes=await file.arrayBuffer(),buffer=await context.decodeAudioData(bytes.slice(0)),mono=new Float32Array(buffer.length);for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let index=0;index<buffer.length;index++)mono[index]+=data[index]/buffer.numberOfChannels}return{...analyzeChannel(mono,buffer.sampleRate),duration:buffer.duration}}

  class StreamingBeatTracker{
    constructor(){this.reset()}
    reset(){this.onsets=[];this.floor=.04;this.previous=0;this.lastOnset=-10;this.frames=0;this.energySum=0}
    push(time,bass,rms){this.frames+=1;this.energySum+=rms;this.floor+=(bass-this.floor)*(bass<this.floor?.08:.012);const threshold=Math.max(.085,this.floor*1.32);if(bass>threshold&&bass-this.previous>.018&&time-this.lastOnset>.22){this.onsets.push(time);this.lastOnset=time;if(this.onsets.length>48)this.onsets.shift()}this.previous=bass;return this.result()}
    result(){const intervals=[];for(let index=1;index<this.onsets.length;index++){const interval=this.onsets[index]-this.onsets[index-1];if(interval>.24&&interval<1.55)intervals.push(interval)}if(intervals.length<3)return{bpm:0,confidence:0,beatOffset:this.onsets[0]||0,energy:clamp(this.energySum/Math.max(1,this.frames)*3.8,0,1)};const values=intervals.map(interval=>normalizeBpm(60/interval)).sort((a,b)=>a-b),median=values[Math.floor(values.length/2)],stable=values.filter(value=>Math.abs(value-median)<4);return{bpm:Math.round(stable.reduce((sum,value)=>sum+value,0)/Math.max(1,stable.length)),confidence:clamp(stable.length/12,0,1),beatOffset:this.onsets[0]||0,energy:clamp(this.energySum/Math.max(1,this.frames)*3.8,0,1)}}
  }

  function cancelAutomation(parameter,time){if(typeof parameter.cancelAndHoldAtTime==='function')parameter.cancelAndHoldAtTime(time);else{const value=parameter.value;parameter.cancelScheduledValues(time);parameter.setValueAtTime(value,time)}}

  class ExtensionMediaStream{
    constructor(url){this.url=url;this.controller=new AbortController();this.mediaSource=new MediaSource();this.objectUrl=URL.createObjectURL(this.mediaSource);this.queue=[];this.sourceBuffer=null;this.done=false;this.closed=false;this.error=null}
    async start(){
      await new Promise((resolve,reject)=>{const opened=()=>{cleanup();resolve()};const failed=()=>{cleanup();reject(new Error('MediaSource could not open'))};const cleanup=()=>{this.mediaSource.removeEventListener('sourceopen',opened);this.mediaSource.removeEventListener('sourceclose',failed)};this.mediaSource.addEventListener('sourceopen',opened,{once:true});this.mediaSource.addEventListener('sourceclose',failed,{once:true})});
      const response=await fetch(this.url,{signal:this.controller.signal,credentials:'omit',cache:'no-store',redirect:'follow'});if(!response.ok||!response.body)throw new Error(`Audio proxy HTTP ${response.status}`);
      const contentType=(response.headers.get('content-type')||'').toLowerCase();const mime=contentType.includes('aac')?'audio/aac':'audio/mpeg';if(!MediaSource.isTypeSupported(mime))throw new Error(`${mime} streaming is not supported`);
      this.sourceBuffer=this.mediaSource.addSourceBuffer(mime);this.sourceBuffer.mode='sequence';this.sourceBuffer.addEventListener('updateend',()=>this.flush());this.sourceBuffer.addEventListener('error',()=>{this.error=new Error('Audio stream decode failed')});
      const reader=response.body.getReader();
      try{while(!this.closed){const{value,done}=await reader.read();if(done)break;if(value?.byteLength){this.queue.push(value);this.flush();while(this.queue.length>24&&!this.closed)await sleep(12)}}this.done=true;this.flush()}
      finally{reader.releaseLock?.()}
    }
    flush(){if(this.closed||!this.sourceBuffer||this.sourceBuffer.updating)return;if(this.queue.length){try{this.sourceBuffer.appendBuffer(this.queue.shift())}catch(error){if(error.name==='QuotaExceededError'){const buffered=this.sourceBuffer.buffered;if(buffered.length){const keepFrom=Math.max(0,buffered.end(buffered.length-1)-150);if(keepFrom>buffered.start(0)+10)this.sourceBuffer.remove(buffered.start(0),keepFrom)}}else this.error=error}return}if(this.done&&this.mediaSource.readyState==='open'){try{this.mediaSource.endOfStream()}catch{}}}
    destroy(){this.closed=true;this.controller.abort();this.queue.length=0;try{if(this.mediaSource.readyState==='open')this.mediaSource.endOfStream()}catch{}URL.revokeObjectURL(this.objectUrl)}
  }

  class Deck{
    constructor(name,context,destination,onEnded){
      this.name=name;this.context=context;this.audio=new Audio();this.audio.preload='auto';this.audio.playsInline=true;this.audio.preservesPitch=true;
      this.source=context.createMediaElementSource(this.audio);this.soundTouch=null;this.originalGain=context.createGain();this.liveSplitter=context.createChannelSplitter(2);this.liveVocalSum=context.createGain();this.liveVocalSum.gain.value=.5;this.liveVocalRight=context.createGain();this.liveVocalRight.gain.value=.5;this.liveVocalHighpass=context.createBiquadFilter();this.liveVocalHighpass.type='highpass';this.liveVocalHighpass.frequency.value=105;this.liveVocalLowpass=context.createBiquadFilter();this.liveVocalLowpass.type='lowpass';this.liveVocalLowpass.frequency.value=10500;this.liveVocalGain=context.createGain();this.liveVocalGain.gain.value=0;this.liveSideLeft=context.createGain();this.liveSideLeft.gain.value=.72;this.liveSideRight=context.createGain();this.liveSideRight.gain.value=-.72;this.liveInstrumentGain=context.createGain();this.liveInstrumentGain.gain.value=0;this.highpass=context.createBiquadFilter();this.highpass.type='highpass';this.highpass.frequency.value=20;this.highpass.Q.value=.7;
      this.low=context.createBiquadFilter();this.low.type='lowshelf';this.low.frequency.value=190;this.low.gain.value=0;
      this.mid=context.createBiquadFilter();this.mid.type='peaking';this.mid.frequency.value=1250;this.mid.Q.value=.72;this.mid.gain.value=0;
      this.high=context.createBiquadFilter();this.high.type='highshelf';this.high.frequency.value=6200;this.high.gain.value=0;
      this.gain=context.createGain();this.cueGain=context.createGain();this.cueGain.gain.value=0;this.analyser=context.createAnalyser();this.analyser.fftSize=1024;this.analyser.smoothingTimeConstant=.55;
      this.source.connect(this.originalGain).connect(this.highpass).connect(this.low).connect(this.mid).connect(this.high);this.source.connect(this.liveSplitter);this.liveSplitter.connect(this.liveVocalSum,0);this.liveSplitter.connect(this.liveVocalRight,1);this.liveVocalRight.connect(this.liveVocalSum);this.liveVocalSum.connect(this.liveVocalHighpass).connect(this.liveVocalLowpass).connect(this.liveVocalGain).connect(this.highpass);this.liveSplitter.connect(this.liveSideLeft,0);this.liveSplitter.connect(this.liveSideRight,1);this.liveSideLeft.connect(this.liveInstrumentGain);this.liveSideRight.connect(this.liveInstrumentGain);this.liveInstrumentGain.connect(this.highpass);this.high.connect(this.gain).connect(this.analyser).connect(destination);this.high.connect(this.cueGain);
      this.frequency=new Uint8Array(this.analyser.frequencyBinCount);this.waveform=new Float32Array(this.analyser.fftSize);this.track=null;this.hls=null;this.stream=null;this.stems={};this.stemMode=false;this.generation=0;this.eq={low:0,mid:0,high:0,filter:20};
      this.audio.addEventListener('ended',()=>onEnded(this));this.audio.addEventListener('error',()=>onEnded(this,new Error('Audio stream failed')));
    }
    enableSoundTouch(){
      if(this.soundTouch||!globalThis.FlowAudioLibs?.SoundTouchNode)return false;
      this.source.disconnect();this.soundTouch=new globalThis.FlowAudioLibs.SoundTouchNode({context:this.context});this.source.connect(this.soundTouch).connect(this.originalGain);this.audio.preservesPitch=false;this.soundTouch.playbackRate.value=this.audio.playbackRate||1;this.soundTouch.pitch.value=1;return true;
    }
    async load(track){
      if(this.track?.id===track.id&&this.audio.readyState>=2){this.seek(track.cueIn||track.beatOffset||0);return}
      const generation=++this.generation;this.audio.pause();this.destroyStems();this.hls?.destroy?.();this.stream?.destroy?.();this.hls=null;this.stream=null;this.track=track;
      const mediaUrl=typeof track.resolveUrl==='function'?await track.resolveUrl():track.url;if(generation!==this.generation)return;if(!mediaUrl)throw new Error(`No stream for ${track.title}`);
      this.audio.removeAttribute('src');this.audio.load();
      if(/\.m3u8(?:[?#]|$)/i.test(mediaUrl)&&globalThis.Hls?.isSupported?.()){this.audio.crossOrigin='anonymous';this.hls=new Hls({enableWorker:false,lowLatencyMode:false,maxBufferLength:55,backBufferLength:18});this.hls.loadSource(mediaUrl);this.hls.attachMedia(this.audio)}else if(/^https:\/\//i.test(mediaUrl)){this.stream=new ExtensionMediaStream(mediaUrl);this.audio.src=this.stream.objectUrl;this.audio.load();this.stream.start().catch(error=>{if(generation===this.generation){this.stream.error=error;this.audio.dispatchEvent(new Event('error'))}})}else{this.audio.src=mediaUrl;this.audio.load()}
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{cleanup();reject(new Error(`Stream timeout: ${track.title}`))},16000);const ready=()=>{cleanup();resolve()};const failed=()=>{cleanup();reject(new Error(`Cannot stream: ${track.title}`))};const cleanup=()=>{clearTimeout(timer);this.audio.removeEventListener('loadedmetadata',ready);this.audio.removeEventListener('canplay',ready);this.audio.removeEventListener('error',failed)};this.audio.addEventListener('loadedmetadata',ready,{once:true});this.audio.addEventListener('canplay',ready,{once:true});this.audio.addEventListener('error',failed,{once:true});this.hls?.on?.(Hls.Events.ERROR,(_event,data)=>{if(data?.fatal)failed()})});
      if(generation!==this.generation)return;this.seek(track.cueIn||track.beatOffset||0);this.resetTone();
    }
    setGain(value,when=this.context.currentTime){cancelAutomation(this.gain.gain,when);this.gain.gain.setValueAtTime(clamp(value,0,1.15),when)}
    resetTone(){const now=this.context.currentTime;for(const parameter of [this.low.gain,this.mid.gain,this.high.gain,this.highpass.frequency])cancelAutomation(parameter,now);this.eq={low:0,mid:0,high:0,filter:20};this.low.gain.setValueAtTime(0,now);this.mid.gain.setValueAtTime(0,now);this.high.gain.setValueAtTime(0,now);this.highpass.frequency.setValueAtTime(20,now)}
    setEq(band,value){const gain=clamp(Number(value||0),-24,9),node=band==='low'?this.low:band==='mid'?this.mid:this.high;this.eq[band]=gain;cancelAutomation(node.gain,this.context.currentTime);node.gain.setTargetAtTime(gain,this.context.currentTime,.012)}
    setFilter(value){const normalized=clamp(Number(value||0),0,1),frequency=20*Math.pow(900,normalized);this.eq.filter=frequency;cancelAutomation(this.highpass.frequency,this.context.currentTime);this.highpass.frequency.setTargetAtTime(frequency,this.context.currentTime,.012)}
    vocalKill(enabled){this.setEq('mid',enabled?-24:0);this.setEq('low',enabled?-5:0);this.setEq('high',enabled?-4:0)}
    destroyStems(){for(const stem of Object.values(this.stems)){stem.audio.pause();try{stem.source.disconnect();stem.gain.disconnect()}catch{}URL.revokeObjectURL(stem.url)}this.stems={};this.stemMode=false;this.setLiveStemMode('all',false)}
    setLiveStemMode(mode,mark=true){const now=this.context.currentTime,isVocal=mode==='vocal',isInstrumental=mode==='instrumental';this.originalGain.gain.setTargetAtTime(isVocal||isInstrumental?0:1,now,.012);this.liveVocalGain.gain.setTargetAtTime(isVocal ? .92 : 0,now,.012);this.liveInstrumentGain.gain.setTargetAtTime(isInstrumental?1:0,now,.012);if(mark)this.stemMode='live'}
    async loadStems(stemFiles){
      const wasPlaying=!this.audio.paused,time=this.audio.currentTime,rate=this.audio.playbackRate;this.destroyStems();const created={};
      for(const item of stemFiles){const label=String(item.name||'').toLowerCase(),key=label.startsWith('vocal')?'vocal':label.startsWith('drum')?'drum':label.startsWith('bass')?'bass':'other';const audio=new Audio(),url=URL.createObjectURL(item.blob);audio.preload='auto';audio.src=url;audio.playsInline=true;audio.preservesPitch=true;audio.playbackRate=rate;const source=this.context.createMediaElementSource(audio),gain=this.context.createGain();gain.gain.value=1;source.connect(gain).connect(this.highpass);created[key]={name:item.name,audio,url,source,gain}}
      this.stems=created;try{await Promise.all(Object.values(created).map(stem=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`Stem ${stem.name} timeout`)),12000);const ready=()=>{clearTimeout(timer);resolve()};stem.audio.addEventListener('canplay',ready,{once:true});stem.audio.addEventListener('error',()=>{clearTimeout(timer);reject(new Error(`Stem ${stem.name} failed`))},{once:true});stem.audio.load()})))}catch(error){this.destroyStems();throw error}
      for(const stem of Object.values(created))stem.audio.currentTime=Math.min(time,Math.max(0,(stem.audio.duration||time+.1)-.05));
      try{if(wasPlaying)await Promise.all(Object.values(created).map(stem=>stem.audio.play()));this.liveVocalGain.gain.setTargetAtTime(0,this.context.currentTime,.008);this.liveInstrumentGain.gain.setTargetAtTime(0,this.context.currentTime,.008);this.stemMode='ai';this.originalGain.gain.setTargetAtTime(0,this.context.currentTime,.018);return Object.keys(created)}
      catch(error){this.destroyStems();this.originalGain.gain.setTargetAtTime(1,this.context.currentTime,.008);throw new Error(`Browser blocked stem playback; press the stem pad again (${error.message})`)}
    }
    setStemGain(name,value){const stem=this.stems[name];if(!stem)return;stem.gain.gain.setTargetAtTime(clamp(Number(value||0),0,1.25),this.context.currentTime,.012)}
    setRate(rate){this.audio.preservesPitch=!this.soundTouch;this.audio.playbackRate=rate;if(this.soundTouch){this.soundTouch.playbackRate.value=rate;this.soundTouch.pitch.value=1}for(const stem of Object.values(this.stems)){stem.audio.preservesPitch=true;stem.audio.playbackRate=rate}}
    syncStems(){if(!this.stemMode||this.audio.paused)return;for(const stem of Object.values(this.stems)){const drift=stem.audio.currentTime-this.audio.currentTime;if(Math.abs(drift)>.055){stem.audio.currentTime=this.audio.currentTime;stem.audio.playbackRate=this.audio.playbackRate}else if(Math.abs(drift)>.012)stem.audio.playbackRate=this.audio.playbackRate-drift*.08;else stem.audio.playbackRate=this.audio.playbackRate}}
    pause(){this.audio.pause();for(const stem of Object.values(this.stems))stem.audio.pause()}
    async play(){await this.audio.play();if(this.stemMode){try{for(const stem of Object.values(this.stems)){if(Math.abs(stem.audio.currentTime-this.audio.currentTime)>.04)stem.audio.currentTime=this.audio.currentTime;stem.playPromise=stem.audio.play()}await Promise.all(Object.values(this.stems).map(stem=>stem.playPromise))}catch(error){this.destroyStems();this.originalGain.gain.setTargetAtTime(1,this.context.currentTime,.008);console.warn('Stem playback fell back to the original mix',error)}}}
    seek(value){const target=Number.isFinite(this.audio.duration)?clamp(Number(value||0),0,Math.max(0,this.audio.duration-.035)):Math.max(0,Number(value||0));this.audio.currentTime=target;for(const stem of Object.values(this.stems))if(Number.isFinite(stem.audio.duration))stem.audio.currentTime=Math.min(target,Math.max(0,stem.audio.duration-.035))}
    features(){this.analyser.getByteFrequencyData(this.frequency);this.analyser.getFloatTimeDomainData(this.waveform);const sampleRate=this.context.sampleRate,binHz=sampleRate/this.analyser.fftSize,average=(low,high)=>{let total=0,count=0;for(let index=Math.max(1,Math.floor(low/binHz));index<=Math.min(this.frequency.length-1,Math.ceil(high/binHz));index++){total+=this.frequency[index]/255;count+=1}return total/Math.max(1,count)};let square=0;for(const value of this.waveform)square+=value*value;return{bass:average(35,180),lowMid:average(180,900),high:average(2800,12000),rms:Math.sqrt(square/this.waveform.length)}}
    state(){return{track:this.track,currentTime:Number(this.audio.currentTime||0),duration:Number.isFinite(this.audio.duration)?this.audio.duration:Number(this.track?.duration||0),paused:this.audio.paused,ended:this.audio.ended,gain:this.gain.gain.value,rate:this.audio.playbackRate,stemMode:this.stemMode,stems:Object.fromEntries(Object.entries(this.stems).map(([name,stem])=>[name,stem.gain.gain.value])),features:this.features()}}
  }

  class FlowEngine extends EventTarget{
    constructor(){
      super();const AudioContextClass=window.AudioContext||window.webkitAudioContext;this.context=new AudioContextClass({latencyHint:'interactive'});this.master=this.context.createGain();this.compressor=this.context.createDynamicsCompressor();this.compressor.threshold.value=-3;this.compressor.knee.value=4;this.compressor.ratio.value=2;this.compressor.attack.value=.004;this.compressor.release.value=.12;this.analyser=this.context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.68;this.master.connect(this.compressor).connect(this.analyser).connect(this.context.destination);this.cueBus=this.context.createMediaStreamDestination();this.cuePlayer=new Audio();this.cuePlayer.autoplay=false;this.cuePlayer.srcObject=this.cueBus.stream;this.cuePlayer.volume=.7;this.cueEnabled={a:false,b:false};
      this.decks={a:new Deck('a',this.context,this.master,(deck,error)=>this.onDeckEnded(deck,error)),b:new Deck('b',this.context,this.master,(deck,error)=>this.onDeckEnded(deck,error))};for(const deck of Object.values(this.decks))deck.cueGain.connect(this.cueBus);
      this.trackers={a:new StreamingBeatTracker(),b:new StreamingBeatTracker()};this.tracks=[];this.route=[];this.index=0;this.active='a';this.nextPrepared=false;this.preparePromise=null;this.prepareGeneration=0;this.recoveryAttempts=0;this.recoveryTimer=null;this.transitioning=false;this.running=false;this.auto=true;this.arc='wave';this.userGain={a:1,b:1};this.cross=0;this.transition=null;this.transitionToken=0;this.preAnalysis=false;this.audioRuntimePromise=null;this.analysisPromises=new Map();this.lastTick=0;this.tickTimer=setInterval(()=>this.tick(),55);
    }
    async setCueOutput(deviceId){
      if(typeof this.cuePlayer.setSinkId!=='function')throw new Error('Browser does not support separate headphone output');
      if(!deviceId)throw new Error('Select a headphone device first');
      await this.cuePlayer.setSinkId(deviceId);
      await this.resume();
      await this.cuePlayer.play();
      return this.cuePlayer.sinkId;
    }
    toggleCue(deck){
      if(!['a','b'].includes(deck))throw new Error('Unknown deck');
      if(!this.cuePlayer.sinkId)throw new Error('Select a separate headphone output before using CUE');
      this.cueEnabled[deck]=!this.cueEnabled[deck];
      this.decks[deck].cueGain.gain.setTargetAtTime(this.cueEnabled[deck]?1:0,this.context.currentTime,.01);
      this.emit('cue',{deck,enabled:this.cueEnabled[deck]});
      return this.cueEnabled[deck];
    }
    emit(type,detail={}){this.dispatchEvent(new CustomEvent(type,{detail}))}
    async resume(){if(this.context.state!=='running')await this.context.resume();this.audioRuntimePromise||=Promise.resolve(false);await this.audioRuntimePromise}
    currentTrack(){return this.route[this.index]||null}
    nextIndex(){return this.route.length?(this.index+1)%this.route.length:-1}
    nextTrack(){return this.route[this.nextIndex()]||null}
    other(name=this.active){return name==='a'?'b':'a'}
    setTracks(tracks,keepCurrent=false){const current=keepCurrent?this.currentTrack():null;this.tracks=tracks.filter(track=>!track.failed);this.route=buildRoute(this.tracks,this.arc);if(current){const index=this.route.findIndex(track=>track.id===current.id);this.index=index>=0?index:0}else this.index=0;this.emit('route',{route:this.route})}
    rebuild(arc=this.arc){this.arc=arc;this.setTracks(this.tracks,true);if(this.running)this.prepareNext().catch(error=>this.recover(error))}
    async start(){this.recoveryAttempts=0;if(this.recoveryTimer)clearTimeout(this.recoveryTimer);if(!this.route.length)throw new Error('Add music first');await this.resume();this.stopAutomation();this.active='a';this.index=0;const deck=this.decks.a,track=this.currentTrack();await deck.load(track);this.decks.b.pause();deck.setGain(this.userGain.a);this.decks.b.setGain(0);this.trackers.a.reset();await deck.play();this.running=true;this.emit('play');this.analyseTrack(track).catch(error=>this.emit('analysiserror',{error,track}));this.prepareNext().catch(error=>this.recover(error));this.tick()}
    async analyseTrack(track){
      if(!track||Number(track.confidence||0)>=.5||typeof track.getBytes!=='function')return null;
      if(this.analysisPromises.has(track.id))return this.analysisPromises.get(track.id);
      const promise=(async()=>{track.status='ANALYZING';const bytes=await track.getBytes(),buffer=await this.context.decodeAudioData(bytes.slice(0));let result;if(globalThis.FlowBeatGrid?.analyzeBuffer)result=await globalThis.FlowBeatGrid.analyzeBuffer(buffer,{duration:Math.min(150,buffer.duration)});else if(globalThis.FlowAudioLibs?.analyzeBeatGrid)result=await globalThis.FlowAudioLibs.analyzeBeatGrid(buffer,{offset:0,duration:Math.min(110,buffer.duration)});else{const mono=new Float32Array(buffer.length);for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let index=0;index<buffer.length;index++)mono[index]+=data[index]/buffer.numberOfChannels}result=analyzeChannel(mono,buffer.sampleRate)}if(!result?.bpm)throw new Error(`BPM could not be detected for ${track.title}`);Object.assign(track,result,{duration:buffer.duration,status:'ANALYZED'});track.cueIn=Math.max(0,Number(result.beatOffset||0));this.emit('analysis',{track,result});return result})().finally(()=>this.analysisPromises.delete(track.id));this.analysisPromises.set(track.id,promise);return promise;
    }
    async analysePrepared(name,track){
      if(!track||Number(track.confidence||0)>=.5)return;try{await this.analyseTrack(track)}catch(error){this.emit('analysiserror',{error,track})}
    }
    async prepareNext(){
      if(this.preparePromise)return this.preparePromise;
      const generation=++this.prepareGeneration;
      const run=async()=>{if(!this.running||this.route.length<2)return;const name=this.other(),track=this.nextTrack();this.nextPrepared=false;
      try{await this.decks[name].load(track);this.decks[name].setGain(0);await this.analysePrepared(name,track);this.decks[name].pause();this.decks[name].seek(track.cueIn||track.beatOffset||0);if(generation!==this.prepareGeneration)return;this.nextPrepared=true;this.emit('prepared',{deck:name,track})}
      catch(error){track.failed=true;this.emit('error',{error,track});this.setTracks(this.tracks.filter(item=>item.id!==track.id),true);if(this.route.length>1){queueMicrotask(()=>this.prepareNext().catch(nextError=>this.recover(nextError)))}}
      };const promise=run();this.preparePromise=promise;try{return await promise}finally{if(this.preparePromise===promise)this.preparePromise=null}
    }
    async beginTransition(force=false){
      if(!this.running||this.transitioning||this.route.length<2)return;if(!this.nextPrepared)await this.prepareNext();if(!this.nextPrepared)return;
      this.transitioning=true;const token=++this.transitionToken,fromName=this.active,toName=this.other(),from=this.decks[fromName],to=this.decks[toName],current=this.currentTrack(),next=this.nextTrack(),plan=transitionPlan(current,next),remaining=Math.max(0,from.state().duration-from.audio.currentTime);
      let delay=force?0:(plan.beats?phraseTransitionDelay(from.audio.currentTime,plan.duration,current?.bpm,current?.beatOffset||0,plan.beats):secondsToNextBar(from.audio.currentTime,current?.bpm,current?.beatOffset||0));if(delay>Math.max(.1,remaining-plan.duration-0.15))delay=0;let duration=force?Math.min(3.2,Math.max(.85,remaining-.08||3.2)):Math.min(plan.duration,Math.max(1.1,remaining-delay-.06||plan.duration));
      to.setRate(plan.rate);to.seek(next?.cueIn||next?.beatOffset||0);to.setGain(0);this.transition={token,from:fromName,to:toName,queuedAt:performance.now(),started:performance.now()+delay*1000,duration,delay,plan,current,next,progress:0};this.emit('transitionqueued',this.transition);
      if(delay)await sleep(delay*1000);if(!this.running||token!==this.transitionToken){this.transitioning=false;return}await to.play();const now=this.context.currentTime+.025,steps=192,fadeOut=new Float32Array(steps),fadeIn=new Float32Array(steps);
      for(let index=0;index<steps;index++){const progress=index/(steps-1),gain=equalPower(progress);fadeOut[index]=gain.a*this.userGain[fromName];fadeIn[index]=gain.b*this.userGain[toName]}
      for(const parameter of [from.gain.gain,to.gain.gain,from.low.gain,to.low.gain,from.highpass.frequency,to.highpass.frequency])cancelAutomation(parameter,now);
      from.gain.gain.setValueCurveAtTime(fadeOut,now,duration);to.gain.gain.setValueCurveAtTime(fadeIn,now,duration);
      from.low.gain.setValueAtTime(0,now);from.low.gain.linearRampToValueAtTime(-14,now+duration*.58);to.low.gain.setValueAtTime(-14,now);to.low.gain.linearRampToValueAtTime(0,now+duration*.7);
      from.highpass.frequency.setValueAtTime(20,now);from.highpass.frequency.exponentialRampToValueAtTime(190,now+duration);to.highpass.frequency.setValueAtTime(105,now);to.highpass.frequency.exponentialRampToValueAtTime(20,now+duration*.55);
      if(from.stemMode&&to.stemMode){const pairs=[['vocal',from.stems.vocal,to.stems.vocal],['drum',from.stems.drum,to.stems.drum]];this.transition.stemRestore={};for(const[name,outgoing,incoming]of pairs){if(!outgoing||!incoming)continue;const outValue=outgoing.gain.gain.value,inValue=incoming.gain.gain.value;this.transition.stemRestore[name]={outValue,inValue};for(const parameter of [outgoing.gain.gain,incoming.gain.gain])cancelAutomation(parameter,now);if(name==='vocal'){outgoing.gain.gain.setValueAtTime(outValue,now);outgoing.gain.gain.linearRampToValueAtTime(.06,now+duration*.48);incoming.gain.gain.setValueAtTime(0,now);incoming.gain.gain.linearRampToValueAtTime(inValue,now+duration*.72)}else{outgoing.gain.gain.setValueAtTime(outValue,now);outgoing.gain.gain.linearRampToValueAtTime(outValue*.48,now+duration*.78);incoming.gain.gain.setValueAtTime(inValue*.22,now);incoming.gain.gain.linearRampToValueAtTime(inValue,now+duration*.28)}}this.transition.plan={...this.transition.plan,mode:'NEURAL STEM MIX',reason:'bar aligned · vocal handoff · drum swap'}}
      this.transition.started=performance.now()+25;this.emit('transitionstart',this.transition);setTimeout(()=>this.finishTransition(token),duration*1000+60);
    }
    finishTransition(token=this.transition?.token){if(!this.transition||token!==this.transitionToken)return;const{from,to,stemRestore}=this.transition;if(stemRestore){for(const[name,values]of Object.entries(stemRestore)){this.decks[from].setStemGain(name,values.outValue);this.decks[to].setStemGain(name,values.inValue)}}this.decks[from].pause();this.decks[from].setRate(1);this.decks[from].resetTone();this.decks[from].setGain(0);this.decks[to].setRate(1);this.decks[to].resetTone();this.decks[to].setGain(this.userGain[to]);this.recoveryAttempts=0;this.active=to;this.cross=to==='a'?0:1;this.index=this.nextIndex();this.transition=null;this.transitioning=false;this.nextPrepared=false;this.trackers[from].reset();this.emit('transitionend',{active:to,track:this.currentTrack()});this.prepareNext().catch(error=>this.recover(error))}
    async onDeckEnded(deck,error){if(deck.name!==this.active||!this.running)return;if(error)this.emit('error',{error,track:deck.track});if(this.transitioning){this.finishTransition();return}await this.beginTransition(true);if(!this.transitioning&&this.route.length===1){deck.seek(deck.track?.cueIn||0);await deck.play()}}
    async toggle(){if(!this.running)return this.start();await this.resume();const active=this.decks[this.active];if(active.audio.paused){await active.play();this.emit('play')}else{active.pause();if(this.transition)this.decks[this.other()].pause();this.emit('pause')}}
    seek(value){this.decks[this.active].seek(value);this.trackers[this.active].reset();this.tick()}
    skip(){return this.beginTransition(true)}
    setAuto(value){this.auto=Boolean(value);this.emit('auto',{auto:this.auto})}
    setCross(value){this.auto=false;this.cross=clamp(value,0,1);const gain=equalPower(this.cross);this.decks.a.setGain(gain.a*this.userGain.a);this.decks.b.setGain(gain.b*this.userGain.b);this.emit('auto',{auto:false})}
    setUserGain(deck,value){this.userGain[deck]=clamp(value,0,1);if(!this.transitioning){if(this.auto)this.decks[deck].setGain(deck===this.active?this.userGain[deck]:0);else this.setCross(this.cross)}}
    setDeckEq(deck,band,value){this.decks[deck]?.setEq(band,value);this.emit('deckcontrol',{deck,band,value:Number(value)})}
    setDeckFilter(deck,value){this.decks[deck]?.setFilter(value);this.emit('deckcontrol',{deck,filter:Number(value)})}
    setVocalKill(deck,enabled){this.decks[deck]?.vocalKill(Boolean(enabled));this.emit('deckcontrol',{deck,vocalKill:Boolean(enabled)})}
    setTempo(deck,percent){const rate=clamp(1+Number(percent||0)/100,.84,1.16);this.decks[deck].setRate(rate);this.emit('deckcontrol',{deck,rate})}
    async installStems(deck,stems){const names=await this.decks[deck].loadStems(stems);this.emit('stems',{deck,names});return names}
    setStemGain(deck,stem,value){this.decks[deck]?.setStemGain(stem,value);this.emit('stemcontrol',{deck,stem,value:Number(value)})}
    soloStem(deck,stem,enabled){for(const name of ['vocal','drum','bass','other'])this.decks[deck]?.setStemGain(name,enabled?(name===stem?1:0):1);this.emit('stemcontrol',{deck,stem,solo:Boolean(enabled)})}
    async loadToDeck(deckName, track) {
      if (!['a', 'b'].includes(deckName)) throw new Error('Invalid deck');
      if (!track || track.failed) throw new Error('Select an available track');
      await this.resume();
      // Cancel queued automated fades without stopping the other live deck.
      this.transitionToken += 1;
      this.transition = null;
      this.transitioning = false;
      this.auto = false;
      this.running = true;
      const target = this.decks[deckName];
      // Prevent an old asynchronous stream resolution from winning over a newer selection.
      const generation = (this.manualLoadGeneration ??= {a:0,b:0});
      const token = ++generation[deckName];
      try {
        await target.load(track);
        if (token !== generation[deckName] || target.track?.id !== track.id) return false;
        target.pause();
        target.seek(track.cueIn || track.beatOffset || 0);
        this.analyseTrack(track).catch(error=>this.emit('analysiserror',{error,track}));
        this.trackers[deckName].reset();
        this.cross = this.decks.a.track && this.decks.b.track ? 0.5 : (deckName === 'a' ? 0 : 1);
        const levels = equalPower(this.cross);
        this.decks.a.setGain(levels.a * this.userGain.a);
        this.decks.b.setGain(levels.b * this.userGain.b);
        this.emit('auto', {auto:false});
        this.emit('prepared', {deck:deckName,track});
        this.tick();
        return true;
      } catch(error) {
        if (token === generation[deckName]) this.emit('error', {error,track});
        throw error;
      }
    }
    async toggleDeck(deck){await this.resume();const target=this.decks[deck];if(!target.track)throw new Error(`Deck ${deck.toUpperCase()} is empty`);target.audio.paused?await target.play():target.pause();this.running=true;this.auto=false;this.emit('auto',{auto:false});this.tick()}
    cueDeck(deck){const target=this.decks[deck];if(!target.track)return;target.pause();target.seek(target.track.cueIn||target.track.beatOffset||0);this.trackers[deck].reset();this.tick()}
    syncDeck(deck){const masterName=deck==='a'?'b':'a',master=this.decks[masterName],target=this.decks[deck],masterBpm=master.track?.bpm,targetBpm=target.track?.bpm;if(!masterBpm||!targetBpm)throw new Error('BPM grid is not ready');const rate=safePlaybackRate(masterBpm*master.audio.playbackRate,targetBpm,.12);target.setRate(rate);const masterOffset=Number(master.track?.beatOffset||0),targetOffset=Number(target.track?.beatOffset||0),masterBeat=60/normalizeBpm(masterBpm),targetBeat=60/normalizeBpm(targetBpm),masterPhase=(((master.audio.currentTime-masterOffset)/masterBeat)%1+1)%1,relative=target.audio.currentTime-targetOffset,aligned=(Math.round(relative/targetBeat-masterPhase)+masterPhase)*targetBeat;target.seek(Math.max(0,targetOffset+aligned));this.emit('deckcontrol',{deck,rate,syncedTo:masterName});return rate}
    stopAutomation(){this.transitionToken+=1;this.transition=null;this.transitioning=false;for(const deck of Object.values(this.decks)){deck.pause();deck.setGain(0);deck.resetTone()}}
    stop(){this.running=false;this.prepareGeneration+=1;if(this.recoveryTimer)clearTimeout(this.recoveryTimer);this.recoveryTimer=null;this.stopAutomation();this.emit('stop')}
    recover(error){this.emit('error',{error});if(!this.running)return;if(this.recoveryAttempts>=3){this.stop();this.emit('error',{error:new Error('Playback stopped after repeated recovery failures')});return}this.recoveryAttempts+=1;if(this.recoveryTimer)clearTimeout(this.recoveryTimer);this.recoveryTimer=setTimeout(()=>{this.recoveryTimer=null;if(this.running)this.beginTransition(true).catch(nextError=>this.recover(nextError))},Math.min(5000,250*2**(this.recoveryAttempts-1)))}
    tick(){
      if(!this.running)return;const state=this.snapshot(),active=state[this.active],now=performance.now();
      for(const name of ['a','b']){const deckState=state[name];this.decks[name].syncStems();if(deckState.paused||this.preAnalysis&&name!==this.active)continue;const result=this.trackers[name].push(deckState.currentTime,deckState.features.bass,deckState.features.rms),track=deckState.track;if(track&&result.bpm&&result.confidence>Number(track.confidence||0)){Object.assign(track,result);this.emit('analysis',{track,result})}}
      if(this.auto&&!this.transitioning&&this.nextPrepared){const next=this.nextTrack();if(next&&active.duration>0){const plan=transitionPlan(this.currentTrack(),next),remaining=active.duration-active.currentTime,lead=plan.duration+(plan.beats?plan.phraseSeconds:(Math.min(plan.barSeconds||0,2.4)))+.25;if(remaining<=lead)this.beginTransition(false)}}
      if(this.transition){const start=this.transition.started||now,progress=clamp((now-start)/(this.transition.duration*1000),0,1);this.transition.progress=progress;state.transition={...this.transition,progress};state.mix=progress}else state.mix=this.active==='a'?0:1;
      this.lastTick=now;this.emit('tick',state);
    }
    snapshot(){return{a:this.decks.a.state(),b:this.decks.b.state(),active:this.active,index:this.index,route:this.route,running:this.running,auto:this.auto,mix:this.cross,transition:this.transition}}
    meter(){const frequency=new Uint8Array(this.analyser.frequencyBinCount),waveform=new Float32Array(this.analyser.fftSize);this.analyser.getByteFrequencyData(frequency);this.analyser.getFloatTimeDomainData(waveform);return{frequency,waveform,a:this.decks.a.features(),b:this.decks.b.features()}}
    spectrum(){return this.meter().frequency}
  }

  return{clamp,normalizeBpm,equalPower,safePlaybackRate,secondsToNextBar,phraseTransitionDelay,transitionPlan,buildRoute,analyzeChannel,analyzeFile,StreamingBeatTracker,FlowEngine};
});
