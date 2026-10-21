'use strict';
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
test('Thread distribution identifies its own repository and sole author with matching version',()=>{
 const pkg=JSON.parse(read('package.json')),metadata=read('src/metadata.txt'),script=read('thread.user.js');
 assert.equal(pkg.author,'expDARE');assert.match(metadata,/^\/\/ @name\s+Thread for Reddit$/m);assert.match(metadata,/^\/\/ @author\s+expDARE$/m);assert.equal(metadata.match(/^\/\/ @version\s+(\S+)/m)[1],pkg.version);assert(script.startsWith(metadata.trimEnd()));
 for(const field of ['homepageURL','supportURL','downloadURL','updateURL'])assert.match(metadata,new RegExp('^// @'+field+'\\s+https://github.com/ExtraPotions/Thread(?:/|$)','m'));
 assert.doesNotMatch(metadata,/local prototype/i);assert.match(script,new RegExp('VERSION:"'+pkg.version.replaceAll('.','\\.')+'"'));
});
test('Thread publication is a manual upload of committed assets without build or test gates',()=>{
 const release=read('.github/workflows/release.yml');assert.match(release,/workflow_dispatch:/);assert.doesNotMatch(release,/^\s+(push|pull_request|schedule):/m);assert.match(release,/thread\.user\.js assets\/thread-gem\.svg SHA256SUMS/);assert.match(release,/--target "\$GITHUB_SHA"/);assert.doesNotMatch(release,/npm (?:run|test)|node scripts/);
});
