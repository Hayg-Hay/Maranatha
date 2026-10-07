// Stage 1 acceptance check for the Swete LXX import.
//
//   node build/check-stage1.mjs --capture-before   # snapshot canon view (run on the base app)
//   node build/check-stage1.mjs                    # run every invariant, one PASS/FAIL line each
//
// The canon-view regression is captured from WEB+KJV BEFORE any UI change; the
// stored snapshot lives in build/cache/stage1-before.json (gitignored).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const BASE = path.join(here, 'sources', 'lxx-swete');
const B_DIR = path.join(BASE, 'B');
const CACHE = path.join(here, 'cache');
const BEFORE = path.join(CACHE, 'stage1-before.json');

const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lxx-swete.json'), 'utf8'));
const canonCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data', 'canon.js'), 'utf8'), canonCtx);
const canonIds = new Set(canonCtx.window.MARANATHA_CANON.books.map((b) => b.id));

const byId = new Map(data.books.map((b) => [b.id, b]));
const bookLabel = (id) => data.books.find((b) => b.id === id)?.label || id;

// ---------------------------------------------------------------------------
// Independent raw-source character accounting (does NOT reuse the importer's
// parser): read every TEI text node under <body>, exclude apparatus/headings
// by structure, normalize to NFC, drop whitespace, and count per chapter.
// ---------------------------------------------------------------------------
const xmlParser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false, parseTagValue: false, processEntities: true });
const tagName = (node) => Object.keys(node).find((k) => k !== ':@');
function findTag(nodes, tag) {
  for (const node of nodes) {
    if ('#text' in node) continue;
    const key = tagName(node);
    if (!Array.isArray(node[key])) continue;
    if (key === tag) return node[key];
    const found = findTag(node[key], tag);
    if (found) return found;
  }
  return null;
}
function rawByChapter(xmlText) {
  const body = findTag(xmlParser.parse(xmlText), 'body');
  const counts = new Map();
  let current = null;
  const add = (text) => {
    if (current === null) current = '1';
    const stripped = String(text).normalize('NFC').replace(/\s/gu, '');
    counts.set(current, (counts.get(current) || 0) + stripped.length);
  };
  const walk = (nodes) => {
    for (const node of nodes) {
      if ('#text' in node) { add(node['#text']); continue; }
      const key = tagName(node);
      if (!Array.isArray(node[key])) continue;
      if (key === 'note' || key === 'app' || key === 'head') continue;
      const attrs = node[':@'] || {};
      if (key === 'div' && attrs['@_subtype'] === 'chapter') { current = String(attrs['@_n']); }
      walk(node[key]);
    }
  };
  walk(body);
  return counts;
}

const nonWs = (segments) => segments.reduce((n, s) => n + s.t.replace(/\s/gu, '').length, 0);
const verseSegments = (book, chapterLabel) => book.chapters.find((c) => c.n === chapterLabel)?.segments.filter((s) => s.kind === 'verse') || [];
const allSegments = (book, chapterLabel) => book.chapters.find((c) => c.n === chapterLabel)?.segments || [];

// ---------------------------------------------------------------------------
// Canon-view regression harness (WEB + KJV).
// ---------------------------------------------------------------------------
const REGRESSION_CHAPTERS = [
  ['GEN', '1'], ['EXO', '20'], ['PSA', '23'], ['PSA', '119'], ['ISA', '53'],
  ['JER', '25'], ['DAN', '3'], ['SIR', '1'], ['MAT', '5'], ['JHN', '1'],
];

const waitFor = (fn, timeout = 20000) => new Promise((resolve, reject) => {
  const start = Date.now();
  const tick = () => {
    let value;
    try { value = fn(); } catch (error) { return reject(error); }
    if (value) return resolve(value);
    if (Date.now() - start > timeout) return reject(new Error('timed out waiting for condition'));
    setTimeout(tick, 25);
  };
  tick();
});

async function renderCanonViews() {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({ get matches() { return query.includes('max-width') && !!window.narrowTest; }, addEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
    },
  });
  const { window } = dom;
  const { document } = window;
  await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

  const kjvBox = [...document.querySelectorAll('#translations input[type="checkbox"]')].find((box) => box.value === 'kjv');
  if (kjvBox && !kjvBox.checked) {
    kjvBox.checked = true;
    kjvBox.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
  await waitFor(() => window.MARANATHA_TRANSLATIONS && window.MARANATHA_TRANSLATIONS.web && window.MARANATHA_TRANSLATIONS.kjv);

  const bookSelect = document.querySelector('#book');
  const chapterSelect = document.querySelector('#chapter');
  const results = {};
  for (const [bookId, chapter] of REGRESSION_CHAPTERS) {
    bookSelect.value = bookId;
    bookSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    chapterSelect.value = chapter;
    chapterSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    results[`${bookId} ${chapter}`] = document.querySelector('#results').innerHTML;
  }
  dom.window.close();
  return results;
}

