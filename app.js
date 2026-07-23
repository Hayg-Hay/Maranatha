
class ReferenceParser {

    constructor(canon, locale) {

        this.canon = canon;
        this.bookMap = new Map();

        for (const book of canon.books) {

            const info = locale.books[book.id];

            if (!info)
                continue;

            this.bookMap.set(
                info.name.toLowerCase(),
                book
            );

            // Reserve a place for future aliases
            if (info.aliases) {

                for (const alias of info.aliases) {

                    this.bookMap.set(
                        alias.toLowerCase(),
                        book
                    );

                }

            }

        }

    }

    // Parses BibleGateway/YaQuB-style multi-reference strings, e.g.
    //   "Mark 14:2,6-9;Matthew 26:26-31"
    //   "Mark 14:2,6-9; Matthew 26:26-31"   (spacing around ';' doesn't matter)
    //   "John 3:16;4:5"                     (a group with no book name
    //                                         carries over the previous
    //                                         group's book)
    //   "1 Corinthians 13"                  (whole chapter, no verse spec)
    //
    // Returns an array of group objects:
    //   { bookId, chapter, ranges }
    // where ranges is either null (render the whole chapter) or an array
    // of { start, end } verse ranges (a bare verse like "6" becomes
    // { start: 6, end: 6 }).
    //
    // Throws an Error with a human-readable message on any malformed or
    // out-of-range group — the caller is expected to catch it and show
    // error.message to the user rather than let it propagate.
    parseMulti(input) {

        const groups = [];
        let lastBookId = null;

        // "<book name> <chapter>[:<verseSpec>]" — requires whitespace
        // between the book name and the chapter number, which is what
        // lets a bare "4:5" (no book) fail this pattern and fall through
        // to chapterOnly below instead of being misread as book="4".
        const withBook = /^(.+?)\s+(\d+)(?::\s*([\d,\s-]+))?$/;

        // "<chapter>[:<verseSpec>]" with no book — only valid when a
        // previous group in the same query already established one.
        const chapterOnly = /^(\d+)(?::\s*([\d,\s-]+))?$/;

        const parts = input.split(';').map(part => part.trim()).filter(Boolean);

        if (!parts.length)
            throw new Error('Enter at least one reference.');

        for (const part of parts) {

            let bookId;
            let chapterText;
            let verseSpec;

            const bareMatch = part.match(chapterOnly);

            if (bareMatch) {

                if (!lastBookId)
                    throw new Error(`"${part}" has no book name, and there is no earlier reference to carry one over from.`);

                bookId = lastBookId;
                [, chapterText, verseSpec] = bareMatch;

            } else {

                const fullMatch = part.match(withBook);

                if (!fullMatch)
                    throw new Error(`"${part}" is not a valid reference.`);

                const [, bookText, chapterMatch, verseSpecMatch] = fullMatch;
                const book = this.bookMap.get(bookText.trim().toLowerCase());

                if (!book)
                    throw new Error(`Unknown book "${bookText.trim()}".`);

                bookId = book.id;
                chapterText = chapterMatch;
                verseSpec = verseSpecMatch;

            }

            const book = this.canon.books.find(b => b.id === bookId);
            const chapter = Number(chapterText);

            if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters.length)
                throw new Error(`"${part}" — chapter ${chapterText} does not exist in this book.`);

            const verseCount = book.chapters[chapter - 1];
            let ranges = null;

            if (verseSpec) {

                ranges = verseSpec
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean)
                    .map(item => {

                        const rangeMatch = item.match(/^(\d+)(?:-(\d+))?$/);

                        if (!rangeMatch)
                            throw new Error(`"${item}" in "${part}" is not a valid verse or verse range.`);

                        const start = Number(rangeMatch[1]);
                        const end = rangeMatch[2] ? Number(rangeMatch[2]) : start;

                        if (end < start)
                            throw new Error(`"${item}" in "${part}" has a reversed range — end comes before start.`);

                        if (start < 1 || end > verseCount)
                            throw new Error(`"${item}" in "${part}" is outside this chapter's ${verseCount} verses.`);

                        return { start, end };

                    });

            }

