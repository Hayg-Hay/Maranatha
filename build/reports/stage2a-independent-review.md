# Stage2a repair — independent review, 2026-10-07

Reviewed HEAD4b18390, product repair14414db. Verifier: Codex, after manual
opencode/DeepSeek delivery. Fresh clone: build/cache/lxx-stage2a-verification.
No product edits were made by Codex during this review. No merge/push/deletion.

| Check | Result | Evidence |
| --- | --- | --- |
| Original independent validator probe unchanged | PASS | Exact normalized-file comparison to pre-fix Codex script |
| Six original validator holes | FIXED | Independent probe8/8 includes valid control and conflict guard |
| Metadata compiler in fresh Windows clone | PASS | 4 current /0 stale |
| Default proposal validation | PASS | 30 groups,31 unique source/target refs |
| Require-verified gate | PASS | Exit1 because actual humanApproval is null and statusproposal |
| Mutations / UI / verse-row tests | PASS | 47/47;37/37;12/12 |
| Full npm | PASS | Exit0; noSKIP/FAIL in stage2a-verify-npm.log |
| Existing protected corpora/canon/importer/validator | UNCHANGED | Git comparison to d82d93b |
| Collective evidence / accepted display | PRESERVED | Proposed group6-7; one Greek verse per displayed row, small notice |
| Human textual adjudication / phone / release | PENDING | UI appearance approval does not certify all textual proposals |
| Additional independent runtime ambiguity probes | FAIL | Valid control passes;4 conflict mutations still produce correspondence/no-counterpart |

## Remaining runtime blockers

1. Duplicate source entry is rejected by resolveSource(), but not propagated to
   the Canon-column resolveTarget() path; affected target still emits Greek.
2. Two conflicting groups with the same ID can overwrite the target's source
   definition because conflict detection compares IDs rather than unique claims.
3. A mapped target with an explicit negative assertion is rendered as mapped;
   the contradiction is silently ignored.
4. Conflicting negative assertions for one target overwrite and render a
   definitive no-corresponding-verse rather than ambiguous metadata.

These are in-memory synthetic mutation probes, not claims of incorrect actual
Genesis1 text. The unchanged real pilot displays correctly; resolver fail-closed
requirements are nevertheless incomplete. No broad readiness/sign-off yet.

Reproduction: node build/check-stage2a-runtime-independent.mjs <checkout>.
Script copied into the implementation checkout for the next manual handoff.
The expected affected Canon state is ambiguous-metadata for all four mutations.
The main/public site remains the previously approved v51 release.

Logs: build/cache/stage2a-verify-{probe,compiler,validator,human-gate,ui,rows,
mutations,npm}.log. Runtime probes were inspected directly and are reproducible.

Next manual prompt: docs/STAGE2A_RESOLVER_REVIEW_PROMPT.md in original workspace.
Keep all repaired evidence bindings, confidence gates, license/schema declarations
and protected proposal ledger intact. Human adjudication and merge/push remain
separate gates after technical acceptance.
