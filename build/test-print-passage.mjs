import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Print test timed out'); }
async function open(narrow) {
  const values = new Map(), errors = [], requests = [], copied = [], printed = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) } });
      Object.defineProperty(w.navigator, 'clipboard', { value: { async writeText(text) { copied.push(text); } } });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.print = () => printed.push(w.document.querySelector('.print-text').textContent);
      w.fetch = url => { requests.push(url); throw new Error('Unexpected network'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Unexpected network'); } };
      w.addEventListener('error', event => errors.push(event.message));
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && d.querySelector('.print-passage-button'));
  return { w, d, values, errors, requests, copied, printed };
}
for (const narrow of [false, true]) {
  const { w, d, values, errors, requests, copied, printed } = await open(narrow);
  const click = selector => d.querySelector(selector).click();
  const reference = value => { d.querySelector('#reference').value = value; click('#reference-go'); };
  const change = (selector, value) => { const el = d.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  assert.equal(d.querySelector('#print-preview').hidden, true);
  const initial = JSON.stringify([...values]); click('.print-passage-button');
  assert.equal(JSON.stringify([...values]), initial, 'preview does not create a reading/history visit');
  assert.match(d.querySelector('.print-text').textContent, /1:1 In the beginning/);
  click('.print-actions button + button');
  reference('John 3:16'); click('.context-toggle-btn');
  const before = JSON.stringify([...values]), markup = d.querySelector('#results').innerHTML;
  const origin = d.querySelector('.print-passage-button'); origin.click();
  const text = d.querySelector('.print-text').textContent;
  assert.equal(text, `3:16 ${w.MARANATHA_TRANSLATIONS.web.books.JHN[2][15]}\n— John 3:16 — World English Bible`);
  assert.equal(d.activeElement, d.querySelector('.print-actions button'));
  click('.print-actions button'); assert.deepEqual(printed, [text]);
  assert.equal(d.querySelector('#print-preview').hidden, false, 'preview stays open after printing or cancelling');
  assert.equal(JSON.stringify([...values]), before); assert.equal(d.querySelector('#results').innerHTML, markup);
  const size = d.querySelector('#print-size');
  assert.deepEqual([...size.options].map(option => option.value), ['12', '14', '16', '18', '24']);
  for (const points of ['12', '14', '16', '18', '24']) {
    change('#print-size', points);
    assert.equal(d.querySelector('.print-text').style.fontSize, `${points}pt`);
    assert.equal(d.querySelector('.print-description').style.fontSize, `${points}pt`);
    assert.equal(d.querySelector('.print-text').textContent, text);
  }
  assert.equal(JSON.stringify([...values]), before, 'print size is independent of reading/history storage');
  change('#print-size', '18');
  change('#fontsize', 'largest');
  assert.equal(w.getComputedStyle(d.querySelector('.print-text')).fontSize, '24px', '18pt preview is independent of reader font size');
  // Activate only the print-media rules to inspect the DOM presented to a printer.
  const printRules = [...d.styleSheets[0].cssRules].filter(rule => rule.media?.mediaText === 'print').flatMap(rule => [...rule.cssRules]).filter(rule => rule.selectorText);
  const sheet = d.createElement('style'); sheet.textContent = printRules.map(rule => rule.cssText).join('\n'); d.head.append(sheet);
  for (const selector of ['.shell', 'footer', '.print-actions']) assert.equal(w.getComputedStyle(d.querySelector(selector)).display, 'none');
  assert.equal(w.getComputedStyle(d.querySelector('#print-preview')).display, 'block');
  assert.equal(w.getComputedStyle(d.querySelector('.print-text')).fontSize, '24px');
  assert.equal(w.getComputedStyle(d.querySelector('.print-description')).fontSize, '24px'); sheet.remove(); // 18pt at 96 CSS px/in.
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
  assert.equal(d.querySelector('#print-preview').hidden, true); assert.equal(d.activeElement, origin);
  assert.equal(d.documentElement.classList.contains('print-passage-ready'), false);
  click('.copy-passage-button'); await until(() => copied.length === 1); assert.equal(copied[0], text);
  // Safe plain text and print API failure feedback.
  const special = w.MARANATHA_PRINT_PASSAGE.control(() => '<img src=x onerror=alert(1)>\ncredit', 'Test fixture'); d.body.append(special); special.click();
  assert.equal(d.querySelector('#print-size').value, '18', 'print size stays selected across previews in this session');
  assert.equal(d.querySelector('#print-preview img'), null); assert(d.querySelector('.print-text').textContent.includes('<img'));
  w.print = () => { throw new Error('Unavailable'); }; click('.print-actions button'); assert.match(d.querySelector('.print-actions [role="status"]').textContent, /browser’s Print command/);
  click('.print-actions button + button'); special.remove();
  change('#view-mode', 'parallel'); await until(() => d.querySelectorAll('#parallel-view .print-passage-button').length === 2);
  click('#reader-focus-toggle');
  click('#parallel-lxx-content .print-passage-button'); assert.match(d.querySelector('.print-text').textContent, /Native LXX numbering/);
  assert(d.querySelector('.print-text').textContent.includes(d.querySelector('#parallel-lxx-content .lxx-text').textContent));
  // Escape closes the preview before it can exit reader focus.
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', cancelable: true })); assert(d.documentElement.classList.contains('reader-focus'));
  click('#parallel-translation-content .print-passage-button'); assert(!d.querySelector('.print-text').textContent.includes('Native LXX numbering'));
  assert.deepEqual(errors, []); assert.deepEqual(requests, []); w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} print preview source selection, credits/copy parity, print-only layout, API fallback, privacy, keyboard and independent panes.`);
}
