# Vulgata Clementina (1598)

Maranatha ships the **Biblia Sacra Vulgata Clementina (1598)** as a selectable,
offline Latin translation.

- Display name: **Vulgata Clementina (1598)**
- Short identifier: **VULC**
- Language: Latin (`la`), left-to-right
- Data: `data/vulc.json` + `data/vulc.js` (`window.MARANATHA_TRANSLATIONS['vulc']`)
- Importer: `build/import-vulgata-clementina.mjs`
- Tests: `build/test-vulgata-clementina.mjs`

## 1. Historical identification

The **Clementine Vulgate** is the edition of Jerome's Latin Vulgate revised
under Pope Clement VIII and issued in **1592** (with the definitive 1598
printing). It became the standard Latin Catholic Bible for centuries.

This is **not** the **Nova Vulgata** (1979), the modern revision promulgated
after the Second Vatican Council. The two are different editions with different
texts and different numbering, and Maranatha never conflates them.

The digital source also carries the **Glossa Ordinaria** as printed in the
**Migne (1880)** edition. The Glossa is medieval marginal commentary, not
Scripture. In the source it appears inside `<f>` elements; the importer counts
it and **never** merges it into verse text (§5).

## 2. Source and public-domain status

- Edition identifier: `latVUC`
- Publisher: **eBible.org**
- URL: <https://ebible.org/find/details.php?id=latVUC>
- License: **Public Domain** (stated in the source metadata `copyright`
  statement and in `copr.htm`)
- Retrieved: **2026-10-08**
- Cached source files (committed under `build/sources/vulgata-clementina/`):
  - `latVUC_usfx.zip` — the publisher's USFX archive
  - `extracted/latVUC_usfx.xml` — the USFX text
  - `extracted/latVUCmetadata.xml` — DBL metadata (`dateCompleted` 1880)
  - `extracted/BookNames.xml`, `extracted/copr.htm`, and `details.html`

### Hashes (recorded in `data/vulc.json`)

| File | SHA-256 |
| --- | --- |
| `latVUC_usfx.zip` | `4af9ec883815c05c0d90fe3a65dc32f32432a646db0247b185cc7a2d89fe53a7` |
| `extracted/latVUC_usfx.xml` | `f572302e98d5747f701421a74276f9cde5044db7018fb6f24060eebb02c2c15b` |
| `extracted/latVUCmetadata.xml` | `0714ccc64d8f17dbb03b108aafc9327d2922a6edb5ea5fc71abc0feb6da1db33` |

The importer refuses to run if the archive hash does not match the approved
value, so a substituted or silently re-packaged Vulgate cannot slip in.

### Provenance fields on the dataset

