# Stage 2a — mapping foundation and Genesis 1 research pilot

Approved execution: user said "then let us begin" after the Stage 2 explanation.
Base: d82d93b. Branch: codex/lxx-stage2a. No merge/push/deletion approval.
Architect/proposal author: Codex. Implementer and second textual reviewer: DeepSeek.

## Scope and epistemic status

Deliver an opt-in Greek column in Canon comparison, a reusable mapping resolver,
a separate mapping validator, per-translation scheme declarations and a Genesis1
pilot. Native LXX and independent Parallel retain their current behavior.
All 31 Greek/WEB/KJV/OSHB verses were compared by content. This is AI proposal
adjudication, not a claim of human or scholarly verification. Every pilot entry
remains `proposal`, with human approval null. The handoff requires human textual
adjudication before these proposals may be called verified. User UI approval
alone must not automatically elevate mapping confidence.

Input ledger: build/reviews/lxx-genesis1-evidence.json and lxx-genesis1-review.md.
Ledger has exact four-language strings, corpus/verse hashes, 31 rationales,
explicit differences and authorship. DeepSeek independently checks those texts
before coding and records agreement/disagreement. Do not silently alter the
architect's ledger or claim another reviewer/human approval that did not occur.

## Passage groups, not word equality

There are 30 groups covering 31 source and 31 target verse references:
29 singleton correspondences, plus a collective source6-7 <-> target6-7 group.
Greek6 closes with "and it was so"; WEB/KJV/OSHB place it at7. The group must
never be presented as exact source6=target6 and source7=target7 boundaries.
Greek8/9/14/20/28 have wording/additional-clause differences listed in the ledger;
brackets, section signs, source spellings and duplicated words stay unchanged.
The pilot concerns corresponding passages, not a word-for-word gloss or repair.

## Mapping document

Use explicit source-ref -> to[] entries with group IDs and per-entry provenance.
Source ref: {book, chapter:string, kind:'verse', label:string}. Support future
unnumbered refs via {book, chapter, kind:'unnumbered', segmentIndex:integer}; never
invent verse0 or manufacture source chapter labels. Source refs resolve against
actual native segments, never Canon counts. Target ref: {book, chapter:integer,
verse:integer}, validated against canon.js and baseline WEB data.
Groups carry sources[], targets[], evidence IDs, notes and proposal status.
Each source member's entry names its group's complete target set; edges of a
group are collective correspondence, not claims of exact individual equivalence.
Entries are unique by source ref. Missing entry means unresolved. Explicit to[]
means source has no target counterpart only with attestation/provenance.
For canonical cells lacking a source counterpart, use separate explicit target
negative assertions; inverse lookup absence never proves no counterpart.
No real negative claims are published in this pilot; prove them with fixtures.

Bind maps to exact source/target artifact hashes, pinned source identity and
evidence. Metadata declarations name the existing editions' own schemes without
claiming universal identity. WEB/KJV/OSHB comparison coverage is limited to the
Genesis1 proposals. Other editions remain unreviewed/legacy-indexed; show a clear
scope note when compared with the Greek pilot. Do not change existing corpora.

## Resolver and UI

Implement a plain classic-script resolver plus a virtual `lxx-aligned` descriptor.
Resolve Greek cells from original native text/labels/flags; do not produce a
reordered Greek corpus or add a fabricated books[] dataset to translation globals.
Cell states distinguish proposed/verified correspondence, alignment-unavailable,
explicit no-corresponding-verse, missing source text and missing edition/book.
No ordinal fallback, inferred identity, reference guessing or heuristic promotion.

Checkbox label: LXX alignment pilot (Genesis1); off by default, Canon only.
Visible research/proposal notice; readable Greek and preserved source references,
flags/notices/attribution. User presentation decision, 2026-10-07, supersedes the
initial repeated-group layout: show source6 once at target6 and source7 once at
target7, with a small notice explaining the closing phrase's different placement.
A single-verse7 query shows source7, with that notice. The collective proposal
remains in metadata; this display choice is not a verified boundary-identity
claim and is not a general ordinal-matching fallback for other passages.
Outside covered refs render "Alignment not available" with native reading still
accessible. Missing source books have a distinct edition-unavailable message.
Do not add the virtual column to Parallel translation choices or text search.
Per-verse compare must either use the resolver or explicitly omit the virtual
descriptor; never call legacy index lookup on its native array. The existing
Canonical parser/chapter extents must ignore the virtual/native shapes.
When pilot is unchecked, ten existing Canon renderings stay byte-identical.

## Files, loading, cache and licensing

Suggested: verse-mapping.js (classic resolver); data/versification-schemes.json
and .js; data/lxx-swete-alignment.json and .js; build/import-lxx-alignment.mjs
(compile metadata only), build/validate-verse-mapping.mjs, new tests/reports.
Load metadata and original Greek through script tags, no local fetch/CDN/modules.
Lazy/versioned map and registry URLs; no translation cache wipe. Small resolver
can be shell-preloaded/precached. Ensure service-worker routes/cache versions
match loading strategy; shell v51 -> v52, all three shell assertions updated.
DATA stays v3; raw LXX URL disclosures-20261007 stays unchanged.
Map and evidence licensing/attribution must include First1KGreek CC BY-SA4.0,
OSHB CC BY4.0 and shipped WEB/KJV source declarations. New data carries license,
sources and changes metadata; preserve every existing data file byte.

## Gates

Separate mapping validator rejects malformed/ambiguous refs, dangling refs,
duplicate/conflicting entries, absent provenance, group inconsistencies, bad
binding hashes and unsupported assertions. It never validates by equal counts.
Proposal mode is explicit; verified mode requires explicit human approval data.
CLI strict verification must reject this still-proposed pilot as not human-approved.
Mutation tests cover one-to-many, many-to-one, unnumbered, no-counterpart and
unresolved states. File:// DOM checks cover opt-in/loading/unchecked regression,
group6-7, single target7, other chapters/books, flags/attribution, Hebrew RTL,
mode changes and lazy callbacks. Keep all existing checks and full npm passing.
Codex independently reruns in a fresh clone. Report <=150 lines; human mapping
adjudication, user browser/phone acceptance and merge/push remain separate gates.
