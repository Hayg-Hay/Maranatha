// test-berean-hebrew.mjs
//
// Runtime tests for the Berean Hebrew (draft) preview — all Genesis plus the
// retained Daniel 2:4-5 and Malachi 4:5-6 pilot verses. Loads the real app under
// jsdom from file:// and drives the real controls.
//
//   node build/test-berean-hebrew.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

function loadGlobal(rel, globalName) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')
    .replace(new RegExp(`^window\\.${globalName}=`), '').replace(/;\s*$/, ''));
}
const MANIFEST = loadGlobal('data/berean-hebrew/manifest.js', 'MARANATHA_BEREAN_HEBREW_MANIFEST');
const GEN = loadGlobal('data/berean-hebrew/GEN.js', 'MARANATHA_BEREAN_HEBREW_GEN').books.GEN;
const DAN = loadGlobal('data/berean-hebrew/DAN.js', 'MARANATHA_BEREAN_HEBREW_DAN').books.DAN;
const MAL = loadGlobal('data/berean-hebrew/MAL.js', 'MARANATHA_BEREAN_HEBREW_MAL').books.MAL;
const VARIANTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'variants.json'), 'utf8'));
const variantBy = (bookId, ch, v, order) => VARIANTS.variants.find((x) => x.bookId === bookId && x.chapter === ch && x.verse === v && x.order === order);
const count = (book, ch, v) => (book[ch - 1] && book[ch - 1][v - 1] ? book[ch - 1][v - 1].length : 0);

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); } catch (e) {
  console.error('This test requires jsdom. Run: npm install');
  process.exit(2);
}

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 15000) {
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
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
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
  await new Promise((r) => { if (window.document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  return dom;
}
function goto(window, bookId, chapter) {
  const { document } = window;
  const book = document.getElementById('book'); book.value = bookId; book.dispatchEvent(new window.Event('change'));
  const ch = document.getElementById('chapter'); ch.value = String(chapter); ch.dispatchEvent(new window.Event('change'));
}
function toggle(window, id, checked) {
  const el = window.document.getElementById(id); el.checked = checked; el.dispatchEvent(new window.Event('change'));
}
function setMode(window, id, value) {
  const el = window.document.getElementById(id); el.value = value; el.dispatchEvent(new window.Event('change'));
}
function blockByRef(document, ref) {
  return [...document.querySelectorAll('.interlinear-verse')].find((b) => b.querySelector('.interlinear-ref')?.textContent === ref);
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
async function openDetailEl(document, ref, idx) {
  const block = blockByRef(document, ref);
  const btn = block.querySelectorAll('.iw-toggle')[idx];
  btn.click();
  await waitFor(() => block.querySelector('.iw-detail:not([hidden])'));
  return block.querySelector('.iw-detail:not([hidden])');
}
async function openPilot(window, bookId, chapter, ref) {
  goto(window, bookId, chapter);
  toggle(window, 'interlinear-berean-he', true);
  return waitFor(() => blockByRef(window.document, ref));
}

// ===========================================================================
// A — file:// loading; Genesis 1 counts; Genesis 1:1 glosses; RTL/LTR
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  check('runs from file://', window.location.protocol === 'file:');
  const rendered = await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  check('selecting Berean Hebrew loads the manifest + GEN chunk and renders', rendered);
  check('manifest script was loaded via <script>', [...document.querySelectorAll('script')].some((s) => /data\/berean-hebrew\/manifest\.js$/.test(s.src)));
  check('GEN chunk was loaded via <script>', [...document.querySelectorAll('script')].some((s) => /data\/berean-hebrew\/GEN\.js$/.test(s.src)));
  check('legacy pilot runtime file is never requested', ![...document.querySelectorAll('script')].some((s) => /data\/berean-hebrew-pilot\.js$/.test(s.src)));

  const GEN_1_1 = ['In the beginning', 'created', 'God', '', 'the heavens', 'and', 'the earth'];
  const c = denseCards(document, 'Genesis 1:1');
  check('Genesis 1:1 has 7 cards', c.length === 7, `got ${c.length}`);
  check('Genesis 1:1 gloss sequence matches Berean', JSON.stringify(c.map((x) => x.gloss)) === JSON.stringify(GEN_1_1), JSON.stringify(c.map((x) => x.gloss)));
  check('Genesis 1:1 surfaces are Berean\'s own Hebrew', c[0]?.surface === GEN[0][0][0].surface && c[6]?.surface === GEN[0][0][6].surface);
  check('Genesis 1:1 supplied transliteration preserved', c[0]?.translit === 'bə·rê·šîṯ', c[0]?.translit);
  check('word container is RTL', blockByRef(document, 'Genesis 1:1').querySelector('.interlinear-words')?.getAttribute('dir') === 'rtl');
  const first = blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw')[0];
  check('transliteration and gloss containers are LTR', first.querySelector('.iw-translit')?.getAttribute('dir') === 'ltr' && first.querySelector('.iw-gloss')?.getAttribute('dir') === 'ltr');
  window.close();
}

// ===========================================================================
// B — Genesis coverage and actual record totals; navigation to Genesis 50
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 1, 'Genesis 1:1');

  check('manifest reports 20,670 records across GEN/DAN/MAL', MANIFEST.recordCount === 20670 && JSON.stringify(MANIFEST.books) === JSON.stringify(['GEN', 'DAN', 'MAL']), JSON.stringify([MANIFEST.recordCount, MANIFEST.books]));
  check('GEN chunk holds all 50 chapters', GEN.filter(Boolean).length === 50);
  check('GEN actual record total is 20,613', MANIFEST.booksRecordCount.GEN === 20613, String(MANIFEST.booksRecordCount.GEN));
  check('coverage string names Genesis 1-50 and the retained verses', /Genesis 1\u201350/.test(MANIFEST.coverage) && /Daniel 2:4\u20135/.test(MANIFEST.coverage) && /Malachi 4:5\u20136/.test(MANIFEST.coverage), MANIFEST.coverage);

  const samples = [[1, 1, 7], [1, 2, 14], [2, 4, 11], [8, 17, 21], [22, 1, 13], [49, 1, 14], [50, 24, 22], [50, 26, 11]];
  for (const [ch, v, expected] of samples) {
    goto(window, 'GEN', ch);
    await waitFor(() => blockByRef(document, `Genesis ${ch}:${v}`));
    const n = denseCards(document, `Genesis ${ch}:${v}`).length;
    check(`Genesis ${ch}:${v} renders ${expected} cards`, n === expected, `got ${n}`);
  }
  // Navigation to the final chapter.
  goto(window, 'GEN', 50);
  const ok50 = await waitFor(() => blockByRef(document, 'Genesis 50:26'));
  check('navigation to Genesis 50:26 works', ok50 && denseCards(document, 'Genesis 50:26').length === 11);
  window.close();
}

// ===========================================================================
// C — divine-name source fidelity (source convention preserved, not normalized)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 2, 'Genesis 2:4');
  const cards = denseCards(document, 'Genesis 2:4');
  const yhwh = cards.find((x) => x.meta === 'H3068');
  check('Genesis 2:4 YHWH keeps the source transliteration (Yah·weh)', yhwh?.translit === 'Yah·weh', JSON.stringify(yhwh));
  check('Genesis 2:4 YHWH keeps the source gloss (YHWH)', yhwh?.gloss === 'YHWH', JSON.stringify(yhwh));
  check('Genesis 2:4 YHWH surface preserved', yhwh?.surface === 'יְהוָ֥ה', JSON.stringify(yhwh));
  window.close();
}

