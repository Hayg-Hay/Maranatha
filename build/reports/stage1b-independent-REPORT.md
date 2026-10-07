# Stage 1b independent architecture review — 2026-10-07

Current status: user accepted Codex's refinement at `7c58080` and explicitly
approved merge/push. A fresh final clone passes Stage1b 45/45, independent
behaviour checks 14/14 with the actual pre-change baseline, Stage1 15/15 and
native checks 8/8. DeepSeek's separate layout review is recorded in
`stage1b-layout-second-review.md`. Its F1 identifies two stale version assertions;
both were corrected to v49. Product code/data still match the reviewed preview.
The original implementation review below is historical; its role and approval
statements describe the earlier `3647438` review, before Codex's refinement.

Implementer: opencode / DeepSeek. Independent verifier: Codex.
User approved Stage1b implementation with "yes go ahead". Merge/push/deletion
approval was not given. Codex authored verification scripts and documentation,
not the product implementation. All product fixes were returned to DeepSeek.

Branch: `codex/lxx-stage1b`. Reviewed code commit:
`364743839cac12dbed077a35fbaa227a43eddc29`.
Base: `8d27c45890e561dc324d2ab67b73e05d97eb66ee`.
Implementation checkout: `build/cache/stage1b-implementation`.
Fresh independent clone: `build/cache/stage1b-verification`.

## PASS/FAIL

| Check | Result | Evidence |
| --- | --- | --- |
| Independently authored behaviour checks | PASS | 14/14; no implementer helper imports |
| Implementer's Stage1b checks rerun independently | PASS | 45/45 |
| Stage1 regression checks | PASS | 15/15 |
| Native LXX validator | PASS | 8/8 |
| Full npm suite on final code commit | PASS | exit0; `build/cache/stage1b-verification-npm.log` |
| Canon WEB+KJV regression | PASS | ten chapters byte-identical to preserved pre-change main baseline |
| Scripture/source invariants | PASS | independent Python: 47 pinned hashes, 2,754,390 chars, all labels and individual verse texts |
| Shipped LXX counts/hash | PASS | 48/1055/27048/100/686; expected d31c332f... hash |
| Protected paths unchanged | PASS | Git diff empty for data/, importer and canonical validator |
| Fresh clone integrity | PASS | git fsck --full exit0; tracked diff exit0 |
| Desktop/mobile CSS structure | PASS (static only) | flex panes, <=700px stacked order; explicit hidden rules |
| Local browser acceptance (user) | PASS | user reviewed implementation file preview and said "ok looks good" |
| Physical phone / installed PWA acceptance | UNVERIFIED | no phone test reported |

## Findings resolved before acceptance

1. Wrong right-pane heading claimed canon numbering for source-numbered
   Delitzsch1901. Final heading is neutral "Translation"; source notice retained.
2. Loading 1901 made unpointed JHN1 display52 rows although its source has51.
   Right extent is now scoped to the selected translation, not all loaded datasets.
3. Invalid reference input changed View to Canon but left Parallel visible.
   Valid/error/empty action paths now keep the visible view consistent.
4. A delayed LXX callback could reveal its attribution after returning to Canon.
   Callback is guarded by active view; explicit footer [hidden] CSS prevents the
   existing display:block declaration from overriding the hidden attribute.
5. Armenian locale changed headings but left the parallel Book menu English.
   Locale changes rebuild that menu while preserving pane selection.

Independent checks cover lazy startup, duplicate IDs/labels, isolation in both
directions, Hebrew, both Delitzsch editions, source notices, Ps88/Ps115/Bel/LJE,
Esther prologue, Nehemiah11, attribution, preserved Canon selection, reference/
search transitions, invalid input, Armenian locale and deliberately delayed loading.

## Reproduction / raw evidence

