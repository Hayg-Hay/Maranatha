// berean-hebrew-validate.mjs
//
// Offline validation for the Berean Hebrew pilot. Reads the local cached Bible
// Hub pages, the source manifest, the annotations table, and the extracted
// fixture. No network.
//
//   node build/tools/berean-hebrew-validate.mjs
//
// It checks the things the pilot brief asks for: passage/verse coverage, record
// counts and order, Hebrew Unicode/vowel marks, transliteration/gloss fidelity,
// Strong's and morphology fidelity, intentional blanks vs missing fields,
// Hebrew/Aramaic identification, Ketiv/Qere representation, structural vs
// source-gap diagnostics, and deterministic regeneration from the cached pages.
//
// IMPORTANT LIMIT OF WHAT THIS SCRIPT PROVES: deterministic regeneration shows
// the fixture is reproducible from the cache; it does NOT by itself prove the
// parser read the page correctly. Independent fidelity comes from the page
// anchors checked below and from the supervisor's separate DOM-based reader
// comparison across all 1,370 records.
//
// Note: this pilot's files are UNCOMMITTED work-in-progress on a codex branch;
// "cached"/"local" below means on disk, not in git history. The raw source
// pages are intentionally kept local (see .gitignore) while fixtures and hashes
// are the committed record.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildFixture, FIXTURE, PILOT, PARSER_VERSION, partitionAnomalies, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
const MANIFEST = path.join(SRC_DIR, 'source-manifest.json');
const ANNOTATIONS = path.join(SRC_DIR, 'annotations.json');

// This validator compares the committed fixture against the ignored local raw
// pages, so it needs that cache. On a fresh checkout it skips with guidance
// rather than failing obscurely — and never downloads anything itself.
const cacheStatus = missingSourcePages();
if (cacheStatus.missing.length || cacheStatus.manifestMissing) {
  console.log('SKIP  Berean Hebrew validator (source-page-dependent).');
  console.log(sourceCacheRecoveryMessage(cacheStatus.missing));
  process.exit(0);
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);

const fixtureText = fs.readFileSync(FIXTURE, 'utf8');
const fixture = JSON.parse(fixtureText);
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const annotations = JSON.parse(fs.readFileSync(ANNOTATIONS, 'utf8'));

// --- source identity & integrity at rest ----------------------------------
check('fixture names the Berean Interlinear Bible (BIB) as the source', fixture.source.edition === 'Berean Interlinear Bible (BIB)', fixture.source.edition);
check('fixture edition evidence names all three cached pages', /all three cached pages/i.test(fixture.source.editionEvidence || ''));
check('fixture records retrieval permission separately from the public-domain dedication', /retrieval/i.test(fixture.source.permission) && /terms\.htm/.test(fixture.source.permission));
check('fixture cites the official reuse-terms URL', fixture.source.termsUrl === 'https://berean.bible/terms.htm', fixture.source.termsUrl);
check('fixture is labelled a dated draft', fixture.draft === true && /draft/i.test(fixture.source.draftNote));
check('parser version recorded', fixture.parserVersion === PARSER_VERSION, `${fixture.parserVersion} vs ${PARSER_VERSION}`);

for (const page of manifest.pages) {
  const p = path.join(SRC_DIR, page.file);
  const ok = fs.existsSync(p) && sha256(fs.readFileSync(p)) === page.sha256;
  check(`cached page hash matches manifest: ${page.passage}`, ok, page.file);
  check(`cached page footer states the BIB edition: ${page.passage}`, /Berean Interlinear Bible \(BIB\)/.test(page.editionFooter || ''), page.editionFooter);
  check(`cached page has a retrieval date: ${page.passage}`, !!page.retrievedAt, page.retrievedAt);
}

// --- deterministic regeneration from cached pages -------------------------
const fresh = buildFixture();
check('fixture regenerates deterministically from the cached pages', JSON.stringify(fresh) === JSON.stringify(fixture));

// --- coverage -------------------------------------------------------------
const expectedCoverage = { 'GEN 1:1-5': [1, 2, 3, 4, 5], 'DAN 2:4-5': [4, 5], 'MAL 4:5-6': [5, 6] };
check('all three pilot passages present', fixture.passages.length === 3 && fixture.passages.every((p) => p.passage in expectedCoverage));
for (const p of fixture.passages) {
  const want = expectedCoverage[p.passage];
  check(`${p.passage}: verses match the brief`, JSON.stringify(p.verses) === JSON.stringify(want), JSON.stringify(p.verses));
  check(`${p.passage}: verseData has one entry per requested verse`, p.verseData.length === want.length, `${p.verseData.length}`);
  check(`${p.passage}: source page hash recorded`, /^[0-9a-f]{64}$/.test(p.sourcePage.sha256 || ''));
}

