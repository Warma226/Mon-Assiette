// Service worker : l'app s'ouvre même sans connexion.
const VERSION = 'ma-v4.0.0';
const CORE = [
  '/', '/index.html', '/css/app.css', '/manifest.webmanifest',
  '/js/app.js', '/js/views.js', '/js/art.js', '/js/content.js', '/js/engine.js', '/js/sfx.js', '/js/store.js', '/js/api.js', '/js/config.js', '/js/time.js', '/js/voice.js', '/js/icons.js',
  '/assets/slide1.webp', '/assets/slide2.webp', '/assets/slide3.webp',
  '/assets/slide1.jpg', '/assets/slide2.jpg', '/assets/slide3.jpg',
  '/assets/pay/orange-money.png', '/assets/pay/moov-money.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/favicon-48.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Jamais de cache pour la base de données
  if (url.hostname.endsWith('supabase.co')) return;
  // Pages : réseau d'abord, sinon la version en cache
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('/index.html', copy)); return res; }).catch(() => caches.match('/index.html')));
    return;
  }
  // Fichiers : cache d'abord, mis à jour en arrière-plan (y compris les polices Google)
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('/');
  }));
});
