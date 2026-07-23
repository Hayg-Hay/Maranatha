// fetch-source.mjs
//
// Milestone 2 scaffolding: fetches a translation's raw source data and caches
// it under build/sources/, the same way build-canon.mjs's inputs were cached.
// Nothing in this repo should ever fetch data from the network at *runtime*
// (see PROJECT_HISTORY.md, Phase 1-2 — that's the whole reason YaQuB needed
// rebuilding) — network access only ever happens here, at build time, and the
// result gets committed.
//
// STATUS: the generic `fetchAndCache` helper below is real and works. The
// per-translation source list is NOT filled in yet — the actual World English
// Bible Catholic Edition text (with the Deuterocanon in Catholic order,
// including the Greek-based Esther/Daniel) could not be located as
// programmatically-fetchable structured data in the session that scaffolded
// this project. Leads that were tried and did NOT pan out, so the next
// attempt doesn't repeat them:
//   - ebible.org's own corpus files via the BibleNLP/ebible GitHub mirror:
//     the specific translation files needed (eng-eng_web_c.txt etc.) exist
//     as filenames in that repo but were empty placeholders on the `main`
//     branch at the time this was tried.
//   - bolls.life: has DRB (Douay-Rheims) and KJV-with-Apocrypha as full JSON
//     downloads, and documents a WEB Catholic-style edition, but no such
//     WEB+Deuterocanon variant was confirmed present, and its API otherwise
//     requires per-page fetches inconsistent with a clean single-file cache.
//   - Bible SuperSearch's "The Holy Bible" bundle (SourceForge) lists DRB and
//     CPDV (Catholic Public Domain Version) as built-in translations, but
//     SourceForge serves an HTML interstitial for downloads rather than the
//     raw file when fetched programmatically from this environment.
//
// Worth trying next: eBible.org's own site directly (not a mirror) for the
// WEBC zip/USFM download, or Catholic Public Domain Version (CPDV) as an
// alternative/fallback if WEB-C specifically remains unreachable — the
// project brief only requires that translations validate against canon.js
// and degrade gracefully when incomplete, so a substitute public-domain
// Catholic translation is a legitimate fallback if WEB-C stays unreachable.
//
// Usage once filled in:
//   node build/fetch-source.mjs <translation-id>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fetches a URL and writes the raw response body to build/sources/<name>.
 * Real, working helper — used by build-canon.mjs's data collection too.
 */
export async function fetchAndCache(url, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const body = await res.text();
  const outPath = path.join(dir, 'sources', name);
  fs.writeFileSync(outPath, body);
  console.log(`Cached ${url} -> build/sources/${name} (${body.length} bytes)`);
  return outPath;
}

// TODO(milestone 2): fill in per-translation source URLs/config here once a
// working source for each of WEB-C, Douay-Rheims, and KJV (with Apocrypha,
// for the deuterocanon chapters) is confirmed reachable. Each translation
// then needs its own normalize step (see normalize.mjs) to turn raw source
// data into the {id, label, source, books} shape validate.mjs expects.

const SOURCES = {
  // 'web-c': { url: '...', normalizer: 'normalize-web-c.mjs' },
  // 'douay-rheims': { url: '...', normalizer: 'normalize-drb.mjs' },
  // 'kjv': { url: '...', normalizer: 'normalize-kjv.mjs' },
};

const id = process.argv[2];
if (!id) {
  console.log('Usage: node build/fetch-source.mjs <translation-id>');
  console.log(`Configured: ${Object.keys(SOURCES).join(', ') || '(none yet — see TODO in this file)'}`);
  process.exit(1);
}
if (!SOURCES[id]) {
  console.error(`No source configured for "${id}" yet.`);
  process.exit(1);
}
