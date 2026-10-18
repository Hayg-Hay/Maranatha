// Independent audit of the pinned Bohairica package and generated data.
//
// Deliberately does NOT import build/import-bohairica.mjs: the archives are
// read with a small ZIP reader, the USFX text with a direct tag reader, and the
// generated JSON is compared unit by unit against that source. Markers are not
// interpreted through the importer's USFM parser.
//
//   node build/check-bohairica-independent.mjs

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'build/sources/bohairica');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel));
const readText = (rel) => read(rel).toString('utf8');
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const assert = (value, message) => { if (!value) throw new Error(message); };
const equal = (actual, expected, message) => {
  if (actual !== expected) throw new Error(`${message}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
};
const deepEqual = (actual, expected, message) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}: ${a.slice(0, 300)} !== ${e.slice(0, 300)}`);
};

// Independent pins for the source identity, not imported from the importer.
const MANIFEST_SHA256 = 'cf4bfd736e578e4f792070398d9138bd7a606469d88c25a5113b63a66e1ab6fe';
const ARCHIVE_SHA256 = {
  'copbhc_usfm.zip': '45e2d392e6cd68df7d5ee28a8184a94d7e62f33ad1805fcdc75d9174a0c85555',
  'copbhc_usfx.zip': 'b3226c09eb800646f63edd258e51d0a06bc6a02252cf87efe8063b80b35c6368',
};
const EXTRACT_DIR = { 'copbhc_usfm.zip': 'usfm', 'copbhc_usfx.zip': 'usfx' };
const BOOK_IDS = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
const PLACEHOLDERS = 'MRK.9.44 MRK.9.46 LUK.17.36 ACT.8.37 ACT.28.29 REV.12.18'.split(' ');
const SOURCE_ARTIFACTS = 'MRK.6.48 JHN.13.3 2TI.2.25 REV.4.9 REV.13.2'.split(' ');

// ---------------------------------------------------------------------------
// 1. Manifest, archives, extracted files, font and notices
// ---------------------------------------------------------------------------
const manifestBytes = read('build/sources/bohairica/source-files.json');
equal(sha256(manifestBytes), MANIFEST_SHA256, 'source-files.json SHA-256');
const manifest = JSON.parse(manifestBytes.toString('utf8'));
equal(manifest.source, 'https://ebible.org/details.php?id=copbhc', 'source URL');
equal(manifest.retrieved, '2026-10-18', 'retrieval date');
deepEqual(manifest.archives.map((a) => a.path), ['copbhc_usfm.zip', 'copbhc_usfx.zip'], 'archive inventory');
equal(manifest.archives[0].url, 'https://ebible.org/Scriptures/copbhc_usfm.zip', 'USFM archive URL');
equal(manifest.archives[1].url, 'https://ebible.org/Scriptures/copbhc_usfx.zip', 'USFX archive URL');
assert(manifest.files.length === 43, `expected 43 pinned source files, found ${manifest.files.length}`);

const byPath = new Map();
for (const entry of manifest.files) {
  assert(!path.isAbsolute(entry.path) && !entry.path.includes('..'), `unsafe manifest path ${entry.path}`);
  const bytes = fs.readFileSync(path.join(SRC, entry.path));
  equal(bytes.length, entry.bytes, `source byte length ${entry.path}`);
  equal(sha256(bytes), entry.sha256, `source SHA-256 ${entry.path}`);
  byPath.set(entry.path, bytes);
}

