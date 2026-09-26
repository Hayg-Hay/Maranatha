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
  // exists) means adding one line here — no other change needed. `short` is the
  // compact, still-distinguishing label used in compact UI (the search-in
  // select); it keeps the version/register qualifier so a future LXX, Grabar or
  // Eastern Armenian entry does not collide.
  const TRANSLATIONS = [
    { id: 'web', label: 'World English Bible', short: 'WEB', src: 'data/web.js' },
    { id: 'kjv', label: 'King James Version', short: 'KJV', src: 'data/kjv.js' },
    { id: 'armwestern', label: 'Western Armenian NT (1853)', short: 'Western Armenian', src: 'data/armwestern.js', note: 'This translation is available for research, but it is not selected by default while its verse boundaries are being checked. Read the project history for details.' },
    { id: 'byz', label: 'Byzantine Majority Text (Greek NT)', short: 'Byzantine Greek', src: 'data/byz.js' },
    { id: 'he', label: 'Hebrew (OSHB)', short: 'Hebrew (OSHB)', src: 'data/he.js' },
    { id: 'luther1912', label: 'Luther Bible 1912', short: 'Luther 1912', src: 'data/luther1912.js' },
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
    interlinear: q('#interlinear'),
    interlinearHe: q('#interlinear-he'),
    interlinearGreekMode: q('#interlinear-greek-mode'),
    interlinearHeMode: q('#interlinear-he-mode'),
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

  // Interlinear views: reading overrides (not viewState modes) driven by the
  // "Interlinear (Greek)" / "Interlinear (Hebrew)" checkboxes. Each one's data
  // is large, so it is lazily loaded on first use. Both may be enabled at the
  // same time — render() picks whichever matches the current book's testament
  // (Greek for the NT, Hebrew for the OT). All three interlinear and the two
  // Strong's dictionaries are loaded through dynamically created <script>
  // tags, never fetch(), so they work under file:// and are runtime-cached by
  // the service worker.
  const INTERLINEARS = {
    greek: {
      key: 'greek',
      loadingLabel: 'Greek',
      dataGlobal: 'MARANATHA_INTERLINEAR_BYZ',
      glossGlobal: 'MARANATHA_STRONGS_GREEK',
      dataSources: ['data/byz-interlinear.js', 'data/strongs-greek.js'],
      strongsPrefix: 'G',
      testament: 'NT',
      label: '(Greek interlinear)',
      unavailable: 'Interlinear data is available for the Greek New Testament only.',
      sourceNote: 'Greek text: Robinson-Pierpont Byzantine (Unlicense) \u00b7 glosses: Strong\'s, Open Scriptures (CC-BY-SA).',
      surfaceClass: 'iw-greek',
      rtl: false,
      lang: 'el',
      transliterate: transliterateGreek,
      disclosure: true,
      toggleRef: 'interlinear',
      modeRef: 'interlinearGreekMode',
    },
    hebrew: {
      key: 'hebrew',
      loadingLabel: 'Hebrew',
      dataGlobal: 'MARANATHA_INTERLINEAR_HE',
      glossGlobal: 'MARANATHA_STRONGS_HEBREW',
      dataSources: ['data/he-interlinear.js', 'data/strongs-hebrew.js'],
      strongsPrefix: 'H',
      testament: 'OT',
      label: '(Hebrew interlinear)',
      unavailable: 'Interlinear data is available for the Old Testament (Hebrew) only.',
      sourceNote: 'Hebrew text: Open Scriptures Hebrew Bible (CC BY 4.0) \u00b7 glosses: Strong\'s, Open Scriptures (CC-BY-SA).',
      surfaceClass: 'iw-hebrew',
      rtl: true,
      lang: 'he',
      transliterate: transliterateHebrew,
      disclosure: true,
      toggleRef: 'interlinearHe',
      modeRef: 'interlinearHeMode',
    },
  };
  const interlinearState = {
    greek: { enabled: false, status: 'idle', mode: 'read' },  // mode: 'read' | 'study'
    hebrew: { enabled: false, status: 'idle', mode: 'read' },  // mode: 'read' | 'study'
  };

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
    refs.contextBtn.hidden = true;
  }

  function setReferenceMode(groups) {
    viewState.mode = 'reference';
    viewState.groups = groups;
    viewState.highlightVerse = null;
    viewState.search = null;
    // A single result block already has its own context control beside its
    // heading. The global control is useful only for multi-reference queries.
    refs.contextBtn.hidden = groups.length < 2;
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

    refs.reference.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            refs.referenceGo.click();
        }
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
        render({ scrollToReference: false });
    });

    refs.interlinear.addEventListener('change', () => {
        syncInterlinearModeVisibility(INTERLINEARS.greek);
        onInterlinearToggle(INTERLINEARS.greek, refs.interlinear.checked);
    });

    refs.interlinearGreekMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.greek, refs.interlinearGreekMode.value);
    });

    refs.interlinearHe.addEventListener('change', () => {
        syncInterlinearModeVisibility(INTERLINEARS.hebrew);
        onInterlinearToggle(INTERLINEARS.hebrew, refs.interlinearHe.checked);
    });

    refs.interlinearHeMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.hebrew, refs.interlinearHeMode.value);
    });

    refs.contextBtn.addEventListener('click', () => {
        contextEnabled = !contextEnabled;
        blockContextOverrides.clear();
        render();
    });

    prefersDark.addEventListener('change', () => {
        applyAppearance();
    });

    // Every layout uses the phone reading view below this breakpoint, so a
    // rotation or desktop resize must re-render regardless of the selector's
    // current value. Keep the reader's position during that visual refresh.
    narrowScreen.addEventListener('change', () => {
        render({ scrollToReference: false });
    });

    populateChapters();
    restoreAppearance();
    setAppearance();
    setTheme();
    setReading();
    setFontSize();
    restoreInterlinearMode(INTERLINEARS.greek);
    restoreInterlinearMode(INTERLINEARS.hebrew);
    syncInterlinearModeVisibility(INTERLINEARS.greek);
    syncInterlinearModeVisibility(INTERLINEARS.hebrew);
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

  // Interlinear display mode, shared by Greek and Hebrew: 'read' uses
  // progressive-disclosure cards, 'study' uses the original dense lexicon
  // cards. Preference is persisted like the other settings and defaults to
  // 'read'. A newly added interlinear opts in by setting `disclosure` and the
  // toggle/mode element refs on its config.
  function getStoredInterlinearMode(key) {
      try {
          return localStorage.getItem(`maranatha-interlinear-${key}-mode`) === 'study' ? 'study' : 'read';
      } catch (error) {
          return 'read';
      }
  }

  function restoreInterlinearMode(config) {
      const mode = getStoredInterlinearMode(config.key);
      interlinearState[config.key].mode = mode;
      refs[config.modeRef].value = mode;
  }

  function syncInterlinearModeVisibility(config) {
      refs[config.modeRef].hidden = !refs[config.toggleRef].checked;
  }

  function setInterlinearMode(config, mode) {
      const value = mode === 'study' ? 'study' : 'read';
      interlinearState[config.key].mode = value;
      refs[config.modeRef].value = value;
      try {
          localStorage.setItem(`maranatha-interlinear-${config.key}-mode`, value);
      } catch (error) {
          // Storage unavailable — the choice still applies for this session.
      }
      if (interlinearState[config.key].enabled) render();
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
    refs.translations.innerHTML = '';
    TRANSLATIONS.forEach((t, i) => {
      const option = document.createElement('div');
      option.className = 'translation-option';
      const label = document.createElement('label');
      label.className = 'version';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.value = t.id;
      // First translation on by default. Audit-flagged translations are never
      // auto-checked, regardless of where they sit in the registry.
      box.checked = i === 0 && !t.note;
      box.addEventListener('change', () => {
        const refreshInPlace = () => render({ scrollToReference: false });
        if (box.checked) loadTranslation(t, refreshInPlace);
        else refreshInPlace();
      });
      label.append(box, ' ', t.label);
      option.append(label);
      if (t.note) {
        const disclosure = document.createElement('details');
        disclosure.className = 'translation-warning';
        const summary = document.createElement('summary');
        summary.textContent = 'Under audit';
        const note = document.createElement('p');
        note.textContent = t.note;
        disclosure.append(summary, note);
        option.append(disclosure);
      }
      refs.translations.appendChild(option);
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
    if (loaded.has(t.id)) {
      onReady();
      return;
    }
    if (loading.has(t.id)) return;
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
    table.className = 'comparison-table comparison-table-columns';
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
    table.className = 'comparison-table comparison-table-rows';
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th class="reference">Verse</th><th class="translation-label">Translation</th><th>Text</th></tr>';
    table.append(head);

    const body = document.createElement('tbody');

    let anchorPlaced = false;
    const firstExact = anchorFirst && exactVerses ? verses.find(v => exactVerses.has(v)) : null;

    verses.forEach((v, i) => {
      translations.forEach((t, j) => {
        const tr = document.createElement('tr');
        tr.classList.add(j === 0 ? 'verse-group-start' : 'verse-group-continuation');
        if (j === translations.length - 1) tr.classList.add('verse-group-end');
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

  // Narrow-screen reading view. Tables remain useful for deliberate desktop
  // comparison, but on a phone they spend too much width repeating column
  // labels. These stacked cards keep the verse number and text prominent;
  // translation labels appear only when there is something to compare.
  function mobileReading(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false, exactVerses = null } = {}) {
    const list = document.createElement('div');
    list.className = 'mobile-verses';

    let anchorPlaced = false;
    const firstExact = anchorFirst && exactVerses ? verses.find(v => exactVerses.has(v)) : null;

    verses.forEach((v) => {
      const article = document.createElement('article');
      article.className = 'mobile-verse';
      if (highlight) {
        article.classList.add(exactVerses && exactVerses.has(v) ? 'highlighted-verse' : 'context-verse');
      }
      if (anchorFirst && !anchorPlaced && v === firstExact) {
        article.id = 'current-reference';
        anchorPlaced = true;
      }

      const ref = document.createElement('div');
      ref.className = 'mobile-reference';
      ref.textContent = `${chapterNum}:${v}`;
      article.append(ref);

      translations.forEach((t) => {
        const row = document.createElement('div');
        row.className = 'mobile-translation';
        if (translations.length > 1) {
          const label = document.createElement('div');
          label.className = 'mobile-translation-label';
          label.textContent = t.label;
          row.append(label);
        }
        const text = document.createElement('div');
        text.className = 'mobile-verse-text';
        fillCell(text, cellFor(t, bookId, chapterNum, v), t.id);
        row.append(text);
        article.append(row);
      });
      list.append(article);
    });
    return list;
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
    const layoutLabel = layout === 'multicolumn' ? 'multi-column'
      : layout === 'multirow' ? 'multi-row'
      : 'reading view';
    head.innerHTML = `<h2>${name} ${chapterNum} <small>(${verseLabel}, ${layoutLabel})</small></h2>`;
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

    const content = layout === 'multicolumn'
      ? multiColumn(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses })
      : layout === 'multirow'
        ? multiRow(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses })
        : mobileReading(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses });
    refs.results.appendChild(content);
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
    refs.contextBtn.hidden = true;
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
      const hit = document.createElement('div');
      hit.className = 'search-hit';
      hit.tabIndex = 0;
      hit.setAttribute('role', 'button');

      const ref = document.createElement('span');
      ref.className = 'search-ref';
      const bookName = (locale.books[m.bookId] && locale.books[m.bookId].name) || m.bookId;
      ref.textContent = `${bookName} ${m.chapter}:${m.verse}`;

      const body = document.createElement('span');
      body.className = 'search-text';
      appendHighlighted(body, m.text, s.query);

      hit.append(ref, body);

      const openHit = () => jumpToVerse(m.bookId, m.chapter, m.verse);
      hit.addEventListener('click', openHit);
      hit.addEventListener('keydown', (event) => {
        if (event.target !== hit) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openHit();
        }
      });

      // Per-verse comparison: only when at least one other translation is
      // loaded. The toggle must not trigger the hit's own jump.
      const others = selectedTranslations().filter((t) =>
        t.id !== s.translationId && loaded.has(t.id) && window.MARANATHA_TRANSLATIONS[t.id]);
      if (others.length) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'compare-toggle';
        toggle.textContent = 'Compare translations';
        toggle.setAttribute('aria-expanded', 'false');
        let panel = null;
        toggle.addEventListener('click', (event) => {
          event.stopPropagation();
          if (!panel) {
            panel = buildComparePanel(m, s.query, s.translationId);
            panel.hidden = true;
            hit.appendChild(panel);
          }
          panel.hidden = !panel.hidden;
          toggle.setAttribute('aria-expanded', String(!panel.hidden));
          toggle.textContent = panel.hidden ? 'Compare translations' : 'Hide translations';
        });
        hit.appendChild(toggle);
      }

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

  // Builds the "other translations" panel for one search hit: the same verse
  // in every other loaded translation. The query is highlighted wherever it
  // actually appears (e.g. English "God" marks in WEB/KJV but not in Hebrew,
  // Greek or Armenian) and is simply left unhighlighted elsewhere.
  function buildComparePanel(match, query, excludeId) {
    const panel = document.createElement('div');
    panel.className = 'compare-panel';

    const others = selectedTranslations().filter((t) =>
      t.id !== excludeId && loaded.has(t.id) && window.MARANATHA_TRANSLATIONS[t.id]);

    for (const t of others) {
      const row = document.createElement('div');
      row.className = 'compare-row';

      const label = document.createElement('span');
      label.className = 'compare-label';
      label.textContent = t.label;

      const text = document.createElement('span');
      text.className = 'compare-text';
      const data = window.MARANATHA_TRANSLATIONS[t.id];
      const chapter = data.books[match.bookId] && data.books[match.bookId][match.chapter - 1];
      const verseText = chapter && chapter[match.verse - 1];

      if (verseText) {
        if (t.id === 'he') {
          text.dir = 'rtl';
          text.lang = 'he';
          text.classList.add('hebrew-verse');
        } else if (t.id === 'byz') {
          text.lang = 'el';
          text.classList.add('greek-verse');
        }
        appendHighlighted(text, verseText, query);
      } else {
        text.classList.add('verse-placeholder');
        text.textContent = '(not available in this translation)';
      }

      row.append(label, text);
      panel.appendChild(row);
    }
    return panel;
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
      opt.textContent = t.short || t.label;
      refs.searchTranslation.appendChild(opt);
    }
    if (available.some(t => t.id === previous)) {
      refs.searchTranslation.value = previous;
    }
  }

  // ---------------------------------------------------------------------
  // Greek interlinear
  //
  // Loads data/byz-interlinear.js (per-word surface + Strong's + morphology,
  // aligned to the accented Byzantine text) and data/strongs-greek.js
  // (numbered Strong's -> concise gloss). Both are only fetched when the
  // Interlinear checkbox is first ticked.
  // ---------------------------------------------------------------------

  // Toggle handler shared by the two interlinear checkboxes.
  function onInterlinearToggle(config, checked) {
    const state = interlinearState[config.key];
    state.enabled = checked;
    if (!checked) {
      render();
      return;
    }
    if (state.status === 'loaded') {
      render();
    } else if (state.status !== 'loading') {
      setMessage(`Loading ${config.loadingLabel} interlinear\u2026`);
      loadInterlinearData(config, () => {
        render();
      });
    }
  }

  function loadInterlinearData(config, onReady) {
    const state = interlinearState[config.key];
    state.status = 'loading';
    let remaining = config.dataSources.length;
    let failed = false;
    for (const src of config.dataSources) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        if (--remaining === 0 && !failed) {
          state.status = 'loaded';
          onReady();
        }
      };
      script.onerror = () => {
        failed = true;
        state.status = 'idle';
        setMessage(`Could not load ${src}.`);
      };
      document.head.appendChild(script);
    }
  }

  // Greek -> Latin transliteration of the (accented) surface form. Diacritics
  // and breathing marks are dropped; a rough breathing adds a leading "h".
  function transliterateGreek(text) {
    const decomposed = text.normalize('NFD');
    const rough = decomposed.includes('\u0314');
    const base = decomposed.replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const digraphs = {
      'ου': 'ou', 'αι': 'ai', 'ει': 'ei', 'οι': 'oi', 'υι': 'ui',
      'αυ': 'au', 'ευ': 'eu', 'ηυ': '\u0113u', 'γγ': 'ng', 'γκ': 'nk',
      'γχ': 'nch', 'γξ': 'nx', 'μπ': 'mp', 'ντ': 'nt',
    };
    const singles = {
      'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': '\u0113',
      'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
      'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y',
      'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': '\u014d',
    };
    let out = '';
    for (let i = 0; i < base.length; i++) {
      const two = base.slice(i, i + 2);
      if (digraphs[two]) { out += digraphs[two]; i++; }
      else { out += singles[base[i]] || base[i]; }
    }
    return (rough ? 'h' : '') + out;
  }

  // Hebrew -> Latin transliteration of the (pointed) surface form. Cantillation
  // and meteg are dropped, niqqud becomes vowels, and dagesh / shin-dot /
  // sin-dot change the consonant. Vav + dagesh is read as shureq (u) and vav +
  // holam as o. Approximate, like the Greek transliteration above.
  function transliterateHebrew(text) {
    const consonants = {
      '\u05D0': '\u02be', '\u05D1': 'b', '\u05D2': 'g', '\u05D3': 'd',
      '\u05D4': 'h', '\u05D5': 'v', '\u05D6': 'z', '\u05D7': '\u1E25',
      '\u05D8': 't', '\u05D9': 'y', '\u05DB': 'k', '\u05DA': 'k',
      '\u05DC': 'l', '\u05DE': 'm', '\u05DD': 'm', '\u05E0': 'n',
      '\u05DF': 'n', '\u05E1': 's', '\u05E2': '\u02BF', '\u05E4': 'p',
      '\u05E3': 'p', '\u05E6': 'ts', '\u05E5': 'ts', '\u05E7': 'q',
      '\u05E8': 'r', '\u05E9': 'sh', '\u05EA': 't',
    };
    const vowels = {
      '\u05B0': 'e', '\u05B1': 'e', '\u05B2': 'a', '\u05B3': 'o',
      '\u05B4': 'i', '\u05B5': 'e', '\u05B6': 'e', '\u05B7': 'a',
      '\u05B8': 'a', '\u05B9': 'o', '\u05BB': 'u', '\u05C7': 'a',
    };
    const isMark = (ch) => ch >= '\u0591' && ch <= '\u05C7';
    const chars = [...text.replace(/[\u0591-\u05AF\u05BD]/g, '')];
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (!consonants[ch]) {
        if (vowels[ch]) out += vowels[ch];
        else if (!isMark(ch)) out += ch;
        continue;
      }
      let cluster = '';
      while (i + 1 < chars.length && isMark(chars[i + 1])) cluster += chars[++i];

      const dagesh = cluster.includes('\u05BC');
      if (ch === '\u05D5' && dagesh) { out += 'u'; continue; }       // shureq
      if (ch === '\u05D5' && cluster.includes('\u05B9')) { out += 'o'; continue; }
      // A yod with no vowel point and no dagesh is a mater lectionis (the
      // preceding letter already supplies the vowel), so it is not sounded.
      if (ch === '\u05D9' && !dagesh && ![...cluster].some((m) => vowels[m])) continue;

      let consonant = consonants[ch];
      if (ch === '\u05E9') consonant = cluster.includes('\u05C2') ? 's' : 'sh';
      else if (ch === '\u05D1') consonant = dagesh ? 'b' : 'v';
      else if (ch === '\u05DB' || ch === '\u05DA') consonant = dagesh ? 'k' : 'kh';
      else if (ch === '\u05E4' || ch === '\u05E3') consonant = dagesh ? 'p' : 'f';

      let vowel = '';
      for (const m of cluster) {
        if (vowels[m]) { vowel = vowels[m]; break; }
      }
      out += consonant + vowel;
    }
    return out;
  }

  // Collapsed Read-mode cards show a single short gloss derived from the
  // neutral Strong's definition, not the KJV rendering list. The definition
  // often opens with a grammatical qualifier ("properly, ...", "figuratively,
  // ..."), so the first sense that is not a bare qualifier is used — e.g.
  // H4325 -> "water" rather than the KJV rendering "piss". A final "i.e."/
  // "that is" clause is the source's own paraphrase, so it is preferred when
  // present even though it is itself prefixed by a qualifier — e.g. G3778 ->
  // "this or that" instead of "the he". Falls back to the full string if
  // nothing usable is found.
  const GLOSS_QUALIFIER = /^(and|or|but|properly|literally|figuratively|by implication|by extension|by euphemism|by analogy|by Hebraism|specially|specifically|generally|especially|partitively|i\.e\.|that is|in a|used|compare)\b/i;

  // Removes balanced (...) and [...] asides. Unlike the old /\([^)]*\)/g this
  // tracks nesting, so a parenthetical containing its own parentheses (common
  // in the Strong's source, e.g. G3004) is removed whole instead of leaving an
  // unbalanced fragment behind.
  function stripGlossNesting(text) {
    let out = '';
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '(' || ch === '[') { depth++; continue; }
      if (ch === ')' || ch === ']') { if (depth > 0) depth--; continue; }
      if (depth === 0) out += ch;
    }
    return out;
  }

  // Splits on the given separators only at nesting depth zero, so punctuation
  // inside a parenthetical (e.g. the semicolon in G3004) never truncates.
  function splitGlossTopLevel(text, separators) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') { if (depth > 0) depth--; }
      if (depth === 0 && separators.includes(ch)) {
        parts.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    parts.push(current);
    return parts;
  }

  function cleanGlossFragment(text) {
    return text
      .replace(/^[\s"'\u2018\u2019\u201C\u201D\-–—.]+|[\s"'\u2018\u2019\u201C\u201D\-–—.]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Returns the first sense in `text` that is not a bare grammatical
  // qualifier. Parenthetical/bracketed asides are removed with nesting
  // awareness before each fragment is cleaned, so a nested aside never leaves
  // a dangling ")" or a fragment of the aside behind.
  function firstUsableGloss(text) {
    for (const part of splitGlossTopLevel(text, [';', ','])) {
      const cleaned = cleanGlossFragment(stripGlossNesting(part));
      if (cleaned && !GLOSS_QUALIFIER.test(cleaned)) return cleaned;
    }
    return '';
  }

  // The "i.e."/"that is" clause is the source's own paraphrase of the sense,
  // so its first usable segment is preferred over the literal gloss that
  // precedes it — e.g. G3778 -> "this or that", not "the he". It may sit
  // inside parentheses; scanning the raw string keeps it.
  function ieClauseGloss(definition) {
    const match = /(?:i\.e\.|that is)\s*/i.exec(definition);
    if (!match) return '';
    return firstUsableGloss(definition.slice(match.index + match[0].length));
  }

  function parsedGloss(definition) {
    const ie = ieClauseGloss(definition);
    if (ie) return ie;
    return firstUsableGloss(definition) || definition;
  }

  // Robinson-Pierpont morphology drives a few high-frequency function words
  // whose Strong's definition is too generic to read in a collapsed card. The
  // handlers only fire for Greek morphology (Hebrew parses all start with "H")
  // and return null when there is no morphology, so the definition parser above
  // remains the fallback.
  const GREEK_GLOSS_OVERRIDES = {
    '2532': 'and',
    '1161': 'but',
    '3756': 'not',
    '3361': 'not',
    '3739': 'who/which',
    '3754': 'that/because',
  };

  // eimi (G1510): V-tense voice mood[-person number | -case number gender].
  function eimiGloss(morph) {
    const match = /^V-([A-Z])([A-Z])([A-Z])(?:-([1-3])([SP])|-(N|G|D|A|V)([SP])([MFN]))?$/.exec(morph);
    if (!match) return null;
    const tense = match[1];
    const mood = match[3];
    const person = match[4];
    const number = match[5] || match[7];
    const singular = number === 'S';
    if (mood === 'N') return 'to be';
    if (mood === 'P') return tense === 'F' ? 'about to be' : 'being';
    if (mood === 'S' || mood === 'O') return 'may be';
    if (mood === 'D' || mood === 'M') return 'be';
    if (tense === 'P') {
      if (person === '1' && singular) return 'am';
      if (person === '3' && singular) return 'is';
      return 'are';
    }
    if (tense === 'I') return singular && person !== '2' ? 'was' : 'were';
    if (tense === 'F') return 'will be';
    if (tense === 'R') return 'have been';
    if (tense === 'L') return 'had been';
    return 'be';
  }

  // autos (G846): P-case number gender. Genitive renders as the possessive
  // ("his"/"her"/"their"); the other cases as the object pronoun.
  function autosGloss(morph) {
    const match = /^P-([NGDAV])([SP])([MFN])$/.exec(morph);
    if (!match) return null;
    const greekCase = match[1];
    const plural = match[2] === 'P';
    const gender = match[3];
    if (greekCase === 'N') {
      if (plural) return 'they';
      if (gender === 'F') return 'she';
      if (gender === 'N') return 'it';
      return 'he';
    }
    if (greekCase === 'G') {
      if (plural) return 'their';
      if (gender === 'F') return 'her';
      if (gender === 'N') return 'its';
      return 'his';
    }
    const object = gender === 'F' ? 'her' : gender === 'N' ? 'it' : 'him';
    if (greekCase === 'D') return plural ? 'to them' : `to ${object}`;
    if (greekCase === 'A') return plural ? 'them' : object;
    return null;
  }

  function greekMorphGloss(strongs, morph) {
    if (!morph || morph.charAt(0) === 'H') return null;
    if (strongs === '1510') return eimiGloss(morph);
    if (strongs === '846') return autosGloss(morph);
    return GREEK_GLOSS_OVERRIDES[strongs] || null;
  }

  function shortGloss(definition, strongs, morph) {
    const override = greekMorphGloss(strongs, morph);
    if (override) return override;
    if (!definition) return '';
    return parsedGloss(definition);
  }

  // Read-mode experiment (Greek and Hebrew): an accessible disclosure card.
  // The button is the always-visible reading surface (word, transliteration,
  // short gloss); the neutral definition, KJV renderings, Strong's id and
  // morphology live in a detail panel that the button reveals. Independent per
  // card (no accordion), keyboard/touch/SR friendly. Study mode does not use
  // this builder.
  function buildDisclosureWord(config, surface, strongs, morph, definition, rendering, detailId) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'iw iw-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', detailId);

    const surfaceSpan = document.createElement('span');
    surfaceSpan.className = config.surfaceClass;
    if (config.lang) surfaceSpan.lang = config.lang;
    surfaceSpan.textContent = surface;

    const translit = document.createElement('span');
    translit.className = 'iw-translit';
    translit.textContent = config.transliterate(surface);

    const shortGlossEl = document.createElement('span');
    shortGlossEl.className = 'iw-gloss-short';
    shortGlossEl.textContent = shortGloss(definition, strongs, morph);

    const caret = document.createElement('span');
    caret.className = 'iw-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.textContent = '\u25be';

    button.append(surfaceSpan, translit, shortGlossEl, caret);

    const detail = document.createElement('div');
    detail.className = 'iw-detail';
    detail.id = detailId;
    detail.hidden = true;

    const heading = document.createElement('div');
    heading.className = 'iw-detail-head';
    const headingWord = document.createElement('span');
    if (config.lang) headingWord.lang = config.lang;
    headingWord.textContent = surface;
    heading.append(headingWord, ` \u00b7 ${config.transliterate(surface)}`);
    detail.appendChild(heading);

    const rows = [];
    if (definition) rows.push(['Definition', definition]);
    if (rendering) rows.push(['KJV', rendering]);
    if (strongs) rows.push(['Strong\u2019s', config.strongsPrefix + strongs]);
    if (morph) rows.push(['Morphology', morph]);
    const dl = document.createElement('dl');
    dl.className = 'iw-detail-list';
    for (const [term, value] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dt, dd);
    }
    detail.appendChild(dl);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.classList.toggle('is-expanded', !expanded);
      detail.hidden = expanded;
    });

    return { button, detail };
  }

  function renderInterlinear(config, translations) {
    const data = window[config.dataGlobal];
    const strongsData = window[config.glossGlobal] || {};
    // `definitions` is the neutral Strong's definition (Read-mode gloss and
    // detail); `renderings` is the KJV rendering list (Study-mode card and the
    // detail panel). The `glosses` fallback keeps an older cached data file
    // working (both maps then resolve to the KJV list, as before).
    const definitions = strongsData.definitions || strongsData.glosses || {};
    const renderings = strongsData.renderings || strongsData.glosses || {};
    // Progressive disclosure applies to the interlinears that opt in via
    // `config.disclosure`; Study mode falls back to the original dense cards.
    const disclosure = !!config.disclosure && interlinearState[config.key].mode !== 'study';
    // First selected translation, if any, supplies the verse caption.
    const translation = translations[0];

    // In reference mode (the user searched a verse/passage) restrict each
    // group to the verses actually requested, same as renderReferenceGroups()
    // does for the normal reading view, instead of always dumping the whole
    // chapter. Browse mode keeps showing the whole current chapter.
    const groups = viewState.mode === 'reference'
      ? viewState.groups
      : [{ bookId: currentBook().id, chapter: Number(refs.chapter.value), ranges: null }];

    groups.forEach(group => {
      renderInterlinearGroup(config, data, definitions, renderings, disclosure, translation, group);
    });

    const note = document.createElement('p');
    note.className = 'interlinear-source';
    note.textContent = config.sourceNote;
    refs.results.appendChild(note);
  }

  // Renders one book/chapter block of an interlinear view, optionally
  // restricted to a group's verse ranges (null ranges = whole chapter).
  function renderInterlinearGroup(config, data, definitions, renderings, disclosure, translation, group) {
    const book = canon.books.find(b => b.id === group.bookId);
    if (!book) return;
    const chapterNum = group.chapter;
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;
    const verseCount = book.chapters[chapterNum - 1];
    const verseFilter = group.ranges ? new Set(versesForGroup(group, verseCount)) : null;

    const head = document.createElement('div');
    head.className = 'result-head';
    const h2 = document.createElement('h2');
    h2.append(`${name} ${chapterNum} `);
    const small = document.createElement('small');
    small.textContent = config.label;
    h2.appendChild(small);
    head.appendChild(h2);
    refs.results.appendChild(head);

    const verses = data && data.books[book.id] && data.books[book.id][chapterNum - 1];
    if (!verses) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = config.unavailable;
      refs.results.appendChild(empty);
      return;
    }

    for (let v = 0; v < verses.length; v++) {
      const verseNum = v + 1;
      if (verseFilter && !verseFilter.has(verseNum)) continue;
      const tokens = verses[v];
      if (!tokens || !tokens.length) continue;

      const block = document.createElement('div');
      block.className = 'interlinear-verse';

      const ref = document.createElement('div');
      ref.className = 'interlinear-ref';
      ref.textContent = `${name} ${chapterNum}:${verseNum}`;
      block.appendChild(ref);

      if (translation) {
        const tv = window.MARANATHA_TRANSLATIONS[translation.id];
        const tch = tv && tv.books[book.id] && tv.books[book.id][chapterNum - 1];
        const ttext = tch && tch[verseNum - 1];
        if (ttext) {
          const caption = document.createElement('div');
          caption.className = 'interlinear-caption';
          caption.dir = 'auto';
          caption.textContent = ttext;
          block.appendChild(caption);
        }
      }

      const words = document.createElement('div');
      words.className = 'interlinear-words';
      if (config.rtl) words.dir = 'rtl';
      const details = disclosure ? document.createElement('div') : null;
      if (details) details.className = 'interlinear-details';
      for (let t = 0; t < tokens.length; t++) {
        const [surface, strongs, morph] = tokens[t];
        const definition = definitions[strongs] || '';
        const rendering = renderings[strongs] || '';

        if (disclosure) {
          const detailId = `iw-detail-${book.id}-${chapterNum}-${verseNum}-${t}`;
          const { button, detail } = buildDisclosureWord(config, surface, strongs, morph, definition, rendering, detailId);
          words.appendChild(button);
          details.appendChild(detail);
          continue;
        }

        const card = document.createElement('span');
        card.className = 'iw';

        const surfaceSpan = document.createElement('span');
        surfaceSpan.className = config.surfaceClass;
        surfaceSpan.textContent = surface;

        const translit = document.createElement('span');
        translit.className = 'iw-translit';
        translit.textContent = config.transliterate(surface);

        const gloss = document.createElement('span');
        gloss.className = 'iw-gloss';
        gloss.textContent = rendering;
        const glossTitle = [strongs ? config.strongsPrefix + strongs : '', rendering, morph].filter(Boolean).join(' \u00b7 ');
        if (glossTitle) gloss.title = glossTitle;

        const meta = document.createElement('span');
        meta.className = 'iw-meta';
        meta.textContent = strongs ? config.strongsPrefix + strongs : '';

        card.append(surfaceSpan, translit, gloss, meta);
        words.appendChild(card);
      }
      block.appendChild(words);
      if (details) block.appendChild(details);
      refs.results.appendChild(block);
    }
  }

  // Which interlinear, if any, should be shown for the current book. When both
  // checkboxes are ticked the current book's testament decides.
  function activeInterlinear() {
    const book = currentBook();
    const isNT = !!(book && book.testament === 'NT');
    if (interlinearState.greek.enabled && interlinearState.hebrew.enabled) {
      return isNT ? INTERLINEARS.greek : INTERLINEARS.hebrew;
    }
    if (interlinearState.greek.enabled) return INTERLINEARS.greek;
    if (interlinearState.hebrew.enabled) return INTERLINEARS.hebrew;
    return null;
  }

  function render({ scrollToReference = true } = {}) {
    const translations = selectedTranslations();

    refs.results.innerHTML = '';

    // An interlinear overrides the normal reading view (works even with no
    // translation selected — a selected one is used only as a caption). If
    // both checkboxes are ticked, the current book's testament decides.
    const interlinear = activeInterlinear();
    if (interlinear) {
      setMessage('');
      refs.contextBtn.hidden = true;
      renderInterlinear(interlinear, translations);
      return;
    }

    if (!translations.length) {
      setMessage('Select at least one translation to display.');
      return;
    }
    setMessage('');
    populateSearchTranslations();

    // At phone widths every selector choice uses the dedicated stacked
    // reading view. Multi-column and multi-row remain meaningful desktop
    // choices, but compressing either table onto a phone is less readable.
    const layout = narrowScreen.matches
      ? 'mobile'
      : refs.layout.value === 'auto'
        ? (translations.length > 5 ? 'multirow' : 'multicolumn')
        : refs.layout.value;

    if (viewState.mode === 'reference') {
      renderReferenceGroups(viewState.groups, translations, layout);
    } else if (viewState.mode === 'search') {
      renderSearchResults();
    } else {
      renderBrowseChapter(translations, layout);
    }

    // Update the context button label to reflect current state
    refs.contextBtn.textContent = contextEnabled ? 'Hide context for all' : `Show context for all (\u00b1${CONTEXT_RADIUS})`;

    const target = document.getElementById('current-reference');
    if (scrollToReference && target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setMessage(message) { refs.message.textContent = message; }
})();
