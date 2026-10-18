// test-bohairica.mjs
//
// Dedicated regression suite for Bohairica 1.2 (eBible copbhc), the
// Horner-based standardized Bohairic Coptic New Testament.
//
//   node build/test-bohairica.mjs
//
// Part A  generated-data invariants, locale, font/CSS and import contract
// Part B  real file:// desktop app: lazy load, aliases/native scope, gaps,
//         placeholders, independent comparison blocks, search guards, copy
// Part C  mobile rendering, gap/placeholder, comparison and parallel pane
// Part D  Coptic search normalization (combining marks, case, distinct letters)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const sha = (name) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, name))).digest('hex');
const results = [];
const check = (name, ok = true, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(fn, timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch {}
    await sleep(25);
  }
  return false;
}

const data = JSON.parse(read('data/bohairica.json'));
const locale = JSON.parse(read('data/locales/cop.json'));
const en = JSON.parse(read('data/locales/en.json'));
const NT_IDS = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');

// ---------------------------------------------------------------------------
// Part A: data, locale and deterministic build
// ---------------------------------------------------------------------------
assert.equal(data.id, 'bohairica');
assert.equal(data.short, 'BOH');
assert.equal(data.language, 'cop');
assert.equal(data.dialect, 'Bohairic');
assert.equal(data.direction, 'ltr');
assert.equal(data.scope, 'NT');
assert.equal(data.nativeVersification, true);
assert.equal(data.nativeReferenceScope, true);
assert.equal(data.collapseSourceAnnotations, true);
assert.match(data.license, /Public Domain/);
assert.match(data.sourceEdition, /Bohairica 1\.2/);
assert.match(data.sourceEdition, /Horner/);
assert.deepEqual(Object.keys(data.books), NT_IDS);
assert.equal(data.books.GEN, undefined);
assert.equal(data.sourceInventory.books, 27);
assert.equal(data.sourceInventory.chapters, 260);
assert.equal(data.sourceInventory.records, 7956);
assert.equal(data.sourceInventory.numberedPositions, 7957);
assert.deepEqual(data.sourceInventory.gaps, ['ACT.24.7']);
assert.deepEqual(data.sourceInventory.placeholders, ['MRK.9.44', 'MRK.9.46', 'LUK.17.36', 'ACT.8.37', 'ACT.28.29', 'REV.12.18']);
assert.equal(data.sourceInventory.footnotes, 0);
assert.equal(data.sourceInventory.sectionHeadings, 0);
assert.equal(data.books.ACT[23][6], '', 'Acts 24:7 is the indexed empty source gap');
assert.equal(data.verseMetadata.ACT[24][7].status, 'source-gap');
assert.equal(data.books['3JN'][0].length, 15, '3 John has 15 native verses');
assert.equal(data.books.MRK[15].length, 20, 'Mark 16 has 20 native verses');
assert.equal(data.books.JHN[6].length, 53, 'John 7 has 53 native verses');
assert.equal(data.books.JHN[7].length, 59, 'John 8 has 59 native verses');
assert.equal(data.books.ACT[18].length, 40, 'Acts 19 ends at source verse 40 (combined final unit)');
assert.equal(data.books.ROM[13].length, 23, 'Romans 14 ends at source verse 23');
assert.equal(data.books['2CO'][12].length, 13, '2 Corinthians 13 ends at source verse 13');
assert.equal(data.books.REV[11].length, 18, 'Revelation 12 has 18 source records');
assert.equal(data.books.REV[11][17], '[ ]', 'Revelation 12:18 is the exact source marker');
for (const ref of ['MRK.9.44', 'MRK.9.46', 'LUK.17.36', 'ACT.8.37', 'ACT.28.29', 'REV.12.18']) {
  const [id, chapter, verse] = ref.split('.');
  const meta = data.verseMetadata[id][chapter][verse];
  assert.equal(meta.status, 'source-placeholder');
  assert.equal(meta.text, '[ ]');
  assert.match(meta.note, /no text was supplied or inferred/i);
  assert.equal(data.books[id][Number(chapter) - 1][Number(verse) - 1], '[ ]');
}
// No other bracket-only record may silently become a placeholder.
for (const [id, chapters] of Object.entries(data.books)) {
  chapters.forEach((verses, ci) => verses.forEach((text, vi) => {
    if (/^\[[^\]]*\]$/.test(text)) assert(data.verseMetadata?.[id]?.[ci + 1]?.[vi + 1]?.status === 'source-placeholder', `untagged placeholder ${id} ${ci + 1}:${vi + 1}`);
  }));
}
// Five source-character artifacts are retained exactly, never "corrected".
const sourceArtifacts = [];
for (const [id, chapters] of Object.entries(data.books)) {
  chapters.forEach((verses, ci) => verses.forEach((text, vi) => {
    if (text.includes(']-')) sourceArtifacts.push(`${id}.${ci + 1}.${vi + 1}`);
  }));
}
assert.deepEqual(sourceArtifacts, ['MRK.6.48', 'JHN.13.3', '2TI.2.25', 'REV.4.9', 'REV.13.2']);
const matches = read('data/bohairica.js').replace(/\r\n/g, '\n');
const jsPrefix = 'window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.bohairica=';
assert(matches.startsWith(jsPrefix), 'bohairica.js uses the local translation global');
assert.deepEqual(JSON.parse(matches.slice(jsPrefix.length).replace(/;\n$/, '')), data, 'bohairica.js and bohairica.json agree');
const localeJs = read('data/locales/cop.js').replace(/\r\n/g, '\n');
const localePrefix = 'window.MARANATHA_LOCALE_COP=';
assert(localeJs.startsWith(localePrefix));
assert.deepEqual(JSON.parse(localeJs.slice(localePrefix.length).replace(/;\n$/, '')), locale, 'cop.js and cop.json agree');
check('A1. data identity, 27/260/7956/7957 inventory, gap, 6 placeholders, native shapes, JSON/JS twins');

