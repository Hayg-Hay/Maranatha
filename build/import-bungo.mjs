// import-bungo.mjs
//
// Deterministic, offline importer for the Classical Japanese Bible published by
// the CrossWire Bible Society as the SWORD module "JapBungo" (Bungo-yaku /
// Taisho-kaiyaku).
//
//   node build/import-bungo.mjs            # regenerate data/bungo.json + data/bungo.js
//   node build/import-bungo.mjs --check    # verify only; write/download nothing
//   node build/import-bungo.mjs --report   # bounded inventory / defects report to stdout
//
// SOURCE (already cached in the repository; no network is ever used):
//   build/sources/bungo/JapBungo-2.0.zip
//     SHA-256 1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6
//   build/sources/bungo/module/...  (extracted OSIS zText module)
//   build/sources/bungo/sword-canon.h
//     retrieved from https://www.crosswire.org/svn/sword/trunk/include/canon.h
//     (used only as a factual source header for the SWORD index layout;
//      GPLv2, structural header only; app/importer are independently authored)
//   https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=JapBungo
//
// The module is explicitly labelled DistributionLicense=Public Domain. Its
// TextSource (http://bible.salterrae.net/) is presently DNS-unavailable; this
// importer therefore relies on the official pinned CrossWire distribution and
// asserts no new publisher permission and no worldwide public-domain ruling.
//
// zTEXT LAYOUT (verified against this module, never assumed):
//   .bzs  12-byte LE records: compressedOffset, compressedSize, uncompressedSize
//   .bzv  10-byte LE records: block, offsetInUncompressed, byteLength
//   .bzz  raw zlib streams, one per .bzs record
//   There are more blocks than books. The .bzv index interleaves structural
//   records with verse records: a module root, one testament record per
//   testament, one book header per book, one chapter header per chapter, then
//   the verses in the SWORD canon order. Every record is examined, and
//   structural/heading material is preserved separately.
//
// OSIS MARKUP POLICY:
//   The verses carry inline <w gloss="...">reading</w> ruby markup. The base
//   text between the tags is Scripture and is preserved exactly; the markup and
//   the readings are never appended to it. <title type="psalm"> superscription
//   records and book-group titles are preserved as separate headings. Any tag
//   outside the inspected whitelist aborts the import rather than dropping
//   text. No Unicode normalization is applied to Scripture.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export const SOURCE_DIR = path.join(dir, 'sources', 'bungo');
export const ZIP_PATH = path.join(SOURCE_DIR, 'JapBungo-2.0.zip');
export const CONFIG_PATH = path.join(SOURCE_DIR, 'module', 'mods.d', 'japbungo.conf');
export const CANON_HEADER_PATH = path.join(SOURCE_DIR, 'sword-canon.h');
export const ZTEXT_DIR = path.join(SOURCE_DIR, 'module', 'modules', 'texts', 'ztext', 'japbungo');

export const SOURCE_ARCHIVE_SHA256 = '1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6';
export const SOURCE_HEADER_SHA256 = '782e7a603cdfb45ddfd6eed9d31a639929fb928b47c7042d83c8ee9b76af078a';
export const SOURCE_CONFIG_SHA256 = 'dd1eeddcbb18bb944d98e73d8ca5cc8fb0c3799b28a36e076931b3464242981b';

// Extracted-file hashes, pinned so a changed cached module can never be
// silently re-imported.
export const SOURCE_FILE_SHA256 = {
  'module/mods.d/japbungo.conf': SOURCE_CONFIG_SHA256,
  'module/modules/texts/ztext/japbungo/ot.bzs': '8fdfadbcf2f24f06446e2221121344a80fd01a63a28c7ca5c3712883c2fb03ec',
  'module/modules/texts/ztext/japbungo/ot.bzv': 'd25959c597b28e08f2cd004a2ac328f56dd9dd8a85c770cd393c2557506e39cc',
  'module/modules/texts/ztext/japbungo/ot.bzz': 'f18442a5fab6d3843b2691ea38dbbac862823f20fcf7138fa2bc1eb29c73634c',
  'module/modules/texts/ztext/japbungo/nt.bzs': 'aac2f6dd3e994172ff3533ea3ff57949ca0ccf6458d51f32292102548327a2a5',
  'module/modules/texts/ztext/japbungo/nt.bzv': '9e86db4895f616476c662625d5692acff584afaf45d4fda6c1cc9189d21a621e',
  'module/modules/texts/ztext/japbungo/nt.bzz': 'b31cb4a93c7c06d33fe67c90c3ef668c58a60c7f9e298bc9eb883e655d2e1b7a',
};

