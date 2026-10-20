'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const core=read('vendor/exp-core/exp-core.js');
const manifest=JSON.parse(read('vendor/exp-core/manifest.json'));
if(hash(core)!==manifest.bundleSha256)throw Error('Core bundle hash mismatch');
const files=['model.js','regex.js','adapter.js','runtime.js','ui.js','main.js'];
const css=read('src/style.css');
const script=read('src/metadata.txt').trimEnd()+'\n\n(()=>{\n"use strict";\n'+core+'\nconst RC={VERSION:'+JSON.stringify(version)+',GEM:'+JSON.stringify(read('assets/thread-gem.svg'))+',CSS:'+JSON.stringify(css)+'};\n'+files.map(n=>read('src/'+n)).join('\n')+'\n})();\n';
new (require('node:vm').Script)(script);
const target=path.join(root,'thread.user.js');
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==script)throw Error('Stale local userscript');}
else fs.writeFileSync(target,script);
console.log('THREAD local '+Buffer.byteLength(script)+' bytes SHA256 '+hash(script));
