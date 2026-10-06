// import-delitzsch.mjs
//
// Normalizes build/sources/delitzsch/heb_vpl.txt into data/delitzsch.json
// (+ a window-global data/delitzsch.js twin — same pattern as the other
// importers; see build/import-web.mjs for why both exist).
//
// SOURCE: eBible.org, https://ebible.org/Scriptures/heb_vpl.zip — the NT subset
// of "The Holy Bible in Modern Hebrew" (eBible translation ID heb), a BibleWorks
// VPL ("verse per line") plain-text dump: one verse per line as `BOOK C:V text`.
// eBible attributes the text to Franz Delitzsch (1813–1890), declares it public
// domain, and dates this digital edition 2022-06-14. It does NOT identify the
// underlying print edition: this is an unpointed eBible digital text attributed
// to Delitzsch and first published (per the translator's own first edition) in
// 1877, NOT a verified transcription of that first edition and NOT an ancient
// Hebrew manuscript or a recovered original Hebrew NT.
//
// IMPORTANT: this file imports ONLY the 27-book New Testament. The same VPL
// package also carries an unpointed Hebrew Old Testament; those 39 books are
// explicitly recognized and excluded here, never silently discarded, and are
// never combined with the existing OSHB OT. Import text from heb_vpl.txt only.
//
// USAGE
//   node build/import-delitzsch.mjs            # regenerate from cached source
//   node build/import-delitzsch.mjs --check     # verify, write/download nothing
//   node build/import-delitzsch.mjs --download  # (re)acquire the cached source
//
// Source acquisition (network) is deliberately separated from ordinary
// regeneration: the default and --check paths read the cached, hash-pinned
// source in build/sources/delitzsch/ and never touch the network. --download is
// the only path that fetches, verifies and extracts the eBible archives. If a
// downloaded archive hash differs from the inspected values, import refuses to
// accept it unless --accept-changed-source is also passed, so a changed
// upstream source must be inspected and documented first.
//
// 3 JOHN 1:14 / 1:15
//   Source 3 John 1:14 literally ends with a bracketed publisher annotation:
//     "...נדבר׃ [ (III John 1:15) שלום לך ... בשמו׃ ]"
//   The VPL and the corroborating USFM both encode this inside verse 14 (the
//   USFM is NOT a \f footnote). The transformation is narrow and checked:
//     - source verse 14's main text is retained at zero-based array index 13;
//     - the labelled bracket content is extracted and represented as verse 15
//       in verseMetadata with status "note" and its exact Hebrew text;
//     - the annotation is never promoted to a numbered main-text verse, is
//       never padded or relocated, and the phrase is expected verbatim. If the
//       syntax changes, the importer fails.
//   See validate-delitzsch.mjs for the corroborating USFM cross-check.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const SOURCE_DIR = path.join(dir, 'sources', 'delitzsch');
const VPL_TXT = path.join(SOURCE_DIR, 'heb_vpl.txt');
const USFM_DIR = path.join(SOURCE_DIR, 'usfm');

// The inspected digital artifacts. These identify the examined eBible archives,
// not a verified historical print edition; eBible does not name the print
// edition behind its Delitzsch attribution.
export const EXPECTED_ARCHIVES = {
  vpl: {
    url: 'https://ebible.org/Scriptures/heb_vpl.zip',
    sha256: '77bfc46d373403f722aef77621e3b40d9195e59fd08bdcc3f5185a8db726bc9d',
  },
  usfm: {
    url: 'https://ebible.org/Scriptures/heb_usfm.zip',
    sha256: '416ebf82794853a5a2c7721a736189315034baf6fd60240047ddbdb6e16fcb9e',
  },
};

// The 27 NT canon IDs, in canon order (data/canon.js). Importing only these is
// the whole point of the NT-only scope.
export const NT_CANON = [
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
  '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN',
  '3JN', 'JUD', 'REV',
];