export const EXPECTED_BOOKS = 66;
export const EXPECTED_CHAPTERS = 1189;
export const EXPECTED_VERSES = 31102;
export const EXPECTED_NONEMPTY_VERSES = 31099;
export const EXPECTED_GLOSSES = 332709;
export const EXPECTED_PSALM_HEADINGS = 139;
// Source-indexed slots that carry no separately indexed text (verified from the
// binary index, not assumed). Stored as empty and disclosed as source gaps.
export const EXPECTED_EMPTY_SLOTS = ['EXO.7.25', '2SA.19.25', '2CH.2.13'];

// The SWORD canon order mapped onto Maranatha's stable ids. This mapping is
// authored here (independent of the source header), not derived from canon.js.
const OT_IDS = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'];
const NT_IDS = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// Parses the factual book/chapter/verse tables out of the SWORD canon header.
// Nothing here is compiled or copied as a runtime library; the header is read
// as source data and its hash is pinned.
export function parseCanonHeader(text) {
  const grabBooks = (name) => {
    const m = text.match(new RegExp(`struct sbook ${name}\\[\\] = \\{([\\s\\S]*?)\\n\\};`));
    if (!m) throw new Error(`Could not find ${name}[] in the SWORD canon header`);
    const books = [];
    for (const line of m[1].split('\n')) {
      const row = line.match(/\{"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*(\d+)\}/);
      if (!row) continue;
      if (row[4] === '0') break; // terminator row
      books.push({ name: row[1], abbrev: row[2], chapters: Number(row[4]) });
    }
    return books;
  };
  const vmMatch = text.match(/int vm\[\] = \{([\s\S]*?)\n\};/);
  if (!vmMatch) throw new Error('Could not find vm[] in the SWORD canon header');
  const vm = vmMatch[1].replace(/\/\/[^\n]*/g, '').match(/\d+/g).map(Number);

  const otBooks = grabBooks('otbooks');
  const ntBooks = grabBooks('ntbooks');
  if (otBooks.length !== OT_IDS.length) throw new Error(`SWORD OT book count ${otBooks.length} != ${OT_IDS.length}`);
  if (ntBooks.length !== NT_IDS.length) throw new Error(`SWORD NT book count ${ntBooks.length} != ${NT_IDS.length}`);

  const layoutBooks = [];
  let offset = 0;
  for (let i = 0; i < otBooks.length; i += 1) {
    const chapters = vm.slice(offset, offset + otBooks[i].chapters);
    offset += otBooks[i].chapters;
    layoutBooks.push({ id: OT_IDS[i], sword: otBooks[i].name, abbrev: otBooks[i].abbrev, testament: 'OT', chapters });
  }
  for (let i = 0; i < ntBooks.length; i += 1) {
    const chapters = vm.slice(offset, offset + ntBooks[i].chapters);
    offset += ntBooks[i].chapters;
    layoutBooks.push({ id: NT_IDS[i], sword: ntBooks[i].name, abbrev: ntBooks[i].abbrev, testament: 'NT', chapters });
  }
  if (offset !== vm.length) throw new Error(`vm[] consumed ${offset} of ${vm.length} entries`);
  const chapters = layoutBooks.reduce((n, b) => n + b.chapters.length, 0);
  const verses = vm.reduce((n, v) => n + v, 0);
  return {
    headerSha256: sha256File(CANON_HEADER_PATH),
    books: layoutBooks,
    counts: { books: layoutBooks.length, chapters, verses },
  };
}

export function readBzs(buf) {
  if (buf.length % 12 !== 0) throw new Error(`.bzs size ${buf.length} is not a multiple of 12`);
  const out = [];
  for (let i = 0; i + 12 <= buf.length; i += 12) {
    out.push({ off: buf.readUInt32LE(i), comp: buf.readUInt32LE(i + 4), un: buf.readUInt32LE(i + 8) });
  }
  return out;
}

export function readBzv(buf) {
  if (buf.length % 10 !== 0) throw new Error(`.bzv size ${buf.length} is not a multiple of 10`);
  const out = [];
  for (let i = 0; i + 10 <= buf.length; i += 10) {
    out.push({ block: buf.readUInt32LE(i), off: buf.readUInt32LE(i + 4), len: buf.readUInt16LE(i + 8) });
  }
  return out;
}

// Decodes one record, rejecting invalid UTF-8 rather than silently replacing it.
export function decodeUtf8(bytes) {
  const text = Buffer.from(bytes).toString('utf8');
  if (text.includes('\uFFFD')) throw new Error('invalid UTF-8 in a zText record');
  return text;
}

// Removes the inspected-and-whitelisted OSIS markup from one verse record while
// preserving the base Scripture text exactly. Returns the base text, the
// separately preserved headings, the gloss count and the per-tag counts. Any
// tag outside the whitelist, any nested markup inside a retained inline tag, or
// any invalid replacement character aborts the import instead of dropping text.
export function stripVerseRecord(raw, ref = 'record') {
  let text = raw;
  const psalmTitles = [];
  const structuralTitles = [];
  const tags = {};
  let glosses = 0;
  const bump = (name) => { tags[name] = (tags[name] || 0) + 1; };
  text = text.replace(/<title\b([^>]*)>([\s\S]*?)<\/title>/g, (whole, attrs, inner) => {
    bump('title');
    if (/<\/?[A-Za-z]/.test(inner)) throw new Error(`Nested markup inside <title> at ${ref}`);
    const typeMatch = attrs.match(/\btype="([^"]*)"/);
    const title = { type: typeMatch ? typeMatch[1] : null, text: inner };
    if (/\bcanonical="true"/.test(attrs)) title.canonical = true;
    if (title.type === 'psalm') psalmTitles.push(title);
    else structuralTitles.push(title);
    return '';
  });
  text = text.replace(/<w\b[^>]*>([\s\S]*?)<\/w>/g, (whole, inner) => {
    bump('w');
    if (/<\/?[A-Za-z]/.test(inner)) throw new Error(`Nested markup inside <w> at ${ref}`);
    glosses += 1;
    return inner;
  });
  text = text.replace(/<w\b[^>]*\/>/g, () => { bump('w'); glosses += 1; return ''; });
  text = text.replace(/<chapter\b[^>]*\/>/g, () => { bump('chapter'); return ''; });
  text = text.replace(/<div\b[^>]*\/>/g, () => { bump('div'); return ''; });
  if (/<[A-Za-z/]/.test(text)) {
    const bad = text.match(/<\/?[A-Za-z][^>]*>/);
    throw new Error(`Unknown markup ${bad && bad[0]} in ${ref}`);
  }
  if (text.includes('\uFFFD')) throw new Error(`U+FFFD in ${ref}`);
  return { text, psalmTitles, structuralTitles, glosses, tags };
}

// Reads one testament: verifies every block bound, decompresses every block,
// walks the .bzv index against the source-header layout and returns the verses,
// headings and inventory. Never assumes book == block.
function readTestament(testament, layoutBooks, ids) {
  const blocks = readBzs(fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzs`)));
  const index = readBzv(fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzv`)));
  const bzz = fs.readFileSync(path.join(ZTEXT_DIR, `${testament}.bzz`));

  let bzzExpected = 0;
  for (const b of blocks) {
    if (b.off + b.comp > bzz.length) throw new Error(`${testament}.bzz block at ${b.off}+${b.comp} exceeds ${bzz.length}`);
    bzzExpected += b.comp;
  }
  if (bzzExpected !== bzz.length) throw new Error(`${testament}.bzz size ${bzz.length} != summed block sizes ${bzzExpected}`);

  const blockCache = new Map();
  const block = (n) => {
    if (n >= blocks.length) throw new Error(`${testament}.bzv references block ${n} of ${blocks.length}`);
    if (!blockCache.has(n)) {
      const e = blocks[n];
      const raw = zlib.inflateSync(bzz.subarray(e.off, e.off + e.comp));
      if (raw.length !== e.un) throw new Error(`${testament} block ${n}: inflated ${raw.length} != declared ${e.un}`);
      blockCache.set(n, raw);
    }
    return blockCache.get(n);
  };
  // The .bzv offsets and lengths are BYTE offsets into the uncompressed block;
  // slice the buffer by bytes, then decode, so multibyte Japanese text is never
  // misaligned. Invalid UTF-8 aborts the import.
  const entry = (i) => {
    const e = index[i];
    const buf = block(e.block);
    if (e.off + e.len > buf.length) throw new Error(`${testament}.bzv entry ${i} exceeds its block`);
    return decodeUtf8(buf.subarray(e.off, e.off + e.len));
  };

  const books = {};
  const psalmHeadings = {};
  const structuralHeadings = [];
  const emptySlots = [];
  const inventory = { tags: {}, glosses: 0, psalmHeadings: 0, structuralTitles: 0, entries: 0, structuralEntries: 0, verseEntries: 0, emptyEntries: 0 };

  let i = 0;
  const root = entry(i); i += 1;
  if (root !== '') throw new Error(`${testament} root record is not empty: ${JSON.stringify(root.slice(0, 40))}`);
  const milestone = entry(i); i += 1;
  if (!/^<milestone\b/.test(milestone)) throw new Error(`${testament} second record is not the module milestone`);
  inventory.structuralEntries += 1;

  const stripVerse = (raw, ref) => {
    const parsed = stripVerseRecord(raw, ref);
    for (const [name, n] of Object.entries(parsed.tags)) {
      inventory.tags[name] = (inventory.tags[name] || 0) + n;
    }
    return parsed;
  };

  let cursor = 0;
  for (const book of layoutBooks) {
    const id = ids[cursor];
    const bookHeader = entry(i); i += 1;
    inventory.entries += 1; inventory.structuralEntries += 1;
    if (!/\btype="book"/.test(bookHeader)) throw new Error(`${testament} ${id}: expected a book header, got ${JSON.stringify(bookHeader.slice(0, 60))}`);
    // A book-group title may be folded into the same record (the OT first book).
    const groupTitle = bookHeader.match(/<title\b([^>]*)>([\s\S]*?)<\/title>/);
    if (groupTitle) {
      inventory.structuralTitles += 1;
      structuralHeadings.push({ scope: 'testament', testament, text: groupTitle[2] });
    }
    if (/<chapter\b/.test(bookHeader)) throw new Error(`${testament} ${id}: book header unexpectedly contains a chapter`);
    books[id] = [];
    psalmHeadings[id] = {};
    for (let ci = 0; ci < book.chapters.length; ci += 1) {
      const chapterHeader = entry(i); i += 1;
      inventory.entries += 1; inventory.structuralEntries += 1;
      if (!/^<chapter\b/.test(chapterHeader)) throw new Error(`${testament} ${id} chapter ${ci + 1}: expected a chapter header, got ${JSON.stringify(chapterHeader.slice(0, 60))}`);
      const verseCount = book.chapters[ci];
      const verses = [];
      for (let vi = 0; vi < verseCount; vi += 1) {
        const ref = `${id}.${ci + 1}.${vi + 1}`;
        const raw = entry(i); i += 1;
        inventory.entries += 1; inventory.verseEntries += 1;
        if (raw === '') {
          inventory.emptyEntries += 1;
          emptySlots.push(ref);
          verses.push('');
          continue;
        }
        const parsed = stripVerse(raw, ref);
        inventory.glosses += parsed.glosses;
        if (parsed.psalmTitles.length) {
          (psalmHeadings[id][ci + 1] ||= []);
          for (const t of parsed.psalmTitles) {
            inventory.psalmHeadings += 1;
            psalmHeadings[id][ci + 1].push({ ...t, verse: vi + 1 });
          }
        }
        for (const t of parsed.structuralTitles) {
          inventory.structuralTitles += 1;
          structuralHeadings.push({ scope: 'verse', ref, text: t.text });
        }
        verses.push(parsed.text);
      }
      books[id].push(verses);
    }
    cursor += 1;
  }
  if (i !== index.length) throw new Error(`${testament}: consumed ${i} of ${index.length} index entries`);
  return { books, psalmHeadings, structuralHeadings, emptySlots, inventory };
}

