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
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  const text = document.createElement('pre'); text.className = 'print-text'; text.dir = 'auto';
  let origin = null;
  actions.append(heading, print, close, status); preview.append(actions, description, text); document.body.append(preview);
  function dismiss() {
    preview.hidden = true; document.documentElement.classList.remove('print-passage-ready');
    text.textContent = ''; status.textContent = '';
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
  function control(getText, label) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'print-passage-button'; button.textContent = 'Print passage';
    button.setAttribute('aria-label', `Print passage: ${label}`);
    button.addEventListener('click', () => {
      const value = getText();
      if (!value) {
        const message = button.parentElement.querySelector('[role="status"]');
        if (message) message.textContent = 'No source verse text is available to print in this passage.';
        return;
      }
      origin = button; description.textContent = label; text.textContent = value;
      status.textContent = 'Review this passage, then print or save it as PDF. Navigation and tools are excluded.';
      preview.hidden = false; document.documentElement.classList.add('print-passage-ready');
      print.focus({ preventScroll: true }); preview.scrollIntoView({ block: 'start' });
    });
    return button;
  }
  window.MARANATHA_PRINT_PASSAGE = Object.freeze({ control });
})();
