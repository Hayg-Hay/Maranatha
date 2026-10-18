# Calmer reading controls - consolidation step 1

This increment changes the initial control layout, not edition data, reading
semantics or the offline architecture. Edition-information standardization and
broader documentation/architecture consolidation remain later steps.

## First screen

- Reference, text search, book/chapter, previous/next and reading-view controls
  remain visible. The default WEB Genesis reading is unchanged. A remembered
  reading still offers explicit Continue reading rather than auto-opening.
- Translations starts closed. Its summary shows one selected edition's short
  name, a multiple-selection count, or None selected. The accessible name/title
  identifies the selected editions. Existing under-audit flags remain visible
  in the summary even when closed; original source/audit disclosures remain.
- Study tools and Reading settings start closed, beside Translations on wide
  screens and stacked on narrow screens. Open sections use the full available
  width. The LXX alignment pilot and unchanged human-review warning are now
  inside Study tools. No additional study mode is enabled by default.
- Bookmark this passage and Enter reader focus share a row. Back to search
  results appears there when available. Saved passages and Recent passages
  start closed below, side by side when space allows and stacked on small
  screens. Opening a saved list/editor uses full width.
- Focus mode retains its sticky exit control and hides the relocated bookmark
  button, saved/recent lists and main controls. Copy/print stay at each passage.

Panels do not close automatically when a reading renders. Opening disclosures
does not overwrite stored readings or history. The disclosure defaults apply
again on a fresh load; no disclosure-state storage was added. Summaries reuse
the existing selected-edition registry and audit flags without inventing new
verification statuses. Native LXX and independent parallel navigation are
unchanged; the Translations summary refers to the canon checkbox selection.

## Compatibility and checks

Existing control IDs and handlers are retained. Only the layout and one
read-only summary updater change. Local datasets still load via classic scripts
under file://; shell v76 retains data cache v3. No Scripture, licensing record,
reference mapping, gloss or source metadata is modified.

`npm run test:calmer-reading` drives desktop/mobile DOM journeys through initial
reading, closed/open disclosure access and privacy, multi-edition and grouped
selection, audit flags, native Bohairica 3 John 15, bookmarking, copying,
printing, focus and refresh/resume. Existing reading-polish, saved/recent,
reader-focus, copy/print and search-polish tests cover the other journeys;
grouped Delitzsch and Berean interlinear runtime checks cover deeper study
compatibility. The alignment row checks exercise the relocated pilot and cache
checks cover the shell update. These are functional DOM checks, not proof of
physical viewport layout or assistive-technology behavior.

Manual review still needed: desktop and phone spacing, very large text and
zoom, native keyboard activation/focus order, visible disclosure cues, sticky
focus controls and screen-reader announcements. The entire corpus/import test
suite was not rerun for this presentation-only increment.
