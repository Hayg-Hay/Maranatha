// Import the Swete Septuagint (First1KGreek tlg0527, OpenGreekAndLatin) into
// Maranatha as a standalone, native-numbered translation. Stage 1: no mapping
// to the canon, no alignment. The only text transformation applied is Unicode
// NFC normalization; TEI apparatus is excluded by structure.
//
//   node build/import-lxx-swete.mjs            # write data/lxx-swete.{json,js}
//   node build/import-lxx-swete.mjs --check    # build in memory, write nothing
//
// The importer reads the pinned raw snapshots under build/sources/lxx-swete/B.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const BASE = path.join(here, 'sources', 'lxx-swete');
export const B_DIR = path.join(BASE, 'B');

export const SOURCE = {
  repo: 'OpenGreekAndLatin/First1KGreek',
  commit: '03776b39f4047c5cff06f5296fae4b2bae4b08fb',
  tlg: 'tlg0527',
};

const LICENSE = {
  name: 'CC BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  attribution: 'Henry Barclay Swete, The Old Testament in Greek (Cambridge University Press, 1905), digitized by the OpenGreekAndLatin/First1KGreek project (tlg0527, commit 03776b39f4047c5cff06f5296fae4b2bae4b08fb). Adapted: TEI apparatus excluded by structure; structural headings excluded; Unicode NFC normalization applied; Ezra/Nehemiah split from the single Esdras B file; Psalm 151 excluded; rendered in native LXX numbering.',
};

const CHANGES = [
  'Unicode NFC normalization applied to every text segment.',
  'TEI apparatus (note, app) and structural headings (head) excluded by structure; never by tag-text matching.',
  'Detached text outside verse containers preserved as unnumbered segments.',
  'Ezra and Nehemiah split from the single Esdras B file at the source chapter boundary (chapters 1-10 Ezra, 11-23 Nehemiah); source chapter labels retained.',
  'Psalm 151 excluded under the 73-book scope.',
  'Daniel witness: Theodotion (tlg057) with Susanna (tlg055) and Bel (tlg059) as separate components; Old Greek witnesses not imported.',
  'Verse and chapter labels kept exactly as printed; no verse is renumbered, merged or split.',
  'Defects are disclosed as flags/notices and never corrected.',
];

const EXCLUDED = [
  { name: '1 Esdras', reason: 'Outside the 73-book Catholic canon; present upstream as tlg017. Kept in raw sources only.' },
  { name: '3 Maccabees', reason: 'Outside the 73-book Catholic canon; present upstream as tlg025. Kept in raw sources only.' },
  { name: '4 Maccabees', reason: 'Outside the 73-book Catholic canon; present upstream as tlg026. Kept in raw sources only.' },
  { name: 'Odes (including Prayer of Manasseh)', reason: 'Outside the 73-book Catholic canon; present upstream as tlg028. Kept in raw sources only.' },
  { name: 'Psalms of Solomon', reason: 'Outside the 73-book Catholic canon; present upstream as tlg035. Kept in raw sources only.' },
  { name: 'Psalm 151', reason: 'Embedded in the Psalms source (tlg027); excluded under the 73-book scope and removed from the shipped Psalms.' },
];

const MISSING = [
  { id: 'ECC', reason: 'not available in this edition' },
];

// Book number -> canon id. `component` books are shown after their parent.
// SIR is taken from grc2 (Swete); grc1 is Hart's edition and is not used.
const BOOKS = {
  1: { id: 'GEN' }, 2: { id: 'EXO' }, 3: { id: 'LEV' }, 4: { id: 'NUM' },
  5: { id: 'DEU' }, 6: { id: 'JOS' }, 8: { id: 'JDG' }, 10: { id: 'RUT' },
  11: { id: '1SA' }, 12: { id: '2SA' }, 13: { id: '1KI' }, 14: { id: '2KI' },
  15: { id: '1CH' }, 16: { id: '2CH' }, 18: { id: 'EZR', splitNeh: '11' },
  19: { id: 'EST' }, 20: { id: 'JDT' }, 21: { id: 'TOB' }, 23: { id: '1MA' },
  24: { id: '2MA' }, 27: { id: 'PSA' }, 29: { id: 'PRO' }, 31: { id: 'SNG' },
  32: { id: 'JOB' }, 33: { id: 'WIS' }, 34: { id: 'SIR', edition: 'grc2' },
  36: { id: 'HOS' }, 37: { id: 'AMO' }, 38: { id: 'MIC' }, 39: { id: 'JOL' },
  40: { id: 'OBA' }, 41: { id: 'JON' }, 42: { id: 'NAM' }, 43: { id: 'HAB' },
  44: { id: 'ZEP' }, 45: { id: 'HAG' }, 46: { id: 'ZEC' }, 47: { id: 'MAL' },
  48: { id: 'ISA' }, 49: { id: 'JER' }, 50: { id: 'BAR' }, 51: { id: 'LAM' },
  53: { id: 'EZK' },
  52: { id: 'LJE', kind: 'component', after: 'BAR' },
  55: { id: 'SUS', kind: 'component', after: 'DAN' },
  57: { id: 'DAN' },
  59: { id: 'BEL', kind: 'component', after: 'DAN' },
};

