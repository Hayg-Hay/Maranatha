# Berean Hebrew interlinear pilot (Bible Hub) — extraction inspection

This directory holds a **read-only pilot** for extracting the Berean Interlinear
Bible (BIB) Hebrew Old Testament from Bible Hub. Nothing here is loaded by
`app.js`, written into `data/`, or used at runtime. No whole-OT data was
downloaded. Only three chapters (Genesis 1, Daniel 2, Malachi 4) are cached
locally, and only nine verses are extracted.

The pilot answers one question before any expansion is authorised: does Bible
Hub's Berean Hebrew interlinear preserve a reliable, per-word association
between Hebrew/Aramaic surface, transliteration, morphology, Strong's number,
contextual English gloss, verse reference, and token order — and can those
fields be extracted reproducibly and audited?

> **Status:** uncommitted work-in-progress on branch `codex/berean-hebrew-pilot`,
> awaiting supervisor review. "Local"/"cached" below means on disk, not in git
> history.

## 1. Source identity (established, not assumed)

The pilot deliberately checked *which* Bible Hub page actually carries the Berean
draft. Bible Hub hosts several Hebrew-related pages; the word-by-word interlinear
under `/interlinear/` is the one that self-identifies as Berean.

| Page | URL | `<title>` | Breadcrumb | Footer evidence |
|---|---|---|---|---|
| Genesis 1 | https://biblehub.com/interlinear/genesis/1.htm | `Genesis 1 Interlinear Bible` | `Bible > BSB > Genesis 1` | BIB |
| Daniel 2 | https://biblehub.com/interlinear/daniel/2.htm | `Daniel 2 Interlinear Bible` | `Bible > BSB > Daniel 2` | BIB |
| Malachi 4 | https://biblehub.com/interlinear/malachi/4.htm | `Malachi 4 Interlinear Bible` | `Bible > BSB > Malachi 4` | BIB |

**All three cached pages** carry the same visible footer (accessed/cached
2026‑09‑30):

> **Berean Interlinear Bible (BIB).** Produced in cooperation with Bible Hub,
> Discovery Bible, unfoldingWord, Bible Aquifer, OpenBible.com, and the Berean
> Bible Translation Committee.

Supporting evidence:

- The breadcrumb parent is **BSB** (Berean Study Bible), the same translation
  committee named in the footer.
- **Limited to the single passage actually compared:** for Genesis 1:1 only, the
  Hebrew surface/vocalisation on the page matches OSHB (WLC) after stripping
  punctuation (validator check). This does **not** establish corpus-wide edition
  identity — it shows that for the one inspected passage the Berean contribution
  is the contextual gloss + alignment rather than a different Hebrew text.
- The Berean team's reply (below) directs us to Bible Hub for the current draft.

**Limitation.** The pages print no machine-readable edition string, revision
number, or date. Identity rests on the footer, the BSB breadcrumb, and the
single-passage OSHB agreement.

## 2. Reuse terms (official sources inspected)

Official terms read and recorded on **2026‑09‑30**:

- **https://berean.bible/terms.htm** (accessed 2026‑09‑30) — the official Terms
  and Conditions. It states:

  > "The Berean Bible and Majority Bible texts are officially dedicated to the
  > public domain as of April 30, 2023. All uses are freely permitted."
  >
  > "By definition all public domain materials may be freely reproduced,
  > integrated, and adapted for both free and commercial resources."

  Attribution is requested but not required. The footer credits Bible Hub,
  Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee.

- **https://interlinearbible.com/** (accessed 2026‑09‑30) — the official BIB
  page. It credits the *third-party basis* of the interlinear: "The basis for the
  interlinear text is the **Biblos Interlinear**, developed over several years
  and now refined by the translation committee." It lists the per-word elements
  (text, transliteration, morphology, English gloss, Strong's number, lexical
  definition, punctuation) and notes the full Bible "is under construction."

- **Bible Hub page footers** (the three cached pages, 2026‑09‑30) credit
  "Bible Hub, Discovery Bible, unfoldingWord, Bible Aquifer, OpenBible.com, and
  the Berean Bible Translation Committee."

### Established vs unresolved

**Established:**

- Berean Bible *texts* are dedicated to the public domain (CC0) as of
  2023‑04‑30, with reproduction, integration and adaptation expressly permitted.
  The project already relies on this for the Berean NT import
  (`build/sources/berean-interlinear/README.md`, `data/berean/manifest.js`).
- Programmatic **retrieval** of the current draft from Bible Hub is permitted by
  the Berean team's email (below). This is separate from, and unaffected by, the
  public-domain dedication.

