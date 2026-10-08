// import-vulgata-clementina.mjs
//
// Deterministic, offline importer for the Latin Clementine Vulgate (1598)
// published by eBible.org as edition "latVUC".
//
//   node build/import-vulgata-clementina.mjs            # regenerate data/vulc.json + data/vulc.js
//   node build/import-vulgata-clementina.mjs --check    # verify only; write/download nothing
//   node build/import-vulgata-clementina.mjs --report   # bounded inventory / defects report to stdout
//
// SOURCE (already cached in the repository; no network is ever used):
//   build/sources/vulgata-clementina/latVUC_usfx.zip
//     SHA-256 4af9ec883815c05c0d90fe3a65dc32f32432a646db0247b185cc7a2d89fe53a7
//   extracted/latVUC_usfx.xml  (+ latVUCmetadata.xml, BookNames.xml, copr.htm, details.html)
//   https://ebible.org/find/details.php?id=latVUC  (retrieved 2026-10-08)
//
// The publisher labels this edition Public Domain. It is the Clementine
// Vulgate of 1598 as printed with the Glossa Ordinaria (Migne edition 1880).
// It is NOT the Nova Vulgata and must never be presented as such.
//
// PARSER CONTRACT (fast-xml-parser):
//   preserveOrder:true, parseTagValue:false, parseAttributeValue:false,
//   trimValues:false. Ordered nodes are walked in document order; values are
//   never coerced to numbers and text is never Unicode-normalized. The only
//   deliberate transformation is collapsing runs of ASCII whitespace inside a
//   verse to a single space and trimming its ends (documented; no character
//   is added, removed or re-spelled).
//
// COMMENTARY: the Glossa Ordinaria lives in <f> elements (fr/fk/ft). It is
//   counted and then discarded — NEVER appended to Scripture. Any tag outside
//   the inspected whitelist aborts the import rather than dropping text.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const SOURCE_DIR = path.join(dir, 'sources', 'vulgata-clementina');
export const XML_PATH = path.join(SOURCE_DIR, 'extracted', 'latVUC_usfx.xml');
export const ZIP_PATH = path.join(SOURCE_DIR, 'latVUC_usfx.zip');
export const METADATA_PATH = path.join(SOURCE_DIR, 'extracted', 'latVUCmetadata.xml');

export const SOURCE_SHA256 = '4af9ec883815c05c0d90fe3a65dc32f32432a646db0247b185cc7a2d89fe53a7';

// Independently established from build/audit-vulgata-source.mjs.
export const EXPECTED_BOOKS = 73;
export const EXPECTED_CHAPTERS = 1334;
export const EXPECTED_VERSES = 35809;
export const EXPECTED_NOTES = 13775;

// Canon IDs the source is allowed to use (data/canon.js). Any other id aborts.
export const CANON_IDS = new Set([
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI',
  '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
  'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP',
  'HAG', 'ZEC', 'MAL', 'TOB', 'JDT', 'WIS', 'SIR', 'BAR', '1MA', '2MA', 'MAT', 'MRK',
  'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH',
  '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
]);

const KNOWN_BLOCK = new Set(['usfx', 'languageCode', 'book', 'id', 'h', 'toc', 'p', 'c', 'v', 've', 'f', 'q', 'it']);
const INLINE = new Set(['p', 'q', 'it']);

function tagOf(node) {
  return Object.keys(node).find((k) => k !== ':@') || null;
}
function attr(node, name) {
  const a = node[':@'];
  return a ? a['@_' + name] : undefined;
}
function textValue(nodes) {
  if (!Array.isArray(nodes)) return '';
  let out = '';
  for (const node of nodes) {
    const tag = tagOf(node);
    if (tag === '#text') out += node['#text'];
    else if (tag && (INLINE.has(tag) || tag === 'h' || tag === 'toc')) out += textValue(node[tag]);
  }
  return out;
}

// Collects the inline text of a subtree, skipping commentary (<f>) and any
// verse/chapter structure (headings never contain them).
function collectInlineText(nodes) {
  if (!Array.isArray(nodes)) return '';
  let out = '';
  for (const node of nodes) {
    const tag = tagOf(node);
    if (tag === '#text') { out += node['#text']; continue; }
    if (tag === 'f') continue;
    if (INLINE.has(tag)) out += collectInlineText(node[tag]);
    else throw new Error(`Unexpected <${tag}> inside inline text`);
  }
  return out;
}

function normalizeWhitespace(text) {
  return text.replace(/[ \t\r\n]+/g, ' ').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}

