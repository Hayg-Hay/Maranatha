// berean-hebrew-variants.mjs
//
// Builds the verified Ketiv/Qere correspondence table for the covered Hebrew
// books by consulting the ORIGINAL OSHB XML (its explicit <w type="x-ketiv"> /
// <rdg type="x-qere"> structure) and the locally cached Bible Hub pages.
//
// Matching (never by position or Strong's alone):
//   - the source record whose consonant skeleton matches the OSHB Ketiv or Qere
//     for the SAME verse is the candidate;
//   - if both readings have a candidate (e.g. a verse contains the Ketiv spelling
//     in one place and a Qere-spelled word elsewhere), the candidate is chosen by
//     PRECEDING-WORD CONTEXT: the word before the variant in the OSHB verse must
//     match the word before the candidate record;
//   - Strong's and vowel-point comparison are recorded as EVIDENCE, not gates: a
//     Strong's mismatch (the source often tags the read form's dictionary entry)
//     does not disprove the correspondence, and identical consonants alone do not
//     prove it.
// Each verified entry carries a source-record FINGERPRINT and an `evidence`
// object. Cases that cannot be resolved are listed under "uncertain" and are not
// emitted.
//
//   node build/tools/berean-hebrew-variants.mjs          # write variants.json
//   node build/tools/berean-hebrew-variants.mjs --check  # verify up to date
//
// Reads the ignored local source cache; on a fresh checkout it explains how to
// enable itself and exits 0 (it never downloads anything).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parsePage, recordFingerprint, missingSourcePages, sourceCacheRecoveryMessage } from './berean-hebrew-extract.mjs';

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
  { bookId: 'EXO', osis: 'Exod', xml: 'Exod.xml' },
  { bookId: 'LEV', osis: 'Lev', xml: 'Lev.xml' },
  { bookId: 'DAN', osis: 'Dan', xml: 'Dan.xml' },
];

const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const norm = (text) => text.replace(/\r\n/g, '\n');

// Consonant skeleton: drop niqqud/cantillation, punctuation and OSHB's morpheme
// separators so surfaces can be compared by letters.
function skeleton(s) {
  return String(s || '').normalize('NFC').replace(/[\u0591-\u05C7]/g, '').replace(/[\/\s\u05BE\u05C0\u05C3\u05F3\u05F4|]/g, '');
}
// Letters + vowel points (cantillation, meteg and maqqef dropped) for comparing
// a pointed source surface with a pointed OSHB form.
function voweled(s) {
  return String(s || '').normalize('NFC')
    .replace(/[\u0591-\u05AF\u05BD\u05BF]/g, '')
    .replace(/[\/\s\u05BE\u05C0\u05C3\u05F3\u05F4|]/g, '');
}
function strongsRoot(lemma) {
  const m = /([0-9]+)/.exec(String(lemma || ''));
  return m ? m[1] : null;
}
function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
const stripTags = (s) => String(s).replace(/<[^>]*>/g, '');

// OSHB records the English/KJV verse in a note (e.g. OSHB Exod 22:4 is KJV
// Exod 22:5). Bible Hub uses the English numbering, so map through it. Pure and
// exported for focused tests.
export function sourceVerseFor(body, chapter, verse) {
  const kjv = /KJV:([A-Za-z0-9]+)\.(\d+)\.(\d+)/.exec(body);
  return kjv ? { chapter: Number(kjv[2]), verse: Number(kjv[3]) } : { chapter, verse };
}

// Every explicit Ketiv/Qere pair in one OSHB book, with the skeleton of the word
// immediately preceding the variant (for context disambiguation).
function oshbVariants(book) {
  const xml = fs.readFileSync(path.join(OSHB_DIR, book.xml), 'utf8');
  const out = [];
  const verseRe = new RegExp(`<verse osisID="${book.osis}\\.(\\d+)\\.(\\d+)">([\\s\\S]*?)<\\/verse>`, 'g');
  let m;
  while ((m = verseRe.exec(xml))) {
    const chapter = Number(m[1]);
    const verse = Number(m[2]);
    const body = m[3];
    const sv = sourceVerseFor(body, chapter, verse);
    const sourceChapter = sv.chapter;
    const sourceVerse = sv.verse;
    let idx = 0;
    while ((idx = body.indexOf('<w type="x-ketiv"', idx)) !== -1) {
      const next = body.indexOf('<w type="x-ketiv"', idx + 12);
      const chunk = body.slice(idx, next === -1 ? body.length : next);
      const before = body.slice(0, idx);
      const wordsBefore = [...before.matchAll(/<w\b[^>]*>([\s\S]*?)<\/w>/g)];
      const prevWord = wordsBefore.length ? decodeEntities(stripTags(wordsBefore[wordsBefore.length - 1][1])) : '';
      const kk = /^<w type="x-ketiv"[^>]*?lemma="([^"]*)"[^>]*>([\s\S]*?)<\/w>/.exec(chunk);
      const qq = /<rdg type="x-qere"><w lemma="([^"]*)"[^>]*>([\s\S]*?)<\/w>/.exec(chunk);
      out.push({
        chapter: sourceChapter,
        verse: sourceVerse,
        oshbRef: `${book.osis} ${chapter}:${verse}`,
        oshbKetiv: kk ? decodeEntities(stripTags(kk[2])) : null,
        oshbQere: qq ? decodeEntities(stripTags(qq[2])) : null,
        ketivLemma: kk ? kk[1] : null,
        qereLemma: qq ? qq[1] : null,
        beforeSkeleton: skeleton(prevWord),
      });
      idx += 12;
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

// Genesis and Exodus are imported in full; Daniel only 2:4-5.
function isCovered(bookId, chapter, verse) {
  if (bookId === 'DAN') return chapter === 2 && (verse === 4 || verse === 5);
  return true;
}

// Pure matcher: given one OSHB pair and the source records for its verse,
// decide which form the page displays (or why that is unresolved). It never uses
// raw position; "context" means the preceding-word skeleton.
export function classifyVariant(pair, recs) {
  const kSk = skeleton(pair.oshbKetiv);
  const qSk = skeleton(pair.oshbQere);
  if (!kSk || !qSk) return { uncertain: 'OSHB form missing' };
  const candK = recs.filter((r) => skeleton(r.surface) === kSk);
  const candQ = recs.filter((r) => skeleton(r.surface) === qSk);
  const prevSk = (r) => (r.order > 0 ? skeleton(recs[r.order - 1].surface) : null);

  let display = null;
  let record = null;
  let displayBy = null;
  if (candK.length === 1 && candQ.length === 0) { display = 'ketiv'; record = candK[0]; displayBy = 'skeleton'; }
  else if (candQ.length === 1 && candK.length === 0) { display = 'qere'; record = candQ[0]; displayBy = 'skeleton'; }
  else if (!candK.length && !candQ.length) {
    return { uncertain: 'no source record matches either the Ketiv or Qere skeleton' };
  } else {
    // Both readings appear as distinct source words nearby: choose by the
    // preceding word (context), never by raw position.
    const kCtx = candK.filter((r) => prevSk(r) === pair.beforeSkeleton);
    const qCtx = candQ.filter((r) => prevSk(r) === pair.beforeSkeleton);
    if (kCtx.length === 1 && qCtx.length === 0) { display = 'ketiv'; record = kCtx[0]; displayBy = 'context'; }
    else if (qCtx.length === 1 && kCtx.length === 0) { display = 'qere'; record = qCtx[0]; displayBy = 'context'; }
    else {
      return { uncertain: `ambiguous match (ketiv=${candK.length}, qere=${candQ.length}); preceding-word context did not resolve it` };
    }
  }

  const displayStrongs = strongsRoot(display === 'ketiv' ? pair.ketivLemma : pair.qereLemma);
  const otherStrongs = strongsRoot(display === 'ketiv' ? pair.qereLemma : pair.ketivLemma);
  const strongsEvidence = displayStrongs && record.strongsList.includes(displayStrongs) ? 'display'
    : otherStrongs && record.strongsList.includes(otherStrongs) ? 'other-reading'
      : 'none';
  const vow = voweled(record.surface);
  const vowQ = vow === voweled(pair.oshbQere);
  const vowK = vow === voweled(pair.oshbKetiv);
  const vowelsEvidence = vowQ && !vowK ? 'qere' : vowK && !vowQ ? 'ketiv' : 'unresolved';
  return { display, record, displayBy, strongsEvidence, vowelsEvidence };
}