export function parseModule({ layout } = {}) {
  const canonLayout = layout || parseCanonHeader(fs.readFileSync(CANON_HEADER_PATH, 'utf8'));
  const otBooks = canonLayout.books.filter((b) => b.testament === 'OT');
  const ntBooks = canonLayout.books.filter((b) => b.testament === 'NT');
  const ot = readTestament('ot', otBooks, OT_IDS);
  const nt = readTestament('nt', ntBooks, NT_IDS);

  const books = { ...ot.books, ...nt.books };
  const psalmHeadings = { ...ot.psalmHeadings, ...nt.psalmHeadings };
  // Drop empty per-book heading maps so the data stays compact.
  for (const id of Object.keys(psalmHeadings)) {
    if (!Object.keys(psalmHeadings[id]).length) delete psalmHeadings[id];
  }
  const structuralHeadings = [...ot.structuralHeadings, ...nt.structuralHeadings];
  const emptySlots = [...ot.emptySlots, ...nt.emptySlots];
  const inventory = {
    tags: mergeCounts(ot.inventory.tags, nt.inventory.tags),
    glosses: ot.inventory.glosses + nt.inventory.glosses,
    psalmHeadings: ot.inventory.psalmHeadings + nt.inventory.psalmHeadings,
    structuralTitles: ot.inventory.structuralTitles + nt.inventory.structuralTitles,
    entries: ot.inventory.entries + nt.inventory.entries,
    structuralEntries: ot.inventory.structuralEntries + nt.inventory.structuralEntries,
    verseEntries: ot.inventory.verseEntries + nt.inventory.verseEntries,
    emptyEntries: ot.inventory.emptyEntries + nt.inventory.emptyEntries,
  };
  let chapters = 0;
  let verses = 0;
  let nonEmpty = 0;
  for (const id of Object.keys(books)) {
    for (const ch of books[id]) {
      chapters += 1;
      for (const t of ch) { verses += 1; if (t) nonEmpty += 1; }
    }
  }
  return {
    books, psalmHeadings, structuralHeadings, emptySlots, inventory,
    counts: { books: Object.keys(books).length, chapters, verses, nonEmpty },
    layout: canonLayout,
  };
}

