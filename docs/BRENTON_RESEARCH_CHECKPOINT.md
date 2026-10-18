# Brenton import research checkpoint

Saved 2026-10-08 at the user's request to stop at a checkpoint for sleep.
Read BRENTON_CODEX_HANDOFF.md, then BRENTON_IMPORT_RESEARCH.md first.
The Canon requirement in the handoff supersedes the earlier standalone-first
suggestion in the initial research memo.

## Workspace and workflow

Observed branch: `codex/lxx-stage2c`, with uncommitted Greek application,
metadata, tests and batch work. No branch switch, staging, commit, application
edit, merge, push or deletion was performed. Existing modified and untracked
files were left untouched. Only new Brenton research cache and documents were
written. Do not start implementation in this shared checkout until the Greek
batch is finished and the user coordinates the transition.

Codex researches, architects and independently verifies. The user manually
runs DeepSeek through opencode, in the original project folder, on a dedicated
feature branch. Do not launch opencode. No merge, push or deletion without
explicit approval. The draft prompt is preparation, not permission to begin.

## Pinned source

- Edition: eBible `eng-Brenton`, original Brenton English Septuagint,
  publisher-attributed to Brenton, 1851; not Updated Brenton or LXX2012.
- Archive: https://ebible.org/Scriptures/eng-Brenton_usfm.zip
- Acquired 2026-10-08, SHA-256:
  `03e4fc1f728326e8924c40869eaeedbf3a2c19b4b134896a1c3b6f00f227db23`.
- Declaration: https://ebible.org/eng-Brenton/copyright.htm states public domain.
  Observed HTML generation date: 3 Oct 2026; source date: 12 Dec 2025.
  The details page separately says last updated 2024-09-17. These dates are
  publisher metadata, not interchangeable archive provenance dates.
- Details: https://ebible.org/bible/details.php?id=eng-Brenton
- Cache: `build/cache/brenton-research/eng-Brenton_usfm.zip`, extracted `usfm/`,
  downloaded `copyright.htm`, `inventory.mjs` and `inventory.json`.
  This directory is ignored; these artifacts are local, not committed sources.
- No full digital equality with BibleHub or historical print fidelity certified.
  Import must identify eBible's digital edition honestly.

## Mechanical inventory (not correspondence validation)

60 USFM files: 53 with numbered Scripture and 7 editorial files.
Scripture files contain 1,117 chapter markers and 29,005 verse markers.
These are raw marker counts, not unique canonical passages: duplicate coverage,
lettered labels and structural distinctions still need analysis.

Scripture IDs:
`GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH JOB PSA
PRO ECC SNG ISA JER LAM EZK HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL
TOB JDT ESG WIS SIR BAR LJE SUS BEL 1MA 2MA 1ES MAN 3MA 4MA DAG`.

Editorial IDs: `FRT INT XXB XXC BAK OTH XXA`. BAK has a chapter marker but no
verse markers; never treat it as Scripture. XXA is a publisher table of
Jeremiah chapter/verse order and needs focused inspection next.

Across Scripture files, 138 chapters do not have the simple contiguous labels
1..N. Comparing raw counts only at same-ID/same-number canon chapters produces
362 mismatch chapters; ESG/DAG and other non-canon IDs are not included in
that comparison. Equal counts do not certify equal passage boundaries.
There are 2,596 Scripture footnotes plus 4 editorial footnotes, 150 archive
cross-reference markers, and 73 `vp` printed-verse-label markers.
The marker inventory also includes `add`, `sc`, `it`, `d`, paragraph markers
and editorial/table markers. A parser must preserve their roles, not simply
strip every backslash token. Full parse/fidelity verification is still pending.

## Concrete traps already established

- GEN 1:6 includes "and it was so"; GEN 1:7 does not. Matching chapter counts
  do not mean exact WEB boundaries. GEN 2:25 and 3:1 are separate in this source.
- GEN 31 labels include `50a` followed by `52`, with no `51` marker.
  GEN 35 has no `21` marker. Do not pack verses by ordinal index or repair labels.
- PSA has 151 chapters, 2,535 verse markers. Psalm 9:1 is the superscription,
  9:2 the thanksgiving. Psalm 151:1 contains a superscription and main wording.
  Preserve numbered superscriptions as source text; do not remove them by guess.
- EZR is explicitly headed "Ezra and Nehemiah", 23 chapters/669 verse markers;
  a separate NEH file has 13 chapters/389 markers. Inspect overlap and exact
  text equality before deciding representation. Do not silently duplicate or omit.
- ESG, 10 chapters/252 markers, includes `1b`, `1c`, etc. at its beginning.
  It is not a drop-in canonical EST array.
- DAG, 12 chapters/422 markers, is accompanied by SUS 64 and BEL 42 markers;
  BAR has 5 chapters/140 markers and LJE has 73 markers. Addition-component
  mappings require explicit evidence, not name/count assumptions.
- JER has 52 chapters/1,299 verse markers, including noncontiguous sequences.
  Inspect XXA, native labels and printed alternate labels before mapping.
- 1ES, MAN, 3MA, 4MA and Psalm 151 fall outside current 73-book navigation.
  Retain their source coverage in the imported archive/model and give a usable,
  honestly labelled route to read it; do not silently discard extra material.
- No NT books. Expected missing-book notices should remain normal behavior.

## Canon integration direction

Brenton must be a regular selectable translation in Canon, with classic
script-tag lazy loading and file:// support. It must not inherit routine Greek
proposal/pending-human-review labels. Source fidelity and correspondence are
separate claims.

Current app already has `versificationEntry`, `partitionByVersification` and
edition-specific disclosure blocks for Delitzsch1901. This is useful precedent,
but insufficient unchanged: it still uses numeric array lookups, groups
mismatched editions together, and applies queried numeric ranges within them.
It cannot represent lettered labels or guarantee native Psalm/Jeremiah chapter
identity. A safe Brenton-specific adapter needs explicit source refs/labels and
separate native blocks or concise unavailable/mismatch behavior for unsupported
Canon references. A disclosure alone cannot make guessed placement safe.

Do not reuse the Swete mapping as Brenton evidence. Register a distinct edition
scheme without expanding the Greek comparison coverage. Existing service-worker
runtime matching already covers `data/brenton.js`; preserve lazy data caching,
the existing data cache and all current corpus URLs. Determine shell version
from the finished Greek baseline, not today's in-progress v54.

## Resume here

1. Recheck branch/status and whether Greek Stage2c has finished; remain read-only
   on shared files until transition is coordinated.
2. Inspect XXA, all `vp` labels, EZR/NEH duplication, missing/lettered labels,
   headings and additions; cross-check a second structured format if useful.
3. Complete parser rules, source-label schema and a concrete safe Canon adapter
   design. Decide/test query and search semantics, extra-source access and
   unsupported chapter behavior. Do not equate numerical labels with mappings.
4. Finalize `BRENTON_DEEPSEEK_DRAFT.md` with evidence-backed acceptance criteria,
   exact task-owned file list, baseline/cache versions and actual branch gate.
5. User manually runs DeepSeek after coordination. Codex independently verifies
   deterministic import, full-source fidelity, Canon selection, offline behavior,
   existing views and desktop/mobile presentation before any release approval.

Checkpoint is research only. No Brenton importer or application integration has
been implemented or tested yet. No action or answer is needed before sleep.
