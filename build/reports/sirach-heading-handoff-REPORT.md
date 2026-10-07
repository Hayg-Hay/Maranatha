# Sirach heading claim — independent source check, 2026-10-07

The handoff's §4.5 item3 is stale: it mixes the unused Hart transcription with
the selected Swete transcription. No text restoration or new heading policy is
needed for the approved edition.

Primary source: First1KGreek pin `03776b39f4047c5cff06f5296fae4b2bae4b08fb`,
`data/tlg0527/tlg034/tlg0527.tlg034.1st1K-grc{1,2}.xml`.

| Check | Result | Evidence |
| --- | --- | --- |
| grc1 editor | PASS | XML header: John Henry Arthur Hart |
| grc2 editor | PASS | XML header: Henry Barclay Swete |
| Selected source | PASS | Shipped SIR sourceFile ends in grc2.xml |
| `Περὶ ὑπομονῆς` as head | PASS | grc1 chapter2 head; no matching head in grc2 |
| `Πατέρων ὕμνος.` as head | PASS | grc1 chapter44, inside verse1; no matching head in grc2 |
| Swete's Fathers title | PASS | grc2 line inside source43:33, already present in shipped verse43:33 |
| Patience heading in Swete | PASS | Absent from grc2 and shipped text |
| Runtime/data change | NONE | Documentation correction only; no headings copied between editions |

Evidence: stdlib XML parsing of both pinned files, normalized title matching,
ancestor chapter/verse attributes, XML editor headers and actual shipped JSON.
The diagnostic script is retained in ignored
`build/cache/check-sirach-editorial-headings.py`; its assertions passed.

The shipped Fathers title is embedded where the approved primary source puts it.
This finding does not authorize moving it out of verse43:33, renumbering it or
inserting the unused edition's Patience heading. Existing source fidelity holds.
