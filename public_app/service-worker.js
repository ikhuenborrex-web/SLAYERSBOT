// Version bumped intentionally — this forces every browser to detect this as a NEW worker,
// triggering install/activate and wiping out any old cached files automatically.
const CACHE = 'slayers-v2';
const SHELL = ['/app/icon-192.png', '/app/icon-512.png']; // only icons cached — everything else always fetched fresh

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() =>
      caches.open(CACHE).then(c => c.addAll(SHELL))
    )
  );
  self.clients.claim();
});

// Network-first for everything except icons. Never silently serve stale HTML/JS again.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.png')) {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push notification handling — unchanged
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
