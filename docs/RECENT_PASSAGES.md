# Recent passages

Expand **Recent passages** beside Saved passages to reopen a reading. The last
10 distinct readings appear newest first. Returning to an older entry moves it
to the top. A reading includes its passage/reference groups, selected editions,
native LXX or parallel chapters, and the preferences captured during that visit.
Changing only preferences does not create another visit or update its snapshot.

History starts recording after a reading action; simply opening or refreshing
the app leaves the previous history intact. Search queries and Scripture text
are never stored. Invalid references and passages whose datasets are still
loading are not recorded. Native verse validation and missing-file/cancellation
handling reuse the existing Continue reading and bookmark restore path.

**Clear history** removes the local history record without changing bookmarks
or the Continue reading record. Redrawing the same reading afterward does not
recreate its visit; navigating to a different reading starts a fresh history.

## Storage and checks

`recent-passages.js` owns the store and list. The localStorage key is
`maranatha-recent-passages-v1` with `{version:1, readings:[snapshot,...]}`.
Snapshots are sanitized by `reading-session.js`. Passage/view/edition identity
determines duplicates; preferences are excluded from that identity. Storage is
read before each write; cross-tab storage events refresh the list. Simultaneous
writes follow normal localStorage last-write behavior. Unavailable, corrupt or
full storage is reported without breaking reading. Clear can reset corrupt
history. Browser storage rules apply: moving a file-based app, clearing browser
data, or changing browser profiles can make history unavailable. History is
not included in bookmark backups.

Run `npm run test:recent-passages` for store bounds, ordering, deduplication,
invalid/search isolation, corruption and desktop/mobile DOM navigation,
reopening, persistence and clearing without affecting bookmarks. Existing
bookmark/reading-polish tests exercise the shared restore path. Service-worker
checks verify shell v70 precaching and unchanged data cache v3. Full regression,
physical-device, visual and screen-reader checks were not run for this change.
