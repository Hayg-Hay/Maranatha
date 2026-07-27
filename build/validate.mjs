// validate.mjs
//
// Validates a translation JSON file against data/canon.js. Run before
// committing any new data/<translation-id>.json.
//
// Usage:
//   node build/validate.mjs data/web-c.json
//
// A translation file is expected to look like:
//   {
//     "id": "web-c",
//     "label": "World English Bible, Catholic Edition",
//     "source": "https://...",
//     "books": {
//       "GEN": [ [verse, verse, ...], [chapter2 verses...], ... ],
//       "TOB": [ ... ]
//       // missing books are fine — see project README
//     }
//   }
//
// What this checks:
//   - Every book ID in the file exists in canon.js (typo / unknown-ID guard).
//   - Missing books are reported as informational, not errors — incomplete
//     coverage is expected and must not break the UI.
//   - For books that ARE present, the chapter count and each chapter's verse
//     count are compared against canon.js. Mismatches are errors UNLESS the
//     canon.js entry for that book is `provisional: true` (Baruch, Esther,
//     Daniel today), in which case mismatches are reported as warnings —
//     the translation's real structure is exactly the evidence needed to fix
//     canon.js's provisional entries.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ported from build/update-canon-counts.mjs. Some translation source data
// pads a chapter's verse array (or a book's chapter array) with trailing
// empty strings / empty chapters to a common length during import. That
// padding is not real content, so raw .length comparisons against canon.js
// produce false mismatches (e.g. WEB SIR 23 has a raw array length of 28
// but only 27 real verses). canon.js's own counts are already computed
// with this same trimming (see update-canon-counts.mjs), so validate.mjs
// must trim the same way to compare like with like.
function trimTrailing(arr) {
  let end = arr.length;
  while (end > 0 && !arr[end - 1]) end--;
  return end;
}

// A chapter is "real" if it has at least one real (non-padding) verse.
// Trailing all-empty chapters at the end of a book's chapter list are
// padding, the same way trailing empty strings within a chapter are.
function realChapterCount(chapters) {
  let end = chapters.length;
  while (end > 0 && (!Array.isArray(chapters[end - 1]) || trimTrailing(chapters[end - 1]) === 0)) end--;
  return end;
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const canonPath = path.join(dir, '..', 'data', 'canon.js');
const canonSrc = fs.readFileSync(canonPath, 'utf8');
const canonJson = canonSrc.slice('window.MARANATHA_CANON='.length).trim();
const canon = JSON.parse(canonJson.endsWith(';') ? canonJson.slice(0, -1) : canonJson);
const canonById = Object.fromEntries(canon.books.map(b => [b.id, b]));

// Known cross-translation textual variants (see data/known-variants.js for
// what qualifies and why). Loaded the same way as canon.js. Missing file is
// tolerated — treated as "no known variants recorded yet" — rather than a
// hard failure, since validate.mjs's core structural check doesn't depend
// on it.
const variantsPath = path.join(dir, '..', 'data', 'known-variants.js');
let knownVariants = [];
if (fs.existsSync(variantsPath)) {
  const variantsSrc = fs.readFileSync(variantsPath, 'utf8');
  const marker = 'window.MARANATHA_KNOWN_VARIANTS =';
  const markerIndex = variantsSrc.indexOf(marker);
  if (markerIndex === -1) {
    console.error(`Could not find "${marker}" in ${variantsPath}`);
    process.exit(1);
  }
  const variantsJson = variantsSrc.slice(markerIndex + marker.length).trim();
  knownVariants = JSON.parse(variantsJson.endsWith(';') ? variantsJson.slice(0, -1) : variantsJson);
}
const variantsByKey = new Map(knownVariants.map(v => [`${v.book}:${v.chapter}`, v]));

const target = process.argv[2];
if (!target) {
  console.error('Usage: node build/validate.mjs <path-to-translation.json>');
  process.exit(1);
}

const translation = JSON.parse(fs.readFileSync(target, 'utf8'));
if (!translation.id || !translation.books || typeof translation.books !== 'object') {
  console.error('Translation file must have "id" and "books" fields.');
  process.exit(1);
}

let errors = 0;
let warnings = 0;
let info = 0;
const missingBooks = [];
const presentBooks = [];

for (const bookId of Object.keys(translation.books)) {
  if (!canonById[bookId]) {
    console.error(`ERROR  ${bookId}: not a recognized canon book ID`);
    errors++;
  }
}

for (const book of canon.books) {
  const chapters = translation.books[book.id];
  if (!chapters) {
    missingBooks.push(book.id);
    continue;
  }
  presentBooks.push(book.id);

  const severity = book.provisional ? 'WARN ' : 'ERROR';
  const bump = () => (book.provisional ? warnings++ : errors++);

  const realChapters = realChapterCount(chapters);
  if (realChapters !== book.chapters.length) {
    console.error(`${severity}  ${book.id}: ${realChapters} chapters, canon expects ${book.chapters.length}` + (book.provisional ? ' (canon entry is provisional)' : ''));
    bump();
    continue;
  }
  chapters.slice(0, realChapters).forEach((verses, i) => {
    const chapterNum = i + 1;
    const expected = book.chapters[i];
    const got = Array.isArray(verses) ? trimTrailing(verses) : typeof verses;
    if (got === expected) return;

    const variant = variantsByKey.get(`${book.id}:${chapterNum}`);
    if (variant && variant.acceptedCounts.includes(got)) {
      console.log(`INFO   ${book.id} ${chapterNum}: ${got} verses (known variant — ${variant.reason})`);
      info++;
      return;
    }

    const variantNote = variant
      ? ` (does not match any known variant reading: ${variant.acceptedCounts.join(' or ')} — see data/known-variants.js)`
      : '';
    console.error(`${severity}  ${book.id} ${chapterNum}: ${got} verses, canon expects ${expected}${variantNote}` + (book.provisional ? ' (canon entry is provisional)' : ''));
    bump();
  });
}

console.log('');
console.log(`${translation.id}: ${presentBooks.length}/${canon.books.length} books present`);
if (missingBooks.length) {
  console.log(`Missing books (expected to be OK — UI must handle this): ${missingBooks.join(', ')}`);
}
console.log(`${errors} error(s), ${warnings} warning(s), ${info} known-variant info note(s)`);

process.exit(errors > 0 ? 1 : 0);