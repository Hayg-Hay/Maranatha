# LXX alignment map and scheme registry — license and attribution

This covers the Stage 2a generated metadata only:

- `data/lxx-swete-alignment.json` / `data/lxx-swete-alignment.js` — the
  proposed Genesis 1 source-to-target correspondence map.
- `data/versification-schemes.json` / `data/versification-schemes.js` — the
  per-edition scheme declarations.

They contain **references, proposal rationale, declared differences and content
hashes** — not Scripture text. The Greek, Hebrew and English strings they point
at remain in the existing corpora (`data/lxx-swete.*`, `data/he.*`,
`data/web.*`, `data/kjv.*`) under their own licenses; those files are never
rewritten by the compiler.

## Attribution

- Greek source indexed: Henry Barclay Swete, *The Old Testament in Greek*
  (Cambridge University Press, 1905), digitized by `OpenGreekAndLatin/First1KGreek`
  (`tlg0527`, commit `03776b39f4047c5cff06f5296fae4b2bae4b08fb`) —
  **CC BY-SA 4.0**. See `data/LICENSE-lxx-swete.md`.
- Hebrew comparison source indexed: Open Scriptures Hebrew Bible (OSHB),
  `openscriptures/morphhb` — **CC BY 4.0**.
- English comparisons: World English Bible Catholic Edition (eBible.org,
  public domain) and the imported King James Version (public domain in the US).
  Source declarations are in each shipped dataset and in `PROJECT_HISTORY.md`.

## License

Because the metadata indexes CC BY-SA 4.0 Greek material and reproduces its
reference scheme, the generated map and registry are distributed under
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)** —
https://creativecommons.org/licenses/by-sa/4.0/. The OSHB, WEB and KJV source
declarations above are retained unchanged.

## Changes / nature of the work

- Original editorial work: AI-proposed passage correspondences, rationales and
  declared wording/boundary differences authored by Codex, independently
  reviewed by DeepSeek as a second AI reviewer. **Not human-verified.**
- Every entry, group and the document stay `status: "proposal"` with
  `review.humanApproval: null`.
- The compiler `build/import-lxx-alignment.mjs` never rewrites the proposal
  ledger `build/reviews/lxx-genesis1-evidence.json`; it compiles metadata only,
  deterministically, and binds artifacts by canonical `sha256-lf` hashes.
- No Scripture text is changed, normalized or reordered by the map or registry.

Reproduce and verify with:

```bash
node build/import-lxx-alignment.mjs
node build/validate-verse-mapping.mjs
```