// Walks the ordered tree. State machine:
//   book -> chapter -> open verse (text) -> <ve> finalizes the verse.
export function parseVulgata(rawXml, { canon = CANON_IDS } = {}) {
  const xml = rawXml.replace(/^\uFEFF/, '');
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    allowBooleanAttributes: true,
  });
  const doc = parser.parse(xml);

  const books = {};
  const bookChapters = {}; // id -> sparse array of verse arrays (index = chapter-1)
  const headings = {};
  const bookOrder = [];
  const inventory = {
    tags: {}, perBook: {}, language: null,
    nonIntegerLabels: [], sequenceErrors: [], unnumbered: [], duplicateRefs: [],
  };
  let book = null;      // { id, notes, chapterCount }
  let chapter = null;   // verses array (index = label-1)
  let chapterIndex = -1;
  let open = null;      // { label, bcv, parts: [] }
  let verseCount = 0;
  let noteCount = 0;

  const finalizeVerse = () => {
    if (!open) return;
    const text = normalizeWhitespace(open.parts.join(''));
    if (!text) throw new Error(`Empty verse text at ${book.id} ${open.bcv}`);
    if (text.includes('\uFFFD')) throw new Error(`U+FFFD in ${book.id} ${open.bcv}`);
    if (open.label - 1 in chapter) {
      inventory.duplicateRefs.push(`${book.id} ${open.bcv}`);
      throw new Error(`Duplicate verse label ${open.label} in ${book.id}`);
    }
    chapter[open.label - 1] = text;
    open = null;
  };

  const walk = (nodes) => {
    for (const node of nodes) {
      const tag = tagOf(node);
      if (tag === '#text') {
        if (open) open.parts.push(node['#text']);
        else if (chapter && node['#text'].trim()) inventory.unnumbered.push(`${book.id}:${node['#text'].trim().slice(0, 40)}`);
        continue;
      }
      if (tag === '?xml') continue; // XML declaration
      if (!tag || !KNOWN_BLOCK.has(tag)) throw new Error(`Unknown tag <${tag}>`);
      inventory.tags[tag] = (inventory.tags[tag] || 0) + 1;
      switch (tag) {
        case 'usfx': walk(node.usfx); break;
        case 'languageCode': inventory.language = textValue(node.languageCode).trim(); break;
        case 'book': {
          const id = attr(node, 'id');
          if (id === undefined) throw new Error('book without id');
          if (!canon.has(id)) throw new Error(`Source book id ${id} is not in the canon`);
          if (Object.hasOwn(bookChapters, id)) throw new Error(`Duplicate source book ${id}`);
          if (book) throw new Error('Nested <book> not supported');
          book = { id, notes: 0, chapters: [] };
          chapter = null; chapterIndex = -1; open = null;
          bookChapters[id] = book.chapters;
          books[id] = [];
          bookOrder.push(id);
          walk(node.book);
          finalizeVerse();
          inventory.perBook[id] = {
            chapters: book.chapters.length,
            verses: book.chapters.reduce((n, c) => n + c.length, 0),
            notes: book.notes,
          };
          book = null; chapter = null; chapterIndex = -1;
          break;
        }
        case 'id': break; // <id id="GEN"> book identifier element
        case 'h':
        case 'toc': {
          const text = normalizeWhitespace(textValue(node[tag]));
          if (text) {
            const entry = { kind: tag, text };
            const level = attr(node, 'level');
            if (level !== undefined) entry.level = level;
            (headings[book.id] ||= []).push(entry);
          }
          break;
        }
        case 'p': {
          const sfm = attr(node, 'sfm');
          if (sfm === 'mt' || sfm === 'mt1' || sfm === 'mt2' || sfm === 'mt3') {
            const text = normalizeWhitespace(collectInlineText(node.p));
            if (text) (headings[book.id] ||= []).push({ kind: 'mt', style: attr(node, 'style') || null, text });
          } else {
            walk(node.p);
          }
          break;
        }
        case 'c': {
          finalizeVerse();
          const id = Number(attr(node, 'id'));
          if (!Number.isInteger(id) || id < 1) throw new Error(`Invalid chapter id ${attr(node, 'id')} in ${book.id}`);
          if (id !== book.chapters.length + 1) throw new Error(`Duplicate, missing or out-of-order chapter ${id} in ${book.id}`);
          chapter = [];
          chapterIndex = id - 1;
          book.chapters[id - 1] = chapter;
          if (id !== book.chapters.filter(Boolean).length) {
            inventory.sequenceErrors.push(`${book.id} chapter ${id}: out of order or gap`);
          }
          break;
        }
        case 'v': {
          if (!chapter) throw new Error(`<v> before <c> in ${book.id}`);
          finalizeVerse();
          const label = Number(attr(node, 'id'));
          const bcv = attr(node, 'bcv') || '';
          if (!/^[1-9]\d*$/.test(String(attr(node, 'id')))) inventory.nonIntegerLabels.push(`${book.id}:${attr(node, 'id')}`);
          if (!Number.isInteger(label) || label < 1) throw new Error(`Invalid verse label ${attr(node, 'id')} in ${book.id}`);
          if (label !== chapter.length + 1) throw new Error(`Duplicate, missing or out-of-order verse ${label} in ${book.id}`);
          const m = /^([A-Z0-9]+)\.(\d+)\.(\d+)$/.exec(bcv);
          if (!m || m[1] !== book.id || Number(m[2]) !== chapterIndex + 1 || Number(m[3]) !== label) {
            inventory.sequenceErrors.push(`${book.id}:${bcv} label=${label}`);
            throw new Error(`bcv ${bcv} does not match ${book.id} chapter ${chapterIndex + 1} verse ${label}`);
          }
          open = { label, bcv, parts: [] };
          verseCount += 1;
          break;
        }
        case 've': finalizeVerse(); break;
        case 'f': {
          noteCount += 1;
          book.notes += 1;
          break; // commentary discarded, never merged
        }
        case 'q':
        case 'it': walk(node[tag]); break;
        default: throw new Error(`Unhandled tag <${tag}>`);
      }
    }
  };

  walk(doc);

  // Validate chapter/verse sequences exactly 1..N with no gaps, then densify.
  for (const id of bookOrder) {
    const chs = bookChapters[id];
    for (let ci = 0; ci < chs.length; ci += 1) {
      const arr = chs[ci];
      if (!arr) { inventory.sequenceErrors.push(`${id} chapter ${ci + 1}: missing`); continue; }
      for (let vi = 0; vi < arr.length; vi += 1) {
        if (arr[vi] === undefined) inventory.sequenceErrors.push(`${id} ${ci + 1}:${vi + 1} gap`);
      }
      books[id].push(arr.slice());
    }
  }

  if (inventory.unnumbered.length) {
    // Unnumbered material is preserved in `headings`; anything else must be
    // reported rather than silently attached to a verse.
    throw new Error(`Unnumbered source text outside a verse: ${inventory.unnumbered.slice(0, 3).join(' | ')}`);
  }

  const totalChapters = bookOrder.reduce((n, id) => n + books[id].length, 0);
  const totalVerses = bookOrder.reduce((n, id) => n + books[id].reduce((m, c) => m + c.length, 0), 0);

  return {
    books, headings, bookOrder, inventory,
    counts: { books: bookOrder.length, chapters: totalChapters, verses: totalVerses, notes: noteCount },
  };
}

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