            groups.push({ bookId, chapter, ranges });
            lastBookId = bookId;

        }

        return groups;

    }

}

(() => {
  'use strict';
  const parser = new ReferenceParser(
    MARANATHA_CANON,
    MARANATHA_LOCALE_EN
);


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
    reference: q('#reference'),
    referenceGo: q('#reference-go'),
    book: q('#book'),
    chapter: q('#chapter'),
    theme: q('#theme'),
    layout: q('#layout'),
    go: q('#go-button'),
    results: q('#results'),
    message: q('#message'),
    translations: q('#translations'),
};
  const loaded = new Set();   // translation ids whose <script> has finished loading
  const loading = new Set();  // translation ids whose <script> is in flight

  // ---------------------------------------------------------------------
  // View state
  //
  // Explicit application mode, replacing the old "currentReference is
  // truthy" implicit check. The renderer branches on viewState.mode only —
  // never on the presence/absence of a reference object. 'reference' mode
  // now always holds an ARRAY of groups (viewState.groups), even for a
  // single-reference query — that's what lets the multi-reference case
  // ("Mark 14:2,6-9;Matthew 26:26-31") reuse exactly the same rendering
  // path as "John 3:16" instead of needing a third mode.
  // ---------------------------------------------------------------------
  const viewState = {
    mode: 'browse',     // 'browse' | 'reference'
    groups: null,       // populated only when mode === 'reference'
  };

  function setBrowseMode() {
    viewState.mode = 'browse';
    viewState.groups = null;
  }

  function setReferenceMode(groups) {
    viewState.mode = 'reference';
    viewState.groups = groups;
  }

  init();

  function q(selector) { return document.querySelector(selector); }
function init() {
    if (!canon || !locale) {
        setMessage('Could not load data/canon.js or data/locales/en.js. Open this page via the launcher or a local server, not as a bare file:// double-click in some browsers.');
        return;
    }

    populateBooks();
    populateTranslationCheckboxes();

    refs.book.addEventListener('change', () => {
        setBrowseMode();
        populateChapters();
        render();
    });

    refs.chapter.addEventListener('change', () => {
        setBrowseMode();
        render();
    });

    refs.go.addEventListener('click', () => {
        setBrowseMode();
        render();
    });

    refs.referenceGo.addEventListener('click', () => {

        let groups;

        try {
            groups = parser.parseMulti(refs.reference.value);
        } catch (error) {
            setMessage(error.message);
            return;
        }

        setMessage('');
        setReferenceMode(groups);

        // Sync the Book/Chapter dropdowns to the first group, purely so
        // they show something sensible if the user goes back to browsing.
        // While in reference mode they are NOT the source of truth for
        // what's rendered — render() reads viewState.groups directly, so
        // a multi-group query like "Mark 14:2,6-9;Matthew 26:26-31" can
        // display both books at once even though only one can occupy the
        // dropdowns.
        const first = groups[0];
        refs.book.value = first.bookId;
        populateChapters();
        refs.chapter.value = String(first.chapter);

        render();

    });

    refs.theme.addEventListener('change', () => {
        setTheme();
    });

    refs.layout.addEventListener('change', () => {
        render();
    });

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

  // Flattens a group's ranges (possibly discontiguous, e.g. "2,6-9") into
  // a sorted, de-duplicated list of verse numbers. A group with no ranges
  // (ranges === null, e.g. "1 Corinthians 13") means "the whole chapter".
  function versesForGroup(group, verseCount) {
    if (!group.ranges) {
      return Array.from({ length: verseCount }, (_, i) => i + 1);
    }
    const set = new Set();
    for (const { start, end } of group.ranges) {
      for (let v = start; v <= end; v++) set.add(v);
    }
    return [...set].sort((a, b) => a - b);
  }

  // Ported from YaQuB's local/app.js multiColumn(): one table, a column per
  // translation, side by side. Takes an explicit verse-number list (not a
  // start/end pair) so it can render discontiguous verses like "2,6-9"
  // just as easily as a full chapter.
  function multiColumn(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false } = {}) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Verse</th>';
    translations.forEach(t => { const th = document.createElement('th'); th.textContent = t.label; headRow.append(th); });
    head.append(headRow);
    table.append(head);

    const body = document.createElement('tbody');

    verses.forEach((v, i) => {
      const tr = document.createElement('tr');
      const ref = document.createElement('td');
      ref.className = 'reference';
      ref.textContent = `${chapterNum}:${v}`;
      if (highlight) {
        tr.classList.add('highlighted-verse');
        if (anchorFirst && i === 0) tr.id = 'current-reference';
      }
      tr.append(ref);
      translations.forEach(t => {
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v));
        tr.append(td);
      });
      body.append(tr);
    });
    table.append(body);
    return table;
  }

  // Ported from YaQuB's local/app.js multiRow(): one table, each verse's
  // translations listed as consecutive rows underneath it. Better than
  // multi-column when many translations are selected at once.
  function multiRow(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false } = {}) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th>Verse</th><th>Translation</th><th>Text</th></tr>';
    table.append(head);

    const body = document.createElement('tbody');

    verses.forEach((v, i) => {
      translations.forEach((t, j) => {
        const tr = document.createElement('tr');
        if (highlight) {
          tr.classList.add('highlighted-verse');
          if (anchorFirst && i === 0 && j === 0) tr.id = 'current-reference';
        }
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
    });
    table.append(body);
    return table;
  }

  // Builds one heading + table block and appends it to #results. Shared by
  // both browse mode (a single block, the whole chapter, unhighlighted) and
  // reference mode (one block per group, restricted verses, highlighted).
  function appendResultBlock({ bookId, chapterNum, name, verseCount, verses, translations, layout, highlight, anchorFirst }) {
    const head = document.createElement('div');
    head.className = 'result-head';
    const verseLabel = verses.length === verseCount
      ? `${verseCount} verses`
      : `${verses.length} of ${verseCount} verses`;
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseLabel}, ${layout === 'multicolumn' ? 'multi-column' : 'multi-row'})</small></h2>`;
    refs.results.appendChild(head);

    const table = layout === 'multicolumn'
      ? multiColumn(bookId, chapterNum, verses, translations, { highlight, anchorFirst })
      : multiRow(bookId, chapterNum, verses, translations, { highlight, anchorFirst });
    refs.results.appendChild(table);
  }

  function renderBrowseChapter(translations, layout) {
    const book = currentBook();
    if (!book) return;
    const chapterNum = Number(refs.chapter.value);
    const verseCount = book.chapters[chapterNum - 1];
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;

    if (book.provisional) {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = `${name}'s chapter/verse structure is provisional in canon.js and has not been verified against the real WEB Catholic Edition text yet — numbers shown below may change.`;
      refs.results.appendChild(notice);
    }

    appendResultBlock({
      bookId: book.id,
      chapterNum,
      name,
      verseCount,
      verses: Array.from({ length: verseCount }, (_, i) => i + 1),
      translations,
      layout,
      highlight: false,
      anchorFirst: false,
    });
  }

  // One block per group, in query order, so "Mark 14:2,6-9;Matthew 26:26-31"
  // renders as two separate headed tables — this is what lets different
  // books/chapters appear in a single result set without a second
  // rendering pipeline; it's the same appendResultBlock() browse mode uses.
  function renderReferenceGroups(groups, translations, layout) {
    groups.forEach((group, index) => {
      const book = canon.books.find(b => b.id === group.bookId);
      const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;
      const verseCount = book.chapters[group.chapter - 1];
      const verses = versesForGroup(group, verseCount);

      appendResultBlock({
        bookId: book.id,
        chapterNum: group.chapter,
        name,
        verseCount,
        verses,
        translations,
        layout,
        highlight: true,
        anchorFirst: index === 0,
      });
    });
  }

  function render() {
    const translations = selectedTranslations();

    refs.results.innerHTML = '';

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

    if (viewState.mode === 'reference') {
      renderReferenceGroups(viewState.groups, translations, layout);
    } else {
      renderBrowseChapter(translations, layout);
    }

    const target = document.getElementById('current-reference');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setMessage(message) { refs.message.textContent = message; }
})();
