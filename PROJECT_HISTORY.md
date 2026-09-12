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

### Phase 2, take four — French: FreCrampon rejected, Segond 1910 blocked on licensing

French was scoped as the next translation after WEB/KJV. It is a nearer-term
goal than Armenian, but the same cultural logic motivates both: Ulysse's
Armenian background is the eventual target, and French is the practical
stepping stone toward it. Two French sources were investigated — the Catholic
Crampon (73-book target) and the Protestant Segond 1910 (66-book stopgap).
Neither shipped.

**FreCrampon (Catholic, 73-book target) — rejected, not shipped.** The source
was the CrossWire SWORD module FreCrampon v3.4, via `scrollmapper/bible_databases`'
SWORD-to-JSON extraction. Its typography problems (straight apostrophes,
NBSP/guillemet spacing, a few misoriented guillemets) were minor and largely
already fixed upstream by v3.4 — not the blocker. The blocker was structural:
**962 canonical verse slots are empty at the binary `.bzv`/`.bzs` level**,
because the upstream Wikisource-derived text merged verse ranges into single
records. Baruch is the worst case: the real Letter of Jeremiah text is misfiled
under the key Baruch 5:9, real Baruch 5 is swallowed into Baruch 4:37, and
Baruch 6 itself is 72 empty verse slots. This is the same failure category as
the Douay-Rheims rejection above — chapter/verse-boundary corruption confirmed
directly in the source — so it was not shipped and not patched by guessing at
wording. Not yet tried: the same Crampon translation via a different
digitization (abbaye-saint-benoit.ch, or direct Wikisource page markup), since
the corruption appears to originate in the SWORD build step rather than
necessarily in the underlying text. Logged as a real open option, not pursued
yet.

**Segond 1910 (Protestant, 66-book stopgap) — audited, clean, not imported;
blocked on licensing.** Two candidates were compared: the CrossWire SWORD module
`FreSegond1910` (Candidate A) and concordance.bible's Sg1910 CSV/OSIS export
(Candidate B). B is the current upstream artifact of A — A's own conf file sets
its `TextSource` to B's download URL — and the two texts are effectively
identical. (B's page, in turn, credits CrossWire's FreSegond as its base, so the
two are the same lineage; as published today, A points at B.) Structural result
for both: **66 books, 1,189 chapters, 31,170 verses, 0 real empty verse slots.**
27,122 verses are byte-identical between A and B; the remaining 4,048 differ
only by a `U+2009` thin-space artifact in A (leaking from empty Strong's-number
placeholders) that B's CSV export does not have. Encoding in B's CSV
specifically is clean — proper curly apostrophes, correct French NBSP /
narrow-NBSP spacing around punctuation and guillemets, no replacement
characters, no BOM. B's OSIS/USX exports still carry the same `U+2009` artifact
as A; only the CSV `v11n` variant is fully clean. No deuterocanonical books
appear in either candidate (expected — Segond is Protestant canon; this is a
stopgap for canon completeness, not a solution to it).

**Blocker: license unresolved, not merely unverified.** CrossWire's conf file
for Candidate A states `DistributionLicense=Copyrighted`. Candidate B's download
page states that the text itself is public domain, but B's own generic legal
notice states that reproduction of site data is prohibited without
authorization, and every actual downloadable file bundles Strong's numbers
under a separate attribution-required license — there is no untagged
plain-text file to point to as the clean public-domain artifact. The underlying
1910 translation is public domain (Segond died in 1885); the specific digitized
file is not confirmed clear for redistribution. Decision: do not import, and do
not represent as public domain, until an independent untagged plain-text source
is found and audited. The open next step is to check Wikisource for a Segond
1910 text, rather than writing to concordance.bible / CTB to request
public-domain confirmation.

**Flagged for later:** Segond's versification differs materially from the
KJV/WEB-based `canon.js` (e.g. Psalms +66 verses, differing Joel and Malachi
chapter counts, plus the chapter-boundary shifts already catalogued against
canon.js for OSHB), so it will need the same reconciliation treatment the OSHB
Hebrew import received before it can populate canon.js-shaped data.

**Status:** no French translation has shipped. FreCrampon and Segond 1910 both
remain open, for different reasons — structural corruption versus licensing.
Nothing in `data/` or `build/` changed as a result of this investigation.

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
## Phase 4 — Western Armenian NT

