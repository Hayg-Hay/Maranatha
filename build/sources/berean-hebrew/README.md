# Berean Hebrew interlinear — Genesis + Exodus local preview (Bible Hub)

This directory holds a **read-only local preview** of the Berean Interlinear
Bible (BIB) Hebrew Old Testament extracted from Bible Hub. It covers **all 50
chapters of Genesis** and **all 40 of Exodus**, plus the retained **Daniel 2:4–5**
and **Malachi 4:5–6** records from the accepted pilot. The generated runtime files
under `data/berean-hebrew/` are what the app loads.

The work answers one question: does Bible Hub's Berean Hebrew interlinear
preserve a reliable, per-word association between Hebrew/Aramaic surface,
transliteration, morphology, Strong's number, contextual English gloss, verse
reference and token order — and can it be extracted reproducibly, validated
independently, and rendered faithfully for a local evaluation?

> **Status:** uncommitted work-in-progress on branch `codex/berean-hebrew-pilot`,
> pending supervisor review. This is a **local evaluation, not publication
> approval**; the scope of reuse terms for the ancillary fields remains under
> review.

## 1. Source identity (established, not assumed)

The word-by-word Berean interlinear is under `biblehub.com/interlinear/<slug>/<n>.htm`.
Every cached page is accepted only after the downloader checks all of:

- the page carries the interlinear word-table structure;
- the page carries the footer **"Berean Interlinear Bible (BIB). Produced in
  cooperation with Bible Hub, Discovery Bible, unfoldingWord, Bible Aquifer,
  OpenBible.com, and the Berean Bible Translation Committee."**;
- the page `<title>` exactly identifies the requested book and chapter
  (`"<Book> <N> Interlinear Bible"`) — a wrong or redirect page is rejected.

Covered pages (92 total, cached 2026‑09‑30):

| Covered | URL pattern | Edition label |
|---|---|---|
| Genesis 1–50 | `https://biblehub.com/interlinear/genesis/<n>.htm` | BIB |
| Exodus 1–40 | `https://biblehub.com/interlinear/exodus/<n>.htm` | BIB |
| Daniel 2 | `https://biblehub.com/interlinear/daniel/2.htm` | BIB |
| Malachi 4 | `https://biblehub.com/interlinear/malachi/4.htm` | BIB |

The breadcrumb parent is **BSB** (Berean Study Bible), the same translation
committee named in the footer. The pages print no machine-readable
edition/revision, so identity rests on the footer, the BSB breadcrumb, and the
title check.

## 2. Reuse terms (official sources inspected)

Read and recorded **2026‑09‑30**:

- **https://berean.bible/terms.htm** — "The Berean Bible and Majority Bible
  texts are officially dedicated to the public domain as of April 30, 2023. All
  uses are freely permitted." Derivatives may be reproduced, integrated and
  adapted; attribution is requested but not required.
- **https://interlinearbible.com/** — credits the third-party basis of the
  interlinear: "The basis for the interlinear text is the **Biblos Interlinear**,
  developed over several years and now refined by the translation committee."
- The per-page footer credits Bible Hub, Discovery Bible, unfoldingWord, Bible
  Aquifer, OpenBible.com and the Berean Bible Translation Committee.

**Established:** the Berean Bible *texts* are public domain (CC0, 2023‑04‑30);
the project already relies on this for the Berean Greek NT. Programmatic
**retrieval** from Bible Hub is permitted by the Berean team's email.
**Unresolved:** whether the third-party-derived morphology/Strong's/lexical
fields (Biblos Interlinear and the other credited parties) fall under the same
dedication, and the raw page as a whole. Raw HTML therefore stays local/ignored.

### Retrieval permission (email)

The Berean team replied (email on file):

> "The interlinear is still in draft mode … you are welcome to retrieve the
> current version programmatically as needed from the Bible Hub site."

This is permission to **retrieve**, not a licensing basis (the terms above are).
The data is a **dated draft** and no further email was sent.

## 3. Local cache

