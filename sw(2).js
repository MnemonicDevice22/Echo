const APP = 'echo';
const VERSION = 1;
const CACHE = `${APP}-v${VERSION}`;
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-512.png', 'maskable-512.png', 'font.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f =>
        fetch(f, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(f); return c.put(f, r); })
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith(APP + '-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request, { cache: 'no-store' }))
  );
});
