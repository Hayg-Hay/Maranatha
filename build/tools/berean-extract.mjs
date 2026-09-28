// berean-extract.mjs
//
// Reusable inspection/extraction tool for the official Berean Interlinear Bible
// New Testament Word document (https://interlinearbible.com/bib.docx).
//
// This tool exists to answer one question: does the official .docx preserve a
// reliable, per-word association between Greek surface form, transliteration,
// morphology, Strong's number, English gloss, verse reference, and token order?
// The answer (see build/sources/berean-interlinear/README.md) is yes, without
// positional guessing: every word is a Greek run immediately followed by a
// <w:hyperlink> whose English gloss is the link text and whose w:tooltip holds
// "MORPH STRONGS: Transliteration -- definition".
//
// SCOPE / SAFETY
//   - Read-only. Never writes into data/ and is never loaded by the app.
//   - Does NOT align Berean tokens to Byzantine tokens by position. It returns
//     Berean's own Greek tokens in Berean's own order.
//
// USAGE
//   # 1. download and unpack the official file (not committed):
//   curl -L -o bib.docx https://interlinearbible.com/bib.docx
//   unzip bib.docx "word/document.xml" -d bib
//   # 2. inspect:
//   node build/tools/berean-extract.mjs bib/word/document.xml stats
//   node build/tools/berean-extract.mjs bib/word/document.xml book John 6 50 51
//
// The extractor reads a *document.xml* path (the single big XML part), not the
// .docx directly, so it has no third-party dependency and stays offline.

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// Display order of the NT books as they appear in the document. Book identity
// comes from content bookmarks (<w:bookmarkStart w:name="1Corinthians"/>),
// which are unspaced; chapter headings spell them out ("1 Corinthians 1").
export const BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];
const BOOK_SET = new Set(BOOKS);
const BOOKMARK_TO_DISPLAY = new Map(BOOKS.map((b) => [b.replace(/ /g, ''), b]));

const decode = (x) => x
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const strip = (xml) => decode(xml
  .replace(/<w:tab\/>/g, '\t').replace(/<w:br\/>/g, '\n')
  .replace(/<w:noBreakHyphen\/>/g, '-').replace(/<[^>]+>/g, ''));

// A single Berean alignment record may display several Greek words joined by
// U+00A6 (¦), U+2502 (│) or '|' (e.g. μή¦γε, ἀγαθὸν¦ποιῆσαι). The extractor
// PRESERVES this raw separator on the surface (and the tooltip transliteration)
// so nothing is silently altered; the production importer applies the reviewed
// table in build/sources/berean-interlinear/compound-normalization.json to turn
// each raw separator into a word space or, for a single split word, a join.
const GREEK_COMPOUND = /[\p{Script=Greek}\p{M}]+(?:[\u00A6\u2502|][\p{Script=Greek}\p{M}]+)*/gu;

