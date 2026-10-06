// import-eng-web-c.mjs
//
// Replaces data/web.json ENTIRELY with the real World English Bible
// Catholic Edition (eBible.org's "eng-web-c"), all 73 books, including the
// 7 Catholic deuterocanonical books that data/web.json has never had.
//
// WHY REPLACE INSTEAD OF MERGE: the existing data/web.json (66 books, from
// scrollmapper/bible_databases) and eng-web-c are close but NOT identical —
// confirmed by comparing Genesis 1:2 directly: the existing file reads "Now
// the earth was formless and empty. Darkness was on the surface of the deep.
// God's Spirit was hovering..." (two sentences); eng-web-c reads "The earth
// was formless and empty. Darkness was on the surface of the deep and God's
// Spirit was hovering..." (one sentence, no "Now"). Different WEB revision
// dates. Grafting eng-web-c's 7 extra books onto the OLD 66 would silently
// mix two revisions under one "WEB" label — exactly the misrepresentation
// import-web.mjs's own header comment already warned against doing with a
// different translation entirely. So: full replace, one consistent source.
//
// WHY THIS SCRIPT DOESN'T RUN IN THE SANDBOX THIS WAS WRITTEN IN: ebible.org
// isn't on that environment's outbound network allowlist. It needs to run
// somewhere with normal internet access — i.e. your own machine.
//
// WHAT IT DOES:
//   1. For each of the 73 canon.js books, fetches http://ebible.org/eng-web-c/
//      chapter pages one at a time (<BOOKCODE><NN>.htm), starting at chapter
//      1 and continuing until the server returns a real 404 — it does NOT
//      trust canon.js's current chapter counts, because three of them
//      (Baruch, Esther, Daniel) are explicitly marked `provisional: true`
//      in canon.js precisely because that hasn't been measured yet. This
//      script measures it for real, from the actual pages, for all 73
//      books (not just the provisional three).
//   2. Extracts verse text from each chapter page, stripping eBible's
//      footnote markers (e.g. "[†...](#FN1)").
//   3. Writes data/web.json (+ prints the counts it found for BAR/EST/DAN
//      so canon.js's `provisional` flags can be resolved by hand afterward
//      — this script does not touch canon.js itself).
//
// USAGE (on a machine with normal internet access):
//   node build/import-eng-web-c.mjs
//   node build/build-locale.mjs   # unchanged, just for reference
//   node build/validate.mjs data/web.json
//
// This will take a while — it's making one HTTP request per chapter,
// roughly 1,400 requests across the whole Bible, with a polite delay
// between them (see REQUEST_DELAY_MS below). Expect it to run for several
// minutes. It logs progress per book so you can see it's alive.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const REQUEST_DELAY_MS = 300; // be polite to ebible.org's server

// canon.js book id -> eBible.org's own 3-letter code for eng-web-c. Almost
// all match canon.js's id directly; only Esther and Daniel differ, because
// eng-web-c uses the Greek/deuterocanon-expanded editions of those two
// books under eBible's own codes (ESG = "Esther, Greek", DAG = "Daniel,
// Greek") rather than the plain protocanonical EST/DAN used elsewhere.
const CODE_OVERRIDES = { EST: 'ESG', DAN: 'DAG' };

function ebibleCode(canonId) {
  return CODE_OVERRIDES[canonId] || canonId;
}

// eBible pads chapter numbers to 2 digits for every book except Psalms
// (150 chapters, needs 3) — confirmed directly from the site's own index
// page links (GEN01.htm vs PSA001.htm), not assumed.
function chapterFile(code, chapterNum) {
  const digits = code === 'PSA' ? 3 : 2;
  return `${code}${String(chapterNum).padStart(digits, '0')}.htm`;
}

