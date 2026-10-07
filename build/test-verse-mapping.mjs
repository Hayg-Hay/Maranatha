// Stage 2a semantic / mutation tests for the verse-mapping validator and
// resolver. Pure Node, no DOM.
//
//   node build/test-verse-mapping.mjs
//
// One PASS/FAIL line per invariant.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build, parseCanon } from './import-lxx-alignment.mjs';
import { validateMapping } from './validate-verse-mapping.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

const results = [];
const out = (name, ok, detail) => results.push([name, !!ok, detail || '']);

const native = readJson('data/lxx-swete.json');
const canon = parseCanon();
const mapping = readJson('data/lxx-swete-alignment.json');
const hex = 'a'.repeat(64);

// ---------------------------------------------------------------------------
// Compiled pilot shape and determinism.
// ---------------------------------------------------------------------------
function shapeChecks() {
  const sources = new Set(mapping.entries.map((e) => `${e.source.book}|${e.source.chapter}|${e.source.label}`));
  const targets = new Set(mapping.entries.flatMap((e) => e.to.map((t) => `${t.book}|${t.chapter}|${t.verse}`)));
  out('31-unique-source-refs', sources.size === 31, String(sources.size));
  out('31-unique-target-refs', targets.size === 31, String(targets.size));
  out('30-groups', mapping.groups.length === 30, String(mapping.groups.length));
  const group = mapping.groups.find((g) => g.id === 'GEN1-6-7');
  out('collective-6-7-preserved',
    !!group && group.collective === true && group.sources.length === 2 && group.targets.length === 2
      && group.targets.some((t) => t.verse === 6) && group.targets.some((t) => t.verse === 7));

  const first = build();
  const second = build();
  out('deterministic-metadata-twice',
    JSON.stringify(first.files) === JSON.stringify(second.files));

  for (const [jsonRel, jsRel, global] of [
    ['data/lxx-swete-alignment.json', 'data/lxx-swete-alignment.js', 'MARANATHA_LXX_ALIGNMENT'],
    ['data/versification-schemes.json', 'data/versification-schemes.js', 'MARANATHA_VERSIFICATION_SCHEMES'],
  ]) {
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, jsRel), 'utf8'), ctx);
    out(`js-mirrors-json:${path.basename(jsRel)}`,
      JSON.stringify(ctx.window[global]) === JSON.stringify(readJson(jsonRel)));
  }
}

// ---------------------------------------------------------------------------
// Validator: the shipped proposal passes, strict verification does not.
// ---------------------------------------------------------------------------
function validatorChecks() {
  const proposal = validateMapping(mapping, { native, canon });
  out('validator-proposal-pass', proposal.ok, proposal.errors.slice(0, 2).join(' | '));

  const strict = validateMapping(mapping, { native, canon, requireVerified: true });
  out('validator-require-verified-fails', !strict.ok && strict.errors.some((e) => /human-approved/.test(e)));
}

