// berean-hebrew-extract.mjs
//
// Offline extractor for the Berean Interlinear Bible (BIB) Hebrew Old Testament
// local preview. It reads the *cached* Bible Hub pages under
// build/sources/berean-hebrew/source-pages/ and recovers one record per source
// alignment token. It never touches the network and never writes into data/.
//
// WHAT IT RECOVERS, PER SOURCE ALIGNMENT RECORD
//   order          0-based position within the verse, exactly Bible Hub's order
//   surface        Hebrew/Aramaic surface (consonants, niqqud, cantillation,
//                  maqqef) copied from the page
//   transliteration the page's supplied transliteration
//   gloss          the page's supplied contextual English gloss
//   morphology     the page's supplied morphology (e.g. "Prep-b ¦ N-fs")
//   strongsList    ALL Strong's numbers in source order (possibly empty)
//   strongs        compatibility singular: the sole number when exactly one is
//                  supplied, otherwise null. It can never hide extra values —
//                  a multi-number record is null here and complete in
//                  strongsList. Always prefer strongsList for completeness.
//   language       "hebrew" or "aramaic" (a *curated* determination — the page
//                  itself does not label language; see annotations.json)
//   glossStatus    "translated" | "untranslated" ("-" marker) | "missing" (empty)
//
// ANOMALY CLASSES (every anomaly carries a `class`)
//   structural   ambiguous/failed extraction (no surface, multiple Hebrew spans,
//                malformed/out-of-order verse refs, unsupported token structure,
//                ABSENT transliteration/morphology spans, multiple spans of any
//                kind). The fixture build REFUSES to overwrite accepted output
//                while any structural error exists.
//   source-gap   known legitimate omissions the source itself makes (empty gloss
//                span, empty transliteration/morphology for some compound names,
//                absent Strong's). Kept as explicit nulls with diagnostics.
//   info         valid but notable, e.g. a record with multiple Strong's numbers.
//
// WHAT IT DOES *NOT* DO
//   - It does not attach these records to OSHB (or any other) words by position.
//   - It does not generate replacement glosses or fill silently missing fields.
//   - It does not pick a form when several Hebrew spans occur; it refuses.
//   - It does not merge a Ketiv and a Qere into consecutive reading words.
//
// USAGE
//   node build/tools/berean-hebrew-extract.mjs build   # regenerate the fixture
//   node build/tools/berean-hebrew-extract.mjs dump GEN 1 1
//   node build/tools/berean-hebrew-extract.mjs dump DAN 2 4

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PARSER_VERSION = '3.0.0';

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
const PAGE_DIR = path.join(SRC_DIR, 'source-pages');
const MANIFEST = path.join(SRC_DIR, 'source-manifest.json');
const ANNOTATIONS = path.join(SRC_DIR, 'annotations.json');
const VARIANTS = path.join(SRC_DIR, 'variants.json');
export const FIXTURE = path.join(SRC_DIR, 'hebrew.fixture.json');

// Covered passages: all of Genesis, Exodus and Leviticus, plus the retained
// Daniel 2:4-5 and Malachi 4:5-6 pilot verses.
export const COVERAGE = [
  { bookId: 'GEN', book: 'Genesis', full: true },
  { bookId: 'EXO', book: 'Exodus', full: true },
  { bookId: 'LEV', book: 'Leviticus', full: true },
  { bookId: 'DAN', book: 'Daniel', versesByChapter: { 2: [4, 5] } },
  { bookId: 'MAL', book: 'Malachi', versesByChapter: { 4: [5, 6] } },
];

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

function decode(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}
const stripTags = (s) => s.replace(/<[^>]*>/g, '');
// Normalization applied to every text field. U+2011 is the source's non-breaking
// hyphen used in morphology labels; NBSP is used in glosses/morphology. The raw
// values remain in the cached HTML for audit.
function normText(s) {
  return decode(stripTags(s))
    .replace(/\u2011/g, '-') // non-breaking hyphen -> hyphen
    .replace(/\u00a0/g, ' ') // no-break space -> space
    .replace(/\s+/g, ' ')
    .trim();
}

