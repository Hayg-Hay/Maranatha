// Re-read every USFM record independently of the USFX importer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/sources/cuv-traditional');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifestBytes = fs.readFileSync(path.join(source, 'source-files.json'));
assert.equal(sha(manifestBytes), '95943e4c6d3a75366161f23f71bdfb71a9c2cd0804b9ea5f0ee3290588fafcb5');
for (const entry of JSON.parse(manifestBytes).files) assert.equal(sha(fs.readFileSync(path.join(source, entry.path))), entry.sha256, entry.path);
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/cuv-traditional.json'), 'utf8'));
// Ignore presentation whitespace only: every character, punctuation mark and
// source reference is compared. This never alters the production Scripture.
const compact = text => text.replace(/\s/g, '');
const stripMarkers = text => text.replace(/\\\+?[a-z]+\d*\*?[ \t]?/g, '');
let records = 0, combined = 0, notes = 0, headings = 0, superscriptions = 0;
const allIds = new Set();
for (const file of fs.readdirSync(path.join(source, 'usfm')).filter(f => f.endsWith('.usfm'))) {
  const text = fs.readFileSync(path.join(source, 'usfm', file), 'utf8');
  const id = text.match(/\\id ([A-Z0-9]+)/)[1]; allIds.add(id);
  let chapter = 0;
  const perChapter = {};
  for (const match of text.matchAll(/\\c ([0-9]+)|\\v ([0-9]+(?:-[0-9]+)?) ([\s\S]*?)(?=\\v |\\c |$)/g)) {
    if (match[1]) { chapter = Number(match[1]); perChapter[chapter] = []; continue; }
    const label = match[2];
    const index = perChapter[chapter].length;
    const record = data.sourceRecords[id][chapter][index];
    assert.equal(record.label, label, `${id}.${chapter}: label ${index}`);
    let body = match[3];
    const rawNotes = [...body.matchAll(/\\f [^ ]+ ([\s\S]*?)\\f\*/g)];
    for (const note of rawNotes) {
      const reference = note[1].match(/\\fr ([\s\S]*?)(?=\\|$)/)?.[1]?.trim() || '';
      const noteText = compact(stripMarkers(note[1].replace(/\\fr [\s\S]*?(?=\\|$)/, '')));
      const generated = data.sourceNotes[id]?.[chapter]?.filter(n => n.sourceLabel === label) || [];
      assert(generated.some(n => n.reference === reference && compact(n.text) === noteText), `Footnote ${id}.${chapter}.${label}`);
      notes++;
    }
    body = body.replace(/\\f [^ ]+ [\s\S]*?\\f\*/g, '');
    body = body.replace(/\\(?:s\d*|d|ms\d*|r|sp) [^\r\n]*/g, '');
    const expected = compact(stripMarkers(body));
    assert.equal(compact(record.text), expected, `${id}.${chapter}.${label}: independent USFM words/punctuation`);
    assert.equal(data.books[id][chapter - 1][record.start - 1], record.text);
    if (label.includes('-')) {
      combined++;
      assert.equal(data.verseMetadata[id][chapter][record.start].sourceLabel, label);
      for (let v = record.start + 1; v <= record.end; v++) {
        assert.equal(data.books[id][chapter - 1][v - 1], '', 'combined text not duplicated');
        assert.equal(data.verseMetadata[id][chapter][v].combinedInto, record.start);
      }
    }
    perChapter[chapter].push(label); records++;
  }
  assert.equal(Object.keys(perChapter).length, data.books[id].length);
  for (const [c, labels] of Object.entries(perChapter)) assert.equal(labels.length, data.sourceRecords[id][c].length);
  let headingChapter = 0;
  const seenHeadings = {};
  const seenSuperscriptions = {};
  for (const match of text.matchAll(/\\c (\d+)|\\(s\d*|d|ms\d*|r|sp) ([^\r\n]*)/g)) {
    if (match[1]) { headingChapter = Number(match[1]); continue; }
    const isPsalm = match[2] === 'd';
    const seen = isPsalm ? seenSuperscriptions : seenHeadings;
    const list = (isPsalm ? data.psalmHeadings : data.sourceHeadings)[id]?.[headingChapter] || [];
    const index = seen[headingChapter] || 0; seen[headingChapter] = index + 1;
    assert.equal(compact(list[index].text), compact(stripMarkers(match[3])), `${id}.${headingChapter}: source heading`);
    if (isPsalm) superscriptions++; else headings++;
  }
}
assert.equal(allIds.size, 66); assert.equal(records, 31021); assert.equal(combined, 70);
assert.equal(notes, 1013); assert.equal(headings, 3260); assert.equal(superscriptions, 116);
assert.equal(Object.values(data.sourceNotes).flatMap(ch => Object.values(ch).flat()).length, notes);
console.log(`Independent CUV USFM audit OK: ${records} records, ${combined} combined passages, ${notes} notes, ${headings} section/group headings, ${superscriptions} superscriptions.`);
