// test-delitzsch1901.mjs
//
// Regression suite for the vocalized Delitzsch 1901 NT.
//
//   node build/test-delitzsch1901.mjs

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { buildTranslation, NT_CANON, NAME_TO_ID, VERSIFICATION, EXPECTED_BOOKS, EXPECTED_CHAPTERS, EXPECTED_VERSES, SOURCE_DIR } from './import-delitzsch1901.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(25);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Part A: source-aware import
// ---------------------------------------------------------------------------
const raw = read('build/sources/delitzsch1901/Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt');
const corrections = new Map(JSON.parse(read('build/sources/delitzsch1901/corrections.json')).entries.map((e) => [e.ref, e]));
const { translation, stats } = buildTranslation(raw, corrections);
const data = JSON.parse(read('data/delitzsch1901.json'));

check('1. exactly 27 books / 260 chapters', Object.keys(translation.books).length === EXPECTED_BOOKS
  && Object.values(translation.books).reduce((n, c) => n + c.length, 0) === EXPECTED_CHAPTERS
  && stats.rows === EXPECTED_VERSES);
assert.deepEqual(Object.keys(translation.books).sort(), [...NT_CANON].sort());
assert.deepEqual(data.books, translation.books, 'data.books differs from source-derived import');

// 2. every reference and transformed text matches the pinned source + manifest
assert.equal(stats.corrected, corrections.size);
for (const [ref, e] of corrections) {
  const [name, cv] = [ref.replace(/ \d+:\d+$/, ''), ref.match(/(\d+):(\d+)$/).slice(1).map(Number)];
  const id = NAME_TO_ID[name];
  const out = data.books[id][cv[0] - 1][cv[1] - 1];
  assert.equal(out, e.corrected, `correction not applied at ${ref}`);
  assert.notEqual(out, e.original);
}
check('2. full source reference sets and correction fidelity', true);

// 3. niqqud preserved, no doubled marks, no stray parens, no U+FFFD
{
  const REPEAT = /([\u0591-\u05C7])\1+/;
  let verses = 0;
  for (const id of NT_CANON) {
    let balance = 0;
    for (const chapter of data.books[id]) {
      if (!Array.isArray(chapter)) continue;
      for (const text of chapter) {
        if (!text) continue;
        verses++;
        assert(/[\u0591-\u05C7]/.test(text), `missing niqqud in ${id}`);
        assert(!REPEAT.test(text), `doubled mark in ${id}: ${text}`);
        assert(!text.includes('\uFFFD'), `U+FFFD in ${id}`);
        for (const ch of text) { if (ch === '(') balance++; else if (ch === ')') balance--; }
      }
    }
    assert.equal(balance, 0, `unbalanced parens in ${id}`);
  }
  assert.equal(verses, EXPECTED_VERSES);
  check('3. niqqud preserved and reviewed anomalies corrected', true);
}