function mergeCounts(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] || 0) + v;
  return out;
}

const SOURCE_DEFECTS = [
  {
    ref: 'EXO.7.25', bookId: 'EXO', chapter: 7, verse: 25, kind: 'empty-indexed-slot',
    disclosure: 'No separately indexed text in this source slot',
    context: 'The adjacent source verse Exodus 7:24 contains the seven-day clause.',
  },
  {
    ref: '2SA.19.25', bookId: '2SA', chapter: 19, verse: 25, kind: 'empty-indexed-slot',
    disclosure: 'No separately indexed text in this source slot',
    context: 'The adjacent source verse 2 Samuel 19:26 contains the arrival clause.',
  },
  {
    ref: '2CH.2.13', bookId: '2CH', chapter: 2, verse: 13, kind: 'empty-indexed-slot',
    disclosure: 'No separately indexed text in this source slot',
    context: 'The adjacent source verse 2 Chronicles 2:12 contains the Hiram-sending clause.',
  },
];

function buildVerseMetadata(parsed) {
  const metadata = {};
  for (const defect of SOURCE_DEFECTS) {
    ((metadata[defect.bookId] ||= {})[String(defect.chapter)] ||= {})[String(defect.verse)] = {
      status: 'source-gap',
      note: defect.disclosure,
      context: defect.context,
      ref: defect.ref,
    };
  }
  return metadata;
}

