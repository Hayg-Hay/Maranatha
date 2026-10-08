// test-vulgata-clementina.mjs
//
// Regression suite for the Latin Clementine Vulgate (1598, eBible latVUC).
//
//   node build/test-vulgata-clementina.mjs

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  parseVulgata, loadAndBuild, EXPECTED_BOOKS, EXPECTED_CHAPTERS, EXPECTED_VERSES,
  EXPECTED_NOTES, CANON_IDS, SOURCE_SHA256,
} from './import-vulgata-clementina.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(25);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Part A: source-aware import fidelity
// ---------------------------------------------------------------------------
const { translation, parsed } = loadAndBuild();
const data = JSON.parse(read('data/vulc.json'));
const jsonText = read('data/vulc.json');
const jsText = read('data/vulc.js').replace(/\r\n/g, '\n');

// 1. full source-to-output fidelity
assert.deepEqual(data.books, translation.books, 'data.books differs from the source-derived import');
assert.deepEqual(data.headings, translation.headings, 'data.headings differs from the import');
assert.equal(data.nativeVersification, true);
assert.equal(data.language, 'la');
assert.equal(data.short, 'VULC');
assert.equal(data.label, 'Vulgata Clementina (1598)');

// 2. independent coverage + counts
assert.equal(parsed.counts.books, EXPECTED_BOOKS);
assert.equal(parsed.counts.chapters, EXPECTED_CHAPTERS);
assert.equal(parsed.counts.verses, EXPECTED_VERSES);
assert.equal(parsed.counts.notes, EXPECTED_NOTES);
assert.deepEqual(Object.keys(data.books).length, EXPECTED_BOOKS);
assert.deepEqual(new Set(Object.keys(data.books)), CANON_IDS);
assert.equal(Object.values(data.books).reduce((n, c) => n + c.length, 0), EXPECTED_CHAPTERS);
assert.equal(Object.values(data.books).reduce((n, cs) => n + cs.reduce((m, c) => m + c.length, 0), 0), EXPECTED_VERSES);
check('1. full source-to-output fidelity (books, chapters, verses, headings)', true);

// 3. Unicode fidelity, native labels, commentary exclusion
{
  let verses = 0;
  for (const id of Object.keys(data.books)) {
    for (const chapter of data.books[id]) {
      assert(Array.isArray(chapter), `${id} chapter not an array`);
      for (const text of chapter) {
        verses += 1;
        assert(!text.includes('\uFFFD'), `U+FFFD in ${id}`);
        assert(!text.includes('<') && !text.includes('>'), `markup leaked into ${id}: ${text.slice(0, 40)}`);
        assert(!/BEDA|ALCUIN|GLOSSA|AUG\.|HIERON|CASSIOD/.test(text), `Glossa commentary leaked into ${id}`);
      }
    }
  }
  assert.equal(verses, EXPECTED_VERSES);
  assert(data.books.GEN[0][0].includes('cælum'), 'Latin orthography (æ) preserved');
  assert(data.books.PSA[22][0].includes('Domini est terra'), 'Psalm 23 Latin preserved');
  assert(data.books.JHN[0][0].includes('In principio erat Verbum'), 'John 1:1 Latin preserved');
  check('2. Unicode/orthography preserved, source labels intact, commentary excluded', true);
}

// 4. source anomaly ledger
assert.equal(parsed.inventory.nonIntegerLabels.length, 0);
assert.equal(parsed.inventory.sequenceErrors.length, 0);
assert.equal(parsed.inventory.unnumbered.length, 0);
assert.equal(parsed.inventory.duplicateRefs.length, 0);
{
  let open = 0, close = 0;
  for (const id of Object.keys(data.books)) for (const ch of data.books[id]) for (const t of ch) {
    for (const c of t) { if (c === '[') open++; if (c === ']') close++; }
  }
  assert.equal(open, close, 'Glossa square-bracket markers balanced');
}
check('3. source anomalies recorded and bounded (no gaps, no unnumbered text)', true);