export function buildTranslation(parsed, hashes) {
  const translation = {
    id: 'vulc',
    label: 'Vulgata Clementina (1598)',
    short: 'VULC',
    language: 'la',
    languageName: 'Latin',
    direction: 'ltr',
    translator: 'Jerome (Latin Vulgate); Clementine revision 1592/1598; Glossa Ordinaria, Migne 1880',
    source: 'Biblia Sacra Vulgata Clementina (1598), with the Glossa Ordinaria as printed in the Migne 1880 edition. Published by eBible.org as edition latVUC (https://ebible.org/find/details.php?id=latVUC), retrieved 2026-10-08. Public Domain. This is the Clementine Vulgate, not the Nova Vulgata.',
    sourceEdition: 'Clementine Vulgate (1598) with Glossa Ordinaria (Migne 1880)',
    sourcePublisher: 'eBible.org',
    sourceUrl: 'https://ebible.org/find/details.php?id=latVUC',
    sourcePublished: 1598,
    sourcePrintEditionDate: 1880,
    sourcePublisherRevisionDate: '2014-08-23',
    sourceFilesDate: '2025-12-12',
    sourcePackageGeneratedDate: '2026-10-08',
    sourceRetrievalDate: '2026-10-08',
    sourcePackageRetrieved: '2026-10-08',
    sourceArchiveSha256: SOURCE_SHA256,
    sourceFileSha256: hashes.xml,
    sourceArchiveFileSha256: hashes.zip,
    sourceMetadataSha256: hashes.metadata,
    license: 'Public Domain',
    description: 'Latin Clementine Vulgate (1598), including the deuterocanonical books, published by eBible.org as latVUC. Latin is read in its own native verse numbering; it is not aligned row-for-row with canon-numbered translations. The 1598 Clementine revision is distinct from the Nova Vulgata (1979). Public domain.',
    nativeVersification: true,
    commentaryPolicy: 'The Glossa Ordinaria (Migne 1880) is present in the cached source <f> elements. It is counted and excluded from all verse text; it is never merged into Scripture.',
    books: parsed.books,
    headings: parsed.headings,
    verseMetadata: {},
  };
  return translation;
}

