// Focused implementation smoke only. The independent USFX/source audit lives in
// check-bohairica-independent.mjs and the dedicated integration suite in
// test-bohairica.mjs; this script does not replace either.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ROOT, loadAndBuild, readBohairicaUsfm } from './import-bohairica.mjs';

const data = loadAndBuild();
assert.equal(data.books.GEN, undefined);
assert.equal(data.books['3JN'][0].length, 15);
assert.equal(data.books.ACT[23][6], '');
assert.equal(data.books.MRK[15].length, 20);
assert(data.books.JHN[7][0], 'John 8 source text retained');
assert.throws(() => readBohairicaUsfm('\\id MAT\n\\c 1\n\\v 1 test\\f + hidden\\f*'), /Unsupported/);

// Verify this bundled font contains all non-whitespace code points used in
// Scripture/titles; this is cmap coverage, not a visual shaping certification.
const font = fs.readFileSync(path.join(ROOT, 'fonts/NotoSansCoptic-Regular.ttf'));
let cmap;
for (let i = 0; i < font.readUInt16BE(4); i++) {
  const off = 12 + i * 16;
  if (font.toString('ascii', off, off + 4) === 'cmap') cmap = font.readUInt32BE(off + 8);
}
assert(cmap);
const subtables = [];
for (let i = 0; i < font.readUInt16BE(cmap + 2); i++) {
  const record = cmap + 4 + i * 8;
  const platform = font.readUInt16BE(record), encoding = font.readUInt16BE(record + 2);
  if (platform === 0 || (platform === 3 && [1, 10].includes(encoding))) subtables.push(cmap + font.readUInt32BE(record + 4));
}
function hasGlyph(cp) {
  return subtables.some(off => {
    const format = font.readUInt16BE(off);
    if (format === 12) {
      for (let i = 0; i < font.readUInt32BE(off + 12); i++) {
        const group = off + 16 + i * 12;
        if (cp >= font.readUInt32BE(group) && cp <= font.readUInt32BE(group + 4)) return font.readUInt32BE(group + 8) + cp - font.readUInt32BE(group) !== 0;
      }
    }
    if (format === 4 && cp < 65536) {
      const count = font.readUInt16BE(off + 6) / 2, ends = off + 14, starts = ends + count * 2 + 2;
      const deltas = starts + count * 2, offsets = deltas + count * 2;
      for (let i = 0; i < count; i++) {
        if (cp < font.readUInt16BE(starts + i * 2) || cp > font.readUInt16BE(ends + i * 2)) continue;
        const delta = font.readInt16BE(deltas + i * 2), offset = font.readUInt16BE(offsets + i * 2);
        const glyph = offset ? font.readUInt16BE(offsets + i * 2 + offset + 2 * (cp - font.readUInt16BE(starts + i * 2))) : cp;
        return glyph !== 0 && ((glyph + delta) & 65535) !== 0;
      }
    }
    return false;
  });
}
const chars = new Set(Object.values(data.books).flat(2).join('') + Object.values(data.bookMetadata).flatMap(Object.values).join(''));
const missing = [...chars].filter(ch => !/\s/u.test(ch) && !hasGlyph(ch.codePointAt(0)));
assert.deepEqual(missing, [], 'font coverage of source characters');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i = 0; i < 200; i++) { if (fn()) return; await sleep(20); } throw new Error('Bohairica smoke timed out'); }
for (const narrow of [false, true]) {
  const errors = [], requests = [];
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.MARANATHA_ENABLE_TEST_HOOKS = true;
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = url => { requests.push(String(url)); throw new Error('Network blocked'); };
      w.XMLHttpRequest = class { open(method, url) { requests.push(String(url)); throw new Error('Network blocked'); } };
      w.addEventListener('error', e => errors.push(e.message));
    },
  });
  const w = dom.window, d = w.document;
  const select = (id, on) => { const el = d.querySelector(`#translations input[value="${id}"]`); assert(el); el.checked = on; el.dispatchEvent(new w.Event('change')); };
  const change = (selector, value) => { const el = d.querySelector(selector); el.value = value; el.dispatchEvent(new w.Event('change')); };
  const ref = text => { d.querySelector('#reference').value = text; d.querySelector('#reference-go').click(); };
  try {
    await until(() => d.readyState === 'complete');
    assert.equal(w.MARANATHA_TRANSLATIONS.bohairica, undefined, 'lazy loading');
    select('web', false); select('bohairica', true);
    await until(() => w.MARANATHA_TRANSLATIONS.bohairica);
    ref('John 3:16');
    await until(() => d.querySelector('.coptic-verse'));
    const cell = d.querySelector('.coptic-verse');
    assert.equal(cell.textContent, data.books.JHN[2][15]);
    assert.equal(cell.lang, 'cop'); assert.equal(cell.dir, 'ltr');
    assert(w.getComputedStyle(cell).fontFamily.includes('Noto Sans Coptic'));
    change('#language', 'cop'); ref(`${data.bookMetadata.JHN.toc2} 3:16`);
    assert.equal(d.querySelector('#message').textContent, '');
    assert.equal(d.querySelector('.coptic-verse').textContent, data.books.JHN[2][15]);
    ref('3 John 1:15'); assert.equal(d.querySelector('.coptic-verse').textContent, data.books['3JN'][0][14]);
    ref('Acts 24:7'); assert(d.querySelector('.verse-source-gap'));
    ref('Genesis 1:1'); assert(!d.querySelector('.coptic-verse')); assert(!d.querySelector('#results').textContent.includes('undefined'));
    ref('John 3:16');
    select('web', true); change('#layout', 'multirow');
    assert.equal(d.querySelectorAll('.comparison-table-rows').length, 2, 'independent comparison blocks');
    change('#search-translation', 'bohairica');
    d.querySelector('#search').value = data.books.JHN[2][15].toLowerCase(); d.querySelector('#search-go').click();
    const hit = d.querySelector('.search-hit .coptic-verse');
    assert(hit?.querySelector('mark')); assert.equal(hit.textContent, data.books.JHN[2][15]);
    const S = w.MARANATHA_SEARCH_TEST;
    assert.equal(S.searchVerses({ language: 'cop', books: { JHN: [['Ⲁ\u0305']] } }, 'ⲁ\u0305').total, 1);
    assert.equal(S.searchVerses({ language: 'cop', books: { JHN: [['Ϣ']] } }, 'ϣ').total, 1);
    assert.deepEqual(requests, []); assert.deepEqual(errors, []);
    console.log(`PASS Bohairica ${narrow ? 'mobile' : 'desktop'} file:// smoke: lazy load, exact text, Coptic names, LTR/font, native extent/gap, independent blocks, case-aware search.`);
  } finally { w.close(); }
}
console.log('PASS bundled Coptic font source-character coverage; independent source audit and dedicated tests are separate.');
