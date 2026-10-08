// Independent UI cases: no importer/implementer's test helpers used.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) {
  for (let attempt = 0; attempt < 800; attempt++) { if (fn()) return; await pause(25); }
  throw new Error('Local app did not become ready');
}
for (const narrow of [false, true]) {
  const requests = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('../index.html', import.meta.url)), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(String(url)); throw new Error('Network forbidden'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Network forbidden'); } };
    },
  });
  const w = dom.window, d = w.document;
  const change = (selector, value) => { const el = d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new w.Event('change')); };
  const box = (id, on) => { const el = d.querySelector(`#translations input[value="${id}"]`); assert(el, id); el.checked = on; el.dispatchEvent(new w.Event('change')); };
  const ref = value => { d.querySelector('#reference').value = value; d.querySelector('#reference-go').click(); };
  const search = value => { d.querySelector('#search').value = value; d.querySelector('#search-go').click(); };
  await until(() => d.readyState === 'complete' && w.MARANATHA_TRANSLATIONS?.web);
  assert.equal(w.MARANATHA_SEARCH_TEST, undefined, 'No test API is exposed in the normal application');
  assert.equal(w.MARANATHA_TRANSLATIONS.bungo, undefined);
  change('#view-mode', 'parallel'); change('#parallel-book', 'DAN'); change('#parallel-translation', 'bungo');
  await until(() => w.MARANATHA_TRANSLATIONS.bungo && d.querySelector('#parallel-translation-content [lang="ja"]'));
  assert.equal(d.querySelector('#parallel-chapter').options.length, 12, 'First parallel-only load must use Bungo Daniel extent');
  change('#view-mode', 'canon'); box('web', false); box('bungo', true);
  ref('Daniel 12'); assert.equal(d.querySelector('#chapter').options.length, 12);
  ref('Daniel 13:1'); assert.match(d.querySelector('#message').textContent, /does not exist|unavailable|not available|invalid/i);
  ref('ヨハネ３章１６節'); assert.equal(d.querySelector('#message').textContent, '');
  assert.equal(d.querySelector('#book').value, 'JHN'); assert.equal(d.querySelector('#chapter').value, '3');
  const expected = w.MARANATHA_TRANSLATIONS.bungo.books.JHN[2][15];
  assert([...d.querySelectorAll('#results [lang="ja"]')].some(el => el.textContent === expected), 'Japanese Bible text is separate from readings/metadata');
  change('#language', 'ja'); ref('John 3:16');
  assert.equal(d.querySelector('#message').textContent, '', 'English references remain valid under Japanese book labels');
  change('#language', 'en');
  ref('ヨハネ3:16;コリント人への第一の手紙13:4'); assert.equal(d.querySelector('#message').textContent, '');
  ref('Exodus 7:25'); assert.equal(d.querySelector('#message').textContent, '');
  assert.match(d.querySelector('#results').textContent, /separately indexed|source slot|source.*gap/i);
  assert(!d.querySelector('#results').textContent.includes('Included in a source note.'), 'Authored gap notice is not a source footnote');
  // A WEB hit must not silently present same-numbered Bungo text.
  box('web', true); change('#search-translation', 'web'); search('God');
  const compare = d.querySelector('.search-hit .compare-toggle'); assert(compare); compare.click();
  const panel = d.querySelector('.search-hit .compare-panel'); assert(panel);
  assert(panel.querySelector('.compare-native-notice'));
  assert.equal(panel.querySelectorAll('[lang="ja"]').length, 0);
  // Use a synthetic in-memory corpus to exercise exact grapheme semantics.
  // No Scripture file is edited or created by this probe.
  box('web', false);
  const data = w.MARANATHA_TRANSLATIONS.bungo;
  data.books = { GEN: [['が', 'か', 'ぱ', 'は', 'ば', 'か\u3099', '𠮷が']] };
  data.verseMetadata = {};
  change('#search-translation', 'bungo'); search('か');
  assert.equal(d.querySelectorAll('.search-hit').length, 1, 'Unvoiced kana must not match a prefix of a voiced grapheme');
  search('は'); assert.equal(d.querySelectorAll('.search-hit').length, 1, 'Voiced and semi-voiced kana stay distinct');
  search('が'); assert.equal(d.querySelectorAll('.search-hit').length, 3, 'Canonical equivalence is respected');
  const marks = [...d.querySelectorAll('.search-hit mark')].map(el => el.textContent);
  assert(marks.includes('か\u3099'), 'Highlight keeps the original decomposed source grapheme intact');
  search('𠮷が'); assert.equal(d.querySelectorAll('.search-hit').length, 1);
  assert.equal(d.querySelector('.search-hit mark').textContent, '𠮷が', 'Supplementary characters preserve exact highlight offsets');
  assert.deepEqual(requests, []);
  console.log(`PASS independent ${narrow ? 'mobile' : 'desktop'} Bungo: first load, coverage, Japanese references, source gaps, comparison guards, kana/grapheme search and file:// operation.`);
  dom.window.close();
}
