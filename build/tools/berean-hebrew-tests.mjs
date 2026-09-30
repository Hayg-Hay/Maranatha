// berean-hebrew-tests.mjs
//
// Offline tests for the Berean Hebrew pilot tooling. No network is used: the
// fetch tests inject simulated responses, and the parser tests use synthetic
// HTML. The final test re-runs the real extractor against the local cache.
//
//   node build/tools/berean-hebrew-tests.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { runFetch, validateDownloadedPage } from './berean-hebrew-fetch.mjs';
import { parsePage, assemblePassage, buildFixture, partitionAnomalies, writeFixtureIfClean, FIXTURE, recordFingerprint, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';
import { classifyVariant, sourceVerseFor } from './berean-hebrew-variants.mjs';

const results = [];
const skipped = [];
// Tests that replay the real pages need the ignored local source cache. When it
// is absent they are skipped with guidance; nothing is downloaded here.
const cacheStatus = missingSourcePages();
const hasSourceCache = !cacheStatus.manifestMissing && cacheStatus.missing.length === 0;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'not equal'}: expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const assert = (c, msg) => { if (!c) throw new Error(msg || 'assertion failed'); };
async function test(name, fn) {
  try { await fn(); results.push([name, true]); }
  catch (e) { results.push([name, false, e.message]); }
}

// ---------------------------------------------------------------------------
// Fetch recovery tests (simulated responses, no network)
// ---------------------------------------------------------------------------
const minimalPage = (label) =>
  '<!DOCTYPE html><html><head><title>Test 1 Interlinear Bible</title></head><body>' +
  '<div id="breadcrumbs">Bible &gt; BSB &gt; Test 1</div>' +
  '<table class="tablefloatheb"><tbody><tr><td>' +
  '<span class="hebrew">\u05d0</span><span class="translit"><a href="/hebrew/x.htm">x</a></span><span class="eng">' + label + '</span>' +
  '</td></tr></tbody></table>' +
  '<div>Berean Interlinear Bible (BIB). Produced in cooperation with Bible Hub.</div></body></html>';

const TEST_PAGES = [
  { passage: 'T1 1', book: 'Test', chapter: 1, url: 'https://example.test/1.htm', file: 't1.html' },
  { passage: 'T2 1', book: 'Test', chapter: 1, url: 'https://example.test/2.htm', file: 't2.html' },
  { passage: 'T3 1', book: 'Test', chapter: 1, url: 'https://example.test/3.htm', file: 't3.html' },
];
const [P1, P2, P3] = TEST_PAGES;

function makeWorkspace(initial) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bh-hebrew-fetch-'));
  const pageDir = path.join(dir, 'source-pages');
  fs.mkdirSync(pageDir, { recursive: true });
  const manifestPath = path.join(dir, 'source-manifest.json');
  const pages = [];
  for (const item of initial) {
    fs.writeFileSync(path.join(pageDir, item.page.file), item.body);
    pages.push({
      passage: item.page.passage, book: item.page.book, chapter: item.page.chapter, url: item.page.url,
      file: `source-pages/${item.page.file}`, retrievedAt: item.retrievedAt,
      httpStatus: 200, byteLength: Buffer.byteLength(item.body, 'utf8'),
      sha256: sha256(Buffer.from(item.body, 'utf8')),
      title: null, breadcrumb: null, editionFooter: 'Berean Interlinear Bible (BIB)',
    });
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ pages }, null, 2) + '\n');
  return { pageDir, manifestPath };
}
const readManifest = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const entryFor = (m, url) => m.pages.find((e) => e.url === url);
const fileBody = (pageDir, page) => fs.readFileSync(path.join(pageDir, page.file), 'utf8');
const quiet = { log: () => {}, logError: () => {} };

