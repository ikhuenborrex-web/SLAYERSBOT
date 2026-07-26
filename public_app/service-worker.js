// Version bumped intentionally — this forces every browser to detect this as a NEW worker,
// triggering install/activate and wiping out any old cached files automatically.
const CACHE = 'slayers-v3';
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

// Store notifications in a queue so the app can pick them up later
let notifQueue = [];

// Push notification handling — save to app notification history
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: 'Slayers Bot', body: e.data ? e.data.text() : 'New signal' }; }
  const title = data.title || 'New Slayers Signal';
  const appUrl = self.location.origin + '/app/';
  const notifId = 'push_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  let nType = 'info', nIcon = '\uD83D\uDD14';
  if (title.toLowerCase().includes('weekly')) { nType = 'trophy'; nIcon = '\uD83C\uDFC6'; }
  else if (title.toLowerCase().includes('scalp')) { nType = 'scalp'; nIcon = '\u26A1'; }
  else if (title.toLowerCase().includes('tp') || title.toLowerCase().includes('profit') || title.toLowerCase().includes('hit')) { nType = 'trade'; nIcon = '\uD83D\uDCC8'; }
  const notifPayload = { id: notifId, type: nType, icon: nIcon, title: title, body: data.body || '', time: Date.now(), unread: true, url: data.url || '/app/' };
  // Keep a queue of recent notifications
  notifQueue.push(notifPayload);
  if (notifQueue.length > 20) notifQueue = notifQueue.slice(-20);
  const options = {
    body: data.body || 'A new setup just fired.',
    icon: appUrl + 'icon-192.png',
    badge: appUrl + 'icon-192.png',
    data: { url: data.url || appUrl, notifId: notifId, notifPayload: notifPayload }
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'push-notification', notification: notifPayload }));
    })
  ]));
});

// Listen for the app requesting queued notifications
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'get-notifs') {
    notifQueue.forEach(n => e.source.postMessage({ type: 'push-notification', notification: n }));
    notifQueue = [];
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const nd = e.notification.data || {};
  const url = nd.url || self.location.origin + '/app/';
  const notifPayload = nd.notifPayload || null;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/app/') && 'focus' in client) {
          if (notifPayload) client.postMessage({ type: 'push-notification', notification: notifPayload });
          return client.focus();
        }
      }
      return clients.openWindow(url).then(function(newClient) {
        if (newClient && notifPayload) {
          // Retry sending until client is ready
          var retries = 0;
          var iv = setInterval(function() {
            retries++;
            if (retries > 20) { clearInterval(iv); return; }
            try { newClient.postMessage({ type: 'push-notification', notification: notifPayload }); clearInterval(iv); } catch(e) {}
          }, 200);
        }
      });
    })
  );
});
