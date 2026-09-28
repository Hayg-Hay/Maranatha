// import-berean-interlinear.mjs
//
// Deterministic production importer for the Berean Interlinear Bible NT.
//
// SOURCE
//   Official Word download: https://interlinearbible.com/bib.docx
//   The importer verifies the exact source hash before extracting. A different
//   file is refused (never silently imported). The .docx itself is never
//   committed.
//
// WHAT IT PRODUCES
//   - data/berean/<BOOK>.js        one compact runtime chunk per NT book:
//                                  window.MARANATHA_BEREAN_<BOOK> = { books: { <BOOK>: chapters } }
//                                  token = [surface, transliteration, morphology, strongs, gloss]
//                                  gloss "" is Berean's intentional "-" (untranslated),
//                                  distinct from a missing field (which is an error).
//   - data/berean/manifest.js      tiny runtime metadata (label/attribution/source/books)
//   - build/sources/berean-interlinear/berean-build.json
//                                  build provenance + per-file sha256 (for --check)
//
// WHAT IT DOES *NOT* DO
//   - No tooltip definition is imported (excluded from runtime data).
//   - No alignment to Byzantine tokens; Berean's own Greek order is preserved.
//   - No verse/token order changes: verse numbers are placed at their real
//     index; NA-omitted verses become nulls and must match KNOWN_OMISSIONS.
//
// USAGE
//   node build/import-berean-interlinear.mjs --docx /path/bib.docx
//   node build/import-berean-interlinear.mjs --document /path/word/document.xml
//   node build/import-berean-interlinear.mjs --check          (verify committed output)
//   node build/import-berean-interlinear.mjs --docx /path/bib.docx --check

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from './tools/berean-extract.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(dir, '..');
const OUT_DIR = path.join(ROOT, 'data', 'berean');
const BUILD_META = path.join(dir, 'sources', 'berean-interlinear', 'berean-build.json');

export const EXPECTED_SHA256 = '2d969f0a3831a2edd0e374677fd793dc02808575cf9ed9ba555b6970a3e99352';
export const EXPECTED_TOTAL_TOKENS = 138130;
export const EXPECTED_JOHN_TOKENS = 15660;

// Display name in the document -> Maranatha canonical book id (canon.js order).
const BOOK_ID = {
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
  '3 John': '3JN', Jude: 'JUD', Revelation: 'REV',
};
const NT_ORDER = Object.values(BOOK_ID);

// Verses present in canon.js but absent from the NA-type Berean text. These are
// the well-known UBS/NA omissions; any OTHER gap is treated as an import bug.
const KNOWN_OMISSIONS = {
  MAT: { 17: [21], 18: [11], 23: [14] },
  MRK: { 7: [16], 9: [44, 46], 11: [26], 15: [28] },
  LUK: { 17: [36], 23: [17] },
  JHN: { 5: [4] },
  ACT: { 8: [37], 15: [34], 24: [7], 28: [29] },
  ROM: { 14: [24, 25, 26], 16: [24] },
};

const ATTRIBUTION =
  'Berean Interlinear Bible \u00b7 https://interlinearbible.com/ \u00b7 dedicated to the ' +
  'public domain on April 30, 2023 \u2014 attribution appreciated but not required. ' +
  'Berean uses its own Greek text (NA-type); it is not the Robinson-Pierpont Byzantine text.';
const SOURCE_URL = 'https://interlinearbible.com/bib.docx';

// ---------------------------------------------------------------------------
// Minimal dependency-free zip reader (docx is a zip; document.xml is deflated).
// ---------------------------------------------------------------------------
function readZipEntry(buf, entryName) {
  const EOCD = 0x06054b50;
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
    if (buf.readUInt32LE(i) === EOCD) { eocd = i; break; }
  }
  if (eocd === -1) throw new Error('not a zip/docx: EOCD not found');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === entryName) {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(dataStart, dataStart + compSize);
      return method === 0 ? Buffer.from(data) : zlib.inflateRawSync(data);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`zip entry not found: ${entryName}`);
}

function loadDocumentXml(opts) {
  if (opts.document) {
    return { xml: fs.readFileSync(opts.document, 'utf8'), sourceHash: null };
  }
  if (!opts.docx) throw new Error('supply --docx <bib.docx> or --document <word/document.xml>');
  const buf = fs.readFileSync(opts.docx);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (hash !== EXPECTED_SHA256) {
    throw new Error(
      `refusing to import: bib.docx sha256 ${hash}\n` +
      `expected ${EXPECTED_SHA256}\n` +
      'the official source changed; review it before updating EXPECTED_SHA256.'
    );
  }
  return { xml: readZipEntry(buf, 'word/document.xml').toString('utf8'), sourceHash: hash };
}

