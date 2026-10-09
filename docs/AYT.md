# Alkitab Yang Terbuka — Indonesian

`ayt` / **AYT** is the official YLSA Indonesian dataset. It is loaded locally
through `data/ayt.js`, including under `file://`. Choose **Language → Bahasa
Indonesia** for Indonesian book labels. Indonesian names and publisher
abbreviations also work with English book labels: `Yohanes3:16`, `Yoh 3:16`,
`Kejadian1:1`, `Kej 1:1`, and full-width numeric references. English references
remain available when Indonesian labels are selected.

## Source and terms

Repository: <https://github.com/sabdacode/ayt>. Pinned commit:
`8ff5d79c5b0645d634ce6374a2cb0a56a8253cd5`. Retrieved 2026-10-09.
The upstream archive and 66 SFM books, JSON, CSV, README, licence and commit
record are cached in `build/sources/ayt`. The 72-file manifest is itself
hash-pinned by the importer. Git preserves these files byte-for-byte.

Upstream archive SHA-256:
`e38586c549fac39e8cb0183cc1ee3053ee09755503edf4473c17bf56376c9342`.

The publisher identifies copyright YLSA-AYT 2011,2024 and permits
non-commercial distribution, with attribution/share-alike terms for derivative
resources. It does not specify a numbered Creative Commons licence version.
The exact notice and attribution are in `data/LICENSE-ayt.md` and the cached
`LICENSE.html`. This is a repository snapshot, not a claim to reproduce a
particular final printed edition. Per-book SFM `rem` fields include the
publisher's CLEANING-stage labels; they are retained as source metadata.

## Text and annotations

The dataset supplies **66 books, 1,189 chapters and 31,102 numbered records**.
Of these, three contain only literal reference pointers:

- Isaiah 22:10 and 22:11: `(22:9)`.
- Isaiah 22:18: `(22:17)`.

The text at 22:9 and 22:17 is retained exactly. The pointers are never replaced
by invented split text or duplicated earlier verses. Each receives a factual
source-placeholder notice.

Reading text comes from the publisher's JSON. Only the 2,603 `<t />` placement
markers are removed; all words, punctuation, spacing, source superscriptions
and parenthetical alternate Psalm numbers remain as provided. JSON title
records are also retained as metadata.

The SFM provides 1,665 footnotes, 147 cross-reference annotations and 2,939
text-bearing headings. Its 116 `d` markers are structural and have no separate
heading text: the publisher includes those superscriptions in numbered Psalm
text. The markers are retained as metadata, with no empty headings invented
and no superscription words stripped out of verse 1.
Two section headings occur inside numbered text (1 Samuel 4:1 and Acts 8:1);
their positions are retained explicitly rather than labelled as after the verse.

The SFM corroborates every numbered JSON reference and base verse. The 78
cross-format differences are limited to Selah parentheses and comma-separated
table rendering. They are recorded with both source representations; the
importer preserves JSON punctuation rather than editing it to resemble SFM.

Footnotes and separate headings are accessible in collapsed **AYT notes and
edition details** below the reading passage. They are excluded from Scripture
search and from copied verse text. All original annotation fields and source
files remain available for inspection.

## Comparison policy

The complete publisher reference grid has the same book/chapter/verse extents
as Maranatha's KJV dataset. Ordinary passages use the existing policy of
comparison by matching reference identifiers. This is a reference comparison,
not certification that equal numbers contain identical text or that every
printed native reference boundary has been semantically verified.

Two chapter-level exceptions are handled explicitly:

- **Isaiah 22** has the merged text/reference pointers noted above.
- **Romans 14** ends at verse 23; AYT keeps the doxology at Romans 16:25–27,
  while WEB places it at Romans 14:24–26.

These chapters use independent reading blocks and suppress same-numbered
search comparison and original-language interlinear captions in both
directions. Other chapters remain available for shared comparison rows and
normal interlinear captions. No edition-wide native-numbering exclusion is
applied to AYT.

As the sole selected edition, AYT owns its source extent: Daniel ends at chapter
12 and 3 John at verse 14. It has no deuterocanonical books; the UI retains its
existing availability notices and English fallback labels for those books.

## Validation

```text
npm run test:ayt
node build/test-service-worker.mjs
```

The independent checker imports neither AYT parsing module. It compares all
31,102 CSV records byte-for-byte after removing publisher heading markup,
checks the KJV-shaped grid, and re-reads SFM notes, headings and structural
superscription markers. The JSDOM tests exercise real desktop/mobile `file://`
loading with network APIs blocked, Indonesian aliases, shared rows, both
directions of search comparison, exceptional chapters, native extent, note
placement, interlinear captions and a parallel-pane-only first load.

Shell cache v60 precaches the Indonesian locale. The AYT dataset has its own
new URL and remains lazily cached, leaving the existing v3 data cache intact.

Validation on 2026-10-09: the full `npm test` regression suite passed. After the
final within-verse heading metadata was added, `npm run test:ayt` passed again,
including the independent source audit and desktop/mobile/parallel-pane checks.
