// Independent architecture acceptance, authored by Codex, not the implementer.
// node build/check-stage1b-independent.mjs <fresh-checkout> <pre-change-baseline-json>
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import jsdom from 'jsdom';
const { JSDOM, requestInterceptor } = jsdom;

const root = path.resolve(process.argv[2]);
const before = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const dom = await JSDOM.fromFile(path.join(root,'index.html'), {
  runScripts:'dangerously', resources:{interceptors:[requestInterceptor(request=>{
    if(!request.url.startsWith('file:'))throw new Error(`Nonlocal request: ${request.url}`);
  })]}, pretendToBeVisual:true,
  beforeParse(w) {
    w.matchMedia=q=>({matches:false,addEventListener(){}});
    w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
  }
});
const w=dom.window, d=w.document;
const wait=async(fn)=>{
  for(let i=0;i<600;i++) { if(fn())return; await new Promise(r=>setTimeout(r,25)); }
  throw new Error('Timed out waiting for local data/render');
};
let failed=0;
async function check(name,fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch(e) { failed++; console.log(`FAIL ${name}: ${e.message.slice(0,160).split('\n')[0]}`); }
}
function change(id,value) {
  const e=d.querySelector(id); assert(e,`missing ${id}`);
  if(e.type==='checkbox')e.checked=value; else e.value=value;
  assert.equal(e.type==='checkbox'?e.checked:e.value,value,`unsupported option ${id}=${value}`);
  e.dispatchEvent(new w.Event('change',{bubbles:true}));
}
const left=()=>d.querySelector('#parallel-lxx-content');
const right=()=>d.querySelector('#parallel-translation-content');
const labels=()=>[...left().querySelectorAll('.lxx-verse-num')].map(e=>e.textContent);
try {
  await wait(()=>w.MARANATHA_TRANSLATIONS?.web && d.querySelector('#results h2'));
  await check('startup-lazy-load',()=>{
    assert(!w.MARANATHA_TRANSLATIONS['lxx-swete']);
    assert(!w.MARANATHA_TRANSLATIONS.delitzsch1901);
    assert(d.querySelector('#parallel-view').hidden);
  });
  await check('ten-chapter-canon-byte-regression',async()=>{
    change('#translations input[value="kjv"]',true);
    await wait(()=>w.MARANATHA_TRANSLATIONS.kjv);
    for(const [key,expected] of Object.entries(before)) {
      const [book,chapter]=key.split(' ');
      change('#book',book); change('#chapter',chapter);
      assert.equal(d.querySelector('#results').innerHTML,expected,key);
    }
  });
  const canonBook=d.querySelector('#book').value, canonChapter=d.querySelector('#chapter').value;
  const selected=[...d.querySelectorAll('#translations input:checked')].map(x=>x.value).join(',');
  change('#view-mode','parallel');
  await wait(()=>left()?.querySelector('.lxx-verses') && right()?.textContent.includes('beginning'));
  await check('parallel-banner-and-controls',()=>{
    assert.match(d.querySelector('#parallel-view').textContent,/Independent numbering; passages are not aligned/);
    assert(!d.querySelector('#parallel-view').hidden);
    assert(d.querySelector('#lxx-bar').hidden);
    assert([...d.querySelectorAll('[data-canon-only]')].every(e=>e.hidden));
    const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);
    assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
    for(const id of ['parallel-lxx-book','parallel-lxx-chapter','parallel-translation','parallel-book','parallel-chapter'])
      assert(d.querySelector(`label[for="${id}"]`),`unlabelled ${id}`);
  });
  await check('left-navigation-isolation-and-ps88',()=>{
    const snapshot=right().innerHTML;
    change('#parallel-lxx-book','PSA'); change('#parallel-lxx-chapter','88');
    assert.deepEqual(labels().slice(-9),['45','46','47','84','49','50','51','52','53']);
    assert.equal(right().innerHTML,snapshot);
  });
  await check('right-hebrew-navigation-isolation',async()=>{
    const snapshot=left().innerHTML;
    change('#parallel-translation','he');
    await wait(()=>right().querySelector('.hebrew-verse'));
    change('#parallel-book','GEN'); change('#parallel-chapter','2');
    assert.equal(left().innerHTML,snapshot);
    assert.match(right().querySelector('.hebrew-verse').textContent,/[א-ת]/u);
    assert.equal(d.querySelector('#book').value,canonBook);
    assert.equal(d.querySelector('#chapter').value,canonChapter);
  });
  await check('delitzsch1901-native-numbering-notice',async()=>{
    const snapshot=left().innerHTML;
    change('#parallel-translation','delitzsch1901');
    await wait(()=>w.MARANATHA_TRANSLATIONS.delitzsch1901);
    change('#parallel-book','JHN');change('#parallel-chapter','1');
    assert.equal(left().innerHTML,snapshot);
    assert.match(right().textContent,/numbering|versification|source|52/i);
    assert(!d.querySelector('#parallel-translation-heading').textContent.includes('canon numbering'), 'pane heading mislabels source-numbered Delitzsch as canon numbering');
    assert(right().textContent.includes(w.MARANATHA_TRANSLATIONS.delitzsch1901.books.JHN[0].at(-1)),'last source verse52 absent');
  });
  await check('both-delitzsch-editions-selectable',async()=>{
    change('#parallel-translation','delitzsch');await wait(()=>w.MARANATHA_TRANSLATIONS.delitzsch);
    change('#parallel-book','JHN');change('#parallel-chapter','1');
    assert.match(right().textContent,/[א-ת]/u);
    assert.equal(right().querySelectorAll('.mobile-verse').length,w.MARANATHA_TRANSLATIONS.delitzsch.books.JHN[0].length,'another loaded edition inflated the selected edition verse count');
  });
  await check('lxx-notices-detached-text-and-native-labels',()=>{
    change('#parallel-lxx-book','PSA');change('#parallel-lxx-chapter','115');
    assert.deepEqual(labels(),['1','2','3','4','5','7','8','9','10']);
    change('#parallel-lxx-book','BEL');change('#parallel-lxx-chapter','1');
    assert.equal(labels().at(-1),'36');assert.match(left().textContent,/37-42/);
    change('#parallel-lxx-book','LJE');change('#parallel-lxx-chapter','1');
    assert.equal(labels().length,72);assert(left().querySelector('.lxx-unnumbered'));
    change('#parallel-lxx-book','EST');change('#parallel-lxx-chapter','prologue');
    assert.equal(labels().length,17);
    change('#parallel-lxx-book','NEH');change('#parallel-lxx-chapter','11');
    assert.equal(d.querySelector('#parallel-lxx-chapter').options[0].value,'11');
    assert.match(d.querySelector('#parallel-view').textContent,/Swete/);
    assert(d.querySelector('#lxx-attribution').textContent.includes(w.MARANATHA_TRANSLATIONS['lxx-swete'].license.attribution),'LXX attribution absent');
  });
  await check('translation-selection-preserved-on-return',()=>{
    change('#view-mode','canon');
    assert.equal([...d.querySelectorAll('#translations input:checked')].map(x=>x.value).join(','),selected);
    assert(d.querySelector('#parallel-view').hidden);
    assert(!d.querySelector('#results').hidden);
    assert.equal(d.querySelector('#book').value,canonBook);
    assert.equal(d.querySelector('#chapter').value,canonChapter);
  });
  await check('reference-exits-parallel',async()=>{
    change('#view-mode','parallel');d.querySelector('#reference').value='John 1:1';d.querySelector('#reference-go').click();
    await wait(()=>d.querySelector('#view-mode').value==='canon');
    assert(d.querySelector('#parallel-view').hidden);
    assert.match(d.querySelector('#results').textContent,/beginning/);
  });
  await check('search-exits-parallel',async()=>{
    change('#view-mode','parallel');d.querySelector('#search').value='beginning';d.querySelector('#search-go').click();
    await wait(()=>d.querySelector('#view-mode').value==='canon');
    assert(d.querySelector('#parallel-view').hidden);
  });
  await check('invalid-reference-keeps-view-controls-consistent',()=>{
    change('#view-mode','parallel');
    d.querySelector('#reference').value='not a reference';d.querySelector('#reference-go').click();
    assert.equal(d.querySelector('#parallel-view').hidden,d.querySelector('#view-mode').value!=='parallel');
  });
  await check('parallel-book-localization-preserves-selection',()=>{
    change('#view-mode','parallel');
    const book=d.querySelector('#parallel-book').value;
    const chapter=d.querySelector('#parallel-chapter').value;
    change('#language','hy');
    try {
      assert.equal(d.querySelector('#parallel-book').value,book);
      assert.equal(d.querySelector('#parallel-chapter').value,chapter);
      assert.equal(d.querySelector('#parallel-book').selectedOptions[0].textContent,w.MARANATHA_LOCALE_HY.books[book].name);
    } finally { change('#language','en'); }
  });
} finally { dom.window.close(); }
await check('lazy-lxx-callback-does-not-leak-into-canon',async()=>{
  const delayed=await JSDOM.fromFile(path.join(root,'index.html'),{
    runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,
    beforeParse(win){
      win.matchMedia=()=>({matches:false,addEventListener(){}});win.scrollTo=()=>{};
      win.HTMLElement.prototype.scrollIntoView=()=>{};
      const original=win.Node.prototype.appendChild;
      win.Node.prototype.appendChild=function(node){
        if(node.tagName==='SCRIPT'&&node.src.includes('/data/lxx-swete.js')){
          setTimeout(()=>original.call(this,node),200);return node;
        }
        return original.call(this,node);
      };
    }
  });
  try{
    const doc=delayed.window.document;
    await wait(()=>delayed.window.MARANATHA_TRANSLATIONS?.web && doc.querySelector('#results h2'));
    const selector=doc.querySelector('#view-mode');
    selector.value='parallel';selector.dispatchEvent(new delayed.window.Event('change'));
    selector.value='canon';selector.dispatchEvent(new delayed.window.Event('change'));
    await wait(()=>delayed.window.MARANATHA_TRANSLATIONS?.['lxx-swete']);
    await new Promise(r=>setTimeout(r,100));
    assert(doc.querySelector('#lxx-attribution').hidden,'late LXX load revealed footer attribution in Canon');
    assert(doc.querySelector('#parallel-view').hidden);
  }finally{delayed.window.close();}
});
console.log(`independent-stage1b: ${failed} failures`);
process.exitCode=failed?1:0;
