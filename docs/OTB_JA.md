# Open Translation Bible (Japanese) — implementation notes

`otb-ja` / `OTB-JA` is the publisher's **Open Translation Bible (OTB) Japanese
edition** (`lang/ja-JP`), launched **December 2025** and licensed **CC BY-SA
4.0**. It is a left-to-right Japanese (`lang="ja"`) translation registered in
`app.js` and lazy-loaded from `data/otb-ja.js`. This is **not** the Kogoyaku or
the Bungo-yaku, and no other Scripture is modified.

## Pinned retrieval (offline)

- Publisher: **Open Translation Bible** — <https://openbible.uk>
- Repository: <https://github.com/OpenTranslationBible/open-bible>
- Pinned commit: `31d411ac1c2d277242a3bd85697f354eaa11526b`
- Imported by: `build/import-otb-ja.mjs`
- Raw source cached in-repo: `build/sources/otb-ja/` (1192 JSON files + licence +
  readme + manifest)
- Pinned hashes (in the importer, so the manifest cannot be edited to hide
  altered Scripture):
  - `source-files.json` = `929e33448a67ccbffb7b5e77e7de90894a32839f28337d42340433f45a2f3a35`
  - `LICENCE.md` = `b6a88d6599299316d5860bf982f53fb4840abe1094708857e816de73694f77dc`
  - `UPSTREAM_README.md` = `b0877203135f431be852ef5b4797790dba59e7c9f22c506d0de0c740033a74bc`

Every manifest entry is re-verified against **both** its recorded SHA-256 and
its git blob object id, and the set of JSON files on disk must equal the
manifest (no added or removed chapters). No network access is used at import or
at runtime.

## Source format and conversion

Each chapter file is `{ book, chapter, verses }`; numbered records are
`{ verse: positive int, text: string[] }` and unnumbered records omit `verse`.
Canonical book identity comes from the explicit `01..66` directory index mapped
onto the stable ids, never from the free-text book labels (which vary between
chapter files in 20 directories). Psalm filenames use three digits
(`詩篇-001.json`); all others two.

Validated totals: **66 books, 1189 chapters, 31103 numbered records, 3777
unnumbered records** (3636 literal `---` separators, 138 Psalm textual records,
3 New-Testament variant notes at Mark 16, John 7 and John 8). Numbering is
contiguous with no gaps or duplicates; every text segment is non-empty UTF-8.

`books[]` joins each verse's segments with `"\n"` (rendered with
`white-space: pre-wrap`, scoped to OTB-JA, so publisher spacing, line breaks and Psalm `> ` prefixes are
preserved exactly). `verseSegments` retains the original per-verse text arrays
verbatim. `sourceRecords` retains every unnumbered record with its source index
and `beforeVerse` / `afterVerse`. No word is added, removed or corrected.

## Placeholders

The source supplies no Scripture for two numbered records:

- **Matthew 23:14** — `[14]`
- **John 5:4** — `[4]`

The exact strings are kept in `books[]` and tagged
`{ status: "source-placeholder" }` with an authored notice: *"The source record
at this reference contains only a bracketed marker, not Scripture text. It is
shown exactly as supplied; no text was supplied or inferred."* The notice is
rendered at the verse slot and is **not** labelled a source footnote; the
placeholder is never silently dropped or filled from another translation.

## Source notes, Psalm records and separators

- The **138 Psalm textual records** populate `psalmHeadings` and render through
  the existing source-heading support (separately from verse text).
- The **3 New-Testament variant notes** populate `sourceNotes` and render as
  source notes outside the Scripture reading block (never inside a verse or
  reading table). Note that the source itself embeds a bracketed copy of the
  Mark 16 note inside verse 9; that publisher text is preserved verbatim.
- The **3636 `---` separators** are preserved in `sourceRecords` with their
  positions. They are metadata only and are never numbered or inserted into
  Scripture.

## Native numbering, references and comparison

OTB-JA declares `nativeVersification: true` and `nativeReferenceScope: true`:

- It is read in its own reading block, never row-aligned with a canon-numbered
  edition; same-numbered cross-edition comparison is suppressed in both search
  directions.
- As the **sole** selected edition its extent is authoritative: **Daniel has 12
  chapters** (Daniel 13 invalid) and **3 John 1 has 15 verses** (verse 16
  invalid).
- The original-language interlinear is disabled with an explanation rather than
  captioned by OTB-JA.
- Japanese references reuse the existing parser and grapheme-aware NFC search
  (`ヨハネ5:4`, `ヨハネ ５：４`, `ヨハネ5章4節`). The 16 publisher book-name
  spellings not already present (e.g. `マタイの福音書`, `ヨハネの手紙第一`)
  were added as aliases in `build/sources/bungo/book-names.json` and
  `data/locales/ja.{json,js}` regenerated with `build/build-bungo-locale.mjs`.

## Undocumented provenance — no accuracy certification

The publisher does **not** document the translation method, the source-language
witnesses, or any human/editorial-review status. This project therefore asserts
no translator, source-language, method, AI/human or review claim, and the
edition is **not accuracy-certified**. This is the publisher's recent OTB
Japanese edition; it is not the Kogoyaku or Bungo-yaku, and no existing
Scripture has been changed. Licence and attribution details are in
`data/LICENSE-otb-ja.md` and the verbatim publisher licence is preserved at
`build/sources/otb-ja/LICENCE.md`.

## Validation

- `build/check-otb-ja-independent.mjs` re-reads the raw source without importing
  the importer, re-verifies every SHA-256 and git blob, and compares every
  numbered verse, preserved segment and unnumbered record against
  `data/otb-ja.json`, plus `--check` idempotence.
- `build/test-otb-ja.mjs` covers the importer contract, JSON/JS twin, real JSDOM
  desktop/mobile `file://` loading with network blocked, lazy load, references,
  placeholder notices, separated source notes, native bounds, comparison and
  interlinear guards, and kana-safe search.
- `npm test` runs `build/check-otb-ja-independent.mjs`,
  `build/import-otb-ja.mjs --check` and `build/test-otb-ja.mjs`.
