// berean-hebrew-variants.mjs
//
// Builds the verified Ketiv/Qere correspondence table for the covered Hebrew
// books by consulting the ORIGINAL OSHB XML (its explicit <w type="x-ketiv"> /
// <rdg type="x-qere"> structure) and the locally cached Bible Hub pages.
//
// It does NOT match by position or by Strong's number alone: a source record is
// accepted only when its consonant skeleton matches the OSHB Ketiv or Qere
// skeleton for the same verse (Strong's is recorded as corroborating evidence).
// Cases where the two forms share a consonant skeleton, or where no source
// record matches either, are recorded separately for human review and are NOT
// emitted as variants.
//
//   node build/tools/berean-hebrew-variants.mjs          # write variants.json
//   node build/tools/berean-hebrew-variants.mjs --check  # verify up to date
//
// This reads the ignored local source cache; on a fresh checkout it explains
// how to enable itself and exits 0 (it never downloads anything).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parsePage, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC_DIR = path.join(ROOT, 'build', 'sources', 'berean-hebrew');
const MANIFEST = path.join(SRC_DIR, 'source-manifest.json');
const OSHB_DIR = path.join(ROOT, 'build', 'sources', 'oshb');
const OUT = path.join(SRC_DIR, 'variants.json');

// Covered books whose OSHB XML we consult. Malachi's retained verses (English
// 4:5-6 = Hebrew 3:23-24) contain no Ketiv/Qere, so it is intentionally absent.
const BOOKS = [
  { bookId: 'GEN', osis: 'Gen', xml: 'Gen.xml' },
  { bookId: 'DAN', osis: 'Dan', xml: 'Dan.xml' },
];

const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const norm = (text) => text.replace(/\r\n/g, '\n');

// Consonant skeleton: drop niqqud/cantillation, punctuation and OSHB's morpheme
// separators so a source surface can be compared with an OSHB form by letters.
function skeleton(s) {
  return String(s || '')
    .normalize('NFC')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[\/\s\u05BE\u05C0\u05C3\u05F3\u05F4|]/g, '');
}

// OSHB lemma -> bare Strong's number (strips prefixes like "l/" and suffixes
// like " a", and the numeric sub-sense dotted suffix).
function strongsRoot(lemma) {
  const m = /([0-9]+)/.exec(String(lemma || ''));
  return m ? m[1] : null;
}

function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Every explicit Ketiv/Qere pair in one OSHB book.
function oshbVariants(book) {
  const xml = fs.readFileSync(path.join(OSHB_DIR, book.xml), 'utf8');
  const out = [];
  const verseRe = new RegExp(`<verse osisID="${book.osis}\\.(\\d+)\\.(\\d+)">([\\s\\S]*?)<\\/verse>`, 'g');
  let m;
  while ((m = verseRe.exec(xml))) {
    const chapter = Number(m[1]);
    const verse = Number(m[2]);
    const body = m[3];
    // One entry per <w type="x-ketiv"> group (a verse may carry several).
    const groups = body.split('<w type="x-ketiv"').slice(1);
    for (const chunk of groups) {
      const kk = /^[^>]*?lemma="([^"]*)"[^>]*>([\s\S]*?)<\/w>/.exec(chunk);
      const qq = /<rdg type="x-qere"><w lemma="([^"]*)"[^>]*>([\s\S]*?)<\/w>/.exec(chunk);
      out.push({
        chapter,
        verse,
        oshbKetiv: kk ? decodeEntities(kk[2]) : null,
        oshbQere: qq ? decodeEntities(qq[2]) : null,
        ketivLemma: kk ? kk[1] : null,
        qereLemma: qq ? qq[1] : null,
      });
    }
  }
  return out;
}

function sourceRecordsFor(manifest, bookId, chapter) {
  const page = manifest.pages.find((p) => p.bookId === bookId && p.chapter === chapter);
  if (!page) return null;
  const html = fs.readFileSync(path.join(SRC_DIR, page.file), 'utf8');
  return parsePage(html, { book: page.book, chapter }).verses;
}

// Only report variants for verses actually covered by the preview (Genesis in
// full; Daniel 2:4-5). Others in the OSHB XML are out of scope.
function isCovered(bookId, chapter, verse) {
  if (bookId === 'DAN') return chapter === 2 && (verse === 4 || verse === 5);
  return true;
}

export function buildVariants() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const variants = [];
  const uncertain = [];

  for (const book of BOOKS) {
    const pairs = oshbVariants(book);
    for (const pair of pairs) {
      if (!isCovered(book.bookId, pair.chapter, pair.verse)) continue;
      const records = sourceRecordsFor(manifest, book.bookId, pair.chapter);
      const verseRecords = records ? records[pair.verse] || [] : [];
      const kSk = skeleton(pair.oshbKetiv);
      const qSk = skeleton(pair.oshbQere);
      const base = {
        bookId: book.bookId,
        chapter: pair.chapter,
        verse: pair.verse,
        oshbKetiv: pair.oshbKetiv,
        oshbQere: pair.oshbQere,
      };
      if (!kSk || !qSk) { uncertain.push({ ...base, reason: 'OSHB form missing' }); continue; }
      if (kSk === qSk) { uncertain.push({ ...base, reason: 'Ketiv and Qere share a consonant skeleton; cannot attribute the displayed form' }); continue; }

      const matchK = verseRecords.filter((r) => skeleton(r.surface) === kSk);
      const matchQ = verseRecords.filter((r) => skeleton(r.surface) === qSk);
      let display = null;
      let record = null;
      if (matchK.length === 1 && matchQ.length === 0) { display = 'ketiv'; record = matchK[0]; }
      else if (matchQ.length === 1 && matchK.length === 0) { display = 'qere'; record = matchQ[0]; }
      else if (matchK.length === 0 && matchQ.length === 0) {
        uncertain.push({ ...base, reason: 'no source record matches either the Ketiv or Qere skeleton' });
        continue;
      } else {
        uncertain.push({ ...base, reason: `ambiguous match (ketiv=${matchK.length}, qere=${matchQ.length})` });
        continue;
      }
      // Corroborate with the OSHB lemma's Strong's number. If the source's own
      // Strong's disagrees, do not silently assert the reading — record it.
      const lemma = display === 'ketiv' ? pair.ketivLemma : pair.qereLemma;
      const expected = strongsRoot(lemma);
      const corroborates = !expected || record.strongsList.includes(expected);
      if (!corroborates) {
        uncertain.push({
          ...base,
          sourceSurface: record.surface,
          reason: `displayed form matches the OSHB ${display} skeleton but the source Strong's (${record.strongsList.join('+') || 'none'}) does not include the ${display} lemma ${expected}`,
        });
        continue;
      }
      variants.push(variantEntry(book.bookId, pair, record, display, lemma));
    }
  }

  // Stable order for deterministic output.
  const key = (v) => `${v.bookId} ${v.chapter}:${v.verse}:${v.order}`;
  variants.sort((a, b) => key(a).localeCompare(key(b)));
  uncertain.sort((a, b) => `${a.bookId} ${a.chapter}:${a.verse}`.localeCompare(`${b.bookId} ${b.chapter}:${b.verse}`));

  return {
    generatedBy: 'build/tools/berean-hebrew-variants.mjs',
    note:
      'Verified Ketiv/Qere correspondences for the covered Hebrew books. Each entry was matched by ' +
      'consonant skeleton against the OSHB XML explicit variant structure for the same verse; Strong\u2019s ' +
      'is recorded as corroboration, never as the sole key. These are OSHB comparisons, NOT fields ' +
      'supplied by Berean. Cases that could not be verified are listed under "uncertain" for review.',
    variants,
    uncertain,
  };
}

function variantEntry(bookId, pair, record, display, lemma) {
  const strongs = strongsRoot(display === 'ketiv' ? pair.ketivLemma : pair.qereLemma);
  const strongsMatch = !strongs || record.strongsList.includes(strongs);
  return {
    bookId,
    chapter: pair.chapter,
    verse: pair.verse,
    order: record.order,
    strongs: record.strongsList.length === 1 ? record.strongsList[0] : (strongs || null),
    type: 'ketiv-qere',
    sourceDisplays: display,
    sourceMarksVariant: false,
    provenance: 'OSHB comparison (not supplied by Berean)',
    observedPageSurface: record.surface,
    oshbKetiv: pair.oshbKetiv,
    oshbQere: pair.oshbQere,
    strongsMatch,
    note: `Bible Hub displays the ${display === 'ketiv' ? 'written (Ketiv)' : 'read (Qere)'} form; the OSHB ${display === 'ketiv' ? 'Qere' : 'Ketiv'} differs. Berean\u2019s own surface/alignment is unchanged.`,
  };
}

function main() {
  const check = process.argv.slice(2).includes('--check');
  const cacheStatus = missingSourcePages();
  if (cacheStatus.missing.length || cacheStatus.manifestMissing) {
    console.log('SKIP  Berean Hebrew variants (source-page-dependent).');
    console.log(sourceCacheRecoveryMessage(cacheStatus.missing));
    process.exit(0);
  }
  const text = JSON.stringify(buildVariants(), null, 2) + '\n';
  if (check) {
    if (!fs.existsSync(OUT) || norm(fs.readFileSync(OUT, 'utf8')) !== norm(text)) {
      console.error(`FAIL stale ${path.relative(ROOT, OUT)}. Regenerate with: node build/tools/berean-hebrew-variants.mjs`);
      process.exit(1);
    }
    console.log(`Checked ${path.relative(ROOT, OUT)}: up to date.`);
    return;
  }
  fs.writeFileSync(OUT, text);
  const data = JSON.parse(text);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${Buffer.byteLength(text)} bytes).`);
  console.log(`  verified variants ${data.variants.length}, uncertain ${data.uncertain.length}`);
  for (const v of data.variants) console.log(`  ${v.bookId} ${v.chapter}:${v.verse} #${v.order} displays ${v.sourceDisplays} (H${v.strongs})`);
  for (const u of data.uncertain) console.log(`  UNCERTAIN ${u.bookId} ${u.chapter}:${u.verse} — ${u.reason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
