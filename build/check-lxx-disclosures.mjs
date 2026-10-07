// Acceptance check for the three approved LXX disclosure changes:
//   1. PSA 16:4  — targeted transcription-marker flag for the stray inline "(4)".
//   2. PSA 88:84 — targeted source-label-anomaly flag for label 84 (vs expected 48).
//   3. LJE       — one book notice: upstream has no chapter division; the
//                  displayed chapter 1 is a navigation container.
//
//   node build/check-lxx-disclosures.mjs
//
// One PASS/FAIL line per invariant. It compares the shipped data/every segment
// text, label, kind, order and old flag against build/cache/lxx-disclosures-before.json
// (the pre-change baseline; never regenerated after the change), and additionally
// exercises the real file:// app renderers and a realistic CacheStorage mock.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { XMLParser } from 'fast-xml-parser';
import { buildData, B_DIR, sourcePathFor } from './import-lxx-swete.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const CACHE = path.join(here, 'cache');
const BEFORE_FILE = path.join(CACHE, 'lxx-disclosures-before.json');
const STAGE1B_BEFORE = path.join(CACHE, 'stage1b-before.json');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

const results = [];
const out = (name, ok, detail) => results.push([name, !!ok, detail || '']);

// ---------------------------------------------------------------------------
// Baseline and shipped data.
// ---------------------------------------------------------------------------
if (!fs.existsSync(BEFORE_FILE)) {
  console.log(`FAIL  baseline-present  missing ${path.relative(root, BEFORE_FILE)}`);
  console.log('check-lxx-disclosures: 0 pass / 1 fail');
  process.exit(1);
}
const before = JSON.parse(fs.readFileSync(BEFORE_FILE, 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lxx-swete.json'), 'utf8'));
const beforeJson = fs.readFileSync(BEFORE_FILE, 'utf8');
const afterJson = read('data/lxx-swete.json');
out('baseline-present', true, `${before.books.length} books`);

// ---------------------------------------------------------------------------
// 1. Structure: books, chapters, segment order/kind/label/text all identical.
// ---------------------------------------------------------------------------
function structureDiff() {
  if (before.books.length !== after.books.length) return `book count ${before.books.length} -> ${after.books.length}`;
  for (let i = 0; i < before.books.length; i++) {
    const A = before.books[i];
    const B = after.books[i];
    if (A.id !== B.id || A.label !== B.label || A.kind !== B.kind || A.sourceFile !== B.sourceFile) {
      return `book ${i}: ${A.id} -> ${B.id}`;
    }
    if (A.chapters.length !== B.chapters.length) return `${A.id}: chapter count ${A.chapters.length} -> ${B.chapters.length}`;
    for (let ci = 0; ci < A.chapters.length; ci++) {
      const ca = A.chapters[ci];
      const cb = B.chapters[ci];
      if (ca.n !== cb.n) return `${A.id}: chapter ${ca.n} -> ${cb.n}`;
      if (ca.segments.length !== cb.segments.length) return `${A.id} ${ca.n}: segment count ${ca.segments.length} -> ${cb.segments.length}`;
      for (let si = 0; si < ca.segments.length; si++) {
        const sa = ca.segments[si];
        const sb = cb.segments[si];
        if (sa.kind !== sb.kind) return `${A.id} ${ca.n}[${si}]: kind ${sa.kind} -> ${sb.kind}`;
        if ((sa.l ?? null) !== (sb.l ?? null)) return `${A.id} ${ca.n}[${si}]: label ${sa.l} -> ${sb.l}`;
        if (sa.t !== sb.t) return `${A.id} ${ca.n}[${si}]: text differs`;
      }
    }
  }
  return null;
}
{
  const diff = structureDiff();
  out('structure-text-label-order-unchanged', diff === null, diff || 'all books/chapters/segments byte-identical');
}

// ---------------------------------------------------------------------------
// 2. Flags: every old flag retained unchanged; exactly the two targeted new
//    flags exist, at PSA/16/4 and PSA/88/84.
// ---------------------------------------------------------------------------
const flagKey = (f) => `${f.code}\u0000${f.note}`;
const addedFlags = [];
let flagProblem = null;
for (let bi = 0; bi < before.books.length; bi++) {
  const A = before.books[bi];
  const B = after.books[bi];
  for (let ci = 0; ci < A.chapters.length; ci++) {
    const ca = A.chapters[ci];
    const cb = B.chapters[ci];
    for (let si = 0; si < ca.segments.length; si++) {
      const fa = ca.segments[si].flags || [];
      const fb = cb.segments[si].flags || [];
      for (const f of fa) {
        if (!fb.some((g) => flagKey(g) === flagKey(f))) { flagProblem = `${A.id} ${ca.n}: old flag removed from verse ${ca.segments[si].l}`; break; }
      }
      if (flagProblem) break;
      if (fb.length !== fa.length + fb.filter((f) => !fa.some((g) => flagKey(g) === flagKey(f))).length) {
        flagProblem = `${A.id} ${ca.n}: flag list not a superset for verse ${ca.segments[si].l}`;
        break;
      }
      for (const f of fb) {
        if (!fa.some((g) => flagKey(g) === flagKey(f))) {
          addedFlags.push({ book: B.id, chapter: cb.n, verse: cb.segments[si].l, code: f.code, note: f.note });
        }
      }
    }
    if (flagProblem) break;
  }
  if (flagProblem) break;
}
{
  const expected = [
    { book: 'PSA', chapter: '16', verse: '4', code: 'transcription-marker' },
    { book: 'PSA', chapter: '88', verse: '84', code: 'source-label-anomaly' },
  ];
  const matches = addedFlags.length === expected.length && expected.every((e) =>
    addedFlags.some((a) => a.book === e.book && a.chapter === e.chapter && a.verse === e.verse && a.code === e.code));
  out('only-two-targeted-new-flags', !flagProblem && matches,
    flagProblem || addedFlags.map((a) => `${a.book} ${a.chapter}:${a.verse} ${a.code}`).join('; ') || 'none');
  out('psa16-4-stray-numeral-explained', addedFlags.some((a) => a.book === 'PSA' && a.chapter === '16' && a.verse === '4' && /\(4\)/.test(a.note) && /stray inline verse numeral/.test(a.note)),
    addedFlags.find((a) => a.book === 'PSA' && a.chapter === '16' && a.verse === '4')?.note || 'missing');
  out('psa88-84-anomaly-explained', addedFlags.some((a) => a.book === 'PSA' && a.chapter === '88' && a.verse === '84' && /48 would be expected/.test(a.note) && /not renumbered/.test(a.note)),
    addedFlags.find((a) => a.book === 'PSA' && a.chapter === '88' && a.verse === '84')?.note || 'missing');
}

// ---------------------------------------------------------------------------
// 3. Notices: only LJE gains exactly one notice; all other notices identical.
// ---------------------------------------------------------------------------
const addedNotices = [];
let noticeProblem = null;
for (let bi = 0; bi < before.books.length; bi++) {
  const A = before.books[bi];
  const B = after.books[bi];
  const na = A.notices || [];
  const nb = B.notices || [];
  for (const n of na) if (!nb.includes(n)) { noticeProblem = `${A.id}: old notice removed`; break; }
  if (noticeProblem) break;
  const added = nb.filter((n) => !na.includes(n));
  if (added.length !== nb.length - na.length) { noticeProblem = `${A.id}: notice list not a superset`; break; }
  for (const n of added) addedNotices.push({ book: B.id, notice: n });
}
{
  const ljeAdded = addedNotices.filter((a) => a.book === 'LJE');
  const others = addedNotices.filter((a) => a.book !== 'LJE');
  out('only-lje-adds-one-notice', !noticeProblem && ljeAdded.length === 1 && others.length === 0,
    noticeProblem || addedNotices.map((a) => a.book).join(',') || 'none');
  out('lje-notice-navigation-container', ljeAdded.length === 1 && /no chapter division/.test(ljeAdded[0].notice) && /navigation container/.test(ljeAdded[0].notice) && /not an upstream chapter label/.test(ljeAdded[0].notice),
    ljeAdded[0]?.notice || 'missing');
}

// ---------------------------------------------------------------------------
// 4. Top-level metadata and changes list.
// ---------------------------------------------------------------------------
out('source-metadata-unchanged', JSON.stringify(before.source) === JSON.stringify(after.source));
out('license-metadata-unchanged', JSON.stringify(before.license) === JSON.stringify(after.license));
out('excluded-metadata-unchanged', JSON.stringify(before.excluded) === JSON.stringify(after.excluded));
out('missing-metadata-unchanged', JSON.stringify(before.missing) === JSON.stringify(after.missing));
{
  const retained = before.changes.every((c) => after.changes.includes(c));
  const appended = after.changes.filter((c) => !before.changes.includes(c));
  out('changes-entries-retained-and-appended', retained && appended.length === 3,
    `before=${before.changes.length} after=${after.changes.length} appended=${appended.length}`);
}

// ---------------------------------------------------------------------------
// 5. Counts: books/chapters/verses/unnumbered unchanged; flagged delta computed.
// ---------------------------------------------------------------------------
function counts(data) {
  const c = { books: data.books.length, chapters: 0, verses: 0, unnumbered: 0, flagged: 0 };
  for (const b of data.books) {
    c.chapters += b.chapters.length;
    for (const ch of b.chapters) {
      for (const s of ch.segments) {
        if (s.kind === 'verse') c.verses++; else c.unnumbered++;
        if (s.flags && s.flags.length) c.flagged++;
      }
    }
  }
  return c;
}
{
  const a = counts(before);
  const b = counts(after);
  const unchanged = a.books === b.books && a.chapters === b.chapters && a.verses === b.verses && a.unnumbered === b.unnumbered;
  out('counts-48-1055-27048-100-unchanged', unchanged && b.books === 48 && b.chapters === 1055 && b.verses === 27048 && b.unnumbered === 100,
    JSON.stringify(b));
  out('flagged-delta-computed-two', b.flagged - a.flagged === 2 && b.flagged === 688, `${a.flagged} -> ${b.flagged}`);
}

// ---------------------------------------------------------------------------
// 6. Native invariants (Ps 88/115, Bel 36, LJE introduction + 72 verses).
// ---------------------------------------------------------------------------
const byId = (d, id) => d.books.find((b) => b.id === id);
const verseLabels = (d, id, ch) => (byId(d, id).chapters.find((c) => c.n === ch)?.segments || []).filter((s) => s.kind === 'verse').map((s) => s.l);
{
  const labels = verseLabels(after, 'PSA', '88');
  const i = labels.indexOf('84');
  out('native-ps88-47-84-49', i > 0 && labels[i - 1] === '47' && labels[i + 1] === '49', labels.slice(Math.max(0, i - 2), i + 3).join(','));
  out('native-ps115-no-label-6', !verseLabels(after, 'PSA', '115').includes('6'), verseLabels(after, 'PSA', '115').join(','));
  const bel = byId(after, 'BEL');
  const belVerses = bel.chapters[0].segments.filter((s) => s.kind === 'verse');
  out('native-bel-ends-36', belVerses.at(-1)?.l === '36' && bel.notices.join(' ').includes('37-42'), belVerses.at(-1)?.l);
  const lje = byId(after, 'LJE');
  const ljeSegs = lje.chapters[0].segments;
  const ljeVerses = ljeSegs.filter((s) => s.kind === 'verse');
  const ljeUnnumbered = ljeSegs.filter((s) => s.kind === 'unnumbered');
  const intro = ljeUnnumbered.some((s) => /ἐπιστολῆς/.test(s.t));
  out('native-lje-intro-and-72-verses', lje.chapters.length === 1 && ljeUnnumbered.length === 2 && ljeVerses.length === 72 && intro,
    `chapters=${lje.chapters.length} unnumbered=${ljeUnnumbered.length} verses=${ljeVerses.length} intro=${intro}`);
}

// ---------------------------------------------------------------------------
// 7. Raw XML: the Letter of Jeremiah has no upstream chapter division.
// ---------------------------------------------------------------------------
{
  const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false, parseTagValue: false, processEntities: true });
  const xml = fs.readFileSync(path.join(B_DIR, sourcePathFor(52)), 'utf8');
  const tree = parser.parse(xml);
  let chapterDivs = 0;
  let verseDivs = 0;
  const tagName = (node) => Object.keys(node).find((k) => k !== ':@');
  const walk = (nodes) => {
    for (const node of nodes) {
      if ('#text' in node) continue;
      const key = tagName(node);
      const attrs = node[':@'] || {};
      if (key === 'div' && attrs['@_subtype'] === 'chapter') chapterDivs++;
      if (key === 'div' && attrs['@_subtype'] === 'verse') verseDivs++;
      const arr = node[key];
      if (Array.isArray(arr)) walk(arr);
    }
  };
  walk(tree);
  out('lje-no-upstream-chapter-division', chapterDivs === 0, `chapter divs=${chapterDivs}`);
  out('lje-72-upstream-verse-divs', verseDivs === 72, `verse divs=${verseDivs}`);
}

