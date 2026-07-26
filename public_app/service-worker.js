// Version bumped intentionally — this forces every browser to detect this as a NEW worker,
// triggering install/activate and wiping out any old cached files automatically.
const CACHE = 'slayers-v3';
const SHELL = ['/app/icon-192.png', '/app/icon-512.png'];
const NOTIF_CACHE = 'slayers-notifs';

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then(c => c.addAll(SHELL)),
    caches.open(NOTIF_CACHE)
  ]));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE && k !== NOTIF_CACHE) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

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

// ===== PERSISTENT NOTIFICATION QUEUE (Cache API) =====
const NOTIF_KEY = '/__notif_queue__';

function getNotifsFromCache() {
  return caches.open(NOTIF_CACHE).then(cache =>
    cache.match(NOTIF_KEY).then(resp => {
      if (!resp) return [];
      return resp.json().catch(() => []);
    })
  );
}

function addNotifToCache(payload) {
  return getNotifsFromCache().then(queue => {
    queue.push(payload);
    if (queue.length > 20) queue = queue.slice(-20);
    return caches.open(NOTIF_CACHE).then(cache =>
      cache.put(NOTIF_KEY, new Response(JSON.stringify(queue), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
  });
}

function clearNotifCache() {
  return caches.open(NOTIF_CACHE).then(cache => cache.delete(NOTIF_KEY));
}

// ===== PUSH EVENT =====
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
  const options = {
    body: data.body || 'A new setup just fired.',
    icon: appUrl + 'icon-192.png',
    badge: appUrl + 'icon-192.png',
    data: { url: data.url || appUrl, notifId: notifId, notifPayload: notifPayload }
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    addNotifToCache(notifPayload),
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'push-notification', notification: notifPayload }));
    })
  ]));
});

// ===== MESSAGE FROM APP =====
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'get-notifs') {
    e.waitUntil(
      getNotifsFromCache().then(queue => {
        queue.forEach(n => {
          try { e.source.postMessage({ type: 'push-notification', notification: n }); } catch(ex) {}
        });
        return clearNotifCache();
      })
    );
  }
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const nd = e.notification.data || {};
  const url = nd.url || self.location.origin + '/app/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/app/') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
