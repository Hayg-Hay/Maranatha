import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ROOT } from './import-kszi.mjs';
import { readKsziUsfm } from './kszi-usfm.mjs';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const data = JSON.parse(read('data/kszi.json'));
const twin = { window: {} }; vm.runInNewContext(read('data/kszi.js'), twin);
assert.equal(JSON.stringify(twin.window.MARANATHA_TRANSLATIONS.kszi), JSON.stringify(data));
assert.equal(data.language, 'ms'); assert.equal(data.sourceLanguage, 'zlm'); assert.equal(data.scope, 'NT');
assert.equal(data.books['3JN'][0].length, 15); assert.equal(data.books.ROM[13].length, 23); assert.equal(data.books.ROM[15].length, 27);
assert.equal(data.books.GEN, undefined); assert.equal(data.books.PSA, undefined); assert.equal(data.books.MAL, undefined);
assert.equal(data.sourceInventory.books, 27); assert.equal(data.sourceInventory.records, 7958);
assert.equal(data.sourceInventory.footnotes, 0); assert.equal(data.sourceInventory.headings, 733);
assert.equal(Object.keys(data.sourceNotes).length, 0); assert.equal(Object.keys(data.psalmHeadings).length, 0);
assert.throws(() => readKsziUsfm('\\id MAT\n\\c 1\n\\v 1 Firman \\unknown x'), /Unsupported/);
assert.throws(() => readKsziUsfm('\\id MAT\n\\c 1\n\\v 1 Firman \\f + \\ft nota'), /Unclosed/);
const parsed = readKsziUsfm('\\id MAT\n\\c 1\n\\v 1-2 Firman\\f + \\cat dup\\cat* \\fr 1:1 \\ft Nota\\f* dan.\n\\s1 Tajuk\n\\p Sambungan.');
assert.equal(parsed.records[0].label, '1-2'); assert.equal(parsed.records[0].end, 2);
assert.equal(parsed.notes[0].text, 'Nota'); assert(!parsed.records[0].text.includes('Nota'));
assert.equal(parsed.headings[0].withinVerse, 1);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) { for (let i = 0; i < 1400; i++) { if (fn()) return; await sleep(20); } throw new Error('KSZI app timed out'); }
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
function search(w, value) { change(w, '#search-translation', 'kszi'); w.document.querySelector('#search').value = value; w.document.querySelector('#search-go').click(); }
function pureText(el) { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; }
for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS.kszi, undefined, 'lazy loaded');
    select(w, 'web', false); select(w, 'kszi', true);
    ref(w, 'Yahya 3:16'); await until(() => d.querySelector('.malay-verse'));
    assert.equal(pureText(d.querySelector('.malay-verse')), data.books.JHN[2][15]);
    assert.equal(d.querySelector('.malay-verse').lang, 'ms');
    assert.equal(w.getComputedStyle(d.querySelector('.malay-verse')).whiteSpace, 'pre-wrap');
    for (const value of ['Yahya 3:16', 'Yahya 3:16'.normalize('NFD'), 'Yahya３：１６', 'John 3:16']) {
      ref(w, value); assert.equal(d.querySelector('#message').textContent, '', value);
      assert([...d.querySelectorAll('.malay-verse')].some(el => pureText(el) === data.books.JHN[2][15]));
    }
    change(w, '#language', 'ms');
    assert(d.querySelector('#book option[value="JHN"]').textContent.includes('Yahya'));
    assert(d.querySelector('#book option[value="ROM"]').textContent.includes('Rom'));
    // The New Testament edition has no Old Testament text: the reference still
    // resolves, but every position is the app's unavailable-text placeholder and
    // no invented Malay Scripture is shown.
    ref(w, 'Genesis 1'); assert.equal(d.querySelector('#message').textContent, '');
    const placeholders = [...d.querySelectorAll('.verse-placeholder')];
    assert.equal(placeholders.length, 31);
    assert(placeholders.every(el => /not available in this translation/.test(el.textContent)));
    assert.equal(d.querySelectorAll('.malay-verse').length, 0);
    ref(w, 'Psalms 23');
    const psalmPlaceholders = [...d.querySelectorAll('.verse-placeholder')];
    assert.equal(psalmPlaceholders.length, 6);
    assert(psalmPlaceholders.every(el => /not available in this translation/.test(el.textContent)));
    assert.equal(d.querySelectorAll('.malay-verse').length, 0);
    // Headings are collapsed below reading, never shown as Scripture.
    ref(w, 'Yahya 1:17'); assert(d.querySelector('.malay-verse').textContent.includes('Isa al-Masih'));
    const details = d.querySelector('.passage-source-details');
    assert(details && !details.open);
    assert(d.querySelectorAll('.passage-source-details .source-heading').length > 0);
    assert.equal(d.querySelectorAll('#results > .source-heading, #results > .source-note').length, 0);
    ref(w, '3 John 1:15'); assert.equal(d.querySelector('#message').textContent, '');
    assert.equal(pureText(d.querySelector('.malay-verse')), data.books['3JN'][0][14]);
    ref(w, '3 John 1:16'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    select(w, 'web', true); change(w, '#layout', 'multirow'); ref(w, 'Yahya 3:16');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 1);
    assert.equal(d.querySelectorAll('.comparison-table-rows tbody tr').length, 2);
    for (const value of ['3 John 1:14-15', 'Romans 14:1', 'Rom 14:1']) {
      ref(w, value); assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, value);
      assert(!d.querySelector('#results').textContent.includes('expects undefined'));
    }
    search(w, data.books.JHN[2][15]); const hit = d.querySelector('.search-hit .malay-verse');
    assert(hit.querySelector('mark')); assert.equal(hit.textContent, data.books.JHN[2][15]);
    d.querySelector('.search-hit .compare-toggle').click(); assert(d.querySelector('.search-hit .compare-row'));
    assert.equal(d.querySelector('.search-hit .compare-native-notice'), null);
    const S = w.MARANATHA_SEARCH_TEST;
    assert.equal(S.searchVerses({ language: 'ms', books: { JHN: [['Isa al-Masih']] } }, 'ISA AL-MASIH').total, 1);
    assert.equal(S.searchVerses({ language: 'ms', books: { JHN: [['Isa al-Masih']] } }, 'Isa al-Masih'.normalize('NFD')).total, 1);
    for (const original of ['Isa al-Masih', 'Isa al-Masih'.normalize('NFD')]) {
      const el = d.createElement('span'); S.appendHighlighted(el, original, 'ISA AL-MASIH', 'kszi');
      assert.equal(el.textContent, original); assert.equal(el.querySelector('mark').textContent, original);
    }
    select(w, 'web', false); ref(w, 'Yahya 3:16');
    const interlinear = d.querySelector('#interlinear'); interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => d.querySelector('.interlinear-verse'));
    ref(w, 'Romans 14:1'); assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} KSZI offline loading, Malay references, NT-only placeholders, exact copy/search text, collapsed headings, comparison and notes.`);
  } finally { w.close(); }
}
{
  const dom = await openApp(true), w = dom.window, d = w.document;
  try {
    change(w, '#view-mode', 'parallel'); change(w, '#parallel-book', 'JHN'); change(w, '#parallel-translation', 'kszi');
    await until(() => d.querySelector('#parallel-translation-content [lang="ms"]'));
    assert.equal(d.querySelector('#parallel-chapter').options.length, 21);
    assert.equal(d.querySelector('#translations input[value="kszi"]').checked, false);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log('PASS KSZI independent pane-only loading and source bounds.');
  } finally { w.close(); }
}
