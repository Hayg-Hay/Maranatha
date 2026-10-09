# Chinese Union Version: Traditional, New Punctuation

`cuv-traditional` / **CUV-T** is eBible's `cmn-cu89t` source: **新標點和合本・
繁體・上帝版**, Traditional Chinese New Punctuation CUV with 上帝 wording.
The USFM identifies its edition as Chinese Union New Punctuation 1989. The
distributor declares Public Domain; exact source notices and attribution are
retained in [the licence note](../data/LICENSE-cuv-traditional.md). It retains
older CUV wording and is distinct from the Revised Chinese Union Version.

## Reproducible source and inventory

Two eBible archives (USFX and USFM) were retrieved on 2026-10-09, retained with
79 original source files/archive entries in `build/sources/cuv-traditional`,
and pinned by SHA-256 in `source-files.json`. The importer also pins the hash of
that manifest, so modifying the source and rewriting the manifest cannot silently
alter an import. No download occurs during import or at runtime.

`build/import-cuv-traditional.mjs` reads the ordered USFX record stream:

- 66 books, 1,189 chapters, 31,021 numbered text records.
- 70 combined records covering 71 additional numbered positions, including
  Genesis 24:29–30 and Psalm 8:6–8. Total covered positions: 31,092.
- 11 source positions without separately numbered records, explicitly tagged:
  Matthew 18:11, 23:14; Mark 7:16, 15:28; Luke 17:36, 23:17; John 5:4;
  Acts 8:37, 15:34, 24:7, 28:29. Relevant source footnotes are retained separately.
- 1,013 footnotes; 116 Psalm superscriptions; 2,603 section headings; five Psalm
  book-group headings; 619 parallel-reference headings; 33 speaker headings.

USFX markup and serialization line endings are removed; poetic paragraph
boundaries are retained as newlines. Proper-name and added-word styling is
flattened, preserving its words. Unicode and punctuation are not normalized.
Headings and notes remain separate from Scripture and are excluded from Scripture
search. Raw files preserve all original formatting and inline annotation markup.

Chinese chapter notices, source headings and footnotes are available in a
collapsed **CUV-T notes and edition details** section below the passage, so
Scripture appears immediately. **Multi-row** is honored at narrow widths too;
**Automatic** keeps the responsive mobile reading view. Multi-row formats the
reading block but does not establish cross-edition verse correspondence.

## Application behavior

CUV-T is lazy-loaded with a local script tag, including under `file://`.
Traditional Chinese book labels can be selected through **Language → 繁體中文**;
the surrounding app controls remain in their existing language. The seven
deuterocanonical book labels retain English fallbacks because this source does
not supply those books.

Traditional names, Simplified aliases, common abbreviations, full-width digits,
and Chinese chapter/verse markers are accepted in every book-label language:
`約翰福音3:16`, `约翰福音3章16节`, `約翰福音３章１６節`, `約3:16`.
English references remain available with Chinese book labels selected.

Each combined passage appears once, with its source range label. Looking up
Genesis 24:30 shows the complete source passage labelled **24:29–30** rather
than fabricating a split or showing an empty continuation. The same label is
used in Scripture search results. Explicit source gaps show a factual notice.

The edition declares native versification and native reference scope. It is
rendered in its own reading block, and equal-number cross-edition search
comparison and original-language interlinear captions are suppressed until
correspondences are verified. Daniel ends at chapter 12; 3 John has 15 verses.
Text uses `lang="zh-Hant"`, left-to-right direction, local CJK font fallbacks,
and grapheme-aware search/highlighting that retains variation selectors.

The shell cache is v59 and includes the small Chinese locale. Translation data
is cached lazily; the existing data cache stays v3 because CUV-T has a new URL.

## Validation commands

```text
node build/import-cuv-traditional.mjs --check
node build/build-chinese-locale.mjs --check
node build/check-cuv-traditional-independent.mjs
node build/test-cuv-traditional.mjs
node build/test-service-worker.mjs
```

The independent checker reads all 66 USFM files without importing the USFX
importer and compares every text record and source label, all notes and all
headings. It ignores presentation whitespace only; words and punctuation must
match. Integration tests exercise the real app in JSDOM at desktop and mobile
sizes with network APIs blocked, including combined-unit reference queries,
source notes, native limits, Chinese aliases, highlighting and comparison guards.

Validation on 2026-10-09: the independent source audit and all Chinese desktop,
mobile and parallel-pane checks passed. The existing regression commands also
passed across the initial and resumed runs, including both Japanese editions,
Latin, Hebrew, Greek interlinear, offline caching and LXX mapping checks. Three
existing tests that pinned shell v57 were updated for the required v58 shell.
