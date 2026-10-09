// Independent raw-source fidelity audit for the Peshitta/Murdock NT pair.
//
// This file implements its own SWORD zText reader and its own GBF/OSIS markup
// handling. It imports neither build/import-peshitta-pair.mjs nor
// build/sword-nt-source.mjs, and it re-reads the pinned binary modules directly.
// It verifies every indexed verse/unit's words and punctuation, the GBF
// footnotes, the explicit Mark 9:50 boundary marker, the three Murdock
// native-reference wrappers, the ten Murdock empty slots, the source hashes and
// the deterministic JSON/JS twins. Matching KJV-shaped slot counts are treated
// as the module's declared Versification=KJV only; fidelity is asserted from the
// actual text, never from count equality.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NT = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
const PIN = {
  peshitta: '1a2dfaaabaeca19e299160f0159953cc395962f65561b76af561a3ff89959d9b',
  murdock: 'ec34bd7d100067058da280a99f50da9757333242489b06ffd26766c042342bbd',
};
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const KJV = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/kjv.json'), 'utf8')).books;
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function readZtext(id, encoding) {
  const dir = path.join(ROOT, 'build/sources', id, 'module/modules/texts/ztext', id);
  const bzs = fs.readFileSync(path.join(dir, 'nt.bzs'));
  const bzv = fs.readFileSync(path.join(dir, 'nt.bzv'));
  const bzz = fs.readFileSync(path.join(dir, 'nt.bzz'));
  assert.equal(bzs.length % 12, 0, `${id} bzs`);
  assert.equal(bzv.length % 10, 0, `${id} bzv`);
  const blocks = [];
  for (let at = 0; at < bzs.length; at += 12) {
    const start = bzs.readUInt32LE(at), size = bzs.readUInt32LE(at + 4), expected = bzs.readUInt32LE(at + 8);
    assert(start + size <= bzz.length, `${id} block bounds`);
    const block = zlib.inflateSync(bzz.subarray(start, start + size));
    assert.equal(block.length, expected, `${id} block inflate size`);
    blocks.push(block);
  }
  const slots = [];
  for (let at = 0; at < bzv.length; at += 10) {
    const block = bzv.readUInt32LE(at), offset = bzv.readUInt32LE(at + 4), length = bzv.readUInt16LE(at + 8);
    if (!length) { slots.push(''); continue; }
    assert(block < blocks.length && offset + length <= blocks[block].length, `${id} slot bounds`);
    const bytes = blocks[block].subarray(offset, offset + length);
    slots.push(encoding === 'latin1' ? bytes.toString('latin1') : new TextDecoder(encoding, { fatal: true }).decode(bytes));
  }
  return slots;
}

// Map the raw slot order (declared KJV versification) to reference ids.
function mapRefs(slots) {
  const map = {};
  let cursor = 2;
  for (const book of NT) {
    cursor += 1;
    KJV[book].forEach((chapter, c) => {
      cursor += 1;
      chapter.forEach((_, v) => { map[`${book}.${c + 1}.${v + 1}`] = cursor; cursor += 1; });
    });
  }
  assert.equal(cursor, slots.length, 'index extent');
  return map;
}

function twin(id, json) {
  const ctx = { window: {} };
  vm.runInNewContext(read(`data/${id}.js`), ctx);
  assert.equal(JSON.stringify(ctx.window.MARANATHA_TRANSLATIONS[id]), JSON.stringify(json), `${id} JS/JSON twin`);
}

