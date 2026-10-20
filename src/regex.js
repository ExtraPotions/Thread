// Each batch has its own disposable worker and wall-clock deadline. No arbitrary regex runs in the UI thread.
RC.Regex=class {
  constructor(){this.pending=new Set();}
  evaluate(pattern,texts,timeout=90){
    if(pattern.length>256||texts.length>250)return Promise.resolve({error:'Regex batch exceeds limits.'});
    return new Promise(resolve=>{
      let worker,url,timer,done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);this.pending.delete(cancel);resolve(value);};
      const cancel=()=>finish({error:'Regex cancelled.'});this.pending.add(cancel);
      try{
        url=URL.createObjectURL(new Blob(['onmessage=e=>{try{const r=new RegExp(e.data.pattern,"iu");postMessage({matches:e.data.texts.map(t=>r.test(t))});}catch{postMessage({error:"Invalid regex. Edit or remove this rule."});}}'],{type:'text/javascript'}));
        worker=new Worker(url);timer=setTimeout(()=>finish({error:'Regex exceeded its time limit. Simplify or remove this rule.'}),timeout);
        worker.onmessage=e=>finish(e.data);worker.onerror=()=>finish({error:'Regex worker unavailable (browser policy). Literal rules still work.'});
        worker.postMessage({pattern,texts:texts.map(t=>String(t).slice(0,4000))});
      }catch{finish({error:'Regex isolation unavailable. Literal rules still work.'});}
    });
  }
  dispose(){[...this.pending].forEach(cancel=>cancel());}
};
