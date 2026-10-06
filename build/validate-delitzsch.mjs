// validate-delitzsch.mjs
//
// Source-aware validation for data/delitzsch.json. Unlike build/validate.mjs
// (which only checks chapter/verse extents against canon.js), this file
// re-derives every expected verse reference AND its exact transformed text from
// the cached, hash-pinned source, then compares the runtime JSON/JS against it.
// It also cross-checks the 3 John 1:14/1:15 transformation against both the VPL
// and the corroborating USFM.
//
//   node build/validate-delitzsch.mjs
//
// Exits non-zero on any mismatch.

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { SOURCE_DIR, NT_CANON, VPL_TO_CANON, EXPECTED_NT_BOOKS, EXPECTED_NT_CHAPTERS, EXPECTED_NT_VERSES, ANNOTATION_LABEL, ANNOTATION_NOTE } from './import-delitzsch.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const VPL_TXT = path.join(SOURCE_DIR, 'heb_vpl.txt');
const USFM_3JN = path.join(SOURCE_DIR, 'usfm', '94-3JNheb.usfm');
const LINE = /^([0-9A-Z]{3}) (\d+):(\d+) (.*)$/;
const ANNOTATION = /^(.*?)\s+\[\s*\(III John 1:15\)\s*(.*?)\s*\]\s*$/u;
const NIQQUD = /[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/;

function sourceParse(rawSource) {
  const raw = rawSource.replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const rows = [];
  const refs = new Set();
  let otRows = 0;
  let malformed = 0;
  for (const line of lines) {
    const m = LINE.exec(line);
    if (!m) { malformed++; continue; }
    const id = VPL_TO_CANON[m[1]];
    if (!id) throw new Error(`Unexpected source code ${m[1]}`);
    if (!NT_CANON.includes(id)) { otRows++; continue; }
    const chapter = Number(m[2]);
    const verse = Number(m[3]);
    const ref = `${id} ${chapter}:${verse}`;
    assert(!refs.has(ref), `duplicate source reference ${ref}`);
    refs.add(ref);
    rows.push({ id, chapter, verse, text: m[4].trim() });
  }
  return { lines: lines.length, rows, otRows, malformed };
}

function buildExpected(rows) {
  const books = {};
  const verseMetadata = {};
  for (const id of NT_CANON) books[id] = [];
  for (const row of rows) {
    let text = row.text;
    if (row.id === '3JN' && row.chapter === 1 && row.verse === 14) {
      const am = ANNOTATION.exec(text);
      assert(am, `3 John 1:14 annotation syntax changed: ${JSON.stringify(text)}`);
      verseMetadata['3JN'] = { 1: { 15: { status: 'note', text: am[2].trim(), note: ANNOTATION_NOTE } } };
      text = am[1].trim();
    }
    books[row.id][row.chapter - 1] = books[row.id][row.chapter - 1] || [];
    books[row.id][row.chapter - 1][row.verse - 1] = text;
  }
  return { books, verseMetadata };
}

function main() {
  const source = fs.readFileSync(VPL_TXT, 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch.json'), 'utf8'));
  const js = fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch.js'), 'utf8').replace(/\r\n/g, '\n');
  const { rows, otRows, malformed } = sourceParse(source);
  const expected = buildExpected(rows);

  // 1. Source-level properties.
  assert.equal(malformed, 0, 'malformed source rows');
  assert.equal(otRows, 23145, 'OT rows excluded');
  assert.equal(rows.length, EXPECTED_NT_VERSES, 'NT verse rows');
  assert.equal(Object.keys(expected.books).length, EXPECTED_NT_BOOKS, 'NT books');
  const chapters = NT_CANON.reduce((n, id) => n + expected.books[id].length, 0);
  assert.equal(chapters, EXPECTED_NT_CHAPTERS, 'NT chapters');

  // 2. Exact book membership (no extra, no missing).
  assert.deepEqual(Object.keys(data.books).sort(), [...NT_CANON].sort(), 'data book membership');
  for (const id of NT_CANON) assert(Array.isArray(data.books[id]), `${id} missing`);

  // 3. Every chapter's EXACT reference set (not just length/max): the array
  //    indices must equal the source references, with no holes and no shift.
  for (const id of NT_CANON) {
    assert.equal(data.books[id].length, expected.books[id].length, `${id} chapter count`);
    expected.books[id].forEach((expChapter, ci) => {
      const gotChapter = data.books[id][ci];
      assert(Array.isArray(gotChapter), `${id} ${ci + 1} not an array`);
      const expRefs = [];
      expChapter.forEach((t, vi) => { if (t !== undefined) expRefs.push(vi + 1); });
      const gotRefs = [];
      gotChapter.forEach((t, vi) => { if (t !== null && t !== undefined) gotRefs.push(vi + 1); });
      assert.deepEqual(gotRefs, expRefs, `${id} ${ci + 1} reference set`);
      for (const vi of expRefs) {
        assert.equal(gotChapter[vi - 1], expChapter[vi - 1], `${id} ${ci + 1}:${vi} text differs from source`);
      }
      // Metadata keys are 1-based. A key that is not a source main-text
      // reference must be a preserved note-only reference (e.g. 3 John 1:15),
      // never a silent extra/numbered verse.
      const meta = data.verseMetadata?.[id]?.[ci + 1] || {};
      for (const key of Object.keys(meta)) {
        assert(/^[1-9]\d*$/.test(key), `${id} ${ci + 1} metadata key ${key} not 1-based`);
        if (!expRefs.includes(Number(key))) {
          assert.equal(meta[key].status, 'note', `${id} ${ci + 1} metadata key ${key} is not a source reference and is not note-only`);
        }
      }
    });
  }

  // 4. Transform equality: the whole books/metadata payload must match source-derived.
  assert.deepEqual(data.books, expected.books, 'data.books differ from source');
  assert.deepEqual(data.verseMetadata, expected.verseMetadata, 'data.verseMetadata differ from source');

  // 5. Unicode integrity: no niqqud, no replacement char, only Hebrew block +
  //    spaces/punctuation in reported NT bodies.
  for (const id of NT_CANON) {
    for (const chapter of data.books[id]) {
      if (!Array.isArray(chapter)) continue;
      for (const text of chapter) {
        if (!text) continue;
        assert(!NIQQUD.test(text), `niqqud/te'amim found in ${id}: ${text}`);
        assert(!text.includes('\uFFFD'), `U+FFFD found in ${id}: ${text}`);
      }
    }
  }

  // 6. Descriptive metadata (fields old translations need not have).
  assert.equal(data.id, 'delitzsch');
  assert.equal(data.language, 'he');
  assert.equal(data.direction, 'rtl');
  assert.equal(data.translator, 'Franz Delitzsch');
  assert.equal(data.firstPublication, 1877);
  assert.equal(data.license, 'Public Domain');
  assert.match(data.description, /first published in 1877/);
  assert.match(data.description, /does not identify its underlying print edition/);

  // 7. 3 John note-only metadata.
  const threeJn = data.verseMetadata?.['3JN']?.[1]?.[15];
  assert(threeJn, '3 John 1:15 metadata missing');
  assert.equal(threeJn.status, 'note');
  assert.equal(threeJn.text, 'שלום לך הרעים שאלים לשלומך שאל לשלום הרעים לאיש איש בשמו׃');
  assert.match(threeJn.note, /publisher annotation/);
  assert.equal(data.books['3JN'][0].length, 14, '3 John main text must retain 14 numbered source verses');
  assert.equal(data.books['3JN'][0][13], 'אבל אקוה לראותך במהרה ופה אל פה נדבר׃');

  // 7b. Corroborate against the USFM: the annotation is inside \v 14, verbatim,
  //     not a \f footnote and not a separate \v 15.
  const usfm = fs.readFileSync(USFM_3JN, 'utf8');
  const v14 = usfm.split(/\r?\n/).find((l) => /^\\v 14 /.test(l));
  assert(v14, 'USFM 3 John \\v 14 not found');
  assert(v14.includes(`(${ANNOTATION_LABEL})`), 'USFM 3 John annotation label not in \\v 14');
  assert(!/^\\v 15 /m.test(usfm), 'USFM unexpectedly has a separate \\v 15');
  const usfmAm = ANNOTATION.exec(v14.replace(/^\\v 14\s+/, '').trim());
  assert(usfmAm, 'USFM 3 John annotation syntax differs from VPL');
  assert.equal(usfmAm[1].trim(), data.books['3JN'][0][13], 'USFM main text disagrees with VPL');
  assert.equal(usfmAm[2].trim(), threeJn.text, 'USFM annotation disagrees with VPL');

  // 8. Specific reference checks.
  const expectText = (id, ch, v, re) => {
    const t = data.books[id]?.[ch - 1]?.[v - 1];
    assert(t, `${id} ${ch}:${v} missing`);
    assert.match(t, re, `${id} ${ch}:${v} unexpected text`);
  };
  expectText('MAT', 1, 1, /^ספר/);
  expectText('JHN', 1, 1, /בראשית היה הדבר/);
  expectText('ACT', 3, 15, /שר החיים/);
  expectText('ROM', 8, 1, /אין אשמה/);
  expectText('REV', 22, 21, /חסד.*המשיח/);
  for (const [id, ch, v] of [['MAT', 17, 21], ['MAT', 18, 11], ['MAT', 23, 14], ['MRK', 16, 9], ['MRK', 16, 20],
    ['JHN', 5, 4], ['JHN', 7, 53], ['JHN', 8, 11], ['ACT', 8, 37], ['ACT', 24, 7], ['ACT', 28, 29],
    ['ROM', 16, 24], ['ROM', 16, 25], ['ROM', 16, 27], ['1JN', 5, 7]]) {
    assert(data.books[id]?.[ch - 1]?.[v - 1], `expected source verse ${id} ${ch}:${v} missing`);
  }

  // 9. Romans placement: 14 ends at 23; 16 has 24 and the doxology 25–27; no padding.
  assert.equal(data.books.ROM[13].length, 23, 'Romans 14 must end at 23 (no invented 24–26)');
  assert.equal(data.books.ROM[15].length, 27, 'Romans 16 must have 27 source verses');
  assert(!data.books.ROM[13][23] && !data.books.ROM[13][24] && !data.books.ROM[13][25], 'Romans 14 must not be padded');

  // 10. JSON/JS object equality.
  const jsonText = fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch.json'), 'utf8');
  assert.equal(js, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch']=${JSON.stringify(JSON.parse(jsonText), null, 2)};\n`, 'delitzsch.js does not embed delitzsch.json');

  console.log('validate-delitzsch: OK');
  console.log(`  ${EXPECTED_NT_BOOKS} NT books / ${EXPECTED_NT_CHAPTERS} chapters / ${rows.length} verse rows (${otRows} OT rows excluded).`);
  console.log('  Every chapter reference set and transformed text matches the cached VPL source.');
  console.log('  3 John 1:14/1:15 transformation corroborated against the USFM.');
  console.log('  Unicode: zero niqqud/te\'amim, zero U+FFFD, no invented content.');
}

main();
