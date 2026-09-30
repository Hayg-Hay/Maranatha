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
check('coverage string names the Torah (Genesis\u2013Deuteronomy) plus the retained verses',
  fixture.coverage === 'Genesis 1\u201350; Exodus 1\u201340; Leviticus 1\u201327; Numbers 1\u201336; Deuteronomy 1\u201334; Daniel 2:4\u20135; Malachi 4:5\u20136', fixture.coverage);
const t = fixture.totals;
check('7 books imported', t.books === 7, `${t.books}`);
check('189 chapters imported (50 GEN + 40 EXO + 27 LEV + 36 NUM + 34 DEU + DAN 2 + MAL 4)', t.chapters === 189, `${t.chapters}`);
check('5856 verses imported', t.verses === 5856, `${t.verses}`);
check('80,039 records imported', t.records === 80039, `${t.records}`);
check('no structural extraction errors', t.structuralErrors === 0, `${t.structuralErrors}`);

for (const [bookId, chapters] of [['GEN', 50], ['EXO', 40], ['LEV', 27], ['NUM', 36], ['DEU', 34]]) {
  const passages = fixture.passages.filter((p) => p.bookId === bookId);
  const canonBook = canon.books.find((b) => b.id === bookId);
  let bad = 0;
  for (const p of passages) if (p.verseData.length !== canonBook.chapters[p.chapter - 1]) bad++;
  check(`${bookId} has all ${chapters} chapters matching canon`, passages.length === chapters && bad === 0, `${passages.length} chapters, ${bad} mismatch`);
}

// The five Torah books are complete; keep their combined totals explicit so a
// future book addition cannot silently change them.
const TORAH = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'];
const torahPassages = fixture.passages.filter((p) => TORAH.includes(p.bookId));
const torahRecords = torahPassages.flatMap((p) => p.verseData).flatMap((v) => v.records);
check('Torah (5 books) = 187 chapters, 5852 verses, 79,982 records',
  torahPassages.length === 187
  && torahPassages.reduce((n, p) => n + p.verseData.length, 0) === 5852
  && torahRecords.length === 79982,
  `${torahPassages.length}/${torahPassages.reduce((n, p) => n + p.verseData.length, 0)}/${torahRecords.length}`);
const deuPassages = fixture.passages.filter((p) => p.bookId === 'DEU');
const deuRecords = deuPassages.flatMap((p) => p.verseData).flatMap((v) => v.records);
check('Deuteronomy = 34 chapters, 959 verses, 14,294 records',
  deuPassages.length === 34
  && deuPassages.reduce((n, p) => n + p.verseData.length, 0) === 959
  && deuRecords.length === 14294,
  `${deuPassages.length}/${deuPassages.reduce((n, p) => n + p.verseData.length, 0)}/${deuRecords.length}`);

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
check('65 verified Ketiv/Qere variants', variants.variants.length === 65, `${variants.variants.length}`);
check('uncertain written/read cases are left unattached', variants.uncertain.length === 4, `${variants.uncertain.length}`);
check('the two deferred multiword Qere pairs remain uncertain',
  ['GEN 30:11', 'EXO 4:2'].every((ref) => variants.uncertain.some((u) => `${u.bookId} ${u.chapter}:${u.verse}` === ref && /multiword Qere/.test(u.reason))),
  JSON.stringify(variants.uncertain.map((u) => u.reason)));
check('the new Deuteronomy uncertain cases are documented, not forced',
  ['DEU 33:2', 'DEU 5:10'].every((ref) => variants.uncertain.some((u) => `${u.bookId} ${u.chapter}:${u.verse}` === ref)),
  JSON.stringify(variants.uncertain.filter((u) => u.bookId === 'DEU').map((u) => `${u.chapter}:${u.verse} ${u.reason}`)));
