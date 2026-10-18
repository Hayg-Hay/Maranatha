# Search polish

Search works as before, with a maximum of 300 displayed results and an accurate
total. Clicking Search or pressing Enter in its field scrolls directly to the
results heading (including the no-matches message). Empty/invalid searches stay
at the controls. Scrolling respects reduced-motion preferences; ordinary
redraws and Back to search keep their existing position behavior.
Verses longer than 240 grapheme clusters show an excerpt around the first
match, with ellipses indicating omitted text. Shorter verses remain complete.
The original substring and existing language-aware highlights are preserved;
the excerpt keeps the complete match and nearby context, preferring word
boundaries when spaces are available. A very long query can produce a longer
excerpt so the match is never cut off. Without Intl.Segmenter, a code-point
fallback keeps combining marks and joined emoji together.

Click a result or use Enter/Space to open its full chapter. **Back to search
results** appears above the reading, including in reader focus mode. It restores
the original query and edition, expanded comparison panels when other editions
are still selected, and keyboard focus on the result you opened. Its viewport
offset is restored to preserve your place after a layout change. A newly
performed search replaces the previous remembered visit. There is one return
target, rather than a stack of all past searches.

The original search edition remains available in the search picker while its
results are displayed, even if you unchecked it during chapter reading.
Returning to results does not change the reader's edition checkboxes. Search
results take precedence over study overlays and can be revisited even if no
reading editions are selected. The return action supersedes a pending saved
reading/native-reference navigation.

The query, result matches, open panels and position stay in memory only.
Refresh clears the return target. They are never saved in Continue reading,
bookmarks or recent passages. Opening a result still records the ordinary
reading snapshot, including when opened by keyboard. Returning to search
records no reading snapshot and makes no network requests.

## Checks

`npm run test:search-polish` covers desktop/mobile DOM workflows: Unicode-safe
excerpt boundaries with and without Intl.Segmenter, real long-verse excerpts,
highlights, the 300-result cap, keyboard navigation, restoration of query,
edition, comparison and position, unchecked reading editions, new/no-result
searches, storage isolation and focus mode. Existing reading, bookmark,
history, copy and focus checks cover compatibility. Shell v73 retains data
cache v3. Actual scroll placement, physical-device and screen-reader behavior
still need manual review; the full regression suite was not run.