for (const id of ['peshitta', 'murdock']) {
  const manifestBytes = fs.readFileSync(path.join(ROOT, 'build/sources', id, 'import-source-files.json'));
  assert.equal(sha(manifestBytes), PIN[id], `${id} manifest pin`);
  const manifest = JSON.parse(manifestBytes);
  for (const entry of manifest.files) {
    const target = path.resolve(ROOT, 'build/sources', id, entry.path);
    assert(target.startsWith(path.join(ROOT, 'build/sources', id) + path.sep), `${id} safe path`);
    assert.equal(sha(fs.readFileSync(target)), entry.sha256, `${id} file hash ${entry.path}`);
  }
  assert.equal(manifest.files.find(f => f.path.endsWith('.zip')).sha256, manifest.archiveSha256, `${id} archive declaration`);

  const conf = fs.readFileSync(path.join(ROOT, 'build/sources', id, 'module/mods.d', `${id}.conf`), 'utf8');
  assert(conf.includes('DistributionLicense=Public Domain'), `${id} distribution`);
  if (id === 'peshitta') {
    assert(conf.includes('Versification=KJV'), 'peshitta versification');
    assert(conf.includes('Direction=RtoL'), 'peshitta direction');
  }

  const data = JSON.parse(read(`data/${id}.json`));
  twin(id, data);

  const encoding = id === 'murdock' ? 'latin1' : 'utf-8';
  const slots = readZtext(id, encoding);
  const refs = mapRefs(slots);
  const raw = ref => slots[refs[ref]];
  const meta = {};

  const empty = [];
  for (const ref of Object.keys(refs)) {
    let text = raw(ref);
    if (id === 'peshitta') {
      text = text.replace(/<(?:chapter|div)\b[^>]*\/>/g, '');
      assert(!text.includes('<') && !text.includes('>'), `peshitta markup ${ref}`);
    } else {
      text = text.replace(/<RF>([\s\S]*?)<Rf>/g, '');
      text = text.replace(/<F[Ii]>/g, '');
      assert(!text.includes('<') && !text.includes('>'), `murdock markup ${ref}`);
    }
    meta[ref] = text.trim();
    if (!meta[ref]) empty.push(ref);
  }

  const notes = {};
  if (id === 'murdock') {
    let cursor = 2;
    for (const book of NT) {
      cursor += 1;
      KJV[book].forEach((chapter, c) => {
        cursor += 1;
        chapter.forEach((_, v) => {
          const ref = `${book}.${c + 1}.${v + 1}`;
          for (const m of slots[cursor].matchAll(/<RF>([\s\S]*?)<Rf>/g)) {
            (notes[book] ||= {})[c + 1] ||= [];
            notes[book][c + 1].push({ verse: v + 1, text: m[1] });
          }
          cursor += 1;
        });
      });
    }
  }

  // Explicit source-marker and native-reference conversions, reproduced from
  // the raw bytes independently.
  const conversions = {};
  if (id === 'peshitta') {
    const combined = raw('MRK.9.49');
    assert.equal(combined.split(' 50 ').length, 2, 'Mark 9:50 explicit marker');
    const [a, z] = combined.split(' 50 ');
    assert(a.trim().endsWith('܀') && z.replace(/<(?:chapter|div)\b[^>]*\/>/g, '').trim().endsWith('܀'), 'Mark 9:50 boundary punctuation');
    conversions['MRK.9.49'] = a.trim();
    conversions['MRK.9.50'] = z.replace(/<(?:chapter|div)\b[^>]*\/>/g, '').trim();
    assert.equal(raw('MRK.9.50'), '', 'Mark 9:50 raw slot must be empty');
    assert.equal(empty.filter(r => r !== 'MRK.9.50').length, 0, `peshitta unexpected empty slots: ${empty}`);
    assert(meta['1CO.12.3'].includes('ܕܡܪܝܐ ܗܘ ܝܫܘܥ'), 'MarYa 1 Cor 12:3');
    assert(meta['ROM.10.9'].includes('ܒܡܪܢ ܝܫܘܥ') && !meta['ROM.10.9'].includes('ܡܪܝܐ'), 'Romans 10:9 distinct form');
  } else {
    const wrappers = [
      { ref: 'ROM.7.25', next: 'ROM.7.26', delim: ' [ (Romans 7:26) ' },
      { ref: '3JN.1.14', next: '3JN.1.15', delim: ' [ (III John 1:15) ' },
      { ref: 'REV.12.17', next: 'REV.12.18', delim: ' [ (Revelation of John 12:18) ' },
    ];
    for (const w of wrappers) {
      const text = meta[w.ref];
      assert.equal(text.split(w.delim).length, 2, `${w.ref} wrapper`);
      assert(text.endsWith(' ]'), `${w.ref} wrapper terminator`);
      const [a, z] = text.split(w.delim);
      conversions[w.ref] = a.trim();
      conversions[w.next] = z.slice(0, -2).trim();
    }
    assert.deepEqual(empty.slice().sort(), ['2CO.13.14', 'ACT.19.41', 'ACT.20.17', 'LUK.18.35', 'MAT.26.30', 'MAT.26.45', 'MRK.11.19', 'MRK.4.10', 'MRK.8.19', 'MRK.9.31'], 'murdock empty slots');
    for (const [book, next, chapter] of [['ROM', 'ROM.7.26', 7], ['3JN', '3JN.1.15', 1], ['REV', 'REV.12.18', 12]]) {
      assert.equal(data.books[book][chapter - 1][KJV[book][chapter - 1].length], conversions[next], `${next} routed`);
    }
  }

  // Every indexed position: transformed raw text must equal the stored text.
  let records = 0;
  for (const book of NT) {
    assert(data.books[book], `${id} missing ${book}`);
    assert.equal(data.books[book].length, KJV[book].length, `${id} ${book} chapters`);
    KJV[book].forEach((chapter, c) => {
      const stored = data.books[book][c];
      for (let v = 0; v < chapter.length; v++) {
        const ref = `${book}.${c + 1}.${v + 1}`;
        let expected = conversions[ref] !== undefined ? conversions[ref] : meta[ref];
        if (conversions[ref] === undefined && expected === '' && (ref === 'MRK.9.50' || false)) expected = '';
        const actual = stored[v] === undefined ? '' : stored[v];
        assert.equal(actual, expected, `${id} ${ref}`);
        records++;
      }
    });
  }
  // Recovered native units extend some chapters beyond their KJV length.
  for (const book of NT) {
    if (id === 'murdock') {
      const extra = { ROM: [6, 26], '3JN': [0, 15], REV: [11, 18] }[book];
      if (extra) assert.equal(data.books[book][extra[0]].length, extra[1], `${id} ${book} native length`);
    }
  }

  // Footnotes and unit metadata.
  if (id === 'murdock') {
    let total = 0;
    for (const book of Object.keys(notes)) for (const chapter of Object.keys(notes[book])) {
      const actual = data.sourceNotes[book][chapter];
      assert(actual, `murdock note ${book}.${chapter}`);
      assert.equal(actual.length, notes[book][chapter].length, `murdock note count ${book}.${chapter}`);
      notes[book][chapter].forEach((note, i) => {
        assert.equal(actual[i].type, 'footnote');
        assert.equal(actual[i].sourceMarker, 'GBF RF');
        assert.equal(actual[i].verse, note.verse);
        assert.equal(actual[i].text, note.text, `murdock note text ${book}.${chapter}.${i}`);
        total++;
      });
    }
    assert.equal(total, 19, 'murdock footnote total');
    assert.equal(data.sourceInventory.footnotes, 19);
    assert(!JSON.stringify(data.books).includes('MarYa'), 'murdock must not add MarYa');
    assert(!JSON.stringify(data.books).includes('ܡܪܝܐ'), 'murdock must not embed Syriac MarYa');
  } else {
    assert.equal(JSON.stringify(data.sourceNotes), '{}');
    assert.equal(data.sourceInventory.footnotes, 0);
    for (const book of ['2PE', '2JN', '3JN', 'JUD', 'REV']) {
      assert(data.bookProvenance[book]?.note, `peshitta provenance ${book}`);
    }
    assert.equal(Object.keys(data.bookProvenance).length, 5);
  }

  // Inventory, OT absence, comparison exceptions.
  assert.equal(data.sourceInventory.books, 27);
  assert.equal(data.sourceInventory.chapters, 260);
  assert.equal(data.sourceInventory.records, id === 'peshitta' ? 7957 : 7960);
  assert.equal(data.language, id === 'peshitta' ? 'syr' : 'en');
  assert.equal(data.direction, id === 'peshitta' ? 'rtl' : 'ltr');
  assert.equal(data.scope, 'NT');
  assert.equal(data.books.GEN, undefined);
  assert.equal(data.books.PSA, undefined);
  assert(data.versification.ROM?.[14], `${id} Romans 14 exception`);
  if (id === 'murdock') {
    assert(data.versification.ROM?.[7] && data.versification['3JN']?.[1] && data.versification.REV?.[12] && data.versification.REV?.[13]);
  }
  const rawOtvPath = path.join(ROOT, 'build/sources', id, 'module/modules/texts/ztext', id, 'ot.bzv');
  if (fs.existsSync(rawOtvPath)) {
    const rawOtv = fs.readFileSync(rawOtvPath);
    let otPopulated = 0;
    for (let at = 0; at < rawOtv.length; at += 10) if (rawOtv.readUInt16LE(at + 8)) otPopulated++;
    assert.equal(otPopulated, 0, `${id} must ship no OT text`);
  } else {
    assert(Object.keys(data.books).every(b => NT.includes(b)), `${id} must not invent OT books`);
  }
  console.log(`Independent ${id} audit OK: ${data.sourceInventory.records} indexed units, ${data.sourceInventory.footnotes} footnotes, source hashes and twins verified.`);
}

