# Proposed opencode tasks — 2026-10-07

Proposals only: nothing below is authorization to implement, merge, push or delete.
Status update: Stage 1b was implemented, refined and browser-reviewed; the user
approved its merge and push on 2026-10-07. Its prompt below is retained as the
original specification. The remaining prompts describe subsequent work.

Next bounded work item, after accepted Stage1b: disclosure metadata only for
PSA16:4's preserved `(4)`, PSA88:84's anomalous source label, and LJE's synthetic
navigation chapter 1. Codex checked the current data: both Psalm verses lack
flags, and LJE lacks the chapter-container explanation. Use follow-up prompts
1 and 2 below on a separate branch; retain every text and label byte. Data/cache
changes need a tested refresh strategy and accurate new hash/flag anchors.
Sirach headings, font replacement and Stage2 alignment remain separate decisions.
Run tasks separately after the user approves their scope. Baseline: main includes
Stage 1 through merge 8c69797; lxx-stage1 is 14fe85c. The independent acceptance
record is build/reports/architect-handoff-REPORT.md. Each block is self-contained.

## Stage 1b — independent reading panes

```text
=== TASK: Stage 1b independent LXX and translation panes; you are the implementer ===
STATUS OF DECISIONS: Source/witness/scope/native numbering were approved for Stage 1.
Stage 1b is proposed: execute ONLY after the user explicitly approves this task.
EXECUTION RULES
1. OUTPUT BUDGET: PASS/FAIL and short counts only; no data dumps/full logs. Write
   build/reports/stage1b-REPORT.md (<=150 lines): PASS/FAIL table, git diff --stat,
   data sizes, DEVIATIONS, OPEN QUESTIONS only.
2. VERIFY BY SCRIPT: create build/check-stage1b.mjs; assert independent navigation,
   Hebrew RTL, Delitzsch edition notices, lazy script loading, labels/count/hash
   invariants, mobile control isolation, view switching and canon regression.
3. Named branch codex/lxx-stage1b from current main; small commits, run the check
   after each commit, stop on first FAIL. No merge/push/deletion without approval.
4. Read docs/ARCHITECT_HANDOFF.md and the independent acceptance report. Cache
   baselines under build/cache; never create an after-change regression baseline.
HARD CONSTRAINTS: static site; local data via script tags; file:// works; no local
fetch/XHR/CDNs; no guessed mappings, row alignment, text edits or data rewrites.
Do not touch data/*, importers, canon.js, validate.mjs or existing translation IDs.
SCOPE: add a third View choice, "Parallel reading (independent numbering)";
retain Canon and LXX standalone views. Left pane: LXX native Book/Chapter controls.
Right pane: one existing translation, including Hebrew and both Delitzsch editions,
with independent Book/Chapter controls. Use available book/chapter metadata and
existing source-numbering notices; never silently substitute another chapter.
Navigation in either pane cannot move the other. No matching rows, synchronized
scrolling or automatic chapter mapping. Reuse rendering logic with the smallest
necessary changes; avoid a renderer-wide refactor. Keep canonical search/reference
actions explicitly canon-only and return to Canon view when invoked; neither pane
may appear to have responded to an unsupported LXX search/reference.
UI: banner "Independent numbering; passages are not aligned". Label both panes
and controls; unique IDs; keyboard accessible. Desktop: two panes; mobile: stacked
LXX then translation. Preserve LXX flags, book notices, introduction and attribution.
Preserve translation selection/state in existing views. Bump shell cache from its
current value and update three existing version assertions; data cache unchanged.
DOCS: record decisions in PROJECT_HISTORY.md, explain operation in README.md.
No new license file needed if data/font assets are unchanged; retain attribution.
CHECK: left Ps88 ...47,84,49; Ps115 has no6; Bel ends36; LJE detached introduction
then72 verses; source SHA d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4;
48 books/1055 chapters/27048 verses/100 unnumbered/686 flagged remain unchanged.
Compare WEB+KJV rendered bytes against pre-change main for GEN1 EXO20 PSA23 PSA119
ISA53 JER25 DAN3 SIR1 MAT5 JHN1. Run npm test, check-stage1 and native validator
with required ignored source caches; record missing caches as incomplete checks.
REAL BROWSER (user): hard refresh; file:// and phone; exercise all three views,
independent pickers, Hebrew RTL and 1901 notices; inspect computed visibility and
stacked layout; accents/breathings, flags, notices and attribution; return to Canon
with no lingering LXX controls; test lazy first load of 7.5MB LXX data.
STOP after report. Independent verifier reruns in a fresh clone before sign-off;
user performs browser test. Wait for explicit approval before merge/push/deletion.
```

