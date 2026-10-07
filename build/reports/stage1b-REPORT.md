# Stage 1b report — independent LXX and translation panes

Implementer: opencode (DeepSeek). Branch `codex/lxx-stage1b`.
Base: `8d27c45890e561dc324d2ab67b73e05d97eb66ee` (current `main`, includes
`lxx-stage1` via `8c69797`). No merge, push or deletion performed. Work stopped
after this report.

Scope delivered: a third View choice, "Parallel reading (independent
numbering)" — left pane = Swete LXX native numbering with its own Book/Chapter
controls; right pane = one existing translation (any registered translation,
including Hebrew OSHB and both Delitzsch editions) with its own controls. No row
alignment, no synchronized scrolling, no chapter mapping. Banner
"Independent numbering; passages are not aligned". Canon-only reference/search
return to Canon view. Static site, `<script>` loading only, `file://` works.

## PASS/FAIL

| Check | Result | Evidence |
| --- | --- | --- |
| `node build/check-stage1b.mjs` | PASS | 36 pass / 0 fail |
| Data SHA-256 unchanged | PASS | `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4` |
| Shipped counts unchanged | PASS | 48 books / 1,055 chapters / 27,048 verses / 100 unnumbered / 686 flagged |
| Source labels preserved | PASS | Ps 88 `…47,84,49`; Ps 115 no 6; Bel ends 36 |
| Unique HTML IDs | PASS | 0 duplicate IDs |
| Hidden-view + mobile-stack CSS | PASS | static source rules |
| Startup lazy loading | PASS | no `lxx-swete`/`delitzsch` script at boot |
| Lazy LXX / Delitzsch load | PASS | loaded only on demand via `<script>` |
| Independent pane navigation | PASS | either pane moves alone (both directions) |
| Hebrew RTL + Delitzsch notice | PASS | `dir=rtl lang=he`; 1901 versification notice |
| Reference/Search return-to-Canon | PASS | both force Canon view and act there |
| View switching | PASS | canon ↔ LXX ↔ parallel restored cleanly |
| Mobile pane isolation + stacking | PASS | LXX pane then translation pane; controls isolated |
| Canon regression WEB+KJV | PASS | 10 chapters byte-identical to `build/cache/stage1b-before.json` |
| `node build/check-stage1.mjs` | PASS | 15 pass / 0 fail |
| `node build/validate-lxx-native.mjs` | PASS | 8 pass / 0 fail |
| `npm test` | PASS | exit 0 (full suite; shell assertions now v48) |

## git diff --stat (before commit)

```text
 PROJECT_HISTORY.md            |  60 +++++++++++
 README.md                     |  45 +++++++-
 app.js                        | 231 +++++++++++++++++++++++++++++++++++-------
 build/test-delitzsch.mjs      |   2 +-
 build/test-delitzsch1901.mjs  |   2 +-
 build/test-service-worker.mjs |  10 +-
 docs/ARCHITECT_HANDOFF.md     |  10 ++
 index.html                    |  37 ++++++-
 service-worker.js             |   2 +-
 style.css                     |  21 ++++
 10 files changed, 371 insertions(+), 49 deletions(-)
```

New untracked files: `build/check-stage1b.mjs`, `build/reports/stage1b-REPORT.md`,
`build/reports/architect-handoff-REPORT.md` (copied handoff review document,
preserved).

## Data sizes (unchanged)

- `data/lxx-swete.json` = 7,474,562 bytes (SHA-256 `d31c332f…d75a4`).
- `data/lxx-swete.js` = 7,474,674 bytes.
- No `data/*`, importer, `canon.js`, `validate.mjs` or translation ID changed.
- Shell `CACHE_VERSION` v47 → v48; `DATA_CACHE_VERSION` stays v3.
- Three existing version assertions updated to v48:
  `build/test-service-worker.mjs`, `build/test-delitzsch.mjs`,
  `build/test-delitzsch1901.mjs`.

## DEVIATIONS

- `build/check-stage1b.mjs` did not exist; created (required by the task). It
  also performs the WEB+KJV regression against the prepared pre-change baseline
  `build/cache/stage1b-before.json` (present, 152,575 bytes), in addition to
  `build/check-stage1.mjs` which does the same against `stage1-before.json`.
- The mobile "stacked layout" and the hidden parallel view are asserted with
  static source regexes, because jsdom does not apply CSS. The user must still
  confirm the computed layout in a real browser.
- `npm test` reports optional data unavailable (`data/reviewed-greek-gloss.js`,
  `data/strongs-greek.js`) exactly as before; those tests are designed to pass
  without the optional files, so this is not a missing-cache failure.
- Pre-existing uncommitted verifier artifacts (`docs/ARCHITECT_HANDOFF.md`
  verified-correction block and `build/reports/architect-handoff-REPORT.md`) were
  preserved and committed unchanged; they are not part of the Stage 1b product
  change.
- LXX renderer touched minimally: `renderLxxView` refactored into
  `renderLxxInto(bookSelect, chapterSelect, container, onReady)`. The parallel
  right pane reuses `appendResultBlock` via a synchronous `refs.results` redirect
  (`renderInto`); no renderer-wide refactor.

## OPEN QUESTIONS

- Real-browser/phone acceptance is the user's test: hard refresh, `file://` and
  phone, all three views, independent pickers, Hebrew RTL and the 1901 notices,
  computed visibility and stacked layout, accents/flags/attribution, return to
  Canon with no lingering LXX controls, and the lazy 7.5 MB LXX first load.
- Neither pane matches rows or maps chapters (by design). If the user later wants
  a linked scroll or an LXX previous/next, that is separate Stage 2 work.
- Independent verifier must rerun `build/check-stage1b.mjs` in a fresh clone
  before sign-off.
