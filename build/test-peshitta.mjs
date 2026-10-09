import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ROOT } from './import-peshitta-pair.mjs';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const syr = JSON.parse(read('data/peshitta.json'));
const en = JSON.parse(read('data/murdock.json'));

// Deterministic JSON/JS twins.
for (const [id, data] of [['peshitta', syr], ['murdock', en]]) {
  const ctx = { window: {} }; vm.runInNewContext(read(`data/${id}.js`), ctx);
  assert.equal(JSON.stringify(ctx.window.MARANATHA_TRANSLATIONS[id]), JSON.stringify(data), `${id} twin`);
}

// Declared extent and independent source-unit metadata.
assert.equal(syr.language, 'syr'); assert.equal(syr.direction, 'rtl'); assert.equal(syr.scope, 'NT');
assert.equal(en.language, 'en'); assert.equal(en.direction, 'ltr'); assert.equal(en.scope, 'NT');
for (const data of [syr, en]) {
  assert.equal(data.sourceInventory.books, 27);
  assert.equal(data.sourceInventory.chapters, 260);
  assert.equal(data.books.GEN, undefined); assert.equal(data.books.PSA, undefined);
  assert.equal(Object.keys(data.books).length, 27);
  assert(data.versification.ROM?.[14], 'Romans 14 comparison exception');
  assert(!JSON.stringify(data.books).includes('MarYa'));
}
assert.equal(syr.sourceInventory.records, 7957); assert.equal(syr.sourceInventory.footnotes, 0);
assert.deepEqual(syr.sourceInventory.emptyRefs, []);
assert.equal(syr.conversionLedger.length, 1); assert.deepEqual(syr.conversionLedger[0].targetRefs, ['MRK.9.49', 'MRK.9.50']);
assert.deepEqual(Object.keys(syr.bookProvenance).sort(), ['2JN', '2PE', '3JN', 'JUD', 'REV']);
assert(syr.books['1CO'][11][2].includes('ܕܡܪܝܐ ܗܘ ܝܫܘܥ'), 'Syriac MarYa retained at 1 Cor 12:3');
assert(en.sourceInventory.records, 7960); assert.equal(en.sourceInventory.footnotes, 19);
assert.equal(en.sourceInventory.emptyRefs.length, 10); assert.equal(en.conversionLedger.length, 3);
assert.equal(en.books.ROM[6].length, 26); assert.equal(en.books['3JN'][0].length, 15); assert.equal(en.books.REV[11].length, 18);
assert(en.books['1CO'][11][2].includes('Jesus is the Lord'));

// Local font licence/hash pinning and offline shell wiring.
const fontManifest = JSON.parse(read('build/sources/peshitta-font/font-manifest.json'));
assert.equal(fontManifest.license, 'SIL OFL 1.1');
for (const entry of fontManifest.files) {
  const target = path.resolve(ROOT, entry.path);
  assert.equal(sha(fs.readFileSync(target)), entry.sha256, `font hash ${entry.path}`);
}
const sw = read('service-worker.js');
assert(/CACHE_VERSION\s*=\s*'v66'/.test(sw)); assert(/DATA_CACHE_VERSION\s*=\s*'v3'/.test(sw));
assert(sw.includes(`'./fonts/NotoSansSyriac-Regular.ttf'`));
assert(!/https?:\/\//.test(sw.split('SHELL_FILES')[1].split(']')[0]), 'shell files must be local');
const css = read('style.css');
assert(/@font-face[^}]*NotoSansSyriac-Regular\.ttf/.test(css));
assert(/\.syriac-verse\s*\{[^}]*direction:\s*rtl/.test(css));

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) { for (let i = 0; i < 1400; i++) { if (fn()) return; await sleep(20); } throw new Error('Peshitta app timed out'); }
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
function search(w, translation, value) { change(w, '#search-translation', translation); w.document.querySelector('#search').value = value; w.document.querySelector('#search-go').click(); }
function pureText(el) { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; }
function verseCells(d) {
  return [
    ...[...d.querySelectorAll('#results td')].filter(td => !td.classList.contains('reference')),
    ...d.querySelectorAll('#results .mobile-verse-text'),
  ];
}
function hasVerse(d, text) { return verseCells(d).some(td => pureText(td) === text); }

