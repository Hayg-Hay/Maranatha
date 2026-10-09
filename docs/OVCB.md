# Vietnamese: Open Vietnamese Contemporary Bible 2015

`ovcb` / **OVCB** adds **Biblica® Open Vietnamese Contemporary Bible™ (2015)**,
Vietnamese title **Biblica® Thiên Ban Kinh Thánh Hiện Đại™**, distributed by
eBible.org as `vieovcb`. Select **Language → Tiếng Việt** for publisher book
names. Existing English controls remain. The language code is `vi`, with
source metadata identifying ISO `vie` and LDML `vi`.

## Reproducible source and licence

Downloaded from https://ebible.org/bible/details.php?id=vieovcb on 2026-10-09.
The original USFM and USFX archives and extracted files are retained under
`build/sources/ovcb`, with a hash-pinned manifest and Git byte preservation.

- `vieovcb_usfm.zip` SHA-256:
  `8f2849522bd6b88724edecb4972252e8ce536d4381c1e9dd20d36de537e0f880`.
- `vieovcb_usfx.zip` SHA-256:
  `b5b31cc61c16ccabca9d9d23e7c27a37b32e0a93e05531e7f8046cf76aef375e`.
- Manifest SHA-256:
  `816f095eba7ae4462405ce0d348b930445821662b18e8dfdb874d9467f121ac2`.

There are exactly 66 USFM books. Acts, 1 Peter and 3 John have unusual numeric
filename prefixes; book identity comes from the USFM id, not file order.
Package `vieovcbmetadata.xml` declares completion in 2015 and Bible without
Deuterocanon. Original copyright files specify 1982, 1987, 1994, 2005, 2015
Biblica, Inc. and CC BY-SA 4.0. Title/trademark and format-conversion notices
are retained in `data/LICENSE-ovcb.md`. Imports/runtime never download text.

## Inventory and source boundaries

- 66 books, 1,189 chapters, **31,096 source verse records**.
- 31,104 indexed positions, including **eight missing source records**:
  Mark 7:16, 9:44, 9:46, 11:26; Luke 23:17; John 5:4; Acts 8:37, 28:29.
  These remain empty with source-gap notices; no Scripture is inferred.
- No combined ranges in this artifact.
- 1,562 footnotes, 2,426 section/reference/speaker headings, and 113
  superscriptions remain separate, collapsed below Scripture. Twenty-three
  headings occur within verse units; their position is recorded.
- Original words, punctuation and vowel/tone marks remain unchanged. USFM
  styling is flattened and paragraph boundaries become line breaks.

Ordinary chapters use the existing policy of comparing identical publisher
reference identifiers. **3 John 1** (15 rather than 14 verses), **Revelation
12–13** (the dragon on the seashore occurs at 12:18), and **Romans 14** (WEB's
doxology placement differs from OVCB's Romans 16:25–27) use separate reading
blocks with search/interlinear comparison guards. Equal reference identifiers
are not a claim of semantic equivalence or translation-accuracy certification.

The sole selected edition owns its reference extent, including Daniel ending
at chapter 12 and 3 John verse 15. No deuterocanonical text/labels are invented.

## References and search

Publisher book names/abbreviations resolve in every locale: `Giăng 3:16`,
`Gi 3:16`, `Thi Thiên 23`, `Sáng 1:1`. English references work with Vietnamese
labels. Reference keys use NFC, so precomposed/decomposed accents agree.

Vietnamese search is case-insensitive and uses NFC, preserving vowel/tone
distinctions and `đ` versus `d`. Grapheme-offset mapping preserves exact source
text during highlighting/copying, including decomposed combining marks.
Stored Scripture is never normalized to accommodate search. Existing search
behavior for other languages is retained. No remote fonts or APIs are needed.

## Validation and offline caching

`npm run test:ovcb` checks source hashes, deterministic importer/locale outputs,
strict malformed-input handling and real-app `file://` behavior at desktop and
mobile widths, including independent parallel-pane loading with network APIs
blocked. It verifies references, exact verse/search/copy text, annotations,
ordinary Multi-row comparison, gaps and chapter-exception guards.

The independent checker imports neither USFM parser nor importer. Its separate
USFX reader checks every source verse, note and heading and the source extents,
ignoring only presentation whitespace. eBible's USFX inserts some verse-end
markers before continued poetry lines (e.g. Deuteronomy 28:3); the next numbered
verse/chapter supplies the complete unit boundary. Both formats agree when
that continuation is retained. These serializations are witnesses to one
digital edition, not independently verified printed/translation witnesses.

Shell cache v63 precaches the small Vietnamese locale; OVCB data is loaded and
cached lazily. Existing data cache v3 is retained. Changes remain uncommitted
for the user's manual DeepSeek handoff, excluding unrelated LXX/Armenian work.

Validation on 2026-10-09: `npm run test:ovcb` and the full `npm test` suite
passed. The full suite exited 0; its log/status are retained at
`build/cache/ovcb-npm-test.log` and `build/cache/ovcb-npm-test.exit`. Windows
blocked the existing tests' temporary-file renames inside the sandbox; the
successful full run used approved execution outside it.

`build/cache/ovcb-stage.patch` contains only OVCB changes in mixed shared
files. `build/cache/ovcb-stage-files.txt` lists the remaining related paths.
The patch passes `git apply --cached --check`. Nothing has been staged,
committed or pushed.
