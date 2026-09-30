// import-berean-hebrew-pilot.mjs
//
// Deterministic build step that turns the accepted extraction fixture into the
// small runtime data file the app loads under file://:
//
//   build/sources/berean-hebrew/pilot.fixture.json   (source of truth)
//     -> data/berean-hebrew-pilot.js                 (window.MARANATHA_BEREAN_HEBREW_PILOT)
//     -> build/sources/berean-hebrew/runtime-build.json (hashes + counts)
//
// The fixture is the build source; the generated file must never be hand-edited.
//
// USAGE
//   node build/import-berean-hebrew-pilot.mjs          # write the runtime file
//   node build/import-berean-hebrew-pilot.mjs --check  # verify it is up to date

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..');
const FIXTURE = path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'pilot.fixture.json');
const OUT = path.join(ROOT, 'data', 'berean-hebrew-pilot.js');
const BUILD_META = path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'runtime-build.json');

const GLOBAL = 'MARANATHA_BEREAN_HEBREW_PILOT';
const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const norm = (text) => text.replace(/\r\n/g, '\n');

function loadCanon() {
  const src = fs.readFileSync(path.join(ROOT, 'data', 'canon.js'), 'utf8')
    .replace(/^window\.MARANATHA_CANON=/, '').replace(/;\s*$/, '');
  return JSON.parse(src);
}

// Fixture record -> compact runtime token. Intentional blanks keep the
// glossStatus "untranslated" with an EMPTY gloss; missing glosses are null with
// glossStatus "missing". The two are never conflated.
function toRuntimeToken(rec) {
  const gloss = rec.glossStatus === 'untranslated' ? ''
    : rec.glossStatus === 'missing' ? null
      : rec.gloss;
  const token = {
    surface: rec.surface,
    transliteration: rec.transliteration,
    morphology: rec.morphology,
    strongs: rec.strongs,
    strongsList: rec.strongsList,
    gloss,
    glossStatus: rec.glossStatus,
  };
  if (rec.language) token.language = rec.language;
  if (rec.variant) token.variant = rec.variant;
  return token;
}

// Build the runtime object (pure). Only the covered chapters are present; other
// chapters are absent so the app shows its coverage notice. Within a covered
// chapter, uncovered verses are explicit nulls.
export function buildRuntime() {
  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const canon = loadCanon();
  const chaptersByBook = {};

  for (const passage of fixture.passages) {
    chaptersByBook[passage.bookId] = chaptersByBook[passage.bookId] || {};
    const verseMap = {};
    for (const vd of passage.verseData) verseMap[vd.verse] = vd.records.map(toRuntimeToken);
    chaptersByBook[passage.bookId][passage.chapter] = verseMap;
  }

  const books = {};
  for (const [bookId, chMap] of Object.entries(chaptersByBook)) {
    const canonBook = canon.books.find((b) => b.id === bookId);
    if (!canonBook) throw new Error(`unknown book id: ${bookId}`);
    const maxCh = Math.max(...Object.keys(chMap).map(Number));
    const arr = [];
    for (let c = 1; c <= maxCh; c++) {
      const verseMap = chMap[c];
      if (!verseMap) { arr.push(null); continue; }
      const count = canonBook.chapters[c - 1];
      const verses = [];
      for (let v = 1; v <= count; v++) verses.push(verseMap[v] || null);
      arr.push(verses);
    }
    books[bookId] = arr;
  }

  const totalRecords = fixture.passages.reduce((n, p) => n + p.recordCount, 0);
  return {
    id: 'berean-hebrew-pilot',
    label: 'Berean Hebrew (draft pilot)',
    attribution: 'Berean Interlinear Bible (BIB) \u00b7 Bible Hub \u00b7 dedicated to the public domain on April 30, 2023 \u2014 attribution appreciated but not required.',
    sourceUrl: 'https://biblehub.com/interlinear/',
    termsUrl: 'https://berean.bible/terms.htm',
    draft: 'Dated Berean draft (still being revised upstream) \u2014 only nine pilot verses.',
    coverage: 'Genesis 1:1\u20135; Daniel 2:4\u20135; Malachi 4:5\u20136',
    provenance: 'Extracted from the Berean Interlinear Bible (BIB) draft on Bible Hub; source-page hashes recorded in build/sources/berean-hebrew/source-manifest.json. Variant notes are OSHB comparisons only.',
    parserVersion: fixture.parserVersion,
    generatedFrom: 'build/sources/berean-hebrew/pilot.fixture.json',
    recordCount: totalRecords,
    books,
  };
}

export function runtimeSource() {
  return `window.${GLOBAL}=${JSON.stringify(buildRuntime())};\n`;
}

export function buildMeta() {
  const fixtureText = fs.readFileSync(FIXTURE, 'utf8');
  const fixture = JSON.parse(fixtureText);
  const output = runtimeSource();
  return {
    generatedBy: 'build/import-berean-hebrew-pilot.mjs',
    source: 'build/sources/berean-hebrew/pilot.fixture.json',
    sourceSha256: sha256(norm(fixtureText)),
    output: 'data/berean-hebrew-pilot.js',
    outputSha256: sha256(norm(output)),
    recordCount: fixture.totals.records,
    passages: fixture.passages.map((p) => ({ passage: p.passage, bookId: p.bookId, chapter: p.chapter, recordCount: p.recordCount })),
  };
}

function main() {
  const check = process.argv.slice(2).includes('--check');
  const output = runtimeSource();
  const metaText = JSON.stringify(buildMeta(), null, 2) + '\n';

  if (check) {
    let bad = 0;
    if (!fs.existsSync(OUT) || norm(fs.readFileSync(OUT, 'utf8')) !== norm(output)) { console.error(`FAIL stale ${path.relative(ROOT, OUT)}`); bad++; }
    if (!fs.existsSync(BUILD_META) || norm(fs.readFileSync(BUILD_META, 'utf8')) !== norm(metaText)) { console.error(`FAIL stale ${path.relative(ROOT, BUILD_META)}`); bad++; }
    if (bad) { console.error(`\n--check: ${bad} problem(s). Regenerate with: node build/import-berean-hebrew-pilot.mjs`); process.exit(1); }
    console.log(`Checked ${path.relative(ROOT, OUT)} and runtime-build.json: up to date.`);
    return;
  }

  fs.writeFileSync(OUT, output);
  fs.writeFileSync(BUILD_META, metaText);
  const runtime = buildRuntime();
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${Buffer.byteLength(output)} bytes).`);
  console.log(`  books ${Object.keys(runtime.books).join(', ')} \u00b7 records ${runtime.recordCount} \u00b7 coverage ${runtime.coverage}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
