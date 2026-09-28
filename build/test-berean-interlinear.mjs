// test-berean-interlinear.mjs
//
// Repeatable runtime tests for the Berean Interlinear Bible NT integration.
// Loads the real app under jsdom from file:// and drives the real controls.
//
//   node build/test-berean-interlinear.mjs
//
// Requires jsdom (devDependency). Covers: chunk loading, John 6:50-51 fields,
// G1537 source glosses, intentional blanks, Byzantine<->Berean switching,
// Hebrew isolation, missing-chunk failure + retry, duplicate-load suppression,
// file:// operation, and offline/service-worker asset coverage.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

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
function blockByRef(document, ref) {
  return [...document.querySelectorAll('.interlinear-verse')]
    .find((b) => b.querySelector('.interlinear-ref')?.textContent === ref);
}
function readCards(document, ref) {
  const b = blockByRef(document, ref);
  if (!b) return [];
  return [...b.querySelectorAll('.iw-toggle')].map((btn) => ({
    surface: btn.querySelector('.iw-greek')?.textContent,
    translit: btn.querySelector('.iw-translit')?.textContent,
    gloss: btn.querySelector('.iw-gloss-short')?.textContent,
  }));
}
function refEndsWith(document, suffix) {
  return [...document.querySelectorAll('.interlinear-verse')]
    .find((b) => (b.querySelector('.interlinear-ref')?.textContent || '').endsWith(suffix));
}
async function gotoCards(window, bookId, chapter, verse) {
  goto(window, bookId, chapter);
  await waitFor(() => refEndsWith(window.document, `:${verse}`));
  const block = refEndsWith(window.document, `:${verse}`);
  const cards = block ? [...block.querySelectorAll('.iw-toggle')].map((btn) => ({
    surface: btn.querySelector('.iw-greek')?.textContent,
    translit: btn.querySelector('.iw-translit')?.textContent,
    gloss: btn.querySelector('.iw-gloss-short')?.textContent,
  })) : [];
  return { block, cards };
}
function chunkBooks(id) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', 'berean', `${id}.js`), 'utf8'), sandbox);
  return sandbox.window[`MARANATHA_BEREAN_${id}`].books[id];
}
function studyCards(document, ref) {
  const b = blockByRef(document, ref);
  if (!b) return [];
  return [...b.querySelectorAll('.iw:not(.iw-toggle)')].map((c) => ({
    surface: c.querySelector('.iw-greek')?.textContent,
    translit: c.querySelector('.iw-translit')?.textContent,
    gloss: c.querySelector('.iw-gloss')?.textContent,
  }));
}