Added the first non-English Bible translation: the 1853 Western Armenian New
Testament, from the CrossWire SWORD module **"ArmWestern"** (mods.d/armwestern.conf,
DistributionLicense=Public Domain, TextSource="Slavic Bible via
http://unbound.biola.edu"). The module ships **NT only — 27 books, no OT data at
all**. Because SWORD zText is a binary format (compressed + block-indexed), it was
decoded once with the Python `pysword` library and cached as plain JSON at
`build/sources/armwestern/armwestern.source.json`; `build/import-armwestern.mjs`
then normalizes that cache into `data/armwestern.json` / `data/armwestern.js`
exactly like the other importers.

**The "???Missing???" convention.** 10 of the source module's 7,957 verses are
genuinely blank at the raw SWORD data level (Matt 17:27, Mark 9:50, Acts 7:60,
Acts 14:28, Acts 19:41, 2Cor 2:1, 2Cor 6:1, 2Cor 13:14, 1Thess 4:18, Heb 13:25),
confirmed directly from the module's byte offsets rather than assumed from
decode output. The importer writes these through as the literal text
`???Missing???` — deliberate, echoing YaQuB's own `numbering.html` convention
for the same kind of source gap — instead of silently dropping the verse or
guessing wording from context. A real fix requires a second, independently
produced Western Armenian NT source to cross-check and patch those 10 verses.

**TR vs. Byzantine textual tradition.** The text is Textus Receptus-family, not
Byzantine Majority (unlike this project's `byz` translation). All confirmed
directly in `data/armwestern.json`: Mark 16:9-20 (long ending), John 7:53-8:11
(pericope adulterae), 1 John 5:7 (Comma Johanneum — the strongest signal, a
TR/Vulgate-only reading essentially absent from Byzantine Majority mss),
Acts 8:37, Romans 16:24, and Romans 14 with 23 verses rather than 26 (the
doxology sits at the end of ch16, TR-style, not ch14, Byzantine/WEB-style).
Recorded in `data/known-variants.js` following the existing schema, and
`validate.mjs` reports the Romans 14 difference as its known-variant info note
(0 errors, 0 warnings).

**Open decision, not resolved here:** this is NT-only in the Western Armenian
register. Pairing it later with a full Armenian OT requires either a matching
Western Armenian OT source, or accepting a register mismatch against the
Classical/Grabar Zohrab 1805 OT candidate — Western Armenian is a different
register from Classical Armenian, so the two cannot be merged into one
"Armenian" edition by default.

## Phase 5 — Verse reference lookup and explicit view modes

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

## Phase 5+ (remaining)

Fix the multi-column highlight/scroll gap noted above. Still ahead beyond
that: mobile responsiveness pass, full YaQuB-style multi-reference parsing
(`5:20-` open-ended ranges, `;`-separated multiple references in one query),
text search, richer navigation, and GitHub Pages deployment.

## Phase 4 — Armenian interlinear: investigated, blocked on licensing

Following the Greek and Hebrew interlinear work, an Armenian interlinear was
investigated. One tagged source was found:
`bible.armeniancathedral.org` (MWeb Studio / Arak29), presenting the 1895
Bagratuni Classical Armenian text with per-word lemma, morphology, English
gloss, and a custom numeric lexicon ID — structurally equivalent to the
Greek/Hebrew interlinear data already in use, and covering the full Bible
including the extended Armenian deuterocanon (3 Maccabees, 1 Esdras).

The underlying 1895 text is public domain, but the word-level tagging and
lexicon work is the site's own editorial contribution and is marked "All
Rights Reserved" in its footer copyright notice. That conflicts with this
project's standing rule of using only public-domain or permissively licensed
sources (the single named exception being Open Scriptures' CC-BY-SA Strong's
numbers). No free or openly licensed alternative with comparable tagging was
found; several untagged Armenian text repositories exist (SWORD `ArmWestern`,
`ArmEastern`, a few GitHub mirrors) but none carry morphology or gloss data.

Secondary findings, relevant if permission is ever granted: the text is
Classical/Grabar, not Western Armenian, so it would not merge with the
existing `armwestern` NT and would need to stand alone; its lexicon uses a
custom ID scheme rather than Strong's numbers, which fits the existing
interlinear renderer as a distinct key prefix rather than requiring a new
abstraction; and its book list and deuterocanon ordering differ from
`canon.js` and would need the same kind of canonical-placement work OSHB
required.

The UI/data integration itself was scoped and found to be config-only within
the existing `INTERLINEARS` abstraction (a new entry, a new
`interlinearState` flag, one new checkbox, a transliteration helper, an
`@font-face`, a service-worker cache bump) — no new architecture needed, just
a source.

Decision: do not build against this source. A permission request was sent to
the contact address published in the site's footer, asking whether the
tagging could be reused under a permissive or CC license, or exported
specifically for this project. Outcome pending; this entry will be updated
once a reply is received either way.

## Role of AI

This project, like YaQuB before it, is AI-assisted. Claude built the canon
data pipeline, wrote and tested the validator, and scaffolded the project
structure. Where source data couldn't be verified, that is recorded as a gap
in the data itself rather than filled in from training-data recall.

Human contributions: defining the canon and translation scope, the
architectural continuity with YaQuB, deciding what's in v1 vs. deferred, and
everything from here on (git init, GitHub repo creation, review).

## Phase 5.5 — Official WEB Catholic Edition Import (milestone-webc-import)

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
canon metadata from the pre-WEB-C era; see Phase 6.5).

**Impact on provisional books:** The WEB-C import provided real verse text
for Esther (Greek additions expand chapters 4 and 10), Baruch (chapter 6,
the Letter of Jeremiah, now present as 73 verses), and Daniel (Greek
additions: Susanna as chapter 13, Bel and the Dragon as chapter 14, and
Daniel 3 expanded to 97 verses including the Prayer of Azariah and the
Song of the Three). These counts were not reflected in `canon.computed.json`
at the time of import — that was addressed in Phase 6.5.

## Phase 6 — Byzantine Majority Text (Greek NT) added

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

## Phase 6.5 — Canon re-baselining and verse-count fix

**Background:** Phase 5.5 (WEB-C import) replaced the 66-book WEB data with
the full 73-book WEB Catholic Edition, but the original `canon.computed.json`
was never updated to reflect the new WEB-C data — it still contained
chapter/verse counts computed from the old Scrollmapper source. Phase 6
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

## Phase 7 — Byzantine wired into the browser, then a real data-corruption bug found and fixed

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
against multiple independent sources — see Phase 6.5). The known-variant
note for Psalm 13 records the Masoretic/Christian verse-count difference
in `data/known-variants.js`.

## Phase 8 — Multi-reference search and per-block context toggles

Commits: `5ba5699`, `1c150fa`, `1bd7d6c`.

The single-reference verse lookup from Phase 5 was extended to support
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

The first real-world DeepSeek Flash coding-agent tests werpe successful:
it handled both a small surgical JavaScript change (wrap-around chapter
navigation) and a broader HTML/CSS/JS appearance feature (Light / Dark /
System modes) while respecting scope and verifying its work.

## 2026-09-10 — Hebrew and Greek font wiring, reading-preset cascade fix, repo hygiene

### Hebrew (Ezra SIL) font wired to verse rendering

