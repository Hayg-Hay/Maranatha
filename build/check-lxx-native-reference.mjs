// Acceptance check for standalone native LXX reference navigation.
//
//   node build/check-lxx-native-reference.mjs
//
// One PASS/FAIL line per invariant. Uses the real file:// app (JSDOM classic
// <script> loading, no network). Canon regression is compared against the
// ACTUAL existing pre-change baseline build/cache/stage1b-before.json.
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
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const LXX_SHA = 'fd52aa2f5f65f7e0a9c76d9cf203756c66f43ac1a91396d928be3b30d8ed1f2e';

const results = [];
const out = (name, ok, detail) => results.push([name, !!ok, detail || '']);

const data = JSON.parse(read('data/lxx-swete.json'));
const byId = (id) => data.books.find((b) => b.id === id);
const chapterOf = (id, n) => byId(id).chapters.find((c) => c.n === n);
const hasVerse = (id, n, l) => !!chapterOf(id, n)?.segments.some((s) => s.kind === 'verse' && s.l === l);

// ---------------------------------------------------------------------------
// 1. Source schema and data invariants (tested directly, not assumed).
// ---------------------------------------------------------------------------
out('data-hash-and-counts-unchanged',
  sha256(fs.readFileSync(path.join(root, 'data/lxx-swete.json'))) === LXX_SHA
    && data.books.length === 48,
  `books=${data.books.length}`);
{
  let chapters = 0; let verses = 0; let unnumbered = 0; let flagged = 0;
  for (const b of data.books) for (const c of b.chapters) { chapters++; for (const s of c.segments) { if (s.kind === 'verse') { verses++; if (s.flags?.length) flagged++; } else unnumbered++; } }
  out('counts-48-1055-27048-100-688', chapters === 1055 && verses === 27048 && unnumbered === 100 && flagged === 688,
    `${data.books.length}/${chapters}/${verses}/${unnumbered}/${flagged}`);
}
out('native-nehemiah-starts-at-11', byId('NEH').chapters[0].n === '11' && !byId('NEH').chapters.some((c) => c.n === '1'));
out('native-psa-88-has-84', hasVerse('PSA', '88', '84'));
out('native-psa-115-has-no-6', !!chapterOf('PSA', '115') && !hasVerse('PSA', '115', '6'));
out('native-esther-prologue', !!chapterOf('EST', 'prologue'));
out('native-lje-1-chapter-72-verses-intro', (() => {
  const segs = byId('LJE').chapters[0].segments;
  return byId('LJE').chapters.length === 1
    && segs.filter((s) => s.kind === 'verse').length === 72
    && segs.filter((s) => s.kind === 'unnumbered').some((s) => /ἐπιστολῆς/.test(s.t));
})());
out('native-components-present', ['LJE', 'SUS', 'BEL'].every((id) => !!byId(id)));
out('disclosures-present-in-data',
  (byId('PSA').chapters.find((c) => c.n === '16').segments.find((s) => s.l === '4').flags || []).some((f) => f.code === 'transcription-marker')
    && (chapterOf('PSA', '88').segments.find((s) => s.l === '84').flags || []).some((f) => f.code === 'source-label-anomaly')
    && byId('LJE').notices.some((n) => /navigation container/.test(n)));