const SCAN = /<w:hyperlink r:id="(rId\d+)" w:tooltip="([^"]*)"[^>]*>([\s\S]*?)<\/w:hyperlink>|<w:r\b[^>]*>([\s\S]*?)<\/w:r>|<w:bookmarkStart w:id="\d+" w:name="([^"]+)"\/>|<w:p\b/g;

// Parses document.xml into { books: { "John": { 6: { 50: [token, ...] } } },
// anomalies: [...] }. Each token: { order, surface, transliteration,
// morphology, strongs, gloss, definition, rId }.
export function parse(xml, { maxAnomalies = 500 } = {}) {
  const books = {};
  const anomalies = [];
  let book = null;
  let chapter = 0;
  let verse = 0;
  let order = 0;
  let pending = ''; // plain run text accumulated since the previous hyperlink

  let m;
  SCAN.lastIndex = 0;
  while ((m = SCAN.exec(xml)) !== null) {
    const token = m[0];
    if (token.startsWith('<w:p')) continue;

    if (m[5] !== undefined) {
      const display = BOOKMARK_TO_DISPLAY.get(m[5]);
      if (display) { book = display; chapter = 0; verse = 0; pending = ''; }
      continue;
    }

    if (token.startsWith('<w:hyperlink')) {
      const [, rId, tooltip, inner] = m;
      const words = pending.match(GREEK_COMPOUND) || [];
      // Keep the source's own display form, including any  U+00A6/│/| display
      // separator. Normalization to a visible surface happens in the importer
      // against the reviewed compound table, so the raw form is preserved here
      // for audit and the source can never be silently altered.
      const surface = words.length ? words[words.length - 1] : '';
      if (!surface && anomalies.length < maxAnomalies) {
        anomalies.push({ kind: 'no-surface', book, chapter, verse, tooltip: tooltip.slice(0, 60) });
      }
      if (words.length > 1 && anomalies.length < maxAnomalies) {
        anomalies.push({ kind: 'multi-word-run', book, chapter, verse, surface });
      }
      pending = '';

      const tm = /^(\S+)\s+(\d+):\s*(\S+)\s+--\s*([\s\S]*)$/.exec(tooltip);
      if (!tm && anomalies.length < maxAnomalies) {
        anomalies.push({ kind: 'bad-tooltip', book, chapter, verse, tooltip: tooltip.slice(0, 60) });
      }
      const rec = {
        order: order++,
        surface,
        transliteration: tm ? tm[3] : null,
        morphology: tm ? tm[1] : null,
        strongs: tm ? tm[2] : null,
        // Word uses non-breaking spaces inside glosses; normalize to plain
        // single spaces so the values are stable and comparable.
        gloss: strip(inner).replace(/\s+/g, ' ').trim().replace(/^\(/, '').replace(/\)$/, '').trim(),
        definition: tm ? tm[4].trim() : null,
        rId,
      };
      if (book && chapter > 0 && verse > 0) {
        books[book] = books[book] || {};
        books[book][chapter] = books[book][chapter] || {};
        books[book][chapter][verse] = books[book][chapter][verse] || [];
        books[book][chapter][verse].push(rec);
      }
      continue;
    }

    // A bare run.
    const body = m[4];
    const styleM = /<w:rStyle w:val="([^"]+)"\/>/.exec(body);
    const style = styleM ? styleM[1] : '';
    const text = strip(body).trim();
    if (style === 'reftext1') {
      if (/^\d+$/.test(text)) { verse = Number(text); order = 0; pending = ''; }
      continue;
    }
    if (!text) continue;
    const cm = /^(.+?)\s+(\d+)$/.exec(text);
    if (cm && BOOK_SET.has(cm[1])) { book = cm[1]; chapter = Number(cm[2]); verse = 0; pending = ''; continue; }
    if (text === book) continue;
    if (verse > 0 && chapter > 0) pending += `${text} `;
  }
  return { books, anomalies };
}

export function stats(books) {
  const out = {};
  for (const [b, chs] of Object.entries(books)) {
    let tokens = 0; let verses = 0; let emptySurface = 0; let untranslated = 0; let noStrongs = 0;
    for (const ch of Object.values(chs)) {
      for (const vs of Object.values(ch)) {
        verses++;
        for (const t of vs) {
          tokens++;
          if (!t.surface) emptySurface++;
          if (t.gloss === '-') untranslated++;
          if (!t.strongs) noStrongs++;
        }
      }
    }
    out[b] = { chapters: Object.keys(chs).length, verses, tokens, emptySurface, untranslated, noStrongs };
  }
  return out;
}

function main() {
  const [docPath, mode, ...rest] = process.argv.slice(2);
  if (!docPath || !mode) {
    console.error('usage: node berean-extract.mjs <document.xml> stats');
    console.error('       node berean-extract.mjs <document.xml> book <Book> <chapter> [verse ...]');
    process.exit(2);
  }
  const xml = fs.readFileSync(docPath, 'utf8');
  const { books, anomalies } = parse(xml);

  if (mode === 'stats') {
    console.log(JSON.stringify({ books: stats(books), anomalyCount: anomalies.length, anomalies: anomalies.slice(0, 40) }, null, 2));
    return;
  }
  if (mode === 'book') {
    const [book, chapterArg, ...verseArgs] = rest;
    const chapter = Number(chapterArg);
    const wanted = new Set(verseArgs.map(Number));
    const ch = books[book]?.[chapter] || {};
    const verses = [];
    for (const v of Object.keys(ch).map(Number).sort((a, b) => a - b)) {
      if (wanted.size && !wanted.has(v)) continue;
      verses.push({ verse: v, tokens: ch[v] });
    }
    console.log(JSON.stringify({ book, chapter, verses }, null, 2));
    return;
  }
  console.error(`unknown mode: ${mode}`);
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
