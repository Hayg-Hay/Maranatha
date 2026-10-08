# OTB-JA validation — 2026-10-08

Source: OpenTranslationBible/open-bible commit
`31d411ac1c2d277242a3bd85697f354eaa11526b`, Japanese `lang/ja-JP` JSON,
licensed CC BY-SA 4.0. This audit verifies faithful import and application
behavior; it does not certify the translation's linguistic or theological
accuracy. Translation/editorial provenance is not identified in the reviewed
publisher material; see `OTB_JA.md` and `data/LICENSE-otb-ja.md`.

- All 1,192 raw JSON files match their pinned SHA-256 and Git blob IDs.
- All 1,189 chapter record streams reconstruct exactly from generated verse
  segments and unnumbered metadata, including their original positions.
- 66 books, 31,103 numbered records, 8,336 multiline verses, 3,636 separators,
  138 Psalm textual records and three NT unnumbered notes are preserved.
- Matthew 23:14 `[14]` and John 5:4 `[4]` remain unchanged and have authored
  notices in the reader and search results. No missing text was supplied.
- The source's bracketed editorial material inside numbered records (including
  Mark 16:9) remains unchanged. Separate unnumbered notes stay outside verses.
- OTB-only reference bounds retain Daniel's 12 chapters and Third John's
  15 verses. A deselected OTB does not extend another edition's references.
- Japanese no-space/full-width/章節 references, kana-safe substring search,
  exact multiline selection/copying and comparison/interlinear guards pass.
- Every pre-existing Bible dataset retains its pre-implementation SHA-256.
  Japanese display names and previous aliases are retained; source-grounded
  aliases were added. Paused LXX work and historical regression baselines remain.
- Actual installed Edge, headless desktop (1360 px) and mobile (390 px), loaded
  the application directly through `file://` with HTTP(S) requests blocked.
  Lazy OTB loading, Japanese references, native extra verse, placeholder notice
  and multiline rendering passed. Phone-width output had no horizontal overflow.
  Screenshots were visually inspected; no physical-phone test was performed.
- OTB-specific checks: **13/13 passed**. Independent full-source comparison and
  the working-tree and clean-export `npm test` pipelines passed. Stage-one
  regression checks passed **15/15**. The clean export excludes paused LXX work;
  optional source-page replay checks for the earlier Hebrew pilot were skipped
  because its ignored source cache was not included (the working-tree run
  covers those checks). Final source-path metadata wording was corrected and
  regenerated with `--check`; Scripture and runtime behavior are unchanged.

Development evidence is retained in ignored `build/cache/otb-ja/`, including
source checks, parent review, browser review, screenshots and regression logs.
No server or runtime build step is needed to read the Bible. Scripture loads
through local script tags; the HTTP service worker remains disabled on `file://`.