The OSHB Hebrew import (shipped `f809d6f`, `ffc4df7`) rendered through
`.hebrew-verse`, which set only `text-align:right; font-size:1.25rem;
line-height:1.7` and relied on whatever Hebrew font the operating system
happened to provide. `fonts/SILEOT.ttf` — Ezra SIL 2.51 (SIL Open Font
License 1.1, with MIT/X11-licensed Hebrew layout intelligence) — had been
committed earlier in `2c18aad` ("Add debug log and fonts folder") but was
never actually referenced by any rule, so the committed font did nothing.

Commit `88703b5` wires it up: an `@font-face` declaring the family "Ezra SIL"
from `fonts/SILEOT.ttf`, and `.hebrew-verse` now resolves
`font-family:'Ezra SIL','SBL Hebrew',serif`. No JavaScript or HTML change was
needed — `app.js` already tags Hebrew cells with `dir="rtl"`, `lang="he"`,
and the `hebrew-verse` class. The point is to make Hebrew rendering
deterministic (niqqud and cantillation included) instead of depending on the
host OS, with graceful fallbacks.

### Greek (Cardo) font wired to verse rendering

Parallel to the Hebrew/Ezra SIL work: BibleHub's own font guidance uses Cardo
for Greek and Ezra SIL for Hebrew, so Cardo is the matching choice for
Maranatha's Greek text. Cardo is a Unicode font by David J. Perry intended for
Biblical/Classical scholarship, with strong polytonic Greek coverage (the
accents and breathing marks the Koine text needs).

License verified against the upstream `google/fonts` repository (`ofl/cardo/`)
rather than assumed: `METADATA.pb` declares `license: "OFL"`, and the OFL 1.1
statement plus the copyright "Copyright (c) 2002-2011, David J. Perry
(hospes02@scholarsfonts.net)" are embedded in the TTF name table itself — the
same distribution condition the Ezra SIL file already satisfies. Upstream source
repo is `github.com/googlefonts/CardoFont`; font subsets include `greek` and
`greek-ext`.

Commit `3091346` adds `fonts/Cardo-Regular.ttf` (regular weight only, mirroring
the single-file Hebrew font; bold/italic are synthesized by the browser), an
`@font-face` for family "Cardo", and `.greek-verse
{ font-family:'Cardo','Gentium Plus',serif; font-size:1.2rem; line-height:1.7 }`.
`app.js`'s `fillCell()` now tags Byzantine cells with `lang="el"` and the
`greek-verse` class, alongside the existing `hebrew-verse` tagging. Only `byz`
is tagged because it is currently the only live Greek translation; a future LXX
translation needs one added clause (`|| tId === 'lxx'`) in the same `fillCell()`
branch. No `index.html` change was needed, and the font loads via the same
relative-path `file://` mechanism already confirmed working for Ezra SIL.

### Warm / Low-contrast reading presets were silently cancelling the color schemes

Symptom: choosing "Warm / Sepia" (or "Low contrast") under Reading made the
Color scheme selector appear to stop working entirely — changing it had no
visible effect.

Root cause: both presets were implemented as *palettes*, redefining the same
CSS custom properties the themes use (`--ink`, `--accent`, `--paper`,
`--panel`, `--alt`, `--line`, plus `--body-bg`). The theme rules
(`:root[data-theme="…"]`) and the reading rules (`:root[data-reading="…"]`)
have identical specificity — `:root` (0,1,0) plus one attribute (0,1,0) =
(0,2,0) — and on a specificity tie the later source-order rule wins. The
reading presets sat *after* the themes in `style.css`, so they overrode every
theme variable. The JavaScript was correct the whole time: `setReading()` and
`setTheme()` both fire and both attributes coexist on `<html>`; the CSS simply
never let them compose. Dark mode had the same problem, with the dark reading
rules placed after the dark theme rules.

Commit `018fe6d` removes the competing palette blocks (light and dark) and
re-implements the presets as layers that compose with whatever scheme is
active:

- **Warm** is now a full-viewport amber tint — the f.lux / Night-Shift model,
  which is what an "eye-saver filter" actually is:
  `:root[data-reading="warm"] body::after { position:fixed; inset:0;
  pointer-events:none; background:var(--warm-tint); z-index:9999; }`, with
  `--warm-tint` at `rgba(255,172,64,0.14)` in light mode and a subtler
  `rgba(255,160,60,0.07)` in dark (full-strength amber washes out dark
  panels).
- **Low contrast** genuinely needs to reduce contrast of what is underneath,
  so it is applied as `:root[data-reading="low-contrast"] body
  { filter: contrast(0.82) saturate(0.85); }` rather than a tint.

Design decisions recorded: the tint covers the whole viewport (header and
controls included), because restricting it to reading text would make it feel
like a text-color setting rather than a filter. Plain alpha was chosen over a
blend mode (`multiply`/`soft-light`) specifically because there are eight
themes × light/dark × the tint; a blend mode would look different against
every combination and require eyeballing all of them, while alpha is
predictable regardless of what is underneath. `data-reading` is
single-valued, so warm's `body::after` and low-contrast's `body { filter }`
are never active at the same time — no containing-block collision between the
two. No `app.js`/`index.html` change was required.

### Verified closed: OSHB nested `<seg>` markup leak

`extractVerseTextFromXML()` in `build/import-oshb.mjs` had once treated `<w>`
element content as pre-cleaned text, so nested `<seg>` elements (OSHB's
x-large/x-small enlarged letters) survived into the surface text; the
slash-strip then turned the closing `</seg>` into a literal `<seg>`. This was
already fixed in `7c8a23c` (flatten inner tags inside `<w>` before the
slash/whitespace cleanup, then rebuild `data/he.json`/`data/he.js`).
Re-verified during this review rather than assumed: `data/he.json` Deut 6:4
(the Shema, whose source contains `שְׁמַ֖<seg type="x-large">ע</seg>`) is clean,
and a full-corpus scan of all 39 books found zero verses containing `<` or `>`
or any literal `<w>`/`<seg>`/`<note>` tag. Closed.

### Repository hygiene