Raw pages live in `source-pages/` (ignored via `.gitignore`, re-fetchable, **not
committed** — they contain site markup and other content). `source-manifest.json`
**is committed**: it records URL, book/chapter, retrieval date, HTTP status, byte
length, sha256 and the title/breadcrumb/footer evidence for all 92 pages. The
loader honours a 3-second delay between live requests, one request per page, a
descriptive user agent, abort-on-block, resumable successes, atomic page/manifest
replacement, manifest preservation and reuse of unchanged pages (original
retrieval dates kept). A page whose bytes no longer match its hash is reported
CORRUPT and never silently re-trusted.

## 4. Tooling

| Script | Purpose |
|---|---|
| `build/tools/berean-hebrew-fetch.mjs` | Crash-safe downloader. `--list`, `--refresh`, `--only <book>`, `--chapters <list>`. Network only. |
| `build/tools/berean-hebrew-extract.mjs` | Offline parser + fixture builder. `build`, `dump <BOOK> <ch> <v>`. Verifies each page sha256 before parsing. |
| `build/tools/berean-hebrew-variants.mjs` | Generates `variants.json`: verifies Ketiv/Qere correspondences against the OSHB XML explicit structure (context + fingerprints). `--check`. |
| `build/tools/berean-hebrew-validate.mjs` | Offline coverage/totals/anomaly/variant/fingerprint validation of the fixture. |
| `build/tools/berean-hebrew-compare.mjs` | **Independent** DOM-based (jsdom) re-read of every cached page, compared record-by-record to the fixture. |
| `build/tools/berean-hebrew-tests.mjs` | Offline tooling tests (fetch recovery, hash/no-table safeguards, parser edge cases, fingerprints). |
| `build/import-berean-hebrew.mjs` | Builds the runtime manifest + per-book chunks from the fixture. `--check`. |
| `build/test-service-worker.mjs` | Proves a shell-cache update preserves the existing `maranatha-data-v3` cache and its files. |
| `build/test-berean-hebrew.mjs` | jsdom runtime tests for the local preview. |

```bash
node build/tools/berean-hebrew-fetch.mjs --list          # print the 92 URLs, no network
node build/tools/berean-hebrew-fetch.mjs                 # fetch missing chapters (resumable)
node build/tools/berean-hebrew-extract.mjs build          # regenerate hebrew.fixture.json
node build/tools/berean-hebrew-variants.mjs               # regenerate variants.json
node build/tools/berean-hebrew-variants.mjs --check
node build/tools/berean-hebrew-validate.mjs
node build/tools/berean-hebrew-compare.mjs
node build/import-berean-hebrew.mjs                       # write data/berean-hebrew/*
node build/import-berean-hebrew.mjs --check
node build/test-service-worker.mjs
node build/test-berean-hebrew.mjs
```

## 5. Fields recovered

One record per source alignment token, in Bible Hub's own order: `order`,
`surface`, `transliteration`, `gloss`, `morphology`, `strongsList` (all numbers),
`strongs` (singular only when exactly one — never hides extras), `language`,
`glossStatus`. **Not done:** no attachment to OSHB by position, no generated
glosses, no invented Strong's/morphology, no picking a form when several Hebrew
spans occur, no merging Ketiv/Qere into consecutive words.

### Normalizations (documented; raw HTML kept for audit)

- `&nbsp;` → space; whitespace collapsed; U+2011 → `-` (morphology labels).
- Empty `<span class="eng">` → `gloss:null` + `glossStatus:"missing"`; deliberate
  `-` → `gloss:"-"` + `glossStatus:"untranslated"` (never conflated).
- `¦` (U+00A6) is the page's own prefix/stem separator; kept in `morphology`,
  never in `surface`.
- Punctuation in `surface` preserved (maqqef, sof pasuq, paseq, paragraph
  marker); prefixes stay fused to their word.

### Anomaly classes

- **structural** (ambiguous/failed): `no-surface`, `multi-hebrew-span`,
  `malformed-verse-reference`, `verse-reference-out-of-order`,
  `token-before-first-verse`, `unsupported-token-structure`, `no-transliteration-span`,
  `no-morphology-span`, `no-gloss-span`, multi-* spans, and
  `stale-variant-fingerprint`. **The build refuses to overwrite accepted output
  while any structural error exists.**
