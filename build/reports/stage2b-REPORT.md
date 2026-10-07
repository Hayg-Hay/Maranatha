# Stage 2b — Genesis 2-5 correspondence proposals (2026-10-07)

Status: **local, unshipped draft. Not human-verified, not merged, not pushed.**
Branch `codex/lxx-stage2b` (base merge `77e0787`). Commits: `19d2358`
(ledger + per-target schema), `d2e4c6b` (spanning display + cache/tests), and the
documentation commit that adds this report. No merge, push, deletion,
source import or subagent was performed; unrelated untracked files were left
untouched and never staged. All changes are in the original project folder
`C:/maranatha/maranatha_new`.

## What was added

Content-based proposals for Genesis **2, 3, 4, 5** plus the single disclosed
boundary unit **Genesis 6:1**, reusing the Stage 2a framework with no wholesale
rewrite and no auto-identity.

- New immutable ledger `build/reviews/lxx-genesis2-5-evidence.json` (106 rows /
  106 groups) and review table `build/reviews/lxx-genesis2-5-review.md`,
  authored by DeepSeek (AI); every row stays `status: "proposal"` with
  `review.humanApproval: null`. The Genesis 1 ledger and its second semantic
  review were not touched.
- `build/gen-genesis2-5-ledger.mjs` extracts the exact Greek/comparison strings
  and hashes from the unchanged shipped corpora; correspondence decisions and
  verse rationales are authored in that table and are never transcribed by hand.

## Boundary containers (one source -> two targets)

- Source **GEN 3:1** -> targets 2:25 and 3:1 (nakedness statement + serpent
  dialogue). No Greek 2:25 is invented.
- Source **GEN 6:1** -> targets 5:32 and 6:1 (Noah's age/sons + multiplication
  clause). **Disclosed boundary-only extension**: only GEN 6:1 is proposed;
  Genesis 6:2 and later remain unresolved. No Greek 5:32 is invented.

Every candidate was inspected in Greek, WEB-C, KJV and OSHB. Ages are preserved
as sourced (e.g. source 5:25 = 187, not the 167 reading of another witness;
Adam 230/130, Seth 205/105, etc.); 3:15 wording, 3:20 Zoe/Eve, 3:24 extra
clause and 4:8 field invitation are recorded as caveats, not harmonized.

## Schema extension (backward compatible)

New rows carry explicit **per-target comparison evidence**
(`provenance.targetEvidence`: target ref + `textHashes` per language); the
source Greek keeps one actual ref/text/hash. Legacy Genesis 1 rows keep their
single comparison hash per language. The compiler now reads **both immutable
ledgers**, binds each ledger file (`bindings.ledger`, `bindings.ledger2`), and
compiles a combined mapping. The validator resolves each entry against the
ledger its `provenance.ledger` names and verifies every target hash against the
bound corpus at its exact ref. Deterministic metadata and JS/JSON agreement are
covered by the resolver suite.

## Display

- Genesis 1:6/7 presentation is unchanged and byte/text exact (source 6 once at
  6, source 7 once at 7, short notice, single-verse 7 only).
- A spanning source unit is rendered in full **once per comparison view**, with
  the native label and a short continuation note; later visible targets get a
  shared-source reference, not duplicated Greek. A single 2:25 or 5:32 query
  shows the complete unit once. Desktop, mobile, range and multi-reference
  cases are covered by `build/check-stage2b.mjs`.
- No generic source-label == target-verse fallback was added.

## Metadata / UI / cache

- Coverage/scopes/labels extended to Genesis 1-5 + boundary 6:1; other books and
  Genesis 6:2 remain unresolved/edition-unavailable; other editions stay flagged
  unreviewed; captions still say proposal/pilot.
- License/attribution/changes retained for the new evidence (First1KGreek/Swete
  CC BY-SA 4.0, OSHB CC BY 4.0, WEB/KJV source declarations).
- Shell `v52 -> v53`; all three shell assertions and the version-only
  Delitzsch expectations updated. DATA stays `v3`; raw LXX URL unchanged; map and
  registry query keys bumped to `stage2b-20261007`.

