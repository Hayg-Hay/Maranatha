# Peshitta / Syriac and English companions

Investigation, 2026-10-09. User has contacted the Western Armenian publisher;
Armenian permission/transcription work waits. This investigation seeks a
redistributable P

eshitta and an English companion, with attention to MarYa.
No source import, model-generated translation or Scripture modification.

## Recommended first pairing

**Syriac:** CrossWire `Peshitta` 2.0, 2020-02-08, language `syr`, distribution
declared **Public Domain**. The distributor identifies the British and Foreign
Bible Society's **1905** text and credits John Richards. Pin the actual SWORD
archive and inspect its book coverage, styles, marks, verse units and gaps
before importing; the product title alone does not establish a full OT+NT Bible.
The 1905 source is the NT candidate for this first pairing.

Source: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Peshitta

**English:** CrossWire `Murdock` 1.2, 2002-01-01, **Public Domain**, with
footnotes. Its notice identifies a literal Syriac translation and publication
in **1852**. Preserve that supplied edition identity instead of substituting
the first-publication year from generic descriptions. This is the clearest
English NT companion lead, pending archive/profile and text fidelity checks.

Source: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Murdock

**Alternative English:** `Etheridge` 1.1.1, 2008-07-01, **Public Domain**, with
footnotes. The source describes the 1846 Gospels and 1849 Acts/Epistles volumes,
explicitly adding remaining epistles and Revelation from a later Syriac text.
Keep that textual provenance visible rather than calling every included book
part of the original Peshitta NT corpus.

Source: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Etheridge

## The user's MarYa requirement

**Accepted refinement:** the user wants unchanged English and will simply
consult the Syriac; no MarYa substitution or annotation layer is planned.
The pinned archive now verifies the target word at 1 Corinthians 12:3.
See [peshitta-raw-probe.md](peshitta-raw-probe.md) for scope, boundary findings,
English conversion warnings and remaining source gates.

The Syriac word is **ܡܪܝܐ**, commonly transliterated **Māryā / MarYa**.
The published Syriac 1 Corinthians 12:3 text includes the phrase
**ܕܡܪܝܐ ܗܘ ܝܫܘܥ**, applying the title to Jesus. Preserve the actual source
word. Final acceptance should verify the selected archive at this verse and
related passages, not assume every modern serializer is identical.

Text witness: https://www.biblindex.org/en/bible/novum-testamentum-syriacum/1-co-12%3A3

The older English companions generally translate the title as Lord rather
than printing MarYa. An English translation from Syriac and an English edition
literally retaining MarYa are therefore separate requirements. No open English
edition consistently retaining that spelling was established here. Do not
replace words in Murdock/Etheridge and present the altered text as their edition.
A clearly separate transliteration/word annotation beside the Syriac could make
the term visible without altering either source translation.

Modern Bauscher editions demonstrate explicit renderings such as LORD JEHOVAH,
but the inspected publisher listing specifies all rights reserved and also
describes a distinct edition using LOVE ETERNAL / LOVE terminology. Pin the
exact edition if ever pursued; neither online availability nor similarly named
PDFs establish an open licence. No open redistribution grant was established
for Bauscher, Lamsa or Roth in this investigation.

Publisher listing:
https://www.lulu.com/shop/rev-david-bauscher/the-holy-peshitta-bible-translated/ebook/product-1pg9r4rv.html

## Scope and Old Testament route

The historical Peshitta NT has **22 books**, excluding 2 Peter, 2–3 John,
Jude and Revelation. Later Syriac editions may supply all 27. Audit each actual
package and disclose the source/tradition of additions; do not silently fill
them from a different witness or describe a 27-book compilation as a uniform
22-book original. This is a textual-history/scope issue, not an app defect.

Scholarly reference: https://dev.gedsh.bethmardutho.org/entry/Peshitta.html

ETCBC's `peshitta` is an **OT research dataset**, with Leiden Peshitta Institute
plain text stated as **CC BY-NC** in its own provenance document. Linguistic
annotations/conversions have additional terms described there. It is a possible
noncommercial OT route, subject to exact files, licence scope/version,
inventory and attribution audit. Do not claim that a site's bibliography CC BY
licence covers the underlying Bible text. Do not silently combine this OT with
BFBS NT and call the result a single historical edition.

Source: https://github.com/ETCBC/peshitta/blob/master/docs/about.md

Dukhrana offers Syriac textual witnesses, English comparisons and analysis.
Its existence is useful for comparison, not a blanket right to redistribute
all modern lexicon/tagging/font datasets. Use explicit source-specific grants.

Source: https://www.dukhrana.com/peshitta/

## Implementation after selection

Start with the Syriac NT candidate plus Murdock as independently credited
English companion, keeping the MarYa word visible in Syriac. Use RTL verses,
local Syriac fonts and source vowel/diacritic preservation. References and
search must map transformations back to exact original text; headings,
footnotes and glosses remain distinct and collapsed below reading.

Pin archives and actual edition identities; inspect 22/27-book scope, missing
units and reference exceptions before enabling comparison rows. Use existing
SWORD byte readers as a starting point, not blind reuse of a canon-shaped
extractor. The Armenian investigation demonstrated why counts alone do not
certify source boundaries. Only choose OT after a separate source/rights audit.

Follow README: Codex handles architecture and complex source decisions,
establishes basic functionality, then gives a concise ASCII prompt for manual
DeepSeek fidelity/integration/regression checks, routine fixes, staged diff
review and commit/push. No full regression suite for this research.

## Implementation checkpoint

The user authorized implementation. Syriac and Murdock datasets, reading and
source-unit ledgers are implemented; a basic smoke passed. No English MarYa
substitutions or annotation layer. Independent fidelity/integration/regression
checks remain with manual DeepSeek handoff. See [../PESHITTA.md](../PESHITTA.md).