- **source-gap** (legitimate source omissions, explicit nulls + diagnostics):
  `missing-strongs`, `missing-gloss`, `missing-transliteration`,
  `missing-morphology`. Empty spans are gaps; **absent** spans are structural.
- **info**: `multi-strongs` (all numbers retained).

### Verse detection

Bible Hub marks the first word of each verse with `ref…` spans; the extractor keys
off those. Exodus has an OSHB↔English versification offset in two places (see
§7), which the variant tool maps through the OSHB `KJV:` notes.

## 6. Record counts (actual, from the extracted records)

| Book | Chapters | Verses | Records |
|---|---|---|---|
| Genesis | 50 | 1533 | 20613 |
| Exodus | 40 | 1213 | 16713 |
| Daniel 2:4–5 | 1 | 2 | 29 |
| Malachi 4:5–6 | 1 | 2 | 28 |
| **Total** | **92** | **2750** | **37383** |

- Intentional untranslated `-` markers: **1300**.
- Missing (empty) gloss records among the extracted verses: **4** (all Exodus).
- Records with no Strong's: **770** → `strongsList: []`, `strongs: null`.
- Records with empty transliteration: **1** (Genesis 14:17).
- Records with empty morphology: **18** (compound-name components).
- Genesis and Exodus chapter/verse coverage match Maranatha's canon exactly.

## 7. Ketiv/Qere findings (verified against the OSHB XML)

`variants.json` is generated by `berean-hebrew-variants.mjs`, which reads the
**OSHB XML's explicit `<w type="x-ketiv">` / `<rdg type="x-qere">` structure** and
matches source records by **consonant skeleton for the same verse**, using the
**preceding-word context** when both readings appear as distinct nearby words.
Strong's and vowel-point comparison are recorded as `evidence`, never used as the
sole key. **Every verified entry carries a source-record fingerprint**, and the
extractor refuses (structural `stale-variant-fingerprint`) to attach an annotation
whose fingerprint does not match the token — so a stale table can never attach to
a changed token just because its index stayed the same.

- **30 verified variants, 0 unresolved** (all display the **written (Ketiv)**
  form, as Bible Hub does).
- **The five previously-uncertain Genesis cases are now resolved:**
  - `GEN 27:29` — resolved by preceding-word context: the Ketiv spelling appears
    as the first of two "bow down" words, and the second (Qere-spelled) word is a
    distinct source record, not the variant site.
  - `GEN 27:3` — displayed letters uniquely match the Ketiv (`צידה`); the source
    tags H6718, a dictionary variant of the OSHB lemma, so `evidence.strongs:none`
    does not block the letters-based correspondence.
  - `GEN 30:11`, `GEN 36:5`, `GEN 36:14` — displayed letters uniquely match the
    Ketiv while the source's transliteration/Strong's follow the read form
    (`evidence.strongs:other-reading`), which is a documented source convention.
- **Exodus** contributes 12 verified variants, including two that required the
  OSHB→English versification mapping: `EXO 22:5` (OSHB 22:4) and `EXO 22:27`
  (OSHB 22:26). The app shows each variant's exact OSHB Ketiv and Qere as
  isolated RTL spans, labelled "OSHB comparison (not supplied by Berean)".

## 8. Divine name & sample passages

The source's own convention is preserved, **not standardized**:
`יְהוָה` (H3068) is transliterated **`Yah·weh`** and glossed **`YHWH`** (sometimes
"of YHWH" / "[am] YHWH" contextually). This holds across Genesis (2:4) and Exodus
(3:13–15, 6:2–3, 20:2, 34:6–7, 40:34–38). Genesis 1:1 glosses are exactly
`In the beginning / created / God / (blank) / the heavens / and / the earth`.

## 9. Validation and fidelity

```bash
node build/tools/berean-hebrew-tests.mjs              # 26 tooling tests
node build/tools/berean-hebrew-variants.mjs --check
node build/tools/berean-hebrew-validate.mjs           # 37 checks
node build/tools/berean-hebrew-compare.mjs            # independent DOM comparison
node build/import-berean-hebrew.mjs --check
node build/test-service-worker.mjs                    # 20 checks
node build/test-berean-hebrew.mjs                     # 66 runtime checks
```

