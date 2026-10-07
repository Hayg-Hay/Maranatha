// Stage 1b acceptance check: independent LXX and translation panes.
//
//   node build/check-stage1b.mjs
//
// One PASS/FAIL line per invariant. The canon-view regression is compared
// against the pre-change baseline build/cache/stage1b-before.json (captured
// from main before any Stage 1b change; never regenerated after the change).
//
// HARD CONSTRAINTS asserted here: file:// operation with no local network
// (jsdom loads every data file through classic <script> tags), unique element
// IDs, and CSS rules for the hidden parallel view and the stacked mobile layout
// (jsdom does not apply CSS, so those are static source checks).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const CACHE = path.join(here, 'cache');
const BEFORE = path.join(CACHE, 'stage1b-before.json');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const data = JSON.parse(read('data/lxx-swete.json'));

// Regression anchors (source SHA and shipped counts) must not move in Stage 1b.
const LXX_SHA = 'd31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4';
const COUNTS = { books: 48, chapters: 1055, verses: 27048, unnumbered: 100, flaggedVerses: 686 };
const REGRESSION_CHAPTERS = [
  ['GEN', '1'], ['EXO', '20'], ['PSA', '23'], ['PSA', '119'], ['ISA', '53'],
  ['JER', '25'], ['DAN', '3'], ['SIR', '1'], ['MAT', '5'], ['JHN', '1'],
];

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
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => ({
        get matches() { return narrow && query.includes('700px'); },
        addEventListener() {},
        removeEventListener() {},
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

const srcList = (d) => [...d.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') || '');
const canonControls = (d) => [...d.querySelectorAll('[data-canon-only]')];

// ---------------------------------------------------------------------------
// 1. Data invariants (untouched by Stage 1b).
// ---------------------------------------------------------------------------
function dataChecks() {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'data', 'lxx-swete.json'))).digest('hex');
  out('data-sha256-unchanged', sha === LXX_SHA, sha);

  const counts = { books: data.books.length, chapters: 0, verses: 0, unnumbered: 0, flaggedVerses: 0 };
  for (const b of data.books) {
    counts.chapters += b.chapters.length;
    for (const c of b.chapters) {
      for (const s of c.segments) {
        if (s.kind === 'verse') counts.verses++;
        else counts.unnumbered++;
        if (s.flags && s.flags.length) counts.flaggedVerses++;
      }
    }
  }
  const okCounts = Object.keys(COUNTS).every((k) => counts[k] === COUNTS[k]);
  out('data-counts-unchanged', okCounts, JSON.stringify(counts));

  const verseLabels = (id, ch) => {
    const book = data.books.find((b) => b.id === id);
    return (book.chapters.find((c) => c.n === ch)?.segments || []).filter((s) => s.kind === 'verse').map((s) => s.l);
  };
  const psa88 = verseLabels('PSA', '88');
  const i = psa88.indexOf('84');
  out('labels-psa88-unchanged', i > 0 && psa88[i - 1] === '47' && psa88[i + 1] === '49',
    `...${psa88.slice(Math.max(0, i - 2), i + 3).join(',')}`);
  out('labels-psa115-no6-unchanged', !verseLabels('PSA', '115').includes('6'), verseLabels('PSA', '115').join(','));
  const bel = data.books.find((b) => b.id === 'BEL').chapters[0].segments.filter((s) => s.kind === 'verse');
  out('bel-ends-36-unchanged', bel.at(-1)?.l === '36', bel.at(-1)?.l);
}

