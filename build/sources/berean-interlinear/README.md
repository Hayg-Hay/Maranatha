# Berean Interlinear Bible NT — extraction inspection (not imported)

This directory holds a **read-only inspection prototype** for the official
Berean Interlinear Bible New Testament Word document. Nothing here is loaded by
`app.js`, written into `data/`, or used at runtime. No full-NT data is
committed.

## Why

The project's Greek reading cards are built on the Robinson-Pierpont Byzantine
text, which stores only surface + Strong's + morphology per token; glosses are
derived from Strong's and are often contextually poor (e.g. G1537 → "literal or
figurative"). Before deciding whether Berean's word-level English glosses could
help, we needed to know whether the official Word file preserves a reliable
per-word association between Greek surface, transliteration, morphology,
Strong's number, English gloss, verse reference, and token order — **without**
attaching Berean glosses to Byzantine tokens by position.

## Source (official downloads)

| File | URL | sha256 |
|---|---|---|
| Word | https://interlinearbible.com/bib.docx | `2d969f0a3831a2edd0e374677fd793dc02808575cf9ed9ba555b6970a3e99352` |
| PDF | https://interlinearbible.com/bib.pdf | `e592d57cd13a371f3cfbf1f56c23e88b724e12a5235a87b04313018d4f57d6fb` |

Document metadata: title `BGB New Testament`, creator `ji`, created
2016-03-15, modified 2016-05-05 (Word 2013). The current download URL still
serves this 2016 build, so the URL alone does **not** prove it tracks the latest
revision.

The downloads are **not committed** (7.3 MB docx / 13.0 MB pdf). Only the
extractor and a small fixture are.

## Document structure

- The file is a normal OOXML package. The entire interlinear lives in one
  part: `word/document.xml` (~79.5 MB). `word/_rels/document.xml.rels`
  (~24.9 MB) maps each `r:id` to an external `http://biblehub.com/greek/<n>.htm`
  hyperlink (not needed for the fields).
- Content is in tables. A book begins with a `<w:bookmarkStart w:name="John"/>`
  (bookmarks are unspaced, e.g. `1Corinthians`); a chapter begins with a
  `"<Book> <N>"` heading run; a verse begins with a `reftext1` run holding the
  verse number.
- Each word is: Greek surface run(s) followed by
  `<w:hyperlink r:id="…" w:tooltip="MORPH STRONGS: Transliteration -- Definition">(English gloss)</w:hyperlink>`.

So every field is present and directly associated with its own word:

| Field | Source |
|---|---|
| Greek surface | the run(s) immediately before the hyperlink |
| English gloss | the hyperlink's link text (outer parentheses stripped) |
| transliteration / morphology / Strong's / definition | the hyperlink `w:tooltip` |
| verse reference | `reftext1` number run, tracked per book/chapter |
| token order | document order within the verse |

## Reliability findings

Whole-document scan of **all 138,130** lexical hyperlinks:

- **0** tooltip parse failures (every tooltip matches `MORPH STRONGS: Translit -- Definition`).
- **0** hyperlinks without a recoverable Greek surface.
- **0** missing Strong's numbers; **0** empty glosses.
- 138,034 (99.93%) have exactly one preceding Greek word.
- 19 are single **Berean alignment records** whose displayed Greek contains a `¦` display separator and may therefore contain multiple displayed Greek words (e.g. `μή¦γε`, `ἀγαθὸν¦ποιῆσαι`, `ὅ¦τι`); each carries one tooltip/gloss for the whole record. All 19 are reviewed individually in [`compound-normalization.json`](compound-normalization.json): 18 render with a word space and `Ἁρ¦μαγεδών` is joined to `Ἁρμαγεδών`. The raw source surface/transliteration are preserved in that table and in `berean-build.json` for audit.
- 77 are preceded by a typographic joining mark (`‿ 〉 ⧽ …`) rather than the word itself; the Greek word is in the run **before** that mark, and concatenating the runs between two hyperlinks recovers it. The extractor handles this.
- `-` is Berean's explicit "intentionally untranslated" marker (e.g. articles); John contains 678 of them.

### Visual (PDF) cross-check

The PDF text layer keeps the English glosses but loses the Greek glyphs (custom
font without a Unicode map; some words surface as `<>`). For John 6:50–51 the
extracted gloss sequence matches the PDF exactly:

- 6:50 → 17 tokens: `This is the bread - from - heaven coming down, that anyone of it may eat, and not die.`
- 6:51 → 38 tokens: `I am the bread - living, - from - heaven having come down; if anyone shall have eaten of this - bread, he will live to the age; and the bread also that I will give, the flesh of Me is for the of the world life.`

### Edition mismatch (critical)

Berean uses an NA-type Greek text, not the Byzantine text the app displays:
e.g. John 6:51 has `ζήσει` (not `ζήσεται`) and no repeated relative clause, so
Berean John 6:51 has **38** tokens vs the Byzantine **41**. Across John, Berean
has 15,660 tokens vs Byzantine 15,892. **Do not align Berean glosses to
Byzantine tokens by position.**

### Stability samples (0 incomplete fields, 0 anomalies)

| Range | Verses | Tokens |
|---|---|---|
| John 1:1–18 | 18 | 252 |
| John 3:16–21 | 6 | 136 |
| John 6:35–58 | 24 | 452 |
| John 10:1–18 | 18 | 332 |
| John 17 | 26 | 498 |
| John 21 | 25 | 549 |
| Romans | 432 | 7,120 |
| Revelation | 404 | 9,856 |

## Proposed JSON shape and size (not committed)

Compact per-verse arrays, keyed by canonical book id:

```json
{
  "id": "berean-interlinear",
  "label": "Berean Interlinear Bible (NT)",
  "source": "…",
  "books": {
    "JHN": {
      "6": {
        "50": [["οὗτός","houtos","DPro-NMS","3778","This"], …]
      }
    }
  }
}
```

Estimated full-NT payload (138,130 tokens): **≈ 5.7 MB** minified
(surface, transliteration, morphology, Strong's, gloss). Adding the tooltip
definition per token would grow it to **≈ 15.0 MB**; since the app already ships
a Strong's dictionary, the definition field can be dropped.

## Human validation still required

1. Confirm the 2016 build is the intended/latest Berean revision (the URL does
   not say).
2. Confirm public-domain/reuse terms for the current download (the 2023
   dedication; an older shop page shows pre-2023 restricted terms).
3. Spot-check gloss quality and the `-` (intentionally untranslated) convention
   against the printed interlinear.
4. Decide whether to display Berean as its **own** interlinear (its own Greek
   text and alignment) rather than grafting glosses onto the Byzantine text.
5. Check wording/attribution requirements for derivative use.

## Repeatability

```bash
curl -L -o bib.docx https://interlinearbible.com/bib.docx
sha256sum bib.docx            # expect 2d969f0a…
unzip bib.docx "word/document.xml" -d bib
node build/tools/berean-extract.mjs bib/word/document.xml stats
node build/tools/berean-extract.mjs bib/word/document.xml book John 6 50 51
node build/tools/berean-fixture-check.mjs
BEREAN_DOCX=bib/word/document.xml node build/tools/berean-fixture-check.mjs
```

`berean-fixture-check.mjs` validates the committed
`john-6-50-51.fixture.json` offline (token counts, contiguous order, field
completeness, numeric Strong's, Word/PDF gloss-sequence match) and, when
`BEREAN_DOCX` is set, re-extracts and asserts the fixture is reproduced exactly.