function readZip(archiveBytes) {
  let end = archiveBytes.length - 22;
  while (end >= Math.max(0, archiveBytes.length - 65557) && archiveBytes.readUInt32LE(end) !== 0x06054b50) end--;
  assert(end >= 0, 'ZIP end-of-central-directory exists');
  const entries = archiveBytes.readUInt16LE(end + 10);
  let offset = archiveBytes.readUInt32LE(end + 16);
  const files = new Map();
  for (let i = 0; i < entries; i++) {
    assert(archiveBytes.readUInt32LE(offset) === 0x02014b50, 'ZIP central-directory entry');
    const flags = archiveBytes.readUInt16LE(offset + 8);
    const method = archiveBytes.readUInt16LE(offset + 10);
    const compressedSize = archiveBytes.readUInt32LE(offset + 20);
    const size = archiveBytes.readUInt32LE(offset + 24);
    const nameLength = archiveBytes.readUInt16LE(offset + 28);
    const extraLength = archiveBytes.readUInt16LE(offset + 30);
    const commentLength = archiveBytes.readUInt16LE(offset + 32);
    const local = archiveBytes.readUInt32LE(offset + 42);
    const name = archiveBytes.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    assert(!name.includes('..') && !name.startsWith('/'), `unsafe ZIP entry ${name}`);
    assert((flags & 1) === 0, `encrypted ZIP entry ${name}`);
    assert(archiveBytes.readUInt32LE(local) === 0x04034b50, `ZIP local entry ${name}`);
    const start = local + 30 + archiveBytes.readUInt16LE(local + 26) + archiveBytes.readUInt16LE(local + 28);
    assert(method === 0 || method === 8, `unsupported ZIP compression ${name}`);
    const compressed = archiveBytes.subarray(start, start + compressedSize);
    const bytes = method === 8 ? inflateRawSync(compressed) : compressed;
    equal(bytes.length, size, `ZIP uncompressed size ${name}`);
    if (!name.endsWith('/')) files.set(name, bytes);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

let archiveFileCount = 0;
for (const [archiveName, expectedHash] of Object.entries(ARCHIVE_SHA256)) {
  const archive = fs.readFileSync(path.join(SRC, archiveName));
  equal(sha256(archive), expectedHash, `${archiveName} SHA-256`);
  assert(byPath.has(archiveName) && archive.equals(byPath.get(archiveName)), `${archiveName} matches the pinned manifest bytes`);
  const files = readZip(archive);
  const committedDir = path.join(SRC, EXTRACT_DIR[archiveName]);
  const committed = fs.readdirSync(committedDir).sort();
  deepEqual([...files.keys()].sort(), committed, `${archiveName} entry inventory`);
  for (const [name, bytes] of files) {
    const onDisk = fs.readFileSync(path.join(committedDir, name));
    assert(onDisk.equals(bytes), `${archiveName} extracted byte fidelity: ${name}`);
    archiveFileCount++;
  }
}
equal(archiveFileCount, 38, 'two archives contain 38 files in total');

// Font provenance and licence, as pinned separately from the Scripture text.
equal(manifest.font.url, 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanscoptic/NotoSansCoptic-Regular.ttf', 'font URL');
equal(manifest.font.upstreamCommit, 'ed3522436a4e3c41b0479c8d7785facd3c397eaa', 'font upstream commit');
deepEqual(manifest.font.files.map((f) => f.path).sort(), ['fonts/NotoSansCoptic-OFL.txt', 'fonts/NotoSansCoptic-Regular.ttf'], 'font file inventory');
for (const entry of manifest.font.files) equal(sha256(read(entry.path)), entry.sha256, `font file SHA-256 ${entry.path}`);
const fontMetadata = readText('build/sources/bohairica/font-METADATA.pb');
assert(/name: "Noto Sans Coptic"/.test(fontMetadata), 'font metadata name');
assert(/license: "OFL"/.test(fontMetadata), 'font metadata licence');
assert(fontMetadata.includes('NotoSansCoptic-v2.004'), 'font release metadata');
assert(fontMetadata.includes(manifest.font.upstreamCommit), 'font commit metadata');
const ofl = readText('fonts/NotoSansCoptic-OFL.txt');
assert(ofl.includes('SIL Open Font License, Version 1.1'), 'OFL 1.1 text');
assert(ofl.includes('Copyright 2022 The Noto Project Authors (https://github.com/notofonts/coptic)'), 'font copyright');
const fontReadme = readText('fonts/NotoSansCoptic-README.md');
assert(/Unmodified regular TTF/.test(fontReadme) && /shell v67/.test(fontReadme), 'font README provenance/version');

const copyright = readText('build/sources/bohairica/copyright.htm');
for (const phrase of [
  'Public Domain', 'Dialect: Bohairic', 'Translation by: Horner', 'Contributor: J. Warren Wells',
  'Bohairica: The Bohairic New Testament in Standardized Form.', 'Bohairica 1.2 (2006.December.14)',
  'source files dated 12 Dec 2025', 'standardized for easy comparison', 'nomina sacra forms have been expanded',
]) assert(copyright.includes(phrase), `copyright notice phrase: ${phrase}`);
const editionNotice = readText('build/sources/bohairica/edition.html');
for (const phrase of ['public domain', 'Bohairica 1.2 (2006.December.14)', 'Translation by: Horner', 'J. Warren Wells']) assert(editionNotice.includes(phrase), `edition notice phrase: ${phrase}`);
for (const copy of ['build/sources/bohairica/usfm/copr.htm', 'build/sources/bohairica/usfx/copr.htm']) {
  const text = readText(copy);
  for (const phrase of ['Public Domain', 'Bohairica 1.2 (2006.December.14)', 'Horner', 'J. Warren Wells']) assert(text.includes(phrase), `${copy}: ${phrase}`);
}
const additional = readText('build/sources/bohairica/usfx/copbhc-VernacularAdditional.xml');
assert(/<translationId>copbhc<\/translationId>/.test(additional), 'additional metadata translation id');
assert(/Scripture is in the Public\s+Domain/.test(additional), 'additional metadata Public Domain statement');
const metadataXml = readText('build/sources/bohairica/usfx/copbhcmetadata.xml');
assert(/<identification>[\s\S]*?<scope>NT<\/scope>[\s\S]*?<abbreviationLocal>COPBHC<\/abbreviationLocal>/.test(metadataXml), 'metadata identification scope/abbreviation');
assert(/<language>[\s\S]*?<iso>cop<\/iso>[\s\S]*?<scriptDirection>LTR<\/scriptDirection>[\s\S]*?<numerals>Coptic<\/numerals>/.test(metadataXml), 'metadata language/script direction');
assert(/<copyright>[\s\S]*?<statement[^>]*>[\s\S]*?<p>Public Domain/.test(metadataXml), 'metadata Public Domain statement');
assert(metadataXml.includes('Bohairica 1.2 (2006.December.14)') && metadataXml.includes('based on the edition by Horner'), 'metadata edition identity');
const licence = readText('data/LICENSE-bohairica.md');
for (const phrase of ['Public Domain', 'Bohairica', '1.2 (2006.December.14)', 'J. Warren Wells', 'Horner', 'SIL Open Font License', 'not an unaltered Horner', 'no missing wording is supplied']) assert(licence.includes(phrase), `text licence phrase: ${phrase}`);
console.log(`PASS source identity: manifest/every pinned byte, 2 archives (${archiveFileCount} extracted files), notices, metadata, licence and font provenance.`);

// ---------------------------------------------------------------------------
// 2. Independent USFX -> every generated unit, word and punctuation mark
// ---------------------------------------------------------------------------
const usfx = readText('build/sources/bohairica/usfx/copbhc_usfx.xml').replace(/\r\n/g, '\n');
assert(!usfx.includes('\uFFFD') && !usfx.includes('\0'), 'USFX is valid Unicode text');
assert(!/&[A-Za-z#0-9]+;/.test(usfx), 'USFX has no XML entities to decode');
const data = JSON.parse(readText('data/bohairica.json'));

const tags = {};
for (const m of usfx.matchAll(/<([a-zA-Z][\w:.-]*)\b/g)) tags[m[1]] = (tags[m[1]] || 0) + 1;
deepEqual(tags, { usfx: 1, languageCode: 1, book: 27, id: 27, h: 27, toc: 54, p: 287, c: 260, v: 7956, ve: 7956 }, 'USFX element inventory');
assert(!/<(f|x|w|add|nd|qt|bk|sc|it|bd|em|sup|ref|wj|tl|pn|sig|sls|ord|k|wa|wg|wh|wj)\b/.test(usfx), 'USFX has no note/word/heading markup');

const stripFinalNewline = (s) => s.endsWith('\n') ? s.slice(0, -1) : s;
const title = (body, re, name) => {
  const match = body.match(re);
  assert(match, `USFX missing ${name}`);
  return stripFinalNewline(match[1]);
};

const source = {};
let sourceChapters = 0, sourceVerses = 0, sourceWords = 0, sourcePunctuation = 0;
for (const match of usfx.matchAll(/<book id="([^"]+)">([\s\S]*?)<\/book>/g)) {
  const [, id, body] = match;
  assert(!Object.hasOwn(source, id), `duplicate USFX book ${id}`);
  const meta = {
    id,
    h: title(body, /<h>([\s\S]*?)<\/h>/, `${id} h`),
    toc1: title(body, /<toc level="1">([\s\S]*?)<\/toc>/, `${id} toc1`),
    toc2: title(body, /<toc level="2">([\s\S]*?)<\/toc>/, `${id} toc2`),
    mt1: title(body, /<p sfm="mt"[^>]*>([\s\S]*?)<\/p>/, `${id} mt1`),
  };
  const chapters = [];
  for (const part of body.split(/<c id="(\d+)"\s*\/>/).slice(1).reduce((acc, value, index, all) => {
    if (index % 2 === 0) acc.push([value, all[index + 1]]);
    return acc;
  }, [])) {
    const [chapterLabel, chapterBody] = part;
    const chapter = Number(chapterLabel);
    assert(Number.isInteger(chapter) && chapter > 0, `${id}: invalid chapter label ${chapterLabel}`);
    assert(chapter === chapters.length + 1, `${id}: non-contiguous chapter ${chapter}`);
    if (chapterBody === undefined) throw new Error(`${id}: malformed chapter ${chapter}`);
    const verses = [];
    let previous = 0;
    for (const v of chapterBody.matchAll(/<v id="([^"]+)" bcv="([^"]+)"\s*\/>([\s\S]*?)<ve\s*\/>/g)) {
      const [, label, bcv, raw] = v;
      const verse = Number(label);
      assert(String(verse) === label, `${id} ${chapter}: non-numeric label ${label}`);
      assert(verse === previous + 1 || verse === previous + 2, `${id} ${chapter}: unexpected label jump ${previous} -> ${verse}`);
      equal(bcv, `${id}.${chapter}.${verse}`, `${id} ${chapter}:${verse} bcv`);
      const text = stripFinalNewline(raw);
      assert(!/^\s/.test(text) && !/\s$/.test(text), `${id} ${chapter}:${verse} has unexpected outer whitespace`);
      if (verse === previous + 2) assert(id === 'ACT' && chapter === 24 && previous === 6, `${id} ${chapter}: undisclosed source gap at ${previous + 1}`);
      previous = verse;
      sourceVerses++;
      sourceWords += text.split(/\s+/).filter(Boolean).length;
      sourcePunctuation += (text.match(/[^\p{L}\p{M}\s]/gu) || []).length;
      verses[verse - 1] = { label, text };
    }
    assert(verses.length > 0 && verses[0], `${id} ${chapter}: no verse 1`);
    for (let i = 0; i < verses.length; i++) if (!verses[i]) verses[i] = null;
    chapters.push({ chapter, verses });
    sourceChapters++;
  }
  source[id] = { meta, chapters };
}

deepEqual(Object.keys(source), BOOK_IDS, 'USFX book set/order');
equal(sourceChapters, 260, 'USFX chapter count');
equal(sourceVerses, 7956, 'USFX numbered record count');

const outputIds = Object.keys(data.books);
deepEqual(outputIds, BOOK_IDS, 'generated book set/order');
equal(Object.keys(data.bookMetadata).length, 27, 'generated book metadata count');
equal(data.id, 'bohairica', 'dataset id');
equal(data.short, 'BOH', 'dataset short label');
equal(data.language, 'cop', 'dataset language');
equal(data.direction, 'ltr', 'dataset direction');
equal(data.scope, 'NT', 'dataset scope');
equal(data.nativeVersification, true, 'nativeVersification');
equal(data.nativeReferenceScope, true, 'nativeReferenceScope');
equal(data.collapseSourceAnnotations, true, 'collapseSourceAnnotations');
assert(/Public Domain/.test(data.license), 'dataset licence declaration');
assert(data.sourceEdition.includes('Bohairica 1.2') && data.sourceEdition.includes('Horner'), 'dataset edition identity');

let outputPositions = 0, outputWords = 0, outputPunctuation = 0, placeholders = [];
const gapRefs = [];
const artifacts = [];
for (const id of BOOK_IDS) {
  const src = source[id], out = data.books[id];
  assert(src && out, `book ${id} present in both source and output`);
  for (const key of ['h', 'toc1', 'toc2', 'mt1']) equal(data.bookMetadata[id][key], src.meta[key], `${id} title ${key}`);
  equal(out.length, src.chapters.length, `${id} chapter count`);
  for (let ci = 0; ci < out.length; ci++) {
    const sc = src.chapters[ci], verses = out[ci];
    equal(verses.length, sc.verses.length, `${id} ${ci + 1} verse extent`);
    const records = data.sourceRecords?.[id]?.[ci + 1] || [];
    equal(records.length, sc.verses.filter(Boolean).length, `${id} ${ci + 1} sourceRecord count`);
    deepEqual(records.map((r) => r.label), sc.verses.filter(Boolean).map((v) => v.label), `${id} ${ci + 1} sourceRecord labels`);
    const recordByLabel = new Map(records.map((r) => [r.label, r]));
    outputPositions += verses.length;
    for (let vi = 0; vi < verses.length; vi++) {
      const sv = sc.verses[vi];
      if (!sv) {
        gapRefs.push(`${id}.${ci + 1}.${vi + 1}`);
        equal(verses[vi], '', `${id} ${ci + 1}:${vi + 1} source gap is empty`);
        const meta = data.verseMetadata?.[id]?.[ci + 1]?.[vi + 1];
        equal(meta?.status, 'source-gap', `${id} ${ci + 1}:${vi + 1} gap notice`);
        continue;
      }
      equal(verses[vi], sv.text, `${id} ${ci + 1}:${sv.label} source text/words/punctuation`);
      outputWords += verses[vi].split(/\s+/).filter(Boolean).length;
      outputPunctuation += (verses[vi].match(/[^\p{L}\p{M}\s]/gu) || []).length;
      const record = recordByLabel.get(sv.label);
      assert(record, `${id} ${ci + 1}:${sv.label} sourceRecord exists`);
      equal(record.label, sv.label, `${id} ${ci + 1}:${sv.label} record label`);
      equal(record.start, Number(sv.label), `${id} ${ci + 1}:${sv.label} record start`);
      equal(record.end, Number(sv.label), `${id} ${ci + 1}:${sv.label} record end`);
      equal(record.text, sv.text, `${id} ${ci + 1}:${sv.label} record text`);
      if (/^\[[^\]]*\]$/.test(sv.text)) {
        placeholders.push(`${id}.${ci + 1}.${sv.label}`);
        const meta = data.verseMetadata?.[id]?.[ci + 1]?.[vi + 1];
        equal(meta?.status, 'source-placeholder', `${id} ${ci + 1}:${sv.label} placeholder tag`);
        equal(meta?.text, sv.text, `${id} ${ci + 1}:${sv.label} placeholder text`);
        assert(/no text was supplied or inferred/i.test(meta?.note || ''), `${id} ${ci + 1}:${sv.label} placeholder notice`);
      }
      if (sv.text.includes(']-')) artifacts.push(`${id}.${ci + 1}.${sv.label}`);
    }
  }
  // No invented trailing slots: every chapter ends after its last source record.
  for (let ci = 0; ci < out.length; ci++) assert(out[ci].length === src.chapters[ci].verses.length, `${id} ${ci + 1}: trailing slot invented`);
}
equal(outputPositions, 7957, 'generated numbered positions');
equal(outputWords, sourceWords, 'total word count');
equal(outputPunctuation, sourcePunctuation, 'total punctuation mark count');
deepEqual(gapRefs, ['ACT.24.7'], 'only disclosed source gap');
deepEqual(placeholders, PLACEHOLDERS, 'bracketed-only source placeholders');
deepEqual(artifacts, SOURCE_ARTIFACTS, 'known source-character artifacts preserved verbatim');

// Chapter boundaries and known native shapes, checked directly from the USFX.
for (const [id, expected] of Object.entries({
  MAT: 28, MRK: 16, LUK: 24, JHN: 21, ACT: 28, ROM: 16, '1CO': 16, '2CO': 13, GAL: 6,
  EPH: 6, PHP: 4, COL: 4, '1TH': 5, '2TH': 3, '1TI': 6, '2TI': 4, TIT: 3, PHM: 1,
  HEB: 13, JAS: 5, '1PE': 5, '2PE': 3, '1JN': 5, '2JN': 1, '3JN': 1, JUD: 1, REV: 22,
})) equal(source[id].chapters.length, expected, `${id} native chapter count`);
equal(source.MRK.chapters[15].verses.length, 20, 'Mark 16 has 20 source records (9-20 retained)');
assert(source.MRK.chapters[15].verses.slice(8).every((v) => v && v.text), 'Mark 16:9-20 all carry text');
assert(source.JHN.chapters[6].verses.length === 53 && source.JHN.chapters[6].verses[52], 'John 7:53 retained');
equal(source.JHN.chapters[7].verses.length, 59, 'John 8 has 59 source records');
assert(source.JHN.chapters[7].verses.slice(0, 11).every((v) => v && v.text), 'John 8:1-11 all carry text');
equal(source['3JN'].chapters[0].verses.length, 15, '3 John has 15 native verses');
equal(source.ACT.chapters[18].verses.length, 40, 'Acts 19 has 40 source records');
equal(source.ROM.chapters[13].verses.length, 23, 'Romans 14 ends at source verse 23');
equal(source['2CO'].chapters[12].verses.length, 13, '2 Corinthians 13 ends at source verse 13');
equal(source.REV.chapters[11].verses.length, 18, 'Revelation 12 has 18 source records');
equal(source.REV.chapters[11].verses[17].text, '[ ]', 'Revelation 12:18 is the source marker');
// The merged final units are present in their source labels, never moved to
// another chapter or filled with text from another witness.
assert(source.ACT.chapters[18].verses[39].text.includes('\u2C80\u03E4\u2CAC\u2CB0'), 'Acts 19:40 includes the dismissal clause');
assert(source['2CO'].chapters[12].verses[12].text.includes('\u2CA0\u2CAC\u2CA2\u2C92\u2CA4\u2CA6\u2C9E\u2CA4'), '2 Corinthians 13:13 includes the blessing');

// Invalid bytes/control characters never enter the generated text.
const serialized = JSON.stringify(data.books);
assert(!serialized.includes('\uFFFD') && !serialized.includes('\\u0000'), 'generated Scripture has no replacement/NUL characters');
equal(data.sourceInventory.books, 27, 'inventory books');
equal(data.sourceInventory.chapters, 260, 'inventory chapters');
equal(data.sourceInventory.records, 7956, 'inventory records');
equal(data.sourceInventory.numberedPositions, 7957, 'inventory numbered positions');
deepEqual(data.sourceInventory.gaps, ['ACT.24.7'], 'inventory gap list');
deepEqual(data.sourceInventory.placeholders, PLACEHOLDERS, 'inventory placeholder list');
equal(data.sourceInventory.footnotes, 0, 'inventory footnotes');
equal(data.sourceInventory.sectionHeadings, 0, 'inventory section headings');

console.log(`PASS independent USFX fidelity: 27 books / 260 chapters / 7,956 records / 7,957 positions; all titles, verse labels, text, words (${outputWords}) and punctuation (${outputPunctuation}) match; one gap, six bracketed placeholders, five preserved source artifacts, Mark 16 and John 7-8 native shapes verified.`);