// ===========================================================================
// D — verified Genesis 8:17 Ketiv/Qere handling
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 8, 'Genesis 8:17');
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Genesis 8:17').length === 21);
  check('Genesis 8:17 has 21 cards (no extra reading word)', disclosureCards(document, 'Genesis 8:17').length === 21);
  const v = variantBy('GEN', 8, 17, 13);
  const el = await openDetailEl(document, 'Genesis 8:17', 13);
  const detail = el.textContent || '';
  check('Genesis 8:17 detail shows the EXACT OSHB Ketiv', detail.includes(v.oshbKetiv), JSON.stringify(v.oshbKetiv));
  check('Genesis 8:17 detail shows the EXACT OSHB Qere', detail.includes(v.oshbQere), JSON.stringify(v.oshbQere));
  check('Genesis 8:17 Qere is an isolated RTL Hebrew span', [...el.querySelectorAll('.iw-variant-hebrew')].some((s) => s.textContent === v.oshbQere && s.getAttribute('dir') === 'rtl'));
  check('Genesis 8:17 variant is labelled an OSHB comparison', /OSHB comparison/.test(detail));
  check('Genesis 8:17 card count unchanged after expanding (21)', disclosureCards(document, 'Genesis 8:17').length === 21);
  window.close();
}

// ===========================================================================
// E — retained Daniel/Malachi pilot verses + Daniel variants
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'DAN', 2, 'Daniel 2:4');
  check('retained Daniel 2:4 has 12 cards', denseCards(document, 'Daniel 2:4').length === 12);
  check('retained Daniel 2:5 has 17 cards', denseCards(document, 'Daniel 2:5').length === 17);
  check('Daniel 2:4 Aramaic split preserved (first word Hebrew)', DAN[1][3][0].language === 'hebrew' && DAN[1][3][4].language === 'aramaic');
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Daniel 2:4').length === 12);
  const v24 = variantBy('DAN', 2, 4, 9);
  const el = await openDetailEl(document, 'Daniel 2:4', 9);
  check('Daniel 2:4 detail shows the exact OSHB Qere', (el.textContent || '').includes(v24.oshbQere), JSON.stringify(v24.oshbQere));

  setMode(window, 'interlinear-berean-he-mode', 'read');
  await waitFor(() => denseCards(document, 'Daniel 2:5').length === 17);
  goto(window, 'MAL', 4);
  await waitFor(() => blockByRef(document, 'Malachi 4:5'));
  check('retained Malachi 4:5 has 13 cards', denseCards(document, 'Malachi 4:5').length === 13);
  check('retained Malachi 4:6 has 15 cards', denseCards(document, 'Malachi 4:6').length === 15);
  check('Malachi 4:5 no-Strong\'s record still shows its gloss', denseCards(document, 'Malachi 4:5')[3]?.gloss === 'to you⁺');
  window.close();
}

