// service-worker.js
//
// Offline support for the GitHub Pages deployment of Maranatha.
//
// IMPORTANT CONTEXT — read before touching this file:
//
// This service worker only ever runs over http(s). It does NOT run when
// `index.html` is opened directly from disk (file://), which is the desktop
// workflow and must keep working with no server and no network. The
// registration snippet in index.html is gated on `location.protocol` for
// exactly that reason; do not remove that guard.
//
// The `fetch()` calls below are ordinary HTTPS network requests to GitHub
// Pages. They are unrelated to the project's absolute rule that `app.js` must
// never `fetch()` local data files under file:// (see PROJECT_HISTORY.md) — a
// service worker cannot run under file:// at all, so the two contexts never
// meet.
//
// Caching model:
//   - The application SHELL (small) is precached on install.
//   - The five large `data/*.js` translation files are deliberately NOT
//     precached. They are cached at runtime, cache-first, the first time the
//     app actually loads each one (on checkbox selection), so first install
//     stays small instead of downloading ~18 MB.
//
// Updating: bump CACHE_VERSION whenever shell files change, and
// DATA_CACHE_VERSION when the translation data files change. On activation the
// old caches are deleted. Keeping the two versions separate means a routine
// shell tweak does not force already-cached translations to re-download.
//
// A newly deployed worker deliberately does NOT call skipWaiting() on install
// — it waits. The page detects the waiting worker and shows an "update
// available" banner; clicking Reload posts { type: 'SKIP_WAITING' } (handled
// below), letting the new worker activate, after which the page reloads into
// the new shell. The update is therefore user-driven, not a silent replacement
// mid-read.

const CACHE_VERSION = 'v4';       // bump when shell files change
const DATA_CACHE_VERSION = 'v1';  // bump when translation data changes

const SHELL_CACHE = `maranatha-shell-${CACHE_VERSION}`;
const DATA_CACHE = `maranatha-data-${DATA_CACHE_VERSION}`;

// Application shell only. Paths are relative (no leading slash) so the app
// works under the GitHub Pages subpath /Maranatha/ as well as at a domain
// root. `data/canon.js` and `data/locales/en.js` are shell (always needed to
// boot); the translation files are not listed here on purpose.
const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data/canon.js',
  './data/locales/en.js',
  './data/locales/hy.js',
  './manifest.json',
  './Armenian-cross_2.png',
  './fonts/SILEOT.ttf',
  './fonts/Cardo-Regular.ttf',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

// True for the lazy-loaded translation files: data/<id>.js, but NOT the
// shell data files (canon.js, locales/en.js). The [^/]+ keeps the nested
// locales path out, and canon.js is excluded explicitly.
function isTranslationFile(pathname) {
  return /\/data\/[^/]+\.js$/.test(pathname) && !pathname.endsWith('/data/canon.js');
}

self.addEventListener('install', (event) => {
  // Precache the new shell, but do not activate yet — see the update note at
  // the top of this file. The page triggers activation via SKIP_WAITING.
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('maranatha-') && !keep.has(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only same-origin GET requests are handled. Everything else (cross-origin,
  // POST, etc.) is left to the browser untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isTranslationFile(url.pathname)) {
    event.respondWith(cacheFirst(request, DATA_CACHE, null));
    return;
  }

  // Shell: cache-first, and for a navigation miss while offline fall back to
  // the cached index.html so the app still boots.
  event.respondWith(cacheFirst(request, SHELL_CACHE, './index.html'));
});

async function cacheFirst(request, cacheName, navigationFallbackUrl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Only cache successful, same-origin ("basic") responses.
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (navigationFallbackUrl && request.mode === 'navigate') {
      const fallback = await cache.match(navigationFallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}