// 4. JSON/JS equality + deterministic --check
{
  const json = read('data/delitzsch1901.json');
  const js = read('data/delitzsch1901.js').replace(/\r\n/g, '\n');
  assert.equal(js, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch1901']=${JSON.stringify(JSON.parse(json), null, 2)};\n`);
  const out = execFileSync(process.execPath, ['build/import-delitzsch1901.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /--check OK/);
  check('4. JSON/JS equality and deterministic --check', true);
}

// 5. representative verses + every affected versification chapter
{
  const bare = (t) => t.replace(/\u05BE/g, ' ').replace(/[\u0591-\u05C7]/g, '');
  assert.match(bare(data.books.MAT[0][0]), /^ספר תולדת/);
  assert.match(bare(data.books.JHN[0][0]), /בראשית היה הדבר/);
  assert.match(bare(data.books.ACT[2][14]), /שר החיים/);
  assert.match(bare(data.books.ROM[7][0]), /אין אשמה/);
  assert.match(bare(data.books.REV[21][20]), /חסד.*המשיח/);
  for (const [id, chapters] of Object.entries(VERSIFICATION)) {
    for (const [ch, info] of Object.entries(chapters)) {
      assert.equal(data.books[id][Number(ch) - 1].length, info.source, `${id} ${ch} extent`);
      assert(data.versification[id][ch]);
    }
  }
  check('5. representative verses and all 7 affected versification chapters', true);
}

// 6/7. parsing through the app parser + cross-edition consonant agreement
{
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read('data/canon.js') + read('data/locales/en.js'), sandbox);
  vm.runInContext(read('app.js').split('(() => {')[0] + '\nthis.Parser = ReferenceParser; this.Availability = VerseAvailability;', sandbox);
  const { Parser, Availability, window: w } = sandbox;
  const unpointed = JSON.parse(read('data/delitzsch.json'));
  const parser = new Parser(w.MARANATHA_CANON, w.MARANATHA_LOCALE_EN, () => ({ delitzsch1901: data, delitzsch: unpointed }));
  assert.equal(parser.parseMulti('Jn 1:1')[0].bookId, 'JHN');
  assert.equal(parser.parseMulti('Acts 3:15')[0].ranges[0].start, 15);
  assert.equal(parser.parseMulti('Rom 8:1')[0].bookId, 'ROM');
  assert.equal(parser.parseMulti('3 Jn 1:15')[0].ranges[0].start, 15); // 1901 has verse 15
  assert.equal(Availability.cell(data, 'JHN', 1, 15).state, 'text');
  const bare = (t) => t.replace(/\u05BE/g, ' ').replace(/[\u0591-\u05C7]/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(bare(data.books.JHN[0][0]), bare(unpointed.books.JHN[0][0]), 'Jn 1:1 agrees across the two Delitzsch editions');
  check('6/7. Jn 1:1, Acts 3:15, Rom 8:1, 3 Jn 1:15 parsing and cross-edition agreement', true);
}

// 13. service-worker routing
{
  const swSrc = read('service-worker.js');
  const fnSrc = swSrc.match(/function isTranslationFile[\s\S]*?\n\}/)[0];
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fnSrc + '\nthis.f = isTranslationFile;', sandbox);
  assert(sandbox.f('/data/delitzsch1901.js') === true);
  assert(sandbox.f('/data/canon.js') === false);
  assert(/CACHE_VERSION\s*=\s*'v51'/.test(swSrc));
  check('13. service-worker routes delitzsch1901; shell version bumped', true);
}

// ---------------------------------------------------------------------------
// Part B: real file:// app
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
const groupBox = (w) => w.document.querySelector('#translation-group-delitzsch');
const groupOption = (w) => groupBox(w).closest('.translation-option');
function setTranslation(w, id, on) {
  if (id === 'delitzsch' || id === 'delitzsch1901') {
    const sel = w.document.querySelector('#edition-delitzsch');
    sel.value = id; sel.dispatchEvent(new w.Event('change'));
    const b = groupBox(w); b.checked = on; b.dispatchEvent(new w.Event('change'));
    return;
  }
  const b = w.document.querySelector(`#translations input[value="${id}"]`);
  b.checked = on; b.dispatchEvent(new w.Event('change'));
}
function goRef(w, ref) { w.document.querySelector('#reference').value = ref; w.document.querySelector('#reference-go').click(); }
function setScript(w, value) {
  const picker = w.document.querySelector('#hebrew-scripts');
  picker.querySelectorAll('input').forEach((box) => { box.checked = box.value === value; });
  picker.querySelector('input').dispatchEvent(new w.Event('change', { bubbles: true }));
}

{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;

  // 8 lazy loading + source disclosure
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch1901, undefined);
  setTranslation(w, 'delitzsch1901', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch1901);
  const desc = groupOption(w).querySelector('.translation-source p').textContent;
  assert.match(desc, /1901/);
  assert(!groupOption(w).querySelector('.translation-warning'));
  check('8. lazy local-script loading and source disclosure', true);

  // 9/11 browse, styling, Paleo independence
  goRef(w, 'John 3');
  assert.equal(d.querySelector('#message').textContent, '');
  const heb = d.querySelector('.hebrew-verse');
  assert(heb && heb.dir === 'rtl' && heb.lang === 'he');
  assert(/[\u0591-\u05C7]/.test(heb.textContent), 'vocalized text rendered');
  for (const script of ['paleo', 'proto']) {
    setScript(w, script);
    const h = d.querySelector('.hebrew-verse');
    assert(h && !h.classList.contains('paleo-hebrew') && !h.classList.contains('proto-sinaitic'), `delitzsch1901 changed under ${script}`);
  }
  setScript(w, 'square');
  check('9/11. desktop rendering and independence from OT Paleo/Proto', true);

  // 10 versification disclosure: John 1 is a mismatch chapter; web + delitzsch1901
  goRef(w, 'John 1');
  assert(d.querySelector('.versification-notice'), 'versification notice missing');
  assert.match(d.querySelector('.versification-notice').textContent, /different verse numbering/);
  assert(d.querySelectorAll('.result-head').length >= 2, 'expected a separate block for the mismatched edition');
  // A non-mismatch chapter is one aligned block, no notice.
  goRef(w, 'John 3');
  assert(!d.querySelector('.versification-notice'));
  // 2 Thess 3 mismatch: source 19, canon 18; reference to 3:19 must parse.
  goRef(w, '2 Thess 3:19');
  assert.equal(d.querySelector('#message').textContent, '');
  assert(d.querySelector('.versification-notice'));
  assert.match(d.querySelector('#results').textContent, /3:19/);
  // Rom 8:1 parses and renders (no mismatch chapter)
  goRef(w, 'Rom 8:1');
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /8:1/);
  assert(!d.querySelector('.versification-notice'));
  check('10. versification mismatch chapter is disclosed and separated; aligned chapters are not', true);

  // context toggle
  goRef(w, 'John 3:16');
  d.querySelector('#context-toggle').click();
  assert(d.querySelectorAll('.hebrew-verse').length > 1);
  d.querySelector('#context-toggle').click();

  // search with and without vowels
  const searchSel = d.querySelector('#search-translation');
  assert([...searchSel.options].some((o) => o.value === 'delitzsch1901'));
  searchSel.value = 'delitzsch1901';
  d.querySelector('#search').value = 'המשיח';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'search (unpointed query) should match vocalized text');
  assert(d.querySelector('.search-text.hebrew-verse mark'));
  d.querySelector('#search').value = 'הַמָּשִׁיחַ';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'search (pointed query) should match too');
  // comparison panel
  d.querySelector('.compare-toggle')?.click();
  check('10b. search with/without vowels and comparison panel', !!d.querySelector('.search-hit'));

  // 12 remote blocked
  assert.deepEqual(w.__remoteRequests, []);
  check('12. file:// with remote requests blocked', true);
  dom.window.close();
}

// 9c/10c mobile + interlinear caption
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  setTranslation(w, 'web', false);
  setTranslation(w, 'delitzsch1901', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'John 3:16');
  assert(d.querySelector('.mobile-verse .hebrew-verse'), 'mobile card Hebrew missing');
  // interlinear caption uses the first selected translation
  const il = d.querySelector('#interlinear');
  il.checked = true; il.dispatchEvent(new w.Event('change'));
  await waitFor(() => d.querySelector('.interlinear-caption'));
  const caption = d.querySelector('.interlinear-caption');
  assert(caption.classList.contains('hebrew-verse'), 'interlinear caption should be styled Hebrew');
  assert(caption.dir === 'rtl');
  assert.deepEqual(w.__remoteRequests, []);
  check('9c/10c. mobile layout and vocalized interlinear caption', true);
  dom.window.close();
}

// 10d OT placeholder for the NT-only translation
{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;
  setTranslation(w, 'web', false);
  setTranslation(w, 'delitzsch1901', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'Genesis 1');
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /not available in this translation/);
  check('10d. OT books show a placeholder', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Delitzsch 1901 checks passed.`);
process.exit(failed ? 1 : 0);
