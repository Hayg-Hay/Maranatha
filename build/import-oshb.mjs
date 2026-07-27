// import-oshb.mjs
//
// Normalizes build/sources/oshb/*.xml (Open Scriptures Hebrew Bible, OSIS XML)
// into data/he.json (+ a window-global data/he.js twin — see import-web.mjs
// for the fuller explanation of why both exist; same pattern here).
//
// SOURCE: Open Scriptures Hebrew Bible (OSHB), CC BY 4.0.
// https://github.com/openscriptures/morphhb/tree/master/wlc
// Based on the Westminster Leningrad Codex (public domain).
//
// SCOPE: 39 protocanonical Old Testament books. The 7 deuterocanonical books
// (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees) have no Hebrew
// source text in the OSHB and are not included — same pattern as import-byz.mjs
// which covers only NT books.
//
// ARCHITECTURE: Verse-oriented placement engine. See
// build/IMPORT-OSHB-ARCHITECTURE.md for the full design document.
//
// Each OSHB verse is an independent object. The importer asks one question:
// "Where should this source verse appear in Maranatha's canonical versification?"
//
// Destination is derived from <note>KJV:Book.Ch.Verse> when present, otherwise
// from the OSIS position. Placement outcomes: PLACE (empty slot), REPLACE
// (Psalm superscription displaced), MERGE (verified Masoretic→Christian
// verse concatenation), ERROR (abort on unexpected collision).
//
// Usage:
//   node build/import-oshb.mjs
//   node build/validate.mjs data/he.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { writeTranslation } from './normalize.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(dir, 'sources', 'oshb');

// OSIS book filename (without .xml) → Maranatha canon ID
const OSIS_TO_CANON = {
  'Gen':   'GEN', 'Exod':  'EXO', 'Lev':   'LEV', 'Num':   'NUM',
  'Deut':  'DEU', 'Josh':  'JOS', 'Judg':  'JDG', 'Ruth':  'RUT',
  '1Sam':  '1SA', '2Sam':  '2SA', '1Kgs':  '1KI', '2Kgs':  '2KI',
  '1Chr':  '1CH', '2Chr':  '2CH', 'Ezra':  'EZR', 'Neh':   'NEH',
  'Esth':  'EST', 'Job':   'JOB', 'Ps':    'PSA', 'Prov':  'PRO',
  'Eccl':  'ECC', 'Song':  'SNG', 'Isa':   'ISA', 'Jer':   'JER',
  'Lam':   'LAM', 'Ezek':  'EZK', 'Dan':   'DAN', 'Hos':   'HOS',
  'Joel':  'JOL', 'Amos':  'AMO', 'Obad':  'OBA', 'Jonah': 'JON',
  'Mic':   'MIC', 'Nah':   'NAM', 'Hab':   'HAB', 'Zeph':  'ZEP',
  'Hag':   'HAG', 'Zech':  'ZEC', 'Mal':   'MAL',
};

// KJV book abbreviation → Maranatha canon ID.
// Built from import-kjv.mjs's BOOK_ORDER. The KJV notes in OSHB XML use
// KJV abbreviations which differ from OSIS abbreviations.
const KJV_TO_CANON = {
  'Gen':   'GEN', 'Exod':  'EXO', 'Lev':   'LEV', 'Num':   'NUM',
  'Deut':  'DEU', 'Josh':  'JOS', 'Judg':  'JDG', 'Ruth':  'RUT',
  '1Sam':  '1SA', '2Sam':  '2SA', '1Kgs':  '1KI', '2Kgs':  '2KI',
  '1Chr':  '1CH', '2Chr':  '2CH', 'Ezra':  'EZR', 'Neh':   'NEH',
  'Esth':  'EST', 'Job':   'JOB', 'Ps':    'PSA', 'Prov':  'PRO',
  'Eccl':  'ECC', 'Song':  'SNG', 'Isa':   'ISA', 'Jer':   'JER',
  'Lam':   'LAM', 'Ezek':  'EZK', 'Dan':   'DAN', 'Hos':   'HOS',
  'Joel':  'JOL', 'Amos':  'AMO', 'Obad':  'OBA', 'Jonah': 'JON',
  'Mic':   'MIC', 'Nah':   'NAM', 'Hab':   'HAB', 'Zeph':  'ZEP',
  'Hag':   'HAG', 'Zech':  'ZEC', 'Mal':   'MAL',
};

