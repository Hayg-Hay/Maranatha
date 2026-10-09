// Offline import of eBible cmn-cu89t: 新標點和合本, Traditional, 上帝 wording.
// Source labels, combined passages, footnotes and superscriptions are retained.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = path.join(ROOT, 'build/sources/cuv-traditional');
export const MANIFEST_SHA256 = '95943e4c6d3a75366161f23f71bdfb71a9c2cd0804b9ea5f0ee3290588fafcb5';
export const BOOK_IDS = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export const EXPECTED_GAPS = 'MAT.18.11 MAT.23.14 MRK.7.16 MRK.15.28 LUK.17.36 LUK.23.17 JHN.5.4 ACT.8.37 ACT.15.34 ACT.24.7 ACT.28.29'.split(' ');
export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

export function verifySource() {
  const raw = fs.readFileSync(path.join(SOURCE_DIR, 'source-files.json'));
  if (sha256(raw) !== MANIFEST_SHA256) throw new Error('CUV source manifest hash mismatch');
  const manifest = JSON.parse(raw);
  for (const file of manifest.files) {
    const filename = path.resolve(SOURCE_DIR, file.path);
    if (!filename.startsWith(SOURCE_DIR + path.sep)) throw new Error('Unsafe source path');
    if (sha256(fs.readFileSync(filename)) !== file.sha256) throw new Error(`CUV source hash mismatch: ${file.path}`);
  }
  return manifest;
}

const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false });
const tagOf = (node) => Object.keys(node).find(k => k !== ':@');
// USFX line endings are serialization whitespace; q boundaries below preserve
// poetic line structure. Never normalize Unicode or substitute Scripture words.
const plain = (nodes) => nodes.map(n => tagOf(n) === '#text'
  ? String(n['#text']).replace(/\r?\n/g, '') : plain(n[tagOf(n)] || [])).join('');
const put = (obj, book, chapter, entry) => {
  obj[book] ||= {}; obj[book][chapter] ||= []; obj[book][chapter].push(entry);
};

export function parseSource(xml) {
  if (XMLValidator.validate(xml) !== true) throw new Error('Invalid CUV XML');
  const root = parser.parse(xml).find(n => n.usfx)?.usfx;
  if (!root) throw new Error('Missing USFX root');
  const books = {}, verseMetadata = {}, sourceRecords = {}, sourceNotes = {}, psalmHeadings = {}, sourceHeadings = {}, bookNames = {};
  const inventory = { books: 0, chapters: 0, records: 0, combined: 0, numberedPositions: 0, footnotes: 0, superscriptions: 0, sectionHeadings: 0, bookGroupHeadings: 0, sectionReferences: 0, speakerHeadings: 0, gaps: [] };
  const bookNodes = root.filter(n => n.book);
  if (bookNodes.map(n => n[':@']['@_id']).join(' ') !== BOOK_IDS.join(' ')) throw new Error('Unexpected CUV book order');
  for (const node of bookNodes) {
    const id = node[':@']['@_id']; books[id] = []; verseMetadata[id] = {};
    bookNames[id] = plain(node.book.find(n => n.h).h).trim();
    inventory.books++;
    let chapter = 0, active = null, lastEnd = 0;
    const finish = () => {
      if (!active) return;
      const text = active.parts.join('').trim();
      if (!text || text.includes('\uFFFD')) throw new Error(`Empty/invalid text at ${id}.${chapter}.${active.label}`);
      const verses = books[id][chapter - 1];
      if (active.start <= lastEnd) throw new Error(`Duplicate/out-of-order label ${id}.${chapter}.${active.label}`);
      for (let v = lastEnd + 1; v < active.start; v++) {
        verses[v - 1] = '';
        verseMetadata[id][chapter][v] = { status: 'source-gap', note: 'The selected source has no separately numbered Scripture record at this reference. Source footnotes are preserved separately; no verse was supplied or inferred.' };
        inventory.gaps.push(`${id}.${chapter}.${v}`);
      }
      verses[active.start - 1] = text;
      if (active.end > active.start) {
        inventory.combined++;
        verseMetadata[id][chapter][active.start] = { sourceLabel: active.label, rangeEnd: active.end, note: `The source labels this complete passage ${chapter}:${active.label}; it is shown together without splitting its words.` };
        for (let v = active.start + 1; v <= active.end; v++) {
          verses[v - 1] = '';
          verseMetadata[id][chapter][v] = { status: 'combined-member', combinedInto: active.start, sourceLabel: active.label };
        }
      }
      put(sourceRecords, id, chapter, { label: active.label, start: active.start, end: active.end, text });
      inventory.records++; inventory.numberedPositions += active.end - active.start + 1;
      lastEnd = active.end; active = null;
    };
    const walk = (nodes) => {
      for (const n of nodes) {
        const tag = tagOf(n), attrs = n[':@'] || {}, children = n[tag];
        if (tag === '#text') { if (active) active.parts.push(String(children).replace(/\r?\n/g, '')); continue; }
        if (tag === 'c') {
          finish(); const next = Number(attrs['@_id']);
          if (next !== chapter + 1) throw new Error(`Noncontiguous chapter in ${id}`);
          chapter = next; lastEnd = 0; books[id].push([]); verseMetadata[id][chapter] = {}; inventory.chapters++; continue;
        }
        if (tag === 'v') {
          finish(); const label = attrs['@_id'];
          if (!chapter || !/^[1-9]\d*(?:-[1-9]\d*)?$/.test(label)) throw new Error(`Invalid label ${id}.${chapter}.${label}`);
          const [start, end = start] = label.split('-').map(Number);
          if (end < start) throw new Error('Backwards combined range');
          active = { label, start, end, parts: [] }; continue;
        }
        if (tag === 've') { finish(); continue; }
        if (tag === 'f') {
          if (!active) throw new Error(`Unattached footnote in ${id}.${chapter}`);
          const reference = plain(children.filter(n => n.fr)).trim();
          const text = plain(children.filter(n => !n.fr)).trim();
          if (!text) throw new Error('Empty footnote');
          put(sourceNotes, id, chapter, { verse: active.start, sourceLabel: active.label, reference, text, caller: attrs['@_caller'] || '' });
          inventory.footnotes++; continue;
        }
        if (tag === 's' || tag === 'd' || (tag === 'p' && ['ms', 'r', 'sp'].includes(attrs['@_sfm']))) {
          const entry = { text: plain(children).trim(), afterVerse: lastEnd, type: tag === 'd' ? 'superscription' : 'section' };
          if (attrs['@_sfm'] === 'r') entry.type = 'section-reference';
          if (attrs['@_sfm'] === 'sp') entry.type = 'speaker';
          if (active) { entry.withinVerse = active.start; entry.textOffset = active.parts.join('').length; }
          if (!entry.text || !chapter) throw new Error('Invalid source heading');
          if (tag === 'd') { put(psalmHeadings, id, chapter, entry); inventory.superscriptions++; }
          else {
            put(sourceHeadings, id, chapter, entry);
            if (tag === 's') inventory.sectionHeadings++;
            else if (attrs['@_sfm'] === 'r') inventory.sectionReferences++;
            else if (attrs['@_sfm'] === 'sp') inventory.speakerHeadings++;
            else inventory.bookGroupHeadings++;
          }
          continue;
        }
        if (['id', 'h', 'toc'].includes(tag) || (tag === 'p' && attrs['@_sfm'] === 'mt')) continue;
        if (['p', 'q', 'b', 'add', 'pn', 'qs'].includes(tag)) {
          if (['p', 'q', 'b'].includes(tag) && active && active.parts.join('').trim()) active.parts.push('\n');
          walk(children); continue;
        }
        throw new Error(`Unsupported USFX element ${tag}`);
      }
    };
    walk(node.book); finish();
  }
  return { books, verseMetadata, sourceRecords, sourceNotes, psalmHeadings, sourceHeadings, bookNames, inventory };
}