// ===========================================================================
// Scenario A — normal file:// use, fields, switching, Hebrew isolation
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  check('runs from file://', window.location.protocol === 'file:');

  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  const loaded = await waitFor(() => readCards(document, 'John 6:50').length > 0);
  check('selecting Berean loads the John chunk and renders', loaded);

  const c50 = readCards(document, 'John 6:50');
  const c51 = readCards(document, 'John 6:51');
  check('Berean John 6:50 has 17 cards', c50.length === 17, `got ${c50.length}`);
  check('Berean John 6:51 has 38 cards', c51.length === 38, `got ${c51.length}`);
  check('Berean surface is Berean\'s own Greek (οὗτός)', c50[0]?.surface === 'οὗτός', c50[0]?.surface);
  check('Berean uses its own transliteration (houtos)', c50[0]?.translit === 'houtos', c50[0]?.translit);
  check('Berean shows its own contextual gloss (This)', c50[0]?.gloss === 'This', c50[0]?.gloss);
  check('John 6:50 G1537 ἐκ gloss is "from" (not dictionary boilerplate)', c50[5]?.surface === 'ἐκ' && c50[5]?.gloss === 'from', JSON.stringify(c50[5]));
  check('John 6:50 G1537 ἐξ gloss is "of"', c50[11]?.surface === 'ἐξ' && c50[11]?.gloss === 'of', JSON.stringify(c50[11]));
  check('John 6:51 G1537 ἐκ glosses are from/of',
    c51[7]?.gloss === 'from' && c51[14]?.gloss === 'of', JSON.stringify([c51[7], c51[14]]));
  check('intentional "-" token (6:51 ὁ at index 4) renders an empty gloss', c51[4]?.gloss === '', `${JSON.stringify(c51[4])}`);
  check('an untranslated Berean token does NOT fall back to Strong\'s ("the")', c51[4]?.gloss === '' && c51[0]?.gloss === 'I');

  // Detail panel: Berean reading gloss + Strong's + morphology.
  const block = blockByRef(document, 'John 6:50');
  block.querySelectorAll('.iw-toggle')[0].click();
  const detail = document.querySelector('.interlinear-details .iw-detail:not([hidden])')?.textContent || '';
  check('Read-mode detail labels the Berean reading gloss', /Berean reading gloss/.test(detail), detail.slice(0, 120));
  check('Read-mode detail retains Strong\'s and morphology', /G3778/.test(detail) && /DPro-NMS/.test(detail), detail.slice(0, 160));

  // Study mode: dense cards, Berean transliteration + gloss.
  const mode = document.getElementById('interlinear-berean-mode');
  mode.value = 'study';
  mode.dispatchEvent(new window.Event('change'));
  await waitFor(() => studyCards(document, 'John 6:51').length > 0);
  const s51 = studyCards(document, 'John 6:51');
  check('Study mode renders 38 Berean dense cards', s51.length === 38, `got ${s51.length}`);
  check('Study mode keeps Berean transliteration/gloss', s51[0]?.translit === 'egō' && s51[0]?.gloss === 'I', JSON.stringify(s51[0]));
  mode.value = 'read';
  mode.dispatchEvent(new window.Event('change'));
  await waitFor(() => readCards(document, 'John 6:50').length === 17);

  // Switch Berean -> Byzantine: byz has 41 tokens at 6:51; the optional
  // candidate layer loads asynchronously, so wait for the candidate gloss.
  toggle(window, 'interlinear', true);
  await waitFor(() => readCards(document, 'John 6:51').length === 41
    && readCards(document, 'John 6:50')[5]?.gloss === 'from');
  const b51 = readCards(document, 'John 6:51');
  const b50 = readCards(document, 'John 6:50');
  check('switching to Byzantine restores 41-token John 6:51', b51.length === 41, `got ${b51.length}`);
  check('Byzantine John 6:50 uses the candidate gloss ("from")', b50[5]?.gloss === 'from', JSON.stringify(b50[5]));
  check('Byzantine and Berean are mutually exclusive in the UI',
    document.getElementById('interlinear-berean').checked === false);

  // Switch Byzantine -> Berean again.
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => readCards(document, 'John 6:51').length === 38);
  check('switching back to Berean restores 38 tokens', readCards(document, 'John 6:51').length === 38);
  check('switching back to Berean restores Berean glosses', readCards(document, 'John 6:51')[0]?.translit === 'egō');

  // Hebrew isolation.
  toggle(window, 'interlinear-berean', false);
  toggle(window, 'interlinear-he', true);
  goto(window, 'GEN', 1);
  const heb = await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-hebrew').length > 0);
  check('Hebrew interlinear still renders independently', heb);
  check('Hebrew view contains no Berean Greek cards', document.querySelectorAll('.interlinear-verse .iw-greek').length === 0);

  window.close();
}

// ===========================================================================
// Scenario B — missing chunk fails safely and permits retry
// ===========================================================================
{
  let allowLoad = false;
  const dom = await createDom({
    onScript(window, child) {
      if (!allowLoad && String(child.src).includes('data/berean/JHN.js')) {
        setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
        return true; // intercepted (not appended)
      }
      return false;
    },
  });
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);

  const shownError = await waitFor(() => document.querySelector('.interlinear-error'));
  check('missing Berean chunk shows an interlinear-specific error', shownError);
  check('error offers a Retry button', !!document.querySelector('.interlinear-error button'));

  // Reader is not broken: Byzantine still works.
  toggle(window, 'interlinear-berean', false);
  toggle(window, 'interlinear', true);
  const byzOk = await waitFor(() => readCards(document, 'John 6:50').length === 17);
  check('reader survives a failed Berean chunk (Byzantine still works)', byzOk);
  toggle(window, 'interlinear', false);

  // Retry after the chunk becomes available.
  allowLoad = true;
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => document.querySelector('.interlinear-error'));
  document.querySelector('.interlinear-error button').click();
  const recovered = await waitFor(() => readCards(document, 'John 6:50').length === 17);
  check('Retry reloads the chunk and renders', recovered);

  window.close();
}

