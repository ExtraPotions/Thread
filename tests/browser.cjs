'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[path.resolve(__dirname,'..'),path.resolve(__dirname,'../../exp-core')]}));
const fixture=require('./fixture.cjs');const root=path.resolve(__dirname,'..'),workspace=path.dirname(root);
const output=path.join(workspace,'local-verification/suite-system-20261020/thread');fs.mkdirSync(output,{recursive:true});
const captures=path.join(root,'.impeccable/review');fs.mkdirSync(captures,{recursive:true});
const source=fs.readFileSync(path.join(root,'thread.user.js'),'utf8');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const currentNote=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8').split(/^## /m).find(section=>section.startsWith(version+' ')).split('\n').find(line=>line.startsWith('- ')).slice(2);
// Test instrumentation exposes lexical objects only in the test page, not the deliverable.
const testedSource=source.replace('const ui=new RC.UI(runtime);','const ui=new RC.UI(runtime);window.__thread={RC,runtime,ui};');
const checks=[],errors=[],requests=[];let browser;
async function check(name,fn){await fn();checks.push(name);}
async function pageAt(url='https://www.reddit.com/r/example/',viewport={width:1440,height:1000},settings={}){
 const page=await browser.newPage({viewport});page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const url=new URL(route.request().url());requests.push({host:url.hostname,type:route.request().resourceType()});if(url.hostname==='i.redd.it')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="420" height="200"><rect width="420" height="200" fill="#203c61"/><text x="30" y="105" fill="#edf1f3" font-size="24">Authored image fixture</text></svg>'});return route.fulfill({contentType:'text/html',body:fixture});});
 await page.goto(url);
 await page.evaluate(settings=>{
   const storage=new Map([['exp:v1:thread:reader:settings',settings]]);window.__storage=storage;const listeners=new Map();let serial=0;
   window.GM_getValue=(k,d)=>storage.has(k)?structuredClone(storage.get(k)):d;window.GM_setValue=(k,v)=>storage.set(k,structuredClone(v));window.GM_deleteValue=k=>storage.delete(k);window.GM_listValues=()=>[...storage.keys()];window.GM_addValueChangeListener=(key,fn)=>{listeners.set(++serial,{key,fn});return serial;};window.GM_removeValueChangeListener=id=>listeners.delete(id);window.__listeners=listeners;window.GM_registerMenuCommand=()=>{};window.GM_info={script:{version:'0.1.0'},scriptHandler:'Authored fixture'};window.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onerror?.({status:0}));return{abort(){}};};window.fetch=async()=>{throw Error('Fixture network unavailable');};
   window.__native={save:0,upvote:0,downvote:0,pages:0,replies:0};document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const label=b.getAttribute('aria-label')||b.textContent;if(label.startsWith('Save'))window.__native.save++;if(label==='Upvote')window.__native.upvote++;if(label==='Downvote')window.__native.downvote++;if(label==='Load more posts')window.__native.pages++;if(label==='View more replies')window.__native.replies++;});
 },settings);
 await page.addScriptTag({content:testedSource});await page.waitForFunction(()=>window.__thread?.runtime.items.size===5);return page;
}
async function openSystem(root,group){const tab=root.getByRole('tab',{name:'System',exact:true});if(await tab.getAttribute('aria-selected')!=='true')await tab.click();if(['support','reset'].includes(group))return;const summary=root.locator('summary').filter({hasText:new RegExp('^'+group+'$','i')});if(!await summary.evaluate(n=>n.parentElement.open))await summary.click();}
async function settle(page){await page.waitForTimeout(400);}
async function run(){
 browser=await chromium.launch({headless:true,executablePath:process.platform==='win32'?'C:/Users/OneDareAtHome/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe':undefined,args:['--js-flags=--expose-gc']});
 const p=await pageAt();
 await check('native header identity works without app attributes; ambiguous identity pauses private records',async()=>{
  const q=await pageAt();await q.evaluate(()=>{const app=document.querySelector('shreddit-app');app.removeAttribute('user-name');document.querySelector('header').innerHTML='<a href="/user/reader/">View profile</a><a href="/user/reader/achievements">Achievements</a>';});await settle(q);
  assert.equal(await q.evaluate(()=>window.__thread.runtime.account),'reader');
  await q.evaluate(()=>{const a=document.createElement('a');a.href='/user/another_reader/';a.textContent='Profile';document.querySelector('header').append(a);});await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.verified),false);
  await q.evaluate(()=>{document.querySelector('header').innerHTML='<a href="/user/reader/">View profile</a>';window.__thread.runtime.store.setPerson('author_one',{tag:'private fixture'});});await settle(q);
  await q.evaluate(()=>document.querySelector('header a').setAttribute('href','/user/other_reader/'));await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.account),'other_reader');assert.deepEqual(await q.evaluate(()=>window.__thread.runtime.people),{});
  await q.evaluate(()=>document.querySelector('header').innerHTML='<a href="/login">Log in</a>');await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.account),'guest');await q.close();
 });
 await check('native account components identify the viewer before profile drawer opens without requests',async()=>{
  const q=await pageAt();await q.evaluate(()=>{document.querySelector('shreddit-app').removeAttribute('user-name');document.querySelector('header').innerHTML='<button id="expand-user-drawer-button">Expand user menu</button>';for(const tag of ['achievements-entrypoint','after-login-toast-dispatcher']){const n=document.createElement(tag);n.setAttribute('username','reader');document.body.append(n);}});await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.account),'reader');
  await q.evaluate(()=>document.querySelector('achievements-entrypoint').setAttribute('username','other_reader'));await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.verified),false);await q.evaluate(()=>document.querySelector('after-login-toast-dispatcher').setAttribute('username','other_reader'));await settle(q);assert.equal(await q.evaluate(()=>window.__thread.runtime.account),'other_reader');await q.close();
 });
 await check('discussion scope chooses comment jump targets without filtering or fetching',async()=>{
  const q=await pageAt('https://www.reddit.com/r/example/comments/one/discussion/');const scope=q.getByRole('combobox',{name:'Jump between loaded comments'});assert.equal(await scope.locator('option[value="unread"]').isDisabled(),true);await scope.selectOption('op');await q.getByRole('button',{name:'Next comment',exact:true}).click();assert.equal(await q.locator('[thingid="t1_parent"]').getAttribute('data-rc-selected'),'1');assert.equal(await q.locator('[thingid="t1_child"]').isVisible(),true);assert.equal(await q.locator('[data-rc-treatment]').count(),0);await q.close();
 });
 await check('real feed wrappers and separators produce multiple grid columns and distinct media sizes',async()=>{
  const q=await pageAt(undefined,{width:1440,height:1000});await q.evaluate(()=>{const feed=document.querySelector('shreddit-feed');for(const post of [...feed.children]){post.setAttribute('view-type','compactView');const article=document.createElement('article');post.before(article);article.append(post);article.after(document.createElement('hr'));}document.querySelector('[slot="post-media-container"]').setAttribute('slot','thumbnail');});await settle(q);
  const sizes={};for(const view of ['cards','compact','grid','list']){await q.getByRole('combobox',{name:'Content view',exact:true}).focus();await q.getByRole('combobox',{name:'Content view',exact:true}).selectOption(view);await settle(q);assert.equal(await q.getByRole('combobox',{name:'Content view',exact:true}).evaluate(n=>n===document.activeElement),true);sizes[view]=await q.locator('#t3_one [slot="thumbnail"]').boundingBox();assert.equal(await q.locator('#t3_one').getAttribute('view-type'),['cards','grid'].includes(view)?'cardView':'compactView');if(view==='grid'){const a=await q.locator('article').nth(0).boundingBox(),b=await q.locator('article').nth(1).boundingBox();assert(b.x>a.x+100);assert(Math.abs(a.y-b.y)<2);assert.equal(await q.locator('shreddit-feed>hr').first().isVisible(),false);}}
  assert(sizes.cards.width>sizes.compact.width*2);assert(sizes.compact.width>sizes.list.width);await q.locator('#t3_one button[aria-label="Save post"]').click();assert.equal(await q.evaluate(()=>window.__native.save),1);
  await q.getByRole('combobox',{name:'Content view',exact:true}).selectOption('native');await settle(q);assert.equal(await q.locator('#t3_one').getAttribute('view-type'),'compactView');assert.equal(await q.locator('shreddit-feed>hr').first().isVisible(),true);
  await q.getByRole('combobox',{name:'Content view',exact:true}).selectOption('grid');await settle(q);await q.evaluate(()=>{document.querySelector('#t3_one').setAttribute('view-type','site-new-value');window.__thread.runtime.update({enabled:false});});await settle(q);assert.equal(await q.locator('#t3_one').getAttribute('view-type'),'site-new-value');assert.equal(await q.locator('#t3_two').getAttribute('view-type'),'compactView');await q.close();
 });
 await check('feed strip stays sticky without post-jump controls; top action is separate and cleaned up',async()=>{
  const q=await pageAt();assert.equal(await q.locator('.rc-pagebar').getByRole('button',{name:/Previous|Next|Sidebars|Back to top/}).count(),0);await q.evaluate(()=>{const spacer=document.createElement('div');spacer.style.height='2500px';document.querySelector('main').append(spacer);scrollTo(0,600);});await settle(q);assert((await q.locator('.rc-pagebar').boundingBox()).y>=-1);assert.equal(await q.getByRole('button',{name:'Back to top',exact:true}).isVisible(),true);await q.getByRole('button',{name:'Back to top',exact:true}).click();await settle(q);assert.equal(await q.evaluate(()=>scrollY),0);await q.evaluate(()=>window.__thread.runtime.destroy());assert.equal(await q.locator('[data-rc-owned="back-top"]').count(),0);await q.close();
 });
 await check('actual shared Core registers THREAD and uses a single launcher',async()=>{assert.equal(await p.locator('#exp-thread-root').count(),1);assert.equal(await p.evaluate(()=>document.querySelector('[data-exp-suite-product="thread"]').dataset.expSuiteVersion),version);});
 await check('built THREAD launcher docks below the native left-rail handle and opens adjacent by keyboard',async()=>{
  await settle(p);const root=p.locator('#exp-thread-root'),launcher=root.locator('.launcher');
  const rail=await p.locator('#left-sidebar-container').boundingBox(),handle=await p.locator('#native-collapse').boundingBox(),opener=await launcher.boundingBox();
  assert(Math.abs(opener.x+opener.width/2-rail.x-rail.width)<1);assert(opener.y>=handle.y+handle.height+7);
  await launcher.focus();await p.keyboard.press('Enter');await settle(p);const menu=await root.getByRole('dialog').boundingBox();assert(Math.abs(menu.x-opener.x-opener.width-8)<1);assert(menu.x+menu.width<=1440-8);
  await p.keyboard.press('Escape');assert.equal(await root.getByRole('dialog').isVisible(),false);assert.equal(await launcher.evaluate(n=>n.getRootNode().activeElement===n),true);
  await p.locator('#native-collapse').click();assert.equal(await p.evaluate(()=>window.__nativeCollapse),1);
 });
 await check('native sorting and account actions are unchanged by default',async()=>{assert.deepEqual(await p.evaluate(()=>window.__native),{save:0,upvote:0,downvote:0,pages:0,replies:0});assert.equal(p.url(),'https://www.reddit.com/r/example/');assert.equal(await p.locator('shreddit-post[data-rc-view]').count(),0);});
 await check('media discovery excludes profile avatars and badges while retaining attached images',async()=>{
  const actual=await p.evaluate(()=>{const node=document.createElement('shreddit-comment');node.innerHTML='<a href="/user/example/"><span><img src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"></span></a><img src="https://i.redd.it/content.png"><img src="https://www.redditstatic.com/gold/awards/icon.png">';return window.__thread.RC.Adapter.media({node,gated:false}).map(n=>n.src);});assert.deepEqual(actual,['https://i.redd.it/content.png']);
 });
 await check('comment text reads each slot once and excludes nested replies from parent context',async()=>{
  const actual=await p.evaluate(()=>{const n=document.createElement('shreddit-comment');n.innerHTML='<div slot="comment"><p>Unique parent text.</p></div><shreddit-comment><p>Nested reply.</p></shreddit-comment>';return window.__thread.RC.Adapter.item(n).text;});assert.equal(actual,'Unique parent text.');
 });
 await check('image variants share one gallery entry and prefer the observed original without fetching',async()=>{
  const actual=await p.evaluate(()=>{const n=document.createElement('shreddit-post');n.innerHTML='<img src="https://preview.redd.it/title-v0-asset123.jpeg?width=300"><img src="https://preview.redd.it/title-v0-asset123.jpeg?width=900"><img src="https://i.redd.it/asset123.jpeg"><img src="https://i.redd.it/another456.png">';return window.__thread.RC.Adapter.media({node:n,gated:false}).map(n=>n.src);});assert.deepEqual(actual,['https://i.redd.it/asset123.jpeg','https://i.redd.it/another456.png']);
 });
 await check('Pear Crystal theme defaults off, persists, restores and stays inside THREAD',async()=>{
  assert.equal(await p.evaluate(()=>window.__thread.runtime.settings.gemTheme),false);
  const pageColor=await p.locator('body').evaluate(n=>getComputedStyle(n).backgroundColor);
  const normal=await p.locator('#exp-thread-root').evaluate(h=>h.shadowRoot.querySelector('.exp-core-theme').style.getPropertyValue('--theme-bg'));
  await p.evaluate(()=>window.__thread.runtime.update({gemTheme:true}));
  assert.equal(await p.evaluate(()=>GM_getValue('exp:v1:thread:reader:settings').gemTheme),true);
  assert.equal(await p.locator('#exp-thread-root').evaluate(h=>h.shadowRoot.querySelector('.exp-core-theme').dataset.uiTheme),'thread-gem');
  assert.equal(await p.locator('body').evaluate(n=>getComputedStyle(n).backgroundColor),pageColor);
  await p.evaluate(()=>{const r=window.__thread.runtime;r.refreshSettings();window.__thread.ui.refresh();});
  assert.equal(await p.evaluate(()=>window.__thread.runtime.settings.gemTheme),true);
  await p.evaluate(()=>window.__thread.runtime.update({gemTheme:false}));
  assert.equal(await p.locator('#exp-thread-root').evaluate(h=>h.shadowRoot.querySelector('.exp-core-theme').style.getPropertyValue('--theme-bg')),normal);
 });
 await check('version notice reuses Core theme, actual release notes and published release link',async()=>{
  await p.evaluate(()=>{window.__thread.runtime.update({gemTheme:true});window.__thread.ui.product.open();window.__thread.ui.product.versionButton.click();});
  await settle(p);const notice=p.locator('#exp-thread-root').locator('.update-notice');assert.equal(await notice.isVisible(),true);assert.match(await notice.innerText(),/Thread Changelog/);assert.ok((await notice.innerText()).includes(currentNote));assert.equal(await notice.locator('.update-action').isVisible(),false);assert.equal(await notice.locator('.update-release').isVisible(),true);assert.equal(await notice.locator('.update-release').getAttribute('href'),'https://github.com/ExtraPotions/Thread/releases/tag/v'+version);
  assert.equal(await notice.evaluate(n=>getComputedStyle(n).getPropertyValue('--theme-bg').trim()),'#1e1410');
  await p.evaluate(()=>{window.__thread.ui.notice.hide();window.__thread.runtime.update({gemTheme:false});window.__thread.ui.product.close();});
 });
 await check('release lifecycle uses shared notices for available, complete, disabled and failed checks',async()=>{
  const q=await pageAt();await q.evaluate(()=>{GM_setValue('exp:v3:thread:installed-version','0.0.9');dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});await settle(q);
  const notice=q.locator('#exp-thread-root .update-notice');assert.equal(await notice.getAttribute('data-notice-kind'),'complete');assert.match(await notice.innerText(),/Updated from v0.0.9/);
  await q.evaluate(async()=>{window.__updateRequests=0;window.GM_xmlhttpRequest=o=>{window.__updateRequests++;queueMicrotask(()=>o.onload({status:200,responseText:JSON.stringify({tag_name:'v9.9.9',body:'## 9.9.9\n- New fixture feature.'})}));return{abort(){}};};await window.__thread.ui.checkUpdates(true);});await settle(q);
  assert.equal(await notice.getAttribute('data-notice-kind'),'available');assert.equal(await notice.locator('.update-action').isVisible(),true);assert.equal(await notice.locator('.update-action').getAttribute('href'),'https://github.com/ExtraPotions/Thread/releases/latest/download/thread.user.js');assert.equal(await notice.locator('.update-release').getAttribute('href'),'https://github.com/ExtraPotions/Thread/releases/tag/v9.9.9');assert.match(await notice.innerText(),/New fixture feature/);
  await q.evaluate(async()=>{window.__thread.runtime.update({updateNotifications:false});await window.__thread.ui.checkUpdates();});assert.equal(await q.evaluate(()=>window.__updateRequests),1,'disabled notifications make no automatic request');
  await q.evaluate(async()=>{window.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onerror());return{abort(){}};};await window.__thread.ui.checkUpdates(true);});assert.match(await q.locator('#exp-thread-root .rc-menu-status').textContent(),/Update check failed/);await q.close();
 });
 await check('enabled switch indicators meet 3:1 contrast in light, dark and gem themes',async()=>{
  for(const [scheme,gem]of [['light',false],['dark',false],['dark',true]]){
   await p.emulateMedia({colorScheme:scheme});await p.evaluate(gem=>{window.__thread.runtime.update({gemTheme:gem});window.__thread.ui.openRoute('look');},gem);
   // Enable a boolean row to sample the actual shared Core thumb, regardless of gem setting.
   await p.evaluate(()=>window.__thread.ui.openRoute('feed'));
   const colors=await p.locator('#exp-thread-root').getByRole('switch',{name:'Enable companion',exact:true}).evaluate(n=>({track:getComputedStyle(n).backgroundColor,thumb:getComputedStyle(n,'::after').backgroundColor}));
   const lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
   const a=lum(colors.track),b=lum(colors.thumb),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=3,JSON.stringify({scheme,gem,colors,ratio}));
  }
  await p.evaluate(()=>{window.__thread.runtime.update({gemTheme:false});window.__thread.ui.product.close();});await p.emulateMedia({colorScheme:'light'});
 });
 await check('pagehide/pageshow rebuilds persisted routes without duplicate menus and retains gem choice',async()=>{
  await p.evaluate(()=>{window.__thread.runtime.update({gemTheme:true});dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));});
  assert.equal(await p.locator('#exp-thread-root').count(),0);
  await p.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await settle(p);assert.equal(await p.locator('#exp-thread-root').count(),1);
  assert.equal(await p.evaluate(()=>window.__thread.runtime.settings.gemTheme),true);
  await p.evaluate(()=>window.__thread.runtime.update({gemTheme:false}));await settle(p);
 });
 await check('regex valid, invalid and catastrophic batches recover without UI lock',async()=>{const results=await p.evaluate(async()=>{const worker=new window.__thread.RC.Regex();const out=[await worker.evaluate('parent',['parent','other']),await worker.evaluate('[',['anything']),await worker.evaluate('(a+)+$',['a'.repeat(3998)+'!'],60),await worker.evaluate('ok',['ok'])];worker.dispose();return out;});assert.deepEqual(results[0].matches,[true,false]);assert.match(results[1].error,/Invalid/);assert.match(results[2].error,/time limit/);assert.deepEqual(results[3].matches,[true]);});
 await check('literal rules match inserted content and reveal without deleting rule',async()=>{await p.evaluate(()=>{const {runtime:r}=window.__thread;r.rules=window.__thread.RC.Model.rules([{pattern:'ordinary',field:'title',treatment:'hide'}]);r.store.set('rules',r.rules);r.schedule();});await settle(p);const post=p.locator('#t3_two');assert.equal(await post.getAttribute('data-rc-treatment'),'hide');await post.getByRole('button',{name:'Reveal',exact:true}).click();await settle(p);assert.equal(await post.getAttribute('data-rc-treatment'),null);assert.equal(await p.evaluate(()=>window.__thread.runtime.rules.length),1);await p.evaluate(()=>{const n=document.createElement('shreddit-post');n.id='t3_inserted';n.setAttribute('author','new_author');n.setAttribute('post-title','ordinary inserted post');n.innerHTML='<h2 slot="title">ordinary inserted post</h2>';document.querySelector('shreddit-feed').append(n);});await settle(p);assert.equal(await p.locator('#t3_inserted').getAttribute('data-rc-treatment'),'hide');});
 await check('comment filtering is scoped, exceptions and reversible blur work',async()=>{await p.evaluate(()=>{const r=window.__thread.runtime;r.rules=window.__thread.RC.Model.rules([{field:'text',pattern:'child comment',target:'comment',scope:'example',except:'other',treatment:'blur'}]);r.store.set('rules',r.rules);r.schedule();});await settle(p);assert.equal(await p.locator('[thingid="t1_child"]').getAttribute('data-rc-treatment'),'blur');await p.locator('[thingid="t1_child"]').getByRole('button',{name:'Reveal',exact:true}).click();await settle(p);assert.equal(await p.locator('[thingid="t1_child"]').getAttribute('data-rc-treatment'),null);});
 await check('tags/notes are text-safe, persistent and account-isolated',async()=>{await p.evaluate(()=>{const r=window.__thread.runtime;r.store.setPerson('author_one',{tag:'<img onerror=alert(1)>',note:'private fixture note',nickname:'Reader friend'});r.people=r.store.people();r.schedule();});await settle(p);assert.equal(await p.locator('#t3_one .rc-tools img').count(),0);assert.match(await p.locator('#t3_one .rc-tools').innerText(),/<img onerror/);await p.evaluate(()=>document.querySelector('shreddit-app').setAttribute('user-name','other_reader'));await settle(p);assert.equal(await p.locator('#t3_one .rc-tools').innerText().then(t=>t.includes('Reader friend')),false);await p.evaluate(()=>document.querySelector('shreddit-app').setAttribute('user-name','reader'));await settle(p);assert.match(await p.locator('#t3_one .rc-tools').innerText(),/Reader friend/);});
 await check('all four views preserve native actions, filtering and selection',async()=>{await p.evaluate(()=>{const r=window.__thread.runtime;r.rules=[];r.store.set('rules',[]);});for(const view of ['cards','compact','grid','list']){await p.getByRole('combobox',{name:'Content view',exact:true}).selectOption(view);await settle(p);assert.equal(await p.locator('#t3_one').getAttribute('data-rc-view'),view);assert.equal(await p.locator('#t3_one button[aria-label="Save post"]').isVisible(),true);await p.evaluate(()=>window.__thread.runtime.navigate(1));assert.equal(await p.locator('[data-rc-selected]').count(),1);if(view==='grid')assert.equal(await p.locator('[data-rc-view-container="grid"]').count(),1);}});
 await check('media honors spoiler gates, zoom, background precedence and resource cleanup',async()=>{assert.equal(await p.locator('#t3_spoiler').getByRole('button',{name:'View media'}).count(),0);await p.evaluate(()=>{const r=window.__thread.runtime;r.update({backgroundNav:true,backgroundClose:true});r.media([...r.items.values()][0].item);});await p.locator('.rc-media').getByRole('button',{name:'Zoom in'}).click();assert.match(await p.locator('.rc-media-toolbar').innerText(),/150%/);await p.locator('.rc-media img').click();assert.equal(await p.locator('.rc-media').count(),1);await p.locator('.rc-media').click({position:{x:5,y:5}});assert.equal(await p.locator('.rc-media').count(),1);await p.keyboard.press('Escape');assert.equal(await p.locator('.rc-media').count(),0);assert.equal(await p.locator('body>[inert]').count(),0);});
 await check('Feed contains sidebar controls with independent collapse and reachable restore',async()=>{await p.evaluate(()=>{window.__thread.runtime.update({left:false,right:true,offset:400,feedWidth:1200});window.__thread.ui.openRoute('feed');});await settle(p);const menu=p.locator('#exp-thread-root');const detail=menu;await menu.locator('summary').filter({hasText:/^Sidebars$/}).click();assert.equal(await p.locator('#left-sidebar-container').isVisible(),false);assert.equal(await p.locator('#right-sidebar-container').isVisible(),true);await detail.getByRole('button',{name:'Collapse right temporarily',exact:true}).click();assert.equal(await p.locator('#right-sidebar-container').isVisible(),false);await detail.getByRole('button',{name:'Restore right temporarily',exact:true}).click();assert.equal(await p.locator('#right-sidebar-container').isVisible(),true);await p.keyboard.press('Escape');});
 await check('opt-in visible loading uses finite per-route budgets, never votes or saves',async()=>{await p.evaluate(()=>{document.querySelector('[data-testid="load-more-posts"]').scrollIntoView();window.__thread.runtime.update({autoPages:true,autoReplies:true,loadBudget:2});});await settle(p);for(let i=0;i<4;i++){await p.evaluate(()=>{window.__thread.runtime.loadSeen=new WeakSet();window.__thread.runtime.loadVisible();});}const native=await p.evaluate(()=>window.__native);assert.equal(native.pages,2);assert.equal(native.save,0);assert.equal(native.upvote,0);assert.equal(native.downvote,0);assert.ok(native.replies<=2);});
 await check('keyboard ignores editors and native modals; explicit native save works',async()=>{await p.evaluate(()=>{window.__thread.runtime.update({keyboard:true});});await settle(p);await p.getByRole('textbox',{name:'Native reply editor'}).focus();await p.keyboard.type('jsu');assert.equal(await p.evaluate(()=>window.__native.save),0);await p.evaluate(()=>{document.activeElement.blur();window.__thread.runtime.focusItem([...window.__thread.runtime.items.values()][0].item);});await p.keyboard.press('s');assert.equal(await p.evaluate(()=>window.__native.save),1);});
 await check('diagnostics exclude page text, notes, usernames and credentials',async()=>{const json=await p.evaluate(()=>JSON.stringify(window.__thread.runtime.diagnostics()));for(const token of ['private fixture note','author_one','reader','token','A useful discussion'])assert.equal(json.includes(token),false);});
 await check('route changes and back/forward do not duplicate controls or carry overrides',async()=>{await p.evaluate(()=>history.pushState({},'', '/r/example/comments/one/a_useful_discussion/'));await settle(p);assert.equal(await p.locator('[data-rc-owned="pagebar"]').count(),1);assert.equal(await p.locator('.rc-tools').count(),6);assert.equal(await p.evaluate(()=>window.__thread.runtime.viewOverride),null);await p.evaluate(()=>history.back());await settle(p);assert.equal(await p.locator('[data-rc-owned="pagebar"]').count(),1);});
 await check('disable restores native DOM and clears observers references',async()=>{await p.evaluate(()=>window.__thread.runtime.update({enabled:false}));await settle(p);assert.equal(await p.locator('.rc-tools').count(),0);assert.equal(await p.locator('[data-rc-treatment],[data-rc-sidebar-hidden],[data-rc-view]').count(),0);assert.equal(await p.evaluate(()=>window.__thread.runtime.items.size),0);});
 await p.close();
 const uiPage=await pageAt();const menuRoot=uiPage.locator('#exp-thread-root');
 await check('SHIFT-style menu has six primary sections, Support/Reset inside System and a native-size circular rail launcher',async()=>{
  const launcher=menuRoot.locator('.launcher'),box=await launcher.boundingBox();assert.equal(box.width,32);assert.equal(box.height,32);assert.equal(await launcher.evaluate(n=>getComputedStyle(n).borderRadius),'50%');
  await launcher.click();await settle(uiPage);
  assert.equal(await menuRoot.locator('[data-exp-part=subtitle]').innerText(),'Your Reddit, refined.');
  assert.deepEqual(await menuRoot.getByRole('tab').allTextContents(),['Feed','Read','Look','Filters','People','System']);
  assert.equal(await menuRoot.locator('[data-exp-menu-shortcut="support"],[data-exp-menu-shortcut="reset"]').count(),0);
  assert.equal(await menuRoot.locator('[data-section="donations"],[data-section="support"],[data-section="reset"]').count(),0);
  await menuRoot.getByRole('button',{name:'Support Thread',exact:true}).click();assert.equal(await menuRoot.locator('#exp-support-popover').isVisible(),true);
  await menuRoot.getByRole('button',{name:'Support Thread',exact:true}).click();
 });
 await check('shared diagnostics display inline, copy fresh redacted data, and reset arms in place without data loss',async()=>{
  await uiPage.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}}));
  await openSystem(menuRoot,'support');await settle(uiPage);
  assert.equal(await menuRoot.locator('[data-exp-system-layout="grouped"]').count(),1);assert.equal(await menuRoot.getByRole('button',{name:'Show Diagnostics',exact:true}).count(),1);
  const pair=menuRoot.locator('.diagnostics-controls .action-pair'),pairBoxes=await pair.locator('button').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().toJSON()));assert(Math.abs(pairBoxes[0].top-pairBoxes[1].top)<1);
  await menuRoot.getByRole('button',{name:'Show Diagnostics',exact:true}).click();await settle(uiPage);assert.equal(await menuRoot.getByRole('dialog').isVisible(),true);assert.equal(await uiPage.locator('.rc-popover').count(),0);
  assert.match(await menuRoot.locator('pre.diag').innerText(),/accountVerified/);
  await menuRoot.getByRole('button',{name:'Copy Diagnostics',exact:true}).click();assert.equal(await uiPage.evaluate(()=>JSON.parse(window.__copied).product),'THREAD');
  assert.equal(await menuRoot.getByRole('button',{name:'Report a Problem',exact:true}).isDisabled(),false);
  assert.equal(await menuRoot.locator('[data-exp-product-system]').evaluate(system=>system.lastElementChild.dataset.expSystemItem),'reset','Reset follows API access and settings transfer');
  await openSystem(menuRoot,'reset');await menuRoot.getByRole('button',{name:'Reset All Settings',exact:true}).click();assert.equal(await menuRoot.getByRole('button',{name:'Tap Again to Reset',exact:true}).isVisible(),true);assert.equal(await menuRoot.getByRole('dialog').isVisible(),true);
  await menuRoot.getByRole('button',{name:'Hide Diagnostics',exact:true}).focus();assert.equal(await menuRoot.getByRole('button',{name:'Tap Again to Reset',exact:true}).count(),0);
 });
 await check('dependent settings stay conditional and all settings remain reachable without inline implementation paragraphs',async()=>{
  await menuRoot.getByRole('tab',{name:'Feed',exact:true}).click();
  assert.equal(await menuRoot.getByRole('combobox',{name:'Top time range',exact:true}).isVisible(),false);assert.equal(await menuRoot.getByRole('switch',{name:'List thumbnails',exact:true}).isVisible(),false);
  await menuRoot.getByRole('combobox',{name:'Default feed sort',exact:true}).selectOption('top');assert.equal(await menuRoot.getByRole('combobox',{name:'Top time range',exact:true}).isVisible(),true);
  await menuRoot.getByRole('combobox',{name:'Default content view',exact:true}).selectOption('list');assert.equal(await menuRoot.getByRole('switch',{name:'List thumbnails',exact:true}).isVisible(),true);
  assert.equal(await menuRoot.locator('.route-body:not([hidden]) p.note').count(),0);
  await menuRoot.getByRole('tab',{name:'Read',exact:true}).click();for(const summary of await menuRoot.locator('.route-body:not([hidden]) details>summary').all())await summary.click();
  await menuRoot.getByRole('textbox',{name:'Key: downvote',exact:true}).focus();assert.equal(await menuRoot.getByRole('textbox',{name:'Key: downvote',exact:true}).isVisible(),true);
  const header=await menuRoot.locator('.menu-head').boundingBox();assert(header.y>=8&&header.height>20,'header remains visible after inner scroll');
 });
 await check('Thread hover and keyboard help remain inside the menu at desktop, 390px and 320px with native and gem themes',async()=>{
  for(const width of [1440,390,320])for(const gem of [false,true]){
   await uiPage.setViewportSize({width,height:800});await uiPage.evaluate(gem=>{window.__thread.runtime.update({gemTheme:gem});window.__thread.ui.openRoute('look');},gem);await settle(uiPage);
   const label=menuRoot.locator('[data-exp-help]').filter({hasText:'Use gem menu theme'});await label.hover();const tip=menuRoot.getByRole('tooltip');await tip.waitFor({state:'visible'});assert.match(await tip.innerText(),/Pear Crystal/);
   await label.focus();assert.equal(await tip.isVisible(),true);
   await settle(uiPage);const t=await tip.boundingBox(),m=await menuRoot.getByRole('dialog').boundingBox();await uiPage.screenshot({path:path.join(output,'tooltip-'+width+'-'+gem+'.png'),fullPage:false});assert(t.x>=m.x&&t.x+t.width<=m.x+m.width+1&&t.y>=m.y&&t.y+t.height<=m.y+m.height+1,'tooltip contained '+JSON.stringify({width,gem,t,m}));
   await uiPage.keyboard.press('Escape');assert.equal(await tip.isVisible(),false);assert.equal(await menuRoot.getByRole('dialog').isVisible(),true);
   if(!gem)await uiPage.screenshot({path:path.join(output,'ui-'+width+'.png'),fullPage:false});
   await openSystem(menuRoot,'support');await settle(uiPage);
   const buttons=await menuRoot.locator('.diagnostics-controls .action-pair>button').evaluateAll(ns=>ns.map(n=>({width:n.clientWidth,scroll:n.scrollWidth,whiteSpace:getComputedStyle(n).whiteSpace,top:n.getBoundingClientRect().top})));
   assert.equal(buttons.length,2);assert(Math.abs(buttons[0].top-buttons[1].top)<1);for(const b of buttons){assert.equal(b.whiteSpace,'normal');assert(b.scroll<=b.width,'diagnostics label fits '+JSON.stringify({width,b}));}
  }
 });
 await uiPage.close();
 const thread=await pageAt('https://www.reddit.com/r/example/comments/one/a_useful_discussion/',{width:1440,height:1000},{trackRead:true});
 await check('media overlay pauses read exposure and closing restarts the full visibility interval',async()=>{
  await thread.evaluate(()=>{const r=window.__thread.runtime;r.media([...r.items.values()].find(v=>v.item.id==='t3_one').item);document.querySelector('[thingid="t1_parent"]').scrollIntoView({block:'center'});});
  await thread.waitForTimeout(1600);assert.equal(await thread.locator('[thingid="t1_parent"]').getAttribute('data-rc-read'),null);
  await thread.evaluate(()=>window.__thread.runtime.closeOverlay());await thread.waitForTimeout(1800);assert.equal(await thread.locator('[thingid="t1_parent"]').getAttribute('data-rc-read'),'1');
 });
 await check('read exposure and parent context use loaded comments only',async()=>{await thread.locator('[thingid="t1_parent"]').scrollIntoViewIfNeeded();await thread.waitForTimeout(1900);assert.equal(await thread.locator('[thingid="t1_parent"]').getAttribute('data-rc-read'),'1');await thread.locator('[thingid="t1_child"]').getByRole('button',{name:'Parent context'}).click();assert.match(await thread.locator('.rc-popover').innerText(),/A parent reply/);await thread.locator('.rc-popover').getByRole('button',{name:'Close',exact:true}).click();});
 await check('account unverified state pauses personal data',async()=>{await thread.evaluate(()=>{document.querySelector('shreddit-app').removeAttribute('user-name');document.querySelector('a[href="/login"]').remove();});await settle(thread);assert.equal(await thread.evaluate(()=>window.__thread.runtime.verified),false);assert.deepEqual(await thread.evaluate(()=>window.__thread.runtime.people),{});});
 await check('all settings routes are usable at desktop, 390px and 320px in light/dark',async()=>{for(const [width,scheme]of [[1440,'dark'],[390,'light'],[320,'dark']]){await thread.setViewportSize({width,height:800});await thread.emulateMedia({colorScheme:scheme});await thread.evaluate(()=>{window.__thread.ui.theme();window.__thread.ui.product.open();});for(const route of ['feed','read','filters','people','look','system','support','reset']){await thread.evaluate(id=>window.__thread.ui.openRoute(id),route);await thread.waitForTimeout(80);const layout=await thread.locator('#exp-thread-root').evaluate(host=>{const panel=host.shadowRoot.querySelector('[role="dialog"]'),r=panel.getBoundingClientRect();return {left:r.left,right:r.right,scroll:panel.scrollWidth,width:panel.clientWidth,checkbox:host.shadowRoot.querySelectorAll('input[type=checkbox]').length};});assert(layout.left>=-1&&layout.right<=width+1,route+' panel contained '+JSON.stringify(layout));assert(layout.scroll<=layout.width+2,route+' menu overflow');assert.equal(layout.checkbox,0);}await thread.evaluate(()=>window.__thread.ui.openRoute('feed'));await thread.evaluate(()=>scrollTo(0,0));await settle(thread);await thread.screenshot({path:path.join(captures,width===1440?'desktop.png':width===390?'mobile-light.png':'mobile.png'),fullPage:false});}});
 await check('four view layouts contain at 320px and keep title/actions readable',async()=>{await thread.evaluate(()=>{window.__thread.ui.product.close();history.pushState({},'','/r/example/');});await settle(thread);for(const view of ['cards','compact','grid','list']){await thread.evaluate(v=>{window.__thread.runtime.viewOverride=v;window.__thread.runtime.schedule();},view);await settle(thread);const dims=await thread.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,title:getComputedStyle(document.querySelector('[slot="title"]')).fontSize}));assert(dims.scroll<=dims.width+1,view+' overflow '+JSON.stringify(dims));assert(parseFloat(dims.title)>=16);}});
 await check('repeated routes/insert/remove retain bounded runtime resources and teardown restores focus attributes',async()=>{for(let i=0;i<12;i++){await thread.evaluate(i=>{history.pushState({},'','/r/example/?test='+i);const n=document.createElement('shreddit-post');n.id='transient'+i;n.setAttribute('post-title','Transient');document.querySelector('shreddit-feed').append(n);n.remove();},i);await thread.waitForTimeout(180);}const counts=await thread.evaluate(()=>{window.gc?.();const r=window.__thread.runtime;return {items:r.items.size,timers:r.readTimers.size,workers:r.regex.pending.size,listeners:window.__listeners.size,heap:performance.memory?.usedJSHeapSize};});fs.writeFileSync(path.join(output,'route-counters.json'),JSON.stringify(counts,null,2));assert(counts.items<=250);assert(counts.timers<=250);assert.equal(counts.workers,0);assert.equal(counts.listeners,7);await thread.evaluate(()=>window.__thread.runtime.destroy());assert.equal(await thread.locator('[data-rc-owned],#exp-thread-root').count(),0);assert.equal(await thread.evaluate(()=>window.__listeners.size),0);});
 await thread.close();
 // Real suite builds forced onto the authored Reddit fixture: this is coexistence proof, not metadata/site support proof.
 await check('five built products coexist in both load orders with SHIFT themes and a single flyout',async()=>{
  for(const order of [['thread','dropper','shift','prisma','ward'],['ward','prisma','shift','dropper','thread']]){
   const page=await pageAt('https://www.reddit.com/r/example/',{width:1280,height:1000});
   // pageAt supplied THREAD first; remove it and bootstrap in the declared order.
   await page.evaluate(()=>window.__thread.runtime.destroy());
   for(const id of order){if(id==='thread')await page.addScriptTag({content:testedSource});else {const repo={dropper:'Dropper',shift:'SHIFT',prisma:'PRISMA',ward:'WARD'}[id];await page.addScriptTag({content:fs.readFileSync(path.join(workspace,repo,id+'.user.js'),'utf8')});}}
   await page.waitForTimeout(1200);
   for(const id of order){const host=id==='dropper'?'#tdh-root':'#exp-'+id+'-root';assert.equal(await page.locator(host).count(),1,id+' registered');}
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('[data-exp-product-launcher="1"]')].map(h=>h.shadowRoot?.querySelector('[data-exp-part="flyout-hub"]')).filter(Boolean).length),1);
   const shift=page.locator('#exp-shift-root');
   await shift.locator('.launcher').evaluate(n=>n.click());
   await shift.locator('[data-section="appearance"]').evaluate(n=>n.click());
   for(const theme of ['blue','red','gray']){
    await shift.locator('[data-shift-theme="'+theme+'"]').click();
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>GM_getValue('exp:v3:shift:settings',{}).theme),theme,'actual SHIFT preference changed');
    for(const enabled of [false,true,false]){
     await page.evaluate(enabled=>{window.__thread.runtime.update({defaultView:'list',gemTheme:enabled});window.__thread.ui.product.open();},enabled);await settle(page);
     assert.equal(await page.locator('#exp-thread-root').getByRole('dialog').isVisible(),true);
     const palette=await page.locator('#exp-thread-root').evaluate(h=>h.shadowRoot.querySelector('.exp-core-theme').dataset.uiTheme);
     assert.equal(palette,enabled?'thread-gem':'reddit-native');
     await page.evaluate(()=>window.__thread.ui.product.close());
    }
    await shift.locator('.launcher').evaluate(n=>n.click());
    await shift.locator('[data-section="appearance"]').evaluate(n=>{if(n.getAttribute('aria-expanded')!=='true')n.click();});
   }
   await page.close();
  }
 });
 assert.deepEqual(errors,[],'page errors');
 if(process.argv.includes('--captures')){
  // These captures occur only after all functional/coexistence checks above pass.
  const page=await pageAt();await page.emulateMedia({colorScheme:'dark'});
  for(const [enabled,label]of [[false,'off'],[true,'on']]){
   await page.evaluate(enabled=>{window.__thread.runtime.update({gemTheme:enabled});window.__thread.ui.openRoute('look');},enabled);
   await settle(page);await page.evaluate(()=>scrollTo(0,0));await settle(page);
   const file=path.join(output,'thread-gem-'+label+'.png');await page.screenshot({path:file,fullPage:true});
   fs.copyFileSync(file,path.join(root,'docs/screenshots/gem-'+label+'.png'));
   await page.locator('#exp-thread-root').getByRole('dialog').screenshot({path:path.join(output,'thread-menu-gem-'+label+'.png')});
  }
  await page.evaluate(()=>{window.__thread.runtime.update({gemTheme:false});window.__thread.ui.openRoute('system');});await settle(page);
  await openSystem(page.locator('#exp-thread-root'),'support');await settle(page);
  await page.screenshot({path:path.join(output,'thread-support-page.png'),fullPage:false});
  await page.locator('#exp-thread-root').getByRole('dialog').screenshot({path:path.join(output,'thread-support.png')});
  await page.close();
 }
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({buildSha256:require('node:crypto').createHash('sha256').update(source).digest('hex'),browser:browser.version(),checks,errors,requests,limits:['Synthetic authored DOM shaped from observed native header/feed structure. No installed candidate, mobile web, authenticated API, real save/vote or long-session proof.']},null,2));
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
}
run().catch(e=>{fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({message:e.message,stack:e.stack,checks,errors},null,2));console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
