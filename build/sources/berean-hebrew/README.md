# Berean Hebrew interlinear — Genesis local preview (Bible Hub)

This directory holds a **read-only local preview** of the Berean Interlinear
Bible (BIB) Hebrew Old Testament extracted from Bible Hub. It covers **all 50
chapters of Genesis**, plus the retained **Daniel 2:4–5** and **Malachi 4:5–6**
records from the accepted pilot. Nothing here is loaded by `app.js` directly;
the generated runtime files under `data/berean-hebrew/` are.

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

Covered pages (52 total, cached 2026‑09‑30):

| Covered | URL pattern | Edition label |
|---|---|---|
| Genesis 1–50 | `https://biblehub.com/interlinear/genesis/<n>.htm` | BIB |
| Daniel 2 | `https://biblehub.com/interlinear/daniel/2.htm` | BIB |
| Malachi 4 | `https://biblehub.com/interlinear/malachi/4.htm` | BIB |

The breadcrumb parent is **BSB** (Berean Study Bible), the same translation
committee named in the footer. The underlying Hebrew surface for the pilot
passages matches OSHB/WLC; the Berean contribution is the contextual gloss and
alignment. The pages print no machine-readable edition/revision, so identity
rests on the footer, the BSB breadcrumb, and the title check.

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
length, sha256 and the title/breadcrumb/footer evidence for all 52 pages. The
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
| `build/tools/berean-hebrew-variants.mjs` | Generates `variants.json`: verifies Ketiv/Qere correspondences against the OSHB XML explicit structure. `--check`. |
| `build/tools/berean-hebrew-validate.mjs` | Offline coverage/totals/anomaly/variant validation of the fixture. |
| `build/tools/berean-hebrew-compare.mjs` | **Independent** DOM-based (jsdom) re-read of every cached page, compared record-by-record to the fixture. |
| `build/tools/berean-hebrew-tests.mjs` | Offline tooling tests (fetch recovery, hash/no-table safeguards, parser edge cases). |
| `build/import-berean-hebrew.mjs` | Builds the runtime manifest + per-book chunks from the fixture. `--check`. |
| `build/test-service-worker.mjs` | Proves a shell-cache update preserves the existing `maranatha-data-v3` cache and its files. |
| `build/test-berean-hebrew.mjs` | jsdom runtime tests for the local preview. |

