RC.Runtime=class {
  constructor(store){
    this.store=store;this.regex=new RC.Regex();this.items=new Map();this.revealed=new Set();this.manual=new Map();this.readTimers=new Map();this.regexErrors=new Map();this.collapsed=new Set();this.loadSeen=new WeakSet();this.loadCounts={post:0,comment:0};this.selected='';this.scope='all';this.route='';this.epoch=0;this.timer=0;this.destroyed=false;this.overlay=null;this.bar=null;this.account=null;this.verified=false;this.routeObserver=null;this.resize=()=>{this.layout();for(const record of this.items.values())this.positionHeaderMenu(record);};
    this.scroll=()=>{this.captureFeedAnchor();this.schedule();};this.key=e=>this.onKey(e);this.dismissMenus=e=>this.dismissHeaderMenus(e);this.click=e=>{this.dismissHeaderMenus(e);this.onClick(e);};
    this.style=document.createElement('style');this.style.dataset.rcOwned='style';this.style.textContent=RC.CSS;document.head.append(this.style);
    this.readObserver=new IntersectionObserver(entries=>this.observeRead(entries),{threshold:[0,.6]});
    this.observer=new MutationObserver(records=>{if(records.some(r=>!RC.Adapter.owned(r.target)&&((r.type==='attributes'&&(r.attributeName!=='href'||r.target.closest('header,[data-testid="user-menu"]')))||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!RC.Adapter.owned(n)&&!n.hasAttribute('data-rc-owned')))))this.schedule();});
    this.observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['author','score','user-name','username','href','permalink','thingid','is-op','distinguished','spoiler','nsfw','comment-count','src','srcset','data-lazy-src','data-lazy-srcset','hidden']});
    addEventListener('scroll',this.scroll,{passive:true});addEventListener('resize',this.resize,{passive:true});document.addEventListener('keydown',this.key);document.addEventListener('click',this.click);document.addEventListener('pointerdown',this.dismissMenus,true);
    this.routeObserver=ExtraPotionsCore.observeNavigation(()=>this.schedule());
    this.schedule();
  }
  notify(text){this.message=text;this.ui?.status(text);}
  refreshSettings(){this.settings=RC.Model.settings(this.store.get('settings',{}));this.rules=RC.Model.rules(this.store.get('rules',[]));this.history=RC.Model.prune(this.store.get('history',[]),this.settings.historyCapacity,this.settings.retentionDays);this.visits=this.cleanVisits(this.store.get('visits',{}));this.people=this.store.people();this.readingState();}
  cleanVisits(raw){if(!RC.Model.plain(raw))return {};return Object.fromEntries(Object.entries(raw).filter(([k,v])=>k.length<160&&RC.Model.plain(v)&&Number.isFinite(v.at)&&v.at>Date.now()-(this.settings?.retentionDays||30)*86400000).sort((a,b)=>b[1].at-a[1].at).slice(0,100).map(([k,v])=>[k,{at:v.at,read:Array.isArray(v.read)?v.read.filter(id=>typeof id==='string').slice(-500):[],count:Number.isFinite(v.count)?Math.max(0,v.count):0,last:typeof v.last==='string'?v.last.slice(0,120):''}]));}
  accountCheck(){const next=RC.Adapter.account();if(next===this.account&&this.initialized)return false;this.clearRoute();this.postReadUndo=null;this.libraryUndo=null;this.route='';this.initialized=true;this.account=next;this.verified=!!next;this.store.unlisten();this.store.account=next||'unverified';this.refreshSettings();if(!next){this.people={};this.rules=[];this.visits={};this.history=[];}
    this.store.listen(()=>{this.closeOverlay();this.refreshSettings();if(!this.verified){this.people={};this.rules=[];this.visits={};this.history=[];}this.epoch++;this.schedule();this.ui?.refresh();});return true;
  }
  schedule(){if(this.timer||this.destroyed)return;this.timer=setTimeout(()=>{this.timer=0;this.scan().catch(()=>this.notify('Page adaptation paused after an error. Reload or disable companion.'));},160);}
  async scan(){
    if(this.destroyed)return;const changed=this.accountCheck();const route=location.pathname+location.search;
    if(this.route!==route){this.clearRoute();this.route=route;this.loadCounts={post:0,comment:0};this.loadSeen=new WeakSet();this.viewOverride=null;this.refreshSettings();if(!this.verified){this.people={};this.rules=[];this.visits={};}this.previousVisit=this.visits[this.threadKey()]||null;if(this.settings.trackRead&&this.verified&&location.pathname.includes('/comments/')){const old=this.previousVisit||{read:[],last:'',count:0};this.visits[this.threadKey()]={...old,at:Date.now(),count:this.nativeCommentCount()??old.count};this.store.set('visits',this.visits);}this.sortDefault();}
    if(changed)this.ui?.refresh();if(location.hostname==='old.reddit.com')return;
    const epoch=++this.epoch;
    if(!this.settings.enabled||ExtraPotionsCore.suiteSitePaused()){this.siteColors?.clear();this.clearNodes();this.bar?.remove();this.bar=null;this.topButton?.remove();this.topButton=null;this.railHandle?.remove();this.railHandle=null;this.closeOverlay();return;}
    this.pageBar();this.layout();
    const all=RC.Adapter.nodes().slice(0,2000),readHidden=this.filterReadPosts(all);const nodes=all.filter(n=>!readHidden.has(n)&&RC.Adapter.nearby(n)).slice(0,250);const keep=new Set(nodes);
    for(const [node,record]of this.items)if(!keep.has(node))this.release(node,record);
    for(const node of readHidden)this.attr(node,'data-rc-post-read-hidden','1');
    const batch=nodes.map(RC.Adapter.item).filter(item=>item.id);
    const regexResults=new Map();this.regexErrors.clear();
    for(const rule of this.rules.filter(r=>r.regex)){
      const result=await this.regex.evaluate(rule.pattern,batch.map(item=>RC.Model.applies(rule,item)?item[rule.field]||'':''));
      if(epoch!==this.epoch||this.destroyed)return;
      if(result.error)this.regexErrors.set(rule.id,result.error);else regexResults.set(rule.id,result.matches);
    }
    if(epoch!==this.epoch||this.destroyed)return;
    const rawCollapse=this.store.get('collapse',{});const collapseMemory=RC.Model.plain(rawCollapse)?rawCollapse:{};this.currentRead=new Set(this.visits[this.threadKey()]?.read||[]);
    for(let i=0;i<batch.length;i++){
      const item=batch[i],node=item.node;
      let record=this.items.get(node);if(!record){record={item,tools:null,signature:''};this.items.set(node,record);this.readObserver.observe(node);}record.item=item;
      const person=this.people[item.author.toLowerCase()]||{};
      const rule=this.rules.find(r=>RC.Model.applies(r,item)&&(r.regex?regexResults.get(r.id)?.[i]:RC.Model.literal(r,item)));
      const treatment=this.manual.get(item.id)||(person.ignore?'hide':rule?.treatment);const reason=this.manual.has(item.id)?'Hidden manually':person.ignore?'Local ignore':rule?'Filter: '+rule.pattern:'';
      this.attr(node,'data-rc-treatment',treatment&&!this.revealed.has(item.id)?treatment:null);
      const shouldCollapse=this.collapsed.has(item.id)||(Array.isArray(collapseMemory[this.threadKey()])?collapseMemory[this.threadKey()]:[]).includes(item.id)||(item.kind==='comment'&&(item.depth>this.settings.collapseDepth||this.settings.collapsePinned&&item.pinned||this.settings.collapseAutoMod&&item.author.toLowerCase()==='automoderator'));
      this.attr(node,'data-rc-collapsed',shouldCollapse&&!this.revealed.has('collapse:'+item.id)?'1':null);
      this.attr(node,'data-rc-density',this.settings.density==='standard'?null:this.settings.density);
      this.attr(node,'data-rc-font','1');node.style.setProperty('--rc-content-font',this.settings.contentFont+'px');
      this.attr(node,'data-rc-read',this.settings.trackRead&&this.currentRead.has(item.id)?'1':null);
      for(const [name,on]of Object.entries({select:this.settings.selectText,expand:this.settings.expandText,hover:this.settings.hover,'hide-author':!this.settings.author,'hide-flair':!this.settings.flair,'hide-awards':this.settings.awards==='off'||this.settings.awards==='upvoted'&&node.getAttribute('vote-state')!=='UP','awards-collapsed':this.settings.awards==='collapse','hide-save':item.kind==='comment'?!this.settings.commentSave:this.settings.saveVisibility==='off'||this.settings.saveVisibility==='upvoted'&&node.getAttribute('vote-state')!=='UP'}))this.attr(node,'data-rc-'+name,on?'1':null);
      this.attr(node,'data-rc-negative',item.kind==='comment'&&this.settings.dimNegative&&item.score<0?'1':null);
      const signature=JSON.stringify([reason,treatment,this.revealed.has(item.id),shouldCollapse,this.revealed.has('collapse:'+item.id),person,this.settings.parentContext,this.settings.inlineMedia,this.settings.inlineMedia&&RC.Adapter.media(item).length>0,this.settings.nicknameMode,this.settings.nicknameMax,this.settings.trackRead,this.currentRead.has(item.id),this.settings.commentSave,this.settings.saveVisibility,this.isSaved(item),this.settings.trackPosts,this.postIsRead(item.id)]);
      if(signature!==record.signature){record.signature=signature;this.tools(record,reason,treatment,shouldCollapse,person);}
      if(treatment&&!this.revealed.has(item.id)&&this.verified&&item.kind==='post')this.recordHidden(item,reason);
    }
    this.contentView();this.readingPass();this.unblur();this.pruneTransient();
    if(this.regexErrors.size)this.notify([...this.regexErrors.values()][0]);
    ExtraPotionsCore.publishSuiteState('thread','thread.state-changed',{active:true,loaded:this.items.size});
  }
  attr(n,k,v){if(v===null){if(n.hasAttribute(k))n.removeAttribute(k);}else if(n.getAttribute(k)!==v)n.setAttribute(k,v);}
  nativeCommentCount(){const raw=document.querySelector('shreddit-post[comment-count]')?.getAttribute('comment-count');return raw!==null&&raw!==undefined&&Number.isFinite(Number(raw))?Math.max(0,Number(raw)):null;}
  threadKey(){return location.pathname.match(/\/comments\/[^/]+/)?.[0]||location.pathname.slice(0,120);}
  recordHidden(item,reason){if(!this.settings.historyCapacity)return;if(this.history.some(v=>v.id===item.id))return;this.history=RC.Model.prune([...this.history,{id:item.id,at:Date.now(),reason}],this.settings.historyCapacity,this.settings.retentionDays);this.store.set('history',this.history);}
  tools(record,reason,treatment,collapsed,person){
    const {item}=record;const previous=record.tools;const focused=previous?.contains(document.activeElement)?document.activeElement?.textContent:null;
    const bar=RC.el('div',{class:'rc-tools','data-rc-owned':'tools'});bar.style.setProperty('--rc-ui-font',this.settings.uiFont+'px');
    this.guardToolEvents(bar);
    const button=(label,fn)=>{const b=RC.button(label,fn);bar.append(b);return b;};
    if(treatment){bar.append(RC.el('small',{},this.revealed.has(item.id)?'Revealed · '+reason:reason));button(this.revealed.has(item.id)?'Apply treatment':'Reveal',()=>{if(this.revealed.has(item.id))this.revealed.delete(item.id);else this.revealed.add(item.id);this.schedule();});}
    if(collapsed)button('Reveal collapsed content',()=>{this.revealed.add('collapse:'+item.id);this.collapsed.delete(item.id);this.saveCollapse(item.id,false);this.schedule();});
    if(RC.Model.validUser(item.author))button(person.tag?'Tag: '+person.tag:'Tag / note',()=>this.editPerson(item));
    if(person.nickname&&this.settings.nicknameMode!=='profile')bar.append(RC.el('small',{},(this.settings.nicknameMode==='both'?item.author+' · ':'')+person.nickname.slice(0,this.settings.nicknameMax)));
    if(person.note)button('Read private note',()=>this.popover('Private note',RC.el('p',{},person.note)));
    if(this.settings.trackRead&&item.kind==='comment')bar.append(RC.el('small',{},this.currentRead?.has(item.id)?'Read':'Unread · loaded'));
    if(item.kind==='comment'&&this.settings.parentContext){const b=button('Parent context',()=>this.parent(item,true));b.addEventListener('focus',()=>{if(!this.overlay&&!this.suppressContext)this.parent(item,false);});b.addEventListener('mouseenter',()=>{clearTimeout(record.hoverTimer);if(!this.overlay)record.hoverTimer=setTimeout(()=>{if(b.isConnected&&!this.overlay)this.parent(item,false);},350);});b.addEventListener('mouseleave',()=>clearTimeout(record.hoverTimer));}
    button(collapsed?'Keep collapsed':'Collapse locally',()=>{this.collapsed.add(item.id);this.revealed.delete('collapse:'+item.id);this.saveCollapse(item.id,true);this.schedule();});
    if(this.verified&&this.savedItem(item))button(this.isSaved(item)?'Edit local bookmark':'Save to collection',()=>this.saveToCollection(item));
    if(item.kind==='post'&&this.settings.trackPosts&&this.verified)button(this.postIsRead(item.id)?'Mark unread':'Mark read',()=>this.markPostRead(item,!this.postIsRead(item.id)));
    if(item.kind==='comment')button('Collapse / expand loaded replies',()=>this.foldReplies(item));
    button('Hide locally',()=>{this.manual.set(item.id,'hide');this.revealed.delete(item.id);this.schedule();});
    if((item.kind==='comment'&&this.settings.commentSave)||(item.kind==='post'&&this.settings.saveVisibility==='always'))button('Reddit Save',()=>this.native(item,'save'));
    if(item.kind==='post'&&item.community&&this.verified)button('Filter r/'+item.community,()=>this.communityFilter(item.community));
    if(this.settings.inlineMedia&&!item.node.hasAttribute('data-rc-collapsed')&&!['hide','blur'].includes(item.node.getAttribute('data-rc-treatment'))&&RC.Adapter.media(item).length)button('View media',()=>this.media(item));
    if(previous)previous.replaceWith(bar);else item.node.prepend(bar);record.tools=bar;
    if(focused==='Thread actions')record.compactSummaryFocus=true;
    if(focused)[...bar.querySelectorAll('button')].find(b=>b.textContent===focused)?.focus();
  }
  // One exact community rule per community; the feed list and the post menu edit the same rule.
  communityFilter(name){
    const rule=this.rules.find(r=>r.exact&&r.field==='community'&&r.pattern.toLowerCase()===name.toLowerCase()),panel=RC.el('div',{class:'rc-reading-controls'});
    for(const treatment of ['hide','dim','blur'])panel.append(RC.button((rule?.treatment===treatment?'Keep ':'')+treatment[0].toUpperCase()+treatment.slice(1)+' r/'+name,()=>{this.setCommunityFilter(name,treatment);this.closeOverlay();}));
    if(rule)panel.append(RC.button('Stop filtering r/'+name,()=>{this.setCommunityFilter(name,null);this.closeOverlay();}));
    this.popover('Filter r/'+name,panel);
  }
  setCommunityFilter(name,treatment){
    if(!this.verified)return this.notify('Account identity is unverified; private rules are paused.');
    const others=this.rules.filter(r=>!(r.exact&&r.field==='community'&&r.pattern.toLowerCase()===name.toLowerCase()));
    if(treatment&&others.length>=100)return this.notify('Rule capacity reached (100). Remove a rule first.');
    this.rules=RC.Model.rules(treatment?[...others,{field:'community',pattern:name,target:'post',treatment,exact:true}]:others);this.store.set('rules',this.rules);this.schedule();this.ui?.refresh();
  }
  // Reddit's own reveal control, pressed once per blur: spoilers always; mature media only for a recognized account,
  // where Reddit has already delivered it. Signed-out age gates are left alone.
  unblur(){
    const s=this.settings;if(!s.unblurSpoilers&&!s.unblurMature)return;this.unblurred??=new WeakSet();
    for(const {item} of this.items.values()){if(item.kind!=='post')continue;for(const blur of item.node.querySelectorAll('shreddit-blurred-container[blurred]')){
      if(this.unblurred.has(blur))continue;const reason=blur.getAttribute('reason');
      if(!(reason==='spoiler'&&s.unblurSpoilers||reason==='nsfw'&&s.unblurMature&&this.verified&&this.account!=='guest'))continue;
      const reveal=blur.shadowRoot?.querySelector('.overlay button');if(!reveal)continue;this.unblurred.add(blur);reveal.click();
    }}
  }
  saveCollapse(id,on){if(!this.verified)return;const raw=this.store.get('collapse',{});const entries=RC.Model.plain(raw)?Object.entries(raw).slice(-99):[];const data=Object.fromEntries(entries);const ids=new Set(Array.isArray(data[this.threadKey()])?data[this.threadKey()]:[]);on?ids.add(id):ids.delete(id);data[this.threadKey()]=[...ids].slice(-500);this.store.set('collapse',data);}
  native(item,action){const n=RC.Adapter.action(item,action);if(!n)return this.notify('Native '+action+' control unavailable. Use Reddit’s own menu.');n.click();}
  observeRead(entries){this.observePostReads(entries);for(const e of entries){const node=e.target,record=this.items.get(node);if(!record)continue;clearTimeout(this.readTimers.get(node));this.readTimers.delete(node);if(!this.settings?.enabled||!this.settings.trackRead||!this.verified||this.overlay||document.visibilityState!=='visible'||e.intersectionRatio<.6||node.hasAttribute('data-rc-treatment')||node.hasAttribute('data-rc-collapsed')||record.item.kind!=='comment')continue;const generation=this.readGeneration;this.readTimers.set(node,setTimeout(()=>{this.readTimers.delete(node);if(this.destroyed||!node.isConnected||this.readGeneration!==generation||this.overlay||!RC.Adapter.visible(node)||document.visibilityState!=='visible')return;const key=this.threadKey(),visits=this.cleanVisits(this.store.get('visits',{}));const visit=visits[key]||{at:Date.now(),read:[],count:0,last:''};const ids=new Set(visit.read);ids.add(record.item.id);const nativeCount=this.nativeCommentCount();visits[key]={at:Date.now(),read:[...ids].slice(-500),count:Number.isFinite(nativeCount)?Math.max(0,nativeCount):visit.count,last:record.item.id};this.visits=this.cleanVisits(visits);this.store.set('visits',this.visits);this.attr(node,'data-rc-read','1');},1200));}}
  pageBar(){const main=document.querySelector('main');if(!main)return;if(!this.bar)this.bar=RC.el('div',{'data-rc-owned':'pagebar',class:'rc-pagebar'});const comment=location.pathname.includes('/comments/');this.bar.dataset.rcPageType=comment?'comments':'feed';
    // Feed controls join Reddit's sort row so the feed starts where it natively does; other pages keep the strip.
    const sortLoader=!comment&&main.querySelector('shreddit-async-loader[bundlename="shreddit_sort_dropdown"]'),row=sortLoader?.parentElement;
    if(row){if(this.bar.previousElementSibling!==sortLoader)sortLoader.after(this.bar);}else if(main.firstElementChild!==this.bar)main.prepend(this.bar);
    for(const n of document.querySelectorAll('[data-rc-sort-row]'))if(n!==row)n.removeAttribute('data-rc-sort-row');if(row)this.attr(row,'data-rc-sort-row','1');this.attr(this.bar,'data-rc-inline',row?'1':null);const state=JSON.stringify([this.settings,comment,this.verified,this.viewOverride,this.nativeCommentCount(),this.visits[this.threadKey()]?.last,this.library.length,this.postReads.length,this.postReadUndo?.id]);if(this.barState===state)return;this.barState=state;const focused=this.bar.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;this.bar.replaceChildren();
    const button=(label,fn)=>this.bar.append(RC.button(label,fn));
    if(!comment){const label=RC.el('label',{class:'rc-view-picker'});label.append(RC.icon('sliders'),RC.select('Content view',this.viewOverride||this.settings.defaultView,[['native','Native'],['cards','Cards'],['compact','Compact Cards'],['grid','Grid']],v=>{this.viewOverride=null;this.viewFade=true;this.update({defaultView:v});}),RC.icon('chevron'));this.bar.append(label);}if(comment&&this.settings.navButtons){if(this.scope==='unread'&&(!this.settings.trackRead||!this.verified))this.scope='all';button('Previous comment',()=>this.navigate(-1));button('Next comment',()=>this.navigate(1));const select=RC.select('Jump between loaded comments',this.scope,[['all','All comments'],['op','OP comments'],['moderator','Moderator comments'],['tagged','Tagged authors'],['unread','Unread comments']],v=>{this.scope=v;});select.title='Jump targets only. Comments stay visible; unloaded replies are not searched.';select.querySelector('[value="unread"]').disabled=!this.settings.trackRead||!this.verified;this.bar.append(select);}
    if(this.verified)button('Local collections',()=>this.collections());
    if(!comment&&this.settings.trackPosts&&this.verified){button(this.settings.hideReadPosts?'Show read posts':'Hide read posts',()=>this.update({hideReadPosts:!this.settings.hideReadPosts}));if(this.postReadUndo?.account===this.account)button('Undo read change',()=>this.undoPostRead());}
    if(comment&&this.settings.navButtons){button('Next top-level thread',()=>this.navigateThread('roots'));button('Next sibling comment',()=>this.navigateThread('siblings'));}
    if(comment)button('Search loaded comments',()=>this.searchLoadedComments());
    if(comment){button('Collapse depth',()=>{const panel=RC.el('div');panel.append(RC.select('Collapse after depth',String(this.settings.collapseDepth),['0','1','2','3','99'],v=>this.update({collapseDepth:Number(v)})));this.popover('Loaded comment depth',panel);});const visit=this.visits[this.threadKey()];if(visit?.last)button('Resume loaded comment',()=>{const r=[...this.items.values()].find(r=>r.item.id===visit.last);r?this.focusItem(r.item):this.notify('Resume comment is not loaded. Use native context or load more replies.');});if(this.previousVisit){const count=this.nativeCommentCount();if(Number.isFinite(count))this.bar.append(RC.el('small',{},Math.max(0,count-this.previousVisit.count)+' new comments · count estimate'));}}
    if(location.hostname==='old.reddit.com'&&this.settings.redirect==='suggest'){const u=new URL(location.href);u.hostname='www.reddit.com';this.bar.append(RC.el('a',{href:u.href},'Open modern Reddit'));}
    if(focused)[...this.bar.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===focused)?.focus({preventScroll:true});
  }
  sortKey(comment){return (comment?'comment:':'feed:')+(location.pathname.match(/^\/r\/([^/]+)/)?.[1]||location.pathname.replace(/\/(best|hot|new|top|rising)\/?$/,'')).slice(0,120);}
  sortDefault(){if(!this.settings.enabled)return;if(location.hostname==='old.reddit.com'){if(this.settings.redirect==='redirect'){const u=new URL(location.href);u.hostname='www.reddit.com';location.replace(u.href);}return;}
    const comment=location.pathname.includes('/comments/');if(comment?new URL(location.href).searchParams.has('sort'):/\/(best|hot|new|top|rising)\/?$/.test(location.pathname))return;
    const sort=(this.verified&&(comment?this.settings.rememberCommentSort:this.settings.rememberSort)?this.store.get('sorts',{})?.[this.sortKey(comment)]:null)||(comment?this.settings.commentSort:this.settings.defaultSort);if(sort==='native'||!sort)return;const url=RC.Adapter.sortUrl(sort,comment,this.settings.topRange);if(url&&url.href!==location.href)location.replace(url.href);
  }
  layout(){if(!this.settings?.enabled)return;const s=this.settings;this.applySiteColors();for(const n of document.querySelectorAll('#right-sidebar-container')){this.attr(n,'data-rc-sidebar-hidden',s.right?null:'1');if(n.parentElement?.matches('.main-container'))this.attr(n.parentElement,'data-rc-fill',s.right?null:'1');}this.sidebarHandle();
    const header=document.querySelector('header');const top=header?Math.max(0,Math.min(160,header.getBoundingClientRect().bottom)):0;if(this.bar)this.bar.style.setProperty('--rc-sticky-top',top+'px');
    if(s.scrollTop){if(!this.topButton){this.topButton=RC.button('Top',()=>scrollTo({top:0,behavior:'instant'}));this.topButton.className='rc-back-top';this.topButton.dataset.rcOwned='back-top';this.topButton.setAttribute('aria-label','Back to top');document.body.append(this.topButton);}this.topButton.hidden=scrollY<300;}else{this.topButton?.remove();this.topButton=null;}
    const main=document.querySelector('main');if(main){this.attr(main,'data-rc-layout',s.wide||s.feedWidth!==800||s.commentWidth!==800||s.offset?'1':null);const width=s.wide?Math.max(320,innerWidth-32):(location.pathname.includes('/comments/')?s.commentWidth:s.feedWidth);main.style.setProperty('--rc-width',width+'px');main.style.setProperty('--rc-offset',Math.max(-Math.max(0,(innerWidth-width-32)/2),Math.min(s.offset,Math.max(0,(innerWidth-width-32)/2)))+'px');}
    const groups=[['shreddit-community-highlights',s.highlights],['[data-testid="recommendations"]',s.recommendations],['[data-testid="related-posts"]',s.related],['shreddit-post-sticky-header',s.stickyBar]];
    for(const [query,hidden]of groups)for(const n of document.querySelectorAll(query))this.attr(n,'data-rc-secondary-hidden',hidden?'1':null);
    for(const n of document.querySelectorAll('[data-testid="profile-menu"]'))this.attr(n,'data-rc-profile-simple',s.simplifyProfile?'1':null);
  }
  // Site colors recolor Reddit through its own colour variables, which reach inside post components. Reddit redeclares
  // them on its theme containers, so the override covers those too. Brand, vote and status colours stay native.
  applySiteColors(){
    this.siteColors??=ExtraPotionsCore.createSiteColors({product:'thread',mode:()=>document.documentElement.classList.contains('theme-dark')?'dark':'light',
      watch:render=>{const observer=new MutationObserver(render);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return ()=>observer.disconnect();},css:RC.siteColorCss});
    this.siteColors.apply(this.settings.siteColors);
  }
  // A handle on the right rail mirroring Reddit's left navigation collapse control; the choice persists.
  sidebarHandle(){
    const rail=document.querySelector('#right-sidebar-container');let shown=false;
    if(rail){if(this.settings.right)shown=getComputedStyle(rail).display!=='none';else{rail.removeAttribute('data-rc-sidebar-hidden');shown=getComputedStyle(rail).display!=='none';rail.setAttribute('data-rc-sidebar-hidden','1');}}
    if(!shown){this.railHandle?.remove();this.railHandle=null;return;}
    if(!this.railHandle){this.railHandle=RC.button('',()=>this.update({right:!this.settings.right}));this.railHandle.className='rc-rail-handle';this.railHandle.dataset.rcOwned='rail-handle';this.railHandle.append(RC.icon('chevron'));document.body.append(this.railHandle);}
    const open=this.settings.right,label=open?'Collapse right sidebar':'Expand right sidebar',handle=this.railHandle;handle.setAttribute('aria-label',label);handle.title=label;handle.setAttribute('aria-expanded',String(open));handle.dataset.rcOpen=open?'1':'0';
    const header=Math.max(0,document.querySelector('header')?.getBoundingClientRect().bottom||0),width=document.documentElement.clientWidth;
    handle.style.top=Math.round(header+16)+'px';handle.style.left=Math.round(open?rail.getBoundingClientRect().left-16:width-40)+'px';
  }
  navigate(direction){let list=[...this.items.values()].map(r=>r.item).filter(i=>i.node.isConnected&&!i.node.hasAttribute('data-rc-treatment')&&(!location.pathname.includes('/comments/')||i.kind==='comment'));list=list.filter(i=>this.scope==='all'||this.scope==='op'&&i.op||this.scope==='moderator'&&i.mod||this.scope==='tagged'&&this.people[i.author.toLowerCase()]?.tag||this.scope==='unread'&&!this.currentRead?.has(i.id));const current=list.findIndex(i=>i.id===this.selected);const next=current<0?(direction>0?0:list.length-1):Math.max(0,Math.min(list.length-1,current+direction));if(list[next])this.focusItem(list[next]);else this.notify('No matching loaded content. Unloaded comments have not been searched.');}
  focusItem(item){for(const n of this.items.keys())n.removeAttribute('data-rc-selected');this.selected=item.id;item.node.setAttribute('data-rc-selected','1');if(!item.node.hasAttribute('tabindex')){item.node.tabIndex=-1;item.node.dataset.rcTabindex='1';}item.node.scrollIntoView({block:'center',behavior:'instant'});item.node.focus({preventScroll:true});}
  onKey(e){if(!this.settings?.enabled||!this.settings.keyboard||e.defaultPrevented||e.repeat||e.isComposing||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||this.overlay)return;const path=e.composedPath();if(path.some(n=>n?.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],dialog,[role="dialog"],[role="menu"]')||n?.id==='exp-thread-root'))return;if(document.querySelector('dialog[open],[aria-modal="true"]'))return;const action=Object.entries(this.settings.keys).find(([,key])=>key&&key===e.key.toLowerCase())?.[0];if(!action)return;e.preventDefault();if(action==='next'||action==='previous')return this.navigate(action==='next'?1:-1);const item=[...this.items.values()].find(r=>r.item.id===this.selected)?.item;if(!item)return;if(action==='open'&&item.url){if(item.kind==='post')this.markPostRead(item);this.captureFeedAnchor();this.saveFeedPosition();location.assign(item.url);}else if(action==='hide'){this.manual.set(item.id,'hide');this.schedule();}else if(action==='collapse'){this.collapsed.add(item.id);this.saveCollapse(item.id,true);this.schedule();}else if(['save','upvote','downvote'].includes(action))this.native(item,action);}
  onClick(e){if(!this.settings?.enabled||e.defaultPrevented)return;this.pendingFeedRestore=null;const anchor=e.composedPath().find(n=>n?.localName==='a');if(!anchor||RC.Adapter.owned(anchor))return;const u=RC.Adapter.link(anchor.getAttribute('href'));if(!u)return;const comment=u.pathname.includes('/comments/');if(comment){const post=anchor.closest('shreddit-post'),record=post&&this.items.get(post);if(record){this.captureFeedAnchor();this.saveFeedPosition();this.markPostRead(record.item);}}const sort=comment?u.searchParams.get('sort'):u.pathname.match(/\/(best|hot|new|top|rising)\/?$/)?.[1];if(sort&&this.verified&&(comment?this.settings.rememberCommentSort:this.settings.rememberSort)){const raw=this.store.get('sorts',{});this.store.set('sorts',{...(RC.Model.plain(raw)?Object.fromEntries(Object.entries(raw).slice(-99)):{}),[this.sortKey(comment)]:sort});}}
  update(patch){this.settings=RC.Model.settings({...this.settings,...patch});this.store.set('settings',this.settings);this.history=RC.Model.prune(this.history,this.settings.historyCapacity,this.settings.retentionDays);if(this.verified)this.store.set('history',this.history);this.epoch++;this.barState='';this.closeOverlay();this.regex.dispose();this.schedule();this.ui?.refresh();}
  editPerson(item){if(!this.verified)return this.notify('Personal records are paused until the native account or logged-out state is identifiable.');if(!RC.Model.validUser(item.author))return;const p=this.store.person(item.author),panel=RC.el('div');const fields={};for(const [key,title,max]of [['tag','Local tag',40],['nickname','Nickname',40],['note','Private note',4000]]){const input=RC.el(key==='note'?'textarea':'input',{maxlength:String(max),value:p[key]||'','aria-label':title});fields[key]=input;const label=RC.el('label',{},title);label.append(input);panel.append(label);}const ignore=RC.switch('Ignore locally',p.ignore,v=>p.ignore=v);panel.append(ignore);panel.append(RC.button('Save local record',()=>{if(this.store.setPerson(item.author,{...p,...Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,n.value]))})){this.people=this.store.people();this.closeOverlay();this.schedule();}else this.notify(this.store.error);}));panel.append(RC.button('Remove record',()=>{this.store.setPerson(item.author,{});this.people=this.store.people();this.closeOverlay();this.schedule();}));this.popover('Local record · '+item.author,panel);}
  parent(item,focus=false){const parent=[...this.items.values()].find(r=>r.item.id===item.parent)?.item;const content=RC.el('div');content.append(RC.el('p',{},parent?parent.text:'Parent is removed, unavailable or not loaded.'));if(parent?.url||item.url)content.append(RC.el('a',{href:parent?.url||item.url},'Open native context'));this.popover('Parent context',content,focus);}
  popover(title,content,focus=true){const from=document.activeElement;this.closeOverlay();this.suspendHeaderMenus();const panel=RC.el('section',{'data-rc-owned':'popover',class:'rc-popover',role:'region','aria-label':title});const close=RC.button('Close',()=>this.closeOverlay());panel.append(RC.el('h2',{},title),close,content);document.body.append(panel);this.overlay={node:panel,from,cleanup:()=>{}};const key=e=>{if(e.key==='Escape'){e.stopPropagation();this.closeOverlay();}};panel.addEventListener('keydown',key);if(focus)close.focus();}
  media(item){const media=RC.Adapter.media(item);if(!media.length)return this.notify('Native media unavailable or gated. Reveal it using Reddit’s controls.');const from=document.activeElement;this.closeOverlay();this.suspendHeaderMenus();const overlay=RC.el('div',{'data-rc-owned':'media',class:'rc-media',role:'dialog','aria-modal':'true','aria-label':'Post images'});const box=RC.el('div',{class:'rc-media-box'}),toolbar=RC.el('div',{class:'rc-media-toolbar'}),stage=RC.el('div',{class:'rc-media-stage'}),img=RC.el('img'),count=RC.el('span');let index=0,zoom=1;const paint=()=>{img.removeAttribute('src');img.src=media[index].src;img.alt=media[index].alt;img.style.maxWidth=zoom===1?'100%':'none';img.style.maxHeight=zoom===1?'calc(100dvh - 150px)':'none';img.style.width=zoom===1?'auto':(Math.max(1,img.naturalWidth||800)*zoom)+'px';count.textContent=(index+1)+'/'+media.length+' · '+Math.round(zoom*100)+'%';};const move=d=>{index=(index+d+media.length)%media.length;zoom=1;paint();};toolbar.append(RC.button('Close',()=>this.closeOverlay()),RC.button('Previous',()=>move(-1)),RC.button('Next',()=>move(1)),RC.button('Zoom in',()=>{zoom=Math.min(4,zoom+.5);paint();}),RC.button('Fit',()=>{zoom=1;paint();}),count);stage.append(img);box.append(toolbar,stage);overlay.append(box);document.body.append(overlay);paint();const inert=[...document.body.children,...document.querySelectorAll('[data-exp-product-launcher]')].filter(n=>n!==overlay&&!n.inert);inert.forEach(n=>n.inert=true);const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.closeOverlay();}else if(e.key==='ArrowRight'){e.preventDefault();move(1);}else if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}else if(e.key==='Tab'){const buttons=[...toolbar.querySelectorAll('button')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',key,true);overlay.addEventListener('click',e=>{if(e.target!==overlay)return;if(this.settings.backgroundNav&&(e.clientX<innerWidth*.22||e.clientX>innerWidth*.78))move(e.clientX<innerWidth*.22?-1:1);else if(this.settings.backgroundClose)this.closeOverlay();});img.addEventListener('error',()=>this.notify('Image could not load. Close or try the native media link.'));this.overlay={node:overlay,from,cleanup:()=>{document.removeEventListener('keydown',key,true);img.removeAttribute('src');inert.forEach(n=>{if(n.isConnected)n.inert=false;});}};toolbar.querySelector('button').focus();}
  closeOverlay(){if(!this.overlay)return;const {node,from,cleanup}=this.overlay;this.overlay=null;cleanup();node.remove();if(!this.destroyed&&this.settings?.trackRead){for(const item of this.items.keys()){this.readObserver.unobserve(item);this.readObserver.observe(item);}}for(const record of this.items.values())this.positionHeaderMenu(record);if(from?.isConnected){this.suppressContext=true;from.focus({preventScroll:true});this.suppressContext=false;}}
  pruneTransient(){const ids=new Set([...this.items.values()].map(r=>r.item.id));for(const set of [this.revealed,this.collapsed])if(set.size>500)for(const id of set)if(!ids.has(id)&&!ids.has(id.replace(/^collapse:/,'')))set.delete(id);if(this.manual.size>500)for(const id of this.manual.keys())if(!ids.has(id))this.manual.delete(id);}
  contentView(){
    const view=this.viewOverride||this.settings.defaultView;
    const grids=new Set();
    for(const record of this.items.values()){
      const {item}=record;
      if(item.kind!=='post'||location.pathname.includes('/comments/'))continue;
      if(view==='native')this.restoreView(record);else{if(record.nativeViewApplied===undefined)record.nativeView=item.node.getAttribute('view-type');else if(item.node.getAttribute('view-type')!==record.nativeViewApplied)record.nativeView=item.node.getAttribute('view-type');const type=item.node.querySelector(':scope > [slot="expando-content"]')?'compactView':item.node.querySelector(':scope > [slot="post-media-container"]')?'cardView':['compactView','cardView'].includes(record.nativeView)?record.nativeView:['cards','grid'].includes(view)?'cardView':'compactView';this.attr(item.node,'view-type',type);record.nativeViewApplied=type;}
      this.attr(item.node,'data-rc-view',view==='native'?null:view);
      this.compactTools(record,view);
      this.compactMedia(record,view);
      this.nativeMediaLayout(record,view);
      if(view==='grid'){
        let parent=item.node.parentElement;
        for(let depth=0;parent&&depth<5;depth++,parent=parent.parentElement){const posts=parent.querySelectorAll('shreddit-post');if(posts.length>1&&posts.length<1000){grids.add(parent);break;}}
      }
    }
    this.adView(location.pathname.includes('/comments/')?'native':view);this.gridLayout(grids);
    // A chosen view settles in with a short fade from an already-visible feed; input is never blocked and a newer choice restarts it.
    if(this.viewFade){this.viewFade=false;const feed=document.querySelector('main shreddit-feed');if(feed&&typeof feed.animate==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){this.viewFadeAnimation?.cancel();this.viewFadeAnimation=feed.animate([{opacity:.35},{opacity:1}],{duration:180,easing:'cubic-bezier(.16,1,.3,1)'});}}
  }
  // Ads keep native markup; only Reddit's own view-type and the shared card frame follow the chosen view.
  adView(view){
    this.adViews??=new Map();const ads=view==='native'?[]:[...document.querySelectorAll('main shreddit-ad-post')].slice(0,100),type=view==='compact'?'compactView':'cardView';
    for(const [ad,{native,applied}] of this.adViews)if(!ads.includes(ad)){if(ad.getAttribute('view-type')===applied)native===null?ad.removeAttribute('view-type'):ad.setAttribute('view-type',native);ad.removeAttribute('data-rc-view');this.adViews.delete(ad);}
    for(const ad of ads){const state=this.adViews.get(ad)||{native:ad.getAttribute('view-type')};state.applied=type;this.adViews.set(ad,state);this.attr(ad,'view-type',type);this.attr(ad,'data-rc-view',view);}
  }
  // Masonry packing: every visible feed child is one cell spanning its own height in 4px rows, so no row waits for its tallest card.
  // Empty native nodes (loaders, partials) sit at the grid's end, where their visibility still requests the next page.
  gridLayout(grids){
    this.gridCells??=new Set();this.gridContainers??=new Set();const cells=new Set(),aux=new Set();
    this.gridObserver??=new ResizeObserver(entries=>{for(const e of entries){const n=e.target;if(!n.hasAttribute('data-rc-view-wrapper'))continue;const h=e.borderBoxSize?.[0]?.blockSize??n.offsetHeight;n.style.setProperty('--rc-grid-span',String(Math.max(1,Math.ceil((h+12)/4))));}});
    for(const grid of grids)for(const n of grid.children){if(n.matches('hr,script,style,template'))continue;(n.matches('shreddit-post,shreddit-ad-post')||n.querySelector('shreddit-post,shreddit-ad-post')||n.offsetHeight>0?cells:aux).add(n);}
    for(const n of this.gridContainers)if(!grids.has(n))n.removeAttribute('data-rc-view-container');
    for(const n of this.gridCells)if(!cells.has(n)){this.gridObserver.unobserve(n);n.removeAttribute('data-rc-view-wrapper');n.style.removeProperty('--rc-grid-span');}
    for(const n of document.querySelectorAll('[data-rc-view-aux]'))if(!aux.has(n))n.removeAttribute('data-rc-view-aux');
    for(const n of grids)this.attr(n,'data-rc-view-container','grid');
    for(const n of aux)this.attr(n,'data-rc-view-aux','1');
    for(const n of cells)if(!this.gridCells.has(n)){this.attr(n,'data-rc-view-wrapper','1');this.gridObserver.observe(n);}
    this.gridCells=cells;this.gridContainers=grids;
  }
  guardToolEvents(bar){
    for(const type of ['pointerdown','pointerup','touchstart','touchend','keydown','keyup'])bar.addEventListener(type,e=>e.stopPropagation(),{passive:true});
    for(const type of ['auxclick','dblclick'])bar.addEventListener(type,e=>{e.stopPropagation();e.preventDefault();});
    bar.addEventListener('click',e=>{const summary=e.composedPath().find(n=>n?.localName==='summary'&&n.parentElement?.classList.contains('rc-compact-actions'));e.stopPropagation();e.preventDefault();if(summary)summary.parentElement.open=!summary.parentElement.open;});
  }
  pauseMedia(root){
    const walk=(node,depth)=>{for(const media of node.querySelectorAll('video,audio'))media.pause();if(depth<4)for(const host of [...node.querySelectorAll('*')].slice(0,800))if(host.shadowRoot)walk(host.shadowRoot,depth+1);};
    if(root)walk(root,0);
  }
  compactMedia(record,view){
    const post=record.item.node,full=post.querySelector(':scope > [slot="post-media-container"]:not([data-rc-owned])');
    const nativeThumb=post.querySelector(':scope > [slot="thumbnail"]:not([data-rc-owned])');
    const root=post.shadowRoot,supported=!root||root.querySelector('slot[name="thumbnail"]')&&(!nativeThumb||root.querySelector('slot[name="desktop-cta-row"],slot:not([name]),slot[name=""]'));
    const blocked=post.hasAttribute('data-rc-treatment')||post.hasAttribute('data-rc-collapsed')||record.item.gated||post.querySelector('shreddit-blurred-container,[data-testid="nsfw-gate"],[data-testid="spoiler-gate"]');
    const eligible=view==='compact'&&full&&supported&&!full.hidden&&!full.classList.contains('hidden')&&!blocked;
    this.attr(post,'data-rc-compact-flat',view==='compact'&&!post.shadowRoot?'1':null);
    this.attr(post,'data-rc-compact-has-thumb',view==='compact'&&(nativeThumb||eligible)?'1':null);
    if(!eligible){if(record.compactMediaOpen&&(blocked||full?.hidden||full?.classList.contains('hidden')))this.pauseMedia(record.compactFull);record.compactPreview?.remove();delete record.compactPreview;delete record.compactFull;delete record.compactMediaOpen;this.attr(post,'data-rc-compact-preview',null);this.attr(post,'data-rc-compact-media-open',null);return;}
    record.compactFull=full;
    if(record.compactPreview&&(!record.compactPreview.isConnected||!post.contains(record.compactPreview))){record.compactPreview.remove();delete record.compactPreview;}
    if(!record.compactPreview){
      const button=RC.button('',()=>{record.compactMediaOpen=!record.compactMediaOpen;if(!record.compactMediaOpen)this.pauseMedia(record.compactFull);this.compactMedia(record,this.viewOverride||this.settings.defaultView);});
      button.dataset.rcOwned='compact-preview';this.guardToolEvents(button);button.append(RC.el('span'));record.compactPreview=button;
    }
    const button=record.compactPreview,parent=nativeThumb&&record.tools?(record.tools.querySelector('.rc-action-items')||record.tools):post;
    button.className=nativeThumb?'rc-compact-media-toggle':'rc-compact-preview';
    if(root&&!nativeThumb)button.slot='thumbnail';else button.removeAttribute('slot');
    if(button.parentElement!==parent){if(parent===post)post.prepend(button);else parent.append(button);}
    // Native preview renditions suit a 104px thumbnail; lazy loading never starts inside the slotted button.
    const preview=!nativeThumb&&[...full.querySelectorAll('img')].map(n=>n.getAttribute('src')||'').find(src=>src.startsWith('https://preview.redd.it/'));
    const image=!nativeThumb&&(preview?{src:preview}:RC.Adapter.media(record.item)[0]);let img=button.querySelector('img');
    if(image){if(!img){img=RC.el('img',{alt:'',decoding:'async'});button.prepend(img);}if(img.getAttribute('src')!==image.src)img.src=image.src;}else img?.remove();
    const open=!!record.compactMediaOpen,label=open?'Close media':'Open media';button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',label);button.querySelector('span').textContent=label;
    if(!open)this.pauseMedia(record.compactFull);
    this.attr(post,'data-rc-compact-media-open',open?'1':null);this.attr(post,'data-rc-compact-preview',button.isConnected&&post.contains(button)?'1':null);
  }
  compactTools(record,view){
    const bar=record.tools;if(!bar)return;
    const previous=bar.querySelector(':scope > details.rc-compact-actions');
    const touch=matchMedia('(pointer:coarse)').matches;
    const compact=(view==='compact'||touch)&&!record.item.node.hasAttribute('data-rc-treatment')&&!record.item.node.hasAttribute('data-rc-collapsed');
    this.attr(bar,'data-rc-feed-actions',touch?'1':null);
    if(!record.item.node.shadowRoot&&!touch){const post=record.item.node,focused=bar.contains(document.activeElement)?document.activeElement:null;if(compact&&bar!==post.lastElementChild)post.append(bar);else if(!compact&&bar!==post.firstElementChild)post.prepend(bar);focused?.focus({preventScroll:true});}
    if(compact&&!previous){
      const details=RC.el('details',{class:'rc-compact-actions'}),summary=RC.el('summary',{},'Thread actions'),actions=RC.el('div',{class:'rc-action-items'});
      const focused=bar.contains(document.activeElement)?document.activeElement:null;
      actions.append(...bar.childNodes);details.append(summary,actions);details.open=!!record.compactActionsOpen||!!focused;
      details.addEventListener('toggle',()=>{record.compactActionsOpen=details.open;this.positionHeaderMenu(record);});bar.addEventListener('keydown',e=>{if(e.key==='Escape'&&bar.hasAttribute('data-rc-header-actions')){e.preventDefault();details.open=false;this.positionHeaderMenu(record);summary.focus({preventScroll:true});}});bar.append(details);if(record.compactSummaryFocus){summary.focus({preventScroll:true});delete record.compactSummaryFocus;}else if(focused)focused.focus({preventScroll:true});
    }else if(!compact&&previous){
      const focused=previous.contains(document.activeElement)?document.activeElement:null;
      bar.append(...previous.querySelector('.rc-action-items').childNodes);previous.remove();
      if(focused?.localName==='summary')bar.querySelector('button')?.focus({preventScroll:true});else focused?.focus({preventScroll:true});
    }
  }
  clearToolsLayout(record){const label=record.tools?.querySelector('summary');if(label?.querySelector('svg'))label.textContent='Thread actions';record.actionsSlot?.remove();record.actionsStyle?.remove();record.actionsRow?.removeAttribute('data-rc-header-row');if(record.headerContainer?.contains(record.tools))record.item.node.prepend(record.tools);record.headerContainer?.remove();record.tools?.removeAttribute('data-rc-header-actions');delete record.actionsSlot;delete record.actionsStyle;delete record.actionsRow;delete record.headerContainer;}
  nativeToolsLayout(record){
    const post=record.item.node,root=post.shadowRoot,bar=record.tools,summary=bar?.querySelector('summary');
    if(!matchMedia('(pointer:coarse)').matches){this.clearToolsLayout(record);return '';}
    if(!summary){
      if(record.actionsSlot?.dataset.rcRecovery&&record.actionsSlot.isConnected)return 'thread-feed-actions';
      this.clearToolsLayout(record);if(bar.parentElement!==post)post.prepend(bar);
      if(root){const projection=document.createElement('slot');projection.name='thread-feed-actions';projection.dataset.rcActionsSlot='1';projection.dataset.rcRecovery='1';root.prepend(projection);record.actionsSlot=projection;record.actionsRow=projection;return 'thread-feed-actions';}return '';
    }
    // Touch: a native-sized icon at the right end of the native footer action row.
    const actions=root?.querySelector('rpl-action-bar [data-testid="action-row"]')||root?.querySelector('slot[name="overflow-menu-bar"]')?.parentElement||null;
    const row=actions&&([...actions.children].filter(n=>n.localName==='div').pop()||actions);
    if(record.actionsRow!==row||row&&(!row.isConnected||!record.actionsSlot?.isConnected)){
      this.clearToolsLayout(record);
      if(row){
        const projection=document.createElement('slot');projection.name='thread-feed-actions';projection.dataset.rcActionsSlot='1';row.append(projection);row.dataset.rcHeaderRow='1';
        // Grid footers fit the icon with a tighter native gap; crowded rows (repost, mod actions) wrap it right-aligned instead of clipping.
        const style=document.createElement('style');style.dataset.rcHeaderStyle='1';style.textContent='[data-rc-actions-slot]{display:flex;align-items:center;margin-inline-start:auto}[data-testid="action-row"]:has([data-rc-actions-slot]){flex-wrap:wrap!important;row-gap:4px}:host([data-rc-view="grid"]) [data-testid="action-row"]:has([data-rc-actions-slot]){column-gap:6px!important}[data-rc-header-row],div:has(>slot[name="overflow-menu-bar"]){position:relative;z-index:1}';root.append(style);
        record.actionsSlot=projection;record.actionsStyle=style;record.actionsRow=row;
      }
    }
    if(record.actionsSlot){if(bar.parentElement!==post)post.prepend(bar);}else if(bar!==post.lastElementChild){const focused=bar.contains(document.activeElement)?document.activeElement:null;post.append(bar);focused?.focus({preventScroll:true});}
    const native=actions&&[...actions.querySelectorAll('button,a[href]'),...[...actions.querySelectorAll('slot:not([data-rc-actions-slot])')].flatMap(slot=>slot.assignedElements({flatten:true}).flatMap(n=>[n,...n.querySelectorAll('*')]).filter(n=>n.matches('button,a[href]')&&!RC.Adapter.owned(n)))].find(n=>RC.Adapter.visible(n)),box=native?.getBoundingClientRect(),height=box?.height;
    bar.style.setProperty('--rc-native-action-size',(height>=20&&height<=48?height:32)+'px');
    const tone=native&&getComputedStyle(native).backgroundColor;if(tone&&!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(tone))bar.style.setProperty('--rc-native-action-bg',tone);
    bar.dataset.rcHeaderActions='1';
    if(!summary.querySelector('svg')){
      summary.replaceChildren(RC.icon('sliders'),RC.el('span',{class:'rc-sr'},'Thread actions'));
    }
    summary.setAttribute('title','Thread actions');
    this.positionHeaderMenu(record);return record.actionsSlot?'thread-feed-actions':'';
  }
  positionHeaderMenu(record){const bar=record.tools,details=bar?.querySelector('details'),panel=bar?.querySelector('.rc-action-items');if(!panel||!bar.hasAttribute('data-rc-header-actions'))return;if(!details.open||this.overlay){if(typeof panel.hidePopover==='function'&&panel.matches(':popover-open'))panel.hidePopover();return;}if(typeof panel.showPopover==='function'){panel.setAttribute('popover','manual');if(!panel.matches(':popover-open'))panel.showPopover();}const r=details.querySelector('summary').getBoundingClientRect(),width=Math.min(280,document.documentElement.clientWidth-24);panel.style.width=width+'px';const h=panel.getBoundingClientRect().height;panel.style.left=Math.max(12,Math.min(r.right-width,document.documentElement.clientWidth-width-12))+'px';const below=r.bottom+4,above=r.top-4-h;panel.style.top=(below+h<=innerHeight-12?below:above>=12?above:Math.max(12,innerHeight-h-12))+'px';}
  dismissHeaderMenus(e){if(this.overlay?.node.contains(e.target)||e.target.closest?.('[data-rc-owned="popover"],[data-rc-owned="media"]'))return;for(const record of this.items.values())if(record.tools?.hasAttribute('data-rc-header-actions')&&!record.tools.contains(e.target)){const details=record.tools.querySelector('details');if(details?.open){details.open=false;this.positionHeaderMenu(record);}}}
  suspendHeaderMenus(){for(const record of this.items.values()){const panel=record.tools?.querySelector('.rc-action-items');if(typeof panel?.hidePopover==='function'&&panel.matches(':popover-open'))panel.hidePopover();}}
  nativeMediaLayout(record,view){
    const post=record.item.node,root=post.shadowRoot;
    this.attr(post,'data-rc-compact-card-layout',view==='compact'&&root?.querySelector('slot[name="post-media-container"]')?'1':null);
    this.compactRow(record,view);
    const headerSlot=this.nativeToolsLayout(record),toolsSlot=record.actionsRow?headerSlot:(view!=='native'&&root?.querySelector('slot[name="desktop-cta-row"]')?'desktop-cta-row':'');
    this.attr(post,'data-rc-compact-native-layout',view==='compact'&&matchMedia('(pointer:coarse)').matches&&root?.querySelector('slot[name="expando-content"]')?'1':null);
    if(record.tools&&record.tools.getAttribute('slot')!==toolsSlot){if(toolsSlot)record.tools.setAttribute('slot',toolsSlot);else record.tools.removeAttribute('slot');}this.positionHeaderMenu(record);
    if(view==='native'||!root?.querySelector('slot[name="expando-content"],slot[name="desktop-cta-row"]')){record.mediaStyle?.remove();delete record.mediaStyle;return;}
    if(record.mediaStyle?.isConnected&&record.mediaStyle.getRootNode()===root)return;
    record.mediaStyle?.remove();const style=document.createElement('style');style.dataset.rcMediaLayout='1';
    // Leave the native thumbnail column intact. Only full media spans the post;
    // native hidden expandos, player nodes and handlers retain control of opening it.
    style.textContent=':host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>div>slot[name="thumbnail"]){display:grid!important;grid-template-columns:104px minmax(0,1fr)!important;grid-template-rows:auto auto auto auto!important;gap:2px 8px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>slot[name="thumbnail"]){grid-column:1!important;grid-row:1/4!important;margin:0!important;width:104px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>div>slot[name="credit-bar"]){grid-column:2!important;grid-row:1/3!important;margin:0!important}:host([data-rc-view="compact"]) h2:has(>slot[name="title"]){font-size:16px!important;line-height:20px!important;margin:0!important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}:host([data-rc-view="compact"]) :is(div,section):has(>slot[name="desktop-cta-row"]):not(:has(>slot[name="title"])){display:flex;flex-wrap:wrap;align-items:center;gap:4px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) :is(div,section):has(>slot[name="overflow-menu-bar"]){grid-column:2!important;grid-row:3!important;margin-block:0!important}:host([data-rc-view="compact"][data-rc-compact-card-layout]) :is(div,section):has(>slot[name="post-media-container"]){grid-column:1/-1!important;grid-row:4!important}:host([data-rc-view="compact"][data-rc-compact-preview]:not([data-rc-compact-media-open])) :is(div,section):has(>slot[name="post-media-container"]){display:none!important}:host([data-rc-view]) :is(div,section):has(>slot[name="expando-content"]){grid-column:1/-1!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important}';
    style.textContent+=':host([data-rc-compact-native-layout]) div:has(>div>slot[name="thumbnail"]){grid-template-columns:88px minmax(0,1fr)!important}:host([data-rc-compact-native-layout]) div:has(>slot[name="thumbnail"]){grid-row:2/3!important;align-self:start;margin:2px 8px 0 0!important;width:80px;height:60px;overflow:hidden}:host([data-rc-compact-native-layout]) div:has(>slot[name="overflow-menu-bar"]){grid-column:1/-1!important;margin-block:2px!important}';
    root.append(style);record.mediaStyle=style;
  }
  // Reddit's compact card puts vote/comments/share below the 104x78 thumbnail. From 600px the thumbnail
  // column gives the action row's height back and the row reserves the thumbnail's width, so the row sits
  // beside the thumbnail; narrower feeds keep the full-width row because the controls would not fit.
  compactRow(record,view){
    const post=record.item.node,root=post.shadowRoot,active=view==='compact'&&!!root?.querySelector('div:has(>slot[name="share-button"])')&&!!root.querySelector('div:has(>slot[name="thumbnail"])');
    if(!active){record.rowStyle?.remove();delete record.rowStyle;return;}
    if(record.rowStyle?.isConnected&&record.rowStyle.getRootNode()===root)return;
    record.rowStyle?.remove();const style=document.createElement('style');style.dataset.rcCompactRow='1';
    style.textContent='@media(min-width:600px){:host([data-rc-view="compact"][data-rc-compact-has-thumb]:not([data-rc-compact-media-open])) div:has(>slot[name="thumbnail"]){margin-bottom:-40px!important}:host([data-rc-view="compact"][data-rc-compact-has-thumb]:not([data-rc-compact-media-open])) div:has(>slot[name="share-button"]){padding-inline-end:112px!important;box-sizing:border-box}}';
    root.append(style);record.rowStyle=style;
  }
  restoreView(record){record.rowStyle?.remove();delete record.rowStyle;record.compactPreview?.remove();delete record.compactPreview;delete record.compactFull;delete record.compactMediaOpen;record.mediaStyle?.remove();delete record.mediaStyle;if(record.nativeViewApplied!==undefined&&record.item.node.getAttribute('view-type')===record.nativeViewApplied)this.attr(record.item.node,'view-type',record.nativeView);delete record.nativeViewApplied;delete record.nativeView;}
  release(node,record){clearTimeout(record.postReadTimer);this.clearToolsLayout(record);this.restoreView(record);clearTimeout(record.hoverTimer);this.readObserver.unobserve(node);clearTimeout(this.readTimers.get(node));this.readTimers.delete(node);record.tools?.remove();if(node.dataset.rcTabindex==='1')node.removeAttribute('tabindex');for(const a of [...node.attributes])if(a.name.startsWith('data-rc-'))node.removeAttribute(a.name);node.style.removeProperty('--rc-content-font');for(const name of ['--rc-reading-font','--rc-line-height','--rc-paragraph-gap'])node.style.removeProperty(name);this.items.delete(node);}
  clearNodes(){for(const [node,r]of this.items)this.release(node,r);this.adView('native');this.gridLayout(new Set());for(const n of document.querySelectorAll('[data-rc-post-read-hidden],[data-rc-sidebar-hidden],[data-rc-fill],[data-rc-secondary-hidden],[data-rc-layout],[data-rc-profile-simple],[data-rc-view-container],[data-rc-view-wrapper],[data-rc-view-aux],[data-rc-sort-row],shreddit-ad-post[data-rc-view]')){for(const a of [...n.attributes])if(a.name.startsWith('data-rc-'))n.removeAttribute(a.name);for(const name of ['--rc-width','--rc-offset','--rc-grid-span'])n.style.removeProperty(name);}}
  clearRoute(){this.saveFeedPosition();this.feedAnchor=null;this.pendingFeedRestore=null;this.feedRestoreRoute='';this.readGeneration=(this.readGeneration||0)+1;this.epoch++;this.regex.dispose();this.clearNodes();this.readObserver?.disconnect();this.readTimers.forEach(clearTimeout);this.readTimers.clear();this.closeOverlay();this.bar?.remove();this.bar=null;this.topButton?.remove();this.topButton=null;this.railHandle?.remove();this.railHandle=null;this.barState='';this.revealed.clear();this.manual.clear();this.collapsed.clear();this.selected='';this.scope='all';}
  diagnostics(){return {product:'THREAD',version:RC.VERSION,accountVerified:this.verified,loaded:this.items.size,readTimers:this.readTimers.size,regexWorkers:this.regex.pending.size,loadCounts:{...this.loadCounts},regexErrors:[...this.regexErrors.values()],storage:this.store.error||'available',api:'Unavailable: own registration and legitimate access required',liveContract:'native header and feed DOM observed; candidate installed behavior unverified'};}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.siteColors?.clear();clearTimeout(this.timer);this.observer.disconnect();this.routeObserver?.();this.clearRoute();this.store.unlisten();removeEventListener('scroll',this.scroll);removeEventListener('resize',this.resize);document.removeEventListener('keydown',this.key);document.removeEventListener('click',this.click);document.removeEventListener('pointerdown',this.dismissMenus,true);this.style.remove();this.ui?.destroy();if(RC.ARTWORK)URL.revokeObjectURL(RC.ARTWORK);}
};