// ---------------------------------------------------------------------------
// 2. Static source checks (jsdom does not apply CSS, so inspect the sources).
// ---------------------------------------------------------------------------
function staticChecks() {
  const css = read('style.css');
  out('css-parallel-view-hidden-rule', /\.parallel-view\[hidden\]\s*\{[^}]*display:\s*none/.test(css));
  out('css-chapter-bar-hidden-rule', /\.chapter-bar\[hidden\]\s*\{[^}]*display:\s*none/.test(css));
  const parallelSection = css.slice(css.indexOf('Parallel reading (independent numbering)'));
  out('css-mobile-parallel-stacks', /\.parallel-panes\s*\{[^}]*flex-direction:\s*column/.test(parallelSection));
  out('css-lxx-attribution-hidden-rule', /#lxx-attribution\[hidden\]\s*\{[^}]*display:\s*none/.test(css));

  const html = read('index.html');
  const banner = /<p class="parallel-banner"[^>]*>Independent numbering; passages are not aligned\.<\/p>/.test(html);
  out('html-parallel-banner', banner);
  out('html-parallel-view-option', /<option value="parallel">Parallel reading \(independent numbering\)<\/option>/.test(html));

  // Unique IDs across the whole static document, and labelled controls.
  const doc = new JSDOM(html).window.document;
  const ids = [...doc.querySelectorAll('[id]')].map((el) => el.id);
  const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  out('html-unique-ids', dupes.length === 0, dupes.join(','));
  const needLabels = ['parallel-lxx-book', 'parallel-lxx-chapter', 'parallel-translation', 'parallel-book', 'parallel-chapter'];
  const unlabelled = needLabels.filter((id) => !doc.querySelector(`label[for="${id}"]`));
  out('html-parallel-controls-labelled', unlabelled.length === 0, unlabelled.join(','));
  const needContainers = ['parallel-lxx-content', 'parallel-translation-content'];
  out('html-parallel-content-containers', needContainers.every((id) => doc.getElementById(id)));

  // The right-pane heading must not claim canon numbering: the selected
  // translation may itself print a source numbering (Delitzsch 1901).
  out('html-parallel-heading-neutral',
    !/canon numbering/i.test(doc.getElementById('parallel-translation-heading').textContent),
    doc.getElementById('parallel-translation-heading').textContent);
}

// ---------------------------------------------------------------------------
// 3. Desktop behaviour in the real file:// app.
// ---------------------------------------------------------------------------
async function desktopChecks() {
  const dom = await openApp({ narrow: false });
  const w = dom.window;
  const d = w.document;
  const view = d.querySelector('#view-mode');

  // Lazy loading: neither the 7.5 MB LXX data nor either Delitzsch edition is
  // requested at startup.
  out('startup-lazy-no-lxx-or-delitzsch', !srcList(d).some((s) => /lxx-swete|delitzsch/.test(s)),
    srcList(d).join(','));

  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => d.querySelector('#parallel-lxx-content .lxx-banner'));

  out('parallel-lazy-loads-lxx', srcList(d).some((s) => /lxx-swete/.test(s)), srcList(d).join(','));
  out('parallel-banner-rendered', /Independent numbering; passages are not aligned/.test(
    d.querySelector('.parallel-banner')?.textContent || ''));
  out('parallel-controls-isolated-from-canon',
    !d.querySelector('#parallel-view').hidden && d.querySelector('#results').hidden
      && d.querySelector('#lxx-bar').hidden && canonControls(d).every((el) => el.hidden));
  out('parallel-heading-neutral',
    !/canon numbering/i.test(d.querySelector('#parallel-translation-heading').textContent),
    d.querySelector('#parallel-translation-heading').textContent);

  // Independent navigation: LXX pane moves alone...
  const transBook = d.querySelector('#parallel-book');
  const lxxBook = d.querySelector('#parallel-lxx-book');
  const transHeading = () => d.querySelector('#parallel-translation-content .result-head h2')?.textContent || '';
  const lxxHeading = () => d.querySelector('#parallel-lxx-content .lxx-heading')?.textContent || '';
  out('parallel-default-web', transBook.value === 'GEN' && /Genesis 1/.test(transHeading()), `${transBook.value} / ${transHeading()}`);

  const lxxBefore = lxxHeading();
  lxxBook.value = 'PSA';
  fire(w, lxxBook);
  await waitFor(() => lxxHeading() && lxxHeading() !== lxxBefore);
  const lxxChapter = d.querySelector('#parallel-lxx-chapter');
  out('parallel-lxx-chapters-populated', [...lxxChapter.options].some((o) => o.value === '88'));
  lxxChapter.value = '88';
  fire(w, lxxChapter);
  await waitFor(() => /88/.test(lxxHeading()));
  out('parallel-lxx-nav-does-not-move-translation',
    transBook.value === 'GEN' && /Genesis 1/.test(transHeading()), `${transBook.value} / ${transHeading()}`);

  // ...and the translation pane moves alone.
  const lxxHeld = lxxHeading();
  const lxxBookHeld = lxxBook.value;
  transBook.value = 'MAT';
  fire(w, transBook);
  await waitFor(() => /Matthew 1/.test(transHeading()));
  out('parallel-translation-nav-does-not-move-lxx',
    lxxBook.value === lxxBookHeld && lxxHeading() === lxxHeld, `${lxxBook.value} / ${lxxHeading()}`);

  // Hebrew + both Delitzsch editions are selectable, lazy-loaded, RTL.
  const transSel = d.querySelector('#parallel-translation');
  out('parallel-translation-has-hebrew-and-both-delitzsch',
    ['he', 'delitzsch', 'delitzsch1901'].every((id) => [...transSel.options].some((o) => o.value === id)),
    [...transSel.options].map((o) => o.value).join(','));

  transSel.value = 'delitzsch1901';
  fire(w, transSel);
  const pBook = d.querySelector('#parallel-book');
  pBook.value = 'JHN';
  fire(w, pBook);
  d.querySelector('#parallel-chapter').value = '1';
  fire(w, d.querySelector('#parallel-chapter'));
  await waitFor(() => d.querySelector('#parallel-translation-content .versification-notice'));
  const heb = d.querySelector('#parallel-translation-content .hebrew-verse');
  out('parallel-hebrew-rtl', !!heb && heb.dir === 'rtl' && heb.lang === 'he', heb ? `${heb.dir}/${heb.lang}` : 'no hebrew verse');
  out('parallel-delitzsch-1901-notice', !!d.querySelector('#parallel-translation-content .versification-notice'));
  out('parallel-lazy-loads-delitzsch1901', srcList(d).some((s) => s.includes('data/delitzsch1901.js')), srcList(d).join(','));

  // The right pane's verse extent must follow the SELECTED edition, not every
  // loaded translation: Delitzsch 1901's John 1 has 52 verses, the eBible
  // edition 51, so the 1901 row count must not inflate the eBible pane.
  const rightRows = () => d.querySelectorAll('#parallel-translation-content tbody tr').length;
  const jhn1901 = w.MARANATHA_TRANSLATIONS.delitzsch1901.books.JHN[0].length;
  out('parallel-right-extent-scoped-1901', rightRows() === jhn1901 && rightRows() === 52, `${rightRows()}/${jhn1901}`);

  transSel.value = 'delitzsch';
  fire(w, transSel);
  await waitFor(() => w.MARANATHA_TRANSLATIONS.delitzsch && srcList(d).some((s) => s.includes('data/delitzsch.js')) && d.querySelector('#parallel-translation-content .hebrew-verse'));
  out('parallel-lazy-loads-delitzsch-ebible', srcList(d).some((s) => s.includes('data/delitzsch.js')));
  const jhnE = w.MARANATHA_TRANSLATIONS.delitzsch.books.JHN[0].length;
  out('parallel-right-extent-scoped-ebible', rightRows() === jhnE && rightRows() !== jhn1901, `${rightRows()}/${jhnE} (1901 ${jhn1901})`);

  transSel.value = 'he';
  fire(w, transSel);
  pBook.value = 'GEN';
  fire(w, pBook);
  d.querySelector('#parallel-chapter').value = '1';
  fire(w, d.querySelector('#parallel-chapter'));
  await waitFor(() => w.MARANATHA_TRANSLATIONS.he && d.querySelector('#parallel-translation-content .hebrew-verse'));
  out('parallel-osb-hebrew-rtl', (() => {
    const el = d.querySelector('#parallel-translation-content .hebrew-verse');
    return !!el && el.dir === 'rtl' && el.lang === 'he';
  })());

  // Canon-only reference/search invoked from the parallel view return to canon.
  d.querySelector('#reference').value = 'John 3:16';
  d.querySelector('#reference-go').click();
  out('reference-returns-to-canon',
    view.value === 'canon' && d.querySelector('#parallel-view').hidden && !d.querySelector('#results').hidden
      && canonControls(d).every((el) => !el.hidden));
  out('reference-rendered-in-canon', /3:16/.test(d.querySelector('#results').textContent));

  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => !d.querySelector('#parallel-view').hidden);
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  out('search-returns-to-canon', view.value === 'canon' && d.querySelector('#parallel-view').hidden
    && !d.querySelector('#results').hidden && !d.querySelector('#results').hidden);

  // Invalid and empty inputs must still switch the visible panes to match the
  // selector (no lingering parallel panes after an error).
  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => !d.querySelector('#parallel-view').hidden);
  d.querySelector('#reference').value = 'not a reference';
  d.querySelector('#reference-go').click();
  out('invalid-reference-syncs-panes',
    d.querySelector('#parallel-view').hidden === (view.value !== 'parallel') && !d.querySelector('#results').hidden,
    `${view.value}/${d.querySelector('#parallel-view').hidden}`);

  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => !d.querySelector('#parallel-view').hidden);
  d.querySelector('#search').value = '';
  d.querySelector('#search-go').click();
  out('empty-search-syncs-panes',
    d.querySelector('#parallel-view').hidden === (view.value !== 'parallel'),
    `${view.value}/${d.querySelector('#parallel-view').hidden}`);

  // View switching: LXX standalone is preserved, then canon restores cleanly.
  view.value = 'lxx';
  fire(w, view);
  await waitFor(() => !d.querySelector('#lxx-bar').hidden);
  out('lxx-view-preserved',
    !d.querySelector('#lxx-bar').hidden && canonControls(d).every((el) => el.hidden)
      && d.querySelector('#parallel-view').hidden && !d.querySelector('#results').hidden);

  view.value = 'canon';
  fire(w, view);
  out('canon-view-restored',
    d.querySelector('#lxx-bar').hidden && d.querySelector('#parallel-view').hidden && !d.querySelector('#results').hidden
      && canonControls(d).every((el) => !el.hidden));

  dom.window.close();
}

