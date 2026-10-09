// Separate USFX reader of eBible's second serialization of the same edition.
// Imports neither the USFM parser nor importer; no independent printed witness
// or translation-accuracy assessment is implied.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/sources/ovcb');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const manifest = fs.readFileSync(path.join(source, 'source-files.json'));
assert.equal(sha(manifest), '816f095eba7ae4462405ce0d348b930445821662b18e8dfdb874d9467f121ac2');
for (const f of JSON.parse(manifest).files) assert.equal(sha(fs.readFileSync(path.join(source, f.path))), f.sha256, f.path);
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/ovcb.json'), 'utf8'));
const xml = fs.readFileSync(path.join(source, 'usfx/vieovcb_usfx.xml'), 'utf8');
assert.equal(XMLValidator.validate(xml), true);
const tree = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false }).parse(xml).find(n => n.usfx).usfx;
const tag = n => Object.keys(n).find(k => k !== ':@');
const plain = ns => ns.map(n => tag(n) === '#text' ? String(n['#text']) : plain(n[tag(n)] || [])).join('');
const compact = text => text.replace(/\s/g, ''); // Retains every vowel/tone mark and punctuation.
let units = 0, notes = 0, headings = 0;
const bookNodes = tree.filter(n => n.book); assert.equal(bookNodes.length, 66);
assert.deepEqual(bookNodes.map(n => n[':@']['@_id']).sort(), Object.keys(data.books).sort());
for (const book of bookNodes) {
  const id = book[':@']['@_id'], seen = new Map(), noteIndex = {}, headIndex = {};
  let c = 0, v = 0, active = null;
  function finish() {
    if (!active) return;
    assert.equal(compact(data.books[id][c - 1][active.v - 1]), compact(active.text), `USFX ${id}.${c}.${active.v}`);
    assert(!seen.has(`${c}.${active.v}`)); seen.set(`${c}.${active.v}`, true); units++; active = null;
  }
  function walk(ns) {
    for (const n of ns) {
      const k = tag(n), children = n[k], attrs = n[':@'] || {};
      if (k === '#text') { if (active) active.text += n[k]; continue; }
      if (k === 'c') { finish(); assert.equal(Number(attrs['@_id']), c + 1); c++; v = 0; continue; }
      if (k === 'v') { finish(); v = Number(attrs['@_id']); active = { v, text: '' }; continue; }
      // eBible places ve before some continued poetry lines (e.g. DEU 28:3).
      // The next v/c supplies the unit boundary, matching the numbered USFM.
      if (k === 've') continue;
      if (k === 'f') {
        const i = noteIndex[c] || 0; noteIndex[c] = i + 1;
        const actual = data.sourceNotes[id][c][i];
        assert.equal(actual.verse, v); assert.equal(actual.reference, plain(children.filter(n => n.fr)).trim());
        assert.equal(compact(actual.text), compact(plain(children.filter(n => !n.fr))), `USFX note ${id}.${c}.${v}`);
        notes++; continue;
      }
      if (k === 's' || k === 'd' || (k === 'p' && ['ms', 'mr', 'qa', 'sp'].includes(attrs['@_sfm']))) {
        const key = `${k === 'd' ? 'psalm' : 'section'}.${c}`, i = headIndex[key] || 0; headIndex[key] = i + 1;
        const actual = (k === 'd' ? data.psalmHeadings : data.sourceHeadings)[id][c][i];
        assert.equal(compact(actual.text), compact(plain(children)), `USFX heading ${id}.${c}`); headings++; continue;
      }
      if (['id', 'h', 'toc', 'cl'].includes(k) || (k === 'p' && attrs['@_sfm'] === 'mt')) continue;
      if (['p', 'q', 'b', 'sc'].includes(k)) { walk(children); continue; }
      throw new Error(`Unsupported USFX element ${k}`);
    }
  }
  walk(book.book); finish(); assert.equal(c, data.books[id].length);
  data.books[id].forEach((chapter, i) => chapter.forEach((text, j) => {
    if (text) assert(seen.has(`${i + 1}.${j + 1}`));
    else assert.equal(data.verseMetadata[id][i + 1][j + 1].status, 'source-gap');
  }));
}
assert.equal(units, 31096); assert.equal(notes, 1562); assert.equal(headings, 2539);
const kjv = JSON.parse(fs.readFileSync(path.join(root, 'data/kjv.json'), 'utf8'));
for (const [id, chapters] of Object.entries(data.books)) {
  const expected = kjv.books[id].map(c => c.length);
  if (id === '3JN') expected[0] = 15;
  if (id === 'REV') expected[11] = 18;
  assert.deepEqual(chapters.map(c => c.length), expected, id);
}
console.log('Independent OVCB USFX audit OK: 31,096 source units, 1,562 notes, 2,539 headings/superscriptions and source gaps/extents.');
