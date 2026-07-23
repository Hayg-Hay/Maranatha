// normalize.mjs
//
// Milestone 2 scaffolding: turns a translation's cached raw source (from
// build/sources/, written by fetch-source.mjs) into the
// { id, label, source, books: { bookId: [[verse,...], ...] } } shape that
// validate.mjs checks and app.js reads at runtime.
//
// STATUS: no raw source is cached yet (see fetch-source.mjs), so there is
// nothing to normalize. This file exists to hold the shared shape-writing
// logic so each translation's normalizer only has to deal with its own raw
// format and can lean on this for the output contract and the write step.
//
// A per-translation normalizer (e.g. normalize-web-c.mjs) should:
//   1. Read its cached raw file(s) from build/sources/.
//   2. Map the source's own book identifiers onto Maranatha's stable IDs
//      (see data/canon.js — GEN, EXO, ... TOB, JDT, ... REV). This mapping
//      is exactly the kind of thing that's easy to get subtly wrong (off-by
//      one book numbers, alternate book-splitting conventions like separate
//      Esther/Daniel addition "books" vs. integrated chapters) — cross-check
//      against data/canon.js's chapter/verse counts using validate.mjs
//      before trusting the result.
//   3. Call writeTranslation() below.
//   4. Run `node build/validate.mjs data/<id>.json` and resolve every ERROR
//      before committing. WARN-level mismatches against canon.js's two
//      provisional books (Baruch, Esther, Daniel) are expected right now —
//      use them as the evidence to go fix canon.js itself.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Writes a normalized translation to data/<id>.json.
 * @param {{id: string, label: string, source: string, books: Record<string, string[][]>}} translation
 */
export function writeTranslation(translation) {
  if (!translation.id || !translation.label || !translation.books) {
    throw new Error('translation needs id, label, and books');
  }
  const outPath = path.join(dir, '..', 'data', `${translation.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(translation, null, 2) + '\n');
  console.log(`Wrote ${outPath} (${Object.keys(translation.books).length} books)`);
  console.log(`Next: node build/validate.mjs data/${translation.id}.json`);
  return outPath;
}