const SOURCE_TEXT = 'CrossWire Bible Society JapBungo module, version 2.0 (2022-08-17), which packages the Classical Japanese Bible (Bungo-yaku / Taisho-kaiyaku). The Old Testament follows the Meiji translation (1887) and the New Testament the Taisho translation (1917); the module metadata identifies the printed witnesses as the 1953 Old Testament and the 1950 New Testament printings. DistributionLicense=Public Domain; Encoding=UTF-8; SourceType=OSIS; Versification=KJV. Module metadata TextSource=http://bible.salterrae.net/ (presently DNS-unavailable). Official binary distribution: https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JapBungo.zip. This import uses the pinned CrossWire copy and asserts no new Japan Bible Society permission and no worldwide public-domain determination.';

const DESCRIPTION = 'Classical literary Japanese (bungo) Protestant Bible. It is read in the source module\u2019s indexed numbering, which follows the KJV scheme: 66 books, 1189 chapters and 31102 indexed verse slots, of which 31099 carry text. Three source slots (Exodus 7:25, 2 Samuel 19:25, 2 Chronicles 2:13) carry no separately indexed text; they are shown as declared source gaps and are never filled by copying an adjacent verse. Daniel is read in its 12 source chapters, and the deuterocanonical books are not part of this edition. The source-indexed numbering is the faithfully retained reference scheme and is not proof of the printed native labels.';

