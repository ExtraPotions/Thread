RC.el=(tag,attrs={},text='')=>{const n=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k==='value')n.value=v;else n.setAttribute(k,v);}if(text)n.textContent=text;return n;};
RC.button=(label,fn)=>{const n=RC.el('button',{type:'button'},label);n.addEventListener('click',fn);return n;};
RC.select=(label,value,options,fn)=>{const n=RC.el('select',{'aria-label':label});const names={native:'Reddit default',best:'Best',hot:'Hot',new:'New',top:'Top',rising:'Rising',hour:'Past hour',day:'Past day',week:'Past week',month:'Past month',year:'Past year',all:label==='Top time range'?'All time':'All',show:'Always',upvoted:'When upvoted',collapse:'Collapsed',off:'Off',always:'Always',standard:'Standard',compact:'Compact',mini:'Mini',confidence:'Best',controversial:'Controversial',old:'Old',qa:'Q&A',suggest:'Suggest modern Reddit',redirect:'Open modern Reddit',profile:'Profile name',nickname:'Local nickname',both:'Both',post:'Posts',comment:'Comments',text:'Text',title:'Title',domain:'Domain',community:'Community',author:'Author',flair:'Flair',hide:'Hide',dim:'Dim',blur:'Blur'};for(const choice of options){const [v,t]=Array.isArray(choice)?choice:[choice,names[choice]||choice];n.append(RC.el('option',{value:v},t));}n.value=value;n.addEventListener('change',()=>fn(n.value));return n;};
// Authored stroke icons shared by the feed controls; one 20px grid and stroke weight.
// Maps a Core site palette onto Reddit's neutral colour variables.
RC.siteColorCss=(p,scope)=>{
  const mix=(a,b,pct)=>`color-mix(in srgb,${a} ${pct}%,${b})`,hover=mix(p.raised,p.text,88),active=mix(p.raised,p.text,78);
  const vars={bg:['neutral-background','neutral-background-pinned','neutral-background-strong'],panel:['neutral-background-canvas','neutral-background-container','neutral-background-highlighted','neutral-background-gilded','neutral-background-medium','neutral-background-hover','neutral-background-weak-hover'],inset:['neutral-background-weak'],raised:['neutral-background-container-hover','neutral-background-container-strong','neutral-background-strong-hover','secondary-background','button-secondary-background','button-secondary-background-focus','input-secondary'],
    [hover]:['neutral-background-container-strong-hover','neutral-background-selected','neutral-background-highlighted-strong','neutral-background-gilded-hover','secondary-background-hover','button-secondary-background-hover','button-plain-background-hover','input-secondary-hover'],
    [active]:['secondary-background-selected','button-secondary-background-activated','button-plain-background-activated'],
    text:['neutral-content-strong','secondary','secondary-plain','secondary-hover','secondary-plain-hover','button-plain-text','button-plain-text-hover','button-secondary-text','input-secondary-text','input-text','input-bordered-text'],
    muted:['neutral-content'],[mix(p.muted,p.bg,78)]:['neutral-content-weak','secondary-weak','secondary-plain-weak','button-plain-text-weak'],
    [mix(p.line,'transparent',45)]:['neutral-border'],[mix(p.line,'transparent',25)]:['neutral-border-weak'],[mix(p.line,p.bg,40)]:['neutral-border-divider'],line:['neutral-border-medium'],[p.text]:['neutral-border-strong'],accent:['primary-plain','interactive-focused']};
  const body=Object.entries(vars).map(([token,names])=>names.map(name=>`--color-${name}:${p[token]||token}!important`).join(';')).join(';');
  return `${scope},${scope} :is(.theme-rpl,.theme-beta,.theme-dark,.theme-light){${body}}${scope}{color-scheme:${p.mode};background-color:${p.bg}!important}${scope} ::selection{background:${mix(p.accent,'transparent',35)}}`;
};
RC.icon=name=>{const ns='http://www.w3.org/2000/svg',icon=document.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');icon.setAttribute('class','rc-icon rc-icon-'+name);for(const [tag,attrs] of {sliders:[['path',{d:'M3 5h8M15 5h2M3 10h2M9 10h8M3 15h10'}],['circle',{cx:13,cy:5,r:2}],['circle',{cx:7,cy:10,r:2}],['circle',{cx:15,cy:15,r:2}]],chevron:[['path',{d:'M6 8l4 4 4-4'}]]}[name]){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);icon.append(n);}return icon;};
RC.switch=(label,value,fn,help)=>{const row=RC.el('div',{class:'setting-row'}),copy=RC.el('span',{},label),button=RC.el('button',{type:'button',class:'toggleSwitch','role':'switch','aria-checked':String(value),'aria-label':label});button.addEventListener('click',()=>{const v=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(v));fn(v);});ExtraPotionsCore.setMenuHelp(copy,help);row.append(copy,button);return row;};
RC.HELP={
  "enabled": "Turn Thread’s page tools on or off. Your settings and local records are kept.",
  "rememberSort": "Remember your last native feed and comment sort separately for each community.",
  "readPosts": "Mark keeps local read markers when you open a post or choose Mark read. Mark and hide also hides read posts from feeds; Undo recovers them. Requires a recognized account.",
  "highlights": "Hide community highlights, recommendations and related posts that Reddit suggests.",
  "hideDecorations": "Hide flair, awards, author lines and the native post Save button for a cleaner feed.",
  "unblurSpoilers": "Reveal spoiler-blurred posts automatically as they load.",
  "unblurMature": "Reveal blurred mature media automatically. Works only when Reddit already shows this content to your signed-in account.",
  "communityFilters": "Hide, dim or blur posts from a community in feeds. Add one from Filter r/… in a post’s actions menu.",
  "trackRead": "Count a comment as read after it is at least 60% visible for 1.2 seconds in the foreground. Requires a recognized account.",
  "navButtons": "Show previous and next comment controls on discussions and enable the j, k and o keys.",
  "collapseAutoMod": "Collapse AutoModerator and pinned comments; each stays available to reveal.",
  "nicknameMode": "Choose how locally saved nicknames appear beside authors.",
  "readingStyle": "Font, size and spacing for post and comment text. Code and native controls keep their own fonts.",
  "feedWidth": "Maximum feed and discussion width. 800 keeps Reddit’s width; with the right sidebar collapsed the feed fills the free space.",
  "siteColors": "Recolor Reddit with a palette. Follows Reddit’s light or dark mode; brand, vote and warning colors stay as they are. Choose Reddit to keep its own colors.",
  "menuTheme": "Colors for Thread’s menus and notices only. Reddit follows the site; Gem uses the Pear Crystal facets.",
  "updateNotifications": "Show a notice when a new Thread release is available.",
  "redirect": "Open old.reddit.com pages on modern Reddit."
};
RC.UI=class {
  constructor(runtime){this.r=runtime;runtime.ui=this;
    const palette={id:'thread',name:'Reddit',bg:'#0e1113',panel:'#181c1f',line:'#71828c',text:'#edf1f3',muted:'#b4c1c8',accent:'#203c61',accent2:'#90baff'};
    this.product=ExtraPotionsCore.createProduct({id:'thread',name:'Thread',version:RC.VERSION,subtitle:'Your Reddit, refined.',artwork:RC.ARTWORK,theme:palette,getSettings:()=>({...this.r.settings,menuAutoClose:false}),sections:[['feed','Feed'],['read','Read'],['filters','Filters'],['people','People'],['look','Look'],['system','System']].map(([id,label])=>({id,label,render:()=>this.render(id)}))});
    const style=RC.el('style');style.textContent=`.route-body [aria-disabled=true]{opacity:.6;cursor:default}:host .route-body .setting-row[hidden]{display:none!important}.route-body{min-width:0}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}.route-body .rc-menu-status{font-size:11px}.route-body label{font-size:12px}.route-body .rc-transfer-actions{display:flex;gap:5px}.route-body .rc-transfer-actions>button{flex:1}.setting-row{display:flex;align-items:center;justify-content:space-between;gap:8px}:host .route-body .setting-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(62px,48%)!important}:host .route-body .setting-row:has(>button[role=switch]){grid-template-columns:minmax(0,1fr) 34px!important}:host .route-body .setting-row:has(>select){grid-template-columns:minmax(0,1fr) minmax(62px,max-content)!important}:host .route-body .setting-row>select{white-space:nowrap;text-overflow:ellipsis}:host .route-body .setting-row>span{min-width:0;overflow-wrap:normal;word-break:normal}:host .route-body .setting-row>:is(input,select){width:100%!important;max-width:100%!important;min-width:0!important}.setting-row>select,.setting-row>input{max-width:48%}.route-body label{display:grid;gap:4px;margin:8px 0}.route-body textarea,.route-body input{width:100%;color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:6px;font:inherit;line-height:1.5}.route-body p{font-size:12px;line-height:1.5;overflow-wrap:anywhere}.route-body button{color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:5px 8px;min-height:30px;cursor:pointer}.rc-menu-actions{display:flex;gap:5px;flex-wrap:wrap;margin-block:8px}.rc-menu-status{padding:6px 8px;font-size:12px;color:var(--theme-text);border-bottom:1px solid var(--theme-line)}.rc-menu-status:empty{display:none}.rc-rule{padding:6px 0;border-bottom:1px solid var(--theme-line)}.rc-menu-error{color:#ffaaa6}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.route-body details{margin-block:8px}.route-body summary{cursor:pointer}.header-actions .rc-donate{width:28px;min-width:28px;height:28px;padding:4px}.rc-donate svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}`;this.product.shadow.append(style);
    this.statusNode=RC.el('div',{class:'rc-menu-status',role:'status','aria-live':'polite'});this.product.panel.querySelector('header').after(this.statusNode);
    this.updates=ExtraPotionsCore.createReleaseUpdateChecker({productId:'thread',repository:'ExtraPotions/Thread',currentVersion:RC.VERSION,enabled:()=>this.r.settings.updateNotifications});
    this.notice=ExtraPotionsCore.createProductNotice({host:this.product.host,shadow:this.product.shadow,panel:this.product.panel,versionButton:this.product.versionButton,onVersion:()=>{if(!this.notice.element.hidden&&this.notice.element.dataset.noticeKind==='current')this.notice.hide();else this.showReleaseNotes();}});
    ExtraPotionsCore.setMenuStatus('thread',()=>this.health());
    this.theme();
    const previous=ExtraPotionsCore.consumeVersionChange('thread',RC.VERSION,'exp:v3:thread:last-version');
    if(previous&&this.r.settings.updateNotifications)this.notice.show({kind:'complete',kicker:'Update Complete',title:'Thread Updated',version:RC.VERSION,text:`Updated from v${previous} to v${RC.VERSION}.`,details:RC.NOTES,releaseUrl:this.releaseUrl(),showAction:false});
    this.checkUpdates();
  }
  releaseUrl(version=RC.VERSION){return 'https://github.com/ExtraPotions/Thread/releases/tag/v'+version;}
  showReleaseNotes(){this.notice.show({kind:'current',kicker:'Current Version',title:'Thread Changelog',version:RC.VERSION,text:`What's new in v${RC.VERSION}.`,details:RC.NOTES,releaseUrl:this.releaseUrl(),showAction:false});}
  async checkUpdates(force=false){
    const result=await this.updates.check(force);if(this.destroyed)return result;
    ExtraPotionsCore.setLauncherUpdate('thread',result.available);
    this.product.launcher.setAttribute('aria-label',result.available?`Open Thread · Update v${result.latest} Available`:'Open Thread');
    if(['failed','checking','disabled'].includes(result.state)){if(force)this.status(result.state==='failed'?'Update check failed. Try again later.':'An update check is already running.');return result;}
    if(result.state!=='disabled'&&result.available&&!result.quiet&&(force||ExtraPotionsCore.claimNotice('thread','available:'+result.latest)))this.notice.show({kind:'available',kicker:'Update Available',title:'Thread Update Available',version:result.latest,text:`v${result.latest} is ready to install.`,details:result.details,releaseUrl:this.releaseUrl(result.latest),actionUrl:result.installUrl,showAction:true});
    else if(force){if(result.state==='failed')this.status('Update check failed. Try again later.');else if(result.state==='checking')this.status('An update check is already running.');else {this.status('Thread is up to date.');this.showReleaseNotes();}}
    return result;
  }
  status(text){this.statusNode.textContent=text;}
  refresh(){const focused=this.product.shadow.activeElement;const label=focused?.getAttribute('aria-label');this.product.renderActive();if(label)[...this.product.shadow.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===label&&n.getClientRects().length)?.focus();this.product.refresh();this.theme();}
  theme(){
    const apply=palette=>ExtraPotionsCore.applyTheme(this.product.host,palette.id,[palette]);
    if(this.r.settings?.gemTheme)return apply({id:'thread-gem',name:'Pear Crystal',bg:'#1e1410',panel:'#2b1d16',line:'#b17a58',text:'#fff0e1',muted:'#e5bfa6',accent:'#c6350d',accent2:'#ffb073',focus:'#ffd0a3',link:'#ffc18a',skinMode:'flat'});
    if(this.r.settings?.theme==='contrast')return apply({id:'contrast',name:'High contrast',bg:'#000000',panel:'#111111',line:'#c8c8c8',text:'#ffffff',muted:'#dddddd',accent:'#252525',accent2:'#ffffff',focus:'#ffffff',skinMode:'flat'});
    // Read the native surface colors without applying a page theme or competing with SHIFT.
    const css=getComputedStyle(document.documentElement),dark=matchMedia('(prefers-color-scheme:dark)').matches;
    const color=(name,fallback)=>{const raw=css.getPropertyValue(name).trim();if(/^#[0-9a-f]{6}$/i.test(raw))return raw;const m=raw.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);return m?'#'+m.slice(1,4).map(v=>Number(v).toString(16).padStart(2,'0')).join(''):fallback;};
    apply({id:'reddit-native',name:'Native',bg:color('--color-neutral-background',dark?'#0e1113':'#ffffff'),panel:color('--color-neutral-background-weak',dark?'#181c1f':'#f4f6f7'),line:'#71828c',text:color('--color-neutral-content-strong',dark?'#edf1f3':'#182126'),muted:color('--color-neutral-content',dark?'#b4c1c8':'#4e606a'),accent:dark?'#5c93d7':'#174c99',accent2:dark?'#90baff':'#174c99'});
  }
  health(){
    const r=this.r;
    if(r.store.error)return {state:'attention',reason:r.store.error};
    if(!r.settings.enabled||ExtraPotionsCore.suiteSitePaused())return {state:'paused',reason:'Page tools are paused. Your settings are retained.'};
    if(!r.verified)return {state:'waiting',reason:'Reddit account not recognized. Personal records are paused; page tools remain available.'};
    return {state:'working',reason:'Reading tools are active. Personal records stay local.',checkedAt:Date.now()};
  }
  system(){
    this.healthControl?.dispose();
    this.healthControl=ExtraPotionsCore.createProductTimeline('thread',()=>this.health(),text=>this.status(text),{layout:'grouped',showActivity:false});
    const diagnostics=ExtraPotionsCore.createDiagnosticsControls(()=>this.r.diagnostics(),text=>this.status(text));
    const preferences=this.detail('Settings transfer',this.note('Exports contain your private tags and notes. Import replaces this account’s settings, rules and people.'),RC.button('Export current account',()=>this.export()),this.importForm());
    const system=ExtraPotionsCore.createProductSystem({id:'thread',version:RC.VERSION,timeline:this.healthControl.element,diagnostics,preferences,layout:'grouped',notify:text=>this.status(text),onReset:()=>{this.r.store.reset();this.r.clearRoute();this.r.refreshSettings();this.r.schedule();this.refresh();}});
    const reset=system.querySelector('[data-exp-destructive]');ExtraPotionsCore.setMenuHelp(reset,'Permanently clears this account’s Thread settings and local records. Other products are unaffected. Tap twice within 4 seconds to confirm.');
    system.insertBefore(this.detail('API access',this.note('Optional API enrichment is unavailable. Reading tools use native page content; own registration and approved access are required for enrichment.')),system.querySelector('[data-exp-system-item="reset"]'));
    return system;
  }
  openRoute(id){if(['support','reset'].includes(id)){this.openRoute('system');const target=this.product.panel.querySelector('[data-exp-system-item="'+id+'"]');if(target){target.open=true;target.scrollIntoView({block:'nearest'});}return;}if(!this.product.isOpen)this.product.open();const button=this.product.shadow.querySelector('[data-section="'+id+'"]');if(button?.getAttribute('aria-expanded')!=='true')button?.click();}
  when(node,test){const sync=()=>{node.hidden=!test();};sync();node.dataset.rcConditional='1';return node;}
  row(label,control,help){const row=RC.el('div',{class:'setting-row'}),copy=RC.el('span',{},label);ExtraPotionsCore.setMenuHelp(copy,help);row.append(copy,control);return row;}
  toggle(key,label){return RC.switch(label,this.r.settings[key],v=>this.r.update({[key]:v}),RC.HELP[key]);}
  select(key,label,choices){return this.row(label,RC.select(label,this.r.settings[key],choices,v=>this.r.update({[key]:v})),RC.HELP[key]);}
  number(key,label,min,max){const n=RC.el('input',{type:'number',min,max,value:this.r.settings[key],'aria-label':label});n.addEventListener('change',()=>this.r.update({[key]:Number(n.value)}));return this.row(label,n,RC.HELP[key]);}
  detail(title,...children){const d=RC.el('details');d.append(RC.el('summary',{},title),...children);return d;}
  note(text){return RC.el('p',{class:'note'},text);}
  actions(...buttons){const n=RC.el('div',{class:'rc-menu-actions'});n.append(...buttons);return n;}
  render(id){const root=RC.el('div');const add=(...n)=>root.append(...n);const t=(...a)=>this.toggle(...a),s=(...a)=>this.select(...a),num=(...a)=>this.number(...a),set=this.r.settings;
    const choose=(label,value,choices,fn,help)=>this.row(label,RC.select(label,value,choices,fn),help);
    const removeRule=rule=>{this.r.rules=this.r.rules.filter(r=>r!==rule);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();};
    if(id==='feed'){
      add(t('enabled','Enable Thread'),t('rememberSort','Remember sort per community'),choose('Read posts',set.trackPosts?(set.hideReadPosts?'hide':'mark'):'off',[['off','Off'],['mark','Mark'],['hide','Mark and hide']],v=>this.r.update({trackPosts:v!=='off',hideReadPosts:v==='hide'}),RC.HELP.readPosts),t('highlights','Hide Reddit suggestions'),t('hideDecorations','Hide post decorations'),t('unblurSpoilers','Unblur spoilers'),t('unblurMature','Unblur mature media'));
      const list=RC.el('div'),communities=this.r.rules.filter(r=>r.exact&&r.field==='community');
      for(const rule of communities){list.append(this.row('r/'+rule.pattern,RC.select('Treatment for r/'+rule.pattern,rule.treatment,[['hide','Hide'],['dim','Dim'],['blur','Blur']],v=>this.r.setCommunityFilter(rule.pattern,v))),this.actions(RC.button('Remove r/'+rule.pattern,()=>this.r.setCommunityFilter(rule.pattern,null))));}
      if(!communities.length)list.append(this.note(this.r.verified?'No filtered communities. Use Filter r/… in a post’s actions menu to add one.':'Personal records are paused until the native Reddit account is recognized.'));
      const filtered=this.detail('Community filters',list);ExtraPotionsCore.setMenuHelp(filtered.querySelector('summary'),RC.HELP.communityFilters);add(filtered);
    }
    if(id==='read'){
      add(this.detail('Local collections',this.note('Keep up to 500 local post/comment bookmarks with collections and private notes. Separate from Reddit Saved.'),RC.button('Open local collections',()=>this.r.collections())));
      add(t('trackRead','Track read comments'),t('navButtons','Comment navigation'),t('collapseAutoMod','Collapse AutoModerator and pinned'));
    }
    if(id==='filters'){
      for(const rule of this.r.rules.filter(r=>!(r.exact&&r.field==='community'))){const line=RC.el('div',{class:'rc-rule'});line.append(RC.el('p',{},rule.field+': '+rule.pattern+' · '+rule.target+' · '+rule.treatment+(rule.regex?' · regex':'')),RC.button('Remove rule '+(Number(rule.id)+1),()=>removeRule(rule)));if(this.r.regexErrors.has(rule.id))line.append(RC.el('p',{class:'rc-menu-error'},this.r.regexErrors.get(rule.id)));add(line);}
      const form=RC.el('form');const inputs={};const field=(key,title,options)=>{const input=options?RC.select(title,options[0],options,()=>{}):RC.el('input',{'aria-label':title,maxlength:key==='pattern'?'256':'200'});inputs[key]=input;const label=RC.el('label',{},title);label.append(input);form.append(label);};field('field','Match field',['text','title','domain','community','author','flair']);field('pattern','Pattern');field('target','Content',['both','post','comment']);field('scope','Only communities (comma separated)');field('except','Except communities (comma separated)');field('treatment','Treatment',['hide','dim','blur']);let regex=false;form.append(RC.switch('Regex rule',false,v=>regex=v));const submit=RC.el('button',{type:'submit'},'Add local rule');form.append(submit);form.addEventListener('submit',e=>{e.preventDefault();if(!this.r.verified)return this.status('Account identity is unverified; private rules are paused.');if(this.r.rules.length>=100)return this.status('Rule capacity reached (100). Remove a rule first.');const rule=Object.fromEntries(Object.entries(inputs).map(([k,n])=>[k,n.value]));this.r.rules=RC.Model.rules([...this.r.rules,{...rule,regex}]);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();});
      add(this.detail('Add rule',form),this.detail('Hidden history',this.note('History stores IDs and reasons, not post bodies. Up to 100 items are kept for 30 days.'),this.actions(RC.button('Show hidden history',()=>{const list=RC.el('div');for(const h of this.r.history.slice().reverse()){const line=RC.el('p',{},h.id+' · '+h.reason+' · '+new Date(h.at).toLocaleDateString());line.append(RC.button('Reveal if loaded',()=>{this.r.revealed.add(h.id);this.r.schedule();this.r.closeOverlay();}));list.append(line);}if(!this.r.history.length)list.append(this.note('No hidden posts recorded.'));this.r.popover('Recent hidden posts',list);}),RC.button('Clear hidden history',()=>{this.r.history=[];this.r.store.set('history',[]);this.status('Hidden history cleared; tags retained.');}))));
    }
    if(id==='people'){add(s('nicknameMode','Nickname display',['profile','nickname','both']));for(const [user,p]of Object.entries(this.r.people)){add(this.actions(RC.button(user+(p.tag?' · '+p.tag:''),()=>this.r.editPerson({author:user})),RC.button('Remove '+user,()=>{this.r.store.setPerson(user,{});this.r.people=this.r.store.people();this.r.schedule();this.refresh();})));}if(!Object.keys(this.r.people).length)add(this.note(this.r.verified?'No saved people. Use Tag / note beside an author to add one.':'Personal records are paused until the native Reddit account is recognized.'));
    }
    if(id==='look'){
      const preset=Object.entries(RC.PRESETS).find(([,p])=>Object.entries(p).every(([k,v])=>set[k]===v))?.[0]||'custom';
      add(choose('Reading style',preset,[...(preset==='custom'?[['custom','Custom']]:[]),['native','Reddit'],['comfortable','Comfortable'],['dense','Dense'],['book','Book']],v=>this.r.readingPreset(v),RC.HELP.readingStyle),num('feedWidth','Content width (px)',320,1600),ExtraPotionsCore.createSiteColorControl({value:set.siteColors,offLabel:'Reddit',onChange:v=>this.r.update({siteColors:v}),help:RC.HELP.siteColors}),choose('Menu theme',set.gemTheme?'gem':set.theme,[['native','Reddit'],['contrast','High contrast'],['gem','Gem']],v=>this.r.update({gemTheme:v==='gem',theme:v==='contrast'?'contrast':'native'}),RC.HELP.menuTheme),ExtraPotionsCore.createMenuSizeControls(),t('updateNotifications','Update notifications'),this.row('Check for updates now',RC.button('Check now',()=>this.checkUpdates(true))));
    }
    if(id==='system')add(RC.switch('Open old Reddit links on modern Reddit',set.redirect==='redirect',v=>this.r.update({redirect:v?'redirect':'off'}),RC.HELP.redirect),this.system());
    return root;
  }
  export(){if(!this.r.verified)return this.status('Account identity must be verified before export.');const value={schema:1,settings:this.r.settings,rules:this.r.rules,people:this.r.people,library:this.r.library};const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=RC.el('a',{href:url,download:'reddit-companion-local.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
  importForm(){const root=RC.el('div'),input=RC.el('textarea',{'aria-label':'Companion export JSON',maxlength:'500000',placeholder:'Paste a companion export'});root.append(input,RC.button('Validate import',()=>{try{if(!this.r.verified)throw Error('Account identity must be verified before import.');if(input.value.length>500000)throw Error('Import exceeds 500 KB.');const value=RC.Model.validateImport(JSON.parse(input.value));const panel=RC.el('div');panel.append(this.note('Replace settings, rules and people for the current account? This cannot be undone.'),RC.button('Confirm import',()=>{for(const [k,v]of Object.entries(value))this.r.store.set(k,v);this.r.clearRoute();this.r.refreshSettings();this.r.schedule();this.refresh();this.status('Local data imported.');}),RC.button('Cancel',()=>this.r.closeOverlay()));this.r.popover('Confirm local import',panel);}catch(error){this.status('Import rejected: '+error.message);}}));return root;}
  destroy(){this.destroyed=true;this.healthControl?.dispose();this.notice?.destroy();this.product.destroy();}
};