const EXPECTED_FILES = 39;

// ==========================================================================
// Verse text extraction — raw XML scanner (preserved from v1)
// ==========================================================================

/**
 * Given the raw XML string content of a single <verse> element (including its
 * opening and closing tags), extract the reconstructed surface text.
 */
function extractVerseTextFromXML(verseXml) {
  const tokens = [];
  let lastWasMaqaf = false;

  const elementRegex = /<(w|seg)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = elementRegex.exec(verseXml)) !== null) {
    const tag = match[1];
    const attrs = match[2];
    const content = match[3];

    if (tag === 'w') {
      let text = content.replace(/\//g, '').replace(/\s+/g, ' ').trim();
      if (!text) continue;

      if (tokens.length > 0 && !lastWasMaqaf) {
        tokens.push(' ');
      }

      tokens.push(text);
      lastWasMaqaf = false;
    } else if (tag === 'seg') {
      const typeMatch = attrs.match(/type\s*=\s*"([^"]*)"/);
      const type = typeMatch ? typeMatch[1] : '';
      let segText = content.replace(/\s+/g, ' ').trim();

      if (type === 'x-maqqef') {
        tokens.push(segText);
        lastWasMaqaf = true;
      } else if (type === 'x-sof-pasuq') {
        tokens.push(segText);
        lastWasMaqaf = false;
      } else if (type === 'x-paseq') {
        if (tokens.length > 0) tokens.push(' ');
        tokens.push(segText);
        tokens.push(' ');
        lastWasMaqaf = false;
      } else if (type === 'x-pe' || type === 'x-samekh') {
        // paragraph markers — skip
      } else {
        if (segText) {
          if (tokens.length > 0 && !lastWasMaqaf) tokens.push(' ');
          tokens.push(segText);
          lastWasMaqaf = false;
        }
      }
    }
  }

  return tokens.join('').replace(/\s{2,}/g, ' ').trim();
}

// ==========================================================================
// Verse object collection (Pass 1)
// ==========================================================================

/**
 * Collect all verse objects from one OSIS XML file.
 * Each verse object: { osisBook, osisChapter, osisVerse, text, kjvNote, osisID }
 * where kjvNote is null or { book, chapter, verse }.
 */
