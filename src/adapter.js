// Modern Reddit adapter: native light DOM and accessible open shadow controls only.
// Native header identity and feed wrappers checked against the current desktop DOM.
RC.Adapter=(()=>{
  const selector='shreddit-post,shreddit-comment';
  const owned=n=>!!n?.closest?.('[data-rc-owned],#exp-thread-root');
  function nodes(root=document,query=selector){return [...root.querySelectorAll(query)].filter(n=>!owned(n));}
  function own(node,query){return [...node.querySelectorAll(query)].filter(n=>!owned(n)&&n.closest(selector)===node);}
  function visible(n){const r=n.getBoundingClientRect();return !!n.getClientRects().length&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(n).visibility!=='hidden';}
  function nearby(n){const r=n.getBoundingClientRect();return n.isConnected&&r.bottom> -1800&&r.top<innerHeight+1800;}
  function link(raw){try{const u=new URL(raw,location.href);return u.protocol==='https:'&&['www.reddit.com','sh.reddit.com','old.reddit.com'].includes(u.hostname)?u:null;}catch{return null;}}
  function account(){
    const app=document.querySelector('shreddit-app');
    const values=[app?.getAttribute('user-name'),app?.getAttribute('username')];
    for(const component of document.querySelectorAll('achievements-entrypoint[username],after-login-toast-dispatcher[username]'))if(!owned(component)&&!component.closest(selector))values.push(component.getAttribute('username'));
    for(const anchor of document.querySelectorAll('header a[href], [data-testid="user-menu"] a[href]')){
      if(owned(anchor)||anchor.closest(selector))continue;
      const url=link(anchor.getAttribute('href'));
      const match=url?.pathname.match(/^\/user\/([^/]+)\/?$/);
      if(match)values.push(match[1]);
    }
    const names=[...new Set(values.filter(v=>RC.Model.validUser(v||'')&&!['me','undefined','null'].includes(v.toLowerCase())).map(v=>v.toLowerCase()))];
    if(names.length===1)return names[0];
    if(names.length>1)return null;
    const header=document.querySelector('header')||document;
    if([...header.querySelectorAll('a[href]')].some(a=>!owned(a)&&!a.closest(selector)&&link(a.getAttribute('href'))?.pathname==='/login'))return 'guest';
    return null;
  }
  function item(node){
    const kind=node.localName==='shreddit-comment'?'comment':'post';
    const attr=(...names)=>names.map(n=>node.getAttribute(n)).find(Boolean)||'';
    const author=attr('author')||own(node,'a[href*="/user/"]')[0]?.getAttribute('href')?.split('/user/')[1]?.split('/')[0]||'';
    const href=attr('permalink','content-href')||own(node,'a[href*="/comments/"]')[0]?.getAttribute('href')||'';
    const url=link(href);
    const blocks=own(node,'[slot="comment"],[slot="text-body"],[slot="title"],h1,h2,h3,p');
    // Slot containers already include their paragraphs; reading both repeats the parent preview.
    const copy=blocks.filter(n=>!blocks.some(parent=>parent!==n&&parent.contains(n))).map(n=>n.textContent.replace(/\s+/g,' ').trim()).join('\n\n').slice(0,4000);
    const community=attr('subreddit-prefixed-name','subreddit-name').replace(/^r\//,'')||location.pathname.match(/^\/r\/([^/]+)/)?.[1]||'';
    const outbound=own(node,'a[href]') .map(a=>{try{return new URL(a.href);}catch{return null;}}).find(u=>u&&u.protocol==='https:'&&!u.hostname.endsWith('reddit.com'));
    return {node,kind,id:attr('thingid','thing-id','id')||url?.pathname||'',author:author==='[deleted]'?'[deleted]':author||'[unknown]',community,text:copy,title:attr('post-title')||own(node,'[slot="title"],h1,h2,h3')[0]?.textContent||'',domain:outbound?.hostname||'',flair:own(node,'[slot="post-flair"],[data-testid="post-flair"]')[0]?.textContent||'',url:url?.href||'',parent:attr('parentid','parent-id'),depth:Math.min(99,Math.max(0,Number(attr('depth'))||0)),score:Number(attr('score'))||0,op:node.hasAttribute('is-op'),mod:attr('distinguished')==='moderator',pinned:node.hasAttribute('stickied')||node.hasAttribute('is-stickied'),gated:node.hasAttribute('spoiler')||node.hasAttribute('nsfw')||node.hasAttribute('is-nsfw')};
  }
  function controls(root){const result=[];const walk=(r,depth)=>{if(depth>3)return;for(const n of r.querySelectorAll('button,a,[role="button"]'))if(!owned(n))result.push(n);for(const n of [...r.querySelectorAll('*')].slice(0,800))if(n.shadowRoot)walk(n.shadowRoot,depth+1);};walk(root,0);return result;}
  function action(item,name){
    const labels={save:['save','save comment','save post','unsave','unsave comment','unsave post'],upvote:['upvote'],downvote:['downvote'],collapse:['collapse comment','expand comment']};
    const names=labels[name]||[];
    return controls(item.node).find(n=>{const label=(n.getAttribute('aria-label')||n.textContent||'').trim().toLowerCase();let owner=n.closest(selector),root=n.getRootNode();for(let depth=0;!owner&&root?.host&&depth<4;depth++){owner=root.host.closest(selector);root=root.host.getRootNode();}return names.includes(label)&&!n.disabled&&owner===item.node;});
  }
  function loadControls(kind){
    // Never traverse hidden/native menus, guess API endpoints, or recursively crawl.
    const candidates=[...document.querySelectorAll(kind==='post'?'button[slot="load-more"],button[data-testid="load-more-posts"],faceplate-partial[slot="load-more"] button':'shreddit-comment-tree button,shreddit-comment button')].filter(n=>!owned(n)&&visible(n)&&!n.disabled);
    return candidates.filter(n=>kind==='post'?/^(load more|view more posts|load more posts)$/i.test((n.getAttribute('aria-label')||n.textContent).trim()):/^(view|load|show) (\d+ )?more (replies|comments)$/i.test((n.getAttribute('aria-label')||n.textContent).trim()));
  }
  function sortLinks(comment=false){return [...document.querySelectorAll('a[href]')].filter(n=>!owned(n)).map(a=>({a,u:link(a.getAttribute('href'))})).filter(({u})=>u&&(comment?u.searchParams.has('sort')&&u.pathname.includes('/comments/'):!u.pathname.includes('/comments/')&&/\/(best|hot|new|top|rising)\/?$/.test(u.pathname)));}
  function sortUrl(sort,comment,range){const match=sortLinks(comment).find(({u})=>comment?u.searchParams.get('sort')===sort:u.pathname.replace(/\/$/,'').endsWith('/'+sort));if(!match)return null;const u=new URL(match.u);if(sort==='top'&&!comment)u.searchParams.set('t',range);return u;}
  function media(item){
    if(item.gated||item.node.querySelector('shreddit-blurred-container,[data-testid="nsfw-gate"],[data-testid="spoiler-gate"]'))return [];
    const images=new Map();
    for(const n of own(item.node,'img')){
      if(n.closest('button,a[href*="/user/"],[slot="author"],[slot="commentAvatar"],[data-testid*="avatar"]')||n.hasAttribute('hidden'))continue;
      try{const u=new URL(n.currentSrc||n.src);if(u.protocol!=='https:'||!['i.redd.it','preview.redd.it'].includes(u.hostname))continue;
        // Reddit renders several preview sizes plus an original for the same asset.
        const key=u.pathname.split('/').pop().replace(/^.*-v\d+-/,'').replace(/\.[^.]+$/,'');
        if(key&&(!images.has(key)||u.hostname==='i.redd.it'))images.set(key,{src:u.href,alt:n.alt||'Post image'});
      }catch{}
    }
    return [...images.values()].slice(0,20);
  }
  return {selector,nodes,own,owned,visible,nearby,link,account,item,action,loadControls,sortLinks,sortUrl,media};
})();