// ---------------------------------------------------------------------------
// Transform parsed Berean records into canonical per-book chapters.
// ---------------------------------------------------------------------------
function buildBooks(parsed, canon) {
  const errors = [];
  const books = {};
  const blanks = {};
  const omissions = {};

  for (const [display, id] of Object.entries(BOOK_ID)) {
    const chunk = parsed[display];
    if (!chunk) { errors.push(`missing book in source: ${display}`); continue; }
    const canonBook = canon.books.find((b) => b.id === id);
    const chapters = [];
    let bookBlanks = 0;
    for (let c = 1; c <= canonBook.chapters.length; c++) {
      const expected = canonBook.chapters[c - 1];
      const vs = chunk[c];
      const verseArr = [];
      let maxPresent = 0;
      const present = new Set();
      if (vs) {
        for (const [v, tokens] of Object.entries(vs)) {
          const vn = Number(v);
          present.add(vn);
          maxPresent = Math.max(maxPresent, vn);
        }
      }
      if (!maxPresent) { errors.push(`missing chapter: ${id} ${c}`); chapters.push(null); continue; }
      for (let v = 1; v <= maxPresent; v++) {
        const tokens = vs[v];
        if (!tokens) { verseArr.push(null); continue; }
        verseArr.push(tokens.map((t, i) => {
          if (t.order !== i) errors.push(`${id} ${c}:${v} token order not contiguous`);
          if (t.gloss === '-') bookBlanks++;
          return [t.surface, t.transliteration, t.morphology, t.strongs, t.gloss === '-' ? '' : t.gloss];
        }));
      }
      const gaps = [];
      for (let v = 1; v <= expected; v++) if (!present.has(v)) gaps.push(v);
      const extra = [...present].filter((v) => v > expected);
      const known = (KNOWN_OMISSIONS[id] && KNOWN_OMISSIONS[id][c]) || [];
      if (JSON.stringify(gaps) !== JSON.stringify(known)) {
        errors.push(`${id} ${c}: unexpected verse gaps ${JSON.stringify(gaps)} (known ${JSON.stringify(known)})`);
      }
      if (extra.length) errors.push(`${id} ${c}: verses beyond canon count ${JSON.stringify(extra)}`);
      if (gaps.length) omissions[`${id} ${c}`] = gaps;
      chapters.push(verseArr);
    }
    books[id] = chapters;
    blanks[id] = bookBlanks;
  }
  return { books, blanks, omissions, errors };
}

function validateBooks(books, blanks) {
  const errors = [];
  let total = 0;
  let john = 0;
  for (const [id, chapters] of Object.entries(books)) {
    let bookTokens = 0;
    chapters.forEach((verseArr, ci) => {
      if (!verseArr) return;
      verseArr.forEach((tokens, vi) => {
        if (!tokens) return;
        tokens.forEach((tok, ti) => {
          total++;
          bookTokens++;
          if (id === 'JHN') john++;
          const [surface, translit, morph, strongs, gloss] = tok;
          const where = `${id} ${ci + 1}:${vi + 1}#${ti + 1}`;
          if (!surface) errors.push(`${where}: empty surface`);
          if (!translit) errors.push(`${where}: empty transliteration`);
          if (!morph) errors.push(`${where}: empty morphology`);
          if (!strongs) errors.push(`${where}: empty Strong's`);
          if (!/^\d+$/.test(strongs)) errors.push(`${where}: non-numeric Strong's "${strongs}"`);
          if (gloss === undefined || gloss === null) errors.push(`${where}: gloss field missing`);
        });
      });
    });
    if (blanks[id] === undefined) errors.push(`no blank count for ${id}`);
  }
  if (Object.keys(books).length !== 27) errors.push(`expected 27 books, got ${Object.keys(books).length}`);
  if (total !== EXPECTED_TOTAL_TOKENS) errors.push(`expected ${EXPECTED_TOTAL_TOKENS} tokens, got ${total}`);
  if (john !== EXPECTED_JOHN_TOKENS) errors.push(`expected ${EXPECTED_JOHN_TOKENS} John tokens, got ${john}`);
  const j650 = books.JHN[5][49].length;
  const j651 = books.JHN[5][50].length;
  if (j650 !== 17) errors.push(`John 6:50 expected 17 tokens, got ${j650}`);
  if (j651 !== 38) errors.push(`John 6:51 expected 38 tokens, got ${j651}`);
  return { errors, total, john };
}

// ---------------------------------------------------------------------------
// Deterministic serialization.
// ---------------------------------------------------------------------------
function chunkSource(id, chapters) {
  const obj = { books: { [id]: chapters } };
  return `window.MARANATHA_BEREAN_${id}=${JSON.stringify(obj)};\n`;
}

