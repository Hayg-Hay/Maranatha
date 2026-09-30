# Berean Hebrew interlinear — Genesis–Numbers local preview (Bible Hub)

This directory holds a **read-only local preview** of the Berean Interlinear
Bible (BIB) Hebrew Old Testament extracted from Bible Hub. It covers **Genesis
(50), Exodus (40), Leviticus (27) and Numbers (36)**, plus the retained
**Daniel 2:4–5** and **Malachi 4:5–6** records from the accepted pilot. The
generated runtime files under `data/berean-hebrew/` are what the app loads.

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

Covered pages (155 total, cached 2026‑09‑30):

| Covered | URL pattern | Edition label |
|---|---|---|
| Genesis 1–50 | `https://biblehub.com/interlinear/genesis/<n>.htm` | BIB |
| Exodus 1–40 | `https://biblehub.com/interlinear/exodus/<n>.htm` | BIB |
| Leviticus 1–27 | `https://biblehub.com/interlinear/leviticus/<n>.htm` | BIB |
| Numbers 1–36 | `https://biblehub.com/interlinear/numbers/<n>.htm` | BIB |
| Daniel 2 | `https://biblehub.com/interlinear/daniel/2.htm` | BIB |
| Malachi 4 | `https://biblehub.com/interlinear/malachi/4.htm` | BIB |

The breadcrumb parent is **BSB** (Berean Study Bible), the same translation
committee named in the footer.

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
committed**). `source-manifest.json` **is committed**: it records URL,
book/chapter, retrieval date, HTTP status, byte length, sha256 and the
title/breadcrumb/footer evidence for all 155 pages. The loader honours a 3-second
delay between live requests, one request per page, a descriptive user agent,
abort-on-block, resumable successes, atomic page/manifest replacement, manifest
preservation and reuse of unchanged pages (original retrieval dates kept). A page
whose bytes no longer match its hash is reported CORRUPT and never silently
re-trusted.

## 4. Tooling

| Script | Purpose |
|---|---|
| `build/tools/berean-hebrew-fetch.mjs` | Crash-safe downloader. `--list`, `--refresh`, `--only <book>`, `--chapters <list>`. Network only. |
| `build/tools/berean-hebrew-extract.mjs` | Offline parser + fixture builder. `build`, `dump <BOOK> <ch> <v>`. Verifies each page sha256 before parsing. |
| `build/tools/berean-hebrew-variants.mjs` | Generates `variants.json`: verifies Ketiv/Qere against the OSHB XML explicit structure (context + fingerprints; multiword cases left uncertain). `--check`. |
| `build/tools/berean-hebrew-validate.mjs` | Offline coverage/totals/anomaly/variant/fingerprint validation + missing-gloss audit. |
| `build/tools/berean-hebrew-compare.mjs` | **Independent** DOM-based (jsdom) re-read of every cached page, compared record-by-record. |
| `build/tools/berean-hebrew-tests.mjs` | Offline tooling + matcher tests (fetch recovery, safeguards, parser edge cases, fingerprints). |
| `build/import-berean-hebrew.mjs` | Builds the runtime manifest + per-book chunks from the fixture. `--check`. |
| `build/test-service-worker.mjs` | Proves a shell-cache update preserves `maranatha-data-v3` and all cached files. |
| `build/test-berean-hebrew.mjs` | jsdom runtime tests for the local preview. |

