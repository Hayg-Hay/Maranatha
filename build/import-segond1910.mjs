// import-segond1910.mjs
//
// Normalizes build/sources/segond1910/fraLSG_vpl.txt into data/segond1910.json
// (+ a window-global data/segond1910.js twin — see build/import-web.mjs for the
// fuller explanation of why both exist; same pattern here).
//
// SOURCE: eBible.org, https://eBible.org/Scriptures/fraLSG_vpl.zip — the Louis
// Segond 1910 (translation ID fraLSG, abbreviation F10), public domain. eBible
// states it in both languages on its own page: "Cette Bible est dans le domaine
// public. Il n'est pas protégé par copyright. This Bible is in the Public
// Domain. It is not copyrighted." Format is the BibleWorks VPL ("verse per
// line") plain text: one verse per line as `BOOK C:V text`, e.g.
// `GEN 1:1 Au commencement, Dieu créa les cieux et la terre.` — the same
// verse-indexed book/chapter/verse/text contract as the KJV/WEB JSON imports,
// the Byzantine CSV, and import-luther1912.mjs.
//
// AUDIT (scan of the full raw source, not assumed clean because it is the same
// host as Luther 1912):
//   - Over-escaping artifacts: ZERO literal backslashes and ZERO `\"`
//     sequences in all 31,170 lines. (No WEB SQL-dump analogue.)
//   - Stray/bogus rows: ZERO malformed lines, 0 empty texts, 0 duplicate
//     book/chapter/verse references, 66 distinct book codes. Exactly one
//     bracket-wrapped row exists — ACT 28:29, a genuine verse the edition
//     brackets as a textual variant. It is NOT the KJV `[]`-at-3-John-1:15
//     empty-placeholder class, so NO stray-row filter is added.
//   - French orthography (observed, NOT normalized): apostrophes are
//     consistently U+2019 (`’`), with zero ASCII U+0027; no guillemets « »,
//     no NBSP or thin spaces, no HTML entities. Accents, the œ/Œ ligature,
//     curly double quotes, ellipsis and en/em dashes are real text and are
//     preserved verbatim. The importer only trims surrounding whitespace,
//     same as every other VPL/row importer here.
//
// SCOPE: standard 66-book Protestant canon only — this source has no
// deuterocanon, same reasoning as KJV/WEB/Luther 1912. The 7 Catholic-only
// books are expected-missing and handled by validate.mjs and the UI.
//
// BOOK CODES: confirmed by direct inspection of the raw fraLSG file, not
// assumed from the German table — fraLSG uses the SAME BibleWorks
// abbreviations as deu1912 (EZE/EZK, JOE/JOL, JOH/JHN, MAR/MRK, NAH/NAM,
// PHI/PHP, SOL/SNG, JAM/JAS, 1JO/1JN, ...), 66 distinct codes.
//
// VERSIFICATION RECONCILIATION (Phase B — see
// build/IMPORT-SEGOND1910-VERSIFICATION.md for the design and
// build/sources/segond1910/versification-report.md for the full per-item
// pass/fail log). fraLSG uses a Hebrew-continental versification that differs
// from the KJV/WEB-shaped canon.js. Only the reviewed-and-approved transforms
// are applied here:
//   - Rule 1: 62 Psalms (61 verified + the reviewed PSA 18 exception) have their
//     standalone Masoretic superscription as leading verse(s). Strip it into a
//     `titles` map. Verified per Psalm by title vocabulary + length; PSA 18 is
//     an explicit reviewed exception (longest superscription in the Psalter,
//     parallels 2 Sam 22).
//   - Rule 2: 16 reviewed chapter windows — 15 adjacent pairs plus the JOB 38..41
//     four-chapter cascade — whose signed verse offsets sum to exactly zero are
//     re-drawn by re-chunking the concatenated verses to canon's chapter lengths
//     (order-preserving).
//   - Verified MERGEs (6): Segond splits a single canon verse into two source
//     verses (1SA 20:42, 1KI 22:43, MRK 9:50, MRK 10:52, REV 13:1, 3JN 1:14);
//     rejoin them (safe concatenation). REV 12:18 + 13:1 is the one
//     cross-chapter case.
//   - Verified SPLITs (4): the reverse — one Segond verse (JOB 34:36, ISA 63:19,
//     2CO 13:12, ACT 19:40) contains an unambiguous sentence break exactly where
//     the canon boundary falls; split it there. Applied only where the break is
//     unambiguous (second half opens with the KJV/WEB continuation's word).
//
// After these, every verse-count mismatch is a boundary/split artifact except
// canon's two provisional Greek-addition gaps (EST, DAN) and the already-known
// Romans 14 doxology variant. The three cases originally suspected of being
// textual variants (3JN 1:15, 2CO 13:13, ACT 19:40) all turned out to be
// boundary artifacts, so no known-variants.js entries are needed.
//
// Usage:
//   node build/import-segond1910.mjs
//   node build/validate.mjs data/segond1910.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

