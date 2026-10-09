// Offline, byte-pinned AYT import. Publisher JSON is the authoritative reading
// text; the matching SFM supplies notes/names and corroborates every verse.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseSfm } from './ayt-sfm.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/ayt');
export const SOURCE_PIN = '8ff5d79c5b0645d634ce6374a2cb0a56a8253cd5';
export const MANIFEST_SHA256 = 'baa84abb253bf70e67c0c6fdb7c37d3db397d563d20988a55532e2aacde9bed6';
export const BOOK_IDS = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const POINTERS = { 'ISA.22.10': '(22:9)', 'ISA.22.11': '(22:9)', 'ISA.22.18': '(22:17)' };
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const compact = text => text.replace(/\s/g, '');
const put = (obj, id, c, entry) => { obj[id] ||= {}; obj[id][c] ||= []; obj[id][c].push(entry); };

export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('AYT manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.commit !== SOURCE_PIN || manifest.files.length !== 72) throw new Error('AYT source pin/file count changed');
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe AYT source path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`AYT source hash mismatch: ${entry.path}`);
  }
  return manifest;
}

export function parseJson(records) {
  if (!Array.isArray(records) || records.length !== 31102) throw new Error('Unexpected AYT record count');
  const books = {}, sourceJsonTitles = {}, verseMetadata = {};
  let previousBook = 0, previousChapter = 0, previousVerse = 0;
  let titleMarkers = 0;
  const pointers = {};
  for (const [i, r] of records.entries()) {
    const b = Number(r.book), c = Number(r.chapter), v = Number(r.verse), id = BOOK_IDS[b - 1];
    if (r.id !== String(i + 1) || !id || !Number.isInteger(c) || !Number.isInteger(v) || c < 1 || v < 1) throw new Error('Invalid AYT record identity');
    if (b !== previousBook) {
      if (b !== previousBook + 1 || c !== 1 || v !== 1) throw new Error('Unexpected AYT book order');
      books[id] = []; previousChapter = 0; previousVerse = 0;
    }
    if (c !== previousChapter) {
      if (c !== previousChapter + 1 || v !== 1) throw new Error('Unexpected AYT chapter order');
      books[id].push([]); previousVerse = 0;
    }
    if (v !== previousVerse + 1) throw new Error(`Duplicate/gapped AYT verse: ${id}.${c}.${v}`);
    if (typeof r.text !== 'string' || typeof r.title !== 'string' || typeof r.abbr !== 'string') throw new Error('Malformed AYT record');
    titleMarkers += [...r.text.matchAll(/<t \/>/g)].length;
    const text = r.text.replace(/<t \/>/g, '');
    if (/<[^>]+>/.test(text) || !text.trim() || /[\uFFFD\u0000]/.test(text)) throw new Error(`Unsupported/empty AYT text: ${id}.${c}.${v}`);
    books[id][c - 1].push(text);
    if (r.title) put(sourceJsonTitles, id, c, { verse: v, text: r.title });
    if (/^\(\d+:\d+\)$/.test(text)) {
      const ref = `${id}.${c}.${v}`; pointers[ref] = text;
      verseMetadata[id] ||= {}; verseMetadata[id][c] ||= {};
      verseMetadata[id][c][v] = { status: 'source-placeholder', note: `The source supplies only this reference pointer. The passage text is preserved at ${text.slice(1, -1)}; no separate verse text was supplied or inferred.` };
    }
    previousBook = b; previousChapter = c; previousVerse = v;
  }
  if (Object.keys(books).length !== 66 || Object.values(books).reduce((n, ch) => n + ch.length, 0) !== 1189 || titleMarkers !== 2603) throw new Error('AYT coverage/title-marker inventory changed');
  if (JSON.stringify(pointers) !== JSON.stringify(POINTERS)) throw new Error('AYT source pointers changed');
  return { books, sourceJsonTitles, verseMetadata };
}