// ---------------------------------------------------------------------------
// 8. Determinism: two regenerations match; shipped JS wraps the shipped JSON.
// ---------------------------------------------------------------------------
{
  const run1 = JSON.stringify(buildData());
  const run2 = JSON.stringify(buildData());
  out('regeneration-deterministic', run1 === run2 && sha256(run1) === sha256(run2), sha256(run1));
  out('shipped-json-matches-regeneration', afterJson === run1, `file=${sha256(afterJson)} rebuilt=${sha256(run1)}`);
  const expectedJs = `window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS['lxx-swete']=${afterJson};\n`;
  out('shipped-js-wraps-shipped-json', read('data/lxx-swete.js') === expectedJs);
}

// ---------------------------------------------------------------------------
// 9. Loader/static: versioned URL only, renderer reuse, no CSS/layout change.
// ---------------------------------------------------------------------------
{
  const app = read('app.js');
  const expectedUrl = "script.src = 'data/lxx-swete.js?v=disclosures-20261007';";
  out('loader-uses-versioned-url', app.includes(expectedUrl) && !/script\.src = 'data\/lxx-swete\.js';/.test(app));
  const css = read('style.css');
  out('renderer-and-css-reused', app.includes("marker.className = 'lxx-flag'") && app.includes("notices.className = 'lxx-notices'") && !/lxx-disclosures/.test(css));
}

