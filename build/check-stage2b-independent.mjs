// Stage 2b acceptance check: Genesis 2-5 proposal coverage in the aligned pilot.
//
//   node build/check-stage2b.mjs
//
// One PASS/FAIL line per invariant. Local file:// only (classic <script> tags).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..'));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const native = readJson('data/lxx-swete.json');
const mapping = readJson('data/lxx-swete-alignment.json');

const results = [];
const out = (name, ok, detail) => results.push([name, !!ok, detail || '']);
const fire = (w, el, type = 'change') => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const waitFor = (fn, timeout = 30000) => new Promise((resolve, reject) => {
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

async function openApp({ narrow = false } = {}) {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({
        get matches() { return narrow && query.includes('700px'); },
        addEventListener() {}, removeEventListener() {},
      });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
    },
  });
  const { window } = dom;
  await new Promise((resolve) => {
    if (window.document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  await waitFor(() => window.MARANATHA_TRANSLATIONS && window.MARANATHA_TRANSLATIONS.web);
  return dom;
}

async function enablePilot(dom) {
  const w = dom.window;
  const d = w.document;
  const box = d.querySelector('#lxx-alignment-pilot');
  box.checked = true;
  fire(w, box);
  await waitFor(() => w.MARANATHA_LXX_ALIGNMENT && w.MARANATHA_VERSIFICATION_SCHEMES
    && w.MARANATHA_TRANSLATIONS['lxx-swete'] && d.querySelector('#results .aligned-cell'));
}

async function goChapter(dom, bookId, chapter) {
  const w = dom.window;
  const d = w.document;
  const book = d.querySelector('#book');
  book.value = bookId; fire(w, book);
  const ch = d.querySelector('#chapter');
  ch.value = String(chapter); fire(w, ch);
  await new Promise((resolve) => setTimeout(resolve, 40));
}

const aligned = (d) => [...d.querySelectorAll('#results .aligned-cell')];
const correspondences = (d) => [...d.querySelectorAll('#results .aligned-cell.aligned-correspondence')];
const nativeChapter = (chapter) => native.books.find((b) => b.id === 'GEN')
  .chapters.find((c) => String(c.n) === String(chapter));

const { createHash } = await import('node:crypto');
const hash = s => createHash('sha256').update(s).digest('hex');
const ledger = readJson('build/reviews/lxx-genesis2-5-evidence.json');
const corpora = Object.fromEntries(['web', 'kjv', 'he'].map(k => [k, readJson(`data/${k}.json`)]));
let exact = ledger.rows.length === 106 && ledger.review.humanApproval === null;
let targets = 0;
for (const r of ledger.rows) {
  const s = nativeChapter(r.from.chapter).segments.find(s => s.kind === r.from.kind && s.l === r.from.label);
  exact &&= !!s && s.t === r.texts.greek && hash(s.t) === r.textHashes.greek
    && JSON.stringify(s.flags || []) === JSON.stringify(r.sourceFlags) && r.status === 'proposal';
  for (const t of r.targets) {
    targets++;
    for (const k of ['web', 'kjv', 'he']) {
      const actual = corpora[k].books[t.to.book][t.to.chapter - 1][t.to.verse - 1];
      exact &&= actual === t.texts[k] && hash(actual) === t.textHashes[k];
    }
  }
}
out('independent-106-source-and-108-target-exact-text-hash-flags', exact && targets === 108);

for (const narrow of [false, true]) {
  const dom = await openApp({narrow});
  await enablePilot(dom);
  const d = dom.window.document;
  const mode = narrow ? 'mobile' : 'desktop';
  for (const [sourceChapter, queries] of [
    [3, ['Genesis 2:25;Genesis 3:1', 'Genesis 3:1;Genesis 2:25', 'Genesis 2:25', 'Genesis 3:1']],
    [6, ['Genesis 5:32;Genesis 6:1', 'Genesis 6:1;Genesis 5:32', 'Genesis 5:32', 'Genesis 6:1']],
  ]) {
    for (const query of queries) {
      d.querySelector('#reference').value = query;
      d.querySelector('#reference-go').click();
      await new Promise(resolve => setTimeout(resolve, 80));
      const texts = [...d.querySelectorAll('#results .aligned-cell .lxx-text')];
      const expected = nativeChapter(sourceChapter).segments.find(s => s.kind === 'verse' && s.l === '1').t;
      out(`${mode}-${query}-full-source-once`, texts.length === 1 && texts[0].textContent === expected);
      const checkbox = d.querySelector('#lxx-alignment-pilot');
      checkbox.checked = false; fire(dom.window, checkbox);
      checkbox.checked = true; fire(dom.window, checkbox);
      await new Promise(resolve => setTimeout(resolve, 80));
      const again = [...d.querySelectorAll('#results .aligned-cell .lxx-text')];
      out(`${mode}-${query}-toggle-resets-dedup`, again.length === 1 && again[0].textContent === expected);
    }
  }
  dom.window.close();
}
const { pathToFileURL } = await import('node:url');
const { validateMapping } = await import(pathToFileURL(path.join(root, 'build/validate-verse-mapping.mjs')).href);
for (const [name, mutate] of [
  ['wrong-bound-target-hash', e => e.provenance.targetEvidence[0].textHashes.web = '0'.repeat(64)],
  ['removed-target-evidence', e => e.provenance.targetEvidence.pop()],
  ['duplicated-target-evidence', e => e.provenance.targetEvidence.push(structuredClone(e.provenance.targetEvidence[0]))],
  ['wrong-ledger-reference', e => e.provenance.ledger = 'build/reviews/lxx-genesis1-evidence.json'],
]) {
  const bad = structuredClone(mapping);
  mutate(bad.entries.find(e => e.provenance.rowId === 'GEN3-1'));
  out(`independent-reject-${name}`, !validateMapping(bad, {native, root}).ok);
}
for (const [name, ok] of results) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
const failures = results.filter(r => !r[1]).length;
console.log(`independent-stage2b: ${results.length - failures} pass / ${failures} fail`);
process.exitCode = failures ? 1 : 0;



