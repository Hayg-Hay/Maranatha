# Japanese Kōgoyaku investigation and alternative-edition comparison

Date: **2026-10-08** (Europe/Luxembourg). Scope: original **口語訳聖書**, 1954 New Testament / 1955 complete Protestant Bible. **Investigation only. No implementation, import, Git mutation, commit, merge, or push.**

Follow-up scope, authorized by the user on the same date: compare other Japanese translations. Sections **11–12** add that comparison and a broader source-selection handoff. The original Kōgoyaku findings and its dedicated blocker prompt remain edition-specific.

## Executive summary

**Broader shortlist:** Bungo-yaku is the strongest historical full-Bible lead; Japanese Freedom Bible is a promising modern, freely distributed **draft**; Open Translation Bible offers a modern Japanese CC BY-SA dataset whose provenance and full text still need review. Japanese inclusion need not depend on clearing the problematic Kōgoyaku files. See §11 for measured coverage, qualifications and priorities. No alternative has been implemented or approved for production.

**Recommendation: CONDITIONAL GO for the project; NO-GO for importing the currently audited artifacts as an unmodified original 1954/1955 edition.**

The Japan Bible Society (JBS) confirms expiration of protection for its original 1955 edition in Japan. This does not clear later revisions or a particular electronic transcription. Luxembourg/EU clearance remains unresolved, with a plausible publication-term route but insufficient verified edition/authorship information. The actual source files also reveal material problems:

- CrossWire's `JapKougo` 1.1 package, used by STEP, has **473 empty KJV-indexed verse entries**, including **18 entirely empty chapter grids**. Its pinned Scrollmapper export preserves those empty records; getBible omits them. Some empty slots reflect combined verses rather than missing Scripture, but the empty chapters are a release blocker.
- The eKotoba TXT contains **66 books / 1,189 chapters / 31,086 positive-label text segments**, representing **31,103 native verse positions**. It retains **16 combined labels** and **117 Psalm-heading records**. No positive-label gaps or duplicate positive references were found after interpreting the combined labels. This is a structural inventory, not certification against a 1955 printed witness.
- eKotoba contains phrases JBS identifies as later changes at **Psalm 31:17 and Galatians 5:12**. CrossWire-derived candidates contain the Psalm 31:17 phrase too. Therefore the public-domain labels do not establish original-edition fidelity.
- Standard local script loading can be reused. Combined labels, headings, Japanese aliases/input, narrower source chapter extents, and kana-safe search require scoped work beyond adding one registry entry.

**No production dataset is approved.** The most useful native-structure candidate to investigate further is the byte-pinned eKotoba TXT, not the damaged scalar JSON exports. It must not be patched from another source. Find a cleared, complete original witness or obtain a separately approved edition/licence before implementation.

### Evidence status

| Question | Status |
| --- | --- |
| Original 1955 edition's economic protection expired in Japan | Verified publisher statement, corroborated by statutory term/non-revival sources |
| Exact audited files reproduce only original 1954/1955 wording | Failed screening; later-revision markers found |
| Complete readable Scripture in CrossWire-derived exports | Failed; empty chapters/entries |
| Complete original text in eKotoba | Unresolved; reference coverage passes, edition fidelity does not |
| Complete redistribution lawful in Luxembourg/the EU | Unresolved for this edition/artifact; not inferred from Japanese expiry |
| Offline technical inclusion possible | Yes, with the scoped changes below |

## 1. Method and repository boundary

Inspected the actual working tree at `C:\maranatha\maranatha_new`, current branch `codex/vulgata-clementina`, HEAD `1e4b283918529e14bfcaa44915f0c8b9a4388a13`. Local `main` already contains the Latin merge; the working tree also contains paused, uncommitted LXX work. Findings concern the files actually read, not a presumed clean checkout.

Downloaded candidate files and public metadata only to an OS temporary investigation directory. Used strict UTF-8 decoding, SHA-256, reference inventories, comparative text checks, direct compressed-module/index inspection, and read-only VM probes of existing JavaScript. No complete Bible text is embedded in this report. Temporary scripts are not project deliverables. Application files and existing datasets were not edited. `npm test` was not run for this documentation-only task: the existing suite writes cache artifacts; proposed implementation acceptance commands are listed below.

The pre-investigation tracked diff fingerprint is `2c36f11ebaaea02db6ae99ac3bdb9cf230199a5decd40ca360c1d92201d5bc96`. Final verification confirmed the identical fingerprint and unchanged HEAD. The sole added repository file is this untracked report; all previous working changes remain present.

## 2. Copyright and licensing

### 2.1 Japan: original edition versus later text

