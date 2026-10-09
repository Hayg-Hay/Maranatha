// Indonesian labels/aliases from the same pinned AYT SFM and JSON sources.
import fs from 'node:fs';
import vm from 'node:vm';
import { ROOT, SOURCE_DIR, BOOK_IDS, loadAndBuild } from './import-ayt.mjs';
const data = loadAndBuild();
const json = JSON.parse(fs.readFileSync(`${SOURCE_DIR}/json/ayt.json`, 'utf8'));
const english = JSON.parse(fs.readFileSync(`${ROOT}/data/locales/en.json`, 'utf8'));
const context = { window: {} }; vm.runInNewContext(fs.readFileSync(`${ROOT}/data/canon.js`, 'utf8'), context);
const locale = { language: 'id', label: 'Bahasa Indonesia', testaments: { OT: 'Perjanjian Lama', NT: 'Perjanjian Baru' }, books: {} };
for (const book of context.window.MARANATHA_CANON.books) {
  const names = data.bookMetadata[book.id];
  if (!names) { locale.books[book.id] = english.books[book.id]; continue; }
  const abbr = json.find(r => Number(r.book) === BOOK_IDS.indexOf(book.id) + 1).abbr;
  const name = names.toc2;
  if (!name || !names.toc3) throw new Error(`Missing AYT book name: ${book.id}`);
  locale.books[book.id] = { name, aliases: [...new Set([names.h, names.toc1, names.toc3, abbr])].filter(n => n && n !== name) };
}
for (const [ext, text] of Object.entries({ json: JSON.stringify(locale, null, 2) + '\n', js: `window.MARANATHA_LOCALE_ID=${JSON.stringify(locale)};\n` })) {
  const filename = `${ROOT}/data/locales/id.${ext}`;
  if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale Indonesian locale: ${filename}`); }
  else fs.writeFileSync(filename, text);
}
console.log('Indonesian locale OK: 73 labels, publisher book names and abbreviations.');
