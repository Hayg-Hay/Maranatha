import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
async function until(test) { for (let i = 0; i < 800; i++) { if (test()) return; await new Promise(resolve => setTimeout(resolve, 15)); } throw new Error('Search polish test timed out'); }
async function open(narrow) {
  const values = new Map(), errors = [], requests = [], scrollTargets = [];
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.MARANATHA_ENABLE_TEST_HOOKS = true;
      Object.defineProperty(w, 'localStorage', { value: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k) } });
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {}, removeEventListener() {} });
      let scrollY = 0; Object.defineProperty(w, 'scrollY', { get: () => scrollY });
      w.scrollTo = ({ top }) => { scrollY = top; };
      w.HTMLElement.prototype.scrollIntoView = function(options) { scrollTargets.push({ id: this.id, options }); scrollY = 900; };
      w.HTMLElement.prototype.getBoundingClientRect = function() {
        const index = [...w.document.querySelectorAll('.search-hit')].indexOf(this);
        return { top: index < 0 ? 0 : 100 + index * 48 - scrollY };
      };
      w.fetch = url => { requests.push(url); throw new Error('Unexpected network'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(url); throw new Error('Unexpected network'); } };
      w.addEventListener('error', event => errors.push(event.message));
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && !d.querySelector('#bookmark-passage').disabled);
  return { w, d, values, errors, requests, scrollTargets };
}
for (const narrow of [false, true]) {
  const { w, d, values, errors, requests, scrollTargets } = await open(narrow);
  const hooks = w.MARANATHA_SEARCH_TEST;
  const long = 'α\u0301 👩‍👩‍👧‍👦 '.repeat(60) + 'needle' + ' 👩‍👩‍👧‍👦 α\u0301'.repeat(60);
  for (const fallback of [false, true]) {
    const segmenter = w.Intl.Segmenter; if (fallback) w.Intl.Segmenter = undefined;
    const excerpt = hooks.searchExcerpt(long, 'needle', 'web');
    assert(excerpt.leading && excerpt.trailing); assert(excerpt.text.includes('needle')); assert(excerpt.text.length < long.length);
    assert(!/^\p{M}/u.test(excerpt.text)); assert(!excerpt.text.startsWith('\u200d')); assert(!excerpt.text.endsWith('\u200d'));
    const start = long.indexOf(excerpt.text), end = start + excerpt.text.length;
    const boundaries = new Set([...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(long)].map(part => part.index)); boundaries.add(long.length);
    assert(boundaries.has(start)); assert(boundaries.has(end)); w.Intl.Segmenter = segmenter;
  }
  assert.equal(hooks.searchExcerpt('In the beginning', 'beginning', 'web').text, 'In the beginning');
  const click = selector => d.querySelector(selector).click();
  const search = query => { d.querySelector('#search').value = query; click('#search-go'); };
  const kjv = d.querySelector('#translations input[value="kjv"]'); kjv.checked = true; kjv.dispatchEvent(new w.Event('change', { bubbles: true }));
  await until(() => w.MARANATHA_TRANSLATIONS.kjv);
  search('God');
  assert.equal(scrollTargets.at(-1).id, 'results'); assert.equal(scrollTargets.at(-1).options.block, 'start');
  let hits = d.querySelectorAll('.search-hit'); assert.equal(hits.length, 300);
  const excerptHit = [...hits].find(hit => hit.querySelector('.search-text').textContent.includes('…'));
  assert(excerptHit, 'long real verses are excerpted in the result list');
  assert(excerptHit.querySelector('mark'), 'an excerpt keeps the matching word highlighted');
  assert(d.querySelector('.search-more')); const chosen = hits[6], key = chosen.dataset.searchKey;
  chosen.querySelector('.compare-toggle').click(); assert.equal(chosen.querySelector('.compare-toggle').getAttribute('aria-expanded'), 'true');
  w.scrollTo({ top: 240 });
  chosen.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert.equal(d.querySelector('.search-results'), null); assert.equal(d.querySelector('#back-to-search').hidden, false);
  assert(values.has('maranatha-last-reading-v1'), 'opening a hit by keyboard records reading');
  const beforeReturn = JSON.stringify([...values]);
  // The inspected edition may change; returning still identifies the original search.
  const web = d.querySelector('#translations input[value="web"]'); web.checked = false; web.dispatchEvent(new w.Event('change', { bubbles: true }));
  const stateBeforeReturn = JSON.stringify([...values]);
  d.querySelector('#search').value = 'unfinished edit'; click('#back-to-search');
  assert.equal(d.querySelector('#search').value, 'God'); assert.equal(d.querySelector('#search-translation').value, 'web');
  assert.equal(d.activeElement.dataset.searchKey, key); assert.equal(w.scrollY, 240);
  assert.equal(d.activeElement.querySelector('.compare-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(d.querySelector('#back-to-search').hidden, true); assert.equal(JSON.stringify([...values]), stateBeforeReturn);
  assert(beforeReturn); for (const value of values.values()) { assert(!value.includes('unfinished edit')); assert(!value.includes('"query"')); }
  // A new search replaces the remembered result visit, including an empty result set.
  search('xyzzynonexistentword'); assert.match(d.querySelector('#results').textContent, /No matches/);
  assert.equal(scrollTargets.at(-1).id, 'results');
  assert.equal(d.querySelector('#back-to-search').hidden, true);
  // Keyboard submission also jumps, with reduced motion honored.
  const media = w.matchMedia; w.matchMedia = query => ({ ...media(query), matches: query.includes('prefers-reduced-motion') });
  d.querySelector('#search').value = 'beginning';
  d.querySelector('#search').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert.equal(scrollTargets.at(-1).id, 'results'); assert.equal(scrollTargets.at(-1).options.behavior, 'auto');
  const count = scrollTargets.length; search(''); assert.equal(scrollTargets.length, count, 'empty search does not jump'); w.matchMedia = media;
  search('God'); const hit = d.querySelector('.search-hit'); hit.click();
  click('#reader-focus-toggle'); click('#back-to-search');
  assert(d.documentElement.classList.contains('reader-focus')); assert(d.querySelector('.search-results'));
  assert.deepEqual(errors, []); assert.deepEqual(requests, []); w.close();
  console.log(`PASS ${narrow ? 'mobile' : 'desktop'} Unicode excerpts, capped search, keyboard open, query/edition/comparison/position restore, privacy and focus mode.`);
}
