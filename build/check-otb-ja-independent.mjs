// check-otb-ja-independent.mjs
//
// Independent audit of the Open Translation Bible (OTB) Japanese import.
// It never imports build/import-otb-ja.mjs: it re-reads the pinned raw source,
// re-verifies every manifest SHA256 and git blob, and compares the raw JSON
// chapter by chapter against the generated data/otb-ja.json (every numbered
// verse, every preserved text segment and every unnumbered record).
//
//   node build/check-otb-ja-independent.mjs
//
// It also runs the importer with --check twice (offline) to prove the generated
// JSON/JS are current and that the check is idempotent and non-mutating.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'build', 'sources', 'otb-ja');
const LANG = path.join(SRC, 'lang', 'ja-JP');

const BOOK_IDS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];
const MANIFEST_SHA256 = '929e33448a67ccbffb7b5e77e7de90894a32839f28337d42340433f45a2f3a35';
const LICENCE_SHA256 = 'b6a88d6599299316d5860bf982f53fb4840abe1094708857e816de73694f77dc';
const README_SHA256 = 'b0877203135f431be852ef5b4797790dba59e7c9f22c506d0de0c740033a74bc';

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const gitBlob = (buf) => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`, 'utf8'), buf])).digest('hex');

// ---------------------------------------------------------------------------
// 1. Manifest, licence and readme are SHA256-pinned and every file re-verified.
// ---------------------------------------------------------------------------
const manifestBuf = fs.readFileSync(path.join(SRC, 'source-files.json'));
assert.equal(sha256(manifestBuf), MANIFEST_SHA256, 'source-files.json must match the pinned manifest');
assert.equal(sha256(fs.readFileSync(path.join(SRC, 'LICENCE.md'))), LICENCE_SHA256, 'LICENCE.md must match the pinned hash');
assert.equal(sha256(fs.readFileSync(path.join(SRC, 'UPSTREAM_README.md'))), README_SHA256, 'UPSTREAM_README.md must match the pinned hash');
const manifest = JSON.parse(manifestBuf.toString('utf8'));
assert.equal(manifest.length, 1192, 'manifest file count');
for (const item of manifest) {
  assert(!item.path.includes('..') && !item.path.startsWith('/'), `unsafe manifest path ${item.path}`);
  const buf = fs.readFileSync(path.join(SRC, item.path.split('/').join(path.sep)));
  assert.equal(sha256(buf), item.sha256, `SHA256 ${item.path}`);
  assert.equal(gitBlob(buf), item.gitBlob, `git blob ${item.path}`);
}

// ---------------------------------------------------------------------------
// 2. Walk the raw source independently and compare to the generated dataset.
// ---------------------------------------------------------------------------
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'otb-ja.json'), 'utf8'));
assert.equal(data.id, 'otb-ja');
assert.equal(data.short, 'OTB-JA');
assert.equal(data.language, 'ja');
assert.equal(data.direction, 'ltr');
assert.equal(data.nativeVersification, true);
assert.equal(data.nativeReferenceScope, true);
assert.equal(data.license, 'CC BY-SA 4.0');

const declared = JSON.parse(fs.readFileSync(path.join(LANG, 'books.json'), 'utf8'));
const declaredNames = Object.keys(declared);
assert.equal(declaredNames.length, 66);
const dirs = fs.readdirSync(LANG).filter((n) => /^\d{2}\./.test(n)).sort();
assert.equal(dirs.length, 66);

const numberedByBook = {};
const totals = { books: 0, chapters: 0, numbered: 0, unnumbered: 0, separators: 0, psalmRecords: 0, ntNotes: 0 };
let multisegmentChecked = 0;
const psalmHeadingCount = () => Object.values(data.psalmHeadings || {}).reduce((n, chs) => n + Object.values(chs).reduce((m, a) => m + a.length, 0), 0);
const ntNoteRefs = () => Object.entries(data.sourceNotes || {}).flatMap(([id, chs]) => Object.keys(chs).map((c) => `${id}.${c}`)).sort();

for (let index = 0; index < dirs.length; index += 1) {
  const dirName = dirs[index];
  const id = BOOK_IDS[index];
  const label = dirName.replace(/^\d{2}\./, '');
  assert.equal(label, declaredNames[index], `directory label maps to books.json order`);
  assert(Array.isArray(data.books[id]), `${id} exists in generated data`);
  assert.equal(data.books[id].length, declared[label], `${id} chapter count`);

  const jsonDir = path.join(LANG, dirName, 'json');
  const files = fs.readdirSync(jsonDir).filter((n) => n.endsWith('.json'))
    .sort((a, b) => Number(a.match(/-(\d+)\.json$/)[1]) - Number(b.match(/-(\d+)\.json$/)[1]));
  assert.equal(files.length, declared[label], `${id} source chapter files`);

  for (let ci = 0; ci < files.length; ci += 1) {
    const file = files[ci];
    const chapterNum = Number(file.match(/-(\d+)\.json$/)[1]);
    assert.equal(chapterNum, ci + 1, `${id} chapter filename sequence`);
    const doc = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf8'));
    assert.equal(doc.chapter, chapterNum, `${id} ${file} chapter field`);
    assert.equal(typeof doc.book, 'string');
    assert(Array.isArray(doc.verses));

    const rows = data.books[id][ci];
    const segs = data.verseSegments[id][ci];
    const recs = (data.sourceRecords[id] && data.sourceRecords[id][chapterNum]) || [];
    const recByIndex = new Map(recs.map((r) => [r.sourceIndex, r]));

    let prevVerse = 0;
    let maxVerse = 0;
    let unnumbered = 0;
    doc.verses.forEach((rec, sourceIndex) => {
      assert(Array.isArray(rec.text) && rec.text.length > 0, `${id} ${chapterNum}:${sourceIndex} text array`);
      assert(rec.text.every((s) => typeof s === 'string' && s.length > 0), `${id} ${chapterNum}:${sourceIndex} non-blank segments`);
      if (rec.verse === undefined) {
        unnumbered += 1;
        totals.unnumbered += 1;
        const expectedKind = (rec.text.length === 1 && rec.text[0] === '---') ? 'separator' : (id === 'PSA' ? 'psalm' : 'note');
        if (expectedKind === 'separator') totals.separators += 1;
        else if (expectedKind === 'psalm') totals.psalmRecords += 1;
        else totals.ntNotes += 1;
        const stored = recByIndex.get(sourceIndex);
        assert(stored, `${id} ${chapterNum}: missing sourceRecord for unnumbered index ${sourceIndex}`);
        assert.equal(stored.kind, expectedKind, `${id} ${chapterNum}:${sourceIndex} kind`);
        assert.equal(stored.text, rec.text.join('\n'), `${id} ${chapterNum}:${sourceIndex} unnumbered text`);
        assert.deepEqual(stored.segments, rec.text, `${id} ${chapterNum}:${sourceIndex} unnumbered segments`);
        assert.equal(stored.beforeVerse, prevVerse, `${id} ${chapterNum}:${sourceIndex} beforeVerse`);
        return;
      }
      assert(Number.isInteger(rec.verse) && rec.verse > 0, `${id} ${chapterNum}: bad verse`);
      assert.equal(rec.verse, prevVerse + 1, `${id} ${chapterNum}: contiguous numbering`);
      prevVerse = rec.verse;
      maxVerse = rec.verse;
      totals.numbered += 1;
      assert.equal(rows[rec.verse - 1], rec.text.join('\n'), `${id} ${chapterNum}:${rec.verse} joined text`);
      assert.deepEqual(segs[rec.verse - 1], rec.text, `${id} ${chapterNum}:${rec.verse} preserved segments`);
      if (rec.text.length > 1) multisegmentChecked += 1;
    });
    assert.equal(rows.length, maxVerse, `${id} ${chapterNum} row extent`);
    assert.equal(Object.keys(data.sourceRecords[id]?.[chapterNum] || {}).length, unnumbered, `${id} ${chapterNum} unnumbered record count`);
    numberedByBook[id] = (numberedByBook[id] || 0) + maxVerse;
    totals.chapters += 1;
  }
  totals.books += 1;
}

assert.equal(totals.books, 66);
assert.equal(totals.chapters, 1189);
assert.equal(totals.numbered, 31103);
assert.equal(totals.unnumbered, 3777);
assert.equal(totals.separators, 3636);
assert.equal(totals.psalmRecords, 138);
assert.equal(totals.ntNotes, 3);
assert.equal(multisegmentChecked, 8336, 'every multi-segment verse checked');
assert.equal(psalmHeadingCount(), 138, 'Psalm records populate psalmHeadings');
assert.deepEqual(ntNoteRefs(), ['JHN.7', 'JHN.8', 'MRK.16'], 'the three NT notes keep their locations');

// ---------------------------------------------------------------------------
// 3. Exact placeholders and native bounds.
// ---------------------------------------------------------------------------
assert.equal(data.books.MAT[22][13], '[14]');
assert.equal(data.books.JHN[4][3], '[4]');
for (const [bookId, chapter, verse, text] of [['MAT', 23, 14, '[14]'], ['JHN', 5, 4, '[4]']]) {
  const meta = data.verseMetadata?.[bookId]?.[String(chapter)]?.[String(verse)];
  assert(meta, `${bookId} ${chapter}:${verse} metadata`);
  assert.equal(meta.status, 'source-placeholder');
  assert.equal(meta.text, text);
  assert(/no text was supplied or inferred/i.test(meta.note), 'authored notice states no text was supplied');
  assert(!/source footnote/i.test(meta.note), 'authored notice is not labelled a source footnote');
}
assert.equal(data.books['3JN'][0].length, 15, '3 John 1 has 15 native verses');
assert.equal(data.books.DAN.length, 12, 'Daniel has 12 native chapters');
assert.equal(data.books.DAN[12], undefined, 'no Daniel 13');
assert.deepEqual(data.sourcePlaceholders.map((p) => p.text).sort(), ['[14]', '[4]']);
assert(data.books.PSA[0][0].startsWith('> '), 'Psalm segment prefix preserved exactly');
assert.equal(data.books.GEN[0][0], '初めに、神は天と地を創造された。');

// ---------------------------------------------------------------------------
// 4. Offline --check is current, non-mutating and idempotent.
// ---------------------------------------------------------------------------
const before = ['data/otb-ja.json', 'data/otb-ja.js'].map((rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex'));
const out1 = execFileSync(process.execPath, ['build/import-otb-ja.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
assert.match(out1, /--check OK/);
const out2 = execFileSync(process.execPath, ['build/import-otb-ja.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
assert.match(out2, /--check OK/);
const after = ['data/otb-ja.json', 'data/otb-ja.js'].map((rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex'));
assert.deepEqual(before, after, '--check must not mutate the generated data');

console.log(`PASS independent OTB-JA audit: ${totals.books} books, ${totals.chapters} chapters, ${totals.numbered} numbered records (all segment arrays verified; ${multisegmentChecked} multi-segment), ${totals.unnumbered} unnumbered (${totals.separators} separators, ${totals.psalmRecords} Psalm records, ${totals.ntNotes} NT notes); placeholders and 12/15 native bounds exact; --check idempotent.`);