assert.equal(locale.language, 'cop');
assert.match(locale.label, /Coptic \(Bohairic book names\)/);
assert.deepEqual(locale.testaments, en.testaments, 'testament labels retain English');
assert.equal(Object.keys(locale.books).length, 73);
let differing = 0;
for (const id of Object.keys(en.books)) {
  if (JSON.stringify(locale.books[id]) !== JSON.stringify(en.books[id])) differing++;
}
assert.equal(differing, 27, 'only the 27 NT book labels differ from English');
for (const id of NT_IDS) {
  assert.equal(locale.books[id].name, data.bookMetadata[id].toc2, `${id} Coptic name comes from toc2`);
  const expectedAliases = [...new Set([data.bookMetadata[id].h, data.bookMetadata[id].toc1])].filter((name) => name && name !== data.bookMetadata[id].toc2);
  assert.deepEqual(locale.books[id].aliases, expectedAliases, `${id} Coptic aliases come from USFM titles`);
}
for (const id of Object.keys(en.books)) {
  if (!NT_IDS.includes(id)) assert.deepEqual(locale.books[id], en.books[id], `${id} OT label remains English`);
}
assert(locale.books.GEN.name === 'Genesis' && locale.books.PSA.name === 'Psalms');
check('A2. locale: 27 Coptic NT names/aliases, 46 English OT names, English testament labels');

