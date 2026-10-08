// test-bungo.mjs
//
// Regression suite for the Classical Japanese Bible (Bungo-yaku / Taisho-kaiyaku),
// imported from the CrossWire Bible Society JapBungo 2.0 SWORD module.
//
//   node build/test-bungo.mjs
//
// Part A  source + header integrity
// Part B  independent byte-level slot fidelity (all 31102 slots)
// Part C  import contract (rejections) and deterministic --check
// Part D  real file:// app: desktop + mobile, network blocked
// Part E  language-aware search (voicing / canonical equivalence / highlight map)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  parseCanonHeader, loadAndBuild, stripVerseRecord, decodeUtf8, readBzs, readBzv,
  CANON_HEADER_PATH, ZTEXT_DIR, SOURCE_FILE_SHA256,
  EXPECTED_BOOKS, EXPECTED_CHAPTERS, EXPECTED_VERSES, EXPECTED_NONEMPTY_VERSES,
  EXPECTED_GLOSSES, EXPECTED_PSALM_HEADINGS, EXPECTED_EMPTY_SLOTS,
} from './import-bungo.mjs';

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
// Part A: source + header integrity
// ---------------------------------------------------------------------------
const { translation, parsed, hashes } = loadAndBuild();
const data = JSON.parse(read('data/bungo.json'));
const jsonText = read('data/bungo.json');
const jsText = read('data/bungo.js').replace(/\r\n/g, '\n');
const layout = parseCanonHeader(fs.readFileSync(CANON_HEADER_PATH, 'utf8'));

assert.equal(parsed.counts.books, EXPECTED_BOOKS);
assert.equal(parsed.counts.chapters, EXPECTED_CHAPTERS);
assert.equal(parsed.counts.verses, EXPECTED_VERSES);
assert.equal(parsed.counts.nonEmpty, EXPECTED_NONEMPTY_VERSES);
assert.equal(parsed.inventory.glosses, EXPECTED_GLOSSES);
assert.equal(parsed.inventory.psalmHeadings, EXPECTED_PSALM_HEADINGS);
assert.deepEqual([...parsed.emptySlots].sort(), [...EXPECTED_EMPTY_SLOTS].sort());
assert.equal(layout.counts.books, EXPECTED_BOOKS);
assert.equal(layout.counts.chapters, EXPECTED_CHAPTERS);
assert.equal(layout.counts.verses, EXPECTED_VERSES);
assert.deepEqual(data.books, translation.books, 'data.books differs from the source-derived import');
assert.deepEqual(data.psalmHeadings, translation.psalmHeadings, 'data.psalmHeadings differs from the import');
assert.equal(data.sourceArchiveSha256, hashes.zip);
assert.equal(data.sourceHeaderSha256, layout.headerSha256);
for (const rel of Object.keys(SOURCE_FILE_SHA256)) {
  assert.equal(data.sourceFileSha256[rel], SOURCE_FILE_SHA256[rel], `pinned hash for ${rel}`);
}
assert.equal(Object.keys(data.books).length, EXPECTED_BOOKS);
assert.deepEqual(new Set(Object.keys(data.books)), new Set(layout.books.map((b) => b.id)));
assert.equal(data.nativeVersification, true);
assert.equal(data.nativeReferenceScope, true);
assert.equal(data.language, 'ja');
assert.equal(data.short, 'BUNGO');
assert.equal(data.direction, 'ltr');
check('A1. pinned archive/header/extracted hashes and 66/1189/31102 layout', true);

// Headings and gaps are preserved separately and disclosed.
assert(data.structuralHeadings.some((h) => h.text === '旧約聖書'));
assert(data.structuralHeadings.some((h) => h.text === '新約聖書'));
assert(Array.isArray(data.psalmHeadings.PSA) || (data.psalmHeadings.PSA && Object.keys(data.psalmHeadings.PSA).length));
assert(data.psalmHeadings.PSA['3'][0].type === 'psalm');
assert.equal(data.psalmHeadings.PSA['3'][0].text, 'ダビデその子アブサロムを避しときのうた');
assert.equal(Object.keys(data.verseMetadata).length, 3);
for (const defect of data.sourceDefects) {
  const meta = data.verseMetadata?.[defect.bookId]?.[String(defect.chapter)]?.[String(defect.verse)];
  assert.equal(meta.status, 'source-gap');
  assert.equal(meta.note, 'No separately indexed text in this source slot');
}
check('A2. structural/psalm headings and the 3 source gaps are preserved and disclosed', true);

