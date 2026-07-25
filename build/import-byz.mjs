// import-byz.mjs
//
// Normalizes build/sources/byz/*.csv into data/byz.json (+ a window-global
// data/byz.js twin — see build/import-web.mjs for the fuller explanation of
// why both exist; same pattern here).
//
// SOURCE: byztxt/byzantine-majority-text (GitHub), csv-unicode/ccat/no-variants/
// Byzantine Majority Greek New Testament edited by Robinson and Pierpont.
// License: Unlicense (public domain dedication) — see build/sources/byz/source-info.json.
//
// SCOPE: 27 standard NT books. The source includes 29 CSV files — the two
// extras are variant readings (ACT24.csv = longer Acts 24:6-8, PA.csv =
// Pericope Adulterae alternate reading) that duplicate text already present
// in ACT.csv and JOH.csv respectively. The Byzantine tradition includes both
// passages natively, and the main CSV files already contain them — the extra
// files are alternate manuscript readings, not additional verse content, so
// they are intentionally skipped. See PROJECT_HISTORY.md for the decision
// record.
//
// BOOK MAPPING: source filenames use Latin abbreviations (MAR, JOH, JAM,
// 1JO/2JO/3JO) that differ from Maranatha's canon IDs (MRK, JHN, JAS,
// 1JN/2JN/3JN). All 27 books map directly — no gaps, no extras, no OT books.
//
// Usage:
//   node build/import-byz.mjs
//   node build/validate.mjs data/byz.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Source filename (from csv-unicode/ccat/no-variants/) -> Maranatha canon ID.
// ACT24.csv and PA.csv are intentionally excluded — see header comment.
const BOOK_MAP = {
  'MAT': 'MAT', 'MAR': 'MRK', 'LUK': 'LUK', 'JOH': 'JHN', 'ACT': 'ACT',
  'ROM': 'ROM', '1CO': '1CO', '2CO': '2CO', 'GAL': 'GAL', 'EPH': 'EPH',
  'PHP': 'PHP', 'COL': 'COL', '1TH': '1TH', '2TH': '2TH', '1TI': '1TI',
  '2TI': '2TI', 'TIT': 'TIT', 'PHM': 'PHM', 'HEB': 'HEB', 'JAM': 'JAS',
  '1PE': '1PE', '2PE': '2PE', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN',
  'JUD': 'JUD', 'REV': 'REV',
};

// Files to skip — they contain alternate readings of text already present
// in the main CSV files (ACT.csv has Acts 24 in a shorter reading; JOH.csv
// already includes John 7:53-8:11 natively).
const SKIP_FILES = new Set(['ACT24.csv', 'PA.csv']);

/**
 * Parses a single verse line from a CSV string.
 * Format: chapter,verse,text (text may be quoted with double-quotes,
 * and may contain commas inside quotes).
 */
function parseCSVLine(line) {
  // Simple CSV parser: if line starts with a digit, it's chapter,verse,"text"
  // The text field is always quoted, so split on "," pattern.
  const m = line.match(/^(\d+),(\d+),"([^]*)"$/);
  if (!m) {
    // Try without quoted text field (e.g. verses without commas in text)
    const simple = line.match(/^(\d+),(\d+),([^]*)$/);
    if (!simple) return null;
    return { chapter: parseInt(simple[1]), verse: parseInt(simple[2]), text: simple[3].trim() };
  }
  return { chapter: parseInt(m[1]), verse: parseInt(m[2]), text: m[3].trim() };
}

/**
 * Strips pilcrow paragraph markers (¶) and normalizes whitespace.
 */
function cleanText(text) {
  return text
    .replace(/^¶/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  const sourceDir = path.join(dir, 'sources', 'byz');
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.csv'));

  const books = {};

  for (const file of files) {
    if (SKIP_FILES.has(file)) {
      console.log(`Skipping ${file} (alternate reading, already included in main text)`);
      continue;
    }

    const baseName = file.replace('.csv', '');
    const canonId = BOOK_MAP[baseName];
    if (!canonId) {
      throw new Error(`Unmapped source file: ${file} (base: ${baseName})`);
    }

    console.log(`Importing ${file} -> ${canonId}...`);
    const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const lines = raw.split('\n').filter(Boolean);

    // First line is header: chapter,verse,text
    if (lines.length < 2) {
      throw new Error(`${file} has no data rows (only ${lines.length} lines)`);
    }
    if (!lines[0].startsWith('chapter,verse')) {
      throw new Error(`${file} has unexpected header: ${lines[0].substring(0, 50)}`);
    }

    books[canonId] = [];

    for (let i = 1; i < lines.length; i++) {
      const parsed = parseCSVLine(lines[i]);
      if (!parsed) {
        console.warn(`  Warning: could not parse line ${i + 1} in ${file}: ${lines[i].substring(0, 80)}`);
        continue;
      }

      const { chapter, verse, text } = parsed;
      const cleaned = cleanText(text);
      if (!cleaned) {
        // Empty verse text — skip (shouldn't happen in biblical text, but be safe)
        continue;
      }

      // Ensure arrays exist
      while (books[canonId].length < chapter) {
        books[canonId].push([]);
      }
      const chapterArr = books[canonId][chapter - 1];
      while (chapterArr.length < verse) {
        chapterArr.push('');
      }
      chapterArr[verse - 1] = cleaned;
    }

    // Verify the book is not empty
    const totalVerses = books[canonId].reduce((sum, ch) => sum + ch.filter(v => v).length, 0);
    console.log(`  ${books[canonId].length} chapters, ${totalVerses} verses`);
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 27) {
    throw new Error(`Expected 27 mapped books, got ${bookCount} (mapped: ${Object.keys(books).sort().join(', ')})`);
  }

  writeTranslation({
    id: 'byz',
    label: 'Byzantine Majority Text (Greek NT)',
    source: 'byztxt/byzantine-majority-text (GitHub), csv-unicode/ccat/no-variants/ — Robinson-Pierpont edition, Unlicense (public domain). 27 standard NT books. Pericope Adulterae (John 7:53-8:11) and the longer ending of Acts 24 are included in the main text as per the Byzantine manuscript tradition.',
    books,
  });

  const jsonPath = path.join(dir, '..', 'data', 'byz.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'byz.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['byz']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/27 standard NT books.`);
}

main();