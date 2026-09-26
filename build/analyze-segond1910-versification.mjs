// analyze-segond1910-versification.mjs
//
// Phase B classification/verification engine for the Segond 1910 versification
// reconciliation. This is an ANALYSIS tool — it does NOT place any verses and
// does NOT touch import-segond1910.mjs or data/segond1910.json. It implements
// the two rules from build/IMPORT-SEGOND1910-VERSIFICATION.md, verifies each
// candidate, and writes build/sources/segond1910/versification-report.md with a
// per-item pass/fail log (Psalm classifications + chapter-window conservation
// checks + the unresolved list).
//
// Usage: node build/analyze-segond1910-versification.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');

// ---------------------------------------------------------------- inputs ----
const canonSrc = fs.readFileSync(path.join(root, 'data', 'canon.js'), 'utf8');
const canonJson = canonSrc.slice('window.MARANATHA_CANON='.length).trim();
const canon = JSON.parse(canonJson.endsWith(';') ? canonJson.slice(0, -1) : canonJson);
const canonById = Object.fromEntries(canon.books.map(b => [b.id, b]));

let knownVariants = [];
const variantsPath = path.join(root, 'data', 'known-variants.js');
if (fs.existsSync(variantsPath)) {
  const src = fs.readFileSync(variantsPath, 'utf8');
  const marker = 'window.MARANATHA_KNOWN_VARIANTS';
  const i = src.indexOf(marker);
  if (i !== -1) {
    const j = src.indexOf('=', i);
    const json = src.slice(j + 1).trim();
    knownVariants = JSON.parse(json.endsWith(';') ? json.slice(0, -1) : json);
  }
}
const variantByKey = new Map(knownVariants.map(v => [`${v.book}:${v.chapter}`, v]));

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
const raw = fs.readFileSync(path.join(dir, 'sources', 'segond1910', 'fraLSG_vpl.txt'), 'utf8').replace(/^\uFEFF/, '');
const books = {};
for (const line of raw.split(/\r?\n/)) {
  if (line === '') continue;
  const m = LINE.exec(line);
  if (!m) throw new Error(`Unparseable VPL line: ${JSON.stringify(line)}`);
  const [, code, ch, vs, text] = m;
  const id = VPL_TO_CANON[code];
  books[id] = books[id] || [];
  books[id][ch - 1] = books[id][ch - 1] || [];
  books[id][ch - 1][vs - 1] = text.trim();
}

const diffOf = (bookId, chapterNum) => {
  const got = books[bookId] && books[bookId][chapterNum - 1] ? books[bookId][chapterNum - 1].length : 0;
  const exp = canonById[bookId].chapters[chapterNum - 1];
  return { got, exp, diff: got - exp };
};

// ---------------------------------------------------------------- Rule 1 ----
const TITLE_RE = /Psaume|Cantique|Hymne|Pri[èe]re|Au chef des chantres|De David|Des fils de (Cor|Kor)é|Maskil|Miktam/i;
const LENGTH_LIMIT = 150;

const psa = [];
const psaTitles = {};
for (let c = 1; c <= canonById.PSA.chapters.length; c++) {
  const { got, exp, diff } = diffOf('PSA', c);
  const titleVerses = books.PSA[c - 1].slice(0, Math.max(diff, 0));
  const lengths = titleVerses.map(t => t.length);
  const matched = [...new Set(titleVerses.flatMap(t => (t.match(new RegExp(TITLE_RE, 'gi')) || []).map(x => x.toLowerCase())))];
  let outcome;
  if (diff === 0) outcome = 'NO-OFFSET';
  else if (diff === 1 || diff === 2) {
    const vocabOk = titleVerses.some(t => TITLE_RE.test(t));
    const lengthOk = lengths.every(l => l <= LENGTH_LIMIT);
    if (vocabOk && lengthOk) outcome = 'PASS';
    else if (vocabOk && !lengthOk) outcome = 'REVIEW';
    else outcome = 'FAIL-VOCAB';
  } else outcome = 'UNEXPECTED';
  if (outcome === 'PASS') psaTitles[String(c)] = titleVerses.join(' ');
  psa.push({ c, got, exp, diff, k: diff, matched, lengths, outcome, title: titleVerses.join(' ') });
}

