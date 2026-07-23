// import-douay-rheims.mjs
//
// ⚠ DO NOT RUN THIS AND COMMIT THE OUTPUT. The configured source
// (xxruyle/Bible-DouayRheims) was validated and found to have real
// chapter/verse misalignment in 42 of 73 books (228 validate.mjs errors —
// not just the single missing-verse gap its own README admits to). Confirmed
// by inspecting the raw cached source directly, e.g. Numbers "chapter 30" in
// the source contains verse keys 19-72, not 1-16 — a genuine parsing bug in
// how that repo's upstream txt-to-JSON conversion split chapter boundaries,
// not a bug in the mapping/cleanup logic below. See PROJECT_HISTORY.md,
// Phase 2, for the full writeup. This file is kept because the book-name
// mapping (BOOK_MAP) and verse-array-building approach are real, reusable
// work — swap SOURCE_PATH for a verified-clean Douay-Rheims source before
// running this again.
//
// Normalizes build/sources/douay-rheims/EntireBible-DR.source.json into
// data/douay-rheims.json (+ a window-global data/douay-rheims.js twin — see
// note at the bottom on why both exist).
//
// SOURCE: xxruyle/Bible-DouayRheims (github.com/xxruyle/Bible-DouayRheims),
// MIT licensed. The underlying Douay-Rheims translation itself is public
// domain; the MIT license covers this particular JSON transcription. Cached
// here (build/sources/douay-rheims/) rather than fetched at runtime, same as
// every other source in this project. The source repo's own README notes it
// was produced by parsing a plain-text edition and "there may be some
// mistakes" — that undersells it; see the warning above.
//
// WHAT THIS SCRIPT DOES:
//   1. Maps the source's old-style Vulgate book names (Josue, Machabees,
//      Paralipomenon, 4 Kings, etc.) onto Maranatha's stable canon IDs.
//   2. Strips the leading "*" footnote/cross-reference marker present on
//      ~2,290 verses in the source (a print-edition artifact, not part of
//      the verse text).
//   3. Builds each chapter as an array sized to the highest verse number
//      actually present in the source for that chapter — NOT forced to
//      match data/canon.js. Douay-Rheims' real structure is allowed to
//      differ from canon.js (that's expected and fine; validate.mjs reports
//      differences as warnings for canon.js's provisional books, i.e.
//      Baruch/Esther/Daniel, and as errors for any other book — which would
//      indicate a bug in the mapping below, not an expected translation
//      difference).
//
// Usage:
//   node build/import-douay-rheims.mjs
//   node build/validate.mjs data/douay-rheims.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Source book name -> Maranatha canon ID. Covers all 73 books; the source's
// old Vulgate-derived English names are the reason this mapping is needed at
// all (e.g. DR's "1 Kings" is our "1SA" / 1 Samuel, not our "1KI").
const BOOK_MAP = {
  Genesis: 'GEN', Exodus: 'EXO', Leviticus: 'LEV', Numbers: 'NUM', Deuteronomy: 'DEU',
  Josue: 'JOS', Judges: 'JDG', Ruth: 'RUT',
  '1 Kings': '1SA', '2 Kings': '2SA', '3 Kings': '1KI', '4 Kings': '2KI',
  '1 Paralipomenon': '1CH', '2 Paralipomenon': '2CH',
  '1 Esdras': 'EZR', '2 Esdras': 'NEH',
  Tobias: 'TOB', Judith: 'JDT', Esther: 'EST',
  '1 Machabees': '1MA', '2 Machabees': '2MA',
  Job: 'JOB', Psalms: 'PSA', Proverbs: 'PRO', Ecclesiastes: 'ECC', Canticles: 'SNG',
  Wisdom: 'WIS', Ecclesiasticus: 'SIR',
  Isaias: 'ISA', Jeremias: 'JER', Lamentations: 'LAM', Baruch: 'BAR', Ezechiel: 'EZK', Daniel: 'DAN',
  Osee: 'HOS', Joel: 'JOL', Amos: 'AMO', Abdias: 'OBA', Jonas: 'JON', Micheas: 'MIC',
  Nahum: 'NAM', Habacuc: 'HAB', Sophonias: 'ZEP', Aggeus: 'HAG', Zacharias: 'ZEC', Malachias: 'MAL',
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT',
  Romans: 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL',
  Ephesians: 'EPH', Philippians: 'PHP', Colossians: 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
  Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
  Jude: 'JUD', Apocalypse: 'REV',
};

function cleanVerse(text) {
  return text.replace(/^\*+\s*/, '').trim();
}

function main() {
  const sourcePath = path.join(dir, 'sources', 'douay-rheims', 'EntireBible-DR.source.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  const books = {};
  const unmapped = [];
  let missingVerseCount = 0;

  for (const [sourceName, chapters] of Object.entries(source)) {
    const id = BOOK_MAP[sourceName];
    if (!id) {
      unmapped.push(sourceName);
      continue;
    }
    const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);
    const chapterArrays = [];
    for (const chNum of chapterNums) {
      const verses = chapters[String(chNum)];
      const maxVerse = Math.max(...Object.keys(verses).map(Number));
      const arr = new Array(maxVerse).fill('');
      for (const [vNum, text] of Object.entries(verses)) {
        arr[Number(vNum) - 1] = cleanVerse(text);
      }
      const gaps = arr.filter(v => v === '').length;
      missingVerseCount += gaps;
      chapterArrays.push(arr);
    }
    books[id] = chapterArrays;
  }

  if (unmapped.length) {
    throw new Error(`Unmapped source book names (fix BOOK_MAP): ${unmapped.join(', ')}`);
  }
  const bookCount = Object.keys(books).length;
  if (bookCount !== 73) {
    throw new Error(`Expected 73 mapped books, got ${bookCount}`);
  }

  writeTranslation({
    id: 'douay-rheims',
    label: 'Douay-Rheims Bible',
    source: 'https://github.com/xxruyle/Bible-DouayRheims (MIT-licensed transcription of the public-domain Douay-Rheims text)',
    books,
  });

  // Also emit a window-global .js twin, same reasoning as data/locales/en.js:
  // index.html must be able to load this with a plain <script> tag (created
  // dynamically by app.js when the translation checkbox is selected) so the
  // app keeps working from a bare file:// double-click. Never fetch() local
  // translation data — see PROJECT_HISTORY.md, Phase 2 attempt 1, for why
  // that constraint is documented instead of assumed.
  const jsonPath = path.join(dir, '..', 'data', 'douay-rheims.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'douay-rheims.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['douay-rheims']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);

  console.log(`Mapped ${bookCount}/73 books. Empty-verse gaps from source (e.g. James 1:1): ${missingVerseCount}`);
}

main();
