// Shared, metadata-only disclosures. Never loads or edits a Scripture dataset.
(() => {
  'use strict';
  const data = window.MARANATHA_EDITION_INFORMATION_DATA || {};
  function record(entry) {
    entry = entry || {};
    return (Object.prototype.hasOwnProperty.call(data, entry.id) ? data[entry.id] : null) || {
      label: entry.label || entry.id || 'Unknown edition', description: entry.description || '',
      provenance: 'Edition provenance is not documented in this panel.', coverage: 'Coverage is not documented in this panel.',
      terms: 'Reuse terms are not documented in this panel. Do not infer public-domain status.',
      limitations: entry.note || 'Textual limitations are not documented in this panel.',
      verification: 'Verification status is not documented in this panel. No certification is asserted.',
      links: [], warningKind: entry.note ? 'audit' : null,
    };
  }
  function safeLink(href) {
    if (typeof href !== 'string') return false;
    if (/^https?:\/\//i.test(href)) { try { return ['http:', 'https:'].includes(new URL(href).protocol); } catch { return false; } }
    return /^(?:PROJECT_HISTORY\.md|(?:data|docs|build)\/[\w./-]+)$/.test(href) && !href.split('/').includes('..');
  }
  function update(details, entry) {
    entry = entry || {};
    const info = record(entry), summary = document.createElement('summary');
    summary.textContent = 'Edition information'; summary.setAttribute('aria-label', `Edition information: ${info.label}`);
    const original = document.createElement('p'); original.className = 'edition-description';
    original.textContent = entry.description || info.description;
    const fields = document.createElement('dl'); fields.className = 'edition-fields';
    for (const [label, key] of [['Edition and provenance', 'provenance'], ['Coverage', 'coverage'], ['Reuse terms', 'terms'], ['Numbering and limitations', 'limitations'], ['Verification status', 'verification']]) {
      const term = document.createElement('dt'), value = document.createElement('dd');
      term.textContent = label; value.textContent = info[key]; value.dataset.editionField = key;
      fields.append(term, value);
    }
    const evidence = document.createElement('div'); evidence.className = 'edition-evidence';
    for (const link of info.links) {
      if (!safeLink(link.href)) continue;
      const anchor = document.createElement('a'); anchor.href = link.href; anchor.textContent = link.label;
      anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; evidence.append(anchor);
    }
    const limit = document.createElement('p'); limit.className = 'edition-verification-scope';
    limit.textContent = 'Digital-source checks, print/manuscript collation and translation quality are separate questions. The records above describe documented checks, not a new audit or blanket certification.';
    details.dataset.editionId = entry.id;
    details.replaceChildren(summary, original, fields, evidence, limit);
  }
  function create(entry) {
    const details = document.createElement('details'); details.className = 'translation-source edition-information';
    update(details, entry); return details;
  }
  function warningKind(entry) { return record(entry).warningKind; }
  function warningTitle(entry) { return warningKind(entry) === 'limitations' ? 'Textual limitations' : 'Under audit'; }
  window.MARANATHA_EDITION_INFORMATION = Object.freeze({ create, update, warningKind, warningTitle });
})();