const css = read('style.css');
assert.match(css, /@font-face\s*\{\s*font-family:\s*'Noto Sans Coptic'/, 'local Coptic @font-face');
assert.match(css, /\.coptic-verse\s*\{[^}]*font-family:\s*'Noto Sans Coptic'/, 'Coptic verse uses the local face');
assert.match(css, /\.coptic-verse\s*\{[^}]*direction:\s*ltr/, 'Coptic verse is LTR');
assert.match(css, /\.coptic-verse\s*\{[^}]*white-space:\s*pre-wrap/, 'Coptic verse preserves source spacing/wrapping');
assert.match(css, /body\s*\{[^}]*'Noto Sans Coptic'/, 'general fallback includes Coptic for book names');
assert(fs.existsSync(path.join(ROOT, 'fonts/NotoSansCoptic-Regular.ttf')), 'font exists');
assert(fs.statSync(path.join(ROOT, 'fonts/NotoSansCoptic-Regular.ttf')).size > 10000, 'font is not a stub');
assert.match(read('fonts/NotoSansCoptic-OFL.txt'), /SIL Open Font License, Version 1\.1/);
const sw = read('service-worker.js');
assert(Number(sw.match(/const CACHE_VERSION\s*=\s*'v(\d+)'/)?.[1]) >= 67);
assert.match(sw, /DATA_CACHE_VERSION\s*=\s*'v3'/);
assert(sw.includes("'./data/locales/cop.js'"), 'Coptic locale precached in shell');
assert(sw.includes("'./fonts/NotoSansCoptic-Regular.ttf'"), 'Coptic font precached in shell');
const shellList = (sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/) || [])[1] || '';
assert(!/bohairica/.test(shellList), 'large Coptic translation is not shell-precached');
check('A3. local OFL font/CSS, current shell, data cache v3, locale/font precache, lazy translation');

const before = [sha('data/bohairica.json'), sha('data/bohairica.js'), sha('data/locales/cop.json'), sha('data/locales/cop.js')];
const output = execFileSync(process.execPath, ['build/import-bohairica.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
assert.match(output, /Bohairica: \{/);
const after = [sha('data/bohairica.json'), sha('data/bohairica.js'), sha('data/locales/cop.json'), sha('data/locales/cop.js')];
assert.deepEqual(after, before, '--check does not mutate generated files');
check('A4. non-mutating deterministic --check');

// ---------------------------------------------------------------------------
// Part B/C helpers: real file:// application
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
      window.MARANATHA_ENABLE_TEST_HOOKS = true;
      window.matchMedia = (query) => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      installBlockers(window);
    },
  });
  const { window } = dom;
  await new Promise((resolve) => { if (window.document.readyState === 'complete') resolve(); else window.addEventListener('load', resolve); });
  return dom;
}
const setTranslation = (w, id, on) => {
  const box = w.document.querySelector(`#translations input[value="${id}"]`);
  assert(box, `translation checkbox ${id}`);
  box.checked = on;
  box.dispatchEvent(new w.Event('change'));
};
const change = (w, selector, value) => {
  const el = typeof selector === 'string' ? w.document.querySelector(selector) : selector;
  assert(el, `control ${selector}`);
  el.value = value;
  el.dispatchEvent(new w.Event('change'));
};
const goRef = (w, reference) => {
  const input = w.document.querySelector('#reference');
  input.value = reference;
  w.document.querySelector('#reference-go').click();
};
const message = (w) => w.document.querySelector('#message').textContent;
const scriptureText = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.verse-source-note, .source-note-label').forEach((n) => n.remove());
  return clone.textContent;
};
const isNT = (bookId) => NT_IDS.includes(bookId);

