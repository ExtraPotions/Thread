'use strict';
const test=require('node:test'),{spawnSync}=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
test('THREAD browser integration and coexistence on approved shell156',()=>{const result=spawnSync(process.execPath,[path.join(__dirname,'browser.cjs')],{encoding:'utf8',timeout:240000,maxBuffer:3e6});console.log(result.stdout);if(result.stderr)console.log(result.stderr);assert.equal(result.status,0);});
