# Segond 1910 Versification Reconciliation — Two-Rule Design

**Status**: Design document (Phase B), later implemented and completed.
**Final status**: **COMPLETE (2026-09-26)** — see **§10 Final disposition**. This
document is preserved as the earlier design/investigation record; §6 and §8 are
marked superseded by the final review, and §9 is the run notes as of that review.
**Date**: 2026-09-26

## 1. Problem

`data/canon.js` is shaped to the KJV/WEB (English) versification. The eBible
`fraLSG` source (Louis Segond 1910) uses a Hebrew-continental versification.
`validate.mjs` reports **106 errors** across 13 books (plus 3 provisional-canon
warnings and 1 known-variant note). Phase A (`PROJECT_HISTORY.md`,
`build/sources/segond1910/source-info.json`) confirmed the eBible USFM export
declares **no** versification scheme and carries **no** `\va`/`\vp` alternate
numbering — so there is no source-internal cross-reference to derive a map from.
The reconciliation must come from the two structural rules below, each
individually verified.

This is a *classification* phase. The placement logic is written only after the
classification report is reviewed.

## 2. Core Principle

Chapters whose Segond verse count differs from canon fall into exactly one of
three buckets:

1. **Rule 1** — Psalm superscription offset (standalone Masoretic title counted
   as leading verse(s)).
2. **Rule 2** — adjacent chapter-boundary shift (verse count conserved across a
   pair or triple of consecutive chapters).
3. **Unresolved** — everything else. Reported with raw numbers, never
   force-fit.

No chapter is renumbered until its rule has passed the per-item verification in
§4/§5. A chapter that matches an offset but fails verification is moved to
Unresolved.

## 3. Inputs

| Input | Source | Use |
|---|---|---|
| Segond chapter/verse arrays | `build/sources/segond1910/fraLSG_vpl.txt` (parsed directly) | counts + text |
| Canon chapter/verse counts | `data/canon.js` | expected counts |
| Provisional flags | `data/canon.js` (`provisional:true`) | exclude EST/DAN from Rule 2 |
| Known variants | `data/known-variants.js` | ROM 14 etc. already accounted for |

The VPL is parsed directly rather than reading `data/segond1910.json` so the
analysis does not depend on an untracked generated artifact.

## 4. Rule 1 — Psalm superscription offset

**Trigger**: a `PSA` chapter where `segondCount == canonCount + k`, `k ∈ {1,2}`.

**Action (once verified)**: canon verses `1..N` map to Segond verses
`(k+1)..(k+N)`. The leading `k` Segond verses are the title/superscription.

**Verification, per Psalm — mandatory, never batch-applied:**

- **Vocabulary**: the leading `k` verse(s) must contain at least one
  title-vocabulary marker (case-insensitive, anywhere in the verse):
  `Psaume`, `Cantique`, `Hymne`, `Prière`, `Au chef des chantres`, `De David`,
  `Des fils de Coré`/`Des fils de Koré`, `Maskil`, `Miktam`.
- **Length**: each leading verse must be short. Anything **over ~150
  characters** is flagged as *suspicious* (REVIEW), not auto-classified.

**Classification outcomes logged for every Psalm chapter:**

| Outcome | Meaning | Applied? |
|---|---|---|
| `PASS` | offset k∈{1,2} + vocabulary matched + length ≤150 | yes |
| `REVIEW` | offset + vocabulary matched, but a leading verse >150 chars | no — unresolved |
| `FAIL-VOCAB` | offset matched but no title vocabulary | no — unresolved |
| `NO-OFFSET` | diff = 0 (already canon-shaped) | nothing to do |
| `UNEXPECTED` | diff ∉ {0,1,2} or negative | no — unresolved |

The full per-Psalm log (chapter, counts, k, matched markers, leading-verse
lengths) is written to the report file so the list can be spot-checked rather
than trusted as an aggregate.

**Superscription text is preserved, not discarded.** It is stored as a
`titles` map alongside `books.PSA`, keyed by chapter number — e.g.
`"3": "Psaume de David. A l'occasion de sa fuite devant Absalom, son fils."` —
not folded into the verse array and not dropped. (OSHB discarded Hebrew
superscriptions because the KJV notes displaced them; Segond's are real
translated French a reader would want.) Whether `app.js` surfaces a chapter
title today is a separate UI concern — this task only preserves the data and
does **not** add UI.