// Well-known verses (hand-read from the pinned binary source).
assert.equal(data.books.GEN[0][0], '元始に神天地を創造たまへり');
assert.equal(data.books.JHN[0][0], '太初に言あり、言は神と偕にあり、言は神なりき。');
assert.equal(data.books.DAN.length, 12, 'Bungo Daniel has 12 source chapters');
assert(data.books.DAN[11].filter(Boolean).length > 0);
assert.equal(data.books.DAN[12], undefined, 'Bungo must not expose Daniel 13');
assert.equal(data.books.PSA.length, 150);
check('A3. representative verses, 12 Daniel chapters, no deuterocanonical books', true);

// ---------------------------------------------------------------------------
// Part B: independent byte-level slot fidelity for every slot
// ---------------------------------------------------------------------------
{
  const canon = { ot: layout.books.filter((b) => b.testament === 'OT'), nt: layout.books.filter((b) => b.testament === 'NT') };
  // An independent strip that removes the documented markup without reusing
  // the importer's code path.
  const independentStrip = (raw) => raw
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/g, '')
    .replace(/<w\b[^>]*>/g, '')
    .replace(/<\/w>/g, '')
    .replace(/<chapter\b[^>]*\/>/g, '')
    .replace(/<div\b[^>]*\/>/g, '');

  let slots = 0;
  let nonEmpty = 0;
  const gaps = [];
  for (const [testament, books] of Object.entries(canon)) {
    const blocks = readBzs(fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzs`)));
    const index = readBzv(fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzv`)));
    const bzz = fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzz`));
    const cache = new Map();
    const block = (n) => { if (!cache.has(n)) cache.set(n, zlib.inflateSync(bzz.subarray(blocks[n].off, blocks[n].off + blocks[n].comp))); return cache.get(n); };
    let i = 0;
    assert.equal(decodeUtf8(block(index[i].block).subarray(index[i].off, index[i].off + index[i].len)), '');
    i += 1;
    const milestone = decodeUtf8(block(index[i].block).subarray(index[i].off, index[i].off + index[i].len));
    assert.match(milestone, /^<milestone\b/);
    i += 1;
    for (const book of books) {
      const bookHeader = decodeUtf8(block(index[i].block).subarray(index[i].off, index[i].off + index[i].len));
      i += 1;
      assert.match(bookHeader, /type="book"/);
      for (let ci = 0; ci < book.chapters.length; ci += 1) {
        const chHeader = decodeUtf8(block(index[i].block).subarray(index[i].off, index[i].off + index[i].len));
        i += 1;
        assert.match(chHeader, /^<chapter\b/, `${book.id} ${ci + 1}`);
        const expected = data.books[book.id][ci];
        for (let vi = 0; vi < book.chapters[ci]; vi += 1) {
          const e = index[i];
          const bytes = block(e.block).subarray(e.off, e.off + e.len);
          const raw = decodeUtf8(bytes);
          const value = expected[vi];
          slots += 1;
          if (raw === '') {
            assert.equal(value, '', `${book.id}.${ci + 1}.${vi + 1} must stay empty`);
            gaps.push(`${book.id}.${ci + 1}.${vi + 1}`);
          } else {
            nonEmpty += 1;
            assert(!value.includes('<') && !value.includes('>'), `markup leaked into ${book.id}.${ci + 1}.${vi + 1}`);
            assert(!value.includes('\uFFFD'));
            // Codepoint-by-codepoint equality against the independent strip.
            assert.deepEqual([...value], [...independentStrip(raw)], `text differs at ${book.id}.${ci + 1}.${vi + 1}`);
          }
          i += 1;
        }
      }
    }
    assert.equal(i, index.length, `${testament} index fully consumed`);
  }
  assert.equal(slots, EXPECTED_VERSES);
  assert.equal(nonEmpty, EXPECTED_NONEMPTY_VERSES);
  assert.deepEqual(gaps.sort(), [...EXPECTED_EMPTY_SLOTS].sort());
  // Surrounding source text is intact and not duplicated into a gap.
  assert(data.books.EXO[6][23].includes('七日'), 'Exodus 7:24 keeps the seven-day clause');
  assert.equal(data.books['2SA'][18][24], '', '2 Samuel 19:25 is the declared gap');
  assert(data.books['2SA'][18][25].length > 0, '2 Samuel 19:26 keeps the arrival clause');
  assert(data.books['2CH'][1][11].length > 0, '2 Chronicles 2:12 (Hiram-sending clause) has text');
  assert.equal(data.books.EXO[6][24], '');
  assert.equal(data.books['2SA'][18][24], '');
  assert.equal(data.books['2CH'][1][12], '');
  check('B1. all 31102 slots verified byte-for-byte; 31099 with text; 3 gaps empty and distinct', true);
}

// ---------------------------------------------------------------------------
// Part C: import contract and deterministic --check
// ---------------------------------------------------------------------------
{
  const header = fs.readFileSync(CANON_HEADER_PATH, 'utf8');
  assert.throws(() => parseCanonHeader(header.replace('struct sbook ntbooks', 'struct sbook notntbooks')), /Could not find ntbooks/);
  assert.throws(() => parseCanonHeader(header.replace(/\{\"Genesis\".*\}/, '{"Genesis", "Gen", "Gen", 51}')), /book count|consumed/);
  const w = stripVerseRecord('<w gloss="x">A</w>B');
  assert.equal(w.text, 'AB');
  assert.equal(w.glosses, 1);
  assert.throws(() => stripVerseRecord('<foo>bar</foo>'), /Unknown markup/);
  assert.throws(() => stripVerseRecord('<w gloss="x"><b>A</b></w>'), /Nested markup/);
  assert.throws(() => decodeUtf8(Buffer.from([0xff, 0xfe, 0xfd])), /invalid UTF-8/);
  assert.throws(() => readBzs(Buffer.alloc(13)), /multiple of 12/);
  assert.throws(() => readBzv(Buffer.alloc(11)), /multiple of 10/);
  const before = [sha(path.join(ROOT, 'data/bungo.json')), sha(path.join(ROOT, 'data/bungo.js'))];
  const out = execFileSync(process.execPath, ['build/import-bungo.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /--check OK/);
  const after = [sha(path.join(ROOT, 'data/bungo.json')), sha(path.join(ROOT, 'data/bungo.js'))];
  assert.deepEqual(before, after, '--check must not mutate the generated data');
  // JSON/JS twin equality.
  assert.equal(jsText, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['bungo']=${JSON.stringify(JSON.parse(jsonText), null, 2)};\n`);
  check('C1. duplicate/bounds/UTF8/unknown-tag rejection and non-mutating --check', true);
}

