// import-reviewed-greek-gloss.mjs
//
// Builds the reviewed Greek reading-gloss layer for the interlinear cards.
//
// WHY THIS EXISTS
//   The Byzantine interlinear stores only surface form + Strong's number +
//   morphology per token. The Read-mode card derives its gloss from a neutral
//   Strong's dictionary entry, which is a *lexical* gloss, not a sense in the
//   verse. For G1537 (ek/ex) that entry is broken ("literal or figurative;
//   direct or remote)"), and for common particles such as G1161 (de) the app's
//   global override ("but") is often contextually wrong. This layer lets a
//   human author a short contextual transliteration + gloss per token. These
//   entries are *candidates*: they have NOT been approved by the project
//   maintainer, and the runtime must treat the whole file as optional.
//
// SOURCE OF TRUTH
//   build/sources/reviewed-greek-gloss/john-6-50-51.tsv
//   One row per Byzantine token. The build validates every row against
//   data/byz-interlinear.json before it will emit anything, so a candidate row
//   can never drift from the Greek text it claims to describe.
//
//   58 identity fingerprints (book/chapter/verse/token + surface + Strong's +
//   morphology) are checked. Written records are keyed by 1-based token, and a
//   verse is an array indexed by token-1.
//
//   Generated shape (data/reviewed-greek-gloss.{json,js}):
//     {
//       id, label, source, tokenBase: 1, status, tokenCount, verseCount,
//       verses: { "JHN": { "6": { "50": [ [transliteration, gloss], ... ] } } }
//     }
//   A verse slot is either:
//     - null                     -> no candidate row (caller falls back)
//     - [transliteration, gloss] -> candidate; gloss "" means *intentionally*
//                                   untranslated, which is deliberately
//                                   distinct from a null (missing) slot.
//
// STATUS VALUES (TSV `status` column, which is the last column)
//   candidate-pilot        gloss must be non-empty
//   candidate-pilot-blank  gloss must be empty (intentional no-gloss)
//   anything else          rejected
//
// USAGE
//   node build/import-reviewed-greek-gloss.mjs
//   node build/import-reviewed-greek-gloss.mjs --check   (verify, do not write)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const TSV_PATH = path.join(dir, 'sources', 'reviewed-greek-gloss', 'john-6-50-51.tsv');
const BYZ_PATH = path.join(dir, '..', 'data', 'byz-interlinear.json');
const JSON_PATH = path.join(dir, '..', 'data', 'reviewed-greek-gloss.json');
const JS_PATH = path.join(dir, '..', 'data', 'reviewed-greek-gloss.js');
const GLOBAL_NAME = 'MARANATHA_REVIEWED_GREEK_GLOSS';

// `status` is deliberately last so a row never ends in an empty trailing tab
// (an empty source_note becomes an internal empty field instead). This keeps
// `git diff --check` clean.
const COLUMNS = [
  'book', 'chapter', 'verse', 'token', 'surface', 'strongs',
  'morphology', 'transliteration', 'gloss', 'source_note', 'status',
];

const STATUS_PLAIN = 'candidate-pilot';
const STATUS_BLANK = 'candidate-pilot-blank';

const SOURCE_TEXT =
  'Pilot *candidate* reading glosses for John 6:50-51, awaiting project-' +
  'maintainer approval. Greek text and tokenization are the Robinson-Pierpont ' +
  'Byzantine text (Unlicense) already in data/byz-interlinear.json; this layer ' +
  'only supplies candidate per-token transliterations and short contextual ' +
  'English glosses. The candidates were authored against the Greek in ' +
  'context; no other edition\'s text is copied positionally. Strong\'s ' +
  'definitions and KJV renderings remain reference material in the expanded ' +
  'detail panel. This file is optional: if it is absent the interlinear falls ' +
  'back to its existing Strong\'s-derived glosses.';

// NFC is the documented normalization. The Byzantine surfaces in byz.json are
// already NFC, but normalizing both sides protects against an editor that
// saves a decomposed (NFD) form.
const nfc = (value) => String(value).normalize('NFC');

function parseTsv(text) {
  const lines = text.split(/\r?\n/);
  const dataLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.startsWith('#')) continue;
    dataLines.push({ line, number: i + 1 });
  }
  if (!dataLines.length) throw new Error(`${TSV_PATH}: no header row found`);

  const header = dataLines.shift().line.split('\t');
  if (header.length !== COLUMNS.length || header.some((h, i) => h !== COLUMNS[i])) {
    throw new Error(
      `${TSV_PATH}: header must be exactly: ${COLUMNS.join('\t')}\n` +
      `  got: ${header.join('\t')}`
    );
  }

  return dataLines.map(({ line, number }) => ({
    lineNumber: number,
    fields: line.split('\t'),
  }));
}