## 5. Rule 2 — Adjacent chapter-boundary shift

**Trigger**: 2 (occasionally 3) consecutive chapters in the same book where the
signed differences (`segondCount - canonCount`) sum to **exactly zero**, with at
least one non-zero term.

**Action (once verified)**: the surplus verses at the end of Segond's earlier
chapter become the first verses of canon's later chapter (boundary redrawn).

**Verification, per window — mandatory:**

- **Exact conservation**: `Σ diff == 0` across the window. Approximate
  conservation does not qualify.
- **Continuity evidence**: paste the actual boundary-straddling text into the
  report — the **last 2** Segond-numbered verses of the earlier chapter and the
  **first 2** of the later chapter — so the redrawn boundary can be read as
  continuous narrative, not a mid-thought truncation.

Provisional books (`EST`, `DAN`) are excluded: their mismatches are canon's
Greek-addition gaps, not boundary shifts. Windows are detected at size 2 and
size 3; a size-3 window that merely contains a conserving size-2 sub-window is
not double-counted.

## 6. Out of Scope This Round

- No placement logic in `import-segond1910.mjs`; no `data/segond1910.json`
  rewrite.
- No `canon.js` change.
- No new UI for Psalm titles.
- ~~The single-verse textual-variant cases (3JN 1:15, 2CO 13:13, ACT 19:40 — and
  ROM 14, already in `known-variants.js`) are **not** versification offsets.
  They get their own known-variants entries later, separately.~~
  **Superseded by final review (§10):** 3JN, 2CO and ACT were all re-tested with
  the seam method and are **boundary artifacts** (3JN = MERGE; 2CO and ACT =
  SPLIT), not textual variants. No new known-variants entries were written;
  Segond validation triggers only the pre-existing ROM 14 known-variant note.
- Any book/chapter whose diff does not satisfy Rule 1 or Rule 2 is reported
  with raw numbers under "needs individual investigation" and left untouched.
  **Superseded by final review (§10):** the 1KI 22 / ISA 64 / MRK 9 / MRK 10 /
  JOB 34 / REV 12 items were each resolved by the seam method as MERGEs or
  SPLITs, and JOB 38..41 was approved as a window.

## 7. Deliverables This Round

1. This design document.
2. `build/analyze-segond1910-versification.mjs` — the classification/verification
   engine (analysis only, not the importer).
3. `build/sources/segond1910/versification-report.md` — every Psalm
   classification and every chapter-window conservation check, pass/fail, plus
   the unresolved list with raw numbers.

## 8. Remaining Work (after report review)

> **Superseded by final review — see §10.** All of the following was completed:
> the Psalm list and chapter-window list were reviewed/approved, the placement
> logic was written and applied, and the final validator result is **0 errors,
> 3 provisional warnings, 1 known-variant note**.

1. Approve/annotate the Psalm vocabulary-match list.
2. Approve/annotate the chapter-window conservation list.
3. Write the placement logic into `import-segond1910.mjs`:
   - apply Rule 1 (strip leading title verses, emit `titles` map),
   - apply Rule 2 (redraw verified boundaries),
   - leave all unresolved chapters exactly as validate.mjs already reports them.
4. Re-run `node build/validate.mjs data/segond1910.json`; the only remaining
   errors should be the documented unresolved list + the 4 textual-variant
   cases. *(Final result: 0 errors — the "textual-variant" cases were boundary
   artifacts; see §10.)*

## 9. Run notes (2026-09-26)

Engine run: `build/sources/segond1910/versification-report.md`.

- Rule 1: **61 PASS**, **1 REVIEW** (PSA 18 — 204-char superscription, clearly a
  genuine long title but left unapplied per the >150-char rule), 0 FAIL-VOCAB,
  0 UNEXPECTED. All 61 PASS titles are real superscription text and are captured
  for the `titles` map.
- Rule 2 adjacent pairs: **15** exact-conserving pairs (EXO 7/8, LEV 5/6,
  NUM 29/30, 1SA 23/24, 2CH 13/14, ECC 4/5, ECC 11/12, SNG 6/7, ISA 8/9,
  EZK 20/21, HOS 1/2, HOS 11/12, JON 1/2, MIC 4/5, NAM 1/2). This contradicts
  the preliminary "doesn't cleanly pair" guess for HOS/SNG/ECC/ISA/MIC/NAM/JON —
  the data shows those **do** conserve exactly adjacent pairs.
