// Stage 2c acceptance check: Genesis 6-15 proposal coverage in the aligned pilot.
//
//   node build/check-stage2c.mjs
//
// One PASS/FAIL line per invariant. Local file:// only (classic <script> tags).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
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

async function goChapter(dom, chapter) {
  const w = dom.window;
  const d = w.document;
  const book = d.querySelector('#book');
  book.value = 'GEN'; fire(w, book);
  const ch = d.querySelector('#chapter');
  ch.value = String(chapter); fire(w, ch);
  await new Promise((resolve) => setTimeout(resolve, 45));
}

const aligned = (d) => [...d.querySelectorAll('#results .aligned-cell')];
const correspondences = (d) => [...d.querySelectorAll('#results .aligned-cell.aligned-correspondence')];
const nativeChapter = (chapter) => native.books.find((b) => b.id === 'GEN')
  .chapters.find((c) => String(c.n) === String(chapter));

function staticChecks() {
  out('mapping-covers-genesis1-15',
    mapping.scope.covered.map((c) => c.chapter).join(',') === '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15');
  out('mapping-third-ledger-bound',
    mapping.bindings.ledger3 && mapping.bindings.ledger3.path === 'build/reviews/lxx-genesis6-15-evidence.json'
      && mapping.bindings.ledger && mapping.bindings.ledger2);
  out('existing-6-1-reused-not-duplicated',
    mapping.groups.filter((g) => g.id === 'GEN6-1').length === 1
      && mapping.groups.find((g) => g.id === 'GEN6-1').targets.length === 2);
  out('spanning-15-18-group',
    (() => { const g = mapping.groups.find((x) => x.id === 'GEN15-18');
      return !!g && g.sources.length === 1 && g.targets.length === 4
        && g.targets.some((t) => t.verse === 18) && g.targets.some((t) => t.verse === 21); })());
}