- `.codewhale/state/subagents.v1.lock` — coding-agent tool state that should
  never have been tracked. Removed, and `.codewhale/` added to `.gitignore`
  (commit `ed9b298`).
- `debug.log` — Chromium/Electron crashpad noise ("CreateFile: Accès refusé"),
  accidentally swept into `2c18aad` alongside the font. Removed and
  `debug.log` added to `.gitignore` (commit `4bd9f19`).
- `armenian-cross.png` — orphaned; `index.html` references
  `Armenian-cross_2.png`. Confirmed unreferenced by grep, then removed
  (commit `dda2dee`).
- `index.html` — removed the stale top-of-page "Available translations"
  `<details>` notice, which claimed only two translations (WEB-C and KJV)
  while five are registered in `app.js` (commit `04a6d9f`).

All of the above was committed and pushed to `origin/main`.

## 2026-09-10 — PWA offline support for the GitHub Pages deployment

The desktop workflow has always been offline-first: opening `index.html`
from disk needs no server and no network. On the phone, access had been a
home-screen bookmark to the GitHub Pages URL, which is only a shortcut — with
no connection there is nothing to load, so it fails. The goal was to give the
phone the same offline behavior as the desktop.

The app is now a Progressive Web App: `manifest.json`, a `service-worker.js`
next to `index.html`, and a guarded registration snippet in `index.html`.
Icons (`icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
`favicon-32.png`) were generated once from the existing 1024×1024
`Armenian-cross_2.png` with Pillow (build-time tooling only; the generated PNGs
are what is committed). `<head>` gained the manifest link, favicon,
`apple-touch-icon`, Apple PWA meta tags, and a light/dark `theme-color` pair.

### The service worker is gated to http/https only

Service workers require a secure context and simply do not run under
`file://` — but the registration script would still *execute* on desktop and
throw a console error if it ran unguarded. So registration is wrapped in
`if ('serviceWorker' in navigator && (location.protocol === 'https:' ||
location.protocol === 'http:'))`, and `.register()` is also `.catch()`-ed.
This is deliberate, not incidental: the guard is what keeps the phone feature
from ever touching the desktop path. It should not be "simplified" away.
Registration happens on `window`'s `load` event so it never competes with the
initial render.

### file:// desktop support must never be broken

This is the load-bearing constraint of the whole project and predates the PWA
work: `index.html` must open by bare double-click with zero server and zero
network. It is the reason translation data is loaded through dynamically
created `<script>` tags rather than `fetch()` — a decision already violated
once and reverted (see Phase 2). The PWA addition preserves it exactly:
because the browser never runs a service worker on `file://`, and because the
registration is protocol-gated, the desktop experience is byte-for-byte
unchanged. Any future change to the service worker or the registration snippet
must be checked against this: desktop `file://` support is not negotiable.

### Translation files are runtime-cached, not precached

The total app is ~18.3 MB, and ~17.8 MB of that is the five large
`data/*.js` translation files (`web`, `kjv`, `byz`, `he`, `armwestern`). Only
the small application shell is precached on install — `index.html`,
`style.css`, `app.js`, `data/canon.js`, `data/locales/en.js`, `manifest.json`,
the two fonts, the four icons, and the header image (`Armenian-cross_2.png`,
which the generic shell list omitted but which the header needs to render
offline). That keeps first install small (~2 MB, mostly the header image)
instead of downloading ~18 MB up front and re-downloading it on every cache
version bump.

The translation files are instead cached at **runtime, cache-first**: the
first time the app actually loads one (when its checkbox is selected, or
automatically for `web`, which is on by default), it is fetched over the
network and stored, and is thereafter served from cache — including offline. A
translation that is never opened while online is not available offline; this
is the deliberate trade-off. `isTranslationFile()` matches `data/<id>.js` but
excludes `data/canon.js` and `data/locales/en.js`, so those shell files are
served from the shell cache rather than the runtime cache (without that
exclusion, `canon.js` would be routed to an empty runtime cache and miss while
offline even though it was precached).

### Why the service worker's fetch() is not a violation of the no-fetch rule

The service worker uses `fetch()` internally to populate its caches. That is
an ordinary HTTPS request to GitHub Pages, and is unrelated to the project's
absolute rule that `app.js` must never `fetch()` *local* data files under
`file://`. A service worker cannot run under `file://` at all, so the two
contexts can never meet. This note exists so a future reader does not "fix"
the service worker by removing its `fetch()`, or relax the desktop rule on
the mistaken belief that the two are connected.

### Cache versioning and updates

Two independent version constants exist: `CACHE_VERSION` for the shell and
`DATA_CACHE_VERSION` for translation data. Keeping them separate means a
routine shell tweak (CSS, `app.js`) does not force already-cached translations
to re-download. `install` calls `self.skipWaiting()`; `activate` deletes any
`maranatha-` cache not in the current keep-set and calls `self.clients.claim()`.
After any deploy the relevant constant must be bumped, or the phone may keep
serving the previous shell/data. GitHub Pages/CDN can also cache
`service-worker.js` itself for a few minutes, so a new version may need a
reload or two to be picked up.

### Caveats to verify on the actual device

- iOS has historically evicted PWA caches after periods of disuse and had
  bugs with service workers on home-screen-installed PWAs; offline should work
  but is not assumed permanent, and an occasional online open refreshes it.
- None of this can be tested from `file://`; it only exists over HTTPS, so it
  must be tested via the GitHub Pages URL (DevTools → Application → Service
  Workers / Cache Storage) and then on the phone in airplane mode.

### Confirmed on iOS

Verified on the actual iPhone: after one online load and re-adding the
home-screen icon, Maranatha opens and works with the phone in airplane mode —
the app shell and the default WEB translation served from the service-worker
cache. This closes the original complaint: the previous home-screen icon was
only a bookmark to the GitHub Pages URL, so with no network there was nothing
to load.

### Update prompt (user-driven, not silent)

The service worker no longer calls `self.skipWaiting()` in its install handler.
A newly deployed worker now waits, and the page detects it — either
`registration.waiting` on load, or `updatefound` → `statechange === 'installed'`
with an existing controller — and shows a small "A new version of Maranatha is
available." banner with Reload / Later buttons. Reload posts
`{ type: 'SKIP_WAITING' }`; the waiting worker activates (message handler added
to `service-worker.js`) and the page reloads into the new shell through a
`controllerchange` listener. The reload is gated on the user actually pressing
Reload, so the first-install `clients.claim()` does not cause a spurious
refresh. `CACHE_VERSION` was bumped to `v3`.

One-time rollout note: the shell that was live when this shipped (v2) predates
the banner code, so the very first v3 update still required one full close and
reopen of the app. From then on the banner appears for every update.

Files: `manifest.json`, `service-worker.js`, `icons/` (four PNGs), and the
`index.html` head/registration changes.

## 2026-09-10 — Mobile layout fix: translations no longer overlap on narrow screens

On the phone, side-by-side (multi-column) translations overlapped while
reading. Root cause: `#results table` uses `table-layout:fixed; width:100%`,
so on a narrow screen each translation column is tiny, and any content wider
than its cell overflows into the next column instead of wrapping — long
polytonic Greek and Hebrew words, long translation header labels, and the
verse-reference cell (`119:176`-style) which additionally had
`white-space:nowrap` and could bleed into the first translation column.

Fix (`style.css`, `app.js`):

- `th, td` gained `overflow-wrap:break-word`, so long words wrap instead of
  spilling across cells. This is the core overlap fix.
- `.reference` lost its `white-space:nowrap`, so the verse number can no longer
  overflow into the first translation column.
- `.result-head` gained `flex-wrap:wrap`, so a long heading and the per-block
  context-toggle button do not collide on a narrow width.
- The mobile media query (now `max-width:700px`) narrows the reference and
  translation-label columns, tightens padding, and slightly reduces the Greek
  and Hebrew font sizes.
- Automatic layout now also selects multi-row on screens ≤700px — previously
  it only did so when more than 5 translations were selected (the YaQuB rule).
  This is driven by `window.matchMedia('(max-width: 700px)')` plus a `change`
  listener that re-renders when the breakpoint is crossed (phone rotation, or a
  resized desktop window), and only when the Layout dropdown is set to
  Automatic. A manual Layout choice is still respected.

`CACHE_VERSION` in `service-worker.js` was bumped `v1` → `v2` in the same
change: `app.js` and `style.css` are shell files, so without the bump the
phone would have kept serving the old cached shell (see the cache versioning
note above).

## 2026-09-10 — Armenian (hy) UI locale

Added the first non-English UI locale. This is a **display-name** localization,
not Armenian Scripture: it changes the Book dropdown, the result headings, and
what the reference parser accepts, while canon structure and every translation
file are untouched. The Armenian NT (`armwestern`) already existed; the
Armenian OT remains the separate, source-blocked item.

**Data.** `data/locales/hy.json` + `hy.js` (`window.MARANATHA_LOCALE_HY`), 73
book names, generated by `build/build-locale.mjs` from the new source file
`build/sources/locale-hy.names.json`. The names come from the public-domain
«Արարատ» Armenian Bible (`github.com/hayksahnazaryan/bible-ararat`'s
`src/structure.json`), which supplies 65 of the 73 books (38 OT + 27 NT);
Wisdom was additionally confirmed via the CC0
`github.com/armantark/arm-bible-translations`. The Ararat structure is a
65-book canon and omits Joshua plus the seven deuterocanonical books, so those
8 names use standard Armenian forms and are listed in the source file's
`_unverified` array pending confirmation. Source names were title-cased (the
structure stores them all-caps). `build/build-locale.mjs` was generalized to
emit any locale from a names source; English generation is byte-for-byte
unchanged (still read from `canon.computed.json`).

**App.** `app.js` gained a `LOCALES` registry plus a mutable `locale`/`parser`;
`setLocale()` rebuilds the reference parser, repopulates the Book dropdown, and
re-renders. A Language `<select id="language">` in `index.html` is populated
from `LOCALES` and persisted in `localStorage` under `maranatha-locale`.
`data/locales/hy.js` is loaded with a `<script>` tag (file://-safe) and added
to the service-worker shell precache; `CACHE_VERSION` bumped `v3` → `v4`.

**Verified.** The Armenian parser resolves `Ծննդոց 1:1`, `Յովհաննէս 3:16`,
`Ա Թագաւորաց 1:1`, `Երգ Երգոց`, and multi-word Pauline titles (e.g.
`Թուղթ Առ Հռովմայեցիս 8`), and English still resolves under `en`. All 73 IDs
are present in both locales with no duplicate names.

## 2026-09-10 — Table "Verse" header was wrapping

On a laptop, the results table's top-left header rendered as "Vers" / "e" on
two lines instead of "Verse". The `.reference` column was `4rem` wide, which
after the 1px borders and 18px padding left only ~44px of content — just under
the rendered width of the word "Verse", so it wrapped. (The earlier mobile
overlap fix had removed `white-space:nowrap` from `.reference` to stop verse
numbers spilling into the next column; that is why the header was free to
wrap.)

Fix in `style.css`: `.reference` widened `4rem` → `4.75rem`, `th.reference`
given `white-space:nowrap` (the short header always fits now, so nowrap cannot
overflow), and the `max-width:700px` override raised `3.25rem` → `4rem`.
Verified headless with Chrome (`--dump-dom`): `th.reference` measures 76px and
now renders on a single line. `CACHE_VERSION` bumped `v4` → `v5` (shell file).

## 2026-09-10 — Armenian testament labels in the Book dropdown

The Book dropdown's `optgroup` labels ("Old Testament" / "New Testament") were
hardcoded English in `app.js`. The locale files now carry a `testaments`
object — English as before, Armenian as `Հին Կտակարան` / `Նոր Կտակարան`,
taken verbatim from the Ararat structure's `testament` field — and
`populateBooks()` reads `locale.testaments[testament]`, falling back to the
English strings if a locale omits them. `build/build-locale.mjs` emits the new
field for every locale (which also added it to `en.json`/`en.js`). Verified
headless with Chrome: with Armenian selected, the groups read
`Հին Կտակարան` (first book `Ծննդոց`) and `Նոր Կտակարան` (first `Մատթէոս`).
`CACHE_VERSION` bumped `v5` → `v6`.

## 2026-09-10 — Reference parser upgrades

`ReferenceParser` (`app.js`) gained four things:

- **Book aliases.** The reserved `aliases` slot the constructor already read
  was empty; English abbreviations/alternates now come from
  `build/sources/locale-en.aliases.json` (158 aliases) and are merged into
  `data/locales/en.json`/`en.js` by `build-locale.mjs`. `ReferenceParser.normalizeKey`
  normalizes both the map keys and the user input — lowercase, leading Roman
  numerals I/II/III → 1/2/3, leading 1st/2nd/3rd/4th dropped, periods /
  apostrophes / hyphens / whitespace removed — so `I Cor.`, `1Cor`, `1 cor`
  and `1st Corinthians` all resolve without a separate alias. Verified 0 key
  collisions across 224 map keys.
- **Open-ended ranges.** `Psalm 23:1-` now means "through the last verse"
  (the range regex accepts a missing end and clamps it to the chapter length).
- **Whole-book references.** A group with no chapter (`Jude`, `Genesis`)
  resolves to the book's first chapter.
- **All errors at once.** A multi-group query reports every malformed group in
  one message instead of aborting on the first.

Armenian references keep working unchanged (`Ծննդոց 1:1`, `Սաղմոս 23:1-`,
`Ա Թագաւորաց 3:1`, …). `CACHE_VERSION` bumped `v6` → `v7` (shell change).

## 2026-09-10 — Text search (Part B)

Added text search with the agreed v1 scope: a separate Search field; one
translation at a time (a "Search in" select populated from checked
translations that have finished loading); phrase substring matching, case- and
diacritic-insensitive; full verse text with the match highlighted; clicking a
result jumps to that chapter in browse mode with the verse highlighted; up to
300 results rendered, with the total match count shown.

Implementation:

- `viewState` gained a `'search'` mode and a `highlightVerse` used for the
  browse-mode jump. `appendResultBlock`'s per-block context toggle is now gated
  by an explicit `showContextToggle` flag (reference mode only), so a
  browse-highlight row does not get a context button.
- Pure helpers in `app.js`: `normalizeSearchText` (NFD, drop combining marks
  `U+0300–U+036F` and Hebrew niqqud/te'amim `U+0591–U+05C7`, lowercase),
  `buildSearchForm` (normalized string plus an index map back to the original
  text, so the match is highlighted with diacritics intact), and `searchVerses`
  (linear scan in canon order — no index file; full scans measured at 12–69 ms
  per translation). `appendHighlighted` builds `<mark>` from text nodes only,
  never `innerHTML`, so user input is safe.
- Search is entirely local and fetches nothing; it works from `file://`.

Verified headless with Chrome (`--dump-dom`): WEB "God created" → 10 matches,
first "Genesis 1:1" with `God created` marked; clicking it jumps to Genesis 1
with verse 1 highlighted; a no-match query shows "No matches."; a Hebrew query
`בראשית` (no niqqud) matches niqqud text with `בְּרֵאשִׁ֖ית` marked; a Greek
query `λογος` (no accents) matches 67 `λόγος` occurrences in the Byzantine
text. `CACHE_VERSION` bumped `v7` → `v8`.

## 2026-09-10 — Per-verse "compare translations" in search results

Search results now support inline comparison. Each hit has a "Compare
translations" button (shown only when at least one other translation is
loaded) that expands the same verse in every other loaded translation. The
search term is highlighted wherever it actually appears — an English query
marks in WEB/KJV but is left un-highlighted in Hebrew, Greek or Armenian — and
a book/verse a translation does not cover shows "(not available in this
translation)". Clicking the verse body still jumps to the chapter with the
verse highlighted; the compare button stops propagation so it does not
navigate.

Built as an experiment on branch `feature/verse-compare` (commit `bb6d7b9`) and
merged into `main`. `.search-hit` changed from a `<button>` to a focusable
`<div role="button">` so the nested compare button is valid HTML, and
`buildComparePanel()` reuses `appendHighlighted()` for per-translation
highlighting. `CACHE_VERSION` bumped `v8` → `v9`.

## 2026-09-10 — Search-in labels and mobile row overflow

The Search field's "Search in" `<select>` overflowed the viewport on phones: a
`<select>` sizes to its widest `<option>`, and the options were the full
translation labels; combined with a non-wrapping flex row whose items default
to `min-width:auto`, the row was pushed past the right edge.

- `TRANSLATIONS` entries gained a `short` label — WEB, KJV, Western Armenian,
  Byzantine Greek, Hebrew (OSHB). Each keeps its version/register qualifier so
  a future LXX, Grabar or Eastern Armenian entry will not collide.
  `populateSearchTranslations()` uses `short` for the select only; the full
  labels remain on the checkboxes, the search heading and the compare panel.
- `.reference-row` (shared by Reference and Search) now wraps, and its inputs
  and selects get `min-width:0; max-width:100%`; under `max-width:700px` the
  input takes its own line with the select and button beneath it. Neither row
  can overflow a small screen now.
- `CACHE_VERSION` bumped `v9` → `v10`.

Verified headless: at a phone-ish width the document does not scroll
horizontally, the input is on its own line and select + button sit below it; at
desktop width the row is unchanged (one line).

## 2026-09-10 — Greek interlinear reader

Added the first interlinear view, for the Greek New Testament, inspired by
BibleHub's interlinear.

**Sources.**
- Tagged Greek text: `byztxt/byzantine-majority-text`,
  `csv-unicode/strongs/with-parsing/*.csv` — Robinson-Pierpont Byzantine text
  with Strong's numbers and morphology per word, **Unlicense** (public domain,
  the same source family as the `byz` translation). Cached in
  `build/sources/byz-strongs/`.
