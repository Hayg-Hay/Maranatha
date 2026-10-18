# Saved passages

Use **Bookmark this passage** above the reading, optionally enter a name, and
choose **Save passage**. The editor shows the captured reference, so navigating
while it is open does not change the passage being saved. Expand **Saved
passages** to open or remove an entry. Saving the same passage and editions
again updates its name and preferences rather than creating a duplicate.

Bookmarks preserve selected editions, reference groups, native LXX chapters,
both parallel panes, and reading preferences. Search results and study overlays
are not saved. Opening uses the same load/validation/cancellation path as
Continue reading. Missing edition files leave bookmarks available for retry.

## Backups and limits

Everything remains in the current browser's local storage. Browsers may isolate
file-based pages differently; moving the folder, switching browsers or clearing
site data can make local records unavailable. Export a JSON backup before such
changes. Import merges new entries and keeps existing duplicates and names.
There is no account sync and backups contain references/settings, not Scripture.

Limits: 200 entries, 120 characters per optional name, and a 1 MB backup file.
Imports validate the complete file before a single storage write. Unknown
editions, invalid snapshots, unsupported versions, oversized files or too many
entries fail without replacing the local collection. Storage access/quota
failures are reported without interrupting reading. Corrupt stored collections
are reported and never silently overwritten.

## Implementation and verification

`saved-passages.js` owns the store and UI. Its independent key is
`maranatha-saved-passages-v1`. Records use `{version:1, bookmarks:[{name,reading}]}`;
exports also carry `format:"maranatha-saved-passages"`. Reading snapshots are
validated by `reading-session.js`, then checked against loaded edition data
when opened. Imported names are rendered with textContent. Each mutation reads
storage again; other tabs refresh via the storage event. Concurrent writes are
subject to normal localStorage last-write behavior.

`npm run test:saved-passages` checks store boundaries and desktop/mobile DOM
save/open/reload/remove/import workflows, with runtime network calls forbidden.
Existing reading-polish checks exercise the shared restore path. Service-worker
checks cover shell v69 precaching while data cache v3 stays intact. DOM tests
do not establish visual layout or physical-device/screen-reader behavior.
Full regression was not run for this milestone.
