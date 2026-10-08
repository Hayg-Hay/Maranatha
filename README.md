# Maranatha

An offline Bible browser, architecturally modeled on [YaQuB (Yet Another Qur'an
Browser)](https://github.com/Hayg-Hay/yaqub-local) — a previous offline-preservation
project this one deliberately reuses the shape of: `data/` for static generated
data loaded via `<script>` tags (not `fetch`, so it works from `file://` with no
server), `build/` for the reproducible pipeline that produces that data, and a
thin `app.js` + `index.html` + `style.css` front end with no framework.

## Status

**Eleven translations are registered: World English Bible (WEB-C,
73 books), King James Version (KJV, 66 books), Byzantine Majority Text (Greek
NT, 27 books), Hebrew (OSHB, 39 protocanonical OT books), Luther 1912, Louis
Segond 1910, the two Delitzsch Hebrew NT editions, the Western Armenian NT
(1853, under audit), Vulgata Clementina (1598, Latin, VULC), and Bungo-yaku
(Classical Japanese, BUNGO).** Only WEB is selected by default; open `index.html`, tick
another translation, pick a book/chapter, and you'll see them side by side.
WEB-C supplies the 7 Catholic deuterocanonical books (Tobit, Judith, Wisdom,
Sirach, Baruch, 1–2 Maccabees); translations that do not cover them (e.g. KJV)
show a "not available" placeholder for those books — expected, not a bug.

VULC supplies all 73 books in the published eBible `latVUC` source: 1,334
chapters and 35,809 verses. Its native numbering is preserved in separate
reading blocks, with no asserted cross-edition alignment. See
[source, import and validation documentation](docs/VULGATA_CLEMENTINA.md).

**A separate "LXX (native numbering)" view (Stage 1) is also live**: the Swete
Septuagint in its own source numbering, standalone and deliberately NOT aligned
to the canon numbering used elsewhere. Choose "LXX (native numbering)" in the
View selector to browse it by its own book/chapter labels. See
`data/LICENSE-lxx-swete.md` and `PROJECT_HISTORY.md` (Phase 4).

**Stage 1b adds "Parallel reading (independent numbering)"** (see the section
below): the LXX in the left pane and one selected translation in the right
pane, each with its **own** Book/Chapter controls. The panes are independent —
no row matching, no synchronized scrolling, no automatic chapter mapping — and a
banner says so.

Stage 1 is included in `main` through merge `8c69797`. Independent verification
reproduced 47 source files, 2,754,390 characters and all native labels with zero
text differences; see `build/reports/architect-handoff-REPORT.md`.
The 27,050 historical mapping-audit records equal 27,048 shipped verses plus
seven excluded Psalm 151 verses minus five nested Psalm 129 verses that the
mapping audit skipped. The 100 unnumbered segments are counted separately.

The Reference box is **view-aware**. Inside the standalone LXX view it opens a
**native** LXX reference (one book, one chapter, optionally one printed verse)
and stays in the LXX view; Canon and Parallel keep the canon-only behaviour
(Parallel returns to Canon). Text Search remains **canon-only** everywhere, so
no view appears to have answered an unsupported LXX search.

What works:

- `data/canon.js` — the full 73-book Catholic canon skeleton: stable book IDs,
  traditional Catholic order, and a real chapter/verse count for every chapter
  in every book.
- `data/locales/en.json` (+ `en.js`) — English display names, kept separate
  from `canon.js` so a future locale (e.g. Armenian) can be added without
  touching the canon file.
- `data/web.json` (+ `web.js`), `data/kjv.json` (+ `kjv.js`), `data/byz.json`
  (+ `byz.js`) — real text for 73 Catholic books (WEB), 66 standard books (KJV) and 27 NT
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
source. WEB-C now supplies all 7 deuterocanonical books. NKJV was
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

In Parallel, the Reference box stays canon-only: using it returns to Canon view
and then acts on the canon-numbered translations. Text Search is canon-only in
every view.

## Native LXX reference (standalone LXX view)

Inside the **LXX (native numbering)** view, the Reference box navigates the
Septuagint's own numbering and stays in the LXX view:

- **`Book Chapter`**, optionally **`:Verse`** — e.g. `Genesis 1`, `Ps 88:84`,
  `Letter of Jeremiah 1`, `Bel 1`, `Susanna 1`, `Esther prologue`.
- Book names are case-insensitive and accept **existing canon aliases** (`Ps`,
  `Gen`, `Neh`, …), the source book IDs (`PSA`, `LJE`, `SUS`, `BEL`) and the
  dataset labels (`Letter of Jeremiah`, `Bel and the Dragon`). A bare book opens
  its first chapter that carries numbered verses, so `Nehemiah` opens native
  **chapter 11** (native Nehemiah has no chapter 1) and `Genesis` opens 1.
- Chapters and verse labels are validated against the native dataset only, so a
  printed source label such as `Ps 88:84` is accepted while an absent `Ps 115:6`
  is refused. A single verse scrolls to its segment; the complete native chapter
  (including flags, notices and unnumbered text) is kept.
- **One reference at a time**: verse ranges (`16-17`) and multiple references
  (`Gen 1;Gen 2`) are refused with a clear native-format message, and invalid
  input keeps the current native passage and view. Books not in this edition
  (Ecclesiastes, the NT) report that clearly. Nothing is mapped to the canon.

## Stage 2a/2b — LXX alignment pilot (Genesis 1–5)

An **opt-in** Canon comparison column, *LXX alignment pilot (Genesis 1–5)*,
shows the native Swete Greek beside the canon-numbered translations. It is
**off by default**, Canon-only, and never enters Parallel or text search.

- **Epistemic status.** The correspondences are **AI-proposed, not
  human-verified**. Every entry, every group and the document stay
  `status: "proposal"` with `review.humanApproval: null`.
  `node build/validate-verse-mapping.mjs --require-verified` deliberately
  **fails** on this still-proposed pilot.
- **Scope.** Genesis **1–5** are proposal-covered, plus the single disclosed
  boundary unit **Genesis 6:1**. Everything else (including Genesis 6:2 and
  later, and other books) reads *(alignment not available)* while the native
  reading stays reachable; a book the Swete edition does not contain reads
  *(not available in this edition)*.
- **Genesis 1:6-7.** The closing phrase *"and it was so"* ends Greek 6 while
  WEB/KJV/OSHB place it at 7. The authored evidence is a collective group, but
  the accepted presentation (user decision, 2026-10-07) shows source 6 once at
  target 6 and source 7 once at target 7, each with a short boundary notice; a
  single `Genesis 1:7` query shows source 7 only. This is a display choice, not
  a claim of exact verse boundaries and not a general ordinal-matching rule.
- **Boundary containers.** Source **GEN 3:1** carries both the nakedness
  statement (canon 2:25) and the serpent dialogue (canon 3:1); source **GEN 6:1**
  carries Noah's age and three sons (canon 5:32) and the multiplication clause
  (canon 6:1). Each is rendered in full **once per comparison view**, with the
  native label and a short continuation note; no Greek 2:25/5:32 is invented and
  no source text is split, relabelled or concatenated. A query of just `2:25` or
  `5:32` shows the complete known source unit once and explains its boundary.
- **Schemes and coverage.** The mapping declares its **source scheme**
  (`lxx-swete-native`) and **target scheme** (`web-c`; the Maranatha navigation
  canon anchored to WEB-C, not a universal numbering claim).
  `data/versification-schemes.{json,js}` declares each registered edition's own
  scheme. Only **WEB/KJV/OSHB** have proposal coverage; selecting any other
  edition surfaces a warning that its numbering is unreviewed against the pilot.
- **Evidence binding.** `build/validate-verse-mapping.mjs` loads **both** bound
  proposal ledgers (`build/reviews/lxx-genesis1-evidence.json`,
  `build/reviews/lxx-genesis2-5-evidence.json`), requires each
  `provenance.rowId` to exist in the ledger its entry names, and checks the
  source ref, complete target set and text hashes against both the ledger and
  the bound source/comparison corpora. New rows carry **explicit per-target
  comparison evidence** (target ref + actual corpus string/hash per language);
  artifacts are bound with a documented canonical `sha256-lf` hash (CRLF
  normalized to LF) so a Windows checkout and a fresh Linux clone verify
  identically. No equal-count or ordinal inference is used.
- **Files.** `verse-mapping.js` (classic resolver),
  `data/lxx-swete-alignment.{json,js}`, `data/versification-schemes.{json,js}`,
  `build/import-lxx-alignment.mjs` (metadata compiler),
  `build/gen-genesis2-5-ledger.mjs` (Genesis 2–5 ledger generator),
  `build/validate-verse-mapping.mjs` (validator),
  `build/test-verse-mapping.mjs`, `build/check-stage2a.mjs`,
  `build/check-stage2a-verse-rows.mjs` and `build/check-stage2b.mjs`. All load
  through versioned classic `<script>` tags; no `fetch()`, CDN or module load.
- **Licensing.** The new map/registry metadata carries its license, attribution
  and changes: Greek **First1KGreek / Swete, CC BY-SA 4.0**; Hebrew **OSHB,
  CC BY 4.0**; WEB-C and imported KJV source declarations as in the shipped
  datasets. No Scripture text changed.
- **Status.** Local unshipped draft on `codex/lxx-stage2b`. Human textual
  adjudication of the full map, browser/phone acceptance, merge and push remain
  separate gates. Shell `v53`, DATA `v3`; the raw LXX URL stays
  `?v=disclosures-20261007`.

## LXX disclosure updates and versioned cache refresh

The Swete LXX data is append-only with respect to its text: source defects are
**disclosed**, never repaired. A small metadata update added two targeted
per-verse flags — **Psalm 16:4** (the stray inline numeral `(4)`, a
transcription-marker) and **Psalm 88:84** (label 84 where 48 would be expected,
a source-label-anomaly) — plus one **Letter of Jeremiah** book notice stating
that the displayed chapter 1 is a navigation container, not an upstream chapter
label. Text, labels, segment order/kind, books, chapters, sources, witnesses,
licenses and the excluded/missing metadata are unchanged.

That update changes `data/lxx-swete.{json,js}` but deliberately leaves the data
cache at `v3`. The LXX loader now requests
`data/lxx-swete.js?v=disclosures-20261007`; the service worker's data cache
matches with `ignoreSearch:false`, so the query makes this a **fresh cache key**
that a stale unversioned `data/lxx-swete.js` copy cannot satisfy, while every
already-downloaded translation stays cached untouched. This is a **deliberate
exception** to the older universal "bump the data cache whenever a translation
data file changes" guidance, which is incomplete for query-versioned URLs (the
same pattern already used for corrected WEB data and the Berean Hebrew
previews). The shell cache is bumped `v49 → v50` so phones fetch the new loader;
`build/test-service-worker.mjs` and `build/check-lxx-disclosures.mjs` prove the
versioned-key behaviour offline.

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
- Bungo-yaku (Classical Japanese, public domain) — the Meiji Old Testament
  (1887) and Taisho New Testament (1917), imported via
  `build/import-bungo.mjs` from the CrossWire Bible Society `JapBungo` 2.0
  SWORD module (2022-08-17). 66 books, 1189 chapters, 31102 indexed verse
  slots. It is read in its own source-indexed numbering, with 12 Daniel
  chapters and three disclosed source gaps; see `docs/BUNGO.md` and
  `docs/BUNGO_SOURCE_DEFECTS.md`.

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