// ===========================================================================
// Scenario C — duplicate selection does not duplicate scripts/data
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => readCards(document, 'John 6:50').length === 17);
  const count = () => [...document.querySelectorAll('script')].filter((s) => /data\/berean\/JHN\.js$/.test(s.src)).length;
  check('selecting Berean injects exactly one John chunk script', count() === 1, `got ${count()}`);
  toggle(window, 'interlinear-berean', false);
  toggle(window, 'interlinear-berean', true);
  await sleep(300);
  check('re-selecting Berean does not inject a duplicate chunk script', count() === 1, `got ${count()}`);
  window.close();
}

// ===========================================================================
// Scenario D — all 19 reviewed display-compound cases (issue 1)
// ===========================================================================
const COMPOUNDS = [
  ['MAT', 6, 1, 16, 'μή γε', 'mē ge'],
  ['MAT', 7, 20, 0, 'ἄρα γε', 'ara ge'],
  ['MAT', 9, 17, 9, 'μή γε', 'mē ge'],
  ['MAT', 17, 26, 9, 'Ἄρα γε', 'Ara ge'],
  ['MAT', 25, 9, 5, 'Μή ποτε', 'Mē pote'],
  ['MRK', 3, 4, 6, 'ἀγαθὸν ποιῆσαι', 'agathon poiēsai'],
  ['MRK', 6, 23, 4, 'Ὅ τι', 'Ho ti'],
  ['LUK', 5, 36, 19, 'μή γε', 'mē ge'],
  ['LUK', 5, 37, 10, 'μή γε', 'mē ge'],
  ['LUK', 10, 6, 14, 'μή γε', 'mē ge'],
  ['LUK', 13, 9, 9, 'μή γε', 'mē ge'],
  ['LUK', 14, 32, 2, 'μή γε', 'mē ge'],
  ['JHN', 8, 8, 2, 'κάτω κύψας', 'katō kypsas'],
  ['JHN', 8, 25, 12, 'ὅ τι', 'ho ti'],
  ['JHN', 14, 13, 1, 'ὅ τι', 'ho ti'],
  ['JHN', 15, 16, 23, 'ὅ τι', 'ho ti'],
  ['1CO', 16, 2, 9, 'ὅ τι', 'ho ti'],
  ['2CO', 11, 16, 10, 'μή γε', 'mē ge'],
  ['REV', 16, 16, 9, 'Ἁρμαγεδών', 'Harmagedōn'],
];
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'MAT', 1);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle').length > 0);

  for (const [book, ch, verse, order, surface, translit] of COMPOUNDS) {
    const { cards } = await gotoCards(window, book, ch, verse);
    const c = cards[order];
    check(`compound ${book} ${ch}:${verse} #${order + 1} = "${surface}"`,
      c && c.surface === surface && c.translit === translit,
      c ? JSON.stringify([c.surface, c.translit]) : 'no card');
  }

  // Contextual distinction: the compound "ὅ τι" is a two-word relative form,
  // while the ordinary conjunction ὅτι remains a single word in the data.
  const jhn = chunkBooks('JHN');
  let plainHoti = false;
  for (const ch of jhn) if (ch) for (const vs of ch) if (vs) for (const t of vs) if (t && t[3] === '3754' && t[0] === 'ὅτι') plainHoti = true;
  check('plain single-word conjunction ὅτι remains distinct from ὅ τι', plainHoti);

  window.close();
}

// ===========================================================================
// Scenario E — documented source omissions render explicitly (issue 3)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 5);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => document.querySelectorAll('.interlinear-verse').length > 0);

  const chapOm = refEndsWith(document, 'John 5:4');
  check('John 5:4 renders an omission block in chapter view',
    !!chapOm && chapOm.classList.contains('interlinear-omission'));
  check('John 5:4 notice is not framed as a load failure',
    /not present in the Berean Greek source/.test(chapOm?.querySelector('.interlinear-omission-note')?.textContent || ''));
  check('John 5:3 still renders as a normal verse', !!refEndsWith(document, 'John 5:3')?.querySelector('.iw-toggle'));

  // Direct-reference view.
  document.getElementById('reference').value = 'John 5:4';
  document.getElementById('reference-go').click();
  await waitFor(() => {
    const b = refEndsWith(document, 'John 5:4');
    return b && b.classList.contains('interlinear-omission');
  });
  check('John 5:4 omission renders in direct-reference view',
    !!refEndsWith(document, 'John 5:4')?.classList.contains('interlinear-omission'));

  // A second omission in another book.
  goto(window, 'ACT', 8);
  await waitFor(() => refEndsWith(document, 'Acts 8:37'));
  const actOm = refEndsWith(document, 'Acts 8:37');
  check('Acts 8:37 renders an omission block', !!actOm && actOm.classList.contains('interlinear-omission'));
  check('Acts 8:36 renders normally next to the omission', !!refEndsWith(document, 'Acts 8:36')?.querySelector('.iw-toggle'));

  window.close();
}

