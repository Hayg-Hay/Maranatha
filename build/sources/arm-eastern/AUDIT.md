# ArmEastern — byte-level audit (pre-import)

**Status: HELD. Not imported.** No `data/arm-eastern.*` was produced and
`app.js` was not touched. This records what the raw module actually contains so
the import decision is made deliberately.

## Source

- Raw module zip: `ftp.crosswire.org/pub/sword/raw/packages/ArmEastern.zip`
  (CrossWire raw SWORD repository; confirmed by directory listing, not guessed).
- Cached at: `build/sources/arm-eastern/ArmEastern.zip`
  — 334,979 bytes, sha256
  `21d6d381734458e584416af6552d762f366a6cfadb2f7710d855b83a19f2f689`.
- conf: `build/sources/arm-eastern/armeastern.conf` (copied from
  `raw/mods.d/armeastern.conf`).
- Decoded with `pysword` 0.2.8 against the unzipped module — the same
  procedure recorded for ArmWestern. **Not** re-derived from stepbible.org HTML.

`mods.d/armeastern.conf`:

```
Description=Eastern Armenian Bible
About=Eastern Armenian Bible\par Includes Genesis, Exodus, and the Gospels
Encoding=UTF-8
BlockType=BOOK
CompressType=ZIP
SourceType=OSIS
DistributionLicense=Public Domain
TextSource=Slavic Bible via http://unbound.biola.edu
Version=1.1
SwordVersionDate=2008-07-14
```

License: the conf says **Public Domain**; Gentoo portage metadata and STEPBible
label the same module **freedist** (freely distributable). Both are recorded.

## Scope and encoding — clean

- `ot.bzs` = 2 blocks, `nt.bzs` = 4 blocks → **6 books total**, matching the
  conf's "Includes Genesis, Exodus, and the Gospels":
  **GEN, EXO, MAT, MRK, LUK, JHN**. Every other canon book is empty.
- All 6 decompressed blocks strict-decode as **valid UTF-8** (the declared
  encoding): no BOM, no U+FFFD, no NUL bytes, no control characters. Character
  inventory is Armenian letters + spaces + Armenian/Latin punctuation only — no
  Latin letters, digits, or mojibake. `source-info.json` has the per-block
  numbers.

## Content problems found (why this is not imported)

1. **47 zero-length verses**, and they are all chapter tails. Full list is in
   `source-info.json`. Highlights: Luke 1:60-80, Luke 2:49-52, Luke 3:37-38,
   Luke 11:53-54, Matt 12:47-50, Matt 16:28/17:27/23:39, Mark 9:48-50,
   Mark 11:33, John 7:53/11:57/14:31, Gen 21:34/49:33, Exo 25:40/40:38.
2. **Intra-chapter verse renumbering (the serious one).** The non-empty verses
   after an omission are renumbered sequentially, so they no longer sit under
   the right canon/KJV verse number; the shortfall is then padded as the
   zero-length tails above. Confirmed examples, cross-checked against the
   KJV-aligned `data/armwestern.json` in this repo:
   - ArmEastern `Luke 1:47` holds canon `Luke 1:56`'s text ("Mary remained
     about three months…"). The **Magnificat (1:47-55) is absent from the
     module bytes**.
   - ArmEastern `Luke 1:59` holds canon `Luke 1:80`'s text ("the child
     grew…"). The **Benedictus (1:68-79) is absent**.
   - ArmEastern `Mark 9:44` holds canon `Mark 9:47`.
   - ArmEastern `Matthew 12:43` holds canon `Matthew 12:47`.
3. **Self-duplicated verses**: at least Gen 21:30, Gen 21:31, Gen 49:31,
   Exo 25:38, John 8:1, John 11:56, John 19:25 repeat their whole text twice
   (e.g. Exo 25:38 and John 8:1). This is in the module data, not a decode
   artifact.

## Consequence

A plain SWORD/KJV-index import (what the original task specified) would
preserve chapter/verse *counts* — so `validate.mjs` would report 0 errors after
the blanks are marked — but it would place **wrong text under canon verse
numbers** in every chapter after an omission. That is a verse-boundary defect
of the same class as the ArmWestern one that got ArmWestern pulled from default
display, not a clean "missing book / missing verse" gap.

## Options when resuming

- **Import as-is** (index order), write the 47 blanks as `???Missing???`,
  register `arm-eastern` unchecked with an explicit verse-boundary warning
  note, and document. Counts validate; affected chapters display shifted text.
- **Reconcile versification first** (Segond-1910 style): derive the module's
  own verse map, re-chunk shifted verses back to canon positions, mark only
  genuinely-absent verses. Larger effort; adds design/analysis artifacts.