## Follow-up 1 — missing verse flags

```text
=== TASK: disclose two existing LXX anomalies; you are the implementer ===
STATUS: preserving defective source text is approved; these metadata changes are
proposed. Execute only after this task is approved.
EXECUTION: branch codex/lxx-disclosure-flags from current main; small commits;
run build/check-lxx-disclosure-flags.mjs after each, stop on FAIL. No merge/push/
deletion without explicit approval. Print PASS/FAIL only; cache under build/cache.
REPORT: build/reports/lxx-disclosure-flags-REPORT.md <=150 lines; only PASS/FAIL,
diffstat, data sizes, DEVIATIONS, OPEN QUESTIONS.
HARD CONSTRAINTS: static script loading/file://; never repair Scripture. No edits
to canon.js, validate.mjs, numbering, witnesses, scope or other translations.
SCOPE: in import-lxx-swete.mjs anchor on flagsFor(segment), NOISE_RE and the Psalm
88 notice. Flag the existing parenthesized (4) at PSA16:4 as a transcription
marker; add an explicit verse-level disclosure at PSA88:84 for its anomalous label.
Do not broaden numeral detection to flag ordinary numeric content indiscriminately.
Regenerate both LXX outputs; update changes/license adaptations and DATA_CACHE_VERSION
from its current value because shipped JS changes. Record any new flagged total.
CHECK SCRIPT: both flags present once; all segment texts and labels byte-identical
to baseline; 48/1055/27048/100 unchanged; flag count delta explicitly computed,
not guessed; deterministic hashes on two runs; Psalm115/Bel invariants; canon
regression for GEN1 EXO20 PSA23 PSA119 ISA53 JER25 DAN3 SIR1 MAT5 JHN1.
Run existing Stage1/native validators/npm test with documented source caches.
DOCS: PROJECT_HISTORY.md, README disclosure note, report, license/change list.
UI unchanged. REAL BROWSER (user): hard refresh file:// and phone; Ps16:4/Ps88:84
disclosures visible; Ps115 no6, Bel36 notice, LJE intro+72, accents; switch back
to unchanged Canon; one Book/Chapter pair per standalone view.
STOP after report; independent fresh-clone verification before user sign-off.
```

## Follow-up 2 — Letter of Jeremiah chapter disclosure

```text
=== TASK: disclose synthetic LJE chapter container; you are the implementer ===
STATUS: detached introduction/native verse labels approved; notice change proposed.
Execute only after approval. Branch codex/lxx-letter-notice; small commits; no
merge/push/deletion without explicit approval. PASS/FAIL only; cache build/cache.
Create build/check-lxx-letter-notice.mjs; run after each commit, stop on FAIL.
REPORT: build/reports/lxx-letter-notice-REPORT.md <=150 lines, PASS/FAIL table,
diffstat, sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: static/script tags/file://, never repair Scripture. Do not touch
canon.js, validate.mjs, source labels, other translations or mapping code.
SCOPE: add an LJE BOOK_NOTICES entry in import-lxx-swete.mjs: source has no chapter
division; displayed chapter1 is a navigation container, not an upstream chapter
label. Preserve detached Greek introduction followed by source verses1-72.
Regenerate JS/JSON and bump DATA_CACHE_VERSION from its current value; record
metadata adaptation in data changes/license. Shell cache changes only if shell changes.
CHECK: upstream contains no LJE chapter div; notice displayed; all texts/labels
unchanged; 48/1055/27048/100/686 unchanged; deterministic two-run hashes; Psalm88,
Psalm115 and Bel invariants; ten-chapter WEB+KJV regression captured before changes.
Run npm test, Stage1/native validators with required ignored caches.
DOCS: PROJECT_HISTORY.md, README notice, license/changes, report.
REAL BROWSER (user): hard refresh file:// and phone; LJE notice+unnumbered intro+72
verses; Ps88 label84, Ps115 no6, Bel36 notice, accents/attribution; Canon/LXX pickers
switch correctly and Canon is unchanged. STOP after report; independent review.
```

## Follow-up 3 — Sirach editorial headings policy

