// import-otb-ja.mjs
//
// Deterministic, offline importer for the Open Translation Bible (OTB) Japanese
// edition (ja-JP), published at https://openbible.uk and on GitHub at
// https://github.com/OpenTranslationBible/open-bible.
//
//   node build/import-otb-ja.mjs            # regenerate data/otb-ja.json + data/otb-ja.js
//   node build/import-otb-ja.mjs --check    # verify only; write/download nothing
//   node build/import-otb-ja.mjs --report   # bounded inventory / defects report
//
// SOURCE (already cached in the repository; no network is ever used):
//   build/sources/otb-ja/lang/ja-JP/**      1192 JSON files (1189 chapters + 3 metadata)
//   build/sources/otb-ja/source-files.json  manifest: path + git blob + sha256 per file
//   build/sources/otb-ja/LICENCE.md          publisher licence (CC BY-SA 4.0)
//   build/sources/otb-ja/UPSTREAM_README.md  publisher readme
//   Pinned commit 31d411ac1c2d277242a3bd85697f354eaa11526b
//
// The manifest, the licence and the readme are themselves SHA256-pinned here, so
// editing the manifest alone cannot mask altered Scripture. Every source file is
// re-verified on import against both its recorded SHA256 and its recorded git
// blob object id.
//
// HONEST PROVENANCE: the publisher documents the licence and the language/launch
// date, but not the human/AI translation method, the source-language witnesses,
// or any editorial-review status. This importer therefore asserts no translator,
// method or review claim, and the generated edition data repeats that the text
// is not accuracy-certified. This is the publisher's recent OTB Japanese edition;
// it is NOT the Kogoyaku (口語訳) or Bungo-yaku, and no existing Scripture
// is modernised or changed.
//
// FORMAT (verified against the pinned source, never assumed):
//   Each chapter file is an object { book, chapter, verses }.
//   verses[] entries are either numbered { verse: positive int, text: string[] }
//   or unnumbered { text: string[] } (the verse field is absent).
//   book/chapter labels can vary between chapter files of the same directory;
//   canonical identity comes from the "NN." directory index, not the free text.
//   Psalm filenames use three digits (詩篇-001.json); all others use two.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export const SOURCE_DIR = path.join(dir, 'sources', 'otb-ja');
export const LANG_DIR = path.join(SOURCE_DIR, 'lang', 'ja-JP');
export const MANIFEST_PATH = path.join(SOURCE_DIR, 'source-files.json');
export const LICENCE_PATH = path.join(SOURCE_DIR, 'LICENCE.md');
export const README_PATH = path.join(SOURCE_DIR, 'UPSTREAM_README.md');

export const SOURCE_PIN = '31d411ac1c2d277242a3bd85697f354eaa11526b';
export const SOURCE_MANIFEST_SHA256 = '929e33448a67ccbffb7b5e77e7de90894a32839f28337d42340433f45a2f3a35';
export const SOURCE_LICENCE_SHA256 = 'b6a88d6599299316d5860bf982f53fb4840abe1094708857e816de73694f77dc';
export const SOURCE_README_SHA256 = 'b0877203135f431be852ef5b4797790dba59e7c9f22c506d0de0c740033a74bc';

// The sixty-six source directories 01..66 in publisher order, mapped onto
// Maranatha's stable ids. Authored here and cross-checked against the source
// metadata; never derived from canon.js or from Bungo text.
export const BOOK_IDS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

export const EXPECTED_BOOKS = 66;
export const EXPECTED_CHAPTERS = 1189;
export const EXPECTED_NUMBERED = 31103;
export const EXPECTED_UNNUMBERED = 3777;
export const EXPECTED_SEPARATORS = 3636;
export const EXPECTED_PSALM_RECORDS = 138;
export const EXPECTED_NT_NOTES = 3;