await test('fetch: a failed refresh preserves later pages, files and original metadata', async () => {
  const A = minimalPage('A-old'), B = minimalPage('B-old'), C = minimalPage('C-old'), A2 = minimalPage('A-new');
  const ws = makeWorkspace([
    { page: P1, body: A, retrievedAt: '2020-01-01T00:00:00.000Z' },
    { page: P2, body: B, retrievedAt: '2020-01-02T00:00:00.000Z' },
    { page: P3, body: C, retrievedAt: '2020-01-03T00:00:00.000Z' },
  ]);
  const calls = [];
  const report = await runFetch({
    pages: TEST_PAGES, pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: true, delayMs: 0, sleepImpl: async () => {}, now: () => new Date('2026-09-30T00:00:00.000Z'), ...quiet,
    requestImpl: async (url) => {
      calls.push(url);
      if (url === P1.url) return { statusCode: 200, body: A2 };
      throw new Error('simulated network failure');
    },
  });
  eq(calls, [P1.url, P2.url], 'only the first two requests were attempted');
  assert(report.failed && report.failed.url === P2.url, 'second request is reported failed');
  eq(fileBody(ws.pageDir, P1), A2, 'page1 file replaced with the new bytes');
  eq(fileBody(ws.pageDir, P2), B, 'page2 file untouched');
  eq(fileBody(ws.pageDir, P3), C, 'page3 file untouched');
  const m = readManifest(ws.manifestPath);
  eq(m.pages.length, 3, 'all three manifest entries preserved');
  eq(entryFor(m, P1.url).sha256, sha256(Buffer.from(A2)), 'page1 hash updated');
  eq(entryFor(m, P1.url).retrievedAt, '2026-09-30T00:00:00.000Z', 'page1 retrieval date updated');
  eq(entryFor(m, P2.url).sha256, sha256(Buffer.from(B)), 'page2 hash preserved');
  eq(entryFor(m, P2.url).retrievedAt, '2020-01-02T00:00:00.000Z', 'page2 retrieval date preserved');
  eq(entryFor(m, P3.url).retrievedAt, '2020-01-03T00:00:00.000Z', 'page3 retrieval date preserved');
});

await test('fetch: reuse makes no request and preserves original retrieval dates', async () => {
  const A = minimalPage('A'), B = minimalPage('B');
  const ws = makeWorkspace([
    { page: P1, body: A, retrievedAt: '2019-05-05T00:00:00.000Z' },
    { page: P2, body: B, retrievedAt: '2019-06-06T00:00:00.000Z' },
  ]);
  let calls = 0;
  const report = await runFetch({
    pages: [P1, P2], pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: false, delayMs: 0, sleepImpl: async () => {}, ...quiet,
    requestImpl: async () => { calls++; throw new Error('network must not be used'); },
  });
  eq(calls, 0, 'no network requests');
  eq(report.reused, [P1.passage, P2.passage], 'both pages reused');
  const m = readManifest(ws.manifestPath);
  eq(entryFor(m, P1.url).retrievedAt, '2019-05-05T00:00:00.000Z', 'page1 original date kept');
  eq(entryFor(m, P2.url).retrievedAt, '2019-06-06T00:00:00.000Z', 'page2 original date kept');
});

await test('fetch: a blocked/invalid response never replaces a valid cached page', async () => {
  const A = minimalPage('A');
  const ws = makeWorkspace([{ page: P1, body: A, retrievedAt: '2021-01-01T00:00:00.000Z' }]);
  const report = await runFetch({
    pages: [P1], pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: true, delayMs: 0, sleepImpl: async () => {}, now: () => new Date('2026-09-30T00:00:00.000Z'), ...quiet,
    requestImpl: async () => ({ statusCode: 403, body: '<html>Forbidden</html>' }),
  });
  assert(report.blocked, 'block reported');
  eq(fileBody(ws.pageDir, P1), A, 'cached file untouched');
  const m = readManifest(ws.manifestPath);
  eq(entryFor(m, P1.url).sha256, sha256(Buffer.from(A)), 'hash unchanged');
  eq(entryFor(m, P1.url).retrievedAt, '2021-01-01T00:00:00.000Z', 'retrieval date unchanged');
});

await test('fetch: a 200 page without the interlinear structure is rejected', async () => {
  const A = minimalPage('A');
  const ws = makeWorkspace([{ page: P1, body: A, retrievedAt: '2021-01-01T00:00:00.000Z' }]);
  const report = await runFetch({
    pages: [P1], pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: true, delayMs: 0, sleepImpl: async () => {}, ...quiet,
    requestImpl: async () => ({ statusCode: 200, body: '<html><body>maintenance</body></html>' }),
  });
  assert(report.failed && !report.blocked, 'reported as failure, not block');
  eq(fileBody(ws.pageDir, P1), A, 'cached file untouched');
});

