# LXX disclosure metadata — implementation report

Branch `codex/lxx-disclosures`, base `5213a13`. Implementer: opencode/DeepSeek.
User-approved three disclosure changes; metadata only, no Scripture repair.

## What was implemented

| # | Book/chapter/verse | Disclosure | Mechanism |
|---|---|---|---|
| 1 | PSA 16:4 | Stray inline numeral `(4)` preserved; explained | targeted `transcription-marker` flag |
| 2 | PSA 88:84 | Label 84 where 48 would be expected; not renumbered | targeted `source-label-anomaly` flag |
| 3 | LJE ch. 1 | No upstream chapter division; displayed chapter 1 is a navigation container | one book notice |

Three explanatory entries appended to the data `changes` list and to
`data/LICENSE-lxx-swete.md`. Flags are keyed by an explicit
`book/chapter/verse` map in `build/import-lxx-swete.mjs`; no general rule was
added for parentheses or verse-label digits.

## Counts and hashes

| Quantity | Before | After |
|---|---|---|
| books / chapters / verses / unnumbered | 48 / 1055 / 27048 / 100 | 48 / 1055 / 27048 / 100 |
| flagged verses (independently counted) | 686 | **688** (+2) |
| notable text count (check-stage1) | 2,754,390 | 2,754,390 |
| `data/lxx-swete.json` bytes | 7,474,562 | 7,475,873 |
| `data/lxx-swete.json` SHA-256 | `d31c332f…f79d75a4` | `fd52aa2f5f65f7e0a9c76d9cf203756c66f43ac1a91396d928be3b30d8ed1f2e` |
| `data/lxx-swete.js` SHA-256 | — | `d470206d53885e72832b0acf70c78c14a81ae03d064d1a83bafaf1548e9219f3` |

The `d31c332f…` value is retained as historical evidence in the earlier Stage 1
and Stage 1b reports (not rewritten). Two independent regenerations produced
identical output.

## Cache decision (deliberate policy exception)

- `DATA_CACHE_VERSION` stays **v3**; already-downloaded translations are kept.
- `loadLxx()` now requests `data/lxx-swete.js?v=disclosures-20261007`.
- `DATA_CACHE` matches with `ignoreSearch:false`, so the query is a fresh key and
  a stale unversioned `data/lxx-swete.js` cannot satisfy it.
- Shell `CACHE_VERSION` bumped **v49 → v50**; all three shell assertions updated
  (`build/test-service-worker.mjs`, `build/test-delitzsch.mjs`,
  `build/test-delitzsch1901.mjs`).
- Recorded in README, PROJECT_HISTORY and the handoff annotation as an exception
  to the older universal "bump the data cache on any data change" guidance,
  which is incomplete for query-versioned URLs.

## Verification (PASS/FAIL)

| Check | Result |
|---|---|
| `build/check-lxx-disclosures.mjs` (new) | 38 pass / 0 fail |
| `build/check-stage1.mjs` | 15 pass / 0 fail |
| `build/validate-lxx-native.mjs` | 8 pass / 0 fail |
| `build/check-stage1b.mjs` (anchors updated) | 45 pass / 0 fail |
| `build/check-stage1b-independent.mjs . build/cache/stage1b-before.json` | 0 failures / 14 checks |
| `build/test-service-worker.mjs` | 26/26 |
| `npm test` (full suite) | exit 0 |

`check-lxx-disclosures.mjs` proves: every segment text/label/kind/order and every
pre-existing flag matches `build/cache/lxx-disclosures-before.json`; exactly the
two targeted new flags exist at PSA 16:4 and PSA 88:84; only LJE gains exactly
one notice; all old `changes` entries are retained (8 → 11); source/license/
excluded/missing metadata unchanged; the raw LJE XML has zero chapter `div`s and
72 verse `div`s; two-run determinism and JSON/JS agreement; the flags render in
**both** the standalone LXX view and the parallel left pane; the LJE notice and
intro/72-verse shape render in both; the Canon view is byte-identical to the
existing pre-change baseline. A realistic CacheStorage mock (honouring
`ignoreSearch`, query keys and origin) proves the versioned-key behaviour and an
offline reload.

## Diffstat

```
 PROJECT_HISTORY.md               | 62 ++++++++++++++++++++++++++++++++++++++++
 README.md                        | 24 ++++++++++++++++
 app.js                           |  7 ++++-
 build/check-architect-handoff.py |  4 +--
 build/check-stage1b.mjs          |  9 ++++--
 build/import-lxx-swete.mjs       | 29 +++++++++++++++++--
 build/test-delitzsch.mjs         |  2 +-
 build/test-delitzsch1901.mjs     |  2 +-
 build/test-service-worker.mjs    | 10 +++----
 data/LICENSE-lxx-swete.md        |  9 ++++++
 data/lxx-swete.js                |  2 +-
 data/lxx-swete.json              |  2 +-
 docs/ARCHITECT_HANDOFF.md        | 15 ++++++++++
 service-worker.js                | 13 ++++++---
 14 files changed, 169 insertions(+), 21 deletions(-)
 build/check-lxx-disclosures.mjs  | new file, 38 checks
```

## Deviations

- None from the approved task. The data hash necessarily changed (flags + notice
  + appended `changes`); text/labels/order/kind and all non-LJE notices are
  byte-identical to the baseline.
- `build/check-architect-handoff.py` expectations were updated to the new
  counts/hash (688, `fd52aa2f…`) only because it is a live anchor. Its upstream
  clone argument was not available here, so it was not executed in this run; the
  equivalent invariants are covered by `check-stage1.mjs`,
  `validate-lxx-native.mjs` and `check-lxx-disclosures.mjs`.

## Open questions / remaining acceptance

- Real-browser and physical-phone test is the user's: hard refresh and confirm
  the PSA 16:4 / PSA 88:84 flag markers, the LJE notice, and an unchanged Canon
  view under `file://` and the deployed PWA.
- No merge, push or deletion was performed; this stage has no merge/push
  approval. Codex independently verifies this branch in a fresh clone.