**Superseded by source verification:** the two named `<head>` elements are in
unused grc1 (Hart), not selected grc2 (Swete). Swete's Fathers title is already
shipped within verse43:33; the Patience heading is absent. The original prompt
below must not be executed against grc2. See the Sirach heading handoff report;
no cross-edition heading restoration is authorized or needed.

```text
=== TASK: document excluded Sirach headings; you are the implementer ===
STATUS: all head elements are currently excluded. Proposal: accept and explicitly
document exclusion of Πατέρων ὕμνος and Περὶ ὑπομονῆς. Requires user policy approval;
if user instead chooses to expose headings, STOP and request a revised task.
EXECUTION: branch codex/lxx-heading-policy; small commits; no merge/push/deletion
without explicit approval; PASS/FAIL only; build/cache for intermediates. Create
build/check-lxx-heading-policy.mjs, run after each commit, stop on FAIL.
REPORT: build/reports/lxx-heading-policy-REPORT.md <=150 lines: PASS/FAIL table,
diffstat, data sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: static/script tags/file://; no Scripture fixes; do not touch any
runtime/source/data files, cache versions, importer, canon.js or validate.mjs.
SCOPE: XML-parser verification against pinned tlg034 grc2 identifies both head
elements as excluded editorial headings; quote their exact locations in report.
Document in data/LICENSE-lxx-swete.md, README.md and PROJECT_HISTORY.md that head
exclusion includes these two headings. Do not insert them into numbered verses.
CHECK: both headings exist upstream under head; runtime JS/JSON hashes unchanged;
48/1055/27048/100/686 and Ps88/Ps115/Bel/LJE invariants unchanged. Canon view stays
unchanged; no UI modification. Record that this policy preserves text fidelity
only under the declared note/app/head exclusions, not all printed editorial text.
STOP after report; independent review. Existing browser acceptance still applies:
file:// and phone; standalone controls, native labels, notices and attribution.
```

## Follow-up 4 — Greek font preference and specimens

```text
=== TASK: prepare Greek font specimens; you are the implementer ===
STATUS: user dislikes current LXX font; no replacement approved. This is proposed
research/preview only. Obtain the user's description (shape, size, spacing or
accent readability) before recommending a default; never infer a font approval.
EXECUTION: branch codex/lxx-font-specimens; no merge/push/deletion; small commits;
PASS/FAIL only. Cache build/cache. Create build/check-lxx-font-specimens.mjs;
run after each commit, stop on FAIL. REPORT build/reports/lxx-font-specimens-REPORT.md
<=150 lines: PASS/FAIL, diffstat, sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: standalone static preview, script tags/file://; no fetch/CDNs;
no production app.js/style.css/data/cache changes; never edit Scripture.
SCOPE: docs/lxx-font-specimens.html comparing current .lxx-text font stack with
bundled Cardo. Use identical verbatim samples from LXX data, with attribution,
accents/breathings/diacritics; sizes/line heights clearly labelled. Use only
locally bundled font files; retain their licenses. No new downloads or product default.
CHECK: sample strings match shipped data; all fonts resolve locally; no external
runtime requests; production hashes/counts unchanged and Canon view unaffected.
DOCS: PROJECT_HISTORY.md records research only; report records user preference as
pending; no README claim of a shipped font change.
REAL BROWSER (user): open preview under file:// and phone; inspect accent clipping,
fallback glyphs, readability and size. Confirm a preferred candidate separately.
STOP after report; independent review before any later production font task.
```

## Follow-up 5 — LXX previous/next navigation

