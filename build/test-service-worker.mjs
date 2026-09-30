// test-service-worker.mjs
//
// Meaningful service-worker test: loading the real service-worker.js in a small
// VM with a fake CacheStorage, then firing install + activate to prove that the
// new shell does NOT invalidate the existing data cache.
//
//   node build/test-service-worker.mjs
//
// It asserts:
//   - install precaches the NEW shell (maranatha-shell-v33);
//   - activate keeps the existing data cache (maranatha-data-v3) and every file
//     already stored in it (previously downloaded translations / Greek books);
//   - activate deletes the OLD shell cache (maranatha-shell-v29);
//   - data/berean-hebrew/manifest-v2.js is routed through the data cache by
//     isTranslationFile (and is not a shell file).

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SW_PATH = path.join(ROOT, 'service-worker.js');
const swSource = fs.readFileSync(SW_PATH, 'utf8');

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);

// --- fake CacheStorage ------------------------------------------------------
function makeFakeCaches(initial) {
  const store = new Map();
  for (const [name, entries] of Object.entries(initial)) store.set(name, new Map(entries));
  const cacheFor = (name) => {
    const map = store.get(name);
    return {
      async addAll(urls) { for (const u of urls) map.set(u, { url: u, body: `shell:${u}` }); },
      async match(request) { const key = typeof request === 'string' ? request : request.url; return map.get(key); },
      async put(request, response) { const key = typeof request === 'string' ? request : request.url; map.set(key, response); },
    };
  };
  return {
    store,
    async open(name) { if (!store.has(name)) store.set(name, new Map()); return cacheFor(name); },
    async keys() { return [...store.keys()]; },
    async delete(name) { return store.delete(name); },
  };
}

function fire(listeners, type) {
  let p = Promise.resolve();
  const event = { waitUntil(x) { p = p.then(() => x); } };
  for (const cb of listeners[type] || []) cb(event);
  return p;
}

