# Stage 2b independent technical acceptance

Reviewer: Codex, 2026-10-07. Product reviewed: `50bfc62e0738d857655e718f141a1b3fe247791b`
on `codex/lxx-stage2b`. Reviewed in a fresh local clone at
`build/cache/lxx-stage2b-verification`, with the previously verified immutable
source fixtures and regression baselines supplied locally.

## Result

Technical acceptance **PASS for the proposed research pilot**. No product repair
required. This does not certify the textual correspondences as human verified.
All real proposals retain `humanApproval = null`; verified-mode validation fails
as required. Browser/phone acceptance and explicit merge/push approval remain open.

## Independent evidence

- Full `npm test`: exit 0, no SKIP/FAIL/ERROR. Stage 2b UI 18/18,
  resolver/validator regressions 76/76, Stage 2a verse presentation 12/12.
- Original independent validator and runtime ambiguity probes: exit 0.
- Compiler `--check`: 4 current / 0 stale. Proposal validation passes with
  136 groups, 137 sources and 139 targets; `--require-verified` exits 1.
- New `build/check-stage2b-independent.mjs`: 37/37. Independently reads every
  new ledger row and the corpora, comparing all 106 source strings, hashes and
  flags, plus all 108 target strings/hashes in each of WEB, KJV and OSHB.
- Checks both query orders and individual target queries for 2:25/3:1 and
  5:32/6:1 on desktop and mobile. Each shows the full native source exactly once.
  Disabling/re-enabling the pilot resets deduplication correctly in all cases.
- Independent negative mutations reject a wrong target hash, missing target
  evidence, duplicated target evidence and a reference to the wrong ledger.
- Git comparison against merged Stage 2a `77e0787`: Greek, WEB, KJV, Hebrew,
  canon and the Genesis 1 ledger/review are unchanged. No invented Greek
  2:25 or 5:32, source splitting or ordinal fallback.

Logs are local ignored files `build/cache/stage2b-verify-*.log`.
The implementation's browser tests run with JSDOM; they do not substitute for
actual phone/browser acceptance.

## Documentation clarification

The author review's phrase that all material caveats "stay visible" was broader
than the actual interface. Wording and genealogy-age caveats are retained in
the review table; boundary notices appear inline. Corrected the review header
and its generator to describe that accurately. No immutable evidence ledger,
Scripture text, generated mapping or application behavior was changed.

## Human preview

Use the original working-folder `index.html`, Canon view, with **LXX alignment
pilot** enabled. Check Genesis 2-5; especially 2:25 and 5:32, then combined
references `Genesis 2:25;Genesis 3:1` and `Genesis 5:32;Genesis 6:1`.
The Greek source must appear once with its native label and a continuation note.
Genesis 6:2 onward remains alignment unavailable. Genesis 1:6/7 retains the
accepted separate rows. These checks approve presentation, not textual mapping.

No merge, push or deletion performed during this review.
