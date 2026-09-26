// import-luther1912.mjs
//
// Normalizes build/sources/luther1912/deu1912_vpl.txt into data/luther1912.json
// (+ a window-global data/luther1912.js twin — see build/import-web.mjs for the
// fuller explanation of why both exist; same pattern here).
//
// SOURCE: eBible.org, https://eBible.org/Scriptures/deu1912_vpl.zip — the
// Lutherbibel 1912 (translation ID deu1912, abbreviation L1912), public domain.
// Format is the BibleWorks VPL ("verse per line") plain text: one verse per
// line as `BOOK C:V text`, e.g. `GEN 1:1 Am Anfang schuf Gott Himmel und
// Erde.`. eBible's own deu1912_about.htm describes it as "BIBLE TEXT ONLY. All
// formatting, paragraph breaks, notes, introductions, noncanonical section
// titles, etc., have been removed." That verse-indexed shape is the same
// row/field contract as the scrollmapper t_*.json imports (KJV/WEB) and the
// Byzantine CSV — book/chapter/verse/text — which is why VPL was chosen over
// eBible's USFM export (Strong's markup interleaved with the text) and over the
// "plain text canon only chapter files" readaloud export (no verse numbers,
// only one-verse-per-line ordering). Provenance details and the raw archive
// hashes are recorded in build/sources/luther1912/source-info.json.
//
// AUDIT (before writing any cleanup step — scan of the full raw source, not
// assumed clean because the source family is new here):
//   - Over-escaping artifacts: eBible's VPL text contains ZERO literal
//     backslashes and ZERO `\"` sequences anywhere in its 31,102 lines. (The
//     WEB `\"` bug came from an upstream SQL dump; this file is plain text and
//     shows no analogue.)
//   - Stray/bogus rows: scanned all 31,102 lines — ZERO malformed lines,
//     0 empty texts, 0 `[]`-style bracket placeholder rows, 0 duplicate
//     book/chapter/verse references, 66 distinct book codes. The KJV `[]` at
//     3 John 1:15 has no counterpart here, so NO stray-row filter is added.
//   Both results are the expected clean case ("scanned N, found zero
//   anomalies"), not a suppressed finding.
//
// SCOPE: standard 66-book Protestant canon only — this source has no
// deuterocanon, same reasoning as KJV/WEB. The 7 Catholic-only books are
// expected-missing and handled by validate.mjs and the UI.
//
// BOOK CODES: the VPL uses BibleWorks abbreviations, which differ from the
// USFM codes in import-kjv.mjs/import-web.mjs (EZE/EZK, JOE/JOL, JOH/JHN,
// MAR/MRK, NAH/NAM, PHI/PHP, SOL/SNG, JAM/JAS, 1JO/1JN, ...). Mapped
// explicitly below rather than by position.
//
// Usage:
//   node build/import-luther1912.mjs
//   node build/validate.mjs data/luther1912.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// BibleWorks VPL book code -> Maranatha canon ID (see data/canon.js). The
// target IDs are the same 66-book subset used by import-kjv.mjs/import-web.mjs.
const VPL_TO_CANON = {
  GEN: 'GEN', EXO: 'EXO', LEV: 'LEV', NUM: 'NUM', DEU: 'DEU',
  JOS: 'JOS', JDG: 'JDG', RUT: 'RUT', '1SA': '1SA', '2SA': '2SA',
  '1KI': '1KI', '2KI': '2KI', '1CH': '1CH', '2CH': '2CH', EZR: 'EZR',
  NEH: 'NEH', EST: 'EST', JOB: 'JOB', PSA: 'PSA', PRO: 'PRO',
  ECC: 'ECC', SOL: 'SNG', ISA: 'ISA', JER: 'JER', LAM: 'LAM',
  EZE: 'EZK', DAN: 'DAN', HOS: 'HOS', JOE: 'JOL', AMO: 'AMO',
  OBA: 'OBA', JON: 'JON', MIC: 'MIC', NAH: 'NAM', HAB: 'HAB',
  ZEP: 'ZEP', HAG: 'HAG', ZEC: 'ZEC', MAL: 'MAL',
  MAT: 'MAT', MAR: 'MRK', LUK: 'LUK', JOH: 'JHN', ACT: 'ACT',
  ROM: 'ROM', '1CO': '1CO', '2CO': '2CO', GAL: 'GAL', EPH: 'EPH',
  PHI: 'PHP', COL: 'COL', '1TH': '1TH', '2TH': '2TH', '1TI': '1TI',
  '2TI': '2TI', TIT: 'TIT', PHM: 'PHM', HEB: 'HEB', JAM: 'JAS',
  '1PE': '1PE', '2PE': '2PE', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN',
  JUD: 'JUD', REV: 'REV',
};

const LINE = /^([0-9A-Z]{3}) (\d+):(\d+) (.*)$/;

function main() {
  const sourcePath = path.join(dir, 'sources', 'luther1912', 'deu1912_vpl.txt');
  const raw = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();

  const books = {};
  for (const line of lines) {
    const m = LINE.exec(line);
    // Strict parse: a non-matching line means the source format changed, so
    // fail loudly rather than silently dropping verses.
    if (!m) throw new Error(`Unparseable VPL line: ${JSON.stringify(line)}`);
    const [, code, chapter, verse, text] = m;
    const id = VPL_TO_CANON[code];
    if (!id) throw new Error(`Unmapped VPL book code ${code}`);
    books[id] = books[id] || [];
    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = text.trim();
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 66) {
    throw new Error(`Expected 66 mapped books, got ${bookCount}`);
  }

  writeTranslation({
    id: 'luther1912',
    label: 'Luther Bible 1912',
    source: 'eBible.org, deu1912_vpl.zip (BibleWorks VPL) — Lutherbibel 1912, public domain. Standard 66-book edition; does not include the Catholic deuterocanonical books.',
    books,
  });

  const jsonPath = path.join(dir, '..', 'data', 'luther1912.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');

  const jsPath = path.join(dir, '..', 'data', 'luther1912.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['luther1912']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/66 standard books (no deuterocanon in this source).`);
}

main();