// BibleWorks VPL book code -> Maranatha canon ID, full 66-book map (same table
// as import-luther1912.mjs). The OT half lets us explicitly recognize and
// exclude the package's OT rows; anything not in this table is a hard error.
export const VPL_TO_CANON = {
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

// Source-declared properties of the inspected NT subset. The importer asserts
// these so a silently changed source cannot slip through; validation re-checks
// them from the cached file.
export const EXPECTED_NT_BOOKS = 27;
export const EXPECTED_NT_CHAPTERS = 260;
export const EXPECTED_NT_VERSES = 7957;

const LINE = /^([0-9A-Z]{3}) (\d+):(\d+) (.*)$/;
// Hebrew niqqud / te'amim (vowel points and cantillation). The publisher's NT
// verse bodies must contain none; sof pasuq (U+05C3) is punctuation, not a point.
const NIQQUD = /[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/;
const PLACEHOLDER = /^\[\s*\]$/;

// The one expected 3 John annotation, matched narrowly and verbatim in label.
export const ANNOTATION_LABEL = 'III John 1:15';
const ANNOTATION = /^(.*?)\s+\[\s*\(III John 1:15\)\s*(.*?)\s*\]\s*$/u;

export const ANNOTATION_NOTE =
  'Explicitly labelled publisher annotation text ("III John 1:15") embedded at the end of source verse 14; preserved as note-only metadata, not a numbered main-text verse.';

function emptyBooks() {
  const books = {};
  for (const id of NT_CANON) books[id] = [];
  return books;
}

// Parses the cached VPL text and returns the normalized translation plus audit
// stats. Pure and deterministic: no I/O beyond reading the passed-in string.
export function buildTranslation(rawSource) {
  const raw = rawSource.replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();

  const books = emptyBooks();
  const verseMetadata = {};
  const seen = new Set();
  const stats = {
    totalLines: lines.length,
    otRows: 0,
    ntRows: 0,
    malformed: 0,
    emptyTexts: 0,
    duplicateRefs: 0,
    niqqudRows: 0,
    replacementChars: 0,
    annotationMatches: 0,
  };
  let annotationSeen = false;

  for (const line of lines) {
    const m = LINE.exec(line);
    if (!m) {
      stats.malformed++;
      throw new Error(`Unparseable VPL line: ${JSON.stringify(line)}`);
    }
    const [, code, chapterText, verseText, text] = m;
    const id = VPL_TO_CANON[code];
    if (!id) throw new Error(`Unexpected source book code ${code}: ${JSON.stringify(line)}`);

    // Explicit OT recognition and exclusion — never a silent discard, and never
    // merged with the existing OSHB OT.
    if (!NT_CANON.includes(id)) {
      stats.otRows++;
      continue;
    }
    stats.ntRows++;

    const chapter = Number(chapterText);
    const verse = Number(verseText);
    if (!Number.isInteger(chapter) || chapter < 1) throw new Error(`Invalid chapter number in ${JSON.stringify(line)}`);
    if (!Number.isInteger(verse) || verse < 1) throw new Error(`Invalid verse number in ${JSON.stringify(line)}`);

    const ref = `${id} ${chapter}:${verse}`;
    if (seen.has(ref)) {
      stats.duplicateRefs++;
      throw new Error(`Duplicate reference ${ref}`);
    }
    seen.add(ref);

    let body = text.trim();
    if (!body) {
      stats.emptyTexts++;
      throw new Error(`Empty verse text at ${ref}`);
    }
    if (PLACEHOLDER.test(body)) throw new Error(`Placeholder verse text at ${ref}: ${JSON.stringify(text)}`);

    // The single labelled 3 John annotation lives at the end of source 3 John
    // 1:14. Any appearance of its label elsewhere is a source-format change.
    if (body.includes(`(${ANNOTATION_LABEL})`)) {
      if (!(id === '3JN' && chapter === 1 && verse === 14)) {
        throw new Error(`Unexpected "${ANNOTATION_LABEL}" annotation outside 3 John 1:14: ${ref}`);
      }
      const am = ANNOTATION.exec(body);
      if (!am) throw new Error(`3 John 1:14 annotation syntax changed: ${JSON.stringify(body)}`);
      const mainText = am[1].trim();
      const annotation = am[2].trim();
      if (!mainText || !annotation) throw new Error(`3 John 1:14 annotation came out empty: ${JSON.stringify(body)}`);
      stats.annotationMatches++;
      annotationSeen = true;
      body = mainText;
      (verseMetadata['3JN'] ||= {})[1] = {
        [15]: { status: 'note', text: annotation, note: ANNOTATION_NOTE },
      };
    }

    if (NIQQUD.test(body)) {
      stats.niqqudRows++;
      throw new Error(`Niqqud/te'amim found in NT verse body at ${ref}`);
    }
    if (body.includes('\uFFFD')) {
      stats.replacementChars++;
      throw new Error(`U+FFFD replacement character found at ${ref}`);
    }

    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = body;
  }

  if (!annotationSeen) throw new Error(`Expected exactly one ${ANNOTATION_LABEL} annotation; none found`);

  const bookCount = Object.keys(books).length;
  const chapterCount = NT_CANON.reduce((n, id) => n + books[id].length, 0);
  if (bookCount !== EXPECTED_NT_BOOKS) throw new Error(`Expected ${EXPECTED_NT_BOOKS} NT books, got ${bookCount}`);
  if (chapterCount !== EXPECTED_NT_CHAPTERS) throw new Error(`Expected ${EXPECTED_NT_CHAPTERS} NT chapters, got ${chapterCount}`);
  if (stats.ntRows !== EXPECTED_NT_VERSES) throw new Error(`Expected ${EXPECTED_NT_VERSES} NT verse rows, got ${stats.ntRows}`);

  const translation = {
    id: 'delitzsch',
    label: 'Delitzsch Hebrew NT (1877)',
    short: 'Delitzsch',
    source: 'eBible.org, heb_vpl.zip (BibleWorks VPL) — "The Holy Bible in Modern Hebrew", translation attributed to Franz Delitzsch (1813–1890), public domain. New Testament only; the same package\'s unpointed Hebrew OT is recognized but not imported. eBible does not identify the underlying print edition.',
    language: 'he',
    languageName: 'Hebrew',
    direction: 'rtl',
    translator: 'Franz Delitzsch',
    tradition: 'Protestant / Lutheran Hebrew translation of the New Testament',
    firstPublication: 1877,
    license: 'Public Domain',
    printEdition: 'unspecified by eBible',
    editionUncertainty: 'eBible attributes the text to Franz Delitzsch and declares it public domain but does not identify its underlying print edition. This is an unpointed eBible digital text, not a verified transcription of the 1877 first edition and not an ancient Hebrew New Testament manuscript or recovered original.',
    coverage: 'New Testament only (27 books / 260 chapters)',
    description: 'Hebrew translation of the Greek New Testament by Franz Delitzsch, first published in 1877. This unpointed eBible digital text does not identify its underlying print edition.',
    books,
    verseMetadata,
  };
  return { translation, stats };
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Minimal dependency-free ZIP extractor (stored + deflate), used only by
// --download. Node ships zlib but not a zip reader; adding a dependency for a
// one-time acquisition step is not worth it.
function unzip(buffer, destDir) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('ZIP end-of-central-directory not found');
  const count = buffer.readUInt16LE(eocd + 10);
  let off = buffer.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(off) !== 0x02014b50) throw new Error('Bad ZIP central-directory entry');
    const method = buffer.readUInt16LE(off + 10);
    const compSize = buffer.readUInt32LE(off + 20);
    const nameLen = buffer.readUInt16LE(off + 28);
    const extraLen = buffer.readUInt16LE(off + 30);
    const commentLen = buffer.readUInt16LE(off + 32);
    const localOff = buffer.readUInt32LE(off + 42);
    const name = buffer.toString('utf8', off + 46, off + 46 + nameLen);
    if (buffer.readUInt32LE(localOff) !== 0x04034b50) throw new Error('Bad ZIP local header');
    const lNameLen = buffer.readUInt16LE(localOff + 26);
    const lExtraLen = buffer.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const comp = buffer.subarray(dataStart, dataStart + compSize);
    const data = method === 0 ? comp : zlib.inflateRawSync(comp);
    const outPath = path.join(destDir, name);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, data);
    off += 46 + nameLen + extraLen + commentLen;
  }
}

