# Bungo-yaku (Classical Japanese Bible)

Maranatha's `BUNGO` translation is the **Bungo-yaku / Taisho-kaiyaku**, the
Classical Japanese Protestant Bible: the **Meiji Old Testament (1887)** and the
**Taisho New Testament (1917)**. It is imported from the CrossWire Bible
Society **`JapBungo` 2.0** SWORD module (2022-08-17). Its licence and provenance
are documented in `data/LICENSE-bungo.md`; the source defects it retains are in
`BUNGO_SOURCE_DEFECTS.md`.

## Files

| File | Role |
| --- | --- |
| `build/import-bungo.mjs` | Deterministic offline importer (zText -> data). `--check` verifies, `--report` prints a bounded inventory. |
| `data/bungo.json` / `data/bungo.js` | Generated translation (`MARANATHA_TRANSLATIONS.bungo`). |
| `build/sources/bungo/book-names.json` | Curated Japanese names/aliases. |
| `build/build-bungo-locale.mjs` | Isolated builder for `data/locales/ja.{json,js}`. |
| `data/locales/ja.{json,js}` | Japanese book-name locale + parser aliases; interface messages retain the existing language. |
| `build/test-bungo.mjs` | Regression suite. |
| `build/cache/bungo/index-layout.json` | Deterministic cache of the SWORD header layout (regenerated locally; git-ignored). |

## Counts (verified from the pinned binary source)

- 66 books, 1189 chapters, **31102 indexed verse slots**, **31099** carrying
  text.
- 332 709 inline `<w gloss>` ruby readings excluded from Scripture.
- 139 Psalm-superscription headings preserved separately.
- 3 declared source gaps (empty indexed slots): Exodus 7:25, 2 Samuel 19:25,
  2 Chronicles 2:13.
- Daniel has **12** source chapters; the deuterocanonical books are absent.

`build/import-bungo.mjs --report` prints this inventory without writing.

## Data model

```jsonc
{
  "id": "bungo",
  "language": "ja",
  "nativeVersification": true,   // own reading block; no row alignment
  "nativeReferenceScope": true,  // sole-edition source extent is authoritative
  "books": { "GEN": [["…"], …], … },   // indexed by source verse number
  "psalmHeadings": { "PSA": { "3": [{ "type": "psalm", "text": "…" }] } },
  "structuralHeadings": [{ "scope": "testament", "text": "旧約聖書" }, …],
  "verseMetadata": { "EXO": { "7": { "25": { "status": "source-gap", … } } } },
  "sourceDefects": [ … ],
  "sourceInventory": { "glosses": 332709, "psalmHeadings": 139, … }
}
```

Empty source slots are `""` (never `null`, never text from another verse). The
slot is retained so later verses keep their source index.

## Native scope and comparisons

- **`nativeVersification`** places Bungo in its own block in the Canon,
  reference and mobile views, with a visible native-numbering notice. Search
  comparison panels suppress same-numbered cross-edition rows in **both**
  directions: searching WEB never shows a Bungo row, and searching Bungo never
  shows canon-numbered rows.
- **`nativeReferenceScope`** applies only when Bungo is the **sole selected
  edition**. Then pickers and reference validation use the source extent:
  Daniel shows 12 chapters and `Daniel 13` is rejected. With a mixed selection
  the canon/maximum extent is kept, and the Clementine Vulgate's extra chapters
  behave exactly as before.
- The original-language interlinear never treats Bungo as a presumed matching
  caption: when Bungo heads the selection the interlinear is disabled with an
  explanation and the independent Japanese reading is kept.

## Japanese references

The reference parser normalizes **input only** (never Scripture): full-width
digits/separators, `章`/`節`, and a trailing separator. Longest-alias matching
means `ヨハネ` (Gospel John) cannot swallow `1ヨハネ` (1 John), and the
Corinthian letters stay distinct. These forms all work:

```
ヨハネ3:16      ヨハネ ３：１６      ヨハネ3章16節
1ヨハネ3:1     ダニエル12:1         詩篇3:1
```

English/Armenian and Roman-numeral/range grammar is unchanged, and Japanese
aliases are merged independently of the display locale, so they work in an
English UI too. Japanese book names come from the curated
`build/sources/bungo/book-names.json`; the seven deuterocanonical names keep
their English fallback because the edition does not contain those books.

## Japanese search

Search is a substring scan (no tokenizer) with a Japanese-specific, **NFC**,
grapheme-aware form. This keeps voicing significant (か does not match inside
が; ば/ぱ do not match は), matches precomposed/decomposed input for the same
character, preserves exact punctuation, and maps highlights back to the
untouched original text so supplementary characters and variation selectors are
never cut. Hebrew, Greek and Latin normalization is unchanged. The stored
Scripture is never normalized.

## Regenerating

```bash
node build/build-bungo-locale.mjs          # data/locales/ja.{json,js}
node build/import-bungo.mjs                # data/bungo.{json,js} + layout cache
node build/build-bungo-locale.mjs --check
node build/import-bungo.mjs --check
node build/test-bungo.mjs
```

The importer writes/downloads nothing under `--check`.
