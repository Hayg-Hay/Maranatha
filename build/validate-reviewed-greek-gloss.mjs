// validate-reviewed-greek-gloss.mjs
//
// Repeatable, dependency-free check for the candidate Greek gloss pilot.
// Run after `node build/import-reviewed-greek-gloss.mjs`.
//
//   node build/validate-reviewed-greek-gloss.mjs
//
// Verifies the generated data against the editable TSV and the Byzantine
// interlinear: token counts (17 in John 6:50, 41 in John 6:51), all 58 identity
// fingerprints, the four required G1537 contextual glosses, the five
// intentionally blank tokens, that no other verse/book is present, and that the
// JS payload is syntactically valid and identical to the JSON.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const TSV_PATH = path.join(dir, 'sources', 'reviewed-greek-gloss', 'john-6-50-51.tsv');
const BYZ_PATH = path.join(dir, '..', 'data', 'byz-interlinear.json');
const JSON_PATH = path.join(dir, '..', 'data', 'reviewed-greek-gloss.json');
const JS_PATH = path.join(dir, '..', 'data', 'reviewed-greek-gloss.js');
const GLOBAL_NAME = 'MARANATHA_REVIEWED_GREEK_GLOSS';

const checks = [];
function check(name, condition, detail) {
  checks.push({ name, ok: !!condition, detail });
}

const nfc = (v) => String(v).normalize('NFC');

// --- load ---------------------------------------------------------------
const byz = JSON.parse(fs.readFileSync(BYZ_PATH, 'utf8'));
const tsvText = fs.readFileSync(TSV_PATH, 'utf8');
const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const jsText = fs.readFileSync(JS_PATH, 'utf8');

// --- parse TSV ----------------------------------------------------------
const COLUMNS = ['book', 'chapter', 'verse', 'token', 'surface', 'strongs',
  'morphology', 'transliteration', 'gloss', 'source_note', 'status'];
const tsvRows = [];
for (const line of tsvText.split(/\r?\n/)) {
  if (line.trim() === '' || line.startsWith('#')) continue;
  const fields = line.split('\t');
  if (fields.length !== COLUMNS.length) continue;
  if (fields[0] === 'book' && fields[1] === 'chapter') continue; // header
  const row = {};
  COLUMNS.forEach((c, i) => { row[c] = fields[i]; });
  tsvRows.push(row);
}

// --- 1/2/3: identity fingerprints and counts ----------------------------
const perVerse = { 'JHN 6:50': 0, 'JHN 6:51': 0 };
let fingerprintMismatches = 0;
const seen = new Set();
for (const row of tsvRows) {
  const key = `${row.book} ${row.chapter} ${row.verse} ${row.token}`;
  if (seen.has(key)) { fingerprintMismatches++; continue; }
  seen.add(key);
  const [bSurface, bStrongs, bMorph] =
    (byz.books[row.book]?.[Number(row.chapter) - 1]?.[Number(row.verse) - 1] || [])[Number(row.token) - 1] || [];
  if (nfc(row.surface) !== nfc(bSurface) || row.strongs !== bStrongs || row.morphology !== bMorph) {
    fingerprintMismatches++;
  }
  const verseKey = `${row.book} ${row.chapter}:${row.verse}`;
  if (verseKey in perVerse) perVerse[verseKey]++;
}

const countNonBlank = (verse) =>
  (jsonData.verses.JHN[6][String(verse)] || []).filter(Boolean).length;

check('John 6:50 has 17 candidate tokens', countNonBlank(50) === 17, `got ${countNonBlank(50)}`);
check('John 6:51 has 41 candidate tokens', countNonBlank(51) === 41, `got ${countNonBlank(51)}`);
check('TSV covers 17 tokens for John 6:50', perVerse['JHN 6:50'] === 17, `got ${perVerse['JHN 6:50']}`);
check('TSV covers 41 tokens for John 6:51', perVerse['JHN 6:51'] === 41, `got ${perVerse['JHN 6:51']}`);
check('all 58 identity fingerprints match the Byzantine interlinear', fingerprintMismatches === 0, `${fingerprintMismatches} mismatch(es)`);
check('exactly 58 unique candidate tokens', seen.size === 58, `got ${seen.size}`);

