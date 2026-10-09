# Malay: Kitab Suci Zabur dan Injil

`kszi` / **KSZI** adds the contextualized Malaysian Malay New Testament,
copyright 2013 Pengamat Kitab Mulia, distributed by eBible.org as `zlmKSZI`.
The original title and words **Isa al-Masih**, **Yahya**, **Putera Allah** and
**Roh Suci** remain unchanged. **Language → Bahasa Melayu** selects source
book names. Runtime uses `ms`; original ISO identity `zlm` is also retained.
Indonesian AYT remains a separate edition.

## Source and licence

Downloaded from https://ebible.org/Scriptures/details.php?id=zlmKSZI on
2026-10-09. Unchanged USFM/USFX archives, extracted files and original copyright
documents are retained under `build/sources/kszi`, protected from Git line-ending
conversion. Package metadata declares 2013 completion, Latin script and NT scope.

- USFM archive SHA-256:
  `9965c3bba4ff8a32661dfa4ced01b502bead7c316eaed26908b2dbd678f72239`.
- USFX archive SHA-256:
  `319fecff0ac2f56a5fbac16bf6b9a43ab1fd8b954c246d0e724812a91e4884a4`.
- Source manifest SHA-256:
  `7ea65ff64cbd8105c81f44d81676ed713b3b0319240331934aeca51f2d026836`.

The importer verifies every pinned file plus package scope/identity and licence
evidence. It never downloads text. **CC BY-ND 4.0** requires attribution and
preservation of Scripture words/punctuation. Only technical format conversion
is performed; the work is not relicensed. See `data/LICENSE-kszi.md`.

## Reading and references

The initial import contains **27 books, 260 chapters, 7,958 source records**,
733 section headings, no footnotes, no gaps and no combined ranges. Five
headings occur within verse units. Headings remain separate, collapsed below
reading. Paragraph boundaries become line breaks; every source word and
punctuation mark is retained.

There is no Psalms or other Old Testament text in this artifact despite Zabur
in its title. No missing books, text or Malay OT labels are invented; absent
books keep existing English navigation labels and the app's unavailable-text
behavior. Book abbreviations absent from the source are not fabricated.
`Yahya 3:16`, `Rom 8:28` and source book names work in every UI locale; English
references remain available with Malay labels.

Ordinary chapters use existing comparison by publisher reference identifiers.
**3 John 1** has 15 verses rather than 14; **Romans 14** has different doxology
placement from WEB (KSZI retains it at 16:25–27). These chapters read separately
with search/interlinear comparison guards. This is not semantic certification
of equal verse numbers. Source extent and wording are never collapsed or moved.

KSZI loads lazily from `data/kszi.js`; only the small Malay locale is added to
startup/shell cache v64. Existing data cache v3 is retained. Search uses the
existing Latin-script behavior, preserving original text during display/copy.

## Verification

```text
npm run test:kszi
```

The independent checker imports neither the USFM parser nor the importer. It
re-reads the raw USFX with a different context-boundary method and compares
every numbered verse's words and punctuation, plus all 733 section headings,
ignoring only presentation whitespace. It also checks the source extents
(27 books, 260 chapters, 7,958 verses, no notes and no gaps) against the raw
USFX, which is another serialization of the same digital edition, not an
independently verified translation witness.

Real JSDOM `file://` tests at desktop/mobile sizes cover lazy loading, Malay
source references/aliases and exact displayed text, the New Testament-only
behavior (Old Testament references resolve but show the app's unavailable-text
placeholder with no invented Malay Scripture), collapsed headings, exact
copied/highlighted search text, shared comparison rows, 3 John/Romans 14
exception guards, interlinear guards and pane-only parallel loading with network
APIs blocked.

Shell cache v64 precaches the small Malay locale; KSZI data is cached lazily and
the existing data cache v3 is retained. The full `npm test` suite passed with
exit code 0 on 2026-10-09; the captured log is `build/cache/kszi-npm-test.log`.

For the manual commit handoff, `build/cache/kszi-stage.patch` contains only KSZI
changes in shared files, and `build/cache/kszi-stage-files.txt` lists the
remaining related paths including the new checker and integration test. The
patch passed `git apply --cached --check`; unrelated LXX/Armenian work and the
Codex smoke script are excluded.
