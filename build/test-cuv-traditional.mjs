import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
import { ROOT, SOURCE_DIR, parseSource, EXPECTED_GAPS } from './import-cuv-traditional.mjs';

const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const data = JSON.parse(read('data/cuv-traditional.json'));
assert.equal(data.language, 'zh-Hant');
assert.equal(data.books.GEN[0][0], '起初，上帝創造天地。');
assert.equal(data.books.DAN.length, 12);
assert.equal(data.books['3JN'][0].length, 15);
assert.equal(Object.keys(data.books).length, 66);
assert.equal(data.books.TOB, undefined);
assert.deepEqual(data.sourceInventory.gaps, EXPECTED_GAPS);
for (const ref of EXPECTED_GAPS) {
  const [b, c, v] = ref.split('.');
  assert.equal(data.books[b][Number(c) - 1][Number(v) - 1], '');
  assert.equal(data.verseMetadata[b][c][v].status, 'source-gap');
}
const sandbox = { window: {} }; vm.runInNewContext(read('data/cuv-traditional.js'), sandbox);
assert.equal(JSON.stringify(sandbox.window.MARANATHA_TRANSLATIONS['cuv-traditional']), JSON.stringify(data));
const hashes = () => ['data/cuv-traditional.json', 'data/cuv-traditional.js', 'data/locales/zh-Hant.json', 'data/locales/zh-Hant.js'].map(f => crypto.createHash('sha256').update(read(f)).digest('hex'));
const before = hashes();
execFileSync(process.execPath, ['build/import-cuv-traditional.mjs', '--check'], { cwd: ROOT });
execFileSync(process.execPath, ['build/build-chinese-locale.mjs', '--check'], { cwd: ROOT });
assert.deepEqual(hashes(), before, '--check must write nothing');
const raw = fs.readFileSync(path.join(SOURCE_DIR, 'usfx/cmn-cu89t_usfx.xml'), 'utf8');
assert.throws(() => parseSource(raw.replace('起初，上帝創造天地。', '<unknown>起初，上帝創造天地。</unknown>')), /Unsupported/);
assert.throws(() => parseSource(raw.replace('<v id="2" bcv="GEN.1.2"', '<v id="1" bcv="GEN.1.2"')), /Duplicate/);
console.log('PASS source inventory, gaps, JS/JSON twins, deterministic checks and strict parser.');

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn) {
  for (let i = 0; i < 1000; i++) { if (fn()) return; await sleep(20); }
  throw new Error('Timed out waiting for app');
}
async function openApp(narrow) {
  const errors = [];
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.MARANATHA_ENABLE_TEST_HOOKS = true;
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.__requests = [];
      w.fetch = (...a) => { w.__requests.push(String(a[0])); throw new Error('Network blocked'); };
      w.XMLHttpRequest = class { open(method, url) { w.__requests.push(String(url)); throw new Error('Network blocked'); } };
      w.addEventListener('error', e => errors.push(e.message));
    },
  });
  await until(() => dom.window.document.readyState === 'complete');
  dom.errors = errors;
  return dom;
}
function select(w, id, on) {
  const el = w.document.querySelector(`#translations input[value="${id}"]`);
  assert(el, `checkbox ${id}`); el.checked = on; el.dispatchEvent(new w.Event('change'));
}
function change(w, selector, value) {
  const el = w.document.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change'));
}
function reference(w, text) { w.document.querySelector('#reference').value = text; w.document.querySelector('#reference-go').click(); }
function verseText(el) { const clone = el.cloneNode(true); clone.querySelectorAll('.verse-source-note').forEach(n => n.remove()); return clone.textContent; }
for (const narrow of [false, true]) {
  const dom = await openApp(narrow), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS['cuv-traditional'], undefined, 'lazy translation');
    select(w, 'web', false); select(w, 'cuv-traditional', true);
    await until(() => d.querySelector('.chinese-verse'));
    const first = d.querySelector('.chinese-verse');
    assert.equal(first.lang, 'zh-Hant'); assert.equal(first.dir, 'ltr');
    assert.equal(verseText(first), data.books.GEN[0][0]);
    assert.equal(w.getComputedStyle(first).whiteSpace, 'pre-wrap');
    reference(w, 'John 1');
    const passage = d.querySelector('.comparison-table, .mobile-verses');
    const details = d.querySelector('.passage-source-details');
    assert(details && !details.open, 'annotations collapsed by default');
    assert.equal(passage.nextElementSibling, details, 'Scripture before annotations');
    assert(details.querySelector('.versification-notice'));
    assert(details.querySelector('.source-heading'));
    assert(details.querySelector('.source-note'));
    assert.equal(d.querySelectorAll('#results > .source-heading, #results > .source-note, #results > .versification-notice').length, 0, 'no Chinese annotation wall before Scripture');
    details.open = true;
    assert(details.querySelector('.source-note-text').textContent.length > 0, 'notes available when expanded');
    for (const text of ['約翰福音3:16', '約翰福音３章１６節', '约翰福音3章16节', '約3:16', 'John 3:16']) {
      reference(w, text); assert.equal(d.querySelector('#message').textContent, '', text);
      assert([...d.querySelectorAll('.chinese-verse')].some(el => verseText(el) === data.books.JHN[2][15]), text);
    }
    change(w, '#language', 'zh-Hant');
    assert(d.querySelector('#book option[value="GEN"]').textContent.includes('創世記'));
    reference(w, 'Genesis 1:1'); assert.equal(d.querySelector('#message').textContent, '');
    for (const ref of ['Genesis 24:29-30', 'Genesis 24:30']) {
      reference(w, ref);
      assert.equal(d.querySelector('#message').textContent, '');
      assert.equal([...d.querySelectorAll('.reference, .mobile-reference')].filter(el => el.textContent === '24:29-30').length, 1, 'source range once');
      assert.equal([...d.querySelectorAll('.chinese-verse')].filter(el => verseText(el) === data.books.GEN[23][28]).length, 1, 'combined text once');
      assert.equal([...d.querySelectorAll('.reference, .mobile-reference')].filter(el => el.textContent === '24:30').length, 0, 'no artificial member row');
      assert(d.querySelector('#current-reference'), 'combined member query has an anchor');
    }
    change(w, '#layout', 'multirow'); reference(w, 'Genesis 24:30');
    assert(d.querySelector('.comparison-table-rows'), 'explicit Multi-row works at desktop and mobile widths');
    assert.equal([...d.querySelectorAll('.reference')].filter(el => el.textContent === '24:29-30').length, 1);
    change(w, '#layout', 'auto');
    if (narrow) assert(d.querySelector('.mobile-verses'), 'Automatic restores mobile reading');
    reference(w, 'Psalm 8:7-8');
    assert.equal([...d.querySelectorAll('.reference, .mobile-reference')].filter(el => el.textContent === '8:6-8').length, 1, 'three-position source span once');
    assert.equal([...d.querySelectorAll('.chinese-verse')].filter(el => verseText(el) === data.books.PSA[7][5]).length, 1);
    reference(w, 'John 5:4');
    assert(d.querySelector('.verse-source-gap'));
    assert([...d.querySelectorAll('.source-note')].some(el => /有古卷/.test(el.textContent)), 'source omission note retained');
    reference(w, 'Genesis 4:1');
    const note = [...d.querySelectorAll('.source-note')].find(el => el.textContent.includes('就是得的意思'));
    assert(note); assert.equal(note.closest('table, .mobile-verses'), null);
    assert(!verseText(d.querySelector('.chinese-verse')).includes('就是得的意思'), 'footnote not Scripture');
    reference(w, 'Psalm 23');
    assert(d.querySelector('.source-heading-text').textContent.length > 0);
    assert([...d.querySelectorAll('.source-heading-text')].some(el => el.textContent === '大衛的詩。'));
    reference(w, 'Daniel 13'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/i);
    reference(w, '3 John 1:16'); assert.match(d.querySelector('#message').textContent, /does not exist|not a reference available/i);
    reference(w, '3 John 1:15'); assert.equal(d.querySelector('#message').textContent, '');
    change(w, '#search-translation', 'cuv-traditional');
    d.querySelector('#search').value = '上帝'; d.querySelector('#search-go').click();
    assert(d.querySelector('.search-hit .chinese-verse mark'));
    const S = w.MARANATHA_SEARCH_TEST;
    assert.equal(S.searchVerses(data, '就是得的意思').total, 0, 'footnotes not in Scripture search');
    const testEl = d.createElement('span');
    S.appendHighlighted(testEl, '𠮷\uFE00上帝𠮷\uFE00', '𠮷', 'cuv-traditional');
    assert.equal(testEl.querySelectorAll('mark').length, 2);
    assert.equal(testEl.querySelector('mark').textContent, '𠮷\uFE00', 'CJK variation selector stays attached');
    assert.equal(testEl.textContent, '𠮷\uFE00上帝𠮷\uFE00', 'highlight retains exact text');
    d.querySelector('#search').value = '利百加有一個哥哥'; d.querySelector('#search-go').click();
    assert([...d.querySelectorAll('.search-ref')].some(el => el.textContent.endsWith('24:29-30')), 'search uses combined source label');
    reference(w, 'Genesis 1');
    const interlinear = d.querySelector('#interlinear');
    interlinear.checked = true; interlinear.dispatchEvent(new w.Event('change'));
    await until(() => /native verse numbering/.test(d.querySelector('#message').textContent));
    assert.match(d.querySelector('#message').textContent, /native verse numbering/);
    assert.equal(d.querySelectorAll('.interlinear-verse').length, 0);
    interlinear.checked = false; interlinear.dispatchEvent(new w.Event('change'));
    select(w, 'web', true);
    await until(() => w.MARANATHA_TRANSLATIONS.web);
    change(w, '#search-translation', 'cuv-traditional'); d.querySelector('#search').value = '上帝'; d.querySelector('#search-go').click();
    d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-row').length, 0);
    change(w, '#search-translation', 'web'); d.querySelector('#search').value = 'God'; d.querySelector('#search-go').click();
    d.querySelector('.search-hit .compare-toggle').click();
    assert(d.querySelector('.search-hit .compare-native-notice'));
    assert.equal(d.querySelectorAll('.search-hit .compare-panel .chinese-verse').length, 0);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} file:// app: references, source ranges, notes, native bounds, search, guards, no network.`);
  } finally { w.close(); }
}

{
  const dom = await openApp(true), w = dom.window, d = w.document;
  try {
    assert.equal(w.MARANATHA_TRANSLATIONS['cuv-traditional'], undefined);
    change(w, '#view-mode', 'parallel');
    change(w, '#parallel-book', 'DAN');
    change(w, '#parallel-translation', 'cuv-traditional');
    await until(() => d.querySelector('#parallel-translation-content [lang="zh-Hant"]'));
    assert.equal(d.querySelector('#parallel-chapter').options.length, 12, 'first pane-only load uses source chapter extent');
    assert.equal(d.querySelector('#translations input[value="cuv-traditional"]').checked, false);
    change(w, '#parallel-translation', 'web');
    assert.equal(d.querySelector('#parallel-chapter').options.length, 14);
    assert.deepEqual(w.__requests, []); assert.deepEqual(dom.errors, []);
    console.log('PASS independent parallel-pane lazy loading and native bounds.');
  } finally { w.close(); }
}