// ---------------------------------------------------------------------------
// DOM helpers.
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
async function openApp({ delayLxxMs = 0, record = null } = {}) {
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = function () {
        if (record) {
          const num = this.querySelector && this.querySelector('.lxx-verse-num');
          record.push(num ? num.textContent : 'segment');
        }
      };
      if (delayLxxMs) {
        const original = window.Node.prototype.appendChild;
        window.Node.prototype.appendChild = function (node) {
          if (node && node.tagName === 'SCRIPT' && typeof node.src === 'string' && node.src.includes('/data/lxx-swete.js')) {
            setTimeout(() => original.call(this, node), delayLxxMs);
            return node;
          }
          return original.call(this, node);
        };
      }
    },
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', resolve, { once: true });
  });
  return dom;
}
const change = (w, d, id, value) => { const el = d.querySelector(id); el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const submit = (w, d, ref) => { d.querySelector('#reference').value = ref; d.querySelector('#reference-go').click(); };
const submitEnter = (w, d, ref) => {
  const input = d.querySelector('#reference');
  input.value = ref;
  input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
};
const lxxScripts = (d) => [...d.querySelectorAll('script[src]')].filter((s) => /lxx-swete/.test(s.src)).length;
const lxxBookValue = (d) => d.querySelector('#lxx-book').value;
const lxxChapterValue = (d) => d.querySelector('#lxx-chapter').value;
const heading = (d) => d.querySelector('#results .lxx-heading')?.textContent || '';
const message = (d) => d.querySelector('#message').textContent;

// ---------------------------------------------------------------------------
// 2. Real DOM: success paths, aliases, components, validation.
// ---------------------------------------------------------------------------
{
  const scrolled = [];
  const dom = await openApp({ record: scrolled });
  const w = dom.window;
  const d = w.document;
  await waitFor(() => d.querySelector('#results h2'));
  change(w, d, '#view-mode', 'lxx');
  await waitFor(() => d.querySelector('#results .lxx-verses'));

  submit(w, d, 'Gen 1');
  const genOk = d.querySelector('#view-mode').value === 'lxx' && lxxBookValue(d) === 'GEN' && lxxChapterValue(d) === '1' && /Genesis 1/.test(heading(d));
  out('gen1-click-stays-in-lxx', genOk, `${lxxBookValue(d)} ${lxxChapterValue(d)} "${heading(d)}"`);
  out('gen1-complete-chapter-intact', d.querySelectorAll('#results .lxx-segment').length === chapterOf('GEN', '1').segments.length);

  submitEnter(w, d, 'Gen 2');
  out('gen1-enter-navigates', lxxBookValue(d) === 'GEN' && lxxChapterValue(d) === '2' && /Genesis 2/.test(heading(d)),
    `${lxxBookValue(d)} ${lxxChapterValue(d)}`);

  submit(w, d, 'Ps 88:84');
  await sleep(10);
  out('alias-ps-88-84-accepted', lxxBookValue(d) === 'PSA' && lxxChapterValue(d) === '88' && hasVerse('PSA', '88', '84'), `${lxxBookValue(d)} ${lxxChapterValue(d)}`);
  out('single-verse-scrolls-to-native-segment', scrolled.includes('84'), scrolled.join(','));
  out('psa88-84-flag-visible', [...d.querySelectorAll('#results .lxx-segment')].some((r) => r.querySelector('.lxx-verse-num')?.textContent === '84' && r.querySelector('.lxx-flag')));

  submit(w, d, 'Letter of Jeremiah 1');
  await sleep(10);
  out('component-letter-of-jeremiah', lxxBookValue(d) === 'LJE' && lxxChapterValue(d) === '1' && /navigation container/.test(d.querySelector('#results .lxx-notices')?.textContent || '')
    && d.querySelectorAll('#results .lxx-verse-num').length === 72);
  submit(w, d, 'Bel 1');
  await sleep(10);
  out('component-bel-alias', lxxBookValue(d) === 'BEL' && lxxChapterValue(d) === '1');
  submit(w, d, 'Susanna 1');
  await sleep(10);
  out('component-susanna', lxxBookValue(d) === 'SUS' && lxxChapterValue(d) === '1');
  submit(w, d, 'Esther prologue');
  await sleep(10);
  out('esther-prologue-explicit', lxxBookValue(d) === 'EST' && lxxChapterValue(d) === 'prologue' && /Prologue/.test(heading(d)), heading(d));

  submit(w, d, 'Nehemiah');
  await sleep(10);
  out('bare-nehemiah-first-chapter-11', lxxBookValue(d) === 'NEH' && lxxChapterValue(d) === '11', `${lxxBookValue(d)} ${lxxChapterValue(d)}`);
  submit(w, d, 'Genesis');
  await sleep(10);
  out('bare-genesis-first-chapter-1', lxxBookValue(d) === 'GEN' && lxxChapterValue(d) === '1');

  // Placeholder follows the view and marks the native query as ONE reference.
  const nativeHint = d.querySelector('#reference').placeholder;
  out('reference-placeholder-native-in-lxx',
    /one native LXX reference/i.test(nativeHint) && /Psalm 88:84/.test(nativeHint) && !nativeHint.includes(','),
    nativeHint);
  change(w, d, '#view-mode', 'canon');
  out('reference-placeholder-canon', /John 3:16/.test(d.querySelector('#reference').placeholder));
  change(w, d, '#view-mode', 'lxx');
  await waitFor(() => d.querySelector('#results .lxx-verses'));

  out('single-lxx-script-request', lxxScripts(d) === 1, String(lxxScripts(d)));

  // Validation failures must retain the current native passage and view.
  submit(w, d, 'Ps 115');
  await sleep(10);
  const held = { book: lxxBookValue(d), chapter: lxxChapterValue(d), html: d.querySelector('#results').innerHTML };
  submit(w, d, 'Ps 115:6');
  out('psa115-6-rejected', /Verse 6/.test(message(d)) && lxxBookValue(d) === held.book && lxxChapterValue(d) === held.chapter && d.querySelector('#results').innerHTML === held.html, message(d));
  submit(w, d, 'Nehemiah 1');
  out('native-unavailable-chapter-rejected', /Chapter 1/.test(message(d)) && lxxBookValue(d) === held.book && lxxChapterValue(d) === held.chapter);
  submit(w, d, 'Ecclesiastes 1');
  out('native-unavailable-book-ecc-rejected', /not available in the Septuagint/.test(message(d)) && d.querySelector('#view-mode').value === 'lxx' && lxxChapterValue(d) === held.chapter, message(d));
  submit(w, d, 'Matthew 1');
  out('native-unavailable-book-nt-rejected', /not available in the Septuagint/.test(message(d)) && d.querySelector('#view-mode').value === 'lxx');
  const beforeMalformed = d.querySelector('#results').innerHTML;
  submit(w, d, 'not a reference');
  out('malformed-retains-state', message(d).length > 0 && d.querySelector('#results').innerHTML === beforeMalformed && d.querySelector('#view-mode').value === 'lxx');
  submit(w, d, 'Gen 1;Gen 2');
  out('multiple-refs-rejected', /one book and chapter|not supported/.test(message(d)) && d.querySelector('#results').innerHTML === beforeMalformed);
  submit(w, d, 'Gen 1:2-3');
  out('range-rejected', /range|single verse/.test(message(d)) && d.querySelector('#results').innerHTML === beforeMalformed);
  submit(w, d, 'Gen 1:1,2');
  out('verse-list-rejected', /not supported|one book and chapter/.test(message(d)) && d.querySelector('#results').innerHTML === beforeMalformed);
  submit(w, d, 'Ps 88');
  await sleep(10);
  out('valid-reference-clears-message', message(d) === '' && lxxChapterValue(d) === '88');

  dom.window.close();
}

// ---------------------------------------------------------------------------
// 3. Canon and Parallel reference behaviour is unchanged.
// ---------------------------------------------------------------------------
{
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  await waitFor(() => d.querySelector('#results h2'));

  // Regression: an LXX text search returns to Canon and must restore the Canon
  // placeholder (the hint is synced from render(), not only from the select).
  change(w, d, '#view-mode', 'lxx');
  await waitFor(() => d.querySelector('#results .lxx-verses'));
  const inLxx = d.querySelector('#reference').placeholder;
  d.querySelector('#search').value = 'God';
  d.querySelector('#search-go').click();
  out('lxx-then-search-restores-canon-placeholder',
    /native LXX reference/i.test(inLxx)
      && d.querySelector('#view-mode').value === 'canon'
      && /John 3:16/.test(d.querySelector('#reference').placeholder)
      && !/native LXX/i.test(d.querySelector('#reference').placeholder),
    `${inLxx} -> ${d.querySelector('#reference').placeholder}`);

  change(w, d, '#view-mode', 'canon');
  submit(w, d, 'John 3:16');
  out('canon-reference-unchanged', d.querySelector('#view-mode').value === 'canon' && /3:16/.test(d.querySelector('#results').textContent) && d.querySelector('#book').value === 'JHN');
  submit(w, d, 'not a reference');
  out('canon-invalid-reference-unchanged', d.querySelector('#view-mode').value === 'canon' && message(d).length > 0);

  change(w, d, '#view-mode', 'parallel');
  await waitFor(() => d.querySelector('#parallel-lxx-content .lxx-verses'));
  submit(w, d, 'John 3:16');
  out('parallel-reference-returns-to-canon', d.querySelector('#view-mode').value === 'canon' && d.querySelector('#parallel-view').hidden && /3:16/.test(d.querySelector('#results').textContent));
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 4. Lazy-load races: submit during load, latest wins, leaving cancels.
// ---------------------------------------------------------------------------
{
  const scrolled = [];
  const dom = await openApp({ delayLxxMs: 250, record: scrolled });
  const w = dom.window;
  const d = w.document;
  await waitFor(() => d.querySelector('#results h2'));
  change(w, d, '#view-mode', 'lxx');
  // Data is not loaded yet; submit a reference immediately.
  submit(w, d, 'Ps 88:84');
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS['lxx-swete'] && lxxChapterValue(d) === '88');
  await sleep(20);
  out('reference-during-initial-load-executes', lxxBookValue(d) === 'PSA' && lxxChapterValue(d) === '88' && d.querySelectorAll('#results .lxx-verses').length === 1);
  dom.window.close();
}
{
  const dom = await openApp({ delayLxxMs: 250 });
  const w = dom.window;
  const d = w.document;
  await waitFor(() => d.querySelector('#results h2'));
  change(w, d, '#view-mode', 'lxx');
  submit(w, d, 'Gen 1');
  submit(w, d, 'Ps 88');
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS['lxx-swete'] && lxxChapterValue(d) === '88');
  await sleep(30);
  out('latest-reference-wins', lxxBookValue(d) === 'PSA' && lxxChapterValue(d) === '88', `${lxxBookValue(d)} ${lxxChapterValue(d)}`);
  out('no-duplicate-lxx-script', lxxScripts(d) === 1, String(lxxScripts(d)));
  dom.window.close();
}
{
  const dom = await openApp({ delayLxxMs: 250 });
  const w = dom.window;
  const d = w.document;
  await waitFor(() => d.querySelector('#results h2'));
  change(w, d, '#view-mode', 'lxx');
  submit(w, d, 'Gen 1');
  change(w, d, '#view-mode', 'canon');
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS['lxx-swete']);
  await sleep(50);
  out('leaving-view-cancels-pending-reference',
    d.querySelector('#view-mode').value === 'canon'
      && d.querySelector('#lxx-bar').hidden
      && !d.querySelector('#results .lxx-verses')
      && d.querySelector('#results h2'),
    d.querySelector('#view-mode').value);
  out('late-callback-leaves-canon-footer-and-panes',
    d.querySelector('#lxx-attribution').hidden && d.querySelector('#parallel-view').hidden);
  dom.window.close();
}

