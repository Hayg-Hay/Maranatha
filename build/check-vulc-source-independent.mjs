// Source verification deliberately uses raw XML verse boundaries, not the importer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const xml = read('build/sources/vulgata-clementina/extracted/latVUC_usfx.xml');
const archive = fs.readFileSync(new URL('build/sources/vulgata-clementina/latVUC_usfx.zip', root));
const hash = crypto.createHash('sha256').update(archive).digest('hex');
assert.equal(hash, '4af9ec883815c05c0d90fe3a65dc32f32432a646db0247b185cc7a2d89fe53a7');
// Read the pinned ZIP central directory and compare every extracted file byte
// for byte. This also prevents a modified XML being labelled as the publication.
let end = archive.length - 22;
while (end >= Math.max(0, archive.length - 65557) && archive.readUInt32LE(end) !== 0x06054b50) end--;
assert(end >= 0, 'ZIP end directory');
let offset = archive.readUInt32LE(end + 16);
const entries = archive.readUInt16LE(end + 10);
for (let entry = 0; entry < entries; entry++) {
  assert.equal(archive.readUInt32LE(offset), 0x02014b50, 'ZIP central entry');
  const flags = archive.readUInt16LE(offset + 8), method = archive.readUInt16LE(offset + 10);
  const compressedSize = archive.readUInt32LE(offset + 20), size = archive.readUInt32LE(offset + 24);
  const nameLength = archive.readUInt16LE(offset + 28), extraLength = archive.readUInt16LE(offset + 30), commentLength = archive.readUInt16LE(offset + 32);
  const local = archive.readUInt32LE(offset + 42);
  const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
  assert(!name.includes('..') && !name.startsWith('/'), 'Unsafe archive entry');
  assert.equal(flags & 1, 0, 'Encrypted archive entry');
  assert.equal(archive.readUInt32LE(local), 0x04034b50, 'ZIP local entry');
  const start = local + 30 + archive.readUInt16LE(local + 26) + archive.readUInt16LE(local + 28);
  const compressed = archive.subarray(start, start + compressedSize);
  assert(method === 0 || method === 8, 'Supported ZIP compression');
  const bytes = method === 8 ? inflateRawSync(compressed) : compressed;
  assert.equal(bytes.length, size, `ZIP size: ${name}`);
  if (!name.endsWith('/')) assert.deepEqual(fs.readFileSync(new URL(`build/sources/vulgata-clementina/extracted/${name}`, root)), bytes, `Published archive fidelity: ${name}`);
  offset += 46 + nameLength + extraLength + commentLength;
}
const data = JSON.parse(read('data/vulc.json'));
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function plain(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (_, key) => {
    if (key.startsWith('#x')) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith('#')) return String.fromCodePoint(Number(key.slice(1)));
    assert(Object.hasOwn(entities, key), `Unknown entity ${key}`);
    return entities[key];
  }).replace(/[ \t\r\n]+/g, ' ').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}
let books = 0, chapters = 0, verses = 0, notes = 0;
const ids = [];
for (const match of xml.matchAll(/<book id="([^"]+)">([\s\S]*?)<\/book>/g)) {
  const [, id, body] = match;
  ids.push(id); books++;
  const stripped = body.replace(/<f\b[^>]*>[\s\S]*?<\/f>/g, () => { notes++; return ''; });
  const cs = stripped.split(/<c id="(\d+)"\s*\/>/);
  for (let i = 1; i < cs.length; i += 2) {
    const chapter = Number(cs[i]); chapters++;
    let count = 0;
    for (const v of cs[i+1].matchAll(/<v id="([^"]+)"[^>]*\/>([\s\S]*?)<ve\s*\/>/g)) {
      const verse = Number(v[1]);
      assert.equal(String(verse), v[1], `${id} ${chapter}: native label`);
      const expected = plain(v[2]);
      assert.equal(data.books[id]?.[chapter-1]?.[verse-1], expected, `${id} ${chapter}:${verse}: source text`);
      count++; verses++;
    }
    assert.equal(data.books[id]?.[chapter-1]?.length, count, `${id} ${chapter}: no invented verses`);
  }
  assert.equal(data.books[id]?.length, (cs.length - 1) / 2, `${id}: chapter coverage`);
}
assert.deepEqual(Object.keys(data.books).sort(), ids.sort());
assert.deepEqual({ books, chapters, verses, notes }, { books: 73, chapters: 1334, verses: 35809, notes: 13775 });
assert(!JSON.stringify(data.books).includes('\uFFFD'), 'Replacement character in Scripture');
console.log(`PASS independent raw-source comparison: ${books} books / ${chapters} chapters / ${verses} verses; ${notes} commentary notes excluded; archive SHA-256 and all ${entries} extracted files verified.`);
