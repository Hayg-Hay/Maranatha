# Western Armenian: electronic witness and print-acquisition gate

2026-10-09. Continued source identification; research only, no Scripture
changes or publisher contact. This supplements, and narrows conclusions from,
`armwestern-pilot.md` and the external-review follow-up.

## A catalogue title is not a print scan

Internet Archive item:
https://archive.org/details/TheHolyBibleInArmenianWestern1853NT

The item contains a 286-page PDF and a companion tab-separated text file. Its
PDF metadata says Notepad / doPDF 5.2 on Windows XP, created 2007-10-24; the
first page visually shows monospaced electronic references such as Mth 1 1,
not an original 1853 title page or typesetting. It was uploaded to Archive in
2015. The uploader's English language field is also not reliable language
identification. It is an electronic witness **labelled** 1853, not proof of
the edition's actual print impression or full redistribution rights.

Downloaded files and original catalogue responses are cached in
`build/cache/armenian-catalogues/`; no full unknown-rights ebook is added to
the committed Scripture source tree. Diagnostic report and file hashes:
`build/reviews/armwestern-ebook-comparison.json`. Probe script:
`build/research-armwestern-ebook.mjs`.

## Wording fingerprint result

All 40 dispersed module anchors match this text after quotation-mark folding
for diagnosis; 37 match with NFC/case/ligature/whitespace comparison only.
Both original strings and source line numbers remain in the report. Quote
folding is never used to rewrite Scripture or certify punctuation fidelity.

This establishes a strong electronic textual-family match, unlike the 1884
print's different wording. It does not identify the module's actual print,
clear rights, or prove which electronic artifact was derived from which.
The 2007 PDF date precedes the module's 2008 config date, but that date records
metadata changes and does not prove initial module-text creation chronology.

## John 6: refined cause assessment

The tab-separated text has **two consecutive records explicitly labelled
John 6:51**, followed by John 6:52 containing the dispute about eating flesh.
The module instead puts the second 6:51 fragment in slot 52 and shifts the
later indexed slots, ultimately combining final material into slot 71.

The cache's re-merging of 51/52 fragments into conventional 51 is therefore
supported by labels in a same-wording electronic witness; it is not supported
only by an English count. Conversely, the separate 1884 print has native
51/52 and a final 72. Those are **different witnesses**, and cannot be used
interchangeably to declare the module split native or the repair incorrect.

Repeated labelled fragments are a plausible cause of an ordinal-row conversion
error, but the precise upstream conversion/extraction history is unproven.
Mark's kingdom saying is at 9:1 in the ebook, whereas the module merges it
into 8:38; the cache restores that labelled boundary. The electronic text still
has other merged/empty records requiring evidence-ledger review, not blanket
acceptance of every cache repair.

## Scope and labels requiring native-unit architecture

The file has 7,962 rows and 7,958 distinct reference labels. Repeated labels:
Luke 4:38, John 6:51, Acts 28:31 and Philippians 4:21. These are text fragments
with shared labels, not automatically duplicates to discard. Blank labelled
records include Matthew 17:21 and 2 Corinthians 2:1 and 6:1; in Matthew,
related wording is present in an adjacent record, so this is not automatically
a lost-text declaration.

The diagnostic chapter-extent comparison identifies 2 Corinthians 13 with
13 labels, 3 John with 15, and Revelation 12 with 18. Raw KJV-shaped indexing
cannot simply define their native extents. The two Corinthians chapter-start
gaps remain blank in this electronic witness too; it supplies no restoration
text for them. Check all new extent and fragment relationships against an
identified print before proposing source replacement or maps.

Native-unit storage must distinguish a repeated-label text fragment from a
new verse, a true duplicate, a combined passage and an empty indexed position.
Keep physical source rows/offsets and citation labels separately. A mapping
may combine fragments for navigation/comparison, but must preserve original
wording, order and source labels and record how it was established.

## Lineage and historical print lead

The module's own evidence still ends at Slavic Bible via Unbound. A CrossWire
2008 mailing-list discussion identifies the Slavic Bible program and old site
URLs, but establishes no Armenian print edition. Mirrors/getBible reusing
CrossWire metadata are not independent print witnesses.

Source: https://www.crosswire.org/pipermail/sword-devel/2008-January/026644.html

University of Pennsylvania's Online Books Page links Elias Riggs's
`Astowatsashownch' Girk' Hin ew Nor Ktakaranats'`, American Bible Society,
**1853**, to HathiTrust catalogue record **103048520**. This is a much stronger
bibliographic lead than an uploader's ebook filename. Its catalogue access
currently triggers browser verification; no original page images were obtained
or inspected in this turn. The catalogue alone does not prove a textual match.

Sources:

- https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Riggs%2C+Elias%2C+1810-1901
- https://catalog.hathitrust.org/Record/103048520

An Archive catalogue query for Armenian plus year 1853 returned seven items,
none identifiable as this Bible. This is a bounded query result, not evidence
that no original 1853 scan exists anywhere.

## Recommended next step

**Print acquired and inspected:** the user supplied the NYPL 1853 PDF. It
confirms the print identity but differs in wording from the module. See
[armwestern-1853-print-result.md](armwestern-1853-print-result.md) for exact
pages and the decision against mixing the witnesses or filling gaps from it.

**Further progress:** the public HathiTrust API resolved a NYPL volume,
`nyp.33433097476828`, OCLC 32404888, dated 1853 and marked Full view. Google's
independent barcode lookup resolves the same copy to `vWQManhLqYMC`. Its cover
barcode was inspected, but title/text pages and the full PDF remain behind
human browser verification. See [armenian-print-acquisition.md](armenian-print-acquisition.md)
for stable links and an exact manual acquisition request. The scan is
bibliographically identified, not yet a certified wording match.

Acquire accessible title/imprint/contents and sample NT pages from the Riggs
1853 library witness, via its public viewer or a library-supplied copy. Compare
the 40 wording anchors, then the start/tail ledger. If the wording differs,
record the mismatch and continue with separately identified revision witnesses.

The electronic witness can help trace source labels and causes meanwhile,
but is not yet an approved substitute for the historical print or permission
grant. Do not overwrite the current cache, reverse the repair commit, or fill
gaps based on this report. No regression suite, staging, commit or push here.
