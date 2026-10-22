'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]})),source=fs.readFileSync(path.join(__dirname,'../thread.user.js'),'utf8').replace('const ui=new RC.UI(runtime);','const ui=new RC.UI(runtime);window.__thread={RC,runtime,ui};');
// Reddit-shaped page: a recognized account, the native two-column main grid, and spoiler/NSFW blur containers with their shadow reveal buttons.
const post=(id,community,reason)=>`<article><shreddit-post id="${id}" author="author_${id}" permalink="/r/${community}/comments/${id}/post/" subreddit-prefixed-name="r/${community}"><div slot="credit-bar"><a href="/r/${community}/">r/${community}</a></div><a slot="title" href="/r/${community}/comments/${id}/post/">Post ${id}</a>${reason?`<shreddit-blurred-container blurred reason="${reason}"><div slot="blurred">Blurred</div><div slot="revealed">Revealed</div></shreddit-blurred-container>`:'<div slot="text-body">Body</div>'}<div slot="overflow-menu-bar"><button>Share</button></div></shreddit-post></article>`;
const page=user=>`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}header{height:56px}shreddit-post{display:block;padding:4px 16px}.main-container{display:grid;gap:16px;grid-template-columns:minmax(0,756px) minmax(0,316px);width:1100px;max-width:100%;margin:auto}#right-sidebar-container{height:300px;background:#eee}.main-container{box-sizing:content-box}</style><shreddit-app ${user?`user-name="${user}"`:''}><header>reddit</header><div class="main-container"><main><shreddit-feed>${post('t3_a','pics','spoiler')}${post('t3_b','pics','nsfw')}${post('t3_c','aww')}</shreddit-feed></main><aside id="right-sidebar-container">About</aside></div></shreddit-app><script>customElements.define('shreddit-blurred-container',class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;this.attachShadow({mode:'open'}).innerHTML='<div class="overlay"><button>View</button></div><slot name="blurred"></slot>';this.shadowRoot.querySelector('button').onclick=()=>{this.removeAttribute('blurred');window.__reveals=(window.__reveals||[]).concat(this.getAttribute('reason'));};}});</script>`;
async function open(browser,user,settings={}){
 const p=await browser.newPage({viewport:{width:1194,height:834},hasTouch:true});p.setDefaultTimeout(5000);await p.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:page(user)}):r.abort());await p.goto('https://www.reddit.com/r/pics/');
 await p.evaluate(settings=>{const s=new Map();window.GM_getValue=(k,d)=>s.has(k)?s.get(k):d;window.GM_setValue=(k,v)=>s.set(k,v);window.GM_xmlhttpRequest=()=>{};window.__seed=settings;},settings);
 await p.addScriptTag({content:source});await p.waitForFunction(()=>window.__thread?.runtime?.items?.size>=3);if(Object.keys(settings).length){await p.evaluate(s=>window.__thread.runtime.update(s),settings);await p.waitForTimeout(250);}return p;
}
const launch=()=>chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});
test('unblur toggles reveal spoilers for anyone and mature media only for a recognized account',async t=>{
 const browser=await launch();t.after(()=>browser.close());
 let p=await open(browser,'reader');assert.equal(await p.evaluate(()=>document.querySelectorAll('shreddit-blurred-container[blurred]').length),2,'both stay blurred by default');await p.close();
 p=await open(browser,'reader',{unblurSpoilers:true});assert.deepEqual(await p.evaluate(()=>window.__reveals),['spoiler']);await p.close();
 p=await open(browser,'reader',{unblurSpoilers:true,unblurMature:true});assert.deepEqual((await p.evaluate(()=>window.__reveals)).sort(),['nsfw','spoiler']);await p.close();
 p=await open(browser,'',{unblurMature:true});assert.equal(await p.evaluate(()=>window.__reveals),undefined,'no recognized account leaves mature media blurred');await p.close();
});
test('Filter r/community writes one exact rule; Feed lists it with Hide/Dim/Blur and Remove',async t=>{
 const browser=await launch();t.after(()=>browser.close());const p=await open(browser,'reader');
 await p.evaluate(()=>window.__thread.runtime.setCommunityFilter('pics','dim'));await p.waitForFunction(()=>document.querySelector('#t3_a').getAttribute('data-rc-treatment')==='dim');
 assert.equal(await p.locator('#t3_c').getAttribute('data-rc-treatment'),null,'other communities are unaffected');
 await p.evaluate(()=>window.__thread.runtime.setCommunityFilter('pics','blur'));assert.equal(await p.evaluate(()=>window.__thread.runtime.rules.length),1,'changing the treatment replaces the rule');
 await p.evaluate(()=>window.__thread.ui.openRoute('feed'));const menu=p.locator('#exp-thread-root');await menu.locator('summary').filter({hasText:/^Community filters$/}).click();
 const select=menu.getByRole('combobox',{name:'Treatment for r/pics',exact:true});assert.equal(await select.inputValue(),'blur');await select.selectOption('hide');await p.waitForFunction(()=>window.__thread.runtime.rules[0]?.treatment==='hide');
 await menu.getByRole('button',{name:'Remove r/pics',exact:true}).click();await p.waitForFunction(()=>!window.__thread.runtime.rules.length);await p.waitForFunction(()=>!document.querySelector('#t3_a').hasAttribute('data-rc-treatment'));
 const tools=p.locator('#t3_c .rc-tools');assert.equal(await tools.getByRole('button',{name:'Filter r/aww',exact:true,includeHidden:true}).count(),1);
});
test('collapsing the right rail lets the feed column fill the free space and restores the native grid',async t=>{
 const browser=await launch();t.after(()=>browser.close());const p=await open(browser,'reader');
 const width=()=>p.evaluate(()=>Math.round(document.querySelector('main').getBoundingClientRect().width));const native=await width();assert.equal(native,756);
 await p.locator('.rc-rail-handle').click();await p.waitForFunction(()=>!document.querySelector('#right-sidebar-container').getClientRects().length);
 const filled=await width();assert(filled>=1000,'the feed fills the main grid: '+filled);const handle=await p.locator('.rc-rail-handle').boundingBox();assert(handle.x>=Math.round(await p.evaluate(()=>document.querySelector('main').getBoundingClientRect().right)),'the collapsed handle does not cover the feed');
 const line=await p.locator('.rc-rail-handle').evaluate(n=>{const a=getComputedStyle(n,'::after'),r=n.getBoundingClientRect();return {overflow:getComputedStyle(n).overflow,top:Math.round(r.top+n.clientTop+parseFloat(a.top)),x:n.clientLeft+parseFloat(a.left)+.5-r.width/2,height:parseFloat(a.height),line:a.backgroundImage.includes('16px')};});
 assert.deepEqual(line,{overflow:'visible',top:Math.round(await p.evaluate(()=>Math.max(0,document.querySelector('header')?.getBoundingClientRect().bottom||0))),x:0,height:await p.evaluate(()=>innerHeight),line:true},'the rail edge line runs from the header through the handle centre like the left navigation line');
 await p.getByRole('combobox',{name:'Content view',exact:true}).selectOption('grid');await p.waitForFunction(()=>document.querySelector('[data-rc-view-container="grid"]'));
 const grid=await p.evaluate(()=>({columns:getComputedStyle(document.querySelector('[data-rc-view-container="grid"]')).gridTemplateColumns.split(' ').map(parseFloat),expanded:document.querySelectorAll('shreddit-post .rc-tools > button').length,icons:document.querySelectorAll('shreddit-post .rc-tools > details.rc-compact-actions').length}));
 assert(grid.columns.length<=4&&grid.columns.every(w=>w>=300),'wide Grid keeps at most four readable columns: '+JSON.stringify(grid.columns));assert.equal(grid.expanded,0,'Grid collapses Thread actions to one icon on desktop');assert(grid.icons>0);
 await p.getByRole('combobox',{name:'Content view',exact:true}).selectOption('native');
 await p.locator('.rc-rail-handle').click();await p.waitForFunction(()=>document.querySelector('#right-sidebar-container').getClientRects().length>0);assert.equal(await width(),native);assert.equal(await p.locator('[data-rc-fill]').count(),0);
});
test('site colors recolor Reddit variables on its theme containers, follow its dark class and clear completely',async t=>{
 const browser=await launch();t.after(()=>browser.close());const p=await open(browser,'reader');
 await p.evaluate(()=>{document.documentElement.classList.add('theme-dark');const st=document.createElement('style');st.textContent='.theme-rpl{--color-neutral-background:#0e1113}';document.head.append(st);document.querySelector('.main-container').classList.add('theme-rpl');});
 const value=()=>p.evaluate(()=>getComputedStyle(document.querySelector('#t3_a')).getPropertyValue('--color-neutral-background').trim());assert.equal(await value(),'#0e1113');
 await p.evaluate(()=>window.__thread.runtime.update({siteColors:'blue'}));await p.waitForFunction(()=>document.documentElement.dataset.expSitePalette==='blue-dark');assert.equal(await value(),'#0b1420');
 await p.evaluate(()=>document.documentElement.classList.remove('theme-dark'));await p.waitForFunction(()=>document.documentElement.dataset.expSitePalette==='blue-light');assert.equal(await value(),'#e7f0fb');
 await p.evaluate(()=>window.__thread.ui.openRoute('look'));assert.equal(await p.locator('#exp-thread-root').getByRole('combobox',{name:'Site colors',exact:true}).inputValue(),'blue');
 await p.evaluate(()=>window.__thread.runtime.update({siteColors:'off'}));await p.waitForFunction(()=>!document.documentElement.hasAttribute('data-exp-site-colors'));assert.equal(await value(),'#0e1113');assert.equal(await p.locator('[id^="exp-site-colors"]').count(),0);
});
