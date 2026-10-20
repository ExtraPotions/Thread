'use strict';
// Finite native-vs-companion measurement on the same authored DOM; not a live Reddit benchmark.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]}));
const fixture=require('./fixture.cjs'),root=path.resolve(__dirname,'..'),out=path.resolve(root,'../local-verification/reddit-runtime-20261020/resources.json');
const source=fs.readFileSync(path.join(root,'thread.user.js'),'utf8').replace('const ui=new RC.UI(runtime);','const ui=new RC.UI(runtime);window.__thread={RC,runtime,ui};');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const data={kind:'Authored fixture, shell156; fixed 2×12 route workloads, 200 rows, 30 inserted/removed nodes per route',modes:{}};
 for(const enhanced of [false,true]){
  const page=await browser.newPage({viewport:{width:1280,height:800}});await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:fixture}):r.abort());await page.goto('https://www.reddit.com/r/example/');
  await page.evaluate(()=>{const storage=new Map();window.GM_getValue=(k,d)=>storage.get(k)??d;window.GM_setValue=(k,v)=>storage.set(k,v);window.GM_deleteValue=k=>storage.delete(k);window.GM_addValueChangeListener=()=>1;window.GM_removeValueChangeListener=()=>{};window.GM_xmlhttpRequest=()=>({abort(){}});for(let i=0;i<200;i++){const p=document.createElement('shreddit-post');p.id='retained'+i;p.setAttribute('post-title','Measured authored row '+i);p.innerHTML='<h2 slot="title">Measured authored row</h2><p slot="text-body">Representative fixture content, no account data.</p>';document.querySelector('shreddit-feed').append(p);}});
  if(enhanced)await page.addScriptTag({content:source});await page.waitForTimeout(500);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
  const snapshot=async()=>{await cdp.send('HeapProfiler.collectGarbage');const heap=await cdp.send('Runtime.getHeapUsage'),metrics=await cdp.send('Performance.getMetrics');return {heapUsed:heap.usedSize,metrics:Object.fromEntries(metrics.metrics.filter(m=>['ScriptDuration','TaskDuration','Nodes','JSEventListeners'].includes(m.name)).map(m=>[m.name,m.value])),runtime:enhanced?await page.evaluate(()=>window.__thread.runtime.diagnostics()):null};};
  const stages=[await snapshot()];
  for(let round=0;round<2;round++){for(let i=0;i<12;i++){await page.evaluate(i=>{history.pushState({},'','/r/example/?round='+i);const feed=document.querySelector('shreddit-feed');const holder=document.createElement('div');for(let n=0;n<30;n++){const p=document.createElement('shreddit-post');p.id='removed'+n;p.setAttribute('post-title','Transient');holder.append(p);}feed.append(holder);holder.remove();scrollTo(0,i%2?0:document.body.scrollHeight);},round*12+i);await page.waitForTimeout(190);}stages.push(await snapshot());}
  if(enhanced){for(const s of stages){assert(s.runtime.loaded<=250);assert(s.runtime.readTimers<=250);assert.equal(s.runtime.regexWorkers,0);}await page.evaluate(()=>window.__thread.runtime.destroy());await page.waitForTimeout(300);stages.push(await snapshot());assert.equal(stages.at(-1).runtime.loaded,0);}
  data.modes[enhanced?'thread':'native']=stages;await cdp.detach();await page.close();
 }
 const native=data.modes.native,thread=data.modes.thread;data.measured={nativeHeapAfter24:native[2].heapUsed,threadHeapAfter24:thread[2].heapUsed,incrementalHeap:thread[2].heapUsed-native[2].heapUsed,threadGrowthSecond12:thread[2].heapUsed-thread[1].heapUsed,threadScriptSeconds:thread[2].metrics.ScriptDuration-thread[0].metrics.ScriptDuration,nativeScriptSeconds:native[2].metrics.ScriptDuration-native[0].metrics.ScriptDuration};
 data.resourceBudgets={retainedNearbyNodes:250,exposureTimers:250,workersAfterBatch:0,retainedHeapGrowthAdvisoryBytes:Math.max(524288,Math.round(native[2].heapUsed*.35))};data.heapGrowthWithinAdvisory=data.measured.threadGrowthSecond12<=data.resourceBudgets.retainedHeapGrowthAdvisoryBytes;
 fs.writeFileSync(out,JSON.stringify(data,null,2));console.log(JSON.stringify({measured:data.measured,heapGrowthWithinAdvisory:data.heapGrowthWithinAdvisory},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
