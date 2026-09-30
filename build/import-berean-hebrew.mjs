// import-berean-hebrew.mjs
//
// Deterministic build step that turns the accepted extraction fixture into the
// runtime files the app loads under file:// — a small manifest plus one chunk
// per book, mirroring the Berean Greek per-book layout:
//
//   build/sources/berean-hebrew/hebrew.fixture.json     (source of truth)
//     -> data/berean-hebrew/manifest.js                 (window.MARANATHA_BEREAN_HEBREW_MANIFEST)
//     -> data/berean-hebrew/<BOOK>.js                   (window.MARANATHA_BEREAN_HEBREW_<BOOK>)
//     -> build/sources/berean-hebrew/runtime-build.json (hashes + counts)
//
// The fixture is the build source; the generated files must never be hand-edited.
//
// USAGE
//   node build/import-berean-hebrew.mjs          # write the runtime files
//   node build/import-berean-hebrew.mjs --check  # verify they are up to date

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..');
const FIXTURE = path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'hebrew.fixture.json');
const OUT_DIR = path.join(ROOT, 'data', 'berean-hebrew');
const BUILD_META = path.join(ROOT, 'build', 'sources', 'berean-hebrew', 'runtime-build.json');

const GLOBAL_PREFIX = 'MARANATHA_BEREAN_HEBREW_';
const BOOK_ORDER = ['GEN', 'EXO', 'LEV', 'DAN', 'MAL'];
// The manifest filename is VERSIONED so a change in coverage cannot be hidden by
// a cache-first copy from a previous milestone. Bump this suffix whenever the
// manifest content changes (and update app.js `manifestSrc`).
const MANIFEST_FILE = 'data/berean-hebrew/manifest-v3.js';
// A book whose chunk content changes gets a versioned filename so an old
// cache-first copy cannot hide the change. The mapping is published in the
// manifest (`chunkFiles`) and used by the app to build the script URL.
const CHUNK_VERSION = { GEN: 'v2' };
function chunkFile(bookId) {
  return CHUNK_VERSION[bookId] ? `${bookId}-${CHUNK_VERSION[bookId]}.js` : `${bookId}.js`;
}
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
  if (rec.variant) {
    // Runtime variant shape is kept identical to the Genesis milestone so
    // unchanged books' chunks stay byte-identical (no needless cache churn).
    // Audit-only fields (oshbRef, evidence, sourceFingerprint) stay in the
    // fixture and variants.json.
    const v = rec.variant;
    token.variant = {
      type: v.type,
      sourceDisplays: v.sourceDisplays,
      sourceMarksVariant: v.sourceMarksVariant,
      ref: v.ref,
      provenance: v.provenance,
      observedPageSurface: v.observedPageSurface,
      oshbKetiv: v.oshbKetiv,
      oshbQere: v.oshbQere,
      note: v.note,
    };
  }
  return token;
}

// Build { manifest, books: { GEN: chapters, ... } }. Chapters are padded to the
// canon chapter count (nulls beyond the covered chapters); within a covered
// chapter, uncovered verses are explicit nulls.
export function buildRuntime() {
  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const canon = loadCanon();
  const byBook = {};

  for (const passage of fixture.passages) {
    byBook[passage.bookId] = byBook[passage.bookId] || {};
    const verseMap = {};
    for (const vd of passage.verseData) verseMap[vd.verse] = vd.records.map(toRuntimeToken);
    byBook[passage.bookId][passage.chapter] = verseMap;
  }

  const books = {};
  const booksRecordCount = {};
  const booksChapterCount = {};
  for (const bookId of BOOK_ORDER) {
    const chMap = byBook[bookId];
    if (!chMap) continue;
    const canonBook = canon.books.find((b) => b.id === bookId);
    if (!canonBook) throw new Error(`unknown book id: ${bookId}`);
    const chapters = [];
    let recordCount = 0;
    for (let c = 1; c <= canonBook.chapters.length; c++) {
      const verseMap = chMap[c];
      if (!verseMap) { chapters.push(null); continue; }
      const count = canonBook.chapters[c - 1];
      const verses = [];
      for (let v = 1; v <= count; v++) {
        const recs = verseMap[v] || null;
        verses.push(recs);
        if (recs) recordCount += recs.length;
      }
      chapters.push(verses);
    }
    books[bookId] = chapters;
    booksRecordCount[bookId] = recordCount;
    booksChapterCount[bookId] = Object.keys(chMap).length;
  }

  const totalRecords = Object.values(booksRecordCount).reduce((a, b) => a + b, 0);
  const manifest = {
    id: 'berean-hebrew',
    label: 'Berean Hebrew (draft preview)',
    attribution: 'Berean Interlinear Bible (BIB) \u00b7 Bible Hub \u00b7 dedicated to the public domain on April 30, 2023 \u2014 attribution appreciated but not required.',
    sourceUrl: 'https://biblehub.com/interlinear/',
    termsUrl: 'https://berean.bible/terms.htm',
    draft: 'Dated Berean draft (still being revised upstream).',
    coverage: fixture.coverage,
    provenance: 'Extracted from the Berean Interlinear Bible (BIB) draft on Bible Hub; source-page hashes recorded in build/sources/berean-hebrew/source-manifest.json. Variant notes are verified OSHB comparisons only.',
    parserVersion: fixture.parserVersion,
    generatedFrom: 'build/sources/berean-hebrew/hebrew.fixture.json',
    recordCount: totalRecords,
    books: BOOK_ORDER.filter((id) => books[id]),
    chunkFiles: Object.fromEntries(BOOK_ORDER.filter((id) => books[id]).map((id) => [id, chunkFile(id)])),
    booksRecordCount,
    booksChapterCount,
  };
  return { manifest, books };
}

