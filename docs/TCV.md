# Thai Common Version 2025

`tcv` / **TCV** is **Biblica® Open Thai Common Version™ (2025)**, Thai-language
Scripture (`lang="th"`, left-to-right). It is lazy-loaded from `data/tcv.js`;
normal startup loads only the small Thai locale. Select **Language → ภาษาไทย**
for Thai book labels. Existing English controls remain as before.

## Supplied source

The user supplied `docs/Biblica® Open Thai Common Version 2025.zip` on
2026-10-09 after the publisher site blocked automated download. That file was
left unchanged and copied into `build/sources/tcv/tcv-2025-usfm.zip`.

Archive SHA-256:
`0d0241c3436b2015f452c7e6a1078e8101a0193b7d4049125675d6e9adb264ed`.

The archive contains exactly 66 `release/USX_1/<BOOK>.usfm` entries. Despite the
directory name, these are USFM, not a second USX witness. The importer checks
each book id and its Biblica TCV 2025 copyright/edition headers, verifies all
cached files against a hash-pinned manifest, and never downloads at import or
runtime. Source bytes are protected from Git line-ending conversion.

There is no metadata.xml or licence document inside the supplied ZIP. Licence
provenance is separately recorded from the publisher-supplied edition notice,
which specifies CC BY-SA 4.0, and the matching Open.Bible product page. The
authored `licence-evidence.md` is clearly labelled; no package metadata or raw
web capture is invented. Copyright/title/trademark notices and conversion
details are retained in `data/LICENSE-tcv.md`.

This is fidelity to one supplied USFM artifact, not certification against
Hebrew/Greek or an independently verified printed edition.

## Source inventory and fidelity

- 66 books, 1,189 chapters, **31,103 numbered positions**.
- **31,087 main-text records** and **16 empty main-text positions**. The empty
  positions remain indexed, receive factual source-gap notices, and are never
  populated from another Bible or from variant text in a footnote.
- 3,211 footnotes and three editorial variant notes, stored separately.
- One unnumbered Jeremiah 39 paragraph. It remains accessible below the passage
  as **unnumbered source text**; it is neither discarded nor assigned a verse.
- 2,491 section/reference/speaker/acrostic headings and 117 text-bearing
  superscriptions. One additional empty `d` marker in Habakkuk 3 is metadata;
  its already-numbered source text is not moved into an invented heading.
- 27 headings occur inside verse units; their actual source position is retained.
- Five repeated-footnote separator markers are preserved as metadata, not added
  as Scripture punctuation. Reference link targets and original note fields are
  retained in the cached source/data metadata.
- **678,306 zero-width spaces** in numbered text remain unchanged.

The empty positions are Matthew 17:21, 18:11, 23:14; Mark 7:16, 9:44, 9:46,
11:26, 15:28; Luke 17:36, 23:17; John 5:4; Acts 8:37, 15:34, 24:7, 28:29;
Romans 16:24. Main text and footnote variant text are kept distinct.

USFM markup and serialization line endings are converted to display formatting;
paragraph/poetry boundaries become line breaks. All source words and punctuation
remain intact. Notes/headings are collapsed below Scripture so reading starts
immediately. Copying a verse or highlighted search text preserves its original
Thai text, including tone/vowel marks and invisible word separators.

## References, search and comparison

Thai names and source abbreviations work in every display locale:
`ยอห์น3:16`, `ยน. 3:16`, `ยอห์น๓:๑๖`, `ยอห์น３：１６`. Thai numerals are
converted to ASCII for reference parsing only. English references remain
available with Thai book labels. Reference keys accept zero-width separators
without changing source Scripture.

Thai search uses NFC and preserves vowel/tone distinctions. Only source layout
separators (zero-width spaces and paragraph line endings) are ignored in search
forms. Matching/highlighting maps back to original offsets and grapheme ends;
highlighting never deletes marks, duplicates overlapping clusters, or changes
copied text. `Intl.Segmenter` supplies Thai grapheme boundaries; a mark-aware
fallback supports browsers without it. Local Thai font fallbacks require no CDN.

The source reference grid matches the existing KJV extent except for 3 John,
which has 15 rather than 14 verses. Ordinary passages use Maranatha's existing
comparison policy of matching publisher reference identifiers, not a claim of
identical content or semantic certification. **3 John 1** and **Romans 14** are
independent reading blocks with search/interlinear comparison guards. TCV keeps
the Romans doxology at 16:25–27, while WEB places it at 14:24–26.

As the sole selected edition, TCV owns its reference extent: Daniel ends at
chapter 12 and 3 John at verse 15. Deuterocanonical books are absent; no Thai
text or labels for them are fabricated.

## Validation

```text
npm run test:tcv
```

The independent checker imports neither TCV parser nor importer. It re-reads
the raw USFM with a different context-boundary/regex method, comparing every
numbered record, all footnotes and text-bearing headings, plus editorial and
unnumbered source content. Only presentation whitespace is ignored; all Thai
marks, zero-width spaces and punctuation must match.

Real JSDOM `file://` tests at desktop/mobile sizes cover lazy loading, Thai
numerals and aliases, exact copied text, grapheme/word-separator-safe search,
shared Multi-row reading, exceptional chapters, notes, unnumbered text,
interlinear guards and pane-only loading with network APIs blocked.

Shell cache v61 precaches the Thai locale; the new TCV data URL is cached lazily.
The existing v3 data cache is preserved.

Validation on 2026-10-09: the full `npm test` suite passed with exit code 0.
The captured log is `build/cache/tcv-npm-test.log`. No commit or push was made.
For the manual commit handoff, `build/cache/tcv-stage.patch` contains only TCV
changes in shared files, and `build/cache/tcv-stage-files.txt` lists the remaining
related paths. The patch passed `git apply --cached --check`; unrelated LXX work
and the user's original ZIP under docs are excluded.