async function chapterChecks(dom, label) {
  const d = dom.window.document;
  await enablePilot(dom);
  const ctx = { window: {} };
  vm.runInNewContext(read('verse-mapping.js'), ctx);
  const resolver = ctx.window.MARANATHA_VERSE_MAPPING.createResolver(mapping, { native });

  const counts = [[6, 22], [7, 24], [8, 22], [9, 29], [10, 32], [11, 32], [12, 20], [13, 18], [14, 24], [15, 21]];
  for (const [chapter, expected] of counts) {
    await goChapter(dom, chapter);
    out(`${label}-genesis${chapter}-correspondence-cells`, correspondences(d).length === expected, String(correspondences(d).length));
  }

  // 15:18 spanning: full source once at row 18, shared reference at 19-21.
  await goChapter(dom, 15);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    const seg = nativeChapter(15).segments.find((s) => s.kind === 'verse' && s.l === '18');
    const full18 = rows[17].querySelectorAll('.aligned-cell .lxx-text');
    const shared = [18, 19, 20].map((i) => rows[i].querySelector('.aligned-cell'));
    out(`${label}-15-18-full-source-once`,
      full18.length === 1 && full18[0].textContent === seg.t
        && /targets 18/.test(rows[17].querySelector('.aligned-note')?.textContent || ''));
    out(`${label}-15-19-21-shared-reference`,
      shared.every((c) => c && c.querySelectorAll('.lxx-text').length === 0
        && c.querySelectorAll('.aligned-shared-reference').length === 1));
    out(`${label}-15-chapter-single-greek-source`,
      d.querySelectorAll('#results .aligned-cell .lxx-text').length === 18);
  }

  // Single targets 19/20/21 show complete actual source once.
  for (const v of [19, 20, 21]) {
    d.querySelector('#reference').value = `Genesis 15:${v}`;
    d.querySelector('#reference-go').click();
    await waitFor(() => new RegExp(`15:${v}`).test(d.querySelector('#results').textContent));
    out(`${label}-single-15-${v}-complete-source`,
      d.querySelectorAll('#results .aligned-cell .lxx-text').length === 1
        && /Greek 15:18/.test(d.querySelector('#results .aligned-note')?.textContent || ''));
  }

  // Reverse-order combined references still render the source once.
  d.querySelector('#reference').value = 'Genesis 15:20;Genesis 15:18';
  d.querySelector('#reference-go').click();
  await waitFor(() => /15:20/.test(d.querySelector('#results').textContent));
  out(`${label}-reverse-order-15-18-combined-no-duplicate`,
    d.querySelectorAll('#results .aligned-cell .lxx-text').length === 1);

  // Source text/flags exact for chapters 6-15.
  let exact = true;
  let detail = '';
  for (const chapter of [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    await goChapter(dom, chapter);
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    for (let v = 1; v <= rows.length; v++) {
      const expected = resolver.resolveTarget('GEN', chapter, v);
      if (expected.state !== 'correspondence') continue;
      const cell = rows[v - 1].querySelector('.aligned-cell');
      const members = cell ? [...cell.querySelectorAll('.aligned-source')].filter((s) => s.querySelector('.lxx-text')) : [];
      // 15:19-21 share their source; the expected single member is shown elsewhere.
      if (expected.groupId === 'GEN15-18' && v >= 19) continue;
      if (members.length !== expected.members.length) { exact = false; detail = `GEN ${chapter}:${v} members ${members.length}/${expected.members.length}`; break; }
      for (let i = 0; i < members.length; i++) {
        const gotRef = members[i].querySelector('.aligned-source-ref')?.textContent || '';
        const gotText = members[i].querySelector('.lxx-text')?.textContent || '';
        const flags = members[i].querySelectorAll('.lxx-flag').length;
        if (gotRef !== expected.members[i].refLabel || gotText !== expected.members[i].text) {
          exact = false; detail = `GEN ${chapter}:${v} member ${i} "${gotRef}"`; break;
        }
        if (flags !== expected.members[i].flags.length) { exact = false; detail = `GEN ${chapter}:${v} flags ${flags}/${expected.members[i].flags.length}`; break; }
      }
      if (!exact) break;
    }
    if (!exact) break;
  }
  out(`${label}-genesis6-15-source-text-flags-exact`, exact, detail);

  // Genealogy differences preserved: source 11:12 has Cainan, comparison Shelah.
  const s1112 = nativeChapter(11).segments.find((s) => s.kind === 'verse' && s.l === '12');
  out(`${label}-cainan-difference-preserved`,
    /καιν[άα]ν/.test(s1112.t) && /135|ριάκοντα πέντε/.test(s1112.t));
  const s1125 = nativeChapter(5).segments.find((s) => s.kind === 'verse' && s.l === '25');
  out(`${label}-focused-ages-unchanged`,
    /ἑκατὸν καὶ ὀγδοήκοντα ἑπτὰ/.test(s1125.t) && /ἑβδομήκοντα ἐννέα/.test(nativeChapter(11).segments.find((s) => s.l === '24').t));

  // Damaged source notices present.
  await goChapter(dom, 8);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    out(`${label}-damaged-8-22-notice`, /shall not cease|incomplete|damaged/i.test(rows[21].querySelector('.aligned-note')?.textContent || ''));
  }
  await goChapter(dom, 9);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    out(`${label}-damaged-9-1-notice`, /blessing|damaged|IXκαὶ/i.test(rows[0].querySelector('.aligned-note')?.textContent || ''));
  }

  // Safe unresolved 16+.
  await goChapter(dom, 16);
  out(`${label}-genesis16-unresolved`,
    correspondences(d).length === 0 && aligned(d).length > 0
      && aligned(d).every((c) => /alignment not available/.test(c.textContent)));
}

async function mobileChecks() {
  const dom = await openApp({ narrow: true });
  const d = dom.window.document;
  await enablePilot(dom);
  await goChapter(dom, 15);
  out('mobile-genesis15-aligned',
    d.querySelectorAll('#results .mobile-verse .aligned-cell.aligned-correspondence').length === 21);
  dom.window.close();
}

staticChecks();
{
  const dom = await openApp();
  await chapterChecks(dom, 'desktop');
  dom.window.close();
}
await mobileChecks();

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`check-stage2c: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
