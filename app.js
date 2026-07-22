(() => {
  'use strict';

  // MARANATHA_CANON is provided by data/canon.js (structure only: ids, testament,
  // chapter/verse counts). MARANATHA_LOCALE_EN is provided by data/locales/en.json
  // loaded as a script (see index.html). No translation text exists yet —
  // that's milestone 4. This shell exists to validate the book/chapter nav and
  // the canon/locale split end-to-end before any translation data lands.

  const canon = window.MARANATHA_CANON;
  const locale = window.MARANATHA_LOCALE_EN;
  const refs = {
    book: q('#book'), chapter: q('#chapter'), theme: q('#theme'),
    go: q('#go-button'), results: q('#results'), message: q('#message'),
  };

  init();

  function q(selector) { return document.querySelector(selector); }

  function init() {
    if (!canon || !locale) {
      setMessage('Could not load data/canon.js or data/locales/en.json. Open this page via the launcher or a local server, not as a bare file:// double-click in some browsers.');
      return;
    }
    populateBooks();
    refs.book.addEventListener('change', () => { populateChapters(); });
    refs.go.addEventListener('click', () => render());
    refs.theme.addEventListener('change', () => setTheme());
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

  function render() {
    const book = currentBook();
    if (!book) return;
    const chapterNum = Number(refs.chapter.value);
    const verseCount = book.chapters[chapterNum - 1];
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;

    refs.results.innerHTML = '';

    if (book.provisional) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = `${name}'s chapter/verse structure is provisional in canon.js and has not been verified against the real WEB Catholic Edition text yet — numbers shown below may change.`;
      refs.results.appendChild(notice);
    }

    const head = document.createElement('div');
    head.className = 'result-head';
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseCount} verses)</small></h2>`;
    refs.results.appendChild(head);

    const table = document.createElement('table');
    const body = document.createElement('tbody');
    for (let v = 1; v <= verseCount; v++) {
      const tr = document.createElement('tr');
      const ref = document.createElement('td');
      ref.className = 'reference';
      ref.textContent = `${chapterNum}:${v}`;
      const text = document.createElement('td');
      text.className = 'verse-placeholder';
      text.textContent = '(translation text not loaded yet)';
      tr.append(ref, text);
      body.appendChild(tr);
    }
    table.appendChild(body);
    refs.results.appendChild(table);
  }

  function setMessage(message) { refs.message.textContent = message; }
})();
