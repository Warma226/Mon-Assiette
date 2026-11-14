// Service worker : l'app s'ouvre même sans connexion.
const VERSION = 'ma-v3.8.1';
const CORE = [
  '/', '/index.html', '/css/app.css', '/manifest.webmanifest',
  '/js/app.js', '/js/views.js', '/js/art.js', '/js/content.js', '/js/engine.js', '/js/sfx.js', '/js/store.js', '/js/api.js', '/js/config.js', '/js/time.js', '/js/voice.js',
  '/assets/icons/alarm-clock.webp', '/assets/icons/baby-bottle.webp', '/assets/icons/banana.webp', '/assets/icons/bar-chart.webp', '/assets/icons/basket.webp', '/assets/icons/bell.webp', '/assets/icons/bento-box.webp', '/assets/icons/bowl-with-spoon.webp', '/assets/icons/bread.webp', '/assets/icons/bullseye.webp', '/assets/icons/chart-increasing.webp', '/assets/icons/clipboard.webp', '/assets/icons/cooked-rice.webp', '/assets/icons/counterclockwise-arrows-button.webp', '/assets/icons/credit-card.webp', '/assets/icons/crescent-moon.webp', '/assets/icons/cup-with-straw.webp', '/assets/icons/curry-rice.webp', '/assets/icons/droplet-empty.webp', '/assets/icons/droplet.webp', '/assets/icons/ear-of-corn.webp', '/assets/icons/egg.webp', '/assets/icons/fire.webp', '/assets/icons/fish.webp', '/assets/icons/flexed-biceps.webp', '/assets/icons/glass-of-milk.webp', '/assets/icons/green-salad.webp', '/assets/icons/herb.webp', '/assets/icons/leafy-green.webp', '/assets/icons/light-bulb.webp', '/assets/icons/mango.webp', '/assets/icons/mobile-phone-with-arrow.webp', '/assets/icons/mobile-phone.webp', '/assets/icons/money-bag.webp', '/assets/icons/muted-speaker.webp', '/assets/icons/older-person.webp', '/assets/icons/package.webp', '/assets/icons/party-popper.webp', '/assets/icons/peanuts.webp', '/assets/icons/person-running.webp', '/assets/icons/pot-of-food.webp', '/assets/icons/pregnant-woman.webp', '/assets/icons/red-heart.webp', '/assets/icons/roasted-sweet-potato.webp', '/assets/icons/salt.webp', '/assets/icons/seedling.webp', '/assets/icons/shallow-pan-of-food.webp', '/assets/icons/sheaf-of-rice.webp', '/assets/icons/shield.webp', '/assets/icons/shopping-cart.webp', '/assets/icons/shrimp.webp', '/assets/icons/sparkles.webp', '/assets/icons/speaker-high-volume.webp', '/assets/icons/speech-balloon.webp', '/assets/icons/spiral-calendar.webp', '/assets/icons/stethoscope.webp', '/assets/icons/sun.webp', '/assets/icons/tangerine.webp', '/assets/icons/thinking-face.webp', '/assets/icons/trophy.webp', '/assets/icons/warning.webp',
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
