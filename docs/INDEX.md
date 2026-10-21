# Maranatha documentation

Start with the [current README](../README.md) for opening the application,
the complete edition inventory, reading views and development commands.

## Reading and teaching guides

| Guide | Scope |
| --- | --- |
| [Calmer reading](CALMER_READING.md) | Visible navigation, collapsed tools and selected-edition summaries |
| [Edition information](EDITION_INFORMATION.md) | Provenance, terms, limitations and verification scope |
| [Reading polish](READING_POLISH.md) | Resume and comparison safeguards |
| [Saved passages](SAVED_PASSAGES.md) | Named bookmarks and portable backups |
| [Recent passages](RECENT_PASSAGES.md) | Local navigation history |
| [Reader focus](READER_FOCUS.md) | Temporary reading presentation and keyboard exit |
| [Search polish](SEARCH_POLISH.md) | Excerpts and return to results |
| [Copy passage](COPY_PASSAGE.md) | Credited source text and clipboard fallback |
| [Print passage](PRINT_PASSAGE.md) | Print previews, PDF output and independent text sizes |

## Edition evidence

Use the in-app **Edition information** panel for the selected edition's record.
The generated [metadata catalog](../data/edition-information.js) covers all
21 registered editions plus native LXX, without loading their Scripture text.
It links to retained source/licence and verification records. Those records
have different scopes; a source declaration or passing import check is not a
universal rights or translation-quality certification.

Edition-specific implementation notes include:

- [Clementine Vulgate](VULGATA_CLEMENTINA.md), with separate
  [validation](VULGATA_CLEMENTINA_VALIDATION.md) and
  [source-defect records](VULGATA_CLEMENTINA_SOURCE_DEFECTS.md).
- [Bungo-yaku](BUNGO.md) and [recorded validation](BUNGO_VALIDATION.md).
- [OTB Japanese](OTB_JA.md) and [recorded validation](OTB_JA_VALIDATION.md).
- [Traditional Chinese CUV](CUV_TRADITIONAL.md), [Indonesian AYT](AYT.md),
  [Thai TCV](TCV.md), [Filipino ASD](ASD.md), [Vietnamese OVCB](OVCB.md),
  and [Malay KSZI](KSZI.md).
- [Bohairica](BOHAIRICA.md) and [Syriac Peshitta/Murdock](PESHITTA.md).
- [Western Armenian print investigation](investigations/armwestern-1853-print-result.md).

Older core-edition and Delitzsch decisions are recorded in
[project history](../PROJECT_HISTORY.md); use their individual metadata entries
to locate the relevant evidence. Translation text licences under `data/` and
font notices under `fonts/` are distinct from application-code licensing.

## Study and source records

- [Supplemental grammatical annotations](GRAMMATICAL_ANNOTATIONS.md): Greek
  case government, references, coverage inventory and unresolved questions.
- [Native Swete source and licence](../data/LICENSE-lxx-swete.md).
- [Native LXX verification report](../build/reports/architect-handoff-REPORT.md).
- [Stage 2 architecture](STAGE2A_ARCHITECTURE.md),
  [Genesis 2-5 research](STAGE2B_GENESIS_RESEARCH.md) and
  [Genesis 6-15 research](STAGE2C_GENESIS_RESEARCH.md).
- [Recorded stage 2 verification](../build/reports/stage2b-REPORT.md).

Study reports and source investigations retain their recorded scope. Proposed
mappings remain proposals unless explicitly human-approved; draft glosses and
study explanations must not be mistaken for additional biblical source text.

## Historical and planning records

- [Project history](../PROJECT_HISTORY.md): chronological milestones and
  recorded decisions, not one uniformly current verification certificate.
- [Historical README snapshot](history/README-before-2026-10-18-consolidation.md):
  preserves older technical detail and superseded inventory/stage status.
- `investigations/`, older handoffs and stage prompts preserve research and
  planning context. A prompt or intended check does not prove it was completed.

This documentation consolidation updates navigation and current descriptions;
it does not alter source data, rerun textual audits or retroactively rewrite
historical evidence. Physical-device, accessibility and print-output limits
remain documented in the individual feature records.