{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;
  assert.equal(w.MARANATHA_TRANSLATIONS.bohairica, undefined, 'Bohairica is lazy-loaded');
  assert([...d.querySelectorAll('#language option')].some((o) => o.value === 'cop'), 'Coptic locale is selectable');
  change(w, '#language', 'cop');
  assert.equal(d.querySelector(`#book option[value="MAT"]`).textContent, data.bookMetadata.MAT.toc2, 'Coptic book name in selector');
  assert.equal(d.querySelector(`#book option[value="GEN"]`).textContent, 'Genesis', 'OT selector name remains English');
  setTranslation(w, 'web', false);
  setTranslation(w, 'bohairica', true);
  assert(await waitFor(() => w.MARANATHA_TRANSLATIONS.bohairica), 'desktop Coptic data loads lazily');
  goRef(w, 'John 3:16');
  assert(await waitFor(() => d.querySelector('.coptic-verse')), 'desktop Coptic verse renders');
  const first = d.querySelector('.coptic-verse');
  assert.equal(first.lang, 'cop');
  assert.equal(first.dir, 'ltr');
  assert(w.getComputedStyle(first).fontFamily.includes('Noto Sans Coptic'));
  check('B1. desktop lazy load: Coptic locale names, lang=cop LTR local font');

  // English and Coptic reference forms both resolve in the Coptic locale.
  goRef(w, 'John 3:16');
  assert.equal(message(w), '');
  assert.equal(scriptureText(d.querySelector('.coptic-verse')), data.books.JHN[2][15]);
  goRef(w, `${data.bookMetadata.JHN.toc2} 3:16`);
  assert.equal(message(w), '', 'Coptic toc2 reference');
  assert.equal(scriptureText(d.querySelector('.coptic-verse')), data.books.JHN[2][15]);
  goRef(w, `${data.bookMetadata.JHN.toc1} 3:16`);
  assert.equal(message(w), '', 'Coptic toc1 alias reference');
  assert.equal(scriptureText(d.querySelector('.coptic-verse')), data.books.JHN[2][15]);
  goRef(w, `${data.bookMetadata.JHN.h} 3:16`);
  assert.equal(message(w), '', 'Coptic short-title reference');
  // Coptic names are accepted even when the UI language is English.
  change(w, '#language', 'en');
  goRef(w, `${data.bookMetadata.JHN.toc2} 3:16`);
  assert.equal(message(w), '', 'Coptic reference accepted in the English UI');
  assert.equal(scriptureText(d.querySelector('.coptic-verse')), data.books.JHN[2][15]);
  change(w, '#language', 'cop');
  check('B2. English and Coptic reference names/aliases resolve in both locales');

  // Native extent, gap and placeholders.
  goRef(w, '3 John 1:15');
  assert.equal(message(w), '');
  assert.equal(scriptureText(d.querySelector('.coptic-verse')), data.books['3JN'][0][14]);
  goRef(w, '3 John 1:16');
  assert.match(message(w), /not a reference available/i, '3 John native 15-verse bound');
  goRef(w, 'Acts 24:7');
  const gap = d.querySelector('.verse-source-gap');
  assert(gap, 'Acts 24:7 gap notice');
  assert.match(gap.textContent, /no separately indexed text/i);
  assert.match(gap.textContent, /No wording has been supplied/i);
  for (const ref of ['Mark 9:44', 'Luke 17:36', 'Acts 8:37', 'Revelation 12:18']) {
    goRef(w, ref);
    const placeholder = d.querySelector('.verse-source-placeholder');
    assert(placeholder, `${ref} placeholder rendered`);
    assert(scriptureText(placeholder) === '[ ]', `${ref} exact bracketed marker`);
    assert(/no text was supplied or inferred/i.test(placeholder.textContent), `${ref} authored placeholder notice`);
    assert(!/\bfootnote\b/i.test(placeholder.textContent), `${ref} notice is not a source footnote`);
  }
  goRef(w, 'Genesis 1:1');
  assert.equal(message(w), '');
  assert(!d.querySelector('.coptic-verse'), 'no Coptic OT text');
  assert.match(d.querySelector('.verse-placeholder').textContent, /not available in this translation/i);
  goRef(w, 'Genesis 51:1');
  assert.match(message(w), /not a reference available|does not exist/i, 'canon chapter bound still refuses Genesis 51');
  change(w, '#book', '3JN');
  assert.equal(d.querySelector('#chapter').options.length, 1, 'sole Bohairica 3 John has one chapter');
  change(w, '#book', 'MRK');
  assert.equal(d.querySelector('#chapter').options.length, 16, 'sole Bohairica Mark has 16 chapters');
  check('B3. native 15-verse/16-chapter bounds, Acts gap, six placeholders, OT unavailable');

  // Independent comparison blocks in every desktop layout.
  setTranslation(w, 'web', true);
  goRef(w, 'John 3:16');
  change(w, '#layout', 'multicolumn');
  assert.equal(d.querySelectorAll('.comparison-table-columns').length, 2, 'two separate multi-column blocks');
  let tables = [...d.querySelectorAll('.comparison-table-columns')];
  assert.equal(tables[0].querySelectorAll('thead th').length, 2, 'one verse + one translation per block');
  assert.equal(tables[1].querySelectorAll('thead th').length, 2, 'one verse + one translation per block');
  assert.equal(tables[0].querySelectorAll('.coptic-verse').length + tables[1].querySelectorAll('.coptic-verse').length, 1, 'Coptic text appears only in its own block');
  assert([...d.querySelectorAll('.versification-notice')].some((n) => /own native verse numbering/i.test(n.textContent)));
  change(w, '#layout', 'multirow');
  assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, 'two separate multi-row blocks');
  assert.equal(d.querySelectorAll('.reference').length >= 3, true, 'separate reference rows rendered');
  change(w, '#layout', 'auto');
  check('B4. desktop comparison: separate multi-column and multi-row blocks with native notice');

  // Search guards in both directions.
  change(w, '#search-translation', 'bohairica');
  d.querySelector('#search').value = data.books.MAT[0][0].split(' ')[0];
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'Bohairica search returns hits');
  assert([...d.querySelectorAll('.search-hit')].every((hit) => hit.querySelector('.search-text')), 'search hits carry Coptic text');
  const expectedRef = `${data.bookMetadata.MAT.toc2} 1:1`;
  const firstHit = [...d.querySelectorAll('.search-hit')].find((hit) => hit.querySelector('.search-ref').textContent === expectedRef);
  assert(firstHit, 'Matthew 1:1 appears among the search hits');
  assert.equal(firstHit.querySelector('.search-text').textContent, data.books.MAT[0][0], 'search hit keeps exact source text');
  assert(firstHit.querySelector('mark'), 'search hit has a highlighted match');
  const range = d.createRange();
  range.selectNodeContents(firstHit.querySelector('.search-text'));
  assert.equal(range.toString(), data.books.MAT[0][0], 'selectable/copyable search text is exact');
  let toggle = firstHit.querySelector('.compare-toggle');
  assert(toggle, 'Bohairica search has a comparison control');
  toggle.click();
  let panel = firstHit.querySelector('.compare-panel');
  assert(panel.querySelector('.compare-native-notice'), 'Coptic search suppresses same-numbered comparison');
  assert.equal(panel.querySelectorAll('.compare-row').length, 0);
  assert.equal(panel.querySelectorAll('.coptic-verse').length, 0);
  change(w, '#search-translation', 'web');
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'WEB search returns hits');
  toggle = d.querySelector('.search-hit .compare-toggle');
  toggle.click();
  panel = d.querySelector('.search-hit .compare-panel');
  assert(panel.querySelector('.compare-native-notice'), 'WEB search excludes native Coptic comparison');
  assert.equal(panel.querySelectorAll('.coptic-verse').length, 0);
  assert.equal(panel.querySelectorAll('.compare-row').length, 0);
  check('B5. search comparison guards in both directions; no same-numbered Coptic alignment');

  // Exact copy and non-rewritten source text.
  setTranslation(w, 'web', false);
  goRef(w, 'John 3:16');
  const verse = d.querySelector('.coptic-verse');
  const verseRange = d.createRange();
  verseRange.selectNodeContents(verse);
  assert.equal(verseRange.toString(), data.books.JHN[2][15], 'selectable/copyable Coptic verse is exact');
  assert.equal(verse.textContent, data.books.JHN[2][15], 'rendered verse is exact');
  assert.equal(w.getComputedStyle(verse).whiteSpace, 'pre-wrap', 'source spacing survives rendering');
  check('B6. exact copyable/selectable Coptic text without rewriting');

  // Interlinear guard: a native-numbered Coptic caption is never aligned.
  const interlinear = d.querySelector('#interlinear');
  interlinear.checked = true;
  interlinear.dispatchEvent(new w.Event('change'));
  goRef(w, 'John 1:1');
  assert(await waitFor(() => /native verse numbering/i.test(message(w))), 'interlinear guard message');
  assert.equal(d.querySelectorAll('.interlinear-verse').length, 0, 'interlinear is not rendered against native Coptic');
  interlinear.checked = false;
  interlinear.dispatchEvent(new w.Event('change'));
  check('B7. Greek interlinear guard rejects native Coptic caption');

  assert.deepEqual(w.__remoteRequests, [], 'desktop file:// made no network requests');
  dom.window.close();
}

