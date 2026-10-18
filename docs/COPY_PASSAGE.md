# Copy passage

Click **Copy passage** beside a passage heading. Chapter browsing copies the
chapter; a selected reference copies only the requested verse(s), even when
extra context is expanded. A highlighted verse reached through navigation is
also treated as a selection. Each passage block has its own button; separate
reference groups and independently numbered editions remain separate blocks.

Plain text includes each source verse's reference, its unchanged wording,
and a footer identifying the passage and translation. Multiple editions in
one block produce separate credited text blocks. Available copyright, license
and source URLs from local dataset metadata follow the footer. Attribution is
limited to the metadata present in each dataset; consult the edition's source
documentation for its complete notices and reuse conditions.

If clipboard access is unavailable or denied (including some file-based browser
contexts), a read-only text box opens with its contents selected. Use Ctrl+C,
Command+C or your device's Copy action, then **Close copy text**. Copying does
not change bookmarks, recent passages or Continue reading. It makes no network
requests and does not persist copied text.

## Source boundaries

Source text is read directly from loaded datasets, without scraping tables.
Native combined units are copied once with their complete original range
labels, even if only a member was requested. Source placeholders remain
unchanged and receive an explanatory note. Missing and note-only positions are
not filled; a separate notice explains skipped positions when text is available.
An empty block reports that no source verse text is available.

Native LXX copies its current complete chapter with original source labels and
an independent-numbering notice. Unnumbered segments are explicitly labelled
as unnumbered source text. Each parallel pane copies independently. Hebrew
uses the original square-script dataset text, including when a visual Paleo or
Proto font presentation is active. Source notes, footnotes, visual script
transformations, interlinear glosses and alignment overlays are excluded.
Dedicated interlinear/search-result views have no copy-passage control; open a
normal passage first. This avoids presenting study annotations as Scripture.

## Implementation and focused checks

`copy-passage.js` formats credited plain text and owns the clipboard/fallback
control. `app.js` supplies source units through the existing availability,
native-unit and reference-label helpers. Copy controls are excluded from
reading-action recording. Shell v71 precaches the new script; data cache v3
and file-based loading are unchanged.

Run `npm run test:copy-passage` for desktop/mobile DOM checks covering exact
source text, chapter and selected references, context exclusion, multiple
editions, combined units, attribution metadata, independent LXX/parallel panes,
clipboard success, permission failure and absent clipboard APIs. Runtime
network calls are forbidden in the test. Actual operating-system clipboard,
visual layout, device selection gestures and screen-reader checks remain
manual; the full regression suite was not run for this milestone.
