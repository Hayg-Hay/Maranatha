# Maranatha

An offline Bible browser, architecturally modeled on [YaQuB (Yet Another Qur'an
Browser)](https://github.com/Hayg-Hay/yaqub-local) — a previous offline-preservation
project this one deliberately reuses the shape of: `data/` for static generated
data loaded via `<script>` tags (not `fetch`, so it works from `file://` with no
server), `build/` for the reproducible pipeline that produces that data, and a
thin `app.js` + `index.html` + `style.css` front end with no framework.

## Status

This is an early, structure-only preview. **No translation text is loaded yet.**
What works right now:

- `data/canon.js` — the full 73-book Catholic canon skeleton: stable book IDs,
  traditional Catholic order, and a real chapter/verse count for every chapter
  in every book.
- `data/locales/en.json` (+ `en.js`) — English display names for those book
  IDs, kept deliberately separate from `canon.js` so a future locale (e.g.
  Armenian) can be added without touching the canon file at all.
- `index.html` — lets you browse book → chapter and see the correct verse
  numbers for that chapter, pulled from `canon.js`. Verse *text* is a visible
  placeholder until a translation file exists.
- `build/validate.mjs` — a real, working validator. Once a translation file
  exists at `data/<id>.json`, run `node build/validate.mjs data/<id>.json`
  against it before committing; it checks book IDs, chapter counts, and
  verse counts against `canon.js`.

What's still a stub, on purpose, rather than faked: `build/fetch-source.mjs`
and `build/normalize.mjs`. See the comments in those files for exactly what
was tried and didn't pan out, and what to try next — the actual World English
Bible Catholic Edition text (with the Deuterocanon in Catholic order) hasn't
been successfully fetched as structured data yet.

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