async function fetchChapter(code, chapterNum) {
  const url = `http://ebible.org/eng-web-c/${chapterFile(code, chapterNum)}`;
  const maxAttempts = 5;
  let attempt = 0;
  let lastErr = null;

  function isTransientError(err, res) {
    if (res) {
      if (res.status === 404) return false;
      // 5xx server errors are likely transient
      if (res.status >= 500) return true;
      return false;
    }
    if (!err) return false;
    const msg = String(err.message || err);
    const code = err.code || (err.cause && err.cause.code) || '';
    if (code === 'ECONNRESET' || msg.includes('ECONNRESET') || msg.includes('fetch failed') || msg.includes('ETIMEDOUT') || msg.includes('timeout')) return true;
    return false;
  }

  while (++attempt <= maxAttempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        if (isTransientError(null, res)) {
          lastErr = new Error(`HTTP ${res.status}`);
        } else {
          // Non-transient HTTP error — fail fast
          throw new Error(`HTTP ${res.status} when fetching ${url}`);
        }
      } else {
        return { url, html: await res.text() };
      }
    } catch (err) {
      // Network/transport errors may throw; treat transient ones specially
      if (!isTransientError(err, null)) throw err;
      lastErr = err;
    }

    if (attempt < maxAttempts) {
      // Backoff before retrying (exponential)
      const waitMs = REQUEST_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(waitMs);
    }
  }

  // All retries failed — print clear message and throw
  console.error(`Failed to fetch book code ${code}, chapter ${chapterNum} after ${maxAttempts} attempts:` , lastErr);
  throw lastErr || new Error(`Failed to fetch ${url}`);
}

