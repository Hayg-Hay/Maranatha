// Print a captured, credited source passage without opening another window.
(() => {
  'use strict';
  const preview = document.createElement('section');
  preview.id = 'print-preview'; preview.hidden = true;
  preview.setAttribute('aria-labelledby', 'print-preview-title');
  const actions = document.createElement('div'); actions.className = 'print-actions';
  const heading = document.createElement('h2'); heading.id = 'print-preview-title'; heading.textContent = 'Print preview';
  const description = document.createElement('p'); description.className = 'print-description';
  const print = document.createElement('button'); print.type = 'button'; print.textContent = 'Print / Save as PDF';
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close print preview';
  const sizeLabel = document.createElement('label'); sizeLabel.className = 'print-size-label'; sizeLabel.textContent = 'Print size ';
  const size = document.createElement('select'); size.id = 'print-size';
  for (const points of [12, 14, 16, 18, 24]) {
    const option = document.createElement('option'); option.value = String(points); option.textContent = `${points} pt`;
    size.appendChild(option);
  }
  sizeLabel.appendChild(size);
  const layoutLabel = document.createElement('label'); layoutLabel.className = 'print-layout-label'; layoutLabel.textContent = 'Print layout ';
  const layout = document.createElement('select'); layout.id = 'print-layout';
  for (const [value, label] of [['comparison', 'Verse-by-verse comparison'], ['sequential', 'Translation-by-translation']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = label; layout.append(option);
  }
  layoutLabel.append(layout);
  const alignmentLabel = document.createElement('label'); alignmentLabel.className = 'print-alignment-label'; alignmentLabel.textContent = 'Text alignment ';
  const alignment = document.createElement('select'); alignment.id = 'print-alignment';
  for (const [value, label] of [['standard', 'Standard'], ['centered', 'Centered with side margins']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = label; alignment.append(option);
  }
  alignmentLabel.append(alignment);
  const alignmentHint = document.createElement('p'); alignmentHint.textContent = 'Centered text leaves space on both sides for handwritten notes and arrows.';
  alignment.addEventListener('change', () => {
    preview.classList.toggle('print-centered', alignment.value === 'centered'); applySize();
  });
  const layoutHint = document.createElement('p'); layoutHint.className = 'print-layout-hint';
  const sizeHint = document.createElement('p'); sizeHint.textContent = 'Preview and PDF use this size. Print at 100% scale to keep the selected size on paper.';
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  const text = document.createElement('pre'); text.className = 'print-text'; text.dir = 'auto';
  const comparison = document.createElement('div'); comparison.className = 'print-comparison'; comparison.hidden = true;
  let origin = null, captured = null;
  function applySize() {
    if (![12, 14, 16, 18, 24].includes(Number(size.value))) size.value = '12';
    text.style.fontSize = `${size.value}pt`;
    description.style.fontSize = `${Number(size.value) * (alignment.value === 'centered' ? .75 : 1)}pt`;
    comparison.style.fontSize = `${size.value}pt`;
  }
  size.addEventListener('change', applySize); applySize();
  layout.addEventListener('change', renderLayout);
  actions.append(heading, sizeLabel, layoutLabel, alignmentLabel, sizeHint, layoutHint, alignmentHint, print, close, status); preview.append(actions, description, text, comparison); document.body.append(preview);
  function canCompare() {
    if (!(captured?.editions?.length > 1)) return false;
    const labels = new Map();
    return captured.editions.every(edition => {
      if (!edition.comparable || !Array.isArray(edition.positions)) return false;
      const seen = new Set();
      return edition.positions.every(row => {
        if (!Number.isInteger(row.verse) || row.verse < 1 || seen.has(row.verse) || (labels.has(row.verse) && labels.get(row.verse) !== row.label)) return false;
        seen.add(row.verse); labels.set(row.verse, row.label); return true;
      });
    });
  }
  function renderLayout() {
    if (!canCompare()) layout.value = 'sequential';
    const grouped = layout.value === 'comparison';
    text.hidden = grouped; comparison.hidden = !grouped;
    comparison.replaceChildren();
    if (!grouped) return;
    const note = document.createElement('p'); note.className = 'print-comparison-notice';
    note.textContent = 'Grouped by displayed reference for study. Shared numbers are not a certification of textual equivalence; consult edition notices.';
    comparison.append(note);
    const editions = captured.editions.map(edition => ({ ...edition, byVerse: new Map(edition.positions.map(row => [row.verse, row])) }));
    const sources = new Map(editions.flatMap(edition => edition.positions.map(row => [row.verse, row])));
    const numbers = [...sources.keys()].sort((a, b) => a - b);
    for (const number of numbers) {
      const source = sources.get(number);
      const group = document.createElement('section'); group.className = 'print-verse-group';
      const title = document.createElement('h3'); title.className = 'print-verse-heading'; title.textContent = `${captured.bookName} ${source.label}`;
      group.append(title);
      for (const edition of editions) {
        const entry = document.createElement('div'); entry.className = 'print-translation';
        const label = document.createElement('p'); label.className = 'print-translation-label'; label.textContent = edition.label;
        const body = document.createElement('p'); body.className = 'print-verse-text'; body.dir = 'auto';
        if (edition.language) body.lang = edition.language;
        const row = edition.byVerse.get(number);
        body.textContent = row?.text || row?.message || 'No separately indexed source verse text is supplied at this reference.';
        if (!row?.text) body.classList.add('print-unavailable');
        entry.append(label, body);
        if (row?.placeholder) {
          const notice = document.createElement('p'); notice.className = 'print-unavailable'; notice.textContent = 'Source placeholder; no verse text is supplied by this marker.'; entry.append(notice);
        }
        group.append(entry);
      }
      comparison.append(group);
    }
    const credits = document.createElement('section'); credits.className = 'print-comparison-credits';
    const title = document.createElement('h3'); title.textContent = 'Translation credits and source notices'; credits.append(title);
    for (const edition of captured.editions) {
      const entry = document.createElement('section'); entry.className = 'print-edition-credit';
      const label = document.createElement('p'); label.className = 'print-translation-label'; label.textContent = edition.label;
      const body = document.createElement('p'); body.className = 'print-credit-text';
      body.textContent = [edition.notice, ...edition.credits].filter(Boolean).join('\n') || 'Edition identified above; consult its Edition information for source records.';
      entry.append(label, body); credits.append(entry);
    }
    comparison.append(credits);
  }
  function dismiss() {
    preview.hidden = true; document.documentElement.classList.remove('print-passage-ready');
    text.textContent = ''; status.textContent = ''; comparison.replaceChildren(); captured = null;
    const target = origin?.isConnected ? origin : document.querySelector('#reader-focus-toggle');
    target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'nearest' }); origin = null;
  }
  close.addEventListener('click', dismiss);
  document.addEventListener('keydown', event => {
    if (!preview.hidden && preview.contains(document.activeElement) && event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) {
      event.preventDefault(); dismiss();
    }
  });
  print.addEventListener('click', () => {
    status.textContent = 'Choose a printer or Save as PDF in your browser’s print dialog.';
    try {
      if (typeof window.print !== 'function') throw new Error('Print unavailable');
      window.print();
    } catch { status.textContent = 'Printing could not be opened. Use your browser’s Print command while this preview is open.'; }
  });
  function control(getText, label, getPrintData) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'print-passage-button'; button.textContent = 'Print passage';
    button.setAttribute('aria-label', `Print passage: ${label}`);
    button.addEventListener('click', () => {
      const value = getText();
      if (!value) {
        const message = button.parentElement.querySelector('[role="status"]');
        if (message) message.textContent = 'No source verse text is available to print in this passage.';
        return;
      }
      origin = button; description.textContent = label;
      text.replaceChildren();
      value.split('\n').forEach((line, index) => {
        if (index) text.append('\n');
        if (/^— .+ — .+$/.test(line)) {
          const attribution = document.createElement('strong');
          attribution.textContent = line; text.append(attribution);
        } else text.append(line);
      });
      captured = getPrintData?.() || null;
      const eligible = canCompare();
      layout.options[0].disabled = !eligible; layout.value = eligible ? 'comparison' : 'sequential';
      layoutHint.textContent = eligible
        ? 'Comparison is the default for editions in this shared reading block. Change layout to read each translation consecutively.'
        : captured?.editions?.length > 1 || captured?.editions?.some(edition => !edition.comparable)
          ? 'This block has independent numbering or a known boundary difference. Its source units remain in translation-by-translation output.'
          : 'Comparison is available when a shared reading block contains two or more eligible editions. This preview keeps the existing sequential layout.';
      renderLayout();
      status.textContent = 'Review this passage, then print or save it as PDF. Navigation and tools are excluded.';
      preview.hidden = false; document.documentElement.classList.add('print-passage-ready');
      print.focus({ preventScroll: true }); preview.scrollIntoView({ block: 'start' });
    });
    return button;
  }
  window.MARANATHA_PRINT_PASSAGE = Object.freeze({ control });
})();
