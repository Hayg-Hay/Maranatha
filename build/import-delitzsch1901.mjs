// import-delitzsch1901.mjs
//
// Normalizes the cached vocalized Delitzsch 1901 New Testament transcription
// into data/delitzsch1901.json (+ the window-global data/delitzsch1901.js twin).
//
// SOURCE (build-time only; see build/fetch-delitzsch1901.mjs):
//   Sermon-Online verse-per-line text labelled "Franz Delitzsch 1901",
//   https://info2.sermon-online.com/hebrew/Bible/Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt
//   attributed to Franz Delitzsch (1813–1890); first published 1877, imported
//   from the British & Foreign Bible Society 1901 (twelfth) edition, Berlin.
//
// This is a HISTORICAL HEBREW TRANSLATION OF THE GREEK NEW TESTAMENT, not an
// ancient Hebrew manuscript, not a recovered original, and not the same edition
// as the unpointed eBible "delitzsch" translation (which is kept separately).
//
//   node build/import-delitzsch1901.mjs            # regenerate
//   node build/import-delitzsch1901.mjs --check     # verify, write/download nothing
//
// Determinism: parse + apply the reviewed correction manifest
// (sources/delitzsch1901/corrections.json) + map book names; no network.
//
// VERSIFICATION: source verse numbers are preserved exactly (arrays are indexed
// by source verse number). The 1901 edition's chapter extents differ from
// canon.js in seven chapters; these are recorded in `versification` and the app
// visibly discloses them rather than silently renumbering or padding. See
// build/validate-delitzsch1901.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const SOURCE_DIR = path.join(dir, 'sources', 'delitzsch1901');
const SRC = path.join(SOURCE_DIR, 'Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt');
const CORRECTIONS = path.join(SOURCE_DIR, 'corrections.json');

const LINE = /^(.+?) (\d+):(\d+) (.*)$/;
const NIQQUD = /[\u0591-\u05C7]/;

// English source book name -> canon ID (data/canon.js). Explicit, not positional.
export const NAME_TO_ID = {
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1Corinthians': '1CO', '2Corinthians': '2CO', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', '1Thessalonians': '1TH', '2Thessalonians': '2TH',
  '1Timothy': '1TI', '2Timothy': '2TI', Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1Peter': '1PE', '2Peter': '2PE', '1John': '1JN', '2John': '2JN',
  '3John': '3JN', Jude: 'JUD', Revelation: 'REV',
};
export const NT_CANON = Object.values(NAME_TO_ID);

export const EXPECTED_BOOKS = 27;
export const EXPECTED_CHAPTERS = 260;
export const EXPECTED_VERSES = 7961;

// Seven chapters whose 1901-edition verse extents differ from canon.js. Verified
// against the printed edition (title page + TOC + sampled pages). Keyed by canon
// ID then source chapter: source = number of verses the 1901 edition has.
export const VERSIFICATION = {
  JHN: { 1: { source: 52, canon: 51, note: 'The 1901 edition numbers John 1 through verse 52; canon.js expects 51.' } },
  ROM: {
    7: { source: 26, canon: 25, note: 'The 1901 edition numbers Romans 7 through verse 26; canon.js expects 25.' },
    14: { source: 23, canon: 26, note: 'The 1901 edition ends Romans 14 at verse 23 (the closing doxology sits at the end of chapter 16, as in the Textus Receptus); canon.js expects 26.' },
  },
  '1CO': { 13: { source: 14, canon: 13, note: 'The 1901 edition numbers 1 Corinthians 13 through verse 14; canon.js expects 13.' } },
  '2CO': { 13: { source: 13, canon: 14, note: 'The 1901 edition ends 2 Corinthians 13 at verse 13; canon.js expects 14.' } },
  '2TH': { 3: { source: 19, canon: 18, note: 'The 1901 edition numbers 2 Thessalonians 3 through verse 19; canon.js expects 18.' } },
  '3JN': { 1: { source: 15, canon: 14, note: 'The 1901 edition numbers 3 John 1 through verse 15 (the closing greeting is verse 15); canon.js expects 14.' } },
};

function loadCorrections() {
  const manifest = JSON.parse(fs.readFileSync(CORRECTIONS, 'utf8'));
  const map = new Map();
  for (const e of manifest.entries) {
    if (map.has(e.ref)) throw new Error(`Duplicate correction entry for ${e.ref}`);
    map.set(e.ref, e);
  }
  return map;
}

