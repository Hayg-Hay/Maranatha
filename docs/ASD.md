# Filipino / Tagalog: Open Ang Salita ng Diyos 2025

`asd` / **ASD** adds **Biblica® Open Ang Salita ng Diyos™**, also titled
**Biblica® Open Tagalog Contemporary Bible™**, from the user-supplied
`docs/Biblica® Open Tagalog Contemporary Bible 2025.zip`, received 2026-10-09.
It is lazy-loaded from `data/asd.js`. **Language → Filipino / Tagalog** selects
publisher book names; the controls retain the existing English wording.
The language code is `tl` (Tagalog); other Philippine languages remain separate.

## Provenance and licence

The unchanged archive is retained at `build/sources/asd/asd-2025-usfm.zip`.
SHA-256: `68fae4f72a64f9568a1cf90f15a27ec8ac051c2b2cd8b86cae6df115d215a315`.
It contains exactly 66 USFM entries under `release/USX_1/`; the directory name
does not mean a separate USX witness exists. All files are checked against a
hash-pinned manifest; imports and runtime never download Scripture.

Every book's copyright header credits 2009, 2011, 2014, **2025** Biblica, Inc.,
matching https://www.bible.com/versions/1264. The Open.Bible product page lists
2015 instead of 2025. Some book id headers omit Open; original headers remain
unchanged. The archive has no metadata.xml or licence document. The authored
`licence-evidence.md` records the publisher's CC BY-SA 4.0 terms separately.
Copyright, title, trademark and conversion notices appear in
`data/LICENSE-asd.md`. The dataset retains CC BY-SA 4.0.

## Source inventory and reading

- 66 books, 1,189 chapters, **30,868 source verse units** covering **31,103
  indexed positions**. All source units have main text; no gaps were filled.
- **185 combined ranges** remain complete labelled units. Their text is stored
  once, at the starting position; member positions point back to that start.
  Requesting `Mga Salmo 7:13` shows the full source unit `7:12-13`.
- 2,333 footnotes, 2,591 section/reference/speaker headings, and 116 Psalm
  superscriptions remain separate. Thirty headings occur within source units;
  their source placement is recorded. Notes/headings are collapsed below reading.
- Source words, nonbreaking spaces, punctuation and modifier-letter apostrophes
  remain unchanged. USFM inline styling is flattened, and paragraph boundaries
  become line breaks. Source note categories are metadata, never Scripture text.

Normal chapters use the existing policy of comparing identical publisher
reference identifiers. This is not certification of semantic correspondence.
The 127 chapters containing combined ranges use separate reading blocks, as do
five additional chapter exceptions: **2 Corinthians 13** (13 verses rather
than 14), **3 John 1** (15 rather than 14), **Revelation 12–13** (the seashore
sentence is at 12:18), and **Romans 14** (WEB's doxology placement differs).
These 132 chapters also guard search comparisons and interlinear views.
No source range is split, duplicated or silently assigned to another reference.

The sole selected edition owns its source extent: Daniel ends at chapter 12,
2 Corinthians 13 at verse 13, and 3 John at verse 15. No deuterocanonical
Scripture or Filipino book labels are fabricated for absent books.

Publisher names/abbreviations work in every locale, including `Juan 3:16`,
`Mga Salmo 23`, and `Gen. 1:1`. `Mga Awit` and `Awit` are additional reader
aliases for Psalms, identified in the locale builder rather than claimed as
publisher metadata. English references remain available with Filipino labels.
Search uses the existing Latin-script search behavior; highlighting and copied
text retain original punctuation and spacing.

## Validation

`npm run test:asd` checks reproducibility, generated locales, source hashes and
strict parser behavior. The independent checker imports neither parser nor
importer and checks every raw numbered unit, combined label, footnote and
heading, ignoring only presentation whitespace. It also checks chapter extents.
This validates fidelity to the supplied artifact, not translation accuracy or
an independently verified printed edition.

JSDOM tests load the real app via `file://` with network APIs blocked, at desktop
and mobile widths. They cover lazy loading, references in both languages,
exact verse and highlighted text, collapsed annotations, combined-member
navigation, ordinary comparison rows, chapter exceptions, interlinear guards,
and independent parallel-pane loading.

Shell cache v62 precaches the small Filipino locale. ASD data is cached lazily;
the existing data cache v3 is retained. Changes are left uncommitted for the
user's manual DeepSeek handoff; unrelated LXX/Armenian work is excluded.

Validation on 2026-10-09: `npm run test:asd` and the full `npm test` suite
passed. The full run exited 0; its captured log and exit status are
`build/cache/asd-npm-test.log` and `build/cache/asd-npm-test.exit`. Windows
blocked temporary-file renames inside the sandbox; the successful full run
used approved execution outside it.

`build/cache/asd-stage.patch` contains only ASD changes in mixed shared files;
`build/cache/asd-stage-files.txt` lists the remaining related paths. The patch
passes `git apply --cached --check`. Nothing has been staged, committed or
pushed. The user's original ZIP under docs is excluded because its identical
bytes are already retained in the pinned source directory.
