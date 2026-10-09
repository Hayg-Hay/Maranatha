import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readOvcbUsfm } from './ovcb-usfm.mjs';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/ovcb');
export const ARCHIVE_SHA256 = '8f2849522bd6b88724edecb4972252e8ce536d4381c1e9dd20d36de537e0f880';
export const MANIFEST_SHA256 = '816f095eba7ae4462405ce0d348b930445821662b18e8dfdb874d9467f121ac2';
export const BOOK_IDS = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function verifySource() {
  const bytes = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(bytes) !== MANIFEST_SHA256) throw new Error('OVCB manifest hash mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.files.length !== 80 || manifest.archives[0].sha256 !== ARCHIVE_SHA256) throw new Error('OVCB source profile changed');
  for (const entry of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, entry.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe OVCB path');
    if (sha256(fs.readFileSync(filename)) !== entry.sha256) throw new Error(`OVCB source hash mismatch: ${entry.path}`);
  }
  return manifest;
}
const put = (obj, b, c, item) => { obj[b] ||= {}; obj[b][c] ||= []; obj[b][c].push(item); };
export function loadAndBuild() {
  const manifest = verifySource();
  const metadata = new XMLParser().parse(fs.readFileSync(path.join(SOURCE_DIR, 'usfx/vieovcbmetadata.xml'), 'utf8')).DBLMetadata;
  if (String(metadata.identification.dateCompleted) !== '2015' || metadata.language.iso !== 'vie' || metadata.language.ldml !== 'vi' || metadata.identification.scope !== 'Bible without Deuterocanon') throw new Error('OVCB package identity changed');
  const licence = fs.readFileSync(path.join(SOURCE_DIR, 'copyright.htm'), 'utf8');
  if (!licence.includes('creativecommons.org/licenses/by-sa/4') || !licence.includes('1982, 1987, 1994, 2005, 2015')) throw new Error('OVCB licence evidence mismatch');
  const books = {}, bookMetadata = {}, verseMetadata = {}, sourceRecords = {}, sourceNotes = {}, sourceHeadings = {}, psalmHeadings = {}, sourceChapterLabels = {}, versification = {};
  const inventory = { books: 0, chapters: 0, records: 0, combined: 0, numberedPositions: 0, footnotes: 0, headings: 0, superscriptions: 0, withinVerseHeadings: 0, gaps: [] };
  function except(id, c, reason) {
    versification[id] ||= {}; versification[id][c] ||= { comparisonUnavailable: true, note: reason };
  }
  for (const id of BOOK_IDS) {
    const source = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(SOURCE_DIR, 'usfm/' + fs.readdirSync(path.join(SOURCE_DIR, 'usfm')).find(f => f.endsWith('-' + id + 'vieovcb.usfm')))));
    const parsed = readOvcbUsfm(source);
    if (parsed.metadata.id.split(/\s+/)[0] !== id || !parsed.metadata.id.includes('Open Vietnamese Contemporary Bible 2015')) throw new Error(`OVCB edition identity mismatch: ${id}`);
    books[id] = []; bookMetadata[id] = parsed.metadata; sourceChapterLabels[id] = parsed.chapterLabels;
    let chapter = 0, end = 0;
    for (const record of parsed.records) {
      if (record.chapter !== chapter) {
        if (record.chapter !== chapter + 1) throw new Error('Noncontiguous OVCB chapters');
        chapter = record.chapter; end = 0; books[id].push([]); inventory.chapters++;
      }
      if (record.verse <= end) throw new Error(`Overlapping OVCB reference ${id}.${chapter}.${record.label}`);
      verseMetadata[id] ||= {}; verseMetadata[id][chapter] ||= {};
      for (let v = end + 1; v < record.verse; v++) {
        books[id][chapter - 1].push(''); inventory.gaps.push(`${id}.${chapter}.${v}`);
        verseMetadata[id][chapter][v] = { status: 'source-gap', note: 'The source has no numbered main text here. No Scripture was supplied or inferred; source notes are retained below.' };
      }
      books[id][chapter - 1].push(record.text); inventory.records++;
      put(sourceRecords, id, chapter, { label: record.label, start: record.verse, end: record.end, text: record.text });
      if (record.end > record.verse) {
        inventory.combined++;
        verseMetadata[id][chapter][record.verse] = { sourceLabel: record.label, rangeEnd: record.end, note: `OVCB labels this complete passage ${chapter}:${record.label}; its words remain together.` };
        for (let v = record.verse + 1; v <= record.end; v++) {
          books[id][chapter - 1].push('');
          verseMetadata[id][chapter][v] = { status: 'combined-member', combinedInto: record.verse, sourceLabel: record.label };
        }
        except(id, chapter, 'OVCB has combined source verse ranges in this chapter. They are displayed as complete labelled units without splitting or duplicating their words.');
      }
      end = record.end;
    }
    for (const heading of parsed.headings) {
      const entry = { text: heading.text, afterVerse: heading.afterVerse, type: heading.marker === 'd' ? 'superscription' : ['r', 'mr'].includes(heading.marker) ? 'section-reference' : heading.marker === 'sp' ? 'speaker' : 'section', sourceMarker: heading.marker };
      if (heading.withinVerse) { entry.withinVerse = heading.withinVerse; inventory.withinVerseHeadings++; }
      if (!entry.text) throw new Error('Empty OVCB heading');
      if (heading.marker === 'd') { put(psalmHeadings, id, heading.chapter, entry); inventory.superscriptions++; }
      else { put(sourceHeadings, id, heading.chapter, entry); inventory.headings++; }
    }
    for (const note of parsed.notes) {
      if (note.type !== 'footnote') throw new Error('Unexpected OVCB non-footnote content');
      put(sourceNotes, id, note.chapter, note); inventory.footnotes++;
    }
    if (parsed.annotationMarkers.length) throw new Error('Unexpected OVCB annotation marker');
    inventory.books++;
  }
  inventory.numberedPositions = Object.values(books).flat().reduce((n, c) => n + c.length, 0);
  except('3JN', 1, 'OVCB retains 15 source verses in 3 John; Maranatha’s navigation canon uses 14. No source boundary is collapsed.');
  except('ROM', 14, 'OVCB retains the doxology at Romans 16:25–27; WEB places it at Romans 14:24–26. This chapter is read independently.');
  except('REV', 12, 'OVCB places the dragon standing on the seashore at Revelation 12:18; other editions include this at 13:1. Source chapter boundaries are retained.');
  except('REV', 13, 'OVCB places the dragon standing on the seashore in Revelation 12:18 rather than 13:1. This chapter is read independently.');
  const canonContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/canon.js'), 'utf8'), canonContext);
  for (const [id, chapters] of Object.entries(versification)) for (const [c, entry] of Object.entries(chapters)) {
    entry.source = books[id][Number(c) - 1].length;
    entry.canon = canonContext.window.MARANATHA_CANON.books.find(b => b.id === id).chapters[Number(c) - 1];
  }
  if (inventory.books !== 66 || inventory.chapters !== 1189 || inventory.records !== 31096 || inventory.combined !== 0 || inventory.numberedPositions !== 31104 || inventory.footnotes !== 1562 || inventory.headings !== 2426 || inventory.superscriptions !== 113 || inventory.withinVerseHeadings !== 23) throw new Error('OVCB source inventory changed');
  if (inventory.gaps.join(' ') !== 'MRK.7.16 MRK.9.44 MRK.9.46 MRK.11.26 LUK.23.17 JHN.5.4 ACT.8.37 ACT.28.29') throw new Error('OVCB source gaps changed');

  return {
    id: 'ovcb', short: 'OVCB', label: 'Biblica® Open Vietnamese Contemporary Bible™ (2015)', language: 'vi', languageName: 'Vietnamese', direction: 'ltr',
    originalTitle: 'Biblica® Thiên Ban Kinh Thánh Hiện Đại™', originalTitleEnglish: 'Biblica® Open Vietnamese Contemporary Bible™',
    sourcePublisher: 'Biblica, Inc.; distributed by eBible.org', sourceEdition: 'Open Vietnamese Contemporary Bible 2015', sourceUrl: manifest.source,
    sourceArchiveSha256: ARCHIVE_SHA256, sourceManifestSha256: MANIFEST_SHA256, sourceRetrievalDate: manifest.retrieved, sourcePackageHasMetadataXml: true,
    sourceLicenceUrl: 'https://ebible.org/vieovcb/copyright.htm', license: 'CC BY-SA 4.0', copyright: 'Copyright © 1982, 1987, 1994, 2005, 2015 by Biblica, Inc.',
    source: 'eBible.org vieovcb USFM/USFX archives retrieved 2026-10-09, retained unchanged and hash-pinned. Package metadata identifies the 2015 edition, Vietnamese vie/vi and Bible without Deuterocanon. Original copyright/licence documents are retained. See data/LICENSE-ovcb.md.',
    description: 'Biblica Open Vietnamese Contemporary Bible 2015. All 66 books; words, punctuation and Vietnamese vowel/tone marks preserved. Source notes/headings are collapsed below reading. Ordinary chapters use shared reference comparisons; documented source-unit/boundary/content-placement exceptions read separately.',
    conversionNote: 'Technical format conversion only: USFM styles/reference attributes are removed from display and paragraph boundaries become line breaks. Notes/headings and original source bytes are retained separately. Combined labels remain intact; no Scripture is split, duplicated, corrected or inferred. Unicode normalization is applied only to reference/search forms, never stored Scripture.',
    nativeVersification: false, nativeReferenceScope: true, collapseSourceAnnotations: true,
    referenceComparison: 'matching publisher indexed references; not semantic correspondence or translation-accuracy certification',
    versification, books, bookMetadata, verseMetadata, sourceRecords, sourceNotes, sourceHeadings, psalmHeadings, sourceChapterLabels, sourceInventory: inventory,
  };
}
export function serialize(data) { return { json: JSON.stringify(data, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.ovcb=${JSON.stringify(data, null, 2)};\n` }; }
function main() {
  const data = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(data.sourceInventory, null, 2)); return; }
  for (const [ext, text] of Object.entries(serialize(data))) {
    const filename = path.join(ROOT, `data/ovcb.${ext}`);
    if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale OVCB output: ${filename}`); }
    else fs.writeFileSync(filename, text);
  }
  console.log('OVCB: ' + JSON.stringify(data.sourceInventory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
