// Reading policy for older datasets that predate per-edition versification
// metadata. Based on retained texts and data/known-variants.js; no text is moved.
// Every affected chapter reads independently, including search/interlinear.
window.MARANATHA_REFERENCE_EXCEPTIONS = {
  he: { PSA: { 13: { comparisonUnavailable: true, collapseSourceAnnotations: true, note: 'The imported Hebrew has five numbered content units. Its fifth unit contains material shown as verses 5–6 in WEB/KJV. No Hebrew wording is missing; these source units must be read independently.' } } },
  kjv: { ROM: {
    14: { comparisonUnavailable: true, note: 'This edition places the closing doxology at Romans 16:25–27, whereas WEB places it at 14:24–26. No same-numbered correspondence is asserted.' },
    16: { comparisonUnavailable: true, note: 'This edition retains the closing doxology at Romans 16:25–27. WEB and Byzantine have different closing reference structures; read independently.' },
  } },
  byz: { ROM: { 16: { comparisonUnavailable: true, note: 'The Byzantine closing references differ from WEB/KJV; its doxology is at the end of Romans 14. Read this chapter independently.' } } },
  web: { ROM: { 16: { comparisonUnavailable: true, note: 'WEB closes this chapter with a reference structure different from KJV/Byzantine; its doxology is at the end of Romans 14. Read independently.' } } },
  armwestern: { ROM: {
    14: { comparisonUnavailable: true, note: 'This under-audit digital witness places the doxology at Romans 16:25–27 rather than at the end of Romans 14. Read independently.' },
    16: { comparisonUnavailable: true, note: 'This under-audit digital witness retains the doxology at Romans 16:25–27. Its closing references are not asserted to align with WEB/Byzantine.' },
  } },
};