await test('fetch: rerun resumes and completes previously failed pages', async () => {
  const A = minimalPage('A'), B = minimalPage('B'), C = minimalPage('C');
  const ws = makeWorkspace([]);
  let clock = '2026-01-01T00:00:00.000Z';
  const first = await runFetch({
    pages: TEST_PAGES, pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: false, delayMs: 0, sleepImpl: async () => {}, now: () => new Date(clock), ...quiet,
    requestImpl: async (url) => {
      if (url === P1.url) return { statusCode: 200, body: A };
      throw new Error('simulated failure');
    },
  });
  eq(first.fetched, [P1.passage], 'first run fetched only page1');
  assert(first.failed && first.failed.url === P2.url, 'first run failed on page2');

  clock = '2026-02-02T00:00:00.000Z';
  const calls = [];
  const second = await runFetch({
    pages: TEST_PAGES, pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: false, delayMs: 0, sleepImpl: async () => {}, now: () => new Date(clock), ...quiet,
    requestImpl: async (url) => {
      calls.push(url);
      return { statusCode: 200, body: url === P2.url ? B : C };
    },
  });
  eq(calls, [P2.url, P3.url], 'rerun requested only the missing pages');
  eq(second.reused, [P1.passage], 'rerun reused page1');
  eq(second.fetched, [P2.passage, P3.passage], 'rerun fetched pages 2 and 3');
  const m = readManifest(ws.manifestPath);
  eq(m.pages.length, 3, 'all three entries present');
  eq(entryFor(m, P1.url).retrievedAt, '2026-01-01T00:00:00.000Z', 'page1 date from the first run kept');
  eq(entryFor(m, P2.url).retrievedAt, '2026-02-02T00:00:00.000Z', 'page2 date from the resumed run');
});

await test('fetch: corrupted cache is detected, not silently re-trusted', async () => {
  const A = minimalPage('A'), B = minimalPage('B');
  const ws = makeWorkspace([
    { page: P1, body: A, retrievedAt: '2020-01-01T00:00:00.000Z' },
    { page: P2, body: B, retrievedAt: '2020-01-02T00:00:00.000Z' },
  ]);
  fs.writeFileSync(path.join(ws.pageDir, P2.file), 'TAMPERED BYTES');
  let calls = 0;
  const report = await runFetch({
    pages: [P1, P2], pageDir: ws.pageDir, manifestPath: ws.manifestPath,
    refresh: false, delayMs: 0, sleepImpl: async () => {}, ...quiet,
    requestImpl: async () => { calls++; throw new Error('network must not be used'); },
  });
  eq(calls, 0, 'no network used');
  eq(report.corrupt.length, 1, 'one corruption reported');
  eq(report.corrupt[0].url, P2.url, 'page2 flagged');
  const m = readManifest(ws.manifestPath);
  eq(entryFor(m, P2.url).sha256, sha256(Buffer.from(B)), 'manifest keeps the original trusted hash');
  eq(fileBody(ws.pageDir, P2), 'TAMPERED BYTES', 'tampered bytes left untouched');
  assert(report.reused.includes(P1.passage), 'valid page still reused');
});

await test('fetch: validateDownloadedPage accepts only real interlinear pages', () => {
  assert(validateDownloadedPage(minimalPage('x'), { statusCode: 200 }) === null, 'minimal real page accepted');
  assert(validateDownloadedPage('<html>nope</html>', { statusCode: 200 }) !== null, 'structureless page rejected');
  assert(validateDownloadedPage(minimalPage('x'), { statusCode: 403 }) !== null, 'HTTP 403 rejected');
});

await test('fetch: validateDownloadedPage verifies the chapter identity', () => {
  // minimalPage's title is "Test 1 Interlinear Bible".
  assert(validateDownloadedPage(minimalPage('x'), { statusCode: 200, book: 'Test', chapter: 1 }) === null, 'matching chapter accepted');
  assert(validateDownloadedPage(minimalPage('x'), { statusCode: 200, book: 'Test', chapter: 2 }) !== null, 'wrong chapter rejected');
});

