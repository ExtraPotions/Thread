'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const notes=JSON.parse(process.env.RELEASE_NOTES_JSON||'null');if(!Array.isArray(notes)||notes.length<2||notes.length>4||notes.some(n=>typeof n!=='string'||!n.trim()))throw Error('RELEASE_NOTES_JSON needs 2–4 release notes');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),old=pkg.version,parts=old.split('.').map(Number);parts[2]++;pkg.version=process.env.RELEASE_VERSION||parts.join('.');if(!/^\d+\.\d+\.\d+$/.test(pkg.version)||pkg.version===old)throw Error('Invalid new version');
fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(pkg,null,2)+'\n');const metadata=path.join(root,'src/metadata.txt');fs.writeFileSync(metadata,fs.readFileSync(metadata,'utf8').replace(/^(\/\/ @version\s+)\S+/m,'$1'+pkg.version));
const changelog=path.join(root,'CHANGELOG.md');fs.writeFileSync(changelog,'## '+pkg.version+' — '+new Date().toISOString().slice(0,10)+'\n\n'+notes.map(n=>'- '+n.trim()).join('\n')+'\n\n'+fs.readFileSync(changelog,'utf8'));console.log('Prepared Thread '+pkg.version+' locally; build and verify before publication');
