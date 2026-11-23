// Cap Budget : garde une copie de l'appli pour qu'elle marche sans réseau.
const CACHE = 'capbudget-v2';
const LOCAUX = ['./', './index.html', './manifest.json', './icone-192.png', './icone-512.png'];
const CHART = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAUX).then(() => c.add(CHART).catch(() => {}))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Pages : réseau d'abord (pour recevoir les mises à jour), copie si hors ligne.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Le reste : copie d'abord, réseau sinon.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
