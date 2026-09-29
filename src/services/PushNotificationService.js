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
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
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
    const registration = await navigator.serviceWorker.ready;

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

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      try {
        await post('/notifications/push/unsubscribe', { endpoint: subscription.endpoint });
      } catch {
        // Continue even if backend call fails to ensure client unsubscription
      }
      await subscription.unsubscribe();
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
