# Stage 2a repair — validator, evidence binding, resolver safety (2026-10-07)

Status: **local, unshipped draft. Not human-verified, not merged, not pushed.**
Branch `codex/lxx-stage2a`; base/checkpoint `f2b6b68`; repair commit `14414db`
(this report is the following commit).
No merge, push, deletion, subagent or new book import was performed. Original
`main` was not touched; all work stayed in the isolated checkout
`build/cache/lxx-stage2a-implementation`.

This resumed the prior draft that stopped with HTTP402 Insufficient Balance
(cached context reused). The accepted presentation was preserved exactly.

## Accepted presentation preserved

Genesis1 source6 appears once at target6 and source7 once at target7, each with
the tiny closing-phrase note; a single `Genesis 1:7` query shows source7 only.
No duplication, merged box, rowspan or generic ordinal fallback. The display
override stays restricted to the authored `GEN1-6-7` coordinates
(`app.js` `fillVirtualCell`). Collective evidence remains proposed; every entry,
group and the document keep `status: "proposal"` and `review.humanApproval:null`.

Presentation checks: `check-stage2a-verse-rows.mjs .` **12/12** desktop+mobile;
`check-stage2a.mjs` **37/37** including `greek6-7-one-verse-per-row` and
`reference-1-7-shows-source7-once-with-notice`.

## Primary repair — six validator holes (all now reject)

| # | Hole | Result |
| --- | --- | --- |
| 1 | `mapping.status='verified'` with `humanApproval=null` | PASS reject |
| 2 | `group.status='verified'` without human approval | PASS reject |
| 3 | `entry.status='verified'` without human approval | PASS reject |
| 4 | `provenance.rowId` naming no ledger row | PASS reject |
| 5 | syntactically valid but wrong `textHashes` (64 zeroes) | PASS reject |
| 6 | unknown `mapping.status='bogus'` | PASS reject |

Supported statuses are validated always. Any verified claim requires explicit
valid `approvedBy`/`date` human approval and consistency across document/group/
entry scope. `--require-verified` still rejects the actual proposed pilot.
Codex's pre-fix probe `build/check-stage2a-validator-independent.mjs` (unedited)
now reports **0 failures** (was 6). No independent test was weakened.

## Evidence binding

The default validator now loads the bound ledger
(`build/reviews/lxx-genesis1-evidence.json`), requires each `provenance.rowId`
to exist, and checks the entry source ref, complete target set and text hashes
against that authoritative row **and** the bound source/comparison corpora
(`data/lxx-swete.json`, `data/web.json`, `data/he.json`, `data/kjv.json`).
Comparison target locations are proven by content hash, never inferred from
matching verse numbers. Collective `GEN1-6-7` is jointly substantiated: each
group target must be covered by exactly one member row per language. Missing or
forged rows/hashes fail. The ledger itself is bound in `bindings.ledger`, so
source proposals cannot silently drift.

Artifact bindings use a documented canonical `sha256-lf` hash (CRLF normalized
to LF). The old ledger-vs-artifact mismatch on `data/kjv.json` and
`data/canon.js` resolves to the ledger's own declared values; `web`/`he`
declared values (recorded from a CRLF tree) are flagged `rebound` for
transparency but the shipped `sha256-lf` binding verifies on both platforms.
`import-lxx-alignment.mjs --check` also compares normalized line endings, so a
fresh Windows Git checkout does not report false `STALE`.

## Schemes / safety

- Mapping metadata declares `sourceScheme: lxx-swete-native` and
  `targetScheme: web-c` (Maranatha navigation canon anchored to WEB-C; **not** a
  universal numbering claim) plus `hashMethod: sha256-lf`.
- `data/versification-schemes.{json,js}` declares each registered edition's own
  scheme (Swete native, WEB-C, KJV, OSHB, Byz, Luther 1912, Segond 1910, both
  Delitzsch editions, Western Armenian) and states that only WEB/KJV/OSHB have
  Genesis 1 proposal coverage. Selecting any other edition surfaces a clear
  warning in the pilot notice that its numbering is unreviewed against the pilot.
- Resolver (`verse-mapping.js`) fails closed: conflicting/duplicate target or
  source claims return `ambiguous-metadata`; a group with **any** missing member
  retains `missing-source-text` (never a complete correspondence); unattested
  negatives never render a definitive `no-corresponding-verse`; unnumbered refs
  must resolve to an actual unnumbered segment at the declared index.
- `no-entry`/unresolved stays distinct from explicit attested no-counterpart and
  unavailable edition/source text. No negative claims are published in the pilot.

## Licensing / docs

`data/LICENSE-lxx-alignment.md` documents the new map/registry metadata:
First1KGreek/Swete CC BY-SA 4.0, OSHB CC BY 4.0, WEB/KJV source declarations,
generated metadata under CC BY-SA 4.0, and the nature of the AI-proposed work.
README gained a "Stage 2a" section; PROJECT_HISTORY.md records the repair. The
architect's 31-row evidence and the second semantic review were not rewritten.

## File scope

Modified: `app.js`, `verse-mapping.js`, `build/import-lxx-alignment.mjs`,
`build/validate-verse-mapping.mjs`, `build/test-verse-mapping.mjs`,
`data/lxx-swete-alignment.{json,js}`, `data/versification-schemes.{json,js}`,
`README.md`, `PROJECT_HISTORY.md`. Added:
`build/check-stage2a-validator-independent.mjs` (Codex probe),
`data/LICENSE-lxx-alignment.md`. **Unchanged:** every Scripture corpus, raw
source, importer, `canon.js`, `validate.mjs`, native references/views, the
independent Parallel view, fonts, witnesses, `service-worker.js` (shell v52,
DATA v3), and the raw LXX URL `?v=disclosures-20261007`.

Sizes: `lxx-swete-alignment.json` 58,923 B; `.js` 40,133 B;
`versification-schemes.json` 4,134 B; `.js` 3,396 B; evidence ledger 65,632 B.
Ignored `build/cache/` ~15.4 MB (baselines, logs).

## Checks (all run in this checkout)

| Check | Result |
| --- | --- |
| `check-stage2a-validator-independent.mjs .` | 0 failures (8/8) |
| `validate-verse-mapping.mjs` | PASS proposal, 30 groups / 31 entries |
| `validate-verse-mapping.mjs --require-verified` | FAIL as expected (pending human) |
| `import-lxx-alignment.mjs --check` | 4 current / 0 stale (also under CRLF) |
| `test-verse-mapping.mjs` | 47 pass / 0 fail (deterministic metadata twice; JS mirrors JSON) |
| `check-stage2a.mjs` | 37 pass / 0 fail |
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

Added mutation cases: six holes, missing group member, unnumbered-kind-on-verse,
conflicting groups, forged ledger and corpus bindings, unsupported scheme,
missing-member resolver state, conflicting/duplicate resolver claims, unattested
negative resolver behaviour, attested-negative accept, and a synthetic fully
human-approved verified document. No human approval was invented for the real
pilot.

## Known deviations / open questions

- The ledger's `declaredSha256` for `web`/`he` was recorded from a CRLF working
  tree; the shipped canonical `sha256-lf` bindings verify, and the difference is
  surfaced as `rebound` rather than hidden. Whether to re-record the ledger's
  declared hashes is left to Codex (ledger is protected and was not rewritten).
- Human textual adjudication of the full 30-group map, user browser/phone
  acceptance, and merge/push remain separate gates. This draft does not claim
  shipped or human-verified status.
