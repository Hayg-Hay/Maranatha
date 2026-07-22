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
without a rewrite.

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

## Phase 2 — Translation data

The first translation pipeline prototype was built around the Douay–Rheims
Bible.

A new importer script, `build/import-douay-rheims.mjs`, and a new translation
folder, `data/translations/douay-rheims/`, were added. The initial goal was
not to import the whole Bible immediately, but to prove that Maranatha could
consume an external translation source and normalize it into its own static
format.

Genesis was downloaded directly from the Douay–Rheims JSON API and stored as
`genesis-raw.json`. Inspecting the real source before writing the importer
proved important: the file contained much more than verse text, including
introductions, annotations, cross-references, note markers, and HTML tags.

For version 1, Maranatha deliberately discards that additional material.
The importer keeps only the verse text itself, stripping note markers and
formatting while preserving chapter and verse order.

The first generated translation file, `genesis.json`, uses the following
shape:

```json
{
  "translation": "douay-rheims",
  "book": "GEN",
  "chapters": [
    [
      "Verse 1",
      "Verse 2"
    ]
  ]
}
```

This decision follows the original YaQuB philosophy:

- entirely static;
- one file per book;
- no database;
- GitHub Pages compatible;
- easy to inspect and maintain;
- optimized for offline reading and translation comparison.

### First rendered translation milestone

After validating the importer with Genesis, the browser itself was upgraded to
load translation data dynamically.

`app.js` fetches:

```text
/data/translations/douay-rheims/genesis.json
```

and renders the selected Genesis chapter directly in the interface.

This marks the first moment in the project's history where Maranatha displays
real biblical text instead of placeholder rows.

The implementation intentionally remains minimal and close to YaQuB:

- translation files remain static JSON files;
- one file exists per book;
- the browser loads data on demand with `fetch()`;
- only Genesis is currently wired to the reader.

### Reference lookup prototype

YaQuB's most characteristic feature was direct navigation by reference rather
than by menus alone. Maranatha therefore gained a dedicated lookup bar inspired
by the original Qur'an browser.

The interface now contains a large reference field with examples such as:

```text
Genesis 1:1
Genesis 1:1-5
Mark 3:14-19
```

The current implementation already understands book names and chapter numbers
and synchronizes the existing dropdown menus automatically.

Verse-range parsing and multiple references remain future work, but the user
interface and architectural foundation now exist. Importantly, this feature was
implemented entirely in the front end and required no change to the translation
pipeline or JSON format.

## Phase 3+ (not started)

Following the same shape as YaQuB's own roadmap: translation checkboxes and
missing-book handling, layout modes (multi-column/multi-row/auto, ported from
YaQuB), mobile pass, full verse-range parsing, text search, and richer
navigation.

## Role of AI

This project, like YaQuB before it, is AI-assisted. Claude built the canon
data pipeline, wrote and tested the validator, and scaffolded the project
structure. Where source data couldn't be verified, that is recorded as a gap
in the data itself rather than filled in from training-data recall.

Human contributions: defining the canon and translation scope, the
architectural continuity with YaQuB, deciding what's in v1 vs. deferred, and
everything from here on (git init, GitHub repo creation, review).