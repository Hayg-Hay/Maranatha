# Coptic Bible sources for Maranatha

Research date: **Sunday, 2026-10-18** (Europe/Luxembourg).
Scope: source discovery and comparison, following the earlier Asian-language
investigations. Documentation only; no Bible import or application changes.

## Recommendation

**Investigate Bohairic first**, given the user's visit to a Coptic church.
Bohairic is the contemporary church-language candidate; Sahidic deserves a
separate edition entry for historical study. The dialect distinction is supported
by the authors of [A UD Treebank for Bohairic Coptic](https://arxiv.org/abs/2504.18386).
Do not label either dataset simply “the official Coptic Bible.”

The simplest first import lead is **eBible `copbhc`, Bohairica 1.2**, a
Horner-based Bohairic New Testament standardized by J. Warren Wells. eBible
declares it public domain and offers USFM/USFX. For wider Bohairic coverage,
investigate **Coptic Scriptorium's `bohairic.nt` and `bohairic.ot`** next.
These are candidate priorities, not completed fidelity or redistribution audits.

## Sources found

Coverage below is the provider's description, not a measured inventory of
downloaded Scripture. No archive was downloaded or byte-pinned in this survey.

| Edition / source | Dialect and stated scope | Availability and rights evidence | Assessment |
| --- | --- | --- | --- |
| [eBible COPBHC / `copbhc`](https://ebible.org/details.php?id=copbhc) | Bohairic NT; **Bohairica 1.2, 2006-12-14**; Horner-based, contributed by Wells | USFM, USFX, VPL/SQL, SWORD, HTML, EPUB, PDF; distributor declares **Public Domain** | Best first technical lead. Preserve its standardized-edition identity; verify the actual package and included notice. |
| [Scriptorium Bohairic NT](https://data.copticscriptorium.org/texts/bohairicnt/) and [OT](https://data.copticscriptorium.org/texts/bohairicot/) | Separate Bohairic NT/OT corpora; source credited to Marcion / Hany Takla in inspected chapters | TEI XML, PAULA, ANNIS and [GitHub data](https://github.com/CopticScriptorium/corpora); inspected Matthew 1 and Genesis 1 explicitly link **CC BY-SA** | Strong broader route. Count actual books, chapters, gaps and source units; capture the exact linked licence version from selected files. |
| [Scriptorium manually reviewed Mark](https://data.copticscriptorium.org/texts/bohairicmark/bohairic-gospel-of-mark-10-digital-edition/sahidica/) and [1 Corinthians](https://data.copticscriptorium.org/texts/bohairic1corinthians/bohairic-1-corinthians-1-digital-edition/) | Bohairic book corpora, distinct from the larger automatically processed corpus | Inspected metadata declares Coptic text PD and complete annotated files **CC BY 4.0** | Useful comparison witnesses; do not extrapolate their terms or editorial status to every Bohairic file. |
| [CrossWire `CopSahHorner`](https://crosswire.org/sword/modules/ModInfo.jsp?modName=CopSahHorner) | Sahidic NT, edited by G. W. Horner; catalog gives 1911 | SWORD **1.5, 2009-11-01**, **Public Domain** declaration | Best historical Sahidic NT alternative; archive coverage, transcription fidelity and exact volume provenance remain unverified. |
| [eBible COPSHC / `copshc`](https://ebible.org/details.php?id=copshc) and [CrossWire `CopSahidica`](https://crosswire.org/sword/modules/ModInfo.jsp?modName=CopSahidica) | Sahidica, Wells' standardized Sahidic NT | eBible USFM/USFX and other formats; CrossWire **1.0, 2007-04-26**. Copyrighted, with a specific free-electronic-edition grant | Viable conditional alternative. Not PD or blanket Creative Commons. Edition notices differ: eBible says 2000–2006; CrossWire says 2000–2008. Preserve the chosen package's notice. |
| [Scriptorium Sahidic OT licence/source page](https://copticscriptorium.org/download/corpora/sahidic_bible_ot.html) | Sahidic OT texts from the Göttingen CoptOT project | Explicit **CC BY-SA 4.0**; historical versions came from the earlier CrossWire/add-on route | Strong Sahidic OT lead. Actual coverage and surviving gaps need inventory; “OT corpus” does not establish a complete Bible. |
| [CrossWire `CopSahBible2`](https://crosswire.org/sword/modules/ModInfo.jsp?modName=CopSahBible2) | Sahidic Bible 2, based on Askeland/Schulz, incorporating CoptOT/INTF work | SWORD **1.3, 2020-04-10**; catalog declares **Creative Commons: by-sa** | Alternative structured source. Confirm exact licence version, OT/NT contents and relationship to current Scriptorium files. |
| [CrossWire `CopNT`](https://crosswire.org/sword/modules/ModInfo.jsp?modName=CopNT) | Catalog calls it Coptic NT, without identifying dialect | SWORD **1.0.1, 2009-11-01**; indirect Unbound/forum provenance citing Deir Anba Bishoi; licence field is **null** | Hold: identify edition/dialect and establish rights before considering import. |
| [CrossWire `CopSahidicMSS`](https://crosswire.org/sword/modules/ModInfo.jsp?modName=CopSahidicMSS) | Wells' raw Sahidic manuscript texts used for Sahidica | SWORD **1.0, 2009-11-01**; copyrighted, free noncommercial distribution; commercial/print permissions restricted | Research companion, lower priority for ordinary reading. Publisher describes unpunctuated, conjoined words. |
| [Marcion](https://marcion.sourceforge.net/) / [SourceForge text downloads](https://sourceforge.net/projects/marcion/files/1.8/texts/) | Bohairic and Sahidic Bible source leads | Compressed database dumps; upstream for some Scriptorium material | Useful for provenance and comparisons. Software GPL terms alone do not establish terms for every bundled text. Prefer documented corpus metadata for selection. |

## Important distinctions

**Bohairica is an edited text, not an untouched Horner transcription.** eBible
describes changes to paragraphing, punctuation and expanded sacred-name
abbreviations. Its PD declaration is recorded as distributor evidence, rather
than an independently established worldwide legal conclusion.
Source: [eBible edition notice](https://ebible.org/details.php?id=copbhc).

**Sahidica has its own permission conditions.** The published notice allows
free electronic NT editions with full title/copyright credit; print requires
written permission. Scriptorium's inspected Sahidica Mark metadata also says
academic use only, while CrossWire classifies distribution as noncommercial.
Resolve the selected artifact's applicable terms before release. Sahidica
normalizes spelling/punctuation and expands sacred names; its notice identifies
omitted John 7:53–8:11 and bracketed Mark endings. Preserve these editorial
features rather than filling apparent gaps from another translation.
Sources: [original notice reproduced by Scriptorium](https://copticscriptorium.org/download/corpora/Mark/coptic_nt_sahidic.html),
[Mark metadata](https://data.copticscriptorium.org/texts/new-testament/41_mark_7/sahidica/).

**Scriptorium's current holdings exceed the old two-book Bohairic pilot.**
The December 2024 release added wider Bohairic OT/NT corpora; the July 2026
release is **6.3.0** and adds manually annotated Bohairic Jonah. Manual
annotation and automatic processing describe different levels of linguistic
review; neither certifies every underlying Scripture character.
Source: [project release announcements](https://blog.copticscriptorium.org/).

**Provenance and licences vary within Scriptorium.** Inspected broad-corpus
[Matthew 1](https://data.copticscriptorium.org/texts/bohairicnt/01_matthew_01/)
and [Genesis 1](https://data.copticscriptorium.org/texts/bohairicot/01_genesis_01/)
credit Marcion / Hany Takla and link CC BY-SA. The separate reviewed Mark/1 Cor
metadata instead describes PD Coptic text plus CC BY 4.0 annotated files and
says the likely Horner ancestry was not checked against print/manuscripts.
Keep these witnesses and notices distinct.

**English context is not necessarily translated from the Coptic.** The inspected
Matthew metadata identifies WEB; Genesis identifies Brenton. They are separate
companion texts, not evidence that the Coptic matches English verse for verse.

## Before a future import

1. Download and pin the selected USFM/USFX or corpus release, record SHA-256,
   edition, source URL/date, attribution and complete licence notice.
2. Inventory real books/chapters/verse labels, empty units, omissions, combined
   labels, headings and notes. Do not assume 27 complete NT books or a complete
   OT because a catalog uses “Bible.”
3. Check samples against the named edition, especially book boundaries, Mark
   16 and John 7–8. Distinguish source omissions from extraction errors.
4. Preserve Coptic letters, combining marks, punctuation and source word
   spacing. Use left-to-right text and a locally bundled, licensed Coptic font;
   confirm actual glyph coverage. Keep search normalization separate from display.
5. Audit OT reference numbering independently, particularly Psalms and Greek
   additions. Do not force Coptic material into existing canon rows by count.

## Decision to carry forward

**First:** audit eBible Bohairica 1.2 (`copbhc`) as a standalone Bohairic NT.
**Next:** inventory Scriptorium Bohairic OT/NT for wider coverage, preserving
their separate source identity. **Sahidic options:** Horner NT first for a
historical PD-labelled route; Sahidica for a standardized edition subject to
its specific terms; Göttingen/Scriptorium for OT material.

This report establishes available leads and reported conditions. Completeness,
exact file fidelity and final release eligibility remain open. No maintainer
was contacted; no import, tests, commit or push was performed.

## Implementation checkpoint — 2026-10-18

The user subsequently authorized implementation. eBible Bohairica 1.2 is now
imported as `bohairica` / BOH: 27 NT books, 260 chapters, 7,956 numbered source
records and 7,957 positions. Acts 24:7 is a source gap; six records contain only
the source's `[ ]` marker and are tagged as placeholders; 3 John has 15 verses.
Source numbering is displayed independently throughout. Source archives/notices,
Coptic book names and a local OFL font are retained.

Independent ZIP/USFX verification reproduced every title, numbered unit, word,
punctuation mark and chapter boundary, and confirmed Mark 16, John 7–8, the
single gap and the native combined/endings. Dedicated desktop/mobile tests,
comparison/search/interlinear guards, service-worker checks and the full
`npm test` passed. Desktop and mobile-breakpoint headless Chrome review found no
missing glyphs. See [BOHAIRICA.md](../BOHAIRICA.md) for results and remaining
limits (no print collation or physical-device acceptance). No commit, merge or
push.
