// import-armwestern.mjs
//
// Normalizes build/sources/armwestern/armwestern.source.json into
// data/armwestern.json (+ a window-global data/armwestern.js twin — see
// build/import-web.mjs for the fuller explanation of why both exist; same
// pattern here).
//
// SOURCE: CrossWire SWORD module "ArmWestern" (mods.d/armwestern.conf) —
// "1853 Western Armenian NT", DistributionLicense=Public Domain,
// TextSource="Slavic Bible via http://unbound.biola.edu". The raw module is
// SWORD's zText binary format (compressed + block-indexed), not plain text,
// so it was decoded once with the Python `pysword` library and cached as
// plain JSON at build/sources/armwestern/armwestern.source.json — this
// script only ever reads that cached JSON, same as every other importer
// reads its own cached build/sources/ file.
//
// SCOPE: New Testament only, 27 books. The module ships no OT data at all
// (no ot.bz* files in the original zip). This is a real gap, not an
// oversight: Western Armenian (this text's register, ~19th c. literary
// language) is a different register from Classical/Grabar Armenian (the
// register of the Zohrab 1805 OT candidate identified for this project).
// Pairing this NT with a Classical-register OT under one "Armenian"
// translation would mix registers within a single edition — flagged here
// so that decision gets made deliberately later, not by default.
//
// VERSIFICATION: this module's default SWORD versification is KJV, and its
// per-chapter verse counts were confirmed to match Maranatha's canon.js NT
// entries exactly before this importer was written (7,957 verses total,
// same as standard KJV NT) — see the extraction script's own verification
// step. This means, unusually for this project, the NT needed no
// chapter/verse offset reconciliation at all.
//
// TEXTUAL BASE: worth recording for known-variants.js — this translation
// includes Mark 16:9-20 (long ending), John 7:53-8:11 (pericope adulterae),
// 1 John 5:7 (Comma Johanneum), Acts 8:37, and Romans 16:24, all confirmed
// present in the extracted text. That's a Textus Receptus-family text (like
// KJV), not Byzantine Majority (like this project's `byz` translation) —
// the Comma Johanneum in particular is a TR/Vulgate-only reading that
// Byzantine Majority editions generally lack. Cross-translation comparison
// against `byz` at these specific verses is expected to show real,
// documentable divergence, not an import bug.
//
// KNOWN GAPS: 10 of the source module's 7,957 verses are genuinely blank at
// the raw SWORD data level (confirmed by inspecting the module's own byte
// offsets directly, not a decoding artifact) — Matt 17:27, Mark 9:50,
// Acts 7:60, Acts 14:28, Acts 19:41, 2Cor 2:1, 2Cor 6:1, 2Cor 13:14,
// 1Thess 4:18, Heb 13:25. Eight of these are the final verse of their
// chapter; 2Cor 2:1 and 2Cor 6:1 are not. These are written through as
// empty strings (app.js already renders an empty verse slot as
// "(not available)" via the missing-verse cellFor() branch) rather than
// silently dropped or guessed at. A real fix means finding a second,
// independently-produced Western Armenian NT source to cross-check and
// patch these 10 verses against — not inventing wording from context.
//
// Usage:
//   node build/import-armwestern.mjs
//   node build/validate.mjs data/armwestern.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// SWORD/OSIS book abbreviation -> Maranatha canon ID. Order matches
// canon.js's NT ordering.
const BOOK_MAP = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT',
  Rom: 'ROM', '1Cor': '1CO', '2Cor': '2CO', Gal: 'GAL', Eph: 'EPH',
  Phil: 'PHP', Col: 'COL', '1Thess': '1TH', '2Thess': '2TH',
  '1Tim': '1TI', '2Tim': '2TI', Titus: 'TIT', Phlm: 'PHM', Heb: 'HEB',
  Jas: 'JAS', '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN',
  '2John': '2JN', '3John': '3JN', Jude: 'JUD', Rev: 'REV',
};

function main() {
  const sourcePath = path.join(dir, 'sources', 'armwestern', 'armwestern.source.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  const books = {};
  for (const [osisName, chapters] of Object.entries(source.books)) {
    const id = BOOK_MAP[osisName];
    if (!id) throw new Error(`Unmapped OSIS book name "${osisName}"`);
    books[id] = chapters;
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 27) {
    throw new Error(`Expected 27 mapped NT books, got ${bookCount}`);
  }

  writeTranslation({
    id: 'armwestern',
    label: 'Western Armenian NT (1853)',
    source: 'CrossWire SWORD module "ArmWestern" — 1853 Western Armenian NT, Public Domain. TextSource: Slavic Bible via unbound.biola.edu. New Testament only (27 books); no OT data exists in the source module. Decoded from SWORD zText format via pysword and cached at build/sources/armwestern/armwestern.source.json. 10 verses are genuinely blank in the source itself (see this script\'s header comment for the full list) and are written through as empty strings.',
    books,
  });

  const jsonPath = path.join(dir, '..', 'data', 'armwestern.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'armwestern.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['armwestern']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/27 NT books. No OT in this source.`);
}

main();
