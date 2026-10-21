RC.el=(tag,attrs={},text='')=>{const n=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k==='value')n.value=v;else n.setAttribute(k,v);}if(text)n.textContent=text;return n;};
RC.button=(label,fn)=>{const n=RC.el('button',{type:'button'},label);n.addEventListener('click',fn);return n;};
RC.select=(label,value,options,fn)=>{const n=RC.el('select',{'aria-label':label});const names={native:'Reddit default',best:'Best',hot:'Hot',new:'New',top:'Top',rising:'Rising',hour:'Past hour',day:'Past day',week:'Past week',month:'Past month',year:'Past year',all:label==='Top time range'?'All time':'All',show:'Always',upvoted:'When upvoted',collapse:'Collapsed',off:'Off',always:'Always',standard:'Standard',compact:'Compact',mini:'Mini',confidence:'Best',controversial:'Controversial',old:'Old',qa:'Q&A',suggest:'Suggest modern Reddit',redirect:'Open modern Reddit',profile:'Profile name',nickname:'Local nickname',both:'Both',post:'Posts',comment:'Comments',text:'Text',title:'Title',domain:'Domain',community:'Community',author:'Author',flair:'Flair',hide:'Hide',dim:'Dim',blur:'Blur'};for(const choice of options){const [v,t]=Array.isArray(choice)?choice:[choice,names[choice]||choice];n.append(RC.el('option',{value:v},t));}n.value=value;n.addEventListener('change',()=>fn(n.value));return n;};
RC.switch=(label,value,fn,help)=>{const row=RC.el('div',{class:'setting-row'}),copy=RC.el('span',{},label),button=RC.el('button',{type:'button',class:'toggleSwitch','role':'switch','aria-checked':String(value),'aria-label':label});button.addEventListener('click',()=>{const v=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(v));fn(v);});ExtraPotionsCore.setMenuHelp(copy,help);row.append(copy,button);return row;};
RC.HELP={
  "defaultView": "Default layout for newly opened feeds. The page view control changes only the current feed.",
  "listThumbnail": "Keep a small media preview in List view.",
  "defaultSort": "Use this native sort when opening a feed. Native leaves Reddit in control.",
  "topRange": "Time window used with the Top feed sort.",
  "rememberSort": "Remember your last native sort separately for each community.",
  "sortButtons": "Show shortcuts only for native sort destinations available on this page.",
  "autoPages": "Load the next visible native batch while you read. No background API requests.",
  "loadBudget": "Maximum automatic batches per route, shared by all loading attempts.",
  "flair": "Show flair already supplied by Reddit. Missing flair is not fetched.",
  "awards": "Choose when existing Reddit awards remain visible.",
  "saveVisibility": "Choose when the native post Save action is shown. Saving still requires your action.",
  "trackRead": "Count a comment as read after it is at least 60% visible for 1.2 seconds in the foreground. Requires a recognized native account.",
  "density": "Spacing of posts and comments. Menu Size changes the companion menu instead.",
  "parentContext": "Preview a loaded parent comment without leaving your place.",
  "keyboard": "Enable the shortcuts below. Editors and native dialogs keep their normal keys.",
  "navButtons": "Show previous and next comment controls on discussion pages. The scope chooses jump targets, not visible content.",
  "inlineMedia": "Open available first-party images in the companion viewer. Native video stays native.",
  "backgroundClose": "Close the image viewer when clicking outside the image.",
  "backgroundNav": "Use the left and right sides of the image background to change images instead of closing.",
  "commentSort": "Use a native comment sort when opening a discussion.",
  "rememberCommentSort": "Remember the last native comment sort.",
  "autoReplies": "Expand visible native reply batches within the loading limit.",
  "shareContext": "Move Share into the comment context actions.",
  "dimNegative": "Dim comments with a negative score without hiding their content.",
  "collapsePinned": "Collapse pinned comments; each remains available to reveal.",
  "collapseAutoMod": "Collapse AutoModerator comments; each remains available to reveal.",
  "commentSave": "Expose the native Save action on comments. No automatic saves.",
  "gemTheme": "Use Pear Crystal facet colors for Thread menus and notices only. Off restores the normal menu theme.",
  "theme": "Follow native site/system colors or use high contrast. This setting affects Thread only; it does not apply a page theme.",
  "wide": "Allow wider content while preserving native sidebars.",
  "feedWidth": "Maximum feed width in pixels.",
  "commentWidth": "Maximum discussion width in pixels.",
  "offset": "Horizontal content offset in pixels; narrow windows remain contained.",
  "left": "Show the left navigation rail. Temporary collapse is available in Feed → Sidebars.",
  "right": "Show the right sidebar. Temporary collapse is available in Feed → Sidebars.",
  "uiFont": "Text size for companion actions in page content; menu text stays readable.",
  "simplifyProfile": "Hide optional profile decorations while preserving security, logout and account actions.",
  "redirect": "Choose whether old Reddit offers or performs navigation to modern Reddit.",
  "historyCapacity": "Maximum hidden items to remember. Zero disables history recording.",
  "retentionDays": "Expire history and visit records after this many days. People records are retained until removed.",
  "nicknameMode": "Choose how locally saved nicknames appear beside authors.",
  "nicknameMax": "Shorten displayed local nicknames beyond this length. Full records remain stored."
};
RC.UI=class {
  constructor(runtime){this.r=runtime;runtime.ui=this;
    const palette={id:'thread',name:'Reddit',bg:'#0e1113',panel:'#181c1f',line:'#71828c',text:'#edf1f3',muted:'#b4c1c8',accent:'#203c61',accent2:'#90baff'};
    this.product=ExtraPotionsCore.createProduct({id:'thread',name:'Thread',version:RC.VERSION,subtitle:'Your Reddit, refined.',artwork:RC.ARTWORK,theme:palette,getSettings:()=>({...this.r.settings,menuAutoClose:false}),sections:[['feed','Feed'],['read','Read'],['filters','Filters'],['people','People'],['look','Look'],['system','System']].map(([id,label])=>({id,label,render:()=>this.render(id)}))});
    const style=RC.el('style');style.textContent=`.route-body [aria-disabled=true]{opacity:.6;cursor:default}:host .route-body .setting-row[hidden]{display:none!important}.route-body{min-width:0}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}.route-body .rc-menu-status{font-size:11px}.route-body label{font-size:12px}.route-body .rc-transfer-actions{display:flex;gap:5px}.route-body .rc-transfer-actions>button{flex:1}.setting-row{display:flex;align-items:center;justify-content:space-between;gap:8px}:host .route-body .setting-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(62px,48%)!important}:host .route-body .setting-row:has(>button[role=switch]){grid-template-columns:minmax(0,1fr) 34px!important}:host .route-body .setting-row>span{min-width:0;overflow-wrap:normal;word-break:normal}:host .route-body .setting-row>:is(input,select){width:100%!important;max-width:100%!important;min-width:0!important}.setting-row>select,.setting-row>input{max-width:48%}.route-body label{display:grid;gap:4px;margin:8px 0}.route-body textarea,.route-body input{width:100%;color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:6px;font:inherit;line-height:1.5}.route-body p{font-size:12px;line-height:1.5;overflow-wrap:anywhere}.route-body button{color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:5px 8px;min-height:30px;cursor:pointer}.rc-menu-actions{display:flex;gap:5px;flex-wrap:wrap;margin-block:8px}.rc-menu-status{padding:6px 8px;font-size:12px;color:var(--theme-text);border-bottom:1px solid var(--theme-line)}.rc-menu-status:empty{display:none}.rc-rule{padding:6px 0;border-bottom:1px solid var(--theme-line)}.rc-menu-error{color:#ffaaa6}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.route-body details{margin-block:8px}.route-body summary{cursor:pointer}.header-actions .rc-donate{width:28px;min-width:28px;height:28px;padding:4px}.rc-donate svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}`;this.product.shadow.append(style);
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
  render(id){const root=RC.el('div');const add=(...n)=>root.append(...n);const t=(...a)=>this.toggle(...a),s=(...a)=>this.select(...a),num=(...a)=>this.number(...a);
    if(id==='feed')add(t('enabled','Enable companion'),s('defaultView','Default content view',[['native','Native'],['cards','Cards'],['compact','Compact Cards'],['grid','Grid'],['list','List']]),RC.button('Use default view now',()=>{this.r.viewOverride=null;this.r.schedule();this.status('Default view applied to this route.');}),this.when(t('listThumbnail','List thumbnails'),()=>this.r.settings.defaultView==='list'),s('defaultSort','Default feed sort',['native','best','hot','new','top','rising']),this.when(s('topRange','Top time range',['hour','day','week','month','year','all']),()=>this.r.settings.defaultSort==='top'),t('rememberSort','Remember community sort'),t('sortButtons','Feed sort shortcuts'),t('autoPages','Load a visible next page'),this.when(num('loadBudget','Automatic loading limit',1,5),()=>this.r.settings.autoPages||this.r.settings.autoReplies),t('flair','Show existing post flair'),s('awards','Awards',['show','upvoted','collapse','off']),this.detail('Community content',t('highlights','Hide community highlights'),t('recommendations','Hide recommendations')),this.detail('Post presentation',t('hover','Post hover surface'),t('author','Show author'),t('selectText','Selectable text'),t('expandText','Expand long text'),s('saveVisibility','Native save visibility',['native','always','upvoted','off'])));
    if(id==='feed'){
      const controls=['left','right'].map(side=>RC.button((this.r.tempSidebars.has(side)?'Restore ':'Collapse ')+side+' temporarily',e=>{this.r.toggleSidebar(side);e.currentTarget.textContent=(this.r.tempSidebars.has(side)?'Restore ':'Collapse ')+side+' temporarily';}));
      add(this.detail('Sidebars',t('left','Show left sidebar'),t('right','Show right sidebar'),this.actions(...controls)));
      const pins=RC.el('div');
      for(const pin of this.r.settings.shortcuts)pins.append(this.actions(RC.el('a',{href:pin.path},pin.label),RC.button('Unpin '+pin.label,()=>this.r.update({shortcuts:this.r.settings.shortcuts.filter(p=>p!==pin)}))));
      const path=RC.el('input',{'aria-label':'Community or custom feed path',placeholder:'/r/example/'}),label=RC.el('input',{'aria-label':'Shortcut label',maxlength:'40'});
      pins.append(path,label,RC.button('Pin destination',()=>{const shortcuts=RC.Model.settings({...this.r.settings,shortcuts:[...this.r.settings.shortcuts,{path:path.value,label:label.value}]}).shortcuts;if(shortcuts.length===this.r.settings.shortcuts.length)return this.status('Use /r/community/ or /user/name/m/feed/; maximum 20 destinations.');this.r.update({shortcuts});}));
      const destinations=this.detail('Pinned destinations',pins);ExtraPotionsCore.setMenuHelp(destinations.querySelector('summary'),'Keep up to 20 local links to communities or custom feeds. No subscription or follow action.');add(destinations);
    }
    if(id==='read'){
      add(t('trackRead','Track read comments locally'),s('density','Reading density',['standard','compact','mini']),t('parentContext','Parent context'),t('keyboard','Keyboard shortcuts'),this.detail('Navigation and media',t('navButtons','Comment navigation buttons'),t('scrollTop','Back to top'),t('inlineMedia','On-demand image viewer'),t('backgroundClose','Background closes viewer'),t('backgroundNav','Image-side background navigates')),this.detail('Comment page',s('commentSort','Default comment sort',['native','confidence','top','new','controversial','old','qa']),t('rememberCommentSort','Remember comment sort'),t('commentSortButtons','Comment sort shortcuts'),t('related','Hide related posts'),t('stickyBar','Hide sticky conversation bar')),this.detail('Comment actions',t('autoReplies','Load visible more replies'),t('shareContext','Share context action'),t('dimNegative','Dim negative scores'),t('collapsePinned','Collapse pinned comments'),t('collapseAutoMod','Collapse AutoModerator'),t('commentSave','Show native comment Save')));
      const keys=RC.el('div');for(const [action,key]of Object.entries(this.r.settings.keys)){const input=RC.el('input',{maxlength:'1',value:key,'aria-label':'Key: '+action});input.addEventListener('change',()=>this.r.update({keys:{...this.r.settings.keys,[action]:input.value}}));keys.append(this.row(action,input));}add(this.detail('Remap shortcuts',this.note('One unmodified letter or digit; blank disables. Duplicate keys are disabled. Native vote/save actions require each deliberate key press.'),keys));
    }
    if(id==='filters'){
      add();
      for(const rule of this.r.rules){const line=RC.el('div',{class:'rc-rule'});line.append(RC.el('p',{},rule.field+': '+rule.pattern+' · '+rule.target+' · '+rule.treatment+(rule.regex?' · regex':'')),RC.button('Remove rule '+(Number(rule.id)+1),()=>{this.r.rules=this.r.rules.filter(r=>r!==rule);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();}));if(this.r.regexErrors.has(rule.id))line.append(RC.el('p',{class:'rc-menu-error'},this.r.regexErrors.get(rule.id)));add(line);}
      const form=RC.el('form');const inputs={};const field=(key,title,options)=>{const input=options?RC.select(title,options[0],options,()=>{}):RC.el('input',{'aria-label':title,maxlength:key==='pattern'?'256':'200'});inputs[key]=input;const label=RC.el('label',{},title);label.append(input);form.append(label);};field('field','Match field',['text','title','domain','community','author','flair']);field('pattern','Pattern');field('target','Content',['both','post','comment']);field('scope','Only communities (comma separated)');field('except','Except communities (comma separated)');field('treatment','Treatment',['hide','dim','blur']);let regex=false;form.append(RC.switch('Regex rule',false,v=>regex=v));const submit=RC.el('button',{type:'submit'},'Add local rule');form.append(submit);form.addEventListener('submit',e=>{e.preventDefault();if(!this.r.verified)return this.status('Account identity is unverified; private rules are paused.');if(this.r.rules.length>=100)return this.status('Rule capacity reached (100). Remove a rule first.');const rule=Object.fromEntries(Object.entries(inputs).map(([k,n])=>[k,n.value]));this.r.rules=RC.Model.rules([...this.r.rules,{...rule,regex}]);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();});add(this.detail('Add rule',form),this.detail('Treatment and history',num('historyCapacity','Hidden history capacity',0,500),num('retentionDays','History / visit retention days',1,90),this.note('History stores IDs/reasons, not post bodies. Capacity zero disables recording. People records are retained until explicitly removed.'),RC.button('Show hidden history',()=>{const list=RC.el('div');for(const h of this.r.history.slice().reverse()){const line=RC.el('p',{},h.id+' · '+h.reason+' · '+new Date(h.at).toLocaleDateString());line.append(RC.button('Reveal if loaded',()=>{this.r.revealed.add(h.id);this.r.schedule();this.r.closeOverlay();}));list.append(line);}if(!this.r.history.length)list.append(this.note('No hidden posts recorded.'));this.r.popover('Recent hidden posts',list);}),RC.button('Clear hidden history',()=>{this.r.history=[];this.r.store.set('history',[]);this.status('Hidden history cleared; tags retained.');})));
    }
    if(id==='people'){add(s('nicknameMode','Local nickname display',['profile','nickname','both']),num('nicknameMax','Nickname maximum characters',4,40));for(const [user,p]of Object.entries(this.r.people)){add(this.actions(RC.button(user+(p.tag?' · '+p.tag:''),()=>this.r.editPerson({author:user})),RC.button('Remove '+user,()=>{this.r.store.setPerson(user,{});this.r.people=this.r.store.people();this.r.schedule();this.refresh();})));}if(!Object.keys(this.r.people).length)add(this.note(this.r.verified?'No saved people. Use Tag / note beside an author to add one.':'Personal records are paused until the native Reddit account is recognized.'));
    }
    if(id==='look')add(t('gemTheme','Use gem menu theme'),this.when(s('theme','Menu theme',[['native','Native site / system'],['contrast','High contrast']]),()=>!this.r.settings.gemTheme),ExtraPotionsCore.createMenuSizeControls(),t('updateNotifications','Update notifications'),this.row('Check for updates now',RC.button('Check now',()=>this.checkUpdates(true))),this.detail('Page layout',t('wide','Wide content'),num('feedWidth','Feed width (px)',320,1600),num('commentWidth','Comment width (px)',320,1600),num('offset','Content offset (px)',-400,400)),this.detail('Text and profile',num('contentFont','Content text (px)',12,24),num('uiFont','Context controls (px)',12,18),t('simplifyProfile','Simplify profile decorations'),s('redirect','Old Reddit to modern',['off','suggest','redirect'])));
    if(id==='look'&&location.hostname==='old.reddit.com'&&this.r.settings.redirect==='suggest'){
      const modern=new URL(location.href);modern.hostname='www.reddit.com';add(RC.el('a',{href:modern.href},'Open this page on modern Reddit'));
    }
    if(id==='system')add(this.system());
    return root;
  }
  export(){if(!this.r.verified)return this.status('Account identity must be verified before export.');const value={schema:1,settings:this.r.settings,rules:this.r.rules,people:this.r.people};const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=RC.el('a',{href:url,download:'reddit-companion-local.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
  importForm(){const root=RC.el('div'),input=RC.el('textarea',{'aria-label':'Companion export JSON',maxlength:'500000',placeholder:'Paste a companion export'});root.append(input,RC.button('Validate import',()=>{try{if(!this.r.verified)throw Error('Account identity must be verified before import.');if(input.value.length>500000)throw Error('Import exceeds 500 KB.');const value=RC.Model.validateImport(JSON.parse(input.value));const panel=RC.el('div');panel.append(this.note('Replace settings, rules and people for the current account? This cannot be undone.'),RC.button('Confirm import',()=>{for(const [k,v]of Object.entries(value))this.r.store.set(k,v);this.r.clearRoute();this.r.refreshSettings();this.r.schedule();this.refresh();this.status('Local data imported.');}),RC.button('Cancel',()=>this.r.closeOverlay()));this.r.popover('Confirm local import',panel);}catch(error){this.status('Import rejected: '+error.message);}}));return root;}
  destroy(){this.destroyed=true;this.healthControl?.dispose();this.notice?.destroy();this.product.destroy();}
};
