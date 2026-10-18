// Plain text only: preserve source wording and keep attribution with each edition.
(() => {
  'use strict';
  function credits(data) {
    const license = typeof data.license === 'string' ? data.license : data.license?.attribution;
    return [...new Set([data.copyright, license, data.sourceUrl, data.sourceLicenceUrl].filter(value => typeof value === 'string' && value))];
  }
  function format({ reference, label, rows, data = {}, notice = '' }) {
    if (!rows.length) return '';
    return [rows.map(row => `${row.label} ${row.text}`).join('\n'), `— ${reference} — ${label}`, notice, ...credits(data)].filter(Boolean).join('\n');
  }
  function control(getText, description) {
    const wrap = document.createElement('div'); wrap.className = 'passage-copy';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-passage-button'; button.textContent = 'Copy passage';
    button.setAttribute('aria-label', `Copy passage: ${description}`);
    button.title = 'Copies requested verses, or the whole chapter when browsing. Source text and translation credit are included; study overlays are excluded.';
    const status = document.createElement('span'); status.className = 'copy-status'; status.setAttribute('role', 'status');
    const fallback = document.createElement('div'); fallback.className = 'copy-fallback'; fallback.hidden = true;
    const hint = document.createElement('p'); hint.textContent = 'Select and copy the text below (Ctrl+C, Command+C, or your device’s Copy action).';
    const text = document.createElement('textarea'); text.readOnly = true; text.rows = 8; text.dir = 'auto'; text.setAttribute('aria-label', 'Passage text to copy'); text.spellcheck = false;
    const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close copy text';
    close.addEventListener('click', () => { fallback.hidden = true; button.focus(); });
    fallback.append(hint, text, close); wrap.append(button, status, fallback);
    wrap.insertBefore(window.MARANATHA_PRINT_PASSAGE.control(getText, description), status);
    button.addEventListener('click', async () => {
      const value = getText();
      if (!value) { status.textContent = 'No source verse text is available to copy in this passage.'; return; }
      button.disabled = true; status.textContent = ''; fallback.hidden = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        status.textContent = 'Passage copied.';
      } catch {
        text.value = value; fallback.hidden = false;
        status.textContent = 'Copy manually below.';
        if (wrap.isConnected) { text.focus(); text.select(); }
      } finally { button.disabled = false; }
    });
    return wrap;
  }
  window.MARANATHA_COPY_PASSAGE = Object.freeze({ format, control });
})();