// ---------------------------------------------------------------------------
// 5. Canon view regression against the ACTUAL pre-change baseline.
// ---------------------------------------------------------------------------
const REGRESSION_CHAPTERS = [
  ['GEN', '1'], ['EXO', '20'], ['PSA', '23'], ['PSA', '119'], ['ISA', '53'],
  ['JER', '25'], ['DAN', '3'], ['SIR', '1'], ['MAT', '5'], ['JHN', '1'],
];
try {
  if (!fs.existsSync(BEFORE)) throw new Error(`missing ${path.relative(root, BEFORE)}`);
  const baseline = JSON.parse(fs.readFileSync(BEFORE, 'utf8'));
  const dom = await openApp();
  const w = dom.window;
  const d = w.document;
  await waitFor(() => w.MARANATHA_TRANSLATIONS && w.MARANATHA_TRANSLATIONS.web);
  const kjv = [...d.querySelectorAll('#translations input[type="checkbox"]')].find((b) => b.value === 'kjv');
  if (kjv && !kjv.checked) { kjv.checked = true; kjv.dispatchEvent(new w.Event('change', { bubbles: true })); }
  await waitFor(() => w.MARANATHA_TRANSLATIONS.kjv);
  const bookSelect = d.querySelector('#book');
  const chapterSelect = d.querySelector('#chapter');
  const diffs = [];
  for (const [b, c] of REGRESSION_CHAPTERS) {
    bookSelect.value = b; bookSelect.dispatchEvent(new w.Event('change', { bubbles: true }));
    chapterSelect.value = c; chapterSelect.dispatchEvent(new w.Event('change', { bubbles: true }));
    if (baseline[`${b} ${c}`] !== d.querySelector('#results').innerHTML) diffs.push(`${b} ${c}`);
  }
  dom.window.close();
  out('canon-ten-chapter-byte-regression', diffs.length === 0, diffs.length ? `differs: ${diffs.join(', ')}` : '10 WEB+KJV chapters identical');
} catch (error) {
  out('canon-ten-chapter-byte-regression', false, error.message);
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}${detail ? `  ${detail}` : ''}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`); }
}
console.log(`check-lxx-native-reference: ${results.length - failed} pass / ${failed} fail`);
if (failed) process.exitCode = 1;