// BibleWorks VPL book code -> Maranatha canon ID (see data/canon.js). Codes
// verified against the raw fraLSG source directly; the target IDs are the same
// 66-book subset used by import-kjv.mjs/import-web.mjs/import-luther1912.mjs.
const VPL_TO_CANON = {
  GEN: 'GEN', EXO: 'EXO', LEV: 'LEV', NUM: 'NUM', DEU: 'DEU',
  JOS: 'JOS', JDG: 'JDG', RUT: 'RUT', '1SA': '1SA', '2SA': '2SA',
  '1KI': '1KI', '2KI': '2KI', '1CH': '1CH', '2CH': '2CH', EZR: 'EZR',
  NEH: 'NEH', EST: 'EST', JOB: 'JOB', PSA: 'PSA', PRO: 'PRO',
  ECC: 'ECC', SOL: 'SNG', ISA: 'ISA', JER: 'JER', LAM: 'LAM',
  EZE: 'EZK', DAN: 'DAN', HOS: 'HOS', JOE: 'JOL', AMO: 'AMO',
  OBA: 'OBA', JON: 'JON', MIC: 'MIC', NAH: 'NAM', HAB: 'HAB',
  ZEP: 'ZEP', HAG: 'HAG', ZEC: 'ZEC', MAL: 'MAL',
  MAT: 'MAT', MAR: 'MRK', LUK: 'LUK', JOH: 'JHN', ACT: 'ACT',
  ROM: 'ROM', '1CO': '1CO', '2CO': '2CO', GAL: 'GAL', EPH: 'EPH',
  PHI: 'PHP', COL: 'COL', '1TH': '1TH', '2TH': '2TH', '1TI': '1TI',
  '2TI': '2TI', TIT: 'TIT', PHM: 'PHM', HEB: 'HEB', JAM: 'JAS',
  '1PE': '1PE', '2PE': '2PE', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN',
  JUD: 'JUD', REV: 'REV',
};

const LINE = /^([0-9A-Z]{3}) (\d+):(\d+) (.*)$/;

// Rule 1: superscription vocabulary. Case-insensitive, anywhere in the verse.
const TITLE_RE = /Psaume|Cantique|Hymne|Pri[eè]re|Au chef des chantres|De David|Des fils de (Cor|Kor)é|Maskil|Miktam/i;

// Psalms whose superscription legitimately exceeds the 150-char suspicion
// threshold. Reviewed and approved: PSA 18 is the longest superscription in
// the Psalter and parallels the introduction to 2 Samuel 22 almost verbatim.
const LONG_TITLE_OK = new Set([18]);

// Rule 2: verified exact-conserving chapter windows (all reviewed; the signed
// offsets sum to exactly zero and the boundary text was read). Most are a pair;
// JOB 38..41 is the one 4-chapter cascade (re-chunked the same, order-preserving
// way). The window is re-drawn by concatenating the source chapters and slicing
// them back out at canon's chapter lengths.
const CHAPTER_WINDOWS = [
  ['EXO', 7, 8], ['LEV', 5, 6], ['NUM', 29, 30], ['1SA', 23, 24],
  ['2CH', 13, 14], ['ECC', 4, 5], ['ECC', 11, 12], ['SNG', 6, 7],
  ['ISA', 8, 9], ['EZK', 20, 21], ['HOS', 1, 2], ['HOS', 11, 12],
  ['JON', 1, 2], ['MIC', 4, 5], ['NAM', 1, 2], ['JOB', 38, 41],
];

