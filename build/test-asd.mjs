import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ROOT } from './import-asd.mjs';
import { readAsdUsfm } from './asd-usfm.mjs';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const data = JSON.parse(read('data/asd.json'));
const twin = { window: {} }; vm.runInNewContext(read('data/asd.js'), twin);
assert.equal(JSON.stringify(twin.window.MARANATHA_TRANSLATIONS.asd), JSON.stringify(data));
assert.equal(data.books['2CO'][12].length, 13); assert.equal(data.books.REV[11].length, 18);
assert.equal(data.books['3JN'][0].length, 15); assert.equal(data.books.DAN.length, 12);
assert.equal(data.books.TOB, undefined); assert.equal(data.language, 'tl');
assert.throws(() => readAsdUsfm('\\id GEN\n\\c 1\n\\v 1 Salita \\unknown x'), /Unsupported/);
assert.throws(() => readAsdUsfm('\\id GEN\n\\c 1\n\\v 1 Salita \\f + \\ft tala'), /Unclosed/);
const parsed = readAsdUsfm('\\id GEN\n\\c 1\n\\v 1-2 Salita\\f + \\cat dup\\cat* \\fr 1:1 \\ft Tala\\f* pa.\n\\s1 Pamagat\n\\p Karugtong.');
assert.equal(parsed.records[0].label, '1-2'); assert.equal(parsed.records[0].end, 2);
assert.equal(parsed.notes[0].text, 'Tala'); assert(!parsed.records[0].text.includes('Tala'));
assert.equal(parsed.headings[0].withinVerse, 1);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) { for (let i = 0; i < 1400; i++) { if (fn()) return; await sleep(20); } throw new Error('ASD app timed out'); }
async function openApp(narrow) {
  const errors = [];
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.MARANATHA_ENABLE_TEST_HOOKS = true;
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.__requests = []; w.fetch = (...a) => { w.__requests.push(String(a[0])); throw new Error('Network blocked'); };
      w.XMLHttpRequest = class { open(method, url) { w.__requests.push(String(url)); throw new Error('Network blocked'); } };
      w.addEventListener('error', e => errors.push(e.message));
    },
  });
  await until(() => dom.window.document.readyState === 'complete'); dom.errors = errors; return dom;
}
function select(w, id, on) { const el = w.document.querySelector(`#translations input[value="${id}"]`); el.checked = on; el.dispatchEvent(new w.Event('change')); }
function change(w, selector, value) { const el = w.document.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change')); }
function ref(w, value) { w.document.querySelector('#reference').value = value; w.document.querySelector('#reference-go').click(); }
function search(w, value) { change(w, '#search-translation', 'asd'); w.document.querySelector('#search').value = value; w.document.querySelector('#search-go').click(); }
function pureText(el) { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; }
for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS.asd, undefined, 'lazy loaded');
    select(w, 'web', false); select(w, 'asd', true);
    await until(() => d.querySelector('.filipino-verse'));
    assert.equal(pureText(d.querySelector('.filipino-verse')), data.books.GEN[0][0]);
    assert.equal(d.querySelector('.filipino-verse').lang, 'tl');
    assert.equal(w.getComputedStyle(d.querySelector('.filipino-verse')).whiteSpace, 'pre-wrap');
    for (const value of ['Juan 3:16', 'Juan３：１６', 'John 3:16']) {
      ref(w, value); assert.equal(d.querySelector('#message').textContent, '', value);
      assert([...d.querySelectorAll('.filipino-verse')].some(el => pureText(el) === data.books.JHN[2][15]));
    }
    change(w, '#language', 'tl');
    assert(d.querySelector('#book option[value="JHN"]').textContent.includes('Juan'));
    ref(w, 'Mga Awit 23'); assert.equal(d.querySelector('#message').textContent, '');
    ref(w, 'Mga Salmo 7:13'); assert.equal(d.querySelector('#message').textContent, '');
    assert.equal(d.querySelectorAll('.filipino-verse').length, 1, 'combined member resolves to complete unit');
    assert.equal(pureText(d.querySelector('.filipino-verse')), data.books.PSA[6][11]);
    assert(d.querySelector('#results').textContent.includes('7:12-13'));
    ref(w, 'Genesis 1'); const details = d.querySelector('.passage-source-details');
    assert(details && !details.open); assert(d.querySelector('.filipino-verse').compareDocumentPosition(details) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(d.querySelectorAll('#results > .source-heading, #results > .source-note').length, 0);
    ref(w, 'Daniel 13'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, '2 Corinthians 13:14'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, '3 John 1:15'); assert.equal(d.querySelector('#message').textContent, '');
    ref(w, 'Revelation 12:18'); assert.equal(d.querySelector('#message').textContent, '');
    select(w, 'web', true); change(w, '#layout', 'multirow'); ref(w, 'Juan 3:16');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 1);
    assert.equal(d.querySelectorAll('.comparison-table-rows tbody tr').length, 2);
    for (const value of ['Psalms 7:13', '2 Corinthians 13:13', '3 John 1:14-15', 'Revelation 12:18', 'Revelation 13:1', 'Romans 14:1']) {
      ref(w, value); assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, value);
      assert(!d.querySelector('#results').textContent.includes('expects undefined'));
    }
    ref(w, 'Psalms 7:13');
    assert.equal(pureText(d.querySelector('.filipino-verse')), data.books.PSA[6][11]);
    search(w, 'Diyos'); const hit = d.querySelector('.search-hit .filipino-verse');
    assert(hit.querySelector('mark')); assert.equal(hit.textContent, data.books.GEN[0][0]);
    d.querySelector('.search-hit .compare-toggle').click(); assert(d.querySelector('.search-hit .compare-row'));
    assert.equal(d.querySelector('.search-hit .compare-native-notice'), null);
    search(w, data.books.PSA[6][11].split('\n')[0]);
    d.querySelector('.search-hit .compare-toggle').click(); assert(d.querySelector('.compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-row').length, 0);
    const original = data.books.GEN[0][7]; const el = d.createElement('span');
    w.MARANATHA_SEARCH_TEST.appendHighlighted(el, original, 'Diyos', 'asd');
    assert.equal(el.textContent, original); assert(el.textContent.includes('itoʼy'));
    select(w, 'web', false); ref(w, 'Juan 3:16');
    const interlinear = d.querySelector('#interlinear'); interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => d.querySelector('.interlinear-verse'));
    ref(w, '2 Corinthians 13:13'); assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} ASD offline loading, references, source ranges, exact copy/search text, comparison and notes.`);
  } finally { w.close(); }
}
{
  const dom = await openApp(true), w = dom.window, d = w.document;
  try {
    change(w, '#view-mode', 'parallel'); change(w, '#parallel-book', 'DAN'); change(w, '#parallel-translation', 'asd');
    await until(() => d.querySelector('#parallel-translation-content [lang="tl"]'));
    assert.equal(d.querySelector('#parallel-chapter').options.length, 12);
    assert.equal(d.querySelector('#translations input[value="asd"]').checked, false);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log('PASS ASD independent pane-only loading and source bounds.');
  } finally { w.close(); }
}