for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS.peshitta, undefined, 'lazy loaded');
    assert.equal(w.MARANATHA_TRANSLATIONS.murdock, undefined, 'lazy loaded');
    // Syriac witness: RTL/font, exact text and the explicit Mark boundary.
    select(w, 'web', false); select(w, 'peshitta', true);
    ref(w, '1 Corinthians 12:3'); await until(() => d.querySelector('.syriac-verse'));
    const cell = d.querySelector('.syriac-verse');
    assert.equal(pureText(cell), syr.books['1CO'][11][2]);
    assert.equal(cell.lang, 'syr'); assert.equal(cell.dir, 'rtl');
    assert.equal(w.getComputedStyle(cell).direction, 'rtl');
    assert(w.getComputedStyle(cell).fontFamily.includes('Noto Sans Syriac'));
    ref(w, 'Mark 9:49'); assert(hasVerse(d, syr.books.MRK[8][48]));
    ref(w, 'Mark 9:50'); assert(hasVerse(d, syr.books.MRK[8][49]));
    // No Old Testament text is invented.
    ref(w, 'Genesis 1'); assert.equal(d.querySelector('#message').textContent, '');
    const placeholders = [...d.querySelectorAll('.verse-placeholder')];
    assert(placeholders.length === 31 && placeholders.every(el => /not available in this translation/.test(el.textContent)));
    assert.equal(d.querySelectorAll('.syriac-verse').length, 0);
    // Provenance for the five later-supplied books, collapsed below reading.
    for (const value of ['2 Peter 1:1', '2 John 1:1', '3 John 1:1', 'Jude 1:1', 'Revelation 1:1']) {
      ref(w, value); assert(d.querySelector('.book-provenance-note'), value);
      const details = d.querySelector('.passage-source-details'); assert(details && !details.open, value);
      assert.equal(d.querySelectorAll('#results > .book-provenance-note, #results > .source-note').length, 0, value);
    }
    // Mark-safe search: pointed query finds unpointed source; exact original preserved.
    const whole = syr.books['1CO'][11][2];
    search(w, 'peshitta', whole); const hit = d.querySelector('.search-hit .syriac-verse');
    assert(hit.querySelector('mark')); assert.equal(hit.textContent, whole);
    const S = w.MARANATHA_SEARCH_TEST;
    assert.equal(S.searchVerses({ language: 'syr', books: { GEN: [['ܡܪܝܐ']] } }, 'ܡܰܪܝܐ').total, 1);
    assert.equal(S.searchVerses({ language: 'syr', books: { GEN: [['ܡܪܝܐ']] } }, 'ܡܪܝܐ').total, 1);
    const pointed = 'ܡܰܪܝܐ';
    const span = d.createElement('span'); S.appendHighlighted(span, pointed, 'ܡܪܝܐ', 'peshitta');
    assert.equal(span.textContent, pointed); assert.equal(span.querySelector('mark').textContent, pointed);
    // English companion: unchanged Lord wording, native references and empty slots.
    select(w, 'peshitta', false); select(w, 'murdock', true);
    ref(w, '1 Corinthians 12:3'); await until(() => d.querySelector('#results').textContent.includes('Jesus is the Lord'));
    assert(!d.querySelector('#results').textContent.includes('MarYa'));
    for (const [value, text] of [
      ['Romans 7:25', en.books.ROM[6][24]], ['Romans 7:26', en.books.ROM[6][25]],
      ['3 John 1:15', en.books['3JN'][0][14]], ['Revelation 12:18', en.books.REV[11][17]],
    ]) {
      ref(w, value); assert.equal(d.querySelector('#message').textContent, '', value); assert(hasVerse(d, text), value);
    }
    ref(w, 'Matthew 26:30'); assert.equal(d.querySelector('#message').textContent, '');
    assert(d.querySelector('.verse-source-gap')); assert.equal(en.books.MAT[25][29], '');
    // Footnote isolation: GBF notes are separate, never inline Scripture.
    ref(w, 'Matthew 27:35'); assert.equal(d.querySelector('#message').textContent, '');
    const note = en.sourceNotes.MAT[27][0];
    assert.equal(note.verse, 35);
    assert(!hasVerse(d, note.text)); assert(d.querySelector('.passage-source-details').textContent.includes(note.text));
    // Comparison then interlinear guards for the declared exceptions.
    select(w, 'web', true); change(w, '#layout', 'multirow'); ref(w, '1 Corinthians 12:3');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 1);
    for (const value of ['Romans 14:1', 'Romans 7:1', '3 John 1:1', 'Revelation 12:1', 'Revelation 13:1']) {
      ref(w, value); assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, value);
      assert(!d.querySelector('#results').textContent.includes('expects undefined'));
    }
    select(w, 'web', false); ref(w, '1 Corinthians 12:3');
    const interlinear = d.querySelector('#interlinear'); interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => d.querySelector('.interlinear-verse'));
    ref(w, 'Romans 7:1'); assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    ref(w, 'Revelation 12:1'); assert.match(d.querySelector('#message').textContent, /content-placement exception/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    ref(w, '1 Corinthians 12:3'); assert.equal(d.querySelector('#message').textContent, '');
    assert(d.querySelector('.interlinear-verse'));
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} Peshitta/Murdock offline loading, RTL/font, mark-safe search, exact text, native references, provenance, guards and no invented OT.`);
  } finally { w.close(); }
}
