// Daily dashboard service worker — network-first so updates reach installed apps.
// Cache is same-origin-only: Google APIs, Anthropic, Open-Meteo, allorigins all pass straight through.
const CACHE = 'daily-v1';
const ASSETS = ['./', 'index.html', 'icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  if (!sameOrigin) return;
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req).then(m => m || caches.match('index.html')))
  );
});
