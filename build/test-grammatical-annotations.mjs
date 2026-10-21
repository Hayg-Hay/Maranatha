// Real file:// app journeys plus pure lookup, inventory and source-preservation checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import jsdom from 'jsdom';
const { JSDOM, VirtualConsole } = jsdom;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
let checks = 0;
function check(name, run) { run(); checks++; console.log('PASS ' + name); }
const sandbox = { window: {} };
vm.runInNewContext(read('grammatical-annotations.js'), sandbox);
const grammar = sandbox.window.MARANATHA_GRAMMATICAL_ANNOTATIONS;
const lookup = (strongs, morph = 'Prep', scheme = 'berean', language = 'grc') => grammar.lookup({ language, scheme, morph, strongs });
const array = a => Array.from(a);
check('exact language and morphology adapters; no surface guessing', () => {
  assert.deepEqual(array(lookup('1722').cases), ['Dative']);
  assert.deepEqual(array(lookup('G1722', 'PREP', 'robinson').cases), ['Dative']);
  for (const args of [['1722', 'Conj'], ['1722', 'PREP'], ['1722', '', 'berean'], ['1722', 'Prep', 'oshb'], ['1722', 'Prep', 'berean', 'he']]) {
    assert.equal(lookup(...args).status, 'non-applicable');
  }
  assert.equal(grammar.lookup().status, 'non-applicable');
  for (const id of ['', null, '1722/1519', '01722', '99999', '__proto__']) assert.equal(lookup(id).status, 'unresolved');
});
check('reviewed multiple cases and qualified meanings', () => {
  assert.deepEqual(array(lookup('1223').cases), ['Genitive', 'Accusative']);
  assert.match(lookup('1223').note, /Luke 17:11/);
  for (const id of ['1909', '3844', '4314']) assert.deepEqual(array(lookup(id).cases), ['Genitive', 'Dative', 'Accusative']);
  assert.deepEqual(array(lookup('1451').cases), ['Genitive', 'Dative']);
  assert.match(lookup('4314').note, /Acts 27:34/);
  assert.match(lookup('303').note, /Revelation 21:21/);
  assert.match(lookup('1883').note, /does not govern/);
  assert.deepEqual(array(lookup('2945').cases), ['Genitive']);
});
check('unresolved entries make no government claim', () => {
  for (const id of ['1726', '3796', '5238']) {
    assert.equal(lookup(id).status, 'unresolved');
    assert.equal(lookup(id).cases.length, 0);
    assert.ok(lookup(id).note && lookup(id).source);
  }
});
check('multi-function words respect their occurrence tags', () => {
  for (const id of ['2193', '4133', '1451', '4139', '5484']) {
    assert.equal(lookup(id).status, 'reviewed');
    for (const tag of ['Adv', 'Conj', 'N-ASF']) assert.equal(lookup(id, tag).status, 'non-applicable');
  }
});
check('reference table is immutable and explicitly general', () => {
  assert.ok(Object.isFrozen(grammar.entries));
  for (const entry of Object.values(grammar.entries)) {
    assert.ok(Object.isFrozen(entry) && Object.isFrozen(entry.cases));
    assert.match(entry.source.title, /Thayer/);
    assert.match(entry.source.url, /^https:\/\/biblehub.com\/greek\/\d+\.htm$/);
    assert.ok(entry.section && entry.note);
  }
  assert.match(lookup('1722').scope, /No complement/);
  assert.equal(lookup('1722').complement, undefined);
});