// ---------------------------------------------------------------------------
// Mutation tests: each malformed mapping must be rejected.
// ---------------------------------------------------------------------------
function mutationChecks() {
  const cases = {
    'reject-invalid-source-ref': () => { const m = clone(mapping); m.entries[0].source.label = '0'; return m; },
    'reject-invalid-target-ref': () => { const m = clone(mapping); m.entries[0].to[0].verse = 99; return m; },
    'reject-duplicate-source': () => { const m = clone(mapping); m.entries.push(clone(m.entries[0])); return m; },
    'reject-missing-provenance': () => { const m = clone(mapping); delete m.entries[0].provenance; return m; },
    'reject-bad-binding': () => { const m = clone(mapping); m.bindings.canon.sha256 = hex; return m; },
    'reject-unattested-negative': () => {
      const m = clone(mapping);
      m.negativeAssertions.push({ target: { book: 'GEN', chapter: 2, verse: 1 }, attestation: '', provenance: {} });
      return m;
    },
    'reject-group-target-conflict': () => {
      const m = clone(mapping);
      m.groups.find((g) => g.id === 'GEN1-1').targets = [{ book: 'GEN', chapter: 1, verse: 2 }];
      return m;
    },
    'reject-empty-to-without-attestation': () => { const m = clone(mapping); m.entries[0].to = []; return m; },
    'reject-negative-that-is-mapped': () => {
      const m = clone(mapping);
      m.negativeAssertions.push({ target: { book: 'GEN', chapter: 1, verse: 1 }, attestation: 'x', provenance: { source: 'x' } });
      return m;
    },
    'reject-invalid-unnumbered-index': () => {
      const m = clone(mapping);
      m.groups.push({ id: 'TMP', sources: [{ book: 'JOB', chapter: '16', kind: 'unnumbered', segmentIndex: 99 }], targets: [{ book: 'JOB', chapter: 16, verse: 1 }], evidence: ['x'], status: 'proposal' });
      m.entries.push({ source: { book: 'JOB', chapter: '16', kind: 'unnumbered', segmentIndex: 99 }, groupId: 'TMP', to: [{ book: 'JOB', chapter: 16, verse: 1 }], status: 'proposal', provenance: { ledger: 'x', rowId: 'x', textHashes: { greek: hex } } });
      return m;
    },
    // The six independently reproduced validator holes.
    'reject-verified-top-without-human': () => { const m = clone(mapping); m.status = 'verified'; return m; },
    'reject-verified-group-without-human': () => { const m = clone(mapping); m.groups[0].status = 'verified'; return m; },
    'reject-verified-entry-without-human': () => { const m = clone(mapping); m.entries[0].status = 'verified'; return m; },
    'reject-invented-evidence-row': () => { const m = clone(mapping); m.entries[0].provenance.rowId = 'does-not-exist'; return m; },
    'reject-wrong-bound-text-hashes': () => {
      const m = clone(mapping);
      Object.keys(m.entries[0].provenance.textHashes).forEach((k) => { m.entries[0].provenance.textHashes[k] = '0'.repeat(64); });
      return m;
    },
    'reject-unknown-top-status': () => { const m = clone(mapping); m.status = 'bogus'; return m; },
    // Missing member, wrong unnumbered kind/index, conflicts.
    'reject-missing-group-member': () => {
      const m = clone(mapping);
      const i = m.entries.findIndex((e) => e.provenance.rowId === 'GEN1-6');
      m.entries.splice(i, 1);
      return m;
    },
    'reject-unnumbered-kind-on-verse-segment': () => {
      const m = clone(mapping);
      m.groups.push({ id: 'BADU', sources: [{ book: 'GEN', chapter: '1', kind: 'unnumbered', segmentIndex: 0 }], targets: [{ book: 'GEN', chapter: 1, verse: 2 }], evidence: ['x'], status: 'proposal' });
      m.entries.push({ source: { book: 'GEN', chapter: '1', kind: 'unnumbered', segmentIndex: 0 }, groupId: 'BADU', to: [{ book: 'GEN', chapter: 1, verse: 2 }], status: 'proposal', provenance: { ledger: 'x', rowId: 'x', textHashes: { greek: hex } } });
      return m;
    },
    'reject-conflicting-groups': () => {
      const m = clone(mapping);
      m.groups.push({ id: 'CLASH', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], status: 'proposal' });
      return m;
    },
    // Forged bindings and unsupported scheme declaration.
    'reject-forged-ledger-binding': () => { const m = clone(mapping); m.bindings.ledger.sha256 = hex; return m; },
    'reject-forged-corpus-binding': () => { const m = clone(mapping); m.bindings.web.sha256 = hex; return m; },
    'reject-unsupported-scheme': () => { const m = clone(mapping); m.sourceScheme = 'not-a-registered-scheme'; return m; },
  };
  for (const [name, make] of Object.entries(cases)) {
    let result;
    try { result = validateMapping(make(), { native, canon }); } catch (error) { result = { ok: false, errors: [error.message] }; }
    out(name, !result.ok, result.ok ? 'unexpectedly accepted' : (result.errors[0] || 'rejected'));
  }
}

