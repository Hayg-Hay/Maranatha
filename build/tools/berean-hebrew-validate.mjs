// berean-hebrew-validate.mjs
//
// Offline validation for the Berean Hebrew (draft) preview: the committed
// fixture against the local cached pages, the manifest and the verified variant
// table. Coverage, totals, anomaly classes, variant wiring, fingerprints and
// deterministic regeneration. Deep record-level fidelity is checked separately
// and independently by berean-hebrew-compare.mjs.
//
//   node build/tools/berean-hebrew-validate.mjs
//
// Reads the ignored local source cache; on a fresh checkout it skips with
// guidance and exits 0 (never downloads).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildFixture, FIXTURE, PARSER_VERSION, partitionAnomalies, recordFingerprint, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

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

function recordAt(bookId, chapter, verse, order) {
  const p = fixture.passages.find((x) => x.bookId === bookId && x.chapter === chapter);
  return p?.verseData.find((vd) => vd.verse === verse)?.records[order] || null;
}
function variantAt(bookId, chapter, verse, strongs) {
  const hit = variants.variants.find((v) => v.bookId === bookId && v.chapter === chapter && v.verse === verse && (!strongs || v.strongs === strongs));
  return hit ? recordAt(bookId, chapter, verse, hit.order)?.variant || null : null;
}

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
check('coverage string names Genesis 1-50 and Exodus 1-40 plus the retained verses',
  fixture.coverage === 'Genesis 1\u201350; Exodus 1\u201340; Daniel 2:4\u20135; Malachi 4:5\u20136', fixture.coverage);
const t = fixture.totals;
check('4 books imported', t.books === 4, `${t.books}`);
check('92 chapters imported (50 GEN + 40 EXO + DAN 2 + MAL 4)', t.chapters === 92, `${t.chapters}`);
check('2750 verses imported', t.verses === 2750, `${t.verses}`);
check('37,383 records imported', t.records === 37383, `${t.records}`);
check('no structural extraction errors', t.structuralErrors === 0, `${t.structuralErrors}`);

for (const [bookId, chapters] of [['GEN', 50], ['EXO', 40]]) {
  const passages = fixture.passages.filter((p) => p.bookId === bookId);
  const canonBook = canon.books.find((b) => b.id === bookId);
  let bad = 0;
  for (const p of passages) if (p.verseData.length !== canonBook.chapters[p.chapter - 1]) bad++;
  check(`${bookId} has all ${chapters} chapters matching canon`, passages.length === chapters && bad === 0, `${passages.length} chapters, ${bad} mismatch`);
}

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
let fieldErrors = 0;
for (const r of allRecords) {
  if (r.glossStatus === 'missing' && r.gloss !== null) fieldErrors++;
  else if (r.glossStatus === 'untranslated' && r.gloss !== '-') fieldErrors++;
  else if (r.glossStatus === 'translated' && (r.gloss === null || r.gloss === '-')) fieldErrors++;
  if (r.strongsList.length === 0 && r.strongs !== null) fieldErrors++;
  if (r.strongsList.length === 1 && r.strongs !== r.strongsList[0]) fieldErrors++;
  if (r.strongsList.length > 1 && r.strongs !== null) fieldErrors++;
}
check('missing blanks are explicit nulls, intentional blanks are "-"', fieldErrors === 0, `${fieldErrors}`);

// --- verified variants ------------------------------------------------------
check('30 verified Ketiv/Qere variants', variants.variants.length === 30, `${variants.variants.length}`);
check('all covered Ketiv/Qere cases resolved (0 uncertain)', variants.uncertain.length === 0, `${variants.uncertain.length}`);
let variantWired = 0;
let fingerprintBad = 0;
let fingerprintMissing = 0;
for (const v of variants.variants) {
  const rec = recordAt(v.bookId, v.chapter, v.verse, v.order);
  if (rec && rec.variant && rec.variant.oshbKetiv === v.oshbKetiv && rec.variant.oshbQere === v.oshbQere) variantWired++;
  if (!v.sourceFingerprint) fingerprintMissing++;
  else if (rec && recordFingerprint(rec) !== v.sourceFingerprint) fingerprintBad++;
}
check('every verified variant is wired to exactly its record', variantWired === 30, `${variantWired}/30`);
check('every verified variant carries a source fingerprint', fingerprintMissing === 0, `${fingerprintMissing} missing`);
check('every attached fingerprint matches its record', fingerprintBad === 0, `${fingerprintBad} stale`);
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
check('only the 30 verified variants are attached to records', attached === 30 && attachedBad === 0, `attached ${attached}, unrecognised ${attachedBad}`);
check('variant letters match the displayed surface skeleton',
  variants.variants.every((v) => skeleton(v.observedPageSurface) === skeleton(v.oshbKetiv)), 'skeleton mismatch');

// --- resolved Genesis cases (previously uncertain) --------------------------
for (const [chapter, verse, strongs] of [[27, 3, '6718'], [27, 29, '7812'], [30, 11, '935'], [36, 5, '3266'], [36, 14, '3266']]) {
  const v = variantAt('GEN', chapter, verse, strongs);
  check(`Genesis ${chapter}:${verse} Ketiv/Qere resolved and attached`, !!v && v.type === 'ketiv-qere', JSON.stringify(v && v.sourceDisplays));
}

// --- named anchors / divine name -------------------------------------------
const gen24 = fixture.passages.find((p) => p.bookId === 'GEN' && p.chapter === 2).verseData.find((v) => v.verse === 4).records;
const yhwhGen = gen24.find((r) => r.strongsList.includes('3068'));
check('Genesis divine-name convention preserved (Yah·weh / YHWH)', yhwhGen && yhwhGen.transliteration === 'Yah·weh' && yhwhGen.gloss === 'YHWH', JSON.stringify(yhwhGen));
const exo315 = fixture.passages.find((p) => p.bookId === 'EXO' && p.chapter === 3).verseData.find((v) => v.verse === 15).records;
const yhwhExo = exo315.find((r) => r.strongsList.includes('3068'));
check('Exodus divine-name convention preserved (Yah·weh / YHWH)', yhwhExo && yhwhExo.transliteration === 'Yah·weh' && yhwhExo.gloss === 'YHWH', JSON.stringify(yhwhExo));
check('Genesis 8:17 variant present with the exact OSHB Qere', variantAt('GEN', 8, 17, '3318')?.oshbQere === 'הַיְצֵ֣א');
const exo225 = variantAt('EXO', 22, 5, '1165');
check('Exodus 22:5 variant present (OSHB 22:4 mapped to the English verse)', exo225 && exo225.oshbQere === 'בְּעִיר֔/וֹ' && exo225.oshbRef === 'Exod 22:4', JSON.stringify(exo225 && { q: exo225.oshbQere, ref: exo225.oshbRef }));

// --- report -----------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\nTotals: ${t.books} books, ${t.chapters} chapters, ${t.verses} verses, ${t.records} records; structural ${t.structuralErrors}; source-gap ${t.sourceGapDiagnostics}; info ${t.infoDiagnostics}.`);
console.log(`Verified variants ${variants.variants.length}; uncertain ${variants.uncertain.length}.`);
if (failed) { console.error(`\n${failed} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
