'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]})),fixture=require('./fixture.cjs'),source=fs.readFileSync(process.env.THREAD_OVERLAY_SCRIPT||path.join(__dirname,'../thread.user.js'),'utf8');
test('iPad taps reach Thread controls above a native full-post-link overlay in every view',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 for(const viewport of [{width:820,height:1180},{width:1180,height:820}])for(const view of ['native','cards','compact','grid']){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage();page.setDefaultTimeout(5000);await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:fixture}):r.abort());await page.goto('https://www.reddit.com/r/example/');
  await page.evaluate(()=>{const store=new Map();window.GM_getValue=(k,d)=>store.get(k)||d;window.GM_setValue=(k,v)=>store.set(k,v);window.GM_xmlhttpRequest=()=>{};const post=document.querySelector('#t3_one'),a=document.createElement('a');post.style.position='relative';a.href='#native-post';a.slot='full-post-link';a.tabIndex=-1;a.setAttribute('aria-hidden','true');a.style.cssText='position:absolute;inset:0;z-index:0';post.prepend(a);});
  await page.addScriptTag({content:source});const select=page.getByRole('combobox',{name:'Content view',exact:true});await select.waitFor();await select.selectOption(view);await page.waitForFunction(v=>(document.querySelector('#t3_one').getAttribute('data-rc-view')||'native')===v,view);
  const post=page.locator('#t3_one'),target=post.locator('summary');await target.scrollIntoViewIfNeeded();assert.equal(await target.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'native post overlay intercepts the visible tool');
  await target.tap();await post.getByRole('button',{name:'Tag / note',exact:true}).tap();await page.locator('.rc-popover').waitFor();assert.equal(await page.evaluate(()=>location.hash),'');await page.locator('.rc-popover').getByRole('button',{name:'Close',exact:true}).tap();
  const title=await post.locator('[slot="title"]').boundingBox();await page.touchscreen.tap(title.x+title.width-4,title.y+title.height/2);assert.equal(await page.evaluate(()=>location.hash),'#native-post','the native post link outside tools remains usable');await context.close();
 }
});
