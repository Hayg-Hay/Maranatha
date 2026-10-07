# Three LXX disclosures — independent acceptance, 2026-10-07

Implementer: opencode/DeepSeek. Independent verifier: Codex.
Approved scope: the three source quirks, no Scripture repairs or alignment.
Branch: `codex/lxx-disclosures`; base `5213a13`; reviewed head `125f8f4`.
Fresh local verification clone: `build/cache/lxx-disclosures-verification`.
Product/data unchanged between initial reviewed `9f3d3c3` and `125f8f4`.
The latter fixes a verifier's Git/Windows wrapper line-ending assumption only.

| Check | Result | Evidence |
| --- | --- | --- |
| Codex-authored full-dataset preservation, flag/notice scope, JS agreement | PASS | Independent checks 6/6; full deep equality after removing only approved additions |
| Every original text, label, kind, order and flag | PASS | Compared against main's pre-change JSON; no importer helpers |
| Only two new flags and one LJE notice | PASS | PSA16:4 transcription marker; PSA88:84 label anomaly; LJE navigation chapter |
| Counts | PASS | 48 books, 1055 chapters, 27048 verses, 100 unnumbered; flagged 686 -> 688 |
| Independent pinned-source extraction | PASS | 47 source files; 2,754,390 characters; zero differences; every label and verse text matches |
| Implementer checks rerun in fresh clone | PASS | 39/39, including two deterministic rebuilds and raw LJE chapter check |
| Stage1 / native / Stage1b | PASS | 15/15; 8/8; 45/45 |
| Independent Canon/view regression | PASS | 14/14 including ten actual pre-change WEB+KJV chapter renderings |
| Full npm suite | PASS | exit0 on `9f3d3c3`; later commit changes only checker/docs |
| Versioned cache behavior | PASS | Old unversioned LXX bypassed; fresh URL cached; offline reuse; old translation entries retained |
| Both standalone and Parallel renderers | PASS | Flags have explanatory accessible labels; LJE notice and introduction/72 verses preserved |
| Git integrity / whitespace | PASS | fsck exit0; diff --check clean; no deleted paths |
| User browser / phone review of these new disclosures | PENDING | This phase has not been merged or deployed |

Current JSON SHA-256:
`fd52aa2f5f65f7e0a9c76d9cf203756c66f43ac1a91396d928be3b30d8ed1f2e`.
Original Stage1 hash `d31c332f…` remains historical evidence; metadata changed,
Scripture did not. Attribution/license stays CC BY-SA 4.0; changes are disclosed.

Cache decision: shell v50, data cache v3. LXX loads through
`data/lxx-swete.js?v=disclosures-20261007`, using the repo's established exact-URL
cache pattern. The handoff's universal cache-bump rule is incomplete for versioned
URLs. No data caches are cleared by this phase; first retrieval of the new URL
requires connectivity, and later use works offline after it has been cached.

Logs (gitignored): `build/cache/lxx-disclosures-verification-{check-fixed,stage1,
native,stage1b,canon,source,npm,fsck}.log`. The independent checker is stored at
`build/check-lxx-disclosures-independent.mjs`; run with a checkout and the actual
pre-change JSON as its two arguments. Never regenerate the baseline after changes.

Review preview: `build/cache/lxx-disclosures-implementation/index.html`.
In LXX or Parallel, inspect Psalm16:4 and Psalm88:84 flag explanations, then
Letter of Jeremiah's Notices. Confirm introduction/72 verses and return to Canon.
Phone review of this phase awaits a separately approved merge/push/deployment.

The separate publishing fix is already approved, merged, pushed and confirmed
live at shell v49 with Parallel reading (Pages run 37636339200). It contains no
new LXX disclosures. Main advanced independently; the eventual disclosure merge
must retain both histories and `.nojekyll`. No approval for that merge is inferred.
