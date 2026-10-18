import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Calmer reading test timed out'); }
async function open(values, narrow) {
  const errors = [], requests = [], copied = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) } });
      Object.defineProperty(w.navigator, 'clipboard', { value: { async writeText(value) { copied.push(value); } } });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(url); throw new Error('Unexpected network'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Unexpected network'); } };
      w.addEventListener('error', event => errors.push(event.message));
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && !d.querySelector('#bookmark-passage').disabled);
  return { w, d, errors, requests, copied };
}
for (const narrow of [false, true]) {
  const values = new Map(); let app = await open(values, narrow);
  const click = selector => app.d.querySelector(selector).click();
  const change = (selector, value) => { const el = app.d.querySelector(selector); el.value = value; el.dispatchEvent(new app.w.Event('change', { bubbles: true })); };
  const select = async (id, on) => {
    const box = app.d.querySelector(`#translations input[value="${id}"]`); assert(box, id);
    box.checked = on; box.dispatchEvent(new app.w.Event('change', { bubbles: true }));
    if (on && !box.dataset.translationGroup) await until(() => app.w.MARANATHA_TRANSLATIONS[id]);
  };
  for (const selector of ['#translation-tools', '#study-tools', '#reading-settings', '#saved-passages', '#recent-passages']) assert.equal(app.d.querySelector(selector).open, false);
  assert.match(app.d.querySelector('#translations-summary').textContent, /WEB/);
  assert(app.d.querySelector('#results').textContent.includes(app.w.MARANATHA_TRANSLATIONS.web.books.GEN[0][0]));
  assert.equal(app.d.querySelector('#resume-reading').hidden, true);
  assert.equal(values.get('maranatha-last-reading-v1'), undefined);
  const stored = JSON.stringify([...values]);
  for (const id of ['translation-tools', 'study-tools', 'reading-settings', 'saved-passages', 'recent-passages']) {
    click(`#${id} > summary`); assert.equal(app.d.querySelector(`#${id}`).open, true);
    click(`#${id} > summary`); assert.equal(app.d.querySelector(`#${id}`).open, false);
  }
  assert.equal(JSON.stringify([...values]), stored, 'opening disclosures does not create reading/history visits');
  assert(app.d.querySelector('#study-tools #lxx-alignment-pilot'));
  assert.equal(app.d.querySelector('#lxx-alignment-pilot').checked, false);
  assert.match(app.d.querySelector('#lxx-alignment-notice').textContent, /awaiting human review/);
  click('#translation-tools > summary'); await select('kjv', true);
  assert.match(app.d.querySelector('#translations-summary').textContent, /2 selected/);
  assert.match(app.d.querySelector('#translation-tools > summary').getAttribute('aria-label'), /King James Version/);
  await select('delitzsch', true); await until(() => app.w.MARANATHA_TRANSLATIONS.delitzsch1901);
  const edition = app.d.querySelector('.translation-group select');
  change(`#${edition.id}`, 'delitzsch'); await until(() => app.w.MARANATHA_TRANSLATIONS.delitzsch);
  assert.match(app.d.querySelector('#translation-tools > summary').title, /1877/);
  assert(!app.d.querySelector('#translation-tools > summary').title.includes('1901'));
  await select('armwestern', true);
  assert.match(app.d.querySelector('#translations-summary').textContent, /1 under audit/);
  assert.match(app.d.querySelector('#translations .translation-warning').textContent, /Under audit/);
  await select('armwestern', false); await select('delitzsch', false); await select('kjv', false); await select('web', false);
  assert.match(app.d.querySelector('#translations-summary').textContent, /None selected/);
  await select('bohairica', true); click('#translation-tools > summary');
  app.d.querySelector('#reference').value = '3 John 1:15'; click('#reference-go');
  assert.match(app.d.querySelector('#translations-summary').textContent, /BOH/);
  click('#bookmark-passage'); app.d.querySelector('#bookmark-name').value = 'Native reading'; app.d.querySelector('#bookmark-editor').requestSubmit();
  click('.copy-passage-button'); await until(() => app.copied.length === 1); assert.match(app.copied[0], /1:15/);
  click('.print-passage-button'); assert.equal(app.d.querySelector('.print-text').textContent, app.copied[0]);
  click('.print-actions button + button');
  click('#reader-focus-toggle'); assert.equal(app.w.getComputedStyle(app.d.querySelector('#bookmark-passage')).display, 'none');
  app.d.dispatchEvent(new app.w.KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
  assert.notEqual(app.w.getComputedStyle(app.d.querySelector('#bookmark-passage')).display, 'none');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  app = await open(values, narrow);
  assert.equal(app.d.querySelector('#translation-tools').open, false);
  assert.equal(app.d.querySelector('#resume-reading').hidden, false);
  click('#resume-button'); await until(() => app.d.querySelector('#book').value === '3JN' && app.d.querySelector('#resume-reading').hidden);
  assert.match(app.d.querySelector('#translations-summary').textContent, /BOH/);
  assert.equal(app.d.querySelector('#bookmark-count').textContent, '1');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} calm startup, disclosure access/privacy, edition summaries/audit warnings, grouped selection, native reading/copy/print/bookmark/focus and resume.`);
}
