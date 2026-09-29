import { get, post, put } from '@utils/Requests';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getServiceWorkerRegistration(timeoutMs = 6000) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported in this browser.');
  }

  let registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    return registration;
  }

  if (!registration) {
    try {
      registration = await navigator.serviceWorker.register('/sw.js');
    } catch {
      // Continue to race ready vs timeout
    }
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Service Worker could not be activated. Please refresh the page and ensure push notifications are supported.'
          )
        ),
      timeoutMs
    )
  );

  return await Promise.race([navigator.serviceWorker.ready, timeoutPromise]);
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
    const registration = await getServiceWorkerRegistration(8000);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const subJson = subscription.toJSON();
    await post('/notifications/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
    });

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
          // Continue even if backend call fails to ensure client unsubscription
        }
        await subscription.unsubscribe();
      }
    } catch {
      // Ignore error during unsubscribe
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
};

export default pushNotificationService;
