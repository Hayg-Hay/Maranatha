# Maranatha

An offline Bible browser, architecturally modeled on [YaQuB (Yet Another Qur'an
Browser)](https://github.com/Hayg-Hay/yaqub-local) — a previous offline-preservation
project this one deliberately reuses the shape of: `data/` for static generated
data loaded via `<script>` tags (not `fetch`, so it works from `file://` with no
server), `build/` for the reproducible pipeline that produces that data, and a
thin `app.js` + `index.html` + `style.css` front end with no framework.

## Status

**Four canon-numbered translations are live: World English Bible (WEB-C), King
James Version (KJV), Byzantine Majority Text (Greek NT, 27 books), and Hebrew
(OSHB, 39 protocanonical OT books).** Open `index.html`, checkboxes are on by
default, pick a book/chapter, and you'll see translations side by side. The 7
Catholic deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1–2
Maccabees) show a "not available" placeholder in translations that don't cover
them — this is expected, not a bug.

**A separate "LXX (native numbering)" view (Stage 1) is also live**: the Swete
Septuagint in its own source numbering, standalone and deliberately NOT aligned
to the canon numbering used elsewhere. Choose "LXX (native numbering)" in the
View selector to browse it by its own book/chapter labels. See
`data/LICENSE-lxx-swete.md` and `PROJECT_HISTORY.md` (Phase 4).

**Stage 1b adds "Parallel reading (independent numbering)"** (see the section
below): the LXX in the left pane and one canon-numbered translation in the right
pane, each with its **own** Book/Chapter controls. The panes are independent —
no row matching, no synchronized scrolling, no automatic chapter mapping — and a
banner says so.

Known limitation: the reference box and the text search are **canon-only** and
do not address the LXX. Invoking either one from the LXX or parallel view
returns to Canon view and acts on the canon-numbered translations, so neither
pane ever appears to have answered an unsupported LXX reference or search.

What works:

- `data/canon.js` — the full 73-book Catholic canon skeleton: stable book IDs,
  traditional Catholic order, and a real chapter/verse count for every chapter
  in every book.
- `data/locales/en.json` (+ `en.js`) — English display names, kept separate
  from `canon.js` so a future locale (e.g. Armenian) can be added without
  touching the canon file.
- `data/web.json` (+ `web.js`), `data/kjv.json` (+ `kjv.js`), `data/byz.json`
  (+ `byz.js`) — real text for the 66 standard books (WEB/KJV) and 27 NT
  books (Byzantine Greek NT), built by `build/import-web.mjs` /
  `build/import-kjv.mjs` / `build/import-byz.mjs` from verified structured
  sources. WEB and KJV validate with 0 errors against `canon.js`. The
  Byzantine NT has 1 known textual difference (Romans 16:24 vs. 25 verses
  in canon.js — the Byzantine text ends at v. 24), and Hebrew (OSHB) has
  3 provisional warnings + 1 known-variant note (see below), all documented
  in `PROJECT_HISTORY.md`.
- `data/he.json` (+ `data/he.js`) — real Hebrew text for the 39
  protocanonical OT books, built by `build/import-oshb.mjs` from
  `openscriptures/morphhb` (CC BY 4.0). Covers only the protocanonical OT —
  no NT and no deuterocanon (same "not available" placeholder pattern as
  Byzantine). Uses an algorithmic verse-placement engine driven by 2,027
  embedded `<note>KJV:…</note>` annotations in the source XML to map
  Masoretic versification onto the Christian canon. `validate.mjs` result:
  0 errors, 3 warnings (EST 4, EST 10, DAN — all against provisional canon
  entries), 1 known-variant info note (PSA 13, Masoretic vs Christian verse
   count).
- `data/lxx-swete.json` (+ `lxx-swete.js`) — the Swete Septuagint (Greek OT) in
  native LXX numbering, built by `build/import-lxx-swete.mjs` from the pinned
  OpenGreekAndLatin/First1KGreek `tlg0527` snapshot (CC BY-SA 4.0). 45 in-canon
  books plus the Letter of Jeremiah, Susanna and Bel as components; Daniel is
  the Theodotion witness. Rendered by the independent "LXX (native numbering)"
  view; it is not checked against `canon.js` and is not a canon-numbered
  translation. See `build/validate-lxx-native.mjs`, `build/check-stage1.mjs`
  and (for the parallel view) `build/check-stage1b.mjs`.
- `index.html` — book/chapter navigation, translation checkboxes (multi-select,
  renders side by side), and real verse rendering. Translation data loads via
  a dynamically created `<script>` tag when its checkbox is selected — never
  `fetch()` — so this still works from a bare `file://` double-click with no
  server.
