// test-berean-hebrew-pilot.mjs
//
// Repeatable runtime tests for the Berean Hebrew (draft pilot) interlinear.
// Loads the real app under jsdom from file:// and drives the real controls.
//
//   node build/test-berean-hebrew-pilot.mjs
//
// Requires jsdom (devDependency). Covers: the nine pilot verses and exact card
// counts, Genesis 1:1 gloss sequence, supplied transliteration/Unicode, the four
// intentional blanks, Malachi's missing Strong's, both Daniel variant notes,
// Reading/Study behavior + expansion, RTL order with LTR transliteration/gloss,
// the coverage notice, load failure, unchanged OSHB/Berean-Greek behavior,
// synthetic missing-gloss and multi-Strong's handling, and file:///offline
// behavior.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

const DATA_PATH = path.join(ROOT, 'data', 'berean-hebrew-pilot.js');
const RUNTIME = JSON.parse(
  fs.readFileSync(DATA_PATH, 'utf8')
    .replace(/^window\.MARANATHA_BEREAN_HEBREW_PILOT=/, '').replace(/;\s*$/, ''),
);
// The annotated OSHB comparison values are the source of truth the fixture and
// runtime data must carry; read them independently here.
const ANNOTATIONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'annotations.json'), 'utf8'));
const variantAnnotation = (verse, strongs) => ANNOTATIONS.variants.find((v) => v.verse === verse && v.strongs === strongs);

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); } catch (e) {
  console.error('This test requires jsdom. Run: npm install');
  process.exit(2);
}

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(50);
  }
  return false;
}

function commonBeforeParse(window) {
  const media = () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  window.matchMedia = () => media();
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

async function createDom({ onScript } = {}) {
  const dom = await JSDOM.fromFile(INDEX, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      commonBeforeParse(window);
      const origAppend = window.Node.prototype.appendChild;
      window.__origAppend = (node, child) => origAppend.call(node, child);
      window.Node.prototype.appendChild = function appendChild(child) {
        if (onScript && child && child.tagName === 'SCRIPT' && onScript(window, child)) return child;
        return origAppend.call(this, child);
      };
    },
  });
  const { window } = dom;
  await new Promise((r) => {
    if (window.document.readyState === 'complete') r();
    else window.addEventListener('load', r);
  });
  return dom;
}

function goto(window, bookId, chapter) {
  const { document } = window;
  const book = document.getElementById('book');
  book.value = bookId;
  book.dispatchEvent(new window.Event('change'));
  const ch = document.getElementById('chapter');
  ch.value = String(chapter);
  ch.dispatchEvent(new window.Event('change'));
}
function toggle(window, id, checked) {
  const el = window.document.getElementById(id);
  el.checked = checked;
  el.dispatchEvent(new window.Event('change'));
}
function setMode(window, id, value) {
  const el = window.document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new window.Event('change'));
}
function blockByRef(document, ref) {
  return [...document.querySelectorAll('.interlinear-verse')]
    .find((b) => b.querySelector('.interlinear-ref')?.textContent === ref);
}
function denseCards(document, ref) {
  const b = blockByRef(document, ref);
  if (!b) return [];
  return [...b.querySelectorAll('.iw:not(.iw-toggle)')].map((c) => ({
    surface: c.querySelector('.iw-hebrew')?.textContent,
    translit: c.querySelector('.iw-translit')?.textContent,
    gloss: c.querySelector('.iw-gloss')?.textContent,
    meta: c.querySelector('.iw-meta')?.textContent,
  }));
}
function disclosureCards(document, ref) {
  const b = blockByRef(document, ref);
  if (!b) return [];
  return [...b.querySelectorAll('.iw-toggle')].map((btn) => ({
    surface: btn.querySelector('.iw-hebrew')?.textContent,
    translit: btn.querySelector('.iw-translit')?.textContent,
    gloss: btn.querySelector('.iw-gloss-short')?.textContent,
  }));
}
async function openDetail(document, ref, idx) {
  const block = blockByRef(document, ref);
  const btn = block.querySelectorAll('.iw-toggle')[idx];
  btn.click();
  await waitFor(() => block.querySelector('.iw-detail:not([hidden])'));
  return block.querySelector('.iw-detail:not([hidden])')?.textContent || '';
}
async function openDetailEl(document, ref, idx) {
  const block = blockByRef(document, ref);
  const btn = block.querySelectorAll('.iw-toggle')[idx];
  btn.click();
  await waitFor(() => block.querySelector('.iw-detail:not([hidden])'));
  return block.querySelector('.iw-detail:not([hidden])');
}
function runtimeVariant(bookId, ch, verse, strongs) {
  const recs = RUNTIME.books[bookId]?.[ch - 1]?.[verse - 1];
  if (!recs) return null;
  return recs.find((t) => Array.isArray(t.strongsList) && t.strongsList.includes(strongs))?.variant || null;
}

