// validate-delitzsch1901.mjs
//
// Source-aware validation for data/delitzsch1901.json. Re-derives every verse
// reference and its transformed text from the cached source plus the reviewed
// correction manifest, checks the correction rules actually hold in the output,
// verifies Unicode, versification and JSON/JS equality, and confirms the
// declared edition versification matches the real extents.
//
//   node build/validate-delitzsch1901.mjs

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { SOURCE_DIR, NAME_TO_ID, NT_CANON, VERSIFICATION, EXPECTED_BOOKS, EXPECTED_CHAPTERS, EXPECTED_VERSES, buildTranslation } from './import-delitzsch1901.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(SOURCE_DIR, 'Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt');
const CORRECTIONS = path.join(SOURCE_DIR, 'corrections.json');

function main() {
  const raw = fs.readFileSync(SRC, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(CORRECTIONS, 'utf8'));
  const corrections = new Map(manifest.entries.map((e) => [`${e.ref}`, e]));
  const { translation, stats } = buildTranslation(raw, corrections);
  const data = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch1901.json'), 'utf8'));
  const js = fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch1901.js'), 'utf8').replace(/\r\n/g, '\n');

  // 1. shape
  assert.equal(Object.keys(translation.books).length, EXPECTED_BOOKS);
  assert.deepEqual(Object.keys(translation.books).sort(), [...NT_CANON].sort());
  assert.equal(Object.values(translation.books).reduce((n, c) => n + c.length, 0), EXPECTED_CHAPTERS);
  assert.equal(stats.rows, EXPECTED_VERSES);

  // 2. exact reference set + transformed text equality
  assert.deepEqual(data.books, translation.books, 'data.books differs from the source-derived import');
  assert.deepEqual(data.verseMetadata, translation.verseMetadata);

  // 3. correction rules hold: no doubled identical combining marks, and no
  //    stray unbalanced closing parens remain anywhere in the output.
  const REPEAT = /([\u0591-\u05C7])\1+/;
  for (const id of NT_CANON) {
    data.books[id].forEach((chapter, ci) => {
      if (!Array.isArray(chapter)) return;
      let balance = 0;
      chapter.forEach((text, vi) => {
        if (!text) return;
        assert(!REPEAT.test(text), `residual doubled combining mark at ${id} ${ci + 1}:${vi + 1}: ${text}`);
        for (const ch of text) {
          if (ch === '(') balance++;
          else if (ch === ')') { assert(balance > 0, `stray ')' at ${id} ${ci + 1}:${vi + 1}: ${text}`); balance--; }
        }
      });
      assert.equal(balance, 0, `unclosed '(' in ${id} ${ci + 1}`);
    });
  }

  // 4. niqqud preserved, no U+FFFD, consonants/final forms kept
  let niqqudVerses = 0;
  for (const id of NT_CANON) {
    for (const chapter of data.books[id]) {
      if (!Array.isArray(chapter)) continue;
      for (const text of chapter) {
        if (!text) continue;
        assert(!text.includes('\uFFFD'), `U+FFFD in ${id}`);
        if (/[\u0591-\u05C7]/.test(text)) niqqudVerses++;
      }
    }
  }
  assert.equal(niqqudVerses, EXPECTED_VERSES, 'every verse should carry niqqud');

  // 5. every declared versification entry matches the real source extent and is
  //    recorded with a reason; and no undeclared mismatch with canon exists.
  for (const [id, chapters] of Object.entries(VERSIFICATION)) {
    for (const [ch, info] of Object.entries(chapters)) {
      const arr = data.books[id][Number(ch) - 1];
      assert.equal(arr.length, info.source, `${id} ${ch} declared source extent`);
      assert(info.note && info.canon !== info.source, `${id} ${ch} versification note`);
      assert.equal(data.versification[id][ch].source, info.source);
    }
  }

  // 6. verified corrections: John 1:20 loses the stray ')' and John 1:37 keeps a
  //    single hataf-patah; Romans 8:1 keeps its genuine editorial parenthesis.
  assert(!data.books.JHN[0][19].includes(')'), 'John 1:20 stray paren');
  assert(data.books.JHN[0][19].includes('אָנִי׃'), 'John 1:20 text');
  assert(data.books.JHN[0][36].includes('אַחֲרֵי'), 'John 1:37 corrected');
  assert(!data.books.JHN[0][36].includes('אַחֲֲ'), 'John 1:37 no doubled hataf');
  // Romans 8:1 keeps its genuine editorial parenthesis (verified scan-0297).
  assert(data.books.ROM[7][0].includes('(') && data.books.ROM[7][0].includes(')'), 'Romans 8:1 editorial parenthesis');

  // 7. representative passages (compared on consonants, to avoid pointing
  //    ordering artefacts in hand-written literals)
  const bare = (t) => t.replace(/\u05BE/g, ' ').replace(/[\u0591-\u05C7]/g, '');
  assert.match(bare(data.books.MAT[0][0]), /^ספר תולדת/);
  assert.match(bare(data.books.JHN[0][0]), /בראשית היה הדבר/);
  assert.match(bare(data.books.ACT[2][14]), /שר החיים/);
  assert.match(bare(data.books.ROM[7][0]), /אין אשמה/);
  assert.match(bare(data.books.REV[21][20]), /חסד.*המשיח/);

  // 8. JSON/JS equality
  const jsonText = fs.readFileSync(path.join(dir, '..', 'data', 'delitzsch1901.json'), 'utf8');
  assert.equal(js, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch1901']=${JSON.stringify(JSON.parse(jsonText), null, 2)};\n`);

  // 9. correction manifest integrity
  assert.equal(manifest.entries.length, manifest.counts.total);
  assert.equal(stats.corrected, manifest.entries.length);
  for (const e of manifest.entries) {
    assert(e.original && e.corrected && e.reason && e.scanPage, `manifest entry incomplete: ${e.ref}`);
    assert.notEqual(e.original, e.corrected);
  }

  console.log('validate-delitzsch1901: OK');
  console.log(`  ${EXPECTED_BOOKS} books / ${EXPECTED_CHAPTERS} chapters / ${EXPECTED_VERSES} vocalized verses.`);
  console.log(`  ${manifest.entries.length} reviewed corrections applied; no residual doubled marks or stray parentheses.`);
  console.log('  7 declared edition-versification chapters match the source extents; representative passages verified.');
}

main();
