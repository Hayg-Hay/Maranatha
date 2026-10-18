import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Copy test timed out'); }
async function open(narrow) {
  const values = new Map(), errors = [], requests = [], copied = [];
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) };
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: storage });
      Object.defineProperty(w.navigator, 'clipboard', { configurable: true, value: { async writeText(value) { copied.push(value); } } });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(url); throw new Error('Unexpected network'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Unexpected network'); } };
      w.addEventListener('error', event => errors.push(event.message));
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && d.querySelector('.copy-passage-button'));
  return { w, d, errors, requests, copied, storage };
}
for (const narrow of [false, true]) {
  const app = await open(narrow), { w, d, copied, storage } = app;
  const click = selector => d.querySelector(selector).click();
  const reference = value => { d.querySelector('#reference').value = value; click('#reference-go'); };
  const change = (selector, value) => { const el = d.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  click('.copy-passage-button'); await until(() => copied.length === 1 && !d.querySelector('.copy-passage-button').disabled);
  assert.match(copied[0], /1:1 In the beginning/); assert.match(copied[0], /— Genesis 1 — World English Bible/);
  assert.equal(storage.getItem('maranatha-recent-passages-v1'), null, 'copy alone does not record a history visit');
  reference('John 3:16'); click('.copy-passage-button'); await until(() => copied.length === 2 && !d.querySelector('.copy-passage-button').disabled);
  const verseText = w.MARANATHA_TRANSLATIONS.web.books.JHN[2][15];
  assert.equal(copied[1], `3:16 ${verseText}\n— John 3:16 — World English Bible`);
  click('.context-toggle-btn'); click('.copy-passage-button'); await until(() => copied.length === 3 && !d.querySelector('.copy-passage-button').disabled);
  assert.equal(copied[2], copied[1], 'context expansion does not change the copied selection');
  // A rejected clipboard request opens selected, read-only plain text.
  w.navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  click('.copy-passage-button'); await until(() => !d.querySelector('.copy-fallback').hidden);
  let field = d.querySelector('.copy-fallback textarea');
  assert.equal(field.value, copied[1]); assert.equal(field.readOnly, true); assert.equal(field.selectionEnd, field.value.length);
  click('.copy-fallback button'); assert.equal(d.querySelector('.copy-fallback').hidden, true);
  Object.defineProperty(w.navigator, 'clipboard', { value: undefined });
  click('.copy-passage-button'); await until(() => !d.querySelector('.copy-fallback').hidden);
  assert.equal(d.querySelector('.copy-fallback textarea').value, copied[1]);
  // Source combined units must not be split or silently relabelled.
  const asdBox = d.querySelector('#translations input[value="asd"]'); asdBox.checked = true; asdBox.dispatchEvent(new w.Event('change', { bubbles: true }));
  await until(() => w.MARANATHA_TRANSLATIONS.asd);
  const data = w.MARANATHA_TRANSLATIONS.asd;
  reference('John 3:16'); click('.copy-passage-button'); await until(() => !d.querySelector('.copy-fallback').hidden);
  const multiple = d.querySelector('.copy-fallback textarea').value;
  assert(multiple.includes('— John 3:16 — World English Bible'));
  assert(multiple.includes(`— John 3:16 — ${data.label}`));
  assert(multiple.includes(data.books.JHN[2][15]));
  const webBox = d.querySelector('#translations input[value="web"]'); webBox.checked = false; webBox.dispatchEvent(new w.Event('change', { bubbles: true }));
  let target;
  for (const [book, chapters] of Object.entries(data.verseMetadata)) for (const [chapter, verses] of Object.entries(chapters)) for (const [verse, meta] of Object.entries(verses)) {
    if (!target && meta.status === 'combined-member') target = { book, chapter, verse, meta };
  }
  assert(target); reference(`${w.MARANATHA_LOCALE_EN.books[target.book].name} ${target.chapter}:${target.verse}`);
  click('.copy-passage-button'); await until(() => !d.querySelector('.copy-fallback').hidden);
  const combined = d.querySelector('.copy-fallback textarea').value;
  assert(combined.includes(data.books[target.book][Number(target.chapter) - 1][target.meta.combinedInto - 1]));
  assert(combined.includes(`${target.chapter}:${target.meta.sourceLabel}`));
  assert(combined.includes(data.copyright)); assert(combined.includes(data.license)); assert(combined.includes(data.sourceUrl));
  // Native LXX uses source labels, with an independent numbering notice.
  change('#view-mode', 'lxx'); await until(() => d.querySelector('.lxx-verses'));
  click('.copy-passage-button'); await until(() => !d.querySelector('.copy-fallback').hidden);
  assert(d.querySelector('.copy-fallback textarea').value.includes(d.querySelector('.lxx-text').textContent));
  assert.match(d.querySelector('.copy-fallback textarea').value, /Native LXX numbering/);
  change('#view-mode', 'parallel'); await until(() => d.querySelectorAll('#parallel-view .copy-passage-button').length === 2);
  d.querySelector('#parallel-translation-content .copy-passage-button').click();
  await until(() => !d.querySelector('#parallel-translation-content .copy-fallback').hidden);
  assert(!d.querySelector('#parallel-translation-content textarea').value.includes('Native LXX numbering'));
  assert.deepEqual(app.errors, []); assert.deepEqual(app.requests, []); w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} source copying, context isolation, clipboard/fallback, combined units, credits and native LXX.`);
}
