// data/known-variants.js
//
// Same philosophy as `provisional: true` in canon.js: a real, documented
// fact about the text gets recorded here as a structured, machine-readable
// entry instead of living only as prose in PROJECT_HISTORY.md, where
// validate.mjs can't check against it.
//
// A "known variant" is a chapter where more than one verse count is
// genuinely correct, because different manuscript traditions place the
// same material in different places — NOT a data bug or import error.
// canon.js still records one "expected" count per chapter (needed for the
// rest of the app), but validate.mjs checks a mismatch against this list
// before treating it as an error: if the translation's real count matches
// one of the documented acceptedCounts, it's reported as informational,
// not flagged. A count that matches NEITHER canon's expectation NOR any
// acceptedCounts entry is still a real problem and stays flagged — this
// file only accounts for variation that has actually been confirmed by
// hand against real translation data, not a blanket excuse.
//
// Each entry:
//   book           canon book ID
//   chapter        1-indexed chapter number
//   reason         human-readable explanation (also usable in error/info text)
//   acceptedCounts every verse count confirmed as a real, correct reading
//                  for this chapter across the translations currently in
//                  this project. Add to this list (with evidence) if a
//                  new translation introduces another genuine tradition —
//                  don't pad it speculatively.
//
// IMPORTANT: this array is parsed with JSON.parse, not evaluated as real
// JS, despite the .js extension and window.X = ... wrapper (same
// convention as canon.js). That means strict JSON syntax INSIDE the array:
// double-quoted keys, no inline // comments. Both were tried by hand while
// building this file and both broke parsing — don't reintroduce them.

window.MARANATHA_KNOWN_VARIANTS = [
  {
    "book": "ROM",
    "chapter": 14,
    "reason": "The closing doxology (Romans 16:25-27) appears at the end of chapter 14 in the Byzantine/WEB textual tradition, rather than at the end of chapter 16 as in the KJV/Textus Receptus tradition. Confirmed directly against data/web.json, data/kjv.json, data/byz.json. 23 = KJV/Textus Receptus (doxology is in ch16, not here). 26 = WEB/Byzantine (doxology is here, not in ch16).",
    "acceptedCounts": [23, 26]
  },
  {
    "book": "ROM",
    "chapter": 16,
    "reason": "The closing doxology (Romans 16:25-27) appears at the end of this chapter in the KJV/Textus Receptus tradition, rather than at the end of chapter 14 as in the Byzantine/WEB tradition. Confirmed directly against data/web.json, data/kjv.json, data/byz.json. 24 = WEB/Byzantine (doxology is in ch14, not here). 27 = KJV/Textus Receptus (doxology is here, not in ch14).",
    "acceptedCounts": [24, 27]
  }
];