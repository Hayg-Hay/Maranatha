# Thai editions for Maranatha

Initial source selection, 2026-10-09. Thai is the user's next language priority.
This document records candidate editions and implementation requirements; no
Thai Scripture has been imported and no application code was changed.

Follow-up: the user selected TCV 2025 and supplied the official-format USFM ZIP
under `/docs`. TCV is now implemented with source auditing and Thai-safe
references/search. See [implementation notes](../TCV.md).

## Recommended first candidate: Open Thai Common Version 2025 (TCV)

Biblica's Open.Bible catalogue identifies this as a complete Bible, copyright
2025, and offers USX, Paratext/USFM and Word downloads. The catalogue publication
date is July 10, 2026; this is distinct from the edition's 2025 copyright year.
Its product label is CC BY-SA. The Biblica-supplied YouVersion edition notice
specifies **CC BY-SA 4.0**, copyright attribution, title preservation and
trademark/derivative-work provisions. The downloaded package's `metadata.xml`
must still be inspected and retained before importing.

This is the first modern full-Bible lead to audit. It is distinct from the Open
Thai New Contemporary Version. Published book listings and a Genesis reading
sample are available, but these do not establish complete archive coverage,
source fidelity, translator-method details or translation accuracy.

Sources:

- [Official product and downloads](https://open.bible/bibles/biblica-open-thai-common-version-2025)
- [Biblica edition notice and licence](https://www.bible.com/versions/4502)
- [Distributed Genesis sample](https://www.bible.com/bible/4502/GEN.1.TCV)

## Other candidates

**Biblica Open Thai New Contemporary Version (TNCV).** Another complete-Bible
lead, with copyright years 1999, 2001, 2007. Its Biblica-supplied edition notice
also specifies CC BY-SA 4.0. Obtain the actual open edition's structured files;
do not use an older platform's copyright notice to identify a different licensed
artifact, or substitute TCV for TNCV. The guessed Open.Bible product URL did not
resolve during this investigation, so its structured download route remains to
be located.

Source: [Open TNCV edition notice](https://www.bible.com/versions/4501).

**Thai King James Version (Philip Pope).** eBible provides a full-Bible reading
listing and USFM/USFX sources. It credits Philip Pope, copyright 2003, and
expressly permits redistribution in any format under **CC BY-NC-ND 4.0**, with
attribution, no sale for profit, and no alteration of Scripture words or
punctuation. It is translated from the English KJV. CrossWire's ThaiKJV module
3.0 (2025-04-16) records permission specifically to distribute a SWORD module;
that module grant should not be substituted for eBible's explicit source terms.
Useful as a KJV-family companion after a source audit.

Sources: [eBible source formats](https://ebible.org/details.php?id=thaKJV),
[exact redistribution notice](https://ebible.org/thaKJV/copyright.htm),
[CrossWire metadata](https://ftp.crosswire.org/sword/modules/ModInfo.jsp?modName=ThaiKJV).

**Thai Freedom Bible.** eBible identifies it as public domain and explicitly
labels it a draft. The current copyright page is dated October 1, 2026; the
separately retrieved September table of contents lists only 22 NT books, while
the details page includes OT samples. Do not infer either complete or current
coverage from those inconsistent snapshots. Audit the latest actual archive and
retain the draft status. Lower priority as the first established Thai edition.

Sources: [draft status](https://ebible.org/thafb/copyright.htm),
[edition details](https://ebible.org/details.php?id=thafb),
[retrieved table of contents](https://ebible.org/thafb/).

**New Thai Version / Thai Standard Version.** Additional established candidates,
but an appropriate full offline redistribution grant has not been established
here. The New Thai Version eBible notice identifies copyright belonging to its
foundation. Availability for online reading or downloading an app is not by
itself an open licence for Maranatha's bundled data.

Sources: [New Thai Version metadata](https://ebible.org/details.php?id=thantv),
[Thai Standard Version publisher listing](https://www.bible.com/th/versions/174).

**Language disambiguation:** eBible's `cth` "Thai Phum" Bible is in Thaiphum Chin
of Myanmar, not Thai (`tha` / application language `th`). It is not a substitute.

## Implementation requirements after edition selection

- Pin the exact package, licence, metadata, source hashes and retrieval date.
  Inventory numbered labels, missing or combined records, notes and headings.
- Preserve Thai text, vowels, tone marks and all source punctuation. Never
  modernize wording or fill absent text from another Bible.
- Thai requires search that retains combining vowels and tone marks. The
  current generic accent-stripping path must not be applied to Thai.
- Inspect zero-width spaces and any source word-division markup. Search may
  need to ignore layout-only separators while mapping highlights back to exact
  original character offsets; reading and copied source text must remain intact.
- Add publisher Thai book names/abbreviations. Accept references with Thai
  numerals, e.g. `ยอห์น๓:๑๖`, by normalizing reference input only.
- Test local font fallbacks, line wrapping, grapheme-safe highlights, desktop
  and mobile script loading and offline operation.
- Use shared comparison rows where the reference scheme supports them, with
  explicit source exceptions rather than a language-wide exclusion. Keep
  notices and annotations accessible below the passage, collapsed by default.