// ===========================================================================
// Scenario F — shared Strong's dictionary is optional supplemental detail (issue 4)
// ===========================================================================
{
  const dom = await createDom();
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => readCards(document, 'John 6:50').length === 17);
  const strongsLoaded = await waitFor(() => window.MARANATHA_STRONGS_GREEK && Object.keys(window.MARANATHA_STRONGS_GREEK.definitions || {}).length > 0);
  check('shared Strong\'s dictionary loads as optional detail for Berean', strongsLoaded);
  blockByRef(document, 'John 6:50').querySelectorAll('.iw-toggle')[0].click();
  const detail = document.querySelector('.interlinear-details .iw-detail:not([hidden])')?.textContent || '';
  check('Definition row appears once the optional dictionary loads', /Definition/.test(detail), detail.slice(0, 120));
  check('Berean reading gloss stays primary in the detail', /Berean reading gloss/.test(detail));
  window.close();
}
{
  // Late loading: cards render before the optional dictionary arrives.
  let held = null;
  const dom = await createDom({
    onScript(window, child) {
      if (String(child.src).includes('data/strongs-greek.js')) { held = child; return true; }
      return false;
    },
  });
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => readCards(document, 'John 6:50').length === 17);
  check('Berean renders before the optional dictionary arrives', readCards(document, 'John 6:50').length === 17);
  check('dictionary is genuinely absent pre-release', !window.MARANATHA_STRONGS_GREEK);
  window.__origAppend(document.head, held);
  const late = await waitFor(() => {
    const block = blockByRef(document, 'John 6:50');
    if (!block) return false;
    block.querySelectorAll('.iw-toggle')[0].click();
    const d = document.querySelector('.interlinear-details .iw-detail:not([hidden])')?.textContent || '';
    return /Definition/.test(d);
  });
  check('optional dictionary late-load rerenders with Definition rows', late);
  window.close();
}
{
  // Non-fatal failure: Berean stays fully usable without the dictionary.
  const dom = await createDom({
    onScript(window, child) {
      if (String(child.src).includes('data/strongs-greek.js')) {
        setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
        return true;
      }
      return false;
    },
  });
  const { window } = dom;
  const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => readCards(document, 'John 6:50').length === 17);
  check('Berean still renders when the optional dictionary fails', readCards(document, 'John 6:50').length === 17);
  check('Berean gloss still shown when the optional dictionary fails', readCards(document, 'John 6:50')[5]?.gloss === 'from');
  blockByRef(document, 'John 6:50').querySelectorAll('.iw-toggle')[0].click();
  const detail = document.querySelector('.interlinear-details .iw-detail:not([hidden])')?.textContent || '';
  check('detail retains Strong\'s + morphology without the dictionary', /G3778/.test(detail) && /DPro-NMS/.test(detail));
  check('no Definition row when the optional dictionary failed', !/Definition/.test(detail));
  window.close();
}

// ===========================================================================
// Offline/service-worker coverage (static)
// ===========================================================================
{
  const sw = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');
  check('service worker routes data/berean chunks through the data cache',
    /\\\/data\\\/\(\?:berean\\\/\)\?/.test(sw) || /data\/\(\?:berean\/\)\?/.test(sw));
  const books = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
    '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
  check('service worker lists all 27 Berean books for opt-in caching',
    books.every((b) => sw.includes(`'${b}'`)));
  let missing = 0;
  for (const b of books) if (!fs.existsSync(path.join(ROOT, 'data', 'berean', `${b}.js`))) missing++;
  check('all 27 Berean chunk files exist', missing === 0, `${missing} missing`);
  const shellList = (sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/) || [])[1] || '';
  check('Berean chunks are not in the precached shell list (no mandatory startup payload)',
    !/data\/berean/.test(shellList));
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} Berean runtime checks passed.`);
process.exit(failed ? 1 : 0);
