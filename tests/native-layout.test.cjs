'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'../../exp-core')]})),fixture=require('./fixture.cjs');
const source=fs.readFileSync(process.env.THREAD_TOOLS_SCRIPT||path.join(__dirname,'../thread.user.js'),'utf8');
// Reddit's View menu as served: a layout sort dropdown whose items are links that reload the feed in the other layout.
const menu=selected=>`<shreddit-sort-dropdown sort-event="layout-view-change" header-text="View"><div slot="dropdown-items">${['cardView','compactView'].map(v=>`<data value="${v}"><li ${v===selected?'rpl-selected':''}><a href="?feedViewType=${v}">${v==='cardView'?'Card':'Compact'}</a></li></data>`).join('')}</div></shreddit-sort-dropdown>`;
test('Thread views switch Reddit\'s native Card/Compact layout, follow Reddit\'s View menu and never reload in a loop',async t=>{
 const browser=await chromium.launch({executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined});t.after(()=>browser.close());
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();page.setDefaultTimeout(8000);
 let stuck=false;const loads=[];
 await page.route('**/*',r=>{if(!r.request().isNavigationRequest())return r.abort();const url=new URL(r.request().url()),asked=url.searchParams.get('feedViewType')||'cardView',served=stuck?'cardView':asked;loads.push(url.search);
  r.fulfill({contentType:'text/html',body:fixture.replace('<main>','<main>'+menu(served)).replace(/view-type="\w+"/g,`view-type="${served}"`)});});
 await context.addInitScript(source=>{const k='__gm:';window.GM_getValue=(n,d)=>{const v=localStorage.getItem(k+n);return v===null?d:JSON.parse(v);};window.GM_setValue=(n,v)=>localStorage.setItem(k+n,JSON.stringify(v));window.GM_xmlhttpRequest=()=>{};
  addEventListener('DOMContentLoaded',()=>{const s=document.createElement('script');s.textContent=source;document.head.append(s);});},source);
 const served=()=>page.evaluate(()=>document.querySelector('shreddit-sort-dropdown data:has(li[rpl-selected])').getAttribute('value'));
 const view=()=>page.evaluate(()=>document.querySelector('#t3_one').getAttribute('data-rc-view')||'native');
 const pick=async(v,search)=>{await Promise.all([search?page.waitForURL(u=>u.search===search):Promise.resolve(),page.getByRole('combobox',{name:'Content view',exact:true}).selectOption(v)]);await page.getByRole('combobox',{name:'Content view',exact:true}).waitFor();};
 await page.goto('https://www.reddit.com/r/example/');await page.getByRole('combobox',{name:'Content view',exact:true}).waitFor();
 assert.equal(await view(),'native');assert.equal(loads.length,1,'Native view leaves Reddit\'s layout alone');
 await pick('compact','?feedViewType=compactView');await page.waitForFunction(()=>document.querySelector('#t3_one')?.getAttribute('data-rc-view')==='compact');
 assert.equal(await served(),'compactView','Compact Cards switches Reddit to its compact layout');
 await pick('grid','?feedViewType=cardView');await page.waitForFunction(()=>document.querySelector('#t3_one')?.getAttribute('data-rc-view')==='grid');
 assert.equal(await served(),'cardView','Grid switches Reddit to its card layout');
 await pick('cards');await page.waitForTimeout(500);assert.equal(loads.length,3,'a view that already has its layout does not reload');
 // A user's choice in Reddit's own menu carries over to Thread instead of being switched back.
 await Promise.all([page.waitForURL(u=>u.search==='?feedViewType=compactView'),page.locator('shreddit-sort-dropdown a[href="?feedViewType=compactView"]').click()]);
 await page.waitForFunction(()=>document.querySelector('#t3_one')?.getAttribute('data-rc-view')==='compact');await page.waitForTimeout(500);
 assert.equal(await served(),'compactView');assert.equal(loads.length,4,'following Reddit\'s menu adds no second reload');
 // A page that asked for the wanted layout and still got the other is left alone.
 stuck=true;await page.goto('https://www.reddit.com/r/example/?feedViewType=compactView');await page.waitForFunction(()=>document.querySelector('#t3_one')?.getAttribute('data-rc-view')==='compact');await page.waitForTimeout(800);
 assert.equal(loads.length,5,'no reload loop when Reddit keeps serving the other layout');
 await page.goto('https://www.reddit.com/r/example/');await page.waitForURL(u=>u.search==='?feedViewType=compactView');await page.waitForFunction(()=>document.querySelector('#t3_one')?.getAttribute('data-rc-view')==='compact');await page.waitForTimeout(800);
 assert.equal(loads.length,7,'a page served in the other layout switches once, then stops');
});
