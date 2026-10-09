// Independent CSV + raw SFM check; does not import either AYT parser/builder.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/sources/ayt');
const manifestBytes = fs.readFileSync(path.join(source, 'source-files.json'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(manifestBytes), 'baa84abb253bf70e67c0c6fdb7c37d3db397d563d20988a55532e2aacde9bed6');
for (const file of JSON.parse(manifestBytes).files) assert.equal(hash(fs.readFileSync(path.join(source, file.path))), file.sha256, file.path);
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/ayt.json'), 'utf8'));
const ids = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
function csvRows(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\r' || ch === '\n') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(v => v !== '')) rows.push(row); row = []; field = '';
    } else field += ch;
  }
  assert(!quoted, 'unterminated CSV quote');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const rows = csvRows(fs.readFileSync(path.join(source, 'csv/ayt.csv'), 'utf8'));
assert.deepEqual(rows.shift(), ['id', 'book', 'abbr', 'chapter', 'verse', 'text', 'title']);
assert.equal(rows.length, 31102);
const referenceSets = new Map();
for (const [i, row] of rows.entries()) {
  assert.equal(row.length, 7); assert.equal(row[0], String(i + 1));
  const id = ids[Number(row[1]) - 1], c = Number(row[3]), v = Number(row[4]);
  const text = row[5].replace(/<t \/>/g, '');
  assert.equal(data.books[id][c - 1][v - 1], text, `CSV text ${id}.${c}.${v}`);
  const key = `${id}.${c}`; referenceSets.set(key, (referenceSets.get(key) || 0) + 1);
  if (row[6]) assert(data.sourceJsonTitles[id][c].some(t => t.verse === v && t.text === row[6]));
}
assert.equal(Object.keys(data.books).length, 66); assert.equal(referenceSets.size, 1189);
for (const [key, count] of referenceSets) {
  const [id, c] = key.split('.'); assert.equal(data.books[id][Number(c) - 1].length, count);
}
// Confirm the grid agrees with the existing KJV, without interpreting matching
// counts as proof of identical wording or of printed native Psalm numbering.
const kjv = JSON.parse(fs.readFileSync(path.join(root, 'data/kjv.json'), 'utf8'));
for (const id of ids) assert.deepEqual(data.books[id].map(c => c.length), kjv.books[id].map(c => c.length));
let notes = 0, headings = 0, superscriptionMarkers = 0;
for (const file of fs.readdirSync(path.join(source, 'sfm/per-books')).sort()) {
  const raw = fs.readFileSync(path.join(source, 'sfm/per-books', file), 'utf8');
  const id = raw.match(/\\id (\S+)/)[1];
  let chapter = 0, verse = 0; const noteIndices = {};
  for (const m of raw.matchAll(/\\c (\d+)|\\v (\d+)|\\(f|x|rq)[ \t]+([\s\S]*?)\\\3\*/g)) {
    if (m[1]) { chapter = Number(m[1]); verse = 0; continue; }
    if (m[2]) { verse = Number(m[2]); continue; }
    const type = m[3];
    let body = m[4];
    if (type !== 'rq') body = body.replace(/^[+\-][ \t]+/, '');
    const references = [...body.matchAll(/\\(?:fr|xo)[ \t]+([^\\]*)/g)].map(n => n[1].trim()).join('; ');
    body = body.replace(/\\(?:fr|xo)[ \t]+[^\\]*/g, '');
    const expected = body.replace(/\\[a-z]+\d*\*?[ \t]?/g, '').replace(/\s+/g, ' ').trim();
    const index = noteIndices[chapter] || 0; noteIndices[chapter] = index + 1;
    const note = data.sourceNotes[id][chapter][index];
    assert.equal(note.verse, verse); assert.equal(note.reference, references);
    assert.equal(note.text.replace(/\s+/g, ' ').trim(), expected, `SFM note ${id}.${chapter}.${verse}`);
    notes++;
  }
  const withoutNotes = raw.replace(/\\(f|x|rq)[ \t]+[\s\S]*?\\\1\*/g, '');
  superscriptionMarkers += [...withoutNotes.matchAll(/^\\d\s*$/gm)].length;
  let c = 0, headingVerse = 0; const indices = {};
  for (const m of withoutNotes.matchAll(/\\c (\d+)|\\(s|s2|ms|mr|d|r)[ \t]+([^\r\n]*)|\\v (\d+)/g)) {
    if (m[1]) { c = Number(m[1]); headingVerse = 0; continue; }
    if (m[4]) { headingVerse = Number(m[4]); continue; }
    const type = m[2] === 'd' ? 'psalmHeadings' : 'sourceHeadings';
    const key = `${type}.${c}`, index = indices[key] || 0; indices[key] = index + 1;
    assert.equal(data[type][id][c][index].text.trim(), m[3].trim(), `SFM heading ${id}.${c}`);
    assert.equal(data[type][id][c][index].afterVerse, headingVerse);
    const tail = withoutNotes.slice(m.index + m[0].length).match(/^[\s\S]*?(?=\\v\s+|\\c\s+|$)/)[0]
      .replace(/\\(?:s|s2|ms|mr|d|r)[ \t]+[^\r\n]*/g, '').replace(/\\[a-z]+\d*\*?[ \t]?/g, '').trim();
    assert.equal(data[type][id][c][index].withinVerse, headingVerse && tail ? headingVerse : undefined, `SFM within-verse position ${id}.${c}`);
    headings++;
  }
}
assert.equal(notes, 1812); assert.equal(headings, 2939); assert.equal(superscriptionMarkers, 116);
assert.equal(Object.values(data.sourceSuperscriptionMarkers).flatMap(c => Object.values(c).flat()).length, 116);
assert.equal(Object.values(data.sourceNotes).flatMap(c => Object.values(c).flat()).length, notes);
console.log('Independent AYT audit OK: 31,102 CSV verses exact; KJV-shaped grid; 1,812 SFM notes, 2,939 headings and 116 superscription markers verified.');