```text
=== TASK: add native LXX previous/next; you are the implementer ===
STATUS: Stage1 native numbering approved; navigation is proposed, execute only
after approval. Branch codex/lxx-native-navigation; small commits; no merge/push/
deletion without approval; PASS/FAIL only; cache build/cache. Create
build/check-lxx-native-navigation.mjs, run after every commit, stop on FAIL.
REPORT build/reports/lxx-native-navigation-REPORT.md <=150 lines: PASS/FAIL,
diffstat, sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: static/script tags/file://; no local fetch; no data changes,
Scripture repairs, mappings, canon.js/validate.mjs changes or canon-search redesign.
SCOPE: own previous/next buttons in #lxx-bar, traversing the actual ordered native
books/chapters. Use labels as strings; retain Esther prologue, Nehemiah11-23 and
components. Disable at absolute first/last chapter; no invented chapter numbers.
Keep Canon controls/semantics unchanged. Reference lookup/search remain explicitly
canon-only, documented. Update shell cache and its three existing assertions;
DATA_CACHE_VERSION unchanged because runtime data is unchanged.
CHECK: every adjacent native chapter pair both directions; component boundaries;
prologue/string labels; endpoints; all source counts/hashes invariant; ten-chapter
WEB+KJV regression against pre-change main. Run npm test, Stage1/native validators.
DOCS: PROJECT_HISTORY.md, README behaviour/limitations, report.
REAL BROWSER (user): hard refresh file:// and phone; keyboard navigation and disabled
endpoints; one Book/Chapter pair; Ps88 ...47,84,49, Ps115 no6, Bel36 notice, LJE
intro+72, accents/attribution; return to unchanged Canon. STOP after report;
independent fresh-clone verification and user browser acceptance.
```

## Follow-up 6 — enforce data-cache discipline

```text
=== TASK: verify LXX data-cache update discipline; you are the implementer ===
STATUS: data changes require DATA_CACHE_VERSION bump. This proposed verification
task adds no cache bump if data is unchanged. Execute only after approval.
EXECUTION: branch codex/lxx-cache-verification; small commits; no merge/push/deletion
without approval; PASS/FAIL only; build/cache intermediates. Create
build/check-lxx-cache-update.mjs, run after each commit, stop on FAIL.
REPORT build/reports/lxx-cache-update-REPORT.md <=150 lines: PASS/FAIL, diffstat,
sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: static/script tags/file://; do not modify translation data,
app.js, numbering, canon.js or validate.mjs. No unsolicited version bump.
SCOPE: focused service-worker test: lxx-swete.js matches runtime data cache,
is not shell-precached, and an approved new DATA_CACHE_VERSION retires prior
cache namespaces via activation. Use mocked cache storage, never delete user or
real browser caches. Preserve file:// registration guard. Document a review check:
if generated translation JS content changes, compare base/HEAD DATA_CACHE_VERSION.
CHECK: PASS/FAIL script for matcher, cache separation, activation and registration
guard; source hash/count invariants; canon-view behaviour unchanged. Run existing
service-worker tests; record shell=v47/data=v3 only as baseline, re-read on execution.
DOCS: PROJECT_HISTORY.md and README cache-update procedure, report. No license changes.
REAL BROWSER (user): http(s) phone update using an approved data-changing branch;
confirm new cache namespace/new data, native labels/notices and Canon unchanged.
file:// remains usable without service worker. STOP after report; independent review.
```

## Follow-up 7 — reconcile audit record counts

```text
=== TASK: document LXX counting scopes; you are the implementer ===
STATUS: no Scripture/data changes approved or needed; documentation proposal only.
Execute only after approval. Branch codex/lxx-count-reconciliation; small commits;
no merge/push/deletion; PASS/FAIL only; cache build/cache. Create
build/check-lxx-count-reconciliation.mjs, run after each commit, stop on FAIL.
REPORT build/reports/lxx-count-reconciliation-REPORT.md <=150 lines: PASS/FAIL,
diffstat, sizes, DEVIATIONS, OPEN QUESTIONS only.
HARD CONSTRAINTS: static/script tags/file://; XML parser required; do not edit
source/audit snapshots, importer, app/data files, canon.js, validate.mjs or caches.
SCOPE: independently prove 27048 shipped verse containers; seven Psalm151 verses
excluded in shipping but included by mapping audit; five nested Ps129:4-8 verses
included in shipping but skipped by mapping-audit walk (it stops at parent verses).
Document one line: 27050 audit records = 27048 shipped + 7 excluded Psalm151 - 5
nested Psalm129. The100 unnumbered segments are a different record type. Do not
call them missing Scripture. Historical mapping totals are predictions with this
counting limitation; do not revise them without rerunning the audit separately.
CHECK: XML counts7 and5, formula, 47 source hashes, 2754390 characters, shipped
48/1055/27048/100/686; data SHA d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4;
label invariants Ps88/Ps115/Bel; runtime/canon hashes unchanged.
DOCS: PROJECT_HISTORY.md, README short counting note, report. License unchanged.
UI unchanged; existing file:// and phone native-label/notices/attribution checklist
remains applicable. STOP after report; independent fresh-clone verification.
```
