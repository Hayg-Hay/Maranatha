// Local bookmarks contain references and reading preferences, never Bible text.
(() => {
  'use strict';
  const KEY = 'maranatha-saved-passages-v1', LIMIT = 200, MAX_BYTES = 1000000;
  const byteLength = text => encodeURIComponent(text).replace(/%[A-F\d]{2}/g, 'x').length;
  const portable = entries => JSON.stringify({ format: 'maranatha-saved-passages', version: 1, bookmarks: entries }, null, 2);
  const identity = reading => JSON.stringify([reading.view, reading.translations.slice().sort(), reading.passage, reading.native, reading.parallel]);
  function createStore(storage, catalog) {
    function validate(entries) {
      if (!Array.isArray(entries) || entries.length > LIMIT) throw new Error('A backup may contain up to 200 passages.');
      return entries.map(entry => {
        const reading = window.MARANATHA_READING_SESSION.validate(entry?.reading, catalog);
        if (!reading || typeof entry.name !== 'string' || entry.name.length > 120 || /[\u0000-\u001f\u007f]/.test(entry.name)) throw new Error('The saved passages contain an invalid name or reading.');
        return { name: entry.name.trim(), reading };
      });
    }
    function decode(text, backup = false) {
      if (typeof text !== 'string' || text.length > MAX_BYTES || byteLength(text) > MAX_BYTES) throw new Error('The saved passages file is too large.');
      let value;
      try { value = JSON.parse(text); } catch { throw new Error('The saved passages file is not valid JSON.'); }
      if (!value || value.version !== 1 || (backup && value.format !== 'maranatha-saved-passages')) throw new Error('This saved passages format is not supported.');
      return validate(value.bookmarks);
    }
    function list() { const text = storage.getItem(KEY); return text === null ? [] : decode(text); }
    function write(entries) {
      const text = JSON.stringify({ version: 1, bookmarks: entries });
      if (byteLength(portable(entries)) > MAX_BYTES) throw new Error('The saved passages are too large to save.');
      storage.setItem(KEY, text);
    }
    return {
      list,
      save(name, reading) {
        const entry = validate([{ name, reading }])[0], entries = list();
        const index = entries.findIndex(item => identity(item.reading) === identity(entry.reading));
        if (index < 0) entries.push(entry); else entries[index] = entry;
        if (entries.length > LIMIT) throw new Error('You can save up to 200 passages. Export a backup, then remove one to make room.');
        write(entries);
      },
      remove(index) { const entries = list(); entries.splice(index, 1); write(entries); },
      export() { return portable(list()); },
      import(text) {
        const incoming = decode(text, true), entries = list();
        const seen = new Set(entries.map(entry => identity(entry.reading)));
        let added = 0;
        for (const entry of incoming) if (!seen.has(identity(entry.reading))) { entries.push(entry); seen.add(identity(entry.reading)); added++; }
        if (entries.length > LIMIT) throw new Error('Import would exceed the limit of 200 passages. Nothing was imported.');
        write(entries); return added;
      },
    };
  }
  function mount({ catalog, capture, describe, open }) {
    const q = selector => document.querySelector(selector);
    const status = q('#bookmark-status'), button = q('#bookmark-passage'), form = q('#bookmark-editor'), name = q('#bookmark-name');
    let draft = null, store;
    const report = text => { status.textContent = text; };
    const failed = error => report(`Could not update saved passages. ${error.message} Your browser must allow local storage.`);
    try { store = createStore(window.localStorage, catalog); } catch (error) { failed(error); }
    function render() {
      const list = q('#bookmark-list'); list.replaceChildren();
      try {
        if (!store) throw new Error('Local storage is unavailable.');
        const entries = store.list();
        q('#bookmark-count').textContent = String(entries.length);
        q('#bookmark-export').disabled = !entries.length;
        if (!entries.length) { const empty = document.createElement('p'); empty.textContent = 'No saved passages yet.'; list.append(empty); }
        entries.forEach((entry, index) => {
          const row = document.createElement('li'), title = document.createElement('strong'), reference = document.createElement('p');
          title.textContent = entry.name || describe(entry.reading); reference.textContent = entry.name ? describe(entry.reading) : '';
          const visit = document.createElement('button'); visit.type = 'button'; visit.textContent = 'Open'; visit.setAttribute('aria-label', `Open ${title.textContent}`);
          visit.addEventListener('click', async () => { visit.disabled = true; try { await open(entry.reading); } finally { visit.disabled = false; } });
          const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${title.textContent}`);
          remove.addEventListener('click', () => {
            try {
              // Another tab may have changed the list since this row was drawn.
              const current = store.list(), found = current.findIndex(item => identity(item.reading) === identity(entry.reading));
              if (found >= 0) store.remove(found);
              render(); report('Passage removed.');
            } catch (error) { failed(error); }
          });
          row.append(title, reference, visit, remove); list.append(row);
        });
      } catch (error) { failed(error); }
    }
    button.addEventListener('click', () => {
      draft = capture(); if (!draft) { report('Open a passage before bookmarking it.'); return; }
      q('#bookmark-preview').textContent = describe(draft); name.value = ''; form.hidden = false; name.focus();
    });
    q('#bookmark-cancel').addEventListener('click', () => { form.hidden = true; draft = null; button.focus(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        if (!store) throw new Error('Local storage is unavailable.');
        store.save(name.value, draft); form.hidden = true; draft = null; render(); report('Passage saved on this device.'); button.focus();
      } catch (error) { failed(error); }
    });
    q('#bookmark-export').addEventListener('click', () => {
      let url;
      try {
        const blob = new Blob([store.export()], { type: 'application/json' });
        url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = 'maranatha-saved-passages.json'; document.body.append(link); link.click(); link.remove();
        report('Backup downloaded. Keep it somewhere safe.');
      } catch (error) { failed(error); }
      finally { if (url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
    });
    q('#bookmark-import').addEventListener('change', event => {
      const input = event.target, file = input.files[0]; input.value = ''; if (!file) return;
      if (file.size > MAX_BYTES) { report('The backup is too large. The limit is 1 MB.'); return; }
      const reader = new FileReader();
      reader.onerror = () => report('Could not read the backup file.');
      reader.onload = () => {
        try {
          if (!store) throw new Error('Local storage is unavailable.');
          const added = store.import(reader.result); render(); report(`Imported ${added} passage${added === 1 ? '' : 's'}. Existing passages were kept.`);
        } catch (error) { failed(error); }
      };
      reader.readAsText(file);
    });
    window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) render(); });
    render();
    return { refresh() { button.disabled = !capture(); } };
  }
  window.MARANATHA_SAVED_PASSAGES = Object.freeze({ KEY, createStore, mount });
})();