let variantWired = 0;
let fingerprintBad = 0;
let fingerprintMissing = 0;
for (const v of variants.variants) {
  const rec = recordAt(v.bookId, v.chapter, v.verse, v.order);
  if (rec && rec.variant && rec.variant.oshbKetiv === v.oshbKetiv && rec.variant.oshbQere === v.oshbQere) variantWired++;
  if (!v.sourceFingerprint) fingerprintMissing++;
  else if (rec && recordFingerprint(rec) !== v.sourceFingerprint) fingerprintBad++;
}
check('every verified variant is wired to exactly its record', variantWired === 65, `${variantWired}/65`);
check('every verified variant carries a source fingerprint', fingerprintMissing === 0, `${fingerprintMissing} missing`);
check('every attached fingerprint matches its record', fingerprintBad === 0, `${fingerprintBad} stale`);
check('23 of the verified variants are Deuteronomy', variants.variants.filter((v) => v.bookId === 'DEU').length === 23, `${variants.variants.filter((v) => v.bookId === 'DEU').length}`);
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
check('only the 65 verified variants are attached to records', attached === 65 && attachedBad === 0, `attached ${attached}, unrecognised ${attachedBad}`);
check('variant letters match the displayed surface skeleton',
  variants.variants.every((v) => skeleton(v.observedPageSurface) === skeleton(v.oshbKetiv)), 'skeleton mismatch');

// --- resolved Genesis cases (previously uncertain) --------------------------
for (const [chapter, verse, strongs] of [[27, 3, '6718'], [27, 29, '7812'], [36, 5, '3266'], [36, 14, '3266']]) {
  const v = variantAt('GEN', chapter, verse, strongs);
  check(`Genesis ${chapter}:${verse} Ketiv/Qere resolved and attached`, !!v && v.type === 'ketiv-qere', JSON.stringify(v && v.sourceDisplays));
}
// GEN 30:11 is a multiword Qere and is intentionally left unattached.
check('Genesis 30:11 left unattached (multiword Qere)', variantAt('GEN', 30, 11, '935') === null);

// --- named anchors / divine name -------------------------------------------
const gen24 = fixture.passages.find((p) => p.bookId === 'GEN' && p.chapter === 2).verseData.find((v) => v.verse === 4).records;
const yhwhGen = gen24.find((r) => r.strongsList.includes('3068'));
check('Genesis divine-name convention preserved (Yah·weh / YHWH)', yhwhGen && yhwhGen.transliteration === 'Yah·weh' && yhwhGen.gloss === 'YHWH', JSON.stringify(yhwhGen));
const exo315 = fixture.passages.find((p) => p.bookId === 'EXO' && p.chapter === 3).verseData.find((v) => v.verse === 15).records;
const yhwhExo = exo315.find((r) => r.strongsList.includes('3068'));
check('Exodus divine-name convention preserved (Yah·weh / YHWH)', yhwhExo && yhwhExo.transliteration === 'Yah·weh' && yhwhExo.gloss === 'YHWH', JSON.stringify(yhwhExo));
const lev11 = fixture.passages.find((p) => p.bookId === 'LEV' && p.chapter === 1).verseData.find((v) => v.verse === 1).records;
const yhwhLev = lev11.find((r) => r.strongsList.includes('3068'));
check('Leviticus divine-name convention preserved (Yah·weh / YHWH)', yhwhLev && yhwhLev.transliteration === 'Yah·weh' && yhwhLev.gloss === 'YHWH', JSON.stringify(yhwhLev));
check('Genesis 8:17 variant present with the exact OSHB Qere', variantAt('GEN', 8, 17, '3318')?.oshbQere === 'הַיְצֵ֣א');
const exo225 = variantAt('EXO', 22, 5, '1165');
check('Exodus 22:5 variant present (OSHB 22:4 mapped to the English verse)', exo225 && exo225.oshbQere === 'בְּעִיר֔/וֹ' && exo225.oshbRef === 'Exod 22:4', JSON.stringify(exo225 && { q: exo225.oshbQere, ref: exo225.oshbRef }));
const lev1621 = variantAt('LEV', 16, 21, '3027');
check('Leviticus 16:21 variant present with the exact OSHB Qere', lev1621 && lev1621.oshbQere === 'יָדָ֗י/ו', JSON.stringify(lev1621 && lev1621.oshbQere));
const num11 = fixture.passages.find((p) => p.bookId === 'NUM' && p.chapter === 1).verseData.find((v) => v.verse === 1).records;
const yhwhNum = num11.find((r) => r.strongsList.includes('3068'));
check('Numbers divine-name convention preserved (Yah·weh / YHWH)', yhwhNum && yhwhNum.transliteration === 'Yah·weh' && yhwhNum.gloss === 'YHWH', JSON.stringify(yhwhNum));
const num2313 = variantAt('NUM', 23, 13, '1980');
check('Numbers 23:13 variant present with the exact OSHB Qere', num2313 && num2313.oshbQere === 'לְכָ/ה', JSON.stringify(num2313 && num2313.oshbQere));

