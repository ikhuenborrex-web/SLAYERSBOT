const CACHE = 'slayers-v5';
const SHELL = ['/app/icon-192.png', '/app/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.png')) {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: 'Slayers Bot', body: e.data ? e.data.text() : 'New signal' }; }
  const title = data.title || 'New Slayers Signal';
  const appUrl = self.location.origin + '/app/';
  const options = {
    body: data.body || 'A new setup just fired.',
    icon: appUrl + 'icon-192.png',
    badge: appUrl + 'icon-192.png',
    data: { url: data.url || appUrl }
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'push-notification', notification: { id: 'push_'+Date.now(), type: 'info', icon: '\uD83D\uDD14', title: title, body: data.body||'', time: Date.now(), unread: true, url: data.url||'/app/' } }));
    })
  ]));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data && e.notification.data.url ? e.notification.data.url : self.location.origin + '/app/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/app/') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