// ---------------------------------------------------------------- Rule 2 ----
const provisional = new Set(canon.books.filter(b => b.provisional).map(b => b.id));
const bookDiffs = {};
const nonzeroBooks = [];
for (const b of canon.books) {
  if (!books[b.id]) continue; // 7 deuterocanon books absent from this 66-book source
  const diffs = [];
  for (let c = 1; c <= b.chapters.length; c++) diffs.push(diffOf(b.id, c).diff);
  if (diffs.some(d => d !== 0)) { bookDiffs[b.id] = diffs; nonzeroBooks.push(b.id); }
}

const lastN = (bookId, chapterNum, n) => (books[bookId][chapterNum - 1] || []).slice(-n);
const firstN = (bookId, chapterNum, n) => (books[bookId][chapterNum - 1] || []).slice(0, n);

const windows = [];
for (const bookId of nonzeroBooks) {
  if (provisional.has(bookId)) continue;
  const diffs = bookDiffs[bookId];
  const hasPair = new Set();
  // size-2
  for (let i = 0; i + 1 < diffs.length; i++) {
    if (diffs[i] !== 0 && diffs[i] + diffs[i + 1] === 0) {
      windows.push({ bookId, start: i + 1, size: 2, diffs: [diffs[i], diffs[i + 1]], sum: 0 });
      hasPair.add(i);
    }
  }
  // size-3 that doesn't contain a conserving pair
  for (let i = 0; i + 2 < diffs.length; i++) {
    const d = [diffs[i], diffs[i + 1], diffs[i + 2]];
    if (d.some(x => x !== 0) && d[0] + d[1] + d[2] === 0 && !hasPair.has(i) && !hasPair.has(i + 1)) {
      windows.push({ bookId, start: i + 1, size: 3, diffs: d, sum: 0 });
    }
  }
}

// wider-span conservation candidates (size >= 4, exact sum zero), excluding any
// that fully contain an already-detected size-2/3 window.
const wider = [];
for (const bookId of nonzeroBooks) {
  if (provisional.has(bookId)) continue;
  const diffs = bookDiffs[bookId];
  for (let size = 4; size <= 8; size++) {
    for (let i = 0; i + size - 1 < diffs.length; i++) {
      const d = diffs.slice(i, i + size);
      if (!d.some(x => x !== 0) || d.reduce((a, b) => a + b, 0) !== 0) continue;
      const containsDetected = windows.some(w =>
        w.bookId === bookId && w.start >= i + 1 && w.start + w.size - 1 <= i + size);
      if (!containsDetected) {
        wider.push({ bookId, start: i + 1, size, diffs: d, sum: 0 });
      }
    }
  }
}
// keep only minimal wider windows (drop any that contains a smaller kept one)
wider.sort((a, b) => a.size - b.size || a.bookId.localeCompare(b.bookId) || a.start - b.start);
const widerKept = [];
for (const w of wider) {
  const contained = widerKept.some(k => k.bookId === w.bookId && k.start >= w.start && k.start + k.size - 1 <= w.start + w.size);
  if (!contained) widerKept.push(w);
}

// all chapter-pair checks (pass/fail), not only conserving ones
const pairChecks = [];
for (const bookId of nonzeroBooks) {
  if (provisional.has(bookId)) continue;
  const diffs = bookDiffs[bookId];
  for (let i = 0; i + 1 < diffs.length; i++) {
    if (diffs[i] === 0 && diffs[i + 1] === 0) continue;
    pairChecks.push({ bookId, start: i + 1, diffs: [diffs[i], diffs[i + 1]], sum: diffs[i] + diffs[i + 1] });
  }
}

// explained chapters
const explained = new Set();
for (const p of psa) if (p.outcome === 'PASS') explained.add(`PSA:${p.c}`);
for (const w of windows) for (let c = w.start; c < w.start + w.size; c++) explained.add(`${w.bookId}:${c}`);

// ---------------------------------------------------------------- unresolved -
// Raw-count candidates that were later resolved by seam review as boundary
// artifacts (3JN = MERGE; 2CO and ACT = SPLIT). They are classified neutrally
// here — NOT as textual variants, and with no known-variants implication. See
// the "Final reviewed disposition" section at the end of the report.
const BOUNDARY_CANDIDATES = new Set(['3JN:1', '2CO:13', 'ACT:19']);
const widerMark = new Map();
for (const w of widerKept) {
  for (let c = w.start; c < w.start + w.size; c++) {
    widerMark.set(`${w.bookId}:${c}`, `${w.bookId} ${w.start}..${w.start + w.size - 1} exact-conserving wider span (diffs ${w.diffs.join(', ')})`);
  }
}