const PILOT_VERSES = [
  ['GEN', 'Genesis', 1, 1, 7], ['GEN', 'Genesis', 1, 2, 14], ['GEN', 'Genesis', 1, 3, 6],
  ['GEN', 'Genesis', 1, 4, 12], ['GEN', 'Genesis', 1, 5, 13],
  ['DAN', 'Daniel', 2, 4, 12], ['DAN', 'Daniel', 2, 5, 17],
  ['MAL', 'Malachi', 4, 5, 13], ['MAL', 'Malachi', 4, 6, 15],
];

// ===========================================================================
// Scenario A — file:// loading, nine pilot verses, exact card counts
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  check('runs from file://', window.location.protocol === 'file:');
  check('pilot runtime data file present', fs.existsSync(DATA_PATH));

  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  const loaded = await waitFor(() => blockByRef(document, 'Genesis 1:1'));
  check('selecting Berean Hebrew loads and renders', loaded);
  check('pilot data was loaded through a <script> tag (file:// compatible)',
    [...document.querySelectorAll('script')].some((s) => /data\/berean-hebrew-pilot\.js$/.test(s.src)));

  let total = 0;
  for (const [bookId, name, ch, verse, expected] of PILOT_VERSES) {
    goto(window, bookId, ch);
    await waitFor(() => blockByRef(document, `${name} ${ch}:${verse}`));
    const cards = denseCards(document, `${name} ${ch}:${verse}`);
    total += cards.length;
    check(`pilot ${name} ${ch}:${verse} has ${expected} cards`, cards.length === expected, `got ${cards.length}`);
  }
  check('all nine pilot verses total 109 cards', total === 109, `got ${total}`);
  goto(window, 'GEN', 1);
  await waitFor(() => blockByRef(document, 'Genesis 1:1'));
  check('Reading mode renders dense cards for the pilot', blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw-toggle').length === 0);
  window.close();
}

// ===========================================================================
// Scenario B — Genesis 1:1 gloss sequence, transliteration, RTL/LTR, Unicode
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Genesis 1:1').length === 7);
  const c = denseCards(document, 'Genesis 1:1');
  const src = RUNTIME.books.GEN[0][0];

  const GEN_1_1 = ['In the beginning', 'created', 'God', '', 'the heavens', 'and', 'the earth'];
  check('Genesis 1:1 gloss sequence matches Berean exactly',
    JSON.stringify(c.map((x) => x.gloss)) === JSON.stringify(GEN_1_1), JSON.stringify(c.map((x) => x.gloss)));
  check('Genesis 1:1 surfaces are Berean\'s own Hebrew in source order',
    c[0]?.surface === src[0].surface && c[6]?.surface === src[6].surface,
    JSON.stringify([c[0]?.surface, src[0].surface]));
  check('Genesis 1:1 supplied transliteration preserved (bə·rê·šîṯ)', c[0]?.translit === 'bə·rê·šîṯ', c[0]?.translit);
  check('Genesis 1:1 last transliteration keeps source punctuation', c[6]?.translit === src[6].transliteration, c[6]?.translit);
  check('Genesis 1:1 surface keeps sof pasuq punctuation (׃)', (c[6]?.surface || '').endsWith('\u05c3'));
  check('word container is RTL', blockByRef(document, 'Genesis 1:1').querySelector('.interlinear-words')?.getAttribute('dir') === 'rtl');
  const first = blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw')[0];
  check('transliteration container is LTR', first.querySelector('.iw-translit')?.getAttribute('dir') === 'ltr');
  check('gloss container is LTR', first.querySelector('.iw-gloss')?.getAttribute('dir') === 'ltr');
  window.close();
}

