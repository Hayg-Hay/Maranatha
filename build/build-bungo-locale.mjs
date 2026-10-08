// build-bungo-locale.mjs
//
// Deterministic, isolated builder for the Japanese UI locale used by the
// Bungo-yaku edition. It reads the curated build/sources/bungo/book-names.json
// resource and writes data/locales/ja.json + data/locales/ja.js.
//
//   node build/build-bungo-locale.mjs            # regenerate the two files
//   node build/build-bungo-locale.mjs --check     # verify only; write nothing
//
// It is deliberately separate from build/build-locale.mjs so the English and
// Armenian outputs (data/locales/en.*, data/locales/hy.*) stay byte-identical.
// The output shape is the same as the other locales: only the displayed names
// and the parser aliases change; canon structure and translation text do not.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(dir, '..');
const SOURCE_PATH = path.join(dir, 'sources', 'bungo', 'book-names.json');

function canonIds() {
  const source = fs.readFileSync(path.join(ROOT, 'data', 'canon.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.window.MARANATHA_CANON.books.map((b) => b.id);
}

export function buildLocale() {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  const ids = canonIds();
  const present = new Set(Object.keys(source.books));
  const missing = ids.filter((id) => !present.has(id));
  const extra = [...present].filter((id) => !ids.includes(id));
  if (missing.length || extra.length) {
    throw new Error(`book-names.json must cover exactly the ${ids.length} canon ids (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'})`);
  }
  const books = {};
  for (const id of ids) {
    const entry = source.books[id];
    if (!entry || !entry.name) throw new Error(`book-names.json is missing a name for ${id}`);
    const book = { name: entry.name };
    const aliases = (entry.aliases || []).filter((a) => a && a !== entry.name);
    if (aliases.length) book.aliases = aliases;
    books[id] = book;
  }
  return {
    language: source.language,
    label: source.label,
    testaments: source.testaments,
    books,
  };
}

export function serialize(locale) {
  const json = JSON.stringify(locale, null, 2) + '\n';
  const js = `window.MARANATHA_LOCALE_JA=${JSON.stringify(locale)};\n`;
  return { json, js };
}

function main() {
  const check = process.argv.includes('--check');
  const locale = buildLocale();
  const { json, js } = serialize(locale);
  const jsonPath = path.join(ROOT, 'data', 'locales', 'ja.json');
  const jsPath = path.join(ROOT, 'data', 'locales', 'ja.js');

  if (check) {
    const actualJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8').replace(/\r\n/g, '\n') : null;
    const actualJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actualJson !== json) throw new Error(`${jsonPath} is not up to date (run node build/build-bungo-locale.mjs)`);
    if (actualJs !== js) throw new Error(`${jsPath} is not up to date (run node build/build-bungo-locale.mjs)`);
    const aliasCount = Object.values(locale.books).reduce((n, b) => n + (b.aliases ? b.aliases.length : 0), 0);
    console.log(`ja locale --check OK: ${Object.keys(locale.books).length} book names, ${aliasCount} aliases.`);
    return;
  }

  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(jsPath, js);
  console.log(`Wrote ${jsonPath} and ${jsPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