function loadServiceWorker(caches) {
  const listeners = {};
  const self = {
    addEventListener(type, cb) { (listeners[type] = listeners[type] || []).push(cb); },
    skipWaiting() { self.skipped = true; },
    clients: { claim: async () => {} },
    location: { origin: 'https://example.test' },
  };
  const sandbox = {
    self,
    caches,
    fetch: async (url) => ({ ok: true, type: 'basic', url, clone() { return this; } }),
    URL, console, Promise, Date, setTimeout, clearTimeout,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(swSource, sandbox, { filename: 'service-worker.js' });
  return { sandbox, listeners };
}

async function main() {
  // Prior state: an existing v3 data cache with downloaded translations/Greek
  // books, and an old shell cache.
  const caches = makeFakeCaches({
    'maranatha-data-v3': [
      ['./data/web.js', { url: './data/web.js', body: 'WEB' }],
      ['./data/berean/JHN.js', { url: './data/berean/JHN.js', body: 'GREEK-JOHN' }],
      ['./data/berean/ROM.js', { url: './data/berean/ROM.js', body: 'GREEK-ROM' }],
      // A stale copy of the old single-file pilot must survive (never wiped).
      ['./data/berean-hebrew-pilot.js', { url: './data/berean-hebrew-pilot.js', body: 'OLD-HEBREW-PILOT' }],
      // The Genesis-milestone manifest (same URL as before) and its GEN chunk.
      ['./data/berean-hebrew/manifest.js', { url: './data/berean-hebrew/manifest.js', body: 'OLD-GENESIS-MANIFEST' }],
      ['./data/berean-hebrew/GEN.js', { url: './data/berean-hebrew/GEN.js', body: 'GEN' }],
    ],
    'maranatha-shell-v29': [
      ['./index.html', { url: './index.html', body: 'OLD-SHELL' }],
    ],
  });
  const env = loadServiceWorker(caches);

  await fire(env.listeners, 'install');
  await fire(env.listeners, 'activate');

  check('install creates the new shell cache (maranatha-shell-v33)', caches.store.has('maranatha-shell-v33'));
  check('new shell cache is populated', (caches.store.get('maranatha-shell-v33') || new Map()).size > 0);
  check('activation preserves the existing data cache (maranatha-data-v3)', caches.store.has('maranatha-data-v3'));
  check('activation deletes the old shell cache (maranatha-shell-v29)', !caches.store.has('maranatha-shell-v29'));

  const data = caches.store.get('maranatha-data-v3');
  check('downloaded translation file survives the shell update', data && data.get('./data/web.js')?.body === 'WEB');
  check('downloaded Berean Greek book survives the shell update', data && data.get('./data/berean/JHN.js')?.body === 'GREEK-JOHN');
  check('the stale old pilot file is retained, not wiped', data && data.get('./data/berean-hebrew-pilot.js')?.body === 'OLD-HEBREW-PILOT');
  check('the old Genesis manifest is retained, not wiped', data && data.get('./data/berean-hebrew/manifest.js')?.body === 'OLD-GENESIS-MANIFEST');
  check('every previously stored data file is retained', data && data.size === 6, data && String(data.size));
  check('the versioned manifest URL is distinct, so the old manifest cannot shadow new coverage',
    './data/berean-hebrew/manifest-v2.js' !== './data/berean-hebrew/manifest.js');

  // The preview's per-book files must use the existing data-cache route.
  const genV2Routed = vm.runInContext('isTranslationFile("/data/berean-hebrew/GEN-v2.js")', env.sandbox);
  const exoRouted = vm.runInContext('isTranslationFile("/data/berean-hebrew/EXO.js")', env.sandbox);
  const manifestRouted = vm.runInContext('isTranslationFile("/data/berean-hebrew/manifest-v2.js")', env.sandbox);
  const oldGenRouted = vm.runInContext('isTranslationFile("/data/berean-hebrew/GEN.js")', env.sandbox);
  const oldManifestRouted = vm.runInContext('isTranslationFile("/data/berean-hebrew/manifest.js")', env.sandbox);
  const oldPilotRouted = vm.runInContext('isTranslationFile("/data/berean-hebrew-pilot.js")', env.sandbox);
  const canonRouted = vm.runInContext('isTranslationFile("/data/canon.js")', env.sandbox);
  const translationsRouted = vm.runInContext('isTranslationFile("/data/web.js")', env.sandbox);
  const localeRouted = vm.runInContext('isTranslationFile("/data/locales/en.js")', env.sandbox);
  check('versioned/plain Hebrew preview chunks are routed through the data cache', genV2Routed === true && exoRouted === true && oldGenRouted === true);
  check('versioned Hebrew preview manifest is routed through the data cache', manifestRouted === true);
  check('legacy manifest path still matches the data-cache route', oldManifestRouted === true);
  check('legacy pilot path still matches the data-cache route', oldPilotRouted === true);
  check('canon.js is not treated as a translation data file', canonRouted === false);
  check('locales are not treated as translation data files', localeRouted === false);
  check('ordinary translation files are still data-cache routed', translationsRouted === true);
  check('the versioned GEN chunk URL is distinct, so the old chunk cannot shadow the new variants',
    './data/berean-hebrew/GEN-v2.js' !== './data/berean-hebrew/GEN.js');

  const shellList = (swSource.match(/const SHELL_FILES = \[([\s\S]*?)\];/) || [])[1] || '';
  check('Hebrew preview files are not precached into the shell', !/berean-hebrew/.test(shellList));
  check('data cache version is v3 (unchanged by the Hebrew preview)', /DATA_CACHE_VERSION\s*=\s*'v3'/.test(swSource));
  check('shell cache version was bumped for the app change', /CACHE_VERSION\s*=\s*'v33'/.test(swSource));

  let failed = 0;
  for (const [name, ok, detail] of results) {
    if (ok) console.log(`PASS  ${name}`);
    else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
  }
  console.log(`\n${results.length - failed}/${results.length} service-worker checks passed.`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
