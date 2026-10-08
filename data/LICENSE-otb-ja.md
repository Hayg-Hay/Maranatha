# Open Translation Bible (Japanese) — licence, attribution and changes

The text in `data/otb-ja.json` / `data/otb-ja.js` is adapted from the **Open
Translation Bible (OTB) Japanese edition** (`lang/ja-JP`), published by **Open
Translation Bible** (<https://openbible.uk>) and distributed at
<https://github.com/OpenTranslationBible/open-bible>.

## Attribution

- Title: **Open Translation Bible (OTB), Japanese edition (ja-JP)**
- Publisher: **Open Translation Bible** — <https://openbible.uk>
- Source repository: <https://github.com/OpenTranslationBible/open-bible>
- Pinned commit: `31d411ac1c2d277242a3bd85697f354eaa11526b`
- Japanese edition launch: **December 2025**
- Licence: **Creative Commons Attribution-ShareAlike 4.0 International
  (CC BY-SA 4.0)** — <https://creativecommons.org/licenses/by-sa/4.0/>
- Licence URL as given by the publisher:
  <https://github.com/OpenTranslationBible/open-bible?tab=License-1-ov-file>

The publisher's verbatim licence text is preserved offline at
`build/sources/otb-ja/LICENCE.md` (SHA-256
`b6a88d6599299316d5860bf982f53fb4840abe1094708857e816de73694f77dc`) and the
upstream readme at `build/sources/otb-ja/UPSTREAM_README.md` (SHA-256
`b0877203135f431be852ef5b4797790dba59e7c9f22c506d0de0c740033a74bc`). The full
raw source is kept byte-for-byte under `build/sources/otb-ja/`.

Under CC BY-SA 4.0 you may share and adapt this material, including
commercially, provided you give appropriate credit, link the licence, indicate
changes, and license your adaptation under the same terms. No warranties are
given; the publisher's readme does not certify accuracy.

## Changes made by this project (adaptation notice)

The adaptation is mechanical and never alters the base Scripture wording:

- The publisher's chapter files (`lang/ja-JP/**`, schema
  `{ book, chapter, verses }`) are read offline and the numbered records
  (`{ verse, text: string[] }`) are placed at their source verse position;
  unnumbered records (`{ text: string[] }`) are preserved in
  `sourceRecords` with their source index and `beforeVerse`/`afterVerse`.
- `books[]` joins each verse's original text segments with `"\n"`. The original
  per-verse text arrays are retained verbatim in `verseSegments`. No words,
  punctuation or segments are added, removed or corrected, and no Unicode
  normalization is applied.
- The 138 Psalm textual records are also represented as `psalmHeadings`; the 3
  New-Testament variant notes as `sourceNotes`; the 3636 literal `---`
  separators are preserved in `sourceRecords`.
- The two numeric-only placeholder records (**Matthew 23:14 `[14]`** and
  **John 5:4 `[4]`**) are kept exactly and tagged `source-placeholder` with an
  authored notice that no Scripture text was supplied. Nothing was filled in
  from any other source.
- A runtime JavaScript twin (`data/otb-ja.js`) is generated for offline
  `<script>` loading; its content is identical to `data/otb-ja.json`.

## Provenance that is NOT documented by the publisher

The publisher documents the licence, the language and the launch date, but does
**not** document the translation method (human, machine-assisted or otherwise),
the source-language witnesses, or any editorial-review status. This project
therefore asserts **no** translator, source-language, method, AI/human or review
claim, and the edition is **not accuracy-certified**. This is the publisher's
recent OTB Japanese edition; it is **not** the Kogoyaku (口語訳, 1954/1955)
or the Bungo-yaku, and no existing Scripture has been modernised or
changed.

Reproduce the generated data with:

```bash
node build/import-otb-ja.mjs --check
node build/check-otb-ja-independent.mjs
node build/test-otb-ja.mjs
```