// 5. targeted books and versification
assert.equal(data.books.EST.length, 16, 'Esther has 16 native chapters');
assert.equal(data.books.EST[15].length, 24, 'Esther 16 has 24 verses');
assert.equal(data.books.DAN.length, 14);
assert.equal(data.books.DAN[2].length, 100, 'Daniel 3 has 100 native verses');
assert.equal(data.books.DAN[12].length, 65, 'Daniel 13 (Susanna)');
assert.equal(data.books.DAN[13].length, 42, 'Daniel 14 (Bel and the Dragon)');
assert.equal(data.books.PSA.length, 150);
assert.equal(data.books.PSA[149].length, 6, 'Psalm 150');
assert.equal(data.books.SIR.length, 51, 'Sirach has 51 chapters');
assert.equal(data.books.EST[10].length, 12, 'Esther 11');
check('4. targeted Esther/Daniel/Psalms/Sirach native extents', true);

// 6. deterministic --check and JSON/JS equality
assert.equal(jsText, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['vulc']=${JSON.stringify(JSON.parse(jsonText), null, 2)};\n`);
{
  const out = execFileSync(process.execPath, ['build/import-vulgata-clementina.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /--check OK/);
}
assert.equal(data.sourceArchiveSha256, SOURCE_SHA256);
check('5. JSON/JS equality and deterministic importer --check', true);

// ---------------------------------------------------------------------------
// Part B: standalone parser (no DOM) — native reference handling
// ---------------------------------------------------------------------------
{
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read('data/canon.js') + read('data/locales/en.js'), sandbox);
  vm.runInContext(read('app.js').split('(() => {')[0] + '\nthis.Parser = ReferenceParser; this.Availability = VerseAvailability;', sandbox);
  const { Parser, Availability, window: w } = sandbox;

  const withVulc = new Parser(w.MARANATHA_CANON, w.MARANATHA_LOCALE_EN, () => ({ vulc: data }));
  assert.equal(withVulc.parseMulti('Esther 11:1')[0].bookId, 'EST');
  assert.equal(withVulc.parseMulti('Esther 16:24')[0].ranges[0].end, 24);
  assert.equal(withVulc.parseMulti('Daniel 3:100')[0].ranges[0].start, 100);
  assert.equal(withVulc.parseMulti('John 1:1')[0].bookId, 'JHN');
  assert.throws(() => withVulc.parseMulti('Esther 17:1'), /does not exist/);
  assert.throws(() => withVulc.parseMulti('Daniel 3:101'), /last verse 100/);
  assert.throws(() => withVulc.parseMulti('Genesis 51:1'), /does not exist/);

  // Without vulc selected, a native extra chapter must be rejected even though
  // the translation is still resident in memory (here modelled by an empty
  // selection map).
  const withoutVulc = new Parser(w.MARANATHA_CANON, w.MARANATHA_LOCALE_EN, () => ({}));
  assert.throws(() => withoutVulc.parseMulti('Esther 11:1'), /does not exist/);
  assert.equal(Availability.cell(data, 'EST', 16, 24).state, 'text');
  check('6. native extra chapters and verse extents parse; out-of-range rejected', true);
}

// ---------------------------------------------------------------------------
// Part C: real file:// app
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
function setTranslation(w, id, on) {
  const b = w.document.querySelector(`#translations input[value="${id}"]`);
  b.checked = on; b.dispatchEvent(new w.Event('change'));
}
function goRef(w, ref) { w.document.querySelector('#reference').value = ref; w.document.querySelector('#reference-go').click(); }