export function buildTranslation(parsed, hashes) {
  return {
    id: 'bungo',
    label: 'Bungo-yaku (Meiji OT / Taisho NT)',
    short: 'BUNGO',
    language: 'ja',
    languageName: 'Japanese',
    direction: 'ltr',
    translator: 'Meiji-era Old Testament (1887); Taisho-era New Testament (1917)',
    source: SOURCE_TEXT,
    sourceEdition: 'Meiji Old Testament (1887) / Taisho New Testament (1917); printed witnesses OT 1953 / NT 1950',
    sourcePublisher: 'CrossWire Bible Society (JapBungo module 2.0)',
    sourceUrl: 'https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=JapBungo',
    sourceArchiveSha256: hashes.zip,
    sourceHeaderSha256: hashes.header,
    sourceFileSha256: hashes.files,
    sourceRetrievalDate: '2026-10-08',
    license: 'Public Domain',
    description: DESCRIPTION,
    nativeVersification: true,
    nativeReferenceScope: true,
    numberingNotice: 'Bungo-yaku keeps its own source-indexed numbering. Daniel has 12 chapters in this edition and the deuterocanonical books are absent; equal verse numbers are not a verified correspondence with any other translation.',
    glossPolicy: 'The OSIS <w gloss="..."> readings are retained separately from Scripture and are never appended to the base text. Psalm superscriptions and book-group titles are preserved as separate source headings.',
    books: parsed.books,
    headings: {},
    psalmHeadings: parsed.psalmHeadings,
    structuralHeadings: parsed.structuralHeadings,
    verseMetadata: buildVerseMetadata(parsed),
    sourceDefects: SOURCE_DEFECTS.map((d) => ({ ...d })),
    sourceInventory: {
      glosses: parsed.inventory.glosses,
      psalmHeadings: parsed.inventory.psalmHeadings,
      indexedEntries: parsed.inventory.entries,
      structuralEntries: parsed.inventory.structuralEntries,
      verseEntries: parsed.inventory.verseEntries,
      emptyEntries: parsed.inventory.emptyEntries,
    },
  };
}

export function loadAndBuild() {
  const header = fs.readFileSync(CANON_HEADER_PATH, 'utf8');
  const layout = parseCanonHeader(header);
  if (layout.headerSha256 !== SOURCE_HEADER_SHA256) throw new Error(`Cached sword-canon.h differs from the pinned header (${layout.headerSha256})`);
  const hashes = {
    zip: sha256File(ZIP_PATH),
    header: layout.headerSha256,
    files: {},
  };
  for (const rel of Object.keys(SOURCE_FILE_SHA256)) {
    const actual = sha256File(path.join(SOURCE_DIR, rel));
    hashes.files[rel] = actual;
    if (actual !== SOURCE_FILE_SHA256[rel]) throw new Error(`Cached ${rel} differs from the pinned source (${actual})`);
  }
  if (hashes.zip !== SOURCE_ARCHIVE_SHA256) throw new Error(`Cached archive differs from the pinned source (${hashes.zip})`);

  const parsed = parseModule({ layout });
  if (parsed.counts.books !== EXPECTED_BOOKS) throw new Error(`Expected ${EXPECTED_BOOKS} books, got ${parsed.counts.books}`);
  if (parsed.counts.chapters !== EXPECTED_CHAPTERS) throw new Error(`Expected ${EXPECTED_CHAPTERS} chapters, got ${parsed.counts.chapters}`);
  if (parsed.counts.verses !== EXPECTED_VERSES) throw new Error(`Expected ${EXPECTED_VERSES} verse slots, got ${parsed.counts.verses}`);
  if (parsed.counts.nonEmpty !== EXPECTED_NONEMPTY_VERSES) throw new Error(`Expected ${EXPECTED_NONEMPTY_VERSES} non-empty verses, got ${parsed.counts.nonEmpty}`);
  if (parsed.inventory.glosses !== EXPECTED_GLOSSES) throw new Error(`Expected ${EXPECTED_GLOSSES} gloss readings, got ${parsed.inventory.glosses}`);
  if (parsed.inventory.psalmHeadings !== EXPECTED_PSALM_HEADINGS) throw new Error(`Expected ${EXPECTED_PSALM_HEADINGS} psalm headings, got ${parsed.inventory.psalmHeadings}`);
  const empty = [...parsed.emptySlots].sort();
  const expectedEmpty = [...EXPECTED_EMPTY_SLOTS].sort();
  if (JSON.stringify(empty) !== JSON.stringify(expectedEmpty)) throw new Error(`Empty slots ${JSON.stringify(empty)} differ from expected ${JSON.stringify(expectedEmpty)}`);

  const translation = buildTranslation(parsed, hashes);
  return { translation, parsed, hashes };
}

