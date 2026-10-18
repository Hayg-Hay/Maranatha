# Manual DeepSeek handoff: Genesis 6–15 proposal batch

**Resume update, 2026-10-08:** Codex isolated the user-approved LXX Cardo font
change for a separate release in `build/cache/lxx-font-release`, branch
`codex/lxx-cardo`. That release uses shell v54 with only the font/cache change.
The original Stage2c checkout already has the font-only commit `83bfe3a`;
preserve it. For Stage2c's later release, use shell **v55**, updating the existing
shell-version assertions accordingly, rather than reusing v54. The v53->v54
instruction below is superseded by this note. Do not change or publish the
separate font release from this task. All unfinished Stage2c work remains in
the original working folder; no merge/push/deletion was performed by Codex.

Paste this task into opencode after selecting the feature branch in the original
project folder. This file and the research memo are local task preparation.

```text
TASK: Extend the accepted proposed LXX comparison pilot from Genesis 1–5 to
content-supported Genesis 6–15. Reuse the existing pipeline. All new mappings
remain proposal with humanApproval=null; no claim of human/scholarly approval.

WORKSPACE: C:/maranatha/maranatha_new, original folder only.
BRANCH: codex/lxx-stage2c, based on merged main54565c2 (Stage2b accepted).
User selects the branch manually. Verify branch and baseline before edits;
if on main or in a cache implementation clone, STOP and report. Do not create
another implementation checkout. User previews the usual root index.html.
No merge, push, deletion, reset, clean, stash, new source import or subagents.
Preserve all unrelated untracked files; stage only explicitly named task files.

READ: docs/STAGE2C_GENESIS_RESEARCH.md, Stage2b independent acceptance,
current compiler/validator/resolver and ledger schema. Repo wins over old handoff
status. Do not reread all history or dump whole Scripture JSON/JS into context.
Extract compact chapter/passage panels with Node; keep scratch data in ignored
build/cache. Report summaries/counts only; final report <=150 lines.

TEXTUAL WORK FIRST: inspect every proposed source/target passage in the actual
Greek, WEB-C, KJV and OSHB strings. Decide by events, clauses and named subjects,
not ordinal identity, equal counts, generic length/name heuristics or another
witness recalled from memory. Write explicit verse-specific rationales and
material variants. Doubtful cases stay unresolved. AI assessments never become
human approvals; actual UI acceptance is also not textual adjudication.

ADD: build/reviews/lxx-genesis6-15-evidence.json, author review table
build/reviews/lxx-genesis6-15-review.md and a deterministic generator using
explicit authored correspondence decisions. Exact native refs/text/hashes/flags
and exact per-target WEB/KJV/OSHB evidence at each real target ref. Clear AI
authorship, licenses/attribution/changes. Preserve BOTH existing ledgers and
their semantic review tables byte-for-byte. Do not rerun their generators.

REUSE sourceGEN6:1 from the Genesis2–5 ledger, including BOTH targets5:32/6:1.
New ledger starts with remaining candidates6:2 onward; no duplicate source/group
claim. Inventory is 240 potential new sources and243 potential new targets;
this is NOT a required mapping count. Genesis16+ and other books stay unresolved.
Do not expand beyond15 without reporting the necessity for a boundary case.

FOCUSED CASES (independently inspect, see research memo):
- Source15:18 includes material at targets18–21, with literal internal §20.
  Use explicit per-target evidence if substantiated, render full source once
  with small continuation notes; never invent native19–21 or split the string.
- Source11:12–13 has an extra Cainan generation and different ages. Assess
  parent/child content, not just verse numbers; disclose differences and leave
  unsafe associations unresolved. Keep extra Greek content visible intact.
- Source7:11 day27 vs comparison17 and apparent incomplete wording.
- Source8:22 ends οὐ κατα- IX;9:1 begins IXκαὶ and lacks opening blessing wording.
- Source10:1 appears incomplete. Inspect neighbors; retain strings and flags.
  Never reconstruct a broken word/omitted clause from memory or another edition.
  Clearly distinguish a correspondence with incomplete source text from full
  wording equivalence. Include short source-condition notices where warranted.
  If the framework cannot represent a case honestly, leave it unresolved.
- Inspect all chapter11 ages, every chapter transition and other differences.
No missing/damaged text may be represented as an unattested definitive negative.

ENGINEERING: register a third hash-bound ledger, retain backward-compatible
Genesis1 evidence and Stage2b per-target schema. Every entry references its own
authoritative ledger/row. Verify ALL target hashes at exact refs and bind source
text/flags, with sha256-lf EOL handling. JSON/JS generated metadata deterministic
and consistent. Retain human gates, scheme warnings, duplicate/conflict handling,
negative and unnumbered protections. No blanket/ordinal fallback.
Update actual scope, metadata labels, UI captions and license notes to the
honest supported pilot scope. Replace obsolete boundary-only6:1 scope language
when chapter6 actually gains proposals, without altering the original ledger.

DISPLAY: preserve Gen1:6/7 separate rows and notices, and existing2:25/3:1 plus
5:32/6:1 once-per-view behavior. Complete native source at most once per view;
later targets share a concise reference/continuation notice. Individual target
queries show their complete actual source once. Test desktop/mobile, combined
references in both orders, single targets and rerenders/pilot toggle. Do not
split/concatenate/relabel Scripture. Routine pending-review labels remain.
Material variants must be documented honestly: existing age/wording caveats are
in the review table, while boundary notices are inline; do not claim every
variant is inline unless implemented. Keep new source-condition notices brief.

PROTECTED: Scripture corpora, raw sources/importers, canon.js, validate.mjs,
fonts, native LXX/reference views, Parallel independent panes and Greek-off
Canon behavior. No transcription corrections, age harmonization or imports.
Take before-edit snapshots for current Genesis1–5 and Greek-off regression;
do not regenerate existing acceptance baselines after edits.

CACHE: shell53 ->54 if shell files change; update all three shell assertions
and version-only independent expectations. DATA remains3; no cache wipes.
Raw LXX disclosures-20261007 URL unchanged. Map/registry query keys should be
stage2c-20261007 so phones load the expanded metadata. Classic local scripts;
no fetch-only browser dependency, CDN, framework or module-only browser code.

CHECKS: focused new evidence/resolver/render tests, including15:18–21 collective,
single targets19/20/21 and reverse-order queries, source/flags exact, genealogy
differences, damaged source notices, existing6:1 reuse, missing/forged target
evidence, wrong ledger binding, and safe unresolved16+ references.
Run all existing independent probes and resolver/validator/compiler, Stage2a/b
display, native/reference/disclosure checks and full npm test with no SKIP/FAIL.
--require-verified MUST fail on the real proposal batch. Do not weaken tests.
Adapt only intentionally superseded unresolved checks (e.g.Gen6:2/Gen7), replacing
them with a genuinely uncovered reference such as Gen16:1 and retaining prior
source exactness/dedup assertions. Preserve independent checker logic; any
minimal coverage/version adaptation must be explicitly reported.

FINISH: small local commits on codex/lxx-stage2c; concise README/history/current
handoff status update and build/reports/stage2c-REPORT.md. Record exact new and
combined source/group/target counts, unresolved refs/reasons, source-condition
issues, data/cache sizes, checks and deviations. STOP with final commit hash and
short report. No merge/push/deletion. User previews root index.html and gives
report to Codex for fresh-clone independent verification before approving release.
```