// ===========================================================================
// F — uncovered book notice (no 404, no OSHB under the preview label)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  goto(window, 'EXO', 1);
  await waitFor(() => /outside the preview/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('uncovered book shows the coverage notice', /outside the preview/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('uncovered book does not show a load error', !document.querySelector('.interlinear-error'));
  check('uncovered book renders no preview cards', document.querySelectorAll('.interlinear-verse .iw').length === 0);
  check('no EXO chunk script is requested', ![...document.querySelectorAll('script')].some((s) => /berean-hebrew\/EXO\.js$/.test(s.src)));
  window.close();
}

// ===========================================================================
// G — Reading vs Study expansion; manifest-aware missing-data failure
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  check('Reading renders dense cards (no toggles)', blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw-toggle').length === 0);
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Genesis 1:1').length === 7);
  const btn = blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw-toggle')[0];
  const detailEl = blockByRef(document, 'Genesis 1:1').querySelector('.iw-detail');
  btn.click();
  await waitFor(() => detailEl.hidden === false);
  const detail = detailEl.textContent || '';
  check('Study expansion shows gloss, morphology, Strong\'s, source, provenance',
    /Berean Hebrew reading gloss/.test(detail) && /Prep-b/.test(detail) && /H7225/.test(detail) && /Source/.test(detail) && /Provenance/.test(detail), detail.slice(0, 200));
  window.close();
}
{
  // Missing GEN chunk: error card with Retry, reader unaffected.
  const dom = await createDom({
    onScript(window, child) {
      if (String(child.src).includes('data/berean-hebrew/GEN.js')) {
        setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
        return true;
      }
      return false;
    },
  });
  const { window } = dom; const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-berean-he', true);
  const failed = await waitFor(() => document.querySelector('.interlinear-error'));
  check('missing GEN chunk shows an interlinear error with Retry', failed && !!document.querySelector('.interlinear-error button'));
  toggle(window, 'interlinear-berean-he', false);
  toggle(window, 'interlinear-he', true);
  const oshb = await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0);
  check('reader survives a failed GEN chunk (OSHB still works)', oshb);
  window.close();
}

