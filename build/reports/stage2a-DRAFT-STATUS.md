# Stage 2a draft — presentation update, 2026-10-07

Not approved for merge/push. Stage 2a is unfinished; this is a local checkpoint.
DeepSeek stopped with HTTP402 "Insufficient Balance" while writing final docs.
The prototype mapping/renderer/code remains in this branch for review.

The user reviewed the interface and unresolved Genesis2 behavior, then explicitly
rejected repeating source6-7 at both rows: "simply keep it 1:1 and maybe write a
tiny notice." Codex implemented this limited display change directly because
the implementer was unavailable. User preview review serves as the requested
second UI review; automated tests alone do not establish independent sign-off
for Codex's own product edit.

Display: native source6 occurs once at target6; source7 occurs once at target7.
Each row keeps its text/label/flags intact and shows:
"And it was so" ends Greek6; English/Hebrew place it in7.
A single-verse7 query shows source7 only. Desktop and mobile use the same rule.
The explicit presentation override is restricted to the authored GEN1-6-7
proposal and exact target/source coordinates; other groups retain their normal
membership. It is not a generic ordinal fallback or a claim of exact boundaries.

The underlying collective correspondence proposal and evidence remain unchanged:
source6-7 <-> target6-7; all 31 entries stay proposal; humanApproval remains null.
This UI choice does not constitute human textual adjudication of the full pilot.
Every existing Corpus/importer file remains unchanged, including original Greek.

| Presentation check | Result |
| --- | --- |
| Dedicated desktop/mobile DOM checks | 12/12 |
| All31 Greek source strings displayed once, exactly | PASS |
| Rows6/7 contain one corresponding native source span and short notice | PASS |
| Single-verse7 no longer repeats6 | PASS |
| Genesis2 remains alignment-unavailable | PASS |
| Turning pilot off restores prior Canon HTML | PASS |
| Collective evidence and proposed status remain intact | PASS |
| Updated Stage2a UI acceptance check | 37/37 |
| Existing resolver tests | 28/28 |

Do not infer overall Stage2a readiness from these presentation checks.
Independent default-validator probes previously found SIX unresolved failures:
it accepts verified top/group/entry flags without human approval, an invented
evidence row ID, incorrect bound text hashes, and an unknown top-level status.
The validator was not changed by this UI edit. Additional scheme/runtime review
and complete docs/fresh-clone acceptance are still required before sign-off.

Preview: build/cache/lxx-stage2a-implementation/index.html; refresh it, choose
Canon, enable the LXX alignment pilot and inspect Genesis1:6/7. A second reviewer
must review the direct Codex display edit before any release approval. Native
and independent Parallel behavior are unchanged; main/live site remains v51.