// ===========================================================================
// Scenario C — four intentional untranslated records stay blank
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Genesis 1:1').length === 7);
  const blank = (name, ch, verse, idx) => denseCards(document, `${name} ${ch}:${verse}`)[idx]?.gloss === '';
  check('Genesis 1:1 #4 blank (intentional untranslated)', blank('Genesis', 1, 1, 3));
  check('Genesis 1:4 #3 blank', blank('Genesis', 1, 4, 2));
  goto(window, 'MAL', 4);
  await waitFor(() => denseCards(document, 'Malachi 4:5').length === 13);
  check('Malachi 4:5 #5 blank', blank('Malachi', 4, 5, 4));
  check('Malachi 4:6 #13 blank', blank('Malachi', 4, 6, 12));
  window.close();
}

// ===========================================================================
// Scenario D — Malachi's missing Strong's number (no broken output)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'MAL', 4);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Malachi 4:5').length === 13);
  const c = denseCards(document, 'Malachi 4:5');
  check('Malachi 4:5 #4 has no Strong\'s number and shows an empty meta', c[3]?.meta === '', JSON.stringify(c[3]));
  check('Malachi 4:5 #4 still shows its supplied gloss', c[3]?.gloss === 'to you⁺', c[3]?.gloss);
  window.close();
}

// ===========================================================================
// Scenario E — both Daniel variant notes in Study, no duplicate cards
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'DAN', 2);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Daniel 2:4').length === 12);
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Daniel 2:4').length === 12 && disclosureCards(document, 'Daniel 2:5').length === 17);
  check('Daniel 2:4 still has exactly 12 cards in Study (no extra reading word)', disclosureCards(document, 'Daniel 2:4').length === 12);
  check('Daniel 2:5 still has exactly 17 cards in Study', disclosureCards(document, 'Daniel 2:5').length === 17);

  const el24 = await openDetailEl(document, 'Daniel 2:4', 9);
  const d24 = el24.textContent || '';
  const a24 = variantAnnotation(4, '5649');
  check('Daniel 2:4 variant present and labelled OSHB comparison', /Written\/read variant/.test(d24) && /OSHB comparison/.test(d24), d24.slice(0, 200));
  check('Daniel 2:4 detail shows the EXACT annotated OSHB Qere', d24.includes(a24.oshbQere), JSON.stringify(a24.oshbQere));
  check('Daniel 2:4 detail shows the EXACT annotated OSHB Ketiv', d24.includes(a24.oshbKetiv), JSON.stringify(a24.oshbKetiv));
  check('Daniel 2:4 Qere is rendered as an isolated RTL Hebrew span',
    [...el24.querySelectorAll('.iw-variant-hebrew')].some((s) => s.textContent === a24.oshbQere && s.getAttribute('dir') === 'rtl' && s.getAttribute('lang') === 'he'),
    JSON.stringify([...el24.querySelectorAll('.iw-variant-hebrew')].map((s) => s.textContent)));
  check('Daniel 2:4 still has exactly 12 cards after expanding the variant', disclosureCards(document, 'Daniel 2:4').length === 12);

  const el25 = await openDetailEl(document, 'Daniel 2:5', 3);
  const d25 = el25.textContent || '';
  const a25 = variantAnnotation(5, '3779');
  check('Daniel 2:5 variant present and labelled OSHB comparison', /Written\/read variant/.test(d25) && /OSHB comparison/.test(d25), d25.slice(0, 200));
  check('Daniel 2:5 detail shows the EXACT annotated OSHB Qere', d25.includes(a25.oshbQere), JSON.stringify(a25.oshbQere));
  check('Daniel 2:5 detail shows the EXACT annotated OSHB Ketiv', d25.includes(a25.oshbKetiv), JSON.stringify(a25.oshbKetiv));
  check('Daniel 2:5 Qere is rendered as an isolated RTL Hebrew span',
    [...el25.querySelectorAll('.iw-variant-hebrew')].some((s) => s.textContent === a25.oshbQere && s.getAttribute('dir') === 'rtl' && s.getAttribute('lang') === 'he'));
  check('Daniel 2:5 still has exactly 17 cards after expanding the variant', disclosureCards(document, 'Daniel 2:5').length === 17);

  // The generated runtime data carries the exact annotated OSHB values too.
  const rv24 = runtimeVariant('DAN', 2, 4, '5649');
  const rv25 = runtimeVariant('DAN', 2, 5, '3779');
  check('runtime data carries the exact Daniel 2:4 Ketiv/Qere',
    rv24 && rv24.oshbKetiv === a24.oshbKetiv && rv24.oshbQere === a24.oshbQere && /OSHB/.test(rv24.provenance || ''));
  check('runtime data carries the exact Daniel 2:5 Ketiv/Qere',
    rv25 && rv25.oshbKetiv === a25.oshbKetiv && rv25.oshbQere === a25.oshbQere && /OSHB/.test(rv25.provenance || ''));
  window.close();
}

