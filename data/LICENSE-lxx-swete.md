# Septuagint (Swete) — license and attribution

The text in `data/lxx-swete.json` / `data/lxx-swete.js` is adapted from the
Swete edition of the Septuagint as digitized by the First1KGreek project.

- Work: Henry Barclay Swete, *The Old Testament in Greek according to the
  Septuagint* (Cambridge University Press, 1905).
- Digitization: `OpenGreekAndLatin/First1KGreek`, text `tlg0527`, pinned commit
  `03776b39f4047c5cff06f5296fae4b2bae4b08fb`.
- License of the digitized text: **Creative Commons Attribution-ShareAlike 4.0
  International (CC BY-SA 4.0)** — https://creativecommons.org/licenses/by-sa/4.0/
  (stated in the `<licence>` element of every source TEI file).

Attribution (as required by CC BY-SA 4.0):

> Henry Barclay Swete, *The Old Testament in Greek* (Cambridge University Press,
> 1905), digitized by the OpenGreekAndLatin/First1KGreek project (`tlg0527`,
> commit `03776b39f4047c5cff06f5296fae4b2bae4b08fb`). Adapted for Maranatha as
> described below. Licensed under CC BY-SA 4.0.

## Changes made to the source

The adaptation is mechanical and deliberately does not correct Scripture:

- Unicode **NFC** normalization is applied to every text segment. This is the
  only text transformation.
- TEI apparatus (`<note>`, `<app>`) and structural headings (`<head>`) are
  excluded by structure, never by matching tag text.
- Text outside verse containers (titles and introductions, e.g. the Letter of
  Jeremiah introduction, the Esther prologue, unnumbered Psalm titles) is kept
  as unnumbered segments rather than dropped.
- Ezra and Nehemiah are split from the single Esdras B source file at the source
  chapter boundary (chapters 1-10 Ezra, 11-23 Nehemiah); the printed chapter
  labels are retained.
- Psalm 151 is excluded, under the project's 73-book canon scope.
- Daniel is the Theodotion witness (`tlg057`); Susanna (`tlg055`) and Bel
  (`tlg059`) are shipped as separate components. The Old Greek witnesses are not
  shipped.
- Verse and chapter labels are kept exactly as printed; no verse is renumbered,
  merged or split.
- Source defects (mixed-script/OCR-like tokens, transcription markers, the
  Psalm 115:5 `θάυατος` spelling, Psalm 88's label 84, the missing Psalm 115
  label 6, the nested Psalm 129 verses, and the mid-sentence truncation of
  Theodotion Bel at 1:36) are **disclosed** as flags and per-book notices, never
  corrected.

Because the adaptation is a derivative of CC BY-SA 4.0 material, the adapted
data is distributed under the same license.

Reproduce with:

```bash
node build/import-lxx-swete.mjs
node build/validate-lxx-native.mjs
```