async function renderLxxProbe() {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({ get matches() { return query.includes('max-width') && !!window.narrowTest; }, addEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
    },
  });
  const { window } = dom;
  const { document } = window;
  await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

  const view = document.querySelector('#view-mode');
  view.value = 'lxx';
  view.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitFor(() => document.querySelector('#results .lxx-banner'));
  const banner = document.querySelector('#results .lxx-banner').textContent;

  const bookSelect = document.querySelector('#lxx-book');
  bookSelect.value = 'PSA';
  bookSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  const chapterSelect = document.querySelector('#lxx-chapter');
  chapterSelect.value = '88';
  chapterSelect.dispatchEvent(new window.Event('change', { bubbles: true }));

  const numbers = [...document.querySelectorAll('#results .lxx-verse-num')].map((n) => n.textContent);
  const attribution = document.querySelector('#lxx-attribution');
  const result = {
    banner,
    has84: numbers.includes('84'),
    attributionVisible: !attribution.hidden,
    attributionText: attribution.textContent,
    flagMarkers: document.querySelectorAll('#results .lxx-flag').length >= 0,
  };
  dom.window.close();
  return result;
}

// ---------------------------------------------------------------------------
// Invariant definitions.
// ---------------------------------------------------------------------------
const checks = [];
const add = (name, fn) => checks.push({ name, fn });

add('source-labels-psa88', () => {
  const labels = verseSegments(byId.get('PSA'), '88').map((s) => s.l);
  const i = labels.indexOf('84');
  const ok = i > 0 && labels[i - 1] === '47' && labels[i + 1] === '49';
  return { ok, detail: ok ? 'Ps 88 ...47,84,49 preserved' : `Ps 88 labels around 84: ${labels.slice(Math.max(0, i - 2), i + 3).join(',')}` };
});

add('source-labels-psa115-no6', () => {
  const labels = verseSegments(byId.get('PSA'), '115').map((s) => s.l);
  const ok = !labels.includes('6');
  return { ok, detail: ok ? 'Ps 115 has no label 6' : `Ps 115 unexpectedly has label 6: ${labels.join(',')}` };
});

add('source-text-psa129-unique', () => {
  const segments = allSegments(byId.get('PSA'), '129');
  const texts = segments.map((s) => s.t);
  const labels = segments.filter((s) => s.kind === 'verse').map((s) => s.l);
  const hasNested = labels.includes('4') && labels.includes('8');
  const ok = new Set(texts).size === texts.length && hasNested;
  return { ok, detail: ok ? `Ps 129 labels ${labels.join(',')}; no duplicated text` : `Ps 129 labels ${labels.join(',')}, unique ${new Set(texts).size}/${texts.length}` };
});

add('books-45-in-canon', () => {
  const books = data.books.filter((b) => b.kind === 'book');
  const components = data.books.filter((b) => b.kind === 'component').map((b) => b.id);
  const ok = books.length === 45 && books.every((b) => canonIds.has(b.id)) && ['LJE', 'SUS', 'BEL'].every((id) => components.includes(id));
  return { ok, detail: ok ? `45 in-canon books + components ${components.join(',')}` : `books=${books.length}, components=${components.join(',')}` };
});

add('excluded-absent', () => {
  const required = ['1 Esdras', '3 Maccabees', '4 Maccabees', 'Odes (including Prayer of Manasseh)', 'Psalms of Solomon', 'Psalm 151'];
  const okExcluded = required.every((name) => data.excluded.some((e) => e.name === name));
  const psa = byId.get('PSA');
  const okAbsent = !psa.chapters.some((c) => c.n === '151') && !data.books.some((b) => ['1ES', '3MA', '4MA'].includes(b.id));
  const ok = okExcluded && okAbsent;
  return { ok, detail: ok ? 'excluded works recorded and absent' : `excluded=${okExcluded}, absent=${okAbsent}` };
});

add('missing-ecclesiastes', () => {
  const ok = data.missing.some((m) => m.id === 'ECC' && /not available/.test(m.reason));
  return { ok, detail: ok ? 'Ecclesiastes recorded as not available' : JSON.stringify(data.missing) };
});

add('daniel-theodotion-only', () => {
  const dan = byId.get('DAN');
  const sus = byId.get('SUS');
  const bel = byId.get('BEL');
  const ok = dan.sourceFile.includes('tlg057') && sus.sourceFile.includes('tlg055') && bel.sourceFile.includes('tlg059')
    && !data.books.some((b) => ['tlg054', 'tlg056', 'tlg058'].some((t) => b.sourceFile.includes(t)));
  return { ok, detail: ok ? 'Daniel=SUS/BEL Theodotion only (no Old Greek)' : `DAN=${dan.sourceFile} SUS=${sus.sourceFile} BEL=${bel.sourceFile}` };
});

