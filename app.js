// Translation arrays are indexed by source verse number, never by the count
// of surviving verses. Metadata also records references preserved in notes.
class VerseAvailability {
    static metadata(data, bookId, chapter, verse) {
        return data?.verseMetadata?.[bookId]?.[chapter]?.[verse] || null;
    }

    static references(canon, translations, bookId, chapter) {
        const refs = new Set();
        let covered = false;
        for (const data of Object.values(translations || {})) {
            const verses = data.books?.[bookId]?.[chapter - 1];
            if (!Array.isArray(verses)) continue;
            covered = true;
            verses.forEach((text, i) => { if (text) refs.add(i + 1); });
            for (const v of Object.keys(data.verseMetadata?.[bookId]?.[chapter] || {})) {
                if (/^[1-9]\d*$/.test(v)) refs.add(Number(v));
            }
        }
        // The canon remains a navigation fallback for unloaded/uncovered books.
        // Once a chapter is loaded its source references take precedence.
        if (!covered) {
            const count = canon.books.find(b => b.id === bookId)?.chapters[chapter - 1] || 0;
            for (let v = 1; v <= count; v++) refs.add(v);
        }
        return refs;
    }

    static cell(data, bookId, chapter, verse) {
        if (!data?.books?.[bookId]) return { state: 'missing-book' };
        const text = data.books[bookId][chapter - 1]?.[verse - 1];
        const meta = this.metadata(data, bookId, chapter, verse);
        if (meta?.status === 'omitted') return { state: 'omitted', note: meta.note };
        // A declared source gap: the slot is indexed but the source carries no
        // separately indexed text. It is never filled from an adjacent verse or
        // guessed; the notice is shown instead.
        if (meta?.status === 'source-gap') return { state: 'source-gap', note: meta.note, context: meta.context };
        if (meta?.status === 'combined-member') return { state: 'source-gap', note: `This reference belongs to the combined source passage ${chapter}:${meta.sourceLabel}, shown together at ${chapter}:${meta.combinedInto}.` };
        // A source placeholder: the source supplies only a bracketed marker, no
        // Scripture. The exact marker is still shown, with an authored notice
        // (never presented as a source footnote) that no text was supplied.
        if (meta?.status === 'source-placeholder') return { state: 'text', text: text || meta.text || '', note: meta.note, placeholder: true };
        if (meta?.status === 'note') return { state: 'note', text: meta.text, note: meta.note };
        if (text) return { state: meta?.status === 'additional' ? 'additional' : 'text', text, note: meta?.note };
        return { state: 'missing-verse' };
    }
}

class ReferenceParser {