**Reasonably covered (but not stated field-by-field):** the English glosses and
transliteration are integral to the Berean interlinear (listed as a Berean
translation on `berean.bible`) and are the most plausibly covered by the text
dedication.

**Unresolved / for a supervisor or legal call:**

- The BIB page credits the **Biblos Interlinear** as the interlinear's basis, and
  credits other parties (Bible Hub, Discovery Bible, unfoldingWord, Bible
  Aquifer, OpenBible.com). Whether the **morphology tags, Strong's numbers and
  lexical definitions** — which may derive from those third-party datasets — fall
  under Berean's CC0 text dedication is **not stated**. The terms speak of
  "texts", not of every tagged field.
- **The raw Bible Hub page as a whole** (site markup, navigation, ads) is not
  covered by rights to the Bible text.

**Recommendation:** keep the raw HTML caches **local/ignored** (implemented via
`build/sources/berean-hebrew/.gitignore`) and commit the extracted fixture,
annotations, and source-manifest hashes. Do not delete the existing caches.

### Retrieval permission (email)

The Berean team replied (email on file):

> "The interlinear is still in draft mode so we have not set up downloadable
> files as of yet. We will still be correcting and updating. Eventually we will
> be able to offer the full data. However, you are welcome to retrieve the
> current version programmatically as needed from the Bible Hub site."

This email is recorded as **permission to retrieve**, not as the licensing basis
(the terms above are). The data is a **dated draft**. No further email was sent.

## 3. Local cache

Raw pages live in `source-pages/` (kept local, re-fetchable, `.gitignore`d).
`source-manifest.json` records URL, retrieval date, HTTP status, byte length,
sha256, and the page-title/breadcrumb/footer evidence, and **is committed**: it
is the auditable hash record even when the raw HTML is not published.

| Passage | File (local) | Retrieved (UTC) | bytes | sha256 |
|---|---|---|---|---|
| GEN 1 | `source-pages/genesis-1.html` | 2026-09-30T12:37:39Z | 357153 | `fee715db…b7c2` |
| DAN 2 | `source-pages/daniel-2.html` | 2026-09-30T12:37:43Z | 678329 | `5d6f457b…9a9c` |
| MAL 4 | `source-pages/malachi-4.html` | 2026-09-30T12:37:46Z | 81084 | `d384fb23…1d65` |

The downloader honours a 3-second delay between live requests, one request per
page, a descriptive user agent, and abort-on-block (HTTP 401/403/429/503 or
captcha/rate-limit wording). Cached pages are reused unless `--refresh` is given.
The fetcher preserves **all** existing manifest entries, updates an entry only
after a download succeeds and passes validation, writes the page file and the
manifest each through a temp file + rename, and keeps original retrieval dates on
reuse. Those two replacements are **individually atomic, not one transaction**:
an interruption between them can leave a page whose bytes no longer match the
recorded hash. That is detected on the next run (reported CORRUPT and left
untouched, never silently re-trusted) and requires an explicit `--refresh` to
re-establish trust.

## 4. Tooling

| Script | Purpose |
|---|---|
| `build/tools/berean-hebrew-fetch.mjs` | Cached, rate-limited, crash-safe downloader. `--list`, `--refresh`. Network only. |
| `build/tools/berean-hebrew-extract.mjs` | Offline parser + fixture builder. `build`, `dump <BOOK> <ch> <v>`. Verifies each page's sha256 against the manifest before parsing. |
| `build/tools/berean-hebrew-validate.mjs` | Offline validation of the local cache + committed fixture. |
| `build/tools/berean-hebrew-tests.mjs` | Offline tests: simulated fetch recovery, hash/no-table safeguards, parser edge cases. |
| `build/import-berean-hebrew-pilot.mjs` | Builds the runtime data file from the fixture; `--check` verifies it is up to date. |
| `build/test-service-worker.mjs` | Proves activation of the new shell preserves the existing `maranatha-data-v3` cache and its files. |
| `build/test-berean-hebrew-pilot.mjs` | jsdom runtime tests for the local app preview. |

```bash
node build/tools/berean-hebrew-fetch.mjs --list     # show pilot URLs, no network
node build/tools/berean-hebrew-fetch.mjs            # fetch only missing pages
node build/tools/berean-hebrew-extract.mjs build     # regenerate pilot.fixture.json
node build/tools/berean-hebrew-extract.mjs dump GEN 1 1
node build/tools/berean-hebrew-validate.mjs
node build/tools/berean-hebrew-tests.mjs
node build/import-berean-hebrew-pilot.mjs            # write data/berean-hebrew-pilot.js
node build/import-berean-hebrew-pilot.mjs --check    # verify runtime data is current
node build/test-service-worker.mjs                    # data cache survives the shell update
node build/test-berean-hebrew-pilot.mjs              # runtime preview tests
```

