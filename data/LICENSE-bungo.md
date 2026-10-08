# Bungo-yaku — licence, provenance and attribution

The text in `data/bungo.json` / `data/bungo.js` is imported from the
**CrossWire Bible Society** SWORD module **`JapBungo` 2.0**, which packages the
Classical Japanese Protestant Bible (Bungo-yaku / Taisho-kaiyaku).

## Source of record (pinned, cached in this repository)

- Module: `JapBungo`, version **2.0**, `SwordVersionDate=2022-08-17`.
- Publisher: **CrossWire Bible Society**, <https://www.crosswire.org/>.
- Module page: <https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=JapBungo>
- Official binary distribution:
  <https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JapBungo.zip>
- Cached archive: `build/sources/bungo/JapBungo-2.0.zip`
  SHA-256 `1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6`
- Extracted zText module:
  `build/sources/bungo/module/modules/texts/ztext/japbungo/{ot,nt}.{bzs,bzv,bzz}`
  and `build/sources/bungo/module/mods.d/japbungo.conf`.
  Every extracted file's SHA-256 is pinned in `build/import-bungo.mjs`.
- SWORD structural source header:
  `build/sources/bungo/sword-canon.h`, retrieved from
  <https://www.crosswire.org/svn/sword/trunk/include/canon.h>; SHA-256
  `782e7a603cdfb45ddfd6eed9d31a639929fb928b47c7042d83c8ee9b76af078a`.
  It is GPLv2 and is used **only as a factual book/chapter/verse table**, parsed
  at build time. No GPL code is compiled into or copied as a runtime library;
  `app.js` and the importer are independently authored.
- Retrieval date: **2026-10-08**. No network access is used by the importer.

## Edition and licence statements

The module configuration file states:

- `DistributionLicense=Public Domain`
- `Encoding=UTF-8`
- `SourceType=OSIS` (OSIS 2.1.1)
- `ModDrv=zText`, `CompressType=ZIP`, `BlockType=BOOK`
- `Versification=KJV`
- `Lang=ja`
- `About_en=The Classical Japanese Bible (Bungo-yaku/Taisho-kaiyaku …) was
  published first in 1917, but this text is the one printed in 1950.`
- `TextSource=http://bible.salterrae.net/` — **presently DNS-unavailable**. The
  unavailability is documented rather than worked around by substituting another
  edition.

The Old Testament follows the **Meiji** translation (1887) and the New Testament
the **Taisho** translation (1917). The module is compiled from printings the
module metadata describes as the **1953 Old Testament** and **1950 New
Testament** (the `Description` field names the 1953 Old Testament / 1950 New
Testament printings). This is a **historical, pre-modern product**: it is not
the current Japan Bible Society product, and no modernisation of words has been
applied.

This import relies on the official pinned CrossWire distribution licence. It
**does not** claim a new Japan Bible Society permission, and it does **not**
perform a worldwide copyright-expiry calculation. Public-domain status is
reported as the distributor's statement, not as a legal conclusion invented by
Maranatha.

## Changes made by the importer

The adaptation is mechanical and never alters the base Scripture text:

- The SWORD **zText** container is decoded exactly: `.bzs` (12-byte
  block index), `.bzv` (10-byte record index) and `.bzz` (zlib blocks). Every
  byte range, decompressed size and UTF-8 sequence is validated; invalid input
  aborts the import.
- The only removed material is the documented OSIS markup:
  - inline `<w gloss="…">…</w>` ruby readings — the markup and the reading are
    dropped, the base text between the tags is kept unchanged;
  - `<title …>…</title>` records — preserved separately as source headings
    (Psalm superscriptions) or structural book-group titles;
  - structural close/milestone markers (`<chapter …/>`, `<div …/>`) left inside
    verse records by `osis2mod`.
- No Unicode normalization is applied to Scripture. Source kana/kanji,
  historical orthography, punctuation and whitespace are preserved verbatim.
- Any tag outside the inspected whitelist, any nested markup inside a retained
  inline tag, or any invalid UTF-8 aborts the import rather than dropping
  biblical text.
- Verse arrays stay indexed by **source verse number**; a slot that carries no
  text is retained as an empty string and disclosed (see
  `docs/BUNGO_SOURCE_DEFECTS.md`).

Reproduce the generated data with:

```bash
node build/import-bungo.mjs --check
node build/test-bungo.mjs
```