// Book order for output: canon order, with components directly after their parent.
const ORDER = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'TOB', 'JDT', 'EST', '1MA',
  '2MA', 'JOB', 'PSA', 'PRO', 'SNG', 'WIS', 'SIR', 'ISA', 'JER', 'LAM',
  'BAR', 'LJE', 'EZK', 'DAN', 'SUS', 'BEL', 'HOS', 'JOL', 'AMO', 'OBA',
  'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
];

const LABELS = {
  GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers', DEU: 'Deuteronomy',
  JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles',
  EZR: 'Ezra', NEH: 'Nehemiah', TOB: 'Tobit', JDT: 'Judith', EST: 'Esther',
  '1MA': '1 Maccabees', '2MA': '2 Maccabees', JOB: 'Job', PSA: 'Psalms',
  PRO: 'Proverbs', SNG: 'Song of Songs', WIS: 'Wisdom', SIR: 'Sirach',
  ISA: 'Isaiah', JER: 'Jeremiah', LAM: 'Lamentations', BAR: 'Baruch',
  LJE: 'Letter of Jeremiah', EZK: 'Ezekiel', DAN: 'Daniel', SUS: 'Susanna',
  BEL: 'Bel and the Dragon', HOS: 'Hosea', JOL: 'Joel', AMO: 'Amos',
  OBA: 'Obadiah', JON: 'Jonah', MIC: 'Micah', NAM: 'Nahum', HAB: 'Habakkuk',
  ZEP: 'Zephaniah', HAG: 'Haggai', ZEC: 'Zechariah', MAL: 'Malachi',
};

// Filename for a source book number. Only Sirach departs from grc1.
export function sourcePathFor(num) {
  const edition = BOOKS[num].edition || 'grc1';
  const n3 = String(num).padStart(3, '0');
  return `data/tlg0527/tlg${n3}/tlg0527.tlg${n3}.1st1K-${edition}.xml`;
}

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  trimValues: false,
  parseTagValue: false,
  processEntities: true,
});

const tagName = (node) => Object.keys(node).find((k) => k !== ':@');

function findTag(nodes, tag) {
  for (const node of nodes) {
    if ('#text' in node) continue;
    const key = tagName(node);
    const arr = node[key];
    if (!Array.isArray(arr)) continue;
    if (key === tag) return arr;
    const found = findTag(arr, tag);
    if (found) return found;
  }
  return null;
}

// Concatenate descendant text, excluding the TEI apparatus (note/app) and
// structural headings (head). When skipNestedVerse is set, text belonging to a
// separately labeled nested verse container is excluded, so a parent verse
// keeps only its own text and each nested verse is emitted exactly once.
function collectText(nodes, { skipNestedVerse = false } = {}) {
  const pieces = [];
  for (const node of nodes) {
    if ('#text' in node) { pieces.push(node['#text']); continue; }
    const key = tagName(node);
    const arr = node[key];
    if (!Array.isArray(arr)) continue;
    if (key === 'note' || key === 'app' || key === 'head') continue;
    if (skipNestedVerse && key === 'div' && node[':@']?.['@_subtype'] === 'verse') continue;
    pieces.push(collectText(arr, { skipNestedVerse }));
  }
  return pieces.join(' ');
}

const clean = (text) => String(text).normalize('NFC').replace(/\s+/gu, ' ').trim();

