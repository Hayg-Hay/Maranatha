# Bohairica: Coptic Bohairic New Testament

Implemented 2026-10-18. Registry ID `bohairica`, short label **BOH**,
language `cop`, dialect **Bohairic**, LTR. The selected edition is **Bohairica
1.2 (2006-12-14)** by J. Warren Wells, based on Horner, distributed by eBible
as `copbhc`. Sahidic remains a separate research candidate.

## Source and rights

The downloaded package and original notice declare **Public Domain**.
The source identifies edited paragraphing/punctuation and expanded sacred-name
abbreviations. We preserve that edition identity; no exact Horner print fidelity
or official current church-edition status is claimed.

Source: https://ebible.org/details.php?id=copbhc
Notice: https://ebible.org/copbhc/copyright.htm
Retrieved: 2026-10-18. The served notice says source files dated 2025-12-12;
that packaging date does not replace the edition's 2006 identity.

Unchanged archives and extracted USFM/USFX/metadata/notices are retained under
`build/sources/bohairica`, with Git byte preservation in `.gitattributes`.
`source-files.json` records file hashes and font provenance; its own SHA-256 is
pinned in the importer. Importing requires no network.

- USFM SHA-256: `45e2d392e6cd68df7d5ee28a8184a94d7e62f33ad1805fcdc75d9174a0c85555`
- USFX SHA-256: `b3226c09eb800646f63edd258e51d0a06bc6a02252cf87efe8063b80b35c6368`
- Manifest SHA-256: `cf4bfd736e578e4f792070398d9138bd7a606469d88c25a5113b63a66e1ab6fe`

See [text notice](../data/LICENSE-bohairica.md) and
[font provenance](../fonts/NotoSansCoptic-README.md).

## Conversion and reading behavior

Initial structural inventory: **27 books, 260 chapters, 7,956 nonempty numbered
source records**, 7,957 indexed positions including one internal gap:
**Acts 24:7**. Six records contain only the source's bracketed empty marker
`[ ]` (Mark 9:44, Mark 9:46, Luke 17:36, Acts 8:37, Acts 28:29, Revelation
12:18); they are tagged as source placeholders and disclosed separately. There
are no source footnotes, section headings or combined verse labels in the USFM.
Titles remain separately in `bookMetadata`. **3 John has 15 verses.** The
internal gap remains empty with an explicit notice; no wording is inferred,
moved or copied from another text. This inventory does not certify every source
boundary or compare against print.

`build/import-bohairica.mjs` accepts only this package's observed USFM markers
(`id`, `h`, `toc1`, `toc2`, `mt1`, `c`, `p`, `v`). Unknown markup, invalid UTF-8,
empty numbered records, overlapping labels or changed source hashes fail.
Structural markup and outer formatting whitespace are removed; internal source
letters, case, spacing and punctuation remain unchanged. All source bytes remain
available. `sourceRecords` preserves each printed verse label and text.

The edition declares `nativeVersification` and `nativeReferenceScope`, using
existing independent reading blocks and source extents. No automatic mapping
or same-numbered comparison is asserted, including search comparison and
interlinear captions. Full alignment has not been established; equal chapter
counts alone do not establish it. No canon file is changed.

Runtime lazy-loads `data/bohairica.js` through the existing local script loader,
so `file://` remains supported. JSON is the generated companion artifact.
No OT, Psalms or deuterocanonical Coptic text is supplied; missing books show
the existing unavailable-text behavior.

The Language selector adds **Coptic (Bohairic book names)**, sourced from USFM
titles. Testament labels and unavailable OT names retain English; this is not a
translated app interface. Coptic names are accepted in other locales and English
references remain accepted in the Coptic locale. Arabic numerals are used for
reference entry; a Coptic-numeral input converter is not implemented.

Coptic Scripture has `lang=cop`, LTR isolation, preformatted spacing and local
Noto Sans Coptic. Search uses NFC plus case folding, preserves combining marks
and distinct letters, and maps matches back to original grapheme boundaries.
It does not transliterate or rewrite displayed/copied Scripture.

Shell cache **v67** adds the small Coptic locale and local OFL font; existing data
cache **v3** stays intact. The new translation is runtime-cached when selected.
No external font or Bible download occurs at runtime.