const RE_REF_ANY = /<span class="ref(?:top|trans|heb|bot|top2)"[^>]*>([\s\S]*?)<\/span>/;
const RE_HEBREW = /<span class="hebrew">([\s\S]*?)<\/span>/g;
const RE_TRANSLIT = /<span class="translit">([\s\S]*?)<\/span>/g;
const RE_ENG = /<span class="eng">([\s\S]*?)<\/span>/g;
const RE_MORPH = /<a href="\/hebrewparse\.htm" title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
const RE_STRONGS = /<a href="\/hebrew\/(\d+)\.htm" title="([^"]*)"[^>]*>(\d+)<\/a>/g;

const structural = (kind, fields) => ({ class: 'structural', kind, ...fields });
const sourceGap = (kind, fields) => ({ class: 'source-gap', kind, ...fields });
const info = (kind, fields) => ({ class: 'info', kind, ...fields });

// Split a classed anomaly list into structural / source-gap / info buckets.
export function partitionAnomalies(anomalies = []) {
  return {
    structural: anomalies.filter((a) => a.class === 'structural'),
    sourceGaps: anomalies.filter((a) => a.class === 'source-gap'),
    info: anomalies.filter((a) => a.class === 'info'),
  };
}

// Stable fingerprint of a source record's extracted fields. Variant entries
// carry the fingerprint of the record they were verified against, so a stale
// annotation can never attach to a changed token merely because its index
// stayed the same.
export function recordFingerprint(rec) {
  return sha256(Buffer.from(JSON.stringify([
    rec.order, rec.surface, rec.transliteration, rec.gloss, rec.morphology, rec.strongsList || [],
  ]), 'utf8'));
}

// Parse one Bible Hub interlinear chapter page into ordered per-verse records.
export function parsePage(html, { book, chapter }) {
  const anomalies = [];
  const verses = {};
  // Keep every block that actually opens a word table, whether or not the page
  // has a preamble before the first one (do not blindly drop the first chunk).
  const chunks = html.split(/(?=<table class="tablefloatheb">)/).filter((c) => c.startsWith('<table class="tablefloatheb">'));
  // A page with no recognised word tables is a hard extraction failure, not an
  // empty-but-successful parse. Surface it as a structural error so the fixture
  // build refuses to overwrite accepted output.
  if (!chunks.length) anomalies.push(structural('no-word-tables', { book, chapter }));
  let currentVerse = 0;

  for (const chunk of chunks) {
    // --- verse reference (first ref span in the block, when present) --------
    const refM = RE_REF_ANY.exec(chunk);
    if (refM) {
      const digits = stripTags(refM[1]).replace(/[^0-9]/g, '');
      const n = Number(digits);
      if (!digits || n <= 0) {
        anomalies.push(structural('malformed-verse-reference', { book, chapter, raw: stripTags(refM[1]).replace(/\s+/g, ' ').trim() }));
      } else if (currentVerse && n < currentVerse) {
        anomalies.push(structural('verse-reference-out-of-order', { book, chapter, verse: n, previous: currentVerse }));
        currentVerse = n;
      } else {
        currentVerse = n;
      }
    }

    const hebMatches = [...chunk.matchAll(RE_HEBREW)];
    const translitMatches = [...chunk.matchAll(RE_TRANSLIT)];
    const engMatches = [...chunk.matchAll(RE_ENG)];
    const morphMatches = [...chunk.matchAll(RE_MORPH)];
    const strongsList = [...chunk.matchAll(RE_STRONGS)].map((m) => m[1]);

    const coreSignals = hebMatches.length + translitMatches.length + engMatches.length + morphMatches.length + strongsList.length;
    if (coreSignals === 0) {
      anomalies.push(structural('unsupported-token-structure', { book, chapter, verse: currentVerse || null, reason: 'token block contains no recognisable interlinear field' }));
      continue;
    }

    if (!currentVerse) {
      anomalies.push(structural('token-before-first-verse', { book, chapter }));
      continue;
    }

    // --- surface: exactly one Hebrew span or refuse -------------------------
    let surface = null;
    if (hebMatches.length === 1) {
      surface = normText(hebMatches[0][1]);
      if (!surface) anomalies.push(structural('no-surface', { book, chapter, verse: currentVerse }));
    } else if (hebMatches.length === 0) {
      anomalies.push(structural('no-surface', { book, chapter, verse: currentVerse }));
    } else {
      anomalies.push(structural('multi-hebrew-span', { book, chapter, verse: currentVerse, count: hebMatches.length, candidates: hebMatches.map((m) => normText(m[1])) }));
    }

    // --- transliteration: an EMPTY span is a known source gap (the source
    //     leaves some compound-name transliterations blank); an ABSENT span is
    //     a structural parser failure ----------------------------------------
    let transliteration = null;
    if (translitMatches.length === 1) {
      transliteration = normText(translitMatches[0][1]);
      if (!transliteration) {
        transliteration = null;
        anomalies.push(sourceGap('missing-transliteration', { book, chapter, verse: currentVerse }));
      }
    } else if (translitMatches.length > 1) {
      anomalies.push(structural('multi-transliteration-span', { book, chapter, verse: currentVerse, count: translitMatches.length }));
    } else {
      anomalies.push(structural('no-transliteration-span', { book, chapter, verse: currentVerse }));
    }

    // --- morphology: same empty-vs-absent distinction (the source leaves
    //     morphology blank for some proper-name components) -------------------
    let morphology = null;
    if (morphMatches.length === 1) {
      morphology = normText(morphMatches[0][2]);
      if (!morphology) {
        morphology = null;
        anomalies.push(sourceGap('missing-morphology', { book, chapter, verse: currentVerse }));
      }
    } else if (morphMatches.length > 1) {
      anomalies.push(structural('multi-morphology-span', { book, chapter, verse: currentVerse, count: morphMatches.length }));
    } else {
      anomalies.push(structural('no-morphology-span', { book, chapter, verse: currentVerse }));
    }

    // --- gloss: an ABSENT span is a structural failure; an EMPTY span is a
    //     known legitimate source gap --------------------------------------
    let gloss = null;
    if (engMatches.length === 1) {
      const g = normText(engMatches[0][1]);
      if (g === '') anomalies.push(sourceGap('missing-gloss', { book, chapter, verse: currentVerse }));
      else gloss = g;
    } else if (engMatches.length > 1) {
      anomalies.push(structural('multi-gloss-span', { book, chapter, verse: currentVerse, count: engMatches.length }));
    } else {
      anomalies.push(structural('no-gloss-span', { book, chapter, verse: currentVerse }));
    }

    // --- Strong's: keep the complete ordered list ------------------------
    if (strongsList.length > 1) {
      anomalies.push(info('multi-strongs', { book, chapter, verse: currentVerse, strongsList }));
    } else if (strongsList.length === 0) {
      anomalies.push(sourceGap('missing-strongs', { book, chapter, verse: currentVerse }));
    }

    verses[currentVerse] = verses[currentVerse] || [];
    verses[currentVerse].push({
      order: verses[currentVerse].length,
      surface,
      transliteration,
      gloss,
      morphology,
      strongsList,
      // Compatibility singular; null when zero OR more than one number.
      strongs: strongsList.length === 1 ? strongsList[0] : null,
    });
  }
  return { verses, anomalies };
}

