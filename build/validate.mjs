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

const dir = path.dirname(fileURLToPath(import.meta.url));
const canonPath = path.join(dir, '..', 'data', 'canon.js');
const canonSrc = fs.readFileSync(canonPath, 'utf8');
const canon = JSON.parse(canonSrc.slice('window.MARANATHA_CANON='.length, -2));
const canonById = Object.fromEntries(canon.books.map(b => [b.id, b]));

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

  if (chapters.length !== book.chapters.length) {
    console.error(`${severity}  ${book.id}: ${chapters.length} chapters, canon expects ${book.chapters.length}` + (book.provisional ? ' (canon entry is provisional)' : ''));
    bump();
    continue;
  }
  chapters.forEach((verses, i) => {
    const expected = book.chapters[i];
    if (!Array.isArray(verses) || verses.length !== expected) {
      const got = Array.isArray(verses) ? verses.length : typeof verses;
      console.error(`${severity}  ${book.id} ${i + 1}: ${got} verses, canon expects ${expected}` + (book.provisional ? ' (canon entry is provisional)' : ''));
      bump();
    }
  });
}

console.log('');
console.log(`${translation.id}: ${presentBooks.length}/${canon.books.length} books present`);
if (missingBooks.length) {
  console.log(`Missing books (expected to be OK — UI must handle this): ${missingBooks.join(', ')}`);
}
console.log(`${errors} error(s), ${warnings} warning(s)`);

process.exit(errors > 0 ? 1 : 0);