// ---------------------------------------------------------------------------
// Part D: real file:// app
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
  assert.equal(w.MARANATHA_TRANSLATIONS.bungo, undefined, 'Bungo is lazy-loaded');
  setTranslation(w, 'web', false);
  setTranslation(w, 'bungo', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.bungo && d.querySelector('.japanese-verse'));
  const jv = d.querySelector('.japanese-verse');
  assert(jv && jv.lang === 'ja' && jv.dir === 'ltr');
  assert(/元始/.test(jv.textContent));
  check('D1. desktop lazy load renders lang="ja" LTR Japanese', true);

  // Reference forms.
  goRef(w, 'Genesis 1:1');
  assert.equal(msg(d), '');
  assert(/元始/.test(d.querySelector('.japanese-verse').textContent));
  goRef(w, 'John 3:16');
  assert.equal(msg(d), '');
  assert(/獨子/.test(d.querySelector('.japanese-verse').textContent));
  goRef(w, 'ヨハネ3:16');
  assert.equal(msg(d), '', 'no-space Japanese reference');
  goRef(w, 'ヨハネ ３：１６');
  assert.equal(msg(d), '', 'full-width Japanese reference');
  goRef(w, 'ヨハネ3章16節');
  assert.equal(msg(d), '', 'Japanese chapter/verse markers');
  goRef(w, '1ヨハネ3:1');
  assert.equal(msg(d), '');
  assert(/1 John 3/.test(d.querySelector('.result-head h2').textContent), '1ヨハネ must not collapse into Gospel John');
  goRef(w, 'ダニエル13:1');
  assert.match(msg(d), /does not exist/, 'Daniel 13 is invalid for the sole Bungo edition');
  goRef(w, 'ダニエル12:1');
  assert.equal(msg(d), '');
  goRef(w, 'ヨハネ99:1');
  assert.match(msg(d), /does not exist/);
  check('D2. English + Japanese (no-space/full-width/章節) references and longest-alias collisions', true);

  // Source heading + source gap.
  goRef(w, '詩篇3:1');
  assert(/ダビデその子アブサロムを避しときのうた/.test(d.querySelector('.source-heading-text').textContent));
  goRef(w, '出エジプト記7:25');
  const gap = d.querySelector('.verse-source-gap');
  assert(gap, 'declared source gap placeholder');
  assert(/No separately indexed text in this source slot/.test(gap.textContent));
  goRef(w, '出エジプト記7:24');
  assert(/七日/.test(d.querySelector('.japanese-verse').textContent), 'adjacent 7:24 retains its own text');
  check('D3. psalm heading rendered separately; source gap placeholder not guessed text', true);

  // Context and copyability.
  goRef(w, 'ヨハネ3:16');
  const toggle = d.querySelector('.context-toggle-btn');
  const before = d.querySelectorAll('.japanese-verse').length;
  toggle.click();
  assert(d.querySelectorAll('.japanese-verse').length > before, 'context expands the Japanese block');
  toggle.click();
  const range = d.createRange();
  range.selectNodeContents(d.querySelector('.japanese-verse'));
  assert.equal(range.toString(), d.querySelector('.japanese-verse').textContent, 'verse text is selectable/copyable exactly');
  check('D4. context expansion and exact selectable/copyable text', true);

  // Bungo/WEB separation, 12 chapters, navigation.
  setTranslation(w, 'web', true);
  goRef(w, 'John 3:1');
  assert(d.querySelectorAll('.result-head').length >= 2, 'native block separated from canon-numbered block');
  assert(d.querySelector('.versification-notice'));
  setTranslation(w, 'web', false);
  change(w, d.querySelector('#book'), 'DAN');
  assert.equal(d.querySelector('#chapter').options.length, 12, 'sole Bungo Daniel has 12 chapters');
  goRef(w, 'Daniel 12:13');
  assert.equal(msg(d), '');
  d.querySelector('#next-chapter-button').click();
  assert.equal(d.querySelector('#book').value, 'HOS', 'next chapter crosses from Daniel into Hosea');
  assert.equal(d.querySelector('#chapter').value, '1');
  // Deselected-but-loaded Bungo must not restrict a WEB selection.
  setTranslation(w, 'web', true);
  change(w, d.querySelector('#book'), 'DAN');
  assert.equal(d.querySelector('#chapter').options.length, 14, 'loaded-but-deselected Bungo does not scope WEB');
  goRef(w, 'Daniel 13:1');
  assert.equal(msg(d), '', 'canon Daniel 13 remains valid for the canon-numbered selection');
  check('D5. separated blocks, 12 Daniel chapters, navigation, deselected-source safety', true);

  // Greek interlinear must never use Bungo as a presumed caption.
  setTranslation(w, 'web', false);
  const interlinear = d.querySelector('#interlinear');
  interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
  goRef(w, 'John 1:1');
  assert(/native verse numbering/.test(msg(d)), 'interlinear disabled for native Bungo caption');
  assert.equal(d.querySelectorAll('.interlinear-verse').length, 0, 'no interlinear rows over native text');
  interlinear.checked = false; interlinear.dispatchEvent(new w.Event('change'));
  check('D6. original-language interlinear guard rejects native Bungo caption', true);

  // Comparison suppression in both directions.
  setTranslation(w, 'bungo', true);
  setTranslation(w, 'web', true);
  change(w, d.querySelector('#search-translation'), 'web');
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  let cmp = d.querySelector('.search-hit .compare-toggle');
  assert(cmp, 'WEB search has a comparison control');
  cmp.click();
  let panel = d.querySelector('.search-hit .compare-panel');
  assert(panel.querySelector('.compare-native-notice'), 'WEB search shows native-numbering notice');
  assert.equal(panel.querySelectorAll('.japanese-verse').length, 0, 'no same-numbered Bungo under WEB search');
  change(w, d.querySelector('#search-translation'), 'bungo');
  d.querySelector('#search').value = '神';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'), 'Bungo search returns hits');
  cmp = d.querySelector('.search-hit .compare-toggle');
  assert(cmp, 'Bungo search has a comparison control');
  cmp.click();
  panel = d.querySelector('.search-hit .compare-panel');
  assert(panel.querySelector('.compare-native-notice'));
  assert.equal(panel.querySelectorAll('.compare-row').length, 0, 'no canon row under Bungo search');
  assert.deepEqual(w.__remoteRequests, []);
  check('D7. comparison suppression both directions; no network', true);

  // Search language hook: voicing, canonical equivalence, highlighting.
  const S = w.MARANATHA_SEARCH_TEST;
  assert(S, 'search test surface present');
  assert.equal(S.normalizeSearchText('が', 'ja'), 'が');
  assert.notEqual(S.normalizeSearchText('か', 'ja'), S.normalizeSearchText('が', 'ja'));
  assert.equal(S.normalizeSearchText('か\u3099', 'ja'), S.normalizeSearchText('が', 'ja'), 'canonical equivalence');
  assert.notEqual(S.normalizeSearchText('ば', 'ja'), S.normalizeSearchText('は', 'ja'));
  assert.notEqual(S.normalizeSearchText('ぱ', 'ja'), S.normalizeSearchText('は', 'ja'));
  const jaForm = S.buildSearchForm('すがた', 'ja');
  assert(jaForm.form.includes('が'));
  assert.equal(jaForm.form.indexOf('か'), -1, 'か must not match inside が');
  const mapForm = S.buildSearchForm('あがXい', 'ja');
  const idx = mapForm.form.indexOf('が');
  assert.equal('あがXい'.slice(mapForm.map[idx], mapForm.ends[idx]), 'が');
  const vsText = '神\uFE00は';
  const vsForm = S.buildSearchForm(vsText, 'ja');
  const vsIdx = vsForm.form.indexOf('神');
  assert.equal(vsText.slice(vsForm.map[vsIdx], vsForm.ends[vsIdx]), '神\uFE00', 'variation selector stays in the highlight');
  const supText = 'A\u{20BB7}B';
  const supForm = S.buildSearchForm(supText, 'ja');
  assert.equal(supForm.form, supText, 'Supplementary code points are represented once');
  const supIdx = supForm.form.indexOf('\u{20BB7}');
  assert.equal(supText.slice(supForm.map[supIdx], supForm.ends[supIdx]), '\u{20BB7}');
  const div = d.createElement('div');
  S.appendHighlighted(div, 'がXが', 'が', 'bungo');
  assert.equal(div.querySelectorAll('mark').length, 2);
  assert.deepEqual([...div.querySelectorAll('mark')].map((m) => m.textContent), ['が', 'が']);
  assert.equal(div.textContent, 'がXが');
  const fake = { language: 'ja', books: { GEN: [['すがた']] } };
  assert.equal(S.searchVerses(fake, 'か').total, 0, 'か does not match が');
  assert.equal(S.searchVerses(fake, 'が').total, 1);
  assert.equal(S.searchVerses(fake, 'か\u3099').total, 1, 'decomposed query matches precomposed text');
  // Existing Hebrew/Greek/Latin normalization is preserved.
  assert.equal(S.normalizeSearchText('שָׁלוֹם'), 'שלומ', 'Hebrew final-form folding + niqqud stripping preserved');
  assert.equal(S.normalizeSearchText('ἀγάπη', 'el'), 'αγαπη');
  assert.equal(S.normalizeSearchText('cœlum', 'la'), 'cœlum');
  check('D8. Japanese voicing/canonical-equivalence/highlight mapping; Hebrew/Greek/Latin preserved', true);

  assert.deepEqual(w.__remoteRequests, []);
  dom.window.close();
}

