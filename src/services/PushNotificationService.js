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

async function registerSubscription(subscription) {
  const subJson = subscription.toJSON();
  await post('/notifications/push/subscribe', {
    endpoint: subJson.endpoint,
    keys: subJson.keys,
  });
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
    const res = await get('/notifications/push/public-key');
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

    await registerSubscription(subscription);

    return subscription;
  },

  unsubscribeDevice: async () => {
    if (!pushNotificationService.isPushSupported()) return;

    try {
      const registration = await getServiceWorkerRegistration(3000);
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        try {
          await post('/notifications/push/unsubscribe', { endpoint: subscription.endpoint });
        } catch {
          // Continue unsubscription on client
        }
        await subscription.unsubscribe();
      }
    } catch {
      // Ignore errors during unsubscribe
    }
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

  silentAutoResubscribe: async () => {
    if (!pushNotificationService.isPushSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const existingSub = await pushNotificationService.getCurrentSubscription();
      if (existingSub) {
        return existingSub;
      }

      const publicKey = await pushNotificationService.getPublicKey();
      if (!publicKey) return null;

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const registration = await getServiceWorkerRegistration(5000);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await registerSubscription(subscription);

      return subscription;
    } catch {
      return null;
    }
  },

  ensureDeviceRegistered: async () => {
    if (!pushNotificationService.isPushSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const subscription = await pushNotificationService.getCurrentSubscription();
      if (!subscription) {
        return await pushNotificationService.silentAutoResubscribe();
      }

      const res = await get(`/notifications/push/status?endpoint=${encodeURIComponent(subscription.endpoint)}`);
      if (!res?.data?.subscribed) {
        await registerSubscription(subscription);
      }

      return subscription;
    } catch {
      return null;
    }
  },
};

export default pushNotificationService;
