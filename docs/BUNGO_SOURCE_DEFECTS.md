# Bungo-yaku source-defects ledger

This ledger records every defect or notable condition retained from the pinned
CrossWire `JapBungo` 2.0 module. Nothing here is corrected, renumbered, filled
or merged: the source is imported faithfully and the condition is **disclosed**
to the reader. Counts and references were verified from the binary module in
`build/import-bungo.mjs` and re-checked independently by `build/test-bungo.mjs`.

## 1. Declared source gaps (empty indexed verse slots)

Three indexed slots carry no separately indexed text. The verse array keeps the
slot (as an empty string) so every later verse retains its source index; the
reading view shows a factual placeholder and the notice below, never text copied
from an adjacent verse and never a guessed reconstruction.

| # | Reference | Metadata `status` | Disclosure | Verified surrounding source text |
| --- | --- | --- | --- | --- |
| 1 | Exodus 7:25 (`EXO.7.25`) | `source-gap` | `No separately indexed text in this source slot` | The adjacent source verse Exodus 7:24 contains the seven-day clause. |
| 2 | 2 Samuel 19:25 (`2SA.19.25`) | `source-gap` | `No separately indexed text in this source slot` | The adjacent source verse 2 Samuel 19:26 contains the arrival clause. |
| 3 | 2 Chronicles 2:13 (`2CH.2.13`) | `source-gap` | `No separately indexed text in this source slot` | The adjacent source verse 2 Chronicles 2:12 contains the Hiram-sending clause. |

The three slots are the **only** empty verse records in the whole module
(31099 of 31102 slots carry text). They are declared to availability, so a
reference such as `出エジプト記7:25` resolves and displays the notice rather
than being treated as missing. The authored explanatory note is labelled as a
source-gap disclosure; it is **not** presented as an original source footnote
and is never inserted into Scripture.

## 2. Empty source slot versus printed native labels

The module's published indexing is the reference scheme faithfully retained
here. It is not proof of the printed native labels, and no claim is made that a
printed Bungo edition also omits or combines these verses. No verse has been
split, copied into an empty slot, renumbered, or mapped to an unreviewed
equivalence.

## 3. Daniel and the deuterocanonical books

The source module has **12 Daniel chapters** and **no deuterocanonical books**.
Maranatha's `canon.js` is Catholic (73 books, provisional Daniel with 14
chapters), so Bungo declares `nativeReferenceScope` and, when it is the sole
selected edition, reads Daniel in its 12 source chapters. The seven
deuterocanonical books are shown with the ordinary missing-book placeholder and
no fabricated Japanese text. Daniel 13–14 are never offered as Bungo chapters
on the strength of the Catholic navigation skeleton.

Where the source's own extents are shorter than the Catholic canon (for example
Esther 4 and Esther 10, or Daniel 3), the source block simply shows its own
extent with the native-numbering notice; those differences are not defects in
the context of a native-numbered edition and are not "fixed".

## 4. OSIS ruby/gloss readings

The module marks 332 709 inline `<w gloss="…">` ruby readings. These are
editorial reading aids, not Scripture. They are removed from the verse text and
counted in the inventory; the base text between the tags is preserved exactly.
They are never appended to Scripture, and the original source cache retains them
for any future reference.

## 5. Psalm superscriptions

139 `<title type="psalm">` records are preserved as separate source headings and
rendered above the chapter with a disclosure that they are source
superscriptions shown separately from the verse text. They are never merged into
the verse. The book-group titles (`旧約聖書`, `新約聖書`) are preserved in
`structuralHeadings`.

## 6. Not defects

- Historical kana/kanji, punctuation and whitespace are the source text and are
  retained verbatim; they are not spelling errors to be modernised.
- Trailing spaces present in source verse records are retained as source
  whitespace; no Unicode normalization is applied.
- The `TextSource` host being DNS-unavailable is a distribution condition, not a
  text defect; the pinned official CrossWire archive is used instead (see
  `data/LICENSE-bungo.md`).
