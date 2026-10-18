# Paste/run with opencode + DeepSeek — Stage 2a repair

The user now runs opencode manually. Codex writes prompts and independently
verifies results. This prompt authorizes repairs, not merging, pushing or deleting.

```text
TASK: Finish the Stage2a validator/review repairs while preserving the accepted UI.

WORKSPACE: C:/maranatha/maranatha_new/build/cache/lxx-stage2a-implementation
BRANCH: codex/lxx-stage2a; checkpoint f2b6b68. Original repository main is separate.
Check git status/branch first. Change product files ONLY in this isolated checkout.
Do not modify original main. No merge, push, deletion, subagents or new book imports.

READ ONCE: docs/STAGE2A_ARCHITECTURE.md,
build/reports/stage2a-DRAFT-STATUS.md, relevant validator/resolver functions.
The prior automated run stopped with HTTP402 Insufficient Balance; its draft is
preserved. Continue it rather than rewrite/refactor. Existing source caches and
actual pre-change baselines are prepared; dependencies resolve to parent modules.

TOKEN RULES: never use read/cat on entire Bible JSON/JS or dump full data/logs.
Parse data programmatically and print small summaries/selected cases only.
Use rg and narrow source slices; cache intermediates under ignored build/cache.
PASS/FAIL lines and counts only. Full npm output to an ignored log. Each report
<=150 lines. Reuse the prior session if available to preserve cached context.

ACCEPTED PRESENTATION (user supersedes initial duplicated-group architecture):
Genesis1 source6 appears ONCE at target6, source7 ONCE at target7. Both keep their
exact Greek text/labels/flags and the tiny closing-phrase-placement note.
No duplication, merged box, rowspan or automatic ordinal fallback. The explicit
display rule only covers the authored GEN1-6-7 case. All other groups retain their
normal membership. A single-verse7 query displays only native7 with that note.
The original collective evidence remains proposed; UI acceptance does not mean
human textual adjudication of the full map. Keep ALL entries proposal and
review.humanApproval=null. Do not manufacture human approval or verified status.
User approved the interface and Genesis2's alignment-unavailable result.

PRIMARY REPAIR — six independently reproduced validator holes:
Default validateMapping(), not only --require-verified, currently accepts:
1. mapping.status='verified' with humanApproval=null;
2. group.status='verified' without human approval;
3. entry.status='verified' without human approval;
4. provenance.rowId referring to a nonexistent ledger row;
5. syntactically valid but WRONG textHashes (all 64 zeroes);
6. unknown mapping.status='bogus'.
Fix all six. Validate supported statuses always. Any verified claim requires
explicit valid human approval and consistency across document/group/entry scope.
Actual pilot stays proposed. --require-verified must continue to reject it.
Do not just change error strings or weaken independent tests.

EVIDENCE BINDING: load the referenced local ledger, require the row exists, verify
source ref, group target set and provenance/text hashes against that authoritative
row AND the bound source/comparison corpora. Do not infer target locations from
matching verse numbers. Account explicitly for collective6-7: both ledger rows
jointly substantiate the complete group. Missing/forged evidence must fail.
Bind the ledger itself so source proposals cannot silently drift. Use a documented
canonical JSON hash or safe physical-EOL normalization for generated metadata;
Windows Git CRLF must not break fresh-clone checks. Preserve actual Scripture
strings exactly. Validate binding paths/hashes and full group membership/order.

SCHEMES/SAFETY REVIEW:
- Mapping metadata must explicitly declare source scheme and target reference
  scheme. Target coordinates are the Maranatha navigation canon anchored to WEB-C;
  that does NOT mean every edition universally shares that numbering.
- Declare all existing registered editions' own schemes. Only Genesis1 has
  proposal coverage for WEB/KJV/OSHB. Other editions remain unreviewed/legacy;
  do not assert whole-book or universal identity. Warn clearly when comparing the
  Greek pilot against other selected, unreviewed edition numbering.
- Review runtime resolver: ambiguous/invalid metadata must fail closed, never
  silently overwrite an earlier target group or guess from ordinal/count.
  Source refs must match actual kind/label/index. Missing ANY member of a group
  must not silently produce a complete correspondence; retain missing-source state.
  Unattested negative assertions must not render a definitive no-counterpart claim.
  Preserve original native document order, including anomalous labels.
- Keep no-entry/unresolved distinct from explicit attested no counterpart and
  unavailable edition/source text. No negative claims are published in this pilot.

PROTECTED: every existing Scripture file, raw source, source importer, canon.js,
validate.mjs, native references/views, independent Parallel, fonts and witnesses.
Do not rewrite the architect's 31-row evidence or the second semantic review.
Metadata/compiler/resolver/validator/tests may be repaired minimally; record
findings as additions. License + attribution + changes for new map/registry data:
First1KGreek/Swete CC BY-SA4.0; OSHB CC BY4.0; WEB/KJV source declarations.
Finish the missing license documentation and concise README/history/report status.

CACHE: this is still the unshipped v52 draft. Keep shellv52 and ALL THREE shell
assertions consistent. DATA cachev3; raw LXX disclosures-20261007 URL unchanged.
New mapping/registry URLs remain versioned and load via classic script tags.
No local fetch, CDN/framework/module requirement or clearing downloaded corpora.

CHECKS (run first to reproduce, then after repairs):
node build/check-stage2a-validator-independent.mjs .
This is Codex's pre-fix negative probe; do not edit it. Corrected validator must
accept the valid proposal and reject every mutation; 0 failures expected.
node build/validate-verse-mapping.mjs                 # PASS proposal structure
node build/validate-verse-mapping.mjs --require-verified # EXPECT FAIL pending human
node build/import-lxx-alignment.mjs --check
node build/test-verse-mapping.mjs
node build/check-stage2a.mjs
node build/check-stage2a-verse-rows.mjs .              # 12 desktop/mobile checks
Add mutation cases for the six holes plus missing group member, wrong unnumbered
kind/index, conflicting groups, forged ledger/corpus bindings, unsupported scheme,
source-to-many/many-to-one and attested/unattested negatives. Use clearly synthetic
fixtures; do not invent human approval for the real pilot.
Regenerate metadata twice deterministically; JS payload and JSON must agree.
Run existing Stage1/native/Stage1b/disclosures/native-reference/independent checks
with supplied actual baselines, and complete npm test without source-cache SKIPs.
No old acceptance invariant may be weakened to conceal a failure.

REVIEW: inspect direct Codex presentation edit (app.js and verse-mapping.js) as
second CODE reviewer; source row text/label/flags exact, 31 source spans once,
one-verse7 correct, unresolved chapters unchanged, no generic ordinal fallback.
The user already reviewed its appearance. Record code-review findings separately.

FINISH: small local commits on codex/lxx-stage2a; report
build/reports/stage2a-REPORT.md with exact commits, PASS/FAIL/counts, file scope,
data/cache sizes, deviations and OPEN QUESTIONS. Be honest about remaining
human mapping adjudication and phone testing. Do not claim shipped/verified.
Stop with a short summary plus final commit hash. No merge/push/deletion.
Codex will independently rerun in a fresh clone after the user returns the result.
```
