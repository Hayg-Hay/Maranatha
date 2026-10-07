// Standalone verse-mapping validator (Stage 2a).
//
//   node build/validate-verse-mapping.mjs                    # proposal mode
//   node build/validate-verse-mapping.mjs --require-verified # human gate
//   node build/validate-verse-mapping.mjs --file <mapping.json>
//
// It validates structure, references, groups, provenance, binding hashes AND
// the evidence itself: the referenced local ledger must be bound and present,
// every provenance.rowId must be an authoritative row, and each row's source
// ref, complete target set and text hashes must match the entry and the bound
// source/comparison corpora. It NEVER validates by equal counts, and it never
// elevates a proposal: with --require-verified it fails unless explicit human
// approval data is present on every scope (document, group, entry).
//
// Exit 0 on pass, 1 on any error.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseCanon, sourceKey, targetKey } from './import-lxx-alignment.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const textHash = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

// Canonical artifact hash. The generated metadata binds every artifact with the
// `sha256-lf` rule: SHA-256 over the file text after CRLF is normalized to LF.
// This keeps a Windows Git checkout (CRLF working tree) and a fresh Linux clone
// (LF) verifying identically. `sha256-raw` is accepted for explicit opt-in.
function fileHash(file, method) {
  const text = fs.readFileSync(file, 'utf8');
  const data = method === 'sha256-raw' ? text : text.replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

const corpusCache = new Map();
function loadJsonCached(file) {
  if (corpusCache.has(file)) return corpusCache.get(file);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  corpusCache.set(file, value);
  return value;
}

// Native Greek segment text, looked up by the actual native kind/label/index.
function nativeSegmentText(nativeData, ref) {
  const book = (nativeData.books || []).find((b) => b.id === ref.book);
  if (!book) return null;
  const chapter = (book.chapters || []).find((c) => String(c.n) === String(ref.chapter));
  if (!chapter) return null;
  if (ref.kind === 'verse') {
    const seg = (chapter.segments || []).find((s) => s.kind === 'verse' && String(s.l) === String(ref.label));
    return seg ? seg.t : null;
  }
  const seg = (chapter.segments || [])[ref.segmentIndex];
  return seg && seg.kind === 'unnumbered' ? seg.t : null;
}

// Canon-numbered corpus text (WEB/KJV/OSHB shape: books[id][chapter-1][verse-1]).
function canonicalCorpusText(corpusData, target) {
  const book = corpusData.books ? corpusData.books[target.book] : null;
  if (!Array.isArray(book)) return null;
  const chapter = book[target.chapter - 1];
  if (!Array.isArray(chapter)) return null;
  const text = chapter[target.verse - 1];
  return typeof text === 'string' ? text : null;
}

const refForKey = (key) => {
  const [book, chapter, verse] = key.split('|');
  return { book, chapter: Number(chapter), verse: Number(verse) };
};

export function validateMapping(mapping, options = {}) {
  const {
    canon = parseCanon(),
    native = null,
    ledger: presetLedger = null,
    requireVerified = false,
    checkBindings = true,
    root: base = root,
  } = options;

  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);
  const warn = (msg) => warnings.push(msg);

  if (!isObject(mapping)) return { ok: false, errors: ['mapping is not an object'], warnings };

  const SUPPORTED_STATUS = new Set(['proposal', 'verified']);

  // ---- top-level review / status --------------------------------------
  const review = mapping.review;
  if (!isObject(review)) err('missing review object');
  const humanApprovalValid = isObject(review?.humanApproval)
    && typeof review.humanApproval.approvedBy === 'string' && review.humanApproval.approvedBy.trim() !== ''
    && typeof review.humanApproval.date === 'string' && review.humanApproval.date.trim() !== '';
  const humanApproved = humanApprovalValid;

  if (!SUPPORTED_STATUS.has(mapping.status)) {
    err(`mapping.status "${mapping.status}" is unsupported (expected "proposal" or "verified")`);
  }
  if (mapping.status === 'verified' && !humanApprovalValid) {
    err('mapping.status is "verified" but review.humanApproval lacks a valid approvedBy/date');
  }

  if (requireVerified) {
    if (!isObject(review?.humanApproval)) {
      err('--require-verified: review.humanApproval is null; this mapping is still a proposal and is not human-approved');
    } else if (!humanApprovalValid) {
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
      if (entry.status === 'verified' && !humanApprovalValid) {
        err(`${where}: entry.status is "verified" but the mapping has no valid human approval`);
      }
      if (entry.status === 'verified' && mapping.status !== 'verified') {
        err(`${where}: entry is verified but the mapping document is not "verified"`);
      }
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
      if (group.status === 'verified' && !humanApprovalValid) {
        err(`${where}: group.status is "verified" but the mapping has no valid human approval`);
      }
      if (group.status === 'verified' && mapping.status !== 'verified') {
        err(`${where}: group is verified but the mapping document is not "verified"`);
      }
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
  if (checkBindings && !isObject(mapping.bindings)) err('mapping.bindings missing');
  if (checkBindings && isObject(mapping.bindings)) {
    for (const [name, binding] of Object.entries(mapping.bindings)) {
      if (!isObject(binding) || !binding.path || !binding.sha256) { err(`binding ${name}: missing path/sha256`); continue; }
      const file = path.join(base, binding.path);
      if (!fs.existsSync(file)) { err(`binding ${name}: file ${binding.path} not found`); continue; }
      const method = binding.hash || 'sha256-lf';
      const actual = fileHash(file, method);
      if (actual !== binding.sha256) err(`binding ${name}: hash mismatch for ${binding.path} (mapped ${binding.sha256}, actual ${actual})`);
    }
  }

  // ---- declared schemes -------------------------------------------------
  if (isObject(mapping) && (mapping.sourceScheme !== undefined || mapping.targetScheme !== undefined)) {
    if (typeof mapping.sourceScheme !== 'string' || !mapping.sourceScheme) err('mapping.sourceScheme must be a declared scheme id');
    if (typeof mapping.targetScheme !== 'string' || !mapping.targetScheme) err('mapping.targetScheme must be a declared scheme id');
    if (checkBindings && typeof mapping.schemes === 'string') {
      const schemesFile = path.join(base, mapping.schemes);
      if (!fs.existsSync(schemesFile)) {
        err(`mapping.schemes file ${mapping.schemes} not found`);
      } else {
        let registry = null;
        try { registry = loadJsonCached(schemesFile); } catch (error) { err(`mapping.schemes is not valid JSON: ${error.message}`); }
        if (registry) {
          const ids = new Set((registry.schemes || []).map((s) => s?.id));
          if (!ids.has(mapping.sourceScheme)) err(`mapping.sourceScheme "${mapping.sourceScheme}" is not a declared scheme`);
          if (!ids.has(mapping.targetScheme)) err(`mapping.targetScheme "${mapping.targetScheme}" is not a declared scheme`);
        }
      }
    }
  }

  // ---- evidence binding -------------------------------------------------
  // Every referenced ledger must be present and hash-bound. An entry's rowId
  // must resolve to an authoritative row in the ledger its provenance names;
  // the row's source ref and complete target set must match the entry; and each
  // declared text hash must match BOTH the row's recorded text and the bound
  // source/comparison corpora. New rows carry explicit per-target comparison
  // evidence (target ref + corpus string/hash per language); legacy rows carry
  // one comparison hash per language matched to exactly one target by content.
  // Target locations are proven by content, never inferred from verse numbers.
  const ledgersByPath = new Map();
  if (presetLedger) {
    const rel = entries && isObject(entries[0]?.provenance) ? entries[0].provenance.ledger : 'preset';
    ledgersByPath.set(rel, presetLedger);
  }
  if (checkBindings && isObject(mapping.bindings)) {
    const ledgerBindings = Object.entries(mapping.bindings)
      .filter(([name, b]) => isObject(b) && (b.role === 'ledger' || /^ledger[0-9]*$/i.test(name)));
    if (!ledgerBindings.length) err('bindings: no ledger binding found');
    for (const [name, binding] of ledgerBindings) {
      if (typeof binding.path !== 'string' || !binding.path) { err(`binding ${name}: ledger path missing`); continue; }
      const file = path.join(base, binding.path);
      if (!fs.existsSync(file)) { err(`ledger ${binding.path} not found`); continue; }
      try { ledgersByPath.set(binding.path, JSON.parse(fs.readFileSync(file, 'utf8'))); }
      catch (error) { err(`ledger ${binding.path} is not valid JSON: ${error.message}`); }
    }
  }

  if (ledgersByPath.size && entries && groups) {
    const rowByLedger = new Map();
    for (const [rel, data] of ledgersByPath) {
      const rows = Array.isArray(data.rows) ? data.rows : [];
      rowByLedger.set(rel, new Map(rows.filter(isObject).map((r) => [r.id, r])));
    }
    const corpusPaths = {
      greek: mapping.bindings?.lxx?.path,
      web: mapping.bindings?.web?.path,
      he: mapping.bindings?.he?.path,
      kjv: mapping.bindings?.kjv?.path,
    };
    const corpora = {};
    for (const [lang, rel] of Object.entries(corpusPaths)) {
      if (typeof rel !== 'string') { err(`evidence binding: ${lang} corpus binding missing`); continue; }
      const file = path.join(base, rel);
      if (!fs.existsSync(file)) { err(`evidence binding: ${lang} corpus ${rel} not found`); continue; }
      try { corpora[lang] = loadJsonCached(file); } catch (error) { err(`evidence binding: ${lang} corpus ${rel} is not valid JSON`); }
    }

    // coverage[groupId][lang] = Map(targetKey -> count of member rows matching)
    const coverage = new Map();
    const noteCoverage = (groupId, lang, tk) => {
      if (!coverage.has(groupId)) coverage.set(groupId, {});
      const perGroup = coverage.get(groupId);
      if (!perGroup[lang]) perGroup[lang] = new Map();
      perGroup[lang].set(tk, (perGroup[lang].get(tk) || 0) + 1);
    };

    for (const entry of entries) {
      if (!isObject(entry) || !isObject(entry.provenance)) continue;
      const where = `entry ${entry.provenance.rowId}`;
      const ledgerRel = entry.provenance.ledger;
      const rowById = ledgerRel && rowByLedger.has(ledgerRel)
        ? rowByLedger.get(ledgerRel)
        : (rowByLedger.size === 1 ? rowByLedger.values().next().value : null);
      if (!rowById) { err(`${where}: provenance.ledger "${ledgerRel}" is not a bound ledger`); continue; }
      const row = rowById.get(entry.provenance.rowId);
      if (!row) { err(`${where}: provenance.rowId "${entry.provenance.rowId}" is not an authoritative ledger row`); continue; }

      // Source ref must equal the authoritative row's source ref.
      const from = row.from || {};
      const src = entry.source || {};
      const sameSource = src.book === from.book && String(src.chapter) === String(from.chapter) && src.kind === from.kind
        && (from.kind === 'unnumbered' ? Number(src.segmentIndex) === Number(from.segmentIndex) : String(src.label) === String(from.label));
      if (!sameSource) err(`${where}: entry source ref does not match the ledger row's from ref`);

      // Complete target set must equal the authoritative row's to set.
      const entryTo = new Set((entry.to || []).map((t) => (isObject(t) ? targetKey(t) : '?')));
      const rowTo = new Set((row.to || []).filter(isObject).map((t) => targetKey(t)));
      if ([...entryTo].sort().join(',') !== [...rowTo].sort().join(',')) {
        err(`${where}: entry to[] does not match the ledger row's target set`);
      }

      const hashes = row.textHashes || {};
      const texts = row.texts || {};

      // Greek: hash must match both the row text and the bound native source.
      const greekHash = hashes.greek;
      if (typeof greekHash !== 'string') {
        err(`${where}: ledger row lacks a greek text hash`);
      } else {
        if (typeof texts.greek !== 'string' || textHash(texts.greek) !== greekHash) {
          err(`${where}: ledger row text does not match its own greek hash`);
        }
        const entryGreek = entry.provenance.textHashes?.greek;
        if (entryGreek !== greekHash) err(`${where}: provenance greek hash differs from the authoritative row`);
        if (corpora.greek) {
          const text = nativeSegmentText(corpora.greek, from);
          if (text === null) err(`${where}: source text not found in the bound native corpus`);
          else if (textHash(text) !== greekHash) err(`${where}: greek hash does not match the bound source corpus`);
        }
      }

      const targetEvidence = Array.isArray(entry.provenance.targetEvidence) ? entry.provenance.targetEvidence : null;
      if (targetEvidence) {
        // Per-target comparison evidence: each target names its own actual
        // corpus string/hash. Every row target must be covered exactly once.
        const rowTargets = Array.isArray(row.targets) ? row.targets : [];
        const rowEvidenceByKey = new Map(rowTargets.filter(isObject).map((t) => [targetKey(t.to), t]));
        const seen = new Set();
        for (const ev of targetEvidence) {
          if (!isObject(ev) || !isObject(ev.to)) { err(`${where}: malformed target evidence`); continue; }
          const tk = targetKey(ev.to);
          if (!rowTo.has(tk)) { err(`${where}: target evidence ${tk} is not in the row target set`); continue; }
          if (seen.has(tk)) { err(`${where}: duplicate target evidence ${tk}`); continue; }
          seen.add(tk);
          const authoritative = rowEvidenceByKey.get(tk);
          if (!authoritative) err(`${where}: ledger row lacks target evidence for ${tk}`);
          for (const lang of ['web', 'kjv', 'he']) {
            const h = ev.textHashes?.[lang];
            if (typeof h !== 'string' || !/^[0-9a-f]{64}$/.test(h)) { err(`${where}: target evidence ${tk} lacks a ${lang} hash`); continue; }
            if (authoritative && authoritative.textHashes?.[lang] !== h) err(`${where}: target evidence ${tk} ${lang} hash differs from the ledger row`);
            if (authoritative && typeof authoritative.texts?.[lang] === 'string' && textHash(authoritative.texts[lang]) !== h) {
              err(`${where}: ledger row ${tk} text does not match its ${lang} hash`);
            }
            const corpus = corpora[lang];
            if (corpus) {
              const text = canonicalCorpusText(corpus, refForKey(tk));
              if (text === null) err(`${where}: target ${tk} not found in the bound ${lang} corpus`);
              else if (textHash(text) !== h) err(`${where}: target ${tk} ${lang} hash does not match the bound corpus`);
            }
            noteCoverage(entry.groupId, lang, tk);
          }
        }
        for (const tk of rowTo) if (!seen.has(tk)) err(`${where}: missing target evidence for ${tk}`);
      } else {
        // Legacy WEB / KJV / OSHB: hash must match the row text and exactly one
        // bound target text; the matching target is located by content.
        for (const lang of ['web', 'kjv', 'he']) {
          const declaredHash = hashes[lang];
          if (typeof declaredHash !== 'string') { err(`${where}: ledger row lacks a ${lang} text hash`); continue; }
          if (typeof texts[lang] !== 'string' || textHash(texts[lang]) !== declaredHash) {
            err(`${where}: ledger row text does not match its own ${lang} hash`);
          }
          if (entry.provenance.textHashes?.[lang] !== declaredHash) {
            err(`${where}: provenance ${lang} hash differs from the authoritative row`);
          }
          const corpus = corpora[lang];
          if (!corpus) continue;
          const matches = [...rowTo].filter((tk) => {
            const text = canonicalCorpusText(corpus, refForKey(tk));
            return typeof text === 'string' && textHash(text) === declaredHash;
          });
          if (matches.length === 0) err(`${where}: ${lang} hash does not match any authoritative target text`);
          else if (matches.length > 1) err(`${where}: ${lang} hash matches multiple targets ambiguously`);
          else noteCoverage(entry.groupId, lang, matches[0]);
        }
      }
    }

    // Every target of every group must be jointly substantiated per language.
    for (const group of groups) {
      if (!isObject(group) || typeof group.id !== 'string') continue;
      const perGroup = coverage.get(group.id);
      const targetKeys = (group.targets || []).filter(isObject).map((t) => targetKey(t));
      for (const lang of ['greek', 'web', 'kjv', 'he']) {
        if (lang === 'greek') continue; // greek binds to each row's own from ref
        for (const tk of targetKeys) {
          const count = perGroup?.[lang]?.get(tk) || 0;
          if (count === 0) err(`group ${group.id}: target ${tk} has no ${lang} evidence from any member row`);
          else if (count > 1) err(`group ${group.id}: target ${tk} is substantiated more than once for ${lang}`);
        }
      }
    }
  }

  // ---- document/group/entry consistency -------------------------------
  if (mapping.status === 'verified' && humanApprovalValid) {
    for (const group of groups || []) {
      if (isObject(group) && group.status !== 'verified') err(`group ${group.id}: mapping is verified but this group is not`);
    }
    for (const entry of entries || []) {
      if (isObject(entry) && entry.provenance?.rowId && entry.status !== 'verified') {
        err(`entry ${entry.provenance.rowId}: mapping is verified but this entry is not`);
      }
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
