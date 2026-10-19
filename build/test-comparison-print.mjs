import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Comparison print test timed out'); }
async function open(narrow) {
  const values = new Map(), errors = [], requests = [], copied = [], printed = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, 'localStorage', { value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) } });
      Object.defineProperty(w.navigator, 'clipboard', { value: { async writeText(value) { copied.push(value); } } });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.print = () => printed.push(w.document.querySelector('.print-comparison').textContent);
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
  const change = (selector, value) => { const el = d.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const reference = value => { d.querySelector('#reference').value = value; click('#reference-go'); };
  const select = async (id, checked = true) => {
    const box = d.querySelector(`#translations input[value="${id}"]`); box.checked = checked; box.dispatchEvent(new w.Event('change', { bubbles: true }));
    if (checked) await until(() => w.MARANATHA_TRANSLATIONS[id]);
  };
  const close = () => click('.print-actions button + button');
  for (const id of ['armwestern', 'byz', 'luther1912']) await select(id);
  reference('John 1:1-3'); click('.context-toggle-btn');
  const saved = JSON.stringify([...values]); click('.copy-passage-button'); await until(() => copied.length === 1);
  click('.print-passage-button');
  assert.equal(d.querySelector('#print-layout').value, 'comparison');
  assert.equal(d.querySelector('.print-text').hidden, true);
  const groups = d.querySelectorAll('.print-verse-group'); assert.equal(groups.length, 3);
  for (let i = 0; i < groups.length; i++) {
    assert.equal(groups[i].querySelector('h3').textContent, `John 1:${i + 1}`);
    const entries = groups[i].querySelectorAll('.print-translation'); assert.equal(entries.length, 4);
    ['web', 'armwestern', 'byz', 'luther1912'].forEach((id, index) => {
      assert.equal(entries[index].querySelector('.print-verse-text').textContent, w.MARANATHA_TRANSLATIONS[id].books.JHN[0][i]);
      assert(entries[index].querySelector('.print-translation-label').textContent.length > 0);
    });
  }
  assert.match(d.querySelector('.print-comparison-notice').textContent, /not a certification/);
  assert.equal(d.querySelectorAll('.print-edition-credit').length, 4);
  const comparisonText = d.querySelector('.print-comparison').textContent;
  change('#print-alignment', 'centered');
  assert.equal(w.getComputedStyle(d.querySelector('.print-comparison')).width, '76%');
  assert.equal(w.getComputedStyle(d.querySelector('.print-comparison')).textAlign, 'center');
  assert.equal(d.querySelector('.print-comparison').textContent, comparisonText);
  assert.equal(w.getComputedStyle(d.querySelector('.print-translation-label')).fontSize, '11.2px');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-heading')).fontSize, '12.8px');
  change('#print-size', '18'); assert.equal(d.querySelector('.print-comparison').style.fontSize, '18pt');
  assert.equal(d.querySelector('#print-spacing').value, 'normal');
  change('#print-spacing', 'parsing');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-text')).lineHeight, '3.5');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-text')).paddingBottom, '36px');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-text')).paddingTop, '36px');
  assert.equal(w.getComputedStyle(d.querySelector('.print-translation-label')).marginBottom, '0px');
  assert.equal(d.querySelector('.print-comparison').textContent, comparisonText);
  click('.print-actions button'); assert.deepEqual(printed, [comparisonText]);
  const printRules = [...d.styleSheets[0].cssRules].filter(rule => rule.media?.mediaText === 'print').flatMap(rule => [...rule.cssRules]).filter(rule => rule.selectorText);
  const sheet = d.createElement('style'); sheet.textContent = printRules.map(rule => rule.cssText).join('\n'); d.head.append(sheet);
  assert.equal(w.getComputedStyle(d.querySelector('.print-text')).display, 'none');
  assert.notEqual(w.getComputedStyle(d.querySelector('.print-comparison')).display, 'none');
  assert.equal(w.getComputedStyle(d.querySelector('.shell')).display, 'none');
  assert.equal(w.getComputedStyle(groups[0]).breakInside, 'auto');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-text')).lineHeight, '3.5'); sheet.remove();
  change('#print-layout', 'sequential'); assert.equal(d.querySelector('.print-comparison').hidden, true);
  assert.equal(d.querySelector('.print-text').textContent, copied[0]);
  assert.equal(w.getComputedStyle(d.querySelector('.print-text')).lineHeight, '3.5');
  assert.equal(d.querySelectorAll('.print-text strong').length, 4);
  assert.equal(d.querySelector('.print-text strong').textContent, '— John 1:1, 1:2, 1:3 — World English Bible');
  change('#print-layout', 'comparison'); assert.equal(d.querySelector('.print-comparison').textContent, comparisonText);
  change('#print-spacing', 'normal');
  assert.equal(w.getComputedStyle(d.querySelector('.print-verse-group')).breakInside, 'avoid');
  assert.equal(JSON.stringify([...values]), saved, 'print layout and size do not write storage'); close();
  for (const id of ['armwestern', 'byz', 'luther1912']) await select(id, false);
  await select('he'); reference('Psalm 1:1-2'); click('.print-passage-button');
  assert.equal(d.querySelector('#print-layout').value, 'comparison');
  const hebrew = d.querySelectorAll('.print-verse-group')[0].querySelectorAll('.print-verse-text')[1];
  assert.equal(hebrew.dir, 'auto'); assert.equal(hebrew.lang, 'he'); assert.equal(hebrew.textContent, w.MARANATHA_TRANSLATIONS.he.books.PSA[0][0]); close();
  // A wholly unavailable edition remains an explicit availability notice, not invented text.
  reference('John 1:1'); click('.print-passage-button');
  assert.equal(d.querySelector('#print-layout').value, 'comparison');
  assert.match(d.querySelector('.print-verse-group .print-unavailable').textContent, /does not include this book/); close();
  // Hebrew Psalm 13 is independent; disabled comparison cannot be forced through a change event.
  reference('Psalm 13');
  const hebrewButton = [...d.querySelectorAll('#results .print-passage-button')].find(button => button.getAttribute('aria-label').includes('Hebrew (OSHB)'));
  assert(hebrewButton); hebrewButton.click();
  assert.equal(d.querySelector('#print-layout').value, 'sequential'); assert.equal(d.querySelector('#print-layout option').disabled, true);
  const nativeText = d.querySelector('.print-text').textContent;
  change('#print-layout', 'comparison'); assert.equal(d.querySelector('#print-layout').value, 'sequential'); assert.equal(d.querySelector('.print-text').textContent, nativeText); close();
  await select('he', false); await select('asd'); reference('John 1:1-2'); click('.print-passage-button');
  assert.equal(d.querySelector('#print-layout').value, 'comparison');
  for (const value of [w.MARANATHA_TRANSLATIONS.asd.copyright, w.MARANATHA_TRANSLATIONS.asd.license, w.MARANATHA_TRANSLATIONS.asd.sourceUrl]) assert(d.querySelector('.print-comparison-credits').textContent.includes(value)); close();
  let target;
  for (const [book, chapters] of Object.entries(w.MARANATHA_TRANSLATIONS.asd.verseMetadata)) for (const [chapter, verses] of Object.entries(chapters)) for (const [verse, meta] of Object.entries(verses)) if (!target && meta.status === 'combined-member') target = { book, chapter, verse, meta };
  reference(`${w.MARANATHA_LOCALE_EN.books[target.book].name} ${target.chapter}:${target.verse}`);
  const combinedButton = [...d.querySelectorAll('#results .print-passage-button')].find(button => button.getAttribute('aria-label').includes('Ang Salita'));
  assert(combinedButton); combinedButton.click(); assert.equal(d.querySelector('#print-layout').value, 'sequential');
  assert(d.querySelector('.print-text').textContent.includes(`${target.chapter}:${target.meta.sourceLabel}`));
  assert(d.querySelector('.print-text').textContent.includes(w.MARANATHA_TRANSLATIONS.asd.books[target.book][Number(target.chapter) - 1][target.meta.combinedInto - 1])); close();
  change('#view-mode', 'parallel'); await until(() => d.querySelector('#parallel-lxx-content .print-passage-button'));
  click('#parallel-lxx-content .print-passage-button'); assert.equal(d.querySelector('#print-layout').value, 'sequential'); assert.match(d.querySelector('.print-text').textContent, /Native LXX numbering/);
  assert.deepEqual(errors, []); assert.deepEqual(requests, []); w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} comparison ordering/source fidelity, context exclusion, sequential parity, credits, RTL, missing coverage, boundary/combined-unit guards and print CSS.`);
}