function chunkSource(bookId, chapters) {
  return `window.${GLOBAL_PREFIX}${bookId}=${JSON.stringify({ books: { [bookId]: chapters } })};\n`;
}
function manifestSource(manifest) {
  return `window.${GLOBAL_PREFIX}MANIFEST=${JSON.stringify(manifest)};\n`;
}

export function assemble() {
  const { manifest, books } = buildRuntime();
  const files = { [MANIFEST_FILE]: manifestSource(manifest) };
  for (const bookId of BOOK_ORDER) {
    if (books[bookId]) files[`data/berean-hebrew/${chunkFile(bookId)}`] = chunkSource(bookId, books[bookId]);
  }
  return { files, manifest };
}

export function buildMeta() {
  const fixtureText = fs.readFileSync(FIXTURE, 'utf8');
  const { files, manifest } = assemble();
  return {
    generatedBy: 'build/import-berean-hebrew.mjs',
    source: 'build/sources/berean-hebrew/hebrew.fixture.json',
    sourceSha256: sha256(norm(fixtureText)),
    recordCount: manifest.recordCount,
    books: manifest.books,
    booksRecordCount: manifest.booksRecordCount,
    files: Object.fromEntries(Object.entries(files).map(([rel, text]) => [rel, sha256(norm(text))])),
  };
}

function main() {
  const check = process.argv.slice(2).includes('--check');
  const { files, manifest } = assemble();
  const metaText = JSON.stringify(buildMeta(), null, 2) + '\n';

  if (check) {
    let bad = 0;
    for (const [rel, text] of Object.entries(files)) {
      const p = path.join(ROOT, rel);
      if (!fs.existsSync(p) || norm(fs.readFileSync(p, 'utf8')) !== norm(text)) { console.error(`FAIL stale ${rel}`); bad++; }
    }
    if (!fs.existsSync(BUILD_META) || norm(fs.readFileSync(BUILD_META, 'utf8')) !== norm(metaText)) {
      console.error(`FAIL stale ${path.relative(ROOT, BUILD_META)}`); bad++;
    }
    if (bad) { console.error(`\n--check: ${bad} problem(s). Regenerate with: node build/import-berean-hebrew.mjs`); process.exit(1); }
    console.log(`Checked ${Object.keys(files).length + 1} generated files: up to date.`);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [rel, text] of Object.entries(files)) fs.writeFileSync(path.join(ROOT, rel), text);
  fs.writeFileSync(BUILD_META, metaText);
  const totalBytes = Object.entries(files)
    .filter(([rel]) => rel !== MANIFEST_FILE)
    .reduce((n, [rel]) => n + Buffer.byteLength(files[rel]), 0);
  console.log(`Wrote manifest + ${manifest.books.length} book chunks (${(totalBytes / 1024 / 1024).toFixed(2)} MB).`);
  console.log(`  records ${manifest.recordCount} \u00b7 coverage ${manifest.coverage}`);
  for (const b of manifest.books) console.log(`  ${b}: ${manifest.booksRecordCount[b]} records`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
