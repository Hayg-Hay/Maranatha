// Independent regex/context-boundary reader of the same supplied USFM witness.
// It imports neither the importer nor its tokenizer. This checks source fidelity,
// not translation accuracy or an independent printed/textual witness.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/sources/tcv');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifestBytes = fs.readFileSync(path.join(source, 'source-files.json'));
assert.equal(sha(manifestBytes), '277941233c65d0c035169e533ea21fd746ab1336ec60744e63a5d8fceb8d1197');
for (const f of JSON.parse(manifestBytes).files) assert.equal(sha(fs.readFileSync(path.join(source, f.path))), f.sha256, f.path);
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/tcv.json'), 'utf8'));
const compact = text => text.replace(/\s/g, ''); // Keeps all Thai marks/ZWS/punctuation.
const deRef = text => text.replace(/\\ref[ \t]+([\s\S]*?)\\ref\*/g, (_, inner) => inner.split('|')[0]);
const markers = text => deRef(text).replace(/\\\+?[a-z]+\d*\*?[ \t]?/g, '');
const structures = 'id|rem|h|toc[123]|mt1?|s[12]|ms1?|mr|r|d|qa|sp|cl|iex';
const paragraphs = 'p|b|q[123rc]|qm[12]|m|mi|pm|po|pmo|pmc|pc|pr|pi1|nb|li[123]|lf|lh';
const boundaries = `${structures}|${paragraphs}|c|v`;
const structureBlock = new RegExp(`\\\\(?:${structures})\\b[\\s\\S]*?(?=\\\\(?:${boundaries})\\b|$)`, 'g');
let records = 0, footnotes = 0, headings = 0, mainText = 0, zws = 0, editorial = 0;
const files = fs.readdirSync(path.join(source, 'usfm')).sort(); assert.equal(files.length, 66);
for (const file of files) {
  const raw = fs.readFileSync(path.join(source, 'usfm', file), 'utf8'), id = file.slice(0, -5);
  const identity = raw.replace(/^\uFEFF/, '').match(/^\\id ([A-Z0-9]+)\s+([^\r\n]+)/);
  assert.equal(identity?.[1], id); assert(identity[2].includes('Biblica® Open Thai Common Version 2025'));
  const noNotes = raw.replace(/\\f[ \t]+[\s\S]*?\\f\*/g, '').replace(/\\fm[ \t]+[\s\S]*?\\fm\*/g, '');
  const reading = noNotes.replace(structureBlock, '');
  let chapter = 0;
  const references = [];
  for (const m of reading.matchAll(/\\c\s+(\d+)|\\v\s+(\d+)\s*([\s\S]*?)(?=\\v\s+|\\c\s+|$)/g)) {
    if (m[1]) { chapter = Number(m[1]); references.push([]); continue; }
    const v = Number(m[2]), expected = markers(m[3]).trim();
    const actual = data.books[id][chapter - 1][v - 1];
    assert.equal(compact(actual), compact(expected), `USFM Scripture ${id}.${chapter}.${v}`);
    references[chapter - 1].push(v); records++;
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
    if (!['s1', 's2', 'ms', 'ms1', 'mr', 'r', 'd', 'qa', 'sp'].includes(tag)) continue;
    const expected = markers(m[0]).trim();
    if (!expected) continue;
    const key = `${tag === 'd' ? 'psalm' : 'head'}.${headingChapter}`;
    const index = headingIndices[key] || 0; headingIndices[key] = index + 1;
    const list = (tag === 'd' ? data.psalmHeadings : data.sourceHeadings)[id][headingChapter];
    assert.equal(compact(list[index].text), compact(expected), `USFM heading ${id}.${headingChapter}`);
    headings++;
  }
}
assert.equal(records, 31103); assert.equal(mainText, 31087); assert.equal(footnotes, 3211); assert.equal(headings, 2608); assert.equal(zws, 678306);
assert.equal(editorial, 3);
const kjv = JSON.parse(fs.readFileSync(path.join(root, 'data/kjv.json'), 'utf8'));
for (const [id, chapters] of Object.entries(data.books)) {
  if (id === '3JN') assert.deepEqual(chapters.map(c => c.length), [15]);
  else assert.deepEqual(chapters.map(c => c.length), kjv.books[id].map(c => c.length), id);
}
assert.equal(Object.values(data.sourceNotes).flatMap(c => Object.values(c).flat()).filter(n => n.type === 'editorial').length, 3);
const unnumbered = data.sourceNotes.JER[39].find(n => n.type === 'unnumbered-source');
assert(unnumbered && fs.readFileSync(path.join(source, 'usfm/JER.usfm'), 'utf8').includes(unnumbered.text));
assert.equal(data.sourcePackageHasMetadataXml, false);
console.log('Independent TCV source audit OK: 31,103 positions, 31,087 main texts, 3,211 footnotes, 2,608 text headings, 678,306 preserved zero-width spaces.');
