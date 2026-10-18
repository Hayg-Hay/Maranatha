import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const memory = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) }; };
const context = { window: {} };
for (const file of ['reading-session.js', 'saved-passages.js']) vm.runInNewContext(read(file), context);
const api = context.window.MARANATHA_SAVED_PASSAGES;
const catalog = { translations: ['web'], books: ['GEN'], locales: ['en'] };
const reading = { version: 1, view: 'canon', translations: ['web'], passage: { bookId: 'GEN', chapter: 1, mode: 'browse', highlight: null, groups: null }, native: null, parallel: null,
  settings: { layout: 'auto', theme: '', reading: '', appearance: 'system', fontsize: '', language: 'en', hebrewScripts: ['square'] } };
const storage = memory(), store = api.createStore(storage, catalog);
store.save('Sunday', reading);
store.save('Renamed', reading);
assert.equal(store.list().length, 1);
assert.equal(store.list()[0].name, 'Renamed');
const exported = store.export();
assert.equal(JSON.parse(exported).format, 'maranatha-saved-passages');
assert.equal(store.import(exported), 0);
const second = structuredClone(reading); second.passage.chapter = 2;
const incoming = JSON.stringify({ format: 'maranatha-saved-passages', version: 1, bookmarks: [{ name: 'Next', reading: second }] });
assert.equal(store.import(incoming), 1);
const before = storage.getItem(api.KEY);
for (const malformed of ['{', '{}', 'x'.repeat(1000001), JSON.stringify({ format: 'maranatha-saved-passages', version: 1, bookmarks: [{ name: 'Valid', reading }, { name: 'Bad', reading: { ...reading, translations: ['unknown'] } }] })]) {
  assert.throws(() => store.import(malformed)); assert.equal(storage.getItem(api.KEY), before);
}
assert.throws(() => store.save('x'.repeat(121), reading));
const fullStorage = memory(), full = api.createStore(fullStorage, catalog);
const many = Array.from({ length: 200 }, (_, index) => ({ name: '', reading: { ...reading, passage: { ...reading.passage, chapter: index + 1 } } }));
assert.equal(full.import(JSON.stringify({ format: 'maranatha-saved-passages', version: 1, bookmarks: many })), 200);
const fullBefore = fullStorage.getItem(api.KEY);
assert.throws(() => full.save('Extra', { ...reading, passage: { ...reading.passage, highlight: 2 } }));
assert.equal(fullStorage.getItem(api.KEY), fullBefore);
const quota = api.createStore({ getItem: () => null, setItem() { throw new Error('quota'); } }, catalog);
assert.throws(() => quota.save('Sunday', reading), /quota/);
storage.setItem(api.KEY, '{'); assert.throws(() => store.save('Sunday', reading)); assert.equal(storage.getItem(api.KEY), '{');
console.log('PASS bookmark store: deduplication, merge, atomic rejection, size/name bounds, quota and corrupt storage.');

async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(r => setTimeout(r, 15)); } throw new Error('Bookmark test timed out'); }
async function open(storage, narrow) {
  const errors = [], requests = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: storage });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(url); throw new Error('Network forbidden'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Network forbidden'); } };
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
  click('#bookmark-passage'); app.d.querySelector('#bookmark-name').value = '<img src=x onerror=alert(1)> Sunday';
  app.d.querySelector('#bookmark-editor').requestSubmit();
  assert.equal(app.d.querySelector('#bookmark-count').textContent, '1');
  assert.equal(app.d.querySelector('#saved-passages').open, false);
  assert.equal(app.d.querySelector('#bookmark-list img'), null);
  assert.equal(storage.getItem('maranatha-last-reading-v1'), null, 'bookmark clicks do not create a resume record');
  const change = (selector, value) => { const el = app.d.querySelector(selector); el.value = value; el.dispatchEvent(new app.w.Event('change', { bubbles: true })); };
  change('#chapter', '2');
  click('#bookmark-list button');
  await until(() => app.d.querySelector('#chapter').value === '1');
  assert.match(app.d.querySelector('#results').textContent, /beginning/);
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  app = await open(storage, narrow);
  assert.equal(app.d.querySelector('#bookmark-count').textContent, '1');
  // FileReader import merges and deduplicates without replacing existing names.
  const input = app.d.querySelector('#bookmark-import');
  // Use the already validated local record to form a portable backup.
  const data = JSON.parse(storage.getItem(api.KEY));
  const file = new app.w.File([JSON.stringify({ ...data, format: 'maranatha-saved-passages' })], 'backup.json', { type: 'application/json' });
  Object.defineProperty(input, 'files', { value: [file] }); input.dispatchEvent(new app.w.Event('change', { bubbles: true }));
  await until(() => app.d.querySelector('#bookmark-status').textContent.includes('Imported 0'));
  click('#bookmark-list button + button');
  assert.equal(app.d.querySelector('#bookmark-count').textContent, '0');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} bookmark save/open/reload/remove, safe labels, import and offline operation.`);
}
