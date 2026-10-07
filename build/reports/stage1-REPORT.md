# Stage 1 report — Swete LXX (native numbering)

Branch `lxx-stage1` (no merge, no push). Base for the diff: `lxx-audit`.
Source pinned: `OpenGreekAndLatin/First1KGreek` `tlg0527` @ `03776b39f4047c5cff06f5296fae4b2bae4b08fb` (CC BY-SA 4.0).

## PASS/FAIL

| Check | Result | Detail |
| --- | --- | --- |
| source-labels-psa88 | PASS | Ps 88 ...47,84,49 preserved |
| source-labels-psa115-no6 | PASS | Ps 115 has no label 6 |
| source-text-psa129-unique | PASS | Ps 129 labels 1-8; no duplicated text |
| books-45-in-canon | PASS | 45 in-canon books + components LJE,SUS,BEL |
| excluded-absent | PASS | excluded works recorded and absent |
| missing-ecclesiastes | PASS | Ecclesiastes recorded as not available |
| daniel-theodotion-only | PASS | Daniel=SUS/BEL Theodotion only (no Old Greek) |
| bel-truncation-notice | PASS | Bel ends at 1:36 with 14:36 / 37-42 notice |
| detached-text-present | PASS | Letter intro, Esther prologue, Psalm titles |
| source-hashes | PASS | 47 pinned source files verified |
| text-count-integrity | PASS | source=2754390 shipped=2754390 (47 files) |
| canon-view-regression | PASS | 10 WEB+KJV chapters identical to before |
| lxx-view-renders | PASS | banner, Ps 88 label 84, footer attribution |

**check-stage1: 13 pass / 0 fail.** `validate-lxx-native: 8 pass / 0 fail`.
Regression chapters: GEN 1, EXO 20, PSA 23, PSA 119, ISA 53, JER 25, DAN 3,
SIR 1, MAT 5, JHN 1 (baseline captured from the base app before any change).

## git diff --stat (lxx-audit..HEAD)

```
 .gitignore                     |   1 +
 PROJECT_HISTORY.md             |  63 +++++++
 README.md                      |  26 ++-
 app.js                         | 154 +++++++++++++++++
 build/check-stage1.mjs         | 315 +++++++++++++++++++++++++++++++++++
 build/import-lxx-swete.mjs     | 365 +++++++++++++++++++++++++++++++++++++++++
 build/reports/stage1-REPORT.md | 100 +++++++++++
 build/test-delitzsch.mjs       |   2 +-
 build/test-delitzsch1901.mjs   |   2 +-
 build/test-service-worker.mjs  |  10 +-
 build/validate-lxx-native.mjs  | 130 +++++++++++++++
 data/LICENSE-lxx-swete.md      |  55 +++++++
 data/lxx-swete.js              |   2 +
 data/lxx-swete.json            |   1 +
 index.html                     |  17 +-
 package.json                   |   1 +
 service-worker.js              |   2 +-
 style.css                      |  21 +++
 18 files changed, 1255 insertions(+), 12 deletions(-)
```

## Data file size

- `data/lxx-swete.json` — 7,474,562 bytes
- `data/lxx-swete.js` — 7,474,672 bytes
- Content: 48 books (45 in-canon + LJE/SUS/BEL), 1,055 chapters, 27,048 numbered
  verses, 100 unnumbered segments, 686 flagged verses. 47 pinned source files.

## DEVIATIONS

1. **`<head>` treated as apparatus.** The spec named `<note>`/`<app>`; structural
   chapter-numeral `<head>` elements are also excluded (documented in the data's
   `changes`). Detached `<lg>`/`<p>` titles are kept as unnumbered segments.
2. **Text-count integrity counts non-whitespace characters.** Segment
   concatenation normalizes inter-segment whitespace, so the count is taken after
   `NFC` + whitespace removal on both sides; totals match exactly (2,754,390).
3. **Extra check added.** `lxx-view-renders` (a real jsdom render of the LXX view)
   was added beyond the six listed invariants; the regression also gained an LXX
   smoke path.
4. **Shell cache bumped v45 -> v46** (app.js/index.html/style.css are shell
   files) and the hardcoded version expectations in `test-service-worker.mjs`,
   `test-delitzsch.mjs` and `test-delitzsch1901.mjs` updated accordingly. Full
   `npm test` passes. The translation data cache (`v3`) is unchanged;
   `data/lxx-swete.js` routes through the existing data-cache matcher, never the
   shell precache.
5. **`package.json`**: added only `"check:stage1"`. Existing `test` unchanged.
   `check-stage1`/`validate-lxx-native` are intentionally not in `npm test`
   because they read the raw B snapshots, which are not committed.
6. **Shared helper exports.** `build/import-lxx-swete.mjs` exports `B_DIR`,
   `parseSourceFile` and `freshBookSegments` for the validator/check instead of a
   separate library file.
7. **`.gitignore`**: added `build/cache/` (baseline/parse caches).
8. **Disk**: `.venv` was deleted with user approval to free space mid-run; the
   failed write had truncated `build/import-lxx-swete.mjs`, which was rewritten.
9. **Old Greek witnesses** are not listed in `excluded`; they are noted in
   `changes`. Only the six works named in the spec appear in `excluded`.
10. **Ezra/Nehemiah** share one source file (Esdras B); the split boundary
    (1-10 / 11-23) follows `build/audit-lxx.mjs`, with printed chapter labels kept.

## OPEN QUESTIONS

1. Stage 2 (tiered Swete->canon mapping + per-translation versification) remains
   the blocking architecture decision; Stage 1 makes no correspondence claims.
2. Should the chapter-numeral `<head>` text be surfaced anywhere, or is dropping
   it (current) the accepted policy?
3. Should the three Old Greek witnesses (tlg054/056/058) also be recorded in
   `excluded`, or is the `changes` note sufficient?
4. Psalm 151 is excluded under the 73-book scope; confirm this is preferred over
   exposing it as a native LXX chapter.
5. Should the LXX view hide the canon lookup/search controls (currently still
   visible, with the banner clarifying the numbering)?
6. Is the ~15 MB JSON+JS pair acceptable, or should the `.js` be generated from
   the `.json` at load time / compressed?
7. Should `data/lxx-swete.js` be precached or left lazy-load-only (currently
   lazy, consistent with `byz`/`delitzsch`)?