const sourceFiles = ['data/byz-interlinear.js', 'data/byz-interlinear.json', 'data/strongs-greek.js', 'data/strongs-greek.json'];
const berean = {};
const inventory = new Map();
for (const file of fs.readdirSync(path.join(root, 'data/berean')).filter(f => /^[A-Z0-9]+\.js$/.test(f))) {
  sourceFiles.push('data/berean/' + file);
  const c = { window: {} }; vm.runInNewContext(read('data/berean/' + file), c);
  Object.assign(berean, Object.values(c.window)[0].books);
}
const byz = JSON.parse(read('data/byz-interlinear.json'));
for (const chapters of Object.values(berean)) for (const verses of chapters) for (const tokens of verses || []) for (const t of tokens || []) {
  if (t[2] === 'Prep') inventory.set(t[3], (inventory.get(t[3]) || 0) + 1);
}
check('all 56 Berean identities and every Byzantine PREP identity reviewed for coverage', () => {
  assert.equal(inventory.size, 56);
  assert.deepEqual([...inventory.keys()].sort(), Object.keys(grammar.entries).sort());
  assert.equal(Object.values(grammar.entries).filter(e => e.status === 'reviewed').length, 53);
  for (const chapters of Object.values(byz.books)) for (const verses of chapters) for (const tokens of verses || []) for (const t of tokens || []) {
    if (t[2] === 'PREP') assert.ok(Object.hasOwn(grammar.entries, t[1]), t[1]);
  }
  const doc = read('docs/GRAMMATICAL_ANNOTATIONS.md');
  for (const [id, count] of inventory) assert.ok(doc.includes(`| G${id} | ${grammar.entries[id].lemma} | ${grammar.entries[id].status} | ${count} |`), id);
  assert.match(doc, /non-applicable/);
});
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const beforeHashes = sourceFiles.map(hash);

