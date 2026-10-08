// test-otb-ja.mjs
//
// Regression suite for the Open Translation Bible (OTB) Japanese edition,
// imported offline from the publisher's pinned lang/ja-JP JSON.
//
//   node build/test-otb-ja.mjs
//
// Part A  importer/source integrity and generated-data equality
// Part B  import contract (hashes, --check non-mutation) and JSON/JS twin
// Part C  real file:// app: desktop + mobile, network blocked, source notes,
//         placeholders, native bounds, comparison/interlinear guards
// Part D  Japanese kana-safe search semantics

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  loadAndBuild, verifySource, gitBlobSha1, sha256File,
  BOOK_IDS, EXPECTED_BOOKS, EXPECTED_CHAPTERS, EXPECTED_NUMBERED, EXPECTED_UNNUMBERED,
  EXPECTED_SEPARATORS, EXPECTED_PSALM_RECORDS, EXPECTED_NT_NOTES, EXPECTED_PLACEHOLDERS,
  SOURCE_PIN, SOURCE_MANIFEST_SHA256, SOURCE_LICENCE_SHA256, SOURCE_README_SHA256,
  MANIFEST_PATH, LICENCE_PATH, README_PATH,
} from './import-otb-ja.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(25);
  }
  return false;
}
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

// ---------------------------------------------------------------------------
// Part A: importer/source integrity and generated-data equality
// ---------------------------------------------------------------------------
const { translation, parsed } = loadAndBuild();
const data = JSON.parse(read('data/otb-ja.json'));
const jsonText = read('data/otb-ja.json');
const jsText = read('data/otb-ja.js').replace(/\r\n/g, '\n');

assert.equal(parsed.inventory.books, EXPECTED_BOOKS);
assert.equal(parsed.inventory.chapters, EXPECTED_CHAPTERS);
assert.equal(parsed.inventory.numbered, EXPECTED_NUMBERED);
assert.equal(parsed.inventory.unnumbered, EXPECTED_UNNUMBERED);
assert.equal(parsed.inventory.separators, EXPECTED_SEPARATORS);
assert.equal(parsed.inventory.psalmRecords, EXPECTED_PSALM_RECORDS);
assert.equal(parsed.inventory.ntNotes, EXPECTED_NT_NOTES);
assert.deepEqual(data.books, translation.books, 'data.books differs from the source-derived import');
assert.deepEqual(data.verseSegments, translation.verseSegments, 'data.verseSegments differs from the import');
assert.deepEqual(data.sourceRecords, translation.sourceRecords, 'data.sourceRecords differs from the import');
assert.deepEqual(data.psalmHeadings, translation.psalmHeadings, 'data.psalmHeadings differs from the import');
assert.deepEqual(data.sourceNotes, translation.sourceNotes, 'data.sourceNotes differs from the import');
assert.equal(Object.keys(data.books).length, EXPECTED_BOOKS);
assert.deepEqual(new Set(Object.keys(data.books)), new Set(BOOK_IDS));
assert.equal(data.language, 'ja');
assert.equal(data.short, 'OTB-JA');
assert.equal(data.direction, 'ltr');
assert.equal(data.nativeVersification, true);
assert.equal(data.nativeReferenceScope, true);
assert.equal(data.license, 'CC BY-SA 4.0');
assert.equal(data.sourcePin, SOURCE_PIN);
assert.equal(data.sourceManifestSha256, SOURCE_MANIFEST_SHA256);
assert.equal(data.sourceLicenceSha256, SOURCE_LICENCE_SHA256);
assert.equal(data.sourceReadmeSha256, SOURCE_README_SHA256);
assert(sha256File(MANIFEST_PATH) === SOURCE_MANIFEST_SHA256);
assert(sha256File(LICENCE_PATH) === SOURCE_LICENCE_SHA256);
assert(sha256File(README_PATH) === SOURCE_README_SHA256);
check('A1. pinned manifest/licence/readme hashes and 66/1189/31103 source layout', true);