export function loadAndBuild() {
  const manifest = verifySource();
  const parsed = parseSource(fs.readFileSync(path.join(SOURCE_DIR, 'usfx/cmn-cu89t_usfx.xml'), 'utf8'));
  const i = parsed.inventory;
  if (i.books !== 66 || i.chapters !== 1189 || i.records !== 31021 || i.combined !== 70 || i.footnotes !== 1013 || i.superscriptions !== 116 || i.sectionHeadings !== 2603) throw new Error('CUV source inventory changed');
  if (i.numberedPositions !== 31092 || i.bookGroupHeadings !== 5 || i.sectionReferences !== 619 || i.speakerHeadings !== 33 || JSON.stringify(i.gaps) !== JSON.stringify(EXPECTED_GAPS)) throw new Error('CUV native coverage changed');
  const translation = {
    id: 'cuv-traditional', label: 'Chinese Union Version (Traditional, New Punctuation, 上帝)', short: 'CUV-T', language: 'zh-Hant', languageName: 'Chinese (Traditional)', direction: 'ltr',
    sourceEdition: '新標點和合本・繁體・上帝版 (eBible cmn-cu89t; source identifies Chinese Union New Punctuation 1989)',
    sourcePublisher: 'eBible.org (digital distributor)', sourceUrl: manifest.source, sourceRetrievalDate: manifest.retrieved, sourceManifestSha256: MANIFEST_SHA256,
    license: 'Public Domain (as declared by eBible.org)',
    source: 'eBible.org cmn-cu89t USFX and USFM archives, retrieved 2026-10-09 and hash-pinned in build/sources/cuv-traditional. The distributor labels these files Public Domain. This records its statement, not a new worldwide copyright determination. Source wording uses 上帝; no Simplified-to-Traditional conversion was performed.',
    description: 'Traditional Chinese New Punctuation Chinese Union Version (新標點和合本), using 上帝. Source labels and 70 combined passages are retained; footnotes, Psalm superscriptions and section headings are kept separately. The older CUV wording is retained. This is not the Revised Chinese Union Version.',
    conversionNote: 'USFX serialization line endings and markup are removed; poetic paragraph boundaries are retained as newlines. Inline added-word and proper-name styling is flattened without changing its words. Footnotes and headings are stored separately. Combined labels remain intact; no text is split, duplicated, substituted or inferred. All original markup is preserved in the pinned raw source.',
    nativeVersification: true, nativeReferenceScope: true,
    numberingNotice: 'CUV-T retains the source numbering and combined verse labels in its own reading block. Equal verse numbers are not a verified correspondence with other editions.',
    ...parsed,
  };
  delete translation.inventory;
  translation.sourceInventory = i;
  return { translation, parsed };
}

export function serialize(translation) {
  return { json: JSON.stringify(translation, null, 2) + '\n', js: `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['cuv-traditional']=${JSON.stringify(translation, null, 2)};\n` };
}
function main() {
  const { translation } = loadAndBuild();
  if (process.argv.includes('--report')) { console.log(JSON.stringify(translation.sourceInventory, null, 2)); return; }
  const output = serialize(translation);
  for (const [ext, text] of Object.entries(output)) {
    const filename = path.join(ROOT, `data/cuv-traditional.${ext}`);
    if (process.argv.includes('--check')) {
      if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`CUV generated file differs: ${filename}`);
    } else fs.writeFileSync(filename, text);
  }
  console.log(`CUV-T ${process.argv.includes('--check') ? '--check OK' : 'written'}: ${JSON.stringify(translation.sourceInventory)}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
