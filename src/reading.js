// Original local reading tools. Copyright expDARE.
Object.assign(RC.Runtime.prototype,{
  readingPopover(title,content){this.popover(title,content);this.overlay.node.classList.add('rc-reading-panel');},
  readingState(){
    this.library=this.verified?RC.Model.library(this.store.get('library',[])):[];
    this.postReads=this.verified?RC.Model.postReads(this.store.get('postReads',[]),this.settings.retentionDays):[];
    this.feedPositions=this.cleanFeedPositions(this.store.get('feedPositions',{}));
  },
  savedItem(item){return RC.Model.library([{url:item.url}])[0];},
  isSaved(item){const key=this.savedItem(item)?.key;return !!key&&this.library?.some(row=>row.key===key);},
  persistLibrary(next){
    if(!this.verified)return false;
    const library=RC.Model.library(next);if(!this.store.set('library',library)){this.notify(this.store.error);return false;}
    this.library=library;this.barState='';this.schedule();return true;
  },
  saveToCollection(item){
    if(!this.verified)return this.notify('Local collections are paused until account identity is recognized.');
    const candidate=this.savedItem(item);if(!candidate)return this.notify('A native Reddit discussion link is needed to save locally.');
    const previous=this.library.find(row=>row.key===candidate.key),panel=RC.el('form'),title=RC.el('input',{'aria-label':'Saved title',maxlength:'300',value:previous?.title||item.title||'Saved comment'}),collection=RC.el('input',{'aria-label':'Collection name',maxlength:'40',value:previous?.collection||'Read later'}),note=RC.el('textarea',{'aria-label':'Saved note',maxlength:'2000',rows:'4'});
    note.value=previous?.note||'';
    for(const [label,control]of [['Title',title],['Collection',collection],['Private note',note]]){const line=RC.el('label',{},label);line.append(control);panel.append(line);}
    panel.append(RC.el('p',{},'Local bookmark only. This does not change Reddit Saved.'));
    const submit=RC.el('button',{type:'submit'},'Save locally'),status=RC.el('p',{role:'status','aria-live':'polite'});panel.append(submit,status);
    panel.addEventListener('submit',e=>{e.preventDefault();if(!previous&&this.library.length>=500){status.textContent='Local collection capacity reached (500). Remove or export an item first.';return;}if(this.persistLibrary([...this.library.filter(row=>row.key!==candidate.key),{...candidate,title:title.value,collection:collection.value,note:note.value,at:previous?.at||Date.now()}])){this.closeOverlay();this.notify('Saved to local collection.');}else status.textContent=this.store.error||'Could not save local bookmark.';});
    this.readingPopover(previous?'Edit local bookmark':'Save to collection',panel);
  },
  collections(){
    if(!this.verified)return this.notify('Local collections are paused until account identity is recognized.');
    const panel=RC.el('div'),search=RC.el('input',{type:'search','aria-label':'Search local collections',placeholder:'Search titles and notes'}),filter=RC.select('Collection','',[['','All collections'],...Array.from(new Set(this.library.map(row=>row.collection))).sort().map(name=>[name,name])],()=>paint()),list=RC.el('div'),status=RC.el('p',{role:'status','aria-live':'polite'});
    const controls=RC.el('div',{class:'rc-reading-controls'});controls.append(search,filter);panel.append(controls,status,list);
    const paint=()=>{
      const query=search.value.trim().toLocaleLowerCase(),rows=this.library.filter(row=>(filter.value===''||row.collection===filter.value)&&[row.title,row.note,row.collection].join(' ').toLocaleLowerCase().includes(query));
      status.textContent=rows.length+' local bookmarks · '+this.library.length+'/500';list.replaceChildren();rename.disabled=!filter.value;renameButton.disabled=!filter.value;moveButton.disabled=!filter.value;
      for(const row of rows.slice().reverse()){
        const entry=RC.el('article',{class:'rc-library-entry'}),link=RC.el('a',{href:row.url},row.title);entry.append(link,RC.el('p',{},row.collection));if(row.note)entry.append(RC.el('p',{},row.note));
        entry.append(RC.button('Edit bookmark',()=>this.saveToCollection({url:row.url,title:row.title})),RC.button('Remove bookmark',()=>{if(this.persistLibrary(this.library.filter(r=>r.url!==row.url))){this.libraryUndo={row,account:this.account};this.collections();}}));list.append(entry);
      }
      if(!rows.length)list.append(RC.el('p',{},this.library.length?'No matching local bookmarks.':'No local bookmarks yet. Use Save to collection in Thread actions.'));
    };
    search.addEventListener('input',paint);
    const rename=RC.el('input',{'aria-label':'New collection name',maxlength:'40',placeholder:'New collection name'});
    const renameButton=RC.button('Rename selected collection',()=>{const name=rename.value.trim();if(!name){status.textContent='Enter a new collection name.';rename.focus();return;}if(this.persistLibrary(this.library.map(row=>row.collection===filter.value?{...row,collection:name}:row)))this.collections();else status.textContent=this.store.error||'Could not update local collection.';});
    const moveButton=RC.button('Move selected collection to Read later',()=>{if(this.persistLibrary(this.library.map(row=>row.collection===filter.value?{...row,collection:'Read later'}:row)))this.collections();else status.textContent=this.store.error||'Could not update local collection.';});panel.append(rename,renameButton,moveButton);
    if(this.libraryUndo?.account===this.account)panel.append(RC.button('Undo bookmark removal',()=>{const row=this.libraryUndo.row;if(this.library.length>=500)return this.notify('Local collection capacity reached (500).');if(this.persistLibrary([...this.library,row])){this.libraryUndo=null;this.collections();}}));
    this.readingPopover('Local collections',panel);paint();
  },
  postIsRead(id){return this.postReads?.some(row=>row.id===id);},
  filterReadPosts(all){
    const hidden=new Set(),ids=new Set(this.postReads.map(row=>row.id)),enabled=this.verified&&this.settings.trackPosts&&this.settings.hideReadPosts;
    for(const node of all){if(node.localName!=='shreddit-post')continue;const id=node.getAttribute('thingid')||node.getAttribute('thing-id')||node.id;const hide=enabled&&ids.has(id);this.attr(node,'data-rc-post-read-hidden',hide?'1':null);if(hide)hidden.add(node);}
    return hidden;
  },
  markPostRead(item,read=true){
    if(!this.verified||!this.settings.trackPosts)return;
    const old=this.postReads.find(row=>row.id===item.id);if(!!old===read)return;
    const next=this.postReads.filter(row=>row.id!==item.id);if(read)next.push({id:item.id,at:Date.now()});
    if(!this.store.set('postReads',RC.Model.postReads(next,this.settings.retentionDays)))return this.notify(this.store.error);
    this.postReadUndo={id:item.id,old,account:this.account};this.postReads=RC.Model.postReads(next,this.settings.retentionDays);this.barState='';this.schedule();
  },
  undoPostRead(){
    const undo=this.postReadUndo;if(!undo||undo.account!==this.account||!this.verified)return;
    const next=this.postReads.filter(row=>row.id!==undo.id);if(undo.old)next.push(undo.old);
    if(this.store.set('postReads',next)){this.postReads=next;this.postReadUndo=null;this.barState='';this.schedule();}
  },
  observePostReads(entries){
    for(const entry of entries){const record=this.items.get(entry.target);if(record?.item.kind!=='post')continue;
      clearTimeout(record.postReadTimer);delete record.postReadTimer;
      if(!this.settings?.trackPosts||!this.settings.markScrolled||!this.verified||this.overlay||record.item.gated||document.visibilityState!=='visible'||entry.intersectionRatio<.6||entry.target.matches('[data-rc-treatment],[data-rc-collapsed],[data-rc-post-read-hidden]'))continue;
      const account=this.account;record.postReadTimer=setTimeout(()=>{delete record.postReadTimer;if(!this.destroyed&&this.settings.enabled&&this.settings.trackPosts&&this.settings.markScrolled&&this.account===account&&document.visibilityState==='visible'&&!this.overlay&&entry.target.isConnected&&RC.Adapter.visible(entry.target)&&!entry.target.matches('[data-rc-treatment],[data-rc-collapsed]'))this.markPostRead(record.item);},1200);
    }
  },
  captureFeedAnchor(){
    if(!this.settings?.enabled||!this.settings.restoreFeed||!this.verified||this.overlay||this.pendingFeedRestore||location.pathname.includes('/comments/'))return;
    const top=(document.querySelector('header')?.getBoundingClientRect().bottom||0)+20;
    const item=[...this.items.values()].map(r=>r.item).find(i=>i.kind==='post'&&RC.Adapter.visible(i.node)&&i.node.getBoundingClientRect().bottom>top&&!i.node.hasAttribute('data-rc-post-read-hidden'));
    if(item)this.feedAnchor={route:location.pathname+location.search,id:item.id,offset:Math.round(item.node.getBoundingClientRect().top),at:Date.now()};
  },
  cleanFeedPositions(raw){
    if(!RC.Model.plain(raw))return {};
    return Object.fromEntries(Object.entries(raw).filter(([path,row])=>path.startsWith('/')&&path.length<=240&&RC.Model.plain(row)&&typeof row.id==='string'&&row.id.length<=120&&Number.isFinite(row.offset)&&Math.abs(row.offset)<=50000&&Number.isFinite(row.at)&&row.at>Date.now()-this.settings.retentionDays*86400000).sort((a,b)=>a[1].at-b[1].at).slice(-100));
  },
  saveFeedPosition(){
    if(!this.settings?.enabled||!this.settings.restoreFeed||!this.verified||!this.feedAnchor)return;
    const {route,...anchor}=this.feedAnchor;const next=this.cleanFeedPositions({...this.feedPositions,[route]:anchor});
    if(this.store.set('feedPositions',next))this.feedPositions=next;
  },
  restoreFeedPosition(){
    const route=location.pathname+location.search;
    if(!this.settings.restoreFeed||!this.verified||location.pathname.includes('/comments/')){this.pendingFeedRestore=null;return;}
    if(this.feedRestoreRoute!==route){this.feedRestoreRoute=route;const anchor=this.feedPositions[route];this.pendingFeedRestore=anchor&&scrollY<5?{...anchor,attempts:0}:null;}
    const pending=this.pendingFeedRestore;if(!pending)return;
    if(this.overlay||scrollY>5){this.pendingFeedRestore=null;return;}
    const record=[...this.items.values()].find(r=>r.item.id===pending.id);
    if(record?.item.node.getClientRects().length){
      const node=record.item.node;this.pendingFeedRestore=null;scrollBy({top:node.getBoundingClientRect().top-pending.offset,behavior:'instant'});return;
    }
    if(scrollY>5||++pending.attempts>=20){this.pendingFeedRestore=null;return this.notify('Saved feed post is not loaded or is hidden. Position restoration stopped.');}
    this.schedule();
  },
  readingPass(){
    for(const {item}of this.items.values()){
      if(item.kind==='post'){this.attr(item.node,'data-rc-post-read',this.settings.trackPosts&&this.postIsRead(item.id)?'1':null);this.attr(item.node,'data-rc-post-read-hidden',this.verified&&this.settings.trackPosts&&this.settings.hideReadPosts&&this.postIsRead(item.id)?'1':null);}
      const font={native:'inherit',sans:'system-ui,sans-serif',serif:'Georgia,serif'}[this.settings.readingFont];
      item.node.style.setProperty('--rc-reading-font',font);item.node.style.setProperty('--rc-line-height',this.settings.lineHeight?String(this.settings.lineHeight/100):'normal');item.node.style.setProperty('--rc-paragraph-gap',this.settings.paragraphGap?this.settings.paragraphGap+'px':'revert');
      this.attr(item.node,'data-rc-reading-font',this.settings.readingFont!=='native'?'1':null);this.attr(item.node,'data-rc-reading-line',this.settings.lineHeight?'1':null);this.attr(item.node,'data-rc-reading-gap',this.settings.paragraphGap?'1':null);
    }
    this.refreshCommentSearch();this.restoreFeedPosition();
  },
  readingPreset(name){
    const presets={native:{readingFont:'native',lineHeight:0,paragraphGap:0,contentFont:14},comfortable:{readingFont:'sans',contentFont:18,lineHeight:170,paragraphGap:12},dense:{readingFont:'sans',contentFont:15,lineHeight:140,paragraphGap:6},book:{readingFont:'serif',contentFont:18,lineHeight:180,paragraphGap:14}};
    if(presets[name])this.update(presets[name]);
  },
  navigateThread(mode,direction=1){
    let comments=[...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.node.isConnected&&i.node.getClientRects().length&&!i.node.hasAttribute('data-rc-treatment'));
    const top=(this.bar?.getBoundingClientRect().bottom||document.querySelector('header')?.getBoundingClientRect().bottom||0)+8;
    const selected=comments.find(i=>i.id===this.selected&&i.node.getBoundingClientRect().top>=top-24&&RC.Adapter.visible(i.node));
    const current=selected||comments.find(i=>i.node.getBoundingClientRect().top>=top)||comments.filter(i=>RC.Adapter.visible(i.node)).at(-1);if(!current)return this.notify('No matching loaded comments.');
    const parent=item=>item.parent||this.loadedParent(item)?.id||'';
    comments=comments.filter(i=>mode==='roots'?i.depth===0:i.depth===current.depth&&parent(i)===parent(current));
    const index=comments.findIndex(i=>i.id===current.id);
    const target=index>=0?comments[index+direction]:comments.find(i=>i.node.getBoundingClientRect().top>current.node.getBoundingClientRect().top);
    if(target)this.focusItem(target);else this.notify('No next matching loaded thread. Unloaded replies are not searched.');
  },
  loadedParent(item){
    const node=item.node.parentElement?.closest('shreddit-comment');if(node&&this.items.has(node))return this.items.get(node).item;
    return [...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.depth<item.depth&&(i.node.compareDocumentPosition(item.node)&Node.DOCUMENT_POSITION_FOLLOWING)).sort((a,b)=>a.node.compareDocumentPosition(b.node)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1).at(-1);
  },
  foldReplies(item){
    if(!this.verified)return this.notify('Local reply folding requires recognized account identity.');
    const descendants=[...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.depth>item.depth);
    const ids=new Set([item.id]);let changed=true;while(changed){changed=false;for(const i of descendants)if(!ids.has(i.id)&&(ids.has(i.parent)||item.node.contains(i.node))){ids.add(i.id);changed=true;}}
    ids.delete(item.id);if(!ids.size)return this.notify('No loaded replies to collapse.');
    const reopen=descendants.filter(i=>ids.has(i.id)).every(i=>i.node.hasAttribute('data-rc-collapsed'));
    const raw=this.store.get('collapse',{}),data=RC.Model.plain(raw)?Object.fromEntries(Object.entries(raw).slice(-99)):{},key=this.threadKey(),saved=new Set(Array.isArray(data[key])?data[key]:[]);
    for(const id of ids)reopen?saved.delete(id):saved.add(id);data[key]=[...saved].slice(-500);
    if(!this.store.set('collapse',data))return this.notify(this.store.error);
    for(const id of ids){if(reopen){this.collapsed.delete(id);this.revealed.add('collapse:'+id);}else{this.collapsed.add(id);this.revealed.delete('collapse:'+id);}}this.schedule();
  },
  searchLoadedComments(){
    const panel=RC.el('div'),input=RC.el('input',{type:'search','aria-label':'Search loaded comments',placeholder:'Search visible loaded comment text',maxlength:'200',value:this.commentQuery||''}),status=RC.el('p',{role:'status','aria-live':'polite'}),previous=RC.button('Previous match',()=>move(-1)),next=RC.button('Next match',()=>move(1));
    let cursor=-1;
    const paint=()=>{this.commentQuery=input.value.trim();this.refreshCommentSearch();status.textContent=(this.commentMatches?.length||0)+' matching loaded comments. Hidden, collapsed and unloaded replies are excluded.';};
    const move=direction=>{const matches=this.commentMatches||[];if(!matches.length)return;cursor=cursor<0?(direction>0?0:matches.length-1):(cursor+direction+matches.length)%matches.length;matches[cursor].node.scrollIntoView({block:'center',behavior:'instant'});status.textContent=(cursor+1)+' / '+matches.length+' loaded matches';};
    input.addEventListener('input',()=>{cursor=-1;paint();});panel.append(input,status,previous,next,RC.button('Clear search',()=>{input.value='';cursor=-1;paint();}));this.readingPopover('Search loaded comments',panel);paint();input.focus();
    const cleanup=this.overlay.cleanup;this.overlay.cleanup=()=>{cleanup();this.commentQuery='';this.refreshCommentSearch();};
  },
  refreshCommentSearch(){
    const query=this.commentQuery?.toLocaleLowerCase();this.commentMatches=[];
    for(const {item}of this.items.values()){
      let matched=false;
      if(query&&item.kind==='comment'&&!item.gated&&!item.node.closest('[data-rc-collapsed],[data-rc-treatment="hide"],[data-rc-treatment="blur"]')){
        const body=RC.Adapter.own(item.node,'[slot="comment"]')[0];
        if(body){const range=document.createRange();range.selectNodeContents(body);matched=!!range.getClientRects().length&&body.textContent.toLocaleLowerCase().includes(query);}
      }
      this.attr(item.node,'data-rc-search-match',matched?'1':null);if(matched)this.commentMatches.push(item);
    }
  }
});