function manifestSource(meta) {
  const obj = {
    id: 'berean-interlinear',
    label: 'Berean Interlinear Bible (NT)',
    attribution: ATTRIBUTION,
    sourceUrl: SOURCE_URL,
    dedication: 'April 30, 2023',
    books: NT_ORDER,
    tokenCount: meta.totalTokens,
    booksTokenCount: meta.booksTokenCount,
  };
  return `window.MARANATHA_BEREAN_MANIFEST=${JSON.stringify(obj)};\n`;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export function assemble(xml, sourceHash) {
  const canon = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'canon.js'), 'utf8')
      .replace(/^window\.MARANATHA_CANON=/, '').replace(/;\s*$/, '')
  );
  const { books: parsed, anomalies } = parse(xml);
  if (anomalies.length) {
    throw new Error(`extraction anomalies: ${anomalies.length}\n${JSON.stringify(anomalies.slice(0, 5), null, 2)}`);
  }
  const { books, blanks, omissions, errors: buildErrors } = buildBooks(parsed, canon);
  if (buildErrors.length) throw new Error(`book build errors:\n  ${buildErrors.join('\n  ')}`);
  const { errors, total, john } = validateBooks(books, blanks);
  if (errors.length) throw new Error(`validation errors:\n  ${errors.join('\n  ')}`);

  const files = {};
  const booksTokenCount = {};
  for (const id of NT_ORDER) {
    const src = chunkSource(id, books[id]);
    files[`data/berean/${id}.js`] = src;
    booksTokenCount[id] = books[id].reduce((n, ch) => n + (ch ? ch.reduce((m, vs) => m + (vs ? vs.length : 0), 0) : 0), 0) || 0;
  }

  const meta = {
    source: { url: SOURCE_URL, sha256: sourceHash, expectedSha256: EXPECTED_SHA256 },
    tool: 'build/import-berean-interlinear.mjs',
    extractor: 'build/tools/berean-extract.mjs',
    books: NT_ORDER,
    totalTokens: total,
    johnTokens: john,
    booksTokenCount,
    intentionalBlanks: blanks,
    knownOmissions: omissions,
    normalization: {
      compoundSeparators: 'U+00A6/U+2502/| removed inside a display compound (e.g. μή¦γε -> μήγε)',
      glossWhitespace: 'non-breaking/extra whitespace collapsed to single spaces',
      untranslatedMarker: 'visible "-" converted to empty-string gloss (intentional blank, not missing data)',
      definitions: 'tooltip dictionary definitions excluded from runtime data',
      verseIndexing: 'verse numbers kept at their canonical index; NA-omitted verses are null placeholders',
    },
    files: {},
  };
  const manifest = manifestSource(meta);
  files['data/berean/manifest.js'] = manifest;
  for (const [rel, text] of Object.entries(files)) meta.files[rel] = sha256(text);

  return { files, meta };
}

// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = { check: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--check') opts.check = true;
    else if (argv[i] === '--docx') opts.docx = argv[++i];
    else if (argv[i] === '--document') opts.document = argv[++i];
  }
  return opts;
}

function norm(text) { return text.replace(/\r\n/g, '\n'); }

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.check && !opts.docx && !opts.document) {
    // Offline --check: verify committed files match the recorded per-file hashes.
    const meta = JSON.parse(fs.readFileSync(BUILD_META, 'utf8'));
    let bad = 0;
    for (const [rel, hash] of Object.entries(meta.files)) {
      const p = path.join(ROOT, rel);
      if (!fs.existsSync(p)) { console.error(`FAIL missing ${rel}`); bad++; continue; }
      if (sha256(norm(fs.readFileSync(p, 'utf8'))) !== hash) { console.error(`FAIL stale ${rel}`); bad++; }
    }
    if (bad) { console.error(`\n--check: ${bad} problem(s).`); process.exit(1); }
    console.log(`Checked ${Object.keys(meta.files).length} generated files: up to date.`);
    return;
  }

  const { xml, sourceHash } = loadDocumentXml(opts);
  const { files, meta } = assemble(xml, sourceHash);

  if (opts.check) {
    let bad = 0;
    for (const [rel, text] of Object.entries(files)) {
      const p = path.join(ROOT, rel);
      if (!fs.existsSync(p) || norm(fs.readFileSync(p, 'utf8')) !== norm(text)) {
        console.error(`FAIL stale ${rel}`); bad++;
      }
    }
    const metaText = JSON.stringify(meta, null, 2) + '\n';
    if (!fs.existsSync(BUILD_META) || norm(fs.readFileSync(BUILD_META, 'utf8')) !== norm(metaText)) {
      console.error('FAIL stale build metadata'); bad++;
    }
    if (bad) { console.error(`\n--check: ${bad} problem(s).`); process.exit(1); }
    console.log(`Checked ${Object.keys(files).length + 1} generated files: up to date.`);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [rel, text] of Object.entries(files)) {
    fs.writeFileSync(path.join(ROOT, rel), text);
  }
  fs.writeFileSync(BUILD_META, JSON.stringify(meta, null, 2) + '\n');
  const totalBytes = Object.entries(files)
    .filter(([rel]) => rel.startsWith('data/berean/') && rel !== 'data/berean/manifest.js')
    .reduce((n, [rel]) => n + fs.statSync(path.join(ROOT, rel)).size, 0);
  console.log(`Wrote 27 book chunks + manifest + build metadata.`);
  console.log(`  total tokens: ${meta.totalTokens} (John ${meta.johnTokens})`);
  console.log(`  chunk bytes: ${totalBytes} (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