// --- 4: required G1537 contextual glosses -------------------------------
const g1537 = [
  [50, 6, 'from', 'John 6:50 ek'],
  [50, 12, 'of', 'John 6:50 ex'],
  [51, 8, 'from', 'John 6:51 first ek'],
  [51, 15, 'of', 'John 6:51 second ek'],
];
for (const [verse, token, expected, label] of g1537) {
  const entry = jsonData.verses.JHN[6][String(verse)][token - 1];
  check(`G1537 ${label} glossed "${expected}"`, entry && entry[1] === expected, entry ? `got "${entry[1]}"` : 'missing');
}

// --- 5: no other verses / books ----------------------------------------
const bookKeys = Object.keys(jsonData.verses);
check('only the book JHN is present', bookKeys.length === 1 && bookKeys[0] === 'JHN', bookKeys.join(','));
const chapterKeys = Object.keys(jsonData.verses.JHN || {});
check('only John 6 is present', chapterKeys.length === 1 && chapterKeys[0] === '6', chapterKeys.join(','));
const verseKeys = Object.keys(jsonData.verses.JHN?.[6] || {}).sort();
check('only John 6:50 and 6:51 are present', verseKeys.join(',') === '50,51', verseKeys.join(','));
check('no verse slot is a gap (pilot fills all tokens)',
  [50, 51].every(v => (jsonData.verses.JHN[6][String(v)] || []).every(Boolean)));

// --- revised candidate glosses (supervisor round 2) ---------------------
const glossAt = (verse, token) => jsonData.verses.JHN[6][String(verse)][token - 1]?.[1];
const revised = [
  [50, 5, 'that', '6:50 ho -> that'],
  [50, 9, 'comes down', '6:50 katabainon -> comes down'],
  [50, 14, 'may eat', '6:50 phage -> may eat'],
  [51, 7, 'that', '6:51 ho -> that'],
  [51, 11, 'having come down', '6:51 katabas -> having come down'],
  [51, 22, 'forever', '6:51 aiona -> forever'],
];
for (const [verse, token, expected, label] of revised) {
  check(`revised candidate: ${label}`, glossAt(verse, token) === expected, `got "${glossAt(verse, token)}"`);
}

// --- intentional blank vs missing --------------------------------------
const blanks = [
  [50, 7, 'tou', '6:50 tou (article in "from heaven")'],
  [51, 9, 'tou', '6:51 tou (article in "from heaven")'],
  [51, 20, 'eis', '6:51 eis (phrase εἰς τὸν αἰῶνα = "forever")'],
  [51, 21, 'ton', '6:51 ton (phrase εἰς τὸν αἰῶνα = "forever")'],
  [51, 26, 'de', '6:51 de (postpositive connective)'],
];
for (const [verse, token, translit, label] of blanks) {
  const entry = jsonData.verses.JHN[6][String(verse)][token - 1];
  check(`${label} is explicitly blank, not missing`,
    Array.isArray(entry) && entry[0] === translit && entry[1] === '', JSON.stringify(entry));
}
check('intentional blank count is exactly 5',
  [50, 51].reduce((n, v) => n + jsonData.verses.JHN[6][String(v)].filter(e => e && e[1] === '').length, 0) === 5);

// --- 6/7: JSON vs JS payload, JS syntax ---------------------------------
let jsPayload;
try {
  const sandbox = { window: {} };
  vm.runInNewContext(jsText, sandbox);
  jsPayload = sandbox.window[GLOBAL_NAME];
  check('generated JS assigns window.' + GLOBAL_NAME, !!jsPayload);
} catch (error) {
  check('generated JS assigns window.' + GLOBAL_NAME, false, String(error));
}
if (jsPayload) {
  check('JS payload is identical to JSON payload', JSON.stringify(jsPayload) === JSON.stringify(jsonData));
}
check('JSON declares tokenCount 58', jsonData.tokenCount === 58, `got ${jsonData.tokenCount}`);
check('JSON declares verseCount 2', jsonData.verseCount === 2, `got ${jsonData.verseCount}`);

// --- report -------------------------------------------------------------
let failed = 0;
for (const c of checks) {
  if (c.ok) {
    console.log(`PASS  ${c.name}`);
  } else {
    failed++;
    console.log(`FAIL  ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
  }
}
if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} checks passed.`);
