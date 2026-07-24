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
  const res = await fetch(url);
  if (!res.ok) return null;
  return { url, html: await res.text() };
}

// Extracts the plain verse-numbered text of one chapter page.
function parseChapterVerses(html) {
  // Every eng-web-c chapter page has the same nav row (a link back to the
  // book's index.htm, plus prev/next chapter links) TWICE: once right
  // before the verse text, once right after it (and before any footnotes
  // — which may or may not exist for a given chapter). Slicing between the
  // first and second occurrence of the nav row's book-index link isolates
  // the verse content without needing footnotes to be present, which is
  // what the earlier <p>...<hr> approach got wrong: short one-chapter
  // books like Obadiah/Philemon/Jude/2 John often have NO translator
  // footnotes, so there's no <hr> before the footer either, and that
  // regex silently grabbed the wrong (or no) content for exactly those
  // books — matching what validate.mjs actually reported.
  const navLinks = [...html.matchAll(/href="[^"]*index\.htm"/g)];
  let region = html;
  if (navLinks.length >= 2) {
    region = html.slice(navLinks[0].index, navLinks[1].index);
  }

  // Strip footnote reference markers (inline anchors linking to #FNn,
  // regardless of their visible symbol/text length).
  region = region.replace(/<a[^>]*href="#FN\d+"[^>]*>.*?<\/a>/gs, '');

  // Strip the nav row's own short links — book-index link text (e.g.
  // "Tobit"), and the "<", ">", and bare chapter-number links are all far
  // shorter than any real verse prose, so removing any anchor with <=3
  // characters of visible text clears the nav chrome without needing to
  // know its exact class/structure. (Footnote anchors are already gone
  // from the step above, so this can't accidentally eat those instead.)
  region = region.replace(/<a\b[^>]*>(.{0,3})<\/a>/gs, '');

  const text = region
    .replace(/<sup[^>]*>.*?<\/sup>/gs, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '\u2019')
    .replace(/&#8216;|&lsquo;/g, '\u2018')
    .replace(/&#8220;|&ldquo;/g, '\u201c')
    .replace(/&#8221;|&rdquo;/g, '\u201d')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split on verse-number markers: a digit run preceded by whitespace/start
  // and followed by whitespace. WEB spells out numbers in running text
  // ("forty days", not "40 days"), so a bare "<digits><space>" run is
  // reliably a verse marker in practice — but this is a heuristic, not a
  // guarantee. validate.mjs's verse-count check against canon.js is the
  // real safety net; spot-check a sample of chapters by eye too, especially
  // ones with genealogies or long lists.
  const parts = text.split(/(?:^|\s)(\d+)\s/).slice(1);
  const verses = [];
  for (let i = 0; i < parts.length; i += 2) {
    verses.push(parts[i + 1].trim());
  }
  return verses;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importBook(canonId) {
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

    chapters.push(parseChapterVerses(result.html));
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
    // IMPORTANT: run this FIRST, before the full import. The HTML-scraping
    // regexes in parseChapterVerses() below were written against markdown-
    // converted previews of eng-web-c pages (fetched from a sandboxed
    // environment with no direct network access to ebible.org), not the
    // real raw HTML bytes a browser or `fetch()` sees. They are a
    // best-effort guess at the real markup, not a verified match. This
    // mode fetches Tobit 1 (a chapter WITH footnotes) and Obadiah 1 (a
    // one-chapter book with NO footnotes — the exact case that broke last
    // time) and prints what got parsed for both, so you can catch a
    // regression in either case before spending ~1,400 requests finding
    // out the hard way.
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
  console.log('Fetching eng-web-c from ebible.org — this will take a while.');

  for (const book of canon.books) {
    books[book.id] = await importBook(book.id);
  }

  writeTranslation({
    id: 'web',
    label: 'World English Bible',
    source: 'World English Bible Catholic Edition (eng-web-c), eBible.org — https://ebible.org/eng-web-c/. Public domain. Fetched via build/import-eng-web-c.mjs.',
    books,
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
