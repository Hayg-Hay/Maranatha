// test-delitzsch-group.mjs
//
// Behavioral tests for the grouped "Delitzsch Hebrew NT" control: one checkbox
// plus an edition dropdown that selects between the two independent editions
// (delitzsch1901 default, delitzsch). Drives the real app from file://.
//
//   node build/test-delitzsch-group.mjs

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
// Niqqud/te'amim only (excludes maqaf and sof pasuq punctuation).
const NIQQUD = /[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/;
const groupBox = (w) => w.document.querySelector('#translation-group-delitzsch');
const editionSelect = (w) => w.document.querySelector('#edition-delitzsch');
const groupOption = (w) => groupBox(w).closest('.translation-option');
function chooseEdition(w, id) { const s = editionSelect(w); s.value = id; s.dispatchEvent(new w.Event('change')); }
function toggleGroup(w, on) { const b = groupBox(w); b.checked = on; b.dispatchEvent(new w.Event('change')); }
function toggleTranslation(w, id, on) {
  const b = w.document.querySelector(`#translations input[value="${id}"]`);
  b.checked = on; b.dispatchEvent(new w.Event('change'));
}
function goRef(w, ref) { w.document.querySelector('#reference').value = ref; w.document.querySelector('#reference-go').click(); }

// ---------------------------------------------------------------------------
// 1. Grouped control shape, defaults, accessibility and unchecked behaviour
// ---------------------------------------------------------------------------
{
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;

  // exactly one Delitzsch checkbox, and no individual edition checkboxes
  assert(groupBox(w), 'group checkbox missing');
  assert.equal(d.querySelectorAll('#translations input[value="delitzsch"]').length, 1, 'delitzsch value appears once (the group checkbox)');
  assert.equal(d.querySelector('#translations input[value="delitzsch"]'), groupBox(w), 'the value=delitzsch input is the group checkbox');
  assert(!d.querySelector('#translations input[value="delitzsch1901"]'), 'no standalone delitzsch1901 checkbox');

  // dropdown options + default
  const options = [...editionSelect(w).options].map((o) => o.value);
  assert.deepEqual(options, ['delitzsch1901', 'delitzsch']);
  assert.equal(editionSelect(w).value, 'delitzsch1901', 'default edition is 1901');
  assert.match(d.querySelector('label[for="edition-delitzsch"]').textContent, /Edition/);
  assert.match(groupOption(w).querySelector('.version').textContent, /Delitzsch Hebrew NT/);
  assert.equal(editionSelect(w).disabled, false);

  // startup selection unchanged: web on, Delitzsch off, neither edition loaded
  assert(d.querySelector('#translations input[value="web"]').checked, 'web still default-selected');
  assert(!groupBox(w).checked, 'group is not selected by default');
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch, undefined);
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch1901, undefined);
  check('1. one grouped checkbox, default edition 1901, startup selection unchanged', true);

  // while UNCHECKED, changing the dropdown only changes the chosen edition
  chooseEdition(w, 'delitzsch');
  await sleep(120);
  assert.equal(groupBox(w).checked, false);
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch, undefined, 'unchecked dropdown must not load the edition');
  assert.equal(w.MARANATHA_TRANSLATIONS.delitzsch1901, undefined);
  assert.match(groupOption(w).querySelector('.translation-source p').textContent, /does not identify its underlying print edition/);
  assert(!groupOption(w).querySelector('.translation-warning'), 'no Under audit warning');
  check('2. unchecked dropdown changes edition only — no select, no load', true);

  // checking loads the chosen edition (delitzsch, from the step above)
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.delitzsch);
  assert([...d.querySelectorAll('script[src]')].some((s) => /data\/delitzsch\.js/.test(s.src)));
  const scriptsAfterFirstLoad = d.querySelectorAll('script[src]').length;

  // keep chosen edition when unchecked and re-checked: delitzsch stays chosen,
  // and it does not reload.
  toggleGroup(w, false);
  assert.equal(editionSelect(w).value, 'delitzsch', 'edition choice kept while unchecked');
  toggleGroup(w, true);
  await sleep(120);
  assert.equal(editionSelect(w).value, 'delitzsch', 'edition choice kept when re-checked');
  assert.equal(d.querySelectorAll('script[src]').length, scriptsAfterFirstLoad, 'already-loaded edition is not re-fetched');
  check('3. chosen edition kept across uncheck/re-check without reloading', true);

  // switching editions while checked loads the other edition and refreshes
  goRef(w, 'John 1');
  chooseEdition(w, 'delitzsch1901');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  assert([...d.querySelectorAll('script[src]')].some((s) => /data\/delitzsch1901\.js/.test(s.src)));
  assert.equal(d.querySelector('#message').textContent, '');
  assert(d.querySelector('.hebrew-verse'));
  // 1901 chapter-numbering notice appears for the affected chapter
  assert(d.querySelector('.versification-notice'), '1901 versification notice expected');
  // and switching back to eBible removes it
  chooseEdition(w, 'delitzsch');
  await sleep(120);
  assert(!d.querySelector('.versification-notice'), 'no versification notice for the eBible edition');
  chooseEdition(w, 'delitzsch1901');
  await sleep(120);
  check('4. switching editions while checked loads and refreshes; versification notice follows the edition', true);

  assert.deepEqual(w.__remoteRequests, []);
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 2. Preserve reference, context and other selected translations
// ---------------------------------------------------------------------------
{
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'John 3:16');
  d.querySelector('#context-toggle').click();
  assert.match(d.querySelector('#context-toggle').textContent, /Hide context/);
  chooseEdition(w, 'delitzsch');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  assert.equal(d.querySelector('#reference').value, 'John 3:16', 'reference preserved');
  assert.match(d.querySelector('#context-toggle').textContent, /Hide context/, 'context setting preserved');
  assert(d.querySelector('#translations input[value="web"]').checked, 'other selected translation preserved');
  assert.equal(d.querySelectorAll('#translations input:checked').length, 2, 'web plus the Delitzsch group are selected');
  assert.deepEqual(w.__remoteRequests, []);
  check('5. current reference, context and other translations preserved on switch', true);
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 3. Edition-specific references handled clearly (never silently substituted)
// ---------------------------------------------------------------------------
{
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'John 1:52'); // exists only in the 1901 edition
  assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /1:52/);
  // switch to the eBible edition, which has only 51 verses here
  chooseEdition(w, 'delitzsch');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  assert.equal(d.querySelector('#reference').value, 'John 1:52');
  assert.match(d.querySelector('#results').textContent, /verse not available in this translation/, 'missing verse must be shown as unavailable');
  check('6. reference only in the previous edition is shown as unavailable (no substitution)', true);
  dom.window.close();
}
{
  // Fresh session where only the eBible edition is ever chosen: 1:52 cannot parse.
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  chooseEdition(w, 'delitzsch');
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  goRef(w, 'John 1:52');
  assert.notEqual(d.querySelector('#message').textContent, '', 'out-of-range reference must be reported');
  assert.match(d.querySelector('#message').textContent, /last verse 51|not a reference available/);
  check('7. out-of-range reference reports clearly instead of substituting', true);
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 4. Search selector/state, comparison and interlinear captions
// ---------------------------------------------------------------------------
{
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  const searchSel = d.querySelector('#search-translation');
  await waitFor(() => [...searchSel.options].some((o) => o.value === 'delitzsch1901'));
  assert([...searchSel.options].some((o) => o.value === 'delitzsch1901'));
  assert(![...searchSel.options].some((o) => o.value === 'delitzsch'), 'inactive edition must not be a search source');
  searchSel.value = 'delitzsch1901';
  d.querySelector('#search').value = 'המשיח';
  d.querySelector('#search-go').click();
  assert(d.querySelector('.search-hit'));
  assert.match(d.querySelector('.result-head small').textContent, /1901, vocalized/);
  // switch edition DURING search -> results follow the active edition
  chooseEdition(w, 'delitzsch');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  await waitFor(() => /1877/.test(d.querySelector('.result-head small').textContent));
  assert(d.querySelector('.search-hit'), 'results still present after switching');
  assert.match(d.querySelector('.result-head small').textContent, /1877/, 'search results now from the eBible edition');
  assert.equal(searchSel.value, 'delitzsch', 'search-in selector follows the active edition');
  assert([...searchSel.options].some((o) => o.value === 'delitzsch'));
  assert(![...searchSel.options].some((o) => o.value === 'delitzsch1901'));
  // comparison panel uses only selected translations
  d.querySelector('.compare-toggle')?.click();
  if (d.querySelector('.compare-panel')) {
    const labels = [...d.querySelectorAll('.compare-label')].map((x) => x.textContent).join('|');
    assert(!/1901/.test(labels), 'comparison must not include the inactive edition');
  }
  assert.deepEqual(w.__remoteRequests, []);
  check('8. search selector/state, comparison and switching during search', true);
  dom.window.close();
}
{
  // interlinear caption follows the active edition
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  toggleTranslation(w, 'web', false);
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'John 3:16');
  const il = d.querySelector('#interlinear');
  il.checked = true; il.dispatchEvent(new w.Event('change'));
  await waitFor(() => d.querySelector('.interlinear-caption'));
  let caption = d.querySelector('.interlinear-caption');
  assert(caption.classList.contains('hebrew-verse') && caption.dir === 'rtl');
  assert(NIQQUD.test(caption.textContent), 'vocalized caption expected');
  chooseEdition(w, 'delitzsch');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  await waitFor(() => d.querySelector('.interlinear-caption') && !NIQQUD.test(d.querySelector('.interlinear-caption').textContent));
  caption = d.querySelector('.interlinear-caption');
  assert(!NIQQUD.test(caption.textContent), 'caption follows the unpointed edition after switching');
  check('9. interlinear caption follows the active edition', true);
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 5. Mobile file:// layout
// ---------------------------------------------------------------------------
{
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  assert(groupBox(w) && editionSelect(w));
  toggleGroup(w, true);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch1901);
  goRef(w, 'John 3:16');
  assert(d.querySelector('.mobile-verse .hebrew-verse'), 'mobile Hebrew verse expected');
  chooseEdition(w, 'delitzsch');
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch);
  await sleep(80);
  assert(d.querySelector('.mobile-verse .hebrew-verse'));
  assert.deepEqual(w.__remoteRequests, []);
  check('10. mobile file:// operation with the grouped control', true);
  dom.window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} grouped-control checks passed.`);
process.exit(failed ? 1 : 0);
