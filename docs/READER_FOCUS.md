# Reader focus

Click **Enter reader focus** above the passage to hide the page header, main
navigation/settings panel, bookmarks/history tools and parallel-pane chapter
pickers. The reading keeps its selected editions, layout, font size and colors.
The source text is not rerendered or changed. Passage headings, copy buttons,
context toggles, bottom chapter navigation, source notices and attribution
remain available. Exit to choose another passage through the main controls.

A sticky **Exit reader focus** button remains above the reading. Click it or
press Escape to restore the controls. The button exposes its state through
aria-pressed, and keyboard exit focuses the button. Escape is ignored during
text composition or when another control has already handled it. The toolbar
wraps on narrow screens and uses the existing theme colors.

This is a temporary presentation, without fullscreen permissions or stored
preferences. Refresh always starts in the normal view. Entering/exiting does
not update Continue reading, bookmarks or recent passages. Navigating chapters
while focused still records reading normally. The script requires no network
access and works with file-based pages and hosted offline pages.

## Implementation and checks

`reader-focus.js` toggles a root CSS class, button text/state and the exit hint.
CSS hides the chosen controls with display:none so they also leave keyboard
navigation and the accessibility tree. `app.js` excludes the focus toolbar
from reading-action recording. Shell v72 precaches the focus script; data
cache v3 remains unchanged.

`npm run test:reader-focus` covers desktop/mobile DOM and CSS visibility,
unchanged reading content and storage, keyboard exit/composition handling,
chapter navigation, independent parallel panes, attribution and refresh.
Existing copy, history, bookmark and reading-polish checks cover compatibility.
Actual sticky scrolling, browser zoom, physical-device behavior and
screen-reader announcements still require manual review. The full regression
suite was not run for this milestone.
