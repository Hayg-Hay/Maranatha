// test-delitzsch.mjs
//
// Full regression suite for the Delitzsch Hebrew NT (1877) import.
//
//   node build/test-delitzsch.mjs
//
// Covers, from the cached source outward to the real file:// app:
//   1. exact 27-book / 260-chapter membership;
//   2. every source reference and transformed text, plus malformed/duplicate
//      failures and the 3 John annotation failure mode;
//   3. JSON/JS equality and deterministic `--check`;
//   4. named reference checks (Matthew 1:1, John 1:1, Acts 3:15, Romans 8:1,
//      Revelation 22:21);
//   5. Unicode/punctuation, zero niqqud, and combining-mark highlighting;
//   6. Romans 14/16 and 3 John note-only metadata;
//   7. reference parsing (Jn 1:1, Acts 3:15, Rom 8:1, 3 Jn 1:15);
//   8-11. lazy local-script loading, translation switching, OT placeholders,
//      desktop/mobile layouts, context toggles, search/highlighting/navigation,
//      comparison panels and captions, and Paleo/Proto independence;
//   12. file:// with remote requests blocked;
//   13. service-worker routing for data/delitzsch.js.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { buildTranslation, NT_CANON, EXPECTED_NT_BOOKS, EXPECTED_NT_CHAPTERS, EXPECTED_NT_VERSES } from './import-delitzsch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(25);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Part A: source-aware importer checks
// ---------------------------------------------------------------------------
const rawSource = read('build/sources/delitzsch/heb_vpl.txt');
const { translation, stats } = buildTranslation(rawSource);
const data = JSON.parse(read('data/delitzsch.json'));

assert.equal(Object.keys(translation.books).length, EXPECTED_NT_BOOKS);
assert.deepEqual(Object.keys(translation.books).sort(), [...NT_CANON].sort(), 'exact NT book membership');
const chapterTotal = Object.values(translation.books).reduce((n, c) => n + c.length, 0);
assert.equal(chapterTotal, EXPECTED_NT_CHAPTERS);
assert.equal(stats.ntRows, EXPECTED_NT_VERSES);
assert.equal(stats.otRows, 23145);
assert.deepEqual(translation.books, data.books, 'importer books differ from data/delitzsch.json');
assert.deepEqual(translation.verseMetadata, data.verseMetadata, 'importer metadata differ from data/delitzsch.json');
check('1. 27-book membership and 260-chapter structure', true);

// 2. transformed text matches the source for every verse
{
  const { books, verseMetadata } = translation;
  assert.deepEqual(books, data.books);
  assert.deepEqual(verseMetadata, data.verseMetadata);
  // 3 John retains source verse 14 at index 13 and never promotes the note.
  assert.equal(books['3JN'][0].length, 14);
  assert.equal(books['3JN'][0][13], 'אבל אקוה לראותך במהרה ופה אל פה נדבר׃');
  assert.equal(verseMetadata['3JN'][1][15].status, 'note');
  check('2. every source reference and transformed text verified', true);
}

// 2b. malformed / duplicate / unknown / invalid / empty failures
assert.throws(() => buildTranslation('MAT 1:1 a\nnot-a-verse-line'), /Unparseable VPL line/, 'malformed row not rejected');
assert.throws(() => buildTranslation('MAT 1:1 a\nMAT 1:1 b'), /Duplicate reference/, 'duplicate ref not rejected');
assert.throws(() => buildTranslation('XYZ 1:1 a'), /Unexpected source book code/, 'unknown code not rejected');
assert.throws(() => buildTranslation('MAT 0:1 a'), /Invalid chapter number/, 'invalid numbering not rejected');
assert.throws(() => buildTranslation('MAT 1:1 '), /Empty verse text/, 'empty text not rejected');
// Changing the 3 John annotation label must fail the import.
const tampered = rawSource.replace('(III John 1:15)', '(III John 1:16)');
assert.throws(() => buildTranslation(tampered), /Expected exactly one/, 'annotation syntax change not rejected');
check('2b. malformed/duplicate/invalid/empty/annotation failures', true);