export function buildTranslation(rawSource, corrections) {
  const raw = rawSource.replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();

  const books = {};
  for (const id of NT_CANON) books[id] = [];
  const seen = new Set();
  const stats = { lines: lines.length, rows: 0, corrected: 0, niqqudRows: 0, fffd: 0, empty: 0 };
  const appliedCorrections = new Set();

  for (const line of lines) {
    const m = LINE.exec(line);
    if (!m) throw new Error(`Unparseable row: ${JSON.stringify(line)}`);
    const [, name, chText, vText, text] = m;
    const id = NAME_TO_ID[name];
    if (!id) throw new Error(`Unknown source book ${JSON.stringify(name)}`);

    const chapter = Number(chText);
    const verse = Number(vText);
    if (!Number.isInteger(chapter) || chapter < 1) throw new Error(`Invalid chapter in ${JSON.stringify(line)}`);
    if (!Number.isInteger(verse) || verse < 1) throw new Error(`Invalid verse in ${JSON.stringify(line)}`);

    const ref = `${name} ${chapter}:${verse}`;
    if (seen.has(ref)) throw new Error(`Duplicate reference ${ref}`);
    seen.add(ref);

    if (!text.trim()) { stats.empty++; throw new Error(`Empty text at ${ref}`); }
    if (text.includes('\uFFFD')) { stats.fffd++; throw new Error(`U+FFFD at ${ref}`); }
    if (!NIQQUD.test(text)) throw new Error(`Expected vocalized (niqqud) text at ${ref}`);

    let body = text.trim();
    const correction = corrections.get(ref);
    if (correction) {
      if (correction.original !== body) {
        throw new Error(`Correction manifest mismatch at ${ref}: expected ${JSON.stringify(correction.original)}`);
      }
      body = correction.corrected;
      appliedCorrections.add(ref);
      stats.corrected++;
    }

    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = body;
    stats.rows++;
    stats.niqqudRows++;
  }

  for (const ref of corrections.keys()) {
    if (!appliedCorrections.has(ref)) throw new Error(`Correction entry never applied: ${ref}`);
  }

  const bookCount = Object.keys(books).length;
  const chapterCount = Object.values(books).reduce((n, c) => n + c.length, 0);
  if (bookCount !== EXPECTED_BOOKS) throw new Error(`Expected ${EXPECTED_BOOKS} books, got ${bookCount}`);
  if (chapterCount !== EXPECTED_CHAPTERS) throw new Error(`Expected ${EXPECTED_CHAPTERS} chapters, got ${chapterCount}`);
  if (stats.rows !== EXPECTED_VERSES) throw new Error(`Expected ${EXPECTED_VERSES} verses, got ${stats.rows}`);

  const translation = {
    id: 'delitzsch1901',
    label: 'Delitzsch Hebrew NT (1901, vocalized)',
    short: 'Delitzsch 1901',
    source: 'Sermon-Online verse-per-line text "The New Testament - Franz Delitzsch" (1901); Franz Delitzsch (1813–1890), first published 1877, imported from the British & Foreign Bible Society 1901 (twelfth) edition, Berlin. Public domain. Vocalized (niqqud). New Testament only.',
    language: 'he',
    languageName: 'Hebrew',
    direction: 'rtl',
    translator: 'Franz Delitzsch',
    firstPublication: 1877,
    importedEdition: 1901,
    editionUncertainty: 'The digital transcription is labelled "1901" and corresponds to the printed British & Foreign Bible Society 1901 (twelfth) edition (Berlin) at the sampled passages; it is an unpointed-source-derived vocalized transcription and is not a page-for-page facsimile. It is a historical Hebrew translation of the Greek New Testament, never an ancient Hebrew manuscript or a recovered original.',
    license: 'Public Domain',
    description: 'Vocalized Hebrew translation of the Greek New Testament by Franz Delitzsch, first published in 1877 and imported from the 1901 twelfth edition (British & Foreign Bible Society, Berlin). Public domain. Chapter verse-numbering differs from canon.js in seven chapters; this is disclosed in the reading view.',
    books,
    verseMetadata: {},
    versification: VERSIFICATION,
  };
  return { translation, stats };
}

function jsonString(t) { return JSON.stringify(t, null, 2) + '\n'; }
function jsString(t) { return `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch1901']=${JSON.stringify(t, null, 2)};\n`; }

function main() {
  const check = process.argv.includes('--check');
  const raw = fs.readFileSync(SRC, 'utf8');
  const corrections = loadCorrections();
  const { translation, stats } = buildTranslation(raw, corrections);
  const json = jsonString(translation);
  const js = jsString(translation);
  const jsonPath = path.join(dir, '..', 'data', 'delitzsch1901.json');
  const jsPath = path.join(dir, '..', 'data', 'delitzsch1901.js');

  if (check) {
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date (run node build/import-delitzsch1901.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date (run node build/import-delitzsch1901.mjs)`);
    console.log(`delitzsch1901 --check OK: ${EXPECTED_BOOKS} books, ${EXPECTED_CHAPTERS} chapters, ${stats.rows} verses, ${stats.corrected} corrected verses.`);
    return;
  }

  writeTranslation(translation);
  fs.writeFileSync(jsPath, js);
  console.log(`Wrote ${jsPath}`);
  console.log(`Imported ${EXPECTED_BOOKS}/27 NT books (${EXPECTED_CHAPTERS} chapters, ${stats.rows} verse rows), applied ${stats.corrected} reviewed corrections.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