// Ten Murdock empty slots: evidence that each missing KJV verse's wording is
// present in an adjacent indexed slot (merged/shifted residue), not omitted.
const murdock = JSON.parse(read('data/murdock.json'));
const residue = [
  ['MAT.26.30', 'MAT.26.29', 'went forth to the mount of Olives'],
  ['MAT.26.45', 'MAT.26.46', 'Sleep on now, and take rest'],
  ['MRK.4.10', 'MRK.4.9', 'when they were by themselves'],
  ['MRK.8.19', 'MRK.8.18', 'When I broke the five loaves to five thousand'],
  ['MRK.9.31', 'MRK.9.30', 'he taught his disciples, and said to them'],
  ['MRK.11.19', 'MRK.11.18', 'when it was evening, they went out from the city'],
  ['LUK.18.35', 'LUK.18.34', 'a blind man was sitting by the side of the way, begging'],
  ['ACT.19.41', 'ACT.19.40', 'he dismissed the assembly'],
  ['ACT.20.17', 'ACT.20.16', 'he sent and called the Elders of the church at Ephesus'],
  ['2CO.13.14', '2CO.13.13', 'the communion of the Holy Spirit be with you all'],
];
for (const [gap, neighbor, anchor] of residue) {
  const [gb, gc, gv] = gap.split('.');
  const [nb, nc, nv] = neighbor.split('.');
  assert.equal(murdock.books[gb][gc - 1][gv - 1], '', `${gap} must stay empty`);
  assert.equal(murdock.verseMetadata[gb][gc][gv].status, 'source-gap', `${gap} metadata`);
  assert(murdock.books[nb][nc - 1][nv - 1].includes(anchor), `${gap} residue evidence in ${neighbor}`);
}
console.log('Independent Murdock empty-slot audit OK: all ten are merged/shifted residue in an adjacent indexed slot, not omissions; none were filled.');
