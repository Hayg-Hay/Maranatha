# Peshitta source probe and accepted refinements

2026-10-09. Research only: no app/data import, English rewrite, added MarYa
annotation layer, full regression run, staging, commit or publisher contact.
The user prefers simply reading the unaltered Syriac alongside unchanged English.

## Pinned source and distributor terms

CrossWire archive: `build/sources/peshitta/Peshitta.zip`.
SHA-256: `badce0aa0a9b70a9c81891ed48d5a9e86de1e24d12ad4ad378e060e03cabc7b9`.
Exact extracted-file hashes: `source-files.json`; original bytes protected by
the directory's `.gitattributes`. Research script:
`build/research-peshitta-probe.mjs`; evidence:
`build/reviews/peshitta-raw-probe.json`.

The config explicitly declares **Versification=KJV**, RTL, UTF-8, OSIS zText,
Peshitta 2.0 dated 2020-02-08, Public Domain, BFBS 1905 and John Richards.
It names Roger Pearse's Syriac Library and madenkha.net as text sources.
The inspected config establishes no separate restrictive markup/notes licence.
Pearse's source page independently labels the John Richards upload Public Domain.
This records the distributors' declarations, not a new worldwide rights ruling.

Source: https://www.tertullian.org/rpearse/thesyriaclibrary/new_testament.htm

## Raw inventory

- 29 compressed NT blocks, 8,246 NT index records: 7,957 KJV-shaped verse slots
  and structural entries. All 27 NT books contain text, including the five
  books outside the early 22-book Peshitta corpus.
- OT block/text files are empty; the existing OT index has no populated entries.
  **No Old Testament text** is supplied by this module.
- Raw verse markup includes chapter/div boundary tags; it must not be displayed
  as Scripture. Structural records include importer/header/chapter milestones.
- No U+0730–U+074A vowel/combining marks occurred in verse records. The actual
  source is unpointed Unicode; do not claim its encoding is inherently Serto.
  The configured Code2000 font does not constitute a font-redistribution grant.
- One zero-length verse-index slot: **Mark 9:50**.

These counts do not certify source-unit boundaries or semantic correspondence.

## Mark 9:50 is a boundary problem, not missing words

Raw slot 9:49 includes the Syriac for 49, followed by literal ASCII **50** and
the salt/peace text for 50. Slot 50 is empty. The named upstream HTML likewise
has 49 and 50 on one source line. Mark 8:38 and Mark 9:1/2 are separately
indexed; this does not reproduce the Western Armenian chapter-start shift.

Record the explicit source marker and raw offsets. Before import, verify the
source boundary and remove structural/reference markup only, without editing
any Syriac words or inventing missing text. Do not simply label 50 absent or
use English verse lengths to split the Syriac.

Named upstream source: https://www.tertullian.org/rpearse/thesyriaclibrary/new_testament.htm

## MarYa verified in the pinned archive

The raw 1 Corinthians 12:3 slot contains **ܕܡܪܝܐ ܗܘ ܝܫܘܥ**. The target word
ܡܪܝܐ is therefore established in the selected archive, not merely another
edition's website. Romans 10:9 instead contains **ܒܡܪܢ ܝܫܘܥ** (our Lord),
so the forms should not be conflated across passages. Raw bytes/refs/offsets
are in the evidence JSON.

**User decision:** no English replacements and no new MarYa annotation layer.
Leave Murdock/Etheridge exactly as sourced; the user will consult the Syriac.
Their actual 1 Corinthians 12:3 module records render Lord / THE LORD.

## English companions: separate source and boundary audits

Both downloaded Murdock and Etheridge modules have text in all 27 NT books.
Archives were cached under `build/cache/peshitta-companions/` for investigation,
not imported. Murdock 1.2 uses GBF markup with footnotes; its config says 1852,
Public Domain, peshito.com. Etheridge uses UTF-8 OSIS/footnotes, Public Domain,
1846/1849 volumes, and explicitly credits a later Syriac source for additional
epistles/Revelation. Its config includes a 2022 history entry despite its older
SwordVersionDate; exact archive identity must be pinned at import.

Murdock's archive contains an **errata conversion log** recording appended
native Romans 7:26, 3 John 1:15 and Revelation 12:18 into KJV-shaped terminal
slots. A direct read confirms the extra text is still present with inserted
bracketed labels, so the warnings do not prove it was lost. However, those
brackets/labels are conversion material and must not automatically be treated
as original authorial punctuation. Evidence:
`build/reviews/murdock-conversion-probe.json`. Recover authorial native units
from an identified source/print before presenting that converted text as clean.

Murdock's appendix discusses the 22-book canon and several print editions;
that historical discussion alone does not identify every translated base.
Its actual source-preface verification remains pending. A reproduced Etheridge
preface identifies Schaaf for Acts/Epistles, but the exact print and per-part
provenance still need acceptance. Neither earlier English work can be described
as a translation made from the later BFBS 1905 edition.

Use separately credited English/Syriac editions. Any normal reference-based
comparison is not a claim that the English was translated from this exact
Syriac witness. Declare actual source-unit/content-placement exceptions;
different editions alone do not prove every matching reference incompatible.

## Book tradition, script and OT decisions

The five later-supplied books (2 Peter, 2–3 John, Jude, Revelation) need visible
per-book provenance distinguishing them from the original 22-book corpus.
Do not invent a precise later source attribution before the 1905 edition's
preface is checked. The probe establishes presence, not that attribution.

For implementation: RTL text; locally bundled properly licensed Syriac font;
stored code points/order unchanged. Font style is rendering, not a rewrite.
Use NFC reference/search forms with original-offset mapping. If pointed queries
are accepted against this unpointed source, define an explicit mark whitelist,
never strip letters or conflate different Lord-word forms. Test selection,
copy, combining marks and bidirectional punctuation after implementation.

Leiden/ETCBC OT remains deferred. Its non-commercial restriction requires a
deliberate dataset/distribution decision and accurate per-edition licence
metadata; it does not by itself establish a replacement licence for unrelated
application code. Audit the actual file/script/licence scope before bundling.

Armenian remains the original priority, with the 1853 print check already
recorded. This NT research can proceed during publisher-permission waiting
without replacing that work. After source decisions and basic implementation,
manual DeepSeek handoff handles routine fidelity/tests/regression/staging/push.