## 5. Fields recovered

One record per source alignment token, in Bible Hub's own order:

| Field | Source on the page |
|---|---|
| `order` | document order within the verse (Bible Hub's tokenisation) |
| `surface` | `<span class="hebrew">` text (consonants, niqqud, cantillation, maqqef) |
| `transliteration` | `<span class="translit">` link text |
| `gloss` | `<span class="eng">` text (the contextual English gloss) |
| `morphology` | `/hebrewparse.htm` link text + `title` |
| `strongsList` | **all** Strong's numbers in source order (possibly empty) |
| `strongs` | compatibility singular: the sole number if exactly one, else `null` — it can never hide extras; use `strongsList` for completeness |
| `language` | curated `hebrew`/`aramaic` (page does not label it) |
| `glossStatus` | `translated` / `untranslated` (`-`) / `missing` (empty) |

**Not done, on purpose:** no attachment to OSHB tokens by position, no generated
glosses, no invented Strong's/morphology, no selecting a form when several Hebrew
spans occur, no merging of Ketiv and Qere into consecutive reading words.

### Normalizations (each documented; raw HTML kept for audit)

- `&nbsp;` → plain space; runs of whitespace collapsed.
- U+2011 non-breaking hyphen → `-` (used in morphology labels).
- Empty `<span class="eng"></span>` → `gloss: null`, `glossStatus: "missing"`.
- Deliberate `-` → `gloss: "-"`, `glossStatus: "untranslated"`.
- U+00A6 (`¦`) is the page's own prefix/stem separator; kept in `morphology`
  (`Prep-b ¦ N-fs`) and **never** expected in `surface`.
- Punctuation inside `surface` is preserved as given: maqqef (`־`, U+05BE),
  sof pasuq (`׃`, U+05C3), paseq (`׀`, U+05C0), and the paragraph marker (`פ`)
  glued to the final word (e.g. Genesis 1:5 `אֶחָֽד׃פ`). Prefixes stay fused to
  their word (`בְּרֵאשִׁ֖ית` is one record).

### Anomaly classes

Every diagnostic carries a `class` and `inPilotRange`:

- **`structural`** — ambiguous or failed extraction: `no-surface`,
  `multi-hebrew-span`, `malformed-verse-reference`, `verse-reference-out-of-order`,
  `token-before-first-verse`, `unsupported-token-structure`,
  `multi-transliteration-span`, `multi-morphology-span`, `multi-gloss-span`,
  `no-gloss-span`, `missing-transliteration`, `missing-morphology`. **The fixture
  build refuses to overwrite accepted output while any structural error exists.**
- **`source-gap`** — legitimate source omissions, kept as explicit nulls with
  diagnostics: `missing-gloss` (empty `<span class="eng">`), `missing-strongs`
  (no Strong's link). Missing transliteration/morphology are treated as
  *structural*, because the source supplies them on every observed record.
- **`info`** — valid but notable: `multi-strongs` (all numbers retained).

Anomalies are collected for the **whole cached page** (superset) and tagged with
`inPilotRange`; `totals.pilotRangeSourceGaps` counts those inside the nine
extracted verses.

### Verse detection note

Bible Hub marks the first word of each verse with `ref…` spans whose value is the
true verse number. Its `<A name="N">` anchors are **offset by +1** — the anchor
`name="2"` precedes verse 1, `name="31"` precedes verse 30. The extractor ignores
the anchors and keys off the `ref…` spans (verified against the cached Genesis 1
page).

## 6. Record counts

| Passage | Per-verse records | Total |
|---|---|---|
| Genesis 1:1–5 | 7 / 14 / 6 / 12 / 13 | 52 |
| Daniel 2:4–5 | 12 / 17 | 29 |
| Malachi 4:5–6 | 13 / 15 | 28 |
| **Total** | | **109** |

- Intentional untranslated `-` markers: **4** (all Strong's 853, the direct
  object marker, incl. waw + object marker).
- Missing (empty) glosses **within the pilot verses**: **0**.
- Records with no Strong's: **1** (Malachi 4:5 `לָכֶם`, morphology
  `Prep-l ¦ 2mp`) → `strongsList: []`, `strongs: null`, diagnosed `missing-strongs`.
- Pilot-range source gaps: **1** (that one record). Page-level source gaps across
  the three cached chapters: **31** (25 missing Strong's, 6 empty glosses).

**Source gap seen elsewhere on the cached Daniel 2 page (not in the pilot
range):** six empty-gloss records, all Strong's 1768 (Aramaic relative `דִּי`), in
2:20, 2:25, 2:32, 2:33, 2:34, 2:41. If the pilot expands they must stay missing.

## 7. Daniel: Aramaic and Ketiv/Qere findings

**Aramaic.** Daniel 2:4 is the verse where the text switches from Hebrew to
Aramaic. The page does not label language, so a curated rule is used and
referenced per record (`annotations.json`): records up to and including Strong's
762 (`אֲרָמִית`, "in Aramaic") are Hebrew; after it, Aramaic. Daniel 2:5 is
entirely Aramaic. Verified: 4 Hebrew + 8 Aramaic in 2:4, 17 Aramaic in 2:5.

**Ketiv/Qere — limited to the two records inspected.** Both Daniel pilot verses
contain a written/read variant in the underlying text. For **these two records
only**, Bible Hub presents a single surface with no K/Q marker:

| Ref | Strong's | Page surface (single form) | OSHB Ketiv | OSHB Qere |
|---|---|---|---|---|
| Daniel 2:4 | H5649 | `לְעַבְדַּיִךְ` "to your servants" | `ל/עבדי/ך` | `לְ/עַבְדָ֖/ךְ` |
| Daniel 2:5 | H3779 | `לְכַשְׂדָּיֵא` "to the astrologers" | `ל/כשדי/א` | `לְ/כַשְׂדָּאֵ֔/י` |

Each page surface matches the OSHB **Ketiv** consonant skeleton and differs from
the Qere (validator-proven). The extractor preserves the single form and attaches
a `variant` annotation with `sourceMarksVariant: false`; it does not flatten both
readings into consecutive words. **No general claim is made** that Bible Hub
always shows only the Ketiv or never supplies a Qere — this is what the two
inspected records show. The Qere is not recoverable from these two records.

No Ketiv/Qere occurs in Genesis 1:1–5 or Malachi 4:5–6.

## 8. Genesis 1:1 — reading-quality demonstration

The app's current Hebrew reading cards derive labels from Strong's dictionary
glosses (via OSHB), which are often contextually poor. Berean supplies a
contextual gloss per word:

| # | Strong's | Surface | Current OSHB card label | Berean gloss | Resolved? |
|---|---|---|---|---|---|
| 1 | H7225 | בְּרֵאשִׁ֖ית | the first | In the beginning | yes |
| 2 | H1254 | בָּרָ֣א | to create | created | yes |
| 3 | H430 | אֱלֹהִ֑ים | gods in the ordinary sense | God | yes |
| 4 | H853 | אֵ֥ת | self | – (intentionally untranslated) | yes |
| 5 | H8064 | הַשָּׁמַ֖יִם | the sky | the heavens | yes |
| 6 | H853 | וְאֵ֥ת | self | and | yes |
| 7 | H776 | הָאָֽרֶץ׃ | the earth | the earth | same |

Berean resolves six of the seven problems. Its glosses are **not** forced to
equal the English verse caption; word-aligned glosses may differ in order and
wording, which is expected and legitimate.

## 9. Validation and fidelity

```bash
node build/tools/berean-hebrew-validate.mjs   # all 85 checks pass
node build/tools/berean-hebrew-tests.mjs      # all 22 tests pass
```

**What deterministic regeneration proves and does not prove.** Re-running the
extractor over the cached pages and getting byte-identical output proves the
fixture is *reproducible* from the cache. It does **not** by itself prove the
parser read the page correctly. Independent *fidelity* comes from:

- the anchor checks in the validator (exact GEN 1:1 gloss/Strong's/transliteration/
  morphology values taken from the page), the Hebrew Unicode/niqqud/cantillation
  checks, the Strong's-list and morphology checks, the Ketiv skeleton comparison,
  and the Gen 1:1 OSHB comparison; and
- the supervisor's separate DOM-based HTML reader, which independently matched
  surface, transliteration, gloss, morphology and Strong's across all 1,370
  records in the three cached chapters.

**Offline tests** cover: a failed refresh preserving later pages and original
metadata; reuse making no request and keeping retrieval dates; a blocked/invalid
response never replacing a valid cache; crash-safe resume; corrupted-cache
detection; a page sha256 mismatch (and a missing hashed page) stopping
generation; a page with no recognised word tables flagged as a structural error;
multiple Strong's numbers preserved in order; multi-Hebrew-span rejection;
missing transliteration/morphology/malformed-ref/unsupported-structure
detection; empty-gloss source-gap handling; and the build refusing to overwrite
on structural errors.

## 10. Feasibility and open questions

**Technically feasible.** Page structure is consistent across the sampled
chapters; extraction is deterministic and offline; counts match the brief.

**Remaining before app integration:**

1. **Licence scope** — the CC0 text dedication is established, but whether the
   third-party-derived morphology/Strong's/lexical fields (Biblos Interlinear and
   other credited parties) are covered is unresolved; raw pages must stay local.
2. **Draft volatility** — the data is still changing; every page is date-stamped
   and expected to churn.
3. **Ketiv/Qere** — these two records show only the written form with no marker;
   if the app must show the read form, Bible Hub alone is insufficient.
4. **Missing glosses** — empty glosses exist elsewhere in the source and must
   remain missing, never substituted.
5. **Own interlinear vs grafting** — as with the Greek NT pilot, Berean Hebrew
   would be its own interlinear, never aligned positionally onto OSHB.
6. **Versification** — Maranatha's canon uses the English Malachi division
   (`MAL` = 4 chapters, chapter 4 has 6 verses) and OSHB matches it, so source
   Malachi 4:5–6 maps **directly** with no remap; the source reference is kept
   ("Malachi 4:5–6"). (The Hebrew Masoretic numbering would be 3:23–24.)

## 11. Local app preview (Berean Hebrew draft pilot)

A **local evaluation only** — not publication approval, not a merge. The scope
of reuse terms for the ancillary fields remains under review.

- **Runtime data:** `data/berean-hebrew-pilot.js` (`window.MARANATHA_BEREAN_HEBREW_PILOT`),
  generated deterministically from the fixture by `build/import-berean-hebrew-pilot.mjs`.
  It contains exactly the 109 pilot records for the covered chapters; uncovered
  verses are explicit nulls and uncovered chapters are absent.
- **Selection:** tick **"Berean Hebrew (draft pilot)"** under *Study tools* and
  choose **Reading** (dense cards) or **Study** (expandable cards). It is
  mutually exclusive with OSHB Hebrew; OSHB behaves exactly as before. Berean
  Greek and Byzantine are untouched.
- **Coverage:** for verses/chapters outside the nine pilot verses the app shows
  one concise coverage notice (never silent OSHB or dictionary cards).
- **Faithful rendering:** source order with an RTL word container; supplied
  transliteration and contextual gloss shown LTR; complete Strong's lists (empty
  when the source gives none); supplied morphology shown verbatim (never run
  through the OSHB morphology decoder); intentional blanks stay blank; a missing
  gloss is an explicit, distinct marker that never falls back to dictionary prose.
