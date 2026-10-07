// Standalone verse-mapping validator (Stage 2a).
//
//   node build/validate-verse-mapping.mjs                    # proposal mode
//   node build/validate-verse-mapping.mjs --require-verified # human gate
//   node build/validate-verse-mapping.mjs --file <mapping.json>
//
// It validates structure, references, groups, provenance and binding hashes.
// It NEVER validates by equal counts, and it never elevates a proposal: with
// --require-verified it fails unless explicit human approval data is present.
//
// Exit 0 on pass, 1 on any error.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseCanon, sourceKey, targetKey } from './import-lxx-alignment.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function validateMapping(mapping, options = {}) {
  const {
    canon = parseCanon(),
    native = null,
    requireVerified = false,
    checkBindings = true,
    root: base = root,
  } = options;

  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  if (!isObject(mapping)) return { ok: false, errors: ['mapping is not an object'], warnings };

  // ---- top-level review / status --------------------------------------
  const review = mapping.review;
  if (!isObject(review)) err('missing review object');
  let humanApproved = false;
  if (requireVerified) {
    humanApproved = isObject(review?.humanApproval) && !!review.humanApproval.approvedBy && !!review.humanApproval.date;
    if (!isObject(review?.humanApproval)) {
      err('--require-verified: review.humanApproval is null; this mapping is still a proposal and is not human-approved');
    } else if (!humanApproved) {
      err('--require-verified: review.humanApproval lacks approvedBy/date');
    }
    if (mapping.status !== 'verified') err(`--require-verified: mapping.status is "${mapping.status}", not "verified"`);
  }

  const groups = Array.isArray(mapping.groups) ? mapping.groups : null;
  const entries = Array.isArray(mapping.entries) ? mapping.entries : null;
  const negatives = mapping.negativeAssertions === undefined ? [] : mapping.negativeAssertions;
  if (!groups) err('mapping.groups is not an array');
  if (!entries) err('mapping.entries is not an array');
  if (!Array.isArray(negatives)) err('mapping.negativeAssertions is not an array');

  // ---- target reference validation ------------------------------------
  const canonBook = (id) => canon.books.find((b) => b.id === id) || null;
  const targetValid = (t, where) => {
    if (!isObject(t)) { err(`${where}: target is not an object`); return false; }
    if (typeof t.book !== 'string' || !t.book) { err(`${where}: target.book missing`); return false; }
    if (!Number.isInteger(t.chapter) || t.chapter < 1) { err(`${where}: target.chapter must be a positive integer`); return false; }
    if (!Number.isInteger(t.verse) || t.verse < 1) { err(`${where}: target.verse must be a positive integer`); return false; }
    const book = canonBook(t.book);
    if (!book) { err(`${where}: unknown target book ${t.book}`); return false; }
    if (t.chapter > book.chapters.length) { err(`${where}: chapter ${t.chapter} does not exist in ${t.book}`); return false; }
    const count = book.chapters[t.chapter - 1];
    if (t.verse > count) { err(`${where}: ${t.book} ${t.chapter} has ${count} verses, not ${t.verse}`); return false; }
    return true;
  };

  // ---- native source resolution ---------------------------------------
  const nativeBook = native ? (id) => (native.books || []).find((b) => b.id === id) || null : null;
  const sourceValid = (s, where) => {
    if (!isObject(s)) { err(`${where}: source is not an object`); return false; }
    if (typeof s.book !== 'string' || !s.book) { err(`${where}: source.book missing`); return false; }
    if (typeof s.chapter !== 'string' || !s.chapter) { err(`${where}: source.chapter must be a string`); return false; }
    if (s.kind !== 'verse' && s.kind !== 'unnumbered') { err(`${where}: source.kind must be "verse" or "unnumbered"`); return false; }
    if (s.kind === 'verse') {
      if (typeof s.label !== 'string' || !/^\d+$/.test(s.label)) { err(`${where}: verse source.label must be a numeric string`); return false; }
    } else if (!Number.isInteger(s.segmentIndex) || s.segmentIndex < 0) {
      err(`${where}: unnumbered source.segmentIndex must be a non-negative integer`); return false;
    }
    if (!nativeBook) return true; // structural-only mode
    const book = nativeBook(s.book);
    if (!book) { err(`${where}: source book ${s.book} is not in the native dataset`); return false; }
    const chapter = (book.chapters || []).find((c) => String(c.n) === String(s.chapter));
    if (!chapter) { err(`${where}: source chapter ${s.chapter} is not in ${s.book}`); return false; }
    if (s.kind === 'verse') {
      if (!chapter.segments.some((seg) => seg.kind === 'verse' && seg.l === s.label)) {
        err(`${where}: source ${s.book} ${s.chapter}:${s.label} does not resolve to a native verse segment`);
        return false;
      }
    } else {
      const seg = chapter.segments[s.segmentIndex];
      if (!seg || seg.kind !== 'unnumbered') {
        err(`${where}: source ${s.book} ${s.chapter} unnumbered segment ${s.segmentIndex} does not resolve`);
        return false;
      }
    }
    return true;
  };

  // ---- entries ----------------------------------------------------------
  const entryBySource = new Map();
  if (entries) {
    entries.forEach((entry, i) => {
      const where = `entry ${i} (${entry?.source?.book} ${entry?.source?.chapter}:${entry?.source?.label ?? entry?.source?.segmentIndex})`;
      if (!isObject(entry)) { err(`entry ${i} is not an object`); return; }
      sourceValid(entry.source, where);
      const skey = isObject(entry.source) ? sourceKey(entry.source) : `#${i}`;
      if (entryBySource.has(skey)) err(`${where}: duplicate source reference ${skey}`);
      entryBySource.set(skey, entry);

      if (typeof entry.groupId !== 'string' || !entry.groupId) err(`${where}: missing groupId`);
      if (!Array.isArray(entry.to)) { err(`${where}: to must be an array`); }
      else {
        const seen = new Set();
        for (const t of entry.to) {
          if (targetValid(t, where)) {
            const tk = targetKey(t);
            if (seen.has(tk)) err(`${where}: duplicate target ${tk}`);
            seen.add(tk);
          }
        }
        if (entry.to.length === 0) {
          const p = entry.provenance;
          if (!isObject(p) || !p.noCounterpart || !p.attestation) {
            err(`${where}: empty to[] claims no counterpart without attestation/provenance`);
          }
        }
      }
      const p = entry.provenance;
      if (!isObject(p)) err(`${where}: missing provenance`);
      else {
        if (typeof p.ledger !== 'string' || !p.ledger) err(`${where}: provenance.ledger missing`);
        if (typeof p.rowId !== 'string' || !p.rowId) err(`${where}: provenance.rowId missing`);
        const hashes = p.textHashes;
        const hashOk = isObject(hashes) && Object.values(hashes).some((v) => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v));
        if (!hashOk) err(`${where}: provenance lacks bound text hashes`);
      }
      if (entry.status !== 'proposal' && entry.status !== 'verified') err(`${where}: status must be proposal or verified`);
      if (requireVerified && humanApproved && entry.status !== 'verified') err(`${where}: not verified`);
    });
  }

  // ---- groups -----------------------------------------------------------
  const groupById = new Map();
  const targetOwner = new Map();
  if (groups) {
    groups.forEach((group, i) => {
      const where = `group ${i} (${group?.id})`;
      if (!isObject(group)) { err(`group ${i} is not an object`); return; }
      if (typeof group.id !== 'string' || !group.id) { err(`${where}: missing id`); return; }
      if (groupById.has(group.id)) err(`${where}: duplicate group id`);
      groupById.set(group.id, group);
      if (!Array.isArray(group.sources) || !group.sources.length) err(`${where}: sources must be a non-empty array`);
      else group.sources.forEach((s, j) => sourceValid(s, `${where} sources[${j}]`));
      if (!Array.isArray(group.targets) || !group.targets.length) err(`${where}: targets must be a non-empty array`);
      else group.targets.forEach((t, j) => { if (targetValid(t, `${where} targets[${j}]`)) targetOwner.set(targetKey(t), (targetOwner.get(targetKey(t)) || new Set()).add(group.id)); });
      if (!Array.isArray(group.evidence) || !group.evidence.length) err(`${where}: evidence must be a non-empty array`);
      if (group.status !== 'proposal' && group.status !== 'verified') err(`${where}: status must be proposal or verified`);
      if (requireVerified && humanApproved && group.status !== 'verified') err(`${where}: not verified`);
      const collective = group.sources?.length > 1 || group.targets?.length > 1;
      if (group.collective !== undefined && group.collective !== collective) warn(`${where}: collective flag does not match membership`);
    });
  }

  // A target claimed by two different groups is an unresolved conflict.
  for (const [tk, owners] of targetOwner) {
    if (owners.size > 1) err(`target ${tk} is claimed by conflicting groups: ${[...owners].join(', ')}`);
  }

  // Group membership must equal the entries that name it, and every member
  // entry must name the group's complete target set.
  if (groups && entries) {
    for (const group of groups) {
      if (!isObject(group) || typeof group.id !== 'string') continue;
      const members = entries.filter((e) => e?.groupId === group.id);
      if (!members.length) { err(`group ${group.id}: no entries reference it`); continue; }
      const memberSources = new Set(members.map((e) => (isObject(e.source) ? sourceKey(e.source) : '?')));
      const declaredSources = new Set((group.sources || []).map((s) => (isObject(s) ? sourceKey(s) : '?')));
      if ([...memberSources].sort().join(',') !== [...declaredSources].sort().join(',')) {
        err(`group ${group.id}: sources[] does not match its entries`);
      }
      const groupTargets = new Set((group.targets || []).map((t) => (isObject(t) ? targetKey(t) : '?')));
      for (const member of members) {
        const toSet = new Set((member.to || []).map((t) => (isObject(t) ? targetKey(t) : '?')));
        if ([...toSet].sort().join(',') !== [...groupTargets].sort().join(',')) {
          err(`group ${group.id}: entry ${member.provenance?.rowId || '?'} does not name the complete target set`);
        }
      }
    }
    // Any entry whose groupId is unknown is dangling.
    for (const entry of entries) {
      if (isObject(entry) && typeof entry.groupId === 'string' && !groupById.has(entry.groupId)) {
        err(`entry ${entry.provenance?.rowId || '?'}: dangling groupId ${entry.groupId}`);
      }
    }
  }

  // ---- negative assertions ---------------------------------------------
  const negativeKeys = new Set();
  negatives.forEach((neg, i) => {
    const where = `negative assertion ${i}`;
    if (!isObject(neg)) { err(`${where}: not an object`); return; }
    if (targetValid(neg.target, where)) {
      const tk = targetKey(neg.target);
      if (negativeKeys.has(tk)) err(`${where}: duplicate negative target ${tk}`);
      negativeKeys.add(tk);
      if (groupById && [...groupById.values()].some((g) => (g.targets || []).some((t) => isObject(t) && targetKey(t) === tk))) {
        err(`${where}: target ${tk} is both mapped and negatively asserted`);
      }
    }
    if (typeof neg.attestation !== 'string' || !neg.attestation) err(`${where}: unattested negative assertion (no attestation)`);
    if (!isObject(neg.provenance) || !neg.provenance.source) err(`${where}: negative assertion lacks provenance.source`);
  });

  // ---- bindings ---------------------------------------------------------
  if (checkBindings && isObject(mapping.bindings)) {
    for (const [name, binding] of Object.entries(mapping.bindings)) {
      if (!isObject(binding) || !binding.path || !binding.sha256) { err(`binding ${name}: missing path/sha256`); continue; }
      const file = path.join(base, binding.path);
      if (!fs.existsSync(file)) { err(`binding ${name}: file ${binding.path} not found`); continue; }
      const actual = sha256(file);
      if (actual !== binding.sha256) err(`binding ${name}: hash mismatch for ${binding.path} (mapped ${binding.sha256}, actual ${actual})`);
    }
  }

  const stats = {
    groups: groups ? groups.length : 0,
    entries: entries ? entries.length : 0,
    sources: new Set((entries || []).map((e) => (isObject(e?.source) ? sourceKey(e.source) : '?'))).size,
    targets: new Set(entries ? entries.flatMap((e) => (e?.to || []).map((t) => targetKey(t))) : []).size,
    negativeAssertions: negatives.length,
  };

  return { ok: errors.length === 0, errors, warnings, stats };
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const fileArg = args.indexOf('--file');
  const mappingPath = fileArg !== -1 ? args[fileArg + 1] : path.join(root, 'data/lxx-swete-alignment.json');
  const requireVerified = args.includes('--require-verified');
  const native = loadJson(path.join(root, 'data/lxx-swete.json'));
  const mapping = loadJson(mappingPath);
  const result = validateMapping(mapping, { native, requireVerified });
  for (const w of result.warnings) console.log(`WARN  ${w}`);
  for (const e of result.errors) console.log(`ERROR ${e}`);
  console.log(`validate-verse-mapping: ${result.ok ? 'PASS' : 'FAIL'} (${requireVerified ? 'verified' : 'proposal'} mode) ` +
    `groups=${result.stats.groups} entries=${result.stats.entries} sources=${result.stats.sources} targets=${result.stats.targets} negative=${result.stats.negativeAssertions}`);
  if (!result.ok) process.exitCode = 1;
}