## Bungo-yaku (Classical Japanese)

`BUNGO` is the **Bungo-yaku / Taisho-kaiyaku** — the Classical Japanese
Protestant Bible, with the Meiji Old Testament (1887) and the Taisho New
Testament (1917). It is imported from the CrossWire Bible Society **JapBungo**
2.0 SWORD module (2022-08-17), whose metadata records
`DistributionLicense=Public Domain`, `Encoding=UTF-8`, `SourceType=OSIS` and
the printed witnesses as the 1953 Old Testament and 1950 New Testament. The
module's `TextSource` (`http://bible.salterrae.net/`) is presently
DNS-unavailable, so the importer relies on the pinned official CrossWire binary
distribution and asserts no new publisher permission and no worldwide
public-domain determination. Full provenance is in `data/LICENSE-bungo.md`.

Key properties:

- **66 books / 1189 chapters / 31102 indexed verse slots** (31099 carry text).
  The numbering follows the KJV scheme of the source module, not `canon.js`.
- **Three declared source gaps** — Exodus 7:25, 2 Samuel 19:25 and
  2 Chronicles 2:13 — carry no separately indexed text. They are retained as
  empty slots with an explicit notice, never filled from an adjacent verse or
  guessed. See `docs/BUNGO_SOURCE_DEFECTS.md`.
- **`nativeVersification`** keeps Bungo in its own reading block (browsing,
  reference and mobile) and suppresses all same-numbered cross-edition
  comparisons in both search directions.
- **`nativeReferenceScope`** makes the source extent authoritative when Bungo is
  the sole selected edition, so Daniel has 12 chapters and Daniel 13–14 are
  invalid; the deuterocanonical books are absent. In a mixed selection the canon
  navigation is kept, and missing books/verses behave as elsewhere.
- **Psalm superscriptions** and the OSIS ruby/gloss readings are preserved
  separately from the verse text; no gloss or heading is appended to Scripture.
- **Japanese references** work in English/Armenian UIs too: `ヨハネ3:16`,
  `ヨハネ ３：１６`, `ヨハネ3章16節`, with longest-alias matching that keeps
  1–3 John and the Corinthian letters distinct.
- **Japanese search** is substring-based with an NFC grapheme-aware form, so
  querying か does not match inside が and ば/ぱ do not match は, while
  precomposed/decomposed input for the same character still matches.

Reproduce with:

```bash
node build/build-bungo-locale.mjs --check
node build/import-bungo.mjs --check
node build/test-bungo.mjs
```

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
