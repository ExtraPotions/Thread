'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]}));
const script=fs.readFileSync(process.env.THREAD_MEDIA_SCRIPT||path.join(__dirname,'../thread.user.js'),'utf8');
test('inline images, YouTube frames and embeds remain fully visible in every Thread view',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 const failures=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(5000);
  await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='i.redd.it')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="960"><rect width="640" height="960" fill="#203c61"/></svg>'});if(url.hostname==='www.youtube.com')return route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#111;color:white"><button style="display:block;margin:300px 0 0 auto" onclick="parent.postMessage(\'played\',\'*\')">Play native video</button></body>'});return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{margin:0}main{max-width:800px;margin:auto}shreddit-post{display:block}img{max-width:100%;height:auto}</style></head><body><header><a href="/login">Log In</a></header><main><shreddit-feed><shreddit-post id="t3_media" author="reader" post-title="Native media fixture" permalink="/r/example/comments/media/test/"><h2 slot="title">Native media</h2><div slot="post-media-container"><img src="https://i.redd.it/portrait.svg" width="640" height="960" alt="Entire portrait"><iframe title="YouTube native embed" src="https://www.youtube.com/embed/fixture" width="640" height="360"></iframe><div id="embed" style="height:700px;background:#243"><button id="embed-bottom" style="margin-top:650px">Embedded content action</button></div></div><button aria-label="Save post">Save</button></shreddit-post></shreddit-feed></main></body></html>'});});
  await page.goto('https://www.reddit.com/r/example/');await page.evaluate(()=>{const storage=new Map();window.GM_getValue=(k,d)=>storage.get(k)||d;window.GM_setValue=(k,v)=>storage.set(k,v);window.GM_xmlhttpRequest=()=>{};addEventListener('message',e=>{if(e.data==='played')window.__played=true;});});
  await page.addScriptTag({content:script});const control=page.getByRole('combobox',{name:'Content view',exact:true});await control.waitFor();
  for(const view of ['cards','compact','grid'])for(const slot of ['post-media-container','expando-content']){
   await page.locator('shreddit-post>div[slot]').evaluate((n,slot)=>n.setAttribute('slot',slot),slot);await control.selectOption(view);await page.waitForFunction(view=>document.querySelector('#t3_media')?.getAttribute('data-rc-view')===view,view);
   if(view==='compact'&&slot==='post-media-container'){await page.getByRole('button',{name:'Open media',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#t3_media').hasAttribute('data-rc-compact-media-open'));}
   const result=await page.locator('shreddit-post>div[slot]').evaluate(n=>{const image=n.querySelector('img'),frame=n.querySelector('iframe'),r=n.getBoundingClientRect(),i=image.getBoundingClientRect(),f=frame.getBoundingClientRect();return{height:n.clientHeight,scroll:n.scrollHeight,width:r.width,imageWidth:i.width,imageRatio:i.width/i.height,frameWidth:f.width,overflow:getComputedStyle(n).overflow};});
   if(result.height<result.scroll-2||result.imageWidth<Math.min(250,result.width)-1||result.frameWidth>result.width+1||Math.abs(result.imageRatio-2/3)>.02)failures.push({width,view,slot,...result});
   if(!failures.length){await page.evaluate(()=>window.__played=false);await page.locator('iframe').scrollIntoViewIfNeeded();await page.frameLocator('iframe').getByRole('button',{name:'Play native video'}).click();await page.waitForFunction(()=>window.__played===true);await page.locator('#embed-bottom').click();}
  }
  await page.close();
 }
 assert.deepEqual(failures,[],'Thread must not crop full native media or turn it into an unreadable thumbnail');
});
