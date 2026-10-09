import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readTcvUsfm } from './tcv-usfm.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/tcv');
export const MANIFEST_SHA256 = '277941233c65d0c035169e533ea21fd746ab1336ec60744e63a5d8fceb8d1197';
export const ARCHIVE_SHA256 = '0d0241c3436b2015f452c7e6a1078e8101a0193b7d4049125675d6e9adb264ed';
export const BOOK_IDS = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const EMPTY_REFS = 'ACT.8.37 ACT.15.34 ACT.24.7 ACT.28.29 JHN.5.4 LUK.17.36 LUK.23.17 MAT.17.21 MAT.18.11 MAT.23.14 MRK.7.16 MRK.9.44 MRK.9.46 MRK.11.26 MRK.15.28 ROM.16.24'.split(' ');
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('TCV manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.files.length !== 68 || manifest.archiveSha256 !== ARCHIVE_SHA256) throw new Error('TCV source profile changed');
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe TCV path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`TCV source hash mismatch: ${entry.path}`);
  }
  return manifest;
}
const put = (obj, b, c, item) => { obj[b] ||= {}; obj[b][c] ||= []; obj[b][c].push(item); };
export function loadAndBuild() {
  const manifest = verifySource();
  const books = {}, bookMetadata = {}, verseMetadata = {}, sourceNotes = {}, sourceHeadings = {}, psalmHeadings = {}, sourceStructuralMarkers = {}, sourceChapterLabels = {};
  const inventory = { books: 0, chapters: 0, records: 0, mainTextRecords: 0, footnotes: 0, editorialNotes: 0, unnumberedParagraphs: 0, headings: 0, superscriptions: 0, superscriptionMarkers: 0, withinVerseHeadings: 0, repeatedFootnoteMarkers: 0, zeroWidthSpaces: 0, emptyRefs: [] };
  for (const id of BOOK_IDS) {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(SOURCE_DIR, `usfm/${id}.usfm`)));
    const parsed = readTcvUsfm(source);
    if (parsed.metadata.id.split(/\s+/)[0] !== id || !parsed.metadata.id.includes('Biblica® Open Thai Common Version 2025') || parsed.metadata.rem !== 'Copyright © 2025 by Biblica, Inc.') throw new Error(`TCV edition identity mismatch: ${id}`);
    books[id] = []; bookMetadata[id] = parsed.metadata; sourceChapterLabels[id] = parsed.chapterLabels;
    let chapter = 0, verse = 0;
    for (const record of parsed.records) {
      if (record.chapter !== chapter) {
        if (record.chapter !== chapter + 1 || record.verse !== 1) throw new Error('Noncontiguous TCV references');
        chapter = record.chapter; verse = 0; books[id].push([]); inventory.chapters++;
      }
      if (record.verse !== verse + 1) throw new Error(`Duplicate/gapped TCV verse ${id}.${chapter}.${record.verse}`);
      verse = record.verse; books[id][chapter - 1].push(record.text); inventory.records++;
      inventory.zeroWidthSpaces += [...record.text.matchAll(/\u200B/g)].length;
      if (record.text) inventory.mainTextRecords++;
      else {
        inventory.emptyRefs.push(`${id}.${chapter}.${verse}`);
        verseMetadata[id] ||= {}; verseMetadata[id][chapter] ||= {};
        verseMetadata[id][chapter][verse] = { status: 'source-gap', note: 'This numbered source position has no main verse text. Source notes are available below; no Scripture text was supplied or inferred.' };
      }
    }
    for (const heading of parsed.headings) {
      const entry = { text: heading.text, afterVerse: heading.afterVerse, type: heading.marker === 'd' ? 'superscription' : ['r', 'mr'].includes(heading.marker) ? 'section-reference' : heading.marker === 'sp' ? 'speaker' : 'section', sourceMarker: heading.marker };
      if (heading.withinVerse) { entry.withinVerse = heading.withinVerse; inventory.withinVerseHeadings++; }
      if (heading.marker === 'd') inventory.superscriptionMarkers++;
      if (!entry.text) { put(sourceStructuralMarkers, id, heading.chapter, { marker: heading.marker, afterVerse: heading.afterVerse }); continue; }
      if (heading.marker === 'd') { put(psalmHeadings, id, heading.chapter, entry); inventory.superscriptions++; }
      else { put(sourceHeadings, id, heading.chapter, entry); inventory.headings++; }
    }
    for (const note of parsed.notes) {
      put(sourceNotes, id, note.chapter, note);
      if (note.type === 'footnote') inventory.footnotes++;
      else if (note.type === 'editorial') inventory.editorialNotes++;
      else inventory.unnumberedParagraphs++;
    }
    for (const marker of parsed.annotationMarkers) { put(sourceStructuralMarkers, id, marker.chapter, marker); inventory.repeatedFootnoteMarkers++; }
    inventory.books++;
  }
  if (inventory.books !== 66 || inventory.chapters !== 1189 || inventory.records !== 31103 || inventory.mainTextRecords !== 31087 || inventory.footnotes !== 3211 || inventory.editorialNotes !== 3 || inventory.unnumberedParagraphs !== 1 || inventory.headings !== 2491 || inventory.superscriptions !== 117 || inventory.superscriptionMarkers !== 118 || inventory.withinVerseHeadings !== 27 || inventory.repeatedFootnoteMarkers !== 5) throw new Error('TCV source inventory changed');
  if (JSON.stringify([...inventory.emptyRefs].sort()) !== JSON.stringify([...EMPTY_REFS].sort())) throw new Error('TCV empty positions changed');
  return {
    id: 'tcv', short: 'TCV', label: 'Biblica® Open Thai Common Version™ (2025)', language: 'th', languageName: 'Thai', direction: 'ltr',
    originalTitle: 'Biblica® Open Thai Common Version™', originalTitleThai: 'Biblica® พระคริสตธรรมคัมภีร์ ฉบับไทยสามัญแบบเปิด™',
    sourcePublisher: 'Biblica, Inc.', sourceEdition: 'Biblica Open Thai Common Version 2025', sourceUrl: manifest.source,
    sourceArchiveSha256: ARCHIVE_SHA256, sourceManifestSha256: MANIFEST_SHA256, sourceReceivedDate: manifest.received, sourcePackageHasMetadataXml: false,
    sourceLicenceUrl: 'https://www.bible.com/versions/4502', license: 'CC BY-SA 4.0', copyright: 'Copyright © 2025 by Biblica, Inc.',
    source: 'User-supplied Open.Bible TCV 2025 archive, received 2026-10-09, containing 66 USFM files. Source id/rem headers identify this edition and Biblica copyright 2025. The archive has no metadata.xml; CC BY-SA 4.0 and the title/trademark notices are documented from the publisher-supplied edition notice at https://www.bible.com/versions/4502. See data/LICENSE-tcv.md and the authored licence evidence in build/sources/tcv.',
    description: 'Biblica Open Thai Common Version 2025. All 66 books, with publisher verse references and Thai word separators preserved. Sixteen numbered positions contain no main text and are disclosed rather than filled from another edition. Footnotes and headings are accessible below the passage. 3 John has 15 verses; that chapter and Romans 14 are read separately from editions with different boundaries/content placement.',
    conversionNote: 'Technical format conversion: USFM styles and reference attributes are removed from display, paragraph boundaries become line breaks, and source headings/notes are stored separately. Words, punctuation, tone/vowel marks and zero-width spaces are preserved. An unnumbered Jeremiah 39 paragraph remains separate and is never assigned a verse number. No translation, correction, or inferred text was added. Full original source bytes remain available.',
    nativeVersification: false, nativeReferenceScope: true, collapseSourceAnnotations: true,
    referenceComparison: 'matching publisher indexed references; not semantic correspondence or translation-accuracy certification',
    versification: {
      '3JN': { 1: { source: 15, canon: 14, comparisonUnavailable: true, note: 'TCV retains 15 source verses in 3 John; Maranatha’s navigation canon uses 14. The source boundary is not silently collapsed.' } },
      ROM: { 14: { source: 23, canon: 26, comparisonUnavailable: true, note: 'TCV retains the doxology at Romans 16:25–27; WEB places it at Romans 14:24–26. This chapter is read independently.' } },
    },
    books, bookMetadata, verseMetadata, sourceNotes, sourceHeadings, psalmHeadings, sourceStructuralMarkers, sourceChapterLabels, sourceInventory: inventory,
  };
}
export function serialize(data) { return { json: JSON.stringify(data, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.tcv=${JSON.stringify(data, null, 2)};\n` }; }
function main() {
  const data = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(data.sourceInventory, null, 2)); return; }
  for (const [ext, text] of Object.entries(serialize(data))) {
    const filename = path.join(ROOT, `data/tcv.${ext}`);
    if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale TCV output: ${filename}`); }
    else fs.writeFileSync(filename, text);
  }
  console.log('TCV: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