- Glosses: `openscriptures/strongs` `greek/strongs-greek-dictionary.js` —
  Strong's definitions, **CC-BY-SA**. This is the first data source in the
  project that is not public-domain/permissive; it is isolated in its own file
  (`data/strongs-greek.*`) and attributed in the view. The underlying Strong's
  1890 is public domain.

**Pipeline.** `build/import-byz-interlinear.mjs` parses the CSVs into
`[surface, Strong's, morphology]` tokens, aligning the surface form to the
accented text already in `data/byz.json` when word counts match (all 7,953
verses aligned, 0 fallbacks), and emits `data/byz-interlinear.{json,js}` and
`data/strongs-greek.{json,js}`. 140,149 tokens, 100% gloss coverage.

**UI.** An "Interlinear (Greek)" checkbox in the nav row. When ticked, the
current chapter renders as per-verse word cards (Greek / transliteration /
gloss / Strong's number, morphology in the tooltip), with the first selected
translation as a caption. Transliteration is algorithmic (Greek → Latin; a
rough breathing adds a leading "h"). The data (~4.3 MB + 160 KB) is lazily
loaded via `<script>` tags on first use, so it works from `file://` and is
runtime-cached by the service worker; only the Greek NT has data, so OT books
show a notice. `CACHE_VERSION` bumped `v10` → `v11`.

Built on branch `feature/greek-interlinear` (commit `0af6a04`) and merged into
`main`. Known v1 rough edges: glosses are Strong's `kjv_def` lists (clamped to
two lines, full text in the tooltip) rather than curated concise glosses, and
the transliteration is approximate.

