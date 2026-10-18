import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const memory = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) }; };
const context = { window: {} };
for (const file of ['reading-session.js', 'recent-passages.js']) vm.runInNewContext(fs.readFileSync(new URL(file, root), 'utf8'), context);
const api = context.window.MARANATHA_RECENT_PASSAGES;
const snapshot = chapter => ({ version: 1, view: 'canon', translations: ['web'], passage: { bookId: 'GEN', chapter, mode: 'browse', highlight: null, groups: null }, native: null, parallel: null,
  settings: { layout: 'auto', theme: '', reading: '', appearance: 'system', fontsize: '', language: 'en', hebrewScripts: ['square'] } });
const storage = memory(), store = api.createStore(storage, { translations: ['web'], books: ['GEN'], locales: ['en'] });
for (let chapter = 1; chapter <= 12; chapter++) store.record(snapshot(chapter));
assert.equal(store.list().length, 10); assert.equal(store.list()[0].passage.chapter, 12); assert.equal(store.list()[9].passage.chapter, 3);
store.record(snapshot(7)); assert.equal(store.list()[0].passage.chapter, 7); assert.equal(store.list().length, 10);
const before = storage.getItem(api.KEY); store.record({ ...snapshot(1), view: 'search', query: 'private' }); assert.equal(storage.getItem(api.KEY), before);
storage.setItem(api.KEY, '{'); assert.throws(() => store.record(snapshot(1))); assert.equal(storage.getItem(api.KEY), '{'); store.clear(); assert.equal(store.list().length, 0);
assert.throws(() => api.createStore({ getItem() { throw new Error('denied'); } }, {}).list(), /denied/);
console.log('PASS recent store: limit, ordering, deduplication, invalid/search isolation, corruption and clear.');
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Recent passages test timed out'); }
async function open(storage, narrow) {
  const errors = [], requests = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: storage });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(url); throw new Error('Unexpected network'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Unexpected network'); } };
      w.addEventListener('error', event => errors.push(event.message));
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && !d.querySelector('#bookmark-passage').disabled);
  return { w, d, errors, requests };
}
for (const narrow of [false, true]) {
  const storage = memory(); let app = await open(storage, narrow);
  const click = selector => app.d.querySelector(selector).click();
  const change = (selector, value) => { const el = app.d.querySelector(selector); el.value = value; el.dispatchEvent(new app.w.Event('change', { bubbles: true })); };
  assert.equal(storage.getItem(api.KEY), null, 'startup alone does not record a visit');
  change('#chapter', '2'); change('#chapter', '3'); change('#chapter', '2');
  let history = JSON.parse(storage.getItem(api.KEY)).readings;
  assert.deepEqual(history.map(entry => entry.passage.chapter), [2, 3]);
  assert.equal(app.d.querySelector('#recent-passages').open, false);
  change('#theme', 'blue'); assert.equal(app.d.querySelector('#recent-count').textContent, '2');
  click('#bookmark-passage'); app.d.querySelector('#bookmark-editor').requestSubmit();
  const bookmarks = storage.getItem('maranatha-saved-passages-v1');
  app.d.querySelectorAll('#recent-list button')[1].click();
  await until(() => app.d.querySelector('#chapter').value === '3');
  assert.equal(JSON.parse(storage.getItem(api.KEY)).readings[0].passage.chapter, 3);
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  app = await open(storage, narrow);
  assert.equal(app.d.querySelector('#recent-count').textContent, '2');
  app.d.querySelector('#reference').value = 'this is not a reference'; click('#reference-go');
  assert.equal(app.d.querySelector('#recent-count').textContent, '2');
  click('#recent-clear'); assert.equal(storage.getItem(api.KEY), null);
  assert.equal(storage.getItem('maranatha-saved-passages-v1'), bookmarks);
  change('#chapter', '4'); assert.equal(app.d.querySelector('#recent-count').textContent, '1');
  click('#recent-clear'); change('#theme', 'red');
  assert.equal(storage.getItem(api.KEY), null, 'settings redraw after clear does not recreate the current visit');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} history navigation, reopening, persistence, clear and bookmark isolation.`);
}
