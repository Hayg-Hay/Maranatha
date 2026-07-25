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
