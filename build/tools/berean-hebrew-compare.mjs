// berean-hebrew-compare.mjs
//
// INDEPENDENT fidelity check: re-reads every cached Bible Hub page with a
// DOM-based reader (jsdom) — a different mechanism from the regex extractor —
// and compares the result against the accepted fixture record by record:
// references, record counts/order, surface, transliteration, gloss, morphology
// and the COMPLETE Strong's list. It also checks chapter/verse coverage against
// Maranatha's canon and prints the anomaly summary.
//
// It deliberately does NOT import the extractor's parser.
//
//   node build/tools/berean-hebrew-compare.mjs
//
// Reads the ignored local source cache; on a fresh checkout it skips with
// guidance and exits 0 (never downloads).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FIXTURE, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
const MANIFEST = path.join(SRC_DIR, 'source-manifest.json');

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); } catch (e) {
  console.error('This tool requires jsdom. Run: npm install');
  process.exit(2);
}

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
function decode(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}
function normText(raw) {
  return decode(String(raw || ''))
    .replace(/\u2011/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Independent DOM reader: returns { verses: { n: [ {order,surface,transliteration,gloss,morphology,strongsList} ] } }.
function readPageDom(html) {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const tables = [...document.querySelectorAll('table.tablefloatheb')];
  const verses = {};
  let currentVerse = 0;
  for (const table of tables) {
    // Verse reference: first ref span in this word block.
    const refSpan = table.querySelector('span.reftop, span.reftrans, span.refheb, span.refbot, span.reftop2');
    if (refSpan) {
      const n = Number(refSpan.textContent.replace(/[^0-9]/g, ''));
      if (n > 0) currentVerse = n;
    }
    const hebSpans = [...table.querySelectorAll('span.hebrew')];
    const translitSpan = table.querySelector('span.translit');
    const engSpan = table.querySelector('span.eng');
    const morphLink = table.querySelector('a[href="/hebrewparse.htm"]');
    const strongsList = [...table.querySelectorAll('a[href]')]
      .map((a) => /^\/hebrew\/(\d+)\.htm$/.exec(a.getAttribute('href')))
      .filter(Boolean)
      .map((m) => m[1]);

    if (!currentVerse) continue;
    const surface = hebSpans.length === 1 ? normText(hebSpans[0].textContent) : null;
    const transliteration = translitSpan ? normText(translitSpan.textContent) || null : null;
    const gloss = engSpan ? normText(engSpan.textContent) || null : null;
    const morphology = morphLink ? normText(morphLink.textContent) || null : null;
    verses[currentVerse] = verses[currentVerse] || [];
    verses[currentVerse].push({ order: verses[currentVerse].length, surface, transliteration, gloss, morphology, strongsList });
  }
  return { verses };
}

function loadCanon() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'canon.js'), 'utf8')
    .replace(/^window\.MARANATHA_CANON=/, '').replace(/;\s*$/, ''));
}

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);

function main() {
  const cacheStatus = missingSourcePages();
  if (cacheStatus.missing.length || cacheStatus.manifestMissing) {
    console.log('SKIP  Berean Hebrew independent comparison (source-page-dependent).');
    console.log(sourceCacheRecoveryMessage(cacheStatus.missing));
    process.exit(0);
  }

  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const canon = loadCanon();

  let mismatches = 0;
  let comparedRecords = 0;
  let comparedVerses = 0;
  const sampleMismatches = [];
  const coverageIssues = [];

  // Coverage vs canon, per covered book/chapter. Full-book imports (Genesis,
  // Exodus) must match canon exactly; the retained partial books are not
  // checked here.
  const FULL_BOOKS = new Set(['GEN', 'EXO']);
  const byBookChapter = new Map();
  for (const p of fixture.passages) byBookChapter.set(`${p.bookId}:${p.chapter}`, p);
  for (const [key, passage] of byBookChapter) {
    const canonBook = canon.books.find((b) => b.id === passage.bookId);
    const expected = canonBook.chapters[passage.chapter - 1];
    const present = passage.verseData.map((v) => v.verse);
    if (FULL_BOOKS.has(passage.bookId)) {
      const missing = [];
      for (let v = 1; v <= expected; v++) if (!present.includes(v)) missing.push(v);
      if (present.length !== expected || missing.length) coverageIssues.push({ passage: passage.passage, expected, present: present.length, missing });
    }
  }

  for (const passage of fixture.passages) {
    const page = manifest.pages.find((p) => p.bookId === passage.bookId && p.chapter === passage.chapter);
    if (!page) { mismatches++; sampleMismatches.push(`${passage.passage}: no manifest page`); continue; }
    const html = fs.readFileSync(path.join(SRC_DIR, page.file), 'utf8');
    const dom = readPageDom(html);
    for (const vd of passage.verseData) {
      const other = dom.verses[vd.verse];
      comparedVerses++;
      if (!other || other.length !== vd.records.length) {
        mismatches++;
        if (sampleMismatches.length < 20) sampleMismatches.push(`${passage.passage}:${vd.verse} count fixture=${vd.records.length} dom=${other ? other.length : 'missing'}`);
        continue;
      }
      for (let i = 0; i < vd.records.length; i++) {
        comparedRecords++;
        const a = vd.records[i];
        const b = other[i];
        const same = a.order === b.order
          && a.surface === b.surface
          && a.transliteration === b.transliteration
          && a.gloss === b.gloss
          && a.morphology === b.morphology
          && JSON.stringify(a.strongsList) === JSON.stringify(b.strongsList);
        if (!same) {
          mismatches++;
          if (sampleMismatches.length < 20) {
            sampleMismatches.push(`${passage.passage}:${vd.verse} #${i} fixture=${JSON.stringify([a.surface, a.transliteration, a.gloss, a.morphology, a.strongsList])} dom=${JSON.stringify([b.surface, b.transliteration, b.gloss, b.morphology, b.strongsList])}`);
          }
        }
      }
    }
  }

  check('independent reader agrees with the fixture on every covered record', mismatches === 0, `${mismatches} mismatch(es)`);
  check('full-book (Genesis/Exodus) chapter/verse coverage matches canon', coverageIssues.length === 0, JSON.stringify(coverageIssues.slice(0, 5)));
  check('no structural extraction errors in the fixture', fixture.totals.structuralErrors === 0, `${fixture.totals.structuralErrors}`);

  // Anomaly summary (from the fixture) + uncertain variants.
  const byKind = {};
  for (const a of fixture.anomalies) byKind[a.kind] = (byKind[a.kind] || 0) + 1;

  let failed = 0;
  for (const [name, ok, detail] of results) {
    if (ok) console.log(`PASS  ${name}`);
    else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
  }

  console.log(`\nCompared ${comparedVerses} verses / ${comparedRecords} records across ${fixture.passages.length} chapters.`);
  console.log('Anomalies by kind:');
  for (const [kind, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`  ${kind}: ${n}`);
  console.log(`Uncertain Ketiv/Qere cases for review: ${(fixture.uncertainVariants || []).length}`);
  for (const u of fixture.uncertainVariants || []) console.log(`  ${u.bookId} ${u.chapter}:${u.verse} — ${u.reason}`);
  if (sampleMismatches.length) {
    console.log('\nSample mismatches:');
    for (const m of sampleMismatches) console.log(`  ${m}`);
  }
  if (failed) { console.error(`\n${failed} comparison check(s) failed.`); process.exit(1); }
  console.log('\nIndependent comparison: all clear.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
