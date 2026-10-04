// Web push handlers, pulled into the Workbox service worker via importScripts
// (vite.config.js). One push subscription = one BROWSER; several accounts can be
// linked to it (shared/family devices), so every notification is labelled with the
// account(s) it is for.

const DEFAULT_TITLE = 'Aethens Notification';
const DEFAULT_URL = '/?notifications=open';
const DEFAULT_ICON = '/icons/launchericon-192x192.png';
const DEFAULT_BADGE = '/favicon.ico';

// The page posts { apiBaseUrl, endpoint } here (PUSH_CONFIG) because this static file
// can't read Vite env; pushsubscriptionchange needs both to report the new endpoint.
const CONFIG_CACHE = 'aethens-push-config';
const CONFIG_KEY = '/__push-config';

async function readConfig() {
  try {
    const cache = await caches.open(CONFIG_CACHE);
    const res = await cache.match(CONFIG_KEY);
    return res ? await res.json() : {};
  } catch {
    return {};
  }
}

async function writeConfig(config) {
  const cache = await caches.open(CONFIG_CACHE);
  const merged = { ...(await readConfig()), ...config };
  await cache.put(CONFIG_KEY, new Response(JSON.stringify(merged), { headers: { 'Content-Type': 'application/json' } }));
}

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'PUSH_CONFIG') return;
  const { apiBaseUrl, endpoint } = event.data;
  event.waitUntil(writeConfig({ apiBaseUrl, endpoint }));
});

function parsePayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
}

// Accepts the current payload ({ title, body, url, userId, userIds, accountName, tag })
// and the legacy one ({ title, body, data: { targetUrl, notificationId } }) still
// in flight during rollout.
function normalize(payload) {
  const legacy = payload.data || {};
  const userIds = payload.userIds?.length ? payload.userIds : payload.userId ? [payload.userId] : [];
  return {
    title: payload.title || DEFAULT_TITLE,
    body: payload.body || '',
    url: payload.url || legacy.targetUrl || legacy.url || DEFAULT_URL,
    tag: payload.tag || legacy.notificationId || 'aethens',
    userIds,
    accountName: payload.accountName || '',
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || DEFAULT_BADGE,
  };
}

self.addEventListener('push', (event) => {
  // Always show a notification (userVisibleOnly), even for an empty/unparseable push.
  const n = normalize(parsePayload(event));
  const title = n.accountName ? `${n.accountName}: ${n.title}` : n.title;
  // Per-account tag, so one account's notification never replaces another's.
  const tag = n.userIds.length ? `${n.tag}-${n.userIds.join('-')}` : n.tag;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: n.body,
      icon: n.icon,
      badge: n.badge,
      tag,
      renotify: true,
      vibrate: [100, 50, 100],
      data: { url: n.url, userId: n.userIds[0], userIds: n.userIds, accountName: n.accountName },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { url = DEFAULT_URL, userIds = [], accountName = '' } = event.notification.data || {};
  const target = new URL(url, self.location.origin);
  // The page checks forUser against the logged-in account and offers to switch
  // instead of showing another account's content (see ForUserGuard).
  if (userIds.length) {
    target.searchParams.set('forUser', userIds.join(','));
    if (accountName) target.searchParams.set('forAccount', accountName);
  }

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = clientList.find((client) => 'focus' in client && new URL(client.url).origin === self.location.origin);
      if (existing) {
        try {
          await existing.navigate(target.href);
        } catch {
          // navigate() rejects for clients this worker doesn't control; focusing is still useful
        }
        return existing.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target.href);
      }
      return undefined;
    })()
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// The browser rotated or expired the subscription. Re-subscribe and move every
// account's link from the old endpoint to the new one. The server authorizes this by
// possession of the old endpoint (there is no JWT in the service worker).
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const config = await readConfig();
      if (!config.apiBaseUrl) return;
      const apiBase = `${config.apiBaseUrl}/api/notifications/push/public`;

      const oldEndpoint = event.oldSubscription?.endpoint || config.endpoint;
      let newSubscription = event.newSubscription;

      if (!newSubscription) {
        let applicationServerKey = event.oldSubscription?.options?.applicationServerKey;
        if (!applicationServerKey) {
          const res = await fetch(`${apiBase}/public-key`);
          const publicKey = (await res.json())?.data?.publicKey;
          if (!publicKey) return;
          applicationServerKey = urlBase64ToUint8Array(publicKey);
        }
        newSubscription = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      }

      // Without the old endpoint the links can't be moved; the next app load while
      // logged in re-links the account that opens the app.
      if (!oldEndpoint) return;

      await fetch(`${apiBase}/subscription-changed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldEndpoint, newSubscription: newSubscription.toJSON() }),
      });
      await writeConfig({ endpoint: newSubscription.endpoint });
    })()
  );
});
