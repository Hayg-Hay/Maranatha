# Stage 1b report — independent LXX and translation panes

Implementer: opencode (DeepSeek). Branch `codex/lxx-stage1b`.
Base: `8d27c45890e561dc324d2ab67b73e05d97eb66ee` (current `main`, includes
`lxx-stage1` via `8c69797`). No merge, push or deletion performed. Work stopped
after this report.

This revision addresses the four reproducible failures found by the independent
checker (`build/check-stage1b-independent.mjs`, authored by Codex; not edited here).

## PASS/FAIL

| Check | Result | Evidence |
| --- | --- | --- |
| `node build/check-stage1b-independent.mjs . build/cache/stage1b-before.json` | PASS | 0 failures (13/13) |
| `node build/check-stage1b.mjs` | PASS | 44 pass / 0 fail |
| `node build/check-stage1.mjs` | PASS | 15 pass / 0 fail |
| `node build/validate-lxx-native.mjs` | PASS | 8 pass / 0 fail |
| `npm test` | PASS | exit 0 (full suite; shell assertions v48) |
| FIX 1 — neutral right-pane heading | PASS | "Translation — numbering as printed"; source-numbered notice retained |
| FIX 2 — right extent scoped to selected edition | PASS | Delitzsch 1901 JHN 1 = 52 rows; eBible JHN 1 = 51 rows |
| FIX 3 — invalid/empty actions sync panes | PASS | invalid ref + empty search hide parallel panes |
| FIX 4 — late LXX load guarded | PASS | delayed load leaves `#lxx-attribution` hidden in Canon |
| Data SHA-256 unchanged | PASS | `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4` |
| Shipped counts unchanged | PASS | 48 books / 1,055 chapters / 27,048 verses / 100 unnumbered / 686 flagged |
| Source labels preserved | PASS | Ps 88 `…47,84,49`; Ps 115 no 6; Bel ends 36 |
| Independent pane navigation | PASS | either pane moves alone (both directions) |
| Hebrew RTL + Delitzsch notice | PASS | `dir=rtl lang=he`; 1901 versification notice |
| Lazy `<script>` loading | PASS | no `lxx-swete`/`delitzsch` at boot; lazy on demand |
| Mobile stacking + pane isolation | PASS | LXX then translation; controls isolated |
| Canon regression WEB+KJV | PASS | 10 chapters byte-identical to `build/cache/stage1b-before.json` |

## Reviewer findings and resolved outcomes

1. **Heading contradicted the source-numbered notice.** The static right-pane
   heading read "Translation — canon numbering", which is false for Delitzsch
   1901. Changed to the neutral "Translation — numbering as printed"
   (`index.html`). The per-chapter source-numbering notice is unchanged.
2. **Phantom verse rows.** `renderParallelTranslationPane` used `chapterExtent()`,
   which scans every loaded translation, so Delitzsch 1901's 52-verse John 1
   inflated the eBible edition to 52 rows. Now uses
   `extentForTranslations([t], book.id, chapterNum)` — the extent of the pane's
   chosen translation only (`app.js`).
3. **Invalid/empty actions left stale panes.** `reference-go` set the selector to
   `canon` and returned on a parse error before any render; `performSearch`
   returned before switching on empty input. Both paths now render the canon view
   (visibility consistent with the selector) before showing the message
   (`app.js`).
4. **Late LXX load leaked the footer into Canon.** The delayed `<script>` onload
   still called the parallel pane renderer after the user left the view, and
   `#lxx-attribution { display:block }` outranked `[hidden]`. The async callback
   is now guarded by the active view, and `#lxx-attribution[hidden]
   { display:none }` was added (`app.js`, `style.css`). Attribution is preserved
   in the LXX and parallel views.

## git diff --stat (this fix revision, before commit)

```text
 app.js                  | 24 +++++++++++---
 build/check-stage1b.mjs | 83 ++++++++++++++++++++++++++++++++++++++++++++++++-
 index.html              |  2 +-
 style.css               |  4 +++
 4 files changed, 106 insertions(+), 7 deletions(-)
```

Previous Stage 1b revision (already committed): 371 insertions across
`PROJECT_HISTORY.md`, `README.md`, `app.js`, `index.html`, `style.css`,
`service-worker.js`, the three version assertions and `build/check-stage1b.mjs`.

## Data sizes (unchanged)

- `data/lxx-swete.json` = 7,474,562 bytes (SHA-256 `d31c332f…d75a4`).
- `data/lxx-swete.js` = 7,474,674 bytes.
- No `data/*`, importer, `canon.js`, `validate.mjs` or translation ID changed.
- Shell `CACHE_VERSION` stays v48; `DATA_CACHE_VERSION` stays v3 (no data change).

## DEVIATIONS

- `build/check-stage1b-independent.mjs` is the verifier's copied checker; it was
  run but not edited and not committed (per the task instruction not to include
  copied handoff-review files).
- The mobile stacked layout and the hidden rules are asserted with static source
  regexes because jsdom does not apply CSS; the user must confirm computed layout
  in a real browser.
- `npm test` reports optional data unavailable (`data/reviewed-greek-gloss.js`,
  `data/strongs-greek.js`) exactly as before; those tests are designed to pass
  without the optional files.

## Real-browser verification — UNVERIFIED (not PASS)

The real-browser test could not run in this environment: the loopback connection
timed out and the Browser forbids `file://`. It remains unverified and is the
user's test: hard refresh, `file://` and phone, all three views, independent
pickers, Hebrew RTL and the 1901 notices, computed visibility and stacked layout,
accents/flags/attribution, return to Canon with no lingering LXX controls, and
the lazy 7.5 MB LXX first load.

## OPEN QUESTIONS

- Neither pane matches rows or maps chapters (by design); linked scrolling or an
  LXX previous/next would be separate Stage 2 work.
- Independent verifier should rerun both checkers in a fresh clone before sign-off.
