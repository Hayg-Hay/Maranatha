// Stage 2a metadata compiler.
//
//   node build/import-lxx-alignment.mjs           # write the data files
//   node build/import-lxx-alignment.mjs --check    # verify on-disk == compiled
//
// Reads the architect's proposal ledger (build/reviews/lxx-genesis1-evidence.json)
// and compiles it, deterministically, into two pairs of classic-script data
// files that the app loads through <script> tags:
//
//   data/lxx-swete-alignment.json / .js   (source -> target correspondence)
//   data/versification-schemes.json / .js (per-translation scheme declarations)
//
// It NEVER rewrites the ledger. It compiles metadata only: text stays in the
// existing native corpora, and every correspondence stays status "proposal"
// with review.humanApproval === null. Equal counts are never used as evidence.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const LEDGER_REL = 'build/reviews/lxx-genesis1-evidence.json';
const LEDGER = path.join(root, LEDGER_REL);
const NATIVE = path.join(root, 'data', 'lxx-swete.json');
const CANON = path.join(root, 'data', 'canon.js');

const rawSha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// Canonical artifact hash: SHA-256 over the file's bytes with physical CRLF
// line endings normalized to LF. All generated bindings and every consumer use
// this single documented rule so a Windows Git checkout (CRLF in the working
// tree) and a fresh Linux clone (LF) verify identically. It also keeps the
// hash stable regardless of the local line-ending policy; the actual Scripture
// strings themselves are never re-encoded.
const CANONICAL_HASH = 'sha256-lf';
const sha256 = (file) => {
  const lf = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(lf, 'utf8').digest('hex');
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stable = (value) => JSON.stringify(value, null, 2) + '\n';

function parseCanon() {
  const text = fs.readFileSync(CANON, 'utf8');
  const match = text.match(/window\.MARANATHA_CANON=(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error('could not parse data/canon.js');
  return JSON.parse(match[1]);
}

function sourceKey(ref) {
  return [ref.book, String(ref.chapter), ref.kind, ref.kind === 'unnumbered' ? ref.segmentIndex : ref.label].join('|');
}
function targetKey(ref) {
  return [ref.book, ref.chapter, ref.verse].join('|');
}

// The scheme declarations name each existing edition's own scheme without
// claiming universal identity. WEB/KJV/OSHB comparison coverage is limited to
// the Genesis 1 proposals; other editions stay unreviewed/legacy-indexed.
function buildSchemes() {
  return {
    version: 1,
    status: 'proposal',
    review: { humanApproval: null },
    license: {
      id: 'CC-BY-SA-4.0',
      attribution:
        'Scheme declarations: Maranatha Stage 2a. Greek: First1KGreek / Swete, CC BY-SA 4.0; Hebrew: OSHB, CC BY 4.0; WEB Catholic Edition and imported KJV: source declarations in the shipped datasets.',
      changes: 'Editorial scheme declarations only; no Scripture text changed.',
    },
    // Only these three comparison editions have Genesis 1 proposal coverage.
    // Any other selected edition is shown against the pilot as unreviewed
    // numbering, not as an identity claim.
    comparisonCoverage: {
      editions: ['web', 'kjv', 'he'],
      note: 'Only WEB/KJV/OSHB are compared in the Genesis 1 pilot. Target coordinates follow the Maranatha navigation canon anchored to WEB-C; selecting any other edition compares the Greek pilot against unreviewed, edition-specific numbering.',
    },
    schemes: [
      {
        id: 'lxx-swete-native',
        label: 'Swete Septuagint (native LXX numbering)',
        kind: 'native',
        dataset: 'lxx-swete',
        note: 'Source edition verse numbering as printed; never renumbered.',
      },
      {
        id: 'web-c',
        label: 'World English Bible Catholic Edition',
        kind: 'canon',
        dataset: 'web',
        note: 'Comparison coverage in this pilot is limited to the Genesis 1 proposals; other books are unreviewed.',
      },
      {
        id: 'kjv',
        label: 'King James Version (standard 66-book edition)',
        kind: 'canon',
        dataset: 'kjv',
        note: 'Comparison coverage in this pilot is limited to the Genesis 1 proposals; the edition omits the deuterocanonical books.',
      },
      {
        id: 'oshb',
        label: 'Open Scriptures Hebrew Bible (Masoretic)',
        kind: 'canon',
        dataset: 'he',
        note: 'Comparison coverage in this pilot is limited to the Genesis 1 proposals; the edition covers the 39 protocanonical books only.',
      },
      {
        id: 'byz-greek',
        label: 'Byzantine Majority Text (Greek NT)',
        kind: 'canon',
        dataset: 'byz',
        reviewed: false,
        note: 'Greek New Testament, edition-specific numbering. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'luther-1912',
        label: 'Luther Bible 1912',
        kind: 'canon',
        dataset: 'luther1912',
        reviewed: false,
        note: 'Own chapter/verse numbering. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'segond-1910',
        label: 'Louis Segond (1910)',
        kind: 'canon',
        dataset: 'segond1910',
        reviewed: false,
        note: 'Own chapter/verse numbering. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'delitzsch-1877',
        label: 'Delitzsch Hebrew NT (1877)',
        kind: 'canon',
        dataset: 'delitzsch',
        reviewed: false,
        note: 'Hebrew New Testament. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'delitzsch-1901',
        label: 'Delitzsch Hebrew NT (1901, vocalized)',
        kind: 'canon',
        dataset: 'delitzsch1901',
        reviewed: false,
        note: 'Own numbering differing from canon.js in seven New Testament chapters. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'armwestern-1853',
        label: 'Western Armenian NT (1853)',
        kind: 'canon',
        dataset: 'armwestern',
        reviewed: false,
        note: 'Under verse-boundary audit. Unreviewed against the Genesis 1 pilot.',
      },
      {
        id: 'lxx-aligned',
        label: 'LXX alignment pilot (Genesis 1)',
        kind: 'virtual',
        nativeScheme: 'lxx-swete-native',
        mapping: 'data/lxx-swete-alignment.json',
        note: 'Virtual, opt-in Canon comparison column. Resolves from the native Swete text; it is not a separate corpus and is excluded from Parallel translation choices and text search.',
      },
    ],
    translations: {
      'lxx-swete': 'lxx-swete-native',
      'lxx-aligned': 'lxx-aligned',
      web: 'web-c',
      kjv: 'kjv',
      he: 'oshb',
      byz: 'byz-greek',
      luther1912: 'luther-1912',
      segond1910: 'segond-1910',
      delitzsch: 'delitzsch-1877',
      delitzsch1901: 'delitzsch-1901',
      armwestern: 'armwestern-1853',
    },
  };
}

export function build() {
  const ledger = readJson(LEDGER);
  const native = readJson(NATIVE);
  const canon = parseCanon();

  if (ledger.status !== 'proposal') throw new Error('ledger must remain a proposal');
  if (ledger.review?.humanApproval !== null) throw new Error('ledger humanApproval must stay null');

  // The pilot covers exactly the chapters present in the ledger. Derive the
  // covered set from the source references; never infer it from equal counts.
  const covered = new Map();
  for (const row of ledger.rows) {
    covered.set(`${row.from.book} ${row.from.chapter}`, { book: row.from.book, chapter: String(row.from.chapter) });
  }

  const groups = [];
  const groupIndex = new Map();
  const entries = [];

  for (const row of ledger.rows) {
    const groupId = row.groupId;
    let group = groupIndex.get(groupId);
    if (!group) {
      group = { id: groupId, sources: [], targets: [], evidence: [], collective: false, notes: '', status: 'proposal' };
      groupIndex.set(groupId, group);
      groups.push(group);
    }
    const source = { book: row.from.book, chapter: String(row.from.chapter), kind: row.from.kind, label: String(row.from.label) };
    if (!group.sources.some((s) => sourceKey(s) === sourceKey(source))) group.sources.push(source);
    for (const target of row.to) {
      if (!group.targets.some((t) => targetKey(t) === targetKey(target))) group.targets.push(target);
    }
    if (!group.evidence.includes(row.id)) group.evidence.push(row.id);
    if (row.differences?.length) {
      const note = row.differences.join(' ');
      if (note && !group.notes.includes(note)) group.notes = group.notes ? `${group.notes} ${note}` : note;
    }

    entries.push({
      source,
      groupId,
      to: row.to.map((t) => ({ book: t.book, chapter: t.chapter, verse: t.verse })),
      status: 'proposal',
      provenance: {
        ledger: 'build/reviews/lxx-genesis1-evidence.json',
        rowId: row.id,
        reason: row.reason || '',
        differences: Array.isArray(row.differences) ? row.differences.slice() : [],
        sourceFlags: Array.isArray(row.sourceFlags) ? row.sourceFlags.slice() : [],
        textHashes: { ...row.textHashes },
      },
    });
  }
  for (const group of groups) group.collective = group.sources.length > 1 || group.targets.length > 1;

  // Bind maps to the exact artifacts. The ledger's declared hashes are
  // preserved verbatim as `declaredSha256` (the ledger is never rewritten), but
  // the shipped binding is always the canonical hash of the shipped artifact.
  // Canonical hashing normalizes CRLF to LF, so the earlier ledger-vs-artifact
  // discrepancy on data/kjv.json and data/canon.js resolves to the ledger's
  // own declared values and a fresh clone checks identically. A mismatch is
  // still flagged `rebound` so a stale or drifted binding can never ship
  // silently.
  const declared = {
    lxx: ledger.bindings.lxx,
    web: ledger.bindings.web,
    he: ledger.bindings.he,
    kjv: ledger.bindings.kjv,
    canon: ledger.bindings.canon,
  };
  const bindings = {};
  for (const [name, binding] of Object.entries(declared)) {
    const actual = sha256(path.join(root, binding.path));
    bindings[name] = { path: binding.path, sha256: actual, hash: CANONICAL_HASH };
    if (binding.source) bindings[name].source = binding.source;
    if (binding.sha256) bindings[name].declaredSha256 = binding.sha256;
    if (binding.sha256 && binding.sha256 !== actual) bindings[name].rebound = true;
  }

  // Bind the proposal ledger itself, so the source proposals cannot silently
  // drift from the artifact the validator checks them against. Every entry's
  // provenance.ledger points at this same file; the validator requires it to
  // resolve and its hash to match before trusting any row.
  bindings.ledger = { path: LEDGER_REL, sha256: sha256(LEDGER), hash: CANONICAL_HASH };

  const mapping = {
    version: 1,
    id: 'lxx-swete-alignment',
    label: 'LXX-canon alignment pilot (Genesis 1)',
    status: 'proposal',
    review: {
      humanApproval: null,
      reviewers: ledger.review.reviewers.slice(),
      requirement: ledger.review.requirement,
    },
    license: {
      id: ledger.license.id,
      attribution: ledger.license.attribution,
      changes: ledger.license.changes,
    },
    scope: {
      covered: [...covered.values()],
      note: 'This pilot covers Genesis 1 only. A target reference with no entry and no explicit negative assertion is unresolved; it is never inferred from equal counts or ordinals.',
      edges: 'Each source member names its group\'s complete target set. A group is a collective passage correspondence, not a claim of exact individual equivalence.',
    },
    schemes: 'data/versification-schemes.json',
    sourceScheme: 'lxx-swete-native',
    targetScheme: 'web-c',
    targetSchemeNote:
      'Target coordinates are the Maranatha navigation canon anchored to the WEB Catholic Edition. ' +
      'They do not assert that every edition or manuscript shares that numbering; Genesis 1 is the only proposal-covered passage.',
    hashMethod: CANONICAL_HASH,
    bindings,
    groups,
    entries,
    negativeAssertions: [],
    unresolved: [],
  };

  const mappingJs = `window.MARANATHA_LXX_ALIGNMENT=${JSON.stringify(mapping)};\n`;
  const schemes = buildSchemes();
  const schemesJs = `window.MARANATHA_VERSIFICATION_SCHEMES=${JSON.stringify(schemes)};\n`;

  return {
    mapping,
    schemes,
    files: {
      'data/lxx-swete-alignment.json': stable(mapping),
      'data/lxx-swete-alignment.js': mappingJs,
      'data/versification-schemes.json': stable(schemes),
      'data/versification-schemes.js': schemesJs,
    },
  };
}

// Canon/native references are needed by the validator, not here, but expose the
// parsers so a single compiler is the source of truth for both.
export { parseCanon, sourceKey, targetKey };

function writeAll(compiled) {
  for (const [rel, content] of Object.entries(compiled.files)) {
    fs.writeFileSync(path.join(root, rel), content);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const check = process.argv.includes('--check');
  const compiled = build();
  if (check) {
    let bad = 0;
    // Compare on normalized line endings: the compiler always emits LF, but a
    // Windows Git checkout may hold the tracked files with CRLF. Both represent
    // the same metadata, so neither platform reports a false STALE.
    const normalizeEol = (text) => text.replace(/\r\n/g, '\n');
    for (const [rel, content] of Object.entries(compiled.files)) {
      const file = path.join(root, rel);
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      if (normalizeEol(current) !== normalizeEol(content)) { bad++; console.log(`STALE ${rel}`); }
    }
    console.log(`import-lxx-alignment: ${Object.keys(compiled.files).length - bad} current / ${bad} stale`);
    if (bad) process.exitCode = 1;
  } else {
    writeAll(compiled);
    console.log(`import-lxx-alignment: wrote ${Object.keys(compiled.files).join(', ')}`);
  }
}