// The two numeric-only placeholder records: the source supplies no Scripture
// text, only a bracketed marker. Kept byte-exact in books[] and disclosed with
// an authored (never "source footnote") notice at the verse slot.
export const EXPECTED_PLACEHOLDERS = [
  { bookId: 'MAT', chapter: 23, verse: 14, text: '[14]' },
  { bookId: 'JHN', chapter: 5, verse: 4, text: '[4]' },
];

// The three unnumbered New-Testament variant notes. Their books/chapters are
// verified, so a silent relocation cannot pass.
export const EXPECTED_NT_NOTE_REFS = ['MRK.16', 'JHN.7', 'JHN.8'];

const SEPARATOR = '---';

export function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// Git object ids are SHA-1 over "blob <len>\0<bytes>". Verified independently of
// the manifest so a manifest that merely repeats a corrupted hash cannot pass.
export function gitBlobSha1(buf) {
  return crypto.createHash('sha1').update(Buffer.concat([
    Buffer.from(`blob ${buf.length}\0`, 'utf8'), buf,
  ])).digest('hex');
}

function readSourceFile(rel) {
  return fs.readFileSync(path.join(SOURCE_DIR, rel.split('/').join(path.sep)));
}

// Verifies the pinned manifest, licence and readme, then every listed source
// file against its recorded sha256 AND git blob. Also rejects missing or extra
// JSON files under lang/ja-JP, so a silently added or removed chapter fails.
export function verifySource() {
  if (sha256File(MANIFEST_PATH) !== SOURCE_MANIFEST_SHA256) {
    throw new Error('source-files.json differs from the pinned manifest');
  }
  if (sha256File(LICENCE_PATH) !== SOURCE_LICENCE_SHA256) {
    throw new Error('LICENCE.md differs from the pinned licence');
  }
  if (sha256File(README_PATH) !== SOURCE_README_SHA256) {
    throw new Error('UPSTREAM_README.md differs from the pinned readme');
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest) || manifest.length === 0) throw new Error('manifest is not a non-empty array');

  const listed = new Set();
  for (const item of manifest) {
    if (typeof item.path !== 'string' || typeof item.sha256 !== 'string' || typeof item.gitBlob !== 'string') {
      throw new Error(`malformed manifest entry: ${JSON.stringify(item)}`);
    }
    if (listed.has(item.path)) throw new Error(`duplicate manifest path: ${item.path}`);
    listed.add(item.path);
    const buf = readSourceFile(item.path);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    if (sha !== item.sha256) throw new Error(`SHA256 mismatch for ${item.path}`);
    const blob = gitBlobSha1(buf);
    if (blob !== item.gitBlob) throw new Error(`git blob mismatch for ${item.path}`);
  }

  const onDisk = new Set();
  const walk = (abs, rel) => {
    for (const name of fs.readdirSync(abs)) {
      const childAbs = path.join(abs, name);
      const childRel = rel ? `${rel}/${name}` : name;
      const st = fs.statSync(childAbs);
      if (st.isDirectory()) walk(childAbs, childRel);
      else if (name.endsWith('.json')) onDisk.add(`lang/ja-JP/${childRel}`);
    }
  };
  walk(LANG_DIR, '');
  for (const p of onDisk) if (!listed.has(p)) throw new Error(`unlisted source file on disk: ${p}`);
  for (const p of listed) if (p.endsWith('.json') && !onDisk.has(p)) throw new Error(`manifest lists a missing file: ${p}`);

  return manifest;
}

function assertNonEmptySegmentArray(text, ref) {
  if (!Array.isArray(text) || text.length === 0) throw new Error(`${ref}: text is not a non-empty array`);
  for (const seg of text) {
    if (typeof seg !== 'string') throw new Error(`${ref}: text segment is not a string`);
    if (seg.length === 0) throw new Error(`${ref}: blank text segment`);
    if (seg.includes('\uFFFD')) throw new Error(`${ref}: invalid UTF-8 replacement character`);
  }
}

function cloneText(text) {
  return text.slice();
}

