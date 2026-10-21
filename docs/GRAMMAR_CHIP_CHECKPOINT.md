# Compact grammar chip checkpoint — 2026-10-20

**Approved for integration 2026-10-21.** The feature and the minimum-card-width
checks below have been reviewed by the user. The original pause and unfinished
work notes are historical. Publishing has not been requested.

**Resumed 2026-10-21.** The text below records the original pause. Chip code,
accessibility descriptions, tests and documentation have since been updated.
All 362 relevant automated checks pass (including 32 chip/annotation checks).
The local measurement page is `build/reports/grammar-chip-layout.html`.
Subsequent user screenshots verify 48/48 revision-2 minimum-card-width fit checks
across both editions/layouts and all four font sizes. They were taken at a
1879px viewport; full mobile-page layout and keyboard interaction are not
verified by those captures. No commit or push.

**Later update 2026-10-21:** User screenshots confirm height increases of
19.07–24.77px (dense) and 9.07–14.77px (expandable) at root sizes 16–23px.
They exposed stale-coordinate comparisons in the layout fixture's fit checker.
Revision 2 reads geometry after resizing the baseline, includes failure reasons,
and passes 4 checker-logic regression checks. The UI was not changed during this
correction. The subsequent revision-2 browser screenshots pass all 48 fit checks;
the measured height increases remain as stated above.

Paused at the user's request so they can close the laptop. No commit, merge or
push is authorized. All work remains in the working tree.

## Current objective

Keep the separate general-government annotation layer. Replace the long badge
with compact `+Dat`, `+Gen/Acc`, and `+Gen/Dat/Acc` chips. Accessible descriptions
must give full case names and say “General government”. Keep notes and unresolved
status inside the existing disclosures. Do not add token scanning, complement
identification, occurrence-specific claims or Off / All settings.

Verify placement in both dense and expandable layouts at the narrowest
preposition card width. Measure and report height differences rather than
assuming the change is height-neutral.

## Edits made in this increment (not yet validated)

- `app.js`: replaced `grammarSummary` with `grammarChip`; abbreviated case
  names; added full hidden descriptions referenced by `aria-describedby` on
  the controlling button/summary. Chips are hidden from accessible names to
  avoid reading abbreviations instead of full case names.
- Expandable reviewed cards now place the chip and existing caret together
  in an `iw-grammar-footer` row; their bottom padding is reduced accordingly.
- Dense cards use a chip plus caret in the existing native summary.
- Unresolved entries have no case chip. Dense summary says “Grammar”; the
  note heading says “Supplemental grammar · unresolved”. Expandable cards
  retain the existing caret and disclose the same unresolved note.
- `style.css`: added one-line chip styling, footer alignment and inline caret
  overrides. Natural-height card alignment from the prior fix remains.

## Required work on resume

1. Review minimum-width behavior carefully: cards currently have a 4.5rem
   minimum and 12rem maximum with border-box sizing. A three-case chip plus
   caret may need more than the minimum card's available content width.
   The current footer/summary uses `min-width: max-content`; this alone does
   not prove absence of overflow or establish actual dimensions.
2. Update `build/test-grammatical-annotations.mjs`: it still expects the old
   `.iw-grammar-summary` selector, long badge text and old accessible labels.
   Test chip text, full descriptions, unresolved status inside disclosures,
   both editions/modes, and preservation/offline behavior. Do not weaken the
   existing source-preservation or grammatical scope checks.
3. Update `docs/GRAMMATICAL_ANNOTATIONS.md` and any affected README wording
   for the compact chips and actual verification scope/results.
4. Run the updated annotation suite and relevant rendering regressions, syntax
   checks and `git diff --check`. Previous passing results do not verify this
   unfinished chip increment.
5. Obtain genuine layout evidence if possible. The browser security policy
   previously blocked `file://` navigation and explicitly prohibited workaround
   attempts. Do not bypass that restriction with another browser surface or
   indirect navigation. If verification cannot safely be completed, explicitly
   report actual measurements as unavailable; jsdom has no layout engine.

## Earlier verified baseline

Before this chip increment, the general-government feature and natural-height
CSS fix passed the 28-check annotation suite. The original feature also passed
Berean integrity/runtime/offline, reviewed Greek gloss validation/runtime,
Hebrew preview and service-worker suites (358 checks combined). Those are
historical results for the earlier UI, not new chip verification.

The reference module and source data have not been changed in this increment.
There are 56 inventory identities: 53 reviewed and 3 unresolved (G1726, G3796,
G5238). Both Greek interlinears use the layer; Hebrew does not opt into it.

Unrelated untracked files already existed: `docs/Prints/` and
`build/sources/arm-eastern-1800s/bibleinmodernarm00cons.pdf`. Preserve them.
