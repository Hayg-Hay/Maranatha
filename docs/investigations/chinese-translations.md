# Chinese translation source selection

Date: 2026-10-09. Follow-up to the completed Bungo-yaku and OTB-JA additions.
Chinese comes next; South Asian languages follow. This document records initial
source selection, not a completed Scripture import or accuracy certification.

Follow-up: the user selected **Traditional Chinese New Punctuation CUV**. It is
now implemented from separately audited, pinned USFX/USFM sources as CUV-T,
retaining 上帝 wording. See [implementation notes](../CUV_TRADITIONAL.md).
The VPL findings below explain why the implementation uses structured sources.

## Candidate sources

| Candidate | Publisher/distributor evidence | Scope and next check |
| --- | --- | --- |
| Chinese Union Version, Traditional (`ChiUn`) | CrossWire lists version 3.1, dated 2023-10-28, language `zh-Hant`, distribution licence Public Domain, and describes the translation first published in 1919. | Preferred historical lead; inspect the exact module, source attribution, indexed gaps, notes and headings before importing. |
| Chinese Union Version, Simplified (`ChiUns`) | CrossWire lists version 3.1, dated 2023-10-28, language `zh-Hans`, distribution licence Public Domain, and identifies FHL as a source link. | Companion source edition; audit independently rather than generating it from Traditional text. |
| New Punctuation CUV, Simplified (`cmn-cu89s`) | eBible identifies it as 新标点和合本, labels it public domain, and offers USFM, USFX and VPL archives. | Explicitly label the new-punctuation edition; its public Genesis 1:1 / John 3:16 samples use 神. |
| New Punctuation CUV, Traditional (`cmn-cu89t`) | eBible identifies it as 新標點和合本, labels it public domain, and offers the same source formats. | Its public Genesis 1:1 / John 3:16 samples use 上帝. These two eBible sources are not merely a script conversion pair. |
| Open Chinese Contemporary Bible, Simplified (`cmncbs`, OCCB) | eBible credits Biblica, lists copyright years 1979, 2005, 2007, 2011, 2022, and supplies CC BY-SA 4.0 terms with attribution and trademark provisions. | Modern translation candidate. Preserve the exact copyright notice and assess treatment of conversion under the supplied trademark terms. |
| Open Translation Bible, Simplified (`zh-CN`) | OTB's repository lists the Chinese edition and CC BY-SA 4.0. The README already cached for the Japanese import records its December 2025 launch. | Shares a source format with OTB-JA, but requires its own full source audit. Japanese validation does not validate Chinese. |

Public-domain labels above are the distributors' statements about their files;
they do not establish a separate worldwide legal determination or printed-edition
fidelity. Initial VPL record totals were checked below; complete native-reference
coverage and text accuracy remain unverified.

## Initial recommendation

Start with the Chinese Union Version in both scripts, using separately pinned
source artifacts. CrossWire's 1919-labelled modules are the first historical
lead. eBible's new-punctuation sources are another concrete option, with edition
names and 神/上帝 wording disclosed accurately. A modern second translation can
be selected separately; Biblica OCCB and OTB Chinese are candidates, not approved
imports.

Keep Chinese Scripture verbatim. Do not use machine translation, automatic script
conversion, wording substitutions, or another Bible to fill absent source records.
Pin downloaded archive bytes and hashes, preserve source metadata, and produce an
offline deterministic importer with independent comparisons against raw records.

## Application requirements to inspect during implementation

- Register separate Simplified and Traditional resources and native language tags
  (`zh-Hans`, `zh-Hant`); supply both sets of book names and reference aliases.
- Accept Chinese references regardless of the display language. Existing Japanese
  reference normalization handles full-width digits, colon and 章/節; Simplified
  节 needs explicit coverage. Test forms such as 约翰福音3:16 and 約翰福音３：１６.
- Retain source headings and notes separately from numbered Scripture. Inventory
  empty slots, combined references, variant notes and chapter boundaries.
- Establish the source reference scheme before permitting parallel alignment.
  Existing native-reference support can be reused where applicable; equal numbers
  alone do not prove matching references across editions.
- Verify Chinese substring search, exact highlighting, mobile layout, lazy script
  loading and offline/file access against real generated resources.
- Leave the existing Japanese editions and unrelated uncommitted LXX work intact.

## Source links

- [CrossWire ChiUn](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ChiUn)
- [CrossWire ChiUns](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ChiUns)
- [eBible Simplified new-punctuation CUV](https://ebible.org/details.php?id=cmn-cu89s)
- [eBible Traditional new-punctuation CUV](https://ebible.org/details.php?id=cmn-cu89t)
- [eBible Biblica OCCB and licence](https://ebible.org/details.php?id=cmncbs)
- [OTB publisher repository](https://github.com/OpenTranslationBible/open-bible)

## Initial downloaded-file inspection

The eBible VPL links resolve to `https://ebible.org/Scriptures/cmn-cu89s_vpl.zip`
and `https://ebible.org/Scriptures/cmn-cu89t_vpl.zip`. After sandbox DNS blocked the
first attempt, the escalated download succeeded. Archives were inspected in an OS
temporary directory; they have not been installed as production sources.

| Archive | SHA-256 |
| --- | --- |
| `cmn-cu89s_vpl.zip` | `124c38ddf4effc22a0f7e809a749c148e8ebb7c429574a0cda6ff4e0cfe04577` |
| `cmn-cu89t_vpl.zip` | `bf66bf10cf6102f8ab78e034790f28d5c82f32b657fc1fb98ebbb3ab5d3b46c8d` |

Both UTF-8 VPL text files contain **31,021 nonempty records, 66 book identifiers,
and 1,189 chapter identifiers**, with no duplicate references or malformed lines
under `BOOK chapter:verse text` parsing. This is a record inventory, not proof of
complete native coverage. The source uses identifiers such as `SOL`, `EZE`, `JOH`
and `JAM`; these must be mapped explicitly to application identifiers before any
reference comparison.

The Simplified file jumps from Genesis 24:29 to 24:31, while the 24:29 record
includes narrative spanning the intervening verse. Numbers 1:20 likewise includes
the population count and has no separately indexed 1:21 record. Matthew 17:21
also lacks a separate record. These examples require checking against structured
USFM/USFX, which can retain combined labels and notes. Do not infer missing text
or fabricate native labels from VPL gaps. The God-wording difference was confirmed
in the downloaded Genesis text. **A naive scalar VPL import is not ready.**

## Subsequent language phase

After Chinese, investigate South Asian languages and exact licensed editions.
The user has not yet specified the language order. Do not equate South Asia with
Southeast Asia or assume that a translation listed by OTB has passed an audit.
