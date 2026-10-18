# Stage2a — remaining resolver review fixes (manual opencode handoff)

```text
TASK: Fix four independently reproduced runtime ambiguity gaps. The six original
validator holes are repaired and pass; preserve those repairs. No redesign.

WORKSPACE: C:/maranatha/maranatha_new/build/cache/lxx-stage2a-implementation
BRANCH: codex/lxx-stage2a, HEAD 4b18390 (repair14414db). Original main is separate.
No merge, push, deletion, subagents or expansion beyond the Genesis1 pilot.

Read build/reports/stage2a-independent-review.md and targeted resolver functions.
Token budget discipline: rg/narrow reads; never dump full Scripture JSON/JS or
logs. Print PASS/FAIL and counts only. Full npm output -> ignored cache log.

Codex verified in fresh clone: unchanged original negative probe8/8; compiler4/0;
proposal validatorPASS; --require-verifiedFAIL as expected; mutation suite47/47;
UI37/37; accepted verse-row display12/12; full npmexit0 with no SKIPs or FAILs.
Scripture corpora, accepted presentation and proposed/human-null statuses intact.

REMAINING FOUR FAILURES: Canon cells use resolveTarget(), but its conflict checks
do not cover all metadata ambiguity already rejected by the CLI validator.
1. Duplicate source entry: conflictedSources is checked only by resolveSource();
   resolveTarget(GEN,1,1) still returns correspondence for the affected group.
2. Conflicting definitions with the SAME group ID: groupByTarget compares only
   id, so a second definition can replace source1 with source2 at target1.
3. Target both positively mapped and negatively asserted: resolveTarget() prefers
   its group, silently ignoring the contradiction.
4. Duplicate/conflicting negative assertions for one target: negativeByTarget
   overwrites the earlier assertion and returns definitive no-corresponding-verse.

REPRODUCE:
node build/check-stage2a-runtime-independent.mjs .
Codex's new independent script is already copied into this checkout. Control
passes; four mutations currently fail. DO NOT edit this independent script.
Each ambiguous input must resolve to state 'ambiguous-metadata' in the affected
Canonical target lookup, with no guessed/partially selected Greek text. Preserve
resolveSource() safety as well. Track conflicts consistently across both indexes
and affected groups. Repeated group IDs must not silently overwrite definitions.
Mapped-vs-negative and negative-vs-negative contradictions must fail closed.

Add focused regression cases to the regular resolver suite covering both lookup
directions and unaffected targets. Keep the four synthetic conflict fixtures out
of actual map data. Avoid collateral invalidation of valid proposals.

PROTECTED: every Scripture corpus/importer, architect's ledger/second semantic
review, all current provenance/hash/scheme/human-gate repairs, approved UI:
source6 once at6; source7 once at7; short notice; single-verse7 only; Genesis2
alignment-unavailable; no generic ordinal fallback. All real map entries remain
proposal with humanApproval=null. No new human or scholarly approval is implied.
Keep unshipped shellv52, DATA cachev3, versioned map/registry/raw LXX URLs and
downloaded corpora. No new text, fonts, witnesses or alignment coverage.

CHECKS: unchanged independent runtime probe must have0 failures; unchanged
independent validator probe0; proposal validationPASS; --require-verified expected
FAIL; import --check4/0; test-verse-mapping; check-stage2a; verse-rows12/12; full
npm withoutSKIPs/FAILs. Run additional tests only for new failures/changes.
Small local commit(s); update the concise Stage2a report/history with exact scope
and hashes, distinguish UI acceptance from pending human textual adjudication.
Stop with final commit hash and short result. No merge/push/deletion.
Codex independently reruns the final result before sign-off.
```
