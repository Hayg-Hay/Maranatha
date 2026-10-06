import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { parseChapter } from './import-eng-web-c.mjs';
const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('data/canon.js') + read('data/locales/en.js'), sandbox);
vm.runInContext(read('app.js').split('(() => {')[0] + '\nthis.Parser = ReferenceParser; this.Availability = VerseAvailability;', sandbox);
const { Parser, Availability: availability, window: w } = sandbox;
const web = JSON.parse(read('data/web.json'));
const translations = { web };
const parser = new Parser(w.MARANATHA_CANON, w.MARANATHA_LOCALE_EN, () => translations);
assert.equal(parser.parseMulti('Sir 26:25')[0].ranges[0].start, 25);
assert.equal(parser.parseMulti('Sir 26:28-')[0].ranges[0].end, 29);
assert.throws(() => parser.parseMulti('Sir 26:30'));
assert.equal(availability.cell(web, 'SIR', 26, 25).state, 'omitted');
assert.match(availability.cell(web, 'SIR', 26, 28).text, /^For two things/);
assert.match(availability.cell(web, 'SIR', 26, 29).text, /^It is difficult/);
for (let v = 19; v <= 27; v++) assert.equal(web.books.SIR[25][v - 1], null);
// A separately loaded translation is discovered dynamically, including sparse
// and additional references outside the canon / selected translation extent.
const fixture = { books: { SIR: [ ...Array(25).fill([]), [...Array(29).fill(null), 'additional source verse'] ] },
  verseMetadata: { SIR: { 26: { 30: { status: 'additional' } } } } };
translations.other = fixture;
assert.equal(parser.parseMulti('Sir 26:30')[0].ranges[0].end, 30);
assert.equal(availability.cell(fixture, 'SIR', 26, 30).state, 'additional');
translations.notes = { books: { SIR: [...Array(25).fill([]), []] }, verseMetadata: { SIR: { 26: { 31: { status: 'note', text: 'Note-only reading' } } } } };
assert.equal(parser.parseMulti('Sir 26:31')[0].ranges[0].end, 31);
assert.equal(availability.cell(translations.notes, 'SIR', 26, 31).state, 'note');
assert.throws(() => parser.parseMulti('Sir 26:32'));
// Raw source IDs survive omissions and a combined omission marker. Neither
// footnotes nor numeric whitespace entities become verse prose.
const raw = `<div class="main"><span class="verse" id="V18">18&#160;</span>Before<span class="verse" id="V19">19-27&#160;</span><a href="#FN1">§<span class="popup">Verses 19-27 are omitted.</span></a><div>&#160;</div><span class="verse" id="V28">28&#160;</span>After<ul class='tnav'></ul>`;
const parsed = parseChapter(raw);
assert.equal(parsed.verses[17], 'Before');
assert.equal(parsed.verses[27], 'After');
assert.equal(parsed.verses[24], null);
assert.equal(parsed.metadata[25].status, 'omitted');
// Drive the actual file:// app in every normal reading layout.
const dom = await JSDOM.fromFile(fileURLToPath(new URL('index.html', root)), {
  runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = query => ({ get matches() { return query.includes('max-width') && !!window.narrowTest; }, addEventListener() {} });
    window.scrollTo = () => {};
    window.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { document } = dom.window;
await new Promise(r => dom.window.addEventListener('load', r, { once: true }));
const go = ref => { document.querySelector('#reference').value = ref; document.querySelector('#reference-go').click(); };
for (const layout of ['multicolumn', 'multirow']) {
  document.querySelector('#layout').value = layout;
  go('Sir 26:25,28-29');
  assert.equal(document.querySelector('#message').textContent, '');
  assert.match(document.querySelector('#results').textContent, /omitted in this translation/);
  assert.match(document.querySelector('#results').textContent, /26:28.*For two things/s);
  assert.match(document.querySelector('#results').textContent, /26:29.*It is difficult/s);
}
dom.window.narrowTest = true;
go('Sir 26:25,28-29');
assert.equal(document.querySelectorAll('.mobile-verse').length, 3);
assert.match(document.querySelector('#results').textContent, /26:28.*For two things/s);
assert.match(document.querySelector('#results').textContent, /omitted in this translation/);
// Whole-chapter and context rendering use source extent, not global counts.
go('Sir 26');
assert.equal(document.querySelectorAll('.mobile-verse').length, 29);
go('Sir 26:25');
document.querySelector('#context-toggle').click();
assert.match(document.querySelector('#results').textContent, /26:28.*For two things/s);
document.querySelector('#context-toggle').click();
// Inject an unselected loaded version; its reference must still navigate.
dom.window.MARANATHA_TRANSLATIONS.other = fixture;
go('Sir 26:30');
assert.equal(document.querySelector('#message').textContent, '');
assert.match(document.querySelector('#results').textContent, /26:30/);
assert.match(document.querySelector('#results').textContent, /verse not available/);
assert.match(document.querySelector('#results').textContent, /Available in loaded translations: other/);
go('Sir 26:32');
assert.match(document.querySelector('#message').textContent, /not a reference available/);
dom.window.close();
console.log('Sirach parser, importer, source numbering and file:// rendering checks passed.');
