(() => {
  'use strict';

  const canon = window.MARANATHA_CANON;
  const locale = window.MARANATHA_LOCALE_EN;

  const refs = {
    book: q('#book'),
    chapter: q('#chapter'),
    theme: q('#theme'),
    go: q('#go-button'),
    results: q('#results'),
    message: q('#message'),
  };

  let translationCache = null;

  init();

  function q(selector) {
    return document.querySelector(selector);
  }

  function init() {
    if (!canon || !locale) {
      setMessage('Could not load data/canon.js or data/locales/en.json.');
      return;
    }

    populateBooks();

    refs.book.addEventListener('change', () => {
      populateChapters();
      render();
    });

    refs.chapter.addEventListener('change', () => render());
    refs.go.addEventListener('click', () => render());
    refs.theme.addEventListener('change', () => setTheme());

    populateChapters();
    setTheme();
    render();
  }

  function setTheme() {
    document.documentElement.dataset.theme = refs.theme.value;
  }

  function populateBooks() {
    refs.book.innerHTML = '';
    let currentTestament = null;

    for (const book of canon.books) {
      if (book.testament !== currentTestament) {
        currentTestament = book.testament;
        const group = document.createElement('optgroup');
        group.label = currentTestament === 'OT' ? 'Old Testament' : 'New Testament';
        refs.book.appendChild(group);
      }

      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = (locale.books[book.id] && locale.books[book.id].name) || book.id;
      refs.book.lastElementChild.appendChild(opt);
    }
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

  async function loadGenesis() {
    if (translationCache) {
      return translationCache;
    }

    const response = await fetch('data/translations/douay-rheims/genesis.json');
    translationCache = await response.json();
    return translationCache;
  }

  async function render() {
    const book = currentBook();
    if (!book) return;

    const chapterNum = Number(refs.chapter.value);
    const verseCount = book.chapters[chapterNum - 1];
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;

    refs.results.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'result-head';
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseCount} verses)</small></h2>`;
    refs.results.appendChild(head);

    let verses = [];

    if (book.id === 'GEN') {
      try {
        const translation = await loadGenesis();
        verses = translation.chapters[chapterNum - 1] || [];
      } catch (error) {
        console.error(error);
      }
    }

    const table = document.createElement('table');
    const body = document.createElement('tbody');

    for (let v = 1; v <= verseCount; v++) {
      const tr = document.createElement('tr');

      const ref = document.createElement('td');
      ref.className = 'reference';
      ref.textContent = `${chapterNum}:${v}`;

      const text = document.createElement('td');
      text.className = 'verse-placeholder';
      text.textContent = verses[v - 1] || '(translation text not loaded yet)';

      tr.append(ref, text);
      body.appendChild(tr);
    }

    table.appendChild(body);
    refs.results.appendChild(table);
  }

  function setMessage(message) {
    refs.message.textContent = message;
  }
})();