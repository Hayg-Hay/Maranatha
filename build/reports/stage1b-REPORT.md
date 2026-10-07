# Stage 1b report — independent LXX and translation panes

**Independent acceptance, Codex (2026-10-07):** fresh clone of code commit
`3647438` passes 14 independent cases, 45 Stage1b checks, 15 Stage1 checks,
8 native-validator checks and the full npm suite (exit0). Scripture fidelity
and ten-chapter Canon regression pass. See `stage1b-independent-REPORT.md`.
Real-browser/phone acceptance remains unverified; no merge or push approved.

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

This revision also fixes the locale regression and the neutral heading requested
in the follow-up task, and updates the README's stale status wording.

## PASS/FAIL (final local checks)

| Check | Result | Evidence |
| --- | --- | --- |
| `node build/check-stage1b-independent.mjs . build/cache/stage1b-before.json` | PASS | 0 failures (14/14) |
| `node build/check-stage1b.mjs` | PASS | 45 pass / 0 fail |
| `node build/check-stage1.mjs` | PASS | 15 pass / 0 fail |
| `node build/validate-lxx-native.mjs` | PASS | 8 pass / 0 fail |
| Data SHA-256 unchanged | PASS | `d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4` |
| Shipped counts unchanged | PASS | 48 books / 1,055 chapters / 27,048 verses / 100 unnumbered / 686 flagged |
| Source labels preserved | PASS | Ps 88 `…47,84,49`; Ps 115 no 6; Bel ends 36 |
| Independent pane navigation | PASS | either pane moves alone (both directions) |
| Hebrew RTL + Delitzsch notice | PASS | `dir=rtl lang=he`; 1901 versification notice |
| Lazy `<script>` loading | PASS | no `lxx-swete`/`delitzsch` at boot; lazy on demand |
| Canon-only reference/search | PASS | valid, invalid and empty inputs all sync panes |
| Late LXX callback guarded | PASS | footer attribution stays hidden in Canon |
| Right extent scoped to edition | PASS | Delitzsch 1901 JHN 1 = 52 rows; eBible = 51 |
| Locale switch localizes parallel Book | PASS | `GEN` keeps value; option becomes `Ծննդոց` (hy) |
| Neutral right-pane heading | PASS | exactly "Translation" |
| Mobile stacking + pane isolation | PASS | LXX then translation; controls isolated |
| Canon regression WEB+KJV | PASS | 10 chapters byte-identical to `build/cache/stage1b-before.json` |
| `npm test` (full suite) | NOT RERUN here | full suite rerun on the prior substantive fix; Codex reruns independently on the final commit |

## Reviewer findings and resolved outcomes

1. **Armenian locale left the parallel Book menu in English.** `setLocale()`
   rebuilt only the canon Book control. It now also calls
   `populateBookSelect(refs.parallelBook)` (the existing helper), preserving the
   pane's chosen book/chapter. The chosen translation and the independent LXX
   navigation are untouched; Canon locale semantics are unchanged (`app.js`).
2. **Neutral heading.** The right-pane heading is now simply **"Translation"**.
   Both "canon numbering" (false for source-numbered Delitzsch 1901) and
   "numbering as printed" (false for OSHB, whose Masoretic numbering is mapped
   to Christian references) overclaimed. The explicit 1901 source-numbering
   notice is retained (`index.html`).
3. Earlier review fixes remain in place: source-numbering notice preserved;
   per-edition verse extent; invalid/empty action pane sync; guarded late LXX
   callback plus `#lxx-attribution[hidden] { display:none }`.

## git diff --stat (this revision, before commit)

```text
 README.md               |  <status wording update>
 app.js                  |  locale rebuild of the parallel Book control
 build/check-stage1b.mjs |  locale behavioural check + strict neutral heading
 index.html              |  heading -> "Translation"
 build/reports/stage1b-REPORT.md, PROJECT_HISTORY.md  |  report/history updates
 build/check-architect-handoff.py, docs/ARCHITECT_NEXT_PROMPTS.md  |  copied verifier docs, unchanged (separate commit)
```

The copied verifier documentation (`build/check-architect-handoff.py`,
`docs/ARCHITECT_NEXT_PROMPTS.md`) is kept byte-for-byte unchanged and committed
separately because the already-committed architect report links to it.

## Data sizes (unchanged)

- `data/lxx-swete.json` = 7,474,562 bytes (SHA-256 `d31c332f…d75a4`).
- `data/lxx-swete.js` = 7,474,674 bytes.
- No `data/*`, importer, `canon.js`, `validate.mjs` or translation ID changed.
- Shell `CACHE_VERSION` stays v48; `DATA_CACHE_VERSION` stays v3 (no data change).

## DEVIATIONS

- The mobile stacked layout and the hidden rules are asserted with static source
  regexes because jsdom does not apply CSS; the user must confirm computed layout
  in a real browser.
- `build/check-stage1b-independent.mjs` is the verifier's copied checker; it was
  run but not edited (and not committed, per the task instruction).
- The full `npm test` suite was already rerun on the prior substantive fix; per
  the task it is not rerun here and Codex reruns it independently on the final
  commit in a fresh clone. The four JavaScript checkers above are all green.

## Real-browser verification — UNVERIFIED (not PASS)

The real-browser test could not run in this environment: the loopback connection
timed out and the Browser forbids `file://`. It remains unverified and is the
user's test: hard refresh, `file://` and phone, all three views, independent
pickers, Hebrew RTL and the 1901 notices, language switch, computed visibility
and stacked layout, accents/flags/attribution, return to Canon with no lingering
LXX controls, and the lazy 7.5 MB LXX first load.

## OPEN QUESTIONS

- Neither pane matches rows or maps chapters (by design); linked scrolling or an
  LXX previous/next would be separate Stage 2 work.
- The independent verifier has not signed off yet; rerun both checkers in a fresh
  clone before sign-off.
