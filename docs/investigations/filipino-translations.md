# Filipino / Tagalog editions for Maranatha

Initial investigation, 2026-10-09. Scope: editions catalogued as Tagalog that
serve the user's Filipino-language request. Cebuano, Ilocano, Hiligaynon and
other Philippine languages are separate language additions, not replacements.
No Scripture was downloaded/imported and no application code was changed.

## Recommended first candidate

**Biblica Open Ang Salita ng Diyos / Open Tagalog Contemporary Bible 2025**
is the strongest first modern lead. Open.Bible lists a complete Bible and
USX, Paratext/USFM and Word downloads, under CC BY-SA. The publisher-supplied
YouVersion notice explicitly specifies CC BY-SA 4.0 and attribution,
title/trademark and derivative-work provisions. Use the exact open edition;
do not assume older similarly named licensed platform texts are identical.

There is a metadata inconsistency to resolve from the actual package:
Open.Bible currently identifies revision 2, updated October 28, 2025, but its
copyright field lists 2009, 2011, 2014, 2015. The corresponding YouVersion
notice lists 2009, 2011, 2014, 2025. Preserve the exact source metadata and
document the discrepancy rather than silently substituting a year.

Sources:

- [Official product/downloads](https://www.open.bible/bibles/biblica-open-tagalog-contemporary-bible-2025)
- [Publisher edition and licence notice](https://www.bible.com/versions/1264)

## Alternatives

**Ang Dating Biblia / Ang Biblia, original 1905.** Historical companion.
CrossWire's `TagAngBiblia` 1.2 (2008-07-19), language `tl`, explicitly labels
its distribution Public Domain and identifies the 1905 edition. STEP repeats
that provenance. These are distributor statements about that source, not a
new worldwide copyright determination. Audit the complete module and retain
its original wording, spelling, reference labels and annotations.

Do not substitute **Ang Biblia (1905/1982)**: the separately listed YouVersion
edition credits Philippine Bible Society copyright 1982. Later revisions must
be treated as distinct artifacts with their own terms.

Sources: [CrossWire source](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=TagAngBiblia),
[STEP provenance](https://www.stepbible.org/version.jsp?version=TagAngBiblia),
[1982 revision notice](https://www.bible.com/versions/2196).

**Tagalog Unlocked Literal Bible (TGLULB).** Open literal/study alternative.
eBible credits Door43 World Missions Community, copyright 2018, and provides
USFM, USFX, VPL and other formats under CC BY-SA 4.0. Its published table of
contents lists all 66 books. That does not replace an audit of actual records,
gaps, combined references and translator/editorial metadata. Distinguish this
specific eBible artifact from similarly named Wycliffe Associates packages
with different editions/credits; it is not labelled public domain here.

Sources: [Edition, source formats and terms](https://ebible.org/details.php?id=tglulb),
[published book coverage](https://ebible.org/tglulb/).

**Magandang Balita Biblia (MBB).** A permission-based route. Its publisher
describes a meaning-oriented translation intended for understandable reading.
Published quotation terms permit up to 500 verses and less than half a book;
larger use requires Philippine Bible Society permission. That allowance does
not authorize bundling the whole Bible in Maranatha.

Versions with deuterocanonical books exist and could be useful for expanded
Tagalog coverage, subject to an appropriate redistribution grant and source
audit. Do not confuse Tagalog MBB with similarly titled Bibles in other languages.

Sources: [Publisher-provided terms](https://www.biblegateway.com/versions/Magandang-Balita-Biblia-MBBTAG/),
[deuterocanonical edition front matter](https://ebible.org/study/content/texts/TGLMBB/FR0.html).

## Implementation acceptance after selection

Obtain and pin the exact structured archive and licence evidence; inventory
books, chapters, source labels, empty/combined positions, headings and notes.
Preserve Filipino/Tagalog words, accents, apostrophes, hyphens and punctuation;
never modernize the historical text or fill absent records from another edition.

Add the selected edition's book names and abbreviations, accepting references
such as `Juan 3:16` and `Mga Awit 23` where those source names are supported.
Retain the source's language identity (`tgl`/`tl` where declared), rather than
silently treating every Philippine-language Bible as Filipino.

Use existing comparison rows for compatible indexed references, with explicit
chapter/unit exceptions. Keep source notes below the passage, collapsed by
default. Verify exact copied text, accents/search highlighting, local script
loading and desktop/mobile offline behavior. Published listings alone do not
certify completeness, verse correspondence or translation accuracy.

## Selected edition

The user selected ASD. The user-supplied 2025 USFM package was imported on
2026-10-09; its 2025 headers resolve the product page copyright discrepancy.
See [../ASD.md](../ASD.md) for the pinned artifact, inventory and validation.
