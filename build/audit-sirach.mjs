// Rebuild only Sirach from cached publisher HTML; audit every registered corpus.
// node build/audit-sirach.mjs [--write]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChapter } from './import-eng-web-c.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = ['web', 'kjv', 'armwestern', 'byz', 'he', 'luther1912', 'segond1910'];
const translations = ids.map(id => JSON.parse(fs.readFileSync(path.join(root, 'data', `${id}.json`))));
const web = translations[0];
const chapters = [];
const verseMetadata = {};
const audit = [];
for (let chapter = 1; chapter <= 51; chapter++) {
  const filename = `SIR${String(chapter).padStart(2, '0')}.htm`;
  const html = fs.readFileSync(path.join(root, 'build/sources/sirach-web', filename), 'utf8');
  const parsed = parseChapter(html);
  if (!parsed.verses.length || !html.includes(`Sirach ${chapter}</title>`)) throw new Error(`Bad source: ${filename}`);
  chapters.push(parsed.verses);
  if (Object.keys(parsed.metadata).length) verseMetadata[chapter] = parsed.metadata;
  const omitted = Object.entries(parsed.metadata).filter(([, m]) => m.status === 'omitted').map(([v]) => Number(v));
  const old = web.books.SIR[chapter - 1];
  audit.push({ chapter, highestVerse: parsed.verses.length, textVerses: parsed.verses.filter(Boolean).length, omitted,
    source: `https://ebible.org/eng-web-c/${filename}` });
  if (!process.argv.includes('--write')) {
    if (JSON.stringify(old) !== JSON.stringify(parsed.verses)) throw new Error(`Sirach ${chapter}: runtime does not match publisher source`);
    if (JSON.stringify(web.verseMetadata?.SIR?.[chapter] || {}) !== JSON.stringify(parsed.metadata)) throw new Error(`Sirach ${chapter}: metadata mismatch`);
  }
}
if (process.argv.includes('--write')) {
  web.books.SIR = chapters;
  (web.verseMetadata ||= {}).SIR = verseMetadata;
  fs.writeFileSync(path.join(root, 'data/web.json'), JSON.stringify(web, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'data/web.js'), `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['web']=${JSON.stringify(web, null, 2)};\n`);
  fs.writeFileSync(path.join(root, 'build/sources/sirach-web/audit.json'), JSON.stringify({ checked: '2026-10-05', translations: translations.map(t => ({ id: t.id, source: t.source, containsSirach: !!t.books.SIR })), chapters: audit }, null, 2) + '\n');
}
console.log(translations.map(t => `${t.id}: ${t.books.SIR ? '51 Sirach chapters audited' : 'Sirach absent from this imported edition'}`).join('\n'));
console.log('WEB omissions:', audit.filter(c => c.omitted.length).map(c => `${c.chapter}: ${c.omitted.join(',')}`).join('; '));
