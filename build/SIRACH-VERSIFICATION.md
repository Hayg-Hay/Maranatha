# Sirach versification audit (2026-10-05)

Every translation registered in `app.js` was inspected independently, using
its committed corpus and recorded source edition. Book inclusion is a property
of that imported edition, not of the translation name in general.

| Runtime ID | Imported edition | Sirach |
| --- | --- | --- |
| web | eBible World English Bible, Catholic book set | 51 chapters; publisher source audited chapter by chapter |
| kjv | scrollmapper standard 66-book KJV | Absent (this import does not include the KJV Apocrypha) |
| armwestern | CrossWire ArmWestern, Western Armenian NT 1853 | Absent; NT only |
| byz | Robinson–Pierpont Byzantine Greek NT | Absent; NT only |
| he | OSHB, 39 protocanonical OT books | Absent; no Sirach corpus |
| luther1912 | eBible deu1912, imported 66-book edition | Absent (no Apocrypha in this import) |
| segond1910 | eBible fraLSG, imported 66-book edition | Absent |

No other currently registered translation supplies the additional passage
Sirach 26:19–27. WEB acknowledges its omission; it does not supply that
passage's text. The reader must not invent it or borrow a different version's
wording under the WEB label. As a comparison outside the installed corpus,
[NABRE](https://bible.usccb.org/bible/sirach/26) supplies 19–27 in a note and
retains 28–29 in the main text. Those notes have not been imported.

## Import defect and corrected source identities

The previous WEB HTML scraper pushed one array item for each marker instead
of indexing by its `V<number>` ID. A range marker `V19` displaying “19–27”
therefore consumed only one array slot. Whitespace `&#160;` survived as fake
verse text; the following publisher verses 28 and 29 became application verses
20 and 21. Increasing the global maximum alone would not repair those labels.

The corrected importer preserves each numbered slot. Omitted references hold
`null`; `verseMetadata.SIR[chapter][verse]` records their status and publisher
note. Notes on surviving verses remain separate from verse text. No subsequent
verse is renumbered. `build/sources/sirach-web/` contains all 51 publisher HTML
pages plus a machine-readable audit with each chapter's highest verse ID,
number of text-bearing verses, omitted IDs and source URL.

[WEB Sirach 26](https://ebible.org/eng-web-c/SIR26.htm) now has:

| Reference | WEB representation |
| --- | --- |
| 26:1–18 | Source verse text |
| 26:19–27 | Explicit omission, with the publisher's note |
| 26:28 | Source text beginning “For two things…” |
| 26:29 | Source text beginning “It is difficult…” |

The audit also identified whole-verse omissions in chapters 1, 10, 11, 13,
16, 17, 18, 19, 20, 22, 23, 24 and 25. The rebuild repairs all Sirach chapters;
every other WEB book is unchanged. Maximum verse ID and number of surviving
verses are separate quantities, including when the final verse is omitted.

## Reference resolution and display

The parser dynamically checks the union of actual numbered verses and explicit
metadata in all loaded translations, including translations no longer selected.
It validates range endpoints against that union and uses its highest ID for
open-ended ranges. The canon's counts are a fallback when no loaded translation
covers the chapter; they do not override loaded Sirach evidence.

A documented omission is itself an addressable reference: `Sir 26:25` opens an
omission notice even when WEB is the only loaded Sirach corpus. If another
loaded translation provides the text or a note-only reading, the reader names
it beside the missing/omitted cell. It does not change selection automatically.
An unknown reference such as `Sir 26:30` fails for the actual installed corpus.

Browse, range, context and mobile rendering use the loaded chapter extent.
The shared optional metadata schema distinguishes `omitted`, `additional`,
`note` (text exists only in a source note), and `text` (normal text with a note).
A missing book and an undocumented missing verse have separate notices. Future
Sirach editions require independently verified source profiles in validation;
no blanket list of accepted lengths is substituted for checking verse identities.

The WEB runtime URL is versioned to bypass stale corrupt data. The data cache
continues to retain other translations and downloaded interlinear books; data
requests honor query strings. The shell cache advances to v37.

## Reproduction

- `node build/audit-sirach.mjs --write`: rebuild WEB Sirach and audit from cached publisher pages.
- `node build/audit-sirach.mjs`: compare all 51 runtime chapters and metadata to those pages; report book presence for all seven translations.
- `node build/validate.mjs data/web.json`: validate Sirach against its publisher source, not global counts.
- `node build/test-sirach.mjs`: check real omissions, preserved IDs, sparse/additional/note-only references, unselected loaded translations, invalid references, desktop/mobile/context views and file:// operation.
- `npm test`: run the audit and regressions alongside the existing suite.
