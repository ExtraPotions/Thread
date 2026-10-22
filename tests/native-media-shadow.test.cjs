'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]}));
test('feed thumbnails retain native size while opened media gets the full post width',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 for(const width of [320,390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='i.redd.it'?route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="960"><rect width="640" height="960" fill="#203c61"/></svg>'}):route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width"><style>body{margin:0}main{max-width:800px;margin:auto}.contents{display:contents}.hidden{display:none}.native-thumb{width:104px;height:78px;overflow:hidden}.native-thumb img{width:100%;height:100%;object-fit:cover}</style><header><a href="/login">Log In</a></header><main><shreddit-feed><shreddit-post id="t3_shadow" view-type="compactView" author="reader" post-title="Native shadow media" permalink="/r/example/comments/shadow/test/"><div slot="thumbnail" class="contents"><div><div slot="thumbnail" class="native-thumb"><img src="https://i.redd.it/portrait.svg" width="640" height="960" alt="Portrait"></div></div></div><h2 slot="title">Native shadow media</h2><div id="expando" slot="expando-content" class="hidden"><div style="height:700px;background:#203c61"><button style="margin-top:650px" id="bottom">Native player controls</button></div></div><button slot="overflow-menu-bar" id="expand" onclick="document.querySelector(\'#expando\').classList.toggle(\'hidden\')">Expand native media</button></shreddit-post></shreddit-feed></main>'}));
  await page.goto('https://www.reddit.com/r/example/');
  await page.evaluate(()=>{const p=document.querySelector('shreddit-post');p.attachShadow({mode:'open'}).innerHTML='<style>:host{display:block}.native-grid{display:grid;grid-template-columns:104px 1fr}.thumb{grid-column:1;grid-row:1/3}.title{grid-column:2;grid-row:1}.actions{grid-column:2;grid-row:2}.expando{grid-column:2;grid-row:3;overflow:hidden}</style><div class="native-grid"><div class="thumb"><slot name="thumbnail"></slot></div><div class="title"><slot name="title"></slot><slot name="desktop-cta-row"></slot></div><div class="actions"><slot name="overflow-menu-bar"></slot></div><div class="expando"><slot name="expando-content"></slot></div></div>';const storage=new Map();window.GM_getValue=(k,d)=>storage.get(k)||d;window.GM_setValue=(k,v)=>storage.set(k,v);window.GM_xmlhttpRequest=()=>{};});
  await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../thread.user.js'),'utf8')});const control=page.getByRole('combobox',{name:'Content view',exact:true});await control.waitFor();
  for(const view of ['cards','compact','grid']){
   await control.selectOption(view);await page.waitForFunction(view=>document.querySelector('shreddit-post').getAttribute('data-rc-view')===view,view);
   assert.equal(await page.locator('shreddit-post').getAttribute('view-type'),'compactView','the native renderer must retain its matching expando slot');
   const media=await page.locator('.native-thumb').evaluate(n=>({width:n.getBoundingClientRect().width,height:n.clientHeight,scroll:n.scrollHeight}));
   if(view!=='cards')await page.locator('.rc-compact-actions summary').click();
   assert.equal(await page.getByRole('button',{name:'Tag / note',exact:true}).isVisible(),true);
   assert.equal(Math.round(media.width),104,'feed thumbnail must retain its native width: '+JSON.stringify({width,view,media}));assert.equal(media.height,78,'feed thumbnail must retain its native height');
   assert.equal(await page.locator('#expando').isVisible(),false,'Thread must not open native gated/closed media');
   if(process.env.THREAD_MEDIA_EVIDENCE&&view==='cards'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:process.env.THREAD_MEDIA_EVIDENCE+'-'+width+'-closed.png',fullPage:true});}
   await page.locator('#expand').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#expando').isVisible(),true);
   const opened=await page.locator('#expando').evaluate(n=>({width:n.getBoundingClientRect().width,height:n.clientHeight,scroll:n.scrollHeight,post:n.closest('shreddit-post').clientWidth}));assert(opened.width>=opened.post-40,'opened media should span the post width');assert(opened.height>=opened.scroll-1,'opened media must not be cropped');
   await page.locator('#bottom').click();if(process.env.THREAD_MEDIA_EVIDENCE&&view==='cards'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:process.env.THREAD_MEDIA_EVIDENCE+'-'+width+'-opened.png',fullPage:true});}await page.locator('#expand').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#expando').isVisible(),false);assert.equal(Math.round((await page.locator('.native-thumb').boundingBox()).width),104);
  }
  await control.selectOption('native');await page.waitForFunction(()=>!document.querySelector('shreddit-post').hasAttribute('data-rc-view'));
  assert.equal(await page.evaluate(()=>document.querySelector('shreddit-post').shadowRoot.querySelectorAll('style[data-rc-media-layout]').length),0);
  assert.equal(Math.round((await page.locator('.native-thumb').boundingBox()).width),104);await page.close();
 }
});
