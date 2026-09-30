// berean-hebrew-validate.mjs
//
// Offline validation for the Berean Hebrew (draft) preview: the committed
// fixture against the local cached pages, the manifest and the verified variant
// table. Coverage, totals, anomaly classes, variant wiring and deterministic
// regeneration. Deep record-level fidelity is checked separately and
// independently by berean-hebrew-compare.mjs.
//
//   node build/tools/berean-hebrew-validate.mjs
//
// Reads the ignored local source cache; on a fresh checkout it skips with
// guidance and exits 0 (never downloads).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildFixture, FIXTURE, PARSER_VERSION, partitionAnomalies, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
const MANIFEST = path.join(SRC_DIR, 'source-manifest.json');
const VARIANTS = path.join(SRC_DIR, 'variants.json');

const cacheStatus = missingSourcePages();
if (cacheStatus.missing.length || cacheStatus.manifestMissing) {
  console.log('SKIP  Berean Hebrew validator (source-page-dependent).');
  console.log(sourceCacheRecoveryMessage(cacheStatus.missing));
  process.exit(0);
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const skeleton = (s) => String(s || '').normalize('NFC').replace(/[\u0591-\u05C7]/g, '').replace(/[\/\s\u05BE\u05C0\u05C3]/g, '');

const fixtureText = fs.readFileSync(FIXTURE, 'utf8');
const fixture = JSON.parse(fixtureText);
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS, 'utf8'));
const canon = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'canon.js'), 'utf8').replace(/^window\.MARANATHA_CANON=/, '').replace(/;\s*$/, ''));

// --- source identity --------------------------------------------------------
check('fixture names the Berean Interlinear Bible (BIB)', fixture.source.edition === 'Berean Interlinear Bible (BIB)', fixture.source.edition);
check('every cached page carries the BIB footer', manifest.pages.every((p) => /Berean Interlinear Bible \(BIB\)/.test(p.editionFooter || '')));
check('fixture cites the official reuse-terms URL', fixture.source.termsUrl === 'https://berean.bible/terms.htm');
check('fixture is labelled a dated draft', fixture.draft === true && /draft/i.test(fixture.source.draftNote));
check('parser version recorded', fixture.parserVersion === PARSER_VERSION, `${fixture.parserVersion} vs ${PARSER_VERSION}`);

// --- deterministic regeneration & hash integrity ----------------------------
check('fixture regenerates deterministically from the cached pages', JSON.stringify(buildFixture()) === JSON.stringify(fixture));
let hashBad = 0;
for (const page of manifest.pages) {
  const p = path.join(SRC_DIR, page.file);
  if (!fs.existsSync(p) || sha256(fs.readFileSync(p)) !== page.sha256) hashBad++;
}
check('every cached page hash matches the manifest', hashBad === 0, `${hashBad} bad`);

// --- coverage & totals ------------------------------------------------------
check('coverage string names Genesis 1-50 plus the retained verses', fixture.coverage === 'Genesis 1\u201350; Daniel 2:4\u20135; Malachi 4:5\u20136');
const t = fixture.totals;
check('3 books imported', t.books === 3, `${t.books}`);
check('52 chapters imported (50 GEN + DAN 2 + MAL 4)', t.chapters === 52, `${t.chapters}`);
check('1537 verses imported', t.verses === 1537, `${t.verses}`);
check('20,670 records imported', t.records === 20670, `${t.records}`);
check('no structural extraction errors', t.structuralErrors === 0, `${t.structuralErrors}`);

const genPassages = fixture.passages.filter((p) => p.bookId === 'GEN');
check('Genesis has exactly 50 chapters', genPassages.length === 50, `${genPassages.length}`);
const canonGen = canon.books.find((b) => b.id === 'GEN');
let genCoverageBad = 0;
for (const p of genPassages) {
  const expected = canonGen.chapters[p.chapter - 1];
  if (p.verseData.length !== expected) genCoverageBad++;
}
check('every Genesis chapter matches canon verse count', genCoverageBad === 0, `${genCoverageBad} mismatch(es)`);

for (const [bookId, chapter, verses] of [['DAN', 2, [4, 5]], ['MAL', 4, [5, 6]]]) {
  const p = fixture.passages.find((x) => x.bookId === bookId && x.chapter === chapter);
  check(`retained ${bookId} ${chapter} verses ${verses.join(',')} present`, !!p && JSON.stringify(p.verseData.map((v) => v.verse)) === JSON.stringify(verses));
}

