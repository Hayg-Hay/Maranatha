// berean-hebrew-fetch.mjs
//
// Cached, rate-limited downloader for the Berean Interlinear Bible (BIB) Hebrew
// Old Testament pages hosted on Bible Hub. This is the *only* tool in the pilot
// that touches the network; every other script reads the local cache.
//
// SAFETY
//   - Every manifest entry is preserved across runs. An entry is updated only
//     after its page is downloaded AND passes validation; a failed or blocked
//     request never replaces a valid cached page or its metadata.
//   - Page files and the manifest are each written through a temp file + rename,
//     so neither is ever left partially written. These are INDIVIDUALLY atomic,
//     not one transaction: an interruption between the page rename and the
//     manifest rename can leave a page whose bytes no longer match the recorded
//     hash. That is detected on the next run as a hash mismatch (CORRUPT) and
//     requires an explicit --refresh to re-establish trust — never a silent
//     re-trust.
//   - Reusing a cached page keeps its original retrieval date and full entry.
//   - A cached page whose bytes no longer match its manifest hash is reported
//     as CORRUPT and left untouched — it is never silently re-trusted with a new
//     hash. Use --refresh to re-download and re-establish trust.
//   - Rate limiting (REQUEST_DELAY_MS between live requests) and abort-on-block
//     are enforced.
//
// USAGE
//   node build/tools/berean-hebrew-fetch.mjs            # fetch missing pages only
//   node build/tools/berean-hebrew-fetch.mjs --refresh  # re-fetch every pilot page
//   node build/tools/berean-hebrew-fetch.mjs --list     # print the pilot URLs, no network

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

// The pilot passages. URL shape verified in the repo docs; the displayed
// edition label is captured from each page's own footer, never assumed.
export const PILOT_PAGES = [
  { passage: 'GEN 1', book: 'Genesis', chapter: 1, url: 'https://biblehub.com/interlinear/genesis/1.htm', file: 'genesis-1.html' },
  { passage: 'DAN 2', book: 'Daniel', chapter: 2, url: 'https://biblehub.com/interlinear/daniel/2.htm', file: 'daniel-2.html' },
  { passage: 'MAL 4', book: 'Malachi', chapter: 4, url: 'https://biblehub.com/interlinear/malachi/4.htm', file: 'malachi-4.html' },
];

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

// A download is accepted only if it is a 200 page that actually carries the
// Berean interlinear structure and footer. Anything else is rejected, so a
// failure page can never overwrite a valid cached page.
export function validateDownloadedPage(body, { statusCode } = {}) {
  const block = detectBlock(statusCode, body);
  if (block) return `access blocked (${block})`;
  if (statusCode !== 200) return `HTTP ${statusCode}`;
  if (!/<table class="tablefloatheb">/.test(body)) return 'page does not contain an interlinear word table';
  if (!/Berean Interlinear Bible \(BIB\)/.test(body)) return 'page does not carry the Berean Interlinear Bible (BIB) footer';
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
  pages = PILOT_PAGES,
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
        passage: page.passage, book: page.book, chapter: page.chapter, url: page.url, file: relFile,
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

    const problem = validateDownloadedPage(res.body, { statusCode: res.statusCode });
    if (problem) {
      report.failed = { passage: page.passage, url: page.url, error: problem };
      report.blocked = /blocked/.test(problem);
      logError(`ABORT: ${problem} on ${page.url}. No cache written for this page; existing metadata preserved.`);
      break;
    }

    // Success: write the page, then update its entry, then persist the manifest.
    atomicWrite(filePath, res.body);
    const entry = {
      passage: page.passage, book: page.book, chapter: page.chapter, url: page.url, file: relFile,
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
  const opts = { refresh: false, list: false };
  for (const a of argv) {
    if (a === '--refresh') opts.refresh = true;
    else if (a === '--list') opts.list = true;
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.list) {
    for (const p of PILOT_PAGES) console.log(`${p.passage}\t${p.url}`);
    return;
  }
  const report = await runFetch({ refresh: opts.refresh });
  if (report.corrupt.length) console.error(`${report.corrupt.length} corrupt cache page(s) detected and not trusted.`);
  if (report.failed) {
    console.error(`Run stopped early: ${report.failed.error} on ${report.failed.url}. Valid cache is untouched; re-run later.`);
    process.exit(1);
  }
  if (report.corrupt.length) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
}