// 3. JSON/JS equality and deterministic --check
{
  const json = read('data/delitzsch.json');
  const js = read('data/delitzsch.js').replace(/\r\n/g, '\n');
  assert.equal(js, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch']=${JSON.stringify(JSON.parse(json), null, 2)};\n`);
  const out = execFileSync(process.execPath, ['build/import-delitzsch.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /--check OK/);
  check('3. JSON/JS equality and deterministic --check', true);
}

// 4. named reference checks
for (const [id, ch, v, re] of [['MAT', 1, 1, /^ספר/], ['JHN', 1, 1, /בראשית היה הדבר/], ['ACT', 3, 15, /שר החיים/], ['ROM', 8, 1, /אין אשמה/], ['REV', 22, 21, /חסד.*המשיח/]]) {
  assert.match(data.books[id][ch - 1][v - 1], re, `${id} ${ch}:${v}`);
}
check('4. Matthew 1:1, John 1:1, Acts 3:15, Romans 8:1, Revelation 22:21', true);

// 5. Unicode: consonants/final forms/sof pasuq only, zero niqqud, zero U+FFFD
{
  const NIQQUD = /[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/;
  let sofPasup = 0;
  for (const id of Object.keys(data.books)) {
    for (const chapter of data.books[id]) {
      if (!Array.isArray(chapter)) continue;
      for (const text of chapter) {
        if (!text) continue;
        assert(!NIQQUD.test(text), `niqqud in ${id}`);
        assert(!text.includes('\uFFFD'), `U+FFFD in ${id}`);
        if (text.includes('\u05C3')) sofPasup++;
      }
    }
  }
  assert(sofPasup > 7000, 'expected sof pasuq punctuation in verse bodies');
  check('5. Unicode/punctuation and zero niqqud in verse bodies', true);
}

// 6. Romans 14/16 and 3 John note-only metadata
assert.equal(data.books.ROM[13].length, 23);
assert.equal(data.books.ROM[15].length, 27);
assert(data.books.ROM[15][23]);
const note = data.verseMetadata['3JN'][1][15];
assert.equal(note.status, 'note');
assert.match(note.note, /publisher annotation/);
assert(!JSON.stringify(data.books['3JN']).includes(note.text), 'note text must not be indexed as main text');
check('6. Romans 14/16 placement and 3 John note-only metadata', true);

// 7. reference parsing through the app's own ReferenceParser
{
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read('data/canon.js') + read('data/locales/en.js'), sandbox);
  vm.runInContext(read('app.js').split('(() => {')[0] + '\nthis.Parser = ReferenceParser; this.Availability = VerseAvailability;', sandbox);
  const { Parser, Availability, window: w } = sandbox;
  const parser = new Parser(w.MARANATHA_CANON, w.MARANATHA_LOCALE_EN, () => ({ delitzsch: data }));
  assert.equal(parser.parseMulti('Jn 1:1')[0].bookId, 'JHN');
  assert.equal(parser.parseMulti('Acts 3:15')[0].ranges[0].start, 15);
  assert.equal(parser.parseMulti('Rom 8:1')[0].bookId, 'ROM');
  const three = parser.parseMulti('3 Jn 1:15')[0];
  assert.equal(three.bookId, '3JN');
  assert.equal(three.ranges[0].start, 15);
  assert.equal(Availability.cell(data, '3JN', 1, 15).state, 'note');
  assert.equal(Availability.cell(data, '3JN', 1, 15).text, note.text);
  check('7. Jn 1:1, Acts 3:15, Rom 8:1 and 3 Jn 1:15 parsing (Rom alias added)', true);
}

// 13. service-worker routing for data/delitzsch.js
{
  const swSrc = read('service-worker.js');
  const fnSrc = swSrc.match(/function isTranslationFile[\s\S]*?\n\}/)[0];
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fnSrc + '\nthis.f = isTranslationFile;', sandbox);
  assert(sandbox.f('/data/delitzsch.js') === true);
  assert(sandbox.f('/data/canon.js') === false);
  assert(/CACHE_VERSION\s*=\s*'v55'/.test(swSrc));
  check('13. service-worker routes delitzsch and shell version bumped', true);
}

// ---------------------------------------------------------------------------
// Part B: real file:// app behavior
// ---------------------------------------------------------------------------
function installBlockers(window) {
  window.__remoteRequests = [];
  window.fetch = (...args) => { window.__remoteRequests.push(String(args[0])); throw new Error('fetch blocked'); };
  window.XMLHttpRequest = class { open(method, url) { window.__remoteRequests.push(String(url)); throw new Error('xhr blocked'); } };
  window.navigator.sendBeacon = (...args) => { window.__remoteRequests.push(String(args[0])); return false; };
}

async function openApp({ narrow = false } = {}) {
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      installBlockers(window);
    },
  });
  const { window } = dom;
  await new Promise((r) => { if (window.document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  return dom;
}
function setGroupEdition(w, id) {
  const sel = w.document.querySelector('#edition-delitzsch');
  sel.value = id;
  sel.dispatchEvent(new w.Event('change'));
}
function toggleTranslation(w, id, on = true) {
  if (id === 'delitzsch' || id === 'delitzsch1901') {
    setGroupEdition(w, id);
    const box = w.document.querySelector('#translation-group-delitzsch');
    box.checked = on;
    box.dispatchEvent(new w.Event('change'));
    return;
  }
  const box = w.document.querySelector(`#translations input[value="${id}"]`);
  box.checked = on;
  box.dispatchEvent(new w.Event('change'));
}
function goRef(w, ref) {
  w.document.querySelector('#reference').value = ref;
  w.document.querySelector('#reference-go').click();
}
function setLayout(w, value) {
  const el = w.document.querySelector('#layout');
  el.value = value;
  el.dispatchEvent(new w.Event('change'));
}
function setScript(w, value) {
  // The Hebrew-script control is a multi-checkbox picker (#hebrew-scripts);
  // select exactly one script for these tests.
  const picker = w.document.querySelector('#hebrew-scripts');
  picker.querySelectorAll('input').forEach(box => { box.checked = box.value === value; });
  picker.querySelector('input').dispatchEvent(new w.Event('change', { bubbles: true }));
}

// --- desktop -----------------------------------------------------------------
{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;

  // 8. lazy local-script loading
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch, undefined, 'delitzsch must not be loaded up front');
  assert(![...d.querySelectorAll('script[src]')].some((s) => /delitzsch\.js/.test(s.src)), 'no eager delitzsch script tag');
  toggleTranslation(w, 'delitzsch', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch);
  assert([...d.querySelectorAll('script[src]')].some((s) => /data\/delitzsch\.js/.test(s.src)), 'delitzsch loaded via a local script tag');
  const delitzschOption = d.querySelector('#translation-group-delitzsch').closest('.translation-option');
  assert.equal(delitzschOption.querySelector('.translation-source summary')?.textContent, 'Source');
  const desc = delitzschOption.querySelector('.translation-source p').textContent;
  assert.match(desc, /first published in 1877/);
  assert.match(desc, /does not identify its underlying print edition/);
  assert(!delitzschOption.querySelector('.translation-warning'), 'delitzsch must not show the Under audit warning');
  check('8. lazy local-script loading, translation switching and source disclosure', true);

  // browse John 1 (both web and delitzsch selected)
  goRef(w, 'John 1');
  assert.equal(d.querySelector('#message').textContent, '');
  let heb = d.querySelector('.hebrew-verse');
  assert(heb, 'delitzsch should render Hebrew verses');
  assert.equal(heb.dir, 'rtl');
  assert.equal(heb.lang, 'he');
  assert.match(heb.textContent, /בראשית היה הדבר/);

  // 9. layouts and context toggles
  for (const layout of ['multicolumn', 'multirow']) {
    setLayout(w, layout);
    assert(d.querySelector('.hebrew-verse'), `${layout}: hebrew verse missing`);
    assert.equal(d.querySelector('.hebrew-verse').dir, 'rtl');
  }
  setLayout(w, 'multicolumn');
  goRef(w, 'John 1:1');
  d.querySelector('#context-toggle').click();
  assert(d.querySelectorAll('.hebrew-verse').length > 1, 'context should show surrounding verses');
  d.querySelector('#context-toggle').click();
  check('9. desktop layouts and context toggles', true);

  // 10. navigation, named references, comparison panel, search
  goRef(w, 'Rom 8:1');
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /8:1/);
  assert.match(d.querySelector('#results').textContent, /אין אשמה/);
  goRef(w, 'Rev 22:21');
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /22:21/);

  // 3 John note-only rendering
  goRef(w, '3 Jn 1');
  assert.equal(d.querySelector('#message').textContent, '');
  const noteEls = [...d.querySelectorAll('.verse-source-note')].map((n) => n.textContent).join(' ');
  assert.match(noteEls, /source note/i);
  assert.match(d.querySelector('#results').textContent, /שלום לך הרעים/);
  assert.equal(d.querySelectorAll('.mobile-verse').length, 0);

  // search in delitzsch
  const searchSel = d.querySelector('#search-translation');
  assert([...searchSel.options].some((o) => o.value === 'delitzsch'), 'delitzsch should be a search source');
  searchSel.value = 'delitzsch';
  d.querySelector('#search').value = 'המשיח';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'delitzsch search should find matches');
  assert(d.querySelector('.search-text.hebrew-verse'), 'search text should be styled Hebrew');
  assert(d.querySelector('.search-text mark'), 'search should highlight the query');
  // comparison panel from a delitzsch hit shows other loaded translations
  d.querySelector('.compare-toggle').click();
  assert(d.querySelector('.compare-panel'), 'comparison panel should open');
  check('10. navigation, search, highlighting, comparison panel and 3 John note rendering', true);

  // combining-mark highlighting (shared renderer) using an in-memory fixture
  {
    const web = w.MARANATHA_TRANSLATIONS.web;
    const original = web.books.MAT[0][0];
    web.books.MAT[0][0] = 'חֲנ֥וֹךְ';
    searchSel.value = 'web';
    d.querySelector('#search').value = 'חנוכ';
    d.querySelector('#search-go').click();
    const hit = [...d.querySelectorAll('.search-hit')].find((h) => /Matthew 1:1/.test(h.querySelector('.search-ref').textContent));
    assert(hit, 'fixture hit not found');
    assert.equal(hit.querySelector('.search-text mark').textContent, 'חֲנ֥וֹךְ', 'trailing combining mark must stay inside the highlight');
    web.books.MAT[0][0] = original;
    check('5b. combining-mark highlighting preserves trailing marks', true);
  }

  // 11. Delitzsch unaffected by the OT Paleo/Proto display choice
  toggleTranslation(w, 'he', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.he);
  goRef(w, 'John 1');
  for (const script of ['paleo', 'proto']) {
    setScript(w, script);
    const el = d.querySelector('.hebrew-verse');
    assert(el && !el.classList.contains('paleo-hebrew') && !el.classList.contains('proto-sinaitic'), `delitzsch changed under ${script}`);
    assert.match(el.textContent, /בראשית היה הדבר/);
    assert.equal(el.lang, 'he');
  }
  // ...while the OSHB OT still converts under the same setting
  setScript(w, 'paleo');
  goRef(w, 'Genesis 1:1');
  assert(d.querySelector('.paleo-hebrew'), 'OSHB OT should still convert');
  setScript(w, 'square');
  check('11. Delitzsch stays square while OSHB OT converts under Paleo/Proto', true);

  // 8b. OT placeholder for the NT-only translation
  goRef(w, 'Genesis 1');
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /not available in this translation/);
  check('8b. OT books show a placeholder for the NT-only translation', true);

  // 12. no remote requests during any of the above
  assert.deepEqual(w.__remoteRequests, [], `remote requests attempted: ${w.__remoteRequests.join(', ')}`);
  assert(![...d.querySelectorAll('script[src],link[href],img[src]')].some((el) => /^https?:/i.test(el.src || el.href || '')), 'remote asset referenced');
  check('12. file:// runs with remote requests blocked', true);

  dom.window.close();
}

// --- mobile ------------------------------------------------------------------
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  toggleTranslation(w, 'delitzsch', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch);
  goRef(w, 'John 1:1');
  assert(d.querySelector('.mobile-verse'), 'mobile cards expected');
  const mobileHeb = d.querySelector('.mobile-verse .hebrew-verse');
  assert(mobileHeb && mobileHeb.dir === 'rtl' && mobileHeb.lang === 'he');
  assert.match(mobileHeb.textContent, /בראשית היה הדבר/);
  // whole-chapter 3 John includes the note-only verse 15
  goRef(w, '3 Jn 1');
  assert.equal(d.querySelectorAll('.mobile-verse').length, 15);
  assert.match(d.querySelector('#results').textContent, /שלום לך הרעים/);
  // context toggle adds ±3 verses
  goRef(w, 'John 1:1');
  d.querySelector('#context-toggle').click();
  assert(d.querySelectorAll('.mobile-verse').length > 1);
  d.querySelector('#context-toggle').click();
  assert.deepEqual(w.__remoteRequests, []);
  check('mobile reading view, 3 John note and context toggles', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Delitzsch checks passed.`);
process.exit(failed ? 1 : 0);