// ---------------------------------------------------------------------------
// Valid alternative shapes: many-to-one, many-to-many, unnumbered.
// ---------------------------------------------------------------------------
function syntheticShapeChecks() {
  const prov = { ledger: 'fixture', rowId: 'fixture', textHashes: { greek: hex } };
  const ok = (m, name) => {
    const r = validateMapping(m, { native, canon, checkBindings: false });
    out(name, r.ok, r.errors.slice(0, 2).join(' | '));
  };
  const manyToOne = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'MTO', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, { book: 'GEN', chapter: '1', kind: 'verse', label: '2' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], collective: true, status: 'proposal' }],
    entries: [
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'MTO', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: prov },
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '2' }, groupId: 'MTO', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: prov },
    ],
    negativeAssertions: [],
  };
  ok(manyToOne, 'accept-many-to-one');

  const manyToMany = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'MTM', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '6' }, { book: 'GEN', chapter: '1', kind: 'verse', label: '7' }], targets: [{ book: 'GEN', chapter: 1, verse: 6 }, { book: 'GEN', chapter: 1, verse: 7 }], evidence: ['x'], collective: true, status: 'proposal' }],
    entries: [
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '6' }, groupId: 'MTM', to: [{ book: 'GEN', chapter: 1, verse: 6 }, { book: 'GEN', chapter: 1, verse: 7 }], status: 'proposal', provenance: prov },
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '7' }, groupId: 'MTM', to: [{ book: 'GEN', chapter: 1, verse: 6 }, { book: 'GEN', chapter: 1, verse: 7 }], status: 'proposal', provenance: prov },
    ],
    negativeAssertions: [],
  };
  ok(manyToMany, 'accept-many-to-many');

  const unnumbered = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'UNN', sources: [{ book: 'JOB', chapter: '16', kind: 'unnumbered', segmentIndex: 0 }], targets: [{ book: 'JOB', chapter: 16, verse: 1 }], evidence: ['x'], collective: false, status: 'proposal' }],
    entries: [{ source: { book: 'JOB', chapter: '16', kind: 'unnumbered', segmentIndex: 0 }, groupId: 'UNN', to: [{ book: 'JOB', chapter: 16, verse: 1 }], status: 'proposal', provenance: prov }],
    negativeAssertions: [],
  };
  ok(unnumbered, 'accept-unnumbered');

  const attestedNegative = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'N1', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], collective: false, status: 'proposal' }],
    entries: [{ source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'N1', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: prov }],
    negativeAssertions: [{ target: { book: 'GEN', chapter: 2, verse: 1 }, attestation: 'No Greek counterpart in the covered pilot edition.', provenance: { source: 'fixture' } }],
  };
  ok(attestedNegative, 'accept-attested-negative');

  // A fully verifiable synthetic document: explicit valid human approval on
  // every scope. This is a clearly synthetic fixture and does not touch or
  // elevate the real still-proposed Genesis 1 pilot.
  const verified = {
    status: 'verified', review: { humanApproval: { approvedBy: 'fixture-reviewer', date: '2026-10-07' } },
    groups: [{ id: 'V1', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], collective: false, status: 'verified' }],
    entries: [{ source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'V1', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'verified', provenance: prov }],
    negativeAssertions: [],
  };
  ok(verified, 'accept-synthetic-verified-with-human');

  const inconsistentVerified = clone(verified);
  inconsistentVerified.entries[0].status = 'proposal';
  const inconsistent = validateMapping(inconsistentVerified, { native, canon, checkBindings: false });
  out('reject-verified-document-with-proposal-entry', !inconsistent.ok, inconsistent.errors[0] || 'rejected');
}

