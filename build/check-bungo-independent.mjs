// Independent byte/index/text audit. Does not import or call the Bungo importer.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { inflateSync, inflateRawSync } from 'node:zlib';
const ROOT = new URL('../', import.meta.url);
const SRC = new URL('build/sources/bungo/', ROOT);
const read = name => fs.readFileSync(new URL(name, SRC));
const digest = b => crypto.createHash('sha256').update(b).digest('hex');
const zip = read('JapBungo-2.0.zip');
assert.equal(digest(zip), '1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6');
let end = zip.length - 22;
while (end >= Math.max(0, zip.length - 65557) && zip.readUInt32LE(end) !== 0x06054b50) end--;
assert(end >= 0, 'ZIP directory exists');
const zipEntries = zip.readUInt16LE(end + 10);
let zipOffset = zip.readUInt32LE(end + 16);
for (let i = 0; i < zipEntries; i++) {
  assert.equal(zip.readUInt32LE(zipOffset), 0x02014b50);
  const method = zip.readUInt16LE(zipOffset + 10), compressedSize = zip.readUInt32LE(zipOffset + 20), size = zip.readUInt32LE(zipOffset + 24);
  const nameLength = zip.readUInt16LE(zipOffset + 28), extraLength = zip.readUInt16LE(zipOffset + 30), commentLength = zip.readUInt16LE(zipOffset + 32), local = zip.readUInt32LE(zipOffset + 42);
  const name = zip.subarray(zipOffset + 46, zipOffset + 46 + nameLength).toString('utf8');
  assert(!name.includes('..') && !name.startsWith('/'));
  assert.equal(zip.readUInt32LE(local), 0x04034b50);
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const bytes = method === 8 ? inflateRawSync(zip.subarray(start, start + compressedSize)) : zip.subarray(start, start + compressedSize);
  assert(method === 8 || method === 0); assert.equal(bytes.length, size);
  if (!name.endsWith('/')) assert.deepEqual(read('module/' + name), bytes, `Published ZIP byte fidelity: ${name}`);
  zipOffset += 46 + nameLength + extraLength + commentLength;
}
const headerBytes = read('sword-canon.h');
assert.equal(digest(headerBytes), '782e7a603cdfb45ddfd6eed9d31a639929fb928b47c7042d83c8ee9b76af078a');
const header = headerBytes.toString('utf8');
const mapping = Object.fromEntries('Gen:GEN Exod:EXO Lev:LEV Num:NUM Deut:DEU Josh:JOS Judg:JDG Ruth:RUT 1Sam:1SA 2Sam:2SA 1Kgs:1KI 2Kgs:2KI 1Chr:1CH 2Chr:2CH Ezra:EZR Neh:NEH Esth:EST Job:JOB Ps:PSA Prov:PRO Eccl:ECC Song:SNG Isa:ISA Jer:JER Lam:LAM Ezek:EZK Dan:DAN Hos:HOS Joel:JOL Amos:AMO Obad:OBA Jonah:JON Mic:MIC Nah:NAM Hab:HAB Zeph:ZEP Hag:HAG Zech:ZEC Mal:MAL Matt:MAT Mark:MRK Luke:LUK John:JHN Acts:ACT Rom:ROM 1Cor:1CO 2Cor:2CO Gal:GAL Eph:EPH Phil:PHP Col:COL 1Thess:1TH 2Thess:2TH 1Tim:1TI 2Tim:2TI Titus:TIT Phlm:PHM Heb:HEB Jas:JAS 1Pet:1PE 2Pet:2PE 1John:1JN 2John:2JN 3John:3JN Jude:JUD Rev:REV'.split(' ').map(x => x.split(':')));
const layouts = {};
for (const part of ['ot', 'nt']) {
  const body = header.match(new RegExp(`struct sbook ${part}books\\[\\] = \\{([\\s\\S]*?)\\};`))[1];
  layouts[part] = [...body.matchAll(/\{"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(\d+)\}/g)].map(m => ({ id: mapping[m[3]], name: m[1], count: Number(m[4]) }));
  layouts[part].forEach(b => assert(b.id, `Unknown declared book ${b.name}`));
}
const verseCounts = header.match(/int vm\[\] = \{([\s\S]*?)\};/)[1].replace(/\/\/[^\n]*/g, '').match(/\d+/g).map(Number);
assert.equal(verseCounts.length, 1189);
let chapterOffset = 0, totalSlots = 0, nonempty = 0, structuralWithText = 0;
const refs = {}, rawRefs = {}, tags = {}, empty = [], structural = [];
for (const part of ['ot', 'nt']) {
  const base = `module/modules/texts/ztext/japbungo/${part}.`;
  const blockIndex = read(base + 'bzs'), verseIndex = read(base + 'bzv'), compressed = read(base + 'bzz');
  assert.equal(blockIndex.length % 12, 0); assert.equal(verseIndex.length % 10, 0);
  const blocks = [];
  for (let i = 0; i < blockIndex.length; i += 12) {
    const offset = blockIndex.readUInt32LE(i), size = blockIndex.readUInt32LE(i + 4), expected = blockIndex.readUInt32LE(i + 8);
    assert(offset + size <= compressed.length);
    const raw = inflateSync(compressed.subarray(offset, offset + size));
    assert.equal(raw.length, expected); blocks.push(raw);
  }
  function entry(index) {
    const offset = index * 10;
    assert(offset + 10 <= verseIndex.length);
    const block = verseIndex.readUInt32LE(offset), start = verseIndex.readUInt32LE(offset + 4), size = verseIndex.readUInt16LE(offset + 8);
    if (!size) return '';
    assert(block < blocks.length && start + size <= blocks[block].length);
    const text = new TextDecoder('utf-8', { fatal: true }).decode(blocks[block].subarray(start, start + size));
    for (const match of text.matchAll(/<\/?([A-Za-z][\w:-]*)\b/g)) tags[match[1]] = (tags[match[1]] || 0) + 1;
    return text;
  }
  let cursor = 0;
  for (let i = 0; i < 2; i++) { const raw = entry(cursor++); if (raw) structural.push({ part, index: i, raw }); }
  for (const book of layouts[part]) {
    const bookRaw = entry(cursor++); if (bookRaw) structural.push({ book: book.id, raw: bookRaw });
    refs[book.id] = []; rawRefs[book.id] = [];
    for (let chapter = 1; chapter <= book.count; chapter++) {
      const intro = entry(cursor++); if (intro) structural.push({ book: book.id, chapter, raw: intro });
      const extent = verseCounts[chapterOffset++], rows = [], raws = [];
      for (let verse = 1; verse <= extent; verse++) {
        const raw = entry(cursor++); totalSlots++; if (raw) nonempty++; else empty.push(`${book.id} ${chapter}:${verse}`);
        raws.push(raw); rows.push(raw);
      }
      refs[book.id].push(rows); rawRefs[book.id].push(raws);
    }
  }
  assert.equal(cursor * 10, verseIndex.length, `${part}: consumed every source index record`);
}
assert.equal(Object.keys(refs).length, 66); assert.equal(chapterOffset, 1189);
assert.equal(totalSlots, 31102); assert.equal(nonempty, 31099);
assert.deepEqual(empty, ['EXO 7:25', '2SA 19:25', '2CH 2:13']);
structuralWithText = structural.length;
if (process.argv.includes('--inventory')) {
  console.log(JSON.stringify({ books: 66, chapters: chapterOffset, slots: totalSlots, nonempty, empty, structuralWithText, tags, sampleStructural: structural.slice(0, 3), firstVerse: rawRefs.GEN[0][0] }, null, 2));
} else {
  const data = JSON.parse(fs.readFileSync(new URL('data/bungo.json', ROOT), 'utf8'));
  // The inspected module uses inline word/gloss markup; remove markup only.
  // Any other category must be explicitly examined before this check is used.
  function textOnly(raw) {
    return raw.replace(/<title\b[^>]*>[\s\S]*?<\/title>/g, '')
      .replace(/<note\b[^>]*>[\s\S]*?<\/note>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) => e.startsWith('#x') ? String.fromCodePoint(parseInt(e.slice(2), 16)) : e.startsWith('#') ? String.fromCodePoint(Number(e.slice(1))) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[e]);
  }
  assert.deepEqual(Object.keys(data.books).sort(), Object.keys(rawRefs).sort());
  for (const [id, chapters] of Object.entries(rawRefs)) {
    assert.equal(data.books[id].length, chapters.length, `${id} chapter coverage`);
    for (let c = 0; c < chapters.length; c++) {
      assert.equal(data.books[id][c].length, chapters[c].length, `${id} ${c+1}: indexed extent`);
      for (let v = 0; v < chapters[c].length; v++) assert.equal(data.books[id][c][v], textOnly(chapters[c][v]), `${id} ${c+1}:${v+1}: exact source text`);
    }
  }
  const allRaw = [...structural.map(r => r.raw), ...Object.values(rawRefs).flat(2)];
  const expectedTitles = allRaw.flatMap(raw => [...raw.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/g)].map(m => m[1]));
  const actualTitles = [...Object.values(data.psalmHeadings || {}).flatMap(chs => Object.values(chs).flat().map(t => t.text)), ...(data.structuralHeadings || []).map(t => t.text)];
  assert.deepEqual(actualTitles.sort(), expectedTitles.sort(), 'All source title records preserved separately, including duplicates');
  for (const ref of empty) {
    const [book, cv] = ref.split(' '), [chapter, verse] = cv.split(':');
    assert.equal(data.verseMetadata[book][chapter][verse].status, 'source-gap', 'Empty slot remains a disclosed source gap');
  }
  console.log(`PASS independent pinned Bungo binary/text comparison: 66 books, ${chapterOffset} chapters, ${totalSlots} source slots, ${nonempty} nonempty; ${structuralWithText} text-bearing structural records examined.`);
}
