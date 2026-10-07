# Genesis 2–5 batch — architect's preliminary source findings

2026-10-07. Current baseline: merged research pilot77e0787, shellv52.
This is research preparation, not new alignment approval or a code change.
Implementation workflow: original project folder on a feature branch; user
runs opencode manually. Independent verification uses a separate clean clone.

Inputs: unchanged shipped Swete JSON (hashfd52aa2f…ed1f2e) verified against
First1KGreek pin03776b39f4047c5cff06f5296fae4b2bae4b08fb; WEB-C/KJV/OSHB JSON.
Counts are inventory ONLY, never evidence of correspondence.

| Chapter | Greek numbered source units | WEB/KJV/OSHB verses |
| --- | --- | --- |
| 2 | 24, labels1–24 | 25 |
| 3 | 24, labels1–24 | 24 |
| 4 | 26, labels1–26 | 26 |
| 5 | 31, labels1–31 | 32 |

## Confirmed containers needing explicit boundary handling

- SourceGEN3:1 contains both the naked/unashamed statement (WEB2:25) and the
  serpent's opening exchange (WEB3:1). No missing Greek2:25 may be invented.
- SourceGEN6:1 contains both Noah's age/three sons (WEB5:32) and the multiplication
  of humanity/daughters (WEB6:1). No missing Greek5:32 may be invented.
- These are properties of THIS pinned transcription's source containers. Do not
  claim they establish all printed LXX edition numbering or repair the corpus.
- Include source6:1 as a boundary-only supporting unit; if both target5:32/6:1
  are proposed, explicitly disclose the target6:1 coverage extension. No whole
  chapter6 coverage is implied. If not safely modeled, retain unresolved status.

## Textual differences to preserve and review

- GEN2:2: Greek finishes work on the sixth day and rests on the seventh;
  WEB/KJV/OSHB finish and rest on the seventh. Brackets remain as sourced.
- GEN3:15: Greek keeping/watching wording versus bruising in English; pronoun
  renderings differ. Assess content, do not substitute a familiar translation.
- GEN3:20: Greek names the woman Zoe/Life; English/Hebrew render Eve/Havvah.
- GEN3:24: Greek includes Adam being settled opposite the garden, alongside
  expulsion/cherubim/flaming sword. Preserve the extra source wording.
- GEN4:8: Greek and WEB contain the invitation to the field; KJV/OSHB do not
  quote that invitation. Same scene is not identical wording.
- GEN5:3/6 and other genealogy verses have substantive age differences. In this
  source5:25, Methuselah is187 (matching the inspected English/Hebrew verse),
  so do not import the167 reading from another LXX witness or memory.
- GEN5:28/30/31: selected Greek Lamech188/565/753 versus WEB182/595/777.
  Never adjust arithmetic/ages to harmonize editions.

## Engineering implication for the next prompt

The current evidence row holds one comparison text/hash per language. A single
source container spanning TWO canonical targets requires explicit per-target
comparison evidence; duplicate source rows or source-string concatenation are
not a valid workaround. Extend the schema backward compatibly, preserving the
Genesis1 ledger and all confidence/conflict gates. Keep whole source text intact,
show each source unit once per rendered comparison, and use a small continuation
notice/link when multiple visible targets share it. A target-only query must
still show its complete source unit with native reference and boundary note.

## Implementation status (2026-10-07)

Implemented on `codex/lxx-stage2b` as a backward-compatible schema extension:
`build/reviews/lxx-genesis2-5-evidence.json` (106 proposal rows) with explicit
per-target comparison evidence, dual-ledger binding, spanning-unit display
(once per view + continuation note), Genesis 1-5 + boundary GEN 6:1 coverage,
shell v53 and stage2b query keys. All entries stay proposal with
humanApproval=null. See `build/reports/stage2b-REPORT.md`. Human textual
adjudication and phone acceptance remain open; no merge/push was performed.