function fail(errors) {
  if (!errors.length) return;
  throw new Error(`Reviewed gloss validation failed (${errors.length} problem(s)):\n` +
    errors.map((e) => `  - ${e}`).join('\n'));
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const byz = JSON.parse(fs.readFileSync(BYZ_PATH, 'utf8'));
  const rows = parseTsv(fs.readFileSync(TSV_PATH, 'utf8'));

  const errors = [];
  const seen = new Set();
  const verses = {};
  const counts = {};       // "book chapter verse" -> row count
  let blankRows = 0;

  for (const { lineNumber, fields } of rows) {
    const where = `${path.basename(TSV_PATH)}:${lineNumber}`;
    if (fields.length !== COLUMNS.length) {
      errors.push(`${where}: expected ${COLUMNS.length} columns, got ${fields.length}`);
      continue;
    }
    const row = {};
    COLUMNS.forEach((c, i) => { row[c] = fields[i]; });

    const book = row.book;
    const chapter = Number(row.chapter);
    const verse = Number(row.verse);
    const token = Number(row.token);

    const bookData = byz.books[book];
    if (!bookData) { errors.push(`${where}: unknown/usupported book "${book}" in Byzantine interlinear`); continue; }
    const chapterData = bookData[chapter - 1];
    if (!Number.isInteger(chapter) || !chapterData) { errors.push(`${where}: ${book} ${chapter} does not exist in Byzantine interlinear`); continue; }
    const verseData = chapterData[verse - 1];
    if (!Number.isInteger(verse) || !verseData) { errors.push(`${where}: ${book} ${chapter}:${verse} does not exist in Byzantine interlinear`); continue; }
    if (!Number.isInteger(token) || token < 1 || token > verseData.length) {
      errors.push(`${where}: token ${row.token} out of range for ${book} ${chapter}:${verse} (1..${verseData.length})`);
      continue;
    }

    const [bSurface, bStrongs, bMorph] = verseData[token - 1];
    if (nfc(row.surface) !== nfc(bSurface)) {
      errors.push(`${where}: surface mismatch: TSV "${row.surface}" vs Byzantine "${bSurface}"`);
    }
    if (row.strongs !== bStrongs) {
      errors.push(`${where}: Strong's mismatch: TSV "${row.strongs}" vs Byzantine "${bStrongs}"`);
    }
    if (row.morphology !== bMorph) {
      errors.push(`${where}: morphology mismatch: TSV "${row.morphology}" vs Byzantine "${bMorph}"`);
    }

    const key = `${book} ${chapter} ${verse} ${token}`;
    if (seen.has(key)) errors.push(`${where}: duplicate token record for ${key}`);
    seen.add(key);

    if (!row.transliteration.trim()) {
      errors.push(`${where}: transliteration must not be empty (${key})`);
    }

    if (row.status === STATUS_PLAIN) {
      if (!row.gloss.trim()) errors.push(`${where}: status "${STATUS_PLAIN}" requires a non-empty gloss (${key})`);
    } else if (row.status === STATUS_BLANK) {
      if (row.gloss.trim()) errors.push(`${where}: status "${STATUS_BLANK}" requires an empty gloss (${key})`);
      blankRows++;
    } else {
      errors.push(`${where}: unknown status "${row.status}" (${key}); expected "${STATUS_PLAIN}" or "${STATUS_BLANK}"`);
    }

    if (errors.length) continue;

    const verseKey = `${book} ${chapter} ${verse}`;
    counts[verseKey] = (counts[verseKey] || 0) + 1;

    verses[book] = verses[book] || {};
    verses[book][chapter] = verses[book][chapter] || {};
    const slot = verses[book][chapter][verse] = verses[book][chapter][verse] || new Array(verseData.length).fill(null);
    slot[token - 1] = [row.transliteration, row.gloss];
  }

  fail(errors);

  const tokenCount = seen.size;
  const verseCount = Object.keys(counts).length;
  const data = {
    id: 'reviewed-greek-gloss',
    label: 'Greek reading gloss candidates (pilot)',
    source: SOURCE_TEXT,
    tokenBase: 1,
    status: 'candidate-pilot',
    tokenCount,
    verseCount,
    verses,
  };

  const jsonText = JSON.stringify(data) + '\n';
  const jsText = `window.${GLOBAL_NAME}=${JSON.stringify(data)};\n`;

  if (checkOnly) {
    // Normalize CRLF so the check still passes on a Windows checkout with
    // core.autocrlf=true (git restores the committed files with CRLF).
    const norm = (text) => text.replace(/\r\n/g, '\n');
    const sameJson = fs.existsSync(JSON_PATH) && norm(fs.readFileSync(JSON_PATH, 'utf8')) === norm(jsonText);
    const sameJs = fs.existsSync(JS_PATH) && norm(fs.readFileSync(JS_PATH, 'utf8')) === norm(jsText);
    if (!sameJson || !sameJs) {
      throw new Error('--check: generated files are stale; re-run without --check');
    }
    console.log(`Checked ${tokenCount} candidate tokens across ${verseCount} verses (${blankRows} intentional blank). Files up to date.`);
    return;
  }

  fs.writeFileSync(JSON_PATH, jsonText);
  fs.writeFileSync(JS_PATH, jsText);
  const kb = (n) => (n / 1024).toFixed(1);
  console.log(`Wrote ${JSON_PATH} (${kb(fs.statSync(JSON_PATH).size)} KB)`);
  console.log(`Wrote ${JS_PATH} (${kb(fs.statSync(JS_PATH).size)} KB)`);
  console.log(`  ${tokenCount} candidate tokens across ${verseCount} verses (${blankRows} intentional blank).`);
}

main();
