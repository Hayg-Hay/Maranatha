// validate-berean-interlinear.mjs
//
// Repeatable validation for the generated Berean Interlinear Bible NT data.
// Dependency-free; reads only committed files (no source docx required).
//
//   node build/validate-berean-interlinear.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(dir, '..');
const BEREAN_DIR = path.join(ROOT, 'data', 'berean');
const BUILD_META = path.join(dir, 'sources', 'berean-interlinear', 'berean-build.json');
const FIXTURE = path.join(dir, 'sources', 'berean-interlinear', 'john-6-50-51.fixture.json');
const BYZ = path.join(ROOT, 'data', 'byz-interlinear.json');

const EXPECTED_TOTAL = 138130;
const EXPECTED_JOHN = 15660;
const NT = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
  '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sha256 = (t) => crypto.createHash('sha256').update(t.replace(/\r\n/g, '\n'), 'utf8').digest('hex');

function loadGlobal(src) {
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  return sandbox.window;
}

// --- load -----------------------------------------------------------------
const meta = JSON.parse(fs.readFileSync(BUILD_META, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
const byz = JSON.parse(fs.readFileSync(BYZ, 'utf8'));

const manifestWin = loadGlobal(fs.readFileSync(path.join(BEREAN_DIR, 'manifest.js'), 'utf8'));
const manifest = manifestWin.MARANATHA_BEREAN_MANIFEST;
check('runtime manifest present and labelled Berean', manifest && manifest.id === 'berean-interlinear');
check('manifest carries attribution + source URL', /interlinearbible\.com/.test(manifest.attribution) && /interlinearbible\.com\/bib\.docx/.test(manifest.sourceUrl));
check('manifest records the April 30, 2023 public-domain dedication', manifest.dedication === 'April 30, 2023');

// --- per-file hashes (determinism at rest) --------------------------------
let staleFiles = 0;
for (const [rel, hash] of Object.entries(meta.files)) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p) || sha256(fs.readFileSync(p, 'utf8')) !== hash) staleFiles++;
}
check('every generated file matches its recorded build hash', staleFiles === 0, `${staleFiles} stale/missing`);

// --- load chunks ----------------------------------------------------------
const books = {};
let total = 0;
let john = 0;
const blankByBook = {};
let failedLoads = 0;
for (const id of NT) {
  const p = path.join(BEREAN_DIR, `${id}.js`);
  if (!fs.existsSync(p)) { failedLoads++; check(`chunk exists: ${id}`, false); continue; }
  const win = loadGlobal(fs.readFileSync(p, 'utf8'));
  const data = win[`MARANATHA_BEREAN_${id}`];
  if (!data || !data.books || !data.books[id]) { failedLoads++; check(`chunk global shape: ${id}`, false); continue; }
  books[id] = data.books[id];
}
check('all 27 NT book chunks load with the expected global', failedLoads === 0 && Object.keys(books).length === 27, `${Object.keys(books).length}/27`);
check('manifest lists exactly the 27 NT books in canon order', JSON.stringify(manifest.books) === JSON.stringify(NT));
check('build metadata lists exactly the 27 NT books', JSON.stringify(meta.books) === JSON.stringify(NT));

// --- token validation -----------------------------------------------------
let fieldErrors = 0, strongsErrors = 0, blanks = 0;
for (const id of NT) {
  blankByBook[id] = 0;
  books[id].forEach((verseArr, ci) => {
    if (!verseArr) return;
    verseArr.forEach((tokens, vi) => {
      if (!tokens) return;
      tokens.forEach((tok, ti) => {
        total++;
        if (id === 'JHN') john++;
        const [surface, translit, morph, strongs, gloss] = tok;
        if (!surface || !translit || !morph || !strongs || gloss === undefined) fieldErrors++;
        if (!/^\d+$/.test(strongs)) strongsErrors++;
        if (gloss === '') { blanks++; blankByBook[id]++; }
      });
    });
  });
}
check('every token has surface/translit/morph/strongs + a gloss field', fieldErrors === 0, `${fieldErrors} bad`);
check('every Strong\'s number is numeric', strongsErrors === 0, `${strongsErrors} bad`);
check(`total tokens = ${EXPECTED_TOTAL}`, total === EXPECTED_TOTAL, `got ${total}`);
check(`John tokens = ${EXPECTED_JOHN}`, john === EXPECTED_JOHN, `got ${john}`);
check('intentional blanks match build metadata', JSON.stringify(blankByBook) === JSON.stringify(meta.intentionalBlanks));

// --- book/chapter/verse organization -------------------------------------
const gaps = {};
let structureErrors = 0;
for (const [key, verses] of Object.entries(meta.knownOmissions)) {
  const [id, c] = key.split(' ');
  gaps[`${id} ${c}`] = verses;
}
for (const id of NT) {
  books[id].forEach((verseArr, ci) => {
    if (!verseArr) { structureErrors++; return; }
    verseArr.forEach((tokens, vi) => {
      if (tokens === null) {
        const key = `${id} ${ci + 1}`;
        const known = gaps[key] || [];
        if (!known.includes(vi + 1)) { structureErrors++; }
      } else if (!Array.isArray(tokens) || tokens.length === 0) {
        structureErrors++;
      }
    });
  });
}
check('book/chapter/verse structure valid; only documented NA omissions are null', structureErrors === 0, `${structureErrors} structural issues`);

// --- specific anchors -----------------------------------------------------
const j650 = books.JHN[5][49];
const j651 = books.JHN[5][50];
check('John 6:50 has 17 tokens', j650.length === 17, `got ${j650.length}`);
check('John 6:51 has 38 tokens', j651.length === 38, `got ${j651.length}`);
const byz651 = byz.books.JHN[5][50].length;
check('John 6:51 differs from the 41-token Byzantine verse', byz651 === 41 && j651.length !== byz651, `byz ${byz651}, berean ${j651.length}`);
check('John 6:51 uses ζήσει (NA), not Byzantine ζήσεται', j651.some((t) => t[0] === 'ζήσει') && !j651.some((t) => t[0] === 'ζήσεται'));
check('John 6:51 has no repeated "ἣν ἐγὼ δώσω" clause', j651.filter((t) => t[3] === '1325').length === 1);

// --- fixture agreement ----------------------------------------------------
for (const v of ['50', '51']) {
  // The fixture records the raw source gloss ("-" for untranslated); runtime
  // data applies the documented "-" -> "" conversion, so compare post-conversion.
  const fromFixture = fixture.verses[v].tokens.map((t) => [
    t.surface, t.transliteration, t.morphology, t.strongs, t.gloss === '-' ? '' : t.gloss,
  ]);
  const fromData = books.JHN[5][Number(v) - 1];
  check(`John 6:${v} runtime equals extraction fixture`, JSON.stringify(fromData) === JSON.stringify(fromFixture));
}

// --- report ---------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log('\nIntentional blanks by book:');
for (const id of NT) console.log(`  ${id}: ${blankByBook[id]}`);
console.log(`  total: ${blanks}`);
if (failed) { console.error(`\n${failed} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
