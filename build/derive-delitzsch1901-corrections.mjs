// derive-delitzsch1901-corrections.mjs
//
// Derives the reviewed correction manifest for the Sermon-Online vocalized
// Delitzsch 1901 transcription from the cached source. Run this only when the
// cached source or the correction rules change, then review the output. The
// importer reads the resulting corrections.json; it never guesses.
//
//   node build/derive-delitzsch1901-corrections.mjs
//
// Two correction classes are derived, both verified against the printed 1901
// scan (see build/sources/delitzsch1901/evidence/):
//
//   1. Doubled identical Hebrew combining marks (niqqud/te'amim, including a
//      doubled maqef). A consonant cannot carry the same vowel point twice in
//      Tiberian pointing; the printed page shows a single mark (verified e.g.
//      John 1:37 on scan-0172, where the transcription has hataf-patah x3).
//      Collapse each run to one mark.
//
//   2. Unbalanced stray closing parentheses. Editorial parentheses DO occur in
//      the print (verified Romans 8:1 on scan-0297), including cross-verse
//      pairs. Only a ')' that appears when the chapter's running paren balance
//      is zero is stray (verified John 1:20 on scan-0172, where the print has
//      no parenthesis). Balanced and cross-verse brackets are preserved.
//
// Do NOT broaden these rules casually: removing meaningful punctuation or
// points would corrupt the text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(dir, 'sources', 'delitzsch1901');
const SRC = path.join(OUT, 'Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt');
const LINE = /^(.+?) (\d+):(\d+) (.*)$/;
const REPEAT = /([\u0591-\u05C7])\1+/g;

const PAGE_EVIDENCE = 'build/sources/delitzsch1901/evidence/';

function main() {
  const raw = fs.readFileSync(SRC, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();

  const rows = lines.map((line) => {
    const m = LINE.exec(line);
    if (!m) throw new Error(`Unparseable row: ${JSON.stringify(line)}`);
    return { book: m[1], ch: +m[2], v: +m[3], text: m[4] };
  });

  const entries = [];
  const markRuns = [];
  const strayParens = [];

  // 1. repeated identical marks (per verse)
  for (const r of rows) {
    const runs = [...r.text.matchAll(REPEAT)];
    if (!runs.length) continue;
    let corrected = r.text;
    for (const run of runs) {
      corrected = corrected.replace(run[0], run[0][0]);
    }
    const cps = runs.map((run) => [...run[0]].map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join('')).join('; ');
    entries.push({
      ref: `${r.book} ${r.ch}:${r.v}`,
      original: r.text,
      corrected,
      scanPage: 'see evidence/scan-index.json',
      reason: `Doubled identical Hebrew combining mark(s) [${cps}]; printed 1901 edition carries a single mark.`,
    });
    markRuns.push(...runs.map((run) => run[0]));
  }

  // 2. stray unbalanced ')' per chapter, in verse order
  const byChapter = new Map();
  for (const r of rows) {
    const k = `${r.book} ${r.ch}`;
    if (!byChapter.has(k)) byChapter.set(k, []);
    byChapter.get(k).push(r);
  }
  for (const [, verses] of byChapter) {
    verses.sort((a, b) => a.v - b.v);
    let balance = 0;
    for (const r of verses) {
      let corrected = '';
      let changed = false;
      for (const ch of r.text) {
        if (ch === '(') { balance++; corrected += ch; continue; }
        if (ch === ')') {
          if (balance === 0) { changed = true; continue; } // stray
          balance--; corrected += ch; continue;
        }
        corrected += ch;
      }
      if (changed) {
        entries.push({
          ref: `${r.book} ${r.ch}:${r.v}`,
          original: r.text,
          corrected,
          scanPage: 'see evidence/scan-index.json',
          reason: 'Unbalanced stray closing parenthesis (no matching opening bracket in the chapter sequence); printed 1901 edition has no such mark.',
        });
        strayParens.push(`${r.book} ${r.ch}:${r.v}`);
      }
    }
  }

  entries.sort((a, b) => a.ref.localeCompare(b.ref, 'en', { numeric: true }));

  const manifest = {
    _provenance: 'Reviewed correction manifest for the vocalized Delitzsch 1901 transcription. Each entry records the full original and corrected verse text, the reason, and the scan evidence; import-delitzsch1901.mjs applies these exactly and fails if the original does not match.',
    _scanEvidence: 'build/sources/delitzsch1901/evidence/ (title page, TOC, John 1, Romans 8, 3 John)',
    counts: {
      repeatedMarkVerses: entries.filter((e) => e.reason.startsWith('Doubled')).length,
      strayParenVerses: strayParens.length,
      total: entries.length,
    },
    entries,
  };
  fs.writeFileSync(path.join(OUT, 'corrections.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote corrections.json: ${manifest.counts.repeatedMarkVerses} repeated-mark verses, ${manifest.counts.strayParenVerses} stray-paren verses.`);
  console.log('Repeated run samples:', [...new Set(markRuns)].length, 'distinct runs');
}

main();
