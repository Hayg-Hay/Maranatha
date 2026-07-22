// build-canon.mjs
//
// Generates data/canon.js — the authoritative 73-book Catholic canon skeleton
// (stable book IDs, traditional Catholic order, chapter count, verse count per
// chapter). Every other translation file validates itself against this.
//
// This is milestone 1 of the Maranatha build. It follows the same pattern as
// YaQuB's build-data.mjs: raw source JSON goes in, a single window-global data
// file comes out.
//
// PROVENANCE (see also build/sources/*.json, the cached raw inputs):
//   - Genesis..Revelation (66 books): chapter/verse counts computed directly
//     from real WEB verse text (scrollmapper/bible_databases, 2024 branch,
//     json/t_web.json). Not estimated — every chapter's verse count is the
//     max verse number actually present in that chapter's real text.
//   - Tobit, Judith, Wisdom, Sirach, Baruch (partial), 1 Maccabees, 2 Maccabees:
//     chapter/verse counts computed the same way from real verse text in
//     scrollmapper/bible_databases_deuterocanonical.
//
// KNOWN GAPS (both books/chapters are marked `provisional: true` in the output):
//   1. Baruch — Catholic Baruch has 6 chapters; chapter 6 is the Letter of
//      Jeremiah. No source of real verse text for the Letter of Jeremiah was
//      reachable in this environment, so Baruch is recorded here with only
//      its first 5 chapters. Chapter 6 must be added once the real WEB
//      Catholic Edition (or another verified Catholic source) text is
//      fetched in the milestone-2 translation pipeline.
//   2. Esther and Daniel — the World English Bible Catholic Edition
//      retranslates both books from the Greek Septuagint, integrating the
//      deuterocanonical additions (Esther's Greek additions; Daniel's Prayer
//      of Azariah/Song of the Three, Susanna, Bel and the Dragon). That
//      changes their chapter/verse structure from the standard Hebrew-based
//      numbering used here. Until the actual WEB-C text for these two books
//      is fetched and measured the same way as everything else, they are
//      recorded with their standard (non-expanded) structure as a
//      placeholder. Do not treat these two entries as final.
//
// Do not hand-edit data/canon.js — fix the gaps above (or re-run against a
// better source) and regenerate.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const computed = JSON.parse(fs.readFileSync(path.join(dir, 'sources', 'canon.computed.json'), 'utf8'));

const output = {
  generated: computed.generated,
  canon: computed.canon,
  note: computed.note,
  books: computed.books.map(b => ({
    id: b.id,
    name: b.name,
    testament: b.testament,
    chapters: b.chapters,
    ...(b.provisional ? { provisional: true } : {}),
  })),
};

const bookCount = output.books.length;
const otCount = output.books.filter(b => b.testament === 'OT').length;
const ntCount = output.books.filter(b => b.testament === 'NT').length;
if (bookCount !== 73 || otCount !== 46 || ntCount !== 27) {
  throw new Error(`canon shape check failed: ${bookCount} books (${otCount} OT / ${ntCount} NT), expected 73 (46/27)`);
}

const outPath = path.join(dir, '..', 'data', 'canon.js');
fs.writeFileSync(outPath, `window.MARANATHA_CANON=${JSON.stringify(output)};\n`);
console.log(`Wrote ${outPath}: ${bookCount} books (${otCount} OT / ${ntCount} NT)`);
console.log(`Provisional (needs milestone-2 verification): ${output.books.filter(b => b.provisional).map(b => b.id).join(', ')}`);
