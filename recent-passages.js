// Device-local navigation history. Search queries and Scripture are never stored.
(() => {
  'use strict';
  const KEY = 'maranatha-recent-passages-v1';
  const identity = reading => JSON.stringify([reading.view, reading.translations.slice().sort(), reading.passage, reading.native, reading.parallel]);
  function createStore(storage, catalog) {
    const validate = reading => window.MARANATHA_READING_SESSION.validate(reading, catalog);
    function list() {
      const text = storage.getItem(KEY);
      if (text === null) return [];
      if (text.length > 640000) throw new Error('History is too large.');
      const data = JSON.parse(text);
      if (data?.version !== 1 || !Array.isArray(data.readings) || data.readings.length > 10) throw new Error('History format is invalid.');
      const readings = data.readings.map(validate);
      if (readings.some(reading => !reading)) throw new Error('History contains an invalid reading.');
      return readings;
    }
    return {
      list,
      record(snapshot) {
        const reading = validate(snapshot);
        if (!reading) return;
        const readings = [reading, ...list().filter(item => identity(item) !== identity(reading))].slice(0, 10);
        const text = JSON.stringify({ version: 1, readings });
        if (text.length > 640000) throw new Error('History is too large.');
        storage.setItem(KEY, text);
      },
      clear() { storage.removeItem(KEY); },
    };
  }
  function mount({ catalog, describe, open }) {
    const q = selector => document.querySelector(selector), list = q('#recent-list'), status = q('#recent-status');
    let store, lastIdentity = null;
    const fail = () => { status.textContent = 'Recent passages are unavailable. Check browser storage permissions, or clear history to reset it.'; };
    try { store = createStore(window.localStorage, catalog); } catch { fail(); }
    function render() {
      list.replaceChildren();
      try {
        if (!store) { fail(); return; }
        const readings = store.list();
        q('#recent-count').textContent = String(readings.length);
        if (!readings.length) { const item = document.createElement('li'); item.textContent = 'Passages you open will appear here.'; list.append(item); }
        for (const reading of readings) {
          const item = document.createElement('li'), button = document.createElement('button');
          button.type = 'button'; button.textContent = describe(reading);
          button.addEventListener('click', async () => { button.disabled = true; try { await open(reading); } finally { button.disabled = false; } });
          item.append(button); list.append(item);
        }
      } catch { fail(); }
    }
    q('#recent-clear').addEventListener('click', () => {
      try {
        if (!store) { fail(); return; }
        store.clear(); render(); status.textContent = 'Recent passages cleared. Your bookmarks are kept.';
      } catch { fail(); }
    });
    window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) { status.textContent = ''; render(); } });
    render();
    return {
      record(reading) {
        // Redraws, settings changes and clearing history must not create visits.
        const nextIdentity = identity(reading);
        if (nextIdentity === lastIdentity) return;
        lastIdentity = nextIdentity;
        try { if (!store) return; store.record(reading); status.textContent = ''; render(); } catch { fail(); }
      },
    };
  }
  window.MARANATHA_RECENT_PASSAGES = Object.freeze({ KEY, createStore, mount });
})();
