import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEY = 'maranatha-last-reading-v1';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const memory = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) }; };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i = 0; i < 800; i++) { if (fn()) return; await sleep(15); } throw new Error('Reading polish test timed out'); }
async function open(storage, narrow = false, block = null) {
  const errors = [], requests = [];
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      if (storage === 'denied') Object.defineProperty(w, 'localStorage', { get() { throw new Error('Storage denied'); } });
      else Object.defineProperty(w, 'localStorage', { value: storage });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(url); throw new Error('Network blocked'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Network blocked'); } };
      w.addEventListener('error', e => errors.push(e.message));
      if (block) {
        const append = w.HTMLHeadElement.prototype.appendChild;
        w.HTMLHeadElement.prototype.appendChild = function(node) {
          if (node.tagName === 'SCRIPT' && node.src.includes(block.file)) {
            node.type = 'application/json';
            append.call(this, node);
            block.script = node;
            if (block.fail) w.setTimeout(() => node.dispatchEvent(new w.Event('error')), 0);
            return node;
          }
          return append.call(this, node);
        };
      }
    },
  });
  await until(() => dom.window.document.readyState === 'complete' && dom.window.document.querySelector('#results').textContent.includes('beginning'));
  return { dom, w: dom.window, d: dom.window.document, errors, requests };
}
function change(app, selector, value) { const el = app.d.querySelector(selector); el.value = value; el.dispatchEvent(new app.w.Event('change', { bubbles: true })); }
async function select(app, id, on = true) {
  const el = app.d.querySelector(`#translations input[value="${id}"]`); assert(el, id);
  el.checked = on; el.dispatchEvent(new app.w.Event('change', { bubbles: true }));
  if (on) await until(() => app.w.MARANATHA_TRANSLATIONS[id]);
}
function reference(app, value) { app.d.querySelector('#reference').value = value; app.d.querySelector('#reference-go').click(); }
const snapshot = storage => JSON.parse(storage.getItem(KEY));
function clean(app) { assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close(); }

// Validate the storage boundary independently from app events.
const context = { window: {} }; vm.runInNewContext(read('reading-session.js'), context);
const store = context.window.MARANATHA_READING_SESSION;
const catalog = { translations: ['web'], books: ['JHN'], locales: ['en'] };
for (const value of ['{', JSON.stringify({ version: 99 }), 'x'.repeat(64001)]) {
  const storage = memory(); storage.setItem(KEY, value); assert.equal(store.load(storage, catalog), null);
}
assert.equal(store.load({ getItem() { throw new Error('denied'); } }, catalog), null);