// --- record counts & order ------------------------------------------------
const EXPECTED_RECORDS = { 'GEN 1:1-5': 52, 'DAN 2:4-5': 29, 'MAL 4:5-6': 28 };
for (const p of fixture.passages) {
  check(`${p.passage}: record count = ${EXPECTED_RECORDS[p.passage]}`, p.recordCount === EXPECTED_RECORDS[p.passage], `${p.recordCount}`);
  for (const v of p.verseData) {
    check(`${p.passage} v${v.verse}: order contiguous 0..n-1`, v.records.every((r, i) => r.order === i), v.records.map((r) => r.order).join(','));
    check(`${p.passage} v${v.verse}: recordCount matches array`, v.recordCount === v.records.length);
  }
}
check('total records = 109', fixture.totals.records === 109, `${fixture.totals.records}`);

// --- Hebrew Unicode & vowel marks -----------------------------------------
const HEBREW_LETTER = /[\u05D0-\u05EA]/;
const VOWEL_OR_ACCENT = /[\u0591-\u05C7]/;
const FORBIDDEN = /&#|&nbsp;|&amp;|<|>|\u00A0|\u2011|\u00A6/;
let unicodeErrors = 0;
let withVowels = 0;
let withCantillation = 0;
let withMaqqef = 0;
for (const p of fixture.passages) {
  for (const v of p.verseData) {
    for (const r of v.records) {
      if (!r.surface || !HEBREW_LETTER.test(r.surface)) unicodeErrors++;
      if (FORBIDDEN.test(r.surface) || FORBIDDEN.test(r.transliteration || '') || FORBIDDEN.test(r.gloss || '')) unicodeErrors++;
      if (/[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(r.surface)) withVowels++;
      if (/[\u0591-\u05AF\u05BD]/.test(r.surface)) withCantillation++;
      if (r.surface.includes('\u05BE')) withMaqqef++;
    }
  }
}
check('every surface is non-empty Hebrew script, no entities/tags/NBSP leaked', unicodeErrors === 0, `${unicodeErrors}`);
check('vowel points (niqqud) survive in extracted surfaces', withVowels > 0, `${withVowels} records`);
check('cantillation marks survive in extracted surfaces', withCantillation > 0, `${withCantillation} records`);
check('maqqef (U+05BE) survives where the source has it', withMaqqef > 0, `${withMaqqef} records`);

// --- field fidelity -------------------------------------------------------
let fieldErrors = 0;
let strongsErrors = 0;
let noStrongs = 0;
let multiStrongsRecords = 0;
let singularMismatch = 0;
for (const p of fixture.passages) {
  for (const v of p.verseData) {
    for (const r of v.records) {
      if (!r.surface || !r.transliteration || !r.morphology) fieldErrors++;
      if (!Array.isArray(r.strongsList)) { strongsErrors++; continue; }
      for (const s of r.strongsList) if (!/^\d+$/.test(s)) strongsErrors++;
      if (r.strongsList.length === 0) noStrongs++;
      if (r.strongsList.length > 1) multiStrongsRecords++;
      // Compatibility singular must be the sole number, or null. It never hides extras.
      const expected = r.strongsList.length === 1 ? r.strongsList[0] : null;
      if (r.strongs !== expected) singularMismatch++;
    }
  }
}
check('every record has surface + transliteration + morphology', fieldErrors === 0, `${fieldErrors} incomplete`);
check('every Strong\'s number in every strongsList is numeric', strongsErrors === 0, `${strongsErrors} non-numeric`);
check('records with no Strong\'s are explicit empty strongsList (not invented)', noStrongs === fixture.totals.recordsWithoutStrongs && noStrongs === 1, `${noStrongs}`);
check('singular `strongs` equals the sole number, else null (never hides extras)', singularMismatch === 0, `${singularMismatch}`);
check('no multi-Strong\'s record observed in the pilot', multiStrongsRecords === 0, `${multiStrongsRecords}`);

// --- structural vs source-gap diagnostics ---------------------------------
check('every anomaly carries a valid class', fixture.anomalies.every((a) => ['structural', 'source-gap', 'info'].includes(a.class)));
const { structural, sourceGaps, info } = partitionAnomalies(fixture.anomalies);
check('no structural extraction errors in the accepted fixture', structural.length === 0, JSON.stringify(structural.slice(0, 3)));
check('fixture anomaly totals agree with the partitioned list',
  fixture.totals.structuralErrors === structural.length
  && fixture.totals.sourceGapDiagnostics === sourceGaps.length
  && fixture.totals.infoDiagnostics === info.length
  && fixture.totals.pilotRangeSourceGaps === sourceGaps.filter((a) => a.inPilotRange).length,
  `totals ${fixture.totals.structuralErrors}/${fixture.totals.sourceGapDiagnostics}/${fixture.totals.infoDiagnostics} vs list ${structural.length}/${sourceGaps.length}/${info.length}`);
const pilotMissingStrongs = sourceGaps.filter((a) => a.kind === 'missing-strongs' && a.inPilotRange);
const pilotMissingGloss = sourceGaps.filter((a) => a.kind === 'missing-gloss' && a.inPilotRange);
const pageMissingGloss = sourceGaps.filter((a) => a.kind === 'missing-gloss' && !a.inPilotRange);
check('the one no-Strong\'s pilot record is a diagnosed source gap', pilotMissingStrongs.length === 1, `${pilotMissingStrongs.length}`);
check('fixture counts exactly one pilot-range source gap', fixture.totals.pilotRangeSourceGaps === 1, `${fixture.totals.pilotRangeSourceGaps}`);
check('no missing gloss within the pilot verses; the 6 empty Daniel-chapter glosses are outside it',
  pilotMissingGloss.length === 0 && pageMissingGloss.length === 6, `pilot=${pilotMissingGloss.length} page=${pageMissingGloss.length}`);
check('no missing transliteration/morphology in the accepted fixture', structural.every((a) => a.kind !== 'missing-transliteration' && a.kind !== 'missing-morphology'));

// Known anchors (fidelity spot-checks against the page).
const gen11 = fixture.passages.find((p) => p.passage === 'GEN 1:1-5').verseData.find((v) => v.verse === 1).records;
const GEN_1_1_GLOSSES = ['In the beginning', 'created', 'God', '-', 'the heavens', 'and', 'the earth'];
const GEN_1_1_STRONGS = ['7225', '1254', '430', '853', '8064', '853', '776'];
check('GEN 1:1 glosses match the source page', JSON.stringify(gen11.map((r) => r.gloss)) === JSON.stringify(GEN_1_1_GLOSSES));
check('GEN 1:1 Strong\'s sequence matches the source page', JSON.stringify(gen11.map((r) => r.strongs)) === JSON.stringify(GEN_1_1_STRONGS));
check('GEN 1:1 transliteration is the page\'s (e.g. bə·rê·šîṯ)', gen11[0].transliteration === 'bə·rê·šîṯ', gen11[0].transliteration);
check('GEN 1:1 morphology is the page\'s (e.g. Prep-b ¦ N-fs)', gen11[0].morphology === 'Prep-b ¦ N-fs', gen11[0].morphology);

// Source-identity cross-check, LIMITED TO THE ONE PASSAGE COMPARED: for
// Genesis 1:1 only, the vowels/consonants on the Bible Hub page match OSHB
// (WLC). This does not establish corpus-wide edition identity — it shows that
// for the single inspected passage the Berean contribution is the contextual
// gloss + alignment rather than a different Hebrew text.
const heInterlinearPath = path.join(ROOT, 'data', 'he-interlinear.json');
if (fs.existsSync(heInterlinearPath)) {
  const heInterlinear = JSON.parse(fs.readFileSync(heInterlinearPath, 'utf8'));
  const oshbGen11 = heInterlinear.books.GEN[0][0].map((w) => w[0]);
  const stripPunct = (s) => s.replace(/[\u05BE\u05C0\u05C3\u05F3\u05F4]/g, '');
  check('GEN 1:1 (only) Hebrew surface matches OSHB/WLC; not a corpus-wide claim',
    JSON.stringify(gen11.map((r) => stripPunct(r.surface))) === JSON.stringify(oshbGen11.map(stripPunct)),
    `berean=${gen11.length} oshb=${oshbGen11.length}`);
} else {
  console.log('note: data/he-interlinear.json absent — skipped OSHB surface cross-check.');
}

// --- intentional blanks vs missing fields ---------------------------------
let translated = 0, untranslated = 0, missing = 0;
for (const p of fixture.passages) {
  for (const v of p.verseData) {
    for (const r of v.records) {
      if (r.glossStatus === 'translated') translated++;
      else if (r.glossStatus === 'untranslated') { untranslated++; if (r.gloss !== '-') fieldErrors++; }
      else if (r.glossStatus === 'missing') { missing++; if (r.gloss !== null) fieldErrors++; }
      else fieldErrors++;
    }
  }
}
check('untranslated "-" markers are preserved as their own status', untranslated === 4 && fixture.totals.untranslatedGlosses === 4, `${untranslated}`);
check('untranslated marker records keep gloss "-" (not blanked)', fixture.passages.flatMap((p) => p.verseData).flatMap((v) => v.records).filter((r) => r.glossStatus === 'untranslated').every((r) => r.gloss === '-'));
check('no missing (empty) glosses within the pilot verses', missing === 0, `${missing}`);
check('the pilot has no unclassified gloss status', fieldErrors === 0, `${fieldErrors}`);

// --- Hebrew / Aramaic identification --------------------------------------
const genAll = fixture.passages.find((p) => p.passage === 'GEN 1:1-5');
const malAll = fixture.passages.find((p) => p.passage === 'MAL 4:5-6');
check('GEN 1:1-5 all identified Hebrew', genAll.verseData.every((v) => v.language === 'hebrew' && v.records.every((r) => r.language === 'hebrew')));
check('MAL 4:5-6 all identified Hebrew', malAll.verseData.every((v) => v.language === 'hebrew'));
const dan = fixture.passages.find((p) => p.passage === 'DAN 2:4-5');
const dan24 = dan.verseData.find((v) => v.verse === 4).records;
const dan25 = dan.verseData.find((v) => v.verse === 5).records;
const marker762 = dan24.findIndex((r) => r.strongs === '762');
check('DAN 2:4 is identified mixed and switches to Aramaic after "in Aramaic" (H762)', marker762 > 0 && dan24.slice(0, marker762 + 1).every((r) => r.language === 'hebrew') && dan24.slice(marker762 + 1).every((r) => r.language === 'aramaic'), `marker index ${marker762}`);
check('DAN 2:5 is identified Aramaic', dan25.every((r) => r.language === 'aramaic'));

// --- Ketiv / Qere ---------------------------------------------------------
const skeleton = (s) => (s || '').replace(/[\u0591-\u05C7]/g, '').replace(/\//g, '');
const kq = [
  { passage: 'DAN 2:4-5', verse: 4, strongs: '5649' },
  { passage: 'DAN 2:4-5', verse: 5, strongs: '3779' },
];
for (const { passage, verse, strongs } of kq) {
  const rec = fixture.passages.find((p) => p.passage === passage).verseData.find((v) => v.verse === verse).records.find((r) => r.strongsList.includes(strongs));
  const ann = annotations.variants.find((a) => a.verse === verse && a.strongs === strongs);
  check(`Dan 2:${verse} H${strongs}: variant metadata attached (source does not mark it)`, rec && rec.variant && rec.variant.type === 'ketiv-qere' && rec.variant.sourceMarksVariant === false);
  check(`Dan 2:${verse} H${strongs}: page surface matches the OSHB Ketiv skeleton`, rec && skeleton(rec.surface) === skeleton(ann.oshbKetiv), `${skeleton(rec.surface)} vs ${skeleton(ann.oshbKetiv)}`);
  check(`Dan 2:${verse} H${strongs}: page surface differs from the OSHB Qere skeleton`, rec && skeleton(rec.surface) !== skeleton(ann.oshbQere));
  const sameVerseCount = fixture.passages.find((p) => p.passage === passage).verseData.find((v) => v.verse === verse).records.filter((r) => r.strongsList.includes(strongs)).length;
  check(`Dan 2:${verse} H${strongs}: written/read variants not flattened into consecutive words`, sameVerseCount === 1, `${sameVerseCount} records`);
}

// --- report ---------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}

console.log('\nRecord counts per pilot verse:');
for (const p of fixture.passages) {
  console.log(`  ${p.passage}`);
  for (const v of p.verseData) console.log(`    ${p.book} ${p.chapter}:${v.verse}  [${v.language}]  ${v.recordCount} records`);
}
console.log('\nGenesis 1:1 — OSHB card labels vs Berean contextual glosses:');
const OSHB_LABELS = ['the first', 'to create', 'gods in the ordinary sense', 'self', 'the sky', 'self', 'the earth'];
gen11.forEach((r, i) => {
  const resolved = r.gloss !== OSHB_LABELS[i];
  console.log(`  H${String(r.strongs).padEnd(4)} ${r.surface.padEnd(12)}  OSHB='${OSHB_LABELS[i]}'  Berean='${r.gloss}'${resolved ? '  <- resolved' : ''}`);
});

if (failed) { console.error(`\n${failed} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
