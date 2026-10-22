'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]})),fixture=require('./fixture.cjs');
const source=fs.readFileSync(process.env.THREAD_ACTIONS_SCRIPT||path.join(__dirname,'../thread.user.js'),'utf8').replace('const ui=new RC.UI(runtime);','const ui=new RC.UI(runtime);window.__actionsRuntime=runtime;');
test('touch feed actions sit beside native controls outside the desktop CTA and post overlay',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 for(const viewport of [{width:820,height:1180},{width:1180,height:820},{width:390,height:844}])for(const view of ['native','cards','compact','grid']){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,colorScheme:'dark'}),page=await context.newPage();page.setDefaultTimeout(5000);
  await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:fixture}):r.abort());await page.goto('https://www.reddit.com/r/example/');
  await page.evaluate(()=>{
   const store=new Map();window.GM_getValue=(k,d)=>store.get(k)||d;window.GM_setValue=(k,v)=>store.set(k,v);window.GM_xmlhttpRequest=()=>{};
   const p=document.querySelector('#t3_one');p.style.position='relative';
   const link=document.createElement('a');link.slot='full-post-link';link.href='#native-post';link.style.cssText='position:absolute;inset:0;z-index:0';p.prepend(link);
   for(const button of p.querySelectorAll('button')){button.slot='overflow-menu-bar';button.addEventListener('click',e=>{e.stopPropagation();window.__nativeTap=(window.__nativeTap||0)+1;});}
   p.attachShadow({mode:'open'}).innerHTML='<style>:host{display:block}.title{position:relative}.desktop{display:none}.row{display:flex;gap:4px;align-items:center;overflow:hidden;position:relative}.row button{min-height:44px;flex-shrink:0}.overflow{display:contents}.body{position:relative;pointer-events:none}</style><slot name="full-post-link"></slot><div class="body"><slot name="credit-bar"></slot><h2><slot name="title"></slot></h2><slot name="text-body"></slot></div><div class="desktop"><slot name="desktop-cta-row"></slot></div><div class="row"><button id="expand" onclick="window.__nativeTap=(window.__nativeTap||0)+1">Expand</button><slot class="overflow" name="overflow-menu-bar"></slot></div><slot name="expando-content"></slot>';
   window.__nativeButtons=[...p.querySelectorAll('button')];
  });
  await page.addScriptTag({content:source});const select=page.getByRole('combobox',{name:'Content view',exact:true});await select.waitFor();await select.selectOption(view);
  const post=page.locator('#t3_one'),summary=post.locator('summary');await summary.waitFor();await summary.scrollIntoViewIfNeeded();
  const check=async()=>{
   const a=await summary.boundingBox(),b=await post.locator('#expand').boundingBox();assert(a&&b,'both action groups must be rendered');assert(a.x+a.width<=b.x+1||b.x+b.width<=a.x+1||a.y+a.height<=b.y+1||b.y+b.height<=a.y+1,'Thread actions do not overlap native controls');
   assert.equal(await summary.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'touch center reaches Thread instead of post link');
  };
  await check();await summary.tap();assert.equal(await post.locator('details').evaluate(n=>n.open),true);await post.locator('.rc-action-items').evaluate(n=>Promise.all(n.getAnimations().map(a=>a.finished)));await post.getByRole('button',{name:'Tag / note',exact:true}).tap();await page.locator('.rc-popover').waitFor();assert.equal(await page.evaluate(()=>location.hash),'');await page.locator('.rc-popover').getByRole('button',{name:'Close',exact:true}).tap();
  await summary.press('Space');assert.equal(await post.locator('details').evaluate(n=>n.open),false);await summary.press('Enter');assert.equal(await post.locator('details').evaluate(n=>n.open),true);await summary.tap();await check();
  await summary.focus();await page.evaluate(()=>window.__actionsRuntime.contentView());assert.equal(await summary.evaluate(n=>n===document.activeElement),true,'routine Native and custom view refreshes retain focus');
  await post.evaluate(n=>{const row=n.shadowRoot.querySelector('.row'),replacement=row.cloneNode(true);replacement.querySelector('[data-rc-actions-slot]')?.remove();replacement.removeAttribute('data-rc-actions-row');row.replaceWith(replacement);n.setAttribute('comment-count','13');});
  await page.waitForFunction(()=>document.querySelector('#t3_one').shadowRoot.querySelector('[data-rc-header-row]>[data-rc-actions-slot]'));await check();
  await post.locator('#expand').tap();await post.getByRole('button',{name:'Save post',exact:true}).tap();assert.equal(await page.evaluate(()=>window.__nativeTap),2);assert.equal(await page.evaluate(()=>window.__nativeButtons.every(n=>n.isConnected)),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  if(process.env.THREAD_ACTIONS_EVIDENCE&&view==='compact'&&viewport.width!==390)await page.screenshot({path:process.env.THREAD_ACTIONS_EVIDENCE+'-'+viewport.width+'.png'});
  const title=await post.locator('[slot="title"]').boundingBox();await page.touchscreen.tap(title.x+title.width-5,title.y+title.height/2);assert.equal(await page.evaluate(()=>location.hash),'#native-post');
  await page.evaluate(()=>window.__actionsRuntime.destroy());assert.equal(await post.locator('[data-rc-owned]').count(),0);assert.equal(await post.evaluate(n=>n.shadowRoot.querySelectorAll('[data-rc-header-row],[data-rc-actions-slot]').length),0);assert.equal(await post.locator('#expand').isVisible(),true,'disabling Thread restores native controls');
  await context.close();
 }
});