// ===========================================================================
// Scenario F — Reading vs Study, actual expansion, detail rows
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Genesis 1:3').length === 6);
  check('Reading: dense cards, no disclosure toggles', blockByRef(document, 'Genesis 1:3').querySelectorAll('.iw-toggle').length === 0);

  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Genesis 1:3').length === 6);
  check('Study: expandable disclosure cards', blockByRef(document, 'Genesis 1:3').querySelectorAll('.iw-toggle').length === 6);

  const block = blockByRef(document, 'Genesis 1:3');
  const btn = block.querySelectorAll('.iw-toggle')[0];
  const detailEl = block.querySelector('.iw-detail');
  check('detail starts collapsed', detailEl.hidden === true);
  btn.click();
  await waitFor(() => detailEl.hidden === false);
  const detail = detailEl.textContent || '';
  check('expanding reveals the reading gloss', /Berean Hebrew reading gloss/.test(detail), detail.slice(0, 160));
  check('expanding reveals morphology', /V-Qal-CImperf-3ms/.test(detail), detail.slice(0, 240));
  check('expanding reveals the Strong\'s number', /H559/.test(detail), detail.slice(0, 240));
  check('expanding reveals the source reference', /Source/.test(detail) && /Genesis 1:3/.test(detail), detail.slice(0, 240));
  check('expanding reveals draft provenance', /Provenance/.test(detail) && /draft pilot/.test(detail), detail.slice(0, 240));
  window.close();
}

// ===========================================================================
// Scenario G — coverage notice (partial chapter and unsupported passage)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => blockByRef(document, 'Genesis 1:1'));
  const notices = document.querySelectorAll('.interlinear-coverage');
  check('a partly covered chapter shows exactly one coverage notice', notices.length === 1, `got ${notices.length}`);
  check('coverage notice names the pilot passages', /Outside the Berean Hebrew draft pilot/.test(notices[0]?.textContent || ''), notices[0]?.textContent);
  check('uncovered verses do not render OSHB/dictionary cards under the pilot', document.querySelectorAll('.interlinear-verse .iw-toggle').length === 0);

  goto(window, 'EXO', 1);
  await waitFor(() => /outside the pilot/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('an unsupported passage shows the coverage message (not silent OSHB)', /outside the pilot/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('unsupported passage renders no interlinear cards', document.querySelectorAll('.interlinear-verse .iw').length === 0);
  window.close();
}

// ===========================================================================
// Scenario H — missing-data loading failure is safe
// ===========================================================================
{
  const dom = await createDom({
    onScript(window, child) {
      if (String(child.src).includes('data/berean-hebrew-pilot.js')) {
        setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
        return true;
      }
      return false;
    },
  });
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  const failed = await waitFor(() => /Could not load .*berean-hebrew-pilot\.js/.test(document.getElementById('message')?.textContent || ''));
  check('missing pilot data reports a clear load failure', failed, document.getElementById('message')?.textContent);
  check('missing pilot data does not publish a partial global', !window.MARANATHA_BEREAN_HEBREW_PILOT);

  toggle(window, 'interlinear-berean-he', false);
  toggle(window, 'interlinear-he', true);
  const ok = await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0);
  check('reader survives a failed pilot data load (OSHB still works)', ok);
  window.close();
}