assert.equal(data.books.MAT[22][13], '[14]');
assert.equal(data.books.JHN[4][3], '[4]');
for (const p of EXPECTED_PLACEHOLDERS) {
  const meta = data.verseMetadata?.[p.bookId]?.[String(p.chapter)]?.[String(p.verse)];
  assert.equal(meta.status, 'source-placeholder');
  assert.equal(meta.text, p.text);
  assert(/no text was supplied or inferred/i.test(meta.note));
}
assert.equal(data.books['3JN'][0].length, 15, '3 John 1 has 15 native verses');
assert.equal(data.books.DAN.length, 12, 'Daniel has 12 native chapters');
assert(Array.isArray(data.psalmHeadings.PSA['3']) && data.psalmHeadings.PSA['3'][0].text.includes('アブサロム'));
assert.equal(Object.entries(data.sourceNotes).flatMap(([id, chs]) => Object.keys(chs).map((c) => `${id}.${c}`)).sort().join(','), 'JHN.7,JHN.8,MRK.16');
check('A2. exact placeholders + notices, 138 Psalm records, 3 NT notes, 12/15 bounds', true);

// ---------------------------------------------------------------------------
// Part B: import contract and deterministic --check
// ---------------------------------------------------------------------------
verifySource();
assert.equal(gitBlobSha1(Buffer.from('hello')), 'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0');
const before = [sha(path.join(ROOT, 'data/otb-ja.json')), sha(path.join(ROOT, 'data/otb-ja.js'))];
const out = execFileSync(process.execPath, ['build/import-otb-ja.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
assert.match(out, /--check OK/);
const after = [sha(path.join(ROOT, 'data/otb-ja.json')), sha(path.join(ROOT, 'data/otb-ja.js'))];
assert.deepEqual(before, after, '--check must not mutate the generated data');
assert.equal(jsText, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['otb-ja']=${JSON.stringify(JSON.parse(jsonText), null, 2)};\n`);
check('B1. pinned raw hashes verified, git blob hash correct, non-mutating --check, JSON/JS twin', true);

// ---------------------------------------------------------------------------
// Part C/D: real file:// app
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
  await new Promise((r) => { if (window.document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  return dom;
}
const setTranslation = (w, id, on) => { const b = w.document.querySelector(`#translations input[value="${id}"]`); b.checked = on; b.dispatchEvent(new w.Event('change')); };
const goRef = (w, ref) => { w.document.querySelector('#reference').value = ref; w.document.querySelector('#reference-go').click(); };
const change = (w, el, value) => { el.value = value; el.dispatchEvent(new w.Event('change')); };
const msg = (d) => d.querySelector('#message').textContent;

{
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;
  assert.equal(w.MARANATHA_TRANSLATIONS['otb-ja'], undefined, 'OTB-JA is lazy-loaded');
  setTranslation(w, 'web', false);
  setTranslation(w, 'otb-ja', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS['otb-ja'] && d.querySelector('.japanese-verse'));
  const jv = d.querySelector('.japanese-verse');
  assert(jv && jv.lang === 'ja' && jv.dir === 'ltr');
  assert(/初めに/.test(jv.textContent));
  check('C1. desktop lazy load renders lang="ja" LTR Japanese', true);

  // Reference forms, including the source labels the publisher uses.
  goRef(w, 'Genesis 1:1');
  assert.equal(msg(d), '');
  assert(/初めに/.test(d.querySelector('.japanese-verse').textContent));
  goRef(w, 'John 5:4');
  assert.equal(msg(d), '');
  goRef(w, 'マタイの福音書23:14');
  assert.equal(msg(d), '', 'publisher modern book name resolves');
  goRef(w, 'ヨハネ5章4節');
  assert.equal(msg(d), '', 'Japanese chapter/verse markers');
  goRef(w, 'ヨハネ ５：４');
  assert.equal(msg(d), '', 'full-width Japanese reference');
  goRef(w, 'ヨハネ5:4');
  assert.equal(msg(d), '', 'no-space Japanese reference');
  goRef(w, '3 John 1:16');
  assert.match(msg(d), /not a reference available|does not exist/i, '3 John 1:16 is beyond the native 15 verses');
  goRef(w, '3 John 1:15');
  assert.equal(msg(d), '');
  check('C2. English + modern/Japanese (no-space/full-width/章節) references and 3 John 15-verse bound', true);

  // Exact placeholders with an authored (non-footnote) notice.
  goRef(w, 'Matthew 23:14');
  const ph = [...d.querySelectorAll('.verse-source-placeholder')].find((el) => el.textContent.startsWith('[14]'));
  assert(ph, 'Matthew 23:14 placeholder rendered');
  assert(/no text was supplied or inferred/i.test(ph.textContent), 'authored placeholder notice');
  assert(!/\bfootnote\b/i.test(ph.textContent), 'notice is not labelled a source footnote');
  goRef(w, 'John 5:4');
  assert([...d.querySelectorAll('.verse-source-placeholder')].some((el) => el.textContent.startsWith('[4]')));
  change(w, d.querySelector('#search-translation'), 'otb-ja');
  d.querySelector('#search').value = '[4]';
  d.querySelector('#search-go').click();
  assert([...d.querySelectorAll('.search-hit .verse-source-note')].some(el => /no text was supplied or inferred/i.test(el.textContent)), 'search hits disclose source placeholders too');
  check('C3. exact source placeholders with factual authored notice, not a source footnote', true);

  // The three variant notes are rendered outside Scripture (the source itself
  // may also embed a bracketed copy inside a verse; that is the publisher's own
  // text and is preserved exactly, so the test checks the rendered note is a
  // separate element, not that the wording never occurs anywhere).
  for (const [ref, needle] of [['Mark 16', '写本'], ['John 7', '7:53'], ['John 8', '8:1']]) {
    goRef(w, ref);
    const note = [...d.querySelectorAll('.source-note')].find((el) => el.textContent.includes(needle));
    assert(note, `${ref} source note rendered`);
    assert(/not Scripture/i.test(note.textContent), 'note labelled as not Scripture');
    assert.equal(note.closest('table, .mobile-verses'), null, 'source note is outside the Scripture reading block');
  }
  check('C4. all three NT variant notes rendered separately from Scripture', true);

  // Copy/source strings are exact.
  goRef(w, 'Genesis 1:27');
  const verse = d.querySelector('.japanese-verse');
  const range = d.createRange();
  range.selectNodeContents(verse);
  const rawChapter = JSON.parse(read('build/sources/otb-ja/lang/ja-JP/01.創世記/json/創世記-01.json'));
  const rawVerse = rawChapter.verses.find(rec => rec.verse === 27).text.join('\n');
  assert.equal(range.toString(), rawVerse, 'selectable/copyable multiline text matches the raw source');
  assert.equal(w.getComputedStyle(verse).whiteSpace, 'pre-wrap', 'OTB source spacing and line breaks survive rendering');
  check('C5. exact selectable/copyable Japanese verse text', true);

  // Native extent, navigation and deselected-source safety.
  change(w, d.querySelector('#book'), 'DAN');
  assert.equal(d.querySelector('#chapter').options.length, 12, 'sole OTB-JA Daniel has 12 chapters');
  goRef(w, 'Daniel 12:13');
  assert.equal(msg(d), '');
  d.querySelector('#next-chapter-button').click();
  assert.equal(d.querySelector('#book').value, 'HOS', 'next chapter crosses Daniel into Hosea');
  setTranslation(w, 'web', true);
  setTranslation(w, 'otb-ja', false);
  change(w, d.querySelector('#book'), 'DAN');
  assert.equal(d.querySelector('#chapter').options.length, 14, 'loaded-but-deselected OTB-JA does not scope WEB');
  goRef(w, 'Daniel 13:1');
  assert.equal(msg(d), '', 'canon Daniel 13 remains valid for a canon-numbered selection');
  goRef(w, '3 John 1:15');
  assert.match(msg(d), /not a reference available|does not exist/i, 'deselected OTB does not extend the WEB reference scope');
  setTranslation(w, 'otb-ja', true);
  setTranslation(w, 'web', false);
  check('C6. 12 Daniel chapters, navigation and deselected-source safety', true);

  // Interlinear must never be aligned to the native OTB-JA caption.
  const interlinear = d.querySelector('#interlinear');
  interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
  goRef(w, 'John 1:1');
  assert(/native verse numbering/.test(msg(d)), 'interlinear disabled for native OTB-JA caption');
  assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
  interlinear.checked = false; interlinear.dispatchEvent(new w.Event('change'));
  check('C7. original-language interlinear guard rejects native OTB-JA caption', true);

  // Comparison suppression in both directions.
  setTranslation(w, 'otb-ja', true);
  setTranslation(w, 'web', true);
  change(w, d.querySelector('#search-translation'), 'web');
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  let cmp = d.querySelector('.search-hit .compare-toggle');
  assert(cmp, 'WEB search has a comparison control');
  cmp.click();
  let panel = d.querySelector('.search-hit .compare-panel');
  assert(panel.querySelector('.compare-native-notice'));
  assert.equal(panel.querySelectorAll('[lang="ja"]').length, 0, 'no same-numbered OTB-JA under a WEB search');
  change(w, d.querySelector('#search-translation'), 'otb-ja');
  d.querySelector('#search').value = '神';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'OTB-JA search returns hits');
  cmp = d.querySelector('.search-hit .compare-toggle');
  cmp.click();
  panel = d.querySelector('.search-hit .compare-panel');
  assert(panel.querySelector('.compare-native-notice'));
  assert.equal(panel.querySelectorAll('.compare-row').length, 0, 'no canon row under an OTB-JA search');
  assert.deepEqual(w.__remoteRequests, []);
  check('C8. comparison suppression both directions; no network', true);

  // Kana-safe search semantics (shared with Bungo).
  const S = w.MARANATHA_SEARCH_TEST;
  assert(S, 'search test surface present');
  assert.notEqual(S.normalizeSearchText('か', 'ja'), S.normalizeSearchText('が', 'ja'));
  assert.equal(S.normalizeSearchText('か\u3099', 'ja'), S.normalizeSearchText('が', 'ja'));
  const jaForm = S.buildSearchForm('すがた', 'ja');
  assert.equal(jaForm.form.indexOf('か'), -1, 'か must not match inside が');
  const fake = { language: 'ja', books: { GEN: [['すがた']] } };
  assert.equal(S.searchVerses(fake, 'か').total, 0);
  assert.equal(S.searchVerses(fake, 'が').total, 1);
  const div = d.createElement('div');
  S.appendHighlighted(div, 'がXが', 'が', 'otb-ja');
  assert.equal(div.querySelectorAll('mark').length, 2);
  check('C9. kana voicing/canonical-equivalence search preserved', true);

  assert.deepEqual(w.__remoteRequests, []);
  dom.window.close();
}

// Mobile + a parallel pane that loads OTB-JA with no main checkbox ever ticked.
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  assert.equal(w.MARANATHA_TRANSLATIONS['otb-ja'], undefined);
  change(w, d.querySelector('#view-mode'), 'parallel');
  change(w, d.querySelector('#parallel-book'), 'DAN');
  change(w, d.querySelector('#parallel-translation'), 'otb-ja');
  await waitFor(() => d.querySelector('#parallel-translation-content [lang="ja"]'));
  assert.equal(d.querySelector('#parallel-chapter').options.length, 12, 'first parallel-only load uses OTB-JA Daniel extent');
  change(w, d.querySelector('#parallel-translation'), 'web');
  assert.equal(d.querySelector('#parallel-chapter').options.length, 14, 'parallel WEB returns to canon extent');
  change(w, d.querySelector('#view-mode'), 'canon');
  setTranslation(w, 'web', false);
  setTranslation(w, 'otb-ja', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS['otb-ja'] && d.querySelector('.mobile-verse .japanese-verse'));
  goRef(w, 'ヨハネ5:4');
  assert(d.querySelector('.mobile-verse .japanese-verse'), 'mobile Japanese verse missing');
  assert.deepEqual(w.__remoteRequests, []);
  check('C10. mobile rendering and pane-only OTB-JA load without main checkbox', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed += 1; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} OTB-JA checks passed.`);
process.exit(failed ? 1 : 0);
