# Maranatha

An offline Bible browser, architecturally modeled on [YaQuB (Yet Another Qur'an
Browser)](https://github.com/Hayg-Hay/yaqub-local) — a previous offline-preservation
project this one deliberately reuses the shape of: `data/` for static generated
data loaded via `<script>` tags (not `fetch`, so it works from `file://` with no
server), `build/` for the reproducible pipeline that produces that data, and a
thin `app.js` + `index.html` + `style.css` front end with no framework.

## Status

**Three real translations are live: World English Bible (WEB-C), King James
Version (KJV), and Byzantine Majority Text (Greek NT), all 27 NT books.** Open
`index.html`, both checkboxes are on by default, pick a book/chapter, and
you'll see both side by side. The 7 Catholic deuterocanonical books (Tobit,
Judith, Wisdom, Sirach, Baruch, 1–2 Maccabees) don't have a translation yet
in either — they show a clear "not available" placeholder per book, which is
expected, not a bug.

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
  in canon.js — the Byzantine text ends at v. 24) documented in
  `PROJECT_HISTORY.md`.
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

RSV-CE is explicitly excluded: copyrighted by the National Council of
Churches, not freely redistributable.

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