```bash
node build/tools/berean-hebrew-fetch.mjs                 # fetch missing chapters (resumable)
node build/tools/berean-hebrew-fetch.mjs --list          # print the 52 URLs, no network
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
  `no-morphology-span`, `no-gloss-span`, and multi-* spans. **The build refuses to
  overwrite accepted output while any structural error exists.**
- **source-gap** (legitimate source omissions, explicit nulls + diagnostics):
  `missing-strongs`, `missing-gloss`, `missing-transliteration`,
  `missing-morphology`. Empty spans are gaps; **absent** spans are structural.
- **info**: `multi-strongs` (all numbers retained).

### Verse detection

Bible Hub marks the first word of each verse with `ref…` spans; the extractor keys
off those (the `<A name="N">` anchors are offset by +1 and are ignored).

## 6. Record counts (actual, from the extracted records)

| Book | Chapters | Verses | Records |
|---|---|---|---|
| Genesis | 50 | 1533 | 20613 |
| Daniel 2:4–5 | 1 | 2 | 29 |
| Malachi 4:5–6 | 1 | 2 | 28 |
| **Total** | **52** | **1537** | **20670** |

- Intentional untranslated `-` markers: **654**.
- Missing (empty) gloss records among the extracted verses: **0** (six empty
  glosses exist elsewhere on the cached Daniel 2 page and stay missing).
- Records with no Strong's: **474** (mostly pronominal suffixes / compound-name
  components) → `strongsList: []`, `strongs: null`.
- Records with empty transliteration: **1** (Genesis 14:17 "laomer").
- Records with empty morphology: **16** (compound-name components, e.g. Gen 50:11
  "Abel-", Gen 41:45 "Zaphenath-").
- Genesis chapter/verse coverage matches Maranatha's canon exactly (0 mismatches).

## 7. Ketiv/Qere findings (verified against the OSHB XML)

`variants.json` is generated by `berean-hebrew-variants.mjs`, which reads the
**OSHB XML's explicit `<w type="x-ketiv">` / `<rdg type="x-qere">` structure** and
matches source records by **consonant skeleton for the same verse** — never by
position or Strong's alone. Strong's is recorded only as corroboration.

- **13 verified variants** (all display the **written (Ketiv)** form, as Bible
  Hub does), including **Genesis 8:17** (source `הוֹצֵא`; OSHB Ketiv `הוצא`,
  Qere `הַיְצֵ֣א`) and the two Daniel records.
- **5 uncertain cases** recorded for review and deliberately **not** attached:
  - `GEN 27:29` — Ketiv and Qere share a consonant skeleton (ambiguous).
  - `GEN 27:3`, `GEN 30:11`, `GEN 36:5`, `GEN 36:14` — the displayed form matches
    the OSHB Ketiv skeleton, but the source's own Strong's number matches the
    *other* reading's lemma; the reading is not silently asserted.

The app shows each verified variant's exact OSHB Ketiv and Qere as isolated RTL
spans, clearly labelled "OSHB comparison (not supplied by Berean)". Berean's own
surface, transliteration, gloss and alignment are unchanged and no second reading
word is added.

## 8. Divine name & Genesis 1:1

The source's own convention is preserved, **not standardized**. The divine name
`יְהוָה` (H3068) is transliterated **`Yah·weh`** and glossed **`YHWH`** — so a
verse caption (e.g. WEB's "the LORD God") and the Berean card ("YHWH") may
legitimately differ. Genesis 1:1 glosses are exactly
`In the beginning / created / God / (blank) / the heavens / and / the earth`.

## 9. Validation and fidelity

```bash
node build/tools/berean-hebrew-tests.mjs              # 24 tooling tests
node build/tools/berean-hebrew-variants.mjs --check
node build/tools/berean-hebrew-validate.mjs           # 28 checks
node build/tools/berean-hebrew-compare.mjs            # independent DOM comparison
node build/import-berean-hebrew.mjs --check
node build/test-service-worker.mjs                    # 16 checks
node build/test-berean-hebrew.mjs                     # 63 runtime checks
```

**Deterministic regeneration** (fixture, variants, runtime) proves
*reproducibility*. Independent *fidelity* comes from
`berean-hebrew-compare.mjs`, a separate jsdom DOM reader that does **not** import
the extractor's parser: it re-reads all 52 cached pages and agrees with the
fixture on **every one of the 20,670 records** (references, counts/order,
surface, transliteration, gloss, morphology and the complete Strong's list), and
confirms canon coverage. The app-level behavior is covered by the 63 runtime
checks (coverage, counts, Genesis 1:1, divine name, Genesis 8:17 variant,
Genesis 50 navigation, retained Daniel/Malachi, uncovered-book notice,
loading failure, Reading/Study, OSHB/Greek unchanged, file://).

## 10. Remaining limitations

1. **Licence scope** — the CC0 text dedication is established, but the
   third-party-derived morphology/Strong's/lexical fields are unresolved; raw
   pages stay local.
2. **Draft volatility** — every page is date-stamped and expected to churn.
3. **Ketiv/Qere** — the source shows only one form; 5 Genesis cases need review.
4. **Missing fields** — 474 no-Strong's, 1 no-transliteration and 16
   no-morphology records are genuine source gaps shown as explicit blanks.
5. **Own interlinear** — Berean Hebrew is its own interlinear, never
   positionally aligned onto OSHB.
6. **Scope** — Genesis only, plus the retained Daniel/Malachi verses. No other
   book is imported.

## 11. Local app preview

- **Runtime data:** `data/berean-hebrew/manifest.js`
  (`MARANATHA_BEREAN_HEBREW_MANIFEST`) plus one chunk per book
  (`data/berean-hebrew/GEN.js`, `DAN.js`, `MAL.js`; globals
  `MARANATHA_BEREAN_HEBREW_<BOOK>`). Generated deterministically from the fixture
  by `build/import-berean-hebrew.mjs`; per-book chunks mean future OT expansion
  never loads the whole corpus. Total ≈ 3.96 MB (GEN ≈ 3.9 MB).
- **Selection:** tick **"Berean Hebrew (Genesis, draft)"** under *Study tools* and
  choose **Reading** (dense cards) or **Study** (expandable). It is mutually
  exclusive with OSHB Hebrew; OSHB and both Greek interlinears behave exactly as
  before.
- **Coverage:** Genesis 1–50 plus Daniel 2:4–5 and Malachi 4:5–6. Verses/chapters
  outside that (including other books) show a concise coverage notice — never
  silent OSHB or dictionary cards, and no 404 for uncovered books.
- **Faithful rendering:** RTL Hebrew word order with LTR transliteration/gloss;
  complete Strong's lists (empty when the source gives none); supplied morphology
  verbatim; intentional blanks stay blank; a missing gloss is an explicit,
  distinct marker that never falls back to dictionary prose; verified variant
  notes show the exact OSHB Ketiv/Qere.
- **Caches:** raw HTML stays ignored/local. The new runtime files are uniquely
  named (`data/berean-hebrew/…`) and route through the **existing
  `maranatha-data-v3` cache** on first load; `DATA_CACHE_VERSION` stays **v3** so
  users' already-downloaded translations and Berean Greek books are not
  invalidated. Only the shell version was bumped (`CACHE_VERSION` v31→v32). The
  legacy `data/berean-hebrew-pilot.js` is removed, so an old cached pilot cannot
  hide the expanded coverage (the app requests the new URLs).

### Fresh checkout / ignored cache

`npm test` includes the Hebrew tooling. The three extraction-dependent checks
(validator, comparator, tooling tests' cache replay) need the ignored local
cache. On a checkout without those pages they **skip with a clear explanation
and recovery command** (they never download anything):

```
node build/tools/berean-hebrew-fetch.mjs
```

The generated fixture, variants, runtime data, `--check` commands, the
service-worker test and the app-preview tests all work without the raw cache.