// ---------------------------------------------------------------------------
// Parser / extraction edge-case tests (synthetic HTML)
// ---------------------------------------------------------------------------
function wordBlock({ hebrew = '\u05d0', hebrewSpans, translit = 'x', eng = 'gloss', strongs = [], morph = 'N-ms', ref = null } = {}) {
  const parts = [];
  for (const n of strongs) parts.push(`<span class="strongsnt"><a href="/hebrew/${n}.htm" title="Strong's Hebrew ${n}: x">${n}</a></span>`);
  if (ref != null) parts.push(`<span class="reftop">&nbsp;${ref}</span>`);
  if (translit !== undefined && translit !== null) parts.push(`<span class="translit"><a href="/hebrew/x.htm" title="x">${translit}</a></span>`);
  if (hebrewSpans) for (const h of hebrewSpans) parts.push(`<span class="hebrew">${h}</span>`);
  else if (hebrew !== undefined && hebrew !== null) parts.push(`<span class="hebrew">${hebrew}</span>`);
  if (eng !== undefined && eng !== null) parts.push(`<span class="eng">${eng}</span>`);
  if (morph !== undefined && morph !== null) parts.push(`<a href="/hebrewparse.htm" title="${morph}">${morph}</a>`);
  return `<table class="tablefloatheb"><tbody><tr><td>${parts.join('')}</td></tr></tbody></table>`;
}
const parse1 = (block) => parsePage(block, { book: 'Test', chapter: 1 });

await test('parse: multiple Strong\'s numbers are all preserved in order', () => {
  const { verses, anomalies } = parse1(wordBlock({ strongs: ['1111', '2222'], ref: 1 }));
  const rec = verses[1][0];
  eq(rec.strongsList, ['1111', '2222'], 'complete ordered list kept');
  eq(rec.strongs, null, 'singular field is null so it cannot hide the extras');
  const { info, structural } = partitionAnomalies(anomalies);
  assert(info.some((a) => a.kind === 'multi-strongs'), 'multi-strongs reported as info');
  eq(structural.length, 0, 'multi-strongs is not structural');
});

await test('parse: multiple Hebrew spans are rejected, never silently chosen', () => {
  const { verses, anomalies } = parse1(wordBlock({ hebrewSpans: ['\u05d0', '\u05d1'], strongs: ['1111'], ref: 1 }));
  eq(verses[1][0].surface, null, 'no surface silently selected');
  const { structural } = partitionAnomalies(anomalies);
  assert(structural.some((a) => a.kind === 'multi-hebrew-span'), 'multi-hebrew-span flagged structural');
});

await test('parse: a missing Hebrew span is a structural error', () => {
  const { anomalies } = parse1(wordBlock({ hebrew: null, strongs: ['1111'], ref: 1 }));
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'no-surface'), 'no-surface flagged structural');
});

await test('parse: absent transliteration/morphology spans are structural', () => {
  const { verses, anomalies } = parse1(wordBlock({ translit: null, morph: null, strongs: ['1111'], ref: 1 }));
  eq(verses[1][0].transliteration, null, 'transliteration null');
  eq(verses[1][0].morphology, null, 'morphology null');
  const { structural } = partitionAnomalies(anomalies);
  assert(structural.some((a) => a.kind === 'no-transliteration-span'), 'no-transliteration-span flagged');
  assert(structural.some((a) => a.kind === 'no-morphology-span'), 'no-morphology-span flagged');
});

await test('parse: empty transliteration/morphology spans are source gaps, not structural', () => {
  // Matches Bible Hub's compound-name records (e.g. Gen 50:11 "Abel-", Gen 14:17
  // "laomer") where the span exists but carries no text.
  const { verses, anomalies } = parse1(wordBlock({ translit: '', morph: '', strongs: ['1111'], ref: 1 }));
  eq(verses[1][0].transliteration, null, 'empty translit -> null');
  eq(verses[1][0].morphology, null, 'empty morph -> null');
  const { structural, sourceGaps } = partitionAnomalies(anomalies);
  assert(structural.length === 0, `expected no structural errors, got ${JSON.stringify(structural)}`);
  assert(sourceGaps.some((a) => a.kind === 'missing-transliteration'), 'empty translit is a source gap');
  assert(sourceGaps.some((a) => a.kind === 'missing-morphology'), 'empty morph is a source gap');
});