const unresolved = [];
for (const bookId of nonzeroBooks) {
  const diffs = bookDiffs[bookId];
  for (let i = 0; i < diffs.length; i++) {
    if (diffs[i] === 0) continue;
    const key = `${bookId}:${i + 1}`;
    if (explained.has(key)) continue;
    const variant = variantByKey.get(key);
    const exp = canonById[bookId].chapters[i];
    let cls = 'unexplained';
    let note = '';
    if (provisional.has(bookId)) { cls = 'provisional'; note = 'provisional canon (Greek additions)'; }
    else if (variant) { cls = 'known-variant'; note = `known-variant acceptedCounts=[${variant.acceptedCounts.join(',')}]`; }
    else if (BOUNDARY_CANDIDATES.has(key)) { cls = 'boundary-candidate'; note = 'raw count mismatch; later resolved as a MERGE/SPLIT boundary artifact (see Final reviewed disposition)'; }
    else if (widerMark.has(key)) { cls = 'wider-span'; note = widerMark.get(key); }
    unresolved.push({
      bookId, chapter: i + 1, exp, got: exp + diffs[i], diff: diffs[i], cls, note,
    });
  }
}

// ---------------------------------------------------------------- report ----
const md = [];
const now = new Date().toISOString();
md.push('# Segond 1910 versification — classification report');
md.push('');
md.push(`Generated ${now} by \`build/analyze-segond1910-versification.mjs\`.`);
md.push('');
md.push('Analysis only. No data file or importer was modified. Source:');
md.push('`build/sources/segond1910/fraLSG_vpl.txt` vs KJV/WEB-shaped `data/canon.js`.');
md.push('');
md.push('> The classification tables below are computed against the **raw**, pre-transform');
md.push('> fraLSG source. Rows marked `boundary-candidate` / `unexplained` / `wider-span`');
md.push('> are candidates only; the reviewed, approved outcome is in the');
md.push('> **Final reviewed disposition** section at the end of this report.');
md.push('');

const passCount = psa.filter(p => p.outcome === 'PASS').length;
const review = psa.filter(p => p.outcome === 'REVIEW');
const failVocab = psa.filter(p => p.outcome === 'FAIL-VOCAB');
const unexpected = psa.filter(p => p.outcome === 'UNEXPECTED');
const totalDiffChapters = Object.values(bookDiffs).reduce((a, d) => a + d.filter(x => x !== 0).length, 0);

md.push('## Summary');
md.push('');
md.push(`- Chapters with a nonzero diff (excluding provisional books): **${totalDiffChapters}**`);
md.push(`- Rule 1 (Psalm superscription) PASS: **${passCount}** Psalms`);
md.push(`- Rule 1 REVIEW (vocab ok, >${LENGTH_LIMIT} chars): ${review.length}`);
md.push(`- Rule 1 FAIL-VOCAB: ${failVocab.length}`);
md.push(`- Rule 1 UNEXPECTED (diff not 0/1/2): ${unexpected.length}`);
md.push(`- Rule 2 conserving adjacent windows detected: **${windows.length}**`);
md.push(`- Rule 2 wider-span (4+ ch) exact-conserving candidates: **${widerKept.length}**`);
md.push(`- Unresolved nonzero chapters: **${unresolved.length}**`);
const byClass = {};
for (const u of unresolved) byClass[u.cls] = (byClass[u.cls] || 0) + 1;
md.push(`  - ${Object.entries(byClass).map(([k, v]) => `${k}: ${v}`).join('; ')}`);
md.push('');
md.push('### Rule 2 windows at a glance');
md.push('');
md.push('| book | chapters | diffs | sum |');
md.push('|---|---|---|---|');
for (const w of windows) md.push(`| ${w.bookId} | ${w.start}..${w.start + w.size - 1} | ${w.diffs.join(', ')} | ${w.sum} |`);
md.push('');

// Rule 1 full log
md.push('## Rule 1 — full Psalm classification log (all 150 chapters)');
md.push('');
md.push('`outcome`: PASS = title offset applied (after review); REVIEW = vocabulary matched but a leading verse exceeds 150 chars (NOT applied); FAIL-VOCAB = no title vocabulary (NOT applied); NO-OFFSET = counts already match; UNEXPECTED = diff not 0/1/2.');
md.push('');
md.push('| ch | canon | segond | k | matched markers | leading lengths | outcome |');
md.push('|---|---|---|---|---|---|---|');
for (const p of psa) {
  md.push(`| ${p.c} | ${p.exp} | ${p.got} | ${p.k} | ${p.matched.join(', ') || '—'} | ${p.lengths.join(', ') || '—'} | ${p.outcome} |`);
}
md.push('');

