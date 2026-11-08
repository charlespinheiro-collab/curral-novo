/* Curral Novo — guarda o app no aparelho para abrir sem internet */
const VERSAO = "curral-novo-v1";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest",
  "./vendor/jspdf.umd.min.js", "./vendor/jspdf.plugin.autotable.min.js", "./vendor/xlsx.full.min.js",
  "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (r.mode === "navigate") { /* página: tenta a versão nova, sem internet usa a guardada */
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSAO).then(x => x.put("./index.html", c)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.origin === location.origin || url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(VERSAO).then(x => x.put(r, c)); } return res; })));
  }
});
