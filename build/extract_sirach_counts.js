const fs = require('fs');
const path = require('path');
const web = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'web.json'), 'utf8'));
const sir = web.find(b => b.id === 'SIR');
if (!sir) {
  console.error('Sirach not found in data/web.json');
  process.exit(1);
}
console.log(JSON.stringify(sir.chapters));
