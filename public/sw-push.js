self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Aethens Notification';
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/launchericon-192x192.png',
      badge: data.badge || '/favicon.ico',
      data: data.data || {},
      vibrate: [100, 50, 100],
      tag: data.data?.notificationId || 'aethens-notification',
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Aethens Notification', {
        body: text,
        icon: '/icons/launchericon-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url;
  let finalPath = '/notifications';
  if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
    finalPath = targetUrl;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.navigate(finalPath);
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(finalPath);
      }
    })
  );
});