## 2026-09-11 — Silence CSS validator warning from the interlinear gloss clamp

The Greek interlinear's `.iw-gloss` rule (added in `0af6a04`) used
`-webkit-line-clamp` without the now-standardized `line-clamp`, which made
VS Code's built-in CSS language service flag `style.css` with one warning
("Also define the standard property 'line-clamp' for compatibility"). Added
`line-clamp: 2;` alongside the `-webkit-` fallback so the warning clears while
WebKit/Bink still use the prefixed form. Behaviour is unchanged. `style.css` is
a shell file, so `CACHE_VERSION` bumped `v11` → `v12`.

## 2026-09-11 — Hebrew interlinear reader

Added the Hebrew counterpart to the Greek interlinear, covering the 39
protocanonical Old Testament books. Built on branch `feature/hebrew-interlinear`
(uncommitted as of this entry).

**Source.** Per-word tagging already exists in the OSHB OSIS XML the `he`
translation is built from: every `<w>` carries `@lemma`, `@morph`, and often
`@n`. `build/import-oshb.mjs`'s `extractVerseTextFromXML()` became
`extractVersePartsFromXML()`, which returns `{ text, tokens }` in one pass —
`text` is exactly what `he` displays, `tokens` is one
`[surface, Strong's, morphology]` entry per `<w>` in document order. The old
function is kept as a thin wrapper for the existing callers. Strong's is the
single numeric lemma component (`b/7225` → `7225`, `1254 a` → `1254`); `<seg>`
punctuation (maqaf, sof pasuq, paseq) contributes to `text` but is never a
token, so a maqaf-joined pair stays two cards.

