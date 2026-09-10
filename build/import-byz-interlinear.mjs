// import-byz-interlinear.mjs
//
// Builds the Greek interlinear data from the byztxt Strong's + parsing CSVs,
// and the Strong's gloss dictionary used to label each word.
//
// SOURCES
//   Tagged Greek text: byztxt/byzantine-majority-text (GitHub),
//     csv-unicode/strongs/with-parsing/*.csv — Robinson-Pierpont Byzantine
//     text with Strong's numbers and morphology per word. Unlicense (public
//     domain), cached in build/sources/byz-strongs/.
//   Glosses: openscriptures/strongs, greek/strongs-greek-dictionary.js —
//     Strong's definitions, Copyright 2009 Open Scriptures, CC-BY-SA, cached
//     in build/sources/strongs/. (The underlying Strong's 1890 is public
//     domain; this transcription is CC-BY-SA.)
//
// The CSV "text" field is a sequence of `surface strongs {MORPH}` groups. The
// accented surface form is taken from data/byz.json (the text we already
// display) when the word counts align; otherwise the unaccented CSV form is
// used. Morphology is kept as the raw parsing code (e.g. N-NSF).
//
// Output: data/byz-interlinear.{json,js} and data/strongs-greek.{json,js}.
//
// Usage:
//   node build/import-byz-interlinear.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const BOOK_MAP = {
  MAT: 'MAT', MAR: 'MRK', LUK: 'LUK', JOH: 'JHN', ACT: 'ACT',
  ROM: 'ROM', '1CO': '1CO', '2CO': '2CO', GAL: 'GAL', EPH: 'EPH',
  PHP: 'PHP', COL: 'COL', '1TH': '1TH', '2TH': '2TH', '1TI': '1TI',
  '2TI': '2TI', TIT: 'TIT', PHM: 'PHM', HEB: 'HEB', JAM: 'JAS',
  '1PE': '1PE', '2PE': '2PE', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN',
  JUD: 'JUD', REV: 'REV',
};

function stripPunctuation(word) {
  return word.replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, '');
}

// Parses "βιβλος 976 {N-NSF} γενεσεως 1078 {N-GSF}" into
// [ [surface, strongs, morph], ... ].
function parseTokens(text) {
  const tokens = [];
  let word = null;
  let strongs = '';
  let morph = '';
  const flush = () => {
    if (word === null) return;
    tokens.push([word, strongs, morph]);
    word = null;
    strongs = '';
    morph = '';
  };
  for (const part of text.trim().split(/\s+/)) {
    if (/^\{.*\}$/.test(part)) {
      morph = part.slice(1, -1);
      flush();
    } else if (/^\d+$/.test(part)) {
      strongs = part;
    } else {
      flush();
      word = part;
    }
  }
  flush();
  return tokens;
}

function main() {
  const byz = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'byz.json'), 'utf8'));
  const sourceDir = path.join(dir, 'sources', 'byz-strongs');

  const books = {};
  let alignedVerses = 0;
  let fallbackVerses = 0;

  for (const file of fs.readdirSync(sourceDir).filter((f) => f.endsWith('.csv'))) {
    const base = file.replace('.csv', '');
    const canonId = BOOK_MAP[base];
    if (!canonId) throw new Error(`Unmapped interlinear file: ${file}`);

    const lines = fs.readFileSync(path.join(sourceDir, file), 'utf8').split('\n').filter(Boolean);
    if (!lines[0].startsWith('chapter,verse,text')) throw new Error(`${file}: unexpected header`);

    const chapters = [];
    for (let i = 1; i < lines.length; i++) {
      const m = lines[i].match(/^(\d+),(\d+),(.*)$/);
      if (!m) continue;
      const chapter = Number(m[1]);
      const verse = Number(m[2]);
      const tokens = parseTokens(m[3]);
      if (!tokens.length) continue;

      // Accented surface from data/byz.json, when word counts line up.
      const accented = byz.books[canonId]?.[chapter - 1]?.[verse - 1];
      const accentedWords = accented ? accented.split(/\s+/).map(stripPunctuation).filter(Boolean) : [];
      if (accentedWords.length === tokens.length) {
        tokens.forEach((t, k) => { t[0] = accentedWords[k]; });
        alignedVerses++;
      } else {
        fallbackVerses++;
      }

      while (chapters.length < chapter) chapters.push([]);
      const verseArr = chapters[chapter - 1];
      while (verseArr.length < verse) verseArr.push(null);
      verseArr[verse - 1] = tokens;
    }
    books[canonId] = chapters;
  }

  const bookCount = Object.keys(books).length;
  if (bookCount !== 27) throw new Error(`Expected 27 interlinear books, got ${bookCount}`);

  const interlinear = {
    id: 'byz-interlinear',
    label: 'Byzantine Majority Text (Greek NT, interlinear)',
    source: 'Tagged text: byztxt/byzantine-majority-text, csv-unicode/strongs/with-parsing — Robinson-Pierpont Byzantine text with Strong\'s numbers and morphology. Unlicense (public domain).',
    books,
  };
  writeData('byz-interlinear', 'MARANATHA_INTERLINEAR_BYZ', interlinear);
  console.log(`  aligned to accented byz text: ${alignedVerses} verses; fallback (unaccented): ${fallbackVerses}`);

  // Strong's gloss dictionary (numbered Strong's -> concise gloss).
  const dict = require(path.join(sourceDir, '..', 'strongs', 'strongs-greek-dictionary.js'));
  const glosses = {};
  for (const [key, entry] of Object.entries(dict)) {
    const num = String(key).replace(/^G/, '');
    const gloss = (entry.kjv_def || entry.strongs_def || '').trim();
    if (gloss) glosses[num] = gloss;
  }
  const strongsData = {
    source: 'openscriptures/strongs greek/strongs-greek-dictionary.js — Strong\'s definitions. Copyright 2009 Open Scriptures, CC-BY-SA.',
    glosses,
  };
  writeData('strongs-greek', 'MARANATHA_STRONGS_GREEK', strongsData);
  console.log(`  glosses: ${Object.keys(glosses).length}`);
}

function writeData(id, globalName, data) {
  const jsonPath = path.join(dir, '..', 'data', `${id}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(data) + '\n');
  const jsPath = path.join(dir, '..', 'data', `${id}.js`);
  fs.writeFileSync(jsPath, `window.${globalName}=${JSON.stringify(data)};\n`);
  const kb = (fs.statSync(jsonPath).size / 1024).toFixed(1);
  console.log(`Wrote ${jsonPath} (${kb} KB) and ${jsPath}`);
}

main();
