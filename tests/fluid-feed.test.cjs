'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]})),source=fs.readFileSync(path.join(__dirname,'../thread.user.js'),'utf8');
// Reddit-shaped feed: a sort row loader above the feed, mixed post heights, an ad, separators and an empty page loader.
const post=(id,h,media)=>`<article><shreddit-post id="${id}" author="author_${id}" permalink="/r/example/comments/${id}/post/" view-type="cardView"><div slot="credit-bar">r/example</div><a slot="title" href="/r/example/comments/${id}/post/">Post ${id}</a>${media?`<div slot="post-media-container" style="position:relative;overflow:hidden;border-radius:16px"><div data-aspect-ratio-container style="position:relative;width:100%;aspect-ratio:4/3;overflow:hidden"><img alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='600'/%3E"></div></div>`:`<div slot="text-body" style="height:${h}px">Body</div>`}<div slot="overflow-menu-bar"><button>Share</button></div></shreddit-post></article><hr>`;
const page=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}shreddit-post,shreddit-ad-post{display:block;padding:4px 16px}</style><main><div class="sort-row"><shreddit-async-loader bundlename="shreddit_sort_dropdown"><div style="display:flex;height:32px"><button>Best</button><button>View</button></div></shreddit-async-loader></div><hr><shreddit-feed>${post('t3_a',40,true)}${post('t3_b',260)}<shreddit-ad-post id="t3_ad" view-type="cardView"><div slot="credit-bar">u/Advertiser</div><div slot="title">Ad</div><div slot="post-media-container" style="height:180px"></div></shreddit-ad-post><hr>${post('t3_c',80)}${post('t3_d',420)}${post('t3_e',120)}<faceplate-loader></faceplate-loader></shreddit-feed></main>`;
test('feed controls join the native sort row; Grid packs without holes; Cards media letterboxes; Compact ads use the native compact layout',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 for(const [viewport,reducedMotion] of [[{width:834,height:1194},'no-preference'],[{width:1194,height:834},'no-preference'],[{width:834,height:1194},'reduce']]){
  const p=await browser.newPage({viewport,hasTouch:true,isMobile:true,reducedMotion});p.setDefaultTimeout(5000);await p.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:page}):r.abort());await p.goto('https://www.reddit.com/r/example/');
  await p.evaluate(()=>{const s=new Map();window.GM_getValue=(k,d)=>s.has(k)?s.get(k):d;window.GM_setValue=(k,v)=>s.set(k,v);window.GM_xmlhttpRequest=()=>{};});
  const feedTop=async()=>p.evaluate(()=>Math.round(document.querySelector('shreddit-feed').getBoundingClientRect().y)),nativeTop=await feedTop();
  await p.addScriptTag({content:source});const select=p.getByRole('combobox',{name:'Content view',exact:true});await select.waitFor();
  assert.equal(await p.evaluate(()=>{const bar=document.querySelector('.rc-pagebar');return bar.parentElement.classList.contains('sort-row')&&bar.previousElementSibling.localName==='shreddit-async-loader';}),true,'controls sit in the native sort row');
  assert.equal(await feedTop(),nativeTop,'the feed keeps its native start');
  const view=async v=>{await select.selectOption(v);await p.waitForFunction(v=>(document.querySelector('#t3_a').getAttribute('data-rc-view')||'native')===v,v);await p.waitForTimeout(250);};
  await view('cards');const media=await p.locator('#t3_a img').evaluate(n=>{const f=n.closest('[data-aspect-ratio-container]').getBoundingClientRect(),r=n.getBoundingClientRect();return {f:[f.width,f.height],r:[r.width,r.height],fit:getComputedStyle(n).objectFit};});
  assert.deepEqual(media.r,media.f,'the native frame keeps the whole image');assert.equal(media.fit,'contain');
  await view('grid');const cells=await p.evaluate(()=>[...document.querySelectorAll('[data-rc-view-wrapper]')].map(n=>{const r=n.getBoundingClientRect();return {ad:!!n.matches('shreddit-ad-post'),x:Math.round(r.x),y:r.y,w:Math.round(r.width),bottom:r.bottom};}));
  assert.equal(cells.length,6,'every post and the ad is a cell');assert.equal(new Set(cells.map(c=>c.w)).size,1,'the ad takes one cell like a post');
  const columns=Object.values(cells.reduce((all,c)=>((all[c.x]??=[]).push(c),all),{}));assert(columns.length>1,'more than one column at '+viewport.width);
  for(const column of columns){column.sort((a,b)=>a.y-b.y);for(let i=1;i<column.length;i++){const gap=column[i].y-column[i-1].bottom;assert(gap>=11&&gap<=16,'no hole between stacked cells: '+JSON.stringify({gap,viewport}));}}
  assert.equal(await p.locator('faceplate-loader').getAttribute('data-rc-view-aux'),'1','empty loaders sit at the grid end');
  await view('compact');assert.equal(await p.locator('#t3_ad').getAttribute('view-type'),'compactView');
  const summary=p.locator('#t3_b summary');await summary.tap();await p.waitForFunction(()=>document.querySelector('#t3_b .rc-action-items').matches(':popover-open'));
  const rows=await p.locator('#t3_b .rc-action-items > button').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width),Math.round(r.height)];}));
  assert(rows.length>1&&new Set(rows.map(r=>r[0])).size===1&&new Set(rows.map(r=>r[1])).size===1,'menu rows stack full width: '+JSON.stringify(rows));assert(rows.every(r=>r[2]>=44),'touch rows are at least 44px');
  assert.equal(await p.locator('#t3_b .rc-action-items').evaluate(n=>[getComputedStyle(n).borderRadius,getComputedStyle(n).boxShadow.includes('4px 10px')].join()),'7px,true');
  assert.equal(await p.locator('#t3_b .rc-action-items').evaluate(n=>getComputedStyle(n).transitionDuration.split(',').some(d=>parseFloat(d)>0)),reducedMotion!=='reduce','menu motion follows the reduced-motion preference');
  await summary.tap();await view('native');assert.equal(await p.locator('#t3_ad').getAttribute('view-type'),'cardView','native view restores the ad');assert.equal(await p.locator('[data-rc-view-wrapper],[data-rc-view-aux],[data-rc-view-container]').count(),0);
  await p.evaluate(()=>window.__thread?.runtime?.destroy?.());await p.close();
 }
});