function collectVerses(xmlContent, osisBook) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
  });

  const doc = parser.parse(xmlContent);
  if (!doc.osis || !doc.osis.osisText || !doc.osis.osisText.div) {
    throw new Error('Could not find osis/osisText/div structure in XML');
  }

  const div = doc.osis.osisText.div;
  const osisBookId = div['@_osisID'];
  if (!osisBookId) throw new Error('Could not find osisID on <div type="book">');

  let chapters = div.chapter;
  if (!chapters) return { osisBookId, verses: [] };
  if (!Array.isArray(chapters)) chapters = [chapters];

  const allVerses = [];

  for (const chapterEl of chapters) {
    const chapterOsisID = chapterEl['@_osisID'];
    const chapterMatch = chapterOsisID.match(/\.(\d+)$/);
    if (!chapterMatch) {
      console.warn(`  Could not parse chapter number from osisID: ${chapterOsisID}`);
      continue;
    }
    const chapterNum = parseInt(chapterMatch[1]);

    let verses = chapterEl.verse;
    if (!verses) continue;
    if (!Array.isArray(verses)) verses = [verses];

    // Extract raw chapter XML for verse text extraction
    const chapterStartMarker = `<chapter osisID="${chapterOsisID}"`;
    const chapterStart = xmlContent.indexOf(chapterStartMarker);
    if (chapterStart === -1) continue;

    let chapterEnd = xmlContent.indexOf('<chapter ', chapterStart + chapterStartMarker.length);
    if (chapterEnd === -1) chapterEnd = xmlContent.indexOf('</div>', chapterStart);
    if (chapterEnd === -1) chapterEnd = xmlContent.length;

    const chapterXml = xmlContent.substring(chapterStart, chapterEnd);

    const verseRegex = /<verse osisID="([^"]*)">([\s\S]*?)<\/verse>/g;
    let verseMatch;

    while ((verseMatch = verseRegex.exec(chapterXml)) !== null) {
      const verseID = verseMatch[1];
      const verseXml = verseMatch[0];
      const verseBody = verseMatch[2];

      // Extract verse number
      const verseParts = verseID.match(/\.(\d+)$/);
      if (!verseParts) continue;
      const verseNum = parseInt(verseParts[1]);

      // Extract Hebrew text
      const text = extractVerseTextFromXML(verseXml);
      if (!text) continue;

      // Parse KJV note if present
      let kjvNote = null;
      const noteMatch = verseBody.match(/<note>KJV:([^<]+)<\/note>/);
      if (noteMatch) {
        // Strip trailing !a / !b suffixes (sub-verse indicators, e.g. "1Kgs.22.43!b")
        let kjvRef = noteMatch[1].replace(/![ab]$/, '');
        const kjvParts = kjvRef.match(/^(.+)\.(\d+)\.(\d+)$/);
        if (kjvParts) {
          kjvNote = {
            book: kjvParts[1],
            chapter: parseInt(kjvParts[2]),
            verse: parseInt(kjvParts[3]),
          };
        } else {
          console.warn(`  Malformed KJV note in ${verseID}: "${noteMatch[1]}" — skipping note`);
        }
      }

      // Detect SPLIT pattern: KJV note appears mid-verse (after content has begun)
      // Evidence: OSHB Isa.63.19 has words before <note>KJV:Isa.64.1</note> (which
      // are KJV Isa.63:19) and words after it (which are KJV Isa.64:1).
      const firstContentIndex = Math.min(
        verseBody.indexOf('<w') === -1 ? Infinity : verseBody.indexOf('<w'),
        verseBody.indexOf('<seg') === -1 ? Infinity : verseBody.indexOf('<seg')
      );
      const noteIndex = verseBody.indexOf('<note>KJV:');

      if (kjvNote && noteIndex >= 0 && firstContentIndex < noteIndex) {
        // SPLIT: KJV note is mid-verse — text before note goes to OSIS destination,
        // text after note goes to KJV destination.

        const noteStart = noteIndex;
        const noteEnd = verseBody.indexOf('</note>', noteStart) + '</note>'.length;

        const beforeXml = verseBody.substring(0, noteStart);
        const afterXml = verseBody.substring(noteEnd);

        const beforeText = extractVerseTextFromXML(beforeXml);
        const afterText = extractVerseTextFromXML(afterXml);

        // Verse object 1: text before the note — no KJV note, maps 1:1
        if (beforeText) {
          allVerses.push({
            osisBook,
            osisChapter: chapterNum,
            osisVerse: verseNum,
            text: beforeText,
            kjvNote: null,
            osisID: verseID + ' (before split)',
          });
        }

        // Verse object 2: text after the note — goes to KJV destination
        if (afterText) {
          allVerses.push({
            osisBook,
            osisChapter: chapterNum,
            osisVerse: verseNum,
            text: afterText,
            kjvNote: kjvNote,
            osisID: verseID + ' (after split)',
          });
        }
      } else {
        // Normal verse (no split): one verse object
        allVerses.push({
          osisBook,
          osisChapter: chapterNum,
          osisVerse: verseNum,
          text,
          kjvNote,
          osisID: verseID,
        });
      }
    }
  }

  return { osisBookId, verses: allVerses };
}

// ==========================================================================
// Placement engine (Pass 2)
// ==========================================================================

/**
 * Determine the Maranatha destination for a verse object.
 * Returns { canonBook, chapter, verse } or null if the verse cannot be placed.
 */
function determineDestination(verse) {
  if (verse.kjvNote) {
    const canonBook = KJV_TO_CANON[verse.kjvNote.book];
    if (!canonBook) {
      console.warn(`  Unknown KJV book "${verse.kjvNote.book}" in ${verse.osisID} — falling back to OSIS`);
      const fallback = OSIS_TO_CANON[verse.osisBook];
      if (!fallback) return null;
      return { canonBook: fallback, chapter: verse.osisChapter, verse: verse.osisVerse };
    }
    return {
      canonBook,
      chapter: verse.kjvNote.chapter,
      verse: verse.kjvNote.verse,
    };
  }

  // No KJV note — default to OSIS position
  const canonBook = OSIS_TO_CANON[verse.osisBook];
  if (!canonBook) return null;
  return {
    canonBook,
    chapter: verse.osisChapter,
    verse: verse.osisVerse,
  };
}

