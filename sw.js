const CACHE = "ebl-v1";
const CORE = ["/eventsbyluwa/","/eventsbyluwa/index.html","/eventsbyluwa/assets/styles.css","/eventsbyluwa/assets/app.js","/eventsbyluwa/brand/logo.png","/eventsbyluwa/about.html","/eventsbyluwa/services.html","/eventsbyluwa/gallery.html","/eventsbyluwa/blog.html","/eventsbyluwa/contact.html","/eventsbyluwa/404.html"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy).catch(()=>{})); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match("/eventsbyluwa/index.html")))
  );
});