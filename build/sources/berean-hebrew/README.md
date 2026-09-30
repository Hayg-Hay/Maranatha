# Berean Hebrew interlinear — Torah local preview (Bible Hub)

This directory holds a **read-only local preview** of the Berean Interlinear
Bible (BIB) Hebrew Old Testament extracted from Bible Hub. It covers the five
books of the **Torah — Genesis (50), Exodus (40), Leviticus (27), Numbers (36)
and Deuteronomy (34)** — plus the retained **Daniel 2:4–5** and **Malachi
4:5–6** records from the accepted pilot. The generated runtime files under
`data/berean-hebrew/` are what the app loads.

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

Covered pages (189 total, cached 2026‑09‑30):

| Covered | URL pattern | Edition label |
|---|---|---|
| Genesis 1–50 | `https://biblehub.com/interlinear/genesis/<n>.htm` | BIB |
| Exodus 1–40 | `https://biblehub.com/interlinear/exodus/<n>.htm` | BIB |
| Leviticus 1–27 | `https://biblehub.com/interlinear/leviticus/<n>.htm` | BIB |
| Numbers 1–36 | `https://biblehub.com/interlinear/numbers/<n>.htm` | BIB |
| Deuteronomy 1–34 | `https://biblehub.com/interlinear/deuteronomy/<n>.htm` | BIB |
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
title/breadcrumb/footer evidence for all 189 pages. The loader honours a 3-second
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
node build/tools/berean-hebrew-fetch.mjs --list          # print the 189 URLs, no network
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
| Deuteronomy | 34 | 959 | 14294 |
| **Torah subtotal** | **187** | **5852** | **79982** |
| Daniel 2:4–5 | 1 | 2 | 29 |
| Malachi 4:5–6 | 1 | 2 | 28 |
| **Total** | **189** | **5856** | **80039** |

- Intentional untranslated `-` markers: **2619**.
- Missing (empty) gloss records among the extracted verses: **21** (see §7).
- Records with no Strong's: **1761**; empty transliteration: **2**; empty
  morphology: **34**.
- All five Torah books' chapter/verse coverage match Maranatha's canon exactly
  (0 mismatches).

### Missing-gloss audit

`berean-hebrew-validate.mjs` prints every missing-gloss record with its reference,
surface and morphology, and classifies object markers vs substantive words.

- **18 of 21 are direct-object markers** (`אֵת` / `אֶת־`, H853, `DirObjM`) —
  the source simply leaves them blank. The five Deuteronomy ones are:
  `DEU 5:29 #9 אֶת־` (H853), `DEU 11:27 #0 אֶֽת־`, `DEU 28:21 #3 אֶת־`
  (plus the earlier Exodus/Leviticus/Numbers ones listed by the validator).
