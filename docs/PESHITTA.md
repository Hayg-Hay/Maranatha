# Syriac Peshitta and Murdock English NT

Implementation on 2026-10-09:

- `peshitta` / PESH: CrossWire 2.0 BFBS-labelled unpointed Syriac NT; 27 books,
  260 chapters, 7,957 main records after explicit Mark 9:50 boundary recovery.
- `murdock` / MUR: CrossWire 1.2 English Syriac NT, source notice 1852;
  27 books, 260 chapters, 7,960 indexed native units and 19 separate footnotes.

Both are lazy-loaded local JS datasets; neither supplies OT text. English
book labels and existing reference aliases are used; no source-empty Syriac
book-name fields are filled with invented translations.

## Sources and precise identity

The importer verifies hash-pinned `import-source-files.json` manifests and
every cached source file, with no network at import/runtime. Source archives,
byte indexes, markup and provenance pages remain available. Read
`data/LICENSE-peshitta.md` and `data/LICENSE-murdock.md` for separate notices.
Both modules declare Public Domain. The font has its own OFL licence.

The Syriac module says BFBS 1905, but full NT textual history includes later
material. The registry therefore identifies it as BFBS digital NT, not as a
certified verbatim complete 1905 print. Five later-supplied books—2 Peter,
2–3 John, Jude, Revelation—carry per-book edition notes below reading.
These distinguish the traditional 22-book corpus without inventing precise
recension attribution from mere module presence.

Murdock's reproduced authorial preface identifies BFBS 1816/1826, with
Leusden/Schaaf 1717 and Gutbir consultation. It is separately credited;
matching reference rows do not claim translation from this exact Syriac text.
Relevant BFBS history reference:
https://www.degruyterbrill.com/document/doi/10.31826/9781463235185-001/pdf?licenseType=free

## Source-unit conversions and outstanding gaps

Mark 9:49 in the raw Syriac module contains a literal verse number 50 followed
by its wording. The named upstream likewise has both verses on one line.
Only that explicit marker is separated, restoring 9:49 and 9:50 without
guessing word boundaries. `conversionLedger` records the indexed source slot
and target refs; original raw tags/bytes remain retained.

Murdock's module contains explicitly labelled native extra verses, with their
framing recorded in its errata. Romans 7:26, 3 John 1:15 and Revelation 12:18
are restored as separate units. GBF footnotes are separate; italic styling
is flattened with all contained words retained. Converter-added wrappers are
metadata, never claimed to be original authorial words. Nothing replaces Lord.

**Ten Murdock slots remain empty:** Matthew 26:30, 26:45; Mark 4:10, 8:19,
9:31, 11:19; Luke 18:35; Acts 19:41, 20:17; 2 Corinthians 13:14. These receive
factual indexed-slot gap notices, not invented restorations. The registry
discloses pending source-boundary verification. DeepSeek must distinguish
omission from merged/shifted residue using matching source evidence; complex
or unresolved fidelity questions must return to Codex.

Ordinary chapters follow existing matching-reference comparison policy.
Romans 14 is separate for both witnesses because WEB's doxology placement
differs. Murdock additionally separates Romans 7, 3 John 1 and Revelation
12–13. These exceptions guard search comparisons and interlinear rendering.

## Syriac display and search

Syriac spans have `lang=syr`, RTL direction, isolated bidi layout and local
Noto Sans Syriac Western v3.001. Source letters remain unchanged; Serto font
style does not rewrite Unicode. Font bytes, release archive and OFL are
recorded in `build/sources/peshitta-font/font-manifest.json`.

Search forms use NFC and ignore only Syriac combining-point range U+0730–074A,
preserving letters and distinct Lord-word forms. Grapheme start/end mapping
keeps marks attached in highlighted/copied original text. The current source
is unpointed; pointed queries can still find its consonantal spelling.
Other language search behavior is retained.

MarYa at 1 Corinthians 12:3 is verified in the actual pinned archive. Romans
10:9 uses another form (our Lord); forms are not conflated. **No MarYa English
substitution or extra annotation layer is implemented**, as the user requested.
Footnotes and provenance are collapsed below Scripture, never mixed into copy.

Shell cache v65 adds the local font; data cache v3 is retained and translation
files cache lazily. No remote font/CDN is used at runtime.

## Verification status and manual handoff

Codex ran the importer and one basic real-app JSDOM file:// smoke check:
local loading, RTL/MarYa text, explicit Mark boundary, pointed-query search,
exact highlighted text, collapsed provenance, unchanged English Lord, and
restored Murdock refs passed. Script: `build/cache/peshitta-pair-smoke.mjs`.

**Independent whole-source fidelity checks, dedicated desktop/mobile tests
and the full regression suite were not run by Codex**, per README workflow.
DeepSeek should add/run them, including GBF footnote isolation, native wrapper
recovery, the ten indexed gaps, all five later book notes, cross-edition guards,
offline font caching and regressions in Japanese/Chinese/Thai search.

`npm run check:peshitta-pair` verifies deterministic generated datasets.
DeepSeek should add independent readers/tests and npm test wiring, perform
routine fixes/retests and staged-diff verification, then commit/push only after
verification succeeds. Stop for unresolved Scripture or architecture issues.
Do not treat matching KJV-shaped counts as source-boundary certification.