// Parse one TEI file into ordered chapters of ordered segments.
export function parseSourceFile(xmlText) {
  const body = findTag(parser.parse(xmlText), 'body');
  const chapters = [];
  const byLabel = new Map();
  let current = null;

  const ensure = (label) => {
    if (byLabel.has(label)) return byLabel.get(label);
    const chapter = { n: label, segments: [] };
    chapters.push(chapter);
    byLabel.set(label, chapter);
    return chapter;
  };

  const walk = (nodes, parentVerse) => {
    for (const node of nodes) {
      if ('#text' in node) {
        if (parentVerse === null) {
          const text = clean(node['#text']);
          if (text) { current = current || ensure('1'); current.segments.push({ kind: 'unnumbered', t: text }); }
        }
        continue;
      }
      const key = tagName(node);
      const attrs = node[':@'] || {};
      const arr = node[key];
      if (!Array.isArray(arr)) continue;
      if (key === 'note' || key === 'app' || key === 'head') continue;
      if (key === 'div' && attrs['@_subtype'] === 'chapter') {
        current = ensure(String(attrs['@_n']));
        walk(arr, null);
        continue;
      }
      if (key === 'div' && attrs['@_subtype'] === 'verse') {
        const label = String(attrs['@_n']);
        const own = clean(collectText(arr, { skipNestedVerse: true }));
        if (!current) current = ensure('1');
        const segment = { kind: 'verse', l: label, t: own };
        current.segments.push(segment);
        if (parentVerse) (parentVerse._nested ||= []).push(label);
        walk(arr, segment);
        continue;
      }
      walk(arr, parentVerse);
    }
  };

  walk(body, null);
  return chapters;
}

const LATIN_RE = /[^\s]*\p{Script=Latin}[^\s]*/gu;
const NOISE_RE = /U\+[0-9A-F]{4,6}|\?{2,}|[⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜ]|\uFFFD/g;

function flagsFor(segment) {
  const flags = [];
  if (!segment.t) flags.push({ code: 'empty-verse', note: 'Empty verse container in the source.' });
  const latin = [...segment.t.matchAll(LATIN_RE)].map((m) => m[0]);
  if (latin.length) flags.push({ code: 'mixed-script', note: `Latin / mixed-script token(s) in source: ${[...new Set(latin)].slice(0, 8).join(', ')}` });
  const noise = [...segment.t.matchAll(NOISE_RE)].map((m) => m[0]);
  if (noise.length) flags.push({ code: 'transcription-marker', note: `Typographic / transcription marker candidate(s) in source: ${[...new Set(noise)].slice(0, 8).join(', ')}` });
  if (/θάυατος/u.test(segment.t)) flags.push({ code: 'transcription-suspect', note: 'Source spells θάυατος (upsilon in a death-like word); disclosed, not corrected.' });
  if (segment._nested && segment._nested.length) flags.push({ code: 'nested-container', note: `Source nests separately labeled verse container(s) ${segment._nested.join(', ')} inside this verse; each is preserved once.` });
  if (flags.length) segment.flags = flags;
  delete segment._nested;
  return segment;
}

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }

const BOOK_NOTICES = {
  DAN: [
    'Daniel is the Theodotion version (tlg057). Susanna (tlg055) and Bel (tlg059) are separate components shown after Daniel; the Old Greek witnesses are not imported.',
    'Chapter 3 includes the Prayer of Azariah and the Song of the Three as printed.',
  ],
  BAR: [
    'The Letter of Jeremiah is a separate component (LJE) shown after Baruch; the source does not number it as Baruch chapter 6.',
  ],
  BEL: [
    'Theodotion Bel is truncated mid-sentence at source 1:36 (canonical Daniel 14:36); verses 37-42 are not available in this edition and are not reconstructed from the Old Greek witness.',
  ],
};

function noticesFor(id, book) {
  const notices = [...(BOOK_NOTICES[id] || [])];
  if (id === 'PSA') {
    notices.push(
      'Psalm 151 is excluded under the 73-book scope.',
      'Psalm 115 has no verse label 6 in the source; label 5 carries the text.',
      'Psalm 88 contains label 84 where 48 would be expected; the source label is preserved.',
      'Psalm 129:3 contains separately labeled nested verses 4-8; each is preserved once.',
    );
  }
  const detached = book.chapters.reduce((n, c) => n + c.segments.filter((s) => s.kind === 'unnumbered').length, 0);
  if (detached) notices.push(`${detached} detached title or introduction segment(s) are preserved without verse numbers.`);
  return notices;
}

// Fresh parse of a book's raw source, filtered to the same scope the importer
// emits (used by the validator and the Stage 1 invariant check).
export function freshBookSegments(book) {
  const chapters = parseSourceFile(fs.readFileSync(path.join(B_DIR, book.sourceFile), 'utf8'));
  let filtered = chapters;
  if (book.id === 'EZR') filtered = chapters.filter((c) => Number(c.n) <= 10);
  if (book.id === 'NEH') filtered = chapters.filter((c) => Number(c.n) >= 11);
  if (book.id === 'PSA') filtered = chapters.filter((c) => c.n !== '151');
  return filtered.map((c) => ({ n: c.n, segments: c.segments }));
}

