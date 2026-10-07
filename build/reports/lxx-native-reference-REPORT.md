# Native LXX reference navigation — implementation report

Branch `codex/lxx-disclosures`, base `2f30372`. Implementer: opencode/DeepSeek.
User-reported bug: picking LXX → Gen 1 → Open reference deactivated the LXX view.

## What changed

The reference box is no longer canon-only **inside the standalone LXX view**. It
now navigates native LXX numbering directly:

- `Book Chapter`, optionally `:Verse`, with case-insensitive **existing canon
  book aliases, source book IDs and dataset labels**.
- Bare book opens its first chapter that carries numbered verses
  (`Nehemiah` → `11`; `Genesis` → `1`).
- Book-name resolution reuses `ReferenceParser.normalizeKey` and the canonical
  parser's book map only; chapter and verse labels are validated **only** against
  `data/lxx-swete.json`, so `Ps 88:84` is accepted and an absent `Ps 115:6` is
  rejected.
- Source components resolve by native id/label: `LJE` / `Letter of Jeremiah`,
  `Susanna`, `Bel` / `Bel and the Dragon`; `Esther prologue` is explicit.
- Missing source books (Ecclesiastes, NT) and unavailable chapters (`Nehemiah 1`)
  show a clear message and keep the current LXX passage.
- Ranges and multiple references are refused with a native-format message; verse
  and range syntax is never silently dropped and never falls back to Canon.
- A single verse scrolls to its native segment; the whole native chapter (with
  flags, notices and unnumbered text) is kept.
- Canon and Parallel reference behaviour is unchanged (Parallel still returns to
  Canon); search stays Canon-only.
- The reference placeholder follows the selected view.

Async safety:

- `loadLxx()` now queues every callback instead of dropping one when a request is
  already in flight; still exactly one script tag / cache URL.
- A reference submitted during the initial lazy load executes when data arrives.
- A later submission supersedes an earlier one; leaving the view cancels a pending
  native navigation. Callbacks are guarded by current view and request generation,
  so no late callback changes Canon/Parallel, their pickers or the LXX footer.
- The standalone LXX render callback is now guarded the same way as the parallel
  pane's.

## Unchanged

- `data/lxx-swete.json` SHA-256 `fd52aa2f…ed1f2e`; counts **48 / 1055 / 27048 /
  100 / 688 flagged**; all three approved disclosures (PSA 16:4, PSA 88:84, LJE
  notice) preserved and still visible.
- Canonical parser, translation loaders, data, importers and layout untouched.
- Data cache `v3` unchanged; LXX query URL `disclosures-20261007` unchanged; no
  cache was cleared.

## Cache

Shell `CACHE_VERSION` bumped `v50 → v51`; assertions updated in
`build/test-service-worker.mjs`, `build/test-delitzsch.mjs`,
`build/test-delitzsch1901.mjs`. Codex's `build/check-lxx-disclosures-independent.mjs`
had the same shell-version assertion (`v50`), invalidated by the mandated bump;
it was updated to `v51` with no behavioural assertion changed.

## Verification

| Check | Result |
|---|---|
| `build/check-lxx-native-reference.mjs` (new) | 42 pass / 0 fail |
| `build/check-lxx-disclosures.mjs` | 39 pass / 0 fail |
| `build/check-stage1.mjs` | 15 pass / 0 fail |
| `build/validate-lxx-native.mjs` | 8 pass / 0 fail |
| `build/check-stage1b.mjs` | 45 pass / 0 fail |
| `build/check-stage1b-independent.mjs` | 0 failures |
| `build/check-lxx-disclosures-independent.mjs` | 0 failures |
| `build/test-service-worker.mjs` | 26/26 |
| `npm test` (full suite) | exit 0 (log `build/cache/lxx-native-reference-npm.log`, ignored) |

`check-lxx-native-reference.mjs` proves, on the real `file://` app: Gen 1 via
click **and** Enter stays in LXX and shows Genesis 1; aliases (`Ps 88:84`,
`Gen 2`); bare `Nehemiah` → chapter 11 and bare `Genesis` → chapter 1; components
`Letter of Jeremiah 1`, `Bel 1`, `Susanna 1`; `Esther prologue`; `Ps 88:84`
accepted and scrolled, `Ps 115:6` rejected; unavailable chapter (`Nehemiah 1`) and
book (Ecclesiastes, Matthew); malformed, multiple, range and verse-list inputs
retain the current native passage and view; a reference submitted during the
initial lazy load executes once data arrives; the latest of two submissions wins
with no duplicate script request; leaving the view cancels a pending navigation
and leaves Canon and the footer untouched; Canon and Parallel references keep
their previous behaviour; the ten-chapter WEB+KJV Canon regression is
byte-identical to the **actual existing** pre-change baseline
`build/cache/stage1b-before.json`; and the data hash/counts/flags and all three
disclosures are unchanged.

## Deviations

- The independent disclosure checker's `CACHE_VERSION` assertion was bumped to
  `v51` (shell assertion only) because the task mandates the shell bump; no
  behavioural check was altered or weakened.
- No existing test asserted the intentionally superseded LXX-exit behaviour, so
  none needed changing for that reason.

## Remaining acceptance

- Real-browser and physical-phone test is the user's: in the LXX view open
  `Gen 1`, `Ps 88:84`, `Letter of Jeremiah 1`, bare `Nehemiah`, and confirm the
  view stays LXX and the passage matches native numbering; an invalid reference
  keeps the passage; Canon and Parallel are unchanged.
- No merge, push or deletion was performed. Codex independently verifies this
  branch in a fresh clone.