// ---------------------------------------------------------------------------
// 4. Mobile: panes stacked LXX then translation, controls isolated.
// ---------------------------------------------------------------------------
async function mobileChecks() {
  const dom = await openApp({ narrow: true });
  const w = dom.window;
  const d = w.document;

  const view = d.querySelector('#view-mode');
  view.value = 'parallel';
  fire(w, view);
  await waitFor(() => d.querySelector('#parallel-lxx-content .lxx-banner'));

  const panes = [...d.querySelectorAll('.parallel-panes > .parallel-pane')];
  out('mobile-panes-lxx-then-translation',
    panes.length === 2 && !!panes[0].querySelector('#parallel-lxx-book') && !!panes[1].querySelector('#parallel-book'));

  await waitFor(() => d.querySelector('#parallel-translation-content .mobile-verse'));
  out('mobile-translation-uses-mobile-layout', !!d.querySelector('#parallel-translation-content .mobile-verse'));

  const transBookBefore = d.querySelector('#parallel-book').value;
  const lxxBook = d.querySelector('#parallel-lxx-book');
  lxxBook.value = 'PSA';
  fire(w, lxxBook);
  await waitFor(() => /Psalms|Psalm/.test(d.querySelector('#parallel-lxx-content .lxx-heading')?.textContent || ''));
  out('mobile-lxx-nav-isolated', d.querySelector('#parallel-book').value === transBookBefore,
    d.querySelector('#parallel-book').value);

  dom.window.close();
}