for (const narrow of [false, true]) {
  const storage = memory();
  let app = await open(storage, narrow);
  assert(app.d.querySelector('#resume-reading').hidden); assert.equal(storage.getItem(KEY), null, 'first boot does not write a default passage');
  await select(app, 'kjv');
  reference(app, 'John 3:16; Psalm 13:5-6');
  for (const [key, value] of Object.entries({ layout: 'multirow', theme: 'blue', reading: 'warm', fontsize: 'larger', appearance: 'dark', language: 'ja' })) change(app, '#' + key, value);
  const saved = storage.getItem(KEY);
  assert.deepEqual(snapshot(storage).translations, ['web', 'kjv']);
  assert.equal(snapshot(storage).passage.groups.length, 2);
  app.d.querySelector('#search').value = 'love'; app.d.querySelector('#search-go').click();
  assert.equal(storage.getItem(KEY), saved, 'search results do not replace a reading');
  reference(app, 'John 0:1'); assert.equal(storage.getItem(KEY), saved, 'invalid reference is not saved');
  clean(app);
  app = await open(storage, narrow);
  assert.equal(storage.getItem(KEY), saved, 'startup does not overwrite the previous session');
  assert(!app.d.querySelector('#resume-reading').hidden);
  assert(app.d.querySelector('#resume-description').textContent.includes('John 3:16'));
  app.d.querySelector('#resume-button').click();
  await until(() => app.d.querySelector('#resume-reading').hidden || app.d.querySelector('#message').textContent.startsWith('Could not continue'));
  assert.equal(app.d.querySelector('#message').textContent, '');
  assert.equal(app.d.querySelector('#language').value, 'ja');
  assert.equal(app.d.querySelector('#layout').value, 'multirow');
  assert.equal(app.d.documentElement.dataset.mode, 'dark');
  assert.equal(app.d.documentElement.dataset.theme, 'blue');
  assert.equal(app.d.querySelectorAll('#results .result-head').length, 2);
  assert(app.d.querySelector('#translations input[value="kjv"]').checked);
  clean(app);
  app = await open(storage, narrow); app.d.querySelector('#forget-reading').click();
  assert.equal(storage.getItem(KEY), null); assert(app.d.querySelector('#resume-reading').hidden); clean(app);
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} reading round-trip, selections/settings, multi-reference, invalid/search isolation and forget.`);
}

// Opening a search result saves its chapter and exact highlighted verse.
const hitStorage = memory();
let hitApp = await open(hitStorage);
hitApp.d.querySelector('#search').value = hitApp.w.MARANATHA_TRANSLATIONS.web.books.JHN[2][15];
hitApp.d.querySelector('#search-go').click(); hitApp.d.querySelector('.search-hit').click();
assert.equal(snapshot(hitStorage).passage.highlight, 16); clean(hitApp);
hitApp = await open(hitStorage); hitApp.d.querySelector('#resume-button').click(); await until(() => hitApp.d.querySelector('#resume-reading').hidden);
assert(hitApp.d.querySelector('#current-reference.highlighted-verse')); assert.equal(hitApp.d.querySelector('#book').value, 'JHN'); clean(hitApp);

// Native extra verses must be validated after loading the saved edition.
const nativeStorage = memory();
let app = await open(nativeStorage);
await select(app, 'web', false); await select(app, 'bohairica'); reference(app, '3 John 1:15'); clean(app);
app = await open(nativeStorage); app.d.querySelector('#resume-button').click();
await until(() => app.d.querySelector('#resume-reading').hidden || app.d.querySelector('#message').textContent.startsWith('Could not continue'));
assert.equal(app.d.querySelector('#message').textContent, ''); assert(app.d.querySelector('.coptic-verse')); assert.equal(app.d.querySelector('#chapter').value, '1'); clean(app);

// Grouped editions must preserve the selected edition, not the group default.
const groupStorage = memory(); app = await open(groupStorage);
change(app, '.edition-select', 'delitzsch'); await select(app, 'delitzsch'); reference(app, 'John 3:16'); clean(app);
app = await open(groupStorage); app.d.querySelector('#resume-button').click(); await until(() => app.d.querySelector('#resume-reading').hidden);
assert.equal(app.d.querySelector('.edition-select').value, 'delitzsch'); assert(app.w.MARANATHA_TRANSLATIONS.delitzsch); clean(app);

// Both native and independent parallel panes retain their own controls.
for (const view of ['lxx', 'parallel']) {
  const storage = memory(); app = await open(storage);
  change(app, '#view-mode', view); await until(() => app.w.MARANATHA_TRANSLATIONS['lxx-swete']);
  const prefix = view === 'lxx' ? '#lxx' : '#parallel-lxx';
  change(app, prefix + '-book', 'PSA'); change(app, prefix + '-chapter', '88');
  if (view === 'parallel') { change(app, '#parallel-book', 'JHN'); change(app, '#parallel-chapter', '3'); }
  const saved = storage.getItem(KEY); clean(app);
  app = await open(storage); assert.equal(storage.getItem(KEY), saved);
  app.d.querySelector('#resume-button').click(); await until(() => app.d.querySelector('#resume-reading').hidden);
  assert.equal(app.d.querySelector('#view-mode').value, view); assert.equal(app.d.querySelector(prefix + '-chapter').value, '88');
  if (view === 'parallel') assert.equal(app.d.querySelector('#parallel-chapter').value, '3');
  clean(app);
}
console.log('PASS native extra verse, grouped edition and LXX/parallel resume.');

// Failed loads preserve the saved reading, and user navigation supersedes a
// pending resume. These simulate file events without touching source files.
const failureStorage = memory(); app = await open(failureStorage); await select(app, 'kjv'); reference(app, 'John 3:16'); clean(app);
const beforeFailure = failureStorage.getItem(KEY);
app = await open(failureStorage, false, { file: '/data/kjv.js', fail: true }); app.d.querySelector('#resume-button').click();
await until(() => app.d.querySelector('#message').textContent.startsWith('Could not continue'));
assert.equal(failureStorage.getItem(KEY), beforeFailure); assert(!app.d.querySelector('#resume-button').disabled); clean(app);
const delayed = { file: '/data/kjv.js' }; app = await open(failureStorage, false, delayed); app.d.querySelector('#resume-button').click();
await until(() => delayed.script); reference(app, 'Genesis 2');
app.w.MARANATHA_TRANSLATIONS.kjv = JSON.parse(read('data/kjv.json')); delayed.script.dispatchEvent(new app.w.Event('load'));
await sleep(20); assert.equal(app.d.querySelector('#book').value, 'GEN'); assert.equal(app.d.querySelector('#chapter').value, '2'); clean(app);
app = await open('denied'); reference(app, 'John 3:16'); assert(app.d.querySelector('#results').textContent.includes('God so loved')); clean(app);
console.log('PASS denied/corrupt storage, load failure and pending-resume cancellation.');

// Regression: known source content must not be advertised as absent Scripture.
app = await open(memory()); await select(app, 'he'); change(app, '#layout', 'multirow'); reference(app, 'Psalm 13:5-6');
assert.equal(app.d.querySelectorAll('.comparison-table-rows').length, 2);
const heTable = app.d.querySelector('.hebrew-verse').closest('table');
assert.equal(heTable.querySelectorAll('tbody tr').length, 1); assert(!heTable.textContent.includes('not available'));
assert(app.d.querySelector('.versification-notice').textContent.includes('No Hebrew wording is missing'));
const hebrewDetails = app.d.querySelector('.versification-notice').closest('details');
assert(hebrewDetails?.classList.contains('passage-source-details')); assert.equal(hebrewDetails.open, false);
assert(heTable.compareDocumentPosition(hebrewDetails) & app.w.Node.DOCUMENT_POSITION_FOLLOWING);
app.d.querySelector('#search').value = 'I will sing'; app.d.querySelector('#search-go').click();
const psalmHit = [...app.d.querySelectorAll('.search-hit')].find(hit => hit.querySelector('.search-ref')?.textContent === 'Psalms 13:6');
assert(psalmHit); psalmHit.querySelector('.compare-toggle').click();
assert(psalmHit.querySelector('.compare-native-notice')); assert.equal(psalmHit.querySelectorAll('.compare-row').length, 0);
change(app, '#search-translation', 'he'); app.d.querySelector('#search').value = app.w.MARANATHA_TRANSLATIONS.he.books.PSA[12][4]; app.d.querySelector('#search-go').click();
app.d.querySelector('.compare-toggle').click(); assert(app.d.querySelector('.compare-native-notice')); assert.equal(app.d.querySelectorAll('.compare-panel .compare-row').length, 0);
reference(app, 'Psalm 13:6'); assert(app.d.querySelector('.independent-reference-note'));
await select(app, 'web', false); reference(app, 'Psalm 13:5');
app.d.querySelector('#interlinear-he').click(); await until(() => app.d.querySelector('#message').textContent.includes('content-placement'));
assert.equal(app.d.querySelectorAll('.interlinear-verse').length, 0);
app.d.querySelector('#interlinear-he').click(); await select(app, 'web'); await select(app, 'he', false); await select(app, 'kjv'); await select(app, 'byz');
reference(app, 'Romans 16'); assert.equal(app.d.querySelectorAll('.comparison-table-rows').length, 3);
reference(app, 'John 3:16'); assert.equal(app.d.querySelectorAll('.comparison-table-rows').length, 1);
clean(app);
console.log('PASS Psalm 13 source extents/disclosure/interlinear guard, independent Romans endings and ordinary comparison.');
