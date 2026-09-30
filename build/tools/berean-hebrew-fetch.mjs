// berean-hebrew-fetch.mjs
//
// Cached, rate-limited downloader for the Berean Interlinear Bible (BIB) Hebrew
// Old Testament pages hosted on Bible Hub. This is the *only* tool in the
// Hebrew pilot that touches the network; every other script reads the local
// cache.
//
// SAFETY
//   - Every manifest entry is preserved across runs. An entry is updated only
//     after its page is downloaded AND passes validation (interlinear structure,
//     BIB footer, and matching chapter identity); a failed or blocked request
//     never replaces a valid cached page or its metadata.
//   - Page files and the manifest are each written through a temp file + rename,
//     so neither is ever left partially written. These are INDIVIDUALLY atomic,
//     not one transaction: an interruption between the page rename and the
//     manifest rename can leave a page whose bytes no longer match the recorded
//     hash. That is detected on the next run as a hash mismatch (CORRUPT) and
//     requires an explicit --refresh to re-establish trust — never a silent
//     re-trust.
//   - Reusing a cached page keeps its original retrieval date and full entry.
//   - A cached page whose bytes no longer match its manifest hash is reported
//     as CORRUPT and left untouched.
//   - Rate limiting (REQUEST_DELAY_MS between live requests) and abort-on-block
//     are enforced; the run is resumable because every success is persisted.
//
// USAGE
//   node build/tools/berean-hebrew-fetch.mjs                  # fetch missing pages
//   node build/tools/berean-hebrew-fetch.mjs --refresh        # re-fetch every page
//   node build/tools/berean-hebrew-fetch.mjs --list           # print URLs, no network
//   node build/tools/berean-hebrew-fetch.mjs --only GEN       # restrict to a book
//   node build/tools/berean-hebrew-fetch.mjs --only GEN --chapters 2,8,22   # subset

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
export const OUT_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
export const PAGE_DIR = path.join(OUT_DIR, 'source-pages');
export const MANIFEST = path.join(OUT_DIR, 'source-manifest.json');

const USER_AGENT =
  'Maranatha-BereanHebrewPilot/0.1 (+offline Bible browser research; contact via repo)';
export const REQUEST_DELAY_MS = 3000;

// The covered passages. Genesis is imported in full (50 chapters); Daniel and
// Malachi keep only the accepted pilot chapters.
export const COVERED_BOOKS = [
  { bookId: 'GEN', book: 'Genesis', slug: 'genesis', chapters: 50 },
  { bookId: 'DAN', book: 'Daniel', slug: 'daniel', chapters: [2] },
  { bookId: 'MAL', book: 'Malachi', slug: 'malachi', chapters: [4] },
];

function chapterList(spec) {
  return Array.isArray(spec) ? spec.slice() : Array.from({ length: spec }, (_, i) => i + 1);
}

export function pageFor(book, chapter) {
  return {
    passage: `${book.bookId} ${chapter}`,
    book: book.book,
    bookId: book.bookId,
    chapter,
    slug: book.slug,
    url: `https://biblehub.com/interlinear/${book.slug}/${chapter}.htm`,
    file: `${book.slug}-${chapter}.html`,
  };
}

// Build the page list, optionally restricted to one book and/or a chapter set.
export function coveredPages({ only = null, chapters = null } = {}) {
  const books = only
    ? COVERED_BOOKS.filter((b) => b.bookId === only || b.slug === only || b.book === only)
    : COVERED_BOOKS;
  const out = [];
  for (const book of books) {
    for (const c of chapterList(book.chapters)) {
      if (chapters && !chapters.includes(c)) continue;
      out.push(pageFor(book, c));
    }
  }
  return out;
}

export const COVERED_PAGES = coveredPages();

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Atomic write: write to a sibling temp file, then rename over the target. On
// Windows libuv's rename replaces the destination, so there is no window where
// the target is missing or partially written.
function atomicWrite(file, data) {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  fs.writeFileSync(tmp, data);
  try {
    fs.renameSync(tmp, file);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch { /* best effort */ }
    throw e;
  }
}