/**
 * Slot key for the output storage.
 */
function slotKey(canonBook, chapter, verse) {
  return `${canonBook}:${chapter}:${verse}`;
}

/**
 * Main placement function. Processes all collected verses through the
 * PLACE/REPLACE/MERGE/ERROR dispatch.
 *
 * Returns { books: { canonBookId: { chapterNum: [verseText, ...] } }, errors: [...] }
 */
function placeAllVerses(allVerses) {
  // output: { canonBookId: { chapterNum: [verseText, ...] } }
  // Stored as sparse objects during placement for slot-level access
  const books = {};
  // Track metadata for each slot: { text, hasKJVNote, osisID }
  const slotMeta = {}; // key → metadata
  const errors = [];

  // Total counters
  let placed = 0;
  let replaced = 0;
  let merged = 0;

  for (const verse of allVerses) {
    const dest = determineDestination(verse);
    if (!dest) continue;

    // Ensure output structures exist
    if (!books[dest.canonBook]) books[dest.canonBook] = {};
    if (!books[dest.canonBook][dest.chapter]) books[dest.canonBook][dest.chapter] = [];

    const key = slotKey(dest.canonBook, dest.chapter, dest.verse);
    // Helper: write text into the books structure
    function storeVerse(canonBook, chapter, verseNum, text) {
      const arr = books[canonBook][chapter];
      // Expand array if needed (verseNum is 1-indexed)
      while (arr.length < verseNum) arr.push('');
      arr[verseNum - 1] = text;
    }

    if (!slotMeta[key]) {
      // PLACE — slot is empty
      storeVerse(dest.canonBook, dest.chapter, dest.verse, verse.text);
      slotMeta[key] = {
        text: verse.text,
        hasKJVNote: !!verse.kjvNote,
        osisID: verse.osisID,
        osisBook: verse.osisBook,
        osisChapter: verse.osisChapter,
        osisVerse: verse.osisVerse,
      };
      placed++;
    } else {
      // COLLISION — determine outcome
      const existing = slotMeta[key];
      const incomingHasNote = !!verse.kjvNote;
      const existingHasNote = existing.hasKJVNote;

      if (incomingHasNote && !existingHasNote) {
        // Note-bearer collides with no-note occupant.
        // This covers:
        //   - Psalm superscriptions (Ps.3.1 displaced by Ps.3.2 with KJV:Ps.3.1)
        //   - 1 Chronicles 12 numbering cascade (12.4 displaced by 12.5 with KJV:12.4)
        //   - Reverse-order merge: existing no-note is first half of a merged Christian
        //     verse, incoming note-bearer is the OSHB successor and second half
        //     (e.g., 1Sam.20.42 displaced by 1Sam.21.1 with KJV:1Sam.20.42)

        // Check for reverse-order merge: only applies to CROSS-CHAPTER consecutive
        // verses. The one verified case is 1Sam.20.42 (no note, first half) +
        // 1Sam.21.1 (KJV:20.42, second half). Same-chapter consecutives
        // (Psalm superscriptions, 1Chr cascade) are REPLACE, not merge.
        const sameBook = existing.osisBook === verse.osisBook;
        const crossChapterSuccessor =
          existing.osisChapter + 1 === verse.osisChapter &&
          verse.osisVerse === 1;

        if (sameBook && crossChapterSuccessor) {
          // Reverse-order cross-chapter merge
          const mergedText = existing.text + ' ' + verse.text;
          storeVerse(dest.canonBook, dest.chapter, dest.verse, mergedText);
          slotMeta[key] = {
            text: mergedText,
            hasKJVNote: true,
            osisID: existing.osisID + '+' + verse.osisID,
            osisBook: existing.osisBook,
            osisChapter: existing.osisChapter,
            osisVerse: existing.osisVerse,
          };
          merged++;
        } else {
          // REPLACE — no merge relationship, just superscription/cascade
          storeVerse(dest.canonBook, dest.chapter, dest.verse, verse.text);
          slotMeta[key] = {
            text: verse.text,
            hasKJVNote: true,
            osisID: verse.osisID,
            osisBook: verse.osisBook,
            osisChapter: verse.osisChapter,
            osisVerse: verse.osisVerse,
          };
          replaced++;
        }
      } else if (!incomingHasNote && existingHasNote) {
        // No-note verse collides with existing note-bearing verse.
        // This is the MERGE pattern: the note-bearer is the first half of a
        // Christian verse, the no-note successor is the second half.
        //
        // Verified merge cases (from IMPORT-OSHB-ARCHITECTURE.md, §3):
        //   Num.25.19 (note:KJV 26.1) + Num.26.1 (no note) → NUM 26:1
        //   1Sam.21.1 (note:KJV 20.42) + 1Sam.20.42 (no note) → 1SA 20:42
        //   1Kgs.22.21 (note:KJV 22.22) + 1Kgs.22.22 (no note) → 1KI 22:22

        const sameBook = existing.osisBook === verse.osisBook;
        const consecutiveVerses =
          (existing.osisChapter === verse.osisChapter &&
           existing.osisVerse + 1 === verse.osisVerse) ||
          (existing.osisChapter + 1 === verse.osisChapter &&
           verse.osisVerse === 1);

        if (sameBook && consecutiveVerses) {
          // MERGE — concatenate the successor text
          const mergedText = existing.text + ' ' + verse.text;
          storeVerse(dest.canonBook, dest.chapter, dest.verse, mergedText);
          slotMeta[key] = {
            text: mergedText,
            hasKJVNote: true,
            osisID: existing.osisID + '+' + verse.osisID,
            osisBook: existing.osisBook,
            osisChapter: existing.osisChapter,
            osisVerse: existing.osisVerse,
          };
          merged++;
        } else {
          // Unexpected — no-note verse collides with an unrelated note-bearer
          errors.push({
            key,
            type: 'UNEXPECTED_COLLISION',
            existing: existing.osisID + ' (has note)',
            incoming: verse.osisID + ' (no note)',
            detail: 'No-note verse collides with non-consecutive note-bearer. Not a merge case.',
          });
        }
      } else {
        // Both have notes or both lack notes — unexpected
        errors.push({
          key,
          type: 'UNEXPECTED_COLLISION',
          existing: existing.osisID + ' (note=' + existingHasNote + ')',
          incoming: verse.osisID + ' (note=' + incomingHasNote + ')',
          detail: 'Collision involving two note-bearing or two no-note verses.',
        });
      }
    }
  }

  return { books, slotMeta, errors, stats: { placed, replaced, merged, errors: errors.length } };
}

