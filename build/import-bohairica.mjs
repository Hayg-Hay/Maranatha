import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/bohairica');
export const MANIFEST_SHA256 = 'cf4bfd736e578e4f792070398d9138bd7a606469d88c25a5113b63a66e1ab6fe';
export const BOOK_IDS = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
// The edition supplies a bracketed empty marker, not Scripture, at these
// positions. They are retained verbatim and disclosed; no other record may
// become a bracketed-only placeholder without failing this check.
export const EXPECTED_PLACEHOLDERS = 'MRK.9.44 MRK.9.46 LUK.17.36 ACT.8.37 ACT.28.29 REV.12.18'.split(' ');
const PLACEHOLDER_NOTE = 'The source record at this reference contains only a bracketed marker, not Scripture text. It is shown exactly as supplied; no text was supplied or inferred.';
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readUtf8 = file => new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(file));

export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('Bohairica manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe Bohairica source path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`Bohairica source hash mismatch: ${entry.path}`);
  }
  for (const entry of manifest.font.files) {
    if (!['fonts/NotoSansCoptic-Regular.ttf', 'fonts/NotoSansCoptic-OFL.txt'].includes(entry.path)) throw new Error('Unexpected Coptic font path');
    if (sha256(fs.readFileSync(path.join(ROOT, entry.path))) !== entry.sha256) throw new Error('Coptic font hash mismatch');
  }
  return manifest;
}

// Deliberately limited to the markers actually present in this pinned edition.
// A changed source with notes/styles must fail rather than leak markup or lose words.
export function readBohairicaUsfm(source) {
  if (source.includes('\uFFFD') || source.includes('\0')) throw new Error('Invalid Coptic source Unicode');
  const matches = [...source.matchAll(/\\([a-z]+\d*\*?)[ \t]?/g)];
  if (source.slice(0, matches[0]?.index).trim()) throw new Error('Text before USFM markers');
  const metadata = {}, records = [];
  let chapter = 0, verse = null, context = null;
  const finish = () => {
    if (!verse) return;
    verse.text = verse.parts.join('').trim(); delete verse.parts;
    if (!verse.text || verse.text.includes('\\')) throw new Error('Empty verse or unhandled USFM syntax');
    records.push(verse); verse = null;
  };
  for (let i = 0; i < matches.length; i++) {
    const marker = matches[i][1];
    const value = source.slice(matches[i].index + matches[i][0].length, matches[i + 1]?.index ?? source.length).replace(/\r\n/g, '\n');
    if (['id', 'h', 'toc1', 'toc2', 'mt1'].includes(marker)) {
      if (chapter || value.includes('\\') || Object.hasOwn(metadata, marker)) throw new Error('Unexpected Bohairica header');
      metadata[marker] = value.trim(); context = 'header';
    } else if (marker === 'c') {
      finish();
      if (!/^\s*\d+\s*$/.test(value) || Number(value) !== chapter + 1) throw new Error('Invalid Bohairica chapter');
      chapter = Number(value); context = 'chapter';
    } else if (marker === 'p') {
      if (!chapter || value.trim()) throw new Error('Unexpected paragraph content');
      if (verse) verse.parts.push('\n');
    } else if (marker === 'v') {
      finish();
      const match = value.match(/^([1-9]\d*)\s+([\s\S]*)$/);
      if (!chapter || !match) throw new Error('Unsupported Bohairica verse label');
      verse = { chapter, verse: Number(match[1]), label: match[1], parts: [match[2]] }; context = 'verse';
    } else throw new Error(`Unsupported Bohairica marker ${marker} in ${context}`);
  }
  finish();
  return { metadata, records };
}