export function request(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html', 'Accept-Encoding': 'identity' }, timeout: 45000 },
      (res) => {
        const { statusCode, headers } = res;
        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location && redirectsLeft > 0) {
          res.resume();
          const next = new URL(headers.location, url).href;
          resolve(request(next, redirectsLeft - 1));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ statusCode, headers, body: Buffer.concat(chunks).toString('utf8'), finalUrl: url }));
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

// A block is an explicit HTTP signal OR wording the provider uses when it
// gates automated access. On a block we stop; we never retry through it.
export function detectBlock(status, body) {
  if ([401, 403, 429, 503].includes(status)) return `HTTP ${status}`;
  const text = String(body || '').slice(0, 200000).toLowerCase();
  for (const needle of ['captcha', 'unusual traffic', 'access denied', 'attention required', 'cf-error', 'too many requests', 'rate limit']) {
    if (text.includes(needle)) return `body contains "${needle}"`;
  }
  return null;
}

// A download is accepted only if it is a 200 page that carries the Berean
// interlinear structure and footer AND (when expected) identifies the requested
// book/chapter. Anything else is rejected, so a failure page can never
// overwrite a valid cached page.
export function validateDownloadedPage(body, { statusCode, book, chapter } = {}) {
  const block = detectBlock(statusCode, body);
  if (block) return `access blocked (${block})`;
  if (statusCode !== 200) return `HTTP ${statusCode}`;
  if (!/<table class="tablefloatheb">/.test(body)) return 'page does not contain an interlinear word table';
  if (!/Berean Interlinear Bible \(BIB\)/.test(body)) return 'page does not carry the Berean Interlinear Bible (BIB) footer';
  if (book && chapter) {
    const title = /<title>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim() || '';
    const expected = `${book} ${chapter} Interlinear Bible`;
    if (title !== expected) return `page title "${title}" does not identify "${expected}"`;
  }
  return null;
}

export function extractEditionEvidence(html) {
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() || null;
  const breadcrumb = /<div id="breadcrumbs">([\s\S]*?)<\/div>/i.exec(html)?.[1]
    ?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null;
  const footer = /Berean Interlinear Bible \(BIB\)[^<]*/.exec(html)?.[0]?.trim() || null;
  return { title, breadcrumb, editionFooter: footer };
}

// Read the manifest, failing loudly (never silently discarding) on corruption.
export function loadManifest(manifestPath = MANIFEST) {
  if (!fs.existsSync(manifestPath)) return { pages: [] };
  const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(parsed.pages)) throw new Error(`${manifestPath}: "pages" is not an array`);
  return parsed;
}

