import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import pushNotificationService from '@services/PushNotificationService';

// "Your devices": the browsers the logged-in account receives push on. Removing one
// unlinks only this account from it; other accounts on that browser keep receiving.
export default function usePushDevices(enabled) {
  const [devices, setDevices] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removingEndpoint, setRemovingEndpoint] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, subscription] = await Promise.all([
        pushNotificationService.getDevices(),
        pushNotificationService.getCurrentSubscription(),
      ]);
      setDevices(list);
      setCurrentEndpoint(subscription?.endpoint || null);
    } catch {
      message.error('Failed to load your devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  const removeDevice = useCallback(
    async (endpoint) => {
      setRemovingEndpoint(endpoint);
      try {
        await pushNotificationService.removeDevice(endpoint);
        setDevices((prev) => prev.filter((device) => device.endpoint !== endpoint));
        message.info('Notifications turned off on that device for your account');
        return endpoint === currentEndpoint;
      } catch (err) {
        message.error(err.message || 'Failed to remove device');
        return false;
      } finally {
        setRemovingEndpoint(null);
      }
    },
    [currentEndpoint]
  );

  return { devices, currentEndpoint, loading, removingEndpoint, refresh, removeDevice };
}
