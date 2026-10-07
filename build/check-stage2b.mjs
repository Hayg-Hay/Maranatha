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

// ---------------------------------------------------------------------------
function staticChecks() {
  out('mapping-covers-genesis1-5-and-boundary6',
    mapping.scope.covered.map((c) => c.chapter).join(',') === '1,2,3,4,5,6'
      && Array.isArray(mapping.groups) && mapping.groups.some((g) => g.id === 'GEN3-1')
      && mapping.groups.some((g) => g.id === 'GEN6-1'));
  out('mapping-human-approval-null', mapping.review && mapping.review.humanApproval === null);
  out('mapping-both-ledgers-bound',
    mapping.bindings.ledger && mapping.bindings.ledger2
      && mapping.bindings.ledger2.path === 'build/reviews/lxx-genesis2-5-evidence.json');
  out('new-entries-use-per-target-evidence',
    mapping.entries.some((e) => Array.isArray(e.provenance.targetEvidence)
      && e.provenance.targetEvidence.length === 2));
}

// ---------------------------------------------------------------------------
async function chapterChecks(dom, label) {
  const w = dom.window;
  const d = w.document;
  await enablePilot(dom);

  const ctx = { window: {} };
  vm.runInNewContext(read('verse-mapping.js'), ctx);
  const resolver = ctx.window.MARANATHA_VERSE_MAPPING.createResolver(mapping, { native });

  // 2 / 3 / 4 / 5 target counts.
  for (const [chapter, expected] of [['2', 25], ['3', 24], ['4', 26], ['5', 32]]) {
    await goChapter(dom, 'GEN', Number(chapter));
    out(`${label}-genesis${chapter}-correspondence-cells`,
      correspondences(d).length === expected, String(correspondences(d).length));
  }

  // 2:25 shows the complete source GEN 3:1 once with a boundary note.
  await goChapter(dom, 'GEN', 2);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    const cell = rows[24] && rows[24].querySelector('.aligned-cell');
    const texts = cell ? [...cell.querySelectorAll('.lxx-text')].map((e) => e.textContent) : [];
    const seg31 = nativeChapter(3).segments.find((s) => s.kind === 'verse' && s.l === '1');
    out(`${label}-row-2-25-shows-source-3-1-once`,
      texts.length === 1 && texts[0] === seg31.t
        && /Greek 3:1/.test(cell.querySelector('.aligned-note')?.textContent || ''));
  }

  // 5:32 shows the complete source GEN 6:1 once.
  await goChapter(dom, 'GEN', 5);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    const cell = rows[31] && rows[31].querySelector('.aligned-cell');
    const texts = cell ? [...cell.querySelectorAll('.lxx-text')].map((e) => e.textContent) : [];
    const seg61 = nativeChapter(6).segments.find((s) => s.kind === 'verse' && s.l === '1');
    out(`${label}-row-5-32-shows-source-6-1-once`,
      texts.length === 1 && texts[0] === seg61.t
        && /Greek 6:1/.test(cell.querySelector('.aligned-note')?.textContent || ''));
  }

  // 3:1 shows the same complete source once.
  await goChapter(dom, 'GEN', 3);
  {
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    const cell = rows[0].querySelector('.aligned-cell');
    const texts = [...cell.querySelectorAll('.lxx-text')].map((e) => e.textContent);
    const seg31 = nativeChapter(3).segments.find((s) => s.kind === 'verse' && s.l === '1');
    out(`${label}-row-3-1-shows-source-3-1-once`, texts.length === 1 && texts[0] === seg31.t);
  }

  // Source text and flags exact for chapters 2-5 and 6:1, per resolved target.
  let exact = true;
  let detail = '';
  for (const chapter of [2, 3, 4, 5, 6]) {
    await goChapter(dom, 'GEN', chapter);
    const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
    for (let v = 1; v <= rows.length; v++) {
      const expected = resolver.resolveTarget('GEN', chapter, v);
      if (expected.state !== 'correspondence') continue;
      const cell = rows[v - 1].querySelector('.aligned-cell');
      const members = cell ? [...cell.querySelectorAll('.aligned-source')].filter((s) => s.querySelector('.lxx-text')) : [];
      if (members.length !== expected.members.length) { exact = false; detail = `GEN ${chapter}:${v} members ${members.length}/${expected.members.length}`; break; }
      for (let i = 0; i < members.length; i++) {
        const gotRef = members[i].querySelector('.aligned-source-ref')?.textContent || '';
        const gotText = members[i].querySelector('.lxx-text')?.textContent || '';
        const flags = members[i].querySelectorAll('.lxx-flag').length;
        if (gotRef !== expected.members[i].refLabel || gotText !== expected.members[i].text || flags !== expected.members[i].flags.length) {
          exact = false; detail = `GEN ${chapter}:${v} member ${i} "${gotRef}"`; break;
        }
      }
      if (!exact) break;
    }
    if (!exact) break;
  }
  out(`${label}-genesis2-5-source-text-exact`, exact, detail);

  // Ages unchanged: Greek 5:25 (187) and WEB/KJV/OSHB 5:25 (one hundred eighty-seven).
  const seg525 = nativeChapter(5).segments.find((s) => s.kind === 'verse' && s.l === '25');
  out(`${label}-methuselah-age-unchanged`,
    /ἑκατὸν καὶ ὀγδοήκοντα ἑπτὰ/.test(seg525.t) && !/167|ἑξήκοντα ἑπτὰ/.test(seg525.t));

  // Combined references render the shared source exactly once.
  d.querySelector('#reference').value = 'Genesis 2:25;Genesis 3:1';
  d.querySelector('#reference-go').click();
  await waitFor(() => /2:25/.test(d.querySelector('#results').textContent));
  out(`${label}-combined-2-25-3-1-no-duplicate-greek`,
    d.querySelectorAll('#results .aligned-cell .lxx-text').length === 1);

  d.querySelector('#reference').value = 'Genesis 5:32;Genesis 6:1';
  d.querySelector('#reference-go').click();
  await waitFor(() => /5:32/.test(d.querySelector('#results').textContent));
  out(`${label}-combined-5-32-6-1-no-duplicate-greek`,
    d.querySelectorAll('#results .aligned-cell .lxx-text').length === 1);

  // Single boundary target shows the complete unit once.
  d.querySelector('#reference').value = 'Genesis 2:25';
  d.querySelector('#reference-go').click();
  await waitFor(() => /2:25/.test(d.querySelector('#results').textContent));
  out(`${label}-single-2-25-shows-complete-source`,
    d.querySelectorAll('#results .aligned-cell .lxx-text').length === 1
      && /Greek 3:1/.test(d.querySelector('#results .aligned-note')?.textContent || ''));

  // Genesis 6:2 and later stay unresolved.
  await goChapter(dom, 'GEN', 6);
  out(`${label}-genesis6-2-unresolved`,
    correspondences(d).length === 1
      && aligned(d).filter((c) => !c.classList.contains('aligned-correspondence'))
        .every((c) => /alignment not available/.test(c.textContent)));
}

async function mobileChecks() {
  const dom = await openApp({ narrow: true });
  const d = dom.window.document;
  await enablePilot(dom);
  await goChapter(dom, 'GEN', 3);
  out('mobile-genesis3-aligned',
    d.querySelectorAll('#results .mobile-verse .aligned-cell.aligned-correspondence').length === 24);
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
console.log(`check-stage2b: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
