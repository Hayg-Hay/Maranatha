// Validate data/lxx-swete.json against the pinned raw First1KGreek snapshots.
// Prints pass/fail counts only; details are printed for each failure.
//
//   node build/validate-lxx-native.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { freshBookSegments, B_DIR } from './import-lxx-swete.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lxx-swete.json'), 'utf8'));

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data', 'canon.js'), 'utf8'), ctx);
const canonIds = new Set(ctx.window.MARANATHA_CANON.books.map((b) => b.id));
const componentIds = new Set(['LJE', 'SUS', 'BEL']);

const results = [];
const check = (name, fn) => {
  let detail = '';
  let ok = true;
  try {
    const out = fn();
    if (out && out.ok === false) { ok = false; detail = out.detail || ''; }
  } catch (error) {
    ok = false;
    detail = error.message;
  }
  results.push({ name, ok, detail });
};

const nonWs = (segments) => segments.reduce((n, s) => n + s.t.replace(/\s/gu, '').length, 0);

check('schema', () => {
  if (data.id !== 'lxx-swete' || data.scheme !== 'lxx-swete-native') return { ok: false, detail: 'id/scheme mismatch' };
  if (!Array.isArray(data.books) || !data.license || !Array.isArray(data.changes)) return { ok: false, detail: 'missing top-level fields' };
  return true;
});

check('book-ids', () => {
  const seen = new Set();
  for (const book of data.books) {
    if (seen.has(book.id)) return { ok: false, detail: `duplicate id ${book.id}` };
    seen.add(book.id);
    if (book.kind === 'book' && !canonIds.has(book.id)) return { ok: false, detail: `book id not in canon: ${book.id}` };
    if (book.kind === 'component' && !componentIds.has(book.id)) return { ok: false, detail: `unknown component id: ${book.id}` };
    if (!['book', 'component'].includes(book.kind)) return { ok: false, detail: `bad kind ${book.kind}` };
  }
  return true;
});

check('labels-match-source', () => {
  for (const book of data.books) {
    const fresh = freshBookSegments(book);
    if (fresh.length !== book.chapters.length) return { ok: false, detail: `${book.id}: chapter count ${book.chapters.length} vs source ${fresh.length}` };
    for (let i = 0; i < book.chapters.length; i++) {
      const a = book.chapters[i];
      const b = fresh[i];
      if (a.n !== b.n) return { ok: false, detail: `${book.id}: chapter label ${a.n} vs ${b.n}` };
      if (a.segments.length !== b.segments.length) return { ok: false, detail: `${book.id} ${a.n}: segment count ${a.segments.length} vs ${b.segments.length}` };
      for (let j = 0; j < a.segments.length; j++) {
        const x = a.segments[j];
        const y = b.segments[j];
        const xl = x.kind === 'verse' ? x.l : null;
        const yl = y.kind === 'verse' ? y.l : null;
        if (x.kind !== y.kind || xl !== yl) return { ok: false, detail: `${book.id} ${a.n}[${j}]: ${x.kind}:${xl} vs ${y.kind}:${yl}` };
      }
    }
  }
  return true;
});

check('character-counts', () => {
  for (const book of data.books) {
    const fresh = freshBookSegments(book);
    const freshCount = fresh.reduce((n, c) => n + nonWs(c.segments), 0);
    const shipped = book.chapters.reduce((n, c) => n + nonWs(c.segments), 0);
    if (freshCount !== shipped) return { ok: false, detail: `${book.id}: shipped ${shipped} vs source ${freshCount}` };
  }
  return true;
});

check('exclusions', () => {
  const required = ['1 Esdras', '3 Maccabees', '4 Maccabees', 'Odes (including Prayer of Manasseh)', 'Psalms of Solomon', 'Psalm 151'];
  for (const name of required) if (!data.excluded.some((e) => e.name === name)) return { ok: false, detail: `missing exclusion ${name}` };
  const forbidden = ['ESD', '1ES', '3MA', '4MA', 'PS151'];
  for (const book of data.books) if (forbidden.includes(book.id)) return { ok: false, detail: `excluded work shipped: ${book.id}` };
  const psa = data.books.find((b) => b.id === 'PSA');
  if (psa.chapters.some((c) => c.n === '151')) return { ok: false, detail: 'Psalm 151 present' };
  return true;
});

check('missing', () => {
  if (!data.missing.some((m) => m.id === 'ECC' && /not available/.test(m.reason))) return { ok: false, detail: 'ECC not recorded as missing' };
  return true;
});

check('flags', () => {
  for (const book of data.books) {
    for (const chapter of book.chapters) {
      const labels = new Set(chapter.segments.filter((s) => s.kind === 'verse').map((s) => s.l));
      for (const segment of chapter.segments) {
        if (!segment.flags) continue;
        if (segment.kind !== 'verse') return { ok: false, detail: `${book.id} ${chapter.n}: flag on non-verse segment` };
        if (!segment.l || !labels.has(segment.l)) return { ok: false, detail: `${book.id} ${chapter.n}: flag points at missing verse ${segment.l}` };
        for (const flag of segment.flags) if (!flag.code || !flag.note) return { ok: false, detail: `${book.id} ${chapter.n}:${segment.l}: malformed flag` };
      }
    }
  }
  return true;
});

check('source-hashes', () => {
  if (!data.source || data.source.repo !== 'OpenGreekAndLatin/First1KGreek') return { ok: false, detail: 'source repo mismatch' };
  for (const file of data.source.files) {
    const bytes = fs.readFileSync(path.join(B_DIR, file.path));
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (hash !== file.sha256) return { ok: false, detail: `hash mismatch: ${file.path}` };
  }
  return true;
});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
for (const result of failed) console.log(`FAIL ${result.name}: ${result.detail}`);
console.log(`validate-lxx-native: ${passed} pass / ${failed.length} fail`);
if (failed.length) process.exitCode = 1;
