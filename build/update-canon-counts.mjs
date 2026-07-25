// update-canon-counts.mjs
//
// Recomputes canon verse counts from actual translation data.
// A chapter's verse count = max across WEB, KJV, Byzantine,
// after trimming trailing empty strings from each translation's array.
// Chapters beyond what any translation has (e.g. SIR 52-55) are removed.
//
// Run: node build/update-canon-counts.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

function trimTrailing(arr) {
  let end = arr.length;
  while (end > 0 && !arr[end - 1]) end--;
  return end;
}

function main() {
  const computedPath = path.join(dir, 'sources', 'canon.computed.json');
  const computed = JSON.parse(fs.readFileSync(computedPath, 'utf8'));

  const translations = [];
  for (const p of ['../data/web.json', '../data/kjv.json', '../data/byz.json']) {
    const fpath = path.join(dir, p);
    if (fs.existsSync(fpath)) {
      translations.push(JSON.parse(fs.readFileSync(fpath, 'utf8')));
    }
  }

  const changes = [];

  for (const book of computed.books) {
    const bid = book.id;
    const chapterCounts = translations.map(t => {
      const bd = t.books[bid];
      return bd ? bd.map(ch => trimTrailing(ch)) : null;
    }).filter(Boolean);

    if (chapterCounts.length === 0) continue;

    // New number of chapters = max across translations
    const maxCh = Math.max(...chapterCounts.map(cts => cts.length));

    // Zero out chapters beyond what translations have
    for (let i = maxCh; i < book.chapters.length; i++) {
      if (book.chapters[i] !== 0) {
        changes.push(bid + ' ch' + (i + 1) + ': ' + book.chapters[i] + ' -> 0 (removed)');
        book.chapters[i] = 0;
      }
    }

    // Ensure we have enough slots
    while (book.chapters.length < maxCh) book.chapters.push(0);

    // Set each chapter to max across translations
    for (let i = 0; i < maxCh; i++) {
      const maxV = Math.max(...chapterCounts.map(cts => cts[i] || 0));
      if (book.chapters[i] !== maxV) {
        changes.push(bid + ' ch' + (i + 1) + ': ' + book.chapters[i] + ' -> ' + maxV +
          '  [' + chapterCounts.map((cts, ti) => (translations[ti].id) + ':' + (cts[i] || 0)).join(' ') + ']');
        book.chapters[i] = maxV;
      }
    }

    // Trim trailing zeros from the chapters array itself
    const realChCount = trimTrailing(book.chapters);
    if (realChCount < book.chapters.length) {
      book.chapters.length = realChCount;
    }
  }

  console.log(changes.length + ' changes:');
  changes.forEach(c => console.log('  ' + c));

  fs.writeFileSync(computedPath, JSON.stringify(computed, null, 2) + '\n');
  console.log('');
  console.log('Updated', computedPath);
}
main();