import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import jsdom from 'jsdom';
const {JSDOM,requestInterceptor}=jsdom;
const root=path.resolve(process.argv[2]);
let failures=0;
async function check(name,fn){try{await fn();console.log('PASS '+name);}catch(e){failures++;console.log('FAIL '+name+': '+e.message.slice(0,190).split('\n')[0]);}}
const wait=async fn=>{for(let i=0;i<700;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('render timeout');};
async function open(delay=0){
  const trace={scripts:0,scrolled:null};
  const dom=await JSDOM.fromFile(path.join(root,'index.html'),{runScripts:'dangerously',resources:{interceptors:[requestInterceptor(req=>{if(!req.url.startsWith('file:'))throw Error('nonlocal resource');})]},pretendToBeVisual:true,beforeParse(w){
    w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};
    w.HTMLElement.prototype.scrollIntoView=function(){trace.scrolled=this;};
    const append=w.Node.prototype.appendChild;
    w.Node.prototype.appendChild=function(node){if(node.tagName==='SCRIPT'&&node.src.includes('/data/lxx-swete.js')){trace.scripts++;if(delay){setTimeout(()=>append.call(this,node),delay);return node;}}return append.call(this,node);};
  }});
  const w=dom.window,d=w.document;
  const change=(id,value)=>{const el=d.querySelector(id);el.value=value;assert.equal(el.value,value);el.dispatchEvent(new w.Event('change',{bubbles:true}));};
  const reference=(input,enter=false)=>{d.querySelector('#reference').value=input;if(enter)d.querySelector('#reference').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));else d.querySelector('#reference-go').click();};
  await wait(()=>w.MARANATHA_TRANSLATIONS?.web&&d.querySelector('#results h2'));
  return {dom,w,d,trace,change,reference};
}
await check('approved-disclosure-data-unchanged',()=>assert.equal(fs.readFileSync(path.join(root,'data/lxx-swete.json'),'utf8'),fs.readFileSync(process.argv[3],'utf8')));
const app=await open();
const {d,change,reference}=app;
const canonPlaceholder=d.querySelector('#reference').placeholder;
try{
  const canonBook=d.querySelector('#book').value,canonChapter=d.querySelector('#chapter').value;
  change('#view-mode','lxx');await wait(()=>d.querySelector('#results .lxx-verses'));
  await check('genesis-reference-click-stays-native',()=>{reference('Gen 1');assert.equal(d.querySelector('#view-mode').value,'lxx');assert.equal(d.querySelector('#lxx-book').value,'GEN');assert.equal(d.querySelector('#lxx-chapter').value,'1');assert.match(d.querySelector('#results .lxx-heading').textContent,/Genesis 1/);assert.equal(d.querySelector('#book').value,canonBook);assert.equal(d.querySelector('#chapter').value,canonChapter);});
  await check('enter-case-and-alias-resolution',()=>{reference('eXoDuS 2',true);assert.equal(d.querySelector('#view-mode').value,'lxx');assert.equal(d.querySelector('#lxx-book').value,'EXO');assert.equal(d.querySelector('#lxx-chapter').value,'2');reference('Ps. 88');assert.equal(d.querySelector('#lxx-book').value,'PSA');});
  await check('native-label-84-not-canon-verse-count',()=>{reference('PSA 88:84');assert.equal(d.querySelector('#view-mode').value,'lxx');assert.equal(d.querySelector('#lxx-chapter').value,'88');const row=[...d.querySelectorAll('#results .lxx-segment')].find(r=>r.querySelector('.lxx-verse-num')?.textContent==='84');assert(row);assert.match(row.querySelector('.lxx-flag').getAttribute('aria-label'),/84.*48|48.*84/);assert(app.trace.scrolled&&row.contains(app.trace.scrolled)||app.trace.scrolled===row,'reference did not scroll to the source segment');});
  await check('native-components-prologue-and-first-available-chapter',()=>{
    for(const name of ['LJE 1','Letter of Jeremiah 1']){reference(name);assert.equal(d.querySelector('#view-mode').value,'lxx');assert.equal(d.querySelector('#lxx-book').value,'LJE');assert.equal(d.querySelectorAll('#results .lxx-verse-num').length,72);assert.match(d.querySelector('#results .lxx-notices').textContent,/navigation/i);}
    reference('Susanna 1');assert.equal(d.querySelector('#lxx-book').value,'SUS');reference('Bel 1');assert.equal(d.querySelector('#lxx-book').value,'BEL');
    reference('Esther prologue');assert.equal(d.querySelector('#lxx-book').value,'EST');assert.equal(d.querySelector('#lxx-chapter').value,'prologue');
    reference('Nehemiah');assert.equal(d.querySelector('#lxx-book').value,'NEH');assert.equal(d.querySelector('#lxx-chapter').value,'11');
  });
  await check('invalid-native-requests-preserve-passage-and-view',()=>{
    reference('Gen 1');
    const snapshot=d.querySelector('#results').innerHTML;
    for(const input of ['PSA 115:6','NEH 1','ECC 1','John 1','Gen 999','Gen 1:999','Gen 1:1-3','Gen 1; Exo 2','Gen 1:1,3','','nonsense']){
      reference(input);assert.equal(d.querySelector('#view-mode').value,'lxx',input);assert.equal(d.querySelector('#lxx-book').value,'GEN',input);assert.equal(d.querySelector('#lxx-chapter').value,'1',input);assert.equal(d.querySelector('#results').innerHTML,snapshot,input);
    }
  });
  await check('canon-and-parallel-reference-behavior-preserved',()=>{
    change('#view-mode','canon');reference('John 1:1');assert.equal(d.querySelector('#view-mode').value,'canon');assert.match(d.querySelector('#results').textContent,/beginning/);
    change('#view-mode','parallel');reference('John 1:1');assert.equal(d.querySelector('#view-mode').value,'canon');assert(d.querySelector('#parallel-view').hidden);assert.match(d.querySelector('#results').textContent,/beginning/);
  });
  await check('search-remains-canon-only',()=>{change('#view-mode','lxx');d.querySelector('#search').value='beginning';d.querySelector('#search-go').click();assert.equal(d.querySelector('#view-mode').value,'canon');assert(d.querySelector('#parallel-view').hidden);});
  await check('reference-hint-follows-programmatic-view-change',()=>assert.equal(d.querySelector('#reference').placeholder,canonPlaceholder));
}finally{app.dom.window.close();}
await check('reference-before-data-load-latest-request-wins',async()=>{
  const pending=await open(400);try{
    pending.change('#view-mode','lxx');assert(!pending.w.MARANATHA_TRANSLATIONS['lxx-swete']);
    pending.reference('Gen 1');pending.reference('Exodus 2');
    await wait(()=>pending.w.MARANATHA_TRANSLATIONS['lxx-swete']);await new Promise(r=>setTimeout(r,100));
    assert.equal(pending.d.querySelector('#view-mode').value,'lxx');assert.equal(pending.d.querySelector('#lxx-book').value,'EXO');assert.equal(pending.d.querySelector('#lxx-chapter').value,'2');assert.equal(pending.trace.scripts,1);
  }finally{pending.dom.window.close();}
});
await check('pending-native-reference-cannot-change-canon',async()=>{
  const pending=await open(400);try{
    pending.change('#book','MAT');pending.change('#chapter','5');const snapshot=pending.d.querySelector('#results').innerHTML;
    pending.change('#view-mode','lxx');pending.reference('Exodus 2');pending.change('#view-mode','canon');
    await wait(()=>pending.w.MARANATHA_TRANSLATIONS['lxx-swete']);await new Promise(r=>setTimeout(r,100));
    assert.equal(pending.d.querySelector('#view-mode').value,'canon');assert.equal(pending.d.querySelector('#book').value,'MAT');assert.equal(pending.d.querySelector('#chapter').value,'5');assert.equal(pending.d.querySelector('#results').innerHTML,snapshot);assert(pending.d.querySelector('#lxx-attribution').hidden);assert(pending.d.querySelector('#parallel-view').hidden);
  }finally{pending.dom.window.close();}
});
console.log('independent-native-reference: '+failures+' failures');process.exitCode=failures?1:0;
