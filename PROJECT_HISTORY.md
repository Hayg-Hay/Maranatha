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
notice later — the canon was instead built from **real, sourced verse text**
from a different, reachable source (`scrollmapper/bible_databases` for the
standard 66 books, `scrollmapper/bible_databases_deuterocanonical` for five of
the seven deuterocanonical books), with every chapter's verse count computed
by actually counting the highest verse number present in that chapter's real
text — not typed in.

Two structural gaps remain, and are marked `provisional: true` directly in
the generated data rather than silently guessed at:

1. **Baruch** — only 5 of its 6 Catholic chapters are backed by real data.
   Chapter 6 (the Letter of Jeremiah) wasn't found as reachable source text.
2. **Esther** and **Daniel** — recorded with standard (non-Greek-expanded)
   structure, since WEB-C's actual Greek-Septuagint-based text for these two
   books (with the deuterocanonical additions integrated) wasn't available to
   measure from.

Both gaps are the explicit first task for Phase 2.

`build/validate.mjs` was written and tested against a deliberately broken
fake translation file to confirm it actually catches unknown book IDs, wrong
chapter counts, and wrong verse counts before any real translation data
exists to validate — so the tool is proven correct before it's needed.

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

The Genesis importer is intentionally a prototype. The next step is to
generalize the script so that all 73 books of the Catholic canon can be
imported automatically.

## Phase 3+ (not started)

Following the same shape as YaQuB's own roadmap: static skeleton app
(book/chapter nav — already stubbed in Phase 1's `index.html`/`app.js`),
translation checkboxes and missing-book handling, layout modes
(multi-column/multi-row/auto, ported from YaQuB), mobile pass, GitHub Pages
deployment.

## Role of AI

This project, like YaQuB before it, is AI-assisted. Claude built the canon
data pipeline, wrote and tested the validator, and scaffolded the project
structure. Where source data couldn't be verified, that's recorded as a gap
in the data itself rather than filled in from training-data recall — the
`provisional: true` flags in `canon.js` exist specifically so that isn't lost
between sessions or contributors.

Human contributions: defining the canon and translation scope, the
architectural continuity with YaQuB, deciding what's in v1 vs. deferred, and
everything from here on (git init, GitHub repo creation, review).