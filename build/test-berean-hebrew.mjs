// test-berean-hebrew.mjs
//
// Runtime tests for the Berean Hebrew (draft) preview — Genesis, Exodus and
// Leviticus, plus the retained Daniel 2:4-5 and Malachi 4:5-6 pilot verses.
// Loads the real app under jsdom from file:// and drives the real controls.
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
const MANIFEST = loadGlobal('data/berean-hebrew/manifest-v3.js', 'MARANATHA_BEREAN_HEBREW_MANIFEST');
const GEN = loadGlobal(`data/berean-hebrew/${MANIFEST.chunkFiles.GEN}`, 'MARANATHA_BEREAN_HEBREW_GEN').books.GEN;
const EXO = loadGlobal(`data/berean-hebrew/${MANIFEST.chunkFiles.EXO}`, 'MARANATHA_BEREAN_HEBREW_EXO').books.EXO;
const LEV = loadGlobal(`data/berean-hebrew/${MANIFEST.chunkFiles.LEV}`, 'MARANATHA_BEREAN_HEBREW_LEV').books.LEV;
const DAN = loadGlobal(`data/berean-hebrew/${MANIFEST.chunkFiles.DAN}`, 'MARANATHA_BEREAN_HEBREW_DAN').books.DAN;
const MAL = loadGlobal(`data/berean-hebrew/${MANIFEST.chunkFiles.MAL}`, 'MARANATHA_BEREAN_HEBREW_MAL').books.MAL;
const VARIANTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'variants.json'), 'utf8'));
const variantBy = (bookId, ch, v, order) => VARIANTS.variants.find((x) => x.bookId === bookId && x.chapter === ch && x.verse === v && x.order === order);

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
// A — file:// loading; Genesis 1:1 glosses; versioned manifest; RTL/LTR
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  check('runs from file://', window.location.protocol === 'file:');
  const rendered = await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  check('selecting Berean Hebrew loads the versioned manifest + GEN chunk and renders', rendered);
  const srcs = () => [...document.querySelectorAll('script')].map((s) => s.src);
  check('versioned manifest (v3) is loaded via <script>', srcs().some((s) => /data\/berean-hebrew\/manifest-v3\.js$/.test(s)));
  check('earlier manifests are never requested', !srcs().some((s) => /data\/berean-hebrew\/manifest(-v2)?\.js$/.test(s)));
  check('versioned GEN chunk is loaded, not the stale GEN.js', srcs().some((s) => new RegExp(`berean-hebrew/${MANIFEST.chunkFiles.GEN}$`).test(s)) && !srcs().some((s) => /berean-hebrew\/GEN\.js$/.test(s)));
  const GEN_1_1 = ['In the beginning', 'created', 'God', '', 'the heavens', 'and', 'the earth'];
  const c = denseCards(document, 'Genesis 1:1');
  check('Genesis 1:1 has 7 cards', c.length === 7, `got ${c.length}`);
  check('Genesis 1:1 gloss sequence matches Berean', JSON.stringify(c.map((x) => x.gloss)) === JSON.stringify(GEN_1_1), JSON.stringify(c.map((x) => x.gloss)));
  check('Genesis 1:1 supplied transliteration preserved', c[0]?.translit === 'bə·rê·šîṯ', c[0]?.translit);
  check('word container is RTL', blockByRef(document, 'Genesis 1:1').querySelector('.interlinear-words')?.getAttribute('dir') === 'rtl');
  const first = blockByRef(document, 'Genesis 1:1').querySelectorAll('.iw')[0];
  check('transliteration and gloss containers are LTR', first.querySelector('.iw-translit')?.getAttribute('dir') === 'ltr' && first.querySelector('.iw-gloss')?.getAttribute('dir') === 'ltr');
  window.close();
}