const networkRequests = [];
// jsdom 30.1 intercepts HTTP separately from file resources; 30.0 uses ResourceLoader.
const localResources = jsdom.requestInterceptor ? {
  interceptors: [jsdom.requestInterceptor(request => {
    networkRequests.push(request.url);
    throw new Error('Network is forbidden in file:// journey: ' + request.url);
  })],
} : new class extends jsdom.ResourceLoader {
  fetch(url, options) {
    if (!url.startsWith('file:')) {
      networkRequests.push(url);
      throw new Error('Network is forbidden in file:// journey: ' + url);
    }
    return super.fetch(url, options);
  }
}();
async function waitFor(fn) {
  const end = Date.now() + 15000;
  while (Date.now() < end) {
    if (fn()) return;
    await new Promise(r => setTimeout(r, 30));
  }
  throw new Error('Timed out waiting for app state');
}
function change(w, id, value) {
  const el = w.document.getElementById(id);
  if (typeof value === 'boolean') el.checked = value; else el.value = value;
  el.dispatchEvent(new w.Event('change'));
}
function go(w, book, chapter) { change(w, 'book', book); change(w, 'chapter', String(chapter)); }
function verse(d, ref) { return [...d.querySelectorAll('.interlinear-verse')].find(b => b.querySelector('.interlinear-ref')?.textContent.endsWith(ref)); }
function cards(d, ref) { return [...(verse(d, ref)?.querySelectorAll('.iw') || [])]; }
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
  resources: localResources, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.fetch = () => { throw new Error('fetch is forbidden in file:// journey'); };
  },
});
try {
  const w = dom.window, d = w.document;
  await waitFor(() => d.readyState === 'complete');
  assert.equal(w.location.protocol, 'file:');
  go(w, 'JHN', 6); change(w, 'interlinear-berean', true);
  await waitFor(() => cards(d, 'John 6:59').length === 7);
  const sourceSnapshot = JSON.stringify(w.MARANATHA_BEREAN_JHN);
  const layoutSamples = [];
  for (const edition of ['berean', 'greek']) {
    const toggle = edition === 'berean' ? 'interlinear-berean' : 'interlinear';
    const mode = edition === 'berean' ? 'interlinear-berean-mode' : 'interlinear-greek-mode';
    change(w, toggle, true);
    await waitFor(() => cards(d, 'John 6:59').length === 7 && (edition === 'berean' || w.MARANATHA_INTERLINEAR_BYZ));
    const raw = edition === 'berean' ? w.MARANATHA_BEREAN_JHN : w.MARANATHA_INTERLINEAR_BYZ;
    const snapshot = JSON.stringify(raw);
    for (const display of ['read', 'study']) {
      change(w, mode, display);
      const cs = cards(d, 'John 6:59');
      check(`${edition} ${display}: two en badges, no noun annotation, faithful source fields`, () => {
        assert.equal(cs.length, 7);
        for (const i of [2, 5]) assert.equal(cs[i].querySelector('.iw-case-chip').textContent, '+Dat');
        assert.equal(cs[3].querySelector('.iw-case-chip'), null);
        assert.equal(cs[2].querySelector('.iw-greek').textContent, 'ἐν');
        if (edition === 'berean') {
          assert.equal(cs[2].querySelector('.iw-gloss, .iw-gloss-short').textContent, 'in');
          assert.equal(cs[3].querySelector('.iw-gloss, .iw-gloss-short').textContent, 'the synagogue');
        }
      });
      const c = cs[2];
      if (c.matches('button')) {
        c.focus(); c.click();
        check(`${edition} ${display}: existing accessible disclosure contains separate grammar and raw morphology`, () => {
          assert.equal(c.getAttribute('aria-expanded'), 'true');
          const detail = d.getElementById(c.getAttribute('aria-controls'));
          assert.equal(detail.hidden, false);
          assert.match(detail.querySelector('.iw-detail-list').textContent, edition === 'berean' ? /Prep/ : /PREP/);
          assert.match(detail.querySelector('.iw-grammar-note').textContent, /Supplemental grammar.*No complement/s);
          assert.equal(c.querySelector('details, a, button'), null);
        });
      } else {
        check(`${edition} ${display}: native keyboard disclosure and offline explanation`, () => {
          const details = c.querySelector('details'), summary = details.querySelector('summary');
          assert.equal(summary.getAttribute('aria-label'), 'Supplemental grammar for ἐν');
          assert.equal(summary.parentElement, details);
          assert.equal(details.open, false);
          assert.match(details.querySelector('.iw-grammar-note').textContent, /General NT Greek/);
          assert.match(details.querySelector('a').textContent, /online reference/);
        });
      }
      check(`${edition} ${display}: multi-case government remains general`, () => {
        const dia = [...d.querySelectorAll('.iw')].find(c => c.querySelector('.iw-greek')?.textContent === 'διὰ');
        assert.equal(dia.querySelector('.iw-case-chip').textContent, '+Gen/Acc');
      });
      check(`${edition} ${display}: compact chips share caret row and describe general government in full`, () => {
        for (const [text, full, count, minWidth] of [
          ['+Dat', 'Dative', 1, '4.5rem'],
          ['+Gen/Acc', 'Genitive / Accusative', 2, '6.5rem'],
          ['+Gen/Dat/Acc', 'Genitive / Dative / Accusative', 3, '8rem'],
        ]) {
          const card = [...d.querySelectorAll('.iw')].find(c => c.querySelector('.iw-case-chip')?.textContent === text);
          assert.ok(card, text);
          const chip = card.querySelector('.iw-case-chip');
          const control = card.matches('button') ? card : card.querySelector('summary');
          const description = d.getElementById(control.getAttribute('aria-describedby'));
          assert.equal(description.textContent, 'General government: ' + full + '. ' + grammar.scope);
          assert.equal(description.hidden, true);
          assert.equal(chip.getAttribute('aria-hidden'), 'true');
          assert.equal(chip.title, description.textContent);
          assert.equal(w.getComputedStyle(chip).whiteSpace, 'nowrap');
          assert.equal(w.getComputedStyle(card).minWidth, minWidth);
          assert.ok(card.classList.contains(`iw-case-count-${count}`));
          const footer = card.matches('button') ? card.querySelector('.iw-grammar-footer') : control;
          assert.equal(chip.parentElement, footer);
          assert.ok(footer.querySelector('.iw-caret, .iw-grammar-caret'));
          const clone = card.cloneNode(true);
          clone.classList.remove('is-expanded');
          if (clone.matches('button')) clone.setAttribute('aria-expanded', 'false');
          clone.querySelector('details')?.removeAttribute('open');
          layoutSamples.push({ label: `${edition} ${display} ${text}`, html: clone.outerHTML });
        }
      });
    }
    check(`${edition}: rendering never mutates loaded source corpus`, () => assert.equal(JSON.stringify(raw), snapshot));
  }
  check('Berean corpus survives edition switching unchanged', () => assert.equal(JSON.stringify(w.MARANATHA_BEREAN_JHN), sourceSnapshot));
  const dictionary = JSON.stringify(w.MARANATHA_STRONGS_GREEK);
  check('missing annotation module leaves the original interlinear usable', () => {
    const module = w.MARANATHA_GRAMMATICAL_ANNOTATIONS;
    w.MARANATHA_GRAMMATICAL_ANNOTATIONS = undefined;
    change(w, 'interlinear-berean', true);
    change(w, 'interlinear-berean-mode', 'read');
    assert.equal(cards(d, 'John 6:59').length, 7);
    assert.equal(d.querySelector('.iw-case-chip'), null);
    assert.equal(cards(d, 'John 6:59')[2].querySelector('.iw-gloss').textContent, 'in');
    w.MARANATHA_GRAMMATICAL_ANNOTATIONS = module;
    change(w, 'interlinear-berean-mode', 'study');
    assert.equal(cards(d, 'John 6:59')[2].querySelector('.iw-case-chip').textContent, '+Dat');
  });
  check('supplemental rendering preserves the loaded Strong’s dictionary', () => assert.equal(JSON.stringify(w.MARANATHA_STRONGS_GREEK), dictionary));
  change(w, 'interlinear-berean', true); go(w, '1CO', 4);
  await waitFor(() => cards(d, '1 Corinthians 4:5').length > 0);
  check('real conjunction heos receives no preposition badge', () => {
    const c = cards(d, '1 Corinthians 4:5').find(c => c.querySelector('.iw-greek')?.textContent === 'ἕως');
    assert.ok(c); assert.equal(c.querySelector('.iw-case-chip'), null);
  });
  go(w, 'MAT', 28); await waitFor(() => cards(d, 'Matthew 28:1').length > 0);
  check('real unresolved opse is visibly unresolved without a case badge', () => {
    for (const mode of ['read', 'study']) {
      change(w, 'interlinear-berean-mode', mode);
      const c = cards(d, 'Matthew 28:1')[0];
      assert.equal(c.querySelector('.iw-case-chip'), null);
      const panel = c.matches('button') ? d.getElementById(c.getAttribute('aria-controls')) : c;
      assert.match(panel.querySelector('.iw-grammar-note').textContent, /Supplemental grammar · unresolved/);
      const control = c.matches('button') ? c : c.querySelector('summary');
      assert.match(d.getElementById(control.getAttribute('aria-describedby')).textContent, /General government: unresolved/);
    }
  });
  change(w, 'interlinear-berean', false); go(w, 'GEN', 1); change(w, 'interlinear-he', true);
  await waitFor(() => d.querySelector('.iw-hebrew'));
  check('Hebrew receives no Greek grammar annotations', () => assert.equal(d.querySelector('.iw-case-chip'), null));
  check('classic annotation script loads locally once with no network or fetch', () => {
    const resources = [...d.scripts].filter(s => s.src).map(s => s.src);
    assert.equal(resources.filter(u => u.endsWith('/grammatical-annotations.js')).length, 1);
    assert.ok(resources.every(u => u.startsWith('file:')));
    assert.deepEqual(networkRequests, []);
    assert.deepEqual(errors, []);
  });
  if (process.argv.includes('--layout-fixture')) {
    const { writeGrammarChipFixture } = await import('./tools/grammar-chip-layout-fixture.mjs');
    const output = path.join(root, 'build/reports/grammar-chip-layout.html');
    writeGrammarChipFixture(output, layoutSamples);
    console.log('Wrote real-card browser measurement fixture: ' + output);
  }
} finally { dom.window.close(); }
check('all Greek source files remain byte-identical after lookup/render journeys', () => assert.deepEqual(sourceFiles.map(hash), beforeHashes));
console.log(`\n${checks}/${checks} grammatical annotation checks passed.`);
