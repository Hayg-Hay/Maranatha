import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Reader focus test timed out'); }
async function open(values, narrow) {
  const errors = [], requests = [];
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
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
  await until(() => d.readyState === 'complete' && !d.querySelector('#reader-focus-toggle').disabled && d.querySelector('#results').textContent.includes('beginning'));
  return { w, d, errors, requests };
}
for (const narrow of [false, true]) {
  const values = new Map(); let app = await open(values, narrow);
  const { w, d } = app, toggle = d.querySelector('#reader-focus-toggle');
  const style = selector => w.getComputedStyle(d.querySelector(selector));
  const original = d.querySelector('#results').firstElementChild, markup = d.querySelector('#results').innerHTML;
  const saved = JSON.stringify([...values]);
  toggle.click();
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(toggle.textContent, 'Exit reader focus'); assert.equal(d.activeElement, toggle);
  for (const selector of ['.shell > header', '.browse-panel', '#reading-actions']) assert.equal(style(selector).display, 'none');
  assert.equal(style('#reader-focus-bar').position, 'sticky');
  assert.notEqual(style('#results').display, 'none'); assert.notEqual(style('footer').display, 'none');
  assert.equal(d.querySelector('#results').firstElementChild, original); assert.equal(d.querySelector('#results').innerHTML, markup);
  assert.equal(JSON.stringify([...values]), saved, 'presentation toggle does not write reading/bookmark/history storage');
  // Composition and an already-consumed Escape must not close unrelated UI.
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', isComposing: true }));
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  const consumed = new w.KeyboardEvent('keydown', { key: 'Escape', cancelable: true }); consumed.preventDefault(); d.dispatchEvent(consumed);
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  // Existing bottom chapter navigation still works and stays focused in reader mode.
  d.querySelector('#next-chapter-button-bottom').click();
  assert.equal(d.querySelector('#chapter').value, '2'); assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert(d.querySelector('.copy-passage-button'));
  const exit = new w.KeyboardEvent('keydown', { key: 'Escape', cancelable: true }); d.dispatchEvent(exit);
  assert.equal(exit.defaultPrevented, true); assert.equal(toggle.getAttribute('aria-pressed'), 'false');
  assert.equal(d.activeElement, toggle); assert.notEqual(style('.browse-panel').display, 'none');
  assert.equal(d.querySelector('#chapter').value, '2');
  // Parallel pane pickers hide, but both passages and attribution remain.
  const view = d.querySelector('#view-mode'); view.value = 'parallel'; view.dispatchEvent(new w.Event('change', { bubbles: true }));
  await until(() => d.querySelector('#parallel-lxx-content .lxx-verses'));
  toggle.click(); assert.equal(style('#parallel-view .chapter-bar').display, 'none');
  assert.notEqual(style('#parallel-view').display, 'none'); assert.equal(d.querySelectorAll('#parallel-view .copy-passage-button').length, 2);
  assert.equal(d.querySelector('#lxx-attribution').hidden, false);
  const parallel = d.querySelector('#parallel-view').innerHTML;
  toggle.click(); assert.equal(d.querySelector('#parallel-view').innerHTML, parallel);
  assert.notEqual(style('#parallel-view .chapter-bar').display, 'none');
  toggle.click(); assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); w.close();
  app = await open(values, narrow);
  assert.equal(app.d.documentElement.classList.contains('reader-focus'), false, 'refresh starts with controls available');
  assert.equal(app.d.querySelector('#reader-focus-toggle').getAttribute('aria-pressed'), 'false');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} focus controls, CSS visibility, keyboard exit, unchanged content/storage, navigation, parallel panes and refresh.`);
}