// ===========================================================================
// B — coverage & totals; Genesis/Exodus/Leviticus navigation
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 1, 'Genesis 1:1');
  check('manifest reports 49,333 records across GEN/EXO/LEV/DAN/MAL',
    MANIFEST.recordCount === 49333 && JSON.stringify(MANIFEST.books) === JSON.stringify(['GEN', 'EXO', 'LEV', 'DAN', 'MAL']),
    JSON.stringify([MANIFEST.recordCount, MANIFEST.books]));
  check('coverage names Genesis 1-50, Exodus 1-40 and Leviticus 1-27',
    /Genesis 1\u201350/.test(MANIFEST.coverage) && /Exodus 1\u201340/.test(MANIFEST.coverage) && /Leviticus 1\u201327/.test(MANIFEST.coverage), MANIFEST.coverage);
  check('GEN 20,613 / EXO 16,713 / LEV 11,950 records',
    MANIFEST.booksRecordCount.GEN === 20613 && MANIFEST.booksRecordCount.EXO === 16713 && MANIFEST.booksRecordCount.LEV === 11950, JSON.stringify(MANIFEST.booksRecordCount));
  check('GEN 50 / EXO 40 / LEV 27 chapters', GEN.filter(Boolean).length === 50 && EXO.filter(Boolean).length === 40 && LEV.filter(Boolean).length === 27);
  for (const [ch, v, expected] of [[1, 1, 7], [2, 4, 11], [8, 17, 21], [50, 26, 11]]) {
    goto(window, 'GEN', ch);
    await waitFor(() => blockByRef(document, `Genesis ${ch}:${v}`));
    check(`Genesis ${ch}:${v} renders ${expected} cards`, denseCards(document, `Genesis ${ch}:${v}`).length === expected);
  }
  check('navigation to Genesis 50:26 works', !!blockByRef(document, 'Genesis 50:26'));
  for (const [ch, v, expected] of [[1, 1, 11], [3, 15, 28], [12, 1, 9], [40, 38, 16]]) {
    goto(window, 'EXO', ch);
    await waitFor(() => blockByRef(document, `Exodus ${ch}:${v}`));
    check(`Exodus ${ch}:${v} renders ${expected} cards`, denseCards(document, `Exodus ${ch}:${v}`).length === expected);
  }
  check('navigation to Exodus 40:38 works', !!blockByRef(document, 'Exodus 40:38'));
  for (const [ch, v, expected] of [[1, 1, 9], [4, 12, 22], [11, 12, 10], [16, 22, 13], [19, 18, 12], [23, 8, 14], [25, 8, 18], [27, 30, 11], [27, 34, 12]]) {
    goto(window, 'LEV', ch);
    await waitFor(() => blockByRef(document, `Leviticus ${ch}:${v}`));
    check(`Leviticus ${ch}:${v} renders ${expected} cards`, denseCards(document, `Leviticus ${ch}:${v}`).length === expected);
  }
  check('navigation to Leviticus 27:34 works', !!blockByRef(document, 'Leviticus 27:34'));
  window.close();
}

// ===========================================================================
// C — divine-name fidelity (source convention preserved, not standardized)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'GEN', 2, 'Genesis 2:4');
  const genYhwh = denseCards(document, 'Genesis 2:4').find((x) => x.meta === 'H3068');
  check('Genesis divine name preserved (Yah·weh / YHWH)', genYhwh?.translit === 'Yah·weh' && genYhwh?.gloss === 'YHWH', JSON.stringify(genYhwh));
  goto(window, 'EXO', 3);
  await waitFor(() => blockByRef(document, 'Exodus 3:15'));
  const exoYhwh = denseCards(document, 'Exodus 3:15').find((x) => x.meta === 'H3068');
  check('Exodus divine name preserved (Yah·weh / YHWH)', exoYhwh?.translit === 'Yah·weh' && exoYhwh?.gloss === 'YHWH', JSON.stringify(exoYhwh));
  goto(window, 'LEV', 1);
  await waitFor(() => blockByRef(document, 'Leviticus 1:1'));
  const levYhwh = denseCards(document, 'Leviticus 1:1').find((x) => x.meta === 'H3068');
  check('Leviticus divine name preserved (Yah·weh / YHWH)', levYhwh?.translit === 'Yah·weh' && levYhwh?.gloss === 'YHWH', JSON.stringify(levYhwh));
  window.close();
}

// ===========================================================================
// D — verified variants: Genesis 8:17, Exodus 22:5, Leviticus 16:21, Daniel 2:4
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'LEV', 16, 'Leviticus 16:21');
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Leviticus 16:21').length === 31);
  const l = variantBy('LEV', 16, 21, 4);
  const lel = await openDetailEl(document, 'Leviticus 16:21', 4);
  const ldetail = lel.textContent || '';
  check('Leviticus 16:21 detail shows the exact OSHB Qere', ldetail.includes(l.oshbQere), JSON.stringify(l.oshbQere));
  check('Leviticus 16:21 variant is labelled an OSHB comparison', /OSHB comparison/.test(ldetail));
  check('Leviticus 16:21 card count unchanged (31)', disclosureCards(document, 'Leviticus 16:21').length === 31);
  window.close();
}