// Reads and validates the whole source tree. Returns books (joined text per
// verse), the original per-verse segment arrays, unnumbered records with their
// position, and the derived psalm headings / New-Testament source notes.
export function parseSource() {
  verifySource();

  const booksJsonPath = path.join(LANG_DIR, 'books.json');
  const declared = JSON.parse(fs.readFileSync(booksJsonPath, 'utf8'));
  const declaredNames = Object.keys(declared);
  if (declaredNames.length !== EXPECTED_BOOKS) throw new Error(`books.json declares ${declaredNames.length} books, expected ${EXPECTED_BOOKS}`);

  const dirNames = fs.readdirSync(LANG_DIR).filter((n) => /^\d{2}\./.test(n)).sort();
  if (dirNames.length !== EXPECTED_BOOKS) throw new Error(`found ${dirNames.length} source directories, expected ${EXPECTED_BOOKS}`);

  const books = {};
  const verseSegments = {};
  const sourceRecords = {};
  const psalmHeadings = {};
  const sourceNotes = {};
  const inventory = {
    books: 0, chapters: 0, numbered: 0, unnumbered: 0,
    separators: 0, psalmRecords: 0, ntNotes: 0,
  };

  for (let index = 0; index < dirNames.length; index += 1) {
    const dirName = dirNames[index];
    const id = BOOK_IDS[index];
    if (!id) throw new Error(`no stable id for source directory ${dirName}`);
    const label = dirName.replace(/^\d{2}\./, '');
    if (label !== declaredNames[index]) {
      throw new Error(`source directory ${dirName} does not match books.json entry ${declaredNames[index]}`);
    }

    const jsonDir = path.join(LANG_DIR, dirName, 'json');
    const files = fs.readdirSync(jsonDir).filter((n) => n.endsWith('.json')).sort((a, b) => {
      const na = Number((a.match(/-(\d+)\.json$/) || [])[1]);
      const nb = Number((b.match(/-(\d+)\.json$/) || [])[1]);
      return na - nb;
    });
    if (files.length !== declared[label]) {
      throw new Error(`${id}: source has ${files.length} chapter files, books.json declares ${declared[label]}`);
    }

    books[id] = [];
    verseSegments[id] = [];

    for (let ci = 0; ci < files.length; ci += 1) {
      const file = files[ci];
      const chapterNum = Number((file.match(/-(\d+)\.json$/) || [])[1]);
      if (!Number.isInteger(chapterNum) || chapterNum !== ci + 1) {
        throw new Error(`${id}: unexpected chapter filename ${file}`);
      }
      const doc = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf8'));
      if (doc.chapter !== chapterNum) throw new Error(`${id} ${file}: chapter field ${doc.chapter} != filename ${chapterNum}`);
      if (typeof doc.book !== 'string' || !doc.book) throw new Error(`${id} ${file}: missing book label`);
      if (!Array.isArray(doc.verses)) throw new Error(`${id} ${file}: verses is not an array`);

      const rows = [];
      const rowsSegments = [];
      const unnumbered = [];
      let prevVerse = 0;
      const seen = new Set();

      doc.verses.forEach((rec, sourceIndex) => {
        const ref = `${id}.${chapterNum}.${sourceIndex}`;
        if (!rec || typeof rec !== 'object') throw new Error(`${ref}: record is not an object`);
        const extra = Object.keys(rec).filter((k) => k !== 'verse' && k !== 'text');
        if (extra.length) throw new Error(`${ref}: unexpected record keys ${extra.join(', ')}`);
        assertNonEmptySegmentArray(rec.text, ref);

        if (rec.verse === undefined) {
          let kind;
          if (rec.text.length === 1 && rec.text[0] === SEPARATOR) kind = 'separator';
          else if (id === 'PSA') kind = 'psalm';
          else kind = 'note';
          unnumbered.push({
            sourceIndex,
            kind,
            text: rec.text.join('\n'),
            segments: cloneText(rec.text),
            beforeVerse: prevVerse,
            afterVerse: null,
          });
          return;
        }

        if (!Number.isInteger(rec.verse) || rec.verse < 1) throw new Error(`${ref}: invalid verse number ${rec.verse}`);
        if (seen.has(rec.verse)) throw new Error(`${id} ${chapterNum}: duplicate verse ${rec.verse}`);
        seen.add(rec.verse);
        rows[rec.verse - 1] = rec.text.join('\n');
        // The original per-verse text array is retained verbatim; books[] is the
        // documented join('\n') of exactly this array.
        rowsSegments[rec.verse - 1] = cloneText(rec.text);
        prevVerse = rec.verse;
        inventory.numbered += 1;
      });

      const maxVerse = rows.length;
      if (maxVerse === 0) throw new Error(`${id} ${chapterNum}: no numbered records`);
      for (let v = 1; v <= maxVerse; v += 1) {
        if (rows[v - 1] === undefined) throw new Error(`${id} ${chapterNum}: gap at verse ${v}`);
        if (!Array.isArray(rowsSegments[v - 1])) throw new Error(`${id} ${chapterNum}: verse ${v} has no segment array`);
      }

      // Resolve afterVerse for each unnumbered record from the nearest later
      // numbered verse in the same chapter.
      const numberedVerses = [];
      for (let v = 1; v <= maxVerse; v += 1) numberedVerses.push(v);
      for (const rec of unnumbered) {
        const next = numberedVerses.find((v) => v > rec.beforeVerse);
        rec.afterVerse = next === undefined ? null : next;
        inventory.unnumbered += 1;
        if (rec.kind === 'separator') inventory.separators += 1;
        else if (rec.kind === 'psalm') inventory.psalmRecords += 1;
        else inventory.ntNotes += 1;

        (sourceRecords[id] ||= {})[chapterNum] ||= [];
        sourceRecords[id][chapterNum].push({
          sourceIndex: rec.sourceIndex,
          kind: rec.kind,
          text: rec.text,
          segments: rec.segments,
          beforeVerse: rec.beforeVerse,
          afterVerse: rec.afterVerse,
        });
        if (rec.kind === 'psalm') {
          (psalmHeadings[id] ||= {})[chapterNum] ||= [];
          psalmHeadings[id][chapterNum].push({
            type: 'psalm',
            text: rec.text,
            verse: rec.beforeVerse || 1,
            afterVerse: rec.afterVerse,
          });
        } else if (rec.kind === 'note') {
          (sourceNotes[id] ||= {})[chapterNum] ||= [];
          sourceNotes[id][chapterNum].push({
            text: rec.text,
            beforeVerse: rec.beforeVerse,
            afterVerse: rec.afterVerse,
          });
        }
      }

      books[id].push(rows);
      verseSegments[id].push(rowsSegments);
      inventory.chapters += 1;
    }
    inventory.books += 1;
  }

  return { books, verseSegments, sourceRecords, psalmHeadings, sourceNotes, inventory };
}

