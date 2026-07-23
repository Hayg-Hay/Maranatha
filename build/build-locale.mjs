// build-locale.mjs
//
// Generates data/locales/en.json — display names for the English UI, keyed by
// the same stable book IDs used in canon.js. This file is what a future
// hy.json (Armenian) would sit alongside; canon.js itself never needs to
// change when a new locale is added.
//
// Names here come from the same computed source as canon.js (see
// build-canon.mjs for full provenance notes).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const computed = JSON.parse(fs.readFileSync(path.join(dir, 'sources', 'canon.computed.json'), 'utf8'));

const books = {};
for (const b of computed.books) {
  books[b.id] = { name: b.name };
}

const output = {
  language: 'en',
  label: 'English',
  books,
};

// Written twice, deliberately: en.json is the canonical data file (what a
// build step, a script, or a future non-browser consumer should read), while
// en.js is a window-global wrapper of the exact same data so index.html can
// load it with a plain <script> tag and work when opened directly as
// file:// — browsers block fetch() of local JSON without a server, which is
// exactly the constraint that mattered for YaQuB too (see README.md).
const jsonPath = path.join(dir, '..', 'data', 'locales', 'en.json');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${jsonPath}: ${Object.keys(books).length} book names`);

const jsPath = path.join(dir, '..', 'data', 'locales', 'en.js');
fs.writeFileSync(jsPath, `window.MARANATHA_LOCALE_EN=${JSON.stringify(output)};\n`);
console.log(`Wrote ${jsPath}`);