export function buildData() {
  const manifest = JSON.parse(fs.readFileSync(path.join(BASE, 'B-manifest.json'), 'utf8'));
  if (manifest.commit !== SOURCE.commit) throw new Error(`Wrong Swete snapshot: ${manifest.commit}`);
  const manifestByPath = new Map(manifest.files.map((f) => [f.path, f]));

  const parsed = new Map(); // num -> chapters
  const sourceFiles = new Map(); // path -> { path, sha256 }
  const readSource = (num) => {
    if (parsed.has(num)) return parsed.get(num);
    const rel = sourcePathFor(num);
    const abs = path.join(B_DIR, rel);
    const bytes = fs.readFileSync(abs);
    const expected = manifestByPath.get(rel);
    if (!expected) throw new Error(`Source file not in manifest: ${rel}`);
    const hash = sha256(bytes);
    if (hash !== expected.sha256) throw new Error(`SHA-256 mismatch for ${rel}`);
    const chapters = parseSourceFile(bytes.toString('utf8'));
    parsed.set(num, chapters);
    sourceFiles.set(rel, { path: rel, sha256: hash });
    return chapters;
  };

  // Determine which source numbers are shipped, and parse them.
  const shippedNums = Object.keys(BOOKS).map(Number);
  for (const num of shippedNums) readSource(num);

  // Assemble output books in order.
  const chaptersById = new Map();
  chaptersById.set('EZR', readSource(18).filter((c) => Number(c.n) <= 10));
  chaptersById.set('NEH', readSource(18).filter((c) => Number(c.n) >= 11));
  for (const num of shippedNums) {
    const spec = BOOKS[num];
    if (spec.splitNeh) continue;
    chaptersById.set(spec.id, readSource(num));
  }

  // Drop Psalm 151 (excluded) before assembling.
  const psalms = chaptersById.get('PSA').filter((c) => c.n !== '151');
  chaptersById.set('PSA', psalms);

  const idToNum = new Map();
  for (const [num, spec] of Object.entries(BOOKS)) idToNum.set(spec.id, Number(num));
  idToNum.set('NEH', 18); // Nehemiah comes from the combined Esdras B file.

  const books = [];
  for (const id of ORDER) {
    const spec = Object.values(BOOKS).find((b) => b.id === id);
    const num = idToNum.get(id);
    const chapters = (chaptersById.get(id) || []).map((c) => ({
      n: c.n,
      // Flags are disclosures attached to numbered verses only, so every flag
      // points at an existing verse. Detached/unnumbered text is covered by the
      // book notices instead.
      segments: c.segments.map((s) => (s.kind === 'verse' ? flagsFor(s) : s)),
    }));
    const book = {
      id,
      label: LABELS[id] || id,
      kind: spec && spec.kind === 'component' ? 'component' : 'book',
      sourceFile: sourcePathFor(Number(num)),
      notices: noticesFor(id, { chapters }),
      chapters,
    };
    books.push(book);
  }

  return {
    id: 'lxx-swete',
    label: 'Septuagint (Swete, 1905) — native LXX numbering',
    scheme: 'lxx-swete-native',
    source: {
      repo: SOURCE.repo,
      commit: SOURCE.commit,
      files: [...sourceFiles.values()].sort((a, b) => a.path.localeCompare(b.path)),
    },
    license: LICENSE,
    changes: CHANGES,
    excluded: EXCLUDED,
    missing: MISSING,
    books,
  };
}

function writeOutputs(data) {
  const json = JSON.stringify(data);
  fs.writeFileSync(path.join(root, 'data', 'lxx-swete.json'), json);
  const js = `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['lxx-swete']=${json};\n`;
  fs.writeFileSync(path.join(root, 'data', 'lxx-swete.js'), js);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const data = buildData();
  const chapterCount = data.books.reduce((n, b) => n + b.chapters.length, 0);
  const verseCount = data.books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.segments.filter((s) => s.kind === 'verse').length, 0), 0);
  const unnumberedCount = data.books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.segments.filter((s) => s.kind === 'unnumbered').length, 0), 0);
  const flagCount = data.books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.segments.filter((s) => s.flags).length, 0), 0);
  if (process.argv.includes('--check')) {
    console.log(`lxx-swete check OK: books=${data.books.length} chapters=${chapterCount} verses=${verseCount} unnumbered=${unnumberedCount} flagged=${flagCount}`);
  } else {
    writeOutputs(data);
    const bytes = fs.statSync(path.join(root, 'data', 'lxx-swete.json')).size;
    console.log(`lxx-swete written: books=${data.books.length} chapters=${chapterCount} verses=${verseCount} unnumbered=${unnumberedCount} flagged=${flagCount} json=${bytes} bytes`);
  }
}
