import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('.');
const jsonPath = path.join(root, 'data', 'web.json');
const jsPath = path.join(root, 'data', 'web.js');
const json = fs.readFileSync(jsonPath, 'utf8').trim();
fs.writeFileSync(jsPath, `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['web']=${json};\n`);
console.log('Rewrote', jsPath, 'from', jsonPath);
