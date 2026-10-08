# Bungo implementation validation — 2026-10-08

Branch: `codex/japanese-bungo`, based on merged Latin `main`. No merge or push.
OpenCode with **DeepSeek V4.1 Flash** implemented the importer and UI. Codex
independently audited the source and visible behavior, corrected a supplementary
character highlight bug, retained English input under Japanese book labels,
and gated test helpers to test sessions only.

## Verified source and preservation

The exact CrossWire **JapBungo 2.0 (2022-08-17)** package is preserved and
labelled Public Domain by its distributor. Historical translations: Meiji OT
1887 / Taisho NT 1917; identified printed witnesses: OT 1953 / NT 1950. This
does not substitute a modern JBS product or assert new JBS permission. Full
licensing/provenance and the separate GPLv2 structural-source-header notice are
in `data/LICENSE-bungo.md`.

Archive SHA-256:
`1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6`.
The SWORD layout header is pinned separately:
`782e7a603cdfb45ddfd6eed9d31a639929fb928b47c7042d83c8ee9b76af078a`.

Independent checking parses the official factual layout and original binary
indexes without calling the importer. All extracted ZIP files match the
archive byte for byte; every generated verse string matches original base
text after removing inspected markup/heading wrappers, with Unicode,
punctuation, historical kana/kanji and whitespace unchanged.

Counts: **66 books, 1,189 chapters, 31,102 indexed verse slots, 31,099 nonempty
texts**. All **139 Psalm titles plus two book-group titles** are preserved
separately. **332,709** word/gloss readings stay in the pinned source cache and
are excluded from base Scripture text. There are no entirely empty chapters.

Three empty indexed slots remain empty and visibly disclosed: EXO 7:25,
2SA 19:25, 2CH 2:13. No adjacent text was split, duplicated or guessed.
Published module indexing is retained; equivalence to printed native labels
or to other translations has not been adjudicated. Existing canon, Scripture
datasets and English/Armenian locale files have no implementation changes.

## Checks and results

- `node build/import-bungo.mjs --check`: pass; no output writes/downloads.
- `node build/build-bungo-locale.mjs --check`: pass; 73 labels / 142 aliases,
  with explicit English fallback for the seven absent deuterocanonical books.
- `node build/test-bungo.mjs`: **14/14** checks pass, including source integrity,
  importer rejection cases, native scope, Japanese input, search, comparison,
  original-language caption guards and real file:// loads.
- `node build/check-bungo-independent.mjs`: all source text/slots and headings
  match; source ZIP, extracted bytes and factual header hash verified.
- `node build/check-bungo-ui-independent.mjs`: desktop and mobile pass, including
  first pane-only loading, Daniel 12/13 bounds, Japanese no-space/full-width/
  章・節 input, English input with Japanese labels, authored gap disclosures,
  WEB-to-Bungo comparison protection and actual search UI grapheme probes.
- Japanese probes confirm voiced/unvoiced distinction, canonical equivalence,
  original decomposed-text highlights and supplementary-character offsets.
  No test interface is exposed in normal app loads.
- `npm test`: **exit 0**, with the existing translation/LXX suite and all new
  source/UI checks. Existing Windows fixture tests ran with necessary temporary
  file permissions; no fixture assertions were weakened.
- `npm run check:stage1`: **15/15** source/native-LXX regression checks pass.
- `git diff --check` for changed app/style/index/documentation: pass.

The shell advances v55 → v56 for new local Japanese label resources and UI;
the v3 data cache is retained. Existing shell-version assertions follow that
change. Native Bungo browsing/search stays separate from unreviewed comparisons.

Clean committed-tree verification requires the existing historical
gitignored LXX fixtures (`build/cache/stage1-before.json`,
`build/cache/stage1b-before.json`) copied unchanged, not regenerated. Both
have SHA-256
`7e44ef9fc13158eb018a96d0a38c452205198f6f99ffea88f5fc7bc21d4fcec5`.
An independent `git archive HEAD` export, with these existing fixtures copied
unchanged, passed the full `npm test` with exit 0. All Bungo source-byte,
Japanese name-generator, targeted and independent desktop/mobile checks also
passed in that committed export. Its LXX baseline is committed Stage2b,
separate from the working tree's paused Stage2c changes.

## Scope and review limits

New files: the Bungo pinned source cache, importer, independent source and UI
checkers, regression suite, isolated Japanese name builder, JSON/JS translation,
Japanese name JSON/JS resources, licence/provenance, source-defects ledger and
this validation report. Shared changes: `app.js`, `style.css`, `index.html`,
`service-worker.js`, `package.json`, `.gitattributes`, `README.md`,
`PROJECT_HISTORY.md`, plus exact cache-version assertions in existing tests.
Pre-existing LXX Stage2c edits are excluded from the Bungo commits.

The Japanese locale localizes book names/testament labels and adds aliases;
complete interface-message translation and optional ruby display are outside
this implementation. UI tests use JSDOM desktop/mobile paths with network APIs
blocked, not a phone or visual CSS renderer. Actual browser/phone font and
layout review remains manual; the Browser runtime was inaccessible earlier in
this session. The upstream Salterrae host is currently unavailable, but the
official source archive is retained locally and imports completely offline.

Ready for manual review with these explicit source and visual-review limits.