// ---------------------------------------------------------------------------
// Part C: mobile rendering, independent comparison, parallel pane
// ---------------------------------------------------------------------------
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  change(w, '#language', 'cop');
  setTranslation(w, 'web', false);
  setTranslation(w, 'bohairica', true);
  assert(await waitFor(() => w.MARANATHA_TRANSLATIONS.bohairica), 'mobile Coptic data loads lazily');
  goRef(w, 'John 3:16');
  assert(await waitFor(() => d.querySelector('.mobile-verse .coptic-verse')), 'mobile Coptic verse renders');
  const mobile = d.querySelector('.mobile-verse .coptic-verse');
  assert.equal(mobile.lang, 'cop');
  assert.equal(mobile.dir, 'ltr');
  assert(w.getComputedStyle(mobile).fontFamily.includes('Noto Sans Coptic'));
  assert(w.getComputedStyle(mobile).whiteSpace === 'pre-wrap');
  goRef(w, 'John 3:16');
  assert.equal(message(w), '');
  assert.equal(scriptureText(d.querySelector('.mobile-verse .coptic-verse')), data.books.JHN[2][15]);
  goRef(w, `${data.bookMetadata['3JN'].toc2} 1:15`);
  assert.equal(message(w), '');
  assert.equal(scriptureText(d.querySelector('.mobile-verse .coptic-verse')), data.books['3JN'][0][14]);
  goRef(w, 'Acts 24:7');
  assert(d.querySelector('.mobile-verse .verse-source-gap'), 'mobile gap notice');
  goRef(w, 'Mark 9:44');
  assert(d.querySelector('.mobile-verse .verse-source-placeholder'), 'mobile placeholder notice');
  goRef(w, 'Genesis 1:1');
  assert(!d.querySelector('.mobile-verse .coptic-verse'), 'mobile OT unavailable');
  assert.match(d.querySelector('.mobile-verse .verse-placeholder').textContent, /not available in this translation/i);
  check('C1. mobile LTR/pre-wrap Coptic, native references, gap/placeholder, OT unavailable');

  setTranslation(w, 'web', true);
  goRef(w, 'John 3:16');
  assert.equal(d.querySelectorAll('.mobile-verses').length, 2, 'mobile comparison uses separate blocks');
  const mobileBlocks = [...d.querySelectorAll('.mobile-verses')];
  assert.equal(mobileBlocks[0].querySelectorAll('.mobile-translation').length, 1);
  assert.equal(mobileBlocks[1].querySelectorAll('.mobile-translation').length, 1);
  assert.equal(mobileBlocks.reduce((n, block) => n + block.querySelectorAll('.coptic-verse').length, 0), 1, 'Coptic text only in its own mobile block');
  assert([...d.querySelectorAll('.versification-notice')].some((n) => /own native verse numbering/i.test(n.textContent)));
  check('C2. mobile comparison blocks remain independent');

  change(w, '#view-mode', 'parallel');
  assert(await waitFor(() => d.querySelector('#parallel-lxx-content') && d.querySelector('#parallel-translation')), 'parallel panes render');
  change(w, '#parallel-translation', 'bohairica');
  change(w, '#parallel-book', 'MAT');
  assert(await waitFor(() => d.querySelector('#parallel-translation-content .coptic-verse')), 'parallel Coptic pane renders');
  assert(await waitFor(() => d.querySelector('#parallel-lxx-content').textContent.trim().length > 0), 'left LXX pane loads');
  assert.equal(d.querySelectorAll('#parallel-translation-content .coptic-verse').length, 25, 'parallel Matthew 1 shows all 25 native verses');
  assert.equal(d.querySelector('#parallel-chapter').options.length, 28, 'parallel Coptic Matthew has 28 native chapters');
  assert(d.querySelector('#parallel-lxx-content').textContent.trim().length > 0, 'left LXX pane remains populated');
  const lxxBook = d.querySelector('#parallel-lxx-book').value;
  const lxxChapter = d.querySelector('#parallel-lxx-chapter').value;
  change(w, '#parallel-book', 'JHN');
  change(w, '#parallel-chapter', '3');
  assert.equal(d.querySelector('#parallel-lxx-book').value, lxxBook, 'changing the Coptic pane does not change LXX book');
  assert.equal(d.querySelector('#parallel-lxx-chapter').value, lxxChapter, 'changing the Coptic pane does not change LXX chapter');
  assert(d.querySelector('#parallel-translation-content .coptic-verse'), 'parallel Coptic John 3 renders');
  change(w, '#parallel-book', 'GEN');
  assert.equal(d.querySelector('#parallel-chapter').options.length, 50, 'absent OT uses the canon navigation extent');
  assert(!d.querySelector('#parallel-translation-content .coptic-verse'));
  assert(!/undefined/.test(d.querySelector('#parallel-translation-content').textContent));
  assert.deepEqual(w.__remoteRequests, [], 'mobile file:// made no network requests');
  check('C3. independent parallel pane loads Coptic without touching the LXX pane or network');
  dom.window.close();
}