function jsonString(t) { return JSON.stringify(t, null, 2) + '\n'; }
function jsString(t) { return `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['vulc']=${JSON.stringify(t, null, 2)};\n`; }

export function loadAndBuild() {
  const raw = fs.readFileSync(XML_PATH, 'utf8');
  const parsed = parseVulgata(raw);
  const hashes = {
    xml: sha256File(XML_PATH),
    zip: sha256File(ZIP_PATH),
    metadata: sha256File(METADATA_PATH),
  };
  if (hashes.zip !== SOURCE_SHA256) {
    throw new Error(`Cached archive SHA-256 ${hashes.zip} does not match the approved ${SOURCE_SHA256}`);
  }
  if (hashes.xml !== 'f572302e98d5747f701421a74276f9cde5044db7018fb6f24060eebb02c2c15b') throw new Error('Cached XML differs from the approved published source');
  if (hashes.metadata !== '0714ccc64d8f17dbb03b108aafc9327d2922a6edb5ea5fc71abc0feb6da1db33') throw new Error('Cached metadata differs from the approved published source');
  const translation = buildTranslation(parsed, hashes);
  if (parsed.counts.books !== EXPECTED_BOOKS) throw new Error(`Expected ${EXPECTED_BOOKS} books, got ${parsed.counts.books}`);
  if (parsed.counts.chapters !== EXPECTED_CHAPTERS) throw new Error(`Expected ${EXPECTED_CHAPTERS} chapters, got ${parsed.counts.chapters}`);
  if (parsed.counts.verses !== EXPECTED_VERSES) throw new Error(`Expected ${EXPECTED_VERSES} verses, got ${parsed.counts.verses}`);
  if (parsed.counts.notes !== EXPECTED_NOTES) throw new Error(`Expected ${EXPECTED_NOTES} notes, got ${parsed.counts.notes}`);
  return { translation, parsed, hashes };
}

function report(parsed) {
  const c = parsed.counts;
  console.log(`Vulgata Clementina source inventory`);
  console.log(`  language=${parsed.inventory.language} books=${c.books} chapters=${c.chapters} verses=${c.verses} commentaryNotes=${c.notes}`);
  console.log(`  tags=${JSON.stringify(parsed.inventory.tags)}`);
  console.log(`  non-integer labels=${parsed.inventory.nonIntegerLabels.length} sequence errors=${parsed.inventory.sequenceErrors.length} unnumbered=${parsed.inventory.unnumbered.length} duplicates=${parsed.inventory.duplicateRefs.length}`);
  for (const id of parsed.bookOrder) {
    const b = parsed.inventory.perBook[id];
    console.log(`  ${id.padEnd(5)} chapters=${String(b.chapters).padStart(3)} verses=${String(b.verses).padStart(4)} notes=${String(b.notes).padStart(4)}`);
  }
}

function main() {
  const check = process.argv.includes('--check');
  const wantReport = process.argv.includes('--report');
  const { translation, parsed } = loadAndBuild();
  if (wantReport) { report(parsed); return; }

  const json = jsonString(translation);
  const js = jsString(translation);
  const jsonPath = path.join(dir, '..', 'data', 'vulc.json');
  const jsPath = path.join(dir, '..', 'data', 'vulc.js');

  if (check) {
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8').replace(/\r\n/g, '\n') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date (run node build/import-vulgata-clementina.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date (run node build/import-vulgata-clementina.mjs)`);
    console.log(`vulc --check OK: ${translation.books && Object.keys(translation.books).length} books, ${parsed.counts.chapters} chapters, ${parsed.counts.verses} verses, ${parsed.counts.notes} commentary notes excluded.`);
    return;
  }

  writeTranslation(translation);
  fs.writeFileSync(jsPath, js);
  console.log(`Wrote ${jsPath}`);
  console.log(`Imported ${parsed.counts.books} books, ${parsed.counts.chapters} chapters, ${parsed.counts.verses} verses; excluded ${parsed.counts.notes} Glossa commentary notes.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