// Curated annotations (language transitions) are external facts the page does
// not state; they are kept in a separate file and referenced, never silently
// merged into the extracted strings.
export function loadAnnotations(annotationsPath = ANNOTATIONS) {
  if (!fs.existsSync(annotationsPath)) return { languageRules: [] };
  return JSON.parse(fs.readFileSync(annotationsPath, 'utf8'));
}

// Generated, verified Ketiv/Qere correspondences (see berean-hebrew-variants.mjs).
export function loadVariants(variantsPath = VARIANTS) {
  if (!fs.existsSync(variantsPath)) return { variants: [], uncertain: [] };
  const parsed = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
  return { variants: parsed.variants || [], uncertain: parsed.uncertain || [] };
}

function applyLanguage(record, bookId, chapter, verse, records, annotations) {
  const rule = (annotations.languageRules || []).find((r) => r.bookId === bookId && r.chapter === chapter && r.verse === verse);
  if (!rule) return record.language || 'hebrew';
  if (rule.language) return rule.language;
  if (rule.type === 'transition-after-strongs') {
    const markerIdx = records.findIndex((r) => r.strongsList.includes(rule.strongs));
    if (markerIdx === -1) return rule.before || 'hebrew';
    return record.order > markerIdx ? rule.after : rule.before;
  }
  return rule.before || 'hebrew';
}