// 7/8. desktop: lazy load, native rendering, references, navigation, search
{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;

  assert.equal(w.MARANATHA_TRANSLATIONS.vulc, undefined);
  // Esther 1 works under web (default), with the canon 10-chapter extent.
  goRef(w, 'Esther 1');
  assert.equal(d.querySelector('#chapter').options.length, 10);

  // Lazy-load the Vulgate by checking its box.
  setTranslation(w, 'vulc', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.vulc);
  assert.equal(d.querySelector('#chapter').options.length, 16, 'chapter selector refreshed to native extent');
  assert.equal(d.querySelector('#chapter').value, '1', 'current chapter preserved across lazy load');

  // Native extra chapter reference is now valid; the Latin is rendered lang=la.
  goRef(w, 'Esther 11:1');
  assert.equal(d.querySelector('#message').textContent, '');
  const latin = d.querySelector('.latin-verse');
  assert(latin && latin.lang === 'la' && latin.dir === 'ltr');
  assert(/attulerunt Dosithæus/.test(latin.textContent));

  // John 1:1 renders Latin and copy-selectable.
  setTranslation(w, 'web', false);
  goRef(w, 'John 1:1');
  const jlatin = d.querySelector('.latin-verse');
  assert(jlatin && /In principio erat Verbum/.test(jlatin.textContent));
  const range = d.createRange();
  range.selectNodeContents(jlatin);
  assert(/In principio erat Verbum/.test(range.toString()), 'verse text is selectable/copyable');
  assert.deepEqual(w.__remoteRequests, []);
  check('7. desktop lazy load, native Latin rendering, extra chapter, selection', true);

  // Deselected-but-loaded translation must not validate a native reference.
  setTranslation(w, 'vulc', false);
  goRef(w, 'Esther 11:1');
  assert.match(d.querySelector('#message').textContent, /does not exist/);
  setTranslation(w, 'vulc', true);
  await waitFor(() => d.querySelector('#message') && d.querySelector('#message').textContent === '');
  check('8. deselected (loaded) translation is not used to validate native references', true);

  // Context view in the native block.
  goRef(w, 'John 3:16');
  const toggle = d.querySelector('.context-toggle-btn');
  assert(toggle, 'per-block context toggle present');
  toggle.click();
  assert(d.querySelectorAll('.latin-verse').length > 1, 'context expands the native block');
  assert(d.querySelector('.versification-notice'), 'native numbering notice visible');
  toggle.click();

  // Multi-translation: aligned web block and native vulc block are separate.
  setTranslation(w, 'web', true);
  goRef(w, 'John 3:1');
  assert(d.querySelectorAll('.result-head').length >= 2, 'native block separated from canon-numbered block');
  assert(d.querySelector('.versification-notice'));

  // Search in the Vulgate, then suppression of cross-edition comparison.
  const sel = d.querySelector('#search-translation');
  assert([...sel.options].some((o) => o.value === 'vulc'));
  sel.value = 'vulc';
  d.querySelector('#search').value = 'Verbum';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'search hit in Latin');
  const cmp = d.querySelector('.search-hit .compare-toggle');
  if (cmp) {
    cmp.click();
    const panel = d.querySelector('.search-hit .compare-panel');
    assert(panel && panel.querySelector('.compare-native-notice'), 'native-numbering notice shown');
    assert.equal(panel.querySelectorAll('.compare-row').length, 0, 'cross-edition rows suppressed when searching vulc');
  }

  // Search in WEB with vulc selected: unverified same-numbered Latin is suppressed.
  setTranslation(w, 'web', true);
  d.querySelector('#search-translation').value = 'web';
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  const vulcCompare = [...d.querySelectorAll('.search-hit .compare-toggle')][0];
  if (vulcCompare) {
    vulcCompare.click();
    const panel = d.querySelector('.search-hit .compare-panel');
    assert(panel && panel.querySelector('.compare-native-notice'), 'notice present when comparing to vulc');
    assert.equal(panel.querySelectorAll('.compare-native-text, .latin-verse').length, 0);
  }

  // Esther 16 -> next book (1 Maccabees, per canon order TOB JDT EST 1MA 2MA JOB).
  setTranslation(w, 'web', false);
  goRef(w, 'Esther 16');
  assert.equal(d.querySelector('#message').textContent, '');
  d.querySelector('#next-chapter-button').click();
  assert.equal(d.querySelector('#book').value, '1MA');
  assert.equal(d.querySelector('#chapter').value, '1');

  assert.deepEqual(w.__remoteRequests, []);
  check('9. context, separated native block, search, compare suppression, Esther 16 navigation', true);
  dom.window.close();
}

// 10. mobile layout
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  setTranslation(w, 'web', false);
  setTranslation(w, 'vulc', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.vulc && d.querySelector('#message').textContent === '');
  goRef(w, 'John 3:16');
  assert(d.querySelector('.mobile-verse .latin-verse'), 'mobile Latin verse missing');
  assert.deepEqual(w.__remoteRequests, []);
  check('10. mobile file:// rendering with network blocked', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Vulgata Clementina checks passed.`);
process.exit(failed ? 1 : 0);