md.push('### Rule 1 REVIEW (needs manual look)');
md.push('');
if (!review.length) md.push('_none_');
for (const p of review) md.push(`- PSA ${p.c}: k=${p.k}, matched=[${p.matched.join(', ')}], lengths=[${p.lengths.join(', ')}] — ${JSON.stringify(p.title.slice(0, 220))}`);
md.push('');

md.push('### Rule 1 FAIL-VOCAB (needs manual look)');
md.push('');
if (!failVocab.length) md.push('_none_');
for (const p of failVocab) md.push(`- PSA ${p.c}: k=${p.k}, lengths=[${p.lengths.join(', ')}] — ${JSON.stringify(p.title.slice(0, 220))}`);
md.push('');

md.push('### Rule 1 UNEXPECTED');
md.push('');
if (!unexpected.length) md.push('_none_');
for (const p of unexpected) md.push(`- PSA ${p.c}: canon=${p.exp}, segond=${p.got}, diff=${p.diff}`);
md.push('');

// Rule 1 titles to preserve
md.push('## Rule 1 — superscription text captured for `titles` (PASS only)');
md.push('');
md.push('| ch | title text |');
md.push('|---|---|');
for (const [ch, text] of Object.entries(psaTitles)) md.push(`| ${ch} | ${text.replace(/\|/g, '\\|')} |`);
md.push('');

// Rule 2 pair checks
md.push('## Rule 2 — all adjacent chapter-pair conservation checks');
md.push('');
md.push('Every consecutive pair where at least one chapter differs. `sum` must be 0 (pass) for Rule 2 to apply.');
md.push('');
md.push('| book | ch | diff a | ch | diff b | sum | pass? |');
md.push('|---|---|---|---|---|---|---|');
for (const p of pairChecks) md.push(`| ${p.bookId} | ${p.start} | ${p.diffs[0]} | ${p.start + 1} | ${p.diffs[1]} | ${p.sum} | ${p.sum === 0 ? 'PASS' : 'no'} |`);
md.push('');

// Rule 2 windows detail with boundary text
md.push('## Rule 2 — conserving windows, with boundary text');
md.push('');
for (const w of windows) {
  md.push(`### ${w.bookId} ${w.start}..${w.start + w.size - 1} (diffs ${w.diffs.join(', ')}, sum ${w.sum})`);
  md.push('');
  for (let c = w.start; c < w.start + w.size - 1; c++) {
    md.push(`Boundary ${w.bookId} ${c} → ${c + 1}:`);
    md.push('');
    const lo = lastN(w.bookId, c, 2);
    lo.forEach((t, idx) => md.push(`- segond ${w.bookId} ${c}:${(books[w.bookId][c - 1].length - lo.length + idx + 1)} — ${t.slice(0, 300)}`));
    const hi = firstN(w.bookId, c + 1, 2);
    hi.forEach((t, idx) => md.push(`- segond ${w.bookId} ${c + 1}:${idx + 1} — ${t.slice(0, 300)}`));
    md.push('');
  }
}

// Wider-span candidates
md.push('## Rule 2 — wider-span conservation candidates (size >= 4)');
md.push('');
md.push('Wider windows whose signed diffs sum to exactly zero (not an adjacent pair/triple). Reported for explicit sign-off; nothing is applied yet.');
md.push('');
if (!widerKept.length) md.push('_none_');
for (const w of widerKept) {
  md.push(`### ${w.bookId} ${w.start}..${w.start + w.size - 1} (diffs ${w.diffs.join(', ')}, sum ${w.sum})`);
  md.push('');
  md.push(`Cumulative offset by chapter: ${w.diffs.map((d, i) => `${w.start + i}:${w.diffs.slice(0, i + 1).reduce((a, b) => a + b, 0)}`).join(', ')}`);
  md.push('');
  for (let c = w.start; c < w.start + w.size - 1; c++) {
    md.push(`Boundary ${w.bookId} ${c} → ${c + 1}:`);
    md.push('');
    const lo = lastN(w.bookId, c, 2);
    lo.forEach((t, idx) => md.push(`- segond ${w.bookId} ${c}:${(books[w.bookId][c - 1].length - lo.length + idx + 1)} — ${t.slice(0, 300)}`));
    const hi = firstN(w.bookId, c + 1, 2);
    hi.forEach((t, idx) => md.push(`- segond ${w.bookId} ${c + 1}:${idx + 1} — ${t.slice(0, 300)}`));
    md.push('');
  }
}

