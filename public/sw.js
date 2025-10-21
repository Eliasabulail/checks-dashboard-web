const CACHE_NAME = 'checks-dashboard-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Ignore requests that are not http/https
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then(networkResponse => {
          // Ensure valid and cacheable response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();

          // ✅ Prevent caching of non-HTTP(s) requests
          if (
            event.request.url.startsWith('http://') ||
            event.request.url.startsWith('https://')
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache).catch(err => {
                console.warn('Cache put failed:', err);
              });
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Fallback for offline navigation
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key))),
      ),
  );
  self.clients.claim();
});

// ---- 📅 Scheduled Notification Logic ----

// Listen for messages from your app
self.addEventListener('message', event => {
  const { action, data } = event.data || {};
  console.log('SW received message:', action, data);
  if (action === 'scheduleNotification') {
    scheduleNotification(data);
  }
});

// Function to schedule the notification
async function scheduleNotification({ id, title, body, dueDate, priority }) {
  const delay = new Date(dueDate).getTime() - Date.now();
  
  console.log("dueDate:", dueDate);
  console.log("Date.now()", Date.now());
  console.log("delay:", delay);
  console.log("delay <= 0:", delay <= 0);

  if (delay <= 0) {
    // If the date is in the past or now, show immediately
    return self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { id, priority },
    });
  }

  // If browser supports scheduled notifications
  if ('showTrigger' in Notification.prototype) {
      console.log("in if showTrigger");
    const timestamp = new Date(dueDate).getTime();
    await self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      showTrigger: new TimestampTrigger(timestamp),
      data: { id, priority },
    });
  } else {
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: { id, priority },
      });
    }, delay);
  }
}

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