**Pipeline.** `build/import-oshb-interlinear.mjs` reuses the exact versification
engine in `import-oshb.mjs` (`collectVerses` → `placeAllVerses` →
`buildOutput`, now exported) instead of re-implementing the Masoretic →
Christian mapping, so the interlinear tokens land in the same slots as
`data/he.json` — the two outputs share one source of truth. `placeAllVerses()`
writes text and tokens in lockstep through every branch (PLACE, REPLACE, MERGE,
and the reverse-order cross-chapter merge). Output: `data/he-interlinear.{json,js}`
(11.4 MB; 39 books, 23,143 verses, 306,271 tokens) and
`data/strongs-hebrew.{json,js}`, from the cached
`build/sources/strongs/strongs-hebrew-dictionary.js` (Open Scriptures, CC-BY-SA;
8,674 glosses). `font` and rendering data are otherwise unchanged.

**UI.** A second "Interlinear (Hebrew)" checkbox. The two interlinear views are
now a table (`INTERLINEARS.greek` / `INTERLINEARS.hebrew`) plus
`interlinearState`, so `render()` calls one shared `renderInterlinear(config, …)`.
When both boxes are ticked the current book's testament decides
(`activeInterlinear()`): Hebrew for the OT, Greek for the NT. Hebrew cells use
`.iw-hebrew` (Ezra SIL), the word list is `dir="rtl"`, and a new
`transliterateHebrew()` maps the pointed surface form to Latin (dagesh changes
bet/kaf/pe, shin/sin dot changes shin, vav+dagesh is shureq `u`, vav+holam is
`o`, and a vowel-less yod is treated as a mater lectionis). The data
(~11.6 MB + 314 KB) is lazily loaded via `<script>` tags on first use, so it
works from `file://` and is runtime-cached by the service worker; an OT-only
notice shows on NT books and vice versa. `CACHE_VERSION` bumped `v12` → `v13`.

**Verified** headless with Chrome (`--dump-dom`): Genesis 1 renders 31 verse
blocks, first card `בְּרֵאשִׁ֖ית` → `bereʾshit` → gloss → `H7225` with `HR/Ncfsa`
in the tooltip, RTL confirmed; the Hebrew-only notice appears on Matthew 1;
Greek still renders (Matthew 1 first card `Βίβλος`/`G976`); with both boxes
ticked, Genesis renders Hebrew and John renders Greek; 0 JS errors.