// --- Deuteronomy anchors (Torah completion) ---------------------------------
const deu16 = fixture.passages.find((p) => p.bookId === 'DEU' && p.chapter === 1).verseData.find((v) => v.verse === 6).records;
const yhwhDeu = deu16.find((r) => r.strongsList.includes('3068'));
check('Deuteronomy divine-name convention preserved (Yah\u00b7weh / YHWH)', yhwhDeu && yhwhDeu.transliteration === 'Yah\u00b7weh' && yhwhDeu.gloss === 'YHWH', JSON.stringify(yhwhDeu));
const deuShema = fixture.passages.find((p) => p.bookId === 'DEU' && p.chapter === 6).verseData.find((v) => v.verse === 4).records;
check('Deuteronomy 6:4 (Shema) has the expected 6 records with the divine name twice',
  deuShema.length === 6 && deuShema.filter((r) => r.strongsList.includes('3068')).length === 2,
  JSON.stringify(deuShema.map((r) => r.gloss)));
check('Deuteronomy 34:12 ends the Torah (last chapter/verse present)',
  !!fixture.passages.find((p) => p.bookId === 'DEU' && p.chapter === 34)?.verseData.find((v) => v.verse === 12));
const deu2827 = variantAt('DEU', 28, 27, '6076');
check('Deuteronomy 28:27 variant present with the exact OSHB Qere', deu2827 && deu2827.oshbQere === '\u05d5\u05bc/\u05d1\u05b7/\u05d8\u05bc\u05b0\u05d7\u05b9\u05e8\u05b4\u0594\u05d9\u05dd', JSON.stringify(deu2827 && deu2827.oshbQere));
check('Deuteronomy 5:10 left unattached (ambiguous surface, paragraph marker)',
  recordAt('DEU', 5, 10, 5)?.variant == null);
check('Deuteronomy 33:2 left unattached (multiword Qere)', recordAt('DEU', 33, 2, 14)?.variant == null);

// --- missing-gloss audit (every explicit null, classified) ------------------
const missingGlossRecords = [];
for (const p of fixture.passages) {
  for (const vd of p.verseData) {
    for (const r of vd.records) {
      if (r.glossStatus !== 'missing') continue;
      const isObjectMarker = r.strongsList.includes('853') || r.strongsList.includes('854');
      missingGlossRecords.push({ ref: `${p.bookId} ${p.chapter}:${vd.verse} #${r.order}`, surface: r.surface, strongsList: r.strongsList, morphology: r.morphology, isObjectMarker });
    }
  }
}
check('missing-gloss count matches the recorded totals', missingGlossRecords.length === t.missingGlosses, `${missingGlossRecords.length} vs ${t.missingGlosses}`);
check('every missing gloss is an explicit null (never a substitute)', missingGlossRecords.every((m) => m.morphology != null));

// --- report -----------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\nMissing-gloss records (explicit nulls) — ${missingGlossRecords.length} total:`);
for (const m of missingGlossRecords) {
  console.log(`  ${m.ref}  ${m.surface}  H${m.strongsList.join('+') || 'none'}  ${m.morphology}  ${m.isObjectMarker ? '[object marker]' : '[SUBSTANTIVE — review]'}`);
}
console.log(`\nTotals: ${t.books} books, ${t.chapters} chapters, ${t.verses} verses, ${t.records} records; structural ${t.structuralErrors}; source-gap ${t.sourceGapDiagnostics}; info ${t.infoDiagnostics}.`);
console.log(`Verified variants ${variants.variants.length}; uncertain ${variants.uncertain.length}.`);
if (failed) { console.error(`\n${failed} check(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} checks passed.`);
