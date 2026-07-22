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

### Phase 2, take two (not started)

Still ahead: fetch and normalize World English Bible Catholic Edition,
Douay-Rheims, and KJV into `data/<id>.json` (one file per translation, all
books inside), closing the two Phase 1 gaps (Baruch ch. 6, expanded
Esther/Daniel) as part of the same work. If per-book lazy loading is wanted
later for file-size reasons, it should be proposed as its own decision — with
the `fetch()` vs. dynamic `<script>`-injection trade-off explicitly resolved
first — not folded in silently.

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