// ---------------------------------------------------------------------------
// 10. Real file:// app: flag markers and LJE notice in BOTH renderers.
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, timeout = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) { /* keep polling */ }
    await sleep(25);
  }
  return false;
};
const fire = (w, el, type = 'change') => el.dispatchEvent(new w.Event(type, { bubbles: true }));

async function openApp() {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
    },
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', resolve, { once: true });
  });
  return dom;
}

const flagTitles = (container) => [...container.querySelectorAll('.lxx-flag')].map((n) => n.getAttribute('title') || '');
const ljeViewsOk = (container) => {
  const nums = [...container.querySelectorAll('.lxx-verse-num')].map((n) => n.textContent);
  const notice = container.querySelector('.lxx-notices')?.textContent || '';
  return nums.length === 72 && nums.at(-1) === '72' && !!container.querySelector('.lxx-unnumbered') && /navigation container/.test(notice);
};

try {
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;

  // Standalone LXX view.
  const view = d.querySelector('#view-mode');
  view.value = 'lxx';
  fire(w, view);
  await waitFor(() => d.querySelector('#results .lxx-banner'));
  const book = d.querySelector('#lxx-book');
  const chapter = d.querySelector('#lxx-chapter');
  book.value = 'PSA';
  fire(w, book);
  chapter.value = '16';
  fire(w, chapter);
  await waitFor(() => flagTitles(d.querySelector('#results')).some((t) => /\(4\)/.test(t)));
  out('standalone-psa16-4-flag-marker', flagTitles(d.querySelector('#results')).some((t) => /stray inline verse numeral/.test(t)),
    flagTitles(d.querySelector('#results')).join(' | '));
  chapter.value = '88';
  fire(w, chapter);
  await waitFor(() => flagTitles(d.querySelector('#results')).some((t) => /48 would be expected/.test(t)));
  out('standalone-psa88-84-flag-marker',
    [...d.querySelectorAll('#results .lxx-verse-num')].some((n) => n.textContent === '84' && n.parentElement.querySelector('.lxx-flag')),
    flagTitles(d.querySelector('#results')).join(' | '));
  book.value = 'LJE';
  fire(w, book);
  chapter.value = '1';
  fire(w, chapter);
  await waitFor(() => /navigation container/.test(d.querySelector('#results .lxx-notices')?.textContent || ''));
  out('standalone-lje-notice-and-intro', ljeViewsOk(d.querySelector('#results')), '72 verse numbers + 2 unnumbered + notice');

  // Parallel view (same renderer, independent container).
  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => d.querySelector('#parallel-lxx-content .lxx-verses'));
  const pBook = d.querySelector('#parallel-lxx-book');
  const pChapter = d.querySelector('#parallel-lxx-chapter');
  pBook.value = 'PSA';
  fire(w, pBook);
  pChapter.value = '16';
  fire(w, pChapter);
  await waitFor(() => flagTitles(d.querySelector('#parallel-lxx-content')).some((t) => /\(4\)/.test(t)));
  out('parallel-psa16-4-flag-marker', flagTitles(d.querySelector('#parallel-lxx-content')).some((t) => /stray inline verse numeral/.test(t)),
    flagTitles(d.querySelector('#parallel-lxx-content')).join(' | '));
  pChapter.value = '88';
  fire(w, pChapter);
  await waitFor(() => flagTitles(d.querySelector('#parallel-lxx-content')).some((t) => /48 would be expected/.test(t)));
  out('parallel-psa88-84-flag-marker',
    [...d.querySelectorAll('#parallel-lxx-content .lxx-verse-num')].some((n) => n.textContent === '84' && n.parentElement.querySelector('.lxx-flag')),
    flagTitles(d.querySelector('#parallel-lxx-content')).join(' | '));
  pBook.value = 'LJE';
  fire(w, pBook);
  pChapter.value = '1';
  fire(w, pChapter);
  await waitFor(() => /navigation container/.test(d.querySelector('#parallel-lxx-content .lxx-notices')?.textContent || ''));
  out('parallel-lje-notice-and-intro', ljeViewsOk(d.querySelector('#parallel-lxx-content')), '72 verse numbers + 2 unnumbered + notice');
  dom.window.close();
} catch (error) {
  out('render-checks', false, error.message);
}

