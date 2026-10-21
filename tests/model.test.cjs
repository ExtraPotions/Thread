'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const RC=new Function('const RC={};\n'+fs.readFileSync(path.join(__dirname,'../src/model.js'),'utf8')+'\nreturn RC;')();
test('settings validate three views, ranges, native defaults and duplicate shortcut removal',()=>{
  const s=RC.Model.settings({defaultView:'grid',historyCapacity:-1,contentFont:1,loadBudget:100,autoPages:'yes',keys:{next:'j',previous:'j',upvote:'u'}});
  assert.equal(RC.Model.settings({defaultView:'list'}).defaultView,'compact');assert.equal(s.defaultView,'grid');assert.equal(s.historyCapacity,0);assert.equal(s.contentFont,12);assert.equal(s.loadBudget,5);assert.equal(s.autoPages,false);assert.equal(s.keys.next,'j');assert.equal(s.keys.previous,'');assert.equal(s.keys.upvote,'u');
  for(const view of ['cards','compact','grid'])assert.equal(RC.Model.settings({defaultView:view}).defaultView,view);
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

test('local bookmarks canonicalize and deduplicate safe discussion URLs with bounded notes',()=>{
 const good={url:'https://old.reddit.com/r/example/comments/one/title/?context=3#reply',title:'<img onerror=1>',note:'x'.repeat(2500),collection:' all '};
 const rows=RC.Model.library([good,{...good,url:'https://www.reddit.com/r/example/comments/one/title/',title:'Updated'},...['javascript:alert(1)','https://example.com/r/a/comments/b/','https://user:password@www.reddit.com/r/a/comments/b/','https://www.reddit.com:444/r/a/comments/b/'].map(url=>({url}))]);
 assert.equal(rows.length,1);assert.equal(rows[0].url,'https://www.reddit.com/r/example/comments/one/title/');assert.equal(rows[0].title,'Updated');assert.equal(rows[0].note.length,2000);assert.equal(rows[0].collection,'all');
 assert.equal(RC.Model.library(Array.from({length:700},(_,i)=>({url:'https://www.reddit.com/comments/'+i+'/'}))).length,500);
 assert.equal(RC.Model.library([{url:'https://www.reddit.com/r/a/comments/one/old_slug/'},{url:'https://www.reddit.com/r/a/comments/one/new_slug/'},{url:'https://www.reddit.com/r/a/comments/one/new_slug/commentid/'}]).length,2,'deduplicate posts by native ID while retaining distinct comment bookmarks');
 assert.equal(RC.Model.postReads([{id:'a',at:Date.now()},{id:'a',at:Date.now()},{id:'expired',at:1}],30).length,1);
 const settings=RC.Model.settings({lineHeight:1,paragraphGap:200});assert.equal(settings.lineHeight,100);assert.equal(settings.paragraphGap,24);assert.equal(RC.Model.defaults.trackPosts,false);assert.equal(RC.Model.defaults.restoreFeed,false);
 assert.throws(()=>RC.Model.validateImport({schema:1,settings:{},rules:[],people:{},library:{}}));
});
test('gem theme is off by default and legacy settings migrate without enabling it',()=>{assert.equal(RC.Model.settings({}).gemTheme,false);assert.equal(RC.Model.settings({density:'mini'}).gemTheme,false);assert.equal(RC.Model.settings({gemTheme:'true'}).gemTheme,false);assert.equal(RC.Model.settings({gemTheme:true}).gemTheme,true);assert.equal(RC.Model.settings({gemTheme:false}).gemTheme,false);});
test('pinned destinations cannot import executable or external URLs',()=>{const shortcuts=RC.Model.settings({shortcuts:[{path:'javascript:alert(1)'},{path:'https://example.com/'},{path:'/r/example/',label:'Example'},{path:'/user/person/m/reading/',label:'Reading'}]}).shortcuts;assert.equal(shortcuts.length,2);assert.equal(shortcuts[0].label,'Example');});