const SOURCE_TEXT = 'Open Translation Bible (OTB) Japanese edition (lang/ja-JP), published by Open Translation Bible (https://openbible.uk) and distributed from https://github.com/OpenTranslationBible/open-bible at pinned commit ' + SOURCE_PIN + '. The Japanese edition launched in December 2025 and is licensed CC BY-SA 4.0 (Attribution-ShareAlike 4.0 International). Under that licence it may be copied, adapted and redistributed, including commercially, with attribution, a link to the licence, a notice of changes, and share-alike terms on adapted data. This import records attribution and licence terms in data/LICENSE-otb-ja.md and retains the verbatim publisher licence and raw source in build/sources/otb-ja/; the publisher does not document the translation method, source-language witnesses, or any human/editorial-review status, so none is asserted here.';

const DESCRIPTION = 'The publisher\u2019s Open Translation Bible (OTB) Japanese edition, launched December 2025 and released under CC BY-SA 4.0. Read in its own native reference numbering (66 books, 1189 chapters, 31103 numbered source records; 45043 text segments). Daniel has 12 chapters in this edition. The publisher does not document the translation/editorial method, so this edition is not accuracy-certified. Two source records (Matthew 23:14 and John 5:4) contain only a bracketed placeholder with no Scripture text and are shown exactly as supplied. Converted from the publisher JSON; the app keeps each verse\u2019s original text segments and joins them with newlines.';