async function acquire(acceptChanged) {
  const tmp = fs.mkdtempSync(path.join(SOURCE_DIR, '.download-'));
  try {
    const zips = {};
    for (const [key, info] of Object.entries(EXPECTED_ARCHIVES)) {
      const res = await fetch(info.url);
      if (!res.ok) throw new Error(`Download failed (${res.status}) for ${info.url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const got = sha256(buf);
      if (got !== info.sha256 && !acceptChanged) {
        throw new Error(
          `Archive hash changed for ${info.url}\n  expected ${info.sha256}\n  got      ${got}\n` +
          `Inspect and document the newer source before accepting it; re-run with --accept-changed-source to import it.`,
        );
      }
      zips[key] = buf;
      console.log(`${key}: ${got === info.sha256 ? 'hash OK' : 'hash CHANGED (accepted)'} (${buf.length} bytes)`);
    }
    unzip(zips.vpl, tmp);
    unzip(zips.usfm, path.join(tmp, 'usfm'));
    // Cache the four inspected VPL members named in source-info.json.
    for (const f of ['heb_vpl.txt', 'heb_vpl.sql', 'heb_vpl.xml', 'heb_about.htm']) {
      fs.copyFileSync(path.join(tmp, f), path.join(SOURCE_DIR, f));
    }
    fs.rmSync(USFM_DIR, { recursive: true, force: true });
    fs.mkdirSync(USFM_DIR, { recursive: true });
    for (const f of fs.readdirSync(path.join(tmp, 'usfm'))) {
      fs.copyFileSync(path.join(tmp, 'usfm', f), path.join(USFM_DIR, f));
    }
    console.log(`Cached source into ${SOURCE_DIR}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function jsonString(translation) {
  return JSON.stringify(translation, null, 2) + '\n';
}

function jsString(translation) {
  return `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['delitzsch']=${JSON.stringify(translation, null, 2)};\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const download = args.includes('--download');
  const acceptChanged = args.includes('--accept-changed-source');
  if (check && download) throw new Error('--check and --download are mutually exclusive (checking must not touch the network)');

  if (download) await acquire(acceptChanged);

  const raw = fs.readFileSync(VPL_TXT, 'utf8');
  const { translation, stats } = buildTranslation(raw);
  const json = jsonString(translation);
  const js = jsString(translation);

  const jsonPath = path.join(dir, '..', 'data', 'delitzsch.json');
  const jsPath = path.join(dir, '..', 'data', 'delitzsch.js');

  if (check) {
    // Git may check generated files out with CRLF on Windows. Verify their
    // content without treating the checkout's line endings as corpus changes.
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8').replace(/\r\n/g, '\n') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date with the cached source (run node build/import-delitzsch.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date with the cached source (run node build/import-delitzsch.mjs)`);
    console.log(`delitzsch --check OK: ${EXPECTED_NT_BOOKS} NT books, ${EXPECTED_NT_CHAPTERS} chapters, ${stats.ntRows} verse rows; JSON and JS match the cached source.`);
    return;
  }

  writeTranslation(translation);
  fs.writeFileSync(jsPath, js);
  console.log(`Wrote ${jsPath}`);
  console.log(`Imported ${EXPECTED_NT_BOOKS}/27 NT books (${EXPECTED_NT_CHAPTERS} chapters, ${stats.ntRows} verse rows); excluded ${stats.otRows} OT rows.`);
  console.log(`Next: node build/validate.mjs data/delitzsch.json && node build/validate-delitzsch.mjs`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message || error); process.exit(1); });
}
