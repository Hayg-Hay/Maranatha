# Reading polish: comparison safety and Continue reading

Implemented on branch `codex/reading-polish`, in the existing workspace.
No translation or Scripture text changes. The user approved committing,
merging into main and pushing this milestone to GitHub on 2026-10-18.

## Continue reading

After a passage/navigation or reading-settings action, the app remembers one
reading locally. On the next visit, a banner describes it and offers
**Continue reading** or **Forget saved reading**. Merely opening the app or
expanding a disclosure does not overwrite the previous reading. Resumption is
explicit; the default first view still opens normally.

The saved record contains references and preferences only: selected edition
IDs, passage groups, chapter/highlight, layout, locale, theme, appearance,
reading tint, text size and Hebrew display scripts. Native LXX chapters and
both independent parallel panes are supported. Grouped editions retain the
actual chosen edition. Search results/queries are not saved; opening a search
hit saves its chapter and highlighted verse.

`reading-session.js` owns the versioned, allowlisted storage boundary, key
`maranatha-last-reading-v1`. Corrupt/oversized records and unsupported values
are ignored. Storage denial or quota failure leaves normal reading usable.
There is no account, network synchronization or Scripture copy in storage.
Local browser/file storage may be unavailable or cleared by browser policy;
moving the application to another location/origin may use a different store.

Resume loads the exact needed editions before validating their references.
Missing files produce a retryable message and preserve the saved record.
User navigation or forgetting the record cancels a pending restore. The
translation loader queues callbacks when multiple consumers need the same
in-flight script. Study overlays and the experimental LXX alignment pilot are
not automatically enabled by a saved reading. Context expansions and an exact
native-LXX verse scroll position are not stored; native views resume chapters.

## Comparison safety

`reference-exceptions.js` supplies explicit reading exceptions for older
datasets without embedded versification metadata. Current cases:

- Hebrew Psalm 13: five imported content units; the last contains wording
  corresponding to WEB/KJV 5–6. The Hebrew unit remains intact and no false
  missing-text row is generated for Hebrew 6.
  Its explanation is collapsed below the Hebrew passage in the same notes
  dropdown used by Bohairica, preserving uninterrupted reading.
- KJV and under-audit Armenian Romans 14, and WEB/KJV/Byzantine/Armenian Romans
  16: documented doxology placement/closing-reference differences.

The existing `data/known-variants.js` and retained datasets provide the evidence;
no additional mappings are inferred from matching or differing verse counts.
Per-edition declarations still take precedence. Shared helpers apply the
exceptions to browse/reference blocks, search comparison in either direction,
and interlinear captions. A requested reference with no independently numbered
unit gets an explicit explanation, not invented text or an automatic remap.

This is a targeted correction, not a claim that every historical alignment in
the application has now been certified.

## Offline and verification

Shell **v68** precaches both new scripts. Data cache **v3** stays intact.
Older translation tests now accept the current shell version at or above the
version required by their feature, instead of failing on every later shell
update; the dedicated service-worker test checks the specific v68 transition.

Focused command:

```text
npm run test:reading-polish
```

This runs the new real-app JSDOM suite and service-worker simulation. Coverage
includes desktop/mobile save/reopen, exact edition selection, source-native
extra verses, LXX/parallel controls, malformed/unavailable storage, failed
loading/cancellation, search/invalid-reference isolation, forgetting, Psalm 13
reading/search/interlinear guards, and independent Romans endings. The command
is also appended to the standard `npm test` chain.

Heavy full regression and real-browser visual/device/offline lifecycle review
remain for the manual DeepSeek handoff. See `READING_POLISH_DEEPSEEK_HANDOFF.txt`.