- **3 are substantive and flagged for review**, each preserved as an explicit
  null (unchanged), never substituted:
  `LEV 18:4 #4 חֻקֹּתַי` (H2708, `N-fpc ¦ 1cs`);
  `DEU 4:42 #18 מִן־` (H4480, `Prep`);
  `DEU 5:29 #5 לָהֶ֗ם` (no Strong's, `Prep-l ¦ V-Qal-Inf ¦ 3fs`).

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

- **65 verified variants** (all display the **written (Ketiv)** form, as Bible
  Hub does): Genesis 15, Exodus 11, Leviticus 5, Numbers 9, **Deuteronomy 23**,
  Daniel 2. The 23 Deuteronomy pairs are `DEU 2:33`, `7:9`, `8:2`, `13:15`,
  `21:7`, `22:15` (×2), `22:16`, `22:20`, `22:21`, `22:23`, `22:24`, `22:25`,
  `22:26` (×2), `22:27`, `22:28`, `22:29`, `28:27`, `28:30`, `29:23`, `32:13`,
  `33:9` (no versification remap needed).
- **4 uncertain, left unattached:**
  `GEN 30:11` and `EXO 4:2` remain the two deferred **multiword Qere**
  structures (Ketiv one word vs Qere two words, e.g. `בָּא גָּד`);
  `DEU 33:2` is a third multiword Qere (`אֵשׁ דָּת`); and `DEU 5:10` is unmatched
  because Bible Hub's own surface carries a trailing **setumah paragraph marker**
  (`מִצְוֹתוֹ׃ס`), so its consonant skeleton ends in `ס` and does not equal the
  OSHB Ketiv `מצות/ו`. All four are documented and skipped rather than forced —
  the marker is never truncated and no reading is invented.
- The app shows each verified variant's exact OSHB Ketiv and Qere as isolated RTL
  spans, labelled "OSHB comparison (not supplied by Berean)".

### Matcher tests

`build/tools/berean-hebrew-tests.mjs` covers: preceding-word context resolving
two candidate occurrences; a Strong's mismatch not changing a verified letter
match; identical consonant skeletons staying ambiguous; ambiguous repeated words
staying unresolved; OSHB→English verse mapping; a **multiword Qere staying
unresolved** rather than forced into one record; a surface carrying a Bible Hub
**paragraph marker** (setumah/petuchah) not falsely matching the unmarked Ketiv;
and a **Deuteronomy multiword Qere** staying unresolved. A cache-backed test also
asserts Deuteronomy yields 23 verified pairs with exactly 2 documented uncertain
cases.

## 8. Divine name & technical vocabulary

The source's own convention is preserved, **not standardized**: `יְהוָה`
(H3068) is transliterated **`Yah·weh`** and glossed **`YHWH`** (sometimes "of
YHWH" / "to YHWH" contextually) across Genesis through Deuteronomy. Sacrificial,
purity and census terms (`עֹלָה` "burnt offering", `חַטָּאת` "sin offering",
`שֶׁקֶץ` "detestable", `פִּקּוּדֵי` "numbered", …) are reproduced exactly as
supplied. Genesis 1:1 glosses remain exactly
`In the beginning / created / God / (blank) / the heavens / and / the earth`.

## 9. Validation and fidelity

```bash
node build/tools/berean-hebrew-tests.mjs              # 35 tooling/matcher tests
node build/tools/berean-hebrew-variants.mjs --check
node build/tools/berean-hebrew-validate.mjs           # 57 checks
node build/tools/berean-hebrew-compare.mjs            # independent DOM comparison
node build/import-berean-hebrew.mjs --check
node build/test-service-worker.mjs                    # 21 checks
node build/test-berean-hebrew.mjs                     # 114 runtime checks
```

**Deterministic regeneration** (fixture, variants, runtime) proves
*reproducibility*. Independent *fidelity* comes from
`berean-hebrew-compare.mjs`, a separate jsdom DOM reader that does **not** import
the extractor's parser. It **reuses one jsdom window** (parsing each page with its
`DOMParser` and returning only plain records) and closes it in a `finally` block,
so memory stays flat rather than leaking a window per page. It re-reads all 189
cached pages and agrees with the fixture on **every one of the 80,039 records**
(references, counts/order, surface, transliteration, gloss, morphology, complete
Strong's lists), and confirms canon coverage for Genesis, Exodus, Leviticus,
Numbers and Deuteronomy.

## 10. Remaining limitations

1. **Licence scope** — the CC0 text dedication is established, but the
   third-party-derived morphology/Strong's/lexical fields are unresolved; raw
   pages stay local.
2. **Draft volatility** — every page is date-stamped and expected to churn.
3. **Missing fields** — 1761 no-Strong's, 2 no-transliteration, 34 no-morphology
   and 21 no-gloss records are genuine source gaps shown as explicit blanks;
   three (`LEV 18:4`, `DEU 4:42`, `DEU 5:29`) are substantive and need review.
4. **Ketiv/Qere** — the source shows only one form; two deferred multiword cases
   plus a third Deuteronomy multiword case and one paragraph-marker mismatch
   (`DEU 5:10`) are unresolved, and new OSHB pairs may appear as upstream
   changes.
5. **Own interlinear** — Berean Hebrew is its own interlinear, never
   positionally aligned onto OSHB.
6. **Scope** — the five books of the Torah (Genesis through Deuteronomy), plus
   the retained Daniel/Malachi samples. Nothing beyond the Torah is covered.

## 11. Local app preview

- **Runtime data:** `data/berean-hebrew/manifest-v5.js`
  (`MARANATHA_BEREAN_HEBREW_MANIFEST`) plus one chunk per book
  (`GEN-v3.js`, `EXO-v2.js`, `LEV.js`, `NUM.js`, `DEU.js`, `DAN.js`, `MAL.js`).
  Generated deterministically from the fixture by
  `build/import-berean-hebrew.mjs`.
- **Selection:** tick **"Berean Hebrew (Torah, draft)"** under *Study tools* and
  choose **Reading** (dense cards) or **Study** (expandable). It is mutually
  exclusive with OSHB Hebrew; OSHB and both Greek interlinears behave exactly as
  before.
- **Coverage:** the five Torah books — Genesis 1–50, Exodus 1–40, Leviticus
  1–27, Numbers 1–36 and Deuteronomy 1–34 — plus the retained Daniel 2:4–5 and
  Malachi 4:5–6 samples. Verses/chapters outside that (including other books)
  show a concise coverage notice — never silent OSHB or dictionary cards, and no
  404.
- **Faithful rendering:** RTL Hebrew word order with LTR transliteration/gloss;
  complete Strong's lists; supplied morphology verbatim; intentional blanks stay
  blank; a missing gloss is an explicit, distinct marker that never falls back to
  dictionary prose; verified variant notes show the exact OSHB Ketiv/Qere.
- **Caches:** raw HTML stays ignored/local. Runtime files route through the
  **existing `maranatha-data-v3` cache**; `DATA_CACHE_VERSION` stays **v3** so
  users' already-downloaded translations and Berean Greek books are not
  invalidated. Only the shell version was bumped (`CACHE_VERSION` v35→v36).
  Because these files live at cache-first URLs, the **manifest** is versioned
  (`manifest-v5.js`) and publishes each book's filename in `chunkFiles`. This
  milestone only ADDS a book: `DEU.js` is new, while `GEN-v3.js`, `EXO-v2.js`,
  `LEV.js`, `NUM.js`, `DAN.js` and `MAL.js` are byte-identical to the previous
  milestone (their filenames are unchanged, so no needless re-download). A chunk
  is loaded only when its book is viewed. Legacy `manifest*.js`/`GEN.js`/
  `GEN-v2.js`/`EXO.js`/`berean-hebrew-pilot.js` entries are retained (never
  wiped) but no longer requested.

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