function jsonString(t) { return JSON.stringify(t, null, 2) + '\n'; }
function jsString(t) { return `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['bungo']=${JSON.stringify(t, null, 2)};\n`; }

function report(parsed) {
  const c = parsed.counts;
  console.log('Bungo-yaku (CrossWire JapBungo 2.0) source inventory');
  console.log(`  books=${c.books} chapters=${c.chapters} verseSlots=${c.verses} nonEmpty=${c.nonEmpty} emptySlots=${parsed.inventory.emptyEntries}`);
  console.log(`  glossReadings=${parsed.inventory.glosses} psalmHeadings=${parsed.inventory.psalmHeadings} structuralTitles=${parsed.inventory.structuralTitles}`);
  console.log(`  indexEntries=${parsed.inventory.entries} (structural=${parsed.inventory.structuralEntries}, verse=${parsed.inventory.verseEntries})`);
  console.log(`  tags=${JSON.stringify(parsed.inventory.tags)}`);
  console.log(`  empty slots: ${parsed.emptySlots.join(', ')}`);
  console.log(`  structural headings: ${parsed.structuralHeadings.map((h) => h.text).join(' | ')}`);
}

export function writeIndexLayoutCache(layout) {
  const outPath = path.join(dir, 'cache', 'bungo', 'index-layout.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    generatedFrom: 'build/sources/bungo/sword-canon.h',
    headerSha256: layout.headerSha256,
    counts: layout.counts,
    books: layout.books,
  }, null, 2) + '\n');
  return outPath;
}

function main() {
  const check = process.argv.includes('--check');
  const wantReport = process.argv.includes('--report');
  const { translation, parsed, hashes } = loadAndBuild();
  if (wantReport) { report(parsed); return; }

  const json = jsonString(translation);
  const js = jsString(translation);
  const jsonPath = path.join(dir, '..', 'data', 'bungo.json');
  const jsPath = path.join(dir, '..', 'data', 'bungo.js');

  if (check) {
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8').replace(/\r\n/g, '\n') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date (run node build/import-bungo.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date (run node build/import-bungo.mjs)`);
    console.log(`bungo --check OK: ${parsed.counts.books} books, ${parsed.counts.chapters} chapters, ${parsed.counts.verses} verse slots (${parsed.counts.nonEmpty} with text), ${parsed.inventory.glosses} gloss readings excluded, ${parsed.inventory.psalmHeadings} psalm headings.`);
    return;
  }

  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(jsPath, js);
  writeIndexLayoutCache(parsed.layout);
  console.log(`Wrote ${jsonPath} (${Object.keys(translation.books).length} books)`);
  console.log(`Imported ${parsed.counts.books} books, ${parsed.counts.chapters} chapters, ${parsed.counts.verses} verse slots (${parsed.counts.nonEmpty} with text).`);
  console.log(`Excluded ${parsed.inventory.glosses} ruby/gloss readings; preserved ${parsed.inventory.psalmHeadings} psalm headings and ${parsed.emptySlots.length} declared source gaps.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
