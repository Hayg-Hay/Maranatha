# Architect handoff acceptance — 2026-10-07

Verifier: Codex. Product implementation unchanged. Script and documentation authored
by Codex; no new product feature implemented. No merge, push or deletion performed.

## PASS/FAIL

| Check | Result | Evidence |
| --- | --- | --- |
| Supplied handoff committed first | PASS | `8d27c45`, handoff file only |
| Remote branch heads | PASS | main `8c6979706b23ada04b2a5708c623baebf41acf96`; lxx-stage1 `14fe85cd7e28e2c2c2dd6387e42023103e69a0fb` |
| Fresh Stage1 clone | PASS | GitHub clone at `14fe85c` |
| Fresh pinned upstream clone | PASS | Sparse First1KGreek checkout `03776b39f4047c5cff06f5296fae4b2bae4b08fb`, LF preserved |
| Independent source hashes | PASS | All 47 shipped source-file hashes match upstream Git blobs |
| Independent character fidelity | PASS | 2,754,390 non-whitespace NFC characters; zero Counter differences per source file |
| Independent labels/text | PASS | All chapter/verse labels in document order and all individual verse texts match; nested verses emitted once |
| Regeneration twice | PASS | Both JSON SHA-256 values equal expected `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4` |
| Shipped counts | PASS | 48 books / 1,055 chapters / 27,048 verses / 100 unnumbered / 686 flagged verses |
| Psalm88 | PASS | ending `45,46,47,84,49,50,51,52,53` |
| Psalm115 | PASS | `1,2,3,4,5,7,8,9,10`; no6 |
| Psalm129 | PASS | ordered labels1–8, independent per-verse texts match |
| Bel | PASS | ends at36; truncation notice retained |
| Ecclesiastes | PASS | absent; listed in missing |
| Existing Stage1 acceptance | PASS | 15/15, including CSS hidden rule and translation hint |
| Native validator | PASS | 8/8 |
| Canon regression | PASS | ten WEB+KJV chapters byte-identical to baseline rendered from lxx-audit |
| Git integrity | PASS | fresh clone and original workspace `git fsck --full` exit0 |
| Full npm suite, initial sandbox run | FAIL (environment) | six simulated-fetch temp-renames denied; 189 ignored source pages absent |
| Full npm suite, cache restored / unsandboxed | PASS | exit0; `build/cache/architect-verification/npm-test-with-cache.log` |
| New real-browser/phone acceptance | NOT RUN | user test remains necessary; jsdom does not apply CSS |

## Reproduction and raw output

All verification clones/logs retained in ignored `build/cache/architect-verification/`.
Runtime Node dependencies resolve from the containing workspace: fast-xml-parser
5.10.1 and jsdom30.1.1, matching package-lock.json; no dependency installation.

```text
git ls-remote https://github.com/Hayg-Hay/Maranatha.git refs/heads/main refs/heads/lxx-stage1
git clone --single-branch --branch lxx-stage1 https://github.com/Hayg-Hay/Maranatha.git build/cache/architect-verification/stage1
git clone --filter=blob:none --sparse --no-checkout https://github.com/OpenGreekAndLatin/First1KGreek.git build/cache/architect-verification/f1k
# In f1k: sparse-checkout set data/tlg0527; core.autocrlf=false checkout --detach <pin>
python build/check-architect-handoff.py build/cache/architect-verification/stage1 build/cache/architect-verification/f1k
# In Stage1 clone, B junction points to fresh f1k (not original local source cache):
node build/import-lxx-swete.mjs  # run1; record Get-FileHash data/lxx-swete.json
node build/import-lxx-swete.mjs  # run2; record same hash
node build/validate-lxx-native.mjs
node build/check-stage1.mjs
npm test
```

Independent output: `independent-check.log`; original checks: `check-stage1.log`;
native validation: `native-validator.log`; regeneration: `regen-1.log`, `regen-2.log`;
suite: `npm-test.log`, `npm-test-with-cache.log`; workspace fsck: `workspace-fsck.log`.
Baseline reproduction helper `prepare-baseline.py` materializes lxx-audit via Git
archive, adds the Stage1 check harness/data solely to run --capture-before against
the base app, then copies that baseline into the fresh Stage1 clone's ignored cache.
No baseline was captured from the after-change app. Regression chapters:
GEN1, EXO20, PSA23, PSA119, ISA53, JER25, DAN3, SIR1, MAT5, JHN1.

## Stale statements and reconciliation

- Handoff awaiting-merge status is stale: merge already exists on GitHub main.
- Original Stage1 report/history: 13 checks and v46 describe the earlier
  implementation; current code has15 checks, shell v47, data v3.
- README's four-translation/all-selected-default status and lack-of-deuterocanon
  claim were stale against app.js and shipped WEB-C; corrected in this review.
- Audit27050 versus shipped27048 is a scope/extraction difference: audit includes
  seven Psalm151 containers but skips five nested Psalm129 containers by stopping
  at parent verses. `27048 + 7 - 5 = 27050`. The100 unnumbered segments do not enter
  this equation. No text/count discrepancy remains unexplained.
- Report deviation8 claims .venv deletion approval; handoff disputes it. Historical
  approval evidence was not verified; report annotated, no approval inferred.
- Early Phase4 Armenian "10 genuinely blank" narrative is explicitly superseded
  by the September13 byte/boundary re-audit. Preserve historical context.

## Data sizes

JSON: 7,474,562 bytes. Generated JS: 7,474,672 bytes (LF representation).
JSON SHA-256: `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4`.
Windows checkout line-ending normalization may mark JS dirty after regeneration;
`git diff --quiet` exits0, confirming no content change.

## git diff --stat / new review artifacts

Tracked documentation diff: PROJECT_HISTORY.md +32; README.md +14/-6;
stage1-REPORT.md +9; ARCHITECT_HANDOFF.md +10 (four files, +65/-6).
New review artifacts: build/check-architect-handoff.py,
build/reports/architect-handoff-REPORT.md, docs/ARCHITECT_NEXT_PROMPTS.md.
These review changes are uncommitted; the original handoff commit is preserved.

## DEVIATIONS

- Python stdlib ElementTree used instead of lxml; no importer parser/helpers reused.
- NFC and whitespace removal are the comparison rules; notes/apps/heads excluded
  structurally and Psalm151 excluded. This proves digital transcription fidelity,
  not accuracy against printed Swete or semantic alignment with WEB-C.
- Full-suite rerun uses copied original Berean Hebrew source-page cache; those
  checks verify it against the committed manifest. LXX evidence uses fresh upstream.
- Sandbox failures were rerun using the approved unsandboxed test command.
- Stage1b and seven follow-ups proposed only in docs/ARCHITECT_NEXT_PROMPTS.md.

## OPEN QUESTIONS

- Approve a proposed implementation scope before dispatching opencode.
- Sirach heading policy and Greek font preference still require product choices.
- Real-browser/phone acceptance remains the user's responsibility.