export function loadAndBuild() {
  verifySource();
  const records = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'json/ayt.json'), 'utf8'));
  const parsed = parseJson(records);
  const sourceNotes = {}, sourceHeadings = {}, psalmHeadings = {}, sourceSuperscriptionMarkers = {}, bookMetadata = {}, formatDifferences = [];
  let index = 0, footnotes = 0, crossReferences = 0, headingCount = 0, superscriptions = 0, withinVerseHeadings = 0;
  const files = fs.readdirSync(path.join(SOURCE_DIR, 'sfm/per-books')).filter(f => f.endsWith('.SFM')).sort();
  if (files.length !== 66) throw new Error('AYT SFM coverage changed');
  for (const [b, file] of files.entries()) {
    const id = BOOK_IDS[b];
    const sfm = parseSfm(fs.readFileSync(path.join(SOURCE_DIR, 'sfm/per-books', file), 'utf8'));
    if (sfm.metadata.id !== id) throw new Error('AYT SFM book identity mismatch');
    bookMetadata[id] = sfm.metadata;
    for (const verse of sfm.verses) {
      const r = records[index++], text = parsed.books[id][verse.chapter - 1][verse.verse - 1];
      if (Number(r.book) !== b + 1 || Number(r.chapter) !== verse.chapter || Number(r.verse) !== verse.verse) throw new Error('AYT JSON/SFM reference mismatch');
      if (compact(verse.text) !== compact(text)) {
        const table = verse.formats.some(f => ['tr', 'tc1', 'tcr2'].includes(f));
        const selah = verse.formats.includes('qs');
        const punctuation = table ? /,/g : /[()]/g;
        if ((!table && !selah) || compact(verse.text.replace(punctuation, '')) !== compact(text.replace(punctuation, ''))) throw new Error(`AYT JSON/SFM words differ: ${id}.${verse.chapter}.${verse.verse}`);
        formatDifferences.push({ ref: `${id}.${verse.chapter}.${verse.verse}`, type: table ? 'table commas in publisher JSON' : 'Selah parentheses in publisher JSON', sfmText: verse.text, jsonText: text });
      }
    }
    for (const heading of sfm.headings) {
      const entry = { text: heading.text, afterVerse: heading.afterVerse, type: heading.marker === 'd' ? 'superscription' : ['r', 'mr'].includes(heading.marker) ? 'section-reference' : 'section', sourceMarker: heading.marker };
      if (heading.withinVerse) { entry.withinVerse = heading.withinVerse; withinVerseHeadings++; }
      if (heading.marker === 'd') {
        // These markers have no unnumbered text in this source. The publisher
        // includes the superscription in verse 1; retain it there verbatim.
        put(sourceSuperscriptionMarkers, id, heading.chapter, { afterVerse: heading.afterVerse, marker: 'd' });
        if (entry.text) put(psalmHeadings, id, heading.chapter, entry);
        superscriptions++;
      }
      else { put(sourceHeadings, id, heading.chapter, entry); headingCount++; }
    }
    for (const note of sfm.notes) {
      put(sourceNotes, id, note.chapter, note);
      if (note.type === 'footnote') footnotes++; else crossReferences++;
    }
  }
  if (index !== 31102 || footnotes !== 1665 || crossReferences !== 147 || headingCount !== 2939 || superscriptions !== 116 || withinVerseHeadings !== 2 || formatDifferences.length !== 78) throw new Error('AYT annotation/format inventory changed');
  const versification = {
    ROM: { 14: { source: 23, canon: 26, comparisonUnavailable: true, note: 'AYT retains the closing doxology at Romans 16:25–27, following its KJV-shaped reference grid. WEB places it at Romans 14:24–26; this chapter is read independently.' } },
    ISA: { 22: { source: 25, canon: 25, comparisonUnavailable: true, note: 'The source groups text at 22:9 and 22:17 and supplies only reference pointers at 22:10, 22:11 and 22:18. Separate verse-by-verse correspondence is not supplied for this chapter.' } },
  };
  return {
    id: 'ayt', label: 'Alkitab Yang Terbuka (Indonesian)', short: 'AYT', language: 'id', languageName: 'Indonesian', direction: 'ltr',
    sourcePublisher: 'Yayasan Lembaga SABDA (YLSA)', sourceUrl: 'https://github.com/sabdacode/ayt', sourcePin: SOURCE_PIN, sourceManifestSha256: MANIFEST_SHA256, sourceRetrievalDate: '2026-10-09',
    sourceEdition: 'Publisher AYT repository snapshot; licence identifies NT/OT work through 2024',
    license: 'Publisher non-commercial redistribution / BY-NC-SA terms (no version specified)',
    source: `YLSA official AYT repository, pinned commit ${SOURCE_PIN}. Copyright YLSA-AYT 2011,2024. The publisher permits non-commercial use/distribution and describes derivative resources under BY/NC/SA terms, without specifying a numbered Creative Commons version. The verbatim licence is preserved in build/sources/ayt/LICENSE.html and attribution in data/LICENSE-ayt.md.`,
    description: 'Indonesian AYT from the official YLSA datasets. 66 books; compared by matching publisher book/chapter/verse references. Copyright retained by YLSA; non-commercial distribution only, with attribution and share-alike terms. Three Isaiah 22 records contain reference pointers only. Isaiah 22 and Romans 14 are read separately because their verse content placement differs.',
    conversionNote: 'Reading text is the publisher JSON verbatim except removal of its <t /> heading-placement markers. Notes, headings and book labels come from the same commit’s SFM. Every SFM/JSON reference and base verse is cross-checked; 78 publisher formatting differences (Selah parentheses and table commas) are disclosed and JSON wording/punctuation is preserved. No words are corrected or inferred.',
    nativeVersification: false, nativeReferenceScope: true, referenceComparison: 'matching publisher reference identifiers; not a claim of identical content or semantic certification',
    collapseSourceAnnotations: true,
    ...parsed, sourceNotes, sourceHeadings, psalmHeadings, sourceSuperscriptionMarkers, bookMetadata, sourceFormatDifferences: formatDifferences, versification,
    sourceInventory: { books: 66, chapters: 1189, records: 31102, titleMarkers: 2603, sourceHeadings: headingCount, superscriptionMarkers: superscriptions, withinVerseHeadings, footnotes, crossReferences, formatDifferences: formatDifferences.length, referencePointers: Object.keys(POINTERS) },
  };
}

export function serialize(data) {
  return { json: JSON.stringify(data, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.ayt=${JSON.stringify(data, null, 2)};\n` };
}
function main() {
  const data = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(data.sourceInventory, null, 2)); return; }
  for (const [ext, text] of Object.entries(serialize(data))) {
    const filename = path.join(ROOT, `data/ayt.${ext}`);
    if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale AYT file: ${filename}`); }
    else fs.writeFileSync(filename, text);
  }
  console.log('AYT: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
