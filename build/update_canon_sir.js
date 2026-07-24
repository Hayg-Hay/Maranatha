const fs = require('fs');
const path = require('path');
const canonPath = path.join(__dirname, '..', 'data', 'canon.js');
const raw = fs.readFileSync(canonPath, 'utf8');
const prefix = 'window.MARANATHA_CANON=';
if (!raw.startsWith(prefix)) {
  console.error('Unexpected canon.js prefix');
  process.exit(1);
}
let jsonText = raw.slice(prefix.length).trimEnd();
if (jsonText.endsWith(';')) {
  jsonText = jsonText.slice(0, -1);
}
const obj = JSON.parse(jsonText);
const sir = obj.books.find(b => b.id === 'SIR');
if (!sir) {
  console.error('SIR not found');
  process.exit(1);
}
const sirachChapters = [30,18,31,31,15,37,36,19,18,31,33,18,26,27,20,29,32,33,29,32,28,26,28,34,26,21,30,26,28,25,31,24,33,26,20,26,31,34,35,30,24,25,33,23,26,20,25,25,16,29,30];
const rom = obj.books.find(b => b.id === 'ROM');
if (!rom) {
  console.error('ROM not found');
  process.exit(1);
}
if (sir.chapters.length !== 51 || String(sir.chapters) !== String(sirachChapters)) {
  sir.chapters = sirachChapters;
  console.log('Updated SIR to 51 chapters.');
} else {
  console.log('SIR already matches 51 chapters.');
}
if (rom.chapters[13] !== 26 || rom.chapters[15] !== 25) {
  rom.chapters[13] = 26;
  rom.chapters[15] = 25;
  console.log('Updated ROM 14 and 16 counts.');
} else {
  console.log('ROM already matches expected counts.');
}
const out = prefix + JSON.stringify(obj) + ';';
fs.writeFileSync(canonPath, out, 'utf8');
console.log('Wrote data/canon.js');
