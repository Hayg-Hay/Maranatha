// import-kjv.mjs
//
// Normalizes build/sources/kjv/t_kjv.source.json into data/kjv.json (+ a
// window-global data/kjv.js twin — see build/import-web.mjs for the fuller
// explanation of why both exist; same pattern here).
//
// SOURCE: scrollmapper/bible_databases (2024 branch), json/t_kjv.json — the
// King James Version, standard 66-book edition, public domain in the US.
// Same structured-database source family as import-web.mjs, and checked for
// the same artifacts before writing this: unlike t_web.json, t_kjv.json has
// NO over-escaped quotes and NO embedded {footnote} markers (verified by
// scanning the full raw text, not assumed just because it's the same repo).
// One real structural difference from WEB, also confirmed by direct count:
// KJV has 31,103 verses total vs. WEB's 31,102 — expected to show up as a
// handful of validate.mjs mismatches for individual chapters, not a bug in
// this importer.
//
// SCOPE: standard 66 books only, same reasoning as WEB — this source has no
// deuterocanon, and grafting in different-translation text for those 7 books
// would misrepresent it as KJV when it isn't.
//
// Usage:
//   node build/import-kjv.mjs
//   node build/validate.mjs data/kjv.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Same book_num -> canon ID order as import-web.mjs (both sources use the
// same standard USFM-style 1-66 numbering).
const BOOK_ORDER = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

function main() {
  const sourcePath = path.join(dir, 'sources', 'kjv', 't_kjv.source.json');
  const rows = JSON.parse(fs.readFileSync(sourcePath, 'utf8')).resultset.row;

  const books = {};
  for (const row of rows) {
    const [, bookNum, chapter, verse, text] = row.field;
    const id = BOOK_ORDER[bookNum - 1];
    if (!id) throw new Error(`Unmapped book_num ${bookNum}`);
    // One confirmed bogus row exists in this source: 3 John 1:15 has text
    // literally equal to "[]" (a placeholder/export artifact, not real verse
    // text — standard KJV 3 John only has 14 verses). Verified by checking
    // it's the only such row in the entire 31,103-verse source before adding
    // this filter, so this is a targeted fix for a confirmed issue, not a
    // guess. Skipping it (not writing an empty slot) so the chapter's real
    // length matches canon.js.
    if (text.trim() === '[]') continue;
    books[id] = books[id] || [];
    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = text.trim();
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 66) {
    throw new Error(`Expected 66 mapped books, got ${bookCount}`);
  }

  writeTranslation({
    id: 'kjv',
    label: 'King James Version',
    source: 'scrollmapper/bible_databases (2024 branch), json/t_kjv.json — public domain in the US. Standard 66-book edition; does not include the Catholic deuterocanonical books.',
    books,
  });

  const jsonPath = path.join(dir, '..', 'data', 'kjv.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'kjv.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['kjv']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/66 standard books (no deuterocanon in this source).`);
}

main();
