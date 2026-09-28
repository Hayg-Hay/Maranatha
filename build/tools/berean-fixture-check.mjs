// berean-fixture-check.mjs
//
// Validates the committed Berean extraction fixture without any network or the
// original .docx. If BEREAN_DOCX points at an extracted word/document.xml it
// also re-runs the extractor and asserts the fixture is byte-identical to a
// fresh extraction (repeatability check).
//
//   node build/tools/berean-fixture-check.mjs
//   BEREAN_DOCX=/path/word/document.xml node build/tools/berean-fixture-check.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from './berean-extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(here, '..', 'sources', 'berean-interlinear', 'john-6-50-51.fixture.json');

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);

const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

check('fixture is John 6', fixture.book === 'John' && fixture.chapter === 6);
check('fixture is marked inspection-only, not production data', /inspection fixture/i.test(fixture.status || ''));

const expectedCounts = { 50: 17, 51: 38 };
for (const v of ['50', '51']) {
  const verse = fixture.verses[v];
  check(`John 6:${v} token count is ${expectedCounts[v]}`, verse.tokenCount === expectedCounts[v], `got ${verse.tokenCount}`);
  check(`John 6:${v} tokens array length matches tokenCount`, verse.tokens.length === verse.tokenCount);

  const orders = verse.tokens.map((t) => t.order);
  check(`John 6:${v} order is 0..n-1 contiguous`,
    orders.every((o, i) => o === i), orders.join(','));

  let missing = 0;
  for (const t of verse.tokens) {
    if (!t.surface || !t.transliteration || !t.morphology || !t.strongs || t.gloss === undefined || !t.definition) missing++;
  }
  check(`John 6:${v} every token has surface/translit/morph/strongs/gloss/definition`, missing === 0, `${missing} incomplete`);

  const badStrongs = verse.tokens.filter((t) => !/^\d+$/.test(t.strongs)).length;
  check(`John 6:${v} every Strong's number is numeric`, badStrongs === 0, `${badStrongs} bad`);

  const actual = verse.tokens.map((t) => t.gloss);
  check(`John 6:${v} visible gloss sequence matches the Word/PDF presentation`,
    JSON.stringify(actual) === JSON.stringify(verse.expectedVisibleGlossesFromPdf));
  check(`John 6:${v} fixture records the PDF match as true`, verse.visibleGlossSequenceMatchesPdf === true);
}

// Optional repeatability: re-extract from a local document.xml.
const docx = process.env.BEREAN_DOCX;
if (docx) {
  const { books, anomalies } = parse(fs.readFileSync(docx, 'utf8'));
  check('dedicated extractor reports 0 structural anomalies', anomalies.length === 0, `${anomalies.length} anomalies`);
  for (const v of ['50', '51']) {
    const fresh = (books.John[6][v] || []).map((t) => ({
      order: t.order, surface: t.surface, transliteration: t.transliteration,
      morphology: t.morphology, strongs: t.strongs, gloss: t.gloss, definition: t.definition,
    }));
    check(`re-extraction of John 6:${v} reproduces the fixture exactly`,
      JSON.stringify(fresh) === JSON.stringify(fixture.verses[v].tokens));
  }
} else {
  console.log('note: BEREAN_DOCX not set — skipped live re-extraction (offline fixture checks only).');
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} fixture checks passed.`);
process.exit(failed ? 1 : 0);