## 2026-09-11 — Interlinear Read/Study modes (Hebrew, then Greek)

The interlinear word cards were reworked so each language offers two display
modes, chosen from a small dropdown that appears under that language's checkbox:
**Reading — Interlinear** (the new default) and **Study — Interlinear** (the
original dense card). BibleHub-style balance: reading first, lexical detail on
demand.

**Read mode** renders each word as an accessible `<button>` disclosure — word,
transliteration, and a one-line short gloss, with a caret. Tapping/clicking it
reveals a detail panel below the word row holding the definition, the KJV
renderings, the Strong's number and the morphology. Multiple cards can be open
at once (no accordion). The interaction is a real button with `aria-expanded`
and `aria-controls`, so it is keyboard-, touch- and screen-reader-friendly, and
the detail panels stack in word order so the RTL reading line never reflows.
**Study mode** keeps the original four-part dense card (surface, transliteration,
gloss, Strong's number) exactly as before.

The mode is per-language, persisted in `localStorage`
(`maranatha-interlinear-<key>-mode`) and defaults to reading. Hebrew shipped
first (`feature/interlinear-hebrew-ui`, commit `919ade0`); Greek followed
(`feature/interlinear-greek-ui`, commit `9adce80`), at which point the mode
plumbing was generalised into `restoreInterlinearMode()`,
`syncInterlinearModeVisibility()` and `setInterlinearMode()`, driven by
`config.toggleRef` / `config.modeRef`, so a future interlinear opts in with
`disclosure: true` plus those two refs. `CACHE_VERSION` bumped `v13` → `v15`
across the two changes. Both branches were merged to `main` and deleted.

Initial Read-mode glosses were derived from the first KJV `kjv_def` sense, which
surfaced misleading glosses (`choose` for *bara'*, `common` for *erets*); that
drove the definition fix recorded next.

## 2026-09-11 — Interlinear glosses use the Strong's definition, not KJV renderings

Read mode exposed a data-quality problem: *mayim* (H4325) rendered as `piss`.
The gloss was the Strong's **`kjv_def`** field — not a definition but the
alphabetical list of every way the KJV translators rendered the word ("piss"
appears in 2 Kings 18:27 / Isaiah 36:12) — and the short-gloss heuristic took
its first item.

The importers now emit two maps per Strong's number in `data/strongs-hebrew.*`
and `data/strongs-greek.*`: **`definitions`** (the neutral `strongs_def`, used
for the Read gloss and the detail panel) and **`renderings`** (the `kjv_def`
list, kept for Study mode and the detail panel). A handful of Greek entries
split the definition across `derivation`/`strongs_def`; the importer rejoins
them, so G2316 *theos* reads "a deity, …" rather than the continuation
"figuratively, a magistrate…". The app's `shortGloss()` now works from the
definition, skipping bare grammatical qualifiers ("properly", "figuratively",
"by euphemism", …) and stripping parentheticals and surrounding quotes; the
detail panel gained **Definition** and **KJV** rows.

While regenerating, a latent bug surfaced: `build/import-byz-interlinear.mjs`
split the CSVs on `\n` only, so on a CRLF checkout the line regex failed and it
produced an **empty** Greek interlinear. The split is now `/\r?\n/`. With that
fix the regenerated `byz-interlinear` and `he-interlinear` outputs are
byte-identical to the committed ones — only the two Strong's files changed.

Built on `fix/interlinear-gloss-definition` (commit `85a5811`), merged to `main`
and deleted. `CACHE_VERSION` bumped `v15` → `v16` and `DATA_CACHE_VERSION`
`v1` → `v2` (gloss data changed). Verified headless via jsdom: H4325 short gloss
"water" with the full definition and the KJV list in the panel; *bara'* → "to
create", G1722 → "in", G2316 → "a deity"; Study mode still shows the KJV list,
and the Greek/Hebrew mode dropdowns and persistence work. One limitation
remains: a few definitions resolve to a verbose first sense (H430 → "gods in the
ordinary sense"); improving that needs a curated gloss mapping we do not have.

## 2026-09-12 — Interlinear view ignored reference-mode verse scoping

Searching a specific verse or range (e.g. "John 3:16" or "John 3:16-18") and
then turning on either interlinear checkbox rendered the *entire chapter*
instead of the requested verse(s). `renderInterlinear()` had never been wired
into `viewState`: it always read the book/chapter straight off the
`#book`/`#chapter` dropdowns and looped over every verse in that chapter,
regardless of whether the user had gotten there by searching or by browsing.
The normal reading view (`renderReferenceGroups()`) already handled this
correctly via `viewState.groups` and the `versesForGroup()` helper — the
interlinear renderer just never used them.

Fixed by splitting `renderInterlinear()` into a dispatcher and a new
`renderInterlinearGroup(config, data, definitions, renderings, disclosure,
translation, group)` that renders one book/chapter block, optionally
restricted to a `Set` of verse numbers built from `versesForGroup()`. In
reference mode the dispatcher loops `viewState.groups` (so a multi-book query
like "Mark 14:2,6-9;Matthew 26:26-31" gets an interlinear block per group,
same as the normal reading view); in browse mode it synthesizes a single
`{ bookId, chapter, ranges: null }` group from the current dropdowns, which
`versesForGroup()` already treats as "whole chapter" — so browsing behavior
is unchanged.

Built on `fix/interlinear-reference-verses`, merged to `main`. `CACHE_VERSION`
bumped `v16` → `v17` (app.js is a shell file); `DATA_CACHE_VERSION` unchanged,
no translation data was touched. Verified two ways: a jsdom smoke test
against a stubbed control run confirmed the old code returned all 36 verses
of John 3 for both a single-verse and a range search, and the fixed code
returned exactly 1 and exactly 3 respectively, with browse mode still
showing all 36; a second, independent jsdom harness driving the real UI
controls against the real committed data files (not stubs) reproduced the
same three pass results.