await test('parse: a malformed verse reference is structural', () => {
  const { anomalies } = parse1(wordBlock({ strongs: ['1111'], ref: 'abc' }));
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'malformed-verse-reference'), 'malformed ref flagged');
});

await test('parse: an unrecognised token block is unsupported', () => {
  const { anomalies } = parse1('<table class="tablefloatheb"><tbody><tr><td>layout only</td></tr></tbody></table>');
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'unsupported-token-structure'), 'unsupported structure flagged');
});

await test('parse: an empty gloss span is a diagnosed source gap (explicit null)', () => {
  const { verses, anomalies } = parse1(wordBlock({ eng: '', strongs: ['1111'], ref: 1 }));
  eq(verses[1][0].gloss, null, 'gloss is explicit null');
  const { sourceGaps, structural } = partitionAnomalies(anomalies);
  assert(sourceGaps.some((a) => a.kind === 'missing-gloss'), 'missing-gloss reported as source gap');
  eq(structural.length, 0, 'not treated as structural');
});

await test('parse: an absent gloss span is structural', () => {
  const { anomalies } = parse1(wordBlock({ eng: null, strongs: ['1111'], ref: 1 }));
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'no-gloss-span'), 'no-gloss-span flagged');
});

await test('parse: an absent Strong\'s number is a source gap, not invented', () => {
  const { verses, anomalies } = parse1(wordBlock({ strongs: [], ref: 1 }));
  eq(verses[1][0].strongsList, [], 'empty list');
  eq(verses[1][0].strongs, null, 'null singular');
  assert(partitionAnomalies(anomalies).sourceGaps.some((a) => a.kind === 'missing-strongs'), 'missing-strongs reported');
});

await test('assemble: gloss status distinguishes missing, untranslated and translated', () => {
  const coverage = { bookId: 'T', book: 'Test' };
  const page = { file: 't.html', url: 'u', chapter: 1, sha256: '0'.repeat(64), retrievedAt: 'x', httpStatus: 200, editionFooter: 'Berean Interlinear Bible (BIB)' };
  const mk = (eng) => assemblePassage({ coverage, html: wordBlock({ eng, strongs: ['1111'], ref: 1 }), page, annotations: { languageRules: [] }, variantByKey: new Map() })
    .passage.verseData[0].records[0].glossStatus;
  eq(mk(''), 'missing', 'empty -> missing');
  eq(mk('-'), 'untranslated', 'dash -> untranslated');
  eq(mk('word'), 'translated', 'text -> translated');
});

await test('assemble: a matching variant fingerprint attaches the annotation', () => {
  const coverage = { bookId: 'T', book: 'Test' };
  const page = { file: 't.html', url: 'u', chapter: 1, sha256: '0'.repeat(64), retrievedAt: 'x', httpStatus: 200, editionFooter: 'Berean Interlinear Bible (BIB)' };
  const html = wordBlock({ strongs: ['1111'], ref: 1 });
  const rawRec = parse1(html).verses[1][0];
  const good = new Map([['T:1:1:0', {
    type: 'ketiv-qere', sourceDisplays: 'ketiv', sourceMarksVariant: false,
    oshbKetiv: 'א', oshbQere: 'ב', sourceFingerprint: recordFingerprint(rawRec),
  }]]);
  const { passage, anomalies } = assemblePassage({ coverage, html, page, annotations: { languageRules: [] }, variantByKey: good });
  assert(passage.verseData[0].records[0].variant, 'variant attached');
  eq(partitionAnomalies(anomalies).structural.length, 0, 'no structural error');
});

