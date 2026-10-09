import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readAsdUsfm } from './asd-usfm.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/asd');
export const ARCHIVE_SHA256 = '68fae4f72a64f9568a1cf90f15a27ec8ac051c2b2cd8b86cae6df115d215a315';
export const MANIFEST_SHA256 = 'c5f0b3ebc351f8ababe906ca53ad9976fb8434969391b3a1ce43015758324549';
export const BOOK_IDS = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('ASD manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.files.length !== 68 || manifest.archiveSha256 !== ARCHIVE_SHA256) throw new Error('ASD source profile changed');
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe ASD path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`ASD source hash mismatch: ${entry.path}`);
  }
  return manifest;
}
const put = (obj, b, c, item) => { obj[b] ||= {}; obj[b][c] ||= []; obj[b][c].push(item); };
export function loadAndBuild() {
  const manifest = verifySource();
  const books = {}, bookMetadata = {}, verseMetadata = {}, sourceRecords = {}, sourceNotes = {}, sourceHeadings = {}, psalmHeadings = {}, sourceChapterLabels = {}, versification = {};
  const inventory = { books: 0, chapters: 0, records: 0, combined: 0, numberedPositions: 0, footnotes: 0, headings: 0, superscriptions: 0, withinVerseHeadings: 0, gaps: [] };
  function except(id, c, reason) {
    versification[id] ||= {}; versification[id][c] ||= { comparisonUnavailable: true, note: reason };
  }
  for (const id of BOOK_IDS) {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(SOURCE_DIR, `usfm/${id}.usfm`)));
    const parsed = readAsdUsfm(source);
    if (parsed.metadata.id.split(/\s+/)[0] !== id || !parsed.metadata.id.includes('Tagalog Contemporary Bible') || parsed.metadata.rem !== 'Copyright © 2009, 2011, 2014, 2025 by Biblica, Inc.') throw new Error(`ASD edition identity mismatch: ${id}`);
    books[id] = []; bookMetadata[id] = parsed.metadata; sourceChapterLabels[id] = parsed.chapterLabels;
    let chapter = 0, end = 0;
    for (const record of parsed.records) {
      if (record.chapter !== chapter) {
        if (record.chapter !== chapter + 1) throw new Error('Noncontiguous ASD chapters');
        chapter = record.chapter; end = 0; books[id].push([]); inventory.chapters++;
      }
      if (record.verse <= end) throw new Error(`Overlapping ASD reference ${id}.${chapter}.${record.label}`);
      verseMetadata[id] ||= {}; verseMetadata[id][chapter] ||= {};
      for (let v = end + 1; v < record.verse; v++) {
        books[id][chapter - 1].push(''); inventory.gaps.push(`${id}.${chapter}.${v}`);
        verseMetadata[id][chapter][v] = { status: 'source-gap', note: 'The source has no numbered main text here. No Scripture was supplied or inferred; source notes are retained below.' };
      }
      books[id][chapter - 1].push(record.text); inventory.records++;
      put(sourceRecords, id, chapter, { label: record.label, start: record.verse, end: record.end, text: record.text });
      if (record.end > record.verse) {
        inventory.combined++;
        verseMetadata[id][chapter][record.verse] = { sourceLabel: record.label, rangeEnd: record.end, note: `ASD labels this complete passage ${chapter}:${record.label}; its words remain together.` };
        for (let v = record.verse + 1; v <= record.end; v++) {
          books[id][chapter - 1].push('');
          verseMetadata[id][chapter][v] = { status: 'combined-member', combinedInto: record.verse, sourceLabel: record.label };
        }
        except(id, chapter, 'ASD has combined source verse ranges in this chapter. They are displayed as complete labelled units without splitting or duplicating their words.');
      }
      end = record.end;
    }
    for (const heading of parsed.headings) {
      const entry = { text: heading.text, afterVerse: heading.afterVerse, type: heading.marker === 'd' ? 'superscription' : ['r', 'mr'].includes(heading.marker) ? 'section-reference' : heading.marker === 'sp' ? 'speaker' : 'section', sourceMarker: heading.marker };
      if (heading.withinVerse) { entry.withinVerse = heading.withinVerse; inventory.withinVerseHeadings++; }
      if (!entry.text) throw new Error('Empty ASD heading');
      if (heading.marker === 'd') { put(psalmHeadings, id, heading.chapter, entry); inventory.superscriptions++; }
      else { put(sourceHeadings, id, heading.chapter, entry); inventory.headings++; }
    }
    for (const note of parsed.notes) {
      if (note.type !== 'footnote') throw new Error('Unexpected ASD non-footnote content');
      put(sourceNotes, id, note.chapter, note); inventory.footnotes++;
    }
    if (parsed.annotationMarkers.length) throw new Error('Unexpected ASD annotation marker');
    inventory.books++;
  }
  inventory.numberedPositions = Object.values(books).flat().reduce((n, c) => n + c.length, 0);
  except('3JN', 1, 'ASD retains 15 source verses in 3 John; Maranatha’s navigation canon uses 14. No source boundary is collapsed.');
  except('ROM', 14, 'ASD retains the doxology at Romans 16:25–27; WEB places it at Romans 14:24–26. This chapter is read independently.');
  except('2CO', 13, 'ASD has 13 verses here: its verse 12 includes the greeting separately numbered 13 in other editions, and its verse 13 is their verse 14. Source boundaries are retained.');
  except('REV', 12, 'ASD places the dragon standing on the seashore at Revelation 12:18; other editions include this at 13:1. Source chapter boundaries are retained.');
  except('REV', 13, 'ASD places the dragon standing on the seashore in Revelation 12:18 rather than 13:1. This chapter is read independently.');
  const canonContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/canon.js'), 'utf8'), canonContext);
  for (const [id, chapters] of Object.entries(versification)) for (const [c, entry] of Object.entries(chapters)) {
    entry.source = books[id][Number(c) - 1].length;
    entry.canon = canonContext.window.MARANATHA_CANON.books.find(b => b.id === id).chapters[Number(c) - 1];
  }
  if (inventory.books !== 66 || inventory.chapters !== 1189 || inventory.records !== 30868 || inventory.combined !== 185 || inventory.numberedPositions !== 31103 || inventory.footnotes !== 2333 || inventory.headings !== 2591 || inventory.superscriptions !== 116 || inventory.withinVerseHeadings !== 30 || inventory.gaps.length) throw new Error('ASD source inventory changed');
  return {
    id: 'asd', short: 'ASD', label: 'Biblica® Open Ang Salita ng Diyos™ (2025)', language: 'tl', languageName: 'Filipino / Tagalog', direction: 'ltr',
    originalTitle: 'Biblica® Open Ang Salita ng Diyos™', originalTitleEnglish: 'Biblica® Open Tagalog Contemporary Bible™',
    sourcePublisher: 'Biblica, Inc.', sourceEdition: 'Open Tagalog Contemporary Bible 2025', sourceUrl: manifest.source,
    sourceArchiveSha256: ARCHIVE_SHA256, sourceManifestSha256: MANIFEST_SHA256, sourceReceivedDate: manifest.received, sourcePackageHasMetadataXml: false,
    sourceLicenceUrl: 'https://www.bible.com/versions/1264', license: 'CC BY-SA 4.0', copyright: 'Copyright © 2009, 2011, 2014, 2025 by Biblica, Inc.',
    source: 'User-supplied Open.Bible ASD USFM archive, received 2026-10-09. Source headers credit 2009, 2011, 2014, 2025 Biblica copyright, matching the publisher edition notice. Some book headers omit Open; all raw headers are retained. The product page lists 2015 instead of 2025; this discrepancy is documented. The archive has no metadata.xml or licence file. See data/LICENSE-asd.md and build/sources/asd/licence-evidence.md.',
    description: 'Modern Filipino/Tagalog Bible: all 66 books. Source words and punctuation are preserved. 185 combined passages remain complete labelled units. Ordinary chapters share reference comparison rows; chapters with combined units or documented boundary/content-placement differences are displayed separately. Notes/headings are collapsed below Scripture.',
    conversionNote: 'Technical format conversion only: USFM styles/reference attributes are removed from display and paragraph boundaries become line breaks. Source notes/headings are retained separately. Combined labels remain intact; no Scripture text was split, duplicated, corrected or inferred. All original source bytes are retained.',
    nativeVersification: false, nativeReferenceScope: true, collapseSourceAnnotations: true,
    referenceComparison: 'matching publisher indexed references; not semantic correspondence or translation-accuracy certification',
    versification, books, bookMetadata, verseMetadata, sourceRecords, sourceNotes, sourceHeadings, psalmHeadings, sourceChapterLabels, sourceInventory: inventory,
  };
}
export function serialize(data) { return { json: JSON.stringify(data, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.asd=${JSON.stringify(data, null, 2)};\n` }; }
function main() {
  const data = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(data.sourceInventory, null, 2)); return; }
  for (const [ext, text] of Object.entries(serialize(data))) {
    const filename = path.join(ROOT, `data/asd.${ext}`);
    if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale ASD output: ${filename}`); }
    else fs.writeFileSync(filename, text);
  }
  console.log('ASD: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
