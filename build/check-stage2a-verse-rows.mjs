import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import jsdom from 'jsdom';
const {JSDOM,requestInterceptor}=jsdom;
const root=path.resolve(process.argv[2]);
const native=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete.json'),'utf8'));
const chapter=native.books.find(b=>b.id==='GEN').chapters.find(c=>c.n==='1');
let failures=0;
const wait=async fn=>{for(let i=0;i<700;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}throw Error('render timeout');};
async function check(name,fn){try{await fn();console.log('PASS '+name);}catch(e){failures++;console.log('FAIL '+name+': '+e.message.slice(0,180).split('\n')[0]);}}
async function test(narrow){
  const dom=await JSDOM.fromFile(path.join(root,'index.html'),{runScripts:'dangerously',resources:{interceptors:[requestInterceptor(req=>{if(!req.url.startsWith('file:'))throw Error('nonlocal resource');})]},pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:narrow,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};}});
  const w=dom.window,d=w.document;
  const change=(id,value)=>{const e=d.querySelector(id);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
  const label=narrow?'mobile':'desktop';
  try{
    await wait(()=>w.MARANATHA_TRANSLATIONS?.web && d.querySelector('#results').textContent.includes('In the beginning'));
    const off=d.querySelector('#results').innerHTML;
    const box=d.querySelector('#lxx-alignment-pilot');assert(box);
    box.checked=true;box.dispatchEvent(new w.Event('change',{bubbles:true}));
    await wait(()=>d.querySelectorAll('#results .aligned-cell .lxx-text').length);
    await check(label+'-all-31-native-verses-once-with-exact-text',()=>{
      const texts=[...d.querySelectorAll('#results .aligned-cell .lxx-text')].map(e=>e.textContent);
      assert.deepEqual(texts,chapter.segments.filter(s=>s.kind==='verse').map(s=>s.t));
      assert.equal(texts.length,31);
    });
    await check(label+'-6-and-7-have-small-boundary-notice',()=>{
      const containers=narrow?[...d.querySelectorAll('#results .mobile-verse')]:[...d.querySelectorAll('#results table tbody tr')];
      for(const verse of [6,7]){
        const container=containers.find(e=>e.querySelector(narrow?'.mobile-reference':'.reference')?.textContent===`1:${verse}`);assert(container);
        const cell=container.querySelector('.aligned-cell');assert(cell);assert.equal(cell.querySelectorAll('.aligned-source').length,1);
        assert.equal(cell.querySelector('.lxx-text').textContent,chapter.segments.find(s=>s.l===String(verse)).t);
        assert.match(cell.querySelector('.aligned-note').textContent,/Greek 6.*English\/Hebrew.*7/);
        assert(cell.querySelector('.aligned-note').textContent.length<100);
      }
    });
    await check(label+'-single-verse-7-does-not-repeat-6',async()=>{
      d.querySelector('#reference').value='Genesis 1:7';d.querySelector('#reference-go').click();
      await wait(()=>d.querySelector('#results .aligned-cell'));
      assert.deepEqual([...d.querySelectorAll('#results .aligned-cell .lxx-text')].map(e=>e.textContent),[chapter.segments.find(s=>s.l==='7').t]);
      assert.match(d.querySelector('#results .aligned-note').textContent,/Greek 6.*English\/Hebrew.*7/);
    });
    await check(label+'-unresolved-chapter-stays-unresolved',()=>{
      change('#book','GEN');change('#chapter','2');
      assert.match(d.querySelector('#results').textContent,/alignment not available/i);
      assert.equal(d.querySelectorAll('#results .aligned-cell .lxx-text').length,0);
    });
    await check(label+'-off-state-unchanged',()=>{
      change('#book','GEN');change('#chapter','1');box.checked=false;box.dispatchEvent(new w.Event('change',{bubbles:true}));
      assert.equal(d.querySelector('#results').innerHTML,off);
    });
    await check(label+'-group-evidence-remains-proposed',()=>{
      const mapping=w.MARANATHA_LXX_ALIGNMENT;assert.equal(mapping.status,'proposal');assert.equal(mapping.review.humanApproval,null);
      const group=mapping.groups.find(g=>g.id==='GEN1-6-7');assert.equal(group.sources.length,2);assert.equal(group.targets.length,2);assert.equal(group.status,'proposal');
    });
  }finally{dom.window.close();}
}
await test(false);await test(true);
console.log('verse-row-display: '+failures+' failures');process.exitCode=failures?1:0;