const CONVERSION_NOTE = 'Converted offline from the publisher\u2019s lang/ja-JP chapter files (schema { book, chapter, verses }, numbered records { verse, text[] } and unnumbered { text[] }), with no words added, removed or corrected. books[] joins each verse\u2019s original text segments with "\\n", and the original per-verse arrays are retained verbatim in verseSegments. Unnumbered source records (3636 literal "---" separators, 138 Psalm textual records and 3 New-Testament variant notes) are preserved in sourceRecords with their original position; the Psalm records also populate psalmHeadings and the New-Testament notes populate sourceNotes. The two numeric placeholders are metadata-tagged, not reworded.';

export function buildTranslation(parsed, hashes) {
  const placeholders = EXPECTED_PLACEHOLDERS.map((p) => ({ ...p }));
  const verseMetadata = {};
  for (const p of placeholders) {
    ((verseMetadata[p.bookId] ||= {})[String(p.chapter)] ||= {})[String(p.verse)] = {
      status: 'source-placeholder',
      note: 'The source record at this reference contains only a bracketed marker, not Scripture text. It is shown exactly as supplied; no text was supplied or inferred.',
      text: p.text,
    };
  }
  return {
    id: 'otb-ja',
    label: 'Open Translation Bible (Japanese)',
    short: 'OTB-JA',
    language: 'ja',
    languageName: 'Japanese',
    direction: 'ltr',
    translator: 'Not documented by the publisher',
    source: SOURCE_TEXT,
    sourceEdition: 'Open Translation Bible (OTB) Japanese edition (lang/ja-JP), launched December 2025',
    sourcePublisher: 'Open Translation Bible (openbible.uk)',
    sourceUrl: 'https://github.com/OpenTranslationBible/open-bible',
    sourcePin: SOURCE_PIN,
    sourceManifestSha256: hashes.manifest,
    sourceLicenceSha256: hashes.licence,
    sourceReadmeSha256: hashes.readme,
    sourceRetrievalDate: '2026-10-08',
    license: 'CC BY-SA 4.0',
    description: DESCRIPTION,
    conversionNote: CONVERSION_NOTE,
    nativeVersification: true,
    nativeReferenceScope: true,
    numberingNotice: 'OTB-JA keeps its own source reference numbering. Daniel has 12 chapters in this edition; equal verse numbers are not a verified correspondence with any other translation.',
    books: parsed.books,
    verseSegments: parsed.verseSegments,
    headings: {},
    psalmHeadings: parsed.psalmHeadings,
    sourceNotes: parsed.sourceNotes,
    sourceRecords: parsed.sourceRecords,
    verseMetadata,
    sourcePlaceholders: placeholders,
    sourceInventory: { ...parsed.inventory },
  };
}

