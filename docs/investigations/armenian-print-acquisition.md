# Identified 1853 Western print: acquisition notes

2026-10-09. No purchase, publisher message or Scripture modification.

## Identified volume

- Title: `Astowatsashownch' Girk' Hin ew Nor Ktakaranats' ...`.
- Author/translator catalogue lead: Elias Riggs.
- Publication: American Bible Society, 1853 (UPenn catalogue).
- Holding library: New York Public Library (HathiTrust API).
- OCLC: `32404888`.
- HathiTrust record: `103048520`.
- HathiTrust volume: `nyp.33433097476828`.
- API rights label: `pd`, US rights string `Full view`; this is the provider's
  statement, not a new worldwide rights determination.
- Independently associated Google Books volume: `vWQManhLqYMC`, resolved by the
  same NYPL barcode. The cover image visually shows the library barcode.

Public links:

- https://catalog.hathitrust.org/Record/103048520
- https://babel.hathitrust.org/cgi/pt?id=nyp.33433097476828
- https://books.google.com/books?id=vWQManhLqYMC&printsec=frontcover
- Metadata: https://catalog.hathitrust.org/api/volumes/brief/recordnumber/103048520.json
- Catalogue: https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Riggs%2C+Elias%2C+1810-1901

## Access result

**Resolved by user supply:** the complete PDF is now under docs, SHA-256
`0232d11aa695fa06d3a3901fc44f33dd7b1ae3d35e35b990907bf1f35714404a`,
1,195 pages. Its title/imprint and pilot passages were visually inspected.
See [armwestern-1853-print-result.md](armwestern-1853-print-result.md).
The automated-access limitations below are retained as acquisition history.

Public metadata and Google's viewer/page inventory were obtained. The reader
advertises full view and a PDF link, while an older ViewAPI response says PDF
download false; do not infer successful download from either alone. The full
PDF request triggered a human-verification page. HathiTrust's reader also
requires browser verification. Three attempted unsigned front-matter image
requests returned image-not-available placeholders; they were not print evidence.
No challenge was solved or bypassed, and no complete PDF was obtained.

The title/imprint, NT contents and actual wording still need visual inspection
from the volume itself. API year plus cover barcode is not sufficient to
certify an exact module-text match.

## Manual acquisition

Open either public reader normally in a browser and complete any required
human verification. If the provider offers a PDF download, save it under
`docs/` with an identifying name such as `Riggs-Western-Armenian-1853.pdf`.
If only page viewing is available, obtain title/imprint/contents images and
sample NT pages through the provider's permitted controls instead.

The first sample request is wording identification, not transcription of the
entire Bible: use `build/reviews/armwestern-fingerprint-sample.json` (40 anchors)
and the run-start/tail ledger. Include John 6:51 and its chapter tail, Mark
8:38–9:2 and its chapter tail, plus 2 Corinthians 2:1 and 6:1. Record printed
page numbers and viewer identifiers. Do not assume the 1884 pagination applies.

If the supplied print differs from the module, record the differences and
identify other revisions, rather than overwriting Scripture from a different
edition. Edition identification remains the source-acceptance gate.
