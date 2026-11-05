const CACHE = 'ebl-delivery-1';
const CORE = ['./', './index.html', './about.html', './services.html', './gallery.html',
  './blog.html', './contact.html', './offline.html', './assets/styles.css',
  './assets/contact.js', './assets/app.js', './brand/logo.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('ebl-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request, {ignoreSearch:true});
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match('./offline.html')) || Response.error();
      return Response.error();
    }
  })());
});