// ---------------------------------------------------------------------------
// 11. Canon view regression against the existing pre-change baseline.
// ---------------------------------------------------------------------------
const REGRESSION_CHAPTERS = [
  ['GEN', '1'], ['EXO', '20'], ['PSA', '23'], ['PSA', '119'], ['ISA', '53'],
  ['JER', '25'], ['DAN', '3'], ['SIR', '1'], ['MAT', '5'], ['JHN', '1'],
];
try {
  if (!fs.existsSync(STAGE1B_BEFORE)) throw new Error(`missing ${path.relative(root, STAGE1B_BEFORE)}`);
  const baseline = JSON.parse(fs.readFileSync(STAGE1B_BEFORE, 'utf8'));
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  const kjv = [...d.querySelectorAll('#translations input[type="checkbox"]')].find((b) => b.value === 'kjv');
  if (kjv && !kjv.checked) { kjv.checked = true; fire(w, kjv); }
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.web && w.MARANATHA_TRANSLATIONS.kjv);
  const bookSelect = d.querySelector('#book');
  const chapterSelect = d.querySelector('#chapter');
  const diffs = [];
  for (const [b, c] of REGRESSION_CHAPTERS) {
    bookSelect.value = b;
    fire(w, bookSelect);
    chapterSelect.value = c;
    fire(w, chapterSelect);
    const key = `${b} ${c}`;
    if (baseline[key] !== d.querySelector('#results').innerHTML) diffs.push(key);
  }
  dom.window.close();
  out('canon-view-unchanged', diffs.length === 0, diffs.length ? `differs: ${diffs.join(', ')}` : `${REGRESSION_CHAPTERS.length} WEB+KJV chapters byte-identical`);
} catch (error) {
  out('canon-view-unchanged', false, error.message);
}

