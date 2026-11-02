'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('public Thread captures contain only product Light Dark and actual changelog PNGs',()=>{
 const root=path.resolve(__dirname,'..'),config=require('../docs/screenshots.config.cjs'),readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
 assert.deepEqual([...readme.matchAll(/docs\/screenshots\/([\w.-]+\.(?:png|gif))/g)].map(match=>match[1]).sort(),['changelog.png','menu-dark.png','menu-light.png']);
 assert.equal(config.productOnly,true);assert.deepEqual(config.shots.map(shot=>[shot.file,shot.mode,shot.collapsed,!!shot.notice]),[['menu-light.png','light',true,false],['menu-dark.png','dark',true,false],['changelog.png','dark',true,true]]);
 assert.equal(require('../package.json').scripts.screenshots,'node ../exp-core/scripts/capture-screenshots.cjs THREAD');
});
