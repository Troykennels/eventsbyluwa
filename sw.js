const CACHE = "ebl-v2-team";
const CORE = ["./","./index.html","./assets/styles.css","./assets/app.js","./brand/logo.png","./about.html","./services.html","./gallery.html","./blog.html","./contact.html","./404.html"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy).catch(()=>{})); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});