class ReferenceParser {

    // Normalizes a book name/alias for lookup: lowercases; turns a leading
    // Roman numeral prefix (I/II/III) into 1/2/3 and drops a leading ordinal
    // suffix (1st/2nd/3rd/4th); removes periods, apostrophes, hyphens and all
    // whitespace. This is what lets "I Cor.", "1Cor", "1 cor" and "1st
    // Corinthians" all resolve to the same book without a separate alias.
    static normalizeKey(value) {
        return String(value)
            .toLowerCase()
            .replace(/^(\d+)(?:st|nd|rd|th)\b/, '$1')
            .replace(/^(i{1,3})(?=\s|\b)/, (m) => String(m.length))
            .replace(/[.'’\u2019-]/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    constructor(canon, locale) {

        this.canon = canon;
        this.bookMap = new Map();

        for (const book of canon.books) {

            const info = locale.books[book.id];

            if (!info)
                continue;

            this.bookMap.set(
                ReferenceParser.normalizeKey(info.name),
                book
            );

            if (info.aliases) {

                for (const alias of info.aliases) {

                    this.bookMap.set(
                        ReferenceParser.normalizeKey(alias),
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
    //   "Psalm 23:1-"                       (open-ended) or "Psalm 119:1-8,11"
    //   "I Cor. 13" / "1Cor 13" / "Jude"    (aliases, Roman numerals, whole book)
    //
    // Returns an array of group objects:
    //   { bookId, chapter, ranges }
    // where ranges is either null (render the whole chapter) or an array
    // of { start, end } verse ranges (a bare verse like "6" becomes
    // { start: 6, end: 6 }; "20-" becomes { start: 20, end: <last verse> }).
    //
    // Throws an Error with a human-readable message listing every malformed or
    // out-of-range group in the query (not just the first) — the caller shows
    // error.message to the user.
    parseMulti(input) {

        const groups = [];
        const errors = [];
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

            try {

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

                    if (fullMatch) {

                        const [, bookText, chapterMatch, verseSpecMatch] = fullMatch;
                        const book = this.bookMap.get(ReferenceParser.normalizeKey(bookText));

                        if (!book)
                            throw new Error(`Unknown book "${bookText.trim()}".`);

                        bookId = book.id;
                        chapterText = chapterMatch;
                        verseSpec = verseSpecMatch;

                    } else {

                        // No chapter given: treat it as a whole-book reference
                        // and show the first chapter, the way "Jude" or
                        // "Genesis" behaves elsewhere.
                        const book = this.bookMap.get(ReferenceParser.normalizeKey(part));

                        if (!book)
                            throw new Error(`"${part}" is not a valid reference.`);

                        groups.push({ bookId: book.id, chapter: 1, ranges: null });
                        lastBookId = book.id;
                        continue;

                    }

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
                        .map(item => item.replace(/\s+/g, ''))
                        .filter(Boolean)
                        .map(item => {

                            // "6", "6-9", or open-ended "6-" (through the end)
                            const rangeMatch = item.match(/^(\d+)(?:-(\d*))?$/);

                            if (!rangeMatch)
                                throw new Error(`"${item}" in "${part}" is not a valid verse or verse range.`);

                            const start = Number(rangeMatch[1]);
                            const end = rangeMatch[2] === undefined ? start
                                : rangeMatch[2] === '' ? verseCount
                                : Number(rangeMatch[2]);

                            if (start < 1 || start > verseCount)
                                throw new Error(`"${item}" in "${part}" is outside this chapter's ${verseCount} verses.`);

                            if (end < start)
                                throw new Error(`"${item}" in "${part}" has a reversed range — end comes before start.`);

                            if (end > verseCount)
                                throw new Error(`"${item}" in "${part}" is outside this chapter's ${verseCount} verses.`);

                            return { start, end };

                        });

                }

                groups.push({ bookId, chapter, ranges });
                lastBookId = bookId;

            } catch (error) {

                errors.push(error.message);

            }

        }

        if (errors.length)
            throw new Error(errors.join(' '));

        return groups;

    }

}

(() => {
  'use strict';
  const CONTEXT_RADIUS = 3;

  // UI locales: display names for the 73 books, used by the Book dropdown,
  // the result headings, and the reference parser. Book IDs and canon order
  // live in canon.js and never change with the locale, and translation text
  // is unaffected. Adding a locale means adding its data/locales/<id>.js
  // global to this list plus a matching <script> tag in index.html.
  const LOCALES = [
    { id: 'en', label: 'English', global: 'MARANATHA_LOCALE_EN' },
    { id: 'hy', label: 'Հայերէն', global: 'MARANATHA_LOCALE_HY' },
  ];

  let locale = window.MARANATHA_LOCALE_EN;
  let parser = new ReferenceParser(MARANATHA_CANON, locale);


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
    { id: 'armwestern', label: 'Western Armenian NT (1853)', src: 'data/armwestern.js' },
    { id: 'byz', label: 'Byzantine Majority Text (Greek NT)', src: 'data/byz.js' },
    { id: 'he', label: 'Hebrew (OSHB)', src: 'data/he.js' },
  ];

  const canon = window.MARANATHA_CANON;
const refs = {
    reference: q('#reference'),
    referenceGo: q('#reference-go'),
    book: q('#book'),
    chapter: q('#chapter'),
    theme: q('#theme'),
    reading: q('#reading'),
    appearance: q('#appearance'),
    language: q('#language'),
    layout: q('#layout'),
    go: q('#go-button'),
    results: q('#results'),
    message: q('#message'),
    translations: q('#translations'),
    contextBtn: q('#context-toggle'),
    search: q('#search'),
    searchGo: q('#search-go'),
    searchTranslation: q('#search-translation'),
    prevChapter: q('#prev-chapter-button'),
    nextChapter: q('#next-chapter-button'),
    fontsize: q('#fontsize'),
};
  const loaded = new Set();   // translation ids whose <script> has finished loading
  const loading = new Set();  // translation ids whose <script> is in flight
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const narrowScreen = window.matchMedia('(max-width: 700px)');

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
  let contextEnabled = false;

  // Per-block context overrides.  Each key is "${bookId}-${chapterNum}".
  // When a block has an entry here, its value overrides the global
  // contextEnabled for that block alone.  The global toggle clears this
  // map so that every block returns to following the global flag.
  const blockContextOverrides = new Map();

  const viewState = {
    mode: 'browse',       // 'browse' | 'reference' | 'search'
    groups: null,         // populated only when mode === 'reference'
    highlightVerse: null, // {bookId, chapter, verse} to highlight in browse mode
    search: null,         // populated only when mode === 'search'
  };

  function setBrowseMode(highlightVerse = null) {
    viewState.mode = 'browse';
    viewState.groups = null;
    viewState.highlightVerse = highlightVerse;
    viewState.search = null;
    contextEnabled = false;
    blockContextOverrides.clear();
    refs.contextBtn.style.display = 'none';
  }

  function setReferenceMode(groups) {
    viewState.mode = 'reference';
    viewState.groups = groups;
    viewState.highlightVerse = null;
    viewState.search = null;
    refs.contextBtn.style.display = '';
  }

  init();

  function q(selector) { return document.querySelector(selector); }
function init() {
    if (!canon || !locale) {
        setMessage('Could not load data/canon.js or data/locales/en.js. Open this page via the launcher or a local server, not as a bare file:// double-click in some browsers.');
        return;
    }

    populateLanguages();
    const startLocale = restoreLocale();
    locale = localeById(startLocale);
    parser = new ReferenceParser(canon, locale);
    refs.language.value = startLocale;

    populateBooks();
    populateTranslationCheckboxes();

    refs.language.addEventListener('change', () => {
        setLocale(refs.language.value);
    });

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

    refs.prevChapter.addEventListener('click', () => {
        goToAdjacentChapter(-1);
    });

    refs.nextChapter.addEventListener('click', () => {
        goToAdjacentChapter(1);
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

    refs.searchGo.addEventListener('click', () => {
        performSearch();
    });

    refs.search.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    refs.theme.addEventListener('change', () => {
        setTheme();
    });

    refs.reading.addEventListener('change', () => {
        setReading();
    });

    refs.appearance.addEventListener('change', () => {
        setAppearance();
    });

    refs.fontsize.addEventListener('change', () => {
        setFontSize();
    });

    refs.layout.addEventListener('change', () => {
        render();
    });

    refs.contextBtn.addEventListener('click', () => {
        contextEnabled = !contextEnabled;
        blockContextOverrides.clear();
        render();
    });

    prefersDark.addEventListener('change', () => {
        applyAppearance();
    });

    // Automatic layout also depends on viewport width (see render()), so
    // re-render when the screen crosses that breakpoint — phone rotation, or
    // resizing a desktop window. Only relevant in Automatic mode.
    narrowScreen.addEventListener('change', () => {
        if (refs.layout.value === 'auto') render();
    });

    populateChapters();
    restoreAppearance();
    setAppearance();
    setTheme();
    setReading();
    setFontSize();
    render();
}

  function setTheme() { document.documentElement.dataset.theme = refs.theme.value; }

  function setReading() { document.documentElement.dataset.reading = refs.reading.value; }

  function setFontSize() { document.documentElement.dataset.fontsize = refs.fontsize.value; }

  function getStoredAppearance() {
      try {
          return localStorage.getItem('maranatha-appearance');
      } catch (error) {
          return null;
      }
  }

  function restoreAppearance() {
      const stored = getStoredAppearance();
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
          refs.appearance.value = stored;
      }
  }

  function applyAppearance() {
      const choice = refs.appearance.value;
      const dark = choice === 'dark' || (choice === 'system' && prefersDark.matches);
      document.documentElement.dataset.mode = dark ? 'dark' : 'light';
  }

  function setAppearance() {
      const choice = refs.appearance.value;
      try {
          localStorage.setItem('maranatha-appearance', choice);
      } catch (error) {
          // Storage unavailable (e.g. strict file:// contexts) — appearance still applies for this session.
      }
      applyAppearance();
  }

  function localeById(id) {
    const entry = LOCALES.find((l) => l.id === id);
    return (entry && window[entry.global]) || window.MARANATHA_LOCALE_EN;
  }

  function populateLanguages() {
    refs.language.innerHTML = '';
    LOCALES.forEach((l) => {
      if (!window[l.global]) return;
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.label;
      refs.language.appendChild(opt);
    });
  }

  function getStoredLocale() {
    try { return localStorage.getItem('maranatha-locale'); } catch (error) { return null; }
  }

  function restoreLocale() {
    const stored = getStoredLocale();
    return LOCALES.some((l) => l.id === stored) ? stored : 'en';
  }

  // Switches the UI locale: rebuilds the reference parser (so book names are
  // recognised in the new language), repopulates the Book dropdown, and
  // re-renders headings. Canon structure and translation text are untouched.
  function setLocale(id) {
    const entry = LOCALES.find((l) => l.id === id);
    if (!entry || !window[entry.global]) return;
    locale = window[entry.global];
    parser = new ReferenceParser(canon, locale);
    refs.language.value = entry.id;
    try { localStorage.setItem('maranatha-locale', entry.id); } catch (error) {}
    populateBooks();
    render();
  }

  function populateBooks() {
    refs.book.innerHTML = '';
    let currentTestament = null;
    for (const book of canon.books) {
      if (book.testament !== currentTestament) {
        currentTestament = book.testament;
        const group = document.createElement('optgroup');
        const testamentName = locale.testaments && locale.testaments[currentTestament];
        group.label = testamentName || (currentTestament === 'OT' ? 'Old Testament' : 'New Testament');
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

  // Moves to the next/previous chapter, crossing into the next/previous
  // book at chapter boundaries. direction is +1 (next) or -1 (previous).
  // Wraps around at the very start and end of the canon: Previous from
  // Genesis 1 goes to the last chapter of the last book (Revelation 22),
  // and Next from Revelation 22 goes to Genesis 1.
  function goToAdjacentChapter(direction) {
    const book = currentBook();
    if (!book) return;
    const currentChapter = Number(refs.chapter.value);
    const targetChapter = currentChapter + direction;

    if (targetChapter >= 1 && targetChapter <= book.chapters.length) {
      setBrowseMode();
      refs.chapter.value = String(targetChapter);
      render();
      scrollToTop();
      return;
    }

    const bookIndex = canon.books.findIndex(b => b.id === book.id);
    const targetBookIndex = (bookIndex + direction + canon.books.length) % canon.books.length;
    const targetBook = canon.books[targetBookIndex];

    setBrowseMode();
    refs.book.value = targetBook.id;
    populateChapters();
    refs.chapter.value = direction > 0 ? '1' : String(targetBook.chapters.length);
    render();
    scrollToTop();
  }

  // Called after prev/next chapter navigation (top and bottom buttons
  // alike, since both funnel through goToAdjacentChapter). Without this,
  // clicking "Next chapter" from the bottom button on a long chapter left
  // you scrolled deep into the page, staring at the tail end of the new
  // chapter's text with no controls in view — awkward on any screen, and
  // especially disorienting on iPad/mobile where you can't just glance up
  // at a toolbar sitting in a fixed sidebar.
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  function fillCell(td, cell, tId) {
    if (cell.state === 'text') {
      td.textContent = cell.text;
      if (tId === 'he') {
        td.dir = 'rtl';
        td.lang = 'he';
        td.classList.add('hebrew-verse');
      } else if (tId === 'byz') {
        td.lang = 'el';
        td.classList.add('greek-verse');
      }
    } else {
      td.className = 'verse-placeholder';
      td.textContent = cell.state === 'loading' ? '(loading…)'
        : cell.state === 'missing-book' ? '(not available in this translation)'
        : '(not available)';
    }
  }

  // Expands a list of exact-match verse numbers outward by CONTEXT_RADIUS
  // verses on each side, clamped to [1, verseCount]. Returns the expanded
  // array and a Set of exact verses so the renderer can distinguish matched
  // verses from context verses. This is purely a presentation-layer concern.
  function expandWithContext(exactVerses, verseCount) {
    const min = Math.min(...exactVerses);
    const max = Math.max(...exactVerses);
    const start = Math.max(1, min - CONTEXT_RADIUS);
    const end = Math.min(verseCount, max + CONTEXT_RADIUS);
    const allVerses = [];
    for (let v = start; v <= end; v++) allVerses.push(v);
    return { verses: allVerses, exact: new Set(exactVerses) };
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

  // Returns the effective context-enabled state for a single result block.
  // If the block has its own per-block override that wins; otherwise the
  // global contextEnabled flag is used.
  function blockContext(blockKey) {
    return blockContextOverrides.has(blockKey)
      ? blockContextOverrides.get(blockKey)
      : contextEnabled;
  }

  // Ported from YaQuB's local/app.js multiColumn(): one table, a column per
  // translation, side by side. Takes an explicit verse-number list (not a
  // start/end pair) so it can render discontiguous verses like "2,6-9"
  // just as easily as a full chapter.
  function multiColumn(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false, exactVerses = null } = {}) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th class="reference">Verse</th>';
    translations.forEach(t => { const th = document.createElement('th'); th.textContent = t.label; headRow.append(th); });
    head.append(headRow);
    table.append(head);

    const body = document.createElement('tbody');

    let anchorPlaced = false;
    const firstExact = anchorFirst && exactVerses ? verses.find(v => exactVerses.has(v)) : null;

    verses.forEach((v, i) => {
      const tr = document.createElement('tr');
      const ref = document.createElement('td');
      ref.className = 'reference';
      ref.textContent = `${chapterNum}:${v}`;
      if (highlight) {
        if (exactVerses && exactVerses.has(v)) {
          tr.classList.add('highlighted-verse');
          if (anchorFirst && !anchorPlaced && v === firstExact) {
            tr.id = 'current-reference';
            anchorPlaced = true;
          }
        } else {
          tr.classList.add('context-verse');
        }
      }
      tr.append(ref);
      translations.forEach(t => {
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v), t.id);
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
  function multiRow(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false, exactVerses = null } = {}) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th class="reference">Verse</th><th class="translation-label">Translation</th><th>Text</th></tr>';
    table.append(head);

    const body = document.createElement('tbody');

    let anchorPlaced = false;
    const firstExact = anchorFirst && exactVerses ? verses.find(v => exactVerses.has(v)) : null;

    verses.forEach((v, i) => {
      translations.forEach((t, j) => {
        const tr = document.createElement('tr');
        if (highlight) {
          if (exactVerses && exactVerses.has(v)) {
            tr.classList.add('highlighted-verse');
          } else {
            tr.classList.add('context-verse');
          }
        }
        if (anchorFirst && !anchorPlaced && v === firstExact && j === 0) {
          tr.id = 'current-reference';
          anchorPlaced = true;
        }
        const ref = document.createElement('td');
        ref.className = 'reference';
        ref.textContent = `${chapterNum}:${v}`;
        const label = document.createElement('td');
        label.className = 'translation-label';
        label.textContent = t.label;
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v), t.id);
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
  // When exactVerses is provided (reference mode) an individual per-block
  // context-toggle button is added beside the heading.
  function appendResultBlock({ bookId, chapterNum, name, verseCount, verses, translations, layout, highlight, anchorFirst, exactVerses = null, showContext = false, showContextToggle = false }) {
    const head = document.createElement('div');
    head.className = 'result-head';
    let verseLabel;
    if (showContext && exactVerses) {
      const exactCount = exactVerses.size;
      const shownCount = verses.length;
      verseLabel = shownCount === verseCount
        ? `\u00b1${CONTEXT_RADIUS} \u00b7 ${shownCount} verses (full chapter)`
        : `\u00b1${CONTEXT_RADIUS} \u00b7 ${shownCount} of ${verseCount} verses`;
    } else {
      verseLabel = verses.length === verseCount
        ? `${verseCount} verses`
        : `${verses.length} of ${verseCount} verses`;
    }
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseLabel}, ${layout === 'multicolumn' ? 'multi-column' : 'multi-row'})</small></h2>`;
    refs.results.appendChild(head);

    // Per-block context toggle — reference mode only (not browse-highlight)
    if (showContextToggle) {
      const blockKey = `${bookId}-${chapterNum}`;
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'context-toggle-btn';
      toggleBtn.textContent = showContext ? 'Hide context' : `Show context (\u00b1${CONTEXT_RADIUS})`;
      toggleBtn.addEventListener('click', () => {
        const current = blockContext(blockKey);
        blockContextOverrides.set(blockKey, !current);
        render();
      });
      head.appendChild(toggleBtn);
    }

    const table = layout === 'multicolumn'
      ? multiColumn(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses })
      : multiRow(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses });
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

    const hv = viewState.highlightVerse;
    const highlightSet = (hv && hv.bookId === book.id && hv.chapter === chapterNum)
      ? new Set([hv.verse])
      : null;

    appendResultBlock({
      bookId: book.id,
      chapterNum,
      name,
      verseCount,
      verses: Array.from({ length: verseCount }, (_, i) => i + 1),
      translations,
      layout,
      highlight: !!highlightSet,
      anchorFirst: !!highlightSet,
      exactVerses: highlightSet,
    });

    const bottomNav = document.createElement('div');
    bottomNav.className = 'chapter-nav-bottom';

    const bottomPrev = document.createElement('button');
    bottomPrev.type = 'button';
    bottomPrev.id = 'prev-chapter-button-bottom';
    bottomPrev.textContent = '\u2190 Previous chapter';
    bottomPrev.addEventListener('click', () => goToAdjacentChapter(-1));

    const bottomNext = document.createElement('button');
    bottomNext.type = 'button';
    bottomNext.id = 'next-chapter-button-bottom';
    bottomNext.textContent = 'Next chapter \u2192';
    bottomNext.addEventListener('click', () => goToAdjacentChapter(1));

    bottomNav.append(bottomPrev, bottomNext);
    refs.results.appendChild(bottomNav);
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
      const exactVerses = versesForGroup(group, verseCount);

      const exactSet = new Set(exactVerses);
      const blockKey = `${book.id}-${group.chapter}`;
      const effectiveContext = blockContext(blockKey);

      let displayVerses = exactVerses;
      if (effectiveContext) {
        const expanded = expandWithContext(exactVerses, verseCount);
        displayVerses = expanded.verses;
      }

      appendResultBlock({
        bookId: book.id,
        chapterNum: group.chapter,
        name,
        verseCount,
        verses: displayVerses,
        translations,
        layout,
        highlight: true,
        anchorFirst: index === 0,
        exactVerses: exactSet,
        showContext: effectiveContext,
        showContextToggle: true,
      });
    });
  }

  // ---------------------------------------------------------------------
  // Text search
  //
  // One translation at a time, phrase substring, case- and diacritic-
  // insensitive: Hebrew niqqud/te'amim and Greek/Latin combining marks are
  // ignored on both sides. No index file — a full linear scan of a
  // translation is a few tens of milliseconds, so results are computed
  // fresh on each search and nothing extra is stored.
  // ---------------------------------------------------------------------

  function normalizeSearchText(text) {
    let out = '';
    for (const ch of text) {
      out += ch.normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g, '').toLowerCase();
    }
    return out;
  }

  // Normalized form plus a map from each normalized character back to its
  // index in the original text, so a match can be highlighted in the original
  // (diacritics intact).
  function buildSearchForm(text) {
    let form = '';
    const map = [];
    for (let i = 0; i < text.length; i++) {
      const kept = text[i].normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g, '').toLowerCase();
      for (let k = 0; k < kept.length; k++) {
        form += kept[k];
        map.push(i);
      }
    }
    return { form, map };
  }

  function searchVerses(data, query) {
    const needle = normalizeSearchText(query);
    const matches = [];
    if (!needle) return { matches, total: 0 };

    for (const book of canon.books) {
      const chapters = data.books[book.id];
      if (!chapters) continue;
      for (let ci = 0; ci < chapters.length; ci++) {
        const chapter = chapters[ci];
        if (!Array.isArray(chapter)) continue;
        for (let vi = 0; vi < chapter.length; vi++) {
          const text = chapter[vi];
          if (text && normalizeSearchText(text).includes(needle)) {
            matches.push({ bookId: book.id, chapter: ci + 1, verse: vi + 1, text });
          }
        }
      }
    }
    return { matches, total: matches.length };
  }

  // Appends `text` to `container`, wrapping each occurrence of `query` in
  // <mark>. Uses text nodes only (never innerHTML), so user input is safe.
  function appendHighlighted(container, text, query) {
    const needle = normalizeSearchText(query);
    const { form, map } = buildSearchForm(text);
    let from = 0;
    let lastEnd = 0;
    let found = false;
    while (needle) {
      const idx = form.indexOf(needle, from);
      if (idx === -1) break;
      const start = map[idx];
      const end = map[idx + needle.length - 1] + 1;
      if (!(start < end)) { from = idx + needle.length; continue; }
      container.appendChild(document.createTextNode(text.slice(lastEnd, start)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(start, end);
      container.appendChild(mark);
      lastEnd = end;
      found = true;
      from = idx + needle.length;
    }
    if (!found) {
      container.textContent = text;
      return;
    }
    container.appendChild(document.createTextNode(text.slice(lastEnd)));
  }

  const SEARCH_RESULT_CAP = 300;

  function performSearch() {
    const query = refs.search.value.trim();
    if (!query) {
      setMessage('Enter a word or phrase to search for.');
      return;
    }
    const t = TRANSLATIONS.find(x => x.id === refs.searchTranslation.value);
    const data = t && window.MARANATHA_TRANSLATIONS[t.id];
    if (!t || !data) {
      setMessage('Select a loaded translation to search.');
      return;
    }
    setMessage('');
    const { matches, total } = searchVerses(data, query);
    viewState.mode = 'search';
    viewState.groups = null;
    viewState.highlightVerse = null;
    viewState.search = { query, translationId: t.id, translationLabel: t.label, matches, total };
    refs.contextBtn.style.display = 'none';
    render();
  }

  function renderSearchResults() {
    const s = viewState.search;
    if (!s) return;

    const head = document.createElement('div');
    head.className = 'result-head';
    const h2 = document.createElement('h2');
    h2.append('Search: \u201c');
    h2.append(s.query);
    h2.append('\u201d ');
    const small = document.createElement('small');
    small.textContent = `(${s.total} ${s.total === 1 ? 'match' : 'matches'} in ${s.translationLabel})`;
    h2.appendChild(small);
    head.appendChild(h2);
    refs.results.appendChild(head);

    if (!s.total) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No matches.';
      refs.results.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'search-results';
    for (const m of s.matches.slice(0, SEARCH_RESULT_CAP)) {
      const hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'search-hit';

      const ref = document.createElement('span');
      ref.className = 'search-ref';
      const bookName = (locale.books[m.bookId] && locale.books[m.bookId].name) || m.bookId;
      ref.textContent = `${bookName} ${m.chapter}:${m.verse}`;

      const body = document.createElement('span');
      body.className = 'search-text';
      appendHighlighted(body, m.text, s.query);

      hit.append(ref, body);
      hit.addEventListener('click', () => jumpToVerse(m.bookId, m.chapter, m.verse));
      list.appendChild(hit);
    }
    refs.results.appendChild(list);

    if (s.total > SEARCH_RESULT_CAP) {
      const more = document.createElement('p');
      more.className = 'search-more';
      more.textContent = `Showing the first ${SEARCH_RESULT_CAP} of ${s.total} matches.`;
      refs.results.appendChild(more);
    }
  }

  // Jumps from a search hit to the chapter in browse mode, with that verse
  // highlighted (render() scrolls it into view via #current-reference).
  function jumpToVerse(bookId, chapter, verse) {
    setBrowseMode({ bookId, chapter, verse });
    refs.book.value = bookId;
    populateChapters();
    refs.chapter.value = String(chapter);
    render();
  }

  // "Search in" options are the checked translations that have actually
  // finished loading (search needs their data in memory). The current
  // selection is preserved when it is still available.
  function populateSearchTranslations() {
    const previous = refs.searchTranslation.value;
    refs.searchTranslation.innerHTML = '';
    const available = selectedTranslations()
      .filter(t => loaded.has(t.id) && window.MARANATHA_TRANSLATIONS[t.id]);
    for (const t of available) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      refs.searchTranslation.appendChild(opt);
    }
    if (available.some(t => t.id === previous)) {
      refs.searchTranslation.value = previous;
    }
  }

  function render() {
    const translations = selectedTranslations();

    refs.results.innerHTML = '';

    if (!translations.length) {
      setMessage('Select at least one translation to display.');
      return;
    }
    setMessage('');
    populateSearchTranslations();

    // Automatic layout: multi-row once more than 5 translations are selected
    // (multi-column gets too wide to read past that — same rule as YaQuB),
    // and also on narrow screens, where side-by-side columns would each be
    // too cramped and long words could collide across columns. Manual layout
    // choices (the Layout dropdown) are always respected.
    const layout = refs.layout.value === 'auto'
      ? ((translations.length > 5 || narrowScreen.matches) ? 'multirow' : 'multicolumn')
      : refs.layout.value;

    if (viewState.mode === 'reference') {
      renderReferenceGroups(viewState.groups, translations, layout);
    } else if (viewState.mode === 'search') {
      renderSearchResults();
    } else {
      renderBrowseChapter(translations, layout);
    }

    // Update the context button label to reflect current state
    refs.contextBtn.textContent = contextEnabled ? 'Hide context' : `Show context (\u00b1${CONTEXT_RADIUS})`;

    const target = document.getElementById('current-reference');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setMessage(message) { refs.message.textContent = message; }
})();