await test('assemble: a stale variant fingerprint is rejected as structural', () => {
  const coverage = { bookId: 'T', book: 'Test' };
  const page = { file: 't.html', url: 'u', chapter: 1, sha256: '0'.repeat(64), retrievedAt: 'x', httpStatus: 200, editionFooter: 'Berean Interlinear Bible (BIB)' };
  const html = wordBlock({ strongs: ['1111'], ref: 1 });
  const stale = new Map([['T:1:1:0', {
    type: 'ketiv-qere', sourceDisplays: 'ketiv', sourceMarksVariant: false,
    oshbKetiv: 'א', oshbQere: 'ב', sourceFingerprint: 'deadbeef'.repeat(8),
  }]]);
  const { passage, anomalies } = assemblePassage({ coverage, html, page, annotations: { languageRules: [] }, variantByKey: stale });
  assert(!passage.verseData[0].records[0].variant, 'stale variant not attached');
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'stale-variant-fingerprint'), 'stale fingerprint flagged structural');
});

// ---------------------------------------------------------------------------
// Ketiv/Qere matcher tests (pure; no cache needed)
// ---------------------------------------------------------------------------
const kqRec = (order, surface, strongsList = []) => ({ order, surface, transliteration: 't', gloss: 'g', morphology: 'm', strongsList });
const kqPair = ({ ketiv, qere, kL = null, qL = null, before = '' }) => ({ oshbKetiv: ketiv, oshbQere: qere, ketivLemma: kL, qereLemma: qL, beforeSkeleton: before });

await test('variant: preceding-word context resolves two candidate occurrences', () => {
  // GEN 27:29: the Ketiv spelling occurs first (after "peoples"); the Qere
  // spelling occurs later (after "your brothers").
  const pair = kqPair({ ketiv: 'וישתחו', qere: 'וישתחוו', kL: 'c/7812', qL: 'c/7812', before: 'עמים' });
  const recs = [kqRec(0, 'עמים'), kqRec(1, 'וישתחו', ['7812']), kqRec(2, 'לאחיך'), kqRec(3, 'וישתחוו', ['7812'])];
  const r = classifyVariant(pair, recs);
  eq(r.display, 'ketiv', 'chose the Ketiv occurrence');
  eq(r.displayBy, 'context', 'chosen by context, not position');
  eq(r.record.order, 1, 'selected the first occurrence');
});

await test('variant: a Strong\'s mismatch does not change a verified letter match', () => {
  // GEN 30:11: displayed Ketiv letters, but the source tags the read form's Strong's.
  const pair = kqPair({ ketiv: 'בגד', qere: 'בא', kL: 'b/1409', qL: '935', before: 'לאה' });
  const recs = [kqRec(0, 'לאה'), kqRec(1, 'בגד', ['935'])];
  const r = classifyVariant(pair, recs);
  eq(r.display, 'ketiv', 'displayed letters are the Ketiv');
  eq(r.strongsEvidence, 'other-reading', 'Strong\'s follows the other reading');
  assert(!r.uncertain, 'still resolved');

  // GEN 27:3: source tags a dictionary variant (neither lemma) — letters win.
  const pair2 = kqPair({ ketiv: 'צידה', qere: 'ציד', kL: '6720', qL: '6720', before: 'לי' });
  const r2 = classifyVariant(pair2, [kqRec(0, 'לי'), kqRec(1, 'צידה', ['6718'])]);
  eq(r2.display, 'ketiv', 'letters verified');
  eq(r2.strongsEvidence, 'none', 'dictionary-variant Strong\'s recorded as none');
});

await test('variant: identical consonant skeletons remain ambiguous', () => {
  const pair = kqPair({ ketiv: 'אב', qere: 'אב', kL: '1', qL: '2', before: 'x' });
  const r = classifyVariant(pair, [kqRec(0, 'x'), kqRec(1, 'אב', ['1'])]);
  assert(r.uncertain, 'same skeleton cannot pick a reading');
});

await test('variant: ambiguous repeated words remain unresolved', () => {
  // Two records share the Ketiv skeleton AND the same preceding word.
  const pair = kqPair({ ketiv: 'וישתחו', qere: 'וישתחוו', kL: '7812', qL: '7812', before: 'א' });
  const recs = [kqRec(0, 'א'), kqRec(1, 'וישתחו', ['7812']), kqRec(2, 'א'), kqRec(3, 'וישתחו', ['7812'])];
  const r = classifyVariant(pair, recs);
  assert(r.uncertain && /ambiguous/.test(r.uncertain), `expected ambiguity, got ${JSON.stringify(r)}`);
});

await test('variant: OSHB-to-English verse mapping from the KJV note', () => {
  eq(sourceVerseFor('<note>KJV:Exod.22.5</note>', 22, 4), { chapter: 22, verse: 5 }, 'mapped OSHB 22:4 -> English 22:5');
  eq(sourceVerseFor('<verse>no mapping</verse>', 16, 2), { chapter: 16, verse: 2 }, 'unmapped verse unchanged');
});

if (hasSourceCache) {
  await test('extract: the build refuses to overwrite accepted output on structural errors', () => {
    const fixture = buildFixture();
    const tmp = path.join(os.tmpdir(), `bh-fixture-${process.pid}-${Date.now()}.json`);
    fs.writeFileSync(tmp, 'SENTINEL');
    const bad = { ...fixture, anomalies: [...fixture.anomalies, { class: 'structural', kind: 'multi-hebrew-span', book: 'X', chapter: 1, verse: 1 }] };
    const refused = writeFixtureIfClean(bad, tmp);
    eq(refused.written, false, 'write refused');
    assert(refused.structuralErrors.length === 1, 'structural error reported');
    eq(fs.readFileSync(tmp, 'utf8'), 'SENTINEL', 'accepted output untouched');
    const ok = writeFixtureIfClean(fixture, tmp);
    eq(ok.written, true, 'clean fixture written');
    assert(fs.readFileSync(tmp, 'utf8').length > 100, 'fixture content written');
    fs.unlinkSync(tmp);
  });
} else {
  skipped.push('extract: the build refuses to overwrite accepted output on structural errors');
}

await test('extract: buildFixture stops on a page SHA-256 that does not match the manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bh-hash-'));
  fs.mkdirSync(path.join(dir, 'source-pages'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'source-pages', 'genesis-1.html'), '<html><table class="tablefloatheb">x</table></html>');
  const manifestPath = path.join(dir, 'source-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ pages: [
    { passage: 'GEN 1', book: 'Genesis', bookId: 'GEN', chapter: 1, url: 'u', file: 'source-pages/genesis-1.html', sha256: '0'.repeat(64), retrievedAt: 'x' },
  ] }));
  let threw = '';
  try { buildFixture({ manifestPath, pageDir: dir }); } catch (e) { threw = e.message; }
  assert(/sha256 mismatch/.test(threw), `expected a mismatch error, got: ${threw}`);
});

await test('extract: buildFixture stops when a hashed page file is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bh-missing-'));
  fs.mkdirSync(path.join(dir, 'source-pages'), { recursive: true });
  const manifestPath = path.join(dir, 'source-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ pages: [
    { passage: 'GEN 1', book: 'Genesis', bookId: 'GEN', chapter: 1, url: 'u', file: 'source-pages/genesis-1.html', sha256: sha256(Buffer.from('x')), retrievedAt: 'x' },
  ] }));
  let threw = '';
  try { buildFixture({ manifestPath, pageDir: dir }); } catch (e) { threw = e.message; }
  assert(/cached page missing/.test(threw), `expected a missing-page error, got: ${threw}`);
});

await test('parse: a page with no recognised word tables is a structural error', () => {
  const { anomalies } = parse1('<html><body>no word tables here</body></html>');
  assert(partitionAnomalies(anomalies).structural.some((a) => a.kind === 'no-word-tables'), 'no-word-tables flagged');
});

if (hasSourceCache) {
  await test('extract: the accepted fixture reproduces exactly from the local cache', () => {
    eq(buildFixture(), JSON.parse(fs.readFileSync(FIXTURE, 'utf8')), 'fixture drift from cache');
  });
} else {
  skipped.push('extract: the accepted fixture reproduces exactly from the local cache');
}

// ---------------------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name} (${detail})`); }
}
for (const name of skipped) console.log(`SKIP  ${name} (requires the ignored local source cache)`);
if (skipped.length) {
  console.log('\n' + sourceCacheRecoveryMessage(cacheStatus.missing));
}
if (failed) { console.error(`\n${failed}/${results.length} test(s) failed.`); process.exit(1); }
console.log(`\nAll ${results.length} tests passed${skipped.length ? `; ${skipped.length} skipped` : ''}.`);
