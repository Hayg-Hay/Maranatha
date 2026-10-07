# Native LXX reference navigation — independent acceptance, 2026-10-07

Implementer: opencode/DeepSeek. Independent verifier: Codex.
Reviewed product commit: `14959a2`; base for this UI change: `2f30372`.
Fresh clone: `build/cache/lxx-reference-verification`. Source fixtures reuse the
previously verified pinned XML/pages through local junctions inside the workspace.
No Scripture, importer, CSS or index markup changed in this UI phase.

The original report reproduced the user's trigger: LXX -> `Gen 1` -> Open
reference switched to Canon. The same independently authored check now passes.

| Check | Result | Evidence |
| --- | --- | --- |
| Independent native-reference behavior | PASS | 11/11: click/Enter, aliases, components/prologue, native verse labels, invalid input, view isolation, queued-load cancellation/latest request |
| Implementer's native-reference checks | PASS | 43/43 rerun in fresh clone |
| Approved disclosure dataset unchanged | PASS | Exact byte equality against pre-reference JSON; hash `fd52aa2f…ed1f2e` |
| Existing disclosure checks | PASS | 39/39; independent disclosure checks 6/6 |
| Stage1 / native-data / Stage1b | PASS | 15/15; 8/8; 45/45 |
| Independent Canon regression | PASS | 14/14 including ten actual pre-change WEB+KJV chapter renderings |
| Full npm suite | PASS | exit0; complete final log has no SKIP/FAIL entries |
| Pending native reference cannot change Canon | PASS | Deliberately delayed local script; picker/result/footer state preserved |
| Unchanged data/cache key | PASS | Shell v51; DATA v3; same versioned LXX data URL; no cache clearing |
| Reference hint after programmatic transition | PASS | Second review found stale native placeholder after search -> Canon; implementer fixed it in render() |
| User browser review of the new reference behavior | PENDING | Local preview ready; no main merge yet |

Supported in standalone LXX: ONE native `Book Chapter`, optionally `:Verse`;
bare book selects its first available chapter. `Gen 1`, `Ps 88:84`, `LJE 1`,
`Esther prologue`, and bare `Nehemiah` (native chapter11) use actual source data.
Exact source labels are retained. Unavailable verses/chapters/books, ranges and
multiple references show an error and keep the native passage/view unchanged.
An exact verse scrolls to its segment while retaining the whole chapter.

Canon and Parallel references retain the existing Canon parser; text search
remains Canon-only and returns to Canon. No inferred alignment or verse mapping.

Verification notes: the first npm run started before source-fixture links were
ready and skipped source-dependent checks. It was not accepted as the full test
gate. The complete suite was rerun after fixture setup and passed with no skips.
The independent hint regression was returned to the implementer; Codex changed
no product code. The disclosure checker update was reviewed: only its expected
shell version changed from v50 to v51; its behavioral assertions are preserved.

Logs: `build/cache/lxx-reference-verification-{independent,check,disclosures,
disclosures-independent,stage1,native,stage1b,canon,npm-complete,fsck}.log`.
Independent checker: `build/check-lxx-native-reference-independent.mjs`; pass
the checkout and the approved pre-reference JSON file as its two arguments.

User approved pushing the disclosures and reported the reference problem.
This record does not infer a new main merge approval. The combined branch
contains the three disclosures and this reference fix. Main separately retains
the approved `.nojekyll` publishing fix and live v49; preserve its history and
marker when a merge is explicitly approved.
