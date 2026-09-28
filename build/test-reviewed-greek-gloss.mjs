// test-reviewed-greek-gloss.mjs
//
// Repeatable runtime test for the candidate Greek reading-gloss layer.
// It loads the real app under jsdom from `file://`, exercises the interlinear,
// and checks the behaviors the data validators cannot cover:
//
//   1. Candidate overrides are shown in Read mode (transliteration + gloss).
//   2. Intentional blanks render as a deliberately empty gloss.
//   3. The optional pilot file is truly optional: a failed load leaves the
//      Greek interlinear working with the existing Strong's-derived gloss.
//   4. A successful late load rerenders the active interlinear (candidate
//      overrides appear without a manual refresh).
//   5. Study mode is unchanged (dense cards, no candidate leak).
//   6. Non-pilot verses keep the old Strong's-derived behavior.
//
// Requires jsdom (devDependency). Run:
//   node build/test-reviewed-greek-gloss.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');
const OPTIONAL_FILE = 'reviewed-greek-gloss.js';

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch (error) {
  console.error('This runtime test requires jsdom. Install devDependencies first.');
  console.error('  npm install');
  process.exit(2);
}

const results = [];
const check = (name, condition, detail) =>
  results.push([name, !!condition, detail]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (error) {}
    await sleep(50);
  }
  return false;
}

function commonBeforeParse(window) {
  const media = () => ({
    matches: false, media: '', addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  });
  window.matchMedia = () => media();
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

async function createDom({ onOptionalScript, beforeParse } = {}) {
  const dom = await JSDOM.fromFile(INDEX, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      commonBeforeParse(window);
      if (beforeParse) beforeParse(window);
      const origAppend = window.Node.prototype.appendChild;
      window.__restoreAppend = () => { window.Node.prototype.appendChild = origAppend; };
      if (onOptionalScript) {
        window.Node.prototype.appendChild = function appendChild(child) {
          let isOptional = false;
          try {
            isOptional = child && child.tagName === 'SCRIPT' &&
              String(child.src).includes(OPTIONAL_FILE);
          } catch (error) {}
          if (isOptional) return onOptionalScript(window, child, origAppend);
          return origAppend.call(this, child);
        };
      }
    },
  });
  const { window } = dom;
  const { document } = window;
  await new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });
  return dom;
}

function gotoJohn6AndEnableGreek(window) {
  const { document } = window;
  const book = document.getElementById('book');
  book.value = 'JHN';
  book.dispatchEvent(new window.Event('change'));
  const chapter = document.getElementById('chapter');
  chapter.value = '6';
  chapter.dispatchEvent(new window.Event('change'));
  const interlinear = document.getElementById('interlinear');
  interlinear.checked = true;
  interlinear.dispatchEvent(new window.Event('change'));
  return interlinear;
}

function verseBlock(document, num) {
  return [...document.querySelectorAll('.interlinear-verse')]
    .find((b) => b.querySelector('.interlinear-ref')?.textContent === `John 6:${num}`);
}
function readCards(document, num) {
  const block = verseBlock(document, num);
  if (!block) return [];
  return [...block.querySelectorAll('.iw-toggle')].map((btn) => ({
    surface: btn.querySelector('.iw-greek')?.textContent,
    translit: btn.querySelector('.iw-translit')?.textContent,
    gloss: btn.querySelector('.iw-gloss-short')?.textContent,
  }));
}
const inReadMode = (document) => !!document.querySelector('.interlinear-verse .iw-toggle');

