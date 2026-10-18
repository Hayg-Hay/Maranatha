# Edition information - consolidation step 2

Every translation control now has a collapsed **Edition information** panel,
including editions that previously lacked a Source disclosure. Native LXX
has the same panel in standalone and parallel readings. Fields are consistent:

1. **Edition and provenance**: edition identity, distributor and retained
   source description, where recorded.
2. **Coverage**: imported books and testament counts, or native LXX components.
   This describes the shipped dataset, not every version of a translation.
3. **Reuse terms**: recorded terms, copyright and attribution where available.
   Declarations remain attributed to their source; missing terms never imply
   public-domain status. KJV retains its US-specific statement; AYT's publisher
   non-commercial terms are not relabelled as a numbered CC licence; OSHB,
   CC BY-SA editions and CC BY-ND KSZI retain their distinct terms.
4. **Numbering and limitations**: existing warning text, edition uncertainty,
   native-numbering cautions and selected evidence-based qualifications.
5. **Verification status**: the scope of documented project checks and their
   limits, linked to retained records. No universal verified/unverified grade
   is assigned to biblical texts or translation quality.

## Evidence and limits

Existing descriptive text and warning content are preserved. An open Western
Armenian verse-boundary audit remains **Under audit**. Bohairica and Murdock's
source/indexing warnings now say **Textual limitations**, rather than implying
those notes alone determine their complete verification status. The collapsed
Translations summary reflects those distinct warning types. This does not
remove their gaps, placeholders, independent-numbering rules or notices.

Digital-source reproduction, structural validation, sampled print comparison,
complete manuscript/print collation and translation quality are separate
questions. For example, Bohairica's documented digital checks do not establish
official church status or verified cross-edition alignment. Delitzsch's
unpointed digital source does not identify its print edition. The 1901 entry's
sampled print evidence is not a full collation. Published Peshitta/Murdock notes
do not justify upgrading their whole-source verification status merely because
test scripts exist. Unknown future entries display explicit missing-information
messages, never invented source or licence claims.

Study tools also has **About study material and verification**, distinguishing
source words from glosses, dictionary/morphology explanations, draft Berean
Hebrew coverage and the LXX pilot's proposed correspondences. Existing inline
and per-passage warnings remain in place.

## Architecture and offline behavior

- `build/edition-information-catalog.mjs` holds curated evidence summaries and
  the small number of legacy/source-specific qualifications. It is not a
  current audit or legal opinion.
- `build/build-edition-information.mjs` reads the registered edition metadata
  and native LXX, checks evidence-file existence and generates
  `data/edition-information.js`. It extracts metadata only; Scripture is not
  shipped in the information catalog. It never writes existing datasets.
- `edition-information.js` renders the common five fields using textContent
  and allowlisted local/http(s) links. It is shared by standalone translations,
  grouped selectors, saved-reading restoration and native LXX.
- Information is available before selection, without fetching or loading an
  unselected Bible. Opening/switching disclosures does not record reading.
  The previous first descriptive paragraph and CSS hook are retained for
  compatibility. Updating an edition preserves the panel's open state.
- Shell v77 precaches both metadata scripts. Metadata follows shell versioning
  rather than the long-lived translation-data cache; data cache v3 is unchanged.
  Fields work offline under file:// and a cached hosted shell. Supporting local
  records are included in the repository/download; hosted offline access to
  linked documents depends on their availability/cache. Online source links
  require connectivity and never load automatically.

Run `node build/build-edition-information.mjs` after relevant registry,
dataset-metadata or curated-catalog changes. `npm run test:edition-information`
checks deterministic generation plus desktop/mobile DOM workflows: all panels,
terms and evidence, lazy-loading/storage isolation, warning types, grouped
selection/resume, safe rendering, unknown-entry fallbacks and native LXX.
Existing feature, grouped/interlinear and cache tests cover compatibility.

No existing source text, Scripture dataset, reference mapping, gloss corpus or
licence record is changed. No new whole-corpus textual audit, complete print
collation, live online rights verification or translation-quality assessment
was performed. Visual/device and screen-reader acceptance still require manual
review. Broader documentation and architectural cleanup remain step 3.