// Unresolved
md.push('## Needs individual investigation (unresolved)');
md.push('');
md.push('Nonzero chapter diffs not covered by a Rule 1 PASS or a Rule 2 conserving window. `class`: unexplained = no rule applies; wider-span = part of an exact-conserving 4+ chapter window above; boundary-candidate = raw count mismatch later resolved by seam review as a MERGE/SPLIT (see Final reviewed disposition) — NOT a textual variant; known-variant = already documented; provisional = canon Greek-addition gap.');
md.push('');
md.push('| book | ch | canon | segond | diff | class | note |');
md.push('|---|---|---|---|---|---|---|');
for (const u of unresolved) {
  md.push(`| ${u.bookId} | ${u.chapter} | ${u.exp} | ${u.got} | ${u.diff} | ${u.cls} | ${u.note} |`);
}
md.push('');

// Final reviewed disposition (approved set now applied by import-segond1910.mjs).
md.push('## Final reviewed disposition');
md.push('');
md.push('The reviewed, approved set now applied by `build/import-segond1910.mjs`. The');
md.push('candidate tables above are the raw pre-transform analysis, retained for history.');
md.push('');
md.push('| transform | count | notes |');
md.push('|---|---|---|');
md.push('| Rule 1 — Psalm superscriptions preserved as `titles` | 62 | includes **PSA 18**, explicitly approved despite its 204-char superscription (longest in the Psalter; parallels 2 Sam 22) |');
md.push('| Rule 2 — chapter windows (order-preserving re-chunk) | 16 | 15 adjacent pairs + the **JOB 38..41** four-chapter cascade |');
md.push('| MERGEs (two source verses → one canon verse) | 6 | 1SA 20:42+43, 1KI 22:43+44, MRK 9:50+51, MRK 10:52+53, REV 12:18+13:1 (cross-chapter), 3JN 1:14+15 |');
md.push('| SPLITs (one source verse → two canon verses, unambiguous seam) | 4 | JOB 34:36 → 34:36/37, ISA 63:19 → 63:19/64:1 (cross-chapter), 2CO 13:12 → 13:12/13, ACT 19:40 → 19:40/41 |');
md.push('');
md.push('Cases originally flagged as suspected textual variants — all resolved as');
md.push('boundary artifacts by the seam test (full Segond verse vs KJV/WEB target verses):');
md.push('');
md.push('- **3JN 1:15** — **MERGE**: Segond splits canon 3 John 1:14 into source 14 (`…bouche à bouche.`) + 15 (`Que la paix soit avec toi!…`); no source content omitted or invented.');
md.push('- **2CO 13:13** — **SPLIT**: Segond merged canon 13:12 + 13:13 into source 13:12; seam `baiser.` / `Tous les saints` (= "holy kiss." / "All the saints…").');
md.push('- **ACT 19:40** — **SPLIT**: Segond merged canon 19:40 + 19:41 into source 19:40; seam `attroupement.` / `Après ces paroles` (= "this concourse." / "When he had thus spoken…").');
md.push('');
md.push('Segond validation triggers only the pre-existing ROM 14 known-variant note;');
md.push('no new known-variants entries were needed. Every newly investigated');
md.push('non-provisional mismatch outside the existing known-variant cases resolved as');
md.push('a title, window, MERGE, or SPLIT artifact.');
md.push('');
md.push('Final validator result (`node build/validate.mjs data/segond1910.json`):');
md.push('**0 errors, 3 warnings, 1 known-variant info note**. The 3 warnings are canon\'s');
md.push('provisional Greek-addition gaps (EST 4, EST 10, DAN); the info note is ROM 14.');
md.push('');

const outPath = path.join(dir, 'sources', 'segond1910', 'versification-report.md');
fs.writeFileSync(outPath, md.join('\n') + '\n');
console.log(`Wrote ${outPath}`);
console.log(`PSA PASS=${passCount} REVIEW=${review.length} FAIL-VOCAB=${failVocab.length} UNEXPECTED=${unexpected.length}`);
console.log(`Rule 2 windows=${windows.length}: ${windows.map(w => `${w.bookId}${w.start}(x${w.size})`).join(', ')}`);
console.log(`Rule 2 wider spans=${widerKept.length}: ${widerKept.map(w => `${w.bookId}${w.start}..${w.start + w.size - 1}`).join(', ')}`);
console.log(`Unresolved nonzero chapters=${unresolved.length}: ${Object.entries(byClass).map(([k, v]) => `${k}=${v}`).join(', ')}`);
