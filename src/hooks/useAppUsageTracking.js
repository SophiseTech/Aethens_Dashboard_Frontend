import { useEffect } from 'react';
import userStore from '@stores/UserStore';
import pwaInstallStore from '@stores/PwaInstallStore';

// Reports installed-app opens (PWA, iOS Home Screen, APK) for usage analytics
export default function useAppUsageTracking() {
  const { user } = userStore();
  const reportAppOpen = pwaInstallStore((state) => state.reportAppOpen);

  useEffect(() => {
    if (user?._id) reportAppOpen(user._id);
  }, [user?._id, reportAppOpen]);
}
