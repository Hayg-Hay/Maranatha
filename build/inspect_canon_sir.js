const fs = require('fs');
const raw = fs.readFileSync('data/canon.js', 'utf8');
const needle = '"id":"SIR"';
const idx = raw.indexOf(needle);
if (idx === -1) {
  console.error('SIR not found');
  process.exit(1);
}
console.log('idx', idx);
console.log(raw.slice(idx, idx + 1200));
const last = raw.lastIndexOf('}');
console.log('last', last, raw.slice(last - 50, last + 50));
console.log('suffix', raw.slice(raw.lastIndexOf('}'), raw.length));
