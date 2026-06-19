const CACHE = 'slayers-v1';
const SHELL = ['/app/', '/app/index.html', '/app/manifest.json', '/app/icon-192.png', '/app/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for API calls (always want fresh signals), cache-first for the app shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

// Push notification handling — fires the moment the bot sends a push
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: 'Slayers Bot', body: e.data ? e.data.text() : 'New signal' }; }
  const title = data.title || 'New Slayers Signal';
  const options = {
    body: data.body || 'A new setup just fired.',
    icon: '/app/icon-192.png',
    badge: '/app/icon-192.png',
    data: { url: data.url || '/app/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/app/'));
});