// ===========================================================================
// H — synthetic missing-gloss and multiple Strong's (in-memory only)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  window.MARANATHA_BEREAN_HEBREW_GEN.books.GEN[0][5] = [
    { surface: '\u05d0', transliteration: 'multi', morphology: 'N-ms', strongs: null, strongsList: ['9999', '8888'], gloss: 'and', glossStatus: 'translated' },
    { surface: '\u05d1', transliteration: 'none', morphology: 'N-ms', strongs: null, strongsList: [], gloss: null, glossStatus: 'missing' },
  ];
  goto(window, 'GEN', 1);
  await waitFor(() => denseCards(document, 'Genesis 1:6').length === 2);
  const c = denseCards(document, 'Genesis 1:6');
  check('synthetic missing gloss shows a distinct marker', c[1]?.gloss === '\u2014', JSON.stringify(c[1]));
  check('synthetic multiple Strong\'s numbers are all shown', c[0]?.meta === 'H9999 H8888', JSON.stringify(c[0]));
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Genesis 1:6').length === 2);
  const missingDetail = (await openDetailEl(document, 'Genesis 1:6', 1)).textContent || '';
  check('Study distinguishes missing gloss and never injects dictionary prose', /no gloss in source/.test(missingDetail) && !/Definition/.test(missingDetail));
  const fixtureText = fs.readFileSync(path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'hebrew.fixture.json'), 'utf8');
  check('the real fixture was not altered for synthetic cases', !fixtureText.includes('9999'));
  window.close();
}

// ===========================================================================
// I — unchanged OSHB and Greek interlinears; exclusivity
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  goto(window, 'GEN', 1);
  toggle(window, 'interlinear-he', true);
  check('OSHB Hebrew still renders expandable cards', await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0));
  check('OSHB view has no preview coverage notice', document.querySelectorAll('.interlinear-coverage').length === 0);
  toggle(window, 'interlinear-berean-he', true);
  check('selecting the preview releases OSHB Hebrew', document.getElementById('interlinear-he').checked === false);
  await waitFor(() => denseCards(document, 'Genesis 1:1').length === 7);
  toggle(window, 'interlinear-he', true);
  check('selecting OSHB Hebrew releases the preview', document.getElementById('interlinear-berean-he').checked === false);
  toggle(window, 'interlinear-he', false);

  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  const bg = await waitFor(() => denseCards(document, 'John 6:50').length === 17);
  check('Berean Greek still renders 17/38 dense tokens', bg && denseCards(document, 'John 6:51').length === 38);
  toggle(window, 'interlinear', true);
  check('Berean Greek and Byzantine remain mutually exclusive', document.getElementById('interlinear-berean').checked === false);
  check('Byzantine Greek behavior unchanged', await waitFor(() => disclosureCards(document, 'John 6:50').length === 17 && disclosureCards(document, 'John 6:50')[5]?.gloss === 'from'));
  window.close();
}

// ===========================================================================
// Offline / generated-data integrity (static + repeatable check)
// ===========================================================================
{
  const sw = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
  check('service worker routes data/berean-hebrew/ through the data cache', /berean-hebrew\\\//.test(sw) && sw.includes('isTranslationFile'));
  const shellList = (sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/) || [])[1] || '';
  check('preview runtime files are not precached in the shell', !/berean-hebrew/.test(shellList));
  check('data cache version unchanged (v3)', /DATA_CACHE_VERSION\s*=\s*'v3'/.test(sw));

  const { assemble } = await import('./import-berean-hebrew.mjs');
  const { files } = assemble();
  let changed = 0;
  for (const [rel, text] of Object.entries(files)) {
    if (fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n')) changed++;
  }
  check('committed runtime files match the fixture (deterministic, no hand-editing)', changed === 0, `${changed} changed`);
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Berean Hebrew preview checks passed.`);
process.exit(failed ? 1 : 0);
