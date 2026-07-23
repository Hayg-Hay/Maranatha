// import-web.mjs
//
// Normalizes build/sources/web/t_web.source.json into data/web.json (+ a
// window-global data/web.js twin, same reasoning as douay-rheims.js and
// locales/en.js — index.html must load it via <script>, never fetch(), so
// the app keeps working from a bare file:// double-click).
//
// SOURCE: scrollmapper/bible_databases (2024 branch), json/t_web.json — the
// World English Bible, standard 66-book edition. This is the SAME source
// data/canon.js's 66 standard-book chapter/verse counts were computed from
// in Phase 1 (see build/build-canon.mjs's provenance notes), pulled from a
// proper structured database rather than a hand-rolled text parser. That's
// exactly why this import should validate clean where the Douay-Rheims
// attempt did not: the source itself is verse-indexed data, not something
// reconstructed line-by-line from a plain-text file.
//
// SCOPE: this is the WEB (World English Bible), not "WEB Catholic Edition" —
// deliberately relabeled as such. It covers only the 66 standard
// Protestant-canon books; it does NOT include the 7 Catholic deuterocanonical
// books (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees), because this
// source doesn't have them and grafting in a different translation's text
// for those books (e.g. the KJV-Apocrypha-style text used to help build
// canon.js's deuterocanon chapter counts) would misrepresent it as WEB when
// it isn't. Missing books are expected and handled by validate.mjs and the
// UI — see README.md. If/when the real WEB Catholic Edition text (with the
// deuterocanon) is found, it should replace this file entirely rather than
// be merged with it.
//
// Usage:
//   node build/import-web.mjs
//   node build/validate.mjs data/web.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// book_num (1-66, standard USFM-style ordering) -> Maranatha canon ID.
// Matches the same 66-book subset of the Catholic order used in
// build-canon.mjs, since Genesis..Malachi + Matthew..Revelation is identical
// in both canons — only the 7 deuterocanonical books are Catholic-only.
const BOOK_ORDER = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

function stripNotes(text) {
  // Source has two artifacts to clean up, confirmed by inspecting the raw
  // JSON directly (not assumed):
  //  1. Over-escaped quotes: the source contains literal backslash-quote
  //     sequences (\") as verse *content*, not JSON syntax — e.g. raw text
  //     is `God said, \"Let there be light,\"...` where the backslash is a
  //     real character in the string, left over from an upstream SQL dump
  //     that never got cleaned up before being written to JSON. Confirmed
  //     via direct inspection: exactly one such pattern (\") appears 7,987
  //     times across the whole text and nothing else does, so a plain
  //     replace is safe here.
  //  2. Translator footnotes embedded inline as {curly-brace text}, e.g.
  //     "In the beginning God{After \"God,\" the Hebrew has...} created...".
  //     Stripped for v1 — they're annotations, not verse text.
  return text
    .replace(/\\"/g, '"')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  const sourcePath = path.join(dir, 'sources', 'web', 't_web.source.json');
  const rows = JSON.parse(fs.readFileSync(sourcePath, 'utf8')).resultset.row;

  const books = {};
  for (const row of rows) {
    const [, bookNum, chapter, verse, text] = row.field;
    const id = BOOK_ORDER[bookNum - 1];
    if (!id) throw new Error(`Unmapped book_num ${bookNum}`);
    books[id] = books[id] || [];
    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = stripNotes(text);
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 66) {
    throw new Error(`Expected 66 mapped books, got ${bookCount}`);
  }

  writeTranslation({
    id: 'web',
    label: 'World English Bible',
    source: 'scrollmapper/bible_databases (2024 branch), json/t_web.json — public domain. Standard 66-book edition; does not include the Catholic deuterocanonical books.',
    books,
  });

  const jsonPath = path.join(dir, '..', 'data', 'web.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'web.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['web']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/66 standard books (no deuterocanon in this source).`);
}

main();
