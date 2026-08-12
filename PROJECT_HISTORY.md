# Maranatha Project History

## Overview

Maranatha is an offline Bible browser, deliberately modeled on
[YaQuB](https://github.com/Hayg-Hay/yaqub-local) — a prior project that
preserved and rebuilt an old Qur'an-browsing web app so it could run forever
offline, with no server dependency. Maranatha reuses that architecture (static
`data/` files loaded via `<script>` tags, a reproducible `build/` pipeline, a
framework-free front end) for the Bible instead, targeting the Catholic
73-book canon with English-first v1 translations and a language-independent
data model so other languages (Armenian, specifically) can be added later
without a rewrite. The goal is for all books of the Armenian Canon to be contained.
Since the Catholic Bible contains overwhelming overlapps it was fit. 
The missing books will then be added separately.

This project was set up as its own repository from the start, rather than as
a branch or fork of `yaqub-local` — the two are architecturally related but
functionally unrelated, and keeping them separate keeps each repo's history
legible.

## Phase 1 — Canon skeleton

Goal: build `data/canon.js`, the authoritative structural skeleton (stable
book IDs, traditional Catholic order, chapter count, verse count per chapter)
that every translation file will later validate against.

The intended source was the World English Bible, Catholic Edition — the base
v1 translation. That text could not be located as programmatically-fetchable
structured data in this session. Several real leads were tried and
specifically ruled out (see the header comment in `build/fetch-source.mjs`
for the full list and why each didn't work: ebible.org's GitHub mirror had
empty placeholder files for the needed translations; bolls.life didn't have
a confirmed WEB+Deuterocanon variant; Bible SuperSearch's SourceForge bundle
serves an HTML download page rather than raw file content when fetched
programmatically).

Rather than fabricate exact chapter/verse counts from memory — which is
exactly the kind of number that's easy to get subtly wrong and expensive to
notice later — the canon was instead built from real, sourced verse text.

## Phase 2 — Translation data (attempt 1: tried, rolled back)

A side session (via ChatGPT, per the project's multi-collaborator workflow —
see the handoff template referenced in this repo) prototyped a Douay-Rheims
importer as an experiment, without first checking it against the plan agreed
in this project's own history. It proved two things worth keeping as
findings even though the code was reverted:

- **The real Douay-Rheims source is messy.** A test fetch of Genesis pulled
  much more than verse text — introductions, annotations, cross-references,
  note markers, and embedded HTML — confirming that any real importer needs
  a deliberate strip-down step, not a raw pass-through.
- **A working end-to-end render is achievable** — the prototype did get real
  Douay-Rheims Genesis text on screen, proving the concept is sound.

However, the prototype diverged from two decisions already on record in this
file and in `README.md`:

1. It restructured translations as **one file per book**
   (`data/translations/<id>/<book>.json`, ~219 files at full scale) instead
   of the agreed **one file per translation** (`data/<id>.json`, all books
   inside, lazy-loaded by translation checkbox).
2. `app.js` was changed to load that data with `fetch()`. That silently
   breaks opening `index.html` directly via `file://` without a server —
   the exact constraint YaQuB was built around, and one already fixed once
   in this project (the locale file briefly made the same mistake in Phase 1
   and was corrected before it shipped).

Both changes were made without being checked against this document, and
`PROJECT_HISTORY.md` was updated to describe them as settled rather than as
an experiment — which is exactly the failure mode this file exists to
prevent. Once reviewed, the decision was to **revert**: the experimental
importer, its output folder, and the `fetch()`-based `app.js`/`index.html`
were removed, and the project returned to the state at the end of Phase 1.

This is left in the history rather than deleted, because the finding about
the messiness of the real source text is genuine and will matter again once
Phase 2 is retried properly — against the original plan (one file per
translation, script-tag loading, no server, no `fetch()` of local data).

### Phase 2, take two — Douay-Rheims source rejected, WEB shipped

**Douay-Rheims:** a second source was tried (`xxruyle/Bible-DouayRheims`,
MIT-licensed JSON transcription of the public-domain text, README claiming
"all 73 books"). The importer (`build/import-douay-rheims.mjs`) mapped all 73
old-style Vulgate book names (Josue, Machabees, 4 Kings, etc.) onto canon IDs
correctly, and — bonus — its Baruch and Esther data confirmed real 6-chapter
and expanded structure, real evidence toward eventually resolving canon.js's
provisional flags. But running `validate.mjs` against the output found 228
real errors across 42 of the 73 books — not the single missing-verse gap the
source's own README admitted to, but genuine chapter-boundary corruption.
Confirmed directly in the raw cached source (not assumed from the error
count): Numbers "chapter 30" contains verse keys 19-72, not 1-16 — the
upstream repo's line-by-line txt-to-JSON parser drifted. The importer script
and its book-name mapping are kept (real, reusable work, clearly marked with
a warning not to run and commit against this source again), but the output
was deleted rather than shipped. Patching Scripture text by guessing at the
correct wording was ruled out as worse than not having it yet.

**WEB:** shipped successfully. Used the same real WEB verse data already
cached from Phase 1 (`scrollmapper/bible_databases`, a proper structured
database export, not a hand-rolled text parser — which is exactly why this
one validated clean where Douay-Rheims didn't). `build/import-web.mjs` maps
the standard 66-book edition onto canon IDs; `validate.mjs` reports 0 errors,
0 warnings, with the 7 Catholic deuterocanonical books correctly flagged as
expected-missing (this source doesn't have them; grafting in a different
translation's text for those 7 books was considered and rejected — it would
misrepresent the result as WEB when it isn't).

One real bug was caught before shipping, not after: a browser smoke test
(jsdom) surfaced literal backslash characters inside rendered verse text
(`\"Let there be light,\"` instead of a plain quote). Traced to the raw
source directly — an over-escaping artifact from an upstream SQL-to-JSON
dump, one consistent pattern (`\"` as literal content) appearing 7,987 times
across the whole text. Fixed in the importer's cleanup step before the data
was committed.

`app.js` was extended with a translation checkbox list and real verse
rendering, loading `data/<id>.js` via a dynamically created `<script>` tag —
never `fetch()` — so the file:// / no-server constraint holds even with
on-demand loading. NKJV was considered as a second translation and rejected:
it's copyrighted (Thomas Nelson), not public domain, unlike WEB/KJV/DRB. WEB
was chosen specifically because "modern public-domain English" was already
its design goal, which addresses the same "KJV is too old English" concern
without a licensing problem.

### Phase 2, take three — KJV added

Same source family as WEB (`scrollmapper/bible_databases`, `t_kjv.json`),
checked independently for the artifacts found in WEB rather than assumed
clean because it's the same repo: no over-escaped quotes, no embedded
footnote markers. One real bug was found and fixed before shipping — a
single bogus row in the raw source with literal text `"[]"` at 3 John 1:15
(standard KJV 3 John only has 14 verses; this was a stray export artifact,
not a textual variant). Confirmed it was an isolated case — scanned all
31,103 verses in the source, found exactly one — before adding a targeted
filter for it in `build/import-kjv.mjs`. After that fix, `validate.mjs`
reports 0 errors, 0 warnings, same as WEB.

`app.js`'s translation registry now has two entries; both checkboxes are on
by default and render side by side, confirmed with a jsdom smoke test
selecting both. Still open: a clean Douay-Rheims source, and any translation
at all for the 7 deuterocanonical books.

### Phase 3 (early) — side-by-side layout, ported properly from YaQuB

A gap got caught before it went further: translation checkboxes worked, but
selecting more than one translation rendered them as separate stacked
tables, one full-width block per translation — not YaQuB's actual behavior,
which shows translations as columns side by side (or as grouped rows in
"multi-row" mode) within one shared table.

Fixed by porting YaQuB's own `multiColumn()`/`multiRow()` functions
(`qb.gomen.org/QuranBrowser` mirror's `local/app.js`) directly into
`app.js`, plus the layout selector (Automatic/Multi-column/Multi-row) in
`index.html`, matching YaQuB's UI text and its "more than 5 translations
switches Automatic to multi-row" rule. Smoke-tested with both WEB and KJV
selected: multi-column correctly shows one row per verse with a column per
translation; multi-row correctly groups each verse's translations as
consecutive rows. The "book not available in this translation" and
"translation still loading" states were also carried over into the new
shared-table cells and re-verified, since the old per-translation-block
version handled those differently.
Phase 3+ — validate.mjs padding-trim fix and known-variants.js. validate.mjs was comparing raw array lengths against canon.js, which produced false errors (e.g. WEB SIR 23: raw length 28 vs. 27 real verses) whenever import padding trailed a chapter or verse array. Fixed by porting the same trim logic already used in update-canon-counts.mjs. Separately, added data/known-variants.js to record genuine cross-translation textual variants (e.g. the Romans 16:25-27 doxology, placed at the end of ch14 in the Byzantine/WEB tradition vs. ch16 in the KJV/Textus Receptus tradition) as structured data validate.mjs checks against — a count matching a documented variant reading is reported as informational, one matching neither still flags as a real error. Both changes verified against the real data/web.json, kjv.json, byz.json files before committing.
## Phase 4 — Verse reference lookup and explicit view modes

Goal: let a user type a single reference (`Genesis 1:1`, `John 3:16`,
`Mark 1:3-6`, `1 Corinthians 13`) into the new reference search bar and have
it drive the existing Book/Chapter dropdowns and the existing renderer,
rather than building a second lookup pipeline.

**Parser.** A `ReferenceParser` class was added, built from `canon.js` +
`locales/en.js` at startup (book-name lookup, case-insensitive, with a
reserved `aliases` slot for future YaQuB-style variant spellings). It parses
`<book> <chapter>[:<verse>[-<verseEnd>]]` and returns a plain
`{ bookId, chapter, verseStart, verseEnd }` object or `null`. The parser's
only job is parsing — it does not touch DOM state or rendering, matching the
separation-of-concerns constraint carried over from YaQuB's own querystring
grammar.

**View-mode refactor.** The first working version stored the parsed
reference in a single `currentReference` variable and had the renderer infer
its behavior from whether that variable was null. That mixed two concerns
(state storage and application mode) into one implicit flag, and it meant
"clicking a Book/Chapter dropdown after using reference search" had no
defined behavior. This was replaced with an explicit state object:

```js
const viewState = { mode: 'browse', reference: null };
```

`setBrowseMode()` and `setReferenceMode(parsed)` are the only two places that
mutate it. Every entry point that changes the visible chapter now goes
through one of them: the Book dropdown, the Chapter dropdown, and the
existing "Show" button all call `setBrowseMode()` before re-rendering (the
Chapter dropdown previously had no `change` listener at all — added one, so
switching chapters manually exits reference mode immediately instead of only
on the next button click); the reference bar calls `setReferenceMode(parsed)`
and then syncs the dropdowns to match.

The renderer branches on `viewState.mode` through one shared helper,
`verseRangeFor(bookId, chapterNum, verseCount)`, which returns the verse
range to display and whether it should be highlighted. Both `multiColumn()`
and `multiRow()` call this same helper — previously only `multiColumn()`
consulted `currentReference` directly, so `multiRow()` silently ignored
reference mode and always rendered the full chapter; that inconsistency is
gone now that both layouts share one source of truth.

**Known gap (found on this review pass, not yet fixed):** the currently
committed `multiColumn()` computes `highlight` from `verseRangeFor()` but
never applies it to the row — the `highlighted-verse` class and the
`current-reference` id are only being set inside `multiRow()`. `render()`
also no longer calls `scrollIntoView()` on `#current-reference` after
building the table, so in multi-column layout a reference lookup correctly
narrows to the requested verse(s) but doesn't visually mark or scroll to
them. Both are small, contained fixes (mirror the two lines already present
in `multiRow()`, and restore the `scrollIntoView` call at the end of
`render()`) and are next up before this phase is considered fully closed.

## Phase 4+ (remaining)

Fix the multi-column highlight/scroll gap noted above. Still ahead beyond
that: mobile responsiveness pass, full YaQuB-style multi-reference parsing
(`5:20-` open-ended ranges, `;`-separated multiple references in one query),
text search, richer navigation, and GitHub Pages deployment.

## Role of AI

This project, like YaQuB before it, is AI-assisted. Claude built the canon
data pipeline, wrote and tested the validator, and scaffolded the project
structure. Where source data couldn't be verified, that is recorded as a gap
in the data itself rather than filled in from training-data recall.

Human contributions: defining the canon and translation scope, the
architectural continuity with YaQuB, deciding what's in v1 vs. deferred, and
everything from here on (git init, GitHub repo creation, review).

## Phase 4.5 — Official WEB Catholic Edition Import (milestone-webc-import)

**Git tag:** `milestone-webc-import` (commit `a48df1b`, 5 commits total:
`685b999` → `9e43118` → `c7144aa` → `b889334` → `a48df1b`).

**Objective:** Replace the legacy 66-book WEB dataset (from
scrollmapper/bible_databases) with the official World English Bible
Catholic Edition (WEB-C) from eBible.org, covering all 73 Catholic books.

**Why:** The existing `web.json` originated from an older WEB revision and
contained only the Protestant 66-book canon. Grafting the seven
deuterocanonical books onto that dataset would have mixed two different
revisions of the same translation under one "WEB" label. Instead, the
project imports the complete official WEB Catholic Edition directly from
its original source.

**Technical work:**
- Implemented `build/import-eng-web-c.mjs`.
- Automatic fetching of all 73 books via eBible.org's chapter-numbered
  URLs, discovering chapter counts by requesting until HTTP 404.
- HTML verse extraction with removal of navigation links, footnote
  references, page footer, and copyright text.
- Smoke-test mode validated against Tobit and Obadiah edge cases.
- `data/web.js` regenerated from `data/web.json`; the offline app now
  loads the full WEB-C text for all 73 Catholic books.

**Validation result:** 73/73 books imported, 0 validation errors, 5
expected provisional warnings (EST, BAR, DAN — these books had provisional
canon metadata from the pre-WEB-C era; see Phase 5.5).

**Impact on provisional books:** The WEB-C import provided real verse text
for Esther (Greek additions expand chapters 4 and 10), Baruch (chapter 6,
the Letter of Jeremiah, now present as 73 verses), and Daniel (Greek
additions: Susanna as chapter 13, Bel and the Dragon as chapter 14, and
Daniel 3 expanded to 97 verses including the Prayer of Azariah and the
Song of the Three). These counts were not reflected in `canon.computed.json`
at the time of import — that was addressed in Phase 5.5.

## Phase 5 — Byzantine Majority Text (Greek NT) added

**Source:** `byztxt/byzantine-majority-text` (GitHub), Robinson-Pierpont edition,
`csv-unicode/ccat/no-variants/` — 29 CSV files (27 NT books + 2 variant readings).
License: Unlicense (public domain dedication), confirmed directly from LICENSE.txt.

The importer (`build/import-byz.mjs`) parses 27 CSV files into the standard
`data/byz.json` / `data/byz.js` format. Source files use Latin abbreviations
(MAR → MRK, JOH → JHN, JAM → JAS, 1JO/2JO/3JO → 1JN/2JN/3JN) — all maps
verified against canon.js directly, not assumed.

**ACT24.csv and PA.csv:** The source ships two extra CSV files containing
alternate readings of disputed passages. Inspection confirmed that the main
ACT.csv already contains Acts 24:6-9 (shorter reading) and JOH.csv already
contains John 7:53-8:11 (Pericope Adulterae, verses 53 and 1-11) natively
in the Byzantine tradition. The extra files are variant-form readings of the
same passages, not additional verse content. They are intentionally skipped
during import — no merge, no deletion, just documented non-import.

**Validation:** `validate.mjs` reports 1 error: Romans 16 has 24 verses in
the Byzantine text vs. 25 in canon.js. This is a genuine textual difference —
the Byzantine text ends Romans at verse 24 (doxology), while the KJV/WEB-based
canon.js expects 25. Not a data defect; the importer faithfully represents the
source text. The 46 missing OT books are informational (expected — this is
an NT-only translation).

**Smoke test:** Matthew 1:1 and John 1:1 verified with jsdom (same approach as
WEB/KJV), rendering clean polytonic Greek with correct accents and breathing
marks in both multi-column and multi-row layouts.

## Phase 5.5 — Canon re-baselining and verse-count fix

**Background:** Phase 4.5 (WEB-C import) replaced the 66-book WEB data with
the full 73-book WEB Catholic Edition, but the original `canon.computed.json`
was never updated to reflect the new WEB-C data — it still contained
chapter/verse counts computed from the old Scrollmapper source. Phase 5
(Byzantine NT) added a third translation, further widening the gap between
real data and the stored canon.

**Changes to the canon-generation rule:**

1. **Verse counting:** A chapter's verse count in canon.js is now the
   maximum across all imported translations (WEB, KJV, Byzantine), where
   trailing empty-string slots in a chapter's verse array are trimmed before
   counting. This replaces the old rule that counted the raw array length,
   which had allowed WEB's padded empty slot at Romans 16:25 to be recorded
   as a real verse and the old WEB-C importer's occasional trailing
   empty-string padding (e.g. Sirach 23:28) to inflate counts.

2. **Chapter counting:** A book's chapter count is now the maximum across
   all imported translations, with trailing zero-count chapters trimmed.
   This pruned four phantom chapters from Sirach (chapters 52–55) that the
   old `canon.computed.json` contained but no translation had data for.

**Specific changes (46 chapter counts, 6 books):**

| Book | Key changes |
|------|-------------|
| **EST** | ch4: 17→46, ch10: 3→14 (WEB-C Greek additions) |
| **SIR** | 37 chapter counts updated; ch52–55 removed (no translation data) |
| **BAR** | ch6: 0→73 (Letter of Jeremiah from WEB-C) |
| **DAN** | ch3: 30→97 (Prayer of Azariah + Song of the Three), ch13: 0→64 (Susanna), ch14: 0→42 (Bel and the Dragon) — all from WEB-C |
| **ROM** | ch14: 23→26 (max across all three translations), ch16: 25→27 (KJV's longer doxology at v25-27; WEB and Byzantine both have shorter endings) |

**Provisional book status:** EST, BAR, and DAN remain `provisional: true`
because their counts are computed from a single translation (WEB-C) rather
than verified against multiple independent sources — the same standard the
core 66 books and the NT satisfy by having both KJV and (for NT) Byzantine
cross-validation.

**Romans 16:25-27 — textual variant, not data defect:** KJV has the longer
doxology (27 verses total, matching the Textus Receptus). WEB (25 array
slots, 24 real verses) and Byzantine (24 verses) follow the shorter
Alexandrian/Westcott-Hort ending. The canon records 27 (max), and the
existing `missing-verse` UI state in `cellFor()` / `fillCell()` correctly
shows "(not available)" for verses 25-27 in WEB and Byzantine.

**New script:** `build/update-canon-counts.mjs` — re-reads all three
translation JSON files and regenerates `canon.computed.json` with the
corrected counting rule. Run this after importing any new translation to
update the canon to match the data on disk.

## Phase 6 — Byzantine wired into the browser, then a real data-corruption bug found and fixed

Byzantine Majority Text data existed (validated, 0 errors) but was never added to
app.js's TRANSLATIONS registry, so it didn't appear in the UI at all. Fixed with
one line — `{ id: 'byz', label: 'Byzantine Majority Text (Greek NT)', src:
'data/byz.js' }` — no other code changes needed, since app.js's existing
missing-book handling (already exercised by KJV's 7 missing deuterocanon books)
covers Byzantine's 27-of-73 book coverage without modification.

A visual check after wiring it in surfaced garbled Greek text — e.g. Matthew
1:7's "Ἀβιά" rendering as "βιά" (a literal U+FFFD replacement character).
Root-caused to build/fetch-byz-source.mjs: fetchRaw() concatenated raw HTTPS
response Buffer chunks as strings one at a time (`d += c`). Buffer chunks split
at arbitrary byte boundaries, not character boundaries — when a multi-byte
UTF-8 character (Greek diacritics are 3-byte sequences) straddled a chunk
split, each half decoded as invalid UTF-8 independently and silently became
U+FFFD. Confirmed the real upstream source (byztxt/byzantine-majority-text) had
zero corruption, then reproduced the exact failure live by re-fetching with the
buggy chunking logic before trusting the diagnosis — ruling out the
possibility the corruption was already present upstream. Fixed by collecting
chunks into an array and decoding once via `Buffer.concat(...).toString('utf8')`.

This also closed a related gap: build/sources/byz/ had never been committed,
unlike sources/web/, sources/kjv/, sources/douay-rheims/ — breaking this
project's own reproducibility principle. The re-fetch populated it for the
first time; all 29 source CSVs are now cached in the repo.

One git-hygiene slip during this: the intended two separate commits (UI
registration vs. corruption fix) didn't split as planned — a failed pathspec
in one `git add` didn't stop the following `git commit` from sweeping up
everything already staged, so the corruption fix ended up committed under a
message that only mentioned the stray-file removal and registration. Caught by
checking the actual pushed commit stat rather than trusting the terminal
output at face value, and corrected via `git commit --amend` +
`git push --force-with-lease` (safe here — solo repo, no one else pulling from
it) so the commit message matches what it actually contains.

## Hebrew Source Investigation

### Source Selection

We investigated possible Hebrew Bible sources for Maranatha and reached the
following confirmed decisions:

- **BibleHub was examined only to identify its underlying source.**
  BibleHub displays the Westminster Leningrad Codex (WLC) as its Hebrew text,
  crediting it to tanach.us. BibleHub will not be used as an import source —
  the legally clean path is to obtain the text from its primary distribution
  point, not from a downstream website.

- **The selected upstream candidate is the Open Scriptures Hebrew Bible (OSHB).**
  Repository: https://github.com/openscriptures/morphhb. The OSHB is a digital
  transcription of the Westminster Leningrad Codex with full morphological
  tagging, distributed in OSIS XML format.

- **License verification was performed independently against the repository.**
  We did not rely on AI summaries — the repository's LICENSE file and the
  `<rights>` element in the XML header both state the license is **Creative
  Commons Attribution 4.0 International (CC BY 4.0)**. The XML header also
  states the underlying Westminster Leningrad Codex is public domain. CC BY
  4.0 permits redistribution, adaptation, and commercial use, requiring only
  attribution.

- **Required attribution** (from LICENSE.md):
  > Open Scriptures Hebrew Bible
  > https://github.com/openscriptures/morphhb
  > Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)

  The import script records this in the `source` field of `data/he.json`,
  along with a note that morphological markup was stripped and that the
  translation covers only the 39 protocanonical OT books.

### Technical Evaluation

We inspected the actual XML files (`wlc/Gen.xml`, `wlc/1Chr.xml`, and others)
and confirmed:

- **OSIS book/chapter/verse structure.** Each book is a `<div type="book">`
  containing `<chapter>` elements containing `<verse>` elements, with stable
  `osisID` attributes (e.g., `Gen.1.1`). This maps directly onto Maranatha's
  existing `{ books: { "GEN": [[verse,...], ...] } }` data model.

- **UTF-8 Hebrew.** All text is valid UTF-8, matching Maranatha's existing
  `<meta charset="utf-8">` declaration and the proven ability to render Greek
  polytonic text (Byzantine Majority Text) without issues.

- **Niqqud (vowel pointing).** Full Tiberian vowel marks (U+05B0–U+05BB)
  present throughout, e.g., בְּרֵאשִׁית (dagesh + sheva on bet, tsere on resh).

- **Cantillation marks (te'amim).** Full cantillation marks (U+0591–U+05AF)
  present, e.g., בְּרֵאשִׁ֖ית (tipeha on shin), בָּרָ֣א (munah on resh),
  אֱלֹהִ֑ים (atnah on he).

- **Maqaf and sof pasuq.** The maqaf hyphen (־ U+05BE) and sof pasuq
  colon (׃ U+05C3) are encoded as `<seg type="x-maqqef">` and
  `<seg type="x-sof-pasuq">` elements respectively, alongside paseq (׀ U+05C0)
  as `<seg type="x-paseq">`. These require word-order-sensitive extraction
  that preserves document order between `<w>` and `<seg>` elements.

- **Lemma and morphology metadata.** Every `<w>` element carries `@lemma`,
  `@morph`, and often `@n` (Strong's number) attributes. For v1, this
  metadata is stripped — only the surface text (consonants, niqqud,
  cantillation) is retained. The raw XML is preserved in `build/sources/oshb/`
  for a future v2 feature that could expose morphology/interlinear data.

- **High-quality structured XML suitable for deterministic importing.**
  Unlike plain-text or PDF sources, the XML structure removes ambiguity:
  book/chapter/verse boundaries are explicit, and each word is individually
  tagged with its morphological analysis.

### Archival Decision: 39-Book Hebrew

OSHB covers the 39 protocanonical Old Testament books only. The 7 Catholic
deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees)
were originally composed in Greek and have no Hebrew text in the OSHB.
Additionally, the Hebrew Esther and Daniel do not include the deuterocanonical
Greek additions (the Hebrew canon excludes them). This is the same pattern as
the Byzantine Majority Text, which covers only the 27 NT books — the UI
already handles missing books via the "(not available in this translation)"
placeholder in `app.js`.

### Versification Investigation

An initial assumption — that simple front-trimming of Masoretic verses would
resolve all versification differences between the OSHB and Maranatha's canon.js
(which uses Christian verse numbering) — was tested by running the import
script and then `validate.mjs`. The result was 35 validator errors plus 3
provisional warnings.

Each of the 35 errors was individually verified against the OSHB XML source.
The investigation identified three distinct categories:

1.  **Chapter boundary shifts (30 chapters).** The Masoretic Text splits
    chapter boundaries at different points than the Christian canon. For
    example, OSHB Gen.32:1 corresponds to KJV Gen.31:55 — one verse at the
    head of a Masoretic chapter belongs to the tail of the previous Christian
    chapter. These shifts affect Genesis, Exodus, Leviticus, Numbers,
    Deuteronomy, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 2 Chronicles, Nehemiah,
    Job, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Ezekiel, Hosea,
    Joel, Jonah, Micah, Nahum, and Zechariah.

2.  **Different chapter count (2 books).** Joel has 4 chapters in the
    Masoretic Text but 3 in the Christian canon; Malachi has 3 chapters in
    the Masoretic Text but 4 in the Christian canon. These are not
    front-trimming cases — they require cross-chapter redistribution.

3.  **Genuine verse-count differences (2 chapters).** Nehemiah 7 (72 vs. 73
    verses) and Isaiah 64 (11 vs. 12 verses) have known MT/Christian
    versification differences that cannot be fixed by moving verses between
    chapters. These are the same category as existing entries in
    `data/known-variants.js`.

**Critical finding:** Most of these mappings are not manually invented — the
OSHB XML files contain **2,027 `<note>KJV:...>` annotations** embedded in the
verse data. Chapter-boundary shifts are documented by `<note>` elements on the
first verse of the affected Masoretic chapter, e.g.:
```
<verse osisID="Gen.32.1">
  <note>KJV:Gen.31.55</note>
```

This means the versification mapping can be derived **algorithmically from
the source data itself** rather than maintained as a large hand-written
remapping table. Only the Joel (4→3) and Malachi (3→4) chapter-count
differences and the two genuine verse-count differences would require
special-case handling.

### Current Status

The Hebrew source investigation is **complete** and the import has shipped.

### Implementation shipped

The import was completed and committed (`f809d6f`, `ffc4df7`, plus follow-up
font/readability commits `9400dbf`, `96318e7`, `b1148ee`). It is registered
in `app.js`'s `TRANSLATIONS` array as `{ id: 'he', label: 'Hebrew (OSHB)' }`.

Contrary to the earlier plan (which considered a simple front-trimming
approach and tabled algorithmic versification), the shipped importer
(`build/import-oshb.mjs`) **does** implement full algorithmic versification
driven by the 2,027 `<note>KJV:…</note>` annotations embedded in the OSHB XML
source. The placement engine uses a PLACE/REPLACE/MERGE/SPLIT dispatch: empty
slots are filled directly (PLACE), Psalm superscriptions and 1 Chronicles
numbering cascades are overwritten by their note-bearing successors (REPLACE),
consecutive Masoretic verses that belong to a single Christian verse are
concatenated with a space (MERGE), and mid-verse KJV notes that split
one OSHB verse into two Christian destinations are handled by extracting
the text before and after the note tag separately (SPLIT). The only
remaining manual special case is the Psalm title/superscription trimming that
was present from v1.

Final `validate.mjs` result:

```
0 errors
3 warnings (provisional): EST 4 (1 verses), EST 10 (1 verses), DAN (1 chapters)
1 info (known variant): PSA 13 (Masoretic vs. Christian verse count)
```

The warnings are all against provisional canon entries (Esther and Daniel
chapter/verse counts were computed from WEB-C alone and not yet verified
against multiple independent sources — see Phase 5.5). The known-variant
note for Psalm 13 records the Masoretic/Christian verse-count difference
in `data/known-variants.js`.

## Phase 7 — Multi-reference search and per-block context toggles

Commits: `5ba5699`, `1c150fa`, `1bd7d6c`.

The single-reference verse lookup from Phase 4 was extended to support
YaQuB-style multi-reference queries (`"Mark 14:2,6-9;Matthew 26:26-31"`),
rendering each `;`-separated group as its own headed table block within
one result set. A global "Show context (±3)" button beneath the search bar
expands every block to show surrounding verses. Each block now also has its
own individual context-toggle button beside its heading, so a user can
expand or collapse context per block independently without affecting the
others. The global button still expands or collapses every block
simultaneously, clearing any per-block overrides. State is managed through
two layers: a global `contextEnabled` boolean plus a `blockContextOverrides`
Map keyed by `"bookId-chapterNum"` — per-block overrides win when present,
otherwise the global flag applies. Prior to this, context verses had
inherited the zebra-stripe row background, making them visually
indistinguishable from matched verses — `1c150fa` fixed that by applying
a consistent white (`var(--paper)`) background to context-verse rows and
reserving the theme panel colour (`var(--panel)`) for highlighted matched
verses.

## 2026-08-12 — DeepSeek Flash coding agent, wrap-around navigation, appearance modes

### Codex + DeepSeek V4 Flash integration

Codex was configured to use `deepseek-v4-flash` as the model through the
DeepSeek API, via the DeepSeek provider with API-key authentication. The
Codex CLI was initially on 0.144.6 for this setup and was then updated to
0.147.0. The configuration was verified end to end: the CLI actually
launched with `deepseek-v4-flash` at high reasoning effort, and the same
configuration worked from the VS Code Codex integration, even though the
UI displayed the provider as "Custom". A read-only repository inspection
confirmed the agent could inspect Maranatha's architecture and project
files. DeepSeek V4 Flash is now used as an additional coding agent for
implementation and repository work.

### Wrap-around chapter navigation

Branch `feature/wrap-around-navigation`; commit `b743146`, which modified
only `app.js`.

`goToAdjacentChapter()` now wraps at canon boundaries: Previous from
Genesis 1 goes to Revelation 22, and Next from Revelation 22 goes to
Genesis 1. Normal adjacent-book navigation is unchanged. The change was
manually tested successfully, then committed, merged into `main`, and
pushed to GitHub.

### Light / Dark / System appearance mode

Branch `feature/light-dark-system-mode`; commit `3e849c3`, which touched
only `app.js`, `index.html`, and `style.css`.

An Appearance selector was added with System / Light / Dark options.
Complete dark variants were added for every existing color palette while
preserving the palette architecture and each palette's accent hue; the
previously hard-coded light colors were converted into semantic CSS
custom properties where necessary, so every UI element participates in
dark mode. `color-scheme` handling was added so native controls and
scrollbars follow the mode, and the appearance choice is persisted in
`localStorage`. System mode follows `prefers-color-scheme` and responds
to OS preference changes live. The Armenian cross image is inverted in
dark mode so it stays visible. Translation data, canon data, the build
pipeline, and the rendering architecture were all left untouched, and
automated behavioral validation passed 16/16 checks. The feature was
then manually inspected in the browser across the dark palettes and
reading presets, confirmed visually correct, committed, and pushed.

### Development workflow observation

Maranatha now uses feature branches for isolated changes, with local
testing and diff review before committing and merging. Mechanical Git
operations such as commit and push are performed manually when no agent
reasoning is needed, conserving coding-agent usage.

The first real-world DeepSeek Flash coding-agent tests were successful:
it handled both a small surgical JavaScript change (wrap-around chapter
navigation) and a broader HTML/CSS/JS appearance feature (Light / Dark /
System modes) while respecting scope and verifying its work.
