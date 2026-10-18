# Print passage

Click **Print passage** beside **Copy passage** at a passage heading. An in-page
preview opens with the captured source text, verse numbers, references,
translation labels and available copyright/license/source metadata. Review it,
then choose **Print / Save as PDF** to open the browser's print dialog. Select
a printer or Save as PDF there. No popup window, clipboard permission, server
or network request is required.

The preview uses the same text as Copy passage: selected verses exclude
expanded context; chapter browsing copies the chapter; combined source units
retain their complete text/range labels; independent editions and parallel
panes keep their own numbering. Hebrew prints source square-script text.
Footnotes and study/alignment overlays are excluded. Available metadata is
preserved without inventing missing credit or licensing information. An empty
passage reports that no source verse text is available.

**Close print preview**, or Escape while focus is inside the preview, closes
it and restores focus to the source button when it still exists. Escape closes
the preview before exiting reader focus. Preview text is captured when opened;
subsequent navigation does not change it. Opening another preview replaces the
capture. Printing or cancelling leaves the preview available for retry.

## Print layout

With a preview open, printing includes only that captured passage. Navigation,
settings, buttons, search results and the normal page footer are hidden. The
layout uses white paper, black text, local source fonts, 12pt text, 18mm page
margins and wrapping without a fixed-height container. Themes and the warm/
low-contrast overlays are removed from print output without changing reading
preferences. Bidirectional plaintext layout preserves direction per paragraph.
The browser controls paper size, pagination and any browser-generated headers
or footers; turn those off in the print dialog if desired.

Closing the preview restores ordinary browser printing. The feature does not
create or save a PDF automatically: the user chooses the file destination in
the browser's Save as PDF flow. If the print API fails, the preview offers the
browser's Print command as a fallback. Copied/preview text never enters local
storage; existing reading, history and bookmarks are unaffected.

## Implementation and checks

`print-passage.js` owns the in-page preview and print action, and loads before
`copy-passage.js`, which supplies a print button beside each copy button using
the same source-text callback. Print CSS is scoped to the open preview class.
Shell v74 precaches the new script, retaining data cache v3.

Run `npm run test:print-passage` for desktop/mobile DOM checks covering selected
source text and copy parity, print-only visibility, keyboard/focus behavior,
API failure feedback, safe text handling, storage isolation, reader focus and
independent native/parallel panes. Reviewed the user's one-page John 3:16 PDF
with WEB, Western Armenian and Byzantine Greek: all three complete source
verses match after normalizing extraction whitespace; rendered text is readable
and unclipped. Browser-generated file path/date/page headers were enabled.
The test PDF is retained under ignored build/cache/print-review/.
Long-passage pagination, physical printer output, glyph embedding and device
behavior still need review. The full regression suite was not run.