// ---------------------------------------------------------------------------
// Scenario A — optional file present: fallback first, then late-load overrides
// ---------------------------------------------------------------------------
{
  let held = null;
  const dom = await createDom({
    onOptionalScript(window, child) {
      held = child;               // hold it back to force the fallback render
      return child;
    },
  });
  const { window } = dom;
  const { document } = window;
  gotoJohn6AndEnableGreek(window);

  const requiredLoaded = await waitFor(() => inReadMode(document));
  check('required data loads and interlinear renders', requiredLoaded);
  await sleep(150);

  const preRelease = readCards(document, 50);
  const nonPilotBefore = readCards(document, 49);
  check('before optional load, G1537 ek uses the Strong\'s fallback',
    preRelease[5] && preRelease[5].gloss === 'literal or figurative', JSON.stringify(preRelease[5]));

  // Release the held optional script; its onload must rerender automatically.
  check('optional script was deferred (not loaded with required data)', !!held);
  window.__restoreAppend();
  if (held) window.Node.prototype.appendChild.call(document.head, held);
  const overridden = await waitFor(() => {
    const cards = readCards(document, 50);
    return cards[5] && cards[5].gloss === 'from';
  });
  check('successful late optional load rerenders with candidate overrides', overridden);

  const c50 = readCards(document, 50);
  const nonPilotAfter = readCards(document, 49);
  check('non-pilot verse 6:49 is byte-identical before and after candidates load',
    nonPilotBefore.length > 0 && JSON.stringify(nonPilotBefore) === JSON.stringify(nonPilotAfter),
    `before ${nonPilotBefore.length}, after ${nonPilotAfter.length}`);

  const c51 = readCards(document, 51);
  check('John 6:50 Read card count is 17', c50.length === 17, `got ${c50.length}`);
  check('John 6:51 Read card count is 41', c51.length === 41, `got ${c51.length}`);

  check('6:50 ek candidate = ek / from', c50[5]?.translit === 'ek' && c50[5]?.gloss === 'from', JSON.stringify(c50[5]));
  check('6:50 ex candidate = ex / of', c50[11]?.translit === 'ex' && c50[11]?.gloss === 'of', JSON.stringify(c50[11]));
  check('6:51 first ek candidate = ek / from', c51[7]?.translit === 'ek' && c51[7]?.gloss === 'from', JSON.stringify(c51[7]));
  check('6:51 second ek candidate = ek / of', c51[14]?.translit === 'ek' && c51[14]?.gloss === 'of', JSON.stringify(c51[14]));

  check('revised 6:50 ho = that', c50[4]?.gloss === 'that', JSON.stringify(c50[4]));
  check('revised 6:50 katabainon = comes down', c50[8]?.gloss === 'comes down', JSON.stringify(c50[8]));
  check('revised 6:50 phage = may eat', c50[13]?.gloss === 'may eat', JSON.stringify(c50[13]));
  check('revised 6:51 ho = that', c51[6]?.gloss === 'that', JSON.stringify(c51[6]));
  check('revised 6:51 katabas = having come down', c51[10]?.gloss === 'having come down', JSON.stringify(c51[10]));
  check('revised 6:51 aiona = forever', c51[21]?.gloss === 'forever', JSON.stringify(c51[21]));

  const blanks = [[50, 6, 'tou'], [51, 8, 'tou'], [51, 19, 'eis'], [51, 20, 'ton'], [51, 25, 'de']];
  for (const [verse, index, translit] of blanks) {
    const card = (verse === 50 ? c50 : c51)[index];
    check(`intentional blank renders empty at ${verse}:${index + 1} (${translit})`,
      card && card.translit === translit && card.gloss === '', JSON.stringify(card));
  }

  // Detail panel identifies the candidate row.
  verseBlock(document, 51).querySelectorAll('.iw-toggle')[25].click();
  const detailText = document.querySelector('.interlinear-details .iw-detail:not([hidden])')?.textContent || '';
  check('detail panel labels the row "candidate pilot"', /Reading gloss \(candidate pilot\)/.test(detailText), detailText.slice(0, 120));

  // Study mode unchanged.
  const modeSel = document.getElementById('interlinear-greek-mode');
  modeSel.value = 'study';
  modeSel.dispatchEvent(new window.Event('change'));
  await waitFor(() => document.querySelectorAll('.interlinear-verse .iw:not(.iw-toggle)').length > 0);
  const studyCards = [...verseBlock(document, 51).querySelectorAll('.iw:not(.iw-toggle)')];
  check('Study mode still renders 41 dense cards', studyCards.length === 41, `got ${studyCards.length}`);
  const studyDe = studyCards[25]?.querySelector('.iw-gloss')?.textContent;
  check('Study mode de is not blank (candidate layer does not leak)', !!studyDe, JSON.stringify(studyDe));

  window.close();
}

// ---------------------------------------------------------------------------
// Scenario B — optional file missing: required interlinear still works
// ---------------------------------------------------------------------------
{
  const dom = await createDom({
    onOptionalScript(window, child) {
      // Simulate a 404: never load it, fire the error handler asynchronously.
      setTimeout(() => { if (child.onerror) child.onerror(new window.Event('error')); }, 0);
      return child;
    },
  });
  const { window } = dom;
  const { document } = window;
  gotoJohn6AndEnableGreek(window);

  const rendered = await waitFor(() => inReadMode(document));
  check('missing optional file: interlinear still renders', rendered);
  await sleep(200);

  const c50 = readCards(document, 50);
  const c51 = readCards(document, 51);
  check('missing optional file: John 6:50 still has 17 cards', c50.length === 17, `got ${c50.length}`);
  check('missing optional file: John 6:51 still has 41 cards', c51.length === 41, `got ${c51.length}`);
  check('missing optional file: G1537 ek falls back to Strong\'s gloss',
    c50[5] && c50[5].gloss === 'literal or figurative', JSON.stringify(c50[5]));
  check('missing optional file: no blocking error message',
    !/Could not load .*reviewed-greek-gloss/.test(document.getElementById('message')?.textContent || ''),
    document.getElementById('message')?.textContent);

  // Non-pilot verse still renders under the missing-data scenario.
  const c49 = readCards(document, 49);
  check('missing optional file: non-pilot verse 6:49 still renders', c49.length > 0, `got ${c49.length}`);

  window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} runtime checks passed.`);
process.exit(failed ? 1 : 0);
