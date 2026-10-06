# build/sources/delitzsch1901

Cached source, provenance and scan evidence for the Maranatha translation
**`delitzsch1901`** — *Delitzsch Hebrew NT (1901, vocalized)*.

## What it is

A **vocalized (niqqud) Hebrew translation of the Greek New Testament** by
**Franz Delitzsch (1813–1890)**, first published **1877**, imported from the
**British & Foreign Bible Society 1901 (twelfth) edition, Berlin**.

It is a historical translation by a 19th-century translator. It is **not** an
ancient Hebrew New Testament manuscript, **not** a recovered original, and
**not** the same edition as the unpointed eBible `delitzsch` translation, which
is kept separately (`build/sources/delitzsch/`).

Do not substitute CrossWire `HebDelitzsch` (1885/2003 revision; permission
granted specifically to CrossWire). `delitz.fr` and Kirjasilta share the sampled
anomalies and are treated as *related transcriptions*, not independent witnesses.

## Files

| File | Role |
| --- | --- |
| `Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt` | Import source: vocalized verse-per-line text (1,792,212 bytes, sha256 `c592cae6…be8a7`). |
| `corrections.json` | Reviewed correction manifest (43 entries): full original + corrected verse text, reason, evidence. |
| `source-info.json` | Machine-readable provenance, hashes, edition/licence evidence, audit, versification. |
| `evidence/` | Title page, table of contents, John 1, Romans 8 and 3 John scan images; archive.org metadata; Sermon-Online catalog + FAQ; `scan-index.json`. |

## Source URLs

- Import text: <https://info2.sermon-online.com/hebrew/Bible/Hebrew-The_New_Testament_Franz_Delitzsch_1901.txt>
- Catalog: <https://www.sermon-online.com/de/contents/31592>
- Printed edition (verification): <https://archive.org/details/hebrewnewtestam00deli>
- Retrieved: **2026-10-06**.

Reuse basis: the underlying 1901 text is public domain (author died 1890), the
host grants free redistribution of its files "unless otherwise noted" and notes
no restriction here, and the transcription is a faithful reproduction.

## Audit and corrections

- 27 books / 260 chapters / **7,961 vocalized verse rows**; 0 duplicate refs,
  0 malformed rows, 0 empty texts, 0 U+FFFD.
- **43 reviewed corrections**, two rules:
  1. collapse a run of an identical repeated Hebrew combining mark (niqqud,
     te'amim, or doubled maqef) to one mark — 34 verses;
  2. remove a `)` only when the chapter's running paren balance is zero — 9
     verses (John 1:20; 2:20,21; 3:20,21; 4:20,21; 5:20,21).
- Genuine editorial parentheses are **preserved**, including the Romans 8:1
  clause and cross-verse pairs (John 5:3-4, Acts 9:5-6/24:6-8, Luke 9:55-56).
- Verified against the print: John 1:20 has no `)`, John 1:37 has a single
  hataf-patah, Romans 8:1 keeps its parentheses, 3 John numbers the greeting as
  verse 15.

Regenerate the manifest only when the source or the rules change:

```
node build/derive-delitzsch1901-corrections.mjs   # then review corrections.json
```

## Versification

Source verse numbers are preserved; nothing is compacted, renumbered or padded.
Seven chapters differ from canon.js and are declared in the data and disclosed
in the UI (rendered in a separate, source-numbered block):

John 1 = 52 (canon 51) · Romans 7 = 26 (25) · Romans 14 = 23 (26) ·
1 Corinthians 13 = 14 (13) · 2 Corinthians 13 = 13 (14) ·
2 Thessalonians 3 = 19 (18) · 3 John 1 = 15 (14).

## Commands

```
node build/fetch-delitzsch1901.mjs              # (re)acquire this cached source
node build/import-delitzsch1901.mjs             # regenerate data/delitzsch1901.{json,js}
node build/import-delitzsch1901.mjs --check      # verify; no write, no network
node build/validate.mjs data/delitzsch1901.json
node build/validate-delitzsch1901.mjs
node build/test-delitzsch1901.mjs
```

The app still opens `index.html` directly under `file://`; this translation
loads through the same classic `<script>`-tag path as every other translation.
