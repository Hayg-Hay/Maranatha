# New Codex chat: Brenton English Septuagint import

## User's task and preferences

Investigate and implement the original Brenton English Septuagint as a normal
selectable translation in **Canon view**, alongside WEB/KJV. The user identified
it through BibleHub. This new chat handles the English translation import;
the existing LXX chat handles Greek alignment and its current Genesis 6–15 batch.
Do not take over or modify that batch.

Keep replies short. Codex acts as architect and independent verifier. For major
implementation, prepare a clear local Markdown task prompt; the user manually
pastes a short instruction into opencode for DeepSeek. Do not launch opencode.
Implementation uses the original project folder on a feature branch so the user
can preview the usual `index.html`. Independent verification may use a clean
local clone. No merge, push or deletion without explicit user approval.

## Workspace and concurrency

Repository: https://github.com/Hayg-Hay/Maranatha
Original folder: `C:/maranatha/maranatha_new`.
Last confirmed merged main: `54565c2`, Stage 2b technical acceptance. The user
successfully fast-forward merged and pushed this commit. Public deployment has
not been independently checked in this research turn.

DeepSeek is currently implementing Genesis 6–15 on `codex/lxx-stage2c` in the
same original folder. Last observed status contained uncommitted modifications
to application, service worker, generated metadata, tests and new batch files.
**Do not switch branches, stage, commit or edit those files during that work.**
Begin with read-only research and task preparation. When English implementation
is ready to begin, check that the Greek batch is finished and the working tree
is suitable; coordinate with the user before changing a shared active checkout.
Do not bypass the user's one-folder implementation preference with another clone.

Preserve unrelated untracked sources, fonts, patches and prompt files. Never
`git add .`, clean/reset/stash or delete them. Stage only task-owned named files.

## Read first

- `docs/BRENTON_IMPORT_RESEARCH.md`: initial source findings and links.
- `README.md`: actual application and edition behavior.
- Relevant current importers, corpus schema, Canon renderer and cache handling.
- `PROJECT_HISTORY.md` and `docs/ARCHITECT_HANDOFF.md` as needed. Repository wins
  over stale status descriptions; verify before claiming release state.

Do not dump complete Scripture datasets into context. Extract compact samples
and programmatic inventories. Keep scratch downloads and probes in ignored
`build/cache` or an appropriate new source-cache folder.

## Established research

BibleHub credits Brenton, 1851:
https://biblehub.com/sep/genesis/1.htm

eBible's **original** Brenton edition `eng-Brenton` declares public-domain status
and lists structured USFM/USFX/VPL downloads:
https://ebible.org/bible/details.php?id=eng-Brenton
https://ebible.org/eng-Brenton/copyright.htm
https://ebible.org/eng-Brenton/

Prefer evaluating that structured source over scraping presentation pages.
Do not substitute Updated Brenton (`englxxup`) or LXX2012. eBible and BibleHub
samples share the translation but exact full digital equality is unverified;
identify the chosen digital source honestly. BibleHub credits section headings
separately to Berean Bible; do not assume those are original Brenton Scripture.

No English archive has been downloaded or imported yet. Download URL, archive
hash, parser suitability, exact corpus coverage and full-source fidelity remain
to be verified. Preserve footnotes/headings as distinct editorial material.

## Required product behavior

Brenton is a regular English translation selectable in Canon view. It does not
use the Greek alignment pilot's routine pending-human-review labels. Imported
text fidelity can be verified computationally; that is separate from certifying
cross-edition verse correspondence.

**Numbering must still be handled honestly.** Verify edition-specific mappings
before placing source text against Canon coordinates. Use existing safe mapping
infrastructure where suitable, or show a concise mismatch/unavailable notice for
unsupported cases. Never silently use ordinal fallback, change labels, omit
extra material or describe a guessed mapping as verified. Do not promise all
books can be aligned automatically merely because the edition is English.

The user confirmed Canon integration after the preliminary recommendation of an
independent pane. Canon selection is the accepted requirement; standalone-only
reading is not a complete delivery of this task.

Known samples:
- English Genesis 2:25 is the nakedness statement; English 3:1 is the serpent.
  Shipped Greek source GEN 3:1 contains both. Existing Greek mappings therefore
  do not certify a one-to-one Brenton-to-Swete relationship.
- eBible Psalm 9 numbers its superscription as verse 1, thanksgiving as verse 2.
- Psalms, Jeremiah, Greek Esther/Daniel and additions require targeted numbering
  investigation. eBible lists deuterocanonical/additional books; inventory the
  archive rather than infer complete coverage from the index.

## Architect's next actions

1. Verify current checkout status without modifying concurrent Greek work.
2. Obtain and pin the original-Brenton structured archive and reuse declaration;
   inventory book IDs, counts, actual labels, superscriptions and notes.
3. Inspect existing edition import and mismatch handling. Establish a concrete
   Canon integration plan, including safe behavior for unsupported mappings.
4. Write a focused manual DeepSeek implementation prompt with protected files,
   source fidelity, offline/cache behavior, tests and human release gates.
5. User runs DeepSeek on a dedicated feature branch in the original folder after
   the current Greek batch is complete. Independently verify its final commit,
   preserve all existing translations/views and provide local preview checks.
6. User accepts browser/mobile presentation and explicitly approves release.

Only research notes and this handoff have been prepared so far. No Brenton
application edits, import, commits, merge, push or deletion have been performed.
