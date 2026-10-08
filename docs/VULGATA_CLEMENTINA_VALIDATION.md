# VULC validation — 2026-10-08

Branch: `codex/vulgata-clementina`. Ready for manual review. No merge or push.
Implementation used OpenCode with DeepSeek V4.1 Flash; Codex independently
verified the source and runtime behavior and made small final review fixes.

## Source and import

Approved source: [eBible latVUC](https://ebible.org/find/details.php?id=latVUC),
public domain, Clementine 1598 with Migne 1880 Glossa. The downloaded ZIP and
all eight extracted files are preserved, with `-text` Git attributes to prevent
line-ending changes. Archive SHA-256:
`4af9ec883815c05c0d90fe3a65dc32f32432a646db0247b185cc7a2d89fe53a7`.

Independent comparison checks every source verse using raw XML boundaries,
not the importer's tree walker. All 73 books, 1,334 chapters and 35,809 verse
texts match, including Unicode and punctuation. All 13,775 commentary notes
are excluded. Every extracted file matches the pinned archive byte for byte.

## Commands and results

- `npm test`: exit 0 in the reviewed working tree, including existing WEB,
  KJV, OSHB, Greek, Armenian, Delitzsch, Berean and LXX regression checks and
  all new Latin checks. Existing Windows fixture tests require execution with
  temporary-file permissions; the restricted initial attempt hit EPERM,
  and the rerun passed without changing those tests.
- `npm run check:stage1`: 15 pass / 0 fail; existing native LXX text and reading
  view remain intact.
- `node build/import-vulgata-clementina.mjs --check`: reproducible JSON/JS.
- `node build/test-vulgata-clementina.mjs`: 10 pass / 0 fail, covering targeted
  John, Psalms, Daniel, Esther and Sirach, native references, lazy local-script
  loading, context, search, selection/copying, and desktop/mobile rendering.
- `node build/check-vulc-source-independent.mjs`: all texts, reference
  coverage, archive hash and eight extracted files pass.
- `node build/check-vulc-ui-independent.mjs`: desktop/mobile checks pass for
  both search directions, first pane-only loading, native Esther chapter
  access, switching back to WEB, and resetting chapter 1 on book changes.
- `node build/test-vulc-import-contract.mjs`: Unicode/non-ASCII whitespace
  fidelity, commentary exclusion, duplicate/gap/unknown-tag rejection pass.
- `git diff --check`: no whitespace errors in the Latin changes.

Clean-snapshot verification uses `git archive HEAD` and the same installed
dependencies. The existing Stage2a test requires the historical, gitignored
`build/cache/stage1b-before.json`; without it the test correctly reports
`missing baseline`. Copy the existing fixture unchanged into the export's
same relative path before running `npm test`. The Stage1 fixture
`build/cache/stage1-before.json` has the same bytes. Their SHA-256 is
`7e44ef9fc13158eb018a96d0a38c452205198f6f99ffea88f5fc7bc21d4fcec5`.
These expected outputs were not regenerated, and no LXX test assertion was
weakened. The Latin source and UI checks require only committed data files.
With those fixtures supplied unchanged, the full clean-snapshot `npm test`
also exited 0, including all Latin checks. The clean export contains the
committed Stage2b baseline rather than the working tree's paused Stage2c work.

## Files

Created: `.gitattributes`; `data/vulc.json` and `.js`;
`build/import-vulgata-clementina.mjs`; `build/audit-vulgata-source.mjs`;
`build/test-vulgata-clementina.mjs`; `build/check-vulc-source-independent.mjs`;
`build/check-vulc-ui-independent.mjs`; `build/test-vulc-import-contract.mjs`;
the pinned `build/sources/vulgata-clementina/` source cache; and the three
`docs/VULGATA_CLEMENTINA*.md` documents.

Modified: `app.js`, `style.css`, `package.json`, `service-worker.js`,
`README.md`, `PROJECT_HISTORY.md`. Existing shell-version assertions in
`build/test-delitzsch.mjs`, `build/test-delitzsch1901.mjs`,
`build/test-service-worker.mjs`, `build/check-stage2a.mjs`, and
`build/check-lxx-disclosures-independent.mjs` follow the shell bump to v55.
The existing v3 data cache is retained. No canon or existing Scripture data
was modified. Pre-existing LXX Stage2c changes remain outside the Latin commits.

## Limits and manual review

Native numbering is preserved; cross-edition correspondence is unverified and
therefore suppressed, with visible notices and separate reading blocks.
Source brackets are retained, and the published Sirach 1:1 includes the
prologue. See the source-defects ledger for all recorded anomalies.

Desktop/mobile behavior was exercised with real local script loads under
JSDOM `file://`, blocking network APIs. JSDOM does not verify CSS layout.
The Browser runtime was unavailable because its module access returned EPERM;
actual browser and phone visual review remains outstanding.
