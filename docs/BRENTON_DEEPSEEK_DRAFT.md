# Manual DeepSeek Brenton task — draft, not ready to run

Research checkpoint: 2026-10-08. Finish the open research in
`docs/BRENTON_RESEARCH_CHECKPOINT.md` before issuing this prompt.

The eventual short manual opencode instruction will be:
"Read the finalized Brenton task prompt and implement it on the user-selected
Brenton feature branch in C:/maranatha/maranatha_new. Stop if the shared Greek
work is still active or the baseline/branch gate does not match."

## Fixed requirements for the final task

- Add original Brenton as a normal Canon translation checkbox beside WEB/KJV.
  A standalone-only pane does not satisfy the task. Default selection stays WEB.
- Original-folder implementation only, user-coordinated dedicated feature branch
  after the Greek batch; Codex verifies independently. Do not launch opencode,
  use subagents, merge, push, delete, reset, clean, stash or stage unrelated files.
- Use the pinned original eBible eng-Brenton USFM archive from the checkpoint,
  preserve acquisition metadata and public-domain declaration. Refuse changed
  hashes by default. Default import and --check are deterministic and offline;
  network acquisition is explicit and separate.
- Preserve exact source labels and ordering in an authoritative labelled model.
  Never represent GEN 31:50a, ESG lettered labels or skipped verses by ordinal
  positions. Preserve raw source and separate notes, cross-references, headings
  and added-word styling with documented text extraction/whitespace rules.
- Inventory every file, coverage overlap and editorial exclusion. Account for
  EZR/NEH explicitly; retain/read extra books and Psalm151 without extending the
  current canon by guess. No invented Scripture or silent loss/duplication.
- Canon lookup must use evidence-backed correspondences or a safe explicit
  mismatch/unavailable path. Preserve native source labels in independent blocks
  where alignment is unsupported. Do not offer a single-verse match merely
  because source and Canon numbers happen to be equal. Research must finalize
  these semantics before implementation.
- No routine Greek-pilot proposal labels on Brenton text. Distinct scheme and
  source attribution; Brenton does not acquire Greek pilot comparison coverage.
- Preserve all Greek corpora, ledgers, source importers, resolver semantics,
  native/reference views, independent Parallel panes, existing translations,
  canon skeleton and fonts. Capture regression baselines before edits.
- Use classic lazy script loading for file://. Preserve runtime offline caching;
  bump shell version from the actual finished baseline only if shell changes.
  Do not invalidate existing translation caches for this new dataset.
- Test full imported-source fidelity with an independent parser/check, every
  source ref/label/notes inventory, duplicate and unknown-marker rejection,
  source hash failure, deterministic JSON/JS twins, unsupported mappings,
  Genesis boundary cases, Psalm9/151, Jeremiah, ESG/DAG/additions and EZR/NEH.
- Verify Canon checkbox/load/render, reference ranges, search label semantics,
  mobile layouts, missing NT, combined translations, pilot on/off, local file
  operation and service-worker offline reload. Run existing regression checks
  from the completed Greek baseline; no weakened tests or hidden failures.
- Finish with named-file local commits only after the branch gate is satisfied,
  a concise report with source/mapping coverage and unresolved limits, exact
  final commit hash, and preview instructions for the usual root index.html.
  Stop for Codex independent verification and user visual/release acceptance.

## Still to finalize before execution

Source parser specification; EZR/NEH overlap disposition; printed `vp` handling;
Canon correspondence scope and native-block query semantics; extra-book access;
concrete file list; branch/baseline gate; cache version; exact verification
commands. Do not treat this draft as an executable implementation handoff.
