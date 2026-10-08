// Stage 2a acceptance check: opt-in aligned Greek pilot in the Canon view.
//
//   node build/check-stage2a.mjs
//
// One PASS/FAIL line per invariant. file:// is used throughout (jsdom loads
// every data file through classic <script> tags; no fetch/CDN). The Canon
// off-state regression is compared against the pre-change capture
// build/cache/stage1b-before.json, which is never regenerated.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const CACHE = path.join(here, 'cache');
const BEFORE = path.join(CACHE, 'stage1b-before.json');
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

async function openApp({ narrow = false, delayPilotScripts = false } = {}) {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({
        get matches() { return narrow && query.includes('700px'); },
        addEventListener() {}, removeEventListener() {},
      });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      if (delayPilotScripts) {
        const original = window.Node.prototype.appendChild;
        window.Node.prototype.appendChild = function (node) {
          if (node.tagName === 'SCRIPT' && /lxx-swete|versification-schemes/.test(node.src || '')) {
            setTimeout(() => original.call(this, node), 250);
            return node;
          }
          return original.call(this, node);
        };
      }
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

const srcList = (d) => [...d.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') || '');
const aligned = (d) => [...d.querySelectorAll('#results .aligned-cell')];
const correspondences = (d) => [...d.querySelectorAll('#results .aligned-cell.aligned-correspondence')];

async function enablePilot(dom) {
  const w = dom.window;
  const d = w.document;
  const box = d.querySelector('#lxx-alignment-pilot');
  if (box.checked) return;
  box.checked = true;
  fire(w, box);
  await waitFor(() => w.MARANATHA_LXX_ALIGNMENT && w.MARANATHA_VERSIFICATION_SCHEMES
    && w.MARANATHA_TRANSLATIONS['lxx-swete']
    && d.querySelector('#results .aligned-cell'));
}

async function goChapter(dom, bookId, chapter) {
  const w = dom.window;
  const d = w.document;
  const book = d.querySelector('#book');
  book.value = bookId;
  fire(w, book);
  const ch = d.querySelector('#chapter');
  ch.value = String(chapter);
  fire(w, ch);
  await new Promise((resolve) => setTimeout(resolve, 30));
}

// ---------------------------------------------------------------------------
// Static checks (CSS/text and shell/data sources that jsdom cannot see).
// ---------------------------------------------------------------------------
function staticChecks() {
  const html = read('index.html');
  out('html-pilot-checkbox-off-by-default',
    /<input type="checkbox" id="lxx-alignment-pilot">/.test(html) && !/id="lxx-alignment-pilot"[^>]*checked/.test(html));
  out('html-pilot-notice', /id="lxx-alignment-notice"[^>]*role="note"/.test(html) && /awaiting human review/.test(html));
  out('html-resolver-before-app',
    html.indexOf('verse-mapping.js') !== -1 && html.indexOf('verse-mapping.js') < html.indexOf('src="app.js"'));
  out('html-pilot-excludes-parallel-and-search-selects',
    !/parallel-translation[\s\S]*?lxx-aligned/.test(html) && !/search-translation[\s\S]*?lxx-aligned/.test(html));

  const css = read('style.css');
  out('css-aligned-cell-rules', /\.aligned-cell\s*\{/.test(css) && /\.aligned-source-ref\s*\{/.test(css));

  const sw = read('service-worker.js');
  out('sw-shell-v55', /CACHE_VERSION\s*=\s*'v55'/.test(sw));
  out('sw-data-v3-kept', /DATA_CACHE_VERSION\s*=\s*'v3'/.test(sw));
  out('sw-keeps-data-cache-on-activate', /keep = new Set\(\[SHELL_CACHE, DATA_CACHE\]\)/.test(sw));
  out('sw-data-cache-ignores-query-false', /ignoreSearch: cacheName !== DATA_CACHE/.test(sw));
  out('sw-resolver-precached', /'\.\/verse-mapping\.js'/.test(sw) && /SHELL_FILES/.test(sw));

  out('mapping-no-negative-claims', Array.isArray(mapping.negativeAssertions) && mapping.negativeAssertions.length === 0);
  out('mapping-human-approval-null', mapping.review && mapping.review.humanApproval === null);
  out('mapping-versioned-pilot-links',
    read('data/lxx-swete-alignment.js').includes('MARANATHA_LXX_ALIGNMENT')
      && read('data/versification-schemes.js').includes('MARANATHA_VERSIFICATION_SCHEMES'));
}

// ---------------------------------------------------------------------------
// Desktop behaviour.
// ---------------------------------------------------------------------------
async function desktopChecks() {
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;

  // Off by default: no pilot metadata or native Greek requested at startup.
  out('startup-pilot-off', !d.querySelector('#lxx-alignment-pilot').checked && aligned(d).length === 0);
  out('startup-no-greek-or-mapping',
    !srcList(d).some((s) => /lxx-swete|versification-schemes/.test(s)), srcList(d).join(','));

  await enablePilot(dom);
  out('checkbox-loads-scripts-once', (() => {
    const list = srcList(d);
    const counts = ['lxx-swete.js', 'lxx-swete-alignment.js', 'versification-schemes.js']
      .map((needle) => list.filter((s) => s.includes(needle)).length);
    return counts.every((c) => c === 1);
  })(), srcList(d).filter((s) => /lxx|versification/.test(s)).join(','));

  await goChapter(dom, 'GEN', 1);
  out('genesis1-correspondence-cells', correspondences(d).length === 31, String(correspondences(d).length));

  // Every source span (text and flags) must be byte-exact with the native
  // segment the resolver reports, not a re-derived or guessed string.
  const ctx = { window: {} };
  vm.runInNewContext(read('verse-mapping.js'), ctx);
  const resolver = ctx.window.MARANATHA_VERSE_MAPPING.createResolver(mapping, { native });
  let exact = true;
  let detail = '';
  const rows = [...d.querySelectorAll('#results table.comparison-table-columns tbody tr')];
  for (let v = 1; v <= 31; v++) {
    const expected = resolver.resolveTarget('GEN', 1, v);
    // User approved source6 at row6 and source7 at row7, with a small notice.
    // The evidence group itself remains collective and proposed.
    const expectedMembers = expected.groupId === 'GEN1-6-7'
      ? expected.members.filter((m) => m.source.book === 'GEN'
        && String(m.source.chapter) === '1' && m.source.label === String(v))
      : expected.members;
    const cell = rows[v - 1]?.querySelector('.aligned-cell');
    const members = cell ? [...cell.querySelectorAll('.aligned-source')] : [];
    if (members.length !== expectedMembers.length) { exact = false; detail = `v${v} members ${members.length}/${expectedMembers.length}`; break; }
    for (let i = 0; i < members.length; i++) {
      const gotRef = members[i].querySelector('.aligned-source-ref')?.textContent || '';
      const gotText = members[i].querySelector('.lxx-text')?.textContent || '';
      const flags = members[i].querySelectorAll('.lxx-flag').length;
      if (gotRef !== expectedMembers[i].refLabel || gotText !== expectedMembers[i].text
        || flags !== expectedMembers[i].flags.length) {
        exact = false; detail = `v${v} member ${i} "${gotRef}" len ${gotText.length}`; break;
      }
    }
    if (!exact) break;
  }
  out('genesis1-source-text-flags-exact', exact, detail);

  // The group keeps its evidence, but the reader sees each source verse once.
  const rowFor = (v) => rows[v - 1];
  out('greek6-7-one-verse-per-row',
    rowFor(6).querySelector('.aligned-cell.aligned-collective')?.querySelectorAll('.aligned-source').length === 1
      && rowFor(7).querySelector('.aligned-cell.aligned-collective')?.querySelectorAll('.aligned-source').length === 1);

  // A single-verse reference displays source7 and the boundary notice.
  d.querySelector('#reference').value = 'Genesis 1:7';
  d.querySelector('#reference-go').click();
  await waitFor(() => /1:7/.test(d.querySelector('#results').textContent));
  const refCell = d.querySelector('#results .aligned-cell');
  out('reference-1-7-shows-source7-once-with-notice',
    refCell?.classList.contains('aligned-collective')
      && refCell.querySelectorAll('.aligned-source').length === 1
      && /Greek 6.*English\/Hebrew.*7/.test(refCell.querySelector('.aligned-note')?.textContent || ''));

  // Range parsing is unaffected: 6-9 yields four rows.
  d.querySelector('#reference').value = 'Genesis 1:6-9';
  d.querySelector('#reference-go').click();
  await waitFor(() => /1:6/.test(d.querySelector('#results').textContent));
  out('canonical-range-parsing-intact',
    d.querySelectorAll('#results table.comparison-table-columns tbody tr').length === 4);

  // Genesis 2 is now proposal-covered; Genesis 6:2 stays unresolved. Unresolved
  // and missing-edition states remain distinct and are never guessed.
  await goChapter(dom, 'GEN', 2);
  out('genesis2-now-covered', correspondences(d).length === 25, String(correspondences(d).length));

  await goChapter(dom, 'GEN', 6);
  out('genesis6-2-unresolved',
    correspondences(d).length === 1 && aligned(d).length > 1
      && aligned(d).filter((c) => !c.classList.contains('aligned-correspondence'))
        .every((c) => /alignment not available/.test(c.textContent)));

  await goChapter(dom, 'PSA', 23);
  out('psalms-unresolved-no-greek',
    correspondences(d).length === 0 && aligned(d).every((c) => /alignment not available/.test(c.textContent)));

  await goChapter(dom, 'ECC', 1);
  out('ecc-missing-edition-distinct',
    aligned(d).length > 0 && aligned(d).every((c) => /not available in this edition/.test(c.textContent)));

  await goChapter(dom, 'MAT', 5);
  out('nt-missing-edition-distinct',
    aligned(d).length > 0 && aligned(d).every((c) => /not available in this edition/.test(c.textContent)));

  out('no-negative-claims-rendered',
    !/no corresponding verse/i.test(d.querySelector('#results').textContent));

  // Chapter extent is not inflated by the virtual column.
  await goChapter(dom, 'GEN', 1);
  out('chapter-extent-not-inflated',
    d.querySelectorAll('#results table.comparison-table-columns tbody tr').length === 31);

  // Footer attribution appears with the pilot, and disappears when unchecked.
  out('footer-attribution-shown-with-pilot',
    !d.querySelector('#lxx-attribution').hidden && /Swete/.test(d.querySelector('#lxx-attribution').textContent));
  const box = d.querySelector('#lxx-alignment-pilot');
  box.checked = false;
  fire(w, box);
  await new Promise((resolve) => setTimeout(resolve, 30));
  out('uncheck-restores-canon',
    aligned(d).length === 0 && d.querySelector('#lxx-attribution').hidden);

  // Parallel and search never expose the virtual descriptor.
  box.checked = true;
  fire(w, box);
  await waitFor(() => d.querySelectorAll('#results .aligned-cell').length > 0);
  const view = d.querySelector('#view-mode');
  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => !d.querySelector('#parallel-view').hidden && d.querySelector('#parallel-translation').options.length);
  out('parallel-menu-excludes-virtual',
    ![...d.querySelector('#parallel-translation').options].some((o) => o.value === 'lxx-aligned'));
  view.value = 'lxx';
  fire(w, view);
  await waitFor(() => d.querySelector('#lxx-bar') && !d.querySelector('#lxx-bar').hidden);
  out('lxx-native-view-untouched',
    d.querySelectorAll('#results .lxx-verses .lxx-segment').length > 0 && aligned(d).length === 0);
  view.value = 'canon';
  fire(w, view);
  await waitFor(() => d.querySelectorAll('#results .aligned-cell').length > 0);
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  await new Promise((resolve) => setTimeout(resolve, 30));
  out('search-select-excludes-virtual',
    ![...d.querySelector('#search-translation').options].some((o) => o.value === 'lxx-aligned'));

  dom.window.close();
}

// ---------------------------------------------------------------------------
// Mobile: stacked layout with the pilot column, and Hebrew RTL.
// ---------------------------------------------------------------------------
async function mobileChecks() {
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;
  await enablePilot(dom);
  await goChapter(dom, 'GEN', 1);
  out('mobile-pilot-uses-mobile-layout',
    d.querySelectorAll('#results .mobile-verse').length > 0
      && d.querySelectorAll('#results .mobile-verse .aligned-cell.aligned-correspondence').length === 31);

  const heBox = [...d.querySelectorAll('#translations input[type="checkbox"]')].find((b) => b.value === 'he');
  heBox.checked = true;
  fire(w, heBox);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.he && d.querySelector('#results .hebrew-verse'));
  const heb = d.querySelector('#results .hebrew-verse');
  out('mobile-hebrew-rtl', !!heb && heb.dir === 'rtl' && heb.lang === 'he', heb ? `${heb.dir}/${heb.lang}` : 'none');
  dom.window.close();
}

// ---------------------------------------------------------------------------
// Late loads and mode changes must not activate the column or leak the footer.
// ---------------------------------------------------------------------------
async function lateAndModeChecks() {
  const late = await openApp({ delayPilotScripts: true });
  {
    const w = late.window;
    const d = w.document;
    const box = d.querySelector('#lxx-alignment-pilot');
    box.checked = true;
    fire(w, box);
    box.checked = false;
    fire(w, box);
    await waitFor(() => w.MARANATHA_LXX_ALIGNMENT && w.MARANATHA_TRANSLATIONS['lxx-swete']);
    await new Promise((resolve) => setTimeout(resolve, 350));
    out('late-uncheck-never-activates',
      aligned(d).length === 0 && d.querySelector('#lxx-attribution').hidden);
    late.window.close();
  }

  const mode = await openApp({ delayPilotScripts: true });
  {
    const w = mode.window;
    const d = w.document;
    const box = d.querySelector('#lxx-alignment-pilot');
    box.checked = true;
    fire(w, box);
    const view = d.querySelector('#view-mode');
    view.value = 'parallel';
    fire(w, view);
    await waitFor(() => w.MARANATHA_LXX_ALIGNMENT && w.MARANATHA_TRANSLATIONS['lxx-swete']);
    await new Promise((resolve) => setTimeout(resolve, 350));
    out('late-mode-change-never-activates',
      aligned(d).length === 0 && !d.querySelector('#parallel-view').hidden);
    mode.window.close();
  }
}

// ---------------------------------------------------------------------------
// Canon off-state regression against the pre-change baseline (WEB + KJV).
// ---------------------------------------------------------------------------
const REGRESSION_CHAPTERS = [
  ['GEN', '1'], ['EXO', '20'], ['PSA', '23'], ['PSA', '119'], ['ISA', '53'],
  ['JER', '25'], ['DAN', '3'], ['SIR', '1'], ['MAT', '5'], ['JHN', '1'],
];

async function canonRegressionCheck() {
  if (!fs.existsSync(BEFORE)) { out('canon-regression-10ch', false, 'missing baseline'); return; }
  const before = readJson('build/cache/stage1b-before.json');
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  const kjv = [...d.querySelectorAll('#translations input[type="checkbox"]')].find((b) => b.value === 'kjv');
  kjv.checked = true;
  fire(w, kjv);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.kjv);
  const diff = [];
  for (const [book, chapter] of REGRESSION_CHAPTERS) {
    await goChapter(dom, book, chapter);
    const key = `${book} ${chapter}`;
    if (d.querySelector('#results').innerHTML !== before[key]) diff.push(key);
  }
  dom.window.close();
  out('canon-regression-10ch', diff.length === 0, diff.length ? `differs: ${diff.join(', ')}` : '10 WEB+KJV chapters byte-identical');
}

staticChecks();
await desktopChecks();
await mobileChecks();
await lateAndModeChecks();
await canonRegressionCheck();

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`check-stage2a: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