// ---------------------------------------------------------------------------
// 12. Cache policy: versioned URL is a distinct key; stale unversioned copy
//     cannot satisfy it; the new file is cached under the exact URL and works
//     offline. Realistic CacheStorage mock honoring ignoreSearch, query and origin.
// ---------------------------------------------------------------------------
const ORIGIN = 'https://example.test';
function makeRealisticCaches() {
  const stores = new Map();
  const norm = (request, ignoreSearch) => {
    const raw = typeof request === 'string' ? new URL(request, ORIGIN).href : request.url;
    const u = new URL(raw);
    return ignoreSearch ? `${u.origin}${u.pathname}` : u.href;
  };
  const makeResponse = (url, body) => ({ url, type: 'basic', ok: true, body, clone() { return this; } });
  const cacheFor = (name) => {
    const map = stores.get(name);
    return {
      async addAll(urls) { for (const u of urls) map.set(norm(new URL(u, ORIGIN).href, false), makeResponse(u, `shell:${u}`)); },
      async match(request, options = {}) { return map.get(norm(request, !!options.ignoreSearch)); },
      async put(request, response) { map.set(norm(request, false), response); },
    };
  };
  return {
    stores,
    async open(name) { if (!stores.has(name)) stores.set(name, new Map()); return cacheFor(name); },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
}
function loadServiceWorker(caches, fetchImpl) {
  const listeners = {};
  const self = {
    addEventListener(type, cb) { (listeners[type] = listeners[type] || []).push(cb); },
    skipWaiting() {},
    clients: { claim: async () => {} },
    location: { origin: ORIGIN },
  };
  const sandbox = { self, caches, fetch: fetchImpl, URL, console, Promise, Date, setTimeout, clearTimeout };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('service-worker.js'), sandbox, { filename: 'service-worker.js' });
  return { sandbox, listeners };
}
async function fireFetch(listeners, request) {
  let responded = false;
  let promise;
  const event = { request, respondWith(x) { responded = true; promise = Promise.resolve(x); } };
  for (const cb of listeners.fetch || []) cb(event);
  if (!responded) return { responded: false, response: undefined };
  return { responded: true, response: await promise };
}
try {
  const caches = makeRealisticCaches();
  const makeResponse = (url, body) => ({ url, type: 'basic', ok: true, body, clone() { return this; } });
  const dataCache = await caches.open('maranatha-data-v3');
  await dataCache.put(`${ORIGIN}/Maranatha/data/lxx-swete.js`, makeResponse(`${ORIGIN}/Maranatha/data/lxx-swete.js`, 'OLD-UNVERSIONED-LXX'));
  await dataCache.put(`${ORIGIN}/Maranatha/data/web.js`, makeResponse(`${ORIGIN}/Maranatha/data/web.js`, 'WEB'));

  const VERSIONED = `${ORIGIN}/Maranatha/data/lxx-swete.js?v=disclosures-20261007`;
  const network = { calls: [], offline: false, bodies: new Map([[VERSIONED, 'NEW-VERSIONED-LXX']]) };
  const fetchImpl = async (request) => {
    const url = typeof request === 'string' ? new URL(request, ORIGIN).href : request.url;
    network.calls.push(url);
    if (network.offline) throw new Error('offline');
    const body = network.bodies.get(url);
    return body === undefined ? { url, type: 'basic', ok: false, clone() { return this; } } : makeResponse(url, body);
  };

  const env = loadServiceWorker(caches, fetchImpl);
  const request = { method: 'GET', url: VERSIONED, mode: 'no-cors' };

  const first = await fireFetch(env.listeners, request);
  await sleep(10);
  out('versioned-url-cache-miss-then-fetch', first.responded && first.response?.body === 'NEW-VERSIONED-LXX' && network.calls.includes(VERSIONED),
    `responded=${first.responded} body=${first.response?.body} calls=${network.calls.length}`);
  const cachedVersioned = await dataCache.match(request, { ignoreSearch: false });
  const staleUnversioned = await dataCache.match(`${ORIGIN}/Maranatha/data/lxx-swete.js`, { ignoreSearch: false });
  out('new-lxx-cached-under-exact-versioned-url', cachedVersioned?.body === 'NEW-VERSIONED-LXX', cachedVersioned?.body || 'missing');
  out('stale-unversioned-cannot-satisfy-versioned', staleUnversioned?.body === 'OLD-UNVERSIONED-LXX' && cachedVersioned?.body !== staleUnversioned?.body);
  out('downloaded-translations-preserved', (await dataCache.match(`${ORIGIN}/Maranatha/data/web.js`, { ignoreSearch: false }))?.body === 'WEB');

  network.offline = true;
  network.calls.length = 0;
  const offline = await fireFetch(env.listeners, request);
  out('offline-versioned-load-works', offline.responded && offline.response?.body === 'NEW-VERSIONED-LXX' && network.calls.length === 0,
    `body=${offline.response?.body} network=${network.calls.length}`);

  const cross = await fireFetch(env.listeners, { method: 'GET', url: 'https://other.test/Maranatha/data/x.js', mode: 'no-cors' });
  out('cross-origin-left-untouched', cross.responded === false);
} catch (error) {
  out('cache-policy-checks', false, error.message);
}

// ---------------------------------------------------------------------------
// Run summary.
// ---------------------------------------------------------------------------
let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`check-lxx-disclosures: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