// ---------------------------------------------------------------------------
// Part D: Coptic search normalization
// ---------------------------------------------------------------------------
{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;
  const S = w.MARANATHA_SEARCH_TEST;
  assert(S, 'search test surface present');
  setTranslation(w, 'web', false);
  setTranslation(w, 'bohairica', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.bohairica);
  const upperA = '\u2C80\u0305'; // Ⲁ + combining overline
  const lowerA = '\u2C81\u0305'; // ⲁ + combining overline
  assert.equal(S.normalizeSearchText(upperA, 'cop'), S.normalizeSearchText(lowerA, 'cop'), 'Coptic case folds in search');
  assert(S.normalizeSearchText(upperA, 'cop').includes('\u0305'), 'combining mark is preserved');
  assert.equal(S.normalizeSearchText('\u03E2', 'cop'), S.normalizeSearchText('\u03E3', 'cop'), 'Ϣ/ϣ case folds');
  assert.notEqual(S.normalizeSearchText('\u2C80', 'cop'), S.normalizeSearchText('\u2C82', 'cop'), 'distinct Coptic letters stay distinct');
  assert.equal(S.searchVerses({ language: 'cop', books: { JHN: [[upperA]] } }, lowerA).total, 1);
  assert.equal(S.searchVerses({ language: 'cop', books: { JHN: [['\u2C82']] } }, '\u2C80').total, 0);
  const div = d.createElement('div');
  S.appendHighlighted(div, `${upperA}X${upperA}`, '\u2C81', 'bohairica');
  const marks = div.querySelectorAll('mark');
  assert.equal(marks.length, 2);
  assert([...marks].every((mark) => mark.textContent === upperA), 'highlight keeps the combining mark and original spelling');
  assert.equal(div.textContent, `${upperA}X${upperA}`, 'highlight does not rewrite the source');
  // Real search hits are confined to the NT and preserve source text.
  change(w, '#search-translation', 'bohairica');
  const query = data.books.JHN[2][15].split(' ')[0];
  d.querySelector('#search').value = query;
  d.querySelector('#search-go').click();
  const direct = S.searchVerses(w.MARANATHA_TRANSLATIONS.bohairica, query);
  assert(direct.total > 0);
  assert(direct.matches.every((match) => isNT(match.bookId)), 'search indexes the NT only');
  const johnIndex = direct.matches.findIndex((match) => match.bookId === 'JHN' && match.chapter === 3 && match.verse === 16);
  assert(johnIndex >= 0 && johnIndex < 300, 'John 3:16 is among the rendered search hits');
  const hits = d.querySelectorAll('.search-hit');
  assert(hits.length > johnIndex);
  const hit = hits[johnIndex];
  assert.equal(hit.querySelector('.search-text').textContent, data.books.JHN[2][15], 'highlighted search hit keeps the original text');
  check('D1. Coptic NFC/case/combining/mark-boundary search and exact highlights');
  assert.deepEqual(w.__remoteRequests, []);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Bohairica checks passed.`);
process.exit(failed ? 1 : 0);
