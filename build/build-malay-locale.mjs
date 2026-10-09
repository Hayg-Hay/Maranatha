import fs from 'node:fs';
import vm from 'node:vm';
import { ROOT, loadAndBuild } from './import-kszi.mjs';
const data = loadAndBuild();
const en = JSON.parse(fs.readFileSync(`${ROOT}/data/locales/en.json`, 'utf8'));
const context = { window: {} }; vm.runInNewContext(fs.readFileSync(`${ROOT}/data/canon.js`, 'utf8'), context);
const locale = { language: 'ms', label: 'Bahasa Melayu', testaments: { OT: 'Perjanjian Lama', NT: 'Perjanjian Baru' }, books: {} };
for (const book of context.window.MARANATHA_CANON.books) {
  const names = data.bookMetadata[book.id];
  if (!names) { locale.books[book.id] = en.books[book.id]; continue; }
  if (!names.toc2) throw new Error(`Missing Malay label: ${book.id}`);
  locale.books[book.id] = { name: names.toc2, aliases: [...new Set([names.h, names.toc1, names.toc3])].filter(n => n && n !== names.toc2) };
}
for (const [ext, text] of Object.entries({ json: JSON.stringify(locale, null, 2) + '\n', js: `window.MARANATHA_LOCALE_MS=${JSON.stringify(locale)};\n` })) {
  const filename = `${ROOT}/data/locales/ms.${ext}`;
  if (process.argv.includes('--check')) { if (fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n') !== text) throw new Error(`Stale Malay locale: ${filename}`); }
  else fs.writeFileSync(filename, text);
}
console.log('Malay locale OK: publisher book labels/abbreviations and 73 navigation entries.');
