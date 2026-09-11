// import-oshb-interlinear.mjs
//
// Builds the Hebrew interlinear data from the Open Scriptures Hebrew Bible
// (OSHB) OSIS XML already cached in build/sources/oshb/, plus the Strong's
// Hebrew gloss dictionary.
//
// This is the Hebrew counterpart to import-byz-interlinear.mjs (Greek). The
// important difference: the OSHB source uses Masoretic versification, which
// differs from Maranatha's Christian canon (chapter-boundary shifts, Joel 4→3,
// Malachi 3→4, MERGE/REPLACE/SPLIT cases). Rather than re-implement that
// mapping, this importer reuses the exact placement engine in import-oshb.mjs
// (collectVerses → placeAllVerses → buildOutput) so the interlinear verses land
// in the same slots as data/he.json — the two outputs are generated from one
// source of truth.
//
// SOURCES
//   Tagged Hebrew text: Open Scriptures Hebrew Bible (OSHB),
//     https://github.com/openscriptures/morphhb — a digital transcription of
//     the Westminster Leningrad Codex with per-word Strong's numbers and
//     morphology. CC BY 4.0. Cached in build/sources/oshb/.
//   Glosses: openscriptures/strongs, hebrew/strongs-hebrew-dictionary.js —
//     Strong's definitions. Copyright 2009 Open Scriptures, CC-BY-SA. Cached
//     in build/sources/strongs/.
//
// Output: data/he-interlinear.{json,js} and data/strongs-hebrew.{json,js}.
//
// Usage:
//   node build/import-oshb-interlinear.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  OSIS_TO_CANON,
  collectVerses,
  placeAllVerses,
  buildOutput,
} from './import-oshb.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sourceDir = path.join(dir, 'sources', 'oshb');

function readCanonById() {
  const canonPath = path.join(dir, '..', 'data', 'canon.js');
  const canonSrc = fs.readFileSync(canonPath, 'utf8');
  const canonJson = canonSrc.slice('window.MARANATHA_CANON='.length).trim();
  const canon = JSON.parse(canonJson.endsWith(';') ? canonJson.slice(0, -1) : canonJson);
  return Object.fromEntries(canon.books.map((b) => [b.id, b]));
}

function writeData(id, globalName, data) {
  const jsonPath = path.join(dir, '..', 'data', `${id}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(data) + '\n');
  const jsPath = path.join(dir, '..', 'data', `${id}.js`);
  fs.writeFileSync(jsPath, `window.${globalName}=${JSON.stringify(data)};\n`);
  const kb = (fs.statSync(jsonPath).size / 1024).toFixed(1);
  console.log(`Wrote ${jsonPath} (${kb} KB) and ${jsPath}`);
}

function main() {
  const canonById = readCanonById();
  const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.xml')).sort();

  // Pass 1 + 2: reuse the OSHB engine so versification matches data/he.json.
  const allVerses = [];
  for (const file of files) {
    const osisBook = file.replace('.xml', '');
    if (!OSIS_TO_CANON[osisBook]) throw new Error(`Unmapped source file: ${file}`);
    const xml = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    allVerses.push(...collectVerses(xml, osisBook).verses);
  }

  const { bookTokens, errors } = placeAllVerses(allVerses);
  if (errors.length) {
    for (const err of errors) console.error(`${err.type}: ${err.key}`);
    throw new Error(`Placement produced ${errors.length} unexpected collision(s).`);
  }

  const outputTokens = buildOutput(bookTokens, null, canonById);

  // Token tally for the build log.
  let tokenCount = 0;
  let verseCount = 0;
  for (const chapters of Object.values(outputTokens)) {
    for (const chapter of chapters) {
      for (const tokens of chapter) {
        if (!tokens || !tokens.length) continue;
        verseCount++;
        tokenCount += tokens.length;
      }
    }
  }
  const bookCount = Object.keys(outputTokens).length;
  if (bookCount !== 39) throw new Error(`Expected 39 interlinear books, got ${bookCount}`);
  console.log(`  ${bookCount} books, ${verseCount} verses, ${tokenCount} tokens`);

  const interlinear = {
    id: 'he-interlinear',
    label: 'Hebrew Bible (OSHB, interlinear)',
    source: 'Tagged text: Open Scriptures Hebrew Bible (OSHB), https://github.com/openscriptures/morphhb, CC BY 4.0. Based on the Westminster Leningrad Codex (public domain). Covers the 39 protocanonical Old Testament books only.',
    books: outputTokens,
  };
  writeData('he-interlinear', 'MARANATHA_INTERLINEAR_HE', interlinear);

  // Strong's gloss dictionary (numbered Strong's -> concise gloss).
  const dict = require(path.join(sourceDir, '..', 'strongs', 'strongs-hebrew-dictionary.js'));
  const glosses = {};
  for (const [key, entry] of Object.entries(dict)) {
    const num = String(key).replace(/^H/, '');
    const gloss = (entry.kjv_def || entry.strongs_def || '').trim();
    if (gloss) glosses[num] = gloss;
  }
  const strongsData = {
    source: 'openscriptures/strongs hebrew/strongs-hebrew-dictionary.js — Strong\'s definitions. Copyright 2009 Open Scriptures, CC-BY-SA.',
    glosses,
  };
  writeData('strongs-hebrew', 'MARANATHA_STRONGS_HEBREW', strongsData);
  console.log(`  glosses: ${Object.keys(glosses).length}`);
}

main();