export function loadAndBuild() {
  const parsed = parseSource();
  const { inventory } = parsed;
  if (inventory.books !== EXPECTED_BOOKS) throw new Error(`Expected ${EXPECTED_BOOKS} books, got ${inventory.books}`);
  if (inventory.chapters !== EXPECTED_CHAPTERS) throw new Error(`Expected ${EXPECTED_CHAPTERS} chapters, got ${inventory.chapters}`);
  if (inventory.numbered !== EXPECTED_NUMBERED) throw new Error(`Expected ${EXPECTED_NUMBERED} numbered records, got ${inventory.numbered}`);
  if (inventory.unnumbered !== EXPECTED_UNNUMBERED) throw new Error(`Expected ${EXPECTED_UNNUMBERED} unnumbered records, got ${inventory.unnumbered}`);
  if (inventory.separators !== EXPECTED_SEPARATORS) throw new Error(`Expected ${EXPECTED_SEPARATORS} separators, got ${inventory.separators}`);
  if (inventory.psalmRecords !== EXPECTED_PSALM_RECORDS) throw new Error(`Expected ${EXPECTED_PSALM_RECORDS} Psalm records, got ${inventory.psalmRecords}`);
  if (inventory.ntNotes !== EXPECTED_NT_NOTES) throw new Error(`Expected ${EXPECTED_NT_NOTES} NT notes, got ${inventory.ntNotes}`);

  for (const p of EXPECTED_PLACEHOLDERS) {
    const text = parsed.books[p.bookId][p.chapter - 1][p.verse - 1];
    if (text !== p.text) throw new Error(`Placeholder ${p.bookId} ${p.chapter}:${p.verse} is ${JSON.stringify(text)}, expected ${JSON.stringify(p.text)}`);
  }
  const noteRefs = Object.entries(parsed.sourceNotes)
    .flatMap(([id, chs]) => Object.keys(chs).map((c) => `${id}.${c}`)).sort();
  const expectedNoteRefs = [...EXPECTED_NT_NOTE_REFS].sort();
  if (JSON.stringify(noteRefs) !== JSON.stringify(expectedNoteRefs)) {
    throw new Error(`NT note locations ${JSON.stringify(noteRefs)} differ from ${JSON.stringify(expectedNoteRefs)}`);
  }

  const hashes = {
    manifest: sha256File(MANIFEST_PATH),
    licence: sha256File(LICENCE_PATH),
    readme: sha256File(README_PATH),
  };
  const translation = buildTranslation(parsed, hashes);
  return { translation, parsed, hashes };
}

function jsonString(t) { return JSON.stringify(t, null, 2) + '\n'; }
function jsString(t) { return `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['otb-ja']=${JSON.stringify(t, null, 2)};\n`; }

function report(parsed) {
  const c = parsed.inventory;
  console.log('OTB Japanese (Open Translation Bible) source inventory');
  console.log(`  books=${c.books} chapters=${c.chapters} numbered=${c.numbered} unnumbered=${c.unnumbered}`);
  console.log(`  separators=${c.separators} psalmRecords=${c.psalmRecords} ntNotes=${c.ntNotes}`);
  console.log(`  placeholder slots: ${EXPECTED_PLACEHOLDERS.map((p) => `${p.bookId} ${p.chapter}:${p.verse}=${p.text}`).join(', ')}`);
  console.log(`  NT note locations: ${Object.entries(parsed.sourceNotes).flatMap(([id, chs]) => Object.keys(chs).map((ch) => `${id} ${ch}`)).join(', ')}`);
}

function main() {
  const check = process.argv.includes('--check');
  const wantReport = process.argv.includes('--report');
  const { translation, parsed } = loadAndBuild();
  if (wantReport) { report(parsed); return; }

  const json = jsonString(translation);
  const js = jsString(translation);
  const jsonPath = path.join(dir, '..', 'data', 'otb-ja.json');
  const jsPath = path.join(dir, '..', 'data', 'otb-ja.js');

  if (check) {
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8').replace(/\r\n/g, '\n') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date (run node build/import-otb-ja.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date (run node build/import-otb-ja.mjs)`);
    const c = parsed.inventory;
    console.log(`otb-ja --check OK: ${c.books} books, ${c.chapters} chapters, ${c.numbered} numbered records (${c.unnumbered} unnumbered: ${c.separators} separators, ${c.psalmRecords} Psalm records, ${c.ntNotes} NT notes).`);
    return;
  }

  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(jsPath, js);
  const c = parsed.inventory;
  console.log(`Wrote ${jsonPath} (${Object.keys(translation.books).length} books, ${c.numbered} numbered records).`);
  console.log(`Preserved ${c.unnumbered} unnumbered source records (${c.separators} separators, ${c.psalmRecords} Psalm records, ${c.ntNotes} NT notes) and ${EXPECTED_PLACEHOLDERS.length} placeholders.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
