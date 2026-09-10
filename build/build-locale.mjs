// build-locale.mjs
//
// Generates data/locales/<language>.{json,js} — display names for the UI,
// keyed by the same stable book IDs used in canon.js. A locale changes only
// the displayed names (and what the reference parser accepts); it never
// touches canon.js or any translation data.
//
// English names come from canon.computed.json (the same source as canon.js).
// Any other locale reads its names from a source file in build/sources/:
//   build/sources/locale-<language>.names.json  ->  { "names": { "GEN": "...", ... } }
//
// Both .json (canonical data) and .js (window-global wrapper for <script>-tag
// loading under file://) are written, same reasoning as every other generated
// data file — see README.md / PROJECT_HISTORY.md.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const computed = JSON.parse(fs.readFileSync(path.join(dir, 'sources', 'canon.computed.json'), 'utf8'));

function writeLocale(language, label, books, testaments) {
  const output = { language, label, testaments, books };
  const jsonPath = path.join(dir, '..', 'data', 'locales', `${language}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${jsonPath}: ${Object.keys(books).length} book names`);

  const globalName = `MARANATHA_LOCALE_${language.toUpperCase()}`;
  const jsPath = path.join(dir, '..', 'data', 'locales', `${language}.js`);
  fs.writeFileSync(jsPath, `window.${globalName}=${JSON.stringify(output)};\n`);
  console.log(`Wrote ${jsPath}`);
}

function readNamesSource(language) {
  const sourcePath = path.join(dir, 'sources', `locale-${language}.names.json`);
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const books = {};
  for (const [id, name] of Object.entries(source.names)) {
    books[id] = { name };
  }
  return { books, testaments: source.testaments || {}, aliases: source.aliases || {} };
}

function readAliases(language) {
  const sourcePath = path.join(dir, 'sources', `locale-${language}.aliases.json`);
  if (!fs.existsSync(sourcePath)) return {};
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8')).aliases || {};
}

function attachAliases(books, aliases) {
  for (const [id, list] of Object.entries(aliases)) {
    if (books[id]) books[id].aliases = list;
  }
  return books;
}

// English: names live alongside the structure in canon.computed.json.
const enBooks = {};
for (const b of computed.books) {
  enBooks[b.id] = { name: b.name };
}
attachAliases(enBooks, readAliases('en'));
writeLocale('en', 'English', enBooks, { OT: 'Old Testament', NT: 'New Testament' });

// Armenian: names sourced separately (see build/sources/locale-hy.names.json).
const hy = readNamesSource('hy');
attachAliases(hy.books, hy.aliases);
writeLocale('hy', 'Հայերէն', hy.books, hy.testaments);