// Core routine. Dependencies are injectable so the offline test can simulate
// responses without any network.
export async function runFetch({
  pages = COVERED_PAGES,
  pageDir = PAGE_DIR,
  manifestPath = MANIFEST,
  requestImpl = request,
  now = () => new Date(),
  refresh = false,
  delayMs = REQUEST_DELAY_MS,
  sleepImpl = sleep,
  log = console.log,
  logError = console.error,
} = {}) {
  fs.mkdirSync(pageDir, { recursive: true });
  const prior = loadManifest(manifestPath);
  const entries = prior.pages.map((p) => ({ ...p }));
  const report = { reused: [], fetched: [], corrupt: [], failed: null, blocked: false };

  const persist = () => {
    const manifest = {
      ...prior,
      retrievedBy: 'build/tools/berean-hebrew-fetch.mjs',
      userAgent: USER_AGENT,
      requestDelayMs: delayMs,
      note:
        'Dated draft. Raw Bible Hub pages are cached locally (not committed) so extraction is ' +
        'reproducible without re-fetching. Retrieval permission (Berean team email) is separate from ' +
        'the public-domain dedication at https://berean.bible/terms.htm; see README.md.',
      pages: entries,
    };
    atomicWrite(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  };

  let liveFetches = 0;

  for (const page of pages) {
    const filePath = path.join(pageDir, page.file);
    const relFile = `source-pages/${page.file}`;
    const existingIdx = entries.findIndex((e) => e.url === page.url);
    const existing = existingIdx >= 0 ? entries[existingIdx] : null;

    if (fs.existsSync(filePath) && !refresh) {
      const buf = fs.readFileSync(filePath);
      const hash = sha256(buf);
      if (existing && existing.sha256 && existing.sha256 !== hash) {
        report.corrupt.push({ passage: page.passage, url: page.url, file: relFile, expectedSha256: existing.sha256, actualSha256: hash });
        logError(`CORRUPT ${page.passage}  cached bytes ${hash.slice(0, 12)}… != manifest ${String(existing.sha256).slice(0, 12)}… — cache left untouched, metadata not updated (use --refresh to re-download)`);
        continue;
      }
      const entry = {
        ...(existing || {}),
        passage: page.passage, book: page.book, bookId: page.bookId, chapter: page.chapter, url: page.url, file: relFile,
        // Reuse keeps the ORIGINAL retrieval date and status.
        retrievedAt: existing?.retrievedAt ?? null,
        httpStatus: existing?.httpStatus ?? 200,
        byteLength: buf.length,
        sha256: hash,
        ...extractEditionEvidence(buf.toString('utf8')),
      };
      if (existingIdx >= 0) entries[existingIdx] = entry; else entries.push(entry);
      report.reused.push(page.passage);
      log(`cached  ${page.passage}  ${page.url}  (${buf.length} bytes) — no request`);
      continue;
    }

    if (liveFetches > 0) await sleepImpl(delayMs);
    log(`fetch   ${page.passage}  ${page.url}`);
    let res;
    try {
      res = await requestImpl(page.url);
    } catch (e) {
      report.failed = { passage: page.passage, url: page.url, error: e.message };
      logError(`ABORT: network error on ${page.url}: ${e.message}`);
      break;
    }
    liveFetches++;

    const problem = validateDownloadedPage(res.body, { statusCode: res.statusCode, book: page.book, chapter: page.chapter });
    if (problem) {
      report.failed = { passage: page.passage, url: page.url, error: problem };
      report.blocked = /blocked/.test(problem);
      logError(`ABORT: ${problem} on ${page.url}. No cache written for this page; existing metadata preserved.`);
      break;
    }

    // Success: write the page, then update its entry, then persist the manifest.
    atomicWrite(filePath, res.body);
    const entry = {
      passage: page.passage, book: page.book, bookId: page.bookId, chapter: page.chapter, url: page.url, file: relFile,
      retrievedAt: now().toISOString(),
      httpStatus: res.statusCode,
      byteLength: Buffer.byteLength(res.body, 'utf8'),
      sha256: sha256(Buffer.from(res.body, 'utf8')),
      ...extractEditionEvidence(res.body),
    };
    if (existingIdx >= 0) entries[existingIdx] = entry; else entries.push(entry);
    report.fetched.push(page.passage);
    persist();
    log(`  ok    ${res.statusCode}  ${entry.byteLength} bytes  ${entry.sha256.slice(0, 12)}…`);
  }

  persist();
  report.manifest = { pages: entries.length, path: manifestPath };
  return report;
}

function parseArgs(argv) {
  const opts = { refresh: false, list: false, only: null, chapters: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--refresh') opts.refresh = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--only') opts.only = argv[++i] || null;
    else if (a === '--chapters') opts.chapters = String(argv[++i] || '').split(',').map(Number).filter((n) => n > 0);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const pages = coveredPages({ only: opts.only, chapters: opts.chapters });
  if (opts.list) {
    for (const p of pages) console.log(`${p.passage}\t${p.url}`);
    console.log(`\n${pages.length} page(s).`);
    return;
  }
  const report = await runFetch({ pages, refresh: opts.refresh });
  if (report.corrupt.length) console.error(`${report.corrupt.length} corrupt cache page(s) detected and not trusted.`);
  if (report.failed) {
    console.error(`Run stopped early: ${report.failed.error} on ${report.failed.url}. Valid cache is untouched; re-run later (resumable).`);
    process.exit(1);
  }
  if (report.corrupt.length) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
}