// Verified verse merges: the source splits one canon verse into two source
// verses; rejoin them with a single space (safe concatenation — nothing is
// invented). Reuses the OSHB MERGE concept. `refs` are in reading order and
// `into` is the canon destination (also the surviving source slot).
const MERGES = [
  // OSHB documented the same split as "OSHB 1Sam.20.42 + 1Sam.21.1 -> KJV 20.42".
  { book: '1SA', refs: [[20, 42], [20, 43]], into: [20, 42] },
  { book: '1KI', refs: [[22, 43], [22, 44]], into: [22, 43] },
  { book: 'MRK', refs: [[9, 50], [9, 51]], into: [9, 50] },
  { book: 'MRK', refs: [[10, 52], [10, 53]], into: [10, 52] },
  // The one CROSS-CHAPTER MERGE: Segond's last verse of Revelation 12 plus its
  // first verse of Revelation 13 are together canon Revelation 13:1. Source
  // refs need not be in the same chapter — do not assume same-chapter MERGEs.
  { book: 'REV', refs: [[12, 18], [13, 1]], into: [13, 1] },
  // Segond splits canon 3 John 1:14 (final greeting) into source 14 + 15;
  // content identical, same closing-verse pattern as Mark.
  { book: '3JN', refs: [[1, 14], [1, 15]], into: [1, 14] },
];

// Verified verse splits (the reverse of MERGE): one Segond verse corresponds to
// two canon verses and contains an unambiguous sentence break exactly where the
// canon boundary falls. `second` is the literal prefix that begins the second
// canon verse; applied only where the break is unambiguous (never guessed), and
// only because the KJV/WEB boundary falls exactly there.
const SPLITS = [
  // "...comme font les méchants! Car il ajoute..." = KJV "...for wicked men."
  // + "For he addeth rebellion unto his sin..."  -> canon JOB 34:36 / 34:37.
  { book: 'JOB', from: [34, 36], second: 'Car il ajoute', into: [34, 37] },
  // "...appelé de ton nom… Oh! Si tu déchirais les cieux..." = KJV "...called
  // by thy name." + "Oh that thou wouldest rend the heavens..." -> canon
  // ISA 63:19 / 64:1 (cross-chapter: the second part becomes ISA 64:1).
  { book: 'ISA', from: [63, 19], second: 'Oh! Si tu déchirais', into: [64, 1] },
  // "...un saint baiser. Tous les saints..." = KJV "...an holy kiss." + "All
  // the saints salute you." -> canon 2CO 13:12 / 13:13. Segond merged the two
  // greeting sentences; the benediction then falls at 13:13 (canon 13:14).
  { book: '2CO', from: [13, 12], second: 'Tous les saints', into: [13, 13] },
  // "...cet attroupement. Après ces paroles..." = KJV "...this concourse." +
  // "And when he had thus spoken, he dismissed the assembly." -> canon ACT
  // 19:40 / 19:41.
  { book: 'ACT', from: [19, 40], second: 'Après ces paroles', into: [19, 41] },
];

function parseCanon() {
  const src = fs.readFileSync(path.join(dir, '..', 'data', 'canon.js'), 'utf8');
  const json = src.slice('window.MARANATHA_CANON='.length).trim();
  const canon = JSON.parse(json.endsWith(';') ? json.slice(0, -1) : json);
  return Object.fromEntries(canon.books.map(b => [b.id, b]));
}

function applyMerges(books) {
  for (const { book, refs, into } of MERGES) {
    const texts = refs.map(([ch, vs]) => {
      const arr = books[book][ch - 1];
      if (!arr || arr[vs - 1] === undefined) {
        throw new Error(`${book} ${ch}:${vs}: MERGE source verse not found`);
      }
      return arr[vs - 1];
    });
    const joined = texts.join(' ').replace(/\s+/g, ' ').trim();
    books[book][into[0] - 1][into[1] - 1] = joined;
    for (const [ch, vs] of refs) {
      if (ch === into[0] && vs === into[1]) continue;
      books[book][ch - 1].splice(vs - 1, 1);
    }
  }
}

