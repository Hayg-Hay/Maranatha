# Manual opencode handoff — Genesis 2–5 correspondence proposals

```text
TASK: Expand the technically accepted Genesis1 research pilot with content-based
proposals for Genesis2–5. Reuse the framework; no wholesale rewrite or autoidentity.

WORKSPACE: C:/maranatha/maranatha_new (ORIGINAL project folder).
BRANCH: codex/lxx-stage2b, based on merged main77e0787.
The user will create/select this branch in Git Bash. If on main or in an old
cache implementation clone, STOP and report it. No separate implementation clone.
All changes must appear in the original local index.html before merge/push.
No merge, push, deletion, source import or subagents. Preserve unrelated untracked
files; never git add . or clean/reset/stash them. Stage only named task files.

READ ONCE: docs/STAGE2B_GENESIS_RESEARCH.md; relevant compiler/validator/resolver
functions; current evidence schema. Do not reread the entire project history.
Never read/dump entire Scripture JSON/JS to the model. Use Node to extract one
chapter/passage at a time or compact summaries; no full logs. Cache intermediate
panels under ignored build/cache. PASS/FAIL/counts only; reports<=150 lines.

RESEARCH: inspect EVERY candidate source/target passage in Greek, WEB-C, KJV and
OSHB using the actual shipped data. Compare content/actions/clauses, not equal
counts, generic word/name/length heuristics, ordinals or remembered other witnesses.
Write a NEW batch ledger build/reviews/lxx-genesis2-5-evidence.json with actual
native refs, target refs, exact per-language evidence, hashes, verse-specific
rationales, variants and clear AI authorship. All entries stay proposal and
humanApproval=null. Preserve Genesis1 ledger/semantic review untouched.
Make the textual assessment separately from implementing the lookup. Doubtful
correspondences remain unresolved; do not force coverage or claim human approval.
Produce concise review table build/reviews/lxx-genesis2-5-review.md.

PRELIMINARY FACTS (independently inspect; detailed memo provided):
Greek2 has24 labels while WEB/KJV/OSHB have25. Greek3:1 contains both target2:25
and3:1. Greek5 has31 labels while target5 has32. Greek6:1 contains target5:32
and6:1. Never invent Greek2:25/5:32 or treat this as missing text/no counterpart.
Preserve complete source3:1/6:1, native labels, brackets, symbols and flags.
Boundary-only source6:1 may be included to cover the end of5; if proposing the
whole target6:1 too, disclose that single boundary reference extension explicitly.
Do not imply complete chapter6 coverage. Leave unsafe cases unresolved.
Inspect day-six/seven at2:2,3:15 wording, Zoe/Eve3:20,3:24 extra clause,4:8 field
invitation and genealogy age variants. Use THIS source:5:25 says187, not the167
reading of another witness. Never harmonize source ages/spellings/transcription.

ONE-SOURCE-TO-MANY EVIDENCE: current rows have one string/hash per comparison
language. Extend BACKWARD COMPATIBLY with explicit per-target comparison evidence
(target ref + actual corpus string/hash for EACH target/language). Source Greek
still has one actual ref/text/hash. Do not duplicate source rows or concatenate
verses into fabricated comparison/source Scripture. Bind every target evidence
item to its actual location, authoritative ledger and corpus. Preserve existing
Genesis1 evidence/bindings/confidence/ref-kind/group/ambiguity protections.
Support multiple immutable ledger files or a generated aggregate without rewriting
Genesis1. Each entry must identify its own ledger/row; all ledgers hash-bound with
the documented EOL-safe method. Deterministic metadata and JS/JSON agreement.

DISPLAY: user accepted native6 once at row6/native7 once at row7 plus tiny notice.
Keep that behavior byte/text exact. No repeated multi-verse block at every row.
For new one-to-one correspondences, explicitly declared presentation assignments
may show source unit at its intended target row with tiny variant/boundary notes.
Do not add generic source-label==target-verse fallback. For a genuine source unit
spanning targets (e.g.3:1 or6:1), render the complete Greek ONCE per comparison
view, with native label and small continuation/reference note at another visible
target that shares it. A query of just2:25 or just5:32 must show the complete known
source unit once and explain its boundary. Do not split/relabel source Scripture
or hide a target. Desktop/mobile/range/multi-reference cases must remain coherent.
If presentation cannot be safe/minimal, mark the case unresolved and explain.

METADATA/UI: extend coverage/scopes/labels from Genesis1 to actually supported
Genesis1–5 and any disclosed boundary-only6:1. Genesis6:2 and all unrelated books
remain unresolved/edition-unavailable; no blanket mapping. Comparisons against
other editions remain flagged unreviewed. All captions say proposals/pilot, not
verified. Add license/attribution/changes for the new evidence, preserving existing
First1KGreek CC BY-SA4.0, OSHB CC BY4.0 and WEB/KJV source declarations.

PROTECTED: ALL existing Scripture corpus files and raw sources, source importers,
canon.js, validate.mjs, witnesses, fonts, native references/views, independent
Parallel and old Greek-off Canon renderings. No typo/age/label corrections or
borrowing another edition. Existing actual source caches/baselines are present.
Use a before-change snapshot of current Genesis1 pilot on/off so regression is
tested; never regenerate old acceptance baselines after editing.

CACHE: current shipped shell52 -> new53; update ALL THREE existing shell assertions
and any version-only independent expectation. DATA stays3; no cache wipes.
Raw LXX disclosures-20261007 URL unchanged. Bump map/registry query keys to a new
batch-specific version so phones cannot use the old Genesis1-only metadata.
Classic script tags only, no local fetch/CDNs/frameworks/module-only browser code.

TESTS: add focused content/evidence/renderer regressions for both chapter-boundary
containers, per-target evidence hashes, duplicate source rejection, missing/forged
target evidence, cross-chapter refs, absent native labels, safe unresolved cases,
no duplicate Greek in combined2:25;3:1 and5:32;6:1 views, single-target views,
mobile, source-text/flags exact, ages unchanged, confidence gate still FAIL under
--require-verified, and unchanged Genesis1/Greek-off10-chapter rendering.
Keep both independent probes passing and do not weaken/rewrite them. Run the
existing validator/compiler/resolver/Stage2a/verse-row/native/reference/disclosure
checks and full npm withoutSKIP/FAIL; adapt ONLY intentionally superseded Gen2
unresolved expectations to newly supported coverage and add Gen6:2 as unresolved.
Do not bypass old many-to-one, negative, unnumbered or ambiguity protections.
Record honest coverage counts, including unresolved and boundary-only refs.

FINISH: small commits on codex/lxx-stage2b, README/history/handoff current status,
build/reports/stage2b-REPORT.md with PASS/FAIL/counts, exact commits/file scope,
data/cache sizes, deviations and remaining human textual/phone/release gates.
STOP with commit hash and short report. No merge/push/deletion. The user previews
C:/maranatha/maranatha_new/index.html, sends the result to Codex for independent
fresh-clone verification, then decides whether to merge/push via Git Bash.
```