// Assemble one covered chapter from a page's HTML. Pure; no writes.
// `wantedVerses` is null for a full-chapter import, or the explicit verse list
// for the retained Daniel/Malachi pilot verses.
export function assemblePassage({ coverage, html, page, annotations, variantByKey, wantedVerses = null }) {
  const { verses, anomalies: pageAnomalies } = parsePage(html, { book: coverage.book, chapter: page.chapter });
  const present = Object.keys(verses).map(Number).sort((a, b) => a - b);
  const selected = wantedVerses ? wantedVerses.slice() : present;

  // For explicit pilot verses, a missing verse is a real extraction problem.
  const missingWanted = selected.filter((v) => !verses[v]);
  const anomalies = pageAnomalies
    .map((a) => ({ ...a, inSelected: a.verse == null || selected.includes(a.verse) }))
    .concat(missingWanted.map((v) => ({ class: 'structural', kind: 'missing-wanted-verse', book: coverage.book, bookId: coverage.bookId, chapter: page.chapter, verse: v })));

  const outVerses = [];
  let recordCount = 0;
  for (const v of selected) {
    const raw = verses[v];
    if (!raw) continue;
    const records = raw.map((r) => {
      const language = applyLanguage(r, coverage.bookId, page.chapter, v, raw, annotations);
      const glossStatus = r.gloss === null ? 'missing' : r.gloss === '-' ? 'untranslated' : 'translated';
      const variant = variantByKey.get(`${coverage.bookId}:${page.chapter}:${v}:${r.order}`) || null;
      const rec = {
        order: r.order,
        surface: r.surface,
        transliteration: r.transliteration,
        gloss: r.gloss,
        glossStatus,
        morphology: r.morphology,
        strongs: r.strongs,
        strongsList: r.strongsList,
        language,
      };
      if (variant) {
        // Reject a stale annotation whose fingerprint does not match this token.
        if (variant.sourceFingerprint && variant.sourceFingerprint !== recordFingerprint(r)) {
          anomalies.push(structural('stale-variant-fingerprint', {
            bookId: coverage.bookId, chapter: page.chapter, verse: v, order: r.order,
            expected: variant.sourceFingerprint, actual: recordFingerprint(r),
          }));
        } else {
          rec.variant = {
            type: variant.type,
            sourceDisplays: variant.sourceDisplays,
            sourceMarksVariant: variant.sourceMarksVariant,
            ref: `${coverage.bookId} ${page.chapter}:${v} @${variant.strongs}`,
            oshbRef: variant.oshbRef || null,
            provenance: variant.provenance || 'OSHB comparison (not supplied by Berean)',
            evidence: variant.evidence || null,
            sourceFingerprint: variant.sourceFingerprint || null,
            observedPageSurface: variant.observedPageSurface || null,
            oshbKetiv: variant.oshbKetiv || null,
            oshbQere: variant.oshbQere || null,
            note: variant.note || null,
          };
        }
      }
      return rec;
    });
    recordCount += records.length;
    outVerses.push({
      verse: v,
      language: records.every((r) => r.language === 'hebrew') ? 'hebrew' : records.every((r) => r.language === 'aramaic') ? 'aramaic' : 'mixed',
      recordCount: records.length,
      records,
    });
  }

  const passage = {
    passage: `${coverage.bookId} ${page.chapter}`,
    bookId: coverage.bookId,
    book: coverage.book,
    chapter: page.chapter,
    verses: selected,
    recordCount,
    sourcePage: {
      url: page.url,
      file: page.file,
      retrievedAt: page.retrievedAt || null,
      sha256: page.sha256,
      httpStatus: page.httpStatus || 200,
      editionLabel: page.editionFooter || null,
    },
    verseData: outVerses,
  };
  return { passage, anomalies };
}

// Which manifest pages are absent from the local (ignored) source cache. Used
// by source-dependent tools/tests to explain a fresh checkout clearly instead
// of failing with a bare missing-file error. This NEVER downloads anything.
export function missingSourcePages({ pageDir = SRC_DIR, manifestPath = MANIFEST } = {}) {
  if (!fs.existsSync(manifestPath)) return { manifestMissing: true, missing: [] };
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const missing = (manifest.pages || [])
    .filter((p) => !fs.existsSync(path.join(pageDir, p.file)))
    .map((p) => p.passage);
  return { manifestMissing: false, missing };
}