// Extracts the plain verse-numbered text of one chapter page.
// Verse arrays retain source IDs, including holes. A displayed marker such as
// V19 / "19-27" describes nine references, not one verse of prose.
function plainText(html) {
  return html.replace(/<[^>]+>/g, ' ')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

export function parseChapter(html) {
  const main = html.match(/<div\b[^>]*class=['"]main['"][^>]*>/i);
  let region = main ? html.slice(main.index + main[0].length) : html;
  const stop = region.search(/<(?:ul\b[^>]*class=['"]tnav['"]|div\b[^>]*class=['"](?:footnote|copyright)['"])/i);
  if (stop >= 0) region = region.slice(0, stop);
  const markers = [...region.matchAll(/<span\b[^>]*class=['"]verse['"][^>]*id=['"]V(\d+)['"][^>]*>([\s\S]*?)<\/span>/gi)];
  const verses = [];
  const metadata = {};
  let lastVerse = 0;
  markers.forEach((marker, i) => {
    const start = Number(marker[1]);
    const label = plainText(marker[2]);
    const range = label.match(/^(\d+)(?:-(\d+))?$/);
    if (!range || Number(range[1]) !== start) throw new Error(`Invalid source verse marker: ${label}`);
    const end = Number(range[2] || start);
    if (start <= lastVerse) throw new Error(`Duplicate or out-of-order source verse marker: ${label}`);
    lastVerse = end;
    if (end < start) throw new Error(`Reversed source verse marker: ${label}`);
    const body = region.slice(marker.index + marker[0].length, markers[i + 1]?.index ?? region.length);
    const notes = [...body.matchAll(/<a\b[^>]*href=['"]#FN\d+['"][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => plainText(m[1].replace(/^[^<]*/, ''))).filter(Boolean);
    const text = plainText(body.replace(/<a\b[^>]*href=['"]#FN\d+['"][^>]*>[\s\S]*?<\/a>/gi, ''));
    // A verse range cannot be collapsed into its first numbered slot.
    if (end > start && text) throw new Error(`Unsupported combined verse text at ${label}`);
    while (verses.length < end) verses.push(null);
    if (text) verses[start - 1] = text;
    const note = notes.join(' ');
    if (!text && /omitted/i.test(note)) {
      for (let v = start; v <= end; v++) metadata[v] = { status: 'omitted', note };
    } else if (note) {
      metadata[start] = { status: 'text', note };
    }
  });
  return { verses, metadata };
}

export function parseChapterVerses(html) {
  return parseChapter(html).verses;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importBook(canonId, verseMetadata) {
  const code = ebibleCode(canonId);
  const chapters = [];
  let chapterNum = 1;

  // Just keep requesting the next sequential chapter until the server
  // returns a real 404 (fetchChapter() -> null). This replaces an earlier
  // version that tried to parse a "next chapter" nav link out of each
  // page's HTML to know when to stop — that regex was written against a
  // markdown-converted preview (this sandbox can't reach ebible.org to see
  // raw bytes) and never actually matched eBible's real markup, so it
  // silently returned null every time and every book stopped after
  // chapter 1. A real HTTP 404 from a static file server is a much safer
  // thing to depend on than a guessed HTML pattern.
  while (true) {
    const result = await fetchChapter(code, chapterNum);
    if (!result) break;

    const parsed = parseChapter(result.html);
    chapters.push(parsed.verses);
    if (Object.keys(parsed.metadata).length) {
      (verseMetadata[canonId] ||= {})[chapterNum] = parsed.metadata;
    }
    await sleep(REQUEST_DELAY_MS);
    chapterNum++;
  }

  console.log(`  ${canonId} (${code}): ${chapters.length} chapters`);
  return chapters;
}

function loadCanon() {
  // data/canon.js is `window.MARANATHA_CANON = {...};` for <script>-tag
  // loading in the browser — there's no separate canon.json. Read the file
  // and pull the object out of the assignment rather than duplicating the
  // canon data here.
  const src = fs.readFileSync(path.join(dir, '..', 'data', 'canon.js'), 'utf8');
  const match = src.match(/window\.MARANATHA_CANON\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error('Could not find window.MARANATHA_CANON assignment in data/canon.js');
  return JSON.parse(match[1]);
}

async function main() {
  if (process.argv.includes('--smoke-test')) {
    // Check both a chapter with footnotes and a one-chapter book without
    // them before a full import. The parser also has cached Sirach fixtures
    // and regression tests for omitted ranges and preserved source IDs.
    console.log('Smoke-testing against Tobit 1 and Obadiah 1...\n');

    const tobit = await fetchChapter('TOB', 1);
    if (!tobit) {
      console.error('Fetch failed for Tobit 1 — check your network connection and the URL pattern.');
      process.exit(1);
    }
    const tobitVerses = parseChapterVerses(tobit.html);
    console.log(`Tobit 1: parsed ${tobitVerses.length} verses (expect 22).`);
    console.log('  Verse 1:', tobitVerses[0] || '(missing)');
    console.log('  Verse 22:', tobitVerses[21] || '(missing)');

    const obadiah = await fetchChapter('OBA', 1);
    if (!obadiah) {
      console.error('\nFetch failed for Obadiah 1 — check your network connection and the URL pattern.');
      process.exit(1);
    }
    const obadiahVerses = parseChapterVerses(obadiah.html);
    console.log(`\nObadiah 1 (no footnotes — the case that broke before): parsed ${obadiahVerses.length} verses (expect 21).`);
    console.log('  Verse 1:', obadiahVerses[0] || '(missing)');
    console.log('  Verse 21:', obadiahVerses[20] || '(missing)');

    console.log('\nIf either count or any printed verse looks wrong, open the real');
    console.log('page in a browser, view source, and adjust parseChapterVerses()');
    console.log('above to match what you actually see — then re-run --smoke-test.');
    return;
  }

  const canon = loadCanon();
  const books = {};
  const verseMetadata = {};
  console.log('Fetching eng-web-c from ebible.org — this will take a while.');

  for (const book of canon.books) {
    books[book.id] = await importBook(book.id, verseMetadata);
  }

  writeTranslation({
    id: 'web',
    label: 'World English Bible',
    source: 'World English Bible Catholic Edition (eng-web-c), eBible.org — https://ebible.org/eng-web-c/. Public domain. Fetched via build/import-eng-web-c.mjs.',
    books,
    verseMetadata,
  });

  console.log('\nDone fetching. Next steps:');
  console.log('  1. node build/validate.mjs data/web.json');
  console.log('  2. Compare the chapter counts logged above for BAR, EST, and DAN');
  console.log('     against data/canon.js — those three are still flagged');
  console.log('     `provisional: true` there and may need updating now that');
  console.log('     this script measured their real structure from eng-web-c.');
  console.log('  3. Regenerate data/web.js from data/web.json the same way');
  console.log('     import-web.mjs / import-kjv.mjs already do, so index.html');
  console.log('     keeps loading it via <script>, never fetch().');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(err => {
  console.error(err);
  process.exit(1);
});
