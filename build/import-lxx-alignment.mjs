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
const LEDGER = path.join(root, 'build', 'reviews', 'lxx-genesis1-evidence.json');
const NATIVE = path.join(root, 'data', 'lxx-swete.json');
const CANON = path.join(root, 'data', 'canon.js');

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
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
  // the shipped binding is always the actually measured hash of the shipped
  // artifact. When they differ the entry is marked `rebound` so a stale ledger
  // binding can never ship silently and is reported rather than hidden.
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
    bindings[name] = { path: binding.path, sha256: actual };
    if (binding.source) bindings[name].source = binding.source;
    if (binding.sha256) bindings[name].declaredSha256 = binding.sha256;
    if (binding.sha256 && binding.sha256 !== actual) bindings[name].rebound = true;
  }

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
    for (const [rel, content] of Object.entries(compiled.files)) {
      const file = path.join(root, rel);
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      if (current !== content) { bad++; console.log(`STALE ${rel}`); }
    }
    console.log(`import-lxx-alignment: ${Object.keys(compiled.files).length - bad} current / ${bad} stale`);
    if (bad) process.exitCode = 1;
  } else {
    writeAll(compiled);
    console.log(`import-lxx-alignment: wrote ${Object.keys(compiled.files).join(', ')}`);
  }
}
