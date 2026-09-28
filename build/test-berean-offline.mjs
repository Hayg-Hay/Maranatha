// test-berean-offline.mjs
//
// Behavioral tests for opt-in Berean offline caching (issue 2). These drive the
// real app through a fake service worker so the flow is exercised, not just
// regex-matched in the source:
//   - no controller yet, worker becomes available later
//   - partial cache failure reported as incomplete, with a working retry
//   - confirmed 27/27 completion and no redundant re-warm
//   - file:// makes no service-worker calls
//
//   node build/test-berean-offline.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

const { JSDOM } = await import('jsdom');

const results = [];
const check = (name, ok, detail) => results.push([name, !!ok, detail]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (fn()) return true; } catch (e) {}
    await sleep(40);
  }
  return false;
}

function commonBeforeParse(window) {
  const media = () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  window.matchMedia = () => media();
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

function installFakeSW(window, { controller = false, active = false, resolveReadyNow = false, policy }) {
  const listeners = {};
  let resolveReadyFn;
  const registration = { active: null, waiting: null, addEventListener() {}, removeEventListener() {} };
  const worker = {
    posts: [],
    postMessage(msg) {
      worker.posts.push(msg);
      setTimeout(() => {
        const result = policy(msg);
        (listeners.message || []).forEach((cb) => cb({
          data: { type: 'BEREAN_CACHE_RESULT', requestId: msg.requestId, cached: result.cached, failed: result.failed },
        }));
      }, 0);
    },
  };
  const sw = {
    controller: null,
    ready: new Promise((r) => { resolveReadyFn = r; }),
    register() { return Promise.resolve(registration); },
    addEventListener(t, cb) { (listeners[t] = listeners[t] || []).push(cb); },
    removeEventListener(t, cb) { listeners[t] = (listeners[t] || []).filter((x) => x !== cb); },
  };
  if (controller) sw.controller = worker;
  if (active) registration.active = worker;
  Object.defineProperty(window.navigator, 'serviceWorker', { configurable: true, value: sw });
  if (resolveReadyNow && (controller || active)) resolveReadyFn(registration);
  return {
    sw, worker, registration,
    activate() { registration.active = worker; sw.controller = worker; },
    resolveReady() { resolveReadyFn(registration); },
  };
}

// Loads the real app from file:// (works offline, no network) and optionally
// installs a fake service-worker API in beforeParse so the SW code path runs.
async function createDom(setup) {
  const dom = await JSDOM.fromFile(INDEX, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(window) { commonBeforeParse(window); if (setup) setup(window); },
  });
  const { window } = dom;
  await new Promise((r) => { if (window.document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  return dom;
}

function goto(window, bookId, chapter) {
  const { document } = window;
  const b = document.getElementById('book'); b.value = bookId; b.dispatchEvent(new window.Event('change'));
  const c = document.getElementById('chapter'); c.value = String(chapter); c.dispatchEvent(new window.Event('change'));
}
function toggle(window, id, checked) {
  const el = window.document.getElementById(id); el.checked = checked; el.dispatchEvent(new window.Event('change'));
}
const statusText = (document) => document.getElementById('berean-cache-status')?.textContent || '';

// ---------------------------------------------------------------------------
// 1. No controller yet; the ready registration's worker becomes available
// ---------------------------------------------------------------------------
{
  const policy = (msg) => ({ cached: msg.books.slice(), failed: [] });
  let ctl;
  const dom = await createDom((window) => { ctl = installFakeSW(window, { policy }); });
  const { window } = dom; const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => /Caching/.test(statusText(document)));
  check('shows a caching status while no worker is ready yet', /Caching/.test(statusText(document)));
  check('does not yet mark the corpus warmed', !/available offline/.test(statusText(document)));

  ctl.activate();       // registration.active becomes available
  ctl.resolveReady();   // navigator.serviceWorker.ready resolves
  await waitFor(() => /available offline/.test(statusText(document)));
  check('warms once the ready registration exposes a worker', /available offline/.test(statusText(document)));
  check('reports 27/27 completion', /\(27\/27 books\)/.test(statusText(document)));
  check('sent exactly one cache request covering 27 books', ctl.worker.posts.length === 1 && ctl.worker.posts[0].books.length === 27);
  window.close();
}

// ---------------------------------------------------------------------------
// 2. Partial failure is reported incomplete and can be retried
// ---------------------------------------------------------------------------
{
  let call = 0;
  const policy = (msg) => {
    call++;
    if (call === 1) return { cached: msg.books.filter((b) => b !== 'REV'), failed: ['REV'] };
    return { cached: msg.books.slice(), failed: [] };
  };
  let ctl;
  const dom = await createDom((window) => { ctl = installFakeSW(window, { controller: true, active: true, resolveReadyNow: true, policy }); });
  const { window } = dom; const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => /incomplete/.test(statusText(document)));
  check('partial failure is reported as incomplete (26/27)', /incomplete \(26\/27 books\)/.test(statusText(document)), statusText(document));
  check('an accessible Retry control is offered', !!document.querySelector('.berean-cache-retry'));
  document.querySelector('.berean-cache-retry').click();
  await waitFor(() => /available offline/.test(statusText(document)));
  check('retry completes the corpus (27/27)', /available offline/.test(statusText(document)));
  check('retry issued a second cache request', ctl.worker.posts.length === 2, `${ctl.worker.posts.length} requests`);
  window.close();
}

// ---------------------------------------------------------------------------
// 3. Completion is sticky: re-selecting does not re-request
// ---------------------------------------------------------------------------
{
  const policy = (msg) => ({ cached: msg.books.slice(), failed: [] });
  const dom = await createDom((window) => {
    window.__ctl = installFakeSW(window, { controller: true, active: true, resolveReadyNow: true, policy });
  });
  const { window } = dom; const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => /available offline/.test(statusText(document)));
  toggle(window, 'interlinear-berean', false);
  toggle(window, 'interlinear-berean', true);
  await sleep(400);
  check('re-selecting Berean after completion does not re-request', window.__ctl.worker.posts.length === 1, `${window.__ctl.worker.posts.length} requests`);
  window.close();
}

// ---------------------------------------------------------------------------
// 4. file:// makes no service-worker calls
// ---------------------------------------------------------------------------
{
  const dom = await createDom();
  const { window } = dom; const { document } = window;
  goto(window, 'JHN', 6);
  toggle(window, 'interlinear-berean', true);
  await waitFor(() => document.querySelectorAll('.interlinear-verse .iw-toggle').length > 0);
  check('file:// renders Berean without any service-worker call', document.querySelectorAll('.interlinear-verse .iw-toggle').length > 0);
  check('file:// leaves the cache status empty', statusText(document) === '', JSON.stringify(statusText(document)));
  window.close();
}

let failed = 0;
for (const [name, ok, detail] of results) {
  if (ok) console.log(`PASS  ${name}`);
  else { failed++; console.log(`FAIL  ${name}${detail ? ` (${detail})` : ''}`); }
}
console.log(`\n${results.length - failed}/${results.length} offline-cache checks passed.`);
process.exit(failed ? 1 : 0);
