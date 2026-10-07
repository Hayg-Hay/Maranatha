import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import jsdom from 'jsdom';
const {JSDOM,requestInterceptor}=jsdom;
const root=path.resolve(process.argv[2]);
const before=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const after=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete.json'),'utf8'));
let failures=0;
async function check(name,fn){try{await fn();console.log('PASS '+name);}catch(e){failures++;console.log('FAIL '+name+': '+e.message.slice(0,200).split('\n')[0]);}}
const book=(d,id)=>d.books.find(b=>b.id===id);
const segment=(d,id,ch,l)=>book(d,id).chapters.find(c=>c.n===ch).segments.find(s=>s.kind==='verse'&&s.l===l);
const counts=d=>{let chapters=0,verses=0,unnumbered=0,flagged=0;for(const b of d.books)for(const c of b.chapters){chapters++;for(const s of c.segments){if(s.kind==='verse'){verses++;if(s.flags?.length)flagged++;}else unnumbered++;}}return[d.books.length,chapters,verses,unnumbered,flagged];};
await check('metadata-only-full-dataset-equality',()=>{
  const normalized=structuredClone(after);
  for(const [id,ch,l,code] of [['PSA','16','4','transcription-marker'],['PSA','88','84','source-label-anomaly']]){
    const old=segment(before,id,ch,l),current=segment(after,id,ch,l),copy=segment(normalized,id,ch,l);
    assert.equal(current.flags?.length,(old.flags?.length||0)+1);
    const extra=current.flags.filter(f=>!(old.flags||[]).some(x=>JSON.stringify(x)===JSON.stringify(f)));
    assert.equal(extra.length,1);assert.equal(extra[0].code,code);
    if(l==='84'){assert.match(extra[0].note,/84/);assert.match(extra[0].note,/48/);}else assert.match(extra[0].note,/\(4\)/);
    if(old.flags)copy.flags=structuredClone(old.flags);else delete copy.flags;
  }
  const previous=book(before,'LJE').notices,current=book(after,'LJE').notices;
  assert.equal(current.length,previous.length+1);for(const notice of previous)assert(current.includes(notice));
  const extra=current.find(n=>!previous.includes(n));assert.match(extra,/navigation/i);assert.match(extra,/chapter\s*1/i);assert.match(extra,/no chapter|without chapter|does not.*chapter/i);
  book(normalized,'LJE').notices=previous;
  for(const entry of before.changes)assert(after.changes.includes(entry));
  assert(after.changes.length>before.changes.length);normalized.changes=before.changes;
  assert.deepEqual(normalized,before,'unapproved dataset change outside the three disclosures');
});
await check('counts-and-source-labels-preserved',()=>{
  assert.deepEqual(counts(before),[48,1055,27048,100,686]);assert.deepEqual(counts(after),[48,1055,27048,100,688]);
  const labels=ch=>book(after,'PSA').chapters.find(c=>c.n===ch).segments.filter(s=>s.kind==='verse').map(s=>s.l);
  assert.deepEqual(labels('115'),['1','2','3','4','5','7','8','9','10']);assert(labels('88').includes('84'));
  assert.equal(book(after,'BEL').chapters[0].segments.filter(s=>s.kind==='verse').at(-1).l,'36');
  const lje=book(after,'LJE').chapters[0].segments;assert.equal(lje.filter(s=>s.kind==='verse').length,72);assert.equal(lje.filter(s=>s.kind==='unnumbered').length,2);
});
await check('shipped-js-exactly-matches-json',()=>{const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/lxx-swete.js'),'utf8'),ctx);assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.MARANATHA_TRANSLATIONS['lxx-swete'])),after);});
await check('versioned-loader-and-cache-versions',()=>{
  assert.match(fs.readFileSync(path.join(root,'app.js'),'utf8'),/script\.src\s*=\s*['"]data\/lxx-swete\.js\?v=disclosures-20261007['"]/);
  const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');assert.match(sw,/CACHE_VERSION\s*=\s*'v50'/);assert.match(sw,/DATA_CACHE_VERSION\s*=\s*'v3'/);
});
await check('old-cache-bypassed-new-data-cached-and-offline-reused',async()=>{
  const origin='https://example.test',prefix=origin+'/Maranatha/';
  const normalize=request=>new URL(typeof request==='string'?request:request.url,prefix).href;
  const url=prefix+'data/lxx-swete.js?v=disclosures-20261007',old=prefix+'data/lxx-swete.js';
  const stale={ok:true,type:'basic',body:'stale',clone(){return this;}},fresh={ok:true,type:'basic',body:'updated',clone(){return this;}};
  const stores=new Map([['maranatha-data-v3',new Map([[old,stale],[prefix+'data/web.js',stale]])]]);
  const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);return{async match(req,opts={}){const key=normalize(req);if(!opts.ignoreSearch)return entries.get(key);return [...entries].find(([u])=>u.split('?')[0]===key.split('?')[0])?.[1];},async put(req,response){entries.set(normalize(req),response);}};},async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);}};
  const listeners={},self={location:{origin},clients:{claim:async()=>{}},skipWaiting(){},addEventListener(type,fn){listeners[type]=fn;}};
  let requests=0,offline=false;
  const ctx={self,caches,URL,console,fetch:async()=>{requests++;if(offline)throw Error('offline');return fresh;}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'service-worker.js'),'utf8'),ctx);
  let response;listeners.fetch({request:{url,method:'GET',mode:'no-cors'},respondWith(p){response=p;}});
  assert.equal((await response).body,'updated');assert.equal(requests,1);
  offline=true;listeners.fetch({request:{url,method:'GET',mode:'no-cors'},respondWith(p){response=p;}});
  assert.equal((await response).body,'updated');assert.equal(requests,1);
  assert.equal(stores.get('maranatha-data-v3').get(old).body,'stale');assert(stores.get('maranatha-data-v3').has(prefix+'data/web.js'));
});
await check('disclosures-visible-in-both-reading-views',async()=>{
  const dom=await JSDOM.fromFile(path.join(root,'index.html'),{runScripts:'dangerously',resources:{interceptors:[requestInterceptor(req=>{if(!req.url.startsWith('file:'))throw Error('nonlocal request');})]},pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};}});
  const w=dom.window,d=w.document;
  const wait=async fn=>{for(let i=0;i<500;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('render timeout');};
  const change=(id,value)=>{const el=d.querySelector(id);el.value=value;assert.equal(el.value,value);el.dispatchEvent(new w.Event('change',{bubbles:true}));};
  try{
    await wait(()=>d.querySelector('#results h2'));change('#view-mode','lxx');await wait(()=>d.querySelector('#results .lxx-verses'));
    for(const mode of ['lxx','parallel']){
      change('#view-mode',mode);const p=mode==='lxx'?'#lxx':'#parallel-lxx';const content=mode==='lxx'?d.querySelector('#results'):d.querySelector('#parallel-lxx-content');
      for(const [chapter,label,words] of [['16','4',/\(4\)/],['88','84',/84.*48|48.*84/]]){
        change(p+'-book','PSA');change(p+'-chapter',chapter);
        const row=[...content.querySelectorAll('.lxx-segment')].find(r=>r.querySelector('.lxx-verse-num')?.textContent===label);
        assert(row);const flag=row.querySelector('.lxx-flag');assert(flag);assert.match(flag.getAttribute('aria-label'),words);
      }
      change(p+'-book','LJE');assert.match(content.querySelector('.lxx-notices').textContent,/navigation/i);assert.equal(content.querySelectorAll('.lxx-verse-num').length,72);
    }
  }finally{dom.window.close();}
});
console.log('independent-disclosures: '+failures+' failures');process.exitCode=failures?1:0;