// ===========================================================================
// Scenario I — synthetic missing-gloss and multi-Strong's records (in-memory)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  await waitFor(() => denseCards(document, 'Genesis 1:1').length === 7);

  window.MARANATHA_BEREAN_HEBREW_PILOT.books.GEN[0][5] = [
    { surface: '\u05d0', transliteration: 'multi', morphology: 'N-ms', strongs: null, strongsList: ['9999', '8888'], gloss: 'and', glossStatus: 'translated' },
    { surface: '\u05d1', transliteration: 'none', morphology: 'DirObjM', strongs: null, strongsList: [], gloss: null, glossStatus: 'missing' },
  ];
  goto(window, 'GEN', 1);
  await waitFor(() => denseCards(document, 'Genesis 1:6').length === 2);
  const c = denseCards(document, 'Genesis 1:6');
  check('synthetic missing gloss shows an explicit marker, not dictionary prose', c[1]?.gloss === '\u2014', JSON.stringify(c[1]));
  check('synthetic multiple Strong\'s numbers are all shown', c[0]?.meta === 'H9999 H8888', JSON.stringify(c[0]));

  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Genesis 1:6').length === 2);
  const missingDetail = await openDetail(document, 'Genesis 1:6', 1);
  check('Study detail distinguishes a missing gloss', /no gloss in source/.test(missingDetail), missingDetail.slice(0, 160));
  check('Study detail never injects a Strong\'s definition for a missing gloss', !/Definition/.test(missingDetail));
  const multiDetail = await openDetail(document, 'Genesis 1:6', 0);
  check('Study detail shows the complete Strong\'s list', /H9999/.test(multiDetail) && /H8888/.test(multiDetail), multiDetail.slice(0, 200));

  const fixtureText = fs.readFileSync(path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'pilot.fixture.json'), 'utf8');
  check('the real fixture was not altered for synthetic cases', !fixtureText.includes('9999') && !fixtureText.includes('"missing"'));
  window.close();
}

// ===========================================================================
// Scenario J — OSHB and Berean Greek behavior unchanged; exclusivity
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;

  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-he', true);
  const hebOk = await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0);
  check('OSHB Hebrew still renders expandable cards', hebOk);
  check('OSHB Hebrew view has no pilot coverage notice', document.querySelectorAll('.interlinear-coverage').length === 0);

  toggle(window, 'interlinear-berean-he', true);
  check('selecting Berean Hebrew releases OSHB Hebrew', document.getElementById('interlinear-he').checked === false);
  await waitFor(() => denseCards(document, 'Genesis 1:1').length === 7);
  check('Berean Hebrew renders after releasing OSHB', denseCards(document, 'Genesis 1:1').length === 7);
  toggle(window, 'interlinear-he', true);
  check('selecting OSHB Hebrew releases Berean Hebrew', document.getElementById('interlinear-berean-he').checked === false);
  toggle(window, 'interlinear-he', false);

  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  const bg = await waitFor(() => denseCards(document, 'John 6:50').length === 17);
  check('Berean Greek still renders 17/38 dense tokens', bg && denseCards(document, 'John 6:51').length === 38);
  toggle(window, 'interlinear', true);
  check('Berean Greek and Byzantine remain mutually exclusive', document.getElementById('interlinear-berean').checked === false);
  const byz = await waitFor(() => disclosureCards(document, 'John 6:50').length === 17 && disclosureCards(document, 'John 6:50')[5]?.gloss === 'from');
  check('Byzantine Greek behavior unchanged', byz);
  window.close();
}

// ===========================================================================
// Offline / generated-data integrity (static + repeatable check)
// ===========================================================================
{
  const sw = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
  check('service worker routes the pilot runtime file through the data cache',
    sw.includes('isTranslationFile') && sw.includes('(?:berean\\/)?') && sw.includes('[^/]+'));
  const shellList = (sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/) || [])[1] || '';
  check('pilot runtime file is NOT precached in the shell (no mandatory startup payload)', !/berean-hebrew-pilot/.test(shellList));

  const { runtimeSource } = await import('./import-berean-hebrew-pilot.mjs');
  const generated = runtimeSource();
  const committed = fs.readFileSync(DATA_PATH, 'utf8');
  check('committed runtime data matches the fixture (no hand-editing)', generated.replace(/\r\n/g, '\n') === committed.replace(/\r\n/g, '\n'));
  check('runtime data declares exactly the pilot coverage and 109 records',
    RUNTIME.recordCount === 109 && RUNTIME.coverage === 'Genesis 1:1\u20135; Daniel 2:4\u20135; Malachi 4:5\u20136');
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Berean Hebrew pilot checks passed.`);
process.exit(failed ? 1 : 0);
