# Vulgata Clementina — source defects and anomaly ledger

Edition: **eBible `latVUC`, Clementine Vulgate (1598) with Glossa Ordinaria
(Migne 1880)**, retrieved 2026-10-08.

Source files and hashes are listed in `docs/VULGATA_CLEMENTINA.md` §2. This
ledger records every nontrivial text, numbering or structural anomaly found by
`build/audit-vulgata-source.mjs` and `build/import-vulgata-clementina.mjs`.

**No Scripture text was corrected, paraphrased, normalized or reconstructed.**
Anomalies are recorded here and preserved in the data, not silently fixed.

## A. Structural integrity — clean

| Check | Result |
| --- | --- |
| Books present | 73 (complete Catholic corpus) |
| Chapters | 1334 |
| Verses | 35809 |
| Verse labels that are not positive integers | 0 |
| Chapters with a label gap or out-of-order label | 0 |
| Duplicate `(book, chapter, verse)` references | 0 |
| Unnumbered prose inside a chapter | 0 |
| `U+FFFD` replacement characters | 0 |
| Nested/unknown structural tags | 0 (import aborts on any) |

Every verse label in every chapter is exactly `1..N`, so verse arrays are
indexed directly by the source label with no holes.

## B. Deliberate, non-defect differences

These are properties of the Clementine edition, not errors, and are preserved:

1. **Native verse counts differ from `data/canon.js` in many chapters.**
   Examples: GEN 5 has 31 verses (canon 32), EXO 40 has 36 (canon 38),
   NUM 30 has 17 (canon 16), TOB 1 has 25 (canon 22). This is the Clementine's
   own versification. VULC is therefore marked `nativeVersification: true` and
   is never row-aligned with canon-numbered translations.
2. **Esther has 16 chapters.** Chapters 11–16 are the deuterocanonical
   additions; `canon.js` (provisional) has 10. No canon rewrite was made.
3. **Daniel 3 has 100 verses** (canon 97) — the Song of the Three; **Daniel 13**
   (Susanna) has 65 (canon 64); **Daniel 14** (Bel and the Dragon) has 42.
4. **Sirach 1:1 includes the Prologus and the opening sentence** in the source
   numbering (40 verses in SIR 1). The published boundary is preserved; the
   prologue is not silently split out or assigned an invented reference.

## C. Glossa Ordinaria commentary

- 13775 `<f>` elements (Glossa notes) are present, distributed unevenly.
- The importer counts them and **excludes** them entirely from verse text.
  No commentary author marker (`BEDA`, `ALCUIN`, `AUG.`, `HIERON`, …) occurs in
  any output verse; the test suite asserts this. `<fr>`, `<fk>` and `<ft>`
  sub-elements never reach the dataset.
- Commented vs un-commented books (notes = 0, i.e. no Glossa in this source for
  those books): `LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL
  BAR 1MA 2MA`. This is a coverage characteristic of the Migne Glossa in this
  package, not lost text.

## D. Orthography and punctuation

- The source uses the Latin ligatures `Æ`/`æ` and `œ`, plus `ë`. Only these four
  non-ASCII code points occur (e.g. *cælum*, *cœli*). They are preserved
  exactly; no decomposition or recomposition is applied.
- Editorial square brackets `[` … `]` from the Glossa apparatus are retained
  verbatim in the verse text.
  - Total `[` = 950, total `]` = 950 (balanced across the corpus).
  - 696 verses begin with `[`; 931 verses end with `]`.
  - 1764 verses are individually unbalanced (the brackets mark spans across
    verse boundaries in the printed Glossa layout).
  These are source presentation marks; they are **not** corrected or stripped.
- Whitespace: the importer collapses runs of ASCII whitespace to a single space
  and trims verse ends. The source contains no embedded newlines or double
  spaces inside verse text (verified: 0 verses with `\n`, 0 with `  `).

## E. Metadata notes

- `latVUCmetadata.xml` gives `dateCompleted` **1880** (the Migne Glossa
  edition). The underlying Clementine text is 1592/1598. Both dates are
  recorded separately on the dataset.
- The publisher's `<nameLocal>`/`<abbreviationLocal>` is `VULC`, matching the
  short identifier used in the app.
- License statement in the source: `Public Domain`.
- The details page labels its last update 2014-08-23; `copr.htm` identifies
  source files dated 12 Dec 2025 and HTML generated 8 Oct 2026. These are
  recorded separately from the 1880 print identification and retrieval date.

## F. What was *not* found

- No extra canonical or non-canonical books beyond the 73-book corpus.
- No unnumbered Scripture material requiring a separate "unnumbered source
  text" channel; the importer would abort and report it if present.
- No character-level corruption or mojibake.

If a future retrieval of `latVUC` introduces any of the above, the archive hash
guard in the importer will stop the import and require a fresh reviewed
manifest.