// ---------------------------------------------------------------------------
// Resolver safety: conflicting, missing-member and unattested metadata fail
// closed instead of guessing.
// ---------------------------------------------------------------------------
function resolverSafetyChecks() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'verse-mapping.js'), 'utf8'), ctx);
  const api = ctx.window.MARANATHA_VERSE_MAPPING;

  const conflicting = {
    status: 'proposal', review: { humanApproval: null },
    groups: [
      { id: 'A', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], status: 'proposal' },
      { id: 'B', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '2' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], status: 'proposal' },
    ],
    entries: [
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'A', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '2' }, groupId: 'B', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
    ],
    negativeAssertions: [],
  };
  const r1 = api.createResolver(conflicting, { native });
  out('resolver-conflicting-targets-fail-closed', r1.resolveTarget('GEN', 1, 1).state === 'ambiguous-metadata');

  const missing = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'M', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, { book: 'GEN', chapter: '1', kind: 'verse', label: '404' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], collective: true, status: 'proposal' }],
    entries: [
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'M', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '404' }, groupId: 'M', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
    ],
    negativeAssertions: [],
  };
  const r2 = api.createResolver(missing, { native });
  out('resolver-missing-member-retains-missing-state', r2.resolveTarget('GEN', 1, 1).state === 'missing-source-text');

  const unattested = {
    status: 'proposal', review: { humanApproval: null },
    groups: [], entries: [],
    negativeAssertions: [{ target: { book: 'GEN', chapter: 1, verse: 1 }, attestation: '', provenance: {} }],
  };
  const r3 = api.createResolver(unattested, { native });
  out('resolver-unattested-negative-not-definitive', r3.resolveTarget('GEN', 1, 1).state !== 'no-corresponding-verse');

  const duplicateSource = {
    status: 'proposal', review: { humanApproval: null },
    groups: [{ id: 'D', sources: [{ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }], targets: [{ book: 'GEN', chapter: 1, verse: 1 }], evidence: ['x'], status: 'proposal' }],
    entries: [
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'D', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
      { source: { book: 'GEN', chapter: '1', kind: 'verse', label: '1' }, groupId: 'D', to: [{ book: 'GEN', chapter: 1, verse: 1 }], status: 'proposal', provenance: {} },
    ],
    negativeAssertions: [],
  };
  const r4 = api.createResolver(duplicateSource, { native });
  out('resolver-duplicate-source-fails-closed', r4.resolveSource({ book: 'GEN', chapter: '1', kind: 'verse', label: '1' }).ambiguous === true);

  // The four runtime ambiguity gaps, each with an unaffected sibling target so
  // no valid proposal is collaterally invalidated.
  const verse = (label) => ({ book: 'GEN', chapter: '1', kind: 'verse', label });
  const target = (v) => ({ book: 'GEN', chapter: 1, verse: v });
  const group = (id, label, v) => ({ id, sources: [verse(label)], targets: [target(v)], evidence: ['x'], status: 'proposal' });
  const entry = (label, id, v) => ({ source: verse(label), groupId: id, to: [target(v)], status: 'proposal', provenance: {} });
  const fixture = (groups, entries, negativeAssertions = []) => ({ status: 'proposal', review: { humanApproval: null }, groups, entries, negativeAssertions });

  // 1. Duplicate source entry, both lookup directions.
  const dup = api.createResolver(fixture(
    [group('DS1', '1', 1), group('DS3', '3', 3)],
    [entry('1', 'DS1', 1), entry('1', 'DS1', 1), entry('3', 'DS3', 3)],
  ), { native });
  out('resolver-duplicate-source-target-view-ambiguous', dup.resolveTarget('GEN', 1, 1).state === 'ambiguous-metadata');
  out('resolver-duplicate-source-unaffected-target-ok', dup.resolveTarget('GEN', 1, 3).state === 'correspondence');
  out('resolver-duplicate-source-both-directions',
    dup.resolveSource(verse('1')).ambiguous === true && dup.resolveSource(verse('3')).ambiguous === false);

  // 2. Conflicting definitions sharing one group ID.
  const dupId = api.createResolver(fixture(
    [group('DG', '1', 1), group('DG', '2', 1), group('DG3', '3', 3)],
    [entry('1', 'DG', 1), entry('3', 'DG3', 3)],
  ), { native });
  out('resolver-duplicate-group-id-ambiguous', dupId.resolveTarget('GEN', 1, 1).state === 'ambiguous-metadata');
  out('resolver-duplicate-group-id-unaffected-target-ok', dupId.resolveTarget('GEN', 1, 3).state === 'correspondence');
  out('resolver-duplicate-group-id-source-ambiguous', dupId.resolveSource(verse('1')).ambiguous === true);

  // 3. Target both positively mapped and negatively asserted.
  const mappedNeg = api.createResolver(fixture(
    [group('MN', '1', 1), group('MN3', '3', 3)],
    [entry('1', 'MN', 1), entry('3', 'MN3', 3)],
    [{ target: target(1), attestation: 'synthetic', provenance: { source: 'synthetic' } }],
  ), { native });
  out('resolver-mapped-vs-negative-ambiguous', mappedNeg.resolveTarget('GEN', 1, 1).state === 'ambiguous-metadata');
  out('resolver-mapped-vs-negative-unaffected-target-ok', mappedNeg.resolveTarget('GEN', 1, 3).state === 'correspondence');
  out('resolver-mapped-vs-negative-source-ambiguous', mappedNeg.resolveSource(verse('1')).ambiguous === true);

  // 4. Two conflicting negative assertions for one target.
  const negNeg = api.createResolver(fixture(
    [group('NN3', '3', 3)],
    [entry('3', 'NN3', 3)],
    [
      { target: target(1), attestation: 'synthetic A', provenance: { source: 'synthetic A' } },
      { target: target(1), attestation: 'synthetic B', provenance: { source: 'synthetic B' } },
    ],
  ), { native });
  out('resolver-conflicting-negatives-ambiguous', negNeg.resolveTarget('GEN', 1, 1).state === 'ambiguous-metadata');
  out('resolver-conflicting-negatives-unaffected-target-ok', negNeg.resolveTarget('GEN', 1, 3).state === 'correspondence');

  // A single well-formed attested negative is still a definitive state.
  const singleNeg = api.createResolver(fixture(
    [group('SN3', '3', 3)],
    [entry('3', 'SN3', 3)],
    [{ target: target(2), attestation: 'No counterpart in the covered pilot edition.', provenance: { source: 'fixture' } }],
  ), { native });
  out('resolver-single-attested-negative-definitive', singleNeg.resolveTarget('GEN', 1, 2).state === 'no-corresponding-verse');
  out('resolver-single-attested-negative-unaffected-target-ok', singleNeg.resolveTarget('GEN', 1, 3).state === 'correspondence');
}