// ===========================================================================
// E — retained Daniel/Malachi pilot verses + Daniel variant
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'DAN', 2, 'Daniel 2:4');
  check('retained Daniel 2:4 has 12 cards', denseCards(document, 'Daniel 2:4').length === 12);
  check('retained Daniel 2:5 has 17 cards', denseCards(document, 'Daniel 2:5').length === 17);
  check('Daniel 2:4 Aramaic split preserved', DAN[1][3][0].language === 'hebrew' && DAN[1][3][4].language === 'aramaic');
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Daniel 2:4').length === 12);
  const v24 = variantBy('DAN', 2, 4, 9);
  check('Daniel 2:4 detail shows the exact OSHB Qere', ((await openDetailEl(document, 'Daniel 2:4', 9)).textContent || '').includes(v24.oshbQere));
  setMode(window, 'interlinear-berean-he-mode', 'read');
  await waitFor(() => denseCards(document, 'Daniel 2:5').length === 17);
  goto(window, 'MAL', 4);
  await waitFor(() => blockByRef(document, 'Malachi 4:5'));
  check('retained Malachi 4:5 has 13 cards', denseCards(document, 'Malachi 4:5').length === 13);
  check('retained Malachi 4:6 has 15 cards', denseCards(document, 'Malachi 4:6').length === 15);
  window.close();
}

// ===========================================================================
// F — lazy loading (each book alone) and uncovered-book notice
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  const srcs = () => [...document.querySelectorAll('script')].map((s) => s.src);
  await openPilot(window, 'EXO', 1, 'Exodus 1:1');
  check('Exodus loads its own EXO chunk', srcs().some((s) => /data\/berean-hebrew\/EXO\.js$/.test(s)));
  check('loading Exodus does not load Genesis/Leviticus/Daniel/Malachi chunks',
    !srcs().some((s) => /data\/berean-hebrew\/(GEN(-v\d+)?|LEV|DAN|MAL)\.js$/.test(s)));
  window.close();
}
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  const srcs = () => [...document.querySelectorAll('script')].map((s) => s.src);
  await openPilot(window, 'LEV', 1, 'Leviticus 1:1');
  check('Leviticus loads its own LEV chunk', srcs().some((s) => /data\/berean-hebrew\/LEV\.js$/.test(s)));
  check('loading Leviticus does not load Genesis/Exodus/Daniel/Malachi chunks',
    !srcs().some((s) => /data\/berean-hebrew\/(GEN(-v\d+)?|EXO|DAN|MAL)\.js$/.test(s)));
  goto(window, 'NUM', 1);
  await waitFor(() => /outside the preview/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('uncovered book (Numbers) shows the coverage notice', /outside the preview/.test(document.querySelector('#results .empty')?.textContent || ''));
  check('uncovered book does not show a load error', !document.querySelector('.interlinear-error'));
  check('no NUM chunk is requested', !srcs().some((s) => /berean-hebrew\/NUM\.js$/.test(s)));
  window.close();
}

// ===========================================================================
// G — Reading vs Study expansion; missing-chunk failure
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  await openPilot(window, 'LEV', 11, 'Leviticus 11:12');
  check('Reading renders dense cards', blockByRef(document, 'Leviticus 11:12').querySelectorAll('.iw-toggle').length === 0);
  setMode(window, 'interlinear-berean-he-mode', 'study');
  await waitFor(() => disclosureCards(document, 'Leviticus 11:12').length === 10);
  const block = blockByRef(document, 'Leviticus 11:12');
  const btn = block.querySelectorAll('.iw-toggle')[0];
  const detailEl = block.querySelector('.iw-detail');
  btn.click();
  await waitFor(() => detailEl.hidden === false);
  const detail = detailEl.textContent || '';
  check('Study expansion shows gloss, source, provenance', /Berean Hebrew reading gloss/.test(detail) && /Source/.test(detail) && /Provenance/.test(detail), detail.slice(0, 200));
  window.close();
}
{
  const dom = await createDom({
    onScript(window, child) {
      if (String(child.src).includes('data/berean-hebrew/LEV.js')) {
        setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
        return true;
      }
      return false;
    },
  });
  const { window } = dom; const { document } = window;
  goto(window, 'LEV', 1);
  toggle(window, 'interlinear-berean-he', true);
  const failed = await waitFor(() => document.querySelector('.interlinear-error'));
  check('missing LEV chunk shows an interlinear error with Retry', failed && !!document.querySelector('.interlinear-error button'));
  toggle(window, 'interlinear-berean-he', false);
  toggle(window, 'interlinear-he', true);
  check('reader survives a failed LEV chunk (OSHB still works)', await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0));
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
  goto(window, 'LEV', 1);
  toggle(window, 'interlinear-he', true);
  check('OSHB Hebrew still renders expandable cards', await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle .iw-hebrew').length > 0));
  check('OSHB view has no preview coverage notice', document.querySelectorAll('.interlinear-coverage').length === 0);
  toggle(window, 'interlinear-berean-he', true);
  check('selecting the preview releases OSHB Hebrew', document.getElementById('interlinear-he').checked === false);
  await waitFor(() => denseCards(document, 'Leviticus 1:1').length === 9);
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
    if (!fs.existsSync(path.join(ROOT, rel)) || fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n')) changed++;
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
