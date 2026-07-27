# OSHB Import Architecture — Verse-Oriented Placement Model

**Status**: Design document. Reference prior to rewriting `build/import-oshb.mjs`.
**Date**: 2026-07-27

## 1. Core Principle

The importer is **verse-oriented**, not chapter-oriented. Every OSHB verse is
treated as an independent source object. Chapters exist in the source XML only
to group verses for efficient access — they impose no constraints on
destination placement.

The importer asks exactly one question:

> **Where should this source verse appear in Maranatha's canonical
> versification?**

No trimming, no chapter-length heuristics, and no pre-processing occur before
verse placement.

## 2. Inputs

For every OSHB verse, the following information is available:

| Field | Source | Required? |
|---|---|---|
| OSIS book, chapter, verse | Parsed from `<verse osisID="...">` | Always |
| Hebrew surface text | Extracted from `<w>` and `<seg>` children | Always |
| KJV target reference | Parsed from `<note>KJV:Book.Ch.Verse>` | Optional — present on 2,026 verses |
| Lemma, morphology, Strong's | `<w>` attributes | Ignored for v1 |

**Destination derivation rule:**

- If a `<note>KJV:Book.Ch.Verse>` is present, the destination is
  `KJV_TO_CANON(Book).Ch.Verse`, where `KJV_TO_CANON` is a fixed lookup table
  mapping KJV book abbreviations to Maranatha canon IDs.

- If no KJV note is present, the destination defaults to the OSIS position:
  `OSIS_TO_CANON(OSISBook).OSISChapter.OSISVerse`.

This rule is applied independently to every verse with no chapter-level
preprocessing.

## 3. Placement Engine

The placement engine is the central abstraction. Every source verse passes
through a single operation with four possible outcomes.

Each verse arrives with `(destinationBook, destinationChapter, destinationVerse, text)`.
The engine checks the destination slot.

### PLACE

**Condition**: The destination slot is empty.

**Action**: Store the verse text at the destination.

This is the common case — approximately 23,100 of 23,213 verses follow this
path.

### REPLACE

**Condition**: The destination slot is occupied by a verse that has no KJV note
and is a **Psalm superscription** (identified by being in the Psalter and being
displaced by a verse with a KJV note targeting the same slot).

**Action**: Discard the existing occupant. Store the new verse.

**Correctness**: Psalm superscriptions (e.g., "A Psalm of David, when he fled
from Absalom his son") are Masoretic chapter-heading material counted as verse
1 in the MT. The KJV note on OSHB Ps.3.2 maps it to KJV Ps.3.1 — the first
verse of the Christian Psalm. The superscription (OSHB Ps.3.1, no note) is
correctly displaced.

This outcome has been verified against all **67 Psalm collisions** in the
corpus. Every displaced verse is a superscription — zero ordinary content is
lost.

### MERGE

**Condition**: The destination slot is occupied by a verse, and the collision
represents one of the three verified Masoretic→Christian verse merges.

**Action**: Append the new verse's text to the existing occupant's text,
separated by a space. The two Masoretic verses together form one Christian
verse.

The three verified merge cases are:

| Masoretic Verses | Christian Verse | Verified Against |
|---|---|---|
| OSHB Num.25.19 + Num.26.1 | KJV Num.26.1 | `data/kjv.json` — "And it came to pass after the plague, that the LORD spake unto Moses..." |
| OSHB 1Sam.20.42 + 1Sam.21.1 | KJV 1Sam.20.42 | `data/kjv.json` — "And Jonathan said to David, Go in peace... And he arose and departed..." |
| OSHB 1Kgs.22.21 + 1Kgs.22.22 | KJV 1Kgs.22.22 | `data/kjv.json` — "And the LORD said unto him, Wherewith? And he said, I will go forth..." |

All three were confirmed by direct inspection of the KJV text in Maranatha's
own `data/kjv.json`. The Christian verse genuinely contains the concatenated
content of both Masoretic verses. These are textual merges, not numbering
mistakes.

**Detection rule**: A merge is detected when a note-bearing verse collides with
a no-note verse that is its immediate OSHB successor (same book, same or
adjacent chapter, consecutive verse number). The merge cases are
programmatically detectable by this rule and do not require a hardcoded
lookup table.

### ERROR

**Condition**: Collision does not match REPLACE or MERGE patterns.

**Action**: Log the collision detail and abort the import. Do not silently
discard content. Any unexpected collision must be investigated before the
importer can be trusted.

This path has **never been reached** in the current corpus — all 71 collisions
resolve to REPLACE (67) or MERGE (3) or cascade (1). The ERROR path exists as
a safety net for future data changes.

## 4. Verified Behaviours

The following have been confirmed by full-corpus simulation against 23,213
verses across 39 books:

| Behaviour | Count | Status |
|---|---|---|
| Psalm superscriptions displaced | 67 | All verified as title/attribution text, not ordinary verses |
| 1 Chronicles 12 numbering cascade | 1 | Complete cascade — every subsequent verse has -1 KJV offset |
| Chapter-boundary shifts (Genesis, Exodus, etc.) | ~30 chapters | All resolve cleanly via KJV notes with no collisions |
| Verse merges (Num, 1Sam, 1Kgs) | 3 | All confirmed against KJV text |
| Note-vs-note conflicts | 0 | No two KJV notes target the same destination |
| KJV mapping notes examined | 2,026 | All parsed; 1 malformed (`1Kgs.22.43!b`) |
| Total verses processed | 23,213 | Full corpus |

## 5. Architectural Consequences

This design eliminates the need for:

- **Trimming heuristics.** No front-trimming or back-trimming of chapters.
  Verses flow to their KJV-derived destinations independently.

- **Manually-maintained remapping tables.** The existing `SPECIAL_VERSIFICATION`
  table (which contains only the 1 Chronicles 5/6 entry) is replaced by
  algorithmic derivation from KJV notes. No new entries need to be added.

- **Chapter-length dependency.** The importer does not consult `canon.js` for
  expected verse counts during placement. Validation is a separate,
  post-placement step.

The importer derives destination behaviour from **authoritative source
metadata** (`<note>KJV:...>` annotations embedded in the OSHB XML) rather than
from handcrafted mappings.

## 6. Remaining Implementation Work

1.  **Implement the placement engine.** Rewrite `build/import-oshb.mjs` to
    collect all verses first, determine destinations via KJV notes, then place
    through the PLACE/REPLACE/MERGE/ERROR dispatch.

2.  **Implement merge detection.** Automatically detect merge cases by the rule
    "note-bearing verse collides with its immediate OSHB successor" rather than
    hardcoding the three known cases.

3.  **Handle the malformed KJV note.** `1Kgs.22.43!b` in the OSHB source
    contains a `!b` suffix (sub-verse indicator). The KJV-note parser must
    strip trailing `!a`/`!b` suffixes before matching the `Book.Ch.Verse`
    pattern.

4.  **Regenerate `data/he.json` and `data/he.js`** by running the rewritten
    importer.

5.  **Validate against `canon.js`** — run `node build/validate.mjs data/he.json`
    and verify that only Neh.7 (72→73) and Isa.64 (11→12) remain as known
    versification differences requiring `data/known-variants.js` entries.

6.  **Document attribution requirements** in `PROJECT_HISTORY.md` and verify
    the CC BY 4.0 attribution text in `data/he.json`'s `source` field matches
    the OSHB LICENSE.md exactly.