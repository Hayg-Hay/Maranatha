# Maranatha

An offline Bible browser, architecturally modeled on [YaQuB (Yet Another Qur'an
Browser)](https://github.com/Hayg-Hay/yaqub-local) — a previous offline-preservation
project this one deliberately reuses the shape of: `data/` for static generated
data loaded via `<script>` tags (not `fetch`, so it works from `file://` with no
server), `build/` for the reproducible pipeline that produces that data, and a
thin `app.js` + `index.html` + `style.css` front end with no framework.

## Status

**One real translation is live: the World English Bible (WEB), public domain,
66 standard books.** Open `index.html`, the WEB checkbox is on by default,
pick a book/chapter, and you'll see real verse text. The 7 Catholic
deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1–2 Maccabees)
don't have a translation yet — they show a clear "not available" placeholder
per book, which is expected, not a bug.

What works:

- `data/canon.js` — the full 73-book Catholic canon skeleton: stable book IDs,
  traditional Catholic order, and a real chapter/verse count for every chapter
  in every book.
- `data/locales/en.json` (+ `en.js`) — English display names, kept separate
  from `canon.js` so a future locale (e.g. Armenian) can be added without
  touching the canon file.
- `data/web.json` (+ `web.js`) — real World English Bible text for the 66
  standard books, built by `build/import-web.mjs` from a verified structured
  source and validated with 0 errors against `canon.js`.
- `index.html` — book/chapter navigation, a translation checkbox, and real
  verse rendering. Translation data loads via a dynamically created
  `<script>` tag when its checkbox is selected — never `fetch()` — so this
  still works from a bare `file://` double-click with no server.
- `build/validate.mjs` — checks a translation file's book IDs, chapter
  counts, and verse counts against `canon.js` before it's trusted.

**Douay-Rheims was tried and rejected for now.** The only source found
(`xxruyle/Bible-DouayRheims`) turned out to have real chapter-boundary
corruption in 42 of its 73 books — confirmed directly in the raw source, not
assumed. Rather than ship damaged Scripture text, the output was deleted; the
importer script and its book-name mapping are kept (real, reusable work) with
a clear warning not to re-run it against that source. See
`PROJECT_HISTORY.md`, Phase 2, for the full writeup, and `build/fetch-source.mjs`
for what was tried and ruled out before that. **KJV** is next up; **NKJV was
considered and rejected** — it's copyrighted (Thomas Nelson), unlike
WEB/KJV/DRB, all public domain.

## Two known data gaps

`data/canon.js` marks two books `provisional: true`:

1. **Baruch** — recorded with 5 chapters. Catholic Baruch has 6; chapter 6 is
   the Letter of Jeremiah, for which no source of real verse text was
   reachable when this was built.
2. **Esther** and **Daniel** — recorded with their standard (non-expanded)
   structure. The WEB Catholic Edition retranslates both from the Greek
   Septuagint with the deuterocanonical additions integrated, which changes
   their real chapter/verse layout. That hasn't been measured yet.

Both are flagged in the data itself (`provisional: true` per book) and in
`build/build-canon.mjs`'s header comment, and `validate.mjs` treats mismatches
against these two as warnings rather than errors for exactly this reason.

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

## Translations (planned, v1)

- World English Bible, Catholic Edition (public domain) — base translation
- Douay-Rheims (public domain)
- King James Version (public domain in the US)

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
