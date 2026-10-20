// Copyright expDARE. Local build; no publication or installed-script modification.
if(window.top===window.self&&['www.reddit.com','sh.reddit.com','old.reddit.com'].includes(location.hostname)&&!document.getElementById('exp-thread-root')){
  let active;
  const boot=()=>{
  if(active&&!active.destroyed)return;
  ExtraPotionsCore.registerDiagnosticsProduct('thread',RC.VERSION);
  const store=new RC.Store();
  const runtime=new RC.Runtime(store);runtime.accountCheck();
  RC.ARTWORK=URL.createObjectURL(new Blob([RC.GEM],{type:'image/svg+xml'}));
  const ui=new RC.UI(runtime);
  active=runtime;
  runtime.schedule();
  };
  addEventListener('pagehide',()=>active?.destroy());
  addEventListener('pageshow',event=>{if(event.persisted)boot();});
  boot();
}