    // Normalizes a book name/alias for lookup: lowercases; turns a leading
    // Roman numeral prefix (I/II/III) into 1/2/3 and drops a leading ordinal
    // suffix (1st/2nd/3rd/4th); removes periods, apostrophes, hyphens and all
    // whitespace. This is what lets "I Cor.", "1Cor", "1 cor" and "1st
    // Corinthians" all resolve to the same book without a separate alias.
    static normalizeKey(value) {
        return String(value)
            .normalize('NFC')
            .toLowerCase()
            .replace(/^(\d+)(?:st|nd|rd|th)\b/, '$1')
            .replace(/^(i{1,3})(?=\s|\b)/, (m) => String(m.length))
            .replace(/[.'’\u2019-]/g, '')
            .replace(/\s+/g, '')
            .replace(/\u200B/g, '')
            .trim();
    }

    // Normalizes only the REFERENCE INPUT (never Scripture): full-width digits
    // and separators to ASCII, the Japanese chapter/verse markers 章/節 to the
    // usual ":"/"", and a trailing separator away. Book names themselves are
    // untouched; Japanese no-space references such as ヨハネ3:16, ヨハネ ３：１６
    // and ヨハネ3章16節 all become an ASCII-parseable form here.
    static normalizeReferenceInput(value) {
        return String(value)
            .replace(/[\uFF10-\uFF19]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0))
            .replace(/[\u0E50-\u0E59]/g, (d) => String.fromCharCode(48 + d.charCodeAt(0) - 0x0E50))
            .replace(/\uFF1A/g, ':')
            .replace(/\uFF1B/g, ';')
            .replace(/\uFF0C/g, ',')
            .replace(/[\uFF0D\u301C\uFF5E]/g, '-')
            .replace(/\u3000/g, ' ')
            .replace(/\u7AE0/g, ':')
            .replace(/[\u7BC0\u8282]/g, '')
            .replace(/[:]\s*$/, '');
    }

    constructor(canon, locale, translations = () => (typeof window === 'undefined' ? {} : window.MARANATHA_TRANSLATIONS || {})) {

        this.canon = canon;
        this.translations = translations;

        // The highest chapter number that may be referenced for a book. A
        // translation may cover chapters beyond the canon extent (for example
        // the Clementine Vulgate's Esther 11-16); such a chapter is valid when,
        // and only when, a translation passed to this parser actually carries
        // it — so a native reference is never accepted on the strength of an
        // unrelated loaded edition.
        //
        // An edition that declares nativeReferenceScope (the Bungo-yaku) is
        // authoritative for its own extent WHEN IT IS THE SOLE selected edition:
        // its shorter Daniel (12 chapters) then genuinely excludes canon Daniel
        // 13-14 instead of inheriting the provisional Catholic navigation
        // skeleton. In a mixed selection the canon/maximum extent is kept, so
        // existing mixed-view reference behaviour is unchanged.
        this.maxChapter = (bookId) => {
            const canonBook = this.canon.books.find((b) => b.id === bookId);
            let max = canonBook ? canonBook.chapters.length : 0;
            const trans = this.translations() || {};
            const ids = Object.keys(trans);
            if (ids.length === 1) {
                const data = trans[ids[0]];
                const arr = data && data.books && data.books[bookId];
                if (data && data.nativeReferenceScope && Array.isArray(arr)) return arr.length;
            }
            for (const data of Object.values(trans)) {
                const arr = data && data.books && data.books[bookId];
                if (Array.isArray(arr) && arr.length > max) max = arr.length;
            }
            return max;
        };

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

        // Japanese book names/aliases are merged independently of the chosen
        // display locale, so ヨハネ3:16 resolves even when the UI language is
        // English or Armenian. This is additive: existing aliases are never
        // removed and a missing resource simply contributes nothing.
        const japanese = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_JA) || null;
        // Japanese book-label selection also accepts the existing English
        // names; this adds no changes to the established English/Armenian UI.
        const english = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_EN) || null;
        if (['ja', 'zh-Hant', 'id', 'th', 'tl', 'vi', 'ms'].includes(locale.language) && english?.books) {
            for (const book of canon.books) {
                const info = english.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }
        if (japanese && japanese.books && japanese !== locale) {
            for (const book of canon.books) {
                const info = japanese.books[book.id];
                if (!info) continue;
                if (info.name) this.bookMap.set(ReferenceParser.normalizeKey(info.name), book);
                for (const alias of info.aliases || []) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const chinese = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_ZH_HANT) || null;
        if (chinese?.books && chinese !== locale) {
            for (const book of canon.books) {
                const info = chinese.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const indonesian = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_ID) || null;
        if (indonesian?.books && indonesian !== locale) {
            for (const book of canon.books) {
                const info = indonesian.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const thai = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_TH) || null;
        if (thai?.books && thai !== locale) {
            for (const book of canon.books) {
                const info = thai.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const filipino = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_TL) || null;
        if (filipino?.books && filipino !== locale) {
            for (const book of canon.books) {
                const info = filipino.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const vietnamese = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_VI) || null;
        if (vietnamese?.books && vietnamese !== locale) {
            for (const book of canon.books) {
                const info = vietnamese.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
                }
            }
        }

        const malay = (typeof window !== 'undefined' && window.MARANATHA_LOCALE_MS) || null;
        if (malay?.books && malay !== locale) {
            for (const book of canon.books) {
                const info = malay.books[book.id];
                if (!info) continue;
                for (const alias of [info.name, ...(info.aliases || [])]) {
                    this.bookMap.set(ReferenceParser.normalizeKey(alias), book);
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

        // "<book name><chapter>[:<verseSpec>]" with NO whitespace. This is how
        // natural Japanese references are written (ヨハネ3:16); it is only
        // accepted when the leading text resolves to a known book, so English
        // behaviour is unchanged ("John" alone still falls through to the
        // whole-book branch). The book side is matched non-greedily up to the
        // first digit, and the longest known alias wins by construction because
        // the whole leading text is looked up in the normalized book map.
        const noSpaceBook = /^(.+?)(\d+)(?::\s*([\d,\s-]*))?$/;

        // "<chapter>[:<verseSpec>]" with no book — only valid when a
        // previous group in the same query already established one.
        const chapterOnly = /^(\d+)(?::\s*([\d,\s-]+))?$/;

        const parts = ReferenceParser.normalizeReferenceInput(input)
            .split(';').map(part => part.trim()).filter(Boolean);

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
                    const noSpaceMatch = fullMatch ? null : part.match(noSpaceBook);
                    const noSpaceBookEntry = noSpaceMatch
                        ? this.bookMap.get(ReferenceParser.normalizeKey(noSpaceMatch[1]))
                        : null;

                    if (fullMatch || noSpaceBookEntry) {

                        const match = fullMatch || noSpaceMatch;
                        const bookText = match[1];
                        const book = fullMatch
                            ? this.bookMap.get(ReferenceParser.normalizeKey(bookText))
                            : noSpaceBookEntry;

                        if (!book)
                            throw new Error(`Unknown book "${bookText.trim()}".`);

                        bookId = book.id;
                        chapterText = match[2];
                        verseSpec = match[3];

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

                if (!Number.isInteger(chapter) || chapter < 1
                    || chapter > this.maxChapter(bookId))
                    throw new Error(`"${part}" — chapter ${chapterText} does not exist in this book.`);

                const available = VerseAvailability.references(this.canon, this.translations(), bookId, chapter);
                const verseCount = available.size ? Math.max(...available) : 0;
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

                            if (start < 1 || !available.has(start))
                                throw new Error(`"${item}" in "${part}" is not a reference available in this chapter of the loaded translations (last verse ${verseCount}).`);

                            if (end < start)
                                throw new Error(`"${item}" in "${part}" has a reversed range — end comes before start.`);

                            if (!available.has(end))
                                throw new Error(`"${item}" in "${part}" is not a reference available in this chapter of the loaded translations (last verse ${verseCount}).`);

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
    { id: 'ja', label: '日本語', global: 'MARANATHA_LOCALE_JA' },
    { id: 'zh-Hant', label: '繁體中文', global: 'MARANATHA_LOCALE_ZH_HANT' },
    { id: 'id', label: 'Bahasa Indonesia', global: 'MARANATHA_LOCALE_ID' },
    { id: 'ms', label: 'Bahasa Melayu', global: 'MARANATHA_LOCALE_MS' },
    { id: 'vi', label: 'Tiếng Việt', global: 'MARANATHA_LOCALE_VI' },
    { id: 'tl', label: 'Filipino / Tagalog', global: 'MARANATHA_LOCALE_TL' },
    { id: 'th', label: 'ภาษาไทย', global: 'MARANATHA_LOCALE_TH' },
  ];

  let locale = window.MARANATHA_LOCALE_EN;
  let parser = new ReferenceParser(MARANATHA_CANON, locale, selectedTranslationData);


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
    { id: 'web', label: 'World English Bible', short: 'WEB', src: 'data/web.js?v=sirach-20261005' },
    { id: 'kjv', label: 'King James Version', short: 'KJV', src: 'data/kjv.js' },
    { id: 'armwestern', label: 'Western Armenian NT (1853)', short: 'Western Armenian', src: 'data/armwestern.js', note: 'This translation is available for research, but it is not selected by default while its verse boundaries are being checked. Read the project history for details.' },
    { id: 'byz', label: 'Byzantine Majority Text (Greek NT)', short: 'Byzantine Greek', src: 'data/byz.js' },
    { id: 'he', label: 'Hebrew (OSHB)', short: 'Hebrew (OSHB)', src: 'data/he.js' },
    { id: 'luther1912', label: 'Luther Bible 1912', short: 'Luther 1912', src: 'data/luther1912.js' },
    { id: 'segond1910', label: 'Louis Segond (1910)', short: 'Segond 1910', src: 'data/segond1910.js' },
    // The Latin Clementine Vulgate (1598) published by eBible.org as latVUC.
    // It declares nativeVersification in its data, so every chapter is treated
    // as edition-specific numbering and is never row-aligned with canon
    // translations on the strength of matching verse numbers alone.
    { id: 'vulc', label: 'Vulgata Clementina (1598)', short: 'VULC', src: 'data/vulc.js', description: 'Latin Clementine Vulgate (1598), including the deuterocanonical books, published by eBible.org as latVUC. Public domain. Read in its own native verse numbering; it is not aligned row-for-row with canon-numbered translations. Distinct from the Nova Vulgata (1979).' },
    // `description` is the visible source explanation. It is deliberately a
    // separate field from `note` (which renders the "Under audit" disclosure);
    // the Delitzsch text is not under audit, it is a documented public-domain
    // translation whose print edition eBible does not identify.
    { id: 'delitzsch', label: 'Delitzsch Hebrew NT (1877)', short: 'Delitzsch', src: 'data/delitzsch.js', group: 'delitzsch', description: 'Hebrew translation of the Greek New Testament by Franz Delitzsch, first published in 1877. This unpointed eBible digital text does not identify its underlying print edition.' },
    { id: 'delitzsch1901', label: 'Delitzsch Hebrew NT (1901, vocalized)', short: 'Delitzsch 1901', src: 'data/delitzsch1901.js', group: 'delitzsch', description: 'Vocalized Hebrew translation of the Greek New Testament by Franz Delitzsch, first published in 1877 and imported from the British & Foreign Bible Society 1901 (twelfth) edition, Berlin. Public domain. Its verse numbering differs from canon.js in seven chapters; each is disclosed in the reading view.' },
    // The Classical Japanese Bible (Bungo-yaku / Taisho-kaiyaku), imported from
    // the CrossWire Bible Society JapBungo 2.0 SWORD module (Public Domain). It
    // declares nativeVersification (its own reading blocks are never row-aligned
    // with canon-numbered editions) and nativeReferenceScope (as the sole
    // selected edition its source extent, including 12 Daniel chapters, is
    // authoritative). Its three source gaps are disclosed inline.
    { id: 'bungo', label: 'Bungo-yaku (Meiji OT / Taisho NT)', short: 'BUNGO', src: 'data/bungo.js', description: 'Classical literary Japanese (bungo) Protestant Bible, from the CrossWire Bible Society JapBungo module 2.0 (2022-08-17). The Old Testament follows the Meiji translation (1887) and the New Testament the Taisho translation (1917); the module identifies the printed witnesses as the 1953 OT and 1950 NT printings. DistributionLicense=Public Domain. Read in the source-indexed numbering (66 books, 1189 chapters, 31102 indexed verse slots). Daniel has 12 chapters and the deuterocanonical books are absent. Three source slots (Exodus 7:25, 2 Samuel 19:25, 2 Chronicles 2:13) carry no separately indexed text and are shown as declared source gaps.' },
    // The publisher's recent Open Translation Bible (OTB) Japanese edition,
    // launched December 2025 and licensed CC BY-SA 4.0. It is NOT the Kogoyaku
    // or Bungo-yaku. It declares nativeVersification (its own reading blocks are
    // never row-aligned) and nativeReferenceScope (as the sole selected edition
    // its source extent, including 12 Daniel chapters and 15 verses in 3 John 1,
    // is authoritative). Translation/editorial provenance is not documented by
    // the publisher and is not asserted here; the edition is not accuracy-certified.
    { id: 'otb-ja', label: 'Open Translation Bible (Japanese)', short: 'OTB-JA', src: 'data/otb-ja.js', description: 'The publisher\u2019s Open Translation Bible (OTB) Japanese edition, launched December 2025 and released under CC BY-SA 4.0 (openbible.uk). Read in its own native reference numbering (66 books, 1189 chapters, 31103 numbered source records). Daniel has 12 chapters. The publisher does not document the translation or editorial method, so this edition is not accuracy-certified. Two source records (Matthew 23:14 and John 5:4) contain only a bracketed placeholder with no Scripture text and are shown exactly as supplied. Converted offline from the publisher JSON; each verse\u2019s original text segments are preserved.' },
    { id: 'cuv-traditional', label: 'Chinese Union Version (Traditional, New Punctuation, 上帝)', short: 'CUV-T', src: 'data/cuv-traditional.js', description: '新標點和合本・繁體・上帝版. Traditional Chinese New Punctuation CUV, from eBible.org cmn-cu89t (distributor declares Public Domain). The older CUV wording is retained; this is not the Revised Chinese Union Version. Source numbering and 70 combined passages are preserved in their own reading block. Footnotes and headings are shown separately; 11 references have no separately numbered source record.' },
    { id: 'ayt', label: 'Alkitab Yang Terbuka (Indonesian)', short: 'AYT', src: 'data/ayt.js', description: 'Indonesian AYT from the official YLSA datasets. Copyright YLSA-AYT 2011,2024; non-commercial distribution with attribution and share-alike terms. All 66 books are included. Ordinary passages are compared by matching publisher references; Isaiah 22 and Romans 14 are read separately because of source content-placement differences. Three Isaiah records contain only source reference pointers.' },
    { id: 'peshitta', label: 'Syriac Peshitta (BFBS digital NT)', short: 'PESH', src: 'data/peshitta.js', description: 'Unpointed Syriac NT from CrossWire Peshitta 2.0, Public Domain as declared by its distributor. All 27 NT books; five later-supplied books are identified separately. The module labels its BFBS source 1905; no exact complete print impression is asserted. Mark 9:50 is recovered from an explicit source marker. No OT or MarYa annotation layer.' },
    { id: 'murdock', label: 'James Murdock’s English Syriac NT (1852)', short: 'MUR', src: 'data/murdock.js?v=2', note: 'The digital module has ten empty indexed slots, verified as merged/shifted indexing residue. Their wording remains in adjacent source slots identified in the notices. Native reference placement differs in several chapters. See docs/PESHITTA.md.', description: 'Public-domain English NT, translated using earlier Syriac editions of 1816/1826 rather than the imported BFBS witness. All 27 NT books; 19 footnotes kept separately. Explicitly appended native verse units are restored with a conversion ledger. English Lord wording is unchanged; no MarYa substitution.' },
    { id: 'kszi', label: 'Kitab Suci Zabur dan Injil (Malay NT, 2013)', short: 'KSZI', src: 'data/kszi.js', description: 'Malaysian Malay New Testament only: 27 books, copyright © 2013 Pengamat Kitab Mulia, CC BY-ND 4.0. Isa al-Masih, Yahya and all words/punctuation are preserved. No Psalms or other Old Testament books are included. Source headings are collapsed below reading. Ordinary chapters share comparison rows; 3 John and Romans 14 read separately.' },
    { id: 'ovcb', label: 'Biblica® Open Vietnamese Contemporary Bible™ (2015)', short: 'OVCB', src: 'data/ovcb.js', description: 'Biblica Thiên Ban Kinh Thánh Hiện Đại, Vietnamese, copyright © 1982, 1987, 1994, 2005, 2015 Biblica, Inc., CC BY-SA 4.0. All 66 books; eight absent numbered records remain unfilled. Notes/headings are collapsed below Scripture. Ordinary chapters share comparison rows; 3 John, Romans 14 and Revelation 12–13 use separate reading blocks.' },
    { id: 'asd', label: 'Biblica® Open Ang Salita ng Diyos™ (2025)', short: 'ASD', src: 'data/asd.js', description: 'Modern Filipino/Tagalog Bible, copyright © 2009, 2011, 2014, 2025 Biblica, Inc., CC BY-SA 4.0. All 66 books; 185 combined passages preserved intact. Ordinary chapters share reference comparison rows. Chapters with combined ranges or documented boundary/content-placement differences read separately. Source notes/headings are collapsed below Scripture.' },
    { id: 'tcv', label: 'Biblica® Open Thai Common Version™ (2025)', short: 'TCV', src: 'data/tcv.js', description: 'Biblica Open Thai Common Version 2025, copyright © 2025 Biblica, Inc., distributed under CC BY-SA 4.0. All 66 books are included. Thai words, punctuation and source word separators are preserved. Sixteen numbered positions have no main verse text; their source notes remain available below the passage. Ordinary references share comparison rows; 3 John and Romans 14 use independent reading blocks.' },
  ];

  // Grouped translations share ONE checkbox with an edition dropdown. Each
  // member keeps its own ID, data file, text, numbering, metadata and source
  // disclosure; grouping is a control-layer concern only. The default edition
  // is chosen here, and is also what the checkbox selects when first ticked.
  const TRANSLATION_GROUPS = [
    {
      id: 'delitzsch',
      label: 'Delitzsch Hebrew NT',
      defaultEdition: 'delitzsch1901',
      editions: [
        { id: 'delitzsch1901', label: '1901 — with vowels' },
        { id: 'delitzsch', label: 'eBible — without vowels' },
      ],
    },
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
    interlinearBerean: q('#interlinear-berean'),
    interlinearBereanHe: q('#interlinear-berean-he'),
    interlinearGreekMode: q('#interlinear-greek-mode'),
    interlinearHeMode: q('#interlinear-he-mode'),
    interlinearBereanMode: q('#interlinear-berean-mode'),
    interlinearBereanHeMode: q('#interlinear-berean-he-mode'),
    bereanCacheStatus: q('#berean-cache-status'),
    go: q('#go-button'),
    results: q('#results'),
    message: q('#message'),
    translations: q('#translations'),
    alignmentPilot: q('#lxx-alignment-pilot'),
    alignmentNotice: q('#lxx-alignment-notice'),
    contextBtn: q('#context-toggle'),
    search: q('#search'),
    searchGo: q('#search-go'),
    searchTranslation: q('#search-translation'),
    prevChapter: q('#prev-chapter-button'),
    nextChapter: q('#next-chapter-button'),
    fontsize: q('#fontsize'),
    hebrewScript: q('#hebrew-scripts'),
    hebrewScriptNote: q('#hebrew-script-note'),
    viewMode: q('#view-mode'),
    lxxBar: q('#lxx-bar'),
    lxxBook: q('#lxx-book'),
    lxxChapter: q('#lxx-chapter'),
    lxxAttribution: q('#lxx-attribution'),
    parallelView: q('#parallel-view'),
    parallelLxxBook: q('#parallel-lxx-book'),
    parallelLxxChapter: q('#parallel-lxx-chapter'),
    parallelLxxContent: q('#parallel-lxx-content'),
    parallelTranslation: q('#parallel-translation'),
    parallelBook: q('#parallel-book'),
    parallelChapter: q('#parallel-chapter'),
    parallelTranslationContent: q('#parallel-translation-content'),
};
  // Canon-only controls (Book/Chapter selects, Previous/Next/Open chapter).
  // Toggled as a group so the LXX view never shows two Book/Chapter pairs.
  refs.canonControls = [...document.querySelectorAll('[data-canon-only]')];
  const loaded = new Set();   // translation ids whose <script> has finished loading
  const loading = new Set();  // translation ids whose <script> is in flight
  // Active edition per grouped control (group id -> selected translation id).
  // Initialised from each group's defaultEdition in populateTranslationCheckboxes.
  const groupEditions = new Map();
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
      reviewedGlobal: 'MARANATHA_REVIEWED_GREEK_GLOSS',
      dataSources: [
        'data/byz-interlinear.js',
        'data/strongs-greek.js',
      ],
      // Optional, independent of the required sources above: a missing or
      // uncached pilot file must never block the interlinear. Its successful
      // (possibly late) load rerenders the active view with candidate glosses.
      optionalDataSources: [
        { src: 'data/reviewed-greek-gloss.js', global: 'MARANATHA_REVIEWED_GREEK_GLOSS' },
      ],
      strongsPrefix: 'G',
      testament: 'NT',
      label: '(Greek interlinear)',
      unavailable: 'Interlinear data is available for the Greek New Testament only.',
      sourceNote: 'Greek text: Robinson-Pierpont Byzantine (Unlicense) \u00b7 glosses: Strong\'s, Open Scriptures (CC-BY-SA) \u00b7 candidate reading pilot: John 6:50\u201351.',
      token: { surface: 0, strongs: 1, morph: 2 },
      readingGlossLabel: 'Reading gloss (candidate pilot)',
      surfaceClass: 'iw-greek',
      rtl: false,
      lang: 'el',
      transliterate: transliterateGreek,
      // Which card style each mode uses, per interlinear. Default order:
      // Reading = expandable disclosure cards, Study = dense cards.
      disclosureByMode: { read: true, study: false },
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
      token: { surface: 0, strongs: 1, morph: 2 },
      surfaceClass: 'iw-hebrew',
      rtl: true,
      lang: 'he',
      transliterate: transliterateHebrew,
      disclosureByMode: { read: true, study: false },
      toggleRef: 'interlinearHe',
      modeRef: 'interlinearHeMode',
    },
    // Berean Interlinear Bible NT: a *separate* Greek text with its own Greek
    // tokens, transliteration, morphology, Strong's numbers, and contextual
    // glosses. It is loaded one book at a time (data/berean/<BOOK>.js) so the
    // 5.7 MB corpus is never a mandatory startup payload. It never consults the
    // Byzantine data or the candidate-gloss layer.
    berean: {
      key: 'berean',
      loadingLabel: 'Berean',
      perBook: true,
      testament: 'NT',
      label: '(Berean interlinear)',
      unavailable: 'The Berean interlinear is available for the Greek New Testament only.',
      // NA-omitted verses exist in canon.js but not in Berean's Greek source.
      omittedNotice: 'This verse is not present in the Berean Greek source.',
      sourceNote: 'Berean Interlinear Bible \u00b7 interlinearbible.com \u00b7 public domain (April 30, 2023) \u00b7 Berean uses its own NA-type Greek text, not the Robinson-Pierpont Byzantine text.',
      strongsPrefix: 'G',
      glossGlobal: 'MARANATHA_STRONGS_GREEK',
      // Optional supplemental detail only: the shared Strong's dictionary
      // supplies Definition/KJV reference rows in the expanded detail panel.
      // Berean surfaces/transliterations/glosses render immediately and stay
      // usable if this fails; it is never consulted for Berean's own gloss.
      optionalDataSources: [
        { src: 'data/strongs-greek.js', global: 'MARANATHA_STRONGS_GREEK' },
      ],
      manifestGlobal: 'MARANATHA_BEREAN_MANIFEST',
      chunkSrc: (bookId) => `data/berean/${bookId}.js`,
      chunkGlobal: (bookId) => `MARANATHA_BEREAN_${bookId}`,
      // token = [surface, transliteration, morphology, strongs, gloss]
      token: { surface: 0, translit: 1, morph: 2, strongs: 3, gloss: 4 },
      readingGlossLabel: 'Berean reading gloss',
      surfaceClass: 'iw-greek',
      rtl: false,
      lang: 'el',
      transliterate: null, // use Berean's own transliteration (token field)
      // Inverted for Berean only: Reading = dense cards, Study = expandable
      // disclosure cards (gloss + morphology + Strong's + optional detail).
      disclosureByMode: { read: false, study: true },
      toggleRef: 'interlinearBerean',
      modeRef: 'interlinearBereanMode',
    },
    // Berean Hebrew Old Testament (Torah draft preview): a *separate*
    // Hebrew/Aramaic interlinear with its own surfaces, transliteration,
    // morphology, Strong's numbers and contextual glosses. It covers the five
    // books of the Torah (Genesis 1\u201350 through Deuteronomy 1\u201334) plus the
    // retained Daniel 2:4\u20135 and Malachi 4:5\u20136 samples, and is loaded one book
    // at a time (data/berean-hebrew/<BOOK>.js) so future OT expansion never
    // needs the whole corpus up front. It never consults the OSHB Hebrew data or
    // a Strong's dictionary for its glosses.
    bereanHebrew: {
      key: 'bereanHebrew',
      loadingLabel: 'Berean Hebrew',
      perBook: true,
      testament: 'OT',
      coveredBooks: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'DAN', 'MAL'],
      label: '(Berean Hebrew, Torah draft)',
      unavailable: 'The Berean Hebrew draft preview covers the five books of the Torah \u2014 Genesis 1\u201350, Exodus 1\u201340, Leviticus 1\u201327, Numbers 1\u201336 and Deuteronomy 1\u201334 \u2014 plus the retained Daniel 2:4\u20135 and Malachi 4:5\u20136 samples. This passage is outside the preview.',
      coverageNotice: 'Outside the Berean Hebrew draft preview (Torah: Genesis 1\u201350; Exodus 1\u201340; Leviticus 1\u201327; Numbers 1\u201336; Deuteronomy 1\u201334; plus retained Daniel 2:4\u20135 and Malachi 4:5\u20136 samples).',
      provenanceNote: 'Berean Hebrew Torah draft preview \u00b7 Bible Hub \u00b7 dated draft \u00b7 variant notes are verified OSHB comparisons only.',
      sourceNote: 'Berean Interlinear Bible (BIB), Hebrew OT \u2014 dated draft preview from Bible Hub: the five books of the Torah (Genesis 1\u201350, Exodus 1\u201340, Leviticus 1\u201327, Numbers 1\u201336, Deuteronomy 1\u201334), plus the retained Daniel 2:4\u20135 and Malachi 4:5\u20136 samples. Text dedication: berean.bible/terms.htm.',
      // No shared Strong's dictionary: the preview never falls back to
      // dictionary prose for a missing gloss.
      glossGlobal: null,
      manifestGlobal: 'MARANATHA_BEREAN_HEBREW_MANIFEST',
      manifestSrc: 'data/berean-hebrew/manifest-v5.js',
      chunkSrc: (bookId) => {
        // The manifest publishes each book's (possibly versioned) filename so a
        // changed chunk is fetched fresh rather than served from an old cache.
        const m = window.MARANATHA_BEREAN_HEBREW_MANIFEST;
        const file = (m && m.chunkFiles && m.chunkFiles[bookId]) || `${bookId}.js`;
        return `data/berean-hebrew/${file}`;
      },
      chunkGlobal: (bookId) => `MARANATHA_BEREAN_HEBREW_${bookId}`,
      strongsPrefix: 'H',
      // Object-keyed tokens; extra fields drive faithful rendering.
      token: {
        surface: 'surface', translit: 'transliteration', morph: 'morphology',
        strongs: 'strongs', strongsList: 'strongsList', gloss: 'gloss',
        glossStatus: 'glossStatus', variant: 'variant',
      },
      readingGlossLabel: 'Berean Hebrew reading gloss',
      surfaceClass: 'iw-hebrew',
      rtl: true,
      isolateLtr: true,
      lang: 'he',
      transliterate: null, // use the source's own transliteration
      // Inverted like Berean Greek: Reading = dense cards, Study = expandable.
      disclosureByMode: { read: false, study: true },
      toggleRef: 'interlinearBereanHe',
      modeRef: 'interlinearBereanHeMode',
    },
  };
  const interlinearState = {
    greek: { enabled: false, status: 'idle', mode: 'read', optionalLoading: false },
    hebrew: { enabled: false, status: 'idle', mode: 'read', optionalLoading: false },
    // Berean is loaded per book; track which books are in flight (dedupes
    // concurrent loads) and which failed (so the UI can offer a retry).
    berean: { enabled: false, status: 'idle', mode: 'read', loading: {}, failed: {}, optionalLoading: false },
    // Berean Hebrew preview is loaded per book (like Berean Greek), with a tiny
    // manifest first; track manifest loading/failure too.
    bereanHebrew: { enabled: false, status: 'idle', mode: 'read', optionalLoading: false, manifestLoading: null, manifestFailed: false, loading: {}, failed: {} },
  };

  // Per-block context overrides.  Each key is "${bookId}-${chapterNum}".
  // When a block has an entry here, its value overrides the global
  // contextEnabled for that block alone.  The global toggle clears this
  // map so that every block returns to following the global flag.
  const blockContextOverrides = new Map();

  // LXX alignment pilot state (declared before init() runs so render() can read
  // it; the pilot itself stays off and loads nothing until the checkbox ticks).
  const alignmentState = {
    enabled: false,
    status: 'idle',        // idle | loading | ready | error
    resolver: null,
    generation: 0,
    callbacks: [],
  };
  const ALIGNMENT_MAP_URL = 'data/lxx-swete-alignment.js?v=stage2b-20261007';
  const ALIGNMENT_SCHEMES_URL = 'data/versification-schemes.js?v=stage2b-20261007';
  const ALIGNMENT_NOTICE_DEFAULT =
    'Canon view only. AI-proposed correspondences for Genesis 1-5 (plus boundary Genesis 6:1) awaiting human review; the Greek is read from the native Swete text and is never guessed.';
  // Source units already rendered in the current comparison view, keyed by
  // source ref. A single source spanning two targets is shown in full once per
  // view; later visible targets get a short shared-source reference instead.
  const alignmentRenderedSources = new Set();

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
    parser = new ReferenceParser(canon, locale, selectedTranslationData);
    refs.language.value = startLocale;

    populateBooks();
    populateTranslationCheckboxes();
    populateParallelControls();
    updateReferenceHint();

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

    refs.viewMode.addEventListener('change', () => {
        setMessage('');
        // Leaving (or re-entering) the view supersedes any pending native
        // reference navigation.
        cancelLxxReference();
        updateReferenceHint();
        render({ scrollToReference: false });
    });

    refs.lxxBook.addEventListener('change', () => {
        cancelLxxReference();
        render({ scrollToReference: false });
    });

    refs.lxxChapter.addEventListener('change', () => {
        cancelLxxReference();
        render({ scrollToReference: false });
    });

    // Independent parallel-pane navigation: each control re-renders only its
    // own pane, so moving one pane can never move the other.
    refs.parallelLxxBook.addEventListener('change', () => {
        renderParallelLxxPane();
    });

    refs.parallelLxxChapter.addEventListener('change', () => {
        renderParallelLxxPane();
    });

    refs.parallelTranslation.addEventListener('change', () => {
        const t = TRANSLATIONS.find((x) => x.id === refs.parallelTranslation.value);
        // The pane's chapter extent depends on its own translation, so rebuild
        // the Chapter list before rendering (e.g. VULC gains Esther 11-16).
        populateParallelChapters();
        if (t && !loaded.has(t.id)) loadTranslation(t, () => renderParallelTranslationPane());
        else renderParallelTranslationPane();
    });

    refs.parallelBook.addEventListener('change', () => {
        populateParallelChapters();
        renderParallelTranslationPane();
    });

    refs.parallelChapter.addEventListener('change', () => {
        renderParallelTranslationPane();
    });

    refs.prevChapter.addEventListener('click', () => {
        goToAdjacentChapter(-1);
    });

    refs.nextChapter.addEventListener('click', () => {
        goToAdjacentChapter(1);
    });

    refs.referenceGo.addEventListener('click', () => {

        // The standalone LXX view navigates its own native numbering directly
        // (one book/chapter, optionally one printed verse) and stays in the LXX
        // view. Canon and Parallel keep the previous canon-only behaviour below,
        // so invoking the reference box from Parallel still returns to Canon.
        if (refs.viewMode.value === 'lxx') {
            handleLxxReference();
            return;
        }

        refs.viewMode.value = 'canon';

        let groups;

        try {
            groups = parser.parseMulti(refs.reference.value);
        } catch (error) {
            // Invalid input still switches the visible panes to Canon: the
            // selector already changed, so the DOM must follow it.
            render({ scrollToReference: false });
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

    refs.hebrewScript.addEventListener('change', () => {
        if (!refs.hebrewScript.querySelector('input:checked')) {
          refs.hebrewScript.querySelector('input[value="square"]').checked = true;
        }
        try { localStorage.setItem('maranatha-hebrew-scripts', JSON.stringify(selectedHebrewScripts())); } catch (error) {}
        syncHebrewScriptNote();
        render({ scrollToReference: false });
    });
    document.addEventListener('click', event => {
        if (!refs.hebrewScript.contains(event.target)) refs.hebrewScript.open = false;
    });
    refs.hebrewScript.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          refs.hebrewScript.open = false;
          refs.hebrewScript.querySelector('summary').focus();
          event.preventDefault();
        }
    });

    refs.layout.addEventListener('change', () => {
        render({ scrollToReference: false });
    });

    refs.alignmentPilot.addEventListener('change', () => {
        alignmentState.enabled = refs.alignmentPilot.checked;
        // Any in-flight load from a previous tick is superseded: the callback
        // below only activates the column if this is still the latest request,
        // the option is still checked, and the reader is still in Canon view.
        const generation = (alignmentState.generation += 1);
        if (!alignmentState.enabled) {
            render({ scrollToReference: false });
            return;
        }
        setMessage('Loading the LXX alignment pilot\u2026');
        loadAlignmentPilot(() => {
            if (!alignmentState.enabled
                || alignmentState.generation !== generation
                || refs.viewMode.value !== 'canon') return;
            setMessage('');
            render({ scrollToReference: false });
        });
    });

    refs.interlinear.addEventListener('change', () => {
        // Byzantine and Berean are two alternative Greek-text interlinears;
        // selecting one releases the other so state never mixes. Hebrew is
        // independent.
        if (refs.interlinear.checked && refs.interlinearBerean.checked) {
            refs.interlinearBerean.checked = false;
            syncInterlinearModeVisibility(INTERLINEARS.berean);
            onInterlinearToggle(INTERLINEARS.berean, false);
        }
        syncInterlinearModeVisibility(INTERLINEARS.greek);
        onInterlinearToggle(INTERLINEARS.greek, refs.interlinear.checked);
    });

    refs.interlinearGreekMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.greek, refs.interlinearGreekMode.value);
    });

    refs.interlinearHe.addEventListener('change', () => {
        // OSHB Hebrew and Berean Hebrew are alternative Hebrew-text
        // interlinears; selecting one releases the other.
        if (refs.interlinearHe.checked && refs.interlinearBereanHe.checked) {
            refs.interlinearBereanHe.checked = false;
            syncInterlinearModeVisibility(INTERLINEARS.bereanHebrew);
            onInterlinearToggle(INTERLINEARS.bereanHebrew, false);
        }
        syncInterlinearModeVisibility(INTERLINEARS.hebrew);
        onInterlinearToggle(INTERLINEARS.hebrew, refs.interlinearHe.checked);
    });

    refs.interlinearHeMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.hebrew, refs.interlinearHeMode.value);
    });

    refs.interlinearBereanHe.addEventListener('change', () => {
        if (refs.interlinearBereanHe.checked && refs.interlinearHe.checked) {
            refs.interlinearHe.checked = false;
            syncInterlinearModeVisibility(INTERLINEARS.hebrew);
            onInterlinearToggle(INTERLINEARS.hebrew, false);
        }
        syncInterlinearModeVisibility(INTERLINEARS.bereanHebrew);
        onInterlinearToggle(INTERLINEARS.bereanHebrew, refs.interlinearBereanHe.checked);
    });

    refs.interlinearBereanHeMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.bereanHebrew, refs.interlinearBereanHeMode.value);
    });

    refs.interlinearBerean.addEventListener('change', () => {
        if (refs.interlinearBerean.checked && refs.interlinear.checked) {
            refs.interlinear.checked = false;
            syncInterlinearModeVisibility(INTERLINEARS.greek);
            onInterlinearToggle(INTERLINEARS.greek, false);
        }
        syncInterlinearModeVisibility(INTERLINEARS.berean);
        onInterlinearToggle(INTERLINEARS.berean, refs.interlinearBerean.checked);
        if (refs.interlinearBerean.checked) warmBereanOfflineCache();
    });

    refs.interlinearBereanMode.addEventListener('change', () => {
        setInterlinearMode(INTERLINEARS.berean, refs.interlinearBereanMode.value);
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
    try {
        const saved = localStorage.getItem('maranatha-hebrew-scripts');
        const legacy = localStorage.getItem('maranatha-hebrew-script');
        const scripts = saved ? JSON.parse(saved) : [legacy || 'square'];
        if (Array.isArray(scripts) && scripts.some(script => ['square', 'paleo', 'proto'].includes(script))) {
          refs.hebrewScript.querySelectorAll('input').forEach(box => { box.checked = scripts.includes(box.value); });
        }
    } catch (error) {} // file:// storage can be unavailable; session toggle still works.
    syncHebrewScriptNote();
    restoreInterlinearMode(INTERLINEARS.greek);
    restoreInterlinearMode(INTERLINEARS.hebrew);
    restoreInterlinearMode(INTERLINEARS.berean);
    restoreInterlinearMode(INTERLINEARS.bereanHebrew);
    syncInterlinearModeVisibility(INTERLINEARS.greek);
    syncInterlinearModeVisibility(INTERLINEARS.hebrew);
    syncInterlinearModeVisibility(INTERLINEARS.berean);
    syncInterlinearModeVisibility(INTERLINEARS.bereanHebrew);

    // Service-worker hooks for opt-in Berean offline caching. Guarded so that
    // file:// (and browsers without service workers) make no SW calls.
    if (serviceWorkerSupported()) {
      navigator.serviceWorker.addEventListener('message', onServiceWorkerMessage);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (interlinearState.berean.enabled && !bereanCorpusWarmed) warmBereanOfflineCache();
      });
    }

    render();
}

  function setTheme() { document.documentElement.dataset.theme = refs.theme.value; }

  function setReading() { document.documentElement.dataset.reading = refs.reading.value; }

  function setFontSize() { document.documentElement.dataset.fontsize = refs.fontsize.value; }

  function selectedHebrewScripts() {
    return [...refs.hebrewScript.querySelectorAll('input:checked')].map(box => box.value);
  }

  function primaryHebrewScript() { return selectedHebrewScripts()[0] || 'square'; }

  function displayTranslations(translations) {
    return translations.flatMap(t => t.id === 'he'
      ? selectedHebrewScripts().map(scriptMode => ({
          ...t, scriptMode,
          label: `${t.label} — ${scriptMode === 'square' ? 'Square Hebrew' : scriptMode === 'paleo' ? 'Paleo-Hebrew' : 'Proto-Sinaitic (approx.)'}`,
        }))
      : [t]);
  }

  function syncHebrewScriptNote() {
    const scripts = selectedHebrewScripts();
    const proto = scripts.includes('proto');
    const labels = { square: 'Square Hebrew', paleo: 'Paleo-Hebrew — Noto', proto: 'Proto-Sinaitic (approx.)' };
    q('#hebrew-script-summary').textContent = scripts.length === 1 ? labels[scripts[0]] : `${scripts.length} selected`;
    q('#hebrew-script-summary').setAttribute('aria-label', `Hebrew scripts: ${q('#hebrew-script-summary').textContent}`);
    refs.hebrewScript.querySelectorAll('input').forEach(box => { box.disabled = scripts.length === 1 && box.checked; });
    refs.hebrewScriptNote.hidden = scripts.length === 1 && scripts[0] === 'square';
    if (refs.hebrewScriptNote.hidden) refs.hebrewScriptNote.open = false;
    q('#hebrew-script-description').textContent = proto
      ? 'A visual approximation using the Culmus Proto Canaanite font, inspired mainly by Sinai inscriptions. This is not a scholarly reconstruction of an ancient manuscript or its language. Existing WLC/OSHB consonants are shown with early-looking letterforms; vowel points and cantillation are hidden, and final letter forms are merged. Source wording is unchanged. Copied text uses the same character encoding as the Paleo display. Search accepts square Hebrew or copied display text; interlinear tools retain square Hebrew.'
      : 'A visual approximation using the Noto Sans Phoenician font, not a scholarly reconstruction of an ancient manuscript. Existing WLC/OSHB consonants are displayed in Paleo-Hebrew letterforms; vowel points and cantillation are hidden, and final letter forms are merged. The source text is unchanged. Search accepts either script; interlinear tools retain square Hebrew.';
    q('#hebrew-script-source').hidden = !proto;
  }

  function verseDisplayText(text, translationId, scriptMode = primaryHebrewScript()) {
    return translationId === 'he' && ['paleo', 'proto'].includes(scriptMode)
      ? window.MARANATHA_HEBREW_SCRIPT.toPaleo(text) : text;
  }

  function styleHebrewVerse(element, scriptMode = primaryHebrewScript()) {
    element.dir = 'rtl';
    element.lang = scriptMode === 'paleo' ? 'hbo-Phnx' : 'he';
    element.classList.add('hebrew-verse');
    element.classList.toggle('paleo-hebrew', scriptMode === 'paleo');
    element.classList.toggle('proto-sinaitic', scriptMode === 'proto');
  }

  // Hebrew-language styling for translations that are Hebrew text but are NOT
  // the OSHB OT: they always stay square Hebrew and are never affected by the
  // OT Paleo/Proto display-script choice above. Both Delitzsch editions use this.
  function styleHebrewLanguageVerse(element) {
    element.dir = 'rtl';
    element.lang = 'he';
    element.classList.add('hebrew-verse');
  }

  // Latin-language styling for translations that are Latin text (the
  // Clementine Vulgate). Left-to-right, tagged lang="la" so the browser picks a
  // suitable Latin/Scripture face, using the existing appearance only.
  function styleLatinLanguageVerse(element) {
    element.dir = 'ltr';
    element.lang = 'la';
    element.classList.add('latin-verse');
  }

  // Japanese-language styling for the Bungo-yaku. Left-to-right, tagged
  // lang="ja" so the browser applies CJK line breaking and a Japanese-capable
  // system font fallback. No webfont or CDN is required.
  function styleJapaneseLanguageVerse(element) {
    element.dir = 'ltr';
    element.lang = 'ja';
    element.classList.add('japanese-verse');
  }

  // The declared language of a loaded translation, used to route search
  // normalization and verse styling.
  function translationLanguage(translationId) {
    const data = (window.MARANATHA_TRANSLATIONS || {})[translationId];
    return (data && data.language) || null;
  }

  function styleByTranslationLanguage(element, translationId) {
    if (isSquareHebrew(translationId)) { styleHebrewLanguageVerse(element); return; }
    const language = translationLanguage(translationId);
    if (language === 'la') styleLatinLanguageVerse(element);
    else if (language === 'ja') {
      styleJapaneseLanguageVerse(element);
      if (translationId === 'otb-ja') element.classList.add('otb-ja-verse');
    }
    else if (language === 'zh-Hant') {
      element.dir = 'ltr';
      element.lang = 'zh-Hant';
      element.classList.add('chinese-verse');
    }
    else if (language === 'id') {
      element.dir = 'ltr';
      element.lang = 'id';
      element.classList.add('indonesian-verse');
    }
    else if (language === 'syr') {
      element.lang = 'syr'; element.dir = 'rtl';
      element.classList.add('syriac-verse');
    }
    else if (language === 'ms') {
      element.lang = 'ms'; element.dir = 'ltr';
      element.classList.add('malay-verse');
      element.style.whiteSpace = 'pre-wrap';
    }
    else if (language === 'vi') {
      element.lang = 'vi'; element.dir = 'ltr';
      element.classList.add('vietnamese-verse');
      element.style.whiteSpace = 'pre-wrap';
    }
    else if (language === 'tl') {
      element.lang = 'tl';
      element.dir = 'ltr';
      element.classList.add('filipino-verse');
      element.style.whiteSpace = 'pre-wrap';
    }
    else if (language === 'th') {
      element.dir = 'ltr';
      element.lang = 'th';
      element.classList.add('thai-verse');
    }
  }

  function isSquareHebrew(id) { return id === 'delitzsch' || id === 'delitzsch1901'; }

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

  // Interlinear display mode, shared by all interlinears: the two mode names
  // are 'read' and 'study'. Which card style each name maps to is declared per
  // interlinear via `config.disclosureByMode` (true = expandable disclosure
  // card, false = dense card). Byzantine/Hebrew use read=disclosure,
  // study=dense; Berean inverts the two. Preference is persisted like the other
  // settings and defaults to 'read'. A newly added interlinear opts in by
  // setting `disclosureByMode` and the toggle/mode element refs on its config.
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
    parser = new ReferenceParser(canon, locale, selectedTranslationData);
    refs.language.value = entry.id;
    try { localStorage.setItem('maranatha-locale', entry.id); } catch (error) {}
    populateBooks();
    // The parallel view's Book control is a separate select, so it must be
    // rebuilt in the new locale as well — otherwise its menu stays in the old
    // language. Preserve the pane's chosen book/chapter; the chosen translation
    // and the independent LXX navigation are not touched.
    const parallelBook = refs.parallelBook.value;
    populateBookSelect(refs.parallelBook);
    if (canon.books.some((b) => b.id === parallelBook)) refs.parallelBook.value = parallelBook;
    const parallelChapter = refs.parallelChapter.value;
    if ([...refs.parallelChapter.options].some((o) => o.value === parallelChapter)) {
      refs.parallelChapter.value = parallelChapter;
    }
    render();
  }

  // Fills any <select> with the canon books, grouped by testament. Shared by
  // the canon Book control and the independent Book control in the parallel
  // translation pane so both stay in sync with the canon and locale.
  function populateBookSelect(select) {
    select.innerHTML = '';
    let currentTestament = null;
    for (const book of canon.books) {
      if (book.testament !== currentTestament) {
        currentTestament = book.testament;
        const group = document.createElement('optgroup');
        const testamentName = locale.testaments && locale.testaments[currentTestament];
        group.label = testamentName || (currentTestament === 'OT' ? 'Old Testament' : 'New Testament');
        group.dataset.testament = currentTestament;
        select.appendChild(group);
      }
      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = (locale.books[book.id] && locale.books[book.id].name) || book.id;
      select.lastElementChild.appendChild(opt);
    }
  }

  function populateBooks() {
    populateBookSelect(refs.book);
  }

  // The parallel view's translation pane is entirely independent of the canon
  // translation checkboxes: it offers every registered translation (including
  // Hebrew and both Delitzsch editions) through its own dropdown, and its own
  // Book/Chapter pair. Nothing here mutates the canon selection/state.
  function populateParallelControls() {
    refs.parallelTranslation.innerHTML = '';
    for (const t of TRANSLATIONS) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      refs.parallelTranslation.appendChild(opt);
    }
    refs.parallelTranslation.value = 'web';
    populateBookSelect(refs.parallelBook);
    populateParallelChapters();
  }

  function populateParallelChapters() {
    const book = canon.books.find((b) => b.id === refs.parallelBook.value) || canon.books[0];
    // The Parallel translation pane is independent of the main selection, so
    // its chapter extent follows its own chosen translation (e.g. Clementine
    // Esther 11-16 while VULC is the pane's translation).
    populateChapterSelect(refs.parallelChapter, book, [refs.parallelTranslation.value]);
  }

  function translationGroup(groupId) {
    return TRANSLATION_GROUPS.find(g => g.id === groupId) || null;
  }

  function defaultEditionFor(groupId) {
    const group = translationGroup(groupId);
    return group ? group.defaultEdition : null;
  }

  function activeEditionId(groupId) {
    return groupEditions.get(groupId) || defaultEditionFor(groupId);
  }

  function activeEditionEntry(groupId) {
    return TRANSLATIONS.find(t => t.id === activeEditionId(groupId)) || null;
  }

  // Renders one standalone translation checkbox (unchanged behaviour), with its
  // optional "Under audit" and "Source" disclosures.
  function appendTranslationOption(t, i) {
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
    if (t.description) {
      const disclosure = document.createElement('details');
      disclosure.className = 'translation-source';
      const summary = document.createElement('summary');
      summary.textContent = 'Source';
      const note = document.createElement('p');
      note.textContent = t.description;
      disclosure.append(summary, note);
      option.append(disclosure);
    }
    refs.translations.appendChild(option);
    if (box.checked) loadTranslation(t, render);
  }

  // Renders the grouped control: ONE checkbox plus an edition dropdown and the
  // active edition's Source disclosure. The two editions remain distinct
  // translations underneath; only the control is merged. The dropdown is a
  // real <select> associated with a <label>, so it is keyboard accessible even
  // while the checkbox is unchecked.
  function appendTranslationGroup(groupId, memberIndex) {
    const group = translationGroup(groupId);
    const option = document.createElement('div');
    option.className = 'translation-option translation-group';
    option.dataset.translationGroup = groupId;

    const label = document.createElement('label');
    label.className = 'version';
    label.htmlFor = `translation-group-${groupId}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.id = `translation-group-${groupId}`;
    box.value = groupId;
    box.dataset.translationGroup = groupId;
    box.checked = memberIndex === 0 && !activeEditionEntry(groupId).note;
    label.append(box, ' ', group.label);

    const editionLabel = document.createElement('label');
    editionLabel.className = 'edition-label';
    editionLabel.htmlFor = `edition-${groupId}`;
    editionLabel.textContent = 'Edition';
    const select = document.createElement('select');
    select.id = `edition-${groupId}`;
    select.className = 'edition-select';
    select.dataset.translationGroup = groupId;
    for (const ed of group.editions) {
      const opt = document.createElement('option');
      opt.value = ed.id;
      opt.textContent = ed.label;
      select.appendChild(opt);
    }

    const details = document.createElement('details');
    details.className = 'translation-source';
    const summary = document.createElement('summary');
    summary.textContent = 'Source';
    const note = document.createElement('p');
    details.append(summary, note);

    // Reflect the chosen edition in both the dropdown and the Source text,
    // whether or not the group is checked.
    const syncEditionUI = () => {
      const id = activeEditionId(groupId);
      select.value = id;
      const t = TRANSLATIONS.find(x => x.id === id);
      note.textContent = (t && t.description) || '';
    };

    box.addEventListener('change', () => {
      if (box.checked) loadTranslation(activeEditionEntry(groupId), () => render({ scrollToReference: false }));
      else render({ scrollToReference: false });
    });

    select.addEventListener('change', () => {
      const previous = activeEditionId(groupId);
      const next = select.value;
      groupEditions.set(groupId, next);
      syncEditionUI();
      // While unchecked, choosing an edition must NOT select or load anything.
      if (!box.checked) return;
      const t = TRANSLATIONS.find(x => x.id === next);
      if (!t) return;
      loadTranslation(t, () => {
        // If the active search was running in the edition we just left, re-run
        // it in the newly active edition so search state follows the edition.
        if (viewState.mode === 'search' && viewState.search && viewState.search.translationId === previous
          && window.MARANATHA_TRANSLATIONS && window.MARANATHA_TRANSLATIONS[next]) {
          const { matches, total } = searchVerses(window.MARANATHA_TRANSLATIONS[next], viewState.search.query);
          viewState.search = { ...viewState.search, translationId: next, translationLabel: t.label, matches, total };
        }
        render({ scrollToReference: false });
        // Keep the "Search in" selector pointing at the translation that
        // actually produced the visible results.
        if (viewState.mode === 'search') refs.searchTranslation.value = viewState.search.translationId;
      });
    });

    option.append(label, editionLabel, select, details);
    refs.translations.appendChild(option);
    syncEditionUI();
    if (box.checked) loadTranslation(activeEditionEntry(groupId), render);
  }

  function populateTranslationCheckboxes() {
    refs.translations.innerHTML = '';
    groupEditions.clear();
    for (const g of TRANSLATION_GROUPS) groupEditions.set(g.id, g.defaultEdition);
    const renderedGroups = new Set();
    TRANSLATIONS.forEach((t, i) => {
      if (t.group) {
        if (renderedGroups.has(t.group)) return;
        renderedGroups.add(t.group);
        appendTranslationGroup(t.group, i);
        return;
      }
      appendTranslationOption(t, i);
    });
  }

  function selectedTranslations() {
    return [...refs.translations.querySelectorAll('input[type="checkbox"]:checked')]
      .map(box => {
        // A grouped control contributes exactly one translation: its active
        // edition. Standalone checkboxes resolve directly by value.
        const groupId = box.dataset.translationGroup;
        const id = groupId ? activeEditionId(groupId) : box.value;
        return TRANSLATIONS.find(t => t.id === id);
      })
      .filter(Boolean);
  }

  // The datasets the reference parser may validate against.
  //
  // A native-numbered edition (the Clementine Vulgate) contributes its
  // references ONLY while it is selected, and while any native edition is in
  // play the parser validates strictly against the current selection — so a
  // stale, deselected native edition can never extend a reference range, and
  // when only the Vulgate is selected a previously loaded canon edition cannot
  // silently keep a reference valid. When no native edition is loaded at all,
  // the historical behaviour (every loaded translation, selected or not) is
  // preserved.
  function selectedTranslationData() {
    const all = window.MARANATHA_TRANSLATIONS || {};
    const selected = selectedTranslations();
    const selectedIds = new Set(selected.map(t => t.id));
    const anyNativeLoaded = Object.values(all).some(d => d && d.nativeVersification);
    const nativeInPlay = anyNativeLoaded || selected.some(t => isNativeVersification(t) || all[t.id]?.nativeReferenceScope);
    const out = {};
    for (const [id, data] of Object.entries(all)) {
      const isNative = !!(data && data.nativeVersification);
      if (isNative && !selectedIds.has(id)) continue;
      if (nativeInPlay && !selectedIds.has(id)) continue;
      out[id] = data;
    }
    return out;
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

  function populateChapterSelect(select, book, translationIds = selectedTranslationIds()) {
    if (!book) return;
    const previous = select.dataset.bookId === book.id ? select.value : '';
    select.dataset.bookId = book.id;
    select.innerHTML = '';
    // Canon extent extended by any loaded native translation in scope (e.g.
    // Clementine Esther 11-16). The current selection is preserved when still
    // valid, so a lazy load cannot move the reader off their chapter.
    const count = effectiveChapterCount(book.id, translationIds);
    for (let i = 1; i <= count; i += 1) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `Chapter ${i}`;
      select.appendChild(opt);
    }
    if ([...select.options].some(o => o.value === previous)) select.value = previous;
  }

  function populateChapters() {
    populateChapterSelect(refs.chapter, currentBook());
  }

  // Rebuilds the canon Chapter selector when the effective chapter count for
  // the current book changes (for example after the Clementine Vulgate's data
  // finishes loading and Esther gains chapters 11-16). Cheap no-op otherwise.
  function refreshChapterOptions() {
    const book = currentBook();
    if (!book) return;
    const count = effectiveChapterCount(book.id);
    if (refs.chapter.options.length !== count) populateChapterSelect(refs.chapter, book);
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
    const chapterCount = effectiveChapterCount(book.id);

    if (targetChapter >= 1 && targetChapter <= chapterCount) {
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
    refs.chapter.value = direction > 0 ? '1' : String(effectiveChapterCount(targetBook.id));
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
  function chapterExtent(bookId, chapterNum) {
    const numbers = VerseAvailability.references(canon, window.MARANATHA_TRANSLATIONS, bookId, chapterNum);
    return numbers.size ? Math.max(...numbers) : 0;
  }

  // A translation may declare nativeVersification in its data (e.g. the Latin
  // Clementine Vulgate). Such a translation keeps its own numbering in EVERY
  // chapter and is never row-aligned with another translation: equal verse
  // numbers are not evidence of equivalent text, and equal verse counts are not
  // evidence of correspondence either.
  function isNativeVersification(t) {
    return !!(t && (window.MARANATHA_TRANSLATIONS || {})[t.id]?.nativeVersification);
  }

  function hasReferenceComparisonException(t, bookId, chapterNum) {
    return !!(t && (window.MARANATHA_TRANSLATIONS || {})[t.id]?.versification?.[bookId]?.[chapterNum]?.comparisonUnavailable);
  }

  // Edge cases for translations that declare an edition-specific versification
  // for a chapter (e.g. the vocalized Delitzsch 1901) or a whole-translation
  // native numbering (e.g. the Clementine Vulgate). These are deliberately NOT
  // row-aligned with canon-numbered translations; they are rendered in their own
  // block under their own (source) verse numbers with a visible notice, so equal
  // row positions are never mistaken for equivalent verses.
  function versificationEntry(t, bookId, chapterNum) {
    const datasets = window.MARANATHA_TRANSLATIONS || {};
    const declared = datasets[t.id]?.versification?.[bookId]?.[chapterNum];
    if (declared) return declared;
    if (datasets[t.id]?.nativeVersification) {
      const arr = datasets[t.id].books?.[bookId]?.[chapterNum - 1];
      if (!Array.isArray(arr)) return null;
      const canonBook = canon.books.find(b => b.id === bookId);
      return {
        source: arr.length,
        canon: (canonBook && canonBook.chapters[chapterNum - 1]) || 0,
        native: true,
        note: 'This translation keeps its own native verse numbering; equal verse numbers are not a verified correspondence with other translations.',
      };
    }
    return null;
  }

  function selectedTranslationIds() {
    return selectedTranslations().map(t => t.id);
  }

  // Number of chapters actually shown for a book: the canon extent, extended by
  // any loaded translation in `translationIds` that carries native extra
  // chapters (e.g. Clementine Esther 11-16). Never rewrites canon.js. The
  // caller supplies the ids so the independent Parallel pane can reflect its
  // own chosen translation rather than the main selection.
  function effectiveChapterCount(bookId, translationIds = selectedTranslationIds()) {
    const all = window.MARANATHA_TRANSLATIONS || {};
    const canonBook = canon.books.find(b => b.id === bookId);
    // A sole edition that declares nativeReferenceScope owns its own chapter
    // extent: the Bungo-yaku's Daniel genuinely ends at chapter 12 rather than
    // inheriting the provisional Catholic navigation skeleton. A mixed
    // selection keeps the canon/maximum extent, so existing mixed-view
    // navigation (including the Clementine Vulgate's extra chapters) is intact.
    if (translationIds.length === 1) {
      const data = all[translationIds[0]];
      const arr = data && data.books && data.books[bookId];
      if (data && data.nativeReferenceScope && Array.isArray(arr)) return arr.length;
    }
    let count = canonBook ? canonBook.chapters.length : 0;
    for (const id of translationIds) {
      const arr = all[id]?.books?.[bookId];
      if (Array.isArray(arr) && arr.length > count) count = arr.length;
    }
    return count;
  }

  function extentForTranslations(translations, bookId, chapterNum) {
    const datasets = window.MARANATHA_TRANSLATIONS || {};
    const subset = {};
    for (const t of translations) {
      if (datasets[t.id]) subset[t.id] = datasets[t.id];
    }
    const numbers = VerseAvailability.references(canon, subset, bookId, chapterNum);
    return numbers.size ? Math.max(...numbers) : 0;
  }

  function partitionByVersification(translations, bookId, chapterNum) {
    const aligned = [];
    const mismatched = [];
    for (const t of translations) {
      (versificationEntry(t, bookId, chapterNum) ? mismatched : aligned).push(t);
    }
    return { aligned, mismatched };
  }

  // One block for the aligned (row-comparable) translations, then one block per
  // mismatched translation. Keeping mismatched editions apart prevents a second
  // independently-numbered edition from being silently aligned with the first.
  function buildVersificationBlocks(aligned, mismatched) {
    const blocks = [];
    if (aligned.length) blocks.push(aligned);
    for (const t of mismatched) blocks.push([t]);
    return blocks.length ? blocks : [[]];
  }

  function cellFor(t, bookId, chapterNum, verseNum) {
    // The virtual LXX-alignment column resolves through the mapping resolver,
    // never through a translation global, so no fabricated books[] dataset is
    // ever added and legacy index lookup is never called on it.
    if (t.virtual) {
      const resolver = alignmentResolver();
      return resolver ? resolver.resolveTarget(bookId, chapterNum, verseNum) : { state: 'loading' };
    }
    if (!loaded.has(t.id)) return { state: 'loading' };
    const cell = VerseAvailability.cell(window.MARANATHA_TRANSLATIONS[t.id], bookId, chapterNum, verseNum);
    if (!['text', 'additional', 'note'].includes(cell.state)) {
      cell.availableIn = Object.entries(window.MARANATHA_TRANSLATIONS).filter(([id, data]) => {
        if (id === t.id) return false;
        const other = VerseAvailability.cell(data, bookId, chapterNum, verseNum);
        return ['text', 'additional', 'note'].includes(other.state);
      }).map(([id, data]) => TRANSLATIONS.find(t => t.id === id)?.label || data.label || id);
    }
    return cell;
  }

  // Renders one virtual aligned cell. Greek text, labels and flags come from
  // the native Swete dataset verbatim. The user's explicit Genesis 1:6/7
  // presentation choice shows each native verse once with a boundary notice;
  // the underlying collective proposal stays unchanged. Other groups retain
  // their complete membership; this is not a general ordinal-matching rule.
  function fillVirtualCell(td, cell) {
    td.classList.add('aligned-cell');
    if (cell.state === 'correspondence') {
      td.classList.add('aligned-correspondence');
      if (cell.collective) td.classList.add('aligned-collective');
      let displayedMembers = cell.members || [];
      const target = cell.requestedTarget;
      let verseRows = false;
      if (cell.groupId === 'GEN1-6-7' && target && target.book === 'GEN'
          && Number(target.chapter) === 1 && [6, 7].includes(Number(target.verse))) {
        const member = displayedMembers.find((m) => m.source.book === 'GEN'
          && String(m.source.chapter) === '1' && m.source.kind === 'verse'
          && m.source.label === String(target.verse));
        if (member) { displayedMembers = [member]; verseRows = true; }
      }
      // A single source unit spanning two canonical targets (GEN 3:1 / GEN 6:1)
      // is rendered in full once per comparison view; a later visible target
      // shows only a short reference to it. No Greek is split or duplicated.
      let sharedReference = null;
      if (cell.spanning && displayedMembers.length === 1) {
        const member = displayedMembers[0];
        const sk = [member.source.book, String(member.source.chapter), member.source.kind,
          member.source.kind === 'unnumbered' ? String(member.source.segmentIndex) : String(member.source.label)].join('|');
        if (alignmentRenderedSources.has(sk)) { sharedReference = member; displayedMembers = []; }
        else alignmentRenderedSources.add(sk);
      }
      for (const member of displayedMembers) {
        const row = document.createElement('span');
        row.className = 'aligned-source';
        const ref = document.createElement('span');
        ref.className = 'aligned-source-ref';
        ref.textContent = member.refLabel;
        const text = document.createElement('span');
        text.className = 'lxx-text';
        text.lang = 'el';
        text.textContent = member.text || '';
        row.append(ref, document.createTextNode(' '), text);
        for (const flag of member.flags || []) {
          const marker = document.createElement('span');
          marker.className = 'lxx-flag';
          marker.textContent = '\u25C6';
          marker.title = flag.note;
          marker.setAttribute('role', 'img');
          marker.setAttribute('aria-label', flag.note);
          row.append(marker);
        }
        td.append(row);
      }
      if (sharedReference) {
        const row = document.createElement('span');
        row.className = 'aligned-source aligned-shared-reference';
        const ref = document.createElement('span');
        ref.className = 'aligned-source-ref';
        ref.textContent = sharedReference.refLabel;
        const shared = document.createElement('span');
        shared.className = 'aligned-shared-note';
        shared.textContent = 'Complete Greek source shown once in this view; this row shares it.';
        row.append(ref, document.createTextNode(' '), shared);
        td.append(row);
      }
      const note = document.createElement('small');
      note.className = 'verse-source-note aligned-note';
      note.setAttribute('role', 'note');
      const presentationNote = cell.presentation && cell.presentation.note ? cell.presentation.note : '';
      note.textContent = verseRows
        ? '“And it was so” ends Greek 6; English/Hebrew place it in 7.'
        : sharedReference
        ? `Greek ${sharedReference.refLabel} shown once above; this row shares it.`
        : presentationNote
        ? presentationNote
        : cell.collective
        ? `Proposed collective passage (${cell.groupId}); boundaries differ \u2014 not a word-for-word or exact verse-boundary match.`
        : `Proposed correspondence (${cell.groupId}); awaiting human review.`;
      td.append(note);
      return;
    }
    td.classList.add('verse-placeholder');
    td.textContent = cell.state === 'alignment-unavailable' ? '(alignment not available)'
      : cell.state === 'no-corresponding-verse' ? '(no corresponding verse)'
      : cell.state === 'missing-source-text' ? '(source text not loaded)'
      : cell.state === 'missing-edition' ? '(not available in this edition)'
      : cell.state === 'ambiguous-metadata' ? '(alignment metadata is ambiguous)'
      : '(loading\u2026)';
    const note = document.createElement('small');
    note.className = 'verse-source-note';
    note.setAttribute('role', 'note');
    note.textContent = cell.state === 'alignment-unavailable'
      ? 'No proposal for this reference in the Genesis 1-5 pilot.'
      : cell.state === 'missing-edition'
        ? 'The Swete Septuagint source does not cover this book.'
        : cell.state === 'missing-source-text'
          ? 'The native source segment could not be read.'
          : cell.state === 'ambiguous-metadata'
            ? 'The alignment metadata for this reference conflicts; no correspondence is shown.'
            : cell.state === 'no-corresponding-verse'
              ? (cell.note || '')
              : '';
    td.append(note);
  }

  function fillCell(td, cell, tId, scriptMode) {
    if (tId === 'lxx-aligned') {
      fillVirtualCell(td, cell);
      return;
    }
    if (cell.state === 'text' || cell.state === 'additional' || cell.state === 'note') {
      td.textContent = verseDisplayText(cell.text || '', tId, scriptMode);
      if (cell.placeholder) td.classList.add('verse-source-placeholder');
      if (cell.state !== 'text' || cell.note) {
        const note = document.createElement('small');
        note.className = 'verse-source-note';
        note.setAttribute('role', 'note');
        note.textContent = [cell.state === 'additional' ? 'Additional verse in this translation.'
          : cell.state === 'note' ? 'Included in a source note.' : '', cell.note].filter(Boolean).join(' ');
        td.appendChild(note);
      }
      if (tId === 'he') {
        styleHebrewVerse(td, scriptMode);
      } else if (tId === 'byz') {
        td.lang = 'el';
        td.classList.add('greek-verse');
      } else {
        styleByTranslationLanguage(td, tId);
      }
    } else {
      if (cell.state === 'source-gap') {
        // A declared source gap: a factual placeholder, never omitted Scripture
        // and never text copied from another slot.
        td.classList.add('verse-placeholder', 'verse-source-gap');
        td.textContent = '(no separately indexed text)';
        const note = document.createElement('small');
        note.className = 'verse-source-note';
        note.setAttribute('role', 'note');
        note.textContent = [cell.note, cell.context].filter(Boolean).join(' ');
        td.appendChild(note);
        if (cell.availableIn?.length) {
          const other = document.createElement('small');
          other.className = 'verse-source-note';
          other.textContent = `Available in loaded translations: ${cell.availableIn.join(', ')}.`;
          td.appendChild(other);
        }
        return;
      }
      td.className = 'verse-placeholder';
      td.textContent = cell.state === 'loading' ? '(loading…)'
        : cell.state === 'missing-book' ? '(not available in this translation)'
        : cell.state === 'omitted' ? '(omitted in this translation)'
        : '(verse not available in this translation)';
      if (cell.note || cell.availableIn?.length) {
        const note = document.createElement('small');
        note.className = 'verse-source-note';
        note.setAttribute('role', 'note');
        note.textContent = [cell.note, cell.availableIn?.length
          ? `Available in loaded translations: ${cell.availableIn.join(', ')}.` : ''].filter(Boolean).join(' ');
        td.appendChild(note);
      }
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
  // A native source unit may span several numbered positions. Collapse its
  // members to the source start, including a query for a member alone; show the
  // complete labelled unit once and never infer a split in its Scripture text.
  function nativeReadingUnits(bookId, chapterNum, verses, translations, exactVerses) {
    if (translations.length !== 1) return { verses, exactVerses };
    const data = (window.MARANATHA_TRANSLATIONS || {})[translations[0].id];
    if (!data?.verseMetadata?.[bookId]?.[chapterNum]) return { verses, exactVerses };
    const metadata = data.verseMetadata?.[bookId]?.[chapterNum] || {};
    const startFor = v => metadata[v]?.combinedInto || v;
    return {
      verses: [...new Set(verses.map(startFor))].sort((a, b) => a - b),
      exactVerses: exactVerses ? new Set([...exactVerses].map(startFor)) : null,
    };
  }

  function sourceVerseLabel(bookId, chapterNum, verse, translations) {
    if (translations.length === 1) {
      const data = (window.MARANATHA_TRANSLATIONS || {})[translations[0].id];
      const label = data?.verseMetadata?.[bookId]?.[chapterNum]?.[verse]?.sourceLabel;
      if (label) return `${chapterNum}:${label}`;
    }
    return `${chapterNum}:${verse}`;
  }

  function multiColumn(bookId, chapterNum, verses, translations, { highlight = false, anchorFirst = false, exactVerses = null } = {}) {
    ({ verses, exactVerses } = nativeReadingUnits(bookId, chapterNum, verses, translations, exactVerses));
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
      ref.textContent = sourceVerseLabel(bookId, chapterNum, v, translations);
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
        fillCell(td, cellFor(t, bookId, chapterNum, v), t.id, t.scriptMode);
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
    ({ verses, exactVerses } = nativeReadingUnits(bookId, chapterNum, verses, translations, exactVerses));
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
        ref.textContent = sourceVerseLabel(bookId, chapterNum, v, [t]);
        const label = document.createElement('td');
        label.className = 'translation-label';
        label.textContent = t.label;
        const td = document.createElement('td');
        fillCell(td, cellFor(t, bookId, chapterNum, v), t.id, t.scriptMode);
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
    ({ verses, exactVerses } = nativeReadingUnits(bookId, chapterNum, verses, translations, exactVerses));
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
      ref.textContent = sourceVerseLabel(bookId, chapterNum, v, translations);
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
        fillCell(text, cellFor(t, bookId, chapterNum, v), t.id, t.scriptMode);
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
  function appendResultBlock({ bookId, chapterNum, name, verseCount, verses, translations, layout, highlight, anchorFirst, exactVerses = null, showContext = false, showContextToggle = false, versificationDisclosure = false }) {
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

    // Edition annotations remain available below the passage without placing
    // a chapter's headings and footnotes between its title and first verse.
    let sourceDetails = null;
    const annotationContainer = (translation) => {
      if (translation.id !== 'cuv-traditional' && !(window.MARANATHA_TRANSLATIONS || {})[translation.id]?.collapseSourceAnnotations) return refs.results;
      if (!sourceDetails) {
        sourceDetails = document.createElement('details');
        sourceDetails.className = 'passage-source-details';
        const summary = document.createElement('summary');
        summary.textContent = translations.length === 1 ? `${translation.short || translation.label} notes and edition details` : 'Source notes and edition details';
        sourceDetails.appendChild(summary);
      }
      return sourceDetails;
    };

    // Keep the Latin disclosure after its passage so independent parallel
    // reading panes begin at the same height.
    const trailingNotices = [];
    if (versificationDisclosure) {
      for (const t of translations) {
        const v = versificationEntry(t, bookId, chapterNum);
        if (!v) continue;
        const notice = document.createElement('p');
        notice.className = 'notice versification-notice';
        notice.setAttribute('role', 'note');
        notice.textContent = v.native
          ? `${t.label} is shown in its own native verse numbering (${v.source} verses in this chapter of the source edition); it is not aligned row-for-row with any other translation, and equal verse numbers are not a verified correspondence.`
          : `${t.label} uses a different verse numbering in this chapter (${v.source} verses; canon.js expects ${v.canon}). ${v.note} Its verses below are numbered as in the source edition and are not aligned row-for-row with canon-numbered translations.`;
        if (t.id === 'vulc') trailingNotices.push(notice);
        else annotationContainer(t).appendChild(notice);
      }
    }

    // Source headings (Psalm superscriptions) are preserved from the source
    // module and rendered separately before the verses; they are never merged
    // into the verse text, and their status as source-indexed headings is
    // disclosed.
    for (const t of translations) {
      const data = (window.MARANATHA_TRANSLATIONS || {})[t.id];
      const provenance = data?.bookProvenance?.[bookId];
      if (provenance?.note) {
        const note = document.createElement('p');
        note.className = 'source-note book-provenance-note'; note.lang = 'en'; note.dir = 'ltr';
        note.setAttribute('role', 'note');
        note.textContent = `Edition provenance (${t.short || t.label}): ${provenance.note}`;
        annotationContainer(t).appendChild(note);
      }
      const headings = [
        ...(data?.psalmHeadings?.[bookId]?.[chapterNum] || []),
        ...(data?.sourceHeadings?.[bookId]?.[chapterNum] || []),
      ];
      for (const heading of headings) {
        const el = document.createElement('p');
        el.className = 'source-heading';
        el.setAttribute('role', 'note');
        const text = document.createElement('span');
        text.className = 'source-heading-text';
        if (data.language) text.lang = data.language;
        text.textContent = heading.text;
        const note = document.createElement('small');
        note.className = 'source-heading-note';
        note.textContent = heading.type && heading.type !== 'superscription'
          ? `Source ${heading.type === 'section-reference' ? 'parallel reference' : heading.type === 'speaker' ? 'speaker heading' : 'section heading'} (${t.short || t.label}; ${heading.withinVerse ? `within ${chapterNum}:${heading.withinVerse}` : heading.afterVerse ? `after ${chapterNum}:${heading.afterVerse}` : `before ${chapterNum}:1`}); shown separately from Scripture.`
          : `Source superscription (${t.short || t.label}); shown separately from the verse text.`;
        el.append(text, document.createTextNode(' '), note);
        annotationContainer(t).appendChild(el);
      }
    }

    // Unnumbered source notes (the New-Testament variant notes) are rendered as
    // source notes OUTSIDE Scripture: they are never inserted into a verse, a
    // reading block or copied Bible text, and they are never numbered.
    for (const t of translations) {
      const data = (window.MARANATHA_TRANSLATIONS || {})[t.id];
      const notes = data && data.sourceNotes && data.sourceNotes[bookId] && data.sourceNotes[bookId][chapterNum];
      if (!notes) continue;
      for (const entry of notes) {
        const el = document.createElement('p');
        el.className = 'source-note';
        el.setAttribute('role', 'note');
        const text = document.createElement('span');
        text.className = 'source-note-text';
        if (data.language) text.lang = data.language;
        text.textContent = entry.text;
        const note = document.createElement('small');
        note.className = 'source-note-label';
        note.textContent = entry.type === 'unnumbered-source'
          ? `Unnumbered source text (${t.short || t.label}); retained separately without assigning a verse number.`
          : `Source note (${t.short || t.label}${entry.reference ? `; ${entry.reference}` : ''}) \u2014 not Scripture; shown separately.`;
        el.append(text, document.createTextNode(' '), note);
        annotationContainer(t).appendChild(el);
      }
    }

    const content = layout === 'multicolumn'
      ? multiColumn(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses })
      : layout === 'multirow'
        ? multiRow(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses })
        : mobileReading(bookId, chapterNum, verses, translations, { highlight, anchorFirst, exactVerses });
    refs.results.appendChild(content);
    refs.results.append(...trailingNotices);
    if (sourceDetails) refs.results.appendChild(sourceDetails);
  }

  function renderBrowseChapter(translations, layout) {
    const book = currentBook();
    if (!book) return;
    const chapterNum = Number(refs.chapter.value);
    const verseCount = chapterExtent(book.id, chapterNum);
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

    // Aligned translations share one row-for-row block. Each mismatched
    // translation gets its OWN block: two mismatched editions must never be
    // placed in the same table, where equal row positions would falsely imply
    // correspondence (e.g. Vulgata Clementina beside Delitzsch 1901).
    const { aligned, mismatched } = partitionByVersification(translations, book.id, chapterNum);
    const blocks = buildVersificationBlocks(aligned, mismatched);
    for (const group of blocks) {
      const groupVerseCount = extentForTranslations(group, book.id, chapterNum);
      appendResultBlock({
        bookId: book.id,
        chapterNum,
        name,
        verseCount: groupVerseCount,
        verses: Array.from({ length: groupVerseCount }, (_, i) => i + 1),
        translations: group,
        layout,
        highlight: !!highlightSet,
        anchorFirst: !!highlightSet,
        exactVerses: highlightSet,
        versificationDisclosure: mismatched.some(t => group.includes(t)),
      });
    }

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
      const { aligned, mismatched } = partitionByVersification(translations, book.id, group.chapter);
      const blocks = buildVersificationBlocks(aligned, mismatched);

      const blockKey = `${book.id}-${group.chapter}`;
      const effectiveContext = blockContext(blockKey);

      blocks.forEach((subset, blockIndex) => {
        const verseCount = extentForTranslations(subset, book.id, group.chapter);
        const exactVerses = versesForGroup(group, verseCount);
        const exactSet = new Set(exactVerses);

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
          translations: subset,
          layout,
          highlight: true,
          anchorFirst: index === 0 && blockIndex === 0,
          exactVerses: exactSet,
          showContext: effectiveContext,
          showContextToggle: true,
          versificationDisclosure: mismatched.some(t => subset.includes(t)),
        });
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

  function isGraphemeSearchLanguage(language) {
    return language === 'ja' || language === 'zh-Hant' || language === 'zh-Hans' || language === 'th' || language === 'vi' || language === 'syr';
  }

  // Language-aware normalization. Hebrew/Paleo, Greek and Latin keep their
  // existing NFD + combining-mark stripping (identical to before). Japanese
  // uses NFC only, so a precomposed kana is one unit: querying か can no longer
  // match inside が, ば/ぱ no longer match は, and precomposed/decomposed input
  // for the SAME character still matches. No width/kana/NFKC folding is added,
  // and the stored Scripture is never changed.
  function normalizeSearchText(text, language) {
    if (language === 'syr') return String(text).normalize('NFC').replace(/[\u0730-\u074A]/g, '');
    if (language === 'vi') return String(text).normalize('NFC').toLowerCase();
    if (language === 'th') return String(text).replace(/[\u200B\r\n]/g, '').normalize('NFC');
    if (isGraphemeSearchLanguage(language)) return String(text).normalize('NFC');
    let out = '';
    // Paleo-Hebrew has no separate final forms. Normalize both scripts to
    // the same consonants so copied Paleo text can find the source spelling.
    const square = window.MARANATHA_HEBREW_SCRIPT.toSquare(text)
      .replace(/[ךםןףץ]/g, ch => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' })[ch])
      .replace(/\u05BE/g, ' ');
    for (const ch of square) {
      out += ch.normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g, '').toLowerCase();
    }
    return out;
  }

  // Iterates code points with their UTF-16 index (surrogate safe).
  function codePointsWithIndex(text) {
    const out = [];
    for (let i = 0; i < text.length;) {
      const ch = String.fromCodePoint(text.codePointAt(i));
      out.push({ ch, index: i });
      i += ch.length;
    }
    return out;
  }

  // Japanese search form: segment the original text into grapheme clusters
  // (a base code point plus following combining marks/variation selectors) and
  // NFC each whole cluster. This keeps voicing marks attached and makes a match
  // map back to exact original start/end offsets, so copy/highlighting never
  // cuts a supplementary character or variation selector in half.
  function buildGraphemeSearchForm(text, language) {
    if (language === 'th' && typeof Intl.Segmenter === 'function') {
      let filtered = '';
      const starts = [], originalEnds = [];
      for (const { ch, index } of codePointsWithIndex(text)) {
        if (ch === '\u200B' || ch === '\r' || ch === '\n') continue;
        filtered += ch;
        for (let k = 0; k < ch.length; k++) { starts.push(index); originalEnds.push(index + ch.length); }
      }
      let form = '';
      const map = [], ends = [];
      for (const part of new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(filtered)) {
        const start = starts[part.index], end = originalEnds[part.index + part.segment.length - 1];
        const normalized = part.segment.normalize('NFC');
        form += normalized;
        for (let k = 0; k < normalized.length; k++) { map.push(start); ends.push(end); }
      }
      return { form, map, ends };
    }
    let form = '';
    const map = [];
    const ends = [];
    let clusterStart = 0;
    let clusterEnd = 0;
    let clusterText = '';
    const flush = () => {
      if (!clusterText) return;
      for (const ch of normalizeSearchText(clusterText, language)) {
        for (let k = 0; k < ch.length; k++) { form += ch[k]; map.push(clusterStart); ends.push(clusterEnd); }
      }
      clusterText = '';
    };
    for (const { ch, index } of codePointsWithIndex(text)) {
      if (language === 'th' && (ch === '\u200B' || ch === '\r' || ch === '\n')) continue;
      const isMark = /\p{M}/u.test(ch) || (language === 'th' && ch === '\u0E33');
      if (isMark && clusterText) {
        clusterText += ch;
        clusterEnd = index + ch.length;
      } else {
        flush();
        clusterStart = index;
        clusterEnd = index + ch.length;
        clusterText = ch;
      }
    }
    flush();
    return { form, map, ends };
  }

  // Normalized form plus a map from each normalized character back to its
  // index in the original text, so a match can be highlighted in the original
  // (diacritics intact).
  function buildSearchForm(text, language) {
    if (isGraphemeSearchLanguage(language)) return buildGraphemeSearchForm(text, language);
    let form = '';
    const map = [];
    for (let i = 0; i < text.length; i++) {
      const kept = normalizeSearchText(text[i]);
      for (let k = 0; k < kept.length; k++) {
        form += kept[k];
        map.push(i);
      }
    }
    return { form, map };
  }

  function searchVerses(data, query) {
    const language = data && data.language;
    const needle = normalizeSearchText(query, language);
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
          if (text && normalizeSearchText(text, language).includes(needle)) {
            matches.push({ bookId: book.id, chapter: ci + 1, verse: vi + 1, text });
          }
        }
      }
    }
    return { matches, total: matches.length };
  }

  // Appends `text` to `container`, wrapping each occurrence of `query` in
  // <mark>. Uses text nodes only (never innerHTML), so user input is safe.
  function appendHighlighted(container, text, query, translationId, scriptMode) {
    const display = (part) => verseDisplayText(part, translationId, scriptMode);
    const language = translationLanguage(translationId);
    const needle = normalizeSearchText(query, language);
    const { form, map, ends } = buildSearchForm(text, language);
    let from = 0;
    let lastEnd = 0;
    let found = false;
    while (needle) {
      const idx = form.indexOf(needle, from);
      if (idx === -1) break;
      const start = map[idx];
      let end;
      if (ends) {
        // Japanese: the grapheme cluster's exact original end.
        end = ends[idx + needle.length - 1];
      } else {
        end = map[idx + needle.length - 1] + 1;
        // A matched base letter may carry trailing combining marks (e.g. Hebrew
        // niqqud). Keep them inside the highlight rather than orphaning them in
        // the following text node. Shared by every translation's highlighting.
        while (end < text.length && /\p{M}/u.test(text[end])) end++;
      }
      if (!(start < end) || start < lastEnd) { from = idx + needle.length; continue; }
      container.appendChild(document.createTextNode(display(text.slice(lastEnd, start))));
      const mark = document.createElement('mark');
      mark.textContent = display(text.slice(start, end));
      container.appendChild(mark);
      lastEnd = end;
      found = true;
      from = idx + needle.length;
    }
    if (!found) {
      container.textContent = display(text);
      return;
    }
    container.appendChild(document.createTextNode(display(text.slice(lastEnd))));
  }

  const SEARCH_RESULT_CAP = 300;

  function performSearch() {
    // Text search is canon-only (it indexes canon-numbered translations):
    // invoking it from the LXX or parallel view returns to the canon view.
    // This happens before the empty/error returns too, and the view is
    // re-rendered so the visible panes always match the selector.
    refs.viewMode.value = 'canon';
    const query = refs.search.value.trim();
    if (!query) {
      render({ scrollToReference: false });
      setMessage('Enter a word or phrase to search for.');
      return;
    }
    populateSearchTranslations();
    const t = TRANSLATIONS.find(x => x.id === refs.searchTranslation.value);
    const data = t && window.MARANATHA_TRANSLATIONS[t.id];
    if (!t || !data) {
      render({ scrollToReference: false });
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
      ref.textContent = `${bookName} ${sourceVerseLabel(m.bookId, m.chapter, m.verse, [{ id: s.translationId }])}`;

      hit.append(ref);
      const scriptModes = s.translationId === 'he' ? selectedHebrewScripts() : [undefined];
      for (const scriptMode of scriptModes) {
        const body = document.createElement('span');
        body.className = 'search-text';
        if (s.translationId === 'he') styleHebrewVerse(body, scriptMode);
        else styleByTranslationLanguage(body, s.translationId);
        if (scriptModes.length > 1) {
          const label = document.createElement('small');
          label.className = 'mobile-translation-label';
          label.textContent = scriptMode === 'square' ? 'Square Hebrew' : scriptMode === 'paleo' ? 'Paleo-Hebrew' : 'Proto-Sinaitic (approx.)';
          hit.append(label);
        }
        appendHighlighted(body, m.text, s.query, s.translationId, scriptMode);
        hit.append(body);
        const sourceCell = VerseAvailability.cell(window.MARANATHA_TRANSLATIONS[s.translationId], m.bookId, m.chapter, m.verse);
        if (sourceCell.placeholder && sourceCell.note) {
          const note = document.createElement('small');
          note.className = 'verse-source-note';
          note.setAttribute('role', 'note');
          note.textContent = sourceCell.note;
          hit.append(note);
        }
      }

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

    const others = displayTranslations(selectedTranslations()).filter((t) =>
      t.id !== excludeId && loaded.has(t.id) && window.MARANATHA_TRANSLATIONS[t.id]);

    // Every native-numbered edition (the Clementine Vulgate and the Bungo-yaku)
    // keeps its own verse numbering. Presenting a same-numbered verse from a
    // different edition as an aligned comparison would assert a correspondence
    // that has not been established — in either direction — so all cross-edition
    // alignment involving a native edition is suppressed and replaced with a
    // visible native-numbering notice. This applies equally whether the search
    // itself ran in a native edition or in a canon-numbered one.
    const excludedNative = isNativeVersification({ id: excludeId }) || hasReferenceComparisonException({ id: excludeId }, match.bookId, match.chapter);
    const nativeOthers = others.filter((t) => isNativeVersification(t) || hasReferenceComparisonException(t, match.bookId, match.chapter));
    if (excludedNative || nativeOthers.length) {
      const names = [
        ...(excludedNative ? [excludeId] : []),
        ...nativeOthers.map((t) => t.id),
      ].map((id) => (TRANSLATIONS.find((x) => x.id === id) || {}).label || id);
      const label = names.join(', ');
      const notice = document.createElement('p');
      notice.className = 'notice versification-notice compare-native-notice';
      notice.setAttribute('role', 'note');
      const passageException = hasReferenceComparisonException({ id: excludeId }, match.bookId, match.chapter)
        || nativeOthers.some(t => hasReferenceComparisonException(t, match.bookId, match.chapter));
      notice.textContent = passageException
        ? `${label} is read independently in this passage because of source content-placement differences. No same-numbered comparison is shown.`
        : names.length === 1
          ? `${label} is shown in its own native verse numbering. Same-numbered verses in another translation are not a verified correspondence, so no aligned comparison is shown.`
          : `${label} are shown in their own native verse numbering. Same-numbered verses in another translation are not a verified correspondence, so no aligned comparison is shown.`;
      panel.appendChild(notice);
      if (excludedNative) return panel;
    }

    for (const t of others) {
      // A native-numbered edition is never shown as a same-numbered verse
      // beside another edition; the notice above explains why.
      if (isNativeVersification(t) || hasReferenceComparisonException(t, match.bookId, match.chapter)) continue;
      const row = document.createElement('div');
      row.className = 'compare-row';

      const label = document.createElement('span');
      label.className = 'compare-label';
      label.textContent = t.label;

      const text = document.createElement('span');
      text.className = 'compare-text';
      const data = window.MARANATHA_TRANSLATIONS[t.id];
      // Use the shared availability semantics, not a raw array read, so a
      // note-only source reference (e.g. 3 John 1:15 in Delitzsch) is shown as
      // its note rather than as missing or as ordinary main text.
      const cell = VerseAvailability.cell(data, match.bookId, match.chapter, match.verse);
      const verseText = cell.state === 'text' || cell.state === 'additional' || cell.state === 'note'
        ? (cell.text || '') : '';

      if (verseText) {
        if (t.id === 'he') {
          styleHebrewVerse(text, t.scriptMode);
        } else if (t.id === 'byz') {
          text.lang = 'el';
          text.classList.add('greek-verse');
        } else {
          styleByTranslationLanguage(text, t.id);
        }
        appendHighlighted(text, verseText, query, t.id, t.scriptMode);
        if (cell.state === 'note') {
          const note = document.createElement('small');
          note.className = 'verse-source-note';
          note.setAttribute('role', 'note');
          note.textContent = ['Included in a source note.', cell.note].filter(Boolean).join(' ');
          text.appendChild(note);
        }
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
    if (config.perBook) {
      // Per-book interlinears load lazily inside render(), based on the book
      // actually on screen, so switching books loads only what is needed. A
      // declared manifest loads first (tiny); the optional shared dictionary
      // loads independently and rerenders on success.
      ensureManifest(config, () => {
        loadOptionalInterlinearData(config);
        render();
      });
    } else if (state.status === 'loaded') {
      // A previous enable may have finished before the optional pilot data
      // arrived (or failed). Retry it, then render with whatever is present.
      loadOptionalInterlinearData(config);
      render();
    } else if (state.status !== 'loading') {
      setMessage(`Loading ${config.loadingLabel} interlinear\u2026`);
      loadInterlinearData(config, () => {
        render();
      });
    }
  }

  // Loads one per-book chunk (data/berean/<BOOK>.js). Dedupes concurrent
  // requests for the same book and records failures so the UI can retry.
  function ensureInterlinearBook(config, bookId, onDone) {
    const state = interlinearState[config.key];
    const global = config.chunkGlobal(bookId);
    if (window[global]) { onDone(null); return; }
    if (state.failed[bookId]) { onDone(new Error(bookId)); return; }
    if (state.loading[bookId]) { state.loading[bookId].push(onDone); return; }
    state.loading[bookId] = [onDone];
    const script = document.createElement('script');
    script.src = config.chunkSrc(bookId);
    script.onload = () => {
      const callbacks = state.loading[bookId] || [];
      delete state.loading[bookId];
      if (window[global]) {
        callbacks.forEach((cb) => cb(null));
      } else {
        // Loaded but did not publish the expected global: treat as malformed.
        state.failed[bookId] = true;
        callbacks.forEach((cb) => cb(new Error(bookId)));
      }
    };
    script.onerror = () => {
      const callbacks = state.loading[bookId] || [];
      delete state.loading[bookId];
      state.failed[bookId] = true;
      callbacks.forEach((cb) => cb(new Error(bookId)));
    };
    document.head.appendChild(script);
  }

  function ensureInterlinearBooks(config, bookIds, onSettled) {
    const unique = [...new Set(bookIds)];
    if (!unique.length) { onSettled([]); return; }
    let remaining = unique.length;
    const failed = [];
    unique.forEach((id) => ensureInterlinearBook(config, id, (error) => {
      if (error) failed.push(id);
      if (--remaining === 0) onSettled(failed);
    }));
  }

  // Loads a per-book interlinear's manifest once, if it declares one. A failure
  // is non-fatal and recorded so render() can fall back to the static
  // coveredBooks list; nothing else is affected.
  function ensureManifest(config, onDone) {
    const state = interlinearState[config.key];
    if (!config.manifestSrc || !config.manifestGlobal || window[config.manifestGlobal]) { onDone(); return; }
    if (state.manifestFailed) { onDone(); return; }
    if (state.manifestLoading) { state.manifestLoading.push(onDone); return; }
    state.manifestLoading = [onDone];
    const script = document.createElement('script');
    script.src = config.manifestSrc;
    const settle = () => {
      const callbacks = state.manifestLoading || [];
      state.manifestLoading = null;
      if (!window[config.manifestGlobal]) state.manifestFailed = true;
      callbacks.forEach((cb) => cb());
    };
    script.onload = settle;
    script.onerror = settle;
    document.head.appendChild(script);
  }

  // Books that the current render actually needs from a per-book interlinear.
  // For reference mode that is every requested book; for browse mode the
  // current book. Only books matching the interlinear's testament are loaded,
  // so selecting Berean on an OT book shows its "NT only" message instead of
  // trying to fetch a nonexistent chunk.
  function interlinearBookIds(config) {
    let ids = viewState.mode === 'reference'
      ? [...new Set(viewState.groups.map((group) => group.bookId))]
      : [currentBook().id];
    if (config.testament) {
      ids = ids.filter((id) => {
        const book = canon.books.find((b) => b.id === id);
        return book && book.testament === config.testament;
      });
    }
    return ids;
  }

  // Non-destructive error card for a per-book interlinear whose chunk failed.
  function renderInterlinearError(config, bookIds) {
    const wrap = document.createElement('div');
    wrap.className = 'interlinear-error';
    const note = document.createElement('p');
    note.className = 'empty';
    note.textContent = `Could not load ${config.label} data${bookIds.length ? ` for ${bookIds.join(', ')}` : ''}. The rest of the reader is unaffected.`;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'primary-action';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => {
      for (const id of bookIds) delete interlinearState[config.key].failed[id];
      render();
    });
    wrap.append(note, retry);
    refs.results.appendChild(wrap);
  }

  // -----------------------------------------------------------------------
  // Berean offline cache warm-up
  //
  // Opt-in only (never an install-time payload). It waits for
  // navigator.serviceWorker.ready, can use the ready registration's active
  // worker when there is no controller yet, and only marks the corpus warmed
  // after all 27 books are confirmed cached. Failures are retryable and never
  // permanently suppress a later attempt. No-op under file://.
  // -----------------------------------------------------------------------
  let bereanCorpusWarmed = false;   // true only after all books succeed
  let bereanCacheInFlight = false;
  let bereanCacheRequestSeq = 0;
  const pendingBereanCache = new Map();

  // Service workers are unavailable under file:// (the browser does not expose
  // navigator.serviceWorker there), so this is false for the desktop workflow
  // and no service-worker call is ever made. It is true only when a real
  // serviceWorker API with a ready promise exists.
  function serviceWorkerSupported() {
    return typeof navigator !== 'undefined'
      && !!navigator.serviceWorker
      && typeof navigator.serviceWorker.ready !== 'undefined';
  }

  function setBereanCacheStatus(text, kind, retryable) {
    const el = refs.bereanCacheStatus;
    if (!el) return;
    el.textContent = text;
    el.dataset.state = kind || 'info';
    if (retryable && !bereanCorpusWarmed) {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'berean-cache-retry';
      retry.textContent = 'Retry';
      retry.addEventListener('click', () => {
        bereanCorpusWarmed = false;
        warmBereanOfflineCache();
      });
      el.append(' ', retry);
    }
  }

  function requestBereanCache(worker, books) {
    return new Promise((resolve) => {
      const requestId = `berean-${++bereanCacheRequestSeq}`;
      const timer = setTimeout(() => {
        pendingBereanCache.delete(requestId);
        resolve({ cached: [], failed: books });
      }, 60000);
      pendingBereanCache.set(requestId, (message) => {
        clearTimeout(timer);
        pendingBereanCache.delete(requestId);
        resolve(message);
      });
      worker.postMessage({ type: 'CACHE_BEREAN', books, requestId });
    });
  }

  function onServiceWorkerMessage(event) {
    const data = event.data;
    if (!data || data.type !== 'BEREAN_CACHE_RESULT') return;
    const resolve = pendingBereanCache.get(data.requestId);
    if (resolve) resolve(data);
  }

  async function warmBereanOfflineCache() {
    if (!serviceWorkerSupported()) return;
    if (bereanCorpusWarmed || bereanCacheInFlight) return;
    bereanCacheInFlight = true;
    setBereanCacheStatus('Caching Berean for offline use\u2026');
    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = navigator.serviceWorker.controller || registration.active;
      if (!worker) {
        setBereanCacheStatus('Berean offline caching is not available yet.', 'warn', true);
        return;
      }
      const books = canon.books.filter((b) => b.testament === 'NT').map((b) => b.id);
      const result = await requestBereanCache(worker, books);
      const cached = result.cached || [];
      const failed = result.failed || [];
      if (!failed.length && books.length && cached.length === books.length) {
        bereanCorpusWarmed = true;
        setBereanCacheStatus(`Berean NT available offline (${cached.length}/${books.length} books).`, 'ok');
      } else {
        setBereanCacheStatus(`Berean offline caching incomplete (${cached.length}/${books.length} books).`, 'warn', true);
      }
    } catch (error) {
      setBereanCacheStatus('Berean offline caching failed. The interlinear still works.', 'warn', true);
    } finally {
      bereanCacheInFlight = false;
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
          // Kick off the optional layer only after the required data is in
          // place, so a slow/failed optional file cannot delay or block the
          // interlinear. Its onload rerenders if the view is still active.
          loadOptionalInterlinearData(config);
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

  // Loads optional interlinear data (e.g. candidate reading glosses). Unlike
  // loadInterlinearData(), a failure here is non-fatal: the required Greek
  // text and Strong's data already rendered, and every card falls back to the
  // existing Strong's-derived gloss. If an optional script loads later, the
  // active interlinear is rerendered so the candidates appear without a manual
  // refresh.
  function loadOptionalInterlinearData(config) {
    const state = interlinearState[config.key];
    const optional = config.optionalDataSources || [];
    if (!optional.length || state.optionalLoading) return;
    const pending = optional.filter((opt) => !(opt.global && window[opt.global]));
    if (!pending.length) return;
    state.optionalLoading = true;
    let remaining = pending.length;
    let anyLoaded = false;
    const settle = () => {
      if (--remaining > 0) return;
      state.optionalLoading = false;
      const ready = state.status === 'loaded' || config.perBook;
      if (anyLoaded && state.enabled && ready) render();
    };
    for (const opt of pending) {
      const script = document.createElement('script');
      script.src = opt.src;
      script.onload = () => { anyLoaded = true; settle(); };
      script.onerror = () => {
        // Optional and non-fatal: keep the fallback glosses.
        console.warn(`Optional interlinear data unavailable: ${opt.src}`);
        settle();
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
  function buildDisclosureWord(config, surface, strongs, morph, definition, rendering, detailId, override) {
    // `override` is optional { transliteration, gloss, label }. It is used by
    // the Byzantine candidate-gloss layer, by Berean's own word records, and by
    // the Berean Hebrew pilot (which also passes glossStatus / strongsList /
    // variant / sourceRef). When present it wins over the algorithmic
    // transliteration and the Strong's-derived gloss. An intentional-empty
    // gloss is gloss === '' (shown deliberately blank); a pilot missing gloss
    // is gloss === null with glossStatus 'missing', shown as explicitly absent
    // and NEVER falling back to Strong's prose. `config.transliterate` may be
    // null for Berean Hebrew, in which case the source transliteration is used.
    const translitText = (override && override.transliteration)
      ? override.transliteration
      : (config.transliterate ? config.transliterate(surface) : '');
    const glossText = override ? override.gloss : shortGloss(definition, strongs, morph);
    const glossStatus = override && override.glossStatus;
    const strongsList = override && Array.isArray(override.strongsList)
      ? override.strongsList
      : (strongs ? [strongs] : []);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'iw iw-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', detailId);

    const surfaceSpan = document.createElement('span');
    surfaceSpan.className = config.surfaceClass;
    if (config.lang) surfaceSpan.lang = config.lang;
    if (config.isolateLtr) surfaceSpan.dir = 'rtl';
    surfaceSpan.textContent = surface;

    const translit = document.createElement('span');
    translit.className = 'iw-translit';
    if (config.isolateLtr) translit.dir = 'ltr';
    translit.textContent = translitText;

    const shortGlossEl = document.createElement('span');
    shortGlossEl.className = 'iw-gloss-short';
    if (config.isolateLtr) shortGlossEl.dir = 'ltr';
    shortGlossEl.textContent = glossText;

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
    if (config.isolateLtr) headingWord.dir = 'rtl';
    headingWord.textContent = surface;
    heading.append(headingWord, ` \u00b7 ${translitText}`);
    detail.appendChild(heading);

    const rows = [];
    if (override) {
      let readingValue;
      if (glossStatus === 'missing') readingValue = '(no gloss in source)';
      else if (glossText === '' || glossText === null || glossText === undefined) readingValue = '(intentionally untranslated)';
      else readingValue = glossText;
      rows.push([override.label || 'Reading gloss', readingValue]);
    }
    if (definition) rows.push(['Definition', definition]);
    if (rendering) rows.push(['KJV', rendering]);
    if (strongsList.length) rows.push(['Strong\u2019s', strongsList.map((s) => config.strongsPrefix + s).join(' \u00b7 ')]);
    if (morph) rows.push(['Morphology', morph]);
    if (override && override.sourceRef) rows.push(['Source', override.sourceRef]);
    if (config.provenanceNote) rows.push(['Provenance', config.provenanceNote]);
    const dl = document.createElement('dl');
    dl.className = 'iw-detail-list';
    for (const [term, value] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dt, dd);
    }
    // Written/read variant: the exact annotated OSHB Ketiv and Qere forms are
    // rendered as isolated RTL spans (so mixed Hebrew in an English sentence
    // reads correctly) and clearly labelled as an OSHB comparison, NOT a field
    // supplied by Berean. Berean's own surface/alignment is never replaced.
    if (override && override.variant && override.variant.type === 'ketiv-qere') {
      const v = override.variant;
      const dt = document.createElement('dt');
      dt.textContent = 'Variant';
      const dd = document.createElement('dd');
      dd.className = 'iw-variant';
      const addText = (text) => dd.appendChild(document.createTextNode(text));
      const addHebrew = (text) => {
        const span = document.createElement('span');
        span.className = 'iw-variant-hebrew';
        span.lang = 'he';
        span.dir = 'rtl';
        span.textContent = text;
        dd.appendChild(span);
      };
      addText(`Written/read variant \u2014 ${v.provenance || 'OSHB comparison (not supplied by Berean)'}. `);
      if (v.sourceMarksVariant === false) addText('Bible Hub displays a single written (Ketiv) form and does not mark the variant. ');
      if (v.oshbKetiv) { addText('OSHB Ketiv (written): '); addHebrew(v.oshbKetiv); addText('. '); }
      if (v.oshbQere) { addText('OSHB Qere (read): '); addHebrew(v.oshbQere); addText('. '); }
      addText('Berean\u2019s surface, transliteration, gloss and alignment are unchanged; no second reading word is added.');
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
    const strongsData = config.glossGlobal ? (window[config.glossGlobal] || {}) : {};
    // `definitions` is the neutral Strong's definition (Read-mode gloss and
    // detail); `renderings` is the KJV rendering list (Study-mode card and the
    // detail panel). The `glosses` fallback keeps an older cached data file
    // working (both maps then resolve to the KJV list, as before).
    const definitions = strongsData.definitions || strongsData.glosses || {};
    const renderings = strongsData.renderings || strongsData.glosses || {};
    // Optional reviewed reading layer (Read mode only, Byzantine only). Berean
    // never consults it. Absent/cached-out data simply yields no overrides.
    const reviewed = config.reviewedGlobal ? window[config.reviewedGlobal] : null;
    // Card style is explicit per interlinear and per mode (`disclosureByMode`):
    // Byzantine/Hebrew use disclosure cards in Reading and dense cards in
    // Study; Berean inverts that. No interlinear-specific branches below.
    const disclosure = !!config.disclosureByMode
      && !!config.disclosureByMode[interlinearState[config.key].mode];
    // First selected translation, if any, supplies the verse caption.
    const translation = translations[0];

    // Per-book interlinears (Berean) resolve data per group so a multi-book
    // reference can mix books; the others use one shared global.
    const dataForBook = config.perBook
      ? (bookId) => window[config.chunkGlobal(bookId)] || null
      : () => window[config.dataGlobal] || null;

    // In reference mode (the user searched a verse/passage) restrict each
    // group to the verses actually requested, same as renderReferenceGroups()
    // does for the normal reading view, instead of always dumping the whole
    // chapter. Browse mode keeps showing the whole current chapter.
    const groups = viewState.mode === 'reference'
      ? viewState.groups
      : [{ bookId: currentBook().id, chapter: Number(refs.chapter.value), ranges: null }];

    groups.forEach(group => {
      renderInterlinearGroup(config, dataForBook(group.bookId), definitions, renderings, disclosure, translation, group, reviewed);
    });

    const note = document.createElement('p');
    note.className = 'interlinear-source';
    note.textContent = config.sourceNote;
    refs.results.appendChild(note);
  }

  // Appends the first selected translation's verse text as a caption, when
  // available. Shared by normal verse blocks and documented-omission blocks.
  function appendInterlinearCaption(block, bookId, chapterNum, verseNum, translation) {
    if (!translation) return;
    const tv = window.MARANATHA_TRANSLATIONS[translation.id];
    // Availability semantics (not a raw array read) so a note-only source
    // reference (e.g. 3 John 1:15 in Delitzsch) is shown accurately.
    const cell = VerseAvailability.cell(tv, bookId, chapterNum, verseNum);
    if (!['text', 'additional', 'note'].includes(cell.state) || !cell.text) return;
    const caption = document.createElement('div');
    caption.className = 'interlinear-caption';
    caption.dir = 'auto';
    styleByTranslationLanguage(caption, translation.id);
    caption.textContent = cell.text;
    block.appendChild(caption);
    if (cell.state === 'note') {
      const note = document.createElement('small');
      note.className = 'verse-source-note';
      note.setAttribute('role', 'note');
      note.textContent = ['Included in a source note.', cell.note].filter(Boolean).join(' ');
      block.appendChild(note);
    }
  }

  // Renders one book/chapter block of an interlinear view, optionally
  // restricted to a group's verse ranges (null ranges = whole chapter).
  function renderInterlinearGroup(config, data, definitions, renderings, disclosure, translation, group, reviewed) {
    const book = canon.books.find(b => b.id === group.bookId);
    if (!book) return;
    const chapterNum = group.chapter;
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;
    const verseCount = chapterExtent(book.id, chapterNum);
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

    let sawCoverageGap = false;
    for (let v = 0; v < verseCount; v++) {
      const verseNum = v + 1;
      if (verseFilter && !verseFilter.has(verseNum)) continue;
      const tokens = verses[v];

      // Documented source omissions (NA-omitted verses in Berean) get an
      // explicit, accessible notice instead of being silently skipped. This
      // is not a load failure and not missing application data. Only
      // interlinears that declare `omittedNotice` render these blocks.
      if (tokens === null || tokens === undefined) {
        if (config.omittedNotice) {
          const omitted = document.createElement('div');
          omitted.className = 'interlinear-verse interlinear-omission';
          const oref = document.createElement('div');
          oref.className = 'interlinear-ref';
          oref.textContent = `${name} ${chapterNum}:${verseNum}`;
          omitted.appendChild(oref);
          appendInterlinearCaption(omitted, book.id, chapterNum, verseNum, translation);
          const note = document.createElement('p');
          note.className = 'interlinear-omission-note';
          note.setAttribute('role', 'note');
          note.textContent = config.omittedNotice;
          omitted.appendChild(note);
          refs.results.appendChild(omitted);
          continue;
        }
        // Coverage-limited interlinears (the Berean Hebrew pilot) collect gaps
        // and render ONE concise coverage notice at the end, instead of a
        // notice per uncovered verse. OSHB/Berean-Greek are unaffected.
        if (config.coverageNotice) { sawCoverageGap = true; continue; }
        continue;
      }
      if (!tokens.length) continue;

      const block = document.createElement('div');
      block.className = 'interlinear-verse';

      const ref = document.createElement('div');
      ref.className = 'interlinear-ref';
      ref.textContent = `${name} ${chapterNum}:${verseNum}`;
      block.appendChild(ref);

      appendInterlinearCaption(block, book.id, chapterNum, verseNum, translation);

      const words = document.createElement('div');
      words.className = 'interlinear-words';
      if (config.rtl) words.dir = 'rtl';
      const details = disclosure ? document.createElement('div') : null;
      if (details) details.className = 'interlinear-details';
      const layout = config.token || { surface: 0, strongs: 1, morph: 2 };
      for (let t = 0; t < tokens.length; t++) {
        const raw = tokens[t];
        const surface = raw[layout.surface];
        const strongs = raw[layout.strongs];
        const morph = raw[layout.morph];
        // Berean supplies its own transliteration and contextual gloss inline;
        // Byzantine/Hebrew do not (gloss comes from Strong's / the candidate
        // layer). `tokenGloss === null` means "not provided by the data".
        const tokenTranslit = layout.translit != null ? raw[layout.translit] : '';
        const tokenGloss = layout.gloss != null ? raw[layout.gloss] : null;
        // Optional pilot fields: complete Strong's list, gloss status, and a
        // curated variant annotation. Absent for the other interlinears.
        const tokenStrongsList = layout.strongsList ? raw[layout.strongsList] : null;
        const tokenGlossStatus = layout.glossStatus ? raw[layout.glossStatus] : null;
        const tokenVariant = layout.variant ? raw[layout.variant] : null;
        const strongsList = Array.isArray(tokenStrongsList) ? tokenStrongsList : (strongs ? [strongs] : []);
        const definition = definitions[strongs] || '';
        const rendering = renderings[strongs] || '';

        let override = null;
        if (tokenGloss !== null || tokenGlossStatus === 'missing') {
          // Berean supplies its own gloss. gloss === '' is an intentional blank;
          // gloss === null with glossStatus 'missing' is an explicit source gap
          // (pilot) that must NOT fall back to dictionary prose.
          override = {
            transliteration: tokenTranslit,
            gloss: tokenGloss,
            glossStatus: tokenGlossStatus || undefined,
            strongsList: Array.isArray(tokenStrongsList) ? tokenStrongsList : undefined,
            variant: tokenVariant || undefined,
            label: config.readingGlossLabel,
          };
        } else if (reviewed) {
          const entry = reviewed.verses?.[book.id]?.[chapterNum]?.[verseNum]?.[t] || null;
          if (entry) override = { transliteration: entry[0], gloss: entry[1], label: config.readingGlossLabel };
        }
        if (config.coverageNotice && override) override.sourceRef = `${name} ${chapterNum}:${verseNum}`;

        if (disclosure) {
          const detailId = `iw-detail-${book.id}-${chapterNum}-${verseNum}-${t}`;
          const { button, detail } = buildDisclosureWord(config, surface, strongs, morph, definition, rendering, detailId, override);
          words.appendChild(button);
          details.appendChild(detail);
          continue;
        }

        // Dense card (Reading for Berean Hebrew). Berean shows its own
        // transliteration and contextual gloss; Byzantine/Hebrew keep the KJV
        // rendering list. A missing gloss is an explicit marker, never prose.
        const translitText = tokenTranslit || (config.transliterate ? config.transliterate(surface) : '');
        let glossText;
        let missingGloss = false;
        if (tokenGlossStatus === 'missing') { glossText = '\u2014'; missingGloss = true; }
        else if (tokenGloss !== null) glossText = tokenGloss; // '' = intentional blank
        else glossText = rendering;

        const card = document.createElement('span');
        card.className = 'iw';

        const surfaceSpan = document.createElement('span');
        surfaceSpan.className = config.surfaceClass;
        if (config.isolateLtr) { surfaceSpan.lang = config.lang; surfaceSpan.dir = 'rtl'; }
        surfaceSpan.textContent = surface;

        const translit = document.createElement('span');
        translit.className = 'iw-translit';
        if (config.isolateLtr) translit.dir = 'ltr';
        translit.textContent = translitText;

        const gloss = document.createElement('span');
        gloss.className = 'iw-gloss';
        if (config.isolateLtr) gloss.dir = 'ltr';
        if (missingGloss) gloss.classList.add('iw-gloss-missing');
        gloss.textContent = glossText;
        const strongsLabel = strongsList.map((s) => config.strongsPrefix + s).join(' ');
        if (missingGloss) {
          gloss.title = 'No gloss in source (Berean Hebrew draft)';
        } else {
          const glossTitle = [strongsLabel, glossText, morph].filter(Boolean).join(' \u00b7 ');
          if (glossTitle) gloss.title = glossTitle;
        }

        const meta = document.createElement('span');
        meta.className = 'iw-meta';
        meta.textContent = strongsLabel;

        card.append(surfaceSpan, translit, gloss, meta);
        words.appendChild(card);
      }
      block.appendChild(words);
      if (details) block.appendChild(details);
      refs.results.appendChild(block);
    }

    // One concise coverage notice for a chapter that is only partly covered
    // (Berean Hebrew pilot). Never rendered for OSHB or Berean Greek.
    if (sawCoverageGap) {
      const notice = document.createElement('div');
      notice.className = 'interlinear-verse interlinear-coverage';
      const note = document.createElement('p');
      note.className = 'interlinear-coverage-note';
      note.setAttribute('role', 'note');
      note.textContent = config.coverageNotice;
      notice.appendChild(note);
      refs.results.appendChild(notice);
    }
  }

  // Which interlinear, if any, should be shown for the current book. The Greek
  // interlinears (Byzantine, Berean NT) and the Hebrew interlinears (OSHB,
  // Berean Hebrew pilot) are each mutually exclusive within their group; the
  // two groups are independent, and render() picks the group matching the
  // current book's testament. When only the "wrong" testament is enabled, it is
  // still returned so the block shows its "NT/OT only" message.
  function activeInterlinear() {
    const book = currentBook();
    const isNT = !!(book && book.testament === 'NT');
    const greekChoice = interlinearState.berean.enabled
      ? INTERLINEARS.berean
      : interlinearState.greek.enabled ? INTERLINEARS.greek : null;
    const hebrewChoice = interlinearState.bereanHebrew.enabled
      ? INTERLINEARS.bereanHebrew
      : interlinearState.hebrew.enabled ? INTERLINEARS.hebrew : null;
    if (isNT) {
      if (greekChoice) return greekChoice;
      if (hebrewChoice) return hebrewChoice;
      return null;
    }
    if (hebrewChoice) return hebrewChoice;
    if (greekChoice) return greekChoice;
    return null;
  }

  // ---------------------------------------------------------------------
  // LXX view (Swete, native source numbering).
  //
  // Completely independent of canon.js and of the canon-numbered translations:
  // it renders data/lxx-swete.js in the numbering printed in the source. The
  // data file is lazy-loaded through a dynamically created <script> tag (never
  // fetch()), so the file:// constraint holds.
  // ---------------------------------------------------------------------
  let lxxLoading = false;
  // Callbacks queued while the single 7.5 MB script request is in flight. Every
  // caller is called when it finishes (or dropped on error), so a request made
  // during the initial load is never silently lost and no second script tag is
  // ever created.
  let lxxCallbacks = [];

  // ---------------------------------------------------------------------
  // LXX alignment pilot (opt-in Canon column).
  //
  // A virtual, Canon-only column that resolves each canonical cell to its
  // proposed source passage and reads the Greek from the existing native Swete
  // dataset by native label. It is OFF by default: no mapping, scheme or native
  // Greek script is requested until the checkbox is ticked. The mapping and
  // scheme files are versioned query URLs so a stale cached map can never be
  // reused. The virtual descriptor is deliberately NOT registered in
  // TRANSLATIONS, so it can never enter the Parallel translation menu or text
  // search. See docs/STAGE2A_ARCHITECTURE.md.
  // ---------------------------------------------------------------------
  function alignmentResolver() {
    if (alignmentState.resolver) return alignmentState.resolver;
    const mapping = window.MARANATHA_LXX_ALIGNMENT;
    const api = window.MARANATHA_VERSE_MAPPING;
    const native = lxxDataset();
    if (!mapping || !api || !native) return null;
    alignmentState.resolver = api.createResolver(mapping, { native });
    return alignmentState.resolver;
  }

  function alignmentEnabled() {
    return alignmentState.enabled && alignmentState.status === 'ready' && !!alignmentResolver();
  }

  function alignmentVirtualTranslation() {
    return { id: 'lxx-aligned', label: 'LXX alignment (Genesis 1-5)', short: 'LXX alignment', virtual: true };
  }

  // Warns, before reading the pilot, when a currently selected edition has no
  // Genesis 1-5 proposal coverage. Those editions are compared as unreviewed,
  // edition-specific numbering; no Greek correspondence is asserted against
  // them. The coverage set comes from the compiled scheme registry.
  function updateAlignmentNotice() {
    const note = refs.alignmentNotice;
    if (!note) return;
    if (!alignmentEnabled()) { note.textContent = ALIGNMENT_NOTICE_DEFAULT; return; }
    const registry = window.MARANATHA_VERSIFICATION_SCHEMES;
    const coverage = new Set(
      (registry && registry.comparisonCoverage && registry.comparisonCoverage.editions) || ['web', 'kjv', 'he'],
    );
    const unreviewed = displayTranslations(selectedTranslations())
      .map((t) => t.id)
      .filter((id) => id !== 'lxx-swete' && !coverage.has(id));
    note.textContent = unreviewed.length
      ? `Warning: the Genesis 1-5 pilot is compared only with WEB/KJV/OSHB. Selected edition(s) ${unreviewed.join(', ')} use unreviewed, edition-specific numbering; no Greek correspondence is asserted against them.`
      : ALIGNMENT_NOTICE_DEFAULT;
  }

  // Loads the scheme and mapping metadata exactly once, then the native Greek
  // corpus through the shared queued loader. Every caller is notified; a script
  // is never added twice while a load is in flight or already complete.
  function loadAlignmentPilot(onReady) {
    if (alignmentState.status === 'ready') { onReady(); return; }
    alignmentState.callbacks.push(onReady);
    if (alignmentState.status === 'loading') return;
    alignmentState.status = 'loading';
    alignmentState.resolver = null;
    const scripts = [ALIGNMENT_SCHEMES_URL, ALIGNMENT_MAP_URL];
    let pending = 0;
    let failed = false;
    const reportError = (src) => {
      failed = true;
      alignmentState.status = 'error';
      const callbacks = alignmentState.callbacks;
      alignmentState.callbacks = [];
      setMessage(`Could not load the LXX alignment pilot (${src}).`);
      for (const callback of callbacks) callback();
    };
    const settled = () => {
      pending -= 1;
      if (pending > 0 || failed) return;
      loadLxx(() => {
        const resolver = alignmentResolver();
        alignmentState.status = resolver ? 'ready' : 'error';
        const callbacks = alignmentState.callbacks;
        alignmentState.callbacks = [];
        if (!resolver) setMessage('Could not initialise the LXX alignment pilot.');
        for (const callback of callbacks) callback();
      });
    };
    for (const src of scripts) {
      if (src === ALIGNMENT_SCHEMES_URL && window.MARANATHA_VERSIFICATION_SCHEMES) continue;
      if (src === ALIGNMENT_MAP_URL && window.MARANATHA_LXX_ALIGNMENT) continue;
      pending += 1;
      const script = document.createElement('script');
      script.src = src;
      script.onload = settled;
      script.onerror = () => reportError(src);
      document.head.appendChild(script);
    }
    if (pending === 0) settled();
  }

  function lxxDataset() {
    return (window.MARANATHA_TRANSLATIONS && window.MARANATHA_TRANSLATIONS['lxx-swete']) || null;
  }

  function loadLxx(onReady) {
    if (lxxDataset()) { onReady(); return; }
    lxxCallbacks.push(onReady);
    if (lxxLoading) return;
    lxxLoading = true;
    const script = document.createElement('script');
    // Query-versioned URL: the service worker's DATA_CACHE uses cache.match with
    // ignoreSearch:false, so this exact URL is cached separately from the plain
    // 'data/lxx-swete.js' key. A stale unversioned copy therefore cannot satisfy
    // this request, while already-downloaded translations stay in the same data
    // cache untouched (deliberate exception to the universal data-cache bump).
    script.src = 'data/lxx-swete.js?v=disclosures-20261007';
    script.onload = () => {
      lxxLoading = false;
      const callbacks = lxxCallbacks;
      lxxCallbacks = [];
      for (const callback of callbacks) callback();
    };
    script.onerror = () => {
      lxxLoading = false;
      lxxCallbacks = [];
      setMessage('Could not load the Septuagint (Swete) data (data/lxx-swete.js).');
    };
    document.head.appendChild(script);
  }

  function populateLxxBooks(bookSelect, dataset) {
    const previous = bookSelect.value;
    bookSelect.innerHTML = '';
    for (const book of dataset.books) {
      const opt = document.createElement('option');
      opt.value = book.id;
      opt.textContent = `${book.label}${book.kind === 'component' ? ' (component)' : ''}`;
      bookSelect.appendChild(opt);
    }
    if (dataset.books.some((b) => b.id === previous)) bookSelect.value = previous;
  }

  function populateLxxChapters(chapterSelect, book) {
    const previous = chapterSelect.value;
    chapterSelect.innerHTML = '';
    for (const chapter of book.chapters) {
      const opt = document.createElement('option');
      opt.value = chapter.n;
      opt.textContent = chapter.n === 'prologue' ? 'Prologue' : `Chapter ${chapter.n}`;
      chapterSelect.appendChild(opt);
    }
    if (book.chapters.some((c) => c.n === previous)) chapterSelect.value = previous;
  }

  // ---------------------------------------------------------------------
  // Standalone native reference lookup (LXX view only).
  //
  // One reference: a book, optionally a native chapter, optionally one exact
  // native verse. It never maps to the canon. Book-name resolution reuses
  // ReferenceParser.normalizeKey and the canonical parser's book map; chapter
  // and verse labels are validated only against the native dataset, so printed
  // source labels such as Psalm 88:84 are accepted and an absent Psalm 115:6 is
  // rejected. Ranges and multiple references are refused rather than silently
  // dropped.
  // ---------------------------------------------------------------------
  const lxxReferenceState = { generation: 0 };

  function cancelLxxReference() {
    lxxReferenceState.generation += 1;
  }

  function lxxChapterLabel(chapter) {
    return chapter.n === 'prologue' ? 'Prologue' : chapter.n;
  }

  function lxxBookMap(dataset) {
    const map = new Map();
    const add = (key, book) => {
      const normalized = ReferenceParser.normalizeKey(key);
      if (normalized && !map.has(normalized)) map.set(normalized, book);
    };
    for (const book of dataset.books) {
      add(book.id, book);
      add(book.label, book);
    }
    // Existing canon book names/aliases resolve to the native book with the
    // same id (the LXX shares canon ids for the books it ships).
    for (const canonBook of canon.books) {
      const info = locale.books[canonBook.id];
      const native = dataset.books.find((b) => b.id === canonBook.id);
      if (!info || !native) continue;
      add(info.name, native);
      for (const alias of info.aliases || []) add(alias, native);
    }
    // Source components have no canon id or alias list, so name them explicitly.
    const componentAliases = {
      LJE: ['LJE', 'Letter of Jeremiah', 'Epistle of Jeremiah'],
      SUS: ['SUS', 'Susanna'],
      BEL: ['BEL', 'Bel', 'Bel and the Dragon'],
    };
    for (const [id, aliases] of Object.entries(componentAliases)) {
      const native = dataset.books.find((b) => b.id === id);
      if (!native) continue;
      for (const alias of aliases) add(alias, native);
    }
    return map;
  }

  function parseLxxReference(input, dataset) {
    const raw = String(input || '').trim();
    if (!raw) throw new Error('Enter a reference.');
    if (/[;,]/.test(raw)) {
      throw new Error('Native LXX references support one book and chapter, with at most a single verse; separate references and verse lists are not supported.');
    }
    // A numeric range ("1-2", "16:1-8", "5-") is refused explicitly.
    if (/\d\s*-\s*(?:\d|$)/.test(raw)) {
      throw new Error('Native LXX references support a single verse only; verse ranges are not supported.');
    }

    const structured = raw.match(/^(.+?)\s+(\d+|prologue)(?::\s*(.*))?$/i);
    const bookText = (structured ? structured[1] : raw).trim();
    const chapterText = structured ? structured[2] : undefined;
    const verseText = structured && structured[3] !== undefined ? structured[3].trim() : undefined;

    const book = lxxBookMap(dataset).get(ReferenceParser.normalizeKey(bookText));
    if (!book) {
      const canonBook = parser.bookMap.get(ReferenceParser.normalizeKey(bookText));
      if (canonBook) {
        const name = (locale.books[canonBook.id] && locale.books[canonBook.id].name) || bookText;
        throw new Error(`${name} is not available in the Septuagint (Swete) edition.`);
      }
      throw new Error(`"${bookText}" is not a book in the Septuagint (Swete) native numbering.`);
    }

    let chapter;
    if (chapterText === undefined) {
      // A bare book opens its first chapter that carries numbered verses.
      chapter = book.chapters.find((c) => c.segments.some((s) => s.kind === 'verse')) || book.chapters[0];
    } else {
      chapter = book.chapters.find((c) => c.n.toLowerCase() === chapterText.toLowerCase());
      if (!chapter) {
        throw new Error(`Chapter ${chapterText} is not available in ${book.label} (native LXX numbering).`);
      }
    }

    let verse;
    if (verseText !== undefined) {
      if (!/^\d+$/.test(verseText)) {
        throw new Error(`"${verseText || ':'}" is not a valid single verse number in ${book.label} ${lxxChapterLabel(chapter)}.`);
      }
      if (!chapter.segments.some((s) => s.kind === 'verse' && s.l === verseText)) {
        throw new Error(`Verse ${verseText} is not available in ${book.label} ${lxxChapterLabel(chapter)} (native LXX numbering).`);
      }
      verse = verseText;
    }

    return { bookId: book.id, chapter: chapter.n, verse };
  }

  function navigateLxxReference(target) {
    // Set the book first so the chapter options rebuild for it, then set the
    // requested native chapter and render the complete chapter.
    refs.lxxBook.value = target.bookId;
    render({ scrollToReference: false });
    refs.lxxChapter.value = String(target.chapter);
    render({ scrollToReference: false });
    if (!target.verse) return;
    const row = [...refs.results.querySelectorAll('.lxx-segment')].find((segment) => {
      const number = segment.querySelector('.lxx-verse-num');
      return number && number.textContent === target.verse;
    });
    if (row && typeof row.scrollIntoView === 'function') {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function applyLxxReference(input, dataset, generation) {
    let target;
    try {
      target = parseLxxReference(input, dataset);
    } catch (error) {
      // Invalid input keeps the current native chapter, controls and view.
      setMessage(error.message);
      return;
    }
    if (lxxReferenceState.generation !== generation || refs.viewMode.value !== 'lxx') return;
    setMessage('');
    navigateLxxReference(target);
  }

  function handleLxxReference() {
    const generation = (lxxReferenceState.generation += 1);
    const input = refs.reference.value;
    const dataset = lxxDataset();
    if (dataset) { applyLxxReference(input, dataset, generation); return; }
    // Data still loading: queue this reference; loadLxx preserves every queued
    // callback and reuses the single in-flight script request.
    loadLxx(() => {
      if (lxxReferenceState.generation !== generation || refs.viewMode.value !== 'lxx') return;
      const ready = lxxDataset();
      if (!ready) { setMessage('Could not load the Septuagint (Swete) data (data/lxx-swete.js).'); return; }
      applyLxxReference(input, ready, generation);
    });
  }

  function updateReferenceHint() {
    // The LXX examples are deliberately not comma-separated: the native parser
    // accepts exactly ONE reference, so a list would imply unsupported input.
    refs.reference.placeholder = refs.viewMode.value === 'lxx'
      ? 'One native LXX reference only — e.g. Genesis 1 or Psalm 88:84'
      : 'John 3:16, Genesis 1, Psalm 23';
  }

  // Renders the LXX reading for the given Book/Chapter controls into the given
  // container. Shared by the standalone LXX view and the left pane of the
  // parallel view, so the two never diverge. `onReady` reruns the caller's
  // render after the 7.5 MB data file finishes lazy-loading (default: a full
  // view render, which is what the standalone view needs).
  function renderLxxInto(bookSelect, chapterSelect, container, onReady) {
    container.innerHTML = '';
    const dataset = lxxDataset();
    if (!dataset) {
      const loading = document.createElement('p');
      loading.className = 'empty';
      loading.textContent = 'Loading the Septuagint (Swete) data…';
      container.appendChild(loading);
      loadLxx(() => (onReady ? onReady() : render({ scrollToReference: false })));
      return;
    }

    populateLxxBooks(bookSelect, dataset);
    const book = dataset.books.find((b) => b.id === bookSelect.value) || dataset.books[0];
    if (!book) return;
    populateLxxChapters(chapterSelect, book);
    const chapter = book.chapters.find((c) => c.n === chapterSelect.value) || book.chapters[0];

    const parallelPane = container === refs.parallelLxxContent;
    const heading = document.createElement('h2');
    heading.className = 'lxx-heading';
    heading.textContent = `${book.label} ${chapter.n === 'prologue' ? 'Prologue' : chapter.n}`;
    if (parallelPane) container.appendChild(heading);

    const banner = document.createElement('p');
    banner.className = 'lxx-banner';
    banner.textContent = 'Swete Septuagint, native LXX numbering, not aligned to the canon numbering used elsewhere.';
    if (!parallelPane) container.appendChild(banner);

    if (book.notices && book.notices.length) {
      const notices = document.createElement('details');
      notices.className = 'lxx-notices';
      const summary = document.createElement('summary');
      summary.textContent = `Notices (${book.notices.length})`;
      notices.appendChild(summary);
      for (const text of book.notices) {
        const p = document.createElement('p');
        p.textContent = text;
        notices.appendChild(p);
      }
      container.appendChild(notices);
    }

    if (!parallelPane) container.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'lxx-verses';
    for (const segment of chapter.segments) {
      const row = document.createElement('div');
      row.className = 'lxx-segment' + (segment.kind === 'unnumbered' ? ' lxx-unnumbered' : '');
      if (segment.kind === 'verse') {
        const num = document.createElement('span');
        num.className = 'lxx-verse-num';
        num.textContent = segment.l;
        row.appendChild(num);
      }
      const text = document.createElement('span');
      text.className = 'lxx-text';
      text.lang = 'el';
      text.textContent = segment.t;
      row.appendChild(text);
      for (const flag of segment.flags || []) {
        const marker = document.createElement('span');
        marker.className = 'lxx-flag';
        marker.textContent = '\u25C6';
        marker.title = flag.note;
        marker.setAttribute('role', 'img');
        marker.setAttribute('aria-label', flag.note);
        row.appendChild(marker);
      }
      list.appendChild(row);
    }
    container.appendChild(list);

    if (dataset.license && dataset.license.attribution) {
      refs.lxxAttribution.hidden = false;
      refs.lxxAttribution.textContent = ` ${dataset.license.attribution}`;
    }
  }

  function renderLxxView() {
    refs.contextBtn.hidden = true;
    setMessage('');
    // Guard the late lazy-load callback: if the user left the LXX view before
    // the 7.5 MB file finished, do not re-render a different view from this
    // callback (the parallel pane has the same guard).
    renderLxxInto(refs.lxxBook, refs.lxxChapter, refs.results,
      () => { if (refs.viewMode.value === 'lxx') render({ scrollToReference: false }); });
  }

  // ---------------------------------------------------------------------
  // Parallel view: two independent panes, one LXX (native numbering) and one
  // existing canon-numbered translation. No row alignment, no synchronized
  // scrolling, no chapter mapping — the banner says so. Reuses the LXX
  // renderer and the canon chapter renderer unchanged.
  // ---------------------------------------------------------------------

  // Runs a canon renderer against an explicit container instead of #results.
  // Rendering is synchronous, so the temporary redirect is safe.
  function renderInto(container, fn) {
    const previous = refs.results;
    refs.results = container;
    try { fn(); } finally { refs.results = previous; }
  }

  function renderParallelLxxPane() {
    renderLxxInto(
      refs.parallelLxxBook,
      refs.parallelLxxChapter,
      refs.parallelLxxContent,
      // Guard the late lazy-load callback: if the user left the parallel view
      // before the 7.5 MB LXX file finished, do not render its pane (which
      // would otherwise reveal the LXX footer attribution in Canon view).
      () => { if (refs.viewMode.value === 'parallel') renderParallelLxxPane(); },
    );
  }

  function renderParallelTranslationPane() {
    const container = refs.parallelTranslationContent;
    container.innerHTML = '';
    const t = TRANSLATIONS.find((x) => x.id === refs.parallelTranslation.value) || TRANSLATIONS[0];
    const book = canon.books.find((b) => b.id === refs.parallelBook.value) || canon.books[0];
    if (!t || !book) return;

    if (!loaded.has(t.id)) {
      const loading = document.createElement('p');
      loading.className = 'empty';
      loading.textContent = `Loading ${t.label}…`;
      container.appendChild(loading);
      loadTranslation(t, () => renderParallelTranslationPane());
      return;
    }

    // A first lazy load may add native chapters after the picker was filled.
    if (refs.parallelChapter.options.length !== effectiveChapterCount(book.id, [t.id])) populateParallelChapters();
    const chapterNum = Number(refs.parallelChapter.value) || 1;
    // Scope the verse extent to the pane's chosen translation. Using the global
    // chapterExtent() would let another loaded edition with a longer chapter
    // (e.g. Delitzsch 1901's 52-verse John 1) add phantom rows to an edition
    // that ends earlier (Delitzsch eBible has 51).
    const verseCount = extentForTranslations([t], book.id, chapterNum);
    const name = (locale.books[book.id] && locale.books[book.id].name) || book.id;
    renderInto(container, () => {
      appendResultBlock({
        bookId: book.id,
        chapterNum,
        name,
        verseCount,
        verses: Array.from({ length: verseCount }, (_, i) => i + 1),
        translations: [t],
        layout: 'mobile',
        highlight: false,
        anchorFirst: false,
        exactVerses: null,
        versificationDisclosure: true,
      });
    });
    // The pane already identifies its translation; keep the chapter title
    // quiet and use the existing reading renderer at every screen width.
    const heading = container.querySelector('.result-head h2');
    if (heading) heading.textContent = `${name} ${chapterNum}`;
  }

  function renderParallelView() {
    refs.contextBtn.hidden = true;
    setMessage('');
    renderParallelLxxPane();
    renderParallelTranslationPane();
  }

  function render({ scrollToReference = true } = {}) {
    const lxx = refs.viewMode.value === 'lxx';
    const parallel = refs.viewMode.value === 'parallel';
    // Keep the reference hint in step with the actual view on every render,
    // including programmatic transitions (reference actions, search returning
    // to Canon) and locale redraws — not only the View select's change event.
    updateReferenceHint();
    updateAlignmentNotice();
    alignmentRenderedSources.clear();
    // Exactly one Book/Chapter mechanism is shown at a time: the canon bar in
    // canon view, the LXX bar in the LXX view, and the two independent pane
    // controls in the parallel view. The View selector stays visible in all.
    refs.lxxBar.hidden = !lxx;
    for (const control of refs.canonControls) control.hidden = lxx || parallel;
    refs.parallelView.hidden = !parallel;
    refs.results.hidden = parallel;
    if (parallel) {
      renderParallelView();
      return;
    }
    if (lxx) {
      renderLxxView();
      return;
    }
    refs.lxxAttribution.hidden = true;
    const baseTranslations = displayTranslations(selectedTranslations());
    // The virtual aligned column is appended only as an extra Canon column,
    // never added to the selection registry, so Parallel and search never see
    // it. Extents and range parsing ignore it because it declares no dataset.
    const pilotOn = alignmentEnabled();
    const translations = pilotOn ? [...baseTranslations, alignmentVirtualTranslation()] : baseTranslations;

    refs.results.innerHTML = '';

    // An interlinear overrides the normal reading view (works even with no
    // translation selected — a selected one is used only as a caption). A
    // native-numbered caption edition (the Clementine Vulgate) is never aligned
    // to the original-language interlinear: the same reference numbers are not
    // a verified correspondence, so the interlinear is disabled with a visible
    // explanation and the independent Latin reading is kept instead.
    const interlinear = activeInterlinear();
    const captionGroups = viewState.mode === 'reference' ? viewState.groups
      : [{ bookId: currentBook()?.id, chapter: Number(refs.chapter.value) }];
    const captionException = baseTranslations[0] && captionGroups.some(g => hasReferenceComparisonException(baseTranslations[0], g.bookId, g.chapter));
    const nativeCaption = interlinear && baseTranslations[0] && (isNativeVersification(baseTranslations[0]) || captionException)
      ? baseTranslations[0] : null;
    if (interlinear && nativeCaption) {
      setMessage(captionException
        ? `${nativeCaption.label} has a source content-placement exception in this passage, so the ${interlinear.label} interlinear is not aligned to it; showing the independent reading.`
        : `${nativeCaption.label} keeps its own native verse numbering, so the ${interlinear.label} interlinear is not aligned to it; showing the independent reading.`);
    }
    if (interlinear && !nativeCaption) {
      setMessage('');
      refs.contextBtn.hidden = true;
      if (interlinear.perBook) {
        const manifest = interlinear.manifestGlobal ? window[interlinear.manifestGlobal] : null;
        // A declared manifest that is still loading must not trigger fetches for
        // not-yet-known books.
        if (interlinear.manifestSrc && !manifest && !interlinearState[interlinear.key].manifestFailed) {
          setMessage(`Loading ${interlinear.loadingLabel} interlinear\u2026`);
          const loading = document.createElement('p');
          loading.className = 'empty';
          loading.textContent = `Loading ${interlinear.label} data\u2026`;
          refs.results.appendChild(loading);
          return;
        }
        const available = new Set(
          (manifest && Array.isArray(manifest.books) && manifest.books)
          || interlinear.coveredBooks
          || [],
        );
        // Only configurations that actually declare their coverage (a manifest
        // source or a static coveredBooks list) filter by it. The Berean Greek
        // interlinear declares neither here, so it keeps loading its chunks.
        const declaresCoverage = !!interlinear.manifestSrc || Array.isArray(interlinear.coveredBooks);
        const needed = declaresCoverage
          ? interlinearBookIds(interlinear).filter((id) => available.has(id))
          : interlinearBookIds(interlinear);
        const failedHere = needed.filter((id) => interlinearState[interlinear.key].failed[id]);
        if (failedHere.length) {
          renderInterlinearError(interlinear, failedHere);
          return;
        }
        const missing = needed.filter((id) => !window[interlinear.chunkGlobal(id)]);
        if (missing.length) {
          setMessage(`Loading ${interlinear.loadingLabel} interlinear\u2026`);
          const loading = document.createElement('p');
          loading.className = 'empty';
          loading.textContent = `Loading ${interlinear.label} data\u2026`;
          refs.results.appendChild(loading);
          ensureInterlinearBooks(interlinear, missing, () => {
            if (interlinearState[interlinear.key].enabled) render({ scrollToReference: false });
          });
          return;
        }
      }
      renderInterlinear(interlinear, baseTranslations);
      return;
    }

    if (!baseTranslations.length) {
      setMessage('Select at least one translation to display.');
      return;
    }
    if (!nativeCaption) setMessage('');
    populateSearchTranslations();
    // Reflect any native extra chapters a newly loaded translation brings
    // (e.g. Clementine Esther 11-16) without moving the current chapter.
    refreshChapterOptions();

    // Keep Automatic responsive, but honor an explicit Multi-row choice even
    // in a narrow app pane or on a phone.
    const layout = refs.layout.value === 'multirow'
      ? 'multirow'
      : narrowScreen.matches
      ? 'mobile'
      : refs.layout.value === 'auto'
        ? (baseTranslations.length > 5 ? 'multirow' : 'multicolumn')
        : refs.layout.value;

    if (viewState.mode === 'reference') {
      renderReferenceGroups(viewState.groups, translations, layout);
    } else if (viewState.mode === 'search') {
      renderSearchResults();
    } else {
      renderBrowseChapter(translations, layout);
    }

    // The native Greek attribution is shown in the footer while the aligned
    // column is visible, so the source/licence never loses its attribution in
    // Canon. When the option is off the footer stays hidden (unchanged).
    if (pilotOn) {
      const dataset = lxxDataset();
      if (dataset && dataset.license && dataset.license.attribution) {
        refs.lxxAttribution.hidden = false;
        refs.lxxAttribution.textContent = ` ${dataset.license.attribution}`;
      }
    }

    // Update the context button label to reflect current state
    refs.contextBtn.textContent = contextEnabled ? 'Hide context for all' : `Show context for all (\u00b1${CONTEXT_RADIUS})`;

    const target = document.getElementById('current-reference');
    if (scrollToReference && target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setMessage(message) { refs.message.textContent = message; }

  // Read-only test surface for the offline search regression suite. It exposes
  // the language-aware normalization and highlight mapping so kana voicing and
  // canonical equivalence can be asserted directly, without a full render. It
  // changes no behaviour and is not used by the application itself.
  if (window.MARANATHA_ENABLE_TEST_HOOKS === true) window.MARANATHA_SEARCH_TEST = Object.freeze({
    normalizeSearchText,
    buildSearchForm,
    searchVerses,
    appendHighlighted,
    translationLanguage,
  });
})();