// Human-readable recovery guidance for the ignored local source cache.
export function sourceCacheRecoveryMessage(missing) {
  return [
    'The raw Bible Hub pages needed by extraction-dependent checks are not present locally.',
    missing && missing.length ? `  missing pages: ${missing.length > 6 ? `${missing.slice(0, 6).join(', ')} … (${missing.length} total)` : missing.join(', ')}` : null,
    '  These raw pages are intentionally NOT committed (see build/sources/berean-hebrew/.gitignore).',
    '  Nothing is downloaded automatically. To enable these checks, fetch the pages once:',
    '    node build/tools/berean-hebrew-fetch.mjs',
    '  Then re-run this command. The generated fixture and runtime data ARE committed, so',
    '  the app preview and the importer --check work without the cache.',
  ].filter(Boolean).join('\n');
}

function variantMap(variants) {
  const map = new Map();
  for (const v of variants) map.set(`${v.bookId}:${v.chapter}:${v.verse}:${v.order}`, v);
  return map;
}

// Build the full fixture object (pure; no writes).
export function buildFixture({ manifestPath = MANIFEST, annotationsPath = ANNOTATIONS, variantsPath = VARIANTS, pageDir = SRC_DIR } = {}) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const annotations = loadAnnotations(annotationsPath);
  const { variants } = loadVariants(variantsPath);
  const variantByKey = variantMap(variants);

  const passages = [];
  const allAnomalies = [];

  for (const coverage of COVERAGE) {
    const bookPages = manifest.pages
      .filter((p) => p.bookId === coverage.bookId)
      .sort((a, b) => a.chapter - b.chapter);
    for (const page of bookPages) {
      const wantedVerses = coverage.versesByChapter ? coverage.versesByChapter[page.chapter] || null : null;
      if (coverage.versesByChapter && !wantedVerses) continue;
      if (!page.sha256) throw new Error(`manifest entry for ${page.passage} has no sha256; refusing to parse`);
      const pagePath = path.join(pageDir, page.file);
      if (!fs.existsSync(pagePath)) throw new Error(`cached page missing for ${page.passage}: ${page.file}`);
      const bytes = fs.readFileSync(pagePath);
      const actualHash = sha256(bytes);
      if (actualHash !== page.sha256) {
        throw new Error(`cached page sha256 mismatch for ${page.passage} (${page.file}): manifest ${page.sha256}, file ${actualHash}; refusing to parse`);
      }
      const { passage, anomalies } = assemblePassage({
        coverage, html: bytes.toString('utf8'), page, annotations, variantByKey, wantedVerses,
      });
      passages.push(passage);
      allAnomalies.push(...anomalies);
    }
  }

  const allRecords = passages.flatMap((p) => p.verseData).flatMap((v) => v.records);
  const totalRecords = allRecords.length;
  const totalVerses = passages.reduce((n, p) => n + p.verseData.length, 0);
  const missingGlosses = allRecords.filter((r) => r.glossStatus === 'missing').length;
  const untranslated = allRecords.filter((r) => r.glossStatus === 'untranslated').length;
  const noStrongs = allRecords.filter((r) => r.strongsList.length === 0).length;
  const noTranslit = allRecords.filter((r) => r.transliteration === null).length;
  const noMorph = allRecords.filter((r) => r.morphology === null).length;
  const { structural: structuralErrors, sourceGaps, info: infoAnomalies } = partitionAnomalies(allAnomalies);

  return {
    id: 'berean-hebrew',
    label: 'Berean Interlinear Bible (BIB) — Hebrew OT local preview',
    status: 'local evaluation data — not publication approval; retained Daniel/Malachi pilot verses + all Genesis',
    draft: true,
    parserVersion: PARSER_VERSION,
    extractor: 'build/tools/berean-hebrew-extract.mjs',
    source: {
      edition: 'Berean Interlinear Bible (BIB)',
      host: 'Bible Hub',
      editionEvidence: 'Every cached page carries the footer "Berean Interlinear Bible (BIB). Produced in cooperation with Bible Hub, Discovery Bible, unfoldingWord, Bible Aquifer, OpenBible.com, and the Berean Bible Translation Committee." See build/sources/berean-hebrew/README.md and source-manifest.json.',
      permission: 'Berean team email (on file in README.md) grants programmatic RETRIEVAL of the current draft from Bible Hub, because no downloadable file exists yet. Separately, berean.bible/terms.htm dedicates the Berean Bible texts to the public domain (April 30, 2023). Established and unresolved licence scope is documented in README.md.',
      draftNote: 'The interlinear is still in draft mode per the Berean team; the cached pages are a dated snapshot, not a fixed edition.',
      termsUrl: 'https://berean.bible/terms.htm',
      sourceManifest: 'build/sources/berean-hebrew/source-manifest.json',
    },
    coverage: 'Genesis 1\u201350; Exodus 1\u201340; Leviticus 1\u201327; Daniel 2:4\u20135; Malachi 4:5\u20136',
    totals: {
      books: [...new Set(passages.map((p) => p.bookId))].length,
      chapters: passages.length,
      verses: totalVerses,
      records: totalRecords,
      untranslatedGlosses: untranslated,
      missingGlosses,
      recordsWithoutStrongs: noStrongs,
      recordsWithoutTransliteration: noTranslit,
      recordsWithoutMorphology: noMorph,
      structuralErrors: structuralErrors.length,
      sourceGapDiagnostics: sourceGaps.length,
      infoDiagnostics: infoAnomalies.length,
    },
    anomalies: allAnomalies,
    uncertainVariants: loadVariants(variantsPath).uncertain,
    passages,
  };
}

