# English Septuagint import: initial findings

Codex, 2026-10-08. Research only. User requested completing the current Genesis
6–15 batch, pausing further alignment expansion, then trying an English LXX import.
Current DeepSeek working changes were left untouched. No application edits,
imports, commits, merge, push or deletion performed for this investigation.

## Edition and reuse declaration

BibleHub explicitly identifies its English LXX as **Brenton's Septuagint
Translation**, Sir Lancelot Charles Lee Brenton, 1851:
https://biblehub.com/sep/genesis/1.htm

eBible's original Brenton edition `eng-Brenton` explicitly declares public-domain
status, and supplies downloadable USFM, USFX, VPL and HTML formats:
https://ebible.org/bible/details.php?id=eng-Brenton
https://ebible.org/eng-Brenton/copyright.htm

This is distinct from Updated Brenton (`englxxup`) and LXX2012. Do not silently
substitute a modernization for the edition requested by the user. BibleHub's
chapter page separately credits its section headings to Berean Bible; those
headings are separate editorial material and need not be copied for this import.

## Candidate source and fidelity

Prefer investigating the original-Brenton structured download from eBible,
rather than scraping hundreds of BibleHub presentation pages. BibleHub can serve
as a sample comparison. This is a recommendation, not a claim that the two
digital editions are byte-identical: punctuation, notes and reference annotations
already vary in the inspected samples. Identify the imported digital edition
honestly, preserve its exact wording and record the archive URL/date/SHA-256.

eBible's index lists deuterocanonical material, including Tobit, Judith, Greek
Esther/Daniel, Wisdom, Sirach, Baruch, Epistle of Jeremy, Susanna, Bel, Maccabees,
I Esdras and Prayer of Manasses. Archive inventory must establish exact book,
chapter and verse coverage; the web index alone is not an import inventory.
https://ebible.org/eng-Brenton/

USFM is the preferred candidate to inspect first: it can preserve verse markers,
footnotes and other structural distinctions. Parser correctness, archive encoding,
source metadata and exact coverage remain unverified. Keep footnotes distinct
from Scripture and do not import front/back matter as fake Bible books.

## Numbering: important integration limit

- eBible and BibleHub place the nakedness statement at English Genesis 2:25,
  and the serpent dialogue at English 3:1. BibleHub additionally annotates these
  with parenthesized alternate references `(3:1)` and `(3:2)`.
- Our shipped Swete transcription has both statements inside source GEN 3:1.
  Brenton is therefore not automatically a one-to-one gloss of its containers.
- eBible Psalm 9 numbers the superscription as verse 1, followed by the opening
  thanksgiving as verse 2. Preserve the edition's numbering and superscriptions;
  do not place it next to WEB solely by equal numerical references.
- Inspect Psalms, Jeremiah, Esther and Daniel plus the standalone additions,
  with explicit book-ID and scheme declarations before integration.

Sample pages examined:
https://biblehub.com/sep/genesis/2.htm
https://biblehub.com/sep/genesis/3.htm
https://ebible.org/eng-Brenton/GEN01.htm
https://ebible.org/eng-Brenton/GEN02.htm
https://ebible.org/eng-Brenton/GEN03.htm
https://ebible.org/eng-Brenton/PSA009.htm
https://ebible.org/eng-Brenton/JER01.htm

## Proposed next task after the current batch

1. Cache and hash a structured original-Brenton archive and its public-domain
   declaration; inventory its full coverage and note/reference markers.
2. Build a deterministic importer with source-fidelity checks and explicit
   edition/book/scheme metadata; leave all existing corpora unchanged.
3. Make Brenton readable offline with its own numbering, initially through an
   independent reading pane/edition view. Determine the smallest integration
   supported by the existing UI rather than assume Canon comparison is safe.
4. Verify representative Genesis, Psalms, Jeremiah and additions, then source
   fidelity across the imported corpus, offline caching and browser/mobile UI.
5. Only later add reviewed cross-edition correspondences. Existing Greek maps
   reviewed against WEB/KJV/OSHB do not certify Brenton numbering or content.

Implementation will use the user's original-folder feature-branch workflow and
a manual DeepSeek prompt. Codex independently verifies. Publishing remains
subject to explicit user approval; no implementation has begun for Brenton.