export function buildVariants() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const variants = [];
  const uncertain = [];

  for (const book of BOOKS) {
    for (const pair of oshbVariants(book)) {
      if (!isCovered(book.bookId, pair.chapter, pair.verse)) continue;
      const records = sourceRecordsFor(manifest, book.bookId, pair.chapter);
      const recs = records ? records[pair.verse] || [] : [];
      const base = {
        bookId: book.bookId,
        chapter: pair.chapter,
        verse: pair.verse,
        oshbRef: pair.oshbRef,
        oshbKetiv: pair.oshbKetiv,
        oshbQere: pair.oshbQere,
      };
      const result = classifyVariant(pair, recs);
      if (result.uncertain) { uncertain.push({ ...base, reason: result.uncertain }); continue; }
      variants.push(variantEntry(book.bookId, pair, result.record, result.display, result.displayBy, result.strongsEvidence, result.vowelsEvidence));
    }
  }

  const key = (v) => `${v.bookId} ${v.chapter}:${v.verse}:${v.order}`;
  variants.sort((a, b) => key(a).localeCompare(key(b)));
  uncertain.sort((a, b) => `${a.bookId} ${a.chapter}:${a.verse}`.localeCompare(`${b.bookId} ${b.chapter}:${b.verse}`));

  return {
    generatedBy: 'build/tools/berean-hebrew-variants.mjs',
    note:
      'Verified Ketiv/Qere correspondences for the covered Hebrew books. Each entry was matched by ' +
      'consonant skeleton against the OSHB XML explicit variant structure for the same verse, using the ' +
      'preceding-word context when both readings appear as distinct words. Strong\u2019s and vowel-point ' +
      'comparison are recorded as evidence in each entry, never used as the sole key. These are OSHB ' +
      'comparisons, NOT fields supplied by Berean. Unresolved cases are listed under "uncertain" and are ' +
      'not attached to any record.',
    variants,
    uncertain,
  };
}

function variantEntry(bookId, pair, record, display, displayBy, strongsEvidence, vowelsEvidence) {
  const displayLemma = display === 'ketiv' ? pair.ketivLemma : pair.qereLemma;
  const strongs = strongsRoot(displayLemma);
  const others = display === 'ketiv' ? 'Qere' : 'Ketiv';
  // Fixed wording so unchanged books' runtime chunks stay byte-identical; the
  // per-case nuance (e.g. the source tagging the other reading's Strong's) is
  // carried in `evidence`.
  const note = `Bible Hub displays the ${display === 'ketiv' ? 'written (Ketiv)' : 'read (Qere)'} form; the OSHB ${others} differs. Berean\u2019s own surface/alignment is unchanged.`;
  return {
    bookId,
    chapter: pair.chapter,
    verse: pair.verse,
    order: record.order,
    oshbRef: pair.oshbRef,
    strongs: record.strongsList.length === 1 ? record.strongsList[0] : (strongs || null),
    type: 'ketiv-qere',
    sourceDisplays: display,
    sourceMarksVariant: false,
    provenance: 'OSHB comparison (not supplied by Berean)',
    observedPageSurface: record.surface,
    oshbKetiv: pair.oshbKetiv,
    oshbQere: pair.oshbQere,
    evidence: { displayBy, strongs: strongsEvidence, vowels: vowelsEvidence },
    sourceFingerprint: recordFingerprint(record),
    note,
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
  for (const v of data.variants) console.log(`  ${v.bookId} ${v.chapter}:${v.verse} #${v.order} displays ${v.sourceDisplays} (H${v.strongs}) via ${v.evidence.displayBy}; strongs=${v.evidence.strongs} vowels=${v.evidence.vowels}`);
  for (const u of data.uncertain) console.log(`  UNCERTAIN ${u.bookId} ${u.chapter}:${u.verse} — ${u.reason}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
