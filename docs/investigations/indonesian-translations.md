# Indonesian editions for Maranatha

Initial source-selection research, 2026-10-09. This is not an import or a
certification of completeness, translation accuracy, or verse correspondence.
No application or Scripture data was changed for this investigation.

Follow-up: the user selected AYT. It is now implemented from the official
repository snapshot, with an independent CSV/SFM audit and chapter-specific
comparison exceptions. See [implementation notes](../AYT.md).

## Shortlist

### Alkitab Yang Terbuka (AYT)

Strongest first candidate for a free, non-commercial full-Bible addition. The
publisher, Yayasan Lembaga SABDA (YLSA), describes an edition intended for the
digital era and easier understanding. Its official repository supplies SFM,
CSV, JSON, SQL and VPL datasets, including per-book SFM files from Genesis
through Revelation. Directory coverage is not a full record audit.

The publisher retains copyright in the text, permits non-commercial usage and

distribution, and describes derivative formats/resources using BY/NC/SA terms.
The checked notice does not specify a numbered Creative Commons licence
version; do not silently label it CC BY-NC-SA 4.0. Preserve the exact notice and
keep the edition's text licence separate from the application code licence.

Sources: [publisher terms](https://ayt.co/hakcipta),
[publisher background](https://ayt.co/latar_belakang),
[official datasets](https://github.com/sabdacode/ayt),
[per-book SFM](https://github.com/sabdacode/ayt/tree/main/sfm/per-books).

### Terjemahan Sederhana Indonesia (TSI), third edition

Plain-language candidate with explicit CC BY-SA 4.0 terms. eBible credits
Albata and Pioneer Bible Translators, copyright 2021, and offers USFX and USFM.
The inspected eBible table of contents lists **48 books: 21 OT and all 27 NT**.
This source must not be advertised as a complete 66-book Bible. Its metadata
also retains a description referring to the second-edition NT, despite the
third-edition page title. Reconcile the downloaded source edition and coverage
before importing. This inventory concerns that particular eBible distribution,
not a claim that Albata has no newer or more complete edition elsewhere.

Sources: [edition and licence](https://ebible.org/find/details.php?id=ind),
[actual distributed table of contents](https://ebible.org/ind/).

### Biblica Open Indonesian Contemporary New Testament 2025

Promising modern NT-only alternative. Open.Bible lists the Open Kitab Kehidupan
Perjanjian Baru, provided by Biblica, published on its platform in May 2026.
USX and Paratext/USFM downloads are supplied. The product is labelled CC BY-SA;
the exact licence version, notices and any trademark provisions must be read
from the downloaded package rather than inferred from the general platform text.

Source: [official product and downloads](https://preview.open.bible/bibles/68deaeff41a2a80e0f0824d5).

### Terjemahan Lama (TL)

Historical full-Bible lead, combining the Klinkert OT with the Bode NT. The
older Malay wording makes it a historical companion rather than the first
choice for accessible contemporary reading. SABDA's history discusses the
language difference and the older translation components.

CCEL supplies XML/text derived from Unbound Bible, but explicitly states that
book names, introductions, titles and paragraphs were unavailable. The source
therefore requires an edition-specific licence/provenance and completeness
audit. SABDA's TL notice identifies historical editions and translators but
does not itself give an explicit public-domain or blanket redistribution grant.
Do not infer rights merely from the word "Lama" or online availability.

Sources: [CCEL source description](https://www.ccel.org/ccel/bible/idlam.html),
[SABDA notices](https://copyright.sabda.org/content.php),
[translation history](https://sejarah.sabda.org/artikel/dicari_penerjemah_alkitab/).

### Terjemahan Baru (TB) and its later revisions

LAI identifies the original TB publication as 1974 and explains its revision
programme. SABDA's notice attributes copyright to LAI and describes nonprofit
scholarly/personal use, rather than a general open licence. LAI also describes
checking texts for digital platforms and collaborating with application
developers. Treat this as a publisher-permission/source-terms route, not an
automatically approved full offline redistribution. Distinguish TB from TB2
and other later revisions.

Sources: [LAI translation history](https://www.alkitab.or.id/berita/272-45-tahun-alkitab-terjemahan-baru-mengapa-alkitab-diterjemahkan-dan-direvisi),
[LAI digital-platform discussion](https://alkitab.or.id/berita/279-upaya-menjaga-kemurnian-teks-alkitab-tetap-terjaga),
[SABDA notices](https://copyright.sabda.org/content.php).

### Open Translation Bible, Indonesian (`id-ID`)

The publisher repository lists 66 Indonesian book directories and supplies the
same chapter JSON structure used by OTB-JA. The publisher's README already
cached for the Japanese import identifies a December 2025 launch and CC BY-SA
4.0 terms. This is technically familiar but requires an independent Indonesian
coverage, source-note and provenance audit; Japanese validation cannot be reused
as evidence for the Indonesian text. Keep it distinct from established Indonesian
translations and investigate its translation/editorial provenance before ranking
it alongside them.

Source: [publisher Indonesian directory](https://github.com/OpenTranslationBible/open-bible/tree/main/lang/id-ID).

## Implementation acceptance for the selected source

Pin exact source bytes, licence and retrieval date. Inventory all books,
chapters, source labels, combined passages, missing records, headings and notes.
Preserve source words without modernization or filling gaps from another edition.
Add Indonesian book names and aliases using the selected source's labels.

Establish the numbering scheme and document exceptions before enabling shared
comparison rows. Do not apply a blanket native-numbering exclusion merely because
this is a new language. Keep notices accessible below the reading passage, with
the recent Chinese collapsed-note behavior as the model. Verify local script
loading, search and references on desktop/mobile with network blocked.
