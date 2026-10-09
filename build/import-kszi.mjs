import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readKsziUsfm } from './kszi-usfm.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/kszi');
export const ARCHIVE_SHA256 = '9965c3bba4ff8a32661dfa4ced01b502bead7c316eaed26908b2dbd678f72239';
export const MANIFEST_SHA256 = '7ea65ff64cbd8105c81f44d81676ed713b3b0319240331934aeca51f2d026836';
export const BOOK_IDS = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('KSZI manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.files.length !== 41 || manifest.archives[0].sha256 !== ARCHIVE_SHA256) throw new Error('KSZI source profile changed');
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe KSZI path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`KSZI source hash mismatch: ${entry.path}`);
  }
  return manifest;
}
const put = (obj, b, c, item) => { obj[b] ||= {}; obj[b][c] ||= []; obj[b][c].push(item); };
export function loadAndBuild() {
  const manifest = verifySource();
  const metadata = new XMLParser().parse(fs.readFileSync(path.join(SOURCE_DIR, 'usfx/zlmKSZImetadata.xml'), 'utf8')).DBLMetadata;
  if (String(metadata.identification.dateCompleted) !== '2013' || metadata.language.iso !== 'zlm' || metadata.identification.scope !== 'NT' || metadata.identification.abbreviationLocal !== 'KSZI') throw new Error('KSZI package identity changed');
  const licence = fs.readFileSync(path.join(SOURCE_DIR, 'copyright.htm'), 'utf8');
  if (!licence.includes('creativecommons.org/licenses/by-nd/4') || !licence.includes('2013 Pengamat Kitab Mulia')) throw new Error('KSZI licence evidence mismatch');
  const books = {}, bookMetadata = {}, verseMetadata = {}, sourceRecords = {}, sourceNotes = {}, sourceHeadings = {}, psalmHeadings = {}, sourceChapterLabels = {}, versification = {};
  const inventory = { books: 0, chapters: 0, records: 0, combined: 0, numberedPositions: 0, footnotes: 0, headings: 0, superscriptions: 0, withinVerseHeadings: 0, gaps: [] };
  function except(id, c, reason) {
    versification[id] ||= {}; versification[id][c] ||= { comparisonUnavailable: true, note: reason };
  }
  for (const id of BOOK_IDS) {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(SOURCE_DIR, 'usfm/' + fs.readdirSync(path.join(SOURCE_DIR, 'usfm')).find(f => f.endsWith('-' + id + 'zlmKSZI.usfm')))));
    const parsed = readKsziUsfm(source);
    if (parsed.metadata.id.split(/\s+/)[0] !== id) throw new Error(`KSZI edition identity mismatch: ${id}`);
    books[id] = []; bookMetadata[id] = parsed.metadata; sourceChapterLabels[id] = parsed.chapterLabels;
    let chapter = 0, end = 0;
    for (const record of parsed.records) {
      if (record.chapter !== chapter) {
        if (record.chapter !== chapter + 1) throw new Error('Noncontiguous KSZI chapters');
        chapter = record.chapter; end = 0; books[id].push([]); inventory.chapters++;
      }
      if (record.verse <= end) throw new Error(`Overlapping KSZI reference ${id}.${chapter}.${record.label}`);
      verseMetadata[id] ||= {}; verseMetadata[id][chapter] ||= {};
      for (let v = end + 1; v < record.verse; v++) {
        books[id][chapter - 1].push(''); inventory.gaps.push(`${id}.${chapter}.${v}`);
        verseMetadata[id][chapter][v] = { status: 'source-gap', note: 'The source has no numbered main text here. No Scripture was supplied or inferred; source notes are retained below.' };
      }
      books[id][chapter - 1].push(record.text); inventory.records++;
      put(sourceRecords, id, chapter, { label: record.label, start: record.verse, end: record.end, text: record.text });
      if (record.end > record.verse) {
        inventory.combined++;
        verseMetadata[id][chapter][record.verse] = { sourceLabel: record.label, rangeEnd: record.end, note: `KSZI labels this complete passage ${chapter}:${record.label}; its words remain together.` };
        for (let v = record.verse + 1; v <= record.end; v++) {
          books[id][chapter - 1].push('');
          verseMetadata[id][chapter][v] = { status: 'combined-member', combinedInto: record.verse, sourceLabel: record.label };
        }
        except(id, chapter, 'KSZI has combined source verse ranges in this chapter. They are displayed as complete labelled units without splitting or duplicating their words.');
      }
      end = record.end;
    }
    for (const heading of parsed.headings) {
      const entry = { text: heading.text, afterVerse: heading.afterVerse, type: heading.marker === 'd' ? 'superscription' : ['r', 'mr'].includes(heading.marker) ? 'section-reference' : heading.marker === 'sp' ? 'speaker' : 'section', sourceMarker: heading.marker };
      if (heading.withinVerse) { entry.withinVerse = heading.withinVerse; inventory.withinVerseHeadings++; }
      if (!entry.text) throw new Error('Empty KSZI heading');
      if (heading.marker === 'd') { put(psalmHeadings, id, heading.chapter, entry); inventory.superscriptions++; }
      else { put(sourceHeadings, id, heading.chapter, entry); inventory.headings++; }
    }
    for (const note of parsed.notes) {
      if (note.type !== 'footnote') throw new Error('Unexpected KSZI non-footnote content');
      put(sourceNotes, id, note.chapter, note); inventory.footnotes++;
    }
    if (parsed.annotationMarkers.length) throw new Error('Unexpected KSZI annotation marker');
    inventory.books++;
  }
  inventory.numberedPositions = Object.values(books).flat().reduce((n, c) => n + c.length, 0);
  except('3JN', 1, 'KSZI retains 15 source verses in 3 John; Maranatha’s navigation canon uses 14. No source boundary is collapsed.');
  except('ROM', 14, 'KSZI retains the doxology at Romans 16:25–27; WEB places it at Romans 14:24–26. This chapter is read independently.');
  const canonContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/canon.js'), 'utf8'), canonContext);
  for (const [id, chapters] of Object.entries(versification)) for (const [c, entry] of Object.entries(chapters)) {
    entry.source = books[id][Number(c) - 1].length;
    entry.canon = canonContext.window.MARANATHA_CANON.books.find(b => b.id === id).chapters[Number(c) - 1];
  }
  if (inventory.books !== 27 || inventory.chapters !== 260 || inventory.records !== 7958 || inventory.numberedPositions !== 7958 || inventory.combined !== 0 || inventory.footnotes !== 0 || inventory.headings !== 733 || inventory.superscriptions !== 0 || inventory.withinVerseHeadings !== 5 || inventory.gaps.length) throw new Error('KSZI source inventory changed');

  return {
    id: 'kszi', short: 'KSZI', label: 'Kitab Suci Zabur dan Injil (Malay NT, 2013)', language: 'ms', sourceLanguage: 'zlm', languageName: 'Malay (Malaysia)', direction: 'ltr',
    originalTitle: 'Kitab Suci Zabur dan Injil', scope: 'NT',
    sourcePublisher: 'Pengamat Kitab Mulia; distributed by eBible.org', sourceEdition: 'Contextualized Malay NT, copyright 2013', sourceUrl: manifest.source,
    sourceArchiveSha256: ARCHIVE_SHA256, sourceManifestSha256: MANIFEST_SHA256, sourceRetrievalDate: manifest.retrieved, sourcePackageHasMetadataXml: true,
    sourceLicenceUrl: 'https://ebible.org/zlmKSZI/copyright.htm', license: 'CC BY-ND 4.0', copyright: 'Copyright © 2013 Pengamat Kitab Mulia',
    source: 'eBible.org zlmKSZI USFM/USFX archives retrieved 2026-10-09, retained unchanged and hash-pinned. Package metadata identifies KSZI, copyright 2013, Malay zlm, Latin script and NT-only coverage. Original copyright/licence documents are retained. See data/LICENSE-kszi.md.',
    description: 'Malaysian Malay New Testament, 27 books only. Isa al-Masih, Yahya and all original wording/punctuation remain unchanged. No Psalms or other Old Testament text is included despite Zabur in the title. Source headings are collapsed below Scripture. Ordinary chapters share reference comparison rows; 3 John and Romans 14 read separately.',
    conversionNote: 'Technical format conversion only: USFM styles/reference attributes are removed from display and paragraph boundaries become line breaks. All original words and punctuation remain unchanged. Headings and original source bytes are retained separately. No Scripture is translated, edited, split, duplicated or inferred. The original work remains CC BY-ND 4.0.',
    nativeVersification: false, nativeReferenceScope: true, collapseSourceAnnotations: true,
    referenceComparison: 'matching publisher indexed references; not semantic correspondence or translation-accuracy certification',
    versification, books, bookMetadata, verseMetadata, sourceRecords, sourceNotes, sourceHeadings, psalmHeadings, sourceChapterLabels, sourceInventory: inventory,
  };
}
export function serialize(data) { return { json: JSON.stringify(data, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.kszi=${JSON.stringify(data, null, 2)};\n` }; }
function main() {
  const data = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(data.sourceInventory, null, 2)); return; }
  for (const [ext, text] of Object.entries(serialize(data))) {
    const filename = path.join(ROOT, `data/kszi.${ext}`);
    if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale KSZI output: ${filename}`); }
    else fs.writeFileSync(filename, text);
  }
  console.log('KSZI: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