// ---------------------------------------------------------------------------
// 4b. A delayed LXX script must not leak the footer attribution into Canon.
// ---------------------------------------------------------------------------
async function lateLxxGuardCheck() {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      // Hold the 7.5 MB LXX script back so the user can leave the view first.
      const original = window.Node.prototype.appendChild;
      window.Node.prototype.appendChild = function (node) {
        if (node.tagName === 'SCRIPT' && node.src.includes('/data/lxx-swete.js')) {
          setTimeout(() => original.call(this, node), 200);
          return node;
        }
        return original.call(this, node);
      };
    },
  });
  try {
    const w = dom.window;
    const d = w.document;
    await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.web && d.querySelector('#results h2'));
    const selector = d.querySelector('#view-mode');
    selector.value = 'parallel';
    fire(w, selector);
    selector.value = 'canon';
    fire(w, selector);
    await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS['lxx-swete']);
    await new Promise((resolve) => setTimeout(resolve, 100));
    out('late-lxx-callback-guarded',
      d.querySelector('#lxx-attribution').hidden && d.querySelector('#parallel-view').hidden);
  } finally {
    dom.window.close();
  }
}

// ---------------------------------------------------------------------------
// 5. Canon-view regression against the pre-change baseline (WEB + KJV).
// ---------------------------------------------------------------------------
async function renderCanonViews() {
  const dom = await openApp({ narrow: false });
  const { window } = dom;
  const { document } = window;
  const kjvBox = [...document.querySelectorAll('#translations input[type="checkbox"]')].find((b) => b.value === 'kjv');
  if (kjvBox && !kjvBox.checked) {
    kjvBox.checked = true;
    kjvBox.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
  await waitFor(() => window.MARANATHA_TRANSLATIONS.kjv);

  const bookSelect = document.querySelector('#book');
  const chapterSelect = document.querySelector('#chapter');
  const rendered = {};
  for (const [bookId, chapter] of REGRESSION_CHAPTERS) {
    bookSelect.value = bookId;
    bookSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    chapterSelect.value = chapter;
    chapterSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    rendered[`${bookId} ${chapter}`] = document.querySelector('#results').innerHTML;
  }
  dom.window.close();
  return rendered;
}

async function canonRegressionCheck() {
  if (!fs.existsSync(BEFORE)) {
    out('canon-regression', false, `missing ${path.relative(root, BEFORE)}`);
    return;
  }
  const before = JSON.parse(fs.readFileSync(BEFORE, 'utf8'));
  const after = await renderCanonViews();
  const diffs = REGRESSION_CHAPTERS.map(([b, c]) => `${b} ${c}`).filter((key) => before[key] !== after[key]);
  out('canon-regression', diffs.length === 0,
    diffs.length ? `differs: ${diffs.join(', ')}` : `${REGRESSION_CHAPTERS.length} WEB+KJV chapters byte-identical`);
}

// ---------------------------------------------------------------------------
// Run.
// ---------------------------------------------------------------------------
dataChecks();
staticChecks();
await desktopChecks();
await mobileChecks();
await lateLxxGuardCheck();
await canonRegressionCheck();

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`check-stage1b: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