// ---------------------------------------------------------------------------
// Resolver cell states.
// ---------------------------------------------------------------------------
function resolverChecks() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'verse-mapping.js'), 'utf8'), ctx);
  const api = ctx.window.MARANATHA_VERSE_MAPPING;
  const resolver = api.createResolver(mapping, { native });

  const six = resolver.resolveTarget('GEN', 1, 6);
  const seven = resolver.resolveTarget('GEN', 1, 7);
  out('resolver-group-at-both-6-and-7',
    six.state === 'correspondence' && seven.state === 'correspondence'
      && six.groupId === 'GEN1-6-7' && seven.groupId === 'GEN1-6-7'
      && six.members.length === 2 && seven.members.length === 2);
  out('resolver-group-text-exact', resolverExact(six, native, 'GEN', '1', '6'), 'native text matches the shipped native segment');
  const realSource = resolver.resolveSource({ book: 'GEN', chapter: '1', kind: 'verse', label: '1' });
  out('resolver-real-map-source-unambiguous', realSource.ambiguous === false && !!realSource.entry && !!realSource.group);
  out('resolver-unresolved-genesis2', resolver.resolveTarget('GEN', 2, 1).state === 'alignment-unavailable');
  out('resolver-unresolved-psalms', resolver.resolveTarget('PSA', 23, 1).state === 'alignment-unavailable');
  out('resolver-ecc-missing-edition', resolver.resolveTarget('ECC', 1, 1).state === 'missing-edition');
  out('resolver-nt-missing-edition', resolver.resolveTarget('MAT', 5, 1).state === 'missing-edition');
}

function resolverExact(cell, nativeData, bookId, chapter, label) {
  const book = nativeData.books.find((b) => b.id === bookId);
  const ch = book.chapters.find((c) => String(c.n) === String(chapter));
  const seg = ch.segments.find((s) => s.kind === 'verse' && s.l === label);
  return cell.members[0].text === seg.t && cell.members[1].text !== null;
}

shapeChecks();
validatorChecks();
mutationChecks();
syntheticShapeChecks();
resolverChecks();
resolverSafetyChecks();

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`test-verse-mapping: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
