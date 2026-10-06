# build/sources/delitzsch

Cached source and provenance for the Maranatha translation **`delitzsch`** —
*Delitzsch Hebrew NT (1877)*.

## What this is

The **New Testament subset** of eBible.org's `heb` / `HEBMOD` digital edition,
*The Holy Bible in Modern Hebrew*. eBible attributes the text to **Franz
Delitzsch (1813–1890)**, a 19th-century Hebrew translator of the Greek New
Testament whose first edition appeared in **1877**, and declares the text
**public domain**.

This is presented as a **Hebrew translation of the Greek New Testament by a
19th-century translator**. It is **not** an ancient Hebrew New Testament
manuscript and **not** a recovered "original Hebrew" New Testament.

## Edition uncertainty (important)

eBible does **not** identify the print edition underlying this digital text. It
is therefore treated as an unpointed eBible digital edition attributed to
Delitzsch, **not** as a verified transcription of the 1877 first edition. The
archive/file SHA-256 values below identify the inspected digital artifacts, not
a verified historical print edition.

Do not substitute any of these for this source:

- `delitz.fr`'s vocalized 1901 transcription;
- `HebrewNewTestament/HebDelitzsch`'s 1885/2003 revision;
- an unspecified "modern Hebrew NT" from another repository.

## Files

| File | Role |
| --- | --- |
| `heb_vpl.txt` | **Imported source.** BibleWorks VPL text, `BOOK C:V text`, UTF-8/LF, no BOM. |
| `heb_vpl.sql`, `heb_vpl.xml` | Same data in SQL/XML form from the same archive; cached for provenance. |
| `heb_about.htm` | Publisher notice: "Public Domain", "Translation by: Franz Delitzsch (1813–1890)", 2022-06-14. |
| `usfm/` | Corroborating USFM export (69 files incl. `copr.htm`). Cross-checks the 3 John annotation and reference structure; not imported. |
| `source-info.json` | Machine-readable provenance, hashes, audit and transformation rules. |

## Source URLs and hashes

- Primary: <https://ebible.org/Scriptures/heb_vpl.zip>
  - archive SHA-256 `77bfc46d373403f722aef77621e3b40d9195e59fd08bdcc3f5185a8db726bc9d`
  - `heb_vpl.txt` SHA-256 `71255aad99b91b24494a2d4f90daf34afb06f4681a2feb979c2e1514e1c62237`
- Corroborating: <https://ebible.org/Scriptures/heb_usfm.zip>
  - archive SHA-256 `416ebf82794853a5a2c7721a736189315034baf6fd60240047ddbdb6e16fcb9e`
- Details: <https://ebible.org/find/details.php?id=heb>
- Copyright/PD: <https://ebible.org/heb/copyright.htm>
- Retrieved: **2026-10-06**.

If a downloaded archive hash differs, inspect and document the change before
accepting the newer source; `--download` refuses a changed archive unless
`--accept-changed-source` is passed. Re-establish coverage, Unicode and
reference results after accepting any change.

## Coverage (from the cached source)

- 27 NT books, 260 chapters, **7,957 numbered NT verse rows**.
- 23,145 OT rows explicitly recognized and excluded.
- No internal verse-number gaps, no duplicate references, no malformed rows.
- NT verse bodies are **unpointed**: consonants, final forms and sof pasuq
  (U+05C3) only — **zero niqqud/te'amim**, zero U+FFFD.

## 3 John 1:14 / 1:15

Source 3 John 1:14 ends with a verbatim bracketed publisher annotation:

```
...נדבר׃ [ (III John 1:15) שלום לך הרעים שאלים לשלומך שאל לשלום הרעים לאיש איש בשמו׃ ]
```

The USFM encodes this inside `\v 14` (not as a `\f` footnote). The importer
retains verse 14's main text at index 13 and represents the labelled bracket
content as verse 15 in `verseMetadata` with `status: "note"`. It is shown once as
note-only text, never as a numbered main-text verse. The label is expected
verbatim; changing it fails the importer.

## Commands

```
node build/import-delitzsch.mjs               # regenerate data/delitzsch.{json,js}
node build/import-delitzsch.mjs --check        # verify; no write, no network
node build/import-delitzsch.mjs --download     # (re)acquire this cached source
node build/validate.mjs data/delitzsch.json    # general structural validation
node build/validate-delitzsch.mjs              # source-aware validation
node build/test-delitzsch.mjs                  # full importer/UI regression suite
```

These all run offline under `file://` for the app itself; only `--download`
touches the network, at build time.