```text
git clone --no-hardlinks --single-branch --branch codex/lxx-stage1b <implementation-checkout> <verification-checkout>
node build/check-stage1b-independent.mjs build/cache/stage1b-verification build/cache/stage1b-verification/build/cache/stage1b-before.json
python build/check-architect-handoff.py build/cache/stage1b-verification build/cache/architect-verification/f1k
# In fresh verification checkout, with documented caches/baselines prepared:
node build/check-stage1b.mjs
node build/check-stage1.mjs
node build/validate-lxx-native.mjs
npm test
git fsck --full
```

Logs: build/cache/stage1b-verification-{independent,data,check,stage1,native,npm,fsck}.log.
Independent JS checker was authored in the original workspace and copied unchanged
to the implementation checkout for reproducibility; implementer did not edit it.
It is included with this independent acceptance record on the local branch.
Node dependency versions match the committed lockfile (jsdom30.1.1,
fast-xml-parser5.10.1). Ignored Berean HTML pages are copied from the original
cache and validated by the committed manifest. Raw LXX XML is copied from the
fresh upstream pinned clone used in the handoff audit, not an agent's extraction.
Both regression baselines were captured before Stage1b product edits; none was
recaptured from the changed app. Full npm tests run outside the sandbox because
its Windows temporary-file rename restrictions caused false failures earlier.

## Data sizes / cache versions

LXX JSON7,474,562 bytes; generated JS7,474,672 bytes (LF). Data is unchanged.
JSON SHA-256: d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4.
Shell cache v47 -> v48; three existing version assertions updated. Data cache v3.

## DEVIATIONS

- No visual acceptance claim: jsdom/static CSS checks cannot certify layout,
  fonts, physical phone rendering or the installed PWA's update behaviour.
- Original working-tree documentation/untracked files were retained. Implementation
  and verification occurred in separate retained local clones. No merge/push.
- Branch includes handoff review artifacts/proposal docs, not only product files;
  inspect `git diff --stat 8d27c45..codex/lxx-stage1b` before merging.

## OPEN QUESTIONS / user acceptance

User accepted the local implementation preview on 2026-10-07: "ok looks good".
This records local browser acceptance, not phone testing or merge/push approval.

Open the implementation checkout's index.html directly. Check all three views,
desktop side-by-side/mobile stacked layout, independent pickers, Hebrew RTL,
1901 notices, native anomalous labels, flags/attribution and returning to Canon.
Repeat on phone; hard refresh for the PWA shell update. Then explicitly approve
any merge/push. Feature implementation is complete; visual release acceptance remains.

### 2026-10-07 — Codex refines the parallel reading layout

At the user's request, Codex made this presentation change directly. Both panes
now use a quiet reading layout, compact verse references and equal text rhythm.
One shared native-numbering notice replaces the duplicate left notice; desktop
controls share grid rows so chapter headings start together. Mobile panes remain
stacked. Edition-specific disclosures, Hebrew RTL, LXX notices and independent
navigation are preserved. The translation chapter title omits layout metadata.
Shell cache v49; data cache v3 unchanged. Checks: Stage1b 45/45, independent
functional checks 14/14 including ten byte-identical Canon chapters, service
worker 26/26, and git diff --check. User acceptance of the previous layout does
not cover this refinement; revised visual appearance awaits preview refresh.
No merge or push was performed.

### 2026-10-07 — Stage1b merge and push approved

User reviewed Codex's refinement at 7c58080 and said: "yes i reviewed your
polishment. its clean. we can merge and push it all. then we continue."
This explicitly authorizes the Stage1b merge and push. The implementation and
review documents are included; pre-existing untracked sources, patch and image
remain outside this change. Product files match 7c58080; documentation reconciles
the original handoff verification with the feature history. Phone/PWA testing
has not been reported. Subsequent stages require their own merge/push approval.

Final pre-merge verification: full `npm test` exit0 in the fresh final clone
(log: build/cache/stage1b-final-npm-fixed.log). Second-review F1 resolved by
updating the two Delitzsch shell assertions from v48 to v49; no runtime change.
Codex independently used the actual pre-change ten-chapter baseline (the second
reviewer's separate empty-baseline smoke run does not establish byte equality).
Git integrity check exit0; no deleted paths; no Scripture/data changes.