// ==========================================================================
// Output conversion
// ==========================================================================

/**
 * Convert sparse slot storage to Maranatha's array-of-arrays format
 * expected by writeTranslation: books[canonId] = [[chapter1verses], ...]
 */
function buildOutput(books, slotMeta, canonById) {
  const outputBooks = {};

  for (const [canonBookId, chapterData] of Object.entries(books)) {
    const canonBook = canonById[canonBookId];
    if (!canonBook) continue;

    const chapterArray = [];
    for (let c = 0; c < canonBook.chapters.length; c++) {
      const chapterNum = c + 1;
      const verses = chapterData[chapterNum] || [];
      chapterArray.push(verses);
    }

    outputBooks[canonBookId] = chapterArray;
  }

  return outputBooks;
}

// ==========================================================================
// Main
// ==========================================================================

function main() {
  // Load canon.js for output structure
  const canonPath = path.join(dir, '..', 'data', 'canon.js');
  const canonSrc = fs.readFileSync(canonPath, 'utf8');
  const canonJson = canonSrc.slice('window.MARANATHA_CANON='.length).trim();
  const canon = JSON.parse(canonJson.endsWith(';') ? canonJson.slice(0, -1) : canonJson);
  const canonById = Object.fromEntries(canon.books.map(b => [b.id, b]));

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xml'));
  if (files.length !== EXPECTED_FILES) {
    console.warn(`Expected ${EXPECTED_FILES} XML files, found ${files.length}`);
  }
  files.sort();

  // Pass 1: collect all verse objects
  console.log('=== Pass 1: Collecting verses ===');
  const allVerses = [];
  let totalKJVNotes = 0;

  for (const file of files) {
    const osisBook = file.replace('.xml', '');
    const canonId = OSIS_TO_CANON[osisBook];
    if (!canonId) {
      throw new Error(`Unmapped source file: ${file}`);
    }

    console.log(`Reading ${file}...`);
    const xmlContent = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const startTime = Date.now();
    const { osisBookId, verses } = collectVerses(xmlContent, osisBook);
    const elapsed = Date.now() - startTime;

    const notesInBook = verses.filter(v => v.kjvNote).length;
    totalKJVNotes += notesInBook;
    allVerses.push(...verses);

    console.log(`  ${verses.length} verses, ${notesInBook} with KJV notes (${elapsed}ms)`);
  }

  console.log(`\nTotal: ${allVerses.length} verses, ${totalKJVNotes} with KJV notes`);

  // Pass 2: place all verses
  console.log('\n=== Pass 2: Placing verses ===');
  const { books, slotMeta, errors, stats } = placeAllVerses(allVerses);

  console.log(`PLACE:  ${stats.placed}`);
  console.log(`REPLACE: ${stats.replaced} (Psalm superscriptions / 1Chr cascade)`);
  console.log(`MERGE:  ${stats.merged}`);
  console.log(`ERROR:  ${stats.errors}`);

  if (errors.length > 0) {
    console.error('\n=== PLACEMENT ERRORS ===');
    for (const err of errors) {
      console.error(`${err.type}: ${err.key}`);
      console.error(`  Existing: ${err.existing}`);
      console.error(`  Incoming: ${err.incoming}`);
      console.error(`  Detail: ${err.detail}`);
    }
    console.error('\nAborting — unexpected collisions must be investigated.');
    process.exit(1);
  }

  // Convert sparse storage to array-of-arrays format
  const outputBooks = buildOutput(books, slotMeta, canonById);

  // Log per-book stats
  console.log('');
  const presentBookIds = new Set();
  for (const [canonBookId, chapterArray] of Object.entries(outputBooks)) {
    const totalNonEmpty = chapterArray.reduce((sum, ch) => sum + ch.filter(v => v && v.trim()).length, 0);
    console.log(`${canonBookId}: ${chapterArray.length} chapters, ${totalNonEmpty} non-empty verses`);
    presentBookIds.add(canonBookId);
  }

  console.log(`\nMapped ${presentBookIds.size}/39 protocanonical OT books.`);

  // Report missing books
  const allOT = 'GEN,EXO,LEV,NUM,DEU,JOS,JDG,RUT,1SA,2SA,1KI,2KI,1CH,2CH,EZR,NEH,EST,JOB,PSA,PRO,ECC,SNG,ISA,JER,LAM,EZK,DAN,HOS,JOL,AMO,OBA,JON,MIC,NAM,HAB,ZEP,HAG,ZEC,MAL'.split(',');
  const missing = allOT.filter(id => !presentBookIds.has(id));
  if (missing.length > 0) {
    console.log(`Missing books: ${missing.join(', ')}`);
  }

  // Write output
  const sourceStr = 'Open Scriptures Hebrew Bible (OSHB). Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb, licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Based on the Westminster Leningrad Codex (public domain). Morphological markup stripped during import — only surface text (consonants, niqqud, cantillation) retained. Covers the 39 protocanonical Old Testament books only; the 7 Catholic deuterocanonical books have no Hebrew source text and are not included.';

  writeTranslation({
    id: 'he',
    label: 'Hebrew Bible (OSHB)',
    source: sourceStr,
    books: outputBooks,
  });

  // Write the window-global .js wrapper
  const jsonPath = path.join(dir, '..', 'data', 'he.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const jsPath = path.join(dir, '..', 'data', 'he.js');
  fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['he']=${jsonData.trim()};\n`);
  console.log(`\nWrote ${jsPath}`);
  console.log(`\nDone. Next: node build/validate.mjs data/he.json`);
}

main();