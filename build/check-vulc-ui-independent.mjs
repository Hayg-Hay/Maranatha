// Independent UI acceptance checks for cases missed by the initial implementation.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) {
  for (let attempt = 0; attempt < 400; attempt++) { if (fn()) return; await pause(25); }
  throw new Error('Timed out waiting for local script loading');
}
let failures = 0;
for (const narrow of [false, true]) {
  const dom = await JSDOM.fromFile(fileURLToPath(new URL('../index.html', import.meta.url)), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: narrow && q.includes('700px'), addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.fetch = () => { throw new Error('Network forbidden'); };
      w.XMLHttpRequest = class { open() { throw new Error('Network forbidden'); } };
    },
  });
  const w = dom.window, d = w.document;
  await until(() => d.readyState === 'complete' && w.MARANATHA_TRANSLATIONS?.web);
  const change = (el, value) => { el.value = value; el.dispatchEvent(new w.Event('change')); };
  // First load directly in the independent pane, before its main checkbox has
  // ever loaded Latin. This catches stale pickers after asynchronous loading.
  assert.equal(w.MARANATHA_TRANSLATIONS.vulc, undefined);
  change(d.querySelector('#view-mode'), 'parallel');
  change(d.querySelector('#parallel-book'), 'EST');
  change(d.querySelector('#parallel-translation'), 'vulc');
  await until(() => d.querySelector('#parallel-translation-content .latin-verse'));
  assert.equal(d.querySelector('#parallel-chapter').options.length, 16, 'First pane-only Latin load exposes native chapters');
  change(d.querySelector('#parallel-translation'), 'web');
  change(d.querySelector('#view-mode'), 'canon');
  const box = d.querySelector('#translations input[value="vulc"]');
  box.checked = true; box.dispatchEvent(new w.Event('change'));
  await until(() => w.MARANATHA_TRANSLATIONS.vulc && d.querySelector('#search-translation option[value="vulc"]'));
  d.querySelector('#reference').value = 'John 10'; d.querySelector('#reference-go').click();
  change(d.querySelector('#book'), 'GEN');
  assert.equal(d.querySelector('#chapter').value, '1', 'Changing books must start at chapter 1');
  change(d.querySelector('#search-translation'), 'web');
  d.querySelector('#search').value = 'God'; d.querySelector('#search-go').click();
  const toggle = d.querySelector('.search-hit .compare-toggle');
  assert(toggle, 'WEB search comparison control'); toggle.click();
  const panel = d.querySelector('.search-hit .compare-panel');
  try {
    assert(panel.querySelector('.compare-native-notice'));
    assert.equal(panel.querySelectorAll('.latin-verse, .compare-native-text').length, 0, 'WEB search must not show same-numbered Latin as correspondence');
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} WEB search suppresses unverified Latin correspondence`);
  } catch (e) { failures++; console.error(`FAIL ${e.message}`); }
  box.checked = false; box.dispatchEvent(new w.Event('change'));
  const mode = d.querySelector('#view-mode');
  assert(mode, 'View mode control'); change(mode, 'parallel');
  change(d.querySelector('#parallel-translation'), 'vulc');
  change(d.querySelector('#parallel-book'), 'EST');
  await until(() => d.querySelector('#parallel-translation-content .latin-verse'));
  try {
    assert.equal(d.querySelector('#parallel-chapter').options.length, 16, 'Parallel Latin must expose Esther 16 even with main Latin unchecked');
    change(d.querySelector('#parallel-chapter'), '16');
    assert(d.querySelector('#parallel-translation-content .latin-verse'));
    change(d.querySelector('#parallel-translation'), 'web');
    assert.equal(d.querySelector('#parallel-chapter').options.length, 10, 'Parallel WEB must return to its chapter extent');
    console.log(`PASS ${narrow ? 'mobile' : 'desktop'} independent parallel translation navigation`);
  } catch (e) { failures++; console.error(`FAIL ${e.message}`); }
  dom.window.close();
}
assert.equal(failures, 0, `${failures} independent UI checks failed`);