`sourceEdition`, `sourcePublisher`, `sourceUrl`, `sourcePublished` (1598),
`sourcePrintEditionDate` (1880, the metadata's `dateCompleted`),
`sourcePublisherRevisionDate` (2014-08-23, the details page's last-update label),
`sourceFilesDate` (2025-12-12), `sourcePackageGeneratedDate` (2026-10-08,
both from `copr.htm`), `sourceRetrievalDate`, and the three hashes above.
These describe distinct dates; the Migne print date is not a digital revision date.

## 3. Coverage

The edition is a complete Latin Bible **with the deuterocanon** — the Catholic
73-book corpus, in the source's own order:

`GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA
PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL
TOB JDT WIS SIR BAR 1MA 2MA MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH
2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV`

Totals (verified by `build/audit-vulgata-source.mjs` and the importer):

- **73 books**
- **1334 chapters**
- **35809 verses** (every label a positive integer, 1..N, with no gaps)
- **13775 Glossa commentary notes** (`<f>` elements), excluded from Scripture

Per-book chapter/verse figures are printed by:

```
node build/import-vulgata-clementina.mjs --report
```

## 4. Native versification policy

**The Clementine numbering is preserved exactly and is never forced onto
another translation's scheme.**

- `data/vulc.json` sets `nativeVersification: true`.
- Every chapter of VULC is treated as edition-specific numbering.
- Equal verse numbers between VULC and any other translation are **not** taken
  as evidence of equivalent text, and equal verse counts are not taken as
  evidence of correspondence either.
- In the reading view, VULC is rendered in its **own block** under its **own**
  verse numbers. A visible **native-numbering notice** appears above the block.
- If two editions with independent numbering are both selected (for example
  VULC and Delitzsch 1901), each gets its **own** block; they are never placed
  in the same table, where equal row positions would falsely imply alignment.
- The search "Compare translations" panel **suppresses cross-edition
  alignment** in either direction when VULC is involved, and shows a
  native-numbering notice instead.
- The Greek/Hebrew interlinear is disabled while a native-numbered edition
  supplies the caption; a visible message explains why, and the independent
  Latin reading is kept.
- The Parallel reading pane shows the native-numbering notice when VULC is the
  translation pane.

Some native extents that differ from `data/canon.js` and that motivated this
policy:

| Book | Native (VULC) | canon.js |
| --- | --- | --- |
| Esther | 16 chapters (ch. 11–16 are the Greek additions) | 10 chapters (provisional) |
| Daniel 3 | 100 verses (Song of the Three) | 97 |
| Daniel 13 | 65 verses (Susanna) | 64 |
| Daniel 14 | 42 verses (Bel and the Dragon) | 42 |
| Psalm 150 | 6 verses | 6 |
| Sirach | 51 chapters | 51 |

`data/canon.js` is **not edited**. The Book/Chapter selectors instead extend
the chapter list from any selected, loaded native translation, so Esther 11–16
are reachable while VULC is selected, and "Next chapter" from Esther 16 moves to
the next canon book (1 Maccabees). The extension is selection-scoped: a
deselected but still-loaded native edition cannot keep a reference valid.

## 5. Import and reproduction

The importer is deterministic and fully offline — it never uses the network.

```
node build/import-vulgata-clementina.mjs          # regenerate data/vulc.json + data/vulc.js
node build/import-vulgata-clementina.mjs --check  # verify only; writes/downloads nothing
node build/import-vulgata-clementina.mjs --report # bounded inventory to stdout
node build/audit-vulgata-source.mjs               # independent inventory (no transforms)
node build/test-vulgata-clementina.mjs            # regression suite
node build/check-vulc-source-independent.mjs      # pinned archive + every verse, independent algorithm
node build/check-vulc-ui-independent.mjs          # desktop/mobile search, book changes, parallel navigation
node build/test-vulc-import-contract.mjs          # malformed-source rejection + Unicode contract
```

`--check` re-parses the cached source, rebuilds both outputs in memory, and
fails unless the committed `data/vulc.json` and `data/vulc.js` match exactly
(CRLF-tolerant).

The importer uses `fast-xml-parser` with `preserveOrder: true`,
`parseTagValue: false`, `parseAttributeValue: false`, `trimValues: false`:
ordered nodes, no numeric coercion, no Unicode normalization. It fails hard on
any tag outside the inspected whitelist (`usfx`, `languageCode`, `book`, `id`,
`h`, `toc`, `p`, `c`, `v`, `ve`, `f`, `q`, `it`) rather than silently dropping
Scripture. Inside a verse it takes the text between `<v>` and `<ve>`, skipping
the `<f>` commentary subtree; the only transformation is collapsing ASCII
whitespace runs to single spaces and trimming ASCII whitespace at the ends.
Biblical words, punctuation and all non-ASCII characters are preserved.

Book-level titles/headings (`h`, `toc`, `p sfm="mt"`) are preserved verbatim in
the dataset under `headings`, clearly separated from verse text. The source
contains no unnumbered prose inside a chapter — the importer aborts if it finds
any — so there is no unnumbered Scripture to display. Prologues that the source
itself numbers (for example Sirach's *Prologus*, SIR 1:1) remain in their native
numbered verse.

## 6. UI integration

- Registered as an ordinary translation: `data/vulc.js` loads lazily through a
  dynamically created `<script>` tag (never `fetch()`), so it works under
  `file://`.
- Reference lookup, browse, navigation, search and context all work with the
  native numbering.
- Latin verses carry `lang="la"` and the `.latin-verse` class, using the
  existing serif appearance.
- Source disclosure appears under the translation checkbox (public domain,
  latVUC, Clementine not Nova Vulgata).

## 7. Known limitations

- Cross-edition **alignment** with VULC is intentionally disabled until a
  correspondence is actually established. This is conservative by design.
- The Parallel translation pane uses its own selected edition's chapter extent,
  including Esther 11–16 even when VULC is unchecked in the main view. Its LXX
  pane remains independently navigated, with no asserted correspondence.
- Whitespace is normalized (runs of spaces collapsed, ends trimmed); the
  source's own whitespace is not otherwise altered.

See `docs/VULGATA_CLEMENTINA_SOURCE_DEFECTS.md` for the anomaly ledger.
