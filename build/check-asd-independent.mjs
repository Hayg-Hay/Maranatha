// Independent regex/context-boundary reader of the same supplied USFM witness.
// It imports neither the importer nor its tokenizer. This checks source fidelity,
// not translation accuracy or an independent printed/textual witness.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/sources/asd');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifestBytes = fs.readFileSync(path.join(source, 'source-files.json'));
assert.equal(sha(manifestBytes), 'c5f0b3ebc351f8ababe906ca53ad9976fb8434969391b3a1ce43015758324549');
for (const f of JSON.parse(manifestBytes).files) assert.equal(sha(fs.readFileSync(path.join(source, f.path))), f.sha256, f.path);
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/asd.json'), 'utf8'));
const compact = text => text.replace(/\s/g, ''); // Keeps all Tagalog marks/ZWS/punctuation.
const deRef = text => text.replace(/\\ref[ \t]+([\s\S]*?)\\ref\*/g, (_, inner) => inner.split('|')[0]);
const markers = text => deRef(text).replace(/\\cat[ \t]+[\s\S]*?\\cat\*/g, '').replace(/\\\+?[a-z]+\d*\*?[ \t]?/g, '');
const structures = 'id|rem|h|toc[123]|mt[123]?|ie|s[123]|ms1?|mr|r|d|qa|sp|cl|iex';
const paragraphs = 'p|b|q[123rc]|qm[12]|m|mi|pm|po|pmo|pmc|pc|pr|pi1|nb|li[123]|lf|lh';
const boundaries = `${structures}|${paragraphs}|c|v`;
const structureBlock = new RegExp(`\\\\(?:${structures})\\b[\\s\\S]*?(?=\\\\(?:${boundaries})\\b|$)`, 'g');
let records = 0, footnotes = 0, headings = 0, mainText = 0, zws = 0, editorial = 0;
const files = fs.readdirSync(path.join(source, 'usfm')).sort(); assert.equal(files.length, 66);
for (const file of files) {
  const raw = fs.readFileSync(path.join(source, 'usfm', file), 'utf8'), id = file.slice(0, -5);
  const identity = raw.replace(/^\uFEFF/, '').match(/^\\id ([A-Z0-9]+)\s+([^\r\n]+)/);
  assert.equal(identity?.[1], id); assert(identity[2].includes('Tagalog Contemporary Bible'));
  const noNotes = raw.replace(/\\f[ \t]+[\s\S]*?\\f\*/g, '').replace(/\\fm[ \t]+[\s\S]*?\\fm\*/g, '');
  const reading = noNotes.replace(structureBlock, '');
  let chapter = 0;
  const references = [];
  for (const m of reading.matchAll(/\\c\s+(\d+)|\\v\s+(\d+(?:-\d+)?)\s*([\s\S]*?)(?=\\v\s+|\\c\s+|$)/g)) {
    if (m[1]) { chapter = Number(m[1]); references.push([]); continue; }
    const [v, end = v] = m[2].split('-').map(Number), expected = markers(m[3]).trim();
    const actual = data.books[id][chapter - 1][v - 1];
    assert.equal(compact(actual), compact(expected), `USFM Scripture ${id}.${chapter}.${v}`);
    for (let n = v; n <= end; n++) references[chapter - 1].push(n);
    if (end > v) {
      assert.equal(data.verseMetadata[id][chapter][v].sourceLabel, m[2]);
      for (let n = v + 1; n <= end; n++) { assert.equal(data.books[id][chapter - 1][n - 1], ''); assert.equal(data.verseMetadata[id][chapter][n].combinedInto, v); }
      assert(data.versification[id][chapter].comparisonUnavailable);
    }
    records++;
    if (actual) mainText++;
    zws += [...actual.matchAll(/\u200B/g)].length;
  }
  assert.equal(references.length, data.books[id].length);
  references.forEach((r, c) => assert.deepEqual(r, data.books[id][c].map((_, i) => i + 1)));
  let c = 0, v = 0; const noteIndices = {};
  for (const m of raw.matchAll(/\\c\s+(\d+)|\\v\s+(\d+)|\\f[ \t]+([\s\S]*?)\\f\*/g)) {
    if (m[1]) { c = Number(m[1]); v = 0; continue; }
    if (m[2]) { v = Number(m[2]); continue; }
    const body = m[3].replace(/^\S+[ \t]*/, '');
    const reference = [...body.matchAll(/\\\+?fr[ \t]+([^\\]*)/g)].map(m => m[1].trim()).join('; ');
    const expected = markers(body.replace(/\\\+?fr[ \t]+[^\\]*/g, '')).trim();
    const index = noteIndices[c] || 0; noteIndices[c] = index + 1;
    const note = data.sourceNotes[id][c].filter(n => n.type === 'footnote')[index];
    assert.equal(note.verse, v); assert.equal(note.reference, reference);
    assert.equal(compact(note.text), compact(expected), `USFM footnote ${id}.${c}.${v}`);
    footnotes++;
  }
  // Structural contexts end at the next paragraph/verse/chapter or structure.
  let headingChapter = 0; const headingIndices = {};
  const structureMatches = [...noNotes.matchAll(structureBlock)];
  for (const m of structureMatches) {
    const prefix = noNotes.slice(0, m.index);
    headingChapter = Number([...prefix.matchAll(/\\c\s+(\d+)/g)].at(-1)?.[1] || 0);
    const tag = m[0].match(/^\\([a-z]+\d*)/)[1];
    if (tag === 'iex') {
      const note = data.sourceNotes[id][headingChapter].find(n => n.type === 'editorial');
      assert.equal(compact(note.text), compact(markers(m[0]).trim())); editorial++; continue;
    }
    if (!['s1', 's2', 's3', 'ms', 'ms1', 'mr', 'r', 'd', 'qa', 'sp'].includes(tag)) continue;
    const expected = markers(m[0]).trim();
    if (!expected) continue;
    const key = `${tag === 'd' ? 'psalm' : 'head'}.${headingChapter}`;
    const index = headingIndices[key] || 0; headingIndices[key] = index + 1;
    const list = (tag === 'd' ? data.psalmHeadings : data.sourceHeadings)[id][headingChapter];
    assert.equal(compact(list[index].text), compact(expected), `USFM heading ${id}.${headingChapter}`);
    headings++;
  }
}
assert.equal(records, 30868); assert.equal(mainText, 30868); assert.equal(footnotes, 2333); assert.equal(headings, 2707); assert.equal(zws, 0);
assert.equal(editorial, 0);
const kjv = JSON.parse(fs.readFileSync(path.join(root, 'data/kjv.json'), 'utf8'));
for (const [id, chapters] of Object.entries(data.books)) {
  if (id === '3JN') assert.deepEqual(chapters.map(c => c.length), [15]);
  else {
    const expected = kjv.books[id].map(c => c.length);
    if (id === '2CO') expected[12] = 13;
    if (id === 'REV') expected[11] = 18;
    assert.deepEqual(chapters.map(c => c.length), expected, id);
  }
}
assert.equal(data.sourcePackageHasMetadataXml, false);
console.log('Independent ASD audit OK: every numbered source unit, combined label, footnote and heading; source extents retained.');
