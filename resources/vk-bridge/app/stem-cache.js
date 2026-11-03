(function(root){
  'use strict';

  const DB_NAME='flow-dj-stems-v1';
  const STORE='stems';
  const ANALYSIS_STORE='analysis';
  const MODEL='mdx-inst-hq-3-local-v1';
  const MAX_ENTRIES=6;
  let databasePromise;

  function openDatabase(){
    if(databasePromise)return databasePromise;
    databasePromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,2);
      request.onupgradeneeded=()=>{
        const database=request.result;
        if(!database.objectStoreNames.contains(STORE)){
          const store=database.createObjectStore(STORE,{keyPath:'key'});
          store.createIndex('updatedAt','updatedAt');
        }
        if(!database.objectStoreNames.contains(ANALYSIS_STORE))database.createObjectStore(ANALYSIS_STORE,{keyPath:'key'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Stem cache could not open'));
    });
    return databasePromise;
  }

  function requestResult(request){
    return new Promise((resolve,reject)=>{
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Stem cache request failed'));
    });
  }

  function transactionDone(transaction){
    return new Promise((resolve,reject)=>{
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error||new Error('Stem cache transaction failed'));
      transaction.onabort=()=>reject(transaction.error||new Error('Stem cache transaction aborted'));
    });
  }

  function keyFor(track){
    if(!track)return '';
    const identity=track.remote
      ? `vk:${track.key||track.id}`
      : `file:${track.file?.name||track.title}:${track.file?.size||0}:${track.file?.lastModified||0}`;
    return `${MODEL}:${identity}`;
  }

  async function get(track){
    const key=keyFor(track);if(!key)return null;
    const database=await openDatabase(),transaction=database.transaction(STORE,'readonly');
    const entry=await requestResult(transaction.objectStore(STORE).get(key));
    if(!entry||entry.model!==MODEL||!Array.isArray(entry.stems)||entry.stems.length<2)return null;
    return entry;
  }

  async function put(track,stems){
    const key=keyFor(track);if(!key||!Array.isArray(stems)||stems.length<2)return null;
    const normalized=stems.map(stem=>({name:String(stem.name||''),blob:stem.blob})).filter(stem=>stem.blob instanceof Blob&&stem.blob.size);
    if(normalized.length<2)throw new Error('Stem cache received incomplete audio');
    const database=await openDatabase(),transaction=database.transaction(STORE,'readwrite');
    const entry={key,model:MODEL,title:track.title||'',updatedAt:Date.now(),bytes:normalized.reduce((sum,stem)=>sum+stem.blob.size,0),stems:normalized};
    transaction.objectStore(STORE).put(entry);await transactionDone(transaction);await prune();return entry;
  }

  async function prune(){
    const database=await openDatabase(),transaction=database.transaction(STORE,'readwrite'),store=transaction.objectStore(STORE);
    const entries=await requestResult(store.getAll());
    entries.sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
    for(const entry of entries.slice(MAX_ENTRIES))store.delete(entry.key);
    await transactionDone(transaction);
  }

  async function clear(){
    const database=await openDatabase(),transaction=database.transaction([STORE,ANALYSIS_STORE],'readwrite');
    transaction.objectStore(STORE).clear();transaction.objectStore(ANALYSIS_STORE).clear();await transactionDone(transaction);
  }

  async function getAnalysis(track){
    const key=keyFor(track);if(!key)return null;
    const database=await openDatabase(),transaction=database.transaction(ANALYSIS_STORE,'readonly');
    return await requestResult(transaction.objectStore(ANALYSIS_STORE).get(key))||null;
  }

  async function putAnalysis(track,result){
    const key=keyFor(track);if(!key||!result?.bpm)return null;
    const database=await openDatabase(),transaction=database.transaction(ANALYSIS_STORE,'readwrite');
    const entry={key,updatedAt:Date.now(),bpm:result.bpm,confidence:result.confidence,beatOffset:result.beatOffset,beats:result.beats,energy:result.energy,peak:result.peak,wave:result.wave,analyzer:result.analyzer};
    transaction.objectStore(ANALYSIS_STORE).put(entry);await transactionDone(transaction);return entry;
  }

  root.FlowStemCache={MODEL,MAX_ENTRIES,keyFor,get,put,prune,clear,getAnalysis,putAnalysis};
})(globalThis);
