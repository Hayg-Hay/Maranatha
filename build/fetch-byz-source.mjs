// fetch-byz-source.mjs
//
// Fetches the Byzantine Majority Text CSV files from
// https://github.com/byztxt/byzantine-majority-text into build/sources/byz/
// for reproducible offline builds.
//
// Run: node build/fetch-byz-source.mjs

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, 'sources', 'byz');
fs.mkdirSync(outDir, { recursive: true });

const BASE = 'https://raw.githubusercontent.com/byztxt/byzantine-majority-text/master/csv-unicode/ccat/no-variants';

const FILES = [
  'MAT.csv', 'MAR.csv', 'LUK.csv', 'JOH.csv', 'ACT.csv', 'ACT24.csv',
  'ROM.csv', '1CO.csv', '2CO.csv', 'GAL.csv', 'EPH.csv', 'PHP.csv',
  'COL.csv', '1TH.csv', '2TH.csv', '1TI.csv', '2TI.csv', 'TIT.csv',
  'PHM.csv', 'HEB.csv', 'JAM.csv', '1PE.csv', '2PE.csv', '1JO.csv',
  '2JO.csv', '3JO.csv', 'JUD.csv', 'REV.csv', 'PA.csv',
];

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Maranatha-Builder' }, timeout: 30000 }, res => {
      if (res.statusCode === 302 && res.headers.location) return fetchRaw(res.headers.location).then(resolve, reject);
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  const byzSource = { source: `${BASE}/`, license: 'Unlicense (public domain)', files: {} };
  let totalSize = 0;

  for (const file of FILES) {
    const url = `${BASE}/${file}`;
    console.log(`Fetching ${file}...`);
    try {
      const data = await fetchRaw(url);
      fs.writeFileSync(path.join(outDir, file), data, 'utf8');
      const lines = data.split('\n').filter(Boolean).length;
      byzSource.files[file] = { lines, size: data.length };
      totalSize += data.length;
      console.log(`  ${data.length} bytes, ${lines} lines`);
    } catch (e) {
      console.error(`  FAILED: ${e.message}`);
      byzSource.files[file] = { error: e.message };
    }
  }

  byzSource.totalSize = totalSize;
  byzSource.fileCount = Object.keys(byzSource.files).length;
  fs.writeFileSync(path.join(outDir, 'source-info.json'), JSON.stringify(byzSource, null, 2));
  console.log(`\nDone. ${byzSource.fileCount} files, ${totalSize} bytes total.`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });