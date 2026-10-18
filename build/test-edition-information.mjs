import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const context = { window: {} }; vm.runInNewContext(fs.readFileSync(new URL('data/edition-information.js', root), 'utf8'), context);
const records = context.window.MARANATHA_EDITION_INFORMATION_DATA;
assert.equal(Object.keys(records).length, 22);
for (const [id, record] of Object.entries(records)) {
  for (const field of ['provenance', 'coverage', 'terms', 'limitations', 'verification']) assert(typeof record[field] === 'string' && record[field].length > 0, `${id}: ${field}`);
  assert(!('books' in record)); assert(!('verses' in record));
  for (const link of record.links) if (!/^https?:/.test(link.href)) assert(fs.existsSync(new URL(link.href, root)), link.href);
}
assert.match(records.kjv.terms, /in the US/);
assert.match(records.ayt.terms, /non-commercial/i); assert(!records.ayt.terms.includes('4.0'));
assert.match(records.kszi.terms, /BY-ND/); assert.match(records.he.terms, /CC BY 4.0/);
assert.match(records['otb-ja'].limitations, /does not document/);
assert.match(records.delitzsch.limitations, /not a verified transcription of the 1877/);
assert.match(records.bohairica.verification, /digital edition/); assert.match(records.bohairica.verification, /not established/);
console.log('PASS metadata coverage, evidence paths, source-specific terms and limited verification claims.');
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Edition information test timed out'); }
async function open(values, narrow) {
  const errors = [], requests = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) } });
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
  const values = new Map(); let app = await open(values, narrow);
  const click = selector => app.d.querySelector(selector).click();
  const change = (selector, value) => { const el = app.d.querySelector(selector); el.value = value; el.dispatchEvent(new app.w.Event('change', { bubbles: true })); };
  assert.equal(app.d.querySelector('#translation-tools').open, false);
  const loaded = Object.keys(app.w.MARANATHA_TRANSLATIONS), saved = JSON.stringify([...values]);
  assert.deepEqual(loaded, ['web']);
  const panels = app.d.querySelectorAll('#translations .edition-information');
  assert.equal(panels.length, 20); // 21 editions, including a two-edition grouped control.
  const content = app.d.querySelector('#results').innerHTML;
  for (const panel of panels) {
    assert.equal(panel.open, false); panel.querySelector('summary').click();
    assert.equal(panel.querySelectorAll('dt').length, 5);
    assert.equal(panel.querySelector('summary').textContent, 'Edition information');
  }
  assert.equal(app.d.querySelector('#results').innerHTML, content);
  assert.deepEqual(Object.keys(app.w.MARANATHA_TRANSLATIONS), loaded); assert.equal(JSON.stringify([...values]), saved);
  const grouped = app.d.querySelector('.translation-group .edition-information');
  change('#edition-delitzsch', 'delitzsch'); assert.equal(grouped.dataset.editionId, 'delitzsch');
  assert.equal(grouped.open, true); assert.match(grouped.textContent, /does not identify/);
  assert.equal(app.w.MARANATHA_TRANSLATIONS.delitzsch, undefined);
  change('#edition-delitzsch', 'delitzsch1901'); assert.match(grouped.querySelector('[data-edition-field="verification"]').textContent, /Sampled printed passages/);
  assert.equal(app.w.MARANATHA_TRANSLATIONS.delitzsch1901, undefined);
  const boh = app.d.querySelector('#translations input[value="bohairica"]').closest('.translation-option');
  assert.equal(boh.querySelector('.translation-warning summary').textContent, 'Textual limitations');
  assert.match(boh.querySelector('.translation-warning p').textContent, /Acts 24:7/);
  const arm = app.d.querySelector('#translations input[value="armwestern"]').closest('.translation-option');
  assert.equal(arm.querySelector('.translation-warning summary').textContent, 'Under audit');
  assert.match(app.d.querySelector('.study-material-info').textContent, /not additional Scripture/);
  assert.match(app.d.querySelector('.study-material-info').textContent, /awaiting human review/);
  // Unknown records remain explicit; source strings and unsafe links are never executable.
  const missing = app.w.MARANATHA_EDITION_INFORMATION.create({ id: 'unknown', label: '<img src=x onerror=alert(1)>' });
  assert.match(missing.textContent, /not documented/); assert.equal(missing.querySelector('img'), null);
  app.w.MARANATHA_EDITION_INFORMATION_DATA.fixture = { ...app.w.MARANATHA_EDITION_INFORMATION_DATA.web, description: '<script>alert(1)</script>', links: [{ href: 'javascript:alert(1)', label: 'bad' }, { href: '../outside', label: 'escape' }, { href: 'docs/BOHAIRICA.md', label: 'good' }] };
  const safe = app.w.MARANATHA_EDITION_INFORMATION.create({ id: 'fixture' });
  assert.equal(safe.querySelector('script'), null); assert.equal(safe.querySelectorAll('a').length, 1);
  // Resume must refresh all fields to the exact saved grouped edition.
  const box = app.d.querySelector('#translation-group-delitzsch'); box.checked = true; box.dispatchEvent(new app.w.Event('change', { bubbles: true }));
  await until(() => app.w.MARANATHA_TRANSLATIONS.delitzsch1901);
  change('#edition-delitzsch', 'delitzsch'); await until(() => app.w.MARANATHA_TRANSLATIONS.delitzsch);
  app.d.querySelector('#reference').value = 'John 3:16'; click('#reference-go');
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  app = await open(values, narrow); click('#resume-button');
  await until(() => app.d.querySelector('#book').value === 'JHN' && app.d.querySelector('#resume-reading').hidden);
  const resumed = app.d.querySelector('.translation-group .edition-information');
  assert.equal(resumed.dataset.editionId, 'delitzsch'); assert.match(resumed.querySelector('[data-edition-field="verification"]').textContent, /does not identify the print edition/);
  change('#view-mode', 'parallel'); await until(() => app.d.querySelector('#parallel-lxx-content .edition-information'));
  const lxx = app.d.querySelector('#parallel-lxx-content .edition-information');
  assert.equal(lxx.dataset.editionId, 'lxx-swete'); assert.match(lxx.textContent, /CC BY-SA 4.0/);
  assert.match(lxx.textContent, /Theodotion/); assert.equal(lxx.open, false);
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); app.w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} all edition panels, lazy loading/privacy, grouped switching/resume, audit/limitation distinction, safe content and native LXX.`);
}
