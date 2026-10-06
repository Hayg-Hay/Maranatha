// fetch-delitzsch1901.mjs
//
// Build-time source acquisition for the vocalized Delitzsch 1901 NT. This is
// the ONLY script that touches the network for this translation; the importer
// (import-delitzsch1901.mjs) and all validation/tests read the bytes cached
// here and never fetch anything. It is intentionally separate from ordinary
// regeneration/checking.
//
//   node build/fetch-delitzsch1901.mjs
//
// What it acquires:
//   1. The Sermon-Online verse-per-line transcription (the import source),
//      hash-pinned to the value inspected for this project.
//   2. Edition/licensing evidence: the Sermon-Online catalog entry and FAQ,
//      and the archive.org item metadata for the printed 1901 edition.
//   3. A handful of scanned page images from the 1901 print (title page, table
//      of contents, John 1, Romans 8, 3 John) used to verify the transcription.
//
// If the transcription hash differs from the inspected value the fetch stops
// and reports it; inspect and document the newer source before accepting it.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(dir, 'sources', 'delitzsch1901');
const EVIDENCE = path.join(OUT, 'evidence');

export const SOURCE = {
  transcriptionUrl: 'https://info2.sermon-online.com/hebrew/Bible/Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt',
  transcriptionSha256: 'c592cae600a34ed57689ca0d5905c26b45ad5e0c5eeed83fe3f37d37ee6be8a7',
  transcriptionFile: 'Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt',
  catalogUrl: 'https://www.sermon-online.com/de/contents/31592',
  faqUrl: 'https://www.sermon-online.com/en/faq',
  archiveItem: 'hebrewnewtestam00deli',
  archiveDetails: 'https://archive.org/details/hebrewnewtestam00deli',
  archiveMetadataUrl: 'https://archive.org/metadata/hebrewnewtestam00deli',
};

// Scan leaves used as visual evidence. leaf = printedPage + 8 for this scan
// (verified against the page-number index). JP2 leaf names are zero-padded 4.
export const EVIDENCE_LEAVES = [
  { leaf: 5, label: 'title-page', printedPage: null, note: 'Title page: 12th edition, British & Foreign Bible Society, Berlin 1901.' },
  { leaf: 7, label: 'table-of-contents', printedPage: null, note: 'Table of contents: John begins at p.163, 3 John at p.453.' },
  { leaf: 171, label: 'john-01-start', printedPage: 163, note: 'John 1:1-18.' },
  { leaf: 172, label: 'john-01-b', printedPage: 164, note: 'John 1:19-37; v20 has no closing parenthesis; v37 single vowel.' },
  { leaf: 173, label: 'john-01-c', printedPage: 165, note: 'John 1:38-52 (chapter runs to 52, not canon 51).' },
  { leaf: 297, label: 'romans-08-a', printedPage: 289, note: 'Romans 8:1-14; v1 parenthetical clause is genuine.' },
  { leaf: 461, label: '3john', printedPage: 453, note: '3 John; the closing greeting is numbered verse 15.' },
];

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Maranatha-build/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function bookReaderImageUrl(server, itemPath, leaf) {
  const name = `hebrewnewtestam00deli_${String(leaf).padStart(4, '0')}.jp2`;
  return `https://${server}/BookReader/BookReaderImages.php?zip=${itemPath}/${SOURCE.archiveItem}_jp2.zip&file=${SOURCE.archiveItem}_jp2/${name}&id=${SOURCE.archiveItem}&scale=2&rotate=0`;
}

async function main() {
  fs.mkdirSync(EVIDENCE, { recursive: true });

  // 1. transcription
  const txt = await get(SOURCE.transcriptionUrl);
  const got = sha256(txt);
  if (got !== SOURCE.transcriptionSha256) {
    throw new Error(`Transcription hash changed for ${SOURCE.transcriptionUrl}\n  expected ${SOURCE.transcriptionSha256}\n  got      ${got}\nInspect and document the newer source before accepting it.`);
  }
  fs.writeFileSync(path.join(OUT, SOURCE.transcriptionFile), txt);
  console.log(`transcription OK (${txt.length} bytes, sha256 ${got})`);

  // 2. archive metadata + catalog + faq
  const meta = JSON.parse((await get(SOURCE.archiveMetadataUrl)).toString('utf8'));
  const trimmed = {
    identifier: meta.metadata.identifier,
    title: meta.metadata.title,
    creator: meta.metadata.creator,
    publisher: meta.metadata.publisher,
    date: meta.metadata.date,
    language: meta.metadata.language,
    pageProgression: meta.metadata['page-progression'],
    imagecount: meta.metadata.imagecount,
    contributor: meta.metadata.contributor,
    collection: meta.metadata.collection,
    externalIdentifier: meta.metadata['external-identifier'],
    server: meta.server,
    dir: meta.dir,
    fetchedBy: 'build/fetch-delitzsch1901.mjs',
  };
  fs.writeFileSync(path.join(EVIDENCE, 'archive-metadata.json'), JSON.stringify(trimmed, null, 2) + '\n');
  fs.writeFileSync(path.join(EVIDENCE, 'sermon-online-catalog.html'), await get(SOURCE.catalogUrl));
  fs.writeFileSync(path.join(EVIDENCE, 'sermon-online-faq.html'), await get(SOURCE.faqUrl));
  console.log('archive metadata, catalog and FAQ cached');

  // 3. page images
  const index = [];
  for (const e of EVIDENCE_LEAVES) {
    const url = bookReaderImageUrl(meta.server, meta.dir, e.leaf);
    const img = await get(url);
    const file = `scan-${String(e.leaf).padStart(4, '0')}-${e.label}.jpg`;
    fs.writeFileSync(path.join(EVIDENCE, file), img);
    index.push({ ...e, file, url, sha256: sha256(img) });
    console.log(`cached ${file} (${img.length} bytes)`);
  }
  fs.writeFileSync(path.join(EVIDENCE, 'scan-index.json'), JSON.stringify({
    archiveItem: SOURCE.archiveItem,
    archiveDetails: SOURCE.archiveDetails,
    leafFormula: 'printedPage + 8',
    server: meta.server,
    dir: meta.dir,
    leaves: index,
  }, null, 2) + '\n');
  console.log('done');
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