## Independent verification (2026-10-18)

Independent DeepSeek/OpenCode work read the pinned archives with a separate ZIP
reader and the USFX text with a direct tag reader, not the importer's USFM
parser. Results:

- `build/sources/bohairica/source-files.json` SHA-256, all 43 pinned source
  files, both archive SHA-256 values (38 extracted files), the edition notices,
  DBL metadata, text licence and font/OFL provenance match their pins.
- All **27 books / 260 chapters / 7,956 numbered records / 7,957 positions**
  match the USFX source exactly: book titles (`h`, `toc1`, `toc2`, `mt1`), every
  numbered label, all verse text, **122,976 words**, **6,743 punctuation marks**
  and every chapter boundary. No file contains U+FFFD or NUL.
- The only numeric gap is **Acts 24:7**. No chapter has an invented trailing
  slot. The inventory also has **six bracketed-only records** (`[ ]` at
  Mark 9:44, Mark 9:46, Luke 17:36, Acts 8:37, Acts 28:29, Revelation 12:18).
  They are tagged `source-placeholder`, shown exactly as supplied, and disclose
  that no text was supplied or inferred. Five source-character artifacts
  containing `]-` (Mark 6:48, John 13:3, 2 Timothy 2:25, Revelation 4:9,
  Revelation 13:2) are preserved verbatim and never silently corrected.
- Native shapes confirmed from the source: **Mark 16 has 20 records with
  16:9–20 present**; **John 7 has 53 records (7:53 present)** and **John 8 has
  59 records (8:1–11 present)**; **3 John has 15 records**. Acts 19 ends at
  label 40 and its final record already contains the dismissal clause (the
  content canon numbers as 19:41); Romans 14 ends at 23 and 2 Corinthians 13 at
  13, without invented trailing text. This is source numbering, not a
  renumbering or a claim that equal numbers align with another edition.
- `build/check-bohairica-independent.mjs` reruns this audit without importing
  the importer. `build/test-bohairica.mjs` covers data/locale/font/CSS and the
  full desktop/mobile `file://` behaviour (15 checks). `npm run
  test:bohairica-smoke` remains the focused smoke and is separately runnable.
  `check:bohairica`, `check:bohairica-independent` and `test:bohairica` are
  wired into `npm test`.
- Full `npm test` passed after the changes, including the existing Persian/
  Hebrew/Greek/LXX/other-language suites and the updated service-worker suite.
  Shell cache is **v67**, data cache remains **v3**. The shell precaches the
  small Coptic locale and local OFL font; the large `data/bohairica.js` remains
  lazy and runtime/data-cached. A previously cached Coptic translation survives
  a shell update, as do other cached translations.
- Desktop (1200 px) and mobile-breakpoint (~500 px, still below the 700 px
  breakpoint) headless Chrome review covered Coptic glyphs, the 3 John title's
  combining overline, long-line wrapping, book names/headings/inputs, the Acts
  24:7 gap and the `[ ]` placeholder. No missing-glyph boxes were observed.
  Headless Chrome clamps very small window widths; that review harness was
  temporary and is not committed.

Remaining limits:

- This is source-to-output verification of the selected digital edition, not a
  print or manuscript collation. No wording, numbering, missing unit or
  bracketed marker was changed, filled or borrowed from another witness.
- The six `[ ]` records and five `]-` artifacts are the source's own characters;
  they are disclosed/preserved rather than repaired.
- Full verse alignment with other editions is not established and is not
  asserted by the app, search comparison or interlinear caption.
- Physical-device visual review, screen-reader acceptance and official
  church-edition status were not assessed. The edition identity remains
  Bohairica 1.2 (2006-12-14), Horner-based, with eBible's Public Domain
  declaration recorded as distributor evidence.
- Service-worker install/activate/update was exercised in the Node VM with a
  fake CacheStorage (including v66 -> v67 shell replacement and preservation of
  the v3 data cache), not against a live HTTPS deployment or a real browser
  update prompt.

No commit, merge or push is authorized. The workspace contains unrelated
existing changes; the handoff preserved them and reviewed only Coptic changes.