- `build/validate.mjs` — checks a translation file's book IDs, chapter
  counts, and verse counts against `canon.js` before it's trusted. Caught a
  real bug in the raw KJV source (a single bogus placeholder row masquerading
  as 3 John 1:15) before it shipped — see `PROJECT_HISTORY.md`.

**Douay-Rheims was tried and rejected for now.** The only source found
(`xxruyle/Bible-DouayRheims`) turned out to have real chapter-boundary
corruption in 42 of its 73 books — confirmed directly in the raw source, not
assumed. Rather than ship damaged Scripture text, the output was deleted; the
importer script and its book-name mapping are kept (real, reusable work) with
a clear warning not to re-run it against that source. See
`PROJECT_HISTORY.md`, Phase 2, for the full writeup, and `build/fetch-source.mjs`
for what was tried and ruled out before that. Still needed: a clean Douay-Rheims
source, and any translation at all for the 7 deuterocanonical books. NKJV was
considered and rejected as a second English translation — it's copyrighted
(Thomas Nelson), unlike WEB/KJV/DRB, all public domain.

## Known data gaps

`data/canon.js` marks three books `provisional: true`:

1. **Esther** — chapters 4 and 10 are expanded (46 and 14 verses
   respectively, vs. the standard 17 and 3) from the Greek additions
   provided by WEB-C. Chapter 9 has 30 verses in WEB-C but canon
   currently expects 32 — this gap needs reconciliation.

2. **Baruch** — chapter 6 (the Letter of Jeremiah, 73 verses) was
   recovered from WEB-C and is now part of the canon. The chapter count
   matches real Catholic Bibles (6 chapters).

3. **Daniel** — chapters 3 (97 verses, including the Prayer of Azariah
   and Song of the Three), 13 (Susanna, 64 verses), and 14 (Bel and the
   Dragon, 42 verses) are now backed by real WEB-C text. The chapter
   count (14 chapters) matches the expanded Greek Septuagint edition.

These provisional designations remain because the chapter/verse counts
were computed from a single translation (WEB-C) rather than verified
against multiple independent sources. `validate.mjs` treats mismatches
against provisional books as warnings, not errors.

Separately, the Swete Septuagint (the "LXX (native numbering)" view) has no
Ecclesiastes: the source edition does not contain it. It is recorded in
`data/lxx-swete.json` as "not available in this edition" and is never grafted
in from another edition. That view is native-numbered and deliberately not
validated against `canon.js`.

## Parallel reading (independent numbering)

The View selector offers three choices: **Canon view**, **LXX (native
numbering)**, and **Parallel reading (independent numbering)**.

Parallel reading shows two panes side by side (stacked on a phone, LXX first):

- **Left pane — Septuagint (Swete), native LXX numbering.** Its own LXX book and
  chapter dropdowns, driven by `data/lxx-swete.js` (loaded lazily through a
  classic `<script>` tag, never `fetch()`). It reuses the exact renderer used by
  the standalone LXX view, so per-book notices, unnumbered segments, per-verse
  flags and the footer attribution are all preserved.
- **Right pane — one canon-numbered translation.** Its own translation dropdown
  (every registered translation, including Hebrew OSHB and both Delitzsch
  editions), plus its own Book/Chapter dropdowns. It renders through the normal
  canon chapter renderer, so Hebrew stays RTL and the Delitzsch 1901 chapter
  numbering notice is still shown.

The two panes are **completely independent**: changing one pane's controls
re-renders only that pane, never the other. There is no row matching, no
synchronized scrolling and no automatic chapter mapping, and the banner
"Independent numbering; passages are not aligned" states this. The right pane's
selection and Book/Chapter do not touch the Canon-view translation checkboxes or
the canon Book/Chapter state.

The Reference box and the text Search remain **canon-only**: using either from
the LXX or parallel view first returns to Canon view and then acts on the
canon-numbered translations.

## Running it

Open `index.html` directly (or run `Open-Maranatha-Local.cmd`). No server,
build step, or network connection is required to browse the canon structure.

To regenerate the data files from the cached raw sources in `build/sources/`:

```bash
node build/build-canon.mjs
node build/build-locale.mjs
```

## Canon

Catholic, 73 books, as-is — this matches what current Armenian Bibles in
circulation actually contain. No medieval/apocryphal additions beyond the
standard Catholic Deuterocanon (3 Corinthians, Testaments of the Twelve
Patriarchs, etc. are explicitly out of scope).

## Translations (live, v1)

- World English Bible, Catholic Edition (public domain) — covers all 73 books
- King James Version (public domain in the US) — 66 standard books
- Byzantine Majority Text, Robinson-Pierpont (Unlicense / public domain) —
  27 NT books in Koine Greek, imported via `build/import-byz.mjs` from
  `byztxt/byzantine-majority-text` (GitHub). The source includes Acts 24:6-8
  and John 7:53-8:11 (Pericope Adulterae) in the main text, as per the
  Byzantine manuscript tradition. Two extra CSV files (ACT24.csv and PA.csv)
  are alternate readings of these same passages and are not imported — see
  `PROJECT_HISTORY.md`.