function applySplits(books) {
  for (const { book, from, second, into } of SPLITS) {
    const [fc, fv] = from;
    const src = books[book][fc - 1][fv - 1];
    const idx = src.indexOf(second);
    if (idx <= 0) {
      throw new Error(`${book} ${fc}:${fv}: SPLIT marker ${JSON.stringify(second)} not found or at verse start`);
    }
    books[book][fc - 1][fv - 1] = src.slice(0, idx).trim();
    books[book][into[0] - 1].splice(into[1] - 1, 0, src.slice(idx).trim());
  }
}

function applyPsalmTitles(books, canonById) {
  const expected = canonById.PSA.chapters;
  const titles = {};
  let applied = 0;
  for (let c = 1; c <= expected.length; c++) {
    const segCh = books.PSA[c - 1];
    const exp = expected[c - 1];
    const diff = segCh.length - exp;
    if (diff === 0) continue;
    if (diff !== 1 && diff !== 2) {
      throw new Error(`PSA ${c}: unexpected verse offset ${diff} (expected 0, 1, or 2)`);
    }
    const leading = segCh.slice(0, diff);
    if (!leading.some(v => TITLE_RE.test(v))) {
      throw new Error(`PSA ${c}: offset ${diff} but leading verse(s) lack superscription vocabulary: ${JSON.stringify(leading)}`);
    }
    if (!(leading.every(v => v.length <= 150) || LONG_TITLE_OK.has(c))) {
      throw new Error(`PSA ${c}: superscription exceeds 150 chars and is not in the approved exception list`);
    }
    titles[String(c)] = leading.join(' ');
    books.PSA[c - 1] = segCh.slice(diff);
    applied++;
  }
  if (applied !== 62) {
    throw new Error(`Expected 62 Psalm superscription offsets, applied ${applied}`);
  }
  return titles;
}

function applyChapterWindows(books, canonById) {
  for (const [book, from, to] of CHAPTER_WINDOWS) {
    const expected = canonById[book].chapters;
    const flat = [];
    for (let c = from; c <= to; c++) flat.push(...books[book][c - 1]);
    const expectedTotal = expected.slice(from - 1, to).reduce((a, b) => a + b, 0);
    if (flat.length !== expectedTotal) {
      throw new Error(`${book} ${from}-${to}: window has ${flat.length} verses, canon expects ${expectedTotal} (no longer conserves exactly)`);
    }
    let idx = 0;
    for (let c = from; c <= to; c++) {
      const n = expected[c - 1];
      books[book][c - 1] = flat.slice(idx, idx + n);
      idx += n;
    }
  }
}

function main() {
  const sourcePath = path.join(dir, 'sources', 'segond1910', 'fraLSG_vpl.txt');
  const raw = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();

  const books = {};
  for (const line of lines) {
    const m = LINE.exec(line);
    // Strict parse: a non-matching line means the source format changed, so
    // fail loudly rather than silently dropping verses.
    if (!m) throw new Error(`Unparseable VPL line: ${JSON.stringify(line)}`);
    const [, code, chapter, verse, text] = m;
    const id = VPL_TO_CANON[code];
    if (!id) throw new Error(`Unmapped VPL book code ${code}`);
    books[id] = books[id] || [];
    books[id][chapter - 1] = books[id][chapter - 1] || [];
    books[id][chapter - 1][verse - 1] = text.trim();
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 66) {
    throw new Error(`Expected 66 mapped books, got ${bookCount}`);
  }

  const canonById = parseCanon();
  applyMerges(books);
  applySplits(books);
  const titles = applyPsalmTitles(books, canonById);
  applyChapterWindows(books, canonById);

  writeTranslation({
    id: 'segond1910',
    label: 'Louis Segond (1910)',
    source: 'eBible.org, fraLSG_vpl.zip (BibleWorks VPL) — Louis Segond 1910, public domain. Standard 66-book edition; does not include the Catholic deuterocanonical books.',
    books,
    titles,
  });

  const jsonPath = path.join(dir, '..', 'data', 'segond1910.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');

  const jsPath = path.join(dir, '..', 'data', 'segond1910.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['segond1910']=${jsonData.trim()};\n`);
  console.log(`Wrote ${jsPath}`);
  console.log(`Mapped ${bookCount}/66 standard books (no deuterocanon in this source).`);
  console.log(`Applied ${Object.keys(titles).length} Psalm superscription titles + ${CHAPTER_WINDOWS.length} chapter windows + ${MERGES.length} verse merges + ${SPLITS.length} verse splits.`);
}

main();
