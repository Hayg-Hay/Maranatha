# Western Armenian pilot: raw module and first print comparison

2026-10-09. Research only; existing application Scripture/cache untouched.
Accepted targets: Western cause audit first; New Etchmiadzin 2017 for Eastern;
Zohrab 1805 for Grabar, with Bagratuni separate and TITUS comparison-only.

## Pinned raw module

Official page: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ArmWestern

Actual download: https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/ArmWestern.zip

Archive SHA-256:
`bc273232f6b822b9d957fb318396b7863aa5bba9cae3e8e90c108808dd9916f2`.

Original archive/extracted files and `pilot-source-files.json` are retained
under `build/sources/armwestern`. Config: ArmWestern 1.1, 2008-07-14,
1853 Western Armenian NT, Slavic Bible via unbound.biola.edu, Public Domain.
The actual underlying print impression/revision is not identified.

`build/research-armwestern-pilot.mjs` independently inflates zText blocks and
reads their 10-byte indexes without pysword or the old extractor. It checks
byte bounds, declared sizes, strict UTF-8 and index extent. There are 27 blocks
and 8,246 index entries (7,957 KJV-shaped verse slots plus structural entries).
This is a research probe, never a replacement Scripture importer.

Output: `build/reviews/armwestern-raw-pilot.json`, with module/cache pilot
strings and exact byte offsets/lengths. All ten historical empty positions
also have zero length in the downloaded module; they are not solely cache bugs.

## Correction to the initial investigation

Commit `7976c81a8a3d4f0fc310adc78aa937f2c548ca67`, 2026-09-13, already repaired
several offsets. The current cache matches HEAD. Its SHA-256 is
`40afae32f170325d54cccca592075eac6e11555fe51c942d662c34e0fba17680`.
The earlier history describes the pre-repair state. My initial present-tense
claim that the current cache retains all those old shifts was too broad.

Current John 6:51 contains the full conventional-reference verse, unlike raw
module slot 51, which contains its first sentence. There are 160 normalized
module/cache differences, including committed repairs and placeholders;
**this does not mean 160 newly discovered bad verses**.

## Print witness visually inspected

Internet Archive `bibleinmodernarm00cons`, cached under `arm-eastern-1800s`,
is a Western Constantinople **1884** print (title/imprint visible at PDF page 5).
Its wording differs from the module, so it is a comparison witness, not yet
an exact edition match or an authorized restoration source.

PDF hash from the earlier source record:
`7f7d8538533cb508acd7f35c6b2fd04c55c4b82ff75fe8c72d73ee9b64654985`.
Rendered pages are in `build/cache/armwestern-print-pilot/`. PDF numbers below
are one-based; printed NT page numbers are different.

| Passage | PDF / printed NT pages | Observation |
| --- | --- | --- |
| John 6 | 989–990 / 101–102 | Print separates 51/52 and ends at **72**. Module similarly separates the discourse at 51/52, but has only 71 slots and combines final material into 71. Cache repairs use conventional 71-reference extent. |
| Mark 8–9 | 932–933 / 44–45 | Print has kingdom saying at 9:1 and transfiguration at 9:2. Module merges the saying into 8:38 and puts transfiguration at 9:1. Current cache restores the conventional boundary. |
| 2 Corinthians 2:1 | 1076 / 188 | Numbered passage exists in print; module slot is empty; current cache uses a placeholder. |
| 2 Corinthians 6:1 | 1080 / 192 | Numbered passage exists in print; module slot is empty; current cache uses a placeholder. |

These are visual boundary observations, not a complete diplomatic transcription.
The print's chapter synopses repeat reference numbers and must not be mistaken
for the actual numbered Scripture. The different wording prevents silent
restoration of Corinthians from this witness.

## Cause assessment and remaining gate

**Electronic-lineage update:** a 2007 Notepad-rendered, 1853-labelled ebook
matches all 40 wording anchors after diagnostic quotation folding (37 without
it) and labels both John 6:51 fragments as 51. This supports re-merging those
fragments against that digital family, rather than declaring the repair wrong
from the differently worded 1884 print. It also exposes native extents of
2 Corinthians 13 (13), 3 John (15) and Revelation 12 (18). The actual historical
print remains to be matched. See [armwestern-electronic-lineage.md](armwestern-electronic-lineage.md)
and [armenian-print-acquisition.md](armenian-print-acquisition.md).

The external review refinements and grouped-run ledger are recorded in
[armenian-review-followup.md](armenian-review-followup.md). In particular,
do not certify the John 6 repair as a native-numbered edition: the print's
51/52 split and 72-unit extent differ from the cache's 71 conventional units.
The ten empty slots require three separate classifications, not a blanket 8+2.

Suspect boundaries are present in the official module's indexed slices, so a
different extraction library alone will not settle them. But the John print
shows a genuine historical native numbering difference: English counts cannot
define every Armenian split as corruption.

The upstream digital/index layer is implicated. The precise mixture of native
versification, conversion defects and an unidentified underlying revision
remains unresolved. Existing cache repairs need a matching-witness ledger;
neither restoring defective raw indexes nor declaring repaired English-style
counts fully certified is justified. No source replacement or text repair
was made based on this pilot.

Next: identify the module's exact wording/revision against a print, or select
a distinct complete print edition deliberately. Preserve native labels, then
audit the repair commit and record verified mappings separately. Do not fill
Corinthians from another register/edition or invent its wording.

Eastern permission draft: `armenian-permission-request.md`, with separate
app-bundling and public-repository questions. Prepared, not sent. No full
regression suite, application changes, commit or push for this research.