**Deterministic regeneration** (fixture, variants, runtime) proves
*reproducibility*. Independent *fidelity* comes from
`berean-hebrew-compare.mjs`, a separate jsdom DOM reader that does **not** import
the extractor's parser: it re-reads all 92 cached pages and agrees with the
fixture on **every one of the 37,383 records** (references, counts/order,
surface, transliteration, gloss, morphology and the complete Strong's list), and
confirms canon coverage for Genesis and Exodus.

## 10. Remaining limitations

1. **Licence scope** — the CC0 text dedication is established, but the
   third-party-derived morphology/Strong's/lexical fields are unresolved; raw
   pages stay local.
2. **Draft volatility** — every page is date-stamped and expected to churn.
3. **Missing fields** — 770 no-Strong's, 1 no-transliteration, 18 no-morphology
   and 4 no-gloss records are genuine source gaps shown as explicit blanks.
4. **Ketiv/Qere** — the source shows only one form; all covered cases are
   resolved, but new OSHB pairs may appear as upstream changes.
5. **Own interlinear** — Berean Hebrew is its own interlinear, never
   positionally aligned onto OSHB.
6. **Scope** — Genesis and Exodus only, plus the retained Daniel/Malachi verses.

## 11. Local app preview

- **Runtime data:** `data/berean-hebrew/manifest-v2.js`
  (`MARANATHA_BEREAN_HEBREW_MANIFEST`) plus one chunk per book
  (`data/berean-hebrew/GEN.js`, `EXO.js`, `DAN.js`, `MAL.js`). Generated
  deterministically from the fixture by `build/import-berean-hebrew.mjs`.
- **Selection:** tick **"Berean Hebrew (Genesis–Exodus, draft)"** under *Study
  tools* and choose **Reading** (dense cards) or **Study** (expandable). It is
  mutually exclusive with OSHB Hebrew; OSHB and both Greek interlinears behave
  exactly as before.
- **Coverage:** Genesis 1–50 and Exodus 1–40 plus Daniel 2:4–5 and Malachi
  4:5–6. Verses/chapters outside that (including other books) show a concise
  coverage notice — never silent OSHB or dictionary cards, and no 404.
- **Faithful rendering:** RTL Hebrew word order with LTR transliteration/gloss;
  complete Strong's lists; supplied morphology verbatim; intentional blanks stay
  blank; a missing gloss is an explicit, distinct marker that never falls back to
  dictionary prose; verified variant notes show the exact OSHB Ketiv/Qere.
- **Caches:** raw HTML stays ignored/local. Runtime files are uniquely named and
  route through the **existing `maranatha-data-v3` cache**; `DATA_CACHE_VERSION`
  stays **v3** so users' already-downloaded translations and Berean Greek books
  are not invalidated. Only the shell version was bumped (`CACHE_VERSION`
  v32→v33). Because these files live at cache-first URLs, both the **manifest**
  (`manifest-v2.js`) and the **changed GEN chunk** (`GEN-v2.js`, which gained the
  five newly-resolved Genesis variants) are versioned; the manifest publishes
  each book's current filename in `chunkFiles`, and the app builds the script URL
  from it. Unchanged chunks (`EXO.js` is new; `DAN.js`/`MAL.js` are byte-identical
  to the Genesis milestone) keep their names. The legacy `manifest.js`,
  `GEN.js` / `berean-hebrew-pilot.js` entries are retained (never wiped) but no
  longer requested.

### Fresh checkout / ignored cache

`npm test` includes the Hebrew tooling. The extraction-dependent checks
(validator, comparator, variants, tooling tests' cache replay) need the ignored
local cache. On a checkout without those pages they **skip with a clear
explanation and recovery command** (they never download anything):

```
node build/tools/berean-hebrew-fetch.mjs
```

The generated fixture, variants, runtime data, `--check` commands, the
service-worker test and the app-preview tests all work without the raw cache.
