import { get, post, put } from '@utils/Requests';

function urlBase64ToUint8Array(base64String) {
  const cleanString = (base64String || '').trim();
  const padding = '='.repeat((4 - (cleanString.length % 4)) % 4);
  const base64 = (cleanString + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getServiceWorkerRegistration(timeoutMs = 10000) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported in this browser.');
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    return registration;
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Service Worker could not be activated. Please reload the page and ensure push notifications are supported.'
          )
        ),
      timeoutMs
    )
  );

  return await Promise.race([navigator.serviceWorker.ready, timeoutPromise]);
}

// The service worker (public/sw-push.js) is a static file and can't read Vite env, but
// it needs the API origin and the current endpoint to report a rotated subscription
// (pushsubscriptionchange), where Chrome often provides no oldSubscription.
function sendConfigToServiceWorker(registration, endpoint) {
  try {
    registration?.active?.postMessage({
      type: 'PUSH_CONFIG',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      endpoint,
    });
  } catch {
    // Non-critical: only affects subscription-rotation recovery
  }
}

// Upserts this browser's subscription and links it to the logged-in account.
// Idempotent; called on login, app load and enable. Never removes other accounts'
// links, so a shared device keeps receiving for everyone who has logged in on it.
async function registerSubscription(subscription, registration) {
  const subJson = subscription.toJSON();
  await post('/notifications/push/subscribe', {
    endpoint: subJson.endpoint,
    keys: subJson.keys,
  });
  sendConfigToServiceWorker(registration, subJson.endpoint);
}

export const pushNotificationService = {
  isPushSupported: () => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  getPermissionState: () => {
    if (!pushNotificationService.isPushSupported()) return 'unsupported';
    return Notification.permission;
  },

  getPublicKey: async () => {
    const res = await get('/notifications/push/public/public-key');
    return res?.data?.publicKey;
  },

  getCurrentSubscription: async () => {
    if (!pushNotificationService.isPushSupported()) return null;
    try {
      const registration = await getServiceWorkerRegistration(3000);
      return await registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  },

  subscribeDevice: async () => {
    if (!pushNotificationService.isPushSupported()) {
      throw new Error('Push notifications are not supported in this browser/device.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error(
        permission === 'denied'
          ? 'Notification permission was denied. Please allow notifications in your browser settings.'
          : 'Notification permission was dismissed.'
      );
    }

    const publicKey = await pushNotificationService.getPublicKey();
    if (!publicKey) {
      throw new Error('Failed to retrieve push credentials from server.');
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    const registration = await getServiceWorkerRegistration(10000);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch (err) {
        if (err.message?.includes('push service error') || err.name === 'AbortError') {
          throw new Error(
            'Push service unreachable. If using Brave browser, enable "Use Google services for push messaging" in brave://settings/privacy. Also ensure your network is not blocking Google push services.'
          );
        }
        throw err;
      }
    }

    await registerSubscription(subscription, registration);

    return subscription;
  },

  // Turns notifications off for the logged-in account on this browser only. Must NOT
  // call subscription.unsubscribe(): the endpoint is shared by every account that has
  // logged in on this browser, and unsubscribing would cut them all off.
  disableForThisAccount: async () => {
    const subscription = await pushNotificationService.getCurrentSubscription();
    if (!subscription) return;
    await post('/notifications/push/unsubscribe-account', { endpoint: subscription.endpoint });
  },

  // "Your devices": every browser the logged-in account receives notifications on.
  getDevices: async () => {
    const res = await get('/notifications/push/devices');
    return res?.data || [];
  },

  // Removes the logged-in account's link to another (or this) device's endpoint.
  removeDevice: async (endpoint) => {
    await post('/notifications/push/unsubscribe-account', { endpoint });
  },

  checkDeviceSubscription: async () => {
    if (!pushNotificationService.isPushSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    const subscription = await pushNotificationService.getCurrentSubscription();
    if (!subscription) return false;

    try {
      const res = await get(`/notifications/push/status?endpoint=${encodeURIComponent(subscription.endpoint)}`);
      return !!res?.data?.subscribed;
    } catch {
      return true;
    }
  },

  getPushConfig: async () => {
    const res = await get('/notifications/push/config');
    return res?.data;
  },

  updatePushConfig: async (enabledTypes) => {
    const res = await put('/notifications/push/config', { enabledTypes });
    return res?.data;
  },

  sendTestNotification: async (payload = {}) => {
    const res = await post('/notifications/test', payload);
    return res?.data;
  },

  getPromptStatus: async () => {
    try {
      const res = await get('/notifications/push/prompt-status');
      return res?.data || { pushPromptDismissed: false, lastPushPromptDismissedAt: null };
    } catch {
      return { pushPromptDismissed: false, lastPushPromptDismissedAt: null };
    }
  },

  dismissPrompt: async ({ permanent = false } = {}) => {
    try {
      const res = await post('/notifications/push/prompt-dismiss', { permanent });
      return res?.data;
    } catch {
      return null;
    }
  },

  // Login + every app load while logged in, once permission is already granted (never
  // prompts). Reuses the browser's subscription, or creates one if there is none, and
  // always POSTs it so the server links this account and refreshes lastSeenAt.
  ensureDeviceRegistered: async () => {
    if (!pushNotificationService.isPushSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const registration = await getServiceWorkerRegistration(5000);
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey = await pushNotificationService.getPublicKey();
        if (!publicKey) return null;
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      await registerSubscription(subscription, registration);
      return subscription;
    } catch {
      return null;
    }
  },
};

export default pushNotificationService;