- Rule 2 wider spans: **2** detected, both with exact net-zero conservation:

  - **JOB 38..41** (diffs -3, +8, +4, -9). This is the anticipated multi-chapter
    cascade, not a single pair: the overflow/underflow chains across all three
    boundaries and only nets to zero at chapter 41. Applying Rule 2 here means
    re-chunking the concatenated verses of Segond 38..41 into canon's chapter
    lengths (verse order preserved), not a single "move N" per boundary. Flagged
    for explicit sign-off.
  - **1SA 20..23** (diffs +1, 0, 0, -1). **Recommend NOT applying.** Inspection
    shows the +1 at 1SA 20 is a *verse split* (Segond 20:42/20:43 split KJV
    20:42), not a boundary shift, while the -1 is the genuine 1SA 23/24 boundary
    shift already captured as a pair. The 4-chapter net-zero is the two effects
    coincidentally cancelling. The real unresolved item is the 1SA 20 split.

- Unresolved (21 rows): provisional=5 (EST 4/10, DAN 3/13/14 — canon Greek
  additions, out of scope), known-variant=1 (ROM 14), textual-variant=3
  (3JN 1, 2CO 13, ACT 19 — pending their own known-variants entries),
  wider-span=5 (JOB 38/39/40/41 + 1SA 20), unexplained=7: **1KI 22** (+1),
  **PSA 18** (the REVIEW case), **ISA 64** (-1), **JOB 34** (-1), **MRK 9** (+1),
  **MRK 10** (+1), **REV 12** (+1). (The 1SA 20 row is the wider-span row whose
  real cause is the 20:42/43 verse split above.) No force-fit applied to any of
  these.
  *(Superseded — see §10 for the full disposition: PSA 18 became the approved
  title exception; JOB 38..41 became the approved window; the actionable
  remaining rows became MERGEs/SPLITs; EST/DAN remained provisional canon gaps;
  ROM 14 remained the pre-existing known-variant note triggered by Segond.)*

## 10. Final disposition (2026-09-26)

The reviewed, approved set now applied by `build/import-segond1910.mjs`:

| transform | count | notes |
|---|---|---|
| Rule 1 — Psalm superscriptions preserved as `titles` | 62 | includes **PSA 18**, approved despite its 204-char superscription (longest in the Psalter; parallels 2 Sam 22) |
| Rule 2 — chapter windows (order-preserving re-chunk) | 16 | 15 adjacent pairs + the **JOB 38..41** four-chapter cascade |
| MERGEs (two source verses → one canon verse) | 6 | 1SA 20:42+43, 1KI 22:43+44, MRK 9:50+51, MRK 10:52+53, REV 12:18+13:1 (cross-chapter), 3JN 1:14+15 |
| SPLITs (one source verse → two canon verses, unambiguous seam) | 4 | JOB 34:36 → 34:36/37, ISA 63:19 → 63:19/64:1 (cross-chapter), 2CO 13:12 → 13:12/13, ACT 19:40 → 19:40/41 |

The three cases originally bucketed as suspected textual variants were re-tested
with the same seam method used on JOB 34 and ISA 64, and all three resolved as
boundary artifacts with no source content omitted or invented, with boundaries
confirmed by content-level comparison against KJV/WEB:

- **3JN 1:15** — **MERGE**: Segond splits canon 3 John 1:14 into source
  `14` (`…bouche à bouche.`) + `15` (`Que la paix soit avec toi!…`).
- **2CO 13:13** — **SPLIT**: Segond merged canon `13:12` + `13:13` into source
  `13:12`; seam `baiser.` / `Tous les saints` (= "holy kiss." / "All the
  saints…").
- **ACT 19:40** — **SPLIT**: Segond merged canon `19:40` + `19:41` into source
  `19:40`; seam `attroupement.` / `Après ces paroles` (= "this concourse." /
  "When he had thus spoken…").

Segond validation triggers only the pre-existing ROM 14 known-variant note; no
new known-variants entries were needed.

Final validator result (`node build/validate.mjs data/segond1910.json`):
**0 errors, 3 warnings, 1 known-variant info note**. The 3 warnings are canon's
provisional Greek-addition gaps (EST 4, EST 10, DAN); the info note is ROM 14.
The full per-item record is in `build/sources/segond1910/versification-report.md`
(its own "Final reviewed disposition" section).
