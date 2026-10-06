import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(ROOT, 'hebrew-script.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(script, sandbox);
const { toPaleo, toSquare } = sandbox.window.MARANATHA_HEBREW_SCRIPT;
const genesis = '𐤁𐤓𐤀𐤔𐤉𐤕 𐤁𐤓𐤀 𐤀𐤋𐤄𐤉𐤌 𐤀𐤕 𐤄𐤔𐤌𐤉𐤌 𐤅𐤀𐤕 𐤄𐤀𐤓𐤑';
assert.equal(toPaleo('בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃'), genesis);
assert.equal(toPaleo('ךםןףץ'), '𐤊𐤌𐤍𐤐𐤑');
assert.equal(toPaleo('שׁ שׂ בּ וֹ יִ'), '𐤔 𐤔 𐤁 𐤅 𐤉');
assert.equal(toPaleo('אֶת־הָאָרֶץ׃'), '𐤀𐤕 𐤄𐤀𐤓𐤑');
assert.equal(toSquare('𐤀𐤁𐤂𐤃𐤄𐤅𐤆𐤇𐤈𐤉𐤊𐤋𐤌𐤍𐤎𐤏𐤐𐤑𐤒𐤓𐤔𐤕'), 'אבגדהוזחטיכלמנסעפצקרשת');
assert.equal(toPaleo('<& English 123'), '<& English 123');

const file = path.join(ROOT, 'index.html');
async function open({ blockedStorage = false, saved = null, savedScripts = null, narrow = false } = {}) {
  const dom = await JSDOM.fromFile(file, {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.matchMedia = query => ({ matches: narrow && query.includes('700px'), addEventListener() {} });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = () => {};
      const prefs = new Map(saved ? [['maranatha-hebrew-script', saved]] : []);
      if (savedScripts) prefs.set('maranatha-hebrew-scripts', JSON.stringify(savedScripts));
      Object.defineProperty(w, 'localStorage', { value: {
        getItem(key) { if (blockedStorage) throw new Error('Storage blocked'); return prefs.get(key) || null; },
        setItem(key, value) { if (blockedStorage) throw new Error('Storage blocked'); prefs.set(key, value); },
      } });
    },
  });
  await new Promise(resolve => dom.window.document.readyState === 'complete'
    ? resolve() : dom.window.addEventListener('load', resolve));
  return dom;
}
async function waitFor(fn) {
  for (let i = 0; i < 200; i++) {
    if (fn()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error('Timed out waiting for app');
}
function change(w, selector, value) {
  if (selector === '#hebrew-script') {
    const picker = w.document.querySelector('#hebrew-scripts');
    picker.querySelectorAll('input').forEach(box => { box.checked = box.value === value; });
    picker.querySelector('input').dispatchEvent(new w.Event('change', { bubbles: true }));
    return;
  }
  const el = w.document.querySelector(selector);
  if (el.type === 'checkbox') el.checked = value; else el.value = value;
  el.dispatchEvent(new w.Event('change'));
}
for (const narrow of [false, true]) {
  const dom = await open({ narrow });
  try {
    const w = dom.window, d = w.document;
    change(w, '#book', 'GEN');
    change(w, '#translations input[value="he"]', true);
    await waitFor(() => d.querySelector('.hebrew-verse'));
    const raw = d.querySelector('.hebrew-verse').textContent;
    const source = JSON.stringify(w.MARANATHA_TRANSLATIONS.he);
    assert.equal(toPaleo(raw), genesis);
    for (const layout of ['multicolumn', 'multirow']) {
      change(w, '#layout', layout);
      for (const scriptMode of ['paleo', 'proto']) {
        change(w, '#hebrew-script', scriptMode);
        const className = scriptMode === 'proto' ? '.proto-sinaitic' : '.paleo-hebrew';
        assert.equal(d.querySelector(className).textContent, genesis);
        assert.equal(d.querySelector(className).dir, 'rtl');
        assert.equal(d.querySelector('#hebrew-script-note').open, false);
        assert.equal(d.querySelector('#hebrew-script-source').hidden, scriptMode !== 'proto');
        change(w, '#hebrew-script', 'square');
        assert.equal(d.querySelector('.hebrew-verse').textContent, raw);
        assert(!d.querySelector('.proto-sinaitic'));
      }
      change(w, '#hebrew-script', 'paleo');
      assert.equal(d.querySelector('.paleo-hebrew').textContent, genesis);
      assert.equal(d.querySelector('.paleo-hebrew').dir, 'rtl');
      assert.equal(d.querySelector('.paleo-hebrew').lang, 'hbo-Phnx');
      assert.equal(d.querySelector('#hebrew-script-note').hidden, false);
      assert.equal(d.querySelector('#hebrew-script-note').open, false, 'display explanation starts collapsed');
      assert.match(d.querySelector('#hebrew-script-description').textContent, /not a scholarly reconstruction/);
      change(w, '#hebrew-script', 'square');
      assert.equal(d.querySelector('.hebrew-verse').textContent, raw);
    }
    change(w, '#hebrew-script', 'paleo');
    d.querySelector('#reference').value = 'Gen 1:2';
    d.querySelector('#reference-go').click();
    d.querySelector('#context-toggle').click();
    assert(d.querySelectorAll('.paleo-hebrew').length > 1);

    async function search(translation, query) {
      change(w, '#search-translation', translation);
      d.querySelector('#search').value = query;
      d.querySelector('#search-go').click();
      assert(d.querySelector('.search-hit'));
      return d.querySelectorAll('.search-hit').length;
    }
    const squareCount = await search('he', 'הארץ');
    const hits = Array.from(d.querySelectorAll('.search-text'), el => el.textContent);
    assert.equal(d.querySelector('.search-hit .search-text').querySelector('mark')?.textContent, '𐤄𐤀𐤓𐤑', 'first hit highlights the word including its final letter');
    assert.equal(await search('he', '𐤄𐤀𐤓𐤑'), squareCount);
    assert.deepEqual(Array.from(d.querySelectorAll('.search-text'), el => el.textContent), hits);
    change(w, '#hebrew-script', 'square');
    assert(d.querySelector('.search-text').textContent.includes('הָאָ'));
    change(w, '#hebrew-script', 'paleo');
    await search('web', 'earth');
    d.querySelector('.compare-toggle').click();
    assert(d.querySelector('.compare-text.paleo-hebrew'));

    change(w, '#hebrew-script', 'proto');
    d.querySelector('.compare-toggle').click();
    assert(d.querySelector('.compare-text.proto-sinaitic'));
    assert.match(d.querySelector('#hebrew-script-description').textContent, /Sinai inscriptions/);
    assert.equal(await search('he', 'הארץ'), squareCount);
    assert.equal(d.querySelector('.search-hit .search-text mark').textContent, '𐤄𐤀𐤓𐤑');
    assert(d.querySelector('.search-text.proto-sinaitic'));
    assert.equal(await search('he', '𐤄𐤀𐤓𐤑'), squareCount);
    d.querySelector('#reference').value = 'Gen 1:2';
    d.querySelector('#reference-go').click();
    assert(d.querySelector('.proto-sinaitic'));
    assert(d.querySelectorAll('.proto-sinaitic').length > 1, 'early-script context rendering');
    d.querySelector('#reference').value = 'Exodus 20';
    d.querySelector('#reference-go').click();
    assert.deepEqual(
      Array.from(d.querySelectorAll('.proto-sinaitic'), el => el.textContent),
      Array.from(w.MARANATHA_TRANSLATIONS.he.books.EXO[19], verse => toPaleo(verse)),
      'the Ten Commandments chapter retains every source consonant in the early-script view',
    );

    // Consonants are preserved throughout every loaded OT chapter; no
    // source mutation, square letters or pointed remnants leak into display.
    for (const chapters of Object.values(w.MARANATHA_TRANSLATIONS.he.books)) {
      for (const chapter of chapters) for (const verse of chapter) {
        const display = toPaleo(verse);
        assert(!/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u05D0-\u05EA]/u.test(display));
        const consonants = verse.normalize('NFD').replace(/[^א-ת]/g, '')
          .replace(/[ךםןףץ]/g, ch => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' })[ch]);
        assert.equal(toSquare(display).replace(/[^א-ת]/g, ''), consonants);
      }
    }
    assert.equal(JSON.stringify(w.MARANATHA_TRANSLATIONS.he), source);

    // One source, three independently styled reading views; no duplicate loads.
    const picker = d.querySelector('#hebrew-scripts');
    picker.open = true;
    for (const value of ['square', 'paleo']) {
      const box = picker.querySelector(`input[value="${value}"]`);
      box.checked = true;
      box.dispatchEvent(new w.Event('change', { bubbles: true }));
    }
    assert.equal(picker.open, true, 'picker stays open while selecting several scripts');
    assert.equal(d.querySelector('#hebrew-script-summary').textContent, '3 selected');
    d.querySelector('#reference').value = 'Gen 1:1';
    for (const layout of ['multicolumn', 'multirow']) {
      change(w, '#layout', layout);
      d.querySelector('#reference-go').click();
      assert(d.querySelector('.hebrew-verse:not(.paleo-hebrew):not(.proto-sinaitic)'));
      assert.equal(d.querySelector('.paleo-hebrew').textContent, genesis);
      assert.equal(d.querySelector('.proto-sinaitic').textContent, genesis);
      assert.match(d.querySelector('#results').textContent, /OSHB.*Square Hebrew/s);
      assert.match(d.querySelector('#results').textContent, /OSHB.*Paleo-Hebrew/s);
      assert.match(d.querySelector('#results').textContent, /OSHB.*Proto-Sinaitic/s);
    }
    assert.equal(Array.from(d.scripts).filter(el => el.src.includes('/data/he.js')).length, 1);
    assert.equal(await search('he', 'הארץ'), squareCount);
    const firstHit = d.querySelector('.search-hit');
    assert.equal(firstHit.querySelectorAll('.search-text').length, 3);
    assert.equal(firstHit.querySelector('.search-text.paleo-hebrew mark').textContent, '𐤄𐤀𐤓𐤑');
    assert.equal(firstHit.querySelector('.search-text.proto-sinaitic mark').textContent, '𐤄𐤀𐤓𐤑');
    await search('web', 'earth');
    d.querySelector('.compare-toggle').click();
    assert.equal(d.querySelectorAll('.compare-text.hebrew-verse').length, 3);
    picker.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(picker.open, false);
    picker.open = true;
    d.querySelector('#reference').click();
    assert.equal(picker.open, false, 'outside click closes the picker');
    change(w, '#hebrew-script', 'square');
    assert.equal(picker.querySelector('input[value="square"]').disabled, true, 'at least one script remains selected');
    assert.equal(JSON.stringify(w.MARANATHA_TRANSLATIONS.he), source);

    change(w, '#interlinear-he', true);
    await waitFor(() => d.querySelector('.iw-hebrew'));
    assert(/[א-ת]/u.test(d.querySelector('.iw-hebrew').textContent));
    assert(!d.querySelector('.iw-hebrew.paleo-hebrew'));
    assert(!d.querySelector('.iw-hebrew.proto-sinaitic'));
  } finally { dom.window.close(); }
}
const blocked = await open({ blockedStorage: true });
change(blocked.window, '#hebrew-script', 'paleo');
assert.equal(blocked.window.document.querySelector('#hebrew-script-note').hidden, false);
const blockedProto = blocked.window.document.querySelector('#hebrew-scripts input[value="proto"]');
blockedProto.checked = true;
blockedProto.dispatchEvent(new blocked.window.Event('change', { bubbles: true }));
assert.equal(blocked.window.document.querySelector('#hebrew-script-summary').textContent, '2 selected');
blocked.window.close();
const protoRestored = await open({ saved: 'proto' });
assert.equal(protoRestored.window.document.querySelector('#hebrew-scripts input:checked').value, 'proto');
assert.equal(protoRestored.window.document.querySelector('#hebrew-script-source').hidden, false);
protoRestored.window.close();
const restored = await open({ saved: 'paleo' });
assert.equal(restored.window.document.querySelector('#hebrew-scripts input:checked').value, 'paleo');
restored.window.close();
const multipleRestored = await open({ savedScripts: ['square', 'proto'] });
assert.equal(multipleRestored.window.document.querySelectorAll('#hebrew-scripts input:checked').length, 2);
assert.equal(multipleRestored.window.document.querySelector('#hebrew-script-summary').textContent, '2 selected');
multipleRestored.window.close();
console.log('PASS Paleo-Hebrew and early-script display: alphabet, full OT preservation, Ten Commandments, file:// desktop/mobile, layouts, context, search, comparison, interlinear and storage.');
