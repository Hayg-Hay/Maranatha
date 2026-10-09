import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
import { ROOT, SOURCE_DIR, parseJson, POINTERS, sha256 } from './import-ayt.mjs';
import { parseSfm } from './ayt-sfm.mjs';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const data = JSON.parse(read('data/ayt.json'));
assert.equal(data.language, 'id'); assert.equal(data.nativeVersification, false);
assert.equal(data.books.GEN[0][0], 'Pada mulanya, Allah menciptakan langit dan bumi.');
assert.equal(data.books.DAN.length, 12); assert.equal(data.books['3JN'][0].length, 14);
assert.equal(data.books.TOB, undefined); assert.equal(Object.keys(data.books).length, 66);
for (const [ref, text] of Object.entries(POINTERS)) {
  const [b, c, v] = ref.split('.'); assert.equal(data.books[b][c - 1][v - 1], text);
  assert.equal(data.verseMetadata[b][c][v].status, 'source-placeholder');
}
assert(data.versification.ISA[22].comparisonUnavailable);
assert(data.versification.ROM[14].comparisonUnavailable);
assert.equal(data.versification.JHN, undefined);
assert.equal(data.sourceInventory.formatDifferences, 78);
assert(data.sourceFormatDifferences.every(d => /Selah|table/.test(d.type)));
assert.equal(data.sourceInventory.footnotes, 1665);
assert.equal(data.sourceInventory.crossReferences, 147);
assert.equal(data.sourceInventory.superscriptionMarkers, 116);
assert.equal(data.sourceInventory.withinVerseHeadings, 2);
assert(data.sourceHeadings['1SA'][4].some(h => h.withinVerse === 1));
assert(data.sourceHeadings.ACT[8].some(h => h.withinVerse === 1));
assert(data.books.PSA[2][0].includes('Nyanyian Daud'), 'publisher superscription retained in verse text');
const sandbox = { window: {} }; vm.runInNewContext(read('data/ayt.js'), sandbox);
assert.equal(JSON.stringify(sandbox.window.MARANATHA_TRANSLATIONS.ayt), JSON.stringify(data));
const files = ['data/ayt.json', 'data/ayt.js', 'data/locales/id.json', 'data/locales/id.js'];
const before = files.map(f => sha256(read(f)));
execFileSync(process.execPath, ['build/import-ayt.mjs', '--check'], { cwd: ROOT });
execFileSync(process.execPath, ['build/build-indonesian-locale.mjs', '--check'], { cwd: ROOT });
assert.deepEqual(files.map(f => sha256(read(f))), before);
const raw = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'json/ayt.json'), 'utf8'));
assert.throws(() => parseJson(raw.map((r, i) => i === 1 ? { ...r, verse: '1' } : r)), /Duplicate/);
assert.throws(() => parseJson(raw.map((r, i) => i === 0 ? { ...r, text: '<unknown>text</unknown>' } : r)), /Unsupported/);
assert.throws(() => parseSfm('\\id GEN\n\\c 1\n\\v 1 Text \\unknown More'), /Unsupported/);
assert.throws(() => parseSfm('\\id GEN\n\\c 1\n\\v 1 Text \\f + \\ft note'), /Unclosed/);
console.log('PASS AYT coverage, exact pointers, source-format metadata, twins and strict/non-mutating import.');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i = 0; i < 1200; i++) { if (fn()) return; await sleep(20); } throw new Error('App timed out'); }
async function openApp(narrow) {
  const errors = [];
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.MARANATHA_ENABLE_TEST_HOOKS = true;
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.__requests = []; w.fetch = (...args) => { w.__requests.push(String(args[0])); throw new Error('Network blocked'); };
      w.XMLHttpRequest = class { open(method, url) { w.__requests.push(String(url)); throw new Error('Network blocked'); } };
      w.addEventListener('error', e => errors.push(e.message));
    },
  });
  await until(() => dom.window.document.readyState === 'complete'); dom.errors = errors; return dom;
}
function select(w, id, on) { const el = w.document.querySelector(`#translations input[value="${id}"]`); el.checked = on; el.dispatchEvent(new w.Event('change')); }
function change(w, selector, value) { const el = w.document.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change')); }
function ref(w, text) { w.document.querySelector('#reference').value = text; w.document.querySelector('#reference-go').click(); }
function search(w, translation, text) { change(w, '#search-translation', translation); w.document.querySelector('#search').value = text; w.document.querySelector('#search-go').click(); }
const scriptureText = el => { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; };
for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS.ayt, undefined, 'lazy load');
    select(w, 'web', false); select(w, 'ayt', true);
    await until(() => d.querySelector('.indonesian-verse'));
    assert.equal(d.querySelector('.indonesian-verse').lang, 'id');
    assert.equal(d.querySelector('.indonesian-verse').dir, 'ltr');
    assert.equal(scriptureText(d.querySelector('.indonesian-verse')), data.books.GEN[0][0]);
    for (const input of ['Yohanes3:16', 'Yoh 3:16', 'Yohanes３：１６', 'John 3:16', 'Kejadian1:1', 'Kej 1:1']) {
      ref(w, input); assert.equal(d.querySelector('#message').textContent, '', input);
    }
    change(w, '#language', 'id');
    assert(d.querySelector('#book option[value="GEN"]').textContent.includes('Kejadian'));
    ref(w, 'Genesis 1:1'); assert.equal(d.querySelector('#message').textContent, '');
    ref(w, 'Daniel 13'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, '3 John 1:15'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/);
    ref(w, 'Yohanes 3:16');
    let details = d.querySelector('.passage-source-details');
    assert(details && !details.open);
    assert.equal(d.querySelector('.comparison-table, .mobile-verses').nextElementSibling, details);
    assert.equal(d.querySelectorAll('#results > .source-heading, #results > .source-note').length, 0);
    assert.equal(d.querySelector('.versification-notice'), null, 'ordinary chapter not excluded from alignment');
    select(w, 'web', true); ref(w, 'Yohanes 3:16');
    if (narrow) { assert.equal(d.querySelectorAll('.mobile-verse').length, 1); assert(d.querySelector('.mobile-verse .indonesian-verse')); }
    else { assert.equal(d.querySelectorAll('.comparison-table').length, 1); assert.equal(d.querySelector('.comparison-table tbody tr').children.length, 3); }
    change(w, '#layout', 'multirow'); ref(w, 'Yohanes 3:16');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 1);
    assert.equal(d.querySelectorAll('.comparison-table-rows tbody tr').length, 2, 'AYT and WEB share a reference row group');
    search(w, 'ayt', 'Allah');
    assert(d.querySelector('.search-hit [lang="id"] mark'));
    d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-row'));
    assert.equal(d.querySelector('.search-hit .compare-native-notice'), null);
    search(w, 'web', 'God'); d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-panel [lang="id"]'), 'comparison works both directions');
    ref(w, 'Yesaya 22:9-11');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, 'exception chapter separate');
    assert.equal(d.querySelectorAll('.verse-source-placeholder').length, 2);
    const pointers = [...d.querySelectorAll('.verse-source-placeholder')].map(scriptureText);
    assert.deepEqual(pointers, ['(22:9)', '(22:9)']);
    search(w, 'ayt', '(22:9)'); d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-row').length, 0);
    search(w, 'web', w.MARANATHA_TRANSLATIONS.web.books.ISA[21][9]);
    d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-panel [lang="id"]').length, 0);
    ref(w, 'Roma 14'); assert(d.querySelector('.versification-notice'));
    select(w, 'web', false); ref(w, 'Roma 16:25-27');
    assert.equal(d.querySelectorAll('.indonesian-verse').length, 3, 'source doxology retained in Romans 16');
    ref(w, 'Matius 1:1'); details = d.querySelector('.passage-source-details');
    const note = data.sourceNotes.MAT[1][0].text;
    assert(details.textContent.includes(note));
    assert(!scriptureText(d.querySelector('.indonesian-verse')).includes(note));
    assert.equal(w.MARANATHA_SEARCH_TEST.searchVerses(data, note).total, 0, 'footnotes excluded from Scripture search');
    ref(w, 'Yohanes 3:16');
    const interlinear = d.querySelector('#interlinear'); interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => d.querySelector('.interlinear-verse'));
    assert.equal(d.querySelector('#message').textContent, '', 'normal AYT caption works');
    ref(w, 'Roma 14:1');
    assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    interlinear.checked = false; interlinear.dispatchEvent(new w.Event('change'));
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} AYT offline loading, Indonesian references, shared rows, exceptional chapters, notes and interlinear guards.`);
  } finally { w.close(); }
}

{
  const dom = await openApp(true), w = dom.window, d = w.document;
  try {
    change(w, '#view-mode', 'parallel'); change(w, '#parallel-book', 'DAN'); change(w, '#parallel-translation', 'ayt');
    await until(() => d.querySelector('#parallel-translation-content [lang="id"]'));
    assert.equal(d.querySelector('#parallel-chapter').options.length, 12);
    assert.equal(d.querySelector('#translations input[value="ayt"]').checked, false);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log('PASS AYT pane-only load and native chapter bounds.');
  } finally { w.close(); }
}
