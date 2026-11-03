const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {chromium}=require('playwright-core');

const extensionPath=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'flow-vk-bpm-'));

function wav120(seconds=16){
  const rate=44100,samples=rate*seconds,body=Buffer.alloc(samples*2),beat=rate*.5;
  for(let index=0;index<samples;index++){
    const phase=index%beat,kick=phase<rate*.08?Math.sin(index*2*Math.PI*58/rate)*Math.exp(-phase/(rate*.02)):0;
    body.writeInt16LE(Math.round(Math.max(-1,Math.min(1,kick*.8+Math.sin(index*2*Math.PI*220/rate)*.08))*32767),index*2);
  }
  const header=Buffer.alloc(44);header.write('RIFF',0);header.writeUInt32LE(36+body.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(body.length,40);return Buffer.concat([header,body]);
}

(async()=>{
  const context=await chromium.launchPersistentContext(profile,{
    executablePath:'/Applications/Arc.app/Contents/MacOS/Arc',headless:true,
    ignoreDefaultArgs:['--disable-extensions'],
    args:[`--disable-extensions-except=${extensionPath}`,`--load-extension=${extensionPath}`,'--no-first-run','--no-default-browser-check']
  });
  try{
    await context.route('https://vk.com/flow-vk-bpm-test.wav',route=>route.fulfill({status:200,contentType:'audio/wav',body:wav120()}));
    let workers=context.serviceWorkers();if(!workers.length)workers=[await context.waitForEvent('serviceworker',{timeout:15000})];
    const worker=workers.find(item=>item.url().startsWith('chrome-extension://'));assert.ok(worker,'extension service worker did not start');
    const extensionId=new URL(worker.url()).host,page=await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/app/index.html`);
    await page.evaluate(()=>{
      window.addEventListener('message',event=>{if(event.data?.type==='flow:resolve-track')window.postMessage({type:'flow:resolved-track',requestId:event.data.requestId,ok:true,mediaUrl:'https://vk.com/flow-vk-bpm-test.wav'},'*')});
      window.postMessage({type:'flow:library',tracks:[{key:'1_120',title:'VK Remote 120',artist:'FLOW Test'}]},'*');
    });
    await page.waitForFunction(()=>document.querySelector('.track-row b')?.textContent==='VK Remote 120',{timeout:10000});
    await page.waitForFunction(()=>document.querySelector('.track-row span:nth-child(3) b')?.textContent!=='—',{timeout:30000});
    const bpm=Number(await page.locator('.track-row span:nth-child(3) b').textContent());
    assert.ok(Math.abs(bpm-120)<=1,`remote VK-style BPM was ${bpm}`);
    console.log(JSON.stringify({ok:true,source:'extension fetch of VK-style signed URL',bpm,version:await worker.evaluate(()=>chrome.runtime.getManifest().version)}));
  }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true})}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1});
