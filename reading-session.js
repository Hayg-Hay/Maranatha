// Small versioned storage boundary. Store references/preferences only, never
// Scripture, search queries, executable URLs or downloaded translation data.
(() => {
  'use strict';
  const KEY = 'maranatha-last-reading-v1';
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  const integer = (n, max) => Number.isInteger(n) && n >= 1 && n <= max;
  const label = v => typeof v === 'string' && /^[A-Za-z0-9-]{1,32}$/.test(v);
  function validate(value, catalog) {
    if (!object(value) || value.version !== 1 || !['canon', 'lxx', 'parallel'].includes(value.view)) return null;
    if (!Array.isArray(value.translations) || value.translations.length > catalog.translations.length
      || value.translations.some(id => !catalog.translations.includes(id))
      || new Set(value.translations).size !== value.translations.length) return null;
    if (value.view === 'canon' && !value.translations.length) return null;
    if (!object(value.passage) || !catalog.books.includes(value.passage.bookId) || !integer(value.passage.chapter, 200)) return null;
    if (!['browse', 'reference'].includes(value.passage.mode)) return null;
    if (value.passage.highlight != null && !integer(value.passage.highlight, 1000)) return null;
    const groups = value.passage.groups;
    if (value.passage.mode === 'reference' && (!Array.isArray(groups) || !groups.length || groups.length > 100)) return null;
    if (groups != null && (!Array.isArray(groups) || groups.some(g => !object(g) || !catalog.books.includes(g.bookId)
      || !integer(g.chapter, 200) || (g.ranges !== null && (!Array.isArray(g.ranges) || !g.ranges.length || g.ranges.length > 100
        || g.ranges.some(r => !object(r) || !integer(r.start, 1000) || !integer(r.end, 1000) || r.end < r.start)))))) return null;
    const native = value.native;
    if (value.view !== 'canon' && (!object(native) || !label(native.bookId) || !label(native.chapter))) return null;
    const parallel = value.parallel;
    if (value.view === 'parallel' && (!object(parallel) || !catalog.translations.includes(parallel.translation)
      || !catalog.books.includes(parallel.bookId) || !integer(parallel.chapter, 200))) return null;
    const settings = value.settings;
    const allowed = { layout: ['auto', 'multicolumn', 'multirow'], theme: ['', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'rose'],
      reading: ['', 'warm', 'low-contrast'], appearance: ['system', 'light', 'dark'], fontsize: ['', 'large', 'larger', 'largest'], language: catalog.locales };
    if (!object(settings) || Object.entries(allowed).some(([key, choices]) => !choices.includes(settings[key]))) return null;
    if (!Array.isArray(settings.hebrewScripts) || !settings.hebrewScripts.length || settings.hebrewScripts.length > 3
      || settings.hebrewScripts.some(s => !['square', 'paleo', 'proto'].includes(s))) return null;
    // Return a new allowlisted object; ignore unknown keys from old/corrupt data.
    return { version: 1, view: value.view, translations: [...value.translations],
      passage: { bookId: value.passage.bookId, chapter: value.passage.chapter, mode: value.passage.mode,
        highlight: value.passage.mode === 'browse' ? value.passage.highlight ?? null : null,
        groups: value.passage.mode === 'reference' ? groups.map(g => ({ bookId: g.bookId, chapter: g.chapter, ranges: g.ranges?.map(r => ({ start: r.start, end: r.end })) ?? null })) : null },
      native: value.view === 'canon' ? null : { bookId: native.bookId, chapter: native.chapter },
      parallel: value.view === 'parallel' ? { translation: parallel.translation, bookId: parallel.bookId, chapter: parallel.chapter } : null,
      settings: Object.fromEntries([...Object.keys(allowed).map(key => [key, settings[key]]), ['hebrewScripts', [...new Set(settings.hebrewScripts)]]]) };
  }
  function load(storage, catalog) {
    try {
      const text = storage.getItem(KEY);
      if (!text || text.length > 64000) return null;
      return validate(JSON.parse(text), catalog);
    } catch { return null; }
  }
  function save(storage, value, catalog) {
    try {
      const valid = validate(value, catalog);
      if (!valid) return false;
      const text = JSON.stringify(valid);
      if (text.length > 64000) return false;
      if (storage.getItem(KEY) !== text) storage.setItem(KEY, text);
      return true;
    } catch { return false; }
  }
  function clear(storage) { try { storage.removeItem(KEY); return true; } catch { return false; } }
  window.MARANATHA_READING_SESSION = Object.freeze({ KEY, validate, load, save, clear });
})();