// Write the fixture ONLY when the extraction is structurally clean. Returns
// { written, structuralErrors } and never touches the accepted output on error.
export function writeFixtureIfClean(fixture, fixturePath = FIXTURE) {
  const { structural: structuralErrors } = partitionAnomalies(fixture.anomalies || []);
  if (structuralErrors.length) return { written: false, structuralErrors };
  const tmp = `${fixturePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(fixture, null, 2) + '\n');
  try {
    fs.renameSync(tmp, fixturePath);
  } catch (e) {
    // Never leave a partial temp file behind if the rename is blocked.
    try { fs.unlinkSync(tmp); } catch { /* best effort */ }
    throw e;
  }
  return { written: true, structuralErrors: [] };
}

function parseArgs(argv) {
  const [mode, bookId, chapter, verse] = argv;
  return { mode, bookId, chapter: Number(chapter), verse: Number(verse) };
}

function main() {
  const { mode, bookId, chapter, verse } = parseArgs(process.argv.slice(2));
  if (mode === 'build') {
    let fixture;
    try {
      fixture = buildFixture();
    } catch (error) {
      console.error(`Refusing to regenerate ${path.relative(ROOT, FIXTURE)}: ${error.message}`);
      if (/page missing|no cached page|sha256 mismatch/i.test(error.message)) {
        console.error('  Raw pages are not committed. Fetch them once with: node build/tools/berean-hebrew-fetch.mjs');
      }
      process.exit(1);
    }
    const { structural } = partitionAnomalies(fixture.anomalies);
    if (structural.length) {
      console.error(`Refusing to overwrite ${path.relative(ROOT, FIXTURE)}: ${structural.length} structural extraction error(s).`);
      for (const a of structural.slice(0, 20)) console.error(`  ${a.kind}  ${a.book} ${a.chapter}${a.verse ? ':' + a.verse : ''}`);
      process.exit(1);
    }
    const { written } = writeFixtureIfClean(fixture);
    if (!written) { console.error('Refusing to write fixture: structural errors present.'); process.exit(1); }
    const t = fixture.totals;
    console.log(`Wrote ${path.relative(ROOT, FIXTURE)}`);
    console.log(`  books ${t.books}, chapters ${t.chapters}, verses ${t.verses}, records ${t.records}`);
    console.log(`  untranslated ${t.untranslatedGlosses}, missing-gloss ${t.missingGlosses}, no-Strong's ${t.recordsWithoutStrongs}, no-translit ${t.recordsWithoutTransliteration}, no-morph ${t.recordsWithoutMorphology}`);
    console.log(`  structural ${t.structuralErrors}, source-gap ${t.sourceGapDiagnostics}, info ${t.infoDiagnostics}`);
    return;
  }
  if (mode === 'dump') {
    const fixture = buildFixture();
    const p = fixture.passages.find((x) => x.bookId === bookId && x.chapter === chapter);
    if (!p) throw new Error(`no passage ${bookId} ${chapter}`);
    const v = p.verseData.find((x) => x.verse === verse);
    console.log(JSON.stringify(v, null, 2));
    return;
  }
  console.error('usage: node berean-hebrew-extract.mjs build | dump <BOOKID> <chapter> <verse>');
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