export function loadAndBuild() {
  const manifest = verifySource();
  const xml = new XMLParser().parse(readUtf8(path.join(SOURCE_DIR, 'usfx/copbhcmetadata.xml'))).DBLMetadata;
  if (xml.language.iso !== 'cop' || xml.language.scriptDirection !== 'LTR' || xml.identification.scope !== 'NT' || xml.identification.abbreviationLocal !== 'COPBHC') throw new Error('Bohairica package identity mismatch');
  const notice = readUtf8(path.join(SOURCE_DIR, 'copyright.htm'));
  if (!notice.includes('Public Domain') || !notice.includes('Bohairica 1.2 (2006.December.14)')) throw new Error('Bohairica edition notice mismatch');
  const books = {}, bookMetadata = {}, sourceRecords = {}, verseMetadata = {};
  const inventory = { books: 0, chapters: 0, records: 0, numberedPositions: 0, gaps: [], placeholders: [], footnotes: 0, sectionHeadings: 0 };
  const putVerseMetadata = (id, chapter, verse, meta) => {
    verseMetadata[id] ||= {};
    verseMetadata[id][chapter] ||= {};
    verseMetadata[id][chapter][verse] = meta;
  };
  const filenames = fs.readdirSync(path.join(SOURCE_DIR, 'usfm')).filter(f => f.endsWith('.usfm'));
  if (filenames.length !== BOOK_IDS.length) throw new Error('Unexpected Bohairica book file count');
  for (const id of BOOK_IDS) {
    const candidates = filenames.filter(f => f.endsWith(`-${id}copbhc.usfm`));
    if (candidates.length !== 1) throw new Error(`Bohairica book filename mismatch: ${id}`);
    const parsed = readBohairicaUsfm(readUtf8(path.join(SOURCE_DIR, 'usfm', candidates[0])));
    if (parsed.metadata.id !== id) throw new Error('Bohairica book identity mismatch');
    books[id] = []; bookMetadata[id] = parsed.metadata; sourceRecords[id] = {};
    for (const record of parsed.records) {
      if (record.chapter > books[id].length) {
        if (record.chapter !== books[id].length + 1) throw new Error('Noncontiguous chapter');
        books[id].push([]); inventory.chapters++;
      }
      const verses = books[id][record.chapter - 1];
      if (record.verse <= verses.length) throw new Error('Duplicate or backwards verse');
      while (verses.length < record.verse - 1) {
        const v = verses.length + 1;
        inventory.gaps.push(`${id}.${record.chapter}.${v}`); verses.push('');
        putVerseMetadata(id, record.chapter, v, { status: 'source-gap', note: 'The Bohairica source has no numbered text at this reference. No wording has been supplied or inferred.' });
      }
      if (/^\[[^\]]*\]$/.test(record.text)) {
        inventory.placeholders.push(`${id}.${record.chapter}.${record.verse}`);
        putVerseMetadata(id, record.chapter, record.verse, { status: 'source-placeholder', note: PLACEHOLDER_NOTE, text: record.text });
      }
      verses.push(record.text); inventory.records++;
      sourceRecords[id][record.chapter] ||= [];
      sourceRecords[id][record.chapter].push({ label: record.label, start: record.verse, end: record.verse, text: record.text });
    }
    inventory.books++;
  }
  inventory.numberedPositions = Object.values(books).flat().reduce((n, c) => n + c.length, 0);
  if (inventory.books !== 27 || inventory.chapters !== 260 || inventory.records !== 7956 || inventory.numberedPositions !== 7957 || inventory.gaps.join() !== 'ACT.24.7') throw new Error('Bohairica inventory changed');
  if (inventory.placeholders.join() !== EXPECTED_PLACEHOLDERS.join()) throw new Error('Bohairica source placeholders changed');
  return {
    id: 'bohairica', short: 'BOH', label: 'Bohairica (Coptic Bohairic NT, 1.2)', language: 'cop', dialect: 'Bohairic', languageName: 'Coptic (Bohairic)', direction: 'ltr', scope: 'NT',
    originalTitle: 'Bohairica: The Bohairic New Testament in Standardized Form.',
    sourceEdition: 'Bohairica 1.2 (2006.December.14), J. Warren Wells; based on Horner',
    sourcePublisher: 'Distributed by eBible.org as copbhc', sourceUrl: manifest.source, sourceRetrievalDate: manifest.retrieved,
    sourceArchiveSha256: manifest.files.find(f => f.path === 'copbhc_usfm.zip').sha256, sourceManifestSha256: MANIFEST_SHA256,
    sourceLicenceUrl: 'https://ebible.org/copbhc/copyright.htm', license: 'Public Domain (declared by eBible.org)',
    source: 'Horner-based Bohairic Coptic NT standardized by J. Warren Wells, Bohairica 1.2 (2006-12-14). eBible.org copbhc USFM and USFX archives retrieved 2026-10-18, retained unchanged and hash-pinned. Distributor declares Public Domain. See data/LICENSE-bohairica.md.',
    description: 'Bohairic Coptic New Testament, 27 books only. This standardized edition changes paragraphing and punctuation and expands sacred-name abbreviations relative to Horner. It is distinct from Sahidic and is not certified as a current official church edition. Source words and numbering are preserved. Acts 24:7 has no numbered text; six records contain only a bracketed empty marker; 3 John has 15 verses. Independent reading blocks do not assert alignment with other editions.',
    conversionNote: 'Technical USFM conversion only: structural markers are removed, outer formatting whitespace is trimmed and paragraph boundaries become line breaks. Source letters, case, internal spacing and punctuation are unchanged. Source titles remain in book metadata. Bracketed-only records are tagged as source placeholders and shown exactly as supplied. No missing Scripture is filled or rewritten.',
    nativeVersification: true, nativeReferenceScope: true, collapseSourceAnnotations: true,
    books, bookMetadata, sourceRecords, verseMetadata, sourceInventory: inventory,
  };
}

export function buildLocale(data) {
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/locales/en.json'), 'utf8'));
  const locale = { language: 'cop', label: 'Coptic (Bohairic book names)', testaments: en.testaments, books: {} };
  for (const [id, english] of Object.entries(en.books)) {
    const names = data.bookMetadata[id];
    locale.books[id] = names ? { name: names.toc2, aliases: [...new Set([names.h, names.toc1])].filter(n => n && n !== names.toc2) } : english;
  }
  return locale;
}

function main() {
  const data = loadAndBuild(), locale = buildLocale(data);
  const outputs = {
    'data/bohairica.json': JSON.stringify(data, null, 2) + '\n',
    'data/bohairica.js': `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.bohairica=${JSON.stringify(data, null, 2)};\n`,
    'data/locales/cop.json': JSON.stringify(locale, null, 2) + '\n',
    'data/locales/cop.js': `window.MARANATHA_LOCALE_COP=${JSON.stringify(locale)};\n`,
  };
  for (const [file, text] of Object.entries(outputs)) {
    if (process.argv.includes('--check')) {
      if (fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale Bohairica output: ${file}`);
    } else fs.writeFileSync(path.join(ROOT, file), text);
  }
  console.log('Bohairica: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