// --- anomaly classes & missing fields --------------------------------------
const { structural, sourceGaps, info } = partitionAnomalies(fixture.anomalies);
check('only source-gap/info diagnostics (no structural)', structural.length === 0, `${structural.length}`);
check('no multi-Strong\'s info anomalies observed', info.length === 0, `${info.length}`);
const kindCounts = {};
for (const a of sourceGaps) kindCounts[a.kind] = (kindCounts[a.kind] || 0) + 1;
check('source-gap kinds are the expected ones', Object.keys(kindCounts).every((k) => ['missing-strongs', 'missing-gloss', 'missing-transliteration', 'missing-morphology'].includes(k)), JSON.stringify(kindCounts));

const allRecords = fixture.passages.flatMap((p) => p.verseData).flatMap((v) => v.records);
let glossErrors = 0;
for (const r of allRecords) {
  if (r.glossStatus === 'missing' && r.gloss !== null) glossErrors++;
  else if (r.glossStatus === 'untranslated' && r.gloss !== '-') glossErrors++;
  else if (r.glossStatus === 'translated' && (r.gloss === null || r.gloss === '-')) glossErrors++;
  if (r.strongsList.length === 0 && r.strongs !== null) glossErrors++;
  if (r.strongsList.length === 1 && r.strongs !== r.strongsList[0]) glossErrors++;
  if (r.strongsList.length > 1 && r.strongs !== null) glossErrors++;
}
check('missing blanks are explicit nulls, intentional blanks are "-"', glossErrors === 0, `${glossErrors}`);

// --- verified variants ------------------------------------------------------
check('13 verified Ketiv/Qere variants', variants.variants.length === 13, `${variants.variants.length}`);
check('5 uncertain Ketiv/Qere cases recorded for review', variants.uncertain.length === 5, `${variants.uncertain.length}`);
let variantWired = 0;
for (const v of variants.variants) {
  const p = fixture.passages.find((x) => x.bookId === v.bookId && x.chapter === v.chapter);
  const rec = p?.verseData.find((vd) => vd.verse === v.verse)?.records[v.order];
  if (rec && rec.variant && rec.variant.oshbKetiv === v.oshbKetiv && rec.variant.oshbQere === v.oshbQere) variantWired++;
}
check('every verified variant is wired to exactly its record', variantWired === 13, `${variantWired}/13`);
const variantKeys = new Set(variants.variants.map((v) => `${v.bookId}:${v.chapter}:${v.verse}:${v.order}`));
let attached = 0;
let attachedBad = 0;
for (const p of fixture.passages) {
  for (const vd of p.verseData) {
    for (const r of vd.records) {
      if (!r.variant) continue;
      attached++;
      if (!variantKeys.has(`${p.bookId}:${p.chapter}:${vd.verse}:${r.order}`)) attachedBad++;
    }
  }
}
check('only the 13 verified variants are attached to records', attached === 13 && attachedBad === 0, `attached ${attached}, unrecognised ${attachedBad}`);
check('variant correspondence is form-verified (displayed surface matches the OSHB Ketiv skeleton)',
  variants.variants.every((v) => skeleton(v.observedPageSurface) === skeleton(v.oshbKetiv)), 'skeleton mismatch');

// --- named anchors ----------------------------------------------------------
const gen24 = fixture.passages.find((p) => p.bookId === 'GEN' && p.chapter === 2).verseData.find((v) => v.verse === 4).records;
const yhwh = gen24.find((r) => r.strongsList.includes('3068'));
check('divine-name convention preserved (YHWH transliteration + gloss)', yhwh && yhwh.transliteration === 'Yah·weh' && yhwh.gloss === 'YHWH', JSON.stringify(yhwh));
const gen817 = variantByHelper('GEN', 8, 17, '3318');
check('Genesis 8:17 variant present with the exact OSHB Qere', gen817 && gen817.oshbQere === 'הַיְצֵ֣א', JSON.stringify(gen817));

function variantByHelper(bookId, chapter, verse, strongs) {
  const list = variants.variants.filter((v) => v.bookId === bookId && v.chapter === chapter && v.verse === verse);
  const hit = list.find((v) => v.strongs === strongs);
  if (!hit) return null;
  const p = fixture.passages.find((x) => x.bookId === bookId && x.chapter === chapter);
  const rec = p?.verseData.find((vd) => vd.verse === verse)?.records[hit.order];
  return rec && rec.variant ? rec.variant : null;
}

// --- report -----------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\nTotals: ${t.chapters} chapters, ${t.verses} verses, ${t.records} records; structural ${t.structuralErrors}; source-gap ${t.sourceGapDiagnostics}; info ${t.infoDiagnostics}.`);
console.log(`Genesis ${genPassages.length} chapters; verified variants ${variants.variants.length}; uncertain ${variants.uncertain.length}.`);
if (failed) { console.error(`\n${failed} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
