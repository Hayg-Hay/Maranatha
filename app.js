(() => {
  'use strict';

  // MARANATHA_CANON is provided by data/canon.js (structure only: ids, testament,
  // chapter/verse counts). MARANATHA_LOCALE_EN is provided by data/locales/en.js.
  // Translation text (data/<id>.js) is NOT loaded up front — each one sets
  // window.MARANATHA_TRANSLATIONS[id] when its <script> tag runs, and that tag is
  // only ever created on demand (see loadTranslation below). This project never
  // uses fetch() for local data: fetch() of local files is blocked by browsers
  // under a bare file:// double-click with no server, which is exactly how this
  // app is meant to run. See PROJECT_HISTORY.md, Phase 2, for the one time that
  // constraint was violated and had to be reverted.

  // Registry of available translations. Adding a new one (once its data/<id>.js
  // exists) means adding one line here — no other change needed.
  const TRANSLATIONS = [
    { id: 'web', label: 'World English Bible', src: 'data/web.js' },
    { id: 'kjv', label: 'King James Version', src: 'data/kjv.js' },
  ];

  const canon = window.MARANATHA_CANON;
  const locale = window.MARANATHA_LOCALE_EN;
  const refs = {
    book: q('#book'), chapter: q('#chapter'), theme: q('#theme'), layout: q('#layout'),
    go: q('#go-button'), results: q('#results'), message: q('#message'),
    translations: q('#translations'),
  };
  const loaded = new Set();   // translation ids whose <script> has finished loading
  const loading = new Set();  // translation ids whose <script> is in flight

  init();

  function q(selector) { return document.querySelector(selector); }

  function init() {
    if (!canon || !locale) {
      setMessage('Could not load data/canon.js or data/locales/en.js. Open this page via the launcher or a local server, not as a bare file:// double-click in some browsers.');
      return;
    }
    populateBooks();
    populateTranslationCheckboxes();
    refs.book.addEventListener('change', () => { populateChapters(); });
    refs.go.addEventListener('click', () => render());
    refs.theme.addEventListener('change', () => setTheme());
    refs.layout.addEventListener('change', () => render());
    populateChapters();
    setTheme();
    render();
  }

  function setTheme() { document.documentElement.dataset.theme = refs.theme.value; }

  function populateBooks() {
    refs.book.innerHTML = '';
    let currentTestament = null;
    for (const book of canon.books) {
      if (book.testament !== currentTestament) {
        currentTestament = book.testament;
        const group = document.createElement('optgroup');
        group.label = currentTestament === 'OT' ? 'Old Testament' : 'New Testament';
        group.dataset.testament = currentTestament;
        refs.book.appendChild(group);
      }
      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = (locale.books[book.id] && locale.books[book.id].name) || book.id;
      refs.book.lastElementChild.appendChild(opt);
    }
  }

  function populateTranslationCheckboxes() {
    refs.translations.innerHTML = '<legend>Translations</legend>';
    TRANSLATIONS.forEach((t, i) => {
      const label = document.createElement('label');
      label.className = 'version';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.value = t.id;
      box.checked = i === 0; // first translation on by default
      box.addEventListener('change', () => {
        if (box.checked) loadTranslation(t, render);
        else render();
      });
      label.append(box, ' ', t.label);
      refs.translations.appendChild(label);
      if (box.checked) loadTranslation(t, render);
    });
  }

  function selectedTranslations() {
    return [...refs.translations.querySelectorAll('input:checked')]
      .map(box => TRANSLATIONS.find(t => t.id === box.value))
      .filter(Boolean);
  }

  // Loads data/<id>.js via a dynamically created <script> tag — not fetch().
  // Script tags work fine under file://; fetch() of local files does not.
  function loadTranslation(t, onReady) {
    if (loaded.has(t.id) || loading.has(t.id)) return;
    loading.add(t.id);
    const script = document.createElement('script');
    script.src = t.src;
    script.onload = () => { loading.delete(t.id); loaded.add(t.id); onReady(); };
    script.onerror = () => { loading.delete(t.id); setMessage(`Could not load ${t.label} (${t.src}).`); };
    document.head.appendChild(script);
  }

  function currentBook() {
    return canon.books.find(b => b.id === refs.book.value);
  }

  function populateChapters() {
    const book = currentBook();
    refs.chapter.innerHTML = '';
    book.chapters.forEach((verseCount, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1);
      opt.textContent = `Chapter ${i + 1}`;
      refs.chapter.appendChild(opt);
    });
  }

  // Looks up a cell's display state for one translation/verse: 'loading',
  // 'missing-book' (translation loaded but doesn't cover this book at all),
  // or the verse text itself (possibly '' for a known source gap — see
  // import-kjv.mjs/import-web.mjs for real examples of both situations).
  function cellFor(t, bookId, chapterNum, verseNum) {
    if (!loaded.has(t.id)) return { state: 'loading' };
    const data = window.MARANATHA_TRANSLATIONS[t.id];
    if (!data.books[bookId]) return { state: 'missing-book' };
    const chapter = data.books[bookId][chapterNum - 1];
    const text = chapter && chapter[verseNum - 1];
    return text ? { state: 'text', text } : { state: 'missing-verse' };
  }

  function fillCell(td, cell) {
    if (cell.state === 'text') {
      td.textContent = cell.text;
    } else {
      td.className = 'verse-placeholder';
      td.textContent = cell.state === 'loading' ? '(loading…)'
        : cell.state === 'missing-book' ? '(not available in this translation)'
        : '(not available)';
    }
  }

  // Ported from YaQuB's local/app.js multiColumn(): one table, a column per
  // translation, side by side.
  function multiColumn(bookId, chapterNum, verseCount, translations) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Verse</th>';
    translations.forEach(t => { const th = document.createElement('th'); th.textContent = t.label; headRow.append(th); });
    head.append(headRow);
    table.append(head);

    const body = document.createElement('tbody');
    for (let v = 1; v <= verseCount; v++) {
      const tr = document.createElement('tr');
      const ref = document.createElement('td');
      ref.className = 'reference';
      ref.textContent = `${chapterNum}:${v}`;
      tr.append(ref);
      translations.forEach(t => {
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v));
        tr.append(td);
      });
      body.append(tr);
    }
    table.append(body);
    return table;
  }

  // Ported from YaQuB's local/app.js multiRow(): one table, each verse's
  // translations listed as consecutive rows underneath it. Better than
  // multi-column when many translations are selected at once.
  function multiRow(bookId, chapterNum, verseCount, translations) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th>Verse</th><th>Translation</th><th>Text</th></tr>';
    table.append(head);

    const body = document.createElement('tbody');
    for (let v = 1; v <= verseCount; v++) {
      translations.forEach(t => {
        const tr = document.createElement('tr');
        const ref = document.createElement('td');
        ref.className = 'reference';
        ref.textContent = `${chapterNum}:${v}`;
        const label = document.createElement('td');
        label.className = 'translation-label';
        label.textContent = t.label;
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v));
        tr.append(ref, label, td);
        body.append(tr);
      });
    }
    table.append(body);
    return table;
  }

  function render() {
    const book = currentBook();
    if (!book) return;
    const chapterNum = Number(refs.chapter.value);
    const verseCount = book.chapters[chapterNum - 1];
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;
    const translations = selectedTranslations();

    refs.results.innerHTML = '';

    if (book.provisional) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = `${name}'s chapter/verse structure is provisional in canon.js and has not been verified against the real WEB Catholic Edition text yet — numbers shown below may change.`;
      refs.results.appendChild(notice);
    }

    if (!translations.length) {
      setMessage('Select at least one translation to display.');
      return;
    }
    setMessage('');

    // Same rule as YaQuB: automatic mode uses multi-row once more than 5
    // translations are selected (multi-column gets too wide to read past
    // that), multi-column otherwise.
    const layout = refs.layout.value === 'auto'
      ? (translations.length > 5 ? 'multirow' : 'multicolumn')
      : refs.layout.value;

    const head = document.createElement('div');
    head.className = 'result-head';
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseCount} verses, ${layout === 'multicolumn' ? 'multi-column' : 'multi-row'})</small></h2>`;
    refs.results.appendChild(head);

    const table = layout === 'multicolumn'
      ? multiColumn(book.id, chapterNum, verseCount, translations)
      : multiRow(book.id, chapterNum, verseCount, translations);
    refs.results.appendChild(table);
  }

  function setMessage(message) { refs.message.textContent = message; }
})();