// Mobile + a fresh parallel pane that loads Bungo with no main checkbox ever ticked.
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  assert.equal(w.MARANATHA_TRANSLATIONS.bungo, undefined);
  change(w, d.querySelector('#view-mode'), 'parallel');
  change(w, d.querySelector('#parallel-book'), 'DAN');
  change(w, d.querySelector('#parallel-translation'), 'bungo');
  await waitFor(() => d.querySelector('#parallel-translation-content .japanese-verse'));
  assert.equal(d.querySelector('#parallel-chapter').options.length, 12, 'parallel Bungo exposes 12 Daniel chapters');
  change(w, d.querySelector('#parallel-translation'), 'web');
  assert.equal(d.querySelector('#parallel-chapter').options.length, 14, 'parallel WEB returns to canon extent');
  // Mobile main rendering.
  change(w, d.querySelector('#view-mode'), 'canon');
  setTranslation(w, 'web', false);
  setTranslation(w, 'bungo', true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.bungo && d.querySelector('.mobile-verse .japanese-verse'));
  goRef(w, 'John 3:16');
  assert(d.querySelector('.mobile-verse .japanese-verse'), 'mobile Japanese verse missing');
  assert.deepEqual(w.__remoteRequests, []);
  check('D9. mobile rendering and pane-only Bungo load without main checkbox', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed += 1; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Bungo checks passed.`);
process.exit(failed ? 1 : 0);
