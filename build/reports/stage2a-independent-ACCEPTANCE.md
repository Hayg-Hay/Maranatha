# Stage2a proposed pilot — independent technical acceptance, 2026-10-07

Reviewed commits: repair5485d91; report66841cc.
Verifier: Codex. Implementer: manual opencode/DeepSeek workflow.
Verification checkout: build/cache/lxx-stage2a-verification, originally freshly
cloned for the prior review and fetched/checked out at exact HEAD66841cc.
No product edit by Codex during this verification; no merge/push/deletion.

## Verdict

Technical acceptance PASS for the Genesis1 research/proposal pilot. The four
previous runtime ambiguity blockers are repaired in both lookup directions.
This is not human textual certification, full-LXX coverage or release approval.
The real document/groups/entries remain proposal; humanApproval is null.

| Independent check | Result | Evidence |
| --- | --- | --- |
| Original Codex runtime probe, run from outside checkout | PASS | Control plus all4 formerly failing conflict cases;0 failures |
| Original validator negative probe | PASS | 8/8; original6 confidence/evidence holes remain closed |
| Expanded resolver regression suite | PASS | 61/61 |
| Accepted desktop/mobile verse-row display | PASS | 12/12;31 original Greek strings once;6/7 notice;single7;off-state;Gen2 unresolved |
| Metadata compiler in Windows checkout | PASS | 4 current/0 stale |
| Default proposal validator | PASS | 30 groups/31 source refs/31 targets |
| Require-verified gate | PASS | Expected exit1 for proposed status and null human approval |
| Complete npm suite | PASS | Exit0; includes Stage2a UI37/37;noSKIP/FAIL |
| Existing Scripture/canon/importer/integrity validator | UNCHANGED | Git comparison to d82d93b;only new mapping/registry/license files under data |
| Architect's ledger and second textual review | UNCHANGED | Git comparison from initial checkpointf2b6b68 |
| Working-tree integrity/whitespace | PASS | Verification checkout clean;diff --check clean |

Runtime code review confirms duplicate source entries taint owning groups and
their targets; duplicate group definitions do not overwrite; positive/negative
contradictions and repeated negatives flag ambiguous targets. Group conflicts
propagate to source lookups. Actual Genesis1 proposals remain unaffected.

Evidence bindings use documented LF-normalized artifact hashes. Windows physical
line-ending differences are disclosed in the implementation report, not used as
permission to change Scripture. Per-verse evidence checks and Git comparisons
confirm the protected source text is unchanged.

Logs (gitignored): build/cache/stage2a-final-{runtime,probe,resolver,rows,compiler,
validator,human,npm}.log; preceding fresh-clone scope/UI checks are in
build/cache/stage2a-verify-*.log. No failed independent assertion remains from the
two specific repair handoffs.

## Remaining gates and coverage

- User accepted appearance and the one-verse-per-row presentation. Technical
  checks do not turn that into full human textual adjudication.
- Genesis1 correspondence evidence remains proposed:29 singleton groups plus
  collective6-7; the display keeps source6 at6/source7 at7 with the small note.
- Human textual review, phone acceptance and explicit merge/push remain pending.
- Other chapters/books have no pilot mapping and remain alignment-unavailable
  or edition-unavailable as appropriate. No blanket numbering identity inferred.
- Main/public site remains the separately approved v51 release.

Next: review build/reviews/lxx-genesis1-review.md and the corresponding exact
four-language evidence. A subsequent mapping-confidence/release decision must
name its scope and distinguish proposed preview publication from verified maps.
After accepting the pilot/process, expand in bounded chapter/book batches.