add('bel-truncation-notice', () => {
  const bel = byId.get('BEL');
  const verses = bel.chapters[0].segments.filter((s) => s.kind === 'verse');
  const last = verses.at(-1);
  const notice = bel.notices.join(' ');
  const ok = last && last.l === '36' && /14:36/.test(notice) && /37-42/.test(notice);
  return { ok, detail: ok ? 'Bel ends at 1:36 with 14:36 / 37-42 truncation notice' : `last=${last && last.l}; notice=${notice.slice(0, 120)}` };
});

add('detached-text-present', () => {
  const chaptersWithUnnumbered = (id) => byId.get(id).chapters.some((c) => c.segments.some((s) => s.kind === 'unnumbered'));
  const lje = byId.get('LJE');
  const ljeIntro = lje.chapters.some((c) => c.segments.some((s) => s.kind === 'unnumbered' && /ἐπιστολῆς/.test(s.t)));
  const est = byId.get('EST').chapters.some((c) => c.n === 'prologue');
  const psaTitles = chaptersWithUnnumbered('PSA');
  const ok = ljeIntro && est && psaTitles;
  return { ok, detail: ok ? 'Letter intro, Esther prologue, Psalm titles present' : `LJE=${ljeIntro}, EST prologue=${est}, PSA titles=${psaTitles}` };
});

add('source-hashes', () => {
  for (const file of data.source.files) {
    const bytes = fs.readFileSync(path.join(B_DIR, file.path));
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (hash !== file.sha256) return { ok: false, detail: `hash mismatch: ${file.path}` };
  }
  return { ok: true, detail: `${data.source.files.length} pinned source files verified` };
});

add('text-count-integrity', () => {
  let sourceTotal = 0;
  let shippedTotal = 0;
  for (const file of data.source.files) {
    const raw = rawByChapter(fs.readFileSync(path.join(B_DIR, file.path), 'utf8'));
    let rawTotal = 0;
    for (const [chapter, count] of raw) {
      if (file.path.includes('tlg027') && chapter === '151') continue;
      rawTotal += count;
    }
    const shipped = data.books.filter((b) => b.sourceFile === file.path).reduce((n, b) => n + b.chapters.reduce((m, c) => m + nonWs(c.segments), 0), 0);
    if (rawTotal !== shipped) return { ok: false, detail: `${file.path}: source=${rawTotal} shipped=${shipped}` };
    sourceTotal += rawTotal;
    shippedTotal += shipped;
  }
  return { ok: true, detail: `source=${sourceTotal} shipped=${shippedTotal} across ${data.source.files.length} files` };
});

add('canon-view-regression', () => {
  if (!fs.existsSync(BEFORE)) return { ok: false, detail: `missing ${path.relative(root, BEFORE)} (run --capture-before on the base app)` };
  const before = JSON.parse(fs.readFileSync(BEFORE, 'utf8'));
  return renderCanonViews().then((after) => {
    const diffs = REGRESSION_CHAPTERS.map(([b, c]) => `${b} ${c}`).filter((key) => before[key] !== after[key]);
    return { ok: diffs.length === 0, detail: diffs.length ? `differs: ${diffs.join(', ')}` : `${REGRESSION_CHAPTERS.length} WEB+KJV chapters identical` };
  });
});

add('lxx-view-renders', () => renderLxxProbe().then((result) => {
  const ok = /native LXX numbering/.test(result.banner) && result.has84 && result.attributionVisible && /Swete/.test(result.attributionText);
  return {
    ok,
    detail: ok ? 'banner, Ps 88 label 84, footer attribution rendered in native view'
      : `banner=${result.banner}; has84=${result.has84}; attribution=${result.attributionVisible}:${result.attributionText.slice(0, 40)}`,
  };
}));

// ---------------------------------------------------------------------------
// Run.
// ---------------------------------------------------------------------------
if (process.argv.includes('--capture-before')) {
  const snapshot = await renderCanonViews();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(BEFORE, JSON.stringify(snapshot, null, 2));
  console.log(`canon-view baseline written: ${path.relative(root, BEFORE)} (${Object.keys(snapshot).length} chapters)`);
} else {
  let failures = 0;
  for (const { name, fn } of checks) {
    let result;
    try { result = await fn(); } catch (error) { result = { ok: false, detail: error.message }; }
    const word = result.ok ? 'PASS' : 'FAIL';
    if (!result.ok) failures++;
    console.log(`${word}  ${name}  ${result.detail || ''}`.trimEnd());
  }
  console.log(`check-stage1: ${checks.length - failures} pass / ${failures} fail`);
  if (failures) process.exitCode = 1;
}
