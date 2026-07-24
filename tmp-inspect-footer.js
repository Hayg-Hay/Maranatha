import http from 'http';
import https from 'https';
import { URL } from 'url';

const url = 'http://ebible.org/eng-web-c/TOB01.htm';
const parsed = new URL(url);
const lib = parsed.protocol === 'https:' ? https : http;

lib.get(parsed, res => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const idx = body.indexOf('id="V22"');
    console.log('INDEX', idx);
    console.log(body.slice(idx-400, idx+1600));
  });
}).on('error', err => {
  console.error(err);
  process.exit(1);
});