```bash
node build/tools/berean-hebrew-fetch.mjs --list          # print the 155 URLs, no network
node build/tools/berean-hebrew-fetch.mjs                 # fetch missing chapters (resumable)
node build/tools/berean-hebrew-extract.mjs build          # regenerate hebrew.fixture.json
node build/tools/berean-hebrew-variants.mjs               # regenerate variants.json
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
  `token-before-first-verse`, `unsupported-token-structure`,
  `no-transliteration-span`, `no-morphology-span`, `no-gloss-span`, multi-* spans,
  and `stale-variant-fingerprint`. **The build refuses to overwrite accepted
  output while any structural error exists.**
- **source-gap** (legitimate source omissions, explicit nulls + diagnostics):
  `missing-strongs`, `missing-gloss`, `missing-transliteration`,
  `missing-morphology`. Empty spans are gaps; **absent** spans are structural.
- **info**: `multi-strongs` (all numbers retained).

## 6. Record counts (actual, from the extracted records)

| Book | Chapters | Verses | Records |
|---|---|---|---|
| Genesis | 50 | 1533 | 20613 |
| Exodus | 40 | 1213 | 16713 |
| Leviticus | 27 | 859 | 11950 |
| Numbers | 36 | 1288 | 16412 |
| Daniel 2:4–5 | 1 | 2 | 29 |
| Malachi 4:5–6 | 1 | 2 | 28 |
| **Total** | **155** | **4897** | **65745** |

- Intentional untranslated `-` markers: **2188**.
- Missing (empty) gloss records among the extracted verses: **16** (see §7).
- Records with no Strong's: **1310**; empty transliteration: **2**; empty
  morphology: **28**.
- Genesis, Exodus, Leviticus and Numbers chapter/verse coverage match
  Maranatha's canon exactly (0 mismatches).

### Missing-gloss audit

`berean-hebrew-validate.mjs` prints every missing-gloss record with its reference,
surface and morphology, and classifies object markers vs substantive words.

- **15 of 16 are direct-object markers** (`אֵת` / `אֶת־`, H853, `DirObjM`) —
  the source simply leaves them blank. The seven Numbers ones are:
  `NUM 4:5 #11 אֵת`, `NUM 10:7 #1 אֶת־`, `NUM 14:41 #6 אֶת־`,
  `NUM 18:29 #9 אֶֽת־`, `NUM 22:5 #22 אֶת־`, `NUM 22:11 #5 אֶת־`,
  `NUM 32:38 #11 אֶת־`.
- **1 is substantive and flagged for review: `LEV 18:4 #4 חֻקֹּתַי` (H2708,
  `N-fpc ¦ 1cs`)** — a real word with no supplied gloss. It is preserved as an
  explicit null (unchanged), never substituted.

None are silently filled; the app shows a distinct "(no gloss in source)" marker.

## 7. Ketiv/Qere findings (verified against the OSHB XML)

`variants.json` is generated by `berean-hebrew-variants.mjs`, which reads the
**OSHB XML's explicit `<w type="x-ketiv">` / `<rdg type="x-qere">` structure** and
matches source records by **consonant skeleton for the same verse**, using the
**preceding-word context** when both readings appear as distinct words, and the
OSHB `KJV:` note for versification differences. Strong's and vowel-point
comparison are recorded as `evidence`, never the sole key. **Every verified entry
carries a source-record fingerprint**; the extractor refuses (structural
`stale-variant-fingerprint`) to attach an annotation whose fingerprint does not
match — so a stale table can never attach to a changed token just because its
index stayed the same.

- **42 verified variants** (all display the **written (Ketiv)** form, as Bible
  Hub does): Genesis 15, Exodus 11, Leviticus 5, **Numbers 9**, Daniel 2.
  Numbers pairs: `NUM 1:16`, `12:3`, `14:36`, `16:11`, `21:32`, `23:13`, `26:9`,
  `32:7`, `34:4` (no versification remap needed).
- **2 uncertain, left unattached:** `GEN 30:11` and `EXO 4:2` are **multiword
  Qere** structures (Ketiv one word vs Qere two words, e.g. `בָּא גָּד`) that the
  one-record model cannot represent. They are documented and skipped rather than
  forced.
- The app shows each verified variant's exact OSHB Ketiv and Qere as isolated RTL
  spans, labelled "OSHB comparison (not supplied by Berean)".

### Matcher tests

`build/tools/berean-hebrew-tests.mjs` covers: preceding-word context resolving
two candidate occurrences; a Strong's mismatch not changing a verified letter
match; identical consonant skeletons staying ambiguous; ambiguous repeated words
staying unresolved; OSHB→English verse mapping; and a **multiword Qere staying
unresolved** rather than forced into one record.

## 8. Divine name & technical vocabulary

The source's own convention is preserved, **not standardized**: `יְהוָה`
(H3068) is transliterated **`Yah·weh`** and glossed **`YHWH`** (sometimes "of
YHWH" / "to YHWH" contextually) across Genesis through Numbers. Sacrificial,
purity and census terms (`עֹלָה` "burnt offering", `חַטָּאת` "sin offering",
`שֶׁקֶץ` "detestable", `פִּקּוּדֵי` "numbered", …) are reproduced exactly as
supplied. Genesis 1:1 glosses remain exactly
`In the beginning / created / God / (blank) / the heavens / and / the earth`.

## 9. Validation and fidelity

```bash
node build/tools/berean-hebrew-tests.mjs              # 32 tooling/matcher tests
node build/tools/berean-hebrew-variants.mjs --check
node build/tools/berean-hebrew-validate.mjs           # 46 checks
node build/tools/berean-hebrew-compare.mjs            # independent DOM comparison
node build/import-berean-hebrew.mjs --check
node build/test-service-worker.mjs                    # 21 checks
node build/test-berean-hebrew.mjs                     # 90 runtime checks
```

**Deterministic regeneration** (fixture, variants, runtime) proves
*reproducibility*. Independent *fidelity* comes from
`berean-hebrew-compare.mjs`, a separate jsdom DOM reader that does **not** import
the extractor's parser. It **reuses one jsdom window** (parsing each page with its
`DOMParser` and returning only plain records) and closes it in a `finally` block,
so memory stays flat rather than leaking a window per page. It re-reads all 155
cached pages and agrees with the fixture on **every one of the 65,745 records**
(references, counts/order, surface, transliteration, gloss, morphology, complete
Strong's lists), and confirms canon coverage for Genesis, Exodus, Leviticus and
Numbers.

## 10. Remaining limitations

1. **Licence scope** — the CC0 text dedication is established, but the
   third-party-derived morphology/Strong's/lexical fields are unresolved; raw
   pages stay local.
2. **Draft volatility** — every page is date-stamped and expected to churn.
3. **Missing fields** — 1310 no-Strong's, 2 no-transliteration, 28 no-morphology
   and 16 no-gloss records are genuine source gaps shown as explicit blanks; one
   (`LEV 18:4`) is substantive and needs review.
4. **Ketiv/Qere** — the source shows only one form; two multiword cases are
   unresolved, and new OSHB pairs may appear as upstream changes.
5. **Own interlinear** — Berean Hebrew is its own interlinear, never
   positionally aligned onto OSHB.
6. **Scope** — Genesis through Numbers only, plus the retained Daniel/Malachi
   verses.

## 11. Local app preview

- **Runtime data:** `data/berean-hebrew/manifest-v4.js`
  (`MARANATHA_BEREAN_HEBREW_MANIFEST`) plus one chunk per book
  (`GEN-v3.js`, `EXO-v2.js`, `LEV.js`, `NUM.js`, `DAN.js`, `MAL.js`). Generated
  deterministically from the fixture by `build/import-berean-hebrew.mjs`.
- **Selection:** tick **"Berean Hebrew (Genesis–Numbers, draft)"** under *Study
  tools* and choose **Reading** (dense cards) or **Study** (expandable). It is
  mutually exclusive with OSHB Hebrew; OSHB and both Greek interlinears behave
  exactly as before.
- **Coverage:** Genesis 1–50, Exodus 1–40, Leviticus 1–27 and Numbers 1–36, plus
  Daniel 2:4–5 and Malachi 4:5–6. Verses/chapters outside that (including other
  books) show a concise coverage notice — never silent OSHB or dictionary cards,
  and no 404.
- **Faithful rendering:** RTL Hebrew word order with LTR transliteration/gloss;
  complete Strong's lists; supplied morphology verbatim; intentional blanks stay
  blank; a missing gloss is an explicit, distinct marker that never falls back to
  dictionary prose; verified variant notes show the exact OSHB Ketiv/Qere.
- **Caches:** raw HTML stays ignored/local. Runtime files route through the
  **existing `maranatha-data-v3` cache**; `DATA_CACHE_VERSION` stays **v3** so
  users' already-downloaded translations and Berean Greek books are not
  invalidated. Only the shell version was bumped (`CACHE_VERSION` v34→v35).
  Because these files live at cache-first URLs, the **manifest** is versioned
  (`manifest-v4.js`) and publishes each book's filename in `chunkFiles`. Changed
  chunks are re-versioned: `GEN-v3.js` and `EXO-v2.js` (each lost one multiword
  case from its verified set); `NUM.js` is new; `LEV.js`/`DAN.js`/`MAL.js` are
  byte-identical to the previous milestone. A chunk is loaded only when its book
  is viewed. Legacy `manifest*.js`/`GEN.js`/`GEN-v2.js`/`EXO.js`/
  `berean-hebrew-pilot.js` entries are retained (never wiped) but no longer
  requested.

### Fresh checkout / ignored cache

`npm test` includes the Hebrew tooling. The extraction-dependent checks
(validator, comparator, variants, tooling tests' cache replay, the `buildFixture`
tests) need the ignored local cache. On a checkout without those pages they
**skip with a clear explanation and recovery command** (they never download
anything):

```
node build/tools/berean-hebrew-fetch.mjs
```

The generated fixture, variants, runtime data, `--check` commands, the
service-worker test and the app-preview tests all work without the raw cache.