- **Study details:** reading gloss, morphology, Strong's list, source reference,
  draft provenance, and — for the two Daniel records — the **exact annotated
  OSHB Ketiv and Qere forms**, each rendered as an isolated RTL Hebrew span and
  labelled "OSHB comparison (not supplied by Berean)". Berean's own surface,
  transliteration, gloss and alignment are unchanged and no second reading word
  is added. (Daniel 2:4 Qere `לְ/עַבְדָ֖/ךְ`, Daniel 2:5 Qere `לְ/כַשְׂדָּאֵ֔/י`.)
- **Caches:** the raw HTML stays ignored/local (`.gitignore`); the generated
  runtime file is a normal same-origin data file, runtime-cached by the service
  worker through the **existing `maranatha-data-v3` cache on first load** and
  never precached into the shell. Only the shell cache version was bumped
  (`CACHE_VERSION` v30→v31); `DATA_CACHE_VERSION` stays **v3** so previously
  downloaded translations and Berean Greek books are not invalidated.

```bash
npm test                                            # includes all Hebrew checks below
node build/import-berean-hebrew-pilot.mjs --check   # runtime data up to date
node build/test-service-worker.mjs                  # 13 checks (data cache survives shell update)
node build/test-berean-hebrew-pilot.mjs             # 77 runtime checks
```

### Fresh checkout / ignored cache

`npm test` includes the Hebrew tooling. Two checks replay the real pages and
therefore need the ignored local cache (`berean-hebrew-tests.mjs`, the pilot
validator). On a checkout without those pages they **skip with a clear
explanation and recovery command** (they never download anything):

```
node build/tools/berean-hebrew-fetch.mjs
```

The generated fixture (`pilot.fixture.json`), the runtime data, the importer
`--check`, the service-worker test and the app-preview tests all work without the
raw cache.
