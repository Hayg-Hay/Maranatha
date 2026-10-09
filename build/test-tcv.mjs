import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
import { ROOT, EMPTY_REFS, sha256 } from './import-tcv.mjs';
import { readTcvUsfm } from './tcv-usfm.mjs';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const data = JSON.parse(read('data/tcv.json'));
assert.equal(data.language, 'th'); assert.equal(data.nativeVersification, false);
assert.equal(data.books.DAN.length, 12); assert.equal(data.books['3JN'][0].length, 15);
assert.equal(Object.keys(data.books).length, 66); assert.equal(data.books.TOB, undefined);
assert.equal(data.sourceInventory.zeroWidthSpaces, 678306);
assert.equal(data.sourcePackageHasMetadataXml, false);
for (const ref of EMPTY_REFS) {
  const [b, c, v] = ref.split('.'); assert.equal(data.books[b][c - 1][v - 1], '');
  assert.equal(data.verseMetadata[b][c][v].status, 'source-gap');
}
const twin = { window: {} }; vm.runInNewContext(read('data/tcv.js'), twin);
assert.equal(JSON.stringify(twin.window.MARANATHA_TRANSLATIONS.tcv), JSON.stringify(data));
const files = ['data/tcv.json', 'data/tcv.js', 'data/locales/th.json', 'data/locales/th.js'];
const before = files.map(f => sha256(read(f)));
execFileSync(process.execPath, ['build/import-tcv.mjs', '--check'], { cwd: ROOT });
execFileSync(process.execPath, ['build/build-thai-locale.mjs', '--check'], { cwd: ROOT });
assert.deepEqual(files.map(f => sha256(read(f))), before);
assert.throws(() => readTcvUsfm('\\id GEN\n\\c 1\n\\v 1 คำ \\unknown test'), /Unsupported/);
assert.throws(() => readTcvUsfm('\\id GEN\n\\c 1\n\\v 1 คำ \\f + \\ft note'), /Unclosed/);
assert.throws(() => readTcvUsfm('\\id GEN\n\\c 2\n\\v 1 คำ'), /Noncontiguous/);
const fixture = readTcvUsfm('\\id GEN\n\\c 1\n\\v 1 ก้า\\f + \\fr 1:1 \\ft แยก\\f* กำ\n\\s1 หัวเรื่อง\n\\p อีกคำ\n\\v 2 คำใหม่');
assert(fixture.records[0].text.includes('ก้า')); assert(!fixture.records[0].text.includes('แยก'));
assert.equal(fixture.headings[0].withinVerse, 1);
console.log('PASS TCV source bounds, empty positions, exact twins, integrity and strict/non-mutating import.');

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) { for (let i = 0; i < 1400; i++) { if (fn()) return; await sleep(20); } throw new Error('TCV app timed out'); }
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
function search(w, id, value) { change(w, '#search-translation', id); w.document.querySelector('#search').value = value; w.document.querySelector('#search-go').click(); }
function pureText(el) { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; }
for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS.tcv, undefined);
    select(w, 'web', false); select(w, 'tcv', true);
    await until(() => d.querySelector('.thai-verse'));
    const first = d.querySelector('.thai-verse'); assert.equal(first.lang, 'th'); assert.equal(first.dir, 'ltr');
    assert.equal(pureText(first), data.books.GEN[0][0]);
    assert.equal(w.getComputedStyle(first).whiteSpace, 'pre-wrap');
    for (const value of ['ยอห์น3:16', 'ยอห์น๓:๑๖', 'ยอห์น３：１６', 'ยน. 3:16', 'ยอ\u200Bห์น๓:๑๖', 'John 3:16']) {
      ref(w, value); assert.equal(d.querySelector('#message').textContent, '', value);
      assert([...d.querySelectorAll('.thai-verse')].some(el => pureText(el) === data.books.JHN[2][15]));
    }
    change(w, '#language', 'th');
    assert(d.querySelector('#book option[value="GEN"]').textContent.includes('ปฐมกาล'));
    ref(w, 'Genesis 1:1'); assert.equal(d.querySelector('#message').textContent, '');
    const details = d.querySelector('.passage-source-details'); assert(details && !details.open);
    assert.equal(d.querySelector('.comparison-table, .mobile-verses').nextElementSibling, details);
    assert.equal(d.querySelectorAll('#results > .source-heading, #results > .source-note').length, 0);
    ref(w, 'Daniel 13'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, '3 John 1:16'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, '3 John 1:15'); assert.equal(d.querySelector('#message').textContent, '');
    select(w, 'web', true); change(w, '#layout', 'multirow'); ref(w, 'ยอห์น3:16');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 1);
    assert.equal(d.querySelectorAll('.comparison-table-rows tbody tr').length, 2, 'shared reference row group');
    ref(w, '3 John 1:14-15'); assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2);
    ref(w, 'Romans 14:1'); assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2);
    ref(w, 'John 5:4'); assert(d.querySelector('.verse-source-gap'));
    assert(d.querySelector('.passage-source-details .source-note'));
    ref(w, 'Jeremiah 39');
    const extra = data.sourceNotes.JER[39].find(n => n.type === 'unnumbered-source').text;
    const el = [...d.querySelectorAll('.source-note')].find(n => n.textContent.includes(extra)); assert(el);
    assert.match(el.textContent, /Unnumbered source text/); assert(!el.textContent.includes('not Scripture'));
    assert(![...d.querySelectorAll('.thai-verse')].some(n => pureText(n).includes(extra)));
    search(w, 'tcv', 'พระเจ้า');
    const hitText = d.querySelector('.search-hit .thai-verse'); assert(hitText.querySelector('mark'));
    assert(hitText.textContent.includes('\u200B'), 'source word separators retained in highlighted/copied text');
    d.querySelector('.search-hit .compare-toggle').click(); assert(d.querySelector('.search-hit .compare-row'));
    assert.equal(d.querySelector('.search-hit .compare-native-notice'), null);
    search(w, 'web', 'God'); d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-panel [lang="th"]'));
    search(w, 'tcv', data.books['3JN'][0][0].replace(/\u200B/g, ''));
    d.querySelector('.search-hit .compare-toggle').click(); assert(d.querySelector('.compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-row').length, 0);
    const S = w.MARANATHA_SEARCH_TEST;
    assert.equal(S.searchVerses({ language: 'th', books: { GEN: [['ก้า']] } }, 'กา').total, 0, 'tone marks remain significant');
    assert.equal(S.searchVerses({ language: 'th', books: { GEN: [['พระ\u200Bเจ้า']] } }, 'พระเจ้า').total, 1);
    assert.equal(S.searchVerses(data, extra.replace(/\u200B/g, '')).total, 0, 'unnumbered source paragraph not numbered search text');
    const highlighted = d.createElement('span'), original = 'พระ\u200Bเจ้า น้ำ ก้้';
    S.appendHighlighted(highlighted, original, 'พระเจ้า', 'tcv');
    assert.equal(highlighted.textContent, original); assert.equal(highlighted.querySelector('mark').textContent, 'พระ\u200Bเจ้า');
    highlighted.textContent = '';
    S.appendHighlighted(highlighted, 'ก้้', '้', 'tcv'); assert.equal(highlighted.textContent, 'ก้้', 'overlapping cluster matches never duplicate Scripture');
    highlighted.textContent = '';
    S.appendHighlighted(highlighted, 'น้ำ', 'ำ', 'tcv'); assert.equal(highlighted.textContent, 'น้ำ');
    assert.equal(highlighted.querySelector('mark').textContent, 'น้ำ', 'Thai spacing vowel stays in its original grapheme');
    select(w, 'web', false); ref(w, 'John 3:16');
    const interlinear = d.querySelector('#interlinear'); interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => d.querySelector('.interlinear-verse')); assert.equal(d.querySelector('#message').textContent, '');
    ref(w, '3 John 1:14'); assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    interlinear.checked = false; interlinear.dispatchEvent(new w.Event('change'));
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} TCV file:// references, Thai digits, exact text, ZWS/tone-safe search, shared rows, notes and exception guards.`);
  } finally { w.close(); }
}
{
  const dom = await openApp(true), w = dom.window, d = w.document;
  try {
    change(w, '#view-mode', 'parallel'); change(w, '#parallel-book', 'DAN'); change(w, '#parallel-translation', 'tcv');
    await until(() => d.querySelector('#parallel-translation-content [lang="th"]'));
    assert.equal(d.querySelector('#parallel-chapter').options.length, 12);
    assert.equal(d.querySelector('#translations input[value="tcv"]').checked, false);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log('PASS TCV independent pane-only loading and source chapter bounds.');
  } finally { w.close(); }
}
