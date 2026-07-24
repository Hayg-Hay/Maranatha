#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'data', 'canon.js');
const raw = fs.readFileSync(file, 'utf8');
const prefix = 'window.MARANATHA_CANON=';
if (!raw.startsWith(prefix)) {
  console.error('Unexpected canon.js format');
  process.exit(2);
}
const jsonText = raw.slice(prefix.length);
let obj;
try { obj = JSON.parse(jsonText); } catch (e) { console.error('JSON parse error', e); process.exit(2); }

// New values from eBible.org WEB-C
const sirachChapters = [30,18,31,31,15,37,36,19,18,31,34,18,26,27,20,30,32,33,30,32,28,27,28,34,26,29,30,26,28,25,31,24,33,26,20,26,31,34,35,30,24,25,33,23,26,20,25,25,16,29,30];
// Note: I corrected a couple positions to match the live counts retrieved.

// Update SIR entry
const books = obj.books || obj;
let updated = false;
for (const b of books) {
  if (b.id === 'SIR') {
    b.chapters = sirachChapters;
    updated = true;
  }
  if (b.id === 'ROM' && Array.isArray(b.chapters)) {
    // Romans: set chapter14 (index 13) to 26, chapter16 (index 15) to 25
    if (b.chapters.length >= 16) {
      b.chapters[13] = 26;
      b.chapters[15] = 25;
      updated = true;
    }
  }
}
if (!updated) {
  console.error('Did not find SIR or ROM entries to update');
  process.exit(2);
}
// Write back compact JSON similar to original
const out = prefix + JSON.stringify(obj);
fs.writeFileSync(file, out, 'utf8');
console.log('Updated canon.js successfully');