**Verified.** [JBS's copyright page](https://www.bible.or.jp/read/bible_copyright.html) states that protection for the 1955 Kōgoyaku has ended, while requiring respect for attribution/integrity and distinguishing protected later corrections and current electronic/printed products. Its general quotation allowance is not a licence to redistribute a protected complete Bible. [JBS's historical account](https://www.bible.or.jp/know/know19.html) identifies NT publication in 1954 and OT completion in 1955.

The [historical official Copyright Act translation, Articles 53 and 57](https://www.japaneselawtranslation.go.jp/ja/laws/download/1980/09/s45Aa000480206en2.0_h18A121.pdf) supplies the former 50-year corporate-publication framework. The familiar expiry calculation is end-2004 for 1954 publication and end-2005 for 1955 publication **if that framework applies**; publication year alone would not establish expiry for an individually attributed translation.

[Japan's Agency for Cultural Affairs, Q&A 3–4](https://www.bunka.go.jp/seisaku/chosakuken/hokaisei/kantaiheiyo_chosakuken/1411890.html), confirms that the 2018 extension to 70 years did not revive already-expired protection. JBS's specific statement is stronger evidence here than a distributor's generic PD label. The [later official Act translation](https://www.japaneselawtranslation.go.jp/ja/laws/download/4207/09/s45Aa000480504en14.0_r3A52.pdf) gives the 70-year organizational term and the moral-rights/posthumous provisions; it is labelled partially unenforced and is not substituted for a current Japanese enactment.

### 2.2 Later revisions: concrete screening failures

[JBS's correction list](https://www.bible.or.jp/read/si_word_correction/jc_word_correction.html), dated October 2018, separates changes made in 1975, 1984 and 2002 and asserts protection/permission requirements for their inclusion. Exact downloaded candidate checks found:

| Reference | JBS lists a later replacement for | eKotoba | Scrollmapper / getBible |
| --- | --- | --- | --- |
| PSA 31:17 | Original phrase `彼らをおしのようにして` | Contains replacement `彼らに声をあげさせずに` | Contains the same replacement |
| GAL 5:12 | Original phrase `不具になる` | Contains replacement `去勢してしまう` | Retains the original phrase |

This establishes an edition-screening problem, not a legal ruling that every individual substituted word necessarily satisfies originality. Most eKotoba diagnostic rows retain older wording; that does not neutralize the positive findings. The first automated screen examined 132 correction-table rows, mapped 127, and reported 121 old-only, 2 new-only, 3 both and 1 neither; five abbreviations were left unmapped. This was not an exhaustive original-edition certification. Punctuation/context differences can make literal substring screening inconclusive.

**Do not reverse these changes by inserting text from the table, Wikisource, or another edition.** That would create an assembled text rather than import a verified published witness. A permission to use a mixed/revised file would also not make its designation “original 1954/1955” accurate.

### 2.3 Luxembourg and the EU

**Verified framework; application unresolved.** [Directive 2006/116/EC, Articles 1, 7–10](https://www.legislation.gov.uk/eudr/2006/116/body/adopted/data.xht?view=snippet&wrap=true), normally limits protection of qualifying third-country/non-EU-author works to origin-country expiry, but includes preserved longer terms and transitional rules. It also distinguishes life-based terms from anonymous/collective publication-based terms. This is an official UK-hosted copy of the adopted EU text; EUR-Lex retrieval encountered a verification page. Relevant copyright-duration provisions were read directly, not assumed from a PD label.

The [Luxembourg ministry's legal index](https://meco.gouvernement.lu/fr/domaines-activites/propriete-intellectuelle/legislation.html) links the [2001 copyright law consolidated through 2022-04-09](https://legilux.public.lu/eli/etat/leg/loi/2001/04/18/n2/consolide/20220409). Legilux text was not extractable in this session. A PDF downloaded through [WIPO Lex's law record](https://www.wipo.int/wipolex/en/legislation/details/2932) identifies itself as a **2004-05-03 consolidation**, despite differing portal descriptions; it must not be represented as verified current 2022 law.

That historical text's Article 9 distinguishes life-plus-70 from publication-plus-70 for anonymous/pseudonymous/directed works, while Article 71 expressly mentions both EU and WTO membership in its foreign-work term provision. Japan's WTO status means an automatic “Japan expired, therefore Luxembourg expired” conclusion is insufficient. Current Article 71, relevant treaty/transitional treatment, and the translation's legal authorship must be established.

**Inference:** if the original falls under the relevant 70-year publication-based category, 1954/1955 publication would give expiry by 2025-01-01 / 2026-01-01. If identifiable natural-person contributions instead attract life-based protection, publication age alone is inadequate. A JBS publisher credit does not by itself establish the Luxembourg classification. **Complete redistribution is therefore not legally cleared by this report.** Obtain a documented current-law determination or a territorially sufficient permission for an accurately identified edition.

### 2.4 Digital editions, distribution and attribution

Do not equate copyright in the translation with licences for software, annotations, ruby readings, scans, editorial additions or database extraction. Mere encoding is not automatically a fresh copyright; originality, investment, ownership and applicable terms still require examination. Preserve attribution to JBS as historical translator/publisher, the original edition, the digital transcriber/distributor, retrieval date, immutable revision/hash, and every retained notice. Describe PD as a territorial finding, not a worldwide licence invented by Maranatha.

The present project is distributed through GitHub/GitHub Pages. A Luxembourg/EU conclusion would not automatically clear US/global redistribution: [US Copyright Office Circular 38B](https://www.copyright.gov/circs/circ38b.pdf) explains restoration under the URAA for qualifying foreign works. Publication, source-country protection at the restoration date and other conditions require investigation before claiming worldwide PD. No definitive US conclusion is made here.

If protected material is retained, complete-Bible offline distribution needs permission covering repository copies, downloads, hosting, geography, attribution and any allowed presentation. No publisher or maintainer was contacted; drafting a question is permitted, sending it requires separate user authorization.

## 3. Dataset comparison and reproducibility

### 3.1 Candidates actually examined

| Candidate / maintainer | Edition and provenance | Format / licence evidence | Findings and disposition |
| --- | --- | --- | --- |
| [STEP JapKougo](https://www.stepbible.org/version.jsp?version=JapKougo), STEPBible | Explicitly uses CrossWire's `JapKougo`; not independent corroboration | Web presentation of a SWORD module; original-edition/PD claim | 66-book chapter menu is not proof of text completeness. Prefer official module retrieval over scraping STEP. Same upstream risks apply. |
| [CrossWire JapKougo](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=JapKougo), CrossWire Bible Society | Module 1.1, 2008-06-08; `.conf` points to `http://bible.50webs.org/`; history only says description-name correction | [Official raw ZIP](https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JapKougo.zip); zText, ZIP-compressed book blocks, OSIS fragments with ruby/`w gloss`; UTF-8; `DistributionLicense=Public Domain` | Official ZIP exactly matches the pinned GitHub mirror below. 473 empty indexed verse slots; revision marker at PSA 31:17. Not approved as complete original text. Metadata's NT-only LCSH field is inconsistent with 66-book contents. |
| [eKotoba](https://ekotoba.org/), named site/operator; no individual maintainer identified | Calls its file Kōgo Yaku 1955 / `KG1955`; upstream transcription and revision history unstated | [UTF-8 TXT](https://ekotoba.org/data/Kougo1955_Japanese.txt), tab-separated code/book-number/Japanese-name/reference/text; site claims PD | Best investigated native-structure lead, but mixed-revision markers, heading defects and punctuation differences prevent approval. No immutable publisher version; pin observed bytes and retain a cleared source copy later. |
| [Japanese Wikisource NT](https://ja.wikisource.org/wiki/口語新約聖書) and [OT](https://ja.wikisource.org/wiki/口語旧約聖書), community | Reports Salterrae transcription, proofread NT 2005-06-11 / OT 2006-08-13, with links to scans; alterations to layout/reference typography disclosed | Wikitext/HTML; MediaWiki revision IDs/XML export and ebook export available; underlying original PD claim, site licences must be distinguished from Scripture | Both index pages displayed deletion-proposal notices during examination. Do not infer the reason or outcome. Useful witness/provenance lead; all 66 book pages were not downloaded or collated. Each page/transclusion needs its own revision pin; current index page alone is inadequate. |
| [Scrollmapper bible_databases](https://github.com/scrollmapper/bible_databases), Scrollmapper/contributors | Pinned `e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c`, 2026-07-10; CrossWire ZIP plus source/intermediate files and generated formats | JSON, CSV, TXT, SQL/SQLite, YAML, Parquet, Markdown; root MIT software licence, per-source README PD claim | Generated JSON: 66 / 1,189 / 31,102 slots, 473 empty, 18 empty chapters. Reproducible forensic source; **reject this JSON for import**. MIT does not prove the translation is globally PD. |
| [getBible API](https://api.getbible.net/v2/japkougo.json), getBible/Vast Development Method | Response repeats CrossWire 1.1/date/source metadata; [repository](https://github.com/getbible/v2) inspected at `58ccb95982059a3aae36ebde2a84b99fa34742ab` | UTF-8 JSON with escaped Japanese; `distribution_license=Public Domain`; repository software GPL-3.0 | 66 / 1,189 / **30,629 nonempty records**: empty slots are omitted, not recovered. 295 corresponding nonempty strings differ from Scrollmapper's export. API response is not proven to be generated from that Git commit; pin response hash separately. Not approved. |
| [thiagobodruk/bible](https://github.com/thiagobodruk/bible), repository contributors | Multi-language collection checked via repository tree | JSON/XML repository | No Japanese candidate path was found in the examined tree. Not a verified Kōgoyaku source; do not assume advertised language breadth includes Japanese. |

[CrossWire's developer documentation](https://wiki.crosswire.org/DevTools:Modules) explicitly requires permission verification, supports native versification choices, and warns that exports which skip link entries are not guaranteed lossless. A convenient JSON conversion is not a substitute for source integrity.

### 3.2 Exact pins measured

Retrieval date for all observations: 2026-10-08. Hashes identify the analyzed bytes, not legal approval.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| eKotoba `Kougo1955_Japanese.txt` | 6,231,263 | `dc146231c489d91d2e8c54b75557afeb592f130d3877e7353e7581f684e4e0be` |
| Scrollmapper `formats/json/JapKougo.json` | 9,489,465 | `9ee1d1ba36b881c420048ac81dd125e1917bbb4082d31467fdf83d188cc474cb` |
| CrossWire ZIP, direct download **and** Scrollmapper mirror | 2,113,786 | `76409195a7f7354774edfe3825f6b3b06801fbb283e85fb2a685fe9fb7716d9f` |
| getBible full API JSON response | 15,086,030 | `b0b121f6bea6104e9c1d4dc142581a2392fd0f203ef80842b328f7263410e0d9` |

Immutable Scrollmapper URLs:

- [JSON actually audited](https://raw.githubusercontent.com/scrollmapper/bible_databases/e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c/formats/json/JapKougo.json)
- [Original ZIP mirror](https://raw.githubusercontent.com/scrollmapper/bible_databases/e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c/sources/ja/JapKougo/JapKougo.zip)
- [Source README](https://raw.githubusercontent.com/scrollmapper/bible_databases/e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c/sources/ja/JapKougo/README.md)
- [MIT licence](https://raw.githubusercontent.com/scrollmapper/bible_databases/e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c/LICENSE)

The eKotoba URL and API endpoint are mutable. A future acquisition must stop on hash changes, retain original bytes with `-text` attributes, preserve metadata/terms, and obtain an immutable source revision or maintain a legally cleared archive. The checksum alone cannot make a future live download available forever.

### 3.3 Automated retrieval permissions

- CrossWire explicitly publishes a module download; GitHub publishes raw files and metadata APIs. Use the public release/raw interfaces with ordinary rate limits, not STEP's interactive endpoints. Access permission is distinct from redistribution rights.
- eKotoba links the entire 6.2 MB text for download. Its `robots.txt` response was empty (zero bytes) when examined; no explicit crawler restriction was observed there. That is not a licence, contractual waiver, or evidence of provenance. A `Last-Modified` value was not successfully established.
- Wikisource offers export/revision mechanisms; use published Wikimedia automation policies, identification, caching and rate limits. No bypass of authentication, restrictions or unavailable pages is authorized.
- getBible provides its full JSON endpoint. No text permission broader than its embedded distribution claim was established. Repository code licences must not be silently attached to, or substituted for, the original translation's rights.

## 4. Completeness and integrity findings

### 4.1 CrossWire / STEP / JSON lineage

The original module contains 39 OT and 27 NT compressed book blocks. All decompressions matched recorded uncompressed sizes. Its raw verse-index record inventories matched the existing KJV structure exactly: 24,115 OT index records and 8,246 NT records including structural records. Direct index inspection confirmed **473 zero-length verse entries**, not merely a Scrollmapper rendering problem.

Scrollmapper has all 31,102 KJV-labelled slots, no duplicate scalar references or numeric gaps in that grid, but 473 empty strings. getBible exposes 30,629 records, with no empty strings: it omits the unavailable slots. Thus a validator checking only “no empty strings” would be misleading. These 18 chapter grids contain no verse text in the examined JSON:

`PSA 130–139; PRO 30–31; MAT 25–28; JHN 19; ROM 10`.

Some other zero-length slots correspond to native combined labels. Their causes must be distinguished from missing text; **473 is not a count of definitively omitted original-edition verses**. The original package's indexed scheme cannot directly represent eKotoba's `3JN 1:15` and `REV 12:18`. The binary contains OSIS word/ruby markup; stripping readings into Scripture or discarding arbitrary XML subtrees would be unsafe. Unindexed fragments were not established as a complete native witness.

Across corresponding nonempty getBible/Scrollmapper records, 30,334 strings matched exactly and 295 differed. A preliminary scalar-only comparison of Scrollmapper with eKotoba matched 30,164 references and differed at 904; that comparison intentionally excluded combined-label and heading rows and is **not** an edition-concordance certification. Examples of punctuation disagreement include JHN 5:4, MAT 17:21, ACT 8:37 and ROM 16:24, where bracket markers differ. Do not pick the preferred punctuation by intuition.

### 4.2 eKotoba native inventory

Strict UTF-8 decoding passed; no U+FFFD replacement characters were found. The file preserves Japanese full-width punctuation, ideographic spaces where supplied, and its Japanese book-label metadata. Structural counts:

| Measure | Observed |
| --- | ---: |
| Physical nonempty rows | 31,203 |
| Books / positive-label chapters | 66 / 1,189 |
| Positive-label text segments | 31,086 |
| Distinct positive native verse positions represented | 31,103 |
| Combined-label segments | 16 |
| Heading records | 117 |
| Duplicate positive references / gaps within each native chapter | 0 / 0 |

The count of positions is obtained by expanding labels for inventory only, **not by splitting or duplicating their text**. Combined labels are:

`NUM 15:4,5; 1CH 16:12,13; PSA 49:8,9; 58:4,5; 63:5,6; 65:2,3; 76:8,9; 89:50,51; 105:5,6; 106:21,22; 132:3,4,5; PRO 26:18,19; ISA 4:3,4; ROM 1:9,10; 2:19,20; 16:25,26`.

Heading anomalies: `PSA 24:0` occurs twice with identical heading text; `PSA 47:0` occurs twice with different headings; the Psalm 49 heading uses literal label **`49.0`** instead of the usual colon. Preserve the raw labels and ordered records in an audit; do not silently deduplicate, merge conflicting headings, or correct this identifier. The zero is a digital heading convention, not proof that the printed edition has a verse zero. No whole-corpus facsimile comparison or spelling modernization audit has been completed. The two positive later-revision markers block original-edition import regardless of structural coverage.

## 5. Canon and native numbering

Use an explicit 66-book map. Maranatha's 73-book array includes deuterocanonical books interspersed in a different order, so mapping by array position would misassign books. The following observed eKotoba labels are metadata, **not a certification of printed 1955 book-title spelling**:

| ID | Japanese label | ID | Japanese label |
| --- | --- | --- | --- |
| GEN | 創世記 | EXO | 出エジプト記 |
| LEV | レビ記 | NUM | 民数記 |
| DEU | 申命記 | JOS | ヨシュア記 |
| JDG | 士師記 | RUT | ルツ記 |
| 1SA | １サムエル記 | 2SA | ２サムエル記 |
| 1KI | １列王記 | 2KI | ２列王記 |
| 1CH | １歴代誌 | 2CH | ２歴代誌 |
| EZR | エズラ記 | NEH | ネヘミヤ記 |
| EST | エステル記 | JOB | ヨブ記 |
| PSA | 詩篇 | PRO | 箴言 |
| ECC | 伝道の書 | SNG | 雅歌 |
| ISA | イザヤ書 | JER | エレミヤ書 |
| LAM | 哀歌 | EZK | エゼキエル書 |
| DAN | ダニエル書 | HOS | ホセア書 |
| JOL | ヨエル書 | AMO | アモス書 |
| OBA | オバデヤ書 | JON | ヨナ書 |
| MIC | ミカ書 | NAM | ナホム書 |
| HAB | ハバクク書 | ZEP | ゼパニヤ書 |
| HAG | ハガイ書 | ZEC | ゼカリヤ書 |
| MAL | マラキ書 | MAT | マタイ福音書 |
| MRK | マルコ福音書 | LUK | ルカ福音書 |
| JHN | ヨハネ福音書 | ACT | 使徒行伝 |
| ROM | ローマ | 1CO | １コリント |
| 2CO | ２コリント | GAL | ガラテヤ |
| EPH | エペソ | PHP | ピリピ |
| COL | コロサイ | 1TH | １テサロニケ |
| 2TH | ２テサロニケ | 1TI | １テモテ |
| 2TI | ２テモテ | TIT | テトス |
| PHM | ピレモン | HEB | ヘブル |
| JAS | ヤコブ | 1PE | １ペテロ |
| 2PE | ２ペテロ | 1JN | １ヨハネ |
| 2JN | ２ヨハネ | 3JN | ３ヨハネ |
| JUD | ユダ | REV | 黙示録 |

`TOB JDT WIS SIR BAR 1MA 2MA` are absent by edition design, not import defects. Existing missing-book placeholders can be reused. Do not create Japanese deuterocanonical text.

Observed eKotoba differences from the actual `data/canon.js`:

| Reference | Source extent | Shared canon extent |
| --- | --- | --- |
| EST 4 | 17 verses | 46 |
| EST 10 | 3 verses | 14 |
| DAN | 12 chapters | 14 |
| DAN 3 | 30 verses | 97 |
| ROM 14 | 23 verses | 26 |
| 2CO 13 | 13 verses | 14 |
| 3JN 1 | 15 verses | 14 |
| REV 12 | 18 verses | 17 |

These are source observations, not proposed alignments. Preserve labels, chapter divisions, superscriptions and combined spans. Do not “fix” the counts or pad the source into the global scheme. In particular, do not offer Daniel 13–14 as Japanese source chapters merely because they exist in the Catholic navigation skeleton.

## 6. Repository compatibility audit

| Actual component | Finding | Consequence |
| --- | --- | --- |
| `data/canon.js` | 73 stable IDs; Esther/Daniel provisional entries; counts differ from Japanese | Read-only. An edition-specific inventory must be authoritative. |
| `data/locales/en.*`, `hy.*`; `build/build-locale.mjs` | Only English/Armenian resources; generator hardcodes those outputs | Japanese labels/aliases need a new resource. Do not regenerate/change existing locale outputs accidentally. |
| `app.js` translation registry and `loadTranslation` | Ordinary checkbox and parallel/search menus derive from registry; local dynamic script tags | Reuse for `kogoyaku1955`; no local `fetch`, module imports, server or runtime conversion. |
| `VerseAvailability` | Integer-indexed verse arrays plus metadata; metadata refs accept positive integers | Existing scalar model cannot itself represent literal combined labels or zero-label headings. Needs optional source-segment metadata/rendering. |
| Native versification / block partitioning | VULC's `nativeVersification` separates source-numbered blocks and suppresses unverified comparisons | Reuse conservative separation; matching counts are not alignment evidence. |
| `effectiveChapterCount` / `ReferenceParser.hasNativeChapter` | Extends canon extent, never reduces it; parser accepts chapters already within canon before source coverage | A sole Japanese native edition still exposes/falls back to Daniel 13–14 unless scoped coverage handling is added. Keep mixed-view/unavailable behavior explicit and regress existing editions. |
| Reference parser | Builds names from current locale; `withBook` requires whitespace and ASCII digits/punctuation | No Japanese aliases today. Even with aliases, natural Japanese reference forms need scoped input parsing. |
| Search | Full linear substring scan; NFD normalization; highlight map assembled by UTF-16 positions | No tokenizer required for literal Japanese search, but kana/grapheme-safe normalization and highlighting are necessary. |
| Rendering | Text nodes/textContent; Hebrew conversion only for Hebrew translation IDs | Japanese text can remain exact LTR Unicode. Add `lang="ja"` to all relevant surfaces. |
| `style.css` | Table cells wrap; mobile text uses `overflow-wrap:anywhere`; current fonts emphasize Latin/Greek/Hebrew | Use local/system Japanese fallback and sensible Japanese line breaking. Browser/font/kinsoku behavior remains visually untested. |
| `service-worker.js` / `index.html` | Worker guarded to HTTP(S); large translation scripts cached lazily; shell v55/data v3 | Bare file:// needs no worker. Bump shell and matching assertions if shell changes; keep cache policy explicit. |
| `build/validate.mjs` | Global-count mismatches generally errors except provisional/known cases; missing books informational | Add source-specific validation; do not relax shared checks or repair text to pass them. |
| Existing tests | JSDOM real file:// loaders and network blockers; native/parallel/search regression patterns available | Extend with meaningful Japanese cases and independent full-source comparisons. Historical LXX fixtures are gitignored and must be preserved. |

### 6.1 Japanese search: measured behavior

Read-only probes executed the existing `normalizeSearchText` function with the existing Hebrew helper:

| Text / query | Current result | Assessment |
| --- | --- | --- |
| `神は愛である` / `愛` | Match | Substring search handles words without spaces. |
| `が` / `か` | Match | Undesired base-kana match inside an NFD grapheme. |
| `ば` / `は`; `ぱ` / `は` | Match | Same voicing/semi-voicing problem. |
| `か` / `が` | No match | The behavior is asymmetric, not wholesale dakuten stripping. |
| `が` / decomposed `か` + U+3099 | Match | Canonical-equivalence matching currently works in this case. |
| `イエス・キリスト` / `イエスキリスト` | No match | Punctuation-insensitive matching would be optional, not silently promised. |

The regex removes Latin/Hebrew combining ranges, **not U+3099/U+309A**. The problem is matching a prefix of the decomposed grapheme. Use a Japanese-specific search form that preserves voicing, handles canonical equivalence across complete graphemes, and maps highlights back to untouched original text. Propagate the language/context through search, highlights and comparisons; do not globally change Hebrew/Greek search. Width folding, kana folding, morphological search, transliteration and punctuation-insensitive matching are optional, separately specified search policies. Never apply NFKC to stored Scripture.

### 6.2 Names, input, copying and layout

A temporary in-memory alias probe confirmed the existing grammar can accept `ヨハネ 3:16` **after** adding a Japanese alias; `ヨハネ3:16`, `ヨハネ ３：１６` and `ヨハネ3章16節` fail the existing grammar even then. It did not register or modify a real translation.

Launch needs curated Japanese names/abbreviations, including distinctions such as Gospel John versus 1–3 John, and narrow input handling for no-space names, full-width digits/colon, and conventional chapter/verse markers. Use longest known alias matching and normalize reference input only. Preserve existing English/Armenian and Roman-prefix/range behavior. Full Japanese interface strings, kanji-number input and ruby presentation are optional. Book-label localization is distinct from translating every UI message.

Current copy behavior is ordinary browser text selection; no dedicated Copy button was found. Check DOM range/clipboard text against exact source segments, including brackets, ideographic punctuation and combined references. Desktop/mobile visual acceptance must cover narrow columns, Japanese punctuation at line boundaries, fallback glyphs and no forced whitespace insertion. Static CSS inspection and VM tests cannot certify actual font rendering; no browser or phone visual test was performed.

## 7. Minimal proposed implementation architecture — not authorization

1. Clear one accurately identified published witness. Pin bytes, edition metadata, licences and revision history. Preserve every positive segment and heading record; fail on unknown labels. Do not combine the present candidates to fill holes or reverse revisions.
2. Generate the existing JSON + window-global JS twins at build time. Proposed ID `kogoyaku1955`, language `ja`, 66 explicit book IDs, faithful strings, provenance and source-native metadata. Static consumers require no build environment.
3. Preserve combined text as **one source segment with its literal label**, linked to its member reference positions for lookup. A query for any member must show the same source segment once with its true label. Do not duplicate the text into separate verse cells or manufacture subdivisions. Extend availability/rendering/contexts/search/copy accordingly, using optional metadata so existing scalar editions are unchanged.
4. Retain source heading records separately from verses and commentary. Preserve record order and literal anomalous labels in provenance; resolve duplicate/conflicting headings through evidence and an explicit ledger, not silent cleanup.
5. Reuse independent native blocks and comparison suppression until mappings are actually verified. Scope source-only navigation/reference validation to Japanese coverage, including the shorter Daniel/Corinthians extents. Shared canon navigation may show explicit unavailable cells in mixed views, but must not claim those are Japanese references.
6. Add a curated Japanese name/alias resource; make aliases usable independently of full Japanese UI localization. Keep English and existing locale behavior intact. Add language-aware search and LTR/CJK styling consistently to browse, reference, mobile, search, context and parallel surfaces.

This is an additive source-segment extension, not a recommendation to redesign the app. The exact schema is a design gate: VULC's integer arrays alone are insufficient evidence that combined Japanese labels work.

### Expected files in a later, explicitly approved implementation

Proposed branch: `codex/japanese-kogoyaku`, from current `main`; preserve paused LXX changes before any branch operation. **None of the following changes is authorized by this investigation.**

New: `build/fetch-kogoyaku1955.mjs`, `build/import-kogoyaku1955.mjs`, `build/validate-kogoyaku1955.mjs`, `build/test-kogoyaku1955.mjs`, `build/check-kogoyaku-source-independent.mjs`, `build/build-kogoyaku-names.mjs`, `build/sources/kogoyaku1955/` (cleared original artifact, provenance, inventory, reviewed name/alias input, defects ledger), `data/kogoyaku1955.json`, `data/kogoyaku1955.js`, `data/locales/ja.json`, `data/locales/ja.js`, `data/LICENSE-kogoyaku1955.md`, `docs/KOGOYAKU1955.md`.

Scoped modifications: `app.js`, `style.css`, `index.html`, `service-worker.js`, `package.json`, `.gitattributes`, `README.md`, `PROJECT_HISTORY.md`; exact shell-version assertions only in the existing cache-sensitive tests (`build/test-service-worker.mjs`, `build/test-delitzsch.mjs`, `build/test-delitzsch1901.mjs`, `build/check-stage2a.mjs`, `build/check-lxx-disclosures-independent.mjs`). New locale generation should be isolated; modifying `build/build-locale.mjs` is unnecessary if a separate generator is used.

Do not alter `data/canon.js`, existing locale outputs, existing Scripture corpora, known-variant data merely to whitelist failures, or unfinished LXX proposals. Any different schema/file manifest needs documented justification and review before implementation.

## 8. Acceptance tests required after clearance

- Independent source-to-output comparison for every segment, chapter, label and heading, with verified input hashes. Counts are established from the **cleared witness**, not frozen to the rejected files' counts.
- Strict UTF-8; exact code-point sequences, punctuation, brackets and ideographic spaces; no normalization or guessed repairs of stored text. Separate ruby/annotations from Scripture.
- Exact 66 IDs, no invented deuterocanon; structural/edition ledger and no unexplained omissions. Whole-chapter-empty detection, not merely book/chapter totals or removal of empty strings.
- The JBS correction-list markers, original printed witness checks and documented collation; unresolved source disagreements stop release.
- For a witness retaining the audited bridges: all 16 labels, especially NUM 15:4,5 and PSA 132:3,4,5; query first/middle/last members and reordered/repeated references, browse/context/search/copy show each segment once.
- Psalm superscriptions, duplicate heading records and `49.0`: evidence-based treatment, no verse-zero fabrication or silent cleanup.
- Source-valid versus invalid references: JHN 1:1 / 3:16; 3JN 1:15 and REV 12:18 if confirmed; reject next positions; sole-Japanese Daniel 13 versus mixed-edition unavailable rendering; 2CO 13 source end; switching from VULC and back without stale bounds.
- Japanese aliases and ambiguous John/Corinthians names; no-space/full-width/章・節 syntax; English/Armenian/Roman-prefix/range regressions.
- Search without spaces, precomposed/decomposed voicing, **か ≠ が; は ≠ ば ≠ ぱ**, exact highlight ranges, repeated hits, supplementary characters/variation selectors if present, and preservation of existing Hebrew/Greek/Latin search.
- Real `JSDOM.fromFile` lazy-script tests with network APIs blocked for desktop and mobile. Independent parallel first-load selection, missing-book messages, source-accurate copying, and no alignment assertion in either comparison direction.
- Browser/phone visual review offline, CJK glyph coverage and punctuation wrapping. No CDN, mandatory server or runtime conversion.
- `node build/import-kogoyaku1955.mjs --check`, `node build/validate-kogoyaku1955.mjs`, `node build/check-kogoyaku-source-independent.mjs`, `node build/test-kogoyaku1955.mjs`, `npm test`, `npm run check:stage1`, plus native/parallel checks when shared view code changes. Preserve and copy the existing historical LXX test fixtures unchanged for clean verification; do not regenerate expected outputs to pass.

## 9. Effort and unresolved blockers

Engineering estimates assume a rights-cleared witness and a reviewer competent in Japanese. They exclude waiting for rights responses and exhaustive historical proofreading; model/API expenditure has not been estimated.

| Requested area | Complexity | Indicative focused effort |
| --- | --- | --- |
| Acquisition and conversion | Medium; high while source identity is unresolved | 1–2 days |
| Text-integrity validation | High | 2–4 days plus independent Japanese review |
| Translation registration | Low | 0.25–0.5 day |
| Japanese names/aliases | Medium | 0.5–1 day |
| Search/reference support | Medium–high | 1–2 days |
| Desktop/mobile/offline regressions | Medium–high | 1–2 days plus manual devices |
| Attribution/documentation | Medium | 0.5–1 day |
| Additional native-segment/heading/coverage support | High | 2–4 days, overlapping search/testing work |

Overall: **medium–high**, roughly **8–15 engineering days with overlapping work**, plus legal/source clearance and independent textual review. A proven scalar-verse original could reduce the implementation burden, but cannot be presumed to exist. Full Japanese UI localization, vertical text, morphological search and optional ruby are outside the minimal launch.

| Blocker | Evidence needed to close it |
| --- | --- |
| B1 — Territorial rights | Current Luxembourg/EU analysis of the exact original and authorship/classification, including Article 71/treaty/transitional treatment; assess actual hosting territories or obtain adequate permission. |
| B2 — Original-edition artifact | One complete source with documented original-witness lineage, a reproducible pin and satisfactory edition/correction/punctuation audit. Current artifacts fail; no cross-source repairs. |
| B3 — Native-source representation | Reviewed additive design for combined labels, headings and narrower chapter extents, with concrete acceptance cases and existing-edition invariants. |

If B1–B3 are closed, reassess GO and ask for implementation approval. Until then, continue evidence gathering only. Do not turn a PD label, 66-book menu, or successful JSON parse into release clearance.

## 10. Standalone OpenCode handoff — BLOCKER RESOLUTION ONLY

```text
MARANATHA — JAPANESE KŌGOYAKU BLOCKER RESOLUTION
Model: DeepSeek V4.1 Flash through OpenCode.
OpenCode identifier: deepseek/deepseek-flash. Do not use DeepSeek Pro.

MODE: INVESTIGATION ONLY. This prompt does not authorize implementation.
Workspace: C:/maranatha/maranatha_new
Read docs/investigations/japanese-kogoyaku.md completely.
The only repository file you may create or modify is that report.
No Git mutations, branch switches, commits, merges or pushes. Preserve every
existing tracked/untracked change, including paused LXX work. Do not launch
other agents or send messages to publishers/maintainers without user approval.
External datasets and scripts may be examined in OS temporary storage only.

Verified starting evidence:
- JBS acknowledges Japanese expiry for the original 1955 edition while
  distinguishing later protected corrections. Report sections 2 and 3 contain
  primary URLs; Japan expiry is not a clearance for every digital file or
  every distribution territory.
- eKotoba native TXT:
  https://ekotoba.org/data/Kougo1955_Japanese.txt
  SHA256 dc146231c489d91d2e8c54b75557afeb592f130d3877e7353e7581f684e4e0be
  Its measured structure is 66 books, 1189 chapters, 31086 positive source
  segments / 31103 positions, 16 combined labels and 117 heading records.
  PSA31:17 and GAL5:12 match later JBS revision phrases. Heading anomalies
  include duplicate PSA24:0/47:0 and literal 49.0. It is not approved for import.
- Pinned Scrollmapper commit e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c:
  sources/ja/JapKougo/JapKougo.zip is byte-identical to the official CrossWire
  package, SHA256 76409195a7f7354774edfe3825f6b3b06801fbb283e85fb2a685fe9fb7716d9f.
  Its raw index has 473 empty entries; the listed 18 chapter grids are empty.
  The JSON exports are not a complete original witness. Never fill their holes.
- Wikisource/Salterrae/scans are further leads, not certified alternatives.

Resolve B1, B2 and B3 from primary evidence:
1. Establish current Luxembourg/EU treatment of the precise original work,
   authorship/publication classification and international/transitional rules.
   Do not mislabel the retrieved 2004 Luxembourg consolidation as 2022 law.
   Assess actual repository/hosting territory or document sufficient permission.
   Do not issue legal certainty from general copyright-duration arithmetic.
2. Locate and collate one faithful complete published original transcription.
   Record provider, edition lineage, rights/terms, immutable revision and hashes.
   Audit all native segments/headings against source, screen revisions and
   punctuation, and distinguish missing text, combined spans and annotations.
   Do not splice editions, reverse modernizations, guess text, discard headings
   or renumber Scripture. Stop on inaccessible or legally unsuitable sources.
3. Propose an additive source-segment schema and exact file manifest, with
   acceptance examples for combined labels, Psalm headings, native Daniel and
   Corinthians extents, Japanese aliases/input and kana-safe search/highlights.
   Existing scalar arrays/native blocks are reusable foundations, not proof
   that all these cases already work. Investigate without editing the app.

Preserve mandatory architecture for any later approved plan:
- Static file:// browser; local Bible data loads through classic script tags.
- No fetch for local Scripture, server, CDN or mandatory runtime build.
- Canon IDs remain unchanged; map 66 books explicitly; 7 DC books stay absent.
- Exact Japanese text/Unicode/punctuation and true native references; no
  unverified cross-translation alignment, duplicated bridge text, or guessed
  corrections. Japanese search works without word segmentation and preserves
  voicing and original-text highlight/copy boundaries. Full UI localization is
  optional; Japanese names/aliases and useful reference input are launch needs.
- Preserve every existing translation, locale, search and offline behavior.

Expected later implementation files, only after a separate GO and explicit
user approval: report section 7 lists the precise proposed source cache,
fetch/import/validation/independent-check/tests/name generator, JSON/JS data,
Japanese locale resources, licence/docs, and narrow app/style/index/package/
service-worker/attributes/documentation changes. Do not create them now.
An approved implementation would use a new codex/japanese-kogoyaku branch
from current main, with no automatic merge or push. Stop if licensing,
integrity or reviewed architecture assumptions fail.

Future acceptance must include source-exact coverage/Unicode/labels/headings,
all native bridges, source-valid/invalid references and switching, Japanese
aliases/full-width/no-space/章・節 input, voicing-safe substring search and
highlighting, desktop/mobile/parallel/copying, network-blocked file:// loading,
existing-translation regressions, npm test and relevant native/parallel checks.
Never weaken validators or replace historical baselines to force a pass.

Deliver an updated referenced report: verified facts, inferences and unresolved
items separately, hashes/counts/defects, current rights finding, recommended
single source if one is actually cleared, exact architecture and effort, and
GO / CONDITIONAL GO / NO-GO. If blockers remain, retain a blocker-resolution
handoff. Stop after the investigation and wait for the user's approval.
```

## 11. Broader Japanese translation search — 2026-10-08 addendum

The previous investigation compared **providers of Kōgoyaku**, not the whole Japanese translation landscape. This follow-up examines genuinely different translations. It does not infer that one edition's rights, textual defects or versification apply to another.

### 11.1 Comparison and practical priority

| Translation | Coverage and language | Rights evidence | Practical assessment |
| --- | --- | --- | --- |
| **文語訳 / Bungo-yaku: Meiji OT + Taishō NT** | Full Protestant Bible; literary Japanese and historical characters. Underlying OT 1887 / revised NT 1917. Actual CrossW
ire witnesses are OT printed 1953 and NT 
printed 1950.
| [CrossWire JapBungo](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=JapBungo) labels module PD. [JBS history](https://www.bible.or.jp/know/know19.html) distinguishes original translations; current JBS products also carry a 1982 date. | **First historical candidate to pursue.** Direct module inspection is much cleaner than JapKougo. Confirm exact witness, native labels, later editorial layers and territorial rights. Do not substitute a current JBS electronic edition. |
| **Japanese Freedom Bible / フリーダム・バイブル (`jpnm`)** | All 66 books are present in the current structured package; modern Japanese; publisher explicitly calls it a draft. | [Official eBible edition page](https://ebible.org/bible/details.php?id=jpnm) identifies eBible as official distributor, declares free/PD distribution, and requests draft feedback. This is a contemporary permission claim, not only an expiry calculation. | **First modern free-distribution candidate to pursue if draft status is acceptable.** Obtain translator/editorial provenance, confirm permission scope and commission independent Japanese review. It is a separate edition, not corrected Kōgoyaku. |
| **Open Translation Bible / オープン翻訳聖書 (OTB)** | Modern Japanese, offered from December 2025; 66-book repository layout with chapter JSON and PDF. Full text not audited in this follow-up. | [Publisher](https://www.openbible.uk/about/) and [source repository](https://github.com/OpenTranslationBible/open-bible) explicitly offer **CC BY-SA 4.0**. | **Additional modern open-licensed lead.** Licence is concrete, but Japanese translator/reviewer provenance, underlying source authority and full-corpus integrity remain to establish. Attribution/share-alike requirements accompany redistributed/adapted data. |
| **電網聖書 / Denmo** | Modern Japanese translated through WEB; draft dated 2002-03-03; only 13 NT books have text in the examined package. | [Translator's foreword](https://www.cozoh.org/denmo/foreword.htm) expressly permits copying, distribution and paid/free use; changing its contents requires a different name unless permission to keep “Denmo” is obtained. | Clearer direct reuse statement, **incomplete for a full-Bible launch**. Could be considered later as a clearly identified partial draft. Do not fill its missing books from another edition. |
| **Original Shinkaiyaku NT, 1965 (`jpn1965`)** | NT only; 27 biblical books plus an introduction; modern Japanese for its era. | [eBible](https://ebible.org/find/details.php?id=jpn1965) claims Japanese expiry at end-2015 and cites an earlier abandonment statement on Salterrae. Direct rights-holder abandonment authority was not established. | Useful NT-only lead, **not a complete Japanese Bible and not automatically a worldwide-PD escape from Kōgoyaku's legal issues**. It has native range labels. Never combine it with the later Shinkaiyaku OT and call that a cleared edition. |
| **Shinkaiyaku 1970/2003/2017 editions** | Established contemporary full Bible. | [Rights holder SNSK](https://new.seisho.or.jp/english/) reserves rights and directs app/publication permission requests to it. | **Permission route**, not an open dataset route. Full offline/repository redistribution needs an adequate licence and an authorized export. |
| **JBS New Interconfessional 1987/1988; JBS Interconfessional 2018** | Established modern full Bibles; editions with deuterocanonical books are offered. | [JBS copyright policy](https://www.bible.or.jp/read/bible_copyright.html) identifies their protected editions and limited-use policies. | **Permission route.** An online reader or a quotation allowance does not authorize bundling the complete text in Maranatha. |
| **Japanese Living Bible (JLB)** | Complete modern-language rendering; different translation approach from the preceding editions. | [BibleGateway's publisher notice](https://www.biblegateway.com/versions/Japanese-Living-Bible-JLB/) identifies Biblica copyright 1978/2011/2016, reserved worldwide rights and limited quoting; [Biblica permissions](https://www.biblica.com/permissions/) is the rights channel. | **Permission route.** No complete-Bible open redistribution licence was found. |
| **Japanese Orthodox translation tradition** | Historically important separate tradition associated with Nicholas and Nakai. | [Japanese Orthodox Church history](https://www.orthodoxjapan.jp/h-n.html) confirms the translation work. | Historical research lead. A complete, rights-cleared machine-readable 66-book artifact was **not** established in this search; it is not part of the practical full-Bible shortlist yet. |

This is a focused comparison, not an exhaustive catalogue of every Japanese translation. Publisher licence statements are reported as evidence, not replaced with blanket legal conclusions. Contemporary permission/licensing routes must establish that the licensor controls the material actually supplied. Historical routes must distinguish old translation text from later revision, typesetting, annotation and digitization layers.

### 11.2 Bungo: measured package findings

Examined the [official JapBungo ZIP](https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JapBungo.zip), **module 2.0, 2022-08-17**. Configuration explicitly identifies the 1953 OT / 1950 NT printed witnesses, UTF-8, OSIS, KJV-indexed zText, Salterrae as text source, and PD distribution. It supersedes `JapMeiji`; its history says the release solves `MOD-290`. This statement is not evidence that every remaining numbering issue is resolved.

Read-only inspection decompressed the book blocks and checked verse-index bounds and UTF-8. All **66 books** have text, across the **1,189-chapter KJV index**. Of 31,102 indexed verse slots, **31,099 are nonempty**, with **no wholly empty chapters** and no out-of-bounds entries. Empty slots are:

`EXO 7:25; 2SA 19:25; 2CH 2:13`.

Adjacent entries contain the relevant clauses: EXO 7:24 includes the seven-days clause; 2SA 19:26 includes the Jerusalem-arrival clause; 2CH 2:12 includes the sending-of-Hiram clause. These are consistent with joined/displaced boundaries rather than automatically lost Scripture. **The exact native printed labels and correspondence still require collation.** Do not fill the empty cells, split the adjacent text by guesswork, or invent a native bridge label solely from the KJV index.

The package is a substantially stronger **technical lead** than the damaged Kōgoyaku module, not a finished legal/textual acceptance. Its literary language, old kana/kanji and ruby/glosses affect readability and font testing. Older translation dates improve the historical-rights case, but a final assessment must concern the identified witnesses and layers, not simply “Bungo” in general. JBS's modern copyright notice is not proof that unchanged nineteenth-century text is newly protected; equally, an old title does not clear every modern electronic edition.

### 11.3 Freedom Bible: measured package findings

Examined [eBible's `jpnm_usfx.zip`](https://ebible.org/Scriptures/jpnm_usfx.zip). Strict UTF-8 decoding passed. The package contains **66 biblical books, 1,189 chapters and 31,103 verse records**, all with positive integer labels; no duplicate references were found in this inventory. **Five records have no main-text characters** when notes/references are excluded:

`LUK 17:36; ACT 8:37; ACT 15:34; ACT 24:7; ROM 16:25`.

These have source explanatory notes and must not be labelled automatically as transcription loss. Sample inspection confirmed manuscript-variant explanations for Luke 17:36 / Acts 8:37, and a Romans doxology-placement explanation for Romans 16:25. Preserve the edition's main-text versus note distinction. The inventory counted 1,200 footnote and 340 cross-reference elements; it also has Psalm superscriptions, poetry and other structured markup.

The official copyright material dates the source **2026-08-19** and explicitly identifies the translation as a **draft**. [Michael Paul Johnson's 2026-07-19 project note](https://mljohnson.org/2026/07/new-bible-translation-for-japan/) described work then completed only through Jeremiah; the later downloaded package now covers all 66 books. Both dates must be retained rather than confusing earlier incomplete coverage with current package coverage. Structural coverage does not prove finished editorial review.

No primary evidence examined here established that the Japanese text was AI-generated, and this report does **not** label it so. The translation workflow, translator identity/authority and extent of native-speaker/exegetical review remain questions to resolve. A complete contemporary draft could be imported faithfully **as a draft** after its rights, text and product choice are approved; it should not silently become the default established Japanese Bible.

### 11.4 OTB: reproducible licence lead, limited text examination

Pinned repository commit: **`31d411ac1c2d277242a3bd85697f354eaa11526b`**. [The pinned licence](https://github.com/OpenTranslationBible/open-bible/blob/31d411ac1c2d277242a3bd85697f354eaa11526b/LICENCE.md) states CC BY-SA 4.0. [The pinned Japanese directory](https://github.com/OpenTranslationBible/open-bible/tree/31d411ac1c2d277242a3bd85697f354eaa11526b/lang/ja-JP) has 66 book directories and **1,189 chapter JSON files**, plus three Japanese metadata JSON files; the API tree was not truncated.

Two downloaded chapter samples decoded as UTF-8 JSON. Genesis 1 has 31 numbered verse records **plus two unnumbered records**, rather than 33 verses; Exodus 1 has 22 numbered records. The numbered records inspected had nonempty text arrays. This illustrates why blindly importing every array element as the next verse would renumber Scripture. Unnumbered records, text-array boundaries and metadata must be identified by schema/source evidence.

No complete verse inventory, Japanese editorial provenance audit or underlying translation-source-rights verification was performed. The publisher's broad licence and availability claims justify further investigation, not instant adoption. Its “world's first open-source Bible” marketing phrase is not adopted as a verified historical fact. AI audio claims concern audio; they do not establish how the translated text was produced. For Maranatha, distinguish a licensed collection from a derivative adaptation and document appropriate credit, licence link, changes and share-alike obligations for the data; do not assume the whole application's code must change licence merely because it contains licensed text.

### 11.5 Partial editions and protected contemporary editions

The [official Denmo package](https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JapDenmo.zip), module **1.1.1**, has text in `MAT MRK LUK JHN ACT HEB JAS 1PE 2PE 1JN 2JN 3JN JUD` only: **13 books and 5,520 nonempty KJV-indexed verse entries**. Its module configuration explicitly states `Scope=Matt-Acts,Heb-Jude`. The rest of the broad KJV index is empty by scope, not a 66-book dataset needing repair. This matches its provider's partial-draft description and direct freedom-to-use statement.

The [1965 Shinkaiyaku NT USFX](https://ebible.org/Scriptures/jpn1965_usfx.zip) contains **27 biblical books plus `INT` introduction, 260 chapters and 7,939 verse segments**, with 18 non-scalar range labels and no empty main-text segment in this first inventory. Examples include `LUK 1:1-2`, `JHN 5:4-5` and `ROM 16:24-26`. Preserve these as source segments; this is not the later full Shinkaiyaku Bible. eBible's referenced abandonment statement still needs rights-holder-authority and territorial verification.

For the protected modern editions, no wholesale scraping or complete-text downloads were attempted. A negotiated publisher export and licence is a valid potential route, but the relevant permissions must cover offline copies, source/data in a public repository, hosting territories, updates and attribution. Quotation rights alone do not satisfy that use. No rights holder was contacted.

### 11.6 Pins observed for further reproducible work

All retrievals: **2026-10-08**. These are byte fingerprints of temporary research artifacts, not production approval. Direct package URLs are mutable: a later fetch must check these hashes or explain and re-audit a changed edition.

| Package | Bytes | SHA-256 |
| --- | ---: | --- |
| JapBungo 2.0 ZIP | 2,296,968 | `1acc5048206ba75ade77b3cb146568809a28151a53ce314cfc721d080aca75e6` |
| Japanese Freedom Bible USFX ZIP | 1,653,726 | `45b35f7c8e1d679f175709199c4dbb40ea906a30b2d8350bcaf3f19bae45aa54` |
| JapDenmo 1.1.1 ZIP | 344,068 | `28e8e1f2387a37bfeddefe1b73a9afbc9455e59d9336497452720e4c2cffacc3` |
| Shinkaiyaku 1965 NT USFX ZIP | 449,840 | `8dc57b5df31cfe806e32a0dbbe4e4080258c2fc04e426b0c36b1524efdab5cbb` |

### 11.7 Revised practical recommendation

**There are viable avenues beyond Kōgoyaku.** Prioritize:

1. **Bungo-yaku** for an established historical Japanese Bible, if literary Japanese fits Maranatha's intended audience. First resolve the three boundaries, source heading/ruby treatment, exact-witness rights and font/readability acceptance. Its audit burden is visibly smaller than the current Kōgoyaku package's missing chapters.
2. **Japanese Freedom Bible** for freely distributed modern Japanese, if an explicitly labelled draft is acceptable. First establish editorial/translator provenance and independent Japanese review. Its official structured source and note-only references are promising for the existing loader/availability architecture.
3. **OTB** as another modern licensed possibility, with full-corpus, provenance and licence-scope checks before ranking it above the preceding candidates.
4. **Publisher-licensed established modern translations** if polished contemporary reading is the priority and the user accepts a permission process.

Denmo and the original Shinkaiyaku NT are valid partial-edition leads, not replacements for a full Japanese Bible. This ranking is a **research priority**, not implementation authorization or automatic legal clearance. Japanese input, kana-safe search, native coverage, CJK layout and independent offline regression requirements in §§6–8 still apply; the source-segment complexity must be reassessed for the chosen edition rather than carrying Kōgoyaku's exact schema and file IDs into every candidate.

## 12. Standalone Flash handoff for the broader choice

```text
MARANATHA — JAPANESE EDITION SELECTION AND CLEARANCE
Use DeepSeek V4.1 Flash through OpenCode: deepseek/deepseek-flash, never Pro.
MODE: INVESTIGATION ONLY. No implementation, Git mutations, commit, merge or push.
Read C:/maranatha/maranatha_new/docs/investigations/japanese-kogoyaku.md,
especially the alternative-edition addendum in sections 11–12.
That report is the only repository file you may modify. Use OS temporary
storage for examination of published artifacts. Preserve all current work.

Do not assume Kogoyaku is the only Japanese option. Assess the priority leads:
- JapBungo 2.0: official CrossWire package, hash recorded in section 11.6;
  all 66 books have text, no empty chapters, three empty indexed slots whose
  clauses appear in adjacent entries. Verify native printed boundaries,
  original 1887/1917 versus actual 1953/1950 witness layers and territorial
  rights. Do not manufacture bridge labels or splice text into empty cells.
- Japanese Freedom Bible jpnm: official eBible USFX; all 66 books/1189 chapters,
  31103 labels, five note-only references. Publisher explicitly calls it a
  draft. Establish permission authority, translator/review provenance and
  faithful preservation of text, notes, superscriptions and numbering.
- Open Translation Bible Japanese: pinned commit and CC BY-SA licence in
  section 11.4. Verify the complete 1189 chapter files, unnumbered records,
  text-array semantics, authorship/source authority, licence obligations and
  Japanese editorial quality. Do not infer text generation methods from AI
  audio marketing. Two chapter samples are not a full-source certification.

Compare legal clarity, text integrity, literary versus modern Japanese,
coverage, importer/native-reference changes, offline tests and effort.
Keep protected modern Shinkaiyaku/JBS/JLB editions on a permission route;
do not scrape or bundle them under quotation permissions. Denmo (13 NT books)
and Shinkaiyaku 1965 (NT only) must remain clearly identified partial editions.
No contact with rights holders or maintainers without explicit user approval.

Update the report with verified facts, exact source pins, anomalies, current
territorial findings, an edition-specific file manifest and acceptance tests.
No guessed corrections, modernizations, combinations of editions, source
renumbering, altered canon, or unverified cross-translation correspondence.
Preserve file:// operation and local script loading, every existing edition,
Japanese input/voicing-safe search and faithful copying/layout requirements.

End with a defensible recommended edition and GO / CONDITIONAL GO / NO-GO.
If the choice includes a draft, make that product decision explicit. Stop on
unresolved licensing, integrity or architecture assumptions. Even if research
supports GO, stop and wait for the user's implementation approval; this prompt
does not authorize creation of importer/data/application files or a new branch.
```

## 13. Open Translation Bible follow-up — 2026-10-08

### Decision and scope

**CONDITIONAL GO for Japanese OTB; technically feasible, publication readiness unresolved.** This follow-up examines Japanese first because it follows the Bungo import. The publisher also offers Chinese, Korean and other languages, but this audit does not validate those datasets. No OTB Scripture was imported into Maranatha, and no application files, commits, branches, merges or pushes were created by this follow-up.

### Licence and provenance

Verified: the publisher explicitly offers digital redistribution and adaptations under **CC BY-SA 4.0**. Complete-book redistribution must retain appropriate credit and a licence reference. Supply publisher/source identification, the pinned revision, a licence link and a description of conversion changes; retain the same licence for adapted OTB data and impose no additional restrictions. This is an affirmative permission offer, so its terms do not require a separate permission request for permitted uses. It is not public domain. The licence is international; the permission is relevant to distribution from Luxembourg/EU, subject to the licensor controlling the material offered.

Primary sources:

- [Publisher Japanese distribution page](https://www.openbible.uk/ja-JP/kiji/bible-without-copyright/)
- [Pinned repository licence](https://github.com/OpenTranslationBible/open-bible/blob/31d411ac1c2d277242a3bd85697f354eaa11526b/LICENCE.md)
- [CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en), particularly sections 2–3 and 5.

The data licence must remain explicit and separate from the application code and other translations. Inclusion in a collection does not itself establish that the entire application's code must use the data licence; any adaptation of the OTB material needs its own compliant treatment. Packaging and any actual adaptations should be reviewed before release.

Unresolved: the reviewed publisher pages and repository README do not identify the Japanese translators, Hebrew/Greek source editions, translation workflow, or independent Japanese editorial review. The publisher's English similarity comparison is not evidence establishing Japanese accuracy or rights provenance. This investigation does not establish that the text is AI-generated, human-translated, or professionally reviewed. Do not import such claims from unrelated projects with similar names.

[Publisher overview](https://www.openbible.uk/about/) and [pinned README](https://github.com/OpenTranslationBible/open-bible/blob/31d411ac1c2d277242a3bd85697f354eaa11526b/README.md) are the reviewed primary descriptions. The Japanese edition is listed as launched in December 2025. No publisher contact was made.

### Reproducible source and complete structural audit

Recommended technical source: `OpenTranslationBible/open-bible`, commit **31d411ac1c2d277242a3bd85697f354eaa11526b**, under `lang/ja-JP/`. This is the examined edition, not a promise to track whatever later appears on `main`.

[Exact Japanese source tree](https://github.com/OpenTranslationBible/open-bible/tree/31d411ac1c2d277242a3bd85697f354eaa11526b/lang/ja-JP)

Downloaded all **1,192 JSON files** to temporary storage: 1,189 chapter files plus `books.json`, `booksSlug.json` and `lang.json`. Total raw JSON payload: **8,679,791 bytes**. Each file's Git blob SHA-1 was independently recomputed from its bytes and matched the previously retrieved pinned recursive tree; a SHA-256 manifest was also recorded. No mismatch occurred. UTF-8 decoding used fatal error handling, and no U+FFFD replacement characters were found in chapter record text.

| Check | Result |
| --- | --- |
| Protestant book directories | 66 |
| Chapter files | 1,189; chapter sequences contiguous in every book |
| Numbered records | 31,103 |
| Empty numbered text, duplicate verse IDs, internal numbering gaps | None |
| Nonpositive/noninteger verse IDs or unexpected record schema | None |
| Out-of-order numbered records | None |
| Numeric-only placeholders | **2: MAT 23:14 = `[14]`; JHN 5:4 = `[4]`** |
| Other numbered records | 31,101; not a semantic completeness or accuracy certification |
| Unnumbered records | 3,777: 3,636 separators (`---`), 138 Psalm textual records and 3 NT textual notes |
| Chapter verse-bound differences from current Bungo arrays | 3JN 1: OTB 15, Bungo 14 |
| Chapter field versus numeric filename suffix | No mismatch; Psalm filenames use three digits |

The record shape is `{ verse: integer, text: string[] }`; unnumbered records omit `verse`. Every chapter has `book`, `chapter`, `verses`. Text arrays contain 1–8 strings, so segment boundaries must survive conversion. Do not turn array positions into verse numbers or blindly join all strings with spaces.

The three non-Psalm unnumbered textual notes occur at MRK 16, JHN 7 and JHN 8. They concern manuscript variants and must remain distinguishable from Scripture. The chapter `book` field has spelling/spacing variants across **20 book directories**, so canonical mapping must use a verified numbered directory manifest, not free-text chapter titles. Retain source labels in provenance; add appropriate name aliases without rewriting Scripture.

These checks establish structural coverage and faithful retrieval. They do not prove every verse contains a correct or complete translation. In particular, two populated JSON records contain no Scripture text, and other bracketed records include editorial language or disputed passages. Never describe the source as 31,103 fully translated verses solely from the record count.

Temporary audit evidence is under `C:/Users/Marie Dalia/AppData/Local/Temp/maranatha-japanese-alternatives-20261008/`: `otb-ja-audit.json`, `otb-ja-special-audit.json`, `otb-ja-manifest.json`, the retrieval/audit scripts and `otb-full-ja/`. These temporary files are not repository dependencies and must be replaced with a reproducible, pinned build-source package if implementation is approved.

### Compatibility after Bungo

Verified by code inspection: `app.js` registers translations, supports `nativeVersification` and `nativeReferenceScope`, renders `psalmHeadings`, and already has Japanese reference aliases and kana-safe substring search. `data/locales/ja.js` and `ja.json` now exist. Bungo-specific tests provide a useful regression model. No new server, runtime build process, local `fetch()`, or mandatory Japanese tokenizer is needed for an OTB launch.

Minimal proposed approach:

1. Preserve pinned source bytes, Git/blob and SHA-256 checksums, licence and a manifest; convert at development time to `data/otb-ja.json` plus a `<script>`-loadable `data/otb-ja.js`.
2. Map the 66 numbered source directories explicitly to existing canonical identifiers. Derive chapter/verse bounds from this source. Keep 3JN 1:15 valid without changing the global canon or any existing edition.
3. Initially register with native verse scope and independent reading blocks; do not infer cross-translation alignment from matching integers.
4. Preserve text segments and all unnumbered records in metadata. Assess whether existing Psalm-heading rendering can cover all positions; the three NT notes and separators need explicit rendering/metadata decisions. Keep notes out of ordinary verse-copy text. Preserve and disclose the two numeric placeholders without filling or silently deleting them.
5. Reuse Japanese input/search behavior and add only verified missing OTB aliases. Japanese UI localization is optional; Japanese Scripture display and references are required.
6. Provide visible OTB attribution and offline licence documentation. Keep its CC BY-SA terms distinct from Bungo and other editions.

Potential implementation files, subject to resolving blockers: `build/import-otb-ja.mjs`, source manifest/cache under `build/sources/otb-ja/`, `data/otb-ja.json`, `data/otb-ja.js`, `data/LICENSE-otb-ja.md`, `docs/OTB_JA.md`, focused integrity/UI checks, and translation registration in `app.js`. Modify `index.html`, `data/locales/ja.json`, `data/locales/ja.js`, `style.css` and `package.json` only where integration requires it. No alteration of existing Scripture or paused LXX work is authorized by this investigation.

### Effort and acceptance

Planning estimate, assuming provenance and editorial policies resolve: **medium complexity, roughly 2–4 developer days** with independent review. Acquisition/conversion: low–medium (half a day). Integrity/metadata validation: medium (half to one day). Registration/aliases/search: low–medium (half a day). Offline desktop/mobile regression plus segment/note copying: medium (half to one day). Attribution/documentation: low (a few hours). Publisher clarification or qualified Japanese review has no reliable elapsed-time estimate.

Acceptance must check all pinned bytes and records independently; exact text and segment round trips; every source chapter bound and 3JN 1:15; both placeholders; all 138 Psalm records, three NT notes and separators; Japanese full-width/no-space references, kana voicing and search highlighting; source-preserving copying; desktop/mobile layout; actual `file://` operation with network disabled; comparison guards; and the entire existing test suite without changing historical baselines or Scripture to satisfy validators. Current findings are dataset and code audits, not an OTB browser test.

**Blockers:** establish or clearly disclose translation provenance and editorial-review status; independently sample Japanese fidelity; agree on transparent handling of placeholders/variant notes/segments; verify the proposed conversion and packaging meet the licence. Existing infrastructure makes importing it feasible. The remaining decision is whether this recent translation meets Maranatha's editorial standard.

### Standalone blocker-resolution prompt for DeepSeek V4.1 Flash via OpenCode

```text
Use DeepSeek V4.1 Flash through OpenCode (deepseek/deepseek-flash), never Pro.
Investigate Japanese Open Translation Bible readiness for Maranatha. This is
blocker resolution only: do not import Scripture into repository data, edit
application files, implement features, commit, merge or push.

Read docs/investigations/japanese-kogoyaku.md section 13. Source is exclusively
OpenTranslationBible/open-bible commit
31d411ac1c2d277242a3bd85697f354eaa11526b, lang/ja-JP/, under CC BY-SA 4.0.
The complete downloaded JSON audit has 66 books, 1189 chapters, 31103 numbered
records, two numeric-only placeholders MAT23:14/JHN5:4, 3636 unnumbered
separators, 138 Psalm textual records and three NT unnumbered textual notes.
Keep 3JN1:15. Never invent, fill, renumber, combine editions or silently correct
source text. Preserve segment boundaries and source bytes/checksums.

Resolve from primary documentation the Japanese translation workflow, source
texts, translator/editor attribution and review status. Distinguish verified
facts from absent documentation and inference. Do not assume AI provenance.
Inspect representative fidelity and special records without claiming complete
linguistic validation. Do not contact the publisher without user authorization.
Propose source-preserving treatment of placeholders, variant notes, separators
and multiline segments; assess CC BY-SA conversion and distribution terms.

Read repository code only. Reuse Bungo Japanese aliases/search, native verse
scope and independent rendering when assessing implementation. Preserve every
existing translation, paused LXX work, file:// operation and local script-tag
loading. No local Bible fetch(), mandatory server or runtime build environment.
Only update the existing investigation report. Temporary external examination
is permitted. Stop on unresolved licensing, integrity or architecture assumptions.

Deliver a defensible GO/CONDITIONAL GO/NO-GO and exact future file/test manifest.
If cleared, prepare a separate implementation prompt requiring a separate
codex/otb-japanese branch, independent source/text validation and offline UI
regressions, with no automatic merge or push. Wait for implementation approval.
```
