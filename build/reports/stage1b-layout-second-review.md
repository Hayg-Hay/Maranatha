# Stage 1b layout refinement — second independent review

Commit: `7c58080` on `codex/lxx-stage1b` (range `9ebe225..HEAD`).
Reviewer 2 (independent). No product files edited; read-only `git`, source inspection and `node` checks only.
Separation rule (`docs/ARCHITECT_HANDOFF.md` §0): implementer must not be the only verifier. Commit 7c58080 was authored by Codex (implementer / principal architect), so this second review is required. Method: read the actual diff and surrounding code, then run the repo's own checks. jsdom does not apply CSS, so all layout geometry below is **static** or **DOM** evidence only; the **visual** review was performed by the user, not by me.

## Verdict

Implementation matches the stated refinement intent and no runtime product defect was found. **One merge blocker:** the committed tree leaves `npm test` red (stale shell-cache version assertions). Merge should wait until that is fixed.

## Concrete findings

| # | Severity | Finding |
|---|---|---|
| F1 | **HIGH (merge blocker)** | `npm test` fails. `build/test-delitzsch.mjs:159` and `build/test-delitzsch1901.mjs:133` still assert `/CACHE_VERSION\s*=\s*'v48'/` while `service-worker.js:38` is now `v49`. Both scripts abort with `AssertionError`. Reproduced: `node build/test-delitzsch.mjs` and `node build/test-delitzsch1901.mjs`. Both are wired into `package.json` `test`, so the commit breaks the required test gate. The handoff explicitly warns "three tests assert it"; only `build/test-service-worker.mjs` was updated. Runtime behaviour is unaffected. Fix: update both strings to `v49`. |
| F2 | LOW | Stale report sentence: `build/reports/stage1b-REPORT.md:84` still says "Shell `CACHE_VERSION` stays v48", contradicting the v49 entry appended later in the same file (and `docs/ARCHITECT_HANDOFF.md:74` still says v47). Documentation-only. |
| F3 | LOW / informational | Desktop heading alignment relies on CSS `subgrid` (`style.css:574`, `grid-row:span 3` + `grid-template-rows:subgrid`). Correct per spec because each `.parallel-pane` has exactly 3 direct children (h2, .chapter-bar, .parallel-content) sharing the parent's 3 implicit row tracks; content headings are margin-matched (`.lxx-heading` and `.result-head`, both `18px 0 12px`, `style.css:578-579`). No `@supports` fallback: on engines without subgrid (Chrome <117) the pane still renders but cross-pane heading alignment is not guaranteed. Static only; not exercisable in jsdom. |

## Dimension-by-dimension (PASS unless noted)

| Dimension | Evidence | Result |
|---|---|---|
| Heading alignment w/ desktop subgrid | Static CSS/app structure; F3 caveat | PASS (static) |
| Mobile stacking | `style.css:587-591` `@media (max-width:700px)` flex column; `check-stage1b` `mobile-panes-lxx-then-translation`, `mobile-translation-uses-mobile-layout` | PASS (static+DOM) |
| Shared numbering notice | `index.html:181` single banner; LXX `.lxx-banner` now only when `!parallelPane` (`app.js:3126`), standalone view preserved (`check-stage1b` `lxx-view-preserved`) | PASS (static+DOM) |
| Source-specific disclosures preserved | `versificationDisclosure:true` retained (`app.js:3247`); Delitzsch-1901 notice (independent checker `delitzsch1901-native-numbering-notice`); LXX book notices kept (`lxx-notices-detached-text-and-native-labels`) | PASS (DOM) |
| Hebrew RTL | `styleHebrewLanguageVerse` sets `dir=rtl`/`lang=he` on the rendered text node; `parallel-hebrew-rtl`, `parallel-osb-hebrew-rtl` | PASS (DOM) |
| Reading rows | `.parallel-content .mobile-verse` compact 2-col grid; extent scoped per edition, `parallel-right-extent-scoped-1901` 52/52, `...-ebible` 51/51 | PASS (DOM) |
| Lazy loading | unchanged script-tag lazy load; `parallel-lazy-loads-lxx`, `late-lxx-callback-guarded`; check waits retargeted to `.lxx-verses` | PASS (DOM) |
| Unchanged Canon rendering | Canon layout-selection path (`app.js:3348-3352`) untouched; parallel pane hard-codes `layout:'mobile'`; `canon-regression` 10 WEB+KJV chapters byte-identical | PASS (DOM) |
| Unchanged data | No `data/**` in diff; `data-sha256-unchanged d31c332f…`, counts 48/1055/27048/100/686 | PASS (static) |

## Checks run

- `node build/check-stage1b.mjs` — 45 pass / 0 fail.
- `node build/check-stage1b-independent.mjs . <empty-baseline>` — 0 failures (14 checks).
- `node build/test-service-worker.mjs` — 26/26.
- `git diff --check 9ebe225..HEAD` — clean.
- `node build/test-delitzsch.mjs` / `node build/test-delitzsch1901.mjs` — **FAIL** (F1).

## Acknowledgement

The user performed the real-browser visual review and approved pushing; that approval covers visual appearance, which I cannot reproduce here. My review is limited to source, DOM and check-script evidence, and it surfaces F1, which the commit's own report did not list (report cites Stage1b, independent and service-worker counts but not `npm test`).

Finish condition: review recorded. No merge/push/delete performed by me.