## File scope

Modified: `app.js`, `style.css`, `index.html`, `verse-mapping.js`,
`service-worker.js`, `package.json`, `README.md`, `PROJECT_HISTORY.md`,
`build/import-lxx-alignment.mjs`, `build/validate-verse-mapping.mjs`,
`build/test-verse-mapping.mjs`, `build/check-stage2a.mjs`,
`build/check-stage2a-verse-rows.mjs`, `build/check-lxx-disclosures-independent.mjs`,
`build/test-service-worker.mjs`, `build/test-delitzsch.mjs`,
`build/test-delitzsch1901.mjs`, `data/lxx-swete-alignment.{json,js}`,
`data/versification-schemes.{json,js}`. Added:
`build/reviews/lxx-genesis2-5-evidence.json`,
`build/reviews/lxx-genesis2-5-review.md`, `build/gen-genesis2-5-ledger.mjs`,
`build/check-stage2b.mjs`. **Unchanged:** every Scripture corpus, raw source,
importer, `canon.js`, `validate.mjs`, witnesses, fonts, native references/views,
independent Parallel, the Genesis 1 ledger and second review.

Sizes: `lxx-swete-alignment.json` 235,986 B; `.js` 146,428 B;
`versification-schemes.json` 4,168 B; `.js` 3,430 B; Genesis1 ledger 66,950 B;
Genesis2-5 ledger 204,832 B; review 11,876 B.

## Checks (all run in this checkout)

| Check | Result |
| --- | --- |
| `check-stage2a-validator-independent.mjs .` | 0 failures (8/8) |
| `check-stage2a-runtime-independent.mjs .` | 0 failures (5/5) |
| `validate-verse-mapping.mjs` | PASS proposal, 136 groups / 137 entries / 139 targets |
| `validate-verse-mapping.mjs --require-verified` | FAIL as expected (pending human) |
| `import-lxx-alignment.mjs --check` | 4 current / 0 stale |
| `test-verse-mapping.mjs` | 76 pass / 0 fail |
| `check-stage2a.mjs` | 38 pass / 0 fail |
| `check-stage2b.mjs` | 18 pass / 0 fail |
| `check-stage2a-verse-rows.mjs .` | 12 desktop/mobile pass, 0 failures |
| `check-stage1.mjs` | 15 pass / 0 fail |
| `validate-lxx-native.mjs` | 8 pass / 0 fail |
| `check-stage1b.mjs` | 45 pass / 0 fail |
| `check-stage1b-independent.mjs . <baseline>` | 0 failures |
| `check-lxx-disclosures.mjs` | 39 pass / 0 fail |
| `check-lxx-disclosures-independent.mjs . <baseline>` | 0 failures |
| `check-lxx-native-reference.mjs` | 43 pass / 0 fail |
| `check-lxx-native-reference-independent.mjs . <baseline>` | 0 failures |
| `npm test` | exit 0, no SKIP, no FAIL |

Coverage counts: 137 source proposals across Genesis 1-5; 2 boundary containers
(3:1, 6:1); 1 boundary-only reference extension (GEN 6:1); Genesis 6:2+ and all
unrelated books unresolved. Only two pre-existing Stage 2a expectations were
adapted to superseded coverage: Genesis 2 in `check-stage2a.mjs` (now covered,
with Genesis 6:2 added as unresolved) and the unresolved-chapter probe in
`check-stage2a-verse-rows.mjs` (Genesis 2 -> Genesis 7). Both independent probes
were left unmodified and pass.

## Known deviations / open questions

- The Genesis 2-5 ledger is a fresh AI proposal (DeepSeek). It is **not** human
  adjudicated; the architect, human textual review, browser/phone acceptance and
  merge/push remain separate gates. This draft does not claim shipped or
  human-verified status.
- The `web`/`he` corpus `declaredSha256` in the Genesis 1 ledger was recorded
  from a CRLF tree; the shipped canonical `sha256-lf` bindings verify and the
  difference is surfaced as `rebound`, not hidden. The ledger is protected and
  was not rewritten.