- Hebrew (OSHB), Open Scriptures Hebrew Bible (CC BY 4.0) — 39
  protocanonical OT books only, imported via `build/import-oshb.mjs` from
  `openscriptures/morphhb` (GitHub). License requires attribution:
  "Open Scriptures Hebrew Bible, https://github.com/openscriptures/morphhb".
  Morphological markup stripped during import; only surface text
  (consonants, niqqud, cantillation) retained.
- Delitzsch Hebrew NT (two editions, public domain) — 27 NT books in Hebrew.
  Both editions are independent translations and appear under a **single
  "Delitzsch Hebrew NT" checkbox with an edition dropdown** (see "The grouped
  Delitzsch control" below):
  - **1901 — with vowels** (default) — vocalized/niqqud text imported via
    `build/import-delitzsch1901.mjs` from the Sermon-Online transcription of the
    British & Foreign Bible Society 1901 (twelfth) edition.
  - **eBible — without vowels** — the unpointed text imported via
    `build/import-delitzsch.mjs` from eBible.org's `heb_vpl.zip`.

  The two are distinct editions, not a vowel-display toggle. Their IDs, text,
  numbering, metadata, source disclosures and versification handling are
  independent.

RSV-CE is explicitly excluded: copyrighted by the National Council of
Churches, not freely redistributable.

## Delitzsch Hebrew NT (1877)

A Hebrew translation of the **Greek** New Testament by **Franz Delitzsch
(1813–1890)**, first published in **1877**. It is a 19th-century translation,
presented as such: it is **not** an ancient Hebrew New Testament manuscript and
**not** a recovered "original Hebrew" New Testament.

**Selected digital source.** eBible.org's `heb` edition, *The Holy Bible in
Modern Hebrew* — the NT subset of <https://ebible.org/Scriptures/heb_vpl.zip>
(BibleWorks VPL; corroborated by <https://ebible.org/Scriptures/heb_usfm.zip>).
eBible attributes the text to Delitzsch and declares it public domain, but
**does not identify its underlying print edition**; this is therefore an
unpointed eBible digital text, not a verified transcription of the 1877 first
edition. Archive/file hashes and full provenance (including the fact that the
hashes identify the inspected digital artifacts, not a print edition) are in
`build/sources/delitzsch/source-info.json` and
`build/sources/delitzsch/README.md`.

- Primary archive SHA-256
  `77bfc46d373403f722aef77621e3b40d9195e59fd08bdcc3f5185a8db726bc9d`; USFM
  archive SHA-256
  `416ebf82794853a5a2c7721a736189315034baf6fd60240047ddbdb6e16fcb9e`.
- **Public-domain evidence:** <https://ebible.org/heb/copyright.htm> and the
  cached publisher notices `build/sources/delitzsch/heb_about.htm` ("Public
  Domain"; "Translation by: Franz Delitzsch (1813–1890)").

**Coverage and text shape.** NT only (27 books / 260 chapters / 7,957 verse
rows); the package's 39 Hebrew OT books are recognized and excluded, never
merged with the OSHB OT. Verse bodies are **unpointed** — consonants, final
forms and sof pasuq only, with no niqqud or te'amim; no vocalization is
fabricated or borrowed from another edition.

**Versification.** Romans 14 ends at the source's verse 23 (not padded to 26)
and Romans 16 carries verses 1–27 including verse 24 and the doxology at
25–27; both are accepted by `data/known-variants.js`. In 3 John, source verse 14
ends with a labelled `(III John 1:15)` publisher annotation (encoded inline in
the USFM `\v 14`, not a `\f` footnote). It is retained as note-only
`verseMetadata` at 3 John 1:15 and shown once, never promoted to a numbered
main-text verse.

**Commands.**

```bash
node build/import-delitzsch.mjs               # regenerate data/delitzsch.{json,js}
node build/import-delitzsch.mjs --check        # verify; no write, no network
node build/import-delitzsch.mjs --download     # (re)acquire the cached source
node build/validate.mjs data/delitzsch.json
node build/validate-delitzsch.mjs              # source-aware validation
node build/test-delitzsch.mjs
```

The app still opens `index.html` directly under `file://`; the Delitzsch data
loads through the same classic `<script>`-tag path as every other translation
(no runtime `fetch()`, `XMLHttpRequest`, remote imports, CDNs or external
fonts). The OT Paleo/Proto display choice never affects it: Delitzsch stays
square Hebrew.

## Delitzsch 1901 (vocalized)

A second, independent Delitzsch entry: the **vocalized (niqqud)** Hebrew
translation of the Greek New Testament by **Franz Delitzsch** (first published
1877), imported from the **British & Foreign Bible Society 1901 (twelfth)
edition, Berlin**. This is a historical translation, not an ancient manuscript
or recovered original, and is kept separate from the unpointed eBible Delitzsch
above.

**Source and evidence.** Import text: Sermon-Online's verse-per-line
transcription
(<https://info2.sermon-online.com/hebrew/Bible/Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt>,
sha256 `c592cae6…be8a7`). Edition identity was verified against the University
of Toronto scan of the 1901 print
(<https://archive.org/details/hebrewnewtestam00deli>): the cached title page,
table of contents, John 1, Romans 8 and 3 John page images are in
`build/sources/delitzsch1901/evidence/`, with full provenance in
`source-info.json`. Reuse basis: the 1901 text is public domain (author died
1890) and the host grants free redistribution of its files unless otherwise
noted. CrossWire `HebDelitzsch` (1885/2003 revision) was **not** used.

**Corrections.** The transcription contains 43 verified transcription artifacts,
corrected through the reviewed manifest `corrections.json`: 34 verses with a
doubled identical Hebrew combining mark (collapse to one) and 9 verses with a
stray unmatched `)`. Genuine editorial parentheses are preserved (verified, e.g.
Romans 8:1).

**Versification.** Source verse numbers are preserved exactly. Seven chapters
differ from canon.js and are **declared and disclosed** rather than renumbered:
John 1 = 52, Romans 7 = 26, Romans 14 = 23, 1 Corinthians 13 = 14,
2 Corinthians 13 = 13, 2 Thessalonians 3 = 19, 3 John 1 = 15. In the reading
view an affected chapter is rendered in a separate, source-numbered block with a
visible notice, so rows are never mistaken for equivalent verses across
translations.

**Commands.**

```bash
node build/fetch-delitzsch1901.mjs          # (re)acquire the cached source (network, build-time)
node build/import-delitzsch1901.mjs         # regenerate data/delitzsch1901.{json,js}
node build/import-delitzsch1901.mjs --check  # verify; no write, no network
node build/validate.mjs data/delitzsch1901.json
node build/validate-delitzsch1901.mjs        # source-aware validation
node build/test-delitzsch1901.mjs
```

Like every other translation it loads through a local classic `<script>` tag and
works under `file://` with no runtime network access; the OT Paleo/Proto setting
never affects it.

## The grouped Delitzsch control

Both Delitzsch editions are chosen through one control rather than two separate
checkboxes:

- one **"Delitzsch Hebrew NT"** checkbox, plus an **Edition** dropdown labelled
  and associated with the select (`<label for>`), usable by keyboard even while
  the checkbox is unticked;
- options **"1901 — with vowels"** (default) and **"eBible — without vowels"**;
- the two IDs (`delitzsch1901`, `delitzsch`) and their data files are unchanged —
  grouping is a control-layer concern only.

Behaviour:

- Startup selection is unchanged (WEB is the only default; the Delitzsch group is
  unticked and neither edition is loaded until ticked).
- While **unticked**, changing the dropdown only changes the chosen edition — it
  never selects or loads it.
- While **ticked**, changing the edition replaces the active Delitzsch
  translation, loads its local script if needed, and refreshes the current view;
  the chosen edition is kept across untick/re-tick.
- The current reference, context setting and other selected translations are
  preserved on switch. The active edition's Source explanation is shown, and the
  1901 chapter-numbering notices apply only when the 1901 edition is active.
- A reference that exists only in the previous edition is shown as unavailable
  (or reported out of range) — another verse is never silently substituted.
- Search selectors/state, comparison panels and interlinear captions all follow
  the active edition, including when the edition is switched during a search.

## Project structure

```
maranatha/
├── index.html, style.css, app.js
├── data/
│   ├── canon.js              — the 73-book skeleton (generated, do not hand-edit)
│   └── locales/
│       ├── en.json, en.js    — English display names (generated, do not hand-edit)
├── build/
│   ├── build-canon.mjs       — generates data/canon.js
│   ├── build-locale.mjs      — generates data/locales/en.{json,js}
│   ├── validate.mjs          — validates a translation file against canon.js
│   ├── fetch-source.mjs      — (stub) milestone-2 network fetch step
│   ├── normalize.mjs         — (stub) milestone-2 raw-source → translation-file step
│   └── sources/              — cached raw data the build scripts read (committed,
│                                so the build is reproducible without re-fetching)
└── PROJECT_HISTORY.md
```

See `PROJECT_HISTORY.md` for how this was assembled and what's next.
