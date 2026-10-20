'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const RC=new Function('const RC={};\n'+fs.readFileSync(path.join(__dirname,'../src/model.js'),'utf8')+'\nreturn RC;')();
test('settings validate four views, ranges, native defaults and duplicate shortcut removal',()=>{
  const s=RC.Model.settings({defaultView:'grid',historyCapacity:-1,contentFont:1,loadBudget:100,autoPages:'yes',keys:{next:'j',previous:'j',upvote:'u'}});
  assert.equal(s.defaultView,'grid');assert.equal(s.historyCapacity,0);assert.equal(s.contentFont,12);assert.equal(s.loadBudget,5);assert.equal(s.autoPages,false);assert.equal(s.keys.next,'j');assert.equal(s.keys.previous,'');assert.equal(s.keys.upvote,'u');
  for(const view of ['cards','compact','grid','list'])assert.equal(RC.Model.settings({defaultView:view}).defaultView,view);
});
test('rules preserve scope/exceptions, distinguish post/comment and never treat literals as regex',()=>{
  const [r]=RC.Model.rules([{field:'title',pattern:'a+b',scope:'one',except:'two',target:'post',treatment:'blur'}]);
  assert(RC.Model.applies(r,{community:'one',kind:'post'}));assert(!RC.Model.applies(r,{community:'two',kind:'post'}));assert(!RC.Model.applies(r,{community:'one',kind:'comment'}));assert(RC.Model.literal(r,{title:'A+B'}));assert(!RC.Model.literal(r,{title:'aaab'}));
});
test('bounded history, zero retention capacity and malformed imports',()=>{
  const rows=[{id:'old',at:1},{id:'a',at:Date.now()},{id:'b',at:Date.now()}];assert.deepEqual(RC.Model.prune(rows,1,30).map(r=>r.id),['b']);assert.deepEqual(RC.Model.prune(rows,0,30),[]);
  assert.throws(()=>RC.Model.validateImport({schema:1,settings:[],rules:[],people:{}}));assert.throws(()=>RC.Model.validateImport({schema:1,settings:{},rules:[],people:{'[deleted]':{}}}));
  const value=RC.Model.validateImport({schema:1,settings:{},rules:[],people:{person:{note:'<script>alert(1)</script>',token:'must not persist'}}});assert.equal(value.people.person.note,'<script>alert(1)</script>');assert.equal(value.people.person.token,undefined);
});
test('unknown and deleted accounts do not collapse into valid people',()=>{for(const u of ['[deleted]','[unknown]','',null,'x/y'])assert.equal(RC.Model.validUser(u||''),false);assert.equal(RC.Model.validUser('real-user'),true);});
test('gem theme is off by default and legacy settings migrate without enabling it',()=>{assert.equal(RC.Model.settings({}).gemTheme,false);assert.equal(RC.Model.settings({density:'mini'}).gemTheme,false);assert.equal(RC.Model.settings({gemTheme:'true'}).gemTheme,false);assert.equal(RC.Model.settings({gemTheme:true}).gemTheme,true);assert.equal(RC.Model.settings({gemTheme:false}).gemTheme,false);});
test('pinned destinations cannot import executable or external URLs',()=>{const shortcuts=RC.Model.settings({shortcuts:[{path:'javascript:alert(1)'},{path:'https://example.com/'},{path:'/r/example/',label:'Example'},{path:'/user/person/m/reading/',label:'Reading'}]}).shortcuts;assert.equal(shortcuts.length,2);assert.equal(shortcuts[0].label,'Example');});